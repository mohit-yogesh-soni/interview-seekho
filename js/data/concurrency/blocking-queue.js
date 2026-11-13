// BlockingQueue
registerLesson("concurrency", "blocking-queue", {
  why: "Producer-Consumer interview ka sabse common concurrency design hai, aur asli systems (log shipping, order processing, thread pools) andar se BlockingQueue pe hi chalte hain. wait/notify se jo 30 line ka bug-prone code banta hai, BlockingQueue se 3 line mein ho jaata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: order aate tez hain, process dheere hote hain</h2>
        <p>Swiggy jaisi app mein API threads orders accept karte hain (fast). Ek worker pool har order ko restaurant tak bhejta hai (slow, network call). Beech mein ek <b>line</b> chahiye jo:</p>
        <ul>
          <li>khaali ho to worker ko <b>sula de</b> (CPU waste na ho, busy loop nahi)</li>
          <li>bhari ho to producer ko <b>rok de</b> (memory na phate: <i>backpressure</i>)</li>
          <li>thread-safe ho, bina hamare kisi lock ke</li>
        </ul>
        <p>Yahi <code>java.util.concurrent.BlockingQueue</code> hai. Pichhle lesson (wait/notify) mein humne ye khud banaya tha. Ab ready-made version.</p>
        <pre class="diagram">
 Producers                 BlockingQueue (capacity 3)            Consumers
 [API-1] ──put()──►  ┌─────┬─────┬─────┐  ──take()──►  [Worker-1]
 [API-2] ──put()──►  │ o1  │ o2  │ o3  │  ──take()──►  [Worker-2]
                     └─────┴─────┴─────┘
   full? put() WAIT karta hai          empty? take() WAIT karta hai</pre>`
    },
    {
      type: "text",
      html: `
        <h2>4 tarah ke methods (yaad rakhne layak table)</h2>
        <p>Queue full/empty hone pe har operation ke 4 versions hain. Ye table seedha official Javadoc ke design se hai:</p>
        <table>
          <tr><th>Kaam</th><th>Exception phenko</th><th>Special value lautao</th><th>Block (wait) karo</th><th>Timeout tak wait</th></tr>
          <tr><td>Daalna</td><td><code>add(e)</code></td><td><code>offer(e)</code> → false</td><td><code>put(e)</code></td><td><code>offer(e, time, unit)</code></td></tr>
          <tr><td>Nikaalna</td><td><code>remove()</code></td><td><code>poll()</code> → null</td><td><code>take()</code></td><td><code>poll(time, unit)</code></td></tr>
          <tr><td>Dekhna</td><td><code>element()</code></td><td><code>peek()</code> → null</td><td>-</td><td>-</td></tr>
        </table>
        <ul>
          <li><b>null allowed nahi</b>: <code>put(null)</code> → <code>NullPointerException</code>. Kyunki <code>poll()</code> ka null "khaali hai" ka signal hai.</li>
          <li><code>put</code>/<code>take</code>/timeout wale <code>InterruptedException</code> phenkte hain: thread ko band karne ka saaf raasta.</li>
          <li><code>drainTo(list)</code>: jitne items hain sab ek saath nikaal lo (batching ke liye fast).</li>
        </ul>`
    },
    {
      type: "steps",
      title: "Visualizer: capacity 2, ek fast producer, ek slow consumer",
      steps: [
        { title: "Step 1: queue khaali, consumer take() pe so raha hai", html: `<div class="arr"><span class="cell dim">-</span><span class="cell dim">-</span></div>
          <table class="lanes"><tr><th>P</th><td class="run">order banaya</td></tr><tr><th>C</th><td class="wait">take(): empty → WAITING (CPU 0%)</td></tr></table>` },
        { title: "Step 2: P ne put(o1). C jaag ke o1 le leta hai", html: `<div class="arr"><span class="cell hl">o1</span><span class="cell dim">-</span></div>
          <table class="lanes"><tr><th>P</th><td class="run">put(o1) ✅</td></tr><tr><th>C</th><td class="run">take() → o1, process (slow)</td></tr></table>` },
        { title: "Step 3: P tez hai: put(o2), put(o3). Queue full", html: `<div class="arr"><span class="cell hl">o2</span><span class="cell hl">o3</span></div>
          <table class="lanes"><tr><th>P</th><td class="run">put(o2) ✅ put(o3) ✅</td></tr><tr><th>C</th><td class="run">abhi bhi o1 pe busy</td></tr></table>` },
        { title: "Step 4: put(o4): full → P ruk jaata hai (backpressure)", html: `<div class="arr"><span class="cell bad">o2</span><span class="cell bad">o3</span></div>
          <table class="lanes"><tr><th>P</th><td class="wait">put(o4): full → WAITING</td></tr><tr><th>C</th><td class="run">o1 khatam</td></tr></table>
          <p>Unbounded queue hoti to P rukta nahi, aur memory mein lakhs orders jama ho jaate (OutOfMemoryError ka raasta).</p>` },
        { title: "Step 5: C ne take() → o2. Jagah bani, P ka put(o4) poora", html: `<div class="arr"><span class="cell hl">o3</span><span class="cell ok">o4</span></div>
          <table class="lanes"><tr><th>P</th><td class="run">put(o4) ✅ (jaag gaya)</td></tr><tr><th>C</th><td class="run">take() → o2</td></tr></table>
          <p>Producer apne aap consumer ki speed pe aa gaya. Koi <code>synchronized</code>, <code>wait</code> ya <code>notify</code> humne nahi likha.</p>` }
      ]
    },
    {
      type: "code",
      title: "Producer-Consumer with poison pill: 2 workers, 8 orders, saaf shutdown",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final String POISON = "__STOP__";   // "ab kaam khatam" ka signal

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> orders = new ArrayBlockingQueue<>(3);
        AtomicInteger processed = new AtomicInteger();
        int workers = 2;

        List<Thread> pool = new ArrayList<>();
        for (int w = 1; w <= workers; w++) {
            Thread t = new Thread(() -> {
                try {
                    while (true) {
                        String o = orders.take();          // khaali ho to so jao
                        if (o.equals(POISON)) return;      // pill mili: loop band
                        Thread.sleep(5);                   // fake restaurant call
                        processed.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "worker-" + w);
            t.start();
            pool.add(t);
        }

        for (int i = 1; i <= 8; i++) {
            orders.put("order-" + i);                      // full ho to producer rukta hai
        }
        for (int w = 0; w < workers; w++) {
            orders.put(POISON);                            // HAR worker ke liye ek pill
        }
        for (Thread t : pool) t.join();

        System.out.println("processed = " + processed.get());
        System.out.println("queue khaali? " + orders.isEmpty());
    }
}`,
      note: "Poison pill pattern: producer kaam ke baad ek special item daalta hai. Har consumer ek pill khaata hai aur ruk jaata hai. <b>Pills = consumers ki ginti</b>, warna koi worker hamesha <code>take()</code> pe atka rahega. Doosra tareeka: workers ko <code>interrupt()</code> karo (take() turant InterruptedException phenkta hai)."
    },
    {
      type: "code",
      title: "offer/poll with timeout: wait ki limit lagao",
      code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> q = new ArrayBlockingQueue<>(1);

        System.out.println("offer(1): " + q.offer(1));                 // jagah thi
        System.out.println("offer(2): " + q.offer(2));                 // full → false, turant
        long t0 = System.nanoTime();
        boolean ok = q.offer(3, 50, TimeUnit.MILLISECONDS);           // 50ms wait, phir false
        long ms = (System.nanoTime() - t0) / 1_000_000;
        System.out.println("offer(3, 50ms): " + ok + " (approx 50ms ruka? " + (ms >= 45) + ")");

        System.out.println("poll(): " + q.poll());                     // 1
        System.out.println("poll(): " + q.poll());                     // khaali → null
        System.out.println("poll(20ms): " + q.poll(20, TimeUnit.MILLISECONDS));

        try {
            q.add(9);
            q.add(10);                                                 // full → exception
        } catch (IllegalStateException e) {
            System.out.println("add() on full: " + e.getClass().getSimpleName());
        }
        try {
            q.offer(null);
        } catch (NullPointerException e) {
            System.out.println("null allowed? no → NullPointerException");
        }
    }
}`
    },
    {
      type: "quiz",
      q: "Producer ne 10 items daale, phir <b>ek</b> poison pill. 3 consumer threads hain jo pill milne pe ruk jaate hain. Main thread teeno pe <code>join()</code> karta hai. Kya hoga?",
      options: [
        "Teeno consumers ruk jaayenge, program khatam",
        "Ek consumer rukega, baaki do take() pe hamesha wait karenge, main ka join() kabhi khatam nahi hoga",
        "take() pill ko teeno consumers ko de dega (broadcast)",
        "ArrayBlockingQueue exception phenkega"
      ],
      answer: 1,
      why: "Queue ka har item <b>sirf ek</b> consumer ko milta hai (broadcast nahi). Ek pill = ek consumer band. Baaki do khaali queue pe <code>take()</code> karke so jaate hain. Fix: N consumers ke liye N pills, ya consumer pill wapas queue mein daal de, ya interrupt karo."
    },
    {
      type: "text",
      html: `
        <h2>Kaunsi BlockingQueue kab?</h2>
        <table>
          <tr><th>Class</th><th>Bounded?</th><th>Andar se</th><th>Kab use karein</th></tr>
          <tr><td><code>ArrayBlockingQueue</code></td><td>Haan, fixed (constructor mein dena zaroori)</td><td>Array (circular), <b>ek</b> ReentrantLock + 2 Conditions (notEmpty, notFull). Optional fairness.</td><td>Default choice jab limit chahiye. Memory fix, predictable.</td></tr>
          <tr><td><code>LinkedBlockingQueue</code></td><td>Optional. Capacity na do to <code>Integer.MAX_VALUE</code> (practically unbounded!)</td><td>Linked nodes, <b>do alag locks</b> (putLock, takeLock): producer aur consumer ek doosre ko block nahi karte</td><td>High throughput. Hamesha capacity do.</td></tr>
          <tr><td><code>PriorityBlockingQueue</code></td><td>Nahi (unbounded)</td><td>Heap</td><td>Priority se kaam (VIP orders pehle). put() kabhi block nahi karta.</td></tr>
          <tr><td><code>DelayQueue</code></td><td>Nahi</td><td>Heap of <code>Delayed</code></td><td>"5 minute baad retry", scheduled expiry</td></tr>
          <tr><td><code>SynchronousQueue</code></td><td>Capacity 0</td><td>Direct handoff: put() tab tak rukta hai jab tak koi take() na kare</td><td><code>Executors.newCachedThreadPool()</code> isi ko use karta hai</td></tr>
          <tr><td><code>LinkedBlockingDeque</code></td><td>Optional</td><td>Dono taraf se put/take</td><td>Work stealing jaise patterns</td></tr>
        </table>
        <div class="tip-box">🔗 <b>Thread pool connection:</b> <code>Executors.newFixedThreadPool(n)</code> andar se <b>unbounded</b> <code>LinkedBlockingQueue</code> use karta hai. Tasks tez aayein to queue badhti rehti hai aur memory khatam. Production mein <code>new ThreadPoolExecutor(..., new ArrayBlockingQueue&lt;&gt;(1000), rejectionPolicy)</code> likho. (Executors lesson dekho.)</div>`
    },
    {
      type: "pick",
      id: "pick-which-queue",
      q: "Kaunse statements <b>sahi</b> hain?",
      options: [
        { text: "<code>new LinkedBlockingQueue&lt;&gt;()</code> bina capacity ke practically unbounded hai", correct: true, why: "Default capacity Integer.MAX_VALUE hai. Producer kabhi nahi rukega, memory badhti rahegi." },
        { text: "<code>PriorityBlockingQueue.put()</code> queue bhari hone pe block karta hai", correct: false, why: "Ye unbounded hai, put() kabhi block nahi karta. Sirf take() khaali hone pe wait karta hai." },
        { text: "BlockingQueue mein <code>null</code> daal sakte hain agar capacity bachi ho", correct: false, why: "Null kabhi allowed nahi: NullPointerException. poll() ka null 'khaali' ka signal hai." },
        { text: "LinkedBlockingQueue mein put aur take alag locks use karte hain, isliye ek saath chal sakte hain", correct: true, why: "Two-lock queue design (putLock, takeLock). ArrayBlockingQueue mein ek hi lock hai." },
        { text: "SynchronousQueue mein ek item rakh ke producer aage badh jaata hai", correct: false, why: "Capacity 0 hai. put() tab tak rukta hai jab tak koi consumer take() na kare (direct handoff)." },
        { text: "<code>take()</code> pe atka thread <code>interrupt()</code> se jaag ke InterruptedException phenkta hai", correct: true, why: "Blocking methods interruptible hain. Workers band karne ka standard tareeka." }
      ]
    },
    {
      type: "exercise",
      id: "ex-pipeline",
      title: "Order pipeline: N workers, bounded queue, poison pills",
      level: "Medium",
      task: `<p><code>process(jobs, workers, capacity)</code> likho:</p>
        <ul>
          <li>Ek <code>BlockingQueue</code> banao jiski capacity <code>capacity</code> ho.</li>
          <li><code>workers</code> consumer threads start karo. Har worker queue se job (int) leta hai aur <code>job * job</code> ek shared total mein jodta hai.</li>
          <li>Main thread (producer) saare <code>jobs</code> queue mein <code>put</code> kare, phir har worker ke liye ek poison pill (jaise <code>-1</code>, jobs hamesha ≥ 0 hain).</li>
          <li>Saare workers ka <code>join</code> karke total (<code>long</code>) return karo.</li>
        </ul>
        <p>Harness check karta hai ki answer sahi ho aur method atke nahi (pills kam hon to worker hamesha wait karega).</p>`,
      examples: "<code>process([1,2,3], 2, 2)</code> → 1+4+9 = <code>14</code><br><code>process([], 3, 1)</code> → <code>0</code> (aur turant khatam)",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

class Solution {
    long process(int[] jobs, int workers, int capacity) throws InterruptedException {
        // TODO: BlockingQueue + workers + poison pills
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

public class Main {
    // process ko alag daemon thread mein chalao, taaki atka hua solution harness na roke
    static Object guarded(int[] jobs, int workers, int cap) {
        AtomicReference<Object> out = new AtomicReference<>("atak gaya: har worker ke liye pill daali?");
        Thread t = new Thread(() -> {
            try { out.set(new Solution().process(jobs, workers, cap)); } catch (Exception e) { out.set("💥 " + e); }
        });
        t.setDaemon(true);
        t.start();
        try { t.join(1500); } catch (InterruptedException e) { }
        return out.get();
    }

    static long expected(int[] jobs) {
        long s = 0;
        for (int j : jobs) s += (long) j * j;
        return s;
    }

    public static void main(String[] args) {
        Check.eq("jobs=[1,2,3], workers=2, cap=2", 14L, () -> guarded(new int[]{1, 2, 3}, 2, 2));
        Check.eq("jobs=[5], workers=1, cap=1", 25L, () -> guarded(new int[]{5}, 1, 1));
        Check.hiddenFromHere();
        Check.eq("khaali jobs, 3 workers (pills se band hon)", 0L, () -> guarded(new int[]{}, 3, 1));
        Check.eq("zero wale jobs bhi gine jaayein: [0,0,4]", 16L, () -> guarded(new int[]{0, 0, 4}, 2, 1));
        int[] many = new int[5000];
        for (int i = 0; i < many.length; i++) many[i] = i % 1000;
        Check.eq("5000 jobs, 4 workers, cap 8", expected(many), () -> guarded(many, 4, 8));
        int[] big = {100000, 99999, 12345};
        Check.eq("bade numbers (long overflow?)", expected(big), () -> guarded(big, 3, 2));
        Check.eq("workers > jobs: 6 workers, 2 jobs", 13L, () -> guarded(new int[]{2, 3}, 6, 1));
    }
}`,
      hints: [
        "<code>BlockingQueue&lt;Integer&gt; q = new ArrayBlockingQueue&lt;&gt;(capacity);</code> aur total ke liye <code>AtomicLong</code> (kai threads jodenge).",
        "Worker loop: <code>while (true) { int j = q.take(); if (j == -1) return; total.addAndGet((long) j * j); }</code>. Workers <b>pehle</b> start karo, warna capacity chhoti hone pe main ka put() atak jaayega.",
        "Jobs ke baad <code>for (w...) q.put(-1);</code> (workers jitni pills), phir har thread pe <code>join()</code>."
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

class Solution {
    private static final int POISON = -1;

    long process(int[] jobs, int workers, int capacity) throws InterruptedException {
        BlockingQueue<Integer> q = new ArrayBlockingQueue<>(capacity);
        AtomicLong total = new AtomicLong();
        List<Thread> threads = new ArrayList<>();

        for (int w = 0; w < workers; w++) {
            Thread t = new Thread(() -> {
                try {
                    while (true) {
                        int j = q.take();
                        if (j == POISON) return;
                        total.addAndGet((long) j * j);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            t.start();
            threads.add(t);
        }

        for (int j : jobs) q.put(j);                 // full ho to yahin rukta hai (backpressure)
        for (int w = 0; w < workers; w++) q.put(POISON);
        for (Thread t : threads) t.join();
        return total.get();
    }
}`,
      explain: "<p>Workers pehle start hote hain, phir producer daalta hai. Capacity chhoti ho (1) tab bhi kaam chalta hai kyunki workers saath saath nikaal rahe hain. Har worker ek pill khaata hai, isliye <b>workers jitni pills</b>. <code>(long) j * j</code>: int overflow se bachne ke liye (100000² int mein nahi aata). <code>AtomicLong</code>: kai threads ek saath jod rahe hain.</p><p>Time O(n) operations, memory O(capacity): queue kabhi capacity se badi nahi hoti, chahe jobs kitne bhi hon.</p>"
    },
    {
      type: "think",
      id: "think-bq-design",
      q: "Interview question: <b>\"Ek logging library banao: app threads log line likhte hain, ek background thread unhe batch mein disk/network pe bhejta hai. App threads kabhi slow nahi hone chahiye. Kaise design karoge?\"</b>",
      rubric: [
        { point: "App threads aur writer ke beech <b>bounded BlockingQueue</b>", keys: ["blockingqueue", "blocking queue", "arrayblockingqueue", "bounded", "queue"], weight: 2 },
        { point: "App thread <b>offer()</b> (block nahi) karega; full ho to drop / count / fallback, kyunki app slow nahi honi chahiye", keys: ["offer", "drop", "discard", "non-blocking", "block nahi", "nahi rukega"], weight: 2 },
        { point: "Writer <b>drainTo / batch</b> karta hai (ek network call mein bahut lines)", keys: ["drainto", "batch", "bulk", "ek saath"] },
        { point: "Writer <b>poll(timeout)</b> se flush karta hai taaki kam traffic mein bhi logs der se na jaayein", keys: ["poll", "timeout", "flush", "interval"] },
        { point: "Shutdown pe bacha hua queue flush (poison pill / interrupt + drain)", keys: ["shutdown", "poison", "flush", "interrupt", "drain"] }
      ],
      answer: `<p><b>Design:</b> <code>ArrayBlockingQueue&lt;LogEvent&gt;(10_000)</code> + ek daemon writer thread.</p>
        <ul>
          <li><b>App side:</b> <code>queue.offer(event)</code>. Full ho to <i>block mat karo</i>: event drop karo aur ek <code>droppedCount</code> badhao (ya sirf DEBUG drop karo, ERROR ke liye chhota sa wait). Logging ki wajah se request slow nahi honi chahiye.</li>
          <li><b>Writer side:</b> <code>LogEvent first = queue.poll(200, ms)</code>; mila to <code>queue.drainTo(batch, 499)</code> karke 500 tak ka batch ek baar mein likho. Timeout se kam traffic mein bhi max 200ms ki der.</li>
          <li><b>Shutdown:</b> poison pill ya flag + interrupt, phir jo bacha hai <code>drainTo</code> karke flush.</li>
        </ul>
        <p>Log4j2 ka AsyncAppender aur Logback ka AsyncAppender isi idea pe chalte hain (bounded queue + "queue full pe kya karein" ka option). Log4j2 ka async logger isse aage LMAX Disruptor (lock-free ring buffer) use karta hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Producer-Consumer pucha jaaye to pehle bolo: \"Production mein main <code>BlockingQueue</code> use karunga, bounded, taaki backpressure mile.\" Phir agar interviewer bole \"khud implement karo\", to <code>ReentrantLock</code> + do <code>Condition</code> (notFull, notEmpty) se banao (Bounded Queue wala classic lesson). Dono level dikhane se seniority dikhti hai."
    }
  ],
  references: [
    { title: "BlockingQueue (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/BlockingQueue.html", type: "docs" },
    { title: "Oracle Java Tutorial: Concurrency", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.3: Blocking queues and producer-consumer)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
