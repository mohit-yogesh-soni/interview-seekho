// Monitoring, logging, alerting
registerLesson("hld", "observability", {
  why: `Design tabhi complete hai jab aap bata sako ki production mein kaise pata chalega ki wo theek chal raha hai. Metrics, logs, traces aur SLI/SLO/error budget senior interviews mein 'operational maturity' dikhate hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Teen pillars</h2>
        <table>
          <tr><th></th><th>Kya</th><th>Example</th><th>Kab kaam aata</th></tr>
          <tr><td><b>Metrics</b></td><td>Numbers over time (sasta, aggregate)</td><td>RPS, error rate, p99 latency, CPU, queue lag</td><td>Dashboards, alerts: "kuch toota"</td></tr>
          <tr><td><b>Logs</b></td><td>Events with detail (mehenga)</td><td>JSON log: traceId, userId, error stack</td><td>"Kya toota, kis request mein"</td></tr>
          <tr><td><b>Traces</b></td><td>Ek request ka safar services ke beech (spans)</td><td>Gateway 5ms → Order 20ms → Payment 400ms</td><td>"Kahan slow hai" (microservices)</td></tr>
        </table>
        <p>Teeno ko <b>traceId</b> jodta hai: alert (metric) → slow traces → us trace ke logs. OpenTelemetry standard instrumentation hai; Prometheus/Grafana, ELK/Loki, Jaeger/Tempo common tools.</p>
        <h2>Kya measure karein: golden signals</h2>
        <p>Google SRE book ke 4 golden signals: <b>Latency</b> (p50/p95/p99, sirf average nahi), <b>Traffic</b> (RPS), <b>Errors</b> (5xx rate), <b>Saturation</b> (CPU, memory, queue depth, connection pool). Simple version: RED (Rate, Errors, Duration) per service, USE (Utilization, Saturation, Errors) per resource.</p>
        <p><b>Average kyun dhokha deta hai:</b> 99 requests 10ms aur 1 request 5s → average ~60ms, "sab theek". Par har 100 mein ek user 5s wait kar raha hai. Isliye percentiles (p99).</p>
        <h2>SLI, SLO, SLA, error budget</h2>
        <ul>
          <li><b>SLI</b> (indicator): measure kya karte ho: "successful requests / total", "requests &lt; 300ms ka %".</li>
          <li><b>SLO</b> (objective): internal target: "99.9% requests successful, 30 din mein".</li>
          <li><b>SLA</b> (agreement): customer ke saath contract, tootne pe penalty (aksar SLO se dheela).</li>
          <li><b>Error budget</b> = 100% − SLO. 99.9% over 30 din ≈ <b>43 minute</b> downtime allowed. Budget bacha hai → features ship; khatam → reliability pe focus.</li>
        </ul>
        <table>
          <tr><th>Availability</th><th>Downtime / saal</th><th>Downtime / 30 din</th></tr>
          <tr><td>99% ("two nines")</td><td>~3.65 din</td><td>~7.2 ghante</td></tr>
          <tr><td>99.9%</td><td>~8.76 ghante</td><td>~43 minute</td></tr>
          <tr><td>99.99%</td><td>~52.6 minute</td><td>~4.3 minute</td></tr>
          <tr><td>99.999%</td><td>~5.26 minute</td><td>~26 second</td></tr>
        </table>
        <h2>Alerting</h2>
        <p>Alert <b>symptoms</b> pe (users ko dard: error rate, latency SLO burn), causes pe nahi (CPU 80% khud mein problem nahi). Har alert actionable ho, warna alert fatigue. Burn-rate alerts: "error budget itni tezi se jal raha hai ki 2 din mein khatam".</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Aapne order service design ki (API → Order svc → Payment svc → Kafka → Notification). Production mein kya monitor karoge aur kaunse 3 alerts lagaoge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>RED per service: <b>RPS, error rate, p99 latency</b></li><li><b>Kafka consumer lag</b> / queue depth</li><li>Business metric: <b>orders per minute</b>, payment success rate</li><li>Distributed tracing + traceId in logs</li><li>Alerts symptom-based / SLO burn rate</li></ul></div>
          <div class="qa-a"><ul><li><b>Har service:</b> RPS, 5xx rate, p50/p99 latency; saturation (DB connection pool, CPU).</li><li><b>Kafka:</b> consumer lag per group (notification late ho rahe?), DLQ size.</li><li><b>Business:</b> orders/min, payment success %, — ye sabse jaldi asli outage batate hain (sab metrics green par orders 0).</li><li><b>Tracing:</b> OpenTelemetry, traceId logs mein.</li></ul><p><b>3 alerts:</b> (1) checkout SLO burn rate (error rate / latency), (2) payment success rate normal se bahut neeche, (3) consumer lag X minute se zyada. Sab symptom-based aur actionable.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Hamesha, pehle din se. Bina metrics ke aapko outage user ke tweet se pata chalega.</td></tr>
          <tr><th>Kab nahi</th><td>Sab kuch log mat karo: har request ka poora body log karna mehenga hai aur privacy risk.</td></tr>
          <tr><th>Kimat (cost)</th><td>Logs ka storage bahut mehenga ho sakta hai (sampling, retention rakho); metrics mein high-cardinality labels (jaise userId) time-series database ko phula dete hain.</td></tr>
          <tr><th>Alternatives</th><td>Managed (Datadog, New Relic, Dynatrace) vs open source (Prometheus + Grafana, Loki, Jaeger/Tempo). OpenTelemetry se instrumentation vendor-neutral rehti hai.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Google SRE book ne SLO aur error budget ko standard banaya: budget bacha hai to features ship karo, khatam to reliability pe kaam.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Design ke end mein 30 second: <i>"Main RED metrics, consumer lag aur orders/min dashboard pe rakhunga, SLO 99.9% with burn-rate alerts, aur OpenTelemetry tracing."</i> Ye bahut kam candidates bolte hain.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Roblox, 28-31 October 2021: 73 ghante ka outage. Root cause Consul (service discovery cluster) mein ek naye streaming feature aur BoltDB ki performance problem thi. Diagnose karne mein itna time lagne ki ek badi wajah kya thi?`,
      options: [
        `Engineers chhutti pe the`,
        `Monitoring/telemetry systems khud Consul pe depend karte the, to jab Consul gira to wo dashboards bhi kaam ke nahi rahe jo cause dikhate`,
        `Logs English mein nahi the`,
        `Alerts bahut kam the`
      ],
      answer: 1,
      why: `Roblox ki "Return to Service" post-mortem ke mutabik critical monitoring systems unhi affected systems (jaise Consul) pe depend the jo down the, isliye visibility kam thi. Sabak: observability stack ko us infrastructure se alag rakho jise wo monitor karta hai (alag cluster/region/vendor), warna outage ke sabse zaroori waqt aap andhe ho jaate ho.`
    }
  ],
  references: [
    { title: "Roblox Return to Service 10/28-10/31, 2021", by: "Roblox", url: "https://corp.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021", type: "article" },
    {
      title: "Site Reliability Engineering (Google), Ch. 4 & 6: SLOs, Monitoring",
      by: "Google",
      url: "https://sre.google/sre-book/table-of-contents/",
      type: "book"
    },
    {
      title: "OpenTelemetry docs",
      by: "CNCF",
      url: "https://opentelemetry.io/docs/",
      type: "docs"
    }
  ]
});
