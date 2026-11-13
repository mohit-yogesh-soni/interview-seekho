// Agent kya hai
registerLesson("ai", "what-agent", {
  why: `"Agent" aaj ka sabse zyada bola jaane wala, aur sabse kam define kiya hua, shabd hai. Asal mein ye ek simple loop hai: LLM sochta hai, ek tool chalata hai, nateeja dekhta hai, phir agla kadam. Ye loop samajh liya to aap pehchaan paoge ki kab agent chahiye aur kab ek simple fixed workflow behtar (aur sasta) hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: ek LLM call kaafi nahi</h2>
        <p>User: "Mera kal ka Swiggy order abhi tak refund nahi hua, check karo." Isko solve karne ke liye: order dhoondho, refund status dekho, policy check karo, shayad ticket banao. Ek LLM call ke paas ye data hai hi nahi, aur kaunsa step pehle, ye input pe depend karta hai.</p>
        <h2>Teen levels</h2>
        <table>
          <tr><th>Level</th><th>Kya</th><th>Kaun decide karta hai agla step</th></tr>
          <tr><td>LLM call</td><td>Ek prompt, ek jawab</td><td>-</td></tr>
          <tr><td><b>Workflow</b></td><td>Kai LLM calls + tools, <b>pehle se likhe raaste</b> pe (code mein if/else)</td><td>Aapka code</td></tr>
          <tr><td><b>Agent</b></td><td>LLM ek loop mein khud tay karta hai kaunsa tool, kis input se, aur kab ruk-na hai</td><td>LLM</td></tr>
        </table>
        <p>Anthropic ke "Building effective agents" article mein yahi farak hai, aur unki salah bhi: sabse simple cheez se shuru karo, agent tab jab raasta pehle se tay na ho sake.</p>
        <h2>Agent loop (ReAct idea)</h2>
        <p>2022 ke ReAct paper ne dikhaya ki model ko <b>soch</b> (reason) aur <b>kaam</b> (act) baari baari karne do: Thought → Action (tool call) → Observation (tool ka result) → Thought ... jab tak jawab na mil jaaye.</p>`
    },
    {
      type: "steps",
      title: "Agent loop: \"refund kab aayega?\"",
      steps: [
        { title: "Thought 1", html: "<p>\"Pehle user ka kal ka order chahiye.\" → <b>Action:</b> <code>list_orders(user=42, date=yesterday)</code></p>" },
        { title: "Observation 1", html: "<p>Tool result: order #881, ₹420, status CANCELLED.</p>" },
        { title: "Thought 2", html: "<p>\"Cancelled hai, refund status dekhna hai.\" → <b>Action:</b> <code>refund_status(order=881)</code></p>" },
        { title: "Observation 2", html: "<p>Result: refund initiated 2 din pehle, method UPI.</p>" },
        { title: "Thought 3", html: "<p>\"Policy mein UPI refund ka time kya hai?\" → <b>Action:</b> <code>search_policy(\"UPI refund time\")</code> → \"3-5 working days\".</p>" },
        { title: "Final answer", html: "<p>\"Aapka ₹420 ka refund 2 din pehle UPI pe initiate ho chuka hai; policy ke hisaab se 3-5 working days lagte hain.\" Loop ruka kyunki model ne tool call ki jagah final jawab diya.</p>" }
      ]
    },
    {
      type: "flow",
      title: "Agent = LLM + tools + loop (+ guard rails)",
      nodes: [
        { id: "u", label: "User goal", icon: "🙋", x: 90, y: 170, kind: "client", w: 140 },
        { id: "llm", label: "LLM\n(think: agla step?)", icon: "🧠", x: 350, y: 170, kind: "service", w: 190 },
        { id: "rt", label: "Runtime (aapka code)\nvalidate + execute", icon: "⚙️", x: 640, y: 170, kind: "service", w: 210 },
        { id: "t1", label: "Orders API", icon: "📦", x: 900, y: 60, kind: "external", w: 150 },
        { id: "t2", label: "Policy search", icon: "📚", x: 900, y: 280, kind: "external", w: 150 },
        { id: "lim", label: "Max steps,\nbudget, approval", icon: "🛑", x: 350, y: 330, kind: "queue", w: 170 }
      ],
      edges: [
        { from: "u", to: "llm" },
        { from: "llm", to: "rt", both: true },
        { from: "rt", to: "t1", both: true },
        { from: "rt", to: "t2", both: true },
        { from: "lim", to: "rt", dashed: true }
      ],
      steps: [
        { title: "LLM tool chunta hai", html: "<p>Model sirf tool ka naam + arguments <b>likhta</b> hai. Chalata aapka code hai.</p>", path: ["u", "llm", "rt"], active: ["llm"] },
        { title: "Runtime execute karta hai", html: "<p>Arguments validate, permissions check, API call, result wapas model ke context mein.</p>", path: ["rt", "t1", "rt", "llm"], active: ["rt"] },
        { title: "Phir se, ya ruko", html: "<p>Har loop pe max-steps/budget check. 10 steps ke baad bhi jawab nahi = ruk ke insaan ko de do.</p>", path: ["llm", "rt", "t2", "rt", "llm"], active: ["lim"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Agent ki kimat: har step ek risk</h2>
        <p>Har step pe model thoda galat ho sakta hai, aur galtiyan jud-ti hain. Agar har step 95% sahi ho:</p>
        <pre class="code-static">1 step  → 95%
5 steps → 0.95⁵  ≈ 77%
10 steps → 0.95¹⁰ ≈ 60%</pre>
        <p>Saath mein har step = ek aur LLM call (latency + paisa), aur loop mein phansne ka risk. Isliye:</p>
        <table>
          <tr><th>Situation</th><th>Behtar</th></tr>
          <tr><td>Steps pehle se pata hain (classify → template reply)</td><td><b>Workflow</b>: sasta, predictable, test karna aasaan</td></tr>
          <tr><td>Input ke hisaab se raasta bahut badalta hai (coding, research, multi-system debugging)</td><td><b>Agent</b>, guard rails ke saath</td></tr>
        </table>
        <h3>Common workflow patterns (agent se pehle inhe socho)</h3>
        <table>
          <tr><th>Pattern</th><th>Kya</th></tr>
          <tr><td>Prompt chaining</td><td>Step 1 ka output step 2 ka input (beech mein code checks)</td></tr>
          <tr><td>Routing</td><td>Pehle classify, phir us type ka specialised prompt/model</td></tr>
          <tr><td>Parallelization</td><td>Ek kaam ke hisse ek saath, ya same kaam kai baar aur voting</td></tr>
          <tr><td>Orchestrator-workers</td><td>Ek LLM kaam todta hai, workers karte hain, wo jodta hai</td></tr>
          <tr><td>Evaluator-optimizer</td><td>Ek LLM banata hai, doosra critique karta hai, loop</td></tr>
        </table>`
    },
    {
      type: "pick",
      id: "pick-agent-or-workflow",
      q: "In mein se kahan <b>agent</b> (LLM khud steps chune) sach mein justified hai?",
      options: [
        { text: "Support emails ko 5 categories mein daal ke template reply", correct: false, why: "Raasta fixed hai: routing workflow kaafi." },
        { text: "Production incident: logs, metrics, recent deploys dekh ke root cause dhoondhna", correct: true, why: "Har incident mein agla step pichhle observation pe depend karta hai." },
        { text: "Invoice PDF se fields nikaalna", correct: false, why: "Ek structured-output call + validation." },
        { text: "Codebase mein bug fix: files dhoondho, padho, change karo, tests chalao, phir sudhaaro", correct: true, why: "Open-ended, feedback (test results) se agla step." },
        { text: "Har raat sales report ka summary email", correct: false, why: "Fixed pipeline: data → summary → email." }
      ],
      answer: "Agent tab jab steps pehle se tay na ho sakein aur environment se feedback (tool results) mile. Baaki jagah workflow: sasta aur predictable."
    },
    {
      type: "think",
      id: "think-agent-guardrails",
      q: "Aapki team ek \"travel booking agent\" bana rahi hai jo flights search kar sakta hai aur book bhi. Production se pehle kaunse guard rails lagaoge?",
      rubric: [
        { point: "Booking/payment jaise actions pe user confirmation", keys: ["confirm", "approval", "human", "user se puch", "ask user"], weight: 3 },
        { point: "Max steps / time / cost budget, loop detection", keys: ["max step", "limit", "budget", "loop", "timeout", "iteration"], weight: 2 },
        { point: "Tool arguments validate + permissions backend mein", keys: ["validat", "schema", "permission", "authoriz", "backend"], weight: 2 },
        { point: "Idempotency (double booking se bachav)", keys: ["idempot", "double", "duplicate", "retry"], weight: 1 },
        { point: "Logging/tracing + evals", keys: ["log", "trace", "eval", "monitor", "audit"], weight: 1 }
      ],
      answer: `<ul><li><b>Human confirm:</b> search free, par <code>book</code> se pehle user ko exact flight, price, naam dikha ke "haan" lo.</li><li><b>Budgets:</b> max ~15 steps, time limit, LLM cost limit; same tool same args baar baar = loop, ruko.</li><li><b>Validation + permissions:</b> tool args schema se check (date future mein, passenger list), aur payment/booking permissions backend user session se.</li><li><b>Idempotency key</b> har booking pe, taaki retry pe double booking na ho.</li><li><b>Tracing:</b> har thought/tool call log; failure cases se eval set.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Agent = LLM + tools + loop" define karo, phir turant trade-off: "har step galti ka chance jodta hai (0.95¹⁰ ≈ 60%), isliye jahan raasta fixed hai wahan workflow, aur agent ke saath max steps, validation aur risky actions pe human confirm." Ye balance interviewers dhoondhte hain.`
    }
  ],
  references: [
    { title: "Building effective agents", by: "Anthropic", url: "https://www.anthropic.com/research/building-effective-agents", type: "article" },
    { title: "ReAct: Synergizing Reasoning and Acting in Language Models", by: "Yao et al., 2022", url: "https://arxiv.org/abs/2210.03629", type: "article" },
    { title: "Prompt Engineering Guide: LLM agents", by: "DAIR.AI", url: "https://www.promptingguide.ai/research/llm-agents", type: "docs" }
  ]
});
