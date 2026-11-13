// Inheritance aur Polymorphism
registerLesson("java", "inheritance-poly", {
  why: "Overriding vs overloading, dynamic dispatch, aur \"Parent p = new Child()\" wale output questions har Java interview mein hain. LLD mein bhi Payment / Notification jaisi hierarchy isi pe banti hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Inheritance: \"is-a\" relationship</h2>
              <p><code>class Car extends Vehicle</code>: Car ek Vehicle <b>hai</b>. Car ko Vehicle ke fields aur methods mil jaate hain, aur wo apne add kar sakti hai ya purane badal (override) sakti hai.</p>
              <ul>
                <li>Java mein class sirf <b>ek</b> class extend kar sakti hai (single inheritance). Interfaces kai implement ho sakte hain.</li>
                <li>Har class ka sabse upar ka parent <code>java.lang.Object</code> hai.</li>
                <li><b>Kya milta hai:</b> public/protected members (aur same package mein default). <code>private</code> members object mein hote hain, par child unhe seedha access nahi kar sakta.</li>
                <li><b>Constructors inherit nahi hote.</b> Child ka har constructor pehle parent ka constructor chalata hai: <code>super(...)</code> pehli line pe. Aapne nahi likha to compiler <code>super()</code> (no-arg) daal deta hai. Parent mein no-arg constructor nahi hai to compile error.</li>
                <li><code>super.method()</code>: parent wala version call karo (override ke andar se).</li>
              </ul>
              <p>Inheritance tab use karo jab sach mein is-a ho. Sirf code reuse ke liye inheritance (Stack extends Vector jaisa) aage jaake dikkat deta hai. Wahan <b>composition</b> (field mein object rakho) behtar hai.</p>`
    },
    {
      type: "code",
      title: "extends, super, aur constructor chain ka order",
      code: `class Vehicle {
    protected final String number;
    private int km = 0;                 // child seedha access nahi kar sakta

    Vehicle(String number) {
        this.number = number;
        System.out.println("Vehicle constructor");
    }

    void drive(int distance) { km += distance; }
    int getKm() { return km; }
    String describe() { return "Vehicle " + number; }
}

class Car extends Vehicle {
    private final int seats;

    Car(String number, int seats) {
        super(number);                  // pehli line: parent ko pehle bana do
        this.seats = seats;
        System.out.println("Car constructor");
    }

    @Override
    String describe() {
        return super.describe() + " (car, " + seats + " seats)";   // parent ka version + extra
    }
}

class Taxi extends Car {
    Taxi(String number) {
        super(number, 4);
        System.out.println("Taxi constructor");
    }
}

public class Main {
    public static void main(String[] args) {
        Taxi t = new Taxi("MH12 AB 1234");
        t.drive(15);                    // Vehicle se mila method
        System.out.println(t.describe());
        System.out.println(t.getKm());
        System.out.println(t instanceof Vehicle);   // true: Taxi is-a Vehicle
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class A { A() { System.out.print("A"); } }
class B extends A { B() { System.out.print("B"); } }
class C extends B { C() { super(); System.out.print("C"); } }
// main:
new C();</pre>`,
      options: ["C", "CBA", "ABC", "BC"],
      answer: 2,
      why: "Har constructor pehle parent ka constructor chalata hai (B mein compiler ne khud <code>super()</code> daala). Chain upar tak jaati hai aur upar se neeche body chalti hai: <code>A</code>, <code>B</code>, <code>C</code>."
    },
    {
      type: "text",
      html: `
              <h2>Overriding vs Overloading</h2>
              <table>
                <tr><th></th><th>Overloading</th><th>Overriding</th></tr>
                <tr><td>Kya</td><td>Same naam, <b>alag parameters</b></td><td>Child mein parent ka method, <b>same signature</b></td></tr>
                <tr><td>Kahan</td><td>Same class (ya child mein bhi)</td><td>Parent-child ke beech</td></tr>
                <tr><td>Decide kab</td><td><b>Compile time</b> (declared type se)</td><td><b>Runtime</b> (asli object ke type se)</td></tr>
                <tr><td>Return type</td><td>Kuch bhi</td><td>Same ya <b>subtype</b> (covariant return)</td></tr>
                <tr><td>Access</td><td>Kuch bhi</td><td>Kam nahi kar sakte (public ko protected nahi)</td></tr>
                <tr><td>Exceptions</td><td>Kuch bhi</td><td>Naye/bade <b>checked</b> exceptions throw nahi kar sakte</td></tr>
              </table>
              <p><b>Kaun override nahi hota:</b></p>
              <ul>
                <li><code>static</code> methods: child mein same static method likha to wo <b>hiding</b> hai. Kaunsa chalega ye reference ke declared type se decide hota hai.</li>
                <li><code>private</code> methods: child ko dikhte hi nahi, child ka same-naam method bilkul naya method hai.</li>
                <li><code>final</code> methods: override karna compile error.</li>
                <li><b>Fields</b>: polymorphic nahi hote. Child mein same naam ka field parent wale ko chhupata hai, aur <code>p.field</code> declared type se decide hota hai.</li>
              </ul>
              <p><code>@Override</code> hamesha lagao: galti se signature alag hua (overload ban gaya) to compiler error dega.</p>`
    },
    {
      type: "text",
      html: `
              <h2>Runtime polymorphism (dynamic dispatch)</h2>
              <p><code>Payment p = new UpiPayment();</code>: variable ka <b>declared type</b> Payment hai, <b>object</b> UpiPayment hai.</p>
              <ol>
                <li><b>Compile time:</b> compiler sirf declared type (Payment) dekhta hai: kya <code>pay()</code> Payment mein hai? Nahi hai to error. Overload bhi yahin chuna jaata hai.</li>
                <li><b>Runtime:</b> JVM asli object ka class dekhta hai aur <b>uska</b> override kiya <code>pay()</code> chalata hai. HotSpot iske liye har class ki ek method table (vtable) rakhta hai.</li>
              </ol>
              <p>Fayda: checkout code sirf <code>Payment</code> jaanta hai. Kal <code>CardPayment</code> aaya to checkout code badalna nahi padega (Open/Closed principle).</p>`
    },
    {
      type: "code",
      title: "Dynamic dispatch, field hiding, static hiding: ek saath",
      code: `class Payment {
    String type = "generic";
    String pay(int amt) { return "Paid " + amt; }
    static String category() { return "Payment"; }
}

class UpiPayment extends Payment {
    String type = "upi";                       // field HIDE karta hai, override nahi
    @Override
    String pay(int amt) { return "UPI se paid " + amt; }
    static String category() { return "UPI"; } // static: hiding
}

class CardPayment extends Payment {
    @Override
    String pay(int amt) { return "Card se paid " + (amt + amt * 2 / 100) + " (2% fee)"; }
}

public class Main {
    public static void main(String[] args) {
        Payment[] payments = { new Payment(), new UpiPayment(), new CardPayment() };
        for (Payment p : payments) {
            System.out.println(p.pay(100));    // har object apna version chalata hai
        }

        Payment p = new UpiPayment();
        System.out.println(p.pay(50));         // runtime type: UpiPayment
        System.out.println(p.type);            // declared type: Payment -> "generic"
        System.out.println(((UpiPayment) p).type);   // cast karke: "upi"
        System.out.println(p.category());      // static, declared type se: "Payment"
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class Parent {
    String name = "parent";
    String getName() { return name; }
}
class Child extends Parent {
    String name = "child";
    @Override String getName() { return name; }
}
// main:
Parent p = new Child();
System.out.println(p.name + " " + p.getName());</pre>`,
      options: ["parent parent", "child child", "parent child", "child parent"],
      answer: 2,
      why: "<b>Field</b> access declared type (Parent) se: <code>p.name</code> = \"parent\". <b>Method</b> runtime pe asli object (Child) ka: Child ka <code>getName()</code> Child ka <code>name</code> return karta hai = \"child\". Rule: <b>fields aur static compile-time, instance methods runtime</b>."
    },
    {
      type: "code",
      title: "Overload compile-time pe, override runtime pe: dono mila ke",
      code: `class Animal {
    String sound() { return "..."; }
}
class Dog extends Animal {
    @Override String sound() { return "Bhau"; }
}

public class Main {
    static String feed(Animal a) { return "Animal ko khana, sound: " + a.sound(); }
    static String feed(Dog d)    { return "Dog ko biscuit, sound: " + d.sound(); }

    public static void main(String[] args) {
        Animal a = new Dog();
        Dog d = new Dog();
        System.out.println(feed(a));   // overload: declared type Animal -> feed(Animal)
                                       // andar a.sound(): runtime Dog -> "Bhau"
        System.out.println(feed(d));
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class Base {
    Base() { show(); }
    void show() { System.out.println("Base"); }
}
class Derived extends Base {
    int x = 10;
    @Override void show() { System.out.println("Derived " + x); }
}
// main:
new Derived();</pre>`,
      options: ["Base", "Derived 10", "Derived 0", "NullPointerException"],
      answer: 2,
      why: "Base ka constructor <code>show()</code> call karta hai, aur dynamic dispatch se <b>Derived</b> ka version chalta hai. Par us waqt Derived ke field initializers abhi chale hi nahi (wo super() ke <b>baad</b> chalte hain), to <code>x</code> abhi default <b>0</b> hai. Isliye constructor se overridable methods call mat karo."
    },
    {
      type: "code",
      expectError: true,
      title: "Override mein access kam nahi kar sakte",
      code: `class Notifier {
    public void send(String msg) { System.out.println("send " + msg); }
}

class SmsNotifier extends Notifier {
    @Override
    void send(String msg) { System.out.println("sms " + msg); }   // public -> default: not allowed
}

public class Main {
    public static void main(String[] args) {
        new SmsNotifier().send("OTP 1234");
    }
}`,
      note: "Error: <i>attempting to assign weaker access privileges; was public</i>. Wajah: <code>Notifier n = new SmsNotifier(); n.send()</code> compile time pe public dikhta hai. Child use chhupa de to promise toot jaata (Liskov Substitution)."
    },
    {
      type: "exercise",
      id: "ex-payroll",
      title: "Payroll: override karke pay calculate karo",
      level: "Easy",
      task: `<p>Teen classes (starter mein skeleton hai):</p>
              <ul><li><code>Employee(name, base)</code>: <code>pay()</code> = base.</li>
              <li><code>Manager(name, base, bonus) extends Employee</code>: <code>pay()</code> = base + bonus.</li>
              <li><code>Intern(name, base) extends Employee</code>: <code>pay()</code> = base ka 50%.</li>
              <li><code>static double totalPay(Employee[] team)</code> (Employee class mein): sabka pay jodo. Isme <b>instanceof ya type check mat karo</b>, polymorphism se karo.</li></ul>`,
      examples: "<code>new Manager(\"B\", 1000, 700).pay()</code> → <code>1700.0</code><br><code>new Intern(\"C\", 1000).pay()</code> → <code>500.0</code>",
      userFile: "Solution.java",
      starter: `class Employee {
    protected final String name;
    protected final double base;

    Employee(String name, double base) {
        this.name = name;
        this.base = base;
    }

    double pay() { return base; }

    static double totalPay(Employee[] team) {
        return 0;
    }
}

class Manager extends Employee {
    private final double bonus;

    Manager(String name, double base, double bonus) {
        super(name, base);
        this.bonus = bonus;
    }
}

class Intern extends Employee {
    Intern(String name, double base) {
        super(name, base);
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Check.eq("Employee pay", 1000.0, () -> new Employee("A", 1000).pay());
        Check.eq("Manager pay", 1700.0, () -> new Manager("B", 1000, 700).pay());
        Check.eq("Intern pay", 500.0, () -> new Intern("C", 1000).pay());
        Check.hiddenFromHere();
        Check.eq("Employee ref, Manager object", 1700.0, () -> { Employee e = new Manager("B", 1000, 700); return e.pay(); });
        Check.eq("totalPay(mixed team)", 3200.0, () -> Employee.totalPay(new Employee[]{
            new Employee("A", 1000), new Manager("B", 1000, 700), new Intern("C", 1000)}));
        Check.eq("totalPay(empty)", 0.0, () -> Employee.totalPay(new Employee[]{}));
        Check.eq("Manager zero bonus", 800.0, () -> new Manager("D", 800, 0).pay());
        Check.eq("Intern odd base", 333.5, () -> new Intern("E", 667).pay());
    }
}`,
      hints: [
        "Manager aur Intern mein <code>@Override double pay()</code> likho.",
        "Manager: <code>return base + bonus;</code> (ya <code>super.pay() + bonus</code>). Intern: <code>return base * 0.5;</code>",
        "totalPay: <code>for (Employee e : team) sum += e.pay();</code> Har object apna pay() khud chalayega."
      ],
      solution: `class Employee {
    protected final String name;
    protected final double base;

    Employee(String name, double base) {
        this.name = name;
        this.base = base;
    }

    double pay() { return base; }

    static double totalPay(Employee[] team) {
        double sum = 0;
        for (Employee e : team) sum += e.pay();
        return sum;
    }
}

class Manager extends Employee {
    private final double bonus;

    Manager(String name, double base, double bonus) {
        super(name, base);
        this.bonus = bonus;
    }

    @Override
    double pay() { return super.pay() + bonus; }
}

class Intern extends Employee {
    Intern(String name, double base) {
        super(name, base);
    }

    @Override
    double pay() { return base * 0.5; }
}`,
      explain: "<p><code>totalPay</code> ko pata hi nahi ki team mein kaun Manager hai. Har <code>e.pay()</code> pe JVM asli object ka override chalata hai. Kal <code>Contractor</code> aaye to sirf nayi class likhni hai, totalPay nahi badlega. <code>if (e instanceof Manager)</code> wala code har naye type pe badalna padta.</p><p>(Asli payroll mein paise ke liye double nahi, long/BigDecimal. Yahan focus polymorphism pe hai.)</p>"
    },
    {
      type: "think",
      id: "think-dispatch",
      q: "Interview question: <b>\"Runtime polymorphism kaise kaam karta hai? <code>Parent p = new Child(); p.m();</code> mein compile time aur runtime pe kya hota hai?\"</b>",
      rubric: [
        { point: "Compile time: compiler <b>declared/reference type</b> (Parent) check karta hai ki method exist karta hai; overload yahin choose", keys: ["compile time", "reference type", "declared type", "parent mein", "compiler check"], weight: 2 },
        { point: "Runtime: JVM <b>asli object</b> (Child) ka overridden method chalata hai", keys: ["runtime", "actual object", "asli object", "object ka type", "child ka method", "dynamic dispatch"], weight: 2 },
        { point: "Mechanism: <code>invokevirtual</code> / vtable (method table) lookup", keys: ["vtable", "virtual table", "invokevirtual", "method table"] },
        { point: "static, private, final methods aur <b>fields</b> dynamic dispatch mein nahi aate", keys: ["static", "private", "final", "field"], weight: 2 },
        { point: "Fayda: naya subtype jodne pe calling code nahi badalta (Open/Closed)", keys: ["open/closed", "open closed", "extensible", "naya type", "badalna nahi", "loose coupling"] }
      ],
      answer: `<p><b>Compile time:</b> compiler <code>p</code> ka <b>declared type</b> (Parent) dekhta hai. Parent mein <code>m()</code> nahi hai to error. Overloads mein se kaunsa signature chalega, wo bhi yahin fix ho jaata hai. Bytecode mein <code>invokevirtual Parent.m()</code> likha jaata hai.</p>
                <p><b>Runtime:</b> JVM dekhta hai ki <code>p</code> asal mein kis class ka object hai (Child). Child ki <b>method table (vtable)</b> mein <code>m()</code> ka entry Child ka override hai, wahi chalta hai. Ye <b>dynamic dispatch / late binding</b> hai.</p>
                <p><b>Exceptions:</b> <code>static</code> (hiding), <code>private</code> aur constructors dispatch nahi hote; <code>final</code> methods override hi nahi hote. <b>Fields</b> kabhi polymorphic nahi: <code>p.x</code> Parent ka field deta hai.</p>
                <p><b>Fayda:</b> calling code abstraction (Payment) pe likha jaata hai. Naya subtype (CardPayment) aaye to purana code nahi badalta: Open/Closed principle.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Output questions ke liye ek rule yaad karo: <b>\"Fields, static methods aur overload: reference type (compile time). Instance methods ka override: object type (runtime).\"</b> Aur constructor se overridable method call dikhe to turant socho: child ke fields abhi default values pe hain."
    }
  ],
  references: [
    { title: "Inheritance (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html", type: "docs" },
    { title: "Overriding and Hiding Methods", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/IandI/override.html", type: "docs" },
    { title: "Polymorphism", by: "dev.java", url: "https://dev.java/learn/inheritance/polymorphism/", type: "docs" },
    { title: "Using the Keyword super", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/IandI/super.html", type: "docs" }
  ]
});
