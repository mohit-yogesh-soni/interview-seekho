// Module 2: DSA Patterns (outline). Har pattern lesson: pehchaan kaise karein → template → 2-3 problems with tests.
registerModule({
  id: "dsa",
  intro: "Questions ratne ke bajaye patterns seekho. Har pattern mein: kab lagta hai (signals), Java template, aur 2-3 medium problems jinke sample + hidden test cases browser mein chalte hain.",
  chapters: [
    {
      title: "Foundation",
      lessons: [
        { id: "big-o", title: "Big-O aur complexity", plan: ["Time vs space complexity", "O(1), O(log n), O(n), O(n log n), O(n²) visual comparison", "Constraints se complexity guess karna (n ≤ 10⁵ → O(n log n))", "Practice: code dekh ke complexity batao"] },
        { id: "arrays-hashing", title: "Arrays aur Hashing", plan: ["Frequency map pattern", "Problems: Two Sum, Group Anagrams, Top K Frequent Elements"] },
        { id: "recursion-basics", title: "Recursion se sochna", plan: ["Recursion tree", "Problems: Power(x, n), Generate all subsets (intro)"] }
      ]
    },
    {
      title: "Array aur String Patterns",
      lessons: [
        { id: "two-pointers", title: "Two Pointers", plan: ["Signals: sorted array, pair/triplet, in-place", "Problems: 3Sum, Container With Most Water, Sort Colors"] },
        { id: "sliding-window", title: "Sliding Window", plan: ["Fixed vs variable window template", "Problems: Longest Substring Without Repeating Characters, Minimum Size Subarray Sum, Longest Repeating Character Replacement"] },
        { id: "prefix-sum", title: "Prefix Sum", plan: ["Prefix sum + HashMap", "Problems: Subarray Sum Equals K, Product of Array Except Self, Range Sum Query 2D"] },
        { id: "intervals", title: "Intervals (Merge)", plan: ["Sort by start, then merge", "Problems: Merge Intervals, Insert Interval, Meeting Rooms II"] },
        { id: "binary-search", title: "Binary Search (aur answer pe binary search)", plan: ["Lower/upper bound template", "Problems: Search in Rotated Sorted Array, Find Peak Element, Koko Eating Bananas"] }
      ]
    },
    {
      title: "Linked List, Stack, Queue",
      lessons: [
        { id: "fast-slow", title: "Fast aur Slow Pointers", plan: ["Cycle detection (Floyd)", "Problems: Linked List Cycle II, Middle of the Linked List, Happy Number"] },
        { id: "ll-reversal", title: "Linked List In-place Reversal", plan: ["prev/curr/next template", "Problems: Reverse Linked List II, Reorder List, Remove Nth Node From End"] },
        { id: "monotonic-stack", title: "Monotonic Stack", plan: ["Next greater / smaller element template", "Problems: Daily Temperatures, Next Greater Element II, Largest Rectangle in Histogram"] },
        { id: "stack-design", title: "Stack se design", plan: ["Problems: Min Stack, Valid Parentheses, Evaluate Reverse Polish Notation"] }
      ]
    },
    {
      title: "Heap aur Greedy",
      lessons: [
        { id: "heap-topk", title: "Heap / Top K", plan: ["PriorityQueue min-heap of size k", "Problems: Kth Largest Element, K Closest Points to Origin, Find Median from Data Stream"] },
        { id: "k-way-merge", title: "K-way Merge", plan: ["Problems: Merge K Sorted Lists, Kth Smallest Element in a Sorted Matrix"] },
        { id: "greedy", title: "Greedy", plan: ["Greedy kab sahi hota hai", "Problems: Jump Game, Gas Station, Task Scheduler"] }
      ]
    },
    {
      title: "Trees",
      lessons: [
        { id: "tree-bfs", title: "Tree BFS (level order)", plan: ["Queue template", "Problems: Binary Tree Level Order Traversal, Right Side View, Zigzag Level Order"] },
        { id: "tree-dfs", title: "Tree DFS", plan: ["Pre/in/post order, return-value DFS", "Problems: Diameter of Binary Tree, Lowest Common Ancestor, Path Sum II"] },
        { id: "bst", title: "Binary Search Tree", plan: ["Problems: Validate BST, Kth Smallest in BST, Serialize/Deserialize (bonus)"] },
        { id: "trie", title: "Trie", plan: ["Problems: Implement Trie, Word Search II (intro), Design Add and Search Words"] }
      ]
    },
    {
      title: "Graphs",
      lessons: [
        { id: "graph-bfs-dfs", title: "Graph BFS/DFS aur Grid", plan: ["Adjacency list, visited", "Problems: Number of Islands, Rotting Oranges, Clone Graph"] },
        { id: "topo-sort", title: "Topological Sort", plan: ["Kahn's algorithm (BFS)", "Problems: Course Schedule, Course Schedule II, Alien Dictionary (bonus)"] },
        { id: "union-find", title: "Union Find (DSU)", plan: ["Path compression + union by rank", "Problems: Number of Provinces, Redundant Connection, Accounts Merge"] },
        { id: "shortest-path", title: "Shortest Path (Dijkstra)", plan: ["PriorityQueue Dijkstra template", "Problems: Network Delay Time, Path With Minimum Effort"] }
      ]
    },
    {
      title: "Backtracking aur DP",
      lessons: [
        { id: "backtracking", title: "Backtracking", plan: ["Choose → explore → un-choose template", "Problems: Subsets, Permutations, Combination Sum, Word Search"] },
        { id: "dp-1d", title: "DP 1D", plan: ["Recursion → memo → tabulation", "Problems: House Robber, Coin Change, Longest Increasing Subsequence"] },
        { id: "dp-2d", title: "DP 2D (grid aur strings)", plan: ["Problems: Unique Paths, Longest Common Subsequence, Edit Distance"] },
        { id: "dp-knapsack", title: "Knapsack type DP", plan: ["Problems: Partition Equal Subset Sum, Target Sum"] }
      ]
    },
    {
      title: "Extra",
      lessons: [
        { id: "bit-manipulation", title: "Bit Manipulation (basics)", plan: ["XOR tricks", "Problems: Single Number, Counting Bits"] },
        { id: "interview-approach", title: "Interview mein problem kaise solve karein", plan: ["Clarify → brute force → optimize → code → test", "Pattern pehchaan cheat-sheet", "Mixed practice: pattern guess karo"] }
      ]
    }
  ]
});
