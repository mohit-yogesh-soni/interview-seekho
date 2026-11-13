// DSA exercise statements in English (part B). Constraints follow the sizes used by the hidden tests.
import { ex, cons, lc, dia, p } from "./dsa-statements-a.mjs";

const treeNote = p("In the tests, trees are written in level order; <code>null</code> means a missing child.");

export const B = {
  "heap-topk::ex-kth-largest": {
    task: p("Given an integer array <code>nums</code> and an integer <code>k</code>, return the k-th largest element in sorted order. Duplicates count separately (in <code>[5,5,4]</code> the 2nd largest is 5).") +
      p("Try to do it without sorting the whole array (for example, a min-heap of size k: O(n log k)).") +
      cons(["1 ≤ k ≤ nums.length ≤ 10⁵", "Values fit in int"]) + lc("kth-largest-element-in-an-array", "LeetCode 215"),
    examples: ex(1, "nums = [3,2,1,5,6,4], k = 2", "5") + ex(2, "nums = [3,2,3,1,2,4,5,5,6], k = 4", "4", "Sorted descending: 6,5,5,4,…")
  },
  "heap-topk::ex-k-closest": {
    task: p("<code>points[i] = [x, y]</code> are points on a plane. Return the <code>k</code> points closest to the origin (0, 0) by Euclidean distance. The answer may be in any order and is guaranteed to be unique.") +
      p("Tip: compare <code>x² + y²</code>; the square root is not needed.") +
      cons(["1 ≤ k ≤ points.length ≤ 10⁵", "Coordinates fit in int; use long for x² + y² if you like"]) + lc("k-closest-points-to-origin", "LeetCode 973"),
    examples: ex(1, "points = [[1,3],[-2,2]], k = 1", "[[-2,2]]", "1² + 3² = 10 and (−2)² + 2² = 8, so [-2,2] is closer.") +
      ex(2, "points = [[3,3],[5,-1],[-2,4]], k = 2", "[[3,3],[-2,4]]", "Squared distances: 18, 26, 20.")
  },
  "heap-topk::ex-median-stream": {
    task: p("Implement <code>MedianFinder</code>:") +
      `<ul><li><code>addNum(int num)</code> adds a number from the stream.</li><li><code>findMedian()</code> returns the median of all numbers so far as a <code>double</code>. With an even count it is the average of the two middle values.</li></ul>` +
      p("The harness calls <code>findMedian()</code> after every <code>addNum</code> and compares all the medians. Each operation should be O(log n) (two heaps).") +
      cons(["Up to 10⁵ calls in total", "-2³¹ ≤ num ≤ 2³¹ − 1 (use long or double when averaging)", "findMedian is called only after at least one addNum"]) + lc("find-median-from-data-stream", "LeetCode 295"),
    examples: ex(1, "addNum(1), findMedian(), addNum(2), findMedian(), addNum(3), findMedian()", "1.0, 1.5, 2.0")
  },
  "intervals::ex-merge": {
    task: p("Each <code>intervals[i] = [start, end]</code>. Merge every group of overlapping intervals and return the resulting non-overlapping intervals <b>sorted by start</b>. Intervals that only touch (<code>[1,4]</code> and <code>[4,5]</code>) also merge. The input is not necessarily sorted.") +
      dia("Example 1 (two characters = 1 unit)", "[1,3]     [---]\n[2,6]       [-------]\n[8,10]                  [---]\n[15,18]                               [-----]\nmerged    [---------]   [---]         [-----]") +
      cons(["1 ≤ intervals.length ≤ 10⁵", "0 ≤ start ≤ end"]) + lc("merge-intervals", "LeetCode 56"),
    examples: ex(1, "intervals = [[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]") + ex(2, "intervals = [[1,4],[4,5]]", "[[1,5]]", "They touch at 4.")
  },
  "intervals::ex-insert": {
    task: p("<code>intervals</code> is sorted by start and has no overlaps. Insert <code>newInterval</code>, merge whatever overlaps (or touches) it, and return the new sorted, non-overlapping list.") +
      cons(["0 ≤ intervals.length ≤ 10⁵", "0 ≤ start ≤ end"]) + lc("insert-interval", "LeetCode 57"),
    examples: ex(1, "intervals = [[1,3],[6,9]], newInterval = [2,5]", "[[1,5],[6,9]]") +
      ex(2, "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", "[[1,2],[3,10],[12,16]]", "[4,8] overlaps [3,5], [6,7] and [8,10].")
  },
  "intervals::ex-rooms": {
    task: p("Each <code>[start, end]</code> is a meeting that occupies a room from <code>start</code> until <code>end</code>; the room is free again at time <code>end</code>. Return the minimum number of rooms so that all meetings can happen. A meeting that starts exactly when another ends can reuse its room.") +
      dia("Example 1 (one character = 1 minute)", "0    5    10   15   20   25   30\n[-----------------------------]  A\n     [----]                     B\n               [----]           C\nB overlaps A, C overlaps A, B and C never overlap → 2 rooms") +
      cons(["1 ≤ intervals.length ≤ 10⁵", "start &lt; end"]) + lc("meeting-rooms-ii", "LeetCode 253 (premium on LeetCode)"),
    examples: ex(1, "intervals = [[0,30],[5,10],[15,20]]", "2") + ex(2, "intervals = [[7,10],[2,4]]", "1")
  },
  "k-way-merge::ex-merge-k-lists": {
    task: p("<code>lists</code> holds the heads of k linked lists, each sorted in ascending order. Merge them into one sorted linked list and return its head. Some lists may be empty (<code>null</code>).") +
      p("The hidden tests are large: aim for O(N log k), where N is the total number of nodes (min-heap of the k current heads).") +
      cons(["0 ≤ k ≤ 10⁴", "Each list is sorted ascending", "Values fit in int"]) + lc("merge-k-sorted-lists", "LeetCode 23"),
    examples: ex(1, "lists = [[1,4,5],[1,3,4],[2,6]]", "[1,1,2,3,4,4,5,6]") + ex(2, "lists = []", "[]") + ex(3, "lists = [[]]", "[]")
  },
  "k-way-merge::ex-kth-matrix": {
    task: p("Given an <code>n × n</code> matrix where every row and every column is sorted in ascending order, return the k-th smallest element in the whole matrix (duplicates count separately).") +
      dia("Example 1, sorted: 1 5 9 10 11 12 13 13 15", " 1   5   9\n10  11  13\n12  13  15") +
      cons(["1 ≤ n ≤ 300", "1 ≤ k ≤ n²", "Values fit in int"]) + lc("kth-smallest-element-in-a-sorted-matrix", "LeetCode 378"),
    examples: ex(1, "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8", "13") + ex(2, "matrix = [[-5]], k = 1", "-5")
  },
  "ll-reversal::ex-reverse2": {
    task: p("Reverse the nodes of the list from position <code>left</code> to position <code>right</code> (1-indexed, both inclusive) and return the head. The rest of the list keeps its order. Re-link the nodes; do not just copy values.") +
      dia("left = 2, right = 4", "before: 1 → [2 → 3 → 4] → 5\nafter:  1 → [4 → 3 → 2] → 5") +
      cons(["1 ≤ number of nodes ≤ 10⁵", "1 ≤ left ≤ right ≤ number of nodes"]) + lc("reverse-linked-list-ii", "LeetCode 92"),
    examples: ex(1, "head = [1,2,3,4,5], left = 2, right = 4", "[1,4,3,2,5]") + ex(2, "head = [5], left = 1, right = 1", "[5]")
  },
  "ll-reversal::ex-reorder": {
    task: p("Reorder the list <code>L0 → L1 → … → Ln-1 → Ln</code> <b>in place</b> into <code>L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …</code>. Do not change node values; only re-link nodes. The method returns nothing.") +
      dia("Idea: split in the middle, reverse the second half, then weave", "1 → 2 → 3 → 4 → 5\nfirst: 1 → 2 → 3     second (reversed): 5 → 4\nweave: 1 → 5 → 2 → 4 → 3") +
      cons(["1 ≤ number of nodes ≤ about 10⁵"]) + lc("reorder-list", "LeetCode 143"),
    examples: ex(1, "head = [1,2,3,4]", "[1,4,2,3]") + ex(2, "head = [1,2,3,4,5]", "[1,5,2,4,3]")
  },
  "ll-reversal::ex-remove-nth": {
    task: p("Remove the <b>n-th node from the end</b> of the list and return the head. Try to do it in one pass (two pointers n apart).") +
      cons(["1 ≤ number of nodes ≤ 10⁵", "1 ≤ n ≤ number of nodes"]) + lc("remove-nth-node-from-end-of-list", "LeetCode 19"),
    examples: ex(1, "head = [1,2,3,4,5], n = 2", "[1,2,3,5]", "The 2nd node from the end is 4.") + ex(2, "head = [1], n = 1", "[]") + ex(3, "head = [1,2], n = 1", "[1]")
  },
  "monotonic-stack::ex-daily": {
    task: p("<code>temps[i]</code> is the temperature on day i. For every day, return how many days you have to wait until a <b>strictly warmer</b> day. If there is no warmer day later, the answer for that day is 0.") +
      cons(["1 ≤ temps.length ≤ 10⁵", "Values fit in int"]) + lc("daily-temperatures", "LeetCode 739"),
    examples: ex(1, "temps = [73,74,75,71,69,72,76,73]", "[1,1,4,2,1,1,0,0]", "Day 2 (75) waits until day 6 (76): 4 days.") + ex(2, "temps = [30,40,50,60]", "[1,1,1,0]")
  },
  "monotonic-stack::ex-nge2": {
    task: p("The array is <b>circular</b>: after <code>nums[n-1]</code> comes <code>nums[0]</code>. For every index return the first value after it (going around the circle) that is <b>strictly greater</b>, or <code>-1</code> if none exists.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "Values fit in int"]) + lc("next-greater-element-ii", "LeetCode 503"),
    examples: ex(1, "nums = [1,2,1]", "[2,-1,2]", "The last 1 wraps around and finds 2. Nothing is greater than 2.") + ex(2, "nums = [1,2,3,4,3]", "[2,3,4,-1,4]")
  },
  "monotonic-stack::ex-histogram": {
    task: p("<code>heights</code> are the bar heights of a histogram; every bar is 1 wide. Return the area of the largest rectangle that fits inside the histogram (made of contiguous bars).") +
      dia("Example 1: bars 5 and 6 give height 5 × width 2 = 10", "      █\n    █ █\n    █ █\n    █ █   █\n█   █ █ █ █\n█ █ █ █ █ █\n2 1 5 6 2 3") +
      cons(["1 ≤ heights.length ≤ 10⁵", "heights[i] ≥ 0 and the answer fits in an int"]) + lc("largest-rectangle-in-histogram", "LeetCode 84"),
    examples: ex(1, "heights = [2,1,5,6,2,3]", "10") + ex(2, "heights = [2,4]", "4")
  },
  "prefix-sum::ex-subarray-k": {
    task: p("Return the number of <b>contiguous</b>, non-empty subarrays whose sum is exactly <code>k</code>. Numbers may be negative or zero, so a sliding window does not work.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "Values and k fit in int"]) + lc("subarray-sum-equals-k", "LeetCode 560"),
    examples: ex(1, "nums = [1,1,1], k = 2", "2", "[1,1] at positions 0-1 and 1-2.") + ex(2, "nums = [1,2,3], k = 3", "2", "[1,2] and [3].")
  },
  "prefix-sum::ex-product": {
    task: p("Return an array <code>ans</code> where <code>ans[i]</code> is the product of all elements of <code>nums</code> except <code>nums[i]</code>. Do not use division, and run in O(n). Every product fits in an int.") +
      cons(["2 ≤ nums.length ≤ 10⁵", "Every prefix and suffix product fits in an int"]) + lc("product-of-array-except-self", "LeetCode 238"),
    examples: ex(1, "nums = [1,2,3,4]", "[24,12,8,6]") + ex(2, "nums = [-1,1,0,-3,3]", "[0,0,9,0,0]")
  },
  "prefix-sum::ex-range-2d": {
    task: p("Implement <code>NumMatrix</code>:") +
      `<ul><li><code>NumMatrix(int[][] matrix)</code> receives the matrix once; it never changes.</li><li><code>int sumRegion(int r1, int c1, int r2, int c2)</code> returns the sum of the rectangle from top-left <code>(r1, c1)</code> to bottom-right <code>(r2, c2)</code>, both inclusive.</li></ul>` +
      p("Each <code>sumRegion</code> must be <b>O(1)</b>; a hidden test makes 10⁵ queries.") +
      dia("Example: sumRegion(2,1,4,3) is the boxed area = 8", "     c0 c1 c2 c3 c4\nr0    3  0  1  4  2\nr1    5  6  3  2  1\nr2    1 [2  0  1] 5\nr3    4 [1  0  1] 7\nr4    1 [0  3  0] 5") +
      cons(["1 ≤ rows, cols ≤ 300", "Up to 10⁵ calls to sumRegion", "0 ≤ r1 ≤ r2 &lt; rows, 0 ≤ c1 ≤ c2 &lt; cols"]) + lc("range-sum-query-2d-immutable", "LeetCode 304"),
    examples: ex(1, "matrix as in the diagram; sumRegion(2,1,4,3), sumRegion(1,1,2,2), sumRegion(1,2,2,4)", "8, 11, 12")
  },
  "recursion-basics::ex-pow": {
    task: p("Return <code>x</code> raised to the power <code>n</code> without using <code>Math.pow</code>. <code>n</code> can be negative and can be any int value (−2³¹ ≤ n ≤ 2³¹ − 1). Use fast exponentiation (O(log n)).") +
      p("Answers are compared with a 10⁻⁶ tolerance.") +
      cons(["-2³¹ ≤ n ≤ 2³¹ − 1 (careful: −n overflows for n = −2³¹)", "x is not 0 when n is negative"]) + lc("powx-n", "LeetCode 50"),
    examples: ex(1, "x = 2.0, n = 10", "1024.0") + ex(2, "x = 2.0, n = -2", "0.25", "2⁻² = 1/4")
  },
  "recursion-basics::ex-subsets": {
    task: p("All values in <code>nums</code> are distinct. Return <b>all subsets</b> of <code>nums</code>, including the empty one. The order of subsets and of elements inside a subset does not matter, but no subset may appear twice.") +
      cons(["1 ≤ nums.length ≤ 16", "All values are distinct"]) + lc("subsets", "LeetCode 78"),
    examples: ex(1, "nums = [1,2,3]", "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]") + ex(2, "nums = [0]", "[[],[0]]")
  },
  "shortest-path::ex-network-delay": {
    task: p("A network has <code>n</code> nodes labelled 1 to n. <code>times[i] = [u, v, w]</code> means a signal takes <code>w</code> time to travel from u to v (directed). A signal is sent from node <code>k</code>. Return the minimum time for <b>all</b> nodes to receive it, or <code>-1</code> if some node can never be reached.") +
      dia("Example 1", "      2\n    1/ \\1\n    ↓   ↓\n    1   3\n        │1\n        ↓\n        4\nfrom 2: node 1 at t=1, node 3 at t=1, node 4 at t=2 → answer 2") +
      cons(["1 ≤ n ≤ 2 · 10⁴", "1 ≤ times.length ≤ 10⁵", "All weights are non-negative (so Dijkstra works)"]) + lc("network-delay-time", "LeetCode 743"),
    examples: ex(1, "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", "2") + ex(2, "times = [[1,2,1]], n = 2, k = 1", "1") + ex(3, "times = [[1,2,1]], n = 2, k = 2", "-1", "Node 1 cannot be reached from node 2.")
  },
  "shortest-path::ex-min-effort": {
    task: p("<code>heights</code> is a rows × cols grid. You walk from (0, 0) to (rows − 1, cols − 1), moving up, down, left or right. The <b>effort</b> of a route is the largest absolute height difference between two consecutive cells on it. Return the minimum possible effort.") +
      dia("Example 1: route 1 → 3 → 5 → 3 → 5 has effort 2", "[1]  2   2\n[3]  8   2\n[5] [3] [5]") +
      cons(["1 ≤ rows, cols ≤ 150", "1 ≤ heights[i][j] ≤ 10⁶"]) + lc("path-with-minimum-effort", "LeetCode 1631"),
    examples: ex(1, "heights = [[1,2,2],[3,8,2],[5,3,5]]", "2") + ex(2, "heights = [[1,2,3],[3,8,4],[5,3,5]]", "1", "Route 1 → 2 → 3 → 4 → 5 never changes by more than 1.")
  },
  "sliding-window::ex-longest-unique": {
    task: p("Return the length of the longest <b>substring</b> (contiguous) of <code>s</code> that has no repeated character. <code>s</code> may contain letters, digits, symbols and spaces (ASCII).") +
      cons(["0 ≤ s.length ≤ 10⁵"]) + lc("longest-substring-without-repeating-characters", "LeetCode 3"),
    examples: ex(1, `s = "abcabcbb"`, "3", `"abc"`) + ex(2, `s = "bbbbb"`, "1") + ex(3, `s = "pwwkew"`, "3", `"wke". Note "pwke" is a subsequence, not a substring.`)
  },
  "sliding-window::ex-min-subarray": {
    task: p("All numbers in <code>nums</code> are <b>positive</b>. Return the length of the shortest contiguous subarray whose sum is <b>at least</b> <code>target</code>, or 0 if there is none.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "All values are positive"]) + lc("minimum-size-subarray-sum", "LeetCode 209"),
    examples: ex(1, "target = 7, nums = [2,3,1,2,4,3]", "2", "[4,3]") + ex(2, "target = 4, nums = [1,4,4]", "1") + ex(3, "target = 11, nums = [1,1,1,1,1,1,1,1]", "0", "The total is only 8.")
  },
  "sliding-window::ex-char-replace": {
    task: p("<code>s</code> contains only uppercase letters A-Z. You may change <b>at most k</b> characters into any other uppercase letter. Return the length of the longest substring that can be made of one repeated letter.") +
      cons(["1 ≤ s.length ≤ 10⁵", "0 ≤ k ≤ s.length"]) + lc("longest-repeating-character-replacement", "LeetCode 424"),
    examples: ex(1, `s = "ABAB", k = 2`, "4", "Change both A's to B (or both B's to A).") + ex(2, `s = "AABABBA", k = 1`, "4", `Change the A at index 3 inside "BABB" (indices 2-5) → "BBBB".`)
  },
  "stack-design::ex-minstack": {
    task: p("Implement <code>MinStack</code> with <code>push(int x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code> (the smallest value currently in the stack). <b>Every operation must be O(1).</b>") +
      p("<code>pop</code>, <code>top</code> and <code>getMin</code> are only called on a non-empty stack.") +
      cons(["Up to 10⁵ operations", "-2³¹ ≤ x ≤ 2³¹ − 1"]) + lc("min-stack", "LeetCode 155"),
    examples: ex(1, "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", "getMin → -3, top → 0, getMin → -2")
  },
  "stack-design::ex-parens": {
    task: p("<code>s</code> contains only the characters <code>( ) [ ] { }</code>. Return <code>true</code> if every opening bracket is closed by the <b>same type</b> of bracket in the <b>correct order</b>, and every closing bracket has a matching opening one. The empty string is valid.") +
      cons(["0 ≤ s.length ≤ 10⁵"]) + lc("valid-parentheses", "LeetCode 20"),
    examples: ex(1, `s = "()"`, "true") + ex(2, `s = "()[]{}"`, "true") + ex(3, `s = "(]"`, "false") + ex(4, `s = "([)]"`, "false", "The ) closes [ in the wrong order.")
  },
  "stack-design::ex-rpn": {
    task: p("<code>tokens</code> is an expression in Reverse Polish (postfix) notation. Each token is an integer (possibly negative, like <code>\"-11\"</code>) or one of <code>+ - * /</code>. Return the value. Division is integer division that <b>truncates toward zero</b>. The expression is always valid, never divides by zero, and every intermediate result fits in an int.") +
      dia(`Example 1 with a stack: ["2","1","+","3","*"]`, "push 2      [2]\npush 1      [2, 1]\n+  → 2+1    [3]\npush 3      [3, 3]\n*  → 3*3    [9]") +
      cons(["1 ≤ tokens.length ≤ 10⁵"]) + lc("evaluate-reverse-polish-notation", "LeetCode 150"),
    examples: ex(1, `tokens = ["2","1","+","3","*"]`, "9", "(2 + 1) × 3") + ex(2, `tokens = ["4","13","5","/","+"]`, "6", "4 + 13 / 5 = 4 + 2")
  },
  "topo-sort::ex-course-schedule": {
    task: p("There are <code>numCourses</code> courses labelled 0 to n − 1. <code>prerequisites[i] = [a, b]</code> means you must finish course <code>b</code> before course <code>a</code>. Return <code>true</code> if it is possible to finish all courses (that is, the prerequisite graph has no cycle).") +
      dia("Example 2: a cycle", "0 → 1\n↑   │\n└───┘   (1 needs 0, 0 needs 1)") +
      cons(["1 ≤ numCourses ≤ 10⁵", "0 ≤ prerequisites.length ≤ 10⁵", "All pairs are distinct"]) + lc("course-schedule", "LeetCode 207"),
    examples: ex(1, "numCourses = 2, prerequisites = [[1,0]]", "true", "Take 0, then 1.") + ex(2, "numCourses = 2, prerequisites = [[1,0],[0,1]]", "false")
  },
  "topo-sort::ex-course-schedule-2": {
    task: p("Same setup: <code>[a, b]</code> means b must come before a. Return <b>any one</b> valid order in which to take all courses, or an empty array if it is impossible (there is a cycle).") +
      p("The harness validates your order: every course exactly once, and every prerequisite before its course.") +
      dia("Example 2", "    ┌→ 1 ─┐\n0 ──┤     ├→ 3\n    └→ 2 ─┘\nvalid: [0,1,2,3] or [0,2,1,3]") +
      cons(["1 ≤ numCourses ≤ 10⁵", "0 ≤ prerequisites.length ≤ 10⁵"]) + lc("course-schedule-ii", "LeetCode 210"),
    examples: ex(1, "numCourses = 2, prerequisites = [[1,0]]", "[0,1]") + ex(2, "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", "[0,1,2,3] or [0,2,1,3]") + ex(3, "numCourses = 2, prerequisites = [[1,0],[0,1]]", "[]")
  },
  "tree-bfs::ex-level-order": {
    task: p("Given the root of a binary tree, return the values level by level: each level as a list from left to right, and the levels from top to bottom.") + treeNote +
      dia("Example 1", "    3\n   / \\\n  9   20\n     /  \\\n    15   7") +
      cons(["0 ≤ number of nodes ≤ 10⁵"]) + lc("binary-tree-level-order-traversal", "LeetCode 102"),
    examples: ex(1, "root = [3,9,20,null,null,15,7]", "[[3],[9,20],[15,7]]") + ex(2, "root = [1]", "[[1]]") + ex(3, "root = []", "[]")
  },
  "tree-bfs::ex-right-view": {
    task: p("Imagine standing on the right side of the tree. Return the values you can see from top to bottom: the rightmost node of each level.") + treeNote +
      dia("Example 1: you see 1, 3, 4", "    1      ←\n   / \\\n  2   3    ←\n   \\   \\\n    5   4  ←") +
      cons(["0 ≤ number of nodes ≤ 10⁵"]) + lc("binary-tree-right-side-view", "LeetCode 199"),
    examples: ex(1, "root = [1,2,3,null,5,null,4]", "[1,3,4]") + ex(2, "root = [1,null,3]", "[1,3]") + ex(3, "root = []", "[]")
  },
  "tree-bfs::ex-zigzag": {
    task: p("Return the level order values, but alternate the direction on each level: level 0 left to right, level 1 right to left, level 2 left to right, and so on.") + treeNote +
      dia("Example 1", "    3          → [3]\n   / \\\n  9   20       ← [20,9]\n     /  \\\n    15   7     → [15,7]") +
      cons(["0 ≤ number of nodes ≤ 10⁵"]) + lc("binary-tree-zigzag-level-order-traversal", "LeetCode 103"),
    examples: ex(1, "root = [3,9,20,null,null,15,7]", "[[3],[20,9],[15,7]]") + ex(2, "root = [1]", "[[1]]") + ex(3, "root = []", "[]")
  },
  "tree-dfs::ex-diameter": {
    task: p("Return the <b>diameter</b> of a binary tree: the number of <b>edges</b> on the longest path between any two nodes. The path does not have to pass through the root.") + treeNote +
      dia("Example 1: longest path 4 → 2 → 1 → 3 has 3 edges", "      1\n     / \\\n    2   3\n   / \\\n  4   5") +
      cons(["1 ≤ number of nodes ≤ 10⁵ (deep trees in the tests: watch recursion depth)"]) + lc("diameter-of-binary-tree", "LeetCode 543"),
    examples: ex(1, "root = [1,2,3,4,5]", "3") + ex(2, "root = [1,2]", "1")
  },
  "tree-dfs::ex-lca": {
    task: p("Given a binary tree and two of its nodes <code>p</code> and <code>q</code> (both exist, all values unique), return their <b>lowest common ancestor</b>: the deepest node that has both p and q in its subtree. A node counts as a descendant of itself.") +
      p("The harness finds p and q by value and checks the <code>val</code> of the node you return.") +
      dia("Example tree", "          3\n        /   \\\n       5     1\n      / \\   / \\\n     6   2 0   8\n        / \\\n       7   4") +
      cons(["2 ≤ number of nodes ≤ 10⁵", "p ≠ q, both are in the tree"]) + lc("lowest-common-ancestor-of-a-binary-tree", "LeetCode 236"),
    examples: ex(1, "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", "3") + ex(2, "same tree, p = 5, q = 4", "5", "5 is an ancestor of 4, and a node is its own descendant.") + ex(3, "root = [1,2], p = 1, q = 2", "1")
  },
  "tree-dfs::ex-path-sum-2": {
    task: p("Given a binary tree and <code>targetSum</code>, return every <b>root-to-leaf</b> path (as a list of node values) whose values add up to <code>targetSum</code>. A leaf is a node with no children. Paths may be returned in any order.") + treeNote +
      dia("Example 1: 5+4+11+2 = 22 and 5+8+4+5 = 22", "          5\n         / \\\n        4   8\n       /   / \\\n      11  13  4\n     /  \\    / \\\n    7    2  5   1") +
      cons(["0 ≤ number of nodes ≤ 5000", "Values may be negative"]) + lc("path-sum-ii", "LeetCode 113"),
    examples: ex(1, "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22", "[[5,4,11,2],[5,8,4,5]]") + ex(2, "root = [1,2,3], targetSum = 5", "[]")
  },
  "trie::ex-implement-trie": {
    task: p("Implement a <code>Trie</code> (prefix tree) for lowercase words a-z:") +
      `<ul><li><code>insert(String word)</code></li><li><code>search(String word)</code>: was this exact word inserted?</li><li><code>startsWith(String prefix)</code>: does any inserted word start with this prefix?</li></ul>` +
      p("The harness runs a sequence of operations and compares the list of all search/startsWith answers.") +
      dia("After inserting apple and app (* = end of a word)", "root\n └ a\n   └ p\n     └ p*\n       └ l\n         └ e*") +
      cons(["Only lowercase a-z", "Up to ~4 · 10⁴ calls"]) + lc("implement-trie-prefix-tree", "LeetCode 208"),
    examples: ex(1, `insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")`, "true, false, true, true")
  },
  "trie::ex-word-dictionary": {
    task: p("Implement <code>WordDictionary</code>:") +
      `<ul><li><code>addWord(String word)</code> adds a lowercase word.</li><li><code>search(String pattern)</code> returns whether any added word matches the whole pattern. A <code>.</code> in the pattern matches any single letter.</li></ul>` +
      cons(["Words and patterns use lowercase a-z; patterns may also contain dots", "Up to ~5000 words and searches"]) + lc("design-add-and-search-words-data-structure", "LeetCode 211"),
    examples: ex(1, `addWord("bad"), addWord("dad"), addWord("mad"), search("pad"), search("bad"), search(".ad"), search("b..")`, "false, true, true, true")
  },
  "two-pointers::ex-3sum": {
    task: p("Return all triplets <code>[a, b, c]</code> taken from three different indices with <code>a + b + c == 0</code>. Each set of values must appear only <b>once</b> in the answer. The order of triplets, and of values inside a triplet, does not matter.") +
      cons(["3 ≤ nums.length ≤ 3000", "Values fit in int (a sum of three does not overflow in the tests)"]) + lc("3sum", "LeetCode 15"),
    examples: ex(1, "nums = [-1,0,1,2,-1,-4]", "[[-1,-1,2],[-1,0,1]]", "[-1,0,1] can be formed in two ways but is listed once.") + ex(2, "nums = [0,1,1]", "[]") + ex(3, "nums = [0,0,0]", "[[0,0,0]]")
  },
  "two-pointers::ex-container": {
    task: p("At index <code>i</code> there is a vertical wall of height <code>height[i]</code>. Pick two walls <code>i &lt; j</code>; the water they hold has area <code>min(height[i], height[j]) × (j − i)</code>. Return the largest possible area.") +
      
      cons(["2 ≤ height.length ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"]) + lc("container-with-most-water", "LeetCode 11"),
    examples: ex(1, "height = [1,8,6,2,5,4,8,3,7]", "49", "Walls at index 1 (height 8) and index 8 (height 7): min(8,7) × (8 − 1) = 49.") + ex(2, "height = [1,1]", "1")
  },
  "two-pointers::ex-sort-colors": {
    task: p("<code>nums</code> contains only 0, 1 and 2 (three colours). Sort it <b>in place</b> so that all 0s come first, then 1s, then 2s, without using a library sort. Aim for one pass with O(1) extra space. The method returns nothing.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "nums[i] is 0, 1 or 2"]) + lc("sort-colors", "LeetCode 75"),
    examples: ex(1, "nums = [2,0,2,1,1,0]", "[0,0,1,1,2,2]") + ex(2, "nums = [2,0,1]", "[0,1,2]")
  },
  "union-find::ex-provinces": {
    task: p("There are n cities. <code>isConnected[i][j] = 1</code> if cities i and j are directly connected (the matrix is symmetric and the diagonal is 1). A <b>province</b> is a group of cities connected directly or through other cities. Return the number of provinces.") +
      dia("Example 1", "0 ─ 1      2\nprovince A   province B") +
      cons(["1 ≤ n ≤ 1000", "isConnected[i][j] is 0 or 1", "isConnected[i][i] = 1, isConnected[i][j] = isConnected[j][i]"]) + lc("number-of-provinces", "LeetCode 547"),
    examples: ex(1, "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", "2") + ex(2, "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", "3")
  },
  "union-find::ex-redundant": {
    task: p("A tree with nodes 1..n got one extra edge, so <code>edges</code> now has n undirected edges and exactly one cycle. Return the edge whose removal turns the graph back into a tree. If several edges qualify, return the one that appears <b>last</b> in <code>edges</code>.") +
      dia("Example 1", "1 ─ 2\n \\  │\n   3      edge [2,3] closes the cycle") +
      cons(["3 ≤ n ≤ 10⁵", "No repeated edges; the graph is connected"]) + lc("redundant-connection", "LeetCode 684"),
    examples: ex(1, "edges = [[1,2],[1,3],[2,3]]", "[2,3]") + ex(2, "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]", "[1,4]")
  },
  "union-find::ex-accounts-merge": {
    task: p("<code>accounts.get(i)</code> is <code>[name, email1, email2, ...]</code>. Two accounts belong to the same person if they share <b>any</b> email (and then they have the same name). Two accounts with the same name may still be different people.") +
      p("Merge the accounts and return one list per person: the name first, then all of that person's unique emails <b>sorted</b> (normal String order). The order of the returned accounts does not matter.") +
      cons(["1 ≤ accounts.length ≤ 2000", "2 ≤ accounts[i].size() ≤ 10"]) + lc("accounts-merge", "LeetCode 721"),
    examples: ex(1, "[[Rahul, r@x.com, rw@x.com], [Rahul, r@x.com, r2@x.com], [Priya, p@x.com], [Rahul, rahul3@x.com]]",
      "[[Rahul, r2@x.com, r@x.com, rw@x.com], [Priya, p@x.com], [Rahul, rahul3@x.com]]",
      "The first two share r@x.com. The last Rahul shares no email, so he is a different person. '2' sorts before '@'.")
  }
};
