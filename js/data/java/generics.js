// Generics
registerLesson("java", "generics", {
  why: "Har Collection, Stream aur Optional generics pe bana hai. Interview mein PECS (? extends vs ? super), type erasure, aur 'List&lt;Integer&gt; ko List&lt;Number&gt; mein kyun nahi daal sakte' jaise sawaal senior level ki pehchaan hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Generics se pehle ki problem</h2>
              <p>Java 5 se pehle <code>List</code> mein kuch bhi daal sakte the (sab <code>Object</code>). Nikalte waqt cast karna padta tha, aur galat type ho to <b>runtime pe</b> <code>ClassCastException</code>, shayad production mein raat 2 baje.</p>
              <p>Generics type ko <b>parameter</b> bana dete hain: <code>List&lt;String&gt;</code> matlab "Strings ki list". Ab galat type daalne pe <b>compile time</b> pe error aata hai, aur nikalte waqt cast nahi likhna padta.</p>
              <pre class="code-static">List names = new ArrayList();          // raw type (purana style)
names.add("Riya");
names.add(42);                          // compiler chup
String n = (String) names.get(1);       // 💥 runtime ClassCastException

List&lt;String&gt; safe = new ArrayList&lt;&gt;();  // diamond &lt;&gt;: type right side pe dobara nahi likhna
safe.add(42);                           // ❌ compile error, bug pehle hi pakda gaya</pre>`
    },
    {
      type: "code",
      title: "Apni generic class aur generic method",
      code: `import java.util.*;

public class Main {
    // Generic class: T ek "type ka placeholder" hai
    static class Box<T> {
        private final T value;
        Box(T value) { this.value = value; }
        T get() { return value; }
        <R> Box<R> map(java.util.function.Function<T, R> f) { return new Box<>(f.apply(value)); }
        @Override public String toString() { return "Box(" + value + ")"; }
    }

    // Do type parameters
    record Pair<K, V>(K key, V value) {}

    // Generic method: <T> return type se pehle likhte hain
    static <T> T firstOrDefault(List<T> list, T fallback) {
        return list.isEmpty() ? fallback : list.get(0);
    }

    public static void main(String[] args) {
        Box<String> city = new Box<>("Bengaluru");
        Box<Integer> len = city.map(String::length);
        System.out.println(city + " → " + len);
        int n = len.get();                       // koi cast nahi

        Pair<String, Integer> order = new Pair<>("ORD-17", 499);
        System.out.println(order.key() + " = " + order.value());

        System.out.println(firstOrDefault(List.of("a", "b"), "none"));
        System.out.println(firstOrDefault(new ArrayList<Integer>(), -1));
        System.out.println(Main.<String>firstOrDefault(List.of(), "explicit type witness"));
        System.out.println("n = " + n);
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>Bounded types: &lt;T extends Comparable&lt;T&gt;&gt;</h2>
              <p>Maan lo <code>max(list)</code> likhna hai. Sirf <code>&lt;T&gt;</code> likha to compiler ko nahi pata ki T ko compare kar sakte hain. <b>Bound</b> lagao: "T koi bhi type ho sakta hai, <b>bas</b> wo Comparable ho".</p>
              <ul>
                <li><code>&lt;T extends Number&gt;</code>: T Number ya uska subclass (Integer, Double...). Ab <code>t.doubleValue()</code> call kar sakte ho.</li>
                <li><code>&lt;T extends Comparable&lt;T&gt;&gt;</code>: T khud se compare ho sakta hai. Ab <code>a.compareTo(b)</code> chalega.</li>
                <li>Multiple bounds: <code>&lt;T extends Number &amp; Comparable&lt;T&gt;&gt;</code> (class pehle, phir interfaces).</li>
                <li>Interfaces ke liye bhi keyword <code>extends</code> hi hai, <code>implements</code> nahi.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Bounded generic methods",
      code: `import java.util.*;

public class Main {
    static <T extends Comparable<T>> T max(List<T> list) {
        T best = list.get(0);
        for (T x : list) {
            if (x.compareTo(best) > 0) best = x;
        }
        return best;
    }

    static <T extends Number> double sum(List<T> nums) {
        double s = 0;
        for (T x : nums) s += x.doubleValue();   // bound ki wajah se doubleValue() milta hai
        return s;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 2)));
        System.out.println(max(List.of("chai", "samosa", "vada")));
        System.out.println(sum(List.of(1, 2, 3)));
        System.out.println(sum(List.of(1.5, 2.5)));
        // max(List.of(new Object()));  // ❌ compile error: Object Comparable nahi hai
    }
}`
    },
    {
      type: "code",
      expectError: true,
      title: "Generics invariant hain: List&lt;Integer&gt; ek List&lt;Number&gt; NAHI hai",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> ints = new ArrayList<>(List.of(1, 2));
        List<Number> nums = ints;      // ❌ compile error
        nums.add(3.14);                // agar allowed hota, to ints mein Double ghus jaata!
        Integer first = ints.get(2);   // ... aur yahan ClassCastException
    }
}`,
      note: "Integer, Number ka subtype hai, par <code>List&lt;Integer&gt;</code>, <code>List&lt;Number&gt;</code> ka subtype <b>nahi</b> hai (invariance). Upar comments mein wajah hai: allowed hota to type safety toot jaati. Arrays covariant hain (<code>Integer[]</code> ek <code>Number[]</code> hai), isliye wahan ye bug runtime pe <code>ArrayStoreException</code> deta hai."
    },
    {
      type: "text",
      html: `
              <h2>Wildcards: ? extends vs ? super (PECS)</h2>
              <p>Invariance strict hai. Flexible method chahiye to <b>wildcard</b> <code>?</code> use karo:</p>
              <table>
                <tr><th>Wildcard</th><th>Matlab</th><th>Read</th><th>Write</th><th>Use case</th></tr>
                <tr><td><code>List&lt;? extends Number&gt;</code></td><td>Number ya uske kisi subtype ki list (Integer, Double...)</td><td>✅ Number milta hai</td><td>❌ (null ke alawa kuch nahi)</td><td><b>Producer</b>: list se padhna hai</td></tr>
                <tr><td><code>List&lt;? super Integer&gt;</code></td><td>Integer ya uske kisi supertype ki list (Number, Object)</td><td>⚠️ sirf Object milta hai</td><td>✅ Integer daal sakte ho</td><td><b>Consumer</b>: list mein likhna hai</td></tr>
                <tr><td><code>List&lt;?&gt;</code></td><td>Kisi bhi type ki list</td><td>Object</td><td>❌</td><td>Sirf size, clear jaise type-free kaam</td></tr>
              </table>
              <p><b>PECS = Producer Extends, Consumer Super</b> (Joshua Bloch ka mnemonic). JDK ka example: <code>Collections.copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</code>: src se padhte hain (producer → extends), dest mein likhte hain (consumer → super).</p>
              <p><b>Kyun extends mein write nahi?</b> <code>List&lt;? extends Number&gt;</code> asal mein <code>List&lt;Double&gt;</code> bhi ho sakti hai. Compiler ko pata nahi, to Integer daalne nahi deta.</p>`
    },
    {
      type: "code",
      title: "PECS live: ek method saari number lists padhe, doosra Integers likhe",
      code: `import java.util.*;

public class Main {
    // Producer: sirf padhna hai → extends
    static double total(List<? extends Number> prices) {
        double t = 0;
        for (Number p : prices) t += p.doubleValue();
        return t;
    }

    // Consumer: sirf likhna hai → super
    static void addOrderIds(List<? super Integer> sink, int count) {
        for (int i = 1; i <= count; i++) sink.add(1000 + i);
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(10, 20);
        List<Double> doubles = List.of(9.5, 0.5);
        System.out.println(total(ints) + " " + total(doubles));   // dono chalte hain

        List<Number> numbers = new ArrayList<>();
        List<Object> objects = new ArrayList<>();
        addOrderIds(numbers, 2);
        addOrderIds(objects, 3);
        System.out.println(numbers + " " + objects);

        List<? extends Number> ro = ints;
        Number first = ro.get(0);     // read ok
        // ro.add(5);                 // ❌ compile error: kya pata ro asal mein List<Double> ho
        System.out.println("first = " + first);
    }
}`
    },
    {
      type: "quiz",
      q: "Kaunsi line <b>compile nahi</b> hogi?",
      options: [
        "<code>List&lt;? super Integer&gt; a = new ArrayList&lt;Number&gt;(); a.add(5);</code>",
        "<code>List&lt;? extends Number&gt; b = new ArrayList&lt;Integer&gt;(); b.add(5);</code>",
        "<code>List&lt;? extends Number&gt; c = List.of(1, 2.0); Number n = c.get(0);</code>",
        "<code>List&lt;?&gt; d = List.of(\"x\"); int s = d.size();</code>"
      ],
      answer: 1,
      why: "<code>? extends Number</code> wali list mein add nahi kar sakte (null ke alawa), kyunki actual type Double ki list bhi ho sakti thi. Baaki sab valid hain: super wali mein Integer likh sakte ho, extends wali se Number padh sakte ho, <code>?</code> pe size chalega."
    },
    {
      type: "steps",
      title: "Type erasure: compiler generics ke saath kya karta hai",
      steps: [
        { title: "1. Aapka code", html: `<pre class="code-static">class Box&lt;T extends Comparable&lt;T&gt;&gt; {
    T value;
    T get() { return value; }
}
Box&lt;String&gt; b = new Box&lt;&gt;();
String s = b.get();</pre><p>Compiler types check karta hai: kya sab sahi jagah sahi type hai?</p>` },
        { title: "2. Type parameter mit jaata hai", html: `<pre class="code-static">class Box {
    Comparable value;          // T → uska bound (bound na ho to Object)
    Comparable get() { return value; }
}</pre><p>Bytecode mein sirf <b>ek</b> Box class hai. <code>Box&lt;String&gt;</code> aur <code>Box&lt;Integer&gt;</code> runtime pe same class hain.</p>` },
        { title: "3. Cast compiler daalta hai", html: `<pre class="code-static">Box b = new Box();
String s = (String) b.get();   // compiler ne cast insert kiya</pre><p>Cast jo aap pehle haath se likhte the, ab compiler likhta hai. Aur wo safe hai kyunki step 1 mein check ho chuka.</p>` },
        { title: "4. Natija", html: `<ul><li>Runtime pe <code>T</code> ka pata nahi: <code>new T()</code>, <code>new T[10]</code>, <code>x instanceof List&lt;String&gt;</code> allowed nahi.</li><li><code>List&lt;int&gt;</code> nahi: erasure ke baad Object chahiye, primitive Object nahi hai.</li><li>Do overloads <code>m(List&lt;String&gt;)</code> aur <code>m(List&lt;Integer&gt;)</code> nahi bana sakte: erasure ke baad dono <code>m(List)</code>.</li><li>Kyun aisa design? Java 5 mein purane (non-generic) code ke saath <b>backward compatibility</b> ke liye.</li></ul>` }
      ]
    },
    {
      type: "code",
      title: "Erasure ka saboot + raw type se heap pollution",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>();
        List<Integer> b = new ArrayList<>();
        System.out.println("same runtime class? " + (a.getClass() == b.getClass()));
        System.out.println(a.getClass().getName());

        // Raw type generics ko bypass kar deta hai (compiler sirf warning deta hai)
        List raw = a;
        raw.add(42);                     // String list mein Integer!
        System.out.println("size = " + a.size());
        try {
            String s = a.get(0);         // compiler ka daala hua cast yahan fail hota hai
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: bug add() pe hua tha, pakda get() pe");
        }
    }
}`,
      note: "Isliye raw types (<code>List</code> bina &lt;&gt;) naye code mein kabhi mat likho. Bug jahan hua aur jahan pakda gaya, dono alag jagah hain."
    },
    {
      type: "pick",
      id: "pick-erasure",
      q: "Type erasure ki wajah se inme se kya <b>NAHI</b> kar sakte? Sab select karo.",
      options: [
        { text: "<code>T obj = new T();</code>", correct: true, why: "Runtime pe T ka pata nahi. Workaround: <code>Supplier&lt;T&gt;</code> ya <code>Class&lt;T&gt;</code> pass karo." },
        { text: "<code>if (x instanceof List&lt;String&gt;)</code>", correct: true, why: "Runtime pe sirf <code>List</code> dikhta hai. <code>instanceof List&lt;?&gt;</code> chalega." },
        { text: "<code>List&lt;int[]&gt; list</code>", correct: false, why: "Allowed hai: <code>int[]</code> ek object (array) hai. Sirf <code>int</code> jaise primitive mana hain." },
        { text: "<code>static T cache;</code> generic class ke andar", correct: true, why: "Static field poori class ka ek hai, jabki T har instance ka alag ho sakta hai." },
        { text: "Generic method <code>static &lt;T&gt; void print(T x)</code>", correct: false, why: "Bilkul allowed. Generic static methods common hain (<code>List.of</code>, <code>Collections.max</code>)." },
        { text: "<code>T[] arr = new T[10];</code>", correct: true, why: "Generic array creation allowed nahi. <code>ArrayList</code> andar <code>Object[]</code> rakhta hai aur cast karta hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-generic-max",
      title: "Generic maxOf aur countGreater",
      level: "Medium",
      task: `<p>Do generic methods likho jo kisi bhi Comparable type pe chalein (Integer, String, ...):</p>
             <ul><li><code>maxOf(list)</code>: sabse bada element. List khaali ho to <code>null</code>.</li>
             <li><code>countGreater(list, x)</code>: kitne elements <code>x</code> se strictly bade hain.</li></ul>
             <p>Signatures mein bound lagana zaroori hai, warna <code>compareTo</code> compile nahi hoga.</p>`,
      examples: "<code>maxOf([3, 9, 2])</code> → <code>9</code><br><code>countGreater([\"b\", \"a\", \"c\"], \"a\")</code> → <code>2</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    <T extends Comparable<T>> T maxOf(List<T> list) {
        return null;
    }

    <T extends Comparable<T>> int countGreater(List<T> list, T x) {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("maxOf([3, 9, 2])", 9, () -> s.maxOf(List.of(3, 9, 2)));
        Check.eq("countGreater([b, a, c], a)", 2, () -> s.countGreater(List.of("b", "a", "c"), "a"));
        Check.hiddenFromHere();
        Check.eq("maxOf(empty)", null, () -> s.maxOf(new ArrayList<Integer>()));
        Check.eq("maxOf strings", "vada", () -> s.maxOf(List.of("chai", "vada", "pav")));
        Check.eq("maxOf negatives", -1, () -> s.maxOf(List.of(-5, -1, -9)));
        Check.eq("countGreater none", 0, () -> s.countGreater(List.of(1, 2, 3), 3));
        Check.eq("countGreater duplicates", 2, () -> s.countGreater(List.of(5, 5, 7, 7, 1), 5));
        Check.eq("maxOf single", 42, () -> s.maxOf(List.of(42)));
    }
}`,
      hints: [
        "<code>maxOf</code>: pehle empty check, phir pehle element ko best maan ke loop chalao.",
        "<code>x.compareTo(best) &gt; 0</code> matlab x bada hai.",
        "<code>countGreater</code>: <code>if (e.compareTo(x) &gt; 0) count++;</code>"
      ],
      solution: `import java.util.*;

class Solution {
    <T extends Comparable<T>> T maxOf(List<T> list) {
        if (list.isEmpty()) return null;
        T best = list.get(0);
        for (T e : list) {
            if (e.compareTo(best) > 0) best = e;
        }
        return best;
    }

    <T extends Comparable<T>> int countGreater(List<T> list, T x) {
        int count = 0;
        for (T e : list) {
            if (e.compareTo(x) > 0) count++;
        }
        return count;
    }
}`,
      explain: "<p>Bound <code>T extends Comparable&lt;T&gt;</code> compiler ko guarantee deta hai ki <code>compareTo</code> available hai. Dono O(n).</p><p>Senior detail: JDK ka <code>Collections.max</code> signature <code>&lt;T extends Object &amp; Comparable&lt;? super T&gt;&gt;</code> hai. <code>? super T</code> isliye ki agar parent class ne Comparable implement kiya ho (jaise <code>java.sql.Timestamp</code> ke parent <code>Date</code> ne), to bhi chale.</p>"
    },
    {
      type: "think",
      id: "think-pecs",
      q: "Interview question: <b>\"PECS kya hai? <code>Collections.copy(dest, src)</code> ka signature bina dekhe bana ke samjhao.\"</b>",
      rubric: [
        { point: "<b>Producer Extends</b>: jis collection se padhna hai uspe <code>? extends T</code>", keys: ["producer", "extends", "read", "padh"], weight: 2 },
        { point: "<b>Consumer Super</b>: jis collection mein likhna hai uspe <code>? super T</code>", keys: ["consumer", "super", "write", "likh", "add"], weight: 2 },
        { point: "Signature: <code>copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</code>", keys: ["? super t", "? extends t", "dest", "src"], weight: 2 },
        { point: "Reason: generics <b>invariant</b> hain, wildcard se flexibility (List&lt;Integer&gt; ko Number dest mein copy)", keys: ["invariant", "flexib", "subtype", "list<number>", "number"] },
        { point: "extends wali list mein add nahi kar sakte (actual type unknown)", keys: ["add nahi", "cannot add", "can't add", "unknown", "null"] }
      ],
      answer: `<p><b>PECS: Producer Extends, Consumer Super.</b> Agar parameter aapko values <b>deta</b> hai (aap usse padhte ho), to <code>? extends T</code>. Agar parameter values <b>leta</b> hai (aap usme likhte ho), to <code>? super T</code>.</p>
               <p><code>copy</code> mein <code>src</code> se padhte hain aur <code>dest</code> mein likhte hain:</p>
               <pre class="code-static">static &lt;T&gt; void copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</pre>
               <p>Ab <code>List&lt;Integer&gt;</code> ko <code>List&lt;Number&gt;</code> ya <code>List&lt;Object&gt;</code> mein copy kar sakte ho. Bina wildcards ke (<code>List&lt;T&gt;</code> dono), generics invariant hone ki wajah se dono lists ka type exactly same hona padta.</p>
               <p>Kyun extends wali list mein add nahi? <code>List&lt;? extends Number&gt;</code> asal mein <code>List&lt;Double&gt;</code> ho sakti hai, to compiler Integer daalne nahi deta. Super wali se padhoge to sirf <code>Object</code> milega, kyunki ho sakta hai wo <code>List&lt;Object&gt;</code> ho.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Type erasure\" pe hamesha <b>kyun</b> bhi batao: Java 5 mein generics aaye to purane non-generic bytecode aur libraries ke saath compatible rehna tha. Isliye types sirf compile time pe check hote hain aur runtime pe mita diye jaate hain. Contrast: C# mein generics runtime pe bhi rehte hain (reified)."
    }
  ],
  references: [
    { title: "Lesson: Generics (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/generics/", type: "docs" },
    { title: "Collections.copy signature (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Collections.html", type: "docs" },
    { title: "Effective Java (3rd ed.), Chapter 5 Generics (Items 26-33), Item 31: bounded wildcards / PECS", by: "Joshua Bloch", type: "book" }
  ]
});
