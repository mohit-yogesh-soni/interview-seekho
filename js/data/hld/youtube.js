// YouTube — evolution style
registerLesson("hld", "youtube", {
  why: `YouTube mein data ka size baaki designs se bilkul alag hai: ek request kuch bytes ki nahi, <b>MBs aur GBs</b> ki hai. Isliye yahan har decision bandwidth, CPU (transcoding) aur kharche se chalta hai. Hum "server pe file rakh do aur stream karo" se shuru karenge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> video upload, video dekhna (har device aur har network pe), title/description/views/likes. (Comments, search, recommendations: out of scope, naam le do.)</li>
          <li><b>Non-functional:</b> video jaldi shuru ho (~1-2 s), beech mein ruke nahi (buffering), uploaded video kabhi khoye nahi. Upload ke baad video ready hone mein kuch minute chalega.</li>
        </ul>
        <pre class="code-static">Ek saath dekhne wale (peak): maan lo 5 crore
Average bitrate ~3 Mbps (HD)
Bandwidth = 5 crore × 3 Mbps = 15 crore Mbps = 150 Tbps (!)
Uploads: har minute saikdon ghante ka video (YouTube ke public numbers is order ke hain)</pre>
        <p><b>150 Tbps</b> wala number poora design decide karega: itna data kisi ek data center se bahar nikalna practically namumkin aur bahut mehenga hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple: app server pe file</h2>
        <p>Upload = app server file ko apni disk pe save kare, Postgres mein row (<code>id, title, path</code>). Watch = app server wahi file bytes stream kare. College project ke liye theek hai.</p>
        <h3>Kya toota?</h3>
        <ul>
          <li><b>Disk:</b> ek server ki disk kuch TB; videos petabytes mein. Server gira to uske videos gaye.</li>
          <li><b>App servers busy:</b> 2 GB upload ek request thread ko minutes tak pakde rakhta hai. Do-teen bade uploads aur API slow.</li>
          <li><b>Format:</b> phone ne 4K HEVC file bheji. Purana Android ya 2G network wala user use chala hi nahi sakta.</li>
          <li><b>Bandwidth:</b> 150 Tbps ek server/data center se nahi.</li>
        </ul>
        <p>Har problem ka alag hal hai. Ek ek karke.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: files ko blob storage mein, metadata alag</h2>
        <table>
          <tr><th>Video bytes kahan</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>App server disk</td><td>Simple</td><td>Upar wali problems</td></tr>
          <tr><td>Database BLOB column</td><td>Ek hi jagah sab</td><td>DB backups/replication GBs files se bhar jaate hain; DB is kaam ke liye mehenga</td></tr>
          <tr><td>NFS / shared file server</td><td>Sab servers dekh sakte hain</td><td>Khud scale aur backup karna; ek limit tak</td></tr>
          <tr><td><b>Object / blob storage</b> (S3, GCS) ⭐</td><td>Lagbhag unlimited, khud replicate karta hai (S3 ka design 11 nines durability), sasta per GB, HTTP se padho</td><td>File "edit" nahi hoti, poori nayi likhi jaati hai (video ke liye theek)</td></tr>
        </table>
        <p><b>Upload app server se mat guzaaro:</b> app server ek <b>pre-signed URL</b> deta hai (kuch minute ke liye valid, sirf us ek file ke liye permission), aur phone seedha S3 mein upload karta hai. Bade files <b>multipart/resumable</b> upload se (chunks mein; network toota to wahin se continue). App server sirf metadata sambhalta hai.</p>
        <p><b>Metadata (title, owner, status, views):</b> chhota, relational (user → videos), aur har page pe padha jaata hai. MySQL/Postgres + Redis cache. Video bytes aur metadata ki zaroorat bilkul alag hai, isliye store bhi alag.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: har device pe chale: transcoding pipeline</h2>
        <p><b>Problem:</b> upload ki gayi file ek hi resolution aur codec mein hai. Player ko chahiye: kai qualities (240p, 360p, 720p, 1080p, 4K) aur video chhote <b>segments</b> mein (2-10 second ke tukde).</p>
        <p><b>Segments kyun?</b> <b>Adaptive bitrate streaming</b> (HLS / MPEG-DASH): player har segment ke liye network dekh ke quality chunta hai. Metro mein train tunnel mein gayi, agla segment 360p mein; bahar aayi, phir 1080p. Video rukta nahi, bas thodi der dhundhla hota hai. Ek manifest file batati hai kaunsi qualities aur segments hain.</p>
        <p><b>Transcoding bhaari hai:</b> ek ghante ka 4K video saari qualities mein badalne mein bahut CPU lagta hai. Upload request mein ye nahi ho sakta.</p>
        <table>
          <tr><th>Option</th><th>Kami</th></tr>
          <tr><td>Upload request ke andar transcode</td><td>Request timeout; app server CPU full</td></tr>
          <tr><td>Cron job jo har 5 min nayi files dhoondhe</td><td>Deri, aur failures/retries ka hisaab khud</td></tr>
          <tr><td><b>Queue + transcoding workers</b> ⭐</td><td>Naya component, par: upload hote hi event; workers apni speed se; fail hua to retry; spike pe queue jama, workers badhao</td></tr>
        </table>
        <p><b>Speed ke liye parallel:</b> video ko pehle tukdon mein kaato, har tukda alag worker transcode kare, phir jodo. Ek ghante ka video ek worker pe ghanton, sau workers pe minutes. (Steps ek <b>DAG</b> banate hain: split → transcode qualities → thumbnails → manifest → "ready" mark.)</p>
        <p>Video ka status metadata DB mein: <code>uploading → processing → ready / failed</code>. Uploader ko "processing" dikhta hai.</p>`
    },
    {
      type: "flow",
      title: "Upload: pre-signed URL → S3 → queue → workers → ready",
      nodes: [
        { id: "c", label: "Creator", icon: "🎥", x: 80, y: 170, kind: "client", w: 120 },
        { id: "api", label: "Upload API", icon: "🖥️", x: 280, y: 60, kind: "service", w: 150 },
        { id: "meta", label: "Metadata DB\n(MySQL)", icon: "🗄️", x: 280, y: 290, kind: "data", w: 160 },
        { id: "raw", label: "S3: raw file", icon: "🪣", x: 510, y: 170, kind: "data", w: 150 },
        { id: "q", label: "Queue: transcode", icon: "📨", x: 720, y: 60, kind: "queue", w: 180 },
        { id: "w", label: "Transcode workers\n(parallel chunks)", icon: "⚙️", x: 720, y: 290, kind: "service", w: 190 },
        { id: "out", label: "S3: segments\n240p…4K", icon: "🎞️", x: 920, y: 170, kind: "data", w: 140 }
      ],
      edges: [
        { from: "c", to: "api", both: true },
        { from: "c", to: "raw" },
        { from: "api", to: "meta", both: true },
        { from: "raw", to: "q" },
        { from: "q", to: "w" },
        { from: "w", to: "out" },
        { from: "w", to: "meta", dashed: true }
      ],
      steps: [
        { title: "Pre-signed URL lo", html: "<p>API metadata row banata hai (status = uploading) aur ek pre-signed URL deta hai.</p>", path: ["c", "api", "meta", "api", "c"], active: ["meta"] },
        { title: "Seedha S3 mein upload", html: "<p>GBs ka data app server se nahi guzarta. Upload complete hone pe S3 event queue mein.</p>", path: ["c", "raw", "q"], active: ["raw", "q"] },
        { title: "Workers transcode → ready", html: "<p>Chunks parallel mein har quality mein; segments + manifest S3 mein; status = ready.</p>", paths: [["q", "w", "out"], ["w", "meta"]], active: ["w", "out"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: 150 Tbps: CDN</h2>
        <p>Ab har video segments mein S3 mein hai. Par saare viewers S3 (ek region) se padhein to wahi 150 Tbps ki problem, aur door ke users ke liye har segment pe 200+ ms.</p>
        <p><b>CDN</b> (Content Delivery Network) = duniya bhar mein shehron/ISPs ke paas rakhe cache servers. Pehla viewer jo segment maange, CDN origin (S3) se laata hai aur rakh leta hai; agle hazaar viewers paas ke CDN server se lete hain. Video segments kabhi badalte nahi, isliye ye cache karne ke liye perfect data hai.</p>
        <table>
          <tr><th>Video type</th><th>Kahan se</th><th>Kyun</th></tr>
          <tr><td>Viral / naye popular videos</td><td>Edge CDN (paas ka)</td><td>Thode videos zyaadatar views laate hain: high hit ratio</td></tr>
          <tr><td>Long tail (purane, kam dekhe gaye)</td><td>Regional cache ya origin</td><td>Har edge pe sab rakhna mehenga; kam views ke liye thodi deri chalegi</td></tr>
        </table>
        <p><b>Alternative:</b> sirf third-party CDN (Akamai, Cloudflare, CloudFront) ya apna CDN. Bahut bade video platforms apne servers seedha ISPs ke andar rakhte hain (neeche dekho), kyunki is scale pe bandwidth sabse bada kharcha hai.</p>
        <h3>View count</h3>
        <p>Viral video pe ek row pe hazaaron <code>UPDATE views = views + 1</code>/s = hot row (URL shortener ke clicks jaisa). Isliye view event Kafka pe, consumer har minute aggregate karke likhe. Count thodi der se update ho to chalta hai. Fake views ki filtering bhi isi pipeline mein.</p>
        <h3>Metadata scale</h3>
        <p>Arbon videos ki metadata ek MySQL mein nahi aati: video_id se <b>sharding</b>, aur hot metadata Redis/CDN pe cache.</p>`
    },
    {
      type: "flow",
      title: "Watch: manifest → CDN edge (hit) / origin (miss), quality badalti hai",
      nodes: [
        { id: "v", label: "Viewer (player)", icon: "📺", x: 100, y: 170, kind: "client", w: 160 },
        { id: "api", label: "Watch API", icon: "🖥️", x: 340, y: 60, kind: "service", w: 150 },
        { id: "mc", label: "Metadata cache", icon: "⚡", x: 340, y: 290, kind: "cache", w: 170 },
        { id: "edge", label: "CDN edge\n(shehar / ISP)", icon: "🌍", x: 620, y: 170, kind: "cache", w: 170 },
        { id: "s3", label: "Origin: S3\nsegments", icon: "🎞️", x: 880, y: 170, kind: "data", w: 160 },
        { id: "k", label: "Kafka: views", icon: "📨", x: 620, y: 330, kind: "queue", w: 160 }
      ],
      edges: [
        { from: "v", to: "api", both: true },
        { from: "api", to: "mc", both: true },
        { from: "v", to: "edge", both: true },
        { from: "edge", to: "s3", both: true, dashed: true },
        { from: "api", to: "k", dashed: true }
      ],
      steps: [
        { title: "Manifest + metadata", html: "<p>Title, qualities aur segment URLs (CDN ke). View event Kafka pe.</p>", paths: [["v", "api", "mc", "api", "v"], ["api", "k"]], active: ["mc"] },
        { title: "Segments CDN se (hit)", html: "<p>Popular video: paas ka edge seedha deta hai. Origin tak nahi gaya.</p>", path: ["v", "edge", "v"], active: ["edge"], dim: ["s3"] },
        { title: "Long tail: miss → origin", html: "<p>Edge pe nahi: origin se laaya, rakh liya, diya.</p>", path: ["v", "edge", "s3", "edge", "v"], active: ["s3"] },
        { title: "Network slow → 360p", html: "<p>Player ne bandwidth girti dekhi: agla segment kam quality ka. Video rukta nahi.</p>", path: ["v", "edge", "v"], active: ["v"], color: "#e8590c" }
      ]
    },
    {
      type: "text",
      html: `
        <div class="tip-box">🏭 <b>Production mein:</b>
          <ul>
            <li><b>Vitess</b> 2010 mein YouTube pe banaya gaya tha, kyunki unka MySQL scale nahi ho raha tha (pehle replicas, phir manual sharding). Vitess MySQL ke aage ek routing layer hai jo sharding chhupata hai; ab ye CNCF project hai.</li>
            <li><b>Netflix Open Connect</b>: Netflix apne cache appliances ISPs ke andar aur internet exchange points pe free mein rakhta hai, aur raat mein (kam traffic pe) popular content pehle se bhar deta hai. Google ka bhi aisa program hai (Google Global Cache), jo YouTube jaisa content ISPs ke paas se deta hai.</li>
            <li>HLS (Apple) aur MPEG-DASH adaptive streaming ke standard formats hain.</li>
          </ul>
        </div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>2</td><td>Petabytes, durability</td><td>Blob storage (S3)</td><td>DB BLOB: DB bloat; disk: single machine</td></tr>
          <tr><td>2</td><td>GB uploads app servers ko rokte</td><td>Pre-signed URL + resumable upload</td><td>App server se proxy: threads blocked</td></tr>
          <tr><td>3</td><td>Har device/network</td><td>Transcode → kai qualities + segments (HLS/DASH)</td><td>Ek file: slow network pe buffering</td></tr>
          <tr><td>3</td><td>Transcoding bhaari</td><td>Queue + parallel workers</td><td>Upload ke andar sync: timeout</td></tr>
          <tr><td>4</td><td>150 Tbps</td><td>CDN (edge + origin)</td><td>Sab origin se: namumkin aur mehenga</td></tr>
          <tr><td>4</td><td>Hot view counter</td><td>Kafka + aggregate</td><td>Har view pe UPDATE</td></tr>
          <tr><td>4</td><td>Metadata badhi</td><td>Sharded MySQL (Vitess jaisa) + cache</td><td>-</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Bandwidth ka number (150 Tbps) jaldi nikaalo: wo CDN ko justify karta hai. Phir upload path (pre-signed URL, queue, parallel transcoding) aur watch path (manifest, adaptive bitrate, CDN) alag alag draw karo.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> December 2014: PSY ka "Gangnam Style" video YouTube pe 2,147,483,647 views ke paas pahuncha. YouTube ne bataya ki unhe view counter upgrade karna pada. Kyun?`,
      options: [
        `Video delete hone wala tha`,
        `Counter signed 32-bit integer tha, jiski max value 2³¹ − 1 = 2,147,483,647 hai; isse aage overflow hota, isliye 64-bit counter kiya`,
        `CDN ka bandwidth khatam ho gaya`,
        `Database disk bhar gayi`
      ],
      answer: 1,
      why: `Ye ek seedha estimation lesson hai: "kitna bada ho sakta hai?" Kisi bhi counter, id ya size ke liye data type chunte waqt growth ka worst case socho. 64-bit signed max ~9.2 × 10¹⁸ hai. Isi tarah Snowflake/URL shortener ke IDs 64-bit hote hain.`
    }
  ],
  references: [
    { title: "Vitess docs: History", by: "Vitess", url: "https://vitess.io/docs/archive/13.0/overview/history/", type: "docs" },
    { title: "Netflix Open Connect", by: "Netflix", url: "https://openconnect.netflix.com/", type: "docs" },
    { title: "Amazon S3: presigned URLs", by: "AWS", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html", type: "docs" },
    { title: "System Design Interview Vol. 1, Ch. 14: Design YouTube", by: "Alex Xu", url: "https://bytebytego.com/", type: "book" }
  ]
});
