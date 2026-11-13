// Thread banana
registerLesson("concurrency", "create-threads", {
  why: "'start() aur run() mein kya farak hai?' aur 'Runnable kyun, extends Thread kyun nahi?' fresher se senior tak har level pe poocha jaata hai. Saath mein join aur daemon threads ka behaviour bhi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Thread banane ke 3 tareeke</h2>
        <p>Java mein thread = <code>java.lang.Thread</code> ka object. Usko batana padta hai ki <b>kya kaam</b> karna hai. Ye kaam <code>run()</code> method mein hota hai.</p>
        <pre class="code-static">// 1. Thread class extend karo
class Downloader extends Thread {
    public void run() { /* kaam */ }
}
new Downloader().start();

// 2. Runnable implement karo, Thread ko do
class Task implements Runnable {
    public void run() { /* kaam */ }
}
new Thread(new Task()).start();

// 3. Lambda (Runnable ek functional interface hai)
new Thread(() -&gt; System.out.println("hi")).start();</pre>
        <table>
          <tr><th></th><th>extends Thread</th><th>implements Runnable / lambda</th></tr>
          <tr><td>Doosri class extend kar sakte ho?</td><td>Nahi (Java mein single inheritance)</td><td>Haan</td></tr>
          <tr><td>Kaam aur thread alag?</td><td>Nahi, dono ek hi class mein</td><td>Haan: kaam (Runnable) alag, chalane wala (Thread) alag</td></tr>
          <tr><td>Thread pool (ExecutorService) ko de sakte ho?</td><td>Technically haan (Thread bhi Runnable hai), par galat design</td><td>Haan, yahi normal tareeka hai</td></tr>
          <tr><td>Kab use karein</td><td>Lagbhag kabhi nahi</td><td>Hamesha. Production mein seedha pool ko Runnable/Callable do</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "Teeno tareeke + join(): har thread apna result alag slot mein likhta hai",
      code: `public class Main {
    static String[] results = new String[3];

    static class Downloader extends Thread {
        Downloader() { super("downloader"); }
        @Override
        public void run() {
            results[0] = "1. extends Thread, chala: " + getName();
        }
    }

    static class Resizer implements Runnable {
        @Override
        public void run() {
            results[1] = "2. Runnable, chala: " + Thread.currentThread().getName();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread a = new Downloader();
        Thread b = new Thread(new Resizer(), "resizer");
        Thread c = new Thread(() -> results[2] = "3. lambda, chala: " + Thread.currentThread().getName(), "notifier");

        a.start();
        b.start();
        c.start();

        // join() = "jab tak ye thread khatam na ho, main yahin ruko"
        a.join();
        b.join();
        c.join();

        for (String r : results) System.out.println(r);
        System.out.println("Main ab aage badha, thread: " + Thread.currentThread().getName());
    }
}`,
      note: "Threads kis order mein chalenge, ye pakka nahi hai. Isliye har thread ne alag slot mein likha aur main ne <code>join()</code> ke baad ek fixed order mein print kiya. Output har baar same aayega."
    },
    {
      type: "warn",
      html: "⚠️ <b>Interview trap: start() vs run()</b><br><code>t.start()</code> JVM se <b>naya thread</b> banwata hai, aur wo naya thread <code>run()</code> chalata hai.<br><code>t.run()</code> sirf ek normal method call hai: kaam <b>usi current thread</b> (jaise main) pe chalta hai, koi naya thread nahi banta, aur main tab tak ruka rehta hai."
    },
    {
      type: "code",
      title: "start() vs run(): kis thread ne kaam kiya?",
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Runnable job = () -> System.out.println("Kaam chal raha hai thread: " + Thread.currentThread().getName());

        Thread t1 = new Thread(job, "worker-1");
        t1.run();    // galat: main hi kaam karega
        System.out.println("run() ke baad t1 ki state: " + t1.getState() + " (thread kabhi start hi nahi hua)");

        Thread t2 = new Thread(job, "worker-2");
        t2.start();  // sahi: naya thread
        t2.join();
        System.out.println("start() + join() ke baad t2 ki state: " + t2.getState());

        try {
            t2.start(); // ek thread ko dobara start nahi kar sakte
        } catch (IllegalThreadStateException e) {
            System.out.println("Dobara start(): " + e.getClass().getSimpleName());
        }
    }
}`
    },
    {
      type: "quiz",
      q: "Ye code kya print karega?<pre class='code-static'>Thread t = new Thread(() -&gt; System.out.print(Thread.currentThread().getName() + \" \"), \"T\");\nt.run();\nt.start();\nt.join();</pre>",
      options: [
        "<code>T T</code>",
        "<code>main T</code>",
        "<code>main main</code>",
        "<code>T</code> phir IllegalThreadStateException"
      ],
      answer: 1,
      why: "<code>run()</code> current thread (main) pe chalta hai, isliye pehle <code>main</code>. Phir <code>start()</code> naya thread \"T\" banata hai. <code>run()</code> call karne se thread \"started\" nahi maana jaata, isliye <code>start()</code> pe exception nahi aata."
    },
    {
      type: "steps",
      title: "Timeline: main 2 threads start karta hai, phir join karta hai",
      steps: [
        {
          title: "Step 1: main ne T1.start() aur T2.start() kiya",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>main</th><td class="run">start T1, T2</td><td></td><td></td></tr>
            <tr><th>T1</th><td></td><td class="run">kaam</td><td></td></tr>
            <tr><th>T2</th><td></td><td class="run">kaam</td><td></td></tr>
          </table><p><code>start()</code> turant return karta hai. Main ruka nahi.</p>`
        },
        {
          title: "Step 2: main ne T1.join() kiya, T1 abhi chal raha hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>main</th><td class="run">start T1, T2</td><td class="wait">join(T1): WAITING</td><td class="wait">WAITING</td><td></td></tr>
            <tr><th>T1</th><td></td><td class="run">kaam</td><td class="run">kaam</td><td>khatam</td></tr>
            <tr><th>T2</th><td></td><td class="run">kaam</td><td>khatam</td><td></td></tr>
          </table><p>Main tab tak WAITING state mein hai jab tak T1 khatam na ho.</p>`
        },
        {
          title: "Step 3: T1 khatam, main T2.join() karta hai (T2 pehle hi khatam)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t4</td><td>t5</td></tr>
            <tr><th>main</th><td class="run">join(T2) turant return</td><td class="run">results print</td></tr>
            <tr><th>T1</th><td>TERMINATED</td><td></td></tr>
            <tr><th>T2</th><td>TERMINATED</td><td></td></tr>
          </table><p>Jo thread pehle se khatam hai, uska <code>join()</code> turant return hota hai. Total wait = sabse slow thread ka time.</p>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>sleep, join aur daemon threads</h2>
        <table>
          <tr><th>Method</th><th>Kya karta hai</th><th>Yaad rakho</th></tr>
          <tr><td><code>Thread.sleep(ms)</code></td><td>Current thread ko itni der rok do</td><td>Koi lock <b>chhodta nahi</b>. <code>InterruptedException</code> throw kar sakta hai.</td></tr>
          <tr><td><code>t.join()</code></td><td>t ke khatam hone tak ruko</td><td><code>join(ms)</code> = max itni der ruko, phir aage badho</td></tr>
          <tr><td><code>t.setDaemon(true)</code></td><td>Background helper thread</td><td><code>start()</code> se <b>pehle</b> set karo. JVM daemon threads ka wait nahi karti.</td></tr>
        </table>
        <p><b>Daemon kya hai:</b> JVM tab exit karti hai jab saare <b>non-daemon</b> threads khatam ho jaayein. Daemon threads (jaise GC) beech mein hi maar diye jaate hain. Isliye daemon thread mein file likhna ya DB transaction mat karo, kaam adhoora reh sakta hai.</p>`
    },
    {
      type: "code",
      title: "join(timeout) aur daemon thread: main daemon ka wait nahi karta",
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread heartbeat = new Thread(() -> {
            for (int i = 0; i < 20; i++) {          // ~1 second ka background kaam
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    return;
                }
            }
        }, "heartbeat");
        heartbeat.setDaemon(true);                   // start() se pehle!
        heartbeat.start();

        heartbeat.join(120);                         // max 120ms ruko, phir aage badho
        System.out.println("120ms baad heartbeat zinda hai? " + heartbeat.isAlive());
        System.out.println("Daemon hai? " + heartbeat.isDaemon());
        System.out.println("main khatam. JVM daemon thread ka wait nahi karegi.");
    }
}`
    },
    {
      type: "exercise",
      id: "ex-worker-names",
      title: "N worker threads: naam collect karo",
      level: "Easy",
      task: `<p><code>workerNames(n)</code> mein <code>n</code> threads banao jinke naam <code>"worker-0"</code>, <code>"worker-1"</code>, ... hon. Har thread <b>apne andar se</b> <code>Thread.currentThread().getName()</code> list mein add kare. Saare threads khatam hone ke baad list return karo (order matter nahi karta).</p>
        <p>Starter code chalta hai par ek classic galti hai. Run karke dekho list mein kya aa raha hai.</p>`,
      examples: "<code>workerNames(3)</code> → <code>[\"worker-0\", \"worker-1\", \"worker-2\"]</code> (kisi bhi order mein)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<String> workerNames(int n) throws InterruptedException {
        List<String> names = Collections.synchronizedList(new ArrayList<>());
        for (int i = 0; i < n; i++) {
            Thread t = new Thread(() -> names.add(Thread.currentThread().getName()), "worker-" + i);
            t.run();
        }
        return names;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<String> run(Solution s, int n) {
        try {
            return s.workerNames(n);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    static List<String> expected(int n) {
        List<String> out = new ArrayList<>();
        for (int i = 0; i < n; i++) out.add("worker-" + i);
        return out;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eqAnyOrder("n=3", expected(3), () -> run(s, 3));
        Check.eqAnyOrder("n=1", expected(1), () -> run(s, 1));
        Check.hiddenFromHere();
        Check.eqAnyOrder("n=0 (koi thread nahi)", expected(0), () -> run(s, 0));
        Check.eqAnyOrder("n=50 (saare threads join hone chahiye)", expected(50), () -> run(s, 50));
        Check.eq("n=50 ke baad size", 50, () -> run(s, 50).size());
    }
}`,
      hints: [
        "List mein \"main\" aa raha hai? Matlab kaam main thread pe chala. Kaunsa method naya thread banata hai?",
        "<code>start()</code> karoge to threads ek saath chalenge. Return se pehle sabka wait karna padega.",
        "Threads ko ek <code>List&lt;Thread&gt;</code> mein rakho: pehle sab <code>start()</code>, phir loop mein sab <code>join()</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<String> workerNames(int n) throws InterruptedException {
        List<String> names = Collections.synchronizedList(new ArrayList<>());
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            Thread t = new Thread(() -> names.add(Thread.currentThread().getName()), "worker-" + i);
            threads.add(t);
            t.start();               // naya thread
        }
        for (Thread t : threads) t.join(); // sabke khatam hone ka wait
        return names;
    }
}`,
      explain: "<p>Do galtiyan theek ki: <code>run()</code> ki jagah <code>start()</code>, aur return se pehle sab threads ka <code>join()</code>. Bina join ke list adhoori aa sakti thi, kyunki threads abhi kaam kar rahe hote.</p><p><code>Collections.synchronizedList</code> isliye ki kai threads ek saath <code>add</code> kar rahe hain. Plain <code>ArrayList</code> pe ek saath add karna safe nahi (race condition lesson).</p>"
    },
    {
      type: "think",
      id: "think-runnable-vs-thread",
      q: "Interview question: <b>\"Thread banane ke liye extends Thread better hai ya implements Runnable? Aur start() ki jagah run() call kar diya to kya hoga?\"</b>",
      rubric: [
        { point: "<b>Runnable</b> better: class doosri class extend kar sakti hai (single inheritance)", keys: ["single inheritance", "extend nahi", "multiple inheritance", "doosri class", "another class", "inheritance"], weight: 2 },
        { point: "Kaam (task) aur chalane wala (thread) <b>alag</b>: same Runnable pool/executor ko de sakte ho", keys: ["executor", "pool", "decouple", "alag", "separate", "reuse"] },
        { point: "<code>run()</code> = normal method call, <b>current thread</b> pe chalta hai, naya thread nahi", keys: ["same thread", "current thread", "main thread", "naya thread nahi", "normal method", "no new thread"], weight: 2 },
        { point: "<code>start()</code> naya thread banata hai; ek thread ko dobara start karne pe <b>IllegalThreadStateException</b>", keys: ["illegalthreadstate", "dobara start", "twice", "do baar"] }
      ],
      answer: `<p><b>implements Runnable</b> (ya lambda) better hai. Kyun: (1) Java mein ek hi class extend kar sakte ho, Runnable ke saath class free rehti hai. (2) Kaam aur thread alag rehte hain, to wahi Runnable <code>ExecutorService</code> ko de sakte ho. Production mein hum khud threads banate hi nahi, pool ko task dete hain.</p>
        <p><b>run() call kiya to</b> koi naya thread nahi banta. Code usi thread pe chalta hai jisne call kiya (jaise main), aur caller tab tak ruka rehta hai. <code>start()</code> JVM se naya thread banwata hai jo <code>run()</code> chalata hai. Ek Thread object ko do baar <code>start()</code> karoge to <code>IllegalThreadStateException</code>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Jab bhi thread ka code likho, interviewer dekhta hai ki aapne <code>join()</code> ya koi wait mechanism lagaya ya nahi. Result padhne se pehle wait karna, aur result ko threads ke beech safely share karna (alag slot, synchronized list, ya Future), dono dikhao."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Defining and Starting a Thread", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/runthread.html", type: "docs" },
    { title: "Oracle Java Tutorial: Joins", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/join.html", type: "docs" },
    { title: "java.lang.Thread (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Thread.html", type: "docs" }
  ]
});
