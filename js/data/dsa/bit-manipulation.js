// Bit Manipulation (basics)
registerLesson("dsa", "bit-manipulation", {
  why: "Kuch questions ka sabse saaf answer bits mein hai: \"ek hi number akela hai baaki sab do baar\", \"power of two hai kya\", \"kitne 1 bits\". Ye O(1) space wale tricks hain jo interviewer follow-up mein poochta hai (\"bina extra space ke karo\").",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Binary 1 minute mein</h2>
        <p>Computer numbers ko bits mein rakhta hai. <code>13 = 1101</code> (8 + 4 + 0 + 1). Java <code>int</code> 32 bits ka hai, negative numbers <b>two's complement</b> mein: <code>-x = ~x + 1</code>.</p>
        <table>
          <tr><th>Operator</th><th>Matlab</th><th>Example (6 = 110, 3 = 011)</th></tr>
          <tr><td><code>&amp;</code></td><td>dono 1 → 1</td><td>6 &amp; 3 = 010 = 2</td></tr>
          <tr><td><code>|</code></td><td>koi ek 1 → 1</td><td>6 | 3 = 111 = 7</td></tr>
          <tr><td><code>^</code> (XOR)</td><td>alag → 1, same → 0</td><td>6 ^ 3 = 101 = 5</td></tr>
          <tr><td><code>~</code></td><td>saare bits ulte</td><td>~6 = -7</td></tr>
          <tr><td><code>&lt;&lt; k</code></td><td>left shift = × 2ᵏ</td><td>3 &lt;&lt; 2 = 12</td></tr>
          <tr><td><code>&gt;&gt; k</code></td><td>right shift (sign rakhta hai)</td><td>-8 &gt;&gt; 1 = -4</td></tr>
          <tr><td><code>&gt;&gt;&gt; k</code></td><td>right shift, left mein 0 bharta hai</td><td>-8 &gt;&gt;&gt; 28 = 15</td></tr>
        </table>
        <h2>XOR ke 3 rules (sabse kaam ke)</h2>
        <ul>
          <li><code>a ^ a = 0</code> (same number cancel)</li>
          <li><code>a ^ 0 = a</code></li>
          <li>Order matter nahi karta (commutative + associative): <code>a ^ b ^ a = b</code></li>
        </ul>
        <h2>Common tricks</h2>
        <table>
          <tr><th>Kaam</th><th>Code</th></tr>
          <tr><td>i-th bit set hai?</td><td><code>(x &gt;&gt; i &amp; 1) == 1</code></td></tr>
          <tr><td>i-th bit set karo / hatao / flip</td><td><code>x | (1 &lt;&lt; i)</code>, <code>x &amp; ~(1 &lt;&lt; i)</code>, <code>x ^ (1 &lt;&lt; i)</code></td></tr>
          <tr><td>Sabse neeche wala 1 bit hatao</td><td><code>x &amp; (x - 1)</code></td></tr>
          <tr><td>Sabse neeche wala 1 bit akela</td><td><code>x &amp; -x</code></td></tr>
          <tr><td>Power of two?</td><td><code>x &gt; 0 &amp;&amp; (x &amp; (x - 1)) == 0</code></td></tr>
          <tr><td>Even/odd</td><td><code>(x &amp; 1) == 0</code> → even</td></tr>
        </table>
        <p>Real use: Linux file permissions (rwx = 3 bits), feature flags ek int mein, Bloom filters, aur Redis ke <code>SETBIT</code>/<code>BITCOUNT</code> se daily active users track karna.</p>`
    },
    {
      type: "code",
      title: "Tricks chala ke dekho",
      code: `public class Main {
    public static void main(String[] args) {
        int x = 44;                                     // 101100
        System.out.println("44 binary:       " + Integer.toBinaryString(x));
        System.out.println("bit 2 set?       " + ((x >> 2 & 1) == 1));
        System.out.println("x & (x-1):       " + Integer.toBinaryString(x & (x - 1)) + "  (lowest 1 hata)");
        System.out.println("x & -x:          " + Integer.toBinaryString(x & -x) + "  (lowest 1 akela)");
        System.out.println("bitCount(44):    " + Integer.bitCount(x));
        for (int n : new int[]{1, 6, 16, 0, -16}) {
            System.out.println(n + " power of two? " + (n > 0 && (n & (n - 1)) == 0));
        }
        System.out.println("-8 >> 1  = " + (-8 >> 1));
        System.out.println("-8 >>> 28 = " + (-8 >>> 28));

        // Feature flags: ek int mein 32 on/off switches
        final int DARK_MODE = 1, BETA = 1 << 1, VEG_ONLY = 1 << 2;
        int settings = DARK_MODE | VEG_ONLY;
        System.out.println("veg only on? " + ((settings & VEG_ONLY) != 0) + ", beta on? " + ((settings & BETA) != 0));
    }
}`
    },
    {
      type: "quiz",
      q: "<code>System.out.println(5 ^ 3 ^ 5);</code> kya print karega?",
      options: ["13", "3", "0", "5"],
      answer: 1,
      why: "XOR order-independent hai: 5 ^ 5 = 0, aur 0 ^ 3 = 3. Single Number problem isi property pe chalta hai."
    },
    {
      type: "steps",
      title: "XOR dry run: [4, 1, 2, 1, 2] (akela number dhoondho)",
      steps: [
        { title: "res = 0", html: `<div class="arr"><span class="cell">4</span><span class="cell">1</span><span class="cell">2</span><span class="cell">1</span><span class="cell">2</span></div><p>res = 000</p>` },
        { title: "res ^= 4 → 100 (4)", html: `<div class="arr"><span class="cell hl">4</span><span class="cell">1</span><span class="cell">2</span><span class="cell">1</span><span class="cell">2</span></div><p>000 ^ 100 = <b>100</b></p>` },
        { title: "res ^= 1 → 101 (5), res ^= 2 → 111 (7)", html: `<div class="arr"><span class="cell ok">4</span><span class="cell hl">1</span><span class="cell hl">2</span><span class="cell">1</span><span class="cell">2</span></div><p>100 ^ 001 = 101, 101 ^ 010 = <b>111</b></p>` },
        { title: "res ^= 1 → 110 (6): 1 cancel", html: `<div class="arr"><span class="cell ok">4</span><span class="cell dim">1</span><span class="cell ok">2</span><span class="cell hl dim">1</span><span class="cell">2</span></div><p>111 ^ 001 = <b>110</b>. Dono 1 ek doosre ko kaat gaye.</p>` },
        { title: "res ^= 2 → 100 (4): 2 bhi cancel", html: `<div class="arr"><span class="cell ok">4</span><span class="cell dim">1</span><span class="cell dim">2</span><span class="cell dim">1</span><span class="cell dim">2</span></div><p>110 ^ 010 = <b>100 = 4</b>. Jo bacha wahi akela number. O(n) time, O(1) space.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-single",
      q: "<b>Single Number:</b> array mein har number exactly do baar hai, sirf ek number ek baar. Use dhoondho, O(n) time aur <b>O(1) extra space</b> mein. HashMap kyun nahi? XOR kyun kaam karta hai?",
      rubric: [
        { point: "HashMap/HashSet O(n) space leta hai (requirement O(1) hai)", keys: ["hashmap", "hashset", "o(n) space", "extra space", "map"] },
        { point: "Saare numbers ka <b>XOR</b> lo", keys: ["xor", "^"], weight: 2 },
        { point: "<b>a ^ a = 0</b> aur <b>a ^ 0 = a</b>, order matter nahi", keys: ["a ^ a = 0", "a^a", "cancel", "kat", "same number", "0 ho jaata"], weight: 2 },
        { point: "O(n) time, O(1) space; negatives bhi chalte hain", keys: ["o(1)", "o(n)", "negative", "constant space"] }
      ],
      answer: `<p>HashSet se ho jaata (add, dobara aaye to remove, jo bache wo answer) par O(n) space. XOR: <code>res = 0; for x: res ^= x;</code>. Har pair <code>a ^ a = 0</code> ho ke cancel, aur order matter nahi karta, to end mein sirf akela number bachta hai.</p>
        <p>O(n) time, O(1) space. Negative numbers pe bhi same (bits ka hi khel hai). Follow-up: "baaki sab <b>teen</b> baar" ho to har bit position ka count % 3 lo.</p>`
    },
    {
      type: "exercise",
      id: "ex-single-number",
      title: "Single Number",
      level: "Easy",
      task: `<p>In a non-empty integer array every element appears exactly <b>twice</b>, except for one element that appears once. Return that element using linear time and constant extra space.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵ (always odd)</li><li>-2³¹ ≤ nums[i] ≤ 2³¹ − 1</li></ul><p><a href="https://leetcode.com/problems/single-number/" target="_blank">LeetCode 136</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [2,2,1]
Output: 1</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [4,1,2,1,2]
Output: 4</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  nums = [1]
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int singleNumber(int[] nums) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,2,1]", 1, () -> s.singleNumber(new int[]{2, 2, 1}));
        Check.eq("[4,1,2,1,2]", 4, () -> s.singleNumber(new int[]{4, 1, 2, 1, 2}));
        Check.eq("[1]", 1, () -> s.singleNumber(new int[]{1}));
        Check.hiddenFromHere();
        Check.eq("negatives [-3,7,-3]", 7, () -> s.singleNumber(new int[]{-3, 7, -3}));
        Check.eq("akela negative [5,-1,5]", -1, () -> s.singleNumber(new int[]{5, -1, 5}));
        Check.eq("zero akela [0,9,9]", 0, () -> s.singleNumber(new int[]{9, 0, 9}));
        Check.eq("extremes", -2147483648, () -> s.singleNumber(new int[]{2147483647, -2147483648, 2147483647}));
        int n = 99999;
        int[] big = new int[n];
        int k = 0;
        for (int i = 1; i <= 49999; i++) big[k++] = i * 3 - 70000;
        big[k++] = 424242;
        for (int i = 49999; i >= 1; i--) big[k++] = i * 3 - 70000;
        Check.eq("bada: 99999 elements", 424242, () -> s.singleNumber(big));
    }
}`,
      hints: [
        "Same number do baar XOR karo to kya bachta hai?",
        "<code>int res = 0;</code>",
        "<code>for (int x : nums) res ^= x; return res;</code>"
      ],
      solution: `class Solution {
    int singleNumber(int[] nums) {
        int res = 0;
        for (int x : nums) res ^= x;
        return res;
    }
}`,
      explain: "<p><b>Approach:</b> saare elements ka XOR; pairs cancel ho jaate hain.</p><p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>"
    },
    {
      type: "think",
      id: "think-counting-bits",
      q: "<b>Counting Bits:</b> 0 se n tak har number ke binary mein kitne 1 hain, ek array mein. Har number pe bits ginna O(n log n) hai. O(n) mein kaise? (Hint: i aur i/2 ka relation.)",
      rubric: [
        { point: "<b>i &gt;&gt; 1</b> (i/2) mein i ke saare bits hain sivaay last ke", keys: ["i >> 1", "i/2", "i / 2", "half", "right shift", "shift"], weight: 2 },
        { point: "<b>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</b>", keys: ["ans[i >> 1]", "dp[i >> 1]", "(i & 1)", "i & 1", "+ (i"], weight: 2 },
        { point: "Ya: <b>ans[i] = ans[i &amp; (i - 1)] + 1</b>", keys: ["i & (i - 1)", "i&(i-1)", "lowest bit"] },
        { point: "O(n) time (DP on bits)", keys: ["o(n)", "linear", "dp"] }
      ],
      answer: `<p>Right shift se last bit gir jaata hai: <code>i &gt;&gt; 1</code> mein i ke baaki saare bits hain. To <code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</code>. Chhota number pehle compute ho chuka hota hai, isliye ye DP hai.</p>
        <p>Doosra tareeka: <code>i &amp; (i - 1)</code> lowest 1 bit hatata hai, to <code>ans[i] = ans[i &amp; (i - 1)] + 1</code>. Dono O(n) time, output ke alawa O(1) space.</p>`
    },
    {
      type: "exercise",
      id: "ex-counting-bits",
      title: "Counting Bits",
      level: "Easy",
      task: `<p>Given an integer <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code> where <code>ans[i]</code> is the number of 1 bits in the binary form of <code>i</code>, for every 0 ≤ i ≤ n.</p><p>Do it in O(n) without <code>Integer.bitCount</code>.</p><h4>Constraints</h4><ul><li>0 ≤ n ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/counting-bits/" target="_blank">LeetCode 338</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  n = 2
Output: [0,1,1]
Explanation: 0 → 0, 1 → 1, 2 → 10</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  n = 5
Output: [0,1,1,2,1,2]
Explanation: 3 → 11, 4 → 100, 5 → 101</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int[] countBits(int n) {
        return new int[0];
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("n=2", new int[]{0, 1, 1}, () -> s.countBits(2));
        Check.eq("n=5", new int[]{0, 1, 1, 2, 1, 2}, () -> s.countBits(5));
        Check.hiddenFromHere();
        Check.eq("n=0", new int[]{0}, () -> s.countBits(0));
        Check.eq("n=1", new int[]{0, 1}, () -> s.countBits(1));
        Check.eq("n=16", new int[]{0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1}, () -> s.countBits(16));
        int n = 100000;
        int[] expected = new int[n + 1];
        for (int i = 0; i <= n; i++) expected[i] = Integer.bitCount(i);
        Check.eq("bada: n=100000", expected, () -> s.countBits(n));
    }
}`,
      hints: [
        "i aur i/2 ke binary mein kya farak hai? Sirf last bit.",
        "<code>int[] ans = new int[n + 1];</code> i = 1 se shuru.",
        "<code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1);</code>"
      ],
      solution: `class Solution {
    int[] countBits(int n) {
        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
        return ans;
    }
}`,
      explain: "<p><b>Approach:</b> DP on bits: ans[i] = ans[i/2] + last bit.</p><p><b>Time:</b> O(n). <b>Space:</b> O(1) extra (output ke alawa).</p>"
    },
    {
      type: "pick",
      id: "pick-bits",
      q: "Inme se kaunse statements <b>sahi</b> hain? (Java int)",
      options: [
        { text: "<code>n &gt; 0 &amp;&amp; (n &amp; (n - 1)) == 0</code> se pata chalta hai n power of two hai", correct: true, why: "Power of two mein sirf ek 1 bit hota hai; n - 1 us bit ko 0 aur neeche saare 1 kar deta hai, to AND 0. Brackets zaroori hain: <code>==</code> ki precedence <code>&amp;</code> se zyada hai, to <code>n &amp; (n - 1) == 0</code> Java mein compile hi nahi hota (int &amp; boolean)." },
        { text: "<code>x &lt;&lt; 1</code> hamesha x × 2 deta hai, overflow kabhi nahi", correct: false, why: "Bits bahar gir sakte hain: <code>1 &lt;&lt; 31</code> = -2147483648 (negative)." },
        { text: "<code>-8 &gt;&gt; 1</code> = -4, par <code>-8 &gt;&gt;&gt; 1</code> ek bada positive number hai", correct: true, why: "<code>&gt;&gt;</code> sign bit copy karta hai, <code>&gt;&gt;&gt;</code> left mein 0 bharta hai (2147483644)." },
        { text: "<code>(x &amp; 1) == 1</code> negative odd numbers ke liye bhi true hai", correct: true, why: "Two's complement mein odd number ka last bit 1 hota hai, chahe negative ho. (Jabki <code>x % 2 == 1</code> negative pe false deta hai, kyunki -3 % 2 = -1.)" },
        { text: "<code>a ^ b ^ a</code> ka answer a hai", correct: false, why: "a ^ a cancel hota hai, to answer b hai." }
      ],
      answer: "Bit tricks mein sabse common bugs: operator precedence (<code>&amp;</code> vs <code>==</code>), shift overflow, aur negative numbers pe <code>%</code>."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Bit trick answer ke saath ek chhota binary example likh ke dikhao (jaise 12 = 1100, 11 = 1011, AND = 1000). Interviewer ko bina trust kiye samajh aa jaata hai, aur aap khud bhi galti pakad lete ho. Java mein <code>&amp;</code> ke saath hamesha brackets lagao."
    }
  ],
  references: [
    { title: "Single Number", by: "LeetCode", url: "https://leetcode.com/problems/single-number/", type: "article" },
    { title: "Counting Bits", by: "LeetCode", url: "https://leetcode.com/problems/counting-bits/", type: "article" },
    { title: "Java 17 API (java.lang.Integer: bitCount, toBinaryString)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" },
    { title: "Striver A2Z DSA sheet (Bit Manipulation)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
