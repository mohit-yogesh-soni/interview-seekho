// Transformer aur Attention (intuition)
registerLesson("ai", "transformer", {
  why: `"Attention" wo trick hai jisse model har word ka matlab baaki words ko dekh ke tay karta hai, aur ye kaam GPU pe saare words ke liye ek saath (parallel) hota hai. Transformer (2017) isi pe bana, aur aaj ke saare bade LLMs transformer hi hain. Context window ki limit aur lambe prompts ka kharcha bhi yahin se aata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: ek word ka matlab context se badalta hai</h2>
        <p>"Main <b>bank</b> gaya paise nikaalne" aur "Hum nadi ke <b>bank</b> pe baithe". Embedding table "bank" ko dono jagah <b>same</b> vector deta hai. Model ko har position pe ek naya, context wala vector chahiye: pehle mein "paise" ki taraf jhuka hua, doosre mein "nadi" ki taraf.</p>
        <h3>Pehle kya tha, aur kyun kaafi nahi tha</h3>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Kami</th></tr>
          <tr><td>RNN / LSTM</td><td>Words ek ek karke padho, ek "memory" vector aage badhao</td><td>Word 1 ki baat word 500 tak pahunchte pahunchte dhundhli; aur ek ke baad ek chalta hai, to GPU ka parallelism bekaar</td></tr>
          <tr><td><b>Self-attention</b> ⭐</td><td>Har word seedha har doosre word ko dekh sakta hai aur tay karta hai kise kitna dhyaan de</td><td>n words = n × n comparisons: lambe text pe mehenga (context window limit yahin se)</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>Attention: ek chhota search engine har word ke andar</h2>
        <p>Har token ke vector se teen naye vectors banate hain (teen alag seekhe hue weight matrices se multiply karke):</p>
        <table>
          <tr><th>Vector</th><th>Matlab (analogy: library search)</th></tr>
          <tr><td><b>Query (Q)</b></td><td>"Mujhe kya dhoondhna hai?" (jaise "bank" poochta hai: koi paise ya paani wala word hai?)</td></tr>
          <tr><td><b>Key (K)</b></td><td>"Main kis baare mein hoon?" (har word ka label)</td></tr>
          <tr><td><b>Value (V)</b></td><td>"Agar mujhe chuna, to main ye information dunga"</td></tr>
        </table>
        <pre class="code-static">score(i, j) = Q_i · K_j / √d          (d = vector size; √d se divide taaki scores bahut bade na hon)
weights     = softmax(scores)          (har row ka total 1)
output_i    = Σ_j weights(i, j) × V_j  (dhyaan ke hisaab se values ka mix)</pre>
        <p>"bank" ki query "paise" ki key se zyada match karti hai, to "bank" ke naye vector mein "paise" ki value ka bada hissa aa jaata hai. Ab wo financial bank hai.</p>`
    },
    {
      type: "steps",
      title: "Toy attention: \"bank\" kis word pe dhyaan de?",
      steps: [
        { title: "Scores (Q·K/√d)", html: "<p>Sentence: <code>main bank gaya paise</code>. \"bank\" ki query ke saath scores: main 0.1, bank 0.5, gaya 0.2, paise <b>2.0</b>.</p>" },
        { title: "Softmax → weights", html: "<p>e^score normalize: main ~0.10, bank ~0.15, gaya ~0.11, paise <b>~0.65</b>. Sab milake 1.</p>" },
        { title: "Values ka mix", html: "<p>Naya \"bank\" vector = 0.65 × V(paise) + 0.15 × V(bank) + ... Ab is vector mein \"paise\" ki information sabse zyada hai.</p>" },
        { title: "Har word ke liye ek saath", html: "<p>Ye hisaab saare words ke liye <b>ek matrix multiplication</b> mein ho jaata hai (Q × Kᵀ). GPU isi mein tez hai: isliye transformers bade data pe train ho paaye.</p>" }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Baaki hisse (ek line mein har ek)</h2>
        <table>
          <tr><th>Hissa</th><th>Kyun chahiye</th></tr>
          <tr><td><b>Causal mask</b></td><td>GPT jaise models ko agla token predict karna hai, to position i sirf apne se pehle wale tokens dekh sakti hai, aage ke nahi (warna training mein "cheating"). Mask future positions ke scores ko −∞ kar deta hai, softmax ke baad 0.</td></tr>
          <tr><td><b>Multi-head</b></td><td>Ek attention ek tarah ka rishta pakadta hai. Kai heads (jaise 12) alag alag rishte dekhte hain: ek grammar, ek "ye 'wo' kisko refer kar raha hai", ek nearby words.</td></tr>
          <tr><td><b>Positional information</b></td><td>Attention khud order nahi jaanta ("kutte ne aadmi ko kaata" vs "aadmi ne kutte ko"). Har position ki info vector mein jodi jaati hai (GPT-2 mein seekhe hue position embeddings; naye models mein aksar RoPE).</td></tr>
          <tr><td><b>Feed-forward layer</b></td><td>Attention ke baad har token pe ek chhota neural network: yahan bahut saara "knowledge" store hota hai.</td></tr>
          <tr><td><b>Residual + LayerNorm</b></td><td>Gehre (bahut layers) network ko stable train karne ke liye</td></tr>
          <tr><td><b>Layers stack</b></td><td>Ye poora block kai baar (GPT-2 small: 12 layers, 12 heads, 768 dimension, 1,024 token context)</td></tr>
          <tr><td><b>Output head</b></td><td>Last vector ko vocabulary size ke logits mein badalta hai → softmax → agla token</td></tr>
        </table>
        <h3>Context window kyun limited hai</h3>
        <p>Attention mein har token har pichhle token se compare hota hai: n tokens ≈ n² kaam (aur generation mein pichhle tokens ke K/V memory mein rakhne padte hain, inference lesson). 2× lamba prompt = attention ka ~4× kaam. Isliye context window ki limit hai aur lamba prompt mehenga aur slow hai.</p>`
    },
    {
      type: "flow",
      title: "GPT-style model: ek token ka safar",
      nodes: [
        { id: "tok", label: "Token ids", icon: "🔢", x: 80, y: 170, kind: "client", w: 130 },
        { id: "emb", label: "Embedding\n+ position", icon: "🧮", x: 250, y: 170, kind: "service", w: 150 },
        { id: "att", label: "Masked multi-head\nattention", icon: "👀", x: 470, y: 80, kind: "service", w: 190 },
        { id: "ff", label: "Feed-forward", icon: "⚙️", x: 470, y: 270, kind: "service", w: 170 },
        { id: "rep", label: "× N layers", icon: "🔁", x: 690, y: 170, kind: "queue", w: 130 },
        { id: "head", label: "Logits → softmax", icon: "📊", x: 880, y: 170, kind: "data", w: 170 }
      ],
      edges: [
        { from: "tok", to: "emb" },
        { from: "emb", to: "att" },
        { from: "att", to: "ff" },
        { from: "ff", to: "rep" },
        { from: "rep", to: "att", dashed: true },
        { from: "rep", to: "head" }
      ],
      steps: [
        { title: "Ids → vectors", html: "<p>Har token id ka embedding + uski position ki info.</p>", path: ["tok", "emb"], active: ["emb"] },
        { title: "Attention: context jodo", html: "<p>Har token pichhle tokens ko dekh ke apna vector update karta hai (future masked).</p>", path: ["emb", "att"], active: ["att"] },
        { title: "Feed-forward, phir agli layer", html: "<p>Har token pe chhota network. Ye attention + FF block N baar.</p>", path: ["att", "ff", "rep", "att"], active: ["ff", "rep"] },
        { title: "Last position → agla token", html: "<p>Aakhri token ka vector vocabulary ke logits mein; softmax + sampling (pichhla lesson).</p>", path: ["rep", "head"], active: ["head"] }
      ]
    },
    {
      type: "quiz",
      q: "Prompt 4,000 tokens se 8,000 tokens kar diya. Attention ka score-computation (har token × har token) lagbhag kitna badhega?",
      options: ["Same rahega", "2 guna", "4 guna", "8 guna"],
      answer: 2,
      why: "n × n comparisons: (2n)² = 4n². Model ke baaki hisse (feed-forward) n ke saath linear badhte hain, to poora cost 2× aur 4× ke beech hota hai, par lambe contexts mein attention ka hissa bhaari hota jaata hai. FlashAttention jaise tricks memory/speed sudharte hain, par n² kaam wahi rehta hai."
    },
    {
      type: "exercise",
      id: "ex-attention",
      title: "Ek query ke liye scaled dot-product attention",
      level: "Medium",
      task: `<p><code>attend(q, K, V)</code>: <code>q</code> ek query vector (size d), <code>K</code> aur <code>V</code> mein n rows (har row size d). Karo:</p>
        <ol>
          <li><code>score[j] = (q · K[j]) / √d</code></li>
          <li><code>w = softmax(score)</code> (max-subtraction ke saath, overflow na ho)</li>
          <li>return <code>Σ_j w[j] × V[j]</code> (size d ka vector)</li>
        </ol>`,
      examples: "<code>q=[1,0], K=[[1,0],[1,0]], V=[[2,4],[6,8]]</code> → dono keys same, weights 0.5/0.5 → <code>[4, 6]</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    double[] attend(double[] q, double[][] K, double[][] V) {
        // yahan likho
        return new double[q.length];
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("same keys → average", new double[]{4, 6}, () -> s.attend(new double[]{1, 0}, new double[][]{{1, 0}, {1, 0}}, new double[][]{{2, 4}, {6, 8}}));
        double e = Math.exp(1 / Math.sqrt(2));
        Check.eq("q=[1,0], K=I", new double[]{10 * e / (e + 1), 10 / (e + 1)}, () -> s.attend(new double[]{1, 0}, new double[][]{{1, 0}, {0, 1}}, new double[][]{{10, 0}, {0, 10}}));
        Check.hiddenFromHere();
        Check.eq("ek hi key → wahi value", new double[]{3, -1, 2}, () -> s.attend(new double[]{5, 5, 5}, new double[][]{{1, 2, 3}}, new double[][]{{3, -1, 2}}));
        Check.eq("bade scores (overflow nahi)", new double[]{7, 0}, () -> s.attend(new double[]{100, 0}, new double[][]{{100, 0}, {0, 0}}, new double[][]{{7, 0}, {0, 7}}));
        Check.eq("zero query → uniform", new double[]{2, 2}, () -> s.attend(new double[]{0, 0}, new double[][]{{1, 0}, {0, 1}, {5, 5}}, new double[][]{{0, 0}, {3, 3}, {3, 3}}));
    }
}`,
      hints: [
        "d = <code>q.length</code>. Pehle saare scores, phir unka max.",
        "<code>w[j] = Math.exp(score[j] - max)</code>, sum se divide.",
        "Output: <code>for j: for c: out[c] += w[j] * V[j][c];</code>"
      ],
      solution: `class Solution {
    double[] attend(double[] q, double[][] K, double[][] V) {
        int n = K.length, d = q.length;
        double[] score = new double[n];
        double max = Double.NEGATIVE_INFINITY;
        for (int j = 0; j < n; j++) {
            double dot = 0;
            for (int c = 0; c < d; c++) dot += q[c] * K[j][c];
            score[j] = dot / Math.sqrt(d);
            max = Math.max(max, score[j]);
        }
        double sum = 0;
        for (int j = 0; j < n; j++) { score[j] = Math.exp(score[j] - max); sum += score[j]; }
        double[] out = new double[V[0].length];
        for (int j = 0; j < n; j++)
            for (int c = 0; c < out.length; c++) out[c] += (score[j] / sum) * V[j][c];
        return out;
    }
}`,
      explain: `<p>Ek query ke liye O(n × d). Saare n tokens ki queries ek saath = O(n² × d): yahi attention ka quadratic cost hai. Real models mein ye matrix form (Q·Kᵀ) mein, kai heads aur layers ke saath, GPU pe hota hai, aur causal mask future positions ko hata deta hai.</p>`
    },
    {
      type: "think",
      id: "think-attn-explain",
      q: "Interviewer: \"Attention ko ek non-ML engineer ko 4-5 lines mein samjhao. Aur ye RNN se behtar kyun hai?\"",
      rubric: [
        { point: "Har token baaki tokens ko dekh ke apna matlab update karta hai (context)", keys: ["context", "dekh", "baaki", "other token", "relation", "dhyaan"], weight: 2 },
        { point: "Query/Key/Value: match score → softmax weights → values ka mix", keys: ["query", "key", "value", "softmax", "weight"], weight: 2 },
        { point: "Parallel (GPU) aur door ke words seedha jud jaate hain; RNN sequential", keys: ["parallel", "gpu", "sequential", "long range", "door", "ek saath"], weight: 2 },
        { point: "Kimat: n² cost, context window limit", keys: ["n²", "n^2", "quadratic", "context window", "mehenga"], weight: 1 }
      ],
      answer: `<p>Har word apne aap se poochta hai "mere matlab ke liye baaki kaunse words zaroori hain?" (query), har word ka ek label hota hai (key), aur ek information (value). Query-key match se scores, softmax se weights, aur values ka weighted mix = us word ka naya, context wala matlab. RNN words ek ek karke padhta tha: slow (parallel nahi) aur door ki baat bhool jaata tha. Attention mein har word seedha har word se judta hai aur sab GPU pe ek saath hota hai. Kimat: n² comparisons, isliye context window ki limit.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Formula <code>softmax(QKᵀ/√d)·V</code> likh do aur har hissa ek line mein samjhao, plus "causal mask kyun" aur "n² cost kyun". Itna senior-level LLM discussion ke liye kaafi hai.`
    }
  ],
  references: [
    { title: "Attention Is All You Need", by: "Vaswani et al., 2017", url: "https://arxiv.org/abs/1706.03762", type: "article" },
    { title: "The Illustrated Transformer", by: "Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/", type: "article" },
    { title: "Build a Large Language Model (From Scratch), Ch. 3-4 (attention, GPT model)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" }
  ]
});
