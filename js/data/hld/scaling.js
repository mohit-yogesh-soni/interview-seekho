// Vertical vs Horizontal scaling
registerLesson("hld", "scaling", {
  why: `Har HLD design 'traffic badha to kya karoge' pe aata hai. Do raaste hain: badi machine (vertical) ya zyada machines (horizontal). Horizontal ke liye servers stateless hone chahiye. Simulator mein khud dekho ki ek server kab toot-ta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Do raaste</h2>
        <table>
          <tr><th></th><th>Vertical (scale up)</th><th>Horizontal (scale out)</th></tr>
          <tr><td>Kya</td><td>Wahi server, zyada CPU/RAM</td><td>Zyada servers, load balancer ke peeche</td></tr>
          <tr><td>Fayda</td><td>Code mein koi change nahi, simple</td><td>Lagbhag unlimited, ek gira to baaki chalte (availability)</td></tr>
          <tr><td>Nuksaan</td><td>Hardware ki limit, mehenga upar jaate jaate, single point of failure, upgrade pe downtime</td><td>LB chahiye, servers stateless hone chahiye, distributed problems</td></tr>
          <tr><td>Kab</td><td>Shuru mein, DB (sharding se pehle)</td><td>Stateless app servers: hamesha</td></tr>
        </table>
        <h2>Stateless server kya hai?</h2>
        <p>Agar server memory mein user ka session rakhta hai, to user ki agli request <b>usi</b> server pe jaani chahiye (sticky sessions). Server gira = sab logged-out. Naya server joda = uske paas koi session nahi.</p>
        <p><b>Stateless:</b> server request ke beech kuch yaad nahi rakhta. State bahar: session Redis mein, ya token (JWT) client ke paas; files S3 mein; data DB mein. Ab koi bhi request kisi bhi server pe ja sakti hai, aur server jodna/hatana free hai (autoscaling).</p>
        `
    },
    {
      type: "flow",
      title: "Stateful vs stateless servers",
      nodes: [
        {
          id: "user",
          label: "User",
          icon: "👤",
          x: 90,
          y: 160,
          kind: "client"
        },
        {
          id: "lb",
          label: "Load Balancer",
          icon: "⚖️",
          x: 300,
          y: 160,
          kind: "service"
        },
        {
          id: "a",
          label: "Server A",
          icon: "🖥️",
          x: 530,
          y: 50,
          kind: "service"
        },
        {
          id: "b",
          label: "Server B",
          icon: "🖥️",
          x: 530,
          y: 160,
          kind: "service"
        },
        {
          id: "c",
          label: "Server C",
          icon: "🖥️",
          x: 530,
          y: 270,
          kind: "service"
        },
        {
          id: "redis",
          label: `Redis
sessions`,
          icon: "⚡",
          x: 800,
          y: 100,
          kind: "cache"
        },
        {
          id: "db",
          label: "Database",
          icon: "🗄️",
          x: 800,
          y: 230,
          kind: "data"
        }
      ],
      edges: [
        {
          from: "user",
          to: "lb"
        },
        {
          from: "lb",
          to: "a"
        },
        {
          from: "lb",
          to: "b"
        },
        {
          from: "lb",
          to: "c"
        },
        {
          from: "a",
          to: "redis",
          dashed: true
        },
        {
          from: "b",
          to: "redis",
          dashed: true
        },
        {
          from: "c",
          to: "redis",
          dashed: true
        },
        {
          from: "b",
          to: "db",
          dashed: true
        },
        {
          from: "c",
          to: "db",
          dashed: true
        },
        {
          from: "a",
          to: "db",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Stateful: session Server A ki RAM mein",
          html: "<p>Login ke baad session sirf A ke paas. LB ko har request A pe hi bhejni padti hai (sticky sessions).</p>",
          path: ["user","lb","a"],
          active: ["a"],
          dim: ["redis"]
        },
        {
          title: "Server A gira → user logged out",
          html: "<p>A crash hua, uske saath session bhi gaya. Naye servers jodne se bhi purane users ko fayda nahi.</p>",
          path: ["user","lb","b"],
          fail: ["a"],
          dim: ["redis"]
        },
        {
          title: "Stateless: session Redis mein",
          html: "<p>Server request ke beech kuch yaad nahi rakhta. Session id se kisi bhi server ko Redis se session mil jaata hai.</p>",
          path: ["user","lb","b","redis"],
          active: ["b","redis"]
        },
        {
          title: "Agli request kisi bhi server pe",
          html: "<p>LB ne C ko diya, C ko bhi wahi session mil gaya. Ab servers jodna/hatana (autoscaling) free hai.</p>",
          path: ["user","lb","c","redis"],
          active: ["c","redis"]
        },
        {
          title: "Ek server gira, koi farak nahi",
          html: "<p>A down: LB health check se usko hata deta hai, baaki servers chalte rehte hain.</p>",
          paths: [
            ["user","lb","b"],
            ["user","lb","c"]
          ],
          fail: ["a"]
        }
      ]
    },
    {
      type: "tip",
      html: `🧪 <b>Simulator mein khud dekho:</b> 15,000 RPS pe errors &lt; 1% aur latency &lt; 100ms, kam cost mein. (Is lesson mein DB ko bahut bada maana hai, focus app servers pe.)`
    },
    {
      type: "sim",
      id: "sim-scaling",
      title: "Ek server, phir horizontal scaling",
      config: {
        rps: 1000,
        maxRps: 30000,
        readRatio: 0.9,
        appCap: 2000,
        dbCap: 50000,
        controls: ["rps","lb","servers"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> Ek server ki capacity 2,000 RPS hai. 15,000 ke liye kam se kam 8 servers, par 100% pe latency bahut badhti hai (queueing), isliye ~10 servers (75% utilization) achha. Load balancer ke bina doosra server use hi nahi hota. Yahi asli life mein bhi: target utilization ~60-70% rakho taaki spikes jhel sako.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Simulator mein utilization 95% pe latency achanak bahut kyun badh gayi, jabki 50% pe theek thi?</div>
          <div class="qa-a"><b>Jawab:</b> Queueing: jab server lagbhag full ho, aane wali requests line mein wait karti hain; total latency (wait + service) ≈ service time / (1 − utilization), jo 100% ke paas infinity ki taraf jaata hai. Queueing theory ka basic result. 50% pe total latency ≈ 2× service time, 90% pe 10×, 99% pe 100×. Isliye capacity planning mein headroom rakhte hain.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Horizontal scaling ke liye kaunsi cheezein server se <b>bahar</b> nikaalni chahiye?</b></div>
          <ul class="qa-options"><li>✅ User sessions (Redis / JWT)<div class="small muted">Taaki koi bhi server request le sake.</div></li><li>✅ Uploaded files (S3 / object storage)<div class="small muted">Local disk pe file = sirf us server pe.</div></li><li>✅ In-memory rate limit counters (multi-server pe)<div class="small muted">Har server ka alag count = galat limit. Redis.</div></li><li>❌ Application ka code<div class="small muted">Code har server pe same (image / deploy).</div></li><li>❌ Read-only config jo startup pe load hoti hai<div class="small muted">Har server apni copy rakh sakta hai: badalti nahi.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>App servers ka CPU/memory full ho, ya ek server gire to poori site gire (availability chahiye).</td></tr>
          <tr><th>Kab nahi</th><td>Traffic ek machine ke andar hai aur downtime chal jaata hai: pehle badi machine (vertical) lo, sabse simple hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Servers stateless banane padte hain (session Redis/DB mein, files S3 mein), aage LB chahiye, deploy aur monitoring kai machines pe.</td></tr>
          <tr><th>Alternatives</th><td>Vertical scaling: koi code change nahi, par ek limit hai aur single point of failure. DB ke liye aksar pehle vertical hi sahi hai.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Notion ne shuru mein ek hi bada Postgres (RDS ka sabse bada instance) chalaya, aur jab wo kam pada tab sharding ki. Pehle vertical, limit pe horizontal: yahi normal raasta hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Design mein pehli line: <i>"App servers stateless rakhunga (session Redis/JWT mein), taaki load balancer ke peeche horizontally scale ho sakein aur autoscaling chale."</i> Phir bottleneck DB pe shift hota hai: agle lessons (cache, replicas, sharding).`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Hotstar, 10 July 2019 (World Cup semi-final, India vs New Zealand): 25.3 million log ek saath live dekh rahe the. Dhoni ke aate hi har minute lakhon naye users judte hain. Hotstar ne normal reactive autoscaling (CPU badhe to servers jodo) pe bharosa kyun nahi kiya?`,
      options: [
        `Autoscaling cloud mein hota hi nahi`,
        `Naye servers aane mein minutes lagte hain, bade spike pe cloud se turant capacity milna bhi pakka nahi, aur scaling step chhote hote hain; isliye match se pehle expected concurrency ke hisaab se pre-scale kiya`,
        `Unke paas paise nahi the`,
        `Vertical scaling sasta tha`
      ],
      answer: 1,
      why: `AWS re:Invent 2019 ki Hotstar talk (CMY302) mein bataya gaya ki live events pe default autoscaling ki dikkatein thi: insufficient capacity errors aur scale hone ki speed. Isliye wo game-day load tests aur concurrency ke forecast se pehle hi capacity tayaar rakhte the. Sabak: reactive autoscaling dheere badhte traffic ke liye achha hai; jab spike ka time pata ho (match, sale), pre-warm karo.`
    }
  ],
  references: [
    { title: "Scaling Hotstar.com for 25 million concurrent viewers (re:Invent 2019, CMY302)", by: "AWS / Hotstar", url: "https://d1.awsstatic.com/events/reinvent/2019/Scaling_Hotstar.com_for_25_million_concurrent_viewers_CMY302.pdf", type: "article" },
    {
      title: "System Design Primer: scalability",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    },
    {
      title: "Gaurav Sen (YouTube): horizontal vs vertical scaling",
      by: "Gaurav Sen",
      url: "https://www.youtube.com/@gkcs",
      type: "video"
    }
  ]
});
