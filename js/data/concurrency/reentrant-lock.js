// ReentrantLock aur Condition
registerLesson("concurrency", "reentrant-lock", {
  why: "'synchronized hai to ReentrantLock kyun?' ek standard question hai. Jawab mein tryLock, timeout, interruptible wait, fairness aur multiple Conditions aane chahiye. Aur interviewer dekhta hai ki aap unlock() finally mein likhte ho ya nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>synchronized ki limits</h2>
        <ul>
          <li>Lock ka wait <b>hamesha ke liye</b>: "100ms mein na mile to chhod do" nahi bol sakte.</li>
          <li>BLOCKED thread ko <b>interrupt</b> karke nahi nikal sakte (deadlock lesson mein dekha).</li>
          <li><b>Fairness</b> ka control nahi.</li>
          <li>Ek object pe ek hi wait set: producers aur consumers dono ek hi jagah wait karte hain (isliye notifyAll).</li>
        </ul>
        <p><code>java.util.concurrent.locks.ReentrantLock</code> ye sab deta hai. Naam mein "reentrant": synchronized ki tarah same thread dobara lock le sakta hai (hold count badhta hai).</p>
        <pre class="code-static">private final ReentrantLock lock = new ReentrantLock();

void deposit(int amt) {
    lock.lock();          // try ke BAHAR
    try {
        balance += amt;   // critical section
    } finally {
        lock.unlock();    // hamesha, exception aaye tab bhi
    }
}</pre>`
    },
    {
      type: "code",
      title: "lock/unlock in finally: exact count + reentrancy (hold count)",
      code: `import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final ReentrantLock lock = new ReentrantLock();
    static int count = 0;

    static void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }

    static void outer() {
        lock.lock();
        try {
            System.out.println("outer: hold count = " + lock.getHoldCount());
            inner();  // same thread, same lock: reentrant
            System.out.println("outer (inner ke baad): hold count = " + lock.getHoldCount());
        } finally {
            lock.unlock();
        }
    }

    static void inner() {
        lock.lock();
        try {
            System.out.println("inner: hold count = " + lock.getHoldCount());
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < 10_000; j++) increment(); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("count = " + count + " (hamesha 40000)");

        outer();
        System.out.println("baad mein locked? " + lock.isLocked());
    }
}`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b><ul><li><code>unlock()</code> finally mein nahi: exception aaya to lock kabhi nahi chhootega, baaki saare threads hamesha ke liye atak jaayenge.</li><li><code>lock()</code> ko <code>try</code> ke <b>andar</b> likha: agar lock() hi fail hua to finally us lock ko unlock karega jo mila hi nahi (<code>IllegalMonitorStateException</code>).</li><li>Jitni baar <code>lock()</code>, utni baar <code>unlock()</code>. Hold count 0 hone pe hi lock free hota hai.</li></ul>"
    },
    {
      type: "code",
      title: "tryLock(timeout): lock na mile to fallback (deterministic)",
      code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final ReentrantLock inventoryLock = new ReentrantLock();

    static String reserve(String user) throws InterruptedException {
        if (inventoryLock.tryLock(100, TimeUnit.MILLISECONDS)) { // max 100ms ruko
            try {
                return user + ": item reserve ho gaya";
            } finally {
                inventoryLock.unlock();
            }
        }
        return user + ": lock 100ms mein nahi mila, 'thodi der baad try karo' dikhao";
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch held = new CountDownLatch(1), release = new CountDownLatch(1);
        Thread batchJob = new Thread(() -> {
            inventoryLock.lock();          // lamba batch job lock pakad ke baitha hai
            try {
                held.countDown();
                release.await();
            } catch (InterruptedException e) {
            } finally {
                inventoryLock.unlock();
            }
        }, "batch-job");
        batchJob.start();
        held.await();

        System.out.println(reserve("Riya"));   // lock busy: timeout
        release.countDown();                   // batch job khatam
        batchJob.join();
        System.out.println(reserve("Aman"));   // ab mil jaayega
    }
}`,
      note: "<code>tryLock()</code> (bina timeout) turant true/false deta hai. Deadlock se bachne ke liye: dono locks tryLock se lo, ek bhi na mile to jo mila wo bhi chhodo, random delay, phir retry."
    },
    {
      type: "text",
      html: `
        <h2>Fairness</h2>
        <p><code>new ReentrantLock()</code> = <b>non-fair</b> (default, <code>false</code>). Lock free hote hi jo thread us pal maang raha hai wo le sakta hai, chahe queue mein koi pehle se wait kar raha ho ("barging"). Throughput zyada hota hai, kyunki sote hue thread ko jagane ka wait nahi karna padta.</p>
        <p><code>new ReentrantLock(true)</code> = <b>fair</b>: jo sabse lamba wait kar raha hai use pehle milta hai. Starvation nahi, par throughput kaafi kam ho sakta hai. Note: untimed <code>tryLock()</code> fairness ko ignore karta hai.</p>
        <p>Default non-fair hi rakho, jab tak starvation ki asli problem na dikhe.</p>`
    },
    {
      type: "steps",
      title: "Condition: delivery boy 'foodReady' ka await karta hai, kitchen signal karti hai",
      steps: [
        {
          title: "Step 1: Delivery lock leta hai, khana ready nahi, await()",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>Delivery</th><td class="lock">🔒 ready? nahi</td><td class="wait">foodReady.await() (lock chhoda)</td><td></td><td></td></tr>
            <tr><th>Kitchen</th><td class="run">khana bana rahi</td><td></td><td></td><td></td></tr>
          </table><p><code>await()</code> = <code>wait()</code> jaisa: lock chhodta hai aur sirf <b>is condition</b> ki queue mein sota hai.</p>`
        },
        {
          title: "Step 2: Kitchen lock leti hai, ready=true, foodReady.signal()",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>Delivery</th><td class="lock">🔒 ready? nahi</td><td class="wait">await()</td><td class="wait">WAITING</td><td></td></tr>
            <tr><th>Kitchen</th><td class="run">khana bana rahi</td><td></td><td class="lock">🔒 ready=true, signal()</td><td></td></tr>
          </table><p>Signal sirf foodReady wale waiters ko jagata hai, kisi aur condition (jaise <code>billPaid</code>) wale ko nahi. notifyAll se ye behtar hai.</p>`
        },
        {
          title: "Step 3: Kitchen unlock, Delivery lock wapas leke while check, nikalta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>Delivery</th><td class="lock">🔒 ready? nahi</td><td class="wait">await()</td><td class="wait">WAITING</td><td class="lock">🔒 ready? haan → pickup</td></tr>
            <tr><th>Kitchen</th><td class="run">khana bana rahi</td><td></td><td class="lock">🔒 ready=true, signal()</td><td>🔓 unlock</td></tr>
          </table><p>Rules wait/notify jaise hi: <code>await()</code> lock pakad ke hi, aur <b>while loop</b> mein (spurious wakeup yahan bhi allowed hai).</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Condition await/signal: kitchen aur delivery (deterministic order)",
      code: `import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final ReentrantLock lock = new ReentrantLock();
    static final Condition foodReady = lock.newCondition();
    static boolean ready = false;

    static boolean someoneWaiting() {
        lock.lock();
        try {
            return lock.hasWaiters(foodReady);
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread delivery = new Thread(() -> {
            lock.lock();
            try {
                System.out.println("delivery: khana ready nahi, wait kar raha hoon");
                while (!ready) foodReady.await();   // while, if nahi
                System.out.println("delivery: khana mila, nikal gaya 🛵");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        }, "delivery");
        delivery.start();

        for (int i = 0; i < 200 && !someoneWaiting(); i++) Thread.sleep(5); // delivery await mein pahunch jaaye

        lock.lock();
        try {
            ready = true;
            System.out.println("kitchen: khana ready, signal()");
            foodReady.signal();
        } finally {
            lock.unlock();
        }
        delivery.join();
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>synchronized vs ReentrantLock</h2>
        <table>
          <tr><th>Feature</th><th>synchronized</th><th>ReentrantLock</th></tr>
          <tr><td>Syntax</td><td>Keyword, block khatam = unlock (bhool nahi sakte)</td><td>lock()/unlock() khud, finally zaroori</td></tr>
          <tr><td>Reentrant</td><td>Haan</td><td>Haan (<code>getHoldCount()</code>)</td></tr>
          <tr><td>Timeout</td><td>Nahi</td><td><code>tryLock(time, unit)</code></td></tr>
          <tr><td>Bina wait try</td><td>Nahi</td><td><code>tryLock()</code></td></tr>
          <tr><td>Wait ke dauraan interrupt</td><td>Nahi (BLOCKED atka rehta hai)</td><td><code>lockInterruptibly()</code></td></tr>
          <tr><td>Fairness</td><td>Nahi (non-fair)</td><td>Option: <code>new ReentrantLock(true)</code>, default false</td></tr>
          <tr><td>Conditions</td><td>Ek (object ka wait/notify)</td><td>Kai: <code>newCondition()</code> (notFull, notEmpty)</td></tr>
          <tr><td>Lock ek method mein lo, doosre mein chhodo</td><td>Nahi (block structured)</td><td>Haan (par sambhal ke)</td></tr>
          <tr><td>Monitoring</td><td><code>Thread.holdsLock(obj)</code></td><td><code>isLocked()</code>, <code>getQueueLength()</code>, <code>hasWaiters()</code></td></tr>
          <tr><td>Kab use karein</td><td>Default: simple critical sections</td><td>Jab upar wale features mein se koi chahiye</td></tr>
        </table>
        <p>Performance: modern JVMs pe dono ka uncontended cost lagbhag barabar hai. Choice <b>features</b> se karo, speed ke myth se nahi.</p>`
    },
    {
      type: "quiz",
      q: "Thread A ne <code>lock.lock()</code> do baar call kiya (reentrant) aur <code>lock.unlock()</code> sirf ek baar. Ab Thread B <code>lock.lock()</code> karta hai. Kya hoga?",
      options: [
        "B ko lock mil jaayega, kyunki A ne unlock kar diya",
        "B wait karta rahega, kyunki A ka hold count abhi 1 hai, lock free nahi hua",
        "IllegalMonitorStateException",
        "A ka doosra lock() pehle hi deadlock kar deta"
      ],
      answer: 1,
      why: "Reentrant lock har lock() pe hold count +1 aur har unlock() pe -1 karta hai. Count 0 hone pe hi doosre thread ko milta hai. Isliye har lock() ka ek unlock() finally mein."
    },
    {
      type: "exercise",
      id: "ex-seat-booking",
      title: "BookMyShow seat booking: ReentrantLock se",
      level: "Medium",
      task: `<p><code>book(seat, user)</code>: agar seat free hai to <code>user</code> ke naam karo aur <code>true</code> do, warna <code>false</code>. <code>owner(seat)</code> seat kiske naam hai (ya <code>null</code>).</p>
        <p>Starter mein check-then-act race hai, isliye ek seat do logon ko mil jaati hai. <code>Thread.yield()</code> race window bada karta hai, mat hatao. <b>ReentrantLock</b> se theek karo (harness check karta hai ki class mein ek <code>Lock</code> field hai).</p>
        <p>Harness 8 threads se ek saath saari 10 seats book karwata hai, phir check karta hai: <b>exactly 10 bookings</b> successful, aur har seat ka owner wahi jisko <code>true</code> mila.</p>`,
      examples: "<code>book(3, \"riya\")</code> → <code>true</code>; phir <code>book(3, \"aman\")</code> → <code>false</code>, <code>owner(3)</code> = <code>\"riya\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.locks.*;

class Solution {
    private final String[] seats;

    Solution(int n) {
        seats = new String[n];
    }

    boolean book(int seat, String user) {
        if (seats[seat] != null) return false; // check
        Thread.yield();                         // race window (mat hatao)
        seats[seat] = user;                     // act
        return true;
    }

    String owner(int seat) {
        return seats[seat];
    }
}`,
      harness: `import seekho.Check;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.Lock;

public class Main {
    // [successful bookings, saare owners consistent?]
    static List<Object> rush(int seats, int users) {
        Solution s = new Solution(seats);
        Map<Integer, String> winners = new ConcurrentHashMap<>();
        List<Integer> doubles = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch go = new CountDownLatch(1);
        Thread[] ts = new Thread[users];
        for (int u = 0; u < users; u++) {
            String name = "user" + u;
            ts[u] = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int seat = 0; seat < seats; seat++) {
                    if (s.book(seat, name) && winners.putIfAbsent(seat, name) != null) doubles.add(seat);
                }
            });
            ts[u].setDaemon(true);
            ts[u].start();
        }
        go.countDown();
        try { for (Thread t : ts) t.join(3000); } catch (InterruptedException e) { throw new RuntimeException(e); }
        boolean consistent = doubles.isEmpty();
        for (int seat = 0; seat < seats; seat++) consistent &= Objects.equals(winners.get(seat), s.owner(seat));
        return List.of(winners.size() + doubles.size(), consistent);
    }

    static String lockField() {
        for (Field f : Solution.class.getDeclaredFields()) {
            if (Lock.class.isAssignableFrom(f.getType())) return "Lock field mila";
        }
        return "koi Lock field nahi";
    }

    public static void main(String[] args) {
        Check.eq("single thread: book, dobara book, owner", List.of(true, false, "riya"), () -> {
            Solution s = new Solution(5);
            return List.of(s.book(3, "riya"), s.book(3, "aman"), s.owner(3));
        });
        Check.eq("8 users x 10 seats: [bookings, consistent]", List.of(10, true), () -> rush(10, 8));
        Check.hiddenFromHere();
        Check.eq("ReentrantLock use hua?", "Lock field mila", Main::lockField);
        Check.eq("free seat ka owner null", true, () -> new Solution(2).owner(1) == null);
        Check.eq("1 seat, 16 users", List.of(1, true), () -> rush(1, 16));
        Check.eq("50 seats, 6 users", List.of(50, true), () -> rush(50, 6));
    }
}`,
      hints: [
        "Field banao: <code>private final ReentrantLock lock = new ReentrantLock();</code>",
        "<code>book</code> mein check + act dono <code>lock.lock(); try { ... } finally { lock.unlock(); }</code> ke andar.",
        "<code>owner()</code> ko bhi lock ke andar padho, taaki doosre thread ka likha hua pakka dikhe."
      ],
      solution: `import java.util.concurrent.locks.*;

class Solution {
    private final String[] seats;
    private final ReentrantLock lock = new ReentrantLock();

    Solution(int n) {
        seats = new String[n];
    }

    boolean book(int seat, String user) {
        lock.lock();
        try {
            if (seats[seat] != null) return false;
            Thread.yield();
            seats[seat] = user;
            return true;
        } finally {
            lock.unlock(); // return true/false dono raste pe chalega
        }
    }

    String owner(int seat) {
        lock.lock();
        try {
            return seats[seat];
        } finally {
            lock.unlock();
        }
    }
}`,
      explain: "<p>Check aur act ek hi lock ke andar, isliye ek seat ek hi user ko milti hai. <code>return</code> try ke andar ho tab bhi finally chalta hai, lock hamesha chhootta hai.</p><p>Scale pe: ek global lock saare shows ki saari seats ko serialize karta hai. Behtar: har show (ya seat) ka alag lock, ya lock-free <code>AtomicReferenceArray.compareAndSet(seat, null, user)</code>. Asli system mein ye DB level pe hota hai (unique constraint ya <code>SELECT ... FOR UPDATE</code>, ya Redis <code>SET NX</code> with TTL for seat hold).</p>"
    },
    {
      type: "think",
      id: "think-lock-vs-sync",
      q: "Interview question: <b>\"synchronized hai to ReentrantLock kyun banaya gaya? Aap kab kaunsa use karoge?\"</b>",
      rubric: [
        { point: "<b>tryLock</b> / timeout: hamesha wait nahi karna", keys: ["trylock", "timeout", "time limit"], weight: 2 },
        { point: "<b>lockInterruptibly</b>: wait karta thread interrupt se nikal sake", keys: ["interruptibly", "interrupt"] },
        { point: "<b>Fairness</b> option (default non-fair)", keys: ["fair", "fairness", "starvation"] },
        { point: "Multiple <b>Condition</b> objects (notFull/notEmpty)", keys: ["condition", "await", "signal", "newcondition"], weight: 2 },
        { point: "Trade-off: unlock <b>finally</b> mein khud karna padta hai; simple case mein synchronized", keys: ["finally", "unlock", "bhool", "forget", "simple", "default synchronized"], weight: 2 }
      ],
      answer: `<p><b>ReentrantLock jo synchronized nahi deta:</b></p>
        <ul>
          <li><code>tryLock()</code> / <code>tryLock(timeout)</code>: wait ki limit, deadlock avoidance.</li>
          <li><code>lockInterruptibly()</code>: lock ka wait karta thread cancel ho sake.</li>
          <li>Fair mode (<code>new ReentrantLock(true)</code>); default non-fair hai kyunki throughput zyada.</li>
          <li>Ek lock pe kai <code>Condition</code>: bounded buffer mein notFull aur notEmpty alag, sirf sahi threads jagte hain.</li>
          <li>Monitoring: <code>getQueueLength()</code>, <code>isLocked()</code>.</li>
        </ul>
        <p><b>Kharcha:</b> <code>unlock()</code> khud finally mein likhna padta hai; bhool gaye to app atak jaayegi. Isliye default <b>synchronized</b> (simple, safe), aur ReentrantLock tab jab upar ka koi feature chahiye. Performance mein aaj kal bada farak nahi.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Whiteboard pe ReentrantLock likho to pehle <code>lock.lock(); try { } finally { lock.unlock(); }</code> ka dhaancha likho, phir andar logic. Interviewer ye pattern sabse pehle dekhta hai. Aur 'kyun ReentrantLock' poochein to 'tryLock + Condition' do examples ke saath batao."
    }
  ],
  references: [
    { title: "ReentrantLock (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html", type: "docs" },
    { title: "Condition (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/Condition.html", type: "docs" },
    { title: "Oracle Java Tutorial: Lock Objects", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/newlocks.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 13: Explicit Locks)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
