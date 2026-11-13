// Streams advanced
registerLesson("java", "streams-advanced", {
  why: "Asli projects mein streams ka zyada kaam filter/map nahi, balki grouping, counting aur maps banana hota hai: \"city-wise orders\", \"user-wise total spend\". Interview mein groupingBy + downstream collector, toMap ka duplicate key exception, aur reduce ke identity/combiner rules seedha poochhe jaate hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>flatMap: list ke andar list ko ek seedhi list banao</h2>
              <p>Swiggy ke har order mein kai items hain. \"Aaj kaun kaun se items bike?\" chahiye. <code>map(Order::items)</code> lagaya to <code>Stream&lt;List&lt;String&gt;&gt;</code> milta hai: har element ek poori list. Hume chahiye <code>Stream&lt;String&gt;</code>: saare items ek line mein.</p>
              <ul>
                <li><code>map(f)</code>: har element se <b>ek</b> naya element (1 → 1).</li>
                <li><code>flatMap(f)</code>: har element se ek <b>stream</b> banao (0, 1 ya kai elements), phir saare chhote streams ko ek bade stream mein jod do (1 → 0..n).</li>
              </ul>
              <pre class="diagram">
 map(Order::items)                      flatMap(o -&gt; o.items().stream())
 ┌──────────────────────┐               ┌───────────────────────────────────┐
 │ [dosa, chai]         │               │ dosa, chai, biryani, raita, chai  │
 │ []                   │   ──────►     └───────────────────────────────────┘
 │ [biryani, raita, chai]│               Stream&lt;String&gt; (khaali list se kuch nahi aaya)
 └──────────────────────┘
 Stream&lt;List&lt;String&gt;&gt;</pre>
              <p>Rule yaad rakho: flatMap ko diya gaya function <b>Stream return karta hai</b>. List ho to <code>.stream()</code>, array ho to <code>Arrays.stream(arr)</code>, Optional ho to <code>Optional::stream</code> (Java 9).</p>`
    },
    {
      type: "steps",
      title: "flatMap dry run: teen orders → ek items stream",
      steps: [
        { title: "Source: 3 orders", html: `<div class="arr"><span class="cell">O1 [dosa, chai]</span><span class="cell">O2 []</span><span class="cell">O3 [biryani, raita, chai]</span></div><p>Har order ke andar ek list hai. Terminal (<code>toList()</code>) call hone pe O1 se shuru.</p>` },
        { title: "O1 → stream(dosa, chai)", html: `<div class="arr"><span class="cell hl">O1</span><span class="cell">O2</span><span class="cell">O3</span></div><div class="arr"><span class="cell ok">dosa</span><span class="cell ok">chai</span></div><p>Function ne 2 elements ka stream diya. Dono seedhe output stream mein bahe.</p>` },
        { title: "O2 → khaali stream", html: `<div class="arr"><span class="cell dim">O1</span><span class="cell hl">O2</span><span class="cell">O3</span></div><div class="arr"><span class="cell ok">dosa</span><span class="cell ok">chai</span></div><p>Khaali list → khaali stream → output mein kuch nahi juda. Koi null nahi, koi <code>[]</code> nahi.</p>` },
        { title: "O3 → stream(biryani, raita, chai)", html: `<div class="arr"><span class="cell dim">O1</span><span class="cell dim">O2</span><span class="cell hl">O3</span></div><div class="arr"><span class="cell ok">dosa</span><span class="cell ok">chai</span><span class="cell ok">biryani</span><span class="cell ok">raita</span><span class="cell ok">chai</span></div><p>Final: 5 elements ka ek flat stream. \"chai\" do baar hai; unique chahiye to aage <code>distinct()</code> lagao.</p>` }
      ]
    },
    {
      type: "code",
      title: "flatMap ke common use: nested lists, words, combinations, Optional::stream",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String id, List<String> items) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("O1", List.of("dosa", "chai")),
            new Order("O2", List.of()),
            new Order("O3", List.of("biryani", "raita", "chai")));

        List<List<String>> nested = orders.stream().map(Order::items).toList();
        System.out.println("map     : " + nested);

        List<String> flat = orders.stream().flatMap(o -> o.items().stream()).toList();
        System.out.println("flatMap : " + flat);

        Set<String> unique = orders.stream()
            .flatMap(o -> o.items().stream())
            .collect(Collectors.toCollection(TreeSet::new));
        System.out.println("unique  : " + unique);

        List<String> lines = List.of("upi se payment", "card se payment fail");
        List<String> words = lines.stream()
            .flatMap(line -> Arrays.stream(line.split(" ")))
            .distinct()
            .toList();
        System.out.println("words   : " + words);

        List<String> combos = Stream.of("S", "M")
            .flatMap(size -> Stream.of("Red", "Blue").map(color -> size + "-" + color))
            .toList();
        System.out.println("combos  : " + combos);

        List<Optional<String>> cities = List.of(Optional.of("Pune"), Optional.empty(), Optional.of("Goa"));
        System.out.println("Optional::stream : " + cities.stream().flatMap(Optional::stream).toList());
    }
}`
    },
    {
      type: "quiz",
      q: `<code>List&lt;String&gt; lines = List.of("a b", "c");</code><br><code>lines.stream().map(l -&gt; l.split(" "))</code> ka type kya hai, aur <code>flatMap(l -&gt; Arrays.stream(l.split(" ")))</code> ka?`,
      options: [
        "Dono <code>Stream&lt;String&gt;</code>",
        "<code>Stream&lt;String[]&gt;</code> aur <code>Stream&lt;String&gt;</code>",
        "<code>Stream&lt;List&lt;String&gt;&gt;</code> aur <code>Stream&lt;String&gt;</code>",
        "<code>Stream&lt;String[]&gt;</code> aur <code>Stream&lt;String[]&gt;</code>"
      ],
      answer: 1,
      why: "<code>split</code> array deta hai, to <code>map</code> ke baad har element ek <code>String[]</code> hai (2 elements: [\"a\",\"b\"] aur [\"c\"]). <code>flatMap</code> har array ko stream mein khol ke jodta hai: \"a\", \"b\", \"c\". Interview mein ye galti common hai: <code>map(split)</code> ke baad <code>distinct()</code> lagate hain aur arrays compare ho jaate hain, words nahi."
    },
    {
      type: "text",
      html: `
              <h2>reduce: poore stream ko ek value mein samet do</h2>
              <p><code>sum()</code>, <code>max()</code>, <code>count()</code> sab andar se reduction hain. <code>reduce</code> iska general version hai. Teen forms:</p>
              <table>
                <tr><th>Form</th><th>Return</th><th>Kab</th></tr>
                <tr><td><code>reduce(accumulator)</code></td><td><code>Optional&lt;T&gt;</code></td><td>Khaali stream ka koi sensible jawab nahi (jaise max)</td></tr>
                <tr><td><code>reduce(identity, accumulator)</code></td><td><code>T</code></td><td>Khaali stream pe identity hi jawab (sum → 0, product → 1)</td></tr>
                <tr><td><code>reduce(identity, accumulator, combiner)</code></td><td><code>U</code> (alag type)</td><td>Input T hai par result U hai (Strings → total length int). Combiner parallel mein do partial results jodta hai</td></tr>
              </table>
              <ul>
                <li><b>identity</b>: wo value jo kisi bhi x ke saath jodne pe x hi de. Sum ke liye 0, product ke liye 1, string concat ke liye <code>""</code>. Galat identity (jaise sum mein 10) sequential mein ek baar judti hai, par parallel mein <b>har chunk</b> mein judti hai, aur answer badal jaata hai.</li>
                <li><b>accumulator</b>: (ab tak ka result, agla element) → naya result.</li>
                <li><b>combiner</b>: (partial result, partial result) → result. Accumulator ke saath compatible hona chahiye.</li>
                <li>Operation <b>associative</b> hona chahiye: <code>(a op b) op c == a op (b op c)</code>. Sum, max, multiply theek. Subtraction nahi: parallel mein galat answer.</li>
              </ul>`
    },
    {
      type: "code",
      title: "reduce ke teeno forms, accumulator ka trace, aur galat identity ka asar",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> bills = List.of(120, 450, 80, 300);

        int total = bills.stream().reduce(0, (a, b) -> a + b);
        int total2 = bills.stream().reduce(0, Integer::sum);
        Optional<Integer> max = bills.stream().reduce(Integer::max);
        Optional<Integer> none = Stream.<Integer>empty().reduce(Integer::sum);
        int product = Stream.of(2, 3, 4).reduce(1, (a, b) -> a * b);
        System.out.println(total + " " + total2 + " " + max.get() + " " + none.isPresent() + " " + product);

        // 3-arg form: input String, result int
        List<String> dishes = List.of("dosa", "biryani", "idli");
        int letters = dishes.stream().reduce(0, (acc, s) -> acc + s.length(), Integer::sum);
        System.out.println("letters = " + letters);

        // Accumulator ka trace
        Stream.of(1, 2, 3).reduce(0, (acc, x) -> {
            System.out.println("  acc=" + acc + " x=" + x + " -> " + (acc + x));
            return acc + x;
        });

        // Galat identity (10): sequential mein ek baar judta hai, parallel mein har chunk mein
        int seq = Stream.of(1, 2, 3, 4).reduce(10, Integer::sum);
        int par = List.of(1, 2, 3, 4).parallelStream().reduce(10, Integer::sum);
        System.out.println("sequential = " + seq + ", parallel = " + par);
    }
}`,
      note: "Parallel wala number CPU cores aur splitting pe depend karta hai, aapki machine pe alag aa sakta hai. Sequential hamesha 20 (10 + 1+2+3+4). Sahi tareeka: <code>reduce(0, Integer::sum) + 10</code>."
    },
    {
      type: "quiz",
      q: `Output?<pre class="code-static">String s = Stream.of("a", "b", "c").reduce("", (acc, x) -&gt; x + acc);
System.out.println(s);</pre>`,
      options: ["abc", "cba", "\"\"abc", "Compile error: reduce String pe nahi chalta"],
      answer: 1,
      why: "Accumulator <code>x + acc</code> hai (naya element <b>aage</b>): \"\" → \"a\" → \"ba\" → \"cba\". Order accumulator decide karta hai. (Sequential stream mein left se right element aate hain.)"
    },
    {
      type: "exercise",
      id: "ex-flatmap-tags",
      title: "flatMap practice: saare videos ke unique tags",
      level: "Easy",
      task: "<p>YouTube jaisa app. Har <code>Video</code> ke paas tags ki list hai. <code>allTags(videos)</code>: saare videos ke tags ek list mein, <b>lowercase</b>, <b>bina duplicate</b>, <b>alphabetical</b> order mein.</p>",
      examples: "<code>[Video(\"v1\", [Java, Streams]), Video(\"v2\", []), Video(\"v3\", [java, DSA])]</code> → <code>[dsa, java, streams]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Video(String title, List<String> tags) {}

class Solution {
    List<String> allTags(List<Video> videos) {
        return List.of();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("example", List.of("dsa", "java", "streams"), () -> s.allTags(List.of(
            new Video("v1", List.of("Java", "Streams")), new Video("v2", List.of()), new Video("v3", List.of("java", "DSA")))));
        Check.eq("ek video", List.of("chai", "pune"), () -> s.allTags(List.of(new Video("a", List.of("Pune", "chai")))));
        Check.hiddenFromHere();
        Check.eq("koi video nahi", List.of(), () -> s.allTags(List.of()));
        Check.eq("sab videos khaali", List.of(), () -> s.allTags(List.of(new Video("a", List.of()), new Video("b", List.of()))));
        Check.eq("same tag alag case", List.of("upi"), () -> s.allTags(List.of(new Video("a", List.of("UPI", "upi")), new Video("b", List.of("Upi")))));
        List<Video> many = new ArrayList<>();
        for (int i = 0; i < 20000; i++) many.add(new Video("v" + i, List.of("T" + (i % 50), "common")));
        Check.eq("20000 videos, 51 unique tags", 51, () -> s.allTags(many).size());
    }
}`,
      hints: [
        "<code>videos.stream().flatMap(v -&gt; v.tags().stream())</code> se saare tags ek stream mein.",
        "Phir <code>.map(String::toLowerCase).distinct().sorted().toList()</code>. Lowercase distinct se <b>pehle</b>."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Video(String title, List<String> tags) {}

class Solution {
    List<String> allTags(List<Video> videos) {
        return videos.stream()
            .flatMap(v -> v.tags().stream())
            .map(String::toLowerCase)
            .distinct()
            .sorted()
            .toList();
    }
}`,
      explain: "<p>Total tags T ho to O(T log T) (sort ki wajah se). flatMap khaali lists ko apne aap ignore kar deta hai. Alternative: <code>collect(Collectors.toCollection(TreeSet::new))</code> distinct + sort dono ek saath karta hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>collect + Collectors.groupingBy: SQL ka GROUP BY</h2>
              <p><code>SELECT city, COUNT(*) FROM orders GROUP BY city</code> jaisa kaam streams mein <code>groupingBy</code> karta hai. Teen overloads:</p>
              <table>
                <tr><th>Call</th><th>Result</th></tr>
                <tr><td><code>groupingBy(classifier)</code></td><td><code>Map&lt;K, List&lt;T&gt;&gt;</code>: har key ke elements ki list</td></tr>
                <tr><td><code>groupingBy(classifier, downstream)</code></td><td>Har group pe ek aur collector chalao (count, sum, mapping...)</td></tr>
                <tr><td><code>groupingBy(classifier, mapFactory, downstream)</code></td><td>Map ka type bhi tum chuno: <code>TreeMap::new</code> (sorted keys), <code>LinkedHashMap::new</code></td></tr>
              </table>
              <p>Common downstream collectors:</p>
              <table>
                <tr><th>Downstream</th><th>Har group ka result</th><th>Type</th></tr>
                <tr><td><code>counting()</code></td><td>Kitne elements</td><td><b>Long</b> (Integer nahi!)</td></tr>
                <tr><td><code>summingInt(f)</code></td><td>Sum</td><td>Integer</td></tr>
                <tr><td><code>averagingInt(f)</code> / <code>averagingDouble(f)</code></td><td>Average</td><td><b>Double</b> (hamesha)</td></tr>
                <tr><td><code>mapping(f, downstream)</code></td><td>Pehle har element ko f se badlo, phir downstream</td><td>jaise <code>List&lt;String&gt;</code></td></tr>
                <tr><td><code>maxBy(cmp)</code> / <code>minBy(cmp)</code></td><td>Sabse bada/chhota</td><td><code>Optional&lt;T&gt;</code></td></tr>
                <tr><td><code>toSet()</code>, <code>toCollection(TreeSet::new)</code></td><td>List ki jagah set</td><td></td></tr>
              </table>
              <p>1 aur 2-arg version ka map type <b>guaranteed nahi</b> (javadoc: no guarantees on type/mutability). Abhi HashMap aata hai, isliye key order random dikhta hai. Order chahiye to <code>TreeMap::new</code> do.</p>`
    },
    {
      type: "steps",
      title: "groupingBy(Order::city, counting()) dry run",
      steps: [
        { title: "Shuru: khaali map", html: `<div class="arr"><span class="cell">Pune 250</span><span class="cell">Mumbai 600</span><span class="cell">Pune 150</span><span class="cell">Delhi 400</span><span class="cell">Mumbai 900</span></div><p>Map: <code>{}</code>. Har element pe classifier (<code>Order::city</code>) key nikalta hai.</p>` },
        { title: "Pune 250 → key Pune", html: `<div class="arr"><span class="cell hl">Pune 250</span><span class="cell">Mumbai 600</span><span class="cell">Pune 150</span><span class="cell">Delhi 400</span><span class="cell">Mumbai 900</span></div><p>Pune bucket nahi tha, bana. Downstream counter: <code>{Pune=1}</code></p>` },
        { title: "Mumbai 600 → key Mumbai", html: `<div class="arr"><span class="cell dim">Pune 250</span><span class="cell hl">Mumbai 600</span><span class="cell">Pune 150</span><span class="cell">Delhi 400</span><span class="cell">Mumbai 900</span></div><p><code>{Pune=1, Mumbai=1}</code></p>` },
        { title: "Pune 150 → existing bucket", html: `<div class="arr"><span class="cell dim">Pune 250</span><span class="cell dim">Mumbai 600</span><span class="cell hl">Pune 150</span><span class="cell">Delhi 400</span><span class="cell">Mumbai 900</span></div><p>Pune ka bucket pehle se hai, uska counter badha: <code>{Pune=2, Mumbai=1}</code></p>` },
        { title: "Baaki do", html: `<div class="arr"><span class="cell dim">Pune 250</span><span class="cell dim">Mumbai 600</span><span class="cell dim">Pune 150</span><span class="cell ok">Delhi 400</span><span class="cell ok">Mumbai 900</span></div><p><code>{Pune=2, Mumbai=2, Delhi=1}</code>. Har bucket ka apna downstream collector hai. <code>counting()</code> ki jagah <code>summingInt(Order::amount)</code> hota to <code>{Pune=400, Mumbai=1500, Delhi=400}</code>.</p>` }
      ]
    },
    {
      type: "code",
      title: "groupingBy + counting, summingInt, averagingInt, mapping, maxBy, TreeMap, nested",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String city, String restaurant, int amount) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("Pune", "Vaishali", 250), new Order("Mumbai", "Bademiya", 600),
            new Order("Pune", "Vaishali", 150), new Order("Delhi", "Haldiram", 400),
            new Order("Mumbai", "Britannia", 900), new Order("Pune", "Goodluck", 300));

        Map<String, List<Order>> byCity = orders.stream().collect(Collectors.groupingBy(Order::city));
        System.out.println("Pune ke orders: " + byCity.get("Pune").size());

        Map<String, Long> count = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new, Collectors.counting()));
        System.out.println("counting     : " + count);

        Map<String, Integer> revenue = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new, Collectors.summingInt(Order::amount)));
        System.out.println("summingInt   : " + revenue);

        Map<String, Double> avg = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new, Collectors.averagingInt(Order::amount)));
        System.out.println("averagingInt : " + avg);

        Map<String, Set<String>> restaurants = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new,
                     Collectors.mapping(Order::restaurant, Collectors.toCollection(TreeSet::new))));
        System.out.println("mapping      : " + restaurants);

        Map<String, Optional<Order>> biggest = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new,
                     Collectors.maxBy(Comparator.comparingInt(Order::amount))));
        biggest.forEach((city, o) -> System.out.println("maxBy " + city + " -> " + o.get().amount()));

        Map<String, Map<String, Long>> nested = orders.stream()
            .collect(Collectors.groupingBy(Order::city, TreeMap::new,
                     Collectors.groupingBy(Order::restaurant, TreeMap::new, Collectors.counting())));
        System.out.println("nested       : " + nested);
    }
}`
    },
    {
      type: "quiz",
      q: "<code>Map&lt;String, Integer&gt; m = list.stream().collect(Collectors.groupingBy(Order::city, Collectors.counting()));</code> kya hoga?",
      options: [
        "Chalega, har city ka count",
        "Compile error: counting() Long deta hai, Map&lt;String, Long&gt; chahiye",
        "Runtime ClassCastException",
        "Chalega, par values null aayengi"
      ],
      answer: 1,
      why: "<code>counting()</code> ka type <code>Collector&lt;T, ?, Long&gt;</code> hai. Generics mein <code>Long</code> se <code>Integer</code> auto convert nahi hota, to compile error. Int chahiye to <code>Collectors.summingInt(o -&gt; 1)</code> ya <code>collectingAndThen(counting(), Long::intValue)</code>."
    },
    {
      type: "exercise",
      id: "ex-avg-rating",
      title: "groupingBy practice: restaurant-wise average rating (sorted)",
      level: "Medium",
      task: "<p>Zomato reviews ki list hai. <code>avgRating(reviews)</code> ek map return kare: restaurant → uski average stars. Keys <b>alphabetical order</b> mein honi chahiye (harness <code>keySet()</code> ka order check karta hai). Ek hi stream pipeline.</p>",
      examples: "<code>[(Vaishali,5), (Haldiram,3), (Vaishali,4)]</code> → <code>{Haldiram=3.0, Vaishali=4.5}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Review(String restaurant, int stars) {}

class Solution {
    Map<String, Double> avgRating(List<Review> reviews) {
        return new HashMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        List<Review> r1 = List.of(new Review("Vaishali", 5), new Review("Haldiram", 3), new Review("Vaishali", 4));
        Check.eq("keys sorted", List.of("Haldiram", "Vaishali"), () -> new ArrayList<>(s.avgRating(r1).keySet()));
        Check.eq("values", List.of(3.0, 4.5), () -> new ArrayList<>(s.avgRating(r1).values()));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> new ArrayList<>(s.avgRating(List.of()).keySet()));
        List<Review> r2 = List.of(new Review("Zaika", 4), new Review("Anand", 5), new Review("Zaika", 4), new Review("Zaika", 3), new Review("Moti", 1));
        Check.eq("3 restaurants ka order", List.of("Anand", "Moti", "Zaika"), () -> new ArrayList<>(s.avgRating(r2).keySet()));
        Check.eq("non-integer average 11/3", List.of(5.0, 1.0, 11.0 / 3), () -> new ArrayList<>(s.avgRating(r2).values()));
        List<Review> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(new Review("R" + (char) ('A' + i % 26), i % 5 + 1));
        Check.eq("1 lakh reviews: 26 restaurants", 26, () -> s.avgRating(big).size());
        Check.eq("1 lakh reviews: pehli key", "RA", () -> s.avgRating(big).keySet().iterator().next());
    }
}`,
      hints: [
        "<code>Collectors.groupingBy(classifier, mapFactory, downstream)</code> wala 3-arg form use karo.",
        "<code>groupingBy(Review::restaurant, TreeMap::new, Collectors.averagingInt(Review::stars))</code>"
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Review(String restaurant, int stars) {}

class Solution {
    Map<String, Double> avgRating(List<Review> reviews) {
        return reviews.stream()
            .collect(Collectors.groupingBy(Review::restaurant, TreeMap::new,
                     Collectors.averagingInt(Review::stars)));
    }
}`,
      explain: "<p>n reviews, k restaurants: O(n log k) (TreeMap insert). <code>averagingInt</code> andar sum aur count dono rakhta hai aur end mein Double deta hai. HashMap wala 2-arg <code>groupingBy</code> sahi values deta, par key order random hota.</p>"
    },
    {
      type: "text",
      html: `
              <h2>partitioningBy: sirf do group, true aur false</h2>
              <p>Predicate ke basis pe do hisse: \"₹300 se upar wale orders\" vs \"baaki\". Result <code>Map&lt;Boolean, List&lt;T&gt;&gt;</code>. groupingBy(predicate) se farak: partitioningBy ke map mein <b>dono keys (true, false) hamesha</b> hoti hain, chahe ek group khaali ho. groupingBy mein khaali group ki key hi nahi banti, to <code>get(true)</code> null de sakta hai.</p>
              <h2>toMap: key → value map, par duplicates se saavdhaan</h2>
              <ul>
                <li><code>toMap(keyFn, valueFn)</code>: do elements ki <b>same key</b> aayi to <code>IllegalStateException: Duplicate key ...</code>. Default mein Java nahi jaanta ki purani value rakhe ya nayi.</li>
                <li><code>toMap(keyFn, valueFn, mergeFn)</code>: duplicate pe <code>mergeFn(old, new)</code> chalta hai. Sum ke liye <code>Integer::sum</code>, pehli rakho <code>(a, b) -&gt; a</code>, aakhri rakho <code>(a, b) -&gt; b</code>.</li>
                <li><code>toMap(keyFn, valueFn, mergeFn, mapFactory)</code>: map type, jaise <code>LinkedHashMap::new</code> (insertion order) ya <code>TreeMap::new</code>.</li>
                <li>Value <b>null</b> hui to <code>NullPointerException</code> (andar <code>Map.merge</code> use hota hai jo null value allow nahi karta).</li>
              </ul>
              <h3>groupingBy vs toMap</h3>
              <table>
                <tr><th></th><th>groupingBy</th><th>toMap</th></tr>
                <tr><td>Ek key ke kai elements</td><td>Normal case: list ya downstream</td><td>Exception, jab tak merge function na do</td></tr>
                <tr><td>Value</td><td>Collector se (list, count, sum)</td><td>Function se, ek element → ek value</td></tr>
                <tr><td>Use case</td><td>\"city-wise orders\"</td><td>\"id → object\" lookup map (ids unique)</td></tr>
              </table>`
    },
    {
      type: "code",
      title: "partitioningBy (dono keys hamesha) aur toMap (merge, LinkedHashMap, identity)",
      code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    record Payment(String user, int amount) {}

    public static void main(String[] args) {
        Map<Boolean, List<Integer>> parts = Stream.of(120, 450, 80, 300, 999)
            .collect(Collectors.partitioningBy(a -> a >= 300));
        System.out.println("partition      : " + parts);

        Map<Boolean, Long> emptyParts = Stream.<Integer>empty()
            .collect(Collectors.partitioningBy(a -> a > 0, Collectors.counting()));
        System.out.println("khaali stream  : " + emptyParts);

        Map<Boolean, List<Integer>> grouped = Stream.of(1, 3, 5).collect(Collectors.groupingBy(x -> x % 2 == 0));
        System.out.println("groupingBy get(true) = " + grouped.get(true));

        List<Payment> payments = List.of(
            new Payment("riya", 100), new Payment("aman", 50), new Payment("riya", 200),
            new Payment("kabir", 75), new Payment("aman", 25));

        Map<String, Integer> total = payments.stream()
            .collect(Collectors.toMap(Payment::user, Payment::amount, Integer::sum));
        System.out.println("sum (sorted print): " + new TreeMap<>(total));

        Map<String, Integer> ordered = payments.stream()
            .collect(Collectors.toMap(Payment::user, Payment::amount, Integer::sum, LinkedHashMap::new));
        System.out.println("LinkedHashMap  : " + ordered);

        Map<String, Integer> latest = payments.stream()
            .collect(Collectors.toMap(Payment::user, Payment::amount, (oldV, newV) -> newV, LinkedHashMap::new));
        System.out.println("aakhri payment : " + latest);

        Map<String, Payment> biggest = payments.stream()
            .collect(Collectors.toMap(Payment::user, Function.identity(),
                     (a, b) -> a.amount() >= b.amount() ? a : b, TreeMap::new));
        System.out.println("sabse bada     : " + biggest);
    }
}`
    },
    {
      type: "code",
      expectException: true,
      title: "toMap bina merge function ke, duplicate key pe: IllegalStateException",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> menu = List.of("dosa", "idli", "dosa");
        Map<String, Integer> ok = menu.stream()
            .collect(Collectors.toMap(s -> s, String::length, (a, b) -> a));
        System.out.println("merge ke saath: " + new TreeMap<>(ok));

        Map<String, Integer> boom = menu.stream()
            .collect(Collectors.toMap(s -> s, String::length));   // 💥 "dosa" do baar
        System.out.println(boom);
    }
}`,
      note: "Message aisa aata hai: <i>Duplicate key dosa (attempted merging values 4 and 4)</i>. Production mein ye tab phatta hai jab test data mein ids unique the par real data mein nahi. Agar key unique hone ki guarantee nahi, to merge function hamesha do."
    },
    {
      type: "exercise",
      id: "ex-tomap-spend",
      title: "toMap practice: user-wise total spend, pehli baar dikhne ke order mein",
      level: "Medium",
      task: "<p>UPI payments ki list hai. <code>totalSpend(payments)</code>: user → uska total amount. Map ka order wahi ho jis order mein user <b>pehli baar</b> list mein aaya (harness <code>keySet()</code> order check karta hai). <code>Collectors.toMap</code> use karo.</p>",
      examples: "<code>[(riya,100), (aman,50), (riya,200)]</code> → <code>{riya=300, aman=50}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Payment(String user, int amount) {}

class Solution {
    Map<String, Integer> totalSpend(List<Payment> payments) {
        return payments.stream()
            .collect(Collectors.toMap(Payment::user, Payment::amount));
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        List<Payment> p1 = List.of(new Payment("riya", 100), new Payment("aman", 50), new Payment("riya", 200));
        Check.eq("keys order", List.of("riya", "aman"), () -> new ArrayList<>(s.totalSpend(p1).keySet()));
        Check.eq("values", List.of(300, 50), () -> new ArrayList<>(s.totalSpend(p1).values()));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> new ArrayList<>(s.totalSpend(List.of()).keySet()));
        List<Payment> p2 = List.of(new Payment("zoya", 10), new Payment("arjun", 20), new Payment("meera", 30),
            new Payment("arjun", 5), new Payment("zoya", 1));
        Check.eq("order alphabetical nahi, first-seen", List.of("zoya", "arjun", "meera"), () -> new ArrayList<>(s.totalSpend(p2).keySet()));
        Check.eq("values", List.of(11, 25, 30), () -> new ArrayList<>(s.totalSpend(p2).values()));
        Check.eq("refund (negative)", List.of(0), () -> new ArrayList<>(s.totalSpend(List.of(new Payment("x", 50), new Payment("x", -50))).values()));
        List<Payment> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(new Payment("u" + (99 - i % 100), 1));
        Check.eq("1 lakh payments: pehla user", "u99", () -> s.totalSpend(big).keySet().iterator().next());
        Check.eq("1 lakh payments: har user 1000", 1000, () -> s.totalSpend(big).get("u7"));
    }
}`,
      hints: [
        "Starter duplicate user pe <code>IllegalStateException</code> deta hai. Teesra argument (merge function) chahiye: <code>Integer::sum</code>.",
        "Order ke liye chautha argument: <code>LinkedHashMap::new</code>. HashMap order ki guarantee nahi deta.",
        "<code>Collectors.toMap(Payment::user, Payment::amount, Integer::sum, LinkedHashMap::new)</code>"
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Payment(String user, int amount) {}

class Solution {
    Map<String, Integer> totalSpend(List<Payment> payments) {
        return payments.stream()
            .collect(Collectors.toMap(Payment::user, Payment::amount, Integer::sum, LinkedHashMap::new));
    }
}`,
      explain: "<p>O(n) time, O(users) space. LinkedHashMap mein key ka order <b>pehli insertion</b> se tay hota hai; baad ke merge order nahi badalte. Same kaam <code>groupingBy(Payment::user, LinkedHashMap::new, summingInt(Payment::amount))</code> se bhi hota hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>joining, primitive streams, boxed, summaryStatistics</h2>
              <ul>
                <li><code>Collectors.joining()</code>, <code>joining(", ")</code>, <code>joining(", ", "[", "]")</code>: Strings ko jodo (delimiter, prefix, suffix). Andar StringBuilder, loop mein <code>+</code> se better. Elements String hone chahiye, warna pehle <code>map(String::valueOf)</code>.</li>
                <li><b>IntStream / LongStream / DoubleStream</b>: primitives ka stream, boxing nahi. Extra methods: <code>sum()</code>, <code>average()</code> (<code>OptionalDouble</code>), <code>max()</code> (<code>OptionalInt</code>), <code>summaryStatistics()</code>.</li>
                <li>Object stream → primitive: <code>mapToInt</code>, <code>mapToLong</code>, <code>mapToDouble</code>. Primitive → object: <code>boxed()</code> (int → Integer) ya <code>mapToObj(f)</code>.</li>
                <li><code>IntStream</code> pe <code>collect(Collectors.toList())</code> <b>compile nahi hota</b>: IntStream ka <code>collect</code> 3 arguments leta hai. Pehle <code>boxed()</code>.</li>
                <li><code>summaryStatistics()</code> ek pass mein count, sum, min, max, average deta hai. Khaali stream pe min = <code>Integer.MAX_VALUE</code> aur max = <code>Integer.MIN_VALUE</code> aate hain (exception nahi), to count check karo.</li>
              </ul>`
    },
    {
      type: "code",
      title: "joining, IntStream, boxed, mapToObj, chars(), summaryStatistics",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String id, int amount) {}

    public static void main(String[] args) {
        List<String> items = List.of("dosa", "chai", "vada");
        System.out.println(items.stream().collect(Collectors.joining()));
        System.out.println(items.stream().collect(Collectors.joining(", ")));
        System.out.println(items.stream().map(String::toUpperCase).collect(Collectors.joining(" | ", "[", "]")));
        System.out.println(Stream.<String>empty().collect(Collectors.joining(", ", "[", "]")));
        System.out.println(Stream.of(1, 2, 3).map(String::valueOf).collect(Collectors.joining("+")));

        int[] marks = {72, 95, 60, 88, 45};
        System.out.println("sum = " + IntStream.of(marks).sum());
        System.out.println("avg = " + Arrays.stream(marks).average().getAsDouble());
        System.out.println("max = " + Arrays.stream(marks).max().getAsInt());

        List<Integer> desc = Arrays.stream(marks).boxed().sorted(Comparator.reverseOrder()).toList();
        System.out.println("boxed desc = " + desc);
        List<String> tables = IntStream.rangeClosed(1, 3).mapToObj(i -> "Table-" + i).toList();
        System.out.println(tables);

        System.out.println("banana mein a: " + "banana".chars().filter(c -> c == 'a').count());
        System.out.println("chars: " + "upi".chars().mapToObj(c -> (char) c).toList());

        IntSummaryStatistics st = Arrays.stream(marks).summaryStatistics();
        System.out.println(st.getCount() + " " + st.getSum() + " " + st.getMin() + " " + st.getMax() + " " + st.getAverage());
        System.out.println(st);

        List<Order> orders = List.of(new Order("A", 250), new Order("B", 600));
        IntSummaryStatistics os = orders.stream().mapToInt(Order::amount).summaryStatistics();
        System.out.println("orders: max " + os.getMax() + ", avg " + os.getAverage());
        System.out.println("collector: " + orders.stream().collect(Collectors.summarizingInt(Order::amount)).getSum());

        IntSummaryStatistics empty = IntStream.empty().summaryStatistics();
        System.out.println("khaali: min=" + empty.getMin() + " max=" + empty.getMax() + " avg=" + empty.getAverage());
        System.out.println("khaali average(): " + IntStream.empty().average());
    }
}`
    },
    {
      type: "code",
      expectError: true,
      title: "IntStream pe seedha Collectors.toList(): compile error",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> squares = IntStream.rangeClosed(1, 5)
            .map(x -> x * x)
            .collect(Collectors.toList());     // ❌ IntStream.collect ko 3 arguments chahiye
        System.out.println(squares);
    }
}`,
      note: "Fix: <code>.boxed().collect(Collectors.toList())</code> ya <code>.boxed().toList()</code>. <code>int[]</code> chahiye to <code>.toArray()</code> seedha chalta hai."
    },
    {
      type: "exercise",
      id: "ex-partition-marks",
      title: "partitioningBy + boxed: pass aur fail students ke marks",
      level: "Easy",
      task: "<p><code>split(marks, cutoff)</code>: <code>int[]</code> marks ko do groups mein baanto: <code>true</code> → jo cutoff ke barabar ya upar hain, <code>false</code> → baaki. Dono lists <b>bade se chhote</b> sorted. Khaali group ho to bhi uski key honi chahiye (empty list, null nahi).</p>",
      examples: "<code>split([72, 30, 95, 40], 40)</code> → <code>{false=[30], true=[95, 72, 40]}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

class Solution {
    Map<Boolean, List<Integer>> split(int[] marks, int cutoff) {
        return new HashMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        int[] m = {72, 30, 95, 40};
        Check.eq("pass", List.of(95, 72, 40), () -> s.split(m, 40).get(true));
        Check.eq("fail", List.of(30), () -> s.split(m, 40).get(false));
        Check.hiddenFromHere();
        Check.eq("sab pass: fail list khaali (null nahi)", List.of(), () -> s.split(new int[]{50, 60}, 33).get(false));
        Check.eq("empty array: true key", List.of(), () -> s.split(new int[]{}, 33).get(true));
        Check.eq("duplicates", List.of(50, 50), () -> s.split(new int[]{50, 10, 50}, 50).get(true));
        int[] big = new int[100000];
        for (int i = 0; i < big.length; i++) big[i] = i % 101;
        Check.eq("1 lakh marks: pass count", 58410, () -> s.split(big, 42).get(true).size());
        Check.eq("1 lakh marks: fail ka sabse bada", 41, () -> s.split(big, 42).get(false).get(0));
    }
}`,
      hints: [
        "<code>Arrays.stream(marks).boxed()</code> se <code>Stream&lt;Integer&gt;</code> banao (partitioningBy object stream pe chalta hai).",
        "Sort pehle kar lo: <code>.sorted(Comparator.reverseOrder())</code>, phir <code>collect(Collectors.partitioningBy(x -&gt; x &gt;= cutoff))</code>. Har partition mein relative order bana rehta hai."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

class Solution {
    Map<Boolean, List<Integer>> split(int[] marks, int cutoff) {
        return Arrays.stream(marks)
            .boxed()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.partitioningBy(x -> x >= cutoff));
    }
}`,
      explain: "<p>O(n log n). Sequential stream mein <code>partitioningBy</code> (andar <code>toList</code>) encounter order maintain karta hai, isliye pehle sort karna kaafi hai. <code>groupingBy(x -&gt; x &gt;= cutoff)</code> bhi lagbhag same deta, par khaali group ki key nahi banti, aur <code>get(false)</code> null aata.</p>"
    },
    {
      type: "pick",
      id: "pick-collector",
      q: "Kaunse pairs <b>sahi</b> hain (problem → collector)?",
      options: [
        { text: "\"Har city mein kitne orders\" → <code>groupingBy(Order::city, counting())</code>", correct: true, why: "Group + count. Result <code>Map&lt;String, Long&gt;</code>." },
        { text: "\"Order id → Order lookup map\" (ids unique) → <code>toMap(Order::id, Function.identity())</code>", correct: true, why: "Ek key ek value. Ids unique hain to merge function zaroori nahi (phir bhi duplicates ka risk ho to do)." },
        { text: "\"Har department ke employees ke sirf naam\" → <code>groupingBy(Employee::dept)</code>", correct: false, why: "Ye poore Employee objects ki list dega. Naam ke liye <code>groupingBy(Employee::dept, mapping(Employee::name, toList()))</code>." },
        { text: "\"Veg aur non-veg items alag\" → <code>partitioningBy(Item::isVeg)</code>", correct: true, why: "Do hi group (true/false), dono keys guaranteed." },
        { text: "\"Saare naam comma se jodo\" → <code>reduce(\"\", (a, b) -&gt; a + \", \" + b)</code>", correct: false, why: "Shuru mein extra \", \" aata hai aur har step naya String banata hai. <code>Collectors.joining(\", \")</code> sahi tool hai." },
        { text: "\"User-wise total spend\" → <code>toMap(Payment::user, Payment::amount)</code>", correct: false, why: "Ek user ke kai payments → duplicate key → IllegalStateException. Merge function <code>Integer::sum</code> chahiye." }
      ]
    },
    {
      type: "think",
      id: "think-groupingby-tomap",
      q: "Interview question: <b>\"groupingBy aur toMap mein kya farak hai? toMap mein duplicate key aaye to kya hota hai, aur result map ka order kaise control karoge?\"</b>",
      rubric: [
        { point: "groupingBy ek key ke <b>kai elements</b> ko collect karta hai (list / downstream collector)", keys: ["list", "downstream", "group", "multiple", "kai element", "counting"], weight: 2 },
        { point: "toMap ek element → ek key-value; duplicate key pe <b>IllegalStateException</b>", keys: ["illegalstate", "exception", "duplicate", "phat", "throw"], weight: 2 },
        { point: "<b>Merge function</b> (teesra argument) se duplicate resolve: sum, first, last", keys: ["merge", "integer::sum", "binaryoperator", "teesra", "third argument", "(a, b)"], weight: 2 },
        { point: "Map type/order: default HashMap (no guarantee); <b>mapFactory</b> jaise LinkedHashMap::new / TreeMap::new", keys: ["linkedhashmap", "treemap", "supplier", "mapfactory", "map factory", "hashmap"], weight: 2 },
        { point: "toMap null value pe NPE", keys: ["null", "npe", "nullpointer"], weight: 1 }
      ],
      answer: `<p><b>groupingBy</b> ek classifier se key nikalta hai aur same key wale <b>saare</b> elements ko ek group mein daalta hai. Default har group ek <code>List</code> hai, aur downstream collector (<code>counting</code>, <code>summingInt</code>, <code>mapping</code>) se group ka result badal sakte hain. Duplicate key yahan normal case hai.</p>
               <p><b>toMap</b> har element se ek key aur ek value banata hai. Do elements ki same key aayi to <code>IllegalStateException: Duplicate key</code>, kyunki Java ko nahi pata purani value rakhe ya nayi. Fix: teesra argument <b>merge function</b>: <code>Integer::sum</code> (jodo), <code>(a, b) -&gt; a</code> (pehli rakho), <code>(a, b) -&gt; b</code> (aakhri). Value null ho to toMap NPE deta hai.</p>
               <p><b>Order:</b> dono ke simple versions ka map type guaranteed nahi (abhi HashMap). Insertion order ke liye <code>LinkedHashMap::new</code>, sorted keys ke liye <code>TreeMap::new</code> pass karo: groupingBy mein 3-arg form (classifier, mapFactory, downstream), toMap mein 4-arg form (key, value, merge, mapFactory).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Grouping wala sawaal aaye to pehle SQL mein socho: <i>GROUP BY kis column pe? har group ka kya chahiye (COUNT, SUM, AVG, list of names)? ORDER chahiye?</i> Phir seedha map karo: GROUP BY → <code>groupingBy</code>, COUNT → <code>counting()</code>, SUM → <code>summingInt</code>, AVG → <code>averagingInt</code>, SELECT name → <code>mapping</code>, ORDER BY key → <code>TreeMap::new</code>. Bolte hue likhoge to interviewer ko approach saaf dikhegi."
    }
  ],
  references: [
    { title: "Collectors (Java 17 API): groupingBy, partitioningBy, toMap, joining", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html", type: "docs" },
    { title: "Stream (Java 17 API): flatMap, reduce", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html", type: "docs" },
    { title: "IntStream (Java 17 API): boxed, summaryStatistics", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/IntStream.html", type: "docs" },
    { title: "dev.java: The Stream API", by: "Oracle", url: "https://dev.java/learn/api/streams/", type: "docs" }
  ]
});
