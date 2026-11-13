// if-else aur switch
registerLesson("java", "if-switch", {
  why: "Har business rule (delivery fee, discount, grade) if-else ya switch hi hota hai. Interview mein switch fall-through, ternary ka type aur Java 14+ switch expression pe output questions aate hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>if / else if / else</h2>
              <p>Java upar se neeche conditions check karta hai aur <b>pehli true condition</b> wala block chala ke baaki sab skip kar deta hai. Isliye <b>order</b> matter karta hai: sabse specific (ya sabse badi range) pehle.</p>
              <pre class="code-static">// Zomato delivery fee (order value ₹ mein)
if (orderValue &gt;= 500) {
    fee = 0;            // free delivery
} else if (orderValue &gt;= 200) {
    fee = 25;
} else {
    fee = 40;
}</pre>
              <p>Condition hamesha <code>boolean</code> honi chahiye. C ki tarah <code>if (x)</code> jahan x int ho, Java mein compile error hai. Isse <code>if (x = 5)</code> wali galti bhi pakdi jaati hai.</p>
              <p><b>Braces hamesha lagao.</b> Bina braces ke <code>if</code> sirf <b>agli ek statement</b> pe lagta hai, indentation chahe kuch bhi dikhe.</p>`
    },
    {
      type: "code",
      title: "Do traps: galat order, aur bina braces wala if",
      code: `public class Main {
    static String gradeBuggy(int marks) {
        // BUG: 95 bhi pehli condition (>= 40) mein phas jaata hai
        if (marks >= 40) return "Pass";
        else if (marks >= 90) return "Distinction";   // kabhi nahi chalega
        else return "Fail";
    }

    static String gradeFixed(int marks) {
        if (marks >= 90) return "Distinction";
        else if (marks >= 40) return "Pass";
        else return "Fail";
    }

    public static void main(String[] args) {
        System.out.println(gradeBuggy(95));   // Pass (galat)
        System.out.println(gradeFixed(95));   // Distinction

        int stock = 0;
        if (stock > 0)
            System.out.println("Order placed");
            System.out.println("Stock kam hua");   // indentation jhooth bolta hai: ye hamesha chalega
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga? (dhyaan do: braces nahi hain)<pre class="code-static">int x = 5;
if (x &gt; 10)
    if (x &gt; 2) System.out.println("A");
else
    System.out.println("B");
System.out.println("C");</pre>`,
      options: ["B C", "A C", "C", "B"],
      answer: 2,
      why: "<b>Dangling else</b>: <code>else</code> hamesha <b>sabse paas wale</b> bina-else <code>if</code> ka hota hai, yaani <code>if (x &gt; 2)</code> ka. Indentation ka koi matlab nahi. Bahar wala <code>if (x &gt; 10)</code> false hai, to andar ka poora if-else skip. Sirf <code>C</code> print hota hai."
    },
    {
      type: "text",
      html: `
              <h2>Ternary operator: <code>condition ? a : b</code></h2>
              <p>Chhota if-else jo <b>value return</b> karta hai. <code>String label = stock &gt; 0 ? "In stock" : "Sold out";</code></p>
              <ul>
                <li>Ek level tak theek hai. Nested ternary (<code>a ? b : c ? d : e</code>) padhna mushkil hai, wahan if-else likho.</li>
                <li><b>Type trap:</b> agar dono branch numbers hain to result <b>badi type</b> mein promote hota hai. <code>true ? 1 : 2.0</code> ka result <code>1.0</code> hai (double), <code>1</code> nahi.</li>
                <li><b>NPE trap:</b> <code>Integer bonus = null; int x = flag ? bonus : 0;</code> mein <code>bonus</code> ko int mein unbox kiya jaata hai, null hai to NullPointerException.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">int qty = 3;
System.out.println(qty &gt; 2 ? 10 : 2.5);</pre>`,
      options: ["10", "10.0", "2.5", "Compile error: dono branch ka type alag hai"],
      answer: 1,
      why: "Ek branch int (10) aur doosri double (2.5) hai. Ternary ka type <b>double</b> ban jaata hai (binary numeric promotion), isliye 10 bhi <code>10.0</code> print hota hai. Compile error nahi aata."
    },
    {
      type: "text",
      html: `
              <h2>switch statement (purana style)</h2>
              <p>Ek value ko kai constants se match karna ho to switch if-else chain se saaf hai.</p>
              <ul>
                <li>Allowed types: <code>byte, short, char, int</code> (aur unke wrappers), <code>String</code> (Java 7+), <code>enum</code>. <b>long, float, double, boolean nahi chalte.</b></li>
                <li><code>case</code> labels compile-time constants hone chahiye, aur duplicate nahi ho sakte.</li>
                <li><b>Fall-through:</b> match hone ke baad Java neeche ke saare cases chalata jaata hai jab tak <code>break</code> na mile. Ye sabse common bug hai.</li>
                <li>String switch andar se <code>hashCode()</code> + <code>equals()</code> use karta hai. Value <code>null</code> ho to NullPointerException.</li>
              </ul>
              <h2>Switch expression (Java 14+)</h2>
              <p>Arrow <code>case X -&gt;</code> wala form: <b>koi fall-through nahi</b>, ek case mein kai labels (<code>case SAT, SUN -&gt;</code>), aur poora switch ek <b>value return</b> kar sakta hai.</p>
              <ul>
                <li>Expression ko <b>exhaustive</b> hona padta hai: har possible input cover ho. int/String pe <code>default</code> zaroori. Enum ke saare constants cover ho gaye to default ki zaroorat nahi.</li>
                <li>Block wale case mein value <code>yield</code> se return hoti hai (<code>return</code> se nahi).</li>
              </ul>`
    },
    {
      type: "code",
      title: "Fall-through bug vs switch expression",
      code: `public class Main {
    public static void main(String[] args) {
        // Purana switch: break bhool gaye
        int day = 2;
        switch (day) {
            case 1:
                System.out.println("Monday");
            case 2:
                System.out.println("Tuesday");
            case 3:
                System.out.println("Wednesday");   // fall-through se ye bhi chala
                break;
            default:
                System.out.println("Other day");
        }

        // Fall-through jaan-boojh ke: kai cases ka same kaam
        String plan = "GOLD";
        switch (plan) {
            case "GOLD":
            case "PLATINUM":
                System.out.println("Free delivery");
                break;
            default:
                System.out.println("Delivery Rs 30");
        }

        // Java 14+ switch expression: value return karta hai, fall-through nahi
        int dayNum = 6;
        String type = switch (dayNum) {
            case 6, 7 -> "Weekend";
            case 1, 2, 3, 4, 5 -> "Weekday";
            default -> "Invalid";
        };
        System.out.println(type);

        // Block wala case: yield se value do
        String status = "DELIVERED";
        int points = switch (status) {
            case "PLACED" -> 0;
            case "DELIVERED" -> {
                int base = 10;
                yield base * 2;
            }
            default -> -1;
        };
        System.out.println(points);
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">int n = 1;
switch (n) {
    default: System.out.print("D ");
    case 1:  System.out.print("1 ");
    case 2:  System.out.print("2 "); break;
    case 3:  System.out.print("3 ");
}</pre>`,
      options: ["1", "1 2", "D 1 2", "1 2 3"],
      answer: 1,
      why: "n = 1 seedha <code>case 1</code> pe jump karta hai (default upar likha hai par sirf tab chalta jab koi case match na ho). Wahan se fall-through: <code>1</code>, <code>2</code>, phir <code>break</code>. Output <code>1 2</code>."
    },
    {
      type: "code",
      expectError: true,
      title: "Switch expression exhaustive hona chahiye: Run karo aur error padho",
      code: `public class Main {
    public static void main(String[] args) {
        int code = 404;
        String msg = switch (code) {
            case 200 -> "OK";
            case 404 -> "Not Found";
            // default nahi hai: compiler bolega saare int values cover nahi hue
        };
        System.out.println(msg);
    }
}`,
      note: "Error: <i>the switch expression does not cover all possible input values</i>. <code>default -&gt; \"Unknown\";</code> jodo aur dobara chalao. Ye compile-time safety switch expression ka bada fayda hai."
    },
    {
      type: "exercise",
      id: "ex-fizzbuzz",
      title: "FizzBuzz (1 se 15)",
      level: "Easy",
      task: "<p>1 se 15 tak har number apni line pe print karo. Par: 3 se divide ho to <code>Fizz</code>, 5 se ho to <code>Buzz</code>, dono se ho to <code>FizzBuzz</code>. <a href=\"https://leetcode.com/problems/fizz-buzz/\" target=\"_blank\">LeetCode 412</a></p><p>Pehle starter Run karke dekho: usme ek classic order bug hai.</p>",
      starter: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else if (i % 15 == 0) System.out.println("FizzBuzz");
            else System.out.println(i);
        }
    }
}`,
      expectedOutput: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz`,
      hints: [
        "15 pe kya print hua? 15 % 3 == 0 bhi true hai, to pehli condition hi jeet gayi.",
        "Sabse specific condition (<code>i % 15 == 0</code>) sabse upar rakho."
      ],
      solution: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else System.out.println(i);
        }
    }
}`,
      explain: "if-else chain mein pehli true condition jeet-ti hai. Isliye 'dono se divide' wala case pehle check karo. <code>i % 15</code> isliye kaam karta hai kyunki 3 aur 5 ka LCM 15 hai."
    },
    {
      type: "exercise",
      id: "ex-grade",
      title: "Grade calculator",
      level: "Easy",
      task: `<p><code>grade(marks)</code> ye return kare:</p>
              <table><tr><th>Marks</th><th>Grade</th></tr>
              <tr><td>90 - 100</td><td>"A"</td></tr><tr><td>75 - 89</td><td>"B"</td></tr><tr><td>60 - 74</td><td>"C"</td></tr>
              <tr><td>40 - 59</td><td>"D"</td></tr><tr><td>0 - 39</td><td>"F"</td></tr><tr><td>0 se kam ya 100 se zyada</td><td>"Invalid"</td></tr></table>
              <p>Bonus: <code>marks / 10</code> pe <b>switch expression</b> se likh ke dekho.</p>`,
      examples: "<code>grade(92)</code> → <code>\"A\"</code><br><code>grade(40)</code> → <code>\"D\"</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    String grade(int marks) {
        if (marks >= 40) return "D";
        else if (marks >= 60) return "C";
        else if (marks >= 75) return "B";
        else if (marks >= 90) return "A";
        return "F";
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("grade(92)", "A", () -> s.grade(92));
        Check.eq("grade(40)", "D", () -> s.grade(40));
        Check.eq("grade(12)", "F", () -> s.grade(12));
        Check.hiddenFromHere();
        Check.eq("boundary grade(90)", "A", () -> s.grade(90));
        Check.eq("boundary grade(89)", "B", () -> s.grade(89));
        Check.eq("boundary grade(75)", "B", () -> s.grade(75));
        Check.eq("boundary grade(60)", "C", () -> s.grade(60));
        Check.eq("boundary grade(39)", "F", () -> s.grade(39));
        Check.eq("grade(100)", "A", () -> s.grade(100));
        Check.eq("grade(0)", "F", () -> s.grade(0));
        Check.eq("invalid grade(101)", "Invalid", () -> s.grade(101));
        Check.eq("invalid grade(-5)", "Invalid", () -> s.grade(-5));
    }
}`,
      hints: [
        "Starter mein order ulta hai: 92 bhi <code>&gt;= 40</code> pe ruk jaata hai.",
        "Pehle invalid check karo (<code>marks &lt; 0 || marks &gt; 100</code>), phir sabse badi range se neeche aao.",
        "Switch version: <code>switch (marks / 10) { case 10, 9 -&gt; \"A\"; case 8 -&gt; ... }</code>. Par 75 aur 89 dono 7/8 mein aate hain, socho B ki range kaise todoge (hint: 7 wale mein ternary)."
      ],
      solution: `class Solution {
    String grade(int marks) {
        if (marks < 0 || marks > 100) return "Invalid";
        if (marks >= 90) return "A";
        if (marks >= 75) return "B";
        if (marks >= 60) return "C";
        if (marks >= 40) return "D";
        return "F";
    }
}`,
      explain: "<p>Invalid input pehle reject karo (guard clause), phir badi range se chhoti. Har <code>if</code> return karta hai, isliye <code>else</code> ki zaroorat nahi: code flat aur padhne mein aasan.</p><p>Boundary values (39/40, 89/90, 100, 0) hamesha test karo. Hidden tests mein yahi fail hote hain.</p>"
    },
    {
      type: "think",
      id: "think-switch",
      q: "Interview question: <b>\"if-else chain vs switch: kab kya use karoge? Java 14 ke switch expression se kya fayde mile?\"</b>",
      rubric: [
        { point: "Ranges / complex conditions (<code>&gt;=</code>, <code>&amp;&amp;</code>) ke liye if-else; ek value ko fixed constants se match karne ke liye switch", keys: ["range", "condition", "constant", "fixed value", "equality", "ek value"], weight: 2 },
        { point: "Purane switch mein <b>fall-through</b> / break bhoolne ka bug; arrow form mein fall-through nahi", keys: ["fall-through", "fall through", "fallthrough", "break"], weight: 2 },
        { point: "Switch expression <b>value return</b> karta hai (yield), variable seedha assign", keys: ["return", "value", "yield", "assign", "expression"] },
        { point: "<b>Exhaustive</b> check: compiler error deta hai agar koi case chhoot gaya (enum mein naya constant aaya)", keys: ["exhaustive", "all case", "saare case", "cover", "compile time", "compiler"] },
        { point: "Bonus: javac switch ko <code>tableswitch</code>/<code>lookupswitch</code> bytecode mein badal sakta hai (jump table), lambi chain se tez ho sakta hai", keys: ["tableswitch", "lookupswitch", "jump table", "bytecode"] }
      ],
      answer: `<p><b>if-else</b>: jab conditions ranges ya mixed hon (<code>amount &gt;= 500 &amp;&amp; isPrime</code>). <b>switch</b>: jab ek hi value ko kai fixed constants (int, String, enum) se match karna ho, jaise order status ya HTTP code.</p>
                <p>Purane switch ka problem: <b>fall-through</b>. <code>break</code> bhool gaye to neeche ke cases bhi chal jaate hain.</p>
                <p><b>Switch expression (Java 14+)</b> ke fayde:</p>
                <ol><li><code>case A, B -&gt;</code>: koi fall-through nahi.</li>
                <li>Value return karta hai: <code>String type = switch (day) { ... };</code>. Block mein <code>yield</code>.</li>
                <li><b>Exhaustive</b>: saare cases cover nahi kiye to compile error. Enum mein naya constant jodoge to har aisa switch expression (jisme default nahi hai) jo usko handle nahi karta, compile pe fail hoga. Bug production se pehle pakda gaya.</li></ol>
                <p>Bonus: javac dense integer cases ko <code>tableswitch</code> (direct jump table) mein compile kar sakta hai, jo lambi if-else chain se tez hota hai. Par ye micro-optimization hai, choice readability se karo.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Switch ke output question mein pehle dekho: <b>arrow (<code>-&gt;</code>) hai ya colon (<code>:</code>)?</b> Colon hai to fall-through ka dhyaan rakho aur har case pe break dhoondho. Aur yaad rakho, <code>default</code> kahin bhi likha ho, wo sirf tab chalta hai jab koi case match na kare (ya upar se fall-through ho ke aaye)."
    }
  ],
  references: [
    { title: "The if-then and if-then-else Statements", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/if.html", type: "docs" },
    { title: "The Switch Statement", by: "dev.java", url: "https://dev.java/learn/language-basics/switch-statement/", type: "docs" },
    { title: "Switch Expressions (Java 17 language guide)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/language/switch-expressions.html", type: "docs" },
    { title: "Fizz Buzz", by: "LeetCode", url: "https://leetcode.com/problems/fizz-buzz/", type: "article" }
  ]
});
