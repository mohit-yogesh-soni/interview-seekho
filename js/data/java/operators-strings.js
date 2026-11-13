// Operators aur String basics
registerLesson("java", "operators-strings", {
  why: "i++ vs ++i, short-circuit && aur == vs equals interview ke 'output batao' rounds mein baar baar aate hain. Aur String methods (charAt, substring) ke bina ek bhi DSA string problem nahi hoti.",
  blocks: [
    { type: "text", html: `
      <h2>Arithmetic operators</h2>
      <table>
        <tr><th>Operator</th><th>Matlab</th><th>Example</th><th>Dhyaan rakho</th></tr>
        <tr><td><code>+ - *</code></td><td>jodo, ghatao, guna</td><td><code>7 * 3 = 21</code></td><td>int range ke bahar gaya to overflow</td></tr>
        <tr><td><code>/</code></td><td>bhaag</td><td><code>7 / 2 = 3</code></td><td>int / int = int. <code>7 / 0</code> → ArithmeticException, par <code>7.0 / 0</code> → Infinity</td></tr>
        <tr><td><code>%</code></td><td>remainder (modulo)</td><td><code>7 % 3 = 1</code></td><td>Sign pehle number ka: <code>-7 % 3 = -1</code></td></tr>
      </table>
      <h3>Compound assignment: chhupa hua cast</h3>
      <pre class="code-static">byte b = 10;
b = b + 5;   // ❌ compile error: b + 5 int ban jaata hai, byte mein seedha nahi jaata
b += 5;      // ✅ chalta hai: += andar se (byte)(b + 5) karta hai</pre>
      <h2>Comparison aur logical operators</h2>
      <p><code>== != &lt; &gt; &lt;= &gt;=</code> ka result <code>boolean</code> hota hai.</p>
      <p><code>&amp;&amp;</code> (AND) aur <code>||</code> (OR) <b>short-circuit</b> hain: agar pehle hisse se hi jawab pata chal jaaye, to doosra hissa chalta hi nahi.</p>
      <ul>
        <li><code>false &amp;&amp; kuchBhi</code> → false. <code>kuchBhi</code> check nahi hota.</li>
        <li><code>true || kuchBhi</code> → true. <code>kuchBhi</code> check nahi hota.</li>
        <li><code>&amp;</code> aur <code>|</code> (single) dono side hamesha chalaate hain.</li>
      </ul>
      <p>Isi wajah se null check hamesha pehle likhte hain: <code>if (s != null &amp;&amp; s.length() &gt; 0)</code>.</p>` },
    { type: "code", title: "Short-circuit ne NullPointerException se bachaya. && ko & karke dobara chalao.", code:
`public class Main {
    static boolean check(String naam) {
        System.out.println("  check(" + naam + ") chala");
        return true;
    }

    public static void main(String[] args) {
        String s = null;

        // && : pehla hissa false hai, to s.length() chalega hi nahi
        if (s != null && s.length() > 0) {
            System.out.println("non-empty");
        } else {
            System.out.println("null ya empty");
        }

        System.out.println("false && check:");
        boolean a = false && check("A");   // check nahi chalega
        System.out.println("false & check:");
        boolean b = false & check("B");    // check chalega
        System.out.println("true || check:");
        boolean c = true || check("C");    // check nahi chalega
        System.out.println(a + " " + b + " " + c);
    }
}` },
    { type: "text", html: `
      <h2>i++ vs ++i</h2>
      <table>
        <tr><th>Likha</th><th>Naam</th><th>Expression ki value</th><th>Baad mein i</th></tr>
        <tr><td><code>i++</code></td><td>post-increment</td><td>purani value</td><td>+1</td></tr>
        <tr><td><code>++i</code></td><td>pre-increment</td><td>nayi value</td><td>+1</td></tr>
      </table>
      <p>Akele line mein (<code>i++;</code> ya <code>++i;</code>) dono same hain. Farak tab padta hai jab value kisi expression mein use ho.</p>` },
    { type: "code", title: "Har line ka output pehle khud socho, phir Run karo", code:
`public class Main {
    public static void main(String[] args) {
        int i = 5;
        int x = i++;      // x ko purani value, phir i badha
        System.out.println("x=" + x + " i=" + i);

        int j = 5;
        int y = ++j;      // pehle j badha, phir y ko nayi value
        System.out.println("y=" + y + " j=" + j);

        int k = 5;
        int z = k++ + ++k;   // left se right: 5 (k=6), phir 7 (k=7)
        System.out.println("z=" + z + " k=" + k);

        int m = 5;
        m = m++;          // trap: m++ ki value 5 thi, wahi wapas m mein
        System.out.println("m=" + m);
    }
}` },
    { type: "quiz", q: "Output kya hoga?<pre class='code-static'>int a = 10;\nint b = a++ * 2 + --a;\nSystem.out.println(a + \" \" + b);</pre>",
      options: ["10 30", "11 32", "10 29", "9 30"], answer: 0,
      why: "Left se right: <code>a++</code> ki value 10 (a ab 11). <code>10 * 2 = 20</code>. Phir <code>--a</code>: a 11 se 10, value 10. <code>b = 20 + 10 = 30</code>, aur a = 10." },
    { type: "text", html: `
      <h2>String basics</h2>
      <p><code>String</code> characters ki list hai. Index <b>0 se</b> shuru hota hai.</p>
      <pre class="diagram">  "CODING"
   C  O  D  I  N  G
   0  1  2  3  4  5      length() = 6, aakhri index = 5</pre>
      <table>
        <tr><th>Method</th><th>Kya karta hai</th><th><code>s = "Hello World"</code></th></tr>
        <tr><td><code>length()</code></td><td>kitne characters</td><td>11</td></tr>
        <tr><td><code>charAt(i)</code></td><td>index i ka char</td><td><code>charAt(4)</code> → 'o'</td></tr>
        <tr><td><code>substring(a, b)</code></td><td>a se b-1 tak (b shamil nahi)</td><td><code>substring(0, 5)</code> → "Hello"</td></tr>
        <tr><td><code>substring(a)</code></td><td>a se end tak</td><td><code>substring(6)</code> → "World"</td></tr>
        <tr><td><code>indexOf(x)</code></td><td>pehli position, na mile to -1</td><td><code>indexOf("o")</code> → 4</td></tr>
        <tr><td><code>contains(x)</code></td><td>andar hai ya nahi</td><td><code>contains("World")</code> → true</td></tr>
        <tr><td><code>toUpperCase() / toLowerCase()</code></td><td>case badlo (naya String)</td><td>"HELLO WORLD"</td></tr>
        <tr><td><code>trim() / strip()</code></td><td>aage-peeche ke spaces hatao</td><td>strip() Unicode spaces bhi hatata hai (Java 11+)</td></tr>
        <tr><td><code>split(regex)</code></td><td>tod ke array</td><td><code>split(" ")</code> → ["Hello", "World"]</td></tr>
        <tr><td><code>equals / equalsIgnoreCase</code></td><td>content compare</td><td><code>"a".equals("A")</code> → false</td></tr>
        <tr><td><code>compareTo</code></td><td>dictionary order: negative / 0 / positive</td><td><code>"apple".compareTo("banana")</code> &lt; 0</td></tr>
      </table>
      <p>String <b>immutable</b> hai: <code>toUpperCase()</code> jaise methods purani string nahi badalte, naya String return karte hain. Isliye <code>s.toUpperCase();</code> akele likhne se kuch nahi hota, <code>s = s.toUpperCase();</code> likhna padta hai.</p>
      <h2>== vs equals</h2>
      <ul>
        <li><code>==</code> objects ke liye check karta hai: <b>kya dono same object hain</b> (same memory address)?</li>
        <li><code>equals()</code> check karta hai: <b>kya content same hai</b>?</li>
      </ul>
      <p>String literals (<code>"hi"</code>) <b>String pool</b> mein ek hi baar bante hain, isliye do <b>same literals</b> pe <code>==</code> hamesha true aata hai (same pooled object), par runtime pe bani ya <code>new String</code> wali string pe false. Isse dhokha mat khao: Strings hamesha <code>equals()</code> se compare karo.</p>` },
    { type: "code", title: "String methods aur == vs equals", code:
`public class Main {
    public static void main(String[] args) {
        String s = "Hello World";
        System.out.println(s.length());
        System.out.println(s.charAt(0) + " " + s.charAt(s.length() - 1));
        System.out.println(s.substring(0, 5) + "|" + s.substring(6));
        System.out.println(s.indexOf('o') + " " + s.lastIndexOf('o') + " " + s.indexOf('z'));

        s.toUpperCase();              // naya string bana, par kahin save nahi kiya
        System.out.println(s);        // abhi bhi "Hello World"
        s = s.toUpperCase();
        System.out.println(s);

        String a = "hi";
        String b = "hi";
        String c = new String("hi");  // jaan-boojh ke naya object
        System.out.println(a == b);       // dono pool wala same object
        System.out.println(a == c);       // alag object
        System.out.println(a.equals(c));  // content same

        // Har character pe loop: DSA ka sabse common kaam
        String word = "banana";
        int count = 0;
        for (int i = 0; i < word.length(); i++) {
            if (word.charAt(i) == 'a') count++;   // char ko == se compare karna theek hai (primitive)
        }
        System.out.println("a kitni baar: " + count);
    }
}` },
    { type: "quiz", q: "<code>\"interview\".substring(2, 5)</code> kya return karega?",
      options: ["\"terv\"", "\"ter\"", "\"nte\"", "\"erv\""], answer: 1,
      why: "Index 2 = 't', 3 = 'e', 4 = 'r'. End index (5) shamil nahi hota. Isliye \"ter\". Length hamesha <code>end - start</code> = 3." },
    { type: "exercise", id: "ex-vowels", title: "Vowels gino", level: "Easy",
      task: "<p><code>countVowels(s)</code> string mein vowels (a, e, i, o, u) ki ginti return kare. Capital aur small dono gine jaayein.</p>",
      examples: "<code>countVowels(\"Hello\")</code> → <code>2</code><br><code>countVowels(\"AEIOU xyz\")</code> → <code>5</code>",
      userFile: "Solution.java",
      starter:
`class Solution {
    int countVowels(String s) {
        // har character check karo
        return 0;
    }
}`,
      harness:
`import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"Hello\\"", 2, () -> s.countVowels("Hello"));
        Check.eq("\\"AEIOU xyz\\"", 5, () -> s.countVowels("AEIOU xyz"));
        Check.hiddenFromHere();
        Check.eq("empty string", 0, () -> s.countVowels(""));
        Check.eq("koi vowel nahi: \\"rhythm\\"", 0, () -> s.countVowels("rhythm"));
        Check.eq("mixed: \\"Programming In Java\\"", 6, () -> s.countVowels("Programming In Java"));
        Check.eq("numbers aur symbols: \\"a1!E2@\\"", 2, () -> s.countVowels("a1!E2@"));
    }
}`,
      hints: [
        "<code>for (int i = 0; i &lt; s.length(); i++)</code> loop aur <code>s.charAt(i)</code>.",
        "Pehle <code>Character.toLowerCase(c)</code> karo, phir <code>\"aeiou\".indexOf(c) != -1</code> se check karo."
      ],
      solution:
`class Solution {
    int countVowels(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = Character.toLowerCase(s.charAt(i));
            if ("aeiou".indexOf(c) != -1) count++;
        }
        return count;
    }
}`,
      explain: "Har character ek baar dekha: time O(n), extra space O(1). <code>\"aeiou\".indexOf(c)</code> chhota trick hai 5 alag <code>==</code> checks likhne ke bajaye." },
    { type: "exercise", id: "ex-palindrome", title: "Valid Palindrome", level: "Easy",
      task: "<p><code>isPalindrome(s)</code>: sirf letters aur digits ko dekho (spaces, comma, colon ignore), capital/small ko same maano. Agar string aage se aur peeche se same padhi jaaye to <code>true</code>.</p><p>Is problem se <b>two pointers</b> pattern ka pehla taste milega: ek pointer shuru se, ek end se. <a href='https://leetcode.com/problems/valid-palindrome/' target='_blank'>LeetCode 125</a></p>",
      examples: "<code>\"A man, a plan, a canal: Panama\"</code> → <code>true</code> (amanaplanacanalpanama)<br><code>\"race a car\"</code> → <code>false</code>",
      userFile: "Solution.java",
      starter:
`class Solution {
    boolean isPalindrome(String s) {
        return false;
    }
}`,
      harness:
`import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"A man, a plan, a canal: Panama\\"", true, () -> s.isPalindrome("A man, a plan, a canal: Panama"));
        Check.eq("\\"race a car\\"", false, () -> s.isPalindrome("race a car"));
        Check.hiddenFromHere();
        Check.eq("empty", true, () -> s.isPalindrome(""));
        Check.eq("sirf space \\" \\"", true, () -> s.isPalindrome(" "));
        Check.eq("digit vs letter \\"0P\\"", false, () -> s.isPalindrome("0P"));
        Check.eq("\\"No 'x' in Nixon\\"", true, () -> s.isPalindrome("No 'x' in Nixon"));
        StringBuilder big = new StringBuilder();
        for (int i = 0; i < 100000; i++) big.append((char) ('a' + i % 26));
        String half = big.toString();
        String pal = half + new StringBuilder(half).reverse();
        Check.eq("bada palindrome (2 lakh chars)", true, () -> s.isPalindrome(pal));
    }
}`,
      hints: [
        "Do pointers: <code>left = 0</code>, <code>right = s.length() - 1</code>. Jab tak <code>left &lt; right</code>.",
        "Jo character letter/digit nahi hai use skip karo: <code>Character.isLetterOrDigit(c)</code>.",
        "Dono taraf ke valid chars ko <code>Character.toLowerCase</code> karke compare karo. Match na ho to false, warna left++ aur right--."
      ],
      solution:
`class Solution {
    boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            char a = s.charAt(left), b = s.charAt(right);
            if (!Character.isLetterOrDigit(a)) { left++; continue; }
            if (!Character.isLetterOrDigit(b)) { right--; continue; }
            if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
            left++;
            right--;
        }
        return true;
    }
}`,
      explain: "<p>Two pointers ek dusre ki taraf chalte hain. Har character max ek baar dekha jaata hai: time O(n), space O(1).</p><p>Ek aur tareeka: saaf string banao (sirf letters/digits, lowercase), phir use reverse karke compare karo. Ye bhi O(n) hai par O(n) extra memory leta hai. Interview mein pehle simple wala bolo, phir O(1) space wala.</p>" },
    { type: "think", id: "think-eq",
      q: "Interview question: <b>Strings ko compare karne ke liye <code>==</code> kyun nahi, <code>equals()</code> kyun?</b> Kab <code>==</code> true deta hai aur kab false?",
      rubric: [
        { point: "<code>==</code> <b>reference</b> (same object / memory address) compare karta hai", keys: ["reference", "address", "same object", "memory", "object compare", "location"], weight: 2 },
        { point: "<code>equals()</code> <b>content</b> (characters) compare karta hai", keys: ["content", "value", "characters", "andar ka", "text compare", "data"], weight: 2 },
        { point: "Literals <b>String pool</b> mein share hote hain, isliye do same literals pe <code>==</code> true ho sakta hai", keys: ["pool", "intern", "literal"] },
        { point: "<code>new String(...)</code> ya runtime pe bani strings alag objects hain, <code>==</code> false", keys: ["new string", "new object", "runtime", "alag object", "different object", "naya object"] },
        { point: "Null-safe tareeka: <code>\"abc\".equals(s)</code> ya <code>Objects.equals(a, b)</code>", keys: ["objects.equals", "null safe", "null-safe", "\"abc\".equals", "nullpointer", "npe"] }
      ],
      answer: `<p><code>==</code> objects pe <b>reference</b> compare karta hai: kya dono variable same object ki taraf point kar rahe hain. <code>equals()</code> String mein override hai aur <b>characters</b> compare karta hai.</p>
        <p>String literals String pool mein store hote hain, isliye <code>"hi" == "hi"</code> true aata hai (same object). Par <code>new String("hi")</code>, user input, ya concatenation se runtime pe bani string naya object hota hai, wahan <code>==</code> false deta hai jabki content same hai.</p>
        <p>Isliye hamesha <code>equals()</code>. Null ka darr ho to <code>"hi".equals(s)</code> (literal pehle) ya <code>Objects.equals(a, b)</code> use karo.</p>` },
    { type: "tip", html: "🎤 <b>Interview tip:</b> String problems mein pehle poochho: <i>case-sensitive hai? spaces/special characters count honge? empty string ka kya answer hai?</i> Ye clarifying questions interviewer ko dikhate hain ki aap edge cases ke baare mein sochte ho." }
  ],
  references: [
    { title: "Java 17 API: String", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html", type: "docs" },
    { title: "Learn Java: Operators", by: "dev.java", url: "https://dev.java/learn/language-basics/using-operators/", type: "docs" },
    { title: "Valid Palindrome (LeetCode 125)", by: "LeetCode", url: "https://leetcode.com/problems/valid-palindrome/", type: "article" }
  ]
});
