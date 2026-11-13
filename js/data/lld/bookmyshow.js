// Movie Ticket Booking (BookMyShow)
registerLesson("lld", "bookmyshow", {
  why: "BookMyShow LLD ka asli test concurrency hai: do log ek hi seat ek saath book karein to kya? Iska jawab do levels pe: seat hold with expiry (UX) aur DB unique constraint (guarantee). Saath mein Show/Screen/Seat ka model aur DB design.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>City → cinemas → screens → seats (layout fixed). Movie ke shows (screen + start time).</li>
          <li>User show chunta hai, seats select karta hai → seats <b>hold</b> (jaise 5 minute) → payment → <b>confirm</b>. Payment fail / timeout → hold release.</li>
          <li>Ek seat ek show mein ek hi baar bike. Pricing seat type pe (REGULAR, PREMIUM) aur kabhi weekend.</li>
        </ul>
        <pre class="diagram">
Cinema 1 ◆── * Screen 1 ◆── * Seat (id, row, number, type)
Movie 1 ── * Show * ── 1 Screen          Show (startTime, pricing: PricingStrategy)
Show 1 ◆── * ShowSeat (seat, status: AVAILABLE / HELD(user, until) / BOOKED)
User 1 ── * Booking (show, seats, amount, status: PENDING / CONFIRMED / CANCELLED)</pre>
        <p><b>ShowSeat kyun?</b> Seat physical hai (screen ka hissa, har show mein same). Uski <i>availability</i> per show hai. Isliye "show × seat" ek alag entity: yahi double booking ka battlefield hai.</p>`
    },
    {
      type: "think",
      id: "think-bms-db",
      q: "DB tables likho, aur batao <b>double booking DB level pe kaise impossible</b> banaoge, aur 5-minute hold kaise model karoge?",
      rubric: [
        { point: "Tables: cinemas, screens, seats, movies, shows, bookings, <b>show_seats</b> (ya booking_seats)", keys: ["show_seats", "show_seat", "booking_seats", "shows", "bookings"], weight: 2 },
        { point: "<b>UNIQUE(show_id, seat_id)</b> (booked seats ke liye)", keys: ["unique", "show_id, seat_id", "(show_id, seat_id)"], weight: 2 },
        { point: "Hold: status + <b>held_until</b> timestamp (ya Redis key with TTL)", keys: ["held_until", "hold", "expiry", "ttl", "redis", "expires"], weight: 2 },
        { point: "Atomic hold: <code>UPDATE show_seats SET status='HELD' ... WHERE status='AVAILABLE' OR held_until &lt; now()</code>, affected rows check", keys: ["conditional update", "where status", "affected rows", "held_until <", "atomic"], weight: 2 }
      ],
      answer: `<pre class="code-static">screens(id, cinema_id FK)        seats(id, screen_id FK, row, num, type)
movies(id, title, duration)      shows(id, movie_id FK, screen_id FK, start_time)
show_seats(show_id FK, seat_id FK, status, held_by NULL, held_until NULL, booking_id NULL,
           PRIMARY KEY(show_id, seat_id))           -- har show ki har seat ek row
bookings(id, user_id, show_id, amount, status, created_at)

-- hold (atomic, saari seats ek transaction mein):
UPDATE show_seats SET status='HELD', held_by=:u, held_until=now()+interval '5 min'
WHERE show_id=:s AND seat_id IN (:seats)
  AND (status='AVAILABLE' OR (status='HELD' AND held_until &lt; now()));
-- affected rows != seats count → ROLLBACK ("kuch seats chali gayi")
-- confirm: status='BOOKED' WHERE held_by=:u AND held_until &gt; now()</pre>
        <p>PK (show_id, seat_id) se ek seat ki ek hi row; conditional update se do users mein se ek hi jeetega. Expired hold ko alag cleanup job ki zaroorat nahi: condition mein <code>held_until &lt; now()</code> se wo apne aap available maani jaati hai (lazy expiry). Bahut high traffic pe holds Redis (<code>SET key user NX EX 300</code>) mein, final booking DB mein.</p>`
    },
    {
      type: "exercise",
      id: "ex-bms",
      title: "Show seat booking: hold, expiry, confirm (thread-safe)",
      level: "Hard",
      task: `<p><code>ShowBooking(List&lt;String&gt; seatIds, long holdMillis)</code> ek show ke liye. Time hamesha parameter <code>now</code> se (fake clock).</p>
        <ul>
          <li><code>boolean hold(String user, List&lt;String&gt; seats, long now)</code>: <b>all-or-nothing</b>: saari seats available (ya expired hold) hon to sab user ke naam HELD till <code>now + holdMillis</code> aur true. Ek bhi nahi → kuch mat badlo, false. Unknown seat → IAE.</li>
          <li><code>boolean confirm(String user, long now)</code>: user ki saari <b>valid</b> (expire nahi hui) holds BOOKED. Koi valid hold nahi → false.</li>
          <li><code>void release(String user)</code>: user ki holds hata do (booked nahi).</li>
          <li><code>String status(String seat, long now)</code>: <code>"AVAILABLE"</code>, <code>"HELD:&lt;user&gt;"</code>, <code>"BOOKED:&lt;user&gt;"</code> (expired hold = AVAILABLE).</li>
          <li>Kai threads ek saath <code>hold</code> karein to ek seat do users ko nahi milni chahiye.</li>
        </ul>`,
      examples: "hold(riya, [A1,A2], 0) → true; hold(aman, [A2,A3], 10) → false (A2 abhi riya ke hold mein hai; all-or-nothing, isliye A3 bhi nahi mili); hold(aman, [A2], 400000) with hold 300000 → true (expire)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class ShowBooking {
    ShowBooking(List<String> seatIds, long holdMillis) { }
    boolean hold(String user, List<String> seats, long now) { return true; }
    boolean confirm(String user, long now) { return false; }
    void release(String user) { }
    String status(String seat, long now) { return "AVAILABLE"; }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static ShowBooking show() { return new ShowBooking(List.of("A1", "A2", "A3", "A4"), 300_000); }

    public static void main(String[] args) {
        Check.eq("all-or-nothing", List.of(true, false, "AVAILABLE"), () -> {
            ShowBooking s = show(); boolean a = s.hold("riya", List.of("A1", "A2"), 0);
            boolean b = s.hold("aman", List.of("A2", "A3"), 10);
            return List.of(a, b, s.status("A3", 10));
        });
        Check.eq("hold → confirm", List.of(true, "BOOKED:riya"), () -> {
            ShowBooking s = show(); s.hold("riya", List.of("A1"), 0); return List.of(s.confirm("riya", 1000), s.status("A1", 2000));
        });
        Check.hiddenFromHere();
        Check.eq("expired hold available + doosra le sake", List.of("AVAILABLE", true, "HELD:aman"), () -> {
            ShowBooking s = show(); s.hold("riya", List.of("A2"), 0);
            return List.of(s.status("A2", 300_001), s.hold("aman", List.of("A2"), 300_001), s.status("A2", 300_002));
        });
        Check.eq("expired hold confirm nahi", List.of(false, "AVAILABLE"), () -> {
            ShowBooking s = show(); s.hold("riya", List.of("A1"), 0); return List.of(s.confirm("riya", 400_000), s.status("A1", 400_000));
        });
        Check.eq("booked seat kabhi hold nahi", false, () -> {
            ShowBooking s = show(); s.hold("riya", List.of("A1"), 0); s.confirm("riya", 1); return s.hold("aman", List.of("A1"), 9_000_000);
        });
        Check.eq("release", List.of("AVAILABLE", true), () -> {
            ShowBooking s = show(); s.hold("riya", List.of("A4"), 0); s.release("riya"); return List.of(s.status("A4", 1), s.hold("aman", List.of("A4"), 1));
        });
        Check.eq("unknown seat → IAE", "IAE", () -> { try { show().hold("x", List.of("Z9"), 0); return "no"; } catch (IllegalArgumentException e) { return "IAE"; } });
        Check.eq("32 threads, overlapping holds: har seat max 1 owner, total seats held <= 4", true, () -> {
            for (int round = 0; round < 5; round++) {
                ShowBooking s = show();
                AtomicInteger seatsWon = new AtomicInteger();
                ExecutorService p = Executors.newFixedThreadPool(32);
                CountDownLatch go = new CountDownLatch(1);
                for (int t = 0; t < 32; t++) {
                    String user = "u" + t;
                    List<String> want = List.of("A" + (t % 4 + 1), "A" + ((t + 1) % 4 + 1));
                    p.submit(() -> { try { go.await(); } catch (InterruptedException e) { return; }
                        if (s.hold(user, want, 0)) seatsWon.addAndGet(2); });
                }
                go.countDown(); p.shutdown();
                try { p.awaitTermination(3, TimeUnit.SECONDS); } catch (InterruptedException e) { }
                if (seatsWon.get() > 4) return false;
                Set<String> owners = new HashSet<>();
                for (String seat : List.of("A1", "A2", "A3", "A4")) owners.add(s.status(seat, 0));
            }
            return true;
        });
    }
}`,
      hints: [
        "Per seat ek chhota object: <code>status</code>, <code>user</code>, <code>until</code>. <code>Map&lt;String, SeatState&gt;</code>. Expired check: <code>status == HELD &amp;&amp; until &lt;= now</code> → available maano.",
        "All-or-nothing ke liye do pass: pehle saari seats check, phir saari set. Dono passes ke beech koi aur na ghuse: method <code>synchronized</code> (ek show ka ek lock: simple aur sahi).",
        "confirm: user ki HELD seats jinka <code>until &gt; now</code> → BOOKED; count 0 → false. Expired wali seats ko AVAILABLE kar do."
      ],
      solution: `import java.util.*;

class ShowBooking {
    private enum Status { AVAILABLE, HELD, BOOKED }
    private static final class SeatState { Status status = Status.AVAILABLE; String user; long until; }

    private final Map<String, SeatState> seats = new HashMap<>();
    private final long holdMillis;

    ShowBooking(List<String> seatIds, long holdMillis) {
        for (String id : seatIds) seats.put(id, new SeatState());
        this.holdMillis = holdMillis;
    }

    private boolean free(SeatState s, long now) {
        return s.status == Status.AVAILABLE || (s.status == Status.HELD && s.until <= now);
    }

    synchronized boolean hold(String user, List<String> wanted, long now) {
        List<SeatState> list = new ArrayList<>();
        for (String id : wanted) {
            SeatState s = seats.get(id);
            if (s == null) throw new IllegalArgumentException("unknown seat " + id);
            if (!free(s, now)) return false;              // pass 1: check (kuch nahi badla)
            list.add(s);
        }
        for (SeatState s : list) {                         // pass 2: apply
            s.status = Status.HELD; s.user = user; s.until = now + holdMillis;
        }
        return true;
    }

    synchronized boolean confirm(String user, long now) {
        int booked = 0;
        for (SeatState s : seats.values()) {
            if (s.status == Status.HELD && user.equals(s.user)) {
                if (s.until > now) { s.status = Status.BOOKED; booked++; }
                else { s.status = Status.AVAILABLE; s.user = null; }
            }
        }
        return booked > 0;
    }

    synchronized void release(String user) {
        for (SeatState s : seats.values())
            if (s.status == Status.HELD && user.equals(s.user)) { s.status = Status.AVAILABLE; s.user = null; }
    }

    synchronized String status(String seat, long now) {
        SeatState s = seats.get(seat);
        if (free(s, now)) return "AVAILABLE";
        return s.status + ":" + s.user;
    }
}`,
      explain: "<p>Ek show ka ek lock (<code>synchronized</code>): simple, aur ek show pe contention chhota hota hai (alag shows alag objects). Two-pass hold = all-or-nothing, jaise DB transaction. Lazy expiry (<code>until &lt;= now</code> check) se cleanup thread ki zaroorat nahi. Kai servers pe yahi logic DB conditional update / Redis <code>SET NX EX</code> se aata hai (think block). Payment fail → <code>release</code>; payment success → <code>confirm</code> + bookings table mein row.</p>"
    },
    {
      type: "pick",
      id: "pick-bms",
      q: "BookMyShow design mein kaunse choices <b>sahi</b> hain?",
      options: [
        { text: "Seat availability per show (ShowSeat / show_seats), Seat physical layout alag", correct: true, why: "Availability show ki property hai, seat ki nahi." },
        { text: "Double booking rokne ke liye sirf Java <code>synchronized</code>, kai app servers ke saath", correct: false, why: "synchronized ek JVM tak. Kai servers ke liye DB constraint / conditional update / distributed lock." },
        { text: "Payment se pehle seats hold with expiry", correct: true, why: "User ke payment ke dauraan seat kisi aur ko na mile, aur abandon karne pe free ho." },
        { text: "Pricing: PricingStrategy (seat type, weekend, surge)", correct: true, why: "Rules badalte hain." },
        { text: "Booking confirm hone pe email/SMS Observer/event se", correct: true, why: "Booking service notifications se decoupled." }
      ]
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> BookMyShow mein entities 5 minute mein khatam karo aur baaki time <b>concurrency</b> pe: hold with TTL, all-or-nothing, DB unique/conditional update, payment timeout. Interviewer 90% yahi sunna chahta hai."
    }
  ],
  references: [
    { title: "Hello Interview: Ticketmaster (system design breakdown)", by: "Hello Interview", url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview", type: "course" },
    { title: "Designing Data-Intensive Applications, Ch. 7 (Transactions)", by: "Martin Kleppmann", url: "https://dataintensive.net/", type: "book" }
  ]
});
