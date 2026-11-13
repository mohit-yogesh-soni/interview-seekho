// Graph BFS/DFS aur Grid
registerLesson("dsa", "graph-bfs-dfs", {
  why: "Graph questions ka 70% hissa bas BFS ya DFS + visited hai: islands count karna, shortest steps (unweighted), spreading (rotting oranges, virus, fire). Grid ko graph ki tarah dekhna aa gaya to ye sab ek template se ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Graph = nodes + edges</h2>
        <p>Tree bhi graph hai, par graph mein <b>cycle</b> ho sakti hai aur root nahi hota. Isliye ek cheez extra chahiye: <b>visited</b>, taaki ek node do baar process na ho (warna infinite loop).</p>
        <pre class="diagram">
  0 ─── 1          Adjacency list (sabse common):
  │     │            0: [1, 2]
  2 ─── 3 ─── 4      1: [0, 3]
                     2: [0, 3]
                     3: [1, 2, 4]
                     4: [3]
</pre>
        <p>Adjacency list: <code>List&lt;List&lt;Integer&gt;&gt;</code>, space O(V + E). Matrix (<code>boolean[V][V]</code>) O(V²) leta hai, sirf dense graph ya chhote V pe theek.</p>
        <h2>Grid bhi graph hai</h2>
        <p>Har cell (r, c) ek node; uske 4 padosi (up, down, left, right) edges. Bas <code>int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}}</code> se padosi nikaalo aur boundary check karo.</p>
        <h2>BFS ya DFS?</h2>
        <table>
          <tr><th></th><th>BFS (queue)</th><th>DFS (recursion / stack)</th></tr>
          <tr><td>Order</td><td>Paas wale pehle, layer by layer</td><td>Ek raasta end tak</td></tr>
          <tr><td>Best for</td><td><b>Shortest path (unweighted)</b>, spreading in minutes/levels</td><td>Connected components, cycle, path exist karta hai?</td></tr>
          <tr><td>Space</td><td>O(width)</td><td>O(depth), recursion bahut gehri ho to stack overflow</td></tr>
        </table>
        <h2>Signals</h2>
        <ul>
          <li>Grid of 0/1, "islands", "regions", "connected"</li>
          <li>"Minimum steps / minutes" jab har move ka cost same ho → BFS</li>
          <li>Kai jagah se ek saath failna (rotting, fire, virus) → <b>multi-source BFS</b></li>
          <li>Graph copy/traverse karna (clone, social network friends)</li>
        </ul>`
    },
    {
      type: "code",
      title: "Template: adjacency list pe BFS + grid ke padosi",
      code: `import java.util.*;

public class Main {
    static List<Integer> bfs(List<List<Integer>> adj, int start) {
        boolean[] visited = new boolean[adj.size()];
        Deque<Integer> q = new ArrayDeque<>();
        List<Integer> order = new ArrayList<>();
        q.offer(start);
        visited[start] = true;                 // queue mein daalte hi mark karo
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                if (!visited[v]) { visited[v] = true; q.offer(v); }
            }
        }
        return order;
    }

    static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); } // undirected
        System.out.println("BFS from 0: " + bfs(adj, 0));

        int rows = 3, cols = 4, r = 0, c = 3;
        System.out.print("Cell (0,3) ke valid padosi:");
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) System.out.print(" (" + nr + "," + nc + ")");
        }
        System.out.println();
    }
}`,
      note: "<b>Visited ko queue mein daalte waqt mark karo</b>, nikaalte waqt nahi. Warna ek node kai baar queue mein ghus sakta hai (grid pe ye time limit exceed karwata hai)."
    },
    {
      type: "steps",
      title: "Number of Islands dry run (grid scan + DFS sink)",
      steps: [
        { title: "Grid", html: `<pre class="diagram">  1 1 0 0
  1 0 0 1
  0 0 1 1

islands = 0</pre><p>Row by row scan. Jahan '1' mile jo abhi visited nahi, wahan naya island shuru.</p>` },
        { title: "(0,0) pe '1' → islands = 1, DFS se poora island '0' kar do", html: `<pre class="diagram">  # # 0 0
  # 0 0 1
  0 0 1 1

islands = 1   (# = is DFS ne visit kiya)</pre><p>(0,0) → (0,1), (1,0). Aage koi '1' padosi nahi.</p>` },
        { title: "Scan aage: (1,3) pe naya '1' → islands = 2", html: `<pre class="diagram">  # # 0 0
  # 0 0 #
  0 0 # #

islands = 2</pre><p>(1,3) → (2,3) → (2,2). Teeno ek hi island.</p>` },
        { title: "Scan khatam", html: `<pre class="diagram">  # # 0 0
  # 0 0 #
  0 0 # #

answer = 2</pre><p>Har cell max ek baar DFS mein aata hai: O(rows × cols).</p>` }
      ]
    },
    {
      type: "think",
      id: "think-islands",
      q: "<b>Number of Islands:</b> '1' = land, '0' = water. Up/down/left/right se jude land cells ek island hain. Islands kitne hain? Approach, visited kaise rakhoge, aur complexity?",
      rubric: [
        { point: "Har cell scan karo, unvisited '1' pe <b>count++</b> aur DFS/BFS", keys: ["count++", "count", "scan", "har cell", "each cell", "naya island"], weight: 2 },
        { point: "DFS/BFS se poora island <b>visit/sink</b> karo (4 directions)", keys: ["dfs", "bfs", "sink", "flood", "4 direction", "padosi", "neighbors"], weight: 2 },
        { point: "Visited: grid mein '0' kar do ya alag boolean array", keys: ["visited", "'0'", "mark", "boolean"] },
        { point: "O(m × n) time", keys: ["o(m", "m*n", "m × n", "rows", "o(mn)"] },
        { point: "Bonus: Union-Find bhi chalta hai", keys: ["union", "dsu", "disjoint"] }
      ],
      answer: `<p>Grid ke har cell pe jao. Agar '1' hai: <code>count++</code> aur us cell se DFS/BFS chala ke poore jude hue land ko '0' (ya visited) kar do, taaki wo dobara gina na jaaye.</p>
        <p>Time O(m × n), har cell ek do baar. Space: DFS recursion worst case O(m × n) (poora grid land), BFS queue O(min(m, n)) approx. Bahut bade grid pe recursive DFS stack overflow de sakta hai, tab BFS ya explicit stack lo.</p>`
    },
    {
      type: "exercise",
      id: "ex-islands",
      title: "Number of Islands",
      level: "Medium",
      task: `<p>In a grid, <code>'1'</code> is land and <code>'0'</code> is water. Land cells connected <b>horizontally or vertically</b> form one island (diagonal does not count). Everything outside the grid is water. Return the number of islands.</p><p class="small muted">Example 2: three islands (A, B, C)</p><pre class="diagram">1 1 1 0 0        A A A . .
0 0 1 0 0        . . A . .
0 0 0 1 1   →    . . . B B
1 0 0 1 1        C . . B B</pre><h4>Constraints</h4><ul><li>1 ≤ rows, cols ≤ 300</li><li>grid[i][j] is '0' or '1'</li></ul><p><a href="https://leetcode.com/problems/number-of-islands/" target="_blank">LeetCode 200</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  grid = ["1100","1001","0011"]
Output: 2
Explanation: The top-left pair is one island; (1,3), (2,2), (2,3) form the other.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  grid = ["11100","00100","00011","10011"]
Output: 3</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int numIslands(char[][] grid) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    static char[][] g(String... rows) {
        char[][] out = new char[rows.length][];
        for (int i = 0; i < rows.length; i++) out[i] = rows[i].toCharArray();
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("1100/1001/0011", 2, () -> s.numIslands(g("1100", "1001", "0011")));
        Check.eq("11100/00100/00011/10011", 3, () -> s.numIslands(g("11100", "00100", "00011", "10011")));
        Check.hiddenFromHere();
        Check.eq("sab paani", 0, () -> s.numIslands(g("000", "000")));
        Check.eq("single land", 1, () -> s.numIslands(g("1")));
        Check.eq("checkerboard (diagonal nahi judta)", 5, () -> s.numIslands(g("101", "010", "101")));
        Check.eq("snake shape", 1, () -> s.numIslands(g("111", "001", "111", "100", "111")));
        String[] stripes = new String[300];
        String ones = "1".repeat(300), zeros = "0".repeat(300);
        for (int i = 0; i < 300; i++) stripes[i] = i % 2 == 0 ? ones : zeros;
        Check.eq("bada: 300x300 horizontal stripes", 150, () -> s.numIslands(g(stripes)));
        String[] full = new String[60];
        for (int i = 0; i < 60; i++) full[i] = "1".repeat(60);
        Check.eq("bada: 60x60 poora land", 1, () -> s.numIslands(g(full)));
    }
}`,
      hints: [
        "Do loops se har cell. <code>grid[r][c] == '1'</code> mile to <code>count++</code> aur <code>sink(grid, r, c)</code>.",
        "<code>sink</code>: bahar ho ya '0' ho to return; warna <code>grid[r][c] = '0'</code> aur chaaron padosiyon pe sink.",
        "Recursion ki jagah <code>ArrayDeque&lt;int[]&gt;</code> wala BFS bhi likh sakte ho (stack overflow ka dar nahi)."
      ],
      solution: `import java.util.*;

class Solution {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length, count = 0;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                count++;
                grid[r][c] = '0';
                q.offer(new int[]{r, c});
                while (!q.isEmpty()) {
                    int[] cur = q.poll();
                    for (int[] d : DIRS) {
                        int nr = cur[0] + d[0], nc = cur[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            q.offer(new int[]{nr, nc});
                        }
                    }
                }
            }
        }
        return count;
    }
}`,
      explain: "<p><b>Approach:</b> scan + BFS flood fill. Har naya '1' ek naya island; BFS us island ko '0' kar deta hai.</p><p><b>Time:</b> O(m × n). <b>Space:</b> O(min(m, n)) approx queue (BFS), DFS mein O(m × n) worst. Input grid modify karna theek na ho to alag <code>boolean[][] visited</code> lo (interviewer se poochho).</p>"
    },
    {
      type: "think",
      id: "think-rotting",
      q: "<b>Rotting Oranges:</b> grid mein 0 = khaali, 1 = fresh, 2 = rotten. Har minute rotten orange apne 4 padosi fresh oranges ko rotten kar deta hai. Kitne minute mein sab rotten? Possible na ho to -1. Har rotten orange se alag BFS kyun nahi?",
      rubric: [
        { point: "<b>Multi-source BFS</b>: shuru mein saare rotten ek saath queue mein", keys: ["multi-source", "multi source", "multisource", "saare rotten", "all rotten", "ek saath"], weight: 2 },
        { point: "Level by level = <b>minutes</b>", keys: ["level", "minute", "size", "layer", "time++"], weight: 2 },
        { point: "<b>Fresh count</b> rakho; end mein fresh &gt; 0 to -1", keys: ["fresh count", "fresh", "count", "-1", "bache"], weight: 2 },
        { point: "Alag alag BFS galat/slow: O((mn)²) aur min time nahi milta", keys: ["slow", "o((mn)", "alag bfs", "har ek se", "galat"] },
        { point: "O(m × n)", keys: ["o(m", "o(mn)", "m*n", "m × n"] }
      ],
      answer: `<p>Saare rotten oranges ko <b>ek saath</b> queue mein daalo (minute 0) aur fresh count karo. Phir BFS level by level: har level = 1 minute. Fresh padosi ko 2 karo, fresh--, queue mein daalo.</p>
        <p>End mein fresh &gt; 0 → -1, warna minutes. Har rotten se alag BFS karna O((mn)²) hai aur unke results ka min nikaalna padta. Multi-source BFS ek hi pass mein sahi time deta hai: O(m × n).</p>`
    },
    {
      type: "exercise",
      id: "ex-rotting",
      title: "Rotting Oranges",
      level: "Medium",
      task: `<p>Each cell of <code>grid</code> is 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, each fresh orange that is up/down/left/right of a rotten orange becomes rotten.</p><p>Return the minimum number of minutes until no fresh orange is left, or <code>-1</code> if some orange can never rot.</p><p class="small muted">Example 1 minute by minute</p><pre class="diagram">t=0      t=1      t=2      t=3      t=4
2 1 1    2 2 1    2 2 2    2 2 2    2 2 2
1 1 0    2 1 0    2 2 0    2 2 0    2 2 0
0 1 1    0 1 1    0 1 1    0 2 1    0 2 2</pre><h4>Constraints</h4><ul><li>1 ≤ rows, cols ≤ 300</li><li>grid[i][j] is 0, 1 or 2</li></ul><p><a href="https://leetcode.com/problems/rotting-oranges/" target="_blank">LeetCode 994</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
Explanation: The orange in the bottom-left corner has no rotten neighbour path.</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  grid = [[0,2]]
Output: 0
Explanation: There is no fresh orange at the start.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int orangesRotting(int[][] grid) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[2,1,1],[1,1,0],[0,1,1]]", 4, () -> s.orangesRotting(new int[][]{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}));
        Check.eq("[[2,1,1],[0,1,1],[1,0,1]]", -1, () -> s.orangesRotting(new int[][]{{2, 1, 1}, {0, 1, 1}, {1, 0, 1}}));
        Check.eq("[[0,2]] (koi fresh nahi)", 0, () -> s.orangesRotting(new int[][]{{0, 2}}));
        Check.hiddenFromHere();
        Check.eq("[[0]]", 0, () -> s.orangesRotting(new int[][]{{0}}));
        Check.eq("[[1]] (rotten koi nahi)", -1, () -> s.orangesRotting(new int[][]{{1}}));
        Check.eq("[[2,2],[1,1]]", 1, () -> s.orangesRotting(new int[][]{{2, 2}, {1, 1}}));
        Check.eq("multi-source: do kone se", 2, () -> s.orangesRotting(new int[][]{{2, 1, 1}, {1, 1, 1}, {0, 1, 2}}));
        int n = 300;
        int[][] big = new int[n][n];
        for (int[] row : big) java.util.Arrays.fill(row, 1);
        big[0][0] = 2;
        Check.eq("bada: 300x300, ek kone se", 598, () -> s.orangesRotting(big));
    }
}`,
      hints: [
        "Pehle scan: saare 2 queue mein, aur fresh (1) ginti karo.",
        "BFS level by level; ek level khatam = ek minute. Sirf tab minute badhao jab is level ne koi naya orange sadaya ho (ya end mein -1 adjust karo).",
        "End: <code>return fresh == 0 ? minutes : -1;</code>"
      ],
      solution: `import java.util.*;

class Solution {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    int orangesRotting(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, fresh = 0;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.offer(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        }
        int minutes = 0;
        while (!q.isEmpty() && fresh > 0) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                int[] cur = q.poll();
                for (int[] d : DIRS) {
                    int nr = cur[0] + d[0], nc = cur[1] + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        q.offer(new int[]{nr, nc});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
}`,
      explain: "<p><b>Approach:</b> multi-source BFS. Saare rotten minute 0 pe queue mein; har level ek minute. Loop tab tak jab tak fresh bache hain.</p><p><b>Time:</b> O(m × n). <b>Space:</b> O(m × n) queue worst case.</p>"
    },
    {
      type: "think",
      id: "think-clone",
      q: "<b>Clone Graph:</b> connected undirected graph ka ek node diya hai (har node mein val aur neighbors ki list). Poore graph ki <b>deep copy</b> return karni hai. Cycles ki wajah se infinite loop kaise rokoge?",
      rubric: [
        { point: "<b>HashMap&lt;original, copy&gt;</b> rakho (visited bhi yahi hai)", keys: ["hashmap", "map", "original -> copy", "old to new", "visited"], weight: 2 },
        { point: "Node map mein hai to wahi copy return, warna naya banao <b>pehle map mein daalo</b>, phir neighbors", keys: ["pehle map", "before", "map mein daal", "put", "already"], weight: 2 },
        { point: "DFS ya BFS, dono chalte hain", keys: ["dfs", "bfs", "queue", "recursion"] },
        { point: "O(V + E)", keys: ["o(v + e)", "o(v+e)", "v + e", "nodes + edges"] }
      ],
      answer: `<p><code>Map&lt;Node, Node&gt; copies</code>. DFS(node): agar map mein hai to <code>copies.get(node)</code> return (cycle yahi rukti hai). Warna <code>copy = new Node(node.val)</code>, <b>turant</b> <code>copies.put(node, copy)</code>, phir har neighbor ke liye <code>copy.neighbors.add(dfs(nb))</code>.</p>
        <p>Map mein daalna neighbors se pehle zaroori hai, warna A → B → A wapas A ki nayi copy banayega. Time O(V + E), space O(V).</p>`
    },
    {
      type: "exercise",
      id: "ex-clone-graph",
      title: "Clone Graph",
      level: "Medium",
      task: `<p>You are given one node of a connected undirected graph (node values are unique, 1..n, and the given node has value 1). Return a <b>deep copy</b> of the whole graph: every node must be a new object, and the neighbour structure must be identical. If the graph is empty you get <code>null</code>.</p><p>The harness checks that the structure matches and that no original node is reused in the copy.</p><p class="small muted">Example 1: adjacency list [[2,4],[1,3],[2,4],[1,3]]</p><pre class="diagram">  1 ─── 2
  │     │
  4 ─── 3</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 2000</li><li>Node values are unique, 1..n</li><li>No repeated edges and no self-loops</li></ul><p><a href="https://leetcode.com/problems/clone-graph/" target="_blank">LeetCode 133</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  adj = [[2,4],[1,3],[2,4],[1,3]]
Output: a new graph with the same 4-node square</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  adj = [[]]
Output: one new node with no neighbours</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  adj = []
Output: null</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Node {
    public int val;
    public List<Node> neighbors;
    Node(int v) { val = v; neighbors = new ArrayList<>(); }
}

class Solution {
    Node cloneGraph(Node node) {
        return node;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<Node> all(Node start) {
        List<Node> out = new ArrayList<>();
        if (start == null) return out;
        Set<Node> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        Deque<Node> q = new ArrayDeque<>();
        q.offer(start);
        seen.add(start);
        while (!q.isEmpty()) {
            Node u = q.poll();
            out.add(u);
            for (Node v : u.neighbors) if (seen.add(v)) q.offer(v);
        }
        return out;
    }

    static Object check(Solution s, int[][] adj) {
        Node[] nodes = new Node[adj.length + 1];
        for (int i = 1; i <= adj.length; i++) nodes[i] = new Node(i);
        for (int i = 1; i <= adj.length; i++) for (int j : adj[i - 1]) nodes[i].neighbors.add(nodes[j]);
        Node start = adj.length == 0 ? null : nodes[1];
        Set<Node> originals = Collections.newSetFromMap(new IdentityHashMap<>());
        originals.addAll(all(start));
        Node copy = s.cloneGraph(start);
        if (start == null) return copy == null ? "null" : "null expected tha";
        if (copy == null) return "copy null hai";
        List<Node> got = all(copy);
        Map<Integer, Node> byVal = new HashMap<>();
        for (Node u : got) {
            if (originals.contains(u)) return "original node " + u.val + " reuse hua (deep copy nahi)";
            if (byVal.containsKey(u.val)) return "node " + u.val + " ki do copies";
            byVal.put(u.val, u);
        }
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 1; i <= adj.length; i++) {
            Node u = byVal.get(i);
            List<Integer> nb = new ArrayList<>();
            if (u != null) for (Node v : u.neighbors) nb.add(v.val);
            out.add(nb);
        }
        return out;
    }

    static List<List<Integer>> asList(int[][] adj) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] row : adj) {
            List<Integer> r = new ArrayList<>();
            for (int x : row) r.add(x);
            out.add(r);
        }
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        int[][] square = {{2, 4}, {1, 3}, {2, 4}, {1, 3}};
        Check.eq("square [[2,4],[1,3],[2,4],[1,3]]", asList(square), () -> check(s, square));
        int[][] single = {{}};
        Check.eq("single node [[]]", asList(single), () -> check(s, single));
        Check.eq("empty graph []", "null", () -> check(s, new int[0][]));
        Check.hiddenFromHere();
        int[][] pair = {{2}, {1}};
        Check.eq("do nodes [[2],[1]]", asList(pair), () -> check(s, pair));
        int[][] triangle = {{2, 3}, {1, 3}, {1, 2}};
        Check.eq("triangle (cycle)", asList(triangle), () -> check(s, triangle));
        int[][] star = {{2, 3, 4, 5}, {1}, {1}, {1}, {1}};
        Check.eq("star", asList(star), () -> check(s, star));
        int n = 2000;
        int[][] ring = new int[n][];
        for (int i = 1; i <= n; i++) ring[i - 1] = new int[]{i == 1 ? n : i - 1, i == n ? 1 : i + 1};
        Check.eq("bada: 2000 nodes ka ring", asList(ring), () -> check(s, ring));
    }
}`,
      hints: [
        "<code>Map&lt;Node, Node&gt; copies = new HashMap&lt;&gt;()</code> (original → copy).",
        "DFS(node): null → null; map mein hai → <code>copies.get(node)</code>.",
        "Warna <code>Node c = new Node(node.val); copies.put(node, c);</code> phir <code>for (Node nb : node.neighbors) c.neighbors.add(dfs(nb));</code>"
      ],
      solution: `import java.util.*;

class Node {
    public int val;
    public List<Node> neighbors;
    Node(int v) { val = v; neighbors = new ArrayList<>(); }
}

class Solution {
    Node cloneGraph(Node node) {
        if (node == null) return null;
        Map<Node, Node> copies = new HashMap<>();
        Deque<Node> q = new ArrayDeque<>();
        copies.put(node, new Node(node.val));
        q.offer(node);
        while (!q.isEmpty()) {
            Node u = q.poll();
            for (Node v : u.neighbors) {
                if (!copies.containsKey(v)) {
                    copies.put(v, new Node(v.val));
                    q.offer(v);
                }
                copies.get(u).neighbors.add(copies.get(v));
            }
        }
        return copies.get(node);
    }
}`,
      explain: "<p><b>Approach:</b> BFS + map (original → copy). Node pehli baar dikhte hi uski copy banti hai aur map mein jaati hai; edges copy ke beech jodte hain.</p><p><b>Time:</b> O(V + E). <b>Space:</b> O(V). Recursive DFS bhi same complexity, par bade graph pe recursion depth ka dhyaan rakho.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Grid problem mein code se pehle teen cheezein bolo: (1) graph kya hai (cell = node, 4 padosi = edges), (2) BFS kyun ya DFS kyun (\"minimum minutes chahiye, to BFS levels\"), (3) visited kahan mark hoga. Ye 30 second ki baat interviewer ko structured thinking dikhati hai."
    }
  ],
  references: [
    { title: "Number of Islands", by: "LeetCode", url: "https://leetcode.com/problems/number-of-islands/", type: "article" },
    { title: "Rotting Oranges", by: "LeetCode", url: "https://leetcode.com/problems/rotting-oranges/", type: "article" },
    { title: "Clone Graph", by: "LeetCode", url: "https://leetcode.com/problems/clone-graph/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Graph series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (Graphs)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
