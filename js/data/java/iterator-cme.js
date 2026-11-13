// Iterator aur ConcurrentModificationException
registerLesson("java", "iterator-cme", {
  why: "List se loop ke andar remove karna sabse common Java bug hai, aur 'fail-fast vs fail-safe iterator' interview ka favourite sawaal. Ek tricky case mein exception aata hi nahi aur element chupke se skip ho jaata hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Iterator kya hai?</h2>
              <p>Iterator ek "cursor" hai jo collection pe ek ek element chalta hai. Teen methods:</p>
              <ul>
                <li><code>hasNext()</code>: aur element bacha hai?</li>
                <li><code>next()</code>: agla element do aur cursor aage badhao</li>
                <li><code>remove()</code>: jo abhi <code>next()</code> ne diya, use <b>safely</b> hatao</li>
              </ul>
              <p><b>for-each loop</b> asal mein iterator hi hai. Compiler ye likhta hai:</p>
              <pre class="code-static">for (String s : list) { ... }
// ban jaata hai:
for (Iterator&lt;String&gt; it = list.iterator(); it.hasNext(); ) {
    String s = it.next();
    ...
}</pre>
              <h2>Fail-fast kaise kaam karta hai</h2>
              <p><code>ArrayList</code>, <code>HashMap</code> jaise collections ek counter rakhte hain: <code>modCount</code>. Har <b>structural change</b> (add, remove, clear; <code>set</code> nahi) pe ye badhta hai. Iterator banate waqt wo apne paas copy rakhta hai: <code>expectedModCount</code>. Har <code>next()</code> pe check: dono barabar nahi to <code>ConcurrentModificationException</code> (CME).</p>
              <p>Naam mein "Concurrent" hai par <b>ek hi thread</b> mein bhi aata hai. Matlab sirf ye hai ki iteration ke dauraan collection kisi aur raaste se badla gaya.</p>`
    },
    {
      type: "code",
      expectException: true,
      title: "Classic bug: for-each ke andar list.remove()",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> orders = new ArrayList<>(List.of("PAID", "CANCELLED", "PAID", "CANCELLED", "PAID"));
        for (String o : orders) {
            if (o.equals("CANCELLED")) {
                orders.remove(o);          // list ka modCount badha, iterator ko pata nahi
            }
        }
        System.out.println(orders);        // yahan tak nahi pahunchega
    }
}`
    },
    {
      type: "steps",
      title: "modCount vs expectedModCount: exception kab aur kyun",
      steps: [
        { title: "Iterator bana", html: `<div class="arr"><span class="cell hl">PAID</span><span class="cell">CANC</span><span class="cell">PAID</span><span class="cell">CANC</span><span class="cell">PAID</span></div><p>Maan lo list ka modCount abhi 0 hai. Iterator ne copy kiya: expectedModCount = 0, cursor = 0.</p>` },
        { title: "next() → PAID", html: `<p>Check 0 == 0 ✅. cursor = 1.</p>` },
        { title: "next() → CANCELLED, list.remove(o)", html: `<div class="arr"><span class="cell">PAID</span><span class="cell">PAID</span><span class="cell">CANC</span><span class="cell">PAID</span><span class="cell dim"></span></div><p>List ne remove kiya: modCount = <b>1</b>. Iterator abhi bhi expectedModCount = 0 soch raha hai. cursor = 2.</p>` },
        { title: "hasNext() → true, next()", html: `<p>Check: 1 != 0 ❌ → <b>ConcurrentModificationException</b>. Iterator ko pata hai ki list uske peeche badal gayi, aur ab cursor galat jagah ho sakta hai, to wo turant fail karta hai ("fail-fast").</p>` },
        { title: "iterator.remove() kyun safe hai?", html: `<p><code>it.remove()</code> list se element hatata hai <b>aur</b> apna <code>expectedModCount = modCount</code> aur cursor bhi theek karta hai. Dono sync mein rehte hain.</p>` }
      ]
    },
    {
      type: "code",
      title: "Trap: second-last element hatao to exception NAHI aata (par bug hai)",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        for (String s : list) {
            System.out.println("visiting " + s);
            if (s.equals("b")) list.remove(s);
        }
        System.out.println("result: " + list + "  ← c kabhi visit hi nahi hua!");
    }
}`,
      note: "\"b\" hatane ke baad size = 2 aur cursor = 2. <code>hasNext()</code> sirf <code>cursor != size</code> check karta hai → false. Loop chupchaap khatam, <code>next()</code> call hi nahi hua to modCount check bhi nahi hua. Isliye javadoc kehta hai fail-fast <b>best effort</b> hai, guarantee nahi. CME pe kabhi correctness ke liye bharosa mat karo."
    },
    {
      type: "quiz",
      q: "<code>List.of(1,2,3,4)</code> se bani <code>ArrayList</code> pe for-each mein value 3 ko <code>list.remove(Integer.valueOf(3))</code> se hataya. Kya hoga?",
      options: [
        "ConcurrentModificationException",
        "Koi exception nahi, list [1, 2, 4], aur 4 visit nahi hua",
        "Koi exception nahi, sab visit hue",
        "IndexOutOfBoundsException"
      ],
      answer: 1,
      why: "3 second-last element hai (index 2). Hatane ke baad size 3, cursor 3 → <code>hasNext()</code> false. Loop khatam, 4 skip ho gaya, exception nahi. Pichhle code jaisa hi case."
    },
    {
      type: "code",
      title: "Sahi tareeke: iterator.remove, removeIf, ulta index loop, naya collection",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> base = List.of(5, 12, 7, 20, 3, 18);

        // 1. Iterator.remove()
        List<Integer> a = new ArrayList<>(base);
        for (Iterator<Integer> it = a.iterator(); it.hasNext(); ) {
            if (it.next() > 10) it.remove();
        }
        System.out.println("iterator.remove : " + a);

        // 2. removeIf (Java 8): sabse saaf, aur ArrayList pe O(n) (ek pass mein compact)
        List<Integer> b = new ArrayList<>(base);
        b.removeIf(x -> x > 10);
        System.out.println("removeIf        : " + b);

        // 3. Index loop ULTA (peeche se hatao to aage ke index nahi khisakte)
        List<Integer> c = new ArrayList<>(base);
        for (int i = c.size() - 1; i >= 0; i--) {
            if (c.get(i) > 10) c.remove(i);
        }
        System.out.println("reverse index   : " + c);

        // 4. Naya collection banao (original same rahe)
        List<Integer> d = base.stream().filter(x -> x <= 10).collect(Collectors.toList());
        System.out.println("stream filter   : " + d);

        // Map se entries hatana
        Map<String, Integer> stock = new HashMap<>(Map.of("dal", 0, "rice", 4, "atta", 0));
        stock.entrySet().removeIf(e -> e.getValue() == 0);
        System.out.println("map removeIf    : " + stock);
    }
}`,
      note: "Seedha index loop (aage se) <code>for (i = 0; ...) if (...) list.remove(i);</code> exception nahi deta, par hatane ke baad agla element index i pe khisak aata hai aur <b>skip</b> ho jaata hai. Ye bhi chupa hua bug hai."
    },
    {
      type: "text",
      html: `
              <h2>Fail-fast vs fail-safe (weakly consistent)</h2>
              <table>
                <tr><th></th><th>Fail-fast</th><th>Fail-safe / weakly consistent</th></tr>
                <tr><td>Kaun</td><td><code>ArrayList</code>, <code>HashMap</code>, <code>HashSet</code>, <code>LinkedList</code>, <code>TreeMap</code> (java.util ke normal collections)</td><td><code>CopyOnWriteArrayList</code>, <code>ConcurrentHashMap</code>, <code>ConcurrentLinkedQueue</code> (java.util.concurrent)</td></tr>
                <tr><td>Iteration ke dauraan modify</td><td>CME (best effort)</td><td>Koi exception nahi</td></tr>
                <tr><td>Kaise</td><td>modCount check</td><td>CopyOnWrite: iterator ek <b>snapshot</b> pe chalta hai. CHM: live structure pe chalta hai, kuch changes dikh bhi sakte hain, nahi bhi</td></tr>
                <tr><td>Kya dikhta hai</td><td>-</td><td>Snapshot: iterator banne ke baad ke changes <b>nahi</b> dikhte. Weakly consistent: ho sakta hai dikhe</td></tr>
                <tr><td>Cost</td><td>Sasta</td><td>CopyOnWrite: har write poora array copy (O(n)) → sirf read-heavy, chhoti lists (jaise listeners)</td></tr>
              </table>
              <p>Note: "fail-safe" official Java term nahi hai. Javadoc <b>"weakly consistent"</b> aur <b>"snapshot"</b> iterators bolta hai. Interview mein dono naam bolo.</p>`
    },
    {
      type: "code",
      title: "Fail-safe live: CopyOnWriteArrayList aur ConcurrentHashMap",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        List<String> listeners = new CopyOnWriteArrayList<>(List.of("email", "sms"));
        for (String l : listeners) {
            System.out.println("notify " + l);
            if (l.equals("email")) listeners.add("push");    // koi CME nahi
        }
        System.out.println("baad mein: " + listeners + "  (loop ne snapshot dekha, push nahi)");

        Map<String, Integer> views = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2, "c", 3));
        for (String k : views.keySet()) {
            if (k.equals("b")) views.remove("c");            // koi CME nahi
        }
        System.out.println("CHM: " + views);
    }
}`
    },
    {
      type: "pick",
      id: "pick-remove",
      q: "ArrayList se iterate karte hue elements hatane ke <b>sahi</b> tareeke chuno:",
      options: [
        { text: "<code>list.removeIf(x -&gt; cond)</code>", correct: true, why: "Saaf, O(n), internally safe." },
        { text: "Explicit <code>Iterator</code> aur <code>it.remove()</code>", correct: true, why: "Iterator apna state sync rakhta hai." },
        { text: "for-each mein <code>list.remove(x)</code>", correct: false, why: "CME, ya worse: chupke se element skip." },
        { text: "<code>for (int i = size-1; i &gt;= 0; i--)</code> aur <code>list.remove(i)</code>", correct: true, why: "Peeche se hatane pe baaki indexes nahi khisakte." },
        { text: "<code>for (int i = 0; i &lt; list.size(); i++)</code> aur <code>list.remove(i)</code>", correct: false, why: "Exception nahi, par agla element skip hota hai (jab tak i-- na karo)." },
        { text: "Stream filter se naya list", correct: true, why: "Original ko chhedta hi nahi. Immutable style." }
      ]
    },
    {
      type: "exercise",
      id: "ex-remove-cancelled",
      title: "Cancelled orders hatao (in place)",
      level: "Easy",
      task: "<p><code>removeCancelled(orders)</code> di gayi <b>same</b> list se saare <code>\"CANCELLED\"</code> hata de (naya list nahi), aur wahi list return kare. Starter for-each mein remove karta hai, chala ke dekho kya hota hai.</p>",
      examples: "<code>[PAID, CANCELLED, PAID]</code> → <code>[PAID, PAID]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<String> removeCancelled(List<String> orders) {
        for (String o : orders) {
            if (o.equals("CANCELLED")) orders.remove(o);
        }
        return orders;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[PAID, CANCELLED, PAID, CANCELLED, PAID]", List.of("PAID", "PAID", "PAID"),
            () -> s.removeCancelled(new ArrayList<>(List.of("PAID", "CANCELLED", "PAID", "CANCELLED", "PAID"))));
        Check.eq("lagataar do CANCELLED", List.of("PAID"),
            () -> s.removeCancelled(new ArrayList<>(List.of("CANCELLED", "CANCELLED", "PAID"))));
        Check.hiddenFromHere();
        Check.eq("second-last CANCELLED (silent skip trap)", List.of("PAID", "PAID"),
            () -> s.removeCancelled(new ArrayList<>(List.of("PAID", "CANCELLED", "PAID"))));
        Check.eq("sab CANCELLED", List.of(),
            () -> s.removeCancelled(new ArrayList<>(List.of("CANCELLED", "CANCELLED"))));
        Check.eq("empty", List.of(), () -> s.removeCancelled(new ArrayList<>()));
        List<String> mine = new ArrayList<>(List.of("CANCELLED", "PAID"));
        Check.eq("same list object badla", true, () -> s.removeCancelled(mine) == mine && mine.size() == 1);
        List<String> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(i % 2 == 0 ? "CANCELLED" : "PAID");
        Check.eq("1 lakh orders", 50000, () -> s.removeCancelled(big).size());
    }
}`,
      hints: [
        "for-each ke andar <code>orders.remove</code> = CME, ya lagataar do matching elements mein se ek skip.",
        "Java 8+: <code>orders.removeIf(o -&gt; o.equals(\"CANCELLED\"));</code>",
        "1 lakh wale test mein <code>removeIf</code> O(n) hai. Iterator.remove bhi sahi hai par ArrayList pe har remove shift karta hai (O(n²) worst)."
      ],
      solution: `import java.util.*;

class Solution {
    List<String> removeCancelled(List<String> orders) {
        orders.removeIf(o -> o.equals("CANCELLED"));
        return orders;
    }
}`,
      explain: "<p><code>ArrayList.removeIf</code> pehle saare matching indexes mark karta hai, phir ek pass mein bache hue elements aage khiska deta hai. O(n) total, aur modCount ek baar badhta hai. <code>\"CANCELLED\".equals(o)</code> likhna null-safe bhi hai.</p>"
    },
    {
      type: "think",
      id: "think-failfast",
      q: "Interview question: <b>\"Fail-fast aur fail-safe iterators mein kya farak hai? Fail-fast internally kaise implement hota hai?\"</b>",
      rubric: [
        { point: "Fail-fast: iteration ke dauraan structural change pe <b>ConcurrentModificationException</b>; ArrayList, HashMap", keys: ["concurrentmodification", "cme", "exception", "arraylist", "hashmap"], weight: 2 },
        { point: "Implementation: <b>modCount</b> vs <b>expectedModCount</b>, har next() pe check", keys: ["modcount", "expectedmodcount", "counter", "next()"], weight: 2 },
        { point: "Fail-safe / weakly consistent: <b>CopyOnWriteArrayList</b> (snapshot), <b>ConcurrentHashMap</b>", keys: ["copyonwrite", "concurrenthashmap", "snapshot", "weakly", "clone", "copy"], weight: 2 },
        { point: "Fail-fast <b>best effort</b> hai, guarantee nahi; single thread mein bhi aata hai", keys: ["best effort", "guarantee", "single thread", "ek thread", "not guaranteed"], weight: 1 },
        { point: "Safe removal: iterator.remove / removeIf", keys: ["iterator.remove", "it.remove", "removeif"], weight: 1 }
      ],
      answer: `<p><b>Fail-fast</b> iterators (ArrayList, HashMap, HashSet...) iteration ke beech collection structurally badle (add/remove) to <code>ConcurrentModificationException</code> throw karte hain. <b>Implementation:</b> collection ek <code>modCount</code> rakhta hai jo har structural change pe badhta hai; iterator banate waqt <code>expectedModCount</code> copy hota hai aur har <code>next()</code> pe compare hota hai. Ye <b>best effort</b> hai (jaise second-last element hatane pe exception nahi aata), aur ek hi thread mein bhi aata hai.</p>
               <p><b>Fail-safe</b> (javadoc ki bhasha mein snapshot / weakly consistent) iterators exception nahi dete. <code>CopyOnWriteArrayList</code> har write pe naya array banata hai, iterator purane snapshot pe chalta hai (naye changes nahi dikhte, writes mehenge). <code>ConcurrentHashMap</code> ka iterator live table pe chalta hai aur concurrent changes dikh bhi sakte hain, nahi bhi.</p>
               <p>Iterate karte hue hatana ho to <code>Iterator.remove()</code> ya <code>removeIf</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Second-last element wala trap khud bata do: \"<i>fail-fast guarantee nahi hai, jaise second-last element remove karne pe hasNext false ho jaata hai aur exception nahi aata, element skip ho jaata hai</i>\". Ye depth bahut kam candidates dikhate hain."
    }
  ],
  references: [
    { title: "ArrayList (Java 17 API): fail-fast iterators", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html", type: "docs" },
    { title: "ConcurrentModificationException (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ConcurrentModificationException.html", type: "docs" },
    { title: "java.util.concurrent package: weakly consistent iterators", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/package-summary.html", type: "docs" }
  ]
});
