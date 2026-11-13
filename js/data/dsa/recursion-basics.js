// Recursion se sochna
registerLesson("dsa", "recursion-basics", {
  why: "Trees, graphs, backtracking aur DP sab recursion pe khade hain. Agar \"chhota problem solve maan lo, usse bada banao\" wali soch aa gayi, to aage ke aadhe patterns aasan ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Recursion = function jo khud ko chhote input ke saath call kare</h2>
        <p>Har recursive function ke 2 hisse hote hain:</p>
        <ol>
          <li><b>Base case:</b> sabse chhota input jiska answer seedha pata hai (jaise <code>n == 0</code>). Ye na ho to function kabhi nahi rukta → <code>StackOverflowError</code>.</li>
          <li><b>Recursive case:</b> problem ko chhota karo, khud ko call karo, aur us answer se apna answer banao.</li>
        </ol>
        <p><b>Soch ka tareeka (leap of faith):</b> maan lo <code>f(n-1)</code> sahi answer deta hai. Ab bas itna socho ki usse <code>f(n)</code> kaise banega. Andar ke har call ko trace karne ki zaroorat nahi.</p>
        <p>Example: IRCTC queue mein aap jaanna chahte ho ki aap kaun se number pe ho. Aage wale se poochho "tum kaun se number pe ho?", wo apne aage wale se poochhega... pehla banda bolega "1" (base case). Har koi apne answer mein +1 karke peeche bhejta hai.</p>`
    },
    {
      type: "code",
      title: "Call stack dekho: har call apna frame banati hai, base case ke baad wapas lautti hai",
      code: `public class Main {
    static int depth = 0;

    static int sumTo(int n) {
        String pad = "  ".repeat(depth);
        System.out.println(pad + "sumTo(" + n + ") call hua");
        if (n == 0) {                       // base case
            System.out.println(pad + "base case, return 0");
            return 0;
        }
        depth++;
        int rest = sumTo(n - 1);            // leap of faith: maan lo ye sahi hai
        depth--;
        int ans = n + rest;
        System.out.println(pad + "sumTo(" + n + ") = " + n + " + " + rest + " = " + ans);
        return ans;
    }

    public static void main(String[] args) {
        System.out.println("Answer: " + sumTo(4));
    }
}`,
      note: "Ek waqt pe stack mein 5 frames (4, 3, 2, 1, 0) hain. Isliye is recursion ki <b>space complexity O(n)</b> hai, chahe koi array nahi banaya."
    },
    {
      type: "text",
      html: `
        <h2>Recursion tree: complexity nikaalne ka tareeka</h2>
        <p>Har call ko ek node maano, aur jo calls wo karta hai unhe children. Phir:</p>
        <ul>
          <li><b>Time</b> = (nodes ki ginti) × (har node ka kaam, recursive calls chhod ke)</li>
          <li><b>Space</b> = tree ki <b>height</b> (sabse lamba path) + extra data</li>
        </ul>
        <pre class="diagram">
f(n) = f(n-1) + 1        ek child: chain      n nodes   → O(n)
f(n) = f(n/2) + 1        ek child, aadha      log n     → O(log n)
f(n) = f(n-1) + f(n-1)   do children          2ⁿ nodes  → O(2ⁿ)

            f(3)                      (do children wala tree)
          /      \\
       f(2)      f(2)
       /  \\      /  \\
    f(1) f(1) f(1) f(1)
        </pre>
        <p>Ye soch <b>Power(x, n)</b> mein dikhegi: <code>x^n = x^(n/2) × x^(n/2)</code>. Agar <code>x^(n/2)</code> ek baar nikaal ke reuse karo to ek child (O(log n)). Agar do baar call karo to do children aur O(n) ho jaata hai.</p>`
    },
    {
      type: "steps",
      title: "Fast power dry run: pow(2, 10)",
      steps: [
        { title: "pow(2, 10)", html: `<p>n even hai. <code>half = pow(2, 5)</code> chahiye, answer hoga <code>half × half</code>.</p><div class="arr"><span class="cell hl">n=10</span><span class="cell">5</span><span class="cell">2</span><span class="cell">1</span><span class="cell">0</span></div>` },
        { title: "pow(2, 5)", html: `<p>n odd hai. <code>half = pow(2, 2)</code>, answer hoga <code>half × half × x</code>.</p><div class="arr"><span class="cell dim">10</span><span class="cell hl">n=5</span><span class="cell">2</span><span class="cell">1</span><span class="cell">0</span></div>` },
        { title: "pow(2, 2) → pow(2, 1) → pow(2, 0)", html: `<p><code>pow(2, 0) = 1</code> (base case). Ab wapas lauto.</p><div class="arr"><span class="cell dim">10</span><span class="cell dim">5</span><span class="cell dim">2</span><span class="cell dim">1</span><span class="cell ok">0 → 1</span></div>` },
        { title: "Wapas aate hue", html: `<p>pow(2,1) = 1×1×2 = <b>2</b> · pow(2,2) = 2×2 = <b>4</b> · pow(2,5) = 4×4×2 = <b>32</b> · pow(2,10) = 32×32 = <b>1024</b></p><div class="arr"><span class="cell ok">1024</span><span class="cell ok">32</span><span class="cell ok">4</span><span class="cell ok">2</span><span class="cell ok">1</span></div><p>Sirf 5 calls. n = 10⁹ pe bhi ~31 calls. Ye O(log n) hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-pow",
      q: "<b>Power(x, n):</b> <code>x</code> double hai, <code>n</code> koi bhi int (negative bhi, -2³¹ tak). <code>x^n</code> nikaalna hai. Simple loop kyun nahi chalega aur better approach kya hai? Kaunse edge cases dhyaan rakhoge?",
      rubric: [
        { point: "Loop n baar = <b>O(n)</b>, n ~ 2×10⁹ pe bahut slow", keys: ["o(n)", "slow", "2^31", "10^9", "billion", "tle", "linear"] },
        { point: "Fast power: <b>x^n = (x^(n/2))²</b>, odd ho to ek extra x", keys: ["n/2", "half", "aadha", "square", "binary exponent", "fast power", "exponentiation"], weight: 2 },
        { point: "Half ko <b>ek hi baar</b> compute karo, complexity <b>O(log n)</b>", keys: ["log n", "logn", "o(log", "ek baar", "once", "reuse"], weight: 2 },
        { point: "Negative n: <b>1 / x^|n|</b>", keys: ["1/x", "1 / x", "reciprocal", "negative", "ulta"] },
        { point: "Edge: <b>n = Integer.MIN_VALUE</b> pe -n overflow, long use karo", keys: ["min_value", "overflow", "long", "-2147483648"], weight: 2 }
      ],
      answer: `<p>Loop se n multiplications: n = 2×10⁹ pe bahut slow. <b>Fast power:</b> <code>x^n = half × half</code> jahan <code>half = x^(n/2)</code>; n odd ho to ek <code>x</code> aur multiply. Har call n ko aadha karti hai: <b>O(log n) time, O(log n) stack space</b> (iterative version O(1) space).</p>
        <p><b>Negative n:</b> <code>x^-n = 1 / x^n</code>. <b>Trap:</b> <code>n = Integer.MIN_VALUE</code> pe <code>-n</code> int mein fit nahi hota (wapas MIN_VALUE hi rehta hai). Isliye pehle <code>long N = n</code> karo, phir negate.</p>`
    },
    {
      type: "exercise",
      id: "ex-pow",
      title: "Power(x, n)",
      level: "Medium",
      task: `<p>Return <code>x</code> raised to the power <code>n</code> without using <code>Math.pow</code>. <code>n</code> can be negative and can be any int value (−2³¹ ≤ n ≤ 2³¹ − 1). Use fast exponentiation (O(log n)).</p><p>Answers are compared with a 10⁻⁶ tolerance.</p><h4>Constraints</h4><ul><li>-2³¹ ≤ n ≤ 2³¹ − 1 (careful: −n overflows for n = −2³¹)</li><li>x is not 0 when n is negative</li></ul><p><a href="https://leetcode.com/problems/powx-n/" target="_blank">LeetCode 50</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  x = 2.0, n = 10
Output: 1024.0</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  x = 2.0, n = -2
Output: 0.25
Explanation: 2⁻² = 1/4</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    double myPow(double x, int n) {
        // O(n) loop: slow hai, aur negative n handle nahi karta
        double ans = 1;
        for (int i = 0; i < n; i++) ans *= x;
        return ans;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("x=2.0, n=10", 1024.0, () -> s.myPow(2.0, 10));
        Check.eq("x=2.1, n=3", 9.261, () -> s.myPow(2.1, 3));
        Check.eq("x=2.0, n=-2", 0.25, () -> s.myPow(2.0, -2));
        Check.hiddenFromHere();
        Check.eq("n=0", 1.0, () -> s.myPow(5.5, 0));
        Check.eq("negative base: x=-2, n=3", -8.0, () -> s.myPow(-2.0, 3));
        Check.eq("x=0, n=5", 0.0, () -> s.myPow(0.0, 5));
        Check.eq("n = Integer.MIN_VALUE, x=1.0", 1.0, () -> s.myPow(1.0, Integer.MIN_VALUE));
        Check.eq("n = Integer.MIN_VALUE, x=-1.0", 1.0, () -> s.myPow(-1.0, Integer.MIN_VALUE));
        double expected = Math.pow(1.0000000001, 1000000000);   // ~1.10517
        Check.eq("bada n: x=1.0000000001, n=1e9", expected, () -> s.myPow(1.0000000001, 1000000000));
    }
}`,
      hints: [
        "<code>x^10 = x^5 × x^5</code>. <code>x^5</code> ek baar nikaalo aur khud se multiply karo.",
        "Odd n: <code>x^5 = x^2 × x^2 × x</code>. Base case: <code>n == 0</code> → 1.",
        "Negative n ke liye <code>long N = n;</code> phir <code>if (N &lt; 0) { x = 1 / x; N = -N; }</code>. int mein -MIN_VALUE overflow hota hai."
      ],
      solution: `class Solution {
    double myPow(double x, int n) {
        long N = n;                 // -Integer.MIN_VALUE int mein fit nahi hota
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        return pow(x, N);
    }

    private double pow(double x, long n) {
        if (n == 0) return 1.0;     // base case
        double half = pow(x, n / 2);  // sirf EK recursive call
        return (n % 2 == 0) ? half * half : half * half * x;
    }
}`,
      explain: `<p><b>Approach:</b> divide and conquer. <code>half = x^(n/2)</code> ek baar nikaalo, phir <code>half²</code> (odd n pe <code>× x</code>). Negative n ko <code>1/x</code> aur <code>-n</code> (long mein) se positive banao.</p>
        <p><b>Time:</b> O(log n). <b>Space:</b> O(log n) recursion stack (~32 frames max).</p>
        <p><b>Galti:</b> <code>pow(x, n/2) * pow(x, n/2)</code> likhna. Do calls = recursion tree ke do children = O(n) wapas.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Har element pe choice: lo ya chhodo</h2>
        <p>Subsets generate karna recursion ka doosra basic roop hai. Har element ke liye <b>2 raaste</b>: subset mein lo, ya mat lo. n elements → 2ⁿ subsets.</p>
        <pre class="diagram">
                     []                      index 0: 1 lo / chhodo
               /            \\
            [1]              []              index 1: 2 lo / chhodo
           /    \\          /    \\
       [1,2]    [1]      [2]     []          index 2: 3 lo / chhodo
       /  \\    /  \\     /  \\    /  \\
 [1,2,3][1,2][1,3][1] [2,3][2] [3] []      ← leaves = 8 subsets
        </pre>
        <p>Code mein ek <code>current</code> list rakhte hain. "Lo" branch mein element add karke recurse, wapas aake <b>remove</b> (undo). Ise backtracking kehte hain, aage Backtracking lesson mein detail mein aayega.</p>`
    },
    {
      type: "think",
      id: "think-subsets",
      q: "<b>Subsets:</b> distinct integers ka array hai, saare possible subsets (power set) return karne hain. Recursion kaise design karoge? Time aur space complexity?",
      rubric: [
        { point: "Har index pe <b>2 choice: include ya exclude</b>", keys: ["include", "exclude", "lo ya", "pick", "not pick", "choice", "le lo", "chhod"], weight: 2 },
        { point: "Base case: index == n pe current ki <b>copy</b> answer mein daalo", keys: ["copy", "new arraylist", "index == n", "i == n", "base case", "end pe"], weight: 2 },
        { point: "Backtrack: add ke baad remove (undo)", keys: ["remove", "undo", "backtrack", "hata"] },
        { point: "Total <b>2ⁿ subsets</b>, time O(n · 2ⁿ) (har subset copy O(n))", keys: ["2^n", "2ⁿ", "n * 2", "n·2", "n2^n", "exponential"], weight: 2 }
      ],
      answer: `<p><code>dfs(i)</code>: agar <code>i == n</code> to <code>current</code> ki <b>copy</b> answer mein daalo (copy zaroori hai, warna sab entries ek hi list ko point karengi). Warna: (1) <code>nums[i]</code> add karo, <code>dfs(i+1)</code>, phir remove. (2) bina add kiye <code>dfs(i+1)</code>.</p>
        <p><b>Time:</b> 2ⁿ leaves, har ek pe O(n) copy → <b>O(n · 2ⁿ)</b>. <b>Space:</b> recursion depth O(n) (output chhod ke). Output khud O(n · 2ⁿ) hai, isse kam possible nahi.</p>`
    },
    {
      type: "exercise",
      id: "ex-subsets",
      title: "Subsets (saare subsets banao)",
      level: "Medium",
      task: `<p>All values in <code>nums</code> are distinct. Return <b>all subsets</b> of <code>nums</code>, including the empty one. The order of subsets and of elements inside a subset does not matter, but no subset may appear twice.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 16</li><li>All values are distinct</li></ul><p><a href="https://leetcode.com/problems/subsets/" target="_blank">LeetCode 78</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3]
Output: [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [0]
Output: [[],[0]]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> ans = new ArrayList<>();
        // yahan recursion likho
        return ans;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrderDeep("[1,2,3]",
            List.of(List.of(), List.of(1), List.of(2), List.of(3), List.of(1, 2), List.of(1, 3), List.of(2, 3), List.of(1, 2, 3)),
            () -> s.subsets(new int[]{1, 2, 3}));
        Check.eqAnyOrderDeep("[0]", List.of(List.of(), List.of(0)), () -> s.subsets(new int[]{0}));
        Check.hiddenFromHere();
        Check.eqAnyOrderDeep("empty []", List.of(List.of()), () -> s.subsets(new int[]{}));
        Check.eqAnyOrderDeep("negative [5,-1]", List.of(List.of(), List.of(5), List.of(-1), List.of(5, -1)), () -> s.subsets(new int[]{5, -1}));
        int[] big = new int[16];
        for (int i = 0; i < 16; i++) big[i] = i * 7 - 50;
        Check.eq("n=16: subsets ki ginti 2^16", 65536, () -> s.subsets(big).size());
        Check.eq("n=16: saare subsets alag", 65536, () -> {
            Set<List<Integer>> uniq = new HashSet<>();
            for (List<Integer> sub : s.subsets(big)) { List<Integer> c = new ArrayList<>(sub); Collections.sort(c); uniq.add(c); }
            return uniq.size();
        });
    }
}`,
      hints: [
        "Helper banao: <code>dfs(int i, int[] nums, List&lt;Integer&gt; cur, List&lt;List&lt;Integer&gt;&gt; ans)</code>.",
        "Base case <code>i == nums.length</code>: <code>ans.add(new ArrayList&lt;&gt;(cur))</code>. Copy banana zaroori hai.",
        "Recursive case: <code>cur.add(nums[i]); dfs(i + 1, ...); cur.remove(cur.size() - 1); dfs(i + 1, ...);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> ans = new ArrayList<>();
        dfs(0, nums, new ArrayList<>(), ans);
        return ans;
    }

    private void dfs(int i, int[] nums, List<Integer> cur, List<List<Integer>> ans) {
        if (i == nums.length) {
            ans.add(new ArrayList<>(cur));   // copy, kyunki cur aage badlegi
            return;
        }
        cur.add(nums[i]);                     // choice 1: lo
        dfs(i + 1, nums, cur, ans);
        cur.remove(cur.size() - 1);           // undo
        dfs(i + 1, nums, cur, ans);           // choice 2: chhodo
    }
}`,
      explain: `<p><b>Approach:</b> har index pe include/exclude, <code>i == n</code> pe current ki copy save.</p>
        <p><b>Time:</b> O(n · 2ⁿ). <b>Space:</b> O(n) recursion + current list (output ke alawa).</p>
        <p>Iterative alternative: <code>ans = [[]]</code> se shuru, har naye element ke liye har existing subset ki copy mein wo element jodo. Bitmask: 0 se 2ⁿ - 1 tak har number ke bits batate hain kaunse elements lene hain.</p>`
    },
    {
      type: "quiz",
      q: "Subsets code mein base case pe <code>ans.add(cur)</code> likh diya (copy ke bina). <code>[1,2]</code> ke liye kya return hoga?",
      options: [
        "<code>[[1,2],[1],[2],[]]</code> (sahi answer)",
        "<code>[[],[],[],[]]</code>: chaar baar same khaali list",
        "<code>[[1,2],[1,2],[1,2],[1,2]]</code>",
        "Compile error"
      ],
      answer: 1,
      why: "Saari entries <b>ek hi</b> <code>cur</code> object ko point karti hain. Recursion khatam hone tak har add ka remove ho chuka hota hai, to cur khaali hai, aur 4 baar wahi khaali list dikhti hai. Isliye <code>new ArrayList&lt;&gt;(cur)</code>."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Har recursion = base case + chhota sub-problem (leap of faith).</li><li>Complexity = recursion tree ke nodes × har node ka kaam; space = tree ki height.</li><li>Power(x, n): half ek baar compute karo → O(log n). n = MIN_VALUE ke liye long.</li><li>Subsets: har element pe lo/chhodo, base case pe copy. O(n · 2ⁿ).</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Recursive solution likhne se pehle bolo: <i>\"Base case ye hai, recursive case ye hai, recursion depth itni hogi.\"</i> Aur hamesha stack space ginwao. Agar depth 10⁵ tak ja sakti hai (jaise linked list pe recursion), to bolo ki Java ka default stack overflow kar sakta hai aur iterative version better hai."
    }
  ],
  references: [
    { title: "Pow(x, n)", by: "LeetCode", url: "https://leetcode.com/problems/powx-n/", type: "article" },
    { title: "Subsets", by: "LeetCode", url: "https://leetcode.com/problems/subsets/", type: "article" },
    { title: "Strivers A2Z DSA Sheet (recursion)", by: "Striver (takeUforward)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "takeUforward (YouTube)", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" }
  ]
});
