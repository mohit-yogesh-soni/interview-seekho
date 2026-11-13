// UML class diagram
registerLesson("lld", "uml", {
  why: "LLD interview mein code se pehle class diagram banta hai (whiteboard / Excalidraw). Usme do cheezein saaf honi chahiye: har class mein kya hai, aur classes ka rishta kya hai. Ye lesson utna hi UML sikhata hai jitna interview mein kaam aata hai, aur har symbol ko code se jodta hai taaki ratna na pade.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Class box: 3 hisse</h2>
        <pre class="diagram">
┌──────────────────────────────┐
│          ParkingSpot         │   ← naam (abstract ho to italic / «abstract»)
├──────────────────────────────┤
│ - id: String                 │   ← fields:  visibility naam: Type
│ - size: SpotSize             │
│ - vehicle: Vehicle [0..1]    │   ← [0..1] = ho bhi sakta hai, nahi bhi
├──────────────────────────────┤
│ + park(v: Vehicle): boolean  │   ← methods: visibility naam(params): ReturnType
│ + free(): void               │
│ # canFit(v: Vehicle): boolean│
└──────────────────────────────┘</pre>
        <table>
          <tr><th>Symbol</th><th>Java</th><th>Kab</th></tr>
          <tr><td><code>+</code></td><td>public</td><td>Bahar wale use karein (API)</td></tr>
          <tr><td><code>-</code></td><td>private</td><td>Default choice for fields</td></tr>
          <tr><td><code>#</code></td><td>protected</td><td>Subclasses ke liye</td></tr>
          <tr><td><code>~</code></td><td>package-private (default)</td><td>Same package</td></tr>
        </table>
        <p>Interview mein har getter/setter likhne ki zaroorat nahi. Sirf <b>important fields aur behaviour</b> (wo methods jo design ko define karte hain).</p>`
    },
    {
      type: "text",
      html: `
        <h2>6 relationships: kamzor se mazboot</h2>
        <p>Har rishta ek sawaal ka jawab hai: <b>"A ko B ke baare mein kitna pata hai, aur B kitna A pe nirbhar hai?"</b></p>
        <table>
          <tr><th>Rishta</th><th>Diagram</th><th>Matlab</th><th>Java mein kaisa dikhta hai</th></tr>
          <tr><td><b>Dependency</b> (uses)</td><td><code>A - - - &gt; B</code> (dashed arrow)</td><td>A kuch der ke liye B use karta hai</td><td>B method ka parameter / local variable hai, field nahi</td></tr>
          <tr><td><b>Association</b></td><td><code>A ──────&gt; B</code></td><td>A B ko jaanta hai (lambe time tak)</td><td>B ka reference A ka field hai</td></tr>
          <tr><td><b>Aggregation</b> (has-a, kamzor)</td><td><code>A ◇────── B</code> (khaali diamond A ki taraf)</td><td>A ke paas B hai, par B akela bhi jee sakta hai</td><td>B bahar se aata hai (constructor/add param), A ke jaane pe B zinda</td></tr>
          <tr><td><b>Composition</b> (owns, mazboot)</td><td><code>A ◆────── B</code> (bhara diamond)</td><td>B, A ka hissa hai; A gaya to B bhi gaya</td><td>A khud B banata hai (<code>new</code> andar), B bahar share nahi hota</td></tr>
          <tr><td><b>Inheritance</b> (is-a)</td><td><code>B ──────▷ A</code> (khaali triangle parent pe)</td><td>B ek A hai</td><td><code>class B extends A</code></td></tr>
          <tr><td><b>Realization</b> (implements)</td><td><code>B - - - -▷ A</code> (dashed + triangle)</td><td>B, A ka contract poora karta hai</td><td><code>class B implements A</code></td></tr>
        </table>
        <h3>Aggregation vs Composition ka ek test</h3>
        <p><b>"Agar owner delete ho jaaye, to kya part ka koi matlab bachta hai?"</b></p>
        <ul>
          <li>House ◆── Room: ghar gira to room bhi gaya. <b>Composition.</b></li>
          <li>Team ◇── Player: team toot gayi, player doosri team join karega. <b>Aggregation.</b></li>
          <li>Order ◆── OrderItem: order delete to uske line items ka koi matlab nahi. <b>Composition.</b> (DB mein: <code>ON DELETE CASCADE</code>.)</li>
        </ul>`
    },
    {
      type: "code",
      title: "Teeno 'has' rishte code mein: composition, aggregation, dependency",
      code: `import java.util.*;

public class Main {
    static class Room {                               // part
        final String name;
        Room(String name) { this.name = name; }
    }

    static class House {                              // House ◆── Room (composition)
        private final List<Room> rooms = new ArrayList<>();
        House(String... roomNames) {
            for (String n : roomNames) rooms.add(new Room(n));   // House khud banata hai
        }
        List<String> roomNames() {                    // Room objects bahar nahi dete, sirf info
            List<String> out = new ArrayList<>();
            for (Room r : rooms) out.add(r.name);
            return out;
        }
    }

    static class Player {
        final String name;
        Player(String name) { this.name = name; }
    }

    static class Team {                               // Team ◇── Player (aggregation)
        private final List<Player> players = new ArrayList<>();
        void add(Player p) { players.add(p); }        // player bahar se aaya
        int size() { return players.size(); }
    }

    static class Printer {                            // Printer - - -> Team (dependency)
        String print(Team t) { return "team size = " + t.size(); }   // sirf parameter, field nahi
    }

    public static void main(String[] args) {
        House h = new House("kitchen", "bedroom");
        System.out.println("house rooms: " + h.roomNames());
        h = null;                                     // house gaya → rooms ka bhi koi reference nahi

        Player virat = new Player("Virat");
        Team rcb = new Team();
        rcb.add(virat);
        Team india = new Team();
        india.add(virat);                             // same player do teams mein
        rcb = null;                                   // RCB gayi, Virat zinda
        System.out.println("player still here: " + virat.name + ", india size = " + india.size());

        System.out.println(new Printer().print(india));
    }
}`,
      note: "Java mein GC object delete karta hai, isliye composition ka asli matlab hai <b>ownership</b>: part sirf owner ke andar banta aur rehta hai, bahar koi aur use reference nahi rakhta."
    },
    {
      type: "text",
      html: `
        <h2>Multiplicity: kitne?</h2>
        <table>
          <tr><th>Likhte hain</th><th>Matlab</th><th>Java</th></tr>
          <tr><td><code>1</code></td><td>Exactly ek</td><td>Non-null field</td></tr>
          <tr><td><code>0..1</code></td><td>Ek ya koi nahi</td><td>Nullable field / <code>Optional</code></td></tr>
          <tr><td><code>*</code> ya <code>0..*</code></td><td>Kitne bhi (zero bhi)</td><td><code>List</code> / <code>Set</code> / <code>Map</code></td></tr>
          <tr><td><code>1..*</code></td><td>Kam se kam ek</td><td>List + constructor mein check</td></tr>
        </table>
        <pre class="diagram">
 ParkingLot 1 ◆────── 1..* Floor 1 ◆────── * ParkingSpot 0..1 ──────── 0..1 Vehicle
      "ek lot ke 1 ya zyada floors, har floor ke kai spots, ek spot pe max ek vehicle"</pre>
        <p>Diagram ko <b>zor se padh ke</b> check karo: "ek ParkingLot ke ek ya zyada Floor hain". Agar sentence galat lage, multiplicity galat hai.</p>
        <p><b>Multiplicity seedha DB tak jaati hai:</b> 1-to-many → "many" wali table mein foreign key (<code>spot.floor_id</code>). Many-to-many (Student * ── * Course) → beech mein junction table (<code>enrollment(student_id, course_id)</code>). DB design lesson mein detail.</p>`
    },
    {
      type: "quiz",
      q: "<code>class Order { private final List&lt;OrderItem&gt; items = new ArrayList&lt;&gt;(); void addItem(String productId, int qty) { items.add(new OrderItem(productId, qty)); } }</code> — Order aur OrderItem ka rishta kya hai?",
      options: [
        "Dependency",
        "Aggregation",
        "Composition",
        "Inheritance"
      ],
      answer: 2,
      why: "Order khud <code>new OrderItem(...)</code> banata hai, items bahar se nahi aate aur bahar share nahi hote, aur bina order ke item ka koi matlab nahi. Ownership = composition (bhara diamond Order ki taraf)."
    },
    {
      type: "pick",
      id: "pick-uml-rel",
      q: "Kaunse pairs <b>sahi</b> pehchaane gaye hain?",
      options: [
        { text: "<code>Library ◇── Book</code>: aggregation, kyunki library band ho to books doosri library mein jaa sakti hain", correct: true, why: "Book ki apni life hai. (Interview mein ye debatable hai; reason bolna zaroori hai, symbol se zyada.)" },
        { text: "<code>Car ◆── Engine</code> hamesha composition hai", correct: false, why: "Depend karta hai! Agar system mein engine nikaal ke doosri car mein lag sakta hai (garage software), to aggregation. Requirement decide karti hai, real world nahi." },
        { text: "<code>ReportService.generate(Database db)</code> jahan db sirf parameter hai: dependency", correct: true, why: "Field nahi hai, sirf method ke andar use. Dashed arrow." },
        { text: "<code>class Dog extends Animal</code>: realization", correct: false, why: "extends = inheritance (solid line + khaali triangle). Realization interface ke liye (implements)." },
        { text: "<code>Student * ── * Course</code>: many-to-many, DB mein junction table", correct: true, why: "Ek student kai courses, ek course mein kai students. enrollment(student_id, course_id) table." },
        { text: "<code>Customer 1 ── 0..1 Cart</code>: customer ke paas cart ho bhi sakti hai, nahi bhi", correct: true, why: "0..1 = optional, max ek." }
      ]
    },
    {
      type: "steps",
      title: "Requirement se diagram: step by step (Movie ticket ka chhota hissa)",
      steps: [
        { title: "Requirement", html: `<div class="ex-examples">"Ek <b>cinema</b> mein kai <b>screens</b> hain. Har screen mein <b>seats</b> hain. Ek <b>movie</b> ke kai <b>shows</b> hote hain, har show ek screen pe ek time pe. User show ki seats <b>book</b> karta hai."</div><p>Nouns: cinema, screen, seat, movie, show, user, booking (book verb ka record).</p>` },
        { title: "Physical cheezein: ownership", html: `<pre class="diagram">
Cinema 1 ◆──── 1..* Screen 1 ◆──── 1..* Seat</pre><p>Screen cinema ke bina nahi, seat screen ke bina nahi: composition.</p>` },
        { title: "Movie aur Show: association", html: `<pre class="diagram">
Movie 1 ──────── * Show * ──────── 1 Screen
                  (startTime)</pre><p>Movie ki apni life hai (kai cinemas mein chalti hai): show sirf use <b>refer</b> karta hai. Show ek screen pe hai, par screen show ki owner nahi.</p>` },
        { title: "Booking: action ka record", html: `<pre class="diagram">
User 1 ──── * Booking * ──── 1 Show
                │
                └── * ──── * Seat   (booking ki seats)</pre><p>"Book karna" verb hai par uska data hai (kaun, kaunsa show, kaunsi seats, status, amount), isliye entity bana. Isse double booking rokne ka sawaal bhi saaf dikhta hai: <b>ek show ki ek seat, ek hi active booking</b>.</p>` },
        { title: "Badalne wali cheezein: interface", html: `<pre class="diagram">
Booking - - - - > PricingStrategy «interface»
                     ▲            ▲
             WeekdayPricing   WeekendPricing</pre><p>Pricing rules badalte hain → interface + realization. Diagram ab code aur DB dono ka plan hai.</p>` }
      ]
    },
    {
      type: "exercise",
      id: "ex-uml-to-code",
      title: "Diagram se code: composition vs aggregation",
      level: "Easy",
      task: `<p>Ye diagram Java mein likho:</p>
        <pre class="diagram">
University 1 ◆────── * Department * ◇────── * Professor
  + addDepartment(name): Department       + addProfessor(p: Professor)
  + departmentNames(): List&lt;String&gt;       + professorCount(): int
  + close(): void                         + name(): String</pre>
        <ul>
          <li><b>Composition:</b> <code>University.addDepartment(name)</code> department <b>khud banaye</b>, apni list mein rakhe aur return kare. <code>close()</code> pe saare departments hat jaayein.</li>
          <li><b>Aggregation:</b> <code>Department.addProfessor(p)</code> bahar se bana professor le. Ek professor kai departments mein ho sakta hai, aur university band hone pe bhi professor object kaam karta rahe.</li>
          <li><code>Professor(String name)</code> with <code>name()</code>.</li>
          <li>Department ka constructor <b>public na ho</b> (sirf University bana sake): package-private ya private + factory, ya University ki nested class. Simple raasta: constructor package-private rakho.</li>
        </ul>`,
      examples: "<code>u.addDepartment(\"CS\").addProfessor(p)</code> → <code>u.departmentNames()</code> = <code>[\"CS\"]</code><br><code>u.close()</code> → <code>departmentNames()</code> = <code>[]</code>, par <code>p.name()</code> abhi bhi chalta hai",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Professor {
    private final String name;
    Professor(String name) { this.name = name; }
    String name() { return name; }
}

class Department {
    public Department(String name) { }        // TODO: public nahi hona chahiye
    void addProfessor(Professor p) { }
    int professorCount() { return 0; }
    String name() { return ""; }
}

class University {
    Department addDepartment(String name) { return null; }   // TODO
    List<String> departmentNames() { return List.of(); }
    void close() { }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("addDepartment + names", List.of("CS", "Maths"), () -> {
            University u = new University();
            u.addDepartment("CS");
            u.addDepartment("Maths");
            return u.departmentNames();
        });
        Check.eq("professor add + count", 2, () -> {
            University u = new University();
            Department cs = u.addDepartment("CS");
            cs.addProfessor(new Professor("A"));
            cs.addProfessor(new Professor("B"));
            return cs.professorCount();
        });
        Check.hiddenFromHere();
        Check.eq("close: departments gaye (composition)", List.of(), () -> {
            University u = new University();
            u.addDepartment("CS");
            u.close();
            return u.departmentNames();
        });
        Check.eq("close ke baad professor zinda + doosri university mein (aggregation)", List.of("Rao", 1), () -> {
            Professor rao = new Professor("Rao");
            University u1 = new University();
            u1.addDepartment("CS").addProfessor(rao);
            u1.close();
            University u2 = new University();
            Department d = u2.addDepartment("AI");
            d.addProfessor(rao);
            return List.of(rao.name(), d.professorCount());
        });
        Check.eq("ek professor do departments mein", List.of(1, 1), () -> {
            Professor p = new Professor("Iyer");
            University u = new University();
            Department a = u.addDepartment("A"), b = u.addDepartment("B");
            a.addProfessor(p); b.addProfessor(p);
            return List.of(a.professorCount(), b.professorCount());
        });
        Check.eq("department name", "Physics", () -> new University().addDepartment("Physics").name());
        Check.eq("Department ka constructor public nahi", false, () -> {
            for (Constructor<?> c : Department.class.getDeclaredConstructors()) {
                if (Modifier.isPublic(c.getModifiers())) return true;
            }
            return false;
        });
        Check.eq("departmentNames ki list bahar se badle to university na badle", List.of("CS"), () -> {
            University u = new University();
            u.addDepartment("CS");
            try { u.departmentNames().add("Hack"); } catch (UnsupportedOperationException e) { }
            return u.departmentNames();
        });
    }
}`,
      hints: [
        "University mein <code>private final List&lt;Department&gt; departments = new ArrayList&lt;&gt;();</code>. <code>addDepartment</code>: <code>Department d = new Department(name); departments.add(d); return d;</code>. close: <code>departments.clear()</code>.",
        "Department mein <code>private final List&lt;Professor&gt; professors</code>; constructor se <code>public</code> hata do (package-private).",
        "<code>departmentNames()</code> har baar nayi list banaye (ya <code>List.copyOf</code>), taaki bahar wala andar ki list na badal sake."
      ],
      solution: `import java.util.*;

class Professor {
    private final String name;
    Professor(String name) { this.name = name; }
    String name() { return name; }
}

class Department {
    private final String name;
    private final List<Professor> professors = new ArrayList<>();   // aggregation: bahar se aate hain

    Department(String name) { this.name = name; }                   // package-private: sirf University banaye

    void addProfessor(Professor p) { professors.add(p); }
    int professorCount() { return professors.size(); }
    String name() { return name; }
}

class University {
    private final List<Department> departments = new ArrayList<>(); // composition: khud banata hai

    Department addDepartment(String name) {
        Department d = new Department(name);
        departments.add(d);
        return d;
    }

    List<String> departmentNames() {
        List<String> out = new ArrayList<>();
        for (Department d : departments) out.add(d.name());
        return out;
    }

    void close() {
        departments.clear();
    }
}`,
      explain: "<p><b>Composition</b> ka code-level matlab: owner khud part banata hai (<code>new Department</code> andar), lifecycle control karta hai (<code>close</code>), aur part ko akela banne nahi deta (constructor public nahi). <b>Aggregation</b>: part bahar se aata hai aur owner ke baad bhi jeeta hai, share bhi ho sakta hai.</p><p>DB mein yahi: <code>department.university_id ... ON DELETE CASCADE</code> (composition), aur professors ke liye <code>department_professor</code> junction table without cascade on professor (aggregation, many-to-many).</p>"
    },
    {
      type: "think",
      id: "think-uml-draw",
      q: "Transfer check: <b>\"Food delivery: Restaurant ke menu mein dishes hain. Customer order karta hai jisme kai dishes (quantity ke saath). Har order ka ek delivery partner hota hai. Payment UPI, card ya COD se.\"</b> Relationships likho (kaun kisse, kaunsa type, multiplicity).",
      rubric: [
        { point: "Restaurant <b>◆ composition</b> Menu/Dish (1 → *)", keys: ["restaurant", "menu", "dish"], weight: 1 },
        { point: "Order <b>◆ composition</b> OrderItem (dish + quantity), OrderItem → Dish association", keys: ["orderitem", "order item", "lineitem", "line item", "quantity"], weight: 2 },
        { point: "Customer 1 ── * Order (association)", keys: ["customer 1", "customer", "1 ── *", "1 to many", "1-*", "one to many", "1..*", "kai order"], weight: 1 },
        { point: "Order * ── 0..1 / 1 DeliveryPartner (association; partner ki apni life)", keys: ["deliverypartner", "delivery partner", "rider", "0..1", "association"], weight: 2 },
        { point: "Payment <b>interface</b> + UPI/Card/COD realization (ya PaymentMethod strategy)", keys: ["payment", "interface", "upi", "card", "cod", "realization", "implements"], weight: 2 }
      ],
      answer: `<pre class="diagram">
Restaurant 1 ◆──── * Dish (name, price)
Customer   1 ────── * Order (status, total)
Order      1 ◆──── 1..* OrderItem (qty) * ──── 1 Dish
Order      * ────── 0..1 DeliveryPartner        (assign hone tak 0)
Order      1 ────── 1 Payment
Payment «interface»  ◁- - - UpiPayment, CardPayment, CashOnDelivery</pre>
        <ul>
          <li>Dish ko order <b>own</b> nahi karta (dish menu mein rehti hai), isliye OrderItem → Dish association. OrderItem mein <b>price ka snapshot</b> bhi rakho: kal menu price badle to purane order ka bill na badle.</li>
          <li>DeliveryPartner 0..1: order banne ke turant baad partner assign nahi hota.</li>
          <li>Payment ke tareeke badalte/badhte hain → interface.</li>
        </ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Whiteboard pe perfect UML symbols ki zaroorat nahi. Zaroori hai: (1) class box mein main fields/methods, (2) arrows pe <b>rishte ka naam aur multiplicity</b> likhna (\"1 lot has 1..* floors\"), (3) composition vs aggregation bolte waqt <i>reason</i>: \"owner delete hone pe part ka matlab bachta hai ya nahi.\""
    }
  ],
  references: [
    { title: "UML Distilled (3rd ed.), Ch. 3 & 5: Class diagrams", by: "Martin Fowler", type: "book" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: Design Patterns (har pattern ka UML)", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns", type: "article" }
  ]
});
