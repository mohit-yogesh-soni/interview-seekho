// CopyOnWriteArrayList aur ThreadLocal
registerLesson("concurrency", "cow-threadlocal", {
  why: "Do alag tareeke se thread-safety: CopyOnWriteArrayList data ko kabhi badalta hi nahi (har write pe nayi copy), aur ThreadLocal data ko share hi nahi karta (har thread ki apni copy). Interview mein ThreadLocal ka memory leak (thread pool ke saath) senior-level follow-up hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Part 1: CopyOnWriteArrayList (COW)</h2>
        <p><b>Problem:</b> Ek event bus hai. Listeners (email, SMS, analytics) shuru mein register hote hain, phir har event pe saare listeners ko loop karke call karte hain. Reads (loop) lakhon baar, writes (register/unregister) kabhi kabhi.</p>
        <p>Normal <code>ArrayList</code> pe ek thread loop kare aur doosra <code>add</code> kare to <code>ConcurrentModificationException</code> ya kharab data. <code>Collections.synchronizedList</code> mein loop ke dauraan poori list lock karni padti hai (saare readers ek ek karke).</p>
        <p><b>COW ka idea:</b> andar ek array hai jo kabhi badalta nahi. Har write (<code>add</code>, <code>set</code>, <code>remove</code>):</p>
        <ol>
          <li>lock lo (writes ek ek karke)</li>
          <li>poore array ki <b>nayi copy</b> banao, usme change karo</li>
          <li>reference ko nayi array pe point karo (volatile write)</li>
        </ol>
        <p>Reads bina lock ke purane/naye kisi bhi complete array ko padhte hain. Iterator jis array pe bana, usi ka <b>snapshot</b> dekhta hai: kabhi CME nahi.</p>
        <pre class="diagram">
 Iterator (loop chal raha)  ──►  [A, B, C]      ← purana array, loop isi pe poora hoga
 add("D") hua:                   [A, B, C, D]   ← naya array, list ab isko point karti hai
 Agla loop                  ──►  [A, B, C, D]</pre>`
    },
    {
      type: "code",
      title: "ArrayList vs CopyOnWriteArrayList: loop ke beech add karo",
      code: `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> normal = new ArrayList<>(List.of("email", "sms"));
        try {
            for (String l : normal) {
                if (l.equals("email")) normal.add("push");      // loop ke beech change
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("ArrayList: ConcurrentModificationException");
        }

        List<String> cow = new CopyOnWriteArrayList<>(List.of("email", "sms"));
        for (String l : cow) {
            if (l.equals("email")) cow.add("push");             // CME nahi
            System.out.println("loop ne dekha: " + l);           // push nahi dikhega (snapshot)
        }
        System.out.println("list ab: " + cow);

        Iterator<String> it = cow.iterator();
        it.next();
        try {
            it.remove();
        } catch (UnsupportedOperationException e) {
            System.out.println("COW iterator.remove(): UnsupportedOperationException");
        }
    }
}`,
      note: "Snapshot iterator ka matlab: loop shuru hone ke baad ke changes us loop ko nahi dikhte. Event bus ke liye ye theek hai (naya listener agle event se kaam karega). Iterator se remove/set/add supported nahi hai; list pe seedha <code>remove</code> karo."
    },
    {
      type: "text",
      html: `
        <h3>Kab COW, kab nahi</h3>
        <table>
          <tr><th></th><th>CopyOnWriteArrayList</th><th>Collections.synchronizedList</th><th>ArrayList</th></tr>
          <tr><td>Read / iterate</td><td>Bina lock, bahut fast, snapshot</td><td>Har call lock; iterate karte waqt khud <code>synchronized(list)</code> lagana padta hai</td><td>Fast, par sirf ek thread</td></tr>
          <tr><td>Write cost</td><td><b>O(n)</b>: poori array copy</td><td>O(1) amortized + lock</td><td>O(1) amortized</td></tr>
          <tr><td>Best for</td><td>Bahut zyada reads, bahut kam writes, chhoti list (listeners, config, routing table)</td><td>Reads-writes mix, simple code</td><td>Single thread</td></tr>
          <tr><td>Avoid</td><td>Bada list + frequent writes (10k items × har second add = GC pe bhaari)</td><td>Bahut zyada parallel reads</td><td>Multi-thread</td></tr>
        </table>
        <p><code>CopyOnWriteArraySet</code> isi pe bana Set hai (andar COW list, <code>contains</code> O(n)). Chhote sets ke liye.</p>`
    },
    {
      type: "quiz",
      q: "10,000 items ki CopyOnWriteArrayList hai. Ek loop mein 1000 baar <code>list.add(x)</code> kiya. Roughly kitne elements copy hue?",
      options: [
        "1000 (har add pe ek element)",
        "Lagbhag 1 crore (har add pe ~10,000 ki poori array copy)",
        "10,000 (sirf ek baar copy)",
        "0, COW lazy copy karta hai"
      ],
      answer: 1,
      why: "Har mutation poori array copy karta hai: ~10,000 + 10,001 + ... ≈ 1000 × 10,500 ≈ 1.05 crore copies. Isliye COW write-heavy kaam ke liye galat choice hai. Bulk mein daalna ho to <code>addAll</code> ek hi copy karta hai."
    },
    {
      type: "text",
      html: `
        <h2>Part 2: ThreadLocal</h2>
        <p><b>Problem 1:</b> <code>SimpleDateFormat</code> thread-safe nahi hai (andar mutable state). Ek shared static instance ko 50 request threads use karein to galat dates aati hain. Har call pe naya banana mehenga.</p>
        <p><b>Problem 2:</b> Request ka <code>userId</code> / <code>traceId</code> controller se lekar 10 layer neeche DAO aur logger tak chahiye. Har method mein parameter pass karna gande code ka raasta hai.</p>
        <p><b>ThreadLocal:</b> ek variable jiski <b>har thread ki apni alag value</b> hoti hai. Thread A ne set kiya to sirf A ko dikhega.</p>
        <pre class="code-static">static final ThreadLocal&lt;String&gt; TRACE = new ThreadLocal&lt;&gt;();
static final ThreadLocal&lt;SimpleDateFormat&gt; FMT =
        ThreadLocal.withInitial(() -&gt; new SimpleDateFormat("yyyy-MM-dd"));

TRACE.set("req-42");     // sirf current thread ke liye
TRACE.get();             // "req-42" (doosre thread ko null)
TRACE.remove();          // kaam khatam: SAAF KARO</pre>
        <p><b>Andar kaise:</b> value ThreadLocal object mein nahi, balki har <code>Thread</code> object ke andar ek map (<code>ThreadLocalMap</code>) mein rehti hai. Key = ThreadLocal (weak reference), value = aapka object (<b>strong</b> reference).</p>
        <pre class="diagram">
 Thread-1 ──► ThreadLocalMap { TRACE → "req-42", FMT → SimpleDateFormat@1 }
 Thread-2 ──► ThreadLocalMap { TRACE → "req-77", FMT → SimpleDateFormat@2 }</pre>
        <p>Real use: logging frameworks ka <b>MDC</b> (SLF4J/Logback: har log line mein traceId), Spring ka <code>SecurityContextHolder</code> (default strategy ThreadLocal) aur <code>@Transactional</code> ka current connection.</p>`
    },
    {
      type: "code",
      title: "Har thread ki apni value + thread pool mein 'leak' (purani request ka data)",
      code: `import java.util.concurrent.*;

public class Main {
    static final ThreadLocal<String> USER = new ThreadLocal<>();

    static String handle(String user, boolean cleanUp) {
        String before = USER.get();            // pichhle task ka bacha hua?
        if (user != null) USER.set(user);
        try {
            return "task(" + user + ") ne shuru mein dekha: " + before;
        } finally {
            if (cleanUp) USER.remove();
        }
    }

    public static void main(String[] args) throws Exception {
        Thread a = new Thread(() -> { USER.set("riya"); System.out.println("A: " + USER.get()); });
        Thread b = new Thread(() -> System.out.println("B: " + USER.get()));
        a.start(); a.join();
        b.start(); b.join();

        // 1 thread ka pool: same thread dobara use hota hai
        ExecutorService pool = Executors.newSingleThreadExecutor();
        System.out.println(pool.submit(() -> handle("aman", false)).get());
        System.out.println(pool.submit(() -> handle(null, false)).get());   // aman abhi bhi hai! (bug)

        ExecutorService pool2 = Executors.newSingleThreadExecutor();
        System.out.println(pool2.submit(() -> handle("aman", true)).get());
        System.out.println(pool2.submit(() -> handle(null, true)).get());   // null (sahi)

        pool.shutdown(); pool2.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        pool2.awaitTermination(1, TimeUnit.SECONDS);
    }
}`,
      note: "Pool ke threads marte nahi, isliye unka ThreadLocalMap bhi nahi marta. <code>remove()</code> na karo to agli request ko pichhle user ka data dikh sakta hai (security bug!), aur bade objects memory mein atke rehte hain."
    },
    {
      type: "warn",
      html: `⚠️ <b>ThreadLocal memory leak, poori kahani:</b>
        <ul>
          <li>ThreadLocalMap ki key <b>weak</b> hai: agar aapne ThreadLocal object ka reference chhod diya, GC key ko null kar deta hai.</li>
          <li>Par <b>value strong</b> hai. Key null hone ke baad bhi value tab tak memory mein rehti hai jab tak thread zinda hai (ya map khud aage kabhi us stale entry ko saaf na kare).</li>
          <li>Thread pool / app server (Tomcat) mein threads saalon zinda rehte hain. Aur web apps redeploy pe classloader leak bhi hota hai.</li>
          <li><b>Fix:</b> hamesha <code>try { tl.set(x); ... } finally { tl.remove(); }</code>. ThreadLocal ko <code>static final</code> rakho (har object ke liye naya ThreadLocal mat banao).</li>
        </ul>`
    },
    {
      type: "pick",
      id: "pick-threadlocal",
      q: "Kaunse use cases ThreadLocal ke liye <b>theek</b> hain?",
      options: [
        { text: "Request ka traceId logging ke liye (MDC)", correct: true, why: "Classic use. Request ke shuru mein set, end mein (filter ke finally mein) clear." },
        { text: "Non-thread-safe <code>SimpleDateFormat</code> ka per-thread instance", correct: true, why: "Theek hai, par modern code mein immutable <code>DateTimeFormatter</code> use karo, ThreadLocal ki zaroorat hi nahi." },
        { text: "Saare threads ke beech shared counter", correct: false, why: "ThreadLocal share nahi karta, har thread ka alag counter banega. Shared ke liye AtomicInteger / LongAdder." },
        { text: "Ek thread se doosre thread ko result bhejna", correct: false, why: "Doosre thread ko value dikhegi hi nahi. Iske liye Future / BlockingQueue / CompletableFuture." },
        { text: "Har request ke saath badalne wala user object, bina finally mein remove() kiye, thread pool mein", correct: false, why: "Yahi leak + data-mixup bug hai. Remove zaroori hai." },
        { text: "Per-thread reusable buffer (jaise StringBuilder) taaki baar baar allocation na ho", correct: true, why: "Valid optimization, bas buffer bahut bada na ho aur limit rakho." }
      ]
    },
    {
      type: "text",
      html: `
        <h3>InheritableThreadLocal aur aage ka raasta</h3>
        <ul>
          <li><code>InheritableThreadLocal</code>: naya thread banate waqt parent ki value child ko copy hoti hai. Par thread <b>pool</b> mein thread pehle se bane hote hain, isliye task submit karne pe copy nahi hoti (common galatfehmi).</li>
          <li><b>Virtual threads (Java 21):</b> ThreadLocal chalta hai, par lakhon virtual threads × har ek ki ThreadLocal copy = bahut memory.</li>
          <li><b>ScopedValue</b>: ThreadLocal ka modern, immutable alternative (Java 21-24 preview, <b>Java 25 mein final</b>, JEP 506). Value ek scope tak hi rehti hai, khud saaf hoti hai, remove bhoolne ka sawaal hi nahi. Runner Java 17 hai, isliye yahan sirf idea:</li>
        </ul>
        <pre class="code-static">static final ScopedValue&lt;String&gt; USER = ScopedValue.newInstance();

ScopedValue.where(USER, "riya").run(() -&gt; service.handle());   // andar USER.get() = "riya"
// run() ke bahar value apne aap gayab</pre>`
    },
    {
      type: "exercise",
      id: "ex-request-context",
      title: "Request context jo pool mein leak na ho",
      level: "Medium",
      task: `<p><code>RequestContext</code> class mein ek <b>static ThreadLocal&lt;String&gt;</b> rakho jo current user store kare. Teen methods:</p>
        <ul>
          <li><code>static String currentUser()</code>: current thread ka user, ya set nahi hai to <code>"anonymous"</code>.</li>
          <li><code>static &lt;T&gt; T runAs(String user, Supplier&lt;T&gt; work)</code>: user set karo, <code>work</code> chalao, result lautao, aur <b>hamesha</b> (exception pe bhi) context saaf karo.</li>
          <li>Nested call support: <code>runAs("a", () -&gt; runAs("b", ...))</code> mein andar wale ke baad bahar wala user <code>"a"</code> wapas aana chahiye (andar ka remove bahar wale ko mita na de).</li>
        </ul>
        <p>Harness ek single-thread pool pe kai tasks chala ke check karta hai ki ek task ka user agle task ko na dikhe.</p>`,
      examples: "<code>runAs(\"riya\", RequestContext::currentUser)</code> → <code>\"riya\"</code><br>uske baad same thread pe <code>currentUser()</code> → <code>\"anonymous\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.function.Supplier;

class RequestContext {
    private static String user;   // TODO: ye galat hai, saare threads share karenge

    static String currentUser() {
        return user == null ? "anonymous" : user;
    }

    static <T> T runAs(String u, Supplier<T> work) {
        user = u;
        return work.get();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static <T> T onPool(ExecutorService p, Callable<T> c) {
        try { return p.submit(c).get(2, TimeUnit.SECONDS); } catch (Exception e) { throw new RuntimeException(e); }
    }

    public static void main(String[] args) throws Exception {
        Check.eq("runAs ke andar user", "riya", () -> RequestContext.runAs("riya", RequestContext::currentUser));
        Check.eq("runAs ke baad saaf", "anonymous", () -> {
            RequestContext.runAs("riya", () -> 1);
            return RequestContext.currentUser();
        });
        Check.hiddenFromHere();
        Check.eq("pool: agla task purana user na dekhe", List.of("aman", "anonymous"), () -> {
            ExecutorService p = Executors.newSingleThreadExecutor();
            try {
                String first = onPool(p, () -> RequestContext.runAs("aman", RequestContext::currentUser));
                String second = onPool(p, RequestContext::currentUser);
                return List.of(first, second);
            } finally { p.shutdownNow(); }
        });
        Check.eq("exception pe bhi saaf", "anonymous", () -> {
            try {
                RequestContext.runAs("x", () -> { throw new IllegalStateException("boom"); });
            } catch (IllegalStateException e) { }
            return RequestContext.currentUser();
        });
        Check.eq("nested: [andar, bahar wapas, end]", List.of("b", "a", "anonymous"), () -> {
            List<String> seen = new ArrayList<>();
            RequestContext.runAs("a", () -> {
                seen.add(RequestContext.runAs("b", RequestContext::currentUser));
                seen.add(RequestContext.currentUser());
                return null;
            });
            seen.add(RequestContext.currentUser());
            return seen;
        });
        Check.eq("do threads ek saath: dono apna user dekhein", List.of("t1", "t2"), () -> {
            CyclicBarrier both = new CyclicBarrier(2);
            ExecutorService p = Executors.newFixedThreadPool(2);
            try {
                Future<String> f1 = p.submit(() -> RequestContext.runAs("t1", () -> { await(both); return RequestContext.currentUser(); }));
                Future<String> f2 = p.submit(() -> RequestContext.runAs("t2", () -> { await(both); return RequestContext.currentUser(); }));
                return List.of(get(f1), get(f2));
            } finally { p.shutdownNow(); }
        });
    }

    static String get(Future<String> f) {
        try { return f.get(2, TimeUnit.SECONDS); } catch (Exception e) { return "💥 " + e.getCause(); }
    }

    // dono threads set karne ke baad hi padhein, taaki shared static field wala bug pakda jaaye
    static void await(CyclicBarrier b) {
        try { b.await(1, TimeUnit.SECONDS); } catch (Exception e) { throw new RuntimeException(e); }
    }
}`,
      hints: [
        "<code>private static final ThreadLocal&lt;String&gt; USER = new ThreadLocal&lt;&gt;();</code> aur <code>currentUser()</code> mein <code>USER.get()</code>.",
        "<code>runAs</code> mein <code>try { USER.set(u); return work.get(); } finally { ... }</code>.",
        "Nested ke liye: set karne se pehle <code>String previous = USER.get();</code> yaad rakho. finally mein previous null ho to <code>remove()</code>, warna <code>USER.set(previous)</code>."
      ],
      solution: `import java.util.function.Supplier;

class RequestContext {
    private static final ThreadLocal<String> USER = new ThreadLocal<>();

    static String currentUser() {
        String u = USER.get();
        return u == null ? "anonymous" : u;
    }

    static <T> T runAs(String u, Supplier<T> work) {
        String previous = USER.get();      // nested call ke liye
        USER.set(u);
        try {
            return work.get();
        } finally {
            if (previous == null) USER.remove();   // bahar sabse upar: poora saaf
            else USER.set(previous);               // nested: bahar wala wapas
        }
    }
}`,
      explain: "<p><b>ThreadLocal</b> se har thread ka apna user. <b>finally</b> se exception pe bhi cleanup. <b>previous</b> yaad rakhne se nested calls sahi chalte hain, aur sabse bahar ke level pe <code>remove()</code> (sirf <code>set(null)</code> nahi) taaki ThreadLocalMap mein entry hi na bache.</p><p>Yahi pattern Spring Security aur logging MDC ke filters mein hota hai. Har operation O(1).</p>"
    },
    {
      type: "think",
      id: "think-cow-tl",
      q: "Interview question: <b>\"ThreadLocal se memory leak kaise hota hai? Tomcat jaise server mein isse kaise bachoge?\"</b>",
      rubric: [
        { point: "Value <b>Thread ke ThreadLocalMap</b> mein rehti hai, ThreadLocal object mein nahi", keys: ["threadlocalmap", "thread ke andar", "thread object", "har thread ka map", "map"], weight: 2 },
        { point: "Key <b>weak</b>, value <b>strong</b> reference", keys: ["weak", "strong", "weakreference"], weight: 2 },
        { point: "<b>Thread pool</b> ke threads marte nahi, isliye value hamesha rehti hai (aur agli request ko dikh sakti hai)", keys: ["pool", "reuse", "marte nahi", "long lived", "zinda", "agli request"], weight: 2 },
        { point: "Fix: <b>finally mein remove()</b>", keys: ["remove", "finally", "clear"], weight: 2 },
        { point: "static final ThreadLocal / redeploy pe classloader leak / ScopedValue alternative", keys: ["static final", "classloader", "redeploy", "scopedvalue", "scoped value"] }
      ],
      answer: `<p>ThreadLocal ki value har <code>Thread</code> object ke andar ek <code>ThreadLocalMap</code> mein store hoti hai. Map ki key ThreadLocal ka <b>weak</b> reference hai, par value <b>strong</b> reference hai.</p>
        <p>Tomcat jaise servers request threads ka <b>pool</b> rakhte hain: threads kabhi nahi marte. Agar request ke end mein <code>remove()</code> nahi kiya to: (1) bada object memory mein atka rehta hai, (2) agli request jo usi thread pe aaye use pichhle user ka data dikh sakta hai, (3) app redeploy pe value ki class purane classloader ko pakad ke rakhti hai (classloader leak, Tomcat isliye warning log karta hai).</p>
        <p><b>Bachav:</b> filter/interceptor mein <code>try { set } finally { remove() }</code>, ThreadLocal <code>static final</code>, sirf chhoti values, aur naye code mein (Java 25+) <code>ScopedValue</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> COW ke liye ek line yaad rakho: <i>\"Reads lock-free, writes O(n) copy, iterator snapshot.\"</i> ThreadLocal ke liye: <i>\"Har thread ki apni copy, value Thread mein rehti hai, pool mein finally remove.\"</i> Interviewer \"ThreadLocal ka real use?\" pooche to MDC/traceId ka example do."
    }
  ],
  references: [
    { title: "CopyOnWriteArrayList (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CopyOnWriteArrayList.html", type: "docs" },
    { title: "ThreadLocal (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/ThreadLocal.html", type: "docs" },
    { title: "JEP 506: Scoped Values", by: "OpenJDK", url: "https://openjdk.org/jeps/506", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 3.3: Thread confinement)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
