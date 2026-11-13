// Chat (WhatsApp) — evolution style
registerLesson("hld", "chat", {
  why: `Chat design mein teen naye sawaal aate hain jo URL shortener mein nahi the: server user ko <b>khud</b> message kaise bheje (realtime), lakhs open connections wale servers mein "B kis server pe hai" kaise pata chale, aur din ke arbon messages kahan likhein. Hum polling wale simple app se shuru karte hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> 1:1 aur group chat (max 256 members), offline user ko baad mein mile, receipts (✓ sent, ✓✓ delivered, blue = read), online/last seen. Media (photo/video) bhi.</li>
          <li><b>Non-functional:</b> message jaldi pahunche (online ho to ~sub-second), <b>kabhi khoye nahi</b>, aur ek chat ke andar <b>order</b> sahi rahe.</li>
        </ul>
        <pre class="code-static">DAU 50 crore × 40 messages/din = 2,000 crore (20B) messages/din
20B / 86,400 s ≈ 2.3 lakh messages/s  (peak ~2× = ~5 lakh/s)
Text storage ≈ 20B × ~100 bytes ≈ 2 TB/din (media alag, blob storage mein)
Ek saath online (peak) ≈ 10-20 crore phones</pre>
        <p>Do numbers yaad rakho: <b>writes bahut zyada</b> (2.3 lakh/s) aur <b>open connections bahut zyada</b> (crores). Dono aage design chalayenge.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple: REST + polling</h2>
        <p>Ek app server, ek Postgres <code>messages</code> table (<code>id, chat_id, sender, text, created_at</code>). Bhejna = <code>POST /messages</code>. Naye messages = phone har 2 second <code>GET /messages?after=lastId</code> poochta hai. 1,000 users ke saath ye chal jaata hai.</p>
        <h3>Kya toota (bade scale pe)?</h3>
        <ul>
          <li>10 crore online phones / 2 s = <b>5 crore requests/s</b>, aur unme se 99% ka jawab "kuch naya nahi". Server sirf "nahi" bolne mein busy.</li>
          <li>Message aane mein 0-2 s ki deri, aur har 2 s pe radio jagne se battery khatam.</li>
        </ul>
        <h3>Server se client tak push karne ke tareeke</h3>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Kami</th></tr>
          <tr><td>Short polling</td><td>Har N second poochho</td><td>Upar wali problems</td></tr>
          <tr><td>Long polling</td><td>Request khuli rehti hai jab tak kuch naya na aaye (ya 30 s timeout)</td><td>Better, par har message ke baad nayi request; headers ka overhead; server pe phir bhi ek pending request per user</td></tr>
          <tr><td>SSE (Server-Sent Events)</td><td>Ek HTTP connection pe server lagaatar events bhejta hai</td><td>Sirf server → client. Bhejne ke liye alag HTTP calls. Notifications/ChatGPT streaming ke liye badhiya, chat ke liye aadha</td></tr>
          <tr><td><b>WebSocket</b> ⭐</td><td>Ek TCP connection khula rehta hai, <b>dono taraf</b> kabhi bhi chhote frames bhej sakte hain</td><td>Server <b>stateful</b> ho jaata hai (kaun sa user kis server se juda hai): ye agla stage ki problem hai</td></tr>
        </table>
        <p><b>Decision: WebSocket</b>, kyunki chat dono taraf hai (bhejna, receipts, typing...) aur har message pe naya request banana bekaar hai. (WhatsApp apne mobile app mein apna halka protocol chalata hai, par idea same hai: ek persistent connection.)</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: crores connections = hazaaron chat servers</h2>
        <p>Ek server pe kitne connections? Idle connection mein memory kam lagti hai, to ek tuned server lakhs sambhal sakta hai. Maan lo ~1 lakh per server (safe number): 10-20 crore online / 1 lakh = <b>1,000-2,000 chat servers</b>.</p>
        <p><b>Nayi problem:</b> A server 12 se juda hai, B server 40 se. A ka message server 12 pe aaya. <b>Server 12 ko kaise pata ki B server 40 pe hai?</b> Pehle sab ek server pe the, ye sawaal hi nahi tha.</p>
        <table>
          <tr><th>Option</th><th>Kaise</th><th>Kami</th></tr>
          <tr><td>Broadcast</td><td>Har message saare 2,000 servers ko bhejo, jiske paas B ho wo de</td><td>Har message 2,000× network traffic. 2.3 lakh/s × 2,000 = namumkin.</td></tr>
          <tr><td>Sticky: user ko hamesha same server (<code>hash(userId)</code>)</td><td>Pata hai kahan hai</td><td>Server gira ya add hua to bahut users shift; phone network badalne pe reconnect kahin bhi ho sakta hai</td></tr>
          <tr><td><b>Connection registry</b> ⭐</td><td>Connect pe Redis mein <code>conn:B = server40</code> (TTL ke saath, heartbeat se refresh). Route se pehle lookup.</td><td>Ek lookup per message (~1 ms); stale entry ho sakti hai (TTL + delivery ack se handle)</td></tr>
          <tr><td>Pub/Sub (per-user channel)</td><td>Server 40 "user B" channel subscribe karta hai; message us channel pe publish</td><td>Valid alternative. Crores channels ka pub/sub system chalana bhaari; delivery guarantee pub/sub mein kamzor</td></tr>
        </table>
        <p><b>Decision:</b> registry (Redis, user → server) + ek <b>message service</b> jo route karti hai. Chat servers sirf "connection rakhne wale" bane rehte hain (unpe business logic kam), taaki unhe restart/deploy karna aasaan ho.</p>
        <p><b>Load balancer pe dhyaan:</b> WebSocket lambi chalti hai, to LB "least connections" se naye connections baant-ta hai. Deploy ya crash pe hazaaron phones ek saath reconnect karte hain (<b>reconnect storm</b>), isliye client random delay (jitter) ke saath reconnect karta hai.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: A (server 12) → B (server 40) via registry",
      nodes: [
        { id: "a", label: "Phone A", icon: "📱", x: 70, y: 90, kind: "client", w: 110 },
        { id: "s12", label: "Chat server 12", icon: "🔌", x: 260, y: 90, kind: "service", w: 160 },
        { id: "msg", label: "Message svc", icon: "💬", x: 490, y: 90, kind: "service", w: 150 },
        { id: "reg", label: "Redis registry\nB → server 40", icon: "📇", x: 490, y: 270, kind: "cache", w: 190 },
        { id: "s40", label: "Chat server 40", icon: "🔌", x: 730, y: 90, kind: "service", w: 160 },
        { id: "b", label: "Phone B", icon: "📱", x: 920, y: 90, kind: "client", w: 110 }
      ],
      edges: [
        { from: "a", to: "s12", both: true },
        { from: "s12", to: "msg", both: true },
        { from: "msg", to: "reg", both: true },
        { from: "msg", to: "s40", both: true },
        { from: "s40", to: "b", both: true }
      ],
      steps: [
        { title: "B connect hua → registry", html: "<p>B ka phone server 40 se juda; server 40 ne registry mein likha <code>B → 40</code> (TTL 60 s, heartbeat pe refresh).</p>", path: ["b", "s40", "msg", "reg"], active: ["reg"] },
        { title: "A bhejta hai → lookup → route", html: "<p>Message service ne registry se dekha B kahan hai aur seedha server 40 ko diya.</p>", path: ["a", "s12", "msg", "reg", "msg", "s40", "b"], active: ["msg", "b"] },
        { title: "Server 40 gira", html: "<p>B ka phone kisi aur server pe reconnect karega (jitter ke saath) aur naya registry entry likhega. Beech ke messages DB mein hain, sync se milenge (Stage 3).</p>", path: ["a", "s12", "msg", "reg"], fail: ["s40"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: messages kabhi na khoyein (storage + receipts)</h2>
        <p>Abhi tak message seedha forward ho raha tha. B offline hai, ya server 40 beech mein gira, to message gaya. Isliye rule: <b>pehle durable store mein likho, phir deliver</b>. A ko ✓ tabhi milega jab message save ho gaya.</p>
        <h3>Database: 2.3 lakh writes/s, query "is chat ke latest 50, phir purane"</h3>
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>Ek Postgres</td><td>Simple, SQL</td><td>Ek primary 2.3 lakh writes/s aur 2 TB/din nahi sambhalega</td></tr>
          <tr><td>Sharded Postgres/MySQL (shard key = chat_id)</td><td>SQL rehta hai; Vitess jaise tools sharding sambhalte hain</td><td>Valid. Par resharding aur operations ka kaam bahut; B-tree pe itne writes mehenge</td></tr>
          <tr><td><b>Wide-column store</b> (Cassandra / ScyllaDB) ⭐</td><td>Writes ke liye bana (LSM: pehle memory + append-only log, baad mein merge); nodes jodo, data apne aap bant-ta hai; partition ke andar rows sorted</td><td>Joins/transactions nahi; query pattern pehle se fix karna padta hai. Chat ka pattern fix hi hai.</td></tr>
          <tr><td>MongoDB</td><td>Flexible documents</td><td>Is pattern ke liye Cassandra se koi khaas fayda nahi; sharding chalana bhi kaam hai</td></tr>
        </table>
        <p><b>Decision: Cassandra jaisa store.</b> Table: partition key = <code>(chat_id, time_bucket)</code>, clustering = <code>message_id DESC</code>. "Latest 50" = ek partition se sorted read. <code>time_bucket</code> (jaise 10 din) kyun? Purane, bahut active group ka ek hi partition arbon rows ka ho jaata, jo ek node pe hot aur bhaari hota hai.</p>
        <h3>Order aur duplicates</h3>
        <ul>
          <li><b>Global order ki zaroorat nahi</b>, sirf ek chat ke andar. <code>message_id</code> time-sortable (Snowflake-style: timestamp + machine + sequence) se ye milta hai.</li>
          <li>Phone network flaky hai, to app retry karegi. App har message ke saath apna <b>client message id</b> bhejti hai; server same id dobara aaye to dobara save nahi karta (idempotency).</li>
        </ul>
        <h3>Receipts aur offline</h3>
        <ol>
          <li>Save hua → A ko <b>✓</b>.</li>
          <li>B ke phone ne receive karke ack bheja → A ko <b>✓✓</b>.</li>
          <li>B ne chat khola → read ack → <b>blue ✓✓</b>.</li>
          <li>B offline (registry mein nahi): APNs/FCM push ("Ravi: hi"), aur B jab connect kare to "mere last message id ke baad ke messages do" (<b>sync</b>).</li>
        </ol>`
    },
    {
      type: "flow",
      title: "Stage 3: persist → ✓ → deliver → ✓✓ (ya push + sync)",
      nodes: [
        { id: "a", label: "Phone A", icon: "📱", x: 70, y: 90, kind: "client", w: 110 },
        { id: "s12", label: "Chat server 12", icon: "🔌", x: 260, y: 90, kind: "service", w: 160 },
        { id: "msg", label: "Message svc", icon: "💬", x: 490, y: 90, kind: "service", w: 150 },
        { id: "db", label: "Cassandra\n(chat_id, bucket)", icon: "🗄️", x: 490, y: 280, kind: "data", w: 190 },
        { id: "reg", label: "Registry", icon: "📇", x: 720, y: 280, kind: "cache", w: 130 },
        { id: "s40", label: "Chat server 40", icon: "🔌", x: 730, y: 90, kind: "service", w: 160 },
        { id: "b", label: "Phone B", icon: "📱", x: 920, y: 90, kind: "client", w: 110 },
        { id: "push", label: "APNs / FCM", icon: "🔔", x: 920, y: 280, kind: "external", w: 130 }
      ],
      edges: [
        { from: "a", to: "s12", both: true },
        { from: "s12", to: "msg", both: true },
        { from: "msg", to: "db", both: true },
        { from: "msg", to: "reg", both: true, dashed: true },
        { from: "msg", to: "s40", both: true },
        { from: "s40", to: "b", both: true },
        { from: "msg", to: "push", dashed: true },
        { from: "push", to: "b", dashed: true }
      ],
      steps: [
        { title: "Save → ✓", html: "<p>Message (client id ke saath) Cassandra mein likha gaya, tab A ko ✓.</p>", path: ["a", "s12", "msg", "db", "msg", "s12", "a"], active: ["db"] },
        { title: "Deliver → device ack → ✓✓", html: "<p>Registry se B ka server mila, message pahuncha, B ke phone ne ack bheja, A ko ✓✓.</p>", path: ["msg", "reg", "msg", "s40", "b", "s40", "msg", "s12", "a"], active: ["b"], color: "#1971c2" },
        { title: "B offline → push, phir sync", html: "<p>Registry mein B nahi: push notification. B online aaya to last id ke baad ke messages DB se.</p>", paths: [["msg", "push", "b"], ["b", "s40", "msg", "db"]], dim: ["reg"], active: ["push", "db"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: groups, presence, media</h2>
        <table>
          <tr><th>Feature</th><th>Faisla</th><th>Kyun / alternative</th></tr>
          <tr><td>Group (max 256)</td><td>Message <b>ek baar</b> store (group ki chat_id mein), phir har member ko deliver (online → registry se route, offline → push)</td><td>Har member ki copy store karna = 256× storage. 256 chhota hai to delivery fan-out theek hai. Lakhs members wale channels mein members khud padhte hain (fan-out on read, feed lesson).</td></tr>
          <tr><td>Online / last seen</td><td>Heartbeat se Redis mein <code>lastSeen:user</code>; presence sirf tab bhejo jab koi wo chat khole</td><td>Har online/offline change saare contacts ko broadcast = bahut traffic (ek user ke 500 contacts × har reconnect). Lazy fetch kaafi hai.</td></tr>
          <tr><td>Photo / video</td><td>App pehle blob storage (S3 jaisa) mein upload kare, message mein sirf URL/id; download CDN se</td><td>Chat servers aur Cassandra se MBs ka data guzaarna unhe slow karega</td></tr>
          <tr><td>End-to-end encryption</td><td>Phones apas mein keys rakhte hain (Signal protocol); server sirf encrypted bytes store/forward karta hai</td><td>Architecture wahi rehti hai, bas server content padh/search nahi kar sakta</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b>
          <ul>
            <li><b>WhatsApp</b> ka server side Erlang pe bana hai (lakhs halke processes, har connection ka ek). 2012 ke unke blog mein ek machine pe <b>20 lakh+ TCP connections</b> ka zikr hai, jo dikhata hai ki connection servers kitne "patle" ho sakte hain.</li>
            <li><b>Discord</b>: 2015 mein MongoDB, 2017 mein <b>Cassandra</b> (partition = channel + time bucket, bilkul upar jaisa), aur 2022 tak 177 Cassandra nodes pe latency ki dikkaton ke baad <b>ScyllaDB</b> (Cassandra-compatible, C++ mein) pe shift: 72 nodes. Data model wahi raha, engine badla.</li>
          </ul>
        </div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Polling: crores bekaar requests, deri</td><td>WebSocket</td><td>Long polling: overhead; SSE: sirf ek taraf</td></tr>
          <tr><td>2</td><td>B kis server pe?</td><td>Redis registry + message svc</td><td>Broadcast: 2,000× traffic; sticky hash: reconnect pe toot-ta</td></tr>
          <tr><td>3</td><td>Offline / crash pe message loss</td><td>Pehle persist, phir deliver; push + sync</td><td>Seedha forward: koi guarantee nahi</td></tr>
          <tr><td>3</td><td>2.3 lakh writes/s</td><td>Cassandra (chat_id + bucket)</td><td>Ek Postgres: limit; sharded SQL: valid par operations bhaari</td></tr>
          <tr><td>3</td><td>Retry pe duplicate</td><td>Client message id</td><td>-</td></tr>
          <tr><td>4</td><td>Groups / media / presence</td><td>Store once + fan-out deliver; S3 + CDN; lazy presence</td><td>Har member copy; media chat servers se; presence broadcast</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Polling ka number (5 crore req/s) dikha ke WebSocket pe aao, phir "B kis server pe hai" ka sawaal khud uthao. Receipts ka flow (✓ persist, ✓✓ device ack, blue read ack) aur offline sync bolna sabse strong signal hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Discord (2017 blog "How Discord Stores Billions of Messages"): Cassandra mein messages ka partition key sirf <code>channel_id</code> rakha jaata to ek purana, bahut active channel ka ek partition saalon mein bahut bada ho jaata. Unhone partition key kya rakha?`,
      options: [
        `Sirf message_id`,
        `<code>(channel_id, bucket)</code>, jahan bucket ek fixed time window hai (unke case mein 10 din), taaki har partition ka size limited rahe aur "latest messages" ek ya do partitions se aa jaayein`,
        `user_id`,
        `Random UUID`
      ],
      answer: 1,
      why: `Discord ne likha ki unhone partitions ko lagbhag 100 MB se neeche rakhne ke liye time buckets choose kiye. Kimat: kisi channel ka bahut purana history padhna ho to kai buckets (partitions) query karne padte hain, jo rare hai. Sabak: wide-column DB mein partition key ka size growth pehle se socho.`
    }
  ],
  references: [
    { title: "WhatsApp blog: 1 million is so 2011", by: "WhatsApp", url: "https://blog.whatsapp.com/1-million-is-so-2011", type: "article" },
    { title: "Discord: How Discord Stores Billions of Messages (2017)", by: "Discord", url: "https://discord.com/blog/how-discord-stores-billions-of-messages", type: "article" },
    { title: "Discord: How Discord Stores Trillions of Messages (2023)", by: "Discord", url: "https://discord.com/blog/how-discord-stores-trillions-of-messages", type: "article" },
    { title: "MDN: WebSockets API", by: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", type: "docs" },
    { title: "System Design Interview Vol. 1, Ch. 12: Design a chat system", by: "Alex Xu", url: "https://bytebytego.com/", type: "book" }
  ]
});
