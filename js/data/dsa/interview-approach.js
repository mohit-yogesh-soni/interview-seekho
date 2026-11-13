// Interview mein problem kaise solve karein
registerLesson("dsa", "interview-approach", {
  why: "Coding round mein sirf sahi code nahi, process bhi grade hota hai: aapne sawaal clarify kiya, brute force bola, optimize kiya, saaf code likha, aur khud test kiya. Bahut log solution jaante hue bhi reject hote hain kyunki seedha code pe kood jaate hain. Ye lesson ek repeatable framework aur pattern pehchaanne ki practice deta hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>45 minute ka round: 5 steps</h2>
        <table>
          <tr><th>Step</th><th>Kya karna hai</th><th>Time (approx)</th></tr>
          <tr><td><b>1. Clarify</b></td><td>Input/output, constraints (n kitna bada?), edge cases (empty, duplicates, negative), ek example khud chala ke dikhao</td><td>3-5 min</td></tr>
          <tr><td><b>2. Brute force</b></td><td>Sabse seedha solution aur uski complexity bolo. Code mat karo (jab tak interviewer na bole)</td><td>2-3 min</td></tr>
          <tr><td><b>3. Optimize</b></td><td>Bottleneck pehchaano ("har pair check kar raha hoon"), pattern lagao, nayi complexity bolo. Interviewer se confirm: "Is approach se code karoon?"</td><td>5-10 min</td></tr>
          <tr><td><b>4. Code</b></td><td>Saaf naam, chhote helper functions, bolte bolte likho</td><td>15-20 min</td></tr>
          <tr><td><b>5. Test</b></td><td>Example ko code pe haath se chalao, phir edge cases. Bug khud pakdo</td><td>5 min</td></tr>
        </table>
        <h2>Constraints se complexity guess karo</h2>
        <table>
          <tr><th>n (approx)</th><th>Chalega</th><th>Socho</th></tr>
          <tr><td>≤ 10-12</td><td>O(n!), O(2ⁿ · n)</td><td>Backtracking, permutations</td></tr>
          <tr><td>≤ 20-25</td><td>O(2ⁿ)</td><td>Subsets, bitmask</td></tr>
          <tr><td>≤ 500</td><td>O(n³)</td><td>3 nested loops, interval DP</td></tr>
          <tr><td>≤ 5,000</td><td>O(n²)</td><td>2D DP, har pair</td></tr>
          <tr><td>≤ 10⁵ - 10⁶</td><td>O(n log n), O(n)</td><td>Sort, heap, binary search, two pointers, hashing, sliding window</td></tr>
          <tr><td>≥ 10⁹</td><td>O(log n), O(1)</td><td>Binary search on answer, math</td></tr>
        </table>
        <p>Rule of thumb: ek second mein approx 10⁸ simple operations. Ye exact nahi hai, par direction sahi deta hai.</p>`
    },
    {
      type: "order",
      id: "order-framework",
      q: "Interview mein in steps ko sahi order mein lagao:",
      items: [
        "Sawaal clarify karo: input size, edge cases, ek example",
        "Brute force approach aur uski complexity bolo",
        "Bottleneck pehchaan ke pattern se optimize karo, complexity bolo",
        "Interviewer se approach confirm karo",
        "Code likho, bolte hue",
        "Example aur edge cases pe dry run karke test karo"
      ],
      why: "Clarify sabse pehle, kyunki galat sawaal ka sahi answer bhi fail hai. Code likhne se pehle approach confirm karna 10 minute bachata hai agar interviewer kuch aur sun-na chahta tha."
    },
    {
      type: "think",
      id: "think-clarify",
      q: "Interviewer kehta hai: <b>\"Ek array mein do numbers dhoondho jinka sum target ho.\"</b> Code se pehle aap kaunse clarifying questions poochoge? Kam se kam 4.",
      rubric: [
        { point: "Array <b>sorted</b> hai kya? (two pointers vs hashing)", keys: ["sorted", "sort"], weight: 2 },
        { point: "<b>Duplicates</b> / same element do baar use kar sakte hain?", keys: ["duplicate", "same element", "same index", "do baar", "twice"] },
        { point: "Return kya karna hai: <b>indices ya values</b>? Kai pairs hon to?", keys: ["index", "indices", "values", "return", "all pairs", "kai pair", "multiple"], weight: 2 },
        { point: "Koi pair na mile to kya? <b>Empty / null / -1</b>?", keys: ["na mile", "not found", "no pair", "empty", "-1", "null", "exist"] },
        { point: "<b>Size / range</b>: n kitna, negative numbers, overflow?", keys: ["size", "constraint", "negative", "overflow", "range", "kitna bada", "10^5"] }
      ],
      answer: `<ul>
          <li><b>Sorted hai?</b> Haan → two pointers O(n), O(1) space. Nahi → HashMap O(n) space.</li>
          <li><b>Kya return karna hai?</b> Indices ya values? Ek pair ya saare pairs?</li>
          <li><b>Duplicates?</b> Same element do baar use kar sakte hain kya?</li>
          <li><b>Pair na mile to?</b> Empty array, -1, ya exception?</li>
          <li><b>Constraints:</b> n kitna (10³ pe O(n²) bhi theek), values negative ho sakti hain, sum int overflow kar sakta hai?</li>
        </ul>
        <p>Ye sawaal sun ke interviewer samajh jaata hai ki aap real-world engineer ki tarah requirements nikaalte ho. Aksar inke answers se hi pattern decide hota hai.</p>`
    },
    {
      type: "steps",
      title: "Mock walkthrough: \"Longest substring bina repeating characters\"",
      steps: [
        { title: "1. Clarify", html: `<p><b>Aap:</b> "Characters sirf lowercase hain ya koi bhi ASCII? Empty string pe 0? Length chahiye ya substring khud?"</p><p><b>Interviewer:</b> "Koi bhi ASCII, sirf length, empty pe 0."</p><p>Example khud chalao: "abcabcbb" → "abc" → 3.</p>` },
        { title: "2. Brute force", html: `<p>"Har start i, har end j, check karo substring mein repeat hai kya. O(n²) substrings × O(n) check = <b>O(n³)</b>. Set rakh ke check O(1) karoon to O(n²)."</p>` },
        { title: "3. Optimize", html: `<p>"Bottleneck: har naye start pe dobara se scan. Contiguous substring + condition → <b>sliding window</b>. Right badhao; repeat aaye to left ko us character ke last index + 1 tak le jao. Har character ek baar andar, ek baar bahar: <b>O(n)</b> time, O(charset) space. Isse code karoon?"</p>` },
        { title: "4. Code (bolte hue)", html: `<pre class="code-static">int best = 0, left = 0;
Map&lt;Character, Integer&gt; last = new HashMap&lt;&gt;();
for (int right = 0; right &lt; s.length(); right++) {
    char c = s.charAt(right);
    if (last.containsKey(c) &amp;&amp; last.get(c) &gt;= left) left = last.get(c) + 1;
    last.put(c, right);
    best = Math.max(best, right - left + 1);
}
return best;</pre>` },
        { title: "5. Test", html: `<p>"abba" chalao: right=2 ('b') → left = 2. right=3 ('a'): last['a'] = 0 &lt; left, to left nahi hilega. Isi liye <code>&gt;= left</code> check zaroori hai. Edge: "" → 0, "aaaa" → 1. Done.</p><p>Interviewer ne poora soch-process dekha, sirf final code nahi.</p>` }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Pattern pehchaan cheat-sheet</h2>
        <table>
          <tr><th>Problem mein ye dikhe</th><th>Pattern socho</th></tr>
          <tr><td>Sorted array, pair/triplet with sum, in-place</td><td>Two Pointers</td></tr>
          <tr><td>Contiguous subarray/substring, "longest/shortest with condition"</td><td>Sliding Window</td></tr>
          <tr><td>Subarray sum = k, range sum queries</td><td>Prefix Sum + HashMap</td></tr>
          <tr><td>"Kya pehle dekha hai?", frequency, anagram</td><td>HashMap / HashSet</td></tr>
          <tr><td>Sorted / monotonic answer space, "minimum max", n ya value 10⁹</td><td>Binary Search (on answer)</td></tr>
          <tr><td>Overlapping intervals, meetings</td><td>Sort + Merge Intervals</td></tr>
          <tr><td>Linked list cycle / middle</td><td>Fast &amp; Slow Pointers</td></tr>
          <tr><td>Next greater/smaller, histogram</td><td>Monotonic Stack</td></tr>
          <tr><td>Top K, Kth largest, running median, k sorted lists</td><td>Heap</td></tr>
          <tr><td>Level, minimum steps (unweighted), spreading</td><td>BFS</td></tr>
          <tr><td>Saare paths, subtree property, connected components</td><td>DFS</td></tr>
          <tr><td>Dependencies, prerequisites, order</td><td>Topological Sort</td></tr>
          <tr><td>Groups merge karna, dynamic connectivity, cycle (undirected)</td><td>Union Find</td></tr>
          <tr><td>Weighted shortest path (non-negative)</td><td>Dijkstra</td></tr>
          <tr><td>Prefix, autocomplete, words dictionary</td><td>Trie</td></tr>
          <tr><td>"All combinations/permutations", n ≤ 15</td><td>Backtracking</td></tr>
          <tr><td>Min/max/count ways, choices, overlapping subproblems</td><td>Dynamic Programming</td></tr>
          <tr><td>Lo ya chhodo + target sum</td><td>0/1 Knapsack DP</td></tr>
          <tr><td>Local best choice ka proof ho (sort by end time, max reach)</td><td>Greedy</td></tr>
          <tr><td>"Ek baar aata hai baaki do baar", O(1) space</td><td>Bit Manipulation (XOR)</td></tr>
        </table>
        <p>Neeche ke sawaalon mein sirf problem padh ke pattern pehchaano. Pehle khud socho, phir option chuno.</p>`
    },
    {
      type: "quiz",
      q: "<b>Scenario 1:</b> Ola driver ki din bhar ki earnings ka array hai (negative bhi, jaise fuel cost). Kitne <b>contiguous</b> time periods ka total exactly ₹ k hai?",
      options: ["Sliding Window", "Prefix Sum + HashMap", "Two Pointers on sorted array", "Heap"],
      answer: 1,
      why: "Negative values hain, isliye sliding window kaam nahi karta (window shrink karne se sum ka monotonic behaviour nahi). Prefix sum + HashMap of counts: O(n). (Subarray Sum Equals K.)"
    },
    {
      type: "quiz",
      q: "<b>Scenario 2:</b> Ek string mein sabse lambi substring chahiye jisme <b>at most 2 alag characters</b> hon.",
      options: ["Dynamic Programming", "Backtracking", "Sliding Window (variable size) + count map", "Binary Search"],
      answer: 2,
      why: "Contiguous + \"longest with condition\" = variable sliding window. Right badhao, distinct &gt; 2 ho to left sikodo. O(n)."
    },
    {
      type: "quiz",
      q: "<b>Scenario 3:</b> 10 lakh search queries ke log se <b>sabse zyada search hue 10 dishes</b> chahiye.",
      options: ["Poora sort by frequency, O(n log n) zaroori hai", "HashMap counts + size-10 min-heap", "Trie", "Union Find"],
      answer: 1,
      why: "Pehle HashMap se frequency (O(n)), phir unique dishes pe size-k min-heap: O(u log k). Bucket sort bhi O(n) deta hai. (Top K Frequent Elements.)"
    },
    {
      type: "quiz",
      q: "<b>Scenario 4:</b> Microservices ki list hai aur \"A start hone se pehle B chalna chahiye\" jaise rules. Startup order chahiye, aur cycle ho to error.",
      options: ["Dijkstra", "Topological Sort (Kahn's)", "Union Find", "Binary Search"],
      answer: 1,
      why: "Dependencies + order + cycle detection = topological sort. Kahn's mein processed count &lt; n matlab cycle."
    },
    {
      type: "quiz",
      q: "<b>Scenario 5:</b> Koko jaisa: n piles of bananas, h ghante. Minimum speed (bananas/hour) chahiye jisse sab khatam ho. Piles ka size 10⁹ tak.",
      options: ["Greedy: sabse badi pile ki speed", "Binary Search on answer (speed)", "DP", "Heap"],
      answer: 1,
      why: "Speed badhane se ghante kam hi hote hain (monotonic). Speed 1..max(pile) pe binary search, har mid pe O(n) check: O(n log max)."
    },
    {
      type: "quiz",
      q: "<b>Scenario 6:</b> Metro map: stations aur unke beech travel time (minutes, positive). Rajiv Chowk se har station ka minimum time.",
      options: ["BFS", "Dijkstra", "DFS", "Topological sort"],
      answer: 1,
      why: "Weighted edges (alag alag minutes), non-negative → Dijkstra O(E log V). BFS sirf tab jab har edge ka weight same ho."
    },
    {
      type: "quiz",
      q: "<b>Scenario 7:</b> Social network mein \"friend of friend\" connections ek ek karke add ho rahe hain, aur beech beech mein poocha jaata hai \"A aur B same circle mein hain?\"",
      options: ["Har query pe BFS", "Union Find (DSU)", "Trie", "Sliding Window"],
      answer: 1,
      why: "Edges dheere dheere aate hain + connectivity queries = DSU, har operation ~O(α(n)). Har query pe BFS O(V + E) hoga."
    },
    {
      type: "quiz",
      q: "<b>Scenario 8:</b> Har din ka temperature array; har din ke liye batao kitne din baad pehli baar zyada garmi hogi.",
      options: ["Monotonic Stack", "Heap", "Prefix Sum", "Two Pointers"],
      answer: 0,
      why: "\"Next greater element\" = monotonic decreasing stack, O(n). (Daily Temperatures.)"
    },
    {
      type: "quiz",
      q: "<b>Scenario 9:</b> n ≤ 12 dishes mein se saare combinations chahiye jinka total price exactly ₹ 500 ho (har dish max ek baar).",
      options: ["Sliding Window", "Backtracking (choose/skip) ya bitmask", "Dijkstra", "Greedy: mehngi dish pehle"],
      answer: 1,
      why: "\"Saare combinations\" output chahiye aur n chhota hai → backtracking (2¹² = 4096 subsets). Agar sirf ginti ya possible/not chahiye hota to knapsack DP."
    },
    {
      type: "quiz",
      q: "<b>Scenario 10:</b> Do strings: user ne \"biryni\" type kiya. Dictionary ke har word se minimum kitne edits (insert/delete/replace) ka farak hai, taaki \"did you mean?\" dikha sakein.",
      options: ["Two Pointers", "Edit Distance (2D DP)", "Trie only", "Hashing"],
      answer: 1,
      why: "Do strings ka minimum edit cost = Edit Distance DP, O(m·n) per word. Bade dictionary pe Trie + DP ya BK-tree jaise structures aage ke optimizations hain."
    },
    {
      type: "quiz",
      q: "<b>Scenario 11:</b> Linked list mein loop hai ya nahi, aur hai to loop kahan se shuru hota hai, O(1) extra space mein.",
      options: ["HashSet of visited nodes", "Fast & Slow pointers (Floyd)", "Recursion", "Sort the list"],
      answer: 1,
      why: "O(1) space ki shart HashSet ko hata deti hai. Floyd: fast 2 step, slow 1 step; milne ke baad ek pointer head pe, dono 1 step, jahan milein wahi loop start."
    },
    {
      type: "quiz",
      q: "<b>Scenario 12:</b> Calendar app: saari meetings ke [start, end] diye hain. Minimum kitne meeting rooms chahiye?",
      options: ["Sort by start + min-heap of end times", "Trie", "Union Find", "Bit manipulation"],
      answer: 0,
      why: "Meetings start time se sort, heap mein ongoing meetings ke end times. Naya start ≥ heap top ho to room free (poll). Heap ka max size = rooms. O(n log n). (Meeting Rooms II; sweep line bhi chalta hai.)"
    },
    {
      type: "pick",
      id: "pick-signals-dp",
      q: "Kaunse signals <b>Dynamic Programming</b> ki taraf ishara karte hain? (sab select karo)",
      options: [
        { text: "\"Kitne tareekon se\" (count ways) pucha hai", correct: true, why: "Count ways aksar overlapping subproblems hote hain (climbing stairs, coin change ways)." },
        { text: "Har step pe choice hai aur greedy ka counter-example mil gaya", correct: true, why: "Greedy fail + choices = saare options ka best chahiye, wahi DP hai." },
        { text: "Output mein saare combinations print karne hain", correct: false, why: "Saare combinations ka output khud exponential hai; ye backtracking hai. DP tab jab sirf count/min/max chahiye." },
        { text: "Recursion tree mein same arguments wale calls baar baar aa rahe hain", correct: true, why: "Yahi overlapping subproblems hai; memo lagao." },
        { text: "Sorted array mein ek target dhoondhna hai", correct: false, why: "Ye binary search hai, O(log n)." },
        { text: "Weighted graph mein shortest path (non-negative)", correct: false, why: "Dijkstra (greedy + heap). Technically DP jaisa relaxation hai, par interview mein pattern Dijkstra hi bolo." }
      ],
      answer: "DP signals: count/min/max, choices, overlapping subproblems, aur greedy ka toot-na. Saare outputs chahiye ho to backtracking."
    },
    {
      type: "pick",
      id: "pick-bfs",
      q: "Kahan <b>BFS</b> (DFS nahi) sahi choice hai? (sab select karo)",
      options: [
        { text: "Grid mein start se end tak minimum steps, har step cost 1", correct: true, why: "Unweighted shortest path = BFS; pehli baar jab end mile wahi minimum." },
        { text: "Rotting oranges / fire spread: kitne minute mein sab", correct: true, why: "Multi-source BFS, har level = ek minute." },
        { text: "Tree ki har level ka average", correct: true, why: "Level order = BFS with level size." },
        { text: "Grid mein saare islands ki ginti", correct: false, why: "BFS bhi chalega, par ye pure connected components hai; DFS/BFS/DSU teeno barabar. \"BFS zaroori\" nahi." },
        { text: "Root se leaf tak saare paths jinka sum target ho", correct: false, why: "Saare paths + backtracking = DFS." }
      ],
      answer: "BFS jab \"minimum steps\" ya \"level/minute\" ka sawaal ho (unweighted). Paths, subtree properties, aur components ke liye DFS natural hai."
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galtiyan:</b> (1) bina clarify kiye code shuru. (2) Chup chaap 5 minute sochna; bolte hue socho, interviewer hint de sakta hai. (3) Brute force skip karna; usse hi optimization ki direction milti hai. (4) Code ke baad test na karna; interviewer ka pehla test case hi bug pakad leta hai."
    },
    {
      type: "think",
      id: "think-stuck",
      q: "Aap optimize karte waqt <b>atak gaye</b> ho, 3-4 minute se kuch nahi soojh raha. Kya karoge? Interviewer ko kya bologe?",
      rubric: [
        { point: "Jo soch rahe ho <b>bolte raho</b> (silence nahi)", keys: ["bolo", "bolte", "think aloud", "loud", "explain", "communicate", "chup nahi"], weight: 2 },
        { point: "<b>Brute force</b> pe wapas jao aur <b>bottleneck</b> dhoondho", keys: ["brute", "bottleneck", "repeat kaam", "redundant", "baar baar"], weight: 2 },
        { point: "Chhota <b>example haath se</b> solve karo, pattern dekho", keys: ["example", "haath se", "by hand", "chhota input", "draw", "dry run"] },
        { point: "Pattern list mentally chalao (sort? hash? two pointers? heap?)", keys: ["pattern", "sort", "hash", "data structure", "cheat"] },
        { point: "Zaroorat ho to <b>brute force code</b> kar do (kuch working > kuch nahi)", keys: ["code brute", "working", "pehle brute", "kuch nahi se", "partial"] }
      ],
      answer: `<p>Chup mat raho. Bolo: "Brute force O(n²) hai kyunki har element ke liye baaki sab scan kar raha hoon. Mujhe ye repeat scan hatana hai." Ye sun ke interviewer aksar hint deta hai, aur hint lena minus nahi hai, chup rehna hai.</p>
        <p>Phir: chhota example haath se solve karo aur dekho aapka dimaag kya shortcut le raha hai. Cheat-sheet mentally chalao: sort karne se fayda? HashMap se lookup O(1)? Window? Heap? Agar time khatam ho raha ho to brute force code kar do aur optimization verbally batao; working code + sahi analysis bhi partial credit deta hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Har problem ke end mein khud bolo: \"Time O(...), space O(...), aur agar input 100 guna bada ho ya stream mein aaye to main X badlunga.\" Ye ek line follow-up ka jawab pehle hi de deti hai aur senior engineer jaisa lagta hai."
    }
  ],
  references: [
    { title: "Hello Interview: coding interview guide", by: "Hello Interview", url: "https://www.hellointerview.com/learn/code", type: "course" },
    { title: "NeetCode roadmap (pattern-wise problems)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" },
    { title: "Striver A2Z DSA sheet", by: "takeUforward", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "course" },
    { title: "Longest Substring Without Repeating Characters", by: "LeetCode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", type: "article" }
  ]
});
