// Tokens aur Tokenization
registerLesson("ai", "tokens", {
  why: `LLM text nahi, <b>tokens</b> padhta aur likhta hai. API ka bill, context window ki limit, aur "model ko 'strawberry' mein r ginne mein dikkat kyun hoti hai" jaisi cheezein sab tokens se samajh aati hain. Hum khud ek chhota tokenizer banayenge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: neural network sirf numbers samajhta hai</h2>
        <p>Model andar se matrix multiplication hai. Use "chai" nahi, numbers chahiye. To text ko pehle tukdon mein todo, har tukde ko ek id do. Ye tukde <b>tokens</b> hain, aur saare possible tokens ki list <b>vocabulary</b>.</p>
        <h3>Tukde kitne bade hon? Teen options</h3>
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>Har <b>character</b> ek token</td><td>Vocabulary chhoti (~100-200), koi bhi word likh sakte ho</td><td>Text bahut lamba ho jaata hai: "chaiwala" = 8 tokens. Model ko har cheez letters se jodni padti hai, aur context window jaldi bhar jaati hai.</td></tr>
          <tr><td>Har <b>word</b> ek token</td><td>Chhota sequence</td><td>Vocabulary lakhon mein; naya word ("Zepto", typo, "chaiwalaaa") vocabulary mein nahi = unknown</td></tr>
          <tr><td><b>Subword</b> (beech ka) ⭐</td><td>Common words poore ek token, rare words chhote common tukdon mein</td><td>Tokens insaan ke hisaab se ajeeb lag sakte hain</td></tr>
        </table>
        <p>Aaj ke LLMs subword use karte hain, aur sabse common tareeka <b>BPE</b> (Byte Pair Encoding) hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>BPE: jo jodi sabse zyada dikhe, use jod do</h2>
        <p>Idea itna simple hai:</p>
        <ol>
          <li>Shuru mein har character alag token.</li>
          <li>Poore training text mein gino: kaunsi <b>do tokens ki jodi</b> (adjacent pair) sabse zyada baar aati hai?</li>
          <li>Us jodi ko ek naya token bana do (merge), aur vocabulary mein daal do.</li>
          <li>Jab tak vocabulary size target tak na pahunche, repeat.</li>
        </ol>
        <p>Isse jo cheez baar baar aati hai (common words, "ing", " the") wo ek token ban jaati hai, aur rare cheezein tukdon mein rehti hain. Koi bhi naya word phir bhi likha ja sakta hai, kyunki characters (ya bytes) hamesha vocabulary mein hain.</p>`
    },
    {
      type: "steps",
      title: "BPE dry run: words \"chai\" (2 baar) aur \"chaat\" (1 baar)",
      steps: [
        { title: "Start: characters", html: "<p><code>c h a i</code> ×2, <code>c h a a t</code> ×1</p><p>Pairs gino: <b>c h: 3</b>, <b>h a: 3</b>, a i: 2, a a: 1, a t: 1. Tie hai, to jo pehle dikha: <code>c h</code>.</p>" },
        { title: "Merge 1: ch", html: "<p><code>ch a i</code> ×2, <code>ch a a t</code></p><p>Pairs: <b>ch a: 3</b>, a i: 2, a a: 1, a t: 1.</p>" },
        { title: "Merge 2: cha", html: "<p><code>cha i</code> ×2, <code>cha a t</code></p><p>Pairs: <b>cha i: 2</b>, cha a: 1, a t: 1.</p>" },
        { title: "Merge 3: chai", html: "<p><code>chai</code> ×2, <code>cha a t</code></p><p>Common word \"chai\" ab <b>ek token</b>. Rare \"chaat\" teen tokens: <code>cha</code> + <code>a</code> + <code>t</code>. Yahi BPE ka nateeja hai.</p>" }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Asli tokenizers ke baare mein kaam ki baatein</h2>
        <ul>
          <li><b>Vocabulary size:</b> GPT-2 ki vocabulary 50,257 tokens ki thi. Naye models ki aksar ~1 lakh ya zyada.</li>
          <li><b>Byte-level BPE:</b> GPT-2 ne characters ki jagah UTF-8 <b>bytes</b> se shuru kiya. 256 bytes se duniya ka koi bhi text (emoji, Hindi) likha ja sakta hai, "unknown token" kabhi nahi.</li>
          <li><b>Rule of thumb (English):</b> 1 token ≈ 4 characters ≈ ¾ word. 1,000 tokens ≈ 750 words.</li>
          <li><b>Hindi/Hinglish:</b> training data mein English zyada hota hai, to English ke merges zyada bante hain. Wahi baat Hindi mein aksar <b>zyada tokens</b> leti hai: zyada bill, context window jaldi bharti hai.</li>
          <li><b>Space bhi token ka hissa:</b> " chai" (space ke saath) aur "chai" alag tokens ho sakte hain.</li>
        </ul>
        <h3>Isse kya samajh aata hai</h3>
        <table>
          <tr><th>Observation</th><th>Token wajah</th></tr>
          <tr><td>API price "per million tokens" hai</td><td>Model ka kaam tokens ki ginti pe depend karta hai, words pe nahi</td></tr>
          <tr><td>Context window "128k tokens"</td><td>Limit tokens mein hai; Hindi document kam fit hoga</td></tr>
          <tr><td>"strawberry mein kitne r?" pe galti</td><td>Model ko <code>straw</code> + <code>berry</code> jaise tukde dikhte hain, letters nahi. Use letters ginne ke liye tokens ke andar jhaankna padta hai.</td></tr>
          <tr><td>Bade numbers ka hisaab kabhi galat</td><td>"123456" kai alag tukdon mein toot sakta hai, digit by digit nahi</td></tr>
        </table>`
    },
    {
      type: "quiz",
      q: "Ek app user ke Hindi messages LLM ko bhejti hai aur bill English app se kaafi zyada aa raha hai, jabki words utne hi hain. Sabse likely wajah?",
      options: ["Hindi pe API alag rate lagati hai", "Tokenizer ne Hindi ke liye kam merges seekhe, to wahi text zyada tokens mein toot-ta hai", "Hindi model slow hai", "Unicode characters free nahi hote"],
      answer: 1,
      why: "Billing tokens pe hai. BPE ke merges training data ki frequency se bante hain; English zyada tha, to English text kam tokens mein, Hindi zyada tokens mein. Fix: prompts chhote rakho, ya aisa model chuno jiska tokenizer Indian languages pe efficient ho."
    },
    {
      type: "exercise",
      id: "ex-bpe",
      title: "BPE ka ek step: sabse common jodi + merge",
      level: "Medium",
      task: `<p>Do methods likho:</p>
        <ol>
          <li><code>mostFrequentPair(tokens)</code>: adjacent pairs gino (har position <code>i, i+1</code>), sabse zyada wali pair <code>List.of(a, b)</code> return karo. Tie ho to wo pair jo sequence mein <b>pehle</b> dikhi. 2 se kam tokens hon to khaali list.</li>
          <li><code>merge(tokens, a, b)</code>: left se right chalo; jahan <code>a</code> ke turant baad <code>b</code> ho, dono ko ek token <code>a + b</code> se badlo aur dono ko skip karo (overlap nahi). Nayi list return karo.</li>
        </ol>`,
      examples: "<code>mostFrequentPair([c,h,a,i,c,h,a,a,t])</code> → <code>[c, h]</code> (ch: 2, ha: 2, ch pehle)<br><code>merge([c,h,a,i,c,h,a,a,t], \"c\", \"h\")</code> → <code>[ch, a, i, ch, a, a, t]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<String> mostFrequentPair(List<String> tokens) {
        // yahan likho
        return null;
    }

    List<String> merge(List<String> tokens, String a, String b) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<String> L(String s) { return Arrays.asList(s.split(" ")); }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("pair: c h a i c h a a t", List.of("c", "h"), () -> s.mostFrequentPair(L("c h a i c h a a t")));
        Check.eq("merge c+h", L("ch a i ch a a t"), () -> s.merge(L("c h a i c h a a t"), "c", "h"));
        Check.hiddenFromHere();
        Check.eq("ek token: khaali", List.of(), () -> s.mostFrequentPair(List.of("a")));
        Check.eq("khaali list", List.of(), () -> s.mostFrequentPair(new ArrayList<>()));
        Check.eq("a a a → (a,a)", List.of("a", "a"), () -> s.mostFrequentPair(L("a a a")));
        Check.eq("merge a a a → aa a (overlap nahi)", L("aa a"), () -> s.merge(L("a a a"), "a", "a"));
        Check.eq("x y z y z → (y,z)", List.of("y", "z"), () -> s.mostFrequentPair(L("x y z y z")));
        Check.eq("tie: pehle wali (p,q)", List.of("p", "q"), () -> s.mostFrequentPair(L("p q r s r s p q")));
        Check.eq("merge kuch match nahi", L("x y z"), () -> s.merge(L("x y z"), "z", "x"));
        List<String> big = new ArrayList<>();
        for (int i = 0; i < 100000; i++) big.add(i % 2 == 0 ? "a" : "b");
        big.add("c");
        Check.eq("bada input (1e5)", List.of("a", "b"), () -> s.mostFrequentPair(big));
        Check.eq("bada merge size", 50001, () -> s.merge(big, "a", "b").size());
    }
}`,
      hints: [
        "Pair ko ek key bana lo, jaise <code>a + \"\\u0000\" + b</code>, aur <code>HashMap</code> mein count rakho.",
        "Tie ke liye: <code>LinkedHashMap</code> insertion order yaad rakhta hai. Ya har pair ki pehli position bhi store karo.",
        "Merge: <code>while (i &lt; n)</code>; agar <code>i+1 &lt; n</code> aur match ho to <code>a+b</code> add karo aur <code>i += 2</code>, warna <code>tokens.get(i)</code> add karo aur <code>i++</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<String> mostFrequentPair(List<String> tokens) {
        Map<String, Integer> count = new LinkedHashMap<>(); // insertion order = pehli baar dikhne ka order
        Map<String, List<String>> pairOf = new HashMap<>();
        for (int i = 0; i + 1 < tokens.size(); i++) {
            String a = tokens.get(i), b = tokens.get(i + 1);
            String key = a + "\\u0000" + b;
            count.merge(key, 1, Integer::sum);
            pairOf.putIfAbsent(key, List.of(a, b));
        }
        String best = null;
        int bestCount = 0;
        for (Map.Entry<String, Integer> e : count.entrySet()) {
            if (e.getValue() > bestCount) { best = e.getKey(); bestCount = e.getValue(); } // strictly bada: tie pe pehla rehta hai
        }
        return best == null ? List.of() : pairOf.get(best);
    }

    List<String> merge(List<String> tokens, String a, String b) {
        List<String> out = new ArrayList<>();
        int i = 0, n = tokens.size();
        while (i < n) {
            if (i + 1 < n && tokens.get(i).equals(a) && tokens.get(i + 1).equals(b)) {
                out.add(a + b);
                i += 2;
            } else {
                out.add(tokens.get(i));
                i++;
            }
        }
        return out;
    }
}`,
      explain: `<p>Dono O(n). Asli BPE training yahi do step baar baar chalata hai (hazaaron merges), aur tokenization ke waqt seekhe hue merges usi order mein lagata hai. Production tokenizers (jaise OpenAI ka tiktoken) yahi kaam bahut fast native code mein karte hain.</p>`
    },
    {
      type: "think",
      id: "think-tokens-cost",
      q: "Aapki team ek support chatbot bana rahi hai. Har request mein 3,000 token ka system prompt + FAQ jaata hai, aur user ka sawaal ~50 tokens ka. Token ke hisaab se kharcha kaise kam karoge? 3 tareeke.",
      rubric: [
        { point: "Poora FAQ har baar mat bhejo: sirf relevant hissa (retrieval / RAG)", keys: ["rag", "retriev", "relevant", "sirf zaroori", "search", "embedding"], weight: 2 },
        { point: "System prompt chhota karo / repeat text hatao", keys: ["chhota", "short", "compress", "kam karo", "trim", "concise"], weight: 2 },
        { point: "Prompt caching (same prefix ka discount) ya response cache", keys: ["cach", "prefix"], weight: 2 },
        { point: "Sasta / chhota model simple sawaalon ke liye", keys: ["chhota model", "small model", "sasta model", "cheaper model", "routing", "mini"], weight: 1 }
      ],
      answer: `<ul><li><b>Retrieval:</b> poore FAQ ki jagah sirf 2-3 relevant hisse bhejo (RAG lesson). 3,000 → ~500 tokens.</li><li><b>Prompt chhota karo:</b> repeat instructions hatao; har token ka paisa lagta hai.</li><li><b>Prompt caching:</b> kai providers same prefix (system prompt) ko cache karke us hisse ka kam charge karte hain; isliye fixed hissa prompt ke shuru mein rakho.</li><li><b>Model routing:</b> simple sawaal chhote, saste model pe.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Tokenization kya hai" pe BPE ka idea 30 second mein bolo (sabse common pair merge karo, repeat), phir ek consequence do: billing, context window, ya letters ginne ki galti. Consequence bolne se depth dikhti hai.`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch), Ch. 2: Working with text data", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "LLMs-from-scratch code (Ch. 2: BPE tokenizer)", by: "Sebastian Raschka", url: "https://github.com/rasbt/LLMs-from-scratch", type: "docs" },
    { title: "Neural Machine Translation of Rare Words with Subword Units (BPE)", by: "Sennrich et al., 2016", url: "https://arxiv.org/abs/1508.07909", type: "article" },
    { title: "Let's build the GPT Tokenizer", by: "Andrej Karpathy (YouTube)", url: "https://www.youtube.com/@karpathy", type: "video" }
  ]
});
