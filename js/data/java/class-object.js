// Class, Object, Constructor, this
registerLesson("java", "class-object", {
  why: "LLD round ka pehla step hi classes banana hai. Constructor chaining, this aur default constructor ke rules output questions mein aate hain, aur BankAccount jaisi class likhna basic machine-coding test hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Class = blueprint, Object = asli cheez</h2>
              <p><b>Class</b> ek naksha hai: batata hai ki har cheez ke paas kya <b>data (fields / state)</b> hoga aur wo kya <b>kaam (methods / behaviour)</b> kar sakti hai. <b>Object</b> us naksha se bani asli cheez hai jiske apne values hain.</p>
              <p>Swiggy example: <code>Order</code> class kehti hai ki har order ke paas <code>id</code>, <code>restaurant</code>, <code>amount</code> hoga aur wo <code>applyCoupon()</code> kar sakta hai. Aaj raat ke lakhs orders us class ke <b>objects</b> hain, har ek ki apni values.</p>
              <pre class="diagram">
   class Order (blueprint)               objects (heap mein)
  +----------------------+         +-------------------------+
  | id, restaurant,      |  new    | id=101, "Behrouz", 450  |  o1
  | amount               | ------&gt; +-------------------------+
  | applyCoupon()        |         | id=102, "Haldiram", 220 |  o2
  +----------------------+         +-------------------------+</pre>
              <h3><code>new Order(...)</code> chalane pe kya hota hai</h3>
              <ol>
                <li>Heap mein object ke liye memory milti hai.</li>
                <li>Saare fields <b>default values</b> se bharte hain (0, false, null).</li>
                <li>Field initializers aur instance blocks chalte hain, phir <b>constructor</b> ki body.</li>
                <li>Object ka <b>reference</b> wapas milta hai, jo variable mein jaata hai.</li>
              </ol>`
    },
    {
      type: "code",
      title: "Pehli class: fields, method, do alag objects",
      code: `class Order {
    int id;
    String restaurant;
    int amount;

    void applyCoupon(int off) {
        amount = Math.max(0, amount - off);   // is object ka amount
    }

    String summary() {
        return "#" + id + " " + restaurant + " Rs " + amount;
    }
}

public class Main {
    public static void main(String[] args) {
        Order o1 = new Order();
        o1.id = 101;
        o1.restaurant = "Behrouz";
        o1.amount = 450;

        Order o2 = new Order();
        System.out.println(o2.id + " " + o2.restaurant + " " + o2.amount);  // defaults: 0 null 0

        o1.applyCoupon(100);
        System.out.println(o1.summary());
        System.out.println(o2.summary());     // o2 pe asar nahi: har object ki apni state

        Order o3 = o1;                        // naya object nahi, same reference
        o3.applyCoupon(50);
        System.out.println(o1.summary());

        System.out.println(o1);               // toString override nahi kiya: Order@hash
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>Constructor</h2>
              <p>Object banate hi usko <b>valid state</b> mein laane wala special method. Upar wale code mein <code>o1.id = 101</code> teen lines mein set kiya, aur koi field bhool jaata to object adhoora rehta. Constructor ye ek jagah zabardasti karta hai.</p>
              <ul>
                <li>Naam class jaisa, <b>koi return type nahi</b> (void bhi nahi). <code>void Order()</code> likha to wo normal method ban jaata hai!</li>
                <li>Aapne <b>koi bhi</b> constructor nahi likha to compiler ek khaali no-arg <b>default constructor</b> deta hai. Ek bhi likh diya to default nahi milta.</li>
                <li>Constructors <b>overload</b> ho sakte hain (alag parameters).</li>
                <li>Constructors inherit nahi hote.</li>
              </ul>
              <h3><code>this</code></h3>
              <ul>
                <li><code>this</code> = <b>current object</b> ka reference (jis object pe method/constructor chal raha hai).</li>
                <li><code>this.amount = amount;</code>: parameter ka naam field jaisa ho to parameter field ko <b>chhupa</b> deta hai (shadowing). <code>this.</code> se field ko pakdo.</li>
                <li><code>this(...)</code>: same class ka doosra constructor call (<b>constructor chaining</b>). Ye constructor ki <b>pehli line</b> hi ho sakti hai. Duplicate validation code se bachata hai.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Shadowing bug, this, aur constructor chaining",
      code: `class Product {
    String name;
    int price;

    // BUG: parameter ne field ko chhupa diya. name = name khud ko hi assign
    Product(String name) {
        name = name;
    }
}

class Item {
    final String name;
    final int price;
    final int qty;

    Item(String name, int price, int qty) {          // main constructor: saari validation yahan
        if (price < 0 || qty <= 0) throw new IllegalArgumentException("galat price/qty");
        this.name = name;
        this.price = price;
        this.qty = qty;
        System.out.println("  3-arg constructor chala");
    }

    Item(String name, int price) {
        this(name, price, 1);                         // pehli line: chaining
        System.out.println("  2-arg constructor chala");
    }

    Item(String name) {
        this(name, 0);
        System.out.println("  1-arg constructor chala");
    }

    int total() { return price * qty; }
}

public class Main {
    public static void main(String[] args) {
        Product p = new Product("Chai");
        System.out.println(p.name);                   // null!

        System.out.println("new Item(\\"Samosa\\"):");
        Item a = new Item("Samosa");
        System.out.println(a.name + " x" + a.qty + " = " + a.total());

        Item b = new Item("Thali", 180, 2);
        System.out.println(b.name + " = " + b.total());
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class Ticket {
    String from;
    Ticket(String from) { from = from.toUpperCase(); }
}
// main:
Ticket t = new Ticket("pune");
System.out.println(t.from);</pre>`,
      options: ["PUNE", "pune", "null", "Compile error"],
      answer: 2,
      why: "Constructor ke andar <code>from</code> parameter hai (field chhup gaya). Parameter ko uppercase karke parameter mein hi daala. Field kabhi set nahi hua, default <code>null</code>. Fix: <code>this.from = from.toUpperCase();</code>"
    },
    {
      type: "code",
      expectError: true,
      title: "Ek constructor likha, default constructor gaya",
      code: `class User {
    String name;
    User(String name) { this.name = name; }
}

public class Main {
    public static void main(String[] args) {
        User u = new User();     // no-arg constructor ab exist nahi karta
        System.out.println(u.name);
    }
}`,
      note: "Error: <i>constructor User in class User cannot be applied to given types</i>. Ye frameworks (JPA/Hibernate, Jackson) ke saath bhi hota hai jinko no-arg constructor chahiye: wahan explicitly <code>User() {}</code> likhna padta hai."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">class A {
    A()      { this(5); System.out.print("A "); }
    A(int x) { System.out.print("A" + x + " "); }
}
// main:
new A();</pre>`,
      options: ["A A5", "A5 A", "A", "Compile error: this() constructor mein nahi likh sakte"],
      answer: 1,
      why: "<code>new A()</code> no-arg constructor mein jaata hai, jiski pehli line <code>this(5)</code> hai. Pehle <code>A(int)</code> poora chalta hai (<code>A5</code>), phir wapas aake <code>A</code>. Output <code>A5 A</code>."
    },
    {
      type: "exercise",
      id: "ex-bank-account",
      title: "BankAccount class",
      level: "Easy",
      task: `<p><code>BankAccount</code> class banao (paise ₹ ki jagah <b>paise</b> unit mein <code>long</code>, jaise pichle lesson mein seekha):</p>
              <ul><li><code>BankAccount(String owner, long openingBalance)</code>. <code>BankAccount(String owner)</code> = 0 balance (<code>this(...)</code> se chain karo).</li>
              <li><code>boolean deposit(long amount)</code>: amount &lt;= 0 to <code>false</code> aur kuch mat badlo. Warna jodo, <code>true</code>.</li>
              <li><code>boolean withdraw(long amount)</code>: amount &lt;= 0 ya balance se zyada to <code>false</code>. Warna ghatao, <code>true</code>.</li>
              <li><code>long getBalance()</code>, <code>String getOwner()</code>.</li></ul>`,
      examples: "<code>a = new BankAccount(\"Riya\", 1000)</code>, <code>a.deposit(500)</code> → true, <code>a.withdraw(2000)</code> → false, <code>a.getBalance()</code> → 1500",
      userFile: "Solution.java",
      starter: `class BankAccount {
    private String owner;
    private long balance;

    BankAccount(String owner, long openingBalance) {
        // TODO
    }

    BankAccount(String owner) {
        this(owner, 0);
    }

    boolean deposit(long amount) {
        return false;
    }

    boolean withdraw(long amount) {
        return false;
    }

    long getBalance() { return balance; }
    String getOwner() { return owner; }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Check.eq("new BankAccount(\\"Riya\\", 1000).getBalance()", 1000L, () -> new BankAccount("Riya", 1000).getBalance());
        Check.eq("deposit(500) then balance", 1500L, () -> { BankAccount a = new BankAccount("Riya", 1000); a.deposit(500); return a.getBalance(); });
        Check.eq("withdraw(2000) from 1500 returns", false, () -> { BankAccount a = new BankAccount("Riya", 1500); return a.withdraw(2000); });
        Check.hiddenFromHere();
        Check.eq("getOwner()", "Riya", () -> new BankAccount("Riya", 10).getOwner());
        Check.eq("1-arg constructor: balance 0", 0L, () -> new BankAccount("Aman").getBalance());
        Check.eq("1-arg constructor: owner", "Aman", () -> new BankAccount("Aman").getOwner());
        Check.eq("deposit(0) false", false, () -> new BankAccount("A", 100).deposit(0));
        Check.eq("deposit(-50) se balance nahi badla", 100L, () -> { BankAccount a = new BankAccount("A", 100); a.deposit(-50); return a.getBalance(); });
        Check.eq("withdraw exact balance", true, () -> new BankAccount("A", 100).withdraw(100));
        Check.eq("failed withdraw ke baad balance same", 100L, () -> { BankAccount a = new BankAccount("A", 100); a.withdraw(101); return a.getBalance(); });
        Check.eq("withdraw(-1) false", false, () -> new BankAccount("A", 100).withdraw(-1));
        Check.eq("do accounts alag", "300 100", () -> {
            BankAccount x = new BankAccount("X", 100), y = new BankAccount("Y", 100);
            x.deposit(200);
            return x.getBalance() + " " + y.getBalance();
        });
    }
}`,
      hints: [
        "Constructor mein <code>this.owner = owner; this.balance = openingBalance;</code>",
        "Har method ki shuruaat mein invalid case pe <code>return false;</code> (guard clause).",
        "withdraw: <code>if (amount &lt;= 0 || amount &gt; balance) return false; balance -= amount; return true;</code>"
      ],
      solution: `class BankAccount {
    private final String owner;
    private long balance;

    BankAccount(String owner, long openingBalance) {
        this.owner = owner;
        this.balance = openingBalance;
    }

    BankAccount(String owner) {
        this(owner, 0);
    }

    boolean deposit(long amount) {
        if (amount <= 0) return false;
        balance += amount;
        return true;
    }

    boolean withdraw(long amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        return true;
    }

    long getBalance() { return balance; }
    String getOwner() { return owner; }
}`,
      explain: "<p>State (<code>balance</code>) <code>private</code> hai aur sirf <code>deposit</code>/<code>withdraw</code> se badalti hai, to balance kabhi negative nahi ho sakta. Ye rule (invariant) class khud enforce karti hai, caller pe bharosa nahi. <code>owner</code> <code>final</code> hai kyunki account ka owner badalta nahi.</p><p>Follow-up jo interviewer puchh sakta hai: do threads ek saath withdraw karein to? (Race condition: <code>synchronized</code> ya <code>AtomicLong</code>, concurrency module mein.)</p>"
    },
    {
      type: "think",
      id: "think-constructor",
      q: "Interview question: <b>\"Constructor aur normal method mein kya farak hai? Kya constructor private ho sakta hai, aur kyun karoge?\"</b>",
      rubric: [
        { point: "Constructor ka naam class jaisa aur <b>koi return type nahi</b>", keys: ["return type", "naam class", "same name", "class ka naam"], weight: 2 },
        { point: "Sirf object banate waqt (<code>new</code>) ek baar chalta hai; method kabhi bhi kitni baar bhi", keys: ["new", "ek baar", "once", "object banate", "creation"] },
        { point: "Constructors inherit nahi hote; <code>this()</code>/<code>super()</code> pehli line", keys: ["inherit", "this(", "super(", "pehli line", "first line", "first statement"] },
        { point: "Haan, private constructor: <b>Singleton</b>, static factory methods, ya utility class (Math) jiska object nahi banana", keys: ["singleton", "factory", "utility", "of(", "instance banne"], weight: 2 },
        { point: "Default constructor tabhi milta hai jab koi constructor na likha ho", keys: ["default constructor", "no-arg", "no arg"] }
      ],
      answer: `<p><b>Farak:</b></p>
                <ul><li>Constructor ka naam class ke naam jaisa hota hai aur <b>return type nahi</b> hota. Method ka koi bhi naam, aur return type (ya void) zaroori.</li>
                <li>Constructor <code>new</code> ke saath <b>ek baar</b> chalta hai, object ko valid state mein laane ke liye. Method object pe kabhi bhi call hota hai.</li>
                <li>Constructors <b>inherit nahi</b> hote aur override nahi ho sakte. <code>this(...)</code> ya <code>super(...)</code> sirf pehli line pe.</li>
                <li>Koi constructor nahi likha to compiler no-arg default deta hai; ek bhi likha to nahi.</li></ul>
                <p><b>Private constructor:</b> haan. Use cases: (1) <b>Singleton</b>: bahar se <code>new</code> band, ek <code>getInstance()</code>. (2) <b>Static factory</b>: <code>List.of(...)</code>, <code>LocalDate.of(...)</code> jaise naam wale creation methods, caching ke saath. (3) <b>Utility class</b> (<code>Math</code>, <code>Collections</code>) jiska object banana bekaar hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> LLD/machine coding mein class likhte waqt bolo: \"Constructor mein validation, fields private, aur jo nahi badalna wo final.\" Object kabhi invalid state mein exist hi na kare, ye ek line aapko junior se alag dikhati hai."
    }
  ],
  references: [
    { title: "Classes and Objects (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/index.html", type: "docs" },
    { title: "Providing Constructors for Your Classes", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/constructors.html", type: "docs" },
    { title: "Using the this Keyword", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/thiskey.html", type: "docs" },
    { title: "Creating Classes", by: "dev.java", url: "https://dev.java/learn/classes-objects/creating-classes/", type: "docs" }
  ]
});
