// Uber (ride matching) — evolution style
registerLesson("hld", "uber", {
  why: `Uber design mein naya sawaal hai <b>"mere paas kaun hai?"</b>: lakhs drivers jinki location har kuch second badalti hai, unmein se rider ke sabse paas wale tezi se dhoondhna. Saath mein ek driver ko do riders na milein. Hum ek Postgres table se shuru karenge aur dekhenge kahan toot-ta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> rider ko aas-paas ki gaadiyaan dikhein, ride request kare, paas ka khaali driver mile (driver accept/decline kare), trip ke dauraan rider driver ko live dekhe.</li>
          <li><b>Non-functional:</b> match kuch seconds mein; ek driver ek waqt pe ek hi trip; trip aur payment ka data kabhi na khoye.</li>
        </ul>
        <pre class="code-static">Online drivers (peak): 10 lakh
Har driver har ~4 s location bhejta hai → 10 lakh / 4 = 2.5 lakh location updates/s
Ride requests: kuch hazaar/s (updates se bahut kam)</pre>
        <p>Ek baat note karo: location ka sirf <b>latest</b> value kaam ka hai. 4 second purani location kho gayi to koi nuksaan nahi, agli aa rahi hai. Trip/payment data ka ulta hai: wo kabhi nahi khona chahiye. <b>Do tarah ka data, do tarah ke store</b>: ye design ka sabse important insight hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple: Postgres table</h2>
        <pre class="code-static">drivers (id, lat, lng, status, updated_at)
-- har 4 s:   UPDATE drivers SET lat=?, lng=?, updated_at=now() WHERE id=?
-- nearby:    SELECT ... WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
--            AND status='available' ORDER BY distance LIMIT 10</pre>
        <p>Ek shehar, 500 drivers: bilkul chalega.</p>
        <h3>Kya toota (10 lakh drivers pe)?</h3>
        <ul>
          <li><b>2.5 lakh UPDATE/s</b> ek durable DB pe: har update WAL (disk log) mein likha jaata hai aur lat/lng ke indexes bhi update hote hain. Aur ye saari mehnat us data ke liye jo 4 s baad bekaar hai.</li>
          <li><b>2D search B-tree se:</b> index <code>lat</code> pe ho to "lat 19.0-19.1" duniya bhar ki ek patli patti deta hai (Mumbai ke saath Africa ke kuch hisse bhi). Phir lng se filter. Do alag 1D indexes 2D "paas" ka sawaal achhe se nahi sambhalte.</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: geo index + in-memory location store</h2>
        <h3>"Paas" ko tez kaise dhoondhein: duniya ko cells mein kaato</h3>
        <p>Idea: map ko chhote cells mein baanto, har cell ka ek id. Driver ki location → uska cell id. "Mere paas" = mera cell + aas-paas ke cells ke drivers. 2D sawaal ek simple lookup ban gaya.</p>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td><b>Geohash</b></td><td>Lat/lng ko ek string mein (jaise <code>te7u</code>); common prefix = paas paas. Har extra character cell ko chhota karta hai.</td><td>Simple, string/sorted set mein store; Redis GEO andar se isi jaisa encoding use karta hai</td><td>Cell ki boundary pe do paas ke points ka prefix alag ho sakta hai, isliye 8 padosi cells bhi dekhne padte hain</td></tr>
          <tr><td>Quadtree</td><td>Area mein zyada drivers ho to use 4 mein todo, phir aur</td><td>Density ke hisaab se: shehar mein chhote cells, gaon mein bade</td><td>Drivers hilte rehte hain to tree update/rebalance; usually ek server ki memory mein</td></tr>
          <tr><td><b>H3</b> (hexagons)</td><td>Duniya ko hexagon cells mein (kai resolutions)</td><td>Har padosi ka center barabar door (square grid mein kone wale padosi door hote hain); "k rings" se radius</td><td>Ek library dependency; exact circle nahi, approximate</td></tr>
          <tr><td>PostGIS (R-tree / GiST)</td><td>DB ka geo index</td><td>Polygons, complex queries ke liye best</td><td>2.5 lakh updates/s pe phir wahi durable-DB ka bojh</td></tr>
        </table>
        <h3>Store: kahan rakhein?</h3>
        <p>Location data chhota hai, bahut tez badalta hai, aur khone pe nuksaan nahi. Ye <b>in-memory</b> store ka exact case hai. <b>Decision:</b> Redis (shehar ke hisaab se alag key / cluster) mein <code>GEOADD</code> se driver ki location, aur <code>GEOSEARCH</code> se "is point ke 2 km mein". Saath mein <code>driver:{id}:status</code> (available / on_trip). Alternative: matching service apni memory mein hi cell → drivers ka map rakhe (sabse tez, par phir us service ko sharding aur failover khud sambhalna hai: Stage 3).</p>
        <p><b>Driver app se updates kaise:</b> har 4 s ek chhota HTTP call, ya ek khula connection (WebSocket/ halka custom protocol), jisse server driver ko ride offer bhi bhej sake. Offer bhejna zaroori hai, to persistent connection behtar.</p>
        <p><b>History chahiye</b> (trip ka raasta, fraud, ETA models)? Location events Kafka pe bhi daalo; wahan se analytics store mein. Matching ke raaste mein history nahi.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: location updates in-memory, durable sirf trips",
      nodes: [
        { id: "d", label: "Driver app", icon: "🚗", x: 90, y: 90, kind: "client", w: 140 },
        { id: "loc", label: "Location svc", icon: "📍", x: 320, y: 90, kind: "service", w: 160 },
        { id: "geo", label: "Redis GEO\n(per city)", icon: "⚡", x: 600, y: 90, kind: "cache", w: 170 },
        { id: "k", label: "Kafka: locations", icon: "📨", x: 600, y: 260, kind: "queue", w: 180 },
        { id: "an", label: "History /\nanalytics", icon: "📊", x: 880, y: 260, kind: "data", w: 150 },
        { id: "r", label: "Rider app", icon: "🙋", x: 90, y: 260, kind: "client", w: 140 },
        { id: "near", label: "Nearby svc", icon: "🔎", x: 320, y: 260, kind: "service", w: 160 }
      ],
      edges: [
        { from: "d", to: "loc" },
        { from: "loc", to: "geo" },
        { from: "loc", to: "k", dashed: true },
        { from: "k", to: "an" },
        { from: "r", to: "near", both: true },
        { from: "near", to: "geo", both: true }
      ],
      steps: [
        { title: "Har 4 s location", html: "<p>GEOADD se purani location overwrite. Disk pe kuch nahi. Kafka pe event history ke liye (async).</p>", paths: [["d", "loc", "geo"], ["loc", "k", "an"]], active: ["geo"] },
        { title: "Rider: aas-paas ki gaadiyaan", html: "<p>GEOSEARCH 2 km: memory se milliseconds mein.</p>", path: ["r", "near", "geo", "near", "r"], active: ["geo"] },
        { title: "Redis node gira", html: "<p>Replica promote; ya khaali bhi ho gaya to 4 second mein drivers ki nayi locations se apne aap bhar jaata hai. Isliye yahan durability ki zaroorat nahi thi.</p>", path: ["d", "loc", "geo"], fail: ["geo"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: matching aur "ek driver, do riders"</h2>
        <ol>
          <li>Rider request → <b>matching service</b> paas ke available drivers laata hai (GEOSEARCH / H3 k-rings).</li>
          <li>Seedhi-line distance kaafi nahi (nadi ke us paar ka driver "paas" dikhta hai). Top candidates ka <b>ETA</b> (sadak ke raaste se time) ek routing/ETA service se, aur sabse kam ETA wala chuno.</li>
          <li>Us driver ko offer, ~10-15 s ka timeout. Decline/timeout → agla candidate.</li>
        </ol>
        <h3>Race condition</h3>
        <p>Do riders ki requests do alag matching servers pe, dono ko same driver "sabse paas" dikha. Dono ne offer bhej diya. <b>Fix:</b> offer bhejne se pehle driver ko <b>atomically</b> reserve karo: Redis <code>SET driver:42:lock rideA NX EX 15</code> (sirf tab set jab koi aur lock na ho, 15 s mein khud expire). Jo pehle set kare wahi offer bheje; doosra agla driver dekhe. Alternative: durable DB mein conditional update (<code>UPDATE ... SET status='offered' WHERE id=42 AND status='available'</code>). Dono valid; lock TTL ke saath crash pe bhi khud khul jaata hai.</p>
        <h3>Trip data</h3>
        <p>Driver ne accept kiya: <b>trip row Postgres mein</b> (rider, driver, fare, status: requested → accepted → started → completed → paid). Ye durable aur transactional hona chahiye (paisa juda hai). Trip ke dauraan driver ki location rider ko uske khule connection pe push.</p>
        <h3>Scale: shehar ke hisaab se baanto</h3>
        <p>Matching hamesha <b>local</b> hai: Mumbai ke rider ko Delhi ke driver se kaam nahi. Isliye data aur matching servers ko <b>geography se shard</b> karo (shehar / cells ke group). Mumbai jaisa bada shehar ek shard ke liye bhaari ho to cells ke hisaab se aur todo. Cells ko servers pe baantne ke liye consistent hashing, taaki server add/remove pe kam cells hilein.</p>`
    },
    {
      type: "flow",
      title: "Stage 3: request → candidates → ETA → lock → offer → trip",
      nodes: [
        { id: "r", label: "Rider app", icon: "🙋", x: 80, y: 170, kind: "client", w: 130 },
        { id: "m", label: "Matching svc\n(Mumbai shard)", icon: "🧮", x: 300, y: 170, kind: "service", w: 180 },
        { id: "geo", label: "Redis GEO\n+ locks", icon: "⚡", x: 540, y: 50, kind: "cache", w: 160 },
        { id: "eta", label: "ETA / routing", icon: "🗺️", x: 540, y: 300, kind: "service", w: 160 },
        { id: "d", label: "Driver app", icon: "🚗", x: 820, y: 50, kind: "client", w: 140 },
        { id: "trip", label: "Postgres: trips", icon: "🗄️", x: 820, y: 300, kind: "data", w: 170 }
      ],
      edges: [
        { from: "r", to: "m", both: true },
        { from: "m", to: "geo", both: true },
        { from: "m", to: "eta", both: true },
        { from: "m", to: "d", both: true },
        { from: "m", to: "trip", both: true }
      ],
      steps: [
        { title: "Candidates + ETA", html: "<p>2 km ke available drivers, phir top 10 ka sadak wala ETA.</p>", paths: [["r", "m", "geo", "m"], ["m", "eta", "m"]], active: ["geo", "eta"] },
        { title: "Lock (SET NX) → offer", html: "<p>Driver 42 pe lock mila to hi offer gaya. Doosre matcher ka SET fail: wo agla driver dekhega.</p>", path: ["m", "geo", "m", "d"], active: ["d"] },
        { title: "Accept → trip row", html: "<p>Driver ne accept kiya: trip Postgres mein, rider ko driver ki details.</p>", path: ["d", "m", "trip", "m", "r"], active: ["trip"] },
        { title: "Decline / timeout", html: "<p>15 s mein jawab nahi: lock expire, agla candidate.</p>", path: ["m", "d"], fail: ["d"], active: ["m"] }
      ]
    },
    {
      type: "text",
      html: `
        <div class="tip-box">🏭 <b>Production mein:</b>
          <ul>
            <li>Uber ne 2018 mein <b>H3</b> open source kiya: duniya ko hexagon cells mein baantne wala index. Uber isse surge pricing aur marketplace analysis jaise kaamon ke grid ke roop mein use karta hai; hexagon isliye ki har padosi barabar door ho.</li>
            <li>2015 ki ek Uber talk (HighScalability summary) mein dispatch system ke liye Google ke <b>S2</b> cells aur Uber ki apni library <b>Ringpop</b> (consistent hashing se kaam ko servers mein baantna) ka zikr hai: yani "cells + consistent hashing se geo sharding" wahi idea jo upar Stage 3 mein hai.</li>
          </ul>
        </div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Basic</td><td>Postgres drivers table</td><td>-</td></tr>
          <tr><td>2</td><td>2.5 lakh updates/s, data 4 s mein purana</td><td>In-memory store (Redis GEO)</td><td>Durable DB: bekaar WAL/index ka bojh</td></tr>
          <tr><td>2</td><td>2D "paas" query</td><td>Cells: geohash / H3 / quadtree</td><td>lat/lng B-tree: patli patti, filter mehenga</td></tr>
          <tr><td>3</td><td>Seedhi line galat</td><td>ETA service se rank</td><td>Sirf distance</td></tr>
          <tr><td>3</td><td>Ek driver do riders</td><td>Redis SET NX EX lock</td><td>Bina lock: double offer</td></tr>
          <tr><td>3</td><td>Trip/payment durable</td><td>Postgres trips</td><td>Redis: khone ka risk</td></tr>
          <tr><td>3</td><td>Bahut shehar</td><td>Geo sharding + consistent hashing</td><td>Global ek store: bina wajah bada</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Location ephemeral hai, trip durable hai" pehle 5 minute mein bol do: ye store ki choice khud justify kar deta hai. Phir geo index (geohash vs quadtree vs H3) aur driver lock.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Uber ne 2018 mein H3 open source kiya: duniya ko <b>hexagon</b> cells mein baantne wala grid. Surge pricing aur supply-demand analysis ke liye square grid ki jagah hexagon kyun?`,
      options: [
        `Hexagon dekhne mein achha lagta hai`,
        `Hexagon ke saare 6 padosi center se barabar door hote hain (square mein kone wale padosi door hote hain), to "aas-paas ke cells" aur smoothing ka hisaab barabar aur simple rehta hai`,
        `Hexagon se GPS zyada accurate hota hai`,
        `Square grid banana namumkin hai`
      ],
      answer: 1,
      why: `Uber ke H3 blog ke mutabik hexagons movement aur neighbours ke analysis ke liye isliye achhe hain ki har neighbour ek jaisa hai, aur H3 hierarchical bhi hai (bade cell ke andar chhote). Kimat: hexagons perfectly chhote hexagons mein nahi bant-te (child cells approximately contained), aur ek extra library. Driver ke real-time "nearby" lookup ke liye geohash/Redis GEO bhi bilkul valid hai, jaisa lesson mein dikhaya.`
    }
  ],
  references: [
    { title: "Uber Engineering: H3, Uber's Hexagonal Hierarchical Spatial Index", by: "Uber", url: "https://www.uber.com/us/en/blog/h3/", type: "article" },
    { title: "uber/h3 (GitHub)", by: "Uber", url: "https://github.com/uber/h3", type: "docs" },
    { title: "How Uber Scales Their Real-time Market Platform", by: "HighScalability", url: "https://highscalability.com/how-uber-scales-their-real-time-market-platform/", type: "article" },
    { title: "Redis docs: GEOSEARCH", by: "Redis", url: "https://redis.io/docs/latest/commands/geosearch/", type: "docs" }
  ]
});
