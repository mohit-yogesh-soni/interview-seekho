// HLD ke ASCII diagrams ki jagah animated "flow" blocks. tools/apply-flows.mjs isse use karta hai.
// match = pre.diagram ke andar ka unique text. mode "split" = text block ko diagram ki jagah se todo.
// mode "after" = diagram (think answer mein) hatao aur flow ko block id ke baad daalo.

const N = (id, label, icon, x, y, kind = "service", extra = {}) => ({ id, label, icon, x, y, kind, ...extra });

export default [
  {
    file: "request-flow", match: "Browser ──1. DNS", mode: "split",
    flow: {
      type: "flow", title: "Ek HTTPS request ka safar",
      nodes: [
        N("browser", "Browser", "🌐", 90, 170, "client"),
        N("dns", "DNS resolver", "📒", 330, 55, "external"),
        N("cdn", "CDN edge", "🛰️", 330, 290, "cache"),
        N("lb", "Load Balancer", "⚖️", 560, 170),
        N("app", "App server", "🖥️", 760, 170),
        N("cache", "Redis cache", "⚡", 900, 60, "cache", { w: 140 }),
        N("db", "Database", "🗄️", 900, 290, "data", { w: 140 })
      ],
      edges: [
        { from: "browser", to: "dns", both: true, label: "1" }, { from: "browser", to: "lb", both: true },
        { from: "lb", to: "app", both: true }, { from: "app", to: "cache", both: true }, { from: "app", to: "db", both: true },
        { from: "browser", to: "cdn", both: true, dashed: true }
      ],
      steps: [
        { title: "1. DNS lookup", html: "<p>Browser poochta hai: <code>swiggy.com</code> ka IP kya hai? Cache mein ho to ~0ms, warna resolver → root → .com → Swiggy ke nameserver (20-100ms).</p>", path: ["browser", "dns", "browser"], active: ["dns"] },
        { title: "2. TCP + TLS handshake", html: "<p>Load balancer (ya CDN edge) ke saath connection: TCP (1 round trip) + TLS 1.3 (1 round trip). Server door ho to ye hi 400ms+ kha jaata hai.</p>", paths: [["browser", "lb", "browser"]], active: ["lb"] },
        { title: "3. HTTP GET: LB → app server → cache", html: "<p>LB request kisi healthy app server ko deta hai. App pehle Redis dekhta hai (~1ms).</p>", path: ["browser", "lb", "app", "cache"], active: ["app", "cache"] },
        { title: "4. Cache miss → DB → response", html: "<p>Cache mein nahi mila to DB (~5-10ms), result cache mein daala, aur HTML wapas browser tak.</p>", path: ["cache", "app", "db", "app", "lb", "browser"], active: ["db"] },
        { title: "5. CSS / JS / images CDN se", html: "<p>HTML parse hone ke baad static files ki requests paas wale CDN edge pe jaati hain, origin tak nahi.</p>", path: ["browser", "cdn", "browser"], active: ["cdn"] }
      ]
    }
  },
  {
    file: "scaling", match: "Stateful (bura)", mode: "split",
    flow: {
      type: "flow", title: "Stateful vs stateless servers",
      nodes: [
        N("user", "User", "👤", 90, 160, "client"),
        N("lb", "Load Balancer", "⚖️", 300, 160),
        N("a", "Server A", "🖥️", 530, 50), N("b", "Server B", "🖥️", 530, 160), N("c", "Server C", "🖥️", 530, 270),
        N("redis", "Redis", "⚡", 800, 100, "cache", { label: "Redis\nsessions" }),
        N("db", "Database", "🗄️", 800, 230, "data")
      ],
      edges: [
        { from: "user", to: "lb" }, { from: "lb", to: "a" }, { from: "lb", to: "b" }, { from: "lb", to: "c" },
        { from: "a", to: "redis", dashed: true }, { from: "b", to: "redis", dashed: true }, { from: "c", to: "redis", dashed: true },
        { from: "b", to: "db", dashed: true }, { from: "c", to: "db", dashed: true }, { from: "a", to: "db", dashed: true }
      ],
      steps: [
        { title: "Stateful: session Server A ki RAM mein", html: "<p>Login ke baad session sirf A ke paas. LB ko har request A pe hi bhejni padti hai (sticky sessions).</p>", path: ["user", "lb", "a"], active: ["a"], dim: ["redis"] },
        { title: "Server A gira → user logged out", html: "<p>A crash hua, uske saath session bhi gaya. Naye servers jodne se bhi purane users ko fayda nahi.</p>", path: ["user", "lb", "b"], fail: ["a"], dim: ["redis"] },
        { title: "Stateless: session Redis mein", html: "<p>Server request ke beech kuch yaad nahi rakhta. Session id se kisi bhi server ko Redis se session mil jaata hai.</p>", path: ["user", "lb", "b", "redis"], active: ["b", "redis"] },
        { title: "Agli request kisi bhi server pe", html: "<p>LB ne C ko diya, C ko bhi wahi session mil gaya. Ab servers jodna/hatana (autoscaling) free hai.</p>", path: ["user", "lb", "c", "redis"], active: ["c", "redis"] },
        { title: "Ek server gira, koi farak nahi", html: "<p>A down: LB health check se usko hata deta hai, baaki servers chalte rehte hain.</p>", paths: [["user", "lb", "b"], ["user", "lb", "c"]], fail: ["a"] }
      ]
    }
  },
  {
    file: "caching", match: "Browser cache ─► CDN", mode: "split",
    flow: {
      type: "flow", title: "Cache-aside, update aur stampede",
      nodes: [
        N("client", "Clients", "👥", 90, 160, "client"),
        N("app1", "App 1", "🖥️", 320, 50), N("app2", "App 2", "🖥️", 320, 160), N("app3", "App 3", "🖥️", 320, 270),
        N("redis", "Redis", "⚡", 620, 100, "cache"),
        N("db", "Database", "🗄️", 620, 250, "data"),
        N("cdn", "CDN / browser\ncache", "🛰️", 880, 160, "cache", { w: 170, label: "CDN + browser\nstatic files" })
      ],
      edges: [
        { from: "client", to: "app1" }, { from: "client", to: "app2" }, { from: "client", to: "app3" },
        { from: "app1", to: "redis", both: true }, { from: "app2", to: "redis", both: true }, { from: "app3", to: "redis", both: true },
        { from: "app1", to: "db", both: true, dashed: true }, { from: "app2", to: "db", both: true, dashed: true }, { from: "app3", to: "db", both: true, dashed: true }
      ],
      steps: [
        { title: "Cache hit (~1ms)", html: "<p>App pehle Redis se poochta hai. Mil gaya to DB tak jaane ki zaroorat nahi.</p>", path: ["client", "app2", "redis", "app2", "client"], active: ["redis"], dim: ["db"] },
        { title: "Cache miss: DB se laao, cache mein daalo", html: "<p>Redis mein nahi: DB se padho (~5-10ms), phir Redis mein TTL ke saath set karo, taaki agli baar hit ho.</p>", path: ["app2", "redis", "app2", "db", "app2", "redis"], active: ["db", "redis"] },
        { title: "Update: DB update, phir cache key DELETE", html: "<p>Naya price DB mein likha, phir cache se key hata di (set nahi). Agla read DB se fresh value laayega.</p>", path: ["app1", "db", "app1", "redis"], active: ["db"] },
        { title: "Stampede: hot key expire hui", html: "<p>Trending product ki key expire hui aur hazaaron requests ek saath miss hui: sab DB pe toot padi.</p>", paths: [["app1", "db"], ["app2", "db"], ["app3", "db"]], fail: ["db"], color: "#c92a2a" },
        { title: "Fix: single-flight / lock", html: "<p>Sirf ek request DB jaati hai (lock / single-flight), baaki uske result ka wait karti hain ya thoda purana value lauta deti hain. TTL mein jitter bhi.</p>", paths: [["app1", "db", "app1", "redis"], ["app2", "redis"], ["app3", "redis"]], active: ["redis"] },
        { title: "Static content: CDN aur browser cache", html: "<p>Images, JS, CSS app tak aate hi nahi: CDN aur browser cache se. App cache (Redis) sirf dynamic data ke liye.</p>", path: ["client", "cdn", "client"], active: ["cdn"], dim: ["app1", "app2", "app3", "redis", "db"] }
      ]
    }
  },
  {
    file: "cdn", match: "User (Chennai)", mode: "split",
    flow: {
      type: "flow", title: "CDN: miss, hit, aur pre-signed upload",
      nodes: [
        N("u1", "User 1", "👤", 90, 70, "client", { label: "User 1\nChennai" }),
        N("u2", "User 2", "👤", 90, 250, "client", { label: "User 2\nChennai" }),
        N("edge", "CDN edge", "🛰️", 400, 160, "cache", { label: "CDN edge\nChennai" }),
        N("s3", "S3 origin", "🪣", 750, 160, "data", { label: "S3 origin\nMumbai" }),
        N("api", "App API", "🖥️", 750, 290)
      ],
      edges: [
        { from: "u1", to: "edge", both: true }, { from: "u2", to: "edge", both: true }, { from: "edge", to: "s3", both: true },
        { from: "u1", to: "api", dashed: true }, { from: "u1", to: "s3", dashed: true }
      ],
      steps: [
        { title: "Pehli request: edge pe nahi (miss)", html: "<p>Edge origin (S3) se file laata hai aur TTL ke hisaab se apne paas rakh leta hai.</p>", path: ["u1", "edge", "s3", "edge", "u1"], active: ["edge", "s3"] },
        { title: "Agli request: edge se hi (hit, ~10ms)", html: "<p>Usi shahar ka doosra user: file edge pe pehle se hai, origin tak koi request nahi.</p>", path: ["u2", "edge", "u2"], active: ["edge"], dim: ["s3"] },
        { title: "Upload: pehle pre-signed URL", html: "<p>Client app se upload ki permission maangta hai. App auth check karke chhoti expiry wala signed URL deta hai.</p>", path: ["u1", "api", "u1"], active: ["api"] },
        { title: "File seedha S3 pe", html: "<p>Badi file app server se guzarti hi nahi: client multipart upload seedha S3 pe karta hai. App ki bandwidth bachi.</p>", path: ["u1", "s3"], active: ["s3"], dim: ["api"] }
      ]
    }
  },
  {
    file: "api-gateway", match: "Mobile / Web ─► API Gateway", mode: "split",
    flow: {
      type: "flow", title: "API Gateway: routing, policy aur aggregation",
      nodes: [
        N("mobile", "Mobile app", "📱", 90, 90, "client"), N("web", "Web", "💻", 90, 240, "client"),
        N("gw", "API Gateway", "🚪", 380, 165, "service", { label: "API Gateway\nauth · rate limit · trace" , w: 190}),
        N("users", "User svc", "👤", 720, 50), N("orders", "Order svc", "📦", 720, 165), N("pay", "Payment svc", "💳", 720, 280)
      ],
      edges: [
        { from: "mobile", to: "gw" }, { from: "web", to: "gw" },
        { from: "gw", to: "users" }, { from: "gw", to: "orders" }, { from: "gw", to: "pay" }
      ],
      steps: [
        { title: "Routing by path", html: "<p><code>/orders/*</code> wali request gateway Order service ko bhejta hai. Client ko services ke address pata hi nahi.</p>", path: ["web", "gw", "orders"], active: ["gw", "orders"] },
        { title: "Token galat → gateway pe hi 401", html: "<p>JWT verify gateway pe hota hai. Galat token wali request services tak pahunchti hi nahi.</p>", path: ["mobile", "gw", "mobile"], fail: ["gw"], dim: ["users", "orders", "pay"] },
        { title: "Rate limit cross → 429", html: "<p>Per user / API key limits gateway pe (shared Redis counters). Services ko overload se bachaya.</p>", path: ["web", "gw", "web"], active: ["gw"], dim: ["users", "orders", "pay"] },
        { title: "BFF aggregation: ek call, teen services", html: "<p>Mobile home screen ke liye gateway server-side pe teen calls <b>parallel</b> karta hai aur ek combined response deta hai.</p>", paths: [["mobile", "gw", "users"], ["mobile", "gw", "orders"], ["mobile", "gw", "pay"]], active: ["gw"] }
      ]
    }
  },
  {
    file: "replication", match: "Writes ─► Primary", mode: "split",
    flow: {
      type: "flow", title: "Leader-follower replication aur lag",
      nodes: [
        N("app", "App", "🖥️", 110, 160),
        N("primary", "Primary", "👑", 430, 160, "data"),
        N("r1", "Replica 1", "📖", 780, 70, "data"), N("r2", "Replica 2", "📖", 780, 250, "data")
      ],
      edges: [
        { from: "app", to: "primary", label: "writes" }, { from: "primary", to: "r1", dashed: true, label: "log" }, { from: "primary", to: "r2", dashed: true, label: "log" },
        { from: "app", to: "r1", dashed: true }, { from: "app", to: "r2", dashed: true }
      ],
      steps: [
        { title: "Write sirf primary pe", html: "<p>Saare inserts/updates primary pe. Primary commit karke turant jawab de deta hai (async replication).</p>", path: ["app", "primary", "app"], active: ["primary"] },
        { title: "Primary log replicas ko bhejta hai", html: "<p>WAL / binlog ke changes thodi der (ms se seconds) mein replicas tak pahunchte hain.</p>", paths: [["primary", "r1"], ["primary", "r2"]], active: ["r1", "r2"] },
        { title: "Reads replicas se (read scaling)", html: "<p>Zyaadatar reads replicas pe: primary ka load kam. Replicas jodne se reads scale hote hain, writes nahi.</p>", paths: [["app", "r1", "app"], ["app", "r2", "app"]], active: ["r1", "r2"] },
        { title: "Replication lag bug", html: "<p>User ne comment likha (primary), turant refresh kiya aur read <b>Replica 2</b> pe gaya jo abhi peeche hai: comment gayab! Fix: read-your-writes (apne recent writes ke baad primary se padho).</p>", path: ["app", "primary", "app", "r2", "app"], fail: ["r2"] },
        { title: "Primary crash → replica promote", html: "<p>Failover: Replica 1 naya primary. Async replication mein aakhri kuch writes jo replica tak nahi pahunche the, kho sakte hain.</p>", path: ["app", "r1"], fail: ["primary"], active: ["r1"] }
      ]
    }
  },
  {
    file: "sharding", match: "N3 ●", mode: "split",
    flow: {
      type: "flow", title: "Consistent hashing ring: node jodne pe sirf ek hissa hilta hai",
      height: 420,
      nodes: [
        N("n1", "Node A", "🗄️", 500, 45, "data", { w: 120, h: 50 }),
        N("n2", "Node B", "🗄️", 830, 290, "data", { w: 120, h: 50 }),
        N("n3", "Node C", "🗄️", 170, 290, "data", { w: 120, h: 50 }),
        N("n4", "Node D (naya)", "🆕", 800, 110, "data", { w: 150, h: 50 }),
        N("k1", "key: user42", "🔑", 680, 50, "client", { w: 130, h: 40 }),
        N("k2", "key: order9", "🔑", 650, 380, "client", { w: 130, h: 40 }),
        N("k3", "key: cart7", "🔑", 210, 120, "client", { w: 130, h: 40 }),
        N("ring", "hash ring (0 … 2³²)", "⭕", 500, 220, "external", { w: 200, h: 50 })
      ],
      edges: [
        { from: "n1", to: "n4", dashed: true }, { from: "n4", to: "n2", dashed: true }, { from: "n2", to: "n3", dashed: true }, { from: "n3", to: "n1", dashed: true }
      ],
      steps: [
        { title: "Har key apne clockwise agle node pe", html: "<p>Keys aur nodes dono ko hash karke ring pe rakha. <code>user42</code> ke baad clockwise pehla node B hai (abhi D nahi hai).</p>", paths: [["k1", "n2"], ["k2", "n3"], ["k3", "n1"]], dim: ["n4"] },
        { title: "Naya Node D aaya", html: "<p>D ring pe A aur B ke beech baitha. Sirf A→D wale arc ki keys (jaise <code>user42</code>) ab D pe jaayengi.</p>", path: ["k1", "n4"], active: ["n4"] },
        { title: "Baaki keys apni jagah", html: "<p><code>order9</code> aur <code>cart7</code> ka node nahi badla. Modulo hashing (<code>hash % N</code>) mein N badalne pe lagbhag saari keys hil jaati.</p>", paths: [["k2", "n3"], ["k3", "n1"]], active: ["n3", "n1"] },
        { title: "Node B gira", html: "<p>B ki keys clockwise agle node pe chali jaati hain. Virtual nodes (har node ring pe 100+ jagah) ki wajah se ye load ek padosi pe nahi, sab mein bant-ta hai.</p>", path: ["k1", "n4"], fail: ["n2"] }
      ]
    }
  },
  {
    file: "cap", match: "Mumbai node ──✂", mode: "split",
    flow: {
      type: "flow", title: "Network partition: consistency ya availability?",
      nodes: [
        N("u1", "User (Mumbai)", "👤", 90, 160, "client", { w: 160 }),
        N("m", "Mumbai node", "🗄️", 330, 160, "data", { w: 160 }),
        N("net", "Network link", "🔗", 550, 160, "external", { w: 150 }),
        N("d", "Delhi node", "🗄️", 770, 160, "data", { w: 160 }),
        N("u2", "User (Delhi)", "👤", 770, 290, "client", { w: 160 })
      ],
      edges: [{ from: "u1", to: "m" }, { from: "m", to: "net", both: true }, { from: "net", to: "d", both: true }, { from: "u2", to: "d", both: true }],
      steps: [
        { title: "Normal: write replicate hota hai", html: "<p>Mumbai mein balance update hua aur Delhi tak replicate. Dono jagah same value.</p>", path: ["u1", "m", "net", "d"], active: ["m", "d"] },
        { title: "Partition: link toot gaya", html: "<p>Mumbai ka naya write Delhi tak nahi pahunch sakta. Ab Delhi wala user balance padhta hai...</p>", path: ["u1", "m", "net"], fail: ["net"] },
        { title: "CP choice: error / wait", html: "<p>Delhi bolta hai \"abhi pakka nahi bata sakta\" (error ya timeout). Galat data kabhi nahi, par service unavailable. Payments, bookings ke liye.</p>", path: ["u2", "d", "u2"], fail: ["net"], active: ["d"], color: "#1971c2" },
        { title: "AP choice: purana data", html: "<p>Delhi apna (thoda purana) value de deta hai. Service chalti rahi, par stale. Likes, feed, catalog ke liye theek. Link wapas aane pe sync.</p>", path: ["u2", "d", "u2"], fail: ["net"], active: ["d"], color: "#2b8a3e" }
      ]
    }
  },
  {
    file: "message-queue", match: "Sync:  Order API", mode: "split",
    flow: {
      type: "flow", title: "Sync chain vs queue",
      nodes: [
        N("user", "User", "👤", 80, 160, "client", { w: 120 }),
        N("api", "Order API", "📦", 270, 160),
        N("q", "Queue / Kafka", "📨", 500, 160, "queue"),
        N("email", "Email worker", "✉️", 780, 50), N("sms", "SMS worker", "📱", 780, 160), N("an", "Analytics", "📊", 780, 270),
        N("dlq", "Dead letter\nqueue", "🪦", 500, 300, "queue", { label: "Dead letter\nqueue" })
      ],
      edges: [
        { from: "user", to: "api", both: true }, { from: "api", to: "q" },
        { from: "q", to: "email" }, { from: "q", to: "sms" }, { from: "q", to: "an" },
        { from: "email", to: "dlq", dashed: true }
      ],
      steps: [
        { title: "Bina queue: sab sync chain mein", html: "<p>Order API khud email (2s), SMS (1s), analytics call karti hai. User 3s+ wait karta hai, aur email service down = order fail.</p>", path: ["user", "api", "email", "sms", "an"], dim: ["q", "dlq"] },
        { title: "Queue ke saath: turant 200 OK", html: "<p>API sirf event queue mein daalti hai (~5ms) aur user ko jawab de deti hai.</p>", path: ["user", "api", "q", "api", "user"], active: ["q"] },
        { title: "Consumers apni speed se", html: "<p>Har consumer apne time pe event padhta hai. Spike aaye to queue buffer karti hai.</p>", paths: [["q", "email"], ["q", "sms"], ["q", "an"]], active: ["email", "sms", "an"] },
        { title: "Email worker fail → retry → DLQ", html: "<p>Message ack nahi hua to dobara milega (at-least-once, isliye consumer idempotent). N retries ke baad dead letter queue mein, taaki line na ruke.</p>", path: ["q", "email", "dlq"], fail: ["email"] }
      ]
    }
  },
  {
    file: "search", match: "App ──write──► Postgres", mode: "split",
    flow: {
      type: "flow", title: "DB source of truth, Elasticsearch search ke liye",
      nodes: [
        N("app", "App", "🖥️", 100, 160),
        N("pg", "Postgres", "🗄️", 350, 60, "data", { label: "Postgres\n(source of truth)", w: 170 }),
        N("cdc", "CDC / Kafka", "📨", 620, 60, "queue"),
        N("idx", "Indexer", "⚙️", 860, 60),
        N("es", "Elasticsearch", "🔍", 620, 260, "data", { w: 170 }),
        N("cache", "Product cache", "⚡", 350, 260, "cache", { w: 160 })
      ],
      edges: [
        { from: "app", to: "pg" }, { from: "pg", to: "cdc" }, { from: "cdc", to: "idx" }, { from: "idx", to: "es" },
        { from: "app", to: "es", both: true, dashed: true }, { from: "app", to: "cache", both: true, dashed: true }
      ],
      steps: [
        { title: "Write: sirf DB mein", html: "<p>Naya product Postgres mein save. App Elasticsearch mein seedha nahi likhta (do jagah likhna = inconsistency).</p>", path: ["app", "pg"], active: ["pg"] },
        { title: "Change event se index update", html: "<p>CDC (Debezium) DB ke change ko Kafka pe bhejta hai, indexer use ES mein index karta hai. ~1-2 second ki der (eventual).</p>", path: ["pg", "cdc", "idx", "es"], active: ["es"] },
        { title: "Search ES se, details cache/DB se", html: "<p>Query ES pe: matching product ids relevance order mein. Phir ids ki details cache se.</p>", path: ["app", "es", "app", "cache", "app"], active: ["es", "cache"] }
      ]
    }
  },
  {
    file: "realtime", match: "User A ══ws══►", mode: "split",
    flow: {
      type: "flow", title: "WebSocket servers ke beech message routing",
      nodes: [
        N("a", "User A", "📱", 80, 90, "client", { w: 120 }),
        N("s1", "WS server 1", "🔌", 300, 90),
        N("reg", "Connection\nregistry", "📇", 520, 270, "cache", { label: "Registry (Redis)\nB → server 2", w: 180 }),
        N("ps", "Pub/Sub", "📡", 520, 90, "queue"),
        N("s2", "WS server 2", "🔌", 740, 90),
        N("b", "User B", "📱", 920, 90, "client", { w: 120 }),
        N("push", "Push (FCM/APNs)", "🔔", 860, 270, "external", { w: 170 })
      ],
      edges: [
        { from: "a", to: "s1", both: true }, { from: "s1", to: "ps" }, { from: "ps", to: "s2" }, { from: "s2", to: "b", both: true },
        { from: "s1", to: "reg", dashed: true }, { from: "s2", to: "reg", dashed: true }, { from: "push", to: "b", dashed: true }, { from: "ps", to: "push", dashed: true }
      ],
      steps: [
        { title: "Connect: registry mein entry", html: "<p>B ne server 2 se WebSocket khola. Server 2 registry mein likhta hai: B → server 2 (heartbeat se fresh).</p>", path: ["b", "s2", "reg"], active: ["reg"] },
        { title: "A ka message server 1 pe", html: "<p>A server 1 se juda hai. Server 1 registry se dekhta hai B kahan hai.</p>", path: ["a", "s1", "reg"], active: ["s1", "reg"] },
        { title: "Pub/sub se server 2 → B", html: "<p>Server 1 message server 2 ke channel pe publish karta hai, server 2 B ke socket pe push.</p>", path: ["s1", "ps", "s2", "b"], active: ["b"] },
        { title: "B offline → push notification", html: "<p>Registry mein B nahi: message store karo aur FCM/APNs se push. B wapas aaye to last message id se sync.</p>", path: ["ps", "push", "b"], dim: ["s2"], active: ["push"] }
      ]
    }
  },
  {
    file: "reliability", match: "CLOSED ──(failures", mode: "split",
    flow: {
      type: "flow", title: "Circuit breaker ki states",
      nodes: [
        N("svc", "Order svc", "🖥️", 90, 160),
        N("closed", "CLOSED", "🟢", 330, 60, "cache", { label: "CLOSED\ncalls jaati hain" , w: 170}),
        N("open", "OPEN", "🔴", 620, 60, "data", { label: "OPEN\nturant fallback", w: 170 }),
        N("half", "HALF_OPEN", "🟡", 620, 260, "queue", { label: "HALF_OPEN\n1 trial call", w: 170 }),
        N("dep", "Payment svc", "💳", 880, 160, "external")
      ],
      edges: [
        { from: "svc", to: "closed" }, { from: "closed", to: "open", label: "failures ≥ N" }, { from: "open", to: "half", label: "cooldown" },
        { from: "half", to: "closed", label: "success" }, { from: "half", to: "open", dashed: true }, { from: "closed", to: "dep", dashed: true }
      ],
      steps: [
        { title: "CLOSED: normal", html: "<p>Calls dependency tak jaati hain. Failures gine jaate hain.</p>", path: ["svc", "closed", "dep"], active: ["closed"] },
        { title: "Lagatar failures → OPEN", html: "<p>Payment svc baar baar timeout. Threshold cross: breaker OPEN.</p>", path: ["svc", "closed", "open"], fail: ["dep"], active: ["open"] },
        { title: "OPEN: dependency ko call hi nahi", html: "<p>Calls turant fallback lautati hain (\"thodi der baad try karo\"). Hamare threads wait mein nahi phaste, dependency ko recover hone ka time.</p>", path: ["svc", "open", "svc"], active: ["open"], dim: ["dep"] },
        { title: "Cooldown ke baad HALF_OPEN", html: "<p>Ek trial call jaati hai.</p>", path: ["open", "half", "dep"], active: ["half"] },
        { title: "Trial success → CLOSED", html: "<p>Dependency theek: breaker band (CLOSED), normal traffic. Trial fail hota to wapas OPEN.</p>", path: ["half", "closed"], active: ["closed"] }
      ]
    }
  },
  {
    file: "data-patterns", match: "1. Order: create (PENDING)", mode: "split",
    flow: {
      type: "flow", title: "Orchestrated saga with compensation",
      nodes: [
        N("orch", "Orchestrator", "🎼", 500, 50, "service", { w: 170 }),
        N("order", "Order svc", "📦", 170, 240), N("pay", "Payment svc", "💳", 500, 240), N("inv", "Inventory svc", "🏬", 830, 240)
      ],
      edges: [{ from: "orch", to: "order", both: true }, { from: "orch", to: "pay", both: true }, { from: "orch", to: "inv", both: true }],
      steps: [
        { title: "1. Order PENDING", html: "<p>Order service apne DB mein order banati hai (local transaction).</p>", path: ["orch", "order", "orch"], active: ["order"] },
        { title: "2. Payment charge", html: "<p>Payment service apne DB mein charge record karti hai.</p>", path: ["orch", "pay", "orch"], active: ["pay"] },
        { title: "3. Inventory reserve FAIL", html: "<p>Stock khatam. Ab pichhle steps ko ulta karna hai: ek DB transaction nahi tha, isliye rollback nahi, <b>compensation</b>.</p>", path: ["orch", "inv", "orch"], fail: ["inv"] },
        { title: "Compensate: refund, phir order CANCELLED", html: "<p>Ulte order mein: payment refund, phir order cancel. Har compensation idempotent hona chahiye (retry safe).</p>", path: ["orch", "pay", "orch", "order"], fail: ["inv"], active: ["pay", "order"], color: "#1971c2" }
      ]
    }
  },
  {
    file: "url-shortener", match: "Create: Client ─► API", mode: "split",
    flow: {
      type: "flow", title: "Create aur redirect paths",
      nodes: [
        N("client", "Client", "👤", 90, 160, "client", { w: 120 }),
        N("api", "Create API", "✂️", 320, 60), N("alloc", "ID range\nallocator", "🔢", 560, 60, "service", { label: "ID allocator\n(local range)" }),
        N("db", "URL DB", "🗄️", 800, 160, "data", { label: "DB\ncode → url" }),
        N("redir", "Redirect svc", "↪️", 320, 270), N("redis", "Redis", "⚡", 560, 270, "cache")
      ],
      edges: [
        { from: "client", to: "api", both: true }, { from: "api", to: "alloc", both: true }, { from: "api", to: "db" },
        { from: "client", to: "redir", both: true }, { from: "redir", to: "redis", both: true }, { from: "redis", to: "db", dashed: true }
      ],
      steps: [
        { title: "Create: agla id + base62", html: "<p>API apne local range se agla number leta hai (koi central call nahi), base62 karke 7-char code banata hai aur DB mein save.</p>", path: ["client", "api", "alloc", "api", "db"], active: ["alloc", "db"] },
        { title: "Redirect: cache hit (~1ms)", html: "<p>Zyaadatar codes Redis se resolve: 302 + Location header.</p>", path: ["client", "redir", "redis", "redir", "client"], active: ["redis"], dim: ["db"] },
        { title: "Cache miss → DB", html: "<p>Purana / rare code: DB se laao, Redis mein daalo.</p>", path: ["redir", "redis", "db", "redis", "redir", "client"], active: ["db"] }
      ]
    }
  },
  {
    file: "chat", match: "Phone A ══ws══►", mode: "split",
    flow: {
      type: "flow", title: "Message: ✓ sent → ✓✓ delivered",
      nodes: [
        N("a", "Phone A", "📱", 70, 90, "client", { w: 110 }),
        N("s12", "Chat server 12", "🔌", 260, 90, "service", { w: 160 }),
        N("msg", "Message svc", "💬", 490, 90),
        N("db", "Cassandra", "🗄️", 490, 270, "data"),
        N("reg", "Registry", "📇", 720, 270, "cache", { label: "Registry\nB → server 40" }),
        N("s40", "Chat server 40", "🔌", 720, 90, "service", { w: 160 }),
        N("b", "Phone B", "📱", 920, 90, "client", { w: 110 }),
        N("push", "Push", "🔔", 920, 270, "external", { w: 110 })
      ],
      edges: [
        { from: "a", to: "s12", both: true }, { from: "s12", to: "msg", both: true }, { from: "msg", to: "db" }, { from: "msg", to: "reg", dashed: true },
        { from: "msg", to: "s40", both: true }, { from: "s40", to: "b", both: true }, { from: "msg", to: "push", dashed: true }, { from: "push", to: "b", dashed: true }
      ],
      steps: [
        { title: "Send + persist → ✓", html: "<p>A ka message (client id ke saath) Cassandra mein save hua, tab A ko ack: ek tick ✓.</p>", path: ["a", "s12", "msg", "db", "msg", "s12", "a"], active: ["db"] },
        { title: "B kahan hai? registry se route", html: "<p>B server 40 pe online hai: message wahan, phir B ke socket pe.</p>", path: ["msg", "reg", "msg", "s40", "b"], active: ["reg", "b"] },
        { title: "B ka device ack → ✓✓", html: "<p>B ke phone ne ack bheja: A ko double tick. Chat kholne pe read ack → blue ticks.</p>", path: ["b", "s40", "msg", "s12", "a"], active: ["a"], color: "#1971c2" },
        { title: "B offline → push, baad mein sync", html: "<p>Registry mein B nahi: message DB mein rehta hai, push notification jaata hai, aur B connect hone pe last id ke baad ke messages sync.</p>", path: ["msg", "push", "b"], dim: ["s40", "reg"], active: ["push"] }
      ]
    }
  },
  {
    file: "twitter", match: "Client ─► CDN (media)", mode: "split",
    flow: {
      type: "flow", title: "Twitter: write path aur read path",
      nodes: [
        N("client", "Client", "📱", 70, 170, "client", { w: 110 }),
        N("tweet", "Tweet svc", "🐦", 270, 60), N("tdb", "Tweets DB", "🗄️", 500, 60, "data"),
        N("kafka", "Kafka", "📨", 720, 60, "queue", { w: 120 }), N("fan", "Fan-out\nworkers", "⚙️", 900, 170, "service", { label: "Fan-out\nworkers", w: 140 }),
        N("tl", "Timeline Redis", "⚡", 660, 280, "cache", { w: 170 }), N("tsvc", "Timeline svc", "📰", 270, 280),
        N("celeb", "Celebrity tweets", "⭐", 460, 170, "cache", { w: 170 })
      ],
      edges: [
        { from: "client", to: "tweet" }, { from: "tweet", to: "tdb" }, { from: "tweet", to: "kafka" }, { from: "kafka", to: "fan" }, { from: "fan", to: "tl" },
        { from: "client", to: "tsvc", both: true }, { from: "tsvc", to: "tl", both: true }, { from: "tsvc", to: "celeb", both: true, dashed: true }
      ],
      steps: [
        { title: "Write: tweet save + event", html: "<p>Tweet DB mein (Snowflake id), aur <code>tweet_created</code> event Kafka pe.</p>", path: ["client", "tweet", "tdb"], paths: [["client", "tweet", "tdb"], ["client", "tweet", "kafka"]], active: ["tdb", "kafka"] },
        { title: "Fan-out: followers ki timelines", html: "<p>Workers followers ki Redis timeline lists mein tweet id daalte hain (normal users ke liye). Async, seconds mein.</p>", path: ["kafka", "fan", "tl"], active: ["fan", "tl"] },
        { title: "Read: ready timeline (~ms)", html: "<p>Home feed = Redis list se ids, phir tweet cache se hydrate. Koi bada join nahi.</p>", path: ["client", "tsvc", "tl", "tsvc", "client"], active: ["tl"] },
        { title: "Celebrity tweets: read pe pull + merge", html: "<p>Crores followers wale accounts ka push nahi hota: unke recent tweets read time pe laake timeline mein merge (hybrid).</p>", paths: [["tsvc", "tl", "tsvc"], ["tsvc", "celeb", "tsvc"]], active: ["celeb"] }
      ]
    }
  },
  {
    file: "youtube", match: "Client ─(1) pre-signed URL", mode: "split",
    flow: {
      type: "flow", title: "YouTube: upload pipeline aur watch path",
      nodes: [
        N("creator", "Creator", "🎬", 70, 70, "client", { w: 110 }),
        N("api", "Upload API", "🖥️", 250, 70, "service", { w: 140 }), N("meta", "Metadata DB", "🗄️", 250, 280, "data", { w: 150 }),
        N("raw", "S3 raw", "🪣", 450, 70, "data", { w: 120 }), N("q", "Queue", "📨", 620, 70, "queue", { w: 110 }),
        N("tc", "Transcoders", "⚙️", 800, 70, "service", { w: 150 }), N("out", "S3 HLS\nsegments", "🪣", 800, 190, "data", { label: "S3 segments\n240p…4K", w: 160 }),
        N("cdn", "CDN", "🛰️", 600, 280, "cache", { w: 120 }), N("viewer", "Viewer", "📺", 430, 280, "client", { w: 110 })
      ],
      edges: [
        { from: "creator", to: "api", both: true }, { from: "creator", to: "raw", dashed: true }, { from: "raw", to: "q" }, { from: "q", to: "tc" }, { from: "tc", to: "out" },
        { from: "out", to: "cdn" }, { from: "cdn", to: "viewer" }, { from: "api", to: "meta" }, { from: "tc", to: "meta", dashed: true }
      ],
      steps: [
        { title: "1. Pre-signed URL + metadata row", html: "<p>API metadata row banati hai (status UPLOADING) aur signed upload URL deti hai.</p>", path: ["creator", "api", "meta"], active: ["api", "meta"] },
        { title: "2. Seedha S3 pe multipart upload", html: "<p>Badi file API se nahi guzarti. Upload complete hone pe event queue mein.</p>", path: ["creator", "raw", "q"], active: ["raw", "q"] },
        { title: "3. Parallel transcoding", html: "<p>Workers video ke chunks alag alag quality aur codecs mein encode karte hain, HLS/DASH segments S3 mein. Status READY.</p>", paths: [["q", "tc", "out"], ["q", "tc", "meta"]], active: ["tc", "out"] },
        { title: "4. Watch: segments CDN se", html: "<p>Player manifest padhta hai aur network ke hisaab se har segment ki quality chunta hai. Popular videos edge pe.</p>", path: ["out", "cdn", "viewer"], active: ["cdn", "viewer"], dim: ["creator", "api"] }
      ]
    }
  },
  {
    file: "chatgpt", match: "Client ══SSE══► Gateway", mode: "split",
    flow: {
      type: "flow", title: "LLM chat request: queue, GPU batching, streaming",
      nodes: [
        N("client", "Client", "💻", 70, 160, "client", { w: 110 }),
        N("gw", "Gateway", "🚪", 240, 160, "service", { label: "Gateway\ntoken quota", w: 140 }),
        N("chat", "Chat svc", "💬", 430, 160, "service", { w: 140 }),
        N("hist", "Conversations", "🗄️", 430, 300, "data", { w: 170 }),
        N("q", "Priority queue", "📨", 640, 60, "queue", { w: 170 }),
        N("gpu", "GPU servers", "🎮", 860, 160, "service", { label: "GPU servers\ncontinuous batching", w: 180 }),
        N("bill", "Usage / billing", "🧾", 700, 300, "queue", { w: 170 })
      ],
      edges: [
        { from: "client", to: "gw", both: true }, { from: "gw", to: "chat", both: true }, { from: "chat", to: "hist", both: true },
        { from: "chat", to: "q" }, { from: "q", to: "gpu" }, { from: "gpu", to: "chat", dashed: true, label: "tokens" }, { from: "chat", to: "bill", dashed: true }
      ],
      steps: [
        { title: "1. Auth + token quota", html: "<p>Gateway plan ke hisaab se tokens/din check karta hai. Khatam → 429.</p>", path: ["client", "gw"], active: ["gw"] },
        { title: "2. History load, prompt banao", html: "<p>Pichhle messages (context window mein fit hone tak, ya summary) + naya message.</p>", path: ["gw", "chat", "hist", "chat"], active: ["hist"] },
        { title: "3. Queue → GPU (batch mein)", html: "<p>Paid pehle. GPU server kai users ki requests ek batch mein chalata hai (continuous batching) taaki GPU poora use ho.</p>", path: ["chat", "q", "gpu"], active: ["q", "gpu"] },
        { title: "4. Tokens stream (SSE)", html: "<p>Har generate hota token turant client tak: pehla token ~1s mein dikhta hai, poora jawab baad mein.</p>", path: ["gpu", "chat", "gw", "client"], active: ["client"], color: "#2b8a3e" },
        { title: "5. Save + usage", html: "<p>Jawab conversation mein save, actual tokens billing pipeline ko.</p>", paths: [["chat", "hist"], ["chat", "bill"]], active: ["hist", "bill"] }
      ]
    }
  },
  {
    file: "uber", match: "Driver app ─(every 4s)", mode: "split",
    flow: {
      type: "flow", title: "Location updates aur matching",
      nodes: [
        N("driver", "Driver app", "🚗", 80, 70, "client", { w: 130 }),
        N("loc", "Location svc", "📍", 300, 70),
        N("geo", "Geo index", "🗺️", 540, 70, "cache", { label: "Geo index (Redis)\nshard by city", w: 190 }),
        N("hist", "Kafka → history", "📨", 300, 200, "queue", { w: 170 }),
        N("rider", "Rider app", "🙋", 80, 300, "client", { w: 130 }),
        N("match", "Matching svc", "🤝", 540, 300, "service", { w: 160 }),
        N("trip", "Trip DB", "🗄️", 820, 300, "data"),
        N("lock", "Driver lock", "🔒", 820, 170, "cache", { label: "Driver lock\nSET NX EX 15" })
      ],
      edges: [
        { from: "driver", to: "loc" }, { from: "loc", to: "geo" }, { from: "loc", to: "hist", dashed: true },
        { from: "rider", to: "match", both: true }, { from: "match", to: "geo", both: true }, { from: "match", to: "lock" }, { from: "match", to: "trip" },
        { from: "match", to: "driver", dashed: true }
      ],
      steps: [
        { title: "Har 4 second location", html: "<p>2.5 lakh updates/s: sirf latest location geo index (memory) mein overwrite; history async Kafka se.</p>", paths: [["driver", "loc", "geo"], ["driver", "loc", "hist"]], active: ["geo"] },
        { title: "Rider request → paas ke drivers", html: "<p>Matching rider ke cell + padosi cells mein drivers dhoondhti hai, ETA se rank.</p>", path: ["rider", "match", "geo", "match"], active: ["match", "geo"] },
        { title: "Driver ko lock karke offer", html: "<p>Driver ko 15 second ke liye lock (taaki doosre rider ko offer na ho), phir app pe offer.</p>", path: ["match", "lock", "match", "driver"], active: ["lock", "driver"] },
        { title: "Accept → trip banti hai", html: "<p>Trip DB mein (state machine: ACCEPTED → STARTED → COMPLETED). Decline/timeout → agla driver.</p>", path: ["driver", "match", "trip"], active: ["trip"] }
      ]
    }
  },
  {
    file: "notification", match: "Order/Payment/Marketing ─►", mode: "after", afterId: "think-notif-req",
    flow: {
      type: "flow", title: "Notification pipeline: priority isolation",
      nodes: [
        N("prod", "Order / Payment\n/ Marketing", "🏭", 90, 165, "client", { label: "Producers\norders · payments · mktg", w: 170 }),
        N("api", "Notification API", "🔔", 320, 165, "service", { label: "Notification API\nprefs · dedupe · template", w: 190 }),
        N("qh", "OTP queue", "🚨", 560, 50, "queue", { w: 140 }), N("qt", "Transactional", "📨", 560, 165, "queue", { w: 140 }), N("qm", "Marketing", "📢", 560, 280, "queue", { w: 140 }),
        N("w", "Channel workers", "⚙️", 780, 165, "service", { w: 160 }),
        N("prov", "Providers", "📡", 930, 60, "external", { label: "FCM · SMS · SES", w: 130 }),
        N("dlq", "DLQ", "🪦", 930, 280, "queue", { w: 110 })
      ],
      edges: [
        { from: "prod", to: "api" }, { from: "api", to: "qh" }, { from: "api", to: "qt" }, { from: "api", to: "qm" },
        { from: "qh", to: "w" }, { from: "qt", to: "w" }, { from: "qm", to: "w" }, { from: "w", to: "prov" }, { from: "w", to: "dlq", dashed: true }
      ],
      steps: [
        { title: "OTP: high priority queue", html: "<p>OTP apni alag queue + reserved workers mein: marketing ka backlog ise late nahi kar sakta.</p>", path: ["prod", "api", "qh", "w", "prov"], active: ["qh"] },
        { title: "Campaign: 50 lakh messages", html: "<p>Marketing queue mein backlog bana, workers rate-limited speed se bhejte hain. Users pe per-hour limits aur quiet hours.</p>", paths: [["api", "qm", "w"], ["prod", "api", "qm"]], active: ["qm"] },
        { title: "Provider fail → retry → DLQ", html: "<p>5xx/timeouts pe backoff + jitter ke saath retry, doosre SMS vendor pe failover; phir bhi fail to DLQ.</p>", path: ["qt", "w", "prov", "w", "dlq"], fail: ["prov"] }
      ]
    }
  },
  {
    file: "rate-limiter-hld", match: "Client ─► Gateway (rate-limit middleware)", mode: "after", afterId: "think-rl-req",
    flow: {
      type: "flow", title: "Har request pe ek Redis check",
      nodes: [
        N("client", "Client", "👤", 80, 160, "client", { w: 120 }),
        N("gw", "Gateway", "🚪", 320, 160, "service", { label: "Gateway\nrules cached", w: 160 }),
        N("redis", "Redis cluster", "⚡", 580, 60, "cache", { label: "Redis cluster\nLua: refill + take", w: 180 }),
        N("rules", "Rules DB", "📜", 580, 280, "data", { w: 140 }),
        N("backend", "Backend", "🖥️", 840, 160)
      ],
      edges: [
        { from: "client", to: "gw", both: true }, { from: "gw", to: "redis", both: true }, { from: "rules", to: "gw", dashed: true, label: "har minute" }, { from: "gw", to: "backend" }
      ],
      steps: [
        { title: "Allowed: token mila", html: "<p>Gateway ek atomic Lua script chalata hai (~1ms). Token mila → request backend ko.</p>", path: ["client", "gw", "redis", "gw", "backend"], active: ["redis", "backend"] },
        { title: "Denied: 429 + Retry-After", html: "<p>Token nahi → backend tak gayi hi nahi.</p>", path: ["client", "gw", "redis", "gw", "client"], active: ["gw"], dim: ["backend"] },
        { title: "Redis down → fail-open (normal APIs)", html: "<p>Availability ke liye allow (local approximate limit backstop ke saath). Login/OTP pe fail-closed.</p>", path: ["client", "gw", "backend"], fail: ["redis"] }
      ]
    }
  }
];
