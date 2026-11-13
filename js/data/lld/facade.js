// Facade
registerLesson("lld", "facade", {
  why: "Order place karna andar se 5-6 systems (inventory, payment, invoice, notification, shipping) ko sahi order mein call karna hai. Agar har controller ye khud kare to galtiyaan aur duplication. Facade ek simple entry point deta hai. Ye LLD designs mein 'service layer' ke roop mein har jagah dikhta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: client ko poora kitchen samajhna pad raha hai</h2>
        <pre class="code-static">// Mobile controller
inventory.reserve(items);
PaymentResult r = payment.charge(user, total);
if (!r.ok()) { inventory.release(items); return error; }   // rollback bhoolna aasaan
invoice.generate(order);
shipping.schedule(order, address);
notifier.send(user, "Order placed");

// Web controller → same 6 steps copy. Admin panel → copy. Ek mein release bhool gaye = stock atak gaya.</pre>
        <p><b>Facade:</b> ek class jo poore flow ko ek method mein band kare: <code>orderFacade.placeOrder(user, items, address)</code>. Subsystems (inventory, payment...) waise hi rehte hain; jinhe detail chahiye wo unhe seedha bhi use kar sakte hain. Facade sirf <b>aasaan raasta</b> deta hai, chhupa ke lock nahi karta.</p>
        <pre class="diagram">
 MobileController ─┐
 WebController   ──┼──► OrderFacade.placeOrder() ──► Inventory
 AdminPanel      ──┘                               ├─► Payment
                                                   ├─► Invoice
                                                   ├─► Shipping
                                                   └─► Notifier</pre>`
    },
    {
      type: "order",
      id: "order-place-order",
      q: "<code>placeOrder</code> facade ke andar steps ka sahi order lagao (failure ka socho):",
      items: [
        "Stock reserve karo (na mile to turant fail, paisa mat kaato)",
        "Payment charge karo (fail ho to reserved stock release karo)",
        "Order ko PAID mark karke save karo",
        "Invoice banao aur shipping schedule karo",
        "Customer ko notification bhejo (fail ho to bhi order cancel mat karo)"
      ],
      why: "<p>Sasta aur reversible kaam pehle (stock reserve), paise wala kaam uske baad, aur \"nice to have\" (notification) sabse end mein. Notification fail hone pe order cancel karna galat hai: use retry queue mein daalo. Ye socha hua order hi facade ki asli value hai.</p>"
    },
    {
      type: "exercise",
      id: "ex-order-facade",
      title: "OrderFacade with rollback",
      level: "Medium",
      task: `<p>Subsystems diye hain (<code>Inventory</code>, <code>Payment</code>, <code>Notifier</code>), unhe mat badlo. <code>OrderFacade(Inventory, Payment, Notifier)</code> mein <code>String placeOrder(String user, String item, int qty, int amount)</code> likho:</p>
        <ol>
          <li><code>inventory.reserve(item, qty)</code> false → return <code>"OUT_OF_STOCK"</code> (payment call hi mat karo).</li>
          <li><code>payment.charge(user, amount)</code> false → <code>inventory.release(item, qty)</code> karo, return <code>"PAYMENT_FAILED"</code>.</li>
          <li>Success → <code>notifier.send(user, "Order placed: " + item)</code>. Notifier exception phenke to bhi order successful hai (exception pakdo).</li>
          <li>Return <code>"PLACED"</code>.</li>
        </ol>`,
      examples: "stock 5, qty 2, payment ok → <code>\"PLACED\"</code>, stock 3<br>payment fail → <code>\"PAYMENT_FAILED\"</code>, stock wapas 5",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Inventory {
    private final Map<String, Integer> stock = new HashMap<>();
    Inventory(Map<String, Integer> initial) { stock.putAll(initial); }
    boolean reserve(String item, int qty) {
        int have = stock.getOrDefault(item, 0);
        if (have < qty) return false;
        stock.put(item, have - qty);
        return true;
    }
    void release(String item, int qty) { stock.merge(item, qty, Integer::sum); }
    int available(String item) { return stock.getOrDefault(item, 0); }
}

interface Payment { boolean charge(String user, int amount); }
interface Notifier { void send(String user, String msg); }

class OrderFacade {
    OrderFacade(Inventory inventory, Payment payment, Notifier notifier) { }

    String placeOrder(String user, String item, int qty, int amount) {
        return "PLACED";   // TODO
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("happy path: [result, stock left]", List.of("PLACED", 3), () -> {
            Inventory inv = new Inventory(Map.of("pizza", 5));
            String r = new OrderFacade(inv, (u, a) -> true, (u, m) -> {}).placeOrder("riya", "pizza", 2, 500);
            return List.of(r, inv.available("pizza"));
        });
        Check.eq("payment fail → stock wapas", List.of("PAYMENT_FAILED", 5), () -> {
            Inventory inv = new Inventory(Map.of("pizza", 5));
            String r = new OrderFacade(inv, (u, a) -> false, (u, m) -> {}).placeOrder("riya", "pizza", 2, 500);
            return List.of(r, inv.available("pizza"));
        });
        Check.hiddenFromHere();
        Check.eq("out of stock → payment call nahi", List.of("OUT_OF_STOCK", 0), () -> {
            int[] charges = {0};
            Inventory inv = new Inventory(Map.of("pizza", 1));
            String r = new OrderFacade(inv, (u, a) -> { charges[0]++; return true; }, (u, m) -> {}).placeOrder("a", "pizza", 2, 100);
            return List.of(r, charges[0]);
        });
        Check.eq("notifier crash → phir bhi PLACED", "PLACED", () -> {
            Inventory inv = new Inventory(Map.of("pizza", 5));
            return new OrderFacade(inv, (u, a) -> true, (u, m) -> { throw new RuntimeException("SMS down"); }).placeOrder("a", "pizza", 1, 100);
        });
        Check.eq("notification message", List.of("riya:Order placed: burger"), () -> {
            List<String> sent = new ArrayList<>();
            new OrderFacade(new Inventory(Map.of("burger", 1)), (u, a) -> true, (u, m) -> sent.add(u + ":" + m)).placeOrder("riya", "burger", 1, 99);
            return sent;
        });
        Check.eq("payment fail pe notification nahi", 0, () -> {
            List<String> sent = new ArrayList<>();
            new OrderFacade(new Inventory(Map.of("x", 1)), (u, a) -> false, (u, m) -> sent.add(m)).placeOrder("a", "x", 1, 1);
            return sent.size();
        });
    }
}`,
      hints: [
        "Teeno subsystems ko <code>private final</code> fields mein rakho.",
        "<code>if (!inventory.reserve(item, qty)) return \"OUT_OF_STOCK\";</code> phir <code>if (!payment.charge(user, amount)) { inventory.release(item, qty); return \"PAYMENT_FAILED\"; }</code>",
        "<code>try { notifier.send(...); } catch (RuntimeException e) { /* log + retry queue */ }</code> phir <code>return \"PLACED\";</code>"
      ],
      solution: `import java.util.*;

class Inventory {
    private final Map<String, Integer> stock = new HashMap<>();
    Inventory(Map<String, Integer> initial) { stock.putAll(initial); }
    boolean reserve(String item, int qty) {
        int have = stock.getOrDefault(item, 0);
        if (have < qty) return false;
        stock.put(item, have - qty);
        return true;
    }
    void release(String item, int qty) { stock.merge(item, qty, Integer::sum); }
    int available(String item) { return stock.getOrDefault(item, 0); }
}

interface Payment { boolean charge(String user, int amount); }
interface Notifier { void send(String user, String msg); }

class OrderFacade {
    private final Inventory inventory;
    private final Payment payment;
    private final Notifier notifier;

    OrderFacade(Inventory inventory, Payment payment, Notifier notifier) {
        this.inventory = inventory;
        this.payment = payment;
        this.notifier = notifier;
    }

    String placeOrder(String user, String item, int qty, int amount) {
        if (!inventory.reserve(item, qty)) return "OUT_OF_STOCK";
        if (!payment.charge(user, amount)) {
            inventory.release(item, qty);              // compensate
            return "PAYMENT_FAILED";
        }
        try {
            notifier.send(user, "Order placed: " + item);
        } catch (RuntimeException e) {
            // notification best-effort: production mein log + retry queue
        }
        return "PLACED";
    }
}`,
      explain: "<p>Flow ki saari knowledge (order, rollback, kya critical hai) ek jagah. Teen controllers ab ek line call karte hain aur rollback bhoolna possible hi nahi. Microservices mein yahi idea <b>Saga</b> (compensating actions) ban jaata hai — HLD module mein.</p>"
    },
    {
      type: "quiz",
      q: "Facade kab <b>problem</b> ban jaata hai?",
      options: [
        "Jab wo subsystems ko seedha use karna band kar de",
        "Jab saara business logic usme bhar jaaye aur wo 'God class' ban jaaye jo har feature mein badle",
        "Jab usme 3 se zyada subsystems hon",
        "Kabhi nahi"
      ],
      answer: 1,
      why: "Facade ka kaam coordination hai, saara logic nahi. Agar pricing, validation, tax sab usme aa gaye to wo God class hai. Ek facade per use-case group (OrderFacade, RefundFacade) rakho, aur logic subsystems/domain objects mein."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> LLD mein jab bahut saari classes ho jaayein, ek facade / service class (<code>ParkingLotService</code>, <code>BookingService</code>) bana ke main flows wahan dikhao. Interviewer ko demo karne mein aasaani, aur aap bol sakte ho: <i>\"Controllers sirf is service ko jaante hain; andar ke classes badal sakte hain.\"</i>"
    }
  ],
  references: [
    { title: "Refactoring Guru: Facade", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/facade", type: "article" },
    { title: "Design Patterns (GoF): Facade", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
