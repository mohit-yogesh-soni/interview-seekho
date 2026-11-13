// Proxy
registerLesson("lld", "proxy", {
  why: "Proxy ek stand-in object hai jo asli object ke saamne baithta hai aur access control karta hai: cache, permission check, lazy loading, rate limit. Spring ka @Transactional, @Cacheable aur Hibernate ki lazy loading sab proxies hain, isliye interview mein ye 'framework andar se kaise kaam karta hai' sawaal mein aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: asli object ko har baar seedha call karna mehenga ya unsafe</h2>
        <ul>
          <li><code>ProductCatalog.get(id)</code> har call pe 200ms ka DB query. Same product 1000 baar maanga jaata hai.</li>
          <li><code>SalaryService.update(emp, amount)</code> koi bhi call kar de, sirf HR ko allow hona chahiye.</li>
          <li><code>VideoFile</code> constructor 2GB file load karta hai, chahe user ne play hi na kiya ho.</li>
        </ul>
        <p>Hal: ek class jo <b>same interface</b> implement kare, andar asli object rakhe, aur call ko beech mein <b>control</b> kare.</p>
        <table>
          <tr><th>Proxy type</th><th>Kya karta hai</th><th>Real example</th></tr>
          <tr><td>Caching proxy</td><td>Result yaad rakho, dobara asli tak mat jao</td><td>Spring <code>@Cacheable</code></td></tr>
          <tr><td>Protection proxy</td><td>Permission check, phir hi asli call</td><td>Spring Security method security</td></tr>
          <tr><td>Virtual (lazy) proxy</td><td>Asli object tab banao jab pehli baar zaroorat ho</td><td>Hibernate lazy-loaded entities</td></tr>
          <tr><td>Remote proxy</td><td>Network call ko local method jaisa dikhao</td><td>gRPC / Feign client stubs</td></tr>
        </table>
        <h3>Proxy vs Decorator (same shape, alag intent)</h3>
        <p>Dono wrap karte hain aur same interface. <b>Decorator</b> naya behaviour <i>jodta</i> hai aur aksar client khud layers lagata hai. <b>Proxy</b> <i>access control</i> karta hai, aur aksar client ko pata bhi nahi hota ki wo proxy se baat kar raha hai (framework de deta hai).</p>`
    },
    {
      type: "code",
      title: "Caching + protection proxy: asli service ko chhue bina",
      code: `import java.util.*;

public class Main {
    interface Catalog { String product(String id); }

    static class DbCatalog implements Catalog {          // asli, mehenga
        int dbCalls = 0;
        public String product(String id) { dbCalls++; return "Product-" + id; }
    }

    static class CachingCatalog implements Catalog {
        private final Catalog real;
        private final Map<String, String> cache = new HashMap<>();
        CachingCatalog(Catalog real) { this.real = real; }
        public String product(String id) { return cache.computeIfAbsent(id, real::product); }
    }

    interface Salary { String update(String user, String emp, int amount); }

    static class SalaryService implements Salary {
        public String update(String user, String emp, int amount) { return emp + " salary = " + amount; }
    }

    static class SalaryGuard implements Salary {        // protection proxy
        private final Salary real;
        private final Set<String> hr;
        SalaryGuard(Salary real, Set<String> hr) { this.real = real; this.hr = hr; }
        public String update(String user, String emp, int amount) {
            if (!hr.contains(user)) return "DENIED for " + user;
            return real.update(user, emp, amount);
        }
    }

    public static void main(String[] args) {
        DbCatalog db = new DbCatalog();
        Catalog catalog = new CachingCatalog(db);
        for (int i = 0; i < 1000; i++) catalog.product("p" + (i % 3));
        System.out.println("1000 calls, DB calls = " + db.dbCalls);

        Salary s = new SalaryGuard(new SalaryService(), Set.of("hr_anita"));
        System.out.println(s.update("intern_raj", "E1", 1_000_000));
        System.out.println(s.update("hr_anita", "E1", 90_000));
    }
}`
    },
    {
      type: "quiz",
      q: "Spring mein <code>@Transactional</code> wala method <b>same class</b> ke doosre method se call kiya (<code>this.save()</code>). Transaction kyun nahi lagta?",
      options: [
        "@Transactional sirf public classes pe kaam karta hai",
        "Spring proxy ke through aane wali calls hi intercept karta hai; <code>this.save()</code> proxy ko bypass karke seedha asli object pe jaati hai",
        "Transaction lagta hai, bas log nahi hota",
        "Java mein self-call allowed nahi"
      ],
      answer: 1,
      why: "Spring bean ke chaaron taraf ek proxy banata hai. Bahar se call → proxy → transaction shuru → asli method. Andar se <code>this.method()</code> → proxy hai hi nahi beech mein. Ye famous 'self-invocation' gotcha hai (Spring docs mein bhi likha hai). Fix: method alag bean mein, ya proxy ko inject karke call."
    },
    {
      type: "exercise",
      id: "ex-lazy-proxy",
      title: "Lazy + caching image proxy",
      level: "Easy",
      task: `<p><code>Image</code> interface (<code>String render()</code>, <code>String name()</code>) aur <code>HighResImage</code> diya hai: constructor mein mehenga load hota hai (static <code>HighResImage.loads</code> counter badhta hai).</p>
        <p><code>ImageProxy(String name)</code> likho:</p>
        <ul>
          <li><code>name()</code> asli image <b>load kiye bina</b> naam de.</li>
          <li><code>render()</code> pehli baar pe hi <code>HighResImage</code> banaye, aur baad mein wahi reuse kare (dobara load nahi).</li>
        </ul>`,
      examples: "100 proxies banao, sirf 2 ko render karo → <code>HighResImage.loads == 2</code>",
      userFile: "Solution.java",
      starter: `interface Image {
    String render();
    String name();
}

class HighResImage implements Image {
    static int loads = 0;
    private final String name;
    HighResImage(String name) { this.name = name; loads++; }   // mehenga
    public String render() { return "Rendering " + name; }
    public String name() { return name; }
}

class ImageProxy implements Image {
    private final HighResImage real;
    ImageProxy(String name) { real = new HighResImage(name); }   // TODO: eager load galat
    public String render() { return real.render(); }
    public String name() { return real.name(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("proxy banane pe load nahi", 0, () -> {
            HighResImage.loads = 0;
            for (int i = 0; i < 100; i++) new ImageProxy("img" + i);
            return HighResImage.loads;
        });
        Check.eq("render output", "Rendering cat.png", () -> new ImageProxy("cat.png").render());
        Check.hiddenFromHere();
        Check.eq("100 proxies, 2 render → 2 loads", 2, () -> {
            HighResImage.loads = 0;
            List<Image> gallery = new ArrayList<>();
            for (int i = 0; i < 100; i++) gallery.add(new ImageProxy("img" + i));
            gallery.get(3).render(); gallery.get(7).render();
            return HighResImage.loads;
        });
        Check.eq("same proxy 5 baar render → 1 load", 1, () -> {
            HighResImage.loads = 0;
            Image p = new ImageProxy("dog");
            for (int i = 0; i < 5; i++) p.render();
            return HighResImage.loads;
        });
        Check.eq("name() load nahi karta", List.of("a.jpg", 0), () -> {
            HighResImage.loads = 0;
            Image p = new ImageProxy("a.jpg");
            return List.of(p.name(), HighResImage.loads);
        });
    }
}`,
      hints: [
        "Fields: <code>private final String name;</code> aur <code>private HighResImage real;</code> (final nahi, null se shuru).",
        "<code>render()</code>: <code>if (real == null) real = new HighResImage(name); return real.render();</code>. <code>name()</code> seedha apna field lautaye."
      ],
      solution: `interface Image {
    String render();
    String name();
}

class HighResImage implements Image {
    static int loads = 0;
    private final String name;
    HighResImage(String name) { this.name = name; loads++; }
    public String render() { return "Rendering " + name; }
    public String name() { return name; }
}

class ImageProxy implements Image {
    private final String name;
    private HighResImage real;                    // pehli zaroorat tak null

    ImageProxy(String name) { this.name = name; }

    public String render() {
        if (real == null) real = new HighResImage(name);   // lazy
        return real.render();
    }

    public String name() { return name; }        // asli ki zaroorat hi nahi
}`,
      explain: "<p>Gallery 100 thumbnails dikhati hai par user 2 kholta hai: 98 mehenge loads bache. Client code (<code>List&lt;Image&gt;</code>) ko pata nahi ki proxy hai. Multi-threaded ho to <code>real</code> ke init ko synchronized / holder ki tarah safe karna padega (Concurrency singleton lesson wali soch).</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Agar design mein \"cache lagao\" ya \"sirf admin\" aaye, to bolo: <i>\"Main service ke saamne ek proxy rakhunga jo same interface implement kare; asli service clean rahegi.\"</i> Aur framework ka sawaal aaye to Spring proxies aur self-invocation gotcha ka zikr senior signal hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Proxy", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/proxy", type: "article" },
    { title: "Design Patterns (GoF): Proxy", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
