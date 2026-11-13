// Binary Search Tree
registerLesson("dsa", "bst", {
  why: "BST ke questions mein ek hi property baar baar kaam aati hai: inorder traversal sorted hota hai, aur har node apne poore left subtree se bada aur right subtree se chhota hai. Validate BST mein log sirf parent se compare karke galti karte hain, jo interviewer khas taur pe dekhta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>BST property</h2>
        <p>Binary Search Tree mein har node ke liye: <b>left subtree ke saare</b> values &lt; node &lt; <b>right subtree ke saare</b> values. Sirf direct bachche nahi, poora subtree.</p>
        <pre class="diagram">
          8
        /   \\
       3     10
      / \\      \\
     1   6      14
        / \\    /
       4   7  13

Inorder (L, node, R): 1 3 4 6 7 8 10 13 14   ← sorted!
</pre>
        <h2>Kyun useful hai</h2>
        <table>
          <tr><th>Operation</th><th>Balanced BST</th><th>Skewed BST (line)</th></tr>
          <tr><td>Search / insert / delete</td><td>O(log n)</td><td>O(n)</td></tr>
          <tr><td>Sorted order mein padhna</td><td>O(n) inorder</td><td>O(n)</td></tr>
          <tr><td>Min / max</td><td>O(log n) (sabse left / right)</td><td>O(n)</td></tr>
        </table>
        <p>Java ka <code>TreeMap</code> / <code>TreeSet</code> andar se <b>Red-Black tree</b> (self-balancing BST) hai, isliye unke operations O(log n) guaranteed hain. Real example: BookMyShow mein seats ko price ke hisaab se rakhna aur "₹500 se sasti sabse mehngi seat" (<code>floorKey</code>) nikaalna.</p>
        <h2>Signals</h2>
        <ul>
          <li>Problem mein "BST" likha hai → inorder sorted wali property socho</li>
          <li>"Kth smallest/largest", "closest value", "range sum" → inorder ya search path</li>
          <li>"Valid hai kya" → har node ke liye allowed <b>range (low, high)</b></li>
        </ul>`
    },
    {
      type: "code",
      title: "Template: BST search, insert aur inorder",
      code: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

public class Main {
    static TreeNode insert(TreeNode root, int v) {
        if (root == null) return new TreeNode(v);
        if (v < root.val) root.left = insert(root.left, v);
        else root.right = insert(root.right, v);
        return root;
    }

    static boolean search(TreeNode root, int v) {
        while (root != null) {                // O(height), har step pe aadha tree chhod do
            if (v == root.val) return true;
            root = v < root.val ? root.left : root.right;
        }
        return false;
    }

    static void inorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out);
        out.add(n.val);
        inorder(n.right, out);
    }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int v : new int[]{8, 3, 10, 1, 6, 14, 4, 7, 13}) root = insert(root, v);
        List<Integer> sorted = new ArrayList<>();
        inorder(root, sorted);
        System.out.println("inorder: " + sorted);
        System.out.println("search 6: " + search(root, 6) + ", search 5: " + search(root, 5));

        TreeMap<Integer, String> seats = new TreeMap<>(Map.of(200, "A1", 350, "B4", 500, "C2", 800, "D7"));
        System.out.println("500 ya kam mein sabse mehngi: " + seats.floorKey(500) + " -> " + seats.floorEntry(500).getValue());
        System.out.println("400 se upar sabse sasti: " + seats.higherKey(400));
    }
}`
    },
    {
      type: "steps",
      title: "Validate BST dry run: har node ko (low, high) range milti hai",
      steps: [
        { title: "Root 5: range (-∞, +∞)", html: `<pre class="diagram">        [5]          range (-∞, +∞) ✓
       /   \\
      4     6
           / \\
          3   7</pre>` },
        { title: "Left 4: range (-∞, 5)", html: `<pre class="diagram">         5
       /   \\
     [4]    6        4 in (-∞, 5) ✓
           / \\
          3   7</pre>` },
        { title: "Right 6: range (5, +∞)", html: `<pre class="diagram">         5
       /   \\
      4    [6]       6 in (5, +∞) ✓
           / \\
          3   7</pre>` },
        { title: "6 ka left 3: range (5, 6) → FAIL", html: `<pre class="diagram">         5
       /   \\
      4     6
           / \\
         [3]  7      3 in (5, 6)? ✗</pre><p>3 apne parent 6 se chhota hai (local check pass), par root 5 ke right subtree mein hai, isliye 5 se bada hona chahiye tha. <b>Sirf parent se compare karna galat hai.</b> Range neeche bhejni padti hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-validate",
      q: "<b>Validate BST:</b> tree valid BST hai ya nahi (strict: duplicates allowed nahi)? Do approaches batao. Values <code>Integer.MIN_VALUE</code>/<code>MAX_VALUE</code> bhi ho sakti hain, to bounds kaise rakhoge?",
      rubric: [
        { point: "Har node ko <b>(low, high) range</b> pass karo; left ko (low, node), right ko (node, high)", keys: ["range", "low", "high", "min max", "bounds", "lower", "upper"], weight: 2 },
        { point: "Ya: <b>inorder</b> strictly increasing hona chahiye (prev se compare)", keys: ["inorder", "in-order", "sorted", "prev", "increasing"], weight: 2 },
        { point: "Bounds ke liye <b>long ya null</b> use karo (int MIN/MAX edge case)", keys: ["long", "null", "integer object", "long.min", "overflow"] },
        { point: "Sirf parent se compare karna galat (counter-example)", keys: ["parent", "sirf bachche", "local", "galat", "counter"] },
        { point: "O(n) time, O(h) space", keys: ["o(n)", "o(h)"] }
      ],
      answer: `<p><b>Range method:</b> <code>valid(node, low, high)</code>: null → true; <code>node.val &lt;= low || node.val &gt;= high</code> → false; phir <code>valid(left, low, node.val) &amp;&amp; valid(right, node.val, high)</code>. Shuru mein <code>Long.MIN_VALUE, Long.MAX_VALUE</code>, taaki node ki value khud <code>Integer.MAX_VALUE</code> ho tab bhi sahi chale.</p>
        <p><b>Inorder method:</b> inorder chalao aur har value pichhli se strictly badi honi chahiye. Dono O(n) time, O(h) space. Sirf parent-child compare karna galat hai (upar wala dry run).</p>`
    },
    {
      type: "exercise",
      id: "ex-validate-bst",
      title: "Validate Binary Search Tree",
      level: "Medium",
      task: `<p>Given the root of a binary tree, return <code>true</code> if it is a valid binary search tree (BST):</p><ul><li>every value in a node's left subtree is <b>strictly less</b> than the node's value,</li><li>every value in its right subtree is <b>strictly greater</b>,</li><li>and both subtrees are BSTs too.</li></ul><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 2: 3 is in the right subtree of 5 but is smaller than 5</p><pre class="diagram">        5
      /   \\
     1     4
          / \\
         3   6</pre><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ 10⁵</li><li>-2³¹ ≤ Node.val ≤ 2³¹ − 1 (watch out for overflow at the limits)</li></ul><p><a href="https://leetcode.com/problems/validate-binary-search-tree/" target="_blank">LeetCode 98</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [2,1,3]
Output: true</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [5,1,4,null,null,3,6]
Output: false
Explanation: 4 is the right child of 5 but 4 &lt; 5 (and so is 3).</pre></div>`,
      userFile: "Solution.java",
      starter: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    boolean isValidBST(TreeNode root) {
        return false;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static TreeNode build(Integer[] a) {
        if (a.length == 0 || a[0] == null) return null;
        TreeNode root = new TreeNode(a[0]);
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < a.length) {
            TreeNode n = q.poll();
            if (i < a.length && a[i] != null) { n.left = new TreeNode(a[i]); q.offer(n.left); }
            i++;
            if (i < a.length && a[i] != null) { n.right = new TreeNode(a[i]); q.offer(n.right); }
            i++;
        }
        return root;
    }

    static TreeNode balanced(int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        TreeNode n = new TreeNode(mid);
        n.left = balanced(lo, mid - 1);
        n.right = balanced(mid + 1, hi);
        return n;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,1,3]", true, () -> s.isValidBST(build(new Integer[]{2, 1, 3})));
        Check.eq("[5,1,4,null,null,3,6]", false, () -> s.isValidBST(build(new Integer[]{5, 1, 4, null, null, 3, 6})));
        Check.hiddenFromHere();
        Check.eq("single [1]", true, () -> s.isValidBST(build(new Integer[]{1})));
        Check.eq("duplicates [2,2,2]", false, () -> s.isValidBST(build(new Integer[]{2, 2, 2})));
        Check.eq("grandparent trap [5,4,6,null,null,3,7]", false, () -> s.isValidBST(build(new Integer[]{5, 4, 6, null, null, 3, 7})));
        Check.eq("Integer.MAX_VALUE [2147483647]", true, () -> s.isValidBST(build(new Integer[]{2147483647})));
        Check.eq("[-2147483648,null,2147483647]", true, () -> s.isValidBST(build(new Integer[]{-2147483648, null, 2147483647})));
        TreeNode good = balanced(1, 65535);
        Check.eq("bada: balanced BST 1..65535", true, () -> s.isValidBST(good));
        TreeNode bad = balanced(1, 65535);
        TreeNode t = bad.left;
        while (t.right != null) t = t.right;
        t.val = 40000;   // left subtree ka sabse right node, root (32768) se bada
        Check.eq("bada: deep galti (left subtree mein 40000)", false, () -> s.isValidBST(bad));
    }
}`,
      hints: [
        "Helper <code>boolean valid(TreeNode n, long low, long high)</code>.",
        "<code>if (n.val &lt;= low || n.val &gt;= high) return false;</code>",
        "<code>return valid(n.left, low, n.val) &amp;&amp; valid(n.right, n.val, high);</code> Shuru: <code>Long.MIN_VALUE, Long.MAX_VALUE</code>."
      ],
      solution: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean valid(TreeNode n, long low, long high) {
        if (n == null) return true;
        if (n.val <= low || n.val >= high) return false;
        return valid(n.left, low, n.val) && valid(n.right, n.val, high);
    }
}`,
      explain: "<p><b>Approach:</b> har node ko allowed open range milti hai. Left jaate waqt upper bound node.val, right jaate waqt lower bound node.val.</p><p><b>Time:</b> O(n). <b>Space:</b> O(h). <code>long</code> bounds se int ke extreme values ka edge case bhi sahi chalta hai.</p>"
    },
    {
      type: "think",
      id: "think-kth-bst",
      q: "<b>Kth Smallest in BST:</b> BST mein k-th sabse chhoti value chahiye. Poora inorder list banaye bina kaise? Agar tree baar baar badalta ho (insert/delete) aur kth baar baar puchha jaaye to?",
      rubric: [
        { point: "<b>Inorder</b> traversal sorted order deta hai", keys: ["inorder", "in-order", "sorted"], weight: 2 },
        { point: "<b>Counter</b> rakho, k-th visit pe ruk jao (early stop)", keys: ["counter", "count", "k-th", "ruk", "stop", "k--", "early"], weight: 2 },
        { point: "Iterative stack wala inorder bhi chalta hai", keys: ["stack", "iterative"] },
        { point: "O(h + k) time", keys: ["h + k", "h+k", "o(h", "o(k"] },
        { point: "Follow-up: har node mein <b>subtree size</b> store karo → O(h) per query", keys: ["subtree size", "size", "count store", "augment"] }
      ],
      answer: `<p>Inorder sorted hai. Iterative inorder (stack) chalao: left pe jaate raho, pop karo, counter badhao; counter == k → wahi answer. Poora tree visit karne ki zaroorat nahi: time O(h + k), space O(h).</p>
        <p>Follow-up: agar inserts/deletes aur kth queries baar baar hon to har node mein <b>left subtree ka size</b> rakho. Phir root se: k ≤ leftSize → left jao; k == leftSize + 1 → yahi; warna right mein <code>k - leftSize - 1</code>. Har query O(h).</p>`
    },
    {
      type: "exercise",
      id: "ex-kth-bst",
      title: "Kth Smallest Element in a BST",
      level: "Medium",
      task: `<p>Given the root of a BST and an integer <code>k</code> (1-indexed), return the k-th smallest value among all the nodes.</p><p class="small muted">Example 2 (in-order: 1 2 3 4 5 6)</p><pre class="diagram">            5
          /   \\
         3     6
        / \\
       2   4
      /
     1</pre><h4>Constraints</h4><ul><li>1 ≤ k ≤ number of nodes ≤ 10⁵</li><li>Values are distinct and fit in int</li></ul><p><a href="https://leetcode.com/problems/kth-smallest-element-in-a-bst/" target="_blank">LeetCode 230</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [3,1,4,null,2], k = 1
Output: 1</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [5,3,6,2,4,null,null,1], k = 3
Output: 3</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    int kthSmallest(TreeNode root, int k) {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static TreeNode build(Integer[] a) {
        if (a.length == 0 || a[0] == null) return null;
        TreeNode root = new TreeNode(a[0]);
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < a.length) {
            TreeNode n = q.poll();
            if (i < a.length && a[i] != null) { n.left = new TreeNode(a[i]); q.offer(n.left); }
            i++;
            if (i < a.length && a[i] != null) { n.right = new TreeNode(a[i]); q.offer(n.right); }
            i++;
        }
        return root;
    }

    static TreeNode balanced(int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        TreeNode n = new TreeNode(mid * 2);
        n.left = balanced(lo, mid - 1);
        n.right = balanced(mid + 1, hi);
        return n;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,1,4,null,2], k=1", 1, () -> s.kthSmallest(build(new Integer[]{3, 1, 4, null, 2}), 1));
        Check.eq("[5,3,6,2,4,null,null,1], k=3", 3, () -> s.kthSmallest(build(new Integer[]{5, 3, 6, 2, 4, null, null, 1}), 3));
        Check.hiddenFromHere();
        Check.eq("single [1], k=1", 1, () -> s.kthSmallest(build(new Integer[]{1}), 1));
        Check.eq("k = n (sabse bada)", 6, () -> s.kthSmallest(build(new Integer[]{5, 3, 6, 2, 4, null, null, 1}), 6));
        Check.eq("right skewed [1,null,2,null,3], k=2", 2, () -> s.kthSmallest(build(new Integer[]{1, null, 2, null, 3}), 2));
        Check.eq("negatives [0,-5,8,-9], k=2", -5, () -> s.kthSmallest(build(new Integer[]{0, -5, 8, -9}), 2));
        TreeNode big = balanced(1, 100000);
        Check.eq("bada: 100000 nodes (values 2,4,...), k=77777", 155554, () -> s.kthSmallest(big, 77777));
    }
}`,
      hints: [
        "Inorder sorted order deta hai. Counter rakho.",
        "Iterative: <code>Deque&lt;TreeNode&gt; st</code>; jab tak <code>cur != null</code> left jaate raho aur push karo.",
        "Pop karo, <code>if (--k == 0) return node.val;</code>, phir <code>cur = node.right</code>."
      ],
      solution: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            TreeNode node = st.pop();
            if (--k == 0) return node.val;
            cur = node.right;
        }
        return -1;
    }
}`,
      explain: "<p><b>Approach:</b> iterative inorder, k-th pop pe ruk jao.</p><p><b>Time:</b> O(h + k). <b>Space:</b> O(h). Baar baar queries ke liye subtree-size augmentation se O(h) per query.</p>"
    },
    {
      type: "think",
      id: "think-serialize",
      q: "<b>Bonus: Serialize / Deserialize Binary Tree.</b> Tree ko ek String mein badalna hai (network pe bhejne ke liye) aur wapas same tree banana hai. Kaunsa traversal, aur null ko kaise represent karoge? Sirf inorder kaafi kyun nahi?",
      rubric: [
        { point: "<b>Preorder</b> (ya level order) + <b>null marker</b> (jaise #)", keys: ["preorder", "pre-order", "level order", "bfs", "null marker", "#", "null"], weight: 2 },
        { point: "Deserialize: same order mein tokens padho, recursion/queue se", keys: ["queue", "iterator", "index", "token", "split", "recursion"], weight: 2 },
        { point: "Sirf inorder se tree unique nahi banta (shape kho jaati hai)", keys: ["unique", "shape", "inorder kaafi nahi", "ambiguous", "do tree"] },
        { point: "O(n) time aur space dono", keys: ["o(n)", "linear"] }
      ],
      answer: `<p><b>Preorder + null marker:</b> node → value likho, null → <code>#</code>. Example: tree 1(2, 3(4, 5)) → <code>1,2,#,#,3,4,#,#,5,#,#</code>. Null markers ki wajah se shape poori record hoti hai.</p>
        <p><b>Deserialize:</b> tokens ko queue mein daalo. <code>build()</code>: token nikaalo; <code>#</code> ho to null, warna node banao, phir <code>left = build()</code>, <code>right = build()</code>. Same preorder sequence wapas mil jaata hai.</p>
        <p>Sirf inorder (bina null markers) kaafi nahi: [1, 2] inorder "1 2" do alag trees ka ho sakta hai (2 root with left 1, ya 1 root with right 2). O(n) time, O(n) space. Neeche runnable code hai.</p>`
    },
    {
      type: "code",
      title: "Bonus: preorder + '#' se serialize/deserialize (round trip)",
      code: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

public class Main {
    static String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        write(root, sb);
        return sb.toString();
    }

    static void write(TreeNode n, StringBuilder sb) {
        if (sb.length() > 0) sb.append(',');
        if (n == null) { sb.append('#'); return; }
        sb.append(n.val);
        write(n.left, sb);
        write(n.right, sb);
    }

    static TreeNode deserialize(String data) {
        Deque<String> tokens = new ArrayDeque<>(Arrays.asList(data.split(",")));
        return read(tokens);
    }

    static TreeNode read(Deque<String> tokens) {
        String t = tokens.poll();
        if (t.equals("#")) return null;
        TreeNode n = new TreeNode(Integer.parseInt(t));
        n.left = read(tokens);
        n.right = read(tokens);
        return n;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.right.left = new TreeNode(4);
        root.right.right = new TreeNode(-5);

        String s = serialize(root);
        System.out.println("serialized:   " + s);
        TreeNode copy = deserialize(s);
        System.out.println("round trip:   " + serialize(copy));
        System.out.println("same string?  " + s.equals(serialize(copy)));
        System.out.println("empty tree:   " + serialize(null) + " -> " + deserialize("#"));
    }
}`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> BST problem mein pehle line bolo: \"BST hai, to inorder sorted hai, aur har node ka allowed range hai.\" Phir edge cases khud batao: duplicates allowed hain ya nahi, <code>Integer.MIN_VALUE</code> wali values, aur skewed tree jahan height = n ho jaati hai."
    }
  ],
  references: [
    { title: "Validate Binary Search Tree", by: "LeetCode", url: "https://leetcode.com/problems/validate-binary-search-tree/", type: "article" },
    { title: "Kth Smallest Element in a BST", by: "LeetCode", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", type: "article" },
    { title: "Serialize and Deserialize Binary Tree", by: "LeetCode", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", type: "article" },
    { title: "Java 17 API (java.util.TreeMap)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" },
    { title: "Striver A2Z DSA sheet (BST section)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
