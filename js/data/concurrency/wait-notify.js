// wait / notify (Producer-Consumer)
registerLesson("concurrency", "wait-notify", {
  why: "Producer-consumer aur 'bounded buffer likho' interview ka favourite coding question hai. Saath mein follow-ups: 'wait() ko while loop mein kyun rakhte ho?', 'notify aur notifyAll mein kya farak hai?'. Ye lesson un sab ka jawab code ke saath deta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: Swiggy ka order queue</h2>
        <p>Order service orders ek buffer mein daalti hai (<b>producer</b>), delivery-assign service unko nikalti hai (<b>consumer</b>). Buffer ka size limited hai (memory).</p>
        <ul>
          <li>Buffer <b>khaali</b> hai to consumer kya kare? Baar baar check karna (busy waiting) CPU jalata hai.</li>
          <li>Buffer <b>bhara</b> hai to producer ko rukna chahiye (backpressure).</li>
        </ul>
        <p>Chahiye: "jab tak condition sach na ho, <b>so jao</b>, aur jab koi condition badle to <b>jaga do</b>". Har Java object yahi deta hai: <code>wait()</code>, <code>notify()</code>, <code>notifyAll()</code>.</p>
        <h3>Teen rules</h3>
        <ol>
          <li><code>wait/notify</code> sirf us object ka <b>lock pakad ke</b> (synchronized ke andar) call kar sakte ho. Warna <code>IllegalMonitorStateException</code>.</li>
          <li><code>wait()</code> lock <b>chhod deta hai</b> aur thread ko WAITING mein daal deta hai. Jagne ke baad lock <b>wapas lene</b> ke baad hi aage badhta hai.</li>
          <li><code>wait()</code> hamesha <b>while loop</b> mein: <code>while (!condition) lock.wait();</code></li>
        </ol>`
    },
    {
      type: "steps",
      title: "Visualizer: buffer bhara hai (capacity 1), producer wait karta hai",
      steps: [
        {
          title: "Step 1: P lock leta hai, buffer full dekhta hai, wait()",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>Producer</th><td class="lock">🔒 full? haan</td><td class="wait">wait() (lock chhoda)</td><td></td><td></td><td></td></tr>
            <tr><th>Consumer</th><td class="block">BLOCKED</td><td></td><td></td><td></td><td></td></tr>
            <tr><th>buffer</th><td>[A]</td><td>[A]</td><td></td><td></td><td></td></tr>
          </table><p>wait() ne lock chhod diya. Ab consumer andar aa sakta hai.</p>`
        },
        {
          title: "Step 2: C lock leta hai, A nikalta hai, notifyAll()",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>Producer</th><td class="lock">🔒 full? haan</td><td class="wait">wait() (lock chhoda)</td><td class="wait">WAITING</td><td></td><td></td></tr>
            <tr><th>Consumer</th><td class="block">BLOCKED</td><td class="lock">🔒 take A</td><td class="lock">notifyAll()</td><td></td><td></td></tr>
            <tr><th>buffer</th><td>[A]</td><td>[ ]</td><td>[ ]</td><td></td><td></td></tr>
          </table><p>notifyAll() turant lock nahi deta. Producer ko sirf "jag jao" signal mila.</p>`
        },
        {
          title: "Step 3: C lock chhodta hai, P lock wapas leta hai, condition dobara check",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>Producer</th><td class="lock">🔒 full? haan</td><td class="wait">wait()</td><td class="wait">WAITING</td><td class="block">BLOCKED (lock chahiye)</td><td class="lock">🔒 full? nahi → put B</td></tr>
            <tr><th>Consumer</th><td class="block">BLOCKED</td><td class="lock">🔒 take A</td><td class="lock">notifyAll()</td><td>🔓 unlock</td><td></td></tr>
            <tr><th>buffer</th><td>[A]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[B]</td></tr>
          </table><p>Jagne ke baad producer <b>loop ki condition dobara</b> check karta hai. Isi liye while.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Bounded buffer: 1 producer (1..100), 1 consumer. Sum hamesha 5050.",
      code: `import java.util.*;

public class Main {
    static class Buffer {
        private final Deque<Integer> q = new ArrayDeque<>();
        private final int capacity;
        int maxSeen = 0;

        Buffer(int capacity) { this.capacity = capacity; }

        synchronized void put(int x) throws InterruptedException {
            while (q.size() == capacity) wait();   // full: so jao (lock chhoot jaata hai)
            q.addLast(x);
            maxSeen = Math.max(maxSeen, q.size());
            notifyAll();                           // consumers ko jagao
        }

        synchronized int take() throws InterruptedException {
            while (q.isEmpty()) wait();            // khaali: so jao
            int x = q.removeFirst();
            notifyAll();                           // producers ko jagao
            return x;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Buffer buf = new Buffer(5);
        long[] consumedSum = new long[1];

        Thread producer = new Thread(() -> {
            try { for (int i = 1; i <= 100; i++) buf.put(i); } catch (InterruptedException e) { }
        }, "producer");
        Thread consumer = new Thread(() -> {
            try { for (int i = 0; i < 100; i++) consumedSum[0] += buf.take(); } catch (InterruptedException e) { }
        }, "consumer");

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();

        System.out.println("Consumed sum: " + consumedSum[0] + " (expected 5050)");
        System.out.println("Buffer kabhi capacity se zyada bhara? " + (buf.maxSeen > 5));
    }
}`
    },
    {
      type: "code",
      expectException: true,
      title: "Rule 1 todo: lock ke bina wait() → IllegalMonitorStateException",
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Object lock = new Object();
        System.out.println("synchronized ke bina lock.wait() call kar rahe hain...");
        lock.wait(100); // lock pakda hi nahi
    }
}`,
      note: "Fix: <code>synchronized (lock) { lock.wait(100); }</code>. Ye rule isliye hai ki condition check aur wait ke beech koi doosra thread condition na badal de (lost wakeup)."
    },
    {
      type: "text",
      html: `
        <h2>while kyun, if kyun nahi?</h2>
        <p>Do wajah se jagne ke baad condition <b>sach na bhi ho</b>:</p>
        <ol>
          <li><b>Spurious wakeup</b>: <code>Object.wait()</code> ki official docs kehti hain ki thread bina notify ke bhi jag sakta hai (rare, par allowed). Isliye docs khud loop mein wait karne ko kehti hain.</li>
          <li><b>Kisi aur ne pehle maar liya</b>: notifyAll se 2 consumers jage. Pehla lock leke item le gaya. Doosra jab lock leta hai, buffer phir khaali hai. <code>if</code> hota to wo khaali queue se remove karta → exception ya galat data.</li>
        </ol>
        <h2>notify vs notifyAll</h2>
        <table>
          <tr><th></th><th><code>notify()</code></th><th><code>notifyAll()</code></th></tr>
          <tr><td>Kitne jagte hain</td><td>Koi <b>ek</b> waiting thread (kaunsa, pakka nahi)</td><td><b>Saare</b> waiting threads (phir lock ke liye line)</td></tr>
          <tr><td>Risk</td><td>Galat thread jaga (jaise producer ne producer ko jaga diya), signal kho gaya, sab so gaye</td><td>Zyada threads jagte hain, thoda CPU waste</td></tr>
          <tr><td>Kab safe</td><td>Sab waiters ek hi condition ka wait kar rahe hon aur ek item = ek waiter</td><td>Default choice, jab producers aur consumers dono same object pe wait karte hain</td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "if ka bug: 2 consumers, 1 item, notifyAll",
      steps: [
        {
          title: "Step 1: C1 aur C2 dono khaali buffer dekh ke wait mein",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>C1</th><td class="wait">if (empty) wait()</td><td></td><td></td><td></td></tr>
            <tr><th>C2</th><td class="wait">if (empty) wait()</td><td></td><td></td><td></td></tr>
            <tr><th>Producer</th><td></td><td></td><td></td><td></td></tr>
            <tr><th>buffer</th><td>[ ]</td><td></td><td></td><td></td></tr>
          </table>`
        },
        {
          title: "Step 2: Producer 1 item daalta hai, notifyAll: dono jage",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>C1</th><td class="wait">wait()</td><td class="block">jaga, lock chahiye</td><td></td><td></td></tr>
            <tr><th>C2</th><td class="wait">wait()</td><td class="block">jaga, lock chahiye</td><td></td><td></td></tr>
            <tr><th>Producer</th><td></td><td class="lock">🔒 put X, notifyAll</td><td></td><td></td></tr>
            <tr><th>buffer</th><td>[ ]</td><td>[X]</td><td></td><td></td></tr>
          </table>`
        },
        {
          title: "Step 3: C1 X le gaya. C2 bina check kiye remove karta hai 💥",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>C1</th><td class="wait">wait()</td><td class="block">lock chahiye</td><td class="lock">🔒 take X ✅</td><td></td></tr>
            <tr><th>C2</th><td class="wait">wait()</td><td class="block">lock chahiye</td><td class="block">BLOCKED</td><td class="block">🔒 removeFirst() on [ ] 💥</td></tr>
            <tr><th>buffer</th><td>[ ]</td><td>[X]</td><td>[ ]</td><td>[ ]</td></tr>
          </table><p><code>if</code> ne sirf ek baar check kiya tha. <code>while</code> hota to C2 dobara empty dekh ke wapas wait karta.</p>`
        }
      ]
    },
    {
      type: "quiz",
      q: "Producer aur consumer dono <b>same object</b> pe wait karte hain. Code <code>notifyAll()</code> ki jagah <code>notify()</code> use karta hai. Sabse bura kya ho sakta hai?",
      options: [
        "Kuch nahi, notify bhi sabko jagata hai",
        "Producer ne put karke notify kiya, par doosra <b>producer</b> jaga (consumer nahi). Wo bhi full dekh ke so gaya. Consumer kabhi nahi jaga: sab threads hamesha ke liye WAITING",
        "Compile error",
        "IllegalMonitorStateException"
      ],
      answer: 1,
      why: "notify() koi bhi ek waiter uthata hai. Agar galat type ka thread utha, signal waste ho gaya. Isliye mixed waiters ke saath <code>notifyAll()</code>, ya behtar: <code>ReentrantLock</code> ki do alag <code>Condition</code> (notFull, notEmpty)."
    },
    {
      type: "order",
      id: "order-wait-internals",
      q: "Thread A <code>synchronized(obj) { while (!ready) obj.wait(); use(); }</code> chalata hai. Thread B baad mein <code>ready = true; obj.notifyAll();</code> karta hai. A ke steps ka sahi order?",
      items: [
        "A obj ka lock leta hai aur ready=false dekhta hai",
        "A obj.wait() call karta hai: lock chhodta hai, WAITING mein jaata hai",
        "B lock leta hai, ready=true karta hai, notifyAll() karta hai",
        "A jagta hai par B ke lock chhodne tak BLOCKED rehta hai",
        "A lock wapas leta hai aur while condition dobara check karta hai",
        "ready=true hai, A loop se bahar aa ke use() chalata hai"
      ]
    },
    {
      type: "exercise",
      id: "ex-bounded-buffer",
      title: "Bounded buffer: put/take with wait/notifyAll",
      level: "Medium",
      task: `<p><code>Solution(capacity)</code> ek FIFO buffer hai:</p>
        <ul>
          <li><code>put(x)</code>: buffer bhara ho to <b>wait</b> karo jab tak jagah na bane, phir add karo.</li>
          <li><code>take()</code>: buffer khaali ho to <b>wait</b> karo jab tak item na aaye, phir sabse purana item do.</li>
          <li><code>size()</code>: abhi kitne items hain.</li>
        </ul>
        <p>Sirf <code>synchronized</code>, <code>wait()</code>, <code>notifyAll()</code> use karo (BlockingQueue nahi). Harness kai producers aur consumers chala ke check karta hai: jitna produce hua utna hi consume (count aur sum), size kabhi capacity se upar nahi, aur blocking sahi hai. Atakne wale threads daemon hain aur timeout se pakde jaate hain.</p>`,
      examples: "capacity 2: <code>put(1); put(2); take()</code> → <code>1</code>, <code>take()</code> → <code>2</code><br>khaali buffer pe <code>take()</code> → thread WAITING, jab tak koi <code>put(7)</code> na kare, phir <code>7</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    private final Deque<Integer> items = new ArrayDeque<>();
    private final int capacity;

    Solution(int capacity) {
        this.capacity = capacity;
    }

    synchronized void put(int x) throws InterruptedException {
        // TODO: bhara ho to wait
        items.addLast(x);
    }

    synchronized int take() throws InterruptedException {
        // TODO: khaali ho to wait
        return items.isEmpty() ? -1 : items.removeFirst();
    }

    synchronized int size() {
        return items.size();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static void pause(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); }
    }

    static Thread daemon(Runnable r) {
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.start();
        return t;
    }

    static String settle(Thread t) {
        for (int i = 0; i < 100 && t.getState() != Thread.State.WAITING && t.isAlive(); i++) pause(5);
        return t.isAlive() ? t.getState().toString() : "khatam ho gaya (block nahi kiya)";
    }

    interface Job { void run() throws Exception; }
    static Runnable safe(Job j) {
        return () -> { try { j.run(); } catch (Exception e) { } };
    }

    public static void main(String[] args) {
        Check.eq("capacity 2: put 1, put 2, take, take (FIFO)", List.of(1, 2), () -> {
            Solution b = new Solution(2);
            List<Integer> out = new ArrayList<>();
            try { b.put(1); b.put(2); out.add(b.take()); out.add(b.take()); } catch (InterruptedException e) { }
            return out;
        });
        Check.eq("khaali pe take() WAITING, put(7) ke baad 7 mile", List.of("WAITING", 7), () -> {
            Solution b = new Solution(2);
            AtomicInteger got = new AtomicInteger(Integer.MIN_VALUE);
            Thread taker = daemon(safe(() -> got.set(b.take())));
            String state = settle(taker);
            try { b.put(7); taker.join(500); } catch (InterruptedException e) { }
            return List.of(state, got.get());
        });
        Check.hiddenFromHere();
        Check.eq("bhare pe put() WAITING, take ke baad andar jaaye", List.of("WAITING", 1, 2), () -> {
            Solution b = new Solution(1);
            List<Object> out = new ArrayList<>();
            try {
                b.put(1);
                Thread putter = daemon(safe(() -> b.put(2)));
                out.add(settle(putter));
                out.add(b.take());
                putter.join(500);
                out.add(b.size() == 1 ? b.take() : -1);
            } catch (InterruptedException e) { }
            return out;
        });
        Check.eq("3 producers x 300, 3 consumers x 300, capacity 5: [count, sum sahi, size <= cap]", List.of(900, true, true), () -> {
            Solution b = new Solution(5);
            AtomicLong produced = new AtomicLong(), consumed = new AtomicLong();
            AtomicInteger count = new AtomicInteger();
            AtomicBoolean sizeOk = new AtomicBoolean(true);
            List<Thread> ts = new ArrayList<>();
            for (int p = 0; p < 3; p++) {
                final int base = p * 1000;
                ts.add(daemon(safe(() -> {
                    for (int i = 1; i <= 300; i++) {
                        b.put(base + i);
                        produced.addAndGet(base + i);
                        if (b.size() > 5) sizeOk.set(false);
                    }
                })));
            }
            for (int c = 0; c < 3; c++) {
                ts.add(daemon(safe(() -> {
                    for (int i = 0; i < 300; i++) {
                        consumed.addAndGet(b.take());
                        count.incrementAndGet();
                    }
                })));
            }
            long deadline = System.currentTimeMillis() + 3000;
            try { for (Thread t : ts) t.join(Math.max(1, deadline - System.currentTimeMillis())); } catch (InterruptedException e) { }
            return List.of(count.get(), produced.get() == consumed.get(), sizeOk.get());
        });
        Check.eq("capacity 1, 1 producer, 1 consumer, 1000 items order mein", true, () -> {
            Solution b = new Solution(1);
            List<Integer> got = Collections.synchronizedList(new ArrayList<>());
            Thread prod = daemon(safe(() -> { for (int i = 0; i < 1000; i++) b.put(i); }));
            Thread cons = daemon(safe(() -> { for (int i = 0; i < 1000; i++) got.add(b.take()); }));
            try { prod.join(3000); cons.join(3000); } catch (InterruptedException e) { }
            if (got.size() != 1000) return false;
            for (int i = 0; i < 1000; i++) if (got.get(i) != i) return false;
            return true;
        });
    }
}`,
      hints: [
        "<code>put</code>: <code>while (items.size() == capacity) wait();</code>. <code>take</code>: <code>while (items.isEmpty()) wait();</code>.",
        "Add ya remove karne ke baad <code>notifyAll()</code> karo, taaki doosri side ke waiting threads jagein.",
        "<code>if</code> nahi, <code>while</code>: 3 consumers ek saath jag sakte hain par item ek hi ho sakta hai."
      ],
      solution: `import java.util.*;

class Solution {
    private final Deque<Integer> items = new ArrayDeque<>();
    private final int capacity;

    Solution(int capacity) {
        this.capacity = capacity;
    }

    synchronized void put(int x) throws InterruptedException {
        while (items.size() == capacity) wait();   // full: jagah banne tak so jao
        items.addLast(x);
        notifyAll();                               // khaali buffer pe so rahe consumers ko jagao
    }

    synchronized int take() throws InterruptedException {
        while (items.isEmpty()) wait();            // khaali: item aane tak so jao
        int x = items.removeFirst();
        notifyAll();                               // bhare buffer pe so rahe producers ko jagao
        return x;
    }

    synchronized int size() {
        return items.size();
    }
}`,
      explain: "<p>Ek lock (<code>this</code>), do conditions (\"full nahi\", \"khaali nahi\"). Dono ek hi wait set share karte hain, isliye <code>notifyAll()</code>: notify() galat side ke thread ko jaga sakta tha. <code>while</code> spurious wakeup aur \"kisi aur ne pehle le liya\" dono se bachata hai.</p><p>put/take O(1) (ArrayDeque). Production mein ye khud mat likho: <code>ArrayBlockingQueue</code> exactly yahi karta hai, <code>ReentrantLock</code> + do <code>Condition</code> (notFull, notEmpty) ke saath, taaki sirf sahi side jage.</p>"
    },
    {
      type: "think",
      id: "think-wait-loop",
      q: "Interview question: <b>\"wait() ko hamesha while loop mein kyun call karte hain? Aur wait() aur sleep() mein kya farak hai?\"</b>",
      rubric: [
        { point: "<b>Spurious wakeup</b>: bina notify ke bhi jag sakta hai", keys: ["spurious", "bina notify", "without notify", "apne aap"], weight: 2 },
        { point: "Jagne tak condition <b>kisi aur thread ne badal di</b> ho sakti hai (notifyAll, doosra consumer)", keys: ["condition badal", "condition change", "doosra consumer", "another thread", "kisi aur", "recheck", "dobara check"], weight: 2 },
        { point: "<code>wait()</code> <b>lock chhodta hai</b>, <code>sleep()</code> lock nahi chhodta", keys: ["lock chhod", "release", "releases the lock", "lock nahi chhod", "monitor"], weight: 2 },
        { point: "wait synchronized ke andar hi (IllegalMonitorStateException), Object ka method; sleep Thread ka static method", keys: ["illegalmonitorstate", "synchronized ke andar", "object class", "static", "thread class"] },
        { point: "wait notify/notifyAll/interrupt/timeout se jagta hai; sleep sirf time ya interrupt se", keys: ["notify", "timeout", "interrupt"] }
      ],
      answer: `<p><b>While kyun:</b> (1) Object.wait() ki docs spurious wakeup allow karti hain: thread bina notify ke jag sakta hai. (2) notifyAll se kai threads jagte hain; jab tak ye thread lock wapas le, koi aur condition consume kar chuka ho sakta hai. Isliye jagne ke baad condition dobara check karni padti hai: <code>while (!cond) wait();</code></p>
        <table>
          <tr><th></th><th>wait()</th><th>sleep()</th></tr>
          <tr><td>Class</td><td>Object (instance method)</td><td>Thread (static)</td></tr>
          <tr><td>Lock</td><td><b>Chhod deta hai</b></td><td>Pakde rehta hai</td></tr>
          <tr><td>Kahan call</td><td>Sirf synchronized ke andar</td><td>Kahin bhi</td></tr>
          <tr><td>Kab jagta hai</td><td>notify/notifyAll, interrupt, timeout, spurious</td><td>Time poora, ya interrupt</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Bounded buffer likhne ke baad khud bolo: <i>\"Production mein main <code>ArrayBlockingQueue</code> use karunga. Ye wait/notify version isliye likha taaki mechanism dikhe. Aur behtar version ReentrantLock + 2 Conditions hai, jisse sirf sahi side wale threads jagte hain.\"</i> Isse pata chalta hai ki aap tool aur trade-off dono jaante ho."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Guarded Blocks", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/guardmeth.html", type: "docs" },
    { title: "java.lang.Object: wait() / notify() (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 14: Building Custom Synchronizers)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
