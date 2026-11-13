// Abstract class vs Interface
registerLesson("java", "abstract-interface", {
  why: "\"Abstract class vs interface, kab kaunsa?\" Java interviews ka sabse purana favourite hai, aur Java 8 (default methods) ke baad iska jawab badal gaya. LLD mein har design isi choice se shuru hota hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Abstract class: adhoori class</h2>
              <p>Kuch classes ka object banana logical hi nahi. \"Shape\" ka area kya hai? Pata nahi, jab tak circle ya rectangle na ho. Aisi class ko <code>abstract</code> banao.</p>
              <ul>
                <li><code>abstract class Shape</code>: iska <b>object nahi ban sakta</b> (<code>new Shape()</code> compile error).</li>
                <li><code>abstract double area();</code>: sirf signature, body nahi. Har concrete (non-abstract) child ko implement karna <b>padega</b>.</li>
                <li>Abstract class mein <b>normal methods, fields (state), constructors</b> sab ho sakte hain. Constructor child ke <code>super(...)</code> se chalta hai.</li>
                <li>Ek class mein ek bhi abstract method hai to class abstract honi chahiye. Ulta zaroori nahi: bina abstract method ke bhi class abstract ho sakti hai.</li>
              </ul>
              <p>Typical use: <b>common code + common state</b> parent mein, aur jo har child mein alag hai wo abstract. Isko <b>Template Method</b> pattern kehte hain: parent algorithm ka dhaancha likhta hai, child steps bharta hai.</p>`
    },
    {
      type: "code",
      title: "Abstract class: common state + template method",
      code: `abstract class Notification {
    private final String to;                   // common state
    private static int sentCount = 0;

    Notification(String to) { this.to = to; }  // constructor allowed

    // Template method: flow fixed, steps child ke
    final String send(String msg) {
        if (msg == null || msg.isEmpty()) return "skip: khaali message";
        sentCount++;
        return channel() + " -> " + to + ": " + format(msg);
    }

    abstract String channel();                 // har child ko batana padega
    String format(String msg) { return msg; }  // default behaviour, child badal sakta hai

    static int sentCount() { return sentCount; }
}

class Sms extends Notification {
    Sms(String phone) { super(phone); }
    @Override String channel() { return "SMS"; }
    @Override String format(String msg) {      // SMS chhota rakho
        return msg.length() > 20 ? msg.substring(0, 20) + "..." : msg;
    }
}

class Email extends Notification {
    Email(String email) { super(email); }
    @Override String channel() { return "EMAIL"; }
}

public class Main {
    public static void main(String[] args) {
        Notification[] all = { new Sms("98xxxxxx01"), new Email("riya@example.com") };
        for (Notification n : all) {
            System.out.println(n.send("Aapka order raaste mein hai, 10 min mein pahunchega"));
        }
        System.out.println(all[0].send(""));
        System.out.println("sent = " + Notification.sentCount());
    }
}`
    },
    {
      type: "code",
      expectError: true,
      title: "Abstract class ka object nahi banta",
      code: `abstract class Shape {
    abstract double area();
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Shape();
        System.out.println(s.area());
    }
}`,
      note: "Error: <i>Shape is abstract; cannot be instantiated</i>. Par <code>Shape s = new Circle(2);</code> (reference abstract type ka) bilkul theek hai."
    },
    {
      type: "text",
      html: `
              <h2>Interface: contract (\"ye kar sakta hai\")</h2>
              <p>Interface batata hai ki class <b>kya kar sakti hai</b>, kaise nahi. <code>Comparable</code> (compare ho sakta hai), <code>Runnable</code> (chal sakta hai), <code>PaymentGateway</code> (pay kar sakta hai).</p>
              <table>
                <tr><th>Interface mein</th><th>Rule</th><th>Since</th></tr>
                <tr><td>Abstract methods</td><td>Bina modifier ke bhi <b>public abstract</b></td><td>1.0</td></tr>
                <tr><td>Fields</td><td>Hamesha <b>public static final</b> (constants). Instance state nahi</td><td>1.0</td></tr>
                <tr><td><code>default</code> methods</td><td>Body wale instance methods. Implementing class override kar sakti hai</td><td>Java 8</td></tr>
                <tr><td><code>static</code> methods</td><td>Interface naam se call: <code>Comparator.naturalOrder()</code>. Inherit nahi hote</td><td>Java 8</td></tr>
                <tr><td><code>private</code> methods</td><td>Default methods ke beech common code ke liye</td><td>Java 9</td></tr>
              </table>
              <ul>
                <li>Class <b>kai interfaces</b> implement kar sakti hai: <code>class Upi implements PaymentMethod, Refundable</code>.</li>
                <li><b>Default methods kyun aaye:</b> Java 8 mein <code>List</code> interface mein <code>forEach</code>, <code>stream()</code> jodne the. Abstract method jodte to duniya ki har List implementation toot jaati. Default method ne purane code ko bina tode naya method de diya.</li>
                <li><b>Diamond problem:</b> do interfaces mein same default method ho to class ko <b>override karna padega</b> (warna compile error), aur andar <code>A.super.method()</code> se chun sakti hai. Class ka apna method hamesha interface ke default se jeet-ta hai.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Interface: default, static, aur diamond conflict ka hal",
      code: `interface Trackable {
    int MAX_PINGS = 3;                         // public static final (implicit)
    String location();                         // public abstract (implicit)
    default String track() { return "Tracking at " + location(); }
    static String help() { return "Trackable: location() implement karo"; }
}

interface Rateable {
    default String track() { return "Rateable ka track"; }   // same default!
    int rating();
}

class DeliveryPartner implements Trackable, Rateable {
    private final String area;
    DeliveryPartner(String area) { this.area = area; }

    public String location() { return area; }  // public zaroori: interface method public hai
    public int rating() { return 5; }

    @Override
    public String track() {                    // dono mein track(): override karna hi padega
        return Trackable.super.track() + " | rating " + rating();
    }
}

public class Main {
    public static void main(String[] args) {
        DeliveryPartner d = new DeliveryPartner("Koramangala");
        System.out.println(d.track());
        System.out.println(Trackable.help());  // static: interface naam se
        System.out.println(Trackable.MAX_PINGS);

        Trackable t = d;                       // interface type ka reference
        Rateable r = d;
        System.out.println(t.location() + " " + r.rating());
    }
}`,
      note: "<code>DeliveryPartner</code> mein <code>track()</code> override hata ke Run karo: compile error <i>inherits unrelated defaults for track()</i> dikhega."
    },
    {
      type: "quiz",
      q: "Interface mein <code>int LIMIT = 10;</code> likha hai. Iske asli modifiers kya hain?",
      options: [
        "package-private instance field",
        "public instance field, implementing class badal sakti hai",
        "public static final",
        "private static"
      ],
      answer: 2,
      why: "Interface fields hamesha <b>public static final</b> hote hain: constants. Interface mein instance state rakh hi nahi sakte. Isliye state chahiye to abstract class."
    },
    {
      type: "text",
      html: `
              <h2>Abstract class vs Interface</h2>
              <table>
                <tr><th></th><th>Abstract class</th><th>Interface</th></tr>
                <tr><td>Kitne extend/implement</td><td>Sirf <b>ek</b></td><td><b>Kai</b></td></tr>
                <tr><td>Instance state (fields)</td><td>✅</td><td>❌ (sirf constants)</td></tr>
                <tr><td>Constructor</td><td>✅</td><td>❌</td></tr>
                <tr><td>Method access</td><td>Kuch bhi (protected bhi)</td><td>public (ya private helper)</td></tr>
                <tr><td>Method body</td><td>✅</td><td>default/static/private (Java 8/9+)</td></tr>
                <tr><td>Relationship</td><td><b>is-a</b>, close family (Sms is-a Notification)</td><td><b>can-do</b>, capability (Trackable, Comparable)</td></tr>
              </table>
              <h3>Kab kaunsa</h3>
              <ul>
                <li><b>Interface pehle socho.</b> API / contract define karna hai, alag-alag unrelated classes ek capability share karti hain, ya multiple types chahiye. Spring mein service interfaces isi wajah se.</li>
                <li><b>Abstract class</b> jab: related classes ka <b>common state + code</b> hai, constructor mein common validation chahiye, ya protected helpers chahiye. Template method pattern.</li>
                <li>Dono saath: interface contract ke liye, aur ek abstract <b>skeleton</b> class jo uska common hissa implement kare (<code>List</code> → <code>AbstractList</code> → <code>ArrayList</code>).</li>
              </ul>`
    },
    {
      type: "pick",
      id: "pick-abs-int",
      q: "Kaunsi baatein <b>sahi</b> hain? (Java 17)",
      options: [
        { text: "Interface mein constructor ho sakta hai", correct: false, why: "Interface ka object nahi banta aur usme instance state nahi, to constructor ka matlab nahi." },
        { text: "Abstract class ka constructor ho sakta hai, aur wo child ke <code>super()</code> se chalta hai", correct: true, why: "Common fields initialize karne ke liye bahut use hota hai." },
        { text: "Class do interfaces implement kare jinme same default method hai, to compile error jab tak class override na kare", correct: true, why: "Diamond conflict. Override karke <code>A.super.m()</code> se chun sakte ho." },
        { text: "Interface ke static methods implementing class ke naam se bhi call ho sakte hain", correct: false, why: "Interface static methods inherit nahi hote. Sirf <code>InterfaceName.method()</code>." },
        { text: "Abstract class bina kisi abstract method ke bhi ho sakti hai", correct: true, why: "Sirf instantiation rokne ke liye bhi abstract bana sakte ho." },
        { text: "Interface method implement karte waqt class usse protected bana sakti hai", correct: false, why: "Interface methods public hain, access kam nahi kar sakte. Implementation public honi chahiye." }
      ]
    },
    {
      type: "exercise",
      id: "ex-shapes",
      title: "Shape hierarchy",
      level: "Easy",
      task: `<p><code>Shape</code> interface diya hua hai (area, perimeter, aur ek default <code>describe()</code>). Implement karo:</p>
              <ul><li><code>Circle(double r)</code>: area = πr², perimeter = 2πr (<code>Math.PI</code>).</li>
              <li><code>Rectangle(double w, double h)</code>: area = w × h, perimeter = 2(w + h).</li>
              <li><code>Square(double side) extends Rectangle</code>: code dobara mat likho, <code>super(side, side)</code>.</li>
              <li><code>static double totalArea(Shape[] shapes)</code> (class <code>Shapes</code> mein).</li></ul>`,
      examples: "<code>new Rectangle(2, 3).area()</code> → <code>6.0</code><br><code>new Square(2).describe()</code> → <code>\"Square area=4.00\"</code>",
      userFile: "Solution.java",
      starter: `interface Shape {
    double area();
    double perimeter();
    default String describe() {
        return getClass().getSimpleName() + String.format(java.util.Locale.ROOT, " area=%.2f", area());
    }
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return 0; }
    public double perimeter() { return 0; }
}

class Rectangle implements Shape {
    protected final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return 0; }
    public double perimeter() { return 0; }
}

class Square extends Rectangle {
    Square(double side) { super(0, 0); }
}

class Shapes {
    static double totalArea(Shape[] shapes) { return 0; }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Check.eq("Rectangle(2, 3).area()", 6.0, () -> new Rectangle(2, 3).area());
        Check.eq("Circle(1).area()", Math.PI, () -> new Circle(1).area());
        Check.eq("Square(2).describe()", "Square area=4.00", () -> new Square(2).describe());
        Check.hiddenFromHere();
        Check.eq("Rectangle(2, 3).perimeter()", 10.0, () -> new Rectangle(2, 3).perimeter());
        Check.eq("Circle(2).perimeter()", 4 * Math.PI, () -> new Circle(2).perimeter());
        Check.eq("Square(5).perimeter()", 20.0, () -> new Square(5).perimeter());
        Check.eq("Square is-a Rectangle", true, () -> ((Object) new Square(1)) instanceof Rectangle);
        Check.eq("Circle(0).area()", 0.0, () -> new Circle(0).area());
        Check.eq("totalArea(mixed)", Math.PI + 6 + 4, () -> Shapes.totalArea(new Shape[]{ new Circle(1), new Rectangle(2, 3), new Square(2) }));
        Check.eq("totalArea(empty)", 0.0, () -> Shapes.totalArea(new Shape[]{}));
        Check.eq("Circle describe", "Circle area=78.54", () -> new Circle(5).describe());
    }
}`,
      hints: [
        "Circle: <code>Math.PI * r * r</code> aur <code>2 * Math.PI * r</code>.",
        "Square mein sirf constructor: <code>super(side, side)</code>. area/perimeter Rectangle se mil jaayenge.",
        "totalArea: loop mein <code>sum += s.area()</code>. Type check ki zaroorat nahi."
      ],
      solution: `interface Shape {
    double area();
    double perimeter();
    default String describe() {
        return getClass().getSimpleName() + String.format(java.util.Locale.ROOT, " area=%.2f", area());
    }
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
}

class Rectangle implements Shape {
    protected final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
    public double perimeter() { return 2 * (w + h); }
}

class Square extends Rectangle {
    Square(double side) { super(side, side); }
}

class Shapes {
    static double totalArea(Shape[] shapes) {
        double sum = 0;
        for (Shape s : shapes) sum += s.area();
        return sum;
    }
}`,
      explain: "<p><code>describe()</code> ek baar interface mein likha, saare shapes ko mil gaya (default method). <code>getClass()</code> runtime class deta hai, isliye Square ke liye \"Square\" aata hai, Rectangle nahi.</p><p>Design discussion: <b>Square extends Rectangle</b> yahan theek hai kyunki objects immutable hain. Agar Rectangle mein <code>setWidth()</code> hota to Square ka rule (w == h) toot jaata: ye Liskov Substitution violation ka classic example hai. Interview mein ye point bolna senior signal hai.</p>"
    },
    {
      type: "think",
      id: "think-abs-vs-int",
      q: "Interview question: <b>\"Java 8 mein interfaces mein default methods aa gaye. To ab abstract class ki zaroorat kyun hai? Kab kaunsa use karoge?\"</b>",
      rubric: [
        { point: "Interface mein <b>instance state (fields) aur constructor nahi</b> ho sakte; abstract class mein ho sakte hain", keys: ["state", "field", "constructor", "instance variable"], weight: 2 },
        { point: "Class sirf <b>ek</b> class extend kar sakti hai, par <b>kai</b> interfaces implement", keys: ["multiple", "kai interface", "ek hi class", "single inheritance", "ek class"], weight: 2 },
        { point: "Interface = capability / contract (can-do); abstract class = is-a family with shared code", keys: ["contract", "capability", "can-do", "can do", "is-a", "is a"] },
        { point: "Default methods ka asli maksad: purane interfaces ko bina implementations tode evolve karna (backward compatibility)", keys: ["backward", "evolve", "purane code", "compatib", "tode bina", "break"] },
        { point: "Abstract class mein protected/non-public members aur template method; interface methods public", keys: ["protected", "template", "public", "access"] }
      ],
      answer: `<p>Default methods se interface mein behaviour aa gaya, par <b>state nahi</b>. Interface mein instance fields aur constructor nahi ho sakte, aur saare (non-private) methods public hote hain.</p>
                <p><b>Abstract class tab chahiye</b> jab related classes ka <b>common state</b> hai (jaise <code>to</code>, <code>createdAt</code>), constructor mein common validation chahiye, <code>protected</code> helpers chahiye, ya template method pattern (flow final, steps abstract).</p>
                <p><b>Interface tab</b> jab contract / capability define karni hai (<code>Comparable</code>, <code>PaymentGateway</code>), unrelated classes ko ek type dena hai, ya ek class ko <b>kai types</b> chahiye (Java mein class ek hi parent extend kar sakti hai). Testing mein mock karna bhi aasan.</p>
                <p>Default methods ka asli purpose <b>API evolution</b> tha: Java 8 mein <code>Collection.stream()</code> jodna tha bina har purani implementation tode. Unhe \"multiple inheritance of state\" ka substitute mat samjho.</p>
                <p>Practical rule: <b>interface se shuru karo</b>; common implementation dikhe to ek abstract skeleton class bhi do (<code>List</code> + <code>AbstractList</code>).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Sirf table mat sunao. Ek real example do: <i>\"PaymentGateway interface (Razorpay, Stripe implement karte hain), aur AbstractGateway jo retry + logging common rakhta hai.\"</i> Contract + skeleton dono ek saath dikhana batata hai ki aapne asli codebase mein ye kiya hai."
    }
  ],
  references: [
    { title: "Abstract Methods and Classes", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html", type: "docs" },
    { title: "Default Methods", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html", type: "docs" },
    { title: "Interfaces", by: "dev.java", url: "https://dev.java/learn/interfaces/", type: "docs" },
    { title: "JLS 17, Chapter 9: Interfaces", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-9.html", type: "docs" }
  ]
});
