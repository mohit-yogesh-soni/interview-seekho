// SOLID principles
registerLesson("lld", "solid", {
  why: "SOLID 5 sawaal hain jo aap apne design se poochte ho taaki naya feature aane pe purana code kam toote. Interview mein definition se zyada ye dekha jaata hai ki aap bure code mein toota hua principle pehchaan ke theek kar pao.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Ek bura code, paanch problems</h2>
        <p>Ye ek invoice service hai. Abhi chalti hai. Padho aur socho: <b>kal kya badlega to ye class tootegi?</b></p>
        <pre class="code-static">class InvoiceService {
    double total(Invoice inv) { ... }                       // hisaab
    String toPdf(Invoice inv) { ... }                       // PDF banana
    void saveToMySql(Invoice inv) {                         // DB
        MySqlConnection c = new MySqlConnection("prod-db"); ...
    }
    void sendEmail(Invoice inv) { ... }                     // email

    double discount(Invoice inv) {
        if (inv.customerType.equals("REGULAR")) return 0;
        else if (inv.customerType.equals("GOLD")) return 0.10;
        else if (inv.customerType.equals("PLATINUM")) return 0.20;   // naya type = yahan if
        return 0;
    }
}</pre>`
    },
    {
      type: "think",
      id: "think-solid-smells",
      q: "Is class mein kaun kaun si <b>alag wajahen</b> hain jinse ise badalna padega? Aur kaun si cheez test karna mushkil hai?",
      rubric: [
        { point: "Bahut saare kaam ek class mein: hisaab, PDF, DB, email (badalne ki kai wajahen)", keys: ["pdf", "email", "db", "database", "bahut kaam", "too many", "responsibil", "alag kaam"], weight: 2 },
        { point: "Naya customer type = <b>purana code edit</b> (if-else badhta hai)", keys: ["if", "else", "naya type", "new type", "platinum", "edit", "modify"], weight: 2 },
        { point: "<b>MySqlConnection</b> andar <code>new</code>: DB badalna / test mein fake lagana mushkil", keys: ["mysql", "new mysqlconnection", "hardcode", "hard code", "test", "mock", "fake", "concrete"], weight: 2 }
      ],
      answer: `<ul>
        <li><b>4 alag wajahen badalne ki:</b> tax rule badla (hisaab), PDF ka design badla, DB MySQL se Postgres, email ki jagah WhatsApp. Har team ek hi file chhedegi. → <b>S</b> toota.</li>
        <li><b>Naya customer type</b> = <code>discount()</code> kholke ek aur <code>else if</code>. Har baar purana tested code chhuna. → <b>O</b> toota.</li>
        <li><b>MySqlConnection andar bana:</b> test chalao to asli prod DB pe jaayega, aur DB badalna = class edit. → <b>D</b> toota.</li>
      </ul><p>Ab ek ek principle uthate hain.</p>`
    },
    {
      type: "text",
      html: `
        <h2>S: Single Responsibility (badalne ki ek hi wajah)</h2>
        <p>"Ek class ek kaam" thoda vague hai. Better definition (Robert C. Martin): <b>class ke badalne ki sirf ek wajah honi chahiye</b>, yaani wo ek hi "actor" (team / stakeholder) ki zaroorat poori kare.</p>
        <pre class="code-static">class InvoiceCalculator { double total(Invoice i) }        // finance team
class InvoicePdfRenderer { byte[] render(Invoice i) }       // design team
class InvoiceRepository  { void save(Invoice i) }           // DB
class InvoiceMailer      { void send(Invoice i) }           // communication</pre>
        <p><b>Kaise pehchaanein:</b> class ka kaam ek sentence mein bolo. "Aur" lagana pade ("ye hisaab karti hai <i>aur</i> PDF banati hai <i>aur</i>..."), to tod do.</p>
        <p><b>Zyada mat todo:</b> har method ki alag class bhi galat hai. Jo cheezein hamesha saath badalti hain, unhe saath rakho.</p>

        <h2>O: Open/Closed (extension ke liye khula, modification ke liye band)</h2>
        <p>Naya behaviour <b>nayi class jod ke</b> aaye, purani class edit karke nahi. Tareeka: jo cheez badalti hai (discount rule) use interface ke peeche rakho.</p>
        <pre class="code-static">interface DiscountPolicy { double rate(); }
class RegularPolicy  implements DiscountPolicy { public double rate() { return 0; } }
class GoldPolicy     implements DiscountPolicy { public double rate() { return 0.10; } }
class PlatinumPolicy implements DiscountPolicy { public double rate() { return 0.20; } }  // naya = nayi file</pre>
        <p>Calculator bas <code>policy.rate()</code> bolta hai. If-else kahin ek jagah (factory / map) mein rehta hai jahan string se policy chuni jaati hai, ya bilkul nahi.</p>`
    },
    {
      type: "text",
      html: `
        <h2>L: Liskov Substitution (child, parent ka wada nibhaaye)</h2>
        <p>Jahan parent chalta hai, wahan child bhi <b>bina surprise ke</b> chalna chahiye. Surprise = exception jo parent nahi phenkta, ya result jo parent ke wade ke khilaaf ho.</p>
        <pre class="code-static">class Rectangle { void setWidth(int w); void setHeight(int h); int area(); }
class Square extends Rectangle {
    void setWidth(int w)  { this.w = w; this.h = w; }   // dono badal diye
    void setHeight(int h) { this.w = h; this.h = h; }
}

void resize(Rectangle r) { r.setWidth(5); r.setHeight(4); assert r.area() == 20; }  // Square pe 16!</pre>
        <p>Maths mein square ek rectangle hai, par <b>is code ke wade</b> ("width aur height alag set hote hain") ke hisaab se nahi. LSP "real world is-a" nahi, <b>behaviour ka is-a</b> hai.</p>
        <p><b>Pehchaan:</b> override mein <code>throw new UnsupportedOperationException()</code>, ya caller mein <code>if (x instanceof Square)</code>. Dono LSP toota hone ke signal hain.</p>

        <h2>I: Interface Segregation (mote interface mat banao)</h2>
        <pre class="code-static">interface Machine { void print(); void scan(); void fax(); }
class BasicPrinter implements Machine {
    public void print() { ... }
    public void scan() { throw new UnsupportedOperationException(); }  // majboori
    public void fax()  { throw new UnsupportedOperationException(); }
}</pre>
        <p>Client ko un methods pe depend nahi karna chahiye jo wo use nahi karta. Chhote interfaces: <code>Printer</code>, <code>Scanner</code>, <code>Fax</code>. Multi-function device teeno implement kare, basic printer sirf ek.</p>

        <h2>D: Dependency Inversion (abstraction pe depend karo)</h2>
        <p>High-level policy (OrderService, InvoiceService) low-level detail (MySQL, SMTP) pe seedha depend na kare. Dono ek <b>interface</b> pe depend karein, aur concrete object <b>bahar se diya jaaye</b> (constructor injection).</p>
        <pre class="code-static">class InvoiceService {
    private final InvoiceRepository repo;          // interface
    InvoiceService(InvoiceRepository repo) { this.repo = repo; }   // bahar se: prod mein MySql, test mein InMemory
}</pre>
        <p>Spring ka <code>@Autowired</code> constructor yahi karta hai. DI (dependency injection) <i>tareeka</i> hai, DIP <i>principle</i> hai.</p>`
    },
    {
      type: "code",
      title: "LSP toota: Square ko Rectangle ki jagah do, aur result dekho",
      code: `public class Main {
    static class Rectangle {
        protected int w, h;
        void setWidth(int w) { this.w = w; }
        void setHeight(int h) { this.h = h; }
        int area() { return w * h; }
    }

    static class Square extends Rectangle {
        @Override void setWidth(int w) { this.w = w; this.h = w; }
        @Override void setHeight(int h) { this.w = h; this.h = h; }
    }

    // Ye method Rectangle ke wade pe likha gaya hai
    static int resizeTo5x4(Rectangle r) {
        r.setWidth(5);
        r.setHeight(4);
        return r.area();
    }

    public static void main(String[] args) {
        System.out.println("Rectangle: " + resizeTo5x4(new Rectangle()) + " (expected 20)");
        System.out.println("Square   : " + resizeTo5x4(new Square()) + " (expected 20, mila alag!)");
        // Fix: Square ko Rectangle ka child mat banao. Dono ek Shape interface (area()) implement karein,
        // aur dono immutable ho (setters nahi): new Rectangle(5, 4), new Square(4).
    }
}`
    },
    {
      type: "pick",
      id: "pick-which-solid",
      q: "Har line padh ke socho kaunsa principle toota. Kaunse pairs <b>sahi</b> hain?",
      options: [
        { text: "<code>ReadOnlyList.add()</code> <code>UnsupportedOperationException</code> phenkta hai jabki <code>List</code> ka wada add karna hai → <b>L</b>", correct: true, why: "Child parent ki jagah use nahi ho sakta bina surprise ke. (Java ki unmodifiable lists bhi isi wajah se aksar LSP ka example banti hain; Javadoc add ko 'optional operation' bolta hai.)" },
        { text: "Har naye payment method ke liye <code>PaymentService.pay()</code> mein naya <code>case</code> → <b>O</b>", correct: true, why: "Extension ke liye purana code modify ho raha hai. Fix: PaymentMethod interface." },
        { text: "<code>UserService</code> ke constructor mein <code>new SmtpEmailSender()</code> → <b>D</b>", correct: true, why: "High-level class concrete detail se bandh gayi. Fix: EmailSender interface inject karo." },
        { text: "<code>Worker</code> interface mein <code>work()</code> aur <code>eat()</code>, aur <code>RobotWorker</code> ko <code>eat()</code> khaali chhodna pada → <b>S</b>", correct: false, why: "Ye <b>I</b> hai: mota interface, client ko bekaar method implement karna pada." },
        { text: "<code>Employee</code> class salary calculate bhi karti hai aur HR report ka HTML bhi banati hai → <b>S</b>", correct: true, why: "Do actors (finance, HR) ki wajah se badlegi." },
        { text: "Ek class ke 3 private helper methods hain → <b>S</b> toota", correct: false, why: "Methods ki ginti SRP nahi hai. Agar teeno ek hi kaam (ek actor) ke liye hain to theek." }
      ]
    },
    {
      type: "exercise",
      id: "ex-solid-refactor",
      title: "Invoice service ko O aur D ke hisaab se theek karo",
      level: "Medium",
      task: `<p>Starter mein <code>InvoiceService</code> ke andar customer type ka if-else hai aur wo <code>MySqlRepo</code> khud banata hai. Isse badlo:</p>
        <ul>
          <li><code>DiscountPolicy</code> interface (<code>double rate()</code>) aur <code>RegularPolicy</code> (0), <code>GoldPolicy</code> (0.10), <code>PlatinumPolicy</code> (0.20).</li>
          <li><code>InvoiceService(InvoiceRepository repo, Map&lt;String, DiscountPolicy&gt; policies)</code>: dono bahar se aayein.</li>
          <li><code>double bill(String customerType, double amount)</code>: <code>amount × (1 − rate)</code>, aur result <code>repo.save(...)</code> karo. Unknown type → <code>IllegalArgumentException</code>.</li>
        </ul>
        <p>Harness apna <b>naya type</b> ("STUDENT" 50%) aur ek <b>fake repository</b> bina aapki class badle jodta hai. Agar InvoiceService sirf interfaces pe depend karti hai to chalega.</p>`,
      examples: "<code>bill(\"GOLD\", 1000)</code> → <code>900.0</code>, aur repo mein 900.0 save hua",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface InvoiceRepository {
    void save(double billedAmount);
}

class MySqlRepo implements InvoiceRepository {
    public void save(double billedAmount) { /* asli DB */ }
}

interface DiscountPolicy {
    double rate();
}

class RegularPolicy implements DiscountPolicy { public double rate() { return 0; } }       // TODO check
class GoldPolicy implements DiscountPolicy { public double rate() { return 0; } }          // TODO 0.10
class PlatinumPolicy implements DiscountPolicy { public double rate() { return 0; } }      // TODO 0.20

class InvoiceService {
    private final InvoiceRepository repo = new MySqlRepo();   // D toota

    InvoiceService(InvoiceRepository repo, Map<String, DiscountPolicy> policies) {
        // TODO
    }

    double bill(String customerType, double amount) {
        double rate;
        if (customerType.equals("REGULAR")) rate = 0;          // O toota
        else if (customerType.equals("GOLD")) rate = 0.10;
        else rate = 0.20;
        double billed = amount * (1 - rate);
        repo.save(billed);
        return billed;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static class FakeRepo implements InvoiceRepository {
        final List<Double> saved = new ArrayList<>();
        public void save(double b) { saved.add(b); }
    }

    static Map<String, DiscountPolicy> standard() {
        Map<String, DiscountPolicy> m = new HashMap<>();
        m.put("REGULAR", new RegularPolicy());
        m.put("GOLD", new GoldPolicy());
        m.put("PLATINUM", new PlatinumPolicy());
        return m;
    }

    public static void main(String[] args) {
        Check.eq("GOLD 1000: [bill, saved]", List.of(900.0, List.of(900.0)), () -> {
            FakeRepo r = new FakeRepo();
            double b = new InvoiceService(r, standard()).bill("GOLD", 1000);
            return List.of(b, r.saved);
        });
        Check.eq("PLATINUM 500", 400.0, () -> new InvoiceService(new FakeRepo(), standard()).bill("PLATINUM", 500));
        Check.hiddenFromHere();
        Check.eq("REGULAR 250", 250.0, () -> new InvoiceService(new FakeRepo(), standard()).bill("REGULAR", 250));
        Check.eq("naya STUDENT type bina InvoiceService badle", 50.0, () -> {
            Map<String, DiscountPolicy> m = standard();
            m.put("STUDENT", () -> 0.5);
            return new InvoiceService(new FakeRepo(), m).bill("STUDENT", 100);
        });
        Check.eq("unknown type → IllegalArgumentException", "IllegalArgumentException", () -> {
            try { new InvoiceService(new FakeRepo(), standard()).bill("VIP", 100); return "no exception"; }
            catch (IllegalArgumentException e) { return "IllegalArgumentException"; }
        });
        Check.eq("fake repo hi use hua (MySqlRepo nahi)", 3, () -> {
            FakeRepo r = new FakeRepo();
            InvoiceService s = new InvoiceService(r, standard());
            s.bill("GOLD", 10); s.bill("REGULAR", 10); s.bill("PLATINUM", 10);
            return r.saved.size();
        });
    }
}`,
      hints: [
        "Teen classes: <code>class GoldPolicy implements DiscountPolicy { public double rate() { return 0.10; } }</code> waise hi baaki do.",
        "InvoiceService mein do <code>private final</code> fields, constructor mein assign. <code>new MySqlRepo()</code> hata do.",
        "<code>bill</code>: <code>DiscountPolicy p = policies.get(type); if (p == null) throw new IllegalArgumentException(...); double billed = amount * (1 - p.rate());</code>"
      ],
      solution: `import java.util.*;

interface InvoiceRepository {
    void save(double billedAmount);
}

class MySqlRepo implements InvoiceRepository {
    public void save(double billedAmount) { /* asli DB */ }
}

interface DiscountPolicy {
    double rate();
}

class RegularPolicy implements DiscountPolicy { public double rate() { return 0; } }
class GoldPolicy implements DiscountPolicy { public double rate() { return 0.10; } }
class PlatinumPolicy implements DiscountPolicy { public double rate() { return 0.20; } }

class InvoiceService {
    private final InvoiceRepository repo;
    private final Map<String, DiscountPolicy> policies;

    InvoiceService(InvoiceRepository repo, Map<String, DiscountPolicy> policies) {
        this.repo = repo;                       // D: bahar se (prod: MySqlRepo, test: fake)
        this.policies = Map.copyOf(policies);
    }

    double bill(String customerType, double amount) {
        DiscountPolicy p = policies.get(customerType);   // O: naya type = map mein nayi entry
        if (p == null) throw new IllegalArgumentException("Unknown customer type: " + customerType);
        double billed = amount * (1 - p.rate());
        repo.save(billed);
        return billed;
    }
}`,
      explain: "<p><b>O:</b> naya customer type = nayi <code>DiscountPolicy</code> class + map mein entry. <code>bill()</code> kabhi nahi khulta. <b>D:</b> InvoiceService ko pata hi nahi ki MySQL hai ya fake; isliye test bina DB ke chala. Unknown type pe chupchaap 0% discount dene ki jagah exception: galti jaldi pakdi jaati hai.</p><p>Map kaun banata hai? App start pe ek jagah (config / Spring beans). If-else poore code mein bikhra nahi, ek jagah simat gaya.</p>"
    },
    {
      type: "think",
      id: "think-solid-transfer",
      q: "Transfer check: <b>\"Ek <code>ReportExporter</code> interface hai jisme <code>toPdf()</code>, <code>toExcel()</code>, <code>toCsv()</code>, <code>emailReport()</code> hain. Ek nayi team ko sirf CSV chahiye aur wo baaki methods mein exception phenk rahi hai.\"</b> Kaunse principles toote, aur design kaisa hoga?",
      rubric: [
        { point: "<b>I</b> (Interface Segregation): mota interface, client ko bekaar methods", keys: ["interface segregation", "isp", " i ", "mota", "fat interface", "segregat", "chhote interface"], weight: 2 },
        { point: "Exceptions phenkna = <b>L</b> bhi toota (substitute nahi ho sakta)", keys: ["liskov", "lsp", "substitut", "exception"], weight: 2 },
        { point: "Fix: <b>ek format ka interface</b> (Exporter: export(report)) + PdfExporter, CsvExporter...", keys: ["exporter", "export(", "pdfexporter", "csvexporter", "har format", "ek method"], weight: 2 },
        { point: "Email alag responsibility (<b>S</b>): ReportMailer alag", keys: ["email alag", "mailer", "srp", "single responsibility", "alag class"] }
      ],
      answer: `<p><b>I</b> toota (client ko 4 methods mile jab use 1 chahiye), aur exception phenkne se <b>L</b> bhi (ye implementation ReportExporter ki jagah use nahi ho sakti). Email bhejna export ka kaam hi nahi: <b>S</b>.</p>
        <pre class="code-static">interface ReportExporter { byte[] export(Report r); String format(); }
class PdfExporter implements ReportExporter { ... }
class CsvExporter implements ReportExporter { ... }      // CSV team bas ye
class ReportMailer { void send(byte[] file, String to) }  // alag kaam</pre>
        <p>Naya format (JSON) = nayi class: <b>O</b> bhi mil gaya. Dekho: ek principle theek karne se baaki apne aap theek hone lagte hain, kyunki sab ek hi idea ke roop hain: <i>jo alag badalta hai, use alag rakho</i>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> SOLID ki definitions sunaane ke bajaye apne design mein naturally bolo: <i>\"Pricing ko alag strategy rakha (Open/Closed), repository interface inject kiya (Dependency Inversion) taaki test mein in-memory chale.\"</i> Aur ek principle har jagah mat ghuseedo: chhote problem mein 10 interfaces = over-engineering (agla lesson)."
    }
  ],
  references: [
    { title: "Clean Architecture (Part III: Design Principles)", by: "Robert C. Martin", type: "book" },
    { title: "Effective Java (3rd ed.), Item 64: Refer to objects by their interfaces", by: "Joshua Bloch", type: "book" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: Design Patterns", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns", type: "article" }
  ]
});
