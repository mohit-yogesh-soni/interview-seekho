// Classic: Rate Limiter (Token Bucket)
registerLesson("concurrency", "rate-limiter-code", {
  why: "\"Rate limiter ka code likho\" LLD + concurrency ka combined question hai (Stripe, Uber, Razorpay jaise interviews). Token bucket ka logic, burst ka matlab, time ko test-able banana, aur multi-thread mein sahi rehna: sab ek question mein.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem</h2>
        <p>OTP API pe ek user <b>10 requests per second</b> se zyada na bheje. Zyada aaye to HTTP <b>429 Too Many Requests</b>. Par thoda <b>burst</b> chalega: user 2 second chup raha to ek saath 10 tak bhej sake.</p>
        <h3>Common algorithms</h3>
        <table>
          <tr><th>Algorithm</th><th>Idea</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td><b>Fixed window</b></td><td>Har second ka counter (12:00:01 mein 10 tak)</td><td>Sabse simple, ek counter</td><td>Boundary burst: 12:00:00.9 pe 10 aur 12:00:01.1 pe 10 = 0.2s mein 20</td></tr>
          <tr><td><b>Sliding window log</b></td><td>Har request ka timestamp rakho, pichhle 1s ke gino</td><td>Exact</td><td>Memory: har request ka timestamp</td></tr>
          <tr><td><b>Sliding window counter</b></td><td>Pichhli aur current window ka weighted mix</td><td>Kam memory, almost exact</td><td>Approximation</td></tr>
          <tr><td><b>Token bucket</b> ⭐</td><td>Bucket mein tokens (max = capacity), fixed rate se refill. Request = ek token</td><td>Burst allow (capacity tak), average rate fix, O(1) memory</td><td>Do parameters tune karne padte hain</td></tr>
          <tr><td><b>Leaky bucket</b></td><td>Requests queue mein, fixed rate se nikalti hain</td><td>Output bilkul smooth</td><td>Burst bhi delay hota hai</td></tr>
        </table>
        <p>AWS API Gateway token bucket model use karta hai (rate + burst limit). Guava ka <code>RateLimiter</code> bhi isi family ka hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Token bucket: lazy refill (timer thread ke bina)</h2>
        <p>Naive idea: ek background thread har 100ms bucket bhare. Har user ke liye thread? Lakhon users = bekaar. <b>Better:</b> refill ka hisaab request aane pe karo:</p>
        <pre class="code-static">capacity = 10 tokens, refillRate = 10 tokens/sec

tryAcquire(now):
    elapsed = now - lastRefill
    tokens  = min(capacity, tokens + elapsed * refillRate)   // jitna time beeta, utne tokens
    lastRefill = now
    if tokens &gt;= 1: tokens -= 1; return ALLOW
    else: return DENY (429)</pre>
        <p>Har user ke liye sirf do numbers: <code>tokens</code> aur <code>lastRefill</code>. O(1) time, O(1) memory.</p>
        <p><b>Testing trick:</b> <code>System.currentTimeMillis()</code> seedha mat padho. Time ko <b>inject</b> karo (parameter ya <code>Clock</code> / <code>LongSupplier</code>), taaki test mein "2 second aage badho" ek line mein ho jaaye, <code>Thread.sleep</code> ke bina. Interviewer isko design maturity maanta hai.</p>`
    },
    {
      type: "steps",
      title: "capacity 3, refill 1 token/sec",
      steps: [
        { title: "t = 0s: bucket full (3)", html: `<div class="arr"><span class="cell ok">🪙</span><span class="cell ok">🪙</span><span class="cell ok">🪙</span></div><p>3 requests ek saath aayi → teeno ALLOW (burst). Tokens 0.</p>` },
        { title: "t = 0.2s: 4th request", html: `<div class="arr"><span class="cell dim">-</span><span class="cell dim">-</span><span class="cell dim">-</span></div><p>Refill = 0.2 × 1 = 0.2 token. 0.2 &lt; 1 → <b>DENY (429)</b>.</p>` },
        { title: "t = 1.2s: refill 1.0 → 1.2 tokens", html: `<div class="arr"><span class="cell ok">🪙</span><span class="cell hl">0.2</span><span class="cell dim">-</span></div><p>Request ALLOW, tokens 0.2 bache. Fractional tokens rakhna zaroori hai, warna refill ka time kho jaata hai.</p>` },
        { title: "t = 10s: user der tak chup", html: `<div class="arr"><span class="cell ok">🪙</span><span class="cell ok">🪙</span><span class="cell ok">🪙</span></div><p>Refill 8.8 token hoga, par <b>min(capacity)</b> se sirf 3. Burst kabhi capacity se zyada nahi.</p>` }
      ]
    },
    {
      type: "code",
      title: "Token bucket + fake clock: thread-safe, test-able",
      code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.LongSupplier;

public class Main {
    static class TokenBucket {
        private final long capacity;
        private final double refillPerMs;
        private final LongSupplier clockMs;
        private double tokens;
        private long last;

        TokenBucket(long capacity, double refillPerSec, LongSupplier clockMs) {
            this.capacity = capacity;
            this.refillPerMs = refillPerSec / 1000.0;
            this.clockMs = clockMs;
            this.tokens = capacity;                  // shuru mein full
            this.last = clockMs.getAsLong();
        }

        synchronized boolean tryAcquire() {          // refill + check + minus: ek atomic step
            long now = clockMs.getAsLong();
            tokens = Math.min(capacity, tokens + (now - last) * refillPerMs);
            last = now;
            if (tokens >= 1) { tokens -= 1; return true; }
            return false;
        }
    }

    public static void main(String[] args) throws Exception {
        AtomicLong fakeNow = new AtomicLong(0);
        TokenBucket b = new TokenBucket(3, 1.0, fakeNow::get);

        StringBuilder sb = new StringBuilder("t=0    : ");
        for (int i = 0; i < 4; i++) sb.append(b.tryAcquire() ? "ALLOW " : "DENY ");
        System.out.println(sb);
        fakeNow.set(1200);
        System.out.println("t=1.2s : " + (b.tryAcquire() ? "ALLOW" : "DENY") + ", phir " + (b.tryAcquire() ? "ALLOW" : "DENY"));
        fakeNow.set(10_000);
        int ok = 0;
        for (int i = 0; i < 10; i++) if (b.tryAcquire()) ok++;
        System.out.println("t=10s  : 10 mein se allow = " + ok + " (capacity 3)");

        // 8 threads, time ruka hua: total exactly capacity tak hi allow
        AtomicLong frozen = new AtomicLong(0);
        TokenBucket shared = new TokenBucket(100, 10, frozen::get);
        AtomicInteger allowed = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++) pool.submit(() -> { for (int i = 0; i < 50; i++) if (shared.tryAcquire()) allowed.incrementAndGet(); });
        pool.shutdown();
        pool.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("8 threads x 50 calls, capacity 100 → allowed = " + allowed.get());
    }
}`,
      note: "<code>synchronized</code> zaroori hai: \"tokens padho → refill → check → minus\" ek read-modify-write hai. Bina lock, do threads ek hi aakhri token dono le sakte hain."
    },
    {
      type: "quiz",
      q: "Fixed window limiter: 10 req/min, window har minute ke shuru pe reset. User 12:00:59 pe 10 aur 12:01:00 pe 10 requests bhejta hai. Kitni allow hongi aur kyun dikkat hai?",
      options: [
        "10, kyunki limit 10/min hai",
        "20: dono alag windows mein hain. 1 second mein 20, yaani limit ka double burst",
        "0, dono windows block",
        "15, fixed window average leta hai"
      ],
      answer: 1,
      why: "Fixed window boundary pe counter reset hota hai, isliye window ke edge ke dono taraf full limit use ho sakti hai. Sliding window ya token bucket ye problem kam/khatam karte hain."
    },
    {
      type: "exercise",
      id: "ex-token-bucket",
      title: "Per-user Token Bucket rate limiter (time injected)",
      level: "Medium",
      task: `<p><code>RateLimiter(capacity, refillPerSecond)</code> banao jo <b>har user ki alag bucket</b> rakhe:</p>
        <ul>
          <li><code>boolean allow(String userId, long nowMs)</code>: us user ki bucket refill karo (jitna time beeta, fractional tokens bhi), capacity se upar nahi; token ho to 1 minus karke <code>true</code>, warna <code>false</code>.</li>
          <li>Naya user pehli baar aaye to uski bucket <b>full</b> se shuru (aur us time ko last refill maano).</li>
          <li>Kai threads ek saath <code>allow</code> call kar sakte hain (same ya alag users). Same user ke liye kabhi bhi capacity + refill se zyada allow nahi hona chahiye.</li>
          <li>Time hamesha parameter se lo, <code>System.currentTimeMillis()</code> nahi (tests fake time dete hain).</li>
        </ul>`,
      examples: "capacity 2, 1/sec: <code>allow(\"a\", 0)</code> → true, true, false · <code>allow(\"a\", 1000)</code> → true · <code>allow(\"b\", 0)</code> → true (alag bucket)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class RateLimiter {
    private final long capacity;
    private final double refillPerSecond;
    private final Map<String, Integer> used = new HashMap<>();

    RateLimiter(long capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
    }

    boolean allow(String userId, long nowMs) {
        // TODO: ye refill hi nahi karta, aur thread-safe bhi nahi
        int u = used.getOrDefault(userId, 0);
        if (u < capacity) { used.put(userId, u + 1); return true; }
        return false;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static List<Boolean> seq(RateLimiter r, String u, long... times) {
        List<Boolean> out = new ArrayList<>();
        for (long t : times) out.add(r.allow(u, t));
        return out;
    }

    static int hammer(RateLimiter r, int threads, int calls, String... users) {
        AtomicInteger ok = new AtomicInteger();
        ExecutorService p = Executors.newFixedThreadPool(threads);
        CountDownLatch go = new CountDownLatch(1);
        for (int t = 0; t < threads; t++) {
            int id = t;
            p.submit(() -> {
                try { go.await(); } catch (InterruptedException e) { return; }
                for (int i = 0; i < calls; i++) if (r.allow(users[(id + i) % users.length], 5000)) ok.incrementAndGet();
            });
        }
        go.countDown();
        p.shutdown();
        try { p.awaitTermination(3, TimeUnit.SECONDS); } catch (InterruptedException e) { }
        return ok.get();
    }

    public static void main(String[] args) {
        Check.eq("cap 2, 1/s: t=0,0,0,1000", List.of(true, true, false, true), () -> seq(new RateLimiter(2, 1), "a", 0, 0, 0, 1000));
        Check.eq("alag users alag bucket", List.of(true, true), () -> {
            RateLimiter r = new RateLimiter(1, 1);
            return List.of(r.allow("a", 0), r.allow("b", 0));
        });
        Check.hiddenFromHere();
        Check.eq("fractional refill: 2/s, cap 1: t=0,250,500", List.of(true, false, true), () -> seq(new RateLimiter(1, 2), "a", 0, 250, 500));
        Check.eq("capacity se upar refill nahi: cap 3, 1/s, 100s chup, phir 5 calls", List.of(true, true, true, true, false, false, false, false),
            () -> seq(new RateLimiter(3, 1), "a", 0, 100_000, 100_000, 100_000, 100_000, 100_000, 100_000, 100_000));
        Check.eq("naya user late aaye to full se shuru: t=50000", List.of(true, true, false), () -> seq(new RateLimiter(2, 0.001), "late", 50_000, 50_000, 50_000));
        Check.eq("refill time kho na jaaye: 1/s, cap 1, t=0,900,1100,1999,2300", List.of(true, false, true, false, true),
            () -> seq(new RateLimiter(1, 1), "a", 0, 900, 1100, 1999, 2300));
        Check.eq("16 threads x 200 calls, ek user, cap 50, time ruka: allowed", 50, () -> hammer(new RateLimiter(50, 1), 16, 200, "u"));
        Check.eq("16 threads, 4 users, cap 25 each: allowed", 100, () -> hammer(new RateLimiter(25, 1), 16, 200, "a", "b", "c", "d"));
    }
}`,
      hints: [
        "Har user ke liye ek chhoti class: <code>class Bucket { double tokens; long last; }</code>. Map: <code>ConcurrentHashMap&lt;String, Bucket&gt;</code>, naya bucket <code>computeIfAbsent(user, k -&gt; new Bucket(capacity, nowMs))</code>.",
        "Refill: <code>tokens = Math.min(capacity, tokens + (now - last) * refillPerSecond / 1000.0); last = now;</code>",
        "Thread-safety: refill + check + minus ek saath, per bucket: <code>synchronized (bucket) { ... }</code>. Isse alag users ek doosre ko block nahi karte."
      ],
      solution: `import java.util.concurrent.ConcurrentHashMap;

class RateLimiter {
    private static final class Bucket {
        double tokens;
        long last;
        Bucket(double tokens, long last) { this.tokens = tokens; this.last = last; }
    }

    private final long capacity;
    private final double refillPerMs;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    RateLimiter(long capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerMs = refillPerSecond / 1000.0;
    }

    boolean allow(String userId, long nowMs) {
        Bucket b = buckets.computeIfAbsent(userId, k -> new Bucket(capacity, nowMs));
        synchronized (b) {                               // per-user lock
            if (nowMs > b.last) {
                b.tokens = Math.min(capacity, b.tokens + (nowMs - b.last) * refillPerMs);
                b.last = nowMs;
            }
            if (b.tokens >= 1) {
                b.tokens -= 1;
                return true;
            }
            return false;
        }
    }
}`,
      explain: "<p><b>Lazy refill</b>: koi timer thread nahi, har call pe beete time se tokens jodo. Fractional tokens (<code>double</code>) se 0.5s wala hissa kho nahi jaata. <code>min(capacity)</code> burst ko limit karta hai.</p><p><b>Concurrency:</b> <code>computeIfAbsent</code> ek user ke liye ek hi Bucket banata hai (atomic). Har bucket pe alag <code>synchronized</code>, isliye ek user ki traffic doosre ko slow nahi karti. <code>nowMs &gt; last</code> check se agar threads thode purane timestamps ke saath aayein to time ulta nahi chalta.</p><p>O(1) per call, O(users) memory. Production mein inactive users ki buckets hatao (TTL / Caffeine cache), aur kai servers ke liye ye state Redis mein (HLD rate limiter lesson).</p>"
    },
    {
      type: "think",
      id: "think-rl-distributed",
      q: "Follow-up: <b>\"Aapka API 20 servers pe chal raha hai, load balancer ke peeche. Har user ka limit 100 req/min poore system mein hona chahiye. In-memory token bucket kaam karega? Kaise karoge?\"</b>",
      rubric: [
        { point: "In-memory har server ka alag: user ko effectively 20 × 100 mil jaayega", keys: ["har server", "alag", "20 x", "20×", "2000", "local", "per server"], weight: 2 },
        { point: "Shared state <b>Redis</b> mein (central store)", keys: ["redis", "central", "shared store", "memcache"], weight: 2 },
        { point: "Atomicity: <b>Lua script</b> / INCR + EXPIRE, taaki read-modify-write ek step ho", keys: ["lua", "incr", "expire", "atomic", "script", "multi"], weight: 2 },
        { point: "Trade-offs: Redis latency / failure pe fail-open ya fail-closed; ya local limit = global / N approximation", keys: ["latency", "fail open", "fail-open", "fail closed", "approx", "/ n", "sticky"] }
      ],
      answer: `<p>In-memory bucket har server ki apni hogi. LB requests baantega, to user ko effectively <b>20 × 100</b> per minute mil sakti hain. Galat.</p>
        <ul>
          <li><b>Central store:</b> Redis mein per-user key (<code>rl:user42</code>) jisme tokens + last timestamp, ya fixed/sliding window counters.</li>
          <li><b>Atomic update:</b> refill + check + decrement ek <b>Lua script</b> mein (Redis script ko atomically chalata hai). Simple version: <code>INCR</code> + <code>EXPIRE</code> per window (fixed window).</li>
          <li><b>Trade-offs:</b> har request pe ek Redis round-trip (~1ms). Redis down ho to <i>fail-open</i> (allow, availability) ya <i>fail-closed</i> (deny, safety): business decide kare. Bahut high scale pe: local bucket with limit/N + periodic sync (approximate).</li>
        </ul>
        <p>Detail HLD module ke "Distributed Rate Limiter" design mein hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Code se pehle 3 sawaal poocho: <i>\"Limit per user hai ya per API key / IP? Burst allow hai? Single server ya distributed?\"</i> Phir token bucket choose karo aur bolo kyun (burst + O(1)). Aur time ko inject karna mat bhoolna: \"isse main ise bina sleep ke unit test kar sakta hoon.\""
    }
  ],
  references: [
    { title: "Hello Interview: System Design (rate limiter in core concepts / problems)", by: "Hello Interview", url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview", type: "course" },
    { title: "System Design Primer", by: "Donne Martin", url: "https://github.com/donnemartin/system-design-primer", type: "article" },
    { title: "Redis docs (INCR, EXPIRE, Lua scripting)", by: "Redis", url: "https://redis.io/docs/latest/", type: "docs" },
    { title: "System Design Interview Vol. 1, Ch. 4: Design a rate limiter", by: "Alex Xu (ByteByteGo)", url: "https://bytebytego.com/", type: "book" }
  ]
});
