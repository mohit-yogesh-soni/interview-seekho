// Backtracking
registerLesson("dsa", "backtracking", {
  why: "\"Saare combinations / permutations / subsets do\" ya \"grid mein word hai kya\": in sab ka ek hi template hai: choose → explore → un-choose. Interviewer dekhta hai ki aap recursion tree draw kar sakte ho, duplicate answers rok sakte ho, aur pruning se kaam kam kar sakte ho.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Backtracking kya hai?</h2>
        <p>Socho Zomato pe ₹500 ka order banana hai aur menu ke items se saare combinations dekhne hain. Aap ek item <b>choose</b> karte ho, aage <b>explore</b> karte ho (aur items), aur wapas aa ke wo item <b>hata</b> dete ho (un-choose) taaki agla option try ho sake. Yahi backtracking hai: decision tree pe DFS.</p>
        <pre class="code-static">void backtrack(state, choices) {
    if (state complete/valid) { result.add(copy of state); return; }
    for (choice : choices) {
        if (choice allowed nahi) continue;   // pruning
        choose(choice);                      // state mein daalo
        backtrack(state, remaining choices); // explore
        unchoose(choice);                    // wapas pehle jaisa
    }
}</pre>
        <h2>Signals</h2>
        <ul>
          <li>"All possible", "generate all", "list every" (subsets, permutations, combinations)</li>
          <li>Constraints chhote: n ≤ 10-20 (answer khud exponential size ka hai)</li>
          <li>Grid/board pe path dhoondhna jahan cell dobara use nahi hota (Word Search, N-Queens, Sudoku)</li>
        </ul>
        <h2>Complexity ka andaza</h2>
        <table>
          <tr><th>Problem</th><th>Answers kitne</th><th>Time</th></tr>
          <tr><td>Subsets of n</td><td>2ⁿ</td><td>O(n · 2ⁿ)</td></tr>
          <tr><td>Permutations of n</td><td>n!</td><td>O(n · n!)</td></tr>
          <tr><td>Word Search (grid m×n, word L)</td><td>-</td><td>O(m · n · 3ᴸ)</td></tr>
        </table>
        <p>n = 20 pe 2²⁰ ≈ 10 lakh (theek), par 20! ≈ 2.4 × 10¹⁸ (impossible). Isliye constraints dekh ke pattern pehchaano.</p>`
    },
    {
      type: "steps",
      title: "Subsets of [1, 2, 3]: decision tree (har level pe 'start' se aage ke elements)",
      steps: [
        { title: "Root: path = []", html: `<pre class="diagram">[]                 ← result mein add
</pre><p>Har node pe current path result mein jaata hai (subsets mein har node ek answer hai).</p>` },
        { title: "Choose 1 → [1], phir uske neeche 2, 3", html: `<pre class="diagram">[]
├── [1]
│   ├── [1,2]
│   │   └── [1,2,3]
│   └── [1,3]
</pre><p>[1,2,3] ke baad un-choose 3, un-choose 2, phir 3 choose → [1,3].</p>` },
        { title: "Un-choose 1, choose 2 → [2]", html: `<pre class="diagram">[]
├── [1] ...
├── [2]
│   └── [2,3]
</pre><p>2 ke baad sirf 3 (start index aage badhta hai), isliye [2,1] dobara nahi banta.</p>` },
        { title: "Choose 3 → [3]. Total 8", html: `<pre class="diagram">[]
├── [1]
│   ├── [1,2]
│   │   └── [1,2,3]
│   └── [1,3]
├── [2]
│   └── [2,3]
└── [3]
</pre><p>8 = 2³ subsets. <b>start index</b> ki wajah se duplicates (jaise [2,1]) nahi bane.</p>` }
      ]
    },
    {
      type: "code",
      title: "Template: subsets (start index) aur permutations (used[] array)",
      code: `import java.util.*;

public class Main {
    static void subsets(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));              // copy!
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);                       // choose
            subsets(nums, i + 1, path, out);         // explore
            path.remove(path.size() - 1);            // un-choose
        }
    }

    static void perms(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.add(nums[i]);
            perms(nums, used, path, out);
            used[i] = false; path.remove(path.size() - 1);
        }
    }

    public static void main(String[] args) {
        List<List<Integer>> a = new ArrayList<>(), b = new ArrayList<>();
        subsets(new int[]{1, 2, 3}, 0, new ArrayList<>(), a);
        perms(new int[]{1, 2, 3}, new boolean[3], new ArrayList<>(), b);
        System.out.println("subsets: " + a);
        System.out.println("perms:   " + b);
    }
}`,
      note: "<b>Copy</b> (<code>new ArrayList&lt;&gt;(path)</code>) bhoolna sabse common bug hai: bina copy ke result mein same list ka reference baar baar jaata hai, aur end mein sab khaali dikhte hain."
    },
    {
      type: "think",
      id: "think-subsets",
      q: "<b>Subsets:</b> unique integers ka array, saare possible subsets (power set) chahiye. Backtracking se kaise? Ek non-recursive tareeka bhi batao. Complexity?",
      rubric: [
        { point: "Har call pe current path <b>result mein add</b>, phir start se aage ke elements choose", keys: ["start", "i + 1", "start index", "har node", "add path"], weight: 2 },
        { point: "Choose → recurse → <b>remove</b> (un-choose)", keys: ["remove", "un-choose", "unchoose", "backtrack", "hatao"], weight: 2 },
        { point: "Alternative: <b>bitmask</b> 0..2ⁿ-1 ya iterative (har element ko existing subsets mein jodo)", keys: ["bitmask", "bit", "1 << n", "iterative", "2^n loop"] },
        { point: "O(n · 2ⁿ) time", keys: ["2^n", "2ⁿ", "n * 2", "n·2", "exponential"], weight: 2 }
      ],
      answer: `<p>Backtrack(start, path): path ki copy result mein. Phir <code>i = start..n-1</code>: add nums[i], backtrack(i + 1), remove. Start index se har subset ek hi order mein banta hai.</p>
        <p>Bitmask: mask 0 se 2ⁿ - 1; jis bit pe 1 ho wo element subset mein. Dono O(n · 2ⁿ) time (2ⁿ subsets, har ek copy O(n)).</p>`
    },
    {
      type: "exercise",
      id: "ex-subsets",
      title: "Subsets",
      level: "Medium",
      task: `<p>Given an array <code>nums</code> of <b>distinct</b> integers, return every possible subset (the power set), including the empty subset. The result must not contain duplicate subsets. Subsets, and the elements inside each subset, may be in any order.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 12</li><li>-10⁹ ≤ nums[i] ≤ 10⁹</li><li>All values in nums are distinct</li></ul><p><a href="https://leetcode.com/problems/subsets/" target="_blank">LeetCode 78</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
Explanation: 2³ = 8 subsets.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [0]
Output: [[],[0]]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<Integer>> subsets(int[] nums) {
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<List<Integer>> bySet(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << nums.length); mask++) {
            List<Integer> sub = new ArrayList<>();
            for (int i = 0; i < nums.length; i++) if ((mask >> i & 1) == 1) sub.add(nums[i]);
            out.add(sub);
        }
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrderDeep("[1,2,3]", List.of(List.of(), List.of(1), List.of(2), List.of(1, 2), List.of(3), List.of(1, 3), List.of(2, 3), List.of(1, 2, 3)), () -> s.subsets(new int[]{1, 2, 3}));
        Check.eqAnyOrderDeep("[0]", List.of(List.of(), List.of(0)), () -> s.subsets(new int[]{0}));
        Check.hiddenFromHere();
        Check.eqAnyOrderDeep("negatives [-1,5]", List.of(List.of(), List.of(-1), List.of(5), List.of(-1, 5)), () -> s.subsets(new int[]{-1, 5}));
        int[] four = {4, 1, 9, 7};
        Check.eqAnyOrderDeep("[4,1,9,7] (16 subsets)", bySet(four), () -> s.subsets(four));
        int[] big = {3, -2, 8, 0, 11, 5, -7, 6, 1, 10, -4, 2};
        Check.eqAnyOrderDeep("bada: n=12 (4096 subsets)", bySet(big), () -> s.subsets(big));
    }
}`,
      hints: [
        "Helper <code>backtrack(nums, start, path, out)</code>; shuru mein <code>out.add(new ArrayList&lt;&gt;(path))</code>.",
        "<code>for (int i = start; i &lt; nums.length; i++)</code>: add, <code>backtrack(i + 1)</code>, remove.",
        "Ya bitmask: <code>for mask in 0..(1 &lt;&lt; n) - 1</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), out);
        return out;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, out);
            path.remove(path.size() - 1);
        }
    }
}`,
      explain: "<p><b>Approach:</b> start index wala backtracking; har recursion node ek subset hai.</p><p><b>Time:</b> O(n · 2ⁿ). <b>Space:</b> O(n) recursion (output alag).</p>"
    },
    {
      type: "think",
      id: "think-perms",
      q: "<b>Permutations:</b> unique integers ke saare orderings chahiye. Subsets se kya alag hai? Kaunsa element use ho chuka hai, kaise track karoge?",
      rubric: [
        { point: "Har position pe <b>saare unused</b> elements try (start index nahi)", keys: ["unused", "saare", "i = 0", "har element", "start nahi"], weight: 2 },
        { point: "<b>used[] boolean array</b> (ya swap technique)", keys: ["used", "boolean", "visited", "swap"], weight: 2 },
        { point: "Path length == n pe result add", keys: ["== n", "length", "size() ==", "poora", "full"] },
        { point: "O(n · n!)", keys: ["n!", "factorial", "n * n!", "n·n!"], weight: 2 }
      ],
      answer: `<p>Permutation mein order matter karta hai: [1,2] aur [2,1] alag hain. Isliye har level pe <code>i = 0..n-1</code> se loop, aur <code>used[i]</code> se check ki element already path mein to nahi. Path size n hone pe copy result mein.</p>
        <p>Swap technique: position <code>k</code> pe <code>nums[k..n-1]</code> mein se har element swap karke laao, recurse(k + 1), swap wapas. Dono O(n · n!) time.</p>`
    },
    {
      type: "exercise",
      id: "ex-permutations",
      title: "Permutations",
      level: "Medium",
      task: `<p>Given an array <code>nums</code> of distinct integers, return all possible orderings (permutations) of its elements, in any order.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 7</li><li>-10⁹ ≤ nums[i] ≤ 10⁹</li><li>All values are distinct</li></ul><p><a href="https://leetcode.com/problems/permutations/" target="_blank">LeetCode 46</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
Explanation: 3! = 6 permutations.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [0,1]
Output: [[0,1],[1,0]]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<Integer>> permute(int[] nums) {
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    // Reference: insertion method (har naya element har position pe daalo)
    static List<List<Integer>> ref(int[] nums) {
        List<List<Integer>> cur = new ArrayList<>();
        cur.add(new ArrayList<>());
        for (int x : nums) {
            List<List<Integer>> next = new ArrayList<>();
            for (List<Integer> p : cur) {
                for (int pos = 0; pos <= p.size(); pos++) {
                    List<Integer> q = new ArrayList<>(p);
                    q.add(pos, x);
                    next.add(q);
                }
            }
            cur = next;
        }
        return cur;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("[1,2,3]", List.of(List.of(1, 2, 3), List.of(1, 3, 2), List.of(2, 1, 3), List.of(2, 3, 1), List.of(3, 1, 2), List.of(3, 2, 1)), () -> s.permute(new int[]{1, 2, 3}));
        Check.eqAnyOrder("[0,1]", List.of(List.of(0, 1), List.of(1, 0)), () -> s.permute(new int[]{0, 1}));
        Check.hiddenFromHere();
        Check.eqAnyOrder("single [1]", List.of(List.of(1)), () -> s.permute(new int[]{1}));
        Check.eqAnyOrder("negatives [-1,0,2]", ref(new int[]{-1, 0, 2}), () -> s.permute(new int[]{-1, 0, 2}));
        int[] big = {5, -3, 8, 1, 0, 7, 2};
        Check.eqAnyOrder("bada: n=7 (5040 permutations)", ref(big), () -> s.permute(big));
    }
}`,
      hints: [
        "<code>boolean[] used</code> aur <code>List&lt;Integer&gt; path</code>.",
        "Base: <code>path.size() == nums.length</code> → copy add.",
        "Loop <code>i = 0..n-1</code>: <code>if (used[i]) continue;</code> mark, add, recurse, unmark, remove."
      ],
      solution: `import java.util.*;

class Solution {
    List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == nums.length) {
            out.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, out);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`,
      explain: "<p><b>Approach:</b> har position pe har unused element try; used[] se track.</p><p><b>Time:</b> O(n · n!). <b>Space:</b> O(n) recursion + used.</p>"
    },
    {
      type: "think",
      id: "think-comb-sum",
      q: "<b>Combination Sum:</b> distinct positive candidates, har ek <b>unlimited baar</b> use ho sakta hai. Saare unique combinations jinka sum target ho. [2,2,3] aur [3,2,2] same hain. Duplicates kaise rokoge aur kahan prune karoge?",
      rubric: [
        { point: "<b>Start index</b> pass karo; same element dobara lene ke liye recurse(<b>i</b>), i + 1 nahi", keys: ["start", "recurse(i", "same index", "i nahi i+1", "backtrack(i", "i se"], weight: 2 },
        { point: "Remaining &lt; 0 ya candidate &gt; remaining pe <b>prune</b> (sorted ho to break)", keys: ["prune", "break", "remaining < 0", "sort", "bada ho", "> remaining"], weight: 2 },
        { point: "Remaining == 0 pe copy add", keys: ["== 0", "remaining == 0", "target == 0", "zero"] },
        { point: "Exponential time, roughly O(N^(T/min))", keys: ["exponential", "t/m", "target/min", "2^"] }
      ],
      answer: `<p>Candidates sort karo. <code>backtrack(start, remaining, path)</code>: remaining == 0 → copy add. Loop <code>i = start..</code>: agar <code>cand[i] &gt; remaining</code> to <b>break</b> (sorted hai, aage sab bade). Warna add, <code>backtrack(i, remaining - cand[i])</code> (i hi, kyunki dobara use kar sakte hain), remove.</p>
        <p>Start index ki wajah se combination hamesha non-decreasing order mein banta hai, isliye [3,2,2] jaisa duplicate nahi banta. Time exponential: tree ki depth ≤ target / min(candidate).</p>`
    },
    {
      type: "exercise",
      id: "ex-combination-sum",
      title: "Combination Sum",
      level: "Medium",
      task: `<p>Given an array of <b>distinct</b> positive integers <code>candidates</code> and a positive integer <code>target</code>, return all unique combinations of candidates whose sum is <code>target</code>.</p><p>The same candidate may be used any number of times. Two combinations are the same if every number is used the same number of times (order does not matter). Return the combinations in any order.</p><h4>Constraints</h4><ul><li>1 ≤ candidates.length ≤ 30</li><li>2 ≤ candidates[i] ≤ 40, all distinct</li><li>1 ≤ target ≤ 40</li></ul><p><a href="https://leetcode.com/problems/combination-sum/" target="_blank">LeetCode 39</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation: 2 + 2 + 3 = 7 and 7 = 7.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  candidates = [2], target = 1
Output: []</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<Integer>> combinationSum(int[] candidates, int target) {
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    // Har combination valid hai aur unique hai to ginti, warna -1
    static int validCount(List<List<Integer>> res, int[] cand, int target) {
        Set<Integer> allowed = new HashSet<>();
        for (int c : cand) allowed.add(c);
        Set<List<Integer>> seen = new HashSet<>();
        for (List<Integer> combo : res) {
            int sum = 0;
            for (int x : combo) { if (!allowed.contains(x)) return -1; sum += x; }
            if (sum != target) return -1;
            List<Integer> sorted = new ArrayList<>(combo);
            Collections.sort(sorted);
            if (!seen.add(sorted)) return -1;
        }
        return seen.size();
    }

    // DP: kitne combinations (order matter nahi) target banate hain
    static int ways(int[] cand, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int c : cand) for (int t = c; t <= target; t++) dp[t] += dp[t - c];
        return dp[target];
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrderDeep("[2,3,6,7], 7", List.of(List.of(2, 2, 3), List.of(7)), () -> s.combinationSum(new int[]{2, 3, 6, 7}, 7));
        Check.eqAnyOrderDeep("[2,3,5], 8", List.of(List.of(2, 2, 2, 2), List.of(2, 3, 3), List.of(3, 5)), () -> s.combinationSum(new int[]{2, 3, 5}, 8));
        Check.eqAnyOrderDeep("[2], 1", List.of(), () -> s.combinationSum(new int[]{2}, 1));
        Check.hiddenFromHere();
        Check.eqAnyOrderDeep("[1], 2", List.of(List.of(1, 1)), () -> s.combinationSum(new int[]{1}, 2));
        Check.eqAnyOrderDeep("unsorted [8,7,4,3], 11", List.of(List.of(8, 3), List.of(7, 4), List.of(4, 4, 3)), () -> s.combinationSum(new int[]{8, 7, 4, 3}, 11));
        int[] mid = {7, 3, 2};
        Check.eq("[7,3,2], 18: valid + unique count", ways(mid, 18), () -> validCount(s.combinationSum(mid, 18), mid, 18));
        int[] big = {2, 3, 5, 7, 11};
        Check.eq("bada: [2,3,5,7,11], 60: valid + unique count", ways(big, 60), () -> validCount(s.combinationSum(big, 60), big, 60));
    }
}`,
      hints: [
        "Pehle <code>Arrays.sort(candidates)</code>. Helper <code>backtrack(start, remaining, path)</code>.",
        "<code>remaining == 0</code> → copy add. Loop mein <code>if (candidates[i] &gt; remaining) break;</code>",
        "Same number dobara lene ke liye <code>backtrack(i, remaining - candidates[i], ...)</code> (i + 1 nahi)."
      ],
      solution: `import java.util.*;

class Solution {
    List<List<Integer>> combinationSum(int[] candidates, int target) {
        int[] c = candidates.clone();
        Arrays.sort(c);
        List<List<Integer>> out = new ArrayList<>();
        backtrack(c, 0, target, new ArrayList<>(), out);
        return out;
    }

    private void backtrack(int[] c, int start, int remaining, List<Integer> path, List<List<Integer>> out) {
        if (remaining == 0) {
            out.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < c.length; i++) {
            if (c[i] > remaining) break;
            path.add(c[i]);
            backtrack(c, i, remaining - c[i], path, out);
            path.remove(path.size() - 1);
        }
    }
}`,
      explain: "<p><b>Approach:</b> sorted candidates, start index (same i pe dobara allowed), aur bada candidate aate hi break.</p><p><b>Time:</b> exponential, roughly O(N^(T/M) ) jahan M = smallest candidate. <b>Space:</b> O(T/M) recursion depth.</p>"
    },
    {
      type: "think",
      id: "think-word-search",
      q: "<b>Word Search:</b> letters ka grid aur ek word. Kya word adjacent cells (up/down/left/right) se banta hai, jahan ek cell ek hi baar use ho? Visited kaise track karoge bina extra array ke? Complexity?",
      rubric: [
        { point: "Har cell se <b>DFS</b> jab first letter match ho", keys: ["har cell", "each cell", "dfs", "first letter", "start"], weight: 2 },
        { point: "Visited: cell ko temporarily <b>'#'</b> se badlo, wapas aate waqt <b>restore</b>", keys: ["#", "restore", "temporarily", "wapas", "mark", "visited"], weight: 2 },
        { point: "Mismatch ya bahar → false (prune)", keys: ["mismatch", "bahar", "boundary", "prune", "match nahi"] },
        { point: "O(m · n · 3^L) time, O(L) space", keys: ["3^l", "4^l", "3^", "o(l)", "exponential"], weight: 2 }
      ],
      answer: `<p>Har cell (r, c) se <code>dfs(r, c, i)</code>: i == word.length() → true. Bahar ho ya <code>board[r][c] != word[i]</code> → false. Warna <code>board[r][c] = '#'</code> (visited), chaaron padosi pe dfs(i + 1), phir <b>restore</b> original letter.</p>
        <p>Time O(m · n · 3ᴸ): pehle step pe 4 directions, uske baad 3 (jahan se aaye wahan nahi). Space O(L) recursion. Pruning: board mein word ke letters ki ginti kam ho to seedha false.</p>`
    },
    {
      type: "exercise",
      id: "ex-word-search",
      title: "Word Search",
      level: "Medium",
      task: `<p>Given a grid of characters <code>board</code> and a string <code>word</code>, return <code>true</code> if the word can be traced in the grid.</p><p>The word is built from letters of cells that are next to each other <b>horizontally or vertically</b> (not diagonally). A single cell may be used at most once in the same word.</p><p class="small muted">Board used in the examples (row, column):</p><pre class="diagram">      c0  c1  c2  c3
r0    S   E   E   K
r1    H   O   L   O
r2    A   B   C   D

HOLE: H(1,0) → O(1,1) → L(1,2) → E(0,2)</pre><h4>Constraints</h4><ul><li>1 ≤ rows, cols ≤ 6</li><li>1 ≤ word.length ≤ 15</li><li>board and word contain only English letters</li></ul><p><a href="https://leetcode.com/problems/word-search/" target="_blank">LeetCode 79</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  board = [["S","E","E","K"],["H","O","L","O"],["A","B","C","D"]], word = "SEEK"
Output: true
Explanation: The whole first row.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  same board, word = "HOLE"
Output: true
Explanation: See the path in the diagram.</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  same board, word = "SEES"
Output: false
Explanation: After S-E-E there is no unused S next to the last E.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    boolean exist(char[][] board, String word) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    static char[][] b(String... rows) {
        char[][] out = new char[rows.length][];
        for (int i = 0; i < rows.length; i++) out[i] = rows[i].toCharArray();
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        String[] g = {"SEEK", "HOLO", "ABCD"};
        Check.eq("SEEK", true, () -> s.exist(b(g), "SEEK"));
        Check.eq("HOLE (turn leta hai)", true, () -> s.exist(b(g), "HOLE"));
        Check.eq("SEES (cell reuse nahi)", false, () -> s.exist(b(g), "SEES"));
        Check.hiddenFromHere();
        Check.eq("SHAB (neeche ki taraf)", true, () -> s.exist(b(g), "SHAB"));
        Check.eq("KOD", true, () -> s.exist(b(g), "KOD"));
        Check.eq("EKE (K ke baad E reuse karna padega)", false, () -> s.exist(b(g), "EKE"));
        Check.eq("single cell match", true, () -> s.exist(b("A"), "A"));
        Check.eq("single cell no match", false, () -> s.exist(b("A"), "B"));
        Check.eq("word cells se lamba", false, () -> s.exist(b("AB", "CD"), "ABDCA"));
        String[] allA = {"AAAAA", "AAAAA", "AAAAA", "AAAAA", "AAAAA"};
        Check.eq("bada: 5x5 sab A, word AAAAAAAAAAB (worst case)", false, () -> s.exist(b(allA), "AAAAAAAAAAB"));
        Check.eq("5x5 sab A, word 10 A", true, () -> s.exist(b(allA), "AAAAAAAAAA"));
    }
}`,
      hints: [
        "Har cell se <code>dfs(board, word, r, c, 0)</code>; koi true de to true.",
        "dfs: <code>i == word.length()</code> → true. Bahar / letter mismatch → false.",
        "<code>char tmp = board[r][c]; board[r][c] = '#';</code> chaaron directions, phir <code>board[r][c] = tmp;</code>"
      ],
      solution: `class Solution {
    boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, String word, int r, int c, int i) {
        if (i == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(i)) return false;
        char tmp = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, i + 1) || dfs(board, word, r - 1, c, i + 1)
                || dfs(board, word, r, c + 1, i + 1) || dfs(board, word, r, c - 1, i + 1);
        board[r][c] = tmp;
        return found;
    }
}`,
      explain: "<p><b>Approach:</b> har cell se DFS + backtracking; visited ke liye cell ko '#' karke restore.</p><p><b>Time:</b> O(m · n · 3ᴸ). <b>Space:</b> O(L) recursion. Pruning idea: pehle check karo ki board mein word ke har letter ki ginti kaafi hai; aur agar word ka last letter board mein kam baar aata hai to word ko ulta karke search karo.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Backtracking code se pehle chhota recursion tree (2-3 levels) bana ke dikhao aur bolo: \"har level pe ye choice hai, base case ye hai, aur duplicates start index se rokunga.\" Phir complexity output size se batao (2ⁿ, n!). Interviewer ko pata chalta hai ki aap blindly recursion nahi likh rahe."
    }
  ],
  references: [
    { title: "Subsets", by: "LeetCode", url: "https://leetcode.com/problems/subsets/", type: "article" },
    { title: "Permutations", by: "LeetCode", url: "https://leetcode.com/problems/permutations/", type: "article" },
    { title: "Combination Sum", by: "LeetCode", url: "https://leetcode.com/problems/combination-sum/", type: "article" },
    { title: "Word Search", by: "LeetCode", url: "https://leetcode.com/problems/word-search/", type: "article" },
    { title: "Striver (takeUforward) YouTube: Recursion & Backtracking", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" }
  ]
});
