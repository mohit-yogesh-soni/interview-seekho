// Lambdas aur Functional Interfaces
registerLesson("java", "lambdas", {
  why: "Streams, Comparator, CompletableFuture, Spring ke callbacks: modern Java ka har API lambdas leta hai. Interview mein functional interfaces ke naam, 'effectively final kyun?', aur 'lambda vs anonymous class' common sawaal hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Problem: chhote se kaam ke liye poori class</h2>
              <p>Java 8 se pehle "ye logic baad mein chalana" (jaise comparator, button click, thread ka kaam) dene ke liye <b>anonymous class</b> likhni padti thi: 5-6 lines, jisme asli logic ek line ka.</p>
              <pre class="code-static">// Java 7
Collections.sort(names, new Comparator&lt;String&gt;() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
});

// Java 8 lambda: sirf parameters -&gt; body
names.sort((a, b) -&gt; Integer.compare(a.length(), b.length()));

// Aur chhota: method reference / helper
names.sort(Comparator.comparingInt(String::length));</pre>
              <h2>Lambda kya hai?</h2>
              <p>Lambda ek <b>functional interface</b> ka implementation hai. Functional interface = aisa interface jisme <b>exactly ek abstract method</b> ho (default/static methods kitne bhi). Lambda us ek method ki body hai. <code>@FunctionalInterface</code> annotation optional hai, par lagao: koi doosra abstract method jod de to compile error.</p>
              <table>
                <tr><th>Syntax</th><th>Example</th></tr>
                <tr><td>Koi parameter nahi</td><td><code>() -&gt; System.out.println("hi")</code></td></tr>
                <tr><td>Ek parameter (brackets optional)</td><td><code>x -&gt; x * 2</code></td></tr>
                <tr><td>Kai parameters</td><td><code>(a, b) -&gt; a + b</code></td></tr>
                <tr><td>Multi-line body</td><td><code>(a, b) -&gt; { int s = a + b; return s * s; }</code></td></tr>
                <tr><td>Types likhna (optional)</td><td><code>(String s, int n) -&gt; s.repeat(n)</code></td></tr>
              </table>`
    },
    {
      type: "code",
      title: "Anonymous class → lambda → apna functional interface",
      code: `import java.util.*;

public class Main {
    @FunctionalInterface
    interface DiscountRule {
        double apply(double amount);           // ek hi abstract method
        default String name() { return "rule"; }   // default methods allowed
    }

    public static void main(String[] args) {
        DiscountRule oldStyle = new DiscountRule() {     // anonymous class
            @Override public double apply(double amount) { return amount * 0.9; }
        };
        DiscountRule flat50 = amount -> amount - 50;     // lambda
        DiscountRule festive = amount -> {
            if (amount > 1000) return amount * 0.8;
            return amount;
        };

        for (DiscountRule r : List.of(oldStyle, flat50, festive)) {
            System.out.println(r.apply(1500));
        }

        Runnable task = () -> System.out.println("thread ka kaam " + Thread.currentThread().getName());
        Thread t = new Thread(task, "worker-1");
        t.start();
        try { t.join(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>java.util.function: ready-made interfaces</h2>
              <p>Har baar apna interface banane ki zaroorat nahi. Ye 5 yaad rakho, baaki inke variations hain:</p>
              <table>
                <tr><th>Interface</th><th>Method</th><th>Shape</th><th>Example</th></tr>
                <tr><td><code>Function&lt;T, R&gt;</code></td><td><code>R apply(T t)</code></td><td>T leke R do</td><td><code>s -&gt; s.length()</code></td></tr>
                <tr><td><code>Predicate&lt;T&gt;</code></td><td><code>boolean test(T t)</code></td><td>Haan/na</td><td><code>o -&gt; o.amount() &gt; 500</code></td></tr>
                <tr><td><code>Consumer&lt;T&gt;</code></td><td><code>void accept(T t)</code></td><td>Lo, kuch karo, return kuch nahi</td><td><code>s -&gt; System.out.println(s)</code></td></tr>
                <tr><td><code>Supplier&lt;T&gt;</code></td><td><code>T get()</code></td><td>Kuch mat lo, value do</td><td><code>() -&gt; new ArrayList&lt;&gt;()</code></td></tr>
                <tr><td><code>BiFunction&lt;T, U, R&gt;</code></td><td><code>R apply(T t, U u)</code></td><td>Do input, ek output</td><td><code>(price, qty) -&gt; price * qty</code></td></tr>
              </table>
              <ul>
                <li><code>UnaryOperator&lt;T&gt;</code> = <code>Function&lt;T, T&gt;</code>, <code>BinaryOperator&lt;T&gt;</code> = <code>BiFunction&lt;T, T, T&gt;</code></li>
                <li><code>BiPredicate</code>, <code>BiConsumer</code> (Map.forEach isi ko leta hai)</li>
                <li><b>Primitive versions</b> boxing se bachate hain: <code>IntPredicate</code>, <code>IntFunction&lt;R&gt;</code>, <code>ToIntFunction&lt;T&gt;</code>, <code>IntUnaryOperator</code>, <code>IntBinaryOperator</code>...</li>
              </ul>`
    },
    {
      type: "code",
      title: "Paanchon interfaces + composition (andThen, compose, and, or, negate)",
      code: `import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Function<String, Integer> length = s -> s.length();
        Predicate<Integer> isBig = n -> n > 500;
        Consumer<String> log = s -> System.out.println("[log] " + s);
        Supplier<List<String>> newCart = () -> new ArrayList<>();
        BiFunction<Integer, Integer, Integer> total = (price, qty) -> price * qty;

        System.out.println(length.apply("biryani"));
        System.out.println(isBig.test(750));
        log.accept("order placed");
        List<String> cart = newCart.get();
        cart.add("dosa");
        System.out.println(cart + " total=" + total.apply(120, 3));

        // Composition
        Function<Integer, Integer> plusTax = x -> x + 18;
        Function<Integer, Integer> doubleIt = x -> x * 2;
        System.out.println("andThen: " + plusTax.andThen(doubleIt).apply(100));   // (100+18)*2
        System.out.println("compose: " + plusTax.compose(doubleIt).apply(100));   // 100*2+18

        Predicate<String> notEmpty = s -> !s.isEmpty();
        Predicate<String> isVeg = s -> s.startsWith("veg");
        Predicate<String> nonVegItem = notEmpty.and(isVeg.negate());
        System.out.println(nonVegItem.test("chicken tikka") + " " + nonVegItem.test("veg roll"));
        System.out.println(isVeg.or(s -> s.equals("paneer")).test("paneer"));

        BinaryOperator<Integer> max = BinaryOperator.maxBy(Comparator.naturalOrder());
        System.out.println("maxBy: " + max.apply(7, 3));
        System.out.println("identity: " + Function.<String>identity().apply("same"));
    }
}`
    },
    {
      type: "quiz",
      q: "<code>f = x -&gt; x + 1</code>, <code>g = x -&gt; x * 10</code>. <code>f.andThen(g).apply(2)</code> aur <code>f.compose(g).apply(2)</code>?",
      options: ["30 aur 21", "21 aur 30", "30 aur 30", "21 aur 21"],
      answer: 0,
      why: "<code>f.andThen(g)</code> = pehle f, phir g: (2+1)*10 = 30. <code>f.compose(g)</code> = pehle g, phir f: 2*10+1 = 21. Yaad rakho: compose \"andar wala pehle\" (math jaisa f(g(x)))."
    },
    {
      type: "quiz",
      q: "Kaunsa functional interface fit hota hai: <i>\"order ID lo, kuch return mat karo, bas notification bhej do\"</i>?",
      options: ["Supplier&lt;String&gt;", "Function&lt;String, Void&gt;", "Consumer&lt;String&gt;", "Predicate&lt;String&gt;"],
      answer: 2,
      why: "Input hai, output nahi = <code>Consumer</code>. Supplier ulta hai (input nahi, output hai). Function&lt;String, Void&gt; technically chalega par <code>return null</code> likhna padega, ajeeb hai."
    },
    {
      type: "text",
      html: `
              <h2>Effectively final: lambda bahar ka local variable badal nahi sakta</h2>
              <p>Lambda bahar ke <b>local variables</b> padh sakta hai (ise "capture" kehte hain), par sirf tab jab wo <b>effectively final</b> hon: <code>final</code> likha na ho, par assign hone ke baad kabhi badle nahi.</p>
              <p><b>Kyun?</b></p>
              <ul>
                <li>Local variable <b>stack</b> pe hota hai aur method khatam hote hi mit jaata hai. Lambda baad mein (ya doosre thread mein) chal sakta hai. Isliye Java lambda mein value ki <b>copy</b> rakhta hai.</li>
                <li>Agar variable baad mein badal sakta, to copy aur original alag ho jaate. Confusion aur thread-safety bugs. Java ne simple rule rakha: badal hi nahi sakte.</li>
                <li>Fields (instance/static) pe ye rule nahi lagta, kyunki wo heap pe hain. Par unhe lambda se badalna bhi thread-safety ka risk hai.</li>
              </ul>`
    },
    {
      type: "code",
      expectError: true,
      title: "Captured local ko badla: compile error",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> prices = List.of(100, 250, 80);
        int total = 0;
        prices.forEach(p -> total += p);     // ❌ local variables referenced from a lambda must be final or effectively final
        System.out.println(total);
    }
}`,
      note: "Fix: loop use karo, ya stream: <code>int total = prices.stream().mapToInt(Integer::intValue).sum();</code>. <code>int[] box = {0}</code> ya <code>AtomicInteger</code> se compiler ko \"bypass\" kar sakte ho, par wo hack hai: asli solution side-effect-free code hai."
    },
    {
      type: "code",
      title: "this ka matlab: lambda vs anonymous class",
      code: `public class Main {
    private final String name = "Main object";

    void demo() {
        Runnable lambda = () -> System.out.println("lambda this    → " + this.name);
        Runnable anon = new Runnable() {
            private final String name = "anonymous object";
            @Override public void run() { System.out.println("anonymous this → " + this.name); }
        };
        lambda.run();
        anon.run();
    }

    public static void main(String[] args) {
        new Main().demo();
    }
}`,
      note: "Lambda naya scope nahi banata: <code>this</code> bahar wali class ka object hai. Anonymous class ek nayi class hai, uska <code>this</code> khud wo object. Isliye lambda mein bahar ke variable ke naam ka parameter bhi nahi bana sakte (shadowing allowed nahi)."
    },
    {
      type: "exercise",
      id: "ex-lambda-rules",
      title: "Password rule (Predicate) aur pricing pipeline (Function)",
      level: "Medium",
      task: `<p>Do methods likho:</p>
             <ol><li><code>passwordRule()</code> ek <code>Predicate&lt;String&gt;</code> return kare jo true de jab password: length ≥ 8, kam se kam ek digit, aur <b>koi space nahi</b>. Teen chhote predicates banao aur <code>and</code> se jodo.</li>
             <li><code>pipeline(steps)</code>: <code>List&lt;Function&lt;Integer, Integer&gt;&gt;</code> ke saare steps ko <b>order mein</b> ek single Function mein jodo. Khaali list → input wahi wapas.</li></ol>`,
      examples: "<code>passwordRule().test(\"chai1234\")</code> → true; <code>\"chai 1234\"</code> → false<br><code>pipeline([x -&gt; x + 18, x -&gt; x * 2]).apply(100)</code> → 236",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.function.*;

class Solution {
    Predicate<String> passwordRule() {
        return s -> s.length() >= 8;
    }

    Function<Integer, Integer> pipeline(List<Function<Integer, Integer>> steps) {
        return x -> x;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("chai1234", true, () -> s.passwordRule().test("chai1234"));
        Check.eq("chaichai (no digit)", false, () -> s.passwordRule().test("chaichai"));
        Check.eq("pipeline [+18, *2] (100)", 236, () -> s.pipeline(List.of(x -> x + 18, x -> x * 2)).apply(100));
        Check.hiddenFromHere();
        Check.eq("space wala", false, () -> s.passwordRule().test("chai 1234"));
        Check.eq("chhota", false, () -> s.passwordRule().test("ab1"));
        Check.eq("exactly 8 with digit", true, () -> s.passwordRule().test("1abcdefg"));
        Check.eq("tab bhi whitespace", false, () -> s.passwordRule().test("abc\\t12345"));
        Check.eq("pipeline empty", 7, () -> s.pipeline(List.of()).apply(7));
        Check.eq("pipeline order matters [*2, +18]", 218, () -> s.pipeline(List.of(x -> x * 2, x -> x + 18)).apply(100));
        List<Function<Integer, Integer>> many = new ArrayList<>();
        for (int i = 0; i < 1000; i++) many.add(x -> x + 1);
        Check.eq("1000 steps", 1000, () -> s.pipeline(many).apply(0));
    }
}`,
      hints: [
        "<code>Predicate&lt;String&gt; hasDigit = p -&gt; p.chars().anyMatch(Character::isDigit);</code> aur <code>noSpace = p -&gt; p.chars().noneMatch(Character::isWhitespace);</code>",
        "<code>return longEnough.and(hasDigit).and(noSpace);</code>",
        "Pipeline: <code>Function&lt;Integer,Integer&gt; f = Function.identity(); for (var step : steps) f = f.andThen(step); return f;</code>"
      ],
      solution: `import java.util.*;
import java.util.function.*;

class Solution {
    Predicate<String> passwordRule() {
        Predicate<String> longEnough = p -> p.length() >= 8;
        Predicate<String> hasDigit = p -> p.chars().anyMatch(Character::isDigit);
        Predicate<String> noSpace = p -> p.chars().noneMatch(Character::isWhitespace);
        return longEnough.and(hasDigit).and(noSpace);
    }

    Function<Integer, Integer> pipeline(List<Function<Integer, Integer>> steps) {
        Function<Integer, Integer> f = Function.identity();
        for (Function<Integer, Integer> step : steps) {
            f = f.andThen(step);
        }
        return f;
    }
}`,
      explain: "<p>Chhote, naam wale predicates ko <code>and</code> se jodna \"rules engine\" ka simple version hai: naya rule = ek line. <code>andThen</code> chain left se right chalti hai. Note: <code>f = f.andThen(step)</code> mein <code>f</code> badal raha hai, par ye lambda ke andar captured nahi hai, isliye allowed hai.</p><p>Stream version: <code>steps.stream().reduce(Function.identity(), Function::andThen)</code>.</p>"
    },
    {
      type: "think",
      id: "think-lambda-anon",
      q: "Interview question: <b>\"Lambda aur anonymous inner class mein kya farak hai? Kya lambda sirf syntactic sugar hai?\"</b>",
      rubric: [
        { point: "Lambda sirf <b>functional interface</b> (ek abstract method) ke liye; anonymous class kisi bhi interface/abstract class ke liye, kai methods aur state ke saath", keys: ["functional interface", "single abstract", "ek abstract", "abstract class", "multiple method", "state", "field"], weight: 2 },
        { point: "<b>this</b>: lambda mein enclosing object, anonymous mein khud ka object", keys: ["this", "enclosing", "scope", "shadow"], weight: 2 },
        { point: "Sugar nahi: lambda <b>invokedynamic</b> / LambdaMetafactory se runtime pe banta hai, alag .class file nahi", keys: ["invokedynamic", "metafactory", ".class", "class file", "runtime"], weight: 2 },
        { point: "Dono sirf effectively final locals capture karte hain", keys: ["effectively final", "final", "capture"], weight: 1 }
      ],
      answer: `<ul>
                 <li><b>Target:</b> lambda sirf functional interface implement kar sakta hai. Anonymous class kisi bhi interface ya abstract/concrete class ko extend kar sakti hai, kai methods override kar sakti hai, aur apne fields (state) rakh sakti hai.</li>
                 <li><b>this:</b> lambda naya scope nahi banata, <code>this</code> = bahar wali class ka object. Anonymous class mein <code>this</code> = anonymous object khud.</li>
                 <li><b>Compile/runtime:</b> anonymous class ke liye compiler ek alag <code>Main$1.class</code> file banata hai. Lambda ki body ek private method ban jaati hai aur call site pe <code>invokedynamic</code> instruction hota hai; pehli baar chalne pe <code>LambdaMetafactory</code> runtime pe implementation banata hai. Isliye ye sirf syntactic sugar nahi hai, aur JVM isko optimize kar sakta hai (jaise non-capturing lambda ka ek hi instance reuse).</li>
                 <li><b>Same:</b> dono sirf effectively final local variables capture kar sakte hain.</li>
               </ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Functional interfaces ke naam ke saath unka <b>shape</b> bolo: \"<i>Function T se R, Predicate T se boolean, Consumer T leta hai kuch nahi deta, Supplier kuch nahi leta T deta hai</i>\". Aur bonus: \"<i>primitive versions jaise IntPredicate boxing bachate hain</i>\"."
    }
  ],
  references: [
    { title: "Lambda Expressions (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html", type: "docs" },
    { title: "java.util.function package (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/function/package-summary.html", type: "docs" },
    { title: "JEP 126: Lambda Expressions & Virtual Extension Methods", by: "OpenJDK", url: "https://openjdk.org/jeps/126", type: "docs" },
    { title: "Effective Java (3rd ed.), Items 42-44 (lambdas, method references, standard functional interfaces)", by: "Joshua Bloch", type: "book" }
  ]
});
