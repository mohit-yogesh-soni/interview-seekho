// RAG (Retrieval Augmented Generation)
registerLesson("ai", "rag", {
  why: `Model ko aapki company ki HR policy, kal ka price list, ya customer ka order history nahi pata. RAG ka idea simple hai: sawaal aaya to pehle sahi documents dhoondho, unhe prompt mein do, phir model se jawab likhwao. Aaj ke zyaadatar "company chatbot" isi pe chalte hain, aur interviews mein ye sabse common AI design topic hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem, aur pehle simple options</h2>
        <p>Employee poochta hai: "Maternity leave kitne din ki hai aur kya WFH extend ho sakta hai?" Jawab 300 page ki HR policy mein hai.</p>
        <table>
          <tr><th>Option</th><th>Kya hota hai</th><th>Kami</th></tr>
          <tr><td>Model se seedha poochho</td><td>Model internet ka general answer ya guess deta hai</td><td>Aapki policy nahi pata: hallucination</td></tr>
          <tr><td>Poori 300 page policy har baar prompt mein</td><td>Sahi info prompt mein hai</td><td>Lakhs tokens: mehenga, slow, context window se bahar, aur beech ki info miss ho sakti hai</td></tr>
          <tr><td>Fine-tune policy pe</td><td>Model ko "yaad" karwao</td><td>Har policy change pe training; source nahi dikha sakte; facts reliably yaad nahi rehte</td></tr>
          <tr><td><b>RAG</b> ⭐</td><td>Sirf relevant 3-5 paragraphs dhoondh ke prompt mein</td><td>Retrieval galat to jawab galat (isliye retrieval ki quality sabse zaroori)</td></tr>
        </table>
        <p>Naam 2020 ke ek Facebook AI paper (Lewis et al.) se aaya: <b>R</b>etrieval (dhoondho) → <b>A</b>ugmented (prompt mein jodo) → <b>G</b>eneration (jawab likho).</p>`
    },
    {
      type: "text",
      html: `
        <h2>Do pipelines: pehle se taiyari (ingestion), aur har sawaal pe (query)</h2>
        <h3>Ingestion (offline, docs badalne pe)</h3>
        <ol>
          <li><b>Load + clean:</b> PDFs, Confluence, Google Docs se text; headers/footers hatao.</li>
          <li><b>Chunking:</b> document ko chhote tukdon mein todo (jaise 300-800 tokens). Kyun? Poora document ek vector mein = matlab dhundhla; aur prompt mein sirf relevant tukda chahiye. Bahut chhota chunk = context toot jaata hai ("ye" kis cheez ka?). Isliye thoda <b>overlap</b> (jaise 10-20%) rakho, aur jahan ho sake headings/paragraphs pe todo.</li>
          <li><b>Embed:</b> har chunk ka embedding vector.</li>
          <li><b>Store:</b> vector + chunk text + metadata (document, section, date, kaun dekh sakta hai) ek <b>vector store</b> mein.</li>
        </ol>
        <h3>Query (har sawaal pe)</h3>
        <ol>
          <li>Sawaal ka embedding (same model).</li>
          <li><b>Retrieve:</b> sabse similar top-k chunks (aur user ke permissions se filter).</li>
          <li><b>Augment:</b> prompt: "Neeche diye context se hi jawab do, source batao, na mile to bolo pata nahi" + chunks + sawaal.</li>
          <li><b>Generate:</b> model jawab + citations.</li>
        </ol>`
    },
    {
      type: "flow",
      title: "RAG: ingestion aur query",
      nodes: [
        { id: "docs", label: "HR docs, wiki", icon: "📚", x: 90, y: 70, kind: "data", w: 150 },
        { id: "chunk", label: "Chunk + embed", icon: "✂️", x: 300, y: 70, kind: "service", w: 160 },
        { id: "vs", label: "Vector store\n(vector + text + ACL)", icon: "🗃️", x: 560, y: 70, kind: "data", w: 200 },
        { id: "u", label: "Employee sawaal", icon: "🙋", x: 90, y: 280, kind: "client", w: 160 },
        { id: "ret", label: "Retriever\n(top-k + filter)", icon: "🔎", x: 330, y: 280, kind: "service", w: 170 },
        { id: "llm", label: "LLM\ncontext + sawaal", icon: "🧠", x: 600, y: 280, kind: "service", w: 170 },
        { id: "ans", label: "Jawab + sources", icon: "💬", x: 870, y: 280, kind: "client", w: 160 }
      ],
      edges: [
        { from: "docs", to: "chunk" },
        { from: "chunk", to: "vs" },
        { from: "u", to: "ret" },
        { from: "ret", to: "vs", both: true },
        { from: "ret", to: "llm" },
        { from: "llm", to: "ans" }
      ],
      steps: [
        { title: "Ingestion (offline)", html: "<p>Docs ke tukde, har tukde ka vector, metadata ke saath store.</p>", path: ["docs", "chunk", "vs"], active: ["vs"] },
        { title: "Retrieve", html: "<p>Sawaal ka vector, top-5 similar chunks, sirf wo jo is employee ko dikh sakte hain.</p>", path: ["u", "ret", "vs", "ret"], active: ["ret"] },
        { title: "Augment + generate", html: "<p>Chunks prompt mein. Model unhi se jawab likhta hai aur section ka naam batata hai.</p>", path: ["ret", "llm", "ans"], active: ["llm", "ans"] }
      ]
    },
    {
      type: "exercise",
      id: "ex-chunk",
      title: "Overlap ke saath chunking",
      level: "Easy",
      task: `<p><code>chunk(words, size, overlap)</code>: words ko <code>size</code> words ke chunks mein todo, har agla chunk pichhle se <code>overlap</code> words share kare (step = <code>size − overlap</code>). Har chunk words ko ek space se jodta hai. Jaise hi koi chunk last word tak pahunche, ruk jao (aakhri chunk chhota ho sakta hai). Khaali input → khaali list. Maan lo <code>0 ≤ overlap &lt; size</code>.</p>`,
      examples: "<code>words = a b c d e f g, size 3, overlap 1</code> → <code>[\"a b c\", \"c d e\", \"e f g\"]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<String> chunk(String[] words, int size, int overlap) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static String[] W(String s) { return s.isEmpty() ? new String[0] : s.split(" "); }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("size 3, overlap 1", List.of("a b c", "c d e", "e f g"), () -> s.chunk(W("a b c d e f g"), 3, 1));
        Check.eq("overlap 0", List.of("a b", "c d", "e"), () -> s.chunk(W("a b c d e"), 2, 0));
        Check.hiddenFromHere();
        Check.eq("khaali", List.of(), () -> s.chunk(W(""), 3, 1));
        Check.eq("size se chhota doc", List.of("a b"), () -> s.chunk(W("a b"), 5, 2));
        Check.eq("aakhri chunk chhota", List.of("a b c d", "c d e f", "e f g"), () -> s.chunk(W("a b c d e f g"), 4, 2));
        Check.eq("exact fit, extra chunk nahi", List.of("a b c", "c d e"), () -> s.chunk(W("a b c d e"), 3, 1));
        String[] big = new String[100000];
        Arrays.fill(big, "w");
        Check.eq("bada doc: chunk count", 999, () -> s.chunk(big, 200, 100).size());
    }
}`,
      hints: [
        "<code>step = size - overlap</code>. Start index <code>i = 0, step, 2·step, ...</code>",
        "Har start pe <code>end = min(i + size, n)</code>; <code>String.join(\" \", Arrays.copyOfRange(words, i, end))</code>.",
        "<code>if (end == n) break;</code> warna aakhri words ka ek aur chhota duplicate chunk ban jaayega."
      ],
      solution: `import java.util.*;

class Solution {
    List<String> chunk(String[] words, int size, int overlap) {
        List<String> out = new ArrayList<>();
        int n = words.length, step = size - overlap;
        for (int i = 0; i < n; i += step) {
            int end = Math.min(i + size, n);
            out.add(String.join(" ", Arrays.copyOfRange(words, i, end)));
            if (end == n) break;
        }
        return out;
    }
}`,
      explain: `<p>Overlap isliye ki koi important sentence do chunks ki boundary pe kat jaaye to bhi ek chunk mein poora mile. Kimat: zyada chunks = zyada embeddings aur storage (overlap 50%, jaise size 200 aur overlap 100, to ~2× chunks; example jaisa 1/3 overlap ~1.5×). Real systems words ki jagah tokens ginte hain aur headings/paragraphs pe todna prefer karte hain.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Vector store: crores vectors mein tez search</h2>
        <p>Embeddings lesson mein brute force tha: har query pe har vector se cosine. 1 crore chunks × 1,536 dimensions = har query pe ~1,500 crore multiplications. Isliye <b>ANN</b> (approximate nearest neighbour) index:</p>
        <table>
          <tr><th>Index</th><th>Idea</th></tr>
          <tr><td><b>HNSW</b></td><td>Vectors ka ek multi-layer graph: upar ki layers mein lambi chhalaangein, neeche paas ke padosi. Search graph pe chalke nearest tak pahunchta hai. Bahut tez, memory zyada.</td></tr>
          <tr><td>IVF</td><td>Vectors ko clusters mein baanto; query ke paas wale kuch clusters hi dekho</td></tr>
        </table>
        <p>"Approximate" = kabhi kabhi asli top-1 miss ho sakta hai; badle mein milliseconds. Options: <b>pgvector</b> (Postgres extension: HNSW aur IVFFlat; pehle se Postgres hai to naya system nahi), managed vector DBs (Pinecone etc.), OpenSearch/Elasticsearch ka vector search. Chhote data (lakh chunks tak) pe pgvector aksar kaafi hai.</p>
        <h2>Quality kaise badhaayein (sabse zyada kaam yahin)</h2>
        <table>
          <tr><th>Problem</th><th>Fix</th></tr>
          <tr><td>Exact terms (policy number, product code) miss</td><td><b>Hybrid search</b>: vector + keyword (BM25), results merge</td></tr>
          <tr><td>Top-k mein relevant, par galat order</td><td><b>Reranker</b>: top-50 lo, ek cross-encoder model har (sawaal, chunk) pair ko score kare, top-5 rakho</td></tr>
          <tr><td>Sawaal vague ya chat follow-up ("aur uske liye?")</td><td>Query rewriting: pichhli chat se poora sawaal banao, phir search</td></tr>
          <tr><td>Purane documents ke jawab</td><td>Metadata filter (date, version), purane chunks delete/re-index</td></tr>
          <tr><td>Galat employee ko confidential doc</td><td>Permission (ACL) filter <b>retrieval mein</b>, prompt mein nahi</td></tr>
        </table>`
    },
    {
      type: "pick",
      id: "pick-rag-bugs",
      q: "RAG bot galat jawab de raha hai. Pehle kya check karoge? (Sahi debugging steps chuno.)",
      options: [
        { text: "Us sawaal ke liye retrieve hue chunks dekho: kya sahi paragraph unme hai?", correct: true, why: "Retrieval galat = generation ke paas sahi info hi nahi. Sabse common wajah." },
        { text: "Sahi chunk hai par jawab galat: prompt/model check karo (context use ho raha hai?)", correct: true, why: "Retrieval aur generation ko alag alag debug karo." },
        { text: "Seedha bada model le aao", correct: false, why: "Agar sahi chunk retrieve hi nahi hua to bada model bhi guess karega." },
        { text: "Chunking dekho: kya jawab do chunks mein toot gaya?", correct: true, why: "Overlap/size/structure-aware chunking." },
        { text: "Temperature 1 karo", correct: false, why: "Facts ke liye ulta asar." }
      ],
      answer: "RAG debug ka rule: pehle retrieval (sahi chunks aaye?), phir generation (unka sahi use hua?). Dono ke alag metrics rakho (evals lesson)."
    },
    {
      type: "think",
      id: "think-rag-acl",
      q: "Company wiki pe RAG bot bana. Kuch pages sirf HR/Finance dekh sakte hain. Kaise ensure karoge ki engineer ko salary band wala page jawab mein na mile? Prompt mein \"confidential mat batana\" kyun kaafi nahi?",
      rubric: [
        { point: "ACL/permissions metadata har chunk pe, ingestion ke waqt", keys: ["acl", "permission", "metadata", "group", "role", "access"], weight: 2 },
        { point: "Retrieval query mein user ke permissions se filter (pehle hi)", keys: ["filter", "retriev", "pehle", "query time", "search time"], weight: 3 },
        { point: "Prompt instruction pe bharosa nahi: model trick/galti kar sakta hai, data context mein aaya to leak", keys: ["prompt", "injection", "trick", "galti", "leak", "bharosa"], weight: 2 },
        { point: "Permission changes sync / audit", keys: ["sync", "update", "audit", "log", "revoke"], weight: 1 }
      ],
      answer: `<p>Har chunk ke saath ingestion pe uska ACL (kaunse groups dekh sakte hain) store karo, aur <b>retrieval ke waqt</b> logged-in user ke groups se filter karo, taaki confidential chunk prompt tak <b>pahunche hi nahi</b>. Prompt instruction kaafi nahi, kyunki jo text context mein hai wo model jawab mein laa sakta hai (galti se ya prompt injection se). Saath mein: source system se permission changes sync karo (koi team chhode to access hate), aur kis user ko kaunse chunks gaye, uska audit log.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> RAG ko do pipelines (ingestion, query) mein draw karo. Phir khud bolo: "zyaadatar quality retrieval se aati hai: chunking, hybrid search, reranking, metadata filters; aur permissions retrieval mein enforce hote hain, prompt mein nahi."`
    }
  ],
  references: [
    { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", by: "Lewis et al., 2020", url: "https://arxiv.org/abs/2005.11401", type: "article" },
    { title: "Efficient and robust ANN search using HNSW graphs", by: "Malkov & Yashunin", url: "https://arxiv.org/abs/1603.09320", type: "article" },
    { title: "pgvector (GitHub)", by: "pgvector", url: "https://github.com/pgvector/pgvector", type: "docs" },
    { title: "Prompt Engineering Guide: RAG", by: "DAIR.AI", url: "https://www.promptingguide.ai/techniques/rag", type: "docs" }
  ]
});
