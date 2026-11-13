// State
registerLesson("lld", "state", {
  why: "Vending machine, order lifecycle, elevator, ATM, traffic light: jahan object ka behaviour uski current state pe depend kare aur galat transitions rokne hon. State pattern (ya kam se kam ek saaf transition table) LLD problems mein bahut baar chahiye.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: har method mein status ka if-else</h2>
        <pre class="code-static">void insertCoin()   { if (state == IDLE) state = HAS_COIN; else if (state == HAS_COIN) refund(); else if (state == SOLD_OUT) ... }
void selectItem()   { if (state == IDLE) error(); else if (state == HAS_COIN) { dispense(); ... } else if ... }
void cancel()       { if ... else if ... else if ... }</pre>
        <p>4 states × 4 actions = 16 cases, har method mein bikhre hue. Naya state (MAINTENANCE) = har method edit. Aur galat transition (DELIVERED → PLACED) kahin bhi ho sakta hai.</p>
        <h3>Do achhe tareeke</h3>
        <table>
          <tr><th>Tareeka</th><th>Kya</th><th>Kab</th></tr>
          <tr><td><b>Transition table</b> (enum + map)</td><td><code>allowed: PLACED → {PACKED, CANCELLED}</code>. Ek jagah saare rules</td><td>States ka behaviour simple hai, sirf "kaun kahan jaa sakta hai" check</td></tr>
          <tr><td><b>State pattern</b></td><td>Har state ek class; context current state object ko action delegate karta hai, aur state khud agla state set karti hai</td><td>Har state mein actions ka <i>behaviour</i> alag aur bada (vending machine)</td></tr>
        </table>
        <pre class="diagram">
                 insertCoin           select (stock &gt; 0)
     ┌──────┐ ────────────► ┌──────────┐ ─────────────► dispense → IDLE
     │ IDLE │               │ HAS_COIN │
     └──────┘ ◄──────────── └──────────┘
          ▲      cancel (refund)      │ select (stock == 0 hua)
          │                           ▼
          └──── restock ──────── SOLD_OUT</pre>`
    },
    {
      type: "code",
      title: "Transition table: order lifecycle mein galat move rokna",
      code: `import java.util.*;

public class Main {
    enum Status { PLACED, PACKED, SHIPPED, DELIVERED, CANCELLED }

    static final Map<Status, Set<Status>> ALLOWED = Map.of(
        Status.PLACED, EnumSet.of(Status.PACKED, Status.CANCELLED),
        Status.PACKED, EnumSet.of(Status.SHIPPED, Status.CANCELLED),
        Status.SHIPPED, EnumSet.of(Status.DELIVERED),
        Status.DELIVERED, EnumSet.noneOf(Status.class),
        Status.CANCELLED, EnumSet.noneOf(Status.class)
    );

    static class Order {
        Status status = Status.PLACED;
        void moveTo(Status next) {
            if (!ALLOWED.get(status).contains(next))
                throw new IllegalStateException(status + " → " + next + " allowed nahi");
            status = next;
        }
    }

    public static void main(String[] args) {
        Order o = new Order();
        o.moveTo(Status.PACKED);
        o.moveTo(Status.SHIPPED);
        try { o.moveTo(Status.CANCELLED); }
        catch (IllegalStateException e) { System.out.println("rok diya: " + e.getMessage()); }
        o.moveTo(Status.DELIVERED);
        System.out.println("final: " + o.status);
    }
}`,
      note: "Saare rules ek map mein: padhna, test karna aur product team ko dikhana aasaan. Ye 'state machine' ka sabse simple roop hai aur zyaadatar order/booking flows ke liye kaafi hai."
    },
    {
      type: "think",
      id: "think-state-vending",
      q: "Vending machine ke liye State pattern mein classes aur interface kaise banaoge? Har state ek action pe kya karegi (IDLE pe select dabaya to?)",
      rubric: [
        { point: "<b>State interface</b>: insertCoin(), select(), cancel() (har action ek method)", keys: ["interface", "insertcoin", "select", "cancel", "state interface"], weight: 2 },
        { point: "Har state ki class: <b>IdleState, HasCoinState, SoldOutState</b>", keys: ["idlestate", "hascoinstate", "soldoutstate", "idle", "hascoin", "soldout"], weight: 2 },
        { point: "<b>Context (VendingMachine)</b> current state rakhta hai aur call delegate karta hai; state khud next state set karti hai", keys: ["context", "delegate", "current state", "setstate", "next state", "vendingmachine"], weight: 2 },
        { point: "Galat action (IDLE pe select) → error / message, crash nahi", keys: ["error", "message", "insert coin first", "pehle coin", "ignore"] }
      ],
      answer: `<pre class="code-static">interface State { String insertCoin(); String select(); String cancel(); }
class VendingMachine { State state; int stock; ... String select() { return state.select(); } }
class IdleState implements State {
    insertCoin → machine.state = hasCoin; "coin accepted"
    select     → "Pehle coin daalo"          // galat action ka saaf jawab
}
class HasCoinState implements State {
    select → stock--; machine.state = (stock == 0 ? soldOut : idle); "dispensed"
    cancel → machine.state = idle; "refund"
}
class SoldOutState { insertCoin → "refund: sold out" }</pre>
        <p>Har state ka behaviour ek file mein. Naya state (MAINTENANCE) = nayi class; baaki states ko sirf tab chhuo jab unhe naye state mein jaana ho.</p>`
    },
    {
      type: "exercise",
      id: "ex-vending-state",
      title: "Vending machine (State pattern)",
      level: "Medium",
      task: `<p><code>VendingMachine(int stock, int price)</code> banao (ek hi item, coins ₹ mein). Methods <code>String</code> return karte hain:</p>
        <ul>
          <li><code>insert(int amount)</code>: IDLE ya HAS_MONEY mein balance jodo → <code>"BALANCE &lt;n&gt;"</code>. SOLD_OUT mein → <code>"REFUND &lt;amount&gt;"</code> (paisa lo hi mat).</li>
          <li><code>select()</code>: IDLE → <code>"INSERT MONEY"</code>. HAS_MONEY: balance &lt; price → <code>"NEED &lt;baaki&gt;"</code>; warna stock−1, change = balance − price, balance 0 → <code>"DISPENSED CHANGE &lt;change&gt;"</code>, agla state stock 0 ho to SOLD_OUT warna IDLE. SOLD_OUT → <code>"SOLD OUT"</code>.</li>
          <li><code>cancel()</code>: HAS_MONEY → <code>"REFUND &lt;balance&gt;"</code>, IDLE. Baaki states → <code>"NOTHING"</code>.</li>
          <li><code>state()</code> → <code>"IDLE"</code> / <code>"HAS_MONEY"</code> / <code>"SOLD_OUT"</code>. Stock 0 se shuru ho to SOLD_OUT.</li>
        </ul>
        <p>if-else on state chal jaayega, par koshish karo har state ki class (State interface) se.</p>`,
      examples: "stock 1, price 20: <code>insert(10)</code> → BALANCE 10, <code>select()</code> → NEED 10, <code>insert(20)</code> → BALANCE 30, <code>select()</code> → DISPENSED CHANGE 10, <code>state()</code> → SOLD_OUT",
      userFile: "Solution.java",
      starter: `class VendingMachine {
    VendingMachine(int stock, int price) { }
    String insert(int amount) { return ""; }
    String select() { return ""; }
    String cancel() { return ""; }
    String state() { return ""; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("example flow", List.of("BALANCE 10", "NEED 10", "BALANCE 30", "DISPENSED CHANGE 10", "SOLD_OUT"), () -> {
            VendingMachine m = new VendingMachine(1, 20);
            return List.of(m.insert(10), m.select(), m.insert(20), m.select(), m.state());
        });
        Check.eq("idle select", List.of("IDLE", "INSERT MONEY"), () -> { VendingMachine m = new VendingMachine(3, 20); return List.of(m.state(), m.select()); });
        Check.hiddenFromHere();
        Check.eq("cancel refund", List.of("REFUND 15", "IDLE", "NOTHING"), () -> {
            VendingMachine m = new VendingMachine(3, 20); m.insert(5); m.insert(10);
            return List.of(m.cancel(), m.state(), m.cancel());
        });
        Check.eq("sold out: insert refund, select sold out", List.of("SOLD_OUT", "REFUND 50", "SOLD OUT", "NOTHING"), () -> {
            VendingMachine m = new VendingMachine(0, 20);
            return List.of(m.state(), m.insert(50), m.select(), m.cancel());
        });
        Check.eq("exact amount, stock 2 → IDLE", List.of("DISPENSED CHANGE 0", "IDLE"), () -> {
            VendingMachine m = new VendingMachine(2, 20); m.insert(20); return List.of(m.select(), m.state());
        });
        Check.eq("do baar kharido phir sold out", List.of("DISPENSED CHANGE 0", "DISPENSED CHANGE 5", "SOLD_OUT", "REFUND 10"), () -> {
            VendingMachine m = new VendingMachine(2, 10);
            m.insert(10); String a = m.select();
            m.insert(15); String b = m.select();
            return List.of(a, b, m.state(), m.insert(10));
        });
        Check.eq("insert ke baad state", "HAS_MONEY", () -> { VendingMachine m = new VendingMachine(1, 10); m.insert(1); return m.state(); });
    }
}`,
      hints: [
        "<code>interface State { String insert(int a); String select(); String cancel(); String name(); }</code> aur teen inner classes. VendingMachine mein <code>State current</code>, <code>stock</code>, <code>price</code>, <code>balance</code>.",
        "Constructor: <code>current = stock == 0 ? soldOut : idle;</code>. Har public method <code>return current.xyz();</code>",
        "HasMoney.select: <code>if (balance &lt; price) return \"NEED \" + (price - balance);</code> warna stock--, change, balance = 0, <code>current = stock == 0 ? soldOut : idle;</code>"
      ],
      solution: `class VendingMachine {
    private interface State {
        String insert(int amount);
        String select();
        String cancel();
        String name();
    }

    private int stock, balance;
    private final int price;
    private State current;

    private final State idle = new State() {
        public String insert(int a) { balance += a; current = hasMoney; return "BALANCE " + balance; }
        public String select() { return "INSERT MONEY"; }
        public String cancel() { return "NOTHING"; }
        public String name() { return "IDLE"; }
    };

    private final State hasMoney = new State() {
        public String insert(int a) { balance += a; return "BALANCE " + balance; }
        public String select() {
            if (balance < price) return "NEED " + (price - balance);
            stock--;
            int change = balance - price;
            balance = 0;
            current = stock == 0 ? soldOut : idle;
            return "DISPENSED CHANGE " + change;
        }
        public String cancel() { int r = balance; balance = 0; current = idle; return "REFUND " + r; }
        public String name() { return "HAS_MONEY"; }
    };

    private final State soldOut = new State() {
        public String insert(int a) { return "REFUND " + a; }
        public String select() { return "SOLD OUT"; }
        public String cancel() { return "NOTHING"; }
        public String name() { return "SOLD_OUT"; }
    };

    VendingMachine(int stock, int price) {
        this.stock = stock;
        this.price = price;
        this.current = stock == 0 ? soldOut : idle;
    }

    String insert(int amount) { return current.insert(amount); }
    String select() { return current.select(); }
    String cancel() { return current.cancel(); }
    String state() { return current.name(); }
}`,
      explain: "<p>VendingMachine ke public methods mein ek bhi if-else nahi: sab current state ko delegate. Har state apne actions aur transitions khud jaanti hai. Naya \"MAINTENANCE\" state = ek naya object + jahan se usme jaana ho. Inner/anonymous classes machine ke fields (balance, stock) seedha use karti hain; bade design mein inhe alag classes banao jo context ka reference lein.</p>"
    },
    {
      type: "quiz",
      q: "State aur Strategy dono mein 'interface + kai classes + context delegate karta hai'. Asli farak?",
      options: [
        "Koi farak nahi, sirf naam",
        "Strategy client/config bahar se chunta hai aur strategies ek doosre ko nahi jaanti; State mein states khud transitions karti hain (ek state agla state set karti hai) aur current state object ki lifecycle se badalti hai",
        "State sirf enums ke saath",
        "Strategy mein inheritance hota hai"
      ],
      answer: 1,
      why: "Structure same, intent alag. Strategy = <i>kaise</i> karna hai (bahar se choice). State = <i>abhi kaun si haalat</i> mein hoon, aur ye haalat khud events se badalti hai."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Kisi bhi lifecycle wale entity (Order, Booking, Elevator, Ticket) ke liye pehle <b>state diagram</b> banao (states + arrows + events), interviewer se confirm karo, phir code. Simple ho to enum + allowed-transitions map; behaviour bada ho to State pattern. Dono ka naam aur trade-off bolo."
    }
  ],
  references: [
    { title: "Refactoring Guru: State", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/state", type: "article" },
    { title: "Design Patterns (GoF): State", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
