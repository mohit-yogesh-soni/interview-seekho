// Kaunsa pattern? (practice)
registerLesson("lld", "pattern-picker", {
  why: "Interview mein koi nahi kehta 'Observer lagao'. Aapko problem ke shabdon se khud pehchaanna hai. Ye lesson signals ki ek table deta hai aur 12 scenarios pe practice. Yaad rakhne ke bajaye har scenario mein socho: kya badal raha hai, aur kaun kisko bata raha hai?",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Signal → pattern (sochne ki table)</h2>
        <table>
          <tr><th>Problem mein ye sunai de</th><th>Socho</th><th>Pattern</th></tr>
          <tr><td>"Kai tareeke se karna, tareeka badalta hai / user chunta hai"</td><td>Algorithm swap</td><td>Strategy</td></tr>
          <tr><td>"Jab X ho to A, B, C ko batao"</td><td>One-to-many notify</td><td>Observer</td></tr>
          <tr><td>"Status ke hisaab se behaviour alag; galat transition rokna"</td><td>Lifecycle</td><td>State (ya transition table)</td></tr>
          <tr><td>"Undo / redo / queue / baad mein chalao"</td><td>Action as object</td><td>Command</td></tr>
          <tr><td>"Request kai checks se guzre, koi bhi rok sake"</td><td>Pipeline</td><td>Chain of Responsibility</td></tr>
          <tr><td>"Optional add-ons, mix and match, runtime pe"</td><td>Layered wrap</td><td>Decorator</td></tr>
          <tr><td>"Third-party / purana interface fit nahi hota"</td><td>Translate</td><td>Adapter</td></tr>
          <tr><td>"Complicated subsystem ka simple entry point"</td><td>Simplify</td><td>Facade</td></tr>
          <tr><td>"Cache / permission / lazy load, asli object chhue bina"</td><td>Control access</td><td>Proxy</td></tr>
          <tr><td>"Tree: item aur group ko same treat karo"</td><td>Part-whole</td><td>Composite</td></tr>
          <tr><td>"Input/config pe depend karta hai kaunsi class bane"</td><td>Creation logic ek jagah</td><td>Factory</td></tr>
          <tr><td>"Bahut optional fields, validation, immutable"</td><td>Step-by-step creation</td><td>Builder</td></tr>
          <tr><td>"Poore app mein ek hi (config, pool)"</td><td>Single instance</td><td>Singleton (DI se)</td></tr>
          <tr><td>"Flow same, kuch steps alag"</td><td>Skeleton</td><td>Template Method</td></tr>
        </table>
        <p>Ek problem mein aksar <b>2-3 patterns saath</b> aate hain. Parking lot: Strategy (spot allocation, pricing) + Factory (vehicle/spot) + Singleton/Facade (lot). Isliye har scenario mein "kaun sa ek" nahi, "kaun kaun se aur kyun" socho.</p>`
    },
    { type: "quiz", q: "<b>1.</b> Payment page pe user UPI, card, netbanking ya wallet chun sakta hai; har ek ka flow alag hai.", options: ["Observer", "Strategy", "Composite", "Singleton"], answer: 1, why: "Ek kaam (pay), kai interchangeable tareeke, user runtime pe chunta hai." },
    { type: "quiz", q: "<b>2.</b> Flight delay hone pe passengers, crew app, airport display aur analytics sabko update chahiye.", options: ["Observer", "Builder", "Adapter", "Prototype"], answer: 0, why: "Ek event, kai listeners, source ko unke naam nahi pata hone chahiye." },
    { type: "quiz", q: "<b>3.</b> Aapki company ka logging interface hai; ek naya vendor SDK aaya jiska API bilkul alag hai.", options: ["Facade", "Decorator", "Adapter", "State"], answer: 2, why: "Existing interface mein vendor ko fit karna = Adapter." },
    { type: "quiz", q: "<b>4.</b> Coffee app: size, milk type, extra shot, syrup, whipped cream koi bhi combination.", options: ["Decorator", "Singleton", "Chain", "Iterator"], answer: 0, why: "Optional add-ons, mix and match, har ek price jodta hai." },
    { type: "quiz", q: "<b>5.</b> Elevator: IDLE, MOVING_UP, MOVING_DOWN, DOORS_OPEN, MAINTENANCE; har state mein buttons ka behaviour alag.", options: ["Strategy", "State", "Proxy", "Factory"], answer: 1, why: "Behaviour current state pe depend, aur states khud transitions karti hain." },
    { type: "quiz", q: "<b>6.</b> Expense approval: ₹5,000 tak team lead, ₹50,000 tak manager, upar finance head.", options: ["Chain of Responsibility", "Composite", "Builder", "Observer"], answer: 0, why: "Request levels se guzarti hai, jo handle kar sake wo kare." },
    { type: "quiz", q: "<b>7.</b> Org chart mein kisi bhi node (team ya employee) ka total headcount aur cost.", options: ["Composite", "Adapter", "Command", "Template Method"], answer: 0, why: "Tree, leaf aur group same interface." },
    { type: "quiz", q: "<b>8.</b> Drawing app mein shapes add/move/delete aur Ctrl+Z.", options: ["Command", "Observer", "Factory", "Facade"], answer: 0, why: "Undo = actions ko objects banao with execute/undo." },
    { type: "quiz", q: "<b>9.</b> Product details API slow hai; same product baar baar maanga jaata hai, aur service code chhuna nahi.", options: ["Proxy (caching)", "Builder", "State", "Composite"], answer: 0, why: "Same interface, asli object ke saamne cache." },
    { type: "quiz", q: "<b>10.</b> Search query: 12 optional filters (price, brand, rating, sort, page...), aur kuch combinations invalid.", options: ["Builder", "Observer", "Adapter", "Iterator"], answer: 0, why: "Bahut optional parameters + validation ek jagah (build)." },
    {
      type: "pick",
      id: "pick-parking-patterns",
      q: "<b>11.</b> Parking lot: \"vehicle types (bike, car, truck), spot allocation policy (nearest / EV first) badal sakti hai, hourly pricing weekend pe alag, aur spot free hote hi display board update ho.\" Kaunse patterns natural hain?",
      options: [
        { text: "Strategy: allocation policy", correct: true, why: "Policy badalti hai." },
        { text: "Strategy: pricing (weekday / weekend)", correct: true, why: "Pricing rules alag aur badalte hain." },
        { text: "Observer: display board updates", correct: true, why: "Spot status badla → board ko pata." },
        { text: "Decorator: vehicle types", correct: false, why: "Vehicle types add-ons nahi hain; enum ya simple hierarchy kaafi." },
        { text: "Command: park/unpark", correct: false, why: "Undo/queue ki zaroorat nahi bataayi. YAGNI." },
        { text: "Factory: ticket / vehicle object banana input se", correct: true, why: "Optional par natural: type string se sahi object." }
      ]
    },
    {
      type: "think",
      id: "think-picker-final",
      q: "<b>12.</b> \"Notification service: email, SMS, push, WhatsApp channels; user apni pasand set kare; har message template se bane jisme kuch steps fix hain (header, footer) aur body alag; kuch channels fail hon to retry; aur ek naya channel bina core badle jud sake.\" Kaunse patterns aur kahan?",
      rubric: [
        { point: "Channels ke liye <b>Strategy / common interface</b> + Factory/registry se chunna", keys: ["strategy", "channel interface", "factory", "registry"], weight: 2 },
        { point: "Message banana: <b>Template Method</b> (fix header/footer, body alag) ya Builder", keys: ["template", "builder"], weight: 2 },
        { point: "Retry: <b>Decorator</b> (RetryingChannel) ya proxy", keys: ["decorator", "retry", "proxy", "wrapper"], weight: 2 },
        { point: "Event trigger: <b>Observer</b> (order placed → notification service sune)", keys: ["observer", "listener", "event", "subscribe"], weight: 1 }
      ],
      answer: "<ul><li><b>Channel interface</b> (send) + implementations; <b>Factory/registry</b> user preference se channel deta hai (naya channel = register).</li><li><b>Template Method</b> message formatting ke liye (header/footer fix, body hook), ya per-channel Builder.</li><li><b>Decorator</b>: <code>new RetryingChannel(new SmsChannel(), 3)</code>; logging/metrics bhi decorators.</li><li><b>Observer</b>: order service event publish kare, notification service listener ho. Scale pe ye message queue ban jaata hai.</li></ul><p>Dekho: har pattern ek alag sawaal ka jawab hai (kaise bheje, kaise banaye, fail pe kya, kab bheje).</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Pattern ka naam <b>baad</b> mein lo: pehle problem bolo (\"pricing rules badlenge\"), phir solution (\"interface ke peeche rakhta hoon\"), phir naam (\"ye Strategy hai\"). Isse lagta hai aap soch ke design kar rahe ho, rat ke nahi."
    }
  ],
  references: [
    { title: "Refactoring Guru: Design Patterns catalog", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/catalog", type: "article" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
