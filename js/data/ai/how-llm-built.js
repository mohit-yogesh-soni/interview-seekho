// LLM kaise banta hai
registerLesson("ai", "how-llm-built", {
  why: `"Base model", "instruct model", "fine-tuning", "RLHF": ye shabd har AI discussion mein aate hain. Ek LLM teen bade stages mein banta hai, aur har stage ek alag problem solve karta hai. Ye samajh liya to "fine-tune karein ya RAG?" jaise faisle bhi aasaan ho jaate hain.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 1: pre-training (zabaan aur duniya ka gyaan)</h2>
        <p><b>Problem:</b> model ke weights random hain. Use language, facts, code, reasoning ke patterns chahiye. Kisi insaan ko har cheez label karne ko nahi bol sakte (arbon examples).</p>
        <p><b>Trick:</b> internet ka text khud apna label hai. "Mumbai ka sabse famous street food hai vada" mein "vada" se pehle tak padho, "vada" predict karo, galti se seekho. Har position ek training example. Isse <b>self-supervised learning</b> kehte hain: labels data se hi aate hain.</p>
        <table>
          <tr><th>Kaam</th><th>Kya hota hai</th></tr>
          <tr><td>Data collect</td><td>Web pages, books, code, papers. Trillions of tokens.</td></tr>
          <tr><td>Clean</td><td>Duplicates hatao (warna model ratta maarta hai), spam/kharab quality filter, personal data aur toxic content kam karo</td></tr>
          <tr><td>Tokenize</td><td>BPE tokenizer (tokens lesson)</td></tr>
          <tr><td>Train</td><td>Next-token loss pe gradient descent, hazaaron GPUs pe hafton/mahino</td></tr>
        </table>
        <table>
          <tr><th>Model</th><th>Pre-training data (public papers/posts ke mutabik)</th></tr>
          <tr><td>GPT-3 (2020)</td><td>~300 billion tokens</td></tr>
          <tr><td>Llama 2 (2023)</td><td>~2 trillion tokens</td></tr>
          <tr><td>Llama 3 (2024)</td><td>15 trillion+ tokens</td></tr>
        </table>
        <p><b>Nateeja: base model.</b> Ye bahut kuch jaanta hai, par sirf "text aage badhata" hai. Use "Bharat ki rajdhani kya hai?" do, to ho sakta hai wo jawab dene ki jagah aur sawaal likh de ("Bharat ki sabse lambi nadi kaunsi hai?"), kyunki internet pe sawaalon ki lists aisi hi hoti hain.</p>
        <p><b>Kitna data, kitna bada model?</b> DeepMind ke Chinchilla paper (2022) ne dikhaya ki ek fixed compute budget mein model size aur data saath badhane chahiye; unke results mein roughly <b>~20 tokens per parameter</b> compute-optimal nikla. Aaj ke models aksar isse bhi zyada data pe train hote hain, kyunki chhota model inference mein sasta padta hai.</p>`
    },
    {
      type: "exercise",
      id: "ex-bigram",
      title: "Duniya ka sabse chhota \"language model\": bigram counts",
      level: "Easy",
      task: `<p>Pre-training ka core idea counting se samjho. <code>predictNext(words, w)</code>: <code>words</code> mein jahan bhi <code>w</code> aaya hai, uske turant baad wala word gino. Sabse zyada baar aane wala return karo. Tie ho to dictionary order mein chhota (<code>compareTo</code>). <code>w</code> kabhi kisi word se pehle na aaya ho to <code>""</code>.</p>`,
      examples: "<code>words = [chai, garam, hai, chai, garam, hai, chai, thandi, hai]</code>, <code>w = chai</code> → <code>garam</code> (2 vs 1)",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    String predictNext(String[] words, String w) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    static String[] W(String s) { return s.split(" "); }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("chai → garam", "garam", () -> s.predictNext(W("chai garam hai chai garam hai chai thandi hai"), "chai"));
        Check.eq("garam → hai", "hai", () -> s.predictNext(W("chai garam hai chai garam hai chai thandi hai"), "garam"));
        Check.hiddenFromHere();
        Check.eq("last word ke baad kuch nahi", "", () -> s.predictNext(W("chai garam hai"), "hai"));
        Check.eq("word hai hi nahi", "", () -> s.predictNext(W("chai garam hai"), "coffee"));
        Check.eq("tie → dictionary order", "masala", () -> s.predictNext(W("chai masala chai thandi"), "chai"));
        Check.eq("repeat: a a a b", "a", () -> s.predictNext(W("a a a b"), "a"));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50000; i++) sb.append(i % 3 == 0 ? "x y " : "x z ");
        String[] big = W(sb.toString().trim());
        Check.eq("bada input", "z", () -> s.predictNext(big, "x"));
    }
}`,
      hints: [
        "Ek loop <code>i = 0 .. n-2</code>: agar <code>words[i].equals(w)</code> to <code>words[i+1]</code> ka count badhao.",
        "<code>HashMap&lt;String, Integer&gt;</code> mein count rakho.",
        "Best chunte waqt: count bada, ya count barabar aur <code>key.compareTo(best) &lt; 0</code>."
      ],
      solution: `import java.util.*;

class Solution {
    String predictNext(String[] words, String w) {
        Map<String, Integer> cnt = new HashMap<>();
        for (int i = 0; i + 1 < words.length; i++)
            if (words[i].equals(w)) cnt.merge(words[i + 1], 1, Integer::sum);
        String best = "";
        int bestC = 0;
        for (Map.Entry<String, Integer> e : cnt.entrySet()) {
            int c = e.getValue();
            if (c > bestC || (c == bestC && e.getKey().compareTo(best) < 0)) { best = e.getKey(); bestC = c; }
        }
        return best;
    }
}`,
      explain: `<p>Ye ek <b>bigram model</b> hai: agla word sirf pichhle ek word se. Counts ko total se divide karo to probabilities mil jaati hain, yaani ek chhota sa "next token predictor". LLM yahi kaam karta hai, par (1) pichhle hazaaron tokens dekh ke, (2) counting ki jagah arbon weights seekh ke, taaki jo combination kabhi dekha nahi uspe bhi achha guess kare. Karpathy ki "makemore" series bhi bigram se hi shuru hoti hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 2: supervised fine-tuning (SFT): assistant ki tarah baat karna</h2>
        <p><b>Problem:</b> base model jawab nahi deta, text aage badhata hai.</p>
        <p><b>Hal:</b> hazaaron se laakhon tak achhe <b>(instruction, ideal jawab)</b> examples, jo log likhte/check karte hain: "Is email ka summary do" → achha summary. Model ko inpe wahi next-token training thodi der aur karo. Ab model ne "sawaal aaye to madadgar jawab do" ka format seekh liya. Data pre-training se bahut chhota hota hai, par quality bahut zyada.</p>
        <h2>Stage 3: preference tuning (RLHF / DPO): kaunsa jawab behtar</h2>
        <p><b>Problem:</b> ek sawaal ke kai "sahi" jawab ho sakte hain: ek chhota aur saaf, ek lamba aur ghuma-phira ke, ek galat par confident. SFT ke examples har baarik cheez nahi sikha sakte. Aur "behtar kaunsa hai" batana insaan ke liye "perfect jawab likhna" se aasaan hai.</p>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th></tr>
          <tr><td><b>RLHF</b></td><td>Log do jawab compare karte hain (A behtar ya B). In comparisons se ek <b>reward model</b> train hota hai jo kisi jawab ko score deta hai. Phir LLM ko reinforcement learning (aksar PPO) se train karte hain taaki uske jawabon ka reward badhe.</td></tr>
          <tr><td><b>DPO</b> (2023)</td><td>Alag reward model aur RL ke bina, seedha preference pairs (chosen vs rejected) pe ek simple loss se model update. Kam moving parts, isliye kaafi popular.</td></tr>
        </table>
        <p>OpenAI ke InstructGPT paper (2022) mein labelers ne 1.3B parameter wale RLHF model ke jawabon ko 175B wale GPT-3 base model se zyada pasand kiya. Matlab alignment stage ka asar model size se bhi bada ho sakta hai.</p>`
    },
    {
      type: "flow",
      title: "LLM banane ki pipeline",
      nodes: [
        { id: "data", label: "Web, books, code\n(trillions tokens)", icon: "🌐", x: 100, y: 90, kind: "data", w: 180 },
        { id: "pre", label: "Pre-training\n(next token)", icon: "🏋️", x: 330, y: 90, kind: "service", w: 170 },
        { id: "base", label: "Base model", icon: "🧠", x: 560, y: 90, kind: "data", w: 150 },
        { id: "sft", label: "SFT\n(instruction → jawab)", icon: "📝", x: 820, y: 90, kind: "service", w: 190 },
        { id: "pref", label: "RLHF / DPO\n(A vs B preference)", icon: "⚖️", x: 820, y: 270, kind: "service", w: 200 },
        { id: "chat", label: "Chat model\n+ evals → deploy", icon: "💬", x: 520, y: 270, kind: "client", w: 180 }
      ],
      edges: [
        { from: "data", to: "pre" },
        { from: "pre", to: "base" },
        { from: "base", to: "sft" },
        { from: "sft", to: "pref" },
        { from: "pref", to: "chat" }
      ],
      steps: [
        { title: "Pre-training: sabse mehenga", html: "<p>Trillions tokens pe next-token prediction. Zyaadatar compute yahin lagta hai. Nateeja: base model.</p>", path: ["data", "pre", "base"], active: ["pre"] },
        { title: "SFT: format seekho", html: "<p>Achhe instruction-response examples pe thodi training: model assistant jaisa jawab dene lagta hai.</p>", path: ["base", "sft"], active: ["sft"] },
        { title: "Preference: behtar jawab", html: "<p>Logon ki A-vs-B pasand se: zyada madadgar, kam harmful, 'pata nahi' bolna.</p>", path: ["sft", "pref"], active: ["pref"] },
        { title: "Evals ke baad release", html: "<p>Benchmarks, safety tests, red-teaming; phir API/app.</p>", path: ["pref", "chat"], active: ["chat"] }
      ]
    },
    {
      type: "order",
      id: "order-llm-stages",
      q: "LLM banne ke steps sahi order mein lagao.",
      items: [
        "Data collect + clean + dedupe",
        "Tokenizer train (BPE)",
        "Pre-training (next-token prediction) → base model",
        "Supervised fine-tuning (instruction → jawab)",
        "Preference tuning (RLHF / DPO)",
        "Evals + safety testing → release"
      ],
      why: "Tokenizer pehle chahiye kyunki training data tokens mein hi jaata hai. Base model ke baad SFT format sikhata hai, aur preference tuning quality/safety ko sudharta hai."
    },
    {
      type: "quiz",
      q: "Company apne internal docs pe \"fine-tune\" karke model ko naye product ki saari details sikhana chahti hai. Docs har hafte badalte hain. Sabse badi dikkat?",
      options: ["Fine-tuning hamesha naye facts reliably sikha deta hai", "Har update pe dobara training, purani info ka mix, aur model phir bhi galat details bana sakta hai; badalte facts ke liye RAG behtar", "Fine-tuning bilkul possible nahi", "Docs Hindi mein hon to hi dikkat"],
      answer: 1,
      why: "Fine-tuning behaviour/format/style sikhane mein achha hai. Badalte hue facts ke liye har baar training, aur model ko yaad karwaya fact bhi kabhi galat nikal sakta hai. RAG mein docs runtime pe diye jaate hain aur source dikhaya ja sakta hai (rag-vs-ft lesson)."
    },
    {
      type: "think",
      id: "think-base-vs-chat",
      q: "Base model aur chat (instruct) model mein farak 3-4 lines mein samjhao. Base model ka koi use case bhi batao.",
      rubric: [
        { point: "Base: sirf text continue karta hai (pre-training ke baad)", keys: ["continue", "aage badh", "base", "completion", "pre-train"], weight: 2 },
        { point: "Chat: SFT + preference tuning, instructions follow karta hai", keys: ["sft", "instruction", "rlhf", "dpo", "fine-tun", "preference"], weight: 2 },
        { point: "Base ka use: apna fine-tune shuru karne ke liye, ya few-shot completion / data generation", keys: ["apna fine", "own fine", "starting point", "custom", "few-shot", "completion", "research"], weight: 1 }
      ],
      answer: `<p><b>Base model</b> pre-training ke baad ka model hai: bahut gyaan, par kaam sirf text continue karna. <b>Chat model</b> pe SFT (instruction → achha jawab) aur preference tuning (RLHF/DPO) hui hai, isliye wo sawaal ka jawab deta hai, format follow karta hai, aur harmful requests mana karta hai. Base model kaam aata hai jab aap apna domain-specific fine-tune shuru se karna chahte ho (chat style ki aadat ke bina), ya research/autocomplete jaise tasks mein.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Teen stages teen problems: pre-training = "zabaan aur gyaan" (self-supervised, sabse mehenga), SFT = "assistant ka format", RLHF/DPO = "kaunsa jawab behtar". Har stage ka data type bolo (raw text, instruction pairs, preference pairs).`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch), Ch. 5-7 (pretraining, fine-tuning)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "Training language models to follow instructions with human feedback (InstructGPT)", by: "Ouyang et al., 2022", url: "https://arxiv.org/abs/2203.02155", type: "article" },
    { title: "Training Compute-Optimal Large Language Models (Chinchilla)", by: "Hoffmann et al., 2022", url: "https://arxiv.org/abs/2203.15556", type: "article" },
    { title: "Direct Preference Optimization", by: "Rafailov et al., 2023", url: "https://arxiv.org/abs/2305.18290", type: "article" }
  ]
});
