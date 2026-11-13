// Variables aur Data Types
registerLesson("java", "variables-types", {
  why: "Int overflow, integer division aur type casting ki galtiyan DSA questions mein hidden test cases fail karwaati hain. Ye lesson un traps ke baare mein hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Variable = naam wala dabba</h2>
              <p>Java <b>statically typed</b> hai: har variable ka type pehle batana padta hai, aur wo badalta nahi.</p>
              <pre class="code-static">int age = 28;          // type  naam = value;
String name = "Riya";  // String primitive nahi, class hai
var city = "Pune";     // var: compiler khud type samajh leta hai (yahan String)</pre>
              <h2>8 primitive types</h2>
              <table>
                <tr><th>Type</th><th>Size</th><th>Range / Example</th><th>Kab use karein</th></tr>
                <tr><td><code>byte</code></td><td>1 byte</td><td>-128 se 127</td><td>Files, network data</td></tr>
                <tr><td><code>short</code></td><td>2 bytes</td><td>-32,768 se 32,767</td><td>Bahut kam use hota hai</td></tr>
                <tr><td><code>int</code></td><td>4 bytes</td><td>~ -2.1 billion se +2.1 billion</td><td>Default number</td></tr>
                <tr><td><code>long</code></td><td>8 bytes</td><td>~ ±9.2 × 10<sup>18</sup>, likho <code>5L</code></td><td>Bade sums, timestamps, multiplication</td></tr>
                <tr><td><code>float</code></td><td>4 bytes</td><td><code>3.14f</code></td><td>Bahut kam (precision kam hai)</td></tr>
                <tr><td><code>double</code></td><td>8 bytes</td><td><code>3.14</code></td><td>Decimal numbers ka default</td></tr>
                <tr><td><code>char</code></td><td>2 bytes</td><td><code>'A'</code> (andar se number 65)</td><td>Ek character</td></tr>
                <tr><td><code>boolean</code></td><td>-</td><td><code>true</code> / <code>false</code></td><td>Conditions</td></tr>
              </table>`
    },
    {
      type: "code",
      title: "3 traps: overflow, integer division, char arithmetic. Pehle socho output kya hoga, phir Run karo.",
      code: `public class Main {
    public static void main(String[] args) {
        // Trap 1: int overflow. Limit ke baad number ghoom ke negative ho jaata hai
        int big = Integer.MAX_VALUE;            // 2147483647
        System.out.println(big + 1);            // ?
        System.out.println((long) big + 1);     // long mein badal ke jodo

        // Trap 2: int / int = int (decimal kat jaata hai)
        System.out.println(7 / 2);              // ?
        System.out.println(7 / 2.0);            // ek bhi double ho to answer double
        System.out.println(7 % 2);              // % = remainder

        // Trap 3: char andar se number hai
        char c = 'a';
        System.out.println(c + 1);              // ?
        System.out.println((char) (c + 1));     // wapas char banao
        System.out.println('z' - 'a');          // DSA mein index nikalne ka tareeka

        // Casting: bade se chhota = data loss ho sakta hai
        double price = 99.99;
        int rounded = (int) price;              // round nahi, kaat deta hai
        System.out.println(rounded);
    }
}`
    },
    {
      type: "quiz",
      q: "<code>int mid = (low + high) / 2;</code> mein kya problem ho sakti hai jab low aur high dono ~2 billion hon?",
      options: [
        "Koi problem nahi",
        "low + high int overflow karke negative ho jayega",
        "Compile error aayega",
        "Answer double ban jayega"
      ],
      answer: 1,
      why: "Do bade int jodne pe overflow hota hai. Binary search mein isliye likhte hain: <code>int mid = low + (high - low) / 2;</code>. Ye classic interview point hai."
    },
    {
      type: "exercise",
      id: "ex-average",
      title: "Teen numbers ka average",
      level: "Easy",
      task: "<p><code>average(a, b, c)</code> teen <code>int</code> ka <b>exact</b> average <code>double</code> mein return kare.</p><p>Starter code chalta hai, par galat hai. <b>Run</b> karke dekho kaunsa test fail hota hai, phir <b>Submit</b> karke hidden tests bhi pass karo.</p>",
      examples: "<code>average(2, 4, 6)</code> → <code>4.0</code><br><code>average(1, 2, 2)</code> → <code>1.6666666666666667</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    double average(int a, int b, int c) {
        return (a + b + c) / 3;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("average(2, 4, 6)", 4.0, () -> s.average(2, 4, 6));
        Check.eq("average(1, 2, 2)", 1.6666666666666667, () -> s.average(1, 2, 2));
        Check.hiddenFromHere();
        Check.eq("average(0, 0, 1)", 0.3333333333333333, () -> s.average(0, 0, 1));
        Check.eq("negative: average(-1, -2, 0)", -1.0, () -> s.average(-1, -2, 0));
        Check.eq("bade numbers: average(2e9, 2e9, 2e9)", 2.0E9, () -> s.average(2_000_000_000, 2_000_000_000, 2_000_000_000));
    }
}`,
      hints: [
        "Pehla bug: <code>int / int</code> ka answer int hota hai. 3 ki jagah <code>3.0</code> se divide karo.",
        "Doosra bug (hidden test): teen bade int jodne pe overflow. Jodne se pehle <code>long</code> ya <code>double</code> mein badlo."
      ],
      solution: `class Solution {
    double average(int a, int b, int c) {
        return ((long) a + b + c) / 3.0;
    }
}`,
      explain: "<p><code>(long) a</code> pehle a ko long banata hai, phir <code>+ b + c</code> bhi long mein hota hai, isliye overflow nahi hota. <code>/ 3.0</code> se answer double aata hai.</p><p>Ye dono galtiyan (overflow aur integer division) LeetCode ke hidden tests mein sabse zyada fail karwaati hain.</p>"
    },
    {
      type: "think",
      id: "think-money",
      q: "Aap payment system bana rahe ho. Paise (₹ 10.50 jaise amounts) store karne ke liye <code>double</code> use karoge? Kyun ya kyun nahi? Kya use karoge?",
      context: "<p class='muted small'>Hint chahiye to ye chala ke dekho: <code>System.out.println(0.1 + 0.2);</code></p>",
      rubric: [
        {
          point: "<code>double</code> binary floating point hai, <b>0.1 exact store nahi hota</b> (0.1 + 0.2 = 0.30000000000000004)",
          keys: [
            "0.3000",
            "precision",
            "exact nahi",
            "exactly",
            "rounding",
            "floating",
            "binary"
          ],
          weight: 2
        },
        {
          point: "Isliye paise ke liye <b>double/float use nahi karte</b>",
          keys: [
            "nahi karunga",
            "nahi use",
            "use nahi",
            "avoid",
            "not use",
            "never",
            "mat karo",
            "nahi lunga"
          ]
        },
        {
          point: "<b>BigDecimal</b> use karo (exact decimal)",
          keys: [
            "bigdecimal",
            "big decimal"
          ],
          weight: 2
        },
        {
          point: "Ya <b>paise ko long mein</b> store karo (₹10.50 = 1050 paise)",
          keys: [
            "long",
            "paise",
            "paisa",
            "cents",
            "smallest unit",
            "minor unit"
          ],
          weight: 2
        }
      ],
      answer: `<p><b>Nahi.</b> <code>double</code> numbers ko binary mein store karta hai, aur 0.1 jaisa decimal binary mein exact nahi banta. Isliye <code>0.1 + 0.2</code> = <code>0.30000000000000004</code>. Lakhs transactions mein ye chhoti galti bhi hisaab bigaad deti hai.</p>
                <p><b>Do sahi tareeke:</b></p>
                <ol><li><code>BigDecimal</code>: exact decimal math. String se banao: <code>new BigDecimal("10.50")</code>, double se nahi.</li>
                <li><code>long</code> mein sabse chhoti unit: ₹10.50 = <code>1050</code> paise. Fast hai, aur zyaadatar payment companies yahi karti hain.</li></ol>`
    }
  ],
  references: [
    { title: "Primitive Data Types", by: "dev.java", url: "https://dev.java/learn/language-basics/primitive-types/", type: "docs" },
    { title: "Creating Variables and Naming Them", by: "dev.java", url: "https://dev.java/learn/language-basics/variables/", type: "docs" },
    { title: "JLS 17, Chapter 4: Types, Values, and Variables", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html", type: "docs" },
    { title: "JLS 17, Chapter 5: Conversions and Contexts (casting)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-5.html", type: "docs" }
  ]
});
