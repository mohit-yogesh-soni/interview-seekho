// CyclicBarrier
registerLesson("concurrency", "cyclicbarrier", {
  why: "\"CountDownLatch aur CyclicBarrier mein kya farak hai?\" concurrency interviews ka sabse common comparison question hai. Saath mein poochte hain: barrier action kaun chalata hai, ek thread fail ho to baaki ka kya hota hai (BrokenBarrierException), aur barrier ko thread pool mein use karne ka trap.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: har round mein sab ek doosre ka wait karein</h2>
        <p>Ola ka surge pricing engine city ko 4 zones mein baant ke har 30 second ka ek <b>round</b> chalata hai:</p>
        <ol>
          <li>Har zone ka thread apna demand/supply compute karta hai (parallel).</li>
          <li>Jab <b>chaaron</b> ho jaayein, city-wide summary banti hai (sab zones ka data chahiye).</li>
          <li>Phir agla round, summary ke saath.</li>
        </ol>
        <p>Koi zone round 2 tab tak shuru nahi kar sakta jab tak baaki zones round 1 khatam na kar lein. Matlab har round ke end mein ek <b>milne ki jagah</b> chahiye, jo har round <b>dobara</b> kaam aaye.</p>
        <p>Latch se ye nahi hoga: wo one-shot hai, aur usme "wait karne wale" aur "countDown karne wale" alag log hote hain. <b>CyclicBarrier</b> mein N threads ek doosre ka wait karte hain: sab <code>await()</code> pe pahunchein, tab sab ek saath aage badhein. Phir barrier apne aap agle round ke liye taiyaar.</p>
        <h3>Latch vs Barrier</h3>
        <table>
          <tr><th></th><th>CountDownLatch</th><th>CyclicBarrier</th></tr>
          <tr><td>Kaun kiska wait karta hai</td><td>Waiters (aksar main) <b>events</b> ka wait karte hain; countDown karne wale rukte nahi</td><td>N <b>threads ek doosre</b> ka wait karte hain; sab <code>await()</code> karte hain</td></tr>
          <tr><td>Reuse</td><td>Nahi (one-shot)</td><td>Haan: sab pahunchte hi apne aap reset</td></tr>
          <tr><td>Round khatam hone pe code</td><td>Nahi</td><td><b>Barrier action</b> (Runnable), aakhri pahunchne wala thread chalata hai</td></tr>
          <tr><td>Failure</td><td>Koi concept nahi</td><td>Ek fail (interrupt/timeout) → sab waiting ko <code>BrokenBarrierException</code></td></tr>
          <tr><td>Typical use</td><td>Startup, "N kaam khatam" signal</td><td>Iterative parallel algorithms, simulations, multi-phase batch</td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "Visualizer: barrier(3, action). Do rounds, same barrier",
      steps: [
        {
          title: "Round 1: Z1 aur Z2 pahunch gaye, wait",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td></tr>
            <tr><th>zone-1</th><td class="run">compute r1</td><td class="wait">await() (1/3)</td><td></td><td></td></tr>
            <tr><th>zone-2</th><td class="run">compute r1</td><td class="run">...</td><td class="wait">await() (2/3)</td><td></td></tr>
            <tr><th>zone-3</th><td class="run">compute r1</td><td class="run">...</td><td class="run">... (slow zone)</td><td></td></tr>
          </table><p>Jo pehle aaya wo WAITING. Kisi ko pata nahi ki zone-3 kab aayega.</p>`
        },
        {
          title: "Round 1: Z3 aakhri pahuncha → barrier action Z3 ke thread pe, phir sab chhoote",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t1</td><td>t2</td><td>t3</td><td>t4</td><td>t5</td></tr>
            <tr><th>zone-1</th><td class="run">compute r1</td><td class="wait">await()</td><td class="wait">WAITING</td><td class="wait">WAITING</td><td class="run">compute r2</td></tr>
            <tr><th>zone-2</th><td class="run">compute r1</td><td class="run">...</td><td class="wait">await()</td><td class="wait">WAITING</td><td class="run">compute r2</td></tr>
            <tr><th>zone-3</th><td class="run">compute r1</td><td class="run">...</td><td class="run">...</td><td class="lock">await() 3/3 → action: city summary</td><td class="run">compute r2</td></tr>
          </table><p>Barrier action <b>sabke release hone se pehle</b> chalta hai, aakhri thread pe. Isliye round 2 shuru karne wale har thread ko summary ready milti hai.</p>`
        },
        {
          title: "Round 2: wahi barrier, count phir 0 se",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>t5</td><td>t6</td><td>t7</td></tr>
            <tr><th>zone-1</th><td class="run">compute r2</td><td class="run">...</td><td class="wait">await() (2/3)</td></tr>
            <tr><th>zone-2</th><td class="run">compute r2</td><td class="wait">await() (1/3)</td><td class="wait">WAITING</td></tr>
            <tr><th>zone-3</th><td class="run">compute r2</td><td class="run">...</td><td class="run">...</td></tr>
          </table><p>"Cyclic" = barrier toot ke khatam nahi hota, har baar sab ke guzarte hi agle round (generation) ke liye ready.</p>`
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>API</h2>
        <table>
          <tr><th>Method</th><th>Kya karta hai</th></tr>
          <tr><td><code>new CyclicBarrier(parties)</code> / <code>(parties, action)</code></td><td>Kitne threads milenge; optional action har round ke end mein</td></tr>
          <tr><td><code>await()</code></td><td>Sab aane tak wait. Return = arrival index: <code>parties - 1</code> pehle aane wale ka, <code>0</code> aakhri ka</td></tr>
          <tr><td><code>await(timeout, unit)</code></td><td>Time khatam: is thread ko <code>TimeoutException</code>, barrier <b>broken</b></td></tr>
          <tr><td><code>isBroken()</code></td><td>Barrier toota hai kya</td></tr>
          <tr><td><code>reset()</code></td><td>Initial state; jo abhi wait kar rahe hain unko <code>BrokenBarrierException</code></td></tr>
          <tr><td><code>getNumberWaiting()</code>, <code>getParties()</code></td><td>Monitoring</td></tr>
        </table>
        <p><b>All-or-none:</b> official docs isko breakage model kehte hain. Agar koi waiting thread interrupt hua, timeout hua, ya barrier action ne exception phenka, to barrier broken ho jaata hai aur baaki saare waiting (aur aage aane wale) threads ko <code>BrokenBarrierException</code> milta hai. Koi thread hamesha ke liye nahi atakta jab saathi mar gaya ho.</p>`
    },
    {
      type: "code",
      title: "3 zones × 3 rounds, barrier action har round ka summary banata hai (output fixed)",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static final int ZONES = 3, ROUNDS = 3;
    static final int[] demand = new int[ZONES];       // har zone sirf apna index likhta hai
    static final List<String> summaries = new ArrayList<>();
    static int round = 1;

    public static void main(String[] args) throws InterruptedException {
        CyclicBarrier barrier = new CyclicBarrier(ZONES, () -> {
            // aakhri pahunchne wala thread chalata hai; baaki sab abhi ruke hain
            int total = Arrays.stream(demand).sum();
            summaries.add("round " + round + ": demand " + Arrays.toString(demand) + " total=" + total
                    + (total > 20 ? " → surge 1.5x" : " → normal"));
            round++;
        });

        Thread[] ts = new Thread[ZONES];
        for (int z = 0; z < ZONES; z++) {
            final int zone = z;
            ts[z] = new Thread(() -> {
                try {
                    for (int r = 1; r <= ROUNDS; r++) {
                        demand[zone] = (zone + 1) * r * 2;   // fake compute
                        barrier.await();                     // sab zones ka wait
                    }
                } catch (InterruptedException | BrokenBarrierException e) {
                    System.out.println("zone " + zone + ": " + e);
                }
            }, "zone-" + z);
            ts[z].start();
        }
        for (Thread t : ts) t.join();
        summaries.forEach(System.out::println);
        System.out.println("broken? " + barrier.isBroken() + ", waiting = " + barrier.getNumberWaiting());
    }
}`,
      note: "<code>demand</code> aur <code>summaries</code> plain fields hain, phir bhi safe hain: docs ke hisaab se <code>await()</code> se pehle ka kaam barrier action ko dikhta hai, aur action ka kaam await ke baad wale code ko (happens-before)."
    },
    {
      type: "code",
      title: "Broken barrier: ek thread timeout hua, doosre ko BrokenBarrierException, phir reset()",
      code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        CyclicBarrier barrier = new CyclicBarrier(3);   // 3 chahiye, aayenge sirf 2

        Thread patient = new Thread(() -> {
            try {
                barrier.await();                        // bina timeout
                System.out.println("patient: aage badha");
            } catch (BrokenBarrierException e) {
                System.out.println("patient: BrokenBarrierException (saathi ne haar maan li)");
            } catch (InterruptedException e) {
                System.out.println("patient: interrupted");
            }
        }, "patient");
        patient.setDaemon(true);
        patient.start();
        while (barrier.getNumberWaiting() < 1) Thread.sleep(5);   // patient pakka wait mein ho

        try {
            barrier.await(100, TimeUnit.MILLISECONDS);  // main: max 100ms
        } catch (TimeoutException e) {
            System.out.println("main: 100ms mein teesra nahi aaya → TimeoutException");
        }
        patient.join(1000);
        System.out.println("broken? " + barrier.isBroken());

        barrier.reset();
        System.out.println("reset ke baad broken? " + barrier.isBroken() + ", waiting = " + barrier.getNumberWaiting());
    }
}`,
      note: "Bina timeout ke, teesra thread kabhi na aata to patient hamesha atka rehta. Production mein <code>await(timeout)</code> rakho, taaki ek mara hua worker sabko na atkaaye."
    },
    {
      type: "warn",
      html: "⚠️ <b>Thread pool trap:</b> <code>new CyclicBarrier(4)</code> aur <code>Executors.newFixedThreadPool(3)</code> mein 4 tasks submit kiye jo <code>await()</code> karte hain. 3 tasks threads le ke barrier pe ruk gaye, chautha task queue mein hai aur koi free thread nahi: <b>hamesha ke liye atka</b> (thread starvation deadlock). Barrier ke parties ≤ pool ke threads hone chahiye, ya dedicated threads use karo."
    },
    {
      type: "quiz",
      q: "<code>new CyclicBarrier(3, action)</code>. Teen threads A, B, C order mein pahunchte hain: pehle A, phir B, aakhir mein C. <code>action</code> kis thread pe chalta hai, aur A ka <code>await()</code> kya return karta hai?",
      options: [
        "Naye background thread pe; A ko 0 milta hai",
        "C (aakhri) ke thread pe, A/B/C ke release hone se pehle; A ko 2 milta hai",
        "A (pehle) ke thread pe; A ko 0 milta hai",
        "main thread pe; sabko 3 milta hai"
      ],
      answer: 1,
      why: "Barrier action aakhri pahunchne wala thread chalata hai, sabko chhodne se pehle. Arrival index: pehle wale ko <code>getParties() - 1</code> = 2, aakhri ko 0. Isliye kai log <code>if (barrier.await() == 0)</code> se \"leader\" chunte hain."
    },
    {
      type: "exercise",
      id: "ex-barrier-smooth",
      title: "Multi-phase computation: parallel smoothing with CyclicBarrier",
      level: "Medium",
      task: `<p>Ek sensor line ke <code>cells</code> hain. Har round mein har cell ki nayi value = <code>(left + self + right) / 3</code> (integer division). Kinare pe jo neighbour nahi hai wo <b>0</b> gina jaata hai. Har round <b>purani</b> values se hi nayi values banti hain.</p>
        <p><code>smooth(cells, rounds, workers)</code>: exactly <code>workers</code> threads banao, har thread array ka ek <b>continuous hissa</b> sambhale. Har round ke baad sab threads <b>CyclicBarrier</b> pe milein; barrier action purane aur naye buffer ko swap kare. <code>rounds</code> ke baad final array return karo (input array mat badlo).</p>
        <p>Harness result ko ek simple sequential version se compare karta hai. Workers cells se zyada bhi ho sakte hain (kuch threads ka hissa khaali). Saare threads method khatam hone se pehle khatam hone chahiye.</p>`,
      examples: "<code>smooth([9,0,0,0,9], 1, 2)</code> → <code>[3,3,0,3,3]</code><br><code>smooth([9,0,0,0,9], 2, 2)</code> → <code>[2,2,2,2,2]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    int[] smooth(int[] cells, int rounds, int workers) throws InterruptedException {
        int[] cur = cells.clone();
        // TODO: workers threads, har round ke baad CyclicBarrier, barrier action mein swap
        return cur;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static int[] reference(int[] cells, int rounds) {
        int[] cur = cells.clone();
        for (int r = 0; r < rounds; r++) {
            int[] next = new int[cur.length];
            for (int i = 0; i < cur.length; i++) {
                int l = i > 0 ? cur[i - 1] : 0, rt = i + 1 < cur.length ? cur[i + 1] : 0;
                next[i] = (l + cur[i] + rt) / 3;
            }
            cur = next;
        }
        return cur;
    }

    static Object run(int[] cells, int rounds, int workers) {
        try { return new Solution().smooth(cells, rounds, workers); }
        catch (InterruptedException e) { return "interrupted"; }
    }

    static int[] randomCells(int n, long seed) {
        Random rnd = new Random(seed);
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = rnd.nextInt(1000);
        return a;
    }

    public static void main(String[] args) {
        Check.eq("[9,0,0,0,9], 1 round, 2 workers", new int[]{3, 3, 0, 3, 3}, () -> run(new int[]{9, 0, 0, 0, 9}, 1, 2));
        Check.eq("[9,0,0,0,9], 2 rounds, 2 workers", new int[]{2, 2, 2, 2, 2}, () -> run(new int[]{9, 0, 0, 0, 9}, 2, 2));
        Check.hiddenFromHere();
        Check.eq("0 rounds: same array", new int[]{5, 7, 1}, () -> run(new int[]{5, 7, 1}, 0, 3));
        Check.eq("input array badla nahi", new int[]{9, 0, 9}, () -> {
            int[] in = {9, 0, 9};
            run(in, 3, 2);
            return in;
        });
        Check.eq("workers > cells (5 cells, 8 workers, 4 rounds)", reference(new int[]{30, 3, 300, 3, 30}, 4),
                () -> run(new int[]{30, 3, 300, 3, 30}, 4, 8));
        Check.eq("single cell, 3 rounds", new int[]{3}, () -> run(new int[]{81}, 3, 1));
        int[] big = randomCells(3000, 42);
        Check.eq("3000 cells, 40 rounds, 4 workers", reference(big, 40), () -> run(big, 40, 4));
        int[] mid = randomCells(101, 7);
        Check.eq("101 cells, 25 rounds, 3 workers (uneven split) + koi thread bacha nahi", List.of(true, true), () -> {
            int before = Thread.activeCount();
            Object got = run(mid, 25, 3);
            boolean same = got instanceof int[] && Arrays.equals((int[]) got, reference(mid, 25));
            for (int i = 0; i < 100 && Thread.activeCount() > before; i++) {
                try { Thread.sleep(5); } catch (InterruptedException e) { }
            }
            return List.of(same, Thread.activeCount() <= before);
        });
    }
}`,
      hints: [
        "Do buffers rakho: <code>int[][] buf = { cells.clone(), new int[n] };</code> Barrier action: <code>int[] t = buf[0]; buf[0] = buf[1]; buf[1] = t;</code>",
        "Worker w ka hissa: <code>from = w * n / workers</code>, <code>to = (w + 1) * n / workers</code>. Har round: <code>buf[0]</code> se padho, <code>buf[1]</code> mein likho, phir <code>barrier.await()</code>.",
        "Barrier ke parties = workers (khaali hisse wale threads bhi await karein, warna baaki atak jaayenge). Sab threads start karo, phir sabka <code>join()</code>, phir <code>buf[0]</code> return."
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    int[] smooth(int[] cells, int rounds, int workers) throws InterruptedException {
        int n = cells.length;
        int[][] buf = { cells.clone(), new int[n] };            // buf[0] = current, buf[1] = next
        CyclicBarrier barrier = new CyclicBarrier(workers, () -> {
            int[] t = buf[0]; buf[0] = buf[1]; buf[1] = t;       // aakhri thread swap karta hai
        });

        Thread[] ts = new Thread[workers];
        for (int w = 0; w < workers; w++) {
            final int from = w * n / workers, to = (w + 1) * n / workers;
            ts[w] = new Thread(() -> {
                try {
                    for (int r = 0; r < rounds; r++) {
                        int[] cur = buf[0], next = buf[1];
                        for (int i = from; i < to; i++) {
                            int left = i > 0 ? cur[i - 1] : 0;
                            int right = i + 1 < n ? cur[i + 1] : 0;
                            next[i] = (left + cur[i] + right) / 3;
                        }
                        barrier.await();                        // sab ka round poora hone tak ruko
                    }
                } catch (InterruptedException | BrokenBarrierException e) {
                    Thread.currentThread().interrupt();
                }
            });
            ts[w].start();
        }
        for (Thread t : ts) t.join();
        return buf[0];
    }
}`,
      explain: "<p>Har worker apne hisse ke cells likhta hai, par neighbours (doosre hisse ke kinare) padhta bhi hai. Isliye koi worker round r+1 tab tak shuru nahi kar sakta jab tak sab ne round r ka <code>next</code> poora na likha ho: wahi barrier hai. Swap barrier action mein hai, jo ek hi baar, sabke release hone se pehle chalta hai, aur barrier ki happens-before guarantee se sabko naya <code>buf[0]</code> dikhta hai.</p><p>Time: O(rounds × n / workers) per thread + har round ek barrier. Ye pattern (double buffer + barrier per step) game of life, physics simulation, aur iterative graph algorithms (PageRank) mein common hai.</p>"
    },
    {
      type: "think",
      id: "think-latch-vs-barrier",
      q: "Interview question: <b>\"CountDownLatch aur CyclicBarrier mein kya farak hai? Ek example do jahan sirf barrier sahi hai.\"</b>",
      rubric: [
        { point: "Latch: waiters <b>events</b> ka wait karte hain (countDown wale nahi rukte). Barrier: N threads <b>ek doosre</b> ka wait", keys: ["ek doosre", "each other", "events", "countdown wale", "nahi rukte", "all threads wait", "sab threads"], weight: 2 },
        { point: "Latch <b>one-shot</b>, barrier <b>reusable</b> (cyclic, har round)", keys: ["one-shot", "one shot", "reusable", "reuse", "cyclic", "reset", "round"], weight: 2 },
        { point: "<b>Barrier action</b>: aakhri thread pe, round ke end mein", keys: ["barrier action", "action", "aakhri thread", "last thread", "runnable"] },
        { point: "<b>BrokenBarrierException</b>: ek fail/timeout → sab fail (all-or-none)", keys: ["broken", "brokenbarrier", "all-or-none", "timeout"] },
        { point: "Example: iterative/multi-phase computation (simulation, rounds) vs startup wait", keys: ["simulation", "iteration", "phase", "multi-phase", "game of life", "startup", "matrix"] }
      ],
      answer: `<table>
          <tr><th></th><th>CountDownLatch</th><th>CyclicBarrier</th></tr>
          <tr><td>Model</td><td>Ek/zyada threads N <b>events</b> ka wait karte hain; countDown karne wale nahi rukte</td><td>N threads ek <b>doosre</b> ka wait karte hain; sab await karte hain</td></tr>
          <tr><td>Reuse</td><td>One-shot</td><td>Har round ke baad apne aap reset</td></tr>
          <tr><td>Extra</td><td>-</td><td>Barrier action (aakhri thread pe), BrokenBarrierException (all-or-none)</td></tr>
        </table>
        <p><b>Sirf barrier sahi:</b> parallel simulation jahan har step mein workers ko neighbours ka pichla step chahiye (smoothing, game of life). Har step ke end mein sab milein, action buffers swap kare, phir agla step. Latch se har step ke liye naya latch aur alag coordinator thread chahiye hota.</p>
        <p><b>Sirf latch sahi:</b> main thread ko startup pe 3 services ka wait; services ko ek doosre ka wait nahi karna.</p>
        <p>Follow-up: parties dynamic hon (threads beech mein judein/hatein) to <b>Phaser</b>.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Latch vs Barrier ek line mein: <i>\"Latch mein waiter events ka wait karta hai, barrier mein threads ek doosre ka; latch one-shot, barrier reusable.\"</i> Phir BrokenBarrierException aur thread pool trap (parties &gt; pool threads = hamesha atka) bata do. Ye do points zyaadatar candidates miss karte hain."
    }
  ],
  references: [
    { title: "CyclicBarrier (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CyclicBarrier.html", type: "docs" },
    { title: "CountDownLatch (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CountDownLatch.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 5.5.4: Barriers)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
