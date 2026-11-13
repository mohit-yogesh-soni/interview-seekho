// Process vs Thread, concurrency vs parallelism
registerLesson("concurrency", "process-thread", {
  why: "Har concurrency interview yahin se shuru hota hai: 'process aur thread mein kya farak hai?', 'concurrency aur parallelism same hai?'. Ye base clear nahi hai to locks, pools aur race conditions samajh nahi aayenge.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Process = chalta hua program, Thread = uske andar kaam karne wala</h2>
        <p>Jab aap Chrome ya IntelliJ kholte ho, OS ek <b>process</b> banata hai. Process ke paas apni <b>alag memory</b> hoti hai (heap, code, open files). Ek process doosre process ki memory seedha nahi padh sakta.</p>
        <p>Process ke andar ek ya zyada <b>threads</b> hote hain. Thread = execution ka ek rasta (apna program counter + apna stack). Ek process ke saare threads <b>same heap share</b> karte hain.</p>
        <pre class="diagram">
+------------------- Process (JVM) --------------------+
|  Heap (shared): objects, static fields               |
|                                                      |
|  +-- Thread main --+  +-- Thread T1 --+  +-- T2 --+  |
|  | stack, PC       |  | stack, PC     |  | stack  |  |
|  +-----------------+  +---------------+  +--------+  |
+------------------------------------------------------+
     Process B (alag memory, seedha access nahi)</pre>
        <table>
          <tr><th></th><th>Process</th><th>Thread</th></tr>
          <tr><td>Memory</td><td>Apni alag address space</td><td>Process ki heap share, stack apna</td></tr>
          <tr><td>Banane ka cost</td><td>Zyada (OS ko poori memory setup karni padti hai)</td><td>Kam</td></tr>
          <tr><td>Baat-cheet</td><td>IPC: pipes, sockets, files</td><td>Shared objects (isi se race conditions aati hain)</td></tr>
          <tr><td>Crash</td><td>Ek process crash = doosre safe</td><td>Ek thread ki galti (jaise OutOfMemoryError) poore process ko gira sakti hai</td></tr>
          <tr><td>Example</td><td>Chrome ka har tab alag process</td><td>Tomcat ka har request ek thread pe</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>CPU, cores aur context switch</h2>
        <p>Ek <b>hardware thread</b> (logical CPU) ek time pe ek hi software thread chala sakta hai. Simple maano har core = ek hardware thread: 4 core = ek saath max 4 threads. (Hyper-Threading/SMT wale CPU mein har core 2 hardware threads deta hai, jaise 4 core / 8 threads; <code>Runtime.availableProcessors()</code> yahi logical count batata hai.) Baaki threads line mein wait karte hain.</p>
        <p>OS ka <b>scheduler</b> har thread ko chhota time slice deta hai (milliseconds). Slice khatam → thread ko rok ke doosra chalao. Isko <b>context switch</b> kehte hain: registers, program counter save karo, doosre thread ke load karo. Ye free nahi hai: CPU cache bhi thanda ho jaata hai.</p>
        <p>Isliye 4 core pe 1000 CPU-heavy threads banana tez nahi karta. Zyada time switching mein jaata hai.</p>`
    },
    {
      type: "steps",
      title: "Concurrency vs Parallelism: 1 core vs 2 cores pe do kaam (A aur B)",
      steps: [
        {
          title: "1 core: concurrency (bari bari)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td><td>t6</td></tr>
            <tr><th>Core 1</th><td class="run">A</td><td class="run">B</td><td class="run">A</td><td class="run">B</td><td class="run">A</td><td class="run">B</td></tr>
          </table>
          <p>Dono kaam "chal rahe" lagte hain, par kisi bhi ek pal mein sirf ek chal raha hai. Ye <b>concurrency</b> hai: kaam ko aise structure karna ki wo overlap ho sakein.</p>`
        },
        {
          title: "2 cores: parallelism (sach mein ek saath)",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>Core 1</th><td class="run">A</td><td class="run">A</td><td class="run">A</td></tr>
            <tr><th>Core 2</th><td class="run">B</td><td class="run">B</td><td class="run">B</td></tr>
          </table>
          <p>Ab A aur B same pal mein chal rahe hain. Ye <b>parallelism</b> hai. Total time half.</p>`
        },
        {
          title: "I/O wait: 1 core pe bhi fayda",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>Thread A</th><td class="run">CPU</td><td class="wait">DB wait</td><td class="wait">DB wait</td><td class="run">CPU</td><td></td></tr>
            <tr><th>Thread B</th><td></td><td class="run">CPU</td><td class="wait">API wait</td><td class="wait">API wait</td><td class="run">CPU</td></tr>
          </table>
          <p>Jab A database ka wait kar raha hai (CPU khaali), tab B chal leta hai. Isliye I/O-bound kaam mein threads ek core pe bhi throughput badhate hain.</p>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Kab threads se fayda hai: I/O bound vs CPU bound</h2>
        <table>
          <tr><th></th><th>I/O bound</th><th>CPU bound</th></tr>
          <tr><td>Time kahan jaata hai</td><td>Network, DB, disk ka wait</td><td>Calculation (hashing, image resize, sorting)</td></tr>
          <tr><td>Example</td><td>Swiggy order page: user, restaurant, offers service ko call</td><td>Video thumbnail banana, PDF report generate</td></tr>
          <tr><td>Kitne threads</td><td>Cores se kaafi zyada chal sakte hain (zyada time wait mein)</td><td>Lagbhag cores jitne. Zyada = context switch ka nuksaan</td></tr>
        </table>
        <p>Rule of thumb (Brian Goetz, <i>Java Concurrency in Practice</i> se idea): <code>threads ≈ cores × (1 + wait time / compute time)</code>. Executors lesson mein isko detail mein dekhenge.</p>`
    },
    {
      type: "code",
      title: "I/O-bound kaam: 3 'API calls' (sleep 200ms) sequential vs 3 threads",
      code: `public class Main {
    static void fakeApiCall() {
        try {
            Thread.sleep(200); // network ka wait jaisa, CPU khaali
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("Cores (JVM ko dikh rahe): " + Runtime.getRuntime().availableProcessors());
        System.out.println("Main kis thread pe hai: " + Thread.currentThread().getName());

        long t0 = System.currentTimeMillis();
        for (int i = 0; i < 3; i++) fakeApiCall();
        long seq = System.currentTimeMillis() - t0;

        t0 = System.currentTimeMillis();
        Thread[] ts = new Thread[3];
        for (int i = 0; i < 3; i++) {
            ts[i] = new Thread(Main::fakeApiCall);
            ts[i].start();
        }
        for (Thread t : ts) t.join(); // sabke khatam hone ka wait
        long par = System.currentTimeMillis() - t0;

        System.out.println("Sequential ~600ms laga? " + (seq >= 590));
        System.out.println("Threads se kam laga? " + (par < seq));
        System.out.println("Sequential: " + seq + " ms, threads: " + par + " ms (exact number machine pe depend)");
    }
}`,
      note: "Browser wala JVM aksar 1 core dikhata hai, phir bhi threads wala version tez hai, kyunki sleep (I/O wait) mein CPU khaali hota hai. Exact ms har run mein thoda alag aayega."
    },
    {
      type: "quiz",
      q: "4-core machine pe ek CPU-heavy kaam (image compression) hai. Aap 4 threads ki jagah 400 threads bana dete ho. Kya hoga?",
      options: [
        "100 guna tez, kyunki 100 guna threads",
        "Lagbhag 4 threads jitna hi ya thoda slow, kyunki ek saath sirf 4 chal sakte hain aur baaki context switching mein time jaata hai",
        "Compile error, JVM 400 threads allow nahi karta",
        "Tez, kyunki har thread ka apna CPU cache hota hai"
      ],
      answer: 1,
      why: "CPU-bound kaam ke liye cores hi limit hain. Extra threads sirf queue mein khade hote hain, aur context switch + memory (har thread ka stack) ka kharcha badhta hai."
    },
    {
      type: "pick",
      id: "pick-io-bound",
      q: "Inme se kaunse kaam <b>I/O bound</b> hain (jahan cores se zyada threads bhi fayda dete hain)?",
      options: [
        { text: "Payment gateway ko HTTP call karke response ka wait", correct: true, why: "Zyada time network wait mein jaata hai." },
        { text: "MySQL se 50 queries chalana", correct: true, why: "DB round trip ka wait, CPU khaali." },
        { text: "10 lakh numbers ko sort karna (memory mein)", correct: false, why: "Pura CPU kaam hai, cores jitne threads kaafi." },
        { text: "S3 se files download karna", correct: true, why: "Network I/O." },
        { text: "SHA-256 se 1 crore passwords hash karna", correct: false, why: "CPU bound. Threads = cores ke aas paas rakho." }
      ],
      answer: "Rule: agar thread ka zyada time <b>wait</b> mein jaata hai to I/O bound. Agar zyada time <b>calculation</b> mein to CPU bound."
    },
    {
      type: "exercise",
      id: "ex-parallel-sum",
      title: "Array ka sum, N threads mein baant ke",
      level: "Easy",
      task: `<p><code>parallelSum(arr, nThreads)</code> likho. Array ko <code>nThreads</code> hisson mein baanto, har hissa ek alag thread jode, phir sab partial sums jod ke total return karo.</p>
        <ul>
          <li>Har thread apna result ek alag slot mein likhe (<code>long[] partial</code>), taaki do threads same variable na chhuyein.</li>
          <li>Total padhne se pehle saare threads ka <code>join()</code> karo.</li>
          <li>Sum <code>long</code> mein rakho (bade numbers).</li>
        </ul>`,
      examples: "<code>parallelSum([1..10], 3)</code> → <code>55</code><br><code>parallelSum([5], 4)</code> → <code>5</code> (kuch threads ko khaali hissa milega)",
      userFile: "Solution.java",
      starter: `class Solution {
    long parallelSum(int[] arr, int nThreads) throws InterruptedException {
        // TODO: nThreads threads banao, har ek apna hissa jode, phir join karke total do
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static long run(Solution s, int[] a, int n) {
        try {
            return s.parallelSum(a, n);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    static int[] range(int from, int to) {
        int[] a = new int[to - from + 1];
        for (int i = 0; i < a.length; i++) a[i] = from + i;
        return a;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("arr=[1..10], nThreads=3", 55L, () -> run(s, range(1, 10), 3));
        Check.eq("arr=[5], nThreads=4", 5L, () -> run(s, new int[]{5}, 4));
        Check.hiddenFromHere();
        Check.eq("empty array, nThreads=2", 0L, () -> run(s, new int[0], 2));
        Check.eq("nThreads=1", 15L, () -> run(s, range(1, 5), 1));
        Check.eq("negative numbers", -3L, () -> run(s, new int[]{-5, 2, -1, 1}, 3));
        Check.eq("nThreads > arr.length", 6L, () -> run(s, new int[]{1, 2, 3}, 8));
        int[] big = new int[1_000_000];
        Arrays.fill(big, 1_000_000);
        Check.eq("10 lakh x 10 lakh (long chahiye)", 1_000_000_000_000L, () -> run(s, big, 4));
    }
}`,
      hints: [
        "Chunk size: <code>(arr.length + nThreads - 1) / nThreads</code>. Thread i ka range <code>[i*chunk, min(n, i*chunk+chunk))</code>.",
        "Lambda ke andar loop variable seedha use nahi kar sakte. <code>final int id = t;</code> jaisi copy banao.",
        "Saare threads pehle <code>start()</code> karo, phir alag loop mein <code>join()</code> karke <code>partial[t]</code> jodo."
      ],
      solution: `class Solution {
    long parallelSum(int[] arr, int nThreads) throws InterruptedException {
        long[] partial = new long[nThreads];
        Thread[] threads = new Thread[nThreads];
        int chunk = (arr.length + nThreads - 1) / nThreads;
        for (int t = 0; t < nThreads; t++) {
            final int id = t;
            final int from = Math.min(arr.length, t * chunk);
            final int to = Math.min(arr.length, from + chunk);
            threads[t] = new Thread(() -> {
                long sum = 0;
                for (int i = from; i < to; i++) sum += arr[i];
                partial[id] = sum; // har thread ka apna slot
            });
            threads[t].start();
        }
        long total = 0;
        for (int t = 0; t < nThreads; t++) {
            threads[t].join(); // join ke baad partial[t] dikhna guaranteed hai
            total += partial[t];
        }
        return total;
    }
}`,
      explain: "<p>Har thread alag slot mein likhta hai, isliye koi shared variable nahi aur koi lock nahi chahiye. <code>join()</code> do kaam karta hai: thread ke khatam hone ka wait, aur ye guarantee ki thread ne jo likha wo main thread ko dikhega (happens-before, volatile lesson mein).</p><p>Time O(n / threads) kaam per thread + O(threads) jodna. Space O(threads).</p>"
    },
    {
      type: "think",
      id: "think-proc-thread",
      q: "Interview question: <b>\"Process aur thread mein kya farak hai? Chrome har tab ke liye alag process kyun banata hai, thread kyun nahi?\"</b>",
      rubric: [
        { point: "Process ki <b>alag memory/address space</b>, threads <b>heap share</b> karte hain (stack apna)", keys: ["memory", "address space", "heap", "share", "shared"], weight: 2 },
        { point: "Thread banana aur switch karna <b>sasta</b>, process mehenga", keys: ["sasta", "cheap", "lightweight", "halka", "cost", "mehenga", "heavy"] },
        { point: "Threads ke beech communication shared objects se, process ke beech <b>IPC</b>", keys: ["ipc", "pipe", "socket", "inter process"] },
        { point: "<b>Isolation</b>: ek tab crash ho to baaki tabs bach jaate hain", keys: ["isolation", "isolate", "crash", "alag rehta", "affect nahi"], weight: 2 },
        { point: "Security: ek tab ki website doosre tab ki memory nahi padh sakti (sandbox)", keys: ["security", "sandbox", "secure", "safe"] }
      ],
      answer: `<p><b>Process</b> ek chalta program hai jiski apni address space hoti hai. <b>Thread</b> process ke andar execution ka rasta hai: apna stack aur program counter, par heap process ke baaki threads ke saath shared.</p>
        <p>Isliye threads sasta aur tez communicate karte hain (same objects), par isi sharing se race conditions aati hain. Process mehenga hai par <b>isolated</b> hai.</p>
        <p>Chrome tabs ko process isliye banata hai: ek tab ki buggy JavaScript crash ho to sirf wo tab marta hai, aur ek site doosri site ki memory nahi padh sakti (security sandbox). Yahan isolation, speed se zyada important hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Concurrency vs parallelism ek line mein: <i>concurrency = bahut kaam ko deal karna (structure), parallelism = bahut kaam ek saath karna (execution)</i>. Phir 1-core example do: concurrency 1 core pe bhi hoti hai, parallelism ke liye multiple cores chahiye."
    }
  ],
  references: [
    { title: "Oracle Java Tutorial: Processes and Threads", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html", type: "docs" },
    { title: "Java Concurrency in Practice", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" },
    { title: "java.lang.Thread (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Thread.html", type: "docs" }
  ]
});
