// Prefix Sum
registerLesson("dsa", "prefix-sum", {
  why: "\"Range ka sum baar baar chahiye\" ya \"kitne subarrays ka sum k hai\" (negative numbers ke saath) jaise sawaal prefix sum se O(1) per query ya O(n) total ho jaate hain. Sliding window jahan fail hota hai, wahan ye chalta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Idea: pehle se jod ke rakho</h2>
        <p><code>prefix[i]</code> = pehle <code>i</code> elements ka sum (<code>prefix[0] = 0</code>). Phir kisi bhi range <code>[l, r]</code> ka sum:</p>
        <pre class="code-static">sum(l..r) = prefix[r + 1] - prefix[l]</pre>
        <pre class="diagram">
index:      0   1   2   3   4
nums:     [ 3,  1,  4,  1,  5 ]
prefix: [0, 3,  4,  8,  9, 14]

sum(1..3) = prefix[4] - prefix[1] = 9 - 3 = 6   (1 + 4 + 1)
        </pre>
        <p>Example: PhonePe app mein "1 se 15 March tak kitna kharch kiya?" Har din ka running total pehle se rakha ho to answer ek subtraction hai, har baar 15 din jodne nahi padte.</p>
        <h2>Signals</h2>
        <ul>
          <li>Bahut saari <b>range sum queries</b>, data badalta nahi (immutable).</li>
          <li>"Kitne subarrays ka sum = k / divisible by k" aur <b>negative numbers</b> bhi hain.</li>
          <li>"Left ka kuch × right ka kuch" (prefix aur suffix dono): product except self, trapping rain water.</li>
        </ul>
        <table>
          <tr><th></th><th>Brute force</th><th>Prefix sum</th></tr>
          <tr><td>Ek range sum</td><td>O(n)</td><td>O(1) (O(n) ek baar build)</td></tr>
          <tr><td>Q queries</td><td>O(n · Q)</td><td>O(n + Q)</td></tr>
          <tr><td>Subarray sum = k count</td><td>O(n²)</td><td>O(n) with HashMap</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Template: prefix array aur prefix + HashMap",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] nums = {3, 1, 4, 1, 5};
        int n = nums.length;

        // 1. Prefix array (size n+1, prefix[0] = 0 se off-by-one bachta hai)
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        System.out.println("sum(1..3) = " + (prefix[4] - prefix[1]));

        // 2. Prefix + HashMap: kitne subarrays ka sum == k
        //    sum(j+1..i) = P[i] - P[j] == k  =>  P[j] == P[i] - k
        int k = 5;
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(0L, 1);                   // khaali prefix: shuru se subarray ke liye
        long running = 0;
        int count = 0;
        for (int x : nums) {
            running += x;
            count += seen.getOrDefault(running - k, 0);
            seen.merge(running, 1, Integer::sum);
        }
        System.out.println("sum = 5 wale subarrays: " + count);   // [1,4], [4,1], [5]
    }
}`,
      note: "Output 3 aayega: <code>[1,4]</code>, <code>[4,1]</code> aur <code>[5]</code>. <code>seen.put(0, 1)</code> bhoolna sabse common bug hai: uske bina wo subarrays nahi gine jaate jo index 0 se shuru hote hain (jaise <code>nums = [5, ...]</code> mein <code>[5]</code>)."
    },
    {
      type: "steps",
      title: "Prefix + HashMap dry run: nums = [1, 2, 3], k = 3",
      steps: [
        { title: "Shuru", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell">3</span></div><p>running = 0, map = <code>{0:1}</code>, count = 0</p>` },
        { title: "x = 1", html: `<div class="arr"><span class="cell hl">1</span><span class="cell">2</span><span class="cell">3</span></div><p>running = 1. Chahiye running - k = <b>-2</b>: map mein nahi. map = <code>{0:1, 1:1}</code></p>` },
        { title: "x = 2", html: `<div class="arr"><span class="cell win">1</span><span class="cell win hl">2</span><span class="cell">3</span></div><p>running = 3. Chahiye <b>0</b>: map mein 1 baar! count = 1 (subarray [1,2]). map = <code>{0:1, 1:1, 3:1}</code></p>` },
        { title: "x = 3", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell win hl">3</span></div><p>running = 6. Chahiye <b>3</b>: map mein 1 baar (prefix [1,2] ke baad). count = 2 (subarray [3]).</p>` },
        { title: "Answer", html: `<div class="arr"><span class="cell ok">1</span><span class="cell ok">2</span><span class="cell ok">3</span></div><p><b>count = 2</b>: [1,2] aur [3]. Ek pass, O(n).</p>` }
      ]
    },
    {
      type: "think",
      id: "think-subarray-k",
      q: "<b>Subarray Sum Equals K:</b> integers ka array (negative bhi) aur k. Kitne contiguous subarrays ka sum exactly k hai? Sliding window kyun nahi chalega, aur kya chalega?",
      rubric: [
        { point: "Negative numbers se window <b>monotonic nahi</b>, sliding window fail", keys: ["negative", "monotonic", "window nahi", "window fail", "shrink"], weight: 2 },
        { point: "sum(j+1..i) = <b>P[i] - P[j]</b>, to P[j] = P[i] - k chahiye", keys: ["p[i] - k", "prefix - k", "running - k", "sum - k", "prefix[i] - prefix[j]", "p[i]-p[j]"], weight: 2 },
        { point: "<b>HashMap: prefix sum → kitni baar</b> aaya", keys: ["hashmap", "map", "frequency", "count of prefix", "kitni baar"], weight: 2 },
        { point: "<b>map.put(0, 1)</b> shuru mein", keys: ["put(0", "0:1", "0 -> 1", "0→1", "zero prefix", "empty prefix"] },
        { point: "Time O(n), space O(n)", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Sliding window ke liye shrink karne pe sum ka ghatna zaroori hai, jo negative numbers ke saath guaranteed nahi. Isliye prefix sum.</p>
        <p>Subarray <code>(j, i]</code> ka sum <code>P[i] - P[j]</code>. Ye k ho, to <code>P[j] = P[i] - k</code>. Chalte hue har prefix ki frequency HashMap mein rakho, aur har i pe <code>count += map[P[i] - k]</code>. Shuru mein <code>map[0] = 1</code> (khaali prefix).</p>
        <p><b>Time O(n), space O(n).</b> Brute force (har start se running sum) O(n²).</p>`
    },
    {
      type: "exercise",
      id: "ex-subarray-k",
      title: "Subarray Sum Equals K",
      level: "Medium",
      task: `<p>Return the number of <b>contiguous</b>, non-empty subarrays whose sum is exactly <code>k</code>. Numbers may be negative or zero, so a sliding window does not work.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>Values and k fit in int</li></ul><p><a href="https://leetcode.com/problems/subarray-sum-equals-k/" target="_blank">LeetCode 560</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,1,1], k = 2
Output: 2
Explanation: [1,1] at positions 0-1 and 1-2.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1,2,3], k = 3
Output: 2
Explanation: [1,2] and [3].</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int subarraySum(int[] nums, int k) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("nums=[1,1,1], k=2", 2, () -> s.subarraySum(new int[]{1, 1, 1}, 2));
        Check.eq("nums=[1,2,3], k=3", 2, () -> s.subarraySum(new int[]{1, 2, 3}, 3));
        Check.hiddenFromHere();
        Check.eq("negative: [1,-1,0], k=0", 3, () -> s.subarraySum(new int[]{1, -1, 0}, 0));
        Check.eq("zeros: [0,0,0], k=0", 6, () -> s.subarraySum(new int[]{0, 0, 0}, 0));
        Check.eq("single match [5], k=5", 1, () -> s.subarraySum(new int[]{5}, 5));
        Check.eq("single no match [3], k=5", 0, () -> s.subarraySum(new int[]{3}, 5));
        Check.eq("[1,2,1,2,1], k=3", 4, () -> s.subarraySum(new int[]{1, 2, 1, 2, 1}, 3));
        int n = 100000;
        int[] big = new int[n];
        Arrays.fill(big, 1);
        Check.eq("bada input n=1e5 sab 1, k=1000", n - 1000 + 1, () -> s.subarraySum(big, 1000));
    }
}`,
      hints: [
        "<code>running</code> sum rakho. Subarray <code>(j, i]</code> ka sum = <code>running_i - running_j</code>.",
        "Ab tak ke har running sum ki frequency <code>HashMap&lt;Integer, Integer&gt;</code> mein. Shuru mein <code>map.put(0, 1)</code>.",
        "Har element pe: <code>running += x; count += map.getOrDefault(running - k, 0); map.merge(running, 1, Integer::sum);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);                       // khaali prefix
        int running = 0, count = 0;
        for (int x : nums) {
            running += x;
            count += seen.getOrDefault(running - k, 0);   // pehle count
            seen.merge(running, 1, Integer::sum);         // phir daalo
        }
        return count;
    }
}`,
      explain: `<p><b>Approach:</b> prefix sum frequency map. Har i pe dekho kitne purane prefixes <code>running - k</code> the.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Order zaroori hai: pehle count, phir apna prefix daalo. Ulta karne pe k = 0 pe khaali subarray gin jaayega.</p>`
    },
    {
      type: "think",
      id: "think-product",
      q: "<b>Product of Array Except Self:</b> har index i ke liye baaki saare elements ka product chahiye, <b>division ke bina</b>, O(n) mein. Prefix sum wali soch yahan kaise lagegi?",
      rubric: [
        { point: "Answer[i] = <b>left product × right product</b>", keys: ["left", "right", "prefix product", "suffix", "baayein", "daayein"], weight: 2 },
        { point: "Do pass: left se prefix products, right se suffix products", keys: ["two pass", "do pass", "2 pass", "left to right", "right to left", "reverse"], weight: 2 },
        { point: "Division kyun nahi: <b>zero</b> pe toot-ta hai", keys: ["zero", "0 se", "divide by", "division"] },
        { point: "O(1) extra: output array mein left store, phir ek variable se right multiply", keys: ["o(1)", "output array", "ek variable", "single variable", "in-place"] },
        { point: "Time O(n)", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Index i ka answer = <b>(i ke left ke saare elements ka product) × (i ke right ke saare ka product)</b>.</p>
        <p>Pass 1 (left → right): <code>ans[i] = product of nums[0..i-1]</code> (running product, ans[0] = 1). Pass 2 (right → left): ek variable <code>right</code> = product of <code>nums[i+1..n-1]</code>; <code>ans[i] *= right; right *= nums[i]</code>.</p>
        <p>Division (total / nums[i]) zero hone pe fail hota hai, aur problem mein mana hai. <b>Time O(n), extra space O(1)</b> (output chhod ke).</p>`
    },
    {
      type: "exercise",
      id: "ex-product",
      title: "Product of Array Except Self",
      level: "Medium",
      task: `<p>Return an array <code>ans</code> where <code>ans[i]</code> is the product of all elements of <code>nums</code> except <code>nums[i]</code>. Do not use division, and run in O(n). Every product fits in an int.</p><h4>Constraints</h4><ul><li>2 ≤ nums.length ≤ 10⁵</li><li>Every prefix and suffix product fits in an int</li></ul><p><a href="https://leetcode.com/problems/product-of-array-except-self/" target="_blank">LeetCode 238</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3,4]
Output: [24,12,8,6]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int[] productExceptSelf(int[] nums) {
        // yahan likho
        return new int[nums.length];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4]", new int[]{24, 12, 8, 6}, () -> s.productExceptSelf(new int[]{1, 2, 3, 4}));
        Check.eq("[-1,1,0,-3,3]", new int[]{0, 0, 9, 0, 0}, () -> s.productExceptSelf(new int[]{-1, 1, 0, -3, 3}));
        Check.hiddenFromHere();
        Check.eq("do elements [2,3]", new int[]{3, 2}, () -> s.productExceptSelf(new int[]{2, 3}));
        Check.eq("do zeros [0,0]", new int[]{0, 0}, () -> s.productExceptSelf(new int[]{0, 0}));
        Check.eq("ek zero [0,4,5]", new int[]{20, 0, 0}, () -> s.productExceptSelf(new int[]{0, 4, 5}));
        Check.eq("negatives [-2,-3,4]", new int[]{-12, -8, 6}, () -> s.productExceptSelf(new int[]{-2, -3, 4}));
        int n = 100000;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = (i % 2 == 0) ? -1 : 1;   // total product = 1
        int[] expected = big.clone();                                 // 1 / x = x (x = ±1)
        Check.eq("bada input n=1e5 (±1)", expected, () -> s.productExceptSelf(big));
    }
}`,
      hints: [
        "ans[i] = (left ka product) × (right ka product).",
        "Pehla loop: <code>ans[0] = 1; for i in 1..n-1: ans[i] = ans[i-1] * nums[i-1]</code>.",
        "Doosra loop ulta: <code>int right = 1; for i = n-1..0: ans[i] *= right; right *= nums[i];</code>"
      ],
      solution: `class Solution {
    int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        ans[0] = 1;
        for (int i = 1; i < n; i++) ans[i] = ans[i - 1] * nums[i - 1];   // left products
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= right;          // left × right
            right *= nums[i];
        }
        return ans;
    }
}`,
      explain: `<p><b>Approach:</b> prefix product (left) output array mein, suffix product (right) ek variable mein.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1) extra (output array count nahi hota).</p>`
    },
    {
      type: "text",
      html: `
        <h2>2D prefix sum</h2>
        <p><code>P[r][c]</code> = top-left (0,0) se (r-1, c-1) tak ke rectangle ka sum. Build:</p>
        <pre class="code-static">P[r+1][c+1] = M[r][c] + P[r][c+1] + P[r+1][c] - P[r][c]</pre>
        <p>Upar wala aur left wala jodo, overlap (diagonal) do baar juda, ek baar ghatao. Query (r1,c1)–(r2,c2):</p>
        <pre class="code-static">sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]</pre>
        <pre class="diagram">
  +-------+-----------+
  |   A   |     B     |      P[r2+1][c2+1] = A + B + C + D
  +-------+-----------+      chahiye sirf D:
  |   C   |     D     |      D = total - (A+B) - (A+C) + A
  +-------+-----------+
        </pre>
        <p>Use case: image processing (kisi rectangle ki brightness), Google Maps pe grid mein "is area mein kitne restaurants".</p>`
    },
    {
      type: "think",
      id: "think-2d",
      q: "<b>Range Sum Query 2D:</b> matrix ek baar milta hai, phir bahut saari queries aati hain: rectangle (r1,c1)–(r2,c2) ka sum. Build aur query ki complexity kya hogi? Inclusion-exclusion formula batao.",
      rubric: [
        { point: "Constructor mein <b>(m+1)×(n+1) prefix matrix</b> banao", keys: ["prefix", "m+1", "n+1", "2d prefix", "constructor", "precompute"], weight: 2 },
        { point: "Query: <b>P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]</b>", keys: ["inclusion", "exclusion", "+ p[r1][c1]", "do baar", "twice", "add back", "overlap"], weight: 2 },
        { point: "Build O(m·n), query <b>O(1)</b>", keys: ["o(1)", "constant"], weight: 2 },
        { point: "Space O(m·n)", keys: ["o(mn)", "o(m*n)", "o(m·n)", "m*n", "m x n"] }
      ],
      answer: `<p>Constructor mein <code>P</code> (size (m+1)×(n+1)) banao: <code>P[r+1][c+1] = M[r][c] + P[r][c+1] + P[r+1][c] - P[r][c]</code>. <b>O(m·n)</b> ek baar.</p>
        <p>Query: <code>P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]</code>. Upar wali strip aur left wali strip ghatao, top-left corner do baar ghata, ek baar wapas jodo. <b>O(1)</b> per query.</p>
        <p>Space O(m·n). Brute force har query pe O(m·n) leta, 10⁴ queries pe slow.</p>`
    },
    {
      type: "exercise",
      id: "ex-range-2d",
      title: "Range Sum Query 2D (Immutable)",
      level: "Medium",
      task: `<p>Implement <code>NumMatrix</code>:</p><ul><li><code>NumMatrix(int[][] matrix)</code> receives the matrix once; it never changes.</li><li><code>int sumRegion(int r1, int c1, int r2, int c2)</code> returns the sum of the rectangle from top-left <code>(r1, c1)</code> to bottom-right <code>(r2, c2)</code>, both inclusive.</li></ul><p>Each <code>sumRegion</code> must be <b>O(1)</b>; a hidden test makes 10⁵ queries.</p><p class="small muted">Example: sumRegion(2,1,4,3) is the boxed area = 8</p><pre class="diagram">     c0 c1 c2 c3 c4
r0    3  0  1  4  2
r1    5  6  3  2  1
r2    1 [2  0  1] 5
r3    4 [1  0  1] 7
r4    1 [0  3  0] 5</pre><h4>Constraints</h4><ul><li>1 ≤ rows, cols ≤ 300</li><li>Up to 10⁵ calls to sumRegion</li><li>0 ≤ r1 ≤ r2 &lt; rows, 0 ≤ c1 ≤ c2 &lt; cols</li></ul><p><a href="https://leetcode.com/problems/range-sum-query-2d-immutable/" target="_blank">LeetCode 304</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  matrix as in the diagram; sumRegion(2,1,4,3), sumRegion(1,1,2,2), sumRegion(1,2,2,4)
Output: 8, 11, 12</pre></div>`,
      userFile: "Solution.java",
      starter: `class NumMatrix {
    NumMatrix(int[][] matrix) {
        // yahan prefix banao
    }

    int sumRegion(int r1, int c1, int r2, int c2) {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] M = {{3, 0, 1, 4, 2}, {5, 6, 3, 2, 1}, {1, 2, 0, 1, 5}, {4, 1, 0, 1, 7}, {1, 0, 3, 0, 5}};
        NumMatrix nm = new NumMatrix(M);
        Check.eq("sumRegion(2,1,4,3)", 8, () -> nm.sumRegion(2, 1, 4, 3));
        Check.eq("sumRegion(1,1,2,2)", 11, () -> nm.sumRegion(1, 1, 2, 2));
        Check.eq("sumRegion(1,2,2,4)", 12, () -> nm.sumRegion(1, 2, 2, 4));
        Check.hiddenFromHere();
        Check.eq("single cell (0,0,0,0)", 3, () -> nm.sumRegion(0, 0, 0, 0));
        Check.eq("poora matrix", 58, () -> nm.sumRegion(0, 0, 4, 4));
        NumMatrix neg = new NumMatrix(new int[][]{{-1, 2}, {3, -4}});
        Check.eq("negative: poora", 0, () -> neg.sumRegion(0, 0, 1, 1));
        Check.eq("negative: row 1", -1, () -> neg.sumRegion(1, 0, 1, 1));
        NumMatrix one = new NumMatrix(new int[][]{{7}});
        Check.eq("1x1 matrix", 7, () -> one.sumRegion(0, 0, 0, 0));
        // bada: 300x300, matrix[i][j] = i, 1e5 random queries
        int R = 300, C = 300;
        int[][] big = new int[R][C];
        for (int i = 0; i < R; i++) Arrays.fill(big[i], i);
        int Q = 100000;
        int[][] qs = new int[Q][4];
        Random rnd = new Random(9);
        long expected = 0;
        for (int q = 0; q < Q; q++) {
            int a = rnd.nextInt(R), b = rnd.nextInt(R), c = rnd.nextInt(C), d = rnd.nextInt(C);
            int r1 = Math.min(a, b), r2 = Math.max(a, b), c1 = Math.min(c, d), c2 = Math.max(c, d);
            qs[q] = new int[]{r1, c1, r2, c2};
            expected += (long) (c2 - c1 + 1) * (r1 + r2) * (r2 - r1 + 1) / 2;
        }
        Check.eq("bada: 300x300, 1e5 queries ka total", expected, () -> {
            NumMatrix m = new NumMatrix(big);
            long total = 0;
            for (int[] q : qs) total += m.sumRegion(q[0], q[1], q[2], q[3]);
            return total;
        });
    }
}`,
      hints: [
        "Constructor mein <code>int[][] P = new int[m + 1][n + 1]</code> field banao.",
        "<code>P[r + 1][c + 1] = M[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]</code>",
        "Query: <code>P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]</code>"
      ],
      solution: `class NumMatrix {
    private final int[][] P;

    NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        P = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
            }
        }
    }

    int sumRegion(int r1, int c1, int r2, int c2) {
        return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
    }
}`,
      explain: `<p><b>Approach:</b> 2D prefix sum, inclusion-exclusion se query.</p>
        <p><b>Time:</b> build O(m·n), har query O(1). <b>Space:</b> O(m·n).</p>
        <p>Follow-up: matrix update bhi ho (LeetCode 308)? Tab prefix sum har update pe O(m·n) rebuild maangega. 2D Fenwick tree (Binary Indexed Tree) dono ko O(log m · log n) mein karta hai.</p>`
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>prefix size n+1, prefix[0] = 0; sum(l..r) = P[r+1] - P[l].</li><li>Subarray sum = k (negatives ke saath): map of prefix counts, map[0] = 1, pehle count phir insert.</li><li>Product except self: left product × right product, do pass, O(1) extra.</li><li>2D: inclusion-exclusion, build O(m·n), query O(1).</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Prefix array hamesha <b>size n+1</b> rakho aur <code>prefix[0] = 0</code>. Isse <code>l = 0</code> wala special case khatam ho jaata hai. Aur bolo ki overflow ka dhyaan hai: bade inputs pe prefix <code>long</code> mein rakho."
    }
  ],
  references: [
    { title: "Subarray Sum Equals K", by: "LeetCode", url: "https://leetcode.com/problems/subarray-sum-equals-k/", type: "article" },
    { title: "Product of Array Except Self", by: "LeetCode", url: "https://leetcode.com/problems/product-of-array-except-self/", type: "article" },
    { title: "Range Sum Query 2D - Immutable", by: "LeetCode", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", type: "article" },
    { title: "Hello Interview: Coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" }
  ]
});
