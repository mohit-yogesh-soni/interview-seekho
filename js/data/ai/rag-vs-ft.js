// Prompting vs RAG vs Fine-tuning
registerLesson("ai", "rag-vs-ft", {
  why: `"Hum model ko apne data pe fine-tune kar lete hain" sabse common, aur aksar galat, pehla idea hota hai. Teeno tools alag problems solve karte hain. Sahi sawaal ye hai: model ko <b>knowledge</b> chahiye ya <b>behaviour</b>? Ye farak samajh liya to faisla seedha ho jaata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Teen tools, teen kaam</h2>
        <table>
          <tr><th></th><th>Prompting</th><th>RAG</th><th>Fine-tuning</th></tr>
          <tr><td>Kya badalta hai</td><td>Sirf input (instructions, examples)</td><td>Input mein runtime pe documents</td><td>Model ke weights</td></tr>
          <tr><td>Achha kis mein</td><td>Format, task, tone (thode examples se)</td><td><b>Knowledge</b>: private, badalti hui, source chahiye</td><td><b>Behaviour</b>: fixed style/format, domain ki zabaan, ek narrow task bahut baar, chhote model ko bade jaisa banana</td></tr>
          <tr><td>Data chahiye</td><td>Kuch nahi / kuch examples</td><td>Documents</td><td>Sainkdon-hazaaron achhe input→output examples</td></tr>
          <tr><td>Update</td><td>Turant</td><td>Doc re-index (minutes)</td><td>Dobara training + eval</td></tr>
          <tr><td>Source/citation</td><td>-</td><td>Haan</td><td>Nahi (model "yaad" se bolta hai)</td></tr>
          <tr><td>Kharcha</td><td>Sabse kam (par lamba prompt har request pe)</td><td>Retrieval infra + thoda lamba prompt</td><td>Training + hosting + eval pipeline; badle mein chhote prompts</td></tr>
        </table>
        <p><b>Order:</b> pehle prompting. Kaafi nahi? Knowledge ki kami hai to RAG; behaviour ki kami hai (aur examples hain) to fine-tuning. Dono bhi saath ho sakte hain: fine-tuned model jo RAG ke context ko achhe se use kare.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Fine-tuning ke tareeke (ek line mein)</h2>
        <table>
          <tr><th>Tareeka</th><th>Kya</th></tr>
          <tr><td>Full fine-tuning</td><td>Saare weights update. Sabse flexible, sabse mehenga (poora model GPU memory mein training ke saath).</td></tr>
          <tr><td><b>LoRA</b> (2021)</td><td>Original weights freeze; har layer mein chhote "adapter" matrices seekho jo weights mein badlav ko low-rank tareeke se dikhate hain. Trainable parameters bahut kam, ek base model pe kai adapters.</td></tr>
          <tr><td>QLoRA (2023)</td><td>Base model ko 4-bit mein rakh ke LoRA: chhote GPU pe bhi bade model ka fine-tune.</td></tr>
          <tr><td>Preference tuning (DPO)</td><td>"A behtar, B kharab" pairs se: tone, safety, style.</td></tr>
          <tr><td>Provider ka fine-tuning API</td><td>Data upload, provider train + host karta hai.</td></tr>
        </table>
        <p><b>Fine-tuning ke risks:</b> galat/kam data pe model bigad sakta hai; purani general abilities thodi kam ho sakti hain (catastrophic forgetting); naya base model aaya to dobara karna padta hai. Isliye pehle eval set banao, phir fine-tune, phir compare.</p>`
    },
    {
      type: "quiz",
      q: "Ek bank chahta hai ki chatbot har jawab ek fixed compliance format mein de (disclaimer, 3 sections, koi emoji nahi), aur ye 50 lakh requests/mahina hai. Prompt mein lamba format instruction + 5 examples se kaam ho raha hai par har request ~2,000 extra tokens. Kya socho?",
      options: ["RAG lagao", "Fine-tuning (format/behaviour) socho: examples hain, task fixed hai, aur har request ke 2,000 tokens bachenge", "Temperature badhao", "Kuch nahi ho sakta"],
      answer: 1,
      why: "Ye knowledge nahi, behaviour (format) ki problem hai, aur volume bahut hai. Fine-tuned model ko lamba format prompt nahi chahiye: 50 lakh × 2,000 = 1,000 crore tokens/mahina bachte hain. Pehle check karo prompt caching se kitna bachta hai, aur fine-tune ke baad eval zaroor."
    },
    {
      type: "pick",
      id: "pick-rag-or-ft",
      q: "Har situation ke liye sahi pehla tool: kaunse statements sahi hain?",
      options: [
        { text: "Product catalog roz badalta hai, bot ko prices batane hain → RAG (ya seedha DB tool call)", correct: true, why: "Badalti knowledge; aur prices jaisa structured data tool se exact milta hai." },
        { text: "Doctor-notes ko ek specific medical coding format mein badalna, 20k labelled examples hain → fine-tuning consider karo", correct: true, why: "Narrow, repeat task, fixed output, bahut examples." },
        { text: "Company ka naya leave policy PDF → fine-tune karo taaki model yaad rakhe", correct: false, why: "Policy badlegi, source chahiye: RAG." },
        { text: "Model sirf JSON nahi de raha → pehle structured outputs / prompting", correct: true, why: "Sabse sasta fix pehle." },
        { text: "Fine-tuning se hallucination khatam ho jaata hai", correct: false, why: "Nahi. Fine-tuned model bhi galat facts bana sakta hai." }
      ],
      answer: "Knowledge → RAG/tools. Behaviour/format → prompting, phir fine-tuning. Har case mein eval se prove karo."
    },
    {
      type: "think",
      id: "think-legal-bot",
      q: "Law firm: \"Hamare 20 saal ke case files pe ek assistant chahiye jo hamari style mein memo likhe aur purane cases cite kare.\" Aap kya architecture suggest karoge, aur kyun?",
      rubric: [
        { point: "Case files ke liye RAG (cite karna hai, knowledge bahut aur private)", keys: ["rag", "retriev", "cite", "citation", "vector", "search"], weight: 3 },
        { point: "Style ke liye few-shot ya (examples hon to) fine-tuning", keys: ["style", "few-shot", "few shot", "fine-tun", "lora", "examples"], weight: 2 },
        { point: "Citations verify / human review (legal risk)", keys: ["verify", "review", "lawyer", "human", "check"], weight: 2 },
        { point: "Access control / confidentiality", keys: ["access", "permission", "acl", "confidential", "privacy"], weight: 1 }
      ],
      answer: `<p><b>Knowledge = RAG:</b> 20 saal ke cases bahut aur private hain, aur citation chahiye; retrieval (hybrid search + reranker) se relevant cases prompt mein, aur jawab mein exact case reference. <b>Style:</b> pehle 3-5 achhe memos as few-shot; phir bhi style match na ho aur sainkdon memos hon to LoRA fine-tune. <b>Safety:</b> har citation ko database se verify karo (nakli case = bada risk), lawyer final review kare, aur client-wise access control retrieval mein.</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Ek line yaad rakho: <i>"RAG knowledge ke liye, fine-tuning behaviour ke liye, prompting pehle."</i> Phir decision ko numbers se justify karo: update frequency, citation ki zaroorat, examples kitne hain, request volume.`
    }
  ],
  references: [
    { title: "LoRA: Low-Rank Adaptation of Large Language Models", by: "Hu et al., 2021", url: "https://arxiv.org/abs/2106.09685", type: "article" },
    { title: "QLoRA: Efficient Finetuning of Quantized LLMs", by: "Dettmers et al., 2023", url: "https://arxiv.org/abs/2305.14314", type: "article" },
    { title: "Build a Large Language Model (From Scratch), Ch. 6-7 (fine-tuning) + Appendix E (LoRA)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" }
  ]
});
