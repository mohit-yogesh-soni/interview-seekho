// Library Management
registerLesson("lld", "library", {
  why: "Library ek DB-design-heavy LLD hai: Book vs BookCopy, loans ki history, fines ke alag rules, aur limits (ek member max 3 books). Aapne what-is-lld aur db-basics mein iska design soch liya tha; yahan code mein utaarte hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>Catalog: book (isbn, title), har book ki kai <b>copies</b>.</li>
          <li>Member types: STUDENT (max 3 books, 14 din, ₹5/din fine), FACULTY (max 10, 30 din, ₹2/din, max ₹100 fine).</li>
          <li>Issue: available copy ho aur member limit ke andar ho aur koi unpaid fine na ho.</li>
          <li>Return: late ho to fine. Search by title.</li>
        </ul>
        <pre class="diagram">
Book (isbn, title) 1 ◆── * BookCopy (copyId, status: AVAILABLE/ISSUED)
Member (id, type: MemberType) ── uses ─► MembershipPolicy «i» (maxBooks, loanDays, fine(daysLate))
Loan (copy, member, issueDay, dueDay, returnDay?)       ← issue ka record
LibraryService (facade): issue(memberId, isbn, day), returnCopy(copyId, day), search(text)</pre>
        <p><b>Policy</b> ek strategy hai jo teen cheezein saath rakhti hai (limit, days, fine): member type badla to sab saath badla. Ye "if (type == STUDENT)" ko poore code mein bikharne se bachata hai.</p>`
    },
    {
      type: "exercise",
      id: "ex-library",
      title: "LibraryService: issue, return, fines, limits",
      level: "Medium",
      task: `<p>Diye types ke saath <code>LibraryService</code> likho (days integers hain):</p>
        <ul>
          <li><code>addBook(isbn, title, copies)</code>: copy ids <code>isbn + "-1"</code>, <code>"-2"</code>...</li>
          <li><code>addMember(id, MemberType)</code>.</li>
          <li><code>String issue(memberId, isbn, day)</code>: pehli AVAILABLE copy ki id. Errors (IllegalStateException message ke saath): <code>"NO_COPY"</code>, <code>"LIMIT"</code> (active loans = maxBooks), <code>"UNPAID_FINE"</code>.</li>
          <li><code>int returnCopy(copyId, day)</code>: fine = policy.fine(daysLate) jahan daysLate = max(0, day − dueDay). Fine member ke unpaid balance mein judta hai. Copy AVAILABLE.</li>
          <li><code>void payFine(memberId)</code>: balance 0. <code>int fineDue(memberId)</code>.</li>
          <li><code>List&lt;String&gt; search(String text)</code>: titles (case-insensitive contains), sorted, unique.</li>
        </ul>
        <p>Policies: STUDENT 3 books, 14 din, ₹5/din. FACULTY 10, 30 din, ₹2/din, max ₹100.</p>`,
      examples: "student day 0 pe issue → due 14; day 20 return → 6 din late → fine 30",
      userFile: "Solution.java",
      starter: `import java.util.*;

enum MemberType { STUDENT, FACULTY }

class LibraryService {
    void addBook(String isbn, String title, int copies) { }
    void addMember(String id, MemberType type) { }
    String issue(String memberId, String isbn, int day) { return null; }
    int returnCopy(String copyId, int day) { return 0; }
    void payFine(String memberId) { }
    int fineDue(String memberId) { return 0; }
    List<String> search(String text) { return List.of(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static LibraryService lib() {
        LibraryService l = new LibraryService();
        l.addBook("111", "Clean Code", 2);
        l.addBook("222", "Effective Java", 1);
        l.addBook("333", "Java Concurrency in Practice", 5);
        l.addMember("s1", MemberType.STUDENT);
        l.addMember("f1", MemberType.FACULTY);
        return l;
    }
    static String err(Runnable r) { try { r.run(); return "ok"; } catch (IllegalStateException e) { return e.getMessage(); } }

    public static void main(String[] args) {
        Check.eq("issue + late fine", List.of("111-1", 30), () -> { LibraryService l = lib(); String c = l.issue("s1", "111", 0); return List.of(c, l.returnCopy(c, 20)); });
        Check.eq("search", List.of("Effective Java", "Java Concurrency in Practice"), () -> lib().search("java"));
        Check.hiddenFromHere();
        Check.eq("no copy", "NO_COPY", () -> { LibraryService l = lib(); l.issue("s1", "222", 0); return err(() -> l.issue("f1", "222", 0)); });
        Check.eq("student limit 3", "LIMIT", () -> {
            LibraryService l = lib(); for (int i = 0; i < 3; i++) l.issue("s1", "333", 0); return err(() -> l.issue("s1", "333", 0));
        });
        Check.eq("unpaid fine blocks, pay unblocks", List.of("UNPAID_FINE", "ok"), () -> {
            LibraryService l = lib(); String c = l.issue("s1", "111", 0); l.returnCopy(c, 15);
            String a = err(() -> l.issue("s1", "111", 16)); l.payFine("s1"); return List.of(a, err(() -> l.issue("s1", "111", 16)));
        });
        Check.eq("on time = 0", 0, () -> { LibraryService l = lib(); String c = l.issue("s1", "111", 3); return l.returnCopy(c, 17); });
        Check.eq("faculty cap 100", 100, () -> { LibraryService l = lib(); String c = l.issue("f1", "111", 0); return l.returnCopy(c, 200); });
        Check.eq("return ke baad copy available", "111-1", () -> { LibraryService l = lib(); String c = l.issue("s1", "111", 0); l.returnCopy(c, 1); return l.issue("f1", "111", 2); });
        Check.eq("fine judta hai (3 + 4 din late x ₹2)", 14, () -> {
            LibraryService l = lib(); String a = l.issue("f1", "111", 0), b = l.issue("f1", "333", 0);
            l.returnCopy(a, 33); l.returnCopy(b, 34); return l.fineDue("f1");
        });
        Check.eq("search case + no match", List.of(List.of("Clean Code"), List.of()), () -> List.of(lib().search("CLEAN"), lib().search("python")));
    }
}`,
      hints: [
        "<code>record Policy(int maxBooks, int loanDays, int perDay, int cap)</code> aur <code>Map&lt;MemberType, Policy&gt;</code>. Cap ke liye faculty 100, student <code>Integer.MAX_VALUE</code>.",
        "Classes: Copy (id, isbn, available), Loan (copyId, memberId, due). Maps: books isbn → list of copies, titles isbn → title, loans copyId → Loan, member → type, member → fine, member → active count.",
        "issue: order mein checks: fine &gt; 0 → UNPAID_FINE, active == max → LIMIT, koi available copy nahi → NO_COPY."
      ],
      solution: `import java.util.*;

enum MemberType { STUDENT, FACULTY }

class LibraryService {
    record Policy(int maxBooks, int loanDays, int perDay, int cap) {
        int fine(int daysLate) { return (int) Math.min(cap, (long) daysLate * perDay); }
    }
    private static final Map<MemberType, Policy> POLICIES = Map.of(
        MemberType.STUDENT, new Policy(3, 14, 5, Integer.MAX_VALUE),
        MemberType.FACULTY, new Policy(10, 30, 2, 100));

    private static final class Copy { final String id; boolean available = true; Copy(String id) { this.id = id; } }
    private record Loan(String memberId, int dueDay) {}

    private final Map<String, String> titles = new HashMap<>();
    private final Map<String, List<Copy>> copiesByIsbn = new HashMap<>();
    private final Map<String, Copy> copies = new HashMap<>();
    private final Map<String, Loan> loans = new HashMap<>();             // copyId → active loan
    private final Map<String, MemberType> members = new HashMap<>();
    private final Map<String, Integer> fines = new HashMap<>();
    private final Map<String, Integer> activeCount = new HashMap<>();

    void addBook(String isbn, String title, int n) {
        titles.put(isbn, title);
        List<Copy> list = copiesByIsbn.computeIfAbsent(isbn, k -> new ArrayList<>());
        for (int i = 1; i <= n; i++) {
            Copy c = new Copy(isbn + "-" + (list.size() + 1));
            list.add(c);
            copies.put(c.id, c);
        }
    }

    void addMember(String id, MemberType type) { members.put(id, type); }

    String issue(String memberId, String isbn, int day) {
        Policy p = POLICIES.get(members.get(memberId));
        if (fines.getOrDefault(memberId, 0) > 0) throw new IllegalStateException("UNPAID_FINE");
        if (activeCount.getOrDefault(memberId, 0) >= p.maxBooks()) throw new IllegalStateException("LIMIT");
        for (Copy c : copiesByIsbn.getOrDefault(isbn, List.of())) {
            if (c.available) {
                c.available = false;
                loans.put(c.id, new Loan(memberId, day + p.loanDays()));
                activeCount.merge(memberId, 1, Integer::sum);
                return c.id;
            }
        }
        throw new IllegalStateException("NO_COPY");
    }

    int returnCopy(String copyId, int day) {
        Loan loan = loans.remove(copyId);
        if (loan == null) throw new IllegalArgumentException("not issued: " + copyId);
        copies.get(copyId).available = true;
        activeCount.merge(loan.memberId(), -1, Integer::sum);
        int fine = POLICIES.get(members.get(loan.memberId())).fine(Math.max(0, day - loan.dueDay()));
        fines.merge(loan.memberId(), fine, Integer::sum);
        return fine;
    }

    void payFine(String memberId) { fines.put(memberId, 0); }
    int fineDue(String memberId) { return fines.getOrDefault(memberId, 0); }

    List<String> search(String text) {
        String q = text.toLowerCase();
        TreeSet<String> out = new TreeSet<>();
        for (String t : titles.values()) if (t.toLowerCase().contains(q)) out.add(t);
        return new ArrayList<>(out);
    }
}`,
      explain: "<p>Member type ka saara behaviour (limit, days, fine) <code>Policy</code> mein: naya type (ALUMNI) = map mein ek entry. Book vs Copy alag, aur Loan sirf active loans ka map hai (history chahiye to DB loans table with returned_at). Search abhi O(books) scan; bade catalog mein inverted index / search engine (HLD).</p>"
    },
    {
      type: "think",
      id: "think-library-reserve",
      q: "Follow-up: <b>\"Agar saari copies issued hain to member reservation kar sake; copy lautte hi line ke pehle member ko 2 din ke liye hold mile, warna agle ko.\"</b> Design mein kya jodoge?",
      rubric: [
        { point: "Per-book <b>FIFO queue</b> of reservations", keys: ["queue", "fifo", "reservation", "waitlist", "line"], weight: 2 },
        { point: "Copy ka naya status <b>ON_HOLD</b> (member + expiry)", keys: ["on_hold", "hold", "reserved", "expiry", "status"], weight: 2 },
        { point: "Return pe <b>Observer/event</b>: queue ke pehle ko notify", keys: ["observer", "notify", "event", "notification"], weight: 1 },
        { point: "Hold expire → agla member (scheduled job / check on access)", keys: ["expire", "scheduler", "agla", "next member", "job"] }
      ],
      answer: "<p><code>Reservation(member, isbn, createdAt)</code> + per-isbn <code>Queue</code>. Copy status: AVAILABLE / ISSUED / <b>ON_HOLD(member, holdUntil)</b>. <code>returnCopy</code> pe: queue khaali nahi → copy ON_HOLD for pehla member + notification (Observer). <code>issue</code> sirf hold wale member ko allow. Expiry: scheduled job jo expired holds ko agle member pe shift kare. DB: <code>reservations(id, member_id, isbn, created_at, status)</code>.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Library mein interviewer sabse pehle dekhta hai ki aapne <b>Book aur BookCopy</b> alag kiye ya nahi. Phir rules (limits, fines) ko type-checks ki jagah policy objects mein rakho."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
