// 45 minute ka HLD framework
registerLesson("hld", "framework", {
  why: `HLD interview mein sabse common failure: 10 minute baad bhi requirements clear nahi, ya 30 minute boxes banana aur deep dive ka time hi nahi. Ek fixed framework time ko sahi baant-ta hai aur har design ko same steps se nikaalne deta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Framework (Hello Interview / Alex Xu jaisa standard flow)</h2>
        <table>
          <tr><th>Step</th><th>Time</th><th>Kya karna hai</th></tr>
          <tr><td>1. Functional requirements</td><td>~5 min</td><td>Top 3-4 features ("users post kar sakein", "feed dekh sakein"). Baaki out of scope bolo.</td></tr>
          <tr><td>2. Non-functional</td><td>~3 min</td><td>Scale (DAU), latency (feed &lt; 200ms), availability vs consistency (feed AP, payments CP), durability</td></tr>
          <tr><td>3. Estimation (optional/short)</td><td>~3 min</td><td>QPS, read:write, storage — sirf jo design badle</td></tr>
          <tr><td>4. Core entities + API</td><td>~5 min</td><td>Entities (User, Post, Follow), REST endpoints (<code>POST /posts</code>, <code>GET /feed?cursor=</code>)</td></tr>
          <tr><td>5. High-level design</td><td>~10 min</td><td>Boxes: client → LB/gateway → services → DB/cache/queue. Har functional requirement ka flow diagram pe chalao.</td></tr>
          <tr><td>6. Deep dives</td><td>~15 min</td><td>Non-functional requirements poore karo: bottlenecks, scaling, consistency, failure modes. Interviewer ke hints follow karo.</td></tr>
          <tr><td>7. Wrap up</td><td>~2 min</td><td>Trade-offs, monitoring, kya aage improve karte</td></tr>
        </table>
        <h3>Achhe answer ki pehchaan</h3>
        <ul>
          <li>Har component ke saath <b>kyun</b> ("cache kyunki 100:1 read:write").</li>
          <li>Simple se shuru, phir scale (ek DB → replicas → cache → shard), bina pooche over-engineering nahi.</li>
          <li>Numbers (latency, QPS) se trade-off.</li>
          <li>Failure modes khud bolna (Redis down to? queue backlog to?).</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🔢 <b>Design interview steps ka order:</b></div>
          <ol><li>Functional requirements aur scope</li><li>Non-functional requirements (scale, latency, consistency)</li><li>Back-of-the-envelope estimation</li><li>Core entities aur APIs</li><li>High-level design (components + data flow)</li><li>Deep dives (bottlenecks, scaling, failures)</li><li>Trade-offs aur wrap-up</li></ol>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Practice: <b>"Design Instagram."</b> Sirf step 1-2 karo: functional requirements (scope ke saath) aur non-functional requirements likho.</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>FR: <b>photo upload</b> (caption)</li><li>FR: <b>follow</b> users aur <b>feed</b> dekhna</li><li>Out of scope bolna (DMs, stories, reels, ads)</li><li>NFR: scale (DAU), <b>feed latency</b> low, <b>availability</b> &gt; consistency (eventual OK)</li><li>NFR: photos <b>durable</b>, read-heavy</li></ul></div>
          <div class="qa-a"><p><b>Functional:</b> (1) user photo + caption upload kare, (2) doosre users ko follow kare, (3) home feed mein followed users ke recent posts dekhe, (4) like/comment (optional). <b>Out of scope:</b> DMs, stories, reels, search, ads.</p><p><b>Non-functional:</b> 500M DAU; feed load &lt; 200-300ms p99; highly available, eventual consistency theek (post kuch seconds baad followers ko dikhe chalega); photos durable (kabhi lost nahi); read-heavy (~100:1). Ye NFRs hi deep dive decide karte hain: CDN + object storage (durability, latency), fan-out + cache (feed latency), AP choices.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Kaunse habits interview mein <b>nuksaan</b> karti hain?</b></div>
          <ul class="qa-options"><li>✅ Pehle 15 minute sirf estimation ke calculations<div class="small muted">Numbers tabhi jab design badlein. 3-5 min kaafi.</div></li><li>✅ Kafka, Redis, Cassandra, ES sab shuru mein hi bina reason<div class="small muted">Buzzword design. Simple se shuru karo, zaroorat pe component.</div></li><li>❌ Har requirement ke liye diagram pe request ka flow chala ke dikhana<div class="small muted">Achhi habit: design kaam karta hai ye proof.</div></li><li>✅ Interviewer ke hint ("ye celebrity users ke liye kaise chalega?") ignore karke apna plan<div class="small muted">Hints deep dive ki direction hain.</div></li><li>❌ Trade-off bolna: "isse writes tez par reads thode stale"<div class="small muted">Senior signal.</div></li></ul>
          
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Whiteboard pe ek kone mein FR aur NFR list likh ke rakho, aur deep dive mein har NFR ko tick karo ("latency ke liye ye cache, availability ke liye replicas"). Interviewer ko dikhta hai ki design requirements se chal raha hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Pokémon GO (2016) ke launch pe traffic estimate ka ~50× aaya. Interview framework ke kaunse steps is jaisi situation ke liye sabse zyada kaam aate hain?`,
      options: [
        `Seedha components draw karna, numbers skip`,
        `Requirements + estimation se bottleneck pehchaanna, phir design mein scale-out ka raasta aur "agar 10× ho gaya to kya tootega" wala deep dive`,
        `Sirf database chunna`,
        `Pehle code likhna`
      ],
      answer: 1,
      why: `Framework ka maqsad ye nahi ki exact number sahi ho; maqsad hai ki aap batao kis cheez pe system tootega aur us waqt kya karoge (stateless tiers, cache, queue, sharding). Google Cloud ke Pokémon GO blog mein bhi yahi dikhta hai: estimate galat tha, par architecture scale-out ho sakta tha. Interview mein "10× pe kya badlega" khud bolna strong signal hai.`
    }
  ],
  references: [
    { title: "Bringing Pokémon GO to life on Google Cloud", by: "Google Cloud", url: "https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud", type: "article" },
    {
      title: "Hello Interview: System Design in a Hurry (delivery framework)",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    },
    {
      title: "System Design Interview Vol. 1, Ch. 3: A framework for system design interviews",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "book"
    }
  ]
});
