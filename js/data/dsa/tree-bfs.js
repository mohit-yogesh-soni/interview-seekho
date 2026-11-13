// Tree BFS (level order)
registerLesson("dsa", "tree-bfs", {
  why: "Jab bhi tree mein \"level\", \"depth\", \"har row\", \"right side se dikhne wale\" jaise words aayein, BFS (queue) ka ek hi template kaam karta hai. Ye template yaad ho to 10+ LeetCode problems seedhe ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Binary tree: 1 minute recap</h2>
        <p>Har node mein value aur do pointers: <code>left</code> aur <code>right</code>. Upar wala <b>root</b>, bina bachchon wale <b>leaf</b>.</p>
        <pre class="diagram">
level 0:          3
                 / \\
level 1:        9   20
                   /  \\
level 2:         15    7
</pre>
        <p>Is lesson mein tree <b>level-order array</b> se banta hai: <code>[3, 9, 20, null, null, 15, 7]</code>. Upar se neeche, left se right; <code>null</code> = wahan node nahi hai. LeetCode bhi yahi format use karta hai.</p>
        <h2>BFS = level by level</h2>
        <p>DFS ek raaste pe neeche tak jaata hai. BFS pehle poora level 0, phir poora level 1... Iske liye <b>queue</b> (FIFO) chahiye: jo pehle aaya wo pehle nikle.</p>
        <h2>Signals</h2>
        <ul>
          <li>"Level order", "har level ka sum/average/max", "zigzag"</li>
          <li>"Right/left side view" (har level ka last/first node)</li>
          <li>"Minimum depth", "nearest leaf" (BFS pehli baar jo leaf mile wahi sabse paas)</li>
          <li>Tree ko level wise jodna (next pointers)</li>
        </ul>
        <h2>Template ka main trick: level size</h2>
        <p>Loop ke shuru mein <code>int size = queue.size()</code> le lo. Ye current level ke nodes ki ginti hai. Bas utne nodes nikaalo, unke bachche queue mein daalo. Ab queue mein exactly agla level hai.</p>`
    },
    {
      type: "code",
      title: "Template: level order traversal (queue + level size)",
      code: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

public class Main {
    static List<List<Integer>> levels(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();                 // is level mein kitne nodes
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            out.add(level);
        }
        return out;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        System.out.println(levels(root));   // [[3], [9, 20], [15, 7]]
    }
}`,
      note: "<code>ArrayDeque</code> null allow nahi karta, isliye bachche daalne se pehle null check zaroori hai. <code>LinkedList</code> bhi queue ki tarah chal jaata hai, par ArrayDeque fast hai."
    },
    {
      type: "steps",
      title: "Queue dry run: [3, 9, 20, null, null, 15, 7]",
      steps: [
        { title: "Shuru: queue = [3]", html: `<pre class="diagram">       [3]
       / \\
      9   20
         /  \\
        15   7

queue  = [3]
output = []</pre>` },
        { title: "Level 0: size = 1. 3 nikaalo, 9 aur 20 daalo", html: `<pre class="diagram">        3  ✓
       / \\
     [9] [20]
         /  \\
        15   7

queue  = [9, 20]
output = [[3]]</pre>` },
        { title: "Level 1: size = 2. 9 nikaalo (koi bachcha nahi), 20 nikaalo (15, 7 daalo)", html: `<pre class="diagram">        3  ✓
       / \\
      9✓  20✓
         /  \\
       [15] [7]

queue  = [15, 7]
output = [[3], [9, 20]]</pre>` },
        { title: "Level 2: size = 2. 15 aur 7 nikaalo", html: `<pre class="diagram">        3  ✓
       / \\
      9✓  20✓
         /  \\
       15✓   7✓

queue  = []
output = [[3], [9, 20], [15, 7]]</pre><p>Queue khaali, kaam khatam. Har node ek baar queue mein gaya: O(n) time. Queue mein max ek level (≈ n/2 nodes complete tree mein): O(n) space.</p>` }
      ]
    },
    {
      type: "quiz",
      q: "Agar loop mein <code>int size = q.size()</code> ki jagah seedha <code>for (int i = 0; i &lt; q.size(); i++)</code> likh diya, to kya hoga?",
      options: [
        "Kuch farak nahi padega",
        "Loop ke andar bachche daalne se q.size() badhta rahega, to levels mix ho jaayenge",
        "Compile error",
        "Sirf root print hoga"
      ],
      answer: 1,
      why: "<code>q.size()</code> har iteration pe dobara padha jaata hai. Bachche daalte hi size badhta hai aur agle level ke nodes bhi isi level mein aa jaate hain. Size pehle variable mein snapshot karo."
    },
    {
      type: "think",
      id: "think-level-order",
      q: "<b>Level Order Traversal:</b> binary tree ke values level by level list of lists mein return karne hain. Approach, data structure aur complexity batao. Khaali tree pe kya?",
      rubric: [
        { point: "<b>Queue</b> (BFS) use karo", keys: ["queue", "bfs", "deque", "arraydeque"], weight: 2 },
        { point: "Har level ke shuru mein <b>size</b> snapshot lo", keys: ["size", "level size", "count", "ginti"], weight: 2 },
        { point: "Null/khaali tree pe khaali list", keys: ["null", "empty", "khaali"] },
        { point: "Time O(n), space O(n) (widest level)", keys: ["o(n)", "linear", "width"] }
      ],
      answer: `<p>Root ko queue mein daalo. Jab tak queue khaali nahi: <code>size = q.size()</code>, utne nodes poll karo, unki values ek list mein, aur unke non-null bachche queue mein. Level list ko output mein jodo.</p>
        <p>Root null ho to khaali list. Time O(n) (har node ek baar), space O(n) (sabse chauda level, complete tree mein ~n/2).</p>`
    },
    {
      type: "exercise",
      id: "ex-level-order",
      title: "Binary Tree Level Order Traversal",
      level: "Medium",
      task: `<p>Given the root of a binary tree, return the values level by level: each level as a list from left to right, and the levels from top to bottom.</p><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 1</p><pre class="diagram">    3
   / \\
  9   20
     /  \\
    15   7</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/binary-tree-level-order-traversal/" target="_blank">LeetCode 102</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [1]
Output: [[1]]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  root = []
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> levelOrder(TreeNode root) {
        return new ArrayList<>();
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

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,9,20,null,null,15,7]", List.of(List.of(3), List.of(9, 20), List.of(15, 7)), () -> s.levelOrder(build(new Integer[]{3, 9, 20, null, null, 15, 7})));
        Check.eq("[1]", List.of(List.of(1)), () -> s.levelOrder(build(new Integer[]{1})));
        Check.eq("[] (khaali tree)", List.of(), () -> s.levelOrder(build(new Integer[]{})));
        Check.hiddenFromHere();
        Check.eq("left skewed [1,2,null,3]", List.of(List.of(1), List.of(2), List.of(3)), () -> s.levelOrder(build(new Integer[]{1, 2, null, 3})));
        Check.eq("negatives [-1,-2,-3,null,-4]", List.of(List.of(-1), List.of(-2, -3), List.of(-4)), () -> s.levelOrder(build(new Integer[]{-1, -2, -3, null, -4})));
        Check.eq("gaps [1,2,3,null,4,5]", List.of(List.of(1), List.of(2, 3), List.of(4, 5)), () -> s.levelOrder(build(new Integer[]{1, 2, 3, null, 4, 5})));
        int n = 65535;
        Integer[] full = new Integer[n];
        for (int i = 0; i < n; i++) full[i] = i + 1;
        List<List<Integer>> expected = new ArrayList<>();
        for (int start = 1; start <= n; start *= 2) {
            List<Integer> lv = new ArrayList<>();
            for (int v = start; v < 2 * start && v <= n; v++) lv.add(v);
            expected.add(lv);
        }
        TreeNode bigTree = build(full);
        Check.eq("bada: complete tree, 65535 nodes, 16 levels", expected, () -> s.levelOrder(bigTree));
    }
}`,
      hints: [
        "Root null ho to khaali list return karo. Warna <code>Deque&lt;TreeNode&gt; q = new ArrayDeque&lt;&gt;()</code> mein root daalo.",
        "Har level: <code>int size = q.size();</code> phir utni baar poll karo.",
        "Poll kiye node ki value level list mein; <code>left</code>/<code>right</code> null na ho to queue mein."
      ],
      solution: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            out.add(level);
        }
        return out;
    }
}`,
      explain: "<p><b>Approach:</b> BFS with queue, level size snapshot se levels alag.</p><p><b>Time:</b> O(n). <b>Space:</b> O(n) queue + output.</p>"
    },
    {
      type: "think",
      id: "think-right-view",
      q: "<b>Right Side View:</b> tree ke right side khade ho ke dekho, har level pe jo node sabse right dikhe uski value upar se neeche chahiye. BFS se kaise? Kya sirf right child follow karna kaafi hai?",
      rubric: [
        { point: "Har level ka <b>last node</b> (i == size - 1)", keys: ["last", "aakhri", "size - 1", "size-1", "rightmost"], weight: 2 },
        { point: "Sirf right child follow karna <b>galat</b>: left subtree gehra ho to wo bhi dikhta hai", keys: ["left", "galat", "wrong", "deep", "gehra", "nahi kaafi"], weight: 2 },
        { point: "BFS template same, O(n) time", keys: ["bfs", "queue", "o(n)", "level order"] },
        { point: "Alternative: DFS right-first, depth == list size pe add", keys: ["dfs", "depth", "right first", "pehle right"] }
      ],
      answer: `<p>Level order wala template, bas har level mein sirf <b>last</b> node (<code>i == size - 1</code>) ki value output mein daalo.</p>
        <p>Sirf right pointers follow karna galat hai: tree <code>[1, 2, 3, 4]</code> mein level 2 pe sirf 4 hai jo left side (2 ka bachcha) hai, phir bhi right se dikhta hai. Time O(n), space O(width). DFS alternative: pehle right, phir left jao; jab <code>depth == result.size()</code> ho to node add karo.</p>`
    },
    {
      type: "exercise",
      id: "ex-right-view",
      title: "Binary Tree Right Side View",
      level: "Medium",
      task: `<p>Imagine standing on the right side of the tree. Return the values you can see from top to bottom: the rightmost node of each level.</p><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 1: you see 1, 3, 4</p><pre class="diagram">    1      ←
   / \\
  2   3    ←
   \\   \\
    5   4  ←</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/binary-tree-right-side-view/" target="_blank">LeetCode 199</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [1,2,3,null,5,null,4]
Output: [1,3,4]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [1,null,3]
Output: [1,3]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  root = []
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<Integer> rightSideView(TreeNode root) {
        return new ArrayList<>();
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

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,null,5,null,4]", List.of(1, 3, 4), () -> s.rightSideView(build(new Integer[]{1, 2, 3, null, 5, null, 4})));
        Check.eq("[1,null,3]", List.of(1, 3), () -> s.rightSideView(build(new Integer[]{1, null, 3})));
        Check.eq("[]", List.of(), () -> s.rightSideView(build(new Integer[]{})));
        Check.hiddenFromHere();
        Check.eq("left side gehra: [1,2,3,4]", List.of(1, 3, 4), () -> s.rightSideView(build(new Integer[]{1, 2, 3, 4})));
        Check.eq("sirf left child: [1,2]", List.of(1, 2), () -> s.rightSideView(build(new Integer[]{1, 2})));
        Check.eq("single [7]", List.of(7), () -> s.rightSideView(build(new Integer[]{7})));
        Check.eq("[1,2,3,null,5,null,null,6]", List.of(1, 3, 5, 6), () -> s.rightSideView(build(new Integer[]{1, 2, 3, null, 5, null, null, 6})));
        int n = 65535;
        Integer[] full = new Integer[n];
        for (int i = 0; i < n; i++) full[i] = i + 1;
        List<Integer> expected = new ArrayList<>();
        for (int v = 1; v <= n; v = 2 * v + 1) expected.add(v);
        TreeNode bigTree = build(full);
        Check.eq("bada: complete tree, 65535 nodes", expected, () -> s.rightSideView(bigTree));
    }
}`,
      hints: [
        "Level order template likho.",
        "Inner loop mein <code>if (i == size - 1) out.add(node.val);</code>",
        "Sirf right pointer follow mat karo; left subtree gehra ho sakta hai."
      ],
      solution: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                if (i == size - 1) out.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
        }
        return out;
    }
}`,
      explain: "<p><b>Approach:</b> BFS, har level ka last node.</p><p><b>Time:</b> O(n). <b>Space:</b> O(width). DFS (right pehle) bhi O(n) time, O(height) space.</p>"
    },
    {
      type: "think",
      id: "think-zigzag",
      q: "<b>Zigzag Level Order:</b> level 0 left→right, level 1 right→left, level 2 phir left→right... Queue ka order badle bina kaise karoge?",
      rubric: [
        { point: "Normal BFS, ek <b>flag / level index</b> rakho", keys: ["flag", "boolean", "lefttoright", "odd", "even", "level index", "toggle"], weight: 2 },
        { point: "Odd level ki list <b>reverse</b> karo ya <b>addFirst</b> se bharo", keys: ["reverse", "addfirst", "add(0", "ulta", "deque", "linkedlist"], weight: 2 },
        { point: "Queue mein bachche hamesha left phir right", keys: ["left phir right", "left then right", "same order", "queue same"] },
        { point: "O(n) time", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Queue ko mat chhedo, normal BFS chalao. Har level ki values ek <code>LinkedList</code>/<code>Deque</code> mein daalo: left-to-right level pe <code>addLast</code>, right-to-left pe <code>addFirst</code>. Har level ke baad flag ulta karo.</p>
        <p>Ya simple: list bharo aur odd level pe <code>Collections.reverse</code>. Dono O(n) time, O(n) space.</p>`
    },
    {
      type: "exercise",
      id: "ex-zigzag",
      title: "Binary Tree Zigzag Level Order Traversal",
      level: "Medium",
      task: `<p>Return the level order values, but alternate the direction on each level: level 0 left to right, level 1 right to left, level 2 left to right, and so on.</p><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 1</p><pre class="diagram">    3          → [3]
   / \\
  9   20       ← [20,9]
     /  \\
    15   7     → [15,7]</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" target="_blank">LeetCode 103</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [3,9,20,null,null,15,7]
Output: [[3],[20,9],[15,7]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [1]
Output: [[1]]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  root = []
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        return new ArrayList<>();
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

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,9,20,null,null,15,7]", List.of(List.of(3), List.of(20, 9), List.of(15, 7)), () -> s.zigzagLevelOrder(build(new Integer[]{3, 9, 20, null, null, 15, 7})));
        Check.eq("[1]", List.of(List.of(1)), () -> s.zigzagLevelOrder(build(new Integer[]{1})));
        Check.eq("[]", List.of(), () -> s.zigzagLevelOrder(build(new Integer[]{})));
        Check.hiddenFromHere();
        Check.eq("[1,2,3,4,5,6,7]", List.of(List.of(1), List.of(3, 2), List.of(4, 5, 6, 7)), () -> s.zigzagLevelOrder(build(new Integer[]{1, 2, 3, 4, 5, 6, 7})));
        Check.eq("[1,2,3,4,null,null,5]", List.of(List.of(1), List.of(3, 2), List.of(4, 5)), () -> s.zigzagLevelOrder(build(new Integer[]{1, 2, 3, 4, null, null, 5})));
        Check.eq("4 levels [1,2,3,4,5,6,7,8,9]", List.of(List.of(1), List.of(3, 2), List.of(4, 5, 6, 7), List.of(9, 8)), () -> s.zigzagLevelOrder(build(new Integer[]{1, 2, 3, 4, 5, 6, 7, 8, 9})));
        int n = 32767;
        Integer[] full = new Integer[n];
        for (int i = 0; i < n; i++) full[i] = i + 1;
        List<List<Integer>> expected = new ArrayList<>();
        int lvl = 0;
        for (int start = 1; start <= n; start *= 2, lvl++) {
            List<Integer> lv = new ArrayList<>();
            for (int v = start; v < 2 * start; v++) lv.add(v);
            if (lvl % 2 == 1) Collections.reverse(lv);
            expected.add(lv);
        }
        TreeNode bigTree = build(full);
        Check.eq("bada: complete tree, 32767 nodes", expected, () -> s.zigzagLevelOrder(bigTree));
    }
}`,
      hints: [
        "Level order template + ek <code>boolean leftToRight = true</code>.",
        "Har level ki values <code>LinkedList&lt;Integer&gt;</code> mein: flag true ho to <code>addLast</code>, false ho to <code>addFirst</code>.",
        "Level khatam hone pe <code>leftToRight = !leftToRight;</code>"
      ],
      solution: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        boolean leftToRight = true;
        while (!q.isEmpty()) {
            int size = q.size();
            LinkedList<Integer> level = new LinkedList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                if (leftToRight) level.addLast(node.val);
                else level.addFirst(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            out.add(level);
            leftToRight = !leftToRight;
        }
        return out;
    }
}`,
      explain: "<p><b>Approach:</b> normal BFS; sirf output list bharne ki direction badli (addFirst / addLast).</p><p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> BFS vs DFS pucha jaaye to bolo: BFS ka space = tree ki <b>width</b> (complete tree mein ~n/2), DFS ka space = <b>height</b> (balanced mein log n, skewed mein n). \"Minimum depth\" jaisa sawaal ho to BFS jaldi ruk jaata hai kyunki pehli leaf hi answer hai."
    }
  ],
  references: [
    { title: "Binary Tree Level Order Traversal", by: "LeetCode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", type: "article" },
    { title: "Binary Tree Right Side View", by: "LeetCode", url: "https://leetcode.com/problems/binary-tree-right-side-view/", type: "article" },
    { title: "Binary Tree Zigzag Level Order Traversal", by: "LeetCode", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Trees series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (Trees)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
