// Design: company docs chatbot (RAG) — evolution style
registerLesson("ai", "design-rag-bot", {
  why: `"Company ke documents pe chatbot design karo" aaj ka sabse common AI system design question hai. Hum HLD wale tareeke se chalenge: sabse simple version, phir dekhenge kya toot-ta hai (quality, permissions, freshness, kharcha), aur har component tabhi jodenge jab uski zaroorat dikhe.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> employees HR, IT, engineering docs (Confluence, Google Drive, PDFs) ke baare mein sawaal poochein; jawab ke saath <b>source links</b>; follow-up sawaal ("aur contractors ke liye?").</li>
          <li><b>Non-functional:</b> jawab galat ho to source dekh ke pakda ja sake; kisi ko wo doc na dikhe jiski permission nahi; naya/updated doc ek din ke andar (behtar: ghante ke andar) searchable; pehla token ~2 s mein.</li>
        </ul>
        <pre class="code-static">Employees 5,000; peak pe ~10% ek ghante mein 2 sawaal → ~1,000 sawaal/ghanta ≈ 0.3/s (peak ~2-5/s)
Docs 50,000 × ~10 chunks = 5 lakh chunks
Vectors: 5 lakh × 1,536 dims × 4 bytes ≈ 3 GB (index ke saath thoda zyada)
Har sawaal: ~5 chunks × ~500 tokens + instructions ≈ 3-4k input tokens</pre>
        <p><b>Numbers se kya pata chala:</b> traffic bahut kam hai (kuch requests/sec) aur vectors ~3 GB. Ye "scale" problem nahi, <b>quality, permissions aur freshness</b> ki problem hai. Isliye koi exotic infra nahi chahiye.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple jo kaam kare</h2>
        <p>Ek ingestion script (raat mein chalta hai): docs export → text → chunks (~500 tokens, thoda overlap) → embeddings → <b>Postgres + pgvector</b>. Ek API: sawaal → embedding → top-5 → prompt ("sirf context se, source batao, na mile to bolo") → LLM API → streamed jawab.</p>
        <table>
          <tr><th>Faisla</th><th>Kyun</th><th>Alternative aur kyun nahi (abhi)</th></tr>
          <tr><td>pgvector</td><td>3 GB vectors, kam QPS; Postgres team chalati hi hai; metadata (doc, ACL, date) usi table mein, SQL filters free</td><td>Dedicated vector DB: crores vectors ya bahut high QPS pe; abhi ek naya system bekaar</td></tr>
          <tr><td>Hosted LLM API</td><td>Kam traffic pe GPU 24×7 chalana mehenga; best quality turant</td><td>Self-host: data bahar na jaane ki strict requirement ho, ya traffic bahut zyada</td></tr>
          <tr><td>Nightly batch ingestion</td><td>Simple; v1 ke liye kaafi</td><td>Real-time sync: Stage 3</td></tr>
          <tr><td>SSE streaming</td><td>Pehla token jaldi dikhe</td><td>Poora jawab wait: 5-10 s khaali screen</td></tr>
        </table>`
    },
    {
      type: "flow",
      title: "Stage 1: nightly ingestion + simple query path",
      nodes: [
        { id: "src", label: "Confluence,\nDrive, PDFs", icon: "📚", x: 90, y: 80, kind: "data", w: 160 },
        { id: "ing", label: "Nightly job:\nchunk + embed", icon: "🌙", x: 330, y: 80, kind: "service", w: 170 },
        { id: "pg", label: "Postgres + pgvector\n(chunk, vector, meta)", icon: "🗄️", x: 620, y: 80, kind: "data", w: 210 },
        { id: "u", label: "Employee", icon: "🙋", x: 90, y: 280, kind: "client", w: 130 },
        { id: "api", label: "Chat API", icon: "🖥️", x: 330, y: 280, kind: "service", w: 150 },
        { id: "llm", label: "LLM API\n(stream)", icon: "🧠", x: 620, y: 280, kind: "external", w: 160 }
      ],
      edges: [
        { from: "src", to: "ing" },
        { from: "ing", to: "pg" },
        { from: "u", to: "api", both: true },
        { from: "api", to: "pg", both: true },
        { from: "api", to: "llm", both: true }
      ],
      steps: [
        { title: "Raat: ingestion", html: "<p>Saare docs dobara chunk + embed, table bharo.</p>", path: ["src", "ing", "pg"], active: ["ing"] },
        { title: "Sawaal: top-5 chunks", html: "<p>Sawaal ka embedding, pgvector se top-5.</p>", path: ["u", "api", "pg", "api"], active: ["pg"] },
        { title: "Jawab stream", html: "<p>Chunks + sawaal LLM ko; tokens SSE se user tak, sources ke links ke saath.</p>", path: ["api", "llm", "api", "u"], active: ["llm"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: launch ke baad: "galat jawab de raha hai"</h2>
        <p>Pehle hafte ki complaints dekho (aur unhe eval set mein daalo). Teen common patterns, aur har ek ka fix:</p>
        <table>
          <tr><th>Complaint</th><th>Asli wajah</th><th>Fix</th><th>Kimat</th></tr>
          <tr><td>"VPN-2024 policy" poocha, kuch aur aaya</td><td>Embeddings exact codes/naam achhe se nahi pakadte</td><td><b>Hybrid search</b>: Postgres full-text (ya BM25) + vector, results merge (jaise reciprocal rank fusion)</td><td>Thoda extra query time</td></tr>
          <tr><td>Sahi doc top-20 mein hai par top-5 mein nahi</td><td>Similarity ≠ relevance</td><td><b>Reranker</b>: top-30 lo, cross-encoder model se score, top-5 rakho</td><td>~100-300 ms extra, ek aur model call</td></tr>
          <tr><td>"Aur contractors ke liye?" pe bekaar jawab</td><td>Follow-up akela search hua</td><td><b>Query rewriting</b>: chat history se poora sawaal banao ("Contractors ki leave policy kya hai?"), phir search</td><td>Ek chhota LLM call</td></tr>
          <tr><td>Purani 2021 policy ka jawab</td><td>Purane versions bhi index mein</td><td>Metadata: <code>is_latest</code>, date; filter/boost</td><td>Ingestion mein version tracking</td></tr>
        </table>
        <p><b>Kaise pata chale fix kaam kiya?</b> Eval set (200 asli sawaal + sahi source): retrieval recall@5 aur answer faithfulness, har change se pehle aur baad (evals lesson). Bina iske ye sab andaaze hain.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: permissions aur freshness</h2>
        <h3>Permissions (sabse bada risk)</h3>
        <p>Finance ka salary-band doc engineer ko nahi dikhna chahiye. Har chunk ke saath source system ka ACL (groups) store karo, aur retrieval query mein <code>WHERE acl_groups &amp;&amp; :user_groups</code> jaisa filter. Confidential chunk prompt tak <b>pahunche hi nahi</b>; "prompt mein mana kar do" kaafi nahi (model galti ya injection se bol sakta hai).</p>
        <h3>Freshness: nightly batch ab kam pad raha</h3>
        <p>IT ne outage ka workaround doc 11 baje update kiya; bot kal tak purana bata raha hai. Har raat <i>saare</i> 50k docs dobara embed karna bhi bekaar kharcha hai.</p>
        <table>
          <tr><th>Option</th><th>Kaise</th><th>Faisla</th></tr>
          <tr><td>Har ghante full re-index</td><td>Simple</td><td>❌ 24× embedding kharcha, zyaadatar docs badle hi nahi</td></tr>
          <tr><td><b>Incremental sync</b> ⭐</td><td>Source ke webhooks/change API (ya "modified since" polling) → sirf badle docs ka event <b>queue</b> mein → workers us doc ke purane chunks delete, naye insert</td><td>✅ Minutes mein fresh, kharcha sirf badlav ka</td></tr>
        </table>
        <p>Queue kyun? Ek bada import (10,000 docs ek saath) aaye to workers apni speed se karein aur embedding API ki rate limit na tootey; fail hua doc retry ho. Permissions badlein (koi team chhode) to bhi wahi event pipeline ACL update kare. Deleted doc ke chunks bhi hatao.</p>`
    },
    {
      type: "flow",
      title: "Stage 3: incremental ingestion + ACL-filtered retrieval + rerank",
      nodes: [
        { id: "src", label: "Sources\n(webhooks)", icon: "📚", x: 80, y: 70, kind: "data", w: 150 },
        { id: "q", label: "Queue:\ndoc changed", icon: "📨", x: 280, y: 70, kind: "queue", w: 150 },
        { id: "w", label: "Ingest workers\n(chunk, embed, ACL)", icon: "👷", x: 510, y: 70, kind: "service", w: 200 },
        { id: "pg", label: "Postgres: vector +\nfull-text + ACL", icon: "🗄️", x: 800, y: 70, kind: "data", w: 200 },
        { id: "u", label: "Employee", icon: "🙋", x: 80, y: 290, kind: "client", w: 130 },
        { id: "api", label: "Chat API\n(rewrite query)", icon: "🖥️", x: 280, y: 290, kind: "service", w: 170 },
        { id: "rr", label: "Reranker", icon: "🏅", x: 510, y: 290, kind: "service", w: 140 },
        { id: "llm", label: "LLM (stream)", icon: "🧠", x: 800, y: 390, kind: "external", w: 160 }
      ],
      edges: [
        { from: "src", to: "q" },
        { from: "q", to: "w" },
        { from: "w", to: "pg" },
        { from: "u", to: "api", both: true },
        { from: "api", to: "pg", both: true },
        { from: "api", to: "rr", both: true },
        { from: "api", to: "llm", both: true }
      ],
      steps: [
        { title: "Doc update → minutes mein index", html: "<p>Webhook → queue → worker sirf us doc ke chunks badalta hai (ACL ke saath).</p>", path: ["src", "q", "w", "pg"], active: ["w"] },
        { title: "Hybrid + ACL filter", html: "<p>Rewritten query se vector + keyword search, sirf user ke groups wale chunks, top-30.</p>", path: ["u", "api", "pg", "api"], active: ["pg"] },
        { title: "Rerank → top-5 → LLM", html: "<p>Reranker top-5 chunta hai; LLM unse jawab + citations stream karta hai.</p>", path: ["api", "rr", "api", "llm", "api", "u"], active: ["rr", "llm"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: kab kya badlega (abhi nahi)</h2>
        <table>
          <tr><th>Signal</th><th>Kya karenge</th><th>Kyun abhi nahi</th></tr>
          <tr><td>Bahut log same sawaal poochte hain (har mahine "holiday list")</td><td>Answer cache (exact/normalized sawaal + user ke permission group key mein), short TTL</td><td>Traffic kam; galat cached jawab ka risk</td></tr>
          <tr><td>LLM bill bada</td><td>Simple sawaalon ke liye chhota model (routing), prompt caching, chunks kam</td><td>Pehle eval se quality loss naapo</td></tr>
          <tr><td>Crores chunks / high QPS</td><td>Dedicated vector DB ya OpenSearch</td><td>3 GB pe pgvector kaafi</td></tr>
          <tr><td>Bot ko actions chahiye ("mera laptop ticket kholo")</td><td>Tool calling (agent), confirm ke saath</td><td>Read-only Q&amp;A se shuru: kam risk</td></tr>
          <tr><td>Data bahar nahi ja sakta (regulation)</td><td>Self-hosted model (inference lesson ka math)</td><td>Hosted API kam traffic pe sasta</td></tr>
        </table>
        <p><b>Observability:</b> har request ka trace: rewritten query, retrieved chunk ids, scores, model, tokens, latency, user feedback. "Galat jawab" ki complaint aaye to 2 minute mein dikhe ki retrieval galat tha ya generation.</p>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Docs pe jawab</td><td>Chunk + pgvector + LLM API + SSE</td><td>Vector DB / self-host: is scale pe bekaar</td></tr>
          <tr><td>2</td><td>Exact terms miss</td><td>Hybrid search</td><td>Sirf vector</td></tr>
          <tr><td>2</td><td>Galat order</td><td>Reranker</td><td>Zyada chunks prompt mein: mehenga, beech ki info miss</td></tr>
          <tr><td>2</td><td>Follow-ups</td><td>Query rewriting</td><td>-</td></tr>
          <tr><td>3</td><td>Confidential leak</td><td>ACL filter retrieval mein</td><td>Prompt instruction</td></tr>
          <tr><td>3</td><td>Purane jawab</td><td>Incremental sync via queue</td><td>Har ghante full re-index</td></tr>
          <tr><td>Har stage</td><td>"Behtar hua?"</td><td>Eval set + traces</td><td>Gut feeling</td></tr>
        </table>`
    },
    {
      type: "think",
      id: "think-rag-design-q",
      q: "Interviewer follow-up: \"Bot ne ek employee ko galat leave policy batayi aur usne uspe action le liya. Aap system mein kya badloge taaki aisa kam ho aur ho to pakda jaaye?\"",
      rubric: [
        { point: "Citations dikhana + quote, user source verify kar sake", keys: ["citation", "source", "quote", "link"], weight: 2 },
        { point: "Trace se debug: retrieval galat tha ya generation", keys: ["trace", "log", "retriev", "debug", "chunk"], weight: 2 },
        { point: "Failure ko eval set mein daalo, fix ke baad regression test", keys: ["eval", "golden", "test case", "regression"], weight: 2 },
        { point: "Version/date metadata, purane docs filter; low confidence pe 'HR se confirm karein'", keys: ["version", "latest", "date", "confidence", "pata nahi", "hr se"], weight: 2 }
      ],
      answer: `<ul><li><b>Debug:</b> us request ka trace kholo: kaunse chunks aaye? Agar purana policy doc aaya to retrieval/metadata ki galti; sahi doc tha par jawab galat to prompt/model ki.</li><li><b>Fix + regression:</b> ye sawaal eval set mein daalo; fix (latest-version filter, better chunking) ke baad pass hona chahiye.</li><li><b>User ko verify ka mauka:</b> har claim ke saath source link aur exact quote; HR/legal topics pe "final confirmation HR portal se" note.</li><li><b>Kam confidence:</b> retrieval scores kam hon ya sources mein contradiction ho to bot "pakka nahi" bole aur HR contact de.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Numbers se shuru karo (5 lakh chunks ≈ 3 GB, kuch QPS) aur bolo "ye scale nahi, quality aur permissions ki problem hai". Phir ingestion aur query path alag draw karo, aur ACL retrieval mein, evals har change pe: ye teen baatein strong signal hain.`
    }
  ],
  references: [
    { title: "pgvector (GitHub)", by: "pgvector", url: "https://github.com/pgvector/pgvector", type: "docs" },
    { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", by: "Lewis et al., 2020", url: "https://arxiv.org/abs/2005.11401", type: "article" },
    { title: "Hello Interview: system design problem breakdowns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview", type: "course" }
  ]
});
