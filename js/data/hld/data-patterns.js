// Saga, CQRS, Event sourcing (overview)
registerLesson("hld", "data-patterns", {
  why: `Microservices mein har service ka apna DB hai, to 'order banao + payment kaato + stock ghatao' ek DB transaction mein nahi ho sakta. Saga, outbox, CQRS aur event sourcing iske jawab hain. Interview mein inka idea aur trade-off bolna kaafi hai, framework nahi.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: distributed transaction</h2>
        <p>Order svc (orders DB), Payment svc (payments DB), Inventory svc (stock DB). Teeno ek saath commit ya teeno rollback. <b>2PC (two-phase commit)</b> technically possible hai par: coordinator ruk jaaye to sab locked, slow, aur zyaadatar modern DBs/brokers ke beech practical nahi.</p>
        <h2>Saga: chhote local transactions + compensations</h2>
        `
    },
    {
      type: "flow",
      title: "Orchestrated saga with compensation",
      nodes: [
        {
          id: "orch",
          label: "Orchestrator",
          icon: "🎼",
          x: 500,
          y: 50,
          kind: "service",
          w: 170
        },
        {
          id: "order",
          label: "Order svc",
          icon: "📦",
          x: 170,
          y: 240,
          kind: "service"
        },
        {
          id: "pay",
          label: "Payment svc",
          icon: "💳",
          x: 500,
          y: 240,
          kind: "service"
        },
        {
          id: "inv",
          label: "Inventory svc",
          icon: "🏬",
          x: 830,
          y: 240,
          kind: "service"
        }
      ],
      edges: [
        {
          from: "orch",
          to: "order",
          both: true
        },
        {
          from: "orch",
          to: "pay",
          both: true
        },
        {
          from: "orch",
          to: "inv",
          both: true
        }
      ],
      steps: [
        {
          title: "1. Order PENDING",
          html: "<p>Order service apne DB mein order banati hai (local transaction).</p>",
          path: ["orch","order","orch"],
          active: ["order"]
        },
        {
          title: "2. Payment charge",
          html: "<p>Payment service apne DB mein charge record karti hai.</p>",
          path: ["orch","pay","orch"],
          active: ["pay"]
        },
        {
          title: "3. Inventory reserve FAIL",
          html: `<p>Stock khatam. Ab pichhle steps ko ulta karna hai: ek DB transaction nahi tha, isliye rollback nahi, <b>compensation</b>.</p>`,
          path: ["orch","inv","orch"],
          fail: ["inv"]
        },
        {
          title: "Compensate: refund, phir order CANCELLED",
          html: "<p>Ulte order mein: payment refund, phir order cancel. Har compensation idempotent hona chahiye (retry safe).</p>",
          path: ["orch","pay","orch","order"],
          fail: ["inv"],
          active: ["pay","order"],
          color: "#1971c2"
        }
      ]
    },
    {
      type: "text",
      html: `
        <ul>
          <li>Har step apne DB mein commit. Fail hua to pichhle steps ke <b>compensating actions</b> (refund, release stock). Facade lesson ka rollback, distributed roop.</li>
          <li><b>Choreography:</b> services events sunke agla step karti hain (koi central boss nahi). Simple flows ke liye; bade flows mein samajhna mushkil.</li>
          <li><b>Orchestration:</b> ek orchestrator (Temporal, Step Functions, ya apna state machine) steps chalata hai. Flow ek jagah dikhta hai.</li>
          <li>Saga mein beech ki states dikhti hain (PENDING) — isolation nahi, isliye UI aur logic ko iske liye design karo.</li>
        </ul>
        <h2>Transactional outbox: "DB update + event publish" dono ya koi nahi</h2>
        <p>Bug: order DB mein save hua, phir Kafka publish se pehle crash → event kabhi nahi gaya. Fix: same DB transaction mein <code>outbox</code> table mein event row likho; alag relay (poller / CDC like Debezium) outbox padh ke Kafka pe bheje. At-least-once, isliye consumers idempotent.</p>
        <h2>CQRS: Command Query Responsibility Segregation</h2>
        <p>Writes ka model (normalized, rules) aur reads ka model (denormalized, fast queries ke liye shape) alag. Writes → events → read models (Elasticsearch, Redis, alag tables) update. Read-heavy, complex queries wale systems mein useful; kimat: eventual consistency, do models.</p>
        <h2>Event sourcing</h2>
        <p>State store karne ke bajaye <b>saare events</b> store karo (AccountOpened, Deposited 500, Withdrew 200); current state = events replay. Fayde: poori audit history, kisi bhi time ki state, naye read models replay se. Kimat: complexity, event schema versioning, snapshots chahiye. Bank ledger, accounting, git isi soch ke hain.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Kaunse statements sahi hain?</b></div>
          <ul class="qa-options"><li>✅ Outbox pattern se 'DB commit hua par event nahi gaya' wala bug khatam hota hai<div class="small muted">Event aur data same transaction mein.</div></li><li>❌ Saga full ACID isolation deta hai<div class="small muted">Beech ki states dikhti hain (PENDING). Isolation nahi.</div></li><li>✅ CQRS ka read model write model se thoda peeche ho sakta hai<div class="small muted">Async update, eventual consistency.</div></li><li>✅ Event sourcing mein current state events replay se banti hai, aur snapshots se replay tez hota hai<div class="small muted">Lambi history ke liye snapshots.</div></li><li>❌ Har chhote CRUD app mein event sourcing lagana best practice hai<div class="small muted">Bahut complexity. Jahan audit/history core requirement ho wahan.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Ek business action kai services/DBs mein likhta hai (order + payment + inventory) aur 2PC possible ya sasta nahi.</td></tr>
          <tr><th>Kab nahi</th><td>Sab data ek DB mein hai: normal DB transaction lo, saga ki complexity bekaar hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Saga: compensating actions likhne padte hain, beech ki states dikhti hain. CQRS: do models sync rakhne padte hain (lag). Event sourcing: schema evolution, replay, debugging mushkil.</td></tr>
          <tr><th>Alternatives</th><td>Ek service + ek DB (boundary badlo), transactional outbox (DB write + event ek transaction mein), 2PC (chhote, trusted setups mein).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> "Saga" shabd 1987 ke Garcia-Molina aur Salem ke paper se aaya: lambi transaction ko chhote steps + compensations mein todna. Outbox pattern se "DB mein likha par event nahi gaya" wali problem hal hoti hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Multi-service flow (order + payment + inventory) aaye to bolo: <i>"2PC nahi; saga with compensations (orchestrated), outbox se reliable events, consumers idempotent."</i> Ye ek line distributed data ka poora jawab hai.`
    },
    {
      type: "quiz",
      q: `🏭 <b>Production problem:</b> Order service pehle DB mein order save karti hai, phir Kafka pe <code>OrderPlaced</code> event bhejti hai. Ek din deploy ke beech service crash hui: order DB mein aa gaya par event kabhi nahi gaya, to warehouse ne kabhi pack nahi kiya. Ye kaunsi problem hai aur standard fix?`,
      options: [
        `Kafka slow tha`,
        `Dual-write problem: do alag systems mein likhna atomic nahi. Fix: transactional outbox (order + event ek hi DB transaction mein, phir relay/CDC Kafka pe bheje)`,
        `Pehle event bhejo phir DB mein likho, problem khatam`,
        `2PC hamesha use karo`
      ],
      answer: 1,
      why: `Order pehle event baad mein, ya event pehle order baad mein: dono order mein crash pe ek system dusre se alag ho jaata hai. Outbox mein event usi DB transaction mein ek table mein likha jaata hai; ek alag process (ya Debezium jaisa CDC) use padh ke Kafka pe bhejta hai, at-least-once, isliye consumers idempotent hon. 2PC kaam karta hai par Kafka/DB ke beech bhaari aur kam support. Ye microservices ka bahut common production bug hai.`
    }
  ],
  references: [
    {
      title: "microservices.io: Saga pattern",
      by: "Chris Richardson",
      url: "https://microservices.io/patterns/data/saga.html",
      type: "article"
    },
    {
      title: "microservices.io: Transactional outbox",
      by: "Chris Richardson",
      url: "https://microservices.io/patterns/data/transactional-outbox.html",
      type: "article"
    },
    {
      title: "Designing Data-Intensive Applications, Ch. 11-12",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    }
  ]
});
