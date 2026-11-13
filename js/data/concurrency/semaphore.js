// Semaphore
registerLesson("concurrency", "semaphore", {
  why: "Limited resource (DB connections, third-party API ke concurrent calls, GPU slots) ko bachane ka standard tool Semaphore hai. Interview mein poochte hain: Semaphore(1) aur lock mein kya farak hai, permit kis thread ka hota hai, aur semaphore rate limiter hai ya concurrency limiter.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: SMS provider sirf 3 concurrent calls allow karta hai</h2>
        <p>Aapki OTP service ek SMS provider call karti hai. Contract: <b>max 3 calls ek saath</b>, chauthi call pe provider 429/ban. Par aapke paas 200 request threads hain.</p>
        <p>Lock (synchronized/ReentrantLock) <b>ek</b> thread ko andar jaane deta hai. Hume chahiye: <b>N</b> threads andar, baaki line mein. Yahi <b>Semaphore</b> hai: ek counter of permits.</p>
        <ul>
          <li><code>acquire()</code>: permit lo; koi free nahi to wait</li>
          <li><code>release()</code>: permit wapas (counter +1), wait karne wala ek thread jagta hai</li>
          <li><code>tryAcquire()</code> / <code>tryAcquire(timeout, unit)</code>: na mile to <code>false</code> (wait nahi / limited wait)</li>
          <li><code>acquire(n)</code> / <code>release(n)</code>: ek saath kai permits</li>
          <li><code>availablePermits()</code>: abhi kitne free</li>
          <li><code>new Semaphore(n, true)</code>: fair (FIFO). Default non-fair (barging allowed). Note: bina timeout wala <code>tryAcquire()</code> fairness ignore karta hai</li>
        </ul>
        <pre class="code-static">Semaphore sms = new Semaphore(3);

void sendOtp(String phone) throws InterruptedException {
    sms.acquire();               // try ke BAHAR: permit mila tabhi release
    try {
        provider.send(phone);
    } finally {
        sms.release();
    }
}</pre>`
    },
    {
      type: "steps",
      title: "Visualizer: Semaphore(3), 4 threads",
      steps: [
        {
          title: "Step 1: T1, T2, T3 ne permit liya (3 → 0)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>T1</th><td class="lock">acquire ✅ (2 bache)</td><td></td><td></td></tr>
            <tr><th>T2</th><td class="lock">acquire ✅ (1)</td><td></td><td></td></tr>
            <tr><th>T3</th><td class="lock">acquire ✅ (0)</td><td></td><td></td></tr>
            <tr><th>T4</th><td class="wait">acquire: 0 permits → WAITING</td><td></td><td></td></tr>
          </table>`
        },
        {
          title: "Step 2: T2 ka SMS gaya, release (0 → 1), T4 jagta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>T1</th><td class="lock">acquire ✅</td><td class="run">SMS bhej raha</td><td></td></tr>
            <tr><th>T2</th><td class="lock">acquire ✅</td><td>release() 🔓</td><td></td></tr>
            <tr><th>T3</th><td class="lock">acquire ✅</td><td class="run">SMS bhej raha</td><td></td></tr>
            <tr><th>T4</th><td class="wait">WAITING</td><td class="wait">jaga</td><td class="lock">acquire ✅ (0)</td></tr>
          </table><p>Ek waqt pe max 3 hi andar. Kis thread ne permit liya, Semaphore ye yaad nahi rakhta: sirf count.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "6 SMS jobs, Semaphore(2): ek saath kabhi 2 se zyada nahi (max concurrency track karo)",
      code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final Semaphore sms = new Semaphore(2);
    static final AtomicInteger inside = new AtomicInteger();
    static final AtomicInteger maxInside = new AtomicInteger();
    static final AtomicInteger sent = new AtomicInteger();

    static void sendOtp(int user) throws InterruptedException {
        sms.acquire();
        try {
            int now = inside.incrementAndGet();
            maxInside.accumulateAndGet(now, Math::max);
            Thread.sleep(20);                    // fake provider call
            sent.incrementAndGet();
            inside.decrementAndGet();
        } finally {
            sms.release();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(6);
        for (int u = 1; u <= 6; u++) {
            final int user = u;
            pool.submit(() -> { sendOtp(user); return null; });
        }
        pool.shutdown();
        pool.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("sent = " + sent.get());
        System.out.println("kabhi 2 se zyada ek saath? " + (maxInside.get() > 2));
        System.out.println("end mein free permits = " + sms.availablePermits());
    }
}`,
      note: "6 threads hain par provider pe load max 2. Asli machine pe <code>maxInside</code> aksar exactly 2 hoga; browser JVM (ek CPU) mein bhi 2 se upar kabhi nahi jaa sakta, wahi guarantee hai."
    },
    {
      type: "code",
      title: "tryAcquire(timeout) → 'busy' response; aur permit ka koi owner nahi (doosra thread release kar sakta hai)",
      code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Semaphore gpu = new Semaphore(1);

        gpu.acquire();                                   // main ne akela GPU slot le liya
        Thread other = new Thread(() -> {
            try {
                boolean got = gpu.tryAcquire(50, TimeUnit.MILLISECONDS);
                System.out.println("other: 50ms mein slot mila? " + got + (got ? "" : " → HTTP 429, baad mein try karo"));
            } catch (InterruptedException e) { }
        });
        other.start();
        other.join();

        // Ownership nahi: koi bhi thread release kar sakta hai
        Thread janitor = new Thread(gpu::release, "janitor");
        janitor.start();
        janitor.join();
        System.out.println("janitor ne release kiya (acquire kabhi nahi kiya): permits = " + gpu.availablePermits());

        // Bug: bina acquire ke release → permits initial se zyada
        gpu.release();
        System.out.println("extra release ke baad permits = " + gpu.availablePermits() + " (limit 1 thi!)");
    }
}`,
      note: "Official docs: release karne wale thread ne acquire kiya ho, aisa koi requirement nahi. Ye feature hai (ek thread acquire, doosra release: jaise request thread acquire kare, callback thread release), par galti se double release limit tod deta hai."
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b><ul><li><code>acquire()</code> ko <code>try</code> ke andar likha: acquire interrupt hua to bhi finally <code>release()</code> karega, aur permits badh jaayenge.</li><li><code>tryAcquire()</code> false aaya phir bhi finally mein release: wahi bug. Release sirf tab jab permit mila.</li><li>Semaphore(1) ko reentrant lock samajhna: same thread dobara <code>acquire()</code> kare to <b>khud se deadlock</b>, kyunki semaphore owner nahi jaanta.</li></ul>"
    },
    {
      type: "text",
      html: `
        <h2>Semaphore(1) vs Lock</h2>
        <table>
          <tr><th></th><th>Semaphore(1) (binary semaphore)</th><th>ReentrantLock / synchronized</th></tr>
          <tr><td>Owner</td><td>Nahi: koi bhi thread release kar sakta hai</td><td>Haan: sirf lock pakadne wala unlock kare (warna <code>IllegalMonitorStateException</code>)</td></tr>
          <tr><td>Reentrant</td><td>Nahi: dobara acquire = atak jaao</td><td>Haan</td></tr>
          <tr><td>Conditions (wait/await)</td><td>Nahi</td><td>Haan</td></tr>
          <tr><td>Kab</td><td>N resources ki counting, cross-thread signal (<code>Semaphore(0)</code>: ek release kare, doosra acquire)</td><td>Mutual exclusion (critical section)</td></tr>
        </table>
        <h3>Concurrency limit vs rate limit</h3>
        <p>Semaphore <b>ek saath kitne</b> (concurrency) limit karta hai, <b>per second kitne</b> (rate) nahi. Agar har SMS call 10ms ki hai, to Semaphore(3) ke saath bhi ~300 calls/second jaa sakti hain. "100 requests per second" chahiye to token bucket (rate limiter lesson) lagao.</p>`
    },
    {
      type: "quiz",
      q: "Ek thread <code>Semaphore s = new Semaphore(1)</code> pe <code>s.acquire()</code> karta hai, phir ek helper method mein dobara <code>s.acquire()</code> (same thread). Kya hoga?",
      options: [
        "Doosra acquire turant pass, kyunki same thread hai (reentrant)",
        "Thread hamesha ke liye wait karega, kyunki permits 0 hain aur semaphore ko owner ka pata nahi",
        "IllegalMonitorStateException",
        "Permits -1 ho jaayenge"
      ],
      answer: 1,
      why: "Semaphore sirf count rakhta hai, owner nahi. Same thread ka doosra acquire bhi 0 permits dekhta hai aur wait karta hai. Koi doosra release na kare to self-deadlock. Reentrancy chahiye to ReentrantLock."
    },
    {
      type: "exercise",
      id: "ex-conn-limiter",
      title: "Connection pool limiter: max N ek saath, timeout pe BUSY",
      level: "Medium",
      task: `<p><code>Solution(max)</code> ek database ke liye limiter hai. <code>call(work, timeoutMs)</code>:</p>
        <ul>
          <li>Max <code>timeoutMs</code> tak connection slot ka wait karo. Slot na mile to <code>"BUSY"</code> return karo (wait hamesha ke liye nahi).</li>
          <li>Slot mile to <code>work.get()</code> chalao aur uska result return karo. Ek saath max <code>max</code> works chal sakte hain.</li>
          <li><code>work</code> exception phenke to wo exception aage jaane do, par slot <b>wapas</b> hona chahiye.</li>
          <li>BUSY wale case mein koi slot release mat karo.</li>
        </ul>
        <p><code>available()</code> abhi free slots return kare. Harness kai threads se calls karke check karta hai ki limit kabhi nahi tooti aur end mein saare slots wapas aaye.</p>`,
      examples: "<code>max=2</code>: do calls andar atki hain → teesri <code>call(w, 50)</code> ~50ms baad <code>\"BUSY\"</code><br>work ne exception phenka → <code>available()</code> phir bhi 2",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.*;
import java.util.function.Supplier;

class Solution {
    private final int max;

    Solution(int max) {
        this.max = max;
    }

    String call(Supplier<String> work, long timeoutMs) throws InterruptedException {
        return work.get();   // TODO: Semaphore se limit
    }

    int available() {
        return max;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.Supplier;

public class Main {
    static final List<CountDownLatch> gates = Collections.synchronizedList(new ArrayList<>());

    static Thread daemon(Runnable r) {
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.start();
        return t;
    }

    // n slots ko gate ke peeche atka do; return gate
    static CountDownLatch hold(Solution s, int n) {
        CountDownLatch gate = new CountDownLatch(1), entered = new CountDownLatch(n);
        gates.add(gate);
        for (int i = 0; i < n; i++) {
            daemon(() -> {
                try {
                    s.call(() -> {
                        entered.countDown();
                        try { gate.await(); } catch (InterruptedException e) { }
                        return "held";
                    }, 1000);
                } catch (InterruptedException e) { }
            });
        }
        try { entered.await(1, TimeUnit.SECONDS); } catch (InterruptedException e) { }
        return gate;
    }

    // call ko alag thread mein, taaki bina timeout wala acquire harness na atkaaye
    static String guardedCall(Solution s, Supplier<String> work, long timeoutMs) {
        AtomicReference<String> out = new AtomicReference<>("atak gaya: timeout use nahi kiya?");
        Thread t = daemon(() -> {
            try { out.set(s.call(work, timeoutMs)); } catch (Exception e) { out.set("💥 " + e); }
        });
        try { t.join(1000); } catch (InterruptedException e) { }
        return out.get();
    }

    public static void main(String[] args) {
        Check.eq("free hai: [result, available]", List.of("OK", 2), () -> {
            Solution s = new Solution(2);
            return List.of(guardedCall(s, () -> "OK", 100), s.available());
        });
        Check.eq("max 2, dono busy → BUSY", "BUSY", () -> {
            Solution s = new Solution(2);
            CountDownLatch gate = hold(s, 2);
            String r = guardedCall(s, () -> "should not run", 50);
            gate.countDown();
            return r;
        });
        Check.hiddenFromHere();
        Check.eq("BUSY ke baad slot release mat karo: available", 1, () -> {
            Solution s = new Solution(1);
            CountDownLatch gate = hold(s, 1);
            guardedCall(s, () -> "x", 30);
            gate.countDown();
            for (int i = 0; i < 100 && s.available() == 0; i++) {
                try { Thread.sleep(5); } catch (InterruptedException e) { }
            }
            try { Thread.sleep(20); } catch (InterruptedException e) { }
            return s.available();
        });
        Check.eq("work exception: [exception aage gaya, slot wapas]", List.of(true, 2), () -> {
            Solution s = new Solution(2);
            boolean thrown = false;
            try {
                s.call(() -> { throw new IllegalStateException("query fail"); }, 100);
            } catch (IllegalStateException e) {
                thrown = true;
            } catch (InterruptedException e) { }
            return List.of(thrown, s.available());
        });
        Check.eq("slot free hote hi wait karne wala andar", "OK", () -> {
            Solution s = new Solution(1);
            CountDownLatch gate = hold(s, 1);
            daemon(() -> {
                try { Thread.sleep(40); } catch (InterruptedException e) { }
                gate.countDown();
            });
            return guardedCall(s, () -> "OK", 800);
        });
        Check.eq("12 threads x 25 calls, max 3: [done, kabhi > 3?, available]", List.of(300, false, 3), () -> {
            Solution s = new Solution(3);
            AtomicInteger inside = new AtomicInteger(), max = new AtomicInteger(), done = new AtomicInteger();
            List<Thread> ts = new ArrayList<>();
            for (int t = 0; t < 12; t++) {
                ts.add(daemon(() -> {
                    for (int i = 0; i < 25; i++) {
                        try {
                            String r = s.call(() -> {
                                max.accumulateAndGet(inside.incrementAndGet(), Math::max);
                                Thread.yield();
                                inside.decrementAndGet();
                                return "ok";
                            }, 2000);
                            if ("ok".equals(r)) done.incrementAndGet();
                        } catch (InterruptedException e) { return; }
                    }
                }));
            }
            long deadline = System.currentTimeMillis() + 3000;
            for (Thread t : ts) {
                try { t.join(Math.max(1, deadline - System.currentTimeMillis())); } catch (InterruptedException e) { }
            }
            return List.of(done.get(), max.get() > 3, s.available());
        });
        for (CountDownLatch g : gates) g.countDown();
    }
}`,
      hints: [
        "Field: <code>private final Semaphore slots;</code> constructor mein <code>new Semaphore(max)</code>. <code>available()</code> = <code>slots.availablePermits()</code>.",
        "<code>if (!slots.tryAcquire(timeoutMs, TimeUnit.MILLISECONDS)) return \"BUSY\";</code> Ye <b>try ke bahar</b>, taaki BUSY pe release na ho.",
        "Uske baad <code>try { return work.get(); } finally { slots.release(); }</code>"
      ],
      solution: `import java.util.concurrent.*;
import java.util.function.Supplier;

class Solution {
    private final Semaphore slots;

    Solution(int max) {
        this.slots = new Semaphore(max);
    }

    String call(Supplier<String> work, long timeoutMs) throws InterruptedException {
        if (!slots.tryAcquire(timeoutMs, TimeUnit.MILLISECONDS)) {
            return "BUSY";                 // slot mila hi nahi, to release bhi nahi
        }
        try {
            return work.get();
        } finally {
            slots.release();               // success ya exception, slot wapas
        }
    }

    int available() {
        return slots.availablePermits();
    }
}`,
      explain: "<p><code>tryAcquire(timeout)</code> wait ko limit karta hai: DB pe load zyada ho to caller ko jaldi \"BUSY\" milta hai (fail fast), threads hamesha ke liye line mein nahi lagte. Release sirf us raaste pe hai jahan permit mila, isliye permits kabhi max se upar nahi jaate. finally se exception pe bhi slot wapas.</p><p>Har call O(1) + wait. Asli connection pools (HikariCP jaise) andar isi tarah ka bounded wait (connectionTimeout) rakhte hain.</p>"
    },
    {
      type: "think",
      id: "think-semaphore",
      q: "Interview question: <b>\"Ek payment gateway max 20 concurrent requests allow karta hai. Aapki service mein 200 threads hain. Kaise limit karoge? Semaphore aur fixed thread pool (20 threads) mein kya farak hai?\"</b>",
      rubric: [
        { point: "<b>Semaphore(20)</b>: acquire/release around call, release <b>finally</b> mein", keys: ["semaphore", "acquire", "release", "permit", "finally"], weight: 2 },
        { point: "<b>tryAcquire(timeout)</b>: hamesha wait nahi, fail fast / 503 / fallback", keys: ["tryacquire", "timeout", "fail fast", "503", "429", "fallback"], weight: 2 },
        { point: "Pool vs semaphore: pool alag threads + queue (caller async), semaphore caller ke thread pe hi limit", keys: ["caller thread", "same thread", "queue", "async", "alag threads", "bulkhead"] },
        { point: "Concurrency limit ≠ <b>rate limit</b> (per second ke liye token bucket)", keys: ["rate limit", "per second", "token bucket", "rate", "concurrency limit"] },
        { point: "Permits ka koi owner nahi: double release bug, non-reentrant", keys: ["owner", "ownership", "double release", "reentrant", "koi bhi thread"] }
      ],
      answer: `<p><b>Semaphore(20)</b> rakho. Har call: <code>if (!sem.tryAcquire(200, ms)) return fallback/503; try { call(); } finally { sem.release(); }</code>. Timeout zaroori hai, warna gateway slow hone pe 200 threads line mein atak jaayenge.</p>
        <p><b>Semaphore vs pool(20):</b> semaphore caller ke hi thread pe limit lagata hai (simple, synchronous code). Pool alag 20 threads aur ek queue deta hai: caller async ho jaata hai, aur queue size + rejection policy se overload control. Dono "bulkhead" pattern ke roop hain (Resilience4j mein dono type ke bulkhead hain).</p>
        <p><b>Dhyaan:</b> ye concurrency limit hai, rate limit nahi. "20 per second" chahiye to token bucket. Semaphore owner track nahi karta: double release limit tod deta hai, aur same thread ka doosra acquire khud ko atka deta hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Semaphore pe bolte waqt teen keywords zaroor bolo: <i>permits</i>, <i>no ownership</i>, <i>tryAcquire with timeout</i>. Aur agar interviewer \"rate limiting\" bole, to clarify karo: \"concurrent requests limit karni hai ya per-second rate?\" Ye sawaal poochna hi plus point hai."
    }
  ],
  references: [
    { title: "Semaphore (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Semaphore.html", type: "docs" },
    { title: "Oracle Java Tutorial: Concurrency", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.5.3: Semaphores)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
