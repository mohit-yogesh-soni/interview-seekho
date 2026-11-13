// Greedy
registerLesson("dsa", "greedy", {
  why: "Greedy solutions chhote aur fast hote hain (aksar O(n)), par galat greedy bahut aasani se ban jaata hai. Interviewer dekhta hai ki aap greedy choice ko justify kar sakte ho ya counter-example se pakad sakte ho.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Greedy kya hai?</h2>
        <p>Har step pe <b>abhi ke liye sabse achha</b> choice lo, aur peeche mud ke mat dekho. Na recursion, na saare options try karna.</p>
        <p>Example: ₹ 289 change dena hai, notes 100, 50, 20, 10, 5, 2, 1. Sabse bada note jo fit ho, wo do: 100+100+50+20+10+5+2+2 = 8 notes. Indian currency mein ye hamesha best hai.</p>
        <h2>Par greedy hamesha sahi nahi hota</h2>
        <p>Coins {1, 3, 4} aur amount 6. Greedy: 4 + 1 + 1 = <b>3 coins</b>. Sahi answer: 3 + 3 = <b>2 coins</b>. Yahan DP chahiye (DP 1D lesson mein Coin Change).</p>
        <h2>Greedy kab sahi hota hai?</h2>
        <ul>
          <li><b>Greedy choice property:</b> ek local best choice lene se koi optimal answer nahi kho jaata. Proof ka common tareeka: <b>exchange argument</b> ("agar optimal answer ne alag choice li, to use meri choice se badal do, answer kharab nahi hota").</li>
          <li><b>Optimal substructure:</b> choice ke baad bacha hua problem bhi same type ka hai.</li>
        </ul>
        <h2>Signals</h2>
        <ul>
          <li>"Minimum number of ...", "maximum ... possible", aur constraints n ≤ 10⁵ (O(n²) DP nahi chalega)</li>
          <li>Intervals: sort by end time, phir pick (meeting rooms, activity selection)</li>
          <li>"Kya end tak pahunch sakte ho?" (reach / running max)</li>
          <li>Running sum negative ho jaaye to reset (Kadane, Gas Station)</li>
        </ul>
        <p><b>Practical rule:</b> greedy idea aaye to 2-3 chhote counter-examples try karo. Toot jaaye to DP socho.</p>`
    },
    {
      type: "pick",
      id: "pick-greedy-ok",
      q: "Inme se kahan <b>greedy sahi</b> answer deta hai? (sab select karo)",
      options: [
        { text: "Maximum non-overlapping meetings: jo meeting sabse <b>pehle khatam</b> ho wo lo", correct: true, why: "Jaldi khatam hone wali meeting baaki ke liye sabse zyada time chhodti hai. Exchange argument se proof hota hai." },
        { text: "Coins {1, 3, 4} se minimum coins: sabse bada coin pehle", correct: false, why: "Amount 6 pe greedy 3 coins deta hai, sahi 2 hai (3+3). DP chahiye." },
        { text: "Fractional knapsack (cheezein tod sakte ho): value/weight ratio se sort", correct: true, why: "Tod sakte ho, to best ratio wali cheez pehle bharna hamesha optimal hai." },
        { text: "0/1 knapsack (cheez poori lo ya chhodo): ratio se sort", correct: false, why: "Tod nahi sakte, to ratio greedy fail hota hai. Ye DP (knapsack lesson) hai." },
        { text: "Array mein end tak pahunch sakte ho ya nahi (Jump Game): max reach track karo", correct: true, why: "Har index pe sirf itna jaanna kaafi hai ki ab tak sabse door kahan tak pahunch sakte hain." }
      ],
      answer: "Greedy tab sahi hai jab local best choice future ke options ko kharab na kare. Coins aur 0/1 knapsack mein ek choice baad ke options ko bigaad deti hai, isliye wahan DP lagta hai."
    },
    {
      type: "code",
      title: "Template: 'running best' greedy (ek pass, ek-do variables)",
      code: `public class Main {
    // Jump Game style: kya last index tak pahunch sakte hain?
    static boolean canReach(int[] jumps) {
        int farthest = 0;                       // ab tak sabse door kahan tak ja sakte hain
        for (int i = 0; i < jumps.length; i++) {
            if (i > farthest) return false;     // is index tak pahunch hi nahi sakte
            farthest = Math.max(farthest, i + jumps[i]);
        }
        return true;
    }

    // Activity selection: end time se sort, phir jo fit ho wo lo
    static int maxMeetings(int[][] meetings) {
        java.util.Arrays.sort(meetings, (a, b) -> Integer.compare(a[1], b[1]));
        int count = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] m : meetings) {
            if (m[0] >= lastEnd) { count++; lastEnd = m[1]; }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(canReach(new int[]{2, 3, 1, 1, 4}));   // true
        System.out.println(canReach(new int[]{3, 2, 1, 0, 4}));   // false
        System.out.println(maxMeetings(new int[][]{{9, 10}, {9, 12}, {10, 11}, {11, 13}, {12, 14}})); // 3
    }
}`
    },
    {
      type: "steps",
      title: "Jump Game dry run: [3, 2, 1, 0, 4]",
      steps: [
        { title: "i = 0, farthest = 0 → 0 + 3 = 3", html: `<div class="arr"><span class="cell hl">3</span><span class="cell win">2</span><span class="cell win">1</span><span class="cell win">0</span><span class="cell">4</span></div><div class="arr ptrs"><span class="cell">i</span><span class="cell"></span><span class="cell"></span><span class="cell">far</span><span class="cell"></span></div><p>Index 0 se index 3 tak pahunch sakte hain.</p>` },
        { title: "i = 1 → 1 + 2 = 3 (farthest same)", html: `<div class="arr"><span class="cell ok">3</span><span class="cell hl">2</span><span class="cell win">1</span><span class="cell win">0</span><span class="cell">4</span></div><div class="arr ptrs"><span class="cell"></span><span class="cell">i</span><span class="cell"></span><span class="cell">far</span><span class="cell"></span></div>` },
        { title: "i = 2 → 2 + 1 = 3", html: `<div class="arr"><span class="cell ok">3</span><span class="cell ok">2</span><span class="cell hl">1</span><span class="cell win">0</span><span class="cell">4</span></div><div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell">i</span><span class="cell">far</span><span class="cell"></span></div>` },
        { title: "i = 3 → 3 + 0 = 3. Phas gaye", html: `<div class="arr"><span class="cell ok">3</span><span class="cell ok">2</span><span class="cell ok">1</span><span class="cell bad">0</span><span class="cell">4</span></div><div class="arr ptrs"><span class="cell"></span><span class="cell"></span><span class="cell"></span><span class="cell">i,far</span><span class="cell"></span></div><p>Har raasta index 3 pe hi aa ke rukta hai.</p>` },
        { title: "i = 4 > farthest (3) → false", html: `<div class="arr"><span class="cell ok">3</span><span class="cell ok">2</span><span class="cell ok">1</span><span class="cell bad">0</span><span class="cell bad">4</span></div><p>Index 4 tak koi nahi pahunch sakta. Answer <b>false</b>. Sirf ek pass, O(n).</p>` }
      ]
    },
    {
      type: "think",
      id: "think-jump",
      q: "<b>Jump Game:</b> <code>nums[i]</code> = index i se maximum kitne steps aage jump kar sakte ho. Index 0 se shuru karke last index tak pahunch sakte ho? Brute force kya hoga, aur greedy kyun kaam karta hai?",
      rubric: [
        { point: "Brute: har index se har jump try (recursion/DP), O(n²) ya exponential", keys: ["brute", "recursion", "har jump", "o(n²)", "o(n^2)", "exponential", "dp"] },
        { point: "Greedy: <b>farthest / max reach</b> track karo", keys: ["farthest", "max reach", "maxreach", "reach", "sabse door", "max index"], weight: 2 },
        { point: "Agar <b>i &gt; farthest</b> to false", keys: ["i > far", "i > max", "pahunch nahi", "can't reach", "cannot reach", "bada ho"], weight: 2 },
        { point: "O(n) time, O(1) space", keys: ["o(n)", "o(1)", "linear", "ek pass", "one pass"] }
      ],
      answer: `<p><b>Brute force:</b> index 0 se har possible jump recursion se try karo (memo ke saath O(n²)). <b>Greedy:</b> left se chalo aur <code>farthest = max(farthest, i + nums[i])</code> rakho. Agar kabhi <code>i &gt; farthest</code> ho gaya to i tak pahunchna possible hi nahi, false.</p>
        <p>Kyun sahi hai: agar farthest tak pahunch sakte ho to uske beech ka har index bhi reachable hai (chhota jump bhi le sakte ho). To sirf ek number kaafi hai. Time O(n), space O(1).</p>`
    },
    {
      type: "exercise",
      id: "ex-jump-game",
      title: "Jump Game",
      level: "Medium",
      task: `<p>You start at index 0. <code>nums[i]</code> is the <b>maximum</b> number of steps you may jump forward from index i (you may also jump fewer). Return <code>true</code> if you can reach the last index.</p><h4>Constraints</h4><ul><li>1 ≤ nums.length ≤ 10⁵</li><li>0 ≤ nums[i] ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/jump-game/" target="_blank">LeetCode 55</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step to index 1, then 3 steps to the last index.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  nums = [3,2,1,0,4]
Output: false
Explanation: Every route lands on index 3, whose jump length is 0.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    boolean canJump(int[] nums) {
        return false;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,3,1,1,4]", true, () -> s.canJump(new int[]{2, 3, 1, 1, 4}));
        Check.eq("[3,2,1,0,4]", false, () -> s.canJump(new int[]{3, 2, 1, 0, 4}));
        Check.hiddenFromHere();
        Check.eq("single [0] (pehle se last pe)", true, () -> s.canJump(new int[]{0}));
        Check.eq("[0,1]", false, () -> s.canJump(new int[]{0, 1}));
        Check.eq("[2,0,0]", true, () -> s.canJump(new int[]{2, 0, 0}));
        Check.eq("[1,0,1]", false, () -> s.canJump(new int[]{1, 0, 1}));
        int n = 100000;
        int[] ones = new int[n];
        java.util.Arrays.fill(ones, 1);
        Check.eq("bada: 100000 ones", true, () -> s.canJump(ones));
        int[] wall = new int[n];
        for (int i = 0; i < n; i++) wall[i] = Math.max(0, 50000 - i);
        wall[0] = 50000;
        Check.eq("bada: decreasing jumps, index 50000 pe 0", false, () -> s.canJump(wall));
    }
}`,
      hints: [
        "Har index pe ek hi sawaal: ab tak sabse door kahan tak pahunch sakte hain?",
        "<code>farthest = Math.max(farthest, i + nums[i])</code>",
        "Loop mein pehle check: <code>if (i &gt; farthest) return false;</code>. Loop poora ho gaya to true."
      ],
      solution: `class Solution {
    boolean canJump(int[] nums) {
        int farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) return false;
            farthest = Math.max(farthest, i + nums[i]);
            if (farthest >= nums.length - 1) return true;
        }
        return true;
    }
}`,
      explain: "<p><b>Approach:</b> farthest reachable index track karo. Reachable indices hamesha ek continuous range [0, farthest] hote hain, isliye ek variable kaafi hai.</p><p><b>Time:</b> O(n). <b>Space:</b> O(1). DP (har index reachable hai ya nahi, har jump try) O(n²) hota.</p>"
    },
    {
      type: "think",
      id: "think-gas",
      q: "<b>Gas Station:</b> circle pe n petrol pumps hain. Pump i pe <code>gas[i]</code> milta hai, aur i se i+1 tak jaane mein <code>cost[i]</code> lagta hai. Khaali tank se kis pump se shuru karein ki poora chakkar lag jaaye? (Answer unique hai, ya -1.) O(n) mein kaise?",
      rubric: [
        { point: "Agar <b>total gas &lt; total cost</b> to -1", keys: ["total", "sum", "kul", "poora sum"], weight: 2 },
        { point: "Running tank negative ho jaaye to <b>start = i + 1</b> aur tank reset", keys: ["reset", "i + 1", "i+1", "negative", "start badlo", "naya start"], weight: 2 },
        { point: "Kyun: beech ka koi bhi start bhi fail karega (usse pehle wala hissa non-negative tha)", keys: ["beech", "between", "skip", "koi bhi", "fail karega", "exchange"] },
        { point: "O(n) time, O(1) space; brute O(n²)", keys: ["o(n)", "o(1)", "one pass", "ek pass", "o(n²)", "o(n^2)"] }
      ],
      answer: `<p><b>Brute:</b> har start se simulate karo, O(n²). <b>Greedy:</b> pehle check: <code>sum(gas) &lt; sum(cost)</code> to -1. Warna ek pass: <code>tank += gas[i] - cost[i]</code>; agar tank &lt; 0 ho gaya to start se i tak koi bhi pump start nahi ho sakta, to <code>start = i + 1, tank = 0</code>.</p>
        <p>Kyun beech ke pumps skip kar sakte hain: start se j tak tank ≥ 0 tha, matlab j se shuru karne pe tank aur kam hota (wo positive hissa nahi milta). Agar total ≥ 0 hai to aakhri start se chakkar pakka poora hota hai. O(n) time, O(1) space.</p>`
    },
    {
      type: "exercise",
      id: "ex-gas-station",
      title: "Gas Station",
      level: "Medium",
      task: `<p>There are n gas stations on a circular road. Station i gives you <code>gas[i]</code> fuel, and driving from station i to station i + 1 (the last one goes to station 0) costs <code>cost[i]</code>. Your tank starts empty and has no capacity limit.</p><p>Return the index of the station from which you can drive around the whole circle once clockwise, or <code>-1</code> if no such station exists. If an answer exists it is unique.</p><h4>Constraints</h4><ul><li>1 ≤ n ≤ 10⁵</li><li>0 ≤ gas[i], cost[i] ≤ 10⁴</li></ul><p><a href="https://leetcode.com/problems/gas-station/" target="_blank">LeetCode 134</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  gas = [1,2,3,4,5], cost = [3,4,5,1,2]
Output: 3
Explanation: From 3: tank 4−1=3, +5−2=6, +1−3=4, +2−4=2, +3−5=0. Back at 3.</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  gas = [2,3,4], cost = [3,4,3]
Output: -1
Explanation: Total gas 9 is less than total cost 10.</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int canCompleteCircuit(int[] gas, int[] cost) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("gas=[1,2,3,4,5], cost=[3,4,5,1,2]", 3, () -> s.canCompleteCircuit(new int[]{1, 2, 3, 4, 5}, new int[]{3, 4, 5, 1, 2}));
        Check.eq("gas=[2,3,4], cost=[3,4,3]", -1, () -> s.canCompleteCircuit(new int[]{2, 3, 4}, new int[]{3, 4, 3}));
        Check.hiddenFromHere();
        Check.eq("single pump, kaafi gas", 0, () -> s.canCompleteCircuit(new int[]{5}, new int[]{4}));
        Check.eq("single pump, kam gas", -1, () -> s.canCompleteCircuit(new int[]{4}, new int[]{5}));
        Check.eq("start 0 pe hi", 0, () -> s.canCompleteCircuit(new int[]{3, 1, 1}, new int[]{1, 2, 2}));
        Check.eq("aakhri pump se start", 4, () -> s.canCompleteCircuit(new int[]{1, 1, 1, 1, 6}, new int[]{2, 2, 2, 2, 1}));
        int n = 100000, h = 50000;
        int[] gas = new int[n], cost = new int[n];
        for (int i = 0; i < n; i++) { gas[i] = 1; cost[i] = 1; }
        for (int i = 0; i < h - 1; i++) gas[i] = 2;     // +1 each
        cost[h - 1] = h + 1;                            // -h
        gas[h] = 2;                                     // +1
        Check.eq("bada input: n=100000 (brute O(n^2) slow hoga)", h, () -> s.canCompleteCircuit(gas, cost));
    }
}`,
      hints: [
        "Pehle total check karo: <code>sum(gas) - sum(cost) &lt; 0</code> to -1.",
        "Ek pass mein <code>tank += gas[i] - cost[i]</code>. Tank negative hua to start yahan se aage hi ho sakta hai.",
        "<code>if (tank &lt; 0) { start = i + 1; tank = 0; }</code>"
      ],
      solution: `class Solution {
    int canCompleteCircuit(int[] gas, int[] cost) {
        long total = 0, tank = 0;
        int start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return total < 0 ? -1 : start;
    }
}`,
      explain: "<p><b>Approach:</b> total negative → -1. Warna running tank negative hone pe start ko aage khiskao. Jo start bachta hai wahi answer.</p><p><b>Time:</b> O(n). <b>Space:</b> O(1). Brute (har start se simulate) O(n²) hai, bade test pe slow.</p>"
    },
    {
      type: "think",
      id: "think-tasks",
      q: "<b>Task Scheduler:</b> CPU tasks (A-Z letters) chalane hain. Same task ke do runs ke beech kam se kam <code>n</code> slots ka gap chahiye (gap mein doosra task ya idle). Minimum total slots kitne? Formula socho, sirf counts se.",
      rubric: [
        { point: "Sabse <b>frequent task</b> (maxFreq) structure decide karta hai", keys: ["max freq", "maxfreq", "most frequent", "sabse zyada", "frequency", "count"], weight: 2 },
        { point: "Frame: <b>(maxFreq - 1) × (n + 1)</b> + jitne tasks ki freq = maxFreq", keys: ["(maxfreq - 1)", "maxfreq-1", "n + 1", "n+1", "(n+1)", "frame", "chunk"], weight: 2 },
        { point: "Answer = <b>max(formula, total tasks)</b>", keys: ["max(", "tasks.length", "total task", "length", "zyada wala"], weight: 2 },
        { point: "O(N) time, 26 size count array", keys: ["o(n)", "26", "count array", "o(1) space"] }
      ],
      answer: `<p>Sabse frequent task A ko maxFreq baar chalana hai. Uske beech (maxFreq - 1) gaps hain, har gap kam se kam n slots ka. To frame = <code>(maxFreq - 1) × (n + 1)</code>, aur end mein un sab tasks ka ek ek slot jinki freq = maxFreq (<code>countMax</code>).</p>
        <p>Agar tasks itne zyada hain ki gaps bhar ke bhi bach jaayein, to idle hota hi nahi, answer = total tasks. Isliye <code>answer = max(tasks.length, (maxFreq - 1) × (n + 1) + countMax)</code>. O(N) time, O(26) space. Heap + cooldown queue se simulate bhi kar sakte ho, par formula interview mein jaldi likha jaata hai (aur simulation se verify karke dikhao).</p>`
    },
    {
      type: "exercise",
      id: "ex-task-scheduler",
      title: "Task Scheduler",
      level: "Medium",
      task: `<p><code>tasks</code> contains uppercase letters; each letter is a task that takes one time slot. Two runs of the same letter must be separated by at least <code>n</code> slots (filled with other tasks or idle). Tasks can run in any order.</p><p>Return the minimum number of slots needed to finish all tasks.</p><h4>Constraints</h4><ul><li>1 ≤ tasks.length ≤ 10⁵</li><li>tasks[i] is 'A' to 'Z'</li><li>0 ≤ n ≤ 100</li></ul><p><a href="https://leetcode.com/problems/task-scheduler/" target="_blank">LeetCode 621</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  tasks = ["A","A","A","B","B","B"], n = 2
Output: 8
Explanation: A B idle A B idle A B</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  same tasks, n = 0
Output: 6</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n = 2
Output: 16
Explanation: A B C A D E A F G A idle idle A idle idle A</pre></div>`,
      userFile: "Solution.java",
      starter: `class Solution {
    int leastInterval(char[] tasks, int n) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("AAABBB, n=2", 8, () -> s.leastInterval("AAABBB".toCharArray(), 2));
        Check.eq("AAABBB, n=0", 6, () -> s.leastInterval("AAABBB".toCharArray(), 0));
        Check.eq("AAAAAABCDEFG, n=2", 16, () -> s.leastInterval("AAAAAABCDEFG".toCharArray(), 2));
        Check.hiddenFromHere();
        Check.eq("single task, bada n", 1, () -> s.leastInterval("A".toCharArray(), 5));
        Check.eq("sab alag, n=3", 4, () -> s.leastInterval("ABCD".toCharArray(), 3));
        Check.eq("bahut variety: idle nahi chahiye", 12, () -> s.leastInterval("AAABBBCCCDDE".toCharArray(), 2));
        Check.eq("AAB, n=3", 5, () -> s.leastInterval("AAB".toCharArray(), 3));
        char[] big = new char[100000];
        java.util.Arrays.fill(big, 'A');
        Check.eq("bada: 100000 A, n=1", 199999, () -> s.leastInterval(big, 1));
    }
}`,
      hints: [
        "Pehle har letter ka count nikaalo (<code>int[26]</code>). maxFreq aur kitne letters ki freq = maxFreq (countMax).",
        "Sabse frequent task ke beech (maxFreq - 1) gaps hain, har ek (n + 1) slots ka frame.",
        "<code>return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + countMax);</code>"
      ],
      solution: `class Solution {
    int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char c : tasks) freq[c - 'A']++;
        int maxFreq = 0, countMax = 0;
        for (int f : freq) {
            if (f > maxFreq) { maxFreq = f; countMax = 1; }
            else if (f == maxFreq) countMax++;
        }
        int frame = (maxFreq - 1) * (n + 1) + countMax;
        return Math.max(tasks.length, frame);
    }
}`,
      explain: "<p><b>Approach:</b> sabse frequent task ka frame banao: <code>(maxFreq - 1) × (n + 1) + countMax</code>. Baaki tasks gaps mein fit hote hain; agar zyada hain to idle zero hai aur answer total tasks.</p><p><b>Time:</b> O(N). <b>Space:</b> O(1) (26 counts).</p>"
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> greedy idea ko bina test kiye code karna. Interview mein bolo: \"Greedy lag raha hai, ek chhota counter-example try karta hoon\". Coins {1, 3, 4} jaisa ek case pakad liya to turant DP pe jao. Ye bhi achha signal hai."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Greedy answer ke saath ek line ka <b>justification</b> do: \"jaldi khatam hone wali meeting lene se baaki ke liye zyada time bachta hai\" ya \"tank negative hua to beech ka koi bhi start kaam nahi karega\". Bina proof wala greedy interviewer ko guess lagta hai."
    }
  ],
  references: [
    { title: "Jump Game", by: "LeetCode", url: "https://leetcode.com/problems/jump-game/", type: "article" },
    { title: "Gas Station", by: "LeetCode", url: "https://leetcode.com/problems/gas-station/", type: "article" },
    { title: "Task Scheduler", by: "LeetCode", url: "https://leetcode.com/problems/task-scheduler/", type: "article" },
    { title: "Striver A2Z DSA sheet (Greedy section)", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "NeetCode roadmap", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
