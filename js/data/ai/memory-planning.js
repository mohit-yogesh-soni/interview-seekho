// Memory, planning, multi-agent
registerLesson("ai", "memory-planning", {
  why: `Agent lamba chale to do sawaal aate hain: (1) model stateless hai aur context window limited, to wo pichhli baatein kaise "yaad" rakhe? (2) Bada kaam ho to kaise tod ke kare? Memory aur planning ke tareeke, aur multi-agent kab sach mein kaam ka hai, kab sirf mehenga.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Memory: model kuch yaad nahi rakhta, app rakhta hai</h2>
        <p>Har LLM call fresh hai. "Memory" ka matlab hai: <b>agli call ke prompt mein kya daalein</b>. Context window limited hai (aur har token ka paisa), to chunna padta hai.</p>
        <table>
          <tr><th>Type</th><th>Kya</th><th>Kaise</th><th>Kami</th></tr>
          <tr><td><b>Short-term</b> (working)</td><td>Is conversation/task ki baatein</td><td>Pichhle messages + tool results prompt mein</td><td>Lambi chat = context full, mehenga, beech ki baat miss</td></tr>
          <tr><td>Sliding window</td><td>Sirf last N messages (token budget tak)</td><td>Purane messages chhodo</td><td>Shuru mein bataya gaya zaroori fact ("main vegetarian hoon") gaya</td></tr>
          <tr><td>Summary</td><td>Purane hisse ka chhota summary</td><td>LLM se summarize, phir summary + recent messages</td><td>Summary mein detail kho sakti hai</td></tr>
          <tr><td><b>Long-term</b></td><td>Sessions ke paar: user preferences, purane facts</td><td>Facts nikaal ke DB/vector store mein; zaroorat pe retrieve (RAG jaisa)</td><td>Kya save karna, purana/galat fact kaise update/delete; privacy</td></tr>
        </table>
        <p>Practical combo: system prompt + user profile (long-term facts) + purani chat ka summary + last kuch messages, sab ek token budget ke andar.</p>`
    },
    {
      type: "exercise",
      id: "ex-history",
      title: "Token budget mein chat history fit karo",
      level: "Easy",
      task: `<p><code>fit(tokens, budget)</code>: <code>tokens[i]</code> = message i ke tokens; message 0 system prompt hai. Return karo un messages ke <b>indices</b> (badhte order mein) jo prompt mein jaayenge:</p>
        <ul>
          <li>Message 0 hamesha (chahe akela budget se bada ho).</li>
          <li>Phir sabse naye (last) message se peeche ki taraf jodte jao jab tak total ≤ budget. Jo pehla message fit nahi hota, wahin ruko (beech mein gap nahi: recent messages lagaatar hon).</li>
        </ul>`,
      examples: "<code>tokens = [100, 50, 40, 30, 20], budget 200</code> → 100 + 20 + 30 + 40 = 190, phir 50 fit nahi → <code>[0, 2, 3, 4]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<Integer> fit(int[] tokens, int budget) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("example", List.of(0, 2, 3, 4), () -> s.fit(new int[]{100, 50, 40, 30, 20}, 200));
        Check.eq("sab fit", List.of(0, 1, 2), () -> s.fit(new int[]{10, 10, 10}, 100));
        Check.hiddenFromHere();
        Check.eq("sirf system", List.of(0), () -> s.fit(new int[]{100}, 50));
        Check.eq("system hi budget se bada", List.of(0), () -> s.fit(new int[]{300, 10, 10}, 200));
        Check.eq("gap nahi: chhota purana message skip nahi hota", List.of(0, 3), () -> s.fit(new int[]{50, 5, 100, 40}, 100));
        Check.eq("exact budget", List.of(0, 1, 2), () -> s.fit(new int[]{50, 25, 25}, 100));
        int[] big = new int[100001];
        Arrays.fill(big, 1);
        Check.eq("bada history", 1001, () -> s.fit(big, 1001).size());
    }
}`,
      hints: [
        "<code>used = tokens[0]</code>, result list mein 0.",
        "<code>for (i = n-1; i &gt;= 1; i--)</code>: <code>if (used + tokens[i] &gt; budget) break;</code> warna jodo.",
        "Peeche se jode hain, to end mein index 0 ke baad wale hisse ko reverse/sort karo."
      ],
      solution: `import java.util.*;

class Solution {
    List<Integer> fit(int[] tokens, int budget) {
        List<Integer> recent = new ArrayList<>();
        long used = tokens[0];
        for (int i = tokens.length - 1; i >= 1; i--) {
            if (used + tokens[i] > budget) break;
            used += tokens[i];
            recent.add(i);
        }
        Collections.reverse(recent);
        List<Integer> out = new ArrayList<>();
        out.add(0);
        out.addAll(recent);
        return out;
    }
}`,
      explain: `<p>Ye sliding window memory hai. "Gap nahi" rule isliye ki beech ka message hata ke baad wala rakhoge to conversation ka matlab toot sakta hai ("haan, wahi wala" kis baare mein?). Production mein jo messages kate, unka ek summary system prompt ke baad daal dete hain. O(n).</p>`
    },
    {
      type: "text",
      html: `
        <h2>Planning: bada kaam kaise todein</h2>
        <table>
          <tr><th>Tareeka</th><th>Kaise</th><th>Kab</th></tr>
          <tr><td>ReAct (step by step)</td><td>Har step pe socho → ek tool → dekho</td><td>Chhote/medium kaam, jahan agla step pichhle result pe depend</td></tr>
          <tr><td><b>Plan-and-execute</b></td><td>Pehle poora plan (steps ki list), phir har step execute; zaroorat pe plan update</td><td>Lambe kaam: plan dikh-ta hai, user approve kar sakta hai, progress track hoti hai</td></tr>
          <tr><td>Reflection / self-critique</td><td>Output ke baad "kya galat hai?" check, phir sudhaar (evaluator-optimizer)</td><td>Jahan check karne ka saaf criteria ho (tests, rubric)</td></tr>
        </table>
        <p>Sabse achha "critique" asli feedback hai: code ke liye tests chalana, SQL ke liye query chala ke dekhna. Model ki apni raay ("ye sahi lagta hai") us se kamzor hai.</p>
        <h2>Multi-agent: kab sach mein fayda</h2>
        <p>Multi-agent = kai LLM "roles" (planner, researcher, coder, reviewer) jo apas mein kaam baant-te hain. Aksar ek <b>orchestrator</b> kaam todta hai aur <b>workers</b> ko deta hai.</p>
        <table>
          <tr><th>Fayda</th><th>Kimat</th></tr>
          <tr><td>Har worker ka context chhota aur focused (sirf apna hissa)</td><td>Zyada LLM calls = zyada paisa aur latency</td></tr>
          <tr><td>Independent hisse <b>parallel</b> (5 sources ek saath research)</td><td>Agents ke beech information khona; ek ki galti doosre tak</td></tr>
          <tr><td>Alag tools/permissions per role</td><td>Debug karna mushkil (kaunse agent ne kab kya socha)</td></tr>
        </table>
        <p><b>Rule:</b> pehle ek agent + achhe tools. Multi-agent tab jab kaam naturally parallel ho ya ek context mein fit na ho. "Har cheez ke liye ek agent" aksar ek simple function call se zyada mehenga aur kam reliable hota hai.</p>`
    },
    {
      type: "flow",
      title: "Orchestrator-workers: research report",
      nodes: [
        { id: "u", label: "User: 'EV market\nreport banao'", icon: "🙋", x: 100, y: 170, kind: "client", w: 180 },
        { id: "orc", label: "Orchestrator\n(plan + jodna)", icon: "🧭", x: 360, y: 170, kind: "service", w: 180 },
        { id: "w1", label: "Worker: sales data", icon: "🔎", x: 640, y: 60, kind: "service", w: 180 },
        { id: "w2", label: "Worker: policies", icon: "🔎", x: 640, y: 170, kind: "service", w: 180 },
        { id: "w3", label: "Worker: competitors", icon: "🔎", x: 640, y: 280, kind: "service", w: 180 },
        { id: "mem", label: "Shared notes\n(state store)", icon: "🗒️", x: 900, y: 170, kind: "data", w: 150 }
      ],
      edges: [
        { from: "u", to: "orc", both: true },
        { from: "orc", to: "w1", both: true },
        { from: "orc", to: "w2", both: true },
        { from: "orc", to: "w3", both: true },
        { from: "w1", to: "mem", dashed: true },
        { from: "w2", to: "mem", both: true, dashed: true },
        { from: "w3", to: "mem", dashed: true }
      ],
      steps: [
        { title: "Plan", html: "<p>Orchestrator kaam ko 3 independent sawaalon mein todta hai.</p>", path: ["u", "orc"], active: ["orc"] },
        { title: "Workers parallel", html: "<p>Har worker apne chhote context mein search karta hai aur notes likhta hai. Parallel = kam wall-clock time.</p>", paths: [["orc", "w1", "mem"], ["orc", "w2", "mem"], ["orc", "w3", "mem"]], active: ["w1", "w2", "w3"] },
        { title: "Jodo + check", html: "<p>Orchestrator notes jod ke report likhta hai. Ek worker fail hua to sirf wo dobara.</p>", path: ["mem", "w2", "orc", "u"], active: ["orc"] }
      ]
    },
    {
      type: "quiz",
      q: "Long-term memory mein user ne 6 mahine pehle bataya tha \"main Bangalore mein rehta hoon\". Ab wo bolta hai \"maine Pune shift kar liya\". Sahi design?",
      options: ["Dono facts rakho, model khud samajh lega", "Memory mein fact ko update karo (purana overwrite ya 'old' mark), har fact ke saath timestamp/source rakho", "Long-term memory band karo", "Har baar poori chat history bhejo"],
      answer: 1,
      why: "Memory ek database hai: facts update/delete hone chahiye, warna model ko do ulte facts milenge. Timestamp se 'latest' chunna aasaan hai, aur user ko apni memory dekhne/delete karne ka option dena privacy ke liye zaroori hai."
    },
    {
      type: "think",
      id: "think-memory-design",
      q: "Ek \"personal fitness coach\" chatbot hai jo mahino tak user se baat karega. Uski memory kaise design karoge? (Kya save, kahan, prompt mein kaise.)",
      rubric: [
        { point: "Structured profile facts (goal, diet, injuries) DB mein, har baar prompt mein", keys: ["profile", "facts", "goal", "injur", "diet", "structured", "db"], weight: 2 },
        { point: "Purani conversations ka summary / retrieval (vector store)", keys: ["summary", "summar", "retriev", "vector", "rag", "search"], weight: 2 },
        { point: "Recent messages sliding window + token budget", keys: ["recent", "sliding", "window", "budget", "last"], weight: 2 },
        { point: "Update/delete, timestamps, user control + privacy (health data)", keys: ["update", "delete", "timestamp", "privacy", "consent", "user control"], weight: 2 }
      ],
      answer: `<ul><li><b>Profile (structured):</b> goal, weight history, diet (veg/non-veg), injuries, schedule: ek table mein; har request ke system prompt mein chhota sa block. Model se naye facts extract karwao, par update code karta hai (timestamp ke saath).</li><li><b>Episodic memory:</b> har session ka summary vector store mein; naye sawaal pe relevant purane summaries retrieve ("pichhli baar knee pain bataya tha").</li><li><b>Short-term:</b> is session ke last messages, token budget ke andar.</li><li><b>Privacy:</b> health data sensitive hai: user dekh/delete kar sake, encryption, aur medical advice pe disclaimer.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Agent ki memory" pe pehle bolo: model stateless hai, memory = prompt mein kya daalna hai. Phir layers: short-term (window/summary), long-term (structured facts + retrieval), aur update/privacy. Multi-agent pe "pehle single agent, parallel kaam ho tab multi" kehna maturity dikhata hai.`
    }
  ],
  references: [
    { title: "Building effective agents (orchestrator-workers, evaluator-optimizer)", by: "Anthropic", url: "https://www.anthropic.com/research/building-effective-agents", type: "article" },
    { title: "Generative Agents: Interactive Simulacra of Human Behavior (memory + reflection)", by: "Park et al., 2023", url: "https://arxiv.org/abs/2304.03442", type: "article" },
    { title: "Prompt Engineering Guide: LLM agents", by: "DAIR.AI", url: "https://www.promptingguide.ai/research/llm-agents", type: "docs" }
  ]
});
