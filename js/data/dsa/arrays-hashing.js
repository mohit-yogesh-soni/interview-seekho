// Arrays aur Hashing
registerLesson("dsa", "arrays-hashing", {
  why: "HashMap sabse zyada use hone wala interview tool hai. \"Kya ye pehle dekha?\" ya \"kitni baar aaya?\" jaise sawaal O(n²) se O(n) ho jaate hain. Two Sum aur Group Anagrams lagbhag har company ke phone screen mein aate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>"Kya koi element / pair <b>pehle dekha</b> hai?" (duplicate, two sum)</li>
          <li>"Har element <b>kitni baar</b> aaya?" (frequency, top k, majority)</li>
          <li>"Jo cheezein kisi property mein <b>same</b> hain unhe group karo" (anagrams, same digit sum)</li>
          <li>Order matter nahi karta, aur nested loop O(n²) ban raha hai.</li>
        </ul>
        <h2>Brute force vs Hashing</h2>
        <table>
          <tr><th></th><th>Brute force</th><th>HashMap / HashSet</th></tr>
          <tr><td>Idea</td><td>Har element ke liye poora array dobara scan</td><td>Jo dekha use map mein yaad rakho, O(1) mein lookup</td></tr>
          <tr><td>Time</td><td>O(n²)</td><td>O(n) average</td></tr>
          <tr><td>Space</td><td>O(1)</td><td>O(n)</td></tr>
        </table>
        <p>Ye classic <b>time ke badle space</b> ka trade hai. Paytm wallet ki transaction list mein "same amount do baar aaya kya" dhoondhna ho to 10 lakh entries pe O(n²) nahi chalega, O(n) + extra memory chalega.</p>
        <p><b>Yaad rakho:</b> Java <code>HashMap</code> ka get/put average O(1) hai, worst case (bahut collisions) pe bin treeify hone ke baad O(log n).</p>`
    },
    {
      type: "code",
      title: "Template: frequency map (getOrDefault aur merge dono tareeke)",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String order = "pizza";
        // Tareeka 1: getOrDefault
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : order.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        System.out.println(new TreeMap<>(freq));   // TreeMap sirf sorted print ke liye

        // Tareeka 2: merge (chhota aur saaf)
        Map<Integer, Integer> cnt = new HashMap<>();
        int[] nums = {5, 3, 5, 5, 3, 9};
        for (int x : nums) cnt.merge(x, 1, Integer::sum);
        System.out.println(new TreeMap<>(cnt));

        // Sirf lowercase letters hon to int[26] HashMap se tez hai
        int[] letters = new int[26];
        for (char c : order.toCharArray()) letters[c - 'a']++;
        System.out.println("z ki count = " + letters['z' - 'a']);
    }
}`,
      note: "Agar keys chhoti range mein hain (a-z, 0-9), to <code>int[26]</code> array use karo: koi hashing nahi, koi boxing nahi."
    },
    {
      type: "steps",
      title: "Two Sum dry run: nums = [2, 7, 11, 15], target = 9 (HashMap: value → index)",
      steps: [
        { title: "i = 0, x = 2", html: `<div class="arr"><span class="cell hl">2</span><span class="cell">7</span><span class="cell">11</span><span class="cell">15</span></div>
          <div class="arr ptrs"><span class="cell">i</span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div>
          <p>Chahiye: 9 - 2 = <b>7</b>. Map khaali hai, 7 nahi mila. Map mein daalo: <code>{2→0}</code></p>` },
        { title: "i = 1, x = 7", html: `<div class="arr"><span class="cell dim">2</span><span class="cell hl">7</span><span class="cell">11</span><span class="cell">15</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell">i</span><span class="cell"></span><span class="cell"></span></div>
          <p>Chahiye: 9 - 7 = <b>2</b>. Map mein 2 hai (index 0)!</p>` },
        { title: "Answer", html: `<div class="arr"><span class="cell ok">2</span><span class="cell ok">7</span><span class="cell dim">11</span><span class="cell dim">15</span></div>
          <p>Return <code>[0, 1]</code>. Sirf 2 elements dekhe. Har element ek baar, isliye O(n).</p>
          <p>Note: pehle check karo, phir daalo. Ulta karoge to <code>[3,3]</code>, target 6 jaise case mein element khud se match ho sakta hai.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-two-sum",
      q: "<b>Two Sum:</b> array aur target diya hai. Do alag indices batao jinke numbers ka sum target hai (answer exactly ek hai). Code se pehle: approach aur complexity batao.",
      rubric: [
        { point: "Brute force: har pair, O(n²)", keys: ["o(n^2)", "o(n²)", "n^2", "nested", "har pair", "brute"] },
        { point: "Har x ke liye <b>complement = target - x</b> dhoondho", keys: ["target - ", "target-", "complement", "baaki", "remaining", "difference"], weight: 2 },
        { point: "<b>HashMap</b> value → index, ab tak dekhe gaye elements ka", keys: ["hashmap", "hash map", "map", "dictionary"], weight: 2 },
        { point: "Pehle lookup, phir insert (same element dobara use na ho)", keys: ["pehle check", "check first", "phir daalo", "then put", "then insert", "baad mein daal", "same element"] },
        { point: "Time O(n), space O(n)", keys: ["o(n)", "linear", "one pass", "ek pass"], weight: 2 }
      ],
      answer: `<p>Brute force O(n²) har pair check karta hai. Better: ek pass mein chalo, aur har <code>x</code> pe poochho "kya <code>target - x</code> pehle aa chuka hai?". Iske liye <code>HashMap&lt;value, index&gt;</code>.</p>
        <p>Order: pehle map mein complement dhoondho, mile to <code>[map.get(comp), i]</code> return. Nahi mila to <code>map.put(x, i)</code>. Isse ek element khud se pair nahi banata.</p>
        <p><b>Time O(n)</b> average, <b>space O(n)</b>. Alternative: sort + two pointers O(n log n), par sort se original indices kho jaate hain, to (value, index) pairs sort karne padenge.</p>`
    },
    {
      type: "exercise",
      id: "ex-two-sum",
      title: "Two Sum",
      level: "Easy",
      task: `<p>Given an integer array <code>nums</code> and an integer <code>target</code>, return the indices of the two <b>different</b> elements whose sum equals <code>target</code>.</p><p>Return them as <code>new int[]{i, j}</code> with <code>i &lt; j</code>. Every input has exactly one valid answer.</p><h4>Constraints</h4><ul><li>2 ≤ nums.length ≤ 10⁵</li><li>-10⁹ ≤ nums[i], target ≤ 10⁹</li><li>Exactly one valid pair exists</li><li>Aim for O(n) time</li></ul><p><a href="https://leetcode.com/problems/two-sum/" target="_blank">LeetCode 1</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [3,2,4], target = 6
Output: [1,2]
Explanation: 2 + 4 = 6. Index 0 cannot be used twice (3 + 3).</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] twoSum(int[] nums, int target) {
        // yahan likho
        return new int[]{-1, -1};
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("nums=[2,7,11,15], target=9", new int[]{0, 1}, () -> s.twoSum(new int[]{2, 7, 11, 15}, 9));
        Check.eq("nums=[3,2,4], target=6", new int[]{1, 2}, () -> s.twoSum(new int[]{3, 2, 4}, 6));
        Check.hiddenFromHere();
        Check.eq("duplicates: [3,3], target=6", new int[]{0, 1}, () -> s.twoSum(new int[]{3, 3}, 6));
        Check.eq("negative: [-3,4,3,90], target=0", new int[]{0, 2}, () -> s.twoSum(new int[]{-3, 4, 3, 90}, 0));
        Check.eq("[5,-2,8,1], target=-1", new int[]{1, 3}, () -> s.twoSum(new int[]{5, -2, 8, 1}, -1));
        int n = 100000;
        int[] big = new int[n];
        for (int i = 0; i < n; i++) big[i] = i;
        Check.eq("bada input n=1e5 (pair end mein)", new int[]{n - 2, n - 1}, () -> s.twoSum(big, (n - 2) + (n - 1)));
    }
}`,
      hints: [
        "Har <code>nums[i]</code> ke liye sochna hai: kaunsa number chahiye? <code>target - nums[i]</code>.",
        "Ab tak ke numbers ko <code>HashMap&lt;Integer, Integer&gt;</code> (value → index) mein rakho.",
        "Loop mein: <code>if (map.containsKey(target - x)) return new int[]{map.get(target - x), i}; map.put(x, i);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();   // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            Integer j = seen.get(need);
            if (j != null) return new int[]{j, i};
            seen.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }
}`,
      explain: `<p><b>Approach:</b> ek pass. Har index pe complement <code>target - x</code> map mein dhoondho; mila to answer, nahi to <code>x → i</code> map mein daalo.</p>
        <p><b>Time:</b> O(n) average. <b>Space:</b> O(n) map ke liye.</p>`
    },
    {
      type: "think",
      id: "think-anagrams",
      q: "<b>Group Anagrams:</b> strings ki list hai. Jo strings ek doosre ke anagram hain (same letters, alag order) unhe ek group mein daalo. Map ki <b>key</b> kya banaoge? Complexity?",
      rubric: [
        { point: "Anagrams ki <b>common key</b> chahiye: sorted string ya letter count", keys: ["sort", "sorted", "count", "frequency", "freq", "key"], weight: 2 },
        { point: "<b>HashMap&lt;key, List&lt;String&gt;&gt;</b> mein group", keys: ["hashmap", "map", "list", "group"], weight: 2 },
        { point: "Sorted key: O(n · k log k) (k = max string length)", keys: ["k log k", "klogk", "n k log", "nklogk"] },
        { point: "Count key (int[26]): O(n · k)", keys: ["26", "o(nk)", "n*k", "n·k", "n * k"] }
      ],
      answer: `<p>Do strings anagram hain agar unke letters sort karne pe same string bane: "eat" → "aet", "tea" → "aet". To <b>sorted string ko key</b> banao: <code>HashMap&lt;String, List&lt;String&gt;&gt;</code>.</p>
        <p>n strings, har ek ki length max k: sorting key ka cost O(k log k), total <b>O(n · k log k)</b>. Space O(n · k).</p>
        <p>Faster key: 26 letters ka count array, jise string bana do (jaise "1#0#0#...#"). Ye O(n · k) hai. Chhoti strings pe dono same lagte hain, interview mein dono bolo.</p>`
    },
    {
      type: "exercise",
      id: "ex-group-anagrams",
      title: "Group Anagrams",
      level: "Medium",
      task: `<p>Given an array of strings <code>strs</code>, group together the strings that are <b>anagrams</b> of each other (same letters with the same counts, possibly in a different order).</p><p>Return the groups in any order; the order of strings inside a group also does not matter.</p><h4>Constraints</h4><ul><li>1 ≤ strs.length ≤ 10⁵</li><li>0 ≤ strs[i].length ≤ 100</li><li>strs[i] contains only lowercase English letters (it may be empty)</li></ul><p><a href="https://leetcode.com/problems/group-anagrams/" target="_blank">LeetCode 49</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["eat","tea","ate"],["tan","nat"],["bat"]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  strs = [""]
Output: [[""]]</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  strs = ["a"]
Output: [["a"]]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<List<String>> groupAnagrams(String[] strs) {
        // yahan likho
        return new ArrayList<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrderDeep("[eat,tea,tan,ate,nat,bat]",
            List.of(List.of("eat", "tea", "ate"), List.of("tan", "nat"), List.of("bat")),
            () -> s.groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
        Check.eqAnyOrderDeep("[a]", List.of(List.of("a")), () -> s.groupAnagrams(new String[]{"a"}));
        Check.hiddenFromHere();
        Check.eqAnyOrderDeep("empty string [\\"\\"]", List.of(List.of("")), () -> s.groupAnagrams(new String[]{""}));
        Check.eqAnyOrderDeep("duplicates [abc,bca,xyz,zyx,abc]",
            List.of(List.of("abc", "bca", "abc"), List.of("xyz", "zyx")),
            () -> s.groupAnagrams(new String[]{"abc", "bca", "xyz", "zyx", "abc"}));
        Check.eqAnyOrderDeep("same letters, alag count [aab,aba,abb]",
            List.of(List.of("aab", "aba"), List.of("abb")),
            () -> s.groupAnagrams(new String[]{"aab", "aba", "abb"}));
        // bada input: 1e5 strings, 676 groups
        int n = 100000;
        String[] big = new String[n];
        for (int i = 0; i < n; i++) {
            int g = i % 676;
            char x = (char) ('a' + g % 26), y = (char) ('a' + g / 26);
            String w = "" + x + y + y;
            int r = i % 3;
            big[i] = w.substring(r) + w.substring(0, r);
        }
        Check.eq("bada input n=1e5: groups ki ginti", 676, () -> s.groupAnagrams(big).size());
    }
}`,
      hints: [
        "Anagrams ko ek jaisi <b>key</b> chahiye. \"eat\" aur \"tea\" mein kya same hai?",
        "String ke chars sort karo: <code>char[] c = str.toCharArray(); Arrays.sort(c); String key = new String(c);</code>",
        "<code>map.computeIfAbsent(key, k -&gt; new ArrayList&lt;&gt;()).add(str);</code> aur end mein <code>new ArrayList&lt;&gt;(map.values())</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String str : strs) {
            char[] c = str.toCharArray();
            Arrays.sort(c);                       // "tea" -> "aet"
            String key = new String(c);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
        }
        return new ArrayList<>(groups.values());
    }
}`,
      explain: `<p><b>Approach:</b> har string ki sorted copy key hai. Same key wali strings ek list mein.</p>
        <p><b>Time:</b> O(n · k log k), n = strings, k = max length. <b>Space:</b> O(n · k) map mein.</p>
        <p>Count-array key (<code>int[26]</code> → string) se O(n · k) bhi ho sakta hai.</p>`
    },
    {
      type: "think",
      id: "think-topk",
      q: "<b>Top K Frequent Elements:</b> array mein se wo k values batao jo sabse zyada baar aati hain. Frequency map ke baad top k kaise nikaaloge? Sort se better kuch?",
      rubric: [
        { point: "Pehle <b>frequency map</b> (value → count)", keys: ["frequency", "freq", "count", "hashmap", "map"], weight: 2 },
        { point: "Option 1: entries ko count se sort, O(n log n)", keys: ["sort", "n log n", "nlogn"] },
        { point: "Option 2: <b>min-heap of size k</b>, O(n log k)", keys: ["heap", "priorityqueue", "priority queue", "log k"] },
        { point: "Option 3: <b>bucket sort</b> (index = count), O(n)", keys: ["bucket", "o(n)", "linear", "count index"], weight: 2 }
      ],
      answer: `<p>Step 1: <code>HashMap&lt;value, count&gt;</code>, O(n).</p>
        <p>Step 2 ke teen options:</p>
        <ol><li>Entries ko count se sort: O(m log m), m = distinct values.</li>
        <li><b>Min-heap size k</b>: har entry daalo, size k se zyada ho to sabse chhota nikaalo. O(m log k). Jab k chhota ho ye achha hai.</li>
        <li><b>Bucket sort</b>: koi bhi count n se zyada nahi ho sakta. <code>buckets[count]</code> mein values daalo, phir n se neeche chalo jab tak k values na mil jaayein. <b>O(n) time, O(n) space.</b></li></ol>`
    },
    {
      type: "exercise",
      id: "ex-top-k",
      title: "Top K Frequent Elements",
      level: "Medium",
      task: `<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> values that occur most often. The answer is guaranteed to be unique (no tie at the k-th place). You may return the values in any order.</p><p>Sorting by frequency (O(n log n)) passes; try for O(n) with bucket sort.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>-10⁴ ≤ nums[i] ≤ 10⁴</li><li>1 ≤ k ≤ number of distinct values</li></ul><p><a href="https://leetcode.com/problems/top-k-frequent-elements/" target="_blank">LeetCode 347</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
Explanation: 1 appears 3 times, 2 appears 2 times, 3 appears once.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1], k = 1
Output: [1]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] topKFrequent(int[] nums, int k) {
        // yahan likho
        return new int[0];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("nums=[1,1,1,2,2,3], k=2", List.of(1, 2), () -> s.topKFrequent(new int[]{1, 1, 1, 2, 2, 3}, 2));
        Check.eqAnyOrder("nums=[1], k=1", List.of(1), () -> s.topKFrequent(new int[]{1}, 1));
        Check.hiddenFromHere();
        Check.eqAnyOrder("negatives [4,4,-1,-1,-1,2], k=2", List.of(-1, 4), () -> s.topKFrequent(new int[]{4, 4, -1, -1, -1, 2}, 2));
        Check.eqAnyOrder("[5,6,7,5,6,5], k=1", List.of(5), () -> s.topKFrequent(new int[]{5, 6, 7, 5, 6, 5}, 1));
        Check.eqAnyOrder("k = distinct count [3,1,2], k=3", List.of(1, 2, 3), () -> s.topKFrequent(new int[]{3, 1, 2}, 3));
        // bada input: value v (0..446) exactly v+1 baar, total 100128
        List<Integer> list = new ArrayList<>();
        for (int v = 0; v <= 446; v++) for (int c = 0; c <= v; c++) list.add(v);
        Collections.shuffle(list, new Random(7));
        int[] big = list.stream().mapToInt(Integer::intValue).toArray();
        Check.eqAnyOrder("bada input n=100128, k=3", List.of(444, 445, 446), () -> s.topKFrequent(big, 3));
    }
}`,
      hints: [
        "Pehle <code>HashMap&lt;Integer, Integer&gt;</code> se har value ki count nikaalo.",
        "Count kabhi <code>n</code> se zyada nahi hoti. To <code>List&lt;Integer&gt;[] buckets = new List[n + 1]</code> banao, <code>buckets[count]</code> mein value daalo.",
        "Ab <code>c = n</code> se <code>1</code> tak chalo aur buckets se values uthao jab tak k na ho jaayein."
      ],
      solution: `import java.util.*;

class Solution {
    int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) freq.merge(x, 1, Integer::sum);

        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            buckets.get(e.getValue()).add(e.getKey());   // index = count
        }

        int[] ans = new int[k];
        int idx = 0;
        for (int c = nums.length; c >= 1 && idx < k; c--) {
            for (int v : buckets.get(c)) {
                if (idx == k) break;
                ans[idx++] = v;
            }
        }
        return ans;
    }
}`,
      explain: `<p><b>Approach:</b> frequency map, phir bucket sort: <code>buckets[c]</code> = wo values jo exactly c baar aayi. Sabse bade c se neeche chal ke k values lo.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Heap wala approach O(n log k) hai aur streaming data (jaise "trending hashtags") ke liye zyada practical hai, kyunki bucket array ke liye max count pehle se pata hona chahiye.</p>`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> <code>Integer</code> ko <code>==</code> se compare karna. <code>map.get(a) == map.get(b)</code> sirf -128..127 tak sahi chalta hai (Integer cache). Bade counts pe <code>.equals()</code> ya <code>intValue()</code> use karo."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Signal: "pehle dekha?", "kitni baar?", "same property wale group karo".</li><li>Two Sum: complement map (value → index), pehle lookup phir insert. O(n).</li><li>Group Anagrams: sorted string (ya 26-count) key. O(n · k log k).</li><li>Top K Frequent: frequency map + bucket sort O(n), ya min-heap O(n log k).</li><li>Trade-off: O(n) extra space ke badle O(n²) → O(n).</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Pehle brute force bolo (\"O(n²), har pair\"), phir bolo <i>\"main lookup ko O(1) karne ke liye HashMap use karunga, space O(n) lagega\"</i>. Interviewer ko trade-off sunna hai. Agar wo bole \"extra space nahi\", to sort + two pointers pe switch karo."
    }
  ],
  references: [
    { title: "Two Sum", by: "LeetCode", url: "https://leetcode.com/problems/two-sum/", type: "article" },
    { title: "Group Anagrams", by: "LeetCode", url: "https://leetcode.com/problems/group-anagrams/", type: "article" },
    { title: "Top K Frequent Elements", by: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-elements/", type: "article" },
    { title: "NeetCode Roadmap (Arrays & Hashing)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" },
    { title: "HashMap (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" }
  ]
});
