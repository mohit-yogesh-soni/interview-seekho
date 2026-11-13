// Hallucination aur limitations
registerLesson("ai", "limits", {
  why: `LLM bahut confident tareeke se galat bol sakta hai. Production mein AI feature tabhi chalta hai jab aapko pata ho wo kahan aur kyun galti karta hai, aur system mein uske aas-paas guard rails kaise lagaate hain. Interviews mein "hallucination kaise kam karoge" almost har baar poocha jaata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Hallucination kya hai, aur hota kyun hai</h2>
        <p><b>Hallucination</b> = model aisi baat bole jo sach nahi hai, par sunne mein bilkul sahi lage: galat date, nakli research paper ka naam, kabhi na hua court case.</p>
        <p>Ye "bug" nahi, model ke kaam karne ke tareeke se aata hai. Pichhle lessons se jodo:</p>
        <table>
          <tr><th>Wajah</th><th>Kaise</th></tr>
          <tr><td>Next-token predictor hai</td><td>Model ka kaam "sabse probable agla token" hai, "sach" nahi. Ek plausible-sounding paper title statistically bahut probable ho sakta hai.</td></tr>
          <tr><td>Knowledge weights mein compress hai</td><td>Trillions tokens arbon numbers mein: rare facts (kisi chhote shehar ka pin code) dhundhle yaad rehte hain.</td></tr>
          <tr><td>Knowledge cutoff</td><td>Training data ek date tak ka hai. Uske baad ki cheezein model ko pata hi nahi, par wo guess kar sakta hai.</td></tr>
          <tr><td>Guess karne ka incentive</td><td>Agar training/evaluation sirf "sahi jawab" ko reward kare aur "pata nahi" ko bhi zero de, to guess karna "pata nahi" se behtar score deta hai. OpenAI ke 2025 paper "Why Language Models Hallucinate" ki yahi main baat hai.</td></tr>
          <tr><td>Sampling</td><td>Zyada temperature pe kam probable (aur aksar galat) tokens bhi chune jaate hain.</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>Baaki limitations (aur unki wajah)</h2>
        <table>
          <tr><th>Limitation</th><th>Wajah</th><th>Practical asar</th></tr>
          <tr><td>Math / counting mein galti</td><td>Tokens dikhte hain, digits/letters nahi; hisaab "predict" hota hai, calculate nahi</td><td>GST/EMI jaisa hisaab code/tool se karwao</td></tr>
          <tr><td>Lamba context = beech ki baat miss</td><td>Research ("Lost in the Middle", 2023) mein dikha ki models ne context ke shuru/end ki info beech ki info se behtar use ki</td><td>Zaroori cheez prompt ke shuru ya end mein; sirf relevant docs bhejo</td></tr>
          <tr><td>Prompt sensitivity</td><td>Chhota wording change, alag distribution</td><td>Prompts ko version karo aur evals se test karo</td></tr>
          <tr><td>Non-determinism</td><td>Sampling, GPU math</td><td>Exact string tests nahi; schema validation</td></tr>
          <tr><td>Bias</td><td>Internet data ke patterns</td><td>Hiring, loans jaise decisions mein insaan + audits</td></tr>
          <tr><td>Prompt injection</td><td>Model instructions aur data mein farak nahi kar paata</td><td>Alag lesson (safety)</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>Kam kaise karein: layers mein socho</h2>
        <table>
          <tr><th>Layer</th><th>Tareeka</th><th>Kya fix karta hai</th></tr>
          <tr><td>Input</td><td><b>Grounding / RAG</b>: sahi documents prompt mein do, "sirf in documents se jawab do"</td><td>Cutoff, rare/private facts</td></tr>
          <tr><td>Instruction</td><td>"Jawab nahi pata to 'mujhe nahi pata' bolo"; source ka quote/citation maango</td><td>Guess karne ki aadat (poori tarah nahi, par kam)</td></tr>
          <tr><td>Decoding</td><td>Facts ke liye low temperature</td><td>Random galat tokens</td></tr>
          <tr><td>Tools</td><td>Calculator, DB query, search API ko call karne do (tool calling)</td><td>Math, live data</td></tr>
          <tr><td>Output check</td><td>Schema validation; citations sach mein document mein hain ya nahi, check karo; doosra model/rules se verify</td><td>Galat format, nakli citations</td></tr>
          <tr><td>Process</td><td>High-risk (medical, legal, paisa) mein human review; <b>evals</b> se hallucination rate naapo</td><td>Jo bach gaya</td></tr>
        </table>
        <p>Koi ek tareeka hallucination ko zero nahi karta. Isliye <b>risk ke hisaab se</b> layers jodo: movie recommendation mein kam, loan approval mein sab.</p>`
    },
    {
      type: "flow",
      title: "Guard rails ke saath LLM answer",
      nodes: [
        { id: "u", label: "User sawaal", icon: "🙋", x: 80, y: 170, kind: "client", w: 140 },
        { id: "ret", label: "Retrieve docs", icon: "🔎", x: 280, y: 70, kind: "service", w: 160 },
        { id: "llm", label: "LLM (low temp)\n'sirf docs se'", icon: "🧠", x: 500, y: 170, kind: "service", w: 190 },
        { id: "tool", label: "Tools\n(calc, DB)", icon: "🧮", x: 500, y: 330, kind: "external", w: 150 },
        { id: "chk", label: "Validate:\nschema + citations", icon: "✅", x: 750, y: 170, kind: "service", w: 180 },
        { id: "out", label: "Jawab / 'pata nahi'", icon: "💬", x: 920, y: 330, kind: "client", w: 150 }
      ],
      edges: [
        { from: "u", to: "ret" },
        { from: "ret", to: "llm" },
        { from: "llm", to: "tool", both: true },
        { from: "llm", to: "chk" },
        { from: "chk", to: "out" },
        { from: "chk", to: "llm", dashed: true }
      ],
      steps: [
        { title: "Grounding", html: "<p>Sawaal se relevant documents nikaalo aur prompt mein do.</p>", path: ["u", "ret", "llm"], active: ["ret"] },
        { title: "Hisaab tool se", html: "<p>EMI ka calculation model khud nahi, calculator tool karta hai.</p>", path: ["llm", "tool", "llm"], active: ["tool"] },
        { title: "Check, phir jawab", html: "<p>Citation document mein mila, JSON schema sahi: user ko jawab. Nahi mila to retry ya 'mujhe nahi pata'.</p>", path: ["llm", "chk", "out"], active: ["chk"] }
      ]
    },
    {
      type: "pick",
      id: "pick-halluc",
      q: "Legal-docs chatbot nakli case names bata raha hai. Kaunse steps sabse zyada madad karenge?",
      options: [
        { text: "RAG: asli case database se relevant documents prompt mein do", correct: true, why: "Model ke paas sahi source hoga, yaad pe nahi chalna padega." },
        { text: "Har citation ko database mein lookup karke verify karo, na mile to hata do", correct: true, why: "Output check: nakli naam user tak nahi pahunchega." },
        { text: "Temperature 1.5 karo taaki model zyada options soche", correct: false, why: "Ulta: random tokens badhenge." },
        { text: "Bada model le lo, hallucination khatam", correct: false, why: "Kam ho sakta hai, khatam nahi. Grounding aur checks phir bhi chahiye." },
        { text: "Prompt: 'documents mein na ho to bolo ki pata nahi'", correct: true, why: "Guess ki jagah mana karne ka raasta deta hai (poori guarantee nahi)." }
      ],
      answer: "Grounding + output verification + 'pata nahi' ka option. Model badalna ya prompt mein 'galat mat bolna' likhna akele kaafi nahi."
    },
    {
      type: "think",
      id: "think-halluc-metric",
      q: "Aap kaise naapoge ki aapke RAG chatbot mein hallucination kitna hai, aur naya prompt usse behtar hai ya nahi?",
      rubric: [
        { point: "Golden dataset: sawaal + sahi jawab/sources", keys: ["golden", "dataset", "test set", "examples", "sawaal"], weight: 2 },
        { point: "Faithfulness / groundedness: jawab ka har claim docs mein hai?", keys: ["faithful", "grounded", "claim", "docs mein", "support", "citation"], weight: 2 },
        { point: "LLM-as-judge ya human review se score; dono versions compare (A/B)", keys: ["judge", "human", "review", "compare", "a/b", "score"], weight: 2 },
        { point: "Production mein bhi monitor (thumbs down, sampling)", keys: ["production", "monitor", "feedback", "thumbs", "sample"], weight: 1 }
      ],
      answer: `<p>Ek <b>golden dataset</b> banao: 100-500 asli jaise sawaal, har ek ke saath sahi jawab aur source document. Har prompt/model version ko inpe chalao aur do cheezein score karo: <b>correctness</b> (sahi jawab?) aur <b>faithfulness</b> (jawab ka har claim diye gaye documents se support hota hai?). Scoring insaan karein ya ek doosra LLM ek saaf rubric ke saath (LLM-as-judge), jise kuch examples pe insaan se match karke check karo. Naya prompt tabhi ship jab score behtar ho. Production mein user feedback aur random samples ki review chalate raho (evals lesson).</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Hallucination kyun" pe teen wajah (next-token objective, compressed knowledge + cutoff, guess ka incentive), aur "kaise kam" pe layers (grounding, tools, low temp, verification, evals, human review). "Ise zero nahi kar sakte, risk ke hisaab se manage karte hain" ye line zaroor bolo.`
    }
  ],
  references: [
    { title: "Why Language Models Hallucinate", by: "OpenAI (Kalai et al., 2025)", url: "https://arxiv.org/abs/2509.04664", type: "article" },
    { title: "Lost in the Middle: How Language Models Use Long Contexts", by: "Liu et al., 2023", url: "https://arxiv.org/abs/2307.03172", type: "article" },
    { title: "Generative AI and LLMs For Dummies", by: "David Baum (Snowflake Special Edition)", url: "https://www.snowflake.com/resource/generative-ai-and-llms-for-dummies/", type: "book" }
  ]
});
