// Sharding aur Consistent Hashing
registerLesson("hld", "sharding", {
  why: `Jab writes ya data ek DB machine se zyada ho jaayein, data ko kai machines (shards) mein todna padta hai. Kaise todein (range vs hash), hot shard kaise bachein, aur nodes jodte waqt saara data na hile: consistent hashing. Ye HLD ka sabse zyada pucha jaane wala deep dive hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Shard key: sabse important decision</h2>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Fayda</th><th>Nuksaan</th></tr>
          <tr><td><b>Range</b></td><td>user_id 1-1M → shard 1, 1M-2M → shard 2; ya date se</td><td>Range queries tez (ek shard)</td><td><b>Hot shard</b>: naye users / aaj ki date sab ek shard pe</td></tr>
          <tr><td><b>Hash</b></td><td><code>hash(user_id) % N</code></td><td>Barabar distribution</td><td>Range query sab shards pe; N badla to lagbhag saara data hilta hai</td></tr>
          <tr><td><b>Consistent hashing</b></td><td>Ring pe nodes aur keys; key apne clockwise next node pe</td><td>Node add/remove pe sirf ~1/N data hilta hai</td><td>Thoda complex; virtual nodes chahiye</td></tr>
          <tr><td><b>Directory / lookup</b></td><td>Ek mapping service: tenant → shard</td><td>Flexible, bade tenants alag</td><td>Lookup service khud critical</td></tr>
        </table>
        <p><b>Achhi shard key:</b> (1) high cardinality, (2) barabar load, (3) zyaadatar queries ek shard pe khatam (jaise chat app mein <code>conversation_id</code>: ek chat ke saare messages ek shard pe).</p>
        <h2>Modulo ka problem</h2>
        <p>4 shards se 5: <code>hash % 4</code> vs <code>hash % 5</code> pe ~80% keys ka shard badal jaata hai (sirf ~1/5 same rehti hain). Matlab lagbhag saara data move. Cache ke liye: lagbhag saara cache ek saath miss = DB pe stampede.</p>
        <h2>Consistent hashing</h2>
        `
    },
    {
      type: "flow",
      title: "Consistent hashing ring: node jodne pe sirf ek hissa hilta hai",
      height: 420,
      nodes: [
        {
          id: "n1",
          label: "Node A",
          icon: "🗄️",
          x: 500,
          y: 45,
          kind: "data",
          w: 120,
          h: 50
        },
        {
          id: "n2",
          label: "Node B",
          icon: "🗄️",
          x: 830,
          y: 290,
          kind: "data",
          w: 120,
          h: 50
        },
        {
          id: "n3",
          label: "Node C",
          icon: "🗄️",
          x: 170,
          y: 290,
          kind: "data",
          w: 120,
          h: 50
        },
        {
          id: "n4",
          label: "Node D (naya)",
          icon: "🆕",
          x: 800,
          y: 110,
          kind: "data",
          w: 150,
          h: 50
        },
        {
          id: "k1",
          label: "key: user42",
          icon: "🔑",
          x: 680,
          y: 190,
          kind: "client",
          w: 130,
          h: 40
        },
        {
          id: "k2",
          label: "key: order9",
          icon: "🔑",
          x: 650,
          y: 380,
          kind: "client",
          w: 130,
          h: 40
        },
        {
          id: "k3",
          label: "key: cart7",
          icon: "🔑",
          x: 210,
          y: 120,
          kind: "client",
          w: 130,
          h: 40
        },
        {
          id: "ring",
          label: "hash ring (0 … 2³²)",
          icon: "⭕",
          x: 500,
          y: 220,
          kind: "external",
          w: 200,
          h: 50
        }
      ],
      edges: [
        { from: "k1", to: "n2", dashed: true }, { from: "k1", to: "n4", dashed: true }, { from: "k2", to: "n3", dashed: true }, { from: "k3", to: "n1", dashed: true },
        {
          from: "n1",
          to: "n4",
          dashed: true
        },
        {
          from: "n4",
          to: "n2",
          dashed: true
        },
        {
          from: "n2",
          to: "n3",
          dashed: true
        },
        {
          from: "n3",
          to: "n1",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Har key apne clockwise agle node pe",
          html: `<p>Keys aur nodes dono ko hash karke ring pe rakha. <code>user42</code> ke baad clockwise pehla node B hai (abhi D nahi hai).</p>`,
          paths: [
            ["k1","n2"],
            ["k2","n3"],
            ["k3","n1"]
          ],
          dim: ["n4"]
        },
        {
          title: "Naya Node D aaya",
          html: "<p>D ring pe A aur B ke beech baitha. Sirf A→D wale arc ki keys (jaise <code>user42</code>) ab D pe jaayengi.</p>",
          path: ["k1","n4"],
          active: ["n4"]
        },
        {
          title: "Baaki keys apni jagah",
          html: `<p><code>order9</code> aur <code>cart7</code> ka node nahi badla. Modulo hashing (<code>hash % N</code>) mein N badalne pe lagbhag saari keys hil jaati.</p>`,
          paths: [
            ["k2","n3"],
            ["k3","n1"]
          ],
          active: ["n3","n1"]
        },
        {
          title: "Node B gira",
          html: `<p>B ki keys clockwise agle node pe chali jaati hain. Virtual nodes (har node ring pe 100+ jagah) ki wajah se ye load ek padosi pe nahi, sab mein bant-ta hai.</p>`,
          path: ["k1","n4"],
          fail: ["n2"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <p><b>Virtual nodes:</b> har physical node ring pe 100-200 jagah (hash(node#i)). Isse load barabar hota hai, aur node gire to uska load sab nodes mein bant-ta hai, ek padosi pe nahi. Cassandra, DynamoDB, Memcached clients isi ko use karte hain.</p>
        <h2>Sharding ke problems</h2>
        <ul>
          <li><b>Cross-shard queries/joins</b>: scatter-gather (sab shards se pucho, jodo), mehenga.</li>
          <li><b>Cross-shard transactions</b>: 2PC / saga (data-patterns lesson). Isliye shard key aisi ki transaction ek shard mein rahe.</li>
          <li><b>Hot key</b> (celebrity user): us key ko aur todo (key#1..key#10), ya cache.</li>
          <li><b>Resharding</b>: consistent hashing / pehle se bahut saare logical shards (jaise 1024) jo kam physical machines pe map hon.</li>
        </ul>`
    },
    {
      type: "tip",
      html: `🧪 <b>Simulator mein khud dekho:</b> 40,000 RPS, sirf 30% reads (write-heavy, jaise chat messages). Replicas se kya hota hai? Shards se?`
    },
    {
      type: "sim",
      id: "sim-shards",
      title: "Write-heavy: shards",
      config: {
        rps: 5000,
        maxRps: 60000,
        readRatio: 0.3,
        appCap: 2000,
        dbCap: 5000,
        servers: 50,
        lb: true,
        controls: ["rps","readRatio","shards","replicas"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> 28k writes/sec sirf primaries pe jaate hain. Replicas sirf reads lete hain, isliye yahan unse khaas fayda nahi. Shards writes (aur reads) baant-te hain: 40k / 5k per node = 8 shards sirf 100% pe chalenge; 80ms latency ke liye ~11 shards (~73% utilization) chahiye. Isliye write-heavy = shard; read-heavy = cache/replicas.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> E-commerce orders table shard karni hai. Queries: (a) customer apne orders dekhe, (b) merchant apne orders dekhe, (c) order id se order. Shard key kya ho, aur doosri query kaise chalegi?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Ek primary key chuno (jaise <b>customer_id</b>) jo sabse common query ek shard pe rakhe</li><li>Doosri access (merchant) ke liye <b>secondary index table / alag copy</b> sharded by merchant_id (denormalized, async)</li><li>Order id mein shard info embed (id → shard) ya lookup</li><li>Scatter-gather mehenga: avoid</li></ul></div>
          <div class="qa-a"><p>Sabse zyada traffic wali query ke hisaab se: <b>customer_id</b> se shard (customer ke saare orders ek shard pe). Merchant view ke liye ek <b>alag table/collection sharded by merchant_id</b> (order summary ki copy), jo events/CDC se async bharti hai: eventual consistent par scatter-gather se bacha. Order id: id generate karte waqt usme customer shard ke bits daal do (ya customer_id ko id ka hissa), taaki id se seedha shard pata chale. Rule: ek shard key har query ko khush nahi kar sakti; doosre access patterns ke liye denormalized copies.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Writes ya data ek primary se zyada ho jaayein, aur vertical scaling, cache, replicas, purana data archive karna: sab try ho chuke hon.</td></tr>
          <tr><th>Kab nahi</th><td>Shuru mein. Sharding sabse mehenga faisla hai jise wapas lena mushkil hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Cross-shard joins/transactions, hot shard, resharding (data move), har query ko shard key chahiye, operations kai guna.</td></tr>
          <tr><th>Alternatives</th><td>Badi machine, read replicas + cache, table partitioning (ek DB ke andar), managed distributed DB (DynamoDB, Spanner, CockroachDB), Vitess/Citus.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Notion ne 2021 mein Postgres ko 480 <b>logical</b> shards mein baanta (32 machines × 15), taaki baad mein machines badhani hon to sirf logical shards move karein; 2023 mein 96 machines pe le gaye. Logical shards zyada rakhna resharding ko aasaan karta hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Sharding bolne se pehle khud poocho: "kya replicas + cache se kaam chal jaayega?" (sharding complexity laata hai). Zaroori ho to: <i>shard key + reason, consistent hashing / logical shards for resharding, hot key plan, cross-shard queries ka plan.</i>`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Notion (2021) ne apna ek bada Postgres 32 physical databases mein shard kiya, par shards <b>480 logical</b> rakhe (har machine pe 15). 2023 mein 32 se 96 machines kiye. Logical shards physical machines se zyada kyun?`,
      options: [
        `480 random number hai`,
        `Data ek baar 480 logical shards mein baant diya; machines badhani hon to sirf poore logical shards dusri machine pe move hote hain, har row ka dobara hash/move nahi. 480 ke bahut divisors hain, to kai machine counts pe barabar baant sakte hain`,
        `Har user ka apna shard chahiye tha`,
        `Postgres 480 se zyada tables support nahi karta`
      ],
      answer: 1,
      why: `Notion ke blog ("Herding elephants" aur "The Great Re-shard") ke mutabik logical shards se resharding = shards ko nayi machines pe copy karna, application ka shard-routing logic wahi rehta hai. 2023 mein 96 machines × 5 logical shards. Sabak: shuru mein hi physical se zyada logical partitions rakhna (jaise consistent hashing ke virtual nodes) baad ka resharding aasaan karta hai.`
    }
  ],
  references: [
    { title: "The Great Re-shard: adding Postgres capacity (again) with zero downtime", by: "Notion", url: "https://www.notion.com/blog/the-great-re-shard", type: "article" },
    { title: "Herding elephants: lessons learned from sharding Postgres at Notion", by: "Notion", url: "https://www.notion.com/blog/sharding-postgres-at-notion", type: "article" },
    {
      title: "Designing Data-Intensive Applications, Ch. 6: Partitioning",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "Gaurav Sen (YouTube): consistent hashing",
      by: "Gaurav Sen",
      url: "https://www.youtube.com/@gkcs",
      type: "video"
    },
    {
      title: "System Design Primer: Sharding",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    }
  ]
});
