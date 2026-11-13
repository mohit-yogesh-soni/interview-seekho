// DP 2D (grid aur strings)
registerLesson("dsa", "dp-2d", {
  why: "Grid paths aur do strings ko compare karna (diff tools, spell check \"did you mean?\", DNA matching) 2D DP ke classic examples hain. LCS aur Edit Distance ka table bana ke samjhana interview mein seedha senior-level signal deta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>2D DP kab?</h2>
        <p>Jab state ko <b>do numbers</b> chahiye: grid mein (row, col), ya do strings mein (i, j) = "pehli string ke pehle i characters aur doosri ke pehle j characters".</p>
        <h2>Do families</h2>
        <table>
          <tr><th>Type</th><th>State</th><th>Transition kahan se</th><th>Examples</th></tr>
          <tr><td><b>Grid</b></td><td>dp[r][c] = (r, c) tak ka answer</td><td>upar (r-1, c) aur left (r, c-1)</td><td>Unique Paths, Min Path Sum</td></tr>
          <tr><td><b>Two strings</b></td><td>dp[i][j] = s1[0..i) aur s2[0..j) ka answer</td><td>(i-1, j-1), (i-1, j), (i, j-1)</td><td>LCS, Edit Distance</td></tr>
        </table>
        <h2>Strings wale DP ka trick</h2>
        <p>Table ka size <code>(m + 1) × (n + 1)</code> rakho. Row 0 / column 0 = <b>khaali string</b>. Isse base cases saaf ho jaate hain aur index -1 ka jhanjhat nahi.</p>
        <p>Har cell pe sirf ek sawaal: <b>s1[i-1] == s2[j-1]?</b></p>
        <ul>
          <li>Haan → diagonal (i-1, j-1) se aao (dono characters "use" ho gaye)</li>
          <li>Nahi → upar ya left (ek character chhod do) ya diagonal + cost (replace)</li>
        </ul>
        <h2>Space optimization</h2>
        <p>Har row sirf pichhli row pe depend karti hai, to 2 rows (ya ek row + ek variable) kaafi: O(n) space. Interview mein pehle full table, phir ye follow-up.</p>`
    },
    {
      type: "code",
      title: "Template: grid DP (min path sum) aur string DP ka skeleton",
      code: `public class Main {
    // Grid: sirf right/down move, top-left se bottom-right ka minimum sum
    static int minPathSum(int[][] g) {
        int R = g.length, C = g[0].length;
        int[][] dp = new int[R][C];
        for (int r = 0; r < R; r++) {
            for (int c = 0; c < C; c++) {
                if (r == 0 && c == 0) dp[r][c] = g[r][c];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + g[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + g[r][c];
                else dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + g[r][c];
            }
        }
        return dp[R - 1][C - 1];
    }

    // Strings: (m+1) x (n+1) table, row/col 0 = khaali string
    static int lcs(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }

    public static void main(String[] args) {
        System.out.println("min path sum: " + minPathSum(new int[][]{{2, 1, 4}, {3, 9, 1}, {6, 2, 1}}));  // 2+1+4+1+1 = 9
        System.out.println("lcs(chai, chawal): " + lcs("chai", "chawal"));                                   // cha = 3
    }
}`
    },
    {
      type: "steps",
      title: "LCS table: \"abc\" vs \"ac\" (row = abc ke chars, col = ac ke chars)",
      steps: [
        { title: "Base: row 0 aur col 0 = 0 (khaali string)", html: `<table><tr><th></th><th>∅</th><th>a</th><th>c</th></tr><tr><th>∅</th><td>0</td><td>0</td><td>0</td></tr><tr><th>a</th><td>0</td><td></td><td></td></tr><tr><th>b</th><td>0</td><td></td><td></td></tr><tr><th>c</th><td>0</td><td></td><td></td></tr></table>` },
        { title: "Row 'a': a == a → diagonal + 1 = 1; a ≠ c → max(upar 0, left 1) = 1", html: `<table><tr><th></th><th>∅</th><th>a</th><th>c</th></tr><tr><th>∅</th><td>0</td><td>0</td><td>0</td></tr><tr><th>a</th><td>0</td><td><b>1</b></td><td><b>1</b></td></tr><tr><th>b</th><td>0</td><td></td><td></td></tr><tr><th>c</th><td>0</td><td></td><td></td></tr></table>` },
        { title: "Row 'b': koi match nahi, upar se copy", html: `<table><tr><th></th><th>∅</th><th>a</th><th>c</th></tr><tr><th>∅</th><td>0</td><td>0</td><td>0</td></tr><tr><th>a</th><td>0</td><td>1</td><td>1</td></tr><tr><th>b</th><td>0</td><td><b>1</b></td><td><b>1</b></td></tr><tr><th>c</th><td>0</td><td></td><td></td></tr></table><p>b ≠ a: max(1, 0) = 1. b ≠ c: max(1, 1) = 1.</p>` },
        { title: "Row 'c': c ≠ a → 1; c == c → diagonal (1) + 1 = 2", html: `<table><tr><th></th><th>∅</th><th>a</th><th>c</th></tr><tr><th>∅</th><td>0</td><td>0</td><td>0</td></tr><tr><th>a</th><td>0</td><td>1</td><td>1</td></tr><tr><th>b</th><td>0</td><td><mark>1</mark></td><td>1</td></tr><tr><th>c</th><td>0</td><td><b>1</b></td><td><b>2</b></td></tr></table><p>Answer = dp[3][2] = <b>2</b> ("ac"). Diagonal cell (highlighted) se +1 aaya. Time O(m·n), space O(m·n) (ya 2 rows se O(n)).</p>` }
      ]
    },
    {
      type: "think",
      id: "think-unique-paths",
      q: "<b>Unique Paths:</b> m × n grid, robot top-left pe, sirf right ya down move kar sakta hai. Bottom-right tak kitne alag raaste? DP state/transition batao, aur ek math formula bhi.",
      rubric: [
        { point: "<b>dp[r][c] = dp[r-1][c] + dp[r][c-1]</b> (upar se + left se)", keys: ["dp[r-1][c]", "dp[i-1][j]", "upar + left", "top + left", "up + left", "upar se"], weight: 2 },
        { point: "Base: pehli row aur pehla column = 1", keys: ["= 1", "first row", "pehli row", "first column", "pehla column", "base"] },
        { point: "1D array se O(n) space: <code>row[c] += row[c-1]</code>", keys: ["1d", "o(n) space", "ek row", "single row", "row[c]"] },
        { point: "Math: <b>C(m+n-2, m-1)</b> (combinations)", keys: ["c(m+n-2", "combination", "ncr", "binomial", "choose", "factorial"], weight: 2 },
        { point: "O(m·n) time", keys: ["o(m*n)", "o(mn)", "m × n", "m*n"] }
      ],
      answer: `<p>Har cell pe sirf upar ya left se aa sakte ho: <code>dp[r][c] = dp[r-1][c] + dp[r][c-1]</code>. Pehli row aur column mein sirf ek raasta (1). Time O(m·n); ek hi row array se space O(n): <code>row[c] += row[c-1]</code>.</p>
        <p>Math: total (m-1) down aur (n-1) right moves, unka koi bhi order: <code>C(m+n-2, m-1)</code>. 3 × 7 → C(8, 2) = 28. Code mein multiplication overflow ka dhyaan (long use karo).</p>`
    },
    {
      type: "exercise",
      id: "ex-unique-paths",
      title: "Unique Paths",
      level: "Medium",
      task: `<p>A robot starts in the top-left cell of an <code>m × n</code> grid and wants to reach the bottom-right cell. In one step it can move only <b>right</b> or <b>down</b>. Return the number of different paths. The answer fits in an int.</p><p class="small muted">m = 3 rows, n = 2 columns (S = start, E = end)</p><pre class="diagram">S .
. .
. E</pre><h4>Constraints</h4><ul><li>1 ≤ m, n ≤ 100</li><li>The answer is ≤ 2 · 10⁹</li></ul><p><a href="https://leetcode.com/problems/unique-paths/" target="_blank">LeetCode 62</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  m = 3, n = 7
Output: 28</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  m = 3, n = 2
Output: 3
Explanation: Right-Down-Down, Down-Right-Down, Down-Down-Right.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int uniquePaths(int m, int n) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("m=3, n=7", 28, () -> s.uniquePaths(3, 7));
        Check.eq("m=3, n=2", 3, () -> s.uniquePaths(3, 2));
        Check.hiddenFromHere();
        Check.eq("1x1", 1, () -> s.uniquePaths(1, 1));
        Check.eq("1x10 (sirf ek line)", 1, () -> s.uniquePaths(1, 10));
        Check.eq("10x10", 48620, () -> s.uniquePaths(10, 10));
        Check.eq("bada: 23x12 (recursion slow hoga)", 193536720, () -> s.uniquePaths(23, 12));
        Check.eq("bada: 16x16", 155117520, () -> s.uniquePaths(16, 16));
    }
}`,
      hints: [
        "<code>int[] row = new int[n]; Arrays.fill(row, 1);</code> (pehli row).",
        "Har agli row ke liye <code>for c = 1..n-1: row[c] += row[c - 1];</code> (row[c] pehle se 'upar' wali value hai).",
        "m - 1 baar ye karo, phir <code>return row[n - 1];</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int r = 1; r < m; r++) {
            for (int c = 1; c < n; c++) row[c] += row[c - 1];
        }
        return row[n - 1];
    }
}`,
      explain: "<p><b>Approach:</b> grid DP, ek row array: row[c] (upar) + row[c-1] (left).</p><p><b>Time:</b> O(m·n). <b>Space:</b> O(n). Math formula C(m+n-2, m-1) O(min(m, n)) mein deta hai.</p>"
    },
    {
      type: "think",
      id: "think-lcs",
      q: "<b>Longest Common Subsequence:</b> do strings ki sabse lambi common subsequence ki length. dp[i][j] ka matlab, aur match / mismatch pe transition batao. Brute force kitna hota?",
      rubric: [
        { point: "dp[i][j] = <b>text1 ke pehle i</b> aur <b>text2 ke pehle j</b> chars ka LCS", keys: ["pehle i", "first i", "prefix", "dp[i][j]", "i chars"], weight: 2 },
        { point: "Match: <b>dp[i-1][j-1] + 1</b>", keys: ["dp[i-1][j-1] + 1", "diagonal + 1", "diagonal", "+ 1", "i-1][j-1"], weight: 2 },
        { point: "Mismatch: <b>max(dp[i-1][j], dp[i][j-1])</b>", keys: ["max(dp[i-1][j]", "max(", "upar ya left", "skip one", "ek chhodo"], weight: 2 },
        { point: "Brute: 2^m subsequences; DP O(m·n)", keys: ["2^m", "2^n", "exponential", "o(m*n)", "o(mn)", "m × n"] }
      ],
      answer: `<p><code>dp[i][j]</code> = text1[0..i) aur text2[0..j) ka LCS. Agar <code>text1[i-1] == text2[j-1]</code> → <code>dp[i-1][j-1] + 1</code> (dono char LCS mein). Warna <code>max(dp[i-1][j], dp[i][j-1])</code> (ek string ka last char chhod do). Row/col 0 = 0.</p>
        <p>Brute: text1 ke saare 2ᵐ subsequences check karna. DP O(m·n) time, O(m·n) space, ya do rows se O(n).</p>`
    },
    {
      type: "exercise",
      id: "ex-lcs",
      title: "Longest Common Subsequence",
      level: "Medium",
      task: `<p>Given strings <code>text1</code> and <code>text2</code>, return the length of their longest <b>common subsequence</b> (a sequence of characters that appears in both strings in the same order, not necessarily contiguous). Return 0 if they share none.</p><h4>Constraints</h4><ul><li>1 ≤ text1.length, text2.length ≤ 2000</li><li>Only lowercase English letters</li></ul><p><a href="https://leetcode.com/problems/longest-common-subsequence/" target="_blank">LeetCode 1143</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  text1 = "abcde", text2 = "ace"
Output: 3
Explanation: "ace"</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  text1 = "abc", text2 = "abc"
Output: 3</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  text1 = "abc", text2 = "def"
Output: 0</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int longestCommonSubsequence(String text1, String text2) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("abcde, ace", 3, () -> s.longestCommonSubsequence("abcde", "ace"));
        Check.eq("abc, abc", 3, () -> s.longestCommonSubsequence("abc", "abc"));
        Check.eq("abc, def", 0, () -> s.longestCommonSubsequence("abc", "def"));
        Check.hiddenFromHere();
        Check.eq("a, a", 1, () -> s.longestCommonSubsequence("a", "a"));
        Check.eq("bsbininm, jmjkbkjkv", 1, () -> s.longestCommonSubsequence("bsbininm", "jmjkbkjkv"));
        Check.eq("ezupkr, ubmrapg", 2, () -> s.longestCommonSubsequence("ezupkr", "ubmrapg"));
        Check.eq("chai, chawal", 3, () -> s.longestCommonSubsequence("chai", "chawal"));
        String a = "ab".repeat(1000), b = "ba".repeat(1000);
        Check.eq("bada: 2000 chars each", 1999, () -> s.longestCommonSubsequence(a, b));
    }
}`,
      hints: [
        "<code>int[][] dp = new int[m + 1][n + 1];</code> row/col 0 apne aap 0.",
        "<code>if (a.charAt(i-1) == b.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;</code>",
        "Warna <code>dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);</code> Answer <code>dp[m][n]</code>."
      ],
      solution: `class Solution {
    int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[] prev = new int[n + 1], cur = new int[n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) cur[j] = prev[j - 1] + 1;
                else cur[j] = Math.max(prev[j], cur[j - 1]);
            }
            int[] t = prev; prev = cur; cur = t;
        }
        return prev[n];
    }
}`,
      explain: "<p><b>Approach:</b> string DP, match pe diagonal + 1, mismatch pe max(upar, left). Solution do rows use karta hai.</p><p><b>Time:</b> O(m·n). <b>Space:</b> O(n) (full table O(m·n)). Agar actual subsequence chahiye to full table rakho aur (m, n) se peeche chalo.</p>"
    },
    {
      type: "think",
      id: "think-edit",
      q: "<b>Edit Distance:</b> word1 ko word2 banana hai: ek character <b>insert</b>, <b>delete</b> ya <b>replace</b>, har operation cost 1. Minimum operations? dp[i][j] ke teen options kya hain aur base cases?",
      rubric: [
        { point: "Match: <b>dp[i][j] = dp[i-1][j-1]</b> (koi cost nahi)", keys: ["dp[i-1][j-1]", "match", "same char", "diagonal", "no cost"], weight: 2 },
        { point: "Mismatch: <b>1 + min(insert, delete, replace)</b> = 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])", keys: ["1 + min", "min(", "insert", "delete", "replace", "teen"], weight: 2 },
        { point: "Base: <b>dp[i][0] = i</b>, <b>dp[0][j] = j</b>", keys: ["dp[i][0] = i", "dp[0][j] = j", "base", "khaali string", "empty"], weight: 2 },
        { point: "O(m·n) time", keys: ["o(m*n)", "o(mn)", "m × n", "m*n"] }
      ],
      answer: `<p><code>dp[i][j]</code> = word1[0..i) ko word2[0..j) banane ki min cost. Base: <code>dp[i][0] = i</code> (sab delete), <code>dp[0][j] = j</code> (sab insert).</p>
        <p>Chars same → <code>dp[i-1][j-1]</code>. Alag → <code>1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))</code>. O(m·n) time, O(n) space possible. Real use: spell checker ("did you mean?"), DNA alignment, diff tools.</p>`
    },
    {
      type: "exercise",
      id: "ex-edit-distance",
      title: "Edit Distance",
      level: "Medium",
      task: `<p>Return the minimum number of operations to turn <code>word1</code> into <code>word2</code>. Each of these costs 1: <b>insert</b> a character, <b>delete</b> a character, <b>replace</b> a character.</p><h4>Constraints</h4><ul><li>0 ≤ word1.length, word2.length ≤ 1000</li><li>Only lowercase English letters</li></ul><p><a href="https://leetcode.com/problems/edit-distance/" target="_blank">LeetCode 72</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  word1 = "horse", word2 = "ros"
Output: 3
Explanation: horse → rorse (replace h with r) → rose (delete r) → ros (delete e)</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  word1 = "intention", word2 = "execution"
Output: 5</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int minDistance(String word1, String word2) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("horse -> ros", 3, () -> s.minDistance("horse", "ros"));
        Check.eq("intention -> execution", 5, () -> s.minDistance("intention", "execution"));
        Check.hiddenFromHere();
        Check.eq("dono khaali", 0, () -> s.minDistance("", ""));
        Check.eq("khaali -> abc (3 insert)", 3, () -> s.minDistance("", "abc"));
        Check.eq("abc -> khaali (3 delete)", 3, () -> s.minDistance("abc", ""));
        Check.eq("kitten -> sitting", 3, () -> s.minDistance("kitten", "sitting"));
        Check.eq("same word", 0, () -> s.minDistance("biryani", "biryani"));
        Check.eq("bada: 1000 a -> 1000 b", 1000, () -> s.minDistance("a".repeat(1000), "b".repeat(1000)));
        Check.eq("bada: 500 a -> 1000 a", 500, () -> s.minDistance("a".repeat(500), "a".repeat(1000)));
    }
}`,
      hints: [
        "<code>dp[m+1][n+1]</code>; <code>dp[i][0] = i</code>, <code>dp[0][j] = j</code>.",
        "Same char → <code>dp[i][j] = dp[i-1][j-1]</code>.",
        "Warna <code>dp[i][j] = 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));</code>"
      ],
      solution: `class Solution {
    int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
            }
        }
        return dp[m][n];
    }
}`,
      explain: "<p><b>Approach:</b> string DP with teen operations; base cases khaali string se.</p><p><b>Time:</b> O(m·n). <b>Space:</b> O(m·n), do rows se O(n).</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> String DP mein whiteboard pe chhota table (3×3) bhar ke dikhao, khaas kar ek match aur ek mismatch cell. Interviewer ko turant dikh jaata hai ki transition sahi hai. Phir bolo \"sirf pichhli row chahiye, to space O(n) ho sakta hai\". Ye follow-up aksar aata hi hai."
    }
  ],
  references: [
    { title: "Unique Paths", by: "LeetCode", url: "https://leetcode.com/problems/unique-paths/", type: "article" },
    { title: "Longest Common Subsequence", by: "LeetCode", url: "https://leetcode.com/problems/longest-common-subsequence/", type: "article" },
    { title: "Edit Distance", by: "LeetCode", url: "https://leetcode.com/problems/edit-distance/", type: "article" },
    { title: "Striver (takeUforward) YouTube: DP series", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode roadmap (2-D DP)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
