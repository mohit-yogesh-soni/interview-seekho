// Phaser (overview) + Exchanger
registerLesson("concurrency", "phaser-exchanger", {
  why: "Phaser roz ka tool nahi hai, par \"Latch vs Barrier vs Phaser\" table interview mein poocha jaata hai. Senior candidate se umeed hoti hai ki wo bata sake ki Phaser kab chahiye (parties beech mein judein ya hatein) aur kab overkill hai. Exchanger ek line mein jaan lena kaafi hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: participants fixed nahi hain</h2>
        <p>Big Billion Day se pehle load test: virtual users <b>phases</b> mein chalte hain: warm-up → ramp-up → peak. Har phase ke end mein sab users milte hain (barrier jaisa). Par:</p>
        <ul>
          <li>Kuch users sirf warm-up mein hain, phir <b>nikal</b> jaate hain.</li>
          <li>Peak phase mein naye users <b>judte</b> hain.</li>
        </ul>
        <p>CyclicBarrier mein parties constructor mein fixed hain. Ek thread chala gaya to baaki hamesha uska wait karenge (ya timeout se barrier tootega). <b>Phaser</b> (Java 7) mein parties dynamic hain:</p>
        <table>
          <tr><th>Method</th><th>Kya karta hai</th></tr>
          <tr><td><code>new Phaser(n)</code></td><td>n parties registered, phase 0</td></tr>
          <tr><td><code>register()</code> / <code>bulkRegister(k)</code></td><td>Naya party judta hai (agle arrival se gina jaata hai)</td></tr>
          <tr><td><code>arriveAndAwaitAdvance()</code></td><td>Barrier jaisa: pahuncho aur baaki sab ka wait</td></tr>
          <tr><td><code>arrive()</code></td><td>Pahunch gaya, par wait nahi (latch ke countDown jaisa)</td></tr>
          <tr><td><code>arriveAndDeregister()</code></td><td>Pahuncha aur nikal gaya: aage ke phases mein gina nahi jaayega</td></tr>
          <tr><td><code>awaitAdvance(phase)</code></td><td>Bina party bane, us phase ke khatam hone ka wait</td></tr>
          <tr><td><code>onAdvance(phase, registeredParties)</code></td><td>Override karo: har phase ke end ka code (barrier action jaisa). <code>true</code> return = phaser terminate. Default: tab true jab registered parties 0 ho jaayein</td></tr>
        </table>
        <p>Docs ke hisaab se ek phaser max 65535 parties sambhalta hai; zyada ke liye phasers ko <b>tier</b> (parent-child tree) kar sakte ho.</p>`
    },
    {
      type: "steps",
      title: "Visualizer: phase 0 mein 3 parties, warm-up user nikal gaya, phase 1 mein 2",
      steps: [
        {
          title: "Phase 0: U1, U2, U3 teeno registered",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td></tr>
            <tr><th>U1 (warm-up only)</th><td class="run">warm-up</td><td class="lock">arriveAndDeregister()</td><td>khatam</td></tr>
            <tr><th>U2</th><td class="run">warm-up</td><td class="wait">arriveAndAwaitAdvance()</td><td class="wait">WAITING</td></tr>
            <tr><th>U3</th><td class="run">warm-up</td><td class="run">...</td><td class="lock">arriveAndAwaitAdvance() 3/3</td></tr>
          </table><p>U1 nikalte waqt bhi phase 0 mein "arrived" gina gaya. Teeno pahunch gaye → phase 0 → 1, onAdvance(0, 2) chala.</p>`
        },
        {
          title: "Phase 1: sirf U2, U3. Koi U1 ka wait nahi karta",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t4</td><td>t5</td><td>t6</td></tr>
            <tr><th>U1</th><td class="dim">-</td><td class="dim">-</td><td class="dim">-</td></tr>
            <tr><th>U2</th><td class="run">peak load</td><td class="wait">arriveAndAwaitAdvance()</td><td class="run">phase 2</td></tr>
            <tr><th>U3</th><td class="run">peak load</td><td class="run">...</td><td class="lock">arrive 2/2 → advance</td></tr>
          </table><p>CyclicBarrier(3) hota to U2, U3 phase 1 mein hamesha U1 ka wait karte.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Phaser: 3 users, alag alag phases tak. onAdvance har phase ka summary deta hai",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        String[] phaseNames = {"warm-up", "ramp-up", "peak"};
        List<String> log = Collections.synchronizedList(new ArrayList<>());

        Phaser phaser = new Phaser(1) {                    // 1 = main khud (start gate ki tarah)
            @Override
            protected boolean onAdvance(int phase, int registeredParties) {
                log.add(phaseNames[phase] + " khatam, aage " + registeredParties + " parties");
                return registeredParties == 0;             // sab chale gaye → terminate
            }
        };

        int[] lastPhaseOfUser = {0, 2, 1};                 // user0 sirf warm-up, user1 peak tak, user2 ramp-up tak
        List<Thread> users = new ArrayList<>();
        for (int u = 0; u < lastPhaseOfUser.length; u++) {
            final int last = lastPhaseOfUser[u];
            phaser.register();                             // naya party
            Thread t = new Thread(() -> {
                for (int p = 0; p <= last; p++) {
                    // ... is phase ka load generate karo ...
                    if (p == last) phaser.arriveAndDeregister();   // apna aakhri phase: nikal jao
                    else phaser.arriveAndAwaitAdvance();
                }
            });
            users.add(t);
            t.start();
        }
        phaser.arriveAndDeregister();                      // main ne gate khola aur hat gaya
        for (Thread t : users) t.join();

        log.forEach(System.out::println);
        System.out.println("terminated? " + phaser.isTerminated());
    }
}`,
      note: "<code>onAdvance</code> us thread pe chalta hai jo phase ka aakhri arrival karta hai, aur docs ke hisaab se phase advance hone se pehle. Isliye log ka order fixed hai."
    },
    {
      type: "text",
      html: `
        <h2>CountDownLatch vs CyclicBarrier vs Phaser</h2>
        <table>
          <tr><th></th><th>CountDownLatch</th><th>CyclicBarrier</th><th>Phaser</th></tr>
          <tr><td>Java version</td><td>5</td><td>5</td><td>7</td></tr>
          <tr><td>Parties / count</td><td>Fixed (constructor)</td><td>Fixed (constructor)</td><td><b>Dynamic</b>: register / deregister</td></tr>
          <tr><td>Reusable</td><td>Nahi (one-shot)</td><td>Haan (har round)</td><td>Haan (phase number badhta hai)</td></tr>
          <tr><td>Kaun wait karta hai</td><td>Waiters events ka; countDown wale nahi rukte</td><td>Saare parties ek doosre ka</td><td>Dono: <code>arrive()</code> (bina ruke) ya <code>arriveAndAwaitAdvance()</code></td></tr>
          <tr><td>Round-end code</td><td>Nahi</td><td>Barrier action</td><td><code>onAdvance()</code> (+ termination control)</td></tr>
          <tr><td>Failure model</td><td>-</td><td>BrokenBarrierException (all-or-none)</td><td>Koi "broken" state nahi; termination, aur interruptible/timed <code>awaitAdvance</code> variants</td></tr>
          <tr><td>Kab</td><td>Startup, "N kaam khatam"</td><td>Fixed workers, iterative rounds</td><td>Workers ki ginti phases ke beech badalti ho; bahut saare parties (tiering)</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>Exchanger (ek minute mein)</h2>
        <p><code>Exchanger&lt;V&gt;</code> do threads ka milan point hai: dono <code>exchange(myObject)</code> call karte hain aur ek doosre ka object le lete hain. Docs isko SynchronousQueue ka bidirectional roop kehti hain. Classic use: <b>double buffering</b>. Producer ek buffer bharta hai, consumer doosra khaali karta hai, phir dono buffer swap. Koi naya allocation nahi.</p>
        <p>Real projects mein rare hai. Interview mein bas itna jaanna: <i>do threads, pair mein swap, jo pehle aaya wo wait karta hai</i> (timeout wala variant bhi hai).</p>`
    },
    {
      type: "code",
      title: "Exchanger: logger thread bhara buffer leta hai, khaali wapas deta hai (3 swaps)",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Exchanger<List<String>> exchanger = new Exchanger<>();
        List<String> written = Collections.synchronizedList(new ArrayList<>());

        Thread disk = new Thread(() -> {
            List<String> empty = new ArrayList<>();
            try {
                for (int i = 0; i < 3; i++) {
                    List<String> full = exchanger.exchange(empty, 1, TimeUnit.SECONDS); // khaali do, bhara lo
                    written.add("disk pe likha: " + full);
                    full.clear();
                    empty = full;                                   // yahi buffer agli baar wapas jaayega
                }
            } catch (InterruptedException | TimeoutException e) {
                written.add("disk: " + e);
            }
        }, "disk-writer");
        disk.start();

        List<String> buffer = new ArrayList<>();
        int line = 1;
        for (int batch = 0; batch < 3; batch++) {
            for (int k = 0; k < 2; k++) buffer.add("log" + line++);
            buffer = exchanger.exchange(buffer, 1, TimeUnit.SECONDS);   // bhara do, khaali lo
        }
        disk.join();
        written.forEach(System.out::println);
    }
}`
    },
    {
      type: "pick",
      id: "pick-phaser-when",
      q: "Kin situations mein <b>Phaser</b> sahi choice hai (latch/barrier se behtar)?",
      options: [
        { text: "Parallel crawler: har level (phase) ke end mein sab milein, aur har level pe naye URLs ke liye naye workers judte hain", correct: true, why: "Parties phases ke beech badal rahe hain: register() se judo." },
        { text: "Startup pe main thread ko 3 services ka wait karna hai", correct: false, why: "Simple one-shot wait: CountDownLatch (ya allOf). Phaser overkill." },
        { text: "Load test jisme kuch virtual users beech ke phase ke baad nikal jaate hain", correct: true, why: "arriveAndDeregister() se baaki unka wait nahi karte." },
        { text: "4 fixed worker threads, 100 iterations, har iteration ke end mein sync", correct: false, why: "Fixed parties, repeat: CyclicBarrier simple aur kaafi hai (Phaser bhi chalega par zaroorat nahi)." },
        { text: "Bahut saare parties (lakhs tasks) jinhe ek phase pe sync karna hai, contention kam karna hai", correct: true, why: "Tiered phasers (parent-child) se contention bant jaata hai; ek phaser ki limit 65535 parties hai." },
        { text: "Do threads ko buffer swap karna hai", correct: false, why: "Ye Exchanger ka kaam hai." }
      ],
      answer: "Rule of thumb: <b>parties dynamic hon ya bahut zyada hon</b> tab Phaser. Baaki case mein simple tool (latch/barrier/allOf) code ko padhne mein aasaan rakhta hai."
    },
    {
      type: "quiz",
      q: "<code>Phaser p = new Phaser(3)</code>. Teen threads phase 0 mein hain. Ek thread <code>arriveAndDeregister()</code> karta hai, baaki do <code>arriveAndAwaitAdvance()</code>. Phase 1 mein kitne parties ka wait hoga?",
      options: [
        "3, kyunki constructor mein 3 diya tha",
        "2, kyunki deregister wala aage gina nahi jaata",
        "1",
        "Phaser terminate ho jaayega"
      ],
      answer: 1,
      why: "Deregister karne wala phase 0 mein arrived gina jaata hai (isliye phase 0 advance hota hai), par registered parties 3 → 2. Terminate tab hota hai jab registered 0 hon (default onAdvance)."
    },
    {
      type: "exercise",
      id: "ex-phaser-phases",
      title: "Workers alag alag phases tak: Phaser se sync",
      level: "Medium",
      task: `<p><code>run(phasesPerWorker, work)</code>: worker <code>w</code> ko phases <code>0 .. phasesPerWorker[w]-1</code> mein kaam karna hai, har phase mein ek baar <code>work.accept(w, phase)</code> call karke. Har worker apne thread mein chale.</p>
        <p>Rule: koi bhi worker phase <code>p+1</code> ka kaam tab tak shuru na kare jab tak phase <code>p</code> mein shamil <b>saare</b> workers ka kaam poora na ho. Jo worker apne phases poore kar le, wo nikal jaaye (baaki uska wait na karein). <code>0</code> phases wala worker kuch nahi karta.</p>
        <p>Method tabhi return kare jab saara kaam ho jaaye. Harness har call ka record rakhta hai aur check karta hai: har (worker, phase) exactly ek baar, aur phase ka order kabhi nahi toota.</p>`,
      examples: "<code>[1, 3, 2]</code>: phase 0 mein 3 workers, phase 1 mein 2 (w1, w2), phase 2 mein sirf w1",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;
import java.util.function.BiConsumer;

class Solution {
    void run(int[] phasesPerWorker, BiConsumer<Integer, Integer> work) throws InterruptedException {
        // TODO: har worker apne thread mein, Phaser se phases sync
        for (int w = 0; w < phasesPerWorker.length; w++) {
            for (int p = 0; p < phasesPerWorker[w]; p++) work.accept(w, p);
        }
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.BiConsumer;

public class Main {
    // [har (w,p) exactly once?, order violations, sab return se pehle khatam?, alag threads?]
    static List<Object> check(int[] phases) {
        int maxP = 0;
        for (int k : phases) maxP = Math.max(maxP, k);
        int[] expected = new int[maxP + 1];
        for (int k : phases) for (int p = 0; p < k; p++) expected[p]++;
        AtomicIntegerArray done = new AtomicIntegerArray(maxP + 1);
        ConcurrentHashMap<String, Integer> calls = new ConcurrentHashMap<>();
        AtomicInteger violations = new AtomicInteger();
        Set<String> threads = ConcurrentHashMap.newKeySet();
        String caller = Thread.currentThread().getName();
        BiConsumer<Integer, Integer> work = (w, p) -> {
            threads.add(Thread.currentThread().getName());
            if (p > 0 && done.get(p - 1) != expected[p - 1]) violations.incrementAndGet();
            calls.merge(w + ":" + p, 1, Integer::sum);
            Thread.yield();
            done.incrementAndGet(p);
        };
        Thread runner = new Thread(() -> {
            try { new Solution().run(phases, work); } catch (InterruptedException e) { }
        }, "runner");
        runner.setDaemon(true);
        runner.start();
        try { runner.join(3000); } catch (InterruptedException e) { }
        int total = 0;
        for (int k : phases) total += k;
        boolean once = calls.size() == total && calls.values().stream().allMatch(c -> c == 1);
        boolean allDone = !runner.isAlive();
        for (int p = 0; p < maxP; p++) allDone &= done.get(p) == expected[p];
        boolean parallel = total == 0 || (threads.size() > 1 || phases.length <= 1) && !threads.contains("runner");
        return List.of(once, violations.get(), allDone, parallel);
    }

    public static void main(String[] args) {
        Check.eq("[1,3,2]: [once, violations, done, own threads]", List.of(true, 0, true, true), () -> check(new int[]{1, 3, 2}));
        Check.eq("[2,2]", List.of(true, 0, true, true), () -> check(new int[]{2, 2}));
        Check.hiddenFromHere();
        Check.eq("[0,3,0,1] (0 phases wale bhi)", List.of(true, 0, true, true), () -> check(new int[]{0, 3, 0, 1}));
        Check.eq("single worker [4]", List.of(true, 0, true, true), () -> check(new int[]{4}));
        Check.eq("khaali []", List.of(true, 0, true, true), () -> check(new int[]{}));
        Check.eq("8 workers [5,1,4,2,5,3,1,5]", List.of(true, 0, true, true), () -> check(new int[]{5, 1, 4, 2, 5, 3, 1, 5}));
    }
}`,
      hints: [
        "<code>Phaser phaser = new Phaser(1);</code> (1 = aap khud, taaki sab workers register hone se pehle phase 0 aage na badhe).",
        "Har worker (k &gt; 0) ke liye thread start karne se <b>pehle</b> <code>phaser.register()</code>. Thread mein: har phase ke kaam ke baad, aakhri phase ho to <code>arriveAndDeregister()</code>, warna <code>arriveAndAwaitAdvance()</code>.",
        "Sab threads start karke <code>phaser.arriveAndDeregister()</code> (apna party hatao), phir sab threads <code>join()</code>."
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;
import java.util.function.BiConsumer;

class Solution {
    void run(int[] phasesPerWorker, BiConsumer<Integer, Integer> work) throws InterruptedException {
        Phaser phaser = new Phaser(1);                 // main bhi party hai (start gate)
        List<Thread> threads = new ArrayList<>();
        for (int w = 0; w < phasesPerWorker.length; w++) {
            final int worker = w, k = phasesPerWorker[w];
            if (k == 0) continue;                      // koi kaam nahi, register hi mat karo
            phaser.register();
            Thread t = new Thread(() -> {
                for (int p = 0; p < k; p++) {
                    work.accept(worker, p);
                    if (p == k - 1) phaser.arriveAndDeregister();  // apna kaam khatam: nikal jao
                    else phaser.arriveAndAwaitAdvance();           // baaki sab ka wait
                }
            }, "worker-" + w);
            threads.add(t);
            t.start();
        }
        phaser.arriveAndDeregister();                  // gate kholo, main hat gaya
        for (Thread t : threads) t.join();
    }
}`,
      explain: "<p>Main ek extra party hai: jab tak wo arrive nahi karta, phase 0 complete nahi ho sakta, chahe kuch workers jaldi pahunch jaayein. Isliye saare workers phase 0 se hi shuru hote hain. Har worker apne aakhri phase pe <code>arriveAndDeregister()</code> karta hai: us phase mein gina jaata hai, par aage ke phases uska wait nahi karte. CyclicBarrier mein ye possible nahi tha (parties fixed).</p><p>Har phase ek sync point, total kaam O(sum of phases).</p>"
    },
    {
      type: "think",
      id: "think-three-sync",
      q: "Interview question: <b>\"CountDownLatch, CyclicBarrier aur Phaser: teeno kab use karoge? Ek ek example do.\"</b>",
      rubric: [
        { point: "Latch: <b>one-shot</b>, waiters events ka wait (startup)", keys: ["one-shot", "one shot", "startup", "event", "countdown"], weight: 2 },
        { point: "Barrier: <b>fixed</b> parties ek doosre ka wait, <b>reusable</b>, barrier action", keys: ["fixed", "reusable", "ek doosre", "each other", "barrier action", "round", "iteration"], weight: 2 },
        { point: "Phaser: <b>dynamic</b> parties (register / deregister), phases, onAdvance", keys: ["dynamic", "register", "deregister", "onadvance", "badalte", "join/leave"], weight: 2 },
        { point: "Simple tool pehle; Phaser sirf jab zaroorat ho (ya bahut parties: tiering)", keys: ["simple", "overkill", "tier", "zaroorat", "65535"] }
      ],
      answer: `<ul>
          <li><b>CountDownLatch:</b> one-shot. Main thread 3 services ke ready hone ka wait. Services rukti nahi.</li>
          <li><b>CyclicBarrier:</b> fixed N threads har round ke end mein milte hain, phir barrier reset. Parallel simulation; barrier action buffers swap ya summary banata hai. Ek fail → sab ko BrokenBarrierException.</li>
          <li><b>Phaser:</b> barrier jaisa, par parties phases ke beech jud aur hat sakti hain (<code>register</code>, <code>arriveAndDeregister</code>), <code>onAdvance</code> mein phase-end code aur termination. Load test ya crawler jahan workers ki ginti badalti hai.</li>
        </ul>
        <p>Default: sabse simple tool jo kaam kare. Aaj kal "N tasks ka result chahiye" ke liye <code>CompletableFuture.allOf</code> ya <code>invokeAll</code> latch se zyada common hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Phaser ke baare mein lambi theory mat do. Ek line kaafi hai: <i>\"Phaser = reusable barrier jisme parties dynamic hain\"</i>, aur ek example (load test mein users judte/hatate hain). Interviewer ko ye dikhna chahiye ki aap jaante ho kab <b>nahi</b> use karna."
    }
  ],
  references: [
    { title: "Phaser (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Phaser.html", type: "docs" },
    { title: "Exchanger (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Exchanger.html", type: "docs" },
    { title: "CyclicBarrier (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CyclicBarrier.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.5: Synchronizers)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
