// Big-O aur complexity
registerLesson("dsa", "big-o", {
  why: "Har DSA interview mein code ke baad pehla follow-up hota hai: \"time aur space complexity kya hai?\". Aur constraints padh ke sahi complexity guess karna aapko galat approach pe 20 minute barbaad karne se bachata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Complexity kya naapti hai?</h2>
        <p>Big-O ye batata hai ki <b>input bada hone pe kaam kitni tezi se badhta hai</b>. Ye seconds nahi naapta, kyunki seconds machine pe depend karte hain. Ye "kitne steps" ka growth naapta hai.</p>
        <ul>
          <li><b>Time complexity:</b> n elements ke liye kitne basic operations (compare, add, array access).</li>
          <li><b>Space complexity:</b> input ke alawa kitni extra memory (naya array, HashMap, recursion stack).</li>
        </ul>
        <p>Example: Swiggy pe 10 restaurants mein se sabse sasta dhoondhna aur 10 lakh mein se dhoondhna. Agar har restaurant ek baar dekhte ho, to kaam 1 lakh guna badhta hai (linear). Agar har pair compare karte ho, to kaam 10<sup>10</sup> guna badhta hai. Big-O yahi farak pakadta hai.</p>
        <h3>3 rules jo hamesha lagte hain</h3>
        <ol>
          <li><b>Constants hatao:</b> 3n + 5 → O(n). 2 loops ek ke baad ek → O(n) + O(n) = O(n).</li>
          <li><b>Sabse bada term rakho:</b> n² + n log n + n → O(n²).</li>
          <li><b>Alag inputs ke alag naam:</b> do arrays (size a aur b) pe nested loop → O(a·b), O(n²) nahi.</li>
        </ol>`
    },
    {
      type: "text",
      html: `
        <h2>Common complexities: chhote se bada</h2>
        <table>
          <tr><th>Big-O</th><th>Naam</th><th>n = 10⁵ pe approx steps</th><th>Typical code</th></tr>
          <tr><td>O(1)</td><td>constant</td><td>1</td><td>array index, HashMap get/put (average)</td></tr>
          <tr><td>O(log n)</td><td>logarithmic</td><td>~17</td><td>binary search, har step pe aadha</td></tr>
          <tr><td>O(n)</td><td>linear</td><td>10⁵</td><td>ek loop, ek pass</td></tr>
          <tr><td>O(n log n)</td><td>linearithmic</td><td>~1.7 × 10⁶</td><td>sorting (<code>Arrays.sort</code>), heap mein n inserts</td></tr>
          <tr><td>O(n²)</td><td>quadratic</td><td>10¹⁰</td><td>nested loop, har pair</td></tr>
          <tr><td>O(2ⁿ)</td><td>exponential</td><td>bahut zyada (n=30 pe hi ~10⁹)</td><td>saare subsets</td></tr>
          <tr><td>O(n!)</td><td>factorial</td><td>n=12 pe hi ~4.8 × 10⁸</td><td>saare permutations</td></tr>
        </table>
        <pre class="diagram">
n = 1000 pe steps (har # approx 10x)
O(1)        #                         1
O(log n)    ##                        ~10
O(n)        ####                      1,000
O(n log n)  #####                     ~10,000
O(n²)       #######                   1,000,000
O(2ⁿ)       ########################  10³⁰⁰ se zyada
        </pre>
        <p>Rough rule: ek normal machine ek second mein approx <b>10⁸ simple operations</b> karti hai. Ye exact number nahi hai, par estimate ke liye kaafi hai.</p>`
    },
    {
      type: "code",
      title: "Steps gin ke dekho: n double karne pe O(n) aur O(n²) kaise badhte hain",
      code: `public class Main {
    static long linear(int n) {
        long steps = 0;
        for (int i = 0; i < n; i++) steps++;
        return steps;
    }

    static long quadratic(int n) {
        long steps = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) steps++;
        return steps;
    }

    static long logarithmic(int n) {
        long steps = 0;
        for (int i = n; i > 1; i /= 2) steps++;   // har baar aadha
        return steps;
    }

    public static void main(String[] args) {
        System.out.println("n      | log n | n      | n^2");
        for (int n = 1000; n <= 8000; n *= 2) {
            System.out.printf("%-6d | %-5d | %-6d | %d%n", n, logarithmic(n), linear(n), quadratic(n));
        }
        // n double hua: log n mein +1, n double, n^2 chaar guna
    }
}`,
      note: "n ko 2 guna karne pe O(n²) wala kaam <b>4 guna</b> hota hai, aur O(log n) mein sirf <b>ek step</b> badhta hai."
    },
    {
      type: "quiz",
      q: `Is code ki time complexity kya hai?<pre class="code-static">for (int i = 0; i &lt; n; i++) {
    for (int j = i; j &lt; n; j++) {
        count++;
    }
}</pre>`,
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: 2,
      why: "Inner loop pehli baar n, phir n-1, ... 1 baar chalta hai. Total n(n+1)/2. Constant (1/2) hatao, answer O(n²). j ka i se shuru hona complexity nahi badalta."
    },
    {
      type: "quiz",
      q: `Is code ki time complexity kya hai?<pre class="code-static">for (int i = 1; i &lt; n; i *= 2) {
    for (int j = 0; j &lt; n; j++) {
        work();
    }
}</pre>`,
      options: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"],
      answer: 1,
      why: "Bahar wala loop i ko double karta hai, to wo log₂ n baar chalta hai. Har baar andar wala n baar. Total O(n log n)."
    },
    {
      type: "quiz",
      q: `Is code ki time complexity kya hai?<pre class="code-static">for (int i = 1; i &lt; n; i *= 2) {
    for (int j = 0; j &lt; i; j++) {
        work();
    }
}</pre>`,
      options: ["O(n log n)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      why: "Andar wala loop 1, 2, 4, 8, ... n tak chalta hai. Ye geometric series hai: 1 + 2 + 4 + ... + n ≈ 2n. To O(n). Ye trap hai: dono loops dekh ke log O(n log n) bol dete hain."
    },
    {
      type: "quiz",
      q: `<code>fib(n)</code> ki time complexity kya hai (bina memo ke)?<pre class="code-static">int fib(int n) {
    if (n &lt;= 1) return n;
    return fib(n - 1) + fib(n - 2);
}</pre>`,
      options: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"],
      answer: 2,
      why: "Har call 2 calls karti hai, aur tree ki depth n hai. Upper bound O(2ⁿ) (tight bound approx 1.618ⁿ). Space O(n) hai, kyunki ek waqt pe recursion stack mein sirf ek path (depth n) hota hai."
    },
    {
      type: "text",
      html: `
        <h2>Constraints padh ke complexity guess karo</h2>
        <p>Interview ya LeetCode pe constraints sabse bada hint hain. 10⁸ operations/second ko dhyaan mein rakh ke:</p>
        <table>
          <tr><th>n kitna hai</th><th>Kaunsi complexity chalegi</th><th>Kaunsa approach socho</th></tr>
          <tr><td>n ≤ 10–12</td><td>O(n!)</td><td>permutations, backtracking</td></tr>
          <tr><td>n ≤ 20–25</td><td>O(2ⁿ)</td><td>subsets, bitmask</td></tr>
          <tr><td>n ≤ 500</td><td>O(n³)</td><td>3 nested loops, interval DP</td></tr>
          <tr><td>n ≤ 5000</td><td>O(n²)</td><td>nested loops, 2D DP</td></tr>
          <tr><td>n ≤ 10⁵ – 10⁶</td><td>O(n log n) ya O(n)</td><td>sorting, heap, two pointers, sliding window, HashMap</td></tr>
          <tr><td>n ≤ 10⁹ ya zyada</td><td>O(log n) ya O(1)</td><td>binary search, math formula</td></tr>
        </table>
        <p>Matlab: agar n = 10⁵ hai aur aapke dimaag mein nested loop aaya, to <b>code likhne se pehle</b> ruko. O(n²) = 10¹⁰ steps, matlab ~100 second. Time Limit Exceeded pakka.</p>`
    },
    {
      type: "pick",
      id: "pick-space",
      q: "Inme se kaunse code <b>O(n) extra space</b> lete hain? (n = input size)",
      options: [
        { text: "Input array ke saare elements ek <code>HashSet</code> mein daalna", correct: true, why: "Worst case mein n elements set mein jaate hain." },
        { text: "Do variables <code>min</code> aur <code>max</code> se array scan karna", correct: false, why: "Sirf 2 variables, n se independent. O(1)." },
        { text: "Recursion jo n se 0 tak ek-ek karke ghatata hai: <code>f(n) = f(n-1) + 1</code>", correct: true, why: "Recursion stack mein n frames ek saath hote hain. Recursion ka stack bhi space hai, ye log bhool jaate hain." },
        { text: "Array ko in-place reverse karna (do pointers se swap)", correct: false, why: "Sirf swap ke liye ek temp variable. O(1)." },
        { text: "Prefix sum ke liye naya <code>int[n+1]</code> banana", correct: true, why: "Naya array size n+1, to O(n)." },
        { text: "Binary search (iterative)", correct: false, why: "lo, hi, mid: teen variables. O(1). Recursive binary search O(log n) stack leta." }
      ],
      answer: "Extra space mein naye data structures <b>aur recursion stack</b> dono gine jaate hain. Output array ko aksar alag se bolte hain (\"output ke alawa O(1)\")."
    },
    {
      type: "think",
      id: "think-constraints",
      q: "Problem: \"Array mein koi do numbers ka sum <code>target</code> ke barabar hai kya?\" Constraint: <b>n ≤ 2 × 10⁵</b>. Brute force kya hai, uski complexity kya hai, kya wo chalega? Aur kaunsi complexity chahiye?",
      rubric: [
        { point: "Brute force: har pair check karo, <b>O(n²)</b>", keys: ["o(n^2)", "o(n²)", "n^2", "n²", "n square", "nested", "har pair", "every pair"], weight: 2 },
        { point: "n = 2×10⁵ pe n² = 4×10¹⁰, 10⁸/sec ke hisaab se <b>bahut slow (TLE)</b>", keys: ["tle", "time limit", "slow", "10^10", "10¹⁰", "4x10", "nahi chalega", "too slow"], weight: 2 },
        { point: "Target: <b>O(n log n) ya O(n)</b>", keys: ["n log n", "nlogn", "o(n)", "linear"], weight: 2 },
        { point: "Tareeka: HashSet (O(n)) ya sort + two pointers (O(n log n))", keys: ["hashset", "hashmap", "hash", "set", "sort", "two pointer", "do pointer"] }
      ],
      answer: `<p><b>Brute force:</b> do nested loops se har pair (i, j) check karo. Steps ≈ n²/2 = 2×10¹⁰. 10⁸ ops/sec pe ~200 second. TLE.</p>
        <p><b>Constraint ka matlab:</b> n ≤ 2×10⁵ bol raha hai ki O(n log n) ya O(n) chahiye.</p>
        <p><b>Options:</b> (1) Ek <code>HashSet</code> mein ab tak ke numbers rakho, har x ke liye <code>target - x</code> dhoondho: O(n) time, O(n) space. (2) Sort karke two pointers: O(n log n) time, O(1) extra (sort ka stack chhod ke). Interview mein dono batao aur trade-off bolo.</p>`
    },
    {
      type: "exercise",
      id: "ex-contains-duplicate",
      title: "Duplicate hai kya? (O(n²) se O(n))",
      level: "Easy",
      task: `<p>Return <code>true</code> if any value appears <b>at least twice</b> in <code>nums</code>, and <code>false</code> if every value is distinct.</p><p>The starter code uses a nested loop (O(n²)). It also has a bug, and a hidden test uses n = 10⁵. Fix it and make it O(n).</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>-10⁹ ≤ nums[i] ≤ 10⁹</li></ul><p><a href="https://leetcode.com/problems/contains-duplicate/" target="_blank">LeetCode 217</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,3,1]
Output: true
Explanation: 1 appears at index 0 and 3.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1,2,3,4]
Output: false</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    boolean hasDuplicate(int[] nums) {
        // O(n^2): har pair compare (aur ek bug bhi hai: j = i se shuru)
        for (int i = 0; i < nums.length; i++) {
            for (int j = i; j < nums.length; j++) {
                if (nums[i] == nums[j]) return true;
            }
        }
        return false;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,1]", true, () -> s.hasDuplicate(new int[]{1, 2, 3, 1}));
        Check.eq("[1,2,3,4]", false, () -> s.hasDuplicate(new int[]{1, 2, 3, 4}));
        Check.hiddenFromHere();
        Check.eq("empty", false, () -> s.hasDuplicate(new int[]{}));
        Check.eq("single", false, () -> s.hasDuplicate(new int[]{7}));
        Check.eq("negatives [-1,-2,-1]", true, () -> s.hasDuplicate(new int[]{-1, -2, -1}));
        int n = 100000;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = i * 3 - 150000;   // sab distinct
        Check.eq("bada input n=1e5, sab distinct", false, () -> s.hasDuplicate(big));
        int[] big2 = big.clone();
        big2[n - 1] = big2[0];
        Check.eq("bada input n=1e5, last == first", true, () -> s.hasDuplicate(big2));
    }
}`,
      hints: [
        "Starter ka bug: <code>j = i</code> se shuru karne pe har element khud se match ho jaata hai. Par asli problem speed hai.",
        "Ab tak dekhe gaye numbers kahin yaad rakho jahan \"ye pehle aaya tha kya?\" O(1) mein pata chale.",
        "<code>HashSet&lt;Integer&gt; seen</code>: <code>if (!seen.add(x)) return true;</code> (<code>add</code> false deta hai agar element pehle se hai)."
      ],
      solution: `import java.util.*;

class Solution {
    boolean hasDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) return true;   // pehle se tha
        }
        return false;
    }
}`,
      explain: `<p><b>Approach:</b> ek pass, har number <code>HashSet</code> mein daalo. Agar <code>add</code> false de, matlab duplicate mila.</p>
        <p><b>Time:</b> O(n) average (HashSet add O(1) average). <b>Space:</b> O(n).</p>
        <p><b>Alternative:</b> sort karke adjacent compare: O(n log n) time, O(1) extra space (agar input modify kar sakte ho). Interview mein ye trade-off (time vs space) bolna point deta hai.</p>`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> library calls ko O(1) maan lena. <code>list.contains(x)</code> ArrayList pe O(n) hai, <code>list.remove(0)</code> O(n) hai, <code>s1 + s2</code> String concat O(length) hai, aur <code>Arrays.sort</code> O(n log n). Loop ke andar ye calls complexity ko ek level badha deti hain."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Big-O growth naapta hai, seconds nahi. Constants aur chhote terms hatao.</li><li>Loop ka step dekho: +1 → O(n), ×2 → O(log n), nested → guna karo. Geometric series (1+2+4+…+n) O(n) hai.</li><li>Space mein recursion stack bhi ginti mein aata hai.</li><li>Constraints se target nikaalo: n ≤ 10⁵ → O(n log n) ya O(n); ~10⁸ ops/sec maan ke chalo.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Complexity batate waqt variables ka naam lo aur kaaran do: <i>\"Time O(n log n) kyunki sort dominate karta hai, baaki ek pass O(n) hai. Space O(n) HashMap ke liye.\"</i> Sirf \"O(n)\" bolne se interviewer follow-up poochhega. Recursion ho to stack space khud bolo."
    }
  ],
  references: [
    { title: "Contains Duplicate", by: "LeetCode", url: "https://leetcode.com/problems/contains-duplicate/", type: "article" },
    { title: "Strivers A2Z DSA Sheet (time complexity section)", by: "Striver (takeUforward)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "NeetCode Roadmap", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" },
    { title: "Hello Interview: Coding", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" }
  ]
});
