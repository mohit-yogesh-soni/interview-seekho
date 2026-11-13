// Thread lifecycle aur interrupt
registerLesson("concurrency", "thread-lifecycle", {
  why: "Thread dump (jstack) padhne ke liye states samajhna zaroori hai: BLOCKED matlab lock ka intezaar, WAITING matlab kisi signal ka. Aur 'thread ko safely kaise rokoge?' ka sahi jawab interrupt() hai, stop() nahi.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Thread ki 6 states (<code>Thread.State</code> enum)</h2>
        <table>
          <tr><th>State</th><th>Matlab</th><th>Kaise pahunchta hai</th></tr>
          <tr><td><code>NEW</code></td><td>Object bana, start nahi hua</td><td><code>new Thread(...)</code></td></tr>
          <tr><td><code>RUNNABLE</code></td><td>Chal raha hai ya CPU milne ka ready hai</td><td><code>start()</code>. Note: JVM ke liye socket read pe atka thread bhi RUNNABLE dikhta hai</td></tr>
          <tr><td><code>BLOCKED</code></td><td><b>Monitor lock</b> (synchronized) ka intezaar</td><td>Doosre thread ke paas lock hai aur ye <code>synchronized</code> mein ghusna chahta hai</td></tr>
          <tr><td><code>WAITING</code></td><td>Bina time limit ke kisi doosre thread ka intezaar</td><td><code>wait()</code>, <code>join()</code>, <code>LockSupport.park()</code> (ReentrantLock bhi isi se)</td></tr>
          <tr><td><code>TIMED_WAITING</code></td><td>Time limit ke saath intezaar</td><td><code>sleep(ms)</code>, <code>wait(ms)</code>, <code>join(ms)</code></td></tr>
          <tr><td><code>TERMINATED</code></td><td><code>run()</code> khatam (normally ya exception se)</td><td>Dobara start nahi ho sakta</td></tr>
        </table>
        <pre class="diagram">
 NEW --start()--> RUNNABLE ------------------------> TERMINATED
                  |  ^   \\  run() khatam
   synchronized   |  |    \\ wait()/join()/sleep(ms)
   lock busy      v  |     v
               BLOCKED   WAITING / TIMED_WAITING
                  ^          |
                  +----------+  notify() ke baad lock wapas chahiye</pre>
        <p>Dhyaan do: Java mein alag se "RUNNING" state nahi hai. Chal raha aur chalne ko ready, dono <code>RUNNABLE</code> hain.</p>`
    },
    {
      type: "code",
      title: "Ek thread ko saari states se guzarte dekho (deterministic: har state ka wait karke print)",
      code: `public class Main {
    // Thread ki state 'want' hone tak thoda thoda ruko (max ~1s)
    static Thread.State waitFor(Thread t, Thread.State want) throws InterruptedException {
        for (int i = 0; i < 200 && t.getState() != want; i++) Thread.sleep(5);
        return t.getState();
    }

    public static void main(String[] args) throws InterruptedException {
        Object lock = new Object();
        Thread worker = new Thread(() -> {
            synchronized (lock) {              // main ke paas lock hai, to pehle BLOCKED
                try {
                    lock.wait();               // lock chhodo aur signal ka wait: WAITING
                    Thread.sleep(5000);        // TIMED_WAITING (main interrupt karke jaldi uthayega)
                } catch (InterruptedException e) {
                    System.out.println("   worker: interrupt mila, kaam chhod ke nikal raha hoon");
                }
            }
        }, "worker");

        System.out.println("1. new ke baad:            " + worker.getState());
        System.out.println("   main khud:              " + Thread.currentThread().getState());
        synchronized (lock) {
            worker.start();
            System.out.println("2. lock busy:              " + waitFor(worker, Thread.State.BLOCKED));
        }
        System.out.println("3. lock.wait() ke andar:   " + waitFor(worker, Thread.State.WAITING));
        synchronized (lock) {
            lock.notify();
        }
        System.out.println("4. sleep(5000) ke andar:   " + waitFor(worker, Thread.State.TIMED_WAITING));
        worker.interrupt();
        worker.join();
        System.out.println("5. join ke baad:           " + worker.getState());
    }
}`
    },
    {
      type: "order",
      id: "order-states",
      q: "Ek thread <code>synchronized(lock) { lock.wait(); }</code> chalata hai, jabki shuru mein lock kisi aur ke paas hai. Baad mein koi <code>notify()</code> karta hai. States ka sahi order lagao.",
      items: [
        "NEW (object bana)",
        "RUNNABLE (start() hua)",
        "BLOCKED (lock kisi aur ke paas)",
        "RUNNABLE (lock mila, andar ghusa)",
        "WAITING (lock.wait(), lock chhod diya)",
        "BLOCKED (notify mila, par lock wapas lena hai)",
        "TERMINATED (block se bahar, run() khatam)"
      ],
      why: "<code>notify()</code> ke baad thread turant nahi chalta. Use pehle wahi monitor lock dobara chahiye, isliye beech mein BLOCKED aata hai. Thread dump mein ye pattern bahut dikhta hai."
    },
    {
      type: "text",
      html: `
        <h2>Thread ko rokna: interrupt() ka sahi use</h2>
        <p><code>Thread.stop()</code> deprecated hai. Wo thread ko kisi bhi line pe maar deta hai, locks chhut jaate hain aur objects aadhe-adhoore state mein reh jaate hain. Isliye Java ka tareeka <b>cooperative</b> hai:</p>
        <ol>
          <li><code>t.interrupt()</code> thread pe ek <b>flag</b> set karta hai. Bas itna. Thread ko zabardasti nahi rokta.</li>
          <li>Agar thread <code>sleep</code>/<code>wait</code>/<code>join</code> mein hai, to wo turant <code>InterruptedException</code> ke saath uthta hai, aur <b>flag clear ho jaata hai</b>.</li>
          <li>Thread ka code khud flag check kare (<code>Thread.currentThread().isInterrupted()</code>) aur saaf tareeke se nikle.</li>
        </ol>
        <p><b>Golden rule:</b> <code>InterruptedException</code> ko kabhi chup chaap nigalo mat. Ya to aage throw karo, ya <code>Thread.currentThread().interrupt()</code> se flag wapas set karo, taaki upar wala code jaan sake ki rukna hai.</p>
        <pre class="code-static">// GALAT: interrupt kho gaya, thread kabhi nahi rukega
catch (InterruptedException e) { }

// SAHI
catch (InterruptedException e) {
    Thread.currentThread().interrupt(); // flag wapas
    return;                             // ya loop condition flag dekh ke nikal jaaye
}</pre>`
    },
    {
      type: "code",
      title: "Interrupt: sleep ke andar exception, flag clear, phir restore",
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            int rounds = 0;
            while (!Thread.currentThread().isInterrupted()) {
                rounds++;
                try {
                    Thread.sleep(5000); // lamba kaam/wait
                } catch (InterruptedException e) {
                    System.out.println("catch mein flag: " + Thread.currentThread().isInterrupted() + " (exception ne clear kar diya)");
                    Thread.currentThread().interrupt(); // restore
                    System.out.println("restore ke baad flag: " + Thread.currentThread().isInterrupted());
                }
            }
            System.out.println("worker saaf tareeke se ruka, rounds = " + rounds);
        }, "worker");

        worker.start();
        for (int i = 0; i < 200 && worker.getState() != Thread.State.TIMED_WAITING; i++) Thread.sleep(5);
        worker.interrupt();   // sirf flag + sleep se jagao
        worker.join();
        System.out.println("main: worker state = " + worker.getState());
    }
}`
    },
    {
      type: "quiz",
      q: "Thread <code>sleep(1000)</code> mein hai. Doosra thread uspe <code>interrupt()</code> karta hai. <code>catch (InterruptedException e)</code> block ke andar <code>Thread.currentThread().isInterrupted()</code> kya return karega?",
      options: [
        "<code>true</code>, kyunki abhi abhi interrupt hua",
        "<code>false</code>, kyunki InterruptedException throw karte waqt flag clear ho jaata hai",
        "Exception aayega, catch ke andar flag check nahi kar sakte",
        "Depend karta hai, kabhi true kabhi false"
      ],
      answer: 1,
      why: "<code>sleep</code>/<code>wait</code>/<code>join</code> exception throw karke interrupt status clear kar dete hain. Isliye catch mein <code>Thread.currentThread().interrupt()</code> karke flag wapas set karte hain."
    },
    {
      type: "exercise",
      id: "ex-ticker",
      title: "Ticker jo interrupt pe ruk jaaye",
      level: "Medium",
      task: `<p><code>ticker(ticks)</code> ek <code>Runnable</code> return karta hai jo loop mein <code>ticks</code> badhata hai aur har round mein <code>Thread.sleep(5)</code> karta hai (safety ke liye max 400 rounds).</p>
        <p>Requirement: jaise hi thread pe <code>interrupt()</code> ho, ticker <b>turant</b> ruk jaaye, chahe interrupt sleep ke andar aaye ya bahar. Starter code interrupt ko nigal leta hai, isliye wo 400 rounds (~2s) tak chalta rehta hai.</p>
        <p>Test harness thread ko daemon bana ke start karta hai, thodi der baad interrupt karta hai, aur <code>join(500)</code> ke baad check karta hai ki thread ruk gaya.</p>`,
      examples: "Start → 50ms baad <code>interrupt()</code> → 500ms ke andar thread <code>TERMINATED</code>",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.atomic.AtomicInteger;

class Solution {
    Runnable ticker(AtomicInteger ticks) {
        return () -> {
            for (int i = 0; i < 400 && !Thread.currentThread().isInterrupted(); i++) {
                ticks.incrementAndGet();
                try {
                    Thread.sleep(5);
                } catch (InterruptedException e) {
                    // TODO: yahan kuch galat hai
                }
            }
        };
    }
}`,
      harness: `import seekho.Check;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static void pause(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); }
    }

    // ticker chalao, 'warmMs' baad interrupt karo, dekho 500ms mein ruka ya nahi
    static Object[] runTicker(Solution s, long warmMs, boolean waitForSleep) {
        AtomicInteger ticks = new AtomicInteger();
        Thread t = new Thread(s.ticker(ticks), "ticker");
        t.setDaemon(true);
        t.start();
        pause(warmMs);
        if (waitForSleep) {
            for (int i = 0; i < 200 && t.getState() != Thread.State.TIMED_WAITING; i++) pause(2);
        }
        t.interrupt();
        try { t.join(500); } catch (InterruptedException e) { throw new RuntimeException(e); }
        return new Object[]{t, ticks};
    }

    static String status(Thread t) {
        return t.isAlive() ? "abhi bhi chal raha (interrupt nigal liya?)" : "ruk gaya";
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("sleep ke andar interrupt → ruk jaana chahiye", "ruk gaya", () -> status((Thread) runTicker(s, 30, true)[0]));
        Check.eq("interrupt se pehle ticks badhe", true, () -> ((AtomicInteger) runTicker(s, 60, true)[1]).get() > 0);
        Check.hiddenFromHere();
        Check.eq("start hote hi interrupt", "ruk gaya", () -> status((Thread) runTicker(s, 0, false)[0]));
        Check.eq("ruke thread ki state", Thread.State.TERMINATED, () -> ((Thread) runTicker(s, 20, true)[0]).getState());
        Check.eq("rukne ke baad ticks nahi badhte", true, () -> {
            Object[] r = runTicker(s, 20, true);
            int before = ((AtomicInteger) r[1]).get();
            pause(40);
            return ((AtomicInteger) r[1]).get() == before;
        });
    }
}`,
      hints: [
        "Exception aane pe interrupt flag clear ho jaata hai. Loop condition ko ab kabhi pata nahi chalega.",
        "Do sahi tareeke: catch mein <code>return;</code> (ya <code>break;</code>), ya <code>Thread.currentThread().interrupt();</code> se flag wapas set karo.",
        "Flag restore karna better hai: loop khud nikal jaayega aur agar ye code kisi bade method ke andar ho to upar wale ko bhi pata chalega."
      ],
      solution: `import java.util.concurrent.atomic.AtomicInteger;

class Solution {
    Runnable ticker(AtomicInteger ticks) {
        return () -> {
            for (int i = 0; i < 400 && !Thread.currentThread().isInterrupted(); i++) {
                ticks.incrementAndGet();
                try {
                    Thread.sleep(5);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); // flag wapas, loop condition ab false
                }
            }
        };
    }
}`,
      explain: "<p>Interrupt do jagah aa sakta hai: (1) loop ke beech mein, tab flag set rehta hai aur loop condition pakad leti hai; (2) <code>sleep</code> ke andar, tab exception aata hai aur flag clear ho jaata hai. Doosre case mein flag restore karna zaroori hai, warna thread interrupt ko bhool jaata hai.</p><p>Yahi pattern <code>ExecutorService.shutdownNow()</code> ke saath kaam aata hai: wo saare worker threads ko interrupt karta hai, aur sirf wahi tasks rukte hain jo interrupt respect karte hain.</p>"
    },
    {
      type: "think",
      id: "think-stop-thread",
      q: "Interview question: <b>\"Ek background thread infinite loop mein Kafka se messages padh ke process kar raha hai. App shutdown pe isko safely kaise rokoge?\"</b>",
      rubric: [
        { point: "<code>Thread.stop()</code> mat use karo: deprecated, unsafe (locks/objects kharab state mein)", keys: ["stop()", "deprecated", "unsafe", "stop nahi", "stop mat"], weight: 1 },
        { point: "<b>interrupt()</b> ya ek <b>volatile flag</b> se signal do (cooperative)", keys: ["interrupt", "volatile", "flag", "cooperative"], weight: 2 },
        { point: "Loop har round mein flag check kare, blocking calls se <b>InterruptedException</b> handle kare", keys: ["isinterrupted", "interruptedexception", "check", "loop condition"] },
        { point: "Exception nigalo mat, <b>flag restore</b> karo (<code>Thread.currentThread().interrupt()</code>)", keys: ["restore", "currentthread().interrupt", "wapas set", "swallow", "nigal"] },
        { point: "Saaf shutdown: current message khatam karo / offset commit, phir <b>join</b> ya executor <b>shutdown + awaitTermination</b>", keys: ["join", "awaittermination", "shutdown", "commit", "graceful", "cleanup"] }
      ],
      answer: `<p><code>stop()</code> nahi, kyunki wo thread ko kisi bhi line pe maar deta hai. Tareeka cooperative hai:</p>
        <ol>
          <li>Shutdown hook se <code>consumerThread.interrupt()</code> (ya ek <code>volatile boolean running = false</code>) karo.</li>
          <li>Loop ki condition: <code>while (!Thread.currentThread().isInterrupted())</code>. Blocking call se <code>InterruptedException</code> aaye to flag restore karke loop se niklo.</li>
          <li>Nikalne se pehle current message poora karo, offset commit karo, connections band karo.</li>
          <li>Shutdown hook mein <code>join(timeout)</code> karo, ya agar thread pool hai to <code>shutdown()</code> + <code>awaitTermination()</code>, phir zarurat ho to <code>shutdownNow()</code>.</li>
        </ol>
        <p>Bonus: Kafka consumer jaisi libraries ka apna <code>wakeup()</code> method hota hai jo blocking poll ko todta hai, kyunki sab blocking I/O interrupt respect nahi karta.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Production issue mein interviewer poochta hai \"CPU low hai par requests atki hain\". Jawab: thread dump lo (<code>jstack &lt;pid&gt;</code>), dekho kitne threads BLOCKED hain aur kis lock pe (\"waiting to lock &lt;0x...&gt;\"), aur kaun sa thread wo lock pakde baitha hai. States ka matlab pata hona isi ke liye zaroori hai."
    }
  ],
  references: [
    { title: "Thread.State (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Thread.State.html", type: "docs" },
    { title: "Oracle Java Tutorial: Interrupts", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/interrupt.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 7: Cancellation and Shutdown)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
