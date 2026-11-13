// Strategy
registerLesson("lld", "strategy", {
  why: "LLD problems mein sabse zyada lagne wala pattern: pricing, payment method, split type (Splitwise), spot allocation (Parking), move validation. Jab bhi 'ek kaam, kai tareeke, aur tareeke badalte rehte hain' dikhe, Strategy hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: if-else jo har mahine badhta hai</h2>
        <pre class="code-static">double fare(String type, double km, int hour) {
    if (type.equals("AUTO")) return 25 + 12 * km;
    else if (type.equals("MINI")) return 40 + 14 * km;
    else if (type.equals("SEDAN")) {
        double f = 60 + 18 * km;
        if (hour &gt;= 18 &amp;&amp; hour &lt;= 21) f *= 1.5;        // peak
        return f;
    }
    else if (type.equals("BIKE")) ...                     // naya type = yahan edit, poora method dobara test
}</pre>
        <p>Aapne OOP lesson mein ye khud hal kiya tha (game weapons, discount). Formal naam: <b>Strategy</b> = ek algorithm family ko alag classes mein rakho, ek common interface ke peeche, aur <b>context</b> (jo use karta hai) runtime pe koi bhi strategy le sake.</p>
        <pre class="diagram">
 RideService (context) ──has-a──► FareStrategy «interface»: fare(km, hour)
                                    ▲          ▲           ▲
                               AutoFare    MiniFare    SedanFare (peak logic andar)</pre>
        <h3>Strategy ke 3 pehchaan signals</h3>
        <ol>
          <li>Ek hi kaam ke <b>kai interchangeable tareeke</b> (fare, sort, compress, split)</li>
          <li>Tareeka <b>runtime pe chuna</b> jaata hai (user choice, config, A/B test)</li>
          <li>Naye tareeke <b>aate rehte hain</b></li>
        </ol>
        <p>Java mein Strategy aapne pehle hi use kiya hai: <code>Collections.sort(list, comparator)</code>. <code>Comparator</code> ek strategy hai.</p>`
    },
    {
      type: "code",
      title: "Strategy + lambda: chhoti strategies ke liye class bhi nahi chahiye",
      code: `import java.util.*;

public class Main {
    interface FareStrategy { double fare(double km, int hour); }

    static class SedanFare implements FareStrategy {          // complex logic → apni class
        public double fare(double km, int hour) {
            double f = 60 + 18 * km;
            return (hour >= 18 && hour <= 21) ? f * 1.5 : f;
        }
    }

    static class RideService {
        private final Map<String, FareStrategy> strategies;
        RideService(Map<String, FareStrategy> s) { strategies = s; }
        double quote(String type, double km, int hour) {
            FareStrategy st = strategies.get(type);
            if (st == null) throw new IllegalArgumentException("No such ride: " + type);
            return st.fare(km, hour);
        }
    }

    public static void main(String[] args) {
        Map<String, FareStrategy> m = new HashMap<>();
        m.put("AUTO", (km, h) -> 25 + 12 * km);                 // simple → lambda
        m.put("MINI", (km, h) -> 40 + 14 * km);
        m.put("SEDAN", new SedanFare());
        RideService rides = new RideService(m);
        System.out.println("AUTO 5km  = " + rides.quote("AUTO", 5, 10));
        System.out.println("SEDAN 5km = " + rides.quote("SEDAN", 5, 10));
        System.out.println("SEDAN 5km peak = " + rides.quote("SEDAN", 5, 19));

        List<String> names = new ArrayList<>(List.of("riya", "Aman", "karan"));
        names.sort(String.CASE_INSENSITIVE_ORDER);                // Comparator bhi ek strategy
        System.out.println(names);
    }
}`
    },
    {
      type: "pick",
      id: "pick-strategy",
      q: "Kahan Strategy <b>natural fit</b> hai?",
      options: [
        { text: "Splitwise: expense ko EQUAL, EXACT, PERCENT mein baantna", correct: true, why: "Ek kaam (split), kai tareeke, naye aa sakte hain (shares)." },
        { text: "Parking lot: spot dhoondhne ka tareeka (nearest, cheapest, EV-first)", correct: true, why: "Allocation policy badalti hai." },
        { text: "Order ka status PLACED → SHIPPED → DELIVERED", correct: false, why: "Ye state badalna hai, jahan har state mein allowed actions alag. State pattern (agla-agla lesson)." },
        { text: "Image compression: JPEG, PNG, WebP", correct: true, why: "Interchangeable algorithms." },
        { text: "Ek hi fixed tax rate 18% jo kabhi nahi badalta", correct: false, why: "Ek hi tareeka. Constant kaafi hai (YAGNI)." }
      ]
    },
    {
      type: "exercise",
      id: "ex-split-strategy",
      title: "Splitwise splits (Strategy)",
      level: "Medium",
      task: `<p><code>SplitStrategy</code> interface: <code>Map&lt;String, Double&gt; split(double amount, List&lt;String&gt; users, List&lt;Double&gt; values)</code> (har user kitna dega).</p>
        <ul>
          <li><code>EqualSplit</code>: barabar; values ignore. Rounding: har share 2 decimal tak (<code>Math.round(x * 100) / 100.0</code>), aur jo paisa bachta/zyada ho wo <b>pehle user</b> pe adjust ho taaki total exactly amount ho.</li>
          <li><code>ExactSplit</code>: values hi shares hain. Unka jod amount ke barabar na ho (1e-6 tolerance) → <code>IllegalArgumentException</code>.</li>
          <li><code>PercentSplit</code>: values percentages; jod 100 na ho → IAE. Share = amount × p / 100.</li>
        </ul>
        <p>Result map mein users ka order same rehna chahiye (<code>LinkedHashMap</code>). Users aur values ki size alag (Exact/Percent mein) → IAE.</p>`,
      examples: "<code>EqualSplit.split(100, [A,B,C], [])</code> → <code>{A=33.34, B=33.33, C=33.33}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface SplitStrategy {
    Map<String, Double> split(double amount, List<String> users, List<Double> values);
}

class EqualSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) { return Map.of(); }
}

class ExactSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) { return Map.of(); }
}

class PercentSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) { return Map.of(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static String iae(Runnable r) { try { r.run(); return "no exception"; } catch (IllegalArgumentException e) { return "IAE"; } }
    static List<Object> flat(Map<String, Double> m) { List<Object> o = new ArrayList<>(); m.forEach((k, v) -> { o.add(k); o.add(v); }); return o; }

    public static void main(String[] args) {
        Check.eq("equal 100 / 3", List.of("A", 33.34, "B", 33.33, "C", 33.33), () -> flat(new EqualSplit().split(100, List.of("A", "B", "C"), List.of())));
        Check.eq("percent 50/30/20 of 1000", List.of("A", 500.0, "B", 300.0, "C", 200.0), () -> flat(new PercentSplit().split(1000, List.of("A", "B", "C"), List.of(50.0, 30.0, 20.0))));
        Check.hiddenFromHere();
        Check.eq("exact", List.of("X", 70.0, "Y", 30.0), () -> flat(new ExactSplit().split(100, List.of("X", "Y"), List.of(70.0, 30.0))));
        Check.eq("exact jod galat → IAE", "IAE", () -> iae(() -> new ExactSplit().split(100, List.of("X", "Y"), List.of(70.0, 20.0))));
        Check.eq("percent jod galat → IAE", "IAE", () -> iae(() -> new PercentSplit().split(100, List.of("X", "Y"), List.of(60.0, 30.0))));
        Check.eq("size mismatch → IAE", "IAE", () -> iae(() -> new ExactSplit().split(100, List.of("X", "Y"), List.of(100.0))));
        Check.eq("equal 10 / 3 total exact", 10.0, () -> new EqualSplit().split(10, List.of("A", "B", "C"), List.of()).values().stream().mapToDouble(Double::doubleValue).sum());
        Check.eq("equal 200 / 3: pehla adjust", List.of("P", 66.66, "Q", 66.67, "R", 66.67), () -> flat(new EqualSplit().split(200, List.of("P", "Q", "R"), List.of())));
        Check.eq("equal single user", List.of("Solo", 99.99), () -> flat(new EqualSplit().split(99.99, List.of("Solo"), List.of())));
    }
}`,
      hints: [
        "Equal: <code>double share = Math.round(amount / n * 100) / 100.0;</code> sabko share do, phir <code>diff = amount - share * n</code> pehle user mein jodo (aur phir se 2 decimal round).",
        "Exact/Percent: pehle size check, phir sum check: <code>Math.abs(sum - amount) &gt; 1e-6</code> → throw.",
        "Result: <code>new LinkedHashMap&lt;&gt;()</code> mein users ke order mein put."
      ],
      solution: `import java.util.*;

interface SplitStrategy {
    Map<String, Double> split(double amount, List<String> users, List<Double> values);
}

final class Money {
    static double r2(double x) { return Math.round(x * 100) / 100.0; }
}

class EqualSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) {
        int n = users.size();
        double share = Money.r2(amount / n);
        Map<String, Double> out = new LinkedHashMap<>();
        for (String u : users) out.put(u, share);
        double diff = Money.r2(amount - share * n);       // bacha hua paisa
        out.put(users.get(0), Money.r2(share + diff));
        return out;
    }
}

class ExactSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) {
        if (users.size() != values.size()) throw new IllegalArgumentException("users/values size alag");
        double sum = 0;
        for (double v : values) sum += v;
        if (Math.abs(sum - amount) > 1e-6) throw new IllegalArgumentException("exact shares ka jod amount nahi");
        Map<String, Double> out = new LinkedHashMap<>();
        for (int i = 0; i < users.size(); i++) out.put(users.get(i), values.get(i));
        return out;
    }
}

class PercentSplit implements SplitStrategy {
    public Map<String, Double> split(double amount, List<String> users, List<Double> values) {
        if (users.size() != values.size()) throw new IllegalArgumentException("users/values size alag");
        double sum = 0;
        for (double v : values) sum += v;
        if (Math.abs(sum - 100) > 1e-6) throw new IllegalArgumentException("percent ka jod 100 nahi");
        Map<String, Double> out = new LinkedHashMap<>();
        for (int i = 0; i < users.size(); i++) out.put(users.get(i), Money.r2(amount * values.get(i) / 100));
        return out;
    }
}`,
      explain: "<p>Har split ki validation aur hisaab apni class mein. ExpenseService bas <code>strategy.split(...)</code> bolta hai. Naya \"SHARES\" type (2:1:1) = ek nayi class. Rounding ka rule (bacha paisa pehle user pe) real Splitwise jaise apps mein bhi zaroori hai, warna total 99.99 ho jaata hai. Production mein paise <code>long</code> paise ya BigDecimal mein rakho (Java module).</p>"
    },
    {
      type: "think",
      id: "think-strategy-transfer",
      q: "Transfer: <b>\"Food app mein delivery partner assign karna hai: abhi 'nearest partner', par ops team 'highest rating', 'least orders today' aur festival pe 'mix' try karna chahti hai bina deploy ke.\"</b> Design batao.",
      rubric: [
        { point: "<b>AssignmentStrategy</b> interface: assign(order, partners)", keys: ["assignmentstrategy", "assignment strategy", "strategy", "interface", "assign("], weight: 2 },
        { point: "Implementations: Nearest, HighestRating, LeastOrders", keys: ["nearest", "rating", "least", "implementation"], weight: 1 },
        { point: "<b>Config se runtime pe</b> chunna (map / registry / feature flag)", keys: ["config", "runtime", "flag", "registry", "map", "bina deploy"], weight: 2 },
        { point: "'Mix' = <b>weighted / composite</b> strategy jo doosri strategies ke scores jode", keys: ["weighted", "composite", "mix", "score", "combine"], weight: 2 }
      ],
      answer: `<pre class="code-static">interface AssignmentStrategy { Partner pick(Order o, List&lt;Partner&gt; candidates); }
class Nearest ... class HighestRating ... class LeastOrdersToday ...
class Weighted implements AssignmentStrategy {        // "mix"
    Map&lt;Scorer, Double&gt; weights;  // distance 0.5, rating 0.3, load 0.2
    pick → har partner ka weighted score, max wala
}
AssignmentStrategy s = registry.get(config.get("assignment.strategy"));   // bina deploy badlo</pre>
        <p>Strategy + config = ops team A/B test kar sakti hai. "Mix" ke liye strategies ko scorer bana ke weighted combination: ye Strategy aur Composite ka mel hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Strategy ka naam lene se pehle problem bolo: <i>\"Fare calculation ke tareeke badlenge, isliye main ise interface ke peeche rakhunga aur RideService ko inject karunga.\"</i> Chhote strategies ke liye lambdas bhi bolo — modern Java dikhta hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Strategy", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/strategy", type: "article" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
