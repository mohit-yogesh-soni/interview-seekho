// HashMap internals
registerLesson("java", "hashmap", {
  why: "\"HashMap internally kaise kaam karta hai?\" Java interviews ka sabse famous sawaal hai. Iske follow-ups (collision, treeify, resize, equals/hashCode, thread safety) se interviewer turant samajh jaata hai ki aapne sirf API use ki hai ya andar dekha hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Problem: 1 crore users mein se ek dhoondho</h2>
              <p>PhonePe ke paas 1 crore users hain. Phone number se user dhoondhna hai. List mein loop = 1 crore comparisons, har request pe. Sorted array + binary search = ~24 comparisons, par insert O(n).</p>
              <p><b>Hashing ka idea:</b> key se seedha ek <b>number (index)</b> calculate karo, aur us index pe array mein value rakh do. Lookup ke time wahi calculation dobara, seedha wahan jao. Average <b>O(1)</b>.</p>
              <pre class="diagram">
  key "9876543210"
        │  hashCode()           →  1234567890 (koi bhi int)
        │  spread: h ^ (h>>>16) →  upar ke bits neeche mix
        │  index = (n-1) &amp; hash →  0..n-1 (n = table size, power of 2)
        ▼
  table:  [0] → null
          [1] → Node(k1,v1) → Node(k2,v2)     ← collision: same bucket, linked list
          [2] → null
          [3] → Node(k3,v3)
          ...
          [15]→ null

  Node { int hash; K key; V value; Node next; }</pre>
              <ul>
                <li><b>table</b>: <code>Node[]</code> array. Har slot ek <b>bucket</b> hai.</li>
                <li><b>Collision</b>: do alag keys ka index same aaye. Dono same bucket mein linked list (ya tree) mein rehte hain.</li>
                <li>Bucket ke andar sahi key dhoondhne ke liye pehle <code>hash</code> compare, phir <code>equals()</code>. Isliye <b>equals aur hashCode dono</b> sahi hone chahiye.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Bucket index khud calculate karo (HashMap jaisa hi formula)",
      code: `public class Main {
    // OpenJDK HashMap.hash() jaisa: upar ke 16 bits ko neeche XOR karo
    static int spread(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

    static int index(Object key, int tableSize) {
        return (tableSize - 1) & spread(key);   // tableSize power of 2 hai, to ye = hash % size
    }

    public static void main(String[] args) {
        String[] keys = {"Aa", "BB", "chai", "samosa", "upi", "zomato"};
        for (String k : keys) {
            System.out.printf("%-7s hashCode=%-11d index(16)=%-3d index(32)=%d%n",
                    k, k.hashCode(), index(k, 16), index(k, 32));
        }
        System.out.println("null key ka index: " + index(null, 16));
        System.out.println("\\"Aa\\" aur \\"BB\\" ka hashCode same hai → hamesha same bucket (collision)");
    }
}`,
      note: "<b>Power of 2 kyun?</b> <code>(n-1) &amp; hash</code> ek bit operation hai, <code>%</code> se fast. Par isme sirf neeche ke bits use hote hain. Isliye <code>h ^ (h &gt;&gt;&gt; 16)</code> se upar ke bits bhi neeche mix kiye jaate hain, taaki jo keys sirf upar ke bits mein alag hain wo alag buckets mein jaayein."
    },
    {
      type: "steps",
      title: "put() dry run: table size 16, Integer keys (Integer ka hashCode = value)",
      steps: [
        { title: "put(5, \"A\")", html: `<p>hash = 5, index = 15 &amp; 5 = <b>5</b>. Bucket 5 khaali → naya Node.</p><div class="arr"><span class="cell dim">4</span><span class="cell hl">5: (5,A)</span><span class="cell dim">6</span></div>` },
        { title: "put(21, \"B\")", html: `<p>hash = 21 = 10101 (binary). index = 01111 &amp; 10101 = 00101 = <b>5</b>. Collision! Bucket mein (5,A) hai. hash alag (5 ≠ 21) → key alag. List ke <b>end</b> mein jodo (Java 8+ tail insertion).</p><div class="arr"><span class="cell dim">4</span><span class="cell hl">5: (5,A) → (21,B)</span><span class="cell dim">6</span></div>` },
        { title: "put(37, \"C\")", html: `<p>37 &amp; 15 = <b>5</b>. Phir collision. Chain traverse: 5 nahi, 21 nahi → end mein jodo.</p><div class="arr"><span class="cell dim">4</span><span class="cell hl">5: (5,A) → (21,B) → (37,C)</span><span class="cell dim">6</span></div>` },
        { title: "put(21, \"Z\")", html: `<p>Index 5. Chain mein (21,B) mila: hash same <b>aur</b> <code>equals</code> true → <b>value replace</b>. Size nahi badha. Purani value \"B\" return hoti hai.</p><div class="arr"><span class="cell dim">4</span><span class="cell ok">5: (5,A) → (21,Z) → (37,C)</span><span class="cell dim">6</span></div>` },
        { title: "get(37)", html: `<p>Index 5. Node 1: hash 5 ≠ 37, skip. Node 2: 21 ≠ 37, skip. Node 3: hash 37 == 37 aur equals true → return \"C\".</p><p>Chain lambi ho to get O(chain length). Achha hashCode chains ko chhota rakhta hai: average O(1).</p>` }
      ]
    },
    {
      type: "order",
      id: "order-put",
      q: "<code>map.put(key, value)</code> ke steps sahi order mein lagao:",
      items: [
        "key.hashCode() nikalo aur spread karo: h ^ (h &gt;&gt;&gt; 16)",
        "Bucket index = (n - 1) &amp; hash (table null ho to pehle banao, default 16)",
        "Bucket khaali hai to naya Node daalo",
        "Warna chain/tree mein hash + equals se same key dhoondho: mili to value replace",
        "Nahi mili to end mein naya node; chain 8 se lambi ho to treeify (table ≥ 64), warna resize",
        "++size &gt; threshold (capacity × 0.75) ho to resize (table double)"
      ],
      why: "Java 8 HashMap mein table <b>lazily</b> pehle put pe banta hai. Chain mein naya node <b>tail</b> pe jaata hai (Java 7 head pe daalta tha)."
    },
    {
      type: "quiz",
      q: "Do keys <code>k1</code>, <code>k2</code> ka <code>hashCode()</code> same hai par <code>k1.equals(k2)</code> false hai. <code>map.put(k1, 1); map.put(k2, 2);</code> ke baad <code>map.size()</code>?",
      options: ["1, kyunki hash same hai to k2 ne k1 ko overwrite kiya", "2, dono same bucket mein alag nodes", "Exception: duplicate hash", "Depend karta hai table size pe"],
      answer: 1,
      why: "Same hash = sirf same bucket. Key same hai ya nahi, ye <code>equals</code> decide karta hai. Dono alag nodes ban ke chain mein rehte hain. Contract ulta hai: equal objects ka hashCode same <b>hona chahiye</b>, par same hashCode wale equal hon ye zaroori nahi."
    },
    {
      type: "text",
      html: `
              <h2>Java 8 treeify: lambi chain ko tree banao</h2>
              <p>Agar bahut saari keys ek hi bucket mein aa jaayein (kharab hashCode, ya attacker jaan-boojh ke colliding keys bheje, "hash flooding" DoS), to chain O(n) ban jaati hai. Java 8 ne fix diya:</p>
              <table>
                <tr><th>Constant</th><th>Value</th><th>Matlab</th></tr>
                <tr><td><code>TREEIFY_THRESHOLD</code></td><td>8</td><td>Ek bucket ki chain 8 se lambi ho jaaye to us bucket ko <b>red-black tree</b> bana do (lookup O(log n))</td></tr>
                <tr><td><code>MIN_TREEIFY_CAPACITY</code></td><td>64</td><td>Par agar table abhi 64 se chhota hai, to tree banane ke bajaye <b>resize</b> karo. Chhote table mein collisions aksar size ki wajah se hote hain.</td></tr>
                <tr><td><code>UNTREEIFY_THRESHOLD</code></td><td>6</td><td>Resize ke baad tree bucket mein 6 ya kam nodes bache to wapas linked list. (8 aur 6 ka gap isliye ki baar baar convert na ho.)</td></tr>
              </table>
              <p>Tree mein order kaise? Pehle <code>hash</code> se. Hash same ho aur key <code>Comparable</code> ho to <code>compareTo</code> se. Nahi to ek tie-break rule. Isliye keys ko Comparable banana bhi worst case mein help karta hai.</p>
              <p>Achhe hashCode ke saath chains itni lambi lagbhag kabhi nahi hoti (HashMap ke source comment ke hisaab se 0.75 load factor pe 8 length ki chain ka chance ~0.00000006 hai). Treeify ek <b>safety net</b> hai, normal path nahi.</p>`
    },
    {
      type: "code",
      title: "Kharab hashCode ka asar: sab keys ek bucket mein",
      code: `import java.util.*;

public class Main {
    static final class GoodKey {
        final int id;
        GoodKey(int id) { this.id = id; }
        @Override public boolean equals(Object o) { return o instanceof GoodKey && ((GoodKey) o).id == id; }
        @Override public int hashCode() { return Integer.hashCode(id); }
    }

    static final class BadKey {
        final int id;
        BadKey(int id) { this.id = id; }
        @Override public boolean equals(Object o) { return o instanceof BadKey && ((BadKey) o).id == id; }
        @Override public int hashCode() { return 42; }   // 😱 sab ek hi bucket mein
    }

    public static void main(String[] args) {
        int n = 2000;
        long t0 = System.nanoTime();
        Map<GoodKey, Integer> good = new HashMap<>();
        for (int i = 0; i < n; i++) good.put(new GoodKey(i), i);
        for (int i = 0; i < n; i++) good.get(new GoodKey(i));
        long t1 = System.nanoTime();
        Map<BadKey, Integer> bad = new HashMap<>();
        for (int i = 0; i < n; i++) bad.put(new BadKey(i), i);
        for (int i = 0; i < n; i++) bad.get(new BadKey(i));
        long t2 = System.nanoTime();
        System.out.println("good hashCode: " + (t1 - t0) / 1000 + " micros, size " + good.size());
        System.out.println("bad hashCode : " + (t2 - t1) / 1000 + " micros, size " + bad.size());
        System.out.println("Answer dono ka sahi hai, sirf speed ka farak hai.");
    }
}`,
      note: "BadKey Comparable nahi hai, isliye tree bhi ise achhe se order nahi kar paata aur lookup lagbhag O(n) ho jaata hai. n double karke dekho (4000): bad wala bahut tezi se slow hoga."
    },
    {
      type: "text",
      html: `
              <h2>Load factor aur resize</h2>
              <ul>
                <li><b>Default capacity 16</b>, <b>load factor 0.75</b>. <b>threshold</b> = capacity × load factor = 16 × 0.75 = <b>12</b>.</li>
                <li>Size threshold se upar gaya (13va entry) to <b>resize</b>: naya table <b>double</b> (32), naya threshold 24.</li>
                <li>0.75 kyun? Time aur memory ka balance (javadoc khud yahi kehta hai). Zyada (jaise 1.0) = kam memory, lambi chains. Kam (0.5) = chhoti chains, aadha table khaali.</li>
                <li><code>new HashMap&lt;&gt;(10)</code> capacity ko agli power of 2 tak le jaata hai: <b>16</b>.</li>
                <li>Resize O(n) hai (saari entries move). Size pehle se pata ho to initial capacity do: n entries ke liye <code>n / 0.75 + 1</code>. Java 19+ mein <code>HashMap.newHashMap(n)</code> yahi calculation khud karta hai.</li>
              </ul>
              <p><b>Java 8 ka smart resize:</b> table double hone pe har node ka naya index ya to <b>wahi</b> rehta hai, ya <b>purana index + purani capacity</b>. Kaunsa? Sirf ek bit dekh ke: <code>hash &amp; oldCap</code>. Poora hash dobara calculate nahi hota, aur chain ka relative order bhi bana rehta hai.</p>`
    },
    {
      type: "steps",
      title: "Resize 16 → 32: bucket 5 ki chain kaise bant-ti hai",
      steps: [
        { title: "Pehle (capacity 16)", html: `<p>Keys 5, 21, 37 sab bucket 5 mein (neeche ke 4 bits = 0101).</p><div class="arr"><span class="cell hl">5: 5 → 21 → 37</span></div>` },
        { title: "Har node pe bit check: hash & 16", html: `<table><tr><th>key</th><th>binary</th><th>hash &amp; 16</th><th>kahan</th></tr><tr><td>5</td><td>0<b>0</b>0101</td><td>0</td><td>lo: index 5</td></tr><tr><td>21</td><td>0<b>1</b>0101</td><td>16</td><td>hi: index 5 + 16 = 21</td></tr><tr><td>37</td><td>1<b>0</b>0101</td><td>0</td><td>lo: index 5</td></tr></table>` },
        { title: "Baad mein (capacity 32)", html: `<div class="arr"><span class="cell ok">5: 5 → 37</span><span class="cell dim">...</span><span class="cell ok">21: 21</span></div><p>Chain do hisson mein bant gayi, order same (5 phir 37). Har node ke liye sirf ek AND operation.</p>` },
        { title: "Java 7 mein kya galat tha?", html: `<p>Java 7 naye node chain ke <b>head</b> pe daalta tha aur resize mein chain ulti ho jaati thi. Do threads saath resize karein to chain mein <b>cycle</b> ban sakti thi → <code>get()</code> infinite loop, CPU 100%. Java 8 tail insertion se ye specific bug gaya, par HashMap ab bhi <b>thread-safe nahi</b> hai (concurrent puts mein data lost ho sakta hai). Threads ke liye <code>ConcurrentHashMap</code>.</p>` }
      ]
    },
    {
      type: "quiz",
      q: "<code>new HashMap&lt;&gt;(100)</code> banaya aur exactly 100 entries daali. Kitni baar resize hoga?",
      options: [
        "0, capacity 100 hai",
        "1: capacity 128 banti hai, threshold 96, 97vi entry pe 256",
        "2",
        "Har entry pe"
      ],
      answer: 1,
      why: "100 → agli power of 2 = 128. Threshold = 128 × 0.75 = 96. 97vi entry pe resize to 256. Zero resize ke liye capacity ≥ 100/0.75 ≈ 134 chahiye, yaani <code>new HashMap&lt;&gt;(134)</code> → 256 (ya Java 19+ <code>HashMap.newHashMap(100)</code>)."
    },
    {
      type: "code",
      title: "Do production bugs: mutable key, aur equals bina hashCode",
      code: `import java.util.*;

public class Main {
    static class Cart {                        // ❌ mutable + hashCode fields pe depend
        List<String> items = new ArrayList<>();
        @Override public boolean equals(Object o) { return o instanceof Cart && ((Cart) o).items.equals(items); }
        @Override public int hashCode() { return items.hashCode(); }
    }

    static class Point {                       // ❌ equals hai, hashCode NAHI
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) {
            return o instanceof Point && ((Point) o).x == x && ((Point) o).y == y;
        }
    }

    public static void main(String[] args) {
        Map<Cart, String> owner = new HashMap<>();
        Cart c = new Cart();
        owner.put(c, "riya");
        c.items.add("pizza");                  // key put ke baad badal gayi → hashCode badal gaya
        System.out.println("get(c)        : " + owner.get(c));          // null! galat bucket mein dhoondha
        System.out.println("containsKey(c): " + owner.containsKey(c));
        System.out.println("size          : " + owner.size());          // entry hai, par mil nahi rahi

        Set<Point> visited = new HashSet<>();
        visited.add(new Point(1, 2));
        visited.add(new Point(1, 2));
        System.out.println("Point set size: " + visited.size());        // 2 (ya kabhi 1), dono sahi nahi
        System.out.println("contains(1,2) : " + visited.contains(new Point(1, 2)));
    }
}`,
      note: "Rule 1: HashMap key <b>immutable</b> rakho (String, Integer, record). Rule 2: <code>equals</code> override kiya to <code>hashCode</code> bhi, same fields se. Record ye dono khud sahi bana deta hai."
    },
    {
      type: "text",
      html: `
              <h2>Kaam ke APIs (Java 8+)</h2>
              <table>
                <tr><th>Method</th><th>Kya karta hai</th></tr>
                <tr><td><code>getOrDefault(k, d)</code></td><td>Key nahi to d (null unboxing se bachao)</td></tr>
                <tr><td><code>putIfAbsent(k, v)</code></td><td>Sirf tab daalo jab key na ho</td></tr>
                <tr><td><code>computeIfAbsent(k, k -&gt; new ArrayList&lt;&gt;())</code></td><td>Grouping ka idiom: list nahi hai to banao, phir return</td></tr>
                <tr><td><code>merge(k, 1, Integer::sum)</code></td><td>Counting ka idiom: nahi hai to 1, hai to purana + 1</td></tr>
                <tr><td><code>entrySet()</code></td><td>Key aur value dono chahiye to iske upar loop (keySet + get se ek lookup kam)</td></tr>
              </table>
              <h2>Family comparison</h2>
              <table>
                <tr><th></th><th>HashMap</th><th>LinkedHashMap</th><th>TreeMap</th><th>Hashtable</th><th>ConcurrentHashMap</th></tr>
                <tr><td>Order</td><td>Koi nahi</td><td>Insertion / access</td><td>Key sorted</td><td>Koi nahi</td><td>Koi nahi</td></tr>
                <tr><td>null key / value</td><td>1 null key, null values ✅</td><td>✅</td><td>null key ❌ (natural order)</td><td>❌</td><td>❌</td></tr>
                <tr><td>Thread-safe</td><td>❌</td><td>❌</td><td>❌</td><td>✅ (poore map pe lock, legacy)</td><td>✅ (CAS + per-bin lock, Java 8+)</td></tr>
                <tr><td>get/put</td><td>O(1) avg</td><td>O(1) avg</td><td>O(log n)</td><td>O(1) avg</td><td>O(1) avg</td></tr>
              </table>`
    },
    {
      type: "exercise",
      id: "ex-word-count",
      title: "Word frequency (merge use karo)",
      level: "Easy",
      task: "<p><code>countWords(text)</code>: text ko lowercase karke whitespace pe todo, aur har word kitni baar aaya uska <code>Map&lt;String, Integer&gt;</code> return karo. Khaali / sirf spaces wala text → khaali map.</p>",
      examples: "<code>\"Chai chai  coffee\"</code> → <code>{chai=2, coffee=1}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    Map<String, Integer> countWords(String text) {
        Map<String, Integer> freq = new HashMap<>();
        return freq;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"Chai chai  coffee\\"", Map.of("chai", 2, "coffee", 1), () -> s.countWords("Chai chai  coffee"));
        Check.eq("\\"a b a\\"", Map.of("a", 2, "b", 1), () -> s.countWords("a b a"));
        Check.hiddenFromHere();
        Check.eq("empty", Map.of(), () -> s.countWords(""));
        Check.eq("sirf spaces", Map.of(), () -> s.countWords("    "));
        Check.eq("leading spaces", Map.of("x", 1), () -> s.countWords("   X"));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) sb.append("w").append(i % 100).append(' ');
        String big = sb.toString();
        Check.eq("1 lakh words, w7 ka count", 1000, () -> s.countWords(big).get("w7"));
    }
}`,
      hints: [
        "<code>text.trim()</code> khaali ho to turant khaali map return karo (warna <code>split</code> ek \"\" word de dega).",
        "<code>for (String w : text.trim().toLowerCase().split(\"\\\\s+\")) freq.merge(w, 1, Integer::sum);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    Map<String, Integer> countWords(String text) {
        Map<String, Integer> freq = new HashMap<>();
        String t = text.trim().toLowerCase();
        if (t.isEmpty()) return freq;
        for (String w : t.split("\\\\s+")) {
            freq.merge(w, 1, Integer::sum);
        }
        return freq;
    }
}`,
      explain: "<p><code>merge(w, 1, Integer::sum)</code>: key nahi hai to 1 daalo, hai to <code>purana + 1</code>. Ek hi hash lookup (get + put ke do nahi). O(n) total. Edge case: <code>\"\".split(...)</code> ek khaali string wala array deta hai, isliye pehle check.</p>"
    },
    {
      type: "exercise",
      id: "ex-two-sum",
      title: "Two Sum (HashMap se O(n))",
      level: "Easy",
      task: `<p>Array <code>nums</code> aur <code>target</code> diya hai. Do <b>alag indexes</b> <code>[i, j]</code> (i &lt; j) return karo jinke values ka sum target ho. Har input mein exactly ek answer hai. 1 lakh elements tak, to O(n²) nahi chalega.</p><p><a href="https://leetcode.com/problems/two-sum/" target="_blank">LeetCode 1</a></p>`,
      examples: "<code>[2, 7, 11, 15], target 9</code> → <code>[0, 1]</code><br><code>[3, 3], target 6</code> → <code>[0, 1]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] twoSum(int[] nums, int target) {
        return new int[]{0, 0};
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,7,11,15], 9", new int[]{0, 1}, () -> s.twoSum(new int[]{2, 7, 11, 15}, 9));
        Check.eq("[3,2,4], 6", new int[]{1, 2}, () -> s.twoSum(new int[]{3, 2, 4}, 6));
        Check.hiddenFromHere();
        Check.eq("[3,3], 6 (duplicate values)", new int[]{0, 1}, () -> s.twoSum(new int[]{3, 3}, 6));
        Check.eq("negative", new int[]{0, 2}, () -> s.twoSum(new int[]{-4, 1, 10}, 6));
        Check.eq("zero", new int[]{1, 3}, () -> s.twoSum(new int[]{5, 0, 9, 0}, 0));
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = 1_000_000 + i * 2;
        big[99998] = 1; big[99999] = 3;
        Check.eq("1 lakh, answer end mein", new int[]{99998, 99999}, () -> s.twoSum(big, 4));
    }
}`,
      hints: [
        "Har element x ke liye chahiye <code>target - x</code>. Kya wo pehle dekha hai?",
        "<code>Map&lt;Integer, Integer&gt; seen</code>: value → index. Pehle check karo, phir current daalo (taaki same element do baar use na ho).",
        "<code>Integer j = seen.get(target - nums[i]); if (j != null) return new int[]{j, i}; seen.put(nums[i], i);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      explain: "<p>Ek pass: har index pe complement map mein dhoondho (O(1) avg), na mile to current daalo. Time O(n), space O(n). \"Pehle check, phir put\" order se <code>[3,3]</code> jaisa case bhi sahi chalta hai aur element khud se pair nahi banta.</p>"
    },
    {
      type: "exercise",
      id: "ex-my-hashmap",
      title: "Apna HashMap banao (chaining ke saath)",
      level: "Medium",
      task: `<p>Bina <code>java.util.HashMap</code> / <code>HashSet</code> ke ek int → int map banao (class <code>Solution</code>):</p>
             <ul><li><code>put(key, value)</code>: daalo ya update karo</li><li><code>get(key)</code>: value, ya <code>-1</code> agar nahi hai</li><li><code>remove(key)</code>: hatao (nahi hai to kuch nahi)</li></ul>
             <p>Keys 0 se 10<sup>9</sup> tak. Lesson ka design use karo: bucket array + har bucket mein chain, aur load factor cross ho to resize. Sabse bade test mein 2 lakh operations hain.</p>
             <p>Inspired by <a href="https://leetcode.com/problems/design-hashmap/" target="_blank">LeetCode 706</a>.</p>`,
      examples: "<code>put(1,1); put(2,2); get(1)</code> → 1; <code>get(3)</code> → -1; <code>put(2,1); get(2)</code> → 1; <code>remove(2); get(2)</code> → -1",
      userFile: "Solution.java",
      starter: `class Solution {
    // Hint: static class Node { int key, val; Node next; ... }
    //       Node[] table = new Node[16]; int size;

    void put(int key, int value) {
    }

    int get(int key) {
        return -1;
    }

    void remove(int key) {
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("put 1,2 → get(1), get(3)", List.of(1, -1), () -> {
            Solution m = new Solution();
            m.put(1, 1); m.put(2, 2);
            return List.of(m.get(1), m.get(3));
        });
        Check.eq("update + remove", List.of(1, -1), () -> {
            Solution m = new Solution();
            m.put(2, 2); m.put(2, 1);
            int a = m.get(2);
            m.remove(2);
            return List.of(a, m.get(2));
        });
        Check.hiddenFromHere();
        Check.eq("collisions (16 ke multiples)", List.of(0, 16, 32, 48, -1), () -> {
            Solution m = new Solution();
            for (int k = 0; k <= 48; k += 16) m.put(k, k);
            m.remove(64);
            return List.of(m.get(0), m.get(16), m.get(32), m.get(48), m.get(64));
        });
        Check.eq("chain ke beech se remove", List.of(0, -1, 32), () -> {
            Solution m = new Solution();
            m.put(0, 0); m.put(16, 16); m.put(32, 32);
            m.remove(16);
            return List.of(m.get(0), m.get(16), m.get(32));
        });
        Check.eq("bada key 10^9", 7, () -> {
            Solution m = new Solution();
            m.put(1_000_000_000, 7);
            return m.get(1_000_000_000);
        });
        Check.eq("2 lakh ops (resize chahiye)", 100000L, () -> {
            Solution m = new Solution();
            for (int i = 0; i < 100000; i++) m.put(i * 7919, i);
            long hits = 0;
            for (int i = 0; i < 100000; i++) if (m.get(i * 7919) == i) hits++;
            return hits;
        });
    }
}`,
      hints: [
        "Index: <code>(key ^ (key &gt;&gt;&gt; 16)) &amp; (table.length - 1)</code>. Table length power of 2 rakho.",
        "<code>put</code>: chain mein key dhoondho, mili to value update, warna naya node (head pe daalna aasan hai). <code>size++</code>, aur <code>size &gt; table.length * 0.75</code> ho to resize.",
        "<code>resize</code>: naya array double size ka, purane har node ko naye index pe daalo. <code>remove</code>: <code>prev</code> pointer rakho taaki chain se node nikal sako."
      ],
      solution: `class Solution {
    static class Node {
        final int key;
        int val;
        Node next;
        Node(int key, int val, Node next) { this.key = key; this.val = val; this.next = next; }
    }

    private Node[] table = new Node[16];
    private int size;

    private static int index(int key, int len) {
        return (key ^ (key >>> 16)) & (len - 1);
    }

    void put(int key, int value) {
        int i = index(key, table.length);
        for (Node n = table[i]; n != null; n = n.next) {
            if (n.key == key) { n.val = value; return; }
        }
        table[i] = new Node(key, value, table[i]);
        if (++size > table.length * 3 / 4) resize();
    }

    int get(int key) {
        for (Node n = table[index(key, table.length)]; n != null; n = n.next) {
            if (n.key == key) return n.val;
        }
        return -1;
    }

    void remove(int key) {
        int i = index(key, table.length);
        Node prev = null;
        for (Node n = table[i]; n != null; prev = n, n = n.next) {
            if (n.key == key) {
                if (prev == null) table[i] = n.next; else prev.next = n.next;
                size--;
                return;
            }
        }
    }

    private void resize() {
        Node[] old = table;
        table = new Node[old.length * 2];
        for (Node head : old) {
            for (Node n = head; n != null; ) {
                Node next = n.next;
                int i = index(n.key, table.length);
                n.next = table[i];
                table[i] = n;
                n = next;
            }
        }
    }
}`,
      explain: "<p>Ye asli HashMap ka simplified version hai: power-of-2 table, spread + mask se index, chaining, 0.75 load factor pe double resize. Average O(1) har operation; resize O(n) par kabhi kabhi, to amortized O(1).</p><p>Bina resize ke 16 buckets mein 1 lakh keys = ~6000 per chain, aur bada test slow ho jaata. Asli HashMap isme do cheezein aur jodta hai: lambi chain pe treeify, aur generic keys ke liye <code>equals</code>.</p>"
    },
    {
      type: "think",
      id: "think-hashmap",
      q: "Interview question: <b>\"HashMap internally kaise kaam karta hai?\"</b> Poora answer do jaise interview mein doge: put, get, collision, Java 8 changes, resize, aur kuch pitfalls.",
      rubric: [
        { point: "<b>Node array (buckets)</b>; index = hashCode spread karke <code>(n-1) &amp; hash</code>", keys: ["bucket", "array", "index", "hashcode", "(n-1)", "n-1", "spread"], weight: 2 },
        { point: "<b>Collision</b>: same bucket mein linked list; key match ke liye hash + <b>equals</b>", keys: ["collision", "linked list", "chain", "equals"], weight: 2 },
        { point: "<b>Java 8 treeify</b>: chain &gt; 8 → red-black tree (table ≥ 64, warna resize), wapas list ≤ 6", keys: ["treeify", "tree", "red-black", "red black", "8", "64"], weight: 2 },
        { point: "<b>Load factor 0.75</b>, default capacity 16, threshold cross → <b>double resize</b> / rehash", keys: ["load factor", "0.75", "16", "resize", "rehash", "double", "threshold"], weight: 2 },
        { point: "equals/hashCode contract aur <b>immutable keys</b>", keys: ["contract", "immutable", "mutable", "hashcode override"], weight: 1 },
        { point: "<b>Thread-safe nahi</b> → ConcurrentHashMap; null key allowed (bucket 0)", keys: ["thread", "concurrenthashmap", "synchroniz", "null key", "null"], weight: 1 }
      ],
      answer: `<p><b>Structure:</b> HashMap andar <code>Node&lt;K,V&gt;[] table</code> rakhta hai. Har Node mein <code>hash, key, value, next</code>. Table pehle <code>put</code> pe banta hai, default size 16.</p>
               <p><b>put(k, v):</b> (1) <code>k.hashCode()</code> nikalo aur <code>h ^ (h &gt;&gt;&gt; 16)</code> se spread karo. (2) index = <code>(n - 1) &amp; hash</code> (n power of 2 hai, to ye modulo jaisa hai). (3) Bucket khaali → naya node. (4) Nahi to chain mein har node pe hash compare, phir <code>equals</code>: same key mili to value replace. Nahi mili to tail pe naya node. (5) <code>++size &gt; capacity × 0.75</code> ho to resize.</p>
               <p><b>get(k):</b> same hash + index, phir bucket mein hash + equals se dhoondho. Average O(1).</p>
               <p><b>Collision aur Java 8:</b> alag keys same bucket mein aa sakti hain. Chain 8 se lambi ho aur table ≥ 64 ho to bucket <b>red-black tree</b> ban jaata hai (worst case O(n) se O(log n)). Table 64 se chhota ho to tree ki jagah resize. Resize ke baad 6 ya kam bache to wapas list.</p>
               <p><b>Resize:</b> table double, threshold double. Har node ya to same index pe rehta hai ya <code>index + oldCap</code> pe (ek bit <code>hash &amp; oldCap</code> se decide), order bana rehta hai. Resize O(n), isliye size pata ho to initial capacity do.</p>
               <p><b>Pitfalls:</b> equals override kiya to hashCode bhi (warna duplicate keys). Key mutable ho aur put ke baad badle to entry "kho" jaati hai, isliye immutable keys (String, records). Ek null key allowed hai (hash 0 → bucket 0). HashMap thread-safe nahi hai: concurrent puts mein updates lost ho sakte hain (Java 7 mein resize pe infinite loop bhi hota tha). Multi-threaded ke liye <code>ConcurrentHashMap</code> (Java 8+: segments nahi, CAS + bucket head pe synchronized).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Answer ko layers mein do: pehle 30 second ka summary (\"array of buckets, hashCode se index, collision pe list, Java 8 mein tree, 0.75 pe resize\"), phir interviewer jahan ruke wahan deep jao. Numbers (16, 0.75, 8, 64, 6) sahi bolna credibility deta hai, aur <b>kyun</b> batana (power of 2 kyun, 0.75 kyun, 64 kyun) senior level dikhata hai."
    }
  ],
  references: [
    { title: "HashMap (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html", type: "docs" },
    { title: "HashMap.java source (OpenJDK 17): implementation notes comment", by: "OpenJDK", url: "https://github.com/openjdk/jdk17u/blob/master/src/java.base/share/classes/java/util/HashMap.java", type: "article" },
    { title: "Design HashMap", by: "LeetCode", url: "https://leetcode.com/problems/design-hashmap/", type: "article" },
    { title: "Effective Java (3rd ed.), Item 11: Always override hashCode when you override equals", by: "Joshua Bloch", type: "book" }
  ]
});
