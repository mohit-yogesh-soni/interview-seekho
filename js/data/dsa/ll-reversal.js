// Linked List In-place Reversal
registerLesson("dsa", "ll-reversal", {
  why: "\"Reverse a linked list\" sabse zyada poochha jaane wala linked list sawaal hai, aur uske variations (beech ka hissa reverse, reorder, k-group) mein pointer galat lagte hi list toot jaati hai. prev/curr/next template pakka ho to ye sab 10 minute ke sawaal hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>Linked list ka poora ya <b>kuch hissa ulta</b> karna hai, <b>extra space ke bina</b> (O(1)).</li>
          <li>List ko aage-peeche se mila ke chalna hai (palindrome check, reorder): aadha reverse karke dono halves saath chalao.</li>
          <li>"End se n-th node" jaisa kuch: do pointers ke beech fixed gap.</li>
        </ul>
        <h2>Brute force vs in-place</h2>
        <p>Brute force: values ko ArrayList/stack mein daalo, ulta karke wapas likho. O(n) time, <b>O(n) space</b>. In-place: sirf <code>next</code> pointers ki disha badlo. O(n) time, <b>O(1) space</b>. Interviewer lagbhag hamesha in-place maangta hai.</p>
        <h2>Template: prev / curr / next</h2>
        <pre class="code-static">ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next;   // 1. aage ka raasta bachao
    curr.next = prev;            // 2. pointer ulta karo
    prev = curr;                 // 3. prev aage
    curr = next;                 // 4. curr aage
}
return prev;                     // naya head</pre>
        <p><b>Dummy node</b> trick: jab head khud badal sakta hai (pehla node hat sakta hai ya reverse ho sakta hai), to <code>dummy.next = head</code> se shuru karo aur end mein <code>dummy.next</code> return karo. Isse "head ka special case" khatam ho jaata hai.</p>`
    },
    {
      type: "steps",
      title: "Reverse dry run: 1 → 2 → 3 → null",
      steps: [
        { title: "Shuru", html: `<div class="arr"><span class="cell dim">null</span><span class="cell hl">1</span><span class="cell">2</span><span class="cell">3</span></div>
          <div class="arr ptrs"><span class="cell">prev</span><span class="cell">curr</span><span class="cell"></span><span class="cell"></span></div><p>prev = null, curr = 1.</p>` },
        { title: "Step 1: 1 ulta", html: `<div class="arr"><span class="cell ok">1→null</span><span class="cell hl">2</span><span class="cell">3</span><span class="cell dim"></span></div>
          <div class="arr ptrs"><span class="cell">prev</span><span class="cell">curr</span><span class="cell"></span><span class="cell"></span></div><p>next = 2 bachaya. 1.next = null. prev = 1, curr = 2.</p>` },
        { title: "Step 2: 2 ulta", html: `<div class="arr"><span class="cell ok">1→null</span><span class="cell ok">2→1</span><span class="cell hl">3</span><span class="cell dim"></span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell">prev</span><span class="cell">curr</span><span class="cell"></span></div><p>next = 3. 2.next = 1. prev = 2, curr = 3.</p>` },
        { title: "Step 3: 3 ulta", html: `<div class="arr"><span class="cell ok">1→null</span><span class="cell ok">2→1</span><span class="cell ok">3→2</span><span class="cell dim">null</span></div>
          <div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">prev</span><span class="cell">curr</span></div><p>curr = null, loop khatam. <b>prev (3) naya head: 3 → 2 → 1 → null.</b></p>` }
      ]
    },
    {
      type: "code",
      title: "Template chala ke dekho (iterative reverse + dummy node)",
      code: `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode reverse(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }

    static void print(ListNode h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? " -> " : "");
        System.out.println(sb);
    }

    public static void main(String[] args) {
        ListNode dummy = new ListNode(0), t = dummy;
        for (int v = 1; v <= 5; v++) { t.next = new ListNode(v); t = t.next; }
        ListNode head = dummy.next;
        print(head);
        head = reverse(head);
        print(head);
    }
}`
    },
    {
      type: "think",
      id: "think-reverse2",
      q: "<b>Reverse Linked List II:</b> positions <code>left</code> se <code>right</code> (1-indexed) tak ka hissa reverse karna hai, ek pass mein. Kaunse nodes ka reference pehle se pakad ke rakhoge? left = 1 ho to kya?",
      rubric: [
        { point: "<b>Dummy node</b> taaki left = 1 (head badalna) special case na rahe", keys: ["dummy", "sentinel", "left = 1", "left=1", "head badal"], weight: 2 },
        { point: "<b>before</b> node (position left-1) tak chalo", keys: ["before", "left - 1", "left-1", "pehle wala", "prev node", "connection"], weight: 2 },
        { point: "Beech ke (right - left + 1) nodes reverse karo (prev/curr)", keys: ["right - left", "reverse", "prev", "curr"] },
        { point: "Wapas jodo: before.next = naya head, purana first (ab tail) .next = right ke baad wala", keys: ["jodo", "reconnect", "connect", "tail.next", "after", "baad wala"], weight: 2 },
        { point: "Time O(n), space O(1)", keys: ["o(n)", "o(1)", "one pass", "ek pass"] }
      ],
      answer: `<p><code>dummy.next = head</code>. <code>before</code> ko <code>left - 1</code> steps chalao (dummy se). <code>first = before.next</code> (ye reverse ke baad tail banega).</p>
        <p>Ab <code>right - left + 1</code> nodes ko prev/curr se reverse karo. Loop ke baad <code>prev</code> = naya beech ka head, <code>curr</code> = right ke baad wala node. Jodo: <code>before.next = prev</code>, <code>first.next = curr</code>. Return <code>dummy.next</code>.</p>
        <p>Dummy ki wajah se <code>left = 1</code> pe <code>before = dummy</code> hota hai aur koi alag code nahi. <b>Time O(n), space O(1).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-reverse2",
      title: "Reverse Linked List II",
      level: "Medium",
      task: `<p>Reverse the nodes of the list from position <code>left</code> to position <code>right</code> (1-indexed, both inclusive) and return the head. The rest of the list keeps its order. Re-link the nodes; do not just copy values.</p><p class="small muted">left = 2, right = 4</p><pre class="diagram">before: 1 → [2 → 3 → 4] → 5
after:  1 → [4 → 3 → 2] → 5</pre><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ 10⁵</li><li>1 ≤ left ≤ right ≤ number of nodes</li></ul><p><a href="https://leetcode.com/problems/reverse-linked-list-ii/" target="_blank">LeetCode 92</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  head = [1,2,3,4,5], left = 2, right = 4
Output: [1,4,3,2,5]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  head = [5], left = 1, right = 1
Output: [5]</pre></div>`,
      userFile: "Solution.java",
      starter: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode reverseBetween(ListNode head, int left, int right) {
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
        Check.eq("[1,2,3,4,5], 2..4", List.of(1, 4, 3, 2, 5), () -> toList(s.reverseBetween(build(new int[]{1, 2, 3, 4, 5}), 2, 4)));
        Check.eq("[5], 1..1", List.of(5), () -> toList(s.reverseBetween(build(new int[]{5}), 1, 1)));
        Check.hiddenFromHere();
        Check.eq("head badla: [3,5], 1..2", List.of(5, 3), () -> toList(s.reverseBetween(build(new int[]{3, 5}), 1, 2)));
        Check.eq("poori list [1,2,3], 1..3", List.of(3, 2, 1), () -> toList(s.reverseBetween(build(new int[]{1, 2, 3}), 1, 3)));
        Check.eq("end tak [1,2,3,4], 3..4", List.of(1, 2, 4, 3), () -> toList(s.reverseBetween(build(new int[]{1, 2, 3, 4}), 3, 4)));
        Check.eq("left == right [1,2,3], 2..2", List.of(1, 2, 3), () -> toList(s.reverseBetween(build(new int[]{1, 2, 3}), 2, 2)));
        int n = 100000;
        int[] vals = new int[n];
        List<Integer> expected = new ArrayList<>();
        for (int i = 0; i < n; i++) vals[i] = i;
        for (int i = 0; i < n; i++) expected.add(i == 0 ? 0 : (i == n - 1 ? n - 1 : n - 1 - i));
        Check.eq("bada: n=1e5, 2..n-1", expected, () -> toList(s.reverseBetween(build(vals), 2, n - 1)));
    }
}`,
      hints: [
        "<code>ListNode dummy = new ListNode(0); dummy.next = head;</code> phir <code>before</code> ko dummy se <code>left - 1</code> steps aage le jao.",
        "<code>ListNode first = before.next, prev = null, curr = first;</code> aur <code>right - left + 1</code> baar prev/curr/next wala reverse.",
        "Jodo: <code>before.next = prev; first.next = curr; return dummy.next;</code>"
      ],
      solution: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode before = dummy;
        for (int i = 1; i < left; i++) before = before.next;   // position left-1

        ListNode first = before.next;     // reverse ke baad ye tail banega
        ListNode prev = null, curr = first;
        for (int i = 0; i <= right - left; i++) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        before.next = prev;               // naya beech ka head
        first.next = curr;                // right ke baad wala hissa
        return dummy.next;
    }
}`,
      explain: `<p><b>Approach:</b> dummy, <code>before</code> tak chalo, beech ke nodes reverse, phir dono sire jodo.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>
        <p>Recursive reverse bhi chalta hai, par 10⁵ nodes pe recursion depth 10⁵ ho jaati hai aur Java stack overflow kar sakta hai. Iterative safe hai.</p>`
    },
    {
      type: "think",
      id: "think-reorder",
      q: "<b>Reorder List:</b> L0 → L1 → … → Ln ko L0 → Ln → L1 → Ln-1 → L2 → … banana hai, in-place. Teen chhote steps mein todo.",
      rubric: [
        { point: "Step 1: <b>middle</b> dhoondho (fast/slow)", keys: ["middle", "mid", "fast", "slow", "beech"], weight: 2 },
        { point: "Step 2: <b>second half reverse</b> karo", keys: ["reverse", "second half", "doosra half", "ulta"], weight: 2 },
        { point: "Step 3: dono halves ko <b>ek-ek karke merge</b> (alternate)", keys: ["merge", "alternate", "weave", "ek ek", "interleave", "zip"], weight: 2 },
        { point: "First half ko middle pe <b>tod</b>o (mid.next = null), warna cycle", keys: ["null", "tod", "cut", "split", "break", "cycle"] },
        { point: "Time O(n), space O(1)", keys: ["o(n)", "o(1)"] }
      ],
      answer: `<ol><li><b>Middle:</b> slow/fast se. (Pehla middle lo: <code>while (fast.next != null &amp;&amp; fast.next.next != null)</code>.)</li>
        <li><b>Split + reverse:</b> <code>second = slow.next; slow.next = null;</code> phir <code>second</code> ko reverse karo.</li>
        <li><b>Merge:</b> <code>first</code> aur <code>second</code> se baari baari ek node lo: <code>f.next = s; s.next = fNext;</code>.</li></ol>
        <p><code>slow.next = null</code> bhoolne pe list mein cycle ban jaati hai. <b>Time O(n), space O(1).</b> (ArrayList mein nodes daal ke do pointers se bhi ho jaata hai, par O(n) space.)</p>`
    },
    {
      type: "exercise",
      id: "ex-reorder",
      title: "Reorder List",
      level: "Medium",
      task: `<p>Reorder the list <code>L0 → L1 → … → Ln-1 → Ln</code> <b>in place</b> into <code>L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …</code>. Do not change node values; only re-link nodes. The method returns nothing.</p><p class="small muted">Idea: split in the middle, reverse the second half, then weave</p><pre class="diagram">1 → 2 → 3 → 4 → 5
first: 1 → 2 → 3     second (reversed): 5 → 4
weave: 1 → 5 → 2 → 4 → 3</pre><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ about 10⁵</li></ul><p><a href="https://leetcode.com/problems/reorder-list/" target="_blank">LeetCode 143</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  head = [1,2,3,4]
Output: [1,4,2,3]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  head = [1,2,3,4,5]
Output: [1,5,2,4,3]</pre></div>`,
      userFile: "Solution.java",
      starter: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    void reorderList(ListNode head) {
        // yahan likho
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

    static List<Integer> run(Solution s, int[] vals) {
        ListNode h = build(vals);
        s.reorderList(h);
        return toList(h);
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4]", List.of(1, 4, 2, 3), () -> run(s, new int[]{1, 2, 3, 4}));
        Check.eq("[1,2,3,4,5]", List.of(1, 5, 2, 4, 3), () -> run(s, new int[]{1, 2, 3, 4, 5}));
        Check.hiddenFromHere();
        Check.eq("single [1]", List.of(1), () -> run(s, new int[]{1}));
        Check.eq("do [1,2]", List.of(1, 2), () -> run(s, new int[]{1, 2}));
        Check.eq("teen [1,2,3]", List.of(1, 3, 2), () -> run(s, new int[]{1, 2, 3}));
        Check.eq("duplicates [7,7,8,8]", List.of(7, 8, 7, 8), () -> run(s, new int[]{7, 7, 8, 8}));
        int n = 100001;
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) vals[i] = i;
        List<Integer> expected = new ArrayList<>();
        for (int i = 0, j = n - 1; i <= j; i++, j--) { expected.add(i); if (i != j) expected.add(j); }
        Check.eq("bada: n=100001 (O(n^2) slow)", expected, () -> run(s, vals));
    }
}`,
      hints: [
        "Teen helper steps: middle dhoondho, second half reverse, dono ko merge.",
        "Middle: <code>slow = head, fast = head; while (fast.next != null &amp;&amp; fast.next.next != null)</code>. Phir <code>second = slow.next; slow.next = null;</code>",
        "Merge: <code>while (second != null) { ListNode a = first.next, b = second.next; first.next = second; second.next = a; first = a; second = b; }</code>"
      ],
      solution: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    void reorderList(ListNode head) {
        if (head == null || head.next == null) return;
        // 1. middle (pehla middle)
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        // 2. split aur second half reverse
        ListNode second = reverse(slow.next);
        slow.next = null;
        // 3. merge baari baari
        ListNode first = head;
        while (second != null) {
            ListNode a = first.next, b = second.next;
            first.next = second;
            second.next = a;
            first = a;
            second = b;
        }
    }

    private ListNode reverse(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
      explain: `<p><b>Approach:</b> middle → second half reverse → alternate merge. Teeno O(n), O(1) space.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(1).</p>
        <p>Ye problem teen chhote patterns ka combo hai. Interview mein bolo "main isse 3 helper functions mein todunga", interviewer ko structured soch dikhti hai.</p>`
    },
    {
      type: "think",
      id: "think-remove-nth",
      q: "<b>Remove Nth Node From End:</b> end se n-th node hatana hai, <b>ek pass</b> mein. Length gine bina kaise pata chalega kaunsa node hatana hai? Head hi hatana ho to?",
      rubric: [
        { point: "Do pointers, <b>fast ko n steps aage</b> bhejo", keys: ["n step", "n steps", "aage", "ahead", "gap", "fast"], weight: 2 },
        { point: "Phir dono saath chalo; fast end pe to slow <b>hatane wale se pehle</b>", keys: ["saath", "together", "pehle wala", "before", "previous", "slow.next"], weight: 2 },
        { point: "<b>Dummy node</b> se head hatane ka case", keys: ["dummy", "sentinel", "head hat"], weight: 2 },
        { point: "slow.next = slow.next.next", keys: ["slow.next = slow.next.next", "next.next", "skip"] },
        { point: "Time O(L), space O(1)", keys: ["o(n)", "o(l)", "o(1)", "one pass", "ek pass"] }
      ],
      answer: `<p><code>dummy.next = head</code>; <code>fast = slow = dummy</code>. fast ko <b>n + 1</b> steps aage bhejo. Ab dono saath chalao jab tak <code>fast != null</code>. Ab slow aur fast ke beech exactly n nodes hain, to <code>slow.next</code> hi end se n-th node hai: <code>slow.next = slow.next.next</code>.</p>
        <p>Dummy ki wajah se agar head hatana ho (n = length), to slow dummy pe rukta hai aur <code>dummy.next</code> naya head ban jaata hai. <b>Time O(L), space O(1).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-remove-nth",
      title: "Remove Nth Node From End of List",
      level: "Medium",
      task: `<p>Remove the <b>n-th node from the end</b> of the list and return the head. Try to do it in one pass (two pointers n apart).</p><h4>Constraints</h4><ul><li>1 ≤ number of nodes ≤ 10⁵</li><li>1 ≤ n ≤ number of nodes</li></ul><p><a href="https://leetcode.com/problems/remove-nth-node-from-end-of-list/" target="_blank">LeetCode 19</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
Explanation: The 2nd node from the end is 4.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  head = [1], n = 1
Output: []</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  head = [1,2], n = 1
Output: [1]</pre></div>`,
      userFile: "Solution.java",
      starter: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode removeNthFromEnd(ListNode head, int n) {
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
        Check.eq("[1,2,3,4,5], n=2", List.of(1, 2, 3, 5), () -> toList(s.removeNthFromEnd(build(new int[]{1, 2, 3, 4, 5}), 2)));
        Check.eq("[1], n=1", List.of(), () -> toList(s.removeNthFromEnd(build(new int[]{1}), 1)));
        Check.eq("[1,2], n=1", List.of(1), () -> toList(s.removeNthFromEnd(build(new int[]{1, 2}), 1)));
        Check.hiddenFromHere();
        Check.eq("head hatao [1,2], n=2", List.of(2), () -> toList(s.removeNthFromEnd(build(new int[]{1, 2}), 2)));
        Check.eq("head hatao [1,2,3], n=3", List.of(2, 3), () -> toList(s.removeNthFromEnd(build(new int[]{1, 2, 3}), 3)));
        Check.eq("beech [10,20,30,40], n=3", List.of(10, 30, 40), () -> toList(s.removeNthFromEnd(build(new int[]{10, 20, 30, 40}), 3)));
        int len = 100000;
        int[] vals = new int[len];
        for (int i = 0; i < len; i++) vals[i] = i;
        Check.eq("bada: n=1e5, head hatao: size", len - 1, () -> toList(s.removeNthFromEnd(build(vals), len)).size());
        Check.eq("bada: n=1e5, n=50000: us position pe kaun", 50001, () -> toList(s.removeNthFromEnd(build(vals), 50000)).get(50000));
    }
}`,
      hints: [
        "Dummy node lagao taaki head hatane ka case alag na ho.",
        "<code>fast</code> ko dummy se <code>n + 1</code> steps aage bhejo, <code>slow</code> dummy pe.",
        "<code>while (fast != null) { fast = fast.next; slow = slow.next; } slow.next = slow.next.next; return dummy.next;</code>"
      ],
      solution: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

class Solution {
    ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode fast = dummy, slow = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;   // n+1 aage: gap n
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next;                      // n-th from end hatao
        return dummy.next;
    }
}`,
      explain: `<p><b>Approach:</b> fast ko n+1 aage, phir saath chalao; slow hatane wale node se theek pehle rukta hai. Dummy se head ka case free.</p>
        <p><b>Time:</b> O(L). <b>Space:</b> O(1).</p>
        <p>Two-pass alternative: pehle length L gino, phir <code>L - n</code> steps chal ke hatao. Bhi O(L), interview mein pehle ye bolo, phir one-pass pe jao.</p>`
    },
    {
      type: "quiz",
      q: "Reverse loop mein ye galti hai: <code>while (curr != null) { curr.next = prev; prev = curr; curr = curr.next; }</code>. <code>1 → 2 → 3</code> pe kya hoga?",
      options: [
        "Sahi reverse: 3 → 2 → 1",
        "Loop ek step ke baad ruk jaata hai, answer sirf <code>1</code> (baaki list kho gayi)",
        "Infinite loop",
        "NullPointerException"
      ],
      answer: 1,
      why: "<code>curr.next = prev</code> (null) ke baad <code>curr = curr.next</code> null ho jaata hai, kyunki next pehle bachaya hi nahi. Loop ruk jaata hai, prev = 1, aur 2 → 3 ka reference kho gaya. Isliye pehla step hamesha <code>next = curr.next</code>."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Template: next bachao → curr.next = prev → prev = curr → curr = next.</li><li>Head badal sakta hai to dummy node.</li><li>Reverse II: before tak chalo, beech ka reverse, dono sire jodo.</li><li>Reorder: middle + second half reverse + alternate merge (aur slow.next = null).</li><li>Remove Nth from end: fast ko n+1 aage, phir saath chalo.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Linked list code likhte waqt chhota diagram banao (boxes aur arrows) aur har pointer assignment ke baad usko update karo. Aur bolo <i>\"main dummy node use kar raha hoon taaki head ka edge case na rahe\"</i>. Code ke baad 1 node, 2 nodes aur head-change wale case pe dry run zaroor karo: wahin bugs hote hain."
    }
  ],
  references: [
    { title: "Reverse Linked List II", by: "LeetCode", url: "https://leetcode.com/problems/reverse-linked-list-ii/", type: "article" },
    { title: "Reorder List", by: "LeetCode", url: "https://leetcode.com/problems/reorder-list/", type: "article" },
    { title: "Remove Nth Node From End of List", by: "LeetCode", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", type: "article" },
    { title: "Reverse Linked List", by: "LeetCode", url: "https://leetcode.com/problems/reverse-linked-list/", type: "article" },
    { title: "Strivers A2Z DSA Sheet (linked list)", by: "Striver (takeUforward)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" }
  ]
});
