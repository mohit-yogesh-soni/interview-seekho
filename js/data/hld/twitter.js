// Twitter / News Feed — evolution style
registerLesson("hld", "twitter", {
  why: `News feed ka core sawaal ek hai: <b>kaam kab karein, likhte waqt ya padhte waqt?</b> Hum ek SQL query wali timeline se shuru karenge, numbers se dekhenge wo kyun toot-ti hai, phir precompute karenge, aur phir dekhenge celebrity accounts precompute ko kaise todte hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> tweet post karo (text + media), follow/unfollow, <b>home timeline</b>: jinhe follow karte ho unke tweets, naye pehle. (Search, trends, ads: out of scope, naam le do.)</li>
          <li><b>Non-functional:</b> timeline tez khule (~200 ms), naya tweet followers tak kuch seconds mein (thodi deri chalegi: <i>eventual consistency</i>), hamesha available.</li>
        </ul>
        <pre class="code-static">Tweets likhe jaate: ~5,000-10,000/s normal (spike pe kai guna)
Timeline padhi jaati: ~3 lakh/s
Read : write ≈ 30-60 : 1  → read-heavy
Average user ~200 log follow karta hai; kuch accounts ke 10 crore+ followers</pre>
        <p>Ye numbers Twitter ne 2013 ke aas-paas public talks mein bataye the (neeche Production section). Last line, yaani followers ka bahut asamaan hona, aage sabse bada role nibhayegi.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple: timeline = ek SQL query</h2>
        <pre class="code-static">tweets (id, user_id, text, created_at)      follows (follower_id, followee_id)

-- home timeline
SELECT * FROM tweets
WHERE user_id IN (SELECT followee_id FROM follows WHERE follower_id = :me)
ORDER BY created_at DESC LIMIT 50;</pre>
        <p>Ek Postgres, ek app. Chhote scale pe ye bilkul sahi hai: data ek jagah, hamesha fresh, koi duplicate nahi. Isko <b>fan-out on read</b> (ya "pull") kehte hain: timeline padhte waqt banti hai.</p>
        <h3>Kya toota?</h3>
        <p>Har timeline load pe ~200 users ke tweets dhoondo, merge karo, sort karo. 3 lakh timelines/s × 200 = har second <b>~6 crore</b> index lookups ka kaam. Tweets ek table mein sharded bhi kar do to ek timeline ko 200 users ke tweets kai shards se laane padenge. <b>Padhna mehenga hai, aur padhna hi sabse zyada hota hai.</b></p>
        <p><b>Cache lagao?</b> Tweets ko cache karne se DB bachta hai, par merge/sort ka kaam har read pe phir bhi hai. Poori timeline cache karo to naya tweet aane pe kaunsi timelines invalidate karein? Ye sawaal hi agla design hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: timeline pehle se bana ke rakho (fan-out on write)</h2>
        <p>Idea: jab tweet <i>likha</i> jaaye, tab hi har follower ki timeline list mein uska id daal do. Padhna = list ke top 50 utha lo. Kaam padhne se likhne pe shift hua.</p>
        <table>
          <tr><th></th><th>Fan-out on read (pull)</th><th>Fan-out on write (push)</th></tr>
          <tr><td>Tweet likhna</td><td>1 insert</td><td>1 insert + har follower ki list mein id (200 inserts)</td></tr>
          <tr><td>Timeline padhna</td><td>200 users se laao + merge (mehenga)</td><td>Ek list ka top 50 (sasta)</td></tr>
          <tr><td>Kaam/second</td><td>3 lakh reads × 200</td><td>~5,000 tweets × 200 = ~10 lakh list inserts</td></tr>
          <tr><td>Kab achha</td><td>Writes zyada, ya followers bahut</td><td>Reads zyada, followers normal</td></tr>
        </table>
        <p>Hamare numbers (read-heavy, 200 average followers) <b>push</b> ke favour mein hain: 10 lakh chhote inserts/s ~6 crore lookups/s se bahut kam hai, aur ye inserts <b>async</b> ho sakte hain (user ko timeline 2 second baad dikhe to chalta hai).</p>
        <h3>Naye components aur kyun</h3>
        <table>
          <tr><th>Component</th><th>Kya karta hai</th><th>Kyun ye</th><th>Alternative</th></tr>
          <tr><td><b>Kafka</b> (queue)</td><td>"Tweet hua" event; fan-out workers padhte hain</td><td>Tweet post ka API turant laut-ta hai; spike mein events jama hote hain, kho-te nahi; workers alag scale</td><td>Post API ke andar hi 200 inserts: post slow, crash pe aadhi fan-out</td></tr>
          <tr><td><b>Fan-out workers</b></td><td>Followers list nikaalo, har ek ki timeline mein tweet id</td><td>Stateless, jitne chahiye utne</td><td>-</td></tr>
          <tr><td><b>Redis</b> (timeline cache)</td><td>Har user ki list: latest ~800 tweet ids</td><td>Memory mein, list push/trim/range tez; sirf ids (chhote)</td><td>Cassandra mein timeline table: durable par read slow; DB mein: itne writes nahi</td></tr>
          <tr><td>Tweet store (sharded by tweet_id) + tweet cache</td><td>Asli tweet text/media URL</td><td>Timeline sirf ids rakhti hai; read pe ids se tweets "hydrate" (multi-get) hote hain. Edit/delete ek jagah.</td><td>Timeline mein poora tweet copy: 200 copies, edit/delete pe 200 jagah update</td></tr>
        </table>
        <p><b>Memory check:</b> 20 crore users × 800 ids × ~20 bytes ≈ 3.2 TB. Ye ek Redis mein nahi aata, isliye <b>Redis cluster</b> (users ke hisaab se bant-ta hai). Aur jo users 30 din se nahi aaye, unki timeline mat banao: wapas aane pe Stage 1 wali query se ek baar bana do. Isse memory kaafi kam ho jaati hai.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: post → Kafka → fan-out → Redis timelines",
      nodes: [
        { id: "u", label: "User (post)", icon: "✍️", x: 80, y: 90, kind: "client", w: 130 },
        { id: "tw", label: "Tweet svc", icon: "🐦", x: 280, y: 90, kind: "service", w: 140 },
        { id: "ts", label: "Tweet store", icon: "🗄️", x: 280, y: 270, kind: "data", w: 150 },
        { id: "k", label: "Kafka: tweets", icon: "📨", x: 490, y: 90, kind: "queue", w: 160 },
        { id: "fo", label: "Fan-out workers", icon: "👷", x: 700, y: 90, kind: "service", w: 170 },
        { id: "g", label: "Follow graph", icon: "🕸️", x: 700, y: 270, kind: "data", w: 160 },
        { id: "r", label: "Redis timelines\nuser → [ids]", icon: "⚡", x: 900, y: 180, kind: "cache", w: 170 }
      ],
      edges: [
        { from: "u", to: "tw" },
        { from: "tw", to: "ts" },
        { from: "tw", to: "k" },
        { from: "k", to: "fo" },
        { from: "fo", to: "g", both: true },
        { from: "fo", to: "r" }
      ],
      steps: [
        { title: "Post: save + event", html: "<p>Tweet store mein save, Kafka pe event, user ko turant success.</p>", paths: [["u", "tw", "ts"], ["tw", "k"]], active: ["ts", "k"] },
        { title: "Fan-out: 200 followers ki lists", html: "<p>Worker follow graph se followers laata hai aur har ek ki Redis list ke aage tweet id daalta hai (800 ke baad trim).</p>", path: ["k", "fo", "g", "fo", "r"], active: ["r"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: celebrity ne tweet kiya</h2>
        <p>Ek account ke <b>10 crore followers</b>. Ek tweet = 10 crore list inserts. Workers ~10 lakh inserts/s pe bhi ye <b>~100 second</b> leta hai, aur us dauraan baaki sabke tweets queue mein peeche. Aur celebrities din mein kai baar tweet karte hain. Push model yahan toot gaya.</p>
        <table>
          <tr><th>Option</th><th>Kami</th></tr>
          <tr><td>Bas zyada workers</td><td>Kaam wahi 10 crore inserts; har celebrity tweet pe bada spike; zyaadatar followers wo timeline us ghante khol-te bhi nahi</td></tr>
          <tr><td>Sab users ke liye wapas pull</td><td>Stage 1 ki problem wapas</td></tr>
          <tr><td><b>Hybrid</b> ⭐</td><td>Thoda complex read path, par dono problems hal</td></tr>
        </table>
        <p><b>Hybrid kaise:</b> jinke followers ek threshold (jaise 10 lakh) se zyada hain, unka fan-out <b>mat karo</b>. Timeline padhte waqt: (1) Redis se precomputed list, (2) user jin celebrities ko follow karta hai unke latest tweets (ye bahut log padhte hain, to unke "recent tweets" khud cache mein garam rehte hain), (3) dono ko time se merge. Celebrities kam hain (ek user shayad 10-20 follow karta hai), to merge sasta hai.</p>
        <p>Yahi baat ulti taraf bhi: jo users bahut kam aate hain, unke liye push bekaar hai. Isliye "push for normal + active users, pull for celebrities + inactive users".</p>`
    },
    {
      type: "flow",
      title: "Stage 3: read path = precomputed list + celebrity tweets merge",
      nodes: [
        { id: "u", label: "User (timeline)", icon: "📱", x: 90, y: 170, kind: "client", w: 160 },
        { id: "tl", label: "Timeline svc", icon: "🧩", x: 330, y: 170, kind: "service", w: 160 },
        { id: "r", label: "Redis: meri list", icon: "⚡", x: 600, y: 50, kind: "cache", w: 170 },
        { id: "c", label: "Celebrity recent\ntweets (cache)", icon: "⭐", x: 600, y: 170, kind: "cache", w: 190 },
        { id: "tc", label: "Tweet cache\n(hydrate ids)", icon: "🗂️", x: 600, y: 300, kind: "cache", w: 170 },
        { id: "fo", label: "Fan-out workers", icon: "👷", x: 870, y: 50, kind: "service", w: 170 },
        { id: "celeb", label: "Celebrity tweet", icon: "📣", x: 870, y: 230, kind: "client", w: 160 }
      ],
      edges: [
        { from: "u", to: "tl", both: true },
        { from: "tl", to: "r", both: true },
        { from: "tl", to: "c", both: true },
        { from: "tl", to: "tc", both: true },
        { from: "fo", to: "r" },
        { from: "celeb", to: "c" }
      ],
      steps: [
        { title: "Normal dost ka tweet: push", html: "<p>Fan-out workers ne pehle hi meri list mein daal diya tha.</p>", path: ["fo", "r"], active: ["r"] },
        { title: "Celebrity tweet: fan-out nahi", html: "<p>Sirf celebrity ki recent list mein gaya. 10 crore inserts bache.</p>", path: ["celeb", "c"], active: ["c"], dim: ["fo"] },
        { title: "Timeline kholi: merge + hydrate", html: "<p>Meri list + celebrities ke recent tweets, time se merge, phir ids se tweet objects cache se.</p>", paths: [["u", "tl", "r", "tl"], ["tl", "c", "tl"], ["tl", "tc", "tl", "u"]], active: ["tl"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: baaki cheezein (bolna kaafi hai)</h2>
        <table>
          <tr><th>Sawaal</th><th>Faisla</th><th>Kyun</th></tr>
          <tr><td>Tweet ids</td><td>Snowflake (time-sortable 64-bit)</td><td>Merge "naye pehle" sirf id compare se; koi central counter nahi</td></tr>
          <tr><td>Tweet delete</td><td>Tweet store mein deleted mark; hydrate ke waqt filter</td><td>Crores timelines se id hataana bekaar mehenga</td></tr>
          <tr><td>Unfollow</td><td>Read pe filter (ya list ko dheere-dheere saaf)</td><td>Same reason</td></tr>
          <tr><td>Media</td><td>Blob storage + CDN</td><td>Bade files app servers se nahi</td></tr>
          <tr><td>"For You" ranking</td><td>Upar wala system <i>candidates</i> deta hai; ek ranking service ML model se order karti hai</td><td>Storage/fan-out design wahi rehta hai, sirf last step badalta hai</td></tr>
          <tr><td>Redis node gira</td><td>Replica promote; agar list kho gayi to pull query se dobara banao</td><td>Timeline cache hai, source of truth tweet store + follow graph hai</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Twitter ke Raffi Krikorian ki 2013 talk "Timelines at Scale" ke mutabik home timeline <b>Redis cluster</b> mein rehti thi (max ~800 entries) aur tweets <b>fan-out on write</b> se followers ki timelines mein jaate the; usi talk mein bade accounts ki fan-out ki dikkat bhi discuss hui. Twitter ke engineering blog (August 2013) ke mutabik average ~5,700 tweets/s the, aur 3 August 2013 ko Japan mein ek TV movie (Castle in the Sky) ke dauraan ek second ka peak 143,199 tweets/s gaya (steady state ka ~25×; pichhla record ~33,388 tha). Ye spike hi wajah hai ki post aur fan-out ke beech queue hai.</div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Basic timeline</td><td>SQL pull query</td><td>-</td></tr>
          <tr><td>2</td><td>3 lakh reads/s × 200 merge</td><td>Fan-out on write + Redis lists</td><td>Sirf tweet cache: merge ka kaam bacha</td></tr>
          <tr><td>2</td><td>Post fast, spike safe</td><td>Kafka + fan-out workers</td><td>Post API mein sync inserts</td></tr>
          <tr><td>2</td><td>3.2 TB timelines</td><td>Redis cluster + sirf active users</td><td>Sabke liye list: memory waste</td></tr>
          <tr><td>3</td><td>Celebrity = 10 crore inserts</td><td>Hybrid: celebrities pull + merge</td><td>Bas zyada workers: kaam wahi</td></tr>
          <tr><td>4</td><td>Edit/delete</td><td>Ids in timeline, hydrate from tweet store</td><td>Poora tweet copy: 200 jagah update</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Pull se shuru karo, numbers se dikhao read mehenga hai, push pe aao, phir khud bolo "par celebrity ke 10 crore followers..." aur hybrid. Interviewer yahi sequence sunna chahta hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Twitter ke shuruaati dinon (2007-2008) mein site load pe baar baar girti thi aur "fail whale" error page famous ho gaya. Maan lo aapka read-heavy app har timeline request pe database mein followees ke tweets join/merge karta hai, aur reads writes se ~50× zyada hain. Lesson ke hisaab se core fix kya hai?`,
      options: [
        `Zyada bade database servers`,
        `Timeline padhne ka kaam likhne ke waqt pe shift karna (fan-out on write + in-memory timelines), aur bade accounts ke liye hybrid`,
        `Users ko kam follow karne do`,
        `Sab kuch ek server pe rakhna`
      ],
      answer: 1,
      why: `Read-heavy system mein har read pe join/merge sabse mehenga hai. Twitter ne aage chal ke timelines Redis mein precompute ki (Raffi Krikorian ki 2013 talk), aur services ko JVM pe le gaye. Celebrity accounts ke liye fan-out bahut bada hota hai, isliye hybrid. Ye wahi sequence hai jo is lesson mein stages mein dikhaya.`
    }
  ],
  references: [
    { title: "New Tweets per second record, and how! (Aug 2013)", by: "Twitter Engineering (Raffi Krikorian)", url: "https://blog.x.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how", type: "article" },
    { title: "Timelines at Scale (Raffi Krikorian, QCon 2013)", by: "InfoQ", url: "https://www.infoq.com/presentations/Twitter-Timeline-Scalability/", type: "video" },
    { title: "Interview with Raffi Krikorian on Twitter's Infrastructure", by: "InfoQ", url: "https://www.infoq.com/articles/twitter-infrastructure/", type: "article" },
    { title: "System Design Interview Vol. 1, Ch. 11: Design a news feed system", by: "Alex Xu", url: "https://bytebytego.com/", type: "book" },
    { title: "Hello Interview: problem breakdowns", by: "Hello Interview", url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview", type: "course" }
  ]
});
