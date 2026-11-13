// Encapsulation, access modifiers, static
registerLesson("java", "encapsulation-static", {
  why: "\"Encapsulation kya hai?\" ka jawab \"private fields + getters/setters\" dene se interviewer khush nahi hota. Invariants, defensive copies, static ka sahi use aur final ka asli matlab: ye senior level jawab hai. Init order ke output questions bhi yahin se aate hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Encapsulation: data chhupao, rules ek jagah rakho</h2>
              <p>Agar <code>balance</code> field public hai to koi bhi kahin se <code>acc.balance = -5000</code> likh sakta hai. Bug kahan se aaya, dhoondhna mushkil. Encapsulation ka matlab: <b>state private</b>, aur badlav sirf un methods se jo <b>rules (invariants)</b> check karte hain. "Balance kabhi negative nahi" ab sirf ek class ki zimmedari hai.</p>
              <h3>Access modifiers</h3>
              <table>
                <tr><th>Modifier</th><th>Same class</th><th>Same package</th><th>Subclass (doosra package)</th><th>Kahin bhi</th></tr>
                <tr><td><code>private</code></td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                <tr><td>(kuch nahi) = <b>default / package-private</b></td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
                <tr><td><code>protected</code></td><td>✅</td><td>✅</td><td>✅ (inheritance ke through)</td><td>❌</td></tr>
                <tr><td><code>public</code></td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
              </table>
              <ul>
                <li>Top-level class sirf <code>public</code> ya default ho sakti hai (private/protected sirf nested classes ke liye).</li>
                <li><code>protected</code> mein package access bhi shaamil hai. Ye aksar log bhool jaate hain.</li>
                <li>Rule of thumb: sab kuch <b>sabse kam access</b> se shuru karo (private). Zaroorat pade to kholo.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: "Ek field bina kisi modifier ke hai: <code>int stock;</code> (class <code>com.shop.Inventory</code> mein). Kaun isko access kar sakta hai?",
      options: [
        "Sirf Inventory class",
        "com.shop package ki saari classes",
        "com.shop ki classes + kisi bhi package ki subclasses",
        "Sab"
      ],
      answer: 1,
      why: "Default (package-private) access sirf <b>same package</b> tak hai. Doosre package ki subclass ko bhi nahi milta. Wo <code>protected</code> ka feature hai."
    },
    {
      type: "text",
      html: `
              <h2>Getters / setters: kab haan, kab nahi</h2>
              <p>Har private field ke liye blind getter + setter likhna asal mein field ko public karne jaisa hi hai, sirf lamba. <code>setBalance(-5000)</code> bhi utna hi khatarnak hai.</p>
              <ul>
                <li><b>Setter ki jagah behaviour method</b>: <code>deposit(amount)</code>, <code>withdraw(amount)</code>, <code>cancel()</code>. Method naam business ka kaam batata hai aur rules check karta hai.</li>
                <li><b>Jo nahi badalna, uska setter hi mat do</b> (<code>id</code>, <code>createdAt</code>). Field <code>final</code> rakho.</li>
                <li><b>Getter mutable object return kare</b> (List, Date, array) to caller andar ka data badal sakta hai. <b>Defensive copy</b> ya unmodifiable view return karo.</li>
                <li>Getters theek hain jab data dikhana zaroori ho (UI, JSON). Frameworks (Jackson, JPA) bhi getters/setters expect karte hain, wahan DTO alag rakho.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Getter se encapsulation leak, aur fix",
      code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class LeakyCart {
    private final List<String> items = new ArrayList<>();
    void add(String item) { if (items.size() < 3) items.add(item); }   // rule: max 3 items
    List<String> getItems() { return items; }                         // andar ki list hi de di!
}

class SafeCart {
    private final List<String> items = new ArrayList<>();
    void add(String item) { if (items.size() < 3) items.add(item); }
    List<String> getItems() { return Collections.unmodifiableList(items); }   // read-only view
}

public class Main {
    public static void main(String[] args) {
        LeakyCart leaky = new LeakyCart();
        leaky.add("Dosa");
        leaky.getItems().add("Idli");
        leaky.getItems().add("Vada");
        leaky.getItems().add("Upma");     // max 3 ka rule toot gaya, class ko pata bhi nahi
        System.out.println("Leaky: " + leaky.getItems());

        SafeCart safe = new SafeCart();
        safe.add("Dosa");
        try {
            safe.getItems().add("Idli");
        } catch (UnsupportedOperationException e) {
            System.out.println("Safe: bahar se add allowed nahi");
        }
        System.out.println("Safe: " + safe.getItems());
    }
}`,
      note: "<code>Collections.unmodifiableList</code> ek read-only <b>view</b> hai (andar ki list badli to view mein dikhega). Poori snapshot copy chahiye to <code>List.copyOf(items)</code>."
    },
    {
      type: "text",
      html: `
              <h2><code>static</code>: class ka, object ka nahi</h2>
              <ul>
                <li><b>static variable</b>: poori class ki <b>ek hi copy</b>, saare objects share karte hain. Use: counters, constants, shared cache.</li>
                <li><b>static method</b>: object ke bina call (<code>Math.max</code>). Iske andar <code>this</code> nahi hota, isliye instance fields/methods seedha use nahi kar sakte.</li>
                <li><b>static block</b> <code>static { ... }</code>: class <b>pehli baar load/initialize</b> hone pe <b>ek baar</b> chalta hai. Use: static data setup (config map, lookup table).</li>
                <li><b>instance block</b> <code>{ ... }</code>: har <code>new</code> pe, constructor body se <b>pehle</b> chalta hai.</li>
              </ul>
              <h3>Initialization order (ek class)</h3>
              <ol>
                <li>Class pehli baar use hui: static fields + static blocks, <b>likhe hue order mein</b>, ek baar.</li>
                <li>Har <code>new</code>: instance fields + instance blocks (likhe order mein), phir constructor body.</li>
              </ol>
              <p>Static ka nuksaan: global state jaisa hai. Tests mein reset karna mushkil, aur multiple threads ek saath badlein to race condition. Mutable static state kam se kam rakho.</p>`
    },
    {
      type: "code",
      title: "Static counter aur init order: output pehle guess karo",
      code: `class Rider {
    static int count = 0;              // sabka ek
    static final String APP;
    final int id;
    String name;

    static {
        APP = "Rapido";
        System.out.println("static block (ek hi baar)");
    }

    {
        System.out.println("instance block");
    }

    Rider(String name) {
        count++;
        this.id = count;
        this.name = name;
        System.out.println("constructor: " + name + " id=" + id);
    }

    static int total() {
        // return name;   // compile error: static method mein instance field nahi
        return count;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("main shuru");
        Rider a = new Rider("Ravi");
        Rider b = new Rider("Sita");
        System.out.println(Rider.total() + " riders on " + Rider.APP);
        System.out.println(a.count);   // chalta hai par galat style: object se static access
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class Box {
    static { System.out.print("S "); }
    { System.out.print("I "); }
    Box() { System.out.print("C "); }
}
// main:
new Box();
new Box();</pre>`,
      options: ["S I C S I C", "S I C I C", "I C S I C", "S C I C I"],
      answer: 1,
      why: "Static block class ke pehli baar initialize hone pe <b>ek hi baar</b>: <code>S</code>. Har object pe instance block constructor se pehle: <code>I C</code>, phir <code>I C</code>. Total <code>S I C I C</code>."
    },
    {
      type: "code",
      expectError: true,
      title: "Static context se instance field: compile error padho",
      code: `public class Main {
    int visits = 0;       // instance field (static nahi)

    public static void main(String[] args) {
        visits++;         // main static hai, iske paas koi object (this) nahi
        System.out.println(visits);
    }
}`,
      note: "Error: <i>non-static variable visits cannot be referenced from a static context</i>. Fix: <code>static int visits</code>, ya <code>Main m = new Main(); m.visits++;</code>."
    },
    {
      type: "text",
      html: `
              <h2><code>final</code>: 3 jagah, 3 matlab</h2>
              <table>
                <tr><th>Kahan</th><th>Matlab</th></tr>
                <tr><td><b>Variable / field</b></td><td>Ek hi baar assign. Field ho to constructor khatam hone tak assign hona chahiye (<b>blank final</b>).</td></tr>
                <tr><td><b>Method</b></td><td>Subclass override nahi kar sakti.</td></tr>
                <tr><td><b>Class</b></td><td>Koi extend nahi kar sakta (<code>String</code>, <code>Integer</code> final hain).</td></tr>
              </table>
              <p><b>Sabse bada trap:</b> <code>final</code> reference ko final banata hai, <b>object ko nahi</b>. <code>final List&lt;String&gt; list</code> mein <code>list.add()</code> chalega, bas <code>list = new ArrayList&lt;&gt;()</code> nahi. Object immutable chahiye to uske andar ka design immutable hona chahiye.</p>
              <p>Constants: <code>static final int MAX_ITEMS = 10;</code> (naam UPPER_SNAKE_CASE). Primitive/String constants compile-time pe hi value se replace ho jaate hain.</p>`
    },
    {
      type: "code",
      title: "final reference vs final object",
      code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static final int MAX_ITEMS = 3;

    public static void main(String[] args) {
        final List<String> tags = new ArrayList<>();
        tags.add("veg");          // chalta hai: object badla, reference nahi
        tags.add("spicy");
        // tags = new ArrayList<>();   // compile error: final reference dobara assign nahi
        System.out.println(tags);

        final int[] scores = {10, 20};
        scores[0] = 99;           // chalta hai
        System.out.println(scores[0]);

        final int limit;
        limit = MAX_ITEMS;        // blank final: ek baar assign
        // limit = 5;             // compile error
        System.out.println(limit);

        List<String> frozen = List.of("a", "b");   // asli immutable list
        try {
            frozen.add("c");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of immutable hai");
        }
    }
}`
    },
    {
      type: "exercise",
      id: "ex-ticket",
      title: "Ticket: static counter se unique id",
      level: "Easy",
      task: `<p>IRCTC jaisi <code>Ticket</code> class banao:</p>
              <ul><li><code>Ticket(String passenger)</code>: har naye ticket ko agla id mile: 1, 2, 3...</li>
              <li><code>int getId()</code>, <code>String getPassenger()</code>. Id aur passenger baad mein badal na sakein (no setters, final fields).</li>
              <li><code>static int issuedCount()</code>: ab tak kitne tickets bane.</li></ul>
              <p>Starter mein counter galat jagah hai. Run karke dekho.</p>`,
      examples: "<code>new Ticket(\"Riya\").getId()</code> → 1, phir <code>new Ticket(\"Aman\").getId()</code> → 2, <code>Ticket.issuedCount()</code> → 2",
      userFile: "Solution.java",
      starter: `class Ticket {
    private int counter = 0;      // har object ka apna counter?
    private int id;
    private String passenger;

    Ticket(String passenger) {
        counter++;
        id = counter;
        this.passenger = passenger;
    }

    int getId() { return id; }
    String getPassenger() { return passenger; }

    static int issuedCount() {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("pehla ticket id", 1, () -> new Ticket("Riya").getId());
        Check.eq("doosra ticket id", 2, () -> new Ticket("Aman").getId());
        Check.eq("issuedCount()", 2, () -> Ticket.issuedCount());
        Check.hiddenFromHere();
        Check.eq("getPassenger()", "Zoya", () -> new Ticket("Zoya").getPassenger());
        Check.eq("agle 3 ids", List.of(4, 5, 6), () -> {
            List<Integer> ids = new ArrayList<>();
            for (String p : new String[]{"A", "B", "C"}) ids.add(new Ticket(p).getId());
            return ids;
        });
        Check.eq("issuedCount() after 6", 6, () -> Ticket.issuedCount());
        Check.eq("purane ticket ka id nahi badla", 7, () -> {
            Ticket t = new Ticket("K");
            new Ticket("L");
            new Ticket("M");
            return t.getId();
        });
    }
}`,
      hints: [
        "Instance field har object ka alag hota hai, to har naya ticket <code>counter = 0</code> se shuru karta hai.",
        "<code>private static int counter = 0;</code> karo. Constructor mein <code>id = ++counter;</code>",
        "Id aur passenger ko <code>private final</code> banao, aur issuedCount mein <code>return counter;</code>"
      ],
      solution: `class Ticket {
    private static int counter = 0;
    private final int id;
    private final String passenger;

    Ticket(String passenger) {
        this.id = ++counter;
        this.passenger = passenger;
    }

    int getId() { return id; }
    String getPassenger() { return passenger; }

    static int issuedCount() {
        return counter;
    }
}`,
      explain: "<p>Counter <b>class ka</b> hai (static), to saare tickets ek hi counter share karte hain. Har object ka <code>id</code> instance field hai aur <code>final</code>, to assign hone ke baad fixed.</p><p>Senior follow-up: multiple threads ek saath ticket banayein to <code>++counter</code> atomic nahi hai, do tickets ko same id mil sakta hai. Fix: <code>AtomicInteger</code> (<code>counter.incrementAndGet()</code>). Distributed system mein to DB sequence / Snowflake-style id generator.</p>"
    },
    {
      type: "think",
      id: "think-encapsulation",
      q: "Interview question: <b>\"Kya har field ke liye getter/setter likh dena encapsulation hai? Achhi encapsulation kaisi dikhti hai?\"</b>",
      rubric: [
        { point: "Nahi: blind setters field ko public karne jaise hain, koi rule check nahi", keys: ["nahi", "public jaisa", "public karne", "no", "blind", "koi check nahi"], weight: 2 },
        { point: "Encapsulation = state private + <b>invariants</b> (rules) class khud enforce kare", keys: ["invariant", "rule", "validation", "validate", "consistent", "valid state"], weight: 2 },
        { point: "Setter ki jagah <b>behaviour methods</b> (deposit, cancel) jo business ka kaam batate hain", keys: ["behaviour", "behavior", "deposit", "withdraw", "business method", "intent"] },
        { point: "Mutable fields (List, Date) ke getter mein <b>defensive copy</b> / unmodifiable", keys: ["defensive", "copy", "unmodifiable", "copyof", "read-only", "immutable"], weight: 2 },
        { point: "Jo nahi badalna use <code>final</code> rakho, setter mat do", keys: ["final", "no setter", "setter mat", "setter nahi"] }
      ],
      answer: `<p><b>Nahi.</b> Har field pe <code>getX()</code>/<code>setX()</code> likhne se field technically private hai, par koi bhi kuch bhi set kar sakta hai. Ye bas lamba public field hai.</p>
                <p><b>Achhi encapsulation:</b></p>
                <ol><li>State private, aur class apne <b>invariants</b> khud enforce kare (balance negative nahi, cart mein max 10 items, status PLACED → DELIVERED seedha nahi).</li>
                <li>Setters ki jagah <b>intent wale methods</b>: <code>deposit()</code>, <code>cancelOrder()</code>, <code>markDelivered()</code>.</li>
                <li>Jo kabhi nahi badalna (<code>id</code>, <code>createdAt</code>) wo <code>final</code>, koi setter nahi.</li>
                <li>Mutable cheezein (List, array, Date) bahar dete waqt <b>defensive copy</b> (<code>List.copyOf</code>) ya unmodifiable view. Constructor mein bhi aane wali list ki copy lo.</li></ol>
                <p>Fayda: bug ek jagah, rules ek jagah. Internals badal sakte ho (jaise balance ko long paise mein store karna) bina callers ko chhue.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Init order ke question mein sequence bolo: <b>\"static (ek baar, class load pe) → instance fields/blocks → constructor body\"</b>. Inheritance ho to: parent static → child static → parent instance+constructor → child instance+constructor (agle lesson mein). Aur final ke baare mein hamesha add karo: <b>\"final reference, object nahi\"</b>."
    }
  ],
  references: [
    { title: "Controlling Access to Members of a Class", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html", type: "docs" },
    { title: "Understanding Class Members (static)", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html", type: "docs" },
    { title: "Initializing Fields (static and instance blocks)", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/initial.html", type: "docs" },
    { title: "Effective Java (3rd ed.), Items 15-17 (minimize accessibility, mutability)", by: "Joshua Bloch", type: "book" }
  ]
});
