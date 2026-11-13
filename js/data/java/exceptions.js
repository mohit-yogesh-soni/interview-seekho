// Exceptions
registerLesson("java", "exceptions", {
  why: "Production code ka bada hissa error handling hai: payment fail, network timeout, galat input. Interview mein checked vs unchecked, finally ka behaviour, try-with-resources aur custom exceptions ke design pe sawaal aate hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Exception kya hai?</h2>
              <p>Program chalte waqt kuch galat hua (file nahi mili, number parse nahi hua, null pe method call) to Java ek <b>exception object</b> "throw" karta hai. Agar koi use "catch" nahi karta, to wo call stack mein upar jaata hai, aur <code>main</code> tak bhi na pakda gaya to thread ruk jaata hai aur stack trace print hota hai.</p>
              <pre class="diagram">
                    Throwable
                   /         \\
               Error          Exception
        (JVM ki problem)     /          \\
     OutOfMemoryError    IOException     RuntimeException
     StackOverflowError  SQLException    (UNCHECKED)
                         (CHECKED)       NullPointerException
                                         IllegalArgumentException
                                         ArithmeticException
                                         IndexOutOfBoundsException</pre>
              <table>
                <tr><th></th><th>Checked</th><th>Unchecked</th></tr>
                <tr><td>Kaun</td><td><code>Exception</code> ke subclasses, <b>RuntimeException chhod ke</b></td><td><code>RuntimeException</code> aur uske subclasses (aur <code>Error</code>)</td></tr>
                <tr><td>Compiler kya karta hai</td><td>Force karta hai: catch karo ya <code>throws</code> mein declare karo</td><td>Kuch force nahi karta</td></tr>
                <tr><td>Kab hota hai</td><td>Bahar ki duniya ki problem jo program ki galti nahi: file, network, DB</td><td>Programming galti: null, galat index, galat argument</td></tr>
                <tr><td>Example</td><td><code>IOException</code>, <code>SQLException</code>, <code>InterruptedException</code></td><td><code>NullPointerException</code>, <code>IllegalStateException</code></td></tr>
              </table>
              <p><b>Error</b> (jaise <code>OutOfMemoryError</code>) ko normally catch nahi karte: JVM hi mushkil mein hai, aap kuch theek nahi kar sakte.</p>`
    },
    {
      type: "code",
      expectError: true,
      title: "Checked exception ko ignore kiya to compile hi nahi hoga. Run karo, error padho, phir fix karo.",
      code: `public class Main {
    static String readConfig(String path) throws java.io.IOException {
        if (path.isEmpty()) throw new java.io.IOException("path khaali hai");
        return "config from " + path;
    }

    public static void main(String[] args) {
        // Fix 1: try { ... } catch (java.io.IOException e) { ... }
        // Fix 2: main ke signature mein "throws java.io.IOException" likho
        System.out.println(readConfig("app.yaml"));
    }
}`,
      note: "Error: <i>unreported exception IOException; must be caught or declared to be thrown</i>. Ye compile time pe hi pakda gaya. Unchecked exceptions ke saath aisa nahi hota."
    },
    {
      type: "code",
      title: "try / catch / finally: kaunsi line kab chalti hai",
      code: `public class Main {
    static int divide(int a, int b) {
        try {
            System.out.println("  try shuru");
            int r = a / b;                       // b = 0 → ArithmeticException
            System.out.println("  try khatam");
            return r;
        } catch (ArithmeticException e) {
            System.out.println("  catch: " + e.getMessage());
            return -1;
        } finally {
            System.out.println("  finally (hamesha chalta hai)");
        }
    }

    public static void main(String[] args) {
        System.out.println("10/2 = " + divide(10, 2));
        System.out.println("10/0 = " + divide(10, 0));

        // Multi-catch (Java 7+): ek hi handling do types ke liye
        String[] inputs = {"42", "abc", null};
        for (String in : inputs) {
            try {
                System.out.println("parsed = " + Integer.parseInt(in.trim()));  // null.trim() → NPE
            } catch (NumberFormatException | NullPointerException e) {
                System.out.println("bad input " + in + " → " + e.getClass().getSimpleName());
            }
        }
    }
}`,
      note: "Dhyaan do: <code>return</code> ke baad bhi <code>finally</code> chala, aur uske baad value caller tak pahunchi. <code>finally</code> sirf tab skip hota hai jab JVM hi ruk jaaye (jaise <code>System.exit()</code>) ya thread mar jaaye."
    },
    {
      type: "quiz",
      q: `Ye compile hoga?<pre class="code-static">try {
    riskyIo();
} catch (Exception e) {
    System.out.println("general");
} catch (IOException e) {
    System.out.println("io");
}</pre>`,
      options: [
        "Haan, IOException wala catch kabhi nahi chalega",
        "Nahi, compile error: IOException pehle hi Exception wale catch mein pakda ja chuka hai (unreachable)",
        "Haan, aur IOException pe \"io\" print hoga",
        "Runtime pe error aayega"
      ],
      answer: 1,
      why: "Catch blocks upar se neeche match hote hain. Parent (<code>Exception</code>) pehle hai to child (<code>IOException</code>) wala block kabhi reach nahi ho sakta, aur Java isko compile error banata hai. Rule: <b>specific pehle, general baad mein</b>."
    },
    {
      type: "text",
      html: `
              <h2>try-with-resources (Java 7+)</h2>
              <p>File, DB connection, socket jaise resources band karna zaroori hai, warna leak hota hai (connection pool khatam, "too many open files"). Pehle log <code>finally</code> mein <code>close()</code> likhte the, jo lamba aur galti wala code tha.</p>
              <pre class="code-static">try (Connection con = pool.get(); Statement st = con.createStatement()) {
    ...  // use karo
}   // yahan st.close() phir con.close() apne aap (ulta order)</pre>
              <ul>
                <li>Resource ko <code>AutoCloseable</code> implement karna chahiye.</li>
                <li>Close <b>ulte order</b> mein hota hai: jo baad mein khula, wo pehle band.</li>
                <li>Body exception throw kare <b>aur</b> close bhi throw kare, to body wala exception main rehta hai, close wala <b>suppressed</b> ban ke uske andar chala jaata hai (<code>e.getSuppressed()</code>). Purane finally-style code mein close wala exception asli exception ko chhupa deta tha.</li>
                <li>Java 9+: pehle se bana effectively final resource bhi de sakte ho: <code>try (con) { ... }</code>.</li>
              </ul>`
    },
    {
      type: "steps",
      title: "try-with-resources: body fail ho, aur close bhi fail ho",
      steps: [
        { title: "1. Resource A khula", html: `<div class="arr"><span class="cell ok">A open</span><span class="cell dim">B</span><span class="cell dim">body</span></div>` },
        { title: "2. Resource B khula", html: `<div class="arr"><span class="cell ok">A open</span><span class="cell ok">B open</span><span class="cell dim">body</span></div>` },
        { title: "3. Body ne exception X throw kiya", html: `<div class="arr"><span class="cell ok">A open</span><span class="cell ok">B open</span><span class="cell bad">X!</span></div><p>Ab Java resources band karega, ulte order mein.</p>` },
        { title: "4. B.close() chala, usne Y throw kiya", html: `<div class="arr"><span class="cell ok">A open</span><span class="cell bad">B close: Y</span><span class="cell bad">X</span></div><p>Y ko <code>X.addSuppressed(Y)</code> kar diya. X hi main exception hai.</p>` },
        { title: "5. A.close() chala", html: `<div class="arr"><span class="cell dim">A closed</span><span class="cell dim">B closed</span><span class="cell bad">X (suppressed: Y)</span></div><p>Ab catch block ko X milta hai. <code>X.getSuppressed()</code> mein Y hai. Koi info lost nahi hui.</p>` }
      ]
    },
    {
      type: "code",
      title: "try-with-resources live: close order aur suppressed exception",
      code: `public class Main {
    static class Res implements AutoCloseable {
        private final String name;
        private final boolean failOnClose;
        Res(String name, boolean failOnClose) {
            this.name = name;
            this.failOnClose = failOnClose;
            System.out.println("open " + name);
        }
        @Override
        public void close() {
            System.out.println("close " + name);
            if (failOnClose) throw new IllegalStateException("close failed: " + name);
        }
    }

    public static void main(String[] args) {
        try (Res a = new Res("A", false); Res b = new Res("B", true)) {
            System.out.println("body chal rahi hai");
            throw new RuntimeException("body failed");
        } catch (RuntimeException e) {
            System.out.println("caught: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) {
                System.out.println("  suppressed: " + s.getMessage());
            }
        }
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>Custom exceptions</h2>
              <p>Business errors ko naam do: <code>InsufficientBalanceException</code> padh ke turant samajh aata hai kya hua, <code>RuntimeException("error")</code> se nahi. Achha custom exception:</p>
              <ul>
                <li>Naam <code>...Exception</code> pe khatam ho.</li>
                <li>Useful fields rakhe (jaise <code>required</code>, <code>available</code>) taaki caller decide kar sake.</li>
                <li><b>Cause</b> pass kare jab kisi low-level exception ko wrap kar rahe ho: <code>super(msg, cause)</code>. Warna asli stack trace kho jaata hai.</li>
                <li>Checked banao (<code>extends Exception</code>) sirf tab jab caller sach mein recover kar sake. Zyaadatar modern code (Spring etc.) unchecked (<code>extends RuntimeException</code>) prefer karta hai.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Custom exception + wrapping with cause (UPI payment jaisa)",
      code: `public class Main {
    static class InsufficientBalanceException extends RuntimeException {
        final long required, available;
        InsufficientBalanceException(long required, long available) {
            super("Balance kam hai: chahiye " + required + ", hai " + available);
            this.required = required;
            this.available = available;
        }
    }

    static class PaymentException extends RuntimeException {
        PaymentException(String msg, Throwable cause) { super(msg, cause); }
    }

    static long balance = 500;

    static void debit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount positive hona chahiye: " + amount);
        if (amount > balance) throw new InsufficientBalanceException(amount, balance);
        balance -= amount;
    }

    static void pay(String upiId, long amount) {
        try {
            debit(amount);
            System.out.println("Paid " + amount + " to " + upiId);
        } catch (InsufficientBalanceException e) {
            // low-level exception ko higher-level mein wrap karo, cause ke saath
            throw new PaymentException("Payment to " + upiId + " failed", e);
        }
    }

    public static void main(String[] args) {
        pay("chaiwala@upi", 200);
        try {
            pay("mall@upi", 1000);
        } catch (PaymentException e) {
            System.out.println(e.getMessage());
            System.out.println("  cause: " + e.getCause().getMessage());
            InsufficientBalanceException ib = (InsufficientBalanceException) e.getCause();
            System.out.println("  short by: " + (ib.required - ib.available));
        }
    }
}`
    },
    {
      type: "quiz",
      q: "Parent class ka method <code>void save() throws IOException</code> hai. Child class override karte waqt kya likh sakti hai?",
      options: [
        "<code>void save() throws Exception</code>",
        "<code>void save() throws FileNotFoundException</code> ya bina throws ke",
        "Sirf exactly <code>throws IOException</code>",
        "Kuch bhi, throws ka override se lena dena nahi"
      ],
      answer: 1,
      why: "Overriding method <b>zyada broad checked exception</b> throw nahi kar sakta (Exception &gt; IOException, to compile error). Wahi, uska subclass (<code>FileNotFoundException</code>), ya kuch bhi nahi chalega. Reason: jo code parent type se call karta hai wo sirf IOException ke liye tayaar hai. Unchecked exceptions pe ye rule nahi lagta."
    },
    {
      type: "pick",
      id: "pick-best-practice",
      q: "Inme se kaunsi exception handling <b>best practices</b> hain? Sab select karo.",
      options: [
        { text: "Specific exception catch karo (<code>catch (IOException e)</code>), sab kuch <code>catch (Exception e)</code> mein nahi", correct: true, why: "General catch NPE jaise bugs bhi chhupa deta hai." },
        { text: "<code>catch (Exception e) { }</code> (khaali catch) taaki app crash na ho", correct: false, why: "Exception nigal liya, ab bug kabhi pata nahi chalega. Kam se kam log karo, ya rethrow." },
        { text: "Wrap karte waqt cause pass karo: <code>new ServiceException(\"...\", e)</code>", correct: true, why: "Asli stack trace bachta hai, debugging mein yahi kaam aata hai." },
        { text: "Loop se bahar nikalne ke liye exception throw karo (normal flow control)", correct: false, why: "Exceptions mehenge hain (stack trace banta hai) aur code padhna mushkil. Normal flow ke liye if/return." },
        { text: "Input method ki shuruaat mein validate karo aur galat ho to <code>IllegalArgumentException</code> (fail fast)", correct: true, why: "Galti jahan hui wahin pakdi gayi, saaf message ke saath." },
        { text: "Har layer pe log karo aur rethrow karo", correct: false, why: "Same error 5 baar log hota hai. Ek jagah (jo handle kare) log karo." },
        { text: "Resources ke liye try-with-resources", correct: true, why: "Close guarantee, suppressed exceptions bhi bachti hain." }
      ]
    },
    {
      type: "exercise",
      id: "ex-parse-age",
      title: "parseAge: validate karo, aur cause mat khoo",
      level: "Medium",
      task: `<p>Signup form se age String mein aati hai. <code>parseAge(String s)</code> likho:</p>
             <ul><li>Valid ho (0 se 150, aage-peeche spaces allowed) to int return karo.</li>
             <li><code>null</code> ya blank ho to <code>IllegalArgumentException</code> message <code>"age required"</code>.</li>
             <li>Number nahi hai to <code>IllegalArgumentException</code> jiska <b>cause</b> asli <code>NumberFormatException</code> ho.</li>
             <li>Range ke bahar to <code>IllegalArgumentException</code> message <code>"age out of range: &lt;n&gt;"</code>.</li></ul>`,
      examples: "<code>\" 25 \"</code> → <code>25</code><br><code>\"abc\"</code> → IllegalArgumentException (cause: NumberFormatException)<br><code>\"200\"</code> → IllegalArgumentException(\"age out of range: 200\")",
      userFile: "Solution.java",
      starter: `class Solution {
    int parseAge(String s) {
        return Integer.parseInt(s);
    }
}`,
      harness: `import seekho.Check;
import java.util.function.Supplier;

public class Main {
    // Exception ko readable string mein badlo taaki compare kar sakein
    static Object run(Supplier<Object> f) {
        try {
            return f.get();
        } catch (Exception e) {
            String c = e.getCause() == null ? "" : " cause=" + e.getCause().getClass().getSimpleName();
            return e.getClass().getSimpleName() + ": " + e.getMessage() + c;
        }
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\" 25 \\"", 25, () -> run(() -> s.parseAge(" 25 ")));
        Check.eq("\\"200\\"", "IllegalArgumentException: age out of range: 200", () -> run(() -> s.parseAge("200")));
        Check.hiddenFromHere();
        Check.eq("\\"0\\"", 0, () -> run(() -> s.parseAge("0")));
        Check.eq("\\"150\\"", 150, () -> run(() -> s.parseAge("150")));
        Check.eq("\\"-1\\"", "IllegalArgumentException: age out of range: -1", () -> run(() -> s.parseAge("-1")));
        Check.eq("null", "IllegalArgumentException: age required", () -> run(() -> s.parseAge(null)));
        Check.eq("blank", "IllegalArgumentException: age required", () -> run(() -> s.parseAge("   ")));
        Check.eq("abc ka cause", true, () -> String.valueOf(run(() -> s.parseAge("abc"))).startsWith("IllegalArgumentException") && String.valueOf(run(() -> s.parseAge("abc"))).endsWith("cause=NumberFormatException"));
    }
}`,
      hints: [
        "Order: pehle null/blank check (<code>s == null || s.isBlank()</code>), phir parse, phir range.",
        "Parse ko try mein rakho: <code>catch (NumberFormatException e) { throw new IllegalArgumentException(\"age must be a number: \" + s, e); }</code>",
        "Parse se pehle <code>s.trim()</code> karna mat bhoolo."
      ],
      solution: `class Solution {
    int parseAge(String s) {
        if (s == null || s.isBlank()) throw new IllegalArgumentException("age required");
        int age;
        try {
            age = Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("age must be a number: " + s, e);
        }
        if (age < 0 || age > 150) throw new IllegalArgumentException("age out of range: " + age);
        return age;
    }
}`,
      explain: "<p>Teen cheezein seekhi: (1) <b>fail fast</b>: input ko method ke shuru mein validate karo, (2) <b>sahi exception type</b>: galat argument = <code>IllegalArgumentException</code>, (3) <b>cause chain</b>: <code>new IllegalArgumentException(msg, e)</code> se asli NumberFormatException ka stack trace bachta hai.</p>"
    },
    {
      type: "think",
      id: "think-checked",
      q: "Interview question: <b>\"Checked aur unchecked exception mein farak kya hai? Apni service ke liye custom exception banana ho to kaunsa banaoge aur kyun?\"</b>",
      rubric: [
        { point: "Checked: compiler <b>catch ya throws</b> force karta hai; unchecked (RuntimeException) pe nahi", keys: ["compile", "compiler", "throws", "force", "declare"], weight: 2 },
        { point: "Checked = recoverable bahar ki problem (IO, network); unchecked = programming galti (null, galat argument)", keys: ["recover", "io", "network", "file", "programming", "bug", "null"], weight: 2 },
        { point: "Modern preference: zyaadatar <b>unchecked</b>, kyunki checked lambdas/streams ke saath nahi chalte aur har layer pe throws failta hai", keys: ["lambda", "stream", "boilerplate", "har layer", "every layer", "spring", "unchecked"], weight: 2 },
        { point: "Low-level exception ko wrap karo <b>cause ke saath</b>, abstraction level ke hisaab se", keys: ["cause", "wrap", "chain", "translate"], weight: 1 },
        { point: "Custom exception mein useful fields / error code (jaise HTTP 4xx mapping)", keys: ["error code", "field", "status", "4xx", "400", "context"] }
      ],
      answer: `<p><b>Checked</b> exceptions (<code>Exception</code> ke subclasses, RuntimeException chhod ke) ko compiler force karta hai: ya catch karo ya <code>throws</code> mein likho. Ye un problems ke liye hain jo program ki galti nahi aur caller recover kar sakta hai: file nahi mili, network down.</p>
               <p><b>Unchecked</b> (<code>RuntimeException</code>) programming galtiyon ke liye: null, galat index, invalid argument. Compiler force nahi karta.</p>
               <p><b>Mera choice:</b> zyaadatar service code mein unchecked custom exceptions, jaise <code>OrderNotFoundException extends RuntimeException</code>. Reasons: checked exceptions lambdas/streams mein use nahi ho paate (<code>Function</code> throw declare nahi karta), aur har layer ke signature mein <code>throws</code> phail jaata hai. Ek global handler (Spring ka <code>@ControllerAdvice</code>) inko HTTP 404/400 mein map kar deta hai. Low-level exceptions (SQLException) ko wrap karta hoon <b>cause ke saath</b>. Checked sirf tab jab caller ko sach mein recovery ka faisla lena hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"<code>finally</code> kab nahi chalta?\" ka answer: <code>System.exit()</code>, JVM crash / kill -9, ya thread hamesha ke liye block ho jaaye. Aur bonus trap: <code>finally</code> mein <code>return</code> likhne se try ka exception bhi <b>nigal</b> liya jaata hai. Isliye finally mein return kabhi mat likho (Tricky output lesson mein iska code hai)."
    }
  ],
  references: [
    { title: "Lesson: Exceptions (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/", type: "docs" },
    { title: "The try-with-resources Statement", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html", type: "docs" },
    { title: "Throwable (Java 17 API): getSuppressed, getCause", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Throwable.html", type: "docs" },
    { title: "Effective Java (3rd ed.), Items 69-77 (Exceptions chapter)", by: "Joshua Bloch", type: "book" }
  ]
});
