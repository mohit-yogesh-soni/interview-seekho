// Java kaise chalta hai + Hello World
registerLesson("java", "how-java-runs", {
  why: "Interview mein 'JDK, JRE, JVM mein kya farak hai?' aur 'Java platform independent kaise hai?' bahut common hai. Aur jab tak ye nahi pata ki code chalta kaise hai, errors samajh nahi aayenge.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Code se output tak: 3 steps</h2>
              <ol>
                <li><b>Aap likhte ho</b> <code>Main.java</code>: insaan ke padhne layak code.</li>
                <li><b>javac (compiler)</b> isko <code>Main.class</code> mein badalta hai. Isme <b>bytecode</b> hota hai: na insaan ki bhasha, na CPU ki. Ye JVM ki bhasha hai.</li>
                <li><b>JVM</b> (Java Virtual Machine) bytecode ko padh ke aapke CPU pe chalata hai. Jo code baar baar chalta hai, use JVM ka <b>JIT compiler</b> seedha machine code bana deta hai, isliye Java fast hai.</li>
              </ol>
              <table>
                <tr><th>Naam</th><th>Kya hai</th><th>Kab chahiye</th></tr>
                <tr><td><b>JVM</b></td><td>Bytecode chalane wali machine (software)</td><td>Har jagah jahan Java chalana hai</td></tr>
                <tr><td><b>JRE</b></td><td>JVM + standard libraries (String, ArrayList...)</td><td>Sirf program chalana hai</td></tr>
                <tr><td><b>JDK</b></td><td>JRE + tools (javac, jar, debugger)</td><td>Code likhna aur compile karna hai (developers)</td></tr>
              </table>
              <p>Yaad rakhne ka tareeka: <b>JDK ⊃ JRE ⊃ JVM</b>. Is website pe bhi yahi hota hai: aapka code browser ke andar <code>javac</code> se compile hota hai aur ek JVM (CheerpJ) chalata hai.</p>`
    },
    {
      type: "code",
      title: "Pehla program: isko Run karo, phir text badal ke dobara chalao",
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Namaste, Java!");
        System.out.println("Main interview crack karunga 💪");
        System.out.print("print() ke baad nayi line nahi aati. ");
        System.out.println("Dekha?");
    }
}`
    },
    {
      type: "text",
      html: `
              <h2>Har word ka matlab</h2>
              <table>
                <tr><th>Code</th><th>Matlab</th></tr>
                <tr><td><code>public class Main</code></td><td>Java mein sab kuch class ke andar hota hai. <code>public</code> class ka naam file ke naam jaisa hona chahiye (<code>Main.java</code>).</td></tr>
                <tr><td><code>public static void main(String[] args)</code></td><td>Program yahin se shuru hota hai. Java 17-24 mein JVM isi signature ko dhoondhta hai. (Java 25 se, JEP 512, bina <code>static</code>/<code>public</code>/args wala <code>void main()</code> bhi chal jaata hai; is site ka runner Java 17 hai.)</td></tr>
                <tr><td><code>static</code></td><td>Object banaye bina call ho sakta hai. JVM ke paas shuru mein koi object nahi hota, isliye main static hai.</td></tr>
                <tr><td><code>void</code></td><td>Ye method kuch return nahi karta.</td></tr>
                <tr><td><code>String[] args</code></td><td>Command line se aane wale arguments.</td></tr>
                <tr><td><code>System.out.println(...)</code></td><td>Console pe print karo aur nayi line.</td></tr>
              </table>`
    },
    {
      type: "quiz",
      q: "<code>javac Main.java</code> chalane ke baad kya banta hai?",
      options: [
        "Main.exe (Windows ka program)",
        "Main.class jisme bytecode hota hai",
        "Seedha machine code jo CPU chalata hai",
        "Kuch nahi, javac code ko seedha run karta hai"
      ],
      answer: 1,
      why: "javac bytecode wali <code>.class</code> file banata hai. Usko <code>java Main</code> (JVM) chalata hai. Machine code JVM ka JIT runtime pe banata hai."
    },
    {
      type: "code",
      expectError: true,
      title: "Error padhna seekho: is code mein 2 galtiyan hain. Run karo, error padho, theek karo.",
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Line 1")
        system.out.println("Line 2");
    }
}`,
      note: "Pehli galti: semicolon. Doosri: Java case-sensitive hai, <code>system</code> aur <code>System</code> alag hain. Error mein line number dekho, laal line editor mein bhi dikhegi."
    },
    {
      type: "exercise",
      id: "ex-intro",
      title: "Apna intro print karo",
      level: "Easy",
      task: `<p>Aisa program likho jo <b>exactly</b> ye 3 lines print kare:</p><pre class='code-static'>Naam: Coder
Goal: Senior SWE
Days left: 90</pre>`,
      starter: `public class Main {
    public static void main(String[] args) {
        // yahan likho
    }
}`,
      expectedOutput: `Naam: Coder
Goal: Senior SWE
Days left: 90`,
      hints: [
        "Har line ke liye ek <code>System.out.println(\"...\");</code>",
        "Spelling, capital letters aur colon ke baad space dhyaan se dekho."
      ],
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Naam: Coder");
        System.out.println("Goal: Senior SWE");
        System.out.println("Days left: " + 90);
    }
}`,
      explain: "<code>\"Days left: \" + 90</code>: String ke saath <code>+</code> lagane se number bhi text ban jaata hai (string concatenation)."
    },
    {
      type: "think",
      id: "think-platform",
      q: "Interview question: <b>\"Java platform independent kaise hai, jabki C/C++ nahi hai?\"</b> Apne shabdon mein samjhao.",
      rubric: [
        {
          point: "javac code ko <b>bytecode</b> (.class) mein compile karta hai, machine code mein nahi",
          keys: [
            "bytecode",
            "byte code",
            ".class",
            "class file"
          ],
          weight: 2
        },
        {
          point: "Har OS/CPU ke liye <b>alag JVM</b> hota hai jo same bytecode chalata hai",
          keys: [
            "jvm",
            "virtual machine"
          ],
          weight: 2
        },
        {
          point: "Isliye <b>ek baar compile, kahin bhi chalao</b> (Write Once, Run Anywhere)",
          keys: [
            "anywhere",
            "kahin bhi",
            "kisi bhi",
            "any os",
            "har os",
            "once",
            "ek baar"
          ]
        },
        {
          point: "C/C++ seedha <b>machine code</b> banata hai jo ek hi OS/CPU ke liye hota hai",
          keys: [
            "machine code",
            "native",
            ".exe",
            "har platform ke liye compile",
            "recompile",
            "dobara compile"
          ]
        },
        {
          point: "Bonus: JVM khud platform <b>dependent</b> hai",
          keys: [
            "jvm platform dependent",
            "jvm dependent",
            "jvm alag",
            "jvm khud"
          ]
        }
      ],
      answer: `<p>C/C++ ka compiler seedha <b>machine code</b> banata hai, jo ek specific OS + CPU ke liye hota hai. Windows ka .exe Mac pe nahi chalega, wahan dobara compile karna padega.</p>
                <p>Java ka <code>javac</code> <b>bytecode</b> banata hai, jo kisi CPU ki bhasha nahi hai. Har platform ke liye ek alag <b>JVM</b> banta hai (Windows JVM, Mac JVM, Linux JVM), aur wo JVM same <code>.class</code> file ko chala leta hai. Isliye "Write Once, Run Anywhere".</p>
                <p><b>Bonus point:</b> Java program platform independent hai, par <b>JVM khud platform dependent</b> hai. Interviewer ye sun ke khush hota hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Definition ratne ke bajaye flow batao: <i>source → javac → bytecode → JVM (interpreter + JIT) → machine code</i>. Flow samjhaoge to follow-up questions (JIT kya hai? JVM kya karta hai?) bhi aasan lagenge."
    }
  ],
  references: [
    { title: "Getting Started with Java", by: "dev.java", url: "https://dev.java/learn/getting-started/", type: "docs" },
    { title: "javac: the Java compiler", by: "dev.java", url: "https://dev.java/learn/jvm/tools/core/javac/", type: "docs" },
    { title: "About the Java Technology (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/getStarted/intro/index.html", type: "docs" },
    { title: "JVM Specification 17, Chapter 2: Structure of the JVM", by: "Oracle", url: "https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-2.html", type: "docs" }
  ]
});
