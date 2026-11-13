// Comparable vs Comparator
registerLesson("java", "comparable-comparator", {
  why: "Sorting har jagah hai: employees by salary, orders by time, leaderboard. Interview mein 'Comparable vs Comparator' definition se zyada ye dekhte hain ki aap multi-level sort (thenComparing) saaf likh sakte ho aur compareTo ke traps (overflow, equals consistency) jaante ho.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Do tareeke se order batao</h2>
              <table>
                <tr><th></th><th><code>Comparable&lt;T&gt;</code></th><th><code>Comparator&lt;T&gt;</code></th></tr>
                <tr><td>Kahan likhte hain</td><td>Class ke <b>andar</b>: <code>compareTo(T other)</code></td><td>Class ke <b>bahar</b>: <code>compare(T a, T b)</code></td></tr>
                <tr><td>Kitne orders</td><td>Ek: "natural order"</td><td>Jitne chaho (salary se, naam se, ...)</td></tr>
                <tr><td>Kab</td><td>Jab ek obvious order ho (String alphabetically, Integer, LocalDate)</td><td>Business-specific order, ya class aapki nahi hai (library class)</td></tr>
                <tr><td>Use</td><td><code>Collections.sort(list)</code>, <code>TreeSet</code> bina argument</td><td><code>list.sort(cmp)</code>, <code>new TreeSet&lt;&gt;(cmp)</code>, <code>stream.sorted(cmp)</code></td></tr>
              </table>
              <h2>compareTo ka contract</h2>
              <p>Return value ka <b>sign</b> matter karta hai, number nahi: negative = <code>this</code> pehle, 0 = barabar, positive = <code>this</code> baad mein.</p>
              <ul>
                <li><b>Ulta symmetric:</b> <code>sgn(a.compareTo(b)) == -sgn(b.compareTo(a))</code></li>
                <li><b>Transitive:</b> a &gt; b aur b &gt; c to a &gt; c</li>
                <li><b>Consistent:</b> a == b (0) to a aur b dono kisi c ke saath same sign den</li>
                <li><b>Recommended:</b> <code>compareTo == 0</code> tabhi jab <code>equals</code> true (TreeSet/TreeMap isi pe chalte hain)</li>
              </ul>
              <p>Contract toda to sorting galat ho sakti hai, ya TimSort <i>"Comparison method violates its general contract!"</i> exception de sakta hai.</p>`
    },
    {
      type: "code",
      title: "Comparable (natural order) aur Comparator (custom orders)",
      code: `import java.util.*;

public class Main {
    static class Employee implements Comparable<Employee> {
        final int id; final String name; final String dept; final int salary;
        Employee(int id, String name, String dept, int salary) {
            this.id = id; this.name = name; this.dept = dept; this.salary = salary;
        }
        @Override
        public int compareTo(Employee other) {          // natural order: id se
            return Integer.compare(this.id, other.id);
        }
        @Override public String toString() { return name + "(" + dept + "," + salary + ")"; }
    }

    public static void main(String[] args) {
        List<Employee> list = new ArrayList<>(List.of(
            new Employee(3, "Riya", "Eng", 90),
            new Employee(1, "Aman", "Ops", 60),
            new Employee(2, "Kabir", "Eng", 120)));

        Collections.sort(list);                                   // compareTo use hua
        System.out.println("by id     : " + list);

        list.sort(Comparator.comparingInt(e -> e.salary));        // custom: salary asc
        System.out.println("by salary : " + list);

        list.sort(Comparator.comparing((Employee e) -> e.name).reversed());
        System.out.println("name desc : " + list);
    }
}`
    },
    {
      type: "warn",
      html: "⚠️ <b>Common galti:</b> <code>(a, b) -&gt; a.salary - b.salary</code> mat likho. Bade/negative numbers pe subtraction <b>overflow</b> karke galat sign deta hai (jaise <code>Integer.MIN_VALUE - 1</code> positive ban jaata hai). Hamesha <code>Integer.compare(a, b)</code>, <code>Long.compare</code>, ya <code>Comparator.comparingInt</code>."
    },
    {
      type: "text",
      html: `
              <h2>Comparator ke builder methods (Java 8+)</h2>
              <table>
                <tr><th>Method</th><th>Kaam</th></tr>
                <tr><td><code>Comparator.comparing(Employee::name)</code></td><td>Key nikalo, uske natural order se</td></tr>
                <tr><td><code>comparingInt / comparingLong / comparingDouble</code></td><td>Primitive key, boxing nahi</td></tr>
                <tr><td><code>.thenComparing(Employee::id)</code></td><td>Pehli key barabar ho to doosri (tie-breaker)</td></tr>
                <tr><td><code>.thenComparing(Employee::salary, Comparator.reverseOrder())</code></td><td>Doosri key ulte order mein</td></tr>
                <tr><td><code>.reversed()</code></td><td><b>Ab tak ke poore</b> comparator ko ulta karo</td></tr>
                <tr><td><code>Comparator.nullsFirst(cmp) / nullsLast(cmp)</code></td><td>null values ko pehle/baad mein, NPE ke bina</td></tr>
                <tr><td><code>Comparator.naturalOrder() / reverseOrder()</code></td><td>Comparable ka order / ulta</td></tr>
              </table>
              <p><b>Stable sort:</b> <code>List.sort</code> / <code>Collections.sort</code> (objects) stable hain: barabar elements ka purana order bana rehta hai.</p>`
    },
    {
      type: "code",
      title: "Multi-level sort: dept asc, phir salary desc, phir name asc",
      code: `import java.util.*;

public class Main {
    record Emp(String name, String dept, int salary) {}

    public static void main(String[] args) {
        List<Emp> emps = new ArrayList<>(List.of(
            new Emp("Riya", "Eng", 90), new Emp("Aman", "Ops", 60),
            new Emp("Kabir", "Eng", 120), new Emp("Zoya", "Eng", 90),
            new Emp("Dev", "Ops", 60), new Emp("Neha", null, 70)));

        Comparator<Emp> cmp = Comparator
            .comparing(Emp::dept, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(Emp::salary, Comparator.reverseOrder())
            .thenComparing(Emp::name);

        emps.sort(cmp);
        emps.forEach(e -> System.out.println(e.dept() + " | " + e.salary() + " | " + e.name()));

        // .reversed() poore chain ko ulta karta hai
        Comparator<Emp> bySalaryThenName = Comparator.comparingInt(Emp::salary).thenComparing(Emp::name);
        emps.sort(bySalaryThenName.reversed());
        System.out.println("reversed chain: " + emps.stream().map(Emp::name).toList());
    }
}`,
      note: "<code>reversed()</code> chain ke end mein lagaya to salary <b>aur</b> name dono ulte ho gaye (Zoya, Riya order mein). Sirf ek key ulti karni ho to us key pe <code>Comparator.reverseOrder()</code> do."
    },
    {
      type: "code",
      expectError: true,
      title: "Type inference trap: lambda + reversed() compile nahi hota",
      code: `import java.util.*;

public class Main {
    record Emp(String name, int salary) {}

    public static void main(String[] args) {
        List<Emp> emps = new ArrayList<>(List.of(new Emp("Riya", 90), new Emp("Aman", 60)));
        emps.sort(Comparator.comparing(e -> e.name()).reversed());   // ❌ e yahan Object hai
        System.out.println(emps);
    }
}`,
      note: "<code>.reversed()</code> lagate hi Java ko <code>comparing(...)</code> ka type target se pata nahi chalta, to <code>e</code> <code>Object</code> maan liya jaata hai. Fix: method reference <code>Comparator.comparing(Emp::name).reversed()</code>, ya type likho <code>(Emp e) -&gt; e.name()</code>."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">List&lt;String&gt; l = new ArrayList&lt;&gt;(List.of("bb", "a", "ccc", "dd"));
l.sort(Comparator.comparingInt(String::length).reversed());
System.out.println(l);</pre>`,
      options: ["[ccc, bb, dd, a]", "[ccc, dd, bb, a]", "[a, bb, dd, ccc]", "[ccc, bb, a, dd]"],
      answer: 0,
      why: "Length desc: ccc (3), phir bb aur dd (2), phir a (1). bb aur dd ki length barabar hai, aur sort <b>stable</b> hai, to original order (bb pehle, dd baad) bana raha. <code>reversed()</code> sirf comparator ulta karta hai, barabar elements ka order nahi."
    },
    {
      type: "quiz",
      q: "Class <code>Price</code> ka <code>compareTo</code> sirf rupees compare karta hai, aur <code>equals</code> rupees + currency. Kya problem ho sakti hai?",
      options: [
        "Koi problem nahi",
        "TreeSet mein ₹100 aur $100 ek hi element maane jaayenge (ek gayab), jabki HashSet mein dono rahenge",
        "Compile error",
        "Sorting hamesha exception dega"
      ],
      answer: 1,
      why: "TreeSet/TreeMap duplicate check <code>compareTo == 0</code> se karte hain, HashSet <code>equals</code> se. Dono inconsistent hon to collections alag behave karti hain. BigDecimal (1.0 vs 1.00) iska famous JDK example hai."
    },
    {
      type: "exercise",
      id: "ex-sort-employees",
      title: "Employees sort karo (multi-level)",
      level: "Easy",
      task: `<p><code>sortedNames(list)</code> employees ke <b>naam</b> is order mein return kare:</p>
             <ol><li>dept ascending (A-Z)</li><li>same dept mein salary <b>descending</b></li><li>same salary mein name ascending</li></ol>
             <p>Original list ko mat badlo. <code>Employee</code> record Solution.java mein upar diya hai.</p>`,
      examples: "<code>[(Riya,Eng,90), (Aman,Ops,60), (Kabir,Eng,120), (Zoya,Eng,90)]</code> → <code>[Kabir, Riya, Zoya, Aman]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

record Employee(String name, String dept, int salary) {}

class Solution {
    List<String> sortedNames(List<Employee> list) {
        List<Employee> copy = new ArrayList<>(list);
        // copy.sort(...)
        List<String> names = new ArrayList<>();
        for (Employee e : copy) names.add(e.name());
        return names;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("example", List.of("Kabir", "Riya", "Zoya", "Aman"), () -> s.sortedNames(List.of(
            new Employee("Riya", "Eng", 90), new Employee("Aman", "Ops", 60),
            new Employee("Kabir", "Eng", 120), new Employee("Zoya", "Eng", 90))));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.sortedNames(List.of()));
        Check.eq("sab same dept + salary → name", List.of("A", "B", "C"), () -> s.sortedNames(List.of(
            new Employee("C", "HR", 50), new Employee("A", "HR", 50), new Employee("B", "HR", 50))));
        Check.eq("negative/bade salary (overflow trap)", List.of("Max", "Min"), () -> s.sortedNames(List.of(
            new Employee("Min", "X", Integer.MIN_VALUE), new Employee("Max", "X", Integer.MAX_VALUE))));
        List<Employee> in = new ArrayList<>(List.of(new Employee("B", "Z", 1), new Employee("A", "Z", 1)));
        Check.eq("original list nahi badli", "B", () -> { s.sortedNames(in); return in.get(0).name(); });
    }
}`,
      hints: [
        "<code>Comparator.comparing(Employee::dept)</code> se shuru karo.",
        "<code>.thenComparing(Employee::salary, Comparator.reverseOrder())</code>: sirf salary ulti.",
        "<code>.thenComparing(Employee::name)</code>. <code>a.salary() - b.salary()</code> mat likhna, hidden test overflow pakadta hai."
      ],
      solution: `import java.util.*;

record Employee(String name, String dept, int salary) {}

class Solution {
    List<String> sortedNames(List<Employee> list) {
        List<Employee> copy = new ArrayList<>(list);
        copy.sort(Comparator.comparing(Employee::dept)
                .thenComparing(Employee::salary, Comparator.reverseOrder())
                .thenComparing(Employee::name));
        List<String> names = new ArrayList<>();
        for (Employee e : copy) names.add(e.name());
        return names;
    }
}`,
      explain: "<p>Comparator chain padhne mein requirement jaisa hi lagta hai. O(n log n). <code>Comparator.reverseOrder()</code> sirf us ek key pe laga. Stream version: <code>list.stream().sorted(cmp).map(Employee::name).toList()</code>.</p>"
    },
    {
      type: "exercise",
      id: "ex-largest-number",
      title: "Numbers jod ke sabse bada number banao (custom comparator)",
      level: "Medium",
      task: `<p>Non-negative integers ka array diya hai. Unhe kisi order mein jodo (concatenate) taaki sabse bada number bane. Answer String mein do (bahut bada ho sakta hai). Sab zero hon to <code>\"0\"</code>.</p><p><a href="https://leetcode.com/problems/largest-number/" target="_blank">LeetCode 179</a></p>`,
      examples: "<code>[10, 2]</code> → <code>\"210\"</code><br><code>[3, 30, 34, 5, 9]</code> → <code>\"9534330\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    String largestNumber(int[] nums) {
        return "";
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[10, 2]", "210", () -> s.largestNumber(new int[]{10, 2}));
        Check.eq("[3,30,34,5,9]", "9534330", () -> s.largestNumber(new int[]{3, 30, 34, 5, 9}));
        Check.hiddenFromHere();
        Check.eq("[0, 0]", "0", () -> s.largestNumber(new int[]{0, 0}));
        Check.eq("single", "7", () -> s.largestNumber(new int[]{7}));
        Check.eq("[121, 12]", "12121", () -> s.largestNumber(new int[]{121, 12}));
        Check.eq("[824, 8247]", "8248247", () -> s.largestNumber(new int[]{824, 8247}));
    }
}`,
      hints: [
        "Sirf numeric ya string sort kaam nahi karta (3 vs 30). Do strings a, b ke liye pucho: <code>a + b</code> bada hai ya <code>b + a</code>?",
        "Comparator: <code>(a, b) -&gt; (b + a).compareTo(a + b)</code> (descending).",
        "Sort ke baad pehla element \"0\" ho to answer \"0\"."
      ],
      solution: `import java.util.*;

class Solution {
    String largestNumber(int[] nums) {
        String[] s = new String[nums.length];
        for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        if (s[0].equals("0")) return "0";
        StringBuilder sb = new StringBuilder();
        for (String x : s) sb.append(x);
        return sb.toString();
    }
}`,
      explain: "<p>Comparator ka matlab: a ko b se pehle rakho agar <code>a+b &gt; b+a</code>. Ye relation transitive hai (isliye valid comparator). O(n log n × L), L = digits. Lesson ka point: comparator sirf \"field se sort\" nahi, koi bhi consistent rule ho sakta hai.</p>"
    },
    {
      type: "think",
      id: "think-cmp",
      q: "Interview question: <b>\"Comparable aur Comparator mein farak? Ek Employee class hai jo kabhi id se, kabhi salary se, kabhi naam se sort hoti hai. Kaise design karoge?\"</b>",
      rubric: [
        { point: "Comparable class ke andar, <b>ek natural order</b> (<code>compareTo</code>)", keys: ["comparable", "compareto", "natural", "andar", "inside"], weight: 2 },
        { point: "Comparator bahar, <b>multiple orders</b> (<code>compare</code>), library classes pe bhi", keys: ["comparator", "compare(", "multiple", "bahar", "outside", "alag alag"], weight: 2 },
        { point: "Design: natural = id (Comparable), baaki static Comparator constants / <code>Comparator.comparing</code>", keys: ["static", "constant", "comparing", "thencomparing", "id"], weight: 2 },
        { point: "Traps: subtraction overflow → Integer.compare; compareTo equals ke saath consistent", keys: ["overflow", "integer.compare", "consistent", "equals"], weight: 1 }
      ],
      answer: `<p><b>Comparable</b> class khud implement karti hai (<code>compareTo</code>) aur ek <b>natural order</b> deti hai. <b>Comparator</b> alag object hai (<code>compare(a, b)</code>), jitne chaho bana sakte ho, aur un classes ke liye bhi jinka code aapka nahi hai.</p>
               <p><b>Design:</b> Employee ka natural order <code>id</code> (unique aur equals ke saath consistent), to <code>implements Comparable&lt;Employee&gt;</code> with <code>Integer.compare(id, o.id)</code>. Baaki orders ke liye class mein constants:</p>
               <pre class="code-static">static final Comparator&lt;Employee&gt; BY_SALARY_DESC =
    Comparator.comparingInt(Employee::salary).reversed().thenComparing(Employee::id);
static final Comparator&lt;Employee&gt; BY_NAME = Comparator.comparing(Employee::name);</pre>
               <p>Traps: subtraction se compare mat karo (overflow), Integer.compare use karo. Tie-breaker (id) jodo taaki order deterministic ho aur TreeSet mein elements gayab na hon.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Coding round mein comparator likhte waqt bolo: \"<i>main <code>Integer.compare</code> use kar raha hoon kyunki subtraction overflow karta hai</i>\". PriorityQueue aur sort waale har problem mein ye chhoti si line aapko baaki candidates se alag karti hai."
    }
  ],
  references: [
    { title: "Comparator (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Comparator.html", type: "docs" },
    { title: "Comparable (Java 17 API): consistent with equals", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Comparable.html", type: "docs" },
    { title: "Largest Number", by: "LeetCode", url: "https://leetcode.com/problems/largest-number/", type: "article" },
    { title: "Effective Java (3rd ed.), Item 14: Consider implementing Comparable", by: "Joshua Bloch", type: "book" }
  ]
});
