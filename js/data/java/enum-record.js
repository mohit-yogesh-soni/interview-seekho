// Enums aur Records
registerLesson("java", "enum-record", {
  why: "Order status, payment type, plans: har system mein fixed set of values hote hain, aur enum unhe type-safe banata hai. Records (Java 16+) DTO ka boilerplate khatam karte hain, aur sealed classes ke saath modern Java ka data modelling banate hain. Interviewers ab Java 17 features expect karte hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Enum kyun? int constants ka problem</h2>
              <pre class="code-static">static final int PLACED = 0, PREPARING = 1, DELIVERED = 2;
void update(int status) { ... }
update(42);        // compile ho jaata hai! 42 kaunsa status hai?</pre>
              <p><code>enum</code> ek <b>fixed set of named objects</b> wala type hai. <code>update(OrderStatus status)</code> mein sirf wahi values pass ho sakti hain jo enum mein hain. Galat value = compile error.</p>
              <ul>
                <li>Enum asal mein ek <b>class</b> hai jo <code>java.lang.Enum</code> extend karti hai. Har constant us class ka ek <b>public static final object</b> hai, aur JVM mein sirf ek baar banta hai (singleton).</li>
                <li>Isliye enums ko <code>==</code> se compare karna safe hai (aur null-safe bhi).</li>
                <li>Enum mein <b>fields, constructor, methods</b> ho sakte hain. Constructor hamesha private (implicitly); bahar se <code>new</code> nahi.</li>
                <li>Compiler deta hai: <code>values()</code> (saare constants, declaration order mein), <code>valueOf("NAME")</code> (String se constant; galat naam pe <code>IllegalArgumentException</code>, case-sensitive), <code>name()</code>, <code>ordinal()</code> (0 se position).</li>
                <li>Enum interfaces implement kar sakta hai, par kisi class ko extend nahi kar sakta (already Enum extend karta hai).</li>
                <li><code>switch</code> mein enum constants seedha likhte hain (<code>case PLACED</code>), aur switch expression mein saare constants cover hon to default nahi chahiye.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Enum with fields, methods, switch aur constant-specific behaviour",
      code: `enum OrderStatus {
    PLACED("Order mil gaya", false),
    PREPARING("Ban raha hai", false),
    OUT_FOR_DELIVERY("Raaste mein", false),
    DELIVERED("Pahunch gaya", true),
    CANCELLED("Cancel ho gaya", true);

    private final String label;          // har constant ka apna data
    private final boolean terminal;

    OrderStatus(String label, boolean terminal) {   // implicitly private
        this.label = label;
        this.terminal = terminal;
    }

    String label() { return label; }
    boolean isTerminal() { return terminal; }

    boolean canMoveTo(OrderStatus next) {
        if (terminal) return false;
        return next == CANCELLED || next.ordinal() == this.ordinal() + 1;
    }
}

enum Coupon {
    FLAT50 {
        int apply(int amount) { return Math.max(0, amount - 50); }
    },
    TENPERCENT {
        int apply(int amount) { return amount - amount / 10; }
    };

    abstract int apply(int amount);      // har constant ka apna implementation
}

public class Main {
    public static void main(String[] args) {
        for (OrderStatus s : OrderStatus.values()) {
            System.out.println(s.ordinal() + " " + s + " -> " + s.label());
        }

        OrderStatus s = OrderStatus.valueOf("PREPARING");
        System.out.println(s == OrderStatus.PREPARING);                 // true: singleton
        System.out.println(s.canMoveTo(OrderStatus.OUT_FOR_DELIVERY));  // true
        System.out.println(s.canMoveTo(OrderStatus.DELIVERED));         // false: step skip

        String msg = switch (s) {        // saare constants cover: default nahi chahiye
            case PLACED, PREPARING -> "Restaurant pe";
            case OUT_FOR_DELIVERY -> "Rider ke paas";
            case DELIVERED, CANCELLED -> "Khatam";
        };
        System.out.println(msg);

        System.out.println(Coupon.FLAT50.apply(300) + " " + Coupon.TENPERCENT.apply(300));

        try {
            OrderStatus.valueOf("delivered");   // case-sensitive
        } catch (IllegalArgumentException e) {
            System.out.println("valueOf galat naam pe IllegalArgumentException");
        }
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">enum Size { SMALL, MEDIUM, LARGE }
// main:
Size s = Size.valueOf("LARGE");
System.out.println(s.ordinal() + " " + s.compareTo(Size.SMALL) + " " + Size.values().length);</pre>`,
      options: ["3 2 3", "2 2 3", "2 1 3", "Compile error: enum mein compareTo nahi hota"],
      answer: 1,
      why: "<code>ordinal()</code> 0 se: LARGE = 2. Enum <code>Comparable</code> hai aur ordinal order se compare karta hai; OpenJDK ka implementation seedha ordinal ka difference return karta hai: 2 - 0 = 2. (Contract sirf sign ka hai: negative / 0 / positive.) <code>values()</code> mein 3 constants."
    },
    {
      type: "warn",
      html: "⚠️ <b>Production galti:</b> DB mein enum ka <code>ordinal()</code> store karna (JPA ka default <code>EnumType.ORDINAL</code>!). Kal kisi ne beech mein naya constant jod diya (<code>PLACED, PAYMENT_PENDING, PREPARING...</code>) to purane saare rows ka matlab badal gaya. Hamesha <code>name()</code> store karo (<code>@Enumerated(EnumType.STRING)</code>), ya apna stable code field rakho."
    },
    {
      type: "text",
      html: `
              <h2>Records (Java 16+): data carrier classes</h2>
              <p>Ek simple immutable <code>Point</code> class ke liye: 2 private final fields, constructor, 2 getters, <code>equals</code>, <code>hashCode</code>, <code>toString</code>. ~30 lines. Record ek line mein:</p>
              <pre class="code-static">record Point(int x, int y) { }</pre>
              <p>Compiler khud banata hai:</p>
              <ul>
                <li>Har component ka <b>private final field</b>.</li>
                <li><b>Canonical constructor</b> <code>Point(int x, int y)</code>.</li>
                <li><b>Accessor methods</b> <code>x()</code> aur <code>y()</code> (naam <code>getX()</code> nahi!).</li>
                <li><code>equals</code>/<code>hashCode</code> saare components se, aur <code>toString</code> jaisa <code>Point[x=1, y=2]</code>.</li>
              </ul>
              <h3>Rules / restrictions</h3>
              <ul>
                <li>Record <b>implicitly final</b> hai (koi extend nahi kar sakta), aur khud <code>java.lang.Record</code> extend karta hai, to kisi class ko extend nahi kar sakta. <b>Interfaces implement</b> kar sakta hai.</li>
                <li>Extra <b>instance fields declare nahi</b> kar sakte (state sirf components mein). <b>static</b> fields aur methods, instance methods, nested types allowed. Instance initializer blocks allowed nahi.</li>
                <li><b>Compact constructor</b> se validation / normalization: <code>record Range(int lo, int hi) { Range { if (lo &gt; hi) throw ...; } }</code>. Parameters likhne ki zaroorat nahi, assignment compiler karta hai.</li>
                <li>Immutability <b>shallow</b> hai: component <code>List</code> ho to list ke andar badlav ho sakta hai. Compact constructor mein <code>List.copyOf</code> karo.</li>
              </ul>
              <p><b>Kahan use:</b> DTOs (API request/response), map keys, method se multiple values return karna, events. <b>Kahan nahi:</b> JPA entities (unhe mutable fields, no-arg constructor aur proxies chahiye).</p>`
    },
    {
      type: "code",
      title: "Record: auto methods, compact constructor, shallow immutability",
      code: `import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

record Point(int x, int y) {
    static final Point ORIGIN = new Point(0, 0);    // static field allowed

    double distanceFromOrigin() {                   // instance method allowed
        return Math.sqrt(x * x + y * y);
    }
}

record Money(long paise, String currency) {
    Money {                                         // compact constructor: validation
        if (paise < 0) throw new IllegalArgumentException("negative amount");
        currency = currency.toUpperCase();          // normalize, field assignment compiler karega
    }
    static Money ofRupees(long rupees) { return new Money(rupees * 100, "inr"); }
}

record Cart(String user, List<String> items) {
    Cart {
        items = List.copyOf(items);                 // defensive copy: asli immutability
    }
}

public class Main {
    public static void main(String[] args) {
        Point p = new Point(3, 4);
        System.out.println(p);                       // Point[x=3, y=4]
        System.out.println(p.x() + " " + p.distanceFromOrigin());
        System.out.println(p.equals(new Point(3, 4)));   // true: value equality

        Set<Point> visited = new HashSet<>();
        visited.add(new Point(1, 1));
        System.out.println(visited.contains(new Point(1, 1)));   // true: hashCode bhi auto

        System.out.println(Money.ofRupees(250));     // Money[paise=25000, currency=INR]
        try {
            new Money(-1, "inr");
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }

        List<String> raw = new ArrayList<>(List.of("dosa"));
        Cart c = new Cart("riya", raw);
        raw.add("vada");                             // bahar ki list badli
        System.out.println(c.items());               // [dosa]: copy li thi, isliye safe
        try {
            c.items().add("idli");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cart items immutable hain");
        }
    }
}`
    },
    {
      type: "code",
      expectError: true,
      title: "Record mein extra instance field nahi",
      code: `record User(String name) {
    int loginCount = 0;          // instance field: allowed nahi
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new User("Riya"));
    }
}`,
      note: "Error: <i>field declaration must be static</i>. Record ki poori state uske header (components) mein dikhni chahiye. Badalne wala counter chahiye to normal class likho."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">record Item(String name, int qty) { }
// main:
Item a = new Item("chai", 2);
Item b = new Item("chai", 2);
System.out.println((a == b) + " " + a.equals(b) + " " + a);</pre>`,
      options: [
        "true true Item[name=chai, qty=2]",
        "false true Item[name=chai, qty=2]",
        "false false Item@1b6d3586",
        "false true Item(chai, 2)"
      ],
      answer: 1,
      why: "<code>new</code> se do alag objects: <code>==</code> false. Record ka auto <code>equals</code> saare components compare karta hai: true. Auto <code>toString</code> ka format <code>Item[name=chai, qty=2]</code> hai."
    },
    {
      type: "text",
      html: `
              <h2>Sealed classes (Java 17): kaun extend kar sakta hai, ye main decide karunga</h2>
              <p>Normal interface ko koi bhi implement kar sakta hai. Kabhi kabhi aap chahte ho ki <b>sirf fixed types</b> hon: <code>Payment</code> = UPI, Card ya COD, bas. Enum yahan kaafi nahi kyunki har type ka <b>alag data</b> hai (UPI ka VPA, card ke last 4 digits).</p>
              <pre class="code-static">sealed interface Payment permits Upi, Card, Cod { }
record Upi(String vpa) implements Payment { }
record Card(String last4) implements Payment { }
final class Cod implements Payment { }</pre>
              <ul>
                <li><code>permits</code> mein list ki gayi classes hi extend/implement kar sakti hain. Sab ek hi file mein hon to <code>permits</code> chhod sakte ho, compiler khud nikal leta hai.</li>
                <li>Har permitted subclass ko batana padta hai: <code>final</code> (aage koi nahi), <code>sealed</code> (aage bhi controlled), ya <code>non-sealed</code> (aage sab ke liye khula). Records implicitly final hain.</li>
                <li>Permitted classes same module mein (ya unnamed module mein ho to same package mein) honi chahiye.</li>
                <li>Fayda: compiler ko saare subtypes pata hain. Java 21 ke pattern matching for switch mein ye <b>exhaustive</b> check deta hai (naya type joda to har switch compile error dega). Java 17 mein hum <code>instanceof</code> pattern (Java 16) use karte hain.</li>
              </ul>
              <p>Enum = fixed set of <b>values</b>. Sealed = fixed set of <b>types</b>. Records + sealed = \"algebraic data types\" jaisa modelling.</p>`
    },
    {
      type: "code",
      title: "Sealed interface + records + instanceof pattern (Java 17)",
      code: `sealed interface Payment permits Upi, Card, Cod { }

record Upi(String vpa) implements Payment { }
record Card(String last4, boolean international) implements Payment { }
final class Cod implements Payment { }

// class Crypto implements Payment { }   // compile error: permits list mein nahi

public class Main {
    static int feePaise(Payment p, int amountPaise) {
        if (p instanceof Upi) {
            return 0;
        } else if (p instanceof Card c) {             // pattern matching: cast + variable ek saath
            int pct = c.international() ? 3 : 2;
            return amountPaise * pct / 100;
        } else if (p instanceof Cod) {
            return 2000;                              // flat Rs 20
        }
        throw new IllegalStateException("unknown payment " + p);
    }

    public static void main(String[] args) {
        Payment[] all = { new Upi("riya@okbank"), new Card("4242", false), new Card("1111", true), new Cod() };
        for (Payment p : all) {
            System.out.println(p.getClass().getSimpleName() + " fee = " + feePaise(p, 50000));
        }
        // Java 21 mein yahi switch se:  return switch (p) { case Upi u -> 0; case Card c -> ...; case Cod x -> 2000; };
        // aur sealed hone ki wajah se default ki zaroorat nahi
    }
}`
    },
    {
      type: "exercise",
      id: "ex-plan-enum",
      title: "Subscription plan enum",
      level: "Easy",
      task: `<p>OTT app ke plans ka enum (starter mein constants diye hain, order dhyaan se dekho):</p>
              <ul><li>Har plan ka <code>price()</code> (₹/month) aur <code>screens()</code> (ek saath kitni screens).</li>
              <li><code>static Plan cheapestFor(int screens)</code>: wo <b>sabse sasta</b> plan jo kam se kam utni screens de. Koi plan na de to <code>null</code>.</li></ul>
              <p>Note: <code>values()</code> declaration order deta hai, price order nahi.</p>`,
      examples: "<code>Plan.cheapestFor(1)</code> → <code>FREE</code><br><code>Plan.cheapestFor(2)</code> → <code>BASIC</code> (₹199, STANDARD ₹499 se sasta)<br><code>Plan.cheapestFor(5)</code> → <code>null</code>",
      userFile: "Solution.java",
      starter: `enum Plan {
    FREE(0, 1), PREMIUM(649, 4), STANDARD(499, 2), BASIC(199, 2);

    private final int price;
    private final int screens;

    Plan(int price, int screens) {
        this.price = price;
        this.screens = screens;
    }

    int price() { return 0; }
    int screens() { return 0; }

    static Plan cheapestFor(int screens) {
        return null;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Check.eq("Plan.BASIC.price()", 199, () -> Plan.BASIC.price());
        Check.eq("cheapestFor(1)", "FREE", () -> String.valueOf(Plan.cheapestFor(1)));
        Check.eq("cheapestFor(2)", "BASIC", () -> String.valueOf(Plan.cheapestFor(2)));
        Check.hiddenFromHere();
        Check.eq("PREMIUM.screens()", 4, () -> Plan.PREMIUM.screens());
        Check.eq("cheapestFor(3)", "PREMIUM", () -> String.valueOf(Plan.cheapestFor(3)));
        Check.eq("cheapestFor(4)", "PREMIUM", () -> String.valueOf(Plan.cheapestFor(4)));
        Check.eq("cheapestFor(5) koi nahi", "null", () -> String.valueOf(Plan.cheapestFor(5)));
        Check.eq("cheapestFor(0)", "FREE", () -> String.valueOf(Plan.cheapestFor(0)));
        Check.eq("valueOf(\\"STANDARD\\").price()", 499, () -> Plan.valueOf("STANDARD").price());
    }
}`,
      hints: [
        "Getters mein field return karo: <code>return price;</code>",
        "<code>for (Plan p : values())</code>: jo plan <code>p.screens &gt;= screens</code> ho, aur ab tak ke best se sasta ho, use best banao.",
        "<code>Plan best = null; ... if (best == null || p.price &lt; best.price) best = p;</code>"
      ],
      solution: `enum Plan {
    FREE(0, 1), PREMIUM(649, 4), STANDARD(499, 2), BASIC(199, 2);

    private final int price;
    private final int screens;

    Plan(int price, int screens) {
        this.price = price;
        this.screens = screens;
    }

    int price() { return price; }
    int screens() { return screens; }

    static Plan cheapestFor(int screens) {
        Plan best = null;
        for (Plan p : values()) {
            if (p.screens >= screens && (best == null || p.price < best.price)) {
                best = p;
            }
        }
        return best;
    }
}`,
      explain: "<p>Enum ke constants objects hain, unke fields normal objects jaise use hote hain. <code>values()</code> declaration order mein aata hai, isliye \"pehla match\" galat answer (PREMIUM) deta; min price track karna padta hai. O(k), k = constants.</p><p>Design note: <code>values()</code> har call pe naya array clone karta hai. Hot path mein ise ek <code>private static final Plan[] ALL = values();</code> mein cache karte hain.</p>"
    },
    {
      type: "exercise",
      id: "ex-range-record",
      title: "Range record with validation",
      level: "Easy",
      task: `<p><code>record Range(int lo, int hi)</code> banao:</p>
              <ul><li>Compact constructor: <code>lo &gt; hi</code> ho to <code>IllegalArgumentException</code> throw karo.</li>
              <li><code>boolean contains(int x)</code>: lo aur hi dono include.</li>
              <li><code>int length()</code>: kitne integers range mein (<code>[3, 5]</code> → 3).</li>
              <li><code>boolean overlaps(Range other)</code>: koi ek bhi common integer ho to true.</li></ul>
              <p>equals/toString khud mat likho, record dega.</p>`,
      examples: "<code>new Range(3, 5).length()</code> → 3<br><code>new Range(1, 4).overlaps(new Range(4, 9))</code> → true<br><code>new Range(1, 2).toString()</code> → <code>\"Range[lo=1, hi=2]\"</code>",
      userFile: "Solution.java",
      starter: `record Range(int lo, int hi) {
    boolean contains(int x) { return false; }
    int length() { return 0; }
    boolean overlaps(Range other) { return false; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static String tryMake(int lo, int hi) {
        try { return new Range(lo, hi).toString(); }
        catch (IllegalArgumentException e) { return "IllegalArgumentException"; }
    }

    public static void main(String[] args) {
        Check.eq("Range(3, 5).length()", 3, () -> new Range(3, 5).length());
        Check.eq("Range(1, 4).overlaps(Range(4, 9))", true, () -> new Range(1, 4).overlaps(new Range(4, 9)));
        Check.eq("new Range(5, 1)", "IllegalArgumentException", () -> tryMake(5, 1));
        Check.hiddenFromHere();
        Check.eq("toString", "Range[lo=1, hi=2]", () -> tryMake(1, 2));
        Check.eq("single point Range(7, 7)", 1, () -> new Range(7, 7).length());
        Check.eq("contains boundary lo", true, () -> new Range(-3, 3).contains(-3));
        Check.eq("contains boundary hi", true, () -> new Range(-3, 3).contains(3));
        Check.eq("contains outside", false, () -> new Range(-3, 3).contains(4));
        Check.eq("no overlap", false, () -> new Range(1, 3).overlaps(new Range(4, 6)));
        Check.eq("inside overlap", true, () -> new Range(1, 10).overlaps(new Range(4, 6)));
        Check.eq("overlap symmetric", true, () -> new Range(4, 6).overlaps(new Range(1, 10)));
        Check.eq("record equality in HashSet", 1, () -> new HashSet<>(List.of(new Range(1, 2), new Range(1, 2))).size());
    }
}`,
      hints: [
        "Compact constructor: <code>Range { if (lo &gt; hi) throw new IllegalArgumentException(\"lo &gt; hi\"); }</code>",
        "contains: <code>x &gt;= lo &amp;&amp; x &lt;= hi</code>. length: <code>hi - lo + 1</code>.",
        "Do ranges overlap karte hain jab ek doosre ke khatam hone se pehle shuru ho: <code>lo &lt;= other.hi &amp;&amp; other.lo &lt;= hi</code>."
      ],
      solution: `record Range(int lo, int hi) {
    Range {
        if (lo > hi) throw new IllegalArgumentException("lo > hi: " + lo + " > " + hi);
    }

    boolean contains(int x) { return x >= lo && x <= hi; }

    int length() { return hi - lo + 1; }

    boolean overlaps(Range other) {
        return lo <= other.hi && other.lo <= hi;
    }
}`,
      explain: "<p>Compact constructor ensure karta hai ki <b>invalid Range kabhi bane hi nahi</b>, to baaki methods ko lo &gt; hi ka case sochna nahi padta. equals/hashCode record ne diye, isliye HashSet duplicate hata deta hai.</p><p>Overlap ka trick (interval problems mein bahut kaam aata hai): do intervals overlap nahi karte sirf tab jab ek doosre ke poora pehle khatam ho. Uska ulta = <code>a.lo &lt;= b.hi &amp;&amp; b.lo &lt;= a.hi</code>. (Edge: <code>length()</code> int overflow kar sakta hai agar range <code>[MIN, MAX]</code> ho; production mein long return karo.)</p>"
    },
    {
      type: "think",
      id: "think-record",
      q: "Interview question: <b>\"Record aur normal class (ya Lombok @Data) mein kya farak hai? Kya record ko JPA entity bana sakte ho?\"</b>",
      rubric: [
        { point: "Record <b>immutable</b> data carrier: private final fields, koi setter nahi, implicitly final class", keys: ["immutable", "final", "no setter", "setter nahi", "data carrier"], weight: 2 },
        { point: "Compiler auto-generate karta hai: constructor, accessors (<code>x()</code>), equals/hashCode/toString; value-based equality", keys: ["equals", "hashcode", "tostring", "accessor", "auto", "generate", "boilerplate"], weight: 2 },
        { point: "Restrictions: extend nahi kar sakta, extra instance fields nahi; interfaces implement kar sakta hai; compact constructor se validation", keys: ["extend", "instance field", "compact", "interface", "validation"] },
        { point: "JPA entity <b>nahi</b>: entity ko no-arg constructor, mutable fields, proxies (non-final class) chahiye", keys: ["jpa", "hibernate", "no-arg", "proxy", "proxies", "mutable", "entity nahi"], weight: 2 },
        { point: "Immutability shallow hai (List component): defensive copy", keys: ["shallow", "copyof", "defensive", "list andar"] }
      ],
      answer: `<p><b>Record</b> Java ka built-in <b>immutable data carrier</b> hai. Components se compiler <code>private final</code> fields, canonical constructor, accessors (<code>name()</code>, <code>getName()</code> nahi), aur value-based <code>equals</code>/<code>hashCode</code>/<code>toString</code> banata hai. Class implicitly <code>final</code>, koi setter nahi.</p>
                <p><b>Normal class / Lombok @Data</b> mutable ho sakti hai (setters), inherit ho sakti hai, extra state rakh sakti hai. Lombok annotation processor hai (external dependency), record language feature hai.</p>
                <p><b>Record restrictions:</b> kisi class ko extend nahi kar sakta (Record extend karta hai), extra instance fields nahi, instance initializer nahi. Interfaces implement kar sakta hai, static members aur methods rakh sakta hai. Validation compact constructor mein.</p>
                <p><b>JPA entity:</b> nahi. Hibernate ko no-arg constructor, mutable fields (dirty checking, lazy loading) aur subclass proxies chahiye, jo final immutable record ke saath possible nahi. Records <b>DTOs/projections</b> ke liye perfect hain (API response, query projection).</p>
                <p><b>Gotcha:</b> immutability shallow hai. <code>List</code> component ho to compact constructor mein <code>List.copyOf</code> karo.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Modern Java dikhane ka aasan tareeka: LLD mein value objects (<code>Money</code>, <code>Location</code>, <code>OrderId</code>) ko <b>record</b> banao, status ko <b>enum</b>, aur fixed variants (payment types) ko <b>sealed interface + records</b>. Bolo: \"invalid state compile time ya constructor pe hi reject ho jaati hai.\" Interviewer ko pata chalta hai ki aap Java 8 pe ruke nahi ho."
    }
  ],
  references: [
    { title: "Enum Types (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html", type: "docs" },
    { title: "Record Classes (Java 17 language guide)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/language/records.html", type: "docs" },
    { title: "Sealed Classes and Interfaces (Java 17 language guide)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/language/sealed-classes-and-interfaces.html", type: "docs" },
    { title: "Records", by: "dev.java", url: "https://dev.java/learn/records/", type: "docs" }
  ]
});
