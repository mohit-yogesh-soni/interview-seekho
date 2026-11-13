// Trie
registerLesson("dsa", "trie", {
  why: "Search box ka autocomplete (Swiggy pe \"bir\" likhte hi \"biryani\"), spell check, aur bahut saare words ek saath grid mein dhoondhna: ye sab Trie se hota hai. \"Implement Trie\" aur \"Add and Search Words\" design-style coding rounds mein common hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Trie (prefix tree) kya hai?</h2>
        <p>Trie ek tree hai jisme har edge ek <b>character</b> hai. Root se kisi node tak ka raasta ek <b>prefix</b> hai. Jis node pe koi poora word khatam hota hai, us pe <code>isEnd = true</code> ka nishaan.</p>
        <pre class="diagram">
words: cat, car, cart, dog

          (root)
          /    \\
         c      d
         |      |
         a      o
        / \\     |
      t*   r*   g*
           |
           t*          * = isEnd (yahan word khatam)
</pre>
        <p>"car" aur "cart" ka prefix "car" ek hi baar store hua. <b>Search / insert ka time O(L)</b>, L = word ki length. Kitne bhi words hon, farak nahi padta.</p>
        <h2>HashSet se kyun behtar?</h2>
        <table>
          <tr><th>Sawaal</th><th>HashSet&lt;String&gt;</th><th>Trie</th></tr>
          <tr><td>Exact word hai?</td><td>O(L) (hash nikaalna)</td><td>O(L)</td></tr>
          <tr><td>Koi word is prefix se shuru hota hai?</td><td>Saare words check: O(N · L)</td><td><b>O(L)</b></td></tr>
          <tr><td>Wildcard ('.') search</td><td>Saare words</td><td>Sirf matching branches</td></tr>
          <tr><td>Memory</td><td>Kam</td><td>Zyada (har node mein 26 pointers)</td></tr>
        </table>
        <h2>Signals</h2>
        <ul>
          <li>"prefix", "starts with", "autocomplete", "dictionary of words"</li>
          <li>Bahut saare words ek saath ek grid/text mein dhoondhne hain</li>
          <li>Wildcard matching with a dictionary</li>
          <li>Max XOR of two numbers (bits ka trie, advanced)</li>
        </ul>`
    },
    {
      type: "code",
      title: "Template: TrieNode with children[26] + isEnd",
      code: `public class Main {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    static TrieNode root = new TrieNode();

    static void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;
    }

    // prefix ke end wala node, ya null agar raasta hi nahi hai
    static TrieNode walk(String s) {
        TrieNode node = root;
        for (char c : s.toCharArray()) {
            node = node.children[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }

    public static void main(String[] args) {
        for (String w : new String[]{"cat", "car", "cart", "dog"}) insert(w);
        TrieNode n = walk("car");
        System.out.println("search car:  " + (n != null && n.isEnd));
        n = walk("ca");
        System.out.println("search ca:   " + (n != null && n.isEnd));   // prefix hai, word nahi
        System.out.println("prefix ca:   " + (walk("ca") != null));
        System.out.println("prefix cow:  " + (walk("cow") != null));
    }
}`,
      note: "Sirf lowercase a-z ho to <code>TrieNode[26]</code> array fast hai. Unicode/bade alphabet ho to <code>HashMap&lt;Character, TrieNode&gt;</code> lo."
    },
    {
      type: "steps",
      title: "Insert dry run: \"cat\", phir \"car\", phir search \"ca\"",
      steps: [
        { title: "Insert \"cat\": teen naye nodes", html: `<pre class="diagram">(root)
  |
  c      ← naya
  |
  a      ← naya
  |
  t*     ← naya, isEnd = true</pre>` },
        { title: "Insert \"car\": c, a pehle se hain, sirf r naya", html: `<pre class="diagram">(root)
  |
  c      ← reuse
  |
  a      ← reuse
 / \\
t*  r*   ← r naya, isEnd = true</pre><p>Common prefix share hota hai, isliye memory bachti hai.</p>` },
        { title: "search(\"ca\"): raasta mila, par isEnd false", html: `<pre class="diagram">(root)
  |
 [c]
  |
 [a]     ← yahan ruke. isEnd = false
 / \\
t*  r*</pre><p><code>search("ca")</code> = <b>false</b> (koi word "ca" insert nahi hua). <code>startsWith("ca")</code> = <b>true</b> (raasta exist karta hai). Bas yahi farak hai dono methods mein.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-trie-impl",
      q: "<b>Implement Trie:</b> <code>insert(word)</code>, <code>search(word)</code> (poora word insert hua tha?), <code>startsWith(prefix)</code> (koi word is prefix se shuru hota hai?). Node mein kya rakhoge, aur search aur startsWith mein kya farak hai?",
      rubric: [
        { point: "Node: <b>children array (26) ya map</b> + <b>isEnd flag</b>", keys: ["children", "26", "array", "hashmap", "isend", "is_end", "end flag", "endofword"], weight: 2 },
        { point: "Insert: har char ke liye child banao agar null, end pe isEnd = true", keys: ["insert", "new node", "naya node", "null ho to", "create"] },
        { point: "search ko end node pe <b>isEnd true</b> chahiye; startsWith ko sirf <b>raasta</b>", keys: ["isend true", "isend", "raasta", "path exist", "node != null", "sirf prefix"], weight: 2 },
        { point: "Har operation O(L)", keys: ["o(l)", "o(length)", "length", "o(m)"] }
      ],
      answer: `<p>Node = <code>TrieNode[26] children</code> + <code>boolean isEnd</code>. Insert: root se har character ke liye child pe jao (null ho to banao), end pe <code>isEnd = true</code>.</p>
        <p>Ek common helper <code>walk(s)</code> jo string ke end wala node de (ya null). <code>search = walk(w) != null &amp;&amp; walk(w).isEnd</code>, <code>startsWith = walk(p) != null</code>. Har operation O(L) time; space O(total characters × 26) worst case.</p>`
    },
    {
      type: "exercise",
      id: "ex-implement-trie",
      title: "Implement Trie (Prefix Tree)",
      level: "Medium",
      task: `<p>Implement a <code>Trie</code> (prefix tree) for lowercase words a-z:</p><ul><li><code>insert(String word)</code></li><li><code>search(String word)</code>: was this exact word inserted?</li><li><code>startsWith(String prefix)</code>: does any inserted word start with this prefix?</li></ul><p>The harness runs a sequence of operations and compares the list of all search/startsWith answers.</p><p class="small muted">After inserting apple and app (* = end of a word)</p><pre class="diagram">root
 └ a
   └ p
     └ p*
       └ l
         └ e*</pre><h4>Constraints</h4><ul><li>Only lowercase a-z</li><li>Up to ~4 · 10⁴ calls</li></ul><p><a href="https://leetcode.com/problems/implement-trie-prefix-tree/" target="_blank">LeetCode 208</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")
Output: true, false, true, true</pre></div>`,
      userFile: "Solution.java",
      starter: `class Trie {
    Trie() {
    }

    void insert(String word) {
    }

    boolean search(String word) {
        return false;
    }

    boolean startsWith(String prefix) {
        return false;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    // ops: "i" = insert, "s" = search, "p" = startsWith
    static List<Boolean> run(String[] ops, String[] args) {
        Trie t = new Trie();
        List<Boolean> out = new ArrayList<>();
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("i")) t.insert(args[i]);
            else if (ops[i].equals("s")) out.add(t.search(args[i]));
            else out.add(t.startsWith(args[i]));
        }
        return out;
    }

    static long seed = 12345;
    static String randWord() {
        seed = seed * 6364136223846793005L + 1442695040888963407L;
        int len = 3 + (int) ((seed >>> 40) % 6);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) {
            seed = seed * 6364136223846793005L + 1442695040888963407L;
            sb.append((char) ('a' + (int) ((seed >>> 33) % 5)));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        Check.eq("apple example", List.of(true, false, true, true),
            () -> run(new String[]{"i", "s", "s", "p", "i", "s"}, new String[]{"apple", "apple", "app", "app", "app", "app"}));
        Check.eq("alag branches", List.of(true, true, false, true),
            () -> run(new String[]{"i", "i", "s", "s", "p", "p"}, new String[]{"cat", "dog", "cat", "dog", "cow", "do"}));
        Check.hiddenFromHere();
        Check.eq("khaali trie", List.of(false, false), () -> run(new String[]{"s", "p"}, new String[]{"a", "a"}));
        Check.eq("lamba word ka prefix word nahi", List.of(false, true, false), () -> run(new String[]{"i", "s", "p", "s"}, new String[]{"interview", "inter", "inter", "interviews"}));
        Check.eq("same word do baar", List.of(true, true), () -> run(new String[]{"i", "i", "s", "p"}, new String[]{"ab", "ab", "ab", "a"}));
        Check.eq("single char", List.of(true, false, true), () -> run(new String[]{"i", "s", "s", "p"}, new String[]{"z", "z", "zz", "z"}));
        int n = 40000;
        String[] ops = new String[n], arg = new String[n];
        Set<String> words = new HashSet<>(), prefixes = new HashSet<>();
        List<Boolean> expected = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String w = randWord();
            arg[i] = w;
            if (i % 2 == 0) {
                ops[i] = "i";
                words.add(w);
                for (int j = 1; j <= w.length(); j++) prefixes.add(w.substring(0, j));
            } else if (i % 4 == 1) {
                ops[i] = "s";
                expected.add(words.contains(w));
            } else {
                ops[i] = "p";
                expected.add(prefixes.contains(w));
            }
        }
        Check.eq("bada: 20000 inserts + 20000 queries", expected, () -> run(ops, arg));
    }
}`,
      hints: [
        "Trie ke andar ek <code>static class Node { Node[] next = new Node[26]; boolean end; }</code> aur ek <code>root</code>.",
        "Helper <code>Node walk(String s)</code>: har char pe <code>node = node.next[c - 'a']</code>, null aaye to null return.",
        "<code>search</code>: <code>n != null &amp;&amp; n.end</code>. <code>startsWith</code>: <code>n != null</code>."
      ],
      solution: `class Trie {
    private static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    Trie() {
    }

    void insert(String word) {
        Node node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.next[c] == null) node.next[c] = new Node();
            node = node.next[c];
        }
        node.end = true;
    }

    boolean search(String word) {
        Node n = walk(word);
        return n != null && n.end;
    }

    boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node node = root;
        for (int i = 0; i < s.length() && node != null; i++) node = node.next[s.charAt(i) - 'a'];
        return node;
    }
}`,
      explain: "<p><b>Approach:</b> children array + end flag. Search aur startsWith dono same walk use karte hain; farak sirf end flag ka hai.</p><p><b>Time:</b> har operation O(L). <b>Space:</b> O(total chars × 26) worst case.</p>"
    },
    {
      type: "think",
      id: "think-wildcard",
      q: "<b>Design Add and Search Words:</b> <code>addWord(word)</code> aur <code>search(pattern)</code> jahan pattern mein <code>.</code> kisi bhi ek letter se match karta hai. Trie mein '.' kaise handle karoge? Worst case time?",
      rubric: [
        { point: "Normal letter → us child pe jao; <b>'.' → saare non-null children try</b> karo", keys: ["saare children", "all children", "har child", "26", "every child", "loop"], weight: 2 },
        { point: "Ye <b>DFS / recursion</b> (index + node) hai", keys: ["dfs", "recursion", "recursive", "backtrack", "index"], weight: 2 },
        { point: "Pattern ke end pe <b>isEnd</b> check", keys: ["isend", "end", "word khatam"] },
        { point: "Worst case: dots zyada hon to O(26^dots × L); bina dot O(L)", keys: ["26^", "exponential", "o(l)", "worst"] }
      ],
      answer: `<p>Insert normal Trie jaisa. Search recursive: <code>dfs(node, i)</code>. Agar <code>i == pattern.length()</code> → <code>node.isEnd</code>. Letter ho → us child pe (null to false). <code>'.'</code> ho → har non-null child pe <code>dfs(child, i + 1)</code>, koi ek true de to true.</p>
        <p>Bina dots: O(L). Dots ke saath worst case har dot pe 26 branches, par asal mein sirf existing children pe jaate hain, isliye practical mein kaafi fast hai.</p>`
    },
    {
      type: "exercise",
      id: "ex-word-dictionary",
      title: "Design Add and Search Words Data Structure",
      level: "Medium",
      task: `<p>Implement <code>WordDictionary</code>:</p><ul><li><code>addWord(String word)</code> adds a lowercase word.</li><li><code>search(String pattern)</code> returns whether any added word matches the whole pattern. A <code>.</code> in the pattern matches any single letter.</li></ul><h4>Constraints</h4><ul><li>Words and patterns use lowercase a-z; patterns may also contain dots</li><li>Up to ~5000 words and searches</li></ul><p><a href="https://leetcode.com/problems/design-add-and-search-words-data-structure/" target="_blank">LeetCode 211</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  addWord("bad"), addWord("dad"), addWord("mad"), search("pad"), search("bad"), search(".ad"), search("b..")
Output: false, true, true, true</pre></div>`,
      userFile: "Solution.java",
      starter: `class WordDictionary {
    WordDictionary() {
    }

    void addWord(String word) {
    }

    boolean search(String word) {
        return false;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<Boolean> run(String[] adds, String[] queries) {
        WordDictionary d = new WordDictionary();
        for (String w : adds) d.addWord(w);
        List<Boolean> out = new ArrayList<>();
        for (String q : queries) out.add(d.search(q));
        return out;
    }

    static boolean matches(String w, String p) {
        if (w.length() != p.length()) return false;
        for (int i = 0; i < w.length(); i++) if (p.charAt(i) != '.' && p.charAt(i) != w.charAt(i)) return false;
        return true;
    }

    static long seed = 777;
    static int next(int bound) {
        seed = seed * 6364136223846793005L + 1442695040888963407L;
        return (int) ((seed >>> 33) % bound);
    }

    public static void main(String[] args) {
        Check.eq("bad, dad, mad", List.of(false, true, true, true),
            () -> run(new String[]{"bad", "dad", "mad"}, new String[]{"pad", "bad", ".ad", "b.."}));
        Check.eq("length match zaroori", List.of(false, false, true),
            () -> run(new String[]{"chai"}, new String[]{"cha", "chai.", "...."}));
        Check.hiddenFromHere();
        Check.eq("khaali dictionary", List.of(false, false), () -> run(new String[]{}, new String[]{".", "a"}));
        Check.eq("single letter + dot", List.of(true, false, true), () -> run(new String[]{"a"}, new String[]{".", "..", "a"}));
        Check.eq("prefix word nahi hai", List.of(false, true), () -> run(new String[]{"dosa"}, new String[]{"dos", "d..a"}));
        Check.eq("saare dots, alag lengths", List.of(true, true, false), () -> run(new String[]{"ab", "abc"}, new String[]{"..", "...", "...."}));
        int nw = 5000, nq = 3000;
        String[] adds = new String[nw];
        for (int i = 0; i < nw; i++) {
            int len = 4 + next(4);
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < len; j++) sb.append((char) ('a' + next(3)));
            adds[i] = sb.toString();
        }
        String[] queries = new String[nq];
        for (int i = 0; i < nq; i++) {
            int len = 4 + next(4);
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < len; j++) sb.append(next(3) == 0 ? '.' : (char) ('a' + next(4)));
            queries[i] = sb.toString();
        }
        List<Boolean> expected = new ArrayList<>();
        for (String q : queries) {
            boolean ok = false;
            for (String w : adds) if (matches(w, q)) { ok = true; break; }
            expected.add(ok);
        }
        Check.eq("bada: 5000 words, 3000 patterns", expected, () -> run(adds, queries));
    }
}`,
      hints: [
        "Trie banao (Implement Trie jaisa). <code>search</code> ke liye recursive helper <code>dfs(Node node, String p, int i)</code>.",
        "<code>i == p.length()</code> → <code>return node.end;</code>. Letter ho to us child pe jao.",
        "<code>'.'</code> ho to: <code>for (Node child : node.next) if (child != null &amp;&amp; dfs(child, p, i + 1)) return true;</code>"
      ],
      solution: `class WordDictionary {
    private static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    WordDictionary() {
    }

    void addWord(String word) {
        Node node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.next[c] == null) node.next[c] = new Node();
            node = node.next[c];
        }
        node.end = true;
    }

    boolean search(String word) {
        return dfs(root, word, 0);
    }

    private boolean dfs(Node node, String p, int i) {
        if (i == p.length()) return node.end;
        char c = p.charAt(i);
        if (c == '.') {
            for (Node child : node.next) {
                if (child != null && dfs(child, p, i + 1)) return true;
            }
            return false;
        }
        Node child = node.next[c - 'a'];
        return child != null && dfs(child, p, i + 1);
    }
}`,
      explain: "<p><b>Approach:</b> Trie + DFS. Letter pe ek branch, dot pe saari existing branches.</p><p><b>Time:</b> addWord O(L); search bina dot O(L), dots ke saath worst case O(26^d · L). <b>Space:</b> O(total chars × 26).</p>"
    },
    {
      type: "text",
      html: `
        <h2>Intro: Word Search II (Trie + grid backtracking)</h2>
        <p><b>Problem (apne shabdon mein):</b> letters ka ek grid hai aur words ki list. Batao kaunse words grid mein bante hain, jahan word ke letters <b>adjacent cells</b> (up/down/left/right) se aate hain aur ek word mein ek cell dobara use nahi hota. <a href="https://leetcode.com/problems/word-search-ii/" target="_blank">LeetCode 212</a></p>
        <p><b>Naive:</b> har word ke liye alag se grid pe Word Search (backtracking) chalao. W words × har cell se DFS: bahut slow jab W = 30,000.</p>
        <p><b>Trie wala idea:</b> saare words ek Trie mein daalo. Phir grid ke har cell se <b>ek hi DFS</b> chalao jo Trie ke saath saath chalta hai: agla cell tabhi lo jab Trie mein us letter ka child ho. Jahan node pe word khatam ho, wo word result mein. Ek DFS ek saath saare words check kar leta hai, aur jo prefix kisi word ka nahi hai wahan turant ruk jaata hai (pruning).</p>
        <ul>
          <li>Node mein <code>String word</code> rakho (isEnd ki jagah), taaki mila hua word seedha add ho, aur add karne ke baad <code>word = null</code> karo (duplicate result nahi).</li>
          <li>Visited ke liye cell ko temporarily <code>'#'</code> se badlo, wapas aate waqt restore (backtracking lesson ka pattern).</li>
          <li>Optimization: jis Trie node ke saare bachche khatam ho gaye, use parent se hata do, taaki aage wahan DFS na jaaye.</li>
        </ul>`
    },
    {
      type: "think",
      id: "think-word-search-2",
      q: "<b>Word Search II (intro):</b> 12×12 grid aur 30,000 words. Har word ke liye alag Word Search kyun slow hai, aur Trie isko kaise bachata hai? Ek line mein pruning ka matlab samjhao.",
      rubric: [
        { point: "Naive: <b>har word ke liye alag DFS</b>, W guna kaam", keys: ["har word", "each word", "alag", "w times", "30000", "w guna", "baar baar"], weight: 2 },
        { point: "Saare words <b>Trie</b> mein, grid pe <b>ek DFS</b> Trie ke saath chale", keys: ["trie", "ek dfs", "single dfs", "saath", "together", "ek saath"], weight: 2 },
        { point: "<b>Pruning:</b> jo prefix Trie mein nahi, wahan DFS ruk jaata hai", keys: ["prune", "pruning", "prefix nahi", "ruk", "stop", "child null"], weight: 2 },
        { point: "Visited mark/restore (backtracking)", keys: ["visited", "#", "restore", "backtrack", "mark"] }
      ],
      answer: `<p>Naive mein har word ke liye poore grid pe DFS chalta hai, aur common prefixes ("app", "apple", "apply") ka kaam baar baar hota hai. Trie mein saare words daal ke grid pe <b>ek</b> DFS chalate hain jo Trie node ke saath saath neeche jaata hai. Jis path ka prefix kisi word ka nahi, wahan Trie child null hota hai aur DFS turant ruk jaata hai. Ye pruning hi speed deti hai.</p>
        <p>Cells ko visited mark karke DFS ke baad restore karo, aur mile hue word ko node se hata do taaki duplicate na aaye.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Trie banane se pehle poochho: \"Sirf lowercase a-z hai?\" Haan → <code>Node[26]</code>, nahi → <code>HashMap</code>. Aur trade-off bolo: Trie prefix queries O(L) mein deta hai, par memory zyada leta hai. Production autocomplete mein har node pe top-k suggestions bhi cache kiye jaate hain."
    }
  ],
  references: [
    { title: "Implement Trie (Prefix Tree)", by: "LeetCode", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", type: "article" },
    { title: "Design Add and Search Words Data Structure", by: "LeetCode", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", type: "article" },
    { title: "Word Search II", by: "LeetCode", url: "https://leetcode.com/problems/word-search-ii/", type: "article" },
    { title: "NeetCode roadmap (Tries)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
