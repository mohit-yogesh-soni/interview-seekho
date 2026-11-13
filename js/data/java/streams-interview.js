// Streams interview questions
registerLesson("java", "streams-interview", {
  why: "Java interviews (khaas kar service companies aur fintech) mein \"ye stream se likho\" round lagbhag fix hai: character frequency, second highest salary, department-wise grouping, duplicates. Ye sab 1-3 line ke pipelines hain, par edge cases (duplicates, khaali input, tie) pe log fisalte hain. Yahan har sawaal khud likho aur hidden tests se check karo.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Kaise approach karein</h2>
              <p>Har stream sawaal ko teen sawaalon mein todo:</p>
              <ol>
                <li><b>Source kya hai?</b> List of objects → <code>list.stream()</code>. String ke characters → <code>s.chars()</code> (IntStream, to <code>mapToObj(c -&gt; (char) c)</code>). Map → <code>map.entrySet().stream()</code>.</li>
                <li><b>Shape kya chahiye?</b> Ek number (count, max) → terminal op. Group-wise kuch → <code>groupingBy</code> + downstream. Order wali list → <code>sorted</code> + <code>limit</code>.</li>
                <li><b>Edge cases:</b> duplicates (distinct?), tie (thenComparing), khaali input (Optional), case (lowercase?).</li>
              </ol>
              <p>Is lesson mein ek hi record baar baar use hoga, har exercise ki <code>Solution.java</code> mein upar diya hai:</p>
              <pre class="code-static">record Employee(String name, String dept, double salary) {}</pre>`
    },
    {
      type: "code",
      title: "Warm-up: 6 one-liners jo baaki sawaalon mein kaam aayenge",
      code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    record Employee(String name, String dept, double salary) {}

    public static void main(String[] args) {
        List<Employee> emps = List.of(
            new Employee("Riya", "Eng", 180000), new Employee("Aman", "Eng", 150000),
            new Employee("Kabir", "Sales", 90000), new Employee("Meera", "HR", 85000),
            new Employee("Zoya", "Sales", 120000));

        // 1. Total salary bill
        System.out.println(emps.stream().mapToDouble(Employee::salary).sum());
        // 2. Highest paid
        System.out.println(emps.stream().max(Comparator.comparingDouble(Employee::salary)).map(Employee::name).orElse("-"));
        // 3. Department-wise average
        Map<String, Double> avgByDept = emps.stream()
            .collect(Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.averagingDouble(Employee::salary)));
        System.out.println(avgByDept);
        // 4. Names comma se
        System.out.println(emps.stream().map(Employee::name).sorted().collect(Collectors.joining(", ")));
        // 5. 1 lakh 20 hazaar se upar kitne
        System.out.println(emps.stream().filter(e -> e.salary() > 120000).count());
        // 6. Name -> salary lookup
        Map<String, Double> lookup = emps.stream().collect(Collectors.toMap(Employee::name, Employee::salary));
        System.out.println(lookup.get("Zoya"));
    }
}`
    },
    {
      type: "exercise",
      id: "ex-char-freq",
      title: "Q1. String mein har character ki frequency",
      level: "Easy",
      task: "<p><code>charFrequency(s)</code>: string ke <b>letters</b> ki ginti ka map do. Case ignore karo (keys lowercase), letters ke alawa sab (space, digit, symbol) ignore. Values <code>Long</code> hon (jo <code>counting()</code> deta hai). Map ka order matter nahi karta.</p>",
      examples: "<code>\"Java 17\"</code> → <code>{a=2, j=1, v=1}</code><br><code>\"Aa b\"</code> → <code>{a=2, b=1}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    Map<Character, Long> charFrequency(String s) {
        return new HashMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("Java 17", Map.of('a', 2L, 'j', 1L, 'v', 1L), () -> s.charFrequency("Java 17"));
        Check.eq("Aa b", Map.of('a', 2L, 'b', 1L), () -> s.charFrequency("Aa b"));
        Check.hiddenFromHere();
        Check.eq("empty", Map.of(), () -> s.charFrequency(""));
        Check.eq("sirf digits/symbols", Map.of(), () -> s.charFrequency("123 !@#"));
        Check.eq("banana", Map.of('b', 1L, 'a', 3L, 'n', 2L), () -> s.charFrequency("banana"));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) sb.append((char) ('a' + i % 26));
        String big = sb.toString();
        Check.eq("1 lakh chars: 'a' count", 3847L, () -> s.charFrequency(big).get('a'));
        Check.eq("1 lakh chars: 26 keys", 26, () -> s.charFrequency(big).size());
    }
}`,
      hints: [
        "<code>s.chars()</code> IntStream deta hai. <code>filter(Character::isLetter)</code> int pe bhi chalta hai.",
        "<code>mapToObj(c -&gt; Character.toLowerCase((char) c))</code> se <code>Stream&lt;Character&gt;</code>.",
        "<code>collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))</code>"
      ],
      solution: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    Map<Character, Long> charFrequency(String s) {
        return s.chars()
            .filter(Character::isLetter)
            .mapToObj(c -> Character.toLowerCase((char) c))
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    }
}`,
      explain: "<p>O(n) time, O(k) space (k = alag letters). <code>chars()</code> ints deta hai, isliye <code>(char)</code> cast zaroori: bina cast <code>mapToObj(c -&gt; c)</code> se <code>Integer</code> keys (97, 98...) ban jaati. Order chahiye (pehli baar dikhne ka) to <code>groupingBy(Function.identity(), LinkedHashMap::new, counting())</code>.</p>"
    },
    {
      type: "exercise",
      id: "ex-second-highest",
      title: "Q2. Second highest salary (duplicates ke saath)",
      level: "Easy",
      task: "<p><code>secondHighestSalary(emps)</code>: doosri sabse badi <b>alag</b> salary. Agar do log top salary pe hain, to wo ek hi maani jaayegi. Doosri alag salary na ho to <code>Optional.empty()</code>.</p>",
      examples: "Salaries <code>[100, 90, 100]</code> → <code>Optional[90.0]</code> (100 do baar hai, phir bhi second 90)<br><code>[50, 50]</code> → <code>Optional.empty</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Optional<Double> secondHighestSalary(List<Employee> emps) {
        return emps.stream()
            .map(Employee::salary)
            .sorted(Comparator.reverseOrder())
            .skip(1)
            .findFirst();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<Employee> of(double... salaries) {
        List<Employee> list = new ArrayList<>();
        for (int i = 0; i < salaries.length; i++) list.add(new Employee("e" + i, "Eng", salaries[i]));
        return list;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[100, 80, 90]", Optional.of(90.0), () -> s.secondHighestSalary(of(100, 80, 90)));
        Check.eq("[100, 90, 100] duplicate top", Optional.of(90.0), () -> s.secondHighestSalary(of(100, 90, 100)));
        Check.hiddenFromHere();
        Check.eq("[50, 50] sab same", Optional.empty(), () -> s.secondHighestSalary(of(50, 50)));
        Check.eq("ek employee", Optional.empty(), () -> s.secondHighestSalary(of(70)));
        Check.eq("koi nahi", Optional.empty(), () -> s.secondHighestSalary(of()));
        Check.eq("[300, 300, 200, 200, 100]", Optional.of(200.0), () -> s.secondHighestSalary(of(300, 300, 200, 200, 100)));
        double[] big = new double[100000];
        for (int i = 0; i < big.length; i++) big[i] = i % 50000;
        List<Employee> bigList = of(big);
        Check.eq("1 lakh employees", Optional.of(49998.0), () -> s.secondHighestSalary(bigList));
    }
}`,
      hints: [
        "Starter duplicate top salary pe fail hota hai: [100, 100, 90] mein skip(1) ke baad 100 milta hai.",
        "<code>sorted</code> se pehle <code>distinct()</code> lagao."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Optional<Double> secondHighestSalary(List<Employee> emps) {
        return emps.stream()
            .map(Employee::salary)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .skip(1)
            .findFirst();
    }
}`,
      explain: "<p>O(n log n). Follow-up \"Nth highest\" → <code>skip(n - 1)</code>. Follow-up \"O(n) mein karo\" → ek loop mein do variables <code>first</code>, <code>second</code> rakho. Follow-up \"employee ka naam bhi chahiye\" → pehle second salary nikalo, phir <code>filter(e -&gt; e.salary() == second)</code>. Note: <code>double</code> pe <code>distinct</code> exact equality use karta hai; paise ke liye asli code mein <code>BigDecimal</code> ya paise (long) rakho.</p>"
    },
    {
      type: "exercise",
      id: "ex-group-dept",
      title: "Q3. Department-wise employees ke naam",
      level: "Easy",
      task: "<p><code>namesByDept(emps)</code>: department → us department ke employees ke <b>naam</b> (alphabetical). Departments bhi alphabetical order mein hon (harness <code>keySet()</code> order check karta hai).</p>",
      examples: "<code>[(Riya,Eng), (Kabir,Sales), (Aman,Eng)]</code> → <code>{Eng=[Aman, Riya], Sales=[Kabir]}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Map<String, List<String>> namesByDept(List<Employee> emps) {
        return new HashMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        List<Employee> e1 = List.of(new Employee("Riya", "Eng", 100), new Employee("Kabir", "Sales", 80), new Employee("Aman", "Eng", 90));
        Check.eq("map", Map.of("Eng", List.of("Aman", "Riya"), "Sales", List.of("Kabir")), () -> s.namesByDept(e1));
        Check.eq("dept order", List.of("Eng", "Sales"), () -> new ArrayList<>(s.namesByDept(e1).keySet()));
        Check.hiddenFromHere();
        Check.eq("empty", Map.of(), () -> s.namesByDept(List.of()));
        List<Employee> e2 = List.of(new Employee("Zoya", "Sales", 1), new Employee("Meera", "HR", 1),
            new Employee("Dev", "Sales", 1), new Employee("Arjun", "Eng", 1));
        Check.eq("3 depts ka order", List.of("Eng", "HR", "Sales"), () -> new ArrayList<>(s.namesByDept(e2).keySet()));
        Check.eq("Sales ke naam sorted", List.of("Dev", "Zoya"), () -> s.namesByDept(e2).get("Sales"));
        Check.eq("same naam do baar", List.of("Amit", "Amit"), () -> s.namesByDept(List.of(new Employee("Amit", "X", 1), new Employee("Amit", "X", 2))).get("X"));
    }
}`,
      hints: [
        "3-arg groupingBy: <code>groupingBy(Employee::dept, TreeMap::new, downstream)</code>.",
        "Downstream: <code>Collectors.mapping(Employee::name, Collectors.toList())</code>. Naam sorted chahiye to stream ko pehle naam se sort kar lo.",
        "<code>emps.stream().sorted(Comparator.comparing(Employee::name)).collect(groupingBy(Employee::dept, TreeMap::new, mapping(Employee::name, toList())))</code>"
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Map<String, List<String>> namesByDept(List<Employee> emps) {
        return emps.stream()
            .sorted(Comparator.comparing(Employee::name))
            .collect(Collectors.groupingBy(Employee::dept, TreeMap::new,
                     Collectors.mapping(Employee::name, Collectors.toList())));
    }
}`,
      explain: "<p>O(n log n). Pehle sort karne se har group ki list apne aap sorted aati hai, kyunki sequential groupingBy encounter order rakhta hai. Alternative: <code>mapping(Employee::name, collectingAndThen(toList(), l -&gt; { Collections.sort(l); return l; }))</code>. Interview mein follow-up aata hai: \"sirf count chahiye\" → <code>counting()</code>, \"highest paid per dept\" → <code>maxBy</code>.</p>"
    },
    {
      type: "exercise",
      id: "ex-find-duplicates",
      title: "Q4. List mein duplicates dhoondho",
      level: "Easy",
      task: "<p><code>findDuplicates(nums)</code>: jo numbers ek se zyada baar aaye hain, wo <b>ek-ek baar</b>, <b>ascending</b> order mein.</p>",
      examples: "<code>[4, 1, 4, 2, 1, 4]</code> → <code>[1, 4]</code><br><code>[1, 2, 3]</code> → <code>[]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    List<Integer> findDuplicates(List<Integer> nums) {
        return List.of();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[4,1,4,2,1,4]", List.of(1, 4), () -> s.findDuplicates(List.of(4, 1, 4, 2, 1, 4)));
        Check.eq("[1,2,3]", List.of(), () -> s.findDuplicates(List.of(1, 2, 3)));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> s.findDuplicates(List.of()));
        Check.eq("negative", List.of(-5, 0), () -> s.findDuplicates(List.of(0, -5, 3, -5, 0)));
        Check.eq("sab same", List.of(7), () -> s.findDuplicates(List.of(7, 7, 7, 7)));
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < 50000; i++) big.add(i);
        for (int i = 49999; i >= 0; i -= 2) big.add(i);
        Check.eq("75000 numbers: duplicates count", 25000, () -> s.findDuplicates(big).size());
        Check.eq("75000 numbers: pehla duplicate", 1, () -> s.findDuplicates(big).get(0));
    }
}`,
      hints: [
        "Pehle frequency map: <code>groupingBy(Function.identity(), counting())</code>.",
        "Phir <code>entrySet().stream().filter(e -&gt; e.getValue() &gt; 1).map(Map.Entry::getKey).sorted().toList()</code>.",
        "<code>Collections.frequency(nums, x)</code> har element pe O(n²) hai: bade test pe slow."
      ],
      solution: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    List<Integer> findDuplicates(List<Integer> nums) {
        return nums.stream()
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
            .entrySet().stream()
            .filter(e -> e.getValue() > 1)
            .map(Map.Entry::getKey)
            .sorted()
            .toList();
    }
}`,
      explain: "<p>O(n) grouping + O(d log d) sort. Ek popular short trick: <code>Set&lt;Integer&gt; seen = new HashSet&lt;&gt;(); nums.stream().filter(x -&gt; !seen.add(x))...</code>. <code>add</code> false deta hai jab element pehle se ho. Chalta hai, par lambda bahar ke mutable set ko badal raha hai (side effect): parallel stream pe galat answer aur HashSet thread-safe nahi. Interview mein ye trick bolo to ye caveat bhi bolo.</p>"
    },
    {
      type: "exercise",
      id: "ex-first-unique",
      title: "Q5. Pehla non-repeated character",
      level: "Easy",
      task: "<p><code>firstUnique(s)</code>: string ka <b>pehla</b> character jo poori string mein exactly ek baar aata hai. Case-sensitive ('A' aur 'a' alag). Koi na ho to <code>Optional.empty()</code>. Inspired by <a href=\"https://leetcode.com/problems/first-unique-character-in-a-string/\" target=\"_blank\">LeetCode 387</a> (wahan index return hota hai).</p>",
      examples: "<code>\"swiss\"</code> → <code>Optional[w]</code><br><code>\"aabb\"</code> → <code>Optional.empty</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    Optional<Character> firstUnique(String s) {
        return Optional.empty();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("swiss", Optional.of('w'), () -> s.firstUnique("swiss"));
        Check.eq("aabb", Optional.empty(), () -> s.firstUnique("aabb"));
        Check.hiddenFromHere();
        Check.eq("empty", Optional.empty(), () -> s.firstUnique(""));
        Check.eq("single", Optional.of('z'), () -> s.firstUnique("z"));
        Check.eq("case-sensitive: Aa", Optional.of('A'), () -> s.firstUnique("Aa"));
        Check.eq("aakhri wala unique", Optional.of('c'), () -> s.firstUnique("aabbc"));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) sb.append((char) ('a' + i % 25));
        sb.append('z');
        String big = sb.toString();
        Check.eq("1 lakh chars, end mein unique", Optional.of('z'), () -> s.firstUnique(big));
    }
}`,
      hints: [
        "Order yaad rakhna hai, to frequency <b>LinkedHashMap</b> mein: <code>groupingBy(Function.identity(), LinkedHashMap::new, counting())</code>.",
        "Phir <code>entrySet().stream().filter(e -&gt; e.getValue() == 1).map(Map.Entry::getKey).findFirst()</code>."
      ],
      solution: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    Optional<Character> firstUnique(String s) {
        return s.chars()
            .mapToObj(c -> (char) c)
            .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
            .entrySet().stream()
            .filter(e -> e.getValue() == 1)
            .map(Map.Entry::getKey)
            .findFirst();
    }
}`,
      explain: "<p>O(n) time, O(k) space. HashMap hota to \"pehla\" ka matlab kho jaata. <code>e.getValue() == 1</code> theek hai kyunki <code>Long</code> aur int literal compare hone pe unboxing hoti hai (dono taraf object hote, jaise <code>Long == Long</code>, tab reference compare hota).</p>"
    },
    {
      type: "exercise",
      id: "ex-sort-by-value",
      title: "Q6. Map ko value se sort karo (leaderboard)",
      level: "Medium",
      task: "<p>Player → score ka map hai. <code>leaderboard(scores)</code>: ek <code>LinkedHashMap</code> do jisme entries <b>score ke ulte order</b> (bada pehle) mein hon. Score barabar ho to naam alphabetical. Harness keys aur values ka order check karta hai.</p>",
      examples: "<code>{riya=50, aman=80, kabir=50}</code> → <code>{aman=80, kabir=50, riya=50}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

class Solution {
    LinkedHashMap<String, Integer> leaderboard(Map<String, Integer> scores) {
        return new LinkedHashMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Map<String, Integer> m1 = Map.of("riya", 50, "aman", 80, "kabir", 50);
        Check.eq("keys", List.of("aman", "kabir", "riya"), () -> new ArrayList<>(s.leaderboard(m1).keySet()));
        Check.eq("values", List.of(80, 50, 50), () -> new ArrayList<>(s.leaderboard(m1).values()));
        Check.hiddenFromHere();
        Check.eq("empty", List.of(), () -> new ArrayList<>(s.leaderboard(Map.of()).keySet()));
        Check.eq("negative scores", List.of("b", "a"), () -> new ArrayList<>(s.leaderboard(Map.of("a", -10, "b", -2)).keySet()));
        Check.eq("sab tie", List.of("x", "y", "z"), () -> new ArrayList<>(s.leaderboard(Map.of("z", 1, "x", 1, "y", 1)).keySet()));
        Map<String, Integer> big = new HashMap<>();
        for (int i = 0; i < 100000; i++) big.put("p" + i, i % 1000);
        Check.eq("1 lakh players: topper", "p10999", () -> s.leaderboard(big).keySet().iterator().next());
    }
}`,
      hints: [
        "<code>scores.entrySet().stream().sorted(comparator)</code>. Comparator: <code>Map.Entry.&lt;String, Integer&gt;comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey())</code>.",
        "Collect: <code>toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -&gt; a, LinkedHashMap::new)</code>. LinkedHashMap ke bina sort ka order kho jaayega."
      ],
      solution: `import java.util.*;
import java.util.stream.*;

class Solution {
    LinkedHashMap<String, Integer> leaderboard(Map<String, Integer> scores) {
        return scores.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
                    .thenComparing(Map.Entry.comparingByKey()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                     (a, b) -> a, LinkedHashMap::new));
    }
}`,
      explain: "<p>O(n log n). Do traps: (1) <code>comparingByValue().reversed()</code> pe type inference fail hota hai, isliye <code>Map.Entry.&lt;String, Integer&gt;comparingByValue()</code> likhna padta hai. (2) Normal <code>toMap</code> HashMap deta hai jo sorted order bhool jaata hai; LinkedHashMap supplier zaroori hai, aur 4-arg form ke liye merge function bhi dena padta hai (keys unique hain, to <code>(a, b) -&gt; a</code> kabhi chalega nahi). Topper wale test mein score 999 wale sabse pehle aate hain, aur unme alphabetically \"p10999\" sabse chhota hai.</p>"
    },
    {
      type: "exercise",
      id: "ex-top-words",
      title: "Q7. Top N frequent words",
      level: "Medium",
      task: "<p><code>topWords(text, n)</code>: text ko lowercase karo, letters ke alawa sab ko separator maano, aur sabse zyada aane wale <b>n</b> words do. Frequency barabar ho to alphabetical. n words se kam hon to jitne hain utne. Inspired by <a href=\"https://leetcode.com/problems/top-k-frequent-words/\" target=\"_blank\">LeetCode 692</a>.</p>",
      examples: "<code>topWords(\"Chai, chai aur samosa. Samosa chai!\", 2)</code> → <code>[chai, samosa]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    List<String> topWords(String text, int n) {
        return List.of();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("chai samosa", List.of("chai", "samosa"), () -> s.topWords("Chai, chai aur samosa. Samosa chai!", 2));
        Check.eq("tie alphabetical", List.of("a", "b"), () -> s.topWords("b a c b a", 2));
        Check.hiddenFromHere();
        Check.eq("empty text", List.of(), () -> s.topWords("", 3));
        Check.eq("sirf symbols", List.of(), () -> s.topWords("... !!! 123", 2));
        Check.eq("n zyada hai", List.of("go", "java"), () -> s.topWords("java go go", 5));
        Check.eq("shuru mein separator", List.of("upi"), () -> s.topWords("  ,upi", 1));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50000; i++) sb.append("w").append((char) ('a' + i % 7)).append(i % 3 == 0 ? " top " : " ");
        String big = sb.toString();
        Check.eq("bada text", List.of("top", "wa", "wb"), () -> s.topWords(big, 3));
    }
}`,
      hints: [
        "<code>Arrays.stream(text.toLowerCase().split(\"[^a-z]+\"))</code>. Shuru mein separator ho to pehla element <code>\"\"</code> aata hai: <code>filter(w -&gt; !w.isEmpty())</code>.",
        "Frequency map banao, phir entries ko sort karo: value desc, phir key asc. <code>limit(n)</code>, <code>map(Map.Entry::getKey)</code>."
      ],
      solution: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class Solution {
    List<String> topWords(String text, int n) {
        Map<String, Long> freq = Arrays.stream(text.toLowerCase().split("[^a-z]+"))
            .filter(w -> !w.isEmpty())
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        return freq.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                    .thenComparing(Map.Entry.comparingByKey()))
            .limit(n)
            .map(Map.Entry::getKey)
            .toList();
    }
}`,
      explain: "<p>W words, U unique: O(W + U log U). Follow-up \"U bahut bada hai, n chhota\" → size n ka min-heap (<code>PriorityQueue</code>): O(U log n). <code>split</code> ka ek trap: leading separator se pehla token khaali string hota hai (trailing khaali tokens Java khud hata deta hai).</p>"
    },
    {
      type: "exercise",
      id: "ex-longest-per-dept",
      title: "Q8. Har department mein sabse lamba naam",
      level: "Medium",
      task: "<p><code>longestNamePerDept(emps)</code>: department → us department ka sabse lamba naam. Length barabar ho to alphabetical mein pehla. Departments alphabetical order mein (TreeMap).</p>",
      examples: "<code>[(Riya,Eng), (Abhishek,Eng), (Kabir,Sales), (Zoya,Sales)]</code> → <code>{Eng=Abhishek, Sales=Kabir}</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Map<String, String> longestNamePerDept(List<Employee> emps) {
        return new TreeMap<>();
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Employee e(String name, String dept) { return new Employee(name, dept, 1); }

    public static void main(String[] args) {
        Solution s = new Solution();
        List<Employee> e1 = List.of(e("Riya", "Eng"), e("Abhishek", "Eng"), e("Kabir", "Sales"), e("Zoya", "Sales"));
        Check.eq("example", Map.of("Eng", "Abhishek", "Sales", "Kabir"), () -> s.longestNamePerDept(e1));
        Check.eq("dept order", List.of("Eng", "Sales"), () -> new ArrayList<>(s.longestNamePerDept(e1).keySet()));
        Check.hiddenFromHere();
        Check.eq("empty", Map.of(), () -> s.longestNamePerDept(List.of()));
        Check.eq("tie: alphabetical pehla", Map.of("HR", "Arya"), () -> s.longestNamePerDept(List.of(e("Neha", "HR"), e("Arya", "HR"), e("Ojas", "HR"))));
        Check.eq("ek dept ek banda", Map.of("Ops", "Dev"), () -> s.longestNamePerDept(List.of(e("Dev", "Ops"))));
        List<Employee> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(e("n" + i, "D" + (i % 10)));
        Check.eq("1 lakh: D3", "n10003", () -> s.longestNamePerDept(big).get("D3"));
    }
}`,
      hints: [
        "<code>toMap(Employee::dept, Employee::name, merge, TreeMap::new)</code>. Merge function do naamo mein se jeetne wala chune.",
        "Merge: <code>(a, b) -&gt; a.length() != b.length() ? (a.length() &gt; b.length() ? a : b) : (a.compareTo(b) &lt;= 0 ? a : b)</code>"
      ],
      solution: `import java.util.*;
import java.util.stream.*;

record Employee(String name, String dept, double salary) {}

class Solution {
    Map<String, String> longestNamePerDept(List<Employee> emps) {
        return emps.stream()
            .collect(Collectors.toMap(Employee::dept, Employee::name,
                     (a, b) -> {
                         if (a.length() != b.length()) return a.length() > b.length() ? a : b;
                         return a.compareTo(b) <= 0 ? a : b;
                     },
                     TreeMap::new));
    }
}`,
      explain: "<p>O(n log d) (d = departments). Merge function yahan \"reduce per key\" ka kaam kar raha hai. groupingBy version: <code>groupingBy(Employee::dept, TreeMap::new, collectingAndThen(mapping(Employee::name, minBy(Comparator.comparingInt(String::length).reversed().thenComparing(Comparator.naturalOrder()))), Optional::get))</code>: sahi hai par padhna mushkil. Bade test mein sabse lambe naam 6 chars ke hain (n10000 se n99999), D3 mein unme alphabetically pehla \"n10003\" hai.</p>"
    },
    {
      type: "text",
      html: `
              <h2>Parallel streams: <code>.parallelStream()</code> lagao aur fast? Zyaadatar nahi.</h2>
              <p><code>parallelStream()</code> (ya <code>.parallel()</code>) data ko chunks mein todta hai aur <b>ForkJoinPool.commonPool()</b> ke threads pe chalata hai. Ye pool poore JVM mein <b>shared</b> hai, aur default mein iske threads lagbhag CPU cores - 1 hote hain (calling thread bhi kaam karta hai). Isliye ye free lunch nahi hai.</p>
              <table>
                <tr><th>Kab NAHI</th><th>Kyun</th></tr>
                <tr><td>Chhota data (hazaar elements, halka kaam)</td><td>Split, threads ko kaam dena aur results merge karna khud kaam se mehenga</td></tr>
                <tr><td>Shared mutable state (bahar ki ArrayList/HashMap mein add, counter++)</td><td>Race condition: elements gum, ya <code>ArrayIndexOutOfBoundsException</code>. <code>collect</code>/<code>reduce</code> use karo</td></tr>
                <tr><td>Order-sensitive kaam (<code>findFirst</code>, <code>limit</code>, <code>forEachOrdered</code>, sorted output)</td><td>Order bachane ke liye threads ko buffer/wait karna padta hai, faayda khatam. <code>forEach</code> ka order random</td></tr>
                <tr><td>Blocking I/O (DB call, HTTP) har element pe</td><td>Common pool ke gine-chune threads block ho jaate hain, aur JVM ke baaki parallel streams / <code>CompletableFuture.supplyAsync</code> (default pool) bhi atak jaate hain</td></tr>
                <tr><td>Kharab split hone wale source: <code>LinkedList</code>, <code>Stream.iterate</code>, I/O lines</td><td>Barabar chunks mein todna mehenga/mushkil</td></tr>
              </table>
              <p><b>Kab theek:</b> bada data (lakhs+), CPU-heavy, independent kaam per element, achha split hone wala source (<code>ArrayList</code>, array, <code>IntStream.range</code>), associative reduction. Aur hamesha <b>measure</b> karo (JMH), andaze pe nahi.</p>
              <pre class="code-static">// ❌ Shared mutable state: asli multi-core machine pe size 10000 se kam aa sakta hai ya exception
List&lt;Integer&gt; out = new ArrayList&lt;&gt;();
IntStream.range(0, 10_000).parallel().forEach(out::add);

// ✅ Stream ko khud collect karne do (har thread apna partial container, phir merge)
List&lt;Integer&gt; safe = IntStream.range(0, 10_000).parallel().boxed().toList();</pre>`
    },
    {
      type: "code",
      title: "Parallel: sahi tareeka (reduce/collect) same answer deta hai; forEach ka order guaranteed nahi",
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        long seqSum = LongStream.rangeClosed(1, 1_000_000).sum();
        long parSum = LongStream.rangeClosed(1, 1_000_000).parallel().sum();
        System.out.println(seqSum + " " + parSum + " same? " + (seqSum == parSum));

        List<Integer> collected = IntStream.range(0, 10_000).parallel().boxed().collect(Collectors.toList());
        System.out.println("collect size = " + collected.size() + ", order bana raha? " + collected.get(9_999));

        System.out.print("forEach        : ");
        Stream.of(1, 2, 3, 4, 5, 6).parallel().forEach(x -> System.out.print(x + " "));
        System.out.println();
        System.out.print("forEachOrdered : ");
        Stream.of(1, 2, 3, 4, 5, 6).parallel().forEachOrdered(x -> System.out.print(x + " "));
        System.out.println();
        System.out.println("common pool parallelism = " + java.util.concurrent.ForkJoinPool.commonPool().getParallelism());
    }
}`,
      note: "<code>forEach</code> wali line multi-core machine pe har run mein alag order de sakti hai; browser JVM mein zyaadatar ek hi CPU hota hai to shayad seedha order dikhe. <code>collect</code> aur <code>sum</code> parallel mein bhi sahi rehte hain kyunki har thread apna alag partial result banata hai aur end mein combine hota hai."
    },
    {
      type: "pick",
      id: "pick-parallel",
      q: "Kis case mein <code>parallelStream()</code> lagana <b>sahi</b> idea hai (measure karne ke baad)?",
      options: [
        { text: "50 lakh images ke hashes nikalna (CPU-heavy, har image independent), ArrayList source", correct: true, why: "Bada data, CPU-bound, independent, achha split. Parallel ka sahi case." },
        { text: "Cart ke 8 items ka total", correct: false, why: "Itne chhote kaam mein thread coordination ka overhead hi zyada." },
        { text: "Har user id pe REST call karke profile laana", correct: false, why: "Blocking I/O common pool ko jam karta hai. Apna ExecutorService (ya Java 21 virtual threads) use karo." },
        { text: "1 crore numbers ka sum, <code>LongStream.rangeClosed</code> se", correct: true, why: "Range perfectly split hota hai aur sum associative hai." },
        { text: "Parallel <code>forEach</code> se ek bahar ki <code>HashMap</code> mein counts bharna", correct: false, why: "HashMap thread-safe nahi: lost updates ya corrupt map. <code>groupingBy</code>/<code>groupingByConcurrent</code> se collect karo." },
        { text: "Log file ki lines padh ke pehli ERROR line dhoondhna (<code>findFirst</code>)", correct: false, why: "I/O source kharab split hota hai aur findFirst order-sensitive hai." }
      ]
    },
    {
      type: "think",
      id: "think-parallel",
      q: "Interview question: <b>\"Parallel streams kab use nahi karne chahiye? Andar kaunse threads use hote hain?\"</b>",
      rubric: [
        { point: "<b>ForkJoinPool.commonPool()</b>: JVM-wide shared pool, threads lagbhag cores - 1", keys: ["forkjoin", "fork join", "common pool", "commonpool", "shared pool"], weight: 2 },
        { point: "<b>Chhota data</b> / halka kaam: split + merge ka overhead zyada", keys: ["small", "chhota", "overhead", "few element", "kam data"], weight: 2 },
        { point: "<b>Shared mutable state</b> / side effects: race condition, non-thread-safe collections", keys: ["shared", "mutable", "race", "thread-safe", "thread safe", "side effect", "arraylist"], weight: 2 },
        { point: "<b>Blocking I/O</b> common pool ke threads ko block karta hai, baaki app ko bhi slow", keys: ["blocking", "i/o", "network", "db call", "io call", "starv", "block"], weight: 2 },
        { point: "Order-sensitive ops (findFirst, limit, forEachOrdered) aur kharab split sources (LinkedList, iterate)", keys: ["order", "findfirst", "limit", "linkedlist", "iterate", "split"], weight: 1 },
        { point: "Measure karo (JMH / benchmark), andaze se nahi", keys: ["measure", "benchmark", "jmh", "profile"], weight: 1 }
      ],
      answer: `<p>Parallel stream source ko <code>Spliterator</code> se chunks mein todta hai aur <b>ForkJoinPool.commonPool()</b> pe chalata hai. Ye pool poore JVM mein shared hai (default parallelism cores - 1; calling thread bhi kaam karta hai).</p>
               <p><b>Kab nahi:</b></p>
               <ul>
                 <li><b>Chhota data ya halka kaam:</b> splitting, scheduling aur merging ka cost kaam se zyada, aksar sequential se slow.</li>
                 <li><b>Shared mutable state:</b> lambda bahar ki ArrayList/HashMap/counter badle to race condition. Result ko <code>collect</code>/<code>reduce</code> se banao.</li>
                 <li><b>Blocking I/O:</b> DB/HTTP call common pool ke kuch threads ko block karte hain, aur JVM ke baaki users (doosre parallel streams, default <code>CompletableFuture</code> async tasks) bhi atak jaate hain. I/O ke liye dedicated executor ya virtual threads.</li>
                 <li><b>Order-sensitive:</b> <code>findFirst</code>, <code>limit</code>, <code>forEachOrdered</code> order bachane mein speedup kha jaate hain.</li>
                 <li><b>Kharab split:</b> LinkedList, <code>Stream.iterate</code>, file lines.</li>
               </ul>
               <p><b>Kab haan:</b> bada, CPU-bound, independent kaam; array/ArrayList/range source; associative operations. Aur decision benchmark (JMH) se lo.</p>`
    },
    {
      type: "quiz",
      q: `Multi-core machine pe output ke baare mein kya sahi hai?<pre class="code-static">List&lt;Integer&gt; out = new ArrayList&lt;&gt;();
IntStream.range(0, 100_000).parallel().forEach(out::add);
System.out.println(out.size());</pre>`,
      options: [
        "Hamesha 100000",
        "Hamesha 100000, par order random",
        "100000 se kam aa sakta hai, ya ArrayIndexOutOfBoundsException bhi aa sakta hai",
        "Compile error: parallel stream pe method reference nahi chalta"
      ],
      answer: 2,
      why: "<code>ArrayList.add</code> thread-safe nahi hai. Do threads ek saath size padhte hain aur same slot mein likhte hain (lost update), ya resize ke beech mein likhte hain (exception). Result run-to-run badalta hai. Fix: <code>.boxed().toList()</code> ya <code>collect(Collectors.toList())</code>."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Stream sawaal mein pehle <b>loop wala logic</b> ek line mein bolo (\"frequency map banaunga, phir count &gt; 1 filter\"), phir pipeline likho. Likhne ke baad khud edge cases bolo: <i>duplicates (distinct), tie (thenComparing), khaali input (Optional/empty map), order (LinkedHashMap/TreeMap)</i>. Aur agar interviewer \"parallel kar do\" bole, to pehle poochho: data kitna bada hai aur kaam CPU-bound hai ya I/O?"
    }
  ],
  references: [
    { title: "Collectors (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Collectors.html", type: "docs" },
    { title: "Parallelism (Java Tutorials: Aggregate Operations)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/collections/streams/parallelism.html", type: "docs" },
    { title: "First Unique Character in a String (LeetCode 387)", by: "LeetCode", url: "https://leetcode.com/problems/first-unique-character-in-a-string/", type: "article" },
    { title: "Top K Frequent Words (LeetCode 692)", by: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-words/", type: "article" }
  ]
});
