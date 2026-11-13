// LRU Cache
registerLesson("lld", "lru-cache-lld", {
  why: "LRU cache LLD + DSA ka mel hai aur top-asked hai (LeetCode 146). O(1) get/put ke liye HashMap + doubly linked list kyun chahiye, ye khud derive karna aana chahiye. Follow-ups: thread safety, TTL, eviction policy ko pluggable banana.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirement</h2>
        <p>Fixed capacity cache. <code>get(key)</code> aur <code>put(key, value)</code> dono <b>O(1)</b>. Capacity full ho to <b>Least Recently Used</b> (sabse purana use hua) key hatao. get bhi "use" maana jaata hai.</p>
        <h2>Derive karo: kaunse data structures?</h2>
        <ol>
          <li><b>Key se O(1) lookup</b> → HashMap. Par HashMap ko "kaun sabse purana use hua" ka pata nahi.</li>
          <li><b>Use ka order</b> chahiye, aur kisi bhi beech wale item ko <b>front pe le jaana</b> O(1) mein (get hua). Array mein beech se nikalna O(n). Singly linked list mein node hataane ke liye pichhla node chahiye, jo O(n) dhoondhne mein.</li>
          <li><b>Doubly linked list</b>: node ke paas prev aur next, to node mil jaaye to use O(1) mein nikaal ke head pe laga sakte ho. Aur tail = LRU, O(1) evict.</li>
          <li><b>Node kaise milega O(1)?</b> HashMap ki value <b>node</b> rakho (sirf value nahi).</li>
        </ol>
        <pre class="diagram">
 HashMap: key → Node
 DLL:  [HEAD dummy] ⇄ [k3 most recent] ⇄ [k1] ⇄ [k2 LRU] ⇄ [TAIL dummy]
 get(k1): map se node → unlink → head ke baad insert             O(1)
 put new, full: tail.prev (k2) unlink + map.remove(k2) → naya head pe   O(1)</pre>
        <p>Dummy head/tail nodes se "list khaali hai / pehla node" wale edge cases khatam ho jaate hain.</p>
        <p>Java shortcut: <code>LinkedHashMap(capacity, 0.75f, true)</code> (accessOrder = true) + <code>removeEldestEntry</code> override. Interview mein pehle khud banao, phir ye bolo.</p>`
    },
    {
      type: "steps",
      title: "Capacity 2: put(1), put(2), get(1), put(3)",
      steps: [
        { title: "put(1,A), put(2,B)", html: `<div class="arr"><span class="cell">H</span><span class="cell hl">2</span><span class="cell">1</span><span class="cell">T</span></div><p>Naya hamesha head ke paas. LRU = 1.</p>` },
        { title: "get(1) → A, 1 front pe", html: `<div class="arr"><span class="cell">H</span><span class="cell hl">1</span><span class="cell">2</span><span class="cell">T</span></div><p>Ab LRU = 2.</p>` },
        { title: "put(3,C): full → evict tail ke paas wala (2)", html: `<div class="arr"><span class="cell">H</span><span class="cell hl">3</span><span class="cell">1</span><span class="cell bad">2 ✗</span><span class="cell">T</span></div><p>get(2) ab -1/null.</p>` }
      ]
    },
    {
      type: "exercise",
      id: "ex-lru",
      title: "LRU Cache: HashMap + doubly linked list (no LinkedHashMap)",
      level: "Medium",
      task: `<p><code>LRUCache(int capacity)</code>: <code>int get(int key)</code> (na ho to -1) aur <code>void put(int key, int value)</code> (existing key update bhi use maana jaaye). Dono O(1). <b>LinkedHashMap use mat karo</b> (harness check karta hai). Extra: <code>List&lt;Integer&gt; keysMostRecentFirst()</code> debug ke liye.</p>
        <p><a href="https://leetcode.com/problems/lru-cache/" target="_blank">LeetCode 146</a></p>`,
      examples: "cap 2: put(1,1) put(2,2) get(1)=1 put(3,3) get(2)=-1 put(4,4) get(1)=-1 get(3)=3 get(4)=4",
      userFile: "Solution.java",
      starter: `import java.util.*;

class LRUCache {
    LRUCache(int capacity) { }
    int get(int key) { return -1; }
    void put(int key, int value) { }
    List<Integer> keysMostRecentFirst() { return List.of(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("leetcode example", List.of(1, -1, -1, 3, 4), () -> {
            LRUCache c = new LRUCache(2); c.put(1, 1); c.put(2, 2); int a = c.get(1); c.put(3, 3); int b = c.get(2); c.put(4, 4);
            return List.of(a, b, c.get(1), c.get(3), c.get(4));
        });
        Check.eq("order", List.of(3, 1), () -> { LRUCache c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1); c.put(3, 3); return c.keysMostRecentFirst(); });
        Check.hiddenFromHere();
        Check.eq("update existing = use + no evict", List.of(10, 2, List.of(1, 2)), () -> {
            LRUCache c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.put(1, 10);
            return List.of(c.get(1), c.get(2), List.of(c.keysMostRecentFirst().get(1), c.keysMostRecentFirst().get(0)));
        });
        Check.eq("capacity 1", List.of(-1, 2), () -> { LRUCache c = new LRUCache(1); c.put(1, 1); c.put(2, 2); return List.of(c.get(1), c.get(2)); });
        Check.eq("LinkedHashMap use nahi", false, () -> {
            for (java.lang.reflect.Field f : LRUCache.class.getDeclaredFields()) if (LinkedHashMap.class.isAssignableFrom(f.getType())) return true;
            return LinkedHashMap.class.isAssignableFrom(LRUCache.class.getSuperclass());
        });
        Check.eq("200k ops fast (O(1))", 199999, () -> {
            LRUCache c = new LRUCache(1000);
            for (int i = 0; i < 200_000; i++) { c.put(i, i); c.get(i - 500); }
            return c.get(199_999);
        });
        Check.eq("size capped", 3, () -> { LRUCache c = new LRUCache(3); for (int i = 0; i < 10; i++) c.put(i, i); return c.keysMostRecentFirst().size(); });
    }
}`,
      hints: [
        "<code>class Node { int key, val; Node prev, next; }</code>. Dummy <code>head</code>, <code>tail</code> constructor mein jodo. <code>Map&lt;Integer, Node&gt; map = new HashMap&lt;&gt;()</code>.",
        "Do helpers: <code>unlink(node)</code> aur <code>addFront(node)</code>. get: node mila to unlink + addFront, val lautao.",
        "put: existing → val update + move front. Naya: full ho to <code>Node lru = tail.prev; unlink(lru); map.remove(lru.key);</code> phir naya addFront + map.put. Node mein key isliye rakhte hain."
      ],
      solution: `import java.util.*;

class LRUCache {
    private static final class Node { int key, val; Node prev, next; Node(int k, int v) { key = k; val = v; } }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);   // dummies

    LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }

    private void addFront(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }

    int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        unlink(n); addFront(n);                 // most recent
        return n.val;
    }

    void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) { n.val = value; unlink(n); addFront(n); return; }
        if (map.size() == capacity) {
            Node lru = tail.prev;               // least recent
            unlink(lru);
            map.remove(lru.key);                // isliye node mein key
        }
        n = new Node(key, value);
        addFront(n);
        map.put(key, n);
    }

    List<Integer> keysMostRecentFirst() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head.next; n != tail; n = n.next) out.add(n.key);
        return out;
    }
}`,
      explain: "<p>HashMap → node O(1), DLL → move/evict O(1). Node mein key isliye ki evict karte waqt map se bhi hatana hai. Thread-safety follow-up: sabse simple <code>synchronized</code> get/put (get bhi list badalta hai, isliye read lock kaafi nahi!); high concurrency pe striped/segmented caches ya Caffeine library. TTL follow-up: node mein expiry, get pe check (lazy) + optional cleanup.</p>"
    },
    {
      type: "think",
      id: "think-lru-design",
      q: "LLD follow-up: <b>\"Eviction policy pluggable banao (LRU, LFU, FIFO) aur cache thread-safe ho.\"</b> Class design batao.",
      rubric: [
        { point: "<b>EvictionPolicy interface</b>: keyAccessed(k), keyAdded(k), evictKey()", keys: ["evictionpolicy", "eviction policy", "interface", "strategy", "evict"], weight: 2 },
        { point: "Cache = storage map + policy (composition); LRUPolicy, LFUPolicy, FifoPolicy", keys: ["lrupolicy", "lfu", "fifo", "composition", "storage"], weight: 2 },
        { point: "Thread safety: <b>lock</b> around get/put (get bhi state badalta hai)", keys: ["synchronized", "lock", "reentrantlock", "thread"], weight: 2 },
        { point: "Generic <code>Cache&lt;K, V&gt;</code>", keys: ["generic", "<k, v>", "<k,v>", "cache<"] }
      ],
      answer: `<pre class="code-static">interface EvictionPolicy&lt;K&gt; { void accessed(K k); void added(K k); void removed(K k); K victim(); }
class LruPolicy&lt;K&gt; implements EvictionPolicy&lt;K&gt; { DLL + map of nodes }
class LfuPolicy&lt;K&gt; ... { freq map + freq → LinkedHashSet buckets, minFreq }   // O(1) LFU
class Cache&lt;K, V&gt; {
    Map&lt;K, V&gt; store; EvictionPolicy&lt;K&gt; policy; int capacity; ReentrantLock lock;
    V get(K k)        { lock; v = store.get(k); if (v != null) policy.accessed(k); unlock }
    void put(K k, V v){ lock; if full &amp;&amp; new: victim = policy.victim(); store.remove(victim) ...; unlock }
}</pre>
        <p>Storage aur "kaun nikle" alag responsibilities (SRP), policy Strategy hai. Ek lock kaafi hai shuru mein; bahut contention ho to sharding (N independent caches by key hash).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> LRU likhne se pehle 30 second mein derivation bolo: <i>\"O(1) lookup → HashMap; O(1) reorder aur evict → doubly linked list; map ki value node.\"</i> Ye bolne se interviewer ko pata chalta hai aap rat ke nahi, soch ke likh rahe ho."
    }
  ],
  references: [
    { title: "LRU Cache (LeetCode 146)", by: "LeetCode", url: "https://leetcode.com/problems/lru-cache/", type: "article" },
    { title: "LinkedHashMap (Java 17 API): access order, removeEldestEntry", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedHashMap.html", type: "docs" },
    { title: "Striver (takeUforward): LRU cache explanation", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" }
  ]
});
