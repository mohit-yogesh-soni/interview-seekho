// Achhe prompt ka structure
registerLesson("ai", "prompt-anatomy", {
  why: `Model wahi karta hai jo prompt se samajh aata hai, aur use aapke project ka kuch nahi pata. Achha prompt ek naye, smart intern ko diya gaya clear brief jaisa hai. Ek fixed structure se prompts consistent bante hain, aur galti hone pe pata chalta hai kaunsa hissa sudhaarna hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: "achha sa likh do"</h2>
        <p>Prompt: <code>Customer ko reply likho.</code> Model ko nahi pata: kaunsa customer, kya hua, aap kaun ho, tone kya ho, kitna lamba, kya promise kar sakte ho aur kya nahi. To wo average internet reply likhta hai: lamba, generic, aur shayad aisa refund promise jo aapki policy mein nahi hai.</p>
        <p><b>Socho ek naye intern ko ye kaam do.</b> Aap use kya kya batate? Wahi prompt mein chahiye.</p>
        <h2>Paanch hisse</h2>
        <table>
          <tr><th>Hissa</th><th>Sawaal jo ye answer karta hai</th><th>Example</th></tr>
          <tr><td><b>Role</b></td><td>Tum kaun ho, kiske liye?</td><td>"Tum ek food delivery app ke support agent ho."</td></tr>
          <tr><td><b>Context</b></td><td>Kya situation hai? Kya data hai?</td><td>Order details, customer ka message, refund policy</td></tr>
          <tr><td><b>Task</b></td><td>Exactly kya karna hai?</td><td>"Customer ko maafi maango aur policy ke hisaab se agla step batao."</td></tr>
          <tr><td><b>Constraints</b></td><td>Kya nahi karna? Limits?</td><td>"Policy se bahar refund promise mat karo. 80 words se kam. Hinglish."</td></tr>
          <tr><td><b>Format</b> (+ examples)</td><td>Output kaisa dikhe?</td><td>"Sirf reply ka text, koi heading nahi" ya ek JSON schema; 1-2 example replies</td></tr>
        </table>
        <p>Har prompt mein paancho ka lamba hona zaroori nahi. Par jab output galat aaye, ye list check karo: aksar ek hissa missing hota hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Before / after</h2>
        <pre class="code-static">❌ Customer ko reply likho, order late hai.

✅ Tum "TezKhana" food delivery app ke support agent ho.

&lt;order&gt;
Order #4521, Paneer biryani, promised 8:10 PM, delivered 8:55 PM (45 min late)
Customer: Gold member
&lt;/order&gt;

&lt;customer_message&gt;
Bhai 45 minute late aaya aur thanda tha. Kya bakwas service hai.
&lt;/customer_message&gt;

&lt;policy&gt;
- 30+ min late: ₹100 coupon. Gold member: ₹150 coupon.
- Khaane ki quality complaint: photo maango, refund ka faisla quality team karegi.
&lt;/policy&gt;

Task: customer ko reply likho.
- Pehle seedhi maafi (bahane nahi).
- Policy ke hisaab se coupon batao. Policy se bahar kuch promise mat karo.
- Thande khaane ke liye photo maango.
- Hinglish, friendly, 70 words se kam. Sirf reply text.</pre>
        <p>Dhyaan do: data (order, message, policy) <b>tags</b> mein alag hai, instructions alag. Isse model ko pata rehta hai kya "padhna" hai aur kya "karna" hai, aur aage prompt injection se bachav mein bhi madad milti hai.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Kaam ke rules</h2>
        <table>
          <tr><th>Rule</th><th>Kyun</th></tr>
          <tr><td>Specific raho: "achha" ki jagah "70 words, 3 bullet points"</td><td>Model guess nahi karega</td></tr>
          <tr><td>Kya karna hai bolo, sirf kya nahi karna nahi</td><td>"Technical jargon mat use karo" se behtar: "aise samjhao jaise 12 saal ke bachche ko"</td></tr>
          <tr><td>Reason do</td><td>"Short rakho, kyunki ye SMS mein jaayega" se model khud sahi trade-off leta hai</td></tr>
          <tr><td>Data ko delimiters/tags mein</td><td>Instructions aur data mix nahi hote</td></tr>
          <tr><td>Examples sochke do</td><td>Model examples ki style bahut copy karta hai; 2-3 alag-alag examples do, ek jaise nahi</td></tr>
          <tr><td>Lambe documents pehle, sawaal end mein</td><td>Lambe context mein shuru aur end ki info zyada use hoti hai (limits lesson)</td></tr>
          <tr><td>Prompt ko code ki tarah treat karo</td><td>Version control, test set pe eval, phir change</td></tr>
        </table>`
    },
    {
      type: "think",
      id: "think-fix-prompt",
      q: "Ye prompt sudhaaro: <code>Is resume ko dekho aur batao achha hai ya nahi.</code> Aap HR tool bana rahe ho jo Java backend role ke liye resumes screen karta hai. Apna naya prompt likho (structure ke saath).",
      rubric: [
        { point: "Role / context: kaun ho, kaunsa job (Java backend, experience level)", keys: ["role", "recruiter", "java", "backend", "job description", "jd", "screen"], weight: 2 },
        { point: "Criteria saaf: kis cheez pe judge karna (skills, years, projects)", keys: ["criteria", "skills", "experience", "saal", "years", "must have", "spring"], weight: 2 },
        { point: "Output format: score / decision + reasons (JSON ya fixed fields)", keys: ["format", "json", "score", "decision", "reason", "bullet"], weight: 2 },
        { point: "Constraints: bias se bachao (naam, gender, age ignore), resume se bahar guess nahi", keys: ["bias", "gender", "age", "naam", "ignore", "guess", "sirf resume"], weight: 2 },
        { point: "Resume ko tags/delimiters mein", keys: ["tag", "<resume", "&lt;resume", "delimiter", "\"\"\"", "###"], weight: 1 }
      ],
      answer: `<pre class="code-static">Tum ek technical recruiter ho jo "Senior Java Backend Engineer (5+ saal)" role ke liye resumes screen karta hai.

&lt;job&gt;
Must have: Java 11+, Spring Boot, REST APIs, SQL, 5+ saal backend experience
Good to have: Kafka, AWS, microservices
&lt;/job&gt;

&lt;resume&gt;
...
&lt;/resume&gt;

Task: resume ko sirf upar ke criteria pe judge karo.
- Naam, gender, umar, college ka naam decision mein mat lo.
- Jo resume mein likha nahi, wo assume mat karo.
Output sirf ye JSON:
{"decision": "shortlist" | "reject" | "maybe",
 "must_have_missing": [..],
 "reasons": ["2-3 chhote points, resume se evidence ke saath"]}</pre>`
    },
    {
      type: "pick",
      id: "pick-prompt-issues",
      q: "Is prompt mein kya problems hain? <code>Tum ek helpful assistant ho. Ye 40 page ka contract padho [contract]. Kuch bhi risky ho to batao, aur haan bilkul galat mat bolna.</code>",
      options: [
        { text: "\"Risky\" ka matlab define nahi (kaunse clauses, kis party ke liye)", correct: true, why: "Model apni definition lagayega." },
        { text: "Output format nahi diya (list? clause number? severity?)", correct: true, why: "Har baar alag shape ka jawab aayega, aage process karna mushkil." },
        { text: "\"Galat mat bolna\" se hallucination ruk jaata hai", correct: false, why: "Ye instruction akeli kuch khaas nahi karti. Clause quote karne ko bolo taaki verify ho sake." },
        { text: "Contract tags mein alag nahi hai", correct: true, why: "Contract ke andar ka text instructions jaisa padha ja sakta hai." },
        { text: "Role line bahut chhoti hai, isliye prompt bekaar hai", correct: false, why: "Role madad karta hai, par asli kami criteria aur format ki hai." }
      ],
      answer: "Criteria, format aur data separation sabse badi kamiyan hain. 'Galat mat bolo' ki jagah 'har risk ke saath clause ka exact quote do' likho: isse verify karna possible hota hai."
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Achha prompt kaise likhte ho?" pe structure (role, context, task, constraints, format/examples) bolo, aur phir ye: "Main prompts ko version karta hoon aur ek eval set pe test karta hoon, gut feeling pe change nahi karta." Ye production experience dikhata hai.`
    }
  ],
  references: [
    { title: "Prompt Engineering Guide", by: "DAIR.AI", url: "https://www.promptingguide.ai/", type: "docs" },
    { title: "Anthropic docs: Prompt engineering overview", by: "Anthropic", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview", type: "docs" },
    { title: "OpenAI docs: Prompt engineering", by: "OpenAI", url: "https://developers.openai.com/api/docs/guides/prompt-engineering", type: "docs" }
  ]
});
