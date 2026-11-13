// Decorator
registerLesson("lld", "decorator", {
  why: "Jab ek object pe extra features layers mein lagane hon (coffee pe add-ons, HTTP client pe logging + retry + caching), aur har combination ki subclass banana class explosion ho. Decorator wahi composition idea hai jo OOP lesson mein dekha, ek khaas shape mein.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: add-ons ke combinations</h2>
        <p>Chai shop: base <b>Chai ₹20</b>. Add-ons: adrak +₹5, elaichi +₹5, extra milk +₹10, malai +₹15. Customer koi bhi combination le sakta hai, aur ek add-on do baar bhi (double malai).</p>
        <p>Subclass se: <code>ChaiWithAdrak</code>, <code>ChaiWithAdrakAndElaichi</code>... 4 add-ons ke 2⁴ = 16 combinations, double ke saath aur zyada. Ek boolean field per add-on? Naya add-on = Chai class edit, aur double malai nahi hota.</p>`
    },
    {
      type: "think",
      id: "think-decorator-idea",
      q: "Socho: agar har add-on ek <b>object</b> ho jo ek \"drink\" ko andar rakhe aur khud bhi \"drink\" jaisa behave kare (price, description), to <code>new Malai(new Adrak(new Chai()))</code> ka price kaise nikalega?",
      rubric: [
        { point: "Har layer <b>andar wale ka price</b> le ke apna jode (recursion jaisa)", keys: ["andar", "inner", "wrapped", "+ 15", "jode", "add", "recursive", "chain"], weight: 2 },
        { point: "Add-on aur Chai dono <b>same interface</b> (Beverage) implement karein", keys: ["same interface", "interface", "beverage", "drink", "same type"], weight: 2 },
        { point: "Order kaisa bhi, layers kitni bhi; naya add-on = nayi class", keys: ["kitni bhi", "any number", "nayi class", "combination", "double"] }
      ],
      answer: `<pre class="code-static">interface Beverage { int price(); String desc(); }
class Chai implements Beverage { price → 20, desc → "Chai" }
abstract class AddOn implements Beverage {
    protected final Beverage inner;               // has-a Beverage
    AddOn(Beverage inner) { this.inner = inner; }
}
class Adrak extends AddOn { price → inner.price() + 5;  desc → inner.desc() + " + adrak" }
class Malai extends AddOn { price → inner.price() + 15; desc → inner.desc() + " + malai" }

new Malai(new Adrak(new Chai())).price()  →  15 + (5 + 20) = 40</pre>
        <p>Malai ko pata nahi andar kya hai, bas "ek Beverage". Isliye kitni bhi layers, kisi bhi order mein, double malai bhi. Ye <b>Decorator</b> hai: wrapper jo <b>same interface</b> rakhta hai aur behaviour <b>add</b> karta hai.</p>`
    },
    {
      type: "steps",
      title: "Call kaise andar jaati aur bahar aati hai: new Malai(new Adrak(new Chai())).price()",
      steps: [
        { title: "Malai.price() call", html: `<pre class="diagram">[ Malai [ Adrak [ Chai ] ] ]
   ▲ yahan se shuru: "inner.price() + 15"</pre>` },
        { title: "Adrak.price(): inner.price() + 5", html: `<pre class="diagram">[ Malai [ Adrak [ Chai ] ] ]
            ▲ "inner.price() + 5"</pre>` },
        { title: "Chai.price() = 20 (base, wapas lautna shuru)", html: `<pre class="diagram">[ Malai [ Adrak [ Chai=20 ] ] ]</pre>` },
        { title: "Adrak: 20 + 5 = 25 → Malai: 25 + 15 = 40", html: `<pre class="diagram">[ Malai=40 [ Adrak=25 [ Chai=20 ] ] ]</pre><p>Har layer apna kaam karke result aage deti hai. Logging/retry decorators bhi aise hi: pehle kuch karo, andar call karo, baad mein kuch karo.</p>` }
      ]
    },
    {
      type: "code",
      title: "Real use: HTTP client pe logging + retry decorators (runtime pe jodo)",
      code: `import java.util.*;

public class Main {
    interface HttpClient { String get(String url); }

    static class FlakyClient implements HttpClient {          // asli client: kabhi kabhi fail
        private int calls = 0;
        public String get(String url) {
            calls++;
            if (calls % 3 != 0) throw new RuntimeException("timeout");
            return "200 OK from " + url;
        }
    }

    static class LoggingClient implements HttpClient {
        private final HttpClient inner;
        LoggingClient(HttpClient inner) { this.inner = inner; }
        public String get(String url) {
            System.out.println("→ GET " + url);
            String r = inner.get(url);
            System.out.println("← " + r);
            return r;
        }
    }

    static class RetryClient implements HttpClient {
        private final HttpClient inner;
        private final int attempts;
        RetryClient(HttpClient inner, int attempts) { this.inner = inner; this.attempts = attempts; }
        public String get(String url) {
            RuntimeException last = null;
            for (int i = 1; i <= attempts; i++) {
                try { return inner.get(url); }
                catch (RuntimeException e) { last = e; System.out.println("  retry " + i + " failed: " + e.getMessage()); }
            }
            throw last;
        }
    }

    public static void main(String[] args) {
        // Order matter karta hai: logging bahar → ek baar log; retry andar → har attempt retry hota hai
        HttpClient client = new LoggingClient(new RetryClient(new FlakyClient(), 3));
        client.get("/orders/42");
    }
}`,
      note: "Java I/O isi pattern pe bana hai: <code>new BufferedReader(new InputStreamReader(new FileInputStream(f)))</code>. Har layer ek feature (buffering, bytes→chars) jodti hai. Spring ke filters / OkHttp interceptors bhi isi soch ke hain."
    },
    {
      type: "quiz",
      q: "Upar wale code mein order ulta kar diya: <code>new RetryClient(new LoggingClient(new FlakyClient()), 3)</code>. Kya badlega?",
      options: [
        "Kuch nahi",
        "Har attempt pe \"→ GET\" log hoga (3 baar), kyunki logging ab retry ke andar hai",
        "Retry kaam nahi karega",
        "Compile error"
      ],
      answer: 1,
      why: "Decorator ka order behaviour badalta hai. Bahar wala pehle chalta hai. Retry bahar → har retry andar wale (logging) ko dobara call karta hai. Design karte waqt order soch ke chuno (aur interviewer ko batao)."
    },
    {
      type: "exercise",
      id: "ex-chai-decorator",
      title: "Chai shop decorators",
      level: "Easy",
      task: `<p><code>Beverage</code> interface (<code>int price()</code>, <code>String desc()</code>) aur <code>Chai</code> (₹20, <code>"Chai"</code>) diye hain. Decorators likho:</p>
        <ul>
          <li><code>Adrak</code> +5 (<code>" + adrak"</code>), <code>Elaichi</code> +5 (<code>" + elaichi"</code>), <code>Malai</code> +15 (<code>" + malai"</code>)</li>
          <li><code>LargeCup</code>: andar wale ka price <b>1.5 guna</b> (round down, int), desc ke aage <code>"Large "</code> lagao.</li>
        </ul>
        <p>Har decorator constructor mein ek <code>Beverage</code> le. Koi bhi order, koi bhi count.</p>`,
      examples: "<code>new Malai(new Adrak(new Chai()))</code> → 40, <code>\"Chai + adrak + malai\"</code><br><code>new LargeCup(new Adrak(new Chai()))</code> → 37, <code>\"Large Chai + adrak\"</code>",
      userFile: "Solution.java",
      starter: `interface Beverage {
    int price();
    String desc();
}

class Chai implements Beverage {
    public int price() { return 20; }
    public String desc() { return "Chai"; }
}

class Adrak implements Beverage {
    Adrak(Beverage inner) { }
    public int price() { return 25; }          // TODO: hardcode galat hai
    public String desc() { return "Chai + adrak"; }
}

class Elaichi implements Beverage {
    Elaichi(Beverage inner) { }
    public int price() { return 0; }
    public String desc() { return ""; }
}

class Malai implements Beverage {
    Malai(Beverage inner) { }
    public int price() { return 0; }
    public String desc() { return ""; }
}

class LargeCup implements Beverage {
    LargeCup(Beverage inner) { }
    public int price() { return 0; }
    public String desc() { return ""; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<Object> pd(Beverage b) { return List.of(b.price(), b.desc()); }

    public static void main(String[] args) {
        Check.eq("malai(adrak(chai))", List.of(40, "Chai + adrak + malai"), () -> pd(new Malai(new Adrak(new Chai()))));
        Check.eq("large(adrak(chai))", List.of(37, "Large Chai + adrak"), () -> pd(new LargeCup(new Adrak(new Chai()))));
        Check.hiddenFromHere();
        Check.eq("double malai", List.of(50, "Chai + malai + malai"), () -> pd(new Malai(new Malai(new Chai()))));
        Check.eq("adrak(large(chai)): order matter", List.of(35, "Large Chai + adrak"), () -> pd(new Adrak(new LargeCup(new Chai()))));
        Check.eq("adrak + elaichi on plain", List.of(30, "Chai + adrak + elaichi"), () -> pd(new Elaichi(new Adrak(new Chai()))));
        Check.eq("naya base (Coffee) bina decorators badle", List.of(55, "Coffee + malai"), () -> pd(new Malai(new Beverage() {
            public int price() { return 40; }
            public String desc() { return "Coffee"; }
        })));
        Check.eq("large(large(chai))", List.of(45, "Large Large Chai"), () -> pd(new LargeCup(new LargeCup(new Chai()))));
    }
}`,
      hints: [
        "Ek <code>abstract class AddOn implements Beverage { protected final Beverage inner; AddOn(Beverage inner) { this.inner = inner; } }</code> banao, phir decorators usse extend karein (duplication kam).",
        "Adrak: <code>price() { return inner.price() + 5; }</code>, <code>desc() { return inner.desc() + \" + adrak\"; }</code>",
        "LargeCup: <code>inner.price() * 3 / 2</code> (int division round down karta hai), desc <code>\"Large \" + inner.desc()</code>."
      ],
      solution: `interface Beverage {
    int price();
    String desc();
}

class Chai implements Beverage {
    public int price() { return 20; }
    public String desc() { return "Chai"; }
}

abstract class AddOn implements Beverage {
    protected final Beverage inner;
    AddOn(Beverage inner) { this.inner = inner; }
}

class Adrak extends AddOn {
    Adrak(Beverage inner) { super(inner); }
    public int price() { return inner.price() + 5; }
    public String desc() { return inner.desc() + " + adrak"; }
}

class Elaichi extends AddOn {
    Elaichi(Beverage inner) { super(inner); }
    public int price() { return inner.price() + 5; }
    public String desc() { return inner.desc() + " + elaichi"; }
}

class Malai extends AddOn {
    Malai(Beverage inner) { super(inner); }
    public int price() { return inner.price() + 15; }
    public String desc() { return inner.desc() + " + malai"; }
}

class LargeCup extends AddOn {
    LargeCup(Beverage inner) { super(inner); }
    public int price() { return inner.price() * 3 / 2; }
    public String desc() { return "Large " + inner.desc(); }
}`,
      explain: "<p>4 decorator classes se saare combinations (aur repeats) ban gaye. Base badla (Coffee) to bhi koi decorator nahi badla, kyunki sab sirf <code>Beverage</code> interface jaante hain. LargeCup dikhata hai ki order matter karta hai: <code>Large(Adrak)</code> = 37, <code>Adrak(Large)</code> = 35.</p><p>Inheritance yahan sirf <code>AddOn</code> base ke liye hai (common field). Asli kaam composition (<code>inner</code>) kar raha hai.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Decorator pehchanne ka signal: <i>\"features optional hain, mix ho sakte hain, aur runtime pe lagne chahiye\"</i>. Bolo: \"Main inheritance explosion se bachne ke liye decorator use karunga; har decorator same interface implement karega aur andar wale ko delegate.\" Trade-off bhi: bahut layers ho to debugging (stack trace) lamba ho jaata hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Decorator", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/decorator", type: "article" },
    { title: "Design Patterns (GoF): Decorator", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
