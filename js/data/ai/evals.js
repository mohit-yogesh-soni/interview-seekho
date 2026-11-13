// Evaluation
registerLesson("ai", "evals", {
  why: `Normal code ke unit tests "2 + 2 = 4" check karte hain. LLM ka output har baar thoda alag hota hai, aur "achha jawab" ek range hai. Phir bhi prompt badalne, model upgrade karne, ya RAG tune karne se pehle pata hona chahiye ki cheez behtar hui ya bigdi. Evals wahi test suite hain. Bina evals ke har change andaaze pe hota hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: "mujhe to theek lag raha hai"</h2>
        <p>Aapne support bot ka prompt badla. 5 sawaal try kiye, sab achhe lage, ship kar diya. Agle din pata chala refund wale sawaalon pe bot ab galat policy bata raha hai. 5 manual tries ek test suite nahi hain.</p>
        <h2>Eval ke teen hisse</h2>
        <ol>
          <li><b>Dataset (golden set):</b> asli jaise inputs (100-500 se shuru), har ek ke saath expected output ya "achhe jawab" ke criteria. Asli user logs se lo, mushkil aur edge cases jaan-boojh ke daalo, aur har production bug ko ek naya test case banao.</li>
          <li><b>Grader:</b> output ko score kaise karein (neeche table).</li>
          <li><b>Report:</b> version A vs version B, overall aur category-wise (refund, delivery, payment...). Average achha hua par ek category giri, wo dikhna chahiye.</li>
        </ol>
        <h3>Grader ke tareeke: sabse saste se mehenge tak</h3>
        <table>
          <tr><th>Grader</th><th>Kab</th><th>Example</th></tr>
          <tr><td><b>Code checks</b></td><td>Output ka shape/answer fixed ho</td><td>Valid JSON? label allowed list mein? exact match? SQL chalti hai? test pass?</td></tr>
          <tr><td><b>Classification metrics</b></td><td>Labels wale tasks</td><td>Accuracy, precision, recall, F1 (neeche exercise)</td></tr>
          <tr><td><b>LLM-as-judge</b></td><td>Open-ended text (summary, support reply)</td><td>Ek model ek saaf rubric se score kare: "Kya jawab policy se match karta hai? (yes/no + reason)"</td></tr>
          <tr><td><b>Human review</b></td><td>Judge ko calibrate karna, high-risk outputs</td><td>Experts 50-100 samples score karein</td></tr>
          <tr><td>Production signals</td><td>Release ke baad</td><td>Thumbs up/down, escalation rate, "bot ke baad bhi human agent chahiye" rate</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>LLM-as-judge: kaam ka par dhyaan se</h2>
        <p>Research (Zheng et al., 2023, MT-Bench) mein strong models ka judgement human preferences se kaafi match hua, par biases bhi mile:</p>
        <table>
          <tr><th>Bias</th><th>Kya</th><th>Fix</th></tr>
          <tr><td>Position bias</td><td>Do jawab compare karne pe pehle (ya doosre) wale ko favour</td><td>Dono order mein judge karo; match na ho to tie</td></tr>
          <tr><td>Verbosity bias</td><td>Lamba jawab "behtar" lagta hai</td><td>Rubric mein "concise" criteria; length ka control</td></tr>
          <tr><td>Self-preference</td><td>Apne jaise model ke jawab ko favour</td><td>Alag model family ka judge, ya human spot-check</td></tr>
        </table>
        <p><b>Achhe judge prompt:</b> 1-10 ki vague rating ki jagah specific yes/no sawaal ("Kya jawab mein koi claim hai jo context mein nahi?"), reason pehle phir verdict, aur judge ko khud kuch human-labelled examples pe check karo ki wo insaan se kitna agree karta hai.</p>
        <h2>RAG ke liye do alag scores</h2>
        <table>
          <tr><th>Hissa</th><th>Metric</th><th>Sawaal</th></tr>
          <tr><td>Retrieval</td><td>Recall@k / hit rate</td><td>Sahi chunk top-k mein aaya?</td></tr>
          <tr><td>Generation</td><td>Faithfulness, answer correctness</td><td>Jawab context se support hota hai? sawaal ka sahi jawab hai?</td></tr>
        </table>
        <p>Alag scores se pata chalta hai galti kahan hai: retrieval ya model.</p>`
    },
    {
      type: "exercise",
      id: "ex-prf",
      title: "Precision, recall, F1 ek label ke liye",
      level: "Easy",
      task: `<p>Ticket classifier ke outputs aur sahi labels hain. <code>prf(gold, pred, label)</code> return kare <code>new double[]{precision, recall, f1}</code> us <code>label</code> ke liye:</p>
        <ul>
          <li>TP = jahan pred == label aur gold == label; FP = pred == label par gold alag; FN = gold == label par pred alag.</li>
          <li>precision = TP / (TP + FP), recall = TP / (TP + FN), f1 = 2PR / (P + R).</li>
          <li>Kisi bhi division ka denominator 0 ho to us value ko 0 maano.</li>
        </ul>`,
      examples: "<code>gold = [refund, refund, billing, refund]</code>, <code>pred = [refund, billing, refund, refund]</code>, label <code>refund</code> → TP 2, FP 1, FN 1 → <code>[0.667, 0.667, 0.667]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    double[] prf(List<String> gold, List<String> pred, String label) {
        // yahan likho
        return new double[]{-1, -1, -1};
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static List<String> L(String s) { return Arrays.asList(s.split(" ")); }

    public static void main(String[] args) {
        Solution s = new Solution();
        double t = 2.0 / 3;
        Check.eq("refund", new double[]{t, t, t}, () -> s.prf(L("refund refund billing refund"), L("refund billing refund refund"), "refund"));
        Check.eq("perfect", new double[]{1, 1, 1}, () -> s.prf(L("a b a"), L("a b a"), "a"));
        Check.hiddenFromHere();
        Check.eq("label kabhi predict nahi hua", new double[]{0, 0, 0}, () -> s.prf(L("a a b"), L("b b b"), "a"));
        Check.eq("label data mein hai hi nahi", new double[]{0, 0, 0}, () -> s.prf(L("a b"), L("a b"), "c"));
        Check.eq("high precision, low recall", new double[]{1.0, 0.25, 0.4}, () -> s.prf(L("x x x x y"), L("x y y y y"), "x"));
        Check.eq("low precision, high recall", new double[]{0.25, 1.0, 0.4}, () -> s.prf(L("x y y y y"), L("x x x x y"), "x"));
    }
}`,
      hints: [
        "Ek loop: har i pe <code>boolean g = gold.get(i).equals(label), p = pred.get(i).equals(label)</code>.",
        "<code>if (g &amp;&amp; p) tp++; else if (p) fp++; else if (g) fn++;</code>",
        "Har division se pehle denominator check karo."
      ],
      solution: `import java.util.*;

class Solution {
    double[] prf(List<String> gold, List<String> pred, String label) {
        int tp = 0, fp = 0, fn = 0;
        for (int i = 0; i < gold.size(); i++) {
            boolean g = gold.get(i).equals(label), p = pred.get(i).equals(label);
            if (g && p) tp++;
            else if (p) fp++;
            else if (g) fn++;
        }
        double prec = tp + fp == 0 ? 0 : (double) tp / (tp + fp);
        double rec = tp + fn == 0 ? 0 : (double) tp / (tp + fn);
        double f1 = prec + rec == 0 ? 0 : 2 * prec * rec / (prec + rec);
        return new double[]{prec, rec, f1};
    }
}`,
      explain: `<p>Accuracy akela dhokha deta hai jab labels imbalanced hon (95% tickets "general" hon to "hamesha general" bolne wala model 95% accurate). Precision = "jo bola, usme kitna sahi"; recall = "jo hona chahiye tha, usme se kitna pakda". Fraud jaise cases mein recall zyada zaroori, auto-refund jaise cases mein precision. Per-label report se ek category ki giravat chhupti nahi.</p>`
    },
    {
      type: "flow",
      title: "Evals ko CI ki tarah chalao",
      nodes: [
        { id: "chg", label: "Prompt / model\nchange", icon: "✏️", x: 100, y: 170, kind: "client", w: 160 },
        { id: "set", label: "Golden set\n(300 cases)", icon: "📋", x: 600, y: 50, kind: "data", w: 160 },
        { id: "run", label: "Run + graders\n(code, judge)", icon: "🧪", x: 330, y: 270, kind: "service", w: 170 },
        { id: "rep", label: "Report: A vs B\nper category", icon: "📊", x: 600, y: 170, kind: "service", w: 180 },
        { id: "ship", label: "Ship", icon: "🚀", x: 860, y: 70, kind: "client", w: 120 },
        { id: "prod", label: "Prod logs +\nfeedback", icon: "📈", x: 860, y: 270, kind: "data", w: 160 }
      ],
      edges: [
        { from: "chg", to: "run" },
        { from: "set", to: "run" },
        { from: "run", to: "rep" },
        { from: "rep", to: "ship" },
        { from: "ship", to: "prod" },
        { from: "prod", to: "set", dashed: true }
      ],
      steps: [
        { title: "Change → eval run", html: "<p>Har prompt/model change pe poora golden set chalao.</p>", paths: [["chg", "run"], ["set", "run"]], active: ["run"] },
        { title: "Compare", html: "<p>Overall +3%, par 'refund' category −12%: ship mat karo, pehle fix.</p>", path: ["run", "rep"], active: ["rep"], color: "#e8590c" },
        { title: "Ship → naye failures wapas dataset mein", html: "<p>Production ke bure jawab naye test cases bante hain. Dataset time ke saath behtar hota hai.</p>", path: ["rep", "ship", "prod", "set"], active: ["set"] }
      ]
    },
    {
      type: "think",
      id: "think-eval-plan",
      q: "Aap ek \"meeting notes → action items (owner, deadline)\" feature bana rahe ho. Iska eval plan batao: dataset kahan se, kya measure karoge, kaise grade karoge.",
      rubric: [
        { point: "Dataset: asli (anonymized) meeting transcripts + human-labelled action items, edge cases", keys: ["dataset", "golden", "real", "asli", "transcript", "label", "edge"], weight: 2 },
        { point: "Structure checks code se: JSON valid, owner/deadline fields", keys: ["json", "schema", "field", "code check", "format"], weight: 2 },
        { point: "Recall (koi action item miss to nahi) aur precision (nakli items to nahi)", keys: ["recall", "precision", "miss", "extra", "f1"], weight: 2 },
        { point: "Owner/deadline sahi? LLM-judge ya matching, human calibration", keys: ["judge", "human", "owner", "deadline", "calibrat", "match"], weight: 1 },
        { point: "Version compare + production feedback", keys: ["compare", "version", "feedback", "regression", "a/b"], weight: 1 }
      ],
      answer: `<ul><li><b>Dataset:</b> 100-200 asli meetings (permission + anonymize), har ek ke action items insaan ne likhe; lambi meetings, Hinglish, "koi owner nahi" jaise edge cases.</li><li><b>Code checks:</b> JSON valid, har item mein owner/deadline field, deadline valid date.</li><li><b>Item matching:</b> predicted items ko gold items se match karo (LLM-judge: "kya ye dono same task hain?"), phir <b>recall</b> (miss hue items, sabse bura) aur <b>precision</b> (nakli items).</li><li><b>Field accuracy:</b> matched items mein owner aur deadline sahi?</li><li>Judge ko 50 human-graded samples pe calibrate karo; har change pe version A vs B; production mein "user ne item edit/delete kiya" rate track karo.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Kisi bhi LLM feature design mein khud bolo: "Main pehle ek golden set aur graders banaunga; har prompt/model change CI ki tarah eval se guzrega; production failures dataset mein wapas jaayenge." Ye ek line aapko "demo banane wale" se "production chalane wale" engineer mein le jaati hai.`
    }
  ],
  references: [
    { title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", by: "Zheng et al., 2023", url: "https://arxiv.org/abs/2306.05685", type: "article" },
    { title: "OpenAI docs: Evaluation best practices", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices", type: "docs" },
    { title: "Anthropic docs: Define success criteria and build evaluations", by: "Anthropic", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests", type: "docs" }
  ]
});
