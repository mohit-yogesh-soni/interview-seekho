// Indexes, constraints, transactions
registerLesson("lld", "indexes-constraints", {
  why: "Double booking (ek seat do logon ko), negative balance, aur 'query 10 second leti hai': teeno LLD/DB rounds ke classic follow-ups hain. Inka jawab teen tools mein hai: constraints (DB khud galat data rokta hai), indexes (fast lookup), aur transactions (sab ya kuch nahi).",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Index: kitaab ke peeche wala index</h2>
        <p>Bina index, <code>WHERE email = ?</code> poori table scan karta hai: O(n). Index (aksar <b>B-tree</b>) sorted structure hai: lookup ~O(log n), aur range (<code>BETWEEN</code>, <code>ORDER BY</code>) bhi fast.</p>
        <ul>
          <li><b>Kab lagao:</b> columns jo <code>WHERE</code>, <code>JOIN</code>, <code>ORDER BY</code> mein baar baar aate hain. FK columns pe aksar zaroori (Postgres FK pe khud index nahi banata; MySQL InnoDB banata hai).</li>
          <li><b>Kimat:</b> har insert/update pe index bhi update (writes slow), aur disk space. Har column pe index mat lagao.</li>
          <li><b>Composite index</b> <code>(user_id, created_at)</code>: leftmost prefix rule — <code>WHERE user_id = ?</code> aur <code>WHERE user_id = ? ORDER BY created_at</code> dono ko fayda; sirf <code>WHERE created_at = ?</code> ko nahi.</li>
          <li><b>Low cardinality</b> (gender, boolean) pe akela index aksar bekaar.</li>
        </ul>
        <h2>Constraints: DB ko rules sikhao</h2>
        <table>
          <tr><th>Constraint</th><th>Kya rokta hai</th></tr>
          <tr><td><code>NOT NULL</code></td><td>Zaroori field khaali</td></tr>
          <tr><td><code>UNIQUE</code></td><td>Duplicate (email, ek show ki ek seat ki ek booking)</td></tr>
          <tr><td><code>CHECK (balance &gt;= 0)</code></td><td>Invalid value</td></tr>
          <tr><td><code>FOREIGN KEY</code></td><td>Orphan rows (order bina customer)</td></tr>
        </table>
        <p><b>Kyun app code ka check kaafi nahi:</b> do requests ek saath "seat free hai?" check karti hain, dono ko haan milta hai, dono book kar deti hain (race condition, Concurrency module wala check-then-act). DB ka UNIQUE constraint dono mein se ek ko <b>atomic</b> taur pe fail karega.</p>
        <pre class="code-static">CREATE TABLE seat_bookings (
  show_id    BIGINT NOT NULL,
  seat_id    BIGINT NOT NULL,
  booking_id BIGINT NOT NULL,
  UNIQUE (show_id, seat_id)                 -- double booking DB level pe impossible
);</pre>
        <h2>Transactions (ACID, simple)</h2>
        <ul>
          <li><b>Atomicity:</b> transfer mein debit + credit dono ya koi nahi.</li>
          <li><b>Consistency:</b> constraints transaction ke baad bhi sach.</li>
          <li><b>Isolation:</b> ek saath chalti transactions ek doosre ka adha kaam na dekhein (levels: Read Committed, Repeatable Read, Serializable).</li>
          <li><b>Durability:</b> commit ke baad crash pe bhi data bacha.</li>
        </ul>
        <p>Locking ke do style: <b>pessimistic</b> (<code>SELECT ... FOR UPDATE</code>: row lock, doosre wait) aur <b>optimistic</b> (<code>version</code> column: <code>UPDATE ... SET version = version + 1 WHERE id = ? AND version = ?</code>; 0 rows update hue = kisi aur ne badal diya, retry).</p>`
    },
    {
      type: "pick",
      id: "pick-index",
      q: "Query: <code>SELECT * FROM orders WHERE customer_id = ? AND status = 'PLACED' ORDER BY created_at DESC LIMIT 20</code>. Kaunsa index sabse kaam ka?",
      shuffle: false,
      options: [
        { text: "<code>(customer_id, status, created_at)</code>", correct: true, why: "Equality columns pehle, sort column last: index se seedha filter + sorted order, LIMIT jaldi ruk jaata hai." },
        { text: "<code>(created_at)</code> akela", correct: false, why: "Sort mein madad, par customer filter ke liye bahut rows padhni padengi." },
        { text: "<code>(status)</code> akela", correct: false, why: "Low cardinality: aadhe orders PLACED ho sakte hain." },
        { text: "Har column pe alag alag index", correct: false, why: "Writes slow, aur DB ek query mein aksar ek hi index achhe se use karta hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-unique-booking",
      title: "In-memory 'UNIQUE constraint': double booking rokna (threads ke saath)",
      level: "Medium",
      task: `<p>DB ka <code>UNIQUE(show_id, seat_id)</code> jaisa behaviour Java mein banao. <code>SeatBookings</code>:</p>
        <ul>
          <li><code>boolean book(long showId, String seat, String user)</code>: seat free ho to us user ki, <code>true</code>. Pehle se kisi ki ho to <code>false</code>. <b>Kai threads ek saath</b> same seat try karein to exactly ek jeete.</li>
          <li><code>boolean cancel(long showId, String seat, String user)</code>: sirf usi user ki booking cancel ho sake.</li>
          <li><code>String owner(long showId, String seat)</code> ya <code>null</code>.</li>
        </ul>
        <p>Hint: "check karo phir daalo" do steps hain (race). Ek atomic operation dhoondo.</p>`,
      examples: "<code>book(1, \"A1\", \"riya\")</code> → true, <code>book(1, \"A1\", \"aman\")</code> → false, <code>book(2, \"A1\", \"aman\")</code> → true (alag show)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class SeatBookings {
    private final Map<String, String> owners = new HashMap<>();

    boolean book(long showId, String seat, String user) {
        String key = showId + ":" + seat;
        if (owners.containsKey(key)) return false;     // check
        owners.put(key, user);                          // then act  ← race!
        return true;
    }

    boolean cancel(long showId, String seat, String user) { return false; }
    String owner(long showId, String seat) { return owners.get(showId + ":" + seat); }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        Check.eq("basic", List.of(true, false, true), () -> {
            SeatBookings s = new SeatBookings();
            return List.of(s.book(1, "A1", "riya"), s.book(1, "A1", "aman"), s.book(2, "A1", "aman"));
        });
        Check.eq("cancel sirf owner", List.of(false, true, "aman"), () -> {
            SeatBookings s = new SeatBookings();
            s.book(1, "B2", "riya");
            boolean wrong = s.cancel(1, "B2", "aman");
            boolean right = s.cancel(1, "B2", "riya");
            s.book(1, "B2", "aman");
            return List.of(wrong, right, s.owner(1, "B2"));
        });
        Check.hiddenFromHere();
        Check.eq("cancel na mili booking", false, () -> new SeatBookings().cancel(9, "Z9", "x"));
        Check.eq("50 threads x 200 same seats: har seat exactly 1 winner", true, () -> {
            for (int round = 0; round < 3; round++) {
                SeatBookings s = new SeatBookings();
                AtomicInteger wins = new AtomicInteger();
                ExecutorService p = Executors.newFixedThreadPool(50);
                CountDownLatch go = new CountDownLatch(1);
                for (int t = 0; t < 50; t++) {
                    String user = "u" + t;
                    p.submit(() -> {
                        try { go.await(); } catch (InterruptedException e) { return; }
                        for (int seat = 0; seat < 200; seat++) if (s.book(7, "S" + seat, user)) wins.incrementAndGet();
                    });
                }
                go.countDown();
                p.shutdown();
                try { p.awaitTermination(3, TimeUnit.SECONDS); } catch (InterruptedException e) { }
                if (wins.get() != 200) return false;
            }
            return true;
        });
        Check.eq("thread-safe map use hua (structure)", true, () -> {
            for (java.lang.reflect.Field f : SeatBookings.class.getDeclaredFields()) {
                if (java.util.concurrent.ConcurrentMap.class.isAssignableFrom(f.getType())) return true;
            }
            for (java.lang.reflect.Method m : SeatBookings.class.getDeclaredMethods()) {
                if (m.getName().equals("book") && java.lang.reflect.Modifier.isSynchronized(m.getModifiers())) return true;
            }
            return false;
        });
    }
}`,
      hints: [
        "<code>ConcurrentHashMap</code> ka <code>putIfAbsent(key, user)</code> atomic hai: null lautaye to aap jeete. Ye DB ke <code>INSERT ... UNIQUE</code> jaisa hai.",
        "cancel: <code>owners.remove(key, user)</code> (sirf tab hatata hai jab value user hi ho, atomic).",
        "Field ka type <code>ConcurrentHashMap&lt;String, String&gt;</code> ya <code>ConcurrentMap</code> rakho."
      ],
      solution: `import java.util.concurrent.ConcurrentHashMap;

class SeatBookings {
    private final ConcurrentHashMap<String, String> owners = new ConcurrentHashMap<>();

    private static String key(long showId, String seat) { return showId + ":" + seat; }

    boolean book(long showId, String seat, String user) {
        return owners.putIfAbsent(key(showId, seat), user) == null;   // atomic insert-if-unique
    }

    boolean cancel(long showId, String seat, String user) {
        return owners.remove(key(showId, seat), user);                 // atomic: sirf owner ka
    }

    String owner(long showId, String seat) {
        return owners.get(key(showId, seat));
    }
}`,
      explain: "<p>\"Check phir daalo\" ko ek atomic operation (<code>putIfAbsent</code>) mein badalna = DB mein <code>INSERT</code> + <code>UNIQUE</code> constraint jo duplicate pe error deta hai. App servers kai hon to in-memory map kaam nahi karega: tab yahi guarantee DB constraint (ya Redis <code>SET NX</code>) deta hai. BookMyShow lesson mein ye seat-hold ke saath aayega.</p>"
    },
    {
      type: "think",
      id: "think-transfer",
      q: "Wallet transfer: <code>A → B ₹500</code>. Do concurrent transfers A se (A ke paas ₹600) dono ₹500 ki. Negative balance kaise rokoge? SQL level pe batao.",
      rubric: [
        { point: "<b>Transaction</b> mein debit + credit dono", keys: ["transaction", "begin", "commit", "atomic"], weight: 2 },
        { point: "Conditional update: <code>UPDATE ... SET balance = balance - 500 WHERE id = A AND balance &gt;= 500</code>, affected rows check", keys: ["balance >= ", "where balance", "affected", "rows", "conditional update", "0 rows"], weight: 2 },
        { point: "Ya <b>SELECT FOR UPDATE</b> / optimistic version", keys: ["for update", "row lock", "pessimistic", "version", "optimistic"], weight: 2 },
        { point: "<b>CHECK (balance &gt;= 0)</b> constraint as safety net", keys: ["check", "constraint", "balance >= 0"] },
        { point: "Do accounts lock karte waqt <b>fixed order</b> (deadlock se bachne)", keys: ["order", "deadlock", "min id", "consistent"] }
      ],
      answer: `<pre class="code-static">BEGIN;
UPDATE wallets SET balance = balance - 500 WHERE id = :A AND balance &gt;= 500;   -- 0 rows = insufficient → ROLLBACK
UPDATE wallets SET balance = balance + 500 WHERE id = :B;
COMMIT;
-- safety net: CHECK (balance &gt;= 0)</pre>
        <p>Conditional update atomic hai: doosra transfer pehle wale ke commit ka wait karega (row lock) aur phir <code>balance &gt;= 500</code> false paa ke 0 rows update karega. Kai accounts lock karne hon to hamesha chhoti id pehle (deadlock avoidance, dining philosophers wali soch). Idempotency key bhi rakho taaki retry pe double transfer na ho.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Double booking kaise rokoge?\" ka best jawab layers mein: <i>DB UNIQUE constraint (final guarantee) + short-lived seat hold (Redis / status with expiry) for UX + transaction.</i> Sirf \"synchronized lagaunga\" kehna kai servers pe kaam nahi karta: ye zaroor bolo."
    }
  ],
  references: [
    { title: "Designing Data-Intensive Applications, Ch. 3 (Indexes) & Ch. 7 (Transactions)", by: "Martin Kleppmann", url: "https://dataintensive.net/", type: "book" },
    { title: "ConcurrentHashMap (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html", type: "docs" },
    { title: "Arpit Bhayani (YouTube): database internals", by: "Arpit Bhayani", url: "https://www.youtube.com/@AsliEngineering", type: "video" }
  ]
});
