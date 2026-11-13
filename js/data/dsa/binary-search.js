// Binary Search (aur answer pe binary search)
registerLesson("dsa", "binary-search", {
  why: "Binary search sirf \"sorted array mein number dhoondho\" nahi hai. Rotated arrays, peak dhoondhna, aur \"minimum speed / capacity kitni chahiye\" jaise sawaal bhi isi se O(log n) mein hal hote hain. Off-by-one bugs yahin sabse zyada hote hain, isliye ek fixed template yaad rakho.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Core idea: har step pe aadha hata do</h2>
        <p>Agar kisi bhi <code>mid</code> pe aap bata sakte ho ki answer <b>left</b> mein hai ya <b>right</b> mein, to binary search lagta hai. n = 10⁹ pe bhi sirf ~30 steps.</p>
        <h2>Signals</h2>
        <ul>
          <li>Array <b>sorted</b> (ya rotated sorted) hai.</li>
          <li>Ek <b>monotonic condition</b> hai: kisi point tak false, uske baad hamesha true (F F F T T T). Jaise "speed k pe time pe khatam hoga?"</li>
          <li>Sawaal "<b>minimum</b> X jisse kaam ho jaaye" ya "<b>maximum</b> X jisme condition bani rahe".</li>
          <li>Constraint n ya answer range 10⁹ jaisi badi hai, aur O(log n) / O(n log M) chahiye.</li>
        </ul>
        <h2>Template: lower bound (pehla index jahan condition true)</h2>
        <pre class="code-static">int lo = 0, hi = n;            // answer [lo, hi] mein hai; hi = n matlab "koi nahi"
while (lo &lt; hi) {
    int mid = lo + (hi - lo) / 2;   // overflow safe
    if (condition(mid)) hi = mid;   // mid answer ho sakta hai, rakho
    else lo = mid + 1;              // mid pakka answer nahi
}
return lo;                          // pehla true (ya n)</pre>
        <ul>
          <li><b>lowerBound(x)</b>: condition = <code>a[mid] &gt;= x</code> (pehla element ≥ x).</li>
          <li><b>upperBound(x)</b>: condition = <code>a[mid] &gt; x</code> (pehla element &gt; x). Count of x = upper - lower.</li>
        </ul>
        <p>Ye template <b>kabhi infinite loop nahi</b> karta: <code>lo &lt; hi</code> pe mid hamesha <code>hi</code> se chhota hai, to har step pe range ghatti hai.</p>`
    },
    {
      type: "code",
      title: "lowerBound / upperBound: duplicates ke saath first aur last position",
      code: `import java.util.*;

public class Main {
    static int lowerBound(int[] a, int x) {     // pehla index jahan a[i] >= x
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] >= x) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    static int upperBound(int[] a, int x) {     // pehla index jahan a[i] > x
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] > x) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 5, 8};
        System.out.println("lowerBound(3) = " + lowerBound(a, 3));   // 1
        System.out.println("upperBound(3) = " + upperBound(a, 3));   // 4
        System.out.println("count(3)      = " + (upperBound(a, 3) - lowerBound(a, 3)));
        System.out.println("lowerBound(4) = " + lowerBound(a, 4));   // 4 (insert position)
        System.out.println("lowerBound(9) = " + lowerBound(a, 9));   // 6 = n, matlab nahi mila
    }
}`
    },
    {
      type: "steps",
      title: "lowerBound dry run: a = [1, 3, 3, 3, 5, 8], x = 3",
      steps: [
        { title: "lo=0, hi=6, mid=3", html: `<div class="arr"><span class="cell">1</span><span class="cell">3</span><span class="cell">3</span><span class="cell hl">3</span><span class="cell">5</span><span class="cell">8</span></div>
          <div class="arr ptrs"><span class="cell">lo</span><span class="cell"></span><span class="cell"></span><span class="cell">mid</span><span class="cell"></span><span class="cell"></span></div><p>a[3] = 3 ≥ 3 → true. mid answer ho sakta hai, par left mein aur pehle bhi ho sakta hai: <b>hi = 3</b></p>` },
        { title: "lo=0, hi=3, mid=1", html: `<div class="arr"><span class="cell">1</span><span class="cell hl">3</span><span class="cell">3</span><span class="cell dim">3</span><span class="cell dim">5</span><span class="cell dim">8</span></div>
          <div class="arr ptrs"><span class="cell">lo</span><span class="cell">mid</span><span class="cell"></span><span class="cell">hi</span><span class="cell"></span><span class="cell"></span></div><p>a[1] = 3 ≥ 3 → true: <b>hi = 1</b></p>` },
        { title: "lo=0, hi=1, mid=0", html: `<div class="arr"><span class="cell hl">1</span><span class="cell">3</span><span class="cell dim">3</span><span class="cell dim">3</span><span class="cell dim">5</span><span class="cell dim">8</span></div>
          <div class="arr ptrs"><span class="cell">lo mid</span><span class="cell">hi</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>a[0] = 1 &lt; 3 → false: <b>lo = 1</b></p>` },
        { title: "lo == hi == 1", html: `<div class="arr"><span class="cell dim">1</span><span class="cell ok">3</span><span class="cell">3</span><span class="cell">3</span><span class="cell">5</span><span class="cell">8</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell">lo=hi</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>Loop khatam. <b>Answer 1</b>: pehla 3 index 1 pe hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-rotated",
      q: "<b>Search in Rotated Sorted Array:</b> sorted array (distinct values) kisi point pe ghuma diya gaya hai, jaise [4,5,6,7,0,1,2]. Target ka index O(log n) mein dhoondhna hai. Har mid pe kaise decide karoge ki left jaana hai ya right?",
      rubric: [
        { point: "Har mid pe <b>ek half hamesha sorted</b> hota hai", keys: ["sorted half", "ek half", "one half", "ek side sorted", "one side", "aadha sorted"], weight: 2 },
        { point: "<b>nums[lo] ≤ nums[mid]</b> se pata chalta hai left half sorted hai", keys: ["nums[lo] <= nums[mid]", "lo] <= ", "left sorted", "left half sorted", "a[lo] <= a[mid]"], weight: 2 },
        { point: "Target sorted half ki <b>range mein hai</b> to wahan jao, warna doosre half", keys: ["range", "beech mein", "between", "within", "target >= nums[lo]", "doosre half", "other half"], weight: 2 },
        { point: "Time <b>O(log n)</b>", keys: ["log n", "logn", "o(log"] }
      ],
      answer: `<p>Rotated array ko mid pe todo to <b>kam se kam ek half sorted</b> hota hai.</p>
        <ul><li>Agar <code>nums[lo] &lt;= nums[mid]</code>: left half <code>[lo..mid]</code> sorted hai. Target <code>nums[lo] ≤ target &lt; nums[mid]</code> mein hai to <code>hi = mid - 1</code>, warna <code>lo = mid + 1</code>.</li>
        <li>Warna right half <code>[mid..hi]</code> sorted hai. Target <code>nums[mid] &lt; target ≤ nums[hi]</code> mein hai to <code>lo = mid + 1</code>, warna <code>hi = mid - 1</code>.</li></ul>
        <p><b>Time O(log n), space O(1).</b> Alternative: pehle binary search se rotation point (minimum) dhoondho, phir sahi half mein normal binary search. Dono O(log n).</p>`
    },
    {
      type: "exercise",
      id: "ex-rotated",
      title: "Search in Rotated Sorted Array",
      level: "Medium",
      task: `<p>An array sorted in ascending order (all values distinct) was rotated at an unknown pivot, for example <code>[0,1,2,4,5,6,7]</code> → <code>[4,5,6,7,0,1,2]</code>. Given the rotated array <code>nums</code> and a <code>target</code>, return the index of <code>target</code>, or <code>-1</code> if it is not present.</p><p>Your solution must run in <b>O(log n)</b>; a hidden test makes 10⁵ queries.</p><p class="small muted">Rotated array: two sorted halves</p><pre class="diagram">index:  0  1  2  3 | 4  5  6
value:  4  5  6  7 | 0  1  2
        \\_ sorted _/   \\_ sorted _/</pre><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>Values fit in int and are distinct</li></ul><p><a href="https://leetcode.com/problems/search-in-rotated-sorted-array/" target="_blank">LeetCode 33</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [4,5,6,7,0,1,2], target = 0
Output: 4</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [4,5,6,7,0,1,2], target = 3
Output: -1</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  nums = [1], target = 0
Output: -1</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int search(int[] nums, int target) {
        // O(log n) binary search likho (O(n) scan hidden test mein slow padega)
        return -1;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[4,5,6,7,0,1,2], target=0", 4, () -> s.search(new int[]{4, 5, 6, 7, 0, 1, 2}, 0));
        Check.eq("[4,5,6,7,0,1,2], target=3", -1, () -> s.search(new int[]{4, 5, 6, 7, 0, 1, 2}, 3));
        Check.eq("[1], target=0", -1, () -> s.search(new int[]{1}, 0));
        Check.hiddenFromHere();
        Check.eq("[1], target=1", 0, () -> s.search(new int[]{1}, 1));
        Check.eq("[3,1], target=1", 1, () -> s.search(new int[]{3, 1}, 1));
        Check.eq("[5,1,3], target=5", 0, () -> s.search(new int[]{5, 1, 3}, 5));
        Check.eq("rotate nahi [1,2,3,4,5], target=4", 3, () -> s.search(new int[]{1, 2, 3, 4, 5}, 4));
        Check.eq("[4,5,6,7,8,1,2,3], target=8", 4, () -> s.search(new int[]{4, 5, 6, 7, 8, 1, 2, 3}, 8));
        // bada: n=1e5, values 2*k (even), shift 37123 pe rotate; 1e5 queries
        int n = 100000, shift = 37123;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = 2 * ((i + shift) % n);
        Random r = new Random(4);
        int[] qs = new int[n];
        long expected = 0;
        for (int q = 0; q < n; q++) {
            int t = r.nextInt(2 * n + 2) - 1;        // -1 .. 2n
            qs[q] = t;
            if (t >= 0 && t < 2 * n && t % 2 == 0) expected += ((t / 2) - shift + n) % n;
            else expected += -1;
        }
        final long exp = expected;
        Check.eq("bada: n=1e5, 1e5 queries ke answers ka sum", exp, () -> {
            long sum = 0;
            for (int t : qs) sum += s.search(big, t);
            return sum;
        });
    }
}`,
      hints: [
        "Har mid pe check karo kaunsa half sorted hai: <code>nums[lo] &lt;= nums[mid]</code> matlab left half sorted.",
        "Sorted half mein target ki range check karna aasaan hai (do comparisons). Range mein hai to us half mein jao, warna doosre mein.",
        "Template: <code>while (lo &lt;= hi)</code>, mid pe <code>nums[mid] == target</code> to return mid."
      ],
      solution: `class Solution {
    int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                        // left half sorted
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                                            // right half sorted
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
      explain: `<p><b>Approach:</b> modified binary search. Mid pe sorted half pehchaano, target us range mein hai to wahan jao, warna doosre half mein.</p>
        <p><b>Time:</b> O(log n). <b>Space:</b> O(1).</p>
        <p>Follow-up: duplicates allowed ho (LeetCode 81)? Tab <code>nums[lo] == nums[mid]</code> pe pata nahi chalta kaunsa half sorted hai; <code>lo++</code> karna padta hai, worst case O(n).</p>`
    },
    {
      type: "think",
      id: "think-peak",
      q: "<b>Find Peak Element:</b> array mein adjacent elements kabhi barabar nahi hain, aur dono kinaron ke bahar −∞ maano. Koi bhi ek peak (dono padosiyon se bada) ka index O(log n) mein. Array sorted nahi hai, phir binary search kaise?",
      rubric: [
        { point: "<b>nums[mid] &lt; nums[mid+1]</b> to right mein peak pakka hai (uphill chalo)", keys: ["mid+1", "mid + 1", "uphill", "upar", "right mein", "slope", "badh raha"], weight: 2 },
        { point: "Warna mid ya left mein peak hai (<b>hi = mid</b>)", keys: ["hi = mid", "left mein", "mid ya left", "downhill", "neeche"], weight: 2 },
        { point: "Kyun: boundary −∞ hai, to badhte raste ka end kahin peak banega", keys: ["infinity", "-∞", "−∞", "boundary", "kinare", "end pe", "guarantee"] },
        { point: "Time <b>O(log n)</b>", keys: ["log n", "logn", "o(log"] }
      ],
      answer: `<p>Sorted hona zaroori nahi; zaroori hai ki har mid pe <b>ek side discard</b> kar sako.</p>
        <p>Agar <code>nums[mid] &lt; nums[mid+1]</code>: hum uphill pe hain. Right side mein chalte jao, ya to kahin neeche aayega (wahan peak) ya array khatam (last element peak, kyunki bahar −∞). To <code>lo = mid + 1</code>. Warna <code>nums[mid] &gt; nums[mid+1]</code>: mid khud peak ho sakta hai ya left mein peak hai: <code>hi = mid</code>.</p>
        <p><code>lo == hi</code> pe wahi peak hai. <b>Time O(log n), space O(1).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-peak",
      title: "Find Peak Element",
      level: "Medium",
      task: `<p>A <b>peak</b> is an element strictly greater than both of its neighbours. Treat <code>nums[-1]</code> and <code>nums[n]</code> as −∞. Adjacent elements are never equal.</p><p>Return the index of any peak. Your solution must run in <b>O(log n)</b>.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>-2³¹ ≤ nums[i] ≤ 2³¹ − 1</li><li>nums[i] ≠ nums[i + 1]</li></ul><p><a href="https://leetcode.com/problems/find-peak-element/" target="_blank">LeetCode 162</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3,1]
Output: 2
Explanation: 3 is bigger than 2 and 1.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1,2,1,3,5,6,4]
Output: 1 or 5
Explanation: Both 2 (index 1) and 6 (index 5) are peaks; either index is accepted.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int findPeakElement(int[] nums) {
        // yahan likho
        return -1;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static boolean isPeak(int[] a, int i) {
        if (i < 0 || i >= a.length) return false;
        boolean left = i == 0 || a[i] > a[i - 1];
        boolean right = i == a.length - 1 || a[i] > a[i + 1];
        return left && right;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,1]", 2, () -> s.findPeakElement(new int[]{1, 2, 3, 1}));
        int[] two = {1, 2, 1, 3, 5, 6, 4};
        Check.eq("[1,2,1,3,5,6,4] (1 ya 5): valid peak?", true, () -> isPeak(two, s.findPeakElement(two)));
        Check.hiddenFromHere();
        Check.eq("single [1]", 0, () -> s.findPeakElement(new int[]{1}));
        Check.eq("[2,1] peak shuru mein", 0, () -> s.findPeakElement(new int[]{2, 1}));
        Check.eq("[1,2] peak end mein", 1, () -> s.findPeakElement(new int[]{1, 2}));
        int[] neg = {-5, -3, -4, -1, -2};
        Check.eq("negatives [-5,-3,-4,-1,-2]: valid peak?", true, () -> isPeak(neg, s.findPeakElement(neg)));
        int n = 100000, p = 73421;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = i <= p ? i : 2 * p - i;   // ek hi peak index p pe
        Check.eq("bada: n=1e5 mountain, 20000 calls (O(n) slow)", 20000L * p, () -> {
            long sum = 0;
            for (int c = 0; c < 20000; c++) sum += s.findPeakElement(big);
            return sum;
        });
    }
}`,
      hints: [
        "<code>nums[mid]</code> aur <code>nums[mid + 1]</code> compare karo. Kis taraf \"upar\" ja rahe ho?",
        "Uphill (<code>nums[mid] &lt; nums[mid+1]</code>) ho to peak right mein pakka hai: <code>lo = mid + 1</code>.",
        "Template: <code>lo = 0, hi = n - 1; while (lo &lt; hi) { ... else hi = mid; } return lo;</code>"
      ],
      solution: `class Solution {
    int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;          // mid < hi, to mid+1 valid hai
            if (nums[mid] < nums[mid + 1]) lo = mid + 1;   // uphill: right mein peak
            else hi = mid;                                  // downhill: mid ya left
        }
        return lo;
    }
}`,
      explain: `<p><b>Approach:</b> slope pe binary search. Uphill ho to right, warna left (mid samet).</p>
        <p><b>Time:</b> O(log n). <b>Space:</b> O(1).</p>
        <p>Seekh: binary search ke liye array ka sorted hona zaroori nahi, bas har step pe ek half ko safely discard karne ka rule chahiye.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Answer pe binary search</h2>
        <p>Kabhi kabhi array mein nahi, <b>answer ki range</b> mein search karte hain. Shape:</p>
        <ol>
          <li>Answer ki range nikaalo: <code>[lo, hi]</code> (jaise speed 1 se max(pile)).</li>
          <li>Ek <code>feasible(x)</code> function likho: "x ke saath kaam ho jaayega?" Ye <b>monotonic</b> hona chahiye: x chal gaya to x+1 bhi chalega.</li>
          <li>Lower bound template se <b>pehla x jahan feasible true</b>.</li>
        </ol>
        <p>Time = O(log(range) × feasible ka cost). Example: Flipkart warehouse mein trucks ki <b>minimum capacity</b> jisse D din mein saare parcels chale jaayein (LeetCode 1011), ya Koko ki minimum eating speed.</p>`
    },
    {
      type: "think",
      id: "think-koko",
      q: "<b>Koko Eating Bananas:</b> piles hain, Koko ek ghante mein ek hi pile se max k kele khaati hai (pile chhota ho to bacha ghanta waste). h ghante mein sab khatam karne ke liye minimum k kya hai? Range, feasible function aur complexity batao.",
      rubric: [
        { point: "Range: <b>k = 1 se max(piles)</b>", keys: ["max(piles)", "max pile", "1 to max", "1 se max", "maximum pile", "sabse bada pile"], weight: 2 },
        { point: "Feasible(k): <b>sum of ceil(pile / k) ≤ h</b>", keys: ["ceil", "(p + k - 1) / k", "p + k - 1", "hours", "ghante", "<= h", "≤ h"], weight: 2 },
        { point: "Monotonic: bada k → kam ghante, isliye <b>binary search on answer</b>", keys: ["monotonic", "binary search", "bada k", "faster", "answer pe"], weight: 2 },
        { point: "Hours ka sum <b>long</b> mein (overflow)", keys: ["long", "overflow"] },
        { point: "Time <b>O(n log M)</b>, M = max pile", keys: ["n log m", "log m", "nlogm", "log(max", "n log(max"] }
      ],
      answer: `<p>Speed k ke saath pile p ko <code>ceil(p / k) = (p + k - 1) / k</code> ghante lagte hain. <code>feasible(k) = Σ ceil(p/k) ≤ h</code>. k badhao to ghante kam hote hain: <b>monotonic</b>.</p>
        <p>Range <code>[1, max(piles)]</code> (max pe har pile 1 ghante mein, aur h ≥ n guaranteed). Lower bound: pehla k jahan feasible true.</p>
        <p><b>Trap:</b> k = 1 pe ghante 10⁵ × 10⁹ = 10¹⁴ tak ja sakte hain, int overflow. <code>long</code> use karo. <b>Time O(n log M)</b>, M = max pile (~30 iterations × n). Space O(1).</p>`
    },
    {
      type: "exercise",
      id: "ex-koko",
      title: "Koko Eating Bananas",
      level: "Medium",
      task: `<p>There are <code>piles.length</code> piles of bananas; pile i has <code>piles[i]</code> bananas. Koko picks an eating speed <code>k</code> (bananas per hour). Each hour she chooses one pile and eats up to <code>k</code> bananas from it; if the pile has fewer than <code>k</code>, she finishes it and does nothing more that hour.</p><p>Return the <b>minimum integer</b> <code>k</code> that lets her finish all piles within <code>h</code> hours.</p><h4>Constraints</h4><ul><li>1 ≤ piles.length ≤ 10⁵</li><li>piles.length ≤ h ≤ 10⁹</li><li>1 ≤ piles[i] ≤ 10⁹</li></ul><p><a href="https://leetcode.com/problems/koko-eating-bananas/" target="_blank">LeetCode 875</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  piles = [3,6,7,11], h = 8
Output: 4
Explanation: At k = 4 the hours are 1 + 2 + 2 + 3 = 8. At k = 3 they are 1 + 2 + 3 + 4 = 10 > 8.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  piles = [30,11,23,4,20], h = 5
Output: 30</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  piles = [30,11,23,4,20], h = 6
Output: 23</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int minEatingSpeed(int[] piles, int h) {
        // yahan likho
        return 1;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("piles=[3,6,7,11], h=8", 4, () -> s.minEatingSpeed(new int[]{3, 6, 7, 11}, 8));
        Check.eq("piles=[30,11,23,4,20], h=5", 30, () -> s.minEatingSpeed(new int[]{30, 11, 23, 4, 20}, 5));
        Check.eq("piles=[30,11,23,4,20], h=6", 23, () -> s.minEatingSpeed(new int[]{30, 11, 23, 4, 20}, 6));
        Check.hiddenFromHere();
        Check.eq("single [1], h=1", 1, () -> s.minEatingSpeed(new int[]{1}, 1));
        Check.eq("[1000000000], h=2", 500000000, () -> s.minEatingSpeed(new int[]{1000000000}, 2));
        Check.eq("overflow trap: [1e9,1e9], h=3", 1000000000, () -> s.minEatingSpeed(new int[]{1000000000, 1000000000}, 3));
        Check.eq("[312884470], h=312884469", 2, () -> s.minEatingSpeed(new int[]{312884470}, 312884469));
        Check.eq("[805306368 x3], h=1e9", 3, () -> s.minEatingSpeed(new int[]{805306368, 805306368, 805306368}, 1000000000));
        int[] big = new int[10000];
        Arrays.fill(big, 1000000000);
        Check.eq("bada: 1e4 piles of 1e9, h=30000 (linear k slow)", 333333334, () -> s.minEatingSpeed(big, 30000));
    }
}`,
      hints: [
        "k ki range <code>[1, max(piles)]</code>. Har k ke liye ghante: <code>Σ (p + k - 1) / k</code>.",
        "k badhane se ghante kabhi badhte nahi. To lower bound: pehla k jahan <code>hours(k) &lt;= h</code>.",
        "<code>while (lo &lt; hi) { mid; if (hours(mid) &lt;= h) hi = mid; else lo = mid + 1; }</code>. hours <code>long</code> mein jodo."
      ],
      solution: `class Solution {
    int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (hours(piles, mid) <= h) hi = mid;   // mid chal gaya, aur chhota try karo
            else lo = mid + 1;
        }
        return lo;
    }

    private long hours(int[] piles, int k) {
        long total = 0;                               // int overflow se bachne ke liye long
        for (int p : piles) total += (p + (long) k - 1) / k;
        return total;
    }
}`,
      explain: `<p><b>Approach:</b> answer (speed k) pe binary search. <code>hours(k) ≤ h</code> monotonic hai.</p>
        <p><b>Time:</b> O(n log M), M = max pile. <b>Space:</b> O(1).</p>
        <p>Do overflow traps: hours ka total (long), aur <code>p + k - 1</code> (p aur k dono ~10⁹ to int mein overflow), isliye <code>(long) k</code>.</p>`
    },
    {
      type: "quiz",
      q: "<code>while (lo &lt; hi) { int mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }</code> mein kya bug hai?",
      options: [
        "Koi bug nahi",
        "<code>lo = mid</code> se infinite loop ho sakta hai (lo = 3, hi = 4 pe mid = 3 hi rehta hai)",
        "<code>hi = mid</code> galat hai, <code>hi = mid - 1</code> hona chahiye",
        "Sirf overflow ka bug hai"
      ],
      answer: 1,
      why: "mid neeche round hota hai, to <code>lo + 1 == hi</code> pe <code>mid == lo</code>. <code>lo = mid</code> kuch nahi badalta, loop hamesha chalta rehta hai. Rule: <code>hi = mid</code> ke saath <code>lo = mid + 1</code>. (Aur haan, <code>lo + hi</code> overflow bhi kar sakta hai, par asli bug infinite loop hai.)"
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Ek template: lo &lt; hi, hi = mid / lo = mid + 1, answer = pehla index jahan condition true.</li><li>Rotated array: har mid pe ek half sorted hai, target uski range mein hai ya nahi.</li><li>Peak: sorted hona zaroori nahi; uphill ho to right jao.</li><li>Answer pe binary search: range + monotonic feasible(x). Koko: Σ ceil(p/k) ≤ h, long mein jodo.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Ek hi template (lower bound, <code>lo &lt; hi</code>, <code>hi = mid</code> / <code>lo = mid + 1</code>) pakka karo aur har problem ko \"pehla index/value jahan condition true hai\" mein badlo. Interviewer ko bolo: <i>\"Mera feasible function monotonic hai kyunki ...\"</i>. Ye ek line answer-pe-binary-search ka poora justification hai."
    }
  ],
  references: [
    { title: "Search in Rotated Sorted Array", by: "LeetCode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", type: "article" },
    { title: "Find Peak Element", by: "LeetCode", url: "https://leetcode.com/problems/find-peak-element/", type: "article" },
    { title: "Koko Eating Bananas", by: "LeetCode", url: "https://leetcode.com/problems/koko-eating-bananas/", type: "article" },
    { title: "Strivers A2Z DSA Sheet (binary search)", by: "Striver (takeUforward)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "Hello Interview: Coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" }
  ]
});
