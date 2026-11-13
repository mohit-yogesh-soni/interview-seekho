// LLM = next token predictor
registerLesson("ai", "next-token", {
  why: `ChatGPT jaisa model asal mein ek hi kaam karta hai: "is text ke baad agla token kya hoga" ki probabilities deta hai. Poora paragraph isi ko baar baar chala ke banta hai. Temperature, top-p, "same sawaal pe alag jawab", aur streaming: sab isi se samajh aata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Ek hi kaam: agla token</h2>
        <p>Phone ka keyboard "Good" ke baad "morning" suggest karta hai. LLM wahi kaam bahut bade scale pe karta hai. Input: ab tak ke tokens. Output: vocabulary ke <b>har</b> token ke liye ek score.</p>
        <ul>
          <li>Ye raw scores <b>logits</b> kehlate hain (koi bhi number, negative bhi).</li>
          <li><b>Softmax</b> logits ko probabilities mein badalta hai: <code>p(i) = e^(logit_i) / Σ e^(logit_j)</code>. Sab positive, total 1, aur bada logit = badi probability.</li>
          <li>Ek token <b>chuno</b> (sampling), use text ke end mein jodo, aur poora process phir se. Isse <b>autoregressive</b> generation kehte hain.</li>
        </ul>`
    },
    {
      type: "steps",
      title: "Ek jawab kaise banta hai (token by token)",
      steps: [
        { title: "Prompt", html: "<p>Input: <code>Mumbai ka sabse famous street food hai</code>. Model har token ke liye probability deta hai: vada (45%), pav (30%), bhel (12%)...</p>" },
        { title: "Token 1: \" vada\"", html: "<p>Sample hua \" vada\". Ab input: <code>... street food hai vada</code>.</p>" },
        { title: "Token 2: \" pav\"", html: "<p>\"vada\" ke baad \"pav\" ki probability ab ~95% hai. Context ne agla token lagbhag tay kar diya.</p>" },
        { title: "Token 3: \".\" → stop", html: "<p>Model ek special <b>end-of-sequence</b> token ya max length tak chalta hai. Har token ek poora model run hai: isliye lambe jawab mein zyada time aur paisa lagta hai, aur UI mein tokens ek ek karke (<b>streaming</b>) aate hain.</p>" }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Token chunein kaise? Decoding ke knobs</h2>
        <table>
          <tr><th>Tareeka</th><th>Kya karta hai</th><th>Kab</th></tr>
          <tr><td><b>Greedy</b></td><td>Hamesha sabse probable token</td><td>Deterministic chahiye (extraction, classification). Lambe text mein repeat/boring ho sakta hai.</td></tr>
          <tr><td><b>Temperature</b> (T)</td><td>Softmax se pehle logits ko T se divide. T &lt; 1: distribution nukeeli (top token aur hawi). T &gt; 1: chapti (rare tokens ko mauka).</td><td>Low (0-0.3): facts, code, JSON. High (0.8-1.2): brainstorming, stories.</td></tr>
          <tr><td><b>Top-p</b> (nucleus)</td><td>Probabilities sort karo, utne top tokens rakho jinka total p tak pahunche; baaki hatao, phir renormalize</td><td>Bekaar long-tail tokens kaatne ke liye (jaise p = 0.9)</td></tr>
          <tr><td><b>Top-k</b></td><td>Sirf top k tokens rakho</td><td>Simple cut-off; top-p zyada adaptive hai</td></tr>
        </table>
        <p>Neeche demo mein sliders ghuma ke dekho. T bahut kam karo: lagbhag hamesha "vada pav". T 2 karo: "dosa" jaisi ajeeb cheezein bhi aane lagti hain. Top-p 0.5 karo: neeche wale tokens kat jaate hain.</p>`
    },
    {
      type: "sampling",
      title: "Temperature aur top-p khud ghuma ke dekho",
      prompt: "Mumbai ka sabse famous street food hai",
      temperature: 1,
      topP: 1,
      tokens: [
        { t: "vada pav", logit: 3.2 },
        { t: "pav bhaji", logit: 2.8 },
        { t: "bhel puri", logit: 1.9 },
        { t: "pani puri", logit: 1.6 },
        { t: "sev puri", logit: 0.8 },
        { t: "dosa", logit: -0.5 },
        { t: "pizza", logit: -1.2 }
      ]
    },
    {
      type: "quiz",
      q: "Aap LLM se invoice ka JSON nikalwa rahe ho (amount, date, GSTIN). Same invoice pe kabhi kabhi alag output aata hai. Pehla fix kya?",
      options: ["Temperature badhao taaki model zyada soche", "Temperature 0 (ya bahut kam) karo aur structured output / JSON schema use karo", "Top-p 1 karo", "Prompt mein 'please' likho"],
      answer: 1,
      why: "Extraction mein creativity nahi chahiye. Kam temperature se sampling lagbhag greedy ho jaata hai. Phir bhi 100% same output ki guarantee nahi hoti (GPU pe floating point aur batching ka asar), isliye output ko schema se validate bhi karo."
    },
    {
      type: "exercise",
      id: "ex-softmax",
      title: "Softmax with temperature + top-p",
      level: "Medium",
      task: `<p>Do methods (demo andar se yahi karta hai):</p>
        <ol>
          <li><code>softmax(logits, temp)</code>: har logit ko <code>temp</code> se divide karo, phir softmax. <b>Overflow se bachne ke liye</b> pehle max nikaal ke sabse ghatao (<code>e^(x − max)</code>): result same rehta hai.</li>
          <li><code>topP(probs, p)</code>: probabilities ko bade se chhote order mein (barabar ho to chhota index pehle) jodte jao jab tak total <code>≥ p</code> na ho (floating error ke liye <code>p − 1e-9</code> se compare karo). Jo tokens is set mein nahi, unki probability 0; baaki ko renormalize karo (total 1). Original order mein array return karo.</li>
        </ol>`,
      examples: "<code>softmax([0,0], 1)</code> → <code>[0.5, 0.5]</code><br><code>topP([0.5,0.3,0.2], 0.7)</code> → <code>[0.625, 0.375, 0.0]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    double[] softmax(double[] logits, double temp) {
        // yahan likho
        return new double[logits.length];
    }

    double[] topP(double[] probs, double p) {
        // yahan likho
        return new double[probs.length];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("softmax [0,0]", new double[]{0.5, 0.5}, () -> s.softmax(new double[]{0, 0}, 1));
        Check.eq("topP 0.7", new double[]{0.625, 0.375, 0.0}, () -> s.topP(new double[]{0.5, 0.3, 0.2}, 0.7));
        Check.hiddenFromHere();
        double e1 = Math.exp(1), e2 = Math.exp(2), e3 = Math.exp(3), z = e1 + e2 + e3;
        Check.eq("softmax [1,2,3]", new double[]{e1 / z, e2 / z, e3 / z}, () -> s.softmax(new double[]{1, 2, 3}, 1));
        double a = 1 / (1 + Math.exp(2));
        Check.eq("temp 0.5 nukeela", new double[]{a, 1 - a}, () -> s.softmax(new double[]{1, 2}, 0.5));
        Check.eq("bade logits (overflow nahi)", new double[]{0.5, 0.5}, () -> s.softmax(new double[]{1000, 1000}, 1));
        Check.eq("temp bada → lagbhag barabar", new double[]{1 / (1 + Math.exp(0.01)), 1 - 1 / (1 + Math.exp(0.01))}, () -> s.softmax(new double[]{0, 1}, 100));
        Check.eq("topP 1.0: sab", new double[]{0.5, 0.3, 0.2}, () -> s.topP(new double[]{0.5, 0.3, 0.2}, 1.0));
        Check.eq("topP: unsorted input", new double[]{0.0, 1.0, 0.0}, () -> s.topP(new double[]{0.2, 0.5, 0.3}, 0.5));
        Check.eq("topP tie: chhota index", new double[]{1.0, 0.0, 0.0}, () -> s.topP(new double[]{0.4, 0.4, 0.2}, 0.3));
    }
}`,
      hints: [
        "softmax: <code>max</code> nikaalo (scaled values ka), phir <code>ex[i] = Math.exp(x[i]/temp - max)</code>, phir sum se divide.",
        "topP: <code>Integer[] idx</code> banao, sort: prob desc, tie pe index asc. Jodte jao; <code>acc &gt;= p - 1e-9</code> pe ruko.",
        "Rakhe hue indices ka total <code>ks</code>; result mein <code>out[i] = probs[i] / ks</code> sirf rakhe hue ke liye."
      ],
      solution: `import java.util.*;

class Solution {
    double[] softmax(double[] logits, double temp) {
        int n = logits.length;
        double[] out = new double[n];
        double max = Double.NEGATIVE_INFINITY;
        for (double x : logits) max = Math.max(max, x / temp);
        double sum = 0;
        for (int i = 0; i < n; i++) { out[i] = Math.exp(logits[i] / temp - max); sum += out[i]; }
        for (int i = 0; i < n; i++) out[i] /= sum;
        return out;
    }

    double[] topP(double[] probs, double p) {
        int n = probs.length;
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) idx[i] = i;
        Arrays.sort(idx, (x, y) -> probs[y] != probs[x] ? Double.compare(probs[y], probs[x]) : Integer.compare(x, y));
        boolean[] keep = new boolean[n];
        double acc = 0;
        for (int i : idx) {
            keep[i] = true;
            acc += probs[i];
            if (acc >= p - 1e-9) break;
        }
        double ks = 0;
        for (int i = 0; i < n; i++) if (keep[i]) ks += probs[i];
        double[] out = new double[n];
        for (int i = 0; i < n; i++) out[i] = keep[i] ? probs[i] / ks : 0;
        return out;
    }
}`,
      explain: `<p>Max-subtraction ek standard trick hai: <code>e^1000</code> double mein Infinity ho jaata, par <code>e^(1000−1000) = 1</code>. Real inference engines ye har token pe vocabulary ke ~1 lakh logits pe GPU mein karte hain. Time: softmax O(V), topP O(V log V) sort ki wajah se.</p>`
    },
    {
      type: "think",
      id: "think-nondeterminism",
      q: "Product manager: \"Same sawaal pe chatbot kabhi alag jawab deta hai. Kya ye bug hai?\" Unhe 3-4 lines mein samjhao, aur kab ye theek hai, kab nahi.",
      rubric: [
        { point: "Model probabilities deta hai; sampling se har baar alag token chun sakta hai", keys: ["probabil", "sampling", "random", "chance"], weight: 2 },
        { point: "Temperature / top-p se control", keys: ["temperature", "top-p", "top p", "topp"], weight: 2 },
        { point: "Creative kaam mein theek; facts/extraction/JSON mein temperature kam + validation", keys: ["creative", "facts", "json", "extraction", "validate", "schema"], weight: 2 },
        { point: "Temp 0 pe bhi 100% guarantee nahi", keys: ["guarantee", "fir bhi", "phir bhi", "100%", "floating", "batch"], weight: 1 }
      ],
      answer: `<p>Bug nahi, design hai. Model har step pe agle token ki probabilities deta hai aur hum unme se <b>sample</b> karte hain, to raasta alag ho sakta hai. Ye <b>temperature / top-p</b> se control hota hai. Brainstorming/marketing copy mein variety achhi hai. Facts, extraction, JSON ya legal text mein temperature ~0 rakho aur output ko schema/rules se validate karo. Temperature 0 pe bhi bit-by-bit same output ki pakki guarantee nahi hoti (GPU math aur batching), isliye tests "matlab sahi hai?" pe likho, exact string pe nahi.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "LLM next-token predictor hai" ke baad turant ye bolo: logits → softmax (temperature se scaled) → top-p/top-k filter → sample → append → repeat. Ye ek line pipeline dikhati hai ki aapko andar ka flow pata hai.`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch), Ch. 4-5 (text generation, decoding)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "The Curious Case of Neural Text Degeneration (top-p / nucleus sampling)", by: "Holtzman et al., 2019", url: "https://arxiv.org/abs/1904.09751", type: "article" },
    { title: "Let's build GPT: from scratch, in code, spelled out", by: "Andrej Karpathy (YouTube)", url: "https://www.youtube.com/@karpathy", type: "video" }
  ]
});
