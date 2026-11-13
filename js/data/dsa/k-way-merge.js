// K-way Merge
registerLesson("dsa", "k-way-merge", {
  why: "Jab k alag sorted sources ko ek sorted output mein jodna ho (k sorted lists, sorted files, har server ke sorted logs), to heap se O(N log k) mein ho jaata hai. \"Merge K Sorted Lists\" FAANG ka favourite Hard question hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem kya hai?</h2>
        <p>Socho Zomato ke 3 data centers apne apne orders ko time ke hisaab se sorted log mein rakhte hain. Aapko teeno ka ek combined sorted log chahiye.</p>
        <h2>Signals</h2>
        <ul>
          <li>Input mein <b>k sorted</b> lists/arrays/files hain</li>
          <li>Matrix jiski har row (ya column) sorted hai, aur "k-th smallest" pucha hai</li>
          <li>"Smallest range covering k lists", "merge sorted streams"</li>
        </ul>
        <h2>Brute force vs pattern</h2>
        <p><b>Brute force:</b> saare N elements ek list mein daalo aur sort karo: O(N log N). Sorted hone ka fayda hi nahi uthaya.</p>
        <p><b>Pattern:</b> har list ka <b>pehla</b> element ek min-heap mein daalo. Heap ka top = poore data ka sabse chhota. Use output mein likho aur <b>usi list ka agla</b> element heap mein daalo. Heap mein kabhi bhi max k elements hote hain, to har step O(log k). Total O(N log k).</p>
        <pre class="diagram">
list0: 1 → 4 → 5        heap (har list ka "front")
list1: 1 → 3 → 4   ──►  { 1(l0), 1(l1), 2(l2) }
list2: 2 → 6            poll 1(l0) → output, push 4(l0)
</pre>
        <p>Heap mein sirf value nahi, <b>"kis list se, kis index pe"</b> bhi rakhna padta hai, taaki agla element pata ho.</p>`
    },
    {
      type: "code",
      title: "Template: k sorted arrays merge (heap mein {value, listIndex, elementIndex})",
      code: `import java.util.*;

public class Main {
    static List<Integer> mergeK(int[][] lists) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        for (int i = 0; i < lists.length; i++) {
            if (lists[i].length > 0) heap.offer(new int[]{lists[i][0], i, 0});
        }
        List<Integer> out = new ArrayList<>();
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            out.add(top[0]);
            int li = top[1], next = top[2] + 1;
            if (next < lists[li].length) heap.offer(new int[]{lists[li][next], li, next});
        }
        return out;
    }

    public static void main(String[] args) {
        int[][] logs = { {1, 4, 5}, {1, 3, 4}, {2, 6}, {} };
        System.out.println(mergeK(logs));
    }
}`
    },
    {
      type: "steps",
      title: "Dry run: [1,4,5], [1,3,4], [2,6]",
      steps: [
        { title: "Shuru: har list ka pehla element heap mein", html: `<pre class="diagram">l0: [1] 4  5
l1: [1] 3  4
l2: [2] 6

heap = {1(l0), 1(l1), 2(l2)}
output = []</pre>` },
        { title: "poll 1(l0), push 4(l0)", html: `<pre class="diagram">l0:  1 [4] 5
l1: [1] 3  4
l2: [2] 6

heap = {1(l1), 2(l2), 4(l0)}
output = [1]</pre>` },
        { title: "poll 1(l1), push 3(l1)", html: `<pre class="diagram">l0:  1 [4] 5
l1:  1 [3] 4
l2: [2] 6

heap = {2(l2), 3(l1), 4(l0)}
output = [1, 1]</pre>` },
        { title: "poll 2(l2), push 6(l2)", html: `<pre class="diagram">l0:  1 [4] 5
l1:  1 [3] 4
l2:  2 [6]

heap = {3(l1), 4(l0), 6(l2)}
output = [1, 1, 2]</pre>` },
        { title: "Aise hi chalta raho", html: `<pre class="diagram">poll 3(l1) push 4(l1)  → [1,1,2,3]
poll 4(l0) push 5(l0)  → [1,1,2,3,4]
poll 4(l1) (l1 khatam) → [1,1,2,3,4,4]
poll 5(l0) (l0 khatam) → [...,5]
poll 6(l2) (l2 khatam) → [1,1,2,3,4,4,5,6]</pre><p>Heap ka size kabhi 3 (= k) se zyada nahi hua.</p>` }
      ]
    },
    {
      type: "quiz",
      q: "k = 1000 sorted lists, total N = 10 lakh elements. Heap approach ka time kitna hoga?",
      options: ["O(N log N) ≈ 2 crore operations", "O(N log k) ≈ 1 crore operations", "O(N · k) ≈ 100 crore operations", "O(k log N)"],
      answer: 1,
      why: "Har element ek baar heap mein jaata aur nikalta hai, aur heap ka size ≤ k hai. log₂ 1000 ≈ 10, to 10⁶ × 10 = 10⁷. Lists ko ek ek karke merge karte to O(N · k) lagta."
    },
    {
      type: "think",
      id: "think-merge-k",
      q: "<b>Merge K Sorted Lists:</b> k sorted linked lists ko ek sorted linked list mein jodna hai. Approach aur complexity batao. Koi doosra tareeka bhi hai?",
      rubric: [
        { point: "Har list ka head ek <b>min-heap</b> mein", keys: ["heap", "priorityqueue", "priority queue", "min-heap"], weight: 2 },
        { point: "Poll kiya node output mein jodo, uska <b>next</b> heap mein daalo", keys: ["next", "agla", "node.next", "push next"], weight: 2 },
        { point: "Dummy node se output list banana", keys: ["dummy", "tail", "sentinel"] },
        { point: "Time O(N log k), space O(k)", keys: ["n log k", "nlogk", "log k", "o(k)"], weight: 2 },
        { point: "Alternative: divide and conquer (pair-wise merge), bhi O(N log k)", keys: ["divide", "pair", "conquer", "merge sort", "do do"] }
      ],
      answer: `<p>Saare non-null heads ko min-heap (val ke hisaab se) mein daalo. Ek <b>dummy</b> node aur <code>tail</code> pointer rakho. Jab tak heap khaali nahi: top node poll karo, <code>tail.next = node</code>, aur agar <code>node.next != null</code> to use heap mein daalo.</p>
        <p>Time O(N log k), space O(k) heap ke liye. Alternative: lists ko jodi mein merge karo (merge sort jaisa), log k rounds, har round O(N): total O(N log k), extra space O(1) (recursion ke bina).</p>`
    },
    {
      type: "exercise",
      id: "ex-merge-k-lists",
      title: "Merge K Sorted Lists",
      level: "Hard",
      task: `<p><code>lists</code> holds the heads of k linked lists, each sorted in ascending order. Merge them into one sorted linked list and return its head. Some lists may be empty (<code>null</code>).</p><p>The hidden tests are large: aim for O(N log k), where N is the total number of nodes (min-heap of the k current heads).</p><h4>Constraints</h4><ul><li>0 ≤ k ≤ 10⁴</li><li>Each list is sorted ascending</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/merge-k-sorted-lists/" target="_blank">LeetCode 23</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  lists = []
Output: []</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  lists = [[]]
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }

class Solution {
    ListNode mergeKLists(ListNode[] lists) {
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static ListNode build(int[] a) {
        ListNode dummy = new ListNode(0), t = dummy;
        for (int x : a) { t.next = new ListNode(x); t = t.next; }
        return dummy.next;
    }

    static ListNode[] lists(int[][] arrs) {
        ListNode[] out = new ListNode[arrs.length];
        for (int i = 0; i < arrs.length; i++) out[i] = build(arrs[i]);
        return out;
    }

    static List<Integer> toList(ListNode h) {
        List<Integer> out = new ArrayList<>();
        int guard = 0;
        while (h != null && guard++ < 2000000) { out.add(h.val); h = h.next; }
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,4,5],[1,3,4],[2,6]]", List.of(1, 1, 2, 3, 4, 4, 5, 6), () -> toList(s.mergeKLists(lists(new int[][]{{1, 4, 5}, {1, 3, 4}, {2, 6}}))));
        Check.eq("[] (koi list nahi)", List.of(), () -> toList(s.mergeKLists(new ListNode[0])));
        Check.eq("[[]] (ek khaali list)", List.of(), () -> toList(s.mergeKLists(lists(new int[][]{{}}))));
        Check.hiddenFromHere();
        Check.eq("single list", List.of(1, 2, 3), () -> toList(s.mergeKLists(lists(new int[][]{{1, 2, 3}}))));
        Check.eq("negatives + duplicates + khaali", List.of(-5, -5, -1, 0, 0, 2), () -> toList(s.mergeKLists(lists(new int[][]{{-5, 0}, {}, {-5, -1, 0, 2}}))));
        Check.eq("uneven lengths", List.of(1, 2, 3, 4, 5, 6, 7, 8, 9), () -> toList(s.mergeKLists(lists(new int[][]{{9}, {1, 2, 3, 4, 5, 6, 7, 8}}))));
        int k = 1000, len = 100;
        int[][] big = new int[k][len];
        for (int j = 0; j < k; j++) for (int t = 0; t < len; t++) big[j][t] = j + k * t;
        List<Integer> expected = new ArrayList<>();
        for (int v = 0; v < k * len; v++) expected.add(v);
        Check.eq("bada input: k=1000 lists x 100 nodes", expected, () -> toList(s.mergeKLists(lists(big))));
    }
}`,
      hints: [
        "Min-heap of <code>ListNode</code>: <code>new PriorityQueue&lt;ListNode&gt;((a, b) -&gt; Integer.compare(a.val, b.val))</code>. Null heads mat daalna.",
        "Ek <code>dummy</code> node banao aur <code>tail</code> se output jodte jao.",
        "Loop: <code>node = heap.poll(); tail.next = node; tail = node; if (node.next != null) heap.offer(node.next);</code>"
      ],
      solution: `import java.util.*;

class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }

class Solution {
    ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode head : lists) if (head != null) heap.offer(head);
        ListNode dummy = new ListNode(0), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();
            tail.next = node;
            tail = node;
            if (node.next != null) heap.offer(node.next);
        }
        tail.next = null;
        return dummy.next;
    }
}`,
      explain: "<p><b>Approach:</b> har list ka current front heap mein. Sabse chhota nikaalo, output mein jodo, uska next daalo. Naye nodes nahi banaye, purane nodes ko hi jod diya.</p><p><b>Time:</b> O(N log k), N = total nodes. <b>Space:</b> O(k) heap. Divide and conquer bhi O(N log k) deta hai.</p>"
    },
    {
      type: "think",
      id: "think-kth-matrix",
      q: "<b>Kth Smallest in a Sorted Matrix:</b> n×n matrix ki har row aur har column ascending hai. k-th sabse chhota element chahiye. Isko k-way merge kaise banaoge? Koi aur tareeka?",
      rubric: [
        { point: "Har <b>row ek sorted list</b> hai, to n lists ka merge", keys: ["row", "list", "har row", "each row"], weight: 2 },
        { point: "Har row ka pehla element heap mein, <b>k-1 baar poll</b> karke us row ka agla daalo", keys: ["k-1", "k - 1", "k baar", "k times", "poll"], weight: 2 },
        { point: "Time O(k log n) (heap size ≤ n)", keys: ["k log n", "klogn", "log n"] },
        { point: "Alternative: <b>value pe binary search</b> + count ≤ mid, O(n log(max-min))", keys: ["binary search", "binary", "count", "mid"] }
      ],
      answer: `<p>Har row ek sorted list hai. Heap mein <code>{value, row, col}</code> daalo, pehle har row ka column 0. k-1 baar poll karo, aur har poll ke baad usi row ka agla column daalo (agar hai). Ab heap ka top k-th smallest hai.</p>
        <p>Time O(k log n), space O(n). Follow-up: <b>binary search on answer</b>: low = matrix[0][0], high = matrix[n-1][n-1]. Har mid ke liye count karo kitne elements ≤ mid hain (bottom-left se staircase walk, O(n)). Total O(n log(range)), space O(1).</p>`
    },
    {
      type: "exercise",
      id: "ex-kth-matrix",
      title: "Kth Smallest Element in a Sorted Matrix",
      level: "Medium",
      task: `<p>Given an <code>n × n</code> matrix where every row and every column is sorted in ascending order, return the k-th smallest element in the whole matrix (duplicates count separately).</p><p class="small muted">Example 1, sorted: 1 5 9 10 11 12 13 13 15</p><pre class="diagram"> 1   5   9
10  11  13
12  13  15</pre><h4>Constraints</h4><ul><li>1 ≤ n ≤ 300</li><li>1 ≤ k ≤ n²</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" target="_blank">LeetCode 378</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8
Output: 13</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  matrix = [[-5]], k = 1
Output: -5</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int kthSmallest(int[][] matrix, int k) {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,5,9],[10,11,13],[12,13,15]], k=8", 13, () -> s.kthSmallest(new int[][]{{1, 5, 9}, {10, 11, 13}, {12, 13, 15}}, 8));
        Check.eq("[[-5]], k=1", -5, () -> s.kthSmallest(new int[][]{{-5}}, 1));
        Check.hiddenFromHere();
        Check.eq("duplicates: [[1,2],[1,3]], k=2", 1, () -> s.kthSmallest(new int[][]{{1, 2}, {1, 3}}, 2));
        Check.eq("[[1,2],[1,3]], k=3", 2, () -> s.kthSmallest(new int[][]{{1, 2}, {1, 3}}, 3));
        Check.eq("k = n*n (sabse bada)", 15, () -> s.kthSmallest(new int[][]{{1, 5, 9}, {10, 11, 13}, {12, 13, 15}}, 9));
        Check.eq("negatives", -3, () -> s.kthSmallest(new int[][]{{-10, -3}, {-4, 0}}, 3));
        int n = 300;
        int[][] big = new int[n][n];
        int[] all = new int[n * n];
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { big[i][j] = i + 2 * j; all[i * n + j] = i + 2 * j; }
        Arrays.sort(all);
        int k = 45000;
        int expected = all[k - 1];
        Check.eq("bada input: 300x300, k=45000", expected, () -> s.kthSmallest(big, k));
    }
}`,
      hints: [
        "Har row ek sorted list hai. Heap mein <code>new int[]{matrix[r][0], r, 0}</code> daalo har row ke liye.",
        "k-1 baar poll karo; har poll ke baad agar <code>c + 1 &lt; n</code> to <code>{matrix[r][c+1], r, c+1}</code> daalo.",
        "Ab <code>heap.peek()[0]</code> answer hai."
      ],
      solution: `import java.util.*;

class Solution {
    int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        for (int r = 0; r < n; r++) heap.offer(new int[]{matrix[r][0], r, 0});
        for (int i = 0; i < k - 1; i++) {
            int[] top = heap.poll();
            int r = top[1], c = top[2];
            if (c + 1 < n) heap.offer(new int[]{matrix[r][c + 1], r, c + 1});
        }
        return heap.peek()[0];
    }
}`,
      explain: "<p><b>Approach:</b> n sorted rows ka k-way merge, par sirf k-1 elements nikaalne hain, poora merge nahi.</p><p><b>Time:</b> O(n + k log n). <b>Space:</b> O(n). Binary search on value wala approach O(n log(max - min)) time aur O(1) space deta hai, ye achha follow-up answer hai.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Heap mein objects daalte waqt bolo ki \"node ke saath uski position bhi rakh raha hoon taaki agla element mil sake\". Aur end case batao: khaali lists, null heads, aur k = 0/1. Interviewer aksar null list wale case pe hi code todta hai."
    }
  ],
  references: [
    { title: "Merge k Sorted Lists", by: "LeetCode", url: "https://leetcode.com/problems/merge-k-sorted-lists/", type: "article" },
    { title: "Kth Smallest Element in a Sorted Matrix", by: "LeetCode", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", type: "article" },
    { title: "Hello Interview: coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" },
    { title: "NeetCode roadmap", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
