// ArrayList vs LinkedList
registerLesson("java", "list", {
  why: "'ArrayList vs LinkedList' Java interviews ka evergreen sawaal hai, aur textbook answer ('LinkedList mein insert fast hai') aadha galat hai. Internals samjhoge to sahi answer aur sahi production choice dono aayenge.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>ArrayList andar se</h2>
              <p><code>ArrayList</code> ek <b>resizable array</b> hai. Andar ek <code>Object[] elementData</code> hai aur ek <code>size</code> counter.</p>
              <ul>
                <li><b>capacity</b> = array kitna bada hai; <b>size</b> = kitne elements sach mein bhare hain.</li>
                <li><code>new ArrayList&lt;&gt;()</code> shuru mein khaali array rakhta hai. Pehle <code>add</code> pe capacity <b>10</b> banti hai (OpenJDK).</li>
                <li>Array bhar gaya to naya array banta hai, size <b>~1.5x</b> (<code>old + old/2</code>), aur saare elements copy hote hain (<code>Arrays.copyOf</code>). Isliye end mein add <b>amortized O(1)</b> hai: kabhi kabhi copy, zyaadatar seedha likhna.</li>
                <li><code>get(i)</code> = seedha array index, O(1).</li>
                <li>Beech mein <code>add(i, x)</code> / <code>remove(i)</code>: baaki elements ko shift karna padta hai (<code>System.arraycopy</code>), O(n).</li>
              </ul>
              <h2>LinkedList andar se</h2>
              <p><code>LinkedList</code> ek <b>doubly linked list</b> hai. Har element ek alag <code>Node</code> object mein: <code>item</code>, <code>prev</code>, <code>next</code>. List ke paas <code>first</code> aur <code>last</code> pointers hain. Ye <code>List</code> aur <code>Deque</code> dono implement karta hai.</p>
              <pre class="diagram">
ArrayList:   elementData → [ A | B | C | D | _ | _ ]   size=4, capacity=6
                              0   1   2   3   (memory mein lagataar)

LinkedList:  first ─► ┌───┐ ⇄ ┌───┐ ⇄ ┌───┐ ⇄ ┌───┐ ◄─ last
                      │ A │   │ B │   │ C │   │ D │
                      └───┘   └───┘   └───┘   └───┘
                      (har node heap mein kahin bhi, alag object)</pre>`
    },
    {
      type: "steps",
      title: "ArrayList growth: 11 elements add karo (OpenJDK default)",
      steps: [
        { title: "new ArrayList()", html: `<p>capacity 0 (shared empty array). Abhi koi memory nahi li.</p><div class="arr"><span class="cell dim">empty</span></div>` },
        { title: "add #1 → capacity 10", html: `<div class="arr"><span class="cell hl">1</span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span></div><p>Pehla add default capacity 10 ka array banata hai.</p>` },
        { title: "add #2 .. #10 → koi copy nahi", html: `<div class="arr"><span class="cell ok">1</span><span class="cell ok">2</span><span class="cell ok">3</span><span class="cell ok">4</span><span class="cell ok">5</span><span class="cell ok">6</span><span class="cell ok">7</span><span class="cell ok">8</span><span class="cell ok">9</span><span class="cell hl">10</span></div><p>Har add bas <code>elementData[size++] = x</code>. O(1).</p>` },
        { title: "add #11 → grow to 15", html: `<div class="arr"><span class="cell ok">1</span><span class="cell ok">2</span><span class="cell ok">3</span><span class="cell ok">4</span><span class="cell ok">5</span><span class="cell ok">6</span><span class="cell ok">7</span><span class="cell ok">8</span><span class="cell ok">9</span><span class="cell ok">10</span><span class="cell hl">11</span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span><span class="cell dim"></span></div><p>Array full tha. Naya array: 10 + 10/2 = <b>15</b>. 10 elements copy, phir 11 likha. Agli growth: 15 → 22 → 33 → 49 ...</p>` },
        { title: "Amortized O(1) kyun?", html: `<p>n adds mein copies ka total: 10 + 15 + 22 + ... ≈ geometric series ≈ <b>3n</b> se kam. Matlab average har add ka kaam constant. Size pehle se pata ho to <code>new ArrayList&lt;&gt;(n)</code> ya <code>ensureCapacity(n)</code> se copies bachao.</p>` }
      ]
    },
    {
      type: "steps",
      title: "Beech mein insert: list.add(1, X)",
      steps: [
        { title: "ArrayList: shift right", html: `<div class="arr"><span class="cell">A</span><span class="cell hl">B→</span><span class="cell hl">C→</span><span class="cell hl">D→</span><span class="cell dim"></span></div><p>Index 1 se aage sab ek step right shift (System.arraycopy). n elements → O(n) shift. Par ye ek fast memory copy hai.</p>` },
        { title: "ArrayList: likho", html: `<div class="arr"><span class="cell">A</span><span class="cell ok">X</span><span class="cell">B</span><span class="cell">C</span><span class="cell">D</span></div>` },
        { title: "LinkedList: pehle node dhoondho", html: `<div class="arr"><span class="cell hl">A</span><span class="cell">B</span><span class="cell">C</span><span class="cell">D</span></div><p>Index 1 tak pahunchne ke liye first (ya last, jo paas ho) se chalna padta hai. Beech ke index ke liye ~n/2 steps, O(n). Har step ek pointer chase (cache miss).</p>` },
        { title: "LinkedList: link badlo", html: `<div class="arr"><span class="cell">A</span><span class="cell ok">X</span><span class="cell">B</span><span class="cell">C</span><span class="cell">D</span></div><p>Node mil gaya to sirf 4 pointer update: O(1). <b>Par dhoondhna O(n) tha.</b> Isliye "LinkedList mein insert O(1)" sirf tab sach hai jab aapke paas pehle se position ho (jaise ListIterator ya ends).</p>` }
      ]
    },
    {
      type: "text",
      html: `
              <h2>Kab kaunsa</h2>
              <table>
                <tr><th>Operation</th><th>ArrayList</th><th>LinkedList</th></tr>
                <tr><td><code>get(i)</code></td><td>O(1)</td><td>O(n)</td></tr>
                <tr><td><code>add(x)</code> end mein</td><td>O(1) amortized</td><td>O(1)</td></tr>
                <tr><td><code>add(0, x)</code> / <code>remove(0)</code></td><td>O(n) shift</td><td>O(1)</td></tr>
                <tr><td>Beech mein add/remove (index se)</td><td>O(n) shift</td><td>O(n) traverse + O(1) link</td></tr>
                <tr><td>Iterator se chalte hue remove</td><td>O(n) har remove</td><td>O(1) har remove</td></tr>
                <tr><td>Memory per element</td><td>1 reference (+ khaali capacity)</td><td>Node object: header + 3 references (~24-32 bytes extra)</td></tr>
                <tr><td>CPU cache</td><td>Lagataar memory, bahut friendly</td><td>Nodes bikhre hue, cache miss</td></tr>
              </table>
              <p><b>Practical answer:</b> 95% cases mein <b>ArrayList</b>. Queue/stack chahiye to <b>ArrayDeque</b> (LinkedList se fast, javadoc khud yahi kehta hai). LinkedList tab, jab iterator se chalte hue bahut saare beech ke inserts/removes karne hon, aur measure karke faayda dikhe.</p>`
    },
    {
      type: "code",
      title: "get(i) loop: ArrayList vs LinkedList (time machine pe depend karega)",
      code: `import java.util.*;

public class Main {
    static long sumByIndex(List<Integer> list) {
        long s = 0;
        for (int i = 0; i < list.size(); i++) s += list.get(i);   // LinkedList pe har get O(n)!
        return s;
    }

    static long sumByIterator(List<Integer> list) {
        long s = 0;
        for (int x : list) s += x;                                 // dono pe O(n) total
        return s;
    }

    public static void main(String[] args) {
        int n = 5000;
        List<Integer> arr = new ArrayList<>();
        List<Integer> linked = new LinkedList<>();
        for (int i = 0; i < n; i++) { arr.add(i); linked.add(i); }

        long t0 = System.nanoTime();
        sumByIndex(arr);
        long t1 = System.nanoTime();
        sumByIndex(linked);
        long t2 = System.nanoTime();
        sumByIterator(linked);
        long t3 = System.nanoTime();

        System.out.println("ArrayList  get(i) loop : " + (t1 - t0) / 1000 + " micros");
        System.out.println("LinkedList get(i) loop : " + (t2 - t1) / 1000 + " micros  ← O(n^2)");
        System.out.println("LinkedList for-each    : " + (t3 - t2) / 1000 + " micros");
    }
}`,
      note: "LinkedList ko index loop se kabhi mat chalao. Method parameter <code>List</code> hai to caller kuch bhi bhej sakta hai, isliye for-each (iterator) safe default hai."
    },
    {
      type: "quiz",
      q: "<code>ArrayList</code> mein 1 lakh elements hain. Aap <code>while (!list.isEmpty()) list.remove(0);</code> chalate ho. Complexity?",
      options: ["O(n)", "O(n log n)", "O(n²): har remove(0) baaki sab ko left shift karta hai", "O(1)"],
      answer: 2,
      why: "Har <code>remove(0)</code> (size-1) elements shift karta hai. Total ≈ n²/2. Fix: end se hatao (<code>remove(size-1)</code> O(1)), ya <code>clear()</code>, ya queue chahiye to ArrayDeque."
    },
    {
      type: "code",
      title: "Traps: remove(int) vs remove(Object), aur subList ek view hai",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> ids = new ArrayList<>(List.of(10, 20, 30, 40));
        ids.remove(1);                       // index 1 hata (20)
        System.out.println(ids);
        ids.remove(Integer.valueOf(40));     // value 40 hata
        System.out.println(ids);

        List<String> items = new ArrayList<>(List.of("a", "b", "c", "d", "e"));
        List<String> middle = items.subList(1, 4);   // [b, c, d]: copy NAHI, view hai
        middle.set(0, "B");
        System.out.println(items);                   // original bhi badla
        middle.clear();                              // range delete ka idiom
        System.out.println(items);

        // initial capacity: copies bachao jab size pata ho
        List<Integer> big = new ArrayList<>(100_000);
        for (int i = 0; i < 100_000; i++) big.add(i);
        System.out.println("size = " + big.size());
    }
}`,
      note: "subList ke baad original list ka <b>size structurally badla</b> (add/remove directly original pe), to subList use karne pe <code>ConcurrentModificationException</code> aata hai."
    },
    {
      type: "quiz",
      q: "Kaunsa statement <b>galat</b> hai?",
      options: [
        "ArrayList ki capacity aur size alag cheezein hain",
        "LinkedList mein beech ke index pe add hamesha O(1) hai",
        "LinkedList Deque bhi implement karta hai",
        "ArrayList ka get(i) O(1) hai"
      ],
      answer: 1,
      why: "Index tak pahunchne mein O(n) traverse lagta hai. Sirf link update O(1) hai. Ye wahi aadha-sach hai jo interviewer pakadna chahta hai."
    },
    {
      type: "exercise",
      id: "ex-dedupe-list",
      title: "Duplicates hatao, order same rakho",
      level: "Easy",
      task: "<p><code>dedupe(list)</code> ek <b>nayi</b> list return kare jisme har value sirf pehli baar wali jagah pe ho. Input 1 lakh tak ho sakta hai.</p>",
      examples: "<code>[3, 1, 3, 2, 1]</code> → <code>[3, 1, 2]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<Integer> dedupe(List<Integer> list) {
        List<Integer> out = new ArrayList<>();
        for (Integer x : list) {
            if (!out.contains(x)) out.add(x);   // contains O(n) hai...
        }
        return list;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3,1,3,2,1]", List.of(3, 1, 2), () -> s.dedupe(List.of(3, 1, 3, 2, 1)));
        Check.eq("[5,5,5]", List.of(5), () -> s.dedupe(List.of(5, 5, 5)));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.dedupe(List.of()));
        Check.eq("no dupes", List.of(1, 2, 3), () -> s.dedupe(List.of(1, 2, 3)));
        Check.eq("negative + bade", List.of(-1000, 1000), () -> s.dedupe(List.of(-1000, 1000, -1000, 1000)));
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(i);
        for (int i = 0; i < 100000; i++) big.add(i);
        Check.eq("2 lakh elements, 1 lakh unique", 100000, () -> s.dedupe(big).size());
    }
}`,
      hints: [
        "Starter ka bug: <code>out</code> ki jagah <code>list</code> return ho raha hai. Fix ke baad bhi bada test slow hoga.",
        "<code>ArrayList.contains</code> O(n) hai, to total O(n²). Ek <code>HashSet</code> se \"dekha hai?\" check karo.",
        "One-liner: <code>new ArrayList&lt;&gt;(new LinkedHashSet&lt;&gt;(list))</code>"
      ],
      solution: `import java.util.*;

class Solution {
    List<Integer> dedupe(List<Integer> list) {
        return new ArrayList<>(new LinkedHashSet<>(list));
    }
}`,
      explain: "<p>LinkedHashSet duplicates hata deta hai aur pehli insertion ka order rakhta hai. O(n) time, O(n) space. Manual version: <code>Set seen</code> + <code>if (seen.add(x)) out.add(x)</code>.</p>"
    },
    {
      type: "exercise",
      id: "ex-rotate-list",
      title: "List ko k steps right rotate karo",
      level: "Medium",
      task: `<p><code>rotate(list, k)</code> ek nayi list return kare jisme har element k position right khisak gaya ho (end wale ghoom ke shuru mein). k list ke size se bada bhi ho sakta hai.</p><p>Similar: <a href="https://leetcode.com/problems/rotate-array/" target="_blank">LeetCode 189</a>.</p>`,
      examples: "<code>[1,2,3,4,5], k=2</code> → <code>[4,5,1,2,3]</code><br><code>[1,2,3], k=4</code> → <code>[3,1,2]</code> (4 % 3 = 1)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<Integer> rotate(List<Integer> list, int k) {
        return new ArrayList<>(list);
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4,5], k=2", List.of(4, 5, 1, 2, 3), () -> s.rotate(List.of(1, 2, 3, 4, 5), 2));
        Check.eq("[1,2,3], k=4", List.of(3, 1, 2), () -> s.rotate(List.of(1, 2, 3), 4));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.rotate(List.of(), 3));
        Check.eq("k=0", List.of(1, 2), () -> s.rotate(List.of(1, 2), 0));
        Check.eq("k = size", List.of(1, 2, 3), () -> s.rotate(List.of(1, 2, 3), 3));
        Check.eq("single", List.of(9), () -> s.rotate(List.of(9), 1000000));
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < 200000; i++) big.add(i);
        Check.eq("2 lakh, k=1 → first element", 199999, () -> s.rotate(big, 1).get(0));
    }
}`,
      hints: [
        "Pehle <code>k = k % n</code> (n = 0 ka dhyaan rakho).",
        "Naye list ka index i pe kaunsa element aayega? Last ke k elements pehle, phir baaki: <code>list.subList(n - k, n)</code> + <code>list.subList(0, n - k)</code>.",
        "Ya JDK: copy banao aur <code>Collections.rotate(copy, k)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<Integer> rotate(List<Integer> list, int k) {
        int n = list.size();
        if (n == 0) return new ArrayList<>();
        k %= n;
        List<Integer> out = new ArrayList<>(n);
        out.addAll(list.subList(n - k, n));
        out.addAll(list.subList(0, n - k));
        return out;
    }
}`,
      explain: "<p>k ko n se mod karo, phir do slices jodo. Time O(n), space O(n). <code>new ArrayList&lt;&gt;(n)</code> se resize copies bhi nahi hoti. In-place version (LeetCode 189): poora reverse, phir pehle k reverse, phir baaki reverse. O(1) extra space.</p>"
    },
    {
      type: "think",
      id: "think-al-ll",
      q: "Interview question: <b>\"ArrayList aur LinkedList mein kya farak hai? Aap kab LinkedList use karoge?\"</b> (Sirf Big-O mat ratna, internals bhi batao.)",
      rubric: [
        { point: "ArrayList = <b>resizable array</b>, ~1.5x growth, amortized O(1) add; LinkedList = <b>doubly linked nodes</b>", keys: ["array", "resiz", "1.5", "node", "doubly", "linked"], weight: 2 },
        { point: "get(i): ArrayList O(1), LinkedList O(n)", keys: ["get", "random access", "index", "o(1)"], weight: 1 },
        { point: "Beech mein insert LinkedList mein bhi O(n) hai kyunki <b>position dhoondhni</b> padti hai", keys: ["traverse", "dhoondh", "find", "search", "position", "o(n)"], weight: 2 },
        { point: "<b>Memory overhead</b> aur <b>CPU cache locality</b>: LinkedList practically slow", keys: ["memory", "cache", "locality", "overhead", "contiguous", "lagataar"], weight: 2 },
        { point: "Queue/stack ke liye <b>ArrayDeque</b> better; LinkedList rare (iterator se bahut beech ke edits)", keys: ["arraydeque", "deque", "queue", "iterator", "rare", "kabhi"], weight: 1 }
      ],
      answer: `<p><b>ArrayList</b> andar ek <code>Object[]</code> hai. <code>get(i)</code> O(1). End mein add amortized O(1): array full hone pe ~1.5x bada naya array aur copy. Beech mein add/remove O(n) shift (par <code>System.arraycopy</code> bahut fast memory copy hai).</p>
               <p><b>LinkedList</b> doubly linked list hai: har element ek Node object (item, prev, next). Ends pe add/remove O(1). Par <code>get(i)</code> aur beech mein index se insert O(n), kyunki pehle wahan tak <b>chalna</b> padta hai.</p>
               <p>Practically ArrayList lagbhag hamesha jeet-ta hai: memory lagataar hai (CPU cache friendly), aur har element ke liye extra Node object (header + 3 references) nahi. LinkedList ke nodes heap mein bikhre hote hain, har step pe cache miss.</p>
               <p><b>Kab LinkedList?</b> Bahut rare: jab ListIterator se chalte hue bahut saare beech ke inserts/removes karne hon. Queue/stack ke liye <code>ArrayDeque</code> use karta hoon, wo LinkedList se fast hai. Default choice ArrayList, aur doubt ho to measure (JMH).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"LinkedList mein insertion O(1) hai\" bolne ke baad turant add karo: \"<i>agar node ka reference pehle se ho; index se insert O(n) hai</i>\". Ye ek line batati hai ki aapne internals samjhe hain, sirf table ratta nahi."
    }
  ],
  references: [
    { title: "ArrayList (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html", type: "docs" },
    { title: "LinkedList (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedList.html", type: "docs" },
    { title: "ArrayList.java source (OpenJDK 17)", by: "OpenJDK", url: "https://github.com/openjdk/jdk17u/blob/master/src/java.base/share/classes/java/util/ArrayList.java", type: "article" },
    { title: "Rotate Array", by: "LeetCode", url: "https://leetcode.com/problems/rotate-array/", type: "article" }
  ]
});
