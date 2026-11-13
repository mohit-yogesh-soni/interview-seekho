// Design: LLM serving platform — evolution style
registerLesson("ai", "design-llm-serving", {
  why: `HLD ke ChatGPT lesson mein ek product ka design tha. Yahan platform ka sawaal hai: company ki 20 teams ko open-source models (apne GPUs pe) ek internal API se dena. Isme GPU memory ka hisaab, batching, multi-tenancy (kaun kitna use kare), aur "GPU mehenge aur slow start hote hain" wali autoscaling ki problem aati hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements aur numbers</h2>
        <ul>
          <li><b>Functional:</b> teams ek OpenAI-compatible API call karein (<code>/v1/chat/completions</code>, streaming); kai models (ek 8B general, ek 70B "smart", kuch teams ke fine-tuned versions); har team ka usage aur bill dikhe.</li>
          <li><b>Non-functional:</b> interactive requests ka TTFT ~1 s; ek team ki galti (loop mein requests) baaki teams ko slow na kare; GPU kharcha control mein; data company se bahar nahi.</li>
        </ul>
        <pre class="code-static">Peak: ~200 requests/s, average ~1,500 input + 300 output tokens
Decode: 200/s × 300 tokens = 60,000 output tokens/s banane hain
8B model FP16 = 16 GB weights; 70B FP16 = 140 GB (2× 80 GB GPU, tensor parallel)
Little's law: har request ~6 s → ek saath ~1,200 requests chal rahe (KV cache memory!)</pre>
        <p>Kitne GPUs? Ye benchmark se aata hai, andaaze se nahi: apne prompt sizes ke saath ek GPU pe serving engine chala ke dekho kitne tokens/s aur kitne concurrent requests TTFT target ke andar milte hain. Phir peak ÷ per-GPU capacity + headroom.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: ek GPU server, ek model</h2>
        <p>Ek GPU machine pe <b>vLLM</b> (open-source serving engine) 8B model ke saath. Ye khud continuous batching aur paged KV cache karta hai, aur OpenAI-compatible API deta hai, to teams ke SDK seedhe chal jaate hain.</p>
        <table>
          <tr><th>Faisla</th><th>Kyun</th><th>Alternative</th></tr>
          <tr><td>Ready serving engine (vLLM / TGI / TensorRT-LLM)</td><td>Batching, KV cache paging, streaming already solved</td><td>Khud PyTorch loop: GPU ka bada hissa khaali (no continuous batching)</td></tr>
          <tr><td>OpenAI-compatible API</td><td>Teams ka code provider badalne pe nahi badalta</td><td>Custom API: har team ko naya client</td></tr>
        </table>
        <h3>Kya toota (3 teams aate hi)</h3>
        <ul>
          <li>Ek team ka batch job (1 lakh documents summarize) aaya: queue bhar gayi, chat users ka TTFT 30 s.</li>
          <li>Kaun kitna use kar raha, pata nahi. Machine gire to sab band.</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: gateway, replicas, aur sahi load balancing</h2>
        <table>
          <tr><th>Component</th><th>Kyun ab</th><th>Detail</th></tr>
          <tr><td><b>API gateway</b></td><td>Teams ko alag pehchaanna aur limit karna</td><td>API key → team; <b>tokens/min</b> quota (requests ginna kaafi nahi: ek 30k-token request 100 chhoti jitni); usage log (chargeback)</td></tr>
          <tr><td><b>Priority classes</b></td><td>Batch job ne chat ko roka</td><td>Interactive (high) aur batch (low) alag queues; batch sirf bachi capacity pe, ya raat mein. Batch ke liye async API (job submit, baad mein result).</td></tr>
          <tr><td><b>Kai replicas</b></td><td>Capacity + ek gire to baaki chalein</td><td>Har replica = ek model copy (8B ek GPU pe)</td></tr>
          <tr><td><b>Load-aware routing</b></td><td>Round robin galat hai</td><td>Requests ki length bahut alag hai (100 vs 30,000 tokens). Router har replica ka queue depth / KV cache usage dekh ke bheje: "least loaded".</td></tr>
        </table>
        <p><b>Prefix-aware routing (optional):</b> same system prompt / same conversation ke requests ek hi replica pe bhejo, taaki uska prefix KV cache dobara kaam aaye (TTFT kam). Trade-off: thoda uneven load.</p>`
    },
    {
      type: "flow",
      title: "Stage 2: gateway → priority queues → load-aware router → replicas",
      nodes: [
        { id: "t", label: "Teams' apps", icon: "👥", x: 80, y: 170, kind: "client", w: 140 },
        { id: "gw", label: "Gateway\nkey → team, token quota", icon: "🚪", x: 290, y: 170, kind: "service", w: 200 },
        { id: "qi", label: "Queue: interactive", icon: "⚡", x: 530, y: 80, kind: "queue", w: 180 },
        { id: "qb", label: "Queue: batch", icon: "🐢", x: 530, y: 270, kind: "queue", w: 160 },
        { id: "rt", label: "Router\n(least KV/queue)", icon: "🧭", x: 740, y: 170, kind: "service", w: 170 },
        { id: "g1", label: "vLLM replica 1", icon: "🧠", x: 920, y: 80, kind: "service", w: 150 },
        { id: "g2", label: "vLLM replica 2", icon: "🧠", x: 920, y: 270, kind: "service", w: 150 }
      ],
      edges: [
        { from: "t", to: "gw", both: true },
        { from: "gw", to: "qi" },
        { from: "gw", to: "qb" },
        { from: "qi", to: "rt" },
        { from: "qb", to: "rt", dashed: true },
        { from: "rt", to: "g1" },
        { from: "rt", to: "g2" }
      ],
      steps: [
        { title: "Chat request: high priority", html: "<p>Quota check, interactive queue, router kam bhare replica ko bhejta hai.</p>", path: ["t", "gw", "qi", "rt", "g1"], active: ["qi", "g1"] },
        { title: "Batch job: bachi capacity pe", html: "<p>Batch requests tab hi nikalte hain jab interactive queue khaali ho / replicas mein jagah ho.</p>", path: ["t", "gw", "qb", "rt", "g2"], active: ["qb"] },
        { title: "Team ka loop: quota", html: "<p>Ek team ka bug 10× requests bhej raha hai: tokens/min quota pe 429. Baaki teams pe asar nahi.</p>", path: ["t", "gw", "t"], fail: ["gw"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: kai models aur fine-tunes</h2>
        <table>
          <tr><th>Problem</th><th>Faisla</th><th>Kyun / alternative</th></tr>
          <tr><td>70B ek GPU mein nahi aata</td><td>Tensor parallel (2-4 GPUs ek replica), ya INT8/INT4 quantized version</td><td>Quantization se GPU kam, par apne evals pe quality check</td></tr>
          <tr><td>10 teams ke apne LoRA fine-tunes</td><td><b>Multi-LoRA serving</b>: ek base model, request ke hisaab se chhota adapter load (vLLM jaise engines support karte hain)</td><td>Har fine-tune ka alag full model deploy = 10× GPUs, zyaadatar khaali</td></tr>
          <tr><td>Har request 70B pe = mehenga</td><td>Model routing: default 8B; "smart" sirf jab team maange ya classifier bole</td><td>Sab 70B pe: kharcha kai guna</td></tr>
          <tr><td>Kaunsa model, kaunsa version, kahan</td><td>Model registry (naam → weights, version, eval scores) + gradual rollout (canary)</td><td>Manual deploys: rollback mushkil</td></tr>
        </table>
        <h2>Stage 4: autoscaling aur kharcha</h2>
        <p><b>Problem:</b> web servers seconds mein scale hote hain. GPU replica ko machine milna + 16-140 GB weights load karna = <b>minutes</b>. Aur GPU ghante ka paisa leta hai chahe khaali ho.</p>
        <table>
          <tr><th>Tareeka</th><th>Kyun</th></tr>
          <tr><td>Scale signal = queue time / TTFT / KV cache usage (CPU% nahi)</td><td>GPU pe CPU% kuch nahi batata</td></tr>
          <tr><td>Warm minimum replicas + thoda headroom</td><td>Cold start minutes ka hai; spike ka pehla hissa headroom sambhale</td></tr>
          <tr><td>Weights local NVMe / fast storage pe cache</td><td>Load time kam</td></tr>
          <tr><td>Batch traffic ko raat ya sasti (spot/preemptible) capacity pe</td><td>Din ka peak flat hota hai, GPUs raat mein khaali nahi rehte</td></tr>
          <tr><td>Per-team cost dashboard (₹ per 1M tokens)</td><td>Jab teams ko apna bill dikhe, wo khud prompts chhote karti hain</td></tr>
        </table>
        <p><b>Observability:</b> TTFT, time per output token, tokens/s per GPU, queue wait time, KV cache utilization, GPU utilization, error/timeout rate, per team aur per model.</p>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Component</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Model serve karna</td><td>vLLM (continuous batching, paged KV), OpenAI-compatible API</td><td>Khud likha loop: GPU waste</td></tr>
          <tr><td>2</td><td>Noisy team, batch vs chat</td><td>Gateway + token quotas + priority queues</td><td>Sirf requests/min limit</td></tr>
          <tr><td>2</td><td>Uneven request sizes</td><td>Load-aware (KV/queue) routing</td><td>Round robin</td></tr>
          <tr><td>3</td><td>Bade model, kai fine-tunes</td><td>Tensor parallel / quantization, multi-LoRA, model routing</td><td>Har fine-tune ka full deploy</td></tr>
          <tr><td>4</td><td>Slow cold start, kharcha</td><td>Queue-based autoscaling + warm pool, batch off-peak, chargeback</td><td>CPU-based autoscaling</td></tr>
        </table>`
    },
    {
      type: "think",
      id: "think-serving-capacity",
      q: "Aapke benchmark mein ek GPU (8B model) TTFT &lt; 1 s ke saath ~2,500 output tokens/s deta hai. Peak pe 60,000 output tokens/s chahiye. Kitne GPUs plan karoge aur kyun? Aur kya assumptions check karoge?",
      rubric: [
        { point: "60,000 / 2,500 = 24 GPUs base", keys: ["24 gpu", "24gpu", "= 24", "24 machine", "24 replica"], weight: 2 },
        { point: "Headroom (~20-30%) + ek replica fail / deploy ke liye → ~30", keys: ["headroom", "buffer", "30", "28", "fail", "n+1", "redundan"], weight: 2 },
        { point: "Benchmark asli prompt lengths/mix pe; lambe prompts se capacity girti hai", keys: ["prompt length", "lambe", "mix", "real traffic", "asli", "benchmark"], weight: 2 },
        { point: "Batch ko off-peak bhej ke peak kam; quantization/prefix caching se capacity badhe", keys: ["batch", "off-peak", "raat", "quantiz", "prefix", "cache"], weight: 1 }
      ],
      answer: `<p>Base: 60,000 ÷ 2,500 = <b>24 GPUs</b>. Isme ~25% headroom (traffic spikes, ek replica fail/deploy ho to bhi target mile) → <b>~30 GPUs</b> interactive ke liye. Check: benchmark asli traffic mix pe tha? (lambe prompts zyada hon to prefill bhaari, capacity kam). Peak kam karne ke tareeke: batch jobs off-peak, prefix caching (same system prompts), INT8 quantization (eval ke baad), aur chhote model pe routing.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> LLM serving mein teen baatein bolo jo normal web serving se alag hain: (1) requests ka size bahut alag, isliye token-based quotas aur KV-aware routing; (2) GPU cold start minutes ka, isliye warm pool aur queue-based autoscaling; (3) batch vs interactive priority. Capacity hamesha benchmark se, andaaze se nahi.`
    }
  ],
  references: [
    { title: "vLLM docs", by: "vLLM project", url: "https://docs.vllm.ai/", type: "docs" },
    { title: "Efficient Memory Management for LLM Serving with PagedAttention", by: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180", type: "article" },
    { title: "S-LoRA: Serving Thousands of Concurrent LoRA Adapters", by: "Sheng et al., 2023", url: "https://arxiv.org/abs/2311.03285", type: "article" }
  ]
});
