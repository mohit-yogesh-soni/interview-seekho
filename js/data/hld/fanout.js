// Fan-out on write vs read
registerLesson("hld", "fanout", {
  why: `News feed (Twitter, Instagram, LinkedIn) ka core sawaal: jab koi post kare to followers ki timeline mein kaise pahunche? Post karte waqt sabki timeline mein daal do (push), ya padhte waqt sabke posts jodo (pull)? Celebrity problem ke saath hybrid: ye trade-off samajh liya to feed design khud bana loge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Do approaches</h2>
        <table>
          <tr><th></th><th>Fan-out on write (push)</th><th>Fan-out on read (pull)</th></tr>
          <tr><td>Post pe</td><td>Har follower ki timeline cache (Redis list) mein post id daalo</td><td>Sirf author ke posts mein save</td></tr>
          <tr><td>Feed padhne pe</td><td>Apni ready list padho: <b>bahut tez</b></td><td>Jinko follow karte ho unke recent posts laao, merge, sort: <b>slow</b></td></tr>
          <tr><td>Write cost</td><td>Followers jitna (1 crore followers = 1 crore writes!)</td><td>1 write</td></tr>
          <tr><td>Best for</td><td>Normal users (kam followers), read-heavy feeds</td><td>Celebrities, inactive users</td></tr>
        </table>
        <h2>Celebrity problem → hybrid</h2>
        <p>Virat Kohli (crores followers) post kare aur push karo = crores Redis writes, minutes tak delay. Hybrid:</p>
        <ul>
          <li>Normal users ke posts: <b>push</b> followers ki timelines mein.</li>
          <li>Celebrities (followers &gt; threshold, jaise 1 lakh) ke posts: push nahi. Feed padhte waqt user jin celebrities ko follow karta hai unke recent posts <b>pull</b> karke apni ready timeline mein merge.</li>
          <li>Inactive users (30 din se login nahi) ko push skip: wapas aayein to pull se feed banao.</li>
        </ul>
        <p>Timeline cache mein sirf post <b>ids</b> (aur aksar sirf latest ~800), post content alag cache se. Twitter ne aisa hi hybrid publicly describe kiya hai.</p>`
    },
    {
      type: "flow",
      title: "Push (fan-out on write) vs pull (fan-out on read)",
      nodes: [
        {
          id: "bob",
          label: "Bob (normal)",
          icon: "🙂",
          x: 90,
          y: 70,
          kind: "client",
          w: 140
        },
        {
          id: "star",
          label: "Virat (celeb)",
          icon: "⭐",
          x: 90,
          y: 270,
          kind: "client",
          w: 150
        },
        {
          id: "posts",
          label: "Posts store",
          icon: "🗄️",
          x: 360,
          y: 270,
          kind: "data",
          w: 150
        },
        {
          id: "f1",
          label: "Riya timeline",
          icon: "📰",
          x: 650,
          y: 50,
          kind: "cache",
          w: 160
        },
        {
          id: "f2",
          label: "Aman timeline",
          icon: "📰",
          x: 650,
          y: 160,
          kind: "cache",
          w: 160
        },
        {
          id: "f3",
          label: "Neha timeline",
          icon: "📰",
          x: 650,
          y: 270,
          kind: "cache",
          w: 160
        },
        {
          id: "reader",
          label: "Riya opens feed",
          icon: "📱",
          x: 900,
          y: 160,
          kind: "client",
          w: 160
        }
      ],
      edges: [
        {
          from: "bob",
          to: "f1"
        },
        {
          from: "bob",
          to: "f2"
        },
        {
          from: "bob",
          to: "f3"
        },
        {
          from: "star",
          to: "posts"
        },
        {
          from: "reader",
          to: "f1", both: true,
          dashed: true
        },
        {
          from: "reader",
          to: "posts", both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Normal user post: push to followers",
          html: "<p>Bob ke 3 followers: post id teeno ki ready timeline mein (3 writes).</p>",
          paths: [
            ["bob","f1"],
            ["bob","f2"],
            ["bob","f3"]
          ],
          active: ["f1","f2","f3"]
        },
        {
          title: "Read: ready list (bahut tez)",
          html: "<p>Riya ka feed = uski timeline list. Koi merge nahi.</p>",
          path: ["reader","f1","reader"],
          active: ["f1"]
        },
        {
          title: "Celebrity post: push nahi, sirf store",
          html: "<p>Virat ke crores followers: push = crores writes. Isliye post sirf uske posts store mein.</p>",
          path: ["star","posts"],
          active: ["posts"],
          dim: ["f1","f2","f3"]
        },
        {
          title: "Read: timeline + celebrity posts merge",
          html: `<p>Riya ka feed kholte waqt uski timeline aur jin celebrities ko follow karti hai unke recent posts laake merge (hybrid).</p>`,
          paths: [
            ["reader","f1","reader"],
            ["reader","posts","reader"]
          ],
          active: ["f1","posts"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> 300M DAU, avg 200 followers, har user din mein 1 post, kuch accounts ke 10 crore followers. Push-only kyun nahi chalega? Numbers se samjhte hain, aur hybrid threshold kaise chunte hain.</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Avg push: 300M × 200 = <b>60 billion writes/day</b> (~7 lakh/s) — bahut, par ek bada celebrity post = <b>10 crore</b> writes ek saath</li><li>Celebrity ke post ka delay minutes / write spike</li><li>Threshold: followers count (jaise &gt; 1 lakh / 10k) → pull; tune by write cost vs read merge cost</li></ul></div>
          <div class="qa-a"><p>Push-only: 300M posts × 200 = 60B timeline writes/day (~7 lakh/s average) — sambhal sakte ho with sharded Redis, par ek celebrity post = 10 crore writes ek burst mein: followers ko post minutes baad dikhega aur write cluster pe spike. Hybrid: followers &gt; threshold (jaise 1 lakh) pe pull. Threshold tune karo: read pe har user jitne celebrities follow karta hai utne extra fetches (aksar 10-50), vs write burst. Inactive users ko push skip karna aur bhi bachata hai.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Push (write pe fan-out): read-heavy feed, normal follower counts. Pull (read pe): bahut followers wale accounts, ya inactive users.</td></tr>
          <tr><th>Kab nahi</th><td>Push celebrity accounts ke liye (crores inserts per post); pull jab har user 500 logon ko follow kare aur feed baar baar khule.</td></tr>
          <tr><th>Kimat (cost)</th><td>Push: storage (har follower ki list), write spikes, delete/unfollow pe safai. Pull: har read pe merge, latency.</td></tr>
          <tr><th>Alternatives</th><td>Hybrid (common answer), ya ranked feed jahan candidates pull se aur ranking ML se.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Twitter (2013, Raffi Krikorian ki talk): home timelines Redis cluster mein (~800 entries), fan-out on write, aur bade accounts ke liye alag handling. Detail: Twitter design lesson.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Feed design mein pehle bolo: <i>"read-heavy hai, isliye fan-out on write with precomputed timelines in Redis; celebrities ke liye fan-out on read aur merge (hybrid)."</i> Ye ek line poore design ka backbone hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 3 August 2013: Japan mein ek TV movie ke dauraan Twitter pe ek second mein 143,199 tweets aaye, normal average (~5,700/s) ka ~25×. Twitter ne bataya ki users ko koi rukawat nahi dikhi. Fan-out on write wale system mein is tarah ka spike kaise sambhalta hai?`,
      options: [
        `Har tweet ko post request ke andar hi saare followers ki timeline mein synchronously likho`,
        `Tweet save karke post request turant khatam; fan-out queue ke through async workers karte hain jo spike ke dauraan backlog jama karke apni speed se nikaalte hain (timeline thodi der se update)`,
        `Spike ke dauraan tweets reject karo`,
        `Sab users pull model pe daal do`
      ],
      answer: 1,
      why: `Twitter Engineering ke blog ("New Tweets per second record, and how!") ke mutabik unhone Ruby monolith se JVM services aur decoupled architecture pe move kiya tha, jisse ye peak sambhala. Queue + async fan-out ka matlab hai write path aur timeline update alag scale hote hain; kimat: spike mein followers ko tweet kuch seconds late dikh sakta hai (eventual consistency).`
    }
  ],
  references: [
    { title: "New Tweets per second record, and how!", by: "Twitter Engineering", url: "https://blog.x.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how", type: "article" },
    { title: "Timelines at Scale (QCon 2013)", by: "Raffi Krikorian", url: "https://www.infoq.com/presentations/Twitter-Timeline-Scalability/", type: "video" },
    {
      title: "Hello Interview: News feed / problem breakdowns",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview",
      type: "course"
    },
    {
      title: "Gaurav Sen (YouTube): news feed design",
      by: "Gaurav Sen",
      url: "https://www.youtube.com/@gkcs",
      type: "video"
    }
  ]
});
