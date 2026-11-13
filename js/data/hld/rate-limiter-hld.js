// Distributed Rate Limiter (evolution style: 1 server → kai servers → kya toota → options → decision)
registerLesson("hld", "rate-limiter-hld", {
  why: `Rate limiter chhota dikhta hai par isme distributed systems ki teen classic problems hain: shared state kahan rakho, race condition kaise roko, aur jab shared store gire tab kya karo. Hum ek server ke in-memory counter se shuru karenge aur dekhenge har step pe kya toot-ta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements</h2>
        <p>Ek public API hai (jaise payments ya maps API). Kuch clients galti se loop mein requests bhejte hain, kuch jaan-boojh ke scraping karte hain. Ek client ki wajah se baaki sab slow ho jaate hain. Isliye limit chahiye.</p>
        <ul>
          <li><b>Functional:</b> har API key ko, jaise, 100 requests/minute. Limit cross ho to <code>429 Too Many Requests</code> aur <code>Retry-After</code> header, taaki client ko pata ho kab dobara try kare. Alag endpoints ki alag limit ho sakti hai (login pe kam, read pe zyada).</li>
          <li><b>Non-functional:</b> har request pe check hoga, isliye overhead bahut kam (~1-2 ms). Limiter khud down ho to poori API down nahi honi chahiye. Thodi si inaccuracy (101 ya 102 requests nikal jaana) chalegi, 10× nikal jaana nahi.</li>
        </ul>
        <p>Pehla sawaal: <b>ginti kaise karein?</b> Ye algorithm ka sawaal hai, aur ye ek server pe bhi utna hi zaroori hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: ek server, memory mein counter</h2>
        <p>Shuru mein API ek hi server pe hai. Har API key ka counter server ki memory (ek HashMap) mein. Koi Redis nahi, kyunki state share karne wala koi dusra server hi nahi hai.</p>
        <h3>Ginti ke tareeke (algorithms)</h3>
        <table>
          <tr><th>Algorithm</th><th>Kaise kaam karta hai</th><th>Kami</th><th>Memory per key</th></tr>
          <tr><td>Fixed window</td><td>Har minute ka ek counter (10:00-10:01). 100 ke baad reject.</td><td>Boundary burst: 10:00:59 pe 100 aur 10:01:00 pe 100 = 2 second mein 200 requests.</td><td>1 number</td></tr>
          <tr><td>Sliding log</td><td>Har request ka timestamp list mein. Pichhle 60s ke timestamps gino.</td><td>Bilkul exact, par 100 limit = 100 timestamps per key. Badi limits pe memory bahut.</td><td>N timestamps</td></tr>
          <tr><td>Sliding window counter</td><td>Is minute ka counter + pichhle minute ka counter × (jitna hissa abhi bhi window mein hai).</td><td>Approximate (maan leta hai pichhle minute ki requests barabar faili thi), par error chhota.</td><td>2 numbers</td></tr>
          <tr><td><b>Token bucket</b> ⭐</td><td>Bucket mein max B tokens. Har second R tokens wapas aate hain. Har request 1 token leti hai. Token nahi = reject.</td><td>Burst allow karta hai (B tak). Ye kami nahi, aksar feature hai.</td><td>2 numbers (tokens, last refill time)</td></tr>
          <tr><td>Leaky bucket</td><td>Requests ek queue mein, fixed speed se nikalti hain.</td><td>Output bilkul smooth, par burst pe requests ruk ke wait karti hain (latency).</td><td>Queue</td></tr>
        </table>
        <p><b>Decision: token bucket.</b> Reason: (1) asli clients burst mein bhejte hain (page load pe 10 calls ek saath), aur token bucket unhe bina reject kiye aane deta hai jab tak average limit mein ho; (2) sirf 2 numbers per key; (3) do knobs alag hain: <i>average rate</i> (R) aur <i>burst size</i> (B). Agar requirement "kabhi bhi 60 second mein 100 se zyada nahi" jaisi strict ho, to sliding window counter better hai.</p>
        <p><b>Token bucket ka hisaab (lazy refill):</b> background timer ki zaroorat nahi. Request aane pe: <code>tokens = min(B, tokens + (now - last) × R)</code>, <code>last = now</code>, phir agar <code>tokens ≥ 1</code> to <code>tokens -= 1</code> aur allow.</p>`
    },
    {
      type: "flow",
      title: "Stage 1: ek server, in-memory bucket",
      nodes: [
        { id: "c", label: "Client (API key)", icon: "👤", x: 120, y: 120, kind: "client", w: 170 },
        { id: "api", label: "API server\nHashMap: key → bucket", icon: "🖥️", x: 480, y: 120, kind: "service", w: 220 },
        { id: "biz", label: "Business logic", icon: "⚙️", x: 840, y: 120, kind: "service", w: 170 }
      ],
      edges: [
        { from: "c", to: "api", both: true },
        { from: "api", to: "biz", both: true }
      ],
      steps: [
        { title: "Token hai → allow", html: "<p>Bucket mein token tha: 1 ghata, request aage gayi.</p>", path: ["c", "api", "biz", "api", "c"], active: ["biz"] },
        { title: "Bucket khaali → 429", html: "<p>Token nahi: business logic tak gaye bina <code>429</code> + <code>Retry-After</code>. Reject karna sasta hona chahiye, warna limiter khud load ban jaata hai.</p>", path: ["c", "api", "c"], active: ["api"], dim: ["biz"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: traffic badha, ab 10 API servers (LB ke peeche)</h2>
        <p>Load balancer requests ko 10 servers mein round-robin baant-ta hai. Har server ka apna HashMap hai. <b>Kya toota?</b> Ek client ki 1,000 requests 10 servers pe ~100-100 baant gayin. Har server ko lagta hai "sirf 100 aayi, limit ke andar". Client ko asal mein <b>10× limit</b> mil gayi. Aur server badhaoge to limit aur dheeli.</p>
        <h3>Options</h3>
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th><th>Faisla</th></tr>
          <tr><td>Limit ko N se divide karo (har server 100/10 = 10)</td><td>Koi naya component nahi</td><td>LB kabhi barabar nahi baant-ta; server add/remove pe N badalta hai; ek server pe 11 aayi to reject, chahe total 50 ho</td><td>❌ Galat jawab users ko</td></tr>
          <tr><td>Sticky routing: LB <code>hash(apiKey)</code> se hamesha same server</td><td>Phir se ek server, in-memory chalega</td><td>Bada client ek server ko overload karta hai; server restart = uske saare counters gaye; server add pe keys shift</td><td>❌ Load aur limit dono coupled</td></tr>
          <tr><td>Database (Postgres) mein counter</td><td>Shared, durable</td><td>Har API request pe ek DB write: hazaaron writes/sec sirf ginti ke liye, aur ek hot row pe lock contention</td><td>❌ Bahut mehenga</td></tr>
          <tr><td><b>Redis</b> (shared in-memory store) ⭐</td><td>Sab servers ek hi counter dekhte hain; memory mein hai to ~1 ms; TTL se purani keys apne aap hat-ti hain; atomic commands</td><td>Ek network hop; Redis down ka plan chahiye (Stage 4)</td><td>✅</td></tr>
        </table>
        <p><b>Redis kyun "is kaam ke liye" sahi hai:</b> data chhota hai (har key ke 2 numbers), kho bhi jaaye to nuksaan chhota (zyada se zyada ek minute ke liye limit reset), aur speed sabse zaroori hai. Yahi teen cheezein in-memory store ki taaqat hain. Durability ki zaroorat nahi, isliye DB ka fayda yahan bekaar hai.</p>`
    },
    {
      type: "text",
      html: `
        <h3>Nayi problem: race condition</h3>
        <p>Do servers ek hi key ke liye ek saath: dono ne <code>GET tokens</code> kiya (1 bacha tha), dono ne socha "1 hai, allow", dono ne <code>SET tokens 0</code>. Ek token pe <b>do</b> requests nikal gayin. Load zyada ho to ye bahut baar hota hai. Ye wahi "read-modify-write" race hai jo Concurrency module mein dekha tha, bas ab threads ki jagah machines hain.</p>
        <table>
          <tr><th>Fix</th><th>Kaise</th><th>Kab</th></tr>
          <tr><td><code>INCR</code> + <code>EXPIRE</code></td><td>Redis ka INCR atomic hai: ek hi command mein badhao aur naya value lo. Fixed window ke liye kaafi.</td><td>Fixed window</td></tr>
          <tr><td><b>Lua script</b> ⭐</td><td>Token bucket ka poora hisaab (padho, refill, ghatao, likho) ek script mein. Redis ek script ko beech mein bina kisi aur command ke chalata hai, isliye poora step atomic.</td><td>Token bucket, sliding window</td></tr>
          <tr><td><code>WATCH</code> / <code>MULTI</code> (optimistic)</td><td>Key badli to transaction fail, retry</td><td>Hot key pe bahut retries: is case ke liye kharab</td></tr>
          <tr><td>Distributed lock</td><td>Har request pe lock lo</td><td>Do extra round trips; ginti jaise chhote kaam ke liye bahut bhaari</td></tr>
        </table>
        <p><b>Decision:</b> token bucket ek Lua script mein, key = <code>rl:{apiKey}:{endpoint}</code>, TTL = bucket ko poora bharne ka time. Ek request = Redis ka ek round trip.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: 10 servers, ek shared Redis",
      nodes: [
        { id: "c", label: "Client", icon: "👤", x: 90, y: 170, kind: "client", w: 120 },
        { id: "lb", label: "Load Balancer", icon: "⚖️", x: 290, y: 170, kind: "service", w: 160 },
        { id: "a1", label: "API 1", icon: "🖥️", x: 510, y: 70, kind: "service", w: 120 },
        { id: "a2", label: "API 2", icon: "🖥️", x: 510, y: 270, kind: "service", w: 120 },
        { id: "redis", label: "Redis\nLua: token bucket", icon: "⚡", x: 790, y: 70, kind: "cache", w: 190 },
        { id: "biz", label: "Business logic", icon: "⚙️", x: 790, y: 270, kind: "service", w: 170 }
      ],
      edges: [
        { from: "c", to: "lb", both: true },
        { from: "lb", to: "a1", both: true },
        { from: "lb", to: "a2", both: true },
        { from: "a1", to: "redis", both: true },
        { from: "a2", to: "redis", both: true },
        { from: "a1", to: "biz", dashed: true },
        { from: "a2", to: "biz", dashed: true }
      ],
      steps: [
        { title: "Request 1 → API 1", html: "<p>API 1 ne script chalayi: tokens 5 → 4, allow.</p>", path: ["c", "lb", "a1", "redis", "a1", "biz"], active: ["redis"] },
        { title: "Request 2 → API 2, same counter", html: "<p>API 2 bhi wahi key dekhta hai: 4 → 3. Ab server kitne bhi hon, limit ek hi hai.</p>", path: ["c", "lb", "a2", "redis", "a2", "biz"], active: ["redis"] },
        { title: "Tokens khatam → 429", html: "<p>Script ne 0 lautaya: API server seedha 429 deta hai.</p>", path: ["c", "lb", "a1", "redis", "a1", "lb", "c"], active: ["a1"], dim: ["biz"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: limiter code kahan rakhein?</h2>
        <p>Company mein ab 15 microservices hain. Har ek mein limiter likhna = 15 jagah same logic, alag bugs.</p>
        <table>
          <tr><th>Jagah</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>Client side</td><td>Kuch nahi bhejna padta</td><td>Client pe bharosa nahi kar sakte (koi bhi SDK bypass kar dega). Sirf politeness ke liye.</td></tr>
          <tr><td>Har service ke andar (library/middleware)</td><td>Business context pata hai (jaise "ye user premium hai")</td><td>Har language/team mein alag implementation; bekaar request service tak pahunch chuki hoti hai</td></tr>
          <tr><td><b>API Gateway</b> ⭐ (sabse aage ka ek layer)</td><td>Ek jagah, sab services ke liye; bekaar traffic andar aata hi nahi; config se limits badlo</td><td>Gateway ko API key/plan ka pata hona chahiye (auth bhi wahin hota hai, to milta hai)</td></tr>
        </table>
        <p><b>Decision:</b> gateway pe per-key limits (common case). Jahan business rule chahiye (jaise "din mein 5 OTP per phone number"), wo service apne andar same Redis pattern se karti hai. Agar company pehle se Kong / Envoy / AWS API Gateway use karti hai, to unka built-in rate limiting plugin hi lo, naya mat likho.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: 10 lakh requests/sec aur failures</h2>
        <h3>Ek Redis kaafi nahi</h3>
        <p>Har API request = ek Redis call. Ek Redis node ~1 lakh simple ops/sec ke aas-paas deta hai (hardware pe depend), Lua script thodi bhaari hai. 10 lakh RPS ke liye <b>Redis Cluster</b>: keys hash slots mein bant-ti hain aur slots kai nodes pe. Accha ye hai ki ek API key ka bucket ek hi key hai, to wo hamesha ek hi node pe rehta hai, aur Lua script ki atomicity bani rehti hai (script sirf ek node ki keys chhuye, ye zaroori hai).</p>
        <h3>Hot key: ek bahut bada customer</h3>
        <p>Ek customer akela 2 lakh RPS bhejta hai: uski key wala ek Redis node full. Option: har API server Redis se ek baar mein tokens ka <b>batch</b> le (jaise 100), aur unhe local memory se kharch kare. Redis calls 100× kam. Kimat: limit thodi dheeli (har server ke paas bache tokens), jo bade customer ke liye theek hai.</p>
        <h3>Redis down ho gaya to?</h3>
        <table>
          <tr><th>Policy</th><th>Matlab</th><th>Kab</th></tr>
          <tr><td><b>Fail-open</b></td><td>Limiter ka jawab na aaye to allow karo (har server pe ek dheeli local limit as backup)</td><td>Normal APIs: limiter ki wajah se poori API down nahi honi chahiye</td></tr>
          <tr><td>Fail-closed</td><td>Jawab na aaye to reject</td><td>Login, OTP, password reset: yahan abuse ka nuksaan downtime se bada hai</td></tr>
        </table>
        <p>Redis call pe chhota timeout (jaise 5-10 ms) rakho, taaki slow Redis poori API ko slow na kare.</p>
        <h3>Kai regions</h3>
        <p>Global ek counter = har request pe doosre continent tak round trip (~100+ ms). Isliye zyaadatar systems <b>har region ka apna counter</b> rakhte hain aur limit thodi approximate maan lete hain. Global strict limit sirf bahut mehenge resources (jaise paid quota) ke liye, aur wahan async sync se.</p>`
    },
    {
      type: "flow",
      title: "Stage 4: gateway + Redis Cluster + fail-open",
      nodes: [
        { id: "c", label: "Clients", icon: "👥", x: 80, y: 170, kind: "client", w: 120 },
        { id: "gw", label: "API Gateway\nauth + limiter", icon: "🚪", x: 300, y: 170, kind: "service", w: 190 },
        { id: "r1", label: "Redis node A", icon: "⚡", x: 560, y: 60, kind: "cache", w: 160 },
        { id: "r2", label: "Redis node B", icon: "⚡", x: 560, y: 280, kind: "cache", w: 160 },
        { id: "s1", label: "Orders svc", icon: "📦", x: 850, y: 100, kind: "service", w: 160 },
        { id: "s2", label: "Search svc", icon: "🔍", x: 850, y: 240, kind: "service", w: 160 }
      ],
      edges: [
        { from: "c", to: "gw", both: true },
        { from: "gw", to: "r1", both: true },
        { from: "gw", to: "r2", both: true },
        { from: "gw", to: "s1" },
        { from: "gw", to: "s2" }
      ],
      steps: [
        { title: "Key ka slot → node A", html: "<p><code>rl:key42</code> ka hash slot node A pe hai. Ek key = ek node, isliye script atomic.</p>", path: ["c", "gw", "r1", "gw", "s1"], active: ["r1"] },
        { title: "Dusri key → node B", html: "<p>Alag key alag node pe: load bant gaya.</p>", path: ["c", "gw", "r2", "gw", "s2"], active: ["r2"] },
        { title: "Node A down → fail-open", html: "<p>Timeout ke baad gateway local backup limit se allow karta hai. API chalti rehti hai; login jaise endpoints fail-closed.</p>", path: ["c", "gw", "s1"], fail: ["r1"], active: ["gw"] }
      ]
    },
    {
      type: "text",
      html: `
        <div class="tip-box">🏭 <b>Production mein:</b> <b>Stripe</b> ne apne blog mein bataya ki unka main request limiter <b>token bucket</b> hai jo <b>Redis</b> pe chalta hai, aur uske saath concurrent-requests limiter aur load shedders bhi hain (overload mein kam zaroori traffic pehle chhodna). <b>Cloudflare</b> ne millions of domains ke liye <b>sliding window counter</b> (do counters wala approximation) chuna, kyunki memory kam lagti hai aur unke measurement mein error bahut chhota tha. Cloudflare ke docs ye bhi batate hain ki counters har data center ke apne hote hain, global nahi: yahi "region-local counter" wala trade-off hai.</div>`
    },
    {
      type: "text",
      html: `
        <h2>Recap: kaunsa component kis problem se aaya</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Faisla</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Ginti kaise</td><td>Token bucket (lazy refill)</td><td>Fixed window: boundary pe 2× burst; sliding log: memory zyada</td></tr>
          <tr><td>2</td><td>10 servers = 10× limit</td><td>Shared Redis</td><td>DB: har request pe write; sticky LB: load aur limit coupled</td></tr>
          <tr><td>2</td><td>GET/SET race</td><td>Lua script (atomic)</td><td>Lock: bhaari; WATCH: hot key pe retries</td></tr>
          <tr><td>3</td><td>15 services mein duplicate logic</td><td>API Gateway pe limiter</td><td>Client side: bharosa nahi</td></tr>
          <tr><td>4</td><td>Ek Redis kam</td><td>Redis Cluster (key → slot)</td><td>Bada Redis: ek limit tak hi</td></tr>
          <tr><td>4</td><td>Redis down</td><td>Fail-open (+ login pe fail-closed)</td><td>Hamesha fail-closed: limiter ki wajah se poori API down</td></tr>
          <tr><td>4</td><td>Multi-region latency</td><td>Region-local counters</td><td>Global counter: har request pe cross-region call</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Algorithm pe 2 minute, phir seedha "kai servers pe counter share kaise hoga" aur "race condition" pe aao. Fail-open vs fail-closed aur hot key bolna senior signal hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Stripe ke rate limiter blog mein ek "concurrent requests limiter" bhi hai, normal "requests per second" limiter ke alawa. Ek customer ki script ek bahut mehenga endpoint (jo har call pe kai seconds CPU khata hai) 5 requests/sec pe call karti hai: rate limit ke andar, par server CPU full. Kaunsa limiter isko pakdega?`,
      options: [
        `Requests/sec limiter, limit 2 kar do`,
        `Concurrent requests limiter: ek waqt pe ek customer ke kitne requests <i>chal rahe</i> hain (in-flight) usko cap karo; mehenge, lambe requests pe yahi asli resource naapta hai`,
        `Kuch nahi ho sakta`,
        `Sirf IP block karo`
      ],
      answer: 1,
      why: `Requests/sec ye nahi dekhta ki har request kitni der chalti hai. 5 req/s × 4 s = har waqt ~20 requests chal rahi hain. Stripe ne bataya ki concurrent-requests limiter un resource-intensive endpoints ke liye hai jahan clients retries se load aur badha dete hain. Sabak: limit us cheez pe lagao jo sach mein khatam hoti hai (CPU time, connections, tokens), sirf request count pe nahi. Yahi idea LLM APIs ke tokens/min limits mein hai.`
    }
  ],
  references: [
    { title: "Stripe: Scaling your API with rate limiters", by: "Paul Tarjan (Stripe)", url: "https://stripe.com/blog/rate-limiters", type: "article" },
    { title: "Stripe rate limiter code samples (Redis token bucket)", by: "Paul Tarjan", url: "https://gist.github.com/ptarjan/e38f45f2dfe601419ca3af937fff574d", type: "docs" },
    { title: "Cloudflare: How we built rate limiting capable of scaling to millions of domains", by: "Cloudflare", url: "https://blog.cloudflare.com/counting-things-a-lot-of-different-things", type: "article" },
    { title: "Cloudflare docs: how request rate is determined", by: "Cloudflare", url: "https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate", type: "docs" },
    { title: "System Design Interview Vol. 1, Ch. 4: Design a rate limiter", by: "Alex Xu", url: "https://bytebytego.com/", type: "book" }
  ]
});
