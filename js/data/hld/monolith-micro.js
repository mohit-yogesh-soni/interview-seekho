// Monolith vs Microservices
registerLesson("hld", "monolith-micro", {
  why: `Har design mein 'kitni services?' ka sawaal aata hai. Microservices fashion nahi, ek trade-off hai: team independence aur alag scaling ke badle network, consistency aur operations ki complexity. Interviewer sunna chahta hai ki aap kab todte ho aur kab nahi.`,
  blocks: [
    {
      type: "text",
      html: `
        <table>
          <tr><th></th><th>Monolith (modular)</th><th>Microservices</th></tr>
          <tr><td>Deploy</td><td>Ek unit</td><td>Har service alag</td></tr>
          <tr><td>Calls</td><td>Function call (ns)</td><td>Network call (ms), fail ho sakti hai</td></tr>
          <tr><td>Data</td><td>Ek DB, transactions aasaan</td><td>Har service ka apna DB; cross-service consistency = saga/events</td></tr>
          <tr><td>Scaling</td><td>Poora app saath</td><td>Hot service alag scale</td></tr>
          <tr><td>Teams</td><td>Ek codebase pe sab: merge conflicts, slow releases (bade org mein)</td><td>Team per service, independent releases</td></tr>
          <tr><td>Ops</td><td>Simple</td><td>Service discovery, tracing, CI/CD per service, versioning</td></tr>
        </table>
        <h2>Kab todein (signals)</h2>
        <ol>
          <li><b>Team scale:</b> bahut saari teams ek codebase pe ek doosre ko block kar rahi hain.</li>
          <li><b>Alag scaling / tech needs:</b> video transcoding CPU-heavy, baaki app light; ya ML service Python mein.</li>
          <li><b>Alag reliability:</b> payments ko recommendations ki bug se isolate karna.</li>
          <li><b>Clear domain boundaries</b> (bounded contexts): orders, payments, catalog jinke apne data aur rules hain.</li>
        </ol>
        <p><b>Kab nahi:</b> chhoti team, naya product (domain abhi clear nahi). Shuru mein <b>modular monolith</b> (saaf modules, apne tables, interfaces se baat), baad mein jo module zaroori ho wo nikaalo (strangler fig pattern).</p>
        <p><b>Distributed monolith</b> (sabse bura): services alag par ek saath deploy karni padti hain, ek doosre ke DB padhti hain, ek request 10 sync hops. Microservices ki saari kimat, koi fayda nahi.</p>`
    },
    {
      type: "flow",
      title: "Sync chain ki availability problem",
      nodes: [
        {
          id: "client",
          label: "Client",
          icon: "📱",
          x: 80,
          y: 160,
          kind: "client",
          w: 110
        },
        {
          id: "order",
          label: "Order svc",
          icon: "📦",
          x: 330,
          y: 160,
          kind: "service"
        },
        {
          id: "user",
          label: "User svc",
          icon: "👤",
          x: 620,
          y: 60,
          kind: "service"
        },
        {
          id: "rest",
          label: "Restaurant svc",
          icon: "🍽️",
          x: 620,
          y: 260,
          kind: "service",
          w: 170
        },
        {
          id: "snap",
          label: `Order DB
+ name snapshot`,
          icon: "🗄️",
          x: 880,
          y: 160,
          kind: "data",
          w: 170
        }
      ],
      edges: [
        {
          from: "client",
          to: "order",
          both: true
        },
        {
          from: "order",
          to: "user",
          both: true
        },
        {
          from: "order",
          to: "rest",
          both: true
        },
        {
          from: "order",
          to: "snap",
          both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Har order page pe 2 sync calls",
          html: "<p>Order dikhane ke liye user ka naam aur restaurant ka naam alag services se. Latency judti hai.</p>",
          paths: [
            ["client","order","user","order"],
            ["client","order","rest","order"]
          ],
          dim: ["snap"]
        },
        {
          title: "Ek service down = page down",
          html: "<p>User svc down: order page bhi fail. 3 services 99.9% each → chain ~99.7%.</p>",
          path: ["client","order","user"],
          fail: ["user"],
          dim: ["snap"]
        },
        {
          title: "Fix: order ke saath snapshot",
          html: "<p>Order banate waqt naam copy kar lo (ya events se local read model). Ab page ek service se.</p>",
          path: ["client","order","snap","order","client"],
          active: ["snap"],
          dim: ["user","rest"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Food delivery startup, 8 engineers, 1 saal purana product. Kaunsi baatein sahi hain?</b></div>
          <ul class="qa-options"><li>✅ Modular monolith se shuru karna theek hai<div class="small muted">Chhoti team, domain abhi badal raha.</div></li><li>❌ Har entity (User, Order, Dish) ki alag microservice<div class="small muted">Nano-services: har request kai network hops, koi fayda nahi.</div></li><li>✅ Agar dispatch/rider-matching bahut CPU aur scale maange to use pehle alag karna<div class="small muted">Clear scaling need + clear boundary.</div></li><li>❌ Services ek doosre ki DB tables seedha padhein taaki fast ho<div class="small muted">Coupling. API/events se baat.</div></li><li>✅ Payment ko isolate karna (alag deploy, kam changes) reasonable hai<div class="small muted">Alag reliability/compliance needs.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Order service ko order dikhate waqt user ka naam (User service) aur restaurant ka naam (Restaurant service) chahiye. Har order page pe 2 sync calls. Problems aur options?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Sync calls: <b>latency jodti</b> hai aur ek service down = page down (availability multiply)</li><li>Option: order mein <b>denormalized copy</b> (name snapshot) events se update</li><li>Option: parallel calls + cache + timeout/fallback</li><li>Option: BFF/gateway aggregation</li></ul></div>
          <div class="qa-a"><p>3 services ki availability multiply hoti hai (99.9³ ≈ 99.7%), aur latency judti hai. Options: (1) order banate waqt user/restaurant ka naam <b>snapshot</b> karke order mein rakho (order ke time ka naam waise bhi sahi fact hai); ya events (UserRenamed) se local read model update; (2) zaroori ho to calls parallel, short timeout, cache, aur fallback (naam na mile to id dikhao); (3) UI ke liye BFF aggregation. Rule: sync chain lambi mat karo.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Microservices tab jab alag teams alag release cycle chahti hon, ya ek hissa bilkul alag scale/technology maange.</td></tr>
          <tr><th>Kab nahi</th><td>Chhoti team (jaise &lt; 10-15 engineers), product abhi badal raha hai, domain boundaries saaf nahi.</td></tr>
          <tr><th>Kimat (cost)</th><td>Network calls (latency, failures), distributed transactions (saga), har service ka deploy/monitoring/on-call, data consistency.</td></tr>
          <tr><th>Alternatives</th><td><b>Modular monolith</b>: ek deploy, par andar saaf modules aur boundaries. Baad mein todna aasaan.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Prime Video ki ek monitoring service (2023 blog) distributed serverless components se ek process mein laayi gayi aur infra kharcha ~90% kam hua, kyunki components ke beech data S3 se guzar raha tha. Sabak: todne ka faisla data flow aur team structure dekh ke.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Design mein services draw karte waqt bolo: <i>"Ye bounded contexts hain; har service ka apna DB; sync calls sirf jahan zaroori, baaki events."</i> Aur agar interviewer chhota scale bole to modular monolith bhi bolna valid aur mature answer hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Segment (2018 blog "Goodbye Microservices"): data ko 100+ destinations (analytics tools) pe bhejne ke liye har destination ki alag microservice aur alag queue thi. Shared library ka ek change sab services mein deploy karna, aur har service ki alag scaling/on-call bhaari ho gaya. Unhone kya kiya aur kyun?`,
      options: [
        `Aur microservices banayi`,
        `Destinations ko ek service (monolith) mein jod diya: ek codebase, ek deploy, shared code ek jagah; operational kaam kam hua aur developer productivity badhi`,
        `Sab kuch serverless kar diya`,
        `Destinations band kar diye`
      ],
      answer: 1,
      why: `Segment ke engineers ne likha ki microservices ka fayda (alag scaling, isolation) unke case mein kam tha aur kimat (har service ka operations, library versions ka drift) zyada. Ek service mein laane ke baad tests aur deploys simple hue. Sabak: microservices tab jab teams/ownership aur scaling sach mein alag hon; warna modular monolith aksar behtar hai. (Prime Video 2023 ka case bhi isi jaisa tha.)`
    }
  ],
  references: [
    { title: "Prime Video: scaling up the audio/video monitoring service and reducing costs by 90% (archived)", by: "Prime Video Tech", url: "https://web.archive.org/web/20240805183535/https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90", type: "article" },
    {
      title: "Building Microservices (2nd ed.)",
      by: "Sam Newman",
      type: "book"
    },
    {
      title: "Martin Fowler: MonolithFirst",
      by: "Martin Fowler",
      url: "https://martinfowler.com/bliki/MonolithFirst.html",
      type: "article"
    }
  ]
});
