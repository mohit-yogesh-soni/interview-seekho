// Polling, long polling, WebSocket, SSE
registerLesson("hld", "realtime", {
  why: `Chat, live scores, notifications, ride tracking, ChatGPT ka streaming jawab: sabko server se client tak data 'push' karna hai, jabki HTTP request-response hai. Chaar tareeke hain aur har ek ka cost alag. Sahi choose karna chat/notification designs ka core hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Fayda</th><th>Nuksaan</th><th>Kab</th></tr>
          <tr><td><b>Short polling</b></td><td>Client har N second: "kuch naya?"</td><td>Simple, har jagah chalta</td><td>Zyaadatar requests khaali; latency = N/2 average</td><td>Kam frequency updates (har minute dashboard)</td></tr>
          <tr><td><b>Long polling</b></td><td>Request khuli rakho jab tak data na aaye (ya timeout ~30s), phir turant nayi request</td><td>Kam khaali responses, near-real-time</td><td>Har message ke baad naya connection, server pe khule requests</td><td>Fallback jab WebSocket na chale</td></tr>
          <tr><td><b>SSE</b> (Server-Sent Events)</td><td>Ek HTTP connection, server <b>one-way</b> stream bhejta rehta hai (text/event-stream)</td><td>Simple, HTTP pe, auto-reconnect</td><td>Sirf server → client</td><td>Notifications, live scores, <b>LLM token streaming</b></td></tr>
          <tr><td><b>WebSocket</b></td><td>HTTP upgrade ke baad <b>two-way</b> persistent TCP connection</td><td>Dono taraf low latency, kam overhead per message</td><td>Stateful connections: LB/scaling mushkil, reconnect logic khud</td><td>Chat, multiplayer games, collaborative editing</td></tr>
        </table>
        <h2>WebSocket ko scale karna</h2>
        `
    },
    {
      type: "flow",
      title: "WebSocket servers ke beech message routing",
      nodes: [
        {
          id: "a",
          label: "User A",
          icon: "📱",
          x: 80,
          y: 90,
          kind: "client",
          w: 120
        },
        {
          id: "s1",
          label: "WS server 1",
          icon: "🔌",
          x: 300,
          y: 90,
          kind: "service"
        },
        {
          id: "reg",
          label: `Registry (Redis)
B → server 2`,
          icon: "📇",
          x: 520,
          y: 270,
          kind: "cache",
          w: 180
        },
        {
          id: "ps",
          label: "Pub/Sub",
          icon: "📡",
          x: 520,
          y: 90,
          kind: "queue"
        },
        {
          id: "s2",
          label: "WS server 2",
          icon: "🔌",
          x: 740,
          y: 90,
          kind: "service"
        },
        {
          id: "b",
          label: "User B",
          icon: "📱",
          x: 920,
          y: 90,
          kind: "client",
          w: 120
        },
        {
          id: "push",
          label: "Push (FCM/APNs)",
          icon: "🔔",
          x: 860,
          y: 270,
          kind: "external",
          w: 170
        }
      ],
      edges: [
        {
          from: "a",
          to: "s1",
          both: true
        },
        {
          from: "s1",
          to: "ps"
        },
        {
          from: "ps",
          to: "s2"
        },
        {
          from: "s2",
          to: "b",
          both: true
        },
        {
          from: "s1",
          to: "reg",
          dashed: true
        },
        {
          from: "s2",
          to: "reg",
          dashed: true
        },
        {
          from: "push",
          to: "b",
          dashed: true
        },
        {
          from: "ps",
          to: "push",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Connect: registry mein entry",
          html: "<p>B ne server 2 se WebSocket khola. Server 2 registry mein likhta hai: B → server 2 (heartbeat se fresh).</p>",
          path: ["b","s2","reg"],
          active: ["reg"]
        },
        {
          title: "A ka message server 1 pe",
          html: "<p>A server 1 se juda hai. Server 1 registry se dekhta hai B kahan hai.</p>",
          path: ["a","s1","reg"],
          active: ["s1","reg"]
        },
        {
          title: "Pub/sub se server 2 → B",
          html: "<p>Server 1 message server 2 ke channel pe publish karta hai, server 2 B ke socket pe push.</p>",
          path: ["s1","ps","s2","b"],
          active: ["b"]
        },
        {
          title: "B offline → push notification",
          html: "<p>Registry mein B nahi: message store karo aur FCM/APNs se push. B wapas aaye to last message id se sync.</p>",
          path: ["ps","push","b"],
          dim: ["s2"],
          active: ["push"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <ul>
          <li>Ek server pe lakhon idle connections ho sakte hain (memory per connection), par connections <b>stateful</b> hain: user kis server pe hai ye registry mein.</li>
          <li>Message doosre server ke user ke liye → pub/sub ya registry se direct route.</li>
          <li>Server restart / deploy = saare connections tootenge: clients ko exponential backoff ke saath reconnect, aur missed messages ke liye "last seen message id se sync".</li>
          <li>LB: L4 ya WebSocket-aware L7; long-lived connections, idle timeouts badhaao, heartbeats (ping/pong).</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>Har case ke liye sahi pairing chuno:</b></div>
          <ul class="qa-options"><li>✅ ChatGPT ka jawab token-by-token dikhana → SSE<div class="small muted">One-way server stream; OpenAI style APIs bhi SSE use karte hain.</div></li><li>✅ WhatsApp chat (dono taraf messages, typing indicators) → WebSocket<div class="small muted">Bidirectional, low latency.</div></li><li>❌ Har 10 minute weather widget refresh → WebSocket<div class="small muted">Overkill. Simple polling.</div></li><li>✅ Cricket live score updates (sirf server → client) → SSE<div class="small muted">One-way, simple.</div></li><li>✅ Corporate proxy WebSocket block kare to long polling fallback<div class="small muted">Socket.IO jaisi libraries yahi karti hain.</div></li></ul>
          
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> 1 crore concurrent users ke WebSocket connections. Ek server ~1 lakh connections sambhal sakta hai. Kitne servers, aur user A (server 3) ka message user B (server 70) tak kaise pahunchega? Deploy ke waqt kya hoga?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>~<b>100+ servers</b> (headroom ke saath ~150)</li><li><b>Connection registry</b> (user → server) Redis mein</li><li>Server-to-server: <b>pub/sub</b> ya direct RPC via registry</li><li>Deploy: <b>graceful drain</b>, clients reconnect with backoff + jitter, sync missed messages</li></ul></div>
          <div class="qa-a"><p>1 crore / 1 lakh = 100 servers minimum, headroom ke saath ~150. Connect pe registry mein <code>B → server-70</code> (TTL + heartbeat se fresh). A ka message server 3 pe aata hai → registry se B ka server → us server ko route (RPC ya per-server pub/sub channel) → B ke socket pe push. B offline → message DB mein store + push notification. Deploy: servers ek ek karke drain (naye connections band, existing ko 'reconnect' signal), clients jitter ke saath reconnect (warna thundering herd), aur reconnect pe last message id se missed messages fetch.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Short polling har 2 second, 1 crore users. Agar 99% polls khaali hon, to server pe roughly kitni useless requests/second?</div>
          <div class="qa-a"><b>Jawab:</b> ~50 lakh. 1 crore / 2s = 50 lakh requests/s, 99% khaali ≈ 49.5 lakh/s bekaar. Isliye real-time at scale mein push (SSE/WebSocket).</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>WebSocket: dono taraf lagaatar (chat, multiplayer). SSE: sirf server se client stream (LLM tokens, live scores, notifications). Long polling: purane clients/proxies jahan dono na chalein.</td></tr>
          <tr><th>Kab nahi</th><td>Data minutes mein ek baar badalta hai: simple polling ya push notification kaafi.</td></tr>
          <tr><th>Kimat (cost)</th><td>Lambe connections = stateful servers, LB/proxy timeouts, reconnect storms (jitter chahiye), "user kis server pe hai" ka registry.</td></tr>
          <tr><th>Alternatives</th><td>Managed realtime services (Pusher, Ably, AWS API Gateway WebSocket), mobile pe APNs/FCM push.</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> OpenAI API <code>stream: true</code> pe server-sent events bhejta hai. WhatsApp ne 2012 mein ek server pe 20 lakh+ TCP connections ka zikr kiya: persistent connections ka scale.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Real-time requirement sunte hi poocho: "one-way ya two-way?" One-way → SSE; two-way → WebSocket; phir scaling: connection registry + pub/sub + reconnect/sync.`
    },
    {
      type: "quiz",
      q: `🏭 <b>Production problem:</b> Ek chat app ke 50 lakh users WebSocket se jude hain. Raat ko deploy hua aur saare connection servers ek saath restart hue. Turant sab clients ne reconnect kiya aur login/auth service gir gayi, jisse aur reconnect attempts hue. Ye kya hai aur fix?`,
      options: [
        `WebSocket ki jagah polling karo`,
        `Reconnect storm (thundering herd): clients random jitter + exponential backoff ke saath reconnect karein, servers ek ek karke drain/restart hon, aur auth pe rate limit/caching`,
        `Users ko logout kar do`,
        `Ek hi bada server rakho`
      ],
      answer: 1,
      why: `Lakhon long-lived connections ek saath tootein to unka reconnect ek DDoS jaisa spike hai. Jitter se reconnects kuch minutes mein phail jaate hain; rolling restart (pehle naye connections band, phir purane ko gradually move) se ek waqt mein sirf thode clients reconnect karte hain. Ye realtime systems (chat, gaming, trading) ki common production problem hai, isliye client SDKs mein backoff + jitter default hona chahiye.`
    }
  ],
  references: [
    {
      title: "MDN: Server-sent events",
      by: "MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events",
      type: "docs"
    },
    {
      title: "MDN: WebSockets API",
      by: "MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
      type: "docs"
    },
    {
      title: "Hello Interview: System Design problem breakdowns",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview",
      type: "course"
    }
  ]
});
