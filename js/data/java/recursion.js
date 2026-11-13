// Recursion
registerLesson("java", "recursion", {
  why: "Trees, backtracking, divide and conquer, DP: sab recursion pe khade hain. Interview mein base case bhoolna, call stack na samajhna, aur exponential fibonacci jaisi galtiyan seedha reject karwaati hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Recursion = method jo khud ko chhote input ke saath call kare</h2>
              <p>Problem ko <b>same type ki chhoti problem</b> mein todo. Example: ek folder ka size = uski files ka size + har sub-folder ka size (aur sub-folder ka size bhi isi tarah nikalega).</p>
              <p>Har recursive method ke <b>do hisse</b>:</p>
              <ol>
                <li><b>Base case</b>: sabse chhota input jiska answer seedha pata hai. Yahan recursion rukta hai. Ye nahi hai to method kabhi nahi rukega.</li>
                <li><b>Recursive case</b>: problem ko chhota karo aur khud ko call karo. Har call base case ki taraf <b>badhni</b> chahiye (n → n - 1, array aadha...).</li>
              </ol>
              <pre class="code-static">factorial(n) = n × factorial(n - 1)     // recursive case
factorial(0) = 1                         // base case</pre>
              <p>Likhne ka tareeka (\"leap of faith\"): maan lo <code>factorial(n - 1)</code> sahi answer deta hai. Ab sirf ye socho ki usse <code>factorial(n)</code> kaise banega. Poora tree dimaag mein chalane ki zaroorat nahi.</p>`
    },
    {
      type: "code",
      title: "Factorial, aur recursive call se pehle vs baad mein print",
      code: `public class Main {
    static long factorial(int n) {
        if (n <= 1) return 1;              // base case
        return n * factorial(n - 1);       // recursive case
    }

    static void countDown(int n) {
        if (n == 0) return;
        System.out.print(n + " ");         // call se PEHLE: jaate waqt print
        countDown(n - 1);
    }

    static void countUp(int n) {
        if (n == 0) return;
        countUp(n - 1);
        System.out.print(n + " ");         // call ke BAAD: wapas aate waqt print
    }

    static int sumDigits(int n) {
        if (n < 10) return n;
        return n % 10 + sumDigits(n / 10);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
        System.out.println(factorial(20));   // long ki limit ke paas; 21! overflow karega
        countDown(3);
        System.out.println();
        countUp(3);
        System.out.println();
        System.out.println(sumDigits(9045));
    }
}`
    },
    {
      type: "steps",
      title: "Call stack: factorial(3) kaise chalta hai",
      steps: [
        { title: "main ne factorial(3) call kiya", html: `<pre class="diagram">
 +----------------------+
 | factorial(3)  n=3    |  &lt;- top: 3 * factorial(2) ka intezaar
 +----------------------+
 | main                 |
 +----------------------+</pre><p>Har call ka apna <b>frame</b> stack pe push hota hai, apne <code>n</code> ke saath.</p>` },
        { title: "factorial(2), phir factorial(1)", html: `<pre class="diagram">
 +----------------------+
 | factorial(1)  n=1    |  &lt;- base case! return 1
 +----------------------+
 | factorial(2)  n=2    |  waiting: 2 * ?
 +----------------------+
 | factorial(3)  n=3    |  waiting: 3 * ?
 +----------------------+
 | main                 |
 +----------------------+</pre><p>Abhi tak koi multiplication nahi hua. Sab frames ruke hue hain.</p>` },
        { title: "Unwinding: factorial(1) ne 1 return kiya", html: `<pre class="diagram">
 +----------------------+
 | factorial(2)  n=2    |  2 * 1 = 2, return 2
 +----------------------+
 | factorial(3)  n=3    |  waiting: 3 * ?
 +----------------------+
 | main                 |
 +----------------------+</pre><p>Frame pop hua, value neeche wale frame ko mili.</p>` },
        { title: "factorial(3) = 3 * 2 = 6", html: `<pre class="diagram">
 +----------------------+
 | main                 |  result = 6
 +----------------------+</pre><p>Max depth = n frames. Isliye recursion ki <b>space complexity O(depth)</b> hai, chahe aap koi array na banao.</p>` }
      ]
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">static void f(int n) {
    if (n == 0) return;
    f(n - 1);
    System.out.print(n + " ");
    f(n - 1);
}
f(2);</pre>`,
      options: ["2 1 1", "1 2 1", "1 1 2", "2 1"],
      answer: 1,
      why: "<code>f(2)</code> → pehle <code>f(1)</code> (jo f(0), print 1, f(0) karta hai) → <b>1</b>. Phir print <b>2</b>. Phir doosra <code>f(1)</code> → <b>1</b>. Output <code>1 2 1</code>. Ye in-order tree traversal jaisa pattern hai."
    },
    {
      type: "code",
      title: "Base case bhool gaye: StackOverflowError",
      code: `public class Main {
    static int depth = 0;

    static void noBase(int n) {
        depth++;
        noBase(n + 1);          // kabhi nahi rukega
    }

    public static void main(String[] args) {
        try {
            noBase(0);
        } catch (StackOverflowError e) {
            // Sirf demo ke liye pakda hai. Asli code mein Error ko catch nahi karte.
            System.out.println("StackOverflowError! Lagbhag " + depth + " calls ke baad stack bhar gaya");
        }
        System.out.println("Depth machine, JVM aur stack size (-Xss) pe depend karti hai");
    }
}`,
      note: "Number har machine pe alag aayega. Point ye hai ki stack ki size limited hai (har thread ki), aur har call ek frame leta hai. HotSpot JVM <b>tail-call optimization nahi karta</b>, to <code>return f(n - 1)</code> jaisa likhne se bhi frame bachta nahi."
    },
    {
      type: "text",
      html: `
              <h2>Fibonacci: recursion ka sabse bada trap</h2>
              <p><code>fib(n) = fib(n - 1) + fib(n - 2)</code>, <code>fib(0) = 0</code>, <code>fib(1) = 1</code>. Seedha recursive likho to har call <b>do</b> calls karta hai:</p>
              <pre class="diagram">
                    fib(5)
                 /          \\
            fib(4)          fib(3)       &lt;- fib(3) do baar
           /      \\         /    \\
       fib(3)   fib(2)   fib(2)  fib(1)  &lt;- fib(2) teen baar
       /   \\
   fib(2) fib(1)    ...</pre>
              <p>Same values baar baar calculate ho rahi hain (<b>overlapping subproblems</b>). Calls ~2<sup>n</sup> badhte hain: <b>O(2ⁿ)</b>. fib(50) mein arabon calls.</p>
              <p><b>Fix: memoization.</b> Ek baar nikala hua answer array/map mein rakho, dobara aaye to wahi return. Har n ek baar: <b>O(n)</b> time, O(n) space. Ya simple loop se do variables mein: O(n) time, O(1) space. Ye DP ki shuruaat hai.</p>`
    },
    {
      type: "code",
      title: "Naive vs memoized fibonacci: calls gino",
      code: `public class Main {
    static long calls = 0;

    static long fibNaive(int n) {
        calls++;
        if (n <= 1) return n;
        return fibNaive(n - 1) + fibNaive(n - 2);
    }

    static long[] memo = new long[100];

    static long fibMemo(int n) {
        calls++;
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];          // pehle se nikala hua
        memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
        return memo[n];
    }

    public static void main(String[] args) {
        calls = 0;
        System.out.println("naive fib(25) = " + fibNaive(25) + ", calls = " + calls);
        calls = 0;
        System.out.println("memo  fib(25) = " + fibMemo(25) + ", calls = " + calls);
        calls = 0;
        System.out.println("memo  fib(90) = " + fibMemo(90) + ", calls = " + calls);
        // fibNaive(90) chalaoge to saalon lagenge
    }
}`
    },
    {
      type: "quiz",
      q: "Naive recursive <code>fib(n)</code> ki time aur space complexity kya hai?",
      options: ["Time O(n), space O(n)", "Time O(2ⁿ), space O(2ⁿ)", "Time O(2ⁿ), space O(n)", "Time O(n²), space O(1)"],
      answer: 2,
      why: "Calls ka tree exponential hai: <b>O(2ⁿ)</b> time (tighter bound ~1.618ⁿ). Par ek waqt pe stack mein sirf ek raasta (root se leaf tak) hota hai, jiski length n hai: <b>O(n) space</b>. Time aur space alag cheezein ginte hain, ye interview mein clearly bolo."
    },
    {
      type: "exercise",
      id: "ex-fact-fib",
      title: "Factorial aur fast fibonacci",
      level: "Easy",
      task: "<p>Do methods recursion se likho:</p><ul><li><code>factorial(n)</code> (0 ≤ n ≤ 20), <code>long</code> return. <code>0! = 1</code>.</li><li><code>fib(n)</code> (0 ≤ n ≤ 90), <code>long</code> return. Hidden test mein <b>fib(90)</b> hai, naive recursion time out ho jaayega. <a href=\"https://leetcode.com/problems/fibonacci-number/\" target=\"_blank\">LeetCode 509</a></li></ul>",
      examples: "<code>factorial(5)</code> → <code>120</code><br><code>fib(10)</code> → <code>55</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    long factorial(int n) {
        return n * factorial(n - 1);    // kuch missing hai?
    }

    long fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("factorial(5)", 120L, () -> s.factorial(5));
        Check.eq("fib(10)", 55L, () -> s.fib(10));
        Check.hiddenFromHere();
        Check.eq("factorial(0)", 1L, () -> s.factorial(0));
        Check.eq("factorial(1)", 1L, () -> s.factorial(1));
        Check.eq("factorial(20)", 2432902008176640000L, () -> s.factorial(20));
        Check.eq("fib(0)", 0L, () -> s.fib(0));
        Check.eq("fib(1)", 1L, () -> s.fib(1));
        Check.eq("fib(50)", 12586269025L, () -> s.fib(50));
        Check.eq("fib(90)", 2880067194370816120L, () -> s.fib(90));
    }
}`,
      hints: [
        "factorial mein base case nahi hai: <code>if (n &lt;= 1) return 1;</code>",
        "fib ke liye ek <code>long[] memo</code> field banao. Answer nikalne se pehle check karo ki memo mein hai ya nahi.",
        "<code>if (memo[n] != 0) return memo[n]; memo[n] = fib(n - 1) + fib(n - 2); return memo[n];</code>"
      ],
      solution: `class Solution {
    private final long[] memo = new long[91];

    long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    long fib(int n) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = fib(n - 1) + fib(n - 2);
        return memo[n];
    }
}`,
      explain: "<p>factorial: O(n) time, O(n) stack. fib with memo: har n ek hi baar compute hota hai, <b>O(n) time, O(n) space</b>. Naive fib(90) ko ~10<sup>18</sup> calls chahiye the.</p><p>Follow-up: iterative version (<code>a, b = b, a + b</code>) O(1) space deta hai aur stack overflow ka risk bhi nahi.</p>"
    },
    {
      type: "exercise",
      id: "ex-pow",
      title: "power(x, n) in O(log n)",
      level: "Medium",
      task: "<p><code>myPow(x, n)</code>: x<sup>n</sup> return karo, n negative bhi ho sakta hai (x<sup>-n</sup> = 1 / x<sup>n</sup>). <code>Math.pow</code> use mat karo. n ki range poori <code>int</code> hai, to n baar multiply karna slow hoga aur n-depth recursion stack overflow karegi. <a href=\"https://leetcode.com/problems/powx-n/\" target=\"_blank\">LeetCode 50</a></p>",
      examples: "<code>myPow(2.0, 10)</code> → <code>1024.0</code><br><code>myPow(2.0, -2)</code> → <code>0.25</code><br><code>myPow(2.1, 3)</code> → <code>9.261</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    double myPow(double x, int n) {
        if (n == 0) return 1.0;
        return x * myPow(x, n - 1);
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("myPow(2.0, 10)", 1024.0, () -> s.myPow(2.0, 10));
        Check.eq("myPow(2.0, -2)", 0.25, () -> s.myPow(2.0, -2));
        Check.eq("myPow(2.1, 3)", 9.261, () -> s.myPow(2.1, 3));
        Check.hiddenFromHere();
        Check.eq("myPow(5.0, 0)", 1.0, () -> s.myPow(5.0, 0));
        Check.eq("myPow(-2.0, 3)", -8.0, () -> s.myPow(-2.0, 3));
        Check.eq("myPow(0.5, -3)", 8.0, () -> s.myPow(0.5, -3));
        Check.eq("myPow(1.0, Integer.MAX_VALUE)", 1.0, () -> s.myPow(1.0, Integer.MAX_VALUE));
        Check.eq("myPow(-1.0, Integer.MIN_VALUE)", 1.0, () -> s.myPow(-1.0, Integer.MIN_VALUE));
        Check.eq("myPow(2.0, Integer.MIN_VALUE)", 0.0, () -> s.myPow(2.0, Integer.MIN_VALUE));
    }
}`,
      hints: [
        "x<sup>10</sup> = (x<sup>5</sup>)². x<sup>5</sup> = x × (x<sup>2</sup>)². Har step pe n aadha: sirf ~31 calls.",
        "<code>half = pow(x, n / 2)</code> ek hi baar call karo (do baar call kiya to phir O(n) ho jaayega). Even n: <code>half * half</code>, odd: <code>half * half * x</code>.",
        "Negative n: <code>-Integer.MIN_VALUE</code> int mein overflow karta hai. n ko <code>long</code> mein lo: <code>long N = n; if (N &lt; 0) { x = 1 / x; N = -N; }</code>"
      ],
      solution: `class Solution {
    double myPow(double x, int n) {
        long N = n;                 // MIN_VALUE ko positive karne ke liye long
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        return pow(x, N);
    }

    private double pow(double x, long n) {
        if (n == 0) return 1.0;
        double half = pow(x, n / 2);   // sirf ek recursive call
        return (n % 2 == 0) ? half * half : half * half * x;
    }
}`,
      explain: "<p><b>Fast exponentiation</b>: har call n ko aadha karta hai, to depth ~log₂(2³¹) = 31. <b>O(log n) time, O(log n) stack</b>. Pehle wala code O(n) calls karta tha, n = 2 × 10⁹ pe StackOverflowError.</p><p>Traps: (1) <code>pow(x, n/2)</code> do baar call karna (phir se O(n)). (2) <code>-Integer.MIN_VALUE</code> int mein wapas MIN_VALUE hi rehta hai, isliye long.</p>"
    },
    {
      type: "think",
      id: "think-recursion",
      q: "Interview question: <b>\"Recursion kab use karoge aur kab iteration? Production code mein recursion ka kya risk hai?\"</b>",
      rubric: [
        { point: "Recursion natural hai jab problem khud recursive ho: trees, graphs (DFS), divide and conquer, backtracking", keys: ["tree", "dfs", "divide", "backtrack", "merge sort", "nested"], weight: 2 },
        { point: "Risk: depth zyada ho to <b>StackOverflowError</b> (stack size limited)", keys: ["stackoverflow", "stack overflow", "stack size", "depth"], weight: 2 },
        { point: "Java (HotSpot) <b>tail-call optimization nahi</b> karta", keys: ["tail call", "tail-call", "tco", "tail recursion"] },
        { point: "Har call ka frame overhead; overlapping subproblems ho to memoization / DP", keys: ["memo", "dp", "overhead", "overlapping", "cache"] },
        { point: "Deep input pe iterative version ya explicit stack (<code>Deque</code>) use karo", keys: ["iterative", "loop", "explicit stack", "deque", "stack khud"] }
      ],
      answer: `<p><b>Recursion kab:</b> jab problem ka structure recursive ho. Tree traversal, DFS, merge sort / quick sort, backtracking (permutations, N-Queens), nested JSON / folders. Code chhota aur sahi likhna aasan.</p>
                <p><b>Risks:</b></p>
                <ol><li><b>StackOverflowError</b>: har call ek frame leta hai, aur thread ka stack limited hai. 10 lakh nodes ki linked list ya skewed tree pe recursive DFS crash kar sakta hai.</li>
                <li><b>Tail-call optimization nahi</b>: HotSpot JVM tail calls ko loop mein nahi badalta, to Scala/Haskell wali tricks Java mein kaam nahi karti.</li>
                <li><b>Overhead aur repeated work</b>: har call ka cost hai, aur fibonacci jaise overlapping subproblems exponential ho jaate hain. Memoization ya bottom-up DP lagao.</li></ol>
                <p><b>Production rule:</b> input ki depth bounded hai (balanced tree, log n) to recursion theek. Depth user data pe depend karti hai to iterative version ya explicit <code>ArrayDeque</code> stack use karo.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Recursive solution likhne se pehle zor se bolo: <b>\"Base case ye hai, recursive case ye hai, har call input ko ... se chhota karti hai.\"</b> Phir complexity do baar bolo: time (kitni calls × har call ka kaam) aur space (max recursion depth). Interviewers yahi structure sunna chahte hain."
    }
  ],
  references: [
    { title: "StackOverflowError (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StackOverflowError.html", type: "docs" },
    { title: "Pow(x, n)", by: "LeetCode", url: "https://leetcode.com/problems/powx-n/", type: "article" },
    { title: "Fibonacci Number", by: "LeetCode", url: "https://leetcode.com/problems/fibonacci-number/", type: "article" },
    { title: "Striver A2Z DSA sheet (recursion section)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
