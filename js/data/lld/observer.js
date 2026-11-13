// Observer
registerLesson("lld", "observer", {
  why: "Jab ek cheez badle aur kai alag cheezon ko pata chalna chahiye (price alert, order status, stock khatam), aur aap nahi chahte ki source ko har listener ka naam pata ho. Observer pub-sub ka chhota roop hai; HLD mein yahi Kafka/event-driven architecture banta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: source ko sabka pata hona padta hai</h2>
        <pre class="code-static">class Order {
    void markShipped() {
        status = SHIPPED;
        emailService.send(...);          // Order ko email ka pata
        smsService.send(...);            // sms ka pata
        analytics.track(...);            // analytics ka pata
        loyaltyPoints.add(...);          // naya feature = Order class edit
    }
}</pre>
        <p>Order ka kaam status badalna hai, notifications dena nahi. Aur har naya listener = Order edit (O toota), Order test karne ke liye 4 services mock.</p>
        <p><b>Observer:</b> source (<i>subject</i>) ek list rakhta hai "jinhe batana hai" (<i>observers</i>), sabka ek common interface. Event hua → list pe loop → <code>onEvent(...)</code>. Kaun sun raha hai, subject ko farak nahi.</p>
        <pre class="diagram">
 Order (subject) ── list ──► * OrderListener «interface»: onStatusChange(order, old, new)
   subscribe(l)                   ▲          ▲            ▲
   unsubscribe(l)           EmailListener SmsListener AnalyticsListener   ← naya = nayi class + subscribe</pre>`
    },
    {
      type: "code",
      title: "Stock price alerts: subscribe, notify, unsubscribe",
      code: `import java.util.*;

public class Main {
    interface PriceListener { void onPrice(String symbol, double price); }

    static class Stock {
        private final String symbol;
        private double price;
        private final List<PriceListener> listeners = new ArrayList<>();
        Stock(String symbol, double price) { this.symbol = symbol; this.price = price; }

        void subscribe(PriceListener l) { listeners.add(l); }
        void unsubscribe(PriceListener l) { listeners.remove(l); }

        void setPrice(double p) {
            if (p == price) return;                      // badla hi nahi to shor mat karo
            price = p;
            for (PriceListener l : List.copyOf(listeners)) l.onPrice(symbol, p);   // copy: loop ke beech unsubscribe safe
        }
    }

    public static void main(String[] args) {
        Stock tcs = new Stock("TCS", 3500);
        PriceListener app = (s, p) -> System.out.println("📱 app: " + s + " = " + p);
        PriceListener alert = (s, p) -> { if (p < 3400) System.out.println("🚨 alert: " + s + " 3400 se neeche!"); };
        tcs.subscribe(app);
        tcs.subscribe(alert);
        tcs.setPrice(3450);
        tcs.setPrice(3390);
        tcs.unsubscribe(app);
        tcs.setPrice(3380);                              // sirf alert
    }
}`,
      note: "<code>List.copyOf</code> se agar koi listener <code>onPrice</code> ke andar unsubscribe kare to <code>ConcurrentModificationException</code> nahi aata. Multi-thread mein <code>CopyOnWriteArrayList</code> (Concurrency module) natural choice hai: listeners kam badalte hain, notify bahut hota hai."
    },
    {
      type: "warn",
      html: `⚠️ <b>Observer ke 4 gotchas (interview follow-ups):</b>
        <ul>
          <li><b>Memory leak:</b> subscribe kiya, unsubscribe bhool gaye → subject listener ko zinda rakhta hai (lapsed listener problem).</li>
          <li><b>Ek listener crash</b> hua to baaki ko notification mile? Har call try-catch mein rakho.</li>
          <li><b>Slow listener</b> (email API 2s) poore <code>setPrice</code> ko slow karta hai. Async (executor / queue) pe bhejo.</li>
          <li><b>Order guarantee nahi:</b> listeners ek doosre pe depend na karein.</li>
        </ul>
        Jab ye problems bade ho jaayein (alag services, retries, durability), tab in-process observer ki jagah <b>message broker</b> (Kafka/RabbitMQ) — HLD module.`
    },
    {
      type: "exercise",
      id: "ex-order-events",
      title: "Order events: crash-safe observer",
      level: "Medium",
      task: `<p><code>OrderListener</code> interface: <code>void onChange(String orderId, String from, String to)</code>.</p>
        <p><code>Order(String id)</code> likho (status shuru mein <code>"PLACED"</code>):</p>
        <ul>
          <li><code>subscribe(l)</code>, <code>unsubscribe(l)</code>. Same listener do baar subscribe ho to bhi ek hi baar notify (duplicate ignore).</li>
          <li><code>setStatus(to)</code>: same status pe kuch nahi. Warna status badlo aur saare listeners ko subscribe ke order mein batao.</li>
          <li>Koi listener exception phenke to <b>baaki listeners ko phir bhi</b> notification mile, aur <code>setStatus</code> exception na phenke. <code>failures()</code> ab tak fail hue calls ki ginti de.</li>
          <li>Listener ke andar khud ko unsubscribe kare to crash na ho.</li>
        </ul>`,
      examples: "<code>setStatus(\"SHIPPED\")</code> → listener ko <code>(\"o1\", \"PLACED\", \"SHIPPED\")</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface OrderListener {
    void onChange(String orderId, String from, String to);
}

class Order {
    private final List<OrderListener> listeners = new ArrayList<>();

    Order(String id) { }

    void subscribe(OrderListener l) { listeners.add(l); }
    void unsubscribe(OrderListener l) { listeners.remove(l); }

    void setStatus(String to) {
        // TODO
    }

    String status() { return ""; }
    int failures() { return 0; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("listener ko event", List.of("o1:PLACED->SHIPPED"), () -> {
            List<String> got = new ArrayList<>();
            Order o = new Order("o1");
            o.subscribe((id, f, t) -> got.add(id + ":" + f + "->" + t));
            o.setStatus("SHIPPED");
            return got;
        });
        Check.eq("unsubscribe ke baad nahi", 1, () -> {
            int[] n = {0};
            OrderListener l = (id, f, t) -> n[0]++;
            Order o = new Order("o");
            o.subscribe(l); o.setStatus("A"); o.unsubscribe(l); o.setStatus("B");
            return n[0];
        });
        Check.hiddenFromHere();
        Check.eq("same status → no event", 0, () -> {
            int[] n = {0}; Order o = new Order("o"); o.subscribe((i, f, t) -> n[0]++); o.setStatus("PLACED"); return n[0];
        });
        Check.eq("duplicate subscribe → ek baar", 1, () -> {
            int[] n = {0}; OrderListener l = (i, f, t) -> n[0]++;
            Order o = new Order("o"); o.subscribe(l); o.subscribe(l); o.setStatus("X"); return n[0];
        });
        Check.eq("crash listener ke baad bhi baaki ko: [order, failures, status]", List.of(List.of("A", "C"), 1, "SHIPPED"), () -> {
            List<String> got = new ArrayList<>();
            Order o = new Order("o");
            o.subscribe((i, f, t) -> got.add("A"));
            o.subscribe((i, f, t) -> { throw new RuntimeException("email down"); });
            o.subscribe((i, f, t) -> got.add("C"));
            o.setStatus("SHIPPED");
            return List.of(got, o.failures(), o.status());
        });
        Check.eq("listener khud ko unsubscribe kare: crash nahi, agli baar nahi", List.of(1, 2), () -> {
            int[] self = {0}, other = {0};
            Order o = new Order("o");
            OrderListener[] me = new OrderListener[1];
            me[0] = (i, f, t) -> { self[0]++; o.unsubscribe(me[0]); };
            o.subscribe(me[0]);
            o.subscribe((i, f, t) -> other[0]++);
            o.setStatus("A"); o.setStatus("B");
            return List.of(self[0], other[0]);
        });
        Check.eq("from/to chain", List.of("PLACED>PACKED", "PACKED>SHIPPED"), () -> {
            List<String> got = new ArrayList<>(); Order o = new Order("o");
            o.subscribe((i, f, t) -> got.add(f + ">" + t)); o.setStatus("PACKED"); o.setStatus("SHIPPED"); return got;
        });
    }
}`,
      hints: [
        "Duplicate ignore + order: <code>LinkedHashSet&lt;OrderListener&gt;</code> ya add se pehle <code>contains</code> check.",
        "setStatus: <code>if (to.equals(status)) return; String from = status; status = to;</code> phir <code>for (OrderListener l : new ArrayList&lt;&gt;(listeners))</code> (copy!).",
        "Har call: <code>try { l.onChange(id, from, to); } catch (RuntimeException e) { failures++; }</code>"
      ],
      solution: `import java.util.*;

interface OrderListener {
    void onChange(String orderId, String from, String to);
}

class Order {
    private final String id;
    private String status = "PLACED";
    private int failures = 0;
    private final Set<OrderListener> listeners = new LinkedHashSet<>();   // order + no duplicates

    Order(String id) { this.id = id; }

    void subscribe(OrderListener l) { listeners.add(l); }
    void unsubscribe(OrderListener l) { listeners.remove(l); }

    void setStatus(String to) {
        if (to.equals(status)) return;
        String from = status;
        status = to;
        for (OrderListener l : new ArrayList<>(listeners)) {    // snapshot: andar se unsubscribe safe
            try {
                l.onChange(id, from, to);
            } catch (RuntimeException e) {
                failures++;                                      // ek ki galti baaki ko na roke
            }
        }
    }

    String status() { return status; }
    int failures() { return failures; }
}`,
      explain: "<p>Order ab sirf status ka maalik hai. Email, SMS, analytics sab bahar se subscribe karte hain. Teen production-level cheezein: snapshot loop (andar se unsubscribe), try-catch per listener (isolation), aur same-status pe event nahi (shor kam). Ye sab interviewer ke follow-up sawaal hain.</p>"
    },
    {
      type: "quiz",
      q: "Observer aur Pub-Sub (Kafka jaise broker ke saath) mein main farak kya hai?",
      options: [
        "Koi farak nahi",
        "Observer mein subject seedha observers ko jaanta aur call karta hai (same process, sync); Pub-Sub mein beech mein broker hai, publisher ko subscribers ka pata hi nahi, aur async/durable ho sakta hai",
        "Pub-Sub sirf UI ke liye hai",
        "Observer distributed hota hai"
      ],
      answer: 1,
      why: "Observer = direct reference list, in-process. Pub-Sub = topic/channel ke through decoupled, alag services, messages store aur retry ho sakte hain. Scale aur reliability chahiye to pub-sub."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Notification bhejo jab X ho\" sunte hi Observer bolo, aur turant trade-off: <i>\"in-process listeners simple hain; agar notifications alag service mein hain ya retry chahiye to event queue (Kafka) pe publish karunga.\"</i> LLD se HLD ka bridge dikhana senior signal hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Observer", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/observer", type: "article" },
    { title: "Design Patterns (GoF): Observer", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
