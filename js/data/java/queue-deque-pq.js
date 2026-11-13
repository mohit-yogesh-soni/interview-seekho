// Queue, Deque, PriorityQueue
registerLesson("java", "queue-deque-pq", {
  why: "BFS, sliding window, undo, scheduling, top-K, Dijkstra: sab Queue/Deque/PriorityQueue pe chalte hain. Interview mein 'Stack class kyun nahi?', 'PriorityQueue andar kaise kaam karta hai?' aur top-K problems bahut common hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Queue: FIFO (pehle aao, pehle jao)</h2>
              <p>IRCTC waitlist ya chai ki line: jo pehle aaya wo pehle niklega. <code>Queue</code> interface mein har kaam ke <b>do</b> methods hain:</p>
              <table>
                <tr><th>Kaam</th><th>Exception deta hai (fail pe)</th><th>Special value deta hai</th></tr>
                <tr><td>Daalo (tail pe)</td><td><code>add(e)</code></td><td><code>offer(e)</code> → false</td></tr>
                <tr><td>Nikalo (head se)</td><td><code>remove()</code></td><td><code>poll()</code> → null</td></tr>
                <tr><td>Sirf dekho</td><td><code>element()</code></td><td><code>peek()</code> → null</td></tr>
              </table>
              <p>DSA mein aksar <code>offer / poll / peek</code> use karte hain: khaali queue pe exception ki jagah null milta hai.</p>
              <h2>Deque: dono ends</h2>
              <p><code>Deque</code> (double-ended queue, "deck") mein dono taraf se daal/nikal sakte ho: <code>offerFirst/offerLast</code>, <code>pollFirst/pollLast</code>, <code>peekFirst/peekLast</code>. Isliye ye <b>queue bhi hai aur stack bhi</b>.</p>
              <table>
                <tr><th>Use as</th><th>Daalo</th><th>Nikalo</th><th>Dekho</th></tr>
                <tr><td>Queue (FIFO)</td><td><code>offer</code> (= offerLast)</td><td><code>poll</code> (= pollFirst)</td><td><code>peek</code></td></tr>
                <tr><td>Stack (LIFO)</td><td><code>push</code> (= addFirst)</td><td><code>pop</code> (= removeFirst)</td><td><code>peek</code></td></tr>
              </table>
              <p><b>ArrayDeque</b> andar ek circular (ghoomne wala) resizable array hai, head aur tail indexes ke saath. Dono ends pe amortized O(1). Javadoc ke hisaab se ye stack ke roop mein <code>Stack</code> se aur queue ke roop mein <code>LinkedList</code> se fast hone ki ummeed hai. <b>null allowed nahi</b> (kyunki <code>poll()</code> ka null "khaali" ka signal hai).</p>
              <p><b><code>Stack</code> class kyun nahi?</b> Wo Java 1.0 ki hai, <code>Vector</code> ko extend karti hai (har method synchronized, bekaar ka lock), aur Vector ki wajah se beech ke index pe <code>add(i, x)</code> jaise non-stack kaam bhi allow karti hai.</p>`
    },
    {
      type: "code",
      title: "ArrayDeque as stack aur queue + Stack class ka iteration trap",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<String> undo = new ArrayDeque<>();     // stack
        undo.push("type A");
        undo.push("type B");
        undo.push("bold");
        System.out.println("undo: " + undo.pop());   // bold (last in, first out)
        System.out.println("next: " + undo.peek());

        Queue<String> tatkal = new ArrayDeque<>();   // queue
        tatkal.offer("Riya");
        tatkal.offer("Aman");
        tatkal.offer("Kabir");
        System.out.println("served: " + tatkal.poll() + ", baaki: " + tatkal);
        System.out.println("khaali queue pe poll: " + new ArrayDeque<String>().poll());

        // Trap: dono ko 1,2,3 push karo aur print karo
        Stack<Integer> legacy = new Stack<>();
        Deque<Integer> modern = new ArrayDeque<>();
        for (int i = 1; i <= 3; i++) { legacy.push(i); modern.push(i); }
        System.out.println("Stack     : " + legacy);   // bottom → top
        System.out.println("ArrayDeque: " + modern);   // top → bottom
    }
}`,
      note: "Dono LIFO pop karte hain, par <b>print/iterate ka order ulta</b> hai. <code>Stack</code> (Vector) neeche se upar iterate karta hai, <code>ArrayDeque</code> top se. Output questions mein ye aata hai."
    },
    {
      type: "exercise",
      id: "ex-valid-brackets",
      title: "Brackets valid hain? (stack)",
      level: "Easy",
      task: `<p>String mein sirf <code>()[]{}</code> hain. <code>isValid(s)</code> true de agar har opening bracket ka sahi type ka closing bracket sahi order mein hai.</p><p><a href="https://leetcode.com/problems/valid-parentheses/" target="_blank">LeetCode 20</a></p>`,
      examples: "<code>\"([]{})\"</code> → true<br><code>\"(]\"</code> → false<br><code>\"([)]\"</code> → false",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    boolean isValid(String s) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"([]{})\\"", true, () -> s.isValid("([]{})"));
        Check.eq("\\"(]\\"", false, () -> s.isValid("(]"));
        Check.hiddenFromHere();
        Check.eq("\\"([)]\\"", false, () -> s.isValid("([)]"));
        Check.eq("empty", true, () -> s.isValid(""));
        Check.eq("sirf opening", false, () -> s.isValid("(("));
        Check.eq("sirf closing", false, () -> s.isValid("))"));
        String big = "(".repeat(100000) + ")".repeat(100000);
        Check.eq("2 lakh chars", true, () -> s.isValid(big));
    }
}`,
      hints: [
        "Opening mile to stack pe push. Closing mile to stack ka top matching opening hona chahiye.",
        "Closing pe stack khaali ho to false. End mein stack khaali hona chahiye.",
        "Trick: opening pe uska <b>closing</b> push karo (<code>'(' → ')'</code>), phir closing pe sirf <code>stack.pop() == c</code> check."
      ],
      solution: `import java.util.*;

class Solution {
    boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');
            else if (c == '[') st.push(']');
            else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }
}`,
      explain: "<p>Stack \"abhi tak khule hue brackets\" yaad rakhta hai, sabse naya top pe. Time O(n), space O(n). <code>Stack&lt;Character&gt;</code> bhi chalega, par <code>ArrayDeque</code> modern choice hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>PriorityQueue: hamesha sabse chhota pehle</h2>
              <p>Queue jisme order arrival ka nahi, <b>priority</b> ka hai. Default: <b>min-heap</b> (sabse chhota pehle). Andar ek <b>binary heap</b> hai jo ek array mein store hota hai:</p>
              <pre class="diagram">
          1              array: [1, 3, 8, 5, 4]
        /   \\                    0  1  2  3  4
       3     8           index i ka parent  = (i - 1) / 2
      / \\                index i ke children = 2i + 1, 2i + 2
     5   4
  Rule: har parent apne children se chhota ya barabar (heap property)
  Sirf root (index 0) guaranteed minimum hai. Baaki array SORTED NAHI hai.</pre>
              <table>
                <tr><th>Operation</th><th>Time</th></tr>
                <tr><td><code>offer(e)</code></td><td>O(log n): end mein daalo, parent se chhota ho to upar swap (sift up)</td></tr>
                <tr><td><code>poll()</code></td><td>O(log n): root nikalo, last element root pe, neeche swap (sift down)</td></tr>
                <tr><td><code>peek()</code></td><td>O(1)</td></tr>
                <tr><td><code>remove(obj)</code>, <code>contains(obj)</code></td><td>O(n): poora array scan</td></tr>
                <tr><td>Saare n elements ek saath (constructor with collection)</td><td>O(n) heapify</td></tr>
              </table>
              <p>Max-heap: <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>. Custom: <code>new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a[1], b[1]))</code>. Thread-safe nahi; threads ke liye <code>PriorityBlockingQueue</code>.</p>`
    },
    {
      type: "steps",
      title: "Min-heap mein offer: 5, 3, 8, 1 (sift up)",
      steps: [
        { title: "offer 5", html: `<div class="arr"><span class="cell hl">5</span></div><p>Pehla element = root.</p>` },
        { title: "offer 3: end mein daala", html: `<div class="arr"><span class="cell">5</span><span class="cell hl">3</span></div><p>Index 1, parent index 0 (5). 3 &lt; 5 → swap.</p>` },
        { title: "swap ke baad", html: `<div class="arr"><span class="cell ok">3</span><span class="cell">5</span></div>` },
        { title: "offer 8", html: `<div class="arr"><span class="cell">3</span><span class="cell">5</span><span class="cell hl">8</span></div><p>Index 2, parent 3. 8 &gt; 3 → koi swap nahi.</p>` },
        { title: "offer 1: index 3, parent index 1 (5)", html: `<div class="arr"><span class="cell">3</span><span class="cell">5</span><span class="cell">8</span><span class="cell hl">1</span></div><p>1 &lt; 5 → swap.</p>` },
        { title: "1 ab index 1 pe, parent index 0 (3)", html: `<div class="arr"><span class="cell">3</span><span class="cell hl">1</span><span class="cell">8</span><span class="cell">5</span></div><p>1 &lt; 3 → swap phir.</p>` },
        { title: "Final heap", html: `<div class="arr"><span class="cell ok">1</span><span class="cell">3</span><span class="cell">8</span><span class="cell">5</span></div><p>Root = min. Array <code>[1, 3, 8, 5]</code> sorted nahi hai! <code>System.out.println(pq)</code> yahi array dikhata hai. Har offer zyada se zyada height (log n) swaps.</p>` }
      ]
    },
    {
      type: "steps",
      title: "poll() on [1, 3, 8, 5] (sift down)",
      steps: [
        { title: "Root nikalo (1), last (5) ko root pe rakho", html: `<div class="arr"><span class="cell hl">5</span><span class="cell">3</span><span class="cell">8</span></div><p>Return value 1 hogi. Ab heap property toot gayi.</p>` },
        { title: "Children 3 aur 8 mein chhota = 3. 5 > 3 → swap", html: `<div class="arr"><span class="cell">3</span><span class="cell hl">5</span><span class="cell">8</span></div>` },
        { title: "5 ab index 1 pe, koi child nahi → ruk jao", html: `<div class="arr"><span class="cell ok">3</span><span class="cell">5</span><span class="cell">8</span></div><p>Naya min 3 root pe. O(log n).</p>` }
      ]
    },
    {
      type: "code",
      title: "PriorityQueue: print sorted nahi, poll sorted hai",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : new int[]{5, 3, 8, 1, 4}) pq.offer(x);
        System.out.println("toString (heap array): " + pq);
        System.out.println("peek (min)           : " + pq.peek());
        StringBuilder sorted = new StringBuilder();
        while (!pq.isEmpty()) sorted.append(pq.poll()).append(' ');
        System.out.println("poll order           : " + sorted);

        PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
        max.addAll(List.of(5, 3, 8, 1, 4));
        System.out.println("max-heap peek        : " + max.peek());

        // Delivery partners: [id, distanceMeters], nearest pehle
        PriorityQueue<int[]> nearest = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
        nearest.offer(new int[]{101, 900});
        nearest.offer(new int[]{102, 250});
        nearest.offer(new int[]{103, 600});
        System.out.println("assign partner       : " + nearest.poll()[0]);

        // Trap: (a, b) -> a - b overflow kar sakta hai
        Comparator<Integer> bad = (a, b) -> a - b;
        System.out.println("bad compare(MIN, 1)  : " + bad.compare(Integer.MIN_VALUE, 1) + "  (positive! matlab MIN > 1 ??)");
        System.out.println("Integer.compare      : " + Integer.compare(Integer.MIN_VALUE, 1));
    }
}`
    },
    {
      type: "quiz",
      q: "<code>for (int x : pq) System.out.print(x + \" \");</code> PriorityQueue pe kya order deta hai?",
      options: ["Hamesha sorted ascending", "Insertion order", "Internal heap array ka order: koi sorted guarantee nahi", "Descending"],
      answer: 2,
      why: "Javadoc saaf kehta hai: iterator kisi particular order ki guarantee nahi deta. Sorted chahiye to <code>poll()</code> loop karo (queue khaali ho jaayegi), ya <code>Arrays.sort(pq.toArray())</code>."
    },
    {
      type: "exercise",
      id: "ex-kth-largest",
      title: "K-th largest element (size-k min-heap)",
      level: "Medium",
      task: `<p><code>kthLargest(nums, k)</code>: sorted order mein k-th sabse bada element (duplicates gine jaate hain). Pura sort kiye bina karo: size k ka min-heap.</p><p><a href="https://leetcode.com/problems/kth-largest-element-in-an-array/" target="_blank">LeetCode 215</a></p>`,
      examples: "<code>[3,2,1,5,6,4], k=2</code> → <code>5</code><br><code>[3,2,3,1,2,4,5,5,6], k=4</code> → <code>4</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int kthLargest(int[] nums, int k) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,2,1,5,6,4], k=2", 5, () -> s.kthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));
        Check.eq("[3,2,3,1,2,4,5,5,6], k=4", 4, () -> s.kthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));
        Check.hiddenFromHere();
        Check.eq("single", 7, () -> s.kthLargest(new int[]{7}, 1));
        Check.eq("k = n (minimum)", -3, () -> s.kthLargest(new int[]{-1, -3, 2}, 3));
        Check.eq("sab same", 4, () -> s.kthLargest(new int[]{4, 4, 4}, 2));
        int[] big = new int[200000];
        for (int i = 0; i < big.length; i++) big[i] = (int) ((i * 2654435761L) % 1000003);
        int[] copy = big.clone();
        java.util.Arrays.sort(copy);
        int expected = copy[copy.length - 10];
        Check.eq("2 lakh, k=10", expected, () -> s.kthLargest(big, 10));
    }
}`,
      hints: [
        "Min-heap mein ab tak ke k sabse bade elements rakho. Root = unme sabse chhota = k-th largest.",
        "Har element offer karo; size &gt; k ho jaaye to <code>poll()</code> (sabse chhota bahar).",
        "End mein <code>pq.peek()</code>. Time O(n log k)."
      ],
      solution: `import java.util.*;

class Solution {
    int kthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : nums) {
            pq.offer(x);
            if (pq.size() > k) pq.poll();
        }
        return pq.peek();
    }
}`,
      explain: "<p>Heap kabhi k se bada nahi hota, to har operation O(log k). Total O(n log k), space O(k). Sort O(n log n) aur O(n) memory leta hai. Follow-up: Quickselect average O(n) hai, par worst O(n²).</p>"
    },
    {
      type: "exercise",
      id: "ex-top-k-frequent",
      title: "Top K frequent elements",
      level: "Medium",
      task: `<p><code>topKFrequent(nums, k)</code>: k sabse zyada baar aane wale numbers return karo (order matter nahi). Answer unique hai.</p><p>Real life: Zomato pe aaj ke top 10 ordered dishes. <a href="https://leetcode.com/problems/top-k-frequent-elements/" target="_blank">LeetCode 347</a></p>`,
      examples: "<code>[1,1,1,2,2,3], k=2</code> → <code>[1, 2]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<Integer> topKFrequent(int[] nums, int k) {
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("[1,1,1,2,2,3], k=2", List.of(1, 2), () -> s.topKFrequent(new int[]{1, 1, 1, 2, 2, 3}, 2));
        Check.eqAnyOrder("[1], k=1", List.of(1), () -> s.topKFrequent(new int[]{1}, 1));
        Check.hiddenFromHere();
        Check.eqAnyOrder("negative", List.of(-1), () -> s.topKFrequent(new int[]{-1, -1, 2}, 1));
        Check.eqAnyOrder("k = unique count", List.of(4, 5, 6), () -> s.topKFrequent(new int[]{4, 5, 5, 6, 6, 6}, 3));
        int[] big = new int[200000];
        for (int i = 0; i < big.length; i++) big[i] = i % 1000 < 3 ? 7_000 + i % 1000 : i;
        Check.eqAnyOrder("2 lakh elements", List.of(7000, 7001, 7002), () -> s.topKFrequent(big, 3));
    }
}`,
      hints: [
        "Pehle <code>HashMap</code> mein har number ka count.",
        "Phir size-k <b>min-heap</b> jo count se compare kare: <code>new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(count.get(a), count.get(b)))</code>.",
        "Har key offer karo, size &gt; k ho to poll. End mein heap ke elements answer hain."
      ],
      solution: `import java.util.*;

class Solution {
    List<Integer> topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> Integer.compare(count.get(a), count.get(b)));
        for (int key : count.keySet()) {
            heap.offer(key);
            if (heap.size() > k) heap.poll();
        }
        return new ArrayList<>(heap);
    }
}`,
      explain: "<p>Count O(n). Heap mein m unique keys, har ek O(log k): total O(n + m log k). Space O(m). Follow-up: bucket sort (index = frequency) se O(n) bhi ho sakta hai.</p>"
    },
    {
      type: "think",
      id: "think-topk-stream",
      q: "Interview question: <b>\"Zomato pe din bhar mein 50 crore order events aate hain (dish name). Top 10 dishes nikalni hain. Memory limited hai. Kaise karoge?\"</b>",
      rubric: [
        { point: "Pehle <b>count</b> (HashMap dish → count), dishes ki sankhya events se bahut kam hai", keys: ["count", "hashmap", "frequency", "map"], weight: 2 },
        { point: "Phir <b>size-10 min-heap</b>: O(m log k), poora sort nahi", keys: ["min-heap", "min heap", "priorityqueue", "priority queue", "heap"], weight: 2 },
        { point: "Root se compare: naya count root se bada ho tabhi replace", keys: ["root", "peek", "smallest", "chhota", "replace"], weight: 1 },
        { point: "Complexity: O(n) count + O(m log k), memory O(m + k)", keys: ["log k", "o(n", "complexity", "memory"], weight: 1 },
        { point: "Scale: distributed (har server local top-k / counts, phir merge) ya approximate (Count-Min Sketch)", keys: ["distributed", "merge", "shard", "count-min", "sketch", "approximate", "kafka", "stream"], weight: 2 }
      ],
      answer: `<p><b>Step 1, count:</b> <code>HashMap&lt;String, Long&gt;</code> mein har dish ka count. Events 50 crore hain par unique dishes shayad kuch lakh, to map memory mein aa jaata hai.</p>
               <p><b>Step 2, top-k:</b> size 10 ka <b>min-heap</b> (count se). Har dish ke liye: heap mein 10 se kam hain to daalo; warna agar count &gt; root ka count, root nikalo aur naya daalo. Root hamesha top-10 mein sabse kamzor hai. Time O(m log 10) ≈ O(m), memory O(10) heap ke liye. Poora sort O(m log m) hota.</p>
               <p><b>Scale pe:</b> ek machine pe events nahi aayenge. Har partition/server apne counts banaye (ya Kafka Streams / Flink mein windowed counts), phir central jagah merge karke top-k. Agar unique items bhi bahut zyada hon (jaise search queries), to <b>Count-Min Sketch</b> + heap se approximate top-k, bahut kam memory mein.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"K largest\" ke liye <b>min</b>-heap aur \"K smallest\" ke liye <b>max</b>-heap. Ulta lagta hai, par logic ye hai ki heap ka root wo element hai jise sabse pehle <b>bahar phenkna</b> hai. Ye ek line bolne se interviewer ko pata chal jaata hai ki aap pattern samajhte ho."
    }
  ],
  references: [
    { title: "PriorityQueue (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/PriorityQueue.html", type: "docs" },
    { title: "ArrayDeque (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayDeque.html", type: "docs" },
    { title: "Top K Frequent Elements", by: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-elements/", type: "article" },
    { title: "Heaps playlist / Striver A2Z sheet", by: "Striver (takeUforward)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
