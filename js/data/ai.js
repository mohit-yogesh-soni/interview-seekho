// Module 6: AI, LLMs & Agents (outline). Theory + interactive demos + Java exercises (tokenizer, similarity search).
registerModule({
  id: "ai",
  intro: "LLM andar se kaise kaam karta hai, kaise banta hai, aur usko apps mein kaise use karte hain (prompting, RAG, agents). Interactive demos aur chhote Java exercises ke saath.",
  chapters: [
    {
      title: "Basics",
      lessons: [
        { id: "ml-basics", title: "AI, ML, Deep Learning: farak kya hai", plan: ["Model = function jo data se seekhta hai", "Training vs inference", "Neural network ka intuition (neurons, weights, loss, gradient descent)"] },
        { id: "tokens", title: "Tokens aur Tokenization", plan: ["Text → tokens → numbers", "BPE ka simple idea", "Interactive: sentence ke tokens dekho", "Java exercise: simple tokenizer"] },
        { id: "embeddings", title: "Embeddings", plan: ["Words/sentences as vectors", "Cosine similarity", "Java exercise: similarity search"] }
      ]
    },
    {
      title: "LLM andar se",
      lessons: [
        { id: "next-token", title: "LLM = next token predictor", plan: ["Probability distribution over tokens", "Interactive: temperature aur top-p slider"] },
        { id: "transformer", title: "Transformer aur Attention (intuition)", plan: ["Self-attention: kaunsa word kis pe dhyaan de", "Multi-head, positional encoding (simple)", "Context window"] },
        { id: "how-llm-built", title: "LLM kaise banta hai", plan: ["Data collection aur cleaning", "Pre-training", "Fine-tuning (SFT)", "RLHF / DPO", "Compute aur cost ka idea"] },
        { id: "inference", title: "Inference: speed aur cost", plan: ["KV cache, batching", "Quantization", "Latency: time to first token"] },
        { id: "limits", title: "Hallucination aur limitations", plan: ["Kyun hota hai", "Kaise kam karein"] }
      ]
    },
    {
      title: "Prompting",
      lessons: [
        { id: "prompt-anatomy", title: "Achhe prompt ka structure", plan: ["Role, context, task, format, examples", "Pehle aap socho: bura prompt sudhaaro (score)"] },
        { id: "prompt-techniques", title: "Techniques", plan: ["Zero-shot, few-shot", "Step by step reasoning", "Structured output (JSON)", "System prompt"] },
        { id: "prompt-injection", title: "Prompt injection aur safety", plan: ["Attack examples", "Defense"] }
      ]
    },
    {
      title: "LLM apps",
      lessons: [
        { id: "rag", title: "RAG (Retrieval Augmented Generation)", plan: ["Chunking, embeddings, vector DB", "Retrieve → augment → generate", "Interactive: mini RAG demo"] },
        { id: "rag-vs-ft", title: "Prompting vs RAG vs Fine-tuning", plan: ["Decision table"] },
        { id: "evals", title: "Evaluation", plan: ["LLM output ko test kaise karein", "Golden datasets, LLM-as-judge"] }
      ]
    },
    {
      title: "Agents",
      lessons: [
        { id: "what-agent", title: "Agent kya hai", plan: ["LLM + tools + loop", "ReAct: think → act → observe"] },
        { id: "tool-calling", title: "Tool / function calling", plan: ["JSON schema", "Interactive: agent loop simulator"] },
        { id: "memory-planning", title: "Memory, planning, multi-agent", plan: ["Short vs long term memory", "Planner-executor"] },
        { id: "mcp", title: "MCP (Model Context Protocol)", plan: ["Tools ko standard tareeke se expose karna"] }
      ]
    },
    {
      title: "AI System Design",
      lessons: [
        { id: "design-rag-bot", title: "Design: company docs chatbot (RAG)", plan: ["Ingestion pipeline, vector DB, caching, evals"] },
        { id: "design-llm-serving", title: "Design: LLM serving platform", plan: ["GPU pool, batching, queue, autoscaling, cost"] },
        { id: "ai-interview-qs", title: "AI interview questions", plan: ["Common conceptual questions with answers"] }
      ]
    }
  ]
});
