// URL Shortener (evolution style: v0 → traffic badhao → kya toota → options → decision → next)
registerLesson("hld", "url-shortener", {
  why: `URL shortener se design ka process seekhte hain: sabse simple design se shuru karo, traffic badhao, dekho kya toot-ta hai, options compare karo, aur reason ke saath faisla lo. Final architecture yaad karne ki zaroorat nahi; har component kyun aaya, ye aapko khud dikhega.`,
  blocks: [
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> <b>Stage 0: requirements.</b> Interviewer bolta hai "bit.ly jaisa banao". Code se pehle 3-4 functional aur 3-4 non-functional requirements likho. Kya out of scope rakhoge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>FR: long URL → short code banana</li><li>FR: short code kholne pe original URL pe <b>redirect</b></li><li>Optional/out of scope: custom alias, expiry, analytics, login</li><li>NFR: redirect <b>fast</b> (low latency) aur <b>highly available</b></li><li>NFR: <b>read-heavy</b> (redirects &gt;&gt; creates), codes unique</li></ul></div>
          <div class="qa-a"><p><b>Functional:</b> (1) long URL do → short code milo, (2) short code kholo → original pe redirect, (3) optional: custom alias, expiry, click count. <b>Out of scope:</b> login/teams, QR codes, spam detection (bol do, baad mein).</p><p><b>Non-functional:</b> redirect bahut tez (p99 &lt; ~50ms server time) aur hamesha available (link toota = har jagah toota), codes unique aur chhote, aur system <b>read-heavy</b>: ek link ek baar banta hai, hazaar baar khulta hai.</p><p>Ab sabse simple design se shuru karte hain. Traffic chhota maan lo: 100 requests/second.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple design (100 RPS)</h2>
        <p>Ek app server, ek Postgres table. <b>Koi cache, queue ya CDN nahi</b>, kyunki abhi inki zaroorat nahi hai (YAGNI). Ek startup ka pehla version aisa hi hota hai, aur 100 RPS pe ye poori tarah theek hai.</p>
        <pre class="code-static">CREATE TABLE links (
  id         BIGSERIAL PRIMARY KEY,      -- 1, 2, 3 ... (DB khud deta hai)
  code       VARCHAR(10) UNIQUE NOT NULL,-- base62(id)
  long_url   TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
POST /links  {longUrl}  → INSERT, code = base62(id)   → {shortUrl}
GET  /{code}            → SELECT long_url WHERE code = ? → 302 Location: long_url</pre>
        <p><b>Code kaise banta hai:</b> DB ka auto-increment id (1, 2, 3...) base62 (0-9, a-z, A-Z) mein: 62⁷ ≈ 3.5 trillion, yaani 7 characters bahut saalon ke liye kaafi. Single DB mein auto-increment unique hai, isliye collision ka sawaal hi nahi.</p>`
    },
    {
      type: "flow",
      title: "Stage 1: ek server, ek DB",
      nodes: [
        {
          id: "u",
          label: "User",
          icon: "👤",
          x: 120,
          y: 110,
          kind: "client",
          w: 130
        },
        {
          id: "app",
          label: "App server",
          icon: "🖥️",
          x: 480,
          y: 110,
          kind: "service"
        },
        {
          id: "db",
          label: `Postgres
links table`,
          icon: "🗄️",
          x: 840,
          y: 110,
          kind: "data",
          w: 170
        }
      ],
      edges: [
        {
          from: "u",
          to: "app",
          both: true
        },
        {
          from: "app",
          to: "db",
          both: true
        }
      ],
      steps: [
        {
          title: "Create",
          html: "<p>INSERT hua, DB ne id 125 diya, base62(125) = <code>21</code> (2×62 + 1). Short URL wapas.</p>",
          path: ["u","app","db","app","u"],
          active: ["db"]
        },
        {
          title: "Redirect",
          html: `<p>Har redirect pe <code>SELECT ... WHERE code = ?</code> (unique index se tez) aur 302. 100 RPS pe DB ko koi takleef nahi.</p>`,
          path: ["u","app","db","app","u"],
          active: ["app"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: link viral hua, traffic 10,000 RPS</h2>
        <p>Ek cricket match ka link WhatsApp groups mein ghoom gaya. Ab 10k redirects/second (99% reads). Is simulator mein maan lo: ek app server ~3,000 RPS sambhalta hai, aur Postgres ~5,000 simple reads/sec. (Asli numbers hardware, query aur connection pool pe depend karte hain; yahan sirf ratio samajhna hai.)</p>
        <p>Pehle traffic badha ke dekho <b>kya</b> toot-ta hai. Abhi koi component mat lagao.</p>`
    },
    {
      type: "tip",
      html: "🧪 <b>Simulator mein khud dekho:</b> 10,000 RPS pe errors &lt; 1% aur latency &lt; 60ms kaise laaoge? RPS 10,000 karo aur ek ek control badal ke dekho kaunsa component kya badalta hai."
    },
    {
      type: "sim",
      id: "sim-us-stage2",
      title: "Stage 2: 10k RPS pe kya toota?",
      config: {
        rps: 100,
        maxRps: 15000,
        readRatio: 0.99,
        appCap: 3000,
        dbCap: 5000,
        cacheCap: 100000,
        appMs: 5,
        dbMs: 8,
        cacheMs: 1,
        controls: ["rps","lb","servers","cache","hitRatio","replicas"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> Pehle app server tootta hai (3k pe), to LB + ~4-5 servers. Uske baad DB (5k) tootta hai. Do raaste hain: read replicas (har replica ek poori DB machine, cost 3) ya cache (cost 2, aur hit pe DB tak jaana hi nahi). Cache ~60% hit pe bhi DB load ~4k reh jaata hai aur poora design ~10 cost mein ban jaata hai (90% hit pe aur aaram se). Replicas se yahi load uthane mein 3 DB machines (primary + 2 replicas) lagti hain (total cost ~14, budget se bahar). Aur traffic 10× badhega to replicas linearly badhenge, jabki cache hit ratio aur achha hota jaata hai. Isliye yahan <b>cache sasta aur better</b> hai.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Stage 2 mein DB bottleneck hai (99% reads). Kaunse options <b>is waqt</b> sahi hain? Har option ka reason padho.</b></div>
          <ul class="qa-options"><li>✅ LB + zyada app servers (stateless)<div class="small muted">App server pehle toota tha. Servers stateless hain (sab kuch DB mein), isliye jodna aasaan.</div></li><li>✅ Redis cache: code → long_url<div class="small muted">Data chhota hai (~500 bytes), links kabhi kabhi hi badalte hain, aur kuch hot links zyaadatar traffic laate hain. Isliye high hit ratio milega aur DB tak kam requests jaayengi.</div></li><li>❌ Read replicas<div class="small muted">Kaam karta hai, par har replica ek poori DB machine hai, aur 99% read + bahut repeat traffic ke liye cache kahin sasta hai. Replicas tab lagao jab cache miss traffic bhi DB ke liye zyada ho, ya HA ke liye ek standby chahiye.</div></li><li>❌ DB sharding<div class="small muted">Abhi data chhota hai aur writes ~100/s hain. Sharding complexity bahut laata hai (routing, resharding). Iski abhi zaroorat nahi.</div></li><li>❌ Kafka queue<div class="small muted">Queue writes/async kaam ke liye hai. Redirect user ko turant chahiye, wo queue mein nahi ja sakta.</div></li><li>❌ Bigger DB machine (vertical scaling)<div class="small muted">Thodi der chalega aur valid short-term fix hai, par read traffic aur badhega. Cache wahi kaam kam kharche mein aur aage tak karta hai.</div></li></ul>
          <div class="qa-a"><p><b>Decision:</b> LB + stateless app servers + Redis cache (cache-aside, TTL ~1 din). Ek replica sirf HA standby ke liye rakh sakte ho, read scaling ke liye nahi.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <h3>Cache ka design: decision aur alternatives</h3>
        <table>
          <tr><th>Sawaal</th><th>Choice</th><th>Alternative</th><th>Kyun ye</th></tr>
          <tr><td>Pattern</td><td>Cache-aside (miss pe DB, phir cache set)</td><td>Write-through (create pe cache mein bhi likho)</td><td>Zyaadatar links kabhi khulte hi nahi; sirf jo padhe jaayein wahi cache mein. Memory bachti hai.</td></tr>
          <tr><td>TTL</td><td>~24 ghante + random jitter</td><td>Bina TTL</td><td>Purane/kam use hone wale links apne aap nikal jaate hain. Jitter se ek saath expiry (stampede) nahi hoti.</td></tr>
          <tr><td>Eviction</td><td>LRU (<code>allkeys-lru</code>)</td><td>LFU</td><td>Viral link ka traffic kuch ghante rehta hai. LRU recency pakadta hai; LFU bhi theek hai, par purane popular links ko zyada der rakhta hai.</td></tr>
          <tr><td>Galat code (bot scanning)</td><td>"not found" bhi 5 min ke liye cache</td><td>Har baar DB</td><td>Cache penetration se bachav.</td></tr>
        </table>`
    },
    {
      type: "flow",
      title: "Stage 2: LB + stateless servers + Redis",
      nodes: [
        {
          id: "u",
          label: "Users",
          icon: "👥",
          x: 90,
          y: 160,
          kind: "client",
          w: 120
        },
        {
          id: "lb",
          label: "Load Balancer",
          icon: "⚖️",
          x: 300,
          y: 160,
          kind: "service"
        },
        {
          id: "a1",
          label: "App 1",
          icon: "🖥️",
          x: 520,
          y: 60,
          kind: "service",
          w: 120
        },
        {
          id: "a2",
          label: "App 2",
          icon: "🖥️",
          x: 520,
          y: 260,
          kind: "service",
          w: 120
        },
        {
          id: "redis",
          label: "Redis",
          icon: "⚡",
          x: 760,
          y: 60,
          kind: "cache",
          w: 130
        },
        {
          id: "db",
          label: "Postgres",
          icon: "🗄️",
          x: 760,
          y: 260,
          kind: "data",
          w: 140
        }
      ],
      edges: [
        {
          from: "u",
          to: "lb", both: true
        },
        {
          from: "lb",
          to: "a1", both: true
        },
        {
          from: "lb",
          to: "a2", both: true
        },
        {
          from: "a1",
          to: "redis",
          both: true
        },
        {
          from: "a2",
          to: "redis",
          both: true
        },
        {
          from: "a1",
          to: "db",
          both: true,
          dashed: true
        },
        {
          from: "a2",
          to: "db",
          both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Viral link: cache hit",
          html: "<p>Zyaadatar redirects Redis se (~1ms). DB tak jaata hi nahi.</p>",
          path: ["u","lb","a1","redis","a1","lb","u"],
          active: ["redis"],
          dim: ["db"]
        },
        {
          title: "Rare link: miss → DB → cache",
          html: "<p>Pehli baar khula link DB se aata hai aur cache mein chala jaata hai.</p>",
          path: ["u","lb","a2","redis","a2","db","a2","redis"],
          active: ["db"]
        },
        {
          title: "Ek app server gira",
          html: "<p>Servers stateless hain, isliye LB baaki server pe bhejta hai. Koi data nahi khoya.</p>",
          path: ["u","lb","a2","redis"],
          fail: ["a1"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: 10 crore links/month, analytics chahiye, aur security team ki complaint</h2>
        <p>Product bada ho gaya. Teen nayi problems aati hain. Har ek ke liye pehle socho, phir options dekho. Yaad rakho: naya component tabhi, jab purana tareeka sach mein toote.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> <b>Problem A: ID generation.</b> Security team: "Codes sequential hain (<code>abc1</code>, <code>abc2</code>...). Koi bhi script se saare links scan kar sakta hai, private links bhi, aur competitor ginti kar sakta hai ki hum din mein kitne links banate hain." Aur aage kabhi DB todna pada to har hisse ka apna auto-increment = duplicate codes. Kaun kaun se tareeke hain unique code banane ke? Har ek ki kami bhi likho.</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li><b>Hash</b> of URL (MD5/SHA, pehle 7 chars): collisions, check + retry</li><li><b>Random</b> 7 chars: collision check, par unguessable</li><li><b>Central counter</b> (single DB / Redis INCR): single point / bottleneck</li><li>Sequence rakh ke <b>scramble/encrypt</b> karna, ya <b>range allocation</b> / <b>Snowflake</b> (kai DBs ke liye)</li><li>Sequential ids <b>guessable</b> hote hain</li></ul></div>
          <div class="qa-a"><p>Neeche table mein har option ki comparison hai.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th><th>Kab chuno</th></tr>
          <tr><td>DB auto-increment (single DB)</td><td>Simple, collision kabhi nahi</td><td>Sharding ke baad har shard ka alag counter; sequential = guessable</td><td>Ek DB tak (Stage 1-2)</td></tr>
          <tr><td>Hash(URL) ke 7 chars</td><td>Same URL = same code (dedupe free)</td><td>Collisions badhte hain jaise data badhta hai: har insert pe check + retry with salt</td><td>Dedupe sach mein zaroori ho</td></tr>
          <tr><td>Random 7 chars</td><td>Guess nahi ho sakta, koi coordination nahi</td><td>Rare collision: unique constraint pe insert fail → retry</td><td>Private links, simple</td></tr>
          <tr><td>Central counter (Redis INCR)</td><td>Simple, unique</td><td>Har create ek network call; Redis down = creates band</td><td>Medium scale</td></tr>
          <tr><td><b>Range allocation</b> ⭐</td><td>Har server ek block (jaise 10 lakh ids) leta hai, phir bina network call ke ids banata hai</td><td>Server crash pe bacha block waste (theek hai, 3.5 trillion space hai)</td><td>High scale, kai servers</td></tr>
          <tr><td>Snowflake-style 64-bit id</td><td>Time-sortable, koi central call nahi</td><td>64-bit number base62 mein ~11 chars (lamba short URL)</td><td>Jab ids lambe ho sakte hon</td></tr>
        </table>
        <p><b>Abhi ki situation:</b> creates ~40/s hain aur DB abhi bhi ek hi Postgres hai (Problem C mein numbers dekhenge). Matlab auto-increment <b>uniqueness</b> ke liye abhi bhi kaafi hai. Asli problem sirf <b>guessability</b> hai.</p>
        <p><b>Decision (abhi):</b> DB sequence hi rakho, par number ko base62 karne se pehle ek <b>reversible scramble</b> se guzaaro (jaise ek bade number se multiply karke 62⁷ ka modulo; wo number 2 aur 31 se divide nahi hona chahiye, taaki har input ka output alag rahe). Unique wahi rehta hai (har number ka alag result), par lagatar numbers ke codes random dikhte hain. Koi naya component nahi laga. Id banana ek chhote <code>IdGenerator</code> interface ke peeche rakho, taaki kal tareeka badalna aasaan ho.</p>
        <p><b>Range allocation kab?</b> Jab ek DB na rahe (Stage 4 sharding) ya kai regions mein creates hon. Tab har server ko ids ka ek block milega. Block dene wala koi aisa store chahiye jahan "agla block do" <i>atomic</i> ho:</p>
        <table>
          <tr><th>Block kahan se</th><th>Kaise</th><th>Kab chuno</th></tr>
          <tr><td>Postgres ki ek row</td><td><code>UPDATE id_ranges SET next = next + 1000000 RETURNING next</code>: row lock se atomic</td><td>Ek Postgres pehle se ho: koi naya component nahi. Block din mein kuch hi baar maanga jaata hai.</td></tr>
          <tr><td>Redis <code>INCRBY</code></td><td>Atomic increment</td><td>Redis ka data persist (AOF) karna padega, warna restart pe counter peeche jaa sakta hai = duplicate codes</td></tr>
          <tr><td>etcd / ZooKeeper</td><td>Strongly consistent coordination store (cluster jo nodes ke beech agree karta hai)</td><td>Jab ye system mein pehle se ho (leader election, config). Sirf id ke liye naya cluster = over-engineering.</td></tr>
        </table>
        <p>Agar interviewer bole "links private hain aur kabhi guess nahi hone chahiye", to random 7-8 chars + unique constraint (collision pe retry) bhi bilkul sahi jawab hai.</p>
        <div class="tip-box">🏭 <b>Production mein:</b> Twitter ne 2010 mein <b>Snowflake</b> banaya: 41-bit millisecond timestamp + 10-bit machine id + 12-bit sequence, taaki har server bina coordination ke unique, time-sortable ids de. Instagram ne sharded Postgres ke andar hi (PL/pgSQL function se) aisa hi id banaya: 41-bit time + 13-bit logical shard + 10-bit sequence. Dono ka idea same hai: <b>uniqueness ko central call ke bina guarantee karo</b>.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> <b>Problem B: click analytics.</b> Marketing team ko har link ke clicks chahiye (kis din, kis desh se). Seedha har redirect pe <code>UPDATE links SET clicks = clicks + 1</code> karne mein kya dikkat hai? Better tareeka kya hoga? (301 vs 302 ka bhi socho.)</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Har redirect pe DB write: <b>redirect slow</b> + viral link ki <b>hot row</b></li><li>Click event <b>async</b> (queue/Kafka) mein, redirect turant</li><li>Consumers <b>batch/aggregate</b> karke analytics store mein</li><li><b>302</b> (temporary) taaki har click server tak aaye; 301 browser cache kar leta hai</li></ul></div>
          <div class="qa-a"><p>Synchronous UPDATE se do problems hain: redirect ka latency badhta hai (har redirect pe ek DB write), aur viral link ki ek hi row pe hazaaron updates/sec aate hain (row lock contention). Isliye redirect ko analytics se <b>alag</b> karo: redirect sirf ek "click hua" event kahin daal de aur turant 302 de; koi aur process baad mein gine.</p><p><b>301 vs 302:</b> 301 permanent hai, browser use cache kar leta hai, isliye agli baar request aati hi nahi: server load kam, par clicks gine nahi jaate. Analytics chahiye to 302.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <h3>Click events kahan daalein? Options</h3>
        <p>Peak ~20k redirects/sec = 20k click events/sec. Ye events kho jaayein to analytics galat; aur ye redirect ko slow na karein.</p>
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>Redis <code>INCR clicks:{code}</code></td><td>Bahut simple, tez</td><td>Sirf total count. "Kis din, kis desh se" ke liye har dimension ki alag key; raw events nahi bachte, baad mein naya report nahi bana sakte.</td></tr>
          <tr><td>App memory mein buffer, har 10s DB mein batch insert</td><td>Koi naya component nahi</td><td>Server crash = buffer ke events gaye. Deploy pe bhi.</td></tr>
          <tr><td><b>Kafka</b> ⭐ (ek durable log / queue)</td><td>Events disk pe replicate hote hain (kho nahi jaate), consumer down ho to bhi jama rehte hain, aur ek hi stream ko kai consumers (analytics, fraud detection) padh sakte hain</td><td>Ek naya system chalana padta hai (managed service se aasaan)</td></tr>
          <tr><td>Managed queue (SQS, Pub/Sub)</td><td>Chalana nahi padta</td><td>Replay / kai consumers ke liye Kafka jitna natural nahi</td></tr>
        </table>
        <p><b>Decision:</b> Kafka (ya cloud ka managed Kafka / Kinesis). Ek consumer per-minute counts aggregate karke analytics DB (jaise ClickHouse, jo bade aggregations ke liye bana hai) mein likhta hai. Agar sirf total click count chahiye hota, to Redis INCR hi kaafi tha: <i>requirement ne component chuna</i>.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> <b>Problem C: storage.</b> 10 crore links/month × 5 saal ≈ 6 billion rows, har row ~500 bytes. Creates ~40/sec, redirects zyaadatar Redis se. <b>Kya ek Postgres kaafi hai?</b> Numbers se socho: kaunsi cheez pehle tootegi (storage, writes, reads, ya operations jaise backup)?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Storage ≈ 6B × 500B ≈ <b>3 TB</b>: ek modern DB machine pe possible</li><li>Writes ~<b>40/s</b> (peak ~200/s): ek Postgres ke liye bahut kam</li><li>Reads cache se; DB pe sirf misses jaate hain</li><li>Asli risk <b>operations</b>: backup/restore lamba, index RAM mein fit nahi, ek machine = single point → replica</li></ul></div>
          <div class="qa-a"><p>Ek ek karke dekho:</p><ul><li><b>Storage:</b> ~3 TB (indexes ke saath zyada). Aaj ki ek bade disk wali DB machine pe ye ho sakta hai.</li><li><b>Writes:</b> ~40/s average, peak ~200/s. Postgres hazaaron writes/sec sambhal leta hai, to ye koi problem nahi.</li><li><b>Reads:</b> zyaadatar Redis se. DB pe sirf cache misses aate hain.</li><li><b>Operations</b> pehle dard denge: multi-TB ka backup/restore ghanton leta hai, index RAM se bada ho to cache-miss lookups disk pe jaate hain (thode slow), aur ek hi machine gire to creates band.</li></ul><p><b>Nateeja:</b> is scale pe <b>sharding ki zaroorat nahi</b>. Ek Postgres primary + ek replica (failover aur backups ke liye) kaafi hai. Sharding tab lagaate hain jab koi asli limit aaye: Stage 4 dekho.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Is scale pe (3 TB, ~40 writes/s) storage ke liye kaunsa faisla <b>sahi</b> hai?</b></div>
          <ul class="qa-options"><li>✅ Postgres primary + 1 replica (failover + backups), sharding abhi nahi<div class="small muted">Numbers kehte hain ek machine kaafi hai. Replica availability ke liye hai: primary gira to replica promote.</div></li><li>❌ Abhi se 16 shards<div class="small muted">Koi limit nahi tooti. Sharding se routing, cross-shard queries aur resharding ki complexity aati hai, bina kisi fayde ke.</div></li><li>❌ Ek Postgres, bina replica<div class="small muted">Storage aur load ke hisaab se chalega, par machine gire to creates band, aur restore mein ghante lagenge. Availability requirement todta hai.</div></li><li>❌ Elasticsearch as primary store<div class="small muted">Search ke liye bana hai, durable primary store ke liye nahi. Exact key lookup ke liye overkill.</div></li><li>✅ Plan likh ke rakhna: kis metric pe shard karenge<div class="small muted">Senior answer: 'abhi nahi, par jab X hoga tab Y karenge.'</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <h3>Redirect aur Create ko alag services kyun?</h3>
        <p>Abhi tak ek hi app tha. Stage 3 pe isse do mein todne ke teen reason hain:</p>
        <ul>
          <li><b>Load bahut alag:</b> redirects ~20k/s, creates ~200/s. Ek saath rakhne pe dono ko same number of servers milte hain. Alag hon to redirect ko 10 servers, create ko 2.</li>
          <li><b>Criticality alag:</b> redirect toota = duniya bhar ke links toote. Create mein naya feature (custom alias, spam check) aaye aur bug ho, to redirect pe asar nahi padna chahiye.</li>
          <li><b>Dependencies alag:</b> redirect ko sirf Redis + DB read chahiye. Create ko id ranges, validation, spam check.</li>
        </ul>
        <p><b>Alternative:</b> ek hi codebase/app, bas do alag deployments (same code, alag routes pe alag server groups). Chhoti team ke liye ye bhi bilkul theek hai. Do microservices tab, jab teams ya release cycles alag hon.</p>`
    },
    {
      type: "flow",
      title: "Stage 3: final design (har component kisi problem ka jawab hai)",
      nodes: [
        {
          id: "u",
          label: "Users",
          icon: "👥",
          x: 80,
          y: 170,
          kind: "client",
          w: 110
        },
        {
          id: "lb",
          label: "LB",
          icon: "⚖️",
          x: 250,
          y: 170,
          kind: "service",
          w: 110
        },
        {
          id: "redir",
          label: "Redirect svc",
          icon: "↪️",
          x: 440,
          y: 80,
          kind: "service",
          w: 150
        },
        {
          id: "create",
          label: "Create svc",
          icon: "✂️",
          x: 440,
          y: 270,
          kind: "service",
          w: 150
        },
        {
          id: "redis",
          label: `Redis
primary + replica`,
          icon: "⚡",
          x: 700,
          y: 40,
          kind: "cache",
          w: 180
        },
        {
          id: "kafka",
          label: "Kafka: clicks",
          icon: "📨",
          x: 700,
          y: 170,
          kind: "queue",
          w: 160
        },
        {
          id: "db",
          label: `Postgres
primary + replica`,
          icon: "🗄️",
          x: 700,
          y: 300,
          kind: "data",
          w: 180
        },
        {
          id: "an",
          label: `Analytics
(ClickHouse)`,
          icon: "📊",
          x: 910,
          y: 170,
          kind: "data",
          w: 150
        }
      ],
      edges: [
        {
          from: "u",
          to: "lb", both: true
        },
        {
          from: "lb",
          to: "redir", both: true
        },
        {
          from: "lb",
          to: "create", both: true
        },
        {
          from: "redir",
          to: "redis",
          both: true
        },
        {
          from: "redir",
          to: "db", both: true,
          dashed: true
        },
        {
          from: "redir",
          to: "kafka",
          dashed: true
        },
        {
          from: "create",
          to: "db",
          both: true
        },
        {
          from: "kafka",
          to: "an"
        }
      ],
      steps: [
        {
          title: "Create: sequence → scramble → base62",
          html: `<p>Postgres sequence se agla number, scramble karke base62 code (guess nahi hota), aur row INSERT. Koi alag ID service nahi, kyunki abhi zaroorat nahi.</p>`,
          path: ["u","lb","create","db","create","lb","u"],
          active: ["create","db"]
        },
        {
          title: "Redirect: Redis hit + click event",
          html: "<p>Redis se long URL, 302, aur click event Kafka pe. Event bhejna redirect ko rokta nahi.</p>",
          paths: [
            ["u","lb","redir","redis","redir","lb","u"],
            ["redir","kafka"]
          ],
          active: ["redis","kafka"]
        },
        {
          title: "Cache miss → Postgres",
          html: "<p>Rare link Redis mein nahi: Postgres (primary ya replica) se padho aur cache bharo.</p>",
          path: ["redir","redis","redir","db","redir"],
          active: ["db"]
        },
        {
          title: "Analytics apni speed se",
          html: `<p>Consumer Kafka se events padh ke per-minute counts ClickHouse mein likhta hai. Ye slow ho jaaye to bhi redirects pe asar nahi.</p>`,
          path: ["kafka","an"],
          active: ["an"]
        },
        {
          title: "Postgres primary gira",
          html: `<p>Replica promote hota hai (managed DB mein automatic failover). Redirects is dauraan bhi zyaadatar Redis se chalte rehte hain.</p>`,
          path: ["redir","redis","redir","lb","u"],
          fail: ["db"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <h3>Redis ke baare mein ek check</h3>
        <p>Peak ~20k redirects/sec. Ek Redis node simple GETs mein lagbhag ~1 lakh ops/sec tak de deta hai (exact number hardware aur benchmark pe depend karta hai). Hot links ka data bhi kuch GB ka hai. Isliye <b>ek Redis primary + replica</b> (failover ke liye) kaafi hai. Redis <b>cluster</b> (data ko kai Redis nodes mein baantna) tab chahiye jab traffic ya memory ek node se zyada ho: Stage 4.</p>

        <h2>Stage 4: aur bada scale. Kab kya badlega?</h2>
        <p>Ye components <b>abhi nahi</b> lage, kyunki unki zaroorat nahi. Interview mein ye bolna ki "kis signal pe kya karunga" senior answer hai.</p>
        <table>
          <tr><th>Signal (kya dikhe)</th><th>Kya karenge</th><th>Ye kya hai (simple)</th><th>Alternative</th></tr>
          <tr><td>DB storage 10+ TB, ya backup/restore ghanton ka, ya writes ek primary se zyada</td><td><b>Sharding / partitioning</b></td><td>Data ko kai DB machines mein baantna: <code>hash(code) % N</code> ya consistent hashing se har code ka ek "ghar" machine. Har machine ke paas sirf ek hissa.</td><td>Badi machine (vertical) jab tak sambhav ho; ya purane links ko sasti storage pe archive</td></tr>
          <tr><td>Sharding khud chalana bhaari lage</td><td><b>Managed key-value store</b> (DynamoDB / Cassandra)</td><td>Database jo shuru se key ke hisaab se data baant-ta hai. Sirf <code>key → value</code> lookup ke liye bana hai, jo yahan ka exact access pattern hai.</td><td>Postgres + Citus / Vitess (SQL hi rahe, sharding tool sambhale)</td></tr>
          <tr><td>Ek DB na rahe (shards) ya kai regions mein creates</td><td><b>Range allocation</b> (ya Snowflake-style ids)</td><td>Har server ko ids ka block milta hai, phir bina network call ke ids</td><td>Random codes + unique constraint (retry)</td></tr>
          <tr><td>Redis memory ya ops/sec ek node se zyada</td><td><b>Redis Cluster</b></td><td>Keys 16,384 hash slots mein bant-ti hain, aur slots kai nodes pe</td><td>App ke andar ek chhota local cache (top viral links), Redis tak kam requests</td></tr>
          <tr><td>Users duniya bhar mein, latency door se zyada</td><td>Multi-region / CDN pe redirect</td><td>Paas ke region / edge se redirect</td><td>Ek region + CDN sirf static ke liye</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>Recap: kaunsa component kis problem se aaya</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Basic feature</td><td>1 server + Postgres</td><td>Cache/queue: abhi zaroorat nahi</td></tr>
          <tr><td>2</td><td>App server CPU full</td><td>LB + stateless servers</td><td>Bigger machine: limit aur single point of failure</td></tr>
          <tr><td>2</td><td>DB reads full (99% reads, hot links)</td><td>Redis cache-aside</td><td>Read replicas: same kaam mein zyada mehenge</td></tr>
          <tr><td>3</td><td>Codes guessable</td><td>DB sequence + reversible scramble</td><td>Hash: collisions; range allocation / etcd: abhi ek hi DB hai, zaroorat nahi</td></tr>
          <tr><td>3</td><td>Analytics bina redirect slow kiye</td><td>Kafka + aggregation, 302</td><td>Sync UPDATE: hot row + latency; memory buffer: crash pe data loss</td></tr>
          <tr><td>3</td><td>Availability</td><td>Postgres + Redis replicas</td><td>Sharding: koi limit nahi tooti</td></tr>
          <tr><td>3</td><td>Alag load aur criticality</td><td>Redirect aur Create alag deploy</td><td>Ek app sab ke liye: ek ka bug doosre ko girata</td></tr>
          <tr><td>4 (jab zaroorat)</td><td>10+ TB / writes zyada</td><td>Sharding ya KV store</td><td>Vertical scaling jab tak chale</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Final diagram seedha mat banao. Bolo: <i>"Main simple version se shuru karta hoon, phir dekhte hain 10k RPS pe kya tootega."</i> Har component ke saath teen cheezein bolo: kaunsi problem, kaunsa alternative socha, aur ye kyun behtar hai. Interviewer exactly yahi sunna chahta hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> January 2021: Parler (social network) band hone se pehle researchers ne uske public posts aur videos ka bada hissa download kar liya. Reports ke mutabik posts ke URLs/IDs sequential the aur bulk requests pe khaas rok-tok nahi thi. URL shortener design se iska kya rishta hai?`,
      options: [
        `Kuch nahi`,
        `Sequential, guessable IDs + rate limit na hona = koi bhi script se saare items gin ke nikaal sakta hai; private/unlisted content ke liye unguessable IDs (random ya scrambled), rate limits, aur auth checks chahiye`,
        `IDs hamesha lambe hone chahiye`,
        `Database encrypt karna kaafi hai`
      ],
      answer: 1,
      why: `Sequential IDs (1, 2, 3...) pe script bas number badha ke sab kuch dekh sakti hai (enumeration). Isliye lesson mein codes ko scramble kiya ya random rakha. Par yaad rakho: unguessable ID security ka ek hissa hai, poora nahi; jo cheez private hai uspe permission check aur rate limiting bhi chahiye.`
    }
  ],
  references: [
    {
      title: "Hello Interview: Design a URL shortener (Bit.ly)",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly",
      type: "course"
    },
    {
      title: "Snowflake ID (Twitter, 2010)",
      by: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Snowflake_ID",
      type: "article"
    },
    {
      title: "Redis benchmark (ops/sec apni machine pe khud naapo)",
      by: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/",
      type: "docs"
    },
    {
      title: "Sharding & IDs at Instagram (Instagram Engineering blog, 2012)",
      by: "Instagram Engineering",
      type: "article"
    },
    {
      title: "System Design Interview Vol. 1, Ch. 8: Design a URL shortener",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "book"
    }
  ]
});
