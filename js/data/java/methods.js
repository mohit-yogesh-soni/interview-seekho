// Methods
registerLesson("java", "methods", {
  why: "Interview mein har solution ek method hai: sahi signature, sahi return, edge cases. Aur overloading resolution (widening vs boxing vs varargs) tricky output questions ka favourite topic hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Method kyun?</h2>
              <p>Same logic 5 jagah copy kiya, phir ek bug mila: 5 jagah fix karna padega. Method mein rakho to ek jagah. Method = <b>naam wala code ka tukda</b> jo input (parameters) leta hai aur output (return value) deta hai.</p>
              <pre class="code-static">public static  int     applyDiscount (int price, int percent) {
//  modifiers  return   naam            parameters
    return price - price * percent / 100;
}
int finalPrice = applyDiscount(500, 10);   // 500, 10 = arguments</pre>
              <ul>
                <li><b>Parameter</b>: method definition mein variable (<code>price</code>). <b>Argument</b>: call karte waqt di gayi value (<code>500</code>).</li>
                <li><b>Signature</b> = naam + parameter types ka order. Return type signature ka hissa <b>nahi</b> hai.</li>
                <li><code>void</code> = kuch return nahi. Non-void method ke <b>har raaste</b> pe <code>return</code> hona chahiye, warna compile error.</li>
                <li><code>return</code> method turant khatam karta hai. Isse <b>early return / guard clause</b> likhte hain: galat input pehle hi reject.</li>
                <li><code>static</code> method object ke bina class se call hota hai. Abhi hum static likh rahe hain kyunki <code>main</code> static hai (OOP chapter mein instance methods).</li>
              </ul>`
    },
    {
      type: "code",
      title: "Methods: return, guard clause, ek method se doosra call",
      code: `public class Main {
    static int applyDiscount(int price, int percent) {
        if (percent < 0 || percent > 100) return price;   // guard clause: galat input
        return price - price * percent / 100;
    }

    static boolean isEligibleForFreeDelivery(int cartValue, boolean isPrime) {
        return isPrime || cartValue >= 499;               // boolean seedha return karo
    }

    static void printBill(String item, int price, int percent) {
        int finalPrice = applyDiscount(price, percent);   // method se method call
        System.out.println(item + ": Rs " + finalPrice
            + (isEligibleForFreeDelivery(finalPrice, false) ? " (free delivery)" : " + Rs 30 delivery"));
    }

    public static void main(String[] args) {
        printBill("Biryani", 600, 10);
        printBill("Chai", 40, 0);
        printBill("Pizza", 450, 150);    // galat percent, discount nahi laga
        int x = applyDiscount(1000, 20);
        applyDiscount(1000, 50);         // return value ignore karna legal hai (par aksar bug hota hai)
        System.out.println(x);
    }
}`
    },
    {
      type: "code",
      expectError: true,
      title: "Compile error: har raaste pe return nahi hai",
      code: `public class Main {
    static String sign(int n) {
        if (n > 0) return "positive";
        else if (n < 0) return "negative";
        // n == 0 ka kya? compiler ko har raaste pe return chahiye
    }

    public static void main(String[] args) {
        System.out.println(sign(5));
    }
}`,
      note: "Error: <i>missing return statement</i>. Aakhri mein <code>return \"zero\";</code> jodo. Compiler ye nahi sochta ki aapki conditions saare cases cover karti hain ya nahi, wo sirf raaste ginta hai."
    },
    {
      type: "text",
      html: `
              <h2>Overloading: same naam, alag parameters</h2>
              <p>Ek class mein same naam ke kai methods ho sakte hain agar <b>parameter list alag</b> ho (count, type, ya order). Example: <code>Math.max(int, int)</code>, <code>Math.max(double, double)</code>. <code>System.out.println</code> ke 10 overloads hain.</p>
              <ul>
                <li>Sirf return type alag = <b>compile error</b> (call dekh ke compiler decide nahi kar sakta).</li>
                <li>Kaunsa method chalega, ye <b>compile time</b> pe decide hota hai, argument ke <b>declared type</b> se.</li>
              </ul>
              <h3>Compiler kaise chunta hai (JLS ke 3 phases)</h3>
              <ol>
                <li><b>Exact match ya widening</b> (int → long → float → double). Boxing nahi, varargs nahi.</li>
                <li>Phase 1 mein kuch na mile to <b>boxing/unboxing</b> (int → Integer) allowed.</li>
                <li>Phir bhi na mile to <b>varargs</b>.</li>
              </ol>
              <p>Ek phase mein kai options mil jaayein to <b>sabse specific</b> chuna jaata hai (jaise <code>String</code> &gt; <code>Object</code>). Koi ek specific na ho to \"ambiguous\" compile error.</p>`
    },
    {
      type: "code",
      title: "Overloading resolution: har call ka output pehle guess karo",
      code: `public class Main {
    static void show(long x)    { System.out.println("long"); }
    static void show(Integer x) { System.out.println("Integer"); }
    static void show(int... x)  { System.out.println("varargs"); }

    static void print(Object o) { System.out.println("Object"); }
    static void print(String s) { System.out.println("String"); }

    static void area(int side)          { System.out.println("square " + side * side); }
    static void area(int w, int h)      { System.out.println("rect " + w * h); }
    static void area(double r)          { System.out.println("circle " + Math.round(Math.PI * r * r)); }

    public static void main(String[] args) {
        show(5);          // long: widening (phase 1) boxing se pehle
        show(5L);         // long: exact
        char c = 'A';
        show(c);          // long: char -> long bhi widening hai
        show();           // varargs: zero args sirf varargs se match
        show(1, 2);       // varargs

        print("hi");      // String: zyada specific
        Object o = "hi";
        print(o);         // Object! declared type Object hai, runtime type nahi dekha jaata
        print(null);      // String: null dono mein fit, String zyada specific

        area(4);
        area(3, 5);
        area(2.0);
        area('B');        // char -> int widening: square 4356 (B = 66)
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">static void pay(double amt)  { System.out.println("double"); }
static void pay(Integer amt) { System.out.println("Integer"); }

pay(100);</pre>`,
      options: ["double", "Integer", "Compile error: ambiguous", "Runtime error"],
      answer: 0,
      why: "Phase 1 mein sirf widening allowed hai: <code>int → double</code> possible hai, to <code>pay(double)</code> mil gaya. Boxing (<code>int → Integer</code>) phase 2 hai, wahan tak compiler jaata hi nahi. Purane code (Java 5 se pehle) ka behaviour na toote, isliye ye rule hai."
    },
    {
      type: "quiz",
      q: "Kaunsa overload pair <b>compile hoga</b>?",
      options: [
        "<code>int total(int a)</code> aur <code>long total(int a)</code>",
        "<code>void log(String msg)</code> aur <code>void log(String text)</code>",
        "<code>int sum(int a, double b)</code> aur <code>int sum(double a, int b)</code>",
        "<code>static void run()</code> aur <code>void run()</code>"
      ],
      answer: 2,
      why: "Overloading ke liye parameter <b>types ka list</b> alag hona chahiye. Option 3 mein order alag hai (int, double) vs (double, int): valid. Return type, parameter ka naam, ya static hona signature nahi badalta. (Note: option 3 ko <code>sum(1, 2)</code> se call karoge to ambiguous error aayega, par declaration valid hai.)"
    },
    {
      type: "text",
      html: `
              <h2>Varargs: <code>int... nums</code></h2>
              <p>Jab arguments ki ginti fix nahi: <code>sum(1, 2)</code>, <code>sum(1, 2, 3, 4)</code>, <code>sum()</code>. Andar <code>nums</code> ek normal <b>array</b> hai.</p>
              <ul>
                <li>Varargs <b>sirf aakhri</b> parameter ho sakta hai, aur ek method mein <b>ek hi</b>: <code>log(String level, Object... parts)</code>.</li>
                <li>Zero arguments bhi valid: <code>nums.length == 0</code>. Empty case handle karo.</li>
                <li>Array bhi pass kar sakte ho: <code>sum(new int[]{1, 2})</code>.</li>
                <li>Har call pe naya array banta hai. Bahut hot path mein (per request lakhon calls) ye allocation dikhta hai. Isliye <code>List.of</code> ke 0 se 10 arguments wale alag overloads hain, phir varargs.</li>
                <li>Real examples: <code>String.format("%s: %d", name, qty)</code>, <code>Arrays.asList(...)</code>, <code>List.of(...)</code>.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Varargs in action",
      code: `import java.util.Arrays;

public class Main {
    static int sum(int... nums) {
        System.out.print("nums = " + Arrays.toString(nums) + " -> ");
        int total = 0;
        for (int n : nums) total += n;
        return total;
    }

    static String tag(String prefix, String... parts) {   // varargs aakhri parameter
        return prefix + ":" + String.join(",", parts);
    }

    public static void main(String[] args) {
        System.out.println(sum());
        System.out.println(sum(5));
        System.out.println(sum(1, 2, 3));
        System.out.println(sum(new int[]{10, 20}));   // array bhi chalta hai
        System.out.println(tag("order", "veg", "spicy", "large"));
        System.out.println(tag("empty"));
        System.out.println(String.format("%s ne %d item order kiye", "Riya", 3));
    }
}`
    },
    {
      type: "exercise",
      id: "ex-utils",
      title: "Utility methods: leap year aur average",
      level: "Easy",
      task: `<p>Do methods likho:</p>
              <ul><li><code>isLeapYear(year)</code>: 4 se divide ho to leap, <b>par</b> 100 se divide ho to nahi, <b>par</b> 400 se divide ho to phir leap. (1900 leap nahi, 2000 leap.)</li>
              <li><code>average(int... nums)</code>: average <code>double</code> mein. Koi number na ho to <code>0.0</code>. Bade numbers ka sum int overflow na kare.</li></ul>`,
      examples: "<code>isLeapYear(2024)</code> → <code>true</code><br><code>isLeapYear(1900)</code> → <code>false</code><br><code>average(1, 2)</code> → <code>1.5</code><br><code>average()</code> → <code>0.0</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    boolean isLeapYear(int year) {
        return year % 4 == 0;
    }

    double average(int... nums) {
        int sum = 0;
        for (int n : nums) sum += n;
        return sum / nums.length;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("isLeapYear(2024)", true, () -> s.isLeapYear(2024));
        Check.eq("isLeapYear(1900)", false, () -> s.isLeapYear(1900));
        Check.eq("average(1, 2)", 1.5, () -> s.average(1, 2));
        Check.hiddenFromHere();
        Check.eq("isLeapYear(2000)", true, () -> s.isLeapYear(2000));
        Check.eq("isLeapYear(2023)", false, () -> s.isLeapYear(2023));
        Check.eq("isLeapYear(2100)", false, () -> s.isLeapYear(2100));
        Check.eq("average() zero args", 0.0, () -> s.average());
        Check.eq("average(7)", 7.0, () -> s.average(7));
        Check.eq("average(-3, 4)", 0.5, () -> s.average(-3, 4));
        Check.eq("overflow: average(MAX, MAX)", 2147483647.0, () -> s.average(Integer.MAX_VALUE, Integer.MAX_VALUE));
    }
}`,
      hints: [
        "Leap: <code>(year % 4 == 0 &amp;&amp; year % 100 != 0) || year % 400 == 0</code>",
        "Average: pehle <code>if (nums.length == 0) return 0.0;</code>. Zero se divide karne pe int mein ArithmeticException aata hai.",
        "Sum <code>long</code> mein rakho, aur <code>(double) sum / nums.length</code> karo taaki integer division na ho."
      ],
      solution: `class Solution {
    boolean isLeapYear(int year) {
        return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    }

    double average(int... nums) {
        if (nums.length == 0) return 0.0;
        long sum = 0;
        for (int n : nums) sum += n;
        return (double) sum / nums.length;
    }
}`,
      explain: "<p>Leap year ke teeno rules ek boolean expression mein. Average mein teen traps: <b>empty varargs</b> (divide by zero), <b>int overflow</b> (long sum), aur <b>integer division</b> (double cast). Dono methods O(1) / O(n).</p>"
    },
    {
      type: "think",
      id: "think-overload",
      q: "Interview question: <b>\"Kya main() ko overload kar sakte hain? Kya sirf return type badal ke overload ho sakta hai? Overloaded method kab decide hota hai, compile time ya runtime?\"</b>",
      rubric: [
        { point: "Haan, main overload ho sakta hai, par JVM sirf <code>public static void main(String[])</code> se start karta hai (Java 25 se instance <code>void main()</code> bhi valid entry point hai); baaki normal methods hain", keys: ["main overload", "haan", "yes", "string[]", "jvm sirf", "entry point"], weight: 2 },
        { point: "Sirf return type alag ho to overload <b>nahi</b> hota (compile error), signature = naam + parameter types", keys: ["return type", "signature", "compile error", "parameter list", "parameter types"], weight: 2 },
        { point: "Overload resolution <b>compile time</b> pe hota hai, declared (static) type se", keys: ["compile time", "compile-time", "static type", "declared type", "static binding", "early binding"], weight: 2 },
        { point: "Order: widening → boxing → varargs, aur most specific method", keys: ["widening", "boxing", "varargs", "specific"] }
      ],
      answer: `<p><b>main overload:</b> haan. <code>static void main(int x)</code> likh sakte ho, compile hoga. Par JVM program sirf <code>public static void main(String[] args)</code> (ya <code>String... args</code>) se shuru karta hai (Java 17-24; Java 25 se JEP 512 ke baad bina args wala instance <code>void main()</code> bhi chalta hai). Baaki overloads normal methods hain jo aap khud call karoge.</p>
                <p><b>Return type:</b> nahi. Signature = method naam + parameter types (order ke saath). Do methods sirf return type mein alag hon to \"already defined\" compile error.</p>
                <p><b>Kab decide:</b> <b>compile time</b>. Compiler argument ke <b>declared type</b> dekhta hai, runtime object ka type nahi. <code>Object o = "hi"; print(o);</code> <code>print(Object)</code> chalayega. Selection order: exact/widening → boxing → varargs, aur kai mile to most specific. (Iske ulat, overriding runtime pe decide hota hai, OOP chapter mein.)</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Coding round mein method signature likhte hi bolo: \"input kya hai, output kya hai, invalid input pe kya karunga (exception / default value)?\" Guard clauses upar rakho. Aur overloading ke question mein ye line yaad rakho: <b>\"widening beats boxing, boxing beats varargs\"</b>."
    }
  ],
  references: [
    { title: "Defining Methods (overloading)", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html", type: "docs" },
    { title: "Passing Information to a Method (varargs)", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html", type: "docs" },
    { title: "Defining Methods", by: "dev.java", url: "https://dev.java/learn/classes-objects/defining-methods/", type: "docs" },
    { title: "JLS 17, 15.12.2: Compile-Time Step 2 (choosing the method)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html#jls-15.12.2", type: "docs" }
  ]
});
