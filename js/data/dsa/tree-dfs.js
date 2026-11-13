// Tree DFS
registerLesson("dsa", "tree-dfs", {
  why: "Tree ke zyaadatar interview questions (height, diameter, LCA, path sum, balanced check) ek hi sawaal hain: \"har node apne bachchon se kya maangega aur upar kya bhejega?\" Ye sochna aa gaya to tree problems recursion se 10 line mein ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>DFS: ek raaste pe neeche tak</h2>
        <p>DFS (Depth First Search) ek branch pe leaf tak jaata hai, phir wapas aa ke agli branch. Recursion se natural lagta hai, kyunki tree khud recursive hai: har node ke neeche ek chhota tree hai.</p>
        <pre class="diagram">
        1
       / \\
      2   3
     / \\
    4   5

Preorder  (node, L, R): 1 2 4 5 3   → copy/serialize
Inorder   (L, node, R): 4 2 5 1 3   → BST mein sorted order
Postorder (L, R, node): 4 5 2 3 1   → pehle bachche, phir parent (height, delete)
</pre>
        <h2>Do tarah ki DFS sochna</h2>
        <table>
          <tr><th>Style</th><th>Kaise</th><th>Example</th></tr>
          <tr><td><b>Top-down</b> (parameter neeche bhejo)</td><td>Parent apni info (sum ab tak, depth, path) bachche ko argument mein deta hai</td><td>Path Sum, max depth with counter</td></tr>
          <tr><td><b>Bottom-up</b> (return value upar bhejo)</td><td>Bachche apna answer return karte hain, parent unko jod ke apna banata hai</td><td>Height, Diameter, LCA, balanced check</td></tr>
        </table>
        <h2>Signals</h2>
        <ul>
          <li>"Path" (root se leaf, ya kisi bhi do nodes ke beech)</li>
          <li>Subtree ki property: height, sum, balanced, same tree</li>
          <li>Do nodes ka relation (LCA, distance)</li>
        </ul>
        <p><b>Recipe:</b> (1) base case: <code>null</code> pe kya return? (2) left aur right se kya chahiye? (3) unse apna answer kaise banau? (4) global answer update karna hai kya?</p>`
    },
    {
      type: "code",
      title: "Template: traversals + bottom-up height",
      code: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

public class Main {
    static void preorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        out.add(n.val);
        preorder(n.left, out);
        preorder(n.right, out);
    }

    static void inorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out);
        out.add(n.val);
        inorder(n.right, out);
    }

    // Bottom-up: bachche apni height batate hain, parent 1 + max leta hai
    static int height(TreeNode n) {
        if (n == null) return 0;
        return 1 + Math.max(height(n.left), height(n.right));
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>();
        preorder(root, pre);
        inorder(root, in);
        System.out.println("preorder: " + pre);
        System.out.println("inorder:  " + in);
        System.out.println("height:   " + height(root));
    }
}`,
      note: "Recursion ka space = tree ki height. Balanced tree mein O(log n), par ek line jaisa (skewed) tree ho to O(n), aur ~10⁴+ depth pe <code>StackOverflowError</code> aa sakta hai. Interview mein ye bolna achha point hai."
    },
    {
      type: "steps",
      title: "Diameter dry run: har node left height + right height check karta hai",
      steps: [
        { title: "Leaves 4 aur 5: height 1, path 0", html: `<pre class="diagram">        1
       / \\
      2   3
     / \\
   [4] [5]

h(4) = 1, through(4) = 0 + 0 = 0
h(5) = 1, through(5) = 0
best = 0</pre>` },
        { title: "Node 2: left 1, right 1", html: `<pre class="diagram">        1
       / \\
     [2]  3
     / \\
    4   5

through(2) = h(4) + h(5) = 1 + 1 = 2   (4-2-5)
h(2) = 1 + max(1, 1) = 2
best = 2</pre>` },
        { title: "Node 3: leaf", html: `<pre class="diagram">        1
       / \\
      2  [3]
     / \\
    4   5

h(3) = 1, through(3) = 0
best = 2</pre>` },
        { title: "Root 1: left 2, right 1", html: `<pre class="diagram">       [1]
       / \\
      2   3
     / \\
    4   5

through(1) = h(2) + h(3) = 2 + 1 = 3   (4-2-1-3)
best = 3  ← answer (edges count)</pre><p>Har node ek baar: O(n). Node apni <b>height upar return</b> karta hai, aur <b>diameter global variable</b> mein update hota hai. Ye pattern bahut problems mein aata hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-diameter",
      q: "<b>Diameter of Binary Tree:</b> kisi bhi do nodes ke beech ka sabse lamba path (edges mein) chahiye. Path root se guzarna zaroori nahi. Brute force kya hoga aur O(n) kaise?",
      rubric: [
        { point: "Har node pe <b>left height + right height</b> = us node se guzarne wala longest path", keys: ["left height", "height(left)", "left + right", "l + r", "left+right", "dono height"], weight: 2 },
        { point: "Function <b>height return kare</b>, aur diameter <b>global/max variable</b> mein update", keys: ["global", "max", "best", "field", "array", "update"], weight: 2 },
        { point: "Brute: har node pe height alag se nikaalna O(n²)", keys: ["o(n²)", "o(n^2)", "n square", "brute", "baar baar height"] },
        { point: "O(n) time, O(h) space", keys: ["o(n)", "o(h)", "height space", "linear"] }
      ],
      answer: `<p><b>Brute:</b> har node ke liye <code>height(left) + height(right)</code> alag se nikaalo: O(n) per node, total O(n²) (skewed tree pe).</p>
        <p><b>O(n):</b> ek hi DFS jo height return kare. Har node pe <code>L = dfs(left), R = dfs(right)</code>, <code>best = max(best, L + R)</code>, aur return <code>1 + max(L, R)</code>. Time O(n), space O(h) recursion.</p>`
    },
    {
      type: "exercise",
      id: "ex-diameter",
      title: "Diameter of Binary Tree",
      level: "Easy",
      task: `<p>Return the <b>diameter</b> of a binary tree: the number of <b>edges</b> on the longest path between any two nodes. The path does not have to pass through the root.</p><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 1: longest path 4 → 2 → 1 → 3 has 3 edges</p><pre class="diagram">      1
     / \\
    2   3
   / \\
  4   5</pre><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ 10⁵ (deep trees in the tests: watch recursion depth)</li></ul><p><a href="https://leetcode.com/problems/diameter-of-binary-tree/" target="_blank">LeetCode 543</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [1,2,3,4,5]
Output: 3</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [1,2]
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    int diameterOfBinaryTree(TreeNode root) {
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

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4,5]", 3, () -> s.diameterOfBinaryTree(build(new Integer[]{1, 2, 3, 4, 5})));
        Check.eq("[1,2]", 1, () -> s.diameterOfBinaryTree(build(new Integer[]{1, 2})));
        Check.hiddenFromHere();
        Check.eq("single node", 0, () -> s.diameterOfBinaryTree(build(new Integer[]{1})));
        Check.eq("root se nahi guzarta: [1,2,null,3,4,5,null,null,6]", 4, () -> s.diameterOfBinaryTree(build(new Integer[]{1, 2, null, 3, 4, 5, null, null, 6})));
        Check.eq("[1,2,3,4,5,null,null,6,null,null,7]", 4, () -> s.diameterOfBinaryTree(build(new Integer[]{1, 2, 3, 4, 5, null, null, 6, null, null, 7})));
        Integer[] chain = new Integer[1 + 2 * 999];
        chain[0] = 0;
        for (int i = 1; i <= 999; i++) { chain[2 * i - 1] = i; chain[2 * i] = null; }
        TreeNode chainTree = build(chain);
        Check.eq("skewed chain, 1000 nodes", 999, () -> s.diameterOfBinaryTree(chainTree));
        Integer[] full = new Integer[65535];
        Arrays.fill(full, 1);
        TreeNode fullTree = build(full);
        Check.eq("bada: complete tree, 65535 nodes (16 levels)", 30, () -> s.diameterOfBinaryTree(fullTree));
    }
}`,
      hints: [
        "Ek helper <code>int height(TreeNode n)</code> likho jo null pe 0 de.",
        "Helper ke andar: <code>int L = height(n.left), R = height(n.right); best = Math.max(best, L + R);</code>",
        "<code>best</code> ko class field rakho, aur helper <code>1 + Math.max(L, R)</code> return kare."
      ],
      solution: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    private int best;

    int diameterOfBinaryTree(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }

    private int height(TreeNode n) {
        if (n == null) return 0;
        int L = height(n.left), R = height(n.right);
        best = Math.max(best, L + R);
        return 1 + Math.max(L, R);
    }
}`,
      explain: "<p><b>Approach:</b> bottom-up DFS. Har node height return karta hai; L + R us node se guzarne wala longest path hai, uska max global mein.</p><p><b>Time:</b> O(n). <b>Space:</b> O(h). Dhyaan: <code>best</code> har call pe reset karo, warna same object pe doosra test galat aayega.</p>"
    },
    {
      type: "think",
      id: "think-lca",
      q: "<b>Lowest Common Ancestor:</b> binary tree (BST nahi) mein do nodes p aur q diye hain. Sabse neeche wala node chahiye jiske subtree mein dono hon (node khud apna ancestor gina jaata hai). Recursion kya return karega?",
      rubric: [
        { point: "Base: node null ho ya <b>p/q ke barabar</b> ho to wahi return", keys: ["== p", "== q", "null", "base", "khud return", "p ya q"], weight: 2 },
        { point: "Left aur right dono <b>non-null</b> → current node LCA hai", keys: ["dono non-null", "both non-null", "both not null", "dono mile", "left != null && right != null", "split"], weight: 2 },
        { point: "Warna jo non-null hai wahi upar bhejo", keys: ["jo non-null", "whichever", "left : right", "left ya right", "upar bhejo", "return left"] },
        { point: "O(n) time, O(h) space", keys: ["o(n)", "o(h)", "linear"] }
      ],
      answer: `<p>DFS function ka matlab: "is subtree mein p ya q mila to kya mila?" Base: <code>node == null || node == p || node == q</code> → <code>return node</code>.</p>
        <p>Phir <code>L = lca(left), R = lca(right)</code>. Dono non-null → p ek side, q doosri side, to current node hi LCA. Sirf ek non-null → wahi upar bhejo (LCA ya mila hua node). Agar p, q ka ancestor hai to p pe hi ruk jaate hain, jo sahi answer hai. O(n) time, O(h) space.</p>`
    },
    {
      type: "exercise",
      id: "ex-lca",
      title: "Lowest Common Ancestor of a Binary Tree",
      level: "Medium",
      task: `<p>Given a binary tree and two of its nodes <code>p</code> and <code>q</code> (both exist, all values unique), return their <b>lowest common ancestor</b>: the deepest node that has both p and q in its subtree. A node counts as a descendant of itself.</p><p>The harness finds p and q by value and checks the <code>val</code> of the node you return.</p><p class="small muted">Example tree</p><pre class="diagram">          3
        /   \\
       5     1
      / \\   / \\
     6   2 0   8
        / \\
       7   4</pre><h4>Constraints</h4><ul><li>2 ≤ number of nodes ≤ 10⁵</li><li>p ≠ q, both are in the tree</li></ul><p><a href="https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" target="_blank">LeetCode 236</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
Output: 3</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  same tree, p = 5, q = 4
Output: 5
Explanation: 5 is an ancestor of 4, and a node is its own descendant.</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  root = [1,2], p = 1, q = 2
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        return null;
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

    static TreeNode find(TreeNode root, int v) {
        Deque<TreeNode> st = new ArrayDeque<>();
        if (root != null) st.push(root);
        while (!st.isEmpty()) {
            TreeNode n = st.pop();
            if (n.val == v) return n;
            if (n.left != null) st.push(n.left);
            if (n.right != null) st.push(n.right);
        }
        return null;
    }

    static Object lca(Solution s, Integer[] arr, int p, int q) {
        TreeNode root = build(arr);
        TreeNode r = s.lowestCommonAncestor(root, find(root, p), find(root, q));
        return r == null ? null : r.val;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Integer[] t = {3, 5, 1, 6, 2, 0, 8, null, null, 7, 4};
        Check.eq("p=5, q=1", 3, () -> lca(s, t, 5, 1));
        Check.eq("p=5, q=4 (p khud ancestor)", 5, () -> lca(s, t, 5, 4));
        Check.eq("[1,2], p=1, q=2", 1, () -> lca(s, new Integer[]{1, 2}, 1, 2));
        Check.hiddenFromHere();
        Check.eq("p=7, q=8", 3, () -> lca(s, t, 7, 8));
        Check.eq("p=6, q=4", 5, () -> lca(s, t, 6, 4));
        Check.eq("p=7, q=4", 2, () -> lca(s, t, 7, 4));
        Check.eq("p = q", 0, () -> lca(s, t, 0, 0));
        int n = 65535;
        Integer[] full = new Integer[n];
        for (int i = 0; i < n; i++) full[i] = i + 1;
        Check.eq("bada: 65535 nodes, p=40000, q=40001", 20000, () -> lca(s, full, 40000, 40001));
        Check.eq("bada: 65535 nodes, p=32768, q=65535", 1, () -> lca(s, full, 32768, 65535));
    }
}`,
      hints: [
        "Base case: <code>if (root == null || root == p || root == q) return root;</code>",
        "Left aur right subtree pe recursion: <code>L</code> aur <code>R</code>.",
        "<code>if (L != null &amp;&amp; R != null) return root; return L != null ? L : R;</code>"
      ],
      solution: `class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode L = lowestCommonAncestor(root.left, p, q);
        TreeNode R = lowestCommonAncestor(root.right, p, q);
        if (L != null && R != null) return root;
        return L != null ? L : R;
    }
}`,
      explain: "<p><b>Approach:</b> bottom-up. Har subtree batata hai ki usme p/q mila ya nahi. Jahan pehli baar dono sides se kuch milta hai, wahi LCA.</p><p><b>Time:</b> O(n). <b>Space:</b> O(h). BST ho to values compare karke O(h) mein: dono chhote → left, dono bade → right, warna current.</p>"
    },
    {
      type: "think",
      id: "think-path-sum",
      q: "<b>Path Sum II:</b> root se leaf tak ke saare paths chahiye jinka sum target ke barabar ho. Top-down DFS kaise likhoge? Path list ko copy kab karna hai?",
      rubric: [
        { point: "Top-down: <b>remaining sum</b> ya current sum neeche bhejo", keys: ["remaining", "target - ", "sum -", "current sum", "bacha", "parameter"], weight: 2 },
        { point: "Ek <b>path list</b> mein add karo, wapas aate waqt <b>remove</b> (backtrack)", keys: ["remove", "backtrack", "hatao", "pop", "un-choose", "undo"], weight: 2 },
        { point: "Sirf <b>leaf</b> pe check (dono bachche null)", keys: ["leaf", "left == null && right == null", "dono null", "patta"] },
        { point: "Answer mein <b>copy</b> daalo: <code>new ArrayList&lt;&gt;(path)</code>", keys: ["copy", "new arraylist", "naya list", "clone"], weight: 2 },
        { point: "Negative values ho sakte hain, isliye beech mein prune mat karo", keys: ["negative", "prune nahi", "early stop nahi"] }
      ],
      answer: `<p>DFS(node, remaining, path): <code>path.add(node.val)</code>, <code>remaining -= node.val</code>. Agar leaf hai aur remaining == 0 → <code>result.add(new ArrayList&lt;&gt;(path))</code> (copy! warna baad mein path badalne se answer bhi badlega). Phir left, right pe recurse. Aakhir mein <code>path.remove(path.size() - 1)</code>.</p>
        <p>Values negative ho sakti hain, to "sum target se bada ho gaya, ruk jao" wala prune galat hai. Time O(n · h) worst (har leaf pe path copy), space O(h).</p>`
    },
    {
      type: "exercise",
      id: "ex-path-sum-2",
      title: "Path Sum II",
      level: "Medium",
      task: `<p>Given a binary tree and <code>targetSum</code>, return every <b>root-to-leaf</b> path (as a list of node values) whose values add up to <code>targetSum</code>. A leaf is a node with no children. Paths may be returned in any order.</p><p>In the tests, trees are written in level order; <code>null</code> means a missing child.</p><p class="small muted">Example 1: 5+4+11+2 = 22 and 5+8+4+5 = 22</p><pre class="diagram">          5
         / \\
        4   8
       /   / \\
      11  13  4
     /  \\    / \\
    7    2  5   1</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 5000</li><li>Values may be negative</li></ul><p><a href="https://leetcode.com/problems/path-sum-ii/" target="_blank">LeetCode 113</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
Output: [[5,4,11,2],[5,8,4,5]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  root = [1,2,3], targetSum = 5
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> pathSum(TreeNode root, int targetSum) {
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
        Check.eqAnyOrder("[5,4,8,11,null,13,4,7,2,null,null,5,1], 22", List.of(List.of(5, 4, 11, 2), List.of(5, 8, 4, 5)),
            () -> s.pathSum(build(new Integer[]{5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1}), 22));
        Check.eqAnyOrder("[1,2,3], 5", List.of(), () -> s.pathSum(build(new Integer[]{1, 2, 3}), 5));
        Check.hiddenFromHere();
        Check.eqAnyOrder("[] , 0", List.of(), () -> s.pathSum(build(new Integer[]{}), 0));
        Check.eqAnyOrder("[1,2], 1 (1 leaf nahi hai)", List.of(), () -> s.pathSum(build(new Integer[]{1, 2}), 1));
        Check.eqAnyOrder("single [1], 1", List.of(List.of(1)), () -> s.pathSum(build(new Integer[]{1}), 1));
        Check.eqAnyOrder("negatives [-2,null,-3], -5", List.of(List.of(-2, -3)), () -> s.pathSum(build(new Integer[]{-2, null, -3}), -5));
        Check.eqAnyOrder("[1,-2,-3,1,3,-2,null,-1], -1", List.of(List.of(1, -2, 1, -1)), () -> s.pathSum(build(new Integer[]{1, -2, -3, 1, 3, -2, null, -1}), -1));
        Integer[] ones = new Integer[4095];
        Arrays.fill(ones, 1);
        List<List<Integer>> expected = new ArrayList<>();
        for (int i = 0; i < 2048; i++) expected.add(Collections.nCopies(12, 1));
        TreeNode onesTree = build(ones);
        Check.eqAnyOrder("bada: 4095 nodes sab 1, target 12 (2048 paths)", expected, () -> s.pathSum(onesTree, 12));
    }
}`,
      hints: [
        "Helper <code>dfs(node, remaining, path, result)</code>. Null pe return.",
        "<code>path.add(node.val)</code>; agar leaf aur <code>remaining == node.val</code> to <code>result.add(new ArrayList&lt;&gt;(path))</code>.",
        "Left, right pe <code>remaining - node.val</code> ke saath recurse, phir <code>path.remove(path.size() - 1)</code>."
      ],
      solution: `import java.util.*;

class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

class Solution {
    List<List<Integer>> pathSum(TreeNode root, int targetSum) {
        List<List<Integer>> result = new ArrayList<>();
        dfs(root, targetSum, new ArrayList<>(), result);
        return result;
    }

    private void dfs(TreeNode node, int remaining, List<Integer> path, List<List<Integer>> result) {
        if (node == null) return;
        path.add(node.val);
        if (node.left == null && node.right == null && remaining == node.val) {
            result.add(new ArrayList<>(path));
        } else {
            dfs(node.left, remaining - node.val, path, result);
            dfs(node.right, remaining - node.val, path, result);
        }
        path.remove(path.size() - 1);
    }
}`,
      explain: "<p><b>Approach:</b> top-down DFS + backtracking. Remaining sum neeche jaata hai; leaf pe match ho to path ki copy.</p><p><b>Time:</b> O(n · h) worst case (har leaf pe O(h) copy). <b>Space:</b> O(h) recursion + path, output alag.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Tree DFS likhne se pehle bolo: \"Ye function null pe X return karega, aur har node pe left/right ka answer le ke Y return karega.\" Ye ek line ka <b>contract</b> interviewer ko dikhata hai ki aapko recursion ka trust hai, aur bugs (jaise global variable reset na karna) kam hote hain."
    }
  ],
  references: [
    { title: "Diameter of Binary Tree", by: "LeetCode", url: "https://leetcode.com/problems/diameter-of-binary-tree/", type: "article" },
    { title: "Lowest Common Ancestor of a Binary Tree", by: "LeetCode", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", type: "article" },
    { title: "Path Sum II", by: "LeetCode", url: "https://leetcode.com/problems/path-sum-ii/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Trees series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "Hello Interview: coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" }
  ]
});
