// Callable, Future, CompletableFuture
registerLesson("concurrency", "future-completable", {
  why: "Microservices mein ek request ke liye 3-4 downstream calls parallel chalana roz ka kaam hai. Interview mein poochte hain: Future.get() kyun block karta hai, thenApply aur thenCompose mein kya farak hai, exception chain mein kaise aage jaata hai, aur async callbacks kis thread pool pe chalte hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: Zomato ka restaurant page</h2>
        <p>Restaurant page kholne pe server ko teen cheezein chahiye:</p>
        <ul>
          <li>Menu service: ~200ms</li>
          <li>Ratings service: ~150ms</li>
          <li>Offers service: ~100ms</li>
        </ul>
        <p>Ek ke baad ek call karo to <b>450ms</b>. Teeno independent hain, to parallel chala sakte hain: total ≈ sabse slow wala = <b>~200ms</b>.</p>
        <p>Executors lesson mein dekha: <code>pool.submit(callable)</code> ek <code>Future</code> deta hai. <b>Callable</b> = Runnable jaisa, par value return karta hai aur checked exception throw kar sakta hai. <b>Future</b> = "result baad mein milega" ki raseed.</p>
        <table>
          <tr><th></th><th><code>Runnable</code></th><th><code>Callable&lt;V&gt;</code></th></tr>
          <tr><td>Method</td><td><code>void run()</code></td><td><code>V call() throws Exception</code></td></tr>
          <tr><td>Result</td><td>Nahi</td><td>Haan, <code>Future&lt;V&gt;</code> se</td></tr>
          <tr><td>Checked exception</td><td>Nahi throw kar sakta</td><td>Kar sakta hai (get() pe <code>ExecutionException</code> mein lipat ke aata hai)</td></tr>
        </table>`
    },
    {
      type: "steps",
      title: "Sequential vs Future se parallel: main thread kab block hota hai",
      steps: [
        {
          title: "Sequential: main thread khud teeno calls karta hai",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>0-100</td><td>100-200</td><td>200-300</td><td>300-400</td><td>400-450</td></tr>
            <tr><th>main</th><td class="run">menu</td><td class="run">menu</td><td class="run">ratings</td><td class="run">ratings / offers</td><td class="run">offers</td></tr>
          </table><p>Total ~450ms. CPU zyaadatar idle hai, bas network ka wait.</p>`
        },
        {
          title: "Future: teeno submit, main turant free",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>0-100</td><td>100-150</td><td>150-200</td><td>200</td></tr>
            <tr><th>main</th><td class="run">submit x3, phir menuF.get()</td><td class="wait">get() pe WAITING</td><td class="wait">WAITING</td><td class="run">teeno result mile</td></tr>
            <tr><th>pool-1</th><td class="run">menu</td><td class="run">menu</td><td class="run">menu</td><td></td></tr>
            <tr><th>pool-2</th><td class="run">ratings</td><td class="run">ratings</td><td></td><td></td></tr>
            <tr><th>pool-3</th><td class="run">offers</td><td></td><td></td><td></td></tr>
          </table><p>Total ~200ms. Par dhyaan do: <code>get()</code> pe main thread <b>block</b> hota hai. Future se result lene ka aur koi tareeka nahi (sirf <code>isDone()</code> polling).</p>`
        },
        {
          title: "CompletableFuture: callback register karo, koi block nahi",
          html: `<table class="lanes">
            <tr><th>Time →</th><td>0-100</td><td>100-150</td><td>150-200</td><td>200</td></tr>
            <tr><th>main</th><td class="run">pipeline banao, return</td><td class="run">doosri request</td><td class="run">doosri request</td><td></td></tr>
            <tr><th>pool-1</th><td class="run">menu</td><td class="run">menu</td><td class="run">menu</td><td class="run">thenCombine: page banao</td></tr>
            <tr><th>pool-2</th><td class="run">ratings</td><td class="run">ratings</td><td></td><td></td></tr>
            <tr><th>pool-3</th><td class="run">offers</td><td></td><td></td><td></td></tr>
          </table><p>"Jab teeno aa jaayein tab ye karna" pehle se bata diya. Jo thread aakhri result complete karta hai, wahi aage ka step chala deta hai.</p>`
        }
      ]
    },
    {
      type: "code",
      title: "Future basics: get() block karta hai, get(timeout) TimeoutException deta hai, cancel(true) interrupt karta hai",
      code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Callable<Integer> ratings = () -> {
            Thread.sleep(30);           // fake network call
            return 42;
        };
        Future<Integer> f = pool.submit(ratings);
        System.out.println("submit ke turant baad isDone? " + f.isDone());
        System.out.println("get() (yahan main block hua): " + f.get());
        System.out.println("ab isDone? " + f.isDone());

        CountDownLatch never = new CountDownLatch(1);
        Future<String> slow = pool.submit(() -> {
            never.await();              // kabhi khatam nahi hoga (jab tak interrupt na ho)
            return "menu";
        });
        try {
            slow.get(50, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("50ms mein result nahi aaya: TimeoutException");
        }
        System.out.println("cancel(true): " + slow.cancel(true) + ", isCancelled: " + slow.isCancelled());

        Future<Integer> broken = pool.submit(() -> { throw new IllegalStateException("ratings DB down"); });
        try {
            broken.get();
        } catch (ExecutionException e) {
            System.out.println("ExecutionException, asli cause: " + e.getCause());
        }

        pool.shutdown();
        System.out.println("pool band? " + pool.awaitTermination(1, TimeUnit.SECONDS));
    }
}`,
      note: "Task ke andar ka exception <code>get()</code> pe <code>ExecutionException</code> mein lipat ke aata hai. Agar aapne get() kabhi call hi nahi kiya, to exception chup chaap gum ho jaata hai."
    },
    {
      type: "text",
      html: `
        <h2>Future ki limits, aur CompletableFuture</h2>
        <ul>
          <li>Result lene ka ek hi tareeka: <code>get()</code> (block) ya <code>isDone()</code> polling.</li>
          <li>"Ye ho jaaye to wo karo" (chaining) nahi likh sakte.</li>
          <li>Do futures ko combine karna, ya "sab poore hon tab" bolna: khud loop likho.</li>
          <li>Bahar se manually complete nahi kar sakte.</li>
        </ul>
        <p><code>CompletableFuture&lt;T&gt;</code> (Java 8) <code>Future</code> bhi hai aur <code>CompletionStage</code> bhi: aap pipeline banate ho, har stage pichle ke result pe chalta hai.</p>
        <h3>Main API</h3>
        <table>
          <tr><th>Method</th><th>Kya karta hai</th></tr>
          <tr><td><code>supplyAsync(supplier, executor)</code></td><td>Async task jo value deta hai. <code>runAsync</code> = bina value</td></tr>
          <tr><td><code>thenApply(fn)</code></td><td>Result ko transform karo (map): <code>T → U</code></td></tr>
          <tr><td><code>thenAccept(consumer)</code> / <code>thenRun</code></td><td>Result use karo, kuch return nahi</td></tr>
          <tr><td><code>thenCompose(fn)</code></td><td>Agla step khud async hai (<code>T → CompletableFuture&lt;U&gt;</code>), flatten karo (flatMap)</td></tr>
          <tr><td><code>thenCombine(other, bifn)</code></td><td>Do independent futures, dono ke result se ek value</td></tr>
          <tr><td><code>allOf(f1, f2, ...)</code></td><td>Sab poore hon tab complete (<code>CompletableFuture&lt;Void&gt;</code>, results khud join se nikaalo)</td></tr>
          <tr><td><code>anyOf(...)</code></td><td>Jo pehle poora ho uska result</td></tr>
          <tr><td><code>exceptionally(fn)</code></td><td>Error aaya to fallback value</td></tr>
          <tr><td><code>handle(bifn)</code></td><td>Result ya error dono milte hain, naya value return</td></tr>
          <tr><td><code>whenComplete(biconsumer)</code></td><td>Side effect (logging); result/error waisa hi aage jaata hai</td></tr>
          <tr><td><code>orTimeout</code> / <code>completeOnTimeout</code> (Java 9+)</td><td>Time limit: exception ya default value</td></tr>
          <tr><td><code>join()</code> vs <code>get()</code></td><td>Dono block karte hain. join unchecked <code>CompletionException</code> deta hai, get checked <code>ExecutionException</code></td></tr>
        </table>
        <h3>thenApply vs thenCompose vs thenCombine</h3>
        <table>
          <tr><th></th><th>thenApply</th><th>thenCompose</th><th>thenCombine</th></tr>
          <tr><td>Input</td><td>Ek result</td><td>Ek result</td><td>Do <b>independent</b> futures ke results</td></tr>
          <tr><td>Function return karta hai</td><td>Plain value <code>U</code></td><td><code>CompletableFuture&lt;U&gt;</code></td><td>Plain value <code>V</code></td></tr>
          <tr><td>Stream jaisa</td><td><code>map</code></td><td><code>flatMap</code></td><td><code>zip</code></td></tr>
          <tr><td>Example</td><td>price → "₹" + price</td><td>userId → fetchOrders(userId) (doosri async call, pehle wale pe depend)</td><td>menu + ratings → page</td></tr>
          <tr><td>Galat use</td><td>Async function ke saath: <code>CompletableFuture&lt;CompletableFuture&lt;U&gt;&gt;</code> ban jaata hai</td><td>Sync function ke saath: kaam karega par bekaar wrapping</td><td>Dependent calls ke liye: nahi ho sakta (dono pehle se start)</td></tr>
        </table>`
    },
    {
      type: "warn",
      html: "⚠️ <b>Default pool:</b> <code>supplyAsync(supplier)</code> bina executor ke <code>ForkJoinPool.commonPool()</code> pe chalta hai (official docs: agar commonPool ki parallelism 2 se kam ho, to har task ke liye naya thread). commonPool poore JVM mein shared hai, aur parallel streams bhi ise use karte hain. Usme blocking I/O (HTTP, DB) daaloge to baaki sab ka kaam ruk jaayega. <b>I/O ke liye apna executor pass karo:</b> <code>supplyAsync(supplier, ioPool)</code>."
    },
    {
      type: "code",
      title: "Pipeline: user → orders (thenCompose), total (thenApply), offer ke saath (thenCombine)",
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static ExecutorService io = Executors.newFixedThreadPool(3);

    static CompletableFuture<String> findUser(String phone) {
        return CompletableFuture.supplyAsync(() -> "user-" + phone.substring(6), io);
    }

    static CompletableFuture<List<Integer>> fetchOrders(String userId) {   // pehle user chahiye
        return CompletableFuture.supplyAsync(() -> List.of(250, 120, 430), io);
    }

    static CompletableFuture<Integer> cashbackPercent() {                   // independent call
        return CompletableFuture.supplyAsync(() -> 10, io);
    }

    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> total = findUser("9876543210")
                .thenCompose(Main::fetchOrders)                                      // async step, flatten
                .thenApply(list -> list.stream().mapToInt(Integer::intValue).sum()); // sync transform

        CompletableFuture<String> summary = total.thenCombine(cashbackPercent(),
                (sum, pct) -> "total=" + sum + ", cashback=" + (sum * pct / 100));

        System.out.println(summary.get(1, TimeUnit.SECONDS));

        // Galti: thenApply ke saath async function → future ke andar future
        CompletableFuture<CompletableFuture<List<Integer>>> nested = findUser("9876543210").thenApply(Main::fetchOrders);
        System.out.println("thenApply + async fn ka type: future ke andar future, andar wala = " + nested.get().get());

        io.shutdown();
        io.awaitTermination(1, TimeUnit.SECONDS);
    }
}`,
      note: "<code>get(1, SECONDS)</code> yahan sirf demo ke end mein result print karne ke liye hai. Server code mein pipeline return karo (jaise Spring WebFlux / async servlet), block mat karo."
    },
    {
      type: "code",
      title: "allOf: teeno services parallel, phir sab results join se (results order fixed)",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService io = Executors.newFixedThreadPool(3);
        Map<String, Integer> latencyMs = new LinkedHashMap<>();
        latencyMs.put("menu", 60);
        latencyMs.put("ratings", 40);
        latencyMs.put("offers", 20);

        List<CompletableFuture<String>> calls = latencyMs.entrySet().stream()
                .map(e -> CompletableFuture.supplyAsync(() -> {
                    try { Thread.sleep(e.getValue()); } catch (InterruptedException ex) { throw new RuntimeException(ex); }
                    return e.getKey() + " ok";
                }, io))
                .collect(Collectors.toList());

        CompletableFuture<Void> all = CompletableFuture.allOf(calls.toArray(new CompletableFuture[0]));
        CompletableFuture<List<String>> page = all.thenApply(v ->
                calls.stream().map(CompletableFuture::join).collect(Collectors.toList())); // ab join block nahi karega

        System.out.println(page.get(2, TimeUnit.SECONDS));
        io.shutdown();
        io.awaitTermination(1, TimeUnit.SECONDS);
    }
}`,
      note: "Kaunsa call pehle khatam hua, isse list ka order nahi badalta, kyunki hum <code>calls</code> list ke order mein join karte hain. Total time ≈ sabse slow (60ms), 120ms nahi."
    },
    {
      type: "code",
      title: "Exception handling: exceptionally vs handle vs whenComplete, aur join ka CompletionException",
      code: `import java.util.concurrent.*;

public class Main {
    static CompletableFuture<Integer> price(boolean fail) {
        return CompletableFuture.supplyAsync(() -> {
            if (fail) throw new IllegalStateException("pricing service down");
            return 100;
        });
    }

    public static void main(String[] args) {
        // 1. Exception chain mein aage jaata hai: thenApply SKIP hota hai
        int a = price(true)
                .thenApply(p -> p * 2)                  // nahi chalega
                .exceptionally(ex -> -1)                // fallback
                .join();
        System.out.println("exceptionally: " + a);

        // 2. handle: success aur failure dono ek jagah
        String b = price(false).handle((p, ex) -> ex == null ? "price " + p : "error").join();
        String c = price(true).handle((p, ex) -> ex == null ? "price " + p : "error: " + ex.getCause().getMessage()).join();
        System.out.println("handle: " + b + " | " + c);

        // 3. whenComplete: sirf dekhta hai (log), error ko theek nahi karta
        try {
            price(true).whenComplete((p, ex) -> System.out.println("log: failed? " + (ex != null))).join();
        } catch (CompletionException e) {
            System.out.println("join ne CompletionException diya, cause: " + e.getCause().getClass().getSimpleName());
        }

        // 4. Timeout ke saath default value (Java 9+)
        int d = new CompletableFuture<Integer>().completeOnTimeout(0, 50, TimeUnit.MILLISECONDS).join();
        System.out.println("completeOnTimeout: " + d);
    }
}`,
      note: "Callback ke andar <code>ex</code> aksar <code>CompletionException</code> hota hai jiske andar asli exception hai (isliye <code>getCause()</code>). Ye demo commonPool use karta hai; commonPool ke threads daemon hain, isliye shutdown ki zaroorat nahi."
    },
    {
      type: "quiz",
      q: "<code>supplyAsync(() -&gt; 5).thenApply(x -&gt; x / 0).thenApply(x -&gt; x + 1).exceptionally(ex -&gt; 99).thenApply(x -&gt; x * 2).join()</code> kya dega?",
      options: [
        "ArithmeticException throw hoga",
        "99",
        "198",
        "12"
      ],
      answer: 2,
      why: "<code>x / 0</code> pe exception. Agla <code>thenApply(x + 1)</code> skip. <code>exceptionally</code> 99 deta hai aur chain normal ho jaati hai, isliye aakhri <code>thenApply</code> chalta hai: 99 × 2 = 198."
    },
    {
      type: "quiz",
      q: "<code>getUser(id)</code> ek <code>CompletableFuture&lt;User&gt;</code> deta hai aur <code>getCart(user)</code> bhi ek <code>CompletableFuture&lt;Cart&gt;</code>. Cart chahiye. Sahi kya hai?",
      options: [
        "<code>getUser(id).thenApply(u -&gt; getCart(u))</code>",
        "<code>getUser(id).thenCompose(u -&gt; getCart(u))</code>",
        "<code>getUser(id).thenCombine(getCart(u), ...)</code>",
        "<code>CompletableFuture.allOf(getUser(id), getCart(u))</code>"
      ],
      answer: 1,
      why: "Doosri call pehli ke result pe depend karti hai aur khud future deti hai: <code>thenCompose</code> (flatMap). thenApply se <code>CompletableFuture&lt;CompletableFuture&lt;Cart&gt;&gt;</code> banega. thenCombine aur allOf independent futures ke liye hain; yahan <code>u</code> pehle se hai hi nahi."
    },
    {
      type: "exercise",
      id: "ex-checkout-cf",
      title: "Checkout amount: CompletableFuture se compose karo",
      level: "Medium",
      task: `<p><code>finalAmount(ex, cartTotal, couponDiscount, deliveryFee)</code> ek <code>CompletableFuture&lt;Integer&gt;</code> return kare:</p>
        <ul>
          <li><code>cartTotal</code> aur <code>deliveryFee</code> (dono <code>Supplier&lt;Integer&gt;</code>, slow calls) <b>parallel</b> chalein, diye gaye executor <code>ex</code> pe.</li>
          <li>Total aane ke baad <code>couponDiscount.apply(total)</code> call karo: ye khud ek <code>CompletableFuture&lt;Integer&gt;</code> (discount) deta hai.</li>
          <li>Answer = <code>total - discount + fee</code>.</li>
          <li>Coupon service fail ho (future exceptionally complete) to discount <b>0</b>. Delivery fee fail ho to fee <b>50</b>.</li>
          <li>Method <b>block nahi</b> karna chahiye (andar <code>join/get</code> nahi). Harness check karta hai ki future turant return hua.</li>
        </ul>
        <p>Harness 4 threads (<code>shop-1</code>...) wala pool deta hai, aur parallel check ke liye dono suppliers ek doosre ka 1 second tak wait karte hain: ek ke baad ek chalaya to wo fail ho jaayega.</p>`,
      examples: "total 500, discount = 10% of total (50), fee 30 → <code>480</code><br>coupon fail, total 500, fee 30 → <code>530</code>",
      userFile: "Solution.java",
      starter: `import java.util.concurrent.*;
import java.util.function.*;

class Solution {
    CompletableFuture<Integer> finalAmount(Executor ex,
                                           Supplier<Integer> cartTotal,
                                           Function<Integer, CompletableFuture<Integer>> couponDiscount,
                                           Supplier<Integer> deliveryFee) {
        int total = cartTotal.get();   // TODO: async, parallel, non-blocking
        return CompletableFuture.completedFuture(total);
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;

public class Main {
    static ExecutorService pool() {
        AtomicInteger n = new AtomicInteger();
        return Executors.newFixedThreadPool(4, r -> {
            Thread t = new Thread(r, "shop-" + n.incrementAndGet());
            t.setDaemon(true);
            return t;
        });
    }

    static void close(ExecutorService p) {
        p.shutdownNow();
        try { p.awaitTermination(1, TimeUnit.SECONDS); } catch (InterruptedException e) { }
    }

    static Object run(int total, Function<Integer, CompletableFuture<Integer>> coupon, Supplier<Integer> fee) {
        ExecutorService p = pool();
        try {
            return new Solution().finalAmount(p, () -> total, coupon, fee).get(2, TimeUnit.SECONDS);
        } catch (Exception e) {
            return "💥 " + e;
        } finally { close(p); }
    }

    static Function<Integer, CompletableFuture<Integer>> tenPercent() {
        return t -> CompletableFuture.completedFuture(t / 10);
    }

    public static void main(String[] args) {
        Check.eq("total 500, discount 10%, fee 30", 480, () -> run(500, tenPercent(), () -> 30));
        Check.eq("coupon fail, total 500, fee 30", 530, () -> run(500,
                t -> CompletableFuture.failedFuture(new RuntimeException("coupon down")), () -> 30));
        Check.hiddenFromHere();
        Check.eq("delivery fee fail → 50", 500, () -> run(500, tenPercent(), () -> { throw new RuntimeException("maps down"); }));
        Check.eq("dono fail → total + 50", 1050, () -> run(1000,
                t -> CompletableFuture.failedFuture(new RuntimeException("x")), () -> { throw new RuntimeException("y"); }));
        Check.eq("coupon ko asli total mila", 777, () -> {
            AtomicInteger seen = new AtomicInteger(-1);
            run(777, t -> { seen.set(t); return CompletableFuture.completedFuture(0); }, () -> 0);
            return seen.get();
        });
        Check.eq("total aur fee parallel chale, shop pool pe", List.of(true, true), () -> {
            ExecutorService p = pool();
            CountDownLatch both = new CountDownLatch(2);
            Set<String> threads = ConcurrentHashMap.newKeySet();
            Supplier<Integer> total = () -> {
                threads.add(Thread.currentThread().getName());
                both.countDown();
                try { if (!both.await(1, TimeUnit.SECONDS)) return -100000; } catch (InterruptedException e) { }
                return 400;
            };
            Supplier<Integer> fee = () -> {
                threads.add(Thread.currentThread().getName());
                both.countDown();
                try { if (!both.await(1, TimeUnit.SECONDS)) return -100000; } catch (InterruptedException e) { }
                return 40;
            };
            try {
                int got = new Solution().finalAmount(p, total, tenPercent(), fee).get(3, TimeUnit.SECONDS);
                boolean onPool = !threads.isEmpty() && threads.stream().allMatch(s -> s.startsWith("shop-"));
                return List.of(got == 400, onPool);
            } catch (Exception e) {
                return List.of("💥 " + e);
            } finally { close(p); }
        });
        Check.eq("method turant return kare (block na kare)", true, () -> {
            ExecutorService p = pool();
            CountDownLatch gate = new CountDownLatch(1);
            Supplier<Integer> slowTotal = () -> {
                try { gate.await(300, TimeUnit.MILLISECONDS); } catch (InterruptedException e) { }
                return 100;
            };
            try {
                CompletableFuture<Integer> f = new Solution().finalAmount(p, slowTotal, tenPercent(), () -> 10);
                boolean pending = !f.isDone();
                gate.countDown();
                return pending && f.get(2, TimeUnit.SECONDS) == 100;
            } catch (Exception e) {
                return false;
            } finally { gate.countDown(); close(p); }
        });
    }
}`,
      hints: [
        "Dono slow calls pehle start karo: <code>var totalF = CompletableFuture.supplyAsync(cartTotal, ex);</code> aur <code>var feeF = CompletableFuture.supplyAsync(deliveryFee, ex).exceptionally(e -&gt; 50);</code>",
        "Discount total pe depend karta hai aur khud future hai: <code>thenCompose</code>. Andar <code>couponDiscount.apply(t).exceptionally(e -&gt; 0).thenApply(d -&gt; t - d)</code>.",
        "Aakhir mein <code>afterDiscount.thenCombine(feeF, Integer::sum)</code> return karo. Koi join/get nahi."
      ],
      solution: `import java.util.concurrent.*;
import java.util.function.*;

class Solution {
    CompletableFuture<Integer> finalAmount(Executor ex,
                                           Supplier<Integer> cartTotal,
                                           Function<Integer, CompletableFuture<Integer>> couponDiscount,
                                           Supplier<Integer> deliveryFee) {
        CompletableFuture<Integer> totalF = CompletableFuture.supplyAsync(cartTotal, ex);
        CompletableFuture<Integer> feeF = CompletableFuture.supplyAsync(deliveryFee, ex)
                .exceptionally(e -> 50);                          // fee service down → flat 50

        CompletableFuture<Integer> afterDiscount = totalF.thenCompose(t ->
                couponDiscount.apply(t)
                        .exceptionally(e -> 0)                    // coupon fail → koi discount nahi
                        .thenApply(d -> t - d));

        return afterDiscount.thenCombine(feeF, Integer::sum);     // dono independent results jodo
    }
}`,
      explain: "<p>Total aur fee independent hain, isliye dono <code>supplyAsync(..., ex)</code> se turant start: total time ≈ max(total, fee) + coupon. Discount total pe depend karta hai aur async hai, isliye <code>thenCompose</code>. Do independent results jodne ke liye <code>thenCombine</code>.</p><p><code>exceptionally</code> ko sahi jagah lagana zaroori hai: fee wale future pe lagaya to sirf fee ki failure 50 banti hai; coupon wale pe lagaya to sirf coupon ki. Poori chain ke end mein lagate to ek failure poore jawab ko fallback bana deta. Method mein koi blocking nahi, isliye ye ek request thread ko hold nahi karta.</p>"
    },
    {
      type: "think",
      id: "think-cf-interview",
      q: "Interview question: <b>\"Future aur CompletableFuture mein kya farak hai? thenApply aur thenCompose kab use karoge? Aur supplyAsync ke callbacks kis thread pe chalte hain?\"</b>",
      rubric: [
        { point: "Future sirf blocking <b>get()</b> deta hai; CompletableFuture mein <b>chaining/callbacks</b>, combine, manual complete", keys: ["get() block", "blocking", "block", "callback", "chain", "non-blocking", "compose"], weight: 2 },
        { point: "<b>thenApply</b> = sync transform (map), <b>thenCompose</b> = async dependent step (flatMap), nesting se bachata hai", keys: ["map", "flatmap", "flatten", "nested", "future ke andar future", "dependent"], weight: 2 },
        { point: "<b>thenCombine / allOf</b> independent futures ke liye", keys: ["thencombine", "allof", "independent", "parallel"] },
        { point: "Default executor <b>ForkJoinPool.commonPool()</b>; I/O ke liye apna executor do", keys: ["commonpool", "common pool", "forkjoin", "apna executor", "custom executor", "own executor"], weight: 2 },
        { point: "Exceptions: <b>exceptionally / handle</b>, join → CompletionException, get → ExecutionException", keys: ["exceptionally", "handle", "completionexception", "executionexception", "whencomplete"] }
      ],
      answer: `<p><b>Future:</b> result ka handle, par sirf <code>get()</code> (blocking) ya <code>isDone()</code> polling. Chaining, combining, ya callback nahi.</p>
        <p><b>CompletableFuture:</b> Future + CompletionStage. Pipeline bana sakte ho: <code>thenApply</code> (map: sync transform), <code>thenCompose</code> (flatMap: agla step khud async aur pichle pe dependent, warna <code>CompletableFuture&lt;CompletableFuture&lt;T&gt;&gt;</code>), <code>thenCombine</code>/<code>allOf</code> (independent futures jodna). Errors: <code>exceptionally</code> (fallback), <code>handle</code> (result ya error), <code>whenComplete</code> (sirf log). <code>join()</code> unchecked <code>CompletionException</code> deta hai, <code>get()</code> checked <code>ExecutionException</code>. Timeouts: <code>orTimeout</code>, <code>completeOnTimeout</code> (Java 9+).</p>
        <p><b>Threads:</b> <code>*Async</code> methods bina executor ke <code>ForkJoinPool.commonPool()</code> pe chalte hain (JVM-wide shared). Non-async <code>thenApply</code> us thread pe chalta hai jo pichla stage complete karta hai, ya caller thread pe agar stage pehle hi complete ho. Blocking I/O ke liye hamesha apna bounded executor pass karo, taaki commonPool starve na ho.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"thenApply vs thenCompose\" ka jawab ek line mein do: <i>\"thenApply map hai, thenCompose flatMap hai\"</i>, phir user → orders ka example. Aur bina pooche bol do ki production mein <code>supplyAsync</code> ko hamesha apna executor dete ho, kyunki commonPool shared hai. Ye ek line senior aur junior ka farak dikhati hai."
    }
  ],
  references: [
    { title: "CompletableFuture (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletableFuture.html", type: "docs" },
    { title: "Future (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/Future.html", type: "docs" },
    { title: "ForkJoinPool (commonPool) (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ForkJoinPool.html", type: "docs" },
    { title: "Java Concurrency in Practice (Ch. 6: Task Execution)", by: "Brian Goetz et al.", url: "https://jcip.net/", type: "book" }
  ]
});
