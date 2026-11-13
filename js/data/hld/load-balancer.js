// Load Balancer
registerLesson("hld", "load-balancer", {
  why: `Horizontal scaling ka darwaza load balancer hai: users ko ek address dikhta hai, peeche kai servers. Interview mein L4 vs L7, algorithms (round robin, least connections, consistent hashing), aur health checks ke sawaal aate hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Kya karta hai</h2>
        <ul>
          <li><b>Distribute:</b> requests ko healthy servers mein baantna.</li>
          <li><b>Health checks:</b> har server ko har kuch second ping (<code>/health</code>); fail hua to rotation se bahar, theek hua to wapas.</li>
          <li><b>Single entry point:</b> TLS termination, ek IP/DNS. Servers private network mein.</li>
          <li>LB khud single point of failure na bane: active-passive pair ya managed LB (AWS ALB/NLB) jo andar se redundant hai.</li>
        </ul>
        <h2>L4 vs L7</h2>
        <table>
          <tr><th></th><th>L4 (transport)</th><th>L7 (application)</th></tr>
          <tr><td>Kya dekhta hai</td><td>IP + port (TCP/UDP)</td><td>HTTP: URL path, headers, cookies</td></tr>
          <tr><td>Routing</td><td>Connection level, content nahi padhta</td><td><code>/api/*</code> → API servers, <code>/images/*</code> → static, header se A/B</td></tr>
          <tr><td>Speed</td><td>Bahut tez, kam kaam</td><td>Thoda zyada kaam (HTTP parse, TLS terminate)</td></tr>
          <tr><td>Examples</td><td>AWS NLB, LVS</td><td>AWS ALB, Nginx, Envoy, HAProxy (L7 mode)</td></tr>
        </table>
        <h2>Algorithms</h2>
        <table>
          <tr><th>Algorithm</th><th>Kaise</th><th>Kab</th></tr>
          <tr><td>Round robin</td><td>Baari baari</td><td>Requests similar, servers similar</td></tr>
          <tr><td>Weighted round robin</td><td>Bada server zyada share</td><td>Alag size ke servers</td></tr>
          <tr><td>Least connections</td><td>Jiske paas abhi kam active connections</td><td>Requests ka time bahut alag (kuch lambi)</td></tr>
          <tr><td>IP hash / consistent hashing</td><td>Same key → same server</td><td>Cache affinity, sticky (par stateless better)</td></tr>
        </table>`
    },
    {
      type: "flow",
      title: "Round robin, health check, least connections",
      nodes: [
        {
          id: "users",
          label: "Users",
          icon: "👥",
          x: 90,
          y: 160,
          kind: "client",
          w: 120
        },
        {
          id: "lb",
          label: "Load Balancer",
          icon: "⚖️",
          x: 340,
          y: 160,
          kind: "service"
        },
        {
          id: "a",
          label: "Server A",
          icon: "🖥️",
          x: 650,
          y: 50,
          kind: "service"
        },
        {
          id: "b",
          label: "Server B",
          icon: "🖥️",
          x: 650,
          y: 160,
          kind: "service"
        },
        {
          id: "c",
          label: "Server C",
          icon: "🖥️",
          x: 650,
          y: 270,
          kind: "service"
        },
        {
          id: "hc",
          label: "Health checker",
          icon: "🩺",
          x: 340,
          y: 290,
          kind: "external",
          w: 160
        }
      ],
      edges: [
        {
          from: "users",
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
          from: "hc",
          to: "a",
          dashed: true
        },
        {
          from: "hc",
          to: "b",
          dashed: true
        },
        {
          from: "hc",
          to: "c",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Round robin: request 1 → A",
          html: "<p>Baari baari: pehli request A ko.</p>",
          path: ["users","lb","a"],
          active: ["a"]
        },
        {
          title: "Request 2 → B, request 3 → C",
          html: "<p>Requests barabar bant-ti hain jab servers aur requests similar hon.</p>",
          paths: [
            ["users","lb","b"],
            ["users","lb","c"]
          ],
          active: ["b","c"]
        },
        {
          title: "Health check fail: B rotation se bahar",
          html: `<p>Health checker har kuch second <code>/health</code> ping karta hai. B ne lagatar fail kiya: LB ab B ko traffic nahi bhejta.</p>`,
          paths: [
            ["hc","b"],
            ["users","lb","a"],
            ["users","lb","c"]
          ],
          fail: ["b"]
        },
        {
          title: "Least connections: lambi requests",
          html: `<p>A pe 50 slow requests chal rahi hain, C pe 2. Least connections naya kaam C ko deta hai, round robin aankh band karke A ko bhi deta.</p>`,
          path: ["users","lb","c"],
          active: ["c"],
          fail: ["b"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> API mein kuch requests 10ms aur kuch 5 second (report generation) leti hain. Round robin se kya problem, aur better algo?</div>
          <div class="qa-a"><b>Jawab:</b> RR ek server ko lambi requests ke ek ke baad ek bhej sakta hai jabki doosra khaali; least connections busy server ko avoid karega (aur best: lambi jobs ko async queue mein). RR request ka 'weight' nahi dekhta. Least connections live load dekhta hai. Architecture level fix: 5 second wala kaam request path se nikaalo (queue + worker).</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> "Load balancer khud gir gaya to?" Single point of failure kaise hataoge, aur ek server bina error ke slow ho jaaye (health check pass) to kya karoge?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>LB redundancy: <b>active-passive pair</b> with floating IP / managed LB / DNS multiple</li><li>Health check sirf alive nahi, <b>meaningful</b> (deep check / latency)</li><li><b>Outlier detection</b> / least connections / slow server ko eject</li></ul></div>
          <div class="qa-a"><p><b>LB SPOF:</b> do LBs active-passive with floating/virtual IP (keepalived/VRRP), ya cloud ka managed LB (ALB/NLB andar se multi-AZ). DNS level pe kai LB IPs bhi.</p><p><b>Slow server:</b> simple <code>/health</code> 200 deta rahega. Isliye: health check mein timeout + latency threshold, LB/service mesh ka <b>outlier detection</b> (Envoy: consecutive 5xx ya high latency pe kuch der eject), aur least-connections/least-latency algorithm jo slow server ko apne aap kam bheje.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Ek se zyada app servers hon, ya ek server gire to traffic doosre pe jaana chahiye (health checks).</td></tr>
          <tr><th>Kab nahi</th><td>Ek hi server hai aur HA ki zaroorat nahi.</td></tr>
          <tr><th>Kimat (cost)</th><td>Ek extra network hop (~sub-ms), LB khud HA pair/managed hona chahiye, WebSocket jaise lambe connections pe dhyaan (least-connections).</td></tr>
          <tr><th>Alternatives</th><td>DNS round robin: sasta, par clients DNS cache karte hain, to gira server minutes tak traffic paata hai. Client-side LB (gRPC, service mesh): internal service-to-service ke liye, ek hop kam.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Cloud mein aksar managed LB: AWS ALB (L7, HTTP path/host routing) aur NLB (L4, TCP, bahut high throughput). Khud chalana ho to NGINX, HAProxy, Envoy.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Diagram mein LB dikhate hi bolo: <i>"L7 LB (TLS termination, path routing), health checks, aur LB khud redundant."</i> Ye teen cheezein bina pooche bolna seniority dikhata hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 24 December 2012: AWS us-east-1 mein ek maintenance process galti se production ELB (load balancer) ka state data delete kar gaya. Netflix ka streaming Christmas Eve pe ghanton tak kai devices pe toot gaya, jabki Netflix ke apne servers theek the. Is incident ka design sabak kya hai?`,
      options: [
        `Load balancer kabhi fail nahi hota`,
        `Load balancer bhi ek component hai jo fail ho sakta hai; traffic ko doosre LB/region pe shift karne ka raasta (DNS-level failover, multi-region) chahiye`,
        `LB hata ke clients ko seedha servers ka IP do`,
        `Servers aur bade karo`
      ],
      answer: 1,
      why: `AWS ki summary ke mutabik ELB state data delete hone se kai load balancers ki configuration bigdi. Netflix ne baad mein "Isthmus" banaya taaki ek region ke ELB fail hone pe bhi traffic doosre raaste se aaye, aur aage chal ke multi-region active-active setup kiya. Sabak: jo component har request ke raaste mein hai (LB, DNS, gateway), uska bhi failure plan chahiye.`
    }
  ],
  references: [
    { title: "Summary of the December 24, 2012 Amazon ELB Service Event", by: "AWS", url: "https://aws.amazon.com/message/680587/", type: "article" },
    {
      title: "System Design Primer: Load balancer",
      by: "Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article"
    },
    {
      title: "Gaurav Sen (YouTube): load balancing",
      by: "Gaurav Sen",
      url: "https://www.youtube.com/@gkcs",
      type: "video"
    }
  ]
});
