// Reverse proxy aur API Gateway
registerLesson("hld", "api-gateway", {
  why: `Microservices mein har client har service ko seedha call kare to auth, rate limiting, logging har service mein copy hota hai. API Gateway ek darwaza hai jahan ye 'cross-cutting' kaam ek baar hote hain. Interview mein ye LB se kaise alag hai, aur kya gateway mein nahi daalna chahiye, ye poocha jaata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Reverse proxy → API Gateway</h2>
        <p><b>Forward proxy:</b> client ki taraf (office proxy, VPN): server ko client ka pata nahi. <b>Reverse proxy:</b> server ki taraf (Nginx): client ko servers ka pata nahi. Kaam: TLS termination, compression, static file caching, load balancing.</p>
        <p><b>API Gateway</b> = reverse proxy + API-specific kaam:</p>
        `
    },
    {
      type: "flow",
      title: "API Gateway: routing, policy aur aggregation",
      nodes: [
        {
          id: "mobile",
          label: "Mobile app",
          icon: "📱",
          x: 90,
          y: 90,
          kind: "client"
        },
        {
          id: "web",
          label: "Web",
          icon: "💻",
          x: 90,
          y: 240,
          kind: "client"
        },
        {
          id: "gw",
          label: `API Gateway
auth · rate limit · trace`,
          icon: "🚪",
          x: 380,
          y: 165,
          kind: "service",
          w: 190
        },
        {
          id: "users",
          label: "User svc",
          icon: "👤",
          x: 720,
          y: 50,
          kind: "service"
        },
        {
          id: "orders",
          label: "Order svc",
          icon: "📦",
          x: 720,
          y: 165,
          kind: "service"
        },
        {
          id: "pay",
          label: "Payment svc",
          icon: "💳",
          x: 720,
          y: 280,
          kind: "service"
        }
      ],
      edges: [
        {
          from: "mobile",
          to: "gw", both: true
        },
        {
          from: "web",
          to: "gw", both: true
        },
        {
          from: "gw",
          to: "users"
        },
        {
          from: "gw",
          to: "orders"
        },
        {
          from: "gw",
          to: "pay"
        }
      ],
      steps: [
        {
          title: "Routing by path",
          html: `<p><code>/orders/*</code> wali request gateway Order service ko bhejta hai. Client ko services ke address pata hi nahi.</p>`,
          path: ["web","gw","orders"],
          active: ["gw","orders"]
        },
        {
          title: "Token galat → gateway pe hi 401",
          html: "<p>JWT verify gateway pe hota hai. Galat token wali request services tak pahunchti hi nahi.</p>",
          path: ["mobile","gw","mobile"],
          fail: ["gw"],
          dim: ["users","orders","pay"]
        },
        {
          title: "Rate limit cross → 429",
          html: "<p>Per user / API key limits gateway pe (shared Redis counters). Services ko overload se bachaya.</p>",
          path: ["web","gw","web"],
          active: ["gw"],
          dim: ["users","orders","pay"]
        },
        {
          title: "BFF aggregation: ek call, teen services",
          html: `<p>Mobile home screen ke liye gateway server-side pe teen calls <b>parallel</b> karta hai aur ek combined response deta hai.</p>`,
          paths: [
            ["mobile","gw","users"],
            ["mobile","gw","orders"],
            ["mobile","gw","pay"]
          ],
          active: ["gw"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <table>
          <tr><th>Gateway mein daalo</th><th>Gateway mein MAT daalo</th></tr>
          <tr><td>Authentication (token valid hai?)</td><td>Business logic (order cancel ho sakta hai?)</td></tr>
          <tr><td>Rate limiting, quotas</td><td>Service-specific authorization ka poora logic ("ye user is order ka owner hai?" service jaane)</td></tr>
          <tr><td>Routing, versioning, canary (5% traffic v2 pe)</td><td>Heavy data transformation</td></tr>
          <tr><td>Observability (trace id inject, access logs)</td><td>Database calls</td></tr>
        </table>
        <p><b>BFF (Backend for Frontend):</b> mobile ke liye alag gateway jo 3 services se data jod ke ek chhota response de (kam round trips, mobile network slow). Web ka alag.</p>
        <p><b>LB vs Gateway:</b> LB ka kaam traffic baantna hai. Gateway ka kaam API policy hai, aur wo khud bhi LB ke peeche kai instances mein chalta hai. Examples: Kong, AWS API Gateway, Envoy/Istio ingress, Spring Cloud Gateway.</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Kaunsi responsibilities gateway ke liye <b>sahi</b> hain?</b></div>
          <ul class="qa-options"><li>✅ JWT signature aur expiry verify karna<div class="small muted">Har service mein copy karne se bacha.</div></li><li>✅ Per API-key 1000 req/min limit<div class="small muted">Classic gateway kaam (shared Redis ke saath).</div></li><li>❌ Order ka total calculate karna<div class="small muted">Business logic service ka.</div></li><li>✅ Har request mein trace-id header daalna<div class="small muted">Distributed tracing ki shuruaat.</div></li><li>❌ Payment refund ka eligibility check<div class="small muted">Domain rule. Gateway ko domain ka pata nahi hona chahiye.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Gateway ke <b>risks</b> kya hain aur kaise sambhaloge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li><b>Single point of failure</b> / bottleneck: kai instances + LB + autoscale</li><li>Extra <b>latency hop</b>: gateway halka rakho</li><li>Business logic ghus ke <b>god service</b> ban jaana; team bottleneck</li><li>Timeouts / circuit breakers gateway se backends tak</li></ul></div>
          <div class="qa-a"><p>Gateway sabke beech mein hai, to (1) wo gira to sab gira: stateless kai instances, LB ke peeche, autoscaling, multi-AZ; (2) har request ek extra hop: logic halka, connection pooling; (3) teams usme business rules daalne lagti hain aur wo naya monolith ban jaata hai: policy only, routes config se; (4) ek slow backend gateway ke threads kha na jaaye: per-route timeouts aur circuit breakers (reliability lesson).</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Mobile app home screen ke liye 4 services (profile, offers, orders, recommendations) se data chahiye. Mobile network pe 4 alag calls slow hain. Kya karoge?</div>
          <div class="qa-a"><b>Jawab:</b> BFF / gateway aggregation: ek endpoint jo server side pe 4 calls parallel kare aur combined response de. Datacenter ke andar calls tez hain (~1ms), mobile → server slow (50-200ms). Aggregation server side pe karo. Partial failure (recommendations down) pe baaki data phir bhi bhejo.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Kai microservices hon aur auth, rate limiting, routing, logging har service mein duplicate ho rahe hon; public API ho.</td></tr>
          <tr><th>Kab nahi</th><td>Ek monolith hai: ek reverse proxy (NGINX) + app ke andar middleware kaafi hai.</td></tr>
          <tr><th>Kimat (cost)</th><td>Extra hop, gateway gira = sab gira (HA zaroori), aur agar har team ko gateway config ke liye ek central team ka wait ho to wo bottleneck ban jaata hai.</td></tr>
          <tr><th>Alternatives</th><td>Reverse proxy (sirf routing/TLS), service mesh (Istio/Linkerd: andar ke service-to-service traffic ke liye), BFF (har client type ka apna chhota gateway).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Netflix ne apna gateway Zuul banaya aur open source kiya. Managed options: AWS API Gateway, Kong, Apigee.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Microservices diagram mein clients aur services ke beech gateway dikhao aur ek line bolo: <i>"Auth, rate limiting, routing aur tracing gateway pe; business logic services mein."</i>`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 2 July 2019: Cloudflare ke WAF (edge pe har HTTP request check karne wala layer) mein ek naya rule deploy hua jiska regular expression bahut zyada backtracking karta tha. Rule ek saath poori duniya ke servers pe gaya, CPU 100% ho gaya, aur ~27 minute tak Cloudflare ke peeche ki sites pe errors aaye. Gateway/edge layer ke liye sabse bada sabak?`,
      options: [
        `Regex kabhi use mat karo`,
        `Jo code har request pe chalta hai uska change staged rollout (pehle thode servers, phir sab) se jaaye, aur CPU/time limits + turant band karne ka switch ho`,
        `WAF hata do`,
        `Zyada servers lagao`
      ],
      answer: 1,
      why: `Cloudflare ki post-mortem ke mutabik WAF rules ek saath globally push hote the, jabki baaki software staged rollout se jaata tha. Unhone WAF rules ke liye bhi staged rollout, regex execution ki limits, aur aise regex engines ki taraf jaane ki baat ki jo backtracking explosion se bachte hain. Sabak: gateway sab services ke aage hai, to wahan ka ek bug sab ko girata hai; isliye uske changes sabse zyada dheere aur saavdhaani se.`
    }
  ],
  references: [
    { title: "Details of the Cloudflare outage on July 2, 2019", by: "Cloudflare", url: "https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/", type: "article" },
    { title: "Netflix Zuul (GitHub)", by: "Netflix", url: "https://github.com/Netflix/zuul", type: "docs" },
    {
      title: "System Design Primer: Reverse proxy",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    },
    {
      title: "ByteByteGo",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "course"
    }
  ]
});
