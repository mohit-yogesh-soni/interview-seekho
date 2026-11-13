// Sliding Window
registerLesson("dsa", "sliding-window", {
  why: "\"Longest / shortest subarray ya substring jisme condition X ho\" interview ka sabse common question type hai. Sliding window inhe O(n²) se O(n) mein le aata hai, aur template ek hi hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>Input array ya string hai, aur <b>contiguous</b> hissa (subarray / substring) chahiye.</li>
          <li>Sawaal mein <b>longest, shortest, maximum, minimum, count</b> hai, saath mein ek condition ("sum ≥ target", "repeat nahi", "k se zyada distinct nahi").</li>
          <li>Condition <b>monotonic</b> hai: window badhane pe condition ek hi direction mein badalti hai (sum sirf badhta hai agar sab positive hain).</li>
        </ul>
        <h2>Brute force vs window</h2>
        <p>Brute force: har start <code>i</code>, har end <code>j</code>, check karo. O(n²) ya O(n³). Window: <b>do pointers L aur R, dono sirf aage badhte hain</b>. R har step pe ek element andar laata hai; condition toot jaaye to L elements bahar nikaalta hai. Har element ek baar andar, ek baar bahar: <b>O(n)</b>.</p>
        <p>Example: Zomato pe last 7 din ka average rating dikhana. Har din saare 7 din dobara jodne ke bajaye, naya din jodo aur 8 din purana ghatao. Ye fixed window hai.</p>
        <table>
          <tr><th>Type</th><th>Window size</th><th>Kab</th></tr>
          <tr><td><b>Fixed</b></td><td>hamesha k</td><td>"size k ka max sum", "har k-window ka average"</td></tr>
          <tr><td><b>Variable</b></td><td>badhta / ghatta hai</td><td>"longest jisme ...", "shortest jiska sum ≥ ..."</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Template: fixed window aur variable window",
      code: `import java.util.*;

public class Main {
    // Fixed: size k ki window ka max sum
    static int maxSumK(int[] a, int k) {
        int sum = 0, best = Integer.MIN_VALUE;
        for (int R = 0; R < a.length; R++) {
            sum += a[R];                       // naya element andar
            if (R >= k) sum -= a[R - k];       // purana bahar
            if (R >= k - 1) best = Math.max(best, sum);
        }
        return best;
    }

    // Variable: longest subarray jiska sum <= limit (saare numbers non-negative)
    static int longestAtMost(int[] a, int limit) {
        int L = 0, sum = 0, best = 0;
        for (int R = 0; R < a.length; R++) {
            sum += a[R];                       // 1. expand
            while (sum > limit) {              // 2. invalid hai to shrink
                sum -= a[L];
                L++;
            }
            best = Math.max(best, R - L + 1);  // 3. valid window ka answer
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxSumK(new int[]{2, 1, 5, 1, 3, 2}, 3));       // 5+1+3 = 9
        System.out.println(longestAtMost(new int[]{3, 1, 2, 1, 4, 1}, 5)); // [1,2,1] = 3
    }
}`,
      note: "Variable window ke 3 steps hamesha same: <b>expand R → jab tak invalid, shrink L → answer update</b>. Shortest wale problems mein answer shrink loop ke <b>andar</b> update hota hai (jab tak valid hai, chhota karte jao)."
    },
    {
      type: "steps",
      title: "Variable window dry run: \"pwwkew\" mein longest substring bina repeat",
      steps: [
        { title: "R=0 'p', R=1 'w'", html: `<div class="arr"><span class="cell win">p</span><span class="cell win hl">w</span><span class="cell">w</span><span class="cell">k</span><span class="cell">e</span><span class="cell">w</span></div>
          <div class="arr ptrs"><span class="cell">L</span><span class="cell">R</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>Window "pw", koi repeat nahi. best = 2.</p>` },
        { title: "R=2 'w': repeat!", html: `<div class="arr"><span class="cell win">p</span><span class="cell win bad">w</span><span class="cell win bad">w</span><span class="cell">k</span><span class="cell">e</span><span class="cell">w</span></div>
          <div class="arr ptrs"><span class="cell">L</span><span class="cell"></span><span class="cell">R</span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>'w' ki count 2 ho gayi. Invalid. L ko aage badhao jab tak 'w' ek na ho jaaye.</p>` },
        { title: "Shrink: L=2", html: `<div class="arr"><span class="cell dim">p</span><span class="cell dim">w</span><span class="cell win hl">w</span><span class="cell">k</span><span class="cell">e</span><span class="cell">w</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">L R</span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>'p' aur pehla 'w' bahar. Window "w", valid.</p>` },
        { title: "R=3 'k', R=4 'e'", html: `<div class="arr"><span class="cell dim">p</span><span class="cell dim">w</span><span class="cell win">w</span><span class="cell win">k</span><span class="cell win hl">e</span><span class="cell">w</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">L</span><span class="cell"></span><span class="cell">R</span><span class="cell"></span></div><p>Window "wke", length 3. best = 3.</p>` },
        { title: "R=5 'w': phir repeat", html: `<div class="arr"><span class="cell dim">p</span><span class="cell dim">w</span><span class="cell dim">w</span><span class="cell win">k</span><span class="cell win">e</span><span class="cell win hl">w</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell">L</span><span class="cell"></span><span class="cell">R</span></div><p>L ne index 2 ka 'w' nikaala. Window "kew", length 3. <b>Answer 3.</b> R 6 baar aage gaya, L 3 baar: total O(n).</p>` }
      ]
    },
    {
      type: "think",
      id: "think-longest-unique",
      q: "<b>Longest Substring Without Repeating Characters:</b> string ka sabse lamba substring jisme koi character repeat na ho. Window mein kya track karoge? L kab aur kitna move karega?",
      rubric: [
        { point: "Variable <b>sliding window</b> L, R", keys: ["sliding window", "window", "two pointer", "l and r", "left right"], weight: 2 },
        { point: "Window ke characters ka <b>count / set</b> (ya last index map)", keys: ["set", "hashset", "count", "int[128]", "freq", "last index", "map"], weight: 2 },
        { point: "Naya char repeat ho to L aage badhao jab tak repeat hat na jaaye", keys: ["shrink", "l++", "aage badh", "move left", "repeat hat", "remove"] },
        { point: "Har step pe best = max(best, R - L + 1)", keys: ["r - l + 1", "r-l+1", "max(", "length"] },
        { point: "Time <b>O(n)</b>, space O(charset)", keys: ["o(n)", "linear", "o(1)", "128", "256", "charset"], weight: 2 }
      ],
      answer: `<p>Window <code>[L, R]</code> mein har character ki count rakho (<code>int[128]</code> ASCII ke liye). R ko aage badhao, <code>s[R]</code> ki count badhao. Agar wo count 2 ho gayi, to L ko aage badhate jao (aur <code>s[L]</code> ki count ghatao) jab tak <code>s[R]</code> ki count 1 na ho jaaye. Phir <code>best = max(best, R - L + 1)</code>.</p>
        <p><b>Optimization:</b> har char ka last index rakho, aur repeat pe seedha <code>L = max(L, last[c] + 1)</code> kar do. <code>max</code> zaroori hai, warna "abba" jaise case mein L peeche chala jaata hai.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1) (fixed 128 size array).</p>`
    },
    {
      type: "exercise",
      id: "ex-longest-unique",
      title: "Longest Substring Without Repeating Characters",
      level: "Medium",
      task: `<p>Return the length of the longest <b>substring</b> (contiguous) of <code>s</code> that has no repeated character. <code>s</code> may contain letters, digits, symbols and spaces (ASCII).</p><h4>Constraints</h4><ul><li>0 ≤ s.length ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/longest-substring-without-repeating-characters/" target="_blank">LeetCode 3</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  s = "abcabcbb"
Output: 3
Explanation: "abc"</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  s = "bbbbb"
Output: 1</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  s = "pwwkew"
Output: 3
Explanation: "wke". Note "pwke" is a subsequence, not a substring.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int lengthOfLongestSubstring(String s) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"abcabcbb\\"", 3, () -> s.lengthOfLongestSubstring("abcabcbb"));
        Check.eq("\\"bbbbb\\"", 1, () -> s.lengthOfLongestSubstring("bbbbb"));
        Check.eq("\\"pwwkew\\"", 3, () -> s.lengthOfLongestSubstring("pwwkew"));
        Check.hiddenFromHere();
        Check.eq("empty", 0, () -> s.lengthOfLongestSubstring(""));
        Check.eq("single space", 1, () -> s.lengthOfLongestSubstring(" "));
        Check.eq("\\"dvdf\\"", 3, () -> s.lengthOfLongestSubstring("dvdf"));
        Check.eq("\\"abba\\" (L peeche na jaaye)", 2, () -> s.lengthOfLongestSubstring("abba"));
        Check.eq("symbols \\"a1!a 1\\"", 4, () -> s.lengthOfLongestSubstring("a1!a 1"));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) sb.append((char) (32 + i % 95));   // saare 95 printable chars ghoomte hue
        String big = sb.toString();
        Check.eq("bada input n=1e5", 95, () -> s.lengthOfLongestSubstring(big));
    }
}`,
      hints: [
        "<code>int[] count = new int[128]</code> se window ke characters gino.",
        "R ko aage badhao. Agar <code>count[c] &gt; 1</code> ho gaya, to <code>while (count[c] &gt; 1) count[s.charAt(L++)]--;</code>",
        "Har R ke baad <code>best = Math.max(best, R - L + 1)</code>."
      ],
      solution: `class Solution {
    int lengthOfLongestSubstring(String s) {
        int[] count = new int[128];
        int L = 0, best = 0;
        for (int R = 0; R < s.length(); R++) {
            char c = s.charAt(R);
            count[c]++;
            while (count[c] > 1) {          // repeat hat jaaye tab tak shrink
                count[s.charAt(L)]--;
                L++;
            }
            best = Math.max(best, R - L + 1);
        }
        return best;
    }
}`,
      explain: `<p><b>Approach:</b> variable window + char count. Repeat aate hi L ko tab tak badhao jab tak window phir unique na ho.</p>
        <p><b>Time:</b> O(n) (L aur R dono max n baar chalte hain). <b>Space:</b> O(1), 128 size array.</p>`
    },
    {
      type: "think",
      id: "think-min-subarray",
      q: "<b>Minimum Size Subarray Sum:</b> positive integers ka array aur <code>target</code>. Sabse chhota subarray jiska sum ≥ target. Window mein answer kab update karoge? Agar numbers negative bhi hote to kya window chalegi?",
      rubric: [
        { point: "R se expand, sum jodo", keys: ["expand", "r++", "sum +=", "add", "jodo"] },
        { point: "<b>Jab tak sum ≥ target</b>: answer update karo, phir L se shrink", keys: ["while", "jab tak", "sum >= target", "shrink", "l++"], weight: 2 },
        { point: "Positive numbers ki wajah se window <b>monotonic</b> hai (shrink karne se sum ghatega hi)", keys: ["positive", "monotonic", "ghatega", "decrease", "sirf badhta"], weight: 2 },
        { point: "Negative hon to window nahi chalegi, <b>prefix sum + deque / sorted structure</b> chahiye", keys: ["negative", "deque", "prefix", "nahi chalegi", "fail"] },
        { point: "Time <b>O(n)</b>, space O(1)", keys: ["o(n)", "linear", "o(1)"] }
      ],
      answer: `<p>R ko aage badhao, <code>sum += nums[R]</code>. <b>Jab tak</b> <code>sum &gt;= target</code>: <code>best = min(best, R - L + 1)</code>, phir <code>sum -= nums[L++]</code>. Koi window na mile to 0 return.</p>
        <p><b>Ye kyun chalta hai:</b> saare numbers positive hain, to window chhoti karne pe sum hamesha ghatta hai, aur badi karne pe badhta hai. Isi monotonic property se L kabhi peeche nahi jaana padta.</p>
        <p><b>Negative numbers:</b> ye guarantee toot jaati hai (L hatane se sum badh bhi sakta hai). Tab prefix sums + monotonic deque (LeetCode 862) lagta hai. <b>Time O(n), space O(1)</b> (positive version).</p>`
    },
    {
      type: "exercise",
      id: "ex-min-subarray",
      title: "Minimum Size Subarray Sum",
      level: "Medium",
      task: `<p>All numbers in <code>nums</code> are <b>positive</b>. Return the length of the shortest contiguous subarray whose sum is <b>at least</b> <code>target</code>, or 0 if there is none.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>All values are positive</li></ul><p><a href="https://leetcode.com/problems/minimum-size-subarray-sum/" target="_blank">LeetCode 209</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  target = 7, nums = [2,3,1,2,4,3]
Output: 2
Explanation: [4,3]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  target = 4, nums = [1,4,4]
Output: 1</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  target = 11, nums = [1,1,1,1,1,1,1,1]
Output: 0
Explanation: The total is only 8.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int minSubArrayLen(int target, int[] nums) {
        // yahan likho
        return -1;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("target=7, [2,3,1,2,4,3]", 2, () -> s.minSubArrayLen(7, new int[]{2, 3, 1, 2, 4, 3}));
        Check.eq("target=4, [1,4,4]", 1, () -> s.minSubArrayLen(4, new int[]{1, 4, 4}));
        Check.eq("target=11, [1,1,1,1,1,1,1,1]", 0, () -> s.minSubArrayLen(11, new int[]{1, 1, 1, 1, 1, 1, 1, 1}));
        Check.hiddenFromHere();
        Check.eq("poora array: target=15, [1,2,3,4,5]", 5, () -> s.minSubArrayLen(15, new int[]{1, 2, 3, 4, 5}));
        Check.eq("single exact: target=7, [7]", 1, () -> s.minSubArrayLen(7, new int[]{7}));
        Check.eq("single kam: target=100, [1]", 0, () -> s.minSubArrayLen(100, new int[]{1}));
        Check.eq("target=11, [1,2,3,4,5]", 3, () -> s.minSubArrayLen(11, new int[]{1, 2, 3, 4, 5}));
        int n = 100000;
        int[] big = new int[n];
        Arrays.fill(big, 1);
        Check.eq("bada input n=1e5 sab 1, target=50000", 50000, () -> s.minSubArrayLen(50000, big));
    }
}`,
      hints: [
        "R se window badhao aur <code>sum</code> jodo.",
        "Jaise hi <code>sum &gt;= target</code>, window valid hai. Ab chhota karne ki koshish karo.",
        "<code>while (sum &gt;= target) { best = Math.min(best, R - L + 1); sum -= nums[L++]; }</code> aur end mein <code>best == MAX ? 0 : best</code>."
      ],
      solution: `class Solution {
    int minSubArrayLen(int target, int[] nums) {
        int L = 0, sum = 0, best = Integer.MAX_VALUE;
        for (int R = 0; R < nums.length; R++) {
            sum += nums[R];
            while (sum >= target) {               // valid: chhota karte jao
                best = Math.min(best, R - L + 1);
                sum -= nums[L++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
      explain: `<p><b>Approach:</b> variable window. "Shortest" problem hai, isliye answer shrink loop ke andar update hota hai.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>
        <p>Follow-up (LeetCode bhi poochhta hai): O(n log n) version prefix sums + binary search se, kyunki positive numbers pe prefix sum sorted hota hai.</p>`
    },
    {
      type: "think",
      id: "think-char-replace",
      q: "<b>Longest Repeating Character Replacement:</b> uppercase string, aur aap max <code>k</code> characters badal sakte ho. Sabse lamba substring jo badalne ke baad ek hi letter ka ho. Window <b>valid</b> kab hai?",
      rubric: [
        { point: "Window mein sabse frequent letter ki count = <b>maxFreq</b>", keys: ["maxfreq", "max freq", "most frequent", "sabse zyada", "max count", "majority"], weight: 2 },
        { point: "Valid agar <b>windowLength - maxFreq ≤ k</b> (baaki letters badalne hain)", keys: ["- maxfreq", "-maxfreq", "length - ", "len - ", "<= k", "≤ k", "baaki"], weight: 2 },
        { point: "Invalid ho to L++ (count ghatao)", keys: ["l++", "shrink", "left badh", "move left"] },
        { point: "26 size count array, time <b>O(n)</b> (ya O(26n))", keys: ["26", "o(n)", "linear"] },
        { point: "Bonus: maxFreq ko shrink pe ghatane ki zaroorat nahi", keys: ["ghatane ki zaroorat nahi", "never decrease", "stale", "decrease nahi", "update nahi"] }
      ],
      answer: `<p>Window mein jo letter sabse zyada baar hai (count = <code>maxFreq</code>), baaki saare letters use badalne padenge. Badalne wale = <code>(R - L + 1) - maxFreq</code>. <b>Valid agar ye ≤ k.</b></p>
        <p>R badhao, <code>count[s[R]]++</code>, <code>maxFreq = max(maxFreq, count[s[R]])</code>. Agar invalid, <code>count[s[L]]--</code>, <code>L++</code> (ek step kaafi hai, window size best se zyada nahi ghatna chahiye).</p>
        <p><b>Trick:</b> L hataate waqt maxFreq ghatana zaroori nahi. Answer tabhi badhta hai jab maxFreq naye record pe jaaye, to purana (thoda bada) maxFreq galat answer nahi deta. <b>Time O(n), space O(26).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-char-replace",
      title: "Longest Repeating Character Replacement",
      level: "Medium",
      task: `<p><code>s</code> contains only uppercase letters A-Z. You may change <b>at most k</b> characters into any other uppercase letter. Return the length of the longest substring that can be made of one repeated letter.</p><h4>Constraints</h4><ul><li>1 ≤ s.length ≤ 10⁵</li><li>0 ≤ k ≤ s.length</li></ul><p><a href="https://leetcode.com/problems/longest-repeating-character-replacement/" target="_blank">LeetCode 424</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  s = "ABAB", k = 2
Output: 4
Explanation: Change both A's to B (or both B's to A).</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  s = "AABABBA", k = 1
Output: 4
Explanation: Change the A at index 3 inside "BABB" (indices 2-5) → "BBBB".</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int characterReplacement(String s, int k) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("s=\\"ABAB\\", k=2", 4, () -> s.characterReplacement("ABAB", 2));
        Check.eq("s=\\"AABABBA\\", k=1", 4, () -> s.characterReplacement("AABABBA", 1));
        Check.hiddenFromHere();
        Check.eq("single \\"A\\", k=0", 1, () -> s.characterReplacement("A", 0));
        Check.eq("sab same \\"AAAA\\", k=2", 4, () -> s.characterReplacement("AAAA", 2));
        Check.eq("\\"ABCDE\\", k=1", 2, () -> s.characterReplacement("ABCDE", 1));
        Check.eq("k=0: \\"ABBB\\"", 3, () -> s.characterReplacement("ABBB", 0));
        Check.eq("\\"BAAAB\\", k=2", 5, () -> s.characterReplacement("BAAAB", 2));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) sb.append(i % 10 == 9 ? 'B' : 'A');   // har 10th char B
        String big = sb.toString();
        Check.eq("bada input n=1e5, k=1000", 10009, () -> s.characterReplacement(big, 1000));
    }
}`,
      hints: [
        "Window valid hai agar <code>windowLength - (window ka sabse frequent letter count) ≤ k</code>.",
        "<code>int[] count = new int[26]</code> aur ek <code>maxFreq</code> variable rakho jo R aane pe update ho.",
        "<code>if ((R - L + 1) - maxFreq &gt; k) { count[s.charAt(L) - 'A']--; L++; }</code> phir <code>best = max(best, R - L + 1)</code>."
      ],
      solution: `class Solution {
    int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int L = 0, maxFreq = 0, best = 0;
        for (int R = 0; R < s.length(); R++) {
            int c = s.charAt(R) - 'A';
            count[c]++;
            maxFreq = Math.max(maxFreq, count[c]);
            if ((R - L + 1) - maxFreq > k) {      // badalne wale k se zyada
                count[s.charAt(L) - 'A']--;
                L++;
            }
            best = Math.max(best, R - L + 1);
        }
        return best;
    }
}`,
      explain: `<p><b>Approach:</b> variable window. Valid = <code>len - maxFreq ≤ k</code>. Invalid hone pe L ek step aage (window size kabhi best se kam nahi hota, sirf slide karta hai).</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1) (26 counts).</p>
        <p>Simple alternative: har letter ('A'..'Z') ke liye alag window chalao jisme "us letter ke alawa sab" ≤ k. O(26 · n), samajhne mein aasaan.</p>`
    },
    {
      type: "quiz",
      q: "Array mein <b>negative</b> numbers bhi hain. \"Longest subarray jiska sum exactly k hai\" ke liye kaunsa approach sahi hai?",
      options: [
        "Variable sliding window, sum &gt; k ho to shrink",
        "Fixed window size k",
        "Prefix sum + HashMap (pehli baar kab ye prefix aaya)",
        "Sort karke two pointers"
      ],
      answer: 2,
      why: "Negative numbers se window ka monotonic nature toot jaata hai: shrink karne pe sum badh bhi sakta hai. Sort se contiguous order kho jaata hai. Prefix sum + HashMap (agla lesson) sahi tool hai."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Signal: contiguous subarray/substring + longest/shortest + monotonic condition.</li><li>Template: R se expand → jab tak invalid L se shrink → answer update.</li><li>Longest unique: char count, repeat pe shrink. Min subarray sum: valid rahte hue shrink aur answer update.</li><li>Char replacement: valid = len - maxFreq ≤ k.</li><li>Negative numbers ho to window toot-ti hai: prefix sum socho.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Window lagane se pehle zor se bolo: <i>\"window ka invariant ye hai: [L, R] hamesha valid rahega\"</i> aur <i>\"ye isliye chalta hai kyunki saare numbers positive hain\"</i>. Interviewer aksar follow-up mein negative numbers ya \"exactly k\" daal ke dekhta hai ki aapko pata hai pattern kab <b>toot-ta</b> hai. Trick: \"exactly k\" = atMost(k) - atMost(k-1)."
    }
  ],
  references: [
    { title: "Longest Substring Without Repeating Characters", by: "LeetCode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", type: "article" },
    { title: "Minimum Size Subarray Sum", by: "LeetCode", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", type: "article" },
    { title: "Longest Repeating Character Replacement", by: "LeetCode", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", type: "article" },
    { title: "Hello Interview: Coding patterns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" },
    { title: "NeetCode (YouTube)", by: "NeetCode", url: "https://www.youtube.com/@NeetCode", type: "video" }
  ]
});
