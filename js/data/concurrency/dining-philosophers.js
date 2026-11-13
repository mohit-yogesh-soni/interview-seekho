// Classic: Dining Philosophers
registerLesson("concurrency", "dining-philosophers", {
  why: "Dijkstra ka ye classic problem deadlock ki chaaro conditions ek saath dikhata hai. Interview mein (LeetCode 1226 bhi) poochte hain: deadlock kyun hota hai, aur kaunsi condition todke kaise fix karoge. Yahi soch bank transfer ya DB row locking mein lagti hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>5 philosophers gol table pe. Har do ke beech ek fork (total 5). Khaane ke liye <b>dono taraf ke forks</b> chahiye. Har philosopher: sochta hai → left fork uthata hai → right fork uthata hai → khaata hai → dono rakhta hai.</p>
        <pre class="diagram">
              P0
        F4         F0
     P4               P1
        F3         F1
          P3  F2  P2

 Pi ka left = F(i), right = F((i+1) % 5)</pre>
        <p><b>Deadlock scenario:</b> paanchon ek saath left fork utha lete hain. Ab har ek right fork ka wait kar raha hai, jo uske padosi ke haath mein hai. Koi nahi chhodega. Sab hamesha ke liye ruke.</p>
        <h3>Deadlock ki 4 conditions (Coffman), sab yahan hain</h3>
        <table>
          <tr><th>Condition</th><th>Yahan kaise</th><th>Todne ka tareeka</th></tr>
          <tr><td>Mutual exclusion</td><td>Ek fork ek hi ke paas</td><td>Aksar tod nahi sakte (resource hi aisa hai)</td></tr>
          <tr><td>Hold and wait</td><td>Left pakad ke right ka wait</td><td>Dono ek saath lo, warna kuch nahi (tryLock + chhod do)</td></tr>
          <tr><td>No preemption</td><td>Fork chheena nahi ja sakta</td><td>Timeout pe khud chhod do (tryLock with timeout)</td></tr>
          <tr><td>Circular wait</td><td>P0→P1→P2→P3→P4→P0 ka circle</td><td><b>Lock ordering</b>: hamesha chhote number wala fork pehle</td></tr>
        </table>
        <p>Koi bhi <b>ek</b> condition toot jaaye to deadlock possible nahi.</p>`
    },
    {
      type: "steps",
      title: "Deadlock aise banta hai (3 philosophers, 3 forks)",
      steps: [
        { title: "t1: teeno ne left fork uthaya", html: `<table class="lanes">
            <tr><th>P0</th><td class="lock">F0 ✋</td></tr><tr><th>P1</th><td class="lock">F1 ✋</td></tr><tr><th>P2</th><td class="lock">F2 ✋</td></tr></table>` },
        { title: "t2: sab right fork maangte hain", html: `<table class="lanes">
            <tr><th>P0</th><td class="block">F1 chahiye (P1 ke paas) → BLOCKED</td></tr>
            <tr><th>P1</th><td class="block">F2 chahiye (P2 ke paas) → BLOCKED</td></tr>
            <tr><th>P2</th><td class="block">F0 chahiye (P0 ke paas) → BLOCKED</td></tr></table>
            <p>Circle: P0 → P1 → P2 → P0. Deadlock.</p>` },
        { title: "Fix (lock ordering): P2 ka left F2, right F0. Chhota pehle → F0 pehle maangta hai", html: `<table class="lanes">
            <tr><th>P0</th><td class="lock">F0 ✋</td><td class="lock">F1 ✋ → khaata hai</td></tr>
            <tr><th>P1</th><td class="lock">F1? (P0 ke baad)</td><td class="wait">wait</td></tr>
            <tr><th>P2</th><td class="wait">F0 ka wait (F2 abhi uthaya hi nahi!)</td><td class="wait">wait</td></tr></table>
            <p>P2 ne F2 nahi pakda, isliye P1 ko F2 milega. Circle toot gaya: koi na koi hamesha aage badh sakta hai.</p>` }
      ]
    },
    {
      type: "code",
      title: "Deadlock detect karo (tryLock timeout) aur lock ordering se fix",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;

public class Main {
    static int run(int n, int meals, boolean ordered) throws InterruptedException {
        ReentrantLock[] forks = new ReentrantLock[n];
        for (int i = 0; i < n; i++) forks[i] = new ReentrantLock();
        AtomicInteger eaten = new AtomicInteger();
        CountDownLatch allHoldLeft = new CountDownLatch(n);   // deadlock pakka karne ke liye
        List<Thread> ts = new ArrayList<>();

        for (int p = 0; p < n; p++) {
            int left = p, right = (p + 1) % n;
            int first = ordered ? Math.min(left, right) : left;
            int second = ordered ? Math.max(left, right) : right;
            Thread t = new Thread(() -> {
                for (int m = 0; m < meals; m++) {
                    forks[first].lock();
                    try {
                        if (!ordered && m == 0) {               // sab pehla fork le lein, phir aage
                            allHoldLeft.countDown();
                            try { allHoldLeft.await(200, TimeUnit.MILLISECONDS); } catch (InterruptedException e) { return; }
                        }
                        // asli code mein lock(); yahan timeout taaki demo atke nahi
                        try {
                            if (!forks[second].tryLock(300, TimeUnit.MILLISECONDS)) return;  // atak gaya
                        } catch (InterruptedException e) { return; }
                        try {
                            eaten.incrementAndGet();            // khaana 🍝
                        } finally {
                            forks[second].unlock();
                        }
                    } finally {
                        forks[first].unlock();
                    }
                }
            });
            t.setDaemon(true);
            ts.add(t);
        }
        for (Thread t : ts) t.start();
        for (Thread t : ts) t.join(1500);
        return eaten.get();
    }

    public static void main(String[] args) throws InterruptedException {
        int n = 5, meals = 20;
        System.out.println("expected meals = " + n * meals);
        System.out.println("left-then-right : " + run(n, meals, false) + "  ← sab ne left pakda, right ka wait = deadlock (300ms baad haar maani)");
        System.out.println("lock ordering   : " + run(n, meals, true));
    }
}`,
      note: "Pehle run mein hum jaan-boojh ke sab philosophers ko left fork pakadne dete hain (latch se), taaki deadlock har baar dikhe. Asli bugs mein ye kabhi kabhi hota hai, wahi unhe khatarnak banata hai. <code>tryLock(timeout)</code> yahan sirf demo ko atakne se bachata hai."
    },
    {
      type: "text",
      html: `
        <h2>Solutions compare karo</h2>
        <table>
          <tr><th>Solution</th><th>Kaunsi condition todi</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td><b>Lock ordering</b> (resource hierarchy): chhota fork pehle</td><td>Circular wait</td><td>Simple, deadlock-free guaranteed</td><td>Saare locks ka global order chahiye</td></tr>
          <tr><td><b>Waiter / arbitrator</b>: <code>Semaphore(n - 1)</code>, ek saath max 4 table pe</td><td>Circular wait (5 ka circle ban hi nahi sakta)</td><td>Code mein chhota change</td><td>Ek extra synchronizer, thodi concurrency kam</td></tr>
          <tr><td><b>tryLock + back off</b>: right na mile to left chhodo, random wait, retry</td><td>Hold and wait / no preemption</td><td>Koi global order nahi chahiye</td><td><b>Livelock</b> possible (sab baar baar chhod ke retry), random backoff zaroori</td></tr>
          <tr><td><b>Asymmetric</b>: odd wale left pehle, even wale right pehle</td><td>Circular wait</td><td>Simple</td><td>Lock ordering ka hi roop</td></tr>
        </table>
        <div class="tip-box">🏦 <b>Real life:</b> Bank transfer <code>transfer(a, b)</code> aur <code>transfer(b, a)</code> ek saath = do philosophers. Fix wahi: account id ke order mein lock lo (<code>min(a.id, b.id)</code> pehle). DB mein bhi rows ko same order (jaise primary key) mein update karne se deadlocks kam hote hain.</div>`
    },
    {
      type: "quiz",
      q: "5 philosophers ke saath <code>Semaphore(4)</code> (max 4 ek saath table pe baith sakte) lagaya, aur sab left-then-right fork lete hain. Deadlock possible hai?",
      options: [
        "Haan, sab left le lenge",
        "Nahi. 4 philosophers aur 5 forks: pigeonhole se kam se kam ek ke paas dono forks aayenge, wo khaake chhodega",
        "Sirf tab jab fairness true ho",
        "Semaphore se starvation khatam ho jaati hai, deadlock nahi"
      ],
      answer: 1,
      why: "4 log, har ek ne ek fork liya to 1 fork bacha: wo kisi ek ka right fork hai, to wo kha sakta hai. Circle poora nahi ban sakta. (Starvation ka sawaal alag hai: fairness/scheduling pe depend.)"
    },
    {
      type: "pick",
      id: "pick-dp",
      q: "Kaunse statements sahi hain?",
      options: [
        { text: "Lock ordering se circular wait toot jaata hai, isliye deadlock nahi hota", correct: true, why: "Global order mein locks lene se wait-for graph mein cycle nahi ban sakta." },
        { text: "<code>tryLock</code> fail hone pe turant retry karna hamesha safe hai", correct: false, why: "Deadlock nahi, par livelock ho sakta hai: sab ek saath chhodte aur ek saath retry karte rehte hain. Random backoff chahiye." },
        { text: "Deadlock-free solution mein bhi kisi philosopher ko lambe time tak khaana na mile (starvation) ho sakta hai", correct: true, why: "Deadlock freedom aur starvation freedom alag guarantees hain. Fair locks / queueing se starvation kam hoti hai." },
        { text: "<code>synchronized</code> ke saath bhi lock ordering kaam karti hai", correct: true, why: "Ordering ek design rule hai, lock type se independent. Bas tryLock/timeout synchronized mein nahi milta." },
        { text: "Thread dump (jstack) deadlock detect nahi kar sakta", correct: false, why: "jstack / jcmd Thread.print 'Found one Java-level deadlock' report karta hai. ThreadMXBean.findDeadlockedThreads() bhi." }
      ]
    },
    {
      type: "exercise",
      id: "ex-dining",
      title: "Deadlock-free dining (forks ke beech pause ke saath bhi)",
      level: "Medium",
      task: `<p>Starter code mein har philosopher left fork leta hai, <code>pause()</code> karta hai (soch raha hai 🤔), phir right. Ye pause deadlock ko lagbhag pakka kar deta hai. <b>pause() mat hatao</b>: fork lene ka order ya tareeka badlo taaki koi deadlock na ho.</p>
        <p><code>dine(n, meals)</code>: <code>n</code> philosophers (threads), har ek <code>meals</code> baar khaaye. Saare threads join karke total meals return karo (expected <code>n × meals</code>). Ek philosopher tabhi khaaye jab uske paas dono forks hon. <code>n</code> ≥ 2.</p>
        <p><a href="https://leetcode.com/problems/the-dining-philosophers/" target="_blank">LeetCode 1226</a></p>`,
      examples: "<code>dine(5, 3)</code> → <code>15</code> (aur 2 second ke andar khatam)",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

class Solution {
    static void pause() {
        try { Thread.sleep(2); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    int dine(int n, int meals) throws InterruptedException {
        ReentrantLock[] forks = new ReentrantLock[n];
        for (int i = 0; i < n; i++) forks[i] = new ReentrantLock();
        AtomicInteger eaten = new AtomicInteger();
        List<Thread> ts = new ArrayList<>();
        for (int p = 0; p < n; p++) {
            int left = p, right = (p + 1) % n;
            Thread t = new Thread(() -> {
                for (int m = 0; m < meals; m++) {
                    forks[left].lock();
                    try {
                        pause();                       // mat hatao
                        forks[right].lock();
                        try {
                            eaten.incrementAndGet();
                        } finally {
                            forks[right].unlock();
                        }
                    } finally {
                        forks[left].unlock();
                    }
                }
            });
            ts.add(t);
            t.start();
        }
        for (Thread t : ts) t.join();
        return eaten.get();
    }
}`,
      harness: `import seekho.Check;
import java.util.concurrent.atomic.AtomicReference;

public class Main {
    static Object guarded(int n, int meals) {
        AtomicReference<Object> out = new AtomicReference<>("⛔ deadlock: 2 second mein khatam nahi hua");
        Thread t = new Thread(() -> {
            try { out.set(new Solution().dine(n, meals)); } catch (Exception e) { out.set("💥 " + e); }
        });
        t.setDaemon(true);
        t.start();
        try { t.join(2000); } catch (InterruptedException e) { }
        return out.get();
    }

    public static void main(String[] args) {
        Check.eq("dine(5, 3)", 15, () -> guarded(5, 3));
        Check.eq("dine(2, 5)", 10, () -> guarded(2, 5));
        Check.hiddenFromHere();
        Check.eq("dine(3, 10)", 30, () -> guarded(3, 10));
        Check.eq("dine(7, 5)", 35, () -> guarded(7, 5));
        Check.eq("dine(5, 0)", 0, () -> guarded(5, 0));
        Check.eq("dine(10, 4)", 40, () -> guarded(10, 4));
    }
}`,
      hints: [
        "Circular wait todo: har philosopher pehle <b>chhote index</b> wala fork le. <code>int first = Math.min(left, right), second = Math.max(left, right);</code>",
        "Sirf aakhri philosopher (jiska right = 0) ke liye order ulta hota hai. Baaki sab ke liye left hi chhota hai.",
        "<code>forks[first].lock(); try { pause(); forks[second].lock(); try { eat } finally { forks[second].unlock(); } } finally { forks[first].unlock(); }</code>. Daemon thread banane ki zaroorat nahi, ab sab khatam honge."
      ],
      solution: `import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

class Solution {
    static void pause() {
        try { Thread.sleep(2); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    int dine(int n, int meals) throws InterruptedException {
        ReentrantLock[] forks = new ReentrantLock[n];
        for (int i = 0; i < n; i++) forks[i] = new ReentrantLock();
        AtomicInteger eaten = new AtomicInteger();
        List<Thread> ts = new ArrayList<>();
        for (int p = 0; p < n; p++) {
            int left = p, right = (p + 1) % n;
            int first = Math.min(left, right);      // global order: chhota index pehle
            int second = Math.max(left, right);
            Thread t = new Thread(() -> {
                for (int m = 0; m < meals; m++) {
                    forks[first].lock();
                    try {
                        pause();
                        forks[second].lock();
                        try {
                            eaten.incrementAndGet();
                        } finally {
                            forks[second].unlock();
                        }
                    } finally {
                        forks[first].unlock();
                    }
                }
            });
            ts.add(t);
            t.start();
        }
        for (Thread t : ts) t.join();
        return eaten.get();
    }
}`,
      explain: "<p>Sabhi forks pe ek global order (index). Har thread order mein lock leta hai, isliye wait-for graph mein cycle nahi ban sakta: jo philosopher sabse bade fork ka wait kar raha hai, uska holder kisi aur cheez ka wait nahi kar raha, aur wo aage badhega. Starter mein P(n-1) left = n-1, right = 0 leta tha: wahi cycle band karta tha.</p><p>Doosre valid answers: <code>Semaphore(n-1)</code> waiter, ya <code>tryLock</code> + chhodo + random backoff.</p>"
    },
    {
      type: "think",
      id: "think-dp",
      q: "Interview question: <b>\"Production mein service atak gayi hai, CPU 0% hai, requests timeout ho rahi hain. Aapko deadlock ka shak hai. Kaise confirm aur fix karoge?\"</b>",
      rubric: [
        { point: "<b>Thread dump</b>: jstack / jcmd Thread.print; 'Found one Java-level deadlock'", keys: ["thread dump", "jstack", "jcmd", "thread.print", "found one"], weight: 2 },
        { point: "Dump mein BLOCKED threads aur 'waiting to lock / locked' se <b>cycle</b> pehchano", keys: ["blocked", "waiting to lock", "cycle", "kaun kiska", "locked"], weight: 2 },
        { point: "Fix: <b>lock ordering</b> (consistent order), ya lock scope chhota", keys: ["ordering", "order mein", "consistent order", "same order", "scope"], weight: 2 },
        { point: "Defensive: <b>tryLock timeout</b>, ThreadMXBean findDeadlockedThreads monitoring/alerts", keys: ["trylock", "timeout", "threadmxbean", "finddeadlocked", "monitor", "alert"] }
      ],
      answer: `<ol>
        <li><b>Confirm:</b> <code>jstack &lt;pid&gt;</code> ya <code>jcmd &lt;pid&gt; Thread.print</code>. JVM khud monitor/ReentrantLock deadlocks detect karke "Found one Java-level deadlock" ke saath threads aur locks print karta hai. 2-3 dumps kuch second ke gap pe lo: same threads same jagah BLOCKED = atke hue.</li>
        <li><b>Samjho:</b> har thread ki "waiting to lock X" aur "locked Y" lines se cycle banao (T1 holds A wants B, T2 holds B wants A).</li>
        <li><b>Turant:</b> restart (dukhi par zaroori). <b>Fix:</b> saare code paths mein locks ek consistent order mein (jaise id se), lock ke andar remote calls mat karo, lock scope chhota karo.</li>
        <li><b>Aage ke liye:</b> <code>tryLock(timeout)</code> jahan multiple locks lene hon, aur monitoring mein <code>ThreadMXBean.findDeadlockedThreads()</code> ka periodic check + alert.</li>
      </ol>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Dining philosophers pe solution dene se pehle Coffman ki 4 conditions bolo aur kaho \"main circular wait todunga lock ordering se\". Phir bonus: <i>\"tryLock approach mein livelock ka risk hai, isliye random backoff.\"</i> Aur real example (bank transfer ya DB rows) se jodo."
    }
  ],
  references: [
    { title: "The Dining Philosophers (LeetCode 1226)", by: "LeetCode", url: "https://leetcode.com/problems/the-dining-philosophers/", type: "article" },
    { title: "Oracle Java Tutorial: Deadlock (Liveness)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 10: Avoiding liveness hazards)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
