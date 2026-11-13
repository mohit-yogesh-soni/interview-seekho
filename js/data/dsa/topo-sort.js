// Topological Sort
registerLesson("dsa", "topo-sort", {
  why: "Jab kaam ek doosre pe depend karte hain (course prerequisites, build dependencies, Maven/npm packages, microservice startup order), to sahi order topological sort deta hai. Aur cycle hai ya nahi, wo bhi isi se pata chalta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>College mein: DSA se pehle Java, System Design se pehle DSA aur DBMS. Kis order mein courses lo? Ye ek <b>directed graph</b> hai: edge <code>A → B</code> = "A pehle, phir B".</p>
        <pre class="diagram">
  Java ──► DSA ──► SystemDesign
                     ▲
  DBMS ──────────────┘

Valid orders: Java, DBMS, DSA, SystemDesign
              DBMS, Java, DSA, SystemDesign   (ek se zyada ho sakte hain)
</pre>
        <p><b>Topological order</b> = nodes ki aisi list jisme har edge <code>u → v</code> ke liye u, v se pehle aaye. Ye sirf <b>DAG</b> (Directed Acyclic Graph) mein possible hai. Cycle ho (A needs B, B needs A) to koi order nahi.</p>
        <h2>Kahn's algorithm (BFS)</h2>
        <ol>
          <li>Har node ka <b>indegree</b> nikaalo (kitne edges us pe aa rahe hain = kitni dependencies baaki).</li>
          <li>Indegree 0 wale (koi dependency nahi) queue mein daalo.</li>
          <li>Queue se node nikaalo, order mein likho, aur uske har neighbor ka indegree 1 kam karo. Jo 0 ho jaaye, queue mein.</li>
          <li>End mein order ki length &lt; n → <b>cycle hai</b> (cycle wale nodes ka indegree kabhi 0 nahi hota).</li>
        </ol>
        <h2>Signals</h2>
        <ul>
          <li>"prerequisites", "dependencies", "X must come before Y", "build order"</li>
          <li>"Kya saare tasks finish ho sakte hain?" → cycle detection in directed graph</li>
          <li>Kisi custom order ko words/rules se nikaalna (Alien Dictionary)</li>
        </ul>
        <p>DFS se bhi topo sort hota hai (post-order ka reverse, aur 3 colours se cycle detect), par Kahn's interview mein samjhana aasan hai.</p>`
    },
    {
      type: "code",
      title: "Template: Kahn's algorithm (indegree + queue)",
      code: `import java.util.*;

public class Main {
    // edges[i] = {u, v} matlab u -> v (u pehle)
    static List<Integer> topoSort(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); indeg[e[1]]++; }

        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);

        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
        }
        return order.size() == n ? order : null;    // null = cycle
    }

    public static void main(String[] args) {
        String[] names = {"Java", "DBMS", "DSA", "SystemDesign"};
        int[][] edges = {{0, 2}, {2, 3}, {1, 3}};
        List<Integer> order = topoSort(4, edges);
        for (int i : order) System.out.print(names[i] + " ");
        System.out.println();
        System.out.println("cycle wala graph: " + topoSort(2, new int[][]{{0, 1}, {1, 0}}));
    }
}`
    },
    {
      type: "steps",
      title: "Kahn's dry run: 0→2, 2→3, 1→3 (indegree table)",
      steps: [
        { title: "Indegree nikaalo", html: `<table><tr><th>node</th><th>0</th><th>1</th><th>2</th><th>3</th></tr><tr><td>indegree</td><td class="ok">0</td><td class="ok">0</td><td>1</td><td>2</td></tr></table><p>queue = [0, 1], order = []</p>` },
        { title: "Poll 0 → 2 ka indegree 1 → 0", html: `<table><tr><th>node</th><th>0</th><th>1</th><th>2</th><th>3</th></tr><tr><td>indegree</td><td>✓</td><td>0</td><td><b>0</b></td><td>2</td></tr></table><p>queue = [1, 2], order = [0]</p>` },
        { title: "Poll 1 → 3 ka indegree 2 → 1", html: `<table><tr><th>node</th><th>0</th><th>1</th><th>2</th><th>3</th></tr><tr><td>indegree</td><td>✓</td><td>✓</td><td>0</td><td><b>1</b></td></tr></table><p>queue = [2], order = [0, 1]</p>` },
        { title: "Poll 2 → 3 ka indegree 1 → 0", html: `<table><tr><th>node</th><th>0</th><th>1</th><th>2</th><th>3</th></tr><tr><td>indegree</td><td>✓</td><td>✓</td><td>✓</td><td><b>0</b></td></tr></table><p>queue = [3], order = [0, 1, 2]</p>` },
        { title: "Poll 3 → done", html: `<table><tr><th>node</th><th>0</th><th>1</th><th>2</th><th>3</th></tr><tr><td>indegree</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr></table><p>order = [0, 1, 2, 3], length 4 = n → <b>koi cycle nahi</b>. Har node aur edge ek baar: O(V + E).</p>` }
      ]
    },
    {
      type: "quiz",
      q: "Kahn's algorithm khatam hua aur <code>order.size() = 5</code>, jabki <code>n = 8</code>. Iska matlab?",
      options: [
        "Graph disconnected hai",
        "Graph mein cycle hai; 3 nodes cycle mein hain ya cycle pe depend karte hain",
        "Algorithm mein bug hai, hamesha n aana chahiye",
        "5 nodes ka indegree 0 tha"
      ],
      answer: 1,
      why: "Disconnected DAG mein bhi saare nodes order mein aate hain (har component ke indegree-0 node se shuru). Jo nodes bache, unka indegree kabhi 0 nahi hua: wo cycle mein hain ya kisi cycle wale node ke baad aate hain."
    },
    {
      type: "think",
      id: "think-course-1",
      q: "<b>Course Schedule:</b> <code>numCourses</code> courses (0 se n-1) aur pairs <code>[a, b]</code> = \"a lene se pehle b chahiye\". Kya saare courses complete ho sakte hain? Graph ka edge kis direction mein banaoge aur answer kab false?",
      rubric: [
        { point: "Edge <b>b → a</b> (prerequisite pehle)", keys: ["b -> a", "b → a", "b->a", "prerequisite pehle", "b se a"], weight: 2 },
        { point: "Kahn's: <b>indegree</b> + queue", keys: ["indegree", "in-degree", "kahn", "queue", "bfs"], weight: 2 },
        { point: "Processed count &lt; n → <b>cycle</b> → false", keys: ["cycle", "count < n", "count", "processed", "size < n"], weight: 2 },
        { point: "O(V + E)", keys: ["o(v + e)", "o(v+e)", "v + e", "n + p"] },
        { point: "Alternative: DFS with 3 states (white/gray/black)", keys: ["dfs", "3 state", "gray", "color", "recursion stack", "visiting"] }
      ],
      answer: `<p>Pair [a, b] ka matlab b pehle, isliye edge <code>b → a</code> aur <code>indeg[a]++</code>. Kahn's chalao aur count karo kitne courses queue se nikle. Count == n → true, warna cycle → false.</p>
        <p>Time O(V + E), space O(V + E). DFS alternative: node states 0 = unvisited, 1 = abhi recursion mein, 2 = done; state 1 wale node pe dobara pahunche to cycle.</p>`
    },
    {
      type: "exercise",
      id: "ex-course-schedule",
      title: "Course Schedule",
      level: "Medium",
      task: `<p>There are <code>numCourses</code> courses labelled 0 to n − 1. <code>prerequisites[i] = [a, b]</code> means you must finish course <code>b</code> before course <code>a</code>. Return <code>true</code> if it is possible to finish all courses (that is, the prerequisite graph has no cycle).</p><p class="small muted">Example 2: a cycle</p><pre class="diagram">0 → 1
↑   │
└───┘   (1 needs 0, 0 needs 1)</pre><h4>Constraints</h4><ul><li>1 ≤ numCourses ≤ 10⁵</li><li>0 ≤ prerequisites.length ≤ 10⁵</li><li>All pairs are distinct</li></ul><p><a href="https://leetcode.com/problems/course-schedule/" target="_blank">LeetCode 207</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  numCourses = 2, prerequisites = [[1,0]]
Output: true
Explanation: Take 0, then 1.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: false</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    boolean canFinish(int numCourses, int[][] prerequisites) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("2, [[1,0]]", true, () -> s.canFinish(2, new int[][]{{1, 0}}));
        Check.eq("2, [[1,0],[0,1]]", false, () -> s.canFinish(2, new int[][]{{1, 0}, {0, 1}}));
        Check.hiddenFromHere();
        Check.eq("1 course, koi prereq nahi", true, () -> s.canFinish(1, new int[0][]));
        Check.eq("3-cycle", false, () -> s.canFinish(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));
        Check.eq("self loop [[0,0]]", false, () -> s.canFinish(1, new int[][]{{0, 0}}));
        Check.eq("disconnected DAG", true, () -> s.canFinish(4, new int[][]{{1, 0}, {3, 2}}));
        Check.eq("diamond", true, () -> s.canFinish(4, new int[][]{{1, 0}, {2, 0}, {3, 1}, {3, 2}}));
        int n = 100000;
        int[][] chain = new int[n - 1][];
        for (int i = 0; i < n - 1; i++) chain[i] = new int[]{i + 1, i};
        Check.eq("bada: 100000 ki chain", true, () -> s.canFinish(n, chain));
        int[][] loop = new int[n][];
        for (int i = 0; i < n - 1; i++) loop[i] = new int[]{i + 1, i};
        loop[n - 1] = new int[]{0, n - 1};
        Check.eq("bada: chain + back edge (cycle)", false, () -> s.canFinish(n, loop));
    }
}`,
      hints: [
        "Adjacency list + indegree array. [a, b] → <code>adj[b].add(a); indeg[a]++;</code>",
        "Indegree 0 wale queue mein. Poll karo, <code>done++</code>, neighbors ka indegree ghatao.",
        "<code>return done == numCourses;</code> (Recursive DFS 100000 ki chain pe stack overflow de sakta hai, BFS safe hai.)"
      ],
      solution: `import java.util.*;

class Solution {
    boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
        int done = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            done++;
            for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
        }
        return done == numCourses;
    }
}`,
      explain: "<p><b>Approach:</b> Kahn's algorithm. Jitne courses indegree 0 tak pahunche, wo complete ho sakte hain. Sab nahi pahunche → cycle.</p><p><b>Time:</b> O(V + E). <b>Space:</b> O(V + E).</p>"
    },
    {
      type: "think",
      id: "think-course-2",
      q: "<b>Course Schedule II:</b> ab sirf true/false nahi, ek valid order chahiye (cycle ho to khaali array). Upar wale code mein kya badlega? Agar kai valid orders hon to?",
      rubric: [
        { point: "Poll karte waqt node ko <b>order array</b> mein likho", keys: ["order", "array", "list", "result", "likho", "add"], weight: 2 },
        { point: "Order length &lt; n → <b>khaali array</b>", keys: ["empty", "khaali", "new int[0]", "length < n", "cycle"], weight: 2 },
        { point: "Koi bhi valid order chalega (answer unique nahi)", keys: ["koi bhi", "any", "multiple", "unique nahi", "kai"] },
        { point: "O(V + E)", keys: ["o(v + e)", "o(v+e)", "v + e"] }
      ],
      answer: `<p>Same Kahn's; bas <code>done++</code> ki jagah <code>order[idx++] = u</code>. End mein <code>idx == n</code> ho to order return, warna <code>new int[0]</code>.</p>
        <p>Queue mein ek saath kai indegree-0 nodes ho sakte hain, isliye answer unique nahi. Isi wajah se tests ek fixed array compare nahi karte, balki check karte hain ki har prerequisite apne course se pehle aaya. O(V + E).</p>`
    },
    {
      type: "exercise",
      id: "ex-course-schedule-2",
      title: "Course Schedule II",
      level: "Medium",
      task: `<p>Same setup: <code>[a, b]</code> means b must come before a. Return <b>any one</b> valid order in which to take all courses, or an empty array if it is impossible (there is a cycle).</p><p>The harness validates your order: every course exactly once, and every prerequisite before its course.</p><p class="small muted">Example 2</p><pre class="diagram">    ┌→ 1 ─┐
0 ──┤     ├→ 3
    └→ 2 ─┘
valid: [0,1,2,3] or [0,2,1,3]</pre><h4>Constraints</h4><ul><li>1 ≤ numCourses ≤ 10⁵</li><li>0 ≤ prerequisites.length ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/course-schedule-ii/" target="_blank">LeetCode 210</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  numCourses = 2, prerequisites = [[1,0]]
Output: [0,1]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0,1,2,3] or [0,2,1,3]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] findOrder(int numCourses, int[][] prerequisites) {
        return new int[0];
    }
}`,
      harness: `import seekho.Check;

public class Main {
    // possible = true: order permutation ho aur har [a, b] mein b pehle aaye. false: khaali array.
    static boolean valid(int n, int[][] pre, int[] order, boolean possible) {
        if (order == null) return false;
        if (!possible) return order.length == 0;
        if (order.length != n) return false;
        int[] pos = new int[n];
        java.util.Arrays.fill(pos, -1);
        for (int i = 0; i < n; i++) {
            int c = order[i];
            if (c < 0 || c >= n || pos[c] != -1) return false;
            pos[c] = i;
        }
        for (int[] p : pre) if (pos[p[1]] >= pos[p[0]]) return false;
        return true;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        int[][] a = {{1, 0}};
        Check.eq("2, [[1,0]] → valid order?", true, () -> valid(2, a, s.findOrder(2, a), true));
        int[][] b = {{1, 0}, {2, 0}, {3, 1}, {3, 2}};
        Check.eq("4, diamond → valid order?", true, () -> valid(4, b, s.findOrder(4, b), true));
        int[][] c = {{1, 0}, {0, 1}};
        Check.eq("2, cycle → khaali array?", true, () -> valid(2, c, s.findOrder(2, c), false));
        Check.hiddenFromHere();
        int[][] none = new int[0][];
        Check.eq("1 course", true, () -> valid(1, none, s.findOrder(1, none), true));
        Check.eq("3 courses, koi prereq nahi", true, () -> valid(3, none, s.findOrder(3, none), true));
        int[][] self = {{0, 0}};
        Check.eq("self loop", true, () -> valid(1, self, s.findOrder(1, self), false));
        int[][] partCycle = {{1, 0}, {2, 1}, {1, 2}, {3, 0}};
        Check.eq("cycle ek hisse mein", true, () -> valid(4, partCycle, s.findOrder(4, partCycle), false));
        int n = 100000;
        int[][] big = new int[2 * (n - 1)][];
        int k = 0;
        for (int i = 1; i < n; i++) {
            big[k++] = new int[]{i, i - 1};
            big[k++] = new int[]{i, (int) ((i * 7919L + 13) % i)};   // koi random chhota course
        }
        Check.eq("bada: 100000 courses, 2 lakh edges", true, () -> valid(n, big, s.findOrder(n, big), true));
    }
}`,
      hints: [
        "Course Schedule wala code lo, bas poll kiye nodes ko <code>int[] order</code> mein likho.",
        "Edge b → a, indegree a ka badhta hai.",
        "End: <code>return idx == numCourses ? order : new int[0];</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
        int[] order = new int[numCourses];
        int idx = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[idx++] = u;
            for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
        }
        return idx == numCourses ? order : new int[0];
    }
}`,
      explain: "<p><b>Approach:</b> Kahn's algorithm; queue se nikalne ka order hi topological order hai.</p><p><b>Time:</b> O(V + E). <b>Space:</b> O(V + E). Multiple valid answers hote hain, isliye validator property check karta hai.</p>"
    },
    {
      type: "think",
      id: "think-alien",
      q: "<b>Bonus: Alien Dictionary.</b> Ek alien language ke words diye hain jo unki alphabet ke hisaab se <b>sorted</b> hain. Letters ka order nikaalna hai. Graph kaise banaoge? Kaunse edge cases invalid input bante hain?",
      rubric: [
        { point: "Har <b>adjacent word pair</b> compare karo, pehla alag letter = edge (u → v)", keys: ["adjacent", "pair", "pehla alag", "first different", "consecutive", "do words"], weight: 2 },
        { point: "Phir <b>topological sort</b> (Kahn's) letters pe", keys: ["topological", "topo", "kahn", "indegree"], weight: 2 },
        { point: "Invalid: lamba word apne <b>prefix</b> se pehle aaye (\"abc\" phir \"ab\")", keys: ["prefix", "abc", "lamba", "longer"], weight: 2 },
        { point: "Invalid: <b>cycle</b> → koi order nahi", keys: ["cycle", "invalid", "empty string"] },
        { point: "Saare letters ko node banao (jo kisi edge mein nahi, wo bhi)", keys: ["saare letters", "all letters", "har letter", "every char"] }
      ],
      answer: `<p>Sorted words ke har consecutive pair (w1, w2) mein pehla position dhoondho jahan letters alag hain: <code>w1[j] → w2[j]</code> ek edge. Sirf pehla farak matter karta hai, uske baad ke letters kuch nahi batate.</p>
        <p>Saare unique letters nodes hain. Kahn's chalao; result mein saare letters na aayein to cycle → invalid ("" return). Ek aur invalid case: w2, w1 ka proper prefix ho aur w1 pehle aaye ("abc" phir "ab"), kyunki chhota prefix hamesha pehle aana chahiye.</p>
        <p>Time O(total characters + 26²) approx, space O(26²) edges tak. Ye problem LeetCode pe premium hai (<i>Alien Dictionary</i>, #269), isliye yahan exercise nahi di.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Edge ki direction pehle bol do (\"[a, b] ka matlab b → a\"). Topo sort mein sabse common bug ulti direction hai. Aur batao ki multiple valid orders ho sakte hain; agar interviewer lexicographically smallest order maange to queue ki jagah <code>PriorityQueue</code> lagao."
    }
  ],
  references: [
    { title: "Course Schedule", by: "LeetCode", url: "https://leetcode.com/problems/course-schedule/", type: "article" },
    { title: "Course Schedule II", by: "LeetCode", url: "https://leetcode.com/problems/course-schedule-ii/", type: "article" },
    { title: "Alien Dictionary", by: "LeetCode", url: "https://leetcode.com/problems/alien-dictionary/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Graph series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (Advanced Graphs)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
