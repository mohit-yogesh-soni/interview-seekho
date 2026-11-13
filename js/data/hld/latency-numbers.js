// Latency numbers aur bottlenecks
registerLesson("hld", "latency-numbers", {
  why: `Design mein har faisla ('cache lagao', 'ye call async karo', 'same region mein rakho') latency ke numbers pe tikta hai. Exact numbers yaad karne ki zaroorat nahi; order of magnitude (nanosecond vs millisecond) samajh lo, to bottleneck khud dikhne lagta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Order of magnitude table (approx)</h2>
        <p>Ye numbers Jeff Dean / Peter Norvig ki famous list se hain (hardware ke saath thode badle hain, par ratio waise hi hain):</p>
        <table>
          <tr><th>Operation</th><th>Time (approx)</th><th>Insaani scale pe (1 ns = 1 sec maano)</th></tr>
          <tr><td>L1 cache reference</td><td>~1 ns</td><td>1 second</td></tr>
          <tr><td>Main memory (RAM) reference</td><td>~100 ns</td><td>~1.5 minute</td></tr>
          <tr><td>1 KB data network pe bhejna (1 Gbps)</td><td>~10 µs</td><td>~3 ghante</td></tr>
          <tr><td>SSD random read (4 KB)</td><td>~100-150 µs</td><td>~1.5 din</td></tr>
          <tr><td>Same datacenter round trip</td><td>~0.5 ms</td><td>~6 din</td></tr>
          <tr><td>1 MB SSD se sequential padhna</td><td>~1 ms</td><td>~12 din</td></tr>
          <tr><td>HDD disk seek</td><td>~10 ms</td><td>~4 mahine</td></tr>
          <tr><td>India ↔ US round trip</td><td>~200-250 ms</td><td>~7 saal</td></tr>
        </table>
        <h3>Isse kya seekhein</h3>
        <ul>
          <li><b>RAM, disk se ~1000 guna tez.</b> Isliye Redis (in-memory) cache DB ke saamne.</li>
          <li><b>Network call (0.5ms) ek function call se lakhon guna mehenga.</b> Isliye loop ke andar DB/HTTP call (N+1 problem) system ko maarta hai; batch karo.</li>
          <li><b>Cross-region (~200ms) sabse mehenga.</b> Ek request mein region ke bahar 3 sequential calls = 600ms. Data user ke paas rakho (CDN, regional replicas).</li>
          <li><b>Sequential read random se tez.</b> Isliye logs/Kafka append-only likhte hain.</li>
        </ul>
        <h2>Bottleneck pehchaanna</h2>
        <table>
          <tr><th>Type</th><th>Symptom</th><th>Example</th><th>Typical fix</th></tr>
          <tr><td>CPU bound</td><td>CPU 100%, request kaam mein busy</td><td>Image resize, encryption, JSON bahut bada</td><td>Zyada cores / servers, efficient algorithm, async workers</td></tr>
          <tr><td>Memory bound</td><td>GC pauses, OOM</td><td>Bada cache in-heap, memory leak</td><td>Data off-heap / Redis, limits</td></tr>
          <tr><td>I/O (disk) bound</td><td>Disk queue lambi, CPU khaali</td><td>DB bina index, bahut writes</td><td>Index, SSD, batching, cache</td></tr>
          <tr><td>Network bound</td><td>Bandwidth full ya bahut round trips</td><td>Video, chatty microservices</td><td>CDN, compression, batching, colocate</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Ek API ek order page ke liye 50 items dikhati hai, aur har item ke liye alag DB query karti hai (same DC, har query ~1ms network + query). Total kitna roughly, aur fix?</div>
          <div class="qa-a"><b>Jawab:</b> ~50ms+ (N+1 queries). Fix: ek query mein saare items (<code>WHERE id IN (...)</code>) ya join. Har round trip ka kharcha jud-ta hai. 50 sequential calls = 50× latency. Batch/join se 1-2 round trips. Ye classic 'N+1 query problem' hai (ORMs mein bahut hota hai).</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Checkout API ka SLA <b>p99 &lt; 300ms</b> hai (India users, server Mumbai mein). Andar: auth service (5ms), cart DB (10ms), pricing service (20ms), payment gateway (US mein, 250ms RTT + 100ms processing). SLA kaise poora karoge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Payment gateway call hi <b>~350ms</b>: sequential mein SLA impossible</li><li>Payment ko <b>async</b> karo: order PENDING return, payment result webhook/callback se</li><li>Independent calls (auth, cart, pricing) <b>parallel</b></li><li>Gateway ka India region / local PSP endpoint</li></ul></div>
          <div class="qa-a"><p>Sirf payment gateway ~350ms le leta hai, to synchronous design kabhi 300ms nahi dega. Isliye: (1) auth, cart, pricing <b>parallel</b> (max ~20ms, sum ~35ms nahi); (2) payment ko <b>async</b>: user ko turant "order PENDING, payment processing" response (~50ms), aur gateway ka result webhook / queue consumer se aaye, phir push notification; (3) gateway ka India endpoint use karo (aksar available hota hai). SLA ka matlab hai har dependency ka latency budget socho.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Server pe CPU 15%, memory theek, par response time 3 second. DB server pe disk utilization 100%. Kaunse fixes sahi direction mein hain?</b></div>
          <ul class="qa-options"><li>❌ App servers double kar do<div class="small muted">App server bottleneck nahi hai. Aur load DB pe aur badhega.</div></li><li>✅ Slow queries dekho aur missing index lagao<div class="small muted">Disk 100% aksar full table scans.</div></li><li>✅ Hot reads ke liye cache (Redis)<div class="small muted">DB tak kam requests.</div></li><li>✅ Read replicas<div class="small muted">Reads baant do (agar reads zyada hain).</div></li><li>❌ App mein thread pool size 10x<div class="small muted">DB pe aur parallel queries = aur bura.</div></li></ul>
          
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Design mein jab koi call add karo, uska rough latency bolo ("Redis ~1ms, DB ~5-10ms, cross-region ~200ms"). Interviewer ko dikhega ki aap numbers se soch rahe ho, guess se nahi.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> GitHub, October 2018: failover ke baad MySQL primaries West Coast pe aa gaye, jabki app servers East Coast pe the. Maan lo cross-country round trip ~70 ms hai (pehle same data center mein &lt; 1 ms). Ek page 20 writes ek ke baad ek karta hai. Page kitna slow hoga?`,
      options: [
        `~70 ms extra`,
        `~1.4 second extra (20 × 70 ms)`,
        `Koi farak nahi, writes async hain`,
        `~7 second extra`
      ],
      answer: 1,
      why: `Sequential calls ki latency judti hai: 20 × 70 ms ≈ 1.4 s. GitHub ki post-incident analysis mein likha hai ki apps ko har write ke liye cross-country round trip karna pada, aur kai services is latency ki wajah se kaam ke laayak nahi rahin. Sabak: same-DC (~0.5 ms) vs cross-region (tens of ms) ka farak ek chhoti si config nahi, poore design ko badal deta hai; aur sequential round trips ko batch ya parallel karo.`
    }
  ],
  references: [
    { title: "October 21 post-incident analysis", by: "GitHub", url: "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/", type: "article" },
    {
      title: "Latency Numbers Every Programmer Should Know",
      by: "Jeff Dean / Peter Norvig (gist by Jonas Bonér)",
      url: "https://gist.github.com/jboner/2841832",
      type: "article"
    },
    {
      title: "System Design Primer",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    }
  ]
});
