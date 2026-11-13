// Streams basics
registerLesson("java", "streams-basics", {
  why: "Java 8+ codebases mein data processing zyaadatar Streams se hota hai, aur interview mein \"ye loop stream se likho\" ya \"is pipeline ka output kya hoga\" lagbhag pakka aata hai. Lazy evaluation samajh liya to output-order wale tricky sawaal bhi aasan ho jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Problem: loop mein \"kaise\" zyada, \"kya\" kam</h2>
              <p>Zomato ke aaj ke orders mein se delivered orders ka total amount chahiye, jo ₹200 se upar hain:</p>
              <pre class="code-static">// Loop: kaise karna hai, step by step
int total = 0;
for (Order o : orders) {
    if (o.status().equals("DELIVERED") &amp;&amp; o.amount() &gt; 200) {
        total += o.amount();
    }
}

// Stream: kya chahiye, declare karo
int total = orders.stream()
    .filter(o -&gt; o.status().equals("DELIVERED"))
    .filter(o -&gt; o.amount() &gt; 200)
    .mapToInt(Order::amount)
    .sum();</pre>
              <h2>Pipeline: source → intermediate → terminal</h2>
              <pre class="diagram">
  SOURCE                INTERMEDIATE (lazy, naya Stream deti hain)        TERMINAL (eager, result)
 ┌──────────┐   ┌────────┐   ┌──────┐   ┌────────┐   ┌───────┐        ┌──────────────┐
 │ list     │──►│ filter │──►│ map  │──►│ sorted │──►│ limit │──────► │ collect /    │
 │ .stream()│   └────────┘   └──────┘   └────────┘   └───────┘        │ count / sum  │
 └──────────┘                                                         │ forEach ...  │
                 Terminal ke bina kuch bhi nahi chalta.               └──────────────┘</pre>
              <ul>
                <li><b>Stream data store nahi karta.</b> Source (list, array, file) se elements ek-ek karke pipeline mein bahte hain.</li>
                <li><b>Source nahi badalta.</b> <code>filter</code> list se kuch nahi hatata, naya stream deta hai.</li>
                <li><b>Ek stream sirf ek baar</b> use ho sakta hai. Terminal ke baad dobara use kiya to <code>IllegalStateException</code>.</li>
              </ul>
              <table>
                <tr><th>Source banane ke tareeke</th><th>Example</th></tr>
                <tr><td>Collection</td><td><code>list.stream()</code>, <code>set.stream()</code>, <code>map.entrySet().stream()</code></td></tr>
                <tr><td>Array</td><td><code>Arrays.stream(arr)</code></td></tr>
                <tr><td>Values</td><td><code>Stream.of("a", "b")</code></td></tr>
                <tr><td>Range</td><td><code>IntStream.range(0, 5)</code> (0..4), <code>rangeClosed(1, 5)</code> (1..5)</td></tr>
                <tr><td>Infinite</td><td><code>Stream.iterate(1, x -&gt; x * 2)</code>, <code>Stream.generate(supplier)</code> (limit zaroori)</td></tr>
                <tr><td>String ke chars</td><td><code>"hello".chars()</code> (IntStream)</td></tr>
              </table>`
    },
    {
      type: "code",
      title: "Pehla pipeline: loop vs stream, same answer",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String id, String status, int amount) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("O1", "DELIVERED", 450), new Order("O2", "CANCELLED", 900),
            new Order("O3", "DELIVERED", 150), new Order("O4", "DELIVERED", 320),
            new Order("O5", "PENDING", 700));

        int loopTotal = 0;
        for (Order o : orders) {
            if (o.status().equals("DELIVERED") && o.amount() > 200) loopTotal += o.amount();
        }

        int streamTotal = orders.stream()
            .filter(o -> o.status().equals("DELIVERED"))
            .filter(o -> o.amount() > 200)
            .mapToInt(Order::amount)
            .sum();

        List<String> bigIds = orders.stream()
            .filter(o -> o.amount() > 300)
            .map(Order::id)
            .collect(Collectors.toList());

        System.out.println(loopTotal + " " + streamTotal);
        System.out.println(bigIds);
        System.out.println("orders list same rahi: " + orders.size());
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>Common operations</h2>
              <table>
                <tr><th>Intermediate</th><th>Kaam</th><th>Note</th></tr>
                <tr><td><code>filter(pred)</code></td><td>Sirf matching rakho</td><td></td></tr>
                <tr><td><code>map(f)</code></td><td>Har element ko badlo (T → R)</td><td><code>mapToInt</code> → IntStream (sum, average)</td></tr>
                <tr><td><code>distinct()</code></td><td>Duplicates hatao (<code>equals</code>/<code>hashCode</code> se)</td><td>Stateful: dekhe hue yaad rakhta hai</td></tr>
                <tr><td><code>sorted()</code> / <code>sorted(cmp)</code></td><td>Sort</td><td>Stateful: <b>saare</b> elements chahiye, phir aage bhejta hai</td></tr>
                <tr><td><code>limit(n)</code> / <code>skip(n)</code></td><td>Pehle n lo / chhodo</td><td>limit short-circuit karta hai</td></tr>
                <tr><td><code>peek(c)</code></td><td>Har element dekho (debugging)</td><td>Logic ke liye mat use karo</td></tr>
              </table>
              <table>
                <tr><th>Terminal</th><th>Return</th></tr>
                <tr><td><code>collect(Collectors.toList())</code></td><td>List (mutable hone ki <b>guarantee nahi</b>, abhi ArrayList milta hai)</td></tr>
                <tr><td><code>toList()</code> (Java 16)</td><td><b>Unmodifiable</b> List</td></tr>
                <tr><td><code>count()</code></td><td>long</td></tr>
                <tr><td><code>forEach(c)</code></td><td>void (parallel mein order guarantee nahi; <code>forEachOrdered</code>)</td></tr>
                <tr><td><code>anyMatch / allMatch / noneMatch</code></td><td>boolean (short-circuit)</td></tr>
                <tr><td><code>findFirst / findAny</code></td><td>Optional</td></tr>
                <tr><td><code>min(cmp) / max(cmp)</code></td><td>Optional</td></tr>
                <tr><td><code>reduce</code>, <code>sum</code> (IntStream)</td><td>Ek value (Streams advanced lesson)</td></tr>
              </table>`
    },
    {
      type: "code",
      title: "filter, map, distinct, sorted, limit, skip, count, anyMatch, findFirst",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> dishes = List.of("dosa", "biryani", "idli", "Dosa", "pav bhaji", "biryani", "vada", "chole");

        System.out.println(dishes.stream()
            .map(String::toLowerCase)
            .distinct()
            .sorted()
            .collect(Collectors.toList()));

        System.out.println(dishes.stream()
            .filter(d -> d.length() <= 4)
            .map(String::toUpperCase)
            .toList());

        System.out.println(dishes.stream().sorted(Comparator.comparing(String::length).reversed()).limit(2).toList());
        System.out.println(dishes.stream().skip(6).toList());
        System.out.println("count b*: " + dishes.stream().filter(d -> d.startsWith("b")).count());
        System.out.println("koi 'pav'? " + dishes.stream().anyMatch(d -> d.contains("pav")));
        System.out.println("sab 4+ chars? " + dishes.stream().allMatch(d -> d.length() >= 4));
        System.out.println("pehla 'v' wala: " + dishes.stream().filter(d -> d.startsWith("v")).findFirst().orElse("none"));
        System.out.println("sabse lamba: " + dishes.stream().max(Comparator.comparingInt(String::length)).get());

        IntStream.rangeClosed(1, 5).map(x -> x * x).forEach(x -> System.out.print(x + " "));
        System.out.println();
    }
}`
    },
    {
      type: "exercise",
      id: "ex-adult-names",
      title: "Stream practice 1: adults ke naam",
      level: "Easy",
      task: "<p><code>adultNames(people)</code>: jinki age <b>≥ 18</b> hai, unke naam <b>UPPERCASE</b> mein, alphabetical order mein, <b>bina duplicates</b> ke. Ek hi stream pipeline mein likho.</p>",
      examples: "<code>[(riya,25), (aman,15), (kabir,30), (riya,40)]</code> → <code>[KABIR, RIYA]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Person(String name, int age) {}

class Solution {
    List<String> adultNames(List<Person> people) {
        return people.stream()
            .map(Person::name)
            .toList();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("example", List.of("KABIR", "RIYA"), () -> s.adultNames(List.of(
            new Person("riya", 25), new Person("aman", 15), new Person("kabir", 30), new Person("riya", 40))));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.adultNames(List.of()));
        Check.eq("exactly 18 included, 17 nahi", List.of("B"), () -> s.adultNames(List.of(new Person("a", 17), new Person("b", 18))));
        Check.eq("mixed case duplicates", List.of("DEV"), () -> s.adultNames(List.of(new Person("Dev", 20), new Person("dev", 22))));
        Check.eq("sab minor", List.of(), () -> s.adultNames(List.of(new Person("x", 1), new Person("y", 2))));
    }
}`,
      hints: [
        "Order: <code>filter</code> (age) → <code>map</code> (naam uppercase) → <code>distinct</code> → <code>sorted</code> → <code>toList</code>.",
        "Uppercase <b>pehle</b> karo, distinct baad mein: tabhi \"Dev\" aur \"dev\" ek maane jaayenge."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Person(String name, int age) {}

class Solution {
    List<String> adultNames(List<Person> people) {
        return people.stream()
            .filter(p -> p.age() >= 18)
            .map(p -> p.name().toUpperCase())
            .distinct()
            .sorted()
            .toList();
    }
}`,
      explain: "<p>Har step ek kaam karta hai aur requirement jaisa padhta hai. O(n log n) sort ki wajah se. <code>distinct</code> map ke baad hai, warna mixed case duplicates bach jaate.</p>"
    },
    {
      type: "exercise",
      id: "ex-odd-squares",
      title: "Stream practice 2: odd numbers ke top 3 squares",
      level: "Easy",
      task: "<p><code>topOddSquares(nums)</code>: sirf <b>odd</b> numbers lo (negative bhi ho sakte hain), unka square karo, duplicates hatao, <b>bade se chhote</b> sort karo, aur pehle <b>3</b> return karo.</p>",
      examples: "<code>[1, 2, 3, 4, 5, 7, 3]</code> → <code>[49, 25, 9]</code><br><code>[-3, 3, 1]</code> → <code>[9, 1]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

class Solution {
    List<Integer> topOddSquares(List<Integer> nums) {
        return List.of();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1,2,3,4,5,7,3]", List.of(49, 25, 9), () -> s.topOddSquares(List.of(1, 2, 3, 4, 5, 7, 3)));
        Check.eq("[-3,3,1]", List.of(9, 1), () -> s.topOddSquares(List.of(-3, 3, 1)));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.topOddSquares(List.of()));
        Check.eq("sirf even", List.of(), () -> s.topOddSquares(List.of(2, 4, 6)));
        Check.eq("negative odd (-5 % 2 == -1!)", List.of(25, 9), () -> s.topOddSquares(List.of(-5, -3, -4)));
        Check.eq("bahut saare", List.of(81, 49, 25), () -> s.topOddSquares(List.of(9, 7, 5, 3, 1, 9, 7)));
    }
}`,
      hints: [
        "Odd check: <code>x % 2 != 0</code>. <code>x % 2 == 1</code> negative pe fail hota hai (Java mein -5 % 2 = -1).",
        "<code>.sorted(Comparator.reverseOrder())</code> phir <code>.limit(3)</code>."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

class Solution {
    List<Integer> topOddSquares(List<Integer> nums) {
        return nums.stream()
            .filter(x -> x % 2 != 0)
            .map(x -> x * x)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .limit(3)
            .toList();
    }
}`,
      explain: "<p>Java mein <code>%</code> ka sign dividend jaisa hota hai: <code>-5 % 2 == -1</code>. Isliye odd check <code>!= 0</code> se karo. -3 aur 3 dono ka square 9, <code>distinct</code> ek rakhta hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>Lazy evaluation: asli magic</h2>
              <p>Intermediate operations sirf ek \"recipe\" banate hain. Kaam tab shuru hota hai jab <b>terminal</b> operation call hota hai. Aur tab bhi elements <b>ek ek karke poori pipeline se guzarte hain</b> (vertical), har stage pehle saare elements process nahi karti (horizontal nahi).</p>
              <ul>
                <li><b>Short-circuit:</b> <code>findFirst</code>, <code>anyMatch</code>, <code>limit</code> jawab milte hi ruk jaate hain. Baaki elements chhuye bhi nahi jaate. Isliye infinite stream + <code>limit</code> chalta hai.</li>
                <li><b>Stateful ops</b> (<code>sorted</code>, <code>distinct</code> thoda) vertical flow todte hain: <code>sorted</code> ko saare elements chahiye, to pehle sab us tak pahunchte hain, phir aage jaate hain.</li>
                <li>Faayda: kam kaam (1 crore elements mein pehla match chahiye to sirf utna padho), aur ek hi pass mein filter + map.</li>
              </ul>`
    },
    {
      type: "steps",
      title: "Stream.of(\"a\", \"bb\", \"ccc\", \"dd\").filter(len > 1).map(toUpperCase).findFirst()",
      steps: [
        { title: "Pipeline bani, kuch nahi chala", html: `<div class="arr"><span class="cell">a</span><span class="cell">bb</span><span class="cell">ccc</span><span class="cell">dd</span></div><p>filter aur map sirf register hue. <code>findFirst()</code> (terminal) call hua → ab source se elements maange jaate hain.</p>` },
        { title: "\"a\" → filter", html: `<div class="arr"><span class="cell bad">a</span><span class="cell">bb</span><span class="cell">ccc</span><span class="cell">dd</span></div><p>length 1, filter fail. map tak gaya hi nahi. Agla element.</p>` },
        { title: "\"bb\" → filter ✅ → map", html: `<div class="arr"><span class="cell dim">a</span><span class="cell hl">bb → BB</span><span class="cell">ccc</span><span class="cell">dd</span></div><p>filter pass, <b>turant</b> map: \"BB\". Ab findFirst tak pahuncha.</p>` },
        { title: "findFirst ko jawab mil gaya: STOP", html: `<div class="arr"><span class="cell dim">a</span><span class="cell ok">BB</span><span class="cell dim">ccc</span><span class="cell dim">dd</span></div><p>\"ccc\" aur \"dd\" pe filter bhi nahi chala. Total: 2 filter calls, 1 map call. Loop wale \"pehle sab filter, phir sab map\" mein 4 + 3 calls hote.</p>` }
      ]
    },
    {
      type: "code",
      title: "peek se laziness khud dekho: terminal ke bina, vertical order, short-circuit, sorted barrier",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("1) Terminal ke bina:");
        Stream<Integer> s = Stream.of(1, 2, 3).peek(x -> System.out.println("   dekha " + x));
        System.out.println("   (kuch print nahi hua)");

        System.out.println("2) Vertical flow:");
        Stream.of(1, 2, 3)
            .filter(x -> { System.out.println("   filter " + x); return x != 2; })
            .map(x -> { System.out.println("   map " + x); return x * 10; })
            .forEach(x -> System.out.println("   forEach " + x));

        System.out.println("3) limit short-circuit (infinite stream!):");
        List<Integer> firstTwo = Stream.iterate(1, x -> x + 1)
            .peek(x -> System.out.println("   generated " + x))
            .filter(x -> x % 3 == 0)
            .limit(2)
            .toList();
        System.out.println("   " + firstTwo);

        System.out.println("4) sorted barrier:");
        Stream.of(3, 1, 2)
            .peek(x -> System.out.println("   before sort " + x))
            .sorted()
            .forEach(x -> System.out.println("   after sort " + x));
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">Stream.of("x", "yy", "zzz")
    .map(w -&gt; { System.out.print("m" + w.length() + " "); return w.length(); })
    .filter(n -&gt; { System.out.print("f" + n + " "); return n &gt;= 2; })
    .findFirst();</pre>`,
      options: ["m1 m2 m3 f1 f2 f3", "m1 f1 m2 f2", "m1 f1 m2 f2 m3 f3", "m2 f2"],
      answer: 1,
      why: "Vertical flow: \"x\" → m1, f1 (fail). \"yy\" → m2, f2 (pass) → findFirst ko mil gaya, ruk jao. \"zzz\" kabhi process nahi hua."
    },
    {
      type: "code",
      expectException: true,
      title: "Do aur traps: toList() unmodifiable hai, aur stream dobara use nahi hota",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> a = Stream.of(3, 1, 2).collect(Collectors.toList());
        a.add(4);                                    // abhi chalta hai (ArrayList), par guarantee nahi
        System.out.println("Collectors.toList: " + a);

        List<Integer> b = Stream.of(3, 1, 2).toList();
        try {
            b.add(4);                                // Java 16 toList(): unmodifiable
        } catch (UnsupportedOperationException e) {
            System.out.println("toList() unmodifiable: " + e.getClass().getSimpleName());
        }

        Stream<Integer> once = Stream.of(1, 2, 3);
        System.out.println("count = " + once.count());
        once.forEach(System.out::println);           // 💥 IllegalStateException
    }
}`,
      note: "Error: <i>stream has already been operated upon or closed</i>. Stream ek baar ka pipe hai. Dobara chahiye to source se naya stream banao (<code>list.stream()</code> dobara), ya <code>Supplier&lt;Stream&lt;T&gt;&gt;</code> rakho. Mutable list chahiye to <code>Collectors.toCollection(ArrayList::new)</code>."
    },
    {
      type: "quiz",
      q: `Java 17 pe output?<pre class="code-static">long n = List.of(1, 2, 3).stream()
    .peek(x -&gt; System.out.println("saw " + x))
    .count();
System.out.println(n);</pre>`,
      options: ["saw 1, saw 2, saw 3, phir 3", "Sirf 3 (peek chala hi nahi)", "Compile error", "saw 1, phir 3"],
      answer: 1,
      why: "Java 9+ mein <code>count()</code> agar size seedha source se nikal sakta hai (List ka size pata hai, beech mein filter jaisa kuch nahi), to pipeline chalata hi nahi. Javadoc isko allow karta hai. Isliye <code>peek</code> / <code>map</code> mein side effects pe kabhi bharosa mat karo. Beech mein <code>filter</code> laga do to peek chalega."
    },
    {
      type: "exercise",
      id: "ex-iterate-limit",
      title: "Stream practice 3: infinite stream + limit",
      level: "Easy",
      task: `<p><code>Stream.iterate</code> se 7 ke multiples ka infinite stream banao (7, 14, 21, ...). Usme se jo <b>50 se bade</b> hain aur <b>even</b> hain, unme se pehle <b>4</b> print karo, har ek nayi line pe. Exactly ye output:</p><pre class='code-static'>56
70
84
98</pre>`,
      starter: `import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // Stream.iterate(7, x -> x + 7) ...
    }
}`,
      expectedOutput: `56
70
84
98`,
      hints: [
        "<code>Stream.iterate(7, x -&gt; x + 7)</code> kabhi khatam nahi hota. <code>limit</code> <b>filter ke baad</b> lagao.",
        "<code>.filter(x -&gt; x &gt; 50).filter(x -&gt; x % 2 == 0).limit(4).forEach(System.out::println)</code>"
      ],
      solution: `import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Stream.iterate(7, x -> x + 7)
            .filter(x -> x > 50)
            .filter(x -> x % 2 == 0)
            .limit(4)
            .forEach(System.out::println);
    }
}`,
      explain: "<p>Laziness ki wajah se infinite stream safe hai: <code>limit(4)</code> chaar elements milte hi upstream ko rok deta hai. Agar <code>limit</code> filter se <b>pehle</b> lagate (<code>limit(4)</code> → 7, 14, 21, 28), to koi bhi 50 se bada nahi milta. Java 9 alternative: <code>Stream.iterate(7, x -&gt; x &lt;= 100, x -&gt; x + 7)</code> (finite).</p>"
    },
    {
      type: "think",
      id: "think-lazy",
      q: "Interview question: <b>\"Streams lazy hain, iska matlab kya hai? Isse kya faayda hota hai, aur kaunse operations is laziness ko todte hain?\"</b>",
      rubric: [
        { point: "Intermediate ops sirf pipeline banate hain; kaam <b>terminal</b> operation pe shuru hota hai", keys: ["terminal", "intermediate", "tab tak", "until", "nothing runs", "kuch nahi chalta"], weight: 2 },
        { point: "Elements <b>ek ek karke</b> poori pipeline se guzarte hain (vertical / fused, ek hi pass)", keys: ["ek ek", "one by one", "vertical", "single pass", "ek pass", "fuse", "element by element"], weight: 2 },
        { point: "<b>Short-circuit</b>: findFirst / anyMatch / limit jaldi ruk jaate hain; infinite streams possible", keys: ["short-circuit", "short circuit", "findfirst", "anymatch", "limit", "infinite"], weight: 2 },
        { point: "Stateful ops jaise <b>sorted</b> (aur distinct) ko saare / pichhle elements chahiye: barrier", keys: ["sorted", "stateful", "barrier", "distinct"], weight: 1 },
        { point: "Side effects (peek, map mein print) pe bharosa nahi; count() pipeline skip kar sakta hai", keys: ["side effect", "peek", "count"], weight: 1 }
      ],
      answer: `<p><b>Lazy</b> matlab <code>filter</code>, <code>map</code>, <code>sorted</code> jaise intermediate operations call karne pe kuch compute nahi hota. Wo sirf pipeline ke stages jodte hain. Jab <code>collect</code>, <code>forEach</code>, <code>findFirst</code> jaisa <b>terminal</b> operation aata hai, tab source se elements kheenche jaate hain.</p>
               <p>Elements <b>ek ek karke</b> saare stages se guzarte hain (filter → map → terminal), isliye poora kaam ek hi pass mein hota hai aur beech mein temporary collections nahi bante.</p>
               <p><b>Faayde:</b> (1) <b>short-circuit</b>: <code>findFirst</code>/<code>anyMatch</code>/<code>limit</code> jawab milte hi ruk jaate hain, baaki data padha hi nahi jaata; (2) infinite streams (<code>Stream.iterate</code> + <code>limit</code>) possible; (3) kam memory.</p>
               <p><b>Laziness todne wale:</b> <code>sorted</code> ko saare elements chahiye, to wo barrier hai: pehle sab upar ke stages se guzarte hain, phir sorted order mein aage. <code>distinct</code> ko dekhe hue elements yaad rakhne padte hain. Aur side effects pe bharosa mat karo: Java 9+ mein <code>count()</code> size pata ho to pipeline chalata hi nahi.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Stream output wale sawaal mein pen se ek table banao: rows = elements, columns = stages. Har element ko left se right le jao jab tak wo filter pe ruke ya terminal tak pahunche. Short-circuit terminal (findFirst, anyMatch, limit) pe jawab milte hi table band. Sorted ho to wahan line kheencho: upar sab, phir neeche sorted order."
    }
  ],
  references: [
    { title: "java.util.stream package summary (laziness, short-circuiting)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html", type: "docs" },
    { title: "Stream (Java 17 API): count() API note, toList()", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html", type: "docs" },
    { title: "Aggregate Operations (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/collections/streams/", type: "docs" },
    { title: "dev.java: Learn Java (Streams section)", by: "Oracle", url: "https://dev.java/learn/", type: "docs" }
  ]
});
