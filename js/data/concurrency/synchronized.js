// synchronized
registerLesson("concurrency", "synchronized", {
  why: "synchronized Java ka sabse basic lock hai. Interview mein poochte hain: 'method aur block mein kya farak hai?', 'lock kis object pe lagta hai?', 'static synchronized aur instance synchronized ek doosre ko rokte hain?'. Galat object pe lock = bug jo test mein nahi dikhta.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Har object ke paas ek lock (monitor) hota hai</h2>
        <p>Java mein <b>har object</b> ke saath ek <b>intrinsic lock</b> (monitor) hota hai. <code>synchronized</code> ka matlab: "is object ka lock lo, kaam karo, lock chhodo". Jab tak ek thread ke paas lock hai, doosra thread jo <b>same object</b> ka lock maangega, wo <code>BLOCKED</code> rahega.</p>
        <table>
          <tr><th>Likha kaise</th><th>Lock kis pe</th><th>Example</th></tr>
          <tr><td><code>synchronized void deposit()</code></td><td><code>this</code> (wo object jispe method call hua)</td><td>Har Account ka apna lock</td></tr>
          <tr><td><code>static synchronized void nextId()</code></td><td><code>Account.class</code> (Class object, poori JVM mein ek)</td><td>Global id generator</td></tr>
          <tr><td><code>synchronized (lockObj) { ... }</code></td><td><code>lockObj</code></td><td>Sirf zaroori lines lock karo, private lock object</td></tr>
        </table>
        <p>Lock <b>apne aap chhoot jaata hai</b> jab block khatam ho, chahe normally ya exception se. Isliye synchronized mein "unlock bhool gaye" wali bug nahi hoti.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: T1 aur T2 dono account.deposit() (synchronized) call karte hain",
      steps: [
        {
          title: "Step 1: T1 ne lock liya",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>T1</th><td class="lock">🔒 lock(account)</td><td></td><td></td><td></td><td></td></tr>
            <tr><th>T2</th><td></td><td></td><td></td><td></td><td></td></tr>
          </table><p>Lock kisi ke paas nahi tha, T1 ko turant mil gaya.</p>`
        },
        {
          title: "Step 2: T2 aata hai, lock busy hai: BLOCKED",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>T1</th><td class="lock">🔒 lock(account)</td><td class="run">read balance</td><td class="run">write balance</td><td></td><td></td></tr>
            <tr><th>T2</th><td></td><td class="block">BLOCKED</td><td class="block">BLOCKED</td><td></td><td></td></tr>
          </table><p>T2 CPU nahi kha raha, bas line mein khada hai. T1 ka read-write ab beech mein nahi toot sakta.</p>`
        },
        {
          title: "Step 3: T1 ne lock chhoda, T2 ko mila",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>T1</th><td class="lock">🔒 lock(account)</td><td class="run">read balance</td><td class="run">write balance</td><td>🔓 unlock</td><td></td></tr>
            <tr><th>T2</th><td></td><td class="block">BLOCKED</td><td class="block">BLOCKED</td><td class="lock">🔒 lock(account)</td><td class="run">read (T1 ka update dikhta hai)</td></tr>
          </table><p>Unlock aur agla lock: ye <b>happens-before</b> banata hai. T1 ne jo likha, T2 ko pakka dikhega. synchronized atomicity + visibility dono deta hai.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Method vs block: dono se exact count. Block mein sirf zaroori hissa lock hai.",
      code: `public class Main {
    static class TicketCounter {
        private int sold = 0;
        private final Object lock = new Object(); // private lock: bahar wala koi isko lock nahi kar sakta
        private int printed = 0;

        // 1. Method level: poora method this pe lock
        synchronized void sellMethod() {
            sold++;
        }

        // 2. Block level: slow kaam lock ke bahar, sirf shared update andar
        void sellBlock() {
            String ticket = "TKT-" + Thread.currentThread().getName(); // local kaam, lock nahi chahiye
            synchronized (lock) {
                printed++;
            }
        }

        synchronized int sold() { return sold; }
        int printed() { synchronized (lock) { return printed; } }
    }

    public static void main(String[] args) throws InterruptedException {
        TicketCounter c = new TicketCounter();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < 10_000; j++) {
                    c.sellMethod();
                    c.sellBlock();
                }
            }, "counter-" + i);
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("Method synchronized: " + c.sold());
        System.out.println("Block synchronized:  " + c.printed());
    }
}`,
      note: "Dono har baar <code>40000</code>. Block wala tareeka production mein better hai: lock kam der pakdo (critical section chhota), aur private lock object rakho taaki koi bahar ka code galti se tumhara lock na pakad le."
    },
    {
      type: "text",
      html: `
        <h2>Reentrancy: apna hi lock dobara le sakte ho</h2>
        <p>Intrinsic lock <b>reentrant</b> hai: jis thread ke paas lock hai, wo usi lock wale doosre synchronized method mein ghus sakta hai. JVM ek <b>hold count</b> rakhti hai: har entry pe +1, har exit pe -1, 0 hone pe lock free.</p>
        <p>Agar reentrant na hota, to <code>synchronized withdraw()</code> se <code>synchronized log()</code> call karna ya subclass ka <code>super.method()</code> call karna khud se deadlock kar deta.</p>`
    },
    {
      type: "code",
      title: "Reentrancy: synchronized method ke andar se doosra synchronized method",
      code: `public class Main {
    static class Account {
        private int balance = 1000;

        synchronized void withdraw(int amt) {
            System.out.println("withdraw: lock mere paas? " + Thread.holdsLock(this));
            balance -= amt;
            audit("withdraw " + amt); // same lock dobara chahiye
        }

        synchronized void audit(String msg) {
            System.out.println("audit:    lock mere paas? " + Thread.holdsLock(this) + " -> " + msg + ", balance " + balance);
        }
    }

    static class PremiumAccount extends Account {
        @Override
        synchronized void withdraw(int amt) {
            System.out.println("premium:  extra check, phir super.withdraw()");
            super.withdraw(amt); // same object, same lock, phir se enter
        }
    }

    public static void main(String[] args) {
        new PremiumAccount().withdraw(200);
        System.out.println("Deadlock nahi hua: intrinsic lock reentrant hai.");
    }
}`
    },
    {
      type: "code",
      title: "Static synchronized aur instance synchronized alag locks hain",
      code: `import java.util.concurrent.CountDownLatch;

public class Main {
    static int nextId = 0;

    static synchronized int newId() {           // lock: Main.class
        return ++nextId;
    }

    synchronized void longReport(CountDownLatch inside, CountDownLatch done) throws InterruptedException {
        inside.countDown();                      // lock: this
        done.await();                            // lock pakde hue ruka hai
    }

    public static void main(String[] args) throws InterruptedException {
        Main obj = new Main();
        CountDownLatch inside = new CountDownLatch(1), done = new CountDownLatch(1);

        Thread reporter = new Thread(() -> {
            try { obj.longReport(inside, done); } catch (InterruptedException e) { }
        }, "reporter");
        reporter.start();
        inside.await();                          // ab reporter ke paas obj ka lock hai

        System.out.println("reporter ke paas obj lock hai, phir bhi static newId() = " + newId() + " (turant chala)");

        Thread other = new Thread(() -> {
            synchronized (obj) { System.out.println("other: aakhir obj lock mila"); }
        }, "other");
        other.start();
        for (int i = 0; i < 200 && other.getState() != Thread.State.BLOCKED; i++) Thread.sleep(5);
        System.out.println("other thread (same obj lock chahiye) ki state: " + other.getState());

        done.countDown();                        // reporter lock chhodega
        reporter.join();
        other.join();
    }
}`,
      note: "Static method <code>Main.class</code> ka lock leta hai, instance method <code>obj</code> ka. Dono alag hain, isliye ek doosre ko nahi rokte. Agar dono same static data badal rahe hain to ye bug hai."
    },
    {
      type: "quiz",
      q: "<code>class Counter { synchronized void inc() {...} }</code>. Thread A <code>c1.inc()</code> aur Thread B <code>c2.inc()</code> call karta hai (c1, c2 do alag objects). Kya B, A ke khatam hone ka wait karega?",
      options: [
        "Haan, synchronized method ek time pe sirf ek thread chala sakta hai",
        "Nahi, lock object pe lagta hai; c1 aur c2 ke alag locks hain",
        "Haan, agar dono same class ke hain",
        "Nahi, kyunki synchronized sirf static methods pe kaam karta hai"
      ],
      answer: 1,
      why: "Instance synchronized method <code>this</code> pe lock leta hai. Alag objects = alag locks = koi rok-tok nahi. Agar counter shared static data badal raha hai to <code>static synchronized</code> ya ek shared lock object chahiye."
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b><ul><li>Method ke andar <code>synchronized (new Object())</code>: har call naya lock, kuch protect nahi hota.</li><li>String literal ya <code>Integer</code> pe lock (<code>synchronized(\"LOCK\")</code>): String pool/Integer cache ki wajah se poori JVM mein koi aur bhi wahi object lock kar sakta hai.</li><li>Non-final field pe lock: field badla to lock badal gaya.</li><li>Sirf write ko synchronized kiya, read ko nahi: reader purani value dekh sakta hai.</li><li>Lock ke andar slow I/O (HTTP call): baaki saare threads line mein khade rahenge.</li></ul>"
    },
    {
      type: "exercise",
      id: "ex-bank-transfer",
      title: "Bank transfer ko thread-safe banao",
      level: "Medium",
      task: `<p>Ek chhota bank: <code>accounts</code> accounts, har ek mein <code>initial</code> rupaye. <code>transfer(from, to, amount)</code>: agar <code>from</code> mein kaafi paise hain to transfer karo aur <code>true</code> do, warna <code>false</code>.</p>
        <p>Starter code mein race hai (check-then-act + read-modify-write). <code>Thread.yield()</code> race window bada karta hai, use mat hatao.</p>
        <p>Harness 4 threads se ek saath hazaaron random transfers chalata hai (fixed seed), phir check karta hai: <b>total paisa same rehna chahiye</b> aur <b>koi balance negative nahi</b>.</p>`,
      examples: "<code>new Solution(2, 100)</code>: <code>transfer(0, 1, 30)</code> → <code>true</code>, balances [70, 130]; <code>transfer(0, 1, 500)</code> → <code>false</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    private final int[] balances;

    Solution(int accounts, int initial) {
        balances = new int[accounts];
        Arrays.fill(balances, initial);
    }

    boolean transfer(int from, int to, int amount) {
        if (balances[from] < amount) return false;  // check
        int fromBal = balances[from];
        Thread.yield();                              // race window (mat hatao)
        balances[from] = fromBal - amount;           // act
        balances[to] = balances[to] + amount;
        return true;
    }

    int balance(int account) {
        return balances[account];
    }

    int total() {
        int sum = 0;
        for (int b : balances) sum += b;
        return sum;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.CountDownLatch;

public class Main {
    // 'threads' threads, har ek 'ops' random transfers. Return: [total, minBalance]
    static List<Integer> storm(int accounts, int initial, int threads, int ops) {
        Solution bank = new Solution(accounts, initial);
        CountDownLatch go = new CountDownLatch(1);
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            final long seed = 42 + i;
            ts[i] = new Thread(() -> {
                Random r = new Random(seed);
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int k = 0; k < ops; k++) {
                    int from = r.nextInt(accounts);
                    int to = (from + 1 + r.nextInt(accounts - 1)) % accounts;
                    bank.transfer(from, to, 1 + r.nextInt(150));
                }
            });
            ts[i].setDaemon(true);
            ts[i].start();
        }
        go.countDown();
        try { for (Thread t : ts) t.join(3000); } catch (InterruptedException e) { throw new RuntimeException(e); }
        int min = Integer.MAX_VALUE;
        for (int a = 0; a < accounts; a++) min = Math.min(min, bank.balance(a));
        return List.of(bank.total(), min >= 0 ? 0 : min);
    }

    public static void main(String[] args) {
        Check.eq("single thread: transfer(0,1,30) aur balances", List.of(true, 70, 130), () -> {
            Solution b = new Solution(2, 100);
            boolean ok = b.transfer(0, 1, 30);
            return List.of(ok, b.balance(0), b.balance(1));
        });
        Check.eq("4 threads x 3000 transfers: [total, negative?]", List.of(5000, 0), () -> storm(5, 1000, 4, 3000));
        Check.hiddenFromHere();
        Check.eq("paise kam: false, kuch na badle", List.of(false, 100, 100), () -> {
            Solution b = new Solution(2, 100);
            boolean ok = b.transfer(0, 1, 500);
            return List.of(ok, b.balance(0), b.balance(1));
        });
        Check.eq("poora balance transfer: allowed", List.of(true, 0, 200), () -> {
            Solution b = new Solution(2, 100);
            boolean ok = b.transfer(0, 1, 100);
            return List.of(ok, b.balance(0), b.balance(1));
        });
        Check.eq("2 accounts, kam paise, bahut contention", List.of(100, 0), () -> storm(2, 50, 4, 3000));
        Check.eq("8 threads x 2000 transfers", List.of(10000, 0), () -> storm(10, 1000, 8, 2000));
    }
}`,
      hints: [
        "Check (<code>balances[from] &lt; amount</code>) aur act (dono writes) ek hi atomic hisse mein hone chahiye.",
        "Sabse simple: <code>transfer</code>, <code>balance</code> aur <code>total</code> teeno ko <code>synchronized</code> banao (sab <code>this</code> pe lock).",
        "Sirf transfer ko synchronized kiya aur total() ko nahi, to total() beech ki adhoori state padh sakta hai. Teeno same lock use karein."
      ],
      solution: `import java.util.*;

class Solution {
    private final int[] balances;

    Solution(int accounts, int initial) {
        balances = new int[accounts];
        Arrays.fill(balances, initial);
    }

    synchronized boolean transfer(int from, int to, int amount) {
        if (balances[from] < amount) return false;  // check aur act ab ek hi lock mein
        int fromBal = balances[from];
        Thread.yield();
        balances[from] = fromBal - amount;
        balances[to] = balances[to] + amount;
        return true;
    }

    synchronized int balance(int account) {
        return balances[account];
    }

    synchronized int total() {
        int sum = 0;
        for (int b : balances) sum += b;
        return sum;
    }
}`,
      explain: "<p>Poore bank pe ek lock (<code>this</code>). Check-then-act aur dono writes ab atomic hain, isliye total hamesha same rehta hai aur balance kabhi negative nahi hota.</p><p>Trade-off: ek global lock = alag accounts ke transfers bhi line mein lagte hain. Behtar throughput ke liye har account ka apna lock, par tab do locks lene padte hain aur <b>deadlock</b> ka khatra aata hai (A→B aur B→A). Deadlock lesson mein lock ordering se ye solve karenge.</p>"
    },
    {
      type: "think",
      id: "think-sync-what-object",
      q: "Interview question: <b>\"synchronized method aur synchronized block mein kya farak hai? Lock kis object pe lagta hai? Static synchronized method aur instance synchronized method ek saath chal sakte hain?\"</b>",
      rubric: [
        { point: "Instance synchronized method <b>this</b> pe lock leta hai", keys: ["this", "current object", "instance", "object pe lock", "object level"], weight: 2 },
        { point: "Static synchronized <b>Class object</b> (<code>Foo.class</code>) pe", keys: [".class", "class object", "class level", "class lock"], weight: 2 },
        { point: "Block kisi bhi object pe lock le sakta hai, <b>chhota critical section</b>, private lock object", keys: ["block", "chhota", "smaller", "granular", "private lock", "lock object", "fine"] },
        { point: "Static aur instance <b>alag locks</b>, isliye ek saath chal sakte hain", keys: ["alag lock", "different lock", "ek saath chal", "can run", "block nahi karte", "don't block"], weight: 2 },
        { point: "Intrinsic lock <b>reentrant</b> hai, exception pe bhi apne aap release", keys: ["reentrant", "re-entrant", "hold count", "release", "exception"] }
      ],
      answer: `<ul>
          <li><b>Instance synchronized method</b>: lock <code>this</code> pe. Alag objects ke calls ek doosre ko nahi rokte.</li>
          <li><b>Static synchronized</b>: lock <code>ClassName.class</code> pe, poori JVM (us classloader) mein ek.</li>
          <li><b>Block</b>: <code>synchronized (x) { }</code>, lock x pe. Fayda: sirf zaroori lines lock karo, aur private final lock object use karo taaki bahar ka code wahi lock na pakde.</li>
          <li><b>Static aur instance</b> alag locks hain, isliye ek saath chal sakte hain. Agar dono same static field badalte hain to race hai.</li>
        </ul>
        <p>Bonus: intrinsic lock reentrant hai (same thread dobara le sakta hai), exception aane pe bhi apne aap chhootta hai, aur unlock→lock ke beech happens-before deta hai, isliye visibility bhi milti hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Pura method synchronized kar do\" kaam karta hai, par senior jawab mein ye bolo: <i>lock ka scope chhota rakho, lock ke andar I/O mat karo, aur ek private final lock object use karo.</i> Phir trade-off: ek bada lock = simple par slow; bahut chhote locks = tez par deadlock ka risk."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Synchronized Methods", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/syncmeth.html", type: "docs" },
    { title: "Oracle Java Tutorial: Intrinsic Locks and Synchronization", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html", type: "docs" },
    { title: "JLS Chapter 17: Threads and Locks", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html", type: "docs" },
    { title: "Java Concurrency in Practice", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
