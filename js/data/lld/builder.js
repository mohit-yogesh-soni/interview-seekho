// Builder
registerLesson("lld", "builder", {
  why: "Jab object ke bahut saare optional fields hon, constructor padhna aur sahi order mein args dena mushkil ho jaata hai, aur adha-bana object bugs laata hai. Builder ye teeno problems hal karta hai. HTTP requests, pizza orders, search filters jaise LLD questions mein aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: telescoping constructor</h2>
        <pre class="code-static">new Pizza("LARGE", true, false, true, false, "THIN", 2, null);</pre>
        <p>Batao: <code>true</code> kya hai? cheese? Teesra <code>true</code>? 8 args mein do booleans ki jagah badal di to compiler kuch nahi bolega, bug production mein milega.</p>
        <p><b>Fix 1 (JavaBeans):</b> khaali constructor + setters. Readable, par: object kuch der ke liye <b>aadha bana</b> rehta hai (size set, crust nahi), aur <b>immutable</b> nahi ban sakta (setters hain to koi bhi baad mein badal sakta hai, threads mein bhi).</p>
        <p><b>Fix 2 (Builder):</b> ek alag mutable helper jo values ikattha kare, aur <code>build()</code> pe validate karke <b>ek immutable object</b> de.</p>
        <pre class="code-static">Pizza p = Pizza.builder("LARGE")      // required cheez constructor mein
        .cheese(true)
        .crust("THIN")
        .extraToppings(2)
        .build();                         // yahan validation, phir immutable Pizza</pre>`
    },
    {
      type: "code",
      title: "Builder: required vs optional, validation build() mein, result immutable",
      code: `import java.util.*;

public class Main {
    static final class HttpRequest {
        private final String method, url;
        private final Map<String, String> headers;
        private final String body;
        private final int timeoutMs;

        private HttpRequest(Builder b) {                // sirf builder bana sakta hai
            this.method = b.method;
            this.url = b.url;
            this.headers = Map.copyOf(b.headers);       // defensive copy → immutable
            this.body = b.body;
            this.timeoutMs = b.timeoutMs;
        }

        static Builder builder(String url) { return new Builder(url); }

        @Override public String toString() {
            return method + " " + url + " headers=" + new TreeMap<>(headers) + " body=" + body + " timeout=" + timeoutMs;
        }

        static final class Builder {
            private final String url;                   // required
            private String method = "GET";              // defaults
            private final Map<String, String> headers = new HashMap<>();
            private String body;
            private int timeoutMs = 5000;

            private Builder(String url) { this.url = Objects.requireNonNull(url); }

            Builder method(String m) { this.method = m; return this; }     // return this → chaining
            Builder header(String k, String v) { headers.put(k, v); return this; }
            Builder body(String b) { this.body = b; return this; }
            Builder timeoutMs(int t) { this.timeoutMs = t; return this; }

            HttpRequest build() {
                if (body != null && method.equals("GET")) throw new IllegalStateException("GET ke saath body nahi");
                if (timeoutMs <= 0) throw new IllegalStateException("timeout > 0");
                return new HttpRequest(this);
            }
        }
    }

    public static void main(String[] args) {
        HttpRequest r = HttpRequest.builder("https://api.x.com/orders")
                .method("POST")
                .header("Auth", "token123")
                .body("{\\"item\\":\\"pizza\\"}")
                .build();
        System.out.println(r);
        System.out.println(HttpRequest.builder("https://api.x.com/health").build());
        try {
            HttpRequest.builder("https://x").body("oops").build();
        } catch (IllegalStateException e) {
            System.out.println("build() ne roka: " + e.getMessage());
        }
    }
}`,
      note: "Java ki apni library mein bhi yahi hai: <code>java.net.http.HttpRequest.newBuilder()</code>, <code>StringBuilder</code>, aur Lombok ka <code>@Builder</code>."
    },
    {
      type: "pick",
      id: "pick-builder-when",
      q: "Builder kahan <b>sahi</b> choice hai?",
      options: [
        { text: "<code>SearchQuery</code> jisme 10 optional filters (price range, rating, brand, sort, page...)", correct: true, why: "Optional fields bahut, combinations bahut. Classic." },
        { text: "<code>Point(int x, int y)</code>", correct: false, why: "Do required fields. Seedha constructor ya record. Builder = extra code." },
        { text: "Immutable config object jisme validation rules hain (min &lt; max)", correct: true, why: "build() validation ki ek jagah, aur result immutable." },
        { text: "Object jise baad mein baar baar badalna hai (game ka player position)", correct: false, why: "Builder ek baar banane ke liye hai. Mutable state ke liye normal methods." },
        { text: "Test data banana: <code>anOrder().withStatus(SHIPPED).build()</code>", correct: true, why: "Test builders defaults dete hain, test sirf wahi field set karta hai jo matter karti hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-pizza-builder",
      title: "Pizza builder with validation",
      level: "Easy",
      task: `<p><code>Pizza</code> immutable banao aur <code>Pizza.Builder</code>:</p>
        <ul>
          <li><code>Pizza.builder(String size)</code>: size required: <code>"S"</code>, <code>"M"</code>, <code>"L"</code>. Galat size → <code>build()</code> pe <code>IllegalStateException</code>.</li>
          <li>Optional: <code>cheese()</code> (extra cheese, default nahi), <code>topping(String t)</code> (kai baar call ho sakta, order yaad rakho, max 5 warna build pe ISE), <code>crust(String)</code> (default <code>"REGULAR"</code>).</li>
          <li>Price: S=200, M=300, L=400; extra cheese +50; har topping +30.</li>
          <li><code>Pizza</code> methods: <code>int price()</code>, <code>List&lt;String&gt; toppings()</code> (bahar se badli na ja sake), <code>String describe()</code> = <code>"L REGULAR cheese [corn, olive]"</code> (cheese na ho to us word ke bina: <code>"M THIN [paneer]"</code>).</li>
          <li>Same builder se do baar <code>build()</code>: dono pizza independent hon (baad ki topping pehle wale mein na jaaye).</li>
        </ul>`,
      examples: "<code>Pizza.builder(\"L\").cheese().topping(\"corn\").topping(\"olive\").build().price()</code> → 400+50+60 = <code>510</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Pizza {
    String size;
    List<String> toppings = new ArrayList<>();

    static Builder builder(String size) { return new Builder(size); }

    int price() { return 0; }
    List<String> toppings() { return toppings; }
    String describe() { return ""; }

    static class Builder {
        Builder(String size) { }
        Builder cheese() { return this; }
        Builder topping(String t) { return this; }
        Builder crust(String c) { return this; }
        Pizza build() { return new Pizza(); }
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static String err(Runnable r) {
        try { r.run(); return "no exception"; } catch (IllegalStateException e) { return "ISE"; }
    }

    public static void main(String[] args) {
        Check.eq("L + cheese + 2 toppings price", 510, () -> Pizza.builder("L").cheese().topping("corn").topping("olive").build().price());
        Check.eq("describe", "L REGULAR cheese [corn, olive]", () -> Pizza.builder("L").cheese().topping("corn").topping("olive").build().describe());
        Check.hiddenFromHere();
        Check.eq("M thin paneer, no cheese", "M THIN [paneer]", () -> Pizza.builder("M").crust("THIN").topping("paneer").build().describe());
        Check.eq("S plain price", 200, () -> Pizza.builder("S").build().price());
        Check.eq("galat size → ISE", "ISE", () -> err(() -> Pizza.builder("XL").build()));
        Check.eq("6 toppings → ISE", "ISE", () -> err(() -> {
            Pizza.Builder b = Pizza.builder("M");
            for (int i = 0; i < 6; i++) b.topping("t" + i);
            b.build();
        }));
        Check.eq("toppings list bahar se na badle", "blocked", () -> {
            Pizza p = Pizza.builder("S").topping("a").build();
            try { p.toppings().add("hack"); } catch (UnsupportedOperationException e) { return "blocked"; }
            return p.toppings().size() == 1 ? "blocked" : "changed";
        });
        Check.eq("same builder, do build independent", List.of(1, 2), () -> {
            Pizza.Builder b = Pizza.builder("S").topping("a");
            Pizza p1 = b.build();
            Pizza p2 = b.topping("b").build();
            return List.of(p1.toppings().size(), p2.toppings().size());
        });
    }
}`,
      hints: [
        "Pizza ke fields <code>private final</code>: size, crust, cheese, toppings. Private constructor <code>Pizza(Builder b)</code> jo <code>List.copyOf(b.toppings)</code> le.",
        "Builder mein mutable fields + defaults (<code>crust = \"REGULAR\"</code>). Har setter <code>return this;</code>. build() mein: size S/M/L check, toppings ≤ 5, phir <code>new Pizza(this)</code>.",
        "describe: <code>size + \" \" + crust + (cheese ? \" cheese\" : \"\") + \" \" + toppings</code> (List ka toString <code>[a, b]</code> deta hai)."
      ],
      solution: `import java.util.*;

final class Pizza {
    private static final Map<String, Integer> BASE = Map.of("S", 200, "M", 300, "L", 400);
    private final String size, crust;
    private final boolean cheese;
    private final List<String> toppings;

    private Pizza(Builder b) {
        this.size = b.size;
        this.crust = b.crust;
        this.cheese = b.cheese;
        this.toppings = List.copyOf(b.toppings);   // immutable snapshot
    }

    static Builder builder(String size) { return new Builder(size); }

    int price() { return BASE.get(size) + (cheese ? 50 : 0) + 30 * toppings.size(); }
    List<String> toppings() { return toppings; }
    String describe() { return size + " " + crust + (cheese ? " cheese" : "") + " " + toppings; }

    static final class Builder {
        private final String size;
        private String crust = "REGULAR";
        private boolean cheese;
        private final List<String> toppings = new ArrayList<>();

        private Builder(String size) { this.size = size; }

        Builder cheese() { cheese = true; return this; }
        Builder topping(String t) { toppings.add(t); return this; }
        Builder crust(String c) { crust = c; return this; }

        Pizza build() {
            if (!BASE.containsKey(size)) throw new IllegalStateException("size S/M/L chahiye: " + size);
            if (toppings.size() > 5) throw new IllegalStateException("max 5 toppings");
            return new Pizza(this);
        }
    }
}`,
      explain: "<p>Validation ek jagah (<code>build()</code>), aur bana hua <code>Pizza</code> kabhi invalid ya adha nahi hota. <code>List.copyOf</code> se do kaam: bahar wala list badal nahi sakta (UnsupportedOperationException), aur builder ki baad ki topping purane pizza mein nahi jaati.</p>"
    },
    {
      type: "think",
      id: "think-builder-vs",
      q: "Interviewer: <b>\"Builder aur Factory mein kya farak hai? Dono object banate hain.\"</b>",
      rubric: [
        { point: "Factory: <b>kaunsa type</b> banana hai decide karta hai (polymorphism, ek call)", keys: ["kaunsa type", "which class", "which type", "type decide", "subclass", "implementation"], weight: 2 },
        { point: "Builder: <b>ek complex object step by step</b> (bahut optional fields) banata hai", keys: ["step by step", "step", "optional", "bahut field", "many fields", "parameters"], weight: 2 },
        { point: "Builder validation + immutability ke saath build() pe", keys: ["validation", "immutable", "build()"] },
        { point: "Dono saath bhi: factory andar builder use kare", keys: ["saath", "together", "combine", "andar builder"] }
      ],
      answer: `<p><b>Factory</b> ka sawaal: <i>kaunsi class?</i> ("SMS ya Email notifier") — ek call, caller ko interface milta hai.</p>
        <p><b>Builder</b> ka sawaal: <i>ek hi class ko kaise configure karein?</i> jab bahut optional parts hon — step by step, phir <code>build()</code> pe validate karke immutable object.</p>
        <p>Dono mil bhi sakte hain: <code>RequestFactory.forService("orders")</code> andar builder se sahi headers/timeouts wala request bana ke de.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Builder lagaate waqt teen cheezein bolo: <i>required fields builder ke constructor mein, defaults builder mein, validation build() mein.</i> Java 16+ mein simple data ke liye <code>record</code> + static factory aksar kaafi hai; builder tab jab optional fields 4-5 se zyada hon."
    }
  ],
  references: [
    { title: "Effective Java (3rd ed.), Item 2: Consider a builder when faced with many constructor parameters", by: "Joshua Bloch", type: "book" },
    { title: "Refactoring Guru: Builder", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/builder", type: "article" }
  ]
});
