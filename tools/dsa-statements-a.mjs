// DSA exercise statements in English (part A). Own wording (not copied from LeetCode); examples verified against harness/solutions.
// Helpers produce HTML. Keys: "<lesson>::<exercise id>".
export const ex = (n, input, output, why) =>
  `<div class="ex-case"><b>Example ${n}</b><pre class="code-static">Input:  ${input}\nOutput: ${output}${why ? "\nExplanation: " + why : ""}</pre></div>`;
export const cons = items => `<h4>Constraints</h4><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
export const lc = (slug, label) => `<p><a href="https://leetcode.com/problems/${slug}/" target="_blank">${label}</a></p>`;
export const dia = (title, art) => `<p class="small muted">${title}</p><pre class="diagram">${art}</pre>`;
export const p = s => `<p>${s}</p>`;

export const A = {
  "arrays-hashing::ex-two-sum": {
    task: p("Given an integer array <code>nums</code> and an integer <code>target</code>, return the indices of the two <b>different</b> elements whose sum equals <code>target</code>.") +
      p("Return them as <code>new int[]{i, j}</code> with <code>i &lt; j</code>. Every input has exactly one valid answer.") +
      cons(["2 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i], target ≤ 10⁹", "Exactly one valid pair exists", "Aim for O(n) time"]) + lc("two-sum", "LeetCode 1"),
    examples: ex(1, "nums = [2,7,11,15], target = 9", "[0,1]", "nums[0] + nums[1] = 2 + 7 = 9") +
      ex(2, "nums = [3,2,4], target = 6", "[1,2]", "2 + 4 = 6. Index 0 cannot be used twice (3 + 3).")
  },
  "arrays-hashing::ex-group-anagrams": {
    task: p("Given an array of strings <code>strs</code>, group together the strings that are <b>anagrams</b> of each other (same letters with the same counts, possibly in a different order).") +
      p("Return the groups in any order; the order of strings inside a group also does not matter.") +
      cons(["1 ≤ strs.length ≤ 10⁵", "0 ≤ strs[i].length ≤ 100", "strs[i] contains only lowercase English letters (it may be empty)"]) + lc("group-anagrams", "LeetCode 49"),
    examples: ex(1, `strs = ["eat","tea","tan","ate","nat","bat"]`, `[["eat","tea","ate"],["tan","nat"],["bat"]]`) +
      ex(2, `strs = [""]`, `[[""]]`) + ex(3, `strs = ["a"]`, `[["a"]]`)
  },
  "arrays-hashing::ex-top-k": {
    task: p("Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> values that occur most often. The answer is guaranteed to be unique (no tie at the k-th place). You may return the values in any order.") +
      p("Sorting by frequency (O(n log n)) passes; try for O(n) with bucket sort.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴", "1 ≤ k ≤ number of distinct values"]) + lc("top-k-frequent-elements", "LeetCode 347"),
    examples: ex(1, "nums = [1,1,1,2,2,3], k = 2", "[1,2]", "1 appears 3 times, 2 appears 2 times, 3 appears once.") + ex(2, "nums = [1], k = 1", "[1]")
  },
  "backtracking::ex-subsets": {
    task: p("Given an array <code>nums</code> of <b>distinct</b> integers, return every possible subset (the power set), including the empty subset. The result must not contain duplicate subsets. Subsets, and the elements inside each subset, may be in any order.") +
      cons(["1 ≤ nums.length ≤ 12", "-10⁹ ≤ nums[i] ≤ 10⁹", "All values in nums are distinct"]) + lc("subsets", "LeetCode 78"),
    examples: ex(1, "nums = [1,2,3]", "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]", "2³ = 8 subsets.") + ex(2, "nums = [0]", "[[],[0]]")
  },
  "backtracking::ex-permutations": {
    task: p("Given an array <code>nums</code> of distinct integers, return all possible orderings (permutations) of its elements, in any order.") +
      cons(["1 ≤ nums.length ≤ 7", "-10⁹ ≤ nums[i] ≤ 10⁹", "All values are distinct"]) + lc("permutations", "LeetCode 46"),
    examples: ex(1, "nums = [1,2,3]", "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", "3! = 6 permutations.") + ex(2, "nums = [0,1]", "[[0,1],[1,0]]")
  },
  "backtracking::ex-combination-sum": {
    task: p("Given an array of <b>distinct</b> positive integers <code>candidates</code> and a positive integer <code>target</code>, return all unique combinations of candidates whose sum is <code>target</code>.") +
      p("The same candidate may be used any number of times. Two combinations are the same if every number is used the same number of times (order does not matter). Return the combinations in any order.") +
      cons(["1 ≤ candidates.length ≤ 30", "2 ≤ candidates[i] ≤ 40, all distinct", "1 ≤ target ≤ 40"]) + lc("combination-sum", "LeetCode 39"),
    examples: ex(1, "candidates = [2,3,6,7], target = 7", "[[2,2,3],[7]]", "2 + 2 + 3 = 7 and 7 = 7.") +
      ex(2, "candidates = [2,3,5], target = 8", "[[2,2,2,2],[2,3,3],[3,5]]") + ex(3, "candidates = [2], target = 1", "[]")
  },
  "backtracking::ex-word-search": {
    task: p("Given a grid of characters <code>board</code> and a string <code>word</code>, return <code>true</code> if the word can be traced in the grid.") +
      p("The word is built from letters of cells that are next to each other <b>horizontally or vertically</b> (not diagonally). A single cell may be used at most once in the same word.") +
      dia("Board used in the examples (row, column):", "      c0  c1  c2  c3\nr0    S   E   E   K\nr1    H   O   L   O\nr2    A   B   C   D\n\nHOLE: H(1,0) → O(1,1) → L(1,2) → E(0,2)") +
      cons(["1 ≤ rows, cols ≤ 6", "1 ≤ word.length ≤ 15", "board and word contain only English letters"]) + lc("word-search", "LeetCode 79"),
    examples: ex(1, `board = [["S","E","E","K"],["H","O","L","O"],["A","B","C","D"]], word = "SEEK"`, "true", "The whole first row.") +
      ex(2, `same board, word = "HOLE"`, "true", "See the path in the diagram.") +
      ex(3, `same board, word = "SEES"`, "false", "After S-E-E there is no unused S next to the last E.")
  },
  "big-o::ex-contains-duplicate": {
    task: p("Return <code>true</code> if any value appears <b>at least twice</b> in <code>nums</code>, and <code>false</code> if every value is distinct.") +
      p("The starter code uses a nested loop (O(n²)). It also has a bug, and a hidden test uses n = 10⁵. Fix it and make it O(n).") +
      cons(["1 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"]) + lc("contains-duplicate", "LeetCode 217"),
    examples: ex(1, "nums = [1,2,3,1]", "true", "1 appears at index 0 and 3.") + ex(2, "nums = [1,2,3,4]", "false")
  },
  "binary-search::ex-rotated": {
    task: p("An array sorted in ascending order (all values distinct) was rotated at an unknown pivot, for example <code>[0,1,2,4,5,6,7]</code> → <code>[4,5,6,7,0,1,2]</code>. Given the rotated array <code>nums</code> and a <code>target</code>, return the index of <code>target</code>, or <code>-1</code> if it is not present.") +
      p("Your solution must run in <b>O(log n)</b>; a hidden test makes 10⁵ queries.") +
      dia("Rotated array: two sorted halves", "index:  0  1  2  3 | 4  5  6\nvalue:  4  5  6  7 | 0  1  2\n        \\_ sorted _/   \\_ sorted _/") +
      cons(["1 ≤ nums.length ≤ 10⁵", "Values fit in int and are distinct"]) + lc("search-in-rotated-sorted-array", "LeetCode 33"),
    examples: ex(1, "nums = [4,5,6,7,0,1,2], target = 0", "4") + ex(2, "nums = [4,5,6,7,0,1,2], target = 3", "-1") + ex(3, "nums = [1], target = 0", "-1")
  },
  "binary-search::ex-peak": {
    task: p("A <b>peak</b> is an element strictly greater than both of its neighbours. Treat <code>nums[-1]</code> and <code>nums[n]</code> as −∞. Adjacent elements are never equal.") +
      p("Return the index of any peak. Your solution must run in <b>O(log n)</b>.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "-2³¹ ≤ nums[i] ≤ 2³¹ − 1", "nums[i] ≠ nums[i + 1]"]) + lc("find-peak-element", "LeetCode 162"),
    examples: ex(1, "nums = [1,2,3,1]", "2", "3 is bigger than 2 and 1.") + ex(2, "nums = [1,2,1,3,5,6,4]", "1 or 5", "Both 2 (index 1) and 6 (index 5) are peaks; either index is accepted.")
  },
  "binary-search::ex-koko": {
    task: p("There are <code>piles.length</code> piles of bananas; pile i has <code>piles[i]</code> bananas. Koko picks an eating speed <code>k</code> (bananas per hour). Each hour she chooses one pile and eats up to <code>k</code> bananas from it; if the pile has fewer than <code>k</code>, she finishes it and does nothing more that hour.") +
      p("Return the <b>minimum integer</b> <code>k</code> that lets her finish all piles within <code>h</code> hours.") +
      cons(["1 ≤ piles.length ≤ 10⁵", "piles.length ≤ h ≤ 10⁹", "1 ≤ piles[i] ≤ 10⁹"]) + lc("koko-eating-bananas", "LeetCode 875"),
    examples: ex(1, "piles = [3,6,7,11], h = 8", "4", "At k = 4 the hours are 1 + 2 + 2 + 3 = 8. At k = 3 they are 1 + 2 + 3 + 4 = 10 > 8.") +
      ex(2, "piles = [30,11,23,4,20], h = 5", "30") + ex(3, "piles = [30,11,23,4,20], h = 6", "23")
  },
  "bit-manipulation::ex-single-number": {
    task: p("In a non-empty integer array every element appears exactly <b>twice</b>, except for one element that appears once. Return that element using linear time and constant extra space.") +
      cons(["1 ≤ nums.length ≤ 10⁵ (always odd)", "-2³¹ ≤ nums[i] ≤ 2³¹ − 1"]) + lc("single-number", "LeetCode 136"),
    examples: ex(1, "nums = [2,2,1]", "1") + ex(2, "nums = [4,1,2,1,2]", "4") + ex(3, "nums = [1]", "1")
  },
  "bit-manipulation::ex-counting-bits": {
    task: p("Given an integer <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code> where <code>ans[i]</code> is the number of 1 bits in the binary form of <code>i</code>, for every 0 ≤ i ≤ n.") +
      p("Do it in O(n) without <code>Integer.bitCount</code>.") +
      cons(["0 ≤ n ≤ 10⁵"]) + lc("counting-bits", "LeetCode 338"),
    examples: ex(1, "n = 2", "[0,1,1]", "0 → 0, 1 → 1, 2 → 10") + ex(2, "n = 5", "[0,1,1,2,1,2]", "3 → 11, 4 → 100, 5 → 101")
  },
  "bst::ex-validate-bst": {
    task: p("Given the root of a binary tree, return <code>true</code> if it is a valid binary search tree (BST):") +
      `<ul><li>every value in a node's left subtree is <b>strictly less</b> than the node's value,</li><li>every value in its right subtree is <b>strictly greater</b>,</li><li>and both subtrees are BSTs too.</li></ul>` +
      p("In the tests, trees are written in level order; <code>null</code> means a missing child.") +
      dia("Example 2: 3 is in the right subtree of 5 but is smaller than 5", "        5\n      /   \\\n     1     4\n          / \\\n         3   6") +
      cons(["1 ≤ number of nodes ≤ 10⁵", "-2³¹ ≤ Node.val ≤ 2³¹ − 1 (watch out for overflow at the limits)"]) + lc("validate-binary-search-tree", "LeetCode 98"),
    examples: ex(1, "root = [2,1,3]", "true") + ex(2, "root = [5,1,4,null,null,3,6]", "false", "4 is the right child of 5 but 4 &lt; 5 (and so is 3).")
  },
  "bst::ex-kth-bst": {
    task: p("Given the root of a BST and an integer <code>k</code> (1-indexed), return the k-th smallest value among all the nodes.") +
      dia("Example 2 (in-order: 1 2 3 4 5 6)", "            5\n          /   \\\n         3     6\n        / \\\n       2   4\n      /\n     1") +
      cons(["1 ≤ k ≤ number of nodes ≤ 10⁵", "Values are distinct and fit in int"]) + lc("kth-smallest-element-in-a-bst", "LeetCode 230"),
    examples: ex(1, "root = [3,1,4,null,2], k = 1", "1") + ex(2, "root = [5,3,6,2,4,null,null,1], k = 3", "3")
  },
  "dp-1d::ex-house-robber": {
    task: p("Houses stand in a row; <code>nums[i]</code> is the money in house i. You cannot rob two <b>adjacent</b> houses on the same night. Return the maximum amount you can rob.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "0 ≤ nums[i] ≤ 400"]) + lc("house-robber", "LeetCode 198"),
    examples: ex(1, "nums = [1,2,3,1]", "4", "Rob house 0 (1) and house 2 (3).") + ex(2, "nums = [2,7,9,3,1]", "12", "Rob houses 0, 2 and 4: 2 + 9 + 1.")
  },
  "dp-1d::ex-coin-change": {
    task: p("Given coin denominations <code>coins</code> (unlimited supply of each) and an <code>amount</code>, return the minimum number of coins that add up to exactly <code>amount</code>. Return <code>-1</code> if it cannot be made. For amount 0 the answer is 0.") +
      cons(["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2³¹ − 1", "0 ≤ amount ≤ 2 · 10⁴"]) + lc("coin-change", "LeetCode 322"),
    examples: ex(1, "coins = [1,2,5], amount = 11", "3", "5 + 5 + 1") + ex(2, "coins = [2], amount = 3", "-1") + ex(3, "coins = [1], amount = 0", "0")
  },
  "dp-1d::ex-lis": {
    task: p("Return the length of the longest <b>strictly increasing subsequence</b> of <code>nums</code>. A subsequence keeps the original order but may skip elements.") +
      p("A hidden test has n = 10⁵, so O(n²) times out; you need O(n log n).") +
      cons(["1 ≤ nums.length ≤ 10⁵", "Values fit in int"]) + lc("longest-increasing-subsequence", "LeetCode 300"),
    examples: ex(1, "nums = [10,9,2,5,3,7,101,18]", "4", "One longest subsequence is [2,3,7,101].") + ex(2, "nums = [0,1,0,3,2,3]", "4") + ex(3, "nums = [7,7,7,7]", "1", "Equal values are not strictly increasing.")
  },
  "dp-2d::ex-unique-paths": {
    task: p("A robot starts in the top-left cell of an <code>m × n</code> grid and wants to reach the bottom-right cell. In one step it can move only <b>right</b> or <b>down</b>. Return the number of different paths. The answer fits in an int.") +
      dia("m = 3 rows, n = 2 columns (S = start, E = end)", "S .\n. .\n. E") +
      cons(["1 ≤ m, n ≤ 100", "The answer is ≤ 2 · 10⁹"]) + lc("unique-paths", "LeetCode 62"),
    examples: ex(1, "m = 3, n = 7", "28") + ex(2, "m = 3, n = 2", "3", "Right-Down-Down, Down-Right-Down, Down-Down-Right.")
  },
  "dp-2d::ex-lcs": {
    task: p("Given strings <code>text1</code> and <code>text2</code>, return the length of their longest <b>common subsequence</b> (a sequence of characters that appears in both strings in the same order, not necessarily contiguous). Return 0 if they share none.") +
      cons(["1 ≤ text1.length, text2.length ≤ 2000", "Only lowercase English letters"]) + lc("longest-common-subsequence", "LeetCode 1143"),
    examples: ex(1, `text1 = "abcde", text2 = "ace"`, "3", `"ace"`) + ex(2, `text1 = "abc", text2 = "abc"`, "3") + ex(3, `text1 = "abc", text2 = "def"`, "0")
  },
  "dp-2d::ex-edit-distance": {
    task: p("Return the minimum number of operations to turn <code>word1</code> into <code>word2</code>. Each of these costs 1: <b>insert</b> a character, <b>delete</b> a character, <b>replace</b> a character.") +
      cons(["0 ≤ word1.length, word2.length ≤ 1000", "Only lowercase English letters"]) + lc("edit-distance", "LeetCode 72"),
    examples: ex(1, `word1 = "horse", word2 = "ros"`, "3", "horse → rorse (replace h with r) → rose (delete r) → ros (delete e)") +
      ex(2, `word1 = "intention", word2 = "execution"`, "5")
  },
  "dp-knapsack::ex-partition": {
    task: p("Given an array of positive integers <code>nums</code>, return <code>true</code> if it can be split into two subsets with equal sums (every element goes into exactly one subset).") +
      cons(["1 ≤ nums.length ≤ 200", "1 ≤ nums[i] ≤ 100"]) + lc("partition-equal-subset-sum", "LeetCode 416"),
    examples: ex(1, "nums = [1,5,11,5]", "true", "{1,5,5} and {11} both sum to 11.") + ex(2, "nums = [1,2,3,5]", "false", "The total is 11, which is odd.")
  },
  "dp-knapsack::ex-target-sum": {
    task: p("Given a non-negative integer array <code>nums</code> and an integer <code>target</code>, put a <code>+</code> or <code>-</code> sign in front of every number and add them all. Return how many different sign assignments give exactly <code>target</code>.") +
      p("A hidden test has n = 30, so trying all 2³⁰ assignments is too slow.") +
      cons(["1 ≤ nums.length ≤ 30", "0 ≤ nums[i] ≤ 1000", "-1000 ≤ target ≤ 1000"]) + lc("target-sum", "LeetCode 494"),
    examples: ex(1, "nums = [1,1,1,1,1], target = 3", "5", "Exactly one number gets a minus sign, and it can be any of the 5.") + ex(2, "nums = [1], target = 1", "1")
  },
  "fast-slow::ex-cycle2": {
    task: p("Given the head of a linked list, return the <b>node</b> where a cycle begins (the node itself, not its value), or <code>null</code> if there is no cycle. Do not modify the list. Try to use O(1) extra space.") +
      p("In the tests, <code>pos</code> is the index of the node that the tail points back to (<code>-1</code> means no cycle). The node you return is converted to its index for comparison.") +
      dia("Example 1: pos = 1", "  3 → 2 → 0 → -4\n      ↑         │\n      └─────────┘") +
      cons(["0 ≤ number of nodes ≤ 10⁵", "pos is -1 or a valid index"]) + lc("linked-list-cycle-ii", "LeetCode 142"),
    examples: ex(1, "head = [3,2,0,-4], pos = 1", "node at index 1 (value 2)") + ex(2, "head = [1,2], pos = 0", "node at index 0") + ex(3, "head = [1], pos = -1", "null")
  },
  "fast-slow::ex-middle": {
    task: p("Given the head of a non-empty linked list, return its middle node. If the list has two middle nodes (even length), return the <b>second</b> one.") +
      p("The tests turn the returned node and everything after it into an array.") +
      dia("Even length: second middle", "1 → 2 → 3 → 4 → 5 → 6\n            ^   ^\n            |   └ return this (4)") +
      cons(["1 ≤ number of nodes ≤ 10⁵"]) + lc("middle-of-the-linked-list", "LeetCode 876"),
    examples: ex(1, "head = [1,2,3,4,5]", "[3,4,5]") + ex(2, "head = [1,2,3,4,5,6]", "[4,5,6]")
  },
  "fast-slow::ex-happy": {
    task: p("Start from a positive integer <code>n</code>. Repeatedly replace the number with the sum of the squares of its digits. If the process reaches <code>1</code>, the number is <b>happy</b>; if it loops forever without reaching 1, it is not.") +
      p("Return whether <code>n</code> is happy. Use Floyd's fast/slow pointers for O(1) extra space.") +
      cons(["1 ≤ n ≤ 2³¹ − 1"]) + lc("happy-number", "LeetCode 202"),
    examples: ex(1, "n = 19", "true", "1² + 9² = 82 → 8² + 2² = 68 → 6² + 8² = 100 → 1² + 0² + 0² = 1") + ex(2, "n = 2", "false", "2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → … (loop)")
  },
  "graph-bfs-dfs::ex-islands": {
    task: p("In a grid, <code>'1'</code> is land and <code>'0'</code> is water. Land cells connected <b>horizontally or vertically</b> form one island (diagonal does not count). Everything outside the grid is water. Return the number of islands.") +
      dia("Example 2: three islands (A, B, C)", "1 1 1 0 0        A A A . .\n0 0 1 0 0        . . A . .\n0 0 0 1 1   →    . . . B B\n1 0 0 1 1        C . . B B") +
      cons(["1 ≤ rows, cols ≤ 300", "grid[i][j] is '0' or '1'"]) + lc("number-of-islands", "LeetCode 200"),
    examples: ex(1, `grid = ["1100","1001","0011"]`, "2", "The top-left pair is one island; (1,3), (2,2), (2,3) form the other.") +
      ex(2, `grid = ["11100","00100","00011","10011"]`, "3")
  },
  "graph-bfs-dfs::ex-rotting": {
    task: p("Each cell of <code>grid</code> is 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, each fresh orange that is up/down/left/right of a rotten orange becomes rotten.") +
      p("Return the minimum number of minutes until no fresh orange is left, or <code>-1</code> if some orange can never rot.") +
      dia("Example 1 minute by minute", "t=0      t=1      t=2      t=3      t=4\n2 1 1    2 2 1    2 2 2    2 2 2    2 2 2\n1 1 0    2 1 0    2 2 0    2 2 0    2 2 0\n0 1 1    0 1 1    0 1 1    0 2 1    0 2 2") +
      cons(["1 ≤ rows, cols ≤ 300", "grid[i][j] is 0, 1 or 2"]) + lc("rotting-oranges", "LeetCode 994"),
    examples: ex(1, "grid = [[2,1,1],[1,1,0],[0,1,1]]", "4") +
      ex(2, "grid = [[2,1,1],[0,1,1],[1,0,1]]", "-1", "The orange in the bottom-left corner has no rotten neighbour path.") +
      ex(3, "grid = [[0,2]]", "0", "There is no fresh orange at the start.")
  },
  "graph-bfs-dfs::ex-clone-graph": {
    task: p("You are given one node of a connected undirected graph (node values are unique, 1..n, and the given node has value 1). Return a <b>deep copy</b> of the whole graph: every node must be a new object, and the neighbour structure must be identical. If the graph is empty you get <code>null</code>.") +
      p("The harness checks that the structure matches and that no original node is reused in the copy.") +
      dia("Example 1: adjacency list [[2,4],[1,3],[2,4],[1,3]]", "  1 ─── 2\n  │     │\n  4 ─── 3") +
      cons(["0 ≤ number of nodes ≤ 2000", "Node values are unique, 1..n", "No repeated edges and no self-loops"]) + lc("clone-graph", "LeetCode 133"),
    examples: ex(1, "adj = [[2,4],[1,3],[2,4],[1,3]]", "a new graph with the same 4-node square") + ex(2, "adj = [[]]", "one new node with no neighbours") + ex(3, "adj = []", "null")
  },
  "greedy::ex-jump-game": {
    task: p("You start at index 0. <code>nums[i]</code> is the <b>maximum</b> number of steps you may jump forward from index i (you may also jump fewer). Return <code>true</code> if you can reach the last index.") +
      cons(["1 ≤ nums.length ≤ 10⁵", "0 ≤ nums[i] ≤ 10⁵"]) + lc("jump-game", "LeetCode 55"),
    examples: ex(1, "nums = [2,3,1,1,4]", "true", "Jump 1 step to index 1, then 3 steps to the last index.") + ex(2, "nums = [3,2,1,0,4]", "false", "Every route lands on index 3, whose jump length is 0.")
  },
  "greedy::ex-gas-station": {
    task: p("There are n gas stations on a circular road. Station i gives you <code>gas[i]</code> fuel, and driving from station i to station i + 1 (the last one goes to station 0) costs <code>cost[i]</code>. Your tank starts empty and has no capacity limit.") +
      p("Return the index of the station from which you can drive around the whole circle once clockwise, or <code>-1</code> if no such station exists. If an answer exists it is unique.") +
      cons(["1 ≤ n ≤ 10⁵", "0 ≤ gas[i], cost[i] ≤ 10⁴"]) + lc("gas-station", "LeetCode 134"),
    examples: ex(1, "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", "3", "From 3: tank 4−1=3, +5−2=6, +1−3=4, +2−4=2, +3−5=0. Back at 3.") + ex(2, "gas = [2,3,4], cost = [3,4,3]", "-1", "Total gas 9 is less than total cost 10.")
  },
  "greedy::ex-task-scheduler": {
    task: p("<code>tasks</code> contains uppercase letters; each letter is a task that takes one time slot. Two runs of the same letter must be separated by at least <code>n</code> slots (filled with other tasks or idle). Tasks can run in any order.") +
      p("Return the minimum number of slots needed to finish all tasks.") +
      cons(["1 ≤ tasks.length ≤ 10⁵", "tasks[i] is 'A' to 'Z'", "0 ≤ n ≤ 100"]) + lc("task-scheduler", "LeetCode 621"),
    examples: ex(1, `tasks = ["A","A","A","B","B","B"], n = 2`, "8", "A B idle A B idle A B") + ex(2, `same tasks, n = 0`, "6") +
      ex(3, `tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n = 2`, "16", "A B C A D E A F G A idle idle A idle idle A")
  }
};
