// SQL vs NoSQL
registerLesson("hld", "sql-vs-nosql", {
  why: `HLD mein DB choice access pattern aur scale se hoti hai. LLD lesson mein data shape dekha tha; yahan paanch NoSQL families aur unka scale/consistency trade-off. Interviewer 'kyun' sunna chahta hai, brand naam nahi.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>5 families</h2>
        <table>
          <tr><th>Type</th><th>Model</th><th>Examples</th><th>Kab</th></tr>
          <tr><td>Relational</td><td>Tables, joins, ACID</td><td>Postgres, MySQL</td><td>Default. Transactions, relationships, ad-hoc queries</td></tr>
          <tr><td>Key-value</td><td>key → blob</td><td>Redis, DynamoDB</td><td>Cache, sessions, simple lookups at huge scale</td></tr>
          <tr><td>Document</td><td>JSON documents</td><td>MongoDB</td><td>Flexible schema, nested data jo saath padha jaata</td></tr>
          <tr><td>Wide-column</td><td>Partition key → sorted rows (columns flexible)</td><td>Cassandra, HBase, Bigtable</td><td>Bahut zyada writes, time-series, messages (partition by user/chat, sort by time)</td></tr>
          <tr><td>Graph</td><td>Nodes + edges</td><td>Neo4j</td><td>Friends-of-friends, recommendations, fraud rings</td></tr>
        </table>
        <h2>Scale ka asli farak</h2>
        <ul>
          <li><b>Relational</b> ek node pe bahut door tak jaata hai (vertical + read replicas). Writes ek node se zyada chahiye to sharding manually / Vitess / Citus, aur cross-shard joins/transactions mushkil.</li>
          <li><b>Cassandra / DynamoDB</b> shuru se partitioned hain: writes linearly scale. Kimat: queries sirf partition key se (pehle query socho, phir table banao), joins nahi, consistency tunable/eventual.</li>
          <li>Aaj ka middle: <b>NewSQL</b> (Spanner, CockroachDB): SQL + distributed + strong consistency, latency thodi zyada.</li>
        </ul>
        <h2>Decision table</h2>
        <table>
          <tr><th>Requirement</th><th>Choice</th></tr>
          <tr><td>Paise, inventory, bookings: strong consistency, multi-row transactions</td><td>SQL</td></tr>
          <tr><td>Chat messages: 1 lakh+ writes/sec, query "chat X ke latest 50"</td><td>Cassandra (partition = chat_id, clustering = time)</td></tr>
          <tr><td>Product catalog, alag attributes</td><td>Document (ya Postgres JSONB)</td></tr>
          <tr><td>Sessions, counters, leaderboard</td><td>Redis</td></tr>
          <tr><td>Social graph queries 3 hops</td><td>Graph DB (ya adjacency in KV + cache)</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>WhatsApp messages store karne ke liye Cassandra ke baare mein kaunse statements sahi hain?</b></div>
          <ul class="qa-options"><li>✅ Partition key = conversation_id, clustering key = message time/id: ek chat ke messages saath, sorted<div class="small muted">Query pattern: 'chat ke latest messages' ek partition read.</div></li><li>❌ Har tarah ki ad-hoc query (kisi bhi column se search) aasaan hai<div class="small muted">Query partition key se design hoti hai. Search ke liye alag index/ES.</div></li><li>✅ Writes nodes badhane se scale hote hain<div class="small muted">Peer-to-peer, consistent hashing ring.</div></li><li>❌ Multi-chat ACID transaction (do chats ek saath atomic) natural hai<div class="small muted">Cassandra mein cross-partition ACID nahi (lightweight transactions single partition, mehenge).</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Uber jaisa app: (1) trips + payments, (2) driver location har 4 second (lakhon drivers), (3) trip history jo user kabhi kabhi dekhta hai (saalon ka). Har ek ke liye store aur reason.</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Trips/payments → <b>SQL</b> (ACID, state transitions)</li><li>Live location → <b>in-memory / Redis geo</b> (overwrite, latest only, TTL)</li><li>History → <b>wide-column / partitioned</b> (Cassandra/Dynamo) ya archived storage</li></ul></div>
          <div class="qa-a"><p>(1) Trips aur payments: Postgres/MySQL: state machine (REQUESTED → ACCEPTED → COMPLETED), payments ACID. Bahut scale pe city/region se shard. (2) Live locations: Redis (GEOADD/GEOSEARCH) ya in-memory geo index: sirf latest chahiye, har 4s overwrite, disk pe likhna bekaar. (3) History: write-once, read-rare, bahut bada: Cassandra/DynamoDB (partition user_id, sort by time) ya purana data S3 + analytics. Ek system mein kai DB normal hain: har data ka access pattern alag.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>SQL default rakho. NoSQL tab jab ek specific access pattern (key lookup, time-ordered writes per partition) bahut bade scale pe ho, ya data ka shape tables mein fit na ho.</td></tr>
          <tr><th>Kab nahi</th><td>Sirf 'NoSQL scale karta hai' sun ke mat lo: Postgres ek machine pe hazaaron writes/sec aur TBs sambhal leta hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>NoSQL mein queries pehle se design karni padti hain, joins/multi-row transactions nahi, consistency aksar eventual. SQL ko bahut bade scale pe sharding ka kaam.</td></tr>
          <tr><th>Alternatives</th><td>Postgres JSONB (document jaisa flexible data SQL ke andar), NewSQL (Spanner, CockroachDB: SQL + distributed), sharding tools (Vitess, Citus).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Discord: 2015 mein MongoDB → 2017 Cassandra (messages) → 2022 ScyllaDB. Notion: Postgres hi rakha, 2021 mein 480 logical shards / 32 machines pe sharding ki. Dono ne access pattern dekh ke faisla kiya.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> DB choose karte waqt formula: <i>"access pattern + consistency need + write/read scale"</i>. Jaise: "messages: high write, query by chat_id + time, eventual OK → Cassandra." Brand se pehle reason.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Discord (2022): messages Cassandra (177 nodes) pe the. Ek bade server ke popular channel pe hazaaron log ek saath purane messages padhte, to us data wale nodes slow ho jaate aur latency poore cluster mein unpredictable ho jaati. Main wajah kya thi?`,
      options: [
        `Cassandra SQL support nahi karta`,
        `Data channel (+ time bucket) se partitioned tha; ek bahut active channel ki saari reads kuch hi nodes pe jaati thi (hot partition), aur JVM garbage collection pauses latency aur badhate the`,
        `Messages ka size bahut bada tha`,
        `Indexes nahi the`
      ],
      answer: 1,
      why: `Discord ke blog "How Discord Stores Trillions of Messages" ke mutabik hot partitions aur GC pauses badi dikkat the. Unhone (1) ScyllaDB liya (Cassandra-compatible, C++, GC nahi) aur 177 nodes se 72 pe aaye, aur (2) database ke aage Rust ki data services lagayi jo same channel ke ek saath aaye requests ko <b>coalesce</b> karti hain (ek hi query DB tak). Sabak: NoSQL choose karne ke baad bhi partition key ka access pattern hi performance decide karta hai.`
    }
  ],
  references: [
    { title: "How Discord Stores Trillions of Messages", by: "Discord", url: "https://discord.com/blog/how-discord-stores-trillions-of-messages", type: "article" },
    {
      title: "Designing Data-Intensive Applications, Ch. 2-3",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "System Design Primer: SQL or NoSQL",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    }
  ]
});
