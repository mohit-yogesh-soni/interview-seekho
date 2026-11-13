// Java 8 se 21 tak naye features
registerLesson("java", "java-versions", {
  why: "\"Java 8 ke baad kya naya aaya?\" aur \"aapka project kis version pe hai, 17/21 pe kyun jaana chahiye?\" senior interviews ke standard sawaal hain. Har LTS version ke 3-4 bade features aur unka purpose bol sako, to interviewer ko dikhta hai ki aap modern Java likhte ho.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Release cadence aur LTS</h2>
              <ul>
                <li>Java 9 (2017) tak bade releases kai saal mein aate the. <b>Java 10 (March 2018) se har 6 mahine</b> ek naya version aata hai: March aur September.</li>
                <li>Har version ko lambe time tak support nahi milta. Companies production mein <b>LTS (Long-Term Support)</b> versions use karti hain, jinko saalon tak security updates milte hain.</li>
                <li>Oracle ke support roadmap ke hisaab se LTS versions: <b>8, 11, 17, 21, 25</b>. Ab har 2 saal mein ek LTS ka plan hai (agla planned: Java 29, September 2027).</li>
                <li><b>Preview feature:</b> naya feature jo poora ho chuka hai par final nahi; <code>--enable-preview</code> flag ke bina compile nahi hota aur agle version mein badal sakta hai. Interview mein \"ye feature kab final hua\" yahi farak hai.</li>
                <li><b>JEP</b> (JDK Enhancement Proposal): har bade feature ka ek numbered proposal openjdk.org pe hota hai. Number yaad rakhna zaroori nahi, par \"JEP\" shabd pata hona chahiye.</li>
              </ul>
              <table>
                <tr><th>LTS</th><th>Release</th><th>Ek line mein</th></tr>
                <tr><td>Java 8</td><td>March 2014</td><td>Functional Java: lambdas, streams, Optional, java.time</td></tr>
                <tr><td>Java 11</td><td>September 2018</td><td>Modules (9) + var (10) ke baad pehla LTS; HTTP Client, String methods</td></tr>
                <tr><td>Java 17</td><td>September 2021</td><td>Records, sealed classes, switch expressions, text blocks: \"data-oriented\" Java</td></tr>
                <tr><td>Java 21</td><td>September 2023</td><td>Virtual threads, pattern matching for switch, record patterns, sequenced collections</td></tr>
                <tr><td>Java 25</td><td>September 2025</td><td>Sabse naya LTS</td></tr>
              </table>
              <p>Note: is website ka code runner <b>Java 17</b> hai. Isliye Java 21 ke examples neeche sirf padhne ke liye (static) diye hain.</p>`
    },
    {
      type: "text",
      html: `
              <h2>Feature table (JEP numbers openjdk.org se)</h2>
              <table>
                <tr><th>Version</th><th>Feature</th><th>JEP</th></tr>
                <tr><td rowspan="4">8</td><td>Lambda expressions + default methods</td><td>126</td></tr>
                <tr><td>Streams (bulk data operations for collections)</td><td>107</td></tr>
                <tr><td>Date &amp; Time API (<code>java.time</code>)</td><td>150</td></tr>
                <tr><td>PermGen hataya (Metaspace aaya)</td><td>122</td></tr>
                <tr><td rowspan="3">9</td><td><code>List.of</code>, <code>Set.of</code>, <code>Map.of</code></td><td>269</td></tr>
                <tr><td>jshell (REPL)</td><td>222</td></tr>
                <tr><td>Private interface methods (Project Coin milling)</td><td>213</td></tr>
                <tr><td>10</td><td><code>var</code> (local-variable type inference)</td><td>286</td></tr>
                <tr><td rowspan="4">11</td><td><code>var</code> in lambda parameters</td><td>323</td></tr>
                <tr><td>HTTP Client (<code>java.net.http</code>)</td><td>321</td></tr>
                <tr><td>Single-file program seedha chalao: <code>java Hello.java</code></td><td>330</td></tr>
                <tr><td>Java EE aur CORBA modules hataye</td><td>320</td></tr>
                <tr><td rowspan="2">14</td><td>Switch expressions (final; preview 12, 13 mein)</td><td>361</td></tr>
                <tr><td>Helpful NullPointerExceptions</td><td>358</td></tr>
                <tr><td>15</td><td>Text blocks (final)</td><td>378</td></tr>
                <tr><td rowspan="2">16</td><td>Records (final; preview 14, 15 mein)</td><td>395</td></tr>
                <tr><td>Pattern matching for <code>instanceof</code> (final)</td><td>394</td></tr>
                <tr><td rowspan="3">17</td><td>Sealed classes (final)</td><td>409</td></tr>
                <tr><td>Pattern matching for switch (<b>sirf preview</b>)</td><td>406</td></tr>
                <tr><td>JDK internals strongly encapsulated</td><td>403</td></tr>
                <tr><td rowspan="5">21</td><td>Virtual threads (final; preview 19 aur 20 mein)</td><td>444</td></tr>
                <tr><td>Pattern matching for switch (final)</td><td>441</td></tr>
                <tr><td>Record patterns (final)</td><td>440</td></tr>
                <tr><td>Sequenced collections</td><td>431</td></tr>
                <tr><td>Generational ZGC</td><td>439</td></tr>
              </table>
              <p>Kuch features bina JEP ke chhote API additions hain: <code>Optional</code> (8), String ke <code>isBlank/strip/lines/repeat</code> (11), <code>Stream.toList()</code> (16).</p>`
    },
    {
      type: "code",
      title: "Java 8: lambda, stream, Optional, default method, java.time",
      code: `import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.*;

public class Main {
    interface Notifier {
        void send(String msg);
        default void sendAll(List<String> msgs) {     // Java 8: interface mein body wala method
            msgs.forEach(this::send);
        }
    }

    public static void main(String[] args) {
        Notifier sms = msg -> System.out.println("SMS: " + msg);
        sms.sendAll(List.of("OTP 4821", "Order shipped"));

        List<String> cities = List.of("Pune", "Delhi", "Patna", "Goa");
        System.out.println(cities.stream().filter(c -> c.startsWith("P")).collect(Collectors.toList()));

        Optional<String> longest = cities.stream().max(Comparator.comparingInt(String::length));
        System.out.println(longest.orElse("none"));

        // java.time: immutable, thread-safe; purane Date/Calendar ki jagah
        LocalDate billDate = LocalDate.of(2024, 1, 31);
        System.out.println("agla bill: " + billDate.plusMonths(1));        // leap year, month-end handle
        System.out.println("din: " + ChronoUnit.DAYS.between(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31)));
        Duration d = Duration.ofMinutes(135);
        System.out.println("duration: " + d + " = " + d.toHours() + "h " + d.toMinutesPart() + "m");
    }
}`,
      note: "<code>toMinutesPart()</code> Java 9 mein aaya; baaki sab Java 8 ka hai. <code>LocalDate</code> ka <code>plusMonths</code> 31 Jan + 1 month ko 29 Feb 2024 (leap year) bana deta hai, khud month-end calculate nahi karna padta."
    },
    {
      type: "code",
      title: "Java 9-11: List.of, var, var in lambda, String methods, Predicate.not, Optional.isEmpty",
      code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // 9: immutable factory methods
        List<String> menu = List.of("dosa", "idli");
        try {
            menu.add("vada");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of immutable hai");
        }

        // 10: var (type compiler nikalta hai, variable phir bhi strongly typed)
        var prices = new HashMap<String, Integer>();
        prices.put("dosa", 80);
        System.out.println(prices);

        // 11: var in lambda params (annotations/final ke saath type-inferred param)
        BiFunction<Integer, Integer, Integer> add = (final var a, final var b) -> a + b;
        System.out.println(add.apply(2, 3));

        // 11: String methods
        System.out.println("   ".isBlank() + " " + "   ".isEmpty());
        System.out.println("[" + "  chai  ".strip() + "][" + "  chai  ".stripLeading() + "]");
        System.out.println("ab".repeat(3));
        System.out.println("line1\\nline2\\nline3".lines().count());

        // 11: Predicate.not, Optional.isEmpty, toArray(IntFunction)
        List<String> names = List.of("riya", "", "aman", " ");
        System.out.println(names.stream().filter(Predicate.not(String::isBlank)).toList());
        System.out.println(Optional.empty().isEmpty());
        String[] arr = names.toArray(String[]::new);
        System.out.println(arr.length);
    }
}`,
      note: "<code>strip()</code> Unicode whitespace samajhta hai, <code>trim()</code> sirf ASCII 32 tak ke characters hatata hai. Naye code mein <code>strip</code>/<code>isBlank</code> prefer karo."
    },
    {
      type: "quiz",
      q: `Java 11+ pe output?<pre class="code-static">String s = " \\t ";
System.out.println(s.isEmpty() + " " + s.isBlank() + " " + s.strip().length());</pre>`,
      options: ["false false 3", "false true 0", "true true 0", "false true 1"],
      answer: 1,
      why: "<code>isEmpty</code> sirf length 0 pe true; yahan 3 characters (space, tab, space) hain. <code>isBlank</code> true jab saare characters whitespace hon. <code>strip</code> aage-peeche ka whitespace hata deta hai, to length 0."
    },
    {
      type: "text",
      html: `
              <h2>Java 12 se 17: kam boilerplate, data ke liye naye tools</h2>
              <ul>
                <li><b>Switch expressions</b> (14): <code>case X -&gt; value</code>, fall-through nahi, switch ek value return karta hai, <code>yield</code> block se value deta hai. Enum pe saare cases cover hon to <code>default</code> zaroori nahi.</li>
                <li><b>Text blocks</b> (15): <code>"""</code> se multi-line string. JSON/SQL ab bina <code>\\n</code> aur <code>+</code> ke.</li>
                <li><b>Helpful NPE</b> (JEP 358: Java 14 mein aaya, Java 15 se default ON): message batata hai <i>kaunsa</i> variable null tha: <i>Cannot invoke "String.length()" because "user.name" is null</i>.</li>
                <li><b>Records</b> (16): immutable data carrier. Constructor, getters (<code>name()</code>), <code>equals/hashCode/toString</code> apne aap.</li>
                <li><b>Pattern matching for instanceof</b> (16): <code>if (obj instanceof String s)</code>: check + cast ek saath.</li>
                <li><b>Sealed classes</b> (17): <code>sealed interface Payment permits Upi, Card</code>: sirf yahi classes implement kar sakti hain. Compiler ko poori list pata hai, isse exhaustive checks possible hote hain (Java 21 ke switch patterns mein poora faayda).</li>
              </ul>`
    },
    {
      type: "code",
      title: "Java 17 ek saath: sealed + records + switch expression + text block + instanceof pattern",
      code: `import java.util.*;

public class Main {
    sealed interface Payment permits Upi, Card, Cash {}
    record Upi(String vpa, int amount) implements Payment {}
    record Card(String last4, int amount, boolean international) implements Payment {}
    record Cash(int amount) implements Payment {}

    enum Status { PENDING, SUCCESS, FAILED }

    static String describe(Payment p) {
        if (p instanceof Upi u) return "UPI " + u.vpa() + " ₹" + u.amount();
        if (p instanceof Card c && c.international()) return "Intl card *" + c.last4();
        if (p instanceof Card c) return "Card *" + c.last4();
        return "Cash ₹" + ((Cash) p).amount();
    }

    static String label(Status s) {
        return switch (s) {                 // switch expression: value deta hai
            case PENDING -> "⏳ ruko";
            case SUCCESS -> "✅ ho gaya";
            case FAILED -> {
                String msg = "❌ fail";
                yield msg + ", retry karo";     // block se value: yield
            }
        };                                  // saare enum cases cover, default ki zaroorat nahi
    }

    public static void main(String[] args) {
        List<Payment> list = List.of(new Upi("riya@okicici", 250), new Card("4242", 999, true), new Cash(100));
        list.forEach(p -> System.out.println(describe(p)));
        System.out.println(new Upi("a@upi", 10));                      // record ka toString
        System.out.println(new Cash(5).equals(new Cash(5)));            // record ka equals
        for (Status s : Status.values()) System.out.println(label(s));

        String json = """
            {
              "orderId": "O-101",
              "status": "SUCCESS"
            }
            """;
        System.out.print(json);
    }
}`,
      note: "Java 17 mein <code>switch (p) { case Upi u -&gt; ... }</code> (type pattern in switch) sirf preview hai, isliye yahan <code>instanceof</code> use kiya. Java 21 mein wo final hai (neeche dekho)."
    },
    {
      type: "exercise",
      id: "ex-java17-fee",
      title: "Java 17 style: sealed Payment ka fee calculator",
      level: "Easy",
      task: `<p><code>Payment</code> sealed interface hai jiske teen records hain (Solution.java mein diye hain). <code>fee(p)</code> rupees mein fee return kare:</p>
             <ul><li><code>Upi</code>: 0</li>
             <li><code>Card</code>: amount ka 2% (integer division, <code>amount * 2 / 100</code>); <code>international</code> ho to upar se 50 aur</li>
             <li><code>Cash</code>: amount 2000 ya usse zyada ho to 20 (cash handling), warna 0</li></ul>
             <p>Pattern matching for <code>instanceof</code> use karo (cast mat likho).</p>`,
      examples: "<code>fee(new Card(\"4242\", 1000, false))</code> → <code>20</code><br><code>fee(new Card(\"4242\", 1000, true))</code> → <code>70</code>",
      userFile: "Solution.java",
      starter: `sealed interface Payment permits Upi, Card, Cash {}
record Upi(String vpa, int amount) implements Payment {}
record Card(String last4, int amount, boolean international) implements Payment {}
record Cash(int amount) implements Payment {}

class Solution {
    int fee(Payment p) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("Card domestic 1000", 20, () -> s.fee(new Card("4242", 1000, false)));
        Check.eq("Card intl 1000", 70, () -> s.fee(new Card("4242", 1000, true)));
        Check.eq("UPI", 0, () -> s.fee(new Upi("riya@okaxis", 5000)));
        Check.hiddenFromHere();
        Check.eq("Cash 2000 (boundary)", 20, () -> s.fee(new Cash(2000)));
        Check.eq("Cash 1999", 0, () -> s.fee(new Cash(1999)));
        Check.eq("Card 99 (2% = 1.98 → 1)", 1, () -> s.fee(new Card("1111", 99, false)));
        Check.eq("Card intl 0 amount", 50, () -> s.fee(new Card("1111", 0, true)));
    }
}`,
      hints: [
        "<code>if (p instanceof Card c) { ... c.amount() ... }</code>: <code>c</code> already Card type ka hai.",
        "<code>int base = c.amount() * 2 / 100; return c.international() ? base + 50 : base;</code>"
      ],
      solution: `sealed interface Payment permits Upi, Card, Cash {}
record Upi(String vpa, int amount) implements Payment {}
record Card(String last4, int amount, boolean international) implements Payment {}
record Cash(int amount) implements Payment {}

class Solution {
    int fee(Payment p) {
        if (p instanceof Upi) return 0;
        if (p instanceof Card c) {
            int base = c.amount() * 2 / 100;
            return c.international() ? base + 50 : base;
        }
        if (p instanceof Cash cash) return cash.amount() >= 2000 ? 20 : 0;
        throw new IllegalArgumentException("unknown payment " + p);
    }
}`,
      explain: "<p>O(1). Sealed hone se pata hai ki sirf teen types hain, par Java 17 mein <code>if</code> chain ke liye compiler exhaustiveness check nahi karta, isliye aakhri <code>throw</code>. Java 21 mein yahi <code>switch (p) { case Upi u -&gt; 0; case Card c -&gt; ...; case Cash c -&gt; ...; }</code> likh sakte ho, aur naya Payment type jodne pe compiler khud error deta hai ki ek case missing hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>Java 21: virtual threads aur pattern matching (sirf padhne ke liye, runner Java 17 hai)</h2>
              <h3>1. Virtual threads (JEP 444)</h3>
              <p>Platform thread = ek OS thread (approx 1 MB stack reserve, hazaron mein mehenga). Virtual thread JVM manage karta hai: bahut halka, lakhon ban sakte hain. Jab virtual thread blocking I/O pe rukta hai, JVM use carrier (OS) thread se utaar deta hai aur carrier doosra kaam karta hai. Matlab \"thread-per-request\" style simple blocking code, async/reactive jaisi scalability ke saath. CPU-heavy kaam fast nahi hota; faayda I/O-bound kaam mein hai.</p>
              <pre class="code-static">// 10,000 tasks, har ek 1 second block: lagbhag 1 second mein khatam, bina 10,000 OS threads ke
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -&gt;
        executor.submit(() -&gt; {
            Thread.sleep(Duration.ofSeconds(1));   // jaise DB / HTTP call
            return i;
        }));
}   // try-with-resources: close() saare tasks ka wait karta hai

Thread t = Thread.ofVirtual().name("worker").start(() -&gt; System.out.println("virtual!"));
Thread.startVirtualThread(() -&gt; System.out.println("ye bhi"));</pre>
              <p>Dhyaan: virtual threads ko pool mat karo (sasta hai, har task naya). Java 21 mein <code>synchronized</code> block ke andar blocking hone pe virtual thread carrier pe \"pin\" ho jaata hai; ye JEP 491 se Java 24 mein theek hua. 21 pe lambe blocking sections ke liye <code>ReentrantLock</code> behtar hai.</p>
              <h3>2. Pattern matching for switch (JEP 441) + record patterns (JEP 440)</h3>
              <pre class="code-static">sealed interface Shape permits Circle, Square, Rect {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}
record Rect(double w, double h) implements Shape {}

static double area(Shape s) {
    return switch (s) {
        case Circle c          -&gt; Math.PI * c.r() * c.r();   // type pattern
        case Square(double a)  -&gt; a * a;                     // record pattern: component seedha nikla
        case Rect(double w, double h) when w == h -&gt; w * w;  // guard: when
        case Rect(double w, double h) -&gt; w * h;
    };   // sealed + saare types cover = exhaustive, default nahi chahiye
}

static String classify(Object o) {
    return switch (o) {
        case null              -&gt; "null bhi case ban sakta hai";
        case Integer i when i &gt; 100 -&gt; "bada number";
        case Integer i         -&gt; "number " + i;
        case String str        -&gt; "string of length " + str.length();
        default                -&gt; "kuch aur";
    };
}</pre>
              <h3>3. Sequenced collections (JEP 431)</h3>
              <p>Pehle \"pehla/aakhri element\" har collection mein alag tareeke se milta tha (<code>list.get(list.size() - 1)</code>, <code>deque.peekLast()</code>, LinkedHashSet mein loop). Ab common interfaces: <code>SequencedCollection</code>, <code>SequencedSet</code>, <code>SequencedMap</code>.</p>
              <pre class="code-static">List&lt;String&gt; list = new ArrayList&lt;&gt;(List.of("a", "b", "c"));
list.getFirst();      // "a"
list.getLast();       // "c"
list.addFirst("z");   // [z, a, b, c]
list.reversed();      // reverse VIEW: [c, b, a, z]

LinkedHashMap&lt;String, Integer&gt; m = new LinkedHashMap&lt;&gt;();
m.put("x", 1); m.put("y", 2);
m.firstEntry();       // x=1
m.pollLastEntry();    // y=2 nikaal ke hata diya
m.putFirst("w", 0);   // shuru mein daalo</pre>`
    },
    {
      type: "pick",
      id: "pick-java17-final",
      q: "Java 17 (LTS) mein kaunse features <b>final</b> hain (bina <code>--enable-preview</code> ke chalte hain)?",
      options: [
        { text: "Records", correct: true, why: "Java 16 mein final (JEP 395)." },
        { text: "Sealed classes", correct: true, why: "Java 17 mein final (JEP 409)." },
        { text: "Switch expressions (<code>case X -&gt; ...</code>, <code>yield</code>)", correct: true, why: "Java 14 mein final (JEP 361)." },
        { text: "<code>switch (obj) { case String s -&gt; ... }</code> (type patterns in switch)", correct: false, why: "17 mein sirf preview (JEP 406). Final Java 21 mein (JEP 441)." },
        { text: "Virtual threads", correct: false, why: "Preview Java 19 aur 20 mein, final Java 21 mein (JEP 444)." },
        { text: "Text blocks", correct: true, why: "Java 15 mein final (JEP 378)." },
        { text: "<code>list.getFirst()</code> (sequenced collections)", correct: false, why: "Java 21 (JEP 431)." }
      ]
    },
    {
      type: "order",
      id: "order-versions",
      q: "In features ko us order mein lagao jis order mein ye <b>final</b> hue (pehle wala upar):",
      items: [
        "Lambdas aur Streams (8)",
        "<code>var</code> local variables (10)",
        "Switch expressions (14)",
        "Records (16)",
        "Sealed classes (17)",
        "Virtual threads (21)"
      ],
      why: "8 → 10 → 14 → 16 → 17 → 21. Trick: 17 tak \"data\" features (records, sealed) final ho gaye, aur 21 mein unko use karne wale features (switch patterns, record patterns) aur virtual threads."
    },
    {
      type: "quiz",
      q: "Lambda parameters mein <code>var</code> likhne ki ijaazat (<code>(var x, var y) -&gt; x + y</code>) kis version se hai, aur iska practical faayda kya hai?",
      options: [
        "Java 8; type inference ke liye",
        "Java 10; local variables jaisa hi",
        "Java 11; inferred type ke saath annotations/modifiers (jaise <code>final</code>, <code>@NonNull</code>) laga sakte ho",
        "Java 17; records ke saath kaam karne ke liye"
      ],
      answer: 2,
      why: "<code>var</code> local variables ke liye Java 10 (JEP 286) mein aaya. Lambda params ke liye Java 11 (JEP 323). Bina var ke annotation lagane ke liye poora type likhna padta tha; var se type inferred rehta hai aur annotation bhi lag jaata hai."
    },
    {
      type: "think",
      id: "think-migrate",
      q: "Interview question: <b>\"Aapki team Java 8 pe hai. 17 ya 21 pe migrate karne ke faayde kya hain, aur kya dikkatein aa sakti hain?\"</b>",
      rubric: [
        { point: "Language faayde: <b>records, sealed, switch expressions, text blocks, var, pattern matching</b>", keys: ["record", "sealed", "switch", "text block", "var", "pattern"], weight: 2 },
        { point: "Runtime faayde: <b>GC improvements</b> (G1 better, ZGC), performance, helpful NPE, aur 21 mein <b>virtual threads</b>", keys: ["gc", "zgc", "g1", "performance", "virtual thread", "helpful"], weight: 2 },
        { point: "Support: Java 8 purana LTS hai; naye LTS ke security updates, libraries (Spring Boot 3 ko Java 17+ chahiye)", keys: ["lts", "support", "security", "spring boot 3", "spring 6", "library"], weight: 2 },
        { point: "Dikkatein: <b>strong encapsulation</b> (JDK internals pe reflection fail, --add-opens), hataye gaye modules (Java EE/JAXB, Nashorn)", keys: ["encapsulat", "add-opens", "reflection", "internal", "jaxb", "java ee", "javax", "nashorn", "removed"], weight: 2 },
        { point: "Approach: dependencies/build tools upgrade, step-wise (8 → 11 → 17), tests aur canary deploy", keys: ["dependenc", "maven", "gradle", "step", "test", "canary", "incremental"], weight: 1 }
      ],
      answer: `<p><b>Faayde:</b></p>
               <ul>
                 <li><b>Language:</b> records (DTOs bina Lombok), sealed classes + pattern matching (type-safe domain modelling), switch expressions, text blocks (SQL/JSON), <code>var</code>, <code>Stream.toList()</code>.</li>
                 <li><b>Runtime:</b> G1 aur ZGC ke improvements (kam pause), container awareness behtar, helpful NPE messages. Java 21 pe virtual threads: I/O-heavy services mein bina reactive code ke zyada concurrency.</li>
                 <li><b>Ecosystem/support:</b> Spring Boot 3 / Spring Framework 6 ko Java 17+ chahiye; naye LTS ko lamba security support milta hai.</li>
               </ul>
               <p><b>Dikkatein:</b></p>
               <ul>
                 <li>Java 17 mein JDK internals strongly encapsulated hain (JEP 403): purani libraries jo <code>sun.*</code> ya private fields pe reflection karti thi wo fail ho sakti hain (fix: library upgrade, temporary <code>--add-opens</code>).</li>
                 <li>Java 11 mein Java EE modules (JAXB, JAX-WS) hataye gaye (JEP 320), to unki dependencies alag se jodni padti hain; Nashorn Java 15 mein hataya gaya (JEP 372).</li>
                 <li>Build tools, plugins, bytecode libraries (ASM, Mockito, Lombok) ke versions upgrade.</li>
               </ul>
               <p><b>Approach:</b> pehle dependencies aur build upgrade, CI mein naye JDK pe tests, ek-ek service canary deploy, GC aur memory metrics compare karo.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Java 8 ke baad kya naya?\" ka jawab LTS ke hisaab se do, har ek mein 2-3 features: <i>11 → var in lambda, HTTP Client, String methods; 17 → records, sealed, switch expressions, text blocks; 21 → virtual threads, pattern matching for switch, record patterns, sequenced collections</i>. Ek feature pe khud se deep jao (jaise virtual threads I/O-bound kaam mein kyun madad karte hain, CPU-bound mein kyun nahi). Isse lagta hai aapne asli mein use kiya hai."
    }
  ],
  references: [
    { title: "Oracle Java SE Support Roadmap (LTS releases)", by: "Oracle", url: "https://www.oracle.com/java/technologies/java-se-support-roadmap.html", type: "docs" },
    { title: "JDK 17 (features list with JEPs)", by: "OpenJDK", url: "https://openjdk.org/projects/jdk/17/", type: "docs" },
    { title: "JDK 21 (features list with JEPs)", by: "OpenJDK", url: "https://openjdk.org/projects/jdk/21/", type: "docs" },
    { title: "JEP 444: Virtual Threads", by: "OpenJDK", url: "https://openjdk.org/jeps/444", type: "docs" },
    { title: "dev.java: New features", by: "Oracle", url: "https://dev.java/learn/new-features/", type: "docs" }
  ]
});
