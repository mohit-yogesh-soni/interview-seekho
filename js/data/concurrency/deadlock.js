// Deadlock, livelock, starvation
registerLesson("concurrency", "deadlock", {
  why: "'Deadlock kya hai, 4 conditions batao, kaise bachoge?' har concurrency interview mein aata hai. Bank transfer (A→B aur B→A ek saath) iska sabse common coding version hai, aur production mein deadlock ka matlab hai app chal rahi hai par kuch kar nahi rahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: do transfers, ulti direction mein</h2>
        <p>Synchronized lesson mein poore bank pe ek lock tha. Tez banane ke liye har account ka apna lock rakho: transfer mein dono accounts lock karo.</p>
        <pre class="code-static">void transfer(Account from, Account to, int amt) {
    synchronized (from) {
        synchronized (to) {
            from.balance -= amt;
            to.balance += amt;
        }
    }
}</pre>
        <p>Rahul Priya ko bhejta hai (<code>transfer(rahul, priya)</code>) aur usi pal Priya Rahul ko (<code>transfer(priya, rahul)</code>). Thread 1 ne Rahul ka lock liya, Thread 2 ne Priya ka. Ab dono ek doosre ka lock maang rahe hain. Koi nahi chhodega. <b>Deadlock</b>: dono hamesha ke liye BLOCKED.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: deadlock banta kaise hai",
      steps: [
        {
          title: "Step 1: T1 ne lock A liya, T2 ne lock B",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1 (A→B)</th><td class="lock">🔒 A</td><td></td><td></td><td></td></tr>
            <tr><th>T2 (B→A)</th><td class="lock">🔒 B</td><td></td><td></td><td></td></tr>
          </table><p>Abhi tak sab theek. Dono ke paas ek ek lock.</p>`
        },
        {
          title: "Step 2: T1 ko B chahiye (T2 ke paas), T2 ko A chahiye (T1 ke paas)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1 (A→B)</th><td class="lock">🔒 A</td><td class="block">B chahiye: BLOCKED</td><td class="block">BLOCKED</td><td class="block">BLOCKED ...</td></tr>
            <tr><th>T2 (B→A)</th><td class="lock">🔒 B</td><td class="block">A chahiye: BLOCKED</td><td class="block">BLOCKED</td><td class="block">BLOCKED ...</td></tr>
          </table>
          <pre class="diagram">
   T1 --holds--> [A]          T1 --wants--> [B]
   T2 --holds--> [B]          T2 --wants--> [A]

        T1 ----wants B----&gt; T2
         ^                   |
         +-----wants A-------+     cycle = deadlock</pre>`
        },
        {
          title: "Step 3: Fix: dono pehle chhoti id wala lock lein (lock ordering)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>T1 (A→B)</th><td class="lock">🔒 A</td><td class="lock">🔒 B, transfer</td><td>🔓 B, A</td><td></td></tr>
            <tr><th>T2 (B→A)</th><td class="block">A chahiye (pehle A!)</td><td class="block">BLOCKED</td><td class="lock">🔒 A</td><td class="lock">🔒 B, transfer</td></tr>
          </table><p>T2 bhi pehle A maangta hai, B nahi. Jo A pakad leta hai wahi B tak pahunchta hai. Cycle ban hi nahi sakti.</p>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Deadlock ki 4 conditions (Coffman conditions)</h2>
        <p>Deadlock tabhi hota hai jab <b>chaaron ek saath</b> sach hon. Koi bhi ek todo, deadlock nahi hoga.</p>
        <table>
          <tr><th>Condition</th><th>Matlab</th><th>Kaise todein</th></tr>
          <tr><td><b>Mutual exclusion</b></td><td>Resource ek time pe ek hi thread ke paas</td><td>Lock hi na lo: immutable data, atomic/CAS, per-thread copy</td></tr>
          <tr><td><b>Hold and wait</b></td><td>Ek lock pakde hue doosra maangna</td><td>Saare locks ek saath lo, ya ek bhi na mile to sab chhodo (tryLock)</td></tr>
          <tr><td><b>No preemption</b></td><td>Lock zabardasti chheena nahi ja sakta</td><td><code>tryLock(timeout)</code> / <code>lockInterruptibly()</code>: haar maan ke chhod do</td></tr>
          <tr><td><b>Circular wait</b></td><td>T1 → T2 → ... → T1 ka cycle</td><td><b>Lock ordering</b>: sab threads locks ek fixed order mein lein (jaise account id)</td></tr>
        </table>
        <p>Practical mein sabse common fix <b>lock ordering</b> hai (circular wait todta hai), aur doosra <b>tryLock with timeout</b> (hold-and-wait / no-preemption todta hai).</p>`
    },
    {
      type: "code",
      title: "Deadlock banao, timeout se pakdo, aur interrupt karke todo",
      code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final ReentrantLock accountA = new ReentrantLock();
    static final ReentrantLock accountB = new ReentrantLock();

    static Thread transfer(String name, ReentrantLock first, ReentrantLock second, CountDownLatch bothHoldFirst) {
        Thread t = new Thread(() -> {
            try {
                first.lockInterruptibly();
                try {
                    bothHoldFirst.countDown();
                    bothHoldFirst.await();          // pakka karo ki dono ke paas pehla lock hai
                    try {
                        second.lockInterruptibly(); // yahan dono atak jaayenge
                    } catch (InterruptedException e) {
                        System.out.println(name + ": interrupt mila, apna lock chhod ke nikal raha hoon");
                        return;                     // finally pehla lock chhodega
                    }
                    try {
                        System.out.println(name + ": transfer ho gaya");
                    } finally {
                        second.unlock();
                    }
                } finally {
                    first.unlock();
                }
            } catch (InterruptedException e) {
                System.out.println(name + ": interrupt (pehla lock milne se pehle)");
            }
        }, name);
        t.setDaemon(true); // safety: kuch bhi ho, program exit kar sake
        t.start();
        return t;
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(2);
        Thread t1 = transfer("T1 (A->B)", accountA, accountB, latch);
        Thread t2 = transfer("T2 (B->A)", accountB, accountA, latch);

        t1.join(500);   // normal transfer microseconds leta hai; 500ms = kuch gadbad hai
        t2.join(50);
        if (t1.isAlive() && t2.isAlive()) {
            System.out.println("500ms baad bhi dono threads atke hain: DEADLOCK");
            System.out.println("T1 state: " + t1.getState() + ", A locked: " + accountA.isLocked());
            System.out.println("T2 state: " + t2.getState() + ", B locked: " + accountB.isLocked());
        }

        // Todne ka tareeka: ek thread ko 'victim' banao
        t1.interrupt();
        t1.join();
        t2.join();
        System.out.println("Deadlock toota. Dono threads khatam: " + (!t1.isAlive() && !t2.isAlive()));
    }
}`,
      note: "Latch se deadlock yahan har baar banta hai (deterministic). ReentrantLock waale threads <code>WAITING</code> dikhte hain (park), synchronized waale <code>BLOCKED</code>. <b>synchronized</b> ke saath ye todna possible nahi: monitor ka wait interrupt se nahi tootta, threads hamesha atke rehte. Isliye demo mein <code>lockInterruptibly()</code> use kiya."
    },
    {
      type: "code",
      title: "Fix: lock ordering. Dono direction mein 10,000 transfers, koi deadlock nahi",
      code: `public class Main {
    static class Account {
        final int id;
        int balance;
        Account(int id, int balance) { this.id = id; this.balance = balance; }
    }

    static void transfer(Account from, Account to, int amt) {
        Account first = from.id < to.id ? from : to;   // hamesha chhoti id pehle
        Account second = from.id < to.id ? to : from;
        synchronized (first) {
            synchronized (second) {
                if (from.balance >= amt) {
                    from.balance -= amt;
                    to.balance += amt;
                }
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Account rahul = new Account(1, 10_000), priya = new Account(2, 10_000);
        Thread t1 = new Thread(() -> { for (int i = 0; i < 10_000; i++) transfer(rahul, priya, 1); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 10_000; i++) transfer(priya, rahul, 1); });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        synchronized (rahul) {
            synchronized (priya) {
                System.out.println("Total: " + (rahul.balance + priya.balance) + " (hamesha 20000)");
            }
        }
        System.out.println("Dono threads khatam, koi deadlock nahi.");
    }
}`,
      note: "Id na ho to <code>System.identityHashCode()</code> se order kar sakte ho, par do objects ka hash same aa sakta hai. Tab ek teesra \"tie-breaker\" lock pehle lo. Real systems mein unique id (account number) sabse saaf hai."
    },
    {
      type: "text",
      html: `
        <h2>Livelock aur starvation</h2>
        <table>
          <tr><th></th><th>Kya hota hai</th><th>Example</th><th>Fix</th></tr>
          <tr><td><b>Deadlock</b></td><td>Threads ruk gaye, kuch nahi kar rahe (BLOCKED/WAITING)</td><td>A→B, B→A transfers</td><td>Lock ordering, tryLock timeout</td></tr>
          <tr><td><b>Livelock</b></td><td>Threads <b>chal rahe hain</b> (RUNNABLE, CPU use), par progress zero</td><td>Corridor mein do log: dono left hate, phir dono right... Code mein: dono tryLock fail, dono chhodo, dono same time retry</td><td><b>Random backoff</b> (jitter) retry se pehle</td></tr>
          <tr><td><b>Starvation</b></td><td>Ek thread ko resource kabhi milta hi nahi, baaki chal rahe hain</td><td>Non-fair lock mein naye threads baar baar aage nikal jaate hain; low-priority thread; bahut lamba lock pakadna</td><td>Fair lock (<code>new ReentrantLock(true)</code>), lock jaldi chhodo</td></tr>
        </table>`
    },
    {
      type: "quiz",
      q: "Har thread locks ko account id ke order mein leta hai (lock ordering). Ye Coffman ki kaunsi condition todta hai?",
      options: [
        "Mutual exclusion",
        "Hold and wait",
        "No preemption",
        "Circular wait"
      ],
      answer: 3,
      why: "Thread ab bhi ek lock pakad ke doosra maangta hai (hold and wait hai), aur locks exclusive hain. Par fixed order mein maangne se cycle (T1 → T2 → T1) ban hi nahi sakti."
    },
    {
      type: "pick",
      id: "pick-deadlock-fix",
      q: "Inme se kaunse tareeke deadlock <b>rokte</b> hain?",
      options: [
        { text: "Saare threads locks ek global order (id) mein lein", correct: true, why: "Circular wait khatam." },
        { text: "<code>tryLock(100, ms)</code>; na mile to pakde hue locks chhodo aur random delay ke baad retry", correct: true, why: "Hold-and-wait/no-preemption todta hai. Random delay livelock se bachata hai." },
        { text: "Thread priority badha do", correct: false, why: "Priority sirf scheduling hint hai, cycle nahi todti." },
        { text: "Lock pakde hue foreign/alien method (callback, listener) call mat karo", correct: true, why: "Unknown code apne locks le sakta hai aur aapke order ko tod sakta hai. Isko 'open call' kehte hain: lock chhod ke call karo." },
        { text: "Har shared variable ko volatile bana do", correct: false, why: "volatile lock nahi hai; locks wala deadlock waisa hi rahega (aur atomicity bhi nahi milegi)." },
        { text: "Nested locks hi avoid karo: ek time pe ek lock", correct: true, why: "Hold-and-wait hi nahi hoga. Kai baar design badal ke ye possible hota hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-deadlock-transfer",
      title: "Deadlock-free transfer (lock ordering)",
      level: "Medium",
      task: `<p><code>transfer(from, to, amount)</code> dono accounts pe <code>synchronized</code> lock leta hai. Starter code pehle <code>from</code> phir <code>to</code> lock karta hai, isliye ulti direction ke transfers ek saath chalein to deadlock hota hai. <code>Thread.yield()</code> deadlock window ko bada karta hai, use mat hatao.</p>
        <p>Ise theek karo taaki koi bhi direction ho, deadlock na ho. Paise kaafi na hon to transfer skip karo. Har account ki unique <code>id</code> hai.</p>
        <p>Harness daemon threads se ulti direction ke transfers chalata hai aur <code>join(timeout)</code> se check karta hai ki sab khatam hue (warna \"DEADLOCK\" report). Saath mein total paisa bhi check hota hai.</p>`,
      examples: "T1: 2000 × <code>transfer(a, b, 1)</code>, T2: 2000 × <code>transfer(b, a, 1)</code> → dono khatam, <code>a.balance + b.balance</code> same",
      userFile: "Solution.java",
      starter: `class Account {
    final int id;
    int balance;

    Account(int id, int balance) {
        this.id = id;
        this.balance = balance;
    }
}

class Solution {
    void transfer(Account from, Account to, int amount) {
        synchronized (from) {
            Thread.yield(); // deadlock window (mat hatao)
            synchronized (to) {
                if (from.balance >= amount) {
                    from.balance -= amount;
                    to.balance += amount;
                }
            }
        }
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Thread worker(Solution s, Account from, Account to, int times) {
        Thread t = new Thread(() -> { for (int i = 0; i < times; i++) s.transfer(from, to, 1); });
        t.setDaemon(true); // atak gaya to bhi program exit kare
        return t;
    }

    // ring: acc[i] -> acc[(i+1) % n], har thread ek edge. Return "khatam, total=X" ya "DEADLOCK"
    static String ring(int n, int times, int initial) {
        Solution s = new Solution();
        Account[] acc = new Account[n];
        for (int i = 0; i < n; i++) acc[i] = new Account(n - i, initial); // id ulti order mein, taaki index pe bharosa na ho
        List<Thread> ts = new ArrayList<>();
        for (int i = 0; i < n; i++) ts.add(worker(s, acc[i], acc[(i + 1) % n], times));
        if (n == 2) ts.add(worker(s, acc[1], acc[0], times));
        for (Thread t : ts) t.start();
        long deadline = System.currentTimeMillis() + 1000;
        try {
            for (Thread t : ts) t.join(Math.max(1, deadline - System.currentTimeMillis()));
        } catch (InterruptedException e) { throw new RuntimeException(e); }
        for (Thread t : ts) if (t.isAlive()) return "DEADLOCK (threads 1s baad bhi atke)";
        int total = 0;
        for (Account a : acc) total += a.balance;
        return "khatam, total=" + total;
    }

    public static void main(String[] args) {
        Check.eq("a->b aur b->a, 2000 baar", "khatam, total=200", () -> ring(2, 2000, 100));
        Check.eq("single thread: transfer(a, b, 30)", List.of(70, 130), () -> {
            Account a = new Account(1, 100), b = new Account(2, 100);
            new Solution().transfer(a, b, 30);
            return List.of(a.balance, b.balance);
        });
        Check.hiddenFromHere();
        Check.eq("paise kam: skip", List.of(10, 100), () -> {
            Account a = new Account(5, 10), b = new Account(3, 100);
            new Solution().transfer(a, b, 50);
            return List.of(a.balance, b.balance);
        });
        Check.eq("3 accounts ka cycle: a->b, b->c, c->a", "khatam, total=300", () -> ring(3, 2000, 100));
        Check.eq("5 accounts ka cycle", "khatam, total=5000", () -> ring(5, 2000, 1000));
        Check.eq("same account: transfer(a, a, 10)", 100, () -> {
            Account a = new Account(1, 100);
            new Solution().transfer(a, a, 10);
            return a.balance;
        });
    }
}`,
      hints: [
        "Deadlock tab hota hai jab threads locks <b>alag order</b> mein lete hain. Order fix karo.",
        "<code>Account first = from.id &lt; to.id ? from : to;</code> aur <code>second</code> doosra. Pehle <code>first</code> lock, phir <code>second</code>.",
        "Balance check aur update mein ab bhi <code>from</code>/<code>to</code> use karo (direction), sirf locking ka order id se aaye. <code>from == to</code> pe dono same object: reentrant lock hai, chalega."
      ],
      solution: `class Account {
    final int id;
    int balance;

    Account(int id, int balance) {
        this.id = id;
        this.balance = balance;
    }
}

class Solution {
    void transfer(Account from, Account to, int amount) {
        Account first = from.id < to.id ? from : to;   // global order: chhoti id pehle
        Account second = from.id < to.id ? to : from;
        synchronized (first) {
            Thread.yield();
            synchronized (second) {
                if (from.balance >= amount) {
                    from.balance -= amount;
                    to.balance += amount;
                }
            }
        }
    }
}`,
      explain: "<p>Har thread pehle chhoti id wala lock leta hai. Ab koi cycle nahi ban sakti, chahe 2 accounts hon ya 5 ka ring: jo thread sabse chhoti id ka lock pakad leta hai wo hamesha aage badh sakta hai. Ye <b>circular wait</b> condition todta hai.</p><p><code>from == to</code>: <code>first</code> aur <code>second</code> same object, aur synchronized reentrant hai, to koi problem nahi. Per transfer O(1).</p>"
    },
    {
      type: "think",
      id: "think-deadlock-prod",
      q: "Interview question: <b>\"Production mein service atki hui hai, CPU low hai, requests timeout ho rahi hain. Aapko deadlock ka shak hai. Kaise confirm karoge, aur aage se kaise rokoge?\"</b>",
      rubric: [
        { point: "<b>Thread dump</b> lo (jstack / jcmd Thread.print / kill -3) aur BLOCKED threads dekho", keys: ["thread dump", "jstack", "jcmd", "kill -3", "dump"], weight: 2 },
        { point: "Dump mein \"Found one Java-level deadlock\", ya <b>ThreadMXBean.findDeadlockedThreads()</b>", keys: ["found one java-level deadlock", "threadmxbean", "finddeadlocked", "waiting to lock", "deadlock detect"] },
        { point: "<b>Lock ordering</b> (global order, jaise id)", keys: ["lock ordering", "order", "ordering", "same order", "id se"], weight: 2 },
        { point: "<b>tryLock with timeout</b> + backoff, lockInterruptibly", keys: ["trylock", "timeout", "backoff", "lockinterruptibly"], weight: 2 },
        { point: "Lock ke andar foreign calls/I/O mat karo, locks kam aur chhote rakho", keys: ["open call", "callback", "lock ke andar", "chhota", "nested", "kam locks", "i/o"] }
      ],
      answer: `<p><b>Confirm:</b> <code>jstack &lt;pid&gt;</code> (ya <code>jcmd &lt;pid&gt; Thread.print</code>) se thread dump lo, 2-3 baar kuch second ke gap pe. JVM khud intrinsic/ReentrantLock deadlock detect karke \"Found one Java-level deadlock\" print karta hai, saath mein kaunsa thread kaunsa lock pakde hai aur kaunsa maang raha hai. Code se: <code>ManagementFactory.getThreadMXBean().findDeadlockedThreads()</code> ko health check mein laga sakte ho.</p>
        <p><b>Rokna:</b></p>
        <ol>
          <li><b>Lock ordering</b>: kai locks chahiye to hamesha ek global order (account id) mein lo.</li>
          <li><b>tryLock(timeout)</b>: na mile to sab chhodo, random backoff ke baad retry (livelock se bachne ke liye random).</li>
          <li>Lock pakde hue unknown code (listeners, callbacks) ya slow I/O mat chalao.</li>
          <li>Design se nested locks hatao: ek lock, immutable data, ya single-writer (queue + ek thread).</li>
        </ol>
        <p>Note: DB mein bhi same cheez hoti hai (row locks); databases deadlock detect karke ek transaction ko abort kar dete hain.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Chaaron Coffman conditions naam se bolo (mutual exclusion, hold and wait, no preemption, circular wait), phir har ek ke saamne ek fix. Bank transfer ka lock-ordering code 5 line mein likh ke dikha do. Ye combo (theory + code) almost hamesha full marks deta hai."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Deadlock", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html", type: "docs" },
    { title: "Oracle Java Tutorial: Starvation and Livelock", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/starvelive.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 10: Avoiding Liveness Hazards)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
