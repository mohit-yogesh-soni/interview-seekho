// MCP (Model Context Protocol)
registerLesson("ai", "mcp", {
  why: `Har AI app (chat app, IDE, agent) ko tools chahiye: GitHub, Jira, database, files. Bina standard ke har app har tool ke liye apna integration likhta hai. MCP ek open protocol hai jo ye "har app × har tool" wali problem ko "ek server, sab apps" bana deta hai, jaise USB ne har device ke liye alag cable ki zaroorat khatam ki.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: M apps × N tools = M × N integrations</h2>
        <p>Maan lo 5 AI apps (chat app, do IDEs, ek internal agent, ek support bot) aur 10 tools (GitHub, Jira, Postgres, Slack, Google Drive...). Har app har tool ke liye apna code likhe: 5 × 10 = 50 integrations, sab alag auth, alag bugs. Naya tool aaya to 5 jagah kaam.</p>
        <p><b>MCP</b> (Model Context Protocol, Anthropic ne November 2024 mein open standard ke roop mein release kiya): tool wala ek baar ek <b>MCP server</b> banata hai, aur har MCP-supporting app (<b>host</b>) use use kar sakta hai. 5 + 10 = 15 cheezein. Ye wahi idea hai jo LSP (Language Server Protocol) ne editors aur programming languages ke liye kiya tha.</p>
        <h2>Teen roles</h2>
        <table>
          <tr><th>Role</th><th>Kya</th><th>Example</th></tr>
          <tr><td><b>Host</b></td><td>AI app jo user ke saamne hai, aur LLM se baat karta hai</td><td>Chat desktop app, IDE, aapka agent</td></tr>
          <tr><td><b>Client</b></td><td>Host ke andar ka connector; har server ke liye ek</td><td>Host ka MCP library code</td></tr>
          <tr><td><b>Server</b></td><td>Program jo capabilities expose karta hai</td><td>GitHub MCP server, Postgres MCP server, aapka internal "orders" server</td></tr>
        </table>
        <h2>Server kya de sakta hai (primitives)</h2>
        <table>
          <tr><th>Primitive</th><th>Kya</th><th>Kaun control karta hai</th></tr>
          <tr><td><b>Tools</b></td><td>Functions jo model call kar sake (<code>create_issue</code>, <code>run_query</code>), naam + description + JSON Schema</td><td>Model (user ki approval ke saath)</td></tr>
          <tr><td><b>Resources</b></td><td>Padhne layak data (file, DB schema, document), URI se</td><td>App decide karta hai kya context mein daale</td></tr>
          <tr><td><b>Prompts</b></td><td>Ready-made prompt templates ("is PR ka review karo")</td><td>User chunta hai (jaise slash command)</td></tr>
        </table>
        <p><b>Wire format:</b> JSON-RPC 2.0 messages. <b>Transports:</b> local server ke liye <b>stdio</b> (host server ko ek process ki tarah chalata hai), aur remote ke liye <b>Streamable HTTP</b> (2025 ke spec mein purane HTTP+SSE transport ki jagah aaya). Remote servers ke liye OAuth-based authorization spec mein define hai.</p>`
    },
    {
      type: "flow",
      title: "Ek host, kai MCP servers",
      nodes: [
        { id: "user", label: "Developer", icon: "👩‍💻", x: 80, y: 170, kind: "client", w: 140 },
        { id: "host", label: "Host: IDE / chat app\n(MCP clients andar)", icon: "🖥️", x: 320, y: 170, kind: "service", w: 210 },
        { id: "llm", label: "LLM", icon: "🧠", x: 320, y: 330, kind: "external", w: 120 },
        { id: "gh", label: "GitHub MCP server\n(remote, HTTP)", icon: "🐙", x: 680, y: 60, kind: "external", w: 200 },
        { id: "pg", label: "Postgres MCP server\n(local, stdio)", icon: "🗄️", x: 680, y: 170, kind: "data", w: 200 },
        { id: "fs", label: "Files MCP server\n(local, stdio)", icon: "📁", x: 680, y: 280, kind: "data", w: 200 }
      ],
      edges: [
        { from: "user", to: "host", both: true },
        { from: "host", to: "llm", both: true },
        { from: "host", to: "gh", both: true },
        { from: "host", to: "pg", both: true },
        { from: "host", to: "fs", both: true }
      ],
      steps: [
        { title: "Connect + discover", html: "<p>Host har server se connect karta hai, capabilities negotiate karta hai, aur <code>tools/list</code> se tools ki list leta hai.</p>", paths: [["host", "gh", "host"], ["host", "pg", "host"]], active: ["gh", "pg"] },
        { title: "Model tool chunta hai", html: "<p>Host saare servers ke tools LLM ko deta hai. User: \"failing test ka issue banao\" → model <code>create_issue</code> chunta hai.</p>", path: ["user", "host", "llm", "host"], active: ["llm"] },
        { title: "Approval → tools/call", html: "<p>Host user se confirm karta hai, phir GitHub server ko <code>tools/call</code>. Result model ke paas wapas.</p>", path: ["host", "gh", "host", "user"], active: ["gh"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>MCP vs seedha tool calling</h2>
        <p>MCP tool calling ki <b>jagah</b> nahi hai. Model ab bhi wahi tool calling karta hai (pichhla lesson). MCP batata hai ki tools <b>kahan se aur kaise</b> aate hain: discovery, standard format, transport, auth.</p>
        <table>
          <tr><th>Situation</th><th>Behtar</th></tr>
          <tr><td>Ek app, 2-3 apne internal functions</td><td>Seedha tool calling (MCP ki zaroorat nahi)</td></tr>
          <tr><td>Aapka tool kai AI apps/teams use karengi</td><td>MCP server (ek baar banao)</td></tr>
          <tr><td>Aapka app kai third-party tools jodna chahta hai</td><td>MCP client support (existing servers seedha use)</td></tr>
        </table>
        <h2>Security: MCP server = code jo aapke data ko chhoo sakta hai</h2>
        <ul>
          <li><b>Trust:</b> third-party server install karna ek package install karne jaisa hai. Source aur permissions dekho.</li>
          <li><b>Tool descriptions bhi prompt hain:</b> ek bura server description mein chhupi instructions daal sakta hai (prompt injection ka ek roop). Untrusted servers ko sensitive servers ke saath ek session mein mat jodo.</li>
          <li><b>Least privilege:</b> DB server ko read-only user; GitHub token sirf zaroori repos.</li>
          <li><b>Human approval:</b> write/delete tools pe host user se confirm kare.</li>
        </ul>`
    },
    {
      type: "pick",
      id: "pick-mcp",
      q: "MCP ke baare mein kaunse statements sahi hain?",
      options: [
        { text: "MCP ek open protocol hai jo AI apps (hosts) ko standard tareeke se tools/data servers se jodta hai", correct: true, why: "Yahi definition hai." },
        { text: "MCP use karne ke liye model ko dobara train karna padta hai", correct: false, why: "Nahi. Host MCP tools ko normal tool calling ke through model ko deta hai." },
        { text: "Server tools, resources aur prompts expose kar sakta hai", correct: true, why: "Teen main server primitives." },
        { text: "Messages JSON-RPC 2.0 format mein jaate hain; local ke liye stdio, remote ke liye Streamable HTTP", correct: true, why: "Spec ke transports." },
        { text: "MCP server install karna hamesha safe hai kyunki protocol standard hai", correct: false, why: "Protocol standard hai, server ka code nahi. Trust aur permissions aapki zimmedari." }
      ],
      answer: "MCP integration ka standard hai (discovery + format + transport + auth). Tool calling model ka kaam wahi rehta hai, aur security ki zimmedari host/user ki."
    },
    {
      type: "think",
      id: "think-mcp-internal",
      q: "Aapki company ke 4 teams alag AI tools bana rahi hain, aur sabko \"orders\" aur \"customers\" data chahiye. Aap internal MCP server ka design kaise karoge? Tools, auth aur safety batao.",
      rubric: [
        { point: "Ek shared MCP server (orders/customers) jise sab hosts use karein: duplicate integrations khatam", keys: ["ek server", "shared", "single", "reuse", "sab teams", "duplicate"], weight: 2 },
        { point: "Chhote, saaf tools: get_order, search_orders, get_customer (read-only pehle)", keys: ["get_order", "search", "read-only", "read only", "tool"], weight: 2 },
        { point: "Auth: user ki identity/OAuth, server permissions check kare (row-level)", keys: ["oauth", "auth", "identity", "permission", "token", "row"], weight: 2 },
        { point: "PII masking, rate limits, audit logs", keys: ["pii", "mask", "rate limit", "audit", "log"], weight: 2 }
      ],
      answer: `<ul><li><b>Ek internal MCP server</b> (remote, Streamable HTTP) jo orders/customers ko expose kare; chaaron teams ke hosts isi se judein. Logic, auth aur fixes ek jagah.</li><li><b>Tools:</b> <code>get_order(order_id)</code>, <code>search_orders(customer_id, from, to)</code>, <code>get_customer(id)</code>; shuru mein read-only. Write tools (refund) baad mein, confirmation ke saath.</li><li><b>Auth:</b> OAuth se asli user ki identity; server har call pe check kare ki ye user/team ye data dekh sakta hai.</li><li><b>Safety:</b> phone/email/address masked by default, results paginated aur chhote, rate limits, aur har tool call ka audit log.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> MCP ko "AI tools ke liye USB/LSP" bolo: M×N integrations → M+N. Phir clear karo ki ye tool calling replace nahi karta, sirf tools ko discover aur connect karne ka standard hai, aur third-party servers ka trust/permissions ek asli security concern hai.`
    }
  ],
  references: [
    { title: "Model Context Protocol: docs and specification", by: "MCP", url: "https://modelcontextprotocol.io/", type: "docs" },
    { title: "MCP spec: Transports", by: "MCP", url: "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports", type: "docs" },
    { title: "Introducing the Model Context Protocol", by: "Anthropic", url: "https://www.anthropic.com/news/model-context-protocol", type: "article" }
  ]
});
