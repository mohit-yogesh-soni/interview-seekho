// Factory aur Abstract Factory
registerLesson("lld", "factory", {
  why: "Jab object banane ka faisla (kaunsi class) input ya config pe depend kare, to wo if-else poore code mein bikhar jaata hai. Factory us faisle ko ek jagah le aata hai. Interview mein Notification, Payment, Vehicle jaise designs mein ye har baar aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: "new" har jagah</h2>
        <pre class="code-static">// OrderController.java
Notifier n;
if (pref.equals("SMS")) n = new SmsNotifier(twilioKey);
else if (pref.equals("EMAIL")) n = new EmailNotifier(smtpHost, port);
else n = new PushNotifier(fcmKey);

// RefundController.java  ← wahi if-else copy
// SignupController.java  ← wahi if-else copy</pre>
        <p>Naya channel (WhatsApp) = teen files edit. Aur har caller ko pata hona chahiye ki SmsNotifier ko twilioKey chahiye. Caller ko bas <i>"user ki pasand ka notifier do"</i> chahiye tha.</p>`
    },
    {
      type: "think",
      id: "think-factory-why",
      q: "Is code ko kaise badloge taaki naya channel jodne pe sirf <b>ek</b> jagah change ho, aur controllers ko constructor details na pata hon?",
      rubric: [
        { point: "Banane ka logic <b>ek class/method</b> mein (factory)", keys: ["factory", "ek jagah", "one place", "create(", "ek method", "ek class"], weight: 2 },
        { point: "Caller <b>interface</b> (Notifier) se baat kare, concrete class se nahi", keys: ["interface", "notifier", "abstraction"], weight: 2 },
        { point: "Map / registry (type → supplier) se if-else bhi hata sakte hain", keys: ["map", "registry", "supplier", "register"], weight: 1 },
        { point: "Config (keys, host) factory ke paas, callers ke paas nahi", keys: ["config", "key", "constructor details", "dependencies", "factory ke paas"] }
      ],
      answer: `<pre class="code-static">class NotifierFactory {
    private final Config cfg;
    NotifierFactory(Config cfg) { this.cfg = cfg; }

    Notifier create(String channel) {
        return switch (channel) {
            case "SMS"   -&gt; new SmsNotifier(cfg.twilioKey());
            case "EMAIL" -&gt; new EmailNotifier(cfg.smtpHost(), cfg.smtpPort());
            case "PUSH"  -&gt; new PushNotifier(cfg.fcmKey());
            default      -&gt; throw new IllegalArgumentException("Unknown channel " + channel);
        };
    }
}
// Controllers:  Notifier n = factory.create(user.pref());  n.send(...)</pre>
        <p>Switch abhi bhi hai, par <b>sirf ek jagah</b>. Controllers interface se baat karte hain aur constructor details nahi jaante. Ye "Simple Factory" hai. Map-based registry se switch bhi hat sakta hai (exercise).</p>`
    },
    {
      type: "text",
      html: `
        <h2>Teen factory roop (naam confuse karte hain)</h2>
        <table>
          <tr><th>Naam</th><th>Kya</th><th>Example</th></tr>
          <tr><td><b>Static factory method</b></td><td>Constructor ki jagah naam wala static method</td><td><code>List.of()</code>, <code>Integer.valueOf()</code> (cache se de sakta hai), <code>Money.inr("10")</code></td></tr>
          <tr><td><b>Simple Factory</b></td><td>Ek class jo input dekh ke sahi implementation banaye</td><td><code>NotifierFactory.create("SMS")</code></td></tr>
          <tr><td><b>Factory Method</b> (GoF)</td><td>Parent class ek abstract <code>create...()</code> method rakhti hai; subclass decide karti hai kaunsa object</td><td><code>Logistics.createTransport()</code>: <code>RoadLogistics</code> Truck banaye, <code>SeaLogistics</code> Ship</td></tr>
          <tr><td><b>Abstract Factory</b> (GoF)</td><td>Ek factory jo <b>related objects ki family</b> banaye, taaki families mix na hon</td><td>UI theme: <code>DarkThemeFactory</code> → DarkButton + DarkCheckbox; <code>LightThemeFactory</code> → Light...</td></tr>
        </table>
        <p><b>Abstract Factory kab:</b> jab objects <i>saath</i> match hone chahiye. Payment ka example: India ke liye <code>RazorpayGateway</code> + <code>GstInvoice</code>, US ke liye <code>StripeGateway</code> + <code>SalesTaxInvoice</code>. Region factory ek saath sahi jodi deti hai; galti se Stripe + GST mix nahi hoga.</p>
        <pre class="diagram">
«interface» RegionFactory  ─ createGateway(): Gateway, createInvoice(): Invoice
      ▲                         ▲
IndiaFactory               UsFactory
 → RazorpayGateway          → StripeGateway
 → GstInvoice               → SalesTaxInvoice</pre>`
    },
    {
      type: "code",
      title: "Abstract Factory: region ke hisaab se matching gateway + invoice",
      code: `public class Main {
    interface Gateway { String charge(double amt); }
    interface Invoice { String render(double amt); }

    interface RegionFactory {
        Gateway createGateway();
        Invoice createInvoice();
    }

    static class IndiaFactory implements RegionFactory {
        public Gateway createGateway() { return amt -> "Razorpay charged ₹" + amt; }
        public Invoice createInvoice() { return amt -> "GST invoice: ₹" + amt + " + 18% = ₹" + Math.round(amt * 1.18); }
    }

    static class UsFactory implements RegionFactory {
        public Gateway createGateway() { return amt -> "Stripe charged $" + amt; }
        public Invoice createInvoice() { return amt -> "Sales tax invoice: $" + amt; }
    }

    // Checkout ko region ka pata hi nahi; factory family deti hai
    static void checkout(RegionFactory f, double amt) {
        System.out.println(f.createGateway().charge(amt));
        System.out.println(f.createInvoice().render(amt));
    }

    public static void main(String[] args) {
        checkout(new IndiaFactory(), 1000);
        checkout(new UsFactory(), 20);
    }
}`
    },
    {
      type: "quiz",
      q: "<code>Integer.valueOf(100) == Integer.valueOf(100)</code> true kyun deta hai jabki <code>new Integer(100) == new Integer(100)</code> false? (Static factory ka ek fayda.)",
      options: [
        "valueOf hamesha naya object banata hai",
        "Static factory naya object banane ke liye majboor nahi: valueOf -128..127 ke liye cached object lautata hai",
        "== values compare karta hai",
        "Compiler dono ko same bana deta hai"
      ],
      answer: 1,
      why: "Constructor hamesha naya object banata hai; static factory cache/reuse kar sakta hai, subclass lauta sakta hai, aur uska naam ho sakta hai. Integer cache ki default range -128..127 hai. (Objects ko == se mat compare karo, equals use karo.)"
    },
    {
      type: "exercise",
      id: "ex-factory-registry",
      title: "Registry wali factory: switch ke bina naye channels",
      level: "Medium",
      task: `<p><code>NotifierFactory</code> banao jisme switch/if-else <b>nahi</b> ho:</p>
        <ul>
          <li><code>void register(String channel, Supplier&lt;Notifier&gt; maker)</code>: naya channel jodo. Channel names case-insensitive (<code>"sms"</code> = <code>"SMS"</code>). Same channel dobara register → <code>IllegalStateException</code>.</li>
          <li><code>Notifier create(String channel)</code>: <b>har call pe naya object</b> (supplier se). Unknown → <code>IllegalArgumentException</code>.</li>
          <li><code>Set&lt;String&gt; channels()</code>: registered names (uppercase), sorted.</li>
        </ul>
        <p><code>Notifier</code> interface diya hai: <code>String send(String to, String msg)</code>.</p>`,
      examples: "<code>f.register(\"sms\", SmsNotifier::new); f.create(\"SMS\").send(\"98\", \"hi\")</code> → <code>\"SMS→98: hi\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.Supplier;

interface Notifier {
    String send(String to, String msg);
}

class SmsNotifier implements Notifier {
    public String send(String to, String msg) { return "SMS→" + to + ": " + msg; }
}

class EmailNotifier implements Notifier {
    public String send(String to, String msg) { return "EMAIL→" + to + ": " + msg; }
}

class NotifierFactory {
    void register(String channel, Supplier<Notifier> maker) {
        // TODO
    }

    Notifier create(String channel) {
        if (channel.equals("SMS")) return new SmsNotifier();      // TODO: switch hatao
        return new EmailNotifier();
    }

    Set<String> channels() {
        return Set.of();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static NotifierFactory std() {
        NotifierFactory f = new NotifierFactory();
        f.register("sms", SmsNotifier::new);
        f.register("Email", EmailNotifier::new);
        return f;
    }

    public static void main(String[] args) {
        Check.eq("create SMS (case-insensitive)", "SMS→98: hi", () -> std().create("SMS").send("98", "hi"));
        Check.eq("create email", "EMAIL→a@b: yo", () -> std().create("email").send("a@b", "yo"));
        Check.hiddenFromHere();
        Check.eq("naya WhatsApp channel bina factory badle", "WA→r: ok", () -> {
            NotifierFactory f = std();
            f.register("whatsapp", () -> (to, m) -> "WA→" + to + ": " + m);
            return f.create("WhatsApp").send("r", "ok");
        });
        Check.eq("unknown → IllegalArgumentException", "IAE", () -> {
            try { std().create("fax"); return "no exception"; } catch (IllegalArgumentException e) { return "IAE"; }
        });
        Check.eq("duplicate register → IllegalStateException", "ISE", () -> {
            NotifierFactory f = std();
            try { f.register("SMS", SmsNotifier::new); return "no exception"; } catch (IllegalStateException e) { return "ISE"; }
        });
        Check.eq("har create naya object", false, () -> { NotifierFactory f = std(); return f.create("sms") == f.create("sms"); });
        Check.eq("channels sorted uppercase", List.of("EMAIL", "SMS"), () -> new ArrayList<>(std().channels()));
    }
}`,
      hints: [
        "Field: <code>private final Map&lt;String, Supplier&lt;Notifier&gt;&gt; makers = new HashMap&lt;&gt;();</code> Key hamesha <code>channel.toUpperCase()</code>.",
        "register: <code>if (makers.putIfAbsent(key, maker) != null) throw new IllegalStateException(...)</code>. create: <code>Supplier s = makers.get(key); if (s == null) throw ...; return s.get();</code>",
        "channels: <code>new TreeSet&lt;&gt;(makers.keySet())</code>"
      ],
      solution: `import java.util.*;
import java.util.function.Supplier;

interface Notifier {
    String send(String to, String msg);
}

class SmsNotifier implements Notifier {
    public String send(String to, String msg) { return "SMS→" + to + ": " + msg; }
}

class EmailNotifier implements Notifier {
    public String send(String to, String msg) { return "EMAIL→" + to + ": " + msg; }
}

class NotifierFactory {
    private final Map<String, Supplier<Notifier>> makers = new HashMap<>();

    void register(String channel, Supplier<Notifier> maker) {
        String key = channel.toUpperCase();
        if (makers.putIfAbsent(key, maker) != null) {
            throw new IllegalStateException("Already registered: " + key);
        }
    }

    Notifier create(String channel) {
        Supplier<Notifier> maker = makers.get(channel.toUpperCase());
        if (maker == null) throw new IllegalArgumentException("Unknown channel: " + channel);
        return maker.get();
    }

    Set<String> channels() {
        return new TreeSet<>(makers.keySet());
    }
}`,
      explain: "<p>Ab factory ko kisi concrete class ka naam hi nahi pata: naya channel = ek <code>register</code> call (app start pe ya plugin se). Ye Open/Closed ka poora roop hai. Spring andar se yahi karta hai: saare <code>Notifier</code> beans ka map inject kar sakte ho (<code>Map&lt;String, Notifier&gt;</code>).</p><p>Trade-off: switch wali factory padhne mein seedhi hai aur compile time pe saari types dikhti hain. Types fixed aur kam hon to switch theek; plugins/bahar se aane wale types hon to registry.</p>"
    },
    {
      type: "think",
      id: "think-factory-transfer",
      q: "Transfer check: <b>\"Ek document editor PDF, Word aur Markdown files kholta hai. Har format ka alag Parser aur alag Renderer hai, aur PDF parser ko Word renderer ke saath mix nahi karna.\"</b> Kaunsa factory roop aur kyun?",
      rubric: [
        { point: "<b>Abstract Factory</b>: format ki family (parser + renderer saath)", keys: ["abstract factory", "family", "families", "saath", "pair"], weight: 2 },
        { point: "Interface: DocumentFactory { createParser(); createRenderer(); } + PdfFactory, WordFactory, MarkdownFactory", keys: ["createparser", "createrenderer", "pdffactory", "wordfactory", "documentfactory", "formatfactory"], weight: 2 },
        { point: "File extension se sahi factory chuno (ek simple factory / map)", keys: ["extension", ".pdf", "map", "simple factory", "registry"] },
        { point: "Mix-up compile/design time pe hi ruk jaata hai", keys: ["mix", "galat jodi", "consistent", "match"] }
      ],
      answer: `<p>Do related objects (Parser + Renderer) jo <b>saath match</b> hone chahiye = <b>Abstract Factory</b>.</p>
        <pre class="code-static">interface DocumentFactory { Parser createParser(); Renderer createRenderer(); }
class PdfFactory implements DocumentFactory { ... }   class WordFactory ... class MarkdownFactory ...

DocumentFactory f = factoriesByExtension.get(".pdf");   // simple map
Document d = f.createParser().parse(bytes);
f.createRenderer().render(d);</pre>
        <p>Editor ko formats ka pata nahi; naya format (ODT) = ek nayi factory + map entry. Aur PDF parser + Word renderer jaisi galat jodi ban hi nahi sakti, kyunki dono ek hi factory se aate hain.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Factory lagaate waqt bolo <i>kya chhupa rahe ho</i>: \"callers ko sirf Notifier interface dikhega; kaunsi class aur uske constructor args factory ke andar.\" Aur GoF ke Factory Method vs Abstract Factory ka farak ek line mein: <i>method = ek product, subclass decide kare; abstract factory = products ki family.</i>"
    }
  ],
  references: [
    { title: "Refactoring Guru: Factory Method", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/factory-method", type: "article" },
    { title: "Refactoring Guru: Abstract Factory", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/abstract-factory", type: "article" },
    { title: "Effective Java (3rd ed.), Item 1: Consider static factory methods instead of constructors", by: "Joshua Bloch", type: "book" }
  ]
});
