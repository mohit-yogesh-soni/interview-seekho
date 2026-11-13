// Union Find (DSU)
registerLesson("dsa", "union-find", {
  why: "\"Kya ye do cheezein ek hi group mein hain?\" aur \"ye do groups jod do\": jab ye dono sawaal baar baar aayein (friend circles, duplicate accounts, network connectivity, Kruskal MST), to Union-Find lagbhag O(1) per operation deta hai. Code 15 line ka hai aur interview mein yaad hona chahiye.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>Paytm ke paas lakhs accounts hain. Agar do accounts ka ek bhi phone number common hai, to wo ek hi insaan ke hain. Naye links aate rehte hain, aur baar baar poochha jaata hai: "account A aur B same person ke hain?" Har baar BFS/DFS chalana mehenga hai.</p>
        <h2>Union-Find (Disjoint Set Union)</h2>
        <p>Har element ka ek <b>parent</b> hota hai. Group ka ek <b>leader (root)</b> hota hai jiska parent wo khud hai.</p>
        <ul>
          <li><code>find(x)</code>: parent follow karte jao jab tak root na mile. Do elements ka root same → same group.</li>
          <li><code>union(a, b)</code>: dono ke root nikaalo; alag hon to ek root ko doosre ke neeche laga do.</li>
        </ul>
        <h2>Do optimizations (dono lagao)</h2>
        <table>
          <tr><th>Trick</th><th>Kya karta hai</th></tr>
          <tr><td><b>Path compression</b></td><td>find ke raaste ke har node ko seedha root se jod do. Agli baar 1 step mein root.</td></tr>
          <tr><td><b>Union by rank/size</b></td><td>Chhote tree ko bade ke neeche lagao, taaki height na badhe.</td></tr>
        </table>
        <p>Dono ke saath har operation ka amortized time <b>O(α(n))</b> hai. α (inverse Ackermann) practical n ke liye 4-5 se zyada nahi hota, isliye ise "almost O(1)" bolte hain.</p>
        <h2>Signals</h2>
        <ul>
          <li>"Connected components" jab edges ek ek karke aa rahe hon (dynamic connectivity)</li>
          <li>"Groups merge karo" (accounts, friend circles, similar strings)</li>
          <li>Undirected graph mein <b>cycle</b>: edge (a, b) ke dono end pehle se same group mein → cycle</li>
          <li>Kruskal's minimum spanning tree</li>
        </ul>`
    },
    {
      type: "code",
      title: "Template: DSU with path compression + union by rank",
      code: `public class Main {
    static int[] parent, rank;
    static int components;

    static void init(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;   // har koi apna leader
    }

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);  // path compression
        return parent[x];
    }

    static boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                       // pehle se same group
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                                  // chhota tree bade ke neeche
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
        return true;
    }

    public static void main(String[] args) {
        init(6);
        union(0, 1);
        union(1, 2);
        union(3, 4);
        System.out.println("0 aur 2 same group? " + (find(0) == find(2)));
        System.out.println("0 aur 3 same group? " + (find(0) == find(3)));
        System.out.println("components: " + components);              // {0,1,2} {3,4} {5}
        System.out.println("union(2, 0) naya link? " + union(2, 0));   // false = cycle banti
    }
}`,
      note: "Recursive <code>find</code> bahut lambi chain pe (10⁵) stack overflow de sakta hai agar union by rank na ho. Rank ke saath height O(log n) rehti hai, to safe hai. Iterative find bhi likh sakte ho."
    },
    {
      type: "steps",
      title: "Dry run: union(0,1), union(2,3), union(1,3), find(3)",
      steps: [
        { title: "Shuru: har koi apna parent", html: `<div class="arr"><span class="cell">0</span><span class="cell">1</span><span class="cell">2</span><span class="cell">3</span></div><div class="arr ptrs"><span class="cell">i</span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>parent = [0, 1, 2, 3]</p>` },
        { title: "union(0, 1): 1 ko 0 ke neeche", html: `<div class="arr"><span class="cell ok">0</span><span class="cell hl">0</span><span class="cell">2</span><span class="cell">3</span></div><p>parent = [0, <b>0</b>, 2, 3]. rank[0] = 1.</p><pre class="diagram">0     2   3
|
1</pre>` },
        { title: "union(2, 3): 3 ko 2 ke neeche", html: `<div class="arr"><span class="cell ok">0</span><span class="cell">0</span><span class="cell ok">2</span><span class="cell hl">2</span></div><p>parent = [0, 0, 2, <b>2</b>]. rank[2] = 1.</p><pre class="diagram">0     2
|     |
1     3</pre>` },
        { title: "union(1, 3): roots 0 aur 2, rank barabar → 2 ko 0 ke neeche", html: `<div class="arr"><span class="cell ok">0</span><span class="cell">0</span><span class="cell hl">0</span><span class="cell">2</span></div><p>parent = [0, 0, <b>0</b>, 2]. rank[0] = 2.</p><pre class="diagram">    0
   / \\
  1   2
      |
      3</pre>` },
        { title: "find(3): 3 → 2 → 0, path compression", html: `<div class="arr"><span class="cell ok">0</span><span class="cell">0</span><span class="cell">0</span><span class="cell hl">0</span></div><p>parent = [0, 0, 0, <b>0</b>]. Ab 3 seedha root se juda hai; agli find(3) ek step.</p><pre class="diagram">    0
  / | \\
 1  2  3</pre>` }
      ]
    },
    {
      type: "think",
      id: "think-provinces",
      q: "<b>Number of Provinces:</b> n cities, <code>isConnected[i][j] = 1</code> matlab i aur j seedhe jude hain. Seedhe ya indirectly jude cities ek province. Provinces kitne? DFS aur DSU dono se kaise?",
      rubric: [
        { point: "Ye <b>connected components</b> count karna hai", keys: ["connected component", "components", "groups", "component"], weight: 2 },
        { point: "DSU: har 1 pe <b>union(i, j)</b>; count = n - successful unions", keys: ["union", "dsu", "union-find", "union find", "n -", "components--"], weight: 2 },
        { point: "DFS: har unvisited city se DFS, count++", keys: ["dfs", "bfs", "visited", "count++"] },
        { point: "Matrix hai to O(n²) time (sirf j &gt; i dekho)", keys: ["o(n²)", "o(n^2)", "n square", "j > i", "matrix"] }
      ],
      answer: `<p>Ye connected components ki ginti hai. <b>DSU:</b> <code>components = n</code>, har <code>i &lt; j</code> jahan <code>isConnected[i][j] == 1</code> → <code>union(i, j)</code>, aur successful union pe components--. <b>DFS:</b> visited array, har unvisited city se DFS aur count++.</p>
        <p>Dono O(n²) (matrix padhna hi n² hai), DSU mein extra α(n) factor. Space O(n).</p>`
    },
    {
      type: "exercise",
      id: "ex-provinces",
      title: "Number of Provinces",
      level: "Medium",
      task: `<p>There are n cities. <code>isConnected[i][j] = 1</code> if cities i and j are directly connected (the matrix is symmetric and the diagonal is 1). A <b>province</b> is a group of cities connected directly or through other cities. Return the number of provinces.</p><p class="small muted">Example 1</p><pre class="diagram">0 ─ 1      2
province A   province B</pre><h4>Constraints</h4><ul><li>1 ≤ n ≤ 1000</li><li>isConnected[i][j] is 0 or 1</li><li>isConnected[i][i] = 1, isConnected[i][j] = isConnected[j][i]</li></ul><p><a href="https://leetcode.com/problems/number-of-provinces/" target="_blank">LeetCode 547</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  isConnected = [[1,1,0],[1,1,0],[0,0,1]]
Output: 2</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  isConnected = [[1,0,0],[0,1,0],[0,0,1]]
Output: 3</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int findCircleNum(int[][] isConnected) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,1,0],[1,1,0],[0,0,1]]", 2, () -> s.findCircleNum(new int[][]{{1, 1, 0}, {1, 1, 0}, {0, 0, 1}}));
        Check.eq("[[1,0,0],[0,1,0],[0,0,1]]", 3, () -> s.findCircleNum(new int[][]{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}));
        Check.hiddenFromHere();
        Check.eq("single city", 1, () -> s.findCircleNum(new int[][]{{1}}));
        Check.eq("sab jude", 1, () -> s.findCircleNum(new int[][]{{1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}}));
        Check.eq("indirect chain 0-1-2, 3 alag", 2, () -> s.findCircleNum(new int[][]{{1, 1, 0, 0}, {1, 1, 1, 0}, {0, 1, 1, 0}, {0, 0, 0, 1}}));
        Check.eq("0-3 aur 1-2", 2, () -> s.findCircleNum(new int[][]{{1, 0, 0, 1}, {0, 1, 1, 0}, {0, 1, 1, 0}, {1, 0, 0, 1}}));
        int n = 1000;
        int[][] big = new int[n][n];
        for (int i = 0; i < n; i++) {
            big[i][i] = 1;
            if (i + 2 < n) { big[i][i + 2] = 1; big[i + 2][i] = 1; }
        }
        Check.eq("bada: 1000 cities, i-(i+2) links (even/odd)", 2, () -> s.findCircleNum(big));
    }
}`,
      hints: [
        "DSU banao: <code>parent[i] = i</code>, <code>components = n</code>.",
        "Do loops: <code>for i, for j = i + 1</code>; agar 1 hai to <code>union(i, j)</code>.",
        "Union mein roots alag the to <code>components--</code>. End mein components return."
      ],
      solution: `class Solution {
    private int[] parent, rank;

    int findCircleNum(int[][] isConnected) {
        int n = isConnected.length, components = n;
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1 && union(i, j)) components--;
            }
        }
        return components;
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving (iterative compression)
            x = parent[x];
        }
        return x;
    }

    private boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
}`,
      explain: "<p><b>Approach:</b> DSU; har successful union do groups ko ek karta hai.</p><p><b>Time:</b> O(n² · α(n)). <b>Space:</b> O(n). DFS bhi O(n²) time, O(n) space deta hai.</p>"
    },
    {
      type: "think",
      id: "think-redundant",
      q: "<b>Redundant Connection:</b> ek tree (n nodes, 1 se n) mein ek extra edge jod di gayi, ab cycle hai. Wo edge hatao jisse wapas tree bane; kai options hon to input mein jo <b>sabse baad</b> mein aaya. DSU se ek pass mein kaise?",
      rubric: [
        { point: "Edges order mein process karo, <b>union(a, b)</b>", keys: ["union", "order", "ek ek", "process", "dsu"], weight: 2 },
        { point: "Agar <b>find(a) == find(b)</b> pehle se → yahi edge cycle banati hai", keys: ["find(a) == find(b)", "same root", "same group", "pehle se", "already connected", "false"], weight: 2 },
        { point: "Ye edge cycle ka <b>last</b> edge hai, isliye answer sahi", keys: ["last", "aakhri", "baad mein", "cycle complete"] },
        { point: "O(n α(n))", keys: ["α", "alpha", "o(n)", "almost linear", "nearly"] }
      ],
      answer: `<p>Edges ko input order mein union karo. Jis edge ke dono ends pehle se same group mein hain, wahi cycle close karti hai, use return karo.</p>
        <p>Kyun ye "sabse baad wala" hai: graph mein ek hi cycle hai, aur cycle tab close hoti hai jab uski aakhri edge aati hai. Us edge se pehle cycle ki baaki edges add ho chuki hoti hain. Time O(n α(n)), space O(n).</p>`
    },
    {
      type: "exercise",
      id: "ex-redundant",
      title: "Redundant Connection",
      level: "Medium",
      task: `<p>A tree with nodes 1..n got one extra edge, so <code>edges</code> now has n undirected edges and exactly one cycle. Return the edge whose removal turns the graph back into a tree. If several edges qualify, return the one that appears <b>last</b> in <code>edges</code>.</p><p class="small muted">Example 1</p><pre class="diagram">1 ─ 2
 \\  │
   3      edge [2,3] closes the cycle</pre><h4>Constraints</h4><ul><li>3 ≤ n ≤ 10⁵</li><li>No repeated edges; the graph is connected</li></ul><p><a href="https://leetcode.com/problems/redundant-connection/" target="_blank">LeetCode 684</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  edges = [[1,2],[1,3],[2,3]]
Output: [2,3]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]
Output: [1,4]</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int[] findRedundantConnection(int[][] edges) {
        return new int[0];
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,2],[1,3],[2,3]]", new int[]{2, 3}, () -> s.findRedundantConnection(new int[][]{{1, 2}, {1, 3}, {2, 3}}));
        Check.eq("[[1,2],[2,3],[3,4],[1,4],[1,5]]", new int[]{1, 4}, () -> s.findRedundantConnection(new int[][]{{1, 2}, {2, 3}, {3, 4}, {1, 4}, {1, 5}}));
        Check.hiddenFromHere();
        Check.eq("triangle [[1,2],[2,3],[3,1]]", new int[]{3, 1}, () -> s.findRedundantConnection(new int[][]{{1, 2}, {2, 3}, {3, 1}}));
        Check.eq("cycle beech mein, baad mein aur edge", new int[]{3, 1}, () -> s.findRedundantConnection(new int[][]{{1, 2}, {2, 3}, {3, 1}, {3, 4}}));
        Check.eq("[[2,3],[1,2],[1,3]]", new int[]{1, 3}, () -> s.findRedundantConnection(new int[][]{{2, 3}, {1, 2}, {1, 3}}));
        Check.eq("[[1,4],[3,4],[1,3],[1,2],[4,5]]", new int[]{1, 3}, () -> s.findRedundantConnection(new int[][]{{1, 4}, {3, 4}, {1, 3}, {1, 2}, {4, 5}}));
        int n = 100000;
        int[][] big = new int[n][];
        for (int i = 1; i < n; i++) big[i - 1] = new int[]{i, i + 1};
        big[n - 1] = new int[]{1, n};
        Check.eq("bada: 100000 ki chain + [1, n]", new int[]{1, n}, () -> s.findRedundantConnection(big));
    }
}`,
      hints: [
        "DSU of size n + 1 (nodes 1 se n hain).",
        "Har edge [a, b]: <code>if (find(a) == find(b)) return edge;</code> warna union.",
        "Bahut lambi chain pe recursive find gehra ho sakta hai: union by rank ya iterative find use karo."
      ],
      solution: `class Solution {
    private int[] parent, rank;

    int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        parent = new int[n + 1];
        rank = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        for (int[] e : edges) {
            int ra = find(e[0]), rb = find(e[1]);
            if (ra == rb) return e;
            if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
            parent[rb] = ra;
            if (rank[ra] == rank[rb]) rank[ra]++;
        }
        return new int[0];
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}`,
      explain: "<p><b>Approach:</b> edges order mein union; jo edge already-connected nodes ko jode wahi redundant.</p><p><b>Time:</b> O(n α(n)). <b>Space:</b> O(n). DFS approach (har edge pe check karo ki path pehle se hai) O(n²) hota.</p>"
    },
    {
      type: "think",
      id: "think-accounts",
      q: "<b>Accounts Merge:</b> har account = [naam, email1, email2, ...]. Do accounts mein ek bhi common email ho to same person. Merge karke har person ke liye [naam, sorted emails] do. Same naam ka matlab same person nahi. DSU mein kya union karoge?",
      rubric: [
        { point: "<b>Email → pehla account index</b> map; email dobara mile to us account se union", keys: ["email -> account", "email to account", "map", "hashmap", "owner", "pehla account"], weight: 2 },
        { point: "Union <b>account indices</b> (ya emails) ka", keys: ["union", "account index", "index", "dsu"], weight: 2 },
        { point: "Root ke hisaab se emails group karo, <b>sort</b>, naam aage lagao", keys: ["group", "sort", "treeset", "root", "naam"] },
        { point: "Naam se merge <b>mat</b> karo", keys: ["naam se nahi", "same name", "naam same", "name alone", "not by name"] },
        { point: "O(E log E) (sorting), E = total emails", keys: ["log", "sort", "o(e", "n log n"] }
      ],
      answer: `<p>DSU on account indices (0..n-1). <code>Map&lt;String, Integer&gt; owner</code>: har email ke liye pehla account jisme wo dikha. Email dobara kisi account j mein mile → <code>union(owner.get(email), j)</code>.</p>
        <p>Phir har email ko <code>find(owner.get(email))</code> wale group mein daalo (<code>Map&lt;Integer, TreeSet&lt;String&gt;&gt;</code> ya list + sort). Har group ke liye <code>[accounts[root].name, ...sorted emails]</code>. Naam sirf label hai; do "Rahul" alag log ho sakte hain.</p>
        <p>Time O(E α(n) + E log E), space O(E).</p>`
    },
    {
      type: "exercise",
      id: "ex-accounts-merge",
      title: "Accounts Merge",
      level: "Medium",
      task: `<p><code>accounts.get(i)</code> is <code>[name, email1, email2, ...]</code>. Two accounts belong to the same person if they share <b>any</b> email (and then they have the same name). Two accounts with the same name may still be different people.</p><p>Merge the accounts and return one list per person: the name first, then all of that person's unique emails <b>sorted</b> (normal String order). The order of the returned accounts does not matter.</p><h4>Constraints</h4><ul><li>1 ≤ accounts.length ≤ 2000</li><li>2 ≤ accounts[i].size() ≤ 10</li></ul><p><a href="https://leetcode.com/problems/accounts-merge/" target="_blank">LeetCode 721</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  [[Rahul, r@x.com, rw@x.com], [Rahul, r@x.com, r2@x.com], [Priya, p@x.com], [Rahul, rahul3@x.com]]
Output: [[Rahul, r2@x.com, r@x.com, rw@x.com], [Priya, p@x.com], [Rahul, rahul3@x.com]]
Explanation: The first two share r@x.com. The last Rahul shares no email, so he is a different person. '2' sorts before '@'.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<String>> accountsMerge(List<List<String>> accounts) {
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<List<String>> acc(String[]... rows) {
        List<List<String>> out = new ArrayList<>();
        for (String[] r : rows) out.add(new ArrayList<>(Arrays.asList(r)));
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("Rahul x3, Priya",
            acc(new String[]{"Rahul", "r2@x.com", "r@x.com", "rw@x.com"}, new String[]{"Priya", "p@x.com"}, new String[]{"Rahul", "rahul3@x.com"}),
            () -> s.accountsMerge(acc(new String[]{"Rahul", "r@x.com", "rw@x.com"}, new String[]{"Rahul", "r@x.com", "r2@x.com"}, new String[]{"Priya", "p@x.com"}, new String[]{"Rahul", "rahul3@x.com"})));
        Check.eqAnyOrder("koi overlap nahi",
            acc(new String[]{"Amit", "a@y.in"}, new String[]{"Neha", "n@y.in"}),
            () -> s.accountsMerge(acc(new String[]{"Amit", "a@y.in"}, new String[]{"Neha", "n@y.in"})));
        Check.hiddenFromHere();
        Check.eqAnyOrder("ek account mein duplicate email",
            acc(new String[]{"Ravi", "a@z.com", "b@z.com"}),
            () -> s.accountsMerge(acc(new String[]{"Ravi", "b@z.com", "a@z.com", "b@z.com"})));
        Check.eqAnyOrder("transitive chain A-B-C",
            acc(new String[]{"Sam", "a@q.com", "b@q.com", "c@q.com", "d@q.com"}),
            () -> s.accountsMerge(acc(new String[]{"Sam", "a@q.com", "b@q.com"}, new String[]{"Sam", "c@q.com", "d@q.com"}, new String[]{"Sam", "b@q.com", "c@q.com"})));
        Check.eqAnyOrder("same naam, alag log",
            acc(new String[]{"Raj", "raj1@k.com"}, new String[]{"Raj", "raj2@k.com"}),
            () -> s.accountsMerge(acc(new String[]{"Raj", "raj1@k.com"}, new String[]{"Raj", "raj2@k.com"})));
        int n = 2000;
        String[][] rows = new String[n + 1000][];
        for (int i = 0; i < n; i++) rows[i] = new String[]{"User", String.format("e%05d@m.com", i), String.format("e%05d@m.com", i + 1)};
        for (int i = 0; i < 1000; i++) rows[n + i] = new String[]{"Solo", String.format("s%05d@m.com", i)};
        List<String> merged = new ArrayList<>();
        merged.add("User");
        TreeSet<String> emails = new TreeSet<>();
        for (int i = 0; i <= n; i++) emails.add(String.format("e%05d@m.com", i));
        merged.addAll(emails);
        List<List<String>> expected = new ArrayList<>();
        expected.add(merged);
        for (int i = 0; i < 1000; i++) expected.add(List.of("Solo", String.format("s%05d@m.com", i)));
        Check.eqAnyOrder("bada: 2000 accounts ki chain + 1000 solo", expected, () -> s.accountsMerge(acc(rows)));
    }
}`,
      hints: [
        "DSU on account index. <code>Map&lt;String, Integer&gt; owner</code>: email → pehla account index.",
        "Har account i ke har email: owner mein nahi → <code>owner.put(email, i)</code>, hai → <code>union(i, owner.get(email))</code>.",
        "Phir <code>Map&lt;Integer, TreeSet&lt;String&gt;&gt;</code> mein <code>find(owner.get(email))</code> ke hisaab se emails daalo; har group ke aage naam lagao."
      ],
      solution: `import java.util.*;

class Solution {
    private int[] parent;

    List<List<String>> accountsMerge(List<List<String>> accounts) {
        int n = accounts.size();
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        Map<String, Integer> owner = new HashMap<>();
        for (int i = 0; i < n; i++) {
            List<String> acc = accounts.get(i);
            for (int j = 1; j < acc.size(); j++) {
                String email = acc.get(j);
                Integer prev = owner.putIfAbsent(email, i);
                if (prev != null) parent[find(i)] = find(prev);
            }
        }
        Map<Integer, TreeSet<String>> groups = new HashMap<>();
        for (Map.Entry<String, Integer> e : owner.entrySet()) {
            groups.computeIfAbsent(find(e.getValue()), k -> new TreeSet<>()).add(e.getKey());
        }
        List<List<String>> out = new ArrayList<>();
        for (Map.Entry<Integer, TreeSet<String>> g : groups.entrySet()) {
            List<String> row = new ArrayList<>();
            row.add(accounts.get(g.getKey()).get(0));
            row.addAll(g.getValue());
            out.add(row);
        }
        return out;
    }

    private int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}`,
      explain: "<p><b>Approach:</b> DSU on accounts; common email unko jodta hai. Phir root ke hisaab se emails ka TreeSet (sorted + unique), aage naam.</p><p><b>Time:</b> O(E α(n) + E log E), E = total emails. <b>Space:</b> O(E). Alternative: emails ko graph nodes banao aur DFS se components.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> DSU template ratke rakho (init, find with compression, union by rank, components count). Interviewer \"DFS se bhi ho sakta hai?\" puche to bolo: static graph pe DFS bhi O(V + E) hai, par jab edges <b>dheere dheere aate hain</b> aur beech beech mein connectivity puchhi jaati hai, tab DSU jeet-ta hai."
    }
  ],
  references: [
    { title: "Number of Provinces", by: "LeetCode", url: "https://leetcode.com/problems/number-of-provinces/", type: "article" },
    { title: "Redundant Connection", by: "LeetCode", url: "https://leetcode.com/problems/redundant-connection/", type: "article" },
    { title: "Accounts Merge", by: "LeetCode", url: "https://leetcode.com/problems/accounts-merge/", type: "article" },
    { title: "Striver A2Z DSA sheet (Graphs: Disjoint Set)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "NeetCode roadmap (Graphs)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
