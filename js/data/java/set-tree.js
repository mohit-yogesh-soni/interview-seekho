// HashSet, TreeSet, TreeMap, LinkedHashMap
registerLesson("java", "set-tree", {
  why: "Sorted data aur range queries (\"is time se pehle ka last booking\", \"is price ke upar ka sabse sasta\") TreeMap/TreeSet se O(log n) mein hote hain, aur LRU cache LinkedHashMap se 10 lines mein. Dono interview mein bahut aate hain, aur LRU cache to apne aap mein ek famous question hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Set ke teen flavours</h2>
              <table>
                <tr><th></th><th>HashSet</th><th>LinkedHashSet</th><th>TreeSet</th></tr>
                <tr><td>Andar kya hai</td><td>Ek <code>HashMap</code> (element = key, value = ek dummy object)</td><td><code>LinkedHashMap</code></td><td><code>TreeMap</code> (red-black tree)</td></tr>
                <tr><td>Order</td><td>Koi guarantee nahi</td><td>Insertion order</td><td>Sorted (natural ya Comparator)</td></tr>
                <tr><td>add / contains / remove</td><td>O(1) avg</td><td>O(1) avg</td><td>O(log n)</td></tr>
                <tr><td>null</td><td>Ek null allowed</td><td>Ek null allowed</td><td>Natural order mein null nahi (compareTo NPE)</td></tr>
                <tr><td>Duplicate kaun decide karta hai</td><td><code>hashCode</code> + <code>equals</code></td><td><code>hashCode</code> + <code>equals</code></td><td><code>compareTo</code> / <code>compare</code> == 0</td></tr>
              </table>
              <p><b>Red-black tree</b> ek self-balancing binary search tree hai: har insert/delete ke baad thode rotations karke height <b>O(log n)</b> rakhta hai. 10 lakh elements → height lagbhag 20-40, to har operation kuch dozen comparisons.</p>
              <p>Similarly Maps: <code>HashMap</code> (koi order nahi), <code>LinkedHashMap</code> (insertion ya access order), <code>TreeMap</code> (keys sorted).</p>`
    },
    {
      type: "text",
      html: `
              <h2>NavigableSet / NavigableMap: asli taakat</h2>
              <p>Sorted hone ka faayda sirf sorted print nahi hai. "Nearest" queries O(log n) mein:</p>
              <table>
                <tr><th>TreeSet method</th><th>TreeMap version</th><th>Matlab (x ke liye)</th></tr>
                <tr><td><code>floor(x)</code></td><td><code>floorKey / floorEntry</code></td><td>Sabse bada jo <b>≤ x</b></td></tr>
                <tr><td><code>ceiling(x)</code></td><td><code>ceilingKey / ceilingEntry</code></td><td>Sabse chhota jo <b>≥ x</b></td></tr>
                <tr><td><code>lower(x)</code></td><td><code>lowerKey</code></td><td>Sabse bada jo <b>&lt; x</b> (strict)</td></tr>
                <tr><td><code>higher(x)</code></td><td><code>higherKey</code></td><td>Sabse chhota jo <b>&gt; x</b> (strict)</td></tr>
                <tr><td><code>first() / last()</code></td><td><code>firstKey / lastEntry</code></td><td>Min / max</td></tr>
                <tr><td><code>pollFirst() / pollLast()</code></td><td><code>pollFirstEntry</code></td><td>Min/max nikalo aur hatao</td></tr>
                <tr><td><code>headSet(x) / tailSet(x) / subSet(a, b)</code></td><td><code>headMap / tailMap / subMap</code></td><td>Range ka <b>view</b></td></tr>
                <tr><td><code>descendingSet()</code></td><td><code>descendingMap()</code></td><td>Ulta order view</td></tr>
              </table>
              <p>Koi element na mile to ye methods <code>null</code> return karte hain (exception nahi). <code>first()</code>/<code>last()</code> khaali set pe <code>NoSuchElementException</code> dete hain.</p>`
    },
    {
      type: "code",
      title: "TreeMap se delivery fee slab aur TreeSet se nearest slot",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Distance (km) se shuru hone wala slab → fee
        TreeMap<Integer, Integer> feeFrom = new TreeMap<>();
        feeFrom.put(0, 20);     // 0-2 km: ₹20
        feeFrom.put(3, 35);     // 3-6 km: ₹35
        feeFrom.put(7, 60);     // 7+ km : ₹60
        for (int km : new int[]{1, 3, 5, 9}) {
            System.out.println(km + " km → ₹" + feeFrom.floorEntry(km).getValue());
        }

        TreeSet<Integer> freeSlots = new TreeSet<>(List.of(900, 1030, 1200, 1500));  // HHMM
        System.out.println("10:00 ke baad pehla slot : " + freeSlots.ceiling(1000));
        System.out.println("12:00 se pehle (strict)  : " + freeSlots.lower(1200));
        System.out.println("12:00 ya pehle           : " + freeSlots.floor(1200));
        System.out.println("16:00 ke baad            : " + freeSlots.higher(1600));   // null
        System.out.println("11 se 15 ke beech        : " + freeSlots.subSet(1100, true, 1500, true));
        System.out.println("ulta                     : " + freeSlots.descendingSet());

        // Trap: null ko int mein unbox mat karo
        Integer next = freeSlots.higher(1600);
        System.out.println(next == null ? "koi slot nahi" : "slot " + next);
    }
}`
    },
    {
      type: "quiz",
      q: "<code>TreeSet&lt;Integer&gt; s = [10, 20, 30]</code>. <code>s.floor(25)</code>, <code>s.ceiling(25)</code>, <code>s.lower(10)</code>, <code>s.higher(30)</code> kya denge?",
      options: ["20, 30, null, null", "20, 30, 10, 30", "30, 20, null, null", "20, 30, exception, exception"],
      answer: 0,
      why: "floor(25) = ≤25 mein sabse bada = 20. ceiling(25) = ≥25 mein sabse chhota = 30. lower(10) = 10 se strictly chhota koi nahi → null. higher(30) = 30 se bada koi nahi → null. Null return hota hai, exception nahi."
    },
    {
      type: "code",
      title: "Trap: TreeSet equals nahi, compareTo use karta hai",
      code: `import java.math.BigDecimal;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        BigDecimal a = new BigDecimal("1.0");
        BigDecimal b = new BigDecimal("1.00");
        System.out.println("equals    : " + a.equals(b));      // scale alag → false
        System.out.println("compareTo : " + a.compareTo(b));   // value same → 0

        Set<BigDecimal> hash = new HashSet<>(List.of(a, b));
        Set<BigDecimal> tree = new TreeSet<>(List.of(a, b));
        System.out.println("HashSet size: " + hash.size());
        System.out.println("TreeSet size: " + tree.size());

        // Comparator jo sirf length dekhta hai: same length wali strings "duplicate" maani jaayengi!
        Set<String> byLen = new TreeSet<>(Comparator.comparingInt(String::length));
        byLen.addAll(List.of("chai", "vada", "pav", "dosa"));
        System.out.println("byLen: " + byLen);     // vada aur dosa gayab
    }
}`,
      note: "TreeSet/TreeMap ke liye comparator <b>consistent with equals</b> hona chahiye, warna Set ka contract toot jaata hai. Fix: tie-breaker jodo: <code>comparingInt(String::length).thenComparing(Comparator.naturalOrder())</code>."
    },
    {
      type: "quiz",
      q: "<code>new TreeSet&lt;&gt;(Comparator.comparing(Employee::salary))</code> mein do employees same salary ke daale. Size?",
      options: ["2", "1: comparator 0 deta hai to TreeSet doosre ko duplicate maan ke ignore karta hai", "Exception", "Random"],
      answer: 1,
      why: "TreeSet ke liye <code>compare(a, b) == 0</code> matlab \"same element\". Doosra add ignore (false) ho jaata hai. Salary sort karna ho aur sab rakhne hon, to tie-breaker (jaise id) jodo, ya List mein daal ke sort karo."
    },
    {
      type: "text",
      html: `
              <h2>LinkedHashMap aur LRU cache</h2>
              <p><code>LinkedHashMap</code> = HashMap + saari entries ke through ek <b>doubly linked list</b>. Default mein list <b>insertion order</b> rakhti hai.</p>
              <ul>
                <li>Constructor <code>new LinkedHashMap&lt;&gt;(16, 0.75f, true)</code>: teesra argument <b>accessOrder</b>. True ho to har <code>get</code>/<code>put</code> us entry ko list ke <b>end</b> (most recent) pe le jaata hai.</li>
                <li>Hook method <code>removeEldestEntry(eldest)</code> har put ke baad call hota hai. True return karo to sabse purani (list ka head) entry hat jaati hai.</li>
                <li>Dono milake: <b>LRU (Least Recently Used) cache</b>. Jaise Swiggy app mein last N viewed restaurants ka cache: jagah khatam to jo sabse lambe time se nahi dekha wo nikalo.</li>
              </ul>`
    },
    {
      type: "steps",
      title: "LRU cache, capacity 3 (list: left = sabse purana, right = sabse recent)",
      steps: [
        { title: "put A, put B, put C", html: `<div class="arr"><span class="cell">A</span><span class="cell">B</span><span class="cell hl">C</span></div><p>Insertion order mein list.</p>` },
        { title: "get A", html: `<div class="arr"><span class="cell">B</span><span class="cell">C</span><span class="cell hl">A</span></div><p>accessOrder = true: A ab sabse recent, end pe gaya. O(1): sirf pointers badle.</p>` },
        { title: "put D (size 4 > 3)", html: `<div class="arr"><span class="cell bad">B</span><span class="cell">C</span><span class="cell">A</span><span class="cell hl">D</span></div><p>D end pe juda. <code>removeEldestEntry</code> ne dekha size &gt; 3 → head (B) nikalo.</p>` },
        { title: "Result", html: `<div class="arr"><span class="cell">C</span><span class="cell">A</span><span class="cell ok">D</span></div><p>B evict hua, kyunki wahi sabse lambe time se use nahi hua tha. A bach gaya kyunki usse abhi abhi padha tha. Har operation O(1).</p>` }
      ]
    },
    {
      type: "code",
      title: "LRU cache 10 lines mein",
      code: `import java.util.*;

public class Main {
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;
        LruCache(int capacity) {
            super(16, 0.75f, true);          // accessOrder = true
            this.capacity = capacity;
        }
        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    }

    public static void main(String[] args) {
        LruCache<String, String> cache = new LruCache<>(3);
        cache.put("A", "Haldiram");
        cache.put("B", "Barbeque Nation");
        cache.put("C", "Saravana Bhavan");
        cache.get("A");
        cache.put("D", "Paradise Biryani");
        System.out.println(cache.keySet());   // [C, A, D]

        // Insertion-order LinkedHashMap (default): get se order nahi badalta
        Map<String, Integer> ins = new LinkedHashMap<>();
        ins.put("x", 1); ins.put("y", 2); ins.get("x");
        System.out.println(ins.keySet());     // [x, y]
    }
}`,
      note: "Ye single-thread ke liye hai. Multi-threaded cache ke liye Caffeine jaisi library ya <code>ConcurrentHashMap</code> + apni eviction. <code>Collections.synchronizedMap</code> chalega par har get pe lock (kyunki access order list badalti hai)."
    },
    {
      type: "exercise",
      id: "ex-lru",
      title: "LRU Cache implement karo",
      level: "Medium",
      task: `<p>Class <code>Solution</code> ek LRU cache hai:</p>
             <ul><li><code>Solution(int capacity)</code></li>
             <li><code>get(key)</code>: value, ya <code>-1</code>. Mil gaya to wo key ab sabse recent.</li>
             <li><code>put(key, value)</code>: daalo/update karo (wo bhi recent ban jaati hai). Size capacity se zyada ho to <b>least recently used</b> key hatao.</li></ul>
             <p>Dono operations O(1) average hone chahiye (bade test mein 2 lakh ops). <a href="https://leetcode.com/problems/lru-cache/" target="_blank">LeetCode 146</a></p>`,
      examples: "cap 2: <code>put(1,1) put(2,2) get(1)→1 put(3,3) get(2)→-1 put(4,4) get(1)→-1 get(3)→3 get(4)→4</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    Solution(int capacity) {
    }

    int get(int key) {
        return -1;
    }

    void put(int key, int value) {
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("cap 2 classic sequence", List.of(1, -1, -1, 3, 4), () -> {
            Solution c = new Solution(2);
            List<Integer> out = new ArrayList<>();
            c.put(1, 1); c.put(2, 2); out.add(c.get(1));
            c.put(3, 3); out.add(c.get(2));
            c.put(4, 4); out.add(c.get(1)); out.add(c.get(3)); out.add(c.get(4));
            return out;
        });
        Check.eq("get missing", -1, () -> new Solution(1).get(5));
        Check.hiddenFromHere();
        Check.eq("cap 1", List.of(-1, 2), () -> {
            Solution c = new Solution(1);
            c.put(1, 1); c.put(2, 2);
            return List.of(c.get(1), c.get(2));
        });
        Check.eq("update existing key refreshes it", List.of(10, -1, 3), () -> {
            Solution c = new Solution(2);
            c.put(1, 1); c.put(2, 2); c.put(1, 10);   // 1 recent
            c.put(3, 3);                               // 2 evict
            return List.of(c.get(1), c.get(2), c.get(3));
        });
        Check.eq("get refreshes", List.of(1, -1), () -> {
            Solution c = new Solution(2);
            c.put(1, 1); c.put(2, 2); c.get(1); c.put(3, 3);
            return List.of(c.get(1), c.get(2));
        });
        Check.eq("2 lakh ops", 50000L, () -> {
            Solution c = new Solution(50000);
            for (int i = 0; i < 100000; i++) c.put(i, i);
            long hits = 0;
            for (int i = 0; i < 100000; i++) if (c.get(i) != -1) hits++;
            return hits;
        });
    }
}`,
      hints: [
        "Field mein ek <code>LinkedHashMap&lt;Integer, Integer&gt;</code> rakho jiska <code>accessOrder = true</code> ho.",
        "Anonymous subclass se <code>removeEldestEntry</code> override: <code>new LinkedHashMap&lt;&gt;(16, 0.75f, true) { protected boolean removeEldestEntry(Map.Entry&lt;Integer,Integer&gt; e) { return size() &gt; cap; } }</code>",
        "<code>get</code>: <code>map.getOrDefault(key, -1)</code> (accessOrder mein ye bhi order update karta hai). Interview mein follow-up: HashMap + apni doubly linked list se khud banao."
      ],
      solution: `import java.util.*;

class Solution {
    private final int cap;
    private final LinkedHashMap<Integer, Integer> map;

    Solution(int capacity) {
        this.cap = capacity;
        this.map = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > cap;
            }
        };
    }

    int get(int key) {
        return map.getOrDefault(key, -1);
    }

    void put(int key, int value) {
        map.put(key, value);
    }
}`,
      explain: "<p>LinkedHashMap andar HashMap (O(1) lookup) + doubly linked list (recency order) hai, bilkul wahi jo LRU ke liye chahiye. Har operation O(1). Interview mein aksar kehte hain \"library mat use karo\": tab <code>HashMap&lt;Integer, Node&gt;</code> + dummy head/tail wali doubly linked list banao; get pe node ko tail pe move, put pe full ho to head.next hatao.</p>"
    },
    {
      type: "exercise",
      id: "ex-calendar",
      title: "Meeting room booking (TreeMap floor/ceiling)",
      level: "Medium",
      task: `<p>Class <code>Solution</code> ek meeting room ka calendar hai. <code>book(start, end)</code> half-open interval <code>[start, end)</code> book kare aur <code>true</code> de, agar kisi pehle wali booking se overlap nahi hai. Overlap ho to book mat karo, <code>false</code> do.</p>
             <p>1 lakh bookings tak fast chalna chahiye (har booking O(log n)). Inspired by <a href="https://leetcode.com/problems/my-calendar-i/" target="_blank">LeetCode 729</a>.</p>`,
      examples: "<code>book(10,20)</code> → true, <code>book(15,25)</code> → false, <code>book(20,30)</code> → true (20 pe pehla khatam, touch karna overlap nahi)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    // start → end
    private final TreeMap<Integer, Integer> booked = new TreeMap<>();

    boolean book(int start, int end) {
        return true;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("10-20, 15-25, 20-30", List.of(true, false, true), () -> {
            Solution c = new Solution();
            return List.of(c.book(10, 20), c.book(15, 25), c.book(20, 30));
        });
        Check.hiddenFromHere();
        Check.eq("andar wala interval", List.of(true, false), () -> {
            Solution c = new Solution();
            return List.of(c.book(10, 50), c.book(20, 30));
        });
        Check.eq("bahar wala interval", List.of(true, false), () -> {
            Solution c = new Solution();
            return List.of(c.book(20, 30), c.book(10, 50));
        });
        Check.eq("pehle aur baad mein touch", List.of(true, true, true, false), () -> {
            Solution c = new Solution();
            return List.of(c.book(20, 30), c.book(10, 20), c.book(30, 40), c.book(29, 31));
        });
        Check.eq("1 lakh non-overlapping + ek overlap", false, () -> {
            Solution c = new Solution();
            for (int i = 0; i < 100000; i++) if (!c.book(i * 10, i * 10 + 5)) return "galat false at " + i;
            return c.book(500003, 500004);
        });
    }
}`,
      hints: [
        "Naya interval sirf do purane intervals se takra sakta hai: jo <b>start se pehle ya usi pe</b> shuru hua (floor), aur jo <b>start ke baad</b> shuru hua (higher/ceiling).",
        "<code>Map.Entry&lt;Integer,Integer&gt; prev = booked.floorEntry(start);</code> overlap agar <code>prev.getValue() &gt; start</code>.",
        "<code>Integer next = booked.ceilingKey(start);</code> overlap agar <code>next &lt; end</code>. Dono theek hon to <code>booked.put(start, end)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    private final TreeMap<Integer, Integer> booked = new TreeMap<>();

    boolean book(int start, int end) {
        Map.Entry<Integer, Integer> prev = booked.floorEntry(start);
        if (prev != null && prev.getValue() > start) return false;
        Integer next = booked.ceilingKey(start);
        if (next != null && next < end) return false;
        booked.put(start, end);
        return true;
    }
}`,
      explain: "<p>Bookings non-overlapping hain aur start se sorted. Isliye sirf do padosi check karne kaafi hain: floor (pichla) aur ceiling (agla). Har booking O(log n), total O(n log n). List mein har baar sabke saath check karna O(n²) hota.</p>"
    },
    {
      type: "think",
      id: "think-maps",
      q: "Interview question: <b>\"HashMap, LinkedHashMap aur TreeMap mein kya farak hai? Har ek ka ek real use case batao.\"</b>",
      rubric: [
        { point: "HashMap: koi order nahi, O(1) avg; use: id → object lookup / cache", keys: ["hashmap", "no order", "koi order", "o(1)", "lookup"], weight: 2 },
        { point: "LinkedHashMap: insertion ya <b>access order</b> (linked list); use: <b>LRU cache</b>", keys: ["linkedhashmap", "insertion order", "access order", "lru", "linked list"], weight: 2 },
        { point: "TreeMap: <b>sorted keys</b>, red-black tree, O(log n); use: range / floor / ceiling queries", keys: ["treemap", "sorted", "red-black", "red black", "log n", "floor", "ceiling", "range"], weight: 2 },
        { point: "Null keys aur comparator/equals consistency ka farak", keys: ["null", "comparator", "compareto", "consistent"], weight: 1 },
        { point: "Koi bhi thread-safe nahi → ConcurrentHashMap / ConcurrentSkipListMap", keys: ["thread", "concurrent", "skiplist", "synchroniz"], weight: 1 }
      ],
      answer: `<table>
                 <tr><th></th><th>HashMap</th><th>LinkedHashMap</th><th>TreeMap</th></tr>
                 <tr><td>Andar</td><td>Bucket array</td><td>Bucket array + doubly linked list</td><td>Red-black tree</td></tr>
                 <tr><td>Order</td><td>Koi nahi</td><td>Insertion (default) ya access</td><td>Key sorted</td></tr>
                 <tr><td>get/put</td><td>O(1) avg</td><td>O(1) avg</td><td>O(log n)</td></tr>
                 <tr><td>null key</td><td>Ek allowed</td><td>Ek allowed</td><td>Natural order mein nahi</td></tr>
                 <tr><td>Use case</td><td>userId → session</td><td>LRU cache, order-preserving JSON fields</td><td>Leaderboard, price slabs, time-based "last event before T"</td></tr>
               </table>
               <p>TreeMap equality ke liye <code>compareTo</code> use karta hai, <code>equals</code> nahi, isliye comparator equals ke saath consistent rakho. Teeno thread-safe nahi hain: concurrent ke liye <code>ConcurrentHashMap</code>, aur sorted concurrent ke liye <code>ConcurrentSkipListMap</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Jab problem mein <i>\"nearest\", \"just before\", \"just after\", \"range mein kitne\"</i> jaise words aayein aur data dynamic ho (insert/delete hote rehte hain), TreeMap/TreeSet ka naam lo. Sorted array + binary search tabhi theek hai jab data static ho."
    }
  ],
  references: [
    { title: "TreeMap (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TreeMap.html", type: "docs" },
    { title: "LinkedHashMap (Java 17 API): removeEldestEntry", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedHashMap.html", type: "docs" },
    { title: "LRU Cache", by: "LeetCode", url: "https://leetcode.com/problems/lru-cache/", type: "article" },
    { title: "My Calendar I", by: "LeetCode", url: "https://leetcode.com/problems/my-calendar-i/", type: "article" }
  ]
});
