// ChatGPT jaisa LLM chat app — evolution style
registerLesson("hld", "chatgpt", {
  why: `LLM chat app mein bottleneck database nahi, <b>GPU</b> hai: mehenga, kam milta hai, aur ek jawab banne mein seconds lagte hain. Isliye yahan streaming, queueing aur batching sabse important decisions hain. Hum "API call karo aur wait karo" se shuru karenge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> user conversation mein message bheje, model ka jawab <b>likhte hue</b> dikhe (token by token), purani conversations save hon, free/paid plans ki alag limits.</li>
          <li><b>Non-functional:</b> pehla token jaldi aaye (~1 s, isse "time to first token" kehte hain), GPU ka kharcha control mein, overload pe system gire nahi.</li>
        </ul>
        <pre class="code-static">DAU 1 crore × 10 messages = 10 crore messages/din ≈ 1,150/s  (peak ~3,000/s)
Ek jawab ~500 tokens, ~50 tokens/s ki speed se ≈ 10 s
Ek saath chal rahe jawab = aane ki rate × time = 3,000/s × 10 s = 30,000 streams</pre>
        <p>Last line (arrival rate × duration = ek saath kitne, isse <b>Little's law</b> kehte hain) is design ka sabse important number hai. URL shortener mein request 5 ms chalti thi; yahan <b>10 second</b>. To ek saath khule connections aur GPU pe chal rahe kaam dono bahut zyada.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple: sync call</h2>
        <p>Web app user ka message leta hai, ek GPU server (jispe model chal raha hai) ko call karta hai, <b>poora jawab</b> aane ka wait karta hai (~10 s), phir ek saath bhejta hai.</p>
        <h3>Kya toota?</h3>
        <ul>
          <li>User 10 second khaali screen dekhta hai. Lagta hai app hang hai.</li>
          <li>Lambe jawab (60 s+) pe load balancer / proxy ka timeout request kaat deta hai.</li>
        </ul>
        <h3>Jawab "likhte hue" kaise bhejein?</h3>
        <p>Model ek ek token banata hai. Har token bante hi user tak bhejna hai: ye <b>server → client</b> push hai, aur ek request ke liye.</p>
        <table>
          <tr><th>Tareeka</th><th>Is case mein</th></tr>
          <tr><td>Polling ("kuch naya?" har 500 ms)</td><td>Deri + bekaar requests</td></tr>
          <tr><td>WebSocket</td><td>Chalega, par dono-taraf ki zaroorat nahi (user ek baar bhejta hai, phir sirf sunta hai); har proxy/LB pe upgrade support aur connection state sambhalni padti hai</td></tr>
          <tr><td><b>SSE</b> (Server-Sent Events) ⭐</td><td>Normal HTTP response jo band nahi hota; server <code>data: ...</code> lines bhejta rehta hai. Ek taraf hi chahiye tha, aur ye aam HTTP infra (LB, auth, logs) pe chalta hai</td></tr>
        </table>
        <p><b>Decision: SSE.</b> Dhyaan: proxies ka <i>response buffering</i> band karo (warna tokens jama hoke ek saath aate hain) aur idle timeout lamba rakho. User ne tab band kiya to server ko pata chale aur generation rok de, warna GPU bekaar chalta hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: GPU pe kya hota hai, aur batching</h2>
        <p><b>Thoda andar dekho</b> (AI module mein detail):</p>
        <ul>
          <li>Model ke weights (arbon numbers) GPU memory mein load rehte hain. Load hone mein minutes lagte hain, isliye GPU servers ko "jaldi se ek aur chala do" nahi kar sakte. Aur GPUs mehenge hain aur hamesha milte bhi nahi.</li>
          <li>Jawab do phase mein banta hai: <b>prefill</b> (poora prompt ek saath padhna, tez) aur <b>decode</b> (ek baar mein ek token, slow, ~10 s).</li>
          <li><b>KV cache:</b> har naya token pichhle saare tokens ko "dekhta" hai. Unka hisaab (keys/values) baar baar na karna pade, isliye GPU memory mein rakhte hain. Conversation jitni lambi, KV cache utna bada. <b>Ek GPU pe kitne requests ek saath chalein, ye zyaadatar KV cache memory decide karti hai.</b></li>
        </ul>
        <h3>Ek GPU, ek request? Bahut waste</h3>
        <p>Decode mein ek token ke liye GPU ko poore weights memory se padhne padte hain; compute kam, memory padhna zyada. Agar ek hi step mein 32 requests ka agla token banao, weights ek hi baar padhe jaate hain. Isliye <b>batching</b> se throughput kai guna badhta hai.</p>
        <table>
          <tr><th>Batching</th><th>Kaise</th><th>Kami</th></tr>
          <tr><td>Koi nahi</td><td>Ek request ek waqt</td><td>GPU ka bada hissa khaali</td></tr>
          <tr><td>Static batching</td><td>32 requests jama karo, saath chalao, sab khatam hone pe agla batch</td><td>Chhote jawab wale lambe wale ka wait karte hain; naye users batch bharne ka wait</td></tr>
          <tr><td><b>Continuous batching</b> ⭐</td><td>Har decode step pe batch update: jo khatam hua wo nikla, naya request turant juda</td><td>Scheduler complex (par vLLM jaise open-source servers ye dete hain)</td></tr>
        </table>
        <p><b>KV cache memory ka waste:</b> purane systems har request ke liye max length ki jagah pehle se reserve karte the, jo zyaadatar khaali rehti thi. <b>PagedAttention</b> (vLLM) ye memory chhote blocks mein deta hai, jaise OS virtual memory pages deta hai, to zyada requests ek saath fit hote hain.</p>`
    },
    {
      type: "text",
      html: `
        <h3>GPUs full ho gaye to?</h3>
        <p>30,000 streams chahiye, GPUs utne hi hain jitne hain. Spike pe kya karein?</p>
        <table>
          <tr><th>Option</th><th>Kami</th></tr>
          <tr><td>Sirf autoscaling</td><td>Naya GPU server + model load = minutes, aur GPUs available na hon. Spike seconds mein aata hai.</td></tr>
          <tr><td>Turant reject</td><td>Thodi si spike pe bhi users ko error</td></tr>
          <tr><td><b>Queue + priority + max wait</b> ⭐</td><td>Requests ek scheduler ke queue mein; paid plan pehle; zyada der (jaise 30 s) wait ho to "abhi busy hai" message. GPU kabhi overload nahi, users ko fair order.</td></tr>
        </table>
        <p>Isse <b>admission control</b> kehte hain: andar utna hi lo jitna GPU sach mein chala sake.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: SSE + scheduler queue + continuous batching",
      nodes: [
        { id: "u", label: "User (browser)", icon: "👤", x: 90, y: 170, kind: "client", w: 150 },
        { id: "api", label: "Chat API\n(SSE)", icon: "🖥️", x: 300, y: 170, kind: "service", w: 150 },
        { id: "rl", label: "Rate limit\n(tokens/min)", icon: "⏱️", x: 300, y: 330, kind: "cache", w: 160 },
        { id: "sch", label: "Scheduler queue\n(paid > free)", icon: "📨", x: 530, y: 170, kind: "queue", w: 180 },
        { id: "g1", label: "GPU worker 1\nbatch: 32", icon: "🧠", x: 800, y: 70, kind: "service", w: 170 },
        { id: "g2", label: "GPU worker 2\nbatch: 32", icon: "🧠", x: 800, y: 270, kind: "service", w: 170 }
      ],
      edges: [
        { from: "u", to: "api", both: true },
        { from: "api", to: "rl", both: true },
        { from: "api", to: "sch" },
        { from: "sch", to: "g1" },
        { from: "sch", to: "g2" },
        { from: "g1", to: "api", dashed: true },
        { from: "g2", to: "api", dashed: true }
      ],
      steps: [
        { title: "Limit check → queue", html: "<p>Plan ki token limit Redis se check, request scheduler ke queue mein.</p>", path: ["u", "api", "rl", "api", "sch"], active: ["sch"] },
        { title: "Batch mein jagah → GPU", html: "<p>GPU 1 ke batch mein ek request khatam hua: naya turant juda (continuous batching).</p>", path: ["sch", "g1"], active: ["g1"] },
        { title: "Tokens stream (SSE)", html: "<p>Har decode step ka token API se user tak <code>data:</code> line ban ke.</p>", path: ["g1", "api", "u"], active: ["u"], color: "#1971c2" },
        { title: "Spike: GPUs full", html: "<p>Queue badhti hai, paid pehle. Max wait cross ho to free user ko 'busy' message. GPU overload nahi.</p>", path: ["u", "api", "sch"], fail: ["g2"], active: ["sch"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: conversations aur "model ko yaad kaise rehta hai"</h2>
        <p><b>Important:</b> model khud kuch yaad nahi rakhta. Har naye message pe app <b>poori pichhli conversation</b> (ya uska hissa) prompt mein dobara bhejti hai. Isliye:</p>
        <ul>
          <li>Lambi conversation = har turn pe zyada tokens = zyada GPU kaam aur kharcha.</li>
          <li>Model ki <b>context window</b> (max tokens) se lambi ho jaaye to purane messages kaato ya unka summary bhejo.</li>
        </ul>
        <table>
          <tr><th>Sawaal</th><th>Faisla</th><th>Kyun / alternative</th></tr>
          <tr><td>Conversations/messages kahan</td><td>Postgres (<code>conversations</code>, <code>messages</code>), baad mein <code>user_id</code> se shard</td><td>Access pattern: "meri conversations ki list" aur "ek conversation ke messages": dono user_id/conversation_id se. Writes ~3k/s, ek Postgres + shard plan theek. Cassandra jaisa store bhi valid jab writes bahut badhein.</td></tr>
          <tr><td>Same prefix baar baar (system prompt, conversation ka purana hissa)</td><td><b>Prefix caching</b>: pichhle turn ka KV cache GPU pe rakho aur conversation ko usi worker pe bhejo</td><td>Prefill dobara nahi: pehla token jaldi, GPU kaam kam. Kimat: routing thoda sticky.</td></tr>
          <tr><td>Rate limit kis cheez pe</td><td><b>Tokens per minute</b> (requests per minute ke saath)</td><td>Ek 100k-token request 100 chhoti requests jitna GPU khata hai. Requests ginna kaafi nahi.</td></tr>
          <tr><td>Jawab beech mein toota</td><td>Generated tokens conversation mein save karte chalo; user "regenerate" kar sake</td><td>10 s ka kaam phir se na karna pade</td></tr>
        </table>
        <h2>Stage 4: aage kya badhega</h2>
        <ul>
          <li><b>Safety:</b> input/output pe moderation check (chhote, sasta model), streaming ke saath parallel.</li>
          <li><b>Model routing:</b> simple sawaal chhote model pe, mushkil bade pe. Kharcha bahut kam hota hai.</li>
          <li><b>Kai regions mein GPU pools:</b> scheduler jahan khaali GPU ho wahan bheje; user data ka region rules (privacy laws) bhi dekhna.</li>
          <li><b>Files/images:</b> blob storage mein, prompt mein unka processed text/embedding.</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <div class="tip-box">🏭 <b>Production mein:</b>
          <ul>
            <li>OpenAI API mein <code>stream: true</code> dene pe jawab <b>server-sent events</b> ke roop mein aata hai (official docs). Yani ChatGPT jaisa experience SSE se hi banta hai.</li>
            <li><b>vLLM</b> (UC Berkeley, SOSP 2023 paper "PagedAttention") ne KV cache ko pages mein manage karke, unke measurements mein, purane serving systems se <b>2-4× throughput</b> dikhaya.</li>
            <li><b>Continuous (iteration-level) batching</b> ka idea Orca paper (OSDI 2022) se popular hua; aaj vLLM jaise servers ka default hai.</li>
          </ul>
        </div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>10 s khaali screen, timeouts</td><td>SSE streaming</td><td>Polling: deri; WebSocket: dono taraf ki zaroorat nahi</td></tr>
          <tr><td>2</td><td>GPU ek request pe khaali</td><td>Continuous batching (vLLM)</td><td>Static batching: lambe ka wait</td></tr>
          <tr><td>2</td><td>KV cache memory waste</td><td>PagedAttention</td><td>Max length reserve: kam requests fit</td></tr>
          <tr><td>2</td><td>Spike, GPUs fixed</td><td>Scheduler queue + priority + max wait</td><td>Sirf autoscaling: minutes lagte hain</td></tr>
          <tr><td>3</td><td>Model stateless, history chahiye</td><td>Postgres conversations + history in prompt (truncate/summary)</td><td>-</td></tr>
          <tr><td>3</td><td>Bade prompts ka kharcha</td><td>Token-based rate limits, prefix caching</td><td>Sirf request count</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Little's law se "30,000 ek saath streams" nikaalo: ye GPU count, connections aur queue sab justify karta hai. Phir SSE, continuous batching aur admission control. DB is design ka hero nahi hai, ye bolna bhi achha signal hai.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 20 March 2023: ChatGPT ko kuch ghante band karna pada kyunki kuch users ko <b>doosre users</b> ki chat history ke titles dikhne lage, aur ek 9 ghante ki window mein ~1.2% Plus subscribers ki kuch payment details (naam, email, address, card type, expiry date aur last 4 digits) doosron ko dikh sakti thi. OpenAI ke mutabik wajah Redis client library (redis-py) ka ek bug tha jo cancelled requests ke baad connection pe galat response chhod deta tha. Design sabak?`,
      options: [
        `Redis kabhi use mat karo`,
        `Shared cache/connection pool se aaya data user ka hi hai, ye verify karo (key mein user id + response pe owner check), cancellations/timeouts pe connection discard karo, aur sensitive data ka cache mein rehna kam karo`,
        `Users ko kam requests karne do`,
        `Chat history feature hata do`
      ],
      answer: 1,
      why: `OpenAI ki post ("March 20 ChatGPT outage: Here's what happened") ke mutabik ek server change se request cancellations badhe, jisse library ka race condition zyada trigger hua; unhone bug fix ko upstream bheja aur extra checks lagaye ki returned data requesting user ka hi ho. Sabak: multi-tenant system mein ek user ka data doosre ko dikhna sabse bura failure hai; defense in depth: har layer pe ownership check.`
    }
  ],
  references: [
    { title: "March 20 ChatGPT outage: Here's what happened", by: "OpenAI", url: "https://openai.com/index/march-20-chatgpt-outage/", type: "article" },
    { title: "OpenAI docs: Streaming API responses", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/streaming-responses", type: "docs" },
    { title: "Efficient Memory Management for LLM Serving with PagedAttention (vLLM)", by: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180", type: "article" },
    { title: "Orca: A Distributed Serving System for Transformer-Based Generative Models", by: "Yu et al., OSDI 2022", url: "https://www.usenix.org/conference/osdi22/presentation/yu", type: "article" },
    { title: "MDN: Server-sent events", by: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events", type: "docs" }
  ]
});
