// Atomic variables aur CAS
registerLesson("concurrency", "atomic-cas", {
  why: "'AtomicInteger andar se kaise kaam karta hai?' ka jawab CAS hai, aur ConcurrentHashMap, AQS (ReentrantLock ke andar) sab CAS pe bane hain. Interview mein CAS loop likhna, LongAdder kab, aur ABA problem: ye teeno senior level ke sawaal hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Lock ke bina atomic update: Compare-And-Set (CAS)</h2>
        <p>Lock ka kharcha: thread BLOCKED hota hai, OS usko sulata aur jagata hai (context switch). Ek integer badhane ke liye ye bahut bhaari hai.</p>
        <p>Modern CPUs ek <b>atomic instruction</b> dete hain (x86 pe <code>LOCK CMPXCHG</code>): <i>"agar memory mein abhi bhi value X hai, to use Y kar do; warna kuch mat karo aur batao ki fail hua."</i> Ye ek hi step mein hota hai, beech mein koi nahi ghus sakta.</p>
        <pre class="code-static">boolean compareAndSet(expected, newValue)
   memory == expected ?  memory = newValue, return true
                       :  kuch mat badlo,    return false</pre>
        <p><b>CAS loop</b> (optimistic): value padho, naya value calculate karo, CAS try karo. Fail hua matlab kisi aur ne beech mein badla: dobara padho aur retry. Koi thread block nahi hota, isliye ise <b>lock-free</b> kehte hain.</p>
        <pre class="code-static">int incrementAndGet() {
    while (true) {
        int current = value.get();
        int next = current + 1;
        if (value.compareAndSet(current, next)) return next;
        // fail: koi aur jeet gaya, dobara try
    }
}</pre>`
    },
    {
      type: "steps",
      title: "Visualizer: do threads CAS se increment (value = 5)",
      steps: [
        {
          title: "Step 1: T1 aur T2 dono 5 padhte hain",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5, next=6</td><td></td><td></td><td></td></tr>
            <tr><th>T2</th><td class="run">read 5, next=6</td><td></td><td></td><td></td></tr>
            <tr><th>value</th><td>5</td><td></td><td></td><td></td></tr>
          </table><p>Race condition wale lesson jaisa hi shuru. Farak write mein hai.</p>`
        },
        {
          title: "Step 2: T2 ka CAS(5 → 6) jeet gaya",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5, next=6</td><td></td><td></td><td></td></tr>
            <tr><th>T2</th><td class="run">read 5, next=6</td><td class="lock">CAS(5,6) ✅</td><td></td><td></td></tr>
            <tr><th>value</th><td>5</td><td>6</td><td></td><td></td></tr>
          </table>`
        },
        {
          title: "Step 3: T1 ka CAS(5 → 6) fail (value ab 6 hai), retry",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5, next=6</td><td></td><td class="block">CAS(5,6) ❌</td><td class="run">read 6, next=7</td></tr>
            <tr><th>T2</th><td class="run">read 5, next=6</td><td class="lock">CAS(5,6) ✅</td><td></td><td></td></tr>
            <tr><th>value</th><td>5</td><td>6</td><td>6</td><td>6</td></tr>
          </table><p>Lost update nahi hua: T1 ko pata chal gaya ki uski 5 purani hai. T1 BLOCKED bhi nahi hua, bas retry.</p>`
        },
        {
          title: "Step 4: T1 ka CAS(6 → 7) ✅",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>T1</th><td class="run">read 5</td><td></td><td class="block">CAS ❌</td><td class="run">read 6</td><td class="lock">CAS(6,7) ✅</td></tr>
            <tr><th>T2</th><td class="run">read 5</td><td class="lock">CAS(5,6) ✅</td><td></td><td></td><td></td></tr>
            <tr><th>value</th><td>5</td><td>6</td><td>6</td><td>6</td><td>7</td></tr>
          </table><p>Do increments, value 7. Sahi.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "AtomicInteger ke main methods + 4 threads ka exact count",
      code: `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicInteger stock = new AtomicInteger(10);

        System.out.println("incrementAndGet: " + stock.incrementAndGet()); // 11 (pehle badhao, phir do)
        System.out.println("getAndIncrement: " + stock.getAndIncrement()); // 11 (pehle do, phir badhao)
        System.out.println("ab value:        " + stock.get());             // 12
        System.out.println("CAS(12 -> 20):   " + stock.compareAndSet(12, 20)); // true
        System.out.println("CAS(12 -> 30):   " + stock.compareAndSet(12, 30)); // false, value 20 hai
        System.out.println("updateAndGet x2: " + stock.updateAndGet(x -> x * 2)); // 40 (lambda CAS loop mein)
        System.out.println("accumulate +5:   " + stock.accumulateAndGet(5, Integer::sum)); // 45

        AtomicInteger orders = new AtomicInteger();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < 25_000; j++) orders.incrementAndGet(); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("4 x 25000 orders: " + orders.get());
    }
}`,
      note: "<code>updateAndGet</code>/<code>accumulateAndGet</code> ka lambda retry pe <b>dobara</b> chal sakta hai, isliye usme side effects (log, DB call) mat daalo. Lambda pure hona chahiye."
    },
    {
      type: "code",
      title: "Apna CAS loop: sabse zyada bid track karo (max)",
      code: `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger highestBid = new AtomicInteger(0);

    static void placeBid(int bid) {
        while (true) {
            int current = highestBid.get();
            if (bid <= current) return;                         // purana bada hai, kuch nahi karna
            if (highestBid.compareAndSet(current, bid)) return; // jeet gaye
            // fail: kisi ne beech mein naya bid daala, dobara compare karo
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] bidders = new Thread[4];
        for (int b = 0; b < 4; b++) {
            final int offset = b;
            bidders[b] = new Thread(() -> {
                for (int i = 0; i < 10_000; i++) placeBid(i * 4 + offset); // sab threads ke bids mila ke 0..39999
            });
            bidders[b].start();
        }
        for (Thread t : bidders) t.join();
        System.out.println("Highest bid: " + highestBid.get() + " (hamesha 39999)");
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>LongAdder: bahut contention wale counters ke liye</h2>
        <p>CAS ki problem: 32 threads ek hi variable pe CAS karein to zyaadatar fail honge aur retry karenge. Ek hi cache line cores ke beech ping-pong hoti hai.</p>
        <p><code>LongAdder</code> value ko kai <b>cells</b> mein baant deta hai. Contention dikhne pe alag threads alag cells badhate hain. <code>sum()</code> sab cells jodta hai.</p>
        <table>
          <tr><th></th><th>AtomicLong</th><th>LongAdder</th></tr>
          <tr><td>High contention pe increment</td><td>Retries badhte hain, slow</td><td>Tez (alag cells)</td></tr>
          <tr><td>Read</td><td><code>get()</code>: exact, sasta</td><td><code>sum()</code>: sab cells jodo; concurrent updates ke time exact snapshot nahi</td></tr>
          <tr><td>compareAndSet</td><td>Haan</td><td>Nahi</td></tr>
          <tr><td>Memory</td><td>Ek long</td><td>Zyada (cells)</td></tr>
          <tr><td>Use</td><td>Sequence/ID generator, jahan har value unique chahiye</td><td>Metrics: request count, bytes served, hit counts</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "LongAdder vs AtomicLong: dono exact, LongAdder contention mein tez",
      code: `import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicLong atomic = new AtomicLong();
        LongAdder adder = new LongAdder();

        Thread[] ts = new Thread[8];
        for (int i = 0; i < 8; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < 50_000; j++) {
                    atomic.incrementAndGet();
                    adder.increment();
                }
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();

        System.out.println("AtomicLong: " + atomic.get());
        System.out.println("LongAdder:  " + adder.sum());
        System.out.println("Dono 400000. Speed ka farak multi-core machine pe benchmark (JMH) se dikhta hai, yahan nahi.");
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>ABA problem (intro)</h2>
        <p>CAS sirf ye check karta hai ki value <b>abhi</b> expected jaisi hai. Agar beech mein value A → B → A ho gayi, to CAS ko lagega kuch nahi badla.</p>
        <p>Example: lock-free stack ka top node A hai. T1 ne A padha (next = B) aur ruk gaya. T2 ne A pop kiya, B pop kiya, phir A wapas push kiya. T1 jagta hai: top abhi bhi A hai, CAS(A → B) success. Par B to stack se nikal chuka hai! Stack corrupt.</p>
        <p><b>Fix:</b> value ke saath ek <b>version/stamp</b> rakho. Har change pe stamp +1. CAS value aur stamp dono check kare. Java: <code>AtomicStampedReference</code> (int stamp) ya <code>AtomicMarkableReference</code> (boolean mark).</p>
        <p>Note: Java mein GC ki wajah se "same address dobara use" wala classic ABA kam hota hai, par jab aap logical values (ids, ints, reuse kiye objects) pe CAS karte ho, tab ye asli problem hai.</p>`
    },
    {
      type: "code",
      title: "ABA: AtomicReference dhoka kha jaata hai, AtomicStampedReference nahi",
      code: `import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicStampedReference;

public class Main {
    public static void main(String[] args) {
        // Plain reference
        AtomicReference<String> top = new AtomicReference<>("A");
        String seen = top.get();               // T1 ne A dekha... aur ruk gaya
        top.set("B");                          // T2: A -> B
        top.set("A");                          // T2: B -> A (wapas)
        System.out.println("AtomicReference CAS(A -> C): " + top.compareAndSet(seen, "C") + "  (ABA pakda nahi)");

        // Stamped reference
        AtomicStampedReference<String> stTop = new AtomicStampedReference<>("A", 0);
        int[] stampHolder = new int[1];
        String seen2 = stTop.get(stampHolder); // value A, stamp 0
        int seenStamp = stampHolder[0];
        stTop.set("B", seenStamp + 1);         // stamp 1
        stTop.set("A", seenStamp + 2);         // stamp 2, value phir A
        boolean ok = stTop.compareAndSet(seen2, "C", seenStamp, seenStamp + 1);
        System.out.println("AtomicStampedReference CAS(A@0 -> C): " + ok + "  (stamp badal gaya tha, ABA pakda)");
    }
}`
    },
    {
      type: "quiz",
      q: "<code>AtomicInteger x = new AtomicInteger(7);</code><br><code>boolean r = x.compareAndSet(5, 6);</code><br><code>r</code> aur <code>x.get()</code> kya honge?",
      options: [
        "<code>true</code>, <code>6</code>",
        "<code>false</code>, <code>7</code>",
        "<code>false</code>, <code>6</code>",
        "Exception, kyunki 7 != 5"
      ],
      answer: 1,
      why: "Current value (7) expected (5) se match nahi karti, to CAS kuch nahi badalta aur false deta hai. Caller ko decide karna hai: retry karna hai ya chhodna."
    },
    {
      type: "pick",
      id: "pick-cas-fit",
      q: "Kahan <b>atomic classes / CAS</b> sahi tool hain (lock se behtar)?",
      options: [
        { text: "Har request pe badhne wala metrics counter", correct: true, why: "LongAdder/AtomicLong. Lock bekar ka overhead hai." },
        { text: "Unique order id generator", correct: true, why: "AtomicLong.incrementAndGet(): har call ko alag number." },
        { text: "Do accounts ke beech transfer (dono balance ek saath badlein)", correct: false, why: "Do variables ek saath atomic chahiye. CAS ek variable pe kaam karta hai, yahan lock chahiye." },
        { text: "Lazy init flag: sirf pehla thread setup chalaye", correct: true, why: "<code>AtomicBoolean.compareAndSet(false, true)</code> jeetne wala setup karega." },
        { text: "Bahut zyada contention (100 threads) wala ek hi value jise har baar CAS karna hai aur lamba compute hota hai", correct: false, why: "Lambi computation + bahut retries = CPU waste (har fail pe dobara compute). Yahan lock better ho sakta hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-flash-sale",
      title: "Flash sale: 100 iPhones, oversell nahi hona chahiye (CAS)",
      level: "Medium",
      task: `<p><code>Solution(permits)</code> ke paas <code>permits</code> items hain. <code>tryAcquire()</code>: item bacha ho to ek lo aur <code>true</code> do, warna <code>false</code>. <code>release()</code> ek item wapas. <code>available()</code> kitne bache.</p>
        <p>Starter mein check-then-act race hai: do threads dono \"1 bacha\" dekh ke dono le lete hain, count negative ho jaata hai. <code>Thread.yield()</code> race window bada karta hai.</p>
        <p><b>Lock-free</b> theek karo: <code>compareAndSet</code> loop. (Harness check karta hai ki <code>tryAcquire</code> synchronized nahi hai aur koi Lock field nahi.) Harness 8 threads se ek saath kharidwata hai: exactly <code>permits</code> success, aur <code>available()</code> = 0, kabhi negative nahi.</p>`,
      examples: "<code>Solution(2)</code>: <code>tryAcquire()</code> → true, true, false; <code>available()</code> → 0",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.atomic.AtomicInteger;

class Solution {
    private final AtomicInteger available;

    Solution(int permits) {
        available = new AtomicInteger(permits);
    }

    boolean tryAcquire() {
        if (available.get() > 0) {        // check
            Thread.yield();               // race window
            available.decrementAndGet();  // act
            return true;
        }
        return false;
    }

    void release() {
        available.incrementAndGet();
    }

    int available() {
        return available.get();
    }
}`,
      harness: `import seekho.Check;
import java.lang.reflect.*;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;

public class Main {
    // [successes, available at end]
    static List<Integer> sale(int permits, int threads, int triesEach) {
        Solution s = new Solution(permits);
        AtomicInteger wins = new AtomicInteger();
        CountDownLatch go = new CountDownLatch(1);
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int k = 0; k < triesEach; k++) if (s.tryAcquire()) wins.incrementAndGet();
            });
            ts[i].setDaemon(true);
            ts[i].start();
        }
        go.countDown();
        try { for (Thread t : ts) t.join(3000); } catch (InterruptedException e) { throw new RuntimeException(e); }
        return List.of(wins.get(), s.available());
    }

    static String lockFree() {
        try {
            Method m = Solution.class.getDeclaredMethod("tryAcquire");
            if (Modifier.isSynchronized(m.getModifiers())) return "tryAcquire synchronized hai (lock-free nahi)";
        } catch (NoSuchMethodException e) {
            return "tryAcquire() nahi mila";
        }
        for (Field f : Solution.class.getDeclaredFields()) {
            if (Lock.class.isAssignableFrom(f.getType())) return "Lock field mila (lock-free nahi)";
        }
        return "lock-free";
    }

    public static void main(String[] args) {
        Check.eq("Solution(2): acquire x3, available", List.of(true, true, false, 0), () -> {
            Solution s = new Solution(2);
            return List.of(s.tryAcquire(), s.tryAcquire(), s.tryAcquire(), s.available());
        });
        Check.eq("100 iPhones, 8 threads x 50 tries: [sold, bache]", List.of(100, 0), () -> sale(100, 8, 50));
        Check.hiddenFromHere();
        Check.eq("0 permits", List.of(false, 0), () -> {
            Solution s = new Solution(0);
            return List.of(s.tryAcquire(), s.available());
        });
        Check.eq("release ke baad phir milta hai", List.of(true, false, true), () -> {
            Solution s = new Solution(1);
            boolean a = s.tryAcquire(), b = s.tryAcquire();
            s.release();
            return List.of(a, b, s.tryAcquire());
        });
        Check.eq("1 item, 16 threads", List.of(1, 0), () -> sale(1, 16, 20));
        Check.eq("500 items, 8 threads x 100 tries", List.of(500, 0), () -> sale(500, 8, 100));
        Check.eq("lock-free implementation?", "lock-free", Main::lockFree);
    }
}`,
      hints: [
        "Check aur decrement ko alag alag mat karo. Ek hi atomic step chahiye: \"agar abhi bhi current hai to current-1 kar do\".",
        "Loop: <code>int cur = available.get(); if (cur == 0) return false; if (available.compareAndSet(cur, cur - 1)) return true;</code> warna retry.",
        "<code>Thread.yield()</code> get aur CAS ke beech rakh sakte ho: CAS fail hoga aur loop retry karega, galat answer nahi aayega."
      ],
      solution: `import java.util.concurrent.atomic.AtomicInteger;

class Solution {
    private final AtomicInteger available;

    Solution(int permits) {
        available = new AtomicInteger(permits);
    }

    boolean tryAcquire() {
        while (true) {
            int cur = available.get();
            if (cur == 0) return false;                       // sold out
            Thread.yield();                                   // race window ab safe hai
            if (available.compareAndSet(cur, cur - 1)) return true;
            // CAS fail: kisi aur ne beech mein liya, dobara padho
        }
    }

    void release() {
        available.incrementAndGet();
    }

    int available() {
        return available.get();
    }
}`,
      explain: "<p>CAS loop check aur decrement ko ek atomic step bana deta hai: decrement tabhi hoga jab value ab bhi wahi hai jo humne check ki thi. Kisi ne beech mein badla to CAS fail, hum dobara padhte hain. Count kabhi negative nahi hota.</p><p>Koi thread block nahi hota (lock-free). Bahut zyada contention pe retries badhte hain, par har retry O(1) hai. Ye wahi idea hai jo <code>Semaphore.tryAcquire()</code> andar use karta hai.</p>"
    },
    {
      type: "think",
      id: "think-cas",
      q: "Interview question: <b>\"CAS kya hai? Lock se kab behtar hai aur kab nahi? ABA problem kya hai?\"</b>",
      rubric: [
        { point: "CAS = <b>compare and set/swap</b>: expected match ho to update, warna fail; CPU ka <b>atomic instruction</b>", keys: ["compare and", "compareandset", "cmpxchg", "atomic instruction", "hardware", "expected"], weight: 2 },
        { point: "<b>Retry loop</b>, lock-free/non-blocking, context switch nahi", keys: ["retry", "loop", "lock-free", "lock free", "non-blocking", "block nahi"], weight: 2 },
        { point: "Kab nahi: <b>high contention</b> (retries, CPU waste), <b>multiple variables</b> ek saath", keys: ["contention", "multiple variable", "kai variable", "do variable", "cpu waste", "spin"] },
        { point: "<b>LongAdder</b> high contention counters ke liye", keys: ["longadder", "striped", "cells"] },
        { point: "<b>ABA</b>: A→B→A, CAS ko change nahi dikhta; fix <b>AtomicStampedReference</b>/version", keys: ["aba", "stamp", "version", "atomicstampedreference"], weight: 2 }
      ],
      answer: `<p><b>CAS</b>: ek atomic CPU instruction: "memory mein agar abhi bhi expected value hai to new value likho, warna fail batao". Java mein <code>AtomicInteger.compareAndSet()</code>, aur ConcurrentHashMap/AQS isi pe bane hain.</p>
        <p><b>Lock se behtar:</b> ek variable ka chhota update (counter, max, flag), kam-medium contention. Koi thread sota nahi, context switch nahi, deadlock possible nahi.</p>
        <p><b>Kab nahi:</b> bahut zyada contention (har fail pe retry, CPU jalta hai; counters ke liye LongAdder), lambi computation retry ke saath, ya jab kai variables ek saath atomic badalne hon (lock lo).</p>
        <p><b>ABA:</b> value A se B aur wapas A ho gayi; CAS ko lagta hai kuch nahi badla. Lock-free stack/queue mein ye structure corrupt kar sakta hai. Fix: value ke saath version stamp (<code>AtomicStampedReference</code>).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"AtomicInteger thread-safe kaise hai?\" pe sirf \"atomic hai\" mat bolo. CAS loop 4 line mein likh ke dikhao (get, compute, compareAndSet, retry). Phir khud follow-up do: <i>\"high contention pe LongAdder, aur pointer-based structures mein ABA ka dhyaan.\"</i>"
    }
  ],
  references: [
    { title: "java.util.concurrent.atomic package (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/package-summary.html", type: "docs" },
    { title: "LongAdder (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/LongAdder.html", type: "docs" },
    { title: "Oracle Java Tutorial: Atomic Variables", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/atomicvars.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 15: Atomic Variables and Nonblocking Synchronization)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
