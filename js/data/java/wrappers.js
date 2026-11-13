// Wrapper classes aur Autoboxing
registerLesson("java", "wrappers", {
  why: "Collections (List, Map) sirf objects rakhte hain, isliye har jagah Integer, Long, Double aate hain. Integer cache wala == trap aur unboxing se NullPointerException interview ke favourite output questions hain, aur production bugs bhi.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>int vs Integer</h2>
              <p>Har primitive ka ek <b>wrapper class</b> hai: <code>int → Integer</code>, <code>long → Long</code>, <code>double → Double</code>, <code>char → Character</code>, <code>boolean → Boolean</code>, <code>byte → Byte</code>, <code>short → Short</code>, <code>float → Float</code>.</p>
              <table>
                <tr><th></th><th><code>int</code></th><th><code>Integer</code></th></tr>
                <tr><td>Kya hai</td><td>Primitive value (seedha number)</td><td>Heap pe object jiske andar ek int hai</td></tr>
                <tr><td>null ho sakta hai?</td><td>Nahi (default 0)</td><td>Haan (default <code>null</code>)</td></tr>
                <tr><td>Collections / Generics mein</td><td>Nahi: <code>List&lt;int&gt;</code> compile nahi hota</td><td>Haan: <code>List&lt;Integer&gt;</code></td></tr>
                <tr><td>Memory</td><td>4 bytes</td><td>Object header + value, typical 64-bit JVM pe ~16 bytes, plus reference</td></tr>
                <tr><td>Compare</td><td><code>==</code> value compare karta hai</td><td><code>==</code> reference compare karta hai, value ke liye <code>equals()</code></td></tr>
              </table>
              <h2>Autoboxing aur unboxing</h2>
              <p>Java 5 se compiler khud convert karta hai:</p>
              <pre class="code-static">Integer x = 5;      // autoboxing  → compiler likhta hai: Integer x = Integer.valueOf(5);
int y = x;          // unboxing    → compiler likhta hai: int y = x.intValue();
list.add(7);        // autoboxing  → list.add(Integer.valueOf(7));</pre>
              <p>Ye convenient hai, par do traps chhupa deta hai: <b>Integer cache</b> aur <b>null unboxing</b>.</p>`
    },
    {
      type: "code",
      title: "Integer cache trap: 127 == 127 true, par 128 == 128 false",
      code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        System.out.println("127 == 127 : " + (a == b));

        Integer c = 128, d = 128;
        System.out.println("128 == 128 : " + (c == d));
        System.out.println("128 equals : " + c.equals(d));

        // Comparison operators (<, >, <=, >=) pehle unbox karte hain
        Integer p = 1000, q = 1000;
        System.out.println("p <= q && p >= q && p != q : " + (p <= q && p >= q && p != q));

        // Long, Short, Byte ka bhi -128..127 cache hai; Character ka 0..127
        Long l1 = 100L, l2 = 100L;
        System.out.println("Long 100 == 100 : " + (l1 == l2));

        // equals type bhi check karta hai
        Long id = 127L;
        System.out.println("Long.equals(Integer 127) : " + id.equals(127));
        System.out.println("Long.equals(127L)        : " + id.equals(127L));
    }
}`,
      note: "<code>Integer.valueOf(int)</code> -128 se 127 tak ke liye pehle se bane hue objects return karta hai (ye range Java spec ki guarantee hai). Is range ke bahar har baar naya object, isliye <code>==</code> false. Upper limit JVM flag <code>-XX:AutoBoxCacheMax=&lt;n&gt;</code> se badha sakte ho, par code iske bharose kabhi mat likho."
    },
    {
      type: "steps",
      title: "Integer x = 200; x++; ke peeche kya hota hai",
      steps: [
        { title: "Integer x = 200", html: `<p>Compiler: <code>Integer.valueOf(200)</code>. 200 cache range (-128..127) ke bahar hai, to <b>naya object #1</b> banta hai.</p><div class="arr"><span class="cell hl">#1: 200</span></div>` },
        { title: "x++ step 1: unbox", html: `<p><code>x.intValue()</code> → primitive 200 nikla.</p><div class="arr"><span class="cell">#1: 200</span><span class="cell hl">int 200</span></div>` },
        { title: "x++ step 2: add", html: `<p>Primitive math: 200 + 1 = 201.</p><div class="arr"><span class="cell">#1: 200</span><span class="cell hl">int 201</span></div>` },
        { title: "x++ step 3: box again", html: `<p><code>Integer.valueOf(201)</code> → <b>naya object #2</b>. x ab #2 ko point karta hai. #1 garbage ho gaya (agar kisi aur ke paas reference nahi).</p><div class="arr"><span class="cell dim">#1: 200</span><span class="cell ok">#2: 201</span></div><p>Integer objects immutable hain. Isliye loop mein <code>Long sum</code> pe <code>sum += i</code> karoge to har iteration naya object banega. Counters ke liye primitive use karo.</p>` }
      ]
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">Integer a = 1000, b = 1000;
int c = 1000;
System.out.println((a == b) + " " + (a == c));</pre>`,
      options: ["true true", "false false", "false true", "true false"],
      answer: 2,
      why: "<code>a == b</code>: dono Integer, to reference compare. 1000 cache ke bahar, do alag objects → false. <code>a == c</code>: ek side primitive hai, to <code>a</code> unbox hota hai aur value compare → true."
    },
    {
      type: "code",
      expectException: true,
      title: "Unboxing NullPointerException: Map se missing key",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        stock.put("paneer", 5);

        int safe = stock.getOrDefault("dal", 0);     // sahi tareeka
        System.out.println("dal stock: " + safe);

        // Trap 2: ternary. Ek side Integer, doosri int → poora expression int ban jaata hai
        Integer fromCache = null;
        boolean useCache = false;
        Integer r = useCache ? fromCache : 0;      // useCache false hai, isliye abhi theek
        System.out.println("ternary result: " + r);

        // Trap 1: get() null deta hai, int mein unbox karte hi NPE
        int count = stock.get("dal");               // 💥 yahan
        System.out.println("ye line nahi chalegi " + count);
    }
}`,
      note: "Error message dekho: Java 15+ ke <b>helpful NPE</b> (JEP 358: 14 mein aaya, 15 se default ON) batate hain ki <code>intValue()</code> null pe call hua. Ternary wale trap mein <code>useCache = true</code> karke dekho: <code>fromCache</code> null hai, aur expression ka type <code>int</code> hai, to wahan bhi NPE aayega."
    },
    {
      type: "quiz",
      q: `<code>List&lt;Integer&gt; list = new ArrayList&lt;&gt;(List.of(10, 20, 30));</code><br><code>list.remove(1);</code> ke baad list kya hogi?`,
      options: ["[20, 30]", "[10, 30]", "[10, 20, 30] (1 list mein hai hi nahi)", "Compile error: ambiguous"],
      answer: 1,
      why: "<code>remove(int index)</code> aur <code>remove(Object o)</code> do overloads hain. <code>1</code> primitive int hai, aur overload resolution boxing se pehle exact match chunta hai, to <b>index 1</b> hata. Value 1 hatana ho to <code>list.remove(Integer.valueOf(1))</code>."
    },
    {
      type: "pick",
      id: "pick-wrapper",
      q: "Inme se kaunsi lines <b>hamesha</b> sahi kaam karengi (koi trap nahi)? Sab select karo.",
      options: [
        { text: "<code>Integer a = x, b = y; if (a.equals(b)) ...</code>", correct: true, why: "equals value compare karta hai (dono non-null hon to)." },
        { text: "<code>Integer a = x, b = y; if (a == b) ...</code>", correct: false, why: "Sirf -128..127 ke andar value pe chalta hai. Order IDs, prices jaise bade numbers pe fail." },
        { text: "<code>Objects.equals(a, b)</code>", correct: true, why: "null-safe value compare. Dono null hon to true." },
        { text: "<code>int total = map.get(key);</code>", correct: false, why: "Key missing → null → unboxing NPE." },
        { text: "<code>a.intValue() == b.intValue()</code>", correct: true, why: "Dono primitive ban gaye, to value compare (null ho to NPE, par galat answer nahi)." },
        { text: "<code>new Integer(5)</code>", correct: false, why: "Java 9 se deprecated (16 se for removal). <code>Integer.valueOf(5)</code> use karo, wo cache bhi use karta hai." }
      ]
    },
    {
      type: "exercise",
      id: "ex-count-same",
      title: "Do lists mein same position pe same value",
      level: "Easy",
      task: `<p>Do <code>List&lt;Integer&gt;</code> same size ki hain (inme <code>null</code> bhi ho sakta hai). <code>countSame(a, b)</code> batao kitne indexes pe dono ki value barabar hai. Dono null hon to bhi barabar maano.</p><p>Starter code chhote numbers pe sahi lagta hai. Run karke dekho kahan toot-ta hai.</p>`,
      examples: "<code>[1, 2, 3]</code>, <code>[1, 5, 3]</code> → <code>2</code><br><code>[1000, 7]</code>, <code>[1000, 8]</code> → <code>1</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int countSame(List<Integer> a, List<Integer> b) {
        int count = 0;
        for (int i = 0; i < a.size(); i++) {
            if (a.get(i) == b.get(i)) count++;
        }
        return count;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3] vs [1,5,3]", 2, () -> s.countSame(List.of(1, 2, 3), List.of(1, 5, 3)));
        Check.eq("[1000,7] vs [1000,8]", 1, () -> s.countSame(new ArrayList<>(List.of(1000, 7)), new ArrayList<>(List.of(1000, 8))));
        Check.hiddenFromHere();
        Check.eq("empty", 0, () -> s.countSame(List.of(), List.of()));
        Check.eq("nulls", 2, () -> s.countSame(Arrays.asList(null, 5, null), Arrays.asList(null, 5, 4)));
        Check.eq("negative bade", 2, () -> s.countSame(Arrays.asList(-129, -128, 128), Arrays.asList(-129, -128, 129)));
        List<Integer> x = new ArrayList<>(), y = new ArrayList<>();
        for (int i = 0; i < 50000; i++) { x.add(i * 3); y.add(i * 3); }
        Check.eq("50k bade numbers", 50000, () -> s.countSame(x, y));
    }
}`,
      hints: [
        "<code>==</code> do Integer objects ka reference compare karta hai. 1000 cache ke bahar hai.",
        "<code>a.get(i).equals(b.get(i))</code> null pe NPE dega. Null-safe chahiye.",
        "<code>Objects.equals(a.get(i), b.get(i))</code>"
      ],
      solution: `import java.util.*;

class Solution {
    int countSame(List<Integer> a, List<Integer> b) {
        int count = 0;
        for (int i = 0; i < a.size(); i++) {
            if (Objects.equals(a.get(i), b.get(i))) count++;
        }
        return count;
    }
}`,
      explain: "<p><code>Objects.equals(x, y)</code> = <code>(x == y) || (x != null &amp;&amp; x.equals(y))</code>. Ye null-safe bhi hai aur value compare bhi karta hai. Time O(n).</p><p>Note: <code>List.of(1, 2, 3)</code> wale visible test mein starter pass ho jaata hai kyunki values cache range mein hain. Isi wajah se ye bug production tak pahunch jaata hai: test data chhota hota hai, asli IDs bade.</p>"
    },
    {
      type: "exercise",
      id: "ex-safe-sum",
      title: "Null-safe total (cart ke prices)",
      level: "Easy",
      task: "<p>Cart ke items ke prices <code>List&lt;Integer&gt;</code> mein hain. Jis item ka price abhi load nahi hua uska value <code>null</code> hai. <code>total(prices)</code> sab non-null prices ka sum <code>long</code> mein return kare.</p>",
      examples: "<code>[100, null, 250]</code> → <code>350</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    long total(List<Integer> prices) {
        long sum = 0;
        for (int p : prices) {
            sum += p;
        }
        return sum;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[100, 200]", 300L, () -> s.total(List.of(100, 200)));
        Check.eq("[100, null, 250]", 350L, () -> s.total(Arrays.asList(100, null, 250)));
        Check.hiddenFromHere();
        Check.eq("sab null", 0L, () -> s.total(Arrays.asList(null, null)));
        Check.eq("empty", 0L, () -> s.total(List.of()));
        Check.eq("overflow nahi", 4_000_000_000L, () -> s.total(List.of(2_000_000_000, 2_000_000_000)));
    }
}`,
      hints: [
        "<code>for (int p : prices)</code> har element ko unbox karta hai. null pe NPE.",
        "Loop variable <code>Integer p</code> rakho aur <code>if (p != null)</code> check karo."
      ],
      solution: `import java.util.*;

class Solution {
    long total(List<Integer> prices) {
        long sum = 0;
        for (Integer p : prices) {
            if (p != null) sum += p;
        }
        return sum;
    }
}`,
      explain: "<p>Loop variable ka type <code>int</code> rakhne se har element pe chupke se <code>intValue()</code> call hota hai. <code>Integer</code> rakho, null check karo, phir add. <code>sum</code> long hai to overflow bhi nahi. Time O(n).</p>"
    },
    {
      type: "think",
      id: "think-cache",
      q: "Interview question: <b>\"<code>Integer a = 127, b = 127; a == b</code> true deta hai, par 128 pe false. Kyun? Production mein isse kaise bachoge?\"</b>",
      rubric: [
        { point: "Autoboxing <code>Integer.valueOf()</code> call karta hai", keys: ["valueof", "autobox", "boxing"], weight: 1 },
        { point: "<b>Integer cache</b> -128 se 127 tak ke objects reuse karta hai", keys: ["cache", "-128", "127", "reuse"], weight: 2 },
        { point: "Range ke bahar <b>naya object</b>, aur <code>==</code> <b>reference</b> compare karta hai", keys: ["naya object", "new object", "reference", "address", "alag object", "different object"], weight: 2 },
        { point: "Fix: <code>equals()</code> / <code>Objects.equals()</code> ya primitive use karo", keys: ["equals", "objects.equals", "intvalue", "primitive"], weight: 2 },
        { point: "Bonus: cache ki upper limit <code>-XX:AutoBoxCacheMax</code> se badal sakti hai, isliye == pe bharosa kabhi nahi", keys: ["autoboxcachemax", "jvm flag", "configurable", "badha sakte"] }
      ],
      answer: `<p><code>Integer a = 127</code> ko compiler <code>Integer.valueOf(127)</code> bana deta hai. <code>valueOf</code> ke andar ek <b>cache</b> hai jisme -128 se 127 tak ke Integer objects pehle se bane hote hain (chhote numbers bahut use hote hain, isliye). Isliye 127 pe dono variable <b>same object</b> pe point karte hain aur <code>==</code> true.</p>
               <p>128 cache ke bahar hai, to har <code>valueOf</code> naya object deta hai. <code>==</code> objects pe <b>reference</b> compare karta hai, value nahi. Isliye false.</p>
               <p><b>Bachav:</b> wrapper types ko hamesha <code>equals()</code> ya null-safe <code>Objects.equals()</code> se compare karo, ya primitive mein unbox karke. Static analysis (SonarQube, IntelliJ inspections) bhi <code>==</code> on boxed types pe warning deta hai. Cache ki upper limit JVM flag se badal sakti hai, to <code>==</code> ka behaviour environment pe depend kar sakta hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Jab bhi output question mein <code>Integer</code> ke saath <code>==</code> dikhe, teen cheezein check karo: (1) dono side wrapper hain ya ek primitive? (2) value -128..127 mein hai? (3) koi <code>null</code> unbox to nahi ho raha? Ye teen sawaal 90% wrapper traps solve kar dete hain."
    }
  ],
  references: [
    { title: "Integer.valueOf(int) (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html", type: "docs" },
    { title: "Autoboxing and Unboxing (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html", type: "docs" },
    { title: "JEP 358: Helpful NullPointerExceptions", by: "OpenJDK", url: "https://openjdk.org/jeps/358", type: "docs" },
    { title: "Effective Java (3rd ed.), Item 61: Prefer primitive types to boxed primitives", by: "Joshua Bloch", type: "book" }
  ]
});
