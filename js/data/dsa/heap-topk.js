// Heap / Top K
registerLesson("dsa", "heap-topk", {
  why: "\"Top K\", \"Kth largest\" aur \"running median\" interviews mein bahut aate hain (Amazon, Flipkart, Uber). Heap se ye O(n log k) mein ho jaate hain, aur interviewer dekhta hai ki aap poora sort kiye bina kaam chala sakte ho ya nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Heap kya hai?</h2>
        <p>Heap ek tree jaisa structure hai jisme <b>sabse chhota (min-heap) ya sabse bada (max-heap) element hamesha top pe</b> hota hai. Andar se ye array mein store hota hai.</p>
        <table>
          <tr><th>Operation</th><th>Java (<code>PriorityQueue</code>)</th><th>Time</th></tr>
          <tr><td>Top dekhna</td><td><code>pq.peek()</code></td><td>O(1)</td></tr>
          <tr><td>Daalna</td><td><code>pq.offer(x)</code></td><td>O(log n)</td></tr>
          <tr><td>Top nikaalna</td><td><code>pq.poll()</code></td><td>O(log n)</td></tr>
          <tr><td>Size</td><td><code>pq.size()</code></td><td>O(1)</td></tr>
        </table>
        <p>Java ka <code>PriorityQueue</code> <b>default min-heap</b> hai. Max-heap chahiye to comparator do: <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>.</p>
        <h2>Signals: heap kab lagao</h2>
        <ul>
          <li>"K largest / K smallest / K closest / K most frequent"</li>
          <li>"Kth largest element" (poora sort nahi chahiye, sirf k ka hisaab)</li>
          <li>Data <b>stream</b> mein aa raha hai, aur har time pe min/max/median chahiye (live leaderboard, Swiggy ke nearest 5 delivery partners)</li>
          <li>Baar baar "abhi ka sabse chhota/bada" chahiye (Dijkstra, merge k lists, task scheduling)</li>
        </ul>
        <h2>Brute force vs heap</h2>
        <p>n = 10 lakh scores mein se top 10 chahiye. <b>Brute force:</b> sab sort karo, O(n log n), aur O(n) extra memory agar copy banani pade. <b>Heap:</b> size k ka <b>min-heap</b> rakho. Naya element top se bada ho to top nikaalo, naya daalo. Time O(n log k), memory O(k). k = 10 ho to log k ≈ 3.3, log n ≈ 20.</p>
        <p><b>Ulta lagta hai, par yaad rakho:</b> K <b>largest</b> ke liye <b>min</b>-heap. Kyun? Heap ka top "ab tak ke top-k mein sabse kamzor" hai. Naye element ko usi se compare karna hai.</p>`
    },
    {
      type: "code",
      title: "Template: K largest elements, size-k min-heap se",
      code: `import java.util.*;

public class Main {
    static List<Integer> kLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll(); // sabse chhota bahar, top-k bache
        }
        List<Integer> out = new ArrayList<>(heap);
        Collections.sort(out, Collections.reverseOrder());
        return out;
    }

    public static void main(String[] args) {
        int[] scores = {3, 1, 5, 12, 2, 11};
        System.out.println("Top 3: " + kLargest(scores, 3));

        // Max-heap: comparator ulta karo
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        for (int x : scores) maxHeap.offer(x);
        System.out.println("Max-heap top: " + maxHeap.peek());

        // Objects ke saath: (naam, rating) ko rating se sort
        PriorityQueue<String[]> byRating = new PriorityQueue<>((a, b) -> Integer.compare(Integer.parseInt(b[1]), Integer.parseInt(a[1])));
        byRating.offer(new String[]{"Dosa Plaza", "42"});
        byRating.offer(new String[]{"Biryani Hub", "47"});
        byRating.offer(new String[]{"Chai Point", "39"});
        System.out.println("Best rated: " + byRating.poll()[0]);
    }
}`,
      note: "Dhyaan do: <code>new ArrayList&lt;&gt;(heap)</code> heap ka andar ka array order deta hai, sorted nahi. Isliye alag se sort kiya."
    },
    {
      type: "steps",
      title: "Dry run: [3, 1, 5, 12, 2, 11], k = 3 (min-heap size 3)",
      steps: [
        { title: "x = 3, 1, 5: heap bharo", html: `<div class="arr"><span class="cell ok">3</span><span class="cell ok">1</span><span class="cell ok">5</span><span class="cell">12</span><span class="cell">2</span><span class="cell">11</span></div><p>Heap = {1, 3, 5}, top = <b>1</b>. Size 3 = k, abhi kuch nahi nikla.</p>` },
        { title: "x = 12: daalo, size 4 > 3, top nikaalo", html: `<div class="arr"><span class="cell dim">3</span><span class="cell dim">1</span><span class="cell dim">5</span><span class="cell hl">12</span><span class="cell">2</span><span class="cell">11</span></div><p>Heap = {1, 3, 5, 12} → poll() 1 nikaalta hai → {3, 5, 12}, top = <b>3</b>.</p>` },
        { title: "x = 2: daalo aur turant nikal jaata hai", html: `<div class="arr"><span class="cell dim">3</span><span class="cell dim">1</span><span class="cell dim">5</span><span class="cell dim">12</span><span class="cell bad">2</span><span class="cell">11</span></div><p>Heap = {2, 3, 5, 12} → poll() 2 nikaalta hai → {3, 5, 12}. 2 top-3 mein aa hi nahi sakta tha.</p>` },
        { title: "x = 11: daalo, 3 bahar", html: `<div class="arr"><span class="cell dim">3</span><span class="cell dim">1</span><span class="cell dim">5</span><span class="cell dim">12</span><span class="cell dim">2</span><span class="cell hl">11</span></div><p>Heap = {3, 5, 11, 12} → poll() 3 → {5, 11, 12}. Top = <b>5</b>.</p>` },
        { title: "Result", html: `<div class="arr"><span class="cell ok">5</span><span class="cell ok">11</span><span class="cell ok">12</span></div><p>Top 3 = {12, 11, 5}. Aur heap ka top (5) hi <b>3rd largest</b> hai. Kth largest = size-k min-heap ka peek().</p>` }
      ]
    },
    {
      type: "quiz",
      q: "Ye code kya print karega?<pre class='code-static'>PriorityQueue&lt;Integer&gt; pq = new PriorityQueue&lt;&gt;();\npq.offer(7); pq.offer(2); pq.offer(9);\nSystem.out.println(pq.poll() + \" \" + pq.peek());</pre>",
      options: ["9 7", "2 7", "7 2", "2 9"],
      answer: 1,
      why: "Default <code>PriorityQueue</code> min-heap hai. <code>poll()</code> sabse chhota (2) nikaalta hai, phir <code>peek()</code> bache hue mein sabse chhota (7) dikhata hai."
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> max-heap ke liye <code>(a, b) -&gt; b - a</code> likhna. Agar values bahut badi/negative hon (jaise <code>Integer.MIN_VALUE</code>) to subtraction overflow karta hai aur order galat ho jaata hai. <code>Integer.compare(b, a)</code> ya <code>Comparator.reverseOrder()</code> use karo."
    },
    {
      type: "think",
      id: "think-kth",
      q: "<b>Kth Largest Element:</b> unsorted array mein k-th sabse bada element batana hai (duplicates alag gine jaate hain). Sort kiye bina kaise karoge? Time aur space?",
      rubric: [
        { point: "Size <b>k ka min-heap</b> rakho", keys: ["min-heap", "min heap", "minheap", "priorityqueue", "priority queue", "heap"], weight: 2 },
        { point: "Size k se bada ho to <b>poll</b> (sabse chhota nikaalo)", keys: ["poll", "remove", "nikaal", "size > k", "size k se", "bahar"] },
        { point: "Answer = heap ka <b>top / peek</b>", keys: ["peek", "top", "root"] },
        { point: "Time <b>O(n log k)</b>, space <b>O(k)</b>", keys: ["n log k", "nlogk", "o(k)", "log k"], weight: 2 },
        { point: "Bonus: Quickselect average O(n)", keys: ["quickselect", "quick select", "partition"] }
      ],
      answer: `<p>Size k ka min-heap. Har element daalo; size k se upar jaaye to <code>poll()</code>. End mein heap mein k sabse bade bachte hain aur unka sabse chhota (top) hi k-th largest hai.</p>
        <p>Time O(n log k), space O(k). Sort karne se O(n log n) lagta. Follow-up mein <b>Quickselect</b> (quicksort ka partition, sirf ek side recurse) average O(n) deta hai, par worst case O(n²).</p>`
    },
    {
      type: "exercise",
      id: "ex-kth-largest",
      title: "Kth Largest Element in an Array",
      level: "Medium",
      task: `<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the k-th largest element in sorted order. Duplicates count separately (in <code>[5,5,4]</code> the 2nd largest is 5).</p><p>Try to do it without sorting the whole array (for example, a min-heap of size k: O(n log k)).</p><h4>Constraints</h4><ul><li>1 ≤ k ≤ nums.length ≤ 10⁵</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/kth-largest-element-in-an-array/" target="_blank">LeetCode 215</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [3,2,1,5,6,4], k = 2
Output: 5</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [3,2,3,1,2,4,5,5,6], k = 4
Output: 4
Explanation: Sorted descending: 6,5,5,4,…</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int findKthLargest(int[] nums, int k) {
        // size-k min-heap socho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("nums=[3,2,1,5,6,4], k=2", 5, () -> s.findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));
        Check.eq("nums=[3,2,3,1,2,4,5,5,6], k=4", 4, () -> s.findKthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));
        Check.hiddenFromHere();
        Check.eq("single: [1], k=1", 1, () -> s.findKthLargest(new int[]{1}, 1));
        Check.eq("duplicates: [-1,-1], k=2", -1, () -> s.findKthLargest(new int[]{-1, -1}, 2));
        Check.eq("negatives: [-5,-2,-9], k=1", -2, () -> s.findKthLargest(new int[]{-5, -2, -9}, 1));
        Check.eq("k = n (smallest): [7,3,9,1], k=4", 1, () -> s.findKthLargest(new int[]{7, 3, 9, 1}, 4));
        int n = 100000;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = (int) ((i * 7919L) % 100003) - 50000;
        int[] sorted = big.clone();
        Arrays.sort(sorted);
        int expected = sorted[n - 500];
        Check.eq("bada input: n=100000, k=500", expected, () -> s.findKthLargest(big.clone(), 500));
    }
}`,
      hints: [
        "K largest chahiye to <b>min</b>-heap rakho, jiska top 'top-k mein sabse chhota' ho.",
        "Har element <code>offer</code> karo. <code>if (heap.size() &gt; k) heap.poll();</code>",
        "Loop ke baad <code>return heap.peek();</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}`,
      explain: "<p><b>Approach:</b> size-k min-heap. Jo element top-k mein nahi aa sakta wo turant <code>poll()</code> ho jaata hai. End mein top hi k-th largest hai.</p><p><b>Time:</b> O(n log k). <b>Space:</b> O(k). Alternative: Quickselect average O(n), worst O(n²); ya sort O(n log n).</p>"
    },
    {
      type: "think",
      id: "think-kclosest",
      q: "<b>K Closest Points to Origin:</b> 2D points ki list hai, origin (0,0) ke sabse paas wale k points chahiye. Heap kaisa banaoge, comparator kya hoga? Distance ke liye <code>Math.sqrt</code> chahiye kya?",
      rubric: [
        { point: "Size k ka <b>max-heap</b> distance ke hisaab se (top = k mein sabse door)", keys: ["max-heap", "max heap", "maxheap", "reverse", "sabse door", "farthest"], weight: 2 },
        { point: "Distance <b>x² + y²</b> compare karo, sqrt ki zaroorat nahi", keys: ["x*x", "x²", "square", "sqrt nahi", "no sqrt", "without sqrt", "squared"], weight: 2 },
        { point: "Size k se bada ho to poll", keys: ["poll", "remove", "nikaal", "size > k"] },
        { point: "Time O(n log k), space O(k)", keys: ["n log k", "nlogk", "o(k)", "log k"] }
      ],
      answer: `<p>K <b>closest</b> (smallest distance) chahiye, isliye <b>max</b>-heap of size k, distance ke hisaab se. Top = abhi ke k mein sabse door wala. Naya point usse paas ho to wo top ko replace karta hai.</p>
        <p>Distance ke liye <code>x*x + y*y</code> kaafi hai. sqrt monotonic hai, to order same rehta hai, aur floating point ki dikkat nahi. Time O(n log k), space O(k).</p>`
    },
    {
      type: "exercise",
      id: "ex-k-closest",
      title: "K Closest Points to Origin",
      level: "Medium",
      task: `<p><code>points[i] = [x, y]</code> are points on a plane. Return the <code>k</code> points closest to the origin (0, 0) by Euclidean distance. The answer may be in any order and is guaranteed to be unique.</p><p>Tip: compare <code>x² + y²</code>; the square root is not needed.</p><h4>Constraints</h4><ul><li>1 ≤ k ≤ points.length ≤ 10⁵</li><li>Coordinates fit in int; use long for x² + y² if you like</li></ul><p><a href="https://leetcode.com/problems/k-closest-points-to-origin/" target="_blank">LeetCode 973</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  points = [[1,3],[-2,2]], k = 1
Output: [[-2,2]]
Explanation: 1² + 3² = 10 and (−2)² + 2² = 8, so [-2,2] is closer.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  points = [[3,3],[5,-1],[-2,4]], k = 2
Output: [[3,3],[-2,4]]
Explanation: Squared distances: 18, 26, 20.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[][] kClosest(int[][] points, int k) {
        return new int[0][];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("points=[[1,3],[-2,2]], k=1", new int[][]{{-2, 2}}, () -> s.kClosest(new int[][]{{1, 3}, {-2, 2}}, 1));
        Check.eqAnyOrder("points=[[3,3],[5,-1],[-2,4]], k=2", new int[][]{{3, 3}, {-2, 4}}, () -> s.kClosest(new int[][]{{3, 3}, {5, -1}, {-2, 4}}, 2));
        Check.hiddenFromHere();
        Check.eqAnyOrder("single point", new int[][]{{1, 1}}, () -> s.kClosest(new int[][]{{1, 1}}, 1));
        Check.eqAnyOrder("k = n", new int[][]{{0, 1}, {1, 0}}, () -> s.kClosest(new int[][]{{0, 1}, {1, 0}}, 2));
        Check.eqAnyOrder("negative coords", new int[][]{{-1, -1}, {0, 2}}, () -> s.kClosest(new int[][]{{-5, 4}, {-1, -1}, {0, 2}, {3, -3}}, 2));
        int n = 100000;
        int[][] big = new int[n][];
        for (int i = 0; i < n; i++) {
            int j = n - 1 - i;
            big[i] = new int[]{1 + j / 10, j % 10};   // x: 1..10000, y: 0..9
        }
        Check.eqAnyOrder("bada input: n=100000, k=3", new int[][]{{1, 0}, {1, 1}, {2, 0}}, () -> s.kClosest(big, 3));
    }
}`,
      hints: [
        "K closest = k smallest distance → size k ka <b>max</b>-heap.",
        "Comparator: <code>(a, b) -&gt; Integer.compare(b[0]*b[0] + b[1]*b[1], a[0]*a[0] + a[1]*a[1])</code>",
        "Har point offer karo, size &gt; k ho to poll. End mein heap ke saare points ek <code>int[k][]</code> mein daal do."
      ],
      solution: `import java.util.*;

class Solution {
    int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(dist(b), dist(a)));
        for (int[] p : points) {
            heap.offer(p);
            if (heap.size() > k) heap.poll();
        }
        int[][] out = new int[k][];
        for (int i = 0; i < k; i++) out[i] = heap.poll();
        return out;
    }

    private int dist(int[] p) {
        return p[0] * p[0] + p[1] * p[1];
    }
}`,
      explain: "<p><b>Approach:</b> distance² ke hisaab se size-k max-heap. Top hamesha 'abhi tak ke k mein sabse door' hai, isliye paas wala naya point use bahar kar deta hai.</p><p><b>Time:</b> O(n log k). <b>Space:</b> O(k). Coordinates ≤ 10⁴ hon to x² + y² ≤ 2×10⁸, int mein fit. Bade coordinates pe <code>long</code> lo.</p>"
    },
    {
      type: "think",
      id: "think-median",
      q: "<b>Find Median from Data Stream:</b> numbers ek ek karke aate hain (jaise live delivery times). Har time pe ab tak ka median chahiye. <code>addNum</code> aur <code>findMedian</code> kaise design karoge ki dono fast hon?",
      rubric: [
        { point: "<b>Do heaps</b>: chhota half max-heap mein, bada half min-heap mein", keys: ["two heap", "do heap", "2 heap", "max-heap", "max heap", "dono heap"], weight: 2 },
        { point: "Sizes <b>balance</b> rakho (farak max 1)", keys: ["balance", "size", "barabar", "equal", "farak"], weight: 2 },
        { point: "Median = bade heap ka top, ya dono tops ka average", keys: ["average", "avg", "/ 2", "/2", "dono top", "both top", "peek"] },
        { point: "addNum O(log n), findMedian O(1)", keys: ["log n", "o(1)", "logn", "constant"] }
      ],
      answer: `<p>Do heaps: <code>low</code> = max-heap (chhote half ke liye), <code>high</code> = min-heap (bade half ke liye). Rule: low ke saare elements ≤ high ke saare, aur <code>low.size()</code> ya to <code>high.size()</code> ke barabar ho ya ek zyada.</p>
        <p><b>addNum:</b> pehle low mein daalo, phir low ka top high mein bhejo (taaki order sahi rahe). Agar high bada ho gaya to uska top wapas low mein. <b>findMedian:</b> sizes barabar → dono tops ka average, warna low ka top.</p>
        <p>addNum O(log n), findMedian O(1). Sorted list mein insert karna O(n) per add hota.</p>`
    },
    {
      type: "exercise",
      id: "ex-median-stream",
      title: "Find Median from Data Stream",
      level: "Hard",
      task: `<p>Implement <code>MedianFinder</code>:</p><ul><li><code>addNum(int num)</code> adds a number from the stream.</li><li><code>findMedian()</code> returns the median of all numbers so far as a <code>double</code>. With an even count it is the average of the two middle values.</li></ul><p>The harness calls <code>findMedian()</code> after every <code>addNum</code> and compares all the medians. Each operation should be O(log n) (two heaps).</p><h4>Constraints</h4><ul><li>Up to 10⁵ calls in total</li><li>-2³¹ ≤ num ≤ 2³¹ − 1 (use long or double when averaging)</li><li>findMedian is called only after at least one addNum</li></ul><p><a href="https://leetcode.com/problems/find-median-from-data-stream/" target="_blank">LeetCode 295</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  addNum(1), findMedian(), addNum(2), findMedian(), addNum(3), findMedian()
Output: 1.0, 1.5, 2.0</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class MedianFinder {
    MedianFinder() {
    }

    void addNum(int num) {
    }

    double findMedian() {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<Double> run(int[] nums) {
        MedianFinder mf = new MedianFinder();
        List<Double> out = new ArrayList<>();
        for (int x : nums) {
            mf.addNum(x);
            out.add(mf.findMedian());
        }
        return out;
    }

    public static void main(String[] args) {
        Check.eq("add 1, 2, 3", List.of(1.0, 1.5, 2.0), () -> run(new int[]{1, 2, 3}));
        Check.eq("add 6, 10, 2, 6, 5, 0", List.of(6.0, 8.0, 6.0, 6.0, 6.0, 5.5), () -> run(new int[]{6, 10, 2, 6, 5, 0}));
        Check.hiddenFromHere();
        Check.eq("single", List.of(5.0), () -> run(new int[]{5}));
        Check.eq("negatives, decreasing", List.of(-1.0, -1.5, -2.0, -2.5, -3.0), () -> run(new int[]{-1, -2, -3, -4, -5}));
        Check.eq("duplicates", List.of(2.0, 2.0, 2.0), () -> run(new int[]{2, 2, 2}));
        Check.eq("bade numbers (overflow trap)", List.of(2147483647.0, 2147483647.0), () -> run(new int[]{2147483647, 2147483647}));
        int n = 100000;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = (int) ((i * 7919L) % 100003);
        List<Double> expected = new ArrayList<>();
        for (int c = 10000; c <= n; c += 10000) {
            int[] pre = Arrays.copyOf(big, c);
            Arrays.sort(pre);
            expected.add((pre[c / 2 - 1] + (double) pre[c / 2]) / 2.0);
        }
        Check.eq("bada input: 100000 adds, har add pe findMedian (har 10000 pe check)", expected, () -> {
            MedianFinder mf = new MedianFinder();
            List<Double> got = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                mf.addNum(big[i]);
                double m = mf.findMedian();
                if ((i + 1) % 10000 == 0) got.add(m);
            }
            return got;
        });
    }
}`,
      hints: [
        "Do heaps socho: chhote half ke liye max-heap, bade half ke liye min-heap.",
        "addNum: <code>low.offer(num); high.offer(low.poll()); if (high.size() &gt; low.size()) low.offer(high.poll());</code>",
        "findMedian: sizes barabar ho to <code>((double) low.peek() + high.peek()) / 2</code>, warna <code>low.peek()</code>. Double mein cast pehle karo, warna int overflow."
      ],
      solution: `import java.util.*;

class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder()); // max-heap
    private final PriorityQueue<Integer> high = new PriorityQueue<>();                         // min-heap

    MedianFinder() {
    }

    void addNum(int num) {
        low.offer(num);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }

    double findMedian() {
        if (low.size() == high.size()) return ((double) low.peek() + high.peek()) / 2.0;
        return low.peek();
    }
}`,
      explain: "<p><b>Approach:</b> low (max-heap) mein chhota half, high (min-heap) mein bada half. Har add ke baad low ka size high ke barabar ya ek zyada. Median dono tops se mil jaata hai.</p><p><b>Time:</b> addNum O(log n), findMedian O(1). <b>Space:</b> O(n).</p><p>Follow-up: agar saare numbers 0-100 ke beech hon to 101 size ka count array kaafi hai, median O(100) mein.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Heap use karne se pehle bolo: \"Sort O(n log n) hoga, par mujhe sirf top k chahiye, isliye size-k heap se O(n log k) aur O(k) memory.\" Phir min ya max heap kyun, ye ek line mein justify karo. Ye reasoning code se zyada marks deti hai."
    }
  ],
  references: [
    { title: "Kth Largest Element in an Array", by: "LeetCode", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", type: "article" },
    { title: "K Closest Points to Origin", by: "LeetCode", url: "https://leetcode.com/problems/k-closest-points-to-origin/", type: "article" },
    { title: "Find Median from Data Stream", by: "LeetCode", url: "https://leetcode.com/problems/find-median-from-data-stream/", type: "article" },
    { title: "NeetCode roadmap (Heap / Priority Queue)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" },
    { title: "Java 17 API (java.util.PriorityQueue)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" }
  ]
});
