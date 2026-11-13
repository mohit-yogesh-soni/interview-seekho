// Monotonic Stack
registerLesson("dsa", "monotonic-stack", {
  why: "\"Har element ke liye agla bada / chhota element kaunsa hai?\" ye sawaal stock span, daily temperatures, histogram jaise problems ki jaan hai. Nested loop O(n²) ki jagah ek stack se O(n) mein hota hai, aur ye trick bina dekhe sochna mushkil hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>Har index ke liye <b>next greater / next smaller / previous greater / previous smaller</b> element chahiye.</li>
          <li>"Kitne din baad zyada garmi?", "stock kitne din se lagataar badh raha hai?" (span)</li>
          <li>Har bar ke liye <b>kitni door tak</b> left/right wo sabse chhota hai (histogram, trapping water).</li>
        </ul>
        <h2>Brute force vs stack</h2>
        <p>Brute force: har i ke liye aage scan karo jab tak bada na mile. Worst case (sab barabar ya ghatte hue) O(n²).</p>
        <p><b>Monotonic stack:</b> stack mein un elements ke <b>indices</b> rakho jinka answer abhi nahi mila. Stack ko ek order (jaise values decreasing) mein rakho. Naya element aaya aur wo top se bada hai, to top ka answer mil gaya: pop karke answer likho. Har index ek baar push, max ek baar pop: <b>O(n)</b>.</p>
        <p>Example: line mein khade log, har koi apne aage dekhta hai ki pehla lamba banda kaun hai. Jab koi lamba aata hai, to usse chhote jitne bhi intezaar kar rahe the, sabko answer mil jaata hai.</p>
        <table>
          <tr><th>Chahiye</th><th>Stack order (bottom → top)</th><th>Pop kab</th></tr>
          <tr><td>Next greater</td><td>decreasing</td><td><code>a[i] &gt; a[top]</code></td></tr>
          <tr><td>Next smaller</td><td>increasing</td><td><code>a[i] &lt; a[top]</code></td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Template: next greater element (index stack)",
      code: `import java.util.*;

public class Main {
    static int[] nextGreater(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);                          // default: koi bada nahi
        Deque<Integer> stack = new ArrayDeque<>();     // indices, values decreasing
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && a[i] > a[stack.peek()]) {
                ans[stack.pop()] = a[i];               // top ka answer mila
            }
            stack.push(i);
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[]{2, 1, 2, 4, 3})));
        // [4, 2, 4, -1, -1]
    }
}`,
      note: "Java mein <code>Stack</code> class purani (synchronized, Vector based) hai. <code>ArrayDeque</code> ko stack ki tarah use karo: <code>push</code>, <code>pop</code>, <code>peek</code>."
    },
    {
      type: "steps",
      title: "Next greater dry run: [2, 1, 2, 4, 3]",
      steps: [
        { title: "i=0 (2)", html: `<div class="arr"><span class="cell hl">2</span><span class="cell">1</span><span class="cell">2</span><span class="cell">4</span><span class="cell">3</span></div><p>Stack khaali, push 0. stack = [2]</p>` },
        { title: "i=1 (1)", html: `<div class="arr"><span class="cell win">2</span><span class="cell hl">1</span><span class="cell">2</span><span class="cell">4</span><span class="cell">3</span></div><p>1 &lt; 2, pop nahi. push. stack = [2, 1] (decreasing)</p>` },
        { title: "i=2 (2)", html: `<div class="arr"><span class="cell win">2</span><span class="cell ok">1</span><span class="cell hl">2</span><span class="cell">4</span><span class="cell">3</span></div><p>2 &gt; 1: pop index 1, <b>ans[1] = 2</b>. 2 &gt; 2? nahi (barabar), ruko. push. stack = [2, 2]</p>` },
        { title: "i=3 (4)", html: `<div class="arr"><span class="cell ok">2</span><span class="cell ok">1</span><span class="cell ok">2</span><span class="cell hl">4</span><span class="cell">3</span></div><p>4 &gt; 2: pop index 2, <b>ans[2] = 4</b>. 4 &gt; 2: pop index 0, <b>ans[0] = 4</b>. push. stack = [4]</p>` },
        { title: "i=4 (3), end", html: `<div class="arr"><span class="cell ok">2</span><span class="cell ok">1</span><span class="cell ok">2</span><span class="cell win">4</span><span class="cell win hl">3</span></div><p>3 &lt; 4, push. Loop khatam. Stack mein bache (4, 3) ka koi bada nahi: -1. <b>Answer [4, 2, 4, -1, -1]</b></p>` }
      ]
    },
    {
      type: "think",
      id: "think-daily",
      q: "<b>Daily Temperatures:</b> har din ke liye batao kitne din baad <b>zyada</b> garmi hogi (na ho to 0). Stack mein kya rakhoge aur answer kaise nikaaloge? Brute force kab O(n²) hota hai?",
      rubric: [
        { point: "Stack mein <b>indices</b> (days) jinka answer pending hai", keys: ["index", "indices", "din", "days", "pending"], weight: 2 },
        { point: "Stack temperatures mein <b>decreasing</b> rakho", keys: ["decreasing", "monotonic", "ghatta", "descending"] },
        { point: "Garam din aaya: pop karo, <b>ans[j] = i - j</b>", keys: ["i - j", "i-j", "difference", "farak", "pop"], weight: 2 },
        { point: "Brute force O(n²) jab sab same ya ghatte hue (har din end tak scan)", keys: ["o(n^2)", "o(n²)", "n^2", "same", "decreasing", "worst"] },
        { point: "Time <b>O(n)</b>: har index ek push, ek pop", keys: ["o(n)", "linear", "ek baar", "once"], weight: 2 }
      ],
      answer: `<p>Stack mein un dino ke <b>index</b> rakho jinka "agla garam din" abhi nahi mila; unki temperatures stack mein decreasing hongi.</p>
        <p>Din i pe: <code>while (stack top ki temp &lt; temps[i])</code> → <code>j = pop()</code>, <code>ans[j] = i - j</code>. Phir <code>push(i)</code>. Jo end tak bache unka answer 0 (default).</p>
        <p><b>Time O(n)</b> (amortized: har index ek baar push/pop), <b>space O(n)</b>. Brute force har din aage scan karta hai, aur jab garam din bahut door ho (ya ho hi nahi) to O(n²).</p>`
    },
    {
      type: "exercise",
      id: "ex-daily",
      title: "Daily Temperatures",
      level: "Medium",
      task: `<p><code>temps[i]</code> is the temperature on day i. For every day, return how many days you have to wait until a <b>strictly warmer</b> day. If there is no warmer day later, the answer for that day is 0.</p><h4>Constraints</h4><ul><li>1 ≤ temps.length ≤ 10⁵</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/daily-temperatures/" target="_blank">LeetCode 739</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  temps = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
Explanation: Day 2 (75) waits until day 6 (76): 4 days.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  temps = [30,40,50,60]
Output: [1,1,1,0]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] dailyTemperatures(int[] temps) {
        // yahan likho
        return new int[temps.length];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[73,74,75,71,69,72,76,73]", new int[]{1, 1, 4, 2, 1, 1, 0, 0}, () -> s.dailyTemperatures(new int[]{73, 74, 75, 71, 69, 72, 76, 73}));
        Check.eq("[30,40,50,60]", new int[]{1, 1, 1, 0}, () -> s.dailyTemperatures(new int[]{30, 40, 50, 60}));
        Check.eq("[30,60,90]", new int[]{1, 1, 0}, () -> s.dailyTemperatures(new int[]{30, 60, 90}));
        Check.hiddenFromHere();
        Check.eq("single [50]", new int[]{0}, () -> s.dailyTemperatures(new int[]{50}));
        Check.eq("barabar [70,70,70] (strictly zyada chahiye)", new int[]{0, 0, 0}, () -> s.dailyTemperatures(new int[]{70, 70, 70}));
        Check.eq("ghatta [90,80,70]", new int[]{0, 0, 0}, () -> s.dailyTemperatures(new int[]{90, 80, 70}));
        Check.eq("[55,38,53,81,61,93,97,32,43,78]", new int[]{3, 1, 1, 2, 1, 1, 0, 1, 1, 0},
            () -> s.dailyTemperatures(new int[]{55, 38, 53, 81, 61, 93, 97, 32, 43, 78}));
        int n = 100000;
        int[] big = new int[n];
        Arrays.fill(big, 50);
        big[n - 1] = 100;
        int[] expected = new int[n];
        for (int i = 0; i < n - 1; i++) expected[i] = n - 1 - i;
        Check.eq("bada: n=1e5, garam din sirf end mein (O(n^2) slow)", expected, () -> s.dailyTemperatures(big));
    }
}`,
      hints: [
        "<code>Deque&lt;Integer&gt; stack = new ArrayDeque&lt;&gt;()</code> mein din ke index rakho.",
        "Din i pe: jab tak <code>temps[i] &gt; temps[stack.peek()]</code>, pop karo aur answer likho.",
        "<code>int j = stack.pop(); ans[j] = i - j;</code> phir <code>stack.push(i)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    int[] dailyTemperatures(int[] temps) {
        int n = temps.length;
        int[] ans = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();   // indices, temps decreasing
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
                int j = stack.pop();
                ans[j] = i - j;
            }
            stack.push(i);
        }
        return ans;
    }
}`,
      explain: `<p><b>Approach:</b> next greater element ka template, value ki jagah distance <code>i - j</code> likho.</p>
        <p><b>Time:</b> O(n) amortized. <b>Space:</b> O(n) stack.</p>`
    },
    {
      type: "think",
      id: "think-nge2",
      q: "<b>Next Greater Element II:</b> array <b>circular</b> hai (last ke baad first aata hai). Har element ka next greater value batao, na ho to -1. Circular ko kaise handle karoge bina array copy kiye?",
      rubric: [
        { point: "<b>Do baar ghoomo</b>: i = 0 se 2n - 1, index = i % n", keys: ["2n", "2 * n", "do baar", "twice", "i % n", "modulo", "% n"], weight: 2 },
        { point: "Same next greater stack template (decreasing)", keys: ["stack", "monotonic", "decreasing", "next greater"], weight: 2 },
        { point: "Sirf pehle round (i &lt; n) mein push zaroori; doosre round mein sirf answers bharo", keys: ["i < n", "pehle round", "first pass", "sirf pop", "push nahi"] },
        { point: "Default answer -1 (sabse bada element)", keys: ["-1", "fill", "default", "maximum"] },
        { point: "Time O(n), space O(n)", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Circular ka matlab: kisi element ke baad array ka shuru wala hissa bhi \"aage\" hai. Trick: <b>loop 2n baar chalao</b>, index <code>i % n</code>. Pehle round mein normal next greater; doosre round mein jo elements stack mein bache hain unhe shuru ke elements se answer mil jaata hai.</p>
        <p><code>ans</code> ko -1 se bharo (max element ka koi bada nahi). Push sirf <code>i &lt; n</code> pe (doosre round mein push zaroori nahi). <b>Time O(n)</b> (2n iterations), <b>space O(n)</b>.</p>`
    },
    {
      type: "exercise",
      id: "ex-nge2",
      title: "Next Greater Element II (circular)",
      level: "Medium",
      task: `<p>The array is <b>circular</b>: after <code>nums[n-1]</code> comes <code>nums[0]</code>. For every index return the first value after it (going around the circle) that is <b>strictly greater</b>, or <code>-1</code> if none exists.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>Values fit in int</li></ul><p><a href="https://leetcode.com/problems/next-greater-element-ii/" target="_blank">LeetCode 503</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [1,2,1]
Output: [2,-1,2]
Explanation: The last 1 wraps around and finds 2. Nothing is greater than 2.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [1,2,3,4,3]
Output: [2,3,4,-1,4]</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[] nextGreaterElements(int[] nums) {
        // yahan likho
        return new int[nums.length];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,1]", new int[]{2, -1, 2}, () -> s.nextGreaterElements(new int[]{1, 2, 1}));
        Check.eq("[1,2,3,4,3]", new int[]{2, 3, 4, -1, 4}, () -> s.nextGreaterElements(new int[]{1, 2, 3, 4, 3}));
        Check.hiddenFromHere();
        Check.eq("single [5]", new int[]{-1}, () -> s.nextGreaterElements(new int[]{5}));
        Check.eq("sab barabar [3,3,3]", new int[]{-1, -1, -1}, () -> s.nextGreaterElements(new int[]{3, 3, 3}));
        Check.eq("ghatta [5,4,3,2,1]", new int[]{-1, 5, 5, 5, 5}, () -> s.nextGreaterElements(new int[]{5, 4, 3, 2, 1}));
        Check.eq("negatives [-2,-1,-3]", new int[]{-1, -1, -2}, () -> s.nextGreaterElements(new int[]{-2, -1, -3}));
        int n = 100000;
        int[] big = new int[n];
        Arrays.fill(big, 7);
        big[0] = 9;
        int[] expected = new int[n];
        Arrays.fill(expected, 9);
        expected[0] = -1;
        Check.eq("bada: n=1e5, bada element shuru mein (O(n^2) slow)", expected, () -> s.nextGreaterElements(big));
    }
}`,
      hints: [
        "<code>Arrays.fill(ans, -1)</code>. Stack mein indices.",
        "Loop <code>for (int i = 0; i &lt; 2 * n; i++)</code> aur <code>int x = nums[i % n]</code>.",
        "Pop: <code>while (!st.isEmpty() &amp;&amp; x &gt; nums[st.peek()]) ans[st.pop()] = x;</code> aur <code>if (i &lt; n) st.push(i);</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < 2 * n; i++) {          // do round = circular
            int x = nums[i % n];
            while (!st.isEmpty() && x > nums[st.peek()]) {
                ans[st.pop()] = x;
            }
            if (i < n) st.push(i);                  // doosre round mein sirf answers
        }
        return ans;
    }
}`,
      explain: `<p><b>Approach:</b> next greater template, 2n iterations <code>i % n</code> se.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Note: <code>[-2,-1,-3]</code> mein index 0 ka answer value <code>-1</code> hai (jo -2 se bada hai), aur index 1 ka answer \"nahi mila\" wala -1. Output mein dono same dikhte hain, isliye LeetCode pe ye confusing test case hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Histogram: har bar kitni door tak faile?</h2>
        <p>Bar <code>i</code> ko height maan ke rectangle banao: wo left aur right mein tab tak faile ga jab tak usse <b>chhoti</b> bar na mile. Width = (next smaller index) - (previous smaller index) - 1. Area = <code>h[i] × width</code>.</p>
        <pre class="diagram">
heights: [2, 1, 5, 6, 2, 3]

6 |           #
5 |        #  #
4 |        #  #
3 |        #  #     #
2 |  #     #  #  #  #
1 |  #  #  #  #  #  #
  +-------------------
     0  1  2  3  4  5

bar 2 (h=5): prev smaller = index 1, next smaller = index 4
width = 4 - 1 - 1 = 2, area = 5 × 2 = 10   ← answer
        </pre>
        <p>Ek hi pass mein dono mil jaate hain: <b>increasing stack</b>. Jab bar <code>i</code> top se chhoti hai, top ka <i>next smaller</i> = i, aur pop ke baad naya top uska <i>previous smaller</i>.</p>`
    },
    {
      type: "think",
      id: "think-histogram",
      q: "<b>Largest Rectangle in Histogram:</b> bars ki heights di hain (width 1 each). Sabse bada rectangle area kya hai? Stack mein kaunsa order rakhoge aur pop pe width kaise nikaaloge?",
      rubric: [
        { point: "Har bar ko <b>height</b> maan ke left/right mein chhoti bar tak failao", keys: ["har bar", "each bar", "height", "faila", "extend", "chhoti bar", "smaller"], weight: 2 },
        { point: "<b>Increasing</b> stack (indices)", keys: ["increasing", "badhta", "ascending", "monotonic"], weight: 2 },
        { point: "Pop pe: right = i, left = naya top; <b>width = i - top - 1</b> (stack khaali to i)", keys: ["i - ", "width", "- 1", "naya top", "new top", "stack empty"], weight: 2 },
        { point: "End mein bache bars ke liye <b>sentinel height 0</b> (i = n)", keys: ["sentinel", "0 height", "height 0", "i == n", "end mein", "flush"] },
        { point: "Time <b>O(n)</b>", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Har bar i ke liye: max rectangle jisme i sabse chhoti bar hai = <code>h[i] × (nextSmaller - prevSmaller - 1)</code>. Sab i ka max = answer.</p>
        <p><b>Increasing stack</b> of indices. <code>i = 0..n</code> (i = n pe height 0 maano, taaki sab pop ho jaayein). Jab <code>h[i] &lt; h[top]</code>: <code>top = pop()</code>; uska right boundary i, left boundary naya <code>stack.peek()</code> (ya -1 agar khaali). <code>width = i - left - 1</code>, area = <code>h[top] × width</code>.</p>
        <p><b>Time O(n), space O(n).</b> Brute force (har bar se dono taraf failao) O(n²).</p>`
    },
    {
      type: "exercise",
      id: "ex-histogram",
      title: "Largest Rectangle in Histogram",
      level: "Hard",
      task: `<p><code>heights</code> are the bar heights of a histogram; every bar is 1 wide. Return the area of the largest rectangle that fits inside the histogram (made of contiguous bars).</p><p class="small muted">Example 1: bars 5 and 6 give height 5 × width 2 = 10</p><pre class="diagram">      █
    █ █
    █ █
    █ █   █
█   █ █ █ █
█ █ █ █ █ █
2 1 5 6 2 3</pre><h4>Constraints</h4><ul><li>1 ≤ heights.length ≤ 10⁵</li><li>heights[i] ≥ 0 and the answer fits in an int</li></ul><p><a href="https://leetcode.com/problems/largest-rectangle-in-histogram/" target="_blank">LeetCode 84</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  heights = [2,1,5,6,2,3]
Output: 10</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  heights = [2,4]
Output: 4</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int largestRectangleArea(int[] heights) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,1,5,6,2,3]", 10, () -> s.largestRectangleArea(new int[]{2, 1, 5, 6, 2, 3}));
        Check.eq("[2,4]", 4, () -> s.largestRectangleArea(new int[]{2, 4}));
        Check.hiddenFromHere();
        Check.eq("single [1]", 1, () -> s.largestRectangleArea(new int[]{1}));
        Check.eq("zero [0]", 0, () -> s.largestRectangleArea(new int[]{0}));
        Check.eq("barabar [2,2,2,2]", 8, () -> s.largestRectangleArea(new int[]{2, 2, 2, 2}));
        Check.eq("[6,2,5,4,5,1,6]", 12, () -> s.largestRectangleArea(new int[]{6, 2, 5, 4, 5, 1, 6}));
        Check.eq("badhta [1,2,3,4,5]", 9, () -> s.largestRectangleArea(new int[]{1, 2, 3, 4, 5}));
        int n = 100000;
        int[] big = new int[n];
        Arrays.fill(big, 10000);
        Check.eq("bada: n=1e5 sab 10000 (O(n^2) slow)", 10000 * n, () -> s.largestRectangleArea(big));
        int[] dip = big.clone();
        dip[50000] = 1;
        Check.eq("bada: beech mein ek chhoti bar", 10000 * 50000, () -> s.largestRectangleArea(dip));
    }
}`,
      hints: [
        "Har bar ke liye socho: agar ye rectangle ki sabse chhoti bar ho, to left/right kitna fail sakta hai?",
        "Increasing stack of indices. <code>for (int i = 0; i &lt;= n; i++)</code>, <code>int h = (i == n) ? 0 : heights[i];</code>",
        "<code>while (!st.isEmpty() &amp;&amp; h &lt; heights[st.peek()]) { int top = st.pop(); int left = st.isEmpty() ? -1 : st.peek(); best = max(best, heights[top] * (i - left - 1)); }</code> phir <code>st.push(i)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    int largestRectangleArea(int[] heights) {
        int n = heights.length, best = 0;
        Deque<Integer> st = new ArrayDeque<>();        // indices, heights increasing
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];         // sentinel: end pe sab pop
            while (!st.isEmpty() && h < heights[st.peek()]) {
                int top = st.pop();                    // right boundary = i
                int left = st.isEmpty() ? -1 : st.peek();
                best = Math.max(best, heights[top] * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }
}`,
      explain: `<p><b>Approach:</b> increasing stack. Pop hone wali bar ka right boundary current i, left boundary stack ka naya top. Sentinel height 0 se end mein saari bars process ho jaati hain.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Same idea LeetCode 85 (Maximal Rectangle) mein har row ko histogram bana ke lagta hai.</p>`
    },
    {
      type: "quiz",
      q: "Next greater ke liye stack mein <b>values</b> ki jagah <b>indices</b> kyun rakhte hain?",
      options: [
        "Indices se memory kam lagti hai",
        "Answer kis position pe likhna hai (aur distance) ye index se hi pata chalta hai; value index se mil jaati hai par ulta nahi",
        "Values stack mein daal hi nahi sakte",
        "Koi farak nahi padta"
      ],
      answer: 1,
      why: "Pop karte waqt <code>ans[j]</code> likhna hai, to j chahiye. Daily Temperatures mein <code>i - j</code> (distance) bhi index se aata hai. <code>a[j]</code> se value hamesha mil jaati hai, aur duplicates hon to value se position pata nahi chalti."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Signal: next/previous greater/smaller, span, "kitni door tak".</li><li>Stack mein indices; next greater ke liye decreasing, next smaller ke liye increasing.</li><li>Har index ek push, ek pop: O(n) amortized, chahe while loop andar ho.</li><li>Circular: 2n iterations, i % n. Histogram: pop pe width = i - newTop - 1, end pe height 0 sentinel.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Complexity batate waqt bolo <i>\"while loop andar hai, par har index max ek baar push aur ek baar pop hota hai, to total O(n) amortized\"</i>. Bahut log nested loop dekh ke O(n²) bol dete hain. Aur stack ka order (increasing/decreasing) code se pehle decide karke bolo."
    }
  ],
  references: [
    { title: "Daily Temperatures", by: "LeetCode", url: "https://leetcode.com/problems/daily-temperatures/", type: "article" },
    { title: "Next Greater Element II", by: "LeetCode", url: "https://leetcode.com/problems/next-greater-element-ii/", type: "article" },
    { title: "Largest Rectangle in Histogram", by: "LeetCode", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", type: "article" },
    { title: "NeetCode Roadmap (Stack)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" },
    { title: "ArrayDeque (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" }
  ]
});
