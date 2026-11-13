// Classic: apni Bounded Blocking Queue
registerLesson("concurrency", "bounded-queue", {
  why: "\"ArrayBlockingQueue khud implement karo\" senior interviews ka favourite hai (LeetCode 1188 bhi yahi hai). Isme lock, do Conditions, while-await, circular array aur signal vs signalAll sab ek saath test ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Kya banana hai</h2>
        <p><code>BoundedBlockingQueue(capacity)</code> with:</p>
        <ul>
          <li><code>put(x)</code>: full ho to wait, jagah bane to daalo</li>
          <li><code>take()</code>: khaali ho to wait, item aaye to nikaalo (FIFO)</li>
          <li><code>size()</code></li>
        </ul>
        <h3>Design decisions (pehle bolo, phir likho)</h3>
        <table>
          <tr><th>Decision</th><th>Choice</th><th>Kyun</th></tr>
          <tr><td>Storage</td><td>Circular array: <code>items[]</code>, <code>head</code>, <code>tail</code>, <code>count</code></td><td>O(1) put/take, koi allocation nahi, memory fix</td></tr>
          <tr><td>Lock</td><td>Ek <code>ReentrantLock</code></td><td>head, tail, count teeno saath badalte hain: ek hi lock se consistent</td></tr>
          <tr><td>Waiting</td><td>Do <code>Condition</code>: <code>notFull</code>, <code>notEmpty</code></td><td>Producers aur consumers alag line mein. Put ke baad sirf consumers ko jagao</td></tr>
          <tr><td>Wait style</td><td><code>while (count == items.length) notFull.await();</code></td><td>Spurious wakeup + kisi aur ne jagah le li ho</td></tr>
          <tr><td>Signal</td><td><code>signal()</code> (ek)</td><td>Ek item aaya = ek consumer kaafi. Do alag conditions hain isliye galat type ka thread nahi jaagta</td></tr>
        </table>
        <pre class="diagram">
 capacity 4:   index:  0     1     2     3
               items: [ c ] [ - ] [ a ] [ b ]
                              ▲      ▲
                            tail   head        count = 3
 put(d) → items[tail] = d, tail = (tail+1) % 4
 take() → x = items[head], items[head] = null, head = (head+1) % 4</pre>`
    },
    {
      type: "steps",
      title: "Circular array: capacity 3",
      steps: [
        { title: "Khaali: head = tail = 0, count = 0", html: `<div class="arr"><span class="cell dim">-</span><span class="cell dim">-</span><span class="cell dim">-</span></div><div class="arr ptrs"><span class="cell">H T</span><span class="cell"></span><span class="cell"></span></div>` },
        { title: "put(a), put(b): tail 2 pe, count 2", html: `<div class="arr"><span class="cell hl">a</span><span class="cell hl">b</span><span class="cell dim">-</span></div><div class="arr ptrs"><span class="cell">H</span><span class="cell"></span><span class="cell">T</span></div>` },
        { title: "take() → a: head 1 pe, count 1", html: `<div class="arr"><span class="cell dim">-</span><span class="cell hl">b</span><span class="cell dim">-</span></div><div class="arr ptrs"><span class="cell"></span><span class="cell">H</span><span class="cell">T</span></div>` },
        { title: "put(c), put(d): tail ghoom ke 0 → 1 (wrap around). count 3 = full", html: `<div class="arr"><span class="cell hl">d</span><span class="cell hl">b</span><span class="cell hl">c</span></div><div class="arr ptrs"><span class="cell"></span><span class="cell">H T</span><span class="cell"></span></div>
            <p>head == tail ab <b>full</b> ka matlab hai, shuru mein <b>khaali</b> ka tha. Isliye alag <code>count</code> rakhte hain, warna dono case alag nahi ho paate.</p>` },
        { title: "put(e): count == 3 → producer notFull.await() pe so gaya", html: `<div class="arr"><span class="cell bad">d</span><span class="cell bad">b</span><span class="cell bad">c</span></div>
            <table class="lanes"><tr><th>Producer</th><td class="wait">notFull.await() (lock chhod diya)</td></tr><tr><th>Consumer</th><td class="run">lock milta hai → take() → b → notFull.signal()</td></tr></table>
            <p><code>await()</code> lock <b>chhod</b> ke sota hai, isliye consumer andar aa paata hai. Jaagne pe lock dobara leta hai.</p>` }
      ]
    },
    {
      type: "code",
      title: "Poora implementation + 3 producers, 2 consumers ka demo",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;

public class Main {
    static class BoundedBlockingQueue<T> {
        private final Object[] items;
        private int head, tail, count;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        BoundedBlockingQueue(int capacity) {
            if (capacity <= 0) throw new IllegalArgumentException("capacity > 0 chahiye");
            items = new Object[capacity];
        }

        void put(T x) throws InterruptedException {
            lock.lockInterruptibly();
            try {
                while (count == items.length) notFull.await();
                items[tail] = x;
                tail = (tail + 1) % items.length;
                count++;
                notEmpty.signal();           // ek consumer ko batao
            } finally {
                lock.unlock();
            }
        }

        @SuppressWarnings("unchecked")
        T take() throws InterruptedException {
            lock.lockInterruptibly();
            try {
                while (count == 0) notEmpty.await();
                T x = (T) items[head];
                items[head] = null;          // GC ke liye reference hatao
                head = (head + 1) % items.length;
                count--;
                notFull.signal();            // ek producer ko batao
                return x;
            } finally {
                lock.unlock();
            }
        }

        int size() {
            lock.lock();
            try { return count; } finally { lock.unlock(); }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        BoundedBlockingQueue<Integer> q = new BoundedBlockingQueue<>(2);
        AtomicInteger sum = new AtomicInteger();
        List<Thread> ts = new ArrayList<>();
        for (int p = 0; p < 3; p++) {
            int base = p * 100;
            ts.add(new Thread(() -> {
                for (int i = 1; i <= 100; i++) {
                    try { q.put(base + i); } catch (InterruptedException e) { return; }
                }
            }));
        }
        for (int c = 0; c < 2; c++) {
            ts.add(new Thread(() -> {
                for (int i = 0; i < 150; i++) {
                    try { sum.addAndGet(q.take()); } catch (InterruptedException e) { return; }
                }
            }));
        }
        for (Thread t : ts) t.start();
        for (Thread t : ts) t.join();
        System.out.println("sum = " + sum.get() + " (expected " + (300 * 301 / 2) + ")");
        System.out.println("end size = " + q.size());
    }
}`,
      note: "Capacity sirf 2 hai aur 300 items guzre, phir bhi koi item khoya nahi, koi double nahi. <code>lockInterruptibly()</code> se wait karte threads ko interrupt se roka ja sakta hai (shutdown ke liye zaroori)."
    },
    {
      type: "quiz",
      q: "Agar <code>notFull</code> aur <code>notEmpty</code> ki jagah <b>ek hi</b> Condition (ya synchronized + wait/notify) rakhein, to <code>signal()</code> / <code>notify()</code> ke saath kya bug aa sakta hai?",
      options: [
        "Koi bug nahi, bas thoda slow",
        "Producer ne item daala aur signal se doosra producer jaag gaya (consumer nahi). Wo full dekh ke phir so gaya, aur saare threads so sakte hain: program atak jaata hai",
        "Items do baar nikal jaayenge",
        "Compile error"
      ],
      answer: 1,
      why: "Ek hi waiting line mein producers aur consumers dono hote hain. <code>notify()</code> kisi ek ko random jagata hai; galat type ka thread jaage to wo phir wait karta hai aur signal 'kho' jaata hai. Fix: ya to <code>notifyAll()</code> (sabko jagao, mehenga par sahi), ya do alag Conditions (ye design). Isi wajah se ArrayBlockingQueue mein do conditions hain."
    },
    {
      type: "exercise",
      id: "ex-bounded-queue",
      title: "Apni BoundedBlockingQueue (LeetCode 1188 style)",
      level: "Medium",
      task: `<p><code>BoundedBlockingQueue</code> class poori karo (int values):</p>
        <ul>
          <li><code>BoundedBlockingQueue(int capacity)</code></li>
          <li><code>void enqueue(int x)</code>: full ho to block, phir peeche daalo</li>
          <li><code>int dequeue()</code>: khaali ho to block, phir aage se nikaalo (FIFO)</li>
          <li><code>int size()</code></li>
        </ul>
        <p><code>ReentrantLock</code> + <code>Condition</code>, ya <code>synchronized</code> + <code>wait/notifyAll</code>, kuch bhi. <b>Library queue (ArrayBlockingQueue etc.) use mat karo</b>: harness check karta hai. Harness kai producers/consumers chala ke dekhta hai ki har item exactly ek baar nikla, capacity kabhi nahi tooti, aur khaali/full pe block hua.</p>
        <p><a href="https://leetcode.com/problems/design-bounded-blocking-queue/" target="_blank">LeetCode 1188</a></p>`,
      examples: "capacity 2: <code>enqueue(1), enqueue(2), dequeue()</code> → <code>1</code>, <code>size()</code> → <code>1</code><br>khaali queue pe <code>dequeue()</code> tab tak rukta hai jab tak koi enqueue na kare",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.locks.*;

class BoundedBlockingQueue {
    private final LinkedList<Integer> list = new LinkedList<>();
    private final int capacity;

    BoundedBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    void enqueue(int x) throws InterruptedException {
        list.addLast(x);          // TODO: thread-safe + full pe wait
    }

    int dequeue() throws InterruptedException {
        return list.removeFirst(); // TODO: thread-safe + khaali pe wait
    }

    int size() {
        return list.size();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static <T> Object guarded(Callable<T> c, long ms) {
        AtomicReference<Object> out = new AtomicReference<>("atak gaya (deadlock / missed signal?)");
        Thread t = new Thread(() -> { try { out.set(c.call()); } catch (Throwable e) { out.set("💥 " + e); } });
        t.setDaemon(true);
        t.start();
        try { t.join(ms); } catch (InterruptedException e) { }
        return out.get();
    }

    static Thread daemon(Runnable r) { Thread t = new Thread(r); t.setDaemon(true); t.start(); return t; }

    public static void main(String[] args) throws Exception {
        Check.eq("FIFO: [dequeue, dequeue, size]", List.of(1, 2, 0), () -> guarded(() -> {
            BoundedBlockingQueue q = new BoundedBlockingQueue(2);
            q.enqueue(1); q.enqueue(2);
            return List.of(q.dequeue(), q.dequeue(), q.size());
        }, 1000));
        Check.eq("khaali pe dequeue wait kare, phir item mile", 42, () -> guarded(() -> {
            BoundedBlockingQueue q = new BoundedBlockingQueue(1);
            daemon(() -> { try { Thread.sleep(50); q.enqueue(42); } catch (InterruptedException e) { } });
            return q.dequeue();
        }, 1000));
        Check.hiddenFromHere();
        Check.eq("library queue use nahi ki", false, () -> {
            for (java.lang.reflect.Field f : BoundedBlockingQueue.class.getDeclaredFields()) {
                if (BlockingQueue.class.isAssignableFrom(f.getType())) return true;
            }
            return false;
        });
        Check.eq("full pe enqueue block kare: [50ms baad size, dequeue ke baad 3rd andar]", List.of(2, 2), () -> guarded(() -> {
            BoundedBlockingQueue q = new BoundedBlockingQueue(2);
            q.enqueue(1); q.enqueue(2);
            AtomicBoolean third = new AtomicBoolean();
            daemon(() -> { try { q.enqueue(3); third.set(true); } catch (InterruptedException e) { } });
            Thread.sleep(50);
            int sizeWhileBlocked = third.get() ? -1 : q.size();
            q.dequeue();
            for (int i = 0; i < 100 && !third.get(); i++) Thread.sleep(5);
            return List.of(sizeWhileBlocked, q.size());
        }, 1500));
        Check.eq("4 producers x 500, 3 consumers, cap 3: [sum, count, capacity kabhi tooti?]", List.of(2001000L, 2000, false), () -> guarded(() -> {
            BoundedBlockingQueue q = new BoundedBlockingQueue(3);
            AtomicLong sum = new AtomicLong();
            AtomicInteger got = new AtomicInteger();
            AtomicBoolean over = new AtomicBoolean();
            List<Thread> ts = new ArrayList<>();
            for (int p = 0; p < 4; p++) {
                int base = p * 500;
                ts.add(daemon(() -> {
                    for (int i = 1; i <= 500; i++) {
                        try { q.enqueue(base + i); if (q.size() > 3) over.set(true); } catch (InterruptedException e) { return; }
                    }
                }));
            }
            int[] share = {667, 667, 666};
            for (int c = 0; c < 3; c++) {
                int n = share[c];
                ts.add(daemon(() -> {
                    for (int i = 0; i < n; i++) {
                        try { sum.addAndGet(q.dequeue()); got.incrementAndGet(); } catch (InterruptedException e) { return; }
                    }
                }));
            }
            for (Thread t : ts) t.join(2500);
            return List.of(sum.get(), got.get(), over.get());
        }, 3000));
        Check.eq("capacity 1, ping-pong 300 items order", true, () -> guarded(() -> {
            BoundedBlockingQueue q = new BoundedBlockingQueue(1);
            daemon(() -> { for (int i = 0; i < 300; i++) { try { q.enqueue(i); } catch (InterruptedException e) { return; } } });
            for (int i = 0; i < 300; i++) if (q.dequeue() != i) return false;
            return true;
        }, 2000));
    }
}`,
      hints: [
        "Fields: <code>ReentrantLock lock</code>, <code>Condition notFull = lock.newCondition()</code>, <code>notEmpty</code>. LinkedList rakh sakte ho (ya circular array), bas har access lock ke andar.",
        "enqueue: <code>lock.lock(); try { while (list.size() == capacity) notFull.await(); list.addLast(x); notEmpty.signal(); } finally { lock.unlock(); }</code>",
        "dequeue ulta: <code>while (list.isEmpty()) notEmpty.await();</code> phir remove aur <code>notFull.signal()</code>. size() bhi lock ke andar padho."
      ],
      solution: `import java.util.*;
import java.util.concurrent.locks.*;

class BoundedBlockingQueue {
    private final int[] items;
    private int head, tail, count;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    BoundedBlockingQueue(int capacity) {
        items = new int[capacity];
    }

    void enqueue(int x) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (count == items.length) notFull.await();
            items[tail] = x;
            tail = (tail + 1) % items.length;
            count++;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    int dequeue() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (count == 0) notEmpty.await();
            int x = items[head];
            head = (head + 1) % items.length;
            count--;
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
        }
    }

    int size() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}`,
      explain: "<p>Circular array + count: O(1) enqueue/dequeue, memory fix. Ek lock teeno fields (head, tail, count) ko consistent rakhta hai. <b>while + await</b> spurious wakeup aur 'kisi aur ne pehle le liya' dono se bachata hai. Do conditions se <code>signal()</code> hamesha sahi type ke thread ko jagata hai.</p><p><code>size()</code> bhi lock ke andar: bina lock ke padhoge to visibility guarantee nahi (stale value mil sakti hai). Alternative: <code>count</code> ko volatile / AtomicInteger rakho.</p>"
    },
    {
      type: "think",
      id: "think-bq-followups",
      q: "Follow-ups: <b>\"(1) signal() ki jagah signalAll() kab chahiye? (2) Throughput kaise badhaoge? (3) offer(x, timeout) kaise add karoge?\"</b>",
      rubric: [
        { point: "Do alag conditions hain to signal() kaafi; ek shared condition ho to signalAll / notifyAll", keys: ["signalall", "notifyall", "ek condition", "single condition", "alag condition", "do condition"], weight: 2 },
        { point: "Throughput: <b>do locks</b> (putLock, takeLock) jaise LinkedBlockingQueue; count AtomicInteger", keys: ["do lock", "two lock", "putlock", "takelock", "linkedblockingqueue", "atomicinteger"], weight: 2 },
        { point: "Timeout: <b>awaitNanos</b> loop; time khatam to false return", keys: ["awaitnanos", "await(", "timeout", "nanos", "false return", "remaining"], weight: 2 },
        { point: "Lock-free / batching (drainTo) / Disruptor jaisa ring buffer", keys: ["lock-free", "lock free", "cas", "drainto", "batch", "disruptor", "ring buffer"] }
      ],
      answer: `<ol>
        <li><b>signal vs signalAll:</b> Yahan har condition pe ek hi type ke threads wait karte hain, aur ek put = ek jagah, isliye <code>signal()</code> kaafi hai (aur sasta). Agar sab ek hi condition/monitor pe wait karein (synchronized version), to <code>notifyAll()</code> zaroori, warna galat thread jaag ke signal kha jaata hai.</li>
        <li><b>Throughput:</b> producer aur consumer abhi ek hi lock ke liye ladte hain. LinkedBlockingQueue jaisa <b>two-lock</b> design: putLock tail ke liye, takeLock head ke liye, aur <code>AtomicInteger count</code>. Linked nodes chahiye taaki dono ends alag ho. Aur aage: batching (<code>drainTo</code>), ya LMAX Disruptor jaisa lock-free ring buffer.</li>
        <li><b>Timeout:</b> <code>long nanos = unit.toNanos(timeout); while (count == cap) { if (nanos &lt;= 0) return false; nanos = notFull.awaitNanos(nanos); }</code>. <code>awaitNanos</code> bacha hua time lautata hai, isliye spurious wakeup pe bhi total wait limit mein rehta hai.</li>
      </ol>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Likhne ke baad interviewer ke saamne khud 3 cheezein point karo: <i>\"await while loop mein hai, unlock finally mein hai, aur do conditions isliye ki signal galat thread ko na jaye.\"</i> Ye teen lines aapko 'jo samajh ke likh raha hai' wali category mein daal deti hain."
    }
  ],
  references: [
    { title: "Design Bounded Blocking Queue (LeetCode 1188)", by: "LeetCode", url: "https://leetcode.com/problems/design-bounded-blocking-queue/", type: "article" },
    { title: "Condition (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/Condition.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 14: Building custom synchronizers)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
