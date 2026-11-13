// DRY, KISS, YAGNI aur code smells
registerLesson("lld", "dry-kiss-yagni", {
  why: "SOLID aur patterns sikhne ke baad sabse common galti hai har jagah unhe laga dena. Ye teen principles brake ka kaam karte hain. Interviewer ko 45 minute mein simple, chalne wala design chahiye, 15 interfaces wala framework nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>DRY: Don't Repeat Yourself</h2>
        <p>Asli matlab (The Pragmatic Programmer): <b>har knowledge (rule / fact) ka system mein ek hi authoritative ghar ho</b>. Code ki do lines same dikhna DRY violation nahi hai; ek hi <i>rule</i> do jagah likha hona hai.</p>
        <pre class="code-static">// ❌ GST rule teen jagah. Rate badla to ek jagah bhool gaye = galat bill
double cartTotal    = sub * 1.18;
double invoiceTotal = amount + amount * 0.18;
double refund       = paid / 1.18;

// ✅ ek ghar
final class Tax { static final double GST = 0.18; static double withGst(double x) { return x * (1 + GST); } }</pre>
        <p><b>Ulti galti (galat DRY):</b> do cheezein aaj same dikhti hain par alag wajah se badlengi (jaise customer address validation aur warehouse address validation). Unhe zabardasti ek function mein jodna = baad mein us function mein <code>if (isWarehouse)</code> flags. Rule: <i>duplication is far cheaper than the wrong abstraction</i> (Sandi Metz). Teesri baar repeat ho tab socho (Rule of Three).</p>

        <h2>KISS: Keep It Simple</h2>
        <p>Sabse simple design jo <b>aaj ki requirements</b> poori kare aur padhne mein aasaan ho. Clever code (one-liner streams jinhe samajhne mein 5 minute lagein, generic framework) debugging ke time mehenga padta hai.</p>

        <h2>YAGNI: You Aren't Gonna Need It</h2>
        <p>"Shayad kal chahiye" wala feature/abstraction aaj mat banao. Kal requirement aayi to tab banao, us waqt ki asli jaankari ke saath. (Extreme Programming se aaya principle.)</p>
        <p><b>Par dhyaan:</b> YAGNI ka matlab ye nahi ki extensibility bhool jao. Interview mein agar interviewer khud bole "naye vehicle types aayenge", to wo <i>aaj ki requirement</i> hai: interface lagao. Agar kisi ne kuch nahi bola, to 1 implementation ke liye 3 layer ka abstraction mat banao.</p>`
    },
    {
      type: "pick",
      id: "pick-overeng",
      q: "Requirement: <i>\"Ek chhota CLI tool jo ek CSV file padh ke total sales print kare.\"</i> Kaunse design choices <b>over-engineering</b> hain?",
      options: [
        { text: "<code>FileReaderFactory</code>, <code>AbstractFileReader</code>, <code>CsvFileReaderImpl</code> teen classes, jabki sirf CSV padhna hai", correct: true, why: "Ek implementation ke liye factory + abstract class. YAGNI." },
        { text: "Plugin system taaki future mein XML/JSON bhi support ho", correct: true, why: "Kisi ne maanga nahi. Aayega to tab banao." },
        { text: "Parsing ka logic ek method mein, printing alag method mein", correct: false, why: "Ye sasta aur saaf hai. Testing bhi aasaan." },
        { text: "Total ko <code>BigDecimal</code> mein jodna kyunki paise hain", correct: false, why: "Correctness hai, over-engineering nahi (double se paisa galat judta hai)." },
        { text: "Har row ke liye Observer pattern se event publish karna", correct: true, why: "Koi subscriber hi nahi. Seedha loop." },
        { text: "Galat row (bad number) pe line number ke saath saaf error", correct: false, why: "Simple aur zaroori. KISS ka matlab error handling chhodna nahi." }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Code smells: "kuch gadbad hai" ke signal</h2>
        <p>Smell bug nahi hai, ek ishaara hai ki design ko dekhna chahiye. Har smell ke saath uska <b>typical fix</b>:</p>
        <table>
          <tr><th>Smell</th><th>Kaisa dikhta hai</th><th>Aksar fix</th></tr>
          <tr><td>God class</td><td><code>OrderManager</code> 2000 lines, sab kuch karta hai</td><td>Responsibilities alag classes mein (S)</td></tr>
          <tr><td>Long method</td><td>Ek method 150 lines, kai comment headers</td><td>Extract method (har comment heading = ek method)</td></tr>
          <tr><td>Switch on type</td><td>Kai jagah <code>switch (vehicle.type)</code></td><td>Polymorphism / Strategy (O)</td></tr>
          <tr><td>Primitive obsession</td><td><code>String phone</code>, <code>double amount</code>, <code>String currency</code> har jagah</td><td>Chhote value types: <code>Phone</code>, <code>Money</code> (validation ek jagah)</td></tr>
          <tr><td>Long parameter list</td><td><code>create(a, b, c, d, e, f, g)</code></td><td>Parameter object / Builder</td></tr>
          <tr><td>Feature envy</td><td>Method doosri class ke data se hi khelta rehta hai</td><td>Method us class mein le jaao jiska data hai</td></tr>
          <tr><td>Shotgun surgery</td><td>Ek change ke liye 8 files chhoni padti hain</td><td>Bikhre logic ko ek jagah (DRY)</td></tr>
          <tr><td>Boolean flag parameter</td><td><code>render(true, false)</code></td><td>Do alag methods, ya enum</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Primitive obsession fix: Money value object (validation aur rule ek jagah)",
      code: `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    // Immutable value object: amount + currency hamesha saath, rules andar
    record Money(BigDecimal amount, String currency) {
        Money {
            if (amount.signum() < 0) throw new IllegalArgumentException("negative amount");
            if (!currency.matches("[A-Z]{3}")) throw new IllegalArgumentException("bad currency " + currency);
            amount = amount.setScale(2, RoundingMode.HALF_UP);
        }
        static Money inr(String v) { return new Money(new BigDecimal(v), "INR"); }

        Money plus(Money o) {
            if (!currency.equals(o.currency)) throw new IllegalArgumentException("currency mismatch");
            return new Money(amount.add(o.amount), currency);
        }
        Money percent(int p) { return new Money(amount.multiply(BigDecimal.valueOf(p)).divide(BigDecimal.valueOf(100)), currency); }
    }

    public static void main(String[] args) {
        Money pizza = Money.inr("299.50");
        Money coke = Money.inr("60");
        Money sub = pizza.plus(coke);
        System.out.println("subtotal = " + sub);
        System.out.println("GST 18%  = " + sub.percent(18));
        try {
            sub.plus(new Money(new BigDecimal("5"), "USD"));
        } catch (IllegalArgumentException e) {
            System.out.println("rok diya: " + e.getMessage());
        }
        System.out.println("double se: " + (0.1 + 0.2) + "  vs BigDecimal: " + new BigDecimal("0.1").add(new BigDecimal("0.2")));
    }
}`,
      note: "Ab galti se INR + USD jodna ya negative amount banana possible hi nahi. Ye KISS ke khilaaf nahi: ek chhoti class ne poore code se validation hata di."
    },
    {
      type: "quiz",
      q: "Do functions hain: <code>validateCustomerAddress()</code> aur <code>validateWarehouseAddress()</code>. Aaj dono ka code bilkul same hai. Kya karna chahiye?",
      options: [
        "Turant ek <code>validateAddress()</code> bana do, DRY hamesha pehle",
        "Socho kya dono <b>same rule</b> hain ya alag wajah se badlenge. Alag teams/rules hain to duplication theek; same business rule hai to ek jagah",
        "Teesra copy bana do future ke liye",
        "Inheritance se common parent bana do"
      ],
      answer: 1,
      why: "DRY knowledge ke baare mein hai, text ke baare mein nahi. Agar warehouse ko kal pincode + GPS chahiye aur customer ko nahi, to jod hua function flags se bhar jaayega. Same dikhna ≠ same rule."
    },
    {
      type: "exercise",
      id: "ex-smell",
      title: "Switch-on-type smell hatao (shipping cost)",
      level: "Easy",
      task: `<p>Starter mein <code>ShippingCalculator.cost(type, kg)</code> ek switch hai, aur same switch <code>days(type)</code> mein bhi (shotgun surgery: naya type = do jagah edit). Isse badlo:</p>
        <ul>
          <li><code>ShippingMethod</code> interface: <code>double cost(double kg)</code>, <code>int days()</code>.</li>
          <li><code>Standard</code>: ₹40 + ₹10/kg, 5 din. <code>Express</code>: ₹100 + ₹25/kg, 2 din. <code>SameDay</code>: ₹200 flat agar kg ≤ 5, warna ₹200 + ₹50 per kg upar (5 ke upar wale kg), 0 din.</li>
          <li><code>ShippingCalculator</code> ab type string nahi lega: <code>quote(ShippingMethod m, double kg)</code> return kare <code>"₹&lt;cost&gt; in &lt;days&gt; days"</code> jahan cost ek decimal ke saath (<code>String.format("%.1f", cost)</code>).</li>
        </ul>`,
      examples: "<code>quote(new Express(), 2)</code> → <code>\"₹150.0 in 2 days\"</code><br><code>quote(new SameDay(), 7)</code> → <code>\"₹300.0 in 0 days\"</code>",
      userFile: "Solution.java",
      starter: `interface ShippingMethod {
    double cost(double kg);
    int days();
}

class Standard implements ShippingMethod {
    public double cost(double kg) { return 0; }   // TODO
    public int days() { return 0; }
}

class Express implements ShippingMethod {
    public double cost(double kg) { return 0; }   // TODO
    public int days() { return 0; }
}

class SameDay implements ShippingMethod {
    public double cost(double kg) { return 0; }   // TODO
    public int days() { return 0; }
}

class ShippingCalculator {
    // Purana smell (reference ke liye): switch (type) { case "STANDARD": ... } do jagah
    String quote(ShippingMethod m, double kg) {
        return "";                                 // TODO
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        ShippingCalculator c = new ShippingCalculator();
        Check.eq("Express 2kg", "₹150.0 in 2 days", () -> c.quote(new Express(), 2));
        Check.eq("SameDay 7kg", "₹300.0 in 0 days", () -> c.quote(new SameDay(), 7));
        Check.hiddenFromHere();
        Check.eq("Standard 3kg", "₹70.0 in 5 days", () -> c.quote(new Standard(), 3));
        Check.eq("SameDay 5kg (boundary)", "₹200.0 in 0 days", () -> c.quote(new SameDay(), 5));
        Check.eq("SameDay 0.5kg", "₹200.0 in 0 days", () -> c.quote(new SameDay(), 0.5));
        Check.eq("Standard 2.5kg", "₹65.0 in 5 days", () -> c.quote(new Standard(), 2.5));
        Check.eq("naya Drone method bina calculator badle", "₹99.0 in 1 days", () -> c.quote(new ShippingMethod() {
            public double cost(double kg) { return 99; }
            public int days() { return 1; }
        }, 1));
    }
}`,
      hints: [
        "Standard: <code>return 40 + 10 * kg;</code> aur <code>days()</code> 5. Express waise hi.",
        "SameDay: <code>return kg &lt;= 5 ? 200 : 200 + 50 * (kg - 5);</code>",
        "quote: <code>return \"₹\" + String.format(\"%.1f\", m.cost(kg)) + \" in \" + m.days() + \" days\";</code>"
      ],
      solution: `interface ShippingMethod {
    double cost(double kg);
    int days();
}

class Standard implements ShippingMethod {
    public double cost(double kg) { return 40 + 10 * kg; }
    public int days() { return 5; }
}

class Express implements ShippingMethod {
    public double cost(double kg) { return 100 + 25 * kg; }
    public int days() { return 2; }
}

class SameDay implements ShippingMethod {
    public double cost(double kg) { return kg <= 5 ? 200 : 200 + 50 * (kg - 5); }
    public int days() { return 0; }
}

class ShippingCalculator {
    String quote(ShippingMethod m, double kg) {
        return "₹" + String.format("%.1f", m.cost(kg)) + " in " + m.days() + " days";
    }
}`,
      explain: "<p>Har method ki saari knowledge (cost + days) ab ek class mein: naya type = ek nayi class, koi switch nahi (DRY + Open/Closed). Calculator simple reh gaya (KISS). Agar sirf 2 fixed types hote aur kabhi badalte nahi, to ek enum with fields bhi bilkul theek design hota: zaroorat ke hisaab se chuno.</p>"
    },
    {
      type: "think",
      id: "think-yagni-interview",
      q: "Interview mein Parking Lot design kar rahe ho. Interviewer ne bas itna kaha: <i>\"car aur bike park honi chahiye, ek hi floor.\"</i> Kya aap multiple floors, EV charging, aur dynamic pricing abhi design karoge? Kaise handle karoge?",
      rubric: [
        { point: "Abhi <b>nahi banaunga</b> jo maanga nahi (YAGNI / scope)", keys: ["yagni", "nahi banaunga", "abhi nahi", "scope", "maanga nahi", "requirement nahi"], weight: 2 },
        { point: "Interviewer se <b>poochunga</b> / bolunga ki future mein kaise jodenge", keys: ["poochunga", "puchunga", "clarify", "ask", "confirm", "bataunga"], weight: 2 },
        { point: "Jo cheez <b>sach mein badlegi</b> (vehicle types, pricing) uske liye halka seam: interface / enum", keys: ["interface", "enum", "seam", "strategy", "extension point"], weight: 2 },
        { point: "Pehle core flow working (park / unpark / ticket)", keys: ["core", "working", "park", "unpark", "ticket", "pehle chalne"] }
      ],
      answer: `<p>Nahi. Pehle bolunga: <i>"Main abhi single floor, car/bike, park/unpark aur ticket ka core flow banata hoon. Multiple floors aur pricing agar chahiye to bataiye."</i> Ye clarify karna hi score hai.</p>
        <p>Par design mein <b>sasti seams</b> chhodunga jo baad mein raasta khole: <code>VehicleType</code> enum, <code>PricingStrategy</code> interface (abhi ek hi implementation), aur <code>ParkingLot</code> ke andar spots ki list (kal <code>List&lt;Floor&gt;</code> ban sakti hai). Ye 2 minute ka kaam hai, framework nahi. Phir core code likh ke chala ke dikhaunga.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Jab bhi koi abstraction add karo, ek line mein uski <b>wajah</b> bolo (\"pricing rules badalte hain, isliye interface\"). Wajah na mile to wo abstraction mat lagao. Ye ek aadat aapko over-engineering aur under-design dono se bachati hai."
    }
  ],
  references: [
    { title: "The Pragmatic Programmer (20th Anniv. ed.), Topic 9: DRY", by: "David Thomas, Andrew Hunt", type: "book" },
    { title: "Refactoring (2nd ed.), Ch. 3: Bad Smells in Code", by: "Martin Fowler", type: "book" },
    { title: "Refactoring Guru: Code smells", by: "Refactoring Guru", url: "https://refactoring.guru/refactoring/smells", type: "article" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
