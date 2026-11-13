// Splitwise
registerLesson("lld", "splitwise", {
  why: "Splitwise mein do cheezein test hoti hain: (1) split types ko Strategy se rakhna (aapne Strategy lesson mein banaya), (2) balances ka saaf model aur 'kam se kam transactions mein settle karo'. Saath mein groups aur DB design.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>Users, groups. Expense: kisne pay kiya, kitna, kin logon mein split, split type (EQUAL / EXACT / PERCENT).</li>
          <li>Balance: "A ko B se kitna lena hai". User ka net balance.</li>
          <li>Simplify debts: settle karne ke liye transactions kam se kam (approx).</li>
        </ul>
        <pre class="diagram">
User ── * Group (members)
Expense (paidBy, amount, splits: Map&lt;User, share&gt;, group?) ── created via ─► SplitStrategy «i»
BalanceSheet: Map&lt;user, net&gt;   (net &gt; 0 = lena hai, &lt; 0 = dena hai)
ExpenseService (facade): addExpense(...), balances(), settle()</pre>
        <h2>Balance ka simple model: net amount</h2>
        <p>Har expense ke baad: payer ka net += amount; har participant ka net −= uska share (payer khud bhi participant ho to uska share bhi minus). Saare nets ka jod hamesha <b>0</b> hota hai (paisa na banta, na gayab hota): ye ek achha invariant/test hai.</p>
        <h2>Simplify: kam transactions</h2>
        <p>Greedy: sabse bada creditor (sabse zyada lena) aur sabse bada debtor (sabse zyada dena) ko match karo, <code>min(credit, debt)</code> transfer, repeat. Isse max <b>n − 1</b> transactions lagte hain. (Exact minimum number nikalna NP-hard maana jaata hai; interview mein greedy + ye note kaafi hai.)</p>
        <p>DB: <code>users</code>, <code>groups</code>, <code>group_members(group_id, user_id)</code>, <code>expenses(id, group_id, paid_by, amount, split_type, created_at)</code>, <code>expense_shares(expense_id, user_id, share)</code>. Balances ko ya to query se nikaalo (<code>SUM</code>) ya ek <code>balances</code> table transaction mein update.</p>`
    },
    {
      type: "exercise",
      id: "ex-splitwise",
      title: "Expenses, net balances aur greedy settle",
      level: "Medium",
      task: `<p>Amounts <b>paise mein (long)</b> hain taaki rounding na ho.</p>
        <ul>
          <li><code>addEqual(String paidBy, long amount, List&lt;String&gt; users)</code>: equal split; jo paise bachein (amount % n) wo list ke <b>pehle users</b> pe 1-1 paisa extra.</li>
          <li><code>addExact(String paidBy, long amount, Map&lt;String, Long&gt; shares)</code>: jod amount na ho → IAE.</li>
          <li><code>long net(String user)</code>: positive = lena hai.</li>
          <li><code>List&lt;String&gt; settle()</code>: greedy: har baar sabse bada debtor sabse bade creditor ko <code>min</code> amount de. Format <code>"debtor-&gt;creditor:amount"</code>. Tie pe naam alphabetical pehle. Settle state nahi badalta.</li>
        </ul>`,
      examples: "A ne 300 diye A,B,C ke liye (equal) → net A +200, B −100, C −100 → settle <code>[\"B->A:100\", \"C->A:100\"]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Splitwise {
    void addEqual(String paidBy, long amount, List<String> users) { }
    void addExact(String paidBy, long amount, Map<String, Long> shares) { }
    long net(String user) { return 0; }
    List<String> settle() { return List.of(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("equal + settle", List.of(200L, -100L, List.of("B->A:100", "C->A:100")), () -> {
            Splitwise s = new Splitwise(); s.addEqual("A", 300, List.of("A", "B", "C"));
            return List.of(s.net("A"), s.net("B"), s.settle());
        });
        Check.eq("exact", List.of(-70L, 70L), () -> {
            Splitwise s = new Splitwise(); s.addExact("B", 100, Map.of("A", 70L, "B", 30L)); return List.of(s.net("A"), s.net("B"));
        });
        Check.hiddenFromHere();
        Check.eq("remainder paise pehle users pe: 100/3", List.of(66L, -33L, -33L), () -> {
            Splitwise s = new Splitwise(); s.addEqual("A", 100, List.of("A", "B", "C")); return List.of(s.net("A"), s.net("B"), s.net("C"));
        });
        Check.eq("exact galat jod → IAE", "IAE", () -> { try { new Splitwise().addExact("A", 100, Map.of("B", 50L)); return "no"; } catch (IllegalArgumentException e) { return "IAE"; } });
        Check.eq("chain simplify: A→B 100, B→C 100 → A->C", List.of("A->C:100"), () -> {
            Splitwise s = new Splitwise();
            s.addExact("B", 100, Map.of("A", 100L));      // A owes B
            s.addExact("C", 100, Map.of("B", 100L));      // B owes C
            return s.settle();
        });
        Check.eq("nets ka jod 0", 0L, () -> {
            Splitwise s = new Splitwise(); s.addEqual("A", 1001, List.of("A", "B", "C", "D")); s.addEqual("C", 77, List.of("B", "C")); s.addExact("D", 50, Map.of("A", 25L, "B", 25L));
            return s.net("A") + s.net("B") + s.net("C") + s.net("D");
        });
        Check.eq("multi creditor greedy", List.of("D->A:300", "C->B:100", "D->B:50"), () -> {
            Splitwise s = new Splitwise();
            s.addExact("A", 300, Map.of("D", 300L)); s.addExact("B", 150, Map.of("C", 100L, "D", 50L));
            return s.settle();
        });
        Check.eq("settle state nahi badalta", 200L, () -> { Splitwise s = new Splitwise(); s.addEqual("A", 300, List.of("A", "B", "C")); s.settle(); return s.net("A"); });
        Check.eq("sab barabar → []", List.of(), () -> { Splitwise s = new Splitwise(); s.addEqual("A", 100, List.of("A")); return s.settle(); });
    }
}`,
      hints: [
        "<code>Map&lt;String, Long&gt; net</code>. addEqual: <code>base = amount / n, extra = amount % n</code>; i &lt; extra ko base+1. payer += amount, har user −= share.",
        "settle: nets ki copy. Loop: creditors (net &gt; 0) aur debtors (net &lt; 0) mein se max chuno (tie: naam chhota). <code>pay = min(credit, -debt)</code>, record, dono update. Jab tak koi non-zero.",
        "Max dhoondhne ke liye har iteration mein simple loop theek hai (n chhota); ya do PriorityQueues with comparator (amount desc, name asc)."
      ],
      solution: `import java.util.*;

class Splitwise {
    private final Map<String, Long> net = new TreeMap<>();

    private void add(String u, long delta) { net.merge(u, delta, Long::sum); }

    void addEqual(String paidBy, long amount, List<String> users) {
        int n = users.size();
        long base = amount / n, extra = amount % n;
        add(paidBy, amount);
        for (int i = 0; i < n; i++) add(users.get(i), -(base + (i < extra ? 1 : 0)));
    }

    void addExact(String paidBy, long amount, Map<String, Long> shares) {
        long sum = 0;
        for (long v : shares.values()) sum += v;
        if (sum != amount) throw new IllegalArgumentException("shares != amount");
        add(paidBy, amount);
        shares.forEach((u, v) -> add(u, -v));
    }

    long net(String user) { return net.getOrDefault(user, 0L); }

    List<String> settle() {
        Map<String, Long> b = new TreeMap<>(net);           // copy: state nahi badlega
        List<String> out = new ArrayList<>();
        while (true) {
            String cred = null, debt = null;
            for (Map.Entry<String, Long> e : b.entrySet()) {   // TreeMap: tie pe naam alphabetical
                long v = e.getValue();
                if (v > 0 && (cred == null || v > b.get(cred))) cred = e.getKey();
                if (v < 0 && (debt == null || v < b.get(debt))) debt = e.getKey();
            }
            if (cred == null || debt == null) break;
            long pay = Math.min(b.get(cred), -b.get(debt));
            out.add(debt + "->" + cred + ":" + pay);
            b.put(cred, b.get(cred) - pay);
            b.put(debt, b.get(debt) + pay);
        }
        return out;
    }
}`,
      explain: "<p>Net balance model se \"kaun kisko\" ka N² map nahi rakhna padta. Paise <code>long</code> mein: rounding ka paisa explicit (pehle users pe). Greedy settle har step mein kam se kam ek person ko zero karta hai, isliye max n−1 transfers. Split types ko Strategy lesson wali classes se jodo: <code>ExpenseService.add(paidBy, amount, users, strategy)</code>.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Splitwise mein teen baatein zaroor bolo: <i>split types = Strategy, paise long/BigDecimal mein, aur nets ka jod 0 (invariant/test).</i> Simplify debts pe: \"greedy max n−1 transfers deta hai; exact minimum NP-hard hai\"."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Optimal Account Balancing (LeetCode 465)", by: "LeetCode", url: "https://leetcode.com/problems/optimal-account-balancing/", type: "article" }
  ]
});
