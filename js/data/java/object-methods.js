// equals, hashCode, toString
registerLesson("java", "object-methods", {
  why: "\"equals override kiya par hashCode nahi, kya hoga?\" HashMap wale har interview mein aata hai. Aur Integer == wala trap production bugs ka common reason hai. Ye lesson HashMap internals wale lesson ki neev hai.",
  blocks: [
    {
      type: "text",
      html: `
              <h2><code>Object</code> class ke 3 methods jo har class ko milte hain</h2>
              <table>
                <tr><th>Method</th><th>Default (Object ka) behaviour</th><th>Kab override</th></tr>
                <tr><td><code>toString()</code></td><td><code>ClassName@hexHash</code>, jaise <code>Point@1b6d3586</code></td><td>Hamesha (logs aur debugging ke liye)</td></tr>
                <tr><td><code>equals(Object o)</code></td><td><code>this == o</code> (same object?)</td><td>Jab do objects \"value\" se same maane jaane chahiye (Point, Money, OrderId)</td></tr>
                <tr><td><code>hashCode()</code></td><td>Har object ka alag-sa number (identity hash)</td><td><b>Jab bhi equals override karo</b></td></tr>
              </table>
              <h3>== vs equals</h3>
              <ul>
                <li><b>Primitives</b> pe <code>==</code> value compare karta hai: <code>5 == 5</code>.</li>
                <li><b>Objects</b> pe <code>==</code> <b>reference</b> compare karta hai: kya dono same object hain?</li>
                <li><code>equals</code> wo karta hai jo class ne define kiya. <code>String</code>, <code>Integer</code>, <code>List</code> ne content compare ke liye override kiya hai. Aapki class ne nahi kiya to wo bhi <code>==</code> hi hai.</li>
              </ul>
              <p><b>Integer trap:</b> autoboxing <code>Integer.valueOf</code> use karta hai, jo <b>-128 se 127</b> tak ke objects cache karta hai (JLS ye range guarantee karta hai). Is range mein <code>==</code> \"kaam karta dikhta hai\", 128 se upar default settings pe false. Wrappers ko hamesha <code>equals</code> se compare karo.</p>`
    },
    {
      type: "code",
      title: "Default equals/toString, aur Integer cache ka trap",
      code: `class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);
        System.out.println(p1 == p2);         // false: alag objects
        System.out.println(p1.equals(p2));    // false! Object.equals bhi == hi hai
        System.out.println(p1.toString().startsWith("Point@"));   // true: default toString

        Integer a = 127, b = 127;
        System.out.println(a == b);           // true: cache se same object
        Integer c = 128, d = 128;
        System.out.println(c == d);           // false: cache range ke bahar, naye objects
        System.out.println(c.equals(d));      // true: sahi tareeka

        Long big = 127L;
        System.out.println(big.equals(127));  // false! 127 Integer hai, Long nahi
        System.out.println(big == 127);       // true: unbox hoke primitive compare
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga? (default JVM settings)<pre class="code-static">Integer x = 100, y = 100;
Integer m = 1000, n = 1000;
System.out.println((x == y) + " " + (m == n) + " " + m.equals(n));</pre>`,
      options: ["true true true", "true false true", "false false true", "true false false"],
      answer: 1,
      why: "100 cache range (-128..127) mein hai: same object, <code>true</code>. 1000 range ke bahar: do alag objects, <code>==</code> <code>false</code>. <code>equals</code> value compare karta hai: <code>true</code>."
    },
    {
      type: "text",
      html: `
              <h2>equals contract (Object ki Javadoc se)</h2>
              <ol>
                <li><b>Reflexive:</b> <code>x.equals(x)</code> true.</li>
                <li><b>Symmetric:</b> <code>x.equals(y)</code> true to <code>y.equals(x)</code> bhi true.</li>
                <li><b>Transitive:</b> x = y aur y = z to x = z.</li>
                <li><b>Consistent:</b> objects nahi badle to baar baar same answer.</li>
                <li><code>x.equals(null)</code> hamesha <b>false</b> (exception nahi).</li>
              </ol>
              <h2>hashCode contract</h2>
              <ol>
                <li>Do objects <code>equals</code> se barabar hain to unka <b>hashCode same hona hi chahiye</b>.</li>
                <li>Hash same ho to objects equal hon, zaroori nahi (collision allowed).</li>
                <li>Object nahi badla to hashCode bhi nahi badalna chahiye.</li>
              </ol>
              <h3>HashMap / HashSet ko ye kyun chahiye</h3>
              <pre class="diagram">
 map.get(new Point(1, 2))

 Step 1: hashCode()  ---&gt;  bucket number nikalo  (hash ke basis pe)
                                |
 Step 2: us bucket ke har key pe equals() chalao  ---&gt;  mila? value do

 equals override, hashCode NAHI:
   do equal Points ke hash alag  ---&gt;  alag buckets  ---&gt;  equals tak pahunchte hi nahi
   ---&gt;  get() null deta hai, HashSet mein duplicate ghus jaata hai</pre>
              <p>Ulta bhi galat hai: sab objects ka hashCode same (jaise <code>return 42;</code>) contract todta nahi, par sab ek bucket mein: HashMap O(1) se O(n) ya O(log n) ho jaata hai.</p>`
    },
    {
      type: "code",
      title: "equals hai, hashCode nahi: HashSet toot gaya. Phir fix",
      code: `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class HalfPoint {                          // sirf equals override
    final int x, y;
    HalfPoint(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof HalfPoint)) return false;
        HalfPoint p = (HalfPoint) o;
        return x == p.x && y == p.y;
    }
}

class GoodPoint {                          // equals + hashCode + toString
    final int x, y;
    GoodPoint(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GoodPoint)) return false;
        GoodPoint p = (GoodPoint) o;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "(" + x + ", " + y + ")"; }
}

public class Main {
    public static void main(String[] args) {
        Set<HalfPoint> bad = new HashSet<>();
        bad.add(new HalfPoint(1, 2));
        bad.add(new HalfPoint(1, 2));
        System.out.println("HalfPoint set size = " + bad.size());              // 2 (almost hamesha)
        System.out.println("contains? " + bad.contains(new HalfPoint(1, 2)));   // false (almost hamesha)
        System.out.println("equals? " + new HalfPoint(1, 2).equals(new HalfPoint(1, 2)));   // true!

        Set<GoodPoint> good = new HashSet<>();
        good.add(new GoodPoint(1, 2));
        good.add(new GoodPoint(1, 2));
        System.out.println("GoodPoint set size = " + good.size());             // 1
        System.out.println("contains? " + good.contains(new GoodPoint(1, 2)));  // true
        System.out.println(good);                                               // [(1, 2)]
    }
}`,
      note: "\"Almost hamesha\" isliye: identity hash random-sa hai, kabhi do objects same bucket mein gir sakte hain. Isi wajah se ye bug kabhi kabhi hi dikhta hai aur debug karna mushkil hota hai."
    },
    {
      type: "quiz",
      q: "Class ne <code>equals</code> override kiya (x, y compare) par <code>hashCode</code> nahi. <code>HashMap&lt;Point, String&gt;</code> mein <code>put(new Point(1,1), \"A\")</code>, phir <code>get(new Point(1,1))</code> kya dega (aam taur pe)?",
      options: ["\"A\"", "null", "ClassCastException", "Compile error"],
      answer: 1,
      why: "Dono Points ka identity hashCode alag, to <code>get</code> doosre bucket mein dhoondhta hai aur wahan koi key nahi. <code>equals</code> chalne ka mauka hi nahi milta. Result <code>null</code>. Compile error nahi aata, isliye ye bug chupke se production tak jaata hai."
    },
    {
      type: "text",
      html: `
              <h2>equals sahi likhne ke steps</h2>
              <pre class="code-static">@Override
public boolean equals(Object o) {              // parameter Object hi ho!
    if (this == o) return true;                // 1. same object: fast path
    if (o == null || getClass() != o.getClass()) return false;   // 2. null + type
    Point p = (Point) o;                       // 3. cast
    return x == p.x &amp;&amp; y == p.y;              // 4. important fields compare
}
@Override
public int hashCode() { return Objects.hash(x, y); }   // wahi fields</pre>
              <ul>
                <li><b>Parameter type <code>Object</code></b> hona chahiye. <code>equals(Point p)</code> likha to wo <b>overload</b> hai, override nahi. HashSet <code>equals(Object)</code> call karta hai, aapka method chalega hi nahi. <code>@Override</code> lagao, compiler pakad lega.</li>
                <li><code>getClass()</code> vs <code>instanceof</code>: subclass bhi equal maana jaaye to instanceof (tab class/method final rakhna safe), strict same type chahiye to getClass. Subclass naya field jode aur instanceof use ho to symmetry toot sakti hai.</li>
                <li>Object fields ke liye <code>Objects.equals(a, b)</code> (null-safe). double ke liye <code>Double.compare</code> (NaN, -0.0 ke cases).</li>
                <li>equals aur hashCode mein <b>same fields</b>. Jo field equals mein nahi, wo hashCode mein bhi nahi.</li>
                <li>Records (agla lesson) ye teeno methods khud bana dete hain.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Overload trap: equals(Point) override nahi hai",
      code: `import java.util.ArrayList;
import java.util.List;

class Coin {
    final int value;
    Coin(int value) { this.value = value; }

    // GALAT: parameter Coin hai, Object nahi. Ye overload hai.
    public boolean equals(Coin other) {
        return other != null && value == other.value;
    }
    @Override public int hashCode() { return value; }
}

public class Main {
    public static void main(String[] args) {
        Coin a = new Coin(5), b = new Coin(5);
        System.out.println(a.equals(b));              // true: overload seedha call hua

        Object ob = b;
        System.out.println(a.equals(ob));             // false: equals(Object) chala (Object wala)

        List<Coin> wallet = new ArrayList<>();
        wallet.add(a);
        System.out.println(wallet.contains(b));       // false: List andar equals(Object) use karti hai
    }
}`
    },
    {
      type: "warn",
      html: "⚠️ <b>Mutable key trap:</b> HashSet/HashMap mein object daalne ke baad uska koi field (jo hashCode mein use hota hai) badal diya, to object <b>galat bucket</b> mein pada reh jaata hai. <code>contains</code> false, <code>remove</code> kaam nahi karta, aur memory leak. Keys ko <b>immutable</b> rakho (final fields, String, records)."
    },
    {
      type: "code",
      title: "Mutable key: set mein daala, phir badla, ab mil nahi raha",
      code: `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Seat {
    int row, col;                                  // final nahi: mutable
    Seat(int row, int col) { this.row = row; this.col = col; }
    @Override public boolean equals(Object o) {
        if (!(o instanceof Seat)) return false;
        Seat s = (Seat) o;
        return row == s.row && col == s.col;
    }
    @Override public int hashCode() { return Objects.hash(row, col); }
}

public class Main {
    public static void main(String[] args) {
        Set<Seat> booked = new HashSet<>();
        Seat s = new Seat(5, 10);
        booked.add(s);
        s.col = 11;                                // key badal di!
        System.out.println(booked.contains(s));              // false: naya hash, naya bucket
        System.out.println(booked.contains(new Seat(5, 10)));   // false: bucket sahi, par equals fail
        System.out.println(booked.remove(s));                // false: hata bhi nahi sakte
        System.out.println(booked.size());                   // 1: object andar phasa hai
    }
}`
    },
    {
      type: "exercise",
      id: "ex-point",
      title: "Point class jo HashSet/HashMap mein sahi chale",
      level: "Medium",
      task: `<p><code>Point(int x, int y)</code> class mein override karo:</p>
              <ul><li><code>equals(Object)</code>: x aur y dono same to equal. <code>null</code> ya doosri class ka object → false.</li>
              <li><code>hashCode()</code>: contract follow kare, aur achha spread de (sab ka same hash mat do: hidden test 1 lakh points ke saath chalta hai).</li>
              <li><code>toString()</code>: <code>\"(x, y)\"</code> format, jaise <code>\"(3, -4)\"</code>.</li></ul>
              <p>Fields <code>final</code> rakho taaki key immutable rahe.</p>`,
      examples: "Do baar <code>new Point(1, 2)</code> HashSet mein add → size 1<br><code>new Point(3, -4).toString()</code> → <code>\"(3, -4)\"</code>",
      userFile: "Solution.java",
      starter: `class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() { return x; }
    int getY() { return y; }

    // equals, hashCode, toString override karo
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("HashSet mein do equal points: size", 1, () -> {
            Set<Point> s = new HashSet<>();
            s.add(new Point(1, 2));
            s.add(new Point(1, 2));
            return s.size();
        });
        Check.eq("contains(new Point(1, 2))", true, () -> new HashSet<>(List.of(new Point(1, 2))).contains(new Point(1, 2)));
        Check.eq("toString", "(3, -4)", () -> new Point(3, -4).toString());
        Check.hiddenFromHere();
        Check.eq("equals(null) false", false, () -> new Point(0, 0).equals(null));
        Check.eq("equals(String) false", false, () -> new Point(0, 0).equals("(0, 0)"));
        Check.eq("reflexive", true, () -> { Point p = new Point(7, 7); return p.equals(p); });
        Check.eq("(1,2) != (2,1)", false, () -> new Point(1, 2).equals(new Point(2, 1)));
        Check.eq("equal objects same hash", true, () -> new Point(-5, 9).hashCode() == new Point(-5, 9).hashCode());
        Check.eq("HashMap get naye key se", "Gate A", () -> {
            Map<Point, String> m = new HashMap<>();
            m.put(new Point(10, 20), "Gate A");
            return m.get(new Point(10, 20));
        });
        Check.eq("1 lakh distinct points (hash spread)", 100000, () -> {
            Set<Point> s = new HashSet<>();
            for (int i = 0; i < 100000; i++) s.add(new Point(i % 1000, i / 1000));
            for (int i = 0; i < 100000; i++) if (!s.contains(new Point(i % 1000, i / 1000))) return -1;
            return s.size();
        });
    }
}`,
      hints: [
        "<code>@Override public boolean equals(Object o)</code>: pehle <code>this == o</code>, phir <code>o == null || getClass() != o.getClass()</code> pe false, phir cast karke x, y compare.",
        "<code>@Override public int hashCode() { return Objects.hash(x, y); }</code> (import <code>java.util.Objects</code>). Ya khud: <code>31 * x + y</code>.",
        "<code>return \"(\" + x + \", \" + y + \")\";</code>"
      ],
      solution: `import java.util.Objects;

class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() { return x; }
    int getY() { return y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}`,
      explain: "<p><code>equals</code> mein null/type check pehle, phir fields. <code>hashCode</code> unhi fields se jo equals mein hain, to contract pakka. <code>Objects.hash(x, y)</code> andar <code>31 * (31 + x) + y</code> jaisa calculate karta hai: achha spread, 1 lakh points alag-alag buckets mein, har operation ~O(1).</p><p>Agar <code>return 1;</code> jaisa constant hash dete to contract technically sahi rehta, par saare points ek bucket mein: 1 lakh inserts O(n²) jaise slow ho jaate. Hot path mein <code>Objects.hash</code> varargs array banata hai; bahut performance-critical code mein <code>31 * x + y</code> seedha likhte hain.</p>"
    },
    {
      type: "think",
      id: "think-equals-hash",
      q: "Interview question: <b>\"Agar equals override kiya par hashCode nahi, to HashMap mein kya hoga? Step by step samjhao. Aur ulta (sirf hashCode) karo to?\"</b>",
      rubric: [
        { point: "HashMap pehle <b>hashCode</b> se bucket chunta hai, phir bucket ke andar <b>equals</b> se key match karta hai", keys: ["bucket", "hashcode se", "hash se", "pehle hash", "index"], weight: 2 },
        { point: "Do equal objects ke hashCode alag (identity hash) → alag buckets → <b>get() null</b>, duplicates set mein", keys: ["null", "duplicate", "alag bucket", "different bucket", "nahi milega", "not found"], weight: 2 },
        { point: "Contract: equal objects ka hashCode same hona chahiye; same hash ka matlab equal nahi (collision)", keys: ["contract", "same hashcode", "same hash", "collision"], weight: 2 },
        { point: "Sirf hashCode override (equals nahi): same bucket mein jaayenge par equals (==) fail, phir bhi duplicates / null", keys: ["sirf hashcode", "only hashcode", "equals fail", "reference compare", "=="] },
        { point: "Keys immutable rakho; Objects.hash / records / IDE generate", keys: ["immutable", "objects.hash", "record", "final"] }
      ],
      answer: `<p><b>HashMap ka flow:</b> <code>put</code>/<code>get</code> pe pehle key ka <code>hashCode()</code> nikalta hai, usse <b>bucket</b> decide hota hai. Phir us bucket ki keys pe <code>equals()</code> chala ke exact key dhoondhta hai.</p>
                <p><b>Sirf equals override kiya:</b> <code>new Point(1,2)</code> ke do objects equals se barabar hain, par hashCode Object wala (identity) hai, jo dono ka alag hai. <code>put</code> ek bucket mein gaya, <code>get</code> doosre bucket mein dhoondhta hai: <b>null</b>. HashSet mein same point do baar ghus jaata hai. Ye <b>contract violation</b> hai: equal objects ka hashCode same hona chahiye.</p>
                <p><b>Sirf hashCode override kiya:</b> dono objects same bucket mein pahunchenge, par equals abhi bhi <code>==</code> hai, to match fail. Result phir se null / duplicates.</p>
                <p><b>Sahi tareeka:</b> dono override karo, same fields se. Keys immutable rakho (mutable key badli to object galat bucket mein phas jaata hai). Shortcut: <code>Objects.hash</code>, IDE se generate, ya Java 16+ <b>record</b>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Is question ka jawab ek line se shuru karo: <b>\"HashMap hashCode se bucket dhoondhta hai aur equals se key, isliye dono ek saath override karne padte hain.\"</b> Phir follow-up khud chhed do: mutable keys ka problem aur bad hashCode se performance (sab ek bucket mein). Ye HashMap internals wale question ka raasta bhi khol deta hai."
    }
  ],
  references: [
    { title: "Object (Java 17 API): equals and hashCode contract", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html", type: "docs" },
    { title: "Object as a Superclass", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/IandI/objectclass.html", type: "docs" },
    { title: "JLS 17, 5.1.7: Boxing Conversion (Integer cache range)", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-5.html#jls-5.1.7", type: "docs" },
    { title: "Effective Java (3rd ed.), Items 10-12 (equals, hashCode, toString)", by: "Joshua Bloch", type: "book" }
  ]
});
