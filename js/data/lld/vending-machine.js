// Vending Machine
registerLesson("lld", "vending-machine", {
  why: "State pattern lesson mein ek item wali machine banayi thi. Interview version mein kai products, slots, coins/notes ka inventory aur change dena hota hai. Isme State + inventory + 'change de sakte hain ya nahi' ka edge case sab saath aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>Slots (A1, A2...) mein products (naam, price, quantity).</li>
          <li>User coins daalta hai (₹1, 2, 5, 10), product chunta hai.</li>
          <li>Paise kam → aur maango. Zyada → <b>change</b> do machine ke coins se. Change exact na de sake → sale cancel, paise wapas.</li>
          <li>Cancel → saare daale coins wapas. Admin: restock.</li>
        </ul>
        <pre class="diagram">
VendingMachine ◆── * Slot (code, product, qty)        Product (name, price)
VendingMachine ◆── CoinInventory (Map&lt;Coin, count&gt;)    enum Coin { ONE(1), TWO(2), FIVE(5), TEN(10) }
VendingMachine ── current: State (Idle / HasMoney)     ← State lesson wala pattern
ChangeMaker «i»: Optional&lt;Map&lt;Coin,Integer&gt;&gt; make(amount, inventory)   (Greedy ya DP)</pre>`
    },
    {
      type: "think",
      id: "think-vm-change",
      q: "Machine mein coins: ₹5 ×1, ₹2 ×3, ₹1 ×0. Change dena hai ₹6. Greedy (bada coin pehle) kya karega? Kya change de sakte hain? Is edge case ko design mein kaise handle karoge?",
      rubric: [
        { point: "Greedy: 5 lega, phir 1 chahiye jo nahi hai → <b>fail</b>", keys: ["5 lega", "5 + 1", "greedy fail", "1 nahi", "fail"], weight: 2 },
        { point: "Par <b>2+2+2 = 6</b> possible hai", keys: ["2+2+2", "2 + 2 + 2", "teen 2", "3 x 2", "three 2"], weight: 2 },
        { point: "Limited coins ke saath sahi answer ke liye <b>DP / backtracking</b>; ChangeMaker strategy", keys: ["dp", "dynamic", "backtrack", "strategy", "changemaker"], weight: 2 },
        { point: "Sale <b>commit se pehle</b> change check; na ho to refund", keys: ["pehle check", "before", "refund", "cancel", "commit"] }
      ],
      answer: "<p>Greedy ₹5 leke ₹1 dhoondhta hai, nahi milta, aur fail. Par ₹2×3 = ₹6 possible hai. Limited coin counts ke saath greedy hamesha sahi nahi (DSA Greedy lesson). Isliye change banane ko <code>ChangeMaker</code> strategy rakho: chhote amounts pe DP / backtracking jo inventory counts respect kare. Aur order: <b>pehle change plan bana lo</b>, tabhi product do aur coins ghatao; na bane to poora refund. Adha sale kabhi nahi.</p>"
    },
    {
      type: "exercise",
      id: "ex-vm-multi",
      title: "Multi-product vending machine with exact change",
      level: "Hard",
      task: `<p><code>VendingMachine</code>:</p>
        <ul>
          <li><code>addSlot(String code, String name, int price, int qty)</code>, <code>addCoins(int coin, int count)</code> (machine ka change stock; coins: 1, 2, 5, 10).</li>
          <li><code>insert(int coin)</code>: user ke coin, balance mein. Invalid coin → IAE.</li>
          <li><code>String select(String code)</code>:
            <ul>
              <li>unknown slot → <code>"INVALID"</code>; qty 0 → <code>"SOLD OUT"</code>; balance &lt; price → <code>"NEED &lt;baaki&gt;"</code> (balance waisa hi rahe)</li>
              <li>change = balance − price. Machine ke coins + user ke daale coins dono se change banao, <b>sabse kam coins</b> mein (limited counts). Na bane → sale nahi, user ke coins wapas, return <code>"NO CHANGE"</code>.</li>
              <li>Success: <code>"DISPENSED &lt;name&gt; CHANGE &lt;coins&gt;"</code> jahan coins bade se chhote, space-separated (change 0 → <code>CHANGE -</code>). qty−1, balance 0, user ke coins machine mein.</li>
            </ul></li>
          <li><code>String cancel()</code>: <code>"REFUND &lt;coins&gt;"</code> (daale hue coins bade se chhote) ya <code>"REFUND -"</code>.</li>
        </ul>`,
      examples: "machine coins: 5×1, 2×3. Slot A1 chips ₹4. User 10 daale → change 6 → <code>\"DISPENSED chips CHANGE 2 2 2\"</code> (greedy fail hota)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class VendingMachine {
    void addSlot(String code, String name, int price, int qty) { }
    void addCoins(int coin, int count) { }
    void insert(int coin) { }
    String select(String code) { return "INVALID"; }
    String cancel() { return "REFUND -"; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static VendingMachine vm() {
        VendingMachine m = new VendingMachine();
        m.addSlot("A1", "chips", 4, 2);
        m.addSlot("B1", "cola", 15, 1);
        m.addCoins(5, 1); m.addCoins(2, 3);
        return m;
    }

    public static void main(String[] args) {
        Check.eq("greedy fail case: 2 2 2", "DISPENSED chips CHANGE 2 2 2", () -> { VendingMachine m = vm(); m.insert(10); return m.select("A1"); });
        Check.eq("need more", List.of("NEED 5", "DISPENSED cola CHANGE -"), () -> {
            VendingMachine m = vm(); m.insert(10); String a = m.select("B1"); m.insert(5); return List.of(a, m.select("B1"));
        });
        Check.hiddenFromHere();
        Check.eq("cancel refund order", "REFUND 10 5 1", () -> { VendingMachine m = vm(); m.insert(1); m.insert(10); m.insert(5); return m.cancel(); });
        Check.eq("cancel empty", "REFUND -", () -> vm().cancel());
        Check.eq("invalid + sold out", List.of("INVALID", "DISPENSED cola CHANGE -", "SOLD OUT"), () -> {
            VendingMachine m = vm(); String a = m.select("Z9"); m.insert(10); m.insert(5); String b = m.select("B1"); m.insert(10); return List.of(a, b, m.select("B1"));
        });
        Check.eq("no change possible → refund user coins", List.of("NO CHANGE", "REFUND -"), () -> {
            VendingMachine m = new VendingMachine(); m.addSlot("A", "gum", 3, 5); m.insert(10);
            return List.of(m.select("A"), m.cancel());
        });
        Check.eq("user ke coins se change: insert 5,5 for 7 → 2 + 1? machine 2x1 only", "DISPENSED tea CHANGE 2 1", () -> {
            VendingMachine m = new VendingMachine(); m.addSlot("T", "tea", 7, 1); m.addCoins(2, 1); m.addCoins(1, 1);
            m.insert(5); m.insert(5); return m.select("T");
        });
        Check.eq("user ke coins machine mein gaye: agla change unse", "DISPENSED gum CHANGE 5", () -> {
            VendingMachine m = new VendingMachine(); m.addSlot("A", "gum", 5, 5);
            m.insert(5); m.insert(5); m.select("A");          // machine ab 5 x1 rakhta hai (ek user coin), change 5 diya
            m.insert(10); return m.select("A");                // change 5 chahiye: kya bacha? pehle wale 10 (5+5) mein se ek 5 gaya change mein
        });
        Check.eq("min coins: change 10 with 5x2 and 10x1 → 10", "DISPENSED x CHANGE 10", () -> {
            VendingMachine m = new VendingMachine(); m.addSlot("S", "x", 10, 1); m.addCoins(5, 2); m.addCoins(10, 1);
            m.insert(10); m.insert(10); return m.select("S");
        });
        Check.eq("invalid coin → IAE", "IAE", () -> { try { vm().insert(3); return "no"; } catch (IllegalArgumentException e) { return "IAE"; } });
    }
}`,
      hints: [
        "State: <code>TreeMap&lt;Integer,Integer&gt; machine</code> (coin → count), <code>List&lt;Integer&gt; inserted</code>, slots map (name, price, qty).",
        "select: pehle pool = machine + inserted (copy). <code>change(amount, pool)</code>: DP over amount (≤ ~100 typically) jo limited counts respect kare: har coin type k baar tak. Ya chhote amounts ke liye DFS bade coin pehle + memo.",
        "Success pe: inserted ko machine mein jodo, change ke coins machine se ghatao, qty−1, inserted clear. Fail (no change) pe: inserted clear karo (refund) aur 'NO CHANGE'."
      ],
      solution: `import java.util.*;

class VendingMachine {
    private static final Set<Integer> COINS = Set.of(1, 2, 5, 10);
    private static final class Slot { final String name; final int price; int qty; Slot(String n, int p, int q) { name = n; price = p; qty = q; } }

    private final Map<String, Slot> slots = new HashMap<>();
    private final TreeMap<Integer, Integer> machine = new TreeMap<>();
    private final List<Integer> inserted = new ArrayList<>();

    void addSlot(String code, String name, int price, int qty) { slots.put(code, new Slot(name, price, qty)); }
    void addCoins(int coin, int count) { check(coin); machine.merge(coin, count, Integer::sum); }
    void insert(int coin) { check(coin); inserted.add(coin); }

    private static void check(int coin) { if (!COINS.contains(coin)) throw new IllegalArgumentException("bad coin " + coin); }

    String select(String code) {
        Slot s = slots.get(code);
        if (s == null) return "INVALID";
        if (s.qty == 0) return "SOLD OUT";
        int balance = inserted.stream().mapToInt(Integer::intValue).sum();
        if (balance < s.price) return "NEED " + (s.price - balance);

        TreeMap<Integer, Integer> pool = new TreeMap<>(machine);
        for (int c : inserted) pool.merge(c, 1, Integer::sum);
        List<Integer> change = minCoins(balance - s.price, pool);
        if (change == null) { inserted.clear(); return "NO CHANGE"; }   // refund, kuch nahi badla

        machine.clear();
        machine.putAll(pool);                                          // user ke coins ab machine ke
        for (int c : change) machine.merge(c, -1, Integer::sum);
        inserted.clear();
        s.qty--;
        return "DISPENSED " + s.name + " CHANGE " + fmt(change);
    }

    String cancel() {
        List<Integer> back = new ArrayList<>(inserted);
        inserted.clear();
        return "REFUND " + fmt(back);
    }

    private static String fmt(List<Integer> coins) {
        if (coins.isEmpty()) return "-";
        List<Integer> c = new ArrayList<>(coins);
        c.sort(Comparator.reverseOrder());
        StringBuilder sb = new StringBuilder();
        for (int x : c) { if (sb.length() > 0) sb.append(' '); sb.append(x); }
        return sb.toString();
    }

    // Bounded coin change: sabse kam coins, counts limited. dp[a] = min coins for amount a.
    private static List<Integer> minCoins(int amount, TreeMap<Integer, Integer> pool) {
        int INF = Integer.MAX_VALUE / 2;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        List<List<Integer>> pick = new ArrayList<>();
        for (int i = 0; i <= amount; i++) pick.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : pool.entrySet()) {
            int coin = e.getKey();
            for (int k = 0; k < e.getValue(); k++) {                    // har physical coin ek 0/1 item
                for (int a = amount; a >= coin; a--) {
                    if (dp[a - coin] + 1 < dp[a]) {
                        dp[a] = dp[a - coin] + 1;
                        List<Integer> p = new ArrayList<>(pick.get(a - coin));
                        p.add(coin);
                        pick.set(a, p);
                    }
                }
            }
        }
        return dp[amount] >= INF ? null : pick.get(amount);
    }
}`,
      explain: "<p>Order important hai: <b>pehle change ka plan</b> (pool = machine + user coins), phir commit. Fail pe kuch nahi badla, bas refund. Change: limited coins ke saath 0/1 knapsack style DP (DSA module) jo sabse kam coins de; greedy ₹6 = 5 + ? pe fail ho jaata. Amount chhote hain (₹ sau tak), isliye O(amount × coins) theek. Is design mein State pattern bhi lag sakta hai (Idle/HasMoney/Maintenance), aur ChangeMaker ek strategy.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Vending machine mein interviewer aksar \"change nahi de sakte to?\" poochta hai. Pehle hi bol do: <i>\"Sale ko two-phase rakhunga: change plan → commit; fail pe refund.\"</i> Aur greedy ka counter-example (₹6 with 5,2,2,2) bata ke DP choose karo."
    }
  ],
  references: [
    { title: "Refactoring Guru: State", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/state", type: "article" },
    { title: "Coin Change (LeetCode 322)", by: "LeetCode", url: "https://leetcode.com/problems/coin-change/", type: "article" }
  ]
});
