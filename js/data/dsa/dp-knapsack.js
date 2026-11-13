// Knapsack type DP
registerLesson("dsa", "dp-knapsack", {
  why: "\"Har item ko lo ya chhodo, aur total ek limit/target ke barabar ho\": ye 0/1 knapsack hai, aur Partition, Target Sum, subset sum jaise kai interview problems isi ke disguise hain. 1D array mein ulta loop kyun chalta hai, ye samjhaana senior-level detail hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>0/1 Knapsack</h2>
        <p>Flipkart ka delivery bag 10 kg tak le ja sakta hai. Har parcel ka weight aur delivery fee hai. Kaunse parcels lo ki fee max ho? Har parcel ya to <b>poora lo</b> ya <b>chhodo</b> (0/1), tod nahi sakte. Greedy (best fee/kg pehle) yahan fail hota hai.</p>
        <p><b>State:</b> <code>dp[i][w]</code> = pehle i items se, capacity w mein max value.<br>
        <b>Transition:</b> <code>dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i])</code> (chhodo, ya lo agar fit ho).</p>
        <h2>1D optimization aur ulta loop</h2>
        <p>Row i sirf row i-1 pe depend karti hai, to ek hi array <code>dp[w]</code> kaafi hai. Par loop <b>w = W se neeche</b> chalana padta hai:</p>
        <ul>
          <li>Ulta (W → wt): <code>dp[w - wt]</code> abhi bhi <b>purani row</b> ki value hai → har item max ek baar. <b>0/1 knapsack.</b></li>
          <li>Seedha (wt → W): <code>dp[w - wt]</code> isi item se update ho chuka ho sakta hai → item kai baar use. Ye <b>unbounded knapsack</b> hai (Coin Change).</li>
        </ul>
        <h2>Signals</h2>
        <ul>
          <li>"Subset choose karo jiska sum = target" / "do groups mein baanto"</li>
          <li>Har element pe 2 choices (lo/chhodo, + ya -)</li>
          <li>Target/sum chhota hai (≤ 10⁴ approx), to dp[sum] array ban sakta hai</li>
        </ul>
        <table>
          <tr><th>Problem</th><th>Knapsack mein badlo</th></tr>
          <tr><td>Partition Equal Subset Sum</td><td>Subset with sum = total / 2 hai kya? (boolean)</td></tr>
          <tr><td>Target Sum (+/-)</td><td>Positive group ka sum P = (total + target) / 2, kitne subsets? (count)</td></tr>
          <tr><td>Last Stone Weight II</td><td>total/2 ke sabse paas subset sum</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Template: 0/1 knapsack (2D aur 1D ulta loop)",
      code: `public class Main {
    static int knapsack2D(int[] wt, int[] val, int W) {
        int n = wt.length;
        int[][] dp = new int[n + 1][W + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= W; w++) {
                dp[i][w] = dp[i - 1][w];                                   // chhodo
                if (wt[i - 1] <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]); // lo
            }
        }
        return dp[n][W];
    }

    static int knapsack1D(int[] wt, int[] val, int W) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < wt.length; i++) {
            for (int w = W; w >= wt[i]; w--) {          // ULTA: har item ek hi baar
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
        return dp[W];
    }

    public static void main(String[] args) {
        int[] wt = {1, 3, 4, 5}, val = {20, 50, 60, 90};
        System.out.println("2D: " + knapsack2D(wt, val, 8));   // 3 + 5 kg → 50 + 90 = 140
        System.out.println("1D: " + knapsack1D(wt, val, 8));

        // Galti dikhao: seedha loop item ko kai baar le leta hai
        int[] dp = new int[9];
        for (int i = 0; i < wt.length; i++)
            for (int w = wt[i]; w <= 8; w++) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
        System.out.println("seedha loop (unbounded, galat for 0/1): " + dp[8]);
    }
}`,
      note: "Seedha loop wala answer 0/1 se zyada aata hai kyunki wo 1 kg wala item (fee 20) 8 baar le leta hai (160). Yahi bug interview mein pakda jaata hai."
    },
    {
      type: "steps",
      title: "Subset sum dry run: [1, 5, 11, 5], target 11 (dp[s] = sum s ban sakta hai?)",
      steps: [
        { title: "Shuru: sirf dp[0] = true (khaali subset)", html: `<div class="arr"><span class="cell ok">0</span><span class="cell dim">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span><span class="cell dim">5</span><span class="cell dim">6</span><span class="cell dim">7</span><span class="cell dim">8</span><span class="cell dim">9</span><span class="cell dim">10</span><span class="cell dim">11</span></div><p>Green = ye sum ban sakta hai.</p>` },
        { title: "Item 1: s = 11..1 ulta, dp[s] |= dp[s-1]", html: `<div class="arr"><span class="cell ok">0</span><span class="cell hl">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span><span class="cell dim">5</span><span class="cell dim">6</span><span class="cell dim">7</span><span class="cell dim">8</span><span class="cell dim">9</span><span class="cell dim">10</span><span class="cell dim">11</span></div><p>Sirf dp[1] naya. (Seedha loop hota to dp[2], dp[3]... bhi ban jaate, matlab 1 ko baar baar use kiya.)</p>` },
        { title: "Item 5: dp[6] (1+5), dp[5] (5)", html: `<div class="arr"><span class="cell ok">0</span><span class="cell ok">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span><span class="cell hl">5</span><span class="cell hl">6</span><span class="cell dim">7</span><span class="cell dim">8</span><span class="cell dim">9</span><span class="cell dim">10</span><span class="cell dim">11</span></div>` },
        { title: "Item 11: dp[11] (0+11) → target mil gaya", html: `<div class="arr"><span class="cell ok">0</span><span class="cell ok">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span><span class="cell ok">5</span><span class="cell ok">6</span><span class="cell dim">7</span><span class="cell dim">8</span><span class="cell dim">9</span><span class="cell dim">10</span><span class="cell hl">11</span></div><p>dp[11] = true. Partition problem mein total = 22, half = 11, to answer <b>true</b>: {11} aur {1, 5, 5}.</p>` },
        { title: "Item 5 (doosra): dp[10] (5+5), dp[11] already", html: `<div class="arr"><span class="cell ok">0</span><span class="cell ok">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span><span class="cell ok">5</span><span class="cell ok">6</span><span class="cell dim">7</span><span class="cell dim">8</span><span class="cell dim">9</span><span class="cell hl">10</span><span class="cell ok">11</span></div><p>Time O(n × target), space O(target).</p>` }
      ]
    },
    {
      type: "quiz",
      q: "1D 0/1 knapsack mein inner loop <code>for (w = wt[i]; w &lt;= W; w++)</code> (seedha) likh diya. Kya hoga?",
      options: [
        "Kuch farak nahi, sirf order badla",
        "Ek item kai baar count ho sakta hai, answer unbounded knapsack ka aayega",
        "ArrayIndexOutOfBounds",
        "Answer hamesha 0 aayega"
      ],
      answer: 1,
      why: "Seedhe loop mein <code>dp[w - wt]</code> isi item ke saath pehle hi update ho chuka hota hai, to same item dobara jud jaata hai. 0/1 ke liye ulta loop (W se neeche) chahiye."
    },
    {
      type: "think",
      id: "think-partition",
      q: "<b>Partition Equal Subset Sum:</b> positive integers ko do groups mein baantna hai jinka sum barabar ho. Possible hai? Isko knapsack mein kaise badloge, aur kaunsa quick check pehle karoge?",
      rubric: [
        { point: "Total <b>odd</b> → turant false", keys: ["odd", "total % 2", "sum % 2", "vishm", "even nahi"], weight: 2 },
        { point: "Subset with sum = <b>total / 2</b> dhoondho (subset sum)", keys: ["total / 2", "sum / 2", "half", "aadha", "subset sum", "target = sum/2"], weight: 2 },
        { point: "boolean <b>dp[s]</b>, items pe loop, s <b>ulta</b>", keys: ["boolean", "dp[s]", "ulta", "reverse", "backward", "w--", "s--"], weight: 2 },
        { point: "O(n × sum/2) time, O(sum) space", keys: ["n × sum", "n * sum", "o(n*", "o(sum", "n·sum"] }
      ],
      answer: `<p>Sum odd ho to do barabar hisse ho hi nahi sakte: false. Warna target = total / 2; kya koi subset target sum banata hai? Baaki apne aap doosra half hai.</p>
        <p><code>boolean[] dp = new boolean[target + 1]; dp[0] = true;</code> har num ke liye <code>for s = target down to num: dp[s] |= dp[s - num]</code>. Early exit: dp[target] true hote hi return. Time O(n × target), space O(target). Brute force 2ⁿ subsets.</p>`
    },
    {
      type: "exercise",
      id: "ex-partition",
      title: "Partition Equal Subset Sum",
      level: "Medium",
      task: `<p>Given an array of positive integers <code>nums</code>, return <code>true</code> if it can be split into two subsets with equal sums (every element goes into exactly one subset).</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 200</li><li>1 ≤ nums[i] ≤ 100</li></ul><p><a href="https://leetcode.com/problems/partition-equal-subset-sum/" target="_blank">LeetCode 416</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,5,11,5]
Output: true
Explanation: {1,5,5} and {11} both sum to 11.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1,2,3,5]
Output: false
Explanation: The total is 11, which is odd.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    boolean canPartition(int[] nums) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,5,11,5]", true, () -> s.canPartition(new int[]{1, 5, 11, 5}));
        Check.eq("[1,2,3,5]", false, () -> s.canPartition(new int[]{1, 2, 3, 5}));
        Check.hiddenFromHere();
        Check.eq("single [1]", false, () -> s.canPartition(new int[]{1}));
        Check.eq("[2,2]", true, () -> s.canPartition(new int[]{2, 2}));
        Check.eq("sum even par possible nahi [1,2,5]", false, () -> s.canPartition(new int[]{1, 2, 5}));
        Check.eq("[3,3,3,4,5]", true, () -> s.canPartition(new int[]{3, 3, 3, 4, 5}));
        int[] seq = new int[200];
        for (int i = 0; i < 200; i++) seq[i] = i + 1;
        Check.eq("bada: 1..200", true, () -> s.canPartition(seq));
        int[] tricky = new int[201];
        for (int i = 0; i < 199; i++) tricky[i] = 100;
        tricky[199] = 1;
        tricky[200] = 1;
        Check.eq("bada: 199 x 100 + [1,1] (even sum, par false)", false, () -> s.canPartition(tricky));
    }
}`,
      hints: [
        "Total sum odd → false. Target = sum / 2.",
        "<code>boolean[] dp = new boolean[target + 1]; dp[0] = true;</code>",
        "<code>for (int x : nums) for (int t = target; t &gt;= x; t--) dp[t] |= dp[t - x];</code> → <code>return dp[target];</code>"
      ],
      solution: `class Solution {
    boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 == 1) return false;
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int x : nums) {
            for (int t = target; t >= x; t--) dp[t] |= dp[t - x];
            if (dp[target]) return true;
        }
        return dp[target];
    }
}`,
      explain: "<p><b>Approach:</b> subset sum to total/2, 0/1 knapsack ka boolean version, ulta loop.</p><p><b>Time:</b> O(n × sum/2). <b>Space:</b> O(sum/2). Bitset trick (<code>BitSet</code> shift-or) se aur fast ho sakta hai.</p>"
    },
    {
      type: "think",
      id: "think-target-sum",
      q: "<b>Target Sum:</b> har number ke aage + ya - lagao; kitne tareekon se total = target? Brute force 2ⁿ hai. Isko \"kitne subsets ka sum = P\" mein kaise badloge? Formula derive karo.",
      rubric: [
        { point: "Plus group P, minus group N: <b>P - N = target</b>, <b>P + N = total</b>", keys: ["p - n", "p + n", "plus group", "minus group", "positive group"], weight: 2 },
        { point: "To <b>P = (total + target) / 2</b>", keys: ["(total + target) / 2", "(sum + target) / 2", "sum+target", "total+target", "/ 2"], weight: 2 },
        { point: "Odd ya |target| &gt; total → 0", keys: ["odd", "abs", "|target|", "> total", "> sum", "negative"] },
        { point: "Count DP: <b>dp[s] += dp[s - x]</b>, ulta loop, dp[0] = 1", keys: ["dp[s] +=", "count", "dp[0] = 1", "ways", "+="], weight: 2 }
      ],
      answer: `<p>Plus wale numbers ka sum P, minus walon ka N. <code>P - N = target</code> aur <code>P + N = total</code> → <code>P = (total + target) / 2</code>. Ab sawaal: kitne subsets ka sum P hai?</p>
        <p>Agar <code>total + target</code> odd hai ya <code>|target| &gt; total</code> → 0. Warna <code>int[] dp = new int[P + 1]; dp[0] = 1;</code> har x: <code>for s = P down to x: dp[s] += dp[s - x]</code>. Zeros apne aap handle hote hain (har 0 ways ko double karta hai: +0 aur -0). Time O(n × P).</p>`
    },
    {
      type: "exercise",
      id: "ex-target-sum",
      title: "Target Sum",
      level: "Medium",
      task: `<p>Given a non-negative integer array <code>nums</code> and an integer <code>target</code>, put a <code>+</code> or <code>-</code> sign in front of every number and add them all. Return how many different sign assignments give exactly <code>target</code>.</p><p>A hidden test has n = 30, so trying all 2³⁰ assignments is too slow.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 30</li><li>0 ≤ nums[i] ≤ 1000</li><li>-1000 ≤ target ≤ 1000</li></ul><p><a href="https://leetcode.com/problems/target-sum/" target="_blank">LeetCode 494</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,1,1,1,1], target = 3
Output: 5
Explanation: Exactly one number gets a minus sign, and it can be any of the 5.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1], target = 1
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int findTargetSumWays(int[] nums, int target) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,1,1,1,1], 3", 5, () -> s.findTargetSumWays(new int[]{1, 1, 1, 1, 1}, 3));
        Check.eq("[1], 1", 1, () -> s.findTargetSumWays(new int[]{1}, 1));
        Check.hiddenFromHere();
        Check.eq("[1], 2 (impossible)", 0, () -> s.findTargetSumWays(new int[]{1}, 2));
        Check.eq("zeros [0,0,0], 0", 8, () -> s.findTargetSumWays(new int[]{0, 0, 0}, 0));
        Check.eq("[1,2,1], 0", 2, () -> s.findTargetSumWays(new int[]{1, 2, 1}, 0));
        Check.eq("negative target [1,1,1,1,1], -3", 5, () -> s.findTargetSumWays(new int[]{1, 1, 1, 1, 1}, -3));
        Check.eq("|target| > sum [100], -200", 0, () -> s.findTargetSumWays(new int[]{100}, -200));
        int[] ones = new int[30];
        java.util.Arrays.fill(ones, 1);
        Check.eq("bada: 30 ones, target 0 (C(30,15))", 155117520, () -> s.findTargetSumWays(ones, 0));
    }
}`,
      hints: [
        "P = (total + target) / 2. Odd ya <code>Math.abs(target) &gt; total</code> → 0.",
        "<code>int[] dp = new int[P + 1]; dp[0] = 1;</code>",
        "<code>for (int x : nums) for (int t = P; t &gt;= x; t--) dp[t] += dp[t - x];</code> → <code>dp[P]</code>."
      ],
      solution: `class Solution {
    int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int x : nums) total += x;
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int p = (total + target) / 2;
        int[] dp = new int[p + 1];
        dp[0] = 1;
        for (int x : nums) {
            for (int t = p; t >= x; t--) dp[t] += dp[t - x];
        }
        return dp[p];
    }
}`,
      explain: "<p><b>Approach:</b> algebra se subset-count problem: P = (total + target) / 2, phir 0/1 knapsack count DP.</p><p><b>Time:</b> O(n × P). <b>Space:</b> O(P). Memo recursion (index, current sum) bhi chalta hai: O(n × total) states.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Knapsack-type problem mein pehle <b>transformation</b> bolo (\"ye subset sum to total/2 hai\" ya \"P = (total + target)/2\"). Phir 1D DP likhte waqt khud bolo \"loop ulta chala raha hoon taaki har element ek hi baar use ho\". Ye ek line interviewer ko batati hai ki aap samajh ke likh rahe ho."
    }
  ],
  references: [
    { title: "Partition Equal Subset Sum", by: "LeetCode", url: "https://leetcode.com/problems/partition-equal-subset-sum/", type: "article" },
    { title: "Target Sum", by: "LeetCode", url: "https://leetcode.com/problems/target-sum/", type: "article" },
    { title: "Striver (takeUforward) YouTube: DP on subsequences", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "Striver A2Z DSA sheet (DP section)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
