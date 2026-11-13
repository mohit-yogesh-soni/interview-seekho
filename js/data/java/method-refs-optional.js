// Method References aur Optional
registerLesson("java", "method-refs-optional", {
  why: "Method references streams ko padhne layak banate hain, aur Optional 'null aa sakta hai' ko type mein likh deta hai. Interview mein 4 types of method references, orElse vs orElseGet ka trap, aur 'Optional ko field mein kyun nahi rakhte' poochha jaata hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Method reference: lambda jo bas ek method call karta hai</h2>
              <p>Agar lambda sirf ek existing method ko call kar raha hai, to <code>::</code> se seedha us method ka naam de do. Code chhota aur intent saaf.</p>
              <table>
                <tr><th>Type</th><th>Syntax</th><th>Lambda equivalent</th></tr>
                <tr><td>1. <b>Static</b> method</td><td><code>Integer::parseInt</code></td><td><code>s -&gt; Integer.parseInt(s)</code></td></tr>
                <tr><td>2. <b>Bound</b> instance (specific object ka method)</td><td><code>System.out::println</code>, <code>cart::add</code></td><td><code>x -&gt; System.out.println(x)</code></td></tr>
                <tr><td>3. <b>Unbound</b> instance (type ka method, object pehla argument banta hai)</td><td><code>String::toUpperCase</code>, <code>String::compareTo</code></td><td><code>s -&gt; s.toUpperCase()</code>, <code>(a, b) -&gt; a.compareTo(b)</code></td></tr>
                <tr><td>4. <b>Constructor</b></td><td><code>ArrayList::new</code>, <code>int[]::new</code></td><td><code>() -&gt; new ArrayList&lt;&gt;()</code>, <code>n -&gt; new int[n]</code></td></tr>
              </table>
              <p>Bound vs unbound ka farak: <code>"abc"::equals</code> (bound, ek argument leta hai: <code>x -&gt; "abc".equals(x)</code>) vs <code>String::equals</code> (unbound, do arguments: <code>(a, b) -&gt; a.equals(b)</code>).</p>`
    },
    {
      type: "code",
      title: "Chaaron types ek saath",
      code: `import java.util.*;
import java.util.function.*;

public class Main {
    record Order(String id, int amount) {}

    static boolean isLarge(Order o) { return o.amount() > 500; }

    public static void main(String[] args) {
        // 1. Static
        Function<String, Integer> parse = Integer::parseInt;
        Predicate<Order> large = Main::isLarge;
        System.out.println(parse.apply("42") + 1);
        System.out.println(large.test(new Order("A1", 900)));

        // 2. Bound instance: ek fixed object ka method
        List<String> audit = new ArrayList<>();
        Consumer<String> record = audit::add;
        record.accept("login");
        record.accept("pay");
        audit.forEach(System.out::println);
        Predicate<String> isAdmin = "admin"::equals;
        System.out.println(isAdmin.test("admin") + " " + isAdmin.test("guest"));

        // 3. Unbound instance: pehla argument hi object banta hai
        Function<String, String> upper = String::toUpperCase;
        BiFunction<String, String, Boolean> same = String::equalsIgnoreCase;
        Function<Order, Integer> amount = Order::amount;
        System.out.println(upper.apply("upi") + " " + same.apply("Pune", "PUNE") + " " + amount.apply(new Order("B2", 300)));

        // 4. Constructor
        Supplier<List<String>> newList = ArrayList::new;
        BiFunction<String, Integer, Order> makeOrder = Order::new;
        IntFunction<int[]> newArray = int[]::new;
        System.out.println(newList.get().size() + " " + makeOrder.apply("C3", 120) + " " + newArray.apply(5).length);
    }
}`
    },
    {
      type: "quiz",
      q: "<code>Comparator&lt;String&gt; c = String::compareToIgnoreCase;</code> kaunsa type ka method reference hai?",
      options: ["Static", "Bound instance", "Unbound instance: <code>(a, b) -&gt; a.compareToIgnoreCase(b)</code>", "Constructor"],
      answer: 2,
      why: "<code>compareToIgnoreCase</code> static nahi hai, aur koi specific String object nahi diya. Comparator ke do arguments mein se <b>pehla</b> receiver ban jaata hai, doosra argument. Yahi unbound reference hai."
    },
    {
      type: "text",
      html: `
              <h2>Optional: \"value ho bhi sakti hai, nahi bhi\"</h2>
              <p><code>findRestaurant(id)</code> null return kare to caller ko pata hi nahi chalta ki check karna hai, aur NPE production mein aata hai. <code>Optional&lt;Restaurant&gt;</code> return karna <b>signature mein</b> likh deta hai: \"ye khaali ho sakta hai, handle karo\".</p>
              <table>
                <tr><th>Method</th><th>Kaam</th></tr>
                <tr><td><code>Optional.of(x)</code> / <code>ofNullable(x)</code> / <code>empty()</code></td><td>Banao. <code>of(null)</code> = NPE, <code>ofNullable(null)</code> = empty</td></tr>
                <tr><td><code>map(f)</code></td><td>Value ho to f lagao (result null ho to empty)</td></tr>
                <tr><td><code>flatMap(f)</code></td><td>f khud Optional return kare tab (Optional&lt;Optional&gt; se bachao)</td></tr>
                <tr><td><code>filter(p)</code></td><td>Condition fail to empty</td></tr>
                <tr><td><code>orElse(v)</code></td><td>Khaali ho to v. <b>v hamesha evaluate hota hai</b></td></tr>
                <tr><td><code>orElseGet(supplier)</code></td><td>Khaali ho to supplier chalao (lazy)</td></tr>
                <tr><td><code>orElseThrow()</code> (Java 10) / <code>orElseThrow(supplier)</code></td><td>Khaali ho to exception</td></tr>
                <tr><td><code>ifPresent(c)</code> / <code>ifPresentOrElse(c, r)</code> (Java 9)</td><td>Side effect</td></tr>
                <tr><td><code>isPresent()</code> / <code>isEmpty()</code> (Java 11)</td><td>Check (par chaining better hai)</td></tr>
                <tr><td><code>or(supplier)</code>, <code>stream()</code> (Java 9)</td><td>Doosra Optional try karo; 0/1 element ka stream</td></tr>
              </table>`
    },
    {
      type: "code",
      title: "Optional chaining: user → address → city, bina ek bhi null check ke",
      code: `import java.util.*;

public class Main {
    record Address(String city) {}
    record User(String name, Address address) {}

    static Map<String, User> db = Map.of(
        "u1", new User("Riya", new Address("Pune")),
        "u2", new User("Aman", null),
        "u3", new User("Kabir", new Address("  ")));

    static Optional<User> findUser(String id) {
        return Optional.ofNullable(db.get(id));
    }

    static String cityOf(String id) {
        return findUser(id)
            .map(User::address)                 // Address ya empty (null → empty)
            .map(Address::city)
            .filter(c -> !c.isBlank())          // blank city bhi "nahi pata"
            .map(String::toUpperCase)
            .orElse("UNKNOWN");
    }

    public static void main(String[] args) {
        for (String id : List.of("u1", "u2", "u3", "u404")) {
            System.out.println(id + " → " + cityOf(id));
        }
        findUser("u1").ifPresentOrElse(
            u -> System.out.println("Welcome " + u.name()),
            () -> System.out.println("Sign up karo"));
        String name = findUser("u2").map(User::name).orElseThrow();
        System.out.println("orElseThrow mila: " + name);
    }
}`
    },
    {
      type: "code",
      title: "Trap: orElse ka argument hamesha chalta hai, orElseGet ka sirf zaroorat pe",
      code: `import java.util.*;

public class Main {
    static String loadDefaultFromDb() {
        System.out.println("  (DB call hui! 50 ms)");
        return "default-profile";
    }

    public static void main(String[] args) {
        Optional<String> cached = Optional.of("cached-profile");

        System.out.println("orElse:");
        String a = cached.orElse(loadDefaultFromDb());          // value hai, phir bhi DB call
        System.out.println("  result = " + a);

        System.out.println("orElseGet:");
        String b = cached.orElseGet(() -> loadDefaultFromDb()); // value hai, koi call nahi
        System.out.println("  result = " + b);

        System.out.println("orElseGet on empty:");
        String c = Optional.<String>empty().orElseGet(Main::loadDefaultFromDb);
        System.out.println("  result = " + c);
    }
}`,
      note: "<code>orElse(x)</code> ek normal method call hai: Java pehle argument <code>x</code> calculate karta hai, phir method call. Sasta constant ho (<code>orElse(\"UNKNOWN\")</code>) to theek. Mehenga kaam (DB, network, naya object) ho to <code>orElseGet</code>."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">static int calls = 0;
static int next() { return ++calls; }
...
Optional.of(5).orElse(next());
Optional.of(5).orElseGet(() -&gt; next());
Optional.empty().orElseGet(() -&gt; next());
System.out.println(calls);</pre>`,
      options: ["0", "1", "2", "3"],
      answer: 2,
      why: "Pehli line: orElse ka argument hamesha evaluate → calls = 1. Doosri: value present, supplier nahi chala. Teesri: empty, supplier chala → calls = 2."
    },
    {
      type: "warn",
      html: `⚠️ <b>Optional ka galat use:</b>
             <ul>
               <li><code>opt.get()</code> bina check ke: ye bas NPE ki jagah <code>NoSuchElementException</code> hai. <code>orElseThrow()</code> likho, intent saaf hai.</li>
               <li><code>if (opt.isPresent()) { x = opt.get(); }</code>: null check hi dobara likh diya. <code>map / orElse / ifPresent</code> use karo.</li>
               <li><b>Fields aur method parameters</b> mein Optional: ye return types ke liye design hua tha. Ye Serializable bhi nahi hai. Parameter ke liye overloading ya nullable + validation.</li>
               <li><code>Optional&lt;List&lt;X&gt;&gt;</code>: khaali list return karo, Optional ki zaroorat nahi.</li>
               <li>Optional return karne wale method se <code>null</code> return karna: sabse bura, caller ne check hi nahi kiya hoga.</li>
               <li><code>Optional&lt;Integer&gt;</code> ki jagah <code>OptionalInt</code> (boxing nahi).</li>
             </ul>`
    },
    {
      type: "pick",
      id: "pick-optional",
      q: "Inme se kaunse <b>achhe</b> Optional uses hain?",
      options: [
        { text: "<code>Optional&lt;User&gt; findByEmail(String email)</code> repository method", correct: true, why: "Return type, \"mil bhi sakta hai nahi bhi\". Bilkul isi ke liye bana hai." },
        { text: "<code>class Order { Optional&lt;String&gt; coupon; }</code>", correct: false, why: "Field mein mat rakho. Field nullable rakho, getter Optional return kare." },
        { text: "<code>user.map(User::email).orElse(\"n/a\")</code>", correct: true, why: "Chaining + sasta default." },
        { text: "<code>void send(Optional&lt;String&gt; cc)</code>", correct: false, why: "Caller ko Optional banana padta hai aur wo null bhi bhej sakta hai. Overload karo: <code>send()</code> / <code>send(String cc)</code>." },
        { text: "<code>opt.orElseThrow(() -&gt; new OrderNotFoundException(id))</code>", correct: true, why: "Khaali hone pe saaf business exception." },
        { text: "<code>return Optional.of(map.get(key));</code>", correct: false, why: "<code>get</code> null de sakta hai → <code>Optional.of(null)</code> = NPE. <code>ofNullable</code> chahiye." }
      ]
    },
    {
      type: "code",
      expectException: true,
      title: "Optional.of(null) turant NPE deta hai",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, String> coupons = Map.of("riya", "SAVE50");
        System.out.println(Optional.ofNullable(coupons.get("aman")).orElse("no coupon"));   // safe
        System.out.println(Optional.of(coupons.get("aman")));                               // 💥 NPE
    }
}`
    },
    {
      type: "exercise",
      id: "ex-optional-parse",
      title: "Safe parse: Optional return karo, phir valid wale jodo",
      level: "Easy",
      task: `<p>Do methods:</p>
             <ol><li><code>parse(s)</code>: String ko int mein badlo aur <code>Optional&lt;Integer&gt;</code> do. <code>null</code>, blank, ya invalid → <code>Optional.empty()</code>. Spaces trim karo.</li>
             <li><code>sumValid(list)</code>: list ki sirf valid entries ka sum (parse use karo).</li></ol>`,
      examples: "<code>parse(\" 42 \")</code> → <code>Optional[42]</code>; <code>parse(\"abc\")</code> → <code>Optional.empty</code><br><code>sumValid([\"10\", \"x\", null, \"5\"])</code> → <code>15</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    Optional<Integer> parse(String s) {
        return Optional.of(Integer.parseInt(s));
    }

    int sumValid(List<String> list) {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("parse(\\" 42 \\")", Optional.of(42), () -> s.parse(" 42 "));
        Check.eq("parse(\\"abc\\")", Optional.empty(), () -> s.parse("abc"));
        Check.eq("sumValid([10, x, null, 5])", 15, () -> s.sumValid(Arrays.asList("10", "x", null, "5")));
        Check.hiddenFromHere();
        Check.eq("parse(null)", Optional.empty(), () -> s.parse(null));
        Check.eq("parse(blank)", Optional.empty(), () -> s.parse("   "));
        Check.eq("parse(-7)", Optional.of(-7), () -> s.parse("-7"));
        Check.eq("parse(overflow)", Optional.empty(), () -> s.parse("99999999999"));
        Check.eq("sumValid(empty)", 0, () -> s.sumValid(List.of()));
        Check.eq("sumValid(sab invalid)", 0, () -> s.sumValid(List.of("a", "", " ")));
    }
}`,
      hints: [
        "Pehle <code>if (s == null || s.isBlank()) return Optional.empty();</code>",
        "Parse ko try/catch mein: <code>catch (NumberFormatException e) { return Optional.empty(); }</code>",
        "<code>sumValid</code>: loop mein <code>sum += parse(x).orElse(0);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    Optional<Integer> parse(String s) {
        if (s == null || s.isBlank()) return Optional.empty();
        try {
            return Optional.of(Integer.parseInt(s.trim()));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    int sumValid(List<String> list) {
        int sum = 0;
        for (String x : list) sum += parse(x).orElse(0);
        return sum;
    }
}`,
      explain: "<p><code>parse</code> ka signature hi bata deta hai ki fail ho sakta hai, caller ko exception catch karna nahi padta. <code>orElse(0)</code> yahan theek hai kyunki 0 sasta constant hai. Streams ke baad: <code>list.stream().map(this::parse).flatMap(Optional::stream).mapToInt(Integer::intValue).sum()</code> (<code>Optional.stream()</code> Java 9).</p>"
    },
    {
      type: "think",
      id: "think-optional",
      q: "Interview question: <b>\"Optional kyun aaya? Aap ise kahan use karte ho aur kahan nahi? orElse aur orElseGet mein kya farak hai?\"</b>",
      rubric: [
        { point: "Purpose: \"value absent ho sakti hai\" ko <b>return type</b> mein explicit karna, NPE kam karna", keys: ["return type", "absent", "null", "npe", "explicit", "signature"], weight: 2 },
        { point: "Kahan nahi: <b>fields, parameters, collections</b> (khaali collection do), serialization", keys: ["field", "parameter", "param", "collection", "empty list", "serializ"], weight: 2 },
        { point: "<b>orElse eager</b> (argument hamesha evaluate), <b>orElseGet lazy</b> (supplier sirf empty pe)", keys: ["eager", "lazy", "always", "hamesha", "supplier", "orelseget"], weight: 2 },
        { point: "get() / isPresent()+get() avoid; map/flatMap/orElseThrow use", keys: ["get()", "ispresent", "map", "flatmap", "orelsethrow"], weight: 1 }
      ],
      answer: `<p><b>Kyun:</b> null ka matlab method ke signature se pata nahi chalta. <code>Optional&lt;User&gt; findById(id)</code> type mein hi bata deta hai ki result khaali ho sakta hai, aur API (<code>map</code>, <code>orElse</code>, <code>orElseThrow</code>) handle karna aasan banati hai. Optional ka javadoc khud kehta hai ki ye mainly <b>method return type</b> ke liye hai, jahan "no result" dikhana zaroori ho.</p>
               <p><b>Kahan nahi:</b> fields (Serializable nahi, extra object), method parameters (caller pe bojh, null bhi aa sakta hai), collections ke andar ya collection ki jagah (khaali list do), aur performance-critical loops (har Optional ek object).</p>
               <p><b>orElse vs orElseGet:</b> <code>orElse(x)</code> mein <code>x</code> method call se pehle hamesha calculate hota hai, chahe value present ho. <code>orElseGet(() -&gt; x)</code> supplier sirf empty hone pe chalata hai. Default mehenga ho (DB call, naya object) to orElseGet.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Method reference ke 4 types ek-ek example ke saath bolo: <i>static <code>Integer::parseInt</code>, bound <code>System.out::println</code>, unbound <code>String::length</code>, constructor <code>ArrayList::new</code></i>. Unbound wala sabse zyada confuse karta hai: bolo ki \"pehla parameter receiver ban jaata hai\"."
    }
  ],
  references: [
    { title: "Method References (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/methodreferences.html", type: "docs" },
    { title: "Optional (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html", type: "docs" },
    { title: "Effective Java (3rd ed.), Item 55: Return optionals judiciously", by: "Joshua Bloch", type: "book" }
  ]
});
