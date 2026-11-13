// Singleton (design view)
registerLesson("lld", "singleton", {
  why: "Singleton sabse pehla pattern hai jo log seekhte hain, aur sabse zyada galat jagah lagaate hain. Interview mein ye dekha jaata hai ki aap bata pao kab ek hi object sach mein chahiye, aur kab singleton testing aur design ko bigaadta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: kuch cheezein ek hi honi chahiye</h2>
        <p>App mein config (database URL, feature flags) padhne ka ek <code>AppConfig</code> hai. Har class apna <code>new AppConfig()</code> kare to: file baar baar padhi jaayegi, aur agar runtime pe koi flag badla to har object ki alag copy. Hume chahiye: <b>poore process mein ek hi object, aur sabko wahi mile</b>.</p>
        <p>Singleton ke 3 hisse:</p>
        <ol>
          <li><b>private constructor</b>: bahar koi <code>new</code> na kar sake</li>
          <li><b>static field</b> jisme wo ek object</li>
          <li><b>static getInstance()</b>: sabko wahi object</li>
        </ol>
        <pre class="code-static">final class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();   // eager, thread-safe
    private final Map&lt;String, String&gt; values;
    private AppConfig() { values = loadFromFile(); }
    static AppConfig getInstance() { return INSTANCE; }
    String get(String key) { return values.get(key); }
}</pre>
        <p>Thread-safe lazy versions (DCL + volatile, holder idiom, enum) <a href="learn.html?m=concurrency&l=singleton-thread-safe">Concurrency module ke Singleton lesson</a> mein detail mein hain. Yahan sawaal hai: <b>kab use karein?</b></p>`
    },
    {
      type: "text",
      html: `
        <h2>Singleton ki chhupi kimat</h2>
        <table>
          <tr><th>Problem</th><th>Kyun</th></tr>
          <tr><td><b>Hidden dependency</b></td><td><code>OrderService</code> ke andar <code>PaymentClient.getInstance()</code>: constructor dekh ke pata hi nahi chalta ki ye class payment pe depend karti hai.</td></tr>
          <tr><td><b>Testing mushkil</b></td><td>Test mein fake PaymentClient kaise daaloge? Singleton global hai, swap nahi hota. Ek test ne state badli to agla test bhi wahi dekhega.</td></tr>
          <tr><td><b>Global mutable state</b></td><td>Koi bhi kahin se badal sakta hai. Bugs trace karna mushkil, aur multi-thread mein race.</td></tr>
          <tr><td><b>SRP</b></td><td>Class apna kaam bhi karti hai aur "main ek hi rahungi" bhi enforce karti hai.</td></tr>
        </table>
        <h3>Modern tareeka: "ek object" haan, "Singleton pattern" nahi</h3>
        <p>Ek hi object banao (app start pe, ya Spring bean jo by default singleton scope mein hota hai), aur usko <b>constructor se inject</b> karo. Object ek hi raha, par dependency dikhti hai aur test mein fake de sakte ho.</p>
        <pre class="code-static">class OrderService {
    private final PaymentClient payments;              // dikhta hai, test mein fake
    OrderService(PaymentClient payments) { this.payments = payments; }
}
// main(): PaymentClient client = new RazorpayClient(cfg);  → sab services ko yahi ek object</pre>`
    },
    {
      type: "pick",
      id: "pick-singleton-ok",
      q: "Kahan ek-hi-object (singleton) <b>theek</b> hai?",
      options: [
        { text: "Logger jo saari classes use karti hain (stateless, ya thread-safe)", correct: true, why: "Classic theek case. SLF4J ka LoggerFactory bhi per-class cached loggers deta hai." },
        { text: "Database connection pool (ek app mein ek pool)", correct: true, why: "Ek pool chahiye, par usse DI se do (HikariDataSource bean), getInstance() se nahi." },
        { text: "Shopping cart", correct: false, why: "Har user ki alag cart! Singleton cart = sab users ki ek cart. Bahut common galti." },
        { text: "Current logged-in user (web server mein)", correct: false, why: "Server pe hazaaron users ek saath. Per-request context chahiye, global nahi." },
        { text: "App config jo start pe ek baar padha jaata hai aur read-only hai", correct: true, why: "Immutable aur ek baar load: singleton ka sabse safe roop." },
        { text: "Har test ke liye alag state chahiye wala in-memory repository", correct: false, why: "Tests ek doosre ki state dekhenge. Har test naya object le." }
      ]
    },
    {
      type: "exercise",
      id: "ex-singleton-di",
      title: "Singleton se nikal ke injection: test-able OrderService",
      level: "Easy",
      task: `<p>Starter mein <code>OrderService.place(amount)</code> andar <code>RazorpayClient.getInstance().charge(amount)</code> karta hai. Isse badlo:</p>
        <ul>
          <li><code>PaymentClient</code> interface: <code>boolean charge(double amount)</code>.</li>
          <li><code>RazorpayClient</code> isko implement kare (asli: <code>amount &gt; 0</code> pe true). Singleton bana rehne do, koi dikkat nahi.</li>
          <li><code>OrderService(PaymentClient client)</code>: client constructor se aaye. <code>place(amount)</code> return kare <code>"PAID"</code> ya <code>"FAILED"</code>, aur <code>placedCount()</code> successful orders gine.</li>
        </ul>
        <p>Harness fake client deke failure case test karta hai (asli gateway kabhi fail nahi karta, to bina injection ye test hi nahi ho sakta).</p>`,
      examples: "<code>new OrderService(fakeThatFails).place(100)</code> → <code>\"FAILED\"</code>, <code>placedCount()</code> → 0",
      userFile: "Solution.java",
      starter: `interface PaymentClient {
    boolean charge(double amount);
}

class RazorpayClient implements PaymentClient {
    private static final RazorpayClient INSTANCE = new RazorpayClient();
    private RazorpayClient() { }
    static RazorpayClient getInstance() { return INSTANCE; }
    public boolean charge(double amount) { return amount > 0; }
}

class OrderService {
    private int placed = 0;

    OrderService(PaymentClient client) {
        // TODO: client ko save karo
    }

    String place(double amount) {
        boolean ok = RazorpayClient.getInstance().charge(amount);   // hidden dependency
        if (ok) placed++;
        return ok ? "PAID" : "FAILED";
    }

    int placedCount() { return placed; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("asli client, 100 → PAID", "PAID", () -> new OrderService(RazorpayClient.getInstance()).place(100));
        Check.eq("fake fail client → FAILED", "FAILED", () -> new OrderService(a -> false).place(100));
        Check.hiddenFromHere();
        Check.eq("fake: sirf 2 calls succeed → count", 2, () -> {
            int[] calls = {0};
            OrderService s = new OrderService(a -> ++calls[0] <= 2);
            s.place(1); s.place(1); s.place(1); s.place(1);
            return s.placedCount();
        });
        Check.eq("fake ne amount record kiya (dependency sach mein use hui)", List.of(50.0, 70.0), () -> {
            List<Double> seen = new ArrayList<>();
            OrderService s = new OrderService(a -> { seen.add(a); return true; });
            s.place(50); s.place(70);
            return seen;
        });
        Check.eq("same singleton object", true, () -> RazorpayClient.getInstance() == RazorpayClient.getInstance());
    }
}`,
      hints: [
        "<code>private final PaymentClient client;</code> field banao, constructor mein <code>this.client = client;</code>",
        "<code>place</code> mein <code>RazorpayClient.getInstance()</code> ki jagah <code>client.charge(amount)</code>."
      ],
      solution: `interface PaymentClient {
    boolean charge(double amount);
}

class RazorpayClient implements PaymentClient {
    private static final RazorpayClient INSTANCE = new RazorpayClient();
    private RazorpayClient() { }
    static RazorpayClient getInstance() { return INSTANCE; }
    public boolean charge(double amount) { return amount > 0; }
}

class OrderService {
    private final PaymentClient client;
    private int placed = 0;

    OrderService(PaymentClient client) {
        this.client = client;
    }

    String place(double amount) {
        boolean ok = client.charge(amount);
        if (ok) placed++;
        return ok ? "PAID" : "FAILED";
    }

    int placedCount() { return placed; }
}`,
      explain: "<p>Production mein bhi ek hi RazorpayClient object hai (<code>new OrderService(RazorpayClient.getInstance())</code> app start pe), par OrderService ko ye pata nahi. Isliye failure, timeout, retry sab fake se test ho sakte hain. Singleton ka \"ek object\" wala fayda raha, \"hidden global\" wala nuksaan gaya.</p>"
    },
    {
      type: "quiz",
      q: "Spring Boot mein <code>@Service class PriceService</code> by default kaisa bean hai, aur uske andar <code>private double lastPrice;</code> field rakhna kyun khatarnak hai?",
      options: [
        "Har request ka naya object, koi khatra nahi",
        "Singleton scope: saare request threads ek hi object share karte hain, to mutable field pe race condition",
        "Prototype scope, isliye memory leak",
        "Spring fields allow nahi karta"
      ],
      answer: 1,
      why: "Spring beans ka default scope singleton hai (per ApplicationContext ek object). Saare request threads use share karte hain. Isliye services stateless rakho; state request objects ya DB mein."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> LLD mein jab singleton lagao to saath mein bolo: <i>\"Ise main DI se inject karunga taaki test mein fake de sakun; ek object ki guarantee composition root (main / Spring) degi.\"</i> Aur agar \"thread-safe singleton likho\" pucha jaaye to holder idiom ya enum se shuru karo."
    }
  ],
  references: [
    { title: "Refactoring Guru: Singleton", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/singleton", type: "article" },
    { title: "Effective Java (3rd ed.), Item 3 & Item 5 (prefer dependency injection)", by: "Joshua Bloch", type: "book" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
