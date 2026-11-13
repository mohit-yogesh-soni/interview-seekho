// Two Pointers
registerLesson("dsa", "two-pointers", {
  why: "Sorted array ya \"in-place karo, extra space nahi\" wale sawaalon mein two pointers O(n²) ko O(n) bana deta hai, aur O(1) space mein. 3Sum aur Container With Most Water FAANG aur Indian product companies dono mein bahut poochhe jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>Array <b>sorted</b> hai (ya sort kar sakte ho), aur <b>pair / triplet</b> dhoondhna hai jiska sum kuch ho.</li>
          <li>Dono <b>ends se</b> kuch compare karna hai (palindrome, container, reverse).</li>
          <li><b>In-place</b> rearrange karna hai: duplicates hatao, zeros end mein bhejo, colors sort karo.</li>
          <li>Constraint: O(1) extra space.</li>
        </ul>
        <h2>Do type ke two pointers</h2>
        <table>
          <tr><th>Type</th><th>Kaise chalte hain</th><th>Examples</th></tr>
          <tr><td><b>Opposite ends</b></td><td>L = 0, R = n-1, beech ki taraf aate hain</td><td>sorted pair sum, 3Sum, container, palindrome</td></tr>
          <tr><td><b>Same direction</b> (slow/fast)</td><td>dono left se, ek "likhne" ki jagah, ek "padhne" ki</td><td>remove duplicates, move zeroes, Sort Colors (3 pointers)</td></tr>
        </table>
        <h2>Brute force vs two pointers</h2>
        <p>Sorted array mein do numbers ka sum target: brute force har pair, O(n²). Two pointers: agar <code>a[L] + a[R]</code> chhota hai to L badhao (sum badhega), bada hai to R ghatao. Har step pe ek element hamesha ke liye hat jaata hai, isliye <b>O(n)</b>.</p>
        <p><b>Kyun sahi hai?</b> Agar <code>a[L] + a[R] &lt; target</code>, to <code>a[L]</code> ka kisi bhi R' &lt; R ke saath sum aur chhota hoga. Matlab a[L] kisi pair mein kaam ka nahi, use chhodna safe hai.</p>`
    },
    {
      type: "code",
      title: "Template: opposite ends (sorted pair sum) aur same direction (remove duplicates)",
      code: `import java.util.*;

public class Main {
    // Opposite ends: sorted array mein pair jiska sum = target
    static int[] pairSum(int[] a, int target) {
        int L = 0, R = a.length - 1;
        while (L < R) {
            int sum = a[L] + a[R];
            if (sum == target) return new int[]{L, R};
            if (sum < target) L++;      // sum badhana hai
            else R--;                   // sum ghatana hai
        }
        return new int[]{-1, -1};
    }

    // Same direction: sorted array se duplicates in-place hatao, naya length return
    static int dedupe(int[] a) {
        if (a.length == 0) return 0;
        int write = 1;                  // yahan agla unique likhna hai
        for (int read = 1; read < a.length; read++) {
            if (a[read] != a[write - 1]) a[write++] = a[read];
        }
        return write;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairSum(new int[]{1, 2, 4, 7, 11}, 15)));
        int[] b = {1, 1, 2, 3, 3, 3, 5};
        int k = dedupe(b);
        System.out.println(k + " " + Arrays.toString(Arrays.copyOf(b, k)));
    }
}`
    },
    {
      type: "steps",
      title: "Two pointers dry run: [1, 2, 4, 7, 11], target 15",
      steps: [
        { title: "L=0, R=4", html: `<div class="arr"><span class="cell hl">1</span><span class="cell">2</span><span class="cell">4</span><span class="cell">7</span><span class="cell hl">11</span></div>
          <div class="arr ptrs"><span class="cell">L</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell">R</span></div><p>1 + 11 = 12 &lt; 15. Sum badhana hai → <b>L++</b>. (1 ka koi bhi pair 15 nahi banega, 11 sabse bada tha.)</p>` },
        { title: "L=1, R=4", html: `<div class="arr"><span class="cell dim">1</span><span class="cell hl">2</span><span class="cell">4</span><span class="cell">7</span><span class="cell hl">11</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell">L</span><span class="cell"></span><span class="cell"></span><span class="cell">R</span></div><p>2 + 11 = 13 &lt; 15 → <b>L++</b></p>` },
        { title: "L=2, R=4", html: `<div class="arr"><span class="cell dim">1</span><span class="cell dim">2</span><span class="cell hl">4</span><span class="cell">7</span><span class="cell hl">11</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">L</span><span class="cell"></span><span class="cell">R</span></div><p>4 + 11 = 15 == target. Mil gaya!</p>` },
        { title: "Answer", html: `<div class="arr"><span class="cell dim">1</span><span class="cell dim">2</span><span class="cell ok">4</span><span class="cell">7</span><span class="cell ok">11</span></div>
          <p>Indices [2, 4]. 3 steps, brute force mein 10 pairs hote. n = 10⁵ pe ye farak 10⁵ vs 5×10⁹ ka hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-3sum",
      q: "<b>3Sum:</b> array mein saare <b>unique</b> triplets dhoondho jinka sum 0 hai. Brute force kya hai? Two pointers kaise lagaoge? Duplicates kaise rokoge?",
      rubric: [
        { point: "Brute force teen loops <b>O(n³)</b>", keys: ["o(n^3)", "o(n³)", "n^3", "n³", "teen loop", "three loop"] },
        { point: "Pehle <b>sort</b> karo", keys: ["sort"], weight: 2 },
        { point: "Har i fix karo, baaki do ke liye <b>two pointers</b> (target = -nums[i])", keys: ["fix", "two pointer", "do pointer", "l and r", "left right", "-nums[i]", "pair sum"], weight: 2 },
        { point: "<b>Duplicates skip</b> karo (i ke liye aur L/R ke liye)", keys: ["skip", "duplicate", "same value", "nums[i] == nums[i-1]", "nums[i-1]"], weight: 2 },
        { point: "Total <b>O(n²)</b> time, O(1) extra (sort chhod ke)", keys: ["o(n^2)", "o(n²)", "n^2", "n²", "quadratic"], weight: 2 }
      ],
      answer: `<p><b>Brute force:</b> teen nested loops, O(n³), aur duplicates hatane ke liye set.</p>
        <p><b>Better:</b> array sort karo. Har <code>i</code> ke liye <code>nums[i]</code> fix karo, aur <code>i+1 .. n-1</code> mein pair dhoondho jiska sum <code>-nums[i]</code> ho (two pointers, O(n)).</p>
        <p><b>Duplicates:</b> agar <code>nums[i] == nums[i-1]</code> to skip. Triplet milne ke baad L ko aage badhao jab tak same value hai (aur R ko peeche). Sorted hone ki wajah se same values saath hoti hain.</p>
        <p><b>Time:</b> sort O(n log n) + n baar O(n) = <b>O(n²)</b>. <b>Space:</b> O(1) extra (output aur sort ka internal space chhod ke). Bonus: agar <code>nums[i] &gt; 0</code> to break, kyunki aage sab positive hain.</p>`
    },
    {
      type: "exercise",
      id: "ex-3sum",
      title: "3Sum",
      level: "Medium",
      task: `<p>Return all triplets <code>[a, b, c]</code> taken from three different indices with <code>a + b + c == 0</code>. Each set of values must appear only <b>once</b> in the answer. The order of triplets, and of values inside a triplet, does not matter.</p><h4>Constraints</h4><ul><li>3 ≤ nums.length ≤ 3000</li><li>Values fit in int (a sum of three does not overflow in the tests)</li></ul><p><a href="https://leetcode.com/problems/3sum/" target="_blank">LeetCode 15</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: [-1,0,1] can be formed in two ways but is listed once.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [0,1,1]
Output: []</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  nums = [0,0,0]
Output: [[0,0,0]]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<Integer>> threeSum(int[] nums) {
        // yahan likho
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrderDeep("[-1,0,1,2,-1,-4]", List.of(List.of(-1, -1, 2), List.of(-1, 0, 1)), () -> s.threeSum(new int[]{-1, 0, 1, 2, -1, -4}));
        Check.eqAnyOrderDeep("[0,1,1]", List.of(), () -> s.threeSum(new int[]{0, 1, 1}));
        Check.eqAnyOrderDeep("[0,0,0]", List.of(List.of(0, 0, 0)), () -> s.threeSum(new int[]{0, 0, 0}));
        Check.hiddenFromHere();
        Check.eqAnyOrderDeep("empty", List.of(), () -> s.threeSum(new int[]{}));
        Check.eqAnyOrderDeep("duplicates [0,0,0,0]", List.of(List.of(0, 0, 0)), () -> s.threeSum(new int[]{0, 0, 0, 0}));
        Check.eqAnyOrderDeep("[-2,0,1,1,2]", List.of(List.of(-2, 0, 2), List.of(-2, 1, 1)), () -> s.threeSum(new int[]{-2, 0, 1, 1, 2}));
        Check.eqAnyOrderDeep("[-1,-1,-1,2,2]", List.of(List.of(-1, -1, 2)), () -> s.threeSum(new int[]{-1, -1, -1, 2, 2}));
        // bada input n=3000: 1..2997, phir -3, 1, 2. Sirf ek triplet: [-3,1,2]
        int[] big = new int[3000];
        for (int i = 0; i < 2997; i++) big[i] = i + 1;
        big[2997] = -3; big[2998] = 1; big[2999] = 2;
        Random r = new Random(3);
        for (int i = big.length - 1; i > 0; i--) { int j = r.nextInt(i + 1); int t = big[i]; big[i] = big[j]; big[j] = t; }
        Check.eqAnyOrderDeep("bada input n=3000 (O(n^3) slow)", List.of(List.of(-3, 1, 2)), () -> s.threeSum(big));
    }
}`,
      hints: [
        "Pehle <code>Arrays.sort(nums)</code>. Ab har <code>i</code> ke liye problem \"sorted array mein pair sum = -nums[i]\" ban jaati hai.",
        "<code>if (i &gt; 0 &amp;&amp; nums[i] == nums[i - 1]) continue;</code> se same first element dobara mat lo.",
        "Triplet milne pe: add karo, <code>L++; R--;</code> phir <code>while (L &lt; R &amp;&amp; nums[L] == nums[L - 1]) L++;</code>"
      ],
      solution: `import java.util.*;

class Solution {
    List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> ans = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;                          // aage sab positive
            if (i > 0 && nums[i] == nums[i - 1]) continue;   // same first element skip
            int L = i + 1, R = n - 1;
            while (L < R) {
                int sum = nums[i] + nums[L] + nums[R];
                if (sum == 0) {
                    ans.add(Arrays.asList(nums[i], nums[L], nums[R]));
                    L++;
                    R--;
                    while (L < R && nums[L] == nums[L - 1]) L++;   // duplicates skip
                    while (L < R && nums[R] == nums[R + 1]) R--;
                } else if (sum < 0) {
                    L++;
                } else {
                    R--;
                }
            }
        }
        return ans;
    }
}`,
      explain: `<p><b>Approach:</b> sort, phir har i ke liye two pointers. Duplicate values ko i aur L/R dono level pe skip karo.</p>
        <p><b>Time:</b> O(n²). <b>Space:</b> O(1) extra (output ke alawa; <code>Arrays.sort</code> int[] pe dual-pivot quicksort hai jo O(log n) stack leta hai).</p>`
    },
    {
      type: "think",
      id: "think-container",
      q: "<b>Container With Most Water:</b> <code>height[i]</code> deewaron ki height hai. Do deewarein chuno jinke beech sabse zyada paani aaye (area = min(height) × distance). Pointer ko kis side se move karoge aur kyun?",
      rubric: [
        { point: "Area = <b>min(h[L], h[R]) × (R - L)</b>", keys: ["min(", "minimum", "chhoti", "shorter", "smaller", "r - l", "width", "distance"] },
        { point: "Shuru: <b>L = 0, R = n-1</b> (max width)", keys: ["l = 0", "l=0", "dono end", "both end", "ends", "n-1", "max width"] },
        { point: "Hamesha <b>chhoti deewar wala pointer</b> move karo", keys: ["chhota", "chhoti", "smaller", "shorter", "lower", "min wala", "kam height"], weight: 2 },
        { point: "Kyun: badi wali move karne se width ghatti hai aur height min se upar nahi jaa sakti, to area kabhi nahi badhega", keys: ["width ghat", "width kam", "bottleneck", "limit", "never increase", "nahi badhega", "kabhi nahi"], weight: 2 },
        { point: "Time <b>O(n)</b>, space O(1)", keys: ["o(n)", "linear", "one pass", "ek pass"] }
      ],
      answer: `<p>Area = <code>min(h[L], h[R]) × (R - L)</code>. Brute force har pair O(n²).</p>
        <p><b>Two pointers:</b> L = 0, R = n-1 se shuru (width sabse zyada). Har step pe area update karo, phir <b>jo deewar chhoti hai uska pointer</b> andar lao.</p>
        <p><b>Kyun safe hai:</b> maan lo <code>h[L] &lt; h[R]</code>. L ko fix rakh ke R ko kahin bhi andar le jao, width kam hogi aur height <code>min(h[L], …) ≤ h[L]</code> hi rahegi. Matlab L ke saath iss se behtar area possible hi nahi. To L ko chhodna safe hai.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>`
    },
    {
      type: "exercise",
      id: "ex-container",
      title: "Container With Most Water",
      level: "Medium",
      task: `<p>At index <code>i</code> there is a vertical wall of height <code>height[i]</code>. Pick two walls <code>i &lt; j</code>; the water they hold has area <code>min(height[i], height[j]) × (j − i)</code>. Return the largest possible area.</p><h4>Constraints</h4><ul><li>2 ≤ height.length ≤ 10⁵</li><li>0 ≤ height[i] ≤ 10⁴</li></ul><p><a href="https://leetcode.com/problems/container-with-most-water/" target="_blank">LeetCode 11</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: Walls at index 1 (height 8) and index 8 (height 7): min(8,7) × (8 − 1) = 49.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  height = [1,1]
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int maxArea(int[] height) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,8,6,2,5,4,8,3,7]", 49, () -> s.maxArea(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7}));
        Check.eq("[1,1]", 1, () -> s.maxArea(new int[]{1, 1}));
        Check.hiddenFromHere();
        Check.eq("[4,3,2,1,4]", 16, () -> s.maxArea(new int[]{4, 3, 2, 1, 4}));
        Check.eq("[1,2,1]", 2, () -> s.maxArea(new int[]{1, 2, 1}));
        Check.eq("zero height [0,0]", 0, () -> s.maxArea(new int[]{0, 0}));
        Check.eq("beech mein unchi [1,100,100,1]", 100, () -> s.maxArea(new int[]{1, 100, 100, 1}));
        int n = 100000;
        int[] big = new int[n];
        Random r = new Random(11);
        for (int i = 0; i < n; i++) big[i] = 1 + r.nextInt(9999);   // 1..9999
        big[0] = 10000; big[n - 1] = 10000;
        Check.eq("bada input n=1e5", 10000 * (n - 1), () -> s.maxArea(big));
    }
}`,
      hints: [
        "Brute force har pair O(n²) hai, n = 10⁵ pe slow. Dono ends se shuru karo.",
        "Har step pe area nikaalo, phir ek pointer andar lao. Kaunsa? Jo deewar area ko limit kar rahi hai.",
        "<code>if (height[L] &lt; height[R]) L++; else R--;</code>"
      ],
      solution: `class Solution {
    int maxArea(int[] height) {
        int L = 0, R = height.length - 1, best = 0;
        while (L < R) {
            int area = Math.min(height[L], height[R]) * (R - L);
            best = Math.max(best, area);
            if (height[L] < height[R]) L++;   // chhoti deewar hi bottleneck hai
            else R--;
        }
        return best;
    }
}`,
      explain: `<p><b>Approach:</b> L = 0, R = n-1. Area update karo, chhoti deewar wala pointer move karo.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>`
    },
    {
      type: "think",
      id: "think-sort-colors",
      q: "<b>Sort Colors:</b> array mein sirf 0, 1, 2 hain. Inhe in-place sort karna hai, <b>ek pass</b> mein, library sort ke bina. Kitne pointers lagenge aur har ek ka matlab kya hai?",
      rubric: [
        { point: "Simple option: count karo (2 pass), par ek pass chahiye", keys: ["count", "counting", "2 pass", "two pass", "do pass"] },
        { point: "<b>Teen pointers</b>: low (0 ki boundary), mid (current), high (2 ki boundary)", keys: ["low", "mid", "high", "teen pointer", "three pointer", "3 pointer"], weight: 2 },
        { point: "0 mila: low se swap, <b>low++ aur mid++</b>; 1: mid++; 2: high se swap, <b>sirf high--</b>", keys: ["swap", "low++", "high--", "mid++"], weight: 2 },
        { point: "2 ke swap ke baad mid <b>nahi badhate</b>, kyunki aaya hua element abhi check nahi hua", keys: ["mid nahi", "check nahi", "unchecked", "dobara check", "don't increment", "mid same"], weight: 2 },
        { point: "Dutch National Flag, O(n) time, O(1) space", keys: ["dutch", "o(n)", "o(1)", "one pass", "ek pass"] }
      ],
      answer: `<p>Counting sort (0, 1, 2 gin ke dobara likho) 2 pass hai. Ek pass ke liye <b>Dutch National Flag</b> (Dijkstra):</p>
        <ul><li><code>[0, low)</code> = saare 0, <code>[low, mid)</code> = saare 1, <code>[mid, high]</code> = abhi nahi dekhe, <code>(high, n-1]</code> = saare 2.</li>
        <li><code>a[mid] == 0</code>: <code>swap(low, mid)</code>, <code>low++</code>, <code>mid++</code> (low pe jo tha wo 1 tha, already dekha hua).</li>
        <li><code>a[mid] == 1</code>: <code>mid++</code>.</li>
        <li><code>a[mid] == 2</code>: <code>swap(mid, high)</code>, <code>high--</code>. <b>mid mat badhao</b>, kyunki high se aaya element abhi check nahi hua.</li></ul>
        <p>Loop <code>while (mid &lt;= high)</code>. <b>Time O(n), space O(1).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-sort-colors",
      title: "Sort Colors (Dutch National Flag)",
      level: "Medium",
      task: `<p><code>nums</code> contains only 0, 1 and 2 (three colours). Sort it <b>in place</b> so that all 0s come first, then 1s, then 2s, without using a library sort. Aim for one pass with O(1) extra space. The method returns nothing.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>nums[i] is 0, 1 or 2</li></ul><p><a href="https://leetcode.com/problems/sort-colors/" target="_blank">LeetCode 75</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [2,0,1]
Output: [0,1,2]</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    void sortColors(int[] nums) {
        // yahan likho (in-place)
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static int[] run(Solution s, int[] a) {
        s.sortColors(a);
        return a;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,0,2,1,1,0]", new int[]{0, 0, 1, 1, 2, 2}, () -> run(s, new int[]{2, 0, 2, 1, 1, 0}));
        Check.eq("[2,0,1]", new int[]{0, 1, 2}, () -> run(s, new int[]{2, 0, 1}));
        Check.hiddenFromHere();
        Check.eq("single [1]", new int[]{1}, () -> run(s, new int[]{1}));
        Check.eq("empty", new int[]{}, () -> run(s, new int[]{}));
        Check.eq("sab 2 [2,2,2]", new int[]{2, 2, 2}, () -> run(s, new int[]{2, 2, 2}));
        Check.eq("[2,2,0,0]", new int[]{0, 0, 2, 2}, () -> run(s, new int[]{2, 2, 0, 0}));
        Check.eq("[1,2,0]", new int[]{0, 1, 2}, () -> run(s, new int[]{1, 2, 0}));
        int n = 100000;
        int[] big = new int[n];
        int[] cnt = new int[3];
        Random r = new Random(5);
        for (int i = 0; i < n; i++) { big[i] = r.nextInt(3); cnt[big[i]]++; }
        int[] expected = new int[n];
        for (int i = 0, k = 0; i < 3; i++) for (int c = 0; c < cnt[i]; c++) expected[k++] = i;
        Check.eq("bada input n=1e5", expected, () -> run(s, big));
    }
}`,
      hints: [
        "Teen pointers: <code>low = 0, mid = 0, high = n - 1</code>.",
        "<code>nums[mid]</code> 0 hai to low ke saath swap karke dono badhao. 2 hai to high ke saath swap karke sirf high ghatao.",
        "Loop condition <code>mid &lt;= high</code>. 2 ke swap ke baad mid wahi rakho."
      ],
      solution: `class Solution {
    void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums, low++, mid++);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums, mid, high--);   // mid nahi badhaya: naya element check karna hai
            }
        }
    }

    private void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}`,
      explain: `<p><b>Approach:</b> Dutch National Flag. low ke pehle saare 0, high ke baad saare 2, mid scan karta hai.</p>
        <p><b>Time:</b> O(n), ek pass. <b>Space:</b> O(1).</p>`
    },
    {
      type: "quiz",
      q: "Unsorted array mein do numbers ka sum target dhoondhna hai aur <b>original indices</b> return karne hain. Two pointers ke liye kya karna padega?",
      options: [
        "Kuch nahi, two pointers unsorted pe bhi chalta hai",
        "Sort karna padega, par (value, index) pairs sort karo taaki indices na khoyein. O(n log n)",
        "Sirf R pointer use karo",
        "Two pointers yahan possible hi nahi"
      ],
      answer: 1,
      why: "Two pointers ka logic (sum chhota → L++) sirf sorted array pe sahi hai. Sort se indices badal jaate hain, to pairs sort karo. Is case mein HashMap (O(n)) zyada simple hai, ye trade-off interview mein bolo."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Signal: sorted array, pair/triplet sum, in-place rearrange, O(1) space.</li><li>Opposite ends: sum chhota → L++, bada → R--. Har step ek element hamesha ke liye hat-ta hai.</li><li>3Sum: sort + har i ke liye two pointers + duplicate skip. O(n²).</li><li>Container: chhoti deewar wala pointer move. O(n).</li><li>Sort Colors: low/mid/high (Dutch flag), 2 ke swap pe mid mat badhao.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Two pointers use karte waqt <b>kyun safe hai</b> ek line mein bolo: <i>\"sum chhota hai, aur a[L] ka sabse bada partner a[R] tha, to a[L] ab kisi kaam ka nahi.\"</i> Ye correctness argument interviewer ko dikhata hai ki aapne pattern ratta nahi, samjha hai. 3Sum mein duplicate skipping pe sabse zyada bugs aate hain, dry run zaroor karo."
    }
  ],
  references: [
    { title: "3Sum", by: "LeetCode", url: "https://leetcode.com/problems/3sum/", type: "article" },
    { title: "Container With Most Water", by: "LeetCode", url: "https://leetcode.com/problems/container-with-most-water/", type: "article" },
    { title: "Sort Colors", by: "LeetCode", url: "https://leetcode.com/problems/sort-colors/", type: "article" },
    { title: "Hello Interview: Coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" },
    { title: "NeetCode Roadmap (Two Pointers)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
