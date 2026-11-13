// Rate limiting
registerLesson("hld", "rate-limiting", {
  why: `Rate limiting system ko abuse (bots, scraping, brute force), noisy neighbours (ek customer sab kha jaaye) aur overload se bachata hai. Algorithms ka code aapne concurrency module mein likha tha (token bucket); yahan HLD sawaal: kahan lagaayein, kai servers ke beech kaise share karein, aur kaunsa algorithm kab.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Algorithms recap</h2>
        <table>
          <tr><th>Algorithm</th><th>Memory</th><th>Burst</th><th>Accuracy</th></tr>
          <tr><td>Fixed window counter</td><td>1 counter/key</td><td>Window boundary pe 2× burst</td><td>Kam</td></tr>
          <tr><td>Sliding window log</td><td>Har request ka timestamp</td><td>Nahi</td><td>Exact (memory mehngi)</td></tr>
          <tr><td>Sliding window counter</td><td>2 counters/key</td><td>Smooth</td><td>Approx (achha)</td></tr>
          <tr><td>Token bucket ⭐</td><td>2 numbers/key</td><td>Capacity tak allow</td><td>Achha, burst controlled</td></tr>
          <tr><td>Leaky bucket</td><td>Queue</td><td>Output constant rate</td><td>Smooth output</td></tr>
        </table>
        <p><b>Sliding window counter</b> formula: <code>estimate = currentWindowCount + previousWindowCount × (1 − elapsed/window)</code>. Pichhli window ka utna hissa jo abhi "sliding window" mein overlap hai.</p>
        <h2>Kahan lagaayein</h2>
        <ul>
          <li><b>Edge / API gateway</b>: per IP / API key / user. Sabse common. Bekaar traffic andar hi na aaye.</li>
          <li><b>Service level</b>: expensive endpoints (search, OTP send) ke liye alag limits.</li>
          <li><b>Client-side</b> (SDK): achha behaviour, par trust mat karo.</li>
        </ul>
        <h2>Distributed: kai gateway servers</h2>
        <p>Har server ka apna counter = user ko N × limit. Shared state chahiye: <b>Redis</b>. Har request pe ek atomic operation:</p>
        <pre class="code-static">-- fixed window, simplest (atomic INCR):
count = INCR rl:{user}:{minute}
if count == 1: EXPIRE rl:{user}:{minute} 60
if count &gt; LIMIT: return 429

-- token bucket: Lua script (Redis Lua ko atomically chalata hai):
-- HMGET tokens, last → refill by elapsed → if tokens &gt;= 1 then decrement, HMSET, return 1 else return 0</pre>
        <p><b>Response:</b> HTTP 429 + <code>Retry-After</code> header; <code>X-RateLimit-Remaining</code> jaise headers client ko madad karte hain.</p>
        <p><b>Failure mode:</b> Redis down → fail-open (allow, availability) ya fail-closed (deny, safety). Login/OTP pe fail-closed ya local fallback limit; normal APIs pe fail-open aksar.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Distributed rate limiter ke baare mein kaunse statements sahi hain?</b></div>
          <ul class="qa-options"><li>❌ Har gateway ka local in-memory counter global limit ke liye kaafi hai<div class="small muted">N servers = N × limit. Shared store ya approx (limit/N + sticky).</div></li><li>✅ Redis mein INCR + EXPIRE fixed window ka atomic, simple implementation hai<div class="small muted">INCR atomic hai; pehli baar EXPIRE.</div></li><li>✅ Token bucket ka refill-check-decrement ek Lua script mein atomic karna chahiye<div class="small muted">Warna do gateways same token le sakte.</div></li><li>✅ 429 ke saath Retry-After header dena achhi practice hai<div class="small muted">Clients backoff kar sakein.</div></li><li>❌ Login endpoint pe Redis down hone pe hamesha fail-open<div class="small muted">Brute force ka risk. Fail-closed ya local fallback limit.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Public API, login/OTP jaise abuse-prone endpoints, mehenge endpoints, ya multi-tenant system (ek customer sabko slow na kare).</td></tr>
          <tr><th>Kab nahi</th><td>Andar ki trusted service jahan backpressure (queue, concurrency limit) behtar hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Har request pe ek check (Redis hop), galat limit = asli users ko 429, Redis down ka plan chahiye.</td></tr>
          <tr><th>Alternatives</th><td>Concurrency limiter (ek saath max N requests), load shedding (overload pe kam zaroori traffic chhodo), quotas (din/mahine ka).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Stripe: token bucket Redis pe, saath mein concurrent-requests limiter aur load shedders. Cloudflare: sliding window counter, aur counters har data center ke apne. Detail: Distributed Rate Limiter design lesson.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Rate limiter pe pehle sawaal: <i>"kis key pe (user/IP/API key), kitna, burst allowed?"</i> Phir: token bucket, gateway pe, Redis + Lua for atomic shared state, 429 + Retry-After, aur Redis failure pe fail-open/closed policy.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Stripe ne apne blog mein bataya ki overload ke waqt wo ek "load shedder" chalate hain jo requests ko critical aur non-critical mein baant-ta hai. API overload mein ho to sabse pehle kaunsi requests chhodni chahiye?`,
      options: [
        `Naye charges (payment) banane wali requests`,
        `Non-critical requests, jaise purane charges ki list/search, taaki payment banane jaise critical kaam ke liye capacity bachi rahe`,
        `Sab requests barabar chhodo`,
        `Sirf mobile apps ki`
      ],
      answer: 1,
      why: `Stripe ke "Scaling your API with rate limiters" post mein request rate limiter, concurrent-requests limiter, aur do load shedders describe hain; ek load shedder infrastructure ka ek hissa critical requests ke liye reserve rakhta hai. Sabak: rate limiting sirf abuse rokne ke liye nahi, overload mein graceful degradation ke liye bhi hai: kaam ki priority pehle se tay karo.`
    }
  ],
  references: [
    { title: "Stripe: Scaling your API with rate limiters", by: "Stripe", url: "https://stripe.com/blog/rate-limiters", type: "article" },
    {
      title: "System Design Interview Vol. 1, Ch. 4: Design a rate limiter",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "book"
    },
    {
      title: "Redis docs (INCR, EXPIRE, Lua scripting)",
      by: "Redis",
      url: "https://redis.io/docs/latest/",
      type: "docs"
    }
  ]
});
