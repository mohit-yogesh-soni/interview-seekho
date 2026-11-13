// String deep dive
registerLesson("java", "strings-deep", {
  why: "String Java ka sabse zyada use hone wala class hai. Interview mein 'String immutable kyun hai?', 'String pool kya hai?', aur 'StringBuilder vs StringBuffer' lagbhag har Java round mein aate hain. Loop mein + se string jodna DSA solutions ko TLE bhi karwata hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Immutable matlab kya?</h2>
              <p>Ek baar <code>String</code> object ban gaya, uske characters <b>kabhi nahi badalte</b>. <code>toUpperCase()</code>, <code>replace()</code>, <code>concat()</code> jaise methods purane object ko nahi chhedte, <b>naya String</b> return karte hain.</p>
              <pre class="code-static">String s = "swiggy";
s.toUpperCase();          // naya "SWIGGY" bana, par kisi variable mein nahi gaya
System.out.println(s);    // swiggy  (s abhi bhi purane object ko point karta hai)
s = s.toUpperCase();      // ab s naye object ko point karta hai</pre>
              <h2>String pool</h2>
              <p>Java program mein same text (jaise <code>"OK"</code>, <code>"userId"</code>) hazaaron baar aata hai. Har baar naya object banana memory ki barbaadi hai. Isliye JVM heap mein ek <b>String pool</b> rakhta hai: <b>string literals</b> wahan ek hi baar store hote hain aur sab variables same object share karte hain. Ye sharing tabhi safe hai jab String badal na sake. Isliye pool aur immutability saath chalte hain.</p>
              <pre class="diagram">
  Stack                       Heap
 ┌──────┐            ┌───────────────────────────┐
 │ s1 ──┼──────┐     │   String pool              │
 │ s2 ──┼──────┼────►│   ┌────────┐               │
 │ s3 ──┼──┐   └────►│   │ "java" │               │
 └──────┘  │         │   └────────┘               │
           │         │                            │
           └────────►│   ┌────────┐ (pool ke bahar│
                     │   │ "java" │  naya object) │
                     │   └────────┘               │
                     └───────────────────────────┘
 s1 = "java";  s2 = "java";  s3 = new String("java");</pre>
              <ul>
                <li><code>s1 == s2</code> → <b>true</b> (same pooled object)</li>
                <li><code>s1 == s3</code> → <b>false</b> (<code>new</code> hamesha naya object banata hai)</li>
                <li><code>s1.equals(s3)</code> → <b>true</b> (characters same hain)</li>
              </ul>
              <p>Java 7 se pool normal heap mein hai (pehle PermGen mein tha), isliye unused pooled strings bhi garbage collect ho sakte hain.</p>`
    },
    {
      type: "code",
      title: "== vs equals, compile-time constants aur intern(). Har line ka output pehle socho.",
      code: `public class Main {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";
        String c = new String("hello");
        System.out.println("a == b      : " + (a == b));
        System.out.println("a == c      : " + (a == c));
        System.out.println("a.equals(c) : " + a.equals(c));

        // Compile-time constant: compiler khud "hel" + "lo" ko "hello" bana deta hai
        String d = "hel" + "lo";
        System.out.println("a == d      : " + (a == d));

        // Runtime pe jodna: naya object banta hai, pool mein nahi jaata
        String part = "hel";
        String e = part + "lo";
        System.out.println("a == e      : " + (a == e));

        // final variable bhi compile-time constant ban jaata hai
        final String fpart = "hel";
        String f = fpart + "lo";
        System.out.println("a == f      : " + (a == f));

        // intern(): pool wala object do (nahi hai to pool mein daal do)
        System.out.println("a == e.intern(): " + (a == e.intern()));

        // Immutability: concat purane object ko nahi badalta
        String city = "Pune";
        city.concat(" Maharashtra");
        System.out.println(city);
    }
}`,
      note: "Rule simple hai: <b>String compare karne ke liye hamesha <code>equals()</code></b>. <code>==</code> sirf ye batata hai ki dono variable same object pe point kar rahe hain ya nahi."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">String x = "ab";
String y = "a";
String z = y + "b";
System.out.println((x == z) + " " + x.equals(z));</pre>`,
      options: ["true true", "false true", "false false", "true false"],
      answer: 1,
      why: "<code>y</code> ek normal (non-final) variable hai, isliye <code>y + \"b\"</code> runtime pe banta hai aur naya object hai. Pool wala <code>\"ab\"</code> alag object hai, to <code>==</code> false. Characters same hain, to <code>equals</code> true."
    },
    {
      type: "text",
      html: `
              <h2>String immutable kyun rakha gaya?</h2>
              <table>
                <tr><th>Reason</th><th>Matlab</th></tr>
                <tr><td><b>Pool / sharing</b></td><td>Hazaaron variables ek object share karte hain. Agar koi ek badal deta, to sabka value badal jaata.</td></tr>
                <tr><td><b>Security</b></td><td>File path, DB URL, class name, username String mein jaate hain. Check ke baad koi value badal na sake.</td></tr>
                <tr><td><b>hashCode cache</b></td><td>String apna <code>hashCode</code> pehli baar calculate karke andar save kar leta hai. Value badal nahi sakti, isliye cache hamesha sahi rehta hai. Isliye String HashMap key ke liye best hai.</td></tr>
                <tr><td><b>Thread safety</b></td><td>Immutable object ko kitne bhi threads bina lock ke padh sakte hain.</td></tr>
              </table>
              <p><b>Java 9 ka badlaav (Compact Strings, JEP 254):</b> pehle String andar <code>char[]</code> (har char 2 bytes) rakhta tha. Ab <code>byte[]</code> + ek <code>coder</code> flag hai. Agar saare characters Latin-1 mein aate hain (jaise English text) to 1 byte per char, warna UTF-16 (2 bytes). English-heavy apps mein String memory lagbhag aadhi ho jaati hai.</p>`
    },
    {
      type: "steps",
      title: "Loop mein s += i kya karta hai (memory mein)",
      steps: [
        { title: "Shuru: s = \"\"", html: `<div class="arr"><span class="cell hl">""</span></div><p>Ek khaali String object.</p>` },
        { title: "i = 0: s = s + 0", html: `<div class="arr"><span class="cell dim">""</span><span class="cell hl">"0"</span></div><p>Naya object banaya, purana garbage. 1 char copy hua.</p>` },
        { title: "i = 1: s = s + 1", html: `<div class="arr"><span class="cell dim">""</span><span class="cell dim">"0"</span><span class="cell hl">"01"</span></div><p>Phir naya object. Purane "0" ko copy kiya + "1". 2 chars copy.</p>` },
        { title: "i = 2: s = s + 2", html: `<div class="arr"><span class="cell dim">""</span><span class="cell dim">"0"</span><span class="cell dim">"01"</span><span class="cell hl">"012"</span></div><p>3 chars copy. Har step pe <b>poori string dobara copy</b> hoti hai.</p>` },
        { title: "n iterations ke baad", html: `<p>Total copy = 1 + 2 + 3 + ... + n = n(n+1)/2 = <b>O(n²)</b>. n = 1 lakh ho to ~5 billion char copies aur 1 lakh garbage objects.</p><p><b>StringBuilder</b> ek resizable buffer rakhta hai. Har <code>append</code> buffer ke end mein likhta hai. Buffer bhar jaaye to ~2x bada hota hai, isliye total kaam <b>O(n)</b> amortized.</p>` }
      ]
    },
    {
      type: "code",
      title: "+ vs StringBuilder: time khud dekho (numbers machine pe depend karenge)",
      code: `public class Main {
    public static void main(String[] args) {
        int n = 3000;

        long t0 = System.nanoTime();
        String s = "";
        for (int i = 0; i < n; i++) {
            s += i;              // har baar naya String
        }
        long t1 = System.nanoTime();

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(i);        // same buffer mein likho
        }
        String s2 = sb.toString();
        long t2 = System.nanoTime();

        System.out.println("Same result? " + s.equals(s2));
        System.out.println("+ operator   : " + (t1 - t0) / 1_000 + " micros");
        System.out.println("StringBuilder: " + (t2 - t1) / 1_000 + " micros");
        System.out.println("n badha ke dekho (jaise 6000): + wala ~4x slow hoga, builder ~2x");
    }
}`,
      note: "Java 9 se <code>a + b + c</code> ek hi statement mein ho to compiler <code>invokedynamic</code> (JEP 280) se efficient code banata hai. Problem sirf <b>loop ke andar</b> baar baar jodne mein hai, kyunki har iteration ek naya String banata hai."
    },
    {
      type: "text",
      html: `
              <h2>StringBuilder vs StringBuffer</h2>
              <table>
                <tr><th></th><th>String</th><th>StringBuilder</th><th>StringBuffer</th></tr>
                <tr><td>Mutable?</td><td>Nahi</td><td>Haan</td><td>Haan</td></tr>
                <tr><td>Thread-safe?</td><td>Haan (immutable hai)</td><td>Nahi</td><td>Haan (methods <code>synchronized</code>)</td></tr>
                <tr><td>Speed</td><td>Loop mein slow</td><td>Sabse fast</td><td>Lock ki wajah se thoda slow</td></tr>
                <tr><td>Kab aaya</td><td>Java 1.0</td><td>Java 5</td><td>Java 1.0</td></tr>
                <tr><td>Kab use karein</td><td>Default, keys, constants</td><td>Method ke andar string banana (99% cases)</td><td>Legacy code. Ek builder ko threads ke beech share karna hi galat design hai.</td></tr>
              </table>
              <p><b>Internals:</b> <code>new StringBuilder()</code> ki default capacity 16 hai. Bharne pe OpenJDK naya capacity lagbhag <code>2 × purana + 2</code> rakhta hai aur data copy karta hai. Size pehle se pata ho to <code>new StringBuilder(expectedSize)</code> se copies bach jaati hain.</p>`
    },
    {
      type: "code",
      title: "StringBuilder ke kaam ke methods + ek trap",
      code: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("zomato");
        sb.append('!').append(2024);          // chaining: har method same builder return karta hai
        System.out.println(sb);               // zomato!2024
        sb.insert(0, "@");                    // index 0 pe daalo
        sb.setCharAt(1, 'Z');                 // ek char badlo
        sb.deleteCharAt(sb.length() - 1);     // last char hatao
        System.out.println(sb);
        System.out.println(sb.reverse());     // reverse() builder ko hi badal deta hai
        System.out.println(sb);               // ab sb reversed hi hai

        // Trap: StringBuilder equals() override nahi karta (Object wala == hai)
        StringBuilder x = new StringBuilder("abc");
        StringBuilder y = new StringBuilder("abc");
        System.out.println("x.equals(y): " + x.equals(y));
        System.out.println("toString compare: " + x.toString().equals(y.toString()));
        System.out.println("compareTo (Java 11+): " + x.compareTo(y));
    }
}`
    },
    {
      type: "quiz",
      q: "<code>Set&lt;StringBuilder&gt;</code> mein do baar <code>new StringBuilder(\"upi\")</code> add kiya. Set ka size kya hoga?",
      options: ["1, kyunki content same hai", "2, kyunki StringBuilder equals/hashCode override nahi karta", "Compile error", "0"],
      answer: 1,
      why: "StringBuilder <code>Object</code> ka <code>equals</code> aur <code>hashCode</code> use karta hai (identity). Do alag objects = do entries. Mutable cheez ko Set/Map key banana waise bhi khatarnak hai. Key ke liye <code>toString()</code> karke String use karo."
    },
    {
      type: "exercise",
      id: "ex-reverse-words",
      title: "Sentence ke words ulte karo",
      level: "Medium",
      task: `<p><code>reverseWords(s)</code> likho jo sentence ke <b>words ka order</b> ulta kar de. Words ke andar ke letters nahi badalne.</p>
             <ul><li>Shuru aur end ke extra spaces hata do.</li><li>Do words ke beech kitne bhi spaces hon, answer mein sirf <b>ek space</b> ho.</li></ul>
             <p>Inspired by <a href="https://leetcode.com/problems/reverse-words-in-a-string/" target="_blank">LeetCode 151</a>.</p>`,
      examples: "<code>\"the sky is blue\"</code> → <code>\"blue is sky the\"</code><br><code>\"  hello   world  \"</code> → <code>\"world hello\"</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    String reverseWords(String s) {
        // Hint: trim(), split("\\\\s+") aur StringBuilder
        return s;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"the sky is blue\\"", "blue is sky the", () -> s.reverseWords("the sky is blue"));
        Check.eq("\\"  hello   world  \\"", "world hello", () -> s.reverseWords("  hello   world  "));
        Check.hiddenFromHere();
        Check.eq("single word", "java", () -> s.reverseWords("java"));
        Check.eq("single word with spaces", "java", () -> s.reverseWords("   java   "));
        Check.eq("tabs aur spaces", "c b a", () -> s.reverseWords("a \\t b  c"));
        StringBuilder big = new StringBuilder();
        for (int i = 0; i < 100000; i++) big.append("w").append(i % 10).append("  ");
        Check.eq("bada input (1 lakh words)", 100000, () -> s.reverseWords(big.toString()).split(" ").length);
    }
}`,
      hints: [
        "Pehle <code>s.trim()</code>, phir <code>split(\"\\\\s+\")</code>: ye ek ya zyada whitespace pe todta hai.",
        "Array ko last index se 0 tak chalao aur <code>StringBuilder</code> mein append karo. Loop mein <code>+=</code> mat karo (bada input TLE).",
        "Har word ke baad space daalo, sirf aakhri ke baad nahi: <code>if (i > 0) sb.append(' ');</code>"
      ],
      solution: `class Solution {
    String reverseWords(String s) {
        String[] words = s.trim().split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(' ');
        }
        return sb.toString();
    }
}`,
      explain: "<p><code>trim</code> + <code>split(\"\\\\s+\")</code> se saare words mil jaate hain (beech ke extra spaces gayab). Ulte order mein StringBuilder mein jodo.</p><p>Time O(n), space O(n). Alternative one-liner: <code>Collections.reverse(Arrays.asList(words)); String.join(\" \", words)</code>. Interview mein follow-up aa sakta hai: <i>\"char[] pe in-place karo\"</i>: poori string reverse karo, phir har word ko dobara reverse karo.</p>"
    },
    {
      type: "exercise",
      id: "ex-compress",
      title: "String compress karo (run-length)",
      level: "Easy",
      task: `<p><code>compress(s)</code> likho: lagataar repeat hone wale characters ko <b>char + count</b> se badlo. Count 1 ho to sirf char likho.</p>
             <p>Agar compressed string original se <b>chhoti nahi</b> hai, to original hi return karo.</p>
             <p>Similar idea: <a href="https://leetcode.com/problems/string-compression/" target="_blank">LeetCode 443</a> (wahan in-place array hai).</p>`,
      examples: "<code>\"aaabccdddd\"</code> → <code>\"a3bc2d4\"</code><br><code>\"abc\"</code> → <code>\"abc\"</code> (compress karne se chhota nahi hota)<br><code>\"aabb\"</code> → <code>\"aabb\"</code> (\"a2b2\" same length hai, chhota nahi)",
      userFile: "Solution.java",
      starter: `class Solution {
    String compress(String s) {
        String out = "";
        // yahan logic likho (StringBuilder use karo!)
        return out;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"aaabccdddd\\"", "a3bc2d4", () -> s.compress("aaabccdddd"));
        Check.eq("\\"abc\\"", "abc", () -> s.compress("abc"));
        Check.hiddenFromHere();
        Check.eq("empty", "", () -> s.compress(""));
        Check.eq("\\"aabb\\" same length", "aabb", () -> s.compress("aabb"));
        Check.eq("12 a (2 digit count)", "a12", () -> s.compress("aaaaaaaaaaaa"));
        Check.eq("end mein run", "ab5", () -> s.compress("abbbbb"));
        StringBuilder big = new StringBuilder();
        for (int i = 0; i < 100000; i++) big.append("xxxy");
        String bigS = big.toString();
        Check.eq("bada input (4 lakh chars)", 300000, () -> s.compress(bigS).length());
    }
}`,
      hints: [
        "Index <code>i</code> pe khade ho, <code>j</code> ko aage badhao jab tak <code>s.charAt(j) == s.charAt(i)</code>. Run ki length = <code>j - i</code>.",
        "Char append karo, aur length &gt; 1 ho to number bhi. Phir <code>i = j</code>.",
        "End mein: <code>return sb.length() &lt; s.length() ? sb.toString() : s;</code>"
      ],
      solution: `class Solution {
    String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            sb.append(s.charAt(i));
            if (j - i > 1) sb.append(j - i);
            i = j;
        }
        return sb.length() < s.length() ? sb.toString() : s;
    }
}`,
      explain: "<p>Two-pointer se har run ek baar padha jaata hai: time O(n), extra space O(n) builder ke liye. Bade test mein <code>+=</code> wala solution O(n²) ho jaata hai aur time limit cross karta hai.</p>"
    },
    {
      type: "think",
      id: "think-immutable",
      q: "Interview question: <b>\"String immutable kyun hai? Agar mutable hota to kya problem aati?\"</b>",
      rubric: [
        { point: "<b>String pool</b>: same literal kai variables share karte hain, mutable hota to ek ka change sabko dikhta", keys: ["pool", "share", "literal", "intern"], weight: 2 },
        { point: "<b>Security</b>: file path, URL, DB connection, class name, password check ke baad badal na sake", keys: ["security", "secure", "path", "url", "password", "class load", "classloader"] },
        { point: "<b>hashCode cache</b> aur HashMap key ke liye safe", keys: ["hashcode", "hash code", "hashmap", "map key", "cache"], weight: 2 },
        { point: "<b>Thread-safe</b> bina synchronization ke", keys: ["thread", "synchroniz", "concurren", "lock"] },
        { point: "Bonus: badalna ho to <b>StringBuilder</b>; password ke liye <code>char[]</code> taaki use ke baad clear kar sako", keys: ["stringbuilder", "char[]", "char array", "clear"] }
      ],
      answer: `<p>Chaar reasons:</p>
               <ol><li><b>String pool:</b> <code>"OK"</code> jaisa literal poore app mein ek hi object hai. Agar String mutable hota, to ek jagah badalne se har jagah badal jaata.</li>
               <li><b>Security:</b> file paths, DB URLs, class names String mein pass hote hain. Validation ke baad koi doosra reference value badal deta to check bekaar ho jaata.</li>
               <li><b>hashCode caching:</b> String apna hash ek baar calculate karke rakh leta hai. Isliye HashMap key ke roop mein fast aur safe hai. Mutable key ka hash badal jaata aur entry map mein "kho" jaati.</li>
               <li><b>Thread safety:</b> immutable object ko bina lock ke share kar sakte ho.</li></ol>
               <p>Trade-off: har modification naya object banata hai, isliye loops mein <code>StringBuilder</code> use karo. Password ke liye <code>char[]</code> prefer karte hain, kyunki String pool/heap mein GC tak padi rehti hai aur use clear nahi kar sakte.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"<code>new String(\"abc\")</code> kitne objects banata hai?\" ka safe answer: <b>ek ya do</b>. Literal <code>\"abc\"</code> pool mein pehle se nahi hai to pehli baar use hone pe pool mein jaata hai (1), aur <code>new</code> heap pe hamesha ek naya object banata hai (1). Pool mein pehle se ho to sirf 1 naya object banta hai."
    }
  ],
  references: [
    { title: "String (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html", type: "docs" },
    { title: "StringBuilder (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StringBuilder.html", type: "docs" },
    { title: "JEP 254: Compact Strings", by: "OpenJDK", url: "https://openjdk.org/jeps/254", type: "docs" },
    { title: "JEP 280: Indify String Concatenation", by: "OpenJDK", url: "https://openjdk.org/jeps/280", type: "docs" },
    { title: "Effective Java (3rd ed.), Item 17 (minimize mutability) aur Item 63 (string concatenation)", by: "Joshua Bloch", type: "book" }
  ]
});
