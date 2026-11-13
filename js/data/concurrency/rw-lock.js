// ReadWriteLock aur StampedLock
registerLesson("concurrency", "rw-lock", {
  why: "Zyaadatar systems read-heavy hote hain (product catalog, config, feature flags). Interview mein poochte hain: 'cache ko thread-safe kaise banaoge bina saare reads ko serialize kiye?'. ReadWriteLock iska jawab hai, aur 'read lock ko write mein upgrade kar sakte ho?' iska favourite trap.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: Flipkart ka product cache</h2>
        <p>Ek in-memory cache hai: har second hazaaron <b>reads</b> (product page), kabhi kabhi ek <b>write</b> (price update). Agar poora cache ek <code>synchronized</code> se protect karo, to do readers bhi ek doosre ka wait karenge, jabki do reads ek saath karne mein koi khatra nahi.</p>
        <p><b>ReadWriteLock</b> do locks deta hai:</p>
        <table>
          <tr><th>Kisi ke paas hai →<br>Naya maang raha ↓</th><th>Kuch nahi</th><th>Read lock (koi aur)</th><th>Write lock (koi aur)</th></tr>
          <tr><td><b>Read lock</b></td><td>✅ milega</td><td>✅ milega (shared)</td><td>❌ wait</td></tr>
          <tr><td><b>Write lock</b></td><td>✅ milega</td><td>❌ wait (sab readers nikalne tak)</td><td>❌ wait</td></tr>
        </table>
        <p>Kai readers ek saath, ya sirf ek writer akela. Java mein implementation: <code>ReentrantReadWriteLock</code>.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: R1, R2 saath padhte hain, W wait karta hai, phir R3 W ka wait",
      steps: [
        {
          title: "Step 1: R1 aur R2 dono read lock lete hain",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>R1</th><td class="lock">🔒 read</td><td class="run">get(price)</td><td></td><td></td></tr>
            <tr><th>R2</th><td class="lock">🔒 read</td><td class="run">get(stock)</td><td></td><td></td></tr>
            <tr><th>W</th><td></td><td></td><td></td><td></td></tr>
          </table><p>Read lock shared hai: dono ek saath andar.</p>`
        },
        {
          title: "Step 2: W ko write lock chahiye, readers andar hain: wait",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>R1</th><td class="lock">🔒 read</td><td class="run">get(price)</td><td>🔓</td><td></td></tr>
            <tr><th>R2</th><td class="lock">🔒 read</td><td class="run">get(stock)</td><td class="run">get(...)</td><td>🔓</td></tr>
            <tr><th>W</th><td></td><td class="wait">write chahiye: WAITING</td><td class="wait">WAITING</td><td class="wait">WAITING</td></tr>
          </table>`
        },
        {
          title: "Step 3: Saare readers nikle, W akela andar. R3 ab wait karta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t5</td><td>t6</td><td>t7</td></tr>
            <tr><th>W</th><td class="lock">🔒 write: price = 499</td><td>🔓</td><td></td></tr>
            <tr><th>R3</th><td class="wait">read chahiye: WAITING</td><td class="wait">WAITING</td><td class="lock">🔒 read → 499 dikhta hai</td></tr>
          </table><p>Writer ke time koi reader andar nahi, isliye koi adhoora update nahi padhta. Write unlock → read lock: happens-before, R3 ko naya price dikhta hai.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "3 readers ek saath andar, writer ko us waqt lock nahi milta (deterministic)",
      code: `import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Main {
    static final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
    static final Map<String, Integer> prices = new HashMap<>(Map.of("iphone", 79999, "pixel", 59999));

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch allInside = new CountDownLatch(3), release = new CountDownLatch(1);
        List<Thread> readers = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Thread r = new Thread(() -> {
                rw.readLock().lock();
                try {
                    prices.get("iphone");
                    allInside.countDown();   // main ko batao: main andar hoon
                    release.await();         // read lock pakde hue ruko
                } catch (InterruptedException e) {
                } finally {
                    rw.readLock().unlock();
                }
            }, "reader-" + i);
            readers.add(r);
            r.start();
        }

        allInside.await();
        System.out.println("Ek saath andar readers: " + rw.getReadLockCount());
        System.out.println("Writer ko abhi lock mila? " + rw.writeLock().tryLock());

        release.countDown();
        for (Thread r : readers) r.join();

        rw.writeLock().lock();
        try {
            prices.put("iphone", 74999);
            System.out.println("Readers nikal gaye, writer ne update kiya: iphone = " + prices.get("iphone"));
        } finally {
            rw.writeLock().unlock();
        }
    }
}`
    },
    {
      type: "warn",
      html: "⚠️ <b>Upgrade allowed nahi:</b> <code>ReentrantReadWriteLock</code> mein read lock pakde hue write lock maangoge to <b>hamesha ke liye atak jaoge</b>. Write lock tab milta hai jab koi reader na ho, aur reader aap khud ho. Do threads ek saath upgrade karein to dono ek doosre ka wait karenge. <b>Downgrade allowed hai:</b> write lock pakde hue read lock lo, phir write chhodo."
    },
    {
      type: "code",
      title: "Upgrade fail (tryLock se dikhaya, taaki atke nahi) vs downgrade chalta hai",
      code: `import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Main {
    public static void main(String[] args) {
        ReentrantReadWriteLock rw = new ReentrantReadWriteLock();

        // Upgrade: read -> write
        rw.readLock().lock();
        boolean upgraded = rw.writeLock().tryLock(); // lock() hota to yahin hamesha ke liye atak jaate
        System.out.println("Read pakde hue write mila? " + upgraded);
        rw.readLock().unlock();

        // Downgrade: write -> read
        rw.writeLock().lock();
        rw.readLock().lock();       // write holder read le sakta hai
        rw.writeLock().unlock();    // ab sirf read bacha
        System.out.println("Downgrade ke baad: write held? " + rw.isWriteLocked() + ", read count = " + rw.getReadLockCount());
        rw.readLock().unlock();
    }
}`
    },
    {
      type: "text",
      html: `
        <h2>StampedLock aur optimistic read (intro)</h2>
        <p>Java 8 ka <code>StampedLock</code> ek teesra mode deta hai: <b>optimistic read</b>. Idea: "lock mat lo, bas padh lo, phir check karo ki beech mein koi write to nahi hua."</p>
        <ol>
          <li><code>long stamp = sl.tryOptimisticRead();</code> (koi lock nahi, bas ek version number)</li>
          <li>Fields ko local variables mein copy karo.</li>
          <li><code>sl.validate(stamp)</code>: true = beech mein write nahi hua, copy sahi hai. False = normal <code>readLock()</code> leke dobara padho.</li>
        </ol>
        <p>Reads writers ko block hi nahi karte, isliye bahut read-heavy data pe tez hai. Par dhyaan do: StampedLock <b>reentrant nahi</b> hai, iska koi owner nahi hota, aur read/write views <code>Condition</code> support nahi karte. Galat use = deadlock ya galat data, isliye simple cases mein ReentrantReadWriteLock theek hai.</p>`
    },
    {
      type: "code",
      title: "StampedLock: optimistic read valid, phir write ke baad invalid → fallback",
      code: `import java.util.concurrent.locks.StampedLock;

public class Main {
    static final StampedLock sl = new StampedLock();
    static double lat = 19.07, lng = 72.87; // delivery partner ki location

    static void move(double newLat, double newLng) {
        long stamp = sl.writeLock();
        try {
            lat = newLat;
            lng = newLng;
        } finally {
            sl.unlockWrite(stamp);
        }
    }

    static String readLocation(boolean simulateWriteInBetween) {
        long stamp = sl.tryOptimisticRead();       // koi lock nahi
        double a = lat, b = lng;                   // local copy
        if (simulateWriteInBetween) move(28.61, 77.20); // demo: beech mein write
        if (!sl.validate(stamp)) {                 // write hua? copy bharose layak nahi
            stamp = sl.readLock();
            try {
                a = lat;
                b = lng;
            } finally {
                sl.unlockRead(stamp);
            }
            return "validate fail → read lock se dobara padha: " + a + ", " + b;
        }
        return "optimistic read valid: " + a + ", " + b;
    }

    public static void main(String[] args) {
        System.out.println(readLocation(false));
        System.out.println(readLocation(true));
    }
}`
    },
    {
      type: "quiz",
      q: "Ek cache mein reads aur writes <b>barabar</b> (50/50) hain, aur har operation bas ek HashMap get/put hai (microseconds). ReadWriteLock se kitna fayda hoga?",
      options: [
        "Bahut zyada, reads hamesha parallel hote hain",
        "Shayad koi fayda nahi, ya nuksaan: writes baar baar sab readers ko rokte hain aur RW lock ka apna overhead simple lock se zyada hai",
        "ReadWriteLock writes ko bhi parallel kar deta hai",
        "Deadlock hoga"
      ],
      answer: 1,
      why: "RW lock tab chamakta hai jab reads bahut zyada hon aur read ka kaam thoda lamba ho. Write-heavy ya bahut chhote critical sections mein uska bookkeeping overhead fayde se zyada ho sakta hai. Simple map ke liye <code>ConcurrentHashMap</code> aksar sabse achha hai."
    },
    {
      type: "pick",
      id: "pick-rwlock-fit",
      q: "Kahan <b>ReadWriteLock</b> sahi choice hai?",
      options: [
        { text: "Feature flags config: har request padhta hai, admin din mein 2 baar badalta hai", correct: true, why: "Bahut read-heavy, reads parallel." },
        { text: "Routing table jisko har request lookup karta hai, aur deploy pe update hoti hai", correct: true, why: "Read-heavy, writes kam." },
        { text: "Order counter jo har request pe badhta hai", correct: false, why: "Har operation write hai. AtomicLong/LongAdder lo." },
        { text: "Bank account jahan har call balance check + deduct karta hai", correct: false, why: "Har call write karta hai; read lock pe check karke write lock lena = race (upgrade nahi hota). Simple lock lo." },
        { text: "Bada in-memory product catalog jahan read ek complex search hai aur hourly refresh", correct: true, why: "Lambe reads parallel chalenge. (Alternative: naya immutable catalog bana ke volatile reference swap, reads ko lock hi nahi chahiye.)" }
      ]
    },
    {
      type: "exercise",
      id: "ex-rw-cache",
      title: "Read-heavy cache: getOrLoad bina duplicate load ke",
      level: "Medium",
      task: `<p><code>getOrLoad(key, loader)</code>: key cache mein hai to wahi value do. Nahi hai to <code>loader.apply(key)</code> se load karo (ye DB call jaisa slow hai), cache mein daalo, value do.</p>
        <p>Requirement: agar 8 threads <b>ek saath</b> same missing key maangein, to <b>loader sirf ek baar</b> chale (DB pe 8 queries nahi, isko cache stampede kehte hain). Reads (<code>get</code>) <code>ReadWriteLock</code> ke read lock se hon, taaki parallel chalein.</p>
        <p>Starter code reads sahi karta hai, par miss pe har thread khud load karta hai. Dhyaan: read lock pakde hue write lock mat maangna (upgrade = hamesha ke liye atak jaoge; harness timeout se pakad lega).</p>`,
      examples: "8 threads × <code>getOrLoad(\"pizza\", loader)</code> ek saath → sab ko same value, loader calls = <code>1</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.Function;
import java.util.concurrent.locks.*;

class Solution {
    private final Map<String, String> map = new HashMap<>();
    private final ReadWriteLock rw = new ReentrantReadWriteLock();

    String get(String key) {
        rw.readLock().lock();
        try {
            return map.get(key);
        } finally {
            rw.readLock().unlock();
        }
    }

    String getOrLoad(String key, Function<String, String> loader) {
        String v = get(key);
        if (v != null) return v;
        v = loader.apply(key);          // miss: load
        rw.writeLock().lock();
        try {
            map.put(key, v);
        } finally {
            rw.writeLock().unlock();
        }
        return v;
    }
}`,
      harness: `import seekho.Check;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;
import java.util.function.Function;

public class Main {
    // 'threads' threads, 'keys' alag keys pe ek saath getOrLoad. Return [loader calls, sab results sahi?] ya "atak gaya"
    static Object stampede(int threads, int keys) {
        Solution s = new Solution();
        AtomicInteger calls = new AtomicInteger();
        Function<String, String> loader = k -> {
            calls.incrementAndGet();
            try { Thread.sleep(40); } catch (InterruptedException e) { }
            return "value-of-" + k;
        };
        CountDownLatch go = new CountDownLatch(1);
        List<String> results = Collections.synchronizedList(new ArrayList<>());
        List<Thread> ts = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            String key = "k" + (i % keys);
            Thread t = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                String v = s.getOrLoad(key, loader);
                results.add(key + "=" + v);
            });
            t.setDaemon(true);
            t.start();
            ts.add(t);
        }
        go.countDown();
        long deadline = System.currentTimeMillis() + 2000;
        try { for (Thread t : ts) t.join(Math.max(1, deadline - System.currentTimeMillis())); } catch (InterruptedException e) { }
        for (Thread t : ts) if (t.isAlive()) return "atak gaya (read lock pakde hue write lock maanga?)";
        boolean ok = results.size() == threads;
        for (String r : results) {
            String[] p = r.split("=");
            ok &= p[1].equals("value-of-" + p[0]);
        }
        return List.of(calls.get(), ok);
    }

    static String lockKind() {
        for (Field f : Solution.class.getDeclaredFields()) {
            if (ReadWriteLock.class.isAssignableFrom(f.getType()) || f.getType() == StampedLock.class) return "ReadWriteLock";
        }
        return "ReadWriteLock field nahi mila";
    }

    public static void main(String[] args) {
        Check.eq("hit: pehle load, phir dobara (loader 1 baar)", List.of("value-of-a", "value-of-a", 1), () -> {
            Solution s = new Solution();
            AtomicInteger calls = new AtomicInteger();
            Function<String, String> loader = k -> { calls.incrementAndGet(); return "value-of-" + k; };
            return List.of(s.getOrLoad("a", loader), s.getOrLoad("a", loader), calls.get());
        });
        Check.eq("8 threads, 1 key, ek saath: [loader calls, results sahi]", List.of(1, true), () -> stampede(8, 1));
        Check.hiddenFromHere();
        Check.eq("missing key ka get() null", true, () -> new Solution().get("nahi-hai") == null);
        Check.eq("8 threads, 2 keys: [loader calls, results sahi]", List.of(2, true), () -> stampede(8, 2));
        Check.eq("12 threads, 3 keys", List.of(3, true), () -> stampede(12, 3));
        Check.eq("ReadWriteLock use hua?", "ReadWriteLock", Main::lockKind);
    }
}`,
      hints: [
        "Fast path: read lock se dekho. Miss hua to write lock lo.",
        "Write lock milne tak koi aur thread load kar chuka ho sakta hai. Write lock ke andar <b>dobara check</b> karo (double-checked).",
        "Write lock ke andar: <code>v = map.get(key); if (v == null) { v = loader.apply(key); map.put(key, v); }</code>. Read lock pehle hi chhod chuke ho (get() ke andar), isliye upgrade wali problem nahi."
      ],
      solution: `import java.util.*;
import java.util.function.Function;
import java.util.concurrent.locks.*;

class Solution {
    private final Map<String, String> map = new HashMap<>();
    private final ReadWriteLock rw = new ReentrantReadWriteLock();

    String get(String key) {
        rw.readLock().lock();
        try {
            return map.get(key);
        } finally {
            rw.readLock().unlock();
        }
    }

    String getOrLoad(String key, Function<String, String> loader) {
        String v = get(key);              // fast path: read lock (parallel)
        if (v != null) return v;
        rw.writeLock().lock();            // read lock chhoot chuka hai, upgrade nahi
        try {
            v = map.get(key);             // dobara check: shayad kisi ne load kar diya
            if (v == null) {
                v = loader.apply(key);
                map.put(key, v);
            }
            return v;
        } finally {
            rw.writeLock().unlock();
        }
    }
}`,
      explain: "<p>Hit pe sirf read lock (sab parallel). Miss pe write lock, aur andar <b>double-check</b>: pehla thread load karta hai, baaki threads jab write lock lete hain to value mil jaati hai, loader dobara nahi chalta.</p><p>Trade-off: load ke time (40ms) write lock pakda hai, to us dauraan <b>saare</b> reads (doosri keys ke bhi) rukte hain. Production mein behtar: <code>ConcurrentHashMap&lt;K, CompletableFuture&lt;V&gt;&gt;</code> + <code>computeIfAbsent</code>, jisse sirf usi key ke callers wait karein (per-key single flight), ya Caffeine jaisi library.</p>"
    },
    {
      type: "think",
      id: "think-rw-cache",
      q: "Interview question: <b>\"Ek in-memory config cache hai: 10,000 reads/sec, 1 write/minute. Isko thread-safe kaise banaoge? ReadWriteLock ke alawa koi option?\"</b>",
      rubric: [
        { point: "<b>ReadWriteLock</b>: reads shared, write exclusive", keys: ["readwritelock", "read write lock", "read lock", "reentrantreadwritelock", "rw lock"], weight: 2 },
        { point: "Read se write <b>upgrade nahi</b> hota, double-check pattern", keys: ["upgrade", "double check", "double-check", "dobara check"] },
        { point: "Alternative: <b>immutable snapshot + volatile reference swap</b> (copy-on-write), reads bina lock", keys: ["immutable", "volatile", "swap", "copy on write", "copy-on-write", "atomicreference", "snapshot"], weight: 2 },
        { point: "<b>ConcurrentHashMap</b> / <b>StampedLock optimistic read</b> bhi options", keys: ["concurrenthashmap", "stampedlock", "optimistic"] },
        { point: "Trade-off: writer starvation / fairness, write-heavy pe fayda nahi", keys: ["starvation", "fair", "write heavy", "write-heavy", "overhead"] }
      ],
      answer: `<p><b>Option 1: ReentrantReadWriteLock.</b> <code>get</code> read lock mein, <code>refresh</code> write lock mein. 10k readers parallel, writer akela. Yaad rakho: read se write upgrade nahi hota, aur default non-fair mode mein lagaatar readers writer ko der karwa sakte hain (fair mode option hai).</p>
        <p><b>Option 2 (yahan aksar best): immutable snapshot.</b> Config ko immutable <code>Map</code> mein rakho, <code>volatile</code> (ya <code>AtomicReference</code>) field mein. Refresh = naya map banao, reference swap karo. Reads pe koi lock hi nahi, sirf ek volatile read. Write 1/minute hai, to har baar copy banana sasta hai.</p>
        <p><b>Option 3:</b> <code>ConcurrentHashMap</code> agar keys alag alag update hoti hain. <code>StampedLock</code> optimistic read agar profiling mein RW lock bottleneck dikhe.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> ReadWriteLock ka naam lene ke baad turant bolo: <i>\"read lock ko write mein upgrade nahi kar sakte, deadlock hoga; isliye miss pe read chhod ke write lo aur double-check karo.\"</i> Ye ek line batati hai ki aapne ise sach mein use kiya hai."
    }
  ],
  references: [
    { title: "ReadWriteLock (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/ReadWriteLock.html", type: "docs" },
    { title: "ReentrantReadWriteLock (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/ReentrantReadWriteLock.html", type: "docs" },
    { title: "StampedLock (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/StampedLock.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 13: Explicit Locks)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
