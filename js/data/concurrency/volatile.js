// volatile aur visibility
registerLesson("concurrency", "volatile", {
  why: "'volatile kya karta hai?' aur 'volatile se count++ safe ho jaata hai?' classic questions hain. Double-checked locking singleton mein volatile kyun chahiye, ye senior rounds mein poocha jaata hai. Iske peeche ka idea (visibility, happens-before) har concurrency bug samjhne ki chaabi hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: ek thread ne likha, doosre ko dikha hi nahi</h2>
        <p>Race condition mein do threads ek doosre ka update overwrite karte the. Yahan problem alag hai: thread A ne value badli, par thread B ko <b>purani value hi dikhti rehti hai</b>, shayad hamesha ke liye.</p>
        <p>Kyun? Har core ke paas apna fast <b>cache</b> (L1/L2) aur registers hote hain. Upar se JIT compiler code ko optimize karta hai: agar use lagta hai ki loop ke andar variable koi nahi badalta, to wo usko <b>ek baar padh ke</b> register mein rakh leta hai.</p>
        <pre class="diagram">
   Core 1 (Thread A)            Core 2 (Thread B)
   +----------------+           +----------------+
   | register/cache |           | register/cache |
   | running=false  |           | running=true   |  &lt;-- purani copy
   +-------+--------+           +-------+--------+
           |                            |
   ========+======= Main memory (RAM) ==+=========
                   running = false</pre>
        <p>Java Memory Model (JLS chapter 17) ke hisaab se: bina synchronization ke, ek thread ka write doosre thread ko <b>kab</b> dikhega (ya dikhega bhi ya nahi), iski koi guarantee nahi.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Classic bug: stop flag</h2>
        <pre class="code-static">class Poller {
    private boolean running = true;     // volatile NAHI

    void stop() { running = false; }    // thread A (shutdown hook)

    void loop() {                        // thread B
        while (running) {
            // kuch kaam jo 'running' ko nahi chhoota
        }
    }
}</pre>
        <p>JIT is loop ko aise bana sakta hai: <code>if (running) { while (true) { ... } }</code>. Ab <code>stop()</code> call karo, thread B kabhi nahi rukega. Ye bug HotSpot pe sach mein hota hai, khaas kar jab loop ki body khaali ya simple ho. Hum isko yahan run nahi kar rahe, kyunki program kabhi khatam nahi hota.</p>
        <p><b>Fix:</b> <code>private volatile boolean running = true;</code></p>`
    },
    {
      type: "steps",
      title: "Visualizer: stop flag bina volatile vs volatile ke saath",
      steps: [
        {
          title: "Bina volatile: B apni copy padhta rehta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>A (main)</th><td></td><td class="run">running = false</td><td></td><td></td><td></td></tr>
            <tr><th>B (poller)</th><td class="run">read: true</td><td class="run">cached: true</td><td class="block">cached: true</td><td class="block">cached: true</td><td class="block">... hamesha</td></tr>
          </table><p>A ka write B tak pahunchne ki koi guarantee nahi. B kabhi nahi rukta.</p>`
        },
        {
          title: "volatile ke saath: har read main memory se, write turant visible",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>A (main)</th><td></td><td class="lock">volatile write: false</td><td></td><td></td></tr>
            <tr><th>B (poller)</th><td class="run">volatile read: true</td><td class="run">kaam</td><td class="lock">volatile read: false</td><td>loop se bahar ✅</td></tr>
          </table><p>volatile write ke baad us variable ka har volatile read naya value dekhta hai. Aur write se pehle A ne jo bhi likha tha, wo bhi B ko dikhta hai (happens-before).</p>`
        }
      ]
    },
    {
      type: "code",
      title: "volatile stop flag: worker turant rukta hai",
      code: `public class Main {
    static volatile boolean running = true;
    static long work = 0; // sirf worker likhta hai

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (running) {
                work++;           // kaam
                try { Thread.sleep(1); } catch (InterruptedException e) { return; }
            }
        }, "worker");
        worker.start();

        Thread.sleep(50);
        running = false;          // volatile write
        worker.join(1000);        // max 1s ruko

        System.out.println("Worker ruk gaya? " + !worker.isAlive());
        System.out.println("Kuch kaam hua? " + (work > 0)); // join ke baad work dikhna guaranteed
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>happens-before (simple version)</h2>
        <p>JMM ek rule deta hai: agar action X <b>happens-before</b> action Y, to X ne jo likha wo Y ko dikhega. Kuch zaroori rules:</p>
        <table>
          <tr><th>Rule</th><th>Matlab</th></tr>
          <tr><td>Program order</td><td>Ek hi thread mein upar wali line neeche wali se pehle</td></tr>
          <tr><td>Monitor lock</td><td>Ek lock ka <code>unlock</code> → usi lock ka agla <code>lock</code></td></tr>
          <tr><td>volatile</td><td>volatile variable ka write → usi variable ka baad wala read</td></tr>
          <tr><td>Thread start</td><td><code>t.start()</code> se pehle ka sab → t ke andar ka code</td></tr>
          <tr><td>Thread join</td><td>t ke andar ka sab → <code>t.join()</code> return hone ke baad</td></tr>
          <tr><td>Transitivity</td><td>X → Y aur Y → Z, to X → Z</td></tr>
        </table>
        <p>Transitivity ki wajah se volatile ek "flag" ki tarah kaam karta hai: data pehle normal tareeke se likho, phir volatile flag set karo. Jo thread flag dekhega, use data bhi pakka dikhega. Isko <b>safe publication</b> kehte hain.</p>`
    },
    {
      type: "code",
      title: "Safe publication: normal data + volatile flag",
      code: `public class Main {
    static int[] config;              // normal (non-volatile)
    static volatile boolean ready;    // flag

    public static void main(String[] args) throws InterruptedException {
        Thread reader = new Thread(() -> {
            while (!ready) {                         // volatile read
                try { Thread.sleep(1); } catch (InterruptedException e) { return; }
            }
            // ready=true dikha, to usse pehle ke saare writes bhi dikhenge
            System.out.println("reader ko config mila: timeout=" + config[0] + ", retries=" + config[1]);
        }, "reader");
        reader.start();

        Thread.sleep(20);
        config = new int[]{3000, 3};  // 1. data likho
        ready = true;                 // 2. phir volatile flag (publish)
        reader.join(1000);
        System.out.println("reader khatam? " + !reader.isAlive());
    }
}`,
      note: "Order ulta kar do (pehle <code>ready = true</code>, phir config) to reader ko <code>null</code> mil sakta hai. Flag hamesha <b>aakhri</b> write hona chahiye."
    },
    {
      type: "code",
      title: "volatile atomicity NAHI deta: volatile count++ ab bhi race",
      code: `public class Main {
    static volatile int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < 100_000; j++) count++; // har read/write visible, par read-add-write ab bhi 3 steps
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("Expected 400000, mila: " + count);
        System.out.println("volatile ne har read ko fresh banaya, par do threads ek hi fresh value padh ke dono +1 likh sakte hain.");
    }
}`,
      note: "Asli multi-core machine pe ye number har baar alag aa sakta hai (400000 se kam). Browser JVM ek CPU pe threads chalata hai, isliye yahan 400000 bhi aa sakta hai. Bug phir bhi hai."
    },
    {
      type: "text",
      html: `
        <h2>Kab kya use karein</h2>
        <table>
          <tr><th></th><th>volatile</th><th>synchronized / Lock</th><th>AtomicInteger etc.</th></tr>
          <tr><td>Visibility</td><td>Haan</td><td>Haan</td><td>Haan</td></tr>
          <tr><td>Atomic read-modify-write (count++)</td><td><b>Nahi</b></td><td>Haan</td><td>Haan (CAS)</td></tr>
          <tr><td>Kai variables ek saath</td><td>Nahi</td><td>Haan</td><td>Nahi (ek variable)</td></tr>
          <tr><td>Blocking</td><td>Kabhi nahi</td><td>Haan (doosre wait karte hain)</td><td>Nahi (retry loop)</td></tr>
          <tr><td>Best use</td><td>Stop flag, config reference swap, DCL singleton</td><td>Invariants (balance check + deduct)</td><td>Counters, sequence ids</td></tr>
        </table>
        <p>Rule: volatile tab kaafi hai jab <b>ek thread likhta hai</b> (ya write purani value pe depend nahi karta), aur baaki sirf padhte hain.</p>`
    },
    {
      type: "quiz",
      q: "Double-checked locking singleton mein <code>private static volatile Service instance;</code> mein volatile hata do to kya problem ho sakti hai?",
      options: [
        "Koi problem nahi, synchronized block kaafi hai",
        "Do instance ban jaayenge",
        "Doosra thread non-null reference dekh sakta hai jabki object ka constructor abhi poora nahi hua (reordering), aur adhoora object use kar lega",
        "Compile error"
      ],
      answer: 2,
      why: "<code>instance = new Service()</code> mein memory allocate, constructor chalana, reference assign: JIT/CPU inko reorder kar sakte hain. Bahar wala pehla <code>if (instance == null)</code> bina lock ke padhta hai, to wo adhoora object dekh sakta hai. volatile write-read happens-before deta hai, isliye constructor ke saare writes pehle dikhte hain."
    },
    {
      type: "pick",
      id: "pick-volatile-enough",
      q: "Kahan <b>sirf volatile</b> kaafi hai (koi lock/atomic nahi chahiye)?",
      options: [
        { text: "Shutdown flag: ek thread <code>running = false</code> karta hai, worker padhta hai", correct: true, why: "Ek writer, value purani value pe depend nahi karti." },
        { text: "Config reload: background thread naya immutable <code>Config</code> object bana ke reference swap karta hai", correct: true, why: "Reference ka write atomic hai, aur volatile se naya object poora dikhta hai (agar Config immutable hai)." },
        { text: "Page views counter jise 50 request threads badhate hain", correct: false, why: "Read-modify-write. AtomicLong/LongAdder chahiye." },
        { text: "<code>if (balance &gt;= amt) balance -= amt;</code> kai threads se", correct: false, why: "Check-then-act, lock chahiye." },
        { text: "Last heartbeat timestamp jo sirf ek thread likhta hai, monitoring thread padhta hai", correct: true, why: "Ek writer. Bonus: volatile long ka read/write atomic hota hai (non-volatile long/double pe JLS ye guarantee nahi deta)." }
      ],
      answer: "Volatile = visibility. Jahan bhi \"padho, phir uske basis pe likho\" hai aur kai writers hain, wahan atomic ya lock chahiye."
    },
    {
      type: "exercise",
      id: "ex-volatile-poller",
      title: "Metrics poller: do concurrency bugs theek karo",
      level: "Medium",
      task: `<p>Ek poller hai jo background mein chalta hai. Do problems hain:</p>
        <ol>
          <li><code>stop()</code> doosre thread se call hota hai. <code>running</code> flag ki <b>visibility</b> ki koi guarantee nahi.</li>
          <li><code>recordHit()</code> kai request threads se ek saath call hota hai. <code>hits</code> volatile hai, par increment <b>atomic</b> nahi.</li>
        </ol>
        <p>Dono theek karo. Field names <code>running</code> aur <code>hits</code> mat badlo (harness check karta hai ki <code>running</code> volatile ya <code>AtomicBoolean</code> hai). Worker loop safety ke liye max 2000 rounds chalta hai.</p>`,
      examples: "Worker start → <code>stop()</code> → 500ms ke andar band. 4 threads × 20000 <code>recordHit()</code> → <code>hits()</code> = <code>80000</code>",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.atomic.AtomicLong;

class Solution {
    private boolean running = true;
    private volatile long hits = 0;

    void stop() {
        running = false;
    }

    Runnable worker(AtomicLong rounds) {
        return () -> {
            for (int i = 0; i < 2000 && running; i++) {
                rounds.incrementAndGet();
                try { Thread.sleep(1); } catch (InterruptedException e) { return; }
            }
        };
    }

    void recordHit() {
        hits++;
    }

    long hits() {
        return hits;
    }
}`,
      harness: `import seekho.Check;
import java.lang.reflect.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.*;

public class Main {
    static String stops(long warmMs) {
        Solution s = new Solution();
        AtomicLong rounds = new AtomicLong();
        Thread t = new Thread(s.worker(rounds), "poller");
        t.setDaemon(true);
        t.start();
        try {
            Thread.sleep(warmMs);
            s.stop();
            t.join(500);
        } catch (InterruptedException e) { throw new RuntimeException(e); }
        return t.isAlive() ? "abhi bhi chal raha" : "ruk gaya";
    }

    static long hammer(int threads, int per) {
        Solution s = new Solution();
        CountDownLatch go = new CountDownLatch(1);
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int j = 0; j < per; j++) s.recordHit();
            });
            ts[i].setDaemon(true);
            ts[i].start();
        }
        go.countDown();
        try { for (Thread t : ts) t.join(3000); } catch (InterruptedException e) { throw new RuntimeException(e); }
        return s.hits();
    }

    static String runningFieldKind() {
        try {
            Field f = Solution.class.getDeclaredField("running");
            if (Modifier.isVolatile(f.getModifiers())) return "volatile";
            if (f.getType() == AtomicBoolean.class) return "volatile";
            return "plain (visibility guarantee nahi)";
        } catch (NoSuchFieldException e) {
            return "field 'running' nahi mila";
        }
    }

    public static void main(String[] args) {
        Check.eq("running field volatile (ya AtomicBoolean) hai?", "volatile", Main::runningFieldKind);
        Check.eq("stop() ke baad worker rukta hai", "ruk gaya", () -> stops(30));
        Check.eq("4 threads x 20000 recordHit()", 80000L, () -> hammer(4, 20000));
        Check.hiddenFromHere();
        Check.eq("turant stop()", "ruk gaya", () -> stops(0));
        Check.eq("koi hit nahi", 0L, () -> hammer(0, 0));
        Check.eq("8 threads x 10000 recordHit()", 80000L, () -> hammer(8, 10000));
    }
}`,
      hints: [
        "Bug 1 ke liye ek keyword kaafi hai.",
        "Bug 2: volatile ke saath bhi <code>hits++</code> read-add-write hai. <code>AtomicLong</code> (ya <code>LongAdder</code>) use karo, ya <code>recordHit()</code> ko synchronized banao.",
        "<code>private final AtomicLong hits = new AtomicLong();</code> → <code>hits.incrementAndGet()</code> aur <code>hits.get()</code>."
      ],
      solution: `import java.util.concurrent.atomic.AtomicLong;

class Solution {
    private volatile boolean running = true;        // visibility
    private final AtomicLong hits = new AtomicLong(); // atomic increment

    void stop() {
        running = false;
    }

    Runnable worker(AtomicLong rounds) {
        return () -> {
            for (int i = 0; i < 2000 && running; i++) {
                rounds.incrementAndGet();
                try { Thread.sleep(1); } catch (InterruptedException e) { return; }
            }
        };
    }

    void recordHit() {
        hits.incrementAndGet();
    }

    long hits() {
        return hits.get();
    }
}`,
      explain: "<p><code>running</code>: ek writer (stop), ek reader (worker), value purani value pe depend nahi karti, isliye <b>volatile kaafi hai</b>.</p><p><code>hits</code>: kai writers aur read-modify-write, isliye <b>atomic</b> chahiye. Bahut zyada threads ho to <code>LongAdder</code> aur bhi tez hai (contention kam). Dono O(1).</p><p>Note: worker ke andar <code>sleep</code> hone se starter bhi shayad ruk jaata, par JMM iski guarantee nahi deta. Isliye harness field ka modifier bhi check karta hai.</p>"
    },
    {
      type: "think",
      id: "think-volatile-guarantees",
      q: "Interview question: <b>\"volatile kya guarantee karta hai aur kya nahi? Ek real example do jahan volatile sahi hai aur ek jahan galat.\"</b>",
      rubric: [
        { point: "<b>Visibility</b>: write turant baaki threads ko dikhta hai, cache/register se nahi padhta", keys: ["visibility", "visible", "dikhta", "main memory", "cache", "latest value"], weight: 2 },
        { point: "<b>Reordering</b> rokta hai / <b>happens-before</b> deta hai", keys: ["reorder", "happens-before", "happens before", "memory barrier", "fence"], weight: 2 },
        { point: "<b>Atomicity nahi</b> deta (count++ safe nahi)", keys: ["atomic nahi", "not atomic", "atomicity nahi", "count++", "compound", "read-modify-write"], weight: 2 },
        { point: "Sahi example: stop flag / DCL singleton / config reference", keys: ["flag", "singleton", "double check", "double-check", "shutdown", "config"] },
        { point: "Galat example: counter → AtomicInteger/synchronized", keys: ["atomicinteger", "atomiclong", "synchronized", "counter", "longadder"] }
      ],
      answer: `<p><b>Guarantee karta hai:</b></p>
        <ul>
          <li><b>Visibility</b>: volatile write ke baad har thread ka read naya value dekhega.</li>
          <li><b>Ordering</b>: volatile write se pehle ke saare writes, us variable ko padhne wale thread ko dikhte hain (happens-before). Ye ordering ek taraf ki hai: volatile write se <i>pehle</i> ke reads/writes uske baad nahi khisak sakte, aur volatile read ke <i>baad</i> ke reads/writes uske pehle nahi aa sakte. (Ulta allowed hai, isliye ise poora two-way fence mat samjho.)</li>
          <li><code>volatile long/double</code> ka read/write atomic hota hai (normal long pe JLS ye guarantee nahi deta).</li>
        </ul>
        <p><b>Guarantee nahi karta:</b> compound operations ki atomicity. <code>count++</code>, check-then-act volatile ke saath bhi race hai.</p>
        <p><b>Sahi:</b> shutdown flag, DCL singleton ka instance, immutable config object ka reference swap. <b>Galat:</b> request counter (AtomicLong/LongAdder lo), balance update (lock lo).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> volatile pe jawab do lines mein shuru karo: <i>\"volatile visibility aur ordering deta hai, atomicity nahi.\"</i> Phir happens-before ka naam lo aur DCL singleton ka example do. Ye teen cheezein sun ke interviewer samajh jaata hai ki aapko memory model ka idea hai."
    }
  ],
  references: [
    { title: "JLS Chapter 17: Threads and Locks (Memory Model)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html", type: "docs" },
    { title: "Oracle Java Tutorial: Memory Consistency Errors", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/memconsist.html", type: "docs" },
    { title: "Oracle Java Tutorial: Atomic Access", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/atomic.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 3: Sharing Objects)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
