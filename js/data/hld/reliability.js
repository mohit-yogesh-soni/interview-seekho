// Retries, timeouts, circuit breaker
registerLesson("hld", "reliability", {
  why: `Distributed system mein calls fail hoti hain. Galat retry poore system ko gira deta hai (retry storm), aur timeout na ho to ek slow dependency saare threads kha leti hai. Timeouts, backoff + jitter, circuit breaker aur idempotency keys: ye chaar tools har production design ka hissa hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>1. Timeouts: sabse pehle</h2>
        <p>Bina timeout ke call hamesha ke liye ruk sakti hai. Payment service slow → order service ke 200 threads wait mein → order service bhi down (cascading failure). Har network call pe timeout, aur poori request ka deadline (gateway 3s → andar ki calls usse kam).</p>
        <h2>2. Retries with exponential backoff + jitter</h2>
        <ul>
          <li>Retry sirf <b>transient</b> errors pe (timeout, 503, connection reset). 400/401/404 pe nahi.</li>
          <li><b>Exponential backoff:</b> 100ms, 200ms, 400ms, 800ms... max cap ke saath.</li>
          <li><b>Jitter:</b> random factor (jaise "full jitter": <code>random(0, backoff)</code>). Bina jitter ke 10,000 clients ek saath retry karte hain = synchronized waves.</li>
          <li><b>Retry budget:</b> limited attempts (3), aur har layer retry na kare (3 layers, har layer pe 3 attempts = 3 × 3 × 3 = 27× load; "3 retries" matlab 4 attempts ho to 4³ = 64×).</li>
        </ul>
        <h2>3. Idempotency keys</h2>
        <p>Retry ka khatra: "payment request gayi, response timeout hua, retry kiya → double charge". Fix: client har operation ke liye ek unique <code>Idempotency-Key</code> bheje; server us key ka result store kare; same key dobara aaye to <b>pehla result</b> lautao, dobara charge nahi. (Stripe API yahi karta hai.)</p>
        <h2>4. Circuit breaker</h2>
        `
    },
    {
      type: "flow",
      title: "Circuit breaker ki states",
      nodes: [
        {
          id: "svc",
          label: "Order svc",
          icon: "🖥️",
          x: 90,
          y: 160,
          kind: "service"
        },
        {
          id: "closed",
          label: `CLOSED
calls jaati hain`,
          icon: "🟢",
          x: 330,
          y: 60,
          kind: "cache",
          w: 170
        },
        {
          id: "open",
          label: `OPEN
turant fallback`,
          icon: "🔴",
          x: 620,
          y: 60,
          kind: "data",
          w: 170
        },
        {
          id: "half",
          label: `HALF_OPEN
1 trial call`,
          icon: "🟡",
          x: 620,
          y: 260,
          kind: "queue",
          w: 170
        },
        {
          id: "dep",
          label: "Payment svc",
          icon: "💳",
          x: 880,
          y: 160,
          kind: "external"
        }
      ],
      edges: [
        { from: "svc", to: "open", both: true, dashed: true }, { from: "half", to: "dep", dashed: true },
        {
          from: "svc",
          to: "closed"
        },
        {
          from: "closed",
          to: "open",
          label: "failures ≥ N"
        },
        {
          from: "open",
          to: "half",
          label: "cooldown"
        },
        {
          from: "half",
          to: "closed",
          label: "success"
        },
        {
          from: "half",
          to: "open",
          dashed: true
        },
        {
          from: "closed",
          to: "dep",
          dashed: true
        }
      ],
      steps: [
        {
          title: "CLOSED: normal",
          html: "<p>Calls dependency tak jaati hain. Failures gine jaate hain.</p>",
          path: ["svc","closed","dep"],
          active: ["closed"]
        },
        {
          title: "Lagatar failures → OPEN",
          html: "<p>Payment svc baar baar timeout. Threshold cross: breaker OPEN.</p>",
          path: ["svc","closed","open"],
          fail: ["dep"],
          active: ["open"]
        },
        {
          title: "OPEN: dependency ko call hi nahi",
          html: `<p>Calls turant fallback lautati hain ("thodi der baad try karo"). Hamare threads wait mein nahi phaste, dependency ko recover hone ka time.</p>`,
          path: ["svc","open","svc"],
          active: ["open"],
          dim: ["dep"]
        },
        {
          title: "Cooldown ke baad HALF_OPEN",
          html: "<p>Ek trial call jaati hai.</p>",
          path: ["open","half","dep"],
          active: ["half"]
        },
        {
          title: "Trial success → CLOSED",
          html: "<p>Dependency theek: breaker band (CLOSED), normal traffic. Trial fail hota to wapas OPEN.</p>",
          path: ["half","closed"],
          active: ["closed"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <p>Dependency baar baar fail ho rahi ho to use maarna band karo: turant fallback (cached data, default, "baad mein try karo"). Dependency ko recover hone ka time milta hai, aur hamare threads wait mein nahi phaste. Libraries: Resilience4j (Java).</p>
        <p><b>Bulkhead:</b> har dependency ka alag thread pool/semaphore, taaki ek slow dependency saare threads na le (Semaphore lesson).</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Gateway (3 retries) → Order svc (3 retries) → Payment svc (3 retries) → Bank. Bank down ho to ek user request se bank pe kitni calls tak ja sakti hain?</div>
          <div class="qa-a"><b>Jawab:</b> Upto 4 × 4 × 4 = 64 (har layer: 1 original + 3 retries). Har layer ke attempts multiply hote hain. Retry storm bank ko recover hi nahi hone deta. Fix: retry sirf ek layer pe (usually closest to the failure ya client), baaki pe circuit breaker / fail fast, aur retry budgets.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Payment API mein idempotency key kaise implement karoge? (Storage, race when same key do baar ek saath aaye, aur kitni der yaad rakhoge.)</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Table/Redis: <b>key → status + response</b>, UNIQUE on key</li><li>Race: pehle <b>insert key (IN_PROGRESS)</b> atomically; doosra request wait/409</li><li>Same key pe <b>pehla response lautao</b>; different body → error</li><li><b>TTL</b> (24h / 7 din) ke baad hatao</li></ul></div>
          <div class="qa-a"><p>Table <code>idempotency(key PK, request_hash, status, response, created_at)</code>. Flow: (1) <code>INSERT key status=IN_PROGRESS</code> (unique constraint atomic hai; duplicate insert fail = koi aur kar raha hai/kar chuka). (2) Already exists: status DONE → stored response lautao; IN_PROGRESS → 409 / thodi der baad retry; request hash alag → 422 (same key, alag payload). (3) Payment karo, response save, status DONE (ideally payment ke DB write ke saath same transaction). (4) TTL 24h-7d ke baad delete. Stripe jaisa API yahi model follow karta hai.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Har network call pe: timeout hamesha. Retry sirf temporary errors pe aur sirf idempotent operations pe.</td></tr>
          <tr><th>Kab nahi</th><td>Non-idempotent operation (payment) pe bina idempotency key ke retry: double charge.</td></tr>
          <tr><th>Kimat (cost)</th><td>Retries load badhate hain (retry storm), circuit breaker galat tune ho to healthy service ko bhi kaat deta hai.</td></tr>
          <tr><th>Alternatives</th><td>Retry budget (max 10% extra requests), bulkheads (alag thread/connection pools), fallback (cached/default jawab), load shedding.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> AWS Builders' Library ka article "Timeouts, retries, and backoff with jitter" exponential backoff + jitter ko standard practice batata hai. Stripe API idempotency keys support karta hai taaki retry pe payment dobara na ho. Netflix Hystrix ne circuit breaker popular kiya (ab maintenance mode mein; Resilience4j common hai).</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Har external call ke saath ek sentence: <i>"timeout 500ms, retry 2 baar with exponential backoff + jitter sirf transient errors pe, idempotency key ke saath, aur circuit breaker with fallback."</i>`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 7 December 2021: AWS us-east-1 mein internal network ke devices congestion se overwhelm hue aur kai AWS services ghanton degraded rahi. AWS ki summary ke mutabik delay aur errors aane pe clients ne aur connection attempts aur retries kiye. Retries ne kya kiya, aur kya chahiye tha?`,
      options: [
        `Retries ne problem jaldi theek kar di`,
        `Retries ne already congested network pe aur load daala (retry storm), recovery dheemi hui; exponential backoff + jitter, retry budget aur circuit breakers chahiye`,
        `Retries ka koi asar nahi hota`,
        `Timeouts badha dene chahiye the bas`
      ],
      answer: 1,
      why: `AWS ki summary (event 12721) ke mutabik ek automated scaling activity ne internal network mein connection activity ka surge banaya, aur latency/errors ki wajah se aur connection attempts/retries hue, jo congestion ko aur badhate gaye. Sabak: retry tabhi madad karta hai jab failure temporary aur chhota ho; overload mein bina backoff ke retry aag mein ghee hai. Isliye AWS Builders' Library bhi backoff + jitter aur retry limits recommend karti hai.`
    }
  ],
  references: [
    { title: "Summary of the AWS Service Event in the Northern Virginia (US-EAST-1) Region (Dec 2021)", by: "AWS", url: "https://aws.amazon.com/message/12721/", type: "article" },
    { title: "AWS Builders' Library: Timeouts, retries, and backoff with jitter", by: "AWS", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", type: "article" },
    {
      title: "AWS Architecture Blog: Exponential Backoff And Jitter",
      by: "Marc Brooker (AWS)",
      url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
      type: "article"
    },
    {
      title: "Release It! (2nd ed.): Stability patterns",
      by: "Michael Nygard",
      type: "book"
    },
    {
      title: "Stripe docs: Idempotent requests",
      by: "Stripe",
      url: "https://docs.stripe.com/api/idempotent_requests",
      type: "docs"
    }
  ]
});
