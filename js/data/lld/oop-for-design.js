// Design ke liye OOP
registerLesson("lld", "oop-for-design", {
  why: "Zyaadatar design patterns do hi ideas pe bane hain: (1) inheritance ki jagah composition, (2) concrete class ki jagah interface pe depend karo. Ye do samajh aa gaye to Strategy, Decorator, Observer, Adapter khud se nikal aate hain, naam ratne ki zaroorat nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: inheritance se shuru kiya, phir classes ka dhamaka</h2>
        <p>Ek notification system. Shuru mein do channels:</p>
        <pre class="code-static">class Notification { void send(String to, String msg) { ... } }
class EmailNotification extends Notification { ... }
class SmsNotification   extends Notification { ... }</pre>
        <p>Naya feature: <b>urgent</b> messages (prefix "[URGENT]" aur bade letters). Inheritance se:</p>
        <pre class="code-static">class UrgentEmailNotification extends EmailNotification { ... }
class UrgentSmsNotification   extends SmsNotification   { ... }</pre>
        <p>Phir feature: <b>WhatsApp</b> channel, aur <b>Hindi translation</b> formatting. Ab kitni classes?</p>`
    },
    {
      type: "quiz",
      q: "3 channels (Email, SMS, WhatsApp) × 3 formats (Plain, Urgent, Hindi). Har combination ki alag subclass banayi to kitni classes chahiye? Aur ek naya channel jodne pe kitni naye?",
      options: [
        "6 classes; naya channel = 1 nayi class",
        "9 classes; naya channel = 3 nayi classes (har format ke liye ek)",
        "3 classes; naya channel = 1",
        "27 classes; naya channel = 9"
      ],
      answer: 1,
      why: "Inheritance mein do alag tarah ke badlav (channel aur format) multiply hote hain: 3 × 3 = 9. Naya channel aaya to har format ke saath ek: 3 aur. Ye <b>class explosion</b> hai. Composition se ye <b>add</b> hote hain: 3 + 3 = 6 classes, naya channel = 1 class."
    },
    {
      type: "text",
      html: `
        <h2>Composition: object ke andar object</h2>
        <p>Idea: jo cheezein <b>alag alag badalti hain</b>, unhe alag objects banao aur jodo.</p>
        <pre class="code-static">interface Channel   { String send(String to, String text); }   // KAHAN bhejna hai
interface Formatter { String format(String msg); }             // KAISE dikhana hai

class Notifier {
    private final Formatter formatter;          // has-a
    private final List&lt;Channel&gt; channels;     // has-a
    Notifier(Formatter f, List&lt;Channel&gt; cs) { formatter = f; channels = cs; }

    void notify(String to, String msg) {
        String text = formatter.format(msg);
        for (Channel c : channels) c.send(to, text);
    }
}

new Notifier(new UrgentFormatter(), List.of(new SmsChannel(), new EmailChannel()));</pre>
        <p>Urgent + SMS + Email ek saath, bina <code>UrgentSmsEmailNotification</code> jaisi class ke. Combination <b>runtime</b> pe banta hai, compile time pe nahi.</p>
        <h3>is-a vs has-a test</h3>
        <table>
          <tr><th>Sawaal</th><th>Haan → </th><th>Example</th></tr>
          <tr><td>Kya B <b>hamesha har jagah</b> A ki tarah use ho sakta hai, A ke saare promises nibhate hue?</td><td>Inheritance (is-a) theek</td><td><code>SavingsAccount</code> is-a <code>Account</code></td></tr>
          <tr><td>Kya B ke paas A <b>ek part / tool</b> ki tarah hai?</td><td>Composition (has-a)</td><td>Car has-a Engine, Notifier has-a Channel</td></tr>
          <tr><td>Kya behaviour <b>runtime pe badalna</b> hai, ya kai tarah ke badlav mix hone hain?</td><td>Composition</td><td>Formatter + Channel</td></tr>
        </table>
        <p><b>Golden rule (Gang of Four, 1994):</b> "Favor object composition over class inheritance." Inheritance galat nahi, par wo <b>tight</b> rishta hai: parent badla to saare children pe asar, aur ek class sirf ek parent extend kar sakti hai.</p>`
    },
    {
      type: "warn",
      html: `⚠️ <b>Inheritance ka chhupa khatra (fragile base class):</b>
        <pre class="code-static">class CountingSet extends HashSet&lt;String&gt; {
    int added = 0;
    @Override public boolean add(String s) { added++; return super.add(s); }
    @Override public boolean addAll(Collection&lt;? extends String&gt; c) { added += c.size(); return super.addAll(c); }
}</pre>
        <p><code>addAll(List.of("a","b"))</code> ke baad <code>added</code> = <b>4</b>, 2 nahi! Kyunki HashSet ka <code>addAll</code> andar se <code>add</code> call karta hai (AbstractCollection ki implementation), jo hamara override hai. Parent ki <i>internal</i> detail child ko tod deti hai. Composition (andar ek <code>Set</code> rakho aur call forward karo) mein ye problem nahi. (Effective Java, Item 18 isi ka classic example deta hai.)</p>`
    },
    {
      type: "code",
      title: "Khud dekho: inheritance wala counter galat ginta hai, composition wala sahi",
      code: `import java.util.*;

public class Main {
    static class CountingSet extends HashSet<String> {          // inheritance
        int added = 0;
        @Override public boolean add(String s) { added++; return super.add(s); }
        @Override public boolean addAll(Collection<? extends String> c) { added += c.size(); return super.addAll(c); }
    }

    static class CountingSet2 {                                    // composition
        private final Set<String> inner = new HashSet<>();
        int added = 0;
        boolean add(String s) { added++; return inner.add(s); }
        boolean addAll(Collection<? extends String> c) { added += c.size(); return inner.addAll(c); }
        int size() { return inner.size(); }
    }

    public static void main(String[] args) {
        CountingSet a = new CountingSet();
        a.addAll(List.of("x", "y", "z"));
        System.out.println("inheritance: added = " + a.added + " (expected 3)");

        CountingSet2 b = new CountingSet2();
        b.addAll(List.of("x", "y", "z"));
        System.out.println("composition: added = " + b.added + " (expected 3)");
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>Interface pe code karo, implementation pe nahi</h2>
        <p>Matlab: variables, parameters aur fields ka type <b>interface</b> rakho, concrete class nahi.</p>
        <pre class="code-static">List&lt;String&gt; names = new ArrayList&lt;&gt;();          // ✅ kal LinkedList kar sakte ho
ArrayList&lt;String&gt; names = new ArrayList&lt;&gt;();     // ❌ har jagah ArrayList se bandh gaye

class OrderService {
    private final PaymentGateway gateway;          // ✅ interface
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }   // bahar se do (dependency injection)
}</pre>
        <p><b>Teen fayde:</b></p>
        <ol>
          <li><b>Badalna aasaan:</b> Razorpay se Stripe pe jaana = nayi class <code>StripeGateway implements PaymentGateway</code>. OrderService nahi badlegi.</li>
          <li><b>Testing:</b> test mein <code>FakeGateway</code> do jo asli paise na kaate. Interface na ho to har test asli API hit karega.</li>
          <li><b>Parallel kaam:</b> ek dev OrderService likhe, doosra gateway, bas interface pe agree karo.</li>
        </ol>
        <p><b>Kab nahi:</b> agar kisi cheez ki ek hi implementation hai aur badalne ki koi wajah nahi (jaise ek <code>Money</code> value class), to interface banana bas extra file hai (YAGNI).</p>`
    },
    {
      type: "pick",
      id: "pick-isa-hasa",
      q: "Kaunse rishte <b>inheritance (is-a)</b> ke liye theek hain?",
      options: [
        { text: "<code>Manager extends Employee</code> (manager bhi ek employee hai, saare employee rules lagte hain)", correct: true, why: "Classic is-a, jab tak Manager Employee ke saare promises nibhata hai." },
        { text: "<code>Stack extends ArrayList</code>", correct: false, why: "Stack ko list ke saare methods (beech mein add/remove) mil jaayenge jo stack ke rules todte hain. Stack has-a list hona chahiye. (Java ka purana <code>Stack extends Vector</code> isi ki galti maana jaata hai.)" },
        { text: "<code>Car extends Engine</code> taaki car engine ke methods use kar sake", correct: false, why: "Car engine nahi hai; car ke paas engine hai. Code reuse ke liye inheritance mat lo." },
        { text: "<code>CreditCardPayment implements PaymentMethod</code>", correct: true, why: "Interface implement karna is-a ka sabse safe roop hai: sirf contract, koi parent ki state nahi." },
        { text: "<code>Square extends Rectangle</code> jahan Rectangle ke <code>setWidth</code> aur <code>setHeight</code> alag hain", correct: false, why: "Square width badalne pe height bhi badlega, jo Rectangle ka promise todta hai. Ye Liskov (SOLID ka L) ka classic counter-example hai." },
        { text: "<code>Penguin extends Bird</code> jahan Bird mein <code>fly()</code> hai", correct: false, why: "Penguin fly nahi karta, to fly() mein exception phenkega. Bird ka promise toota. Flying ko alag interface / capability banao." }
      ]
    },
    {
      type: "exercise",
      id: "ex-notifier",
      title: "Inheritance explosion ko composition se theek karo",
      level: "Easy",
      task: `<p>Notification system composition se banao:</p>
        <ul>
          <li><code>EmailChannel</code> aur <code>SmsChannel</code>, dono <code>Channel</code> implement karein. <code>send(to, text)</code> return kare: <code>"EMAIL to &lt;to&gt;: &lt;text&gt;"</code> aur <code>"SMS to &lt;to&gt;: &lt;text&gt;"</code>.</li>
          <li><code>PlainFormatter</code>: text waisa hi. <code>UrgentFormatter</code>: <code>"[URGENT] " + msg.toUpperCase()</code>.</li>
          <li><code>Notifier(Formatter, List&lt;Channel&gt;)</code>: <code>notify(to, msg)</code> har channel pe formatted text bheje (list ke order mein) aur saare return values ki list lautaye.</li>
        </ul>
        <p>Harness ek apna naya channel (Push) bhi jodta hai jo aapke code mein nahi hai. Agar Notifier sirf interface pe depend karta hai to wo bina kisi badlav ke chalega.</p>`,
      examples: "<code>new Notifier(new UrgentFormatter(), List.of(new SmsChannel()))</code><br><code>.notify(\"9876\", \"server down\")</code> → <code>[\"SMS to 9876: [URGENT] SERVER DOWN\"]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface Channel {
    String send(String to, String text);
}

interface Formatter {
    String format(String msg);
}

class EmailChannel implements Channel {
    public String send(String to, String text) { return ""; }   // TODO
}

class SmsChannel implements Channel {
    public String send(String to, String text) { return ""; }   // TODO
}

class PlainFormatter implements Formatter {
    public String format(String msg) { return msg; }
}

class UrgentFormatter implements Formatter {
    public String format(String msg) { return msg; }             // TODO
}

class Notifier {
    Notifier(Formatter formatter, List<Channel> channels) {
        // TODO: save karo
    }

    List<String> notify(String to, String msg) {
        return new ArrayList<>();                                 // TODO
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("urgent + sms", List.of("SMS to 9876: [URGENT] SERVER DOWN"),
            () -> new Notifier(new UrgentFormatter(), List.of(new SmsChannel())).notify("9876", "server down"));
        Check.eq("plain + email + sms (order)", List.of("EMAIL to a@x.com: hi", "SMS to a@x.com: hi"),
            () -> new Notifier(new PlainFormatter(), List.of(new EmailChannel(), new SmsChannel())).notify("a@x.com", "hi"));
        Check.hiddenFromHere();
        Check.eq("naya Push channel bina Notifier badle", List.of("PUSH(riya) [URGENT] OTP 1234"), () -> {
            Channel push = (to, text) -> "PUSH(" + to + ") " + text;
            return new Notifier(new UrgentFormatter(), List.of(push)).notify("riya", "otp 1234");
        });
        Check.eq("naya Hindi formatter bina Notifier badle", List.of("EMAIL to r: Namaste: hello"), () -> {
            Formatter hindi = m -> "Namaste: " + m;
            return new Notifier(hindi, List.of(new EmailChannel())).notify("r", "hello");
        });
        Check.eq("koi channel nahi → khaali list", List.of(), () -> new Notifier(new PlainFormatter(), List.of()).notify("x", "y"));
        Check.eq("format ek hi baar (har channel ko same text)", List.of("EMAIL to t: [URGENT] A", "SMS to t: [URGENT] A"),
            () -> new Notifier(new UrgentFormatter(), List.of(new EmailChannel(), new SmsChannel())).notify("t", "a"));
    }
}`,
      hints: [
        "Notifier mein do <code>private final</code> fields: <code>Formatter formatter</code> aur <code>List&lt;Channel&gt; channels</code>. Constructor mein assign karo.",
        "<code>notify</code>: <code>String text = formatter.format(msg);</code> phir har channel ka <code>send(to, text)</code> result list mein add.",
        "Channels: <code>return \"EMAIL to \" + to + \": \" + text;</code>. Urgent: <code>\"[URGENT] \" + msg.toUpperCase()</code>."
      ],
      solution: `import java.util.*;

interface Channel {
    String send(String to, String text);
}

interface Formatter {
    String format(String msg);
}

class EmailChannel implements Channel {
    public String send(String to, String text) { return "EMAIL to " + to + ": " + text; }
}

class SmsChannel implements Channel {
    public String send(String to, String text) { return "SMS to " + to + ": " + text; }
}

class PlainFormatter implements Formatter {
    public String format(String msg) { return msg; }
}

class UrgentFormatter implements Formatter {
    public String format(String msg) { return "[URGENT] " + msg.toUpperCase(); }
}

class Notifier {
    private final Formatter formatter;
    private final List<Channel> channels;

    Notifier(Formatter formatter, List<Channel> channels) {
        this.formatter = formatter;
        this.channels = List.copyOf(channels);
    }

    List<String> notify(String to, String msg) {
        String text = formatter.format(msg);
        List<String> out = new ArrayList<>();
        for (Channel c : channels) out.add(c.send(to, text));
        return out;
    }
}`,
      explain: "<p>Ab 2 channels + 2 formats = 4 classes (inheritance mein 4 combination classes + base). Push channel aur Hindi formatter <b>bina Notifier chhue</b> jud gaye, kyunki Notifier sirf interfaces jaanta hai. <code>List.copyOf</code>: bahar wala list badle to Notifier ka andar ka state na badle (defensive copy).</p><p>Yahi structure aage <b>Strategy</b> (Formatter ek strategy hai) aur <b>Observer</b> (channels listeners hain) patterns mein dikhega.</p>"
    },
    {
      type: "think",
      id: "think-composition-transfer",
      q: "Transfer check: <b>Game mein characters hain: Warrior, Mage, Archer. Har ek ka attack alag hai (sword, fireball, arrow). Ab requirement: player game ke beech weapon badal sake (Warrior bow utha le).</b> Inheritance se kya dikkat hai aur kaise design karoge?",
      rubric: [
        { point: "Inheritance mein attack class se bandha hai; runtime pe <b>badal nahi sakte</b>", keys: ["runtime", "badal nahi", "change nahi", "fixed", "compile time", "bandha"], weight: 2 },
        { point: "<b>Weapon interface</b> (Sword, Bow, FireStaff) aur Character <b>has-a</b> Weapon", keys: ["weapon", "interface", "has-a", "has a", "composition"], weight: 2 },
        { point: "<b>setWeapon()</b> se runtime pe swap; attack() weapon ko delegate", keys: ["setweapon", "set weapon", "swap", "delegate", "weapon.attack", "weapon.use"], weight: 2 },
        { point: "Naya weapon = nayi class, Character nahi badalta (open for extension)", keys: ["nayi class", "new class", "extension", "nahi badlega", "open"] }
      ],
      answer: `<p>Inheritance mein <code>Warrior.attack()</code> sword ke saath compile time pe likha hai. Warrior ko bow dena = nayi class <code>WarriorWithBow</code>? Wahi explosion.</p>
        <pre class="code-static">interface Weapon { int damage(); String use(); }
class Sword implements Weapon { ... }   class Bow implements Weapon { ... }

class Character {
    private Weapon weapon;                      // has-a, badal sakta hai
    Character(Weapon w) { weapon = w; }
    void setWeapon(Weapon w) { weapon = w; }    // runtime swap
    String attack() { return weapon.use(); }    // delegate
}</pre>
        <p>Warrior/Mage ab alag classes ho bhi sakte hain (health, armor alag), par <i>attack ka tareeka</i> composition se aata hai. Ye exactly <b>Strategy pattern</b> hai, jo aap ne bina naam jaane khud nikaal liya.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Jab bhi design mein \"type ke hisaab se alag behaviour\" dikhe, khud se poocho: <i>\"Kya ye badal sakta hai, ya kai cheezein mix hongi?\"</i> Haan → interface + composition. Interviewer ko bolo bhi: \"inheritance ki jagah composition le raha hoon taaki X aur Y independently badal sakein.\" Ye ek line senior signal hai."
    }
  ],
  references: [
    { title: "Effective Java (3rd ed.), Item 18: Favor composition over inheritance", by: "Joshua Bloch", type: "book" },
    { title: "Design Patterns: Elements of Reusable Object-Oriented Software (Ch. 1)", by: "Gamma, Helm, Johnson, Vlissides", type: "book" },
    { title: "Refactoring Guru: Design Patterns", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns", type: "article" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
