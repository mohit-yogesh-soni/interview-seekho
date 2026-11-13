// Virtual Threads (Java 21)
registerLesson("concurrency", "virtual-threads", {
  why: "Java 21 ka sabse bada feature. Interview mein poochte hain: virtual thread kya hai, platform thread se kaise alag, kab fayda hai (I/O bound) aur kab nahi (CPU bound), pinning kya hai, aur kya thread pool ab bhi chahiye.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: thread-per-request ki limit</h2>
        <p>Spring MVC / Tomcat jaise servers mein har request ko ek thread milta hai. Ek request ka zyaadatar time <b>wait</b> mein jaata hai: DB query, doosri service ka HTTP call, Redis. Us waqt thread kuch nahi karta, bas memory pakad ke baitha rehta hai.</p>
        <ul>
          <li>Normal Java thread = <b>platform thread</b> = ek OS thread. Har ek ka stack (aksar default ~1 MB reserve, OS/flag pe depend) aur OS scheduling ka kharcha.</li>
          <li>Isliye servers 200-ish threads ka pool rakhte hain (Tomcat ka default <code>maxThreads</code> 200).</li>
          <li><b>Little's law</b>: ek saath chalti requests = throughput × latency. 2000 req/s × 100 ms = <b>200</b> threads chahiye. 10,000 req/s × 200 ms = 2000 threads: OS threads ke saath mushkil.</li>
        </ul>
        <p>Purana solution: <b>async / reactive</b> (CompletableFuture chains, WebFlux). Kaam karta hai, par code padhna, debug karna, stack traces samajhna mushkil.</p>
        <p><b>Virtual threads</b> (JEP 444, Java 21 mein final): simple blocking code likho, par thread itne saste ki <b>lakhon</b> bana sako.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Kaise kaam karta hai: carrier threads</h2>
        <pre class="diagram">
  Virtual threads (lakhon, JVM heap pe)     VT1  VT2  VT3  VT4  VT5 ... VT100000
                                              │    │    │
  Carrier threads (platform, ~CPU cores)    [C1] [C2] [C3] [C4]   ← ForkJoinPool scheduler
                                              │    │    │    │
  OS threads / CPU cores                     core core core core</pre>
        <ul>
          <li>Virtual thread ek chhota Java object hai. Uska stack heap pe rehta hai aur zaroorat ke hisaab se badhta hai.</li>
          <li>JVM ka scheduler (ek ForkJoinPool, by default parallelism = CPU cores) virtual thread ko kisi <b>carrier</b> (platform thread) pe <b>mount</b> karta hai.</li>
          <li>Jab virtual thread blocking I/O karta hai (socket read, <code>Thread.sleep</code>, <code>BlockingQueue.take</code>, lock wait), JDK use carrier se <b>unmount</b> kar deta hai: stack heap pe save, carrier free. I/O khatam hone pe kisi bhi carrier pe wapas mount.</li>
          <li>Isliye 4 carriers 1 lakh waiting requests sambhal lete hain.</li>
        </ul>`
    },
    {
      type: "steps",
      title: "Visualizer: 2 carriers, 4 virtual threads jo DB call karte hain",
      steps: [
        { title: "t1: VT1, VT2 mounted, VT3 VT4 ready queue mein", html: `<table class="lanes">
            <tr><th>Carrier C1</th><td class="run">VT1 chal raha</td></tr>
            <tr><th>Carrier C2</th><td class="run">VT2 chal raha</td></tr>
            <tr><th>Ready</th><td class="wait">VT3, VT4</td></tr></table>` },
        { title: "t2: VT1 ne DB query bheji (blocking). JDK ne VT1 unmount kiya, C1 pe VT3", html: `<table class="lanes">
            <tr><th>Carrier C1</th><td class="run">VT3 chal raha</td></tr>
            <tr><th>Carrier C2</th><td class="run">VT2 chal raha</td></tr>
            <tr><th>Parked</th><td class="block">VT1 (DB ka wait, stack heap pe)</td></tr>
            <tr><th>Ready</th><td class="wait">VT4</td></tr></table><p>Platform thread hota to C1 yahan 100ms bekaar baitha rehta.</p>` },
        { title: "t3: VT2 bhi HTTP call pe park. C2 pe VT4", html: `<table class="lanes">
            <tr><th>Carrier C1</th><td class="run">VT3</td></tr>
            <tr><th>Carrier C2</th><td class="run">VT4</td></tr>
            <tr><th>Parked</th><td class="block">VT1 (DB), VT2 (HTTP)</td></tr></table>` },
        { title: "t4: DB ka jawab aaya. VT1 ready, jo carrier free ho us pe mount", html: `<table class="lanes">
            <tr><th>Carrier C1</th><td class="run">VT3 khatam → VT1 resume (ab C1 pe)</td></tr>
            <tr><th>Carrier C2</th><td class="run">VT4</td></tr>
            <tr><th>Parked</th><td class="block">VT2 (HTTP)</td></tr></table>
            <p>Code mein VT1 ke liye ye bas ek normal <code>resultSet = stmt.executeQuery()</code> line thi. Saara jugglery JDK ne kiya.</p>` }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Code (Java 21+)</h2>
        <p class="muted small">Is site ka runner Java 17 hai, isliye ye code yahan run nahi hoga. Apne JDK 21+ pe chala ke dekho.</p>
        <pre class="code-static">// 1. Ek virtual thread
Thread t = Thread.ofVirtual().name("vt-1").start(() -&gt; System.out.println("hello"));
Thread.startVirtualThread(() -&gt; work());

// 2. Har task ke liye naya virtual thread (pool nahi!)
try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i &lt; 100_000; i++) {
        int id = i;
        exec.submit(() -&gt; {
            Thread.sleep(Duration.ofMillis(100));   // blocking: carrier free ho jaata hai
            return id;
        });
    }
}   // try-with-resources: close() saare tasks ka wait karta hai

// 3. Spring Boot 3.2+: application.properties
spring.threads.virtual.enabled=true</pre>
        <p>1 lakh tasks × 100ms sleep, platform thread pool (200) ke saath ~50 second lagte. Virtual threads ke saath lagbhag 100ms + thoda overhead.</p>`
    },
    {
      type: "code",
      title: "Java 17 mein problem dekho: blocking tasks, chhota pool vs bada pool",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static long run(int poolSize, int tasks, int waitMs) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(poolSize);
        long t0 = System.nanoTime();
        List<Future<?>> fs = new ArrayList<>();
        for (int i = 0; i < tasks; i++) {
            fs.add(pool.submit(() -> {
                try { Thread.sleep(waitMs); } catch (InterruptedException e) { }   // fake DB call
            }));
        }
        for (Future<?> f : fs) f.get();
        pool.shutdown();
        pool.awaitTermination(2, TimeUnit.SECONDS);
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) throws Exception {
        int tasks = 40, waitMs = 20;
        System.out.println("40 tasks, har ek 20ms DB wait");
        System.out.println("pool 4  threads: ~" + run(4, tasks, waitMs) + " ms   (expected ~ 40/4 x 20 = 200)");
        System.out.println("pool 40 threads: ~" + run(40, tasks, waitMs) + " ms   (expected ~ 20)");
        System.out.println("Threads zyada = I/O wait chhupta hai. Virtual threads ye 'zyada threads' sasta bana dete hain.");
    }
}`,
      note: "CPU ka koi kaam nahi ho raha, sirf wait. Platform threads mein \"zyada threads\" ka matlab zyada OS threads aur memory. Virtual threads mein lakhon tasks ke liye bhi carriers sirf CPU cores jitne."
    },
    {
      type: "text",
      html: `
        <h2>Platform vs Virtual threads</h2>
        <table>
          <tr><th></th><th>Platform thread</th><th>Virtual thread</th></tr>
          <tr><td>Kya hai</td><td>OS thread ka wrapper (1:1)</td><td>JVM managed, carriers pe M:N scheduling</td></tr>
          <tr><td>Kitne</td><td>Hazaaron tak</td><td>Lakhon / millions</td></tr>
          <tr><td>Banane ka kharcha</td><td>Mehenga (OS call, stack reserve)</td><td>Sasta (chhota heap object)</td></tr>
          <tr><td>Pool karo?</td><td>Haan, hamesha</td><td><b>Nahi</b>: har task ke liye naya. Limit chahiye to Semaphore</td></tr>
          <tr><td>Best for</td><td>CPU-heavy kaam, long-running background threads</td><td>I/O-heavy, high concurrency (web requests, microservice calls)</td></tr>
          <tr><td>Daemon</td><td>Choice</td><td>Hamesha daemon</td></tr>
          <tr><td>Priority</td><td>Set kar sakte ho</td><td>Hamesha normal (set ignore)</td></tr>
          <tr><td>ThreadLocal</td><td>Theek</td><td>Chalta hai, par lakhon threads × copy = memory. Sasta context chahiye to ScopedValue (Java 25 final)</td></tr>
        </table>`
    },
    {
      type: "warn",
      html: `⚠️ <b>Pinning: virtual thread carrier ko chhod nahi paata</b>
        <ul>
          <li><b>Java 21-23:</b> agar virtual thread <code>synchronized</code> block/method ke andar blocking call kare, ya native code (JNI) mein ho, to wo carrier pe <b>pin</b> ho jaata hai: carrier bhi block. 4 carriers, 4 pinned threads = poora app ruk gaya.</li>
          <li>Isliye Java 21 pe advice thi: lambe blocking kaam wale <code>synchronized</code> ko <code>ReentrantLock</code> se badlo. Detect: <code>-Djdk.tracePinnedThreads=full</code> ya JFR event <code>jdk.VirtualThreadPinned</code>.</li>
          <li><b>JDK 24 (JEP 491):</b> <code>synchronized</code> wali pinning hata di gayi. Native frames aur kuch corner cases (jaise class initializer ke andar block) mein ab bhi pin hota hai.</li>
        </ul>
        Interview mein version bata ke jawab do: "Java 21 mein synchronized pin karta tha, 24 se nahi."`
    },
    {
      type: "pick",
      id: "pick-vt-when",
      q: "Virtual threads se kahan <b>fayda</b> hoga?",
      options: [
        { text: "REST API jo har request pe 3 microservices call karti hai aur DB query karti hai", correct: true, why: "Zyaadatar time wait. Classic use case." },
        { text: "Video encoding / image resizing (pure CPU)", correct: false, why: "CPU bound kaam ke liye cores hi limit hain. Virtual threads CPU nahi badhaate; platform pool (cores jitna) hi theek." },
        { text: "Ek batch job jo 50,000 URLs ko HTTP se fetch karta hai", correct: true, why: "Har fetch network wait. 50k virtual threads aaram se. (Remote server pe rate limit ke liye Semaphore lagao.)" },
        { text: "Thread pool ko virtual threads se bhar ke reuse karna", correct: false, why: "Virtual threads pool nahi kiye jaate. Banana sasta hai; newVirtualThreadPerTaskExecutor use karo." },
        { text: "Kafka consumer jo har message pe DB write karta hai (blocking JDBC)", correct: true, why: "I/O bound. Bas DB connection pool ka size dhyaan rakho, wahi naya bottleneck banega." },
        { text: "Latency kam karna jab ek request khud 2 second ka CPU kaam karti ho", correct: false, why: "Virtual thread ek request ko fast nahi karta. Ye throughput (ek saath kitni) badhata hai, latency nahi." }
      ]
    },
    {
      type: "quiz",
      q: "Aapne <code>newVirtualThreadPerTaskExecutor()</code> se 10,000 requests chalayi, har ek DB query karti hai. DB connection pool (HikariCP) ka size 20 hai. Kya hoga?",
      options: [
        "10,000 queries ek saath DB pe chalengi",
        "Virtual threads connection ka wait karenge; ek saath max 20 queries. DB pool naya bottleneck hai",
        "OutOfMemoryError, kyunki 10,000 threads ban gaye",
        "Virtual threads DB pool ka size apne aap badha dete hain"
      ],
      answer: 1,
      why: "Virtual threads concurrency sasta karte hain, par downstream resources (DB connections, remote API limits) wahi rehte hain. Baaki threads pool ke connection ka wait karenge (sasta wait, carrier free). Isliye virtual threads ke saath bhi Semaphore / pool limits rakho."
    },
    {
      type: "exercise",
      id: "ex-littles-law",
      title: "Kitne threads chahiye? (Little's law)",
      level: "Easy",
      task: `<p>Capacity planning ka formula: <b>concurrent requests = throughput (req/s) × latency (seconds)</b>.</p>
        <p><code>threadsNeeded(rps, latencyMs)</code>: thread-per-request model mein kitne threads chahiye, <b>upar ki taraf round</b> (aadha thread nahi hota). Phir <code>needsVirtualThreads(rps, latencyMs, maxPlatform)</code>: <code>true</code> agar zaroori threads <code>maxPlatform</code> se zyada hain.</p>`,
      examples: "<code>threadsNeeded(2000, 100)</code> → <code>200</code><br><code>threadsNeeded(3, 500)</code> → 1.5 → <code>2</code><br><code>needsVirtualThreads(10000, 200, 500)</code> → 2000 &gt; 500 → <code>true</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    long threadsNeeded(long rps, long latencyMs) {
        return rps * latencyMs;   // TODO: units aur rounding
    }

    boolean needsVirtualThreads(long rps, long latencyMs, long maxPlatform) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("threadsNeeded(2000, 100)", 200L, () -> s.threadsNeeded(2000, 100));
        Check.eq("threadsNeeded(3, 500) round up", 2L, () -> s.threadsNeeded(3, 500));
        Check.eq("needsVirtualThreads(10000, 200, 500)", true, () -> s.needsVirtualThreads(10000, 200, 500));
        Check.hiddenFromHere();
        Check.eq("exact: threadsNeeded(100, 10)", 1L, () -> s.threadsNeeded(100, 10));
        Check.eq("bahut kam: threadsNeeded(1, 1)", 1L, () -> s.threadsNeeded(1, 1));
        Check.eq("zero traffic", 0L, () -> s.threadsNeeded(0, 300));
        Check.eq("bada: threadsNeeded(5_000_000, 2000) (overflow?)", 10_000_000L, () -> s.threadsNeeded(5_000_000, 2000));
        Check.eq("barabar pe false: needs(2000, 100, 200)", false, () -> s.needsVirtualThreads(2000, 100, 200));
        Check.eq("needs(50, 100, 200)", false, () -> s.needsVirtualThreads(50, 100, 200));
    }
}`,
      hints: [
        "Latency ms mein hai: seconds = latencyMs / 1000. To threads = rps × latencyMs / 1000.",
        "Integer mein ceil: <code>(a + b - 1) / b</code>, yahan <code>(rps * latencyMs + 999) / 1000</code>. Inputs long hain, overflow nahi hoga.",
        "<code>needsVirtualThreads</code> = <code>threadsNeeded(rps, latencyMs) &gt; maxPlatform</code> (barabar pe false)."
      ],
      solution: `class Solution {
    long threadsNeeded(long rps, long latencyMs) {
        return (rps * latencyMs + 999) / 1000;   // ceil(rps * latency_seconds)
    }

    boolean needsVirtualThreads(long rps, long latencyMs, long maxPlatform) {
        return threadsNeeded(rps, latencyMs) > maxPlatform;
    }
}`,
      explain: "<p>Little's law: L = λ × W (system mein items = arrival rate × time in system). 2000 req/s aur har request 0.1s andar rehti hai, to kisi bhi pal ~200 requests chal rahi hain, aur thread-per-request mein 200 threads. Latency badhi (downstream slow), to threads ki zaroorat bhi utni hi badhti hai: isi wajah se slow dependency poora thread pool kha jaati hai.</p><p>Integer ceil trick <code>(x + 999) / 1000</code> floating point ki galti se bachata hai.</p>"
    },
    {
      type: "think",
      id: "think-vt",
      q: "Interview question: <b>\"Hum Spring Boot service ko Java 21 virtual threads pe le ja rahe hain. Kya kya dhyaan rakhoge? Kya ab sab kuch fast ho jaayega?\"</b>",
      rubric: [
        { point: "Fayda sirf <b>I/O bound</b> kaam mein (throughput badhta hai), CPU bound / latency nahi", keys: ["i/o", "io bound", "blocking", "cpu bound", "throughput", "latency nahi"], weight: 2 },
        { point: "<b>Pinning</b>: Java 21 mein synchronized + blocking; ReentrantLock / JDK 24+; JFR se detect", keys: ["pinning", "pin", "synchronized", "reentrantlock", "jfr", "tracepinned"], weight: 2 },
        { point: "Downstream limits: <b>DB connection pool</b>, remote rate limits; Semaphore se limit", keys: ["connection pool", "hikari", "db pool", "semaphore", "downstream", "rate limit"], weight: 2 },
        { point: "Virtual threads ko <b>pool mat karo</b>; per-task executor", keys: ["pool mat", "pool nahi", "per task", "pertask", "no pooling", "sasta"] },
        { point: "ThreadLocal heavy usage se memory; ScopedValue", keys: ["threadlocal", "scopedvalue", "scoped value", "memory"] }
      ],
      answer: `<p><b>Nahi, sab fast nahi hoga.</b> Virtual threads <i>throughput</i> badhate hain jab requests wait (I/O) mein time bitaati hain. Ek request ki latency ya CPU-heavy kaam waisa hi rehta hai.</p>
        <ul>
          <li><b>Enable:</b> <code>spring.threads.virtual.enabled=true</code> (Spring Boot 3.2+).</li>
          <li><b>Pinning check:</b> Java 21 pe <code>synchronized</code> ke andar blocking I/O (purane JDBC drivers, libraries) carrier ko pin karta hai. JFR <code>jdk.VirtualThreadPinned</code> dekho, hot paths mein <code>ReentrantLock</code>, ya JDK 24+ pe jao (JEP 491).</li>
          <li><b>Downstream:</b> ab 10,000 requests ek saath DB tak pahunch sakti hain. Hikari pool size, remote API limits: Semaphore / bulkhead lagao, warna DB gir jaayega.</li>
          <li><b>Pooling hatao:</b> custom fixed pools jo sirf concurrency limit ke liye the, unki jagah Semaphore.</li>
          <li><b>ThreadLocal:</b> har thread pe bade cached objects mat rakho.</li>
          <li>Load test karke compare karo (p99 latency, throughput, memory).</li>
        </ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Ek line mein: <i>\"Virtual threads cheap, JVM-scheduled threads hain jo blocking I/O pe carrier chhod dete hain, isliye blocking style code se reactive jaisa throughput milta hai.\"</i> Uske baad khud hi do caveats bolo: CPU-bound pe fayda nahi, aur pinning (Java 21 synchronized, JDK 24 mein fix). Ye bolne se lagta hai aapne production mein socha hai."
    }
  ],
  references: [
    { title: "JEP 444: Virtual Threads", by: "OpenJDK", url: "https://openjdk.org/jeps/444", type: "docs" },
    { title: "JEP 491: Synchronize Virtual Threads without Pinning", by: "OpenJDK", url: "https://openjdk.org/jeps/491", type: "docs" },
    { title: "dev.java: Learn Java", by: "Oracle", url: "https://dev.java/learn/", type: "docs" },
    { title: "Oracle Java Tutorial: Concurrency", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/", type: "docs" }
  ]
});
