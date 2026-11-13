// Database indexing
registerLesson("hld", "indexing", {
  why: `DB ke andar data kaise rakha hai (B-tree ya LSM-tree) wahi decide karta hai ki wo read-heavy ke liye achha hai ya write-heavy ke liye. Postgres/MySQL vs Cassandra/RocksDB ka farak yahi hai. Senior interviews mein 'write-heavy system ke liye kaunsa DB aur kyun' ka jawab isi se aata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>B-tree (Postgres, MySQL InnoDB)</h2>
        <ul>
          <li>Sorted, balanced tree of <b>pages</b> (aksar 8-16 KB). Har node mein bahut keys, isliye tree chhota: crores rows ke liye bhi 3-4 levels.</li>
          <li>Read: root → leaf, 3-4 page reads (upar ke pages memory mein cached) → bahut tez lookup aur range scan.</li>
          <li>Write: sahi leaf page dhoondho aur <b>wahin update</b> (in-place). Page full → split. Random disk writes + WAL (write-ahead log) for crash safety.</li>
        </ul>
        <h2>LSM-tree (Cassandra, RocksDB, LevelDB, HBase)</h2>
        <ol>
          <li>Write pehle <b>memtable</b> (memory, sorted) + commit log (sequential append) mein. Bahut tez.</li>
          <li>Memtable bhara → disk pe immutable sorted file <b>SSTable</b> (sequential write).</li>
          <li>Background <b>compaction</b> purani SSTables merge karta hai (duplicates/deletes saaf).</li>
          <li>Read: memtable, phir SSTables (naye se purane). <b>Bloom filters</b> batate hain "is file mein key pakka nahi hai", taaki har file na khulni pade.</li>
        </ol>
        <table>
          <tr><th></th><th>B-tree</th><th>LSM-tree</th></tr>
          <tr><td>Writes</td><td>Theek (random I/O, in-place)</td><td>Bahut tez (sequential, append)</td></tr>
          <tr><td>Reads</td><td>Tez, predictable</td><td>Kai files dekhni pad sakti hain (Bloom filter + compaction madad)</td></tr>
          <tr><td>Space/amplification</td><td>Pages adhe khaali (fragmentation)</td><td>Compaction mein extra I/O (write amplification)</td></tr>
          <tr><td>Best for</td><td>OLTP, read-heavy + range queries</td><td>Write-heavy: logs, events, messages, time-series</td></tr>
        </table>
        <h2>Secondary indexes ka kharcha</h2>
        <p>Har index ek extra structure hai jo har write pe update hota hai. 5 indexes = 1 insert pe ~6 writes. Index wahi jo queries sach mein use karein. Covering index (query ke saare columns index mein) table tak jaana bhi bacha deta hai.</p>`
    },
    {
      type: "flow",
      title: "LSM write aur read path",
      nodes: [
        {
          id: "w",
          label: "Write",
          icon: "✍️",
          x: 80,
          y: 90,
          kind: "client",
          w: 110
        },
        {
          id: "log",
          label: `Commit log
(append)`,
          icon: "📜",
          x: 300,
          y: 250,
          kind: "data"
        },
        {
          id: "mem",
          label: `Memtable
(RAM, sorted)`,
          icon: "🧠",
          x: 300,
          y: 90,
          kind: "cache"
        },
        {
          id: "s1",
          label: "SSTable 3 (new)",
          icon: "📄",
          x: 580,
          y: 50,
          kind: "data",
          w: 170
        },
        {
          id: "s2",
          label: "SSTable 2",
          icon: "📄",
          x: 580,
          y: 160,
          kind: "data",
          w: 170
        },
        {
          id: "s3",
          label: "SSTable 1 (old)",
          icon: "📄",
          x: 580,
          y: 270,
          kind: "data",
          w: 170
        },
        {
          id: "comp",
          label: `Compaction
merge + delete`,
          icon: "🧹",
          x: 850,
          y: 160,
          kind: "service",
          w: 160
        },
        {
          id: "r",
          label: "Read",
          icon: "🔎",
          x: 80,
          y: 300,
          kind: "client",
          w: 110
        }
      ],
      edges: [
        {
          from: "w",
          to: "mem"
        },
        {
          from: "w",
          to: "log"
        },
        {
          from: "mem",
          to: "s1",
          dashed: true,
          label: "flush"
        },
        {
          from: "s2",
          to: "comp"
        },
        {
          from: "s3",
          to: "comp"
        },
        {
          from: "r",
          to: "mem",
          dashed: true
        },
        {
          from: "mem",
          to: "s2",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Write: log + memtable (fast)",
          html: `<p>Har write commit log mein sequential append (crash safety) aur RAM ke sorted memtable mein. Disk pe random write nahi.</p>`,
          paths: [
            ["w","log"],
            ["w","mem"]
          ],
          active: ["log","mem"]
        },
        {
          title: "Memtable full → SSTable flush",
          html: "<p>Sorted memtable ek immutable SSTable file ban ke disk pe (sequential write).</p>",
          path: ["mem","s1"],
          active: ["s1"]
        },
        {
          title: "Read: naye se purane tak",
          html: "<p>Pehle memtable, phir SSTables (naya pehle). Bloom filter batata hai kis file mein key pakka nahi, wo skip.</p>",
          path: ["r","mem","s2"],
          active: ["mem","s2"]
        },
        {
          title: "Compaction: purani files merge",
          html: "<p>Background mein SSTables merge: duplicates aur deleted (tombstone) keys hatati hain, read ke liye files kam.</p>",
          paths: [
            ["s2","comp"],
            ["s3","comp"]
          ],
          active: ["comp"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> IoT system: 5 lakh sensors har second ek reading likhte hain; queries: 'sensor X ki pichhle 1 ghante ki readings'. Kaunsa storage engine type natural fit hai?</div>
          <div class="qa-a"><b>Jawab:</b> LSM-based wide-column (Cassandra) / time-series DB: bahut zyada sequential writes, aur partition = sensor, sort = time se range read. 5 lakh writes/sec write-heavy hai; LSM append-only writes ko sasta banata hai. Query pattern (ek sensor, time range) partition + clustering key se seedha match.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Kaunse statements <b>sahi</b> hain?</b></div>
          <ul class="qa-options"><li>✅ Bloom filter 'key shayad hai' ya 'pakka nahi hai' batata hai: false positive ho sakte hain, false negative nahi<div class="small muted">Isliye 'nahi hai' pe file skip safe hai.</div></li><li>❌ LSM mein delete turant disk se data hata deta hai<div class="small muted">Delete ek tombstone marker likhta hai; asli safai compaction mein.</div></li><li>✅ Har column pe index lagane se writes slow hote hain<div class="small muted">Har index har write pe update.</div></li><li>✅ B-tree mein crores rows ke liye bhi lookup kuch hi page reads ka hai<div class="small muted">High fan-out: tree bahut chhota rehta hai.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Order table (50 crore rows) pe query: <code>WHERE merchant_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at</code> 8 second leti hai. Kya karoge? Aur agar writes bhi bahut hain (10k/sec)?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li><b>Composite index (merchant_id, created_at)</b></li><li>EXPLAIN se plan check (full scan?)</li><li>Bahut writes: indexes kam, <b>partitioning by time</b> (monthly), purana data archive</li><li>Reporting queries ko <b>replica / analytics store</b> pe bhejo</li></ul></div>
          <div class="qa-a"><p><code>EXPLAIN</code> se dekho; aksar full scan. <b>Composite index (merchant_id, created_at)</b>: equality column pehle, range/sort column baad mein, to index se seedha range nikalti hai already sorted. 10k writes/sec pe: sirf zaroori indexes, table ko <b>time se partition</b> karo (har mahine ki partition, purane partitions cheap storage pe/drop), aur merchant dashboards jaisi reporting queries read replica ya analytics DB (ClickHouse/BigQuery) pe, taaki OLTP primary pe load na pade.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Ek column pe baar baar filter/sort/join hota hai aur table badi hai (full scan slow).</td></tr>
          <tr><th>Kab nahi</th><td>Write-heavy table jahan wo column kabhi query nahi hota; bahut chhoti tables; sirf ek low-cardinality column (jaise gender) jo aadhi table match kare.</td></tr>
          <tr><th>Kimat (cost)</th><td>Har insert/update pe har index bhi update hota hai (writes slow), extra disk aur RAM. 10 index = har write pe 10 extra kaam.</td></tr>
          <tr><th>Alternatives</th><td>Composite/covering index (ek index se poori query), partitioning (purana data alag), search engine (full-text ke liye), LSM-based store (bahut writes ke liye).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Postgres/MySQL (InnoDB) mein default B-tree index. Cassandra, RocksDB (Facebook ka) aur LevelDB LSM-tree pe chalte hain, isliye writes tez aur reads mein compaction ka kaam.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Write-heavy hai, isliye LSM-based store (Cassandra) chunta hoon: sequential writes; reads ke liye partition key query pattern se" — ek line mein storage engine ka reason dena senior signal hai.`
    },
    {
      type: "quiz",
      q: `🏭 <b>Production problem:</b> Postgres mein 50 crore rows wali <code>orders</code> table hai. Peak hours mein ek engineer ne naya index banaya: <code>CREATE INDEX idx_user ON orders(user_id);</code> Index banne mein 20 minute lage aur us dauraan saare naye orders fail/atak gaye. Kyun, aur sahi tareeka?`,
      options: [
        `Index ka naam galat tha`,
        `Normal CREATE INDEX table pe aisa lock leta hai jo INSERT/UPDATE/DELETE rok deta hai (reads chalte rehte hain); <code>CREATE INDEX CONCURRENTLY</code> se writes chalte rehte hain (thoda slow aur zyada time)`,
        `Postgres mein index ban hi nahi sakta`,
        `User_id pe index kabhi nahi banta`
      ],
      answer: 1,
      why: `Postgres docs ke mutabik normal CREATE INDEX table ko writes ke against lock karta hai jab tak index ban na jaaye. <code>CONCURRENTLY</code> option table ko do baar scan karta hai par writes block nahi karta (transaction block ke andar nahi chal sakta, aur fail ho to invalid index chhod deta hai jise drop karke dobara banana padta hai). Ye migrations ka bahut common production incident hai; isliye bade tables pe schema changes off-peak aur online tareekon se.`
    }
  ],
  references: [
    { title: "PostgreSQL docs: CREATE INDEX (Building Indexes Concurrently)", by: "PostgreSQL", url: "https://www.postgresql.org/docs/current/sql-createindex.html", type: "article" },
    {
      title: "Designing Data-Intensive Applications, Ch. 3: Storage and Retrieval",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "Arpit Bhayani (YouTube): database internals",
      by: "Arpit Bhayani",
      url: "https://www.youtube.com/@AsliEngineering",
      type: "video"
    }
  ]
});
