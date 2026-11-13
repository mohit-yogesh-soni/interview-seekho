// Fast aur Slow Pointers
registerLesson("dsa", "fast-slow", {
  why: "Linked list mein cycle dhoondhna, middle nikaalna, ya kisi sequence mein loop pakadna: ye sab do pointers se O(1) extra space mein hota hai. \"Bina HashSet ke karo\" wala follow-up isi pattern ke liye aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Idea: ek pointer 1 step, doosra 2 step</h2>
        <ul>
          <li><b>Middle:</b> fast end pe pahuncha to slow aadhe raste pe hoga.</li>
          <li><b>Cycle:</b> agar loop hai, to fast loop mein ghoomte hue slow ko pakad lega (jaise race track pe tez runner dheeme ko lap kar deta hai). Loop nahi hai to fast <code>null</code> pe pahunch jaayega.</li>
        </ul>
        <h2>Signals</h2>
        <ul>
          <li>Linked list hai aur <b>cycle</b>, <b>middle</b>, ya "end se k-th" poocha hai.</li>
          <li>Koi function baar baar lagao (<code>x → f(x)</code>) aur poochha hai "kya ye kabhi repeat hoga / 1 pe pahunchega?" (Happy Number, duplicate number in array).</li>
          <li>Follow-up: <b>O(1) extra space</b> (HashSet mana hai).</li>
        </ul>
        <table>
          <tr><th></th><th>HashSet approach</th><th>Fast/slow (Floyd)</th></tr>
          <tr><td>Time</td><td>O(n)</td><td>O(n)</td></tr>
          <tr><td>Space</td><td>O(n): har dekha node yaad</td><td><b>O(1)</b>: sirf 2 pointers</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Template: middle aur cycle detection (Floyd) ek demo mein",
      code: `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode middle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;          // 1 step
            fast = fast.next.next;     // 2 steps
        }
        return slow;                   // even length pe doosra middle
    }

    static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;   // reference compare, value nahi
        }
        return false;
    }

    public static void main(String[] args) {
        ListNode[] nodes = new ListNode[5];
        for (int i = 0; i < 5; i++) nodes[i] = new ListNode(i + 1);
        for (int i = 0; i < 4; i++) nodes[i].next = nodes[i + 1];
        System.out.println("middle = " + middle(nodes[0]).val);     // 3
        System.out.println("cycle? " + hasCycle(nodes[0]));         // false
        nodes[4].next = nodes[2];                                   // 5 -> 3: cycle
        System.out.println("cycle? " + hasCycle(nodes[0]));         // true
    }
}`,
      note: "Loop condition <code>fast != null &amp;&amp; fast.next != null</code> dono check zaroori hain, warna <code>fast.next.next</code> pe NullPointerException."
    },
    {
      type: "steps",
      title: "Floyd dry run: 1 → 2 → 3 → 4 → 5 → (wapas 3)",
      steps: [
        { title: "Shuru: slow = fast = 1", html: `<div class="arr"><span class="cell hl">1</span><span class="cell">2</span><span class="cell">3</span><span class="cell">4</span><span class="cell">5</span></div>
          <div class="arr ptrs"><span class="cell">S F</span><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>5 ka next 3 hai (cycle 3 → 4 → 5 → 3).</p>` },
        { title: "Step 1", html: `<div class="arr"><span class="cell">1</span><span class="cell hl">2</span><span class="cell hl">3</span><span class="cell">4</span><span class="cell">5</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell">S</span><span class="cell">F</span><span class="cell"></span><span class="cell"></span></div><p>slow 2 pe, fast 3 pe.</p>` },
        { title: "Step 2", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell hl">3</span><span class="cell">4</span><span class="cell hl">5</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">S</span><span class="cell"></span><span class="cell">F</span></div><p>slow 3, fast 5.</p>` },
        { title: "Step 3: mil gaye", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell">3</span><span class="cell ok">4</span><span class="cell">5</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell">S F</span><span class="cell"></span></div><p>slow 4 pe. fast: 5 → 3 → 4. <b>Dono 4 pe: cycle hai.</b></p>` },
        { title: "Phase 2: cycle ka start", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell ok">3</span><span class="cell">4</span><span class="cell">5</span></div>
          <p>Ek pointer head (1) pe, doosra meeting point (4) pe. Dono 1-1 step: (1, 4) → (2, 5) → (3, 3). <b>Cycle 3 se shuru hoti hai.</b></p>` }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Phase 2 kyun kaam karta hai? (thoda math)</h2>
        <pre class="diagram">
head --- a steps ---&gt; [cycle start] --- b steps ---&gt; (meet)
                           ^                            |
                           +------- c steps ------------+
cycle length L = b + c
        </pre>
        <p>Milne tak slow ne <code>a + b</code> steps chale, fast ne <code>2(a + b)</code>. Fast ne slow se kuch poore chakkar zyada lagaye: <code>2(a + b) - (a + b) = kL</code>, to <code>a + b = kL</code>, yaani <code>a = kL - b = (k-1)L + c</code>.</p>
        <p>Matlab: head se <code>a</code> steps chalna = meeting point se <code>c</code> steps (+ kuch poore chakkar) chalna. Dono ek saath 1-1 step chalein to <b>cycle start pe hi milenge</b>.</p>`
    },
    {
      type: "think",
      id: "think-cycle2",
      q: "<b>Linked List Cycle II:</b> agar list mein cycle hai to wo node return karo jahan se cycle shuru hoti hai, warna null. O(1) extra space mein kaise? List modify nahi kar sakte.",
      rubric: [
        { point: "Phase 1: <b>Floyd</b> slow (1 step) / fast (2 step), milein to cycle hai", keys: ["floyd", "slow", "fast", "tortoise", "hare", "2 step", "do step"], weight: 2 },
        { point: "fast null pe pahunche to <b>no cycle</b>, return null", keys: ["null", "no cycle", "cycle nahi"] },
        { point: "Phase 2: ek pointer <b>head se</b>, ek meeting point se, dono 1-1 step; jahan milein wahi start", keys: ["head se", "from head", "meeting point", "dono 1", "both one", "reset", "start pe"], weight: 2 },
        { point: "Reason: <b>a = (k-1)L + c</b> (head se start ki doori = meet se start ki doori)", keys: ["a = ", "distance", "doori", "math", "kl", "cycle length"] },
        { point: "Time O(n), space <b>O(1)</b>", keys: ["o(1)", "constant space", "o(n)"] }
      ],
      answer: `<p><b>Easy way:</b> HashSet mein nodes daalo, jo node pehle mila wo start. O(n) space.</p>
        <p><b>O(1) way (Floyd):</b> Phase 1 mein slow/fast chalao. fast <code>null</code> pe pahunche to cycle nahi. Mil gaye to Phase 2: <code>p1 = head</code>, <code>p2 = meeting point</code>, dono ek-ek step jab tak <code>p1 != p2</code>. Jahan milein wahi cycle ka start (upar wala math: <code>a = (k-1)L + c</code>).</p>
        <p><b>Time O(n), space O(1).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-cycle2",
      title: "Linked List Cycle II",
      level: "Medium",
      task: `<p>Given the head of a linked list, return the <b>node</b> where a cycle begins (the node itself, not its value), or <code>null</code> if there is no cycle. Do not modify the list. Try to use O(1) extra space.</p><p>In the tests, <code>pos</code> is the index of the node that the tail points back to (<code>-1</code> means no cycle). The node you return is converted to its index for comparison.</p><p class="small muted">Example 1: pos = 1</p><pre class="diagram">  3 → 2 → 0 → -4
      ↑         │
      └─────────┘</pre><h4>Constraints</h4><ul><li>0 ≤ number of nodes ≤ 10⁵</li><li>pos is -1 or a valid index</li></ul><p><a href="https://leetcode.com/problems/linked-list-cycle-ii/" target="_blank">LeetCode 142</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  head = [3,2,0,-4], pos = 1
Output: node at index 1 (value 2)</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  head = [1,2], pos = 0
Output: node at index 0</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  head = [1], pos = -1
Output: null</pre></div>`,
      userFile: "Solution.java",
      starter: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode detectCycle(ListNode head) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    // values se nodes banao, tail ko nodes[pos] se jodo (pos = -1: no cycle)
    static ListNode[] build(int[] vals, int pos) {
        ListNode[] nodes = new ListNode[vals.length];
        for (int i = 0; i < vals.length; i++) nodes[i] = new ListNode(vals[i]);
        for (int i = 0; i + 1 < vals.length; i++) nodes[i].next = nodes[i + 1];
        if (pos >= 0 && vals.length > 0) nodes[vals.length - 1].next = nodes[pos];
        return nodes;
    }

    static int indexOf(ListNode[] nodes, ListNode x) {
        if (x == null) return -1;
        for (int i = 0; i < nodes.length; i++) if (nodes[i] == x) return i;
        return -2;   // list ke bahar ka node?!
    }

    static int run(Solution s, int[] vals, int pos) {
        ListNode[] nodes = build(vals, pos);
        return indexOf(nodes, s.detectCycle(nodes.length == 0 ? null : nodes[0]));
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,2,0,-4], pos=1", 1, () -> run(s, new int[]{3, 2, 0, -4}, 1));
        Check.eq("[1,2], pos=0", 0, () -> run(s, new int[]{1, 2}, 0));
        Check.eq("[1], pos=-1", -1, () -> run(s, new int[]{1}, -1));
        Check.hiddenFromHere();
        Check.eq("empty list", -1, () -> run(s, new int[]{}, -1));
        Check.eq("self loop [1], pos=0", 0, () -> run(s, new int[]{1}, 0));
        Check.eq("no cycle [1,2,3,4,5]", -1, () -> run(s, new int[]{1, 2, 3, 4, 5}, -1));
        Check.eq("tail khud pe [1..6], pos=5", 5, () -> run(s, new int[]{1, 2, 3, 4, 5, 6}, 5));
        Check.eq("duplicate values [7,7,7,7], pos=2", 2, () -> run(s, new int[]{7, 7, 7, 7}, 2));
        int n = 100000;
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) vals[i] = i % 100;
        Check.eq("bada: n=1e5, pos=31337", 31337, () -> run(s, vals, 31337));
    }
}`,
      hints: [
        "Pehle Floyd: <code>slow = slow.next; fast = fast.next.next;</code> jab tak <code>fast != null &amp;&amp; fast.next != null</code>. <code>slow == fast</code> pe ruko.",
        "Agar loop fast ke null hone se toota, to <code>return null</code>.",
        "Phase 2: <code>ListNode p = head; while (p != slow) { p = p.next; slow = slow.next; } return p;</code>"
      ],
      solution: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {                 // cycle mili
                ListNode p = head;
                while (p != slow) {             // phase 2
                    p = p.next;
                    slow = slow.next;
                }
                return p;
            }
        }
        return null;                            // fast end pe pahuncha: no cycle
    }
}`,
      explain: `<p><b>Approach:</b> Floyd ka cycle detection, phir head aur meeting point se ek saath chal ke start.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>
        <p>Nodes ko <code>==</code> (reference) se compare karo, value se nahi: test mein duplicate values hain.</p>`
    },
    {
      type: "think",
      id: "think-middle",
      q: "<b>Middle of the Linked List:</b> ek pass mein middle node chahiye. Even length (jaise 6 nodes) pe <b>doosra</b> middle chahiye. Loop condition kya hogi?",
      rubric: [
        { point: "slow 1 step, fast 2 step; fast end pe to slow middle", keys: ["slow", "fast", "2 step", "do step", "double"], weight: 2 },
        { point: "Condition: <b>fast != null &amp;&amp; fast.next != null</b>", keys: ["fast != null", "fast.next != null", "fast.next", "null check"], weight: 2 },
        { point: "Is condition se even length pe <b>doosra middle</b> milta hai", keys: ["second middle", "doosra", "dusra", "even"] },
        { point: "Time O(n), space O(1), ek pass", keys: ["o(n)", "o(1)", "one pass", "ek pass"] }
      ],
      answer: `<p><code>slow = fast = head</code>. <code>while (fast != null &amp;&amp; fast.next != null) { slow = slow.next; fast = fast.next.next; }</code> return slow.</p>
        <p>6 nodes pe: fast 1 → 3 → 5 → null(7th); slow 1 → 2 → 3 → 4. Index 3 (4th node) = doosra middle. Agar pehla middle chahiye (jaise list ko do hisson mein todne ke liye), to condition <code>fast.next != null &amp;&amp; fast.next.next != null</code>.</p>
        <p><b>Time O(n), space O(1).</b> Alternative: pehle length gino, phir n/2 steps: do pass.</p>`
    },
    {
      type: "exercise",
      id: "ex-middle",
      title: "Middle of the Linked List",
      level: "Easy",
      task: `<p>Given the head of a non-empty linked list, return its middle node. If the list has two middle nodes (even length), return the <b>second</b> one.</p><p>The tests turn the returned node and everything after it into an array.</p><p class="small muted">Even length: second middle</p><pre class="diagram">1 → 2 → 3 → 4 → 5 → 6
            ^   ^
            |   └ return this (4)</pre><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/middle-of-the-linked-list/" target="_blank">LeetCode 876</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  head = [1,2,3,4,5]
Output: [3,4,5]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  head = [1,2,3,4,5,6]
Output: [4,5,6]</pre></div>`,
      userFile: "Solution.java",
      starter: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode middleNode(ListNode head) {
        // yahan likho
        return head;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static ListNode build(int[] vals) {
        ListNode dummy = new ListNode(0), t = dummy;
        for (int v : vals) { t.next = new ListNode(v); t = t.next; }
        return dummy.next;
    }

    static List<Integer> toList(ListNode h) {
        List<Integer> out = new ArrayList<>();
        for (int guard = 0; h != null && guard < 1_000_000; guard++, h = h.next) out.add(h.val);
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4,5]", List.of(3, 4, 5), () -> toList(s.middleNode(build(new int[]{1, 2, 3, 4, 5}))));
        Check.eq("[1,2,3,4,5,6]", List.of(4, 5, 6), () -> toList(s.middleNode(build(new int[]{1, 2, 3, 4, 5, 6}))));
        Check.hiddenFromHere();
        Check.eq("single [1]", List.of(1), () -> toList(s.middleNode(build(new int[]{1}))));
        Check.eq("do nodes [1,2]", List.of(2), () -> toList(s.middleNode(build(new int[]{1, 2}))));
        Check.eq("teen nodes [-1,-2,-3]", List.of(-2, -3), () -> toList(s.middleNode(build(new int[]{-1, -2, -3}))));
        int n = 100000;
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) vals[i] = i;
        ListNode big = build(vals);
        Check.eq("bada: n=1e5, middle ki value", 50000, () -> s.middleNode(big).val);
    }
}`,
      hints: [
        "Do pointers, dono head se. Ek 1 step, doosra 2 step.",
        "Loop: <code>while (fast != null &amp;&amp; fast.next != null)</code>",
        "Loop ke baad <code>slow</code> hi answer hai."
      ],
      solution: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}`,
      explain: `<p><b>Approach:</b> fast 2x speed se; jab fast end pe, slow beech mein.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>`
    },
    {
      type: "think",
      id: "think-happy",
      q: "<b>Happy Number:</b> number ke digits ke squares jodo, wahi repeat karo. 1 pe pahunche to happy, warna kisi loop mein ghoomta rehta hai. Ye linked list nahi hai, phir bhi fast/slow kaise lagega?",
      rubric: [
        { point: "<b>n → f(n)</b> (sum of squares of digits) ek implicit linked list hai", keys: ["f(n)", "next", "implicit", "sequence", "linked list jaisa", "chain"], weight: 2 },
        { point: "Ya to <b>1 pe pahunchega</b>, ya <b>cycle</b> mein phasega", keys: ["cycle", "loop", "repeat", "1 pe"], weight: 2 },
        { point: "Option 1: HashSet mein seen numbers", keys: ["hashset", "set", "seen"] },
        { point: "Option 2: <b>Floyd</b> slow = f(slow), fast = f(f(fast)), O(1) space", keys: ["floyd", "slow", "fast", "o(1)"], weight: 2 },
        { point: "Values jaldi chhoti ho jaati hain (3 digit ke liye max 243), isliye steps kam: O(log n)", keys: ["243", "log n", "chhota", "small", "jaldi", "bounded"] }
      ],
      answer: `<p>Har number ka ek hi "next" hai: <code>f(n)</code> = digits ke squares ka sum. To ye ek linked list jaisa chain hai. Ya to 1 pe pahunchega (1 → 1 pe ruk jaata hai), ya kisi cycle mein (jaise 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4).</p>
        <p><b>Floyd:</b> <code>slow = f(slow)</code>, <code>fast = f(f(fast))</code> jab tak <code>fast != 1 &amp;&amp; slow != fast</code>. End mein <code>fast == 1</code> to happy. <b>O(1) space.</b></p>
        <p><b>Kitne steps?</b> 10 digit number ka f max 10 × 81 = 810, 3 digit ka max 243. Values jaldi chhoti range mein aa jaati hain, phir cycle bounded hai. Time approx O(log n).</p>`
    },
    {
      type: "exercise",
      id: "ex-happy",
      title: "Happy Number",
      level: "Easy",
      task: `<p>Start from a positive integer <code>n</code>. Repeatedly replace the number with the sum of the squares of its digits. If the process reaches <code>1</code>, the number is <b>happy</b>; if it loops forever without reaching 1, it is not.</p><p>Return whether <code>n</code> is happy. Use Floyd's fast/slow pointers for O(1) extra space.</p><h4>Constraints</h4><ul><li>1 ≤ n ≤ 2³¹ − 1</li></ul><p><a href="https://leetcode.com/problems/happy-number/" target="_blank">LeetCode 202</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  n = 19
Output: true
Explanation: 1² + 9² = 82 → 8² + 2² = 68 → 6² + 8² = 100 → 1² + 0² + 0² = 1</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  n = 2
Output: false
Explanation: 2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → … (loop)</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    boolean isHappy(int n) {
        // yahan likho
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("n=19", true, () -> s.isHappy(19));
        Check.eq("n=2", false, () -> s.isHappy(2));
        Check.hiddenFromHere();
        Check.eq("n=1", true, () -> s.isHappy(1));
        Check.eq("n=7", true, () -> s.isHappy(7));
        Check.eq("n=4 (cycle ka hissa)", false, () -> s.isHappy(4));
        Check.eq("n=1111111", true, () -> s.isHappy(1111111));
        Check.eq("n=Integer.MAX_VALUE", false, () -> s.isHappy(Integer.MAX_VALUE));
        Check.eq("1..100000 mein happy numbers ki ginti", 14377, () -> {
            int c = 0;
            for (int i = 1; i <= 100000; i++) if (s.isHappy(i)) c++;
            return c;
        });
    }
}`,
      hints: [
        "Helper: <code>int next(int n)</code> jo digits nikaal ke (<code>n % 10</code>, <code>n / 10</code>) squares jode.",
        "<code>slow = n, fast = next(n)</code>. Jab tak <code>fast != 1 &amp;&amp; slow != fast</code>: slow 1 step, fast 2 step.",
        "End mein <code>return fast == 1;</code>"
      ],
      solution: `class Solution {
    boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }

    private int next(int n) {
        int sum = 0;
        while (n > 0) {
            int d = n % 10;
            sum += d * d;
            n /= 10;
        }
        return sum;
    }
}`,
      explain: `<p><b>Approach:</b> <code>n → next(n)</code> ko linked list maano aur Floyd lagao. 1 khud pe loop hai (next(1) = 1), to fast wahan ruk jaata hai.</p>
        <p><b>Time:</b> approx O(log n) (pehle step ke baad values ≤ 810 ho jaati hain). <b>Space:</b> O(1).</p>
        <p>Same trick LeetCode 287 (Find the Duplicate Number) mein bhi lagti hai: index → nums[index] ek implicit linked list hai.</p>`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> nodes ko value se compare karna (<code>slow.val == fast.val</code>). Duplicate values wali list mein ye galat \"cycle\" bata dega. Linked list mein hamesha <b>reference</b> (<code>slow == fast</code>) compare karo."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>slow 1 step, fast 2 step. Condition: fast != null &amp;&amp; fast.next != null.</li><li>Cycle: milein to cycle; Cycle II: head aur meeting point se ek saath chalo, start pe milenge.</li><li>Middle: loop khatam pe slow middle (even length pe doosra).</li><li>Implicit list (x → f(x)) pe bhi lagta hai: Happy Number, Find Duplicate.</li><li>Nodes reference (==) se compare karo, value se nahi.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Pehle HashSet wala O(n) space solution bolo, phir khud bolo <i>\"isko O(1) space mein Floyd se kar sakte hain\"</i>. Cycle II mein interviewer aksar poochhta hai \"phase 2 kyun kaam karta hai?\". <code>a = (k-1)L + c</code> wala chhota proof yaad rakho; ek diagram bana ke 30 second mein samjha sakte ho."
    }
  ],
  references: [
    { title: "Linked List Cycle II", by: "LeetCode", url: "https://leetcode.com/problems/linked-list-cycle-ii/", type: "article" },
    { title: "Middle of the Linked List", by: "LeetCode", url: "https://leetcode.com/problems/middle-of-the-linked-list/", type: "article" },
    { title: "Happy Number", by: "LeetCode", url: "https://leetcode.com/problems/happy-number/", type: "article" },
    { title: "takeUforward (YouTube): linked list playlist", by: "Striver", url: "https://www.youtube.com/@takeUforward", type: "video" },
    { title: "NeetCode Roadmap (Linked List)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
