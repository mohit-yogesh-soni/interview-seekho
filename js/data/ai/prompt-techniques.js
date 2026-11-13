// Prompting techniques
registerLesson("ai", "prompt-techniques", {
  why: `Kuch prompting tareeke baar baar kaam aate hain: examples dena (few-shot), sochne ki jagah dena (step by step), output ka shape fix karna (JSON), aur system prompt. Har ek kisi khaas problem ka hal hai. Kab kaunsa, ye samajh lo to naye task pe khud chun loge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>1. Zero-shot vs few-shot</h2>
        <p><b>Problem:</b> aapko customer reviews ko <code>positive / negative / mixed</code> mein baantna hai. Zero-shot (sirf instruction) mein model kabhi "Neutral" likh deta hai, kabhi "Mostly positive", aur "khaana achha tha par delivery late" ko kabhi positive bolta hai kabhi mixed.</p>
        <p><b>Few-shot:</b> prompt mein 2-5 solved examples do. Model format aur aapki "boundary" (mixed kab) dono examples se seekh leta hai, bina training ke. Isse <b>in-context learning</b> kehte hain; GPT-3 paper ("Language Models are Few-Shot Learners", 2020) ne isi ko popular kiya.</p>
        <pre class="code-static">Review: "Biryani mast thi, time pe aayi" → positive
Review: "Thanda khaana, 1 ghanta late" → negative
Review: "Taste badhiya, par packing leak ho gayi" → mixed
Review: "{naya review}" →</pre>
        <table>
          <tr><th>Dhyaan</th><th>Kyun</th></tr>
          <tr><td>Examples mein har label ho, aur thode alag style ke</td><td>Model examples ki style aur label distribution copy karta hai</td></tr>
          <tr><td>Mushkil/edge case ka example do</td><td>Aasaan cases model khud kar leta hai; boundary pe hi confusion hota hai</td></tr>
          <tr><td>Bahut zyada examples = zyada tokens</td><td>Har request ka kharcha; 3-5 aksar kaafi</td></tr>
        </table>`
    },
    {
      type: "text",
      html: `
        <h2>2. Step by step (chain of thought)</h2>
        <p><b>Problem:</b> "Ravi ke paas ₹500 the. Usne 3 samose ₹15 ke aur 2 chai ₹12 ki li, phir dost ne ₹50 lautaye. Kitne bache?" Seedha jawab maango to model kabhi galat number bol deta hai.</p>
        <p><b>Kyun:</b> model har token ek fixed amount ka "compute" lagake banata hai. Seedha final number maangna = poora hisaab ek token mein. "Pehle steps likho, phir jawab" bolne se model beech ke steps <b>tokens mein likhta hai</b>, aur har agla step pichhle likhe hue pe based hota hai. Ye 2022 ke "Chain-of-Thought prompting" paper (Wei et al.) mein dikhaya gaya tha.</p>
        <ul>
          <li>Kimat: zyada output tokens = zyada time aur paisa.</li>
          <li>App mein user ko steps nahi dikhane to: steps ek <code>&lt;thinking&gt;</code> tag mein, final jawab <code>&lt;answer&gt;</code> mein, aur code sirf answer nikaale.</li>
          <li>Naye "reasoning models" ye andar hi karte hain (training se). Unpe "step by step socho" ki zaroorat kam hoti hai; unhe saaf goal aur constraints do.</li>
          <li>Asli hisaab (₹, GST) ke liye best: model se calculator/code tool call karwao.</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <h2>3. Structured output (JSON)</h2>
        <p><b>Problem:</b> aapka code model ka output parse karta hai. Model kabhi "Sure! Here is the JSON:" likh deta hai, kabhi trailing comma, kabhi field ka naam badal deta hai. Parser toot-ta hai.</p>
        <table>
          <tr><th>Level</th><th>Tareeka</th><th>Guarantee</th></tr>
          <tr><td>1</td><td>Prompt mein schema + example; "sirf JSON, koi aur text nahi"</td><td>Zyaadatar theek, par kabhi kabhi toot-ta hai</td></tr>
          <tr><td>2</td><td>Provider ka JSON mode / structured outputs (schema dena) ya tool calling</td><td>Schema ke hisaab se valid JSON (provider guarantee karta hai, docs dekho)</td></tr>
          <tr><td>3 (hamesha)</td><td>Code mein validate: required fields, allowed values; fail ho to retry ya fallback</td><td>Aapki apni guarantee</td></tr>
        </table>
        <p>Valid JSON ka matlab sahi values nahi hai: <code>"sentiment": "positive"</code> galat review pe bhi valid JSON hai. Isliye evals alag se.</p>
        <h2>4. System prompt</h2>
        <p>Chat APIs mein ek <b>system</b> message hota hai (role, rules, tone) aur <b>user</b> messages. System prompt har turn pe lagta hai, aur models ko train kiya jaata hai ki usse zyada priority dein. Fixed cheezein (role, policy, format) system mein; har request ka data user message mein. Fixed hissa shuru mein rakhne se <b>prompt caching</b> ka fayda bhi milta hai.</p>
        <h2>5. Bade kaam ko todo (prompt chaining)</h2>
        <p>"Ye 50 page ka document padho, risks nikaalo, unko rank karo, aur email likho" ek prompt mein = har step thoda kamzor. Teen prompts: (1) risks extract, (2) rank, (3) email. Har step alag test ho sakta hai, aur galti kahan hui pata chalta hai. Kimat: zyada calls/latency.</p>`
    },
    {
      type: "quiz",
      q: "Model ko support tickets ko 12 categories mein daalna hai. Do categories (\"billing\" aur \"refund\") mein woh baar baar confuse hota hai. Sabse pehle kya try karoge?",
      options: ["Temperature 1.5", "Un dono ke beech ki boundary wale 2-3 few-shot examples + har category ki 1 line definition", "Prompt mein CAPITAL LETTERS mein 'DHYAAN SE'", "Fine-tuning turant"],
      answer: 1,
      why: "Confusion boundary pe hai, to boundary dikhao: definitions + mushkil examples. Ye sasta aur turant test hone wala hai. Fine-tuning tab socho jab examples aur definitions ke baad bhi accuracy kam ho aur aapke paas sainkdon labelled examples hon."
    },
    {
      type: "exercise",
      id: "ex-label",
      title: "Model ka output safely parse karo",
      level: "Easy",
      task: `<p>Classifier prompt ka output kabhi <code>"Positive."</code>, kabhi <code>" mixed\\n"</code>, kabhi <code>"Label: NEGATIVE"</code> aata hai. <code>parseLabel(output, allowed)</code> likho:</p>
        <ol>
          <li><code>null</code> ho to <code>"UNKNOWN"</code>.</li>
          <li>Lowercase karo, aur agar <code>"label:"</code> se shuru ho (trim ke baad) to wo prefix hatao.</li>
          <li>Letters (a-z), digits aur <code>_</code> ke alawa sab characters ko space se badlo, phir trim.</li>
          <li>Bacha hua text <code>allowed</code> (lowercase labels) mein exactly ho to wahi return; warna <code>"UNKNOWN"</code>.</li>
        </ol>`,
      examples: "<code>parseLabel(\"Positive.\", [positive, negative, mixed])</code> → <code>positive</code><br><code>parseLabel(\"I think positive\", ...)</code> → <code>UNKNOWN</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    String parseLabel(String output, List<String> allowed) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        List<String> A = List.of("positive", "negative", "mixed");
        Check.eq("Positive.", "positive", () -> s.parseLabel("Positive.", A));
        Check.eq("extra words → UNKNOWN", "UNKNOWN", () -> s.parseLabel("I think positive", A));
        Check.hiddenFromHere();
        Check.eq("space + newline", "mixed", () -> s.parseLabel("  mixed\\n", A));
        Check.eq("Label: prefix", "negative", () -> s.parseLabel("Label: NEGATIVE", A));
        Check.eq("quotes", "mixed", () -> s.parseLabel("\\"mixed\\"", A));
        Check.eq("null", "UNKNOWN", () -> s.parseLabel(null, A));
        Check.eq("khaali", "UNKNOWN", () -> s.parseLabel("   ", A));
        Check.eq("not in list", "UNKNOWN", () -> s.parseLabel("neutral", A));
        Check.eq("underscore label", "very_bad", () -> s.parseLabel("**Very_Bad**", List.of("very_bad", "ok")));
    }
}`,
      hints: [
        "<code>s = output.trim().toLowerCase();</code> phir <code>if (s.startsWith(\"label:\")) s = s.substring(6);</code>",
        "<code>s = s.replaceAll(\"[^a-z0-9_]\", \" \").trim();</code>",
        "<code>return allowed.contains(s) ? s : \"UNKNOWN\";</code>"
      ],
      solution: `import java.util.*;

class Solution {
    String parseLabel(String output, List<String> allowed) {
        if (output == null) return "UNKNOWN";
        String s = output.trim().toLowerCase();
        if (s.startsWith("label:")) s = s.substring("label:".length());
        s = s.replaceAll("[^a-z0-9_]", " ").trim();
        return allowed.contains(s) ? s : "UNKNOWN";
    }
}`,
      explain: `<p>Production rule: model ka output <b>untrusted input</b> hai. Thoda saaf karo (case, punctuation), par "I think positive" jaisa ambiguous output guess mat karo: UNKNOWN karke retry/log karo. Isse silent galtiyan nahi hoti, aur UNKNOWN ka rate khud ek useful metric hai.</p>`
    },
    {
      type: "think",
      id: "think-technique-pick",
      q: "Teen tasks hain. Har ek ke liye kaunsi technique(s) aur kyun: (a) invoice se 6 fields nikaalna, (b) shipping cost ka multi-step hisaab, (c) brand ki tone mein Instagram captions.",
      rubric: [
        { point: "(a) structured output / JSON schema + validation, low temperature", keys: ["json", "schema", "structured", "validat"], weight: 2 },
        { point: "(b) step by step / chain of thought ya calculator/code tool", keys: ["step", "chain", "thought", "calculator", "tool", "code"], weight: 2 },
        { point: "(c) few-shot examples brand tone ke; temperature thoda zyada", keys: ["few-shot", "few shot", "example", "tone", "temperature"], weight: 2 }
      ],
      answer: `<ul><li><b>(a) Invoice:</b> JSON schema (structured outputs ya tool calling), temperature ~0, aur code mein validation (GSTIN format, amount number hai).</li><li><b>(b) Hisaab:</b> step-by-step reasoning, aur behtar: model se formula/inputs nikalwao aur calculation code/calculator tool se karwao.</li><li><b>(c) Captions:</b> 3-5 asli brand captions as few-shot examples (tone wahi se aati hai), thoda zyada temperature for variety, aur kai options generate karke insaan chune.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Har technique ke saath uski <b>problem</b> bolo: few-shot = format/boundary, CoT = multi-step reasoning, JSON schema = parseable output, chaining = bada kaam testable tukdon mein. "Technique kab nahi" bhi: reasoning models pe CoT ki zaroorat kam, few-shot tokens ka kharcha.`
    }
  ],
  references: [
    { title: "Language Models are Few-Shot Learners (GPT-3)", by: "Brown et al., 2020", url: "https://arxiv.org/abs/2005.14165", type: "article" },
    { title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", by: "Wei et al., 2022", url: "https://arxiv.org/abs/2201.11903", type: "article" },
    { title: "Prompt Engineering Guide: techniques", by: "DAIR.AI", url: "https://www.promptingguide.ai/techniques", type: "docs" },
    { title: "OpenAI docs: Structured Outputs", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/structured-outputs", type: "docs" }
  ]
});
