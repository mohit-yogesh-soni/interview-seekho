// Executors aur Thread Pools
registerLesson("concurrency", "executors", {
  why: "Production Java mein koi seedha new Thread() nahi karta; sab kuch thread pools pe chalta hai. Interview mein ThreadPoolExecutor ke 7 parameters, task kab queue mein jaata hai aur kab reject hota hai, Executors.newFixedThreadPool kyun risky hai, aur pool size kaise chunoge: ye sab poocha jaata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Thread pool kyun?</h2>
        <p>Maan lo har HTTP request pe <code>new Thread()</code>:</p>
        <ul>
          <li><b>Cost:</b> har platform thread ek OS thread hai, apne stack (aksar ~1MB reserve, OS/JVM settings pe depend) ke saath. Banana aur khatam karna sasta nahi.</li>
          <li><b>No limit:</b> traffic spike pe 10,000 threads: memory khatam (<code>OutOfMemoryError: unable to create native thread</code>), ya context switching mein CPU barbaad.</li>
          <li><b>No control:</b> kitne tasks chal rahe, kitne line mein, shutdown kaise: kuch pata nahi.</li>
        </ul>
        <p><b>Thread pool</b> = kuch fixed worker threads + ek <b>task queue</b>. Aap task submit karte ho, free worker queue se uthata hai. Threads reuse hote hain. Java mein: <code>ExecutorService</code>.</p>
        <pre class="diagram">
 submit(task) --&gt; [ queue: t5 t6 t7 ... ] --&gt; worker-1 (t1 chala raha)
                                           --&gt; worker-2 (t2)
                                           --&gt; worker-3 (t3)</pre>
        <h3>Executors factory methods (andar kya hai)</h3>
        <table>
          <tr><th>Method</th><th>Andar</th><th>Risk</th></tr>
          <tr><td><code>newFixedThreadPool(n)</code></td><td>core = max = n, <b>unbounded</b> <code>LinkedBlockingQueue</code></td><td>Tasks aate rahe aur workers slow hon to queue badhti rahegi → memory khatam</td></tr>
          <tr><td><code>newCachedThreadPool()</code></td><td>core 0, max <code>Integer.MAX_VALUE</code>, <code>SynchronousQueue</code> (koi buffer nahi), idle thread 60s baad khatam</td><td><b>Unbounded threads</b>: spike pe hazaaron threads</td></tr>
          <tr><td><code>newSingleThreadExecutor()</code></td><td>1 thread, unbounded queue; tasks order mein chalte hain</td><td>Unbounded queue</td></tr>
          <tr><td><code>newScheduledThreadPool(n)</code></td><td><code>ScheduledThreadPoolExecutor</code>: delay/periodic tasks</td><td>Delayed queue bhi unbounded</td></tr>
        </table>
        <p>Isliye production mein aksar seedha <code>new ThreadPoolExecutor(...)</code> banate hain, <b>bounded queue</b> aur sahi rejection policy ke saath.</p>`
    },
    {
      type: "code",
      title: "Fixed pool: 3 workers, 6 tasks. Futures se results order mein, phir shutdown + awaitTermination",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        List<Future<String>> futures = new ArrayList<>();
        for (int orderId = 101; orderId <= 106; orderId++) {
            final int id = orderId;
            futures.add(pool.submit(() -> {          // Callable: value return karta hai
                Thread.sleep(20);                    // fake payment API call
                return "order " + id + " paid";
            }));
        }

        for (Future<String> f : futures) System.out.println(f.get()); // submit ke order mein
        pool.shutdown();                                              // naye tasks band, purane poore
        boolean done = pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("Pool band hua? " + done + ", isTerminated = " + pool.isTerminated());
    }
}`,
      note: "Kaunsa worker kaunsa order chalata hai ye har baar alag ho sakta hai, isliye thread naam print nahi kiye. Futures ki list submit ke order mein hai, to output fixed hai. <code>shutdown()</code> bhool gaye to non-daemon workers JVM ko exit nahi karne denge."
    },
    {
      type: "text",
      html: `
        <h2>ThreadPoolExecutor ke parameters</h2>
        <pre class="code-static">new ThreadPoolExecutor(
    corePoolSize,      // itne threads hamesha (idle bhi)
    maximumPoolSize,   // queue bhar jaaye to max itne tak badhao
    keepAliveTime,     // core se extra threads itni der idle rahein to khatam
    unit,
    workQueue,         // tasks ki line: bounded (ArrayBlockingQueue) ya unbounded
    threadFactory,     // threads ka naam, daemon, priority
    handler            // queue full + max threads busy = kya karein (rejection policy)
);</pre>
        <table>
          <tr><th>Param</th><th>Payment service example</th><th>Dhyaan</th></tr>
          <tr><td>corePoolSize</td><td>8</td><td>Itne threads warm rehte hain</td></tr>
          <tr><td>maximumPoolSize</td><td>16</td><td><b>Sirf queue full hone ke baad</b> kaam aata hai. Unbounded queue ke saath max kabhi use hi nahi hota</td></tr>
          <tr><td>keepAliveTime</td><td>30s</td><td><code>allowCoreThreadTimeOut(true)</code> se core pe bhi lagta hai</td></tr>
          <tr><td>workQueue</td><td><code>new ArrayBlockingQueue&lt;&gt;(100)</code></td><td>Bounded = backpressure, memory safe</td></tr>
          <tr><td>threadFactory</td><td>naam <code>pay-worker-1</code>...</td><td>Thread dump mein naam se pata chalta hai kaunsa pool</td></tr>
          <tr><td>handler</td><td><code>CallerRunsPolicy</code></td><td>Default <code>AbortPolicy</code></td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "Task aaya to kya hota hai? core=2, max=4, queue capacity=3",
      steps: [
        {
          title: "Task 1-2: core threads se kam hain → naya thread",
          html: `<table class="lanes">
            <tr><th>Workers</th><td class="run">W1: t1</td><td class="run">W2: t2</td><td></td><td></td></tr>
            <tr><th>Queue</th><td>[ ]</td><td></td><td></td><td></td></tr>
          </table><p>Running threads &lt; corePoolSize: queue mein daalne ki jagah naya worker banao.</p>`
        },
        {
          title: "Task 3-5: core bhara → queue mein",
          html: `<table class="lanes">
            <tr><th>Workers</th><td class="run">W1: t1</td><td class="run">W2: t2</td><td></td><td></td></tr>
            <tr><th>Queue</th><td class="wait">t3</td><td class="wait">t4</td><td class="wait">t5</td><td>(full)</td></tr>
          </table><p>Dhyaan do: abhi bhi sirf 2 threads. Queue pehle bharti hai, threads baad mein badhte hain. Ye sabse common misunderstanding hai.</p>`
        },
        {
          title: "Task 6-7: queue full → max tak naye threads",
          html: `<table class="lanes">
            <tr><th>Workers</th><td class="run">W1: t1</td><td class="run">W2: t2</td><td class="run">W3: t6</td><td class="run">W4: t7</td></tr>
            <tr><th>Queue</th><td class="wait">t3</td><td class="wait">t4</td><td class="wait">t5</td><td>(full)</td></tr>
          </table><p>Naye threads queue wale tasks nahi, <b>naya aaya task</b> (t6, t7) chalate hain.</p>`
        },
        {
          title: "Task 8: queue full + max threads busy → REJECT",
          html: `<table class="lanes">
            <tr><th>Workers</th><td class="run">W1: t1</td><td class="run">W2: t2</td><td class="run">W3: t6</td><td class="run">W4: t7</td></tr>
            <tr><th>Queue</th><td class="wait">t3</td><td class="wait">t4</td><td class="wait">t5</td><td>(full)</td></tr>
            <tr><th>t8</th><td class="block" colspan="4">RejectedExecutionHandler (default AbortPolicy: exception)</td></tr>
          </table>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Rejection policies</h2>
        <table>
          <tr><th>Policy</th><th>Kya karti hai</th><th>Kab theek</th></tr>
          <tr><td><code>AbortPolicy</code> (default)</td><td><code>RejectedExecutionException</code> throw</td><td>Caller ko pata chalna chahiye (HTTP 503 / retry later)</td></tr>
          <tr><td><code>CallerRunsPolicy</code></td><td>Task <b>submit karne wale thread</b> pe hi chala do</td><td>Backpressure: caller khud busy hoga to naye tasks dena dheema karega. Task kho nahi jaata (jab tak pool shutdown na ho)</td></tr>
          <tr><td><code>DiscardPolicy</code></td><td>Chup chaap phenk do</td><td>Sirf jab task ka khona chalta hai (best-effort metrics)</td></tr>
          <tr><td><code>DiscardOldestPolicy</code></td><td>Queue ka sabse purana task phenko, naye ko try karo</td><td>Latest data zyada important (live score updates)</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Rejection dekho: core=1, max=1, queue=1. Teesra task? (AbortPolicy vs CallerRunsPolicy)",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static String tryThree(RejectedExecutionHandler policy) throws InterruptedException {
        CountDownLatch gate = new CountDownLatch(1);
        ThreadPoolExecutor pool = new ThreadPoolExecutor(1, 1, 0, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1), policy);
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        Runnable slow = () -> { try { gate.await(); } catch (InterruptedException e) { } };
        String result;
        try {
            pool.execute(slow);   // worker isko chala raha hai (gate band)
            pool.execute(slow);   // queue mein
            pool.execute(() -> log.add("task3 chala thread: " + Thread.currentThread().getName()));
            result = log.isEmpty() ? "task3 kahin nahi chala" : log.get(0);
        } catch (RejectedExecutionException e) {
            result = "RejectedExecutionException";
        }
        gate.countDown();
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        return result;
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("AbortPolicy:      " + tryThree(new ThreadPoolExecutor.AbortPolicy()));
        System.out.println("CallerRunsPolicy: " + tryThree(new ThreadPoolExecutor.CallerRunsPolicy()));
        System.out.println("DiscardPolicy:    " + tryThree(new ThreadPoolExecutor.DiscardPolicy()));
    }
}`,
      note: "CallerRunsPolicy mein task3 <code>main</code> thread pe chala, yaani submit karne wala khud kaam mein lag gaya. Isse naturally submit rate kam hota hai."
    },
    {
      type: "text",
      html: `
        <h2>shutdown vs shutdownNow</h2>
        <table>
          <tr><th></th><th><code>shutdown()</code></th><th><code>shutdownNow()</code></th><th><code>awaitTermination(t)</code></th></tr>
          <tr><td>Naye tasks</td><td>Reject</td><td>Reject</td><td>-</td></tr>
          <tr><td>Queue wale tasks</td><td>Chalenge</td><td><b>Nahi chalenge</b>, list mein wapas milte hain</td><td>-</td></tr>
          <tr><td>Chal rahe tasks</td><td>Poore honge</td><td><b>interrupt()</b> bheja jaata hai (task respect kare tabhi rukega)</td><td>-</td></tr>
          <tr><td>Block karta hai?</td><td>Nahi, turant return</td><td>Nahi, turant return</td><td>Haan: terminate hone ya timeout tak</td></tr>
        </table>
        <p>Standard pattern (graceful shutdown):</p>
        <pre class="code-static">pool.shutdown();
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
    pool.shutdownNow();                       // ab zabardasti
    pool.awaitTermination(5, TimeUnit.SECONDS);
}</pre>`
    },
    {
      type: "code",
      title: "shutdown() purane tasks poore karta hai; shutdownNow() queue lauta deta hai aur interrupt karta hai",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // 1. shutdown: graceful
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        ExecutorService a = Executors.newSingleThreadExecutor();
        for (int i = 1; i <= 3; i++) {
            final int n = i;
            a.submit(() -> log.add("email " + n + " bheja"));
        }
        a.shutdown();
        String late;
        try {
            a.submit(() -> log.add("late email"));
            late = "accept hua";
        } catch (RejectedExecutionException e) {
            late = "RejectedExecutionException";
        }
        a.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("shutdown ke baad: " + log + ", naya submit: " + late);

        // 2. shutdownNow: zabardasti
        List<String> log2 = Collections.synchronizedList(new ArrayList<>());
        ExecutorService b = Executors.newSingleThreadExecutor();
        CountDownLatch started = new CountDownLatch(1);
        b.submit(() -> {
            started.countDown();
            try {
                Thread.sleep(5000);
                log2.add("report poori");
            } catch (InterruptedException e) {
                log2.add("report task ko interrupt mila, ruk gaya");
            }
        });
        b.submit(() -> log2.add("task 2"));
        b.submit(() -> log2.add("task 3"));
        started.await();
        List<Runnable> neverRan = b.shutdownNow();
        b.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("shutdownNow ke baad: " + log2 + ", kabhi na chale tasks: " + neverRan.size());
    }
}`
    },
    {
      type: "code",
      title: "ScheduledExecutorService: har 50ms heartbeat, 3 baar ke baad band",
      code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        AtomicInteger beats = new AtomicInteger();
        CountDownLatch three = new CountDownLatch(3);

        ScheduledFuture<?> handle = scheduler.scheduleAtFixedRate(() -> {
            beats.incrementAndGet();
            three.countDown();
        }, 0, 50, TimeUnit.MILLISECONDS);

        boolean ok = three.await(2, TimeUnit.SECONDS);
        handle.cancel(false);
        scheduler.shutdown();
        scheduler.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("3 heartbeats hue? " + ok + ", band? " + scheduler.isTerminated());
    }
}`,
      note: "<code>scheduleAtFixedRate</code>: start time se fixed interval. <code>scheduleWithFixedDelay</code>: pichla run khatam hone ke baad delay. Periodic task mein exception aaya to aage ke saare runs chup chaap band ho jaate hain, isliye andar try/catch rakho."
    },
    {
      type: "text",
      html: `
        <h2>Pool size kaise chunein</h2>
        <table>
          <tr><th>Workload</th><th>Rule of thumb</th><th>Example (8 cores)</th></tr>
          <tr><td>CPU bound</td><td>≈ cores (ya cores + 1)</td><td>8-9 threads</td></tr>
          <tr><td>I/O bound</td><td>≈ cores × (1 + wait time / compute time)</td><td>Har request 90ms DB wait + 10ms CPU → 8 × (1 + 9) = 80</td></tr>
        </table>
        <p>Formula Brian Goetz ki <i>Java Concurrency in Practice</i> wali soch pe based hai. Ye shuruaati andaza hai: asli number load test se tune karo. Aur yaad rakho, downstream ki limit bhi hai: DB connection pool 20 ka hai to 200 threads DB pe sirf line lagayenge.</p>
        <p><b>Bulkhead:</b> alag kaam ke liye alag pools (payment, email, reports). Ek slow dependency poore app ke threads nahi kha paayegi.</p>`
    },
    {
      type: "quiz",
      q: "<code>Executors.newFixedThreadPool(10)</code> use kiya. Ek downstream API slow ho gayi, har task 10 second le raha hai, aur 1000 tasks/second aa rahe hain. Kya hoga?",
      options: [
        "Pool apne aap 1000 threads tak badh jaayega",
        "Naye tasks RejectedExecutionException denge",
        "Queue unbounded hai: tasks jama hote rahenge, latency badhti jaayegi aur aakhir mein OutOfMemoryError",
        "Purane tasks apne aap cancel ho jaayenge"
      ],
      answer: 2,
      why: "Fixed pool ka <code>LinkedBlockingQueue</code> unbounded hai, isliye na reject hota hai na max threads badhte hain. Tasks memory mein jama hote rahte hain. Fix: bounded queue + rejection policy + downstream calls pe timeout."
    },
    {
      type: "pick",
      id: "pick-pool-prod",
      q: "Production thread pool ke liye kaunse <b>achhe practices</b> hain?",
      options: [
        { text: "Bounded queue (ArrayBlockingQueue) + soch samajh ke rejection policy", correct: true, why: "Memory safe aur overload pe clear behaviour." },
        { text: "ThreadFactory se meaningful naam (<code>pay-worker-3</code>)", correct: true, why: "Thread dump/logs mein turant pata chalta hai kaunsa pool." },
        { text: "Har request ke liye naya <code>Executors.newFixedThreadPool()</code> banana", correct: false, why: "Pool banana mehenga hai, aur shutdown bhoole to threads leak. Pool ek baar banao, share karo." },
        { text: "Graceful shutdown: shutdown → awaitTermination → shutdownNow", correct: true, why: "In-flight kaam poora, phir zabardasti." },
        { text: "Har kaam ke liye <code>newCachedThreadPool()</code>, kyunki wo khud adjust hota hai", correct: false, why: "Max threads unbounded. Spike pe hazaaron threads ban sakte hain." },
        { text: "Pool size, queue size aur rejected count ko metrics mein expose karna", correct: true, why: "Saturation production mein dikhni chahiye (getActiveCount, getQueue().size())." }
      ]
    },
    {
      type: "exercise",
      id: "ex-pool-config",
      title: "Payment service ka ThreadPoolExecutor banao",
      level: "Medium",
      task: `<p><code>createPool()</code> ek <code>ThreadPoolExecutor</code> return kare jo:</p>
        <ul>
          <li>core <b>2</b> threads, max <b>4</b> threads, keepAlive <b>30 seconds</b></li>
          <li><b>bounded</b> queue, capacity <b>10</b></li>
          <li>queue full + 4 threads busy pe task <b>caller thread pe chale</b> (backpressure, task kho na jaaye)</li>
          <li>threads ke naam <code>pay-worker-1</code>, <code>pay-worker-2</code>, ...</li>
        </ul>
        <p>Starter <code>Executors.newFixedThreadPool(4)</code> return karta hai. Harness config check karta hai, aur pool ko saturate karke dekhta hai ki 15va task kahan chala. Har test ke baad harness pool band kar deta hai.</p>`,
      examples: "14 lambe tasks submit (2 core + 10 queue + 2 extra) → 15va task submit karne wale thread pe hi chalta hai",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.*;

class Solution {
    ThreadPoolExecutor createPool() {
        return (ThreadPoolExecutor) Executors.newFixedThreadPool(4);
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static void close(ThreadPoolExecutor p) {
        p.shutdownNow();
        try { p.awaitTermination(1, TimeUnit.SECONDS); } catch (InterruptedException e) { }
    }

    static String policyName(ThreadPoolExecutor p) {
        return p.getRejectedExecutionHandler().getClass().getSimpleName();
    }

    // 14 gated tasks + 1 probe. Return [poolSize, queueSize, probe caller pe chala?, gated done]
    static List<Object> saturate(Solution s) {
        ThreadPoolExecutor p = s.createPool();
        CountDownLatch gate = new CountDownLatch(1);
        AtomicInteger done = new AtomicInteger();
        List<Object> out = new ArrayList<>();
        try {
            for (int i = 0; i < 14; i++) {
                p.execute(() -> {
                    try { gate.await(); done.incrementAndGet(); } catch (InterruptedException e) { }
                });
            }
            out.add(p.getPoolSize());
            out.add(p.getQueue().size());
            String caller = Thread.currentThread().getName();
            Future<String> probe = p.submit(() -> Thread.currentThread().getName());
            String ranOn;
            try { ranOn = probe.get(300, TimeUnit.MILLISECONDS); } catch (Exception e) { ranOn = "abhi tak nahi chala (queue mein atka)"; }
            out.add(caller.equals(ranOn));
            gate.countDown();
            p.shutdown();
            p.awaitTermination(2, TimeUnit.SECONDS);
            out.add(done.get());
        } catch (Exception e) {
            out.add("💥 " + e);
        } finally {
            gate.countDown();
            close(p);
        }
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[core, max, queue capacity, policy]", List.of(2, 4, 10, "CallerRunsPolicy"), () -> {
            ThreadPoolExecutor p = s.createPool();
            try {
                return List.of(p.getCorePoolSize(), p.getMaximumPoolSize(),
                        p.getQueue().remainingCapacity() + p.getQueue().size(), policyName(p));
            } finally { close(p); }
        });
        Check.eq("worker thread ka naam pay-worker- se shuru?", true, () -> {
            ThreadPoolExecutor p = s.createPool();
            try {
                return p.submit(() -> Thread.currentThread().getName()).get(1, TimeUnit.SECONDS).startsWith("pay-worker-");
            } catch (Exception e) { return false; } finally { close(p); }
        });
        Check.hiddenFromHere();
        Check.eq("saturate: [threads, queued, 15va task caller pe?, 14 tasks poore]", List.of(4, 10, true, 14), () -> saturate(s));
        Check.eq("keepAlive 30 seconds", 30L, () -> {
            ThreadPoolExecutor p = s.createPool();
            try { return p.getKeepAliveTime(TimeUnit.SECONDS); } finally { close(p); }
        });
        Check.eq("har call naya pool deta hai, aur numbering 1 se", true, () -> {
            ThreadPoolExecutor p = s.createPool();
            try {
                return p.submit(() -> Thread.currentThread().getName()).get(1, TimeUnit.SECONDS).equals("pay-worker-1");
            } catch (Exception e) { return false; } finally { close(p); }
        });
    }
}`,
      hints: [
        "<code>new ThreadPoolExecutor(2, 4, 30, TimeUnit.SECONDS, new ArrayBlockingQueue&lt;&gt;(10), factory, new ThreadPoolExecutor.CallerRunsPolicy())</code>",
        "ThreadFactory ek lambda ho sakta hai: <code>r -&gt; new Thread(r, \"pay-worker-\" + counter.incrementAndGet())</code>. Counter <b>createPool ke andar</b> banao taaki har pool 1 se gine.",
        "AtomicInteger counter lo, kyunki ThreadFactory kai threads se call ho sakta hai."
      ],
      solution: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

class Solution {
    ThreadPoolExecutor createPool() {
        AtomicInteger n = new AtomicInteger();
        ThreadFactory factory = r -> new Thread(r, "pay-worker-" + n.incrementAndGet());
        return new ThreadPoolExecutor(
                2, 4,                              // core, max
                30, TimeUnit.SECONDS,              // extra threads ka idle timeout
                new ArrayBlockingQueue<>(10),      // bounded queue
                factory,
                new ThreadPoolExecutor.CallerRunsPolicy());
    }
}`,
      explain: "<p>Task flow: pehle 2 core threads, phir queue (10), queue full hone pe 4 tak threads, phir CallerRunsPolicy: submit karne wala thread khud task chalata hai. Isse overload pe caller dheema hota hai (backpressure) aur task kho nahi jaata.</p><p><code>ArrayBlockingQueue(10)</code> se memory bounded hai. Thread naam se thread dump mein turant pata chalega ki ye payment pool ke threads hain.</p>"
    },
    {
      type: "think",
      id: "think-pool-design",
      q: "Interview question: <b>\"Aapki service har request pe 3 downstream APIs call karti hai (har ek ~100ms, zyaadatar network wait). 8-core machine, peak 500 requests/sec. Thread pool kaise design karoge? Executors.newFixedThreadPool kyun nahi?\"</b>",
      rubric: [
        { point: "I/O bound hai, isliye threads <b>cores se zyada</b>: cores × (1 + wait/compute), ya Little's law (rate × latency)", keys: ["i/o bound", "io bound", "wait/compute", "1 + w", "little", "cores se zyada", "more than cores"], weight: 2 },
        { point: "<b>Bounded queue</b>, kyunki fixed pool ki queue unbounded hai (OOM risk)", keys: ["bounded", "unbounded", "arrayblockingqueue", "oom", "out of memory", "memory"], weight: 2 },
        { point: "<b>Rejection policy</b> soch ke (CallerRuns / Abort → 503)", keys: ["rejection", "callerruns", "abort", "503", "reject"] },
        { point: "Downstream calls pe <b>timeout</b>, aur <b>bulkhead</b> (har dependency ka alag pool)", keys: ["timeout", "bulkhead", "alag pool", "separate pool", "circuit breaker"] },
        { point: "Named threads, metrics, graceful <b>shutdown</b>, load test se tune", keys: ["thread factory", "naam", "metrics", "shutdown", "load test", "tune", "monitor"] }
      ],
      answer: `<p><b>Size:</b> Little's law: concurrent kaam = arrival rate × time. 500 req/s × 3 calls × 0.1s = ~150 calls ek saath chal rahe hain (agar teeno parallel bhejo to bhi ~150 in-flight). Zyaadatar time network wait hai, to 8 cores pe bhi ~150-200 threads theek hain. Formula se: 8 × (1 + 95/5) ≈ 160. Phir load test se tune.</p>
        <p><b>Config:</b> <code>ThreadPoolExecutor(core 150, max 200, keepAlive 60s, ArrayBlockingQueue(500), named ThreadFactory, AbortPolicy ya CallerRunsPolicy)</code>. Reject hone pe 503 + retry-after, ya CallerRuns se backpressure.</p>
        <p><b>Fixed pool kyun nahi:</b> uski <code>LinkedBlockingQueue</code> unbounded hai. Downstream slow hua to queue mein lakhs tasks jama → latency infinite aur OOM. Max threads bhi kabhi nahi badhte.</p>
        <p><b>Saath mein:</b> har downstream call pe timeout, har dependency ka alag pool (bulkhead) taaki ek slow API sab threads na kha jaaye, pool metrics (active, queue size, rejected), aur graceful shutdown. (Java 21+ mein I/O-bound kaam ke liye virtual threads bhi option hain.)</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> ThreadPoolExecutor ka task flow ek line mein yaad rakho: <i>core threads → queue → max threads → reject</i>. Zyaadatar candidates sochte hain ki core ke baad seedha max tak threads badhte hain. Ye galti na karna, aur bata dena ki unbounded queue ke saath maxPoolSize bekaar hai, achha impression deta hai."
    }
  ],
  references: [
    { title: "ThreadPoolExecutor (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html", type: "docs" },
    { title: "Executors (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Executors.html", type: "docs" },
    { title: "ExecutorService (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ExecutorService.html", type: "docs" },
    { title: "Oracle Java Tutorial: Thread Pools", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/pools.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 8: Applying Thread Pools)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
