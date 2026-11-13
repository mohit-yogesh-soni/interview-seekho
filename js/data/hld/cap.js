// CAP theorem aur consistency
registerLesson("hld", "cap", {
  why: `Distributed system mein network kabhi na kabhi tootega. Us waqt aap ya to sahi (consistent) jawab doge ya jawab doge (available), dono nahi. CAP ko sahi samajhna (aur galat versions se bachna) interview mein bahut kaam aata hai, khaas kar 'payments vs likes' jaise trade-offs bolne mein.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>CAP, sahi tareeke se</h2>
        <ul>
          <li><b>C (Consistency, yahan matlab linearizability):</b> har read ko latest write dikhe, jaise ek hi copy ho.</li>
          <li><b>A (Availability):</b> har non-failed node har request ka jawab de (error/timeout nahi).</li>
          <li><b>P (Partition tolerance):</b> nodes ke beech network toot jaaye tab bhi system chale.</li>
        </ul>
        <p>Common galat line: "3 mein se 2 chuno". Asli baat: <b>partition hona hi hai</b> (networks fail hote hain), to P zaroori hai. Sawaal sirf ye hai: <b>partition ke dauraan C chunoge ya A?</b></p>
        `
    },
    {
      type: "flow",
      title: "Network partition: consistency ya availability?",
      nodes: [
        {
          id: "u1",
          label: "User (Mumbai)",
          icon: "👤",
          x: 90,
          y: 160,
          kind: "client",
          w: 160
        },
        {
          id: "m",
          label: "Mumbai node",
          icon: "🗄️",
          x: 330,
          y: 160,
          kind: "data",
          w: 160
        },
        {
          id: "net",
          label: "Network link",
          icon: "🔗",
          x: 550,
          y: 160,
          kind: "external",
          w: 150
        },
        {
          id: "d",
          label: "Delhi node",
          icon: "🗄️",
          x: 770,
          y: 160,
          kind: "data",
          w: 160
        },
        {
          id: "u2",
          label: "User (Delhi)",
          icon: "👤",
          x: 770,
          y: 290,
          kind: "client",
          w: 160
        }
      ],
      edges: [
        {
          from: "u1",
          to: "m"
        },
        {
          from: "m",
          to: "net",
          both: true
        },
        {
          from: "net",
          to: "d",
          both: true
        },
        {
          from: "u2",
          to: "d",
          both: true
        }
      ],
      steps: [
        {
          title: "Normal: write replicate hota hai",
          html: "<p>Mumbai mein balance update hua aur Delhi tak replicate. Dono jagah same value.</p>",
          path: ["u1","m","net","d"],
          active: ["m","d"]
        },
        {
          title: "Partition: link toot gaya",
          html: "<p>Mumbai ka naya write Delhi tak nahi pahunch sakta. Ab Delhi wala user balance padhta hai...</p>",
          path: ["u1","m","net"],
          fail: ["net"]
        },
        {
          title: "CP choice: error / wait",
          html: `<p>Delhi bolta hai "abhi pakka nahi bata sakta" (error ya timeout). Galat data kabhi nahi, par service unavailable. Payments, bookings ke liye.</p>`,
          path: ["u2","d","u2"],
          fail: ["net"],
          active: ["d"],
          color: "#1971c2"
        },
        {
          title: "AP choice: purana data",
          html: `<p>Delhi apna (thoda purana) value de deta hai. Service chalti rahi, par stale. Likes, feed, catalog ke liye theek. Link wapas aane pe sync.</p>`,
          path: ["u2","d","u2"],
          fail: ["net"],
          active: ["d"],
          color: "#2b8a3e"
        }
      ]
    },
    {
      type: "text",
      html: `
        <table>
          <tr><th></th><th>CP (consistency pehle)</th><th>AP (availability pehle)</th></tr>
          <tr><td>Kab</td><td>Paise, inventory, bookings, leader election, locks</td><td>Likes, views, feeds, product catalog, shopping cart (kabhi kabhi)</td></tr>
          <tr><td>Examples</td><td>ZooKeeper, etcd, Spanner, single-leader SQL (failover tak)</td><td>Cassandra, DynamoDB (default), DNS</td></tr>
        </table>
        <p><b>PACELC</b> (aage ka sawaal): Partition ho to A vs C; <b>Else</b> (normal time mein bhi) <b>Latency vs Consistency</b>. Strong consistency ke liye replicas ka wait = zyada latency, partition na ho tab bhi.</p>
        <h2>Consistency levels (kamzor se mazboot)</h2>
        <p><b>Eventual</b> (aakhirkar sab same) → read-your-writes / monotonic (user-level guarantees) → <b>causal</b> (reply hamesha comment ke baad dikhe) → <b>strong / linearizable</b>.</p>
        <h2>Quorum (leaderless systems)</h2>
        <p>N replicas. Write W replicas pe confirm, read R replicas se. Agar <b>W + R &gt; N</b>, to read aur write sets kam se kam ek node pe overlap karte hain, isliye read ko latest write milta hai (normal conditions mein). Example N=3: W=2, R=2. W=1/R=1 = tez par stale ho sakta.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Partition ke dauraan kis cheez ke liye <b>availability (AP)</b> chunna theek hai?</b></div>
          <ul class="qa-options"><li>✅ Video view count<div class="small muted">Thoda purana count chalega.</div></li><li>❌ Bank transfer<div class="small muted">Galat balance = paisa gayab. CP.</div></li><li>✅ Social feed<div class="small muted">Thoda purana feed better hai error se.</div></li><li>❌ Last seat ki movie ticket booking<div class="small muted">Double booking. CP (ya kam se kam booking step CP).</div></li><li>✅ Product catalog descriptions<div class="small muted">Stale description chalega.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Flipkart Big Billion Day: cart aur checkout. Partition ke dauraan cart add aur payment ke liye CP ya AP, aur kyun? Inventory oversell kaise rokte hain?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Cart add → <b>AP</b> (cart kaam karta rahe, baad mein merge)</li><li>Payment / order placement → <b>CP</b></li><li>Inventory: checkout pe <b>atomic decrement / reservation</b> strongly consistent store mein</li></ul></div>
          <div class="qa-a"><p><b>Cart:</b> AP: user ko "item add nahi hua" dikhana business loss hai; conflicting carts baad mein merge (Amazon Dynamo paper ka famous example yahi tha). <b>Checkout/payment:</b> CP: double charge ya galat order se better hai error/retry. <b>Inventory:</b> cart mein add karte waqt stock reserve nahi; checkout pe strongly consistent store (DB conditional update <code>stock = stock - 1 WHERE stock &gt; 0</code>, ya Redis atomic DECR) se reserve; fail → "sold out". Ek hi system mein alag features alag CAP choice: yahi asli jawab hai.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Data kai nodes/regions pe hai aur network toot sakta hai (hamesha). Har data type ke liye alag se pucho: partition mein galat jawab ya koi jawab nahi?</td></tr>
          <tr><th>Kab nahi</th><td>Single node DB pe CAP ki baat bekaar hai; wahan latency vs consistency (replica se padhein ya primary se) asli sawaal hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>CP: partition mein kuch requests fail. AP: conflicts baad mein merge karne padte hain (do log same seat book kar sakte hain).</td></tr>
          <tr><th>Alternatives</th><td>Ek hi system mein mix: paisa/inventory CP store mein, likes/cart/feeds AP mein. PACELC yaad rakho: partition na ho tab bhi latency vs consistency ka trade-off hai.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Amazon ke Dynamo paper (2007) ka goal tha shopping cart hamesha writable rahe (AP), conflicts baad mein merge hon. Google Spanner ulti taraf hai: global strong consistency, GPS/atomic clocks wale TrueTime ke saath.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "CAP mein se 2 chuno" mat bolo. Bolo: <i>"Partition toh hoga; us waqt payments ke liye consistency, feed ke liye availability. Normal time mein bhi latency vs consistency (PACELC)."</i>`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> GitHub, October 2018: 43 second ke network partition ke baad East aur West Coast databases mein kuch writes alag alag the. GitHub ke saamne do raaste the: (A) jaldi se sab kuch East pe wapas karke site normal karna, kuch writes khone ke risk ke saath; (B) site ko degraded rakhna (purana data dikhna, webhooks/Pages rokna) jab tak saara data milaya na jaaye. Unhone B chuna. CAP ki bhasha mein ye kya hai?`,
      options: [
        `Availability ko consistency se upar rakha`,
        `Consistency/data integrity ko availability se upar rakha: kuch features band ya stale rakhe, par users ke writes khone nahi diye`,
        `Partition tolerance chhod di`,
        `Ye CAP se juda nahi hai`
      ],
      answer: 1,
      why: `GitHub ki post-incident analysis ke mutabik unhone "data integrity" ko priority di aur isliye 24 ghante 11 minute tak service degraded rahi. Ye partition ke waqt (aur uske baad recovery mein) C vs A ka asli faisla tha. Sabak: payments, code, orders jaise data pe log CP jaisa behaviour chahte hain; likes/counters pe AP chal jaata hai. Ye faisla incident se pehle likh ke rakho.`
    }
  ],
  references: [
    { title: "October 21 post-incident analysis", by: "GitHub", url: "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/", type: "article" },
    {
      title: "Designing Data-Intensive Applications, Ch. 9: Consistency and Consensus",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "Hello Interview: System Design core concepts",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    }
  ]
});
