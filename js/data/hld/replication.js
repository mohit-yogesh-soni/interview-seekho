// Replication
registerLesson("hld", "replication", {
  why: `Replication ke do fayde: (1) ek machine gire to data aur service bache (availability, durability), (2) reads kai machines pe baant sako (read scaling). Kimat: replication lag. 'Maine post kiya aur mujhe hi nahi dikha' jaise bugs isi se aate hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Leader-follower (primary-replica)</h2>
        `
    },
    {
      type: "flow",
      title: "Leader-follower replication aur lag",
      nodes: [
        {
          id: "app",
          label: "App",
          icon: "🖥️",
          x: 110,
          y: 160,
          kind: "service"
        },
        {
          id: "primary",
          label: "Primary",
          icon: "👑",
          x: 430,
          y: 160,
          kind: "data"
        },
        {
          id: "r1",
          label: "Replica 1",
          icon: "📖",
          x: 780,
          y: 70,
          kind: "data"
        },
        {
          id: "r2",
          label: "Replica 2",
          icon: "📖",
          x: 780,
          y: 250,
          kind: "data"
        }
      ],
      edges: [
        {
          from: "app",
          to: "primary", both: true,
          label: "writes"
        },
        {
          from: "primary",
          to: "r1",
          dashed: true,
          label: "log"
        },
        {
          from: "primary",
          to: "r2",
          dashed: true,
          label: "log"
        },
        {
          from: "app",
          to: "r1", both: true,
          dashed: true
        },
        {
          from: "app",
          to: "r2", both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Write sirf primary pe",
          html: "<p>Saare inserts/updates primary pe. Primary commit karke turant jawab de deta hai (async replication).</p>",
          path: ["app","primary","app"],
          active: ["primary"]
        },
        {
          title: "Primary log replicas ko bhejta hai",
          html: "<p>WAL / binlog ke changes thodi der (ms se seconds) mein replicas tak pahunchte hain.</p>",
          paths: [
            ["primary","r1"],
            ["primary","r2"]
          ],
          active: ["r1","r2"]
        },
        {
          title: "Reads replicas se (read scaling)",
          html: "<p>Zyaadatar reads replicas pe: primary ka load kam. Replicas jodne se reads scale hote hain, writes nahi.</p>",
          paths: [
            ["app","r1","app"],
            ["app","r2","app"]
          ],
          active: ["r1","r2"]
        },
        {
          title: "Replication lag bug",
          html: `<p>User ne comment likha (primary), turant refresh kiya aur read <b>Replica 2</b> pe gaya jo abhi peeche hai: comment gayab! Fix: read-your-writes (apne recent writes ke baad primary se padho).</p>`,
          path: ["app","primary","app","r2","app"],
          fail: ["r2"]
        },
        {
          title: "Primary crash → replica promote",
          html: `<p>Failover: Replica 1 naya primary. Async replication mein aakhri kuch writes jo replica tak nahi pahunche the, kho sakte hain.</p>`,
          path: ["app","r1"],
          fail: ["primary"],
          active: ["r1"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <ul>
          <li>Saare writes primary pe. Primary apna change log (WAL / binlog) replicas ko bhejta hai.</li>
          <li><b>Async replication</b> (default zyaadatar): primary commit karke turant jawab deta hai; replicas thodi der baad. Tez, par primary turant gira to last kuch writes kho sakte hain.</li>
          <li><b>Sync / semi-sync</b>: kam se kam ek replica confirm kare tab commit. Durable, par slow aur replica slow = writes slow.</li>
          <li><b>Failover:</b> primary gira → ek replica promote. Manual ya automatic (Patroni, RDS Multi-AZ). Dhyaan: split-brain (do primaries) se bachna.</li>
        </ul>
        <h2>Replication lag ke bugs</h2>
        <table>
          <tr><th>Problem</th><th>Example</th><th>Fix</th></tr>
          <tr><td><b>Read-your-writes</b></td><td>Profile update kiya, refresh pe purana dikha (read replica se aaya)</td><td>Apna data kuch der primary se padho; ya write ka version/LSN yaad rakho aur utna updated replica chuno</td></tr>
          <tr><td><b>Monotonic reads</b></td><td>Pehle naya comment dikha, refresh pe gayab (doosre, peeche wale replica se)</td><td>User ko ek hi replica pe pin karo (sticky by user)</td></tr>
          <tr><td>Stale business reads</td><td>Balance replica se padh ke payment approve</td><td>Critical reads primary se</td></tr>
        </table>
        <h2>Multi-leader aur leaderless (overview)</h2>
        <ul>
          <li><b>Multi-leader:</b> har region ka apna leader (low-latency writes har jagah). Conflicts (do jagah same row badli) resolve karne padte hain.</li>
          <li><b>Leaderless</b> (Cassandra, Dynamo-style): client kai replicas pe likhta/padhta hai, <b>quorum</b> se (CAP lesson).</li>
        </ul>`
    },
    {
      type: "tip",
      html: `🧪 <b>Simulator mein khud dekho:</b> 20,000 RPS, 95% reads. DB node capacity 4,000. Cache nahi hai is baar: replicas se kitna door jaa sakte ho? (Writes primary pe hi jaate hain.)`
    },
    {
      type: "sim",
      id: "sim-replicas",
      title: "Read-heavy DB: replicas se reads baanto",
      config: {
        rps: 4000,
        maxRps: 40000,
        readRatio: 0.95,
        appCap: 2000,
        dbCap: 4000,
        servers: 20,
        lb: true,
        controls: ["rps","readRatio","servers","replicas"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> 20k = 19k reads + 1k writes. Reads primary + N replicas mein bant-te hain, par primary pe 1k writes upar se. 70ms ke andar aane ke liye ~10 replicas (har node ~1.7k reads) aur ~21 app servers lagte hain: yaani <b>11 DB machines</b> (cost ~55). Seekh: replicas reads scale karte hain, writes nahi, aur har replica ek poori DB machine hai (mehenga). Caching lesson ke simulator se compare karo: same kaam cache se kahin saste mein hota hai.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Instagram jaisa: user ne comment kiya, success dikha, par page refresh pe comment gayab, 2 second baad wapas. Kya ho raha hai, aur iske 2 fixes.</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Read <b>replica se</b> aaya jo abhi tak update nahi hua (<b>replication lag</b>)</li><li>Fix: <b>read-your-writes</b>: user ke apne recent writes kuch der primary se / version check</li><li>Fix: client side <b>optimistic</b> dikhana / sticky replica</li></ul></div>
          <div class="qa-a"><p>Write primary pe gaya, refresh ka read ek replica pe gaya jo async replication mein ~2s peeche tha. Fixes: (1) <b>read-your-writes</b>: write ke baad kuch seconds us user ke reads primary se, ya write ka log position yaad rakh ke sirf utne updated replica se padho; (2) client pe <b>optimistic UI</b>: apna comment locally dikhao jab tak server confirm na kare; (3) monotonic reads ke liye user ko ek replica pe pin karo.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Async replication ke saath primary crash hua aur ek replica promote hua. Kya risk hai?</div>
          <div class="qa-a"><b>Jawab:</b> Primary ke last kuch committed writes jo replica tak nahi pahunche the, kho sakte hain. Async = commit ke waqt replica ka confirm nahi liya. Isliye payments jaise data ke liye semi-sync / sync replica ya consensus-based systems (Raft) use karte hain.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Read traffic cache ke baad bhi ek DB se zyada ho, HA chahiye (primary gire to replica promote), backups/analytics primary se door chalane hon.</td></tr>
          <tr><th>Kab nahi</th><td>Bottleneck <b>writes</b> hain: replicas writes kam nahi karte, har write har replica pe bhi jaata hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Replication lag (purana data padhna), failover ka logic, async replication mein failover pe kuch last writes kho sakte hain.</td></tr>
          <tr><th>Alternatives</th><td>Cache (reads ke liye sasta), sharding (writes ke liye), synchronous replication (no loss, par har write slow), managed DB jo failover khud kare.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> GitHub ka 21 Oct 2018 incident: sirf <b>43 second</b> ka network partition, par MySQL ka automatic failover doosre data center mein ho gaya aur dono taraf alag writes ho gaye. Theek karne mein <b>24 ghante 11 minute</b> lage. Failover policy ko design karna padta hai, ye free nahi milta.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Replicas bolte waqt hamesha lag ka zikr: <i>"reads replicas se, par user ke apne writes ke baad read-your-writes ke liye primary; critical reads (balance) primary se."</i>`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 31 January 2017: GitLab.com pe ek engineer ne replication theek karte waqt galti se <b>primary</b> database ki data directory delete kar di (use laga secondary hai). ~300 GB data gaya. Replica tha, phir bhi data kyun nahi bacha, aur sahi sabak?`,
      options: [
        `Replica hamesha backup hota hai, to data bach jaata`,
        `Replication backup nahi hai: replica galat delete/kharab writes ko bhi copy karta hai (aur yahan woh pehle se toota hua tha). Point-in-time backups chahiye jinka restore regularly test ho`,
        `Replica zyada hone chahiye the`,
        `SQL ki jagah NoSQL hota to bach jaata`
      ],
      answer: 1,
      why: `GitLab ki public post-mortem ke mutabik unke kai backup tareeke kaam nahi kar rahe the (pg_dump version mismatch ki wajah se chupchaap fail ho raha tha), aur aakhir mein ~6 ghante purane staging snapshot se restore hua, to ~6 ghante ka data khoya. Sabak: replica availability ke liye hai; backups alag, automated, aur unka restore drill regularly. Aur destructive commands pe "main kis host pe hoon" ka saaf indicator.`
    }
  ],
  references: [
    { title: "Postmortem of database outage of January 31", by: "GitLab", url: "https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/", type: "article" },
    { title: "GitHub: October 21 post-incident analysis", by: "GitHub", url: "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/", type: "article" },
    {
      title: "Designing Data-Intensive Applications, Ch. 5: Replication",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "System Design Primer: Replication",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    }
  ]
});
