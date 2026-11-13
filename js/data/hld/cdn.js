// CDN aur Blob storage
registerLesson("hld", "cdn", {
  why: `Images, videos, JS/CSS bytes mein sabse bade hote hain aur sabse zyada padhe jaate hain. Inhe app servers ya DB se serve karna mehenga aur slow hai. Object storage (S3) + CDN har media-heavy design (Instagram, YouTube, Netflix) ka base hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Object (blob) storage</h2>
        <ul>
          <li>Files ko key se store karo: <code>s3://bucket/users/42/avatar.jpg</code>. Folders asli nahi, bas key ka prefix.</li>
          <li>Bahut durable (AWS S3 design: 99.999999999% = "11 nines" durability), practically unlimited, sasta per GB.</li>
          <li>DB mein file mat rakho: DB mein sirf <b>metadata</b> (url/key, size, owner, created_at).</li>
          <li><b>Upload pattern:</b> client ko <b>pre-signed URL</b> do (server signed, chhoti expiry), client seedha S3 pe upload kare. Badi file app server se guzarti hi nahi.</li>
        </ul>
        <h2>CDN (Content Delivery Network)</h2>
        <p>Duniya bhar mein <b>edge servers</b> (PoPs). User ki request sabse paas wale edge pe jaati hai. Edge ke paas copy ho (hit) to wahin se; nahi to <b>origin</b> (S3 / server) se laake cache karta hai.</p>
        `
    },
    {
      type: "flow",
      title: "CDN: miss, hit, aur pre-signed upload",
      nodes: [
        {
          id: "u1",
          label: `User 1
Chennai`,
          icon: "👤",
          x: 90,
          y: 70,
          kind: "client"
        },
        {
          id: "u2",
          label: `User 2
Chennai`,
          icon: "👤",
          x: 90,
          y: 250,
          kind: "client"
        },
        {
          id: "edge",
          label: `CDN edge
Chennai`,
          icon: "🛰️",
          x: 400,
          y: 160,
          kind: "cache"
        },
        {
          id: "s3",
          label: `S3 origin
Mumbai`,
          icon: "🪣",
          x: 750,
          y: 160,
          kind: "data"
        },
        {
          id: "api",
          label: "App API",
          icon: "🖥️",
          x: 400,
          y: 330,
          kind: "service"
        }
      ],
      edges: [
        {
          from: "u1",
          to: "edge",
          both: true
        },
        {
          from: "u2",
          to: "edge",
          both: true
        },
        {
          from: "edge",
          to: "s3",
          both: true
        },
        {
          from: "u1",
          to: "api", both: true,
          dashed: true
        },
        {
          from: "u1",
          to: "s3",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Pehli request: edge pe nahi (miss)",
          html: "<p>Edge origin (S3) se file laata hai aur TTL ke hisaab se apne paas rakh leta hai.</p>",
          path: ["u1","edge","s3","edge","u1"],
          active: ["edge","s3"]
        },
        {
          title: "Agli request: edge se hi (hit, ~10ms)",
          html: "<p>Usi shahar ka doosra user: file edge pe pehle se hai, origin tak koi request nahi.</p>",
          path: ["u2","edge","u2"],
          active: ["edge"],
          dim: ["s3"]
        },
        {
          title: "Upload: pehle pre-signed URL",
          html: "<p>Client app se upload ki permission maangta hai. App auth check karke chhoti expiry wala signed URL deta hai.</p>",
          path: ["u1","api","u1"],
          active: ["api"]
        },
        {
          title: "File seedha S3 pe",
          html: "<p>Badi file app server se guzarti hi nahi: client multipart upload seedha S3 pe karta hai. App ki bandwidth bachi.</p>",
          path: ["u1","s3"],
          active: ["s3"],
          dim: ["api"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <table>
          <tr><th>Concept</th><th>Matlab</th></tr>
          <tr><td>Cache-Control / TTL</td><td>Edge kitni der rakhe. Versioned files (<code>app.3f9a.js</code>) ko 1 saal, HTML ko chhota</td></tr>
          <tr><td>Invalidation / purge</td><td>Galat file hatao. Mehenga/slow ho sakta hai: isliye file naam mein version (cache busting)</td></tr>
          <tr><td>Pull CDN</td><td>Pehle request pe origin se laata hai (zyaadatar)</td></tr>
          <tr><td>Push CDN</td><td>Aap pehle se upload karte ho (bade, predictable files)</td></tr>
          <tr><td>Signed URLs</td><td>Private content (paid video) ke liye expiring link</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>CDN se kaunsi cheezein serve karna <b>theek</b> hai?</b></div>
          <ul class="qa-options"><li>✅ Product images<div class="small muted">Static, bahut padhi jaati hain.</div></li><li>✅ Video segments (HLS/DASH chunks)<div class="small muted">YouTube/Netflix ka core.</div></li><li>❌ User ka bank balance API response<div class="small muted">Personal + real-time. CDN pe cache = galat user ko data / stale.</div></li><li>✅ JS/CSS bundles with hash in filename<div class="small muted">Lambi TTL safe, naya version = naya naam.</div></li><li>✅ Public, sabke liye same API (top 10 trending, 30s TTL)<div class="small muted">Chhoti TTL ke saath CDN API caching bhi hoti hai.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> User 500 MB video upload karta hai. App server ke through upload karna kyun bura hai, aur better flow kya hai?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>App server ki bandwidth/memory/threads 500MB mein phasti hain</li><li><b>Pre-signed URL</b> se seedha S3 upload</li><li><b>Multipart / resumable</b> upload (chunks)</li><li>Upload complete → event → processing (transcode) queue</li></ul></div>
          <div class="qa-a"><p>App server ke through: har upload server ki bandwidth aur ek thread/connection minutes tak pakadta hai, aur fail hua to shuru se. Better: (1) client server se <b>pre-signed URL</b> maange (auth check yahan), (2) client <b>multipart upload</b> seedha S3 pe (chunks, retry sirf failed chunk), (3) S3 upload-complete event → queue → transcoding workers (YouTube lesson), (4) metadata DB mein status PROCESSING → READY.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Aapne <code>logo.png</code> update kiya par users ko purana dikh raha hai (CDN TTL 1 din). Sabse saaf long-term fix?</div>
          <div class="qa-a"><b>Jawab:</b> File naam mein version/hash (<code>logo.v2.png</code>), HTML naya naam refer kare; purge sirf emergency mein. Cache busting: naya content = naya URL, isliye purani cached copy ka sawaal hi nahi, aur lambi TTL ka fayda bhi rehta hai.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Static files, images, video segments; users door door hain; bandwidth ka kharcha bada hai.</td></tr>
          <tr><th>Kab nahi</th><td>Har response user-specific aur turant badalne wala hai, ya saare users ek hi shehar mein hain aur traffic chhota hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Per-GB kharcha, purge/invalidation mein deri, aur galat cache key se ek user ka private page doosre ko dikh sakta hai (sabse khatarnak bug).</td></tr>
          <tr><th>Alternatives</th><td>Origin ke aage apna caching proxy (Varnish/NGINX), ya kai regions mein origin servers. Files ke naam mein version/hash daalo (<code>app.3f9a.js</code>) taaki invalidation ki zaroorat hi na pade.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Netflix Open Connect: apne cache appliances ISPs ke andar free mein rakhta hai aur raat mein popular content pehle se bhar deta hai. Amazon S3 jaisa object storage CDN ka common origin hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Media wale har design mein bolo: <i>"Files object storage mein, DB mein sirf metadata, upload pre-signed URL se seedha, aur reads CDN se."</i> Ye ek line bandwidth aur scaling ke kai sawaalon ka jawab hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 8 June 2021: Fastly CDN pe ek customer ne valid configuration change kiya, jisse ek chhupa hua software bug trigger hua. Fastly ke ~85% network ne errors dene shuru kiye; Reddit, gov.uk, kai news sites kuch der ke liye gayab. Ek bade news site ke liye design sabak?`,
      options: [
        `CDN mat use karo, sab origin se do`,
        `CDN bhi single point of failure ho sakta hai; critical sites multi-CDN ya origin fallback rakhti hain (DNS/traffic steering se doosre CDN pe shift)`,
        `Cache TTL badha do`,
        `Sirf images CDN pe rakho`
      ],
      answer: 1,
      why: `Fastly ki summary ke mutabik bug May 2021 ke ek deploy mein aaya tha aur 8 June ko ek customer config se trigger hua; ~49 minute mein zyaadatar network theek ho gaya. CDN hatana to 150 Tbps jaise traffic pe namumkin hai; isliye bade platforms do CDNs rakhte hain aur DNS/traffic steering se shift kar sakte hain. Kimat: dono ke config sync rakhna aur zyada kharcha.`
    }
  ],
  references: [
    { title: "Summary of June 8 outage", by: "Fastly", url: "https://www.fastly.com/blog/summary-of-june-8-outage", type: "article" },
    { title: "Netflix Open Connect", by: "Netflix", url: "https://openconnect.netflix.com/", type: "docs" },
    {
      title: "System Design Primer: CDN",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    },
    {
      title: "Hello Interview: System Design in a Hurry",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    }
  ]
});
