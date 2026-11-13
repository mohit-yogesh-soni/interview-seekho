// Classic: Thread-safe Singleton
registerLesson("concurrency", "singleton-thread-safe", {
  why: "\"Thread-safe singleton likho\" aur uska follow-up \"double-checked locking mein volatile kyun?\" Java interviews ka evergreen question hai. Isme lazy init, synchronized ka cost, Java memory model (reordering) aur class loading teeno aate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>Ek <code>ConfigManager</code> chahiye jiska poore app mein <b>ek hi</b> object ho, aur wo pehli baar use hone pe hi bane (lazy, kyunki file padhna mehenga hai).</p>
        <pre class="code-static">class ConfigManager {
    private static ConfigManager instance;
    private ConfigManager() { /* config file padho */ }

    static ConfigManager getInstance() {
        if (instance == null) {              // T1 aur T2 dono yahan null dekh sakte hain
            instance = new ConfigManager();  // dono naya bana denge: 2 objects!
        }
        return instance;
    }
}</pre>
        <p>Single thread mein theek. Do threads ek saath <code>getInstance()</code> karein to <b>check-then-act</b> race: dono null dekhte hain, dono object banate hain.</p>`
    },
    {
      type: "steps",
      title: "Race: naive lazy singleton",
      steps: [
        { title: "T1 aur T2 dono check karte hain", html: `<table class="lanes"><tr><th>T1</th><td class="run">instance == null? haan</td></tr><tr><th>T2</th><td class="run">instance == null? haan</td></tr></table>` },
        { title: "Dono banate hain", html: `<table class="lanes"><tr><th>T1</th><td class="bad">new ConfigManager() → @A</td></tr><tr><th>T2</th><td class="bad">new ConfigManager() → @B</td></tr></table>
          <p>T1 ke paas @A, T2 ke paas @B. Agar ye connection pool ya cache hota to do pools, double memory, alag state. Bug sirf load pe aata hai, local testing mein nahi.</p>` }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Paanch versions</h2>
        <h3>1. Eager (static field)</h3>
        <pre class="code-static">class Config {
    private static final Config INSTANCE = new Config();
    private Config() {}
    static Config getInstance() { return INSTANCE; }
}</pre>
        <p>Thread-safe kyunki <b>class initialization</b> JVM khud lock karke ek hi baar karta hai (JLS 12.4.2). Object class ke <b>initialization</b> pe banta hai, jo pehle active use pe hota hai (jaise pehli baar <code>getInstance()</code> ya koi aur static member chhoona), sirf class load hone pe nahi. Class mein aur static members na hon to ye practically lazy jaisa hi hai. Aksar ye kaafi hota hai.</p>

        <h3>2. synchronized method</h3>
        <pre class="code-static">static synchronized Config getInstance() {
    if (instance == null) instance = new Config();
    return instance;
}</pre>
        <p>Sahi aur lazy. Par <b>har call</b> pe lock, jabki lock ki zaroorat sirf pehli baar thi. Hot path pe (har request) contention.</p>

        <h3>3. Double-checked locking (DCL) + volatile</h3>
        <pre class="code-static">private static volatile Config instance;      // volatile ZAROORI

static Config getInstance() {
    Config local = instance;                  // ek hi volatile read (fast path)
    if (local == null) {                      // check 1: bina lock
        synchronized (Config.class) {
            local = instance;
            if (local == null) {              // check 2: lock ke andar
                instance = local = new Config();
            }
        }
    }
    return local;
}</pre>

        <h3>4. Holder idiom (Initialization-on-demand holder) ⭐</h3>
        <pre class="code-static">class Config {
    private Config() {}
    private static class Holder {
        static final Config INSTANCE = new Config();   // Holder pehli baar touch hone pe init
    }
    static Config getInstance() { return Holder.INSTANCE; }
}</pre>
        <p>Lazy (Holder class tabhi load/init hoti hai jab <code>getInstance()</code> pehli baar chale), thread-safe (class init ka JVM lock), aur koi <code>synchronized</code>/<code>volatile</code> nahi.</p>

        <h3>5. Enum singleton</h3>
        <pre class="code-static">enum Config {
    INSTANCE;
    String get(String key) { ... }
}
Config.INSTANCE.get("db.url");</pre>
        <p>Effective Java (Joshua Bloch) ki recommendation: thread-safe, aur <b>serialization</b> aur <b>reflection</b> attacks se bhi safe (JVM enum ka naya object banne nahi deta). Kami: kisi class ko extend nahi kar sakta, aur INSTANCE enum ke initialization pe (pehle use pe) ban jaata hai, alag se lazy control nahi.</p>`
    },
    {
      type: "warn",
      html: `⚠️ <b>DCL mein volatile kyun? (asli interview question)</b>
        <p><code>instance = new Config()</code> ek step nahi hai. Roughly: (1) memory allocate, (2) constructor chalao (fields set), (3) reference <code>instance</code> mein daalo. Compiler/CPU (2) aur (3) ko <b>reorder</b> kar sakte hain.</p>
        <p>Bina volatile: T1 ne (1) aur (3) kar diya, (2) abhi baaki. T2 check 1 pe <code>instance != null</code> dekhta hai, lock lete hi nahi, aur <b>aadha bana hua object</b> use kar leta hai (fields null/0).</p>
        <p><code>volatile</code> write ek happens-before banata hai: constructor ke saare writes reference publish hone se <b>pehle</b> doosre threads ko dikhenge. Ye guarantee Java 5 (JSR-133 memory model) se hai; usse pehle DCL broken tha.</p>`
    },
    {
      type: "code",
      title: "50 threads ek saath getInstance(): naive vs holder (kitne objects bane?)",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger naiveCreated = new AtomicInteger();
    static final AtomicInteger holderCreated = new AtomicInteger();

    static class Naive {
        private static Naive instance;
        private Naive() {
            naiveCreated.incrementAndGet();
            try { Thread.sleep(5); } catch (InterruptedException e) { }   // mehenga constructor
        }
        static Naive getInstance() {
            if (instance == null) instance = new Naive();
            return instance;
        }
    }

    static class Lazy {
        private Lazy() {
            holderCreated.incrementAndGet();
            try { Thread.sleep(5); } catch (InterruptedException e) { }
        }
        private static class Holder { static final Lazy INSTANCE = new Lazy(); }
        static Lazy getInstance() { return Holder.INSTANCE; }
    }

    static Set<Object> hammer(Callable<Object> get) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(50);
        CountDownLatch start = new CountDownLatch(1);
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        List<Future<?>> fs = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            fs.add(pool.submit(() -> { start.await(); seen.add(get.call()); return null; }));
        }
        start.countDown();                     // sab ek saath chhodo
        for (Future<?> f : fs) f.get();
        pool.shutdown();
        pool.awaitTermination(2, TimeUnit.SECONDS);
        return seen;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("holder: alag objects = " + hammer(Lazy::getInstance).size() + ", constructor calls = " + holderCreated.get());
        System.out.println("naive : alag objects = " + hammer(Naive::getInstance).size() + ", constructor calls = " + naiveCreated.get());
        System.out.println("(naive multi-core machine pe aksar > 1 aata hai; browser JVM ek CPU pe bhi sleep ki wajah se dikh sakta hai)");
    }
}`,
      note: "Holder hamesha 1. Naive ka number machine aur timing pe depend karta hai: yahi race condition ki pehchaan hai. Kabhi 1 aaye to bhi code sahi nahi hai."
    },
    {
      type: "quiz",
      q: "Holder idiom mein <code>Config.getInstance()</code> pehli baar call hone se pehle kya <code>Config</code> class load ho chuki hoti hai par <code>INSTANCE</code> nahi bana hota?",
      options: [
        "Nahi, Config load hote hi INSTANCE ban jaata hai",
        "Haan. Nested static class (Holder) alag class hai; wo tabhi initialize hoti hai jab pehli baar Holder.INSTANCE access ho",
        "INSTANCE compile time pe banta hai",
        "Holder idiom lazy nahi hai, sirf thread-safe hai"
      ],
      answer: 1,
      why: "JLS ke hisaab se class tab initialize hoti hai jab uska static field pehli baar use ho. <code>Config</code> ke doosre static methods call karne se <code>Holder</code> initialize nahi hota. Isliye lazy + JVM ke class-init lock se thread-safe."
    },
    {
      type: "pick",
      id: "pick-singleton",
      q: "Kaunse statements <b>sahi</b> hain?",
      options: [
        { text: "DCL bina <code>volatile</code> ke doosre thread ko aadha initialized object de sakta hai", correct: true, why: "Reordering: reference constructor khatam hone se pehle publish ho sakta hai." },
        { text: "Enum singleton reflection se <code>newInstance</code> karke toda ja sakta hai", correct: false, why: "JVM enum ka reflective construction allow nahi karta (IllegalArgumentException). Isliye enum sabse strong hai." },
        { text: "Private constructor wala normal singleton serialize-deserialize karne pe naya object ban sakta hai (agar readResolve na ho)", correct: true, why: "Deserialization constructor bypass karke naya object banata hai. Fix: readResolve() se INSTANCE lautao, ya enum." },
        { text: "Eager static final field wala singleton thread-safe nahi hai", correct: false, why: "Class initialization JVM ek baar, lock ke saath karta hai. Thread-safe hai." },
        { text: "synchronized getInstance() sahi hai par har call pe lock lagata hai", correct: true, why: "Correct but slow-ish on hot paths. (Uncontended locks sasti hain, par phir bhi holder better.)" },
        { text: "Spring ke @Service beans by default singleton hain, isliye unke andar mutable fields bina sync ke safe hain", correct: false, why: "Singleton = ek object, jise saare request threads share karte hain. Mutable state ho to wahi race. Beans stateless rakho." }
      ]
    },
    {
      type: "exercise",
      id: "ex-dcl",
      title: "Lazy, thread-safe IdGenerator (ek hi instance, unique IDs)",
      level: "Medium",
      task: `<p><code>IdGenerator</code> singleton banao:</p>
        <ul>
          <li><code>static IdGenerator getInstance()</code>: lazy (pehli call pe bane) aur hamesha same object. Constructor <b>private</b>.</li>
          <li>Constructor mein <code>IdGenerator.created</code> (static AtomicInteger, diya hua) ko +1 karo, taaki harness gin sake kitne objects bane.</li>
          <li><code>long nextId()</code>: 1, 2, 3... unique IDs, kai threads se bhi koi duplicate nahi.</li>
        </ul>
        <p>Koi bhi sahi tareeka chalega: holder, DCL + volatile, synchronized. Harness 64 threads se ek saath hammer karta hai.</p>`,
      examples: "<code>getInstance() == getInstance()</code> → <code>true</code><br>8 threads × 1000 <code>nextId()</code> → 8000 alag IDs, max 8000",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.atomic.AtomicInteger;

class IdGenerator {
    static final AtomicInteger created = new AtomicInteger();
    private static IdGenerator instance;
    private long counter = 0;

    private IdGenerator() {
        created.incrementAndGet();
        try { Thread.sleep(20); } catch (InterruptedException e) { }   // mehenga setup
    }

    static IdGenerator getInstance() {
        if (instance == null) instance = new IdGenerator();
        return instance;
    }

    long nextId() {
        return ++counter;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Check.eq("lazy: getInstance se pehle koi object nahi", 0, () -> IdGenerator.created.get());
        Check.eq("same object", true, () -> IdGenerator.getInstance() == IdGenerator.getInstance());
        Check.hiddenFromHere();
        Check.eq("constructor private", true, () -> {
            for (java.lang.reflect.Constructor<?> c : IdGenerator.class.getDeclaredConstructors()) {
                if (!java.lang.reflect.Modifier.isPrivate(c.getModifiers())) return false;
            }
            return true;
        });
        Check.eq("8 threads x 1000 nextId: [unique, max]", List.of(8000, 8000L), () -> {
            Set<Long> ids = ConcurrentHashMap.newKeySet();
            ExecutorService p = Executors.newFixedThreadPool(8);
            CountDownLatch go = new CountDownLatch(1);
            List<Future<?>> fs = new ArrayList<>();
            for (int t = 0; t < 8; t++) fs.add(p.submit(() -> {
                go.await();
                for (int i = 0; i < 1000; i++) { ids.add(IdGenerator.getInstance().nextId()); Thread.yield(); }
                return null;
            }));
            go.countDown();
            for (Future<?> f : fs) {
                try { f.get(3, TimeUnit.SECONDS); } catch (Exception e) { throw new RuntimeException(e); }
            }
            p.shutdown();
            return List.of(ids.size(), Collections.max(ids) - Collections.min(ids) + 1);
        });
        Check.eq("thread-safe getInstance (code check: synchronized / volatile / holder)", true, () -> {
            boolean holder = IdGenerator.class.getDeclaredClasses().length > 0;
            boolean volatileField = false, syncMethod = false, finalStatic = false;
            for (java.lang.reflect.Field f : IdGenerator.class.getDeclaredFields()) {
                int m = f.getModifiers();
                if (f.getType() == IdGenerator.class && java.lang.reflect.Modifier.isVolatile(m)) volatileField = true;
                if (f.getType() == IdGenerator.class && java.lang.reflect.Modifier.isFinal(m) && java.lang.reflect.Modifier.isStatic(m)) finalStatic = true;
            }
            for (java.lang.reflect.Method mt : IdGenerator.class.getDeclaredMethods()) {
                if (mt.getName().equals("getInstance") && java.lang.reflect.Modifier.isSynchronized(mt.getModifiers())) syncMethod = true;
            }
            return holder || volatileField || syncMethod || finalStatic;
        });
    }
}`,
      hints: [
        "Sabse aasaan: holder idiom. <code>private static class Holder { static final IdGenerator INSTANCE = new IdGenerator(); }</code> aur <code>getInstance()</code> mein <code>return Holder.INSTANCE;</code>. Purana <code>instance</code> field hata do.",
        "<code>counter</code> ko <code>AtomicLong</code> banao aur <code>nextId()</code> mein <code>counter.incrementAndGet()</code>. <code>++counter</code> atomic nahi hai.",
        "Singleton ek object deta hai, par uske andar ka state phir bhi thread-safe hona chahiye: do alag problems."
      ],
      solution: `import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

class IdGenerator {
    static final AtomicInteger created = new AtomicInteger();
    private final AtomicLong counter = new AtomicLong();

    private IdGenerator() {
        created.incrementAndGet();
        try { Thread.sleep(20); } catch (InterruptedException e) { }
    }

    private static class Holder {
        static final IdGenerator INSTANCE = new IdGenerator();
    }

    static IdGenerator getInstance() {
        return Holder.INSTANCE;
    }

    long nextId() {
        return counter.incrementAndGet();
    }
}`,
      explain: "<p>Do alag thread-safety problems the: (1) <b>ek hi object</b> banna: holder idiom JVM ke class-init lock se ye guarantee deta hai, aur lazy bhi hai (pehla test isi ko check karta hai). (2) <b>object ke andar ka state</b>: <code>++counter</code> read-modify-write hai, isliye <code>AtomicLong</code>.</p><p>Bahut candidates sirf (1) theek karte hain. Interviewer aksar yahi pakadta hai: \"singleton thread-safe hai, par uska method?\"</p>"
    },
    {
      type: "think",
      id: "think-dcl",
      q: "Interview question: <b>\"Double-checked locking likho aur samjhao ki do checks aur volatile teeno kyun chahiye.\"</b>",
      rubric: [
        { point: "Pehla check <b>bina lock</b>: object ban jaane ke baad har call pe lock na lage (performance)", keys: ["bina lock", "without lock", "fast path", "performance", "har call", "lock avoid"], weight: 2 },
        { point: "Doosra check <b>lock ke andar</b>: do threads pehla check pass kar gaye ho to doosra dobara na banaye", keys: ["lock ke andar", "inside lock", "second check", "doosra check", "dobara check", "dono threads"], weight: 2 },
        { point: "<b>volatile</b>: reordering ki wajah se aadha bana object publish ho sakta hai", keys: ["reorder", "half", "aadha", "partially", "constructor", "publish"], weight: 2 },
        { point: "volatile happens-before / Java memory model (Java 5 / JSR-133 se sahi)", keys: ["happens-before", "happens before", "memory model", "jmm", "jsr-133", "java 5"] },
        { point: "Better alternatives: holder idiom ya enum", keys: ["holder", "enum", "bill pugh", "initialization on demand"] }
      ],
      answer: `<pre class="code-static">private static volatile Singleton instance;
static Singleton getInstance() {
    if (instance == null) {                    // 1: fast path, bina lock
        synchronized (Singleton.class) {
            if (instance == null) {            // 2: lock ke andar dobara
                instance = new Singleton();
            }
        }
    }
    return instance;
}</pre>
        <ul>
          <li><b>Check 1</b> bina lock: object ban gaya to baaki saari calls lock ke bina return (sirf ek volatile read).</li>
          <li><b>Check 2</b> lock ke andar: T1 aur T2 dono ne check 1 pe null dekha. T1 lock lekar banata hai. T2 lock milne pe dobara dekhta hai, ab null nahi, to nahi banata.</li>
          <li><b>volatile:</b> <code>new</code> = allocate + constructor + assign; JIT/CPU assign ko constructor se pehle kar sakte hain. Bina volatile, doosra thread check 1 pe non-null aadha object le jaata hai. volatile write happens-before banata hai (Java 5 ke memory model, JSR-133 se).</li>
        </ul>
        <p>Phir bolo: "Production mein main holder idiom ya enum prefer karunga, kam code, kam galti."</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Order mein jawab do: naive (race dikhao) → synchronized (sahi par slow) → DCL + volatile (kyun) → holder / enum (best). Ye progression interviewer ko dikhata hai ki aap trade-off samajhte ho. Last mein ek line: <i>\"Singleton global state hai, testing mushkil karta hai; Spring jaise DI container mein bean scope singleton rakhna usually better hai.\"</i>"
    }
  ],
  references: [
    { title: "Effective Java (3rd ed.), Item 3: singleton with private constructor or enum type", by: "Joshua Bloch", type: "book" },
    { title: "JLS 12.4.2: Detailed Initialization Procedure", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-12.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 16.2: Safe publication, DCL)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" },
    { title: "Refactoring Guru: Singleton", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/singleton", type: "article" }
  ]
});
