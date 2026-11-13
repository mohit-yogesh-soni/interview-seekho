// Tricky output questions
registerLesson("java", "output-questions", {
  why: "Written rounds, MCQ tests (HackerRank/Mettl) aur face-to-face mein \"is code ka output kya hoga?\" bahut aata hai. Ye sawaal yaad karne se nahi, 8-10 rules samajhne se solve hote hain: init order, String pool, finally, overloading ke phases, Integer cache, numeric promotion. Har sawaal pehle khud socho, phir code chala ke verify karo.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Output sawaal solve karne ka tareeka</h2>
              <ol>
                <li><b>Compile hoga ya nahi?</b> Pehle ye check karo. Ambiguous overload, unreachable code, type mismatch: option mein \"Compile error\" aksar sahi hota hai.</li>
                <li><b>Compile time vs runtime:</b> overloading compile time pe (reference type se), overriding runtime pe (object type se). Static methods aur fields override nahi hote.</li>
                <li><b>Order:</b> expression left se right evaluate hota hai, par precedence (<code>*</code> before <code>+</code>, <code>&amp;&amp;</code> before <code>||</code>) grouping decide karti hai.</li>
                <li><b>Types:</b> <code>char + int</code> = int, <code>String + kuch bhi</code> = String, ternary mein dono branches ek common type mein promote hote hain.</li>
                <li>Paper pe <b>variables ki table</b> banao aur har line ke baad update karo.</li>
              </ol>`
    },
    {
      type: "text",
      html: `
              <h2>1. Static vs instance initialization order</h2>
              <p>Class pehli baar use hone pe <b>ek baar</b> load hoti hai: tab static fields aur static blocks (upar se neeche, likhe hue order mein) chalte hain. Parent class pehle initialize hoti hai.</p>
              <p>Har <code>new</code> pe: constructor ki pehli line <code>super(...)</code> (likha ho ya nahi) → parent ka poora object setup → phir child ke instance fields + instance blocks (likhe hue order mein) → phir child constructor ki baaki body.</p>`
    },
    {
      type: "order",
      id: "order-init",
      q: "<code>new Child()</code> pehli baar chala (Child extends Parent). Sahi order lagao:",
      items: [
        "Parent ke static blocks / static fields",
        "Child ke static blocks / static fields",
        "Parent ke instance blocks / instance fields",
        "Parent constructor ki body",
        "Child ke instance blocks / instance fields",
        "Child constructor ki body"
      ],
      why: "Statics class load pe (parent pehle), sirf ek baar. Instance part har object ke liye: parent ka poora (blocks + constructor), phir child ka. Doosri baar <code>new Child()</code> pe pehle do steps nahi chalte."
    },
    {
      type: "quiz",
      q: `Output ki pehli 4 lines kya hongi?<pre class="code-static">class Parent {
    static { System.out.println("P-static"); }
    { System.out.println("P-block"); }
    Parent() { System.out.println("P-cons"); }
}
class Child extends Parent {
    static { System.out.println("C-static"); }
    { System.out.println("C-block"); }
    Child() { System.out.println("C-cons"); }
}
// main: new Child(); new Child();</pre>`,
      options: [
        "P-static, P-block, P-cons, C-static",
        "P-static, C-static, P-block, P-cons",
        "C-static, P-static, C-block, P-block",
        "P-static, C-static, C-block, P-block"
      ],
      answer: 1,
      why: "Pehle dono static blocks (Parent, phir Child). Phir object: Parent ka instance block + constructor, phir Child ka block + constructor. Doosre <code>new Child()</code> pe sirf P-block, P-cons, C-block, C-cons (statics dobara nahi)."
    },
    {
      type: "code",
      title: "Verify: init order, aur doosre object pe static dobara nahi chalta",
      code: `public class Main {
    static class Parent {
        static { System.out.println("P-static"); }
        { System.out.println("P-block"); }
        Parent() { System.out.println("P-cons"); }
    }

    static class Child extends Parent {
        static { System.out.println("C-static"); }
        { System.out.println("C-block"); }
        Child() { System.out.println("C-cons"); }
    }

    public static void main(String[] args) {
        System.out.println("main shuru");
        new Child();
        System.out.println("--- doosra object ---");
        new Child();
    }
}`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">class Base {
    Base() { show(); }
    void show() { System.out.println("Base"); }
}
class Bike extends Base {
    private String name = "pulsar";
    private int speed = 80;
    Bike() { show(); }
    @Override void show() { System.out.println(name + " " + speed); }
}
// main: new Bike();</pre>`,
      options: ["Base, phir pulsar 80", "pulsar 80, phir pulsar 80", "null 0, phir pulsar 80", "Compile error: constructor mein overridable method"],
      answer: 2,
      why: "<code>Base()</code> chalte waqt object asal mein Bike hai, to <code>show()</code> Bike wala chalta hai (dynamic dispatch). Par Bike ke field initializers abhi chale hi nahi (wo <code>super()</code> ke <b>baad</b> chalte hain), to default values: <code>null</code> aur <code>0</code>. Isliye constructor se overridable method call mat karo."
    },
    {
      type: "code",
      title: "Verify: constructor se overridden method call + static field ka forward reference",
      code: `public class Main {
    static class Base {
        Base() { show(); }
        void show() { System.out.println("Base"); }
    }

    static class Bike extends Base {
        private String name = "pulsar";
        private int speed = 80;
        Bike() { show(); }
        @Override void show() { System.out.println(name + " " + speed); }
    }

    static int a = next();       // b abhi assign nahi hua (default 0)
    static int b = 10;
    static int next() { return b + 1; }

    public static void main(String[] args) {
        new Bike();
        System.out.println("a=" + a + " b=" + b);
    }
}`,
      note: "Static fields bhi upar se neeche initialize hote hain. <code>a = next()</code> ke waqt <code>b</code> abhi default 0 hai, to a = 1. Method ke through padhne pe compiler error nahi deta (seedha <code>static int a = b + 1;</code> likhte to \"illegal forward reference\" compile error)."
    },
    {
      type: "text",
      html: `
              <h2>2. String pool aur ==</h2>
              <ul>
                <li>String <b>literals</b> aur <b>compile-time constant</b> expressions (<code>"ja" + "va"</code>, ya <code>final</code> constant variables se bane) compile time pe hi ek String ban jaate hain aur pool se share hote hain.</li>
                <li>Runtime pe jo concatenation hota hai (non-final variable ke saath) wo <b>naya object</b> banata hai, chahe content same ho.</li>
                <li><code>intern()</code> pool wala object return karta hai.</li>
                <li><code>+</code> ki precedence <code>==</code> se zyada hai: <code>"x: " + a == b</code> matlab <code>("x: " + a) == b</code>.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">String a = "java";
String b = "ja" + "va";
String part = "ja";
String c = part + "va";
final String fpart = "ja";
String d = fpart + "va";
System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == c.intern()));</pre>`,
      options: ["true true true true", "true false false true", "true false true true", "false false true true"],
      answer: 2,
      why: "<code>\"ja\" + \"va\"</code> constant expression hai → compile time pe \"java\" → pool wala same object (true). <code>part</code> final nahi, to <code>part + \"va\"</code> runtime pe naya object (false). <code>fpart</code> final aur constant se initialized hai, to <code>fpart + \"va\"</code> bhi compile-time constant (true). <code>intern()</code> pool wala object deta hai (true)."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">String a = "upi";
String b = new String("upi");
System.out.println("same: " + a == b);
System.out.println("same: " + a.equals(b));</pre>`,
      options: ["same: false, same: true", "false, same: true", "same: true, same: true", "Compile error"],
      answer: 1,
      why: "<code>+</code> pehle: <code>\"same: \" + a</code> = \"same: upi\". Phir <code>\"same: upi\" == b</code> → false. Println mein sirf <code>false</code> aata hai, \"same:\" bhi nahi! Doosri line mein method call ki precedence sabse upar hai, to \"same: true\"."
    },
    {
      type: "code",
      title: "Verify: String pool, final constant, intern, aur + vs == precedence",
      code: `public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "ja" + "va";
        String part = "ja";
        String c = part + "va";
        final String fpart = "ja";
        String d = fpart + "va";
        System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == c.intern()));
        System.out.println(a.equals(c));

        String x = "upi";
        String y = new String("upi");
        System.out.println("same: " + x == y);
        System.out.println("same: " + x.equals(y));
        System.out.println("same: " + (x == y));
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>3. finally aur return</h2>
              <ul>
                <li><code>finally</code> hamesha chalta hai jab control try/catch se bahar jaata hai (return, exception, normal end). Exception: JVM hi band ho jaaye (jaise <code>System.exit</code>) ya thread mar jaaye.</li>
                <li><code>return x;</code> pe <b>value pehle calculate karke save</b> hoti hai, phir finally chalta hai. Primitive ko finally mein badalne se return value nahi badalti. Object ko <b>mutate</b> karne se badalti hai (reference wahi hai).</li>
                <li>finally mein khud <code>return</code> likha to wo try ka return <b>aur</b> try ka exception, dono ko overwrite kar deta hai. Exception gayab! Isliye finally mein return mat likho.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `<code>f()</code> aur <code>g()</code> kya return karenge?<pre class="code-static">static int f() {
    try { return 1; }
    finally { return 2; }
}
static int g() {
    int x = 1;
    try { return x; }
    finally { x = 99; }
}</pre>`,
      options: ["1 aur 1", "2 aur 99", "2 aur 1", "1 aur 99"],
      answer: 2,
      why: "<code>f</code>: finally ka <code>return 2</code> try ke return ko overwrite karta hai → 2. <code>g</code>: <code>return x</code> pe value 1 save ho gayi, phir finally ne local <code>x</code> badla par saved value nahi → 1."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">static StringBuilder h() {
    StringBuilder sb = new StringBuilder("chai");
    try { return sb; }
    finally { sb.append(" samosa"); }
}
static int k() {
    try { throw new RuntimeException("boom"); }
    finally { return 3; }
}
// main: System.out.println(h()); System.out.println(k());</pre>`,
      options: ["chai, phir RuntimeException: boom", "chai samosa, phir 3", "chai, phir 3", "chai samosa, phir RuntimeException: boom"],
      answer: 1,
      why: "<code>h</code>: saved value ek reference hai; finally ne usi object ko mutate kiya, to caller ko \"chai samosa\" dikhta hai. <code>k</code>: finally ke <code>return</code> ne exception ko nigal liya, method normally 3 return karta hai. Production mein ye bug dhoondhna bahut mushkil hota hai."
    },
    {
      type: "code",
      title: "Verify: finally ke chaaron cases",
      code: `public class Main {
    @SuppressWarnings("finally")
    static int f() {
        try { return 1; }
        finally { return 2; }
    }

    static int g() {
        int x = 1;
        try { return x; }
        finally { x = 99; }
    }

    static StringBuilder h() {
        StringBuilder sb = new StringBuilder("chai");
        try { return sb; }
        finally { sb.append(" samosa"); }
    }

    @SuppressWarnings("finally")
    static int k() {
        try { throw new RuntimeException("boom"); }
        finally { return 3; }
    }

    static String log() {
        StringBuilder steps = new StringBuilder();
        try {
            steps.append("try ");
            throw new IllegalStateException();
        } catch (IllegalStateException e) {
            steps.append("catch ");
            return steps.toString();          // String abhi ban gaya: "try catch "
        } finally {
            steps.append("finally");          // builder badla, par return wali String nahi
            System.out.println("  (finally chala, builder = " + steps + ")");
        }
    }

    public static void main(String[] args) {
        System.out.println("f = " + f());
        System.out.println("g = " + g());
        System.out.println("h = " + h());
        System.out.println("k = " + k());
        System.out.println("log = [" + log() + "]");
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>4. Overloading resolution: compiler kaunsa method chunta hai</h2>
              <p>Overloading <b>compile time</b> pe tay hoti hai. Compiler teen phases mein dhoondhta hai, aur jis phase mein match mil gaya wahin ruk jaata hai:</p>
              <ol>
                <li><b>Phase 1:</b> exact match ya <b>widening</b> (int → long → float → double, char → int), bina boxing aur varargs ke.</li>
                <li><b>Phase 2:</b> <b>boxing/unboxing</b> allowed (int → Integer → Object).</li>
                <li><b>Phase 3:</b> <b>varargs</b> allowed.</li>
              </ol>
              <p>Ek phase mein kai candidates hon to <b>most specific</b> jeetta hai (String, Object se zyada specific hai). Koi most specific na ho to <b>ambiguous</b> = compile error.</p>
              <p>Isliye: widening &gt; boxing &gt; varargs. Aur <code>null</code> kisi bhi reference type mein ja sakta hai, to sabse specific reference type wala method chalta hai.</p>`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">static void m(long x)    { System.out.print("long "); }
static void m(Integer x) { System.out.print("Integer "); }
static void m(int... x)  { System.out.print("varargs "); }

static void n(Object x)  { System.out.print("Object "); }
static void n(int... x)  { System.out.print("varargs "); }

// main: m(5); n(5);</pre>`,
      options: ["Integer varargs", "long Object", "long varargs", "Integer Object"],
      answer: 1,
      why: "<code>m(5)</code>: phase 1 mein int → long widening se <code>m(long)</code> mil gaya, boxing tak gaye hi nahi. <code>n(5)</code>: phase 1 mein koi nahi (int se Object widening nahi hota), phase 2 mein boxing: int → Integer → Object mil gaya. Varargs sabse aakhri phase hai."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">static void pay(Object o) { System.out.println("Object"); }
static void pay(String s) { System.out.println("String"); }
// main: pay(null);</pre>`,
      options: ["Object", "String", "Compile error: ambiguous", "NullPointerException"],
      answer: 1,
      why: "<code>null</code> dono mein ja sakta hai. String, Object ka subtype hai, to <code>pay(String)</code> zyada specific hai aur wahi chalta hai. Agar <code>pay(String)</code> aur <code>pay(Integer)</code> hote (dono mein koi relation nahi), to ambiguous compile error aata (neeche dekho)."
    },
    {
      type: "code",
      title: "Verify: widening > boxing > varargs, null ke liye most specific, char ka widening",
      code: `public class Main {
    static void m(long x)    { System.out.println("m(long)"); }
    static void m(Integer x) { System.out.println("m(Integer)"); }
    static void m(int... x)  { System.out.println("m(int...)"); }

    static void n(Object x)  { System.out.println("n(Object)"); }
    static void n(int... x)  { System.out.println("n(int...)"); }

    static void p(int x)       { System.out.println("p(int)"); }
    static void p(Character x) { System.out.println("p(Character)"); }

    static void pay(Object o) { System.out.println("pay(Object)"); }
    static void pay(String s) { System.out.println("pay(String)"); }

    public static void main(String[] args) {
        m(5);          // widening int -> long
        m(5, 6);       // sirf varargs fit hota hai
        n(5);          // boxing int -> Integer -> Object
        n();           // zero args: sirf varargs
        p('a');        // char -> int widening, boxing se pehle
        pay(null);     // most specific
        Object o = "hello";
        pay(o);        // compile time type Object hai, runtime type nahi dekha jaata
    }
}`,
      note: "Aakhri line important hai: <code>o</code> asal mein String hai, phir bhi <code>pay(Object)</code> chala. Overloading <b>reference ke declared type</b> se compile time pe decide hoti hai. Overriding (runtime) se iska farak interview ka favourite hai."
    },
    {
      type: "code",
      expectError: true,
      title: "Ambiguous overload: null do unrelated types mein ja sakta hai",
      code: `public class Main {
    static void pay(String s)  { System.out.println("String"); }
    static void pay(Integer i) { System.out.println("Integer"); }

    public static void main(String[] args) {
        pay(null);          // ❌ reference to pay is ambiguous
    }
}`,
      note: "Fix: cast karke batao: <code>pay((String) null)</code>."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">List&lt;Integer&gt; list = new ArrayList&lt;&gt;(List.of(10, 20, 30));
list.remove(1);
System.out.println(list);
Set&lt;Long&gt; ids = new HashSet&lt;&gt;(Set.of(5L));
System.out.println(ids.contains(5));</pre>`,
      options: ["[20, 30] aur true", "[10, 30] aur false", "[10, 30] aur true", "[20, 30] aur false"],
      answer: 1,
      why: "<code>remove(int index)</code> aur <code>remove(Object o)</code> do overloads hain. <code>1</code> int hai → phase 1 mein <code>remove(int)</code> mil gaya (boxing ki zaroorat nahi) → index 1 (20) hata. Value hatani ho to <code>list.remove(Integer.valueOf(10))</code>. <code>contains(5)</code>: 5 Integer mein box hota hai, aur <code>Integer(5).equals(Long(5))</code> false hai."
    },
    {
      type: "code",
      title: "Verify: remove(int) vs remove(Object), aur Long set mein int dhoondhna",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
        list.remove(1);                       // index 1
        System.out.println(list);
        list.remove(Integer.valueOf(10));     // value 10
        System.out.println(list);

        Set<Long> ids = new HashSet<>(Set.of(5L));
        System.out.println(ids.contains(5));  // Integer 5
        System.out.println(ids.contains(5L)); // Long 5
        System.out.println(Long.valueOf(5).equals(5));
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>5. Integer cache, char arithmetic, numeric promotion</h2>
              <ul>
                <li>Autoboxing <code>Integer.valueOf</code> use karta hai, jo <b>-128 se 127</b> tak ke objects cache karta hai (upper limit JVM flag se badh sakti hai, default 127). Is range mein <code>==</code> true, bahar false. Wrapper hamesha <code>equals</code> se compare karo.</li>
                <li><code>Integer == int</code>: Integer unbox hota hai, value compare hoti hai.</li>
                <li><code>char</code> ek number hai (Unicode value, 'a' = 97). <code>char + int</code> → int. <code>String + char</code> → String. Left se right chalta hai, isliye String aane se pehle ka hissa number ki tarah judta hai.</li>
                <li><code>+=</code>, <code>++</code> chhupa hua cast karte hain, to <code>char c = 'a'; c += 1;</code> chalta hai aur char hi rehta hai.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">Integer a = 127, b = 127, c = 128, d = 128;
Integer e = 1000; int f = 1000;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + (e == f));</pre>`,
      options: ["true true true true", "true false true true", "true false true false", "false false true true"],
      answer: 1,
      why: "127 cache mein hai → same object → true. 128 cache ke bahar → do alag objects → <code>==</code> false, <code>equals</code> true. <code>e == f</code> mein ek side primitive hai, to <code>e</code> unbox hota hai aur 1000 == 1000 → true."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">System.out.println('a' + 1);
System.out.println("" + 'a' + 1);
System.out.println('a' + 'b' + "c");
System.out.println(1 + 2 + "3" + 4 + 5);</pre>`,
      options: ["b, a1, abc, 3345", "98, a1, 195c, 3345", "98, a1, 195c, 15", "98, 98, abc, 12345"],
      answer: 1,
      why: "<code>'a' + 1</code> = 97 + 1 = 98 (int). <code>\"\" + 'a'</code> = \"a\", phir + 1 = \"a1\". <code>'a' + 'b'</code> = 97 + 98 = 195, phir + \"c\" = \"195c\". <code>1 + 2</code> = 3, phir \"33\", \"334\", \"3345\": String aane ke baad sab concatenation."
    },
    {
      type: "code",
      title: "Verify: Integer cache aur char/String arithmetic",
      code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        Integer e = 1000;
        int f = 1000;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + (e == f));
        Integer m = -128, n = -128;
        System.out.println("-128: " + (m == n));
        System.out.println("new objects: " + (Integer.valueOf(200) == Integer.valueOf(200)));

        System.out.println('a' + 1);
        System.out.println((char) ('a' + 1));
        System.out.println("" + 'a' + 1);
        System.out.println('a' + 'b' + "c");
        System.out.println("c" + 'a' + 'b');
        System.out.println(1 + 2 + "3" + 4 + 5);

        char ch = 'a';
        ch += 1;            // chhupa cast: (char)(ch + 1)
        ch++;
        System.out.println(ch);
    }
}`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">int i = 0;
boolean r = true || ++i &gt; 0 &amp;&amp; ++i &gt; 0;
System.out.println(r + " " + i);
boolean s = (i == 0) | (++i &gt; 0);
System.out.println(s + " " + i);</pre>`,
      options: ["true 2, phir true 3", "true 0, phir true 1", "true 1, phir true 1", "true 0, phir true 0"],
      answer: 1,
      why: "<code>&amp;&amp;</code> ki precedence <code>||</code> se zyada hai, to expression hai <code>true || (++i &gt; 0 &amp;&amp; ++i &gt; 0)</code>. Left <code>true</code> hai, to poora right hissa skip: i = 0. Doosri line mein single <code>|</code> short-circuit nahi karta, dono side chalti hain: i = 1."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">Object o = true ? 1 : 2.0;
System.out.println(o);
System.out.println(true ? 'x' : 0);
int zero = 0;
System.out.println(true ? 'x' : zero);</pre>`,
      options: ["1, x, x", "1.0, x, 120", "1, 120, 120", "1.0, 120, x"],
      answer: 1,
      why: "Ternary ka ek hi type hota hai. <code>int</code> aur <code>double</code> → double, to 1 ban gaya 1.0 (Object mein Double). <code>char</code> aur int <b>constant</b> 0 (jo char mein fit hai) → type char → 'x'. <code>char</code> aur int <b>variable</b> → int → 120 ('x' ki value)."
    },
    {
      type: "code",
      title: "Verify: short-circuit + precedence, ternary promotion, aur ternary se NPE",
      code: `public class Main {
    public static void main(String[] args) {
        int i = 0;
        boolean r = true || ++i > 0 && ++i > 0;
        System.out.println(r + " " + i);
        boolean s = (i == 0) | (++i > 0);
        System.out.println(s + " " + i);

        Object o = true ? 1 : 2.0;
        System.out.println(o + " (" + o.getClass().getSimpleName() + ")");
        System.out.println(true ? 'x' : 0);
        int zero = 0;
        System.out.println(true ? 'x' : zero);
        System.out.println(false ? 1 : 'A');

        Integer missing = null;
        try {
            int v = true ? missing : 0;      // type int hai → missing unbox → NPE
            System.out.println(v);
        } catch (NullPointerException e) {
            System.out.println("ternary unboxing NPE");
        }
    }
}`,
      note: "Ternary <code>cond ? Integer : int</code> ka type int hota hai, to Integer side unbox hoti hai. Map se value nikaal ke ternary mein default dena (<code>map.get(k) != null ? map.get(k) : 0</code> theek, par <code>flag ? map.get(k) : 0</code> null pe NPE) common production bug hai."
    },
    {
      type: "text",
      html: `
              <h2>6. Static method hiding aur field hiding</h2>
              <ul>
                <li><b>Instance methods override</b> hote hain: kaunsa chalega ye <b>object</b> (runtime type) decide karta hai.</li>
                <li><b>Static methods override nahi, hide</b> hote hain: kaunsa chalega ye <b>reference ka declared type</b> (compile time) decide karta hai. <code>@Override</code> lagaoge to compile error.</li>
                <li><b>Fields bhi hide</b> hote hain, override nahi: <code>parentRef.name</code> parent ka field padhta hai.</li>
              </ul>`
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">class Animal {
    String name = "animal";
    static String kind() { return "Animal.kind"; }
    String sound() { return "..."; }
}
class Dog extends Animal {
    String name = "dog";
    static String kind() { return "Dog.kind"; }
    String sound() { return "bhow"; }
}
// main:
Animal a = new Dog();
System.out.println(a.kind() + " " + a.sound() + " " + a.name);</pre>`,
      options: ["Dog.kind bhow dog", "Animal.kind bhow animal", "Animal.kind ... animal", "Dog.kind bhow animal"],
      answer: 1,
      why: "<code>a</code> ka declared type Animal hai. Static <code>kind()</code> aur field <code>name</code> declared type se resolve hote hain → Animal wale. Sirf instance method <code>sound()</code> runtime object (Dog) se → \"bhow\"."
    },
    {
      type: "code",
      title: "Verify: static hiding, field hiding vs overriding",
      code: `public class Main {
    static class Animal {
        String name = "animal";
        static String kind() { return "Animal.kind"; }
        String sound() { return "..."; }
        String myName() { return name; }
    }

    static class Dog extends Animal {
        String name = "dog";
        static String kind() { return "Dog.kind"; }
        @Override String sound() { return "bhow"; }
    }

    @SuppressWarnings("static-access")
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.kind() + " " + a.sound() + " " + a.name);
        Dog d = (Dog) a;
        System.out.println(d.kind() + " " + d.sound() + " " + d.name);
        System.out.println("myName() = " + a.myName());   // Animal ka method, Animal ka field
    }
}`,
      note: "Static method ko object reference se call karna (<code>a.kind()</code>) compile hota hai par misleading hai; hamesha <code>Animal.kind()</code> likho. <code>myName()</code> Dog ne override nahi kiya, to wo Animal ke andar ka <code>name</code> (\"animal\") padhta hai."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">System.out.println(Math.abs(Integer.MIN_VALUE));
System.out.println(Math.min(Double.MIN_VALUE, 0.0));</pre>`,
      options: ["2147483648 aur -1.7976931348623157E308", "-2147483648 aur 0.0", "2147483647 aur 4.9E-324", "ArithmeticException"],
      answer: 1,
      why: "int range -2147483648 se 2147483647 hai. <code>-(-2147483648)</code> int mein fit nahi hota, overflow hoke wahi negative number wapas aata hai. <code>Double.MIN_VALUE</code> sabse chhota <b>positive</b> double (4.9E-324) hai, negative nahi. Isliye min 0.0. Sabse chhota (negative) double <code>-Double.MAX_VALUE</code> hai."
    },
    {
      type: "code",
      title: "Verify: abs(MIN_VALUE) overflow aur Double.MIN_VALUE positive hai",
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println(Math.abs(Integer.MIN_VALUE));
        System.out.println(Integer.MIN_VALUE == -Integer.MIN_VALUE);
        System.out.println(Math.min(Double.MIN_VALUE, 0.0));
        System.out.println(Double.MIN_VALUE + " " + (Double.MIN_VALUE > 0));
        System.out.println(Math.absExact(-5));
        try {
            Math.absExact(Integer.MIN_VALUE);     // Java 15+: overflow pe exception
        } catch (ArithmeticException e) {
            System.out.println("absExact: " + e.getMessage());
        }
    }
}`,
      note: "Hashing mein ye bug real hai: <code>Math.abs(key.hashCode()) % n</code> negative index de sakta hai jab hashCode <code>Integer.MIN_VALUE</code> ho. Safe: <code>Math.floorMod(hash, n)</code> ya <code>(hash &amp; 0x7fffffff) % n</code>."
    },
    {
      type: "think",
      id: "think-overload-override",
      q: "Interview question: <b>\"Overloading compile time pe aur overriding runtime pe resolve hoti hai, iska matlab kya hai? Ek example se samjhao jahan ye farak output badal de.\"</b>",
      rubric: [
        { point: "Overloading: compiler <b>reference/argument ke declared (static) type</b> se method chunta hai", keys: ["compile time", "declared type", "static type", "reference type", "argument type", "compiler"], weight: 2 },
        { point: "Overriding: JVM <b>actual object (runtime type)</b> dekh ke method chalata hai (dynamic dispatch)", keys: ["runtime", "actual object", "dynamic dispatch", "object type", "virtual", "vtable"], weight: 2 },
        { point: "Example: <code>Object o = \"hi\"; pay(o)</code> → pay(Object) chalta hai, String nahi", keys: ["object o", "pay(object)", "overload", "string nahi", "declared"], weight: 1 },
        { point: "Static methods aur fields override nahi hote (hiding), declared type se resolve", keys: ["static", "hiding", "hide", "field"], weight: 2 },
        { point: "Overload phases: widening → boxing → varargs; most specific; ambiguous = compile error", keys: ["widening", "boxing", "varargs", "most specific", "ambiguous"], weight: 1 }
      ],
      answer: `<p><b>Overloading</b> (same naam, alag parameters) mein kaunsa method call hoga ye <b>compiler</b> tay karta hai, sirf arguments ke <b>declared types</b> dekh ke. Bytecode mein exact method signature likh diya jaata hai. Compiler phases mein dhoondhta hai: pehle exact/widening, phir boxing, phir varargs; ek phase mein kai mile to most specific, warna ambiguous compile error.</p>
               <p><b>Overriding</b> (subclass mein same signature) mein <b>JVM runtime pe</b> actual object ka type dekhta hai (dynamic dispatch).</p>
               <p><b>Example:</b> <code>pay(Object)</code> aur <code>pay(String)</code> hain. <code>Object o = "hi"; pay(o);</code> → <b>pay(Object)</b> chalta hai, kyunki compile time pe <code>o</code> ka type Object hai. Wahin <code>Animal a = new Dog(); a.sound()</code> → Dog ka <code>sound()</code>, kyunki overriding runtime pe resolve hoti hai.</p>
               <p>Static methods aur fields override nahi hote, <b>hide</b> hote hain, to <code>a.kind()</code> aur <code>a.name</code> Animal wale hi dete hain.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Output sawaal mein seedha answer mat bolo, <b>rule ke saath</b> bolo: <i>\"Ye 128 hai, Integer cache -128 se 127 tak hai, to do alag objects bane, isliye == false.\"</i> Agar 2 options mein confuse ho, to pehle check karo ki code compile bhi hoga ya nahi. Aur option mein \"Compile error\" ho to ambiguous overload, unreachable code ya type mismatch zaroor dhoondho."
    }
  ],
  references: [
    { title: "JLS 17, Chapter 12: Execution (class and instance initialization)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-12.html", type: "docs" },
    { title: "JLS 17, Chapter 15: Expressions (overload resolution 15.12.2, conditional operator 15.25, string concatenation)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html", type: "docs" },
    { title: "JLS 17, Chapter 14: Blocks and Statements (try-finally 14.20.2)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-14.html", type: "docs" },
    { title: "Integer (Java 17 API): valueOf caching", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html", type: "docs" }
  ]
});
