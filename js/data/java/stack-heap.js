// Stack vs Heap aur pass-by-value
registerLesson("java", "stack-heap", {
  why: "\"Java pass-by-value hai ya pass-by-reference?\" lagbhag har Java interview mein aata hai, aur aadhe log galat jawab dete hain. Stack/heap ka picture clear ho to ye, swap wala output question, aur GC ke basics teeno aasan hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Do memory areas</h2>
              <table>
                <tr><th></th><th>Stack</th><th>Heap</th></tr>
                <tr><td>Kya rakhta hai</td><td>Method calls ke <b>frames</b>: local variables, parameters</td><td><b>Saare objects</b> (<code>new</code> se bane), arrays, unke fields</td></tr>
                <tr><td>Kiska hai</td><td>Har thread ka <b>apna</b> stack</td><td>Saare threads <b>share</b> karte hain</td></tr>
                <tr><td>Kab khaali hota hai</td><td>Method return hote hi uska frame hat jaata hai (automatic)</td><td><b>Garbage Collector</b> unreachable objects ko saaf karta hai</td></tr>
                <tr><td>Bhar gaya to</td><td><code>StackOverflowError</code> (jaise bina base case ki recursion)</td><td><code>OutOfMemoryError</code></td></tr>
              </table>
              <h3>Variable kahan jaata hai?</h3>
              <ul>
                <li><b>Local primitive</b> (<code>int x = 5</code>): value seedha stack frame mein.</li>
                <li><b>Local reference</b> (<code>Order o = new Order()</code>): <b>variable</b> <code>o</code> stack mein, usme sirf object ka <b>address</b>. <b>Object</b> khud heap mein.</li>
                <li>Object ke <b>fields</b> (primitive ho ya reference) object ke saath <b>heap</b> mein.</li>
              </ul>
              <p>Variable ko TV ka <b>remote</b> samjho aur object ko <b>TV</b>. Remote (reference) stack pe hai, TV (object) heap mein. Do remote ek hi TV chala sakte hain.</p>
              <p class="small">Senior note: ye mental model hai. JIT ka <b>escape analysis</b> kabhi kabhi aise objects ko heap pe banata hi nahi jo method se bahar nahi jaate. Behaviour wahi rehta hai.</p>`
    },
    {
      type: "steps",
      title: "Memory picture: line by line",
      steps: [
        { title: "int qty = 2;", html: `<pre class="diagram">
 STACK (main frame)          HEAP
 +-----------------+
 | qty = 2         |
 +-----------------+</pre><p>Primitive local: value seedha stack mein.</p>` },
        { title: "int[] prices = {100, 250};", html: `<pre class="diagram">
 STACK (main frame)          HEAP
 +-----------------+
 | qty = 2         |         +-----------+
 | prices = @A1  --+-------&gt; | 100 | 250 |  (array object @A1)
 +-----------------+         +-----------+</pre><p>Array object heap mein. Stack mein sirf uska address (@A1).</p>` },
        { title: "int[] copy = prices;", html: `<pre class="diagram">
 STACK (main frame)          HEAP
 +-----------------+
 | qty = 2         |         +-----------+
 | prices = @A1  --+-------&gt; | 100 | 250 |
 | copy   = @A1  --+-------^ +-----------+
 +-----------------+</pre><p>Naya array nahi bana. Address copy hua. Do remote, ek TV.</p>` },
        { title: "addTip(prices); call hua", html: `<pre class="diagram">
 STACK                       HEAP
 +-----------------+
 | addTip frame    |
 | arr = @A1     --+-------+
 +-----------------+       |
 | main frame      |       v
 | prices = @A1  --+-&gt; +-----------+
 | copy   = @A1    |   | 100 | 250 |
 +-----------------+   +-----------+</pre><p>Naya frame upar push hua. Parameter <code>arr</code> mein address ki <b>copy</b> (@A1). Ye pass-by-value hai: value = address.</p>` },
        { title: "arr[0] = 120; (addTip ke andar)", html: `<pre class="diagram">
 STACK                       HEAP
 | addTip: arr = @A1 --+
 | main: prices = @A1 -+--&gt; | 120 | 250 |</pre><p>Same object badla, to main bhi <b>120</b> dekhega.</p>` },
        { title: "arr = new int[]{0}; phir return", html: `<pre class="diagram">
 STACK                       HEAP
 | addTip: arr = @B7 ------&gt; | 0 |        (naya object)
 | main: prices = @A1 -----&gt; | 120 | 250 |</pre><p><code>arr</code> ko naya address mila, par ye sirf <b>local copy</b> hai. main ka <code>prices</code> abhi bhi @A1. Method return hote hi frame hata, @B7 tak koi reference nahi bacha: GC ke liye eligible.</p>` }
      ]
    },
    {
      type: "text",
      html: `
              <h2>Java hamesha pass-by-value hai</h2>
              <p>Method call pe Java argument ki <b>value copy</b> karke parameter mein daalta hai. Bas.</p>
              <ul>
                <li>Primitive: value = number. Method copy badlega, caller ka variable nahi.</li>
                <li>Reference: value = <b>address</b>. Copy bhi same object ko point karti hai, to <b>object ke andar</b> badlav caller ko dikhega. Par parameter ko <b>naya object assign</b> karna caller ke variable ko nahi badalta.</li>
              </ul>
              <p>Isliye <code>swap(a, b)</code> Java mein kaam nahi karta: method ke paas sirf copies hain. Pass-by-reference (C++ <code>int&amp;</code>) mein method caller ke variable ko hi badal sakta tha. Java mein ye option hai hi nahi.</p>`
    },
    {
      type: "code",
      title: "swap kyun kaam nahi karta, aur object mutate kyun karta hai",
      code: `import java.util.Arrays;

public class Main {
    static void swap(int a, int b) {
        int t = a; a = b; b = t;
        System.out.println("  andar: a=" + a + " b=" + b);
    }

    static void swapRefs(StringBuilder x, StringBuilder y) {
        StringBuilder t = x; x = y; y = t;   // sirf local copies ghoomi
    }

    static void addTip(int[] arr) {
        arr[0] = arr[0] + 20;     // object ke andar badlav: caller ko dikhega
        arr = new int[]{0};       // local copy ko naya object: caller ko nahi dikhega
        arr[0] = 999;
    }

    static void rename(StringBuilder sb) {
        sb.append(" Sharma");     // same object mutate
    }

    static void retarget(StringBuilder sb) {
        sb = new StringBuilder("Naya");   // caller pe asar nahi
    }

    public static void main(String[] args) {
        int a = 1, b = 2;
        swap(a, b);
        System.out.println("bahar: a=" + a + " b=" + b);

        StringBuilder p = new StringBuilder("P"), q = new StringBuilder("Q");
        swapRefs(p, q);
        System.out.println("swapRefs ke baad: " + p + " " + q);

        int[] prices = {100, 250};
        addTip(prices);
        System.out.println(Arrays.toString(prices));

        StringBuilder name = new StringBuilder("Riya");
        rename(name);
        retarget(name);
        System.out.println(name);

        // Swap karna hai to array/object ke andar karo
        int[] pair = {1, 2};
        int t = pair[0]; pair[0] = pair[1]; pair[1] = t;
        System.out.println(Arrays.toString(pair));
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">static void update(String s) {
    s = s + " Express";
}
// main:
String train = "Rajdhani";
update(train);
System.out.println(train);</pre>`,
      options: ["Rajdhani Express", "Rajdhani", "null", "Compile error"],
      answer: 1,
      why: "Do wajah: (1) String immutable hai, <code>s + \" Express\"</code> naya object banata hai. (2) Wo naya object sirf local copy <code>s</code> ko assign hua. Caller ka <code>train</code> abhi bhi purane \"Rajdhani\" ko point karta hai."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">static void reset(int[] arr) {
    arr[0] = 0;
    arr = new int[]{7, 7};
    arr[1] = 0;
}
// main:
int[] data = {5, 6};
reset(data);
System.out.println(data[0] + " " + data[1]);</pre>`,
      options: ["0 0", "7 0", "0 6", "5 6"],
      answer: 2,
      why: "<code>arr[0] = 0</code> asli array badalta hai (data[0] = 0). Phir <code>arr</code> naye array pe point karne laga, to <code>arr[1] = 0</code> naye array ko badalta hai, data ko nahi. data = <code>{0, 6}</code>."
    },
    {
      type: "text",
      html: `
              <h2>Garbage Collection: basic idea</h2>
              <p>Java mein <code>free()</code> / <code>delete</code> nahi likhte. JVM ka <b>Garbage Collector (GC)</b> khud heap saaf karta hai.</p>
              <ul>
                <li><b>Kaun saaf hoga:</b> jo object kisi <b>GC root</b> se <b>reachable</b> nahi hai. GC roots = chal rahe threads ke stack ke local variables, static fields, aur kuch JVM internals.</li>
                <li>Object unreachable kaise hota hai: reference <code>null</code> kiya, variable ko naya object assign kiya, ya method khatam ho gaya aur local variable chala gaya.</li>
                <li>Do objects ek doosre ko point karein par bahar se koi na pahunche (cycle), to bhi saaf ho jaate hain. Java GC reachability dekhta hai, reference count nahi.</li>
                <li><code>System.gc()</code> sirf ek <b>request</b> hai, guarantee nahi.</li>
                <li><b>Generational idea:</b> zyaadatar objects jaldi mar jaate hain (request ke temporary objects). Isliye heap young aur old hisson mein bata hota hai, young ko baar baar aur jaldi saaf karte hain. Java 9 se default collector <b>G1</b> hai.</li>
                <li>Java mein bhi <b>memory leak</b> hota hai: jab object ki zaroorat khatam par reference bacha hai. Classic: <code>static</code> Map/List cache mein daalte jao, kabhi hatao nahi. GC usko saaf nahi kar sakta kyunki wo reachable hai.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `Line 5 ke baad kitne objects GC ke liye <b>eligible</b> hain? (String literals ko ignore karo)<pre class="code-static">1: StringBuilder a = new StringBuilder("A");
2: StringBuilder b = new StringBuilder("B");
3: StringBuilder c = a;
4: a = b;
5: b = null;</pre>`,
      options: ["0", "1", "2", "3"],
      answer: 0,
      why: "Object \"A\": <code>a</code> ne chhoda, par <code>c</code> abhi bhi point karta hai. Object \"B\": <code>b</code> null hua, par line 4 ke baad <code>a</code> usko point karta hai. Dono reachable: <b>0 eligible</b>. Har object ke liye ginti karo ki kitne arrows bache hain."
    },
    {
      type: "pick",
      id: "pick-memory",
      q: "Kaunsi baatein <b>sahi</b> hain?",
      options: [
        { text: "Har thread ka apna stack hota hai, heap sab share karte hain", correct: true, why: "Isliye local variables thread-safe hain, par heap ke shared objects nahi." },
        { text: "Object ka int field stack pe hota hai kyunki int primitive hai", correct: false, why: "Fields object ke saath heap mein hote hain. Sirf <b>local</b> primitives stack pe." },
        { text: "Method mein parameter ko naya object assign karne se caller ka variable bhi badal jaata hai", correct: false, why: "Parameter sirf copy hai. Assign karne se sirf local copy badalti hai." },
        { text: "Infinite recursion se StackOverflowError aata hai, bahut saare objects se OutOfMemoryError", correct: true, why: "Har call ek frame push karta hai; stack ki limit fixed hai. Objects heap mein bhar jaayein to OOM." },
        { text: "Java mein memory leak ho hi nahi sakta kyunki GC hai", correct: false, why: "Reachable par bekaar objects (static cache, listeners jo kabhi remove nahi hue) leak hain." },
        { text: "Do objects ek doosre ko point karein par bahar se unreachable hon, to GC unhe saaf kar sakta hai", correct: true, why: "GC roots se reachability dekhta hai, cycles se fark nahi padta." }
      ]
    },
    {
      type: "exercise",
      id: "ex-pass-by-value",
      title: "Caller ka array badlo (aur kab naya banana padta hai)",
      level: "Easy",
      task: `<p>Do methods:</p>
              <ul><li><code>doubleAll(arr)</code>: <b>caller ke array</b> ke har element ko double karo. Method <code>void</code> hai, naya array assign karne se kaam nahi chalega.</li>
              <li><code>withExtra(arr, x)</code>: ek <b>naya</b> array return karo jisme arr ke saare elements aur end mein x ho. Original array <b>nahi badalna</b> chahiye.</li></ul>`,
      examples: "<code>doubleAll([1, 2, 3])</code> ke baad caller ka array → <code>[2, 4, 6]</code><br><code>withExtra([1, 2], 9)</code> → <code>[1, 2, 9]</code>, original <code>[1, 2]</code> hi rahe",
      userFile: "Solution.java",
      starter: `class Solution {
    void doubleAll(int[] arr) {
        int[] result = new int[arr.length];
        for (int i = 0; i < arr.length; i++) result[i] = arr[i] * 2;
        arr = result;   // kya caller ko ye dikhega?
    }

    int[] withExtra(int[] arr, int x) {
        return arr;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("doubleAll([1, 2, 3])", new int[]{2, 4, 6}, () -> { int[] a = {1, 2, 3}; s.doubleAll(a); return a; });
        Check.eq("withExtra([1, 2], 9)", new int[]{1, 2, 9}, () -> s.withExtra(new int[]{1, 2}, 9));
        Check.hiddenFromHere();
        Check.eq("doubleAll(empty)", new int[]{}, () -> { int[] a = {}; s.doubleAll(a); return a; });
        Check.eq("doubleAll negatives", new int[]{-4, 0, 10}, () -> { int[] a = {-2, 0, 5}; s.doubleAll(a); return a; });
        Check.eq("withExtra: original nahi badla", new int[]{1, 2}, () -> { int[] a = {1, 2}; s.withExtra(a, 9); return a; });
        Check.eq("withExtra: naya object hai", true, () -> { int[] a = {1}; return s.withExtra(a, 2) != a; });
        Check.eq("withExtra(empty, 5)", new int[]{5}, () -> s.withExtra(new int[]{}, 5));
    }
}`,
      hints: [
        "<code>arr = result</code> sirf local copy badalta hai. Seedha <code>arr[i] = arr[i] * 2</code> likho.",
        "Array ka size badal nahi sakta, isliye withExtra mein naya array chahiye: <code>Arrays.copyOf(arr, arr.length + 1)</code>, phir last index pe x."
      ],
      solution: `import java.util.Arrays;

class Solution {
    void doubleAll(int[] arr) {
        for (int i = 0; i < arr.length; i++) arr[i] *= 2;
    }

    int[] withExtra(int[] arr, int x) {
        int[] res = Arrays.copyOf(arr, arr.length + 1);
        res[arr.length] = x;
        return res;
    }
}`,
      explain: "<p><code>doubleAll</code> ko same heap array ka address mila hai, to <code>arr[i] *= 2</code> asli object badalta hai. <code>withExtra</code> mein size badalna hai, jo array mein possible nahi, isliye naya array banake <b>return</b> karna padta hai aur caller ko naya reference use karna hoga. Dono O(n).</p>"
    },
    {
      type: "think",
      id: "think-pbv",
      q: "Interview question: <b>\"Java pass-by-value hai ya pass-by-reference? Example se prove karo.\"</b>",
      rubric: [
        { point: "Java <b>hamesha pass-by-value</b> hai", keys: ["pass-by-value", "pass by value", "hamesha value", "always value", "value hi"], weight: 2 },
        { point: "Objects ke liye <b>reference (address) ki copy</b> pass hoti hai", keys: ["reference ki copy", "copy of reference", "address ki copy", "reference copy", "copy of the reference", "address copy"], weight: 2 },
        { point: "Isliye object ke andar badlav (field / array element) caller ko dikhta hai", keys: ["mutate", "field badl", "andar badl", "same object", "arr[0]", "append"] },
        { point: "Par parameter ko naya object assign karna caller ko nahi dikhta: <b>swap kaam nahi karta</b>", keys: ["swap", "naya object", "new object", "reassign", "assign"], weight: 2 }
      ],
      answer: `<p><b>Java hamesha pass-by-value hai.</b> Method call pe har argument ki value copy hoti hai. Objects ke case mein variable ki value ek <b>reference (address)</b> hai, to address ki copy jaati hai. Log isi ko pass-by-reference samajh lete hain.</p>
                <p><b>Proof 1 (mutate dikhta hai):</b> <code>void add(List&lt;String&gt; l) { l.add("x"); }</code>: caller ki list mein "x" aa jaata hai, kyunki copy bhi same object pe point karti hai.</p>
                <p><b>Proof 2 (reassign nahi dikhta):</b> <code>void reset(List&lt;String&gt; l) { l = new ArrayList&lt;&gt;(); }</code>: caller ki list wahi rehti hai. Agar pass-by-reference hota to caller ka variable bhi naya list point karta.</p>
                <p>Isi wajah se <code>swap(Integer a, Integer b)</code> Java mein kabhi kaam nahi karta. Swap karna ho to array ya object ke andar karo.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Ek line yaad rakho: <b>\"Java passes references by value.\"</b> Phir turant do proof do: mutate dikhta hai, reassign nahi dikhta. Agar time ho to bolo ki local variables thread-safe kyun hain (har thread ka apna stack), isse concurrency wale follow-up ka raasta khulta hai."
    }
  ],
  references: [
    { title: "Passing Information to a Method or a Constructor", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html", type: "docs" },
    { title: "JVM Specification 17, Chapter 2: Run-Time Data Areas", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-2.html", type: "docs" },
    { title: "Garbage Collection Tuning Guide (Java 17): Introduction", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/gctuning/introduction-garbage-collection-tuning.html", type: "docs" }
  ]
});
