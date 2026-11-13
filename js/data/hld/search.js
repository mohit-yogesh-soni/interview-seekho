// Search (Elasticsearch)
registerLesson("hld", "search", {
  why: `Product search, log search, autocomplete: ye sab 'text ke andar word dhoondo, relevance se sort karo' hai, jo normal DB index nahi kar sakta. Inverted index ka idea samajh liya to Elasticsearch kab aur kaise lagana hai, khud nikaal loge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>LIKE '%phone%' kyun kaafi nahi</h2>
        <ul>
          <li>Leading wildcard (<code>%phone</code>) pe B-tree index use nahi hota: full scan. 5 crore products pe seconds.</li>
          <li>Relevance nahi ("red phone case" ke liye best match upar), typo tolerance nahi ("iphnoe"), synonyms nahi (mobile = phone), stemming nahi (running → run).</li>
        </ul>
        <h2>Inverted index: kitaab ke peeche wala index, ulta</h2>
        <table>
          <tr><th>Documents</th><th>Inverted index (word → docs)</th></tr>
          <tr><td>1: "red phone case"<br>2: "blue phone"<br>3: "red shoes"</td>
              <td><code>red → [1, 3]</code><br><code>phone → [1, 2]</code><br><code>case → [1]</code><br><code>blue → [2]</code><br><code>shoe → [3]</code> (shoes → shoe, stemming)</td></tr>
        </table>
        <p>Query <b>"red phone"</b>: <code>red</code> aur <code>phone</code> ki lists ka intersection = doc 1 (AND). OR search mein 1, 2, 3 sab, aur BM25 score se doc 1 (dono words) sabse upar.</p>
        <ul>
          <li><b>Analyzer:</b> text → tokens (lowercase, stop words, stemming, synonyms).</li>
          <li><b>Scoring (BM25):</b> word us doc mein zyada aur poore corpus mein rare ho → zyada score.</li>
          <li><b>Elasticsearch / OpenSearch:</b> Lucene ke upar distributed: index ko shards mein, replicas, near-real-time (refresh ~1s).</li>
        </ul>
        <h2>Architecture: DB source of truth, ES search ke liye copy</h2>
        `
    },
    {
      type: "flow",
      title: "DB source of truth, Elasticsearch search ke liye",
      nodes: [
        {
          id: "app",
          label: "App",
          icon: "🖥️",
          x: 100,
          y: 160,
          kind: "service"
        },
        {
          id: "pg",
          label: `Postgres
(source of truth)`,
          icon: "🗄️",
          x: 350,
          y: 60,
          kind: "data",
          w: 170
        },
        {
          id: "cdc",
          label: "CDC / Kafka",
          icon: "📨",
          x: 620,
          y: 60,
          kind: "queue"
        },
        {
          id: "idx",
          label: "Indexer",
          icon: "⚙️",
          x: 860,
          y: 60,
          kind: "service"
        },
        {
          id: "es",
          label: "Elasticsearch",
          icon: "🔍",
          x: 620,
          y: 260,
          kind: "data",
          w: 170
        },
        {
          id: "cache",
          label: "Product cache",
          icon: "⚡",
          x: 350,
          y: 260,
          kind: "cache",
          w: 160
        }
      ],
      edges: [
        {
          from: "app",
          to: "pg"
        },
        {
          from: "pg",
          to: "cdc"
        },
        {
          from: "cdc",
          to: "idx"
        },
        {
          from: "idx",
          to: "es"
        },
        {
          from: "app",
          to: "es",
          both: true,
          dashed: true
        },
        {
          from: "app",
          to: "cache",
          both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Write: sirf DB mein",
          html: "<p>Naya product Postgres mein save. App Elasticsearch mein seedha nahi likhta (do jagah likhna = inconsistency).</p>",
          path: ["app","pg"],
          active: ["pg"]
        },
        {
          title: "Change event se index update",
          html: `<p>CDC (Debezium) DB ke change ko Kafka pe bhejta hai, indexer use ES mein index karta hai. ~1-2 second ki der (eventual).</p>`,
          path: ["pg","cdc","idx","es"],
          active: ["es"]
        },
        {
          title: "Search ES se, details cache/DB se",
          html: "<p>Query ES pe: matching product ids relevance order mein. Phir ids ki details cache se.</p>",
          path: ["app","es","app","cache","app"],
          active: ["es","cache"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <p>ES ko primary DB mat banao (transactions nahi, writes eventual). Sync async hai, isliye naya product search mein ~seconds baad dikhega: bolo ki ye theek hai.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Search box autocomplete ("iph" type kiya → "iphone 15", "iphone cover"...) top 10 popular suggestions 50ms ke andar, 1 lakh QPS pe. Design?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li><b>Trie / prefix index</b> (ya ES completion suggester / edge n-grams)</li><li>Har prefix node pe <b>top-K precomputed</b> (popularity se)</li><li><b>Cache</b> (CDN/Redis) for common prefixes; client debounce</li><li>Popularity offline update (logs → batch job) har kuch ghante</li></ul></div>
          <div class="qa-a"><p>Query logs se popular queries ka count (offline batch, har ghanta). Unse trie banao jahan <b>har node pe top-10 suggestions pehle se store</b>: lookup = prefix tak chalo, list lautao: O(prefix length). Trie memory mein kai servers pe (read-only, replicated), ya Redis sorted sets per prefix. Common prefixes (1-3 letters) CDN/edge pe cache, client 100-200ms debounce. Personalization chahiye to upar ek halki re-ranking layer.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Full-text search (words, typo, relevance ranking), filters/facets bade data pe, <code>LIKE '%x%'</code> slow ho gaya.</td></tr>
          <tr><th>Kab nahi</th><td>Exact key lookup, ya data chhota hai: Postgres full-text search (<code>tsvector</code>) + GIN index kaafi hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Ek alag system jise DB se sync rakhna hai (CDC/events), index thoda late update hota hai, aur ye source of truth nahi (data DB se dobara banna chahiye).</td></tr>
          <tr><th>Alternatives</th><td>Postgres FTS, managed search (Algolia, OpenSearch Service), vector search (meaning se dhoondhna, AI module mein).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Elasticsearch aur OpenSearch dono Apache Lucene library pe bane hain (inverted index). Wikipedia ka search (CirrusSearch) Elasticsearch pe chalta hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Search wale design mein bolo: <i>"DB source of truth, CDC/Kafka se Elasticsearch index, search ES se ids, details DB/cache se; index ~1s eventually consistent."</i>`
    },
    {
      type: "quiz",
      q: `🏭 <b>Production problem:</b> Ek e-commerce site sale ke din product search ke liye <code>SELECT * FROM products WHERE title LIKE '%phone%'</code> chala rahi hai (2 crore products). Traffic 10× hua aur DB CPU 100% pe gaya, checkout bhi slow ho gaya. Sahi design change kya hai?`,
      options: [
        `LIKE ke saath title pe B-tree index bana do, problem khatam`,
        `Search ko alag search engine (Elasticsearch/OpenSearch, inverted index) pe le jao jo DB se events/CDC se sync ho; checkout wala DB search load se alag ho jaata hai`,
        `Products table ko 2 tables mein tod do`,
        `Search band kar do`
      ],
      answer: 1,
      why: `Shuru mein % wala <code>LIKE '%phone%'</code> normal B-tree index use nahi kar sakta, to har query full scan karti hai. Inverted index (word → product ids) isi ke liye bana hai. Saath mein search aur transactions ka load alag ho jaata hai, to search ka spike checkout nahi girata. Kimat: ek aur system aur thoda stale index. Chhote data pe Postgres full-text search (GIN index) bhi kaafi hai. (Ye bahut common pattern hai; Wikipedia ka site search bhi Elasticsearch-based CirrusSearch pe chalta hai.)`
    }
  ],
  references: [
    {
      title: "Designing Data-Intensive Applications, Ch. 3 (full-text search indexes)",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "Hello Interview: System Design problem breakdowns",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview",
      type: "course"
    }
  ]
});
