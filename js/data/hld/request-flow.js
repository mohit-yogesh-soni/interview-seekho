// Browser mein URL daalne se response tak
registerLesson("hld", "request-flow", {
  why: `Har HLD design isi ek request ke safar ka bada roop hai. DNS, TCP, TLS, HTTP aur server ke andar kya hota hai ye pata ho, to aap samajh paoge ki latency kahan jaati hai aur CDN, load balancer, cache kis step ko chhota karte hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>"swiggy.com" type kiya, Enter dabaya. Ab kya?</h2>
        `
    },
    {
      type: "flow",
      title: "Ek HTTPS request ka safar",
      nodes: [
        {
          id: "browser",
          label: "Browser",
          icon: "🌐",
          x: 90,
          y: 170,
          kind: "client"
        },
        {
          id: "dns",
          label: "DNS resolver",
          icon: "📒",
          x: 330,
          y: 55,
          kind: "external"
        },
        {
          id: "cdn",
          label: "CDN edge",
          icon: "🛰️",
          x: 330,
          y: 290,
          kind: "cache"
        },
        {
          id: "lb",
          label: "Load Balancer",
          icon: "⚖️",
          x: 560,
          y: 170,
          kind: "service"
        },
        {
          id: "app",
          label: "App server",
          icon: "🖥️",
          x: 760,
          y: 170,
          kind: "service"
        },
        {
          id: "cache",
          label: "Redis cache",
          icon: "⚡",
          x: 900,
          y: 60,
          kind: "cache",
          w: 140
        },
        {
          id: "db",
          label: "Database",
          icon: "🗄️",
          x: 900,
          y: 290,
          kind: "data",
          w: 140
        }
      ],
      edges: [
        {
          from: "browser",
          to: "dns",
          both: true,
          label: "1"
        },
        {
          from: "browser",
          to: "lb",
          both: true
        },
        {
          from: "lb",
          to: "app",
          both: true
        },
        {
          from: "app",
          to: "cache",
          both: true
        },
        {
          from: "app",
          to: "db",
          both: true
        },
        {
          from: "browser",
          to: "cdn",
          both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "1. DNS lookup",
          html: `<p>Browser poochta hai: <code>swiggy.com</code> ka IP kya hai? Cache mein ho to ~0ms, warna resolver → root → .com → Swiggy ke nameserver (20-100ms).</p>`,
          path: ["browser","dns","browser"],
          active: ["dns"]
        },
        {
          title: "2. TCP + TLS handshake",
          html: `<p>Load balancer (ya CDN edge) ke saath connection: TCP (1 round trip) + TLS 1.3 (1 round trip). Server door ho to ye hi 400ms+ kha jaata hai.</p>`,
          paths: [
            ["browser","lb","browser"]
          ],
          active: ["lb"]
        },
        {
          title: "3. HTTP GET: LB → app server → cache",
          html: "<p>LB request kisi healthy app server ko deta hai. App pehle Redis dekhta hai (~1ms).</p>",
          path: ["browser","lb","app","cache"],
          active: ["app","cache"]
        },
        {
          title: "4. Cache miss → DB → response",
          html: "<p>Cache mein nahi mila to DB (~5-10ms), result cache mein daala, aur HTML wapas browser tak.</p>",
          path: ["cache","app","db","app","lb","browser"],
          active: ["db"]
        },
        {
          title: "5. CSS / JS / images CDN se",
          html: "<p>HTML parse hone ke baad static files ki requests paas wale CDN edge pe jaati hain, origin tak nahi.</p>",
          path: ["browser","cdn","browser"],
          active: ["cdn"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <table>
          <tr><th>Step</th><th>Kya hota hai</th><th>Kitna time (roughly)</th><th>Kaun chhota karta hai</th></tr>
          <tr><td><b>DNS</b></td><td>Naam → IP. Browser cache → OS cache → resolver (ISP / 8.8.8.8) → root → .com → swiggy ke nameserver</td><td>Cache hit pe ~0; miss pe 20-100ms</td><td>DNS caching (TTL)</td></tr>
          <tr><td><b>TCP</b></td><td>3-way handshake: connection banta hai</td><td>1 round trip (RTT)</td><td>Keep-alive / connection reuse, server paas (CDN edge)</td></tr>
          <tr><td><b>TLS</b></td><td>Encryption ki chaabiyaan tay</td><td>TLS 1.3: 1 RTT (1.2 mein 2)</td><td>TLS 1.3, session resumption, edge pe TLS terminate</td></tr>
          <tr><td><b>HTTP</b></td><td>Request + server ka kaam + response</td><td>Server time + 1 RTT</td><td>Cache, fast DB, CDN</td></tr>
        </table>
        <p><b>RTT</b> (round trip time) distance pe depend: Mumbai → Mumbai server ~5ms, Mumbai → US ~200ms+. Ek naya HTTPS connection = DNS + TCP + TLS = kam se kam 2-3 RTT <i>request se pehle</i>. Isliye door ke server pe pehla page itna slow lagta hai, aur isliye CDN aur connection reuse itne important hain.</p>
        <h3>HTTP basics jo design mein kaam aate hain</h3>
        <ul>
          <li><b>Methods:</b> GET (padho, safe, idempotent), POST (banao), PUT (poora replace, idempotent), PATCH (thoda badlo), DELETE (idempotent).</li>
          <li><b>Status codes:</b> 2xx success, 3xx redirect (301 permanent, 302 temporary), 4xx client galti (400, 401 unauthenticated, 403 forbidden, 404, 429 too many requests), 5xx server galti (500, 502 bad gateway, 503 unavailable, 504 gateway timeout).</li>
          <li><b>Stateless:</b> HTTP khud yaad nahi rakhta ki pichhli request kisne bheji. Login state cookie / token (JWT) se aata hai. Isi wajah se servers ko stateless rakhna aasaan hai (scaling lesson).</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🔢 <b>Naye HTTPS site pe pehli request: steps ka sahi order:</b></div>
          <ol><li>DNS lookup: domain ka IP</li><li>TCP 3-way handshake</li><li>TLS handshake (certificate verify)</li><li>HTTP GET request bheji</li><li>Load balancer ne request kisi app server ko di</li><li>App server ne cache/DB se data liya aur response bheja</li><li>Browser ne HTML parse karke CSS/JS/images ki aur requests ki</li></ol>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Kaunse status code pairs <b>sahi</b> hain?</b></div>
          <ul class="qa-options"><li>✅ Rate limit cross → <b>429</b><div class="small muted">Too Many Requests, aksar Retry-After header ke saath.</div></li><li>❌ Login nahi kiya → <b>403</b><div class="small muted">Login nahi = 401 (unauthenticated). Login hai par permission nahi = 403.</div></li><li>✅ Load balancer ko backend ne time pe jawab nahi diya → <b>504</b><div class="small muted">Gateway Timeout.</div></li><li>✅ Short URL ka redirect jo kabhi nahi badlega aur browser cache kare → <b>301</b><div class="small muted">Permanent; par analytics ke liye 302 behtar (har click server tak aaye).</div></li><li>❌ Server overload, thodi der baad try karo → <b>500</b><div class="small muted">503 Service Unavailable zyada sahi; 500 generic bug.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> India ke user ko US mein hosted site ka <b>pehla</b> page load 2 second leta hai, par agla page 300ms. Kyun? Aur pehla load kaise tez karoge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Pehli baar <b>DNS + TCP + TLS</b> handshakes (kai round trips), baad mein connection reuse</li><li>Door ka server: har RTT ~200ms+</li><li><b>CDN / edge</b> India mein: static content aur TLS paas se</li><li>Static assets cache (browser cache headers), kam requests</li><li>India region mein server / replica</li></ul></div>
          <div class="qa-a"><p>Pehli request se pehle DNS lookup + TCP handshake + TLS handshake: 3-4 round trips × ~200ms = kaafi time, phir HTML, phir CSS/JS ke liye aur requests. Agle page pe connection already khula hai (keep-alive), DNS cached, assets browser cache mein.</p><p><b>Fix:</b> CDN (India edge pe TLS terminate + static files paas se), Cache-Control headers, TLS 1.3, assets kam/compressed, aur agar dynamic data bhi zaroori ho to India region mein deployment ya read replica.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> HTTP 'stateless' hai. Phir website ko kaise pata ki aap logged-in ho?</div>
          <div class="qa-a"><b>Jawab:</b> Har request ke saath cookie (session id) ya token (jaise JWT) bheja jaata hai, server usse user pehchaanta hai. State client ke paas (token) ya shared store mein (session id → Redis). Isliye koi bhi app server request handle kar sakta hai: horizontal scaling ki neev.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "URL type karne pe kya hota hai" mein har step ke saath ek optimization bolo (DNS cache, connection reuse, CDN, LB, cache). Isse jawab sirf networking nahi, system design jaisa lagta hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 4 October 2021: Facebook, Instagram aur WhatsApp ~6 ghante down rahe. Ek maintenance command ne Facebook ka backbone network tod diya. Uske baad Facebook ke DNS servers ne apne BGP routes withdraw kar diye. Users ko "site nahi mili" kyun dikha, jabki servers chal rahe the?`,
      options: [
        `Data centers ki bijli chali gayi thi`,
        `Internet ko facebook.com ke DNS servers tak pahunchne ka raasta hi nahi mila, to naam → IP lookup fail hua aur request aage gayi hi nahi`,
        `Users ke browser cache expire ho gaye`,
        `TLS certificates expire ho gaye`
      ],
      answer: 1,
      why: `Request ka pehla kadam DNS hai. Meta ki post-mortem ke mutabik unke DNS servers design se apne BGP advertisements hata dete hain jab unhe data centers se baat karne mein dikkat ho (ek health check). Backbone toota to saare DNS servers ne ye kiya, aur duniya ke liye facebook.com ka IP dhoondhna namumkin ho gaya. Internal tools bhi isi network pe the, isliye engineers ko data centers mein physically jaana pada. Sabak: DNS aur network single point of failure ho sakte hain, aur recovery tools ko us system pe depend nahi hona chahiye jo down hai.`
    }
  ],
  references: [
    { title: "More details about the October 4 outage", by: "Meta Engineering", url: "https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/", type: "article" },
    {
      title: "System Design Primer",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    },
    {
      title: "Hello Interview: System Design in a Hurry",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    },
    {
      title: "ByteByteGo",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "course"
    }
  ]
});
