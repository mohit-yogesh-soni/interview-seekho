// Shortest Path (Dijkstra)
registerLesson("dsa", "shortest-path", {
  why: "Google Maps ka fastest route, Ola ka nearest cab ETA, network mein packet ka minimum delay: sab weighted shortest path hain. Dijkstra interview mein Medium/Hard graph questions ka standard tool hai, aur \"BFS kab, Dijkstra kab\" ka farak samajhna zaroori hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>BFS kaafi kab hai, Dijkstra kab chahiye?</h2>
        <table>
          <tr><th>Graph</th><th>Algorithm</th><th>Time</th></tr>
          <tr><td>Har edge ka weight same (ya unweighted)</td><td>BFS</td><td>O(V + E)</td></tr>
          <tr><td>Weights 0 ya 1</td><td>0-1 BFS (deque)</td><td>O(V + E)</td></tr>
          <tr><td>Non-negative weights</td><td><b>Dijkstra</b> (PriorityQueue)</td><td>O(E log V)</td></tr>
          <tr><td>Negative weights ho sakte hain</td><td>Bellman-Ford</td><td>O(V · E)</td></tr>
        </table>
        <h2>Dijkstra ka idea</h2>
        <p><code>dist[source] = 0</code>, baaki sab ∞. Min-heap se hamesha <b>sabse chhote dist wala</b> node nikaalo. Us node ka dist ab final hai (non-negative weights mein aage koi raasta isse chhota nahi ho sakta). Uske har edge (u → v, w) ko <b>relax</b> karo: agar <code>dist[u] + w &lt; dist[v]</code> to dist[v] update karo aur heap mein daalo.</p>
        <pre class="diagram">
        4
   A ───────► B          A se B: seedha 4, ya A → C → B = 1 + 2 = 3
   │          ▲          Dijkstra pehle C (dist 1) nikaalta hai,
 1 │          │ 2        phir B ko 3 se relax karta hai.
   ▼          │
   C ─────────┘
</pre>
        <p><b>Negative weight pe kyun toot-ta hai:</b> node ko "final" maan liya, par baad mein negative edge se chhota raasta mil sakta hai. Isliye Dijkstra sirf non-negative weights pe.</p>
        <h2>Signals</h2>
        <ul>
          <li>"Minimum cost / time / delay" with weighted edges</li>
          <li>Grid jahan har move ka cost alag hai (effort, height difference)</li>
          <li>"Path ka cost = max edge" jaise variations: same Dijkstra, sirf relax formula badlo</li>
        </ul>`
    },
    {
      type: "code",
      title: "Template: Dijkstra with PriorityQueue (lazy deletion)",
      code: `import java.util.*;

public class Main {
    // adj.get(u) = list of {v, w}
    static int[] dijkstra(List<List<int[]>> adj, int src) {
        int n = adj.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0])); // {dist, node}
        pq.offer(new int[]{0, src});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (d > dist[u]) continue;            // purani (stale) entry, skip
            for (int[] e : adj.get(u)) {
                int v = e[0], nd = d + e[1];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.offer(new int[]{nd, v});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        String[] names = {"A", "B", "C", "D"};
        int[][] edges = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < 4; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(new int[]{e[1], e[2]});   // directed
        int[] dist = dijkstra(adj, 0);
        for (int i = 0; i < 4; i++) System.out.println("A -> " + names[i] + " = " + dist[i]);
    }
}`,
      note: "Java <code>PriorityQueue</code> mein decrease-key nahi hai. Isliye naya (chhota) dist naye entry ki tarah daalte hain aur purani entry nikalne pe <code>d &gt; dist[u]</code> se skip karte hain. Isse heap mein O(E) entries tak ho sakti hain, time O(E log E) = O(E log V)."
    },
    {
      type: "steps",
      title: "Dijkstra dry run (upar wala graph, source A)",
      steps: [
        { title: "Shuru", html: `<table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>dist</td><td><b>0</b></td><td>∞</td><td>∞</td><td>∞</td></tr></table><p>heap = {(0, A)}</p>` },
        { title: "Poll A (0): relax A→B (4), A→C (1)", html: `<table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>dist</td><td>0 ✓</td><td>4</td><td>1</td><td>∞</td></tr></table><p>heap = {(1, C), (4, B)}</p>` },
        { title: "Poll C (1): C→B = 1+2 = 3 &lt; 4, C→D = 1+5 = 6", html: `<table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>dist</td><td>0 ✓</td><td><b>3</b></td><td>1 ✓</td><td>6</td></tr></table><p>heap = {(3, B), (4, B) stale, (6, D)}</p>` },
        { title: "Poll B (3): B→D = 3+1 = 4 &lt; 6", html: `<table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>dist</td><td>0 ✓</td><td>3 ✓</td><td>1 ✓</td><td><b>4</b></td></tr></table><p>heap = {(4, B) stale, (4, D), (6, D) stale}</p>` },
        { title: "Stale entries skip, poll D (4). Done", html: `<table><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>dist</td><td>0 ✓</td><td>3 ✓</td><td>1 ✓</td><td>4 ✓</td></tr></table><p>(4, B) aaya: 4 &gt; dist[B] = 3, skip. (6, D): skip. Final: A→D = 4 (A → C → B → D).</p>` }
      ]
    },
    {
      type: "quiz",
      q: "Graph mein ek edge ka weight <b>-3</b> hai (koi negative cycle nahi). Dijkstra ka kya hoga?",
      options: [
        "Sahi answer deta hai, bas slow ho jaata hai",
        "Galat answer de sakta hai, kyunki ek baar final kiya node baad mein chhote raaste se update nahi hota",
        "Compile error",
        "Infinite loop hamesha"
      ],
      answer: 1,
      why: "Dijkstra ka assumption hai ki heap se nikla node final hai. Negative edge baad mein ek chhota raasta bana sakti hai. Negative weights ke liye Bellman-Ford (O(V·E)) use karo; wo negative cycle detect bhi karta hai."
    },
    {
      type: "think",
      id: "think-network-delay",
      q: "<b>Network Delay Time:</b> n nodes, directed edges <code>[u, v, time]</code>. Node k se signal bheja. Sab nodes tak pahunchne mein minimum kitna time? Koi node na pahunche to -1. Approach aur complexity?",
      rubric: [
        { point: "Source k se <b>Dijkstra</b>", keys: ["dijkstra", "priority queue", "priorityqueue", "min-heap", "heap"], weight: 2 },
        { point: "Answer = <b>max(dist)</b> (sabse late pahunchne wala)", keys: ["max", "maximum", "sabse bada", "largest dist", "max(dist"], weight: 2 },
        { point: "Koi dist ∞ reh gaya → -1", keys: ["infinity", "∞", "max_value", "unreachable", "-1", "nahi pahunch"] },
        { point: "O(E log V) time", keys: ["e log v", "elogv", "e log e", "log v"] }
      ],
      answer: `<p>Adjacency list banao, k se Dijkstra chalao. Signal sab tak parallel jaata hai, to total time = <b>sabse door node ka dist</b> = <code>max(dist)</code>. Agar koi dist ∞ hai to -1.</p>
        <p>Time O(E log V), space O(V + E). Bellman-Ford O(V·E) bhi chalega par slow hai.</p>`
    },
    {
      type: "exercise",
      id: "ex-network-delay",
      title: "Network Delay Time",
      level: "Medium",
      task: `<p>A network has <code>n</code> nodes labelled 1 to n. <code>times[i] = [u, v, w]</code> means a signal takes <code>w</code> time to travel from u to v (directed). A signal is sent from node <code>k</code>. Return the minimum time for <b>all</b> nodes to receive it, or <code>-1</code> if some node can never be reached.</p><p class="small muted">Example 1</p><pre class="diagram">      2
    1/ \\1
    ↓   ↓
    1   3
        │1
        ↓
        4
from 2: node 1 at t=1, node 3 at t=1, node 4 at t=2 → answer 2</pre><h4>Constraints</h4><ul><li>1 ≤ n ≤ 2 · 10⁴</li><li>1 ≤ times.length ≤ 10⁵</li><li>All weights are non-negative (so Dijkstra works)</li></ul><p><a href="https://leetcode.com/problems/network-delay-time/" target="_blank">LeetCode 743</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
Output: 2</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  times = [[1,2,1]], n = 2, k = 1
Output: 1</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  times = [[1,2,1]], n = 2, k = 2
Output: -1
Explanation: Node 1 cannot be reached from node 2.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int networkDelayTime(int[][] times, int n, int k) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2", 2, () -> s.networkDelayTime(new int[][]{{2, 1, 1}, {2, 3, 1}, {3, 4, 1}}, 4, 2));
        Check.eq("[[1,2,1]], n=2, k=1", 1, () -> s.networkDelayTime(new int[][]{{1, 2, 1}}, 2, 1));
        Check.eq("[[1,2,1]], n=2, k=2", -1, () -> s.networkDelayTime(new int[][]{{1, 2, 1}}, 2, 2));
        Check.hiddenFromHere();
        Check.eq("n=1, koi edge nahi", 0, () -> s.networkDelayTime(new int[0][], 1, 1));
        Check.eq("lamba raasta chhota: [[1,2,1],[2,3,2],[1,3,4]]", 3, () -> s.networkDelayTime(new int[][]{{1, 2, 1}, {2, 3, 2}, {1, 3, 4}}, 3, 1));
        Check.eq("parallel edges [[1,2,5],[1,2,1]]", 1, () -> s.networkDelayTime(new int[][]{{1, 2, 5}, {1, 2, 1}}, 2, 1));
        Check.eq("zero weight edges", 3, () -> s.networkDelayTime(new int[][]{{1, 2, 0}, {2, 3, 0}, {3, 4, 3}, {1, 4, 7}}, 4, 1));
        int n = 20000;
        int[][] big = new int[2 * n - 3][];
        int idx = 0;
        for (int i = 1; i < n; i++) big[idx++] = new int[]{i, i + 1, 1};
        for (int i = 3; i <= n; i++) big[idx++] = new int[]{1, i, 100000};
        Check.eq("bada: 20000 nodes, chain + mehenge shortcuts", n - 1, () -> s.networkDelayTime(big, n, 1));
    }
}`,
      hints: [
        "Adjacency list: <code>adj[u].add(new int[]{v, w})</code>. <code>dist</code> array size n + 1, sab MAX_VALUE, <code>dist[k] = 0</code>.",
        "PQ of {dist, node}; poll, <code>if (d &gt; dist[u]) continue;</code>, phir relax.",
        "End: 1..n ka max dist; koi MAX_VALUE ho to -1."
      ],
      solution: `import java.util.*;

class Solution {
    int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        pq.offer(new int[]{0, k});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (d > dist[u]) continue;
            for (int[] e : adj.get(u)) {
                int nd = d + e[1];
                if (nd < dist[e[0]]) {
                    dist[e[0]] = nd;
                    pq.offer(new int[]{nd, e[0]});
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            ans = Math.max(ans, dist[i]);
        }
        return ans;
    }
}`,
      explain: "<p><b>Approach:</b> source k se Dijkstra; answer = max dist (sab tak pahunchne ka time).</p><p><b>Time:</b> O(E log V). <b>Space:</b> O(V + E). Bellman-Ford O(V · E) bade test pe slow hai.</p>"
    },
    {
      type: "think",
      id: "think-min-effort",
      q: "<b>Path With Minimum Effort:</b> grid of heights. Top-left se bottom-right jaana hai (4 directions). Ek path ki effort = us path pe do adjacent cells ka <b>maximum</b> height difference. Minimum effort chahiye. Dijkstra kaise lagega? Relax formula kya hoga?",
      rubric: [
        { point: "Cell = node, padosi = edge, weight = <b>|h1 - h2|</b>", keys: ["abs", "|h", "difference", "farak", "height diff"], weight: 2 },
        { point: "Path cost = <b>max</b>, sum nahi: <code>nd = max(d, diff)</code>", keys: ["max(d", "max(", "maximum", "sum nahi", "not sum"], weight: 2 },
        { point: "Dijkstra / PQ, destination nikle to ruk jao", keys: ["dijkstra", "priority", "heap", "pq"], weight: 2 },
        { point: "Alternative: effort pe <b>binary search</b> + BFS", keys: ["binary search", "binary", "bfs", "union find"] },
        { point: "O(mn log(mn))", keys: ["log(mn)", "mn log", "m*n log", "log"] }
      ],
      answer: `<p>Har cell node hai. Edge weight = height difference. Path ka cost sum nahi, <b>max</b> hai, to relax: <code>nd = max(effort[u], |h[u] - h[v]|)</code>; agar <code>nd &lt; effort[v]</code> to update. Dijkstra yahan bhi sahi hai, kyunki max bhi monotonic hai (raasta lamba karne se cost kam nahi hoti).</p>
        <p>Destination heap se nikle to wahi answer. Time O(mn log(mn)). Alternative: answer pe binary search (0..10⁶), har mid pe BFS "sirf diff ≤ mid wale edges" se: O(mn log(range)).</p>`
    },
    {
      type: "exercise",
      id: "ex-min-effort",
      title: "Path With Minimum Effort",
      level: "Medium",
      task: `<p><code>heights</code> is a rows × cols grid. You walk from (0, 0) to (rows − 1, cols − 1), moving up, down, left or right. The <b>effort</b> of a route is the largest absolute height difference between two consecutive cells on it. Return the minimum possible effort.</p><p class="small muted">Example 1: route 1 → 3 → 5 → 3 → 5 has effort 2</p><pre class="diagram">[1]  2   2
[3]  8   2
[5] [3] [5]</pre><h4>Constraints</h4><ul><li>1 ≤ rows, cols ≤ 150</li><li>1 ≤ heights[i][j] ≤ 10⁶</li></ul><p><a href="https://leetcode.com/problems/path-with-minimum-effort/" target="_blank">LeetCode 1631</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  heights = [[1,2,2],[3,8,2],[5,3,5]]
Output: 2</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  heights = [[1,2,3],[3,8,4],[5,3,5]]
Output: 1
Explanation: Route 1 → 2 → 3 → 4 → 5 never changes by more than 1.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int minimumEffortPath(int[][] heights) {
        return -1;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    // Reference: effort pe binary search + BFS (alag tareeka, expected nikaalne ke liye)
    static boolean reach(int[][] h, int limit) {
        int R = h.length, C = h[0].length;
        boolean[][] seen = new boolean[R][C];
        Deque<int[]> q = new ArrayDeque<>();
        q.offer(new int[]{0, 0});
        seen[0][0] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] c = q.poll();
            if (c[0] == R - 1 && c[1] == C - 1) return true;
            for (int[] d : dirs) {
                int r = c[0] + d[0], k = c[1] + d[1];
                if (r >= 0 && r < R && k >= 0 && k < C && !seen[r][k] && Math.abs(h[r][k] - h[c[0]][c[1]]) <= limit) {
                    seen[r][k] = true;
                    q.offer(new int[]{r, k});
                }
            }
        }
        return false;
    }

    static int reference(int[][] h) {
        int lo = 0, hi = 1000000;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (reach(h, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,2,2],[3,8,2],[5,3,5]]", 2, () -> s.minimumEffortPath(new int[][]{{1, 2, 2}, {3, 8, 2}, {5, 3, 5}}));
        Check.eq("[[1,2,3],[3,8,4],[5,3,5]]", 1, () -> s.minimumEffortPath(new int[][]{{1, 2, 3}, {3, 8, 4}, {5, 3, 5}}));
        Check.hiddenFromHere();
        Check.eq("single cell", 0, () -> s.minimumEffortPath(new int[][]{{5}}));
        Check.eq("ek row [[1,10]]", 9, () -> s.minimumEffortPath(new int[][]{{1, 10}}));
        Check.eq("ek column [[1],[4],[2]]", 3, () -> s.minimumEffortPath(new int[][]{{1}, {4}, {2}}));
        Check.eq("flat path exist karta hai", 0, () -> s.minimumEffortPath(new int[][]{{1, 2, 1, 1, 1}, {1, 2, 1, 2, 1}, {1, 2, 1, 2, 1}, {1, 2, 1, 2, 1}, {1, 1, 1, 2, 1}}));
        int n = 150;
        int[][] big = new int[n][n];
        long seed = 99;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {
            seed = seed * 6364136223846793005L + 1442695040888963407L;
            big[i][j] = (int) ((seed >>> 33) % 1000000);
        }
        int expected = reference(big);
        Check.eq("bada: 150x150 random heights", expected, () -> s.minimumEffortPath(big));
    }
}`,
      hints: [
        "<code>effort[r][c]</code> = ab tak ka best (min) effort us cell tak; shuru mein MAX_VALUE, <code>effort[0][0] = 0</code>.",
        "PQ of {effort, r, c}. Relax: <code>nd = Math.max(e, Math.abs(h[nr][nc] - h[r][c]))</code>.",
        "Destination poll ho to return. Stale entries skip karna mat bhoolo."
      ],
      solution: `import java.util.*;

class Solution {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    int minimumEffortPath(int[][] heights) {
        int R = heights.length, C = heights[0].length;
        int[][] effort = new int[R][C];
        for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
        effort[0][0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        pq.offer(new int[]{0, 0, 0});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int e = top[0], r = top[1], c = top[2];
            if (e > effort[r][c]) continue;
            if (r == R - 1 && c == C - 1) return e;
            for (int[] d : DIRS) {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
                int nd = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
                if (nd < effort[nr][nc]) {
                    effort[nr][nc] = nd;
                    pq.offer(new int[]{nd, nr, nc});
                }
            }
        }
        return 0;
    }
}`,
      explain: "<p><b>Approach:</b> Dijkstra jahan path cost = max edge. Destination pehli baar heap se nikle wahi minimum effort.</p><p><b>Time:</b> O(mn log(mn)). <b>Space:</b> O(mn). Binary search + BFS ya Union-Find (edges sort karke jodte jao jab tak start-end connect na ho) bhi valid hain.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Dijkstra likhne se pehle confirm karo: \"weights non-negative hain?\" Phir bolo ki Java PQ mein decrease-key nahi hai, isliye lazy deletion (<code>if (d &gt; dist[u]) continue</code>) use kar rahe ho. Ye chhoti si line bhoolne pe code sahi to chalta hai par bahut slow ho sakta hai, aur interviewer ye detail notice karta hai."
    }
  ],
  references: [
    { title: "Network Delay Time", by: "LeetCode", url: "https://leetcode.com/problems/network-delay-time/", type: "article" },
    { title: "Path With Minimum Effort", by: "LeetCode", url: "https://leetcode.com/problems/path-with-minimum-effort/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Graph series (Dijkstra)", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (Advanced Graphs)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
