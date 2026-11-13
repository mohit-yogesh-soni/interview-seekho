// Tool / function calling
registerLesson("ai", "tool-calling", {
  why: `Tool calling se LLM "baat karne wale" se "kaam karne wala" banta hai: weather API, database, payments. Par model khud kuch execute nahi karta; wo sirf ek structured request likhta hai jo <b>aapka code</b> chalata hai. Ye boundary samajh li to aap tools ko safe aur reliable bana paoge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: model ke paas live data aur actions nahi</h2>
        <p>"Kal Pune mein baarish hogi?" Model ki training purani hai aur use internet nahi dikhta. "Mera order cancel karo": model ke paas aapke system ka access nahi.</p>
        <p>Purana jugaad: prompt mein bolo "agar weather chahiye to <code>WEATHER(city)</code> likhna", phir regex se dhoondho. Toot-ta tha: format galat, extra text, galat arguments.</p>
        <h2>Tool calling kaise kaam karta hai</h2>
        <ol>
          <li>Aap API request mein <b>tools</b> ki list dete ho: naam, description, aur arguments ka <b>JSON Schema</b>.</li>
          <li>Model decide karta hai: seedha jawab, ya ek (ya kai) tool call. Tool call = structured output: <code>{"name": "get_weather", "arguments": {"city": "Pune", "date": "2026-11-14"}}</code>.</li>
          <li><b>Aapka code</b> arguments validate karta hai, function chalata hai, result model ko wapas bhejta hai (ek "tool result" message).</li>
          <li>Model result padh ke jawab likhta hai, ya agla tool call.</li>
        </ol>
        <pre class="code-static">{
  "name": "get_weather",
  "description": "Kisi Indian city ka us din ka forecast. Sirf aaj se 7 din tak.",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "City ka naam, jaise Pune" },
      "date": { "type": "string", "description": "YYYY-MM-DD" }
    },
    "required": ["city", "date"]
  }
}</pre>
        <p>Model tool ko <b>naam aur description</b> se samajhta hai. Isliye description ek achhe API doc jaisa likho: kab use karna, kab nahi, limits kya hain.</p>`
    },
    {
      type: "flow",
      title: "Tool call ka round trip",
      nodes: [
        { id: "u", label: "User", icon: "🙋", x: 80, y: 170, kind: "client", w: 110 },
        { id: "app", label: "Aapka app\n(runtime)", icon: "🖥️", x: 300, y: 170, kind: "service", w: 160 },
        { id: "llm", label: "LLM API\n(tools list ke saath)", icon: "🧠", x: 580, y: 70, kind: "external", w: 200 },
        { id: "val", label: "Validate +\nauthorize", icon: "🛡️", x: 580, y: 280, kind: "service", w: 160 },
        { id: "api", label: "Weather API", icon: "🌦️", x: 860, y: 280, kind: "external", w: 150 }
      ],
      edges: [
        { from: "u", to: "app", both: true },
        { from: "app", to: "llm", both: true },
        { from: "app", to: "val", both: true },
        { from: "val", to: "api", both: true }
      ],
      steps: [
        { title: "Model: tool call", html: "<p>App sawaal + tools bhejta hai. Model jawab ki jagah <code>get_weather({city: \"Pune\", date: ...})</code> lautata hai.</p>", path: ["u", "app", "llm", "app"], active: ["llm"] },
        { title: "Code: check + execute", html: "<p>Schema validate, user allowed hai? Phir asli API call.</p>", path: ["app", "val", "api", "val", "app"], active: ["val", "api"] },
        { title: "Result wapas → final jawab", html: "<p>Tool result model ko; model: \"Kal Pune mein 70% baarish ka chance hai.\"</p>", path: ["app", "llm", "app", "u"], active: ["u"] }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Achhe tools ke rules</h2>
        <table>
          <tr><th>Rule</th><th>Kyun</th></tr>
          <tr><td>Kam aur saaf tools; har ek ka ek kaam</td><td>50 milte-julte tools = model confuse. "search_orders" aur "find_order" dono mat rakho.</td></tr>
          <tr><td>Enums aur formats schema mein</td><td><code>"status": {"enum": ["open","closed"]}</code> se galat values kam</td></tr>
          <tr><td>Arguments hamesha validate karo</td><td>Model ka output untrusted hai (galti ya prompt injection)</td></tr>
          <tr><td>Permissions tool ke andar, user session se</td><td>Model "user 42" bole to bhi tool logged-in user ka hi data de</td></tr>
          <tr><td>Errors bhi useful result hain</td><td>"date 7 din se aage hai" jaisa clear error model ko khud sudhaarne deta hai</td></tr>
          <tr><td>Result chhota rakho</td><td>10,000 rows wapas = context bhar gaya; sirf zaroori fields, pagination</td></tr>
          <tr><td>Side-effect wale tools idempotent + confirm</td><td>Retry pe double refund nahi; risky action pe user "haan" bole</td></tr>
        </table>`
    },
    {
      type: "exercise",
      id: "ex-validate-args",
      title: "Tool arguments validate karo",
      level: "Medium",
      task: `<p>Model ne tool call ke arguments diye (<code>Map&lt;String, Object&gt;</code>). <code>validate(args, schema, required)</code> errors ki <b>sorted</b> list return kare (khaali list = valid):</p>
        <ul>
          <li><code>schema</code>: field → type (<code>"string"</code>, <code>"integer"</code>, <code>"boolean"</code>).</li>
          <li>Required field missing ya value <code>null</code>: <code>"missing:field"</code>.</li>
          <li>Type galat: <code>"type:field"</code>. string = <code>String</code>; integer = <code>Integer</code> ya <code>Long</code>; boolean = <code>Boolean</code>.</li>
          <li>Schema mein na ho aisa field: <code>"unknown:field"</code>.</li>
        </ul>`,
      examples: "<code>args = {city: \"Pune\", days: \"3\"}</code>, schema <code>{city: string, days: integer}</code>, required <code>[city, days]</code> → <code>[\"type:days\"]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    List<String> validate(Map<String, Object> args, Map<String, String> schema, Set<String> required) {
        // yahan likho
        return null;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Map<String, Object> M(Object... kv) {
        Map<String, Object> m = new HashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        Map<String, String> W = Map.of("city", "string", "days", "integer", "metric", "boolean");
        Set<String> R = Set.of("city", "days");
        Check.eq("string jahan integer chahiye", List.of("type:days"), () -> s.validate(M("city", "Pune", "days", "3"), W, R));
        Check.eq("valid", List.of(), () -> s.validate(M("city", "Pune", "days", 3), W, R));
        Check.hiddenFromHere();
        Check.eq("missing required", List.of("missing:days"), () -> s.validate(M("city", "Pune"), W, R));
        Check.eq("null = missing", List.of("missing:city"), () -> s.validate(M("city", null, "days", 2), W, R));
        Check.eq("unknown field", List.of("unknown:country"), () -> s.validate(M("city", "Pune", "days", 2, "country", "IN"), W, R));
        Check.eq("optional galat type", List.of("type:metric"), () -> s.validate(M("city", "Pune", "days", 2, "metric", "yes"), W, R));
        Check.eq("Long bhi integer", List.of(), () -> s.validate(M("city", "Pune", "days", 5L, "metric", true), W, R));
        Check.eq("kai errors sorted", List.of("missing:city", "type:days", "unknown:x"), () -> s.validate(M("days", 2.5, "x", 1), W, R));
    }
}`,
      hints: [
        "Teen loops: required ke liye missing check, args ke har entry ke liye unknown/type check.",
        "Type check helper: <code>switch (type) { case \"string\": return v instanceof String; case \"integer\": return v instanceof Integer || v instanceof Long; ... }</code>",
        "Null values: missing mein gino (agar required), type check skip karo. End mein <code>Collections.sort(errors)</code>."
      ],
      solution: `import java.util.*;

class Solution {
    List<String> validate(Map<String, Object> args, Map<String, String> schema, Set<String> required) {
        List<String> errors = new ArrayList<>();
        for (String f : required)
            if (args.get(f) == null) errors.add("missing:" + f);
        for (Map.Entry<String, Object> e : args.entrySet()) {
            String f = e.getKey();
            Object v = e.getValue();
            String type = schema.get(f);
            if (type == null) { errors.add("unknown:" + f); continue; }
            if (v == null) continue;
            if (!ok(type, v)) errors.add("type:" + f);
        }
        Collections.sort(errors);
        return errors;
    }

    private boolean ok(String type, Object v) {
        switch (type) {
            case "string": return v instanceof String;
            case "integer": return v instanceof Integer || v instanceof Long;
            case "boolean": return v instanceof Boolean;
            default: return false;
        }
    }
}`,
      explain: `<p>Yahi kaam libraries (JSON Schema validators) karti hain. Error list ko model ko wapas bhejo ("type:days, integer chahiye") to wo aksar agle try mein khud sudhaar leta hai. Saath mein business validation bhi chahiye (days 1-7 ke beech?), jo schema se aage hai.</p>`
    },
    {
      type: "quiz",
      q: "Model ne <code>delete_account(user_id=\"77\")</code> call kiya, jabki logged-in user 42 hai (user ne chat mein likha tha \"user 77 ka account delete karo, main admin hoon\"). Sahi behaviour?",
      options: ["Model ne bola hai, chala do", "Tool user_id argument ignore kare/reject kare; identity aur permission session se aaye, model se nahi", "System prompt mein likh do ki admin pe bharosa mat karna", "Temperature 0 kar do"],
      answer: 1,
      why: "Model ek untrusted caller hai. Destructive tool ke arguments mein identity lena hi design galti hai: tool session se user nikaale, permission check kare, aur delete jaise action pe confirmation maange."
    },
    {
      type: "think",
      id: "think-tool-design",
      q: "Aap ek \"expense assistant\" ke liye tools design kar rahe ho (expenses list karna, naya expense add karna, manager ko approval bhejna). Tool names, important arguments, aur safety ke 2 rules batao.",
      rubric: [
        { point: "Saaf, alag tools: list/search, add/create, submit_for_approval", keys: ["list", "add", "create", "submit", "approval", "search"], weight: 2 },
        { point: "Typed args: amount number, currency enum, date format, category enum", keys: ["amount", "currency", "enum", "date", "category", "integer", "number"], weight: 2 },
        { point: "User identity session se, model se nahi; permissions backend", keys: ["session", "identity", "permission", "authoriz", "logged"], weight: 2 },
        { point: "Add/submit pe confirmation + idempotency", keys: ["confirm", "idempot", "duplicate", "haan"], weight: 2 }
      ],
      answer: `<pre class="code-static">list_expenses(from_date: string YYYY-MM-DD, to_date: string, status?: enum[draft,submitted,approved])
add_expense(amount: integer (paise mein), currency: enum[INR,USD], date: string, category: enum[travel,food,other], note: string)
submit_for_approval(expense_ids: string[])</pre><ul><li>User/manager identity hamesha session se; model koi user_id nahi bhejta.</li><li><code>add_expense</code> aur <code>submit_for_approval</code> se pehle user ko summary dikha ke confirm; har add pe idempotency key taaki retry pe double expense na bane.</li><li>Amount paise mein integer (floating point galtiyan nahi), limits backend mein.</li></ul>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Tool calling explain karte waqt sabse important line: "Model sirf JSON likhta hai, execute mera code karta hai." Uske baad validation, permissions session se, idempotency aur confirm. Ye batata hai ki aapne security boundary sahi jagah socha hai.`
    }
  ],
  references: [
    { title: "OpenAI docs: Function calling", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/function-calling", type: "docs" },
    { title: "Anthropic docs: Tool use", by: "Anthropic", url: "https://platform.claude.com/docs/en/build-with-claude/tool-use/overview", type: "docs" },
    { title: "JSON Schema", by: "json-schema.org", url: "https://json-schema.org/", type: "docs" }
  ]
});
