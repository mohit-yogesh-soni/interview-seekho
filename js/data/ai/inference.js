// Inference: speed aur cost
registerLesson("ai", "inference", {
  why: `Model train ho gaya; ab har user request pe use chalana (inference) hi asli bill hai. Kitni GPU memory chahiye, pehla token kab aayega, ek GPU kitne users sambhalega: ye numbers khud nikaal sako to "kaunsa model, kahan host karein" jaise faisle reason ke saath le paoge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Pehla sawaal: model GPU mein fit hoga?</h2>
        <p>Har parameter ek number hai. Number kitne bytes ka hai, ye <b>precision</b> pe depend karta hai.</p>
        <pre class="code-static">Weights memory ≈ parameters × bytes per parameter

7B model, FP16 (2 bytes)  = 7 × 10⁹ × 2 = 14 GB
7B model, INT8 (1 byte)   = 7 GB
7B model, INT4 (½ byte)   ≈ 3.5 GB
70B model, FP16           = 140 GB  → ek 80 GB GPU mein nahi, kam se kam 2 GPUs</pre>
        <p><b>Quantization</b> = weights ko kam bits mein rakhna (16 → 8 ya 4). Memory kam, aur decode tez (kyunki decode memory se weights padhne mein hi zyada time leta hai). Kimat: thodi quality girti hai, kitni ye method aur model pe depend karta hai, isliye apne task pe eval karke dekho.</p>
        <p>Aur sirf weights nahi: har chalte request ki <b>KV cache</b> bhi memory leti hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>KV cache: dobara hisaab mat karo</h2>
        <p><b>Problem:</b> token 501 banane ke liye attention ko pichhle 500 tokens ke Keys aur Values chahiye. Token 502 ke liye 501 ke. Har baar sabka K/V dobara nikaalna = bekaar kaam (har naya token pichhle saare tokens ka kaam dohraata).</p>
        <p><b>Hal:</b> har token ka K aur V ek baar nikaal ke GPU memory mein rakh lo. Naya token sirf apna K/V jodta hai. Kimat: memory.</p>
        <pre class="code-static">KV cache bytes = 2 (K aur V) × layers × d_model × tokens × batch × bytes per value

Llama 2 7B: 32 layers, d_model 4096, FP16:
per token  = 2 × 32 × 4096 × 2 bytes = 524,288 bytes ≈ 0.5 MB
4,096 tokens ka ek conversation ≈ 2 GB
32 aise conversations ek saath ≈ 64 GB  (weights ke 14 GB alag!)</pre>
        <p>Yahi wajah hai ki lambe contexts aur zyada users GPU memory jaldi khatam karte hain. Naye models <b>GQA</b> (grouped-query attention: kai query heads ek K/V share karte hain) jaise tricks se KV cache chhoti karte hain; Llama 2 70B mein GQA hai, 7B mein nahi.</p>`
    },
    {
      type: "exercise",
      id: "ex-kv-cache",
      title: "KV cache ka size nikaalo",
      level: "Easy",
      task: `<p><code>kvCacheBytes(layers, dModel, tokens, batch, bytesPerValue)</code>: upar wala formula, <code>long</code> mein (int overflow se bachna). Aur <code>maxBatch(gpuBytes, weightBytes, perSeqBytes)</code>: weights ke baad bachi memory mein kitne poore sequences fit honge (bachi memory negative ho to 0).</p>`,
      examples: "<code>kvCacheBytes(32, 4096, 1, 1, 2)</code> → <code>524288</code><br><code>maxBatch(80e9, 14e9, 2147483648)</code> → <code>30</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    long kvCacheBytes(int layers, int dModel, int tokens, int batch, int bytesPerValue) {
        // yahan likho
        return 0;
    }

    long maxBatch(long gpuBytes, long weightBytes, long perSeqBytes) {
        // yahan likho
        return -1;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("Llama-2-7B, 1 token", 524288L, () -> s.kvCacheBytes(32, 4096, 1, 1, 2));
        Check.eq("80GB GPU, 14GB weights, 2GiB/seq", 30L, () -> s.maxBatch(80_000_000_000L, 14_000_000_000L, 2_147_483_648L));
        Check.hiddenFromHere();
        Check.eq("4096 tokens (overflow nahi)", 2_147_483_648L, () -> s.kvCacheBytes(32, 4096, 4096, 1, 2));
        Check.eq("batch 32", 68_719_476_736L, () -> s.kvCacheBytes(32, 4096, 4096, 32, 2));
        Check.eq("INT8 KV", 1_073_741_824L, () -> s.kvCacheBytes(32, 4096, 4096, 1, 1));
        Check.eq("weights hi fit nahi", 0L, () -> s.maxBatch(16_000_000_000L, 28_000_000_000L, 1_000_000L));
        Check.eq("exact fit", 4L, () -> s.maxBatch(100L, 20L, 20L));
    }
}`,
      hints: [
        "<code>2L * layers * dModel * tokens * batch * bytesPerValue</code>: pehla <code>2L</code> poore hisaab ko long bana deta hai.",
        "maxBatch: <code>free = gpuBytes - weightBytes</code>; negative ho to 0, warna <code>free / perSeqBytes</code>."
      ],
      solution: `class Solution {
    long kvCacheBytes(int layers, int dModel, int tokens, int batch, int bytesPerValue) {
        return 2L * layers * dModel * tokens * batch * bytesPerValue;
    }

    long maxBatch(long gpuBytes, long weightBytes, long perSeqBytes) {
        long free = gpuBytes - weightBytes;
        if (free <= 0) return 0;
        return free / perSeqBytes;
    }
}`,
      explain: `<p>Ye napkin math GPU sizing ka pehla kadam hai. Asli mein activations aur framework overhead ke liye bhi kuch memory chhodo, aur sab sequences max length tak nahi jaate: isliye vLLM jaise servers KV cache ko pages mein dete hain (PagedAttention), taaki jitna use ho utna hi lage.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Speed ke do numbers: TTFT aur tokens/sec</h2>
        <table>
          <tr><th>Phase</th><th>Kya hota hai</th><th>Bottleneck</th><th>User ko kya dikhta hai</th></tr>
          <tr><td><b>Prefill</b></td><td>Poora prompt ek saath process, saare K/V cache mein</td><td>Compute (bahut saare tokens parallel)</td><td><b>TTFT</b> (time to first token): lamba prompt = zyada wait</td></tr>
          <tr><td><b>Decode</b></td><td>Ek baar mein ek token</td><td>Memory bandwidth (har token pe weights + KV padhne)</td><td>Tokens/sec (ya time per output token): text kitni tezi se likha jaata hai</td></tr>
        </table>
        <h2>Ek GPU pe zyada users: batching</h2>
        <p>Decode mein ek user ke liye GPU weights padhta hai aur thoda sa compute karta hai: zyaadatar compute khaali. 32 users ke tokens ek saath banao to weights ek hi baar padhe jaate hain. <b>Continuous batching</b> (har step pe khatam hue requests nikalo, naye jodo) aaj ke serving engines (vLLM, TGI, TensorRT-LLM) ka default hai. Trade-off: batch bada = total throughput zyada, par har user ka tokens/sec thoda kam.</p>
        <h2>Aur tricks (naam aur ek line)</h2>
        <table>
          <tr><th>Trick</th><th>Kya karti hai</th></tr>
          <tr><td>Prefix / prompt caching</td><td>Same system prompt ka KV cache dobara use: TTFT aur kharcha kam</td></tr>
          <tr><td>Speculative decoding</td><td>Ek chhota model kai tokens guess karta hai, bada model unhe ek saath check karta hai; sahi guesses free mein. Output wahi rehta hai jo bada model deta.</td></tr>
          <tr><td>Tensor parallelism</td><td>Model ko kai GPUs mein baanto jab ek mein fit na ho (70B FP16)</td></tr>
          <tr><td>Chhota / distilled model</td><td>Bade model ke outputs se chhota model train: sasta, tez, kai tasks pe kaafi</td></tr>
        </table>`
    },
    {
      type: "pick",
      id: "pick-latency",
      q: "Support chatbot ka TTFT 4 second hai (system prompt + docs = 12,000 tokens). Kaunse changes TTFT kam karenge?",
      options: [
        { text: "Prompt chhota karo: sirf relevant docs (retrieval)", correct: true, why: "Prefill tokens kam = TTFT kam." },
        { text: "Prefix caching: fixed system prompt ka KV dobara use", correct: true, why: "Har request pe wahi hissa dobara prefill nahi hota." },
        { text: "max_tokens (output limit) 2,000 se 500 karo", correct: false, why: "Ye total time kam karta hai, pehla token jaldi nahi laata." },
        { text: "Temperature 0 karo", correct: false, why: "Sampling ka speed pe asar nahi hai." },
        { text: "Chhota model use karo (agar quality chal jaaye)", correct: true, why: "Kam parameters = prefill aur decode dono tez." }
      ],
      answer: "TTFT prefill pe depend karta hai: prompt ki length aur model ka size. Output length total time badhati hai, TTFT nahi."
    },
    {
      type: "think",
      id: "think-self-host",
      q: "CTO: \"API ka bill bahut hai, apna open-source 8B model self-host kar lete hain.\" Faisla lene se pehle kaunse 4 sawaal poochoge?",
      rubric: [
        { point: "Quality: hamare task pe 8B kaafi hai? (evals)", keys: ["quality", "eval", "accuracy", "kaafi", "task pe"], weight: 2 },
        { point: "Traffic/utilization: GPU 24×7 ka kharcha vs per-token API; kam traffic pe GPU khaali", keys: ["traffic", "utiliz", "khaali", "idle", "volume", "per token", "24"], weight: 2 },
        { point: "Ops: GPU availability, scaling, on-call, updates", keys: ["ops", "maintain", "on-call", "team", "gpu availab", "scaling", "upgrade"], weight: 2 },
        { point: "Data privacy / compliance (self-host ka fayda)", keys: ["privacy", "data", "compliance", "security", "gdpr"], weight: 1 },
        { point: "Latency, context length, quantization se memory", keys: ["latency", "context", "quantiz", "memory"], weight: 1 }
      ],
      answer: `<ul><li><b>Quality:</b> hamare asli prompts pe eval karo; 8B kai tasks pe chalega, kuch pe nahi.</li><li><b>Utilization:</b> GPU ka paisa ghante ke hisaab se lagta hai, chahe use ho ya nahi. Traffic kam ya spiky hai to API sasta padta hai; lagaatar zyada traffic pe self-host sasta.</li><li><b>Operations:</b> GPU milna, autoscaling, serving engine (vLLM), monitoring, model upgrades, on-call: ye sab team ka time.</li><li><b>Privacy/compliance:</b> data bahar na jaaye to self-host ka bada fayda.</li><li><b>Latency/memory:</b> quantization (INT4/8) se sasta GPU chal sakta hai; context length se KV cache ka size.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "7B FP16 = 14 GB" aur "KV cache = 2 × layers × d_model × tokens × bytes" ye do formulas zubaani yaad rakho. Inse turant GPU count aur batch size ka andaaza de sakte ho, jo senior AI infra interviews mein seedha poocha jaata hai.`
    }
  ],
  references: [
    { title: "Efficient Memory Management for LLM Serving with PagedAttention (vLLM)", by: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180", type: "article" },
    { title: "Llama 2: Open Foundation and Fine-Tuned Chat Models", by: "Touvron et al., 2023", url: "https://arxiv.org/abs/2307.09288", type: "article" },
    { title: "Fast Inference from Transformers via Speculative Decoding", by: "Leviathan et al., 2023", url: "https://arxiv.org/abs/2211.17192", type: "article" }
  ]
});
