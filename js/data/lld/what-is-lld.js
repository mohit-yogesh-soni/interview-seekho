// LLD kya hai aur interview kaise hota hai
registerLesson("lld", "what-is-lld", {
  why: "LLD round mein code se zyada aapki soch judge hoti hai: requirements kaise clear kiye, classes kaise nikaali, aur badlav aane pe design kitna tikta hai. Is lesson mein ek simple, repeatable process milega jo kisi bhi naye problem pe chalega, ratne ki zaroorat nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>LLD vs HLD: ek ghar ka example</h2>
        <p><b>HLD (High Level Design)</b> = city planner ka naksha: kitne buildings, sadak kahan, paani ki tanki, bijli. Software mein: services, database, cache, queue, load balancer, aur ye sab aapas mein kaise baat karte hain.</p>
        <p><b>LLD (Low Level Design)</b> = ek flat ka interior plan: kaunsa kamra kis kaam ka, darwaaze kahan, wiring kaise. Software mein: <b>ek service ke andar</b> classes, unke fields aur methods, interfaces, relationships, design patterns, aur DB tables.</p>
        <table>
          <tr><th></th><th>HLD</th><th>LLD</th></tr>
          <tr><td>Sawaal</td><td>"YouTube design karo" (lakhon users)</td><td>"Parking lot ki classes design karo"</td></tr>
          <tr><td>Building blocks</td><td>Servers, DB, cache, queue, CDN</td><td>Classes, interfaces, enums, methods, tables</td></tr>
          <tr><td>Concern</td><td>Scale, availability, latency</td><td>Correctness, extensibility, readability, testability</td></tr>
          <tr><td>Output</td><td>Box-arrow diagram</td><td>Class diagram + working code (aksar 30-45 min mein)</td></tr>
        </table>
        <p>Dono ka ek hi sawaal hai: <b>kal requirement badli to kitna todna padega?</b> HLD mein traffic badhta hai, LLD mein features badhte hain.</p>`
    },
    {
      type: "quiz",
      q: "Inme se kaunsa sawaal <b>LLD</b> ka hai?",
      options: [
        "Har din 10 crore messages ke liye WhatsApp ka storage kaise scale karoge?",
        "Splitwise mein expense ko equal, exact aur percentage mein baantne ka code aise likho ki naya split type aasaani se jud sake",
        "CDN kab lagana chahiye?",
        "Database ko kaise shard karoge?"
      ],
      answer: 1,
      why: "Splitwise wala sawaal classes aur extensibility ka hai (Strategy pattern ka classic case). Baaki teeno scale/infra ke hain: HLD."
    },
    {
      type: "text",
      html: `
        <h2>Interviewer kya dekhta hai</h2>
        <ul>
          <li><b>Requirements clarify karna</b>: seedha code pe kood jaana red flag hai. Scope chhota karna skill hai.</li>
          <li><b>Sahi entities aur responsibilities</b>: har class ka ek saaf kaam. "God class" (ek class sab kare) nahi.</li>
          <li><b>Extensibility</b>: naya vehicle type / payment method / split type jodne pe purana code kam se kam badle.</li>
          <li><b>OOP / SOLID ka natural use</b>: pattern ka naam lena zaroori nahi, problem ke hisaab se sahi jagah lagna zaroori hai.</li>
          <li><b>Working code</b> (core flow) aur edge cases (spot full, invalid move, double booking).</li>
          <li><b>Communication</b>: trade-off bolna ("main yahan enum rakh raha hoon kyunki types fixed hain; badalne lage to interface").</li>
        </ul>`
    },
    {
      type: "order",
      id: "order-lld-flow",
      q: "45 minute ke LLD round ka sahi flow lagao:",
      items: [
        "Requirements clarify karo: kya features chahiye, kya scope se bahar hai (5 min)",
        "Entities nikaalo: requirements ke nouns dekho (5 min)",
        "Relationships aur responsibilities: kaun kisko rakhta hai, kaun kya karta hai (5 min)",
        "Class diagram + main interfaces / methods (APIs) (10 min)",
        "Core flow ka code likho (15 min)",
        "Edge cases, extensibility aur trade-offs pe baat (5 min)"
      ],
      why: "<p>Ye order isliye ki har step agle ka input hai: requirements se nouns, nouns se entities, entities se relationships, phir unke methods, phir code. Bich mein interviewer ko har step dikhate raho, taaki galat direction mein 20 minute na jaayein.</p>"
    },
    {
      type: "text",
      html: `
        <h2>Khud classes kaise nikaalein: 5 sawaalon ki list</h2>
        <p>Ye list kisi bhi problem pe chalti hai. Isko ratna nahi, har problem pe chala ke dekhna hai.</p>
        <table>
          <tr><th>#</th><th>Sawaal</th><th>Kya milta hai</th></tr>
          <tr><td>1</td><td>Requirements mein <b>nouns</b> (sangya) kaun se hain?</td><td>Candidate classes (Book, Member, Loan)</td></tr>
          <tr><td>2</td><td><b>Verbs</b> kaun se hain, aur kaam kiska hai?</td><td>Methods, aur wo kis class mein jaayenge</td></tr>
          <tr><td>3</td><td>Kis cheez ke <b>fixed types</b> hain aur kiske badal sakte hain?</td><td>Fixed → enum. Badalne wale → interface + implementations</td></tr>
          <tr><td>4</td><td>Kis cheez ka <b>state</b> time ke saath badalta hai?</td><td>Status fields (ISSUED, RETURNED), kabhi State pattern</td></tr>
          <tr><td>5</td><td>Kaun kisko <b>"rakhta" (has-a)</b> hai, aur kitne?</td><td>Fields, lists, relationships (1-to-many)</td></tr>
        </table>
        <p><b>Ek noun class nahi bhi ho sakta:</b> agar uska koi apna data ya behaviour nahi, to wo bas ek field hai. "Naam", "date" class nahi, attribute hain.</p>`
    },
    {
      type: "think",
      id: "think-cart-entities",
      q: "Is requirement ko padh ke <b>classes aur unke main fields/methods</b> likho (upar wali 5 sawaal list use karo):",
      context: `<div class="ex-examples">"Ek online grocery app mein <b>customer</b> apni <b>cart</b> mein <b>products</b> add/remove karta hai, har product ki <b>quantity</b> ho sakti hai. Cart ka <b>total price</b> dikhana hai. Checkout pe <b>order</b> banta hai jiska <b>status</b> PLACED → SHIPPED → DELIVERED hota hai. Kuch products pe <b>discount</b> lagta hai, aur discount ke tareeke badalte rehte hain (flat ₹50, 10% off, buy 2 get 1)."</div>`,
      rubric: [
        { point: "<b>Product</b> (id, name, price) aur <b>Cart</b> (items, add/remove, total)", keys: ["product", "cart"], weight: 2 },
        { point: "Quantity ke liye alag <b>CartItem / LineItem</b> (product + quantity), sirf Product ki list nahi", keys: ["cartitem", "cart item", "lineitem", "line item", "orderitem", "order item", "quantity"], weight: 2 },
        { point: "<b>Order</b> with <b>status enum</b> (PLACED, SHIPPED, DELIVERED)", keys: ["order", "status", "enum", "placed"], weight: 2 },
        { point: "Discount ke tareeke badalte hain → <b>interface</b> (DiscountStrategy) + alag implementations", keys: ["interface", "strategy", "discountstrategy", "discount policy", "polymorph"], weight: 2 },
        { point: "<b>Customer</b> (id, name) jiske paas cart / orders", keys: ["customer", "user"] }
      ],
      answer: `<pre class="diagram">
Customer ──has 1──► Cart ──has *──► CartItem ──refers──► Product
    │                 │                (product, qty)      (id, name, price)
    │                 └─ uses ─► DiscountStrategy (interface)
    │                              ├─ FlatDiscount(50)
    │                              ├─ PercentDiscount(10)
    │                              └─ BuyXGetY(2, 1)
    └──has *──► Order (items, total, status: OrderStatus enum)</pre>
        <ul>
          <li><b>Nouns:</b> customer, cart, product, quantity, order, status, discount. "Quantity" akela class nahi, par <b>product + quantity</b> ki jodi ek concept hai: <code>CartItem</code>.</li>
          <li><b>Verbs:</b> add/remove → <code>Cart</code>. total → <code>Cart.total()</code> (cart ke paas items hain, to hisaab bhi wahi kare). checkout → Cart se <code>Order</code> banana.</li>
          <li><b>Fixed vs badalne wala:</b> status ki values fixed hain → <code>enum OrderStatus</code>. Discount ke tareeke badalte hain → <code>interface DiscountStrategy { double apply(Cart cart); }</code>. Naya offer = nayi class, purana code nahi chhuna.</li>
          <li><b>State:</b> Order ka status badalta hai, to transitions (PLACED → SHIPPED) ke rules Order mein.</li>
        </ul>`
    },
    {
      type: "code",
      title: "Upar wala design, chhota working version",
      code: `import java.util.*;

public class Main {
    record Product(String id, String name, double price) {}

    static class CartItem {
        final Product product;
        int qty;
        CartItem(Product p, int qty) { this.product = p; this.qty = qty; }
        double subtotal() { return product.price() * qty; }
    }

    interface DiscountStrategy {             // badalne wali cheez interface ke peeche
        double discount(double subtotal);
    }

    static class FlatDiscount implements DiscountStrategy {
        private final double amount;
        FlatDiscount(double amount) { this.amount = amount; }
        public double discount(double subtotal) { return Math.min(amount, subtotal); }
    }

    static class PercentDiscount implements DiscountStrategy {
        private final double pct;
        PercentDiscount(double pct) { this.pct = pct; }
        public double discount(double subtotal) { return subtotal * pct / 100; }
    }

    static class Cart {
        private final Map<String, CartItem> items = new LinkedHashMap<>();
        private DiscountStrategy discount = subtotal -> 0;     // default: koi discount nahi

        void add(Product p, int qty) {
            items.computeIfAbsent(p.id(), k -> new CartItem(p, 0)).qty += qty;
        }
        void remove(String productId) { items.remove(productId); }
        void setDiscount(DiscountStrategy d) { this.discount = d; }

        double total() {
            double sub = 0;
            for (CartItem i : items.values()) sub += i.subtotal();
            return sub - discount.discount(sub);
        }
    }

    public static void main(String[] args) {
        Product milk = new Product("p1", "Milk", 30);
        Product bread = new Product("p2", "Bread", 45);
        Cart cart = new Cart();
        cart.add(milk, 2);
        cart.add(bread, 1);
        cart.add(milk, 1);                       // same product: quantity badhi, naya item nahi
        System.out.println("total = " + cart.total());           // 3*30 + 45 = 135
        cart.setDiscount(new FlatDiscount(50));
        System.out.println("flat 50 ke baad = " + cart.total());
        cart.setDiscount(new PercentDiscount(10));
        System.out.println("10% ke baad = " + cart.total());
    }
}`,
      note: "Dhyaan do: Cart ko pata hi nahi ki discount flat hai ya percent. Naya \"buy 2 get 1\" offer aaye to bas ek nayi class likhni hai, Cart bilkul nahi badlega. Yahi extensibility interviewer dekhta hai."
    },
    {
      type: "pick",
      id: "pick-red-flags",
      q: "LLD interview mein kaunse kaam <b>red flag</b> maane jaate hain?",
      options: [
        { text: "Requirements pooche bina seedha code likhna shuru karna", correct: true, why: "Interviewer jaanboojh ke problem vague deta hai. Clarify karna hi pehla test hai." },
        { text: "Har feature ke liye pattern ka naam ratke daalna, chahe zaroorat na ho", correct: true, why: "Over-engineering. Pattern tab jab problem use maange (kuch badalne wala ho)." },
        { text: "Ek <code>ParkingLotManager</code> class jisme saara logic (pricing, spots, tickets, payment)", correct: true, why: "God class. Har class ka ek kaam hona chahiye (Single Responsibility)." },
        { text: "Scope chhota karna: \"payment gateway integration out of scope rakhte hain, ek interface rakhunga\"", correct: false, why: "Ye achhi baat hai: time limited hai, aur interface se baad mein jod sakte ho." },
        { text: "Fixed values (vehicle size SMALL/MEDIUM/LARGE) ke liye enum use karna", correct: false, why: "Sahi choice. Type fixed hain to enum simple aur safe hai." },
        { text: "Trade-off bolna: \"abhi in-memory map rakh raha hoon, production mein repository interface ke peeche DB\"", correct: false, why: "Senior signal. Interviewer yahi sunna chahta hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-cart",
      title: "Cart ko poora karo: quantity, remove, aur naya discount type",
      level: "Easy",
      task: `<p>Neeche diye design ko poora karo:</p>
        <ul>
          <li><code>Cart.add(product, qty)</code>: same product dobara aaye to quantity jodo.</li>
          <li><code>Cart.removeOne(productId)</code>: quantity 1 kam karo; 0 ho jaaye to item hata do. Product cart mein na ho to kuch mat karo.</li>
          <li><code>Cart.total()</code>: saare items ka subtotal minus discount. Discount kabhi subtotal se zyada nahi (total negative nahi).</li>
          <li>Nayi class <code>BuyXGetYFree</code> (<code>DiscountStrategy</code> implement kare): constructor <code>(productId, x, y)</code>. Us product ke har (x + y) items mein se y free. Jaise buy 2 get 1: 3 milk → 1 free, 7 milk → 2 free.</li>
        </ul>
        <p>Dhyaan: <code>DiscountStrategy</code> ab poori cart (items) dekhta hai, kyunki BuyXGetY ko quantity chahiye.</p>`,
      examples: "milk ₹30 × 3, bread ₹45 × 1, discount <code>BuyXGetYFree(\"milk\", 2, 1)</code> → 135 − 30 = <code>105.0</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

record Product(String id, String name, double price) {}

class CartItem {
    final Product product;
    int qty;
    CartItem(Product product, int qty) { this.product = product; this.qty = qty; }
}

interface DiscountStrategy {
    double discount(Collection<CartItem> items);
}

class NoDiscount implements DiscountStrategy {
    public double discount(Collection<CartItem> items) { return 0; }
}

class FlatDiscount implements DiscountStrategy {
    private final double amount;
    FlatDiscount(double amount) { this.amount = amount; }
    public double discount(Collection<CartItem> items) { return amount; }
}

class BuyXGetYFree implements DiscountStrategy {
    BuyXGetYFree(String productId, int x, int y) { }
    public double discount(Collection<CartItem> items) { return 0; }   // TODO
}

class Cart {
    private final Map<String, CartItem> items = new LinkedHashMap<>();
    private DiscountStrategy discount = new NoDiscount();

    void setDiscount(DiscountStrategy d) { discount = d; }

    void add(Product p, int qty) {
        items.put(p.id(), new CartItem(p, qty));   // TODO: quantity jodo
    }

    void removeOne(String productId) {
        // TODO
    }

    double total() {
        double sub = 0;
        for (CartItem i : items.values()) sub += i.product.price() * i.qty;
        return sub - discount.discount(items.values());   // TODO: negative nahi
    }
}`,
      harness: `import seekho.Check;

public class Main {
    static final Product MILK = new Product("milk", "Milk", 30);
    static final Product BREAD = new Product("bread", "Bread", 45);

    public static void main(String[] args) {
        Check.eq("add same product twice", 135.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 2); c.add(BREAD, 1); c.add(MILK, 1);
            return c.total();
        });
        Check.eq("buy 2 get 1 on milk x3 + bread", 105.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 3); c.add(BREAD, 1);
            c.setDiscount(new BuyXGetYFree("milk", 2, 1));
            return c.total();
        });
        Check.hiddenFromHere();
        Check.eq("buy 2 get 1, milk x7 → 2 free", 150.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 7);
            c.setDiscount(new BuyXGetYFree("milk", 2, 1));
            return c.total();
        });
        Check.eq("buy 2 get 1, milk x2 → kuch free nahi", 60.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 2);
            c.setDiscount(new BuyXGetYFree("milk", 2, 1));
            return c.total();
        });
        Check.eq("product cart mein nahi to offer 0", 45.0, () -> {
            Cart c = new Cart();
            c.add(BREAD, 1);
            c.setDiscount(new BuyXGetYFree("milk", 1, 1));
            return c.total();
        });
        Check.eq("removeOne: 3 → 2, aur missing pe crash nahi", 60.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 3);
            c.removeOne("milk");
            c.removeOne("eggs");
            return c.total();
        });
        Check.eq("removeOne last item hata de", 45.0, () -> {
            Cart c = new Cart();
            c.add(MILK, 1); c.add(BREAD, 1);
            c.removeOne("milk");
            c.add(MILK, 0);
            c.removeOne("milk");
            return c.total();
        });
        Check.eq("flat discount subtotal se bada: total 0, negative nahi", 0.0, () -> {
            Cart c = new Cart();
            c.add(BREAD, 1);
            c.setDiscount(new FlatDiscount(100));
            return c.total();
        });
    }
}`,
      hints: [
        "<code>add</code>: <code>items.computeIfAbsent(p.id(), k -&gt; new CartItem(p, 0)).qty += qty;</code>",
        "<code>removeOne</code>: item lo; null ho to return; <code>qty--</code>; <code>qty &lt;= 0</code> ho to map se hatao. <code>total</code> mein <code>Math.max(0, sub - discount)</code>.",
        "BuyXGetYFree: fields rakho. Items mein productId wala dhoondo. <code>free = (qty / (x + y)) * y</code>, discount = <code>free * price</code>."
      ],
      solution: `import java.util.*;

record Product(String id, String name, double price) {}

class CartItem {
    final Product product;
    int qty;
    CartItem(Product product, int qty) { this.product = product; this.qty = qty; }
}

interface DiscountStrategy {
    double discount(Collection<CartItem> items);
}

class NoDiscount implements DiscountStrategy {
    public double discount(Collection<CartItem> items) { return 0; }
}

class FlatDiscount implements DiscountStrategy {
    private final double amount;
    FlatDiscount(double amount) { this.amount = amount; }
    public double discount(Collection<CartItem> items) { return amount; }
}

class BuyXGetYFree implements DiscountStrategy {
    private final String productId;
    private final int x, y;

    BuyXGetYFree(String productId, int x, int y) {
        this.productId = productId;
        this.x = x;
        this.y = y;
    }

    public double discount(Collection<CartItem> items) {
        for (CartItem i : items) {
            if (i.product.id().equals(productId)) {
                int free = (i.qty / (x + y)) * y;
                return free * i.product.price();
            }
        }
        return 0;
    }
}

class Cart {
    private final Map<String, CartItem> items = new LinkedHashMap<>();
    private DiscountStrategy discount = new NoDiscount();

    void setDiscount(DiscountStrategy d) { discount = d; }

    void add(Product p, int qty) {
        items.computeIfAbsent(p.id(), k -> new CartItem(p, 0)).qty += qty;
    }

    void removeOne(String productId) {
        CartItem i = items.get(productId);
        if (i == null) return;
        i.qty--;
        if (i.qty <= 0) items.remove(productId);
    }

    double total() {
        double sub = 0;
        for (CartItem i : items.values()) sub += i.product.price() * i.qty;
        return Math.max(0, sub - discount.discount(items.values()));
    }
}`,
      explain: "<p>Naya offer (<code>BuyXGetYFree</code>) jodne ke liye <code>Cart</code> ka total ka logic nahi badla, bas ek nayi class aayi. Yahi \"badalne wali cheez ko interface ke peeche rakho\" ka fayda hai.</p><p>Har group of (x + y) mein y free: 7 milk, buy 2 get 1 → 7 / 3 = 2 groups → 2 free. <code>Math.max(0, ...)</code> jaise rules ek hi jagah (Cart.total) hain, har discount class mein repeat nahi.</p>"
    },
    {
      type: "think",
      id: "think-transfer-lld",
      q: "Naya problem (transfer check): <b>\"College library: members books issue karte hain, har book ki kai copies hoti hain, late return pe fine lagta hai, aur fine ka rule student aur faculty ke liye alag hai.\"</b> 5 sawaal list laga ke classes likho.",
      rubric: [
        { point: "<b>Book</b> (title, author, isbn) aur <b>BookCopy / BookItem</b> alag (ek book ki kai copies)", keys: ["bookcopy", "book copy", "bookitem", "book item", "copy", "copies"], weight: 2 },
        { point: "<b>Member</b> + type (Student / Faculty)", keys: ["member", "student", "faculty"], weight: 2 },
        { point: "Issue ka record: <b>Loan / Issue / BorrowRecord</b> (copy, member, issueDate, dueDate, returnDate)", keys: ["loan", "issue record", "borrow", "lending", "transaction", "due date", "duedate"], weight: 2 },
        { point: "Fine ka rule badalta hai → <b>FinePolicy interface</b> (StudentFine, FacultyFine)", keys: ["finepolicy", "fine policy", "finestrategy", "fine strategy", "interface", "strategy"], weight: 2 },
        { point: "Copy ka <b>status</b> (AVAILABLE, ISSUED, LOST) enum", keys: ["status", "available", "enum", "issued"] }
      ],
      answer: `<ul>
          <li><b>Book</b> (isbn, title, author) vs <b>BookCopy</b> (copyId, book, status). "Kai copies" sunte hi do concepts alag karo: catalog wali book ek hai, shelf pe copies kai.</li>
          <li><b>Member</b> (id, name, type). Type fixed hain to enum chalega, par fine ka <i>rule</i> alag hai, isliye:</li>
          <li><b>FinePolicy</b> interface: <code>double fine(long daysLate)</code>. <code>StudentFinePolicy</code> (₹5/din), <code>FacultyFinePolicy</code> (₹2/din, cap). Member type se sahi policy chuno.</li>
          <li><b>Loan</b> (copy, member, issueDate, dueDate, returnDate): "issue" ek verb hai jiska apna data hai (dates), isliye wo class ban gaya. Ye pattern bahut common hai: <i>jis action ka record rakhna ho, wo entity ban jaata hai</i> (Booking, Payment, Ticket).</li>
          <li><b>CopyStatus</b> enum: AVAILABLE, ISSUED, LOST.</li>
        </ul>
        <p>Isi problem ka poora design "Library Management" lesson mein aayega.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Pehle 5 minute zor se bolte hue requirements likho aur scope band karo: <i>\"Main ye 4 features cover karunga, payment aur notifications ko interface ke peeche rakh dunga.\"</i> Phir nouns/verbs se entities nikaalo aur interviewer se confirm karo. Yahi process har problem pe chalao. Answer yaad karne ki zaroorat nahi padegi."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: Design Patterns", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns", type: "article" },
    { title: "Gaurav Sen (YouTube): system design aur LLD videos", by: "Gaurav Sen", url: "https://www.youtube.com/@gkcs", type: "video" }
  ]
});
