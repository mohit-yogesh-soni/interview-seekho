// Jin HLD lessons mein diagram nahi tha, unke liye naye flows (mode "insert": afterText wale block ke baad).
const N = (id, label, icon, x, y, kind = "service", extra = {}) => ({ id, label, icon, x, y, kind, ...extra });

export default [
  {
    file: "load-balancer", mode: "insert", afterText: "<h2>Kya karta hai</h2>",
    flow: {
      type: "flow", title: "Round robin, health check, least connections",
      nodes: [
        N("users", "Users", "👥", 90, 160, "client", { w: 120 }),
        N("lb", "Load Balancer", "⚖️", 340, 160),
        N("a", "Server A", "🖥️", 650, 50), N("b", "Server B", "🖥️", 650, 160), N("c", "Server C", "🖥️", 650, 270),
        N("hc", "Health checker", "🩺", 340, 290, "external", { w: 160 })
      ],
      edges: [{ from: "users", to: "lb" }, { from: "lb", to: "a" }, { from: "lb", to: "b" }, { from: "lb", to: "c" }, { from: "hc", to: "a", dashed: true }, { from: "hc", to: "b", dashed: true }, { from: "hc", to: "c", dashed: true }],
      steps: [
        { title: "Round robin: request 1 → A", html: "<p>Baari baari: pehli request A ko.</p>", path: ["users", "lb", "a"], active: ["a"] },
        { title: "Request 2 → B, request 3 → C", html: "<p>Requests barabar bant-ti hain jab servers aur requests similar hon.</p>", paths: [["users", "lb", "b"], ["users", "lb", "c"]], active: ["b", "c"] },
        { title: "Health check fail: B rotation se bahar", html: "<p>Health checker har kuch second <code>/health</code> ping karta hai. B ne lagatar fail kiya: LB ab B ko traffic nahi bhejta.</p>", paths: [["hc", "b"], ["users", "lb", "a"], ["users", "lb", "c"]], fail: ["b"] },
        { title: "Least connections: lambi requests", html: "<p>A pe 50 slow requests chal rahi hain, C pe 2. Least connections naya kaam C ko deta hai, round robin aankh band karke A ko bhi deta.</p>", path: ["users", "lb", "c"], active: ["c"], fail: ["b"] }
      ]
    }
  },
  {
    file: "fanout", mode: "insert", afterText: "<h2>Do approaches</h2>",
    flow: {
      type: "flow", title: "Push (fan-out on write) vs pull (fan-out on read)",
      nodes: [
        N("bob", "Bob (normal)", "🙂", 90, 70, "client", { w: 140 }),
        N("star", "Virat (celeb)", "⭐", 90, 270, "client", { w: 150 }),
        N("posts", "Posts store", "🗄️", 360, 270, "data", { w: 150 }),
        N("f1", "Riya timeline", "📰", 650, 50, "cache", { w: 160 }), N("f2", "Aman timeline", "📰", 650, 160, "cache", { w: 160 }), N("f3", "Neha timeline", "📰", 650, 270, "cache", { w: 160 }),
        N("reader", "Riya opens feed", "📱", 900, 160, "client", { w: 160 })
      ],
      edges: [
        { from: "bob", to: "f1" }, { from: "bob", to: "f2" }, { from: "bob", to: "f3" }, { from: "star", to: "posts" },
        { from: "reader", to: "f1", dashed: true }, { from: "reader", to: "posts", dashed: true }
      ],
      steps: [
        { title: "Normal user post: push to followers", html: "<p>Bob ke 3 followers: post id teeno ki ready timeline mein (3 writes).</p>", paths: [["bob", "f1"], ["bob", "f2"], ["bob", "f3"]], active: ["f1", "f2", "f3"] },
        { title: "Read: ready list (bahut tez)", html: "<p>Riya ka feed = uski timeline list. Koi merge nahi.</p>", path: ["reader", "f1", "reader"], active: ["f1"] },
        { title: "Celebrity post: push nahi, sirf store", html: "<p>Virat ke crores followers: push = crores writes. Isliye post sirf uske posts store mein.</p>", path: ["star", "posts"], active: ["posts"], dim: ["f1", "f2", "f3"] },
        { title: "Read: timeline + celebrity posts merge", html: "<p>Riya ka feed kholte waqt uski timeline aur jin celebrities ko follow karti hai unke recent posts laake merge (hybrid).</p>", paths: [["reader", "f1", "reader"], ["reader", "posts", "reader"]], active: ["f1", "posts"] }
      ]
    }
  },
  {
    file: "indexing", mode: "insert", afterText: "<h2>LSM-tree (Cassandra",
    flow: {
      type: "flow", title: "LSM write aur read path",
      nodes: [
        N("w", "Write", "✍️", 80, 90, "client", { w: 110 }),
        N("log", "Commit log", "📜", 300, 250, "data", { label: "Commit log\n(append)" }),
        N("mem", "Memtable", "🧠", 300, 90, "cache", { label: "Memtable\n(RAM, sorted)" }),
        N("s1", "SSTable 3 (new)", "📄", 580, 50, "data", { w: 170 }), N("s2", "SSTable 2", "📄", 580, 160, "data", { w: 170 }), N("s3", "SSTable 1 (old)", "📄", 580, 270, "data", { w: 170 }),
        N("comp", "Compaction", "🧹", 850, 160, "service", { label: "Compaction\nmerge + delete", w: 160 }),
        N("r", "Read", "🔎", 80, 300, "client", { w: 110 })
      ],
      edges: [
        { from: "w", to: "mem" }, { from: "w", to: "log" }, { from: "mem", to: "s1", dashed: true, label: "flush" },
        { from: "s2", to: "comp" }, { from: "s3", to: "comp" }, { from: "r", to: "mem", dashed: true }, { from: "mem", to: "s2", dashed: true }
      ],
      steps: [
        { title: "Write: log + memtable (fast)", html: "<p>Har write commit log mein sequential append (crash safety) aur RAM ke sorted memtable mein. Disk pe random write nahi.</p>", paths: [["w", "log"], ["w", "mem"]], active: ["log", "mem"] },
        { title: "Memtable full → SSTable flush", html: "<p>Sorted memtable ek immutable SSTable file ban ke disk pe (sequential write).</p>", path: ["mem", "s1"], active: ["s1"] },
        { title: "Read: naye se purane tak", html: "<p>Pehle memtable, phir SSTables (naya pehle). Bloom filter batata hai kis file mein key pakka nahi, wo skip.</p>", path: ["r", "mem", "s2"], active: ["mem", "s2"] },
        { title: "Compaction: purani files merge", html: "<p>Background mein SSTables merge: duplicates aur deleted (tombstone) keys hatati hain, read ke liye files kam.</p>", paths: [["s2", "comp"], ["s3", "comp"]], active: ["comp"] }
      ]
    }
  },
  {
    file: "monolith-micro", mode: "insert", afterText: "<th>Monolith (modular)</th>",
    flow: {
      type: "flow", title: "Sync chain ki availability problem",
      nodes: [
        N("client", "Client", "📱", 80, 160, "client", { w: 110 }),
        N("order", "Order svc", "📦", 330, 160),
        N("user", "User svc", "👤", 620, 60), N("rest", "Restaurant svc", "🍽️", 620, 260, "service", { w: 170 }),
        N("snap", "Order DB\n(name snapshot)", "🗄️", 880, 160, "data", { label: "Order DB\n+ name snapshot", w: 170 })
      ],
      edges: [{ from: "client", to: "order", both: true }, { from: "order", to: "user", both: true }, { from: "order", to: "rest", both: true }, { from: "order", to: "snap", both: true, dashed: true }],
      steps: [
        { title: "Har order page pe 2 sync calls", html: "<p>Order dikhane ke liye user ka naam aur restaurant ka naam alag services se. Latency judti hai.</p>", paths: [["client", "order", "user", "order"], ["client", "order", "rest", "order"]], dim: ["snap"] },
        { title: "Ek service down = page down", html: "<p>User svc down: order page bhi fail. 3 services 99.9% each → chain ~99.7%.</p>", path: ["client", "order", "user"], fail: ["user"], dim: ["snap"] },
        { title: "Fix: order ke saath snapshot", html: "<p>Order banate waqt naam copy kar lo (ya events se local read model). Ab page ek service se.</p>", path: ["client", "order", "snap", "order", "client"], active: ["snap"], dim: ["user", "rest"] }
      ]
    }
  }
];
