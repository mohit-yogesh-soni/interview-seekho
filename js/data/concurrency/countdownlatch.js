// CountDownLatch
registerLesson("concurrency", "countdownlatch", {
  why: "\"Main thread ko N kaam poore hone tak kaise rokoge?\" ka seedha jawab CountDownLatch hai. Interview mein iske saath poochte hain: ye reusable hai kya, CyclicBarrier se kya farak hai, aur countDown() finally mein kyun.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: service tabhi traffic le jab sab ready ho</h2>
        <p>Order service start ho rahi hai. Traffic lene se pehle teen cheezein ready honi chahiye:</p>
        <ul>
          <li>DB connection pool</li>
          <li>Redis cache warm-up (popular restaurants load)</li>
          <li>Feature-flag config download</li>
        </ul>
        <p>Teeno alag threads mein parallel chalte hain. Main thread ko rukna hai jab tak <b>teeno</b> khatam na hon. <code>join()</code> tab kaam karta hai jab aapke paas threads ke reference hon. Par agar kaam pool mein chal raha hai, ya ek thread do kaam karta hai, ya aapko "kaam khatam" ka signal chahiye (thread khatam nahi), to <b>CountDownLatch</b>.</p>
        <p>Latch ek counter hai jo N se shuru hota hai:</p>
        <ul>
          <li><code>countDown()</code>: counter 1 kam (0 pe ruk jaata hai, negative nahi hota)</li>
          <li><code>await()</code>: counter 0 hone tak wait</li>
          <li><code>await(timeout, unit)</code>: max itna wait; <code>true</code> agar 0 hua, <code>false</code> agar time khatam</li>
          <li><code>getCount()</code>: abhi kitna bacha</li>
        </ul>
        <p><b>One-shot:</b> official docs ke hisaab se count reset nahi ho sakta. 0 ke baad latch hamesha khula rehta hai: har <code>await()</code> turant return karta hai. Dobara chahiye to naya latch banao, ya CyclicBarrier lo.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: latch(3), main await karta hai",
      steps: [
        {
          title: "Step 1: count = 3, main await() pe WAITING",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>main</th><td class="wait">await() count=3</td><td></td><td></td><td></td></tr>
            <tr><th>db-init</th><td class="run">pool bana raha</td><td></td><td></td><td></td></tr>
            <tr><th>cache-init</th><td class="run">warm-up</td><td></td><td></td><td></td></tr>
            <tr><th>config-init</th><td class="run">download</td><td></td><td></td><td></td></tr>
          </table>`
        },
        {
          title: "Step 2: config pehle khatam: countDown → 2",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>main</th><td class="wait">await() count=3</td><td class="wait">count=2</td><td></td><td></td></tr>
            <tr><th>db-init</th><td class="run">pool bana raha</td><td class="run">...</td><td></td><td></td></tr>
            <tr><th>cache-init</th><td class="run">warm-up</td><td class="run">...</td><td></td><td></td></tr>
            <tr><th>config-init</th><td class="run">download</td><td class="lock">countDown() ✅</td><td></td><td></td></tr>
          </table><p>countDown karne wala thread rukta nahi. Wo aage apna kaam karta hai ya khatam ho jaata hai.</p>`
        },
        {
          title: "Step 3: db aur cache khatam: count 0, main jagta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>main</th><td class="wait">await() count=3</td><td class="wait">count=2</td><td class="wait">count=1</td><td class="run">count=0 → traffic lo 🚀</td></tr>
            <tr><th>db-init</th><td class="run">pool bana raha</td><td class="run">...</td><td class="lock">countDown() ✅</td><td></td></tr>
            <tr><th>cache-init</th><td class="run">warm-up</td><td class="run">...</td><td class="run">...</td><td class="lock">countDown() ✅</td></tr>
            <tr><th>config-init</th><td class="run">download</td><td class="lock">countDown() ✅</td><td></td><td></td></tr>
          </table><p>Order koi bhi ho, main tabhi aage badhta hai jab teeno ne signal diya. Memory guarantee: countDown se pehle ka kaam, await ke baad wale code ko dikhta hai (happens-before).</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Startup: 3 init tasks pool pe, main await(timeout) se rukta hai",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> initMs = new LinkedHashMap<>();
        initMs.put("db-pool", 60);
        initMs.put("cache-warmup", 40);
        initMs.put("feature-flags", 20);

        CountDownLatch ready = new CountDownLatch(initMs.size());
        Map<String, String> status = new ConcurrentHashMap<>();
        ExecutorService pool = Executors.newFixedThreadPool(3);

        for (Map.Entry<String, Integer> e : initMs.entrySet()) {
            pool.submit(() -> {
                try {
                    Thread.sleep(e.getValue());         // fake init kaam
                    status.put(e.getKey(), "UP");
                } catch (InterruptedException ex) {
                    status.put(e.getKey(), "INTERRUPTED");
                } finally {
                    ready.countDown();                  // hamesha, fail ho tab bhi
                }
            });
        }

        System.out.println("main: wait kar raha hoon, count = " + ready.getCount());
        boolean allUp = ready.await(2, TimeUnit.SECONDS);
        System.out.println("main: sab ready? " + allUp + ", count = " + ready.getCount());
        System.out.println("status: " + new TreeMap<>(status));
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
    }
}`,
      note: "Pool ke threads khatam nahi hote (reuse), isliye yahan <code>join()</code> kaam hi nahi karta. Latch \"kaam khatam\" gin raha hai, threads nahi."
    },
    {
      type: "code",
      title: "Starting gun: 5 workers ek saath shuru (startSignal), main sabke khatam hone ka wait (doneSignal). Phir: latch reusable nahi",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        int n = 5;
        CountDownLatch startSignal = new CountDownLatch(1);   // 1 = ek gate
        CountDownLatch doneSignal = new CountDownLatch(n);
        AtomicInteger hits = new AtomicInteger();

        for (int i = 0; i < n; i++) {
            Thread t = new Thread(() -> {
                try {
                    startSignal.await();                       // gate khulne tak ruko
                    for (int k = 0; k < 1000; k++) hits.incrementAndGet();  // load test ka request
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneSignal.countDown();
                }
            });
            t.start();
        }

        System.out.println("sab workers taiyaar, gate band. hits = " + hits.get());
        startSignal.countDown();                               // 🔫 sab ek saath
        doneSignal.await();
        System.out.println("sab khatam. hits = " + hits.get());

        // One-shot: count 0 ke baad kuch reset nahi hota
        doneSignal.countDown();                                // no-op
        long t0 = System.nanoTime();
        doneSignal.await();                                    // turant return
        System.out.println("dobara countDown ke baad count = " + doneSignal.getCount()
                + ", dobara await turant? " + ((System.nanoTime() - t0) < 50_000_000L));
    }
}`,
      note: "Ye pattern concurrency bugs ke tests mein kaam aata hai: saare threads ek hi pal pe shuru hon to race zyada dikhti hai. Browser JVM mein threads ek CPU pe chalte hain, isliye \"ek saath\" asli parallel nahi hota; result (5000) phir bhi fixed hai kyunki AtomicInteger hai."
    },
    {
      type: "code",
      title: "Ek init kabhi khatam nahi hota: await(timeout) false deta hai, service degraded mode mein",
      code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch neverOpens = new CountDownLatch(1);

        Thread db = new Thread(ready::countDown, "db-init");          // turant ready
        Thread search = new Thread(() -> {                            // search cluster hang
            try { neverOpens.await(); ready.countDown(); } catch (InterruptedException e) { }
        }, "search-init");
        search.setDaemon(true);                                       // safety: program exit kar sake
        db.start();
        search.start();

        boolean ok = ready.await(200, TimeUnit.MILLISECONDS);
        if (ok) System.out.println("full mode");
        else System.out.println("200ms mein ready nahi (count = " + ready.getCount() + "): search ke bina degraded mode, alert bhejo");
        db.join();
    }
}`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b><ul><li><code>countDown()</code> <b>finally</b> mein nahi: task ne exception phenka, count kabhi 0 nahi hua, main hamesha ke liye atka.</li><li>Bina timeout ka <code>await()</code> production code mein: ek dependency hang hui to poori startup hang. <code>await(timeout)</code> ka boolean check karo.</li><li>Latch ko loop mein reuse karna: doosre round mein await turant return karega, kyunki count pehle se 0 hai.</li><li>Count galat: N tasks ke liye latch(N+1) banaya to kabhi nahi khulega.</li></ul>"
    },
    {
      type: "quiz",
      q: "<code>new CountDownLatch(3)</code>. Do threads hain, dono do-do baar <code>countDown()</code> karte hain (total 4 calls). Main <code>await()</code> pe hai. Kya hoga?",
      options: [
        "Main hamesha wait karega, kyunki sirf 2 threads hain aur count 3 hai",
        "Teesri countDown() pe main jaag jaayega; chauthi call kuch nahi karti, count 0 hi rehta hai",
        "Chauthi call pe IllegalStateException",
        "Count -1 ho jaayega aur latch reset ho jaayega"
      ],
      answer: 1,
      why: "Latch calls ginta hai, threads nahi. Ek thread kai baar countDown kar sakta hai. 0 ke baad countDown no-op hai; count negative nahi hota aur reset bhi nahi hota."
    },
    {
      type: "quiz",
      q: "Har minute ek batch job 4 parallel chunks process karta hai, aur main ko har batch ke chunks ka wait karna hai. Aapne ek hi <code>CountDownLatch(4)</code> field bana ke har batch mein use kiya. Doosre batch mein kya hoga?",
      options: [
        "Sahi chalega, latch har await ke baad apne aap 4 pe reset hota hai",
        "Doosre batch mein main ka await() turant return karega (count pehle se 0), chunks poore hone se pehle hi main aage badh jaayega",
        "Doosre batch mein deadlock",
        "Compile error"
      ],
      answer: 1,
      why: "CountDownLatch one-shot hai. Har batch ke liye <code>new CountDownLatch(4)</code> banao, ya reusable <code>CyclicBarrier</code>/<code>Phaser</code> use karo."
    },
    {
      type: "exercise",
      id: "ex-warmup-latch",
      title: "Startup warm-up: timeout ke saath sab tasks ka wait",
      level: "Medium",
      task: `<p><code>warmUp(tasks, timeoutMs)</code>:</p>
        <ul>
          <li>Har task ko <b>alag thread</b> mein chalao (sab parallel). Threads daemon rakho.</li>
          <li>Max <code>timeoutMs</code> tak wait karo ki sab tasks khatam hon.</li>
          <li>Jo task <b>exception</b> phenke wo "ready" nahi gina jaata, par uski wajah se wait atakna nahi chahiye.</li>
          <li>Return: sab tasks timeout ke andar successfully khatam hue to <code>"READY k/n"</code>, warna <code>"DEGRADED k/n"</code>. <code>k</code> = successful tasks, <code>n</code> = total.</li>
        </ul>
        <p>Harness kuch tasks deta hai jo fail hote hain, kuch jo kabhi khatam nahi hote (test ke end mein harness unhe chhod deta hai). Ek test ye bhi check karta hai ki fail hone wala task <b>poore timeout tak wait na karwaye</b>.</p>`,
      examples: "3 tez tasks, timeout 1000 → <code>\"READY 3/3\"</code><br>2 tez + 1 jo hang, timeout 200 → ~200ms baad <code>\"DEGRADED 2/3\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

class Solution {
    String warmUp(List<Runnable> tasks, long timeoutMs) throws InterruptedException {
        // TODO: har task alag thread mein, CountDownLatch se wait
        return "READY " + tasks.size() + "/" + tasks.size();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static final CountDownLatch release = new CountDownLatch(1);   // hang tasks ko end mein chhodne ke liye

    static Runnable quick(AtomicInteger ran) { return ran::incrementAndGet; }
    static Runnable failing() { return () -> { throw new IllegalStateException("init fail"); }; }
    static Runnable hanging() {
        return () -> { try { release.await(); } catch (InterruptedException e) { } };
    }

    static String call(List<Runnable> tasks, long timeout) {
        try { return new Solution().warmUp(tasks, timeout); }
        catch (InterruptedException e) { return "interrupted"; }
    }

    public static void main(String[] args) {
        Check.eq("3 tez tasks: [result, kitne chale]", List.of("READY 3/3", 3), () -> {
            AtomicInteger ran = new AtomicInteger();
            String r = call(List.of(quick(ran), quick(ran), quick(ran)), 1000);
            return List.of(r, ran.get());
        });
        Check.eq("2 tez + 1 hang, timeout 200", "DEGRADED 2/3", () -> {
            AtomicInteger ran = new AtomicInteger();
            return call(List.of(quick(ran), hanging(), quick(ran)), 200);
        });
        Check.hiddenFromHere();
        Check.eq("1 fail + 2 tez: [result, timeout tak ataka nahi]", List.of("DEGRADED 2/3", true), () -> {
            AtomicInteger ran = new AtomicInteger();
            long t0 = System.nanoTime();
            String r = call(List.of(quick(ran), failing(), quick(ran)), 2500);
            long ms = (System.nanoTime() - t0) / 1_000_000;
            return List.of(r, ms < 1200);
        });
        Check.eq("khaali list", "READY 0/0", () -> call(List.of(), 100));
        Check.eq("40 tasks parallel (har ek dusron ka wait karta hai): [result, kitne chale]", List.of("READY 40/40", 40), () -> {
            CountDownLatch allStarted = new CountDownLatch(40);
            AtomicInteger ran = new AtomicInteger();
            List<Runnable> ts = new ArrayList<>();
            for (int i = 0; i < 40; i++) ts.add(() -> {
                allStarted.countDown();
                try { if (!allStarted.await(1500, TimeUnit.MILLISECONDS)) throw new IllegalStateException("sequential?"); }
                catch (InterruptedException e) { throw new IllegalStateException(e); }
                ran.incrementAndGet();
            });
            String r = call(ts, 2500);
            return List.of(r, ran.get());
        });
        Check.eq("fail + hang dono, timeout 150", "DEGRADED 1/3", () -> {
            AtomicInteger ran = new AtomicInteger();
            return call(List.of(failing(), quick(ran), hanging()), 150);
        });
        release.countDown();
    }
}`,
      hints: [
        "<code>CountDownLatch done = new CountDownLatch(tasks.size());</code> aur success ginne ke liye <code>AtomicInteger ok</code>.",
        "Har thread mein: <code>try { task.run(); ok.incrementAndGet(); } catch (RuntimeException e) { } finally { done.countDown(); }</code>",
        "<code>boolean all = done.await(timeoutMs, TimeUnit.MILLISECONDS);</code> phir <code>(all &amp;&amp; ok.get() == n ? \"READY \" : \"DEGRADED \") + ok.get() + \"/\" + n</code>"
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

class Solution {
    String warmUp(List<Runnable> tasks, long timeoutMs) throws InterruptedException {
        int n = tasks.size();
        CountDownLatch done = new CountDownLatch(n);
        AtomicInteger ok = new AtomicInteger();
        for (Runnable task : tasks) {
            Thread t = new Thread(() -> {
                try {
                    task.run();
                    ok.incrementAndGet();
                } catch (RuntimeException e) {
                    // fail hua: ready nahi gina, par signal zaroor dena hai
                } finally {
                    done.countDown();
                }
            });
            t.setDaemon(true);
            t.start();
        }
        boolean all = done.await(timeoutMs, TimeUnit.MILLISECONDS);
        int k = ok.get();
        return (all && k == n ? "READY " : "DEGRADED ") + k + "/" + n;
    }
}`,
      explain: "<p>Latch \"khatam\" ginta hai (success ya fail dono), aur AtomicInteger \"success\" ginta hai. <code>countDown()</code> finally mein hai, isliye fail hone wala task bhi signal deta hai aur main poore timeout tak nahi atakta. Hang hone wala task kabhi countDown nahi karta, isliye <code>await(timeout)</code> false deta hai.</p><p><code>latch(0)</code> pe await turant true deta hai, isliye khaali list bina special case ke \"READY 0/0\". Time: O(n) threads start, phir max timeout tak wait.</p>"
    },
    {
      type: "think",
      id: "think-latch-vs",
      q: "Interview question: <b>\"N threads ka kaam khatam hone ka wait karna hai. join(), CountDownLatch, aur ExecutorService.invokeAll / CompletableFuture.allOf mein se kya chunoge, aur kyun?\"</b>",
      rubric: [
        { point: "<b>join()</b> sirf tab jab thread references hon aur thread khatam hona hi signal ho; pool ke saath kaam nahi karta", keys: ["join", "thread reference", "pool ke saath", "thread khatam", "reuse"], weight: 2 },
        { point: "<b>CountDownLatch</b>: events ginta hai, threads nahi; kahin se bhi countDown; await(timeout)", keys: ["countdown", "latch", "event", "await(timeout", "timeout", "kahin se bhi"], weight: 2 },
        { point: "Latch <b>one-shot</b> hai, reset nahi; repeat ke liye CyclicBarrier/Phaser", keys: ["one-shot", "one shot", "reset", "reusable", "cyclicbarrier", "phaser"], weight: 2 },
        { point: "Results bhi chahiye to <b>invokeAll / allOf</b> (futures se value aur exception)", keys: ["invokeall", "allof", "future", "result", "completablefuture"] },
        { point: "countDown <b>finally</b> mein, warna exception pe hang", keys: ["finally", "exception", "hang"] }
      ],
      answer: `<ul>
          <li><b>join():</b> simplest, jab aapne khud threads banaye hain aur "thread khatam" hi signal hai. Thread pool ke saath bekaar, kyunki pool threads khatam nahi hote.</li>
          <li><b>CountDownLatch:</b> N <b>events</b> ka wait. Koi bhi thread countDown kar sakta hai (ek thread kai baar bhi), pool tasks ke saath kaam karta hai, <code>await(timeout)</code> deta hai, aur ek "start gate" (latch(1)) bhi ban sakta hai. One-shot hai: count reset nahi hota.</li>
          <li><b>invokeAll / CompletableFuture.allOf:</b> jab har task ka <b>result ya exception</b> bhi chahiye. Aaj kal naye code mein aksar yahi behtar hai.</li>
          <li><b>Repeat rounds</b> (har round mein sab threads mile): CyclicBarrier ya Phaser.</li>
        </ul>
        <p>Latch ke saath hamesha: <code>countDown()</code> finally mein, aur production mein <code>await(timeout)</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Latch ka use case do lines mein bolo: <i>\"Ek ya zyada threads ko N events tak rokna, jaise startup mein saari dependencies ready hon. Ye one-shot hai.\"</i> Phir khud hi follow-up de do: <i>\"Repeat chahiye to CyclicBarrier\"</i>. Interviewer ka agla sawaal aksar yahi hota hai."
    }
  ],
  references: [
    { title: "CountDownLatch (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CountDownLatch.html", type: "docs" },
    { title: "Oracle Java Tutorial: Concurrency", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.5: Synchronizers)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
