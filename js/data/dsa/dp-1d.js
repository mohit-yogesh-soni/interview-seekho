// DP 1D
registerLesson("dsa", "dp-1d", {
  why: "Dynamic Programming se log darte hain, par asal mein ye \"recursion + yaad rakhna\" hai. Ek baar recursion → memo → tabulation ka 3-step process aa gaya, to House Robber, Coin Change, LIS jaise sawaal mechanical ho jaate hain. Aur interviewer exactly yahi progression sunna chahta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>DP kab lagta hai?</h2>
        <ul>
          <li><b>Overlapping subproblems:</b> recursion mein same sawaal baar baar aata hai (fib(3) kai baar).</li>
          <li><b>Optimal substructure:</b> bade problem ka best answer chhote problems ke best answers se banta hai.</li>
        </ul>
        <p>Signals: "minimum/maximum ways/cost", "kitne tareeke", "kya possible hai", aur har step pe <b>choice</b> (lo ya chhodo, ye coin ya wo coin). Greedy fail ho raha ho (counter-example mil gaya) to DP socho.</p>
        <h2>3 steps (hamesha isi order mein)</h2>
        <ol>
          <li><b>Recursion:</b> state define karo (<code>f(i)</code> = "index i tak ka best answer") aur transition likho. Ye correct hai par exponential.</li>
          <li><b>Memoization (top-down):</b> same recursion + <code>memo[i]</code> array. Har state ek baar compute. Time = states × har state ka kaam.</li>
          <li><b>Tabulation (bottom-up):</b> chhote i se bade i tak loop se <code>dp[]</code> bharo. Recursion stack nahi, aur aksar sirf last 1-2 values chahiye → O(1) space.</li>
        </ol>
        <pre class="diagram">
fib(5) recursion tree (bina memo):         memo ke saath:
             f5                            f5 → f4 → f3 → f2 → f1
          /      \\                         (har ek sirf ek baar)
        f4        f3                       O(n) instead of O(2^n)
       /  \\      /  \\
     f3    f2   f2   f1
    /  \\
  f2    f1      ← f3, f2 baar baar ban rahe hain
</pre>
        <p><b>Interview mein:</b> pehle state aur transition bolo ("dp[i] = max(dp[i-1], dp[i-2] + nums[i])"), phir base case, phir order of filling. Code baad mein.</p>`
    },
    {
      type: "code",
      title: "Template: same problem teen tareeke se (climbing stairs: 1 ya 2 step)",
      code: `import java.util.*;

public class Main {
    static int calls = 0;

    // 1. Recursion: ways(n) = ways(n-1) + ways(n-2)
    static int rec(int n) {
        calls++;
        if (n <= 1) return 1;
        return rec(n - 1) + rec(n - 2);
    }

    // 2. Memoization
    static int memo(int n, int[] m) {
        if (n <= 1) return 1;
        if (m[n] != 0) return m[n];
        return m[n] = memo(n - 1, m) + memo(n - 2, m);
    }

    // 3. Tabulation + space optimization (sirf last 2 values)
    static int tab(int n) {
        int prev2 = 1, prev1 = 1;          // ways(0), ways(1)
        for (int i = 2; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }

    public static void main(String[] args) {
        int n = 30;
        System.out.println("recursion: " + rec(n) + " (calls = " + calls + ")");
        System.out.println("memo:      " + memo(n, new int[n + 1]));
        System.out.println("tabulation:" + tab(n));
    }
}`,
      note: "n = 30 pe plain recursion ~27 lakh calls karta hai; memo sirf ~30 states. n = 45 pe recursion seconds lega, memo turant."
    },
    {
      type: "steps",
      title: "House Robber dp dry run: [2, 7, 9, 3, 1]",
      steps: [
        { title: "dp[0] = 2 (sirf pehla ghar)", html: `<div class="arr"><span class="cell hl">2</span><span class="cell">7</span><span class="cell">9</span><span class="cell">3</span><span class="cell">1</span></div><div class="arr"><span class="cell ok">2</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>Upar nums, neeche dp. dp[i] = pehle i+1 gharon se max loot.</p>` },
        { title: "dp[1] = max(2, 7) = 7", html: `<div class="arr"><span class="cell">2</span><span class="cell hl">7</span><span class="cell">9</span><span class="cell">3</span><span class="cell">1</span></div><div class="arr"><span class="cell">2</span><span class="cell ok">7</span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div>` },
        { title: "dp[2] = max(dp[1], dp[0] + 9) = max(7, 11) = 11", html: `<div class="arr"><span class="cell">2</span><span class="cell">7</span><span class="cell hl">9</span><span class="cell">3</span><span class="cell">1</span></div><div class="arr"><span class="cell win">2</span><span class="cell">7</span><span class="cell ok">11</span><span class="cell"></span><span class="cell"></span></div><p>Ghar 2 lootna hai to ghar 1 chhodna padega: dp[0] + 9.</p>` },
        { title: "dp[3] = max(11, 7 + 3) = 11", html: `<div class="arr"><span class="cell">2</span><span class="cell">7</span><span class="cell">9</span><span class="cell hl">3</span><span class="cell">1</span></div><div class="arr"><span class="cell">2</span><span class="cell win">7</span><span class="cell">11</span><span class="cell ok">11</span><span class="cell"></span></div>` },
        { title: "dp[4] = max(11, 11 + 1) = 12", html: `<div class="arr"><span class="cell">2</span><span class="cell">7</span><span class="cell">9</span><span class="cell">3</span><span class="cell hl">1</span></div><div class="arr"><span class="cell">2</span><span class="cell">7</span><span class="cell win">11</span><span class="cell">11</span><span class="cell ok">12</span></div><p>Answer 12 (gharon 0, 2, 4: 2 + 9 + 1). Har dp sirf pichhle do pe depend → O(1) space possible.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-robber",
      q: "<b>House Robber:</b> line mein ghar hain, har ghar mein kuch paise. Do <b>adjacent</b> ghar ek raat mein nahi loot sakte (alarm). Max kitna loot sakte ho? State, transition, base case aur space optimization batao.",
      rubric: [
        { point: "State: <b>dp[i]</b> = pehle i ghar tak ka max", keys: ["dp[i]", "state", "i tak", "first i", "pehle i"], weight: 2 },
        { point: "Transition: <b>max(dp[i-1], dp[i-2] + nums[i])</b> (chhodo ya lo)", keys: ["dp[i-1]", "dp[i-2]", "i-1", "i-2", "lo ya chhodo", "skip or take", "max("], weight: 2 },
        { point: "Base: dp[0] = nums[0], dp[1] = max(nums[0], nums[1])", keys: ["base", "dp[0]", "nums[0]"] },
        { point: "Sirf 2 variables → <b>O(1) space</b>, O(n) time", keys: ["o(1)", "two variables", "do variable", "prev", "o(n)"], weight: 2 }
      ],
      answer: `<p>Har ghar pe do choice: <b>lo</b> (to pichhla nahi le sakte: dp[i-2] + nums[i]) ya <b>chhodo</b> (dp[i-1]). <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>.</p>
        <p>Base: dp[0] = nums[0]. dp sirf pichhle do pe depend karta hai, isliye <code>prev2, prev1</code> do variables kaafi. Time O(n), space O(1). Plain recursion O(2ⁿ) hota.</p>`
    },
    {
      type: "exercise",
      id: "ex-house-robber",
      title: "House Robber",
      level: "Medium",
      task: `<p>Houses stand in a row; <code>nums[i]</code> is the money in house i. You cannot rob two <b>adjacent</b> houses on the same night. Return the maximum amount you can rob.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>0 ≤ nums[i] ≤ 400</li></ul><p><a href="https://leetcode.com/problems/house-robber/" target="_blank">LeetCode 198</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3,1]
Output: 4
Explanation: Rob house 0 (1) and house 2 (3).</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [2,7,9,3,1]
Output: 12
Explanation: Rob houses 0, 2 and 4: 2 + 9 + 1.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int rob(int[] nums) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,1]", 4, () -> s.rob(new int[]{1, 2, 3, 1}));
        Check.eq("[2,7,9,3,1]", 12, () -> s.rob(new int[]{2, 7, 9, 3, 1}));
        Check.hiddenFromHere();
        Check.eq("single [5]", 5, () -> s.rob(new int[]{5}));
        Check.eq("[2,1]", 2, () -> s.rob(new int[]{2, 1}));
        Check.eq("zeros", 0, () -> s.rob(new int[]{0, 0, 0}));
        Check.eq("[2,1,1,2] (do chhod ke)", 4, () -> s.rob(new int[]{2, 1, 1, 2}));
        int[] big = new int[100000];
        java.util.Arrays.fill(big, 400);
        Check.eq("bada: 100000 ghar, har ek 400", 20000000, () -> s.rob(big));
    }
}`,
      hints: [
        "Har ghar pe: lo (dp[i-2] + nums[i]) ya chhodo (dp[i-1]).",
        "Do variables: <code>prev2</code> (i-2 tak ka best), <code>prev1</code> (i-1 tak ka best), dono shuru mein 0.",
        "Loop: <code>int cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur;</code>"
      ],
      solution: `class Solution {
    int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
      explain: "<p><b>Approach:</b> dp[i] = max(dp[i-1], dp[i-2] + nums[i]), sirf do variables se.</p><p><b>Time:</b> O(n). <b>Space:</b> O(1). Follow-up: gharon ka circle ho (House Robber II) to do baar chalao: pehla ghar chhod ke, aur aakhri ghar chhod ke.</p>"
    },
    {
      type: "think",
      id: "think-coin-change",
      q: "<b>Coin Change:</b> coins ke denominations (har ek unlimited) aur amount. Minimum kitne coins? Na bane to -1. Greedy (bada coin pehle) kyun fail hota hai? DP state aur transition?",
      rubric: [
        { point: "Greedy fail: coins {1,3,4}, amount 6 → greedy 3, sahi 2", keys: ["greedy", "1,3,4", "{1, 3, 4}", "counter", "fail"] },
        { point: "State: <b>dp[a]</b> = amount a ke liye min coins", keys: ["dp[a]", "dp[amount]", "dp[i]", "amount a", "state"], weight: 2 },
        { point: "Transition: <b>dp[a] = min(dp[a - c] + 1)</b> har coin c ke liye", keys: ["dp[a - c]", "dp[i - c]", "dp[a-c]", "dp[i-coin]", "+ 1", "min("], weight: 2 },
        { point: "Base dp[0] = 0, baaki ∞ (amount + 1); end mein ∞ → -1", keys: ["dp[0] = 0", "infinity", "amount + 1", "max_value", "-1"] },
        { point: "O(amount × coins) time, O(amount) space", keys: ["amount ×", "amount *", "o(amount", "a × c", "n*amount"] }
      ],
      answer: `<p>Greedy fail: {1, 3, 4} se 6 → greedy 4+1+1 (3 coins), sahi 3+3 (2 coins). Isliye DP.</p>
        <p><code>dp[a]</code> = a banane ke min coins. <code>dp[0] = 0</code>, baaki <code>amount + 1</code> (∞ jaisa). Har a = 1..amount aur har coin c ≤ a: <code>dp[a] = min(dp[a], dp[a - c] + 1)</code>. End mein dp[amount] &gt; amount → -1.</p>
        <p>Time O(amount × coins), space O(amount). Ise BFS bhi samajh sakte ho: har amount ek node, har coin ek edge, shortest path = min coins.</p>`
    },
    {
      type: "exercise",
      id: "ex-coin-change",
      title: "Coin Change",
      level: "Medium",
      task: `<p>Given coin denominations <code>coins</code> (unlimited supply of each) and an <code>amount</code>, return the minimum number of coins that add up to exactly <code>amount</code>. Return <code>-1</code> if it cannot be made. For amount 0 the answer is 0.</p><h4>Constraints</h4><ul><li>1 ≤ coins.length ≤ 12</li><li>1 ≤ coins[i] ≤ 2³¹ − 1</li><li>0 ≤ amount ≤ 2 · 10⁴</li></ul><p><a href="https://leetcode.com/problems/coin-change/" target="_blank">LeetCode 322</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  coins = [1,2,5], amount = 11
Output: 3
Explanation: 5 + 5 + 1</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  coins = [2], amount = 3
Output: -1</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  coins = [1], amount = 0
Output: 0</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int coinChange(int[] coins, int amount) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,5], 11", 3, () -> s.coinChange(new int[]{1, 2, 5}, 11));
        Check.eq("[2], 3", -1, () -> s.coinChange(new int[]{2}, 3));
        Check.eq("[1], 0", 0, () -> s.coinChange(new int[]{1}, 0));
        Check.hiddenFromHere();
        Check.eq("greedy trap [1,3,4], 6", 2, () -> s.coinChange(new int[]{1, 3, 4}, 6));
        Check.eq("[2,5,10,1], 27", 4, () -> s.coinChange(new int[]{2, 5, 10, 1}, 27));
        Check.eq("[186,419,83,408], 6249", 20, () -> s.coinChange(new int[]{186, 419, 83, 408}, 6249));
        Check.eq("impossible [4,6], 10001", -1, () -> s.coinChange(new int[]{4, 6}, 10001));
        Check.eq("bada: [7,13,29], 10000", 348, () -> s.coinChange(new int[]{7, 13, 29}, 10000));
        Check.eq("bada: [3,7,405,436], 8839", 25, () -> s.coinChange(new int[]{3, 7, 405, 436}, 8839));
    }
}`,
      hints: [
        "<code>int[] dp = new int[amount + 1]</code>, <code>Arrays.fill(dp, amount + 1)</code>, <code>dp[0] = 0</code>.",
        "<code>for a in 1..amount, for c in coins: if (c &lt;= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);</code>",
        "<code>return dp[amount] &gt; amount ? -1 : dp[amount];</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      explain: "<p><b>Approach:</b> bottom-up DP, dp[a] = min over coins (dp[a - c] + 1).</p><p><b>Time:</b> O(amount × coins). <b>Space:</b> O(amount). <code>amount + 1</code> ko ∞ ki tarah use kiya (MAX_VALUE + 1 overflow karta).</p>"
    },
    {
      type: "think",
      id: "think-lis",
      q: "<b>Longest Increasing Subsequence:</b> array mein sabse lambi strictly increasing subsequence (elements order mein, lagaatar zaroori nahi) ki length. O(n²) DP batao, phir O(n log n) ka idea.",
      rubric: [
        { point: "dp[i] = <b>i pe khatam</b> hone wali LIS ki length", keys: ["dp[i]", "khatam", "ending at", "end at i", "i pe end"], weight: 2 },
        { point: "dp[i] = 1 + max(dp[j]) jahan j &lt; i aur nums[j] &lt; nums[i]; answer max(dp) → O(n²)", keys: ["j < i", "nums[j] < nums[i]", "1 + max", "o(n²)", "o(n^2)", "max(dp"], weight: 2 },
        { point: "O(n log n): <b>tails</b> array + <b>binary search</b> (patience sorting)", keys: ["tails", "binary search", "patience", "lower bound", "n log n", "nlogn"], weight: 2 },
        { point: "tails[k] = length k+1 wali subsequence ka sabse chhota end", keys: ["sabse chhota", "smallest tail", "smallest end", "replace"] }
      ],
      answer: `<p><b>O(n²):</b> <code>dp[i]</code> = nums[i] pe khatam hone wali LIS. <code>dp[i] = 1 + max(dp[j])</code> sab j &lt; i jahan nums[j] &lt; nums[i]. Answer = max(dp).</p>
        <p><b>O(n log n):</b> <code>tails</code> list rakho: tails[k] = length (k+1) ki increasing subsequence ka <b>sabse chhota possible end</b>. Har x ke liye binary search se pehla tails[k] ≥ x dhoondho: mila to replace karo, nahi mila to append. tails ki length = answer. (tails khud LIS nahi hai, sirf length sahi hai.)</p>`
    },
    {
      type: "exercise",
      id: "ex-lis",
      title: "Longest Increasing Subsequence",
      level: "Medium",
      task: `<p>Return the length of the longest <b>strictly increasing subsequence</b> of <code>nums</code>. A subsequence keeps the original order but may skip elements.</p><p>A hidden test has n = 10⁵, so O(n²) times out; you need O(n log n).</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/longest-increasing-subsequence/" target="_blank">LeetCode 300</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: One longest subsequence is [2,3,7,101].</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [0,1,0,3,2,3]
Output: 4</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  nums = [7,7,7,7]
Output: 1
Explanation: Equal values are not strictly increasing.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int lengthOfLIS(int[] nums) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[10,9,2,5,3,7,101,18]", 4, () -> s.lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18}));
        Check.eq("[0,1,0,3,2,3]", 4, () -> s.lengthOfLIS(new int[]{0, 1, 0, 3, 2, 3}));
        Check.eq("[7,7,7,7] (strictly)", 1, () -> s.lengthOfLIS(new int[]{7, 7, 7, 7}));
        Check.hiddenFromHere();
        Check.eq("single", 1, () -> s.lengthOfLIS(new int[]{5}));
        Check.eq("decreasing", 1, () -> s.lengthOfLIS(new int[]{5, 4, 3, 2, 1}));
        Check.eq("negatives [-2,-1]", 2, () -> s.lengthOfLIS(new int[]{-2, -1}));
        Check.eq("[4,10,4,3,8,9]", 3, () -> s.lengthOfLIS(new int[]{4, 10, 4, 3, 8, 9}));
        int n = 100000;
        int[] big = new int[n];
        for (int b = 0; b < 1000; b++) for (int t = 0; t < 100; t++) big[b * 100 + t] = b * 100 + (99 - t);
        Check.eq("bada: n=100000 (1000 decreasing blocks)", 1000, () -> s.lengthOfLIS(big));
        int[] inc = new int[n];
        for (int i = 0; i < n; i++) inc[i] = i - 50000;
        Check.eq("bada: n=100000 increasing", n, () -> s.lengthOfLIS(inc));
    }
}`,
      hints: [
        "O(n²) DP pehle socho, phir n = 10⁵ ke liye tails array.",
        "<code>int[] tails = new int[n]; int len = 0;</code> Har x ke liye tails[0..len) mein lower bound (pehla ≥ x) binary search se.",
        "<code>tails[pos] = x; if (pos == len) len++;</code> End mein <code>return len;</code>"
      ],
      solution: `class Solution {
    int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int len = 0;
        for (int x : nums) {
            int lo = 0, hi = len;
            while (lo < hi) {                    // pehla index jahan tails[i] >= x
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = x;
            if (lo == len) len++;
        }
        return len;
    }
}`,
      explain: "<p><b>Approach:</b> tails array (patience sorting): tails[k] = length k+1 wali increasing subsequence ka sabse chhota end. Har element binary search se apni jagah.</p><p><b>Time:</b> O(n log n). <b>Space:</b> O(n). O(n²) DP (dp[i] = 1 + max dp[j]) bhi interview mein pehle bolo, phir optimize.</p>"
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> seedha tabulation likhne lagna bina state define kiye. Pehle ek line likho: \"dp[i] ka matlab ___ hai\". Agar ye line saaf nahi hai to transition bhi galat hoga. Doosri galti: ∞ ke liye <code>Integer.MAX_VALUE</code> le ke usme +1 karna (overflow → negative)."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> DP ko hamesha is order mein present karo: <b>recursion (brute) → \"same subproblem repeat ho raha hai\" → memo → tabulation → space optimize</b>. Har step pe complexity bolo. Seedha optimized code likhne se zyada marks is progression ke milte hain, kyunki ye dikhata hai ki aapne solution derive kiya hai."
    }
  ],
  references: [
    { title: "House Robber", by: "LeetCode", url: "https://leetcode.com/problems/house-robber/", type: "article" },
    { title: "Coin Change", by: "LeetCode", url: "https://leetcode.com/problems/coin-change/", type: "article" },
    { title: "Longest Increasing Subsequence", by: "LeetCode", url: "https://leetcode.com/problems/longest-increasing-subsequence/", type: "article" },
    { title: "Striver (takeUforward) YouTube: DP series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (1-D DP)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
