// Collections ka naksha
registerLesson("java", "collections-overview", {
  why: "Sahi collection chunna hi aadha solution hai: galat choice se O(1) ka kaam O(n) ho jaata hai. Interview mein 'yahan kaunsa data structure aur kyun?' har coding aur LLD round mein poocha jaata hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Poora naksha ek nazar mein</h2>
              <p>Java Collections Framework <b>interfaces</b> (kya kar sakte ho) aur <b>implementations</b> (kaise andar store hota hai) mein bata hua hai.</p>
              <pre class="diagram">
                         Iterable
                            │
                        Collection
           ┌────────────────┼──────────────────┐
          List             Set               Queue
           │                │                  │
     ArrayList        HashSet            PriorityQueue
     LinkedList       LinkedHashSet          Deque
                      SortedSet                │
                        └ NavigableSet     ArrayDeque
                            └ TreeSet      LinkedList (List + Deque dono)

     Map  (Collection NAHI hai, alag hierarchy)
      ├─ HashMap
      │    └─ LinkedHashMap
      ├─ SortedMap → NavigableMap → TreeMap
      └─ (concurrent) ConcurrentHashMap</pre>
              <table>
                <tr><th>Interface</th><th>Ek line mein</th><th>Duplicates?</th><th>Order</th></tr>
                <tr><td><b>List</b></td><td>Index wali sequence</td><td>Haan</td><td>Insertion order, index se access</td></tr>
                <tr><td><b>Set</b></td><td>Unique elements</td><td>Nahi</td><td>HashSet: koi order nahi; LinkedHashSet: insertion; TreeSet: sorted</td></tr>
                <tr><td><b>Queue / Deque</b></td><td>Ek (ya dono) end se daalo-nikalo</td><td>Haan</td><td>FIFO / LIFO / priority</td></tr>
                <tr><td><b>Map</b></td><td>Key → value</td><td>Keys unique, values duplicate ho sakti hain</td><td>HashMap: koi nahi; LinkedHashMap: insertion/access; TreeMap: key sorted</td></tr>
              </table>
              <p><b>Map Collection kyun nahi?</b> Collection ka <code>add(E)</code> ek element leta hai. Map ko pair chahiye. Par Map ke views Collections hain: <code>keySet()</code>, <code>values()</code>, <code>entrySet()</code>.</p>`
    },
    {
      type: "code",
      title: "Same data, alag collections: order aur duplicates dekho",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] visits = {"pune", "delhi", "agra", "delhi", "bhopal", "agra"};

        List<String> list = new ArrayList<>(Arrays.asList(visits));
        Set<String> hash = new HashSet<>(list);
        Set<String> linked = new LinkedHashSet<>(list);
        Set<String> tree = new TreeSet<>(list);

        System.out.println("ArrayList     : " + list);     // sab, insertion order
        System.out.println("HashSet       : " + hash);     // unique, order ki guarantee nahi
        System.out.println("LinkedHashSet : " + linked);   // unique, pehli baar aaya wo order
        System.out.println("TreeSet       : " + tree);     // unique, sorted

        Map<String, Integer> count = new TreeMap<>();
        for (String v : visits) count.merge(v, 1, Integer::sum);
        System.out.println("TreeMap count : " + count);

        Deque<String> stack = new ArrayDeque<>();
        for (String v : visits) stack.push(v);
        System.out.println("Stack pop     : " + stack.pop());   // last in, first out
    }
}`,
      note: "HashSet ka order hashCode pe depend karta hai. Wo aaj ek dikhe, kal (JDK version ya capacity badalne pe) alag. <b>Kabhi bhi HashSet/HashMap ke order pe code depend mat karo.</b>"
    },
    {
      type: "text",
      html: `
              <h2>Kaunsa kab: decision table</h2>
              <table>
                <tr><th>Zaroorat</th><th>Choice</th><th>Real example</th></tr>
                <tr><td>Index se padhna, end mein add</td><td><code>ArrayList</code></td><td>Swiggy order ke items</td></tr>
                <tr><td>"Ye pehle dekha hai?" fast check</td><td><code>HashSet</code></td><td>Unique visitors, duplicate payment request check</td></tr>
                <tr><td>Unique + insertion order yaad rakhna</td><td><code>LinkedHashSet</code></td><td>Recently searched cities (dedupe)</td></tr>
                <tr><td>Hamesha sorted, range queries</td><td><code>TreeSet</code> / <code>TreeMap</code></td><td>Leaderboard, price slabs, "is time se pehle ka last event"</td></tr>
                <tr><td>Key se lookup</td><td><code>HashMap</code></td><td>userId → profile cache</td></tr>
                <tr><td>Map + order / LRU</td><td><code>LinkedHashMap</code></td><td>LRU cache</td></tr>
                <tr><td>FIFO queue ya stack</td><td><code>ArrayDeque</code></td><td>BFS, undo stack, IRCTC waitlist</td></tr>
                <tr><td>Sabse chhota/bada baar baar nikalna</td><td><code>PriorityQueue</code></td><td>Top-K, Dijkstra, nearest delivery partner</td></tr>
                <tr><td>Multiple threads</td><td><code>ConcurrentHashMap</code>, <code>CopyOnWriteArrayList</code>, <code>BlockingQueue</code></td><td>Shared rate-limit counters</td></tr>
              </table>
              <h2>Big-O cheat sheet</h2>
              <table>
                <tr><th>Collection</th><th>add</th><th>remove</th><th>get / contains</th><th>Note</th></tr>
                <tr><td>ArrayList</td><td>O(1) amortized (end), O(n) middle</td><td>O(n) (shift)</td><td>get(i) O(1), contains O(n)</td><td>Cache friendly</td></tr>
                <tr><td>LinkedList</td><td>O(1) ends</td><td>O(1) ends, O(n) dhoondhne mein</td><td>get(i) O(n), contains O(n)</td><td>Har node ka extra memory</td></tr>
                <tr><td>HashSet / HashMap</td><td>O(1) avg</td><td>O(1) avg</td><td>O(1) avg</td><td>Worst: O(log n) treeified bucket (Java 8+), agar colliding keys Comparable hon; warna ~O(n)</td></tr>
                <tr><td>TreeSet / TreeMap</td><td>O(log n)</td><td>O(log n)</td><td>O(log n)</td><td>Red-black tree, sorted</td></tr>
                <tr><td>ArrayDeque</td><td>O(1) amortized ends</td><td>O(1) ends</td><td>contains O(n)</td><td>Null allowed nahi</td></tr>
                <tr><td>PriorityQueue</td><td>O(log n)</td><td>poll O(log n), remove(x) O(n)</td><td>peek O(1), contains O(n)</td><td>Binary heap</td></tr>
              </table>`
    },
    {
      type: "quiz",
      q: "IRCTC Tatkal: requests jis order mein aayi, usi order mein process karni hain. Kaunsa best hai?",
      options: ["TreeSet&lt;Request&gt;", "ArrayDeque&lt;Request&gt; (offer / poll)", "HashMap&lt;Integer, Request&gt;", "ArrayList&lt;Request&gt; aur remove(0)"],
      answer: 1,
      why: "FIFO = Queue. <code>ArrayDeque</code> dono ends pe O(1) hai. <code>ArrayList.remove(0)</code> har baar saare elements left shift karta hai (O(n)). TreeSet duplicates hata dega aur sort karega, jo yahan chahiye hi nahi."
    },
    {
      type: "quiz",
      q: "Zomato: 'restaurant ID ye hai, uski details do', 50 lakh restaurants, har second hazaaron lookups. Kaunsa?",
      options: ["ArrayList&lt;Restaurant&gt; aur loop", "TreeMap&lt;Long, Restaurant&gt;", "HashMap&lt;Long, Restaurant&gt;", "LinkedList&lt;Restaurant&gt;"],
      answer: 2,
      why: "Key se lookup = HashMap, O(1) average. TreeMap bhi chalega (O(log n) ≈ 23 comparisons) par sorted order ki zaroorat nahi hai. List mein O(n) = 50 lakh comparisons per lookup."
    },
    {
      type: "code",
      expectException: true,
      title: "Trap: List.of aur Arrays.asList badle nahi ja sakte (poore)",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> fixed = Arrays.asList("a", "b", "c");
        fixed.set(0, "z");                 // ✅ chalega: asList fixed-SIZE hai, par set allowed
        System.out.println(fixed);

        List<String> copy = new ArrayList<>(List.of("x", "y"));
        copy.add("w");                     // ✅ ArrayList mein copy karke badlo
        System.out.println(copy);

        List<String> immutable = List.of("x", "y");   // Java 9+
        try {
            immutable.add("w");            // ❌ UnsupportedOperationException
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of immutable hai: " + e);
        }

        fixed.add("d");                    // ❌ asList pe add/remove: UnsupportedOperationException
    }
}`,
      note: "<code>List.of</code>, <code>Set.of</code>, <code>Map.of</code> (Java 9) poori tarah immutable hain aur <code>null</code> bhi allow nahi karte. <code>Arrays.asList</code> array ka ek view hai: size fixed, par <code>set</code> chalta hai aur array mein bhi dikhta hai."
    },
    {
      type: "pick",
      id: "pick-collection",
      q: "Sahi pairing chuno (sab select karo):",
      options: [
        { text: "Leaderboard jo hamesha score ke order mein chahiye → <code>TreeMap</code>", correct: true, why: "Insert/update O(log n) aur sorted iteration free." },
        { text: "Duplicate UPI request IDs pakadna → <code>HashSet</code>", correct: true, why: "<code>add()</code> false return kare to duplicate. O(1)." },
        { text: "Har request pe 'kya list mein hai?' check, 10 lakh items → <code>ArrayList.contains</code>", correct: false, why: "O(n) per check. HashSet use karo." },
        { text: "Undo button (last action pehle) → <code>ArrayDeque</code> as stack", correct: true, why: "push/pop O(1). Purana <code>Stack</code> class synchronized aur legacy hai." },
        { text: "Thread-safe map ke liye <code>HashMap</code> + kuch nahi", correct: false, why: "HashMap thread-safe nahi. <code>ConcurrentHashMap</code> use karo." },
        { text: "Top 10 trending dishes stream mein se → <code>PriorityQueue</code> (size 10 min-heap)", correct: true, why: "O(n log k), memory O(k)." }
      ]
    },
    {
      type: "exercise",
      id: "ex-unique-order",
      title: "Unique cities: pehle aane ka order, phir sorted",
      level: "Easy",
      task: `<p>Neeche diye array se do lines print karo:</p>
             <ol><li>Unique cities, jis order mein pehli baar aayi</li><li>Unique cities, alphabetical order mein</li></ol>
             <p>Sahi collection chuno, loop se duplicates mat hatao. Output exactly ye ho:</p>
             <pre class='code-static'>[pune, delhi, agra, bhopal]
[agra, bhopal, delhi, pune]</pre>`,
      starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] cities = {"pune", "delhi", "agra", "delhi", "bhopal", "pune", "agra"};
        // yahan likho
    }
}`,
      expectedOutput: `[pune, delhi, agra, bhopal]
[agra, bhopal, delhi, pune]`,
      hints: [
        "Insertion order + unique = <code>LinkedHashSet</code>.",
        "Sorted + unique = <code>TreeSet</code>. Dono ka constructor collection leta hai: <code>new TreeSet&lt;&gt;(Arrays.asList(cities))</code>."
      ],
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] cities = {"pune", "delhi", "agra", "delhi", "bhopal", "pune", "agra"};
        List<String> all = Arrays.asList(cities);
        System.out.println(new LinkedHashSet<>(all));
        System.out.println(new TreeSet<>(all));
    }
}`,
      explain: "LinkedHashSet O(n) mein dedupe karke insertion order rakhta hai. TreeSet O(n log n) mein sort + dedupe karta hai. Dono ka <code>toString</code> <code>[a, b]</code> format deta hai."
    },
    {
      type: "exercise",
      id: "ex-first-repeat",
      title: "Pehla repeat hone wala order ID",
      level: "Easy",
      task: "<p>Payment gateway ko order IDs ka array mila. <code>firstRepeat(ids)</code> wo pehla ID return kare jo <b>doosri baar</b> dikhta hai (jiska doosra occurrence sabse pehle aata hai). Koi repeat nahi to <code>-1</code>.</p><p>1 lakh IDs tak chalna chahiye, to O(n²) nahi chalega.</p>",
      examples: "<code>[5, 3, 8, 3, 5]</code> → <code>3</code> (index 3 pe 3 dobara aaya, 5 index 4 pe)<br><code>[1, 2, 3]</code> → <code>-1</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    int firstRepeat(int[] ids) {
        for (int i = 0; i < ids.length; i++) {
            for (int j = 0; j < i; j++) {
                if (ids[j] == ids[i]) return ids[i];
            }
        }
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[5,3,8,3,5]", 3, () -> s.firstRepeat(new int[]{5, 3, 8, 3, 5}));
        Check.eq("[1,2,3]", -1, () -> s.firstRepeat(new int[]{1, 2, 3}));
        Check.hiddenFromHere();
        Check.eq("empty", -1, () -> s.firstRepeat(new int[]{}));
        Check.eq("negative", -7, () -> s.firstRepeat(new int[]{-7, 2, -7}));
        Check.eq("turant repeat", 4, () -> s.firstRepeat(new int[]{4, 4, 1, 1}));
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = i;
        big[big.length - 1] = 99998;
        Check.eq("1 lakh, repeat end mein", 99998, () -> s.firstRepeat(big));
    }
}`,
      hints: [
        "Nested loop O(n²) = 10<sup>10</sup> steps 1 lakh pe. Ek \"dekh liya\" set rakho.",
        "<code>Set&lt;Integer&gt; seen = new HashSet&lt;&gt;();</code> aur <code>if (!seen.add(x)) return x;</code>: add false deta hai jab element pehle se ho."
      ],
      solution: `import java.util.*;

class Solution {
    int firstRepeat(int[] ids) {
        Set<Integer> seen = new HashSet<>();
        for (int id : ids) {
            if (!seen.add(id)) return id;
        }
        return -1;
    }
}`,
      explain: "<p><code>HashSet.add</code> O(1) average hai aur boolean batata hai ki naya tha ya nahi. Total O(n) time, O(n) space. Ye wahi trade-off hai jo interview mein sabse common hai: <b>memory dekar time bachao</b>.</p>"
    },
    {
      type: "think",
      id: "think-choose",
      q: "Interview question: <b>\"Ek feature banana hai: user ke last 5 unique searched cities dikhane hain, sabse recent pehle. Kaunsa collection use karoge aur kyun?\"</b>",
      rubric: [
        { point: "Uniqueness + order dono chahiye → <b>LinkedHashSet / LinkedHashMap</b> (ya Deque + Set)", keys: ["linkedhashset", "linkedhashmap", "linked hash", "deque"], weight: 2 },
        { point: "Dobara search hone pe purani entry hata ke end/front pe daalo (recency update)", keys: ["remove", "hata", "move", "recent", "dobara", "again"], weight: 2 },
        { point: "Size 5 se zyada ho to sabse purana nikal do (eviction)", keys: ["5", "evict", "purana", "oldest", "size", "limit"], weight: 1 },
        { point: "Complexity: har operation O(1)", keys: ["o(1)", "constant"], weight: 1 },
        { point: "ArrayList.contains / remove O(n) kyun avoid (chhote n pe chal jaata hai, par scale pe nahi)", keys: ["arraylist", "o(n)", "linear"] }
      ],
      answer: `<p>Do zaroorat hain: <b>unique</b> cities aur <b>recency order</b>. <code>LinkedHashSet</code> dono deta hai: andar HashMap (O(1) lookup) + doubly linked list (order).</p>
               <pre class="code-static">void search(String city) {
    recent.remove(city);          // pehle se ho to hatao (O(1))
    recent.add(city);             // end mein daalo = sabse recent
    if (recent.size() &gt; 5) {
        recent.remove(recent.iterator().next());   // sabse purana (front) nikalo
    }
}</pre>
               <p>Dikhate waqt ulta order chahiye (recent pehle). Sirf 5 elements hain, to list bana ke reverse karna sasta hai. Har operation O(1). Ye wahi pattern hai jo LRU cache mein lagta hai: <code>LinkedHashMap</code> with <code>accessOrder = true</code> aur <code>removeEldestEntry</code> (Set-Tree lesson mein).</p>
               <p>Sirf 5 items ke liye ArrayList bhi theek chalega. Par interviewer scale pe sochna dekhna chahta hai: n bada ho to <code>contains</code>/<code>remove</code> O(n) ho jaata hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Variable ka type <b>interface</b> rakho: <code>List&lt;Order&gt; orders = new ArrayList&lt;&gt;();</code>, <code>Map&lt;K, V&gt; m = new HashMap&lt;&gt;();</code>. Baad mein implementation badalna (jaise LinkedHashMap) ek line ka kaam rahega. Aur jab collection choose karo, ek line mein reason bolo: \"<i>HashSet, kyunki sirf membership check chahiye, O(1)</i>\"."
    }
  ],
  references: [
    { title: "Collections Framework Overview", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/doc-files/coll-overview.html", type: "docs" },
    { title: "Trail: Collections (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/collections/", type: "docs" },
    { title: "JEP 269: Convenience Factory Methods for Collections", by: "OpenJDK", url: "https://openjdk.org/jeps/269", type: "docs" }
  ]
});
