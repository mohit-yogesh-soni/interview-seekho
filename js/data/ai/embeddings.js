// Embeddings
registerLesson("ai", "embeddings", {
  why: `Token id sirf ek number hai: 512 aur 513 ka matlab paas paas hona zaroori nahi. Embeddings har token (ya poore sentence) ko aise numbers ki list mein badalte hain jahan <b>matlab mein paas = numbers mein paas</b>. Yahi LLM ke andar ka pehla step hai, aur RAG / semantic search ki neev bhi.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: ids mein matlab nahi hota</h2>
        <p>Tokenizer ne "chai" ko id 4821 diya aur "coffee" ko 9107. In numbers se model ko ye nahi pata chalta ki dono garam drinks hain. Aur ek user "sasta phone" search kare to document mein "budget smartphone" likha ho, keyword match zero.</p>
        <p><b>Idea:</b> har cheez ko ek <b>vector</b> (numbers ki list, jaise 768 numbers) do, aur training aisi karo ki milte-julte matlab wali cheezon ke vectors paas paas aayein. Is vector ko <b>embedding</b> kehte hain.</p>
        <h3>2D mein samjho (asli mein sainkdon dimensions)</h3>
        <table>
          <tr><th>Word</th><th>[garam?, khaana?]</th></tr>
          <tr><td>chai</td><td>[0.9, 0.1]</td></tr>
          <tr><td>coffee</td><td>[0.8, 0.1]</td></tr>
          <tr><td>samosa</td><td>[0.6, 0.9]</td></tr>
          <tr><td>ice cream</td><td>[0.0, 0.7]</td></tr>
        </table>
        <p>chai aur coffee ke vectors lagbhag ek hi disha mein hain. Asli embeddings mein har dimension ka koi saaf naam nahi hota (ye humne samjhane ke liye diya); model training ke dauraan khud decide karta hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>"Paas" kaise naapein: cosine similarity</h2>
        <p>Do vectors ke beech ka angle dekho. Ek disha = 1, perpendicular = 0, ulti disha = −1.</p>
        <pre class="code-static">cosine(a, b) = (a · b) / (|a| × |b|)
a · b = a1×b1 + a2×b2 + ...         (dot product)
|a|   = √(a1² + a2² + ...)          (length)

chai · coffee = 0.9×0.8 + 0.1×0.1 = 0.73
|chai| ≈ 0.906, |coffee| ≈ 0.806
cosine ≈ 0.73 / 0.730 ≈ 0.9999   → bahut similar</pre>
        <p><b>Length kyun divide karte hain?</b> Lamba document ka vector bada ho sakta hai, par matlab disha mein hai. Cosine sirf disha dekhta hai. Agar vectors pehle se length 1 pe normalize hon, to cosine = sirf dot product (isliye vector DBs aksar normalize karke dot product use karte hain, tez hai).</p>
        <h2>Embeddings kahan se aate hain</h2>
        <ul>
          <li><b>LLM ke andar:</b> pehli layer ek bada table hai: <code>vocabulary × dimension</code> (GPT-2 small: 50,257 × 768). Token id us table ki ek row choose karta hai. Ye table bhi training mein seekha jaata hai, baaki weights ki tarah.</li>
          <li><b>word2vec (2013):</b> shuru ka famous kaam jisme dikha ki vectors pe hisaab bhi kuch had tak matlab rakhta hai: <code>king − man + woman</code> ka vector <code>queen</code> ke paas aata hai.</li>
          <li><b>Sentence/document embedding models:</b> poore paragraph ka ek vector (jaise OpenAI ka text-embedding-3-small, default 1,536 dimensions). Search aur RAG mein yahi use hote hain.</li>
        </ul>`
    },
    {
      type: "flow",
      title: "Semantic search: text → embedding → sabse paas wale vectors",
      nodes: [
        { id: "docs", label: "Documents\n(FAQ, products)", icon: "📄", x: 100, y: 80, kind: "data", w: 170 },
        { id: "em", label: "Embedding model", icon: "🧮", x: 380, y: 170, kind: "service", w: 180 },
        { id: "vdb", label: "Vector store\n(id → vector)", icon: "🗃️", x: 680, y: 80, kind: "data", w: 180 },
        { id: "q", label: "User: \"sasta phone\"", icon: "🙋", x: 100, y: 270, kind: "client", w: 190 },
        { id: "res", label: "Top-k results", icon: "🏆", x: 680, y: 270, kind: "service", w: 170 }
      ],
      edges: [
        { from: "docs", to: "em" },
        { from: "em", to: "vdb" },
        { from: "q", to: "em" },
        { from: "em", to: "res", dashed: true },
        { from: "vdb", to: "res" }
      ],
      steps: [
        { title: "Pehle se: har document ka vector", html: "<p>Ek baar (offline) har document ka embedding banao aur store karo.</p>", path: ["docs", "em", "vdb"], active: ["vdb"] },
        { title: "Query ka vector", html: "<p>User ke sawaal ka bhi embedding, <b>same model</b> se (alag model = alag space, compare bekaar).</p>", path: ["q", "em", "res"], active: ["em"] },
        { title: "Cosine se top-k", html: "<p>\"budget smartphone\" wala document aata hai, chahe ek bhi word match na ho.</p>", path: ["vdb", "res"], active: ["res"] }
      ]
    },
    {
      type: "quiz",
      q: "Aapne documents ke embeddings model A se banaye, aur ab query ke embeddings sasta model B se banane lage. Kya hoga?",
      options: ["Kuch nahi, vectors vectors hain", "Results bekaar ho jaayenge, kyunki dono models ke vector spaces alag hain", "Sirf speed badlegi", "Dimensions same hon to theek chalega"],
      answer: 1,
      why: "Har model apna alag 'naksha' seekhta hai. Model A ka dimension 37 aur model B ka dimension 37 ka koi rishta nahi. Model badla to saare documents dobara embed karne padenge (re-indexing): production mein ye ek planned migration hota hai."
    },
    {
      type: "exercise",
      id: "ex-cosine",
      title: "Cosine similarity + top-k search",
      level: "Easy",
      task: `<p>Do methods:</p>
        <ol>
          <li><code>cosine(a, b)</code>: upar wala formula. Agar kisi vector ki length 0 ho to <code>0</code> return karo.</li>
          <li><code>topK(docs, q, k)</code>: har document ka query se cosine nikaalo, sabse zyada similarity wale <code>k</code> documents ke <b>indices</b> return karo (zyada se kam). Barabar similarity pe chhota index pehle. <code>k</code> documents se zyada ho to sab return karo.</li>
        </ol>`,
      examples: "<code>cosine([1,2],[2,4])</code> → <code>1.0</code><br><code>topK([[1,0],[0,1],[1,1]], [1,0.1], 2)</code> → <code>[0, 2]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    double cosine(double[] a, double[] b) {
        // yahan likho
        return -2;
    }

    int[] topK(double[][] docs, double[] q, int k) {
        // yahan likho
        return new int[0];
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("same disha", 1.0, () -> s.cosine(new double[]{1, 2}, new double[]{2, 4}));
        Check.eq("topK k=2", new int[]{0, 2}, () -> s.topK(new double[][]{{1, 0}, {0, 1}, {1, 1}}, new double[]{1, 0.1}, 2));
        Check.hiddenFromHere();
        Check.eq("perpendicular", 0.0, () -> s.cosine(new double[]{1, 0}, new double[]{0, 1}));
        Check.eq("ulti disha", -1.0, () -> s.cosine(new double[]{1, 0}, new double[]{-1, 0}));
        Check.eq("45 degree", Math.sqrt(0.5), () -> s.cosine(new double[]{1, 1}, new double[]{1, 0}));
        Check.eq("zero vector", 0.0, () -> s.cosine(new double[]{0, 0}, new double[]{1, 0}));
        Check.eq("tie: chhota index pehle", new int[]{0, 1}, () -> s.topK(new double[][]{{2, 0}, {1, 0}}, new double[]{1, 0}, 2));
        Check.eq("k > n", new int[]{1, 0}, () -> s.topK(new double[][]{{0, 1}, {1, 0}}, new double[]{1, 0}, 5));
        Check.eq("k = 0", new int[]{}, () -> s.topK(new double[][]{{1, 0}}, new double[]{1, 0}, 0));
        Check.eq("chai query", new int[]{1, 0}, () -> s.topK(new double[][]{{0.6, 0.9}, {0.8, 0.1}, {0.0, 0.7}}, new double[]{0.9, 0.1}, 2));
    }
}`,
      hints: [
        "Ek loop mein dot, |a|² aur |b|² teeno jodo.",
        "topK: har index ka score nikaalo, phir <code>Integer[]</code> indices ko sort karo: score desc, tie pe index asc.",
        "<code>Arrays.sort(idx, (x, y) -&gt; score[y] != score[x] ? Double.compare(score[y], score[x]) : Integer.compare(x, y));</code> phir pehle <code>min(k, n)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    double cosine(double[] a, double[] b) {
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    int[] topK(double[][] docs, double[] q, int k) {
        int n = docs.length;
        double[] score = new double[n];
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) { score[i] = cosine(docs[i], q); idx[i] = i; }
        Arrays.sort(idx, (x, y) -> score[y] != score[x] ? Double.compare(score[y], score[x]) : Integer.compare(x, y));
        int m = Math.min(k, n);
        int[] out = new int[m];
        for (int i = 0; i < m; i++) out[i] = idx[i];
        return out;
    }
}`,
      explain: `<p>Ye <b>brute-force</b> (exact) search hai: O(n × d) per query. Lakhs documents tak theek, crores pe slow. Isliye vector databases <b>ANN</b> (approximate nearest neighbour) indexes jaise HNSW use karte hain: thodi accuracy ke badle bahut tez search (RAG lesson). Sorting ki jagah size-k heap se O(n log k) bhi ho sakta hai.</p>`
    },
    {
      type: "think",
      id: "think-emb-vs-keyword",
      q: "E-commerce search mein sirf embedding (semantic) search lagaya. User ne model number \"SM-A156E\" search kiya aur galat phones aaye. Kyun? Kya karoge?",
      rubric: [
        { point: "Embeddings matlab pakadte hain, exact codes/IDs/rare strings achhe se nahi", keys: ["exact", "model number", "code", "rare", "id", "keyword", "matlab"], weight: 2 },
        { point: "Keyword search (BM25 / Elasticsearch) bhi chalao", keys: ["bm25", "keyword", "elasticsearch", "lexical", "full-text", "full text"], weight: 2 },
        { point: "Dono ko jodo: hybrid search (aur rerank)", keys: ["hybrid", "dono", "combine", "rerank", "fusion", "milao"], weight: 2 }
      ],
      answer: `<p>Embedding model "SM-A156E" jaise string ka matlab nahi samajhta; uske liye ye bas ajeeb characters hain, to vector kisi bhi "Samsung phone" ke paas aa jaata hai. Exact match ke liye <b>keyword search</b> (BM25, Elasticsearch/OpenSearch) behtar hai. Production mein aksar <b>hybrid search</b>: dono se results lo, phir milao (jaise reciprocal rank fusion) ya ek reranker model se order karo.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Embedding ki definition ke saath ye do baatein bolo: (1) query aur documents same model se embed hone chahiye, (2) exact strings (IDs, codes) ke liye keyword search saath mein rakho (hybrid). Dono practical experience dikhate hain.`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch), Ch. 2 (token embeddings)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "Efficient Estimation of Word Representations in Vector Space (word2vec)", by: "Mikolov et al., 2013", url: "https://arxiv.org/abs/1301.3781", type: "article" },
    { title: "OpenAI docs: Embeddings", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/embeddings", type: "docs" }
  ]
});
