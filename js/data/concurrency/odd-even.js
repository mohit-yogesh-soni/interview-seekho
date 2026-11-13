// Classic: do threads se odd-even print
registerLesson("concurrency", "odd-even", {
  why: "\"Do threads, ek odd print kare, ek even, order 1 2 3 4... ho\" sabse zyada pucha jaane wala concurrency coding question hai. Isse interviewer dekhta hai ki aap wait/notify sahi (while loop, shared lock) likh sakte ho aur Semaphore se handoff samajhte ho.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>Thread <b>ODD</b> sirf 1, 3, 5... print kare. Thread <b>EVEN</b> sirf 2, 4, 6... Output order mein aana chahiye: <code>1 2 3 4 ... N</code>.</p>
        <p>Sirf do threads start kar dene se order random hoga, kyunki scheduler kisi bhi thread ko kabhi bhi chala sakta hai. Hume <b>baari (turn)</b> ka system chahiye: ek thread apna number print kare, phir doosre ko signal de aur khud wait kare.</p>
        <h3>Teen tareeke</h3>
        <table>
          <tr><th>Tareeka</th><th>Idea</th><th>Kab bolo</th></tr>
          <tr><td><code>synchronized</code> + <code>wait/notify</code></td><td>Shared counter; jiski baari nahi wo <code>while</code> loop mein wait</td><td>Interviewer "low level" chahta hai</td></tr>
          <tr><td>Do <code>Semaphore</code></td><td>oddSem(1), evenSem(0). Print karke doosre ka permit release</td><td>Sabse saaf code, aasaani se 3 threads tak badhta hai</td></tr>
          <tr><td><code>ReentrantLock</code> + <code>Condition</code></td><td>wait/notify jaisa, par alag conditions (oddTurn, evenTurn)</td><td>Jab lock ka control dikhana ho</td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "Semaphore handoff: oddSem = 1, evenSem = 0",
      steps: [
        { title: "Start: sirf ODD ke paas permit hai", html: `<table class="lanes">
            <tr><th>oddSem / evenSem</th><td>1 / 0</td></tr>
            <tr><th>ODD</th><td class="lock">oddSem.acquire() ✅</td></tr>
            <tr><th>EVEN</th><td class="wait">evenSem.acquire(): 0 permits → WAIT</td></tr></table>` },
        { title: "ODD print 1, evenSem.release()", html: `<table class="lanes">
            <tr><th>oddSem / evenSem</th><td>0 / 1</td></tr>
            <tr><th>ODD</th><td class="run">print 1 → evenSem.release() → oddSem.acquire(): WAIT</td></tr>
            <tr><th>EVEN</th><td class="lock">jaga ✅</td></tr></table>` },
        { title: "EVEN print 2, oddSem.release()", html: `<table class="lanes">
            <tr><th>oddSem / evenSem</th><td>1 / 0</td></tr>
            <tr><th>ODD</th><td class="lock">jaga ✅ → print 3</td></tr>
            <tr><th>EVEN</th><td class="run">print 2 → oddSem.release() → evenSem.acquire(): WAIT</td></tr></table>
            <p>Har waqt sirf ek permit "zinda" hai, isliye ek hi thread chal sakta hai: baari apne aap alternate hoti hai. Scheduler kuch bhi kare, order fix.</p>` }
      ]
    },
    {
      type: "code",
      title: "Version 1: synchronized + wait/notifyAll (shared counter)",
      code: `public class Main {
    private static final Object lock = new Object();
    private static int next = 1;
    private static final int N = 10;

    static void printLoop(boolean wantOdd) {
        while (true) {
            synchronized (lock) {
                // WHILE, if nahi: spurious wakeup ya galat thread jaga ho to dobara check
                while (next <= N && (next % 2 == 1) != wantOdd) {
                    try { lock.wait(); } catch (InterruptedException e) { return; }
                }
                if (next > N) {             // kaam khatam: doosre ko jaga ke niklo
                    lock.notifyAll();
                    return;
                }
                System.out.println(Thread.currentThread().getName() + ": " + next);
                next++;
                lock.notifyAll();           // doosre ki baari
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread odd = new Thread(() -> printLoop(true), "ODD");
        Thread even = new Thread(() -> printLoop(false), "EVEN");
        even.start();                       // even pehle start kiya, phir bhi 1 hi pehle aayega
        odd.start();
        odd.join();
        even.join();
    }
}`,
      note: "Teen cheezein jo interviewer dekhta hai: (1) dono threads <b>same lock</b> pe wait/notify, (2) <b>while</b> loop mein wait, (3) end condition jahan dono threads niklein (warna ek hamesha wait karega aur join atak jaayega)."
    },
    {
      type: "code",
      title: "Version 2: do Semaphores (sabse saaf)",
      code: `import java.util.concurrent.Semaphore;

public class Main {
    static final int N = 10;
    static final Semaphore oddTurn = new Semaphore(1);    // shuru mein odd ki baari
    static final Semaphore evenTurn = new Semaphore(0);

    public static void main(String[] args) throws InterruptedException {
        Thread odd = new Thread(() -> {
            for (int i = 1; i <= N; i += 2) {
                try { oddTurn.acquire(); } catch (InterruptedException e) { return; }
                System.out.println("ODD : " + i);
                evenTurn.release();                        // baari even ko
            }
        });
        Thread even = new Thread(() -> {
            for (int i = 2; i <= N; i += 2) {
                try { evenTurn.acquire(); } catch (InterruptedException e) { return; }
                System.out.println("EVEN: " + i);
                oddTurn.release();                         // baari odd ko
            }
        });
        even.start();
        odd.start();
        odd.join();
        even.join();
    }
}`,
      note: "Yahan permits ka owner na hona (Semaphore lesson) hi feature hai: ODD thread <code>evenTurn</code> release karta hai jo EVEN ne acquire kiya tha."
    },
    {
      type: "quiz",
      q: "Version 1 mein <code>while</code> ki jagah <code>if (galat baari) lock.wait();</code> likh diya. Kya problem ho sakti hai?",
      options: [
        "Koi problem nahi, sirf do threads hain",
        "Thread jaagne ke baad condition dobara check nahi karega: spurious wakeup ya notifyAll se galat thread print kar sakta hai (order toot sakta hai)",
        "Compile error",
        "wait() if ke andar call nahi ho sakta"
      ],
      answer: 1,
      why: "Javadoc ke hisaab se wait() <b>spurious wakeup</b> (bina notify ke jaagna) kar sakta hai, aur notifyAll saare waiters ko jagata hai. Jaagne pe condition phir se check karni padti hai, isliye hamesha <code>while (condition) wait();</code>. 3+ threads mein if wala bug turant dikhta hai."
    },
    {
      type: "exercise",
      id: "ex-odd-even",
      title: "Odd-even printer jo sequence return kare",
      level: "Medium",
      task: `<p><code>run(n)</code> likho jo <b>do threads</b> banaye: ek ka naam <code>"odd"</code>, doosre ka <code>"even"</code>. Odd thread 1, 3, 5... aur even thread 2, 4, 6... ek shared list mein add kare, format <code>"&lt;threadName&gt;-&lt;number&gt;"</code> (jaise <code>"odd-1"</code>), aur <b>add karte waqt</b> <code>Thread.currentThread().getName()</code> use karo.</p>
        <p>Order 1 se n tak sahi hona chahiye. Dono threads join karke list return karo. <code>n</code> 0 bhi ho sakta hai.</p>`,
      examples: "<code>run(4)</code> → <code>[\"odd-1\", \"even-2\", \"odd-3\", \"even-4\"]</code><br><code>run(1)</code> → <code>[\"odd-1\"]</code> (even thread bhi khatam hona chahiye)",
      userFile: "Solution.java",
      starter: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    List<String> run(int n) throws InterruptedException {
        List<String> out = Collections.synchronizedList(new ArrayList<>());
        // TODO: do threads "odd" aur "even", baari baari se
        return out;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

public class Main {
    static Object guarded(int n) {
        AtomicReference<Object> out = new AtomicReference<>("atak gaya: koi thread hamesha wait kar raha hai?");
        Thread t = new Thread(() -> {
            try { out.set(new Solution().run(n)); } catch (Exception e) { out.set("💥 " + e); }
        });
        t.setDaemon(true);
        t.start();
        try { t.join(2000); } catch (InterruptedException e) { }
        return out.get();
    }

    static List<String> expected(int n) {
        List<String> e = new ArrayList<>();
        for (int i = 1; i <= n; i++) e.add((i % 2 == 1 ? "odd-" : "even-") + i);
        return e;
    }

    public static void main(String[] args) {
        Check.eq("run(4)", expected(4), () -> guarded(4));
        Check.eq("run(1): even thread bhi khatam ho", expected(1), () -> guarded(1));
        Check.hiddenFromHere();
        Check.eq("run(0)", expected(0), () -> guarded(0));
        Check.eq("run(7) odd pe khatam", expected(7), () -> guarded(7));
        Check.eq("run(2)", expected(2), () -> guarded(2));
        Check.eq("run(500): lambi sequence, order kahin na toote", expected(500), () -> guarded(500));
        Check.eq("10 baar run(30): har baar same", true, () -> {
            for (int k = 0; k < 10; k++) if (!expected(30).equals(guarded(30))) return false;
            return true;
        });
    }
}`,
      hints: [
        "Do Semaphores: <code>oddTurn = new Semaphore(1)</code>, <code>evenTurn = new Semaphore(0)</code>. Threads ko naam do: <code>new Thread(runnable, \"odd\")</code>.",
        "Odd loop: <code>for (i = 1; i &lt;= n; i += 2) { oddTurn.acquire(); out.add(name + \"-\" + i); evenTurn.release(); }</code>. Even loop ulta.",
        "Even thread ka loop <code>i = 2</code> se hai, to n = 1 ya 0 pe wo ek baar bhi acquire nahi karega aur turant khatam: koi atkaav nahi."
      ],
      solution: `import java.util.*;
import java.util.concurrent.*;

class Solution {
    List<String> run(int n) throws InterruptedException {
        List<String> out = Collections.synchronizedList(new ArrayList<>());
        Semaphore oddTurn = new Semaphore(1);
        Semaphore evenTurn = new Semaphore(0);

        Thread odd = new Thread(() -> {
            for (int i = 1; i <= n; i += 2) {
                try { oddTurn.acquire(); } catch (InterruptedException e) { return; }
                out.add(Thread.currentThread().getName() + "-" + i);
                evenTurn.release();
            }
        }, "odd");
        Thread even = new Thread(() -> {
            for (int i = 2; i <= n; i += 2) {
                try { evenTurn.acquire(); } catch (InterruptedException e) { return; }
                out.add(Thread.currentThread().getName() + "-" + i);
                oddTurn.release();
            }
        }, "even");

        odd.start();
        even.start();
        odd.join();
        even.join();
        return out;
    }
}`,
      explain: "<p>Har thread sirf apne numbers ke liye loop karta hai, isliye end condition apne aap sahi hai: koi thread wo number ka wait nahi karta jo kabhi aayega hi nahi. Semaphore release → acquire ek <b>happens-before</b> rishta banata hai, isliye list mein likha data doosre thread ko sahi dikhta hai.</p><p>O(n) time, har number pe ek handoff (context switch). Ye program parallel nahi, sequential hai: concurrency ka control seekhne ka exercise hai, speed ka nahi.</p>"
    },
    {
      type: "think",
      id: "think-three-threads",
      q: "Follow-up (bahut common): <b>\"Ab 3 threads: A sirf 'A' print kare, B 'B', C 'C'. Output ABCABC... 5 baar. Kaise karoge?\"</b> Approach likho.",
      rubric: [
        { point: "Har thread ka <b>apna Semaphore</b> (ya condition); shuru mein sirf A ka permit 1", keys: ["semaphore", "teen semaphore", "3 semaphore", "permit", "condition"], weight: 2 },
        { point: "A print karke <b>B ka release</b>, B → C, C → A (ring / chain)", keys: ["ring", "chain", "next", "agle", "a → b", "b ko", "c ko", "a ko", "release"], weight: 2 },
        { point: "Ya shared <b>turn counter</b>: turn % 3 == myId, while loop mein wait, notifyAll", keys: ["turn", "% 3", "mod 3", "counter", "notifyall", "while"] },
        { point: "Generalize: N threads ke liye semaphore[i], thread i release kare semaphore[(i+1) % N]", keys: ["(i+1)", "i + 1", "% n", "mod n", "n threads", "array"] }
      ],
      answer: `<p><b>Semaphore chain:</b> <code>Semaphore[] s = { new Semaphore(1), new Semaphore(0), new Semaphore(0) };</code> Thread i ka loop: <code>s[i].acquire(); print(letter[i]); s[(i + 1) % 3].release();</code>. Isse N threads tak seedha badh jaata hai.</p>
        <p><b>wait/notify version:</b> shared <code>int turn = 0</code>. Thread i: <code>synchronized (lock) { while (turn % 3 != i) lock.wait(); print; turn++; lock.notifyAll(); }</code>. Yahan <code>notifyAll</code> zaroori hai, kyunki <code>notify</code> galat thread ko jaga sakta hai jo phir wait karega aur sahi thread kabhi nahi jaagega (missed signal ki tarah atkaav).</p>
        <p>ReentrantLock ke saath har thread ki alag <code>Condition</code> rakh ke sirf agle thread ko <code>signal()</code> kar sakte ho: bekaar jaagna band.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Code likhne se pehle zor se bolo: <i>\"Main shared lock + while-wait use karunga\"</i> ya <i>\"Do semaphores ka handoff\"</i>. Phir end condition ka case khud test karo (N odd, N = 1). Zyaadatar candidates ka code sahi print karta hai par program kabhi khatam nahi hota, kyunki ek thread wait mein reh jaata hai."
    }
  ],
  references: [
    { title: "Object.wait (Java 17 API): spurious wakeups, while loop", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html", type: "docs" },
    { title: "Semaphore (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Semaphore.html", type: "docs" },
    { title: "Print in Order", by: "LeetCode", url: "https://leetcode.com/problems/print-in-order/", type: "article" },
    { title: "Print FooBar Alternately", by: "LeetCode", url: "https://leetcode.com/problems/print-foobar-alternately/", type: "article" }
  ]
});
