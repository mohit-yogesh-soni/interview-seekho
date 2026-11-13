// Intervals (Merge)
registerLesson("dsa", "intervals", {
  why: "Calendar, booking, meeting rooms, delivery slots: real systems mein intervals har jagah hain, isliye interviewers ko pasand hain. Ek hi trick (start se sort, phir ek pass) se zyaadatar interval problems hal ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pattern kab lagta hai (signals)</h2>
        <ul>
          <li>Input <code>[start, end]</code> pairs hain: meetings, bookings, time slots, ranges.</li>
          <li>Sawaal: overlap merge karo, naya interval daalo, kitne ek saath chal rahe hain (rooms), kitne hatao ki overlap na ho.</li>
        </ul>
        <h2>Do intervals kab overlap karte hain?</h2>
        <pre class="diagram">
a: [----------]                 a.start &lt;= b.end  AND  b.start &lt;= a.end
b:        [----------]          → overlap

a: [-----]                      a.end &lt; b.start
b:           [-----]            → overlap nahi
        </pre>
        <p>Agar list <b>start se sorted</b> hai, to sirf ek check kaafi hai: <code>next.start &lt;= current.end</code> to merge, warna naya group.</p>
        <h2>Brute force vs sort</h2>
        <p>Brute force: har pair compare karke baar baar merge karo, O(n²) ya usse bura. <b>Sort by start</b> (O(n log n)) ke baad overlapping intervals hamesha <b>saath saath</b> aate hain, to ek pass (O(n)) kaafi hai. Total <b>O(n log n)</b>.</p>
        <p>Example: Google Calendar mein aapke busy slots: 10-11, 10:30-12, 2-3. Merge karke "busy: 10-12, 2-3" dikhana hai taaki free slot dhoondh sako.</p>
        <p><b>Clarify karo:</b> kya <code>[1,4]</code> aur <code>[4,5]</code> overlap hain? Merge Intervals mein haan (touching = merge). Meeting rooms mein nahi (ek meeting 4 baje khatam, doosri 4 baje shuru, same room chalega).</p>`
    },
    {
      type: "code",
      title: "Template: sort by start, phir merge karte jao",
      code: `import java.util.*;

public class Main {
    static List<int[]> merge(int[][] intervals) {
        int[][] a = intervals.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));   // start se sort
        List<int[]> out = new ArrayList<>();
        for (int[] cur : a) {
            if (out.isEmpty() || out.get(out.size() - 1)[1] < cur[0]) {
                out.add(new int[]{cur[0], cur[1]});              // naya group
            } else {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], cur[1]);             // extend
            }
        }
        return out;
    }

    public static void main(String[] args) {
        int[][] busy = {{14, 15}, {10, 11}, {10, 12}, {11, 12}};
        for (int[] x : merge(busy)) System.out.print(Arrays.toString(x) + " ");
        System.out.println();
    }
}`,
      note: "Comparator mein <code>x[0] - y[0]</code> mat likho: bade negative/positive numbers pe int overflow hoke galat order de sakta hai. <code>Integer.compare</code> safe hai."
    },
    {
      type: "steps",
      title: "Merge dry run: [[1,3],[2,6],[8,10],[15,18]] (already sorted)",
      steps: [
        { title: "[1,3]", html: `<div class="arr"><span class="cell hl">1-3</span><span class="cell">2-6</span><span class="cell">8-10</span><span class="cell">15-18</span></div><p>Output khaali, to add: <code>[[1,3]]</code></p>` },
        { title: "[2,6]", html: `<div class="arr"><span class="cell ok">1-3</span><span class="cell hl">2-6</span><span class="cell">8-10</span><span class="cell">15-18</span></div><p>2 ≤ 3 (last end). Overlap! last.end = max(3, 6) = 6 → <code>[[1,6]]</code></p>` },
        { title: "[8,10]", html: `<div class="arr"><span class="cell ok">1-6</span><span class="cell dim">-</span><span class="cell hl">8-10</span><span class="cell">15-18</span></div><p>8 &gt; 6. Overlap nahi, naya group → <code>[[1,6],[8,10]]</code></p>` },
        { title: "[15,18]", html: `<div class="arr"><span class="cell ok">1-6</span><span class="cell dim">-</span><span class="cell ok">8-10</span><span class="cell hl">15-18</span></div><p>15 &gt; 10, naya group. <b>Answer: [[1,6],[8,10],[15,18]]</b></p>` }
      ]
    },
    {
      type: "think",
      id: "think-merge",
      q: "<b>Merge Intervals:</b> unsorted intervals ki list hai, saare overlapping intervals merge karo. Approach aur complexity? Ek interval doosre ke andar poora ho (jaise [1,10] aur [2,3]) to kya dhyaan rakhna hai?",
      rubric: [
        { point: "<b>Start se sort</b>", keys: ["sort"], weight: 2 },
        { point: "Overlap check: <b>cur.start ≤ last.end</b>", keys: ["start <= ", "start ≤", "<= last", "last end", "previous end", "pichle ka end"], weight: 2 },
        { point: "Merge pe <b>end = max(last.end, cur.end)</b> (contained interval ke liye max zaroori)", keys: ["max(", "maximum", "max end", "bada end"], weight: 2 },
        { point: "Time <b>O(n log n)</b> (sort), space O(n) output", keys: ["n log n", "nlogn", "o(n log"] }
      ],
      answer: `<p>Start se sort karo. Output list mein last interval se compare: <code>cur.start &lt;= last.end</code> to <code>last.end = max(last.end, cur.end)</code>, warna <code>cur</code> naya add.</p>
        <p><b>max kyun:</b> [1,10] ke baad [2,3] aaye to <code>last.end = 3</code> likhna galat hoga. max se 10 bana rehta hai.</p>
        <p><b>Time:</b> O(n log n) sort + O(n) pass. <b>Space:</b> O(n) output (+ sort: <code>int[][]</code> object array hai, to Java TimSort use karta hai jo O(n) tak extra memory le sakta hai).</p>`
    },
    {
      type: "exercise",
      id: "ex-merge",
      title: "Merge Intervals",
      level: "Medium",
      task: `<p>Each <code>intervals[i] = [start, end]</code>. Merge every group of overlapping intervals and return the resulting non-overlapping intervals <b>sorted by start</b>. Intervals that only touch (<code>[1,4]</code> and <code>[4,5]</code>) also merge. The input is not necessarily sorted.</p><p class="small muted">Example 1 (two characters = 1 unit)</p><pre class="diagram">[1,3]     [---]
[2,6]       [-------]
[8,10]                  [---]
[15,18]                               [-----]
merged    [---------]   [---]         [-----]</pre><h4>Constraints</h4><ul><li>1 ≤ intervals.length ≤ 10⁵</li><li>0 ≤ start ≤ end</li></ul><p><a href="https://leetcode.com/problems/merge-intervals/" target="_blank">LeetCode 56</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: They touch at 4.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[][] merge(int[][] intervals) {
        // yahan likho
        return new int[0][];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,3],[2,6],[8,10],[15,18]]", new int[][]{{1, 6}, {8, 10}, {15, 18}}, () -> s.merge(new int[][]{{1, 3}, {2, 6}, {8, 10}, {15, 18}}));
        Check.eq("touching [[1,4],[4,5]]", new int[][]{{1, 5}}, () -> s.merge(new int[][]{{1, 4}, {4, 5}}));
        Check.hiddenFromHere();
        Check.eq("single [[1,4]]", new int[][]{{1, 4}}, () -> s.merge(new int[][]{{1, 4}}));
        Check.eq("unsorted [[8,10],[1,3],[2,6]]", new int[][]{{1, 6}, {8, 10}}, () -> s.merge(new int[][]{{8, 10}, {1, 3}, {2, 6}}));
        Check.eq("contained [[1,10],[2,3],[4,5]]", new int[][]{{1, 10}}, () -> s.merge(new int[][]{{1, 10}, {2, 3}, {4, 5}}));
        Check.eq("[[1,4],[0,0]]", new int[][]{{0, 0}, {1, 4}}, () -> s.merge(new int[][]{{1, 4}, {0, 0}}));
        int n = 100000;
        Random r = new Random(1);
        int[][] big = new int[n][];
        for (int i = 0; i < n; i++) big[i] = new int[]{3 * i, 3 * i + 1};      // sab alag
        for (int i = n - 1; i > 0; i--) { int j = r.nextInt(i + 1); int[] t = big[i]; big[i] = big[j]; big[j] = t; }
        Check.eq("bada input n=1e5, koi overlap nahi: count", n, () -> s.merge(big).length);
        int[][] big2 = new int[n + 1][];
        for (int i = 0; i < n; i++) big2[i] = new int[]{3 * i, 3 * i + 1};
        big2[n] = new int[]{1, 3 * n};                                          // sabko jodta hai
        for (int i = n; i > 0; i--) { int j = r.nextInt(i + 1); int[] t = big2[i]; big2[i] = big2[j]; big2[j] = t; }
        Check.eq("bada input n=1e5, sab ek mein", new int[][]{{0, 3 * n}}, () -> s.merge(big2));
    }
}`,
      hints: [
        "<code>Arrays.sort(intervals, (a, b) -&gt; Integer.compare(a[0], b[0]));</code>",
        "<code>List&lt;int[]&gt; out</code> rakho. Agar <code>out</code> khaali hai ya last ka end &lt; cur ka start, to naya add karo.",
        "Warna <code>last[1] = Math.max(last[1], cur[1])</code>. End mein <code>out.toArray(new int[0][])</code>."
      ],
      solution: `import java.util.*;

class Solution {
    int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] cur : intervals) {
            if (out.isEmpty() || out.get(out.size() - 1)[1] < cur[0]) {
                out.add(new int[]{cur[0], cur[1]});
            } else {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], cur[1]);
            }
        }
        return out.toArray(new int[0][]);
    }
}`,
      explain: `<p><b>Approach:</b> start se sort, phir ek pass mein last interval extend ya naya add.</p>
        <p><b>Time:</b> O(n log n). <b>Space:</b> O(n) output.</p>`
    },
    {
      type: "think",
      id: "think-insert",
      q: "<b>Insert Interval:</b> intervals pehle se <b>sorted aur non-overlapping</b> hain. Ek naya interval daalna hai aur zaroorat ho to merge. Kya dobara sort karna padega? O(n) kaise?",
      rubric: [
        { point: "Sort ki zaroorat nahi, list already sorted, <b>O(n)</b> ek pass", keys: ["o(n)", "sort nahi", "no sort", "already sorted", "ek pass", "one pass", "linear"], weight: 2 },
        { point: "Phase 1: jo intervals naye se <b>pehle khatam</b> (end &lt; new.start), seedha add", keys: ["end < new", "pehle khatam", "before", "left side", "phase 1", "pehle wale"], weight: 2 },
        { point: "Phase 2: jo overlap karein, <b>min start, max end</b> se naye mein merge", keys: ["min(", "max(", "overlap", "merge"], weight: 2 },
        { point: "Phase 3: baaki (start &gt; new.end) seedha add", keys: ["baaki", "remaining", "rest", "after", "phase 3"] }
      ],
      answer: `<p>Teen phase, ek pass (<b>O(n)</b>):</p>
        <ol><li>Jab tak <code>intervals[i].end &lt; new.start</code>: ye naye se pehle khatam ho gaye, seedha output.</li>
        <li>Jab tak <code>intervals[i].start &lt;= new.end</code>: overlap hai. <code>new.start = min(...)</code>, <code>new.end = max(...)</code>. Phir merged <code>new</code> output mein.</li>
        <li>Baaki sab seedha output.</li></ol>
        <p><b>Time O(n), space O(n)</b> output. Naya daal ke Merge Intervals chala dena bhi sahi hai, par O(n log n), aur interviewer O(n) poochhega.</p>`
    },
    {
      type: "exercise",
      id: "ex-insert",
      title: "Insert Interval",
      level: "Medium",
      task: `<p><code>intervals</code> is sorted by start and has no overlaps. Insert <code>newInterval</code>, merge whatever overlaps (or touches) it, and return the new sorted, non-overlapping list.</p><h4>Constraints</h4><ul><li>0 ≤ intervals.length ≤ 10⁵</li><li>0 ≤ start ≤ end</li></ul><p><a href="https://leetcode.com/problems/insert-interval/" target="_blank">LeetCode 57</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  intervals = [[1,3],[6,9]], newInterval = [2,5]
Output: [[1,5],[6,9]]</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
Output: [[1,2],[3,10],[12,16]]
Explanation: [4,8] overlaps [3,5], [6,7] and [8,10].</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int[][] insert(int[][] intervals, int[] newInterval) {
        // yahan likho
        return intervals;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[1,3],[6,9]] + [2,5]", new int[][]{{1, 5}, {6, 9}}, () -> s.insert(new int[][]{{1, 3}, {6, 9}}, new int[]{2, 5}));
        Check.eq("[[1,2],[3,5],[6,7],[8,10],[12,16]] + [4,8]", new int[][]{{1, 2}, {3, 10}, {12, 16}},
            () -> s.insert(new int[][]{{1, 2}, {3, 5}, {6, 7}, {8, 10}, {12, 16}}, new int[]{4, 8}));
        Check.hiddenFromHere();
        Check.eq("empty + [5,7]", new int[][]{{5, 7}}, () -> s.insert(new int[][]{}, new int[]{5, 7}));
        Check.eq("andar hi [[1,5]] + [2,3]", new int[][]{{1, 5}}, () -> s.insert(new int[][]{{1, 5}}, new int[]{2, 3}));
        Check.eq("shuru mein [[3,5]] + [1,2]", new int[][]{{1, 2}, {3, 5}}, () -> s.insert(new int[][]{{3, 5}}, new int[]{1, 2}));
        Check.eq("touching [[1,2],[5,6]] + [2,5]", new int[][]{{1, 6}}, () -> s.insert(new int[][]{{1, 2}, {5, 6}}, new int[]{2, 5}));
        int n = 100000;
        int[][] big = new int[n][];
        for (int i = 0; i < n; i++) big[i] = new int[]{3 * i, 3 * i + 1};
        Check.eq("bada input n=1e5: sab ek mein", new int[][]{{0, 3 * (n - 1) + 1}}, () -> s.insert(big, new int[]{1, 3 * (n - 1)}));
        int[][] big2 = new int[n][];
        for (int i = 0; i < n; i++) big2[i] = new int[]{3 * i, 3 * i + 1};
        Check.eq("bada input n=1e5: beech mein gap me daalo, count", n + 1, () -> s.insert(big2, new int[]{3 * 500 + 2, 3 * 500 + 2}).length);
    }
}`,
      hints: [
        "Output ke liye <code>List&lt;int[]&gt;</code>. Index <code>i</code> se teen while loops chalao.",
        "Loop 1: <code>while (i &lt; n &amp;&amp; a[i][1] &lt; ns) add(a[i++])</code>. Loop 2: <code>while (i &lt; n &amp;&amp; a[i][0] &lt;= ne) { ns = min; ne = max; i++; }</code> phir <code>[ns, ne]</code> add.",
        "Loop 3: baaki saare add. <code>out.toArray(new int[0][])</code>."
      ],
      solution: `import java.util.*;

class Solution {
    int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = intervals.length;
        int ns = newInterval[0], ne = newInterval[1];
        while (i < n && intervals[i][1] < ns) out.add(intervals[i++]);      // pehle khatam
        while (i < n && intervals[i][0] <= ne) {                            // overlap
            ns = Math.min(ns, intervals[i][0]);
            ne = Math.max(ne, intervals[i][1]);
            i++;
        }
        out.add(new int[]{ns, ne});
        while (i < n) out.add(intervals[i++]);                              // baad wale
        return out.toArray(new int[0][]);
    }
}`,
      explain: `<p><b>Approach:</b> teen phase: pehle wale, overlap wale (merge), baad wale.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n) output.</p>
        <p>Optimization idea: phase 1 ka end binary search se O(log n) mein mil sakta hai, par output copy karna phir bhi O(n) hai.</p>`
    },
    {
      type: "think",
      id: "think-rooms",
      q: "<b>Meeting Rooms II:</b> meetings ke [start, end] diye hain. Kam se kam kitne rooms chahiye taaki koi do overlapping meetings ek room mein na hon? (Ek meeting ka end = doosri ka start ho to same room chalega.)",
      rubric: [
        { point: "Answer = <b>kisi bhi time pe max ek saath chal rahi meetings</b>", keys: ["max", "ek saath", "simultaneous", "concurrent", "same time", "overlap"], weight: 2 },
        { point: "Option 1: start se sort + <b>min-heap of end times</b>", keys: ["heap", "priorityqueue", "priority queue", "min-heap", "min heap"], weight: 2 },
        { point: "Option 2: <b>starts aur ends alag sort</b>, two pointers / sweep", keys: ["starts", "ends", "alag sort", "separately", "sweep", "two pointer", "chronological"], weight: 2 },
        { point: "end ≤ start pe room <b>free</b> (heap poll / end pointer aage)", keys: ["poll", "free", "khali", "reuse", "end <= start", "end ≤ start"] },
        { point: "Time <b>O(n log n)</b>", keys: ["n log n", "nlogn", "o(n log"] }
      ],
      answer: `<p>Rooms = <b>kisi bhi pal ek saath chal rahi meetings ki max count</b>.</p>
        <p><b>Heap tareeka:</b> start se sort. Min-heap mein chal rahi meetings ke end times. Har nayi meeting pe: agar <code>heap.peek() &lt;= start</code> to wo room free hai (poll). Phir naya end push. Heap ka max size = answer.</p>
        <p><b>Sweep tareeka:</b> <code>starts[]</code> aur <code>ends[]</code> alag sort. Starts pe chalo; agar <code>start &lt; ends[j]</code> to naya room chahiye (<code>rooms++</code>), warna ek meeting khatam ho chuki (<code>j++</code>, room reuse). Dono <b>O(n log n) time, O(n) space</b>.</p>
        <p>Real example: Ola/Uber mein peak time pe kitne drivers chahiye = ek saath kitni rides chal rahi hain.</p>`
    },
    {
      type: "exercise",
      id: "ex-rooms",
      title: "Meeting Rooms II",
      level: "Medium",
      task: `<p>Each <code>[start, end]</code> is a meeting that occupies a room from <code>start</code> until <code>end</code>; the room is free again at time <code>end</code>. Return the minimum number of rooms so that all meetings can happen. A meeting that starts exactly when another ends can reuse its room.</p><p class="small muted">Example 1 (one character = 1 minute)</p><pre class="diagram">0    5    10   15   20   25   30
[-----------------------------]  A
     [----]                     B
               [----]           C
B overlaps A, C overlaps A, B and C never overlap → 2 rooms</pre><h4>Constraints</h4><ul><li>1 ≤ intervals.length ≤ 10⁵</li><li>start &lt; end</li></ul><p><a href="https://leetcode.com/problems/meeting-rooms-ii/" target="_blank">LeetCode 253 (premium on LeetCode)</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  intervals = [[0,30],[5,10],[15,20]]
Output: 2</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  intervals = [[7,10],[2,4]]
Output: 1</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int minMeetingRooms(int[][] intervals) {
        // yahan likho
        return intervals.length;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[[0,30],[5,10],[15,20]]", 2, () -> s.minMeetingRooms(new int[][]{{0, 30}, {5, 10}, {15, 20}}));
        Check.eq("[[7,10],[2,4]]", 1, () -> s.minMeetingRooms(new int[][]{{7, 10}, {2, 4}}));
        Check.hiddenFromHere();
        Check.eq("empty", 0, () -> s.minMeetingRooms(new int[][]{}));
        Check.eq("single [[1,2]]", 1, () -> s.minMeetingRooms(new int[][]{{1, 2}}));
        Check.eq("end == start share [[1,5],[5,10]]", 1, () -> s.minMeetingRooms(new int[][]{{1, 5}, {5, 10}}));
        Check.eq("nested [[1,10],[2,9],[3,8]]", 3, () -> s.minMeetingRooms(new int[][]{{1, 10}, {2, 9}, {3, 8}}));
        Check.eq("[[1,3],[2,4],[3,5],[4,6]]", 2, () -> s.minMeetingRooms(new int[][]{{1, 3}, {2, 4}, {3, 5}, {4, 6}}));
        int n = 100000;
        int[][] big = new int[n][];
        for (int i = 0; i < n; i++) big[i] = new int[]{i, i + 100};           // har pal 100 meetings
        Random r = new Random(2);
        for (int i = n - 1; i > 0; i--) { int j = r.nextInt(i + 1); int[] t = big[i]; big[i] = big[j]; big[j] = t; }
        Check.eq("bada input n=1e5", 100, () -> s.minMeetingRooms(big));
    }
}`,
      hints: [
        "Answer = ek saath chal rahi meetings ki maximum ginti.",
        "Start se sort karo. <code>PriorityQueue&lt;Integer&gt;</code> (min-heap) mein chal rahi meetings ke end times rakho.",
        "Har meeting: <code>if (!pq.isEmpty() &amp;&amp; pq.peek() &lt;= start) pq.poll(); pq.add(end);</code>. Answer = <code>pq.size()</code> ka max (ya end mein pq.size())."
      ],
      solution: `import java.util.*;

class Solution {
    int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        int[] starts = new int[n], ends = new int[n];
        for (int i = 0; i < n; i++) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int rooms = 0, j = 0;
        for (int i = 0; i < n; i++) {
            if (starts[i] < ends[j]) {
                rooms++;          // koi meeting khatam nahi hui, naya room
            } else {
                j++;              // ek meeting khatam, uska room reuse
            }
        }
        return rooms;
    }
}`,
      explain: `<p><b>Approach (sweep):</b> starts aur ends alag sort. Har start pe agar sabse pehle khatam hone wali meeting abhi chal rahi hai (<code>start &lt; ends[j]</code>) to naya room, warna reuse.</p>
        <p><b>Time:</b> O(n log n). <b>Space:</b> O(n).</p>
        <p>Heap version bhi O(n log n) hai aur ye batata hai <b>kaunsa</b> room free hua, jo follow-up "room number assign karo" (LeetCode 2402) mein kaam aata hai.</p>`
    },
    {
      type: "quiz",
      q: "Comparator <code>(a, b) -&gt; a[0] - b[0]</code> kab galat sort karega?",
      options: [
        "Kabhi nahi, ye standard tareeka hai",
        "Jab starts bahut bade positive aur negative hon (jaise -2×10⁹ aur 2×10⁹), subtraction overflow hoke sign ulta ho jaata hai",
        "Jab do intervals ka start same ho",
        "Sirf jab array khaali ho"
      ],
      answer: 1,
      why: "<code>2_000_000_000 - (-2_000_000_000)</code> int mein overflow hoke negative ban jaata hai, to comparator ulta jawab deta hai. <code>Integer.compare(a[0], b[0])</code> hamesha safe hai."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Pehle start se sort (Integer.compare se), phir ek pass.</li><li>Merge: cur.start ≤ last.end to last.end = max(...).</li><li>Insert (already sorted): pehle wale, overlap wale (min/max), baad wale. O(n).</li><li>Meeting rooms: max ek saath chal rahi meetings. starts/ends alag sort, ya end times ka min-heap.</li><li>Touching intervals overlap hain ya nahi, hamesha clarify karo.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Interval problem mein code se pehle do cheezein clarify karo: (1) input sorted hai ya nahi, (2) touching intervals (<code>end == start</code>) overlap maane jaayenge ya nahi. Ye ek line ka sawaal bugs bachata hai aur interviewer ko dikhata hai ki aap edge cases sochte ho."
    }
  ],
  references: [
    { title: "Merge Intervals", by: "LeetCode", url: "https://leetcode.com/problems/merge-intervals/", type: "article" },
    { title: "Insert Interval", by: "LeetCode", url: "https://leetcode.com/problems/insert-interval/", type: "article" },
    { title: "Meeting Rooms II", by: "LeetCode", url: "https://leetcode.com/problems/meeting-rooms-ii/", type: "article" },
    { title: "NeetCode Roadmap (Intervals)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
