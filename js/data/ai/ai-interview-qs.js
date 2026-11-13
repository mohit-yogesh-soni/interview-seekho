// AI interview questions
registerLesson("ai", "ai-interview-qs", {
  why: `Poore module ka revision, interview ke sawaalon ki shakal mein. Har sawaal pe pehle khud 30 second bolke dekho, phir jawab kholo. Jawab "yaad karne" ke liye nahi: har jawab mein wajah (mechanism) hai, taaki naya twist aaye to bhi aap wahi soch laga sako.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>LLM basics</h2>
        <details><summary><b>1. LLM kya hai, ek line mein? Andar kya hota hai?</b></summary>
          <p>Transformer neural network jo text ke baad agla token predict karta hai. Flow: text → tokens (BPE) → embeddings → N transformer layers (masked self-attention + feed-forward) → last position ke logits → softmax (temperature) → top-p/top-k → sample → append → repeat. <i>Lessons: next-token, transformer.</i></p></details>
        <details><summary><b>2. Token kya hai, aur iska bill/limits pe kya asar hai?</b></summary>
          <p>Subword tukda (BPE se: sabse common pairs merge). English mein ~4 characters/token. Billing, context window aur speed sab tokens mein; Hindi jaise kam represented languages zyada tokens leti hain. Letters ginna/math galat hone ki ek wajah bhi tokenization hai. <i>Lesson: tokens.</i></p></details>
        <details><summary><b>3. Temperature aur top-p mein farak?</b></summary>
          <p>Temperature logits ko T se divide karke distribution ko nukeela (T &lt; 1) ya chapta (T &gt; 1) karta hai. Top-p sorted probabilities mein se sirf utne tokens rakhta hai jinka total p tak pahunche. Facts/JSON: low temperature; creative: zyada. <i>Lesson: next-token.</i></p></details>
        <details><summary><b>4. Attention samjhao. √d se divide kyun?</b></summary>
          <p>Har token ka Query, sab tokens ke Keys se dot product → softmax weights → Values ka weighted mix = context wala naya vector. √d se divide taaki bade dimension pe dot products itne bade na hon ki softmax ek token pe hi atak jaaye (gradients chhote). Causal mask future tokens chhupata hai. Cost n² (context window limit). <i>Lesson: transformer.</i></p></details>
        <details><summary><b>5. LLM kaise train hota hai?</b></summary>
          <p>(1) Pre-training: trillions tokens pe next-token prediction (self-supervised) → base model. (2) SFT: instruction → achha jawab examples. (3) Preference tuning: RLHF (reward model + RL) ya DPO (seedha preference pairs). Phir evals aur safety testing. <i>Lesson: how-llm-built.</i></p></details>
        <details><summary><b>6. Hallucination kyun hota hai aur kaise kam karoge?</b></summary>
          <p>Wajah: objective "probable text" hai, "sach" nahi; rare facts weights mein dhundhle; knowledge cutoff; training/evals guess ko "pata nahi" se zyada reward karte hain. Kam karna: RAG grounding, citations + unka verification, low temperature, tools (calculator, DB), "pata nahi" ka option, evals, high-risk pe human review. Zero nahi hota, risk ke hisaab se manage. <i>Lesson: limits.</i></p></details>
      `
    },
    {
      type: "text",
      html: `
        <h2>Inference aur cost</h2>
        <details><summary><b>7. 7B model ko kitni GPU memory chahiye?</b></summary>
          <p>Weights: 7B × 2 bytes (FP16) = 14 GB; INT8 ~7 GB; INT4 ~3.5 GB. Plus KV cache: 2 × layers × d_model × tokens × bytes per value per sequence (Llama 2 7B FP16 ≈ 0.5 MB/token, 4k tokens ≈ 2 GB), plus overhead. <i>Lesson: inference.</i></p></details>
        <details><summary><b>8. KV cache kya hai, aur problem kya hai?</b></summary>
          <p>Pichhle tokens ke Keys/Values ko memory mein rakhna taaki har naye token pe dobara compute na ho. Problem: memory context length aur batch ke saath linearly badhti hai, aur concurrency limit karti hai. Fixes: PagedAttention (vLLM), GQA, KV quantization, prefix caching.</p></details>
        <details><summary><b>9. TTFT vs tokens/sec? Kaise improve karoge?</b></summary>
          <p>TTFT = prefill (poora prompt) ka time: prompt chhota karo, prefix caching, chhota model. Tokens/sec = decode speed (memory-bandwidth bound): quantization, chhota model, speculative decoding. Batching se total throughput badhta hai par per-user speed thodi girti hai.</p></details>
        <details><summary><b>10. API use karein ya self-host?</b></summary>
          <p>Quality (apne evals pe), utilization (GPU 24×7 ka paisa vs per-token), ops (GPUs, scaling, on-call), privacy/compliance, latency. Kam/spiky traffic → API; lagaatar bahut traffic ya data bahar nahi ja sakta → self-host. <i>Lessons: inference, design-llm-serving.</i></p></details>
      `
    },
    {
      type: "text",
      html: `
        <h2>Apps: prompting, RAG, fine-tuning, evals</h2>
        <details><summary><b>11. RAG pipeline batao. Quality kaise badhaoge?</b></summary>
          <p>Ingestion: load → chunk (overlap) → embed → vector store (+ metadata, ACL). Query: rewrite → hybrid search (vector + BM25) + ACL filter → rerank → top-k prompt mein → LLM jawab + citations. Quality: chunking, hybrid, reranker, metadata filters, aur retrieval vs generation alag evals. <i>Lessons: rag, design-rag-bot.</i></p></details>
        <details><summary><b>12. RAG ya fine-tuning?</b></summary>
          <p>Knowledge (private, badalti, citation chahiye) → RAG. Behaviour/format/style, narrow repeat task, bahut examples → fine-tuning (LoRA). Pehle prompting. Dono saath bhi. Fine-tuning hallucination khatam nahi karta. <i>Lesson: rag-vs-ft.</i></p></details>
        <details><summary><b>13. LLM feature ko test kaise karte ho?</b></summary>
          <p>Golden dataset (asli + edge cases), graders (code checks, metrics jaise precision/recall, LLM-as-judge with rubric jo human labels se calibrate ho), version A vs B per category, CI mein chalana, production failures wapas dataset mein. Judge biases: position, verbosity, self-preference. <i>Lesson: evals.</i></p></details>
        <details><summary><b>14. Prompt injection kya hai, kaise bachoge?</b></summary>
          <p>Untrusted text (user ya documents/emails/web) model ko apne instructions follow karwa de. Indirect injection sabse khatarnak. 100% rok nahi sakte: least privilege tools, permissions backend mein (session se), risky actions pe human confirm, output ko untrusted maano (escape, links), secrets prompt mein nahi, red-teaming. <i>Lesson: prompt-injection.</i></p></details>
      `
    },
    {
      type: "text",
      html: `
        <h2>Agents</h2>
        <details><summary><b>15. Agent vs workflow?</b></summary>
          <p>Workflow: steps code mein fixed (chaining, routing). Agent: LLM loop mein khud tool aur next step chunta hai (ReAct: think → act → observe). Agent tab jab raasta pehle se tay na ho; warna workflow sasta aur reliable. Har step galti jodta hai (0.95¹⁰ ≈ 60%). <i>Lesson: what-agent.</i></p></details>
        <details><summary><b>16. Tool calling mein model kya karta hai aur aapka code kya?</b></summary>
          <p>Model sirf tool ka naam + JSON arguments likhta hai. Code validate karta hai (schema, business rules), permissions session se check, execute, result wapas. Side-effect tools idempotent aur confirm ke saath. <i>Lesson: tool-calling.</i></p></details>
        <details><summary><b>17. Agent memory kaise banaoge?</b></summary>
          <p>Model stateless hai; memory = prompt mein kya jaata hai. Short-term: recent messages (token budget), purane ka summary. Long-term: structured facts + retrieval, timestamps, update/delete, user control. <i>Lesson: memory-planning.</i></p></details>
        <details><summary><b>18. MCP kya solve karta hai?</b></summary>
          <p>M apps × N tools integrations ko M + N: tools ek baar MCP server banein, koi bhi MCP host (chat app, IDE, agent) use kare. JSON-RPC 2.0; stdio (local) / Streamable HTTP (remote); primitives: tools, resources, prompts. Tool calling ki jagah nahi leta. Third-party servers ka trust aur permissions dekhna zaroori. <i>Lesson: mcp.</i></p></details>
      `
    },
    {
      type: "quiz",
      q: "Interviewer: \"Hamare chatbot ka context window 128k hai, to RAG ki zaroorat hi nahi, saare docs prompt mein daal dete hain.\" Sabse strong counter-argument?",
      options: ["128k tokens mein kuch bhi fit nahi hota", "Har request pe lakhs tokens ka kharcha aur latency, beech ki info miss hone ka risk, aur permissions/freshness phir bhi chahiye", "Lambe prompts illegal hain", "Model lambe prompts padh hi nahi sakta"],
      answer: 1,
      why: "Lamba context kuch cases mein (ek bada document) bilkul sahi hai. Par har sawaal pe poora corpus bhejna = har request ka bill aur TTFT kai guna, 'lost in the middle' ka risk, aur kis user ko kya dikhe ye control phir bhi chahiye. Retrieval sirf zaroori hissa bhejta hai."
    },
    {
      type: "think",
      id: "think-final-design",
      q: "Last round: \"Ek Swiggy jaisa app chahta hai ki user likhe 'kal raat wala paneer dish phir se order karo, par kam spicy' aur AI order place kar de.\" 5 minute ka high-level design bolo: components, kaunsa model kaam, kahan guard rails.",
      rubric: [
        { point: "Tool calling / agent: order history, menu search, cart, place_order tools", keys: ["tool", "order history", "menu", "cart", "place_order", "agent", "function"], weight: 2 },
        { point: "Structured output: dish, restaurant, customization (spice) parse", keys: ["structured", "json", "parse", "spice", "customiz", "intent"], weight: 1 },
        { point: "Place order se pehle user confirm (price, address, payment)", keys: ["confirm", "approval", "haan", "summary dikha"], weight: 3 },
        { point: "Permissions session se, idempotency (double order nahi), payment backend mein", keys: ["session", "permission", "idempot", "double", "payment"], weight: 2 },
        { point: "Fallbacks + evals: dish na mile / ambiguous to clarify; latency (chhota model)", keys: ["clarify", "ambiguous", "fallback", "eval", "latency", "chhota model", "small model"], weight: 1 }
      ],
      answer: `<ul><li><b>Flow:</b> user text → LLM (tool calling) → <code>get_order_history(since=yesterday)</code> → "paneer" dish match → <code>get_menu_item(restaurant, dish)</code> (available? spice option hai?) → <code>build_cart(items, customization="less spicy")</code>.</li><li><b>Confirm:</b> cart ka summary (dish, restaurant, price, address, ETA) UI card mein; user "Order" dabaye tabhi <code>place_order(cart_id, idempotency_key)</code>. Model khud order place nahi karta.</li><li><b>Security:</b> user id session se; payment existing checkout flow se; per-user rate limits.</li><li><b>Ambiguity:</b> kal raat do paneer dishes thi to model clarify kare ("Paneer Tikka ya Paneer Butter Masala?"). Restaurant band ho to alternatives suggest.</li><li><b>Model/latency:</b> intent + tool calls ke liye tez/chhota model kaafi; evals: 200 asli jaise requests pe "sahi cart bana?" metric.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Har AI design jawab ka skeleton: requirements + numbers → simplest pipeline → quality (retrieval/prompt/evals) → safety (permissions, confirm, injection) → cost/latency (model size, caching, batching) → observability. Ye order khud ek senior signal hai.`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "Generative AI and LLMs For Dummies", by: "David Baum (Snowflake Special Edition)", url: "https://www.snowflake.com/resource/generative-ai-and-llms-for-dummies/", type: "book" },
    { title: "Building effective agents", by: "Anthropic", url: "https://www.anthropic.com/research/building-effective-agents", type: "article" },
    { title: "Prompt Engineering Guide", by: "DAIR.AI", url: "https://www.promptingguide.ai/", type: "docs" }
  ]
});
