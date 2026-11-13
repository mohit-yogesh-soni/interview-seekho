// Race condition
registerLesson("concurrency", "race-condition", {
  why: "Concurrency ki sabse common bug. Interview mein 'count++ thread-safe kyun nahi hai?' lagbhag pakka aata hai, aur LLD rounds (BookMyShow seat booking, wallet balance) mein check-then-act race pakadna hi asli test hota hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: IRCTC ka last seat counter</h2>
        <p>Maan lo ek shared counter hai: <code>bookings</code>. Do users ek saath book karte hain, dono threads <code>bookings++</code> karte hain. Expected: 2 badhe. Kabhi kabhi sirf 1 badhta hai. Kyun?</p>
        <p><code>count++</code> ek line hai, par CPU ke liye <b>3 alag kaam</b> hain:</p>
        <pre class="code-static">count++   ==&gt;   1. READ   : memory se count padho   (getfield)
                2. ADD    : usme 1 jodo             (iadd)
                3. WRITE  : wapas memory mein likho (putfield)</pre>
        <p>Do threads ke ye 3 steps aapas mein <b>interleave</b> (mix) ho sakte hain. Scheduler kisi bhi step ke beech thread ko rok sakta hai, aur multi-core pe dono sach mein ek saath chal rahe hote hain.</p>
        <p><b>Race condition</b> = program ka result is baat pe depend kare ki threads kis timing/order mein chale.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: T1 aur T2 dono count++ karte hain (count = 5 se shuru)",
      steps: [
        {
          title: "Step 1: T1 READ karta hai: 5",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5</td><td></td><td></td><td></td></tr>
            <tr><th>T2</th><td></td><td></td><td></td><td></td></tr>
            <tr><th>count</th><td>5</td><td></td><td></td><td></td></tr>
          </table><p>T1 ke register mein 5 aaya. Abhi scheduler T1 ko rok deta hai (time slice khatam).</p>`
        },
        {
          title: "Step 2: T2 bhi READ karta hai: 5 (T1 ne abhi likha nahi)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5</td><td class="wait">ruka hua</td><td></td><td></td></tr>
            <tr><th>T2</th><td></td><td class="run">read 5</td><td></td><td></td></tr>
            <tr><th>count</th><td>5</td><td>5</td><td></td><td></td></tr>
          </table><p>Dono ke paas purani value 5 hai. Bug yahin ho chuka hai.</p>`
        },
        {
          title: "Step 3: T2 add + WRITE: count = 6",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5</td><td class="wait">ruka hua</td><td class="wait">ruka hua</td><td></td></tr>
            <tr><th>T2</th><td></td><td class="run">read 5</td><td class="run">write 6</td><td></td></tr>
            <tr><th>count</th><td>5</td><td>5</td><td class="lock">6</td><td></td></tr>
          </table>`
        },
        {
          title: "Step 4: T1 wapas aata hai, apni purani 5 + 1 = 6 likhta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1</th><td class="run">read 5</td><td class="wait">ruka hua</td><td class="wait">ruka hua</td><td class="run">write 6</td></tr>
            <tr><th>T2</th><td></td><td class="run">read 5</td><td class="run">write 6</td><td></td></tr>
            <tr><th>count</th><td>5</td><td>5</td><td>6</td><td class="block">6 (7 hona tha!)</td></tr>
          </table><p>Do increments hue, count sirf 1 badha. T2 ka update <b>kho gaya</b> (lost update). Isko critical section kehte hain: read se write tak ka hissa jahan ek time pe sirf ek thread hona chahiye.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Race chala ke dekho: 4 threads × 1,00,000 count++",
      code: `public class Main {
    static int count = 0; // shared, koi protection nahi

    public static void main(String[] args) throws InterruptedException {
        int threads = 4, perThread = 100_000;
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < perThread; j++) count++; // read-add-write, atomic nahi
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();

        int expected = threads * perThread;
        System.out.println("Expected: " + expected);
        System.out.println("Actual:   " + count);
        System.out.println("Kho gaye updates: " + (expected - count));
        System.out.println("Agar 0 kho gaye: threads shayad ek ke baad ek chale (jaise 1 CPU wala browser JVM). Bug phir bhi hai, bas is run mein timing ne bacha liya.");
    }
}`,
      note: "Asli multi-core machine pe ye number har baar alag aa sakta hai (aksar 400000 se kaafi kam). Browser ka JVM threads ko ek CPU pe chalata hai, isliye yahan race kam dikhti hai. Timeline (upar) wahi dikhata hai jo multi-core pe hota hai."
    },
    {
      type: "text",
      html: `
        <h2>Race ke 2 common shape</h2>
        <table>
          <tr><th>Pattern</th><th>Code</th><th>Real example</th></tr>
          <tr><td><b>Read-modify-write</b></td><td><code>count++</code>, <code>balance = balance - amt</code></td><td>Likes counter, wallet balance</td></tr>
          <tr><td><b>Check-then-act</b></td><td><code>if (seat.isFree()) seat.book(user);</code></td><td>BookMyShow pe ek seat do logon ko, lazy singleton do baar bana</td></tr>
        </table>
        <p>Check-then-act mein check aur act ke beech doosra thread wahi check pass kar leta hai. Dono "seat free hai" dekhte hain, dono book kar dete hain.</p>
        <p><b>Critical section</b> = code ka wo hissa jo shared data ko padhta + likhta hai, aur jise ek time pe sirf ek thread chalana chahiye. Fix ka matlab: is hisse ko <b>atomic</b> banana (ya to poora hoga, ya bilkul nahi, beech mein koi nahi ghusega).</p>`
    },
    {
      type: "code",
      title: "Check-then-act: 1 seat, 5 log. Kitne logon ko 'booked' mila?",
      code: `import java.util.*;

public class Main {
    static String seatOwner = null; // null = seat free
    static List<String> confirmed = Collections.synchronizedList(new ArrayList<>());

    static void book(String user) {
        if (seatOwner == null) {         // CHECK
            Thread.yield();              // race window: doosre thread ko yahan ghusne ka mauka
            seatOwner = user;            // ACT
            confirmed.add(user);         // user ko SMS chala gaya: "seat confirmed"
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] ts = new Thread[5];
        for (int i = 0; i < 5; i++) {
            String user = "user" + i;
            ts[i] = new Thread(() -> book(user));
        }
        for (Thread t : ts) t.start();
        for (Thread t : ts) t.join();

        System.out.println("Seat kiske naam: " + seatOwner);
        System.out.println("Confirmation SMS kitno ko gaya: " + confirmed.size() + " (sahi answer 1 hai)");
        System.out.println("1 se zyada aaya to double booking hui. 1 aaya to is baar timing ne bacha liya.");
    }
}`,
      note: "Asli multi-core machine pe ye number har baar alag aa sakta hai. <code>Thread.yield()</code> sirf race window ko bada karta hai taaki bug jaldi dikhe; bina yield ke bhi bug hai, bas kam baar dikhta hai."
    },
    {
      type: "quiz",
      q: "<code>volatile int count;</code> pe 2 threads <code>count++</code> karte hain. Kya ab ye thread-safe hai?",
      options: [
        "Haan, volatile har operation ko atomic bana deta hai",
        "Nahi. volatile sirf visibility deta hai; read-add-write ab bhi 3 alag steps hain, beech mein doosra thread ghus sakta hai",
        "Haan, par sirf 2 threads tak",
        "Compile error: volatile ke saath ++ allowed nahi"
      ],
      answer: 1,
      why: "volatile guarantee karta hai ki har read latest value dekhe. Par do threads dono latest 5 padh ke dono 6 likh sakte hain. Atomic increment ke liye <code>synchronized</code> ya <code>AtomicInteger</code> chahiye."
    },
    {
      type: "pick",
      id: "pick-races",
      q: "Kai threads ek hi object use kar rahe hain. Inme se kaunsa code <b>race condition</b> wala hai (bina kisi lock ke)?",
      options: [
        { text: "<code>if (!map.containsKey(k)) map.put(k, v);</code> (HashMap)", correct: true, why: "Check-then-act. Dono threads containsKey false dekh sakte hain. Upar se HashMap khud bhi thread-safe nahi." },
        { text: "<code>balance -= amount;</code>", correct: true, why: "Read-modify-write, count++ jaisa hi." },
        { text: "<code>if (instance == null) instance = new Service();</code>", correct: true, why: "Lazy init race: do objects ban sakte hain." },
        { text: "<code>final List&lt;String&gt; names = List.of(\"a\", \"b\");</code> ko sirf padhna", correct: false, why: "Immutable data sirf padhne mein koi race nahi. Isliye immutability concurrency ka best friend hai." },
        { text: "Har thread ke andar local variable <code>int x = 0; x++;</code>", correct: false, why: "Local variables har thread ke apne stack pe hote hain, share nahi hote." }
      ],
      answer: "Race tab hoti hai jab <b>shared + mutable</b> data ho aur kam se kam ek thread likhe. Shared nahi (local) ya mutable nahi (immutable) to race nahi."
    },
    {
      type: "code",
      title: "Fix preview: synchronized aur AtomicInteger dono se hamesha 400000",
      code: `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static int syncCount = 0;
    static final Object lock = new Object();
    static final AtomicInteger atomicCount = new AtomicInteger();

    public static void main(String[] args) throws InterruptedException {
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < 100_000; j++) {
                    synchronized (lock) {        // critical section: ek time pe ek thread
                        syncCount++;
                    }
                    atomicCount.incrementAndGet(); // CPU ka atomic instruction (CAS)
                }
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("synchronized: " + syncCount);
        System.out.println("AtomicInteger: " + atomicCount.get());
    }
}`,
      note: "Ye har machine pe har baar 400000 dega. Agle lessons mein <code>synchronized</code> aur <code>AtomicInteger</code> (CAS) detail mein."
    },
    {
      type: "exercise",
      id: "ex-safe-counter",
      title: "Likes counter ko thread-safe banao",
      level: "Easy",
      task: `<p>Instagram post ka likes counter. <code>increment()</code> abhi teen alag steps mein likha hai: read, <code>Thread.yield()</code>, write. <code>yield()</code> race window ko bada karta hai taaki bug har baar pakda jaaye. <b>yield ko mat hatao</b>, uske rehte hue counter ko sahi karo.</p>
        <p>Harness kai threads ek saath (ek latch se ek hi pal mein shuru karke) <code>increment()</code> karwata hai, sabko <code>join()</code> karta hai, phir <code>get()</code> check karta hai. Correct code pe answer hamesha exact aata hai.</p>`,
      examples: "4 threads × 2000 increments → <code>get()</code> = <code>8000</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    private int count = 0;

    void increment() {
        int current = count;   // 1. read
        Thread.yield();        // 2. race window (mat hatao)
        count = current + 1;   // 3. write
    }

    int get() {
        return count;
    }
}`,
      harness: `import seekho.Check;
import java.util.concurrent.CountDownLatch;

public class Main {
    static int hammer(int threads, int perThread) {
        Solution s = new Solution();
        CountDownLatch go = new CountDownLatch(1);
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int j = 0; j < perThread; j++) s.increment();
            });
            ts[i].setDaemon(true);
            ts[i].start();
        }
        go.countDown(); // sab ek saath shuru
        try {
            for (Thread t : ts) t.join(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return s.get();
    }

    public static void main(String[] args) {
        Check.eq("4 threads x 2000", 8000, () -> hammer(4, 2000));
        Check.eq("2 threads x 1000", 2000, () -> hammer(2, 1000));
        Check.hiddenFromHere();
        Check.eq("koi increment nahi", 0, () -> hammer(0, 0));
        Check.eq("1 thread x 500", 500, () -> hammer(1, 500));
        Check.eq("8 threads x 1000", 8000, () -> hammer(8, 1000));
        Check.eq("dobara: 4 threads x 2000", 8000, () -> hammer(4, 2000));
    }
}`,
      hints: [
        "Read se write tak ka hissa critical section hai. Ek time pe sirf ek thread andar hona chahiye.",
        "Method pe <code>synchronized</code> keyword lagao. <code>get()</code> pe bhi lagao, taaki padhne wala latest value dekhe.",
        "Alternative: <code>AtomicInteger</code> + <code>incrementAndGet()</code>, par tab bhi yield wali line ek lock ke andar honi chahiye, ya read-yield-write ko hata ke ek atomic call karna hoga."
      ],
      solution: `class Solution {
    private int count = 0;

    synchronized void increment() {
        int current = count;   // 1. read
        Thread.yield();        // 2. ab koi doosra thread is method mein nahi ghus sakta
        count = current + 1;   // 3. write
    }

    synchronized int get() {
        return count;
    }
}`,
      explain: "<p><code>synchronized</code> method pe lagane se ek time pe sirf ek thread <code>this</code> object ka lock pakad ke andar jaata hai. Doosre threads BLOCKED rehte hain. Read-yield-write ab beech mein toot nahi sakta.</p><p><code>get()</code> pe synchronized isliye ki lock chhodna aur pakadna visibility bhi deta hai: lock ke andar likha hua, agle lock lene wale ko dikhega. Har operation O(1), par threads lock ke liye line mein lagte hain.</p>"
    },
    {
      type: "think",
      id: "think-count-plus-plus",
      q: "Interview question: <b>\"count++ thread-safe kyun nahi hai? Isko fix karne ke kitne tareeke hain, aur kab kaunsa?\"</b>",
      rubric: [
        { point: "count++ = <b>read, add, write</b> 3 steps; atomic nahi", keys: ["read", "write", "3 step", "teen step", "atomic nahi", "not atomic", "non-atomic"], weight: 2 },
        { point: "Threads interleave karte hain to <b>lost update</b> hota hai", keys: ["lost update", "interleav", "overwrite", "kho", "beech mein"], weight: 2 },
        { point: "Fix 1: <b>synchronized</b> / Lock (critical section)", keys: ["synchronized", "lock", "mutex", "critical section"] },
        { point: "Fix 2: <b>AtomicInteger</b> / CAS (lock-free); bahut contention pe <b>LongAdder</b>", keys: ["atomicinteger", "atomic", "cas", "compareandset", "longadder"], weight: 2 },
        { point: "<b>volatile kaafi nahi</b> (sirf visibility)", keys: ["volatile kaafi nahi", "volatile nahi", "volatile not", "volatile sirf", "visibility"] }
      ],
      answer: `<p><code>count++</code> bytecode mein teen kaam hai: field padho, 1 jodo, wapas likho. Do threads dono 5 padh sakte hain aur dono 6 likh sakte hain, ek update kho jaata hai.</p>
        <p><b>Fix:</b></p>
        <ul>
          <li><code>synchronized</code> ya <code>ReentrantLock</code>: jab critical section mein ek se zyada variable ya bada logic ho (balance check + deduct).</li>
          <li><code>AtomicInteger.incrementAndGet()</code>: ek single variable ke liye, lock-free (CAS). Bahut zyada threads ek saath badha rahe hon (metrics counter) to <code>LongAdder</code>.</li>
          <li><code>volatile</code> <b>kaafi nahi</b>: sirf visibility deta hai, atomicity nahi.</li>
        </ul>
        <p>Senior point: <b>race condition</b> aur <b>data race</b> alag hain. Data race = bina happens-before ke same variable pe ek saath read/write. Race condition = result timing pe depend kare. Thread-safe map pe bhi <code>containsKey</code> phir <code>put</code> (do alag atomic calls) race condition hai; fix <code>putIfAbsent</code>/<code>computeIfAbsent</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> LLD round mein (BookMyShow, parking lot, wallet) jahan bhi \"agar free hai to book karo\" likhte ho, khud bolo: <i>\"Ye check-then-act hai, concurrent requests mein double booking hogi. Isko atomic banana padega: lock, DB row lock / unique constraint, ya compareAndSet.\"</i> Interviewer ke poochne se pehle bolna senior signal hai."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Thread Interference", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/interfere.html", type: "docs" },
    { title: "JLS Chapter 17: Threads and Locks", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 2: Thread Safety)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
