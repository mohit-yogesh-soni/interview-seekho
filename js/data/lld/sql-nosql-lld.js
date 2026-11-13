// SQL vs NoSQL (LLD level)
registerLesson("lld", "sql-nosql-lld", {
  why: "LLD mein schema ke saath aksar poocha jaata hai: 'SQL kyun, Mongo kyun nahi?' Iska jawab hype nahi, data ka shape aur access pattern hai. Is lesson ke baad aap ek simple decision process se choice kar paoge. Scale wali baatein (sharding, CAP) HLD module mein.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Do soch</h2>
        <table>
          <tr><th></th><th>Relational (Postgres, MySQL)</th><th>Document (MongoDB)</th><th>Key-value (Redis, DynamoDB)</th></tr>
          <tr><td>Data shape</td><td>Tables, rows, fixed schema</td><td>JSON-jaise documents, nested, flexible fields</td><td>key → value (value opaque ya simple)</td></tr>
          <tr><td>Relationships</td><td>Joins + FKs: strong</td><td>Embed (andar rakho) ya reference; joins kamzor</td><td>App khud sambhale</td></tr>
          <tr><td>Transactions</td><td>Multi-row ACID: core strength</td><td>Single-document atomic; multi-document transactions MongoDB 4.0+ mein hain par mehengi</td><td>Mostly single-key</td></tr>
          <tr><td>Queries</td><td>Ad-hoc SQL, aggregations</td><td>Document fields pe queries, aggregation pipeline</td><td>Sirf key se (ya limited indexes)</td></tr>
          <tr><td>Best for</td><td>Money, bookings, inventory: consistency + relationships</td><td>Catalog jahan har product ke alag attributes; content; event payloads</td><td>Cache, sessions, counters, feature flags</td></tr>
        </table>
        <h2>Embed vs reference (document DB ka main sawaal)</h2>
        <pre class="code-static">// Embed: jo saath padha jaata hai aur saath badalta hai
{ "_id": "order42", "customer": { "id": "c7", "name": "Riya" },
  "items": [ { "sku": "P1", "qty": 2, "price": 10 } ], "status": "PLACED" }

// Reference: jo bada / alag se badalta / kai jagah shared
{ "_id": "c7", "name": "Riya", "addresses": [...] }   // orders mein sirf "customerId": "c7"</pre>
        <p>Embed jab: 1:few, hamesha parent ke saath padha jaata hai, parent ke bina matlab nahi (order items). Reference jab: 1:many-many (ek user ke lakhon events), ya shared aur alag se update (customer profile).</p>
        <h2>Decision process (LLD level)</h2>
        <ol>
          <li><b>Kya multi-entity consistency chahiye?</b> (paisa, seats, stock) → SQL default.</li>
          <li><b>Data ka shape fixed hai ya har record alag?</b> Bahut alag attributes → document (ya SQL + JSONB column).</li>
          <li><b>Access pattern sirf key se?</b> (session, cache) → key-value.</li>
          <li>Doubt ho to <b>Postgres</b>: relational + JSONB + strong transactions, aur zyaadatar LLD scale pe kaafi.</li>
        </ol>`
    },
    {
      type: "pick",
      id: "pick-db-choice",
      q: "Kahan <b>relational DB</b> natural choice hai?",
      options: [
        { text: "Movie ticket booking (seats, shows, payments)", correct: true, why: "Double booking rokna, multi-row transactions." },
        { text: "Bank ledger", correct: true, why: "ACID, constraints, audit." },
        { text: "User login session token (30 min TTL)", correct: false, why: "Key se lookup + expiry: Redis jaisa key-value." },
        { text: "E-commerce catalog jahan phone ke attributes (RAM, camera) aur shirt ke (size, fabric) bilkul alag", correct: false, why: "Document model achha (ya SQL ka JSONB column). Pure relational mein EAV tables gande ho jaate hain." },
        { text: "Splitwise groups, expenses, balances", correct: true, why: "Relationships (group-user M:N) aur consistent balances." }
      ]
    },
    {
      type: "think",
      id: "think-db-hybrid",
      q: "Food delivery app: orders/payments, restaurant menus (har restaurant ka alag structure: combos, add-ons), live rider location (har 3 second), aur user sessions. Har ek ke liye store choose karo aur reason do.",
      rubric: [
        { point: "Orders/payments → <b>SQL</b> (ACID)", keys: ["sql", "postgres", "mysql", "relational"], weight: 2 },
        { point: "Menus → <b>document</b> (flexible, nested) ya JSONB", keys: ["document", "mongo", "jsonb", "flexible", "nested"], weight: 2 },
        { point: "Rider location → <b>in-memory / Redis</b> (frequent overwrite, sirf latest, geo)", keys: ["redis", "in-memory", "cache", "geo", "latest", "ttl"], weight: 2 },
        { point: "Sessions → <b>key-value with TTL</b>", keys: ["session", "ttl", "key-value", "key value", "expire"] }
      ],
      answer: "<ul><li><b>Orders, payments:</b> Postgres — transactions, FKs, reporting.</li><li><b>Menus:</b> document (Mongo) ya Postgres JSONB — har restaurant ka nested, alag structure; mostly poora menu ek saath padha jaata hai.</li><li><b>Rider location:</b> Redis (GEO commands) — har 3s overwrite, sirf latest chahiye, history zaroori ho to alag time-series/stream.</li><li><b>Sessions:</b> Redis with TTL.</li></ul><p>Ek app mein kai stores normal hai (polyglot persistence). Har choice ke saath \"kya consistency chahiye aur kaise padha jaata hai\" bolo.</p>"
    },
    {
      type: "quiz",
      q: "MongoDB mein single document update ke baare mein kya sahi hai?",
      options: [
        "Atomic nahi hota",
        "Ek document ke andar ka update (nested fields samet) atomic hota hai; isliye jo cheezein saath consistent rehni chahiye unhe ek document mein embed karna design trick hai",
        "Sirf transactions mein atomic",
        "Sirf _id field atomic hai"
      ],
      answer: 1,
      why: "MongoDB single-document writes atomic hain. Order + items ek document mein = ek atomic write. Multi-document ke liye transactions (4.0+) hain par cost zyada."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"NoSQL kyunki scale\" mat bolo. Bolo: <i>\"Bookings mein multi-row consistency chahiye, isliye Postgres; agar read traffic badha to read replicas + cache, aur sirf catalog jaise flexible data document store mein.\"</i>"
    }
  ],
  references: [
    { title: "Designing Data-Intensive Applications, Ch. 2", by: "Martin Kleppmann", url: "https://dataintensive.net/", type: "book" },
    { title: "Redis docs", by: "Redis", url: "https://redis.io/docs/latest/", type: "docs" },
    { title: "Hello Interview: System Design core concepts", by: "Hello Interview", url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", type: "course" }
  ]
});
