// ConcurrentHashMap
registerLesson("concurrency", "chm", {
  why: "ConcurrentHashMap Java interviews ka top-5 topic hai: Hashtable vs synchronizedMap vs CHM, Java 7 segments vs Java 8 CAS + synchronized, null kyun allowed nahi, aur 'get phir put' atomic kyun nahi. Production mein caches, counters aur registries isi pe bante hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: live match ke view counts</h2>
        <p>Hotstar pe 50 matches/shows live hain. Har request thread <code>views[matchId]++</code> karta hai. Plain <code>HashMap</code> kai threads se:</p>
        <ul>
          <li><b>Lost updates</b>: do threads ne 100 padha, dono ne 101 likha.</li>
          <li><b>Structure kharaab</b>: do threads ek saath resize karein to entries gum ho sakti hain (Java 7 tak infinite loop wala famous bug bhi tha). HashMap ki docs saaf kehti hain: ye synchronized nahi hai.</li>
        </ul>
        <h3>Teen thread-safe options</h3>
        <table>
          <tr><th></th><th><code>Hashtable</code></th><th><code>Collections.synchronizedMap(m)</code></th><th><code>ConcurrentHashMap</code></th></tr>
          <tr><td>Locking</td><td>Har method <code>synchronized</code> (poore map pe ek lock)</td><td>Wrapper: har method ek mutex pe (poora map)</td><td>Reads bina lock; writes sirf us <b>bin</b> pe (CAS ya bin head pe synchronized)</td></tr>
          <tr><td>Concurrent reads</td><td>Ek time pe ek</td><td>Ek time pe ek</td><td>Saare ek saath</td></tr>
          <tr><td>Concurrent writes</td><td>Ek time pe ek</td><td>Ek time pe ek</td><td>Alag bins pe parallel</td></tr>
          <tr><td>null key/value</td><td>Nahi (NPE)</td><td>Jo andar wala map allow kare (HashMap: haan)</td><td><b>Nahi</b> (NPE)</td></tr>
          <tr><td>Iteration jab doosra thread likhe</td><td>Iterators fail-fast (CME); purane <code>keys()</code>/<code>elements()</code> enumerations fail-fast nahi</td><td>Fail-fast; iterate karte waqt <b>khud</b> <code>synchronized(map)</code> karna padta hai</td><td><b>Weakly consistent</b>: koi CME nahi, kuch naye changes dikh bhi sakte hain, nahi bhi</td></tr>
          <tr><td>Atomic compound ops</td><td>Khud lock karo</td><td>Khud lock karo</td><td><code>putIfAbsent</code>, <code>compute*</code>, <code>merge</code> (per key atomic)</td></tr>
          <tr><td>Aaj kal</td><td>Legacy, mat use karo</td><td>Kabhi kabhi (TreeMap wrap karna ho)</td><td>Default choice</td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "Trap: thread-safe map pe bhi 'get phir put' race hai",
      steps: [
        {
          title: "Step 1: T1 aur T2 dono get(\"ind-aus\") = 100 padhte hain",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>T1</th><td class="run">get → 100</td><td></td><td></td></tr>
            <tr><th>T2</th><td class="run">get → 100</td><td></td><td></td></tr>
            <tr><th>map</th><td>ind-aus=100</td><td></td><td></td></tr>
          </table><p>Har single call (get, put) thread-safe hai. Par do calls ke <b>beech</b> koi lock nahi.</p>`
        },
        {
          title: "Step 2: dono put(101). Ek view gum",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>T1</th><td class="run">get → 100</td><td class="lock">put 101</td><td></td></tr>
            <tr><th>T2</th><td class="run">get → 100</td><td></td><td class="bad">put 101 (overwrite)</td></tr>
            <tr><th>map</th><td>ind-aus=100</td><td>101</td><td class="bad">101 (102 hona tha)</td></tr>
          </table>`
        },
        {
          title: "Fix: merge(\"ind-aus\", 1, Integer::sum): read-modify-write ek atomic call",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>T1</th><td class="lock">merge: bin lock, 100→101</td><td></td><td></td></tr>
            <tr><th>T2</th><td class="block">same bin: wait</td><td class="lock">merge: 101→102</td><td></td></tr>
            <tr><th>map</th><td>101</td><td class="ok">102 ✅</td><td></td></tr>
          </table><p>Sirf <b>same bin</b> wale writes line mein lagte hain. Doosre matches ke counters parallel update hote hain.</p>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Atomic methods (per key)</h2>
        <table>
          <tr><th>Method</th><th>Kya karta hai</th><th>Use case</th></tr>
          <tr><td><code>putIfAbsent(k, v)</code></td><td>Key nahi hai to daalo; return purani value ya null</td><td>"Pehli baar" registration</td></tr>
          <tr><td><code>computeIfAbsent(k, fn)</code></td><td>Key nahi hai to <code>fn(k)</code> se value banao aur daalo. Docs: fn har call mein max ek baar, poora call atomic</td><td>Cache loader, multimap: <code>map.computeIfAbsent(city, c -&gt; new ConcurrentLinkedQueue&lt;&gt;()).add(order)</code></td></tr>
          <tr><td><code>compute(k, (k, old) -&gt; new)</code></td><td>Purani value se nayi; null return = key hata do</td><td>Conditional update</td></tr>
          <tr><td><code>merge(k, v, fn)</code></td><td>Key nahi to v, hai to <code>fn(old, v)</code>; null = remove</td><td>Counters: <code>merge(k, 1, Integer::sum)</code></td></tr>
          <tr><td><code>getOrDefault</code>, <code>replace(k, old, new)</code>, <code>remove(k, v)</code></td><td>CAS-style conditional ops</td><td>Optimistic update</td></tr>
          <tr><td><code>ConcurrentHashMap.newKeySet()</code></td><td>Thread-safe Set</td><td>Seen users, dedup</td></tr>
          <tr><td><code>mappingCount()</code></td><td><code>size()</code> jaisa par <code>long</code></td><td>Bade maps</td></tr>
        </table>
        <p>Docs ki shart: compute/merge ka function <b>chhota aur simple</b> ho (us bin ke doosre writes wait karte hain), aur function ke andar <b>isi map ko modify mat karo</b>.</p>`
    },
    {
      type: "code",
      title: "merge se counters exact, computeIfAbsent se loader har key ke liye sirf ek baar",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> views = new ConcurrentHashMap<>();
        String[] matches = {"ind-aus", "eng-pak", "csk-mi"};
        Thread[] ts = new Thread[4];
        for (int t = 0; t < 4; t++) {
            ts[t] = new Thread(() -> {
                for (int i = 0; i < 3000; i++) views.merge(matches[i % 3], 1, Integer::sum);
            });
            ts[t].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("views: " + new TreeMap<>(views) + " (har ek 4000)");

        // Cache: 8 threads ek saath same key maangte hain, DB load sirf ek baar
        ConcurrentHashMap<Integer, String> menuCache = new ConcurrentHashMap<>();
        AtomicInteger dbLoads = new AtomicInteger();
        CountDownLatch go = new CountDownLatch(1);
        Thread[] readers = new Thread[8];
        for (int r = 0; r < 8; r++) {
            readers[r] = new Thread(() -> {
                try { go.await(); } catch (InterruptedException e) { }
                menuCache.computeIfAbsent(42, id -> {
                    dbLoads.incrementAndGet();          // mehenga DB call
                    return "menu of restaurant " + id;
                });
            });
            readers[r].start();
        }
        go.countDown();
        for (Thread t : readers) t.join();
        System.out.println("cache: " + menuCache + ", DB loads = " + dbLoads.get());
    }
}`,
      note: "Plain HashMap mein <code>map.put(k, map.get(k) + 1)</code> asli multi-core machine pe 12000 se kam deta. Browser JVM ek CPU pe threads chalata hai, isliye wahan race kam dikhti hai; isi liye race ko upar timeline se samjhaya."
    },
    {
      type: "code",
      title: "null allowed nahi, aur iteration ke dauraan modify: HashMap CME deta hai, CHM nahi",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, String> chm = new ConcurrentHashMap<>();
        try {
            chm.put("coupon", null);
        } catch (NullPointerException e) {
            System.out.println("CHM null value: NullPointerException");
        }
        try {
            chm.put(null, "x");
        } catch (NullPointerException e) {
            System.out.println("CHM null key: NullPointerException");
        }

        Map<Integer, String> hm = new HashMap<>(Map.of(1, "a", 2, "b", 3, "c"));
        try {
            for (Integer k : hm.keySet()) hm.put(k + 10, "new");
        } catch (ConcurrentModificationException e) {
            System.out.println("HashMap: iterate karte waqt put → ConcurrentModificationException");
        }

        ConcurrentHashMap<Integer, String> cm = new ConcurrentHashMap<>(Map.of(1, "a", 2, "b", 3, "c"));
        for (Integer k : cm.keySet()) {
            if (k < 10) cm.put(k + 10, "new");   // weakly consistent iterator: koi exception nahi
        }
        System.out.println("CHM: koi exception nahi, size ab " + cm.size());
    }
}`,
      note: "Null kyun nahi: concurrent map mein <code>get(k)</code> null de to matlab \"key nahi hai\". Agar null values allowed hoti, to <code>containsKey</code> se pakka karna padta, aur do calls ke beech koi doosra thread map badal deta. CHM ne ambiguity hi hata di."
    },
    {
      type: "text",
      html: `
        <h2>Internals: Java 7 vs Java 8+</h2>
        <p><b>Java 7:</b> map <b>Segments</b> mein bata tha (default concurrencyLevel 16). Har segment ek chhota hash table + apna <code>ReentrantLock</code>. Max ~16 writers parallel.</p>
        <p><b>Java 8+ (aaj ka CHM):</b> segments hata diye. Ek hi <code>Node[] table</code>, HashMap jaisa:</p>
        <pre class="diagram">
 table:  [0]  [1]          [2]   [3]                 ...
          |    |            |     |
         null  A -&gt; B       null  TreeBin (8+ nodes, table &gt;= 64)
               ^
               bin head: isi pe synchronized jab bin khaali nahi</pre>
        <ul>
          <li><b>get():</b> koi lock nahi. Table aur node fields <code>volatile</code> reads se padhe jaate hain.</li>
          <li><b>put() khaali bin mein:</b> <b>CAS</b> se node daalo (koi lock nahi).</li>
          <li><b>put() bhare bin mein:</b> us bin ke <b>pehle node</b> pe <code>synchronized</code>. Sirf usi bin ke writers rukte hain.</li>
          <li><b>Treeify:</b> ek bin mein 8 se zyada nodes aur table ≥ 64 → red-black tree (HashMap jaisa), worst case O(log n).</li>
          <li><b>Resize:</b> kai threads mil ke transfer karte hain; shift ho chuke bins mein ek <code>ForwardingNode</code> marker hota hai jo naye table ki taraf bhejta hai.</li>
          <li><b>size():</b> ek <code>baseCount</code> + <code>CounterCell[]</code> (LongAdder jaisa idea) ka sum. Updates chal rahe hon to result ek <b>estimate</b> hai, us pal ki exact snapshot nahi. Docs bhi kehti hain ki size/isEmpty jaise aggregate methods concurrent updates ke dauraan transient state dikhate hain.</li>
          <li><code>concurrencyLevel</code> constructor param ab sirf initial size ka hint hai.</li>
        </ul>`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b><ul><li><code>if (!map.containsKey(k)) map.put(k, v);</code>: CHM pe bhi race. <code>putIfAbsent</code> / <code>computeIfAbsent</code> use karo.</li><li><code>computeIfAbsent</code> ke function mein mehenga remote call: us bin ke baaki writes us dauraan ruk jaate hain. Function chhota rakho, ya value ke roop mein <code>CompletableFuture</code> rakho.</li><li>Function ke andar <b>usi map</b> mein doosri key daalna (recursive compute): docs mana karti hain; Java 9+ mein ye aksar <code>IllegalStateException: Recursive update</code> deta hai.</li><li><code>size() == 0</code> se \"koi kaam baaki nahi\" decide karna jab writers chal rahe hon: size ek estimate hai.</li></ul>"
    },
    {
      type: "quiz",
      q: "ConcurrentHashMap (Java 8+) mein do threads ek saath <b>alag bins</b> wali keys pe <code>put</code> karte hain, aur teesra thread <code>get</code> karta hai. Kaun kiska wait karega?",
      options: [
        "Teeno ek doosre ka, kyunki poore map pe ek lock hai",
        "Dono writers ek doosre ka (segment lock), reader free",
        "Koi kisi ka nahi: alag bins pe writes alag (CAS ya us bin ka lock), aur get lock leta hi nahi",
        "Reader dono writers ka wait karega"
      ],
      answer: 2,
      why: "Java 8+ mein locking bin-level pe hai (khaali bin = CAS, warna bin head pe synchronized). Reads volatile se, bina lock. Poore map ka lock Hashtable/synchronizedMap ki problem hai."
    },
    {
      type: "quiz",
      q: "8 threads <code>chm.merge(key, 1, Integer::sum)</code> chala rahe hain. Beech mein ek monitoring thread <code>chm.size()</code> padhta hai. Kya guarantee hai?",
      options: [
        "size() hamesha us pal ka exact count deta hai",
        "size() ConcurrentModificationException de sakta hai",
        "size() ek estimate hai jab updates chal rahe hon; updates ruk jaane ke baad exact",
        "size() writers ko block karta hai jab tak count na ho jaaye"
      ],
      answer: 2,
      why: "size() counter cells ka sum hai, koi global lock nahi. Concurrent updates ke dauraan transient value; monitoring ke liye theek, par correctness logic ke liye nahi."
    },
    {
      type: "exercise",
      id: "ex-chm-pages",
      title: "Page hit counter + first visit: ConcurrentHashMap se",
      level: "Medium",
      task: `<p>Analytics service ke liye class banao:</p>
        <ul>
          <li><code>hit(page)</code>: page ka count +1.</li>
          <li><code>count(page)</code>: abhi tak ke hits (koi hit nahi to 0).</li>
          <li><code>firstVisit(user)</code>: is user ki pehli call pe <code>true</code>, uske baad hamesha <code>false</code>, chahe 10 threads ek saath call karein.</li>
        </ul>
        <p>Starter <code>HashMap</code> aur check-then-act use karta hai (<code>Thread.yield()</code> race window badhata hai, mat hatao). <b>ConcurrentHashMap</b> ke atomic methods se theek karo (harness check karta hai ki fields <code>ConcurrentHashMap</code> ya uska key-set hain).</p>`,
      examples: "<code>hit(\"/home\")</code> x3 → <code>count(\"/home\")</code> = 3<br><code>firstVisit(\"riya\")</code> → true, phir → false",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    private final Map<String, Long> hits = new HashMap<>();
    private final Map<String, Boolean> seen = new HashMap<>();

    void hit(String page) {
        Long old = hits.get(page);
        Thread.yield();                      // race window (mat hatao)
        hits.put(page, old == null ? 1L : old + 1);
    }

    long count(String page) {
        Long c = hits.get(page);
        return c == null ? 0 : c;
    }

    boolean firstVisit(String user) {
        if (seen.containsKey(user)) return false;
        Thread.yield();                      // race window (mat hatao)
        seen.put(user, true);
        return true;
    }
}`,
      harness: `import seekho.Check;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static Thread daemon(Runnable r) {
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.start();
        return t;
    }

    static void joinAll(List<Thread> ts) {
        long deadline = System.currentTimeMillis() + 3000;
        for (Thread t : ts) {
            try { t.join(Math.max(1, deadline - System.currentTimeMillis())); } catch (InterruptedException e) { }
        }
    }

    static String fieldsOk() {
        Solution s = new Solution();
        int ok = 0, total = 0;
        for (Field f : Solution.class.getDeclaredFields()) {
            f.setAccessible(true);
            try {
                Object v = f.get(s);
                if (v instanceof Map || v instanceof Set) {
                    total++;
                    if (v instanceof ConcurrentHashMap || v instanceof ConcurrentHashMap.KeySetView) ok++;
                }
            } catch (IllegalAccessException e) { }
        }
        return total > 0 && ok == total ? "sab ConcurrentHashMap" : ok + "/" + total + " concurrent";
    }

    static List<Object> rush(int threads, int perThread) {
        Solution s = new Solution();
        String[] pages = {"/home", "/menu", "/cart", "/pay", "/track"};
        CountDownLatch go = new CountDownLatch(1);
        List<Thread> ts = new ArrayList<>();
        for (int t = 0; t < threads; t++) {
            ts.add(daemon(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int i = 0; i < perThread; i++) s.hit(pages[i % pages.length]);
            }));
        }
        go.countDown();
        joinAll(ts);
        List<Object> out = new ArrayList<>();
        for (String p : pages) out.add(s.count(p));
        return out;
    }

    static int winners(int threads, int users) {
        Solution s = new Solution();
        AtomicInteger trues = new AtomicInteger();
        CountDownLatch go = new CountDownLatch(1);
        List<Thread> ts = new ArrayList<>();
        for (int t = 0; t < threads; t++) {
            ts.add(daemon(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int u = 0; u < users; u++) if (s.firstVisit("user" + u)) trues.incrementAndGet();
            }));
        }
        go.countDown();
        joinAll(ts);
        return trues.get();
    }

    public static void main(String[] args) {
        Check.eq("single thread: [count /home, count /x, first, second]", List.of(3L, 0L, true, false), () -> {
            Solution s = new Solution();
            s.hit("/home"); s.hit("/home"); s.hit("/home");
            return List.of(s.count("/home"), s.count("/x"), s.firstVisit("riya"), s.firstVisit("riya"));
        });
        Check.eq("8 threads x 2000 hits, 5 pages", List.of(3200L, 3200L, 3200L, 3200L, 3200L), () -> rush(8, 2000));
        Check.hiddenFromHere();
        Check.eq("fields ConcurrentHashMap hain?", "sab ConcurrentHashMap", Main::fieldsOk);
        Check.eq("10 threads x 300 users: firstVisit true exactly 300 baar", 300, () -> winners(10, 300));
        Check.eq("16 threads x 1000 hits", List.of(3200L, 3200L, 3200L, 3200L, 3200L), () -> rush(16, 1000));
        Check.eq("alag users alag", List.of(true, true, false), () -> {
            Solution s = new Solution();
            return List.of(s.firstVisit("a"), s.firstVisit("b"), s.firstVisit("a"));
        });
    }
}`,
      hints: [
        "Fields: <code>ConcurrentHashMap&lt;String, Long&gt; hits</code> aur <code>Set&lt;String&gt; seen = ConcurrentHashMap.newKeySet()</code>.",
        "<code>hit</code>: <code>hits.merge(page, 1L, Long::sum);</code> (yield ko merge se pehle rakh sakte ho). <code>count</code>: <code>hits.getOrDefault(page, 0L)</code>.",
        "<code>firstVisit</code>: <code>seen.add(user)</code> atomic hai aur true tabhi deta hai jab pehle nahi tha. (Ya <code>map.putIfAbsent(user, true) == null</code>.)"
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    private final ConcurrentHashMap<String, Long> hits = new ConcurrentHashMap<>();
    private final Set<String> seen = ConcurrentHashMap.newKeySet();

    void hit(String page) {
        Thread.yield();
        hits.merge(page, 1L, Long::sum);     // read-modify-write ek atomic call
    }

    long count(String page) {
        return hits.getOrDefault(page, 0L);
    }

    boolean firstVisit(String user) {
        Thread.yield();
        return seen.add(user);               // atomic: sirf pehla add true deta hai
    }
}`,
      explain: "<p><code>merge</code> get + compute + put ko ek atomic per-key operation bana deta hai, aur sirf us key ke bin pe lock lagta hai, isliye alag pages parallel update hote hain. <code>newKeySet().add()</code> andar <code>putIfAbsent</code> hai: kitne bhi threads ek saath aayein, exactly ek ko true milta hai. Har op average O(1).</p><p>Bahut hot counter (ek hi page pe lakhs hits/sec) ho to value ke roop mein <code>LongAdder</code> rakho: <code>hits.computeIfAbsent(page, p -&gt; new LongAdder()).increment()</code>. Isse same bin pe contention bhi kam hota hai.</p>"
    },
    {
      type: "think",
      id: "think-chm-internals",
      q: "Interview question: <b>\"ConcurrentHashMap andar se kaise kaam karta hai? Java 7 aur Java 8 mein kya badla? Aur ye null keys/values kyun allow nahi karta?\"</b>",
      rubric: [
        { point: "Java 7: <b>segments</b> (default 16), har segment ka apna ReentrantLock", keys: ["segment", "16", "reentrantlock", "java 7"], weight: 2 },
        { point: "Java 8+: segments nahi; khaali bin pe <b>CAS</b>, warna <b>bin head pe synchronized</b>", keys: ["cas", "compare and swap", "bin", "synchronized", "head", "first node", "bucket"], weight: 2 },
        { point: "get() <b>lock-free</b> (volatile reads)", keys: ["lock-free", "lock free", "bina lock", "volatile", "no lock"] },
        { point: "Treeify (8+, table ≥ 64), multi-thread resize (ForwardingNode), size counter cells / estimate", keys: ["tree", "red-black", "treeify", "resize", "forwarding", "countercell", "estimate", "longadder"] },
        { point: "Null nahi: get() null = absent, ambiguity concurrent mein check nahi kar sakte", keys: ["ambigu", "absent", "containskey", "null matlab", "null means", "do calls"], weight: 2 }
      ],
      answer: `<p><b>Java 7:</b> map 16 (default concurrencyLevel) <b>segments</b> mein bata tha, har segment ek chhota hash table jo <code>ReentrantLock</code> extend karta tha. Alag segments pe writes parallel.</p>
        <p><b>Java 8+:</b> segments hata diye. Ek <code>Node[]</code> table. <code>get()</code> bina lock (volatile reads). <code>put()</code>: bin khaali ho to <b>CAS</b>; warna us bin ke pehle node pe <code>synchronized</code>, yaani lock granularity = ek bin. Bin mein 8 se zyada nodes (aur table ≥ 64) → red-black tree. Resize kai threads mil ke karte hain (ForwardingNode). <code>size()</code> baseCount + CounterCells ka sum: concurrent updates mein estimate.</p>
        <p><b>Null kyun nahi:</b> <code>get(k) == null</code> ka matlab sirf "absent" hona chahiye. Null values allowed hon to "absent ya null value?" jaanne ke liye <code>containsKey</code> chahiye, aur do calls ke beech map badal sakta hai. Single-threaded HashMap mein ye chalta hai, concurrent mein nahi.</p>
        <p><b>Bonus:</b> compound ops ke liye <code>merge/compute/putIfAbsent</code> per-key atomic hain; get-then-put nahi. Iterators weakly consistent (CME nahi).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> CHM internals ka jawab ek line se shuru karo: <i>\"Java 8 se segments nahi hain: khaali bucket pe CAS, warna bucket ke head node pe synchronized, aur reads lock-free.\"</i> Phir khud hi trap bata do: <i>\"Par get phir put atomic nahi, uske liye merge/compute.\"</i> Ye do lines aksar poora sawaal cover kar deti hain."
    }
  ],
  references: [
    { title: "ConcurrentHashMap (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html", type: "docs" },
    { title: "Oracle Java Tutorial: Concurrent Collections", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/collections.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.2: Concurrent Collections)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
