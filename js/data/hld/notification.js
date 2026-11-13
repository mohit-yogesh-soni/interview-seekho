// Notification System (evolution style)
registerLesson("hld", "notification", {
  why: `Notification system mein "kab queue lagani hai" sabse saaf dikhta hai: bahar ki slow aur unreliable services (Apple, Google, SMS providers), achanak spikes (marketing campaign), aur retries jinse duplicate na ho. Hum ek seedhe API call se shuru karenge.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stage 0: requirements</h2>
        <ul>
          <li><b>Functional:</b> doosri services (orders, payments, marketing) bolein "user 42 ko ye message bhejo", aur wo push (iOS/Android), SMS ya email se pahunche. User ne jo band kiya hai (jaise marketing SMS), wo na jaaye.</li>
          <li><b>Non-functional:</b> OTP jaise messages seconds mein; marketing thoda late chalega. Ek notification do baar nahi (do baar OTP/"order shipped" bura lagta hai). Koi notification chupchaap kho na jaaye.</li>
          <li><b>Scale:</b> ~1 crore notifications/din ≈ <b>~115/sec</b> average. Par marketing team 50 lakh users ko 10 minute mein bhejti hai ≈ <b>~8,000/sec</b> spike. Average nahi, <b>spike</b> design decide karega.</li>
        </ul>
        <h3>Pehle samjho: hum phone tak seedha nahi bhejte</h3>
        <table>
          <tr><th>Channel</th><th>Kaun pahunchata hai</th><th>Humein kya chahiye</th></tr>
          <tr><td>iOS push</td><td>Apple ka <b>APNs</b> (Apple Push Notification service). iPhone app ko push sirf isi raaste milta hai.</td><td>Device token (app install pe milta hai)</td></tr>
          <tr><td>Android push</td><td>Google ka <b>FCM</b> (Firebase Cloud Messaging)</td><td>Registration token</td></tr>
          <tr><td>SMS</td><td>SMS provider (Twilio, ya local gateways)</td><td>Phone number; har SMS ka paisa lagta hai</td></tr>
          <tr><td>Email</td><td>Email provider (Amazon SES, SendGrid)</td><td>Email address</td></tr>
        </table>
        <p>Ye sab <b>third-party</b> services hain: hum unki speed, downtime aur rate limits control nahi karte. Yahi baat aage har decision chalayegi.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 1: sabse simple (har service khud bhejti hai)</h2>
        <p>Order service order ship hone pe seedha FCM/APNs ko HTTP call karti hai, phir SMS provider ko. Ek chhote startup mein ye 1 din mein ban jaata hai, aur 2-3 services tak chalta hai.</p>`
    },
    {
      type: "flow",
      title: "Stage 1: har service seedha providers ko",
      nodes: [
        { id: "ord", label: "Order svc", icon: "📦", x: 150, y: 80, kind: "service", w: 160 },
        { id: "pay", label: "Payment svc", icon: "💳", x: 150, y: 260, kind: "service", w: 160 },
        { id: "apns", label: "APNs / FCM", icon: "🔔", x: 560, y: 80, kind: "external", w: 170 },
        { id: "sms", label: "SMS provider", icon: "📱", x: 560, y: 260, kind: "external", w: 170 },
        { id: "u", label: "User ka phone", icon: "🙋", x: 880, y: 170, kind: "client", w: 170 }
      ],
      edges: [
        { from: "ord", to: "apns" },
        { from: "ord", to: "sms" },
        { from: "pay", to: "apns" },
        { from: "pay", to: "sms" },
        { from: "apns", to: "u" },
        { from: "sms", to: "u" }
      ],
      steps: [
        { title: "Order shipped → push", html: "<p>Order service ne FCM ko call kiya, FCM ne phone tak pahunchaya.</p>", path: ["ord", "apns", "u"], active: ["apns"] },
        { title: "SMS provider slow (2s)", html: "<p>Order service ka request thread 2 second ruka. Ship ka API slow ho gaya, sirf SMS ki wajah se.</p>", path: ["ord", "sms"], active: ["sms"], color: "#e8590c" },
        { title: "Provider down → order flow fail", html: "<p>SMS provider gira: exception, aur kai jagah order flow hi fail. Notification ki galti, order ki saza.</p>", path: ["pay", "sms"], fail: ["sms"] }
      ]
    },
    {
      type: "text",
      html: `
        <h3>Kya toota?</h3>
        <ul>
          <li><b>Duplicate code:</b> har service mein APNs, FCM, SMS, email ka client, retries, templates. 10 services = 10 alag bug.</li>
          <li><b>Coupling:</b> provider slow/down = business flow slow/down.</li>
          <li><b>Preferences:</b> "user ne marketing band ki hai" ye har service ko alag se check karna padta hai, aur koi na koi bhool jaata hai.</li>
        </ul>
        <h2>Stage 2: ek Notification Service</h2>
        <p>Ek service banao jiska ek kaam hai: <code>send(userId, templateId, data, priority)</code>. Wo andar ye karti hai: user ki preferences dekho, device tokens / phone / email nikaalo, template bharo ("Hi Ravi, aapka order #123 ship ho gaya"), aur sahi channel pe bhejo.</p>
        <p><b>Data kahan:</b> preferences, device tokens, templates chhota relational data hai (user → kai devices), aur har notification pe padha jaata hai. <b>Postgres</b> + preferences ka Redis cache kaafi. Alag NoSQL ki zaroorat nahi.</p>
        <p><b>Alternative:</b> ek shared library jo har service use kare. Code duplicate nahi hota, par har service ko phir bhi providers ke credentials, retries aur slow calls jhelni padti hain. Library tab theek hai jab sirf 2-3 services hon.</p>
        <p><b>Abhi bhi kya toota?</b> Notification service providers ko <i>synchronously</i> call karti hai. Marketing ka 8,000/sec spike aaya: SMS provider ki apni limit hai (maan lo 500/sec), service ke threads wait mein bhar gaye, aur usi waqt aaya OTP bhi atak gaya.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 3: queue beech mein</h2>
        <p>Spike, slow consumer, aur "kaam baad mein ho jaaye to chalega": ye teeno queue ke classic signals hain. Notification service ab sirf validate karke message ek queue mein daalti hai aur turant "accepted" bolti hai. <b>Workers</b> queue se utha ke providers ko apni speed se bhejte hain.</p>
        <table>
          <tr><th>Option</th><th>Fayda</th><th>Kami</th></tr>
          <tr><td>Service ke andar thread pool / in-memory queue</td><td>Koi naya component nahi</td><td>Server crash ya deploy = queue ke saare messages gaye</td></tr>
          <tr><td>DB table as queue (<code>status = 'pending'</code>, workers poll karein)</td><td>Durable, Postgres pehle se hai; chhote scale pe bilkul valid</td><td>8k/sec pe polling + row locks DB ko pareshan karte hain</td></tr>
          <tr><td><b>Task queue</b> (SQS / RabbitMQ) ⭐</td><td>Har message ka alag ack; fail hua to wapas aata hai (visibility timeout / requeue); delay se retry; dead-letter queue built-in</td><td>Ek naya component (managed SQS mein chalana nahi padta)</td></tr>
          <tr><td>Kafka</td><td>Bahut high throughput, replay, kai consumers</td><td>Partition ke andar order mein padhta hai: ek message atka to peeche wale ruke; retry ke liye alag retry topics banane padte hain</td></tr>
        </table>
        <p><b>Decision:</b> task queue, kyunki yahan har message ek alag "kaam" hai jise individually retry karna hai. Agar company mein Kafka pehle se hai to Kafka + retry topics bhi theek jawab hai (bahut companies aise hi karti hain).</p>
        <h3>Ek queue ya kai?</h3>
        <p><b>Har channel ki alag queue</b> (push, SMS, email), aur OTP jaise urgent messages ki alag <b>high-priority</b> queue. Reason:</p>
        <ul>
          <li>SMS provider slow hai to sirf SMS queue badhegi, push nahi rukega.</li>
          <li>Har channel ke workers alag scale karo: push sasta aur tez, SMS mehenga aur rate-limited.</li>
          <li>50 lakh marketing messages ke peeche OTP 10 minute wait nahi karega.</li>
        </ul>`
    },
    {
      type: "text",
      html: `
        <h2>Stage 4: retries, duplicates, aur kharab tokens</h2>
        <table>
          <tr><th>Problem</th><th>Faisla</th><th>Kyun / alternative</th></tr>
          <tr><td>Provider ne 500 ya timeout diya</td><td>Retry with <b>exponential backoff + jitter</b> (1s, 2s, 4s... thoda random)</td><td>Turant retry = gire hue provider pe aur load. Jitter se saare workers ek saath retry nahi karte.</td></tr>
          <tr><td>5 retries ke baad bhi fail</td><td><b>Dead-letter queue</b> (DLQ) + alert</td><td>Infinite retry queue ko jam kar deta hai. DLQ mein insaan dekh sakta hai.</td></tr>
          <tr><td>Worker ne bheja, ack se pehle crash: message dobara aaya</td><td>Har notification ka <code>notificationId</code>; bhejne se pehle Redis <code>SET sent:{id} NX</code> (sirf pehli baar set hota hai)</td><td>Queues "at-least-once" deti hain: duplicates aayenge hi. Isliye worker <b>idempotent</b> banao. Exactly-once queue ke bharose mat raho.</td></tr>
          <tr><td>Caller service ne retry karke same request do baar bheja</td><td>Caller apna idempotency key bheje (jaise <code>order123-shipped</code>)</td><td>Same key = same notificationId = ek hi notification</td></tr>
          <tr><td>APNs/FCM bole "token invalid" (app uninstall)</td><td>Token DB se hatao</td><td>Warna har baar bekaar call</td></tr>
          <tr><td>User ko spam (din mein 20 marketing push)</td><td>Per-user rate limit (rate limiter lesson wala Redis pattern)</td><td>Users app hi uninstall kar dete hain</td></tr>
        </table>
        <p><b>Tracking:</b> har notification ka status (queued → sent → delivered/failed) ek table mein, aur opens/clicks events analytics ke liye stream mein. Ye "kya hamara OTP pahuncha?" debug karne ke liye zaroori hai.</p>`
    },
    {
      type: "flow",
      title: "Final design: service → priority/channel queues → workers → providers",
      nodes: [
        { id: "caller", label: "Order / Auth /\nMarketing svc", icon: "📦", x: 90, y: 180, kind: "service", w: 160 },
        { id: "ns", label: "Notification svc", icon: "🔔", x: 300, y: 180, kind: "service", w: 170 },
        { id: "db", label: "Postgres\nprefs + tokens", icon: "🗄️", x: 300, y: 340, kind: "data", w: 170 },
        { id: "qo", label: "Queue: OTP (high)", icon: "📨", x: 540, y: 50, kind: "queue", w: 190 },
        { id: "qp", label: "Queue: push", icon: "📨", x: 540, y: 180, kind: "queue", w: 190 },
        { id: "qs", label: "Queue: SMS", icon: "📨", x: 540, y: 310, kind: "queue", w: 190 },
        { id: "w", label: "Workers\n(idempotent)", icon: "👷", x: 760, y: 180, kind: "service", w: 150 },
        { id: "prov", label: "APNs / FCM /\nSMS / Email", icon: "🌐", x: 930, y: 80, kind: "external", w: 130 },
        { id: "dlq", label: "DLQ", icon: "🪦", x: 930, y: 300, kind: "queue", w: 110 }
      ],
      edges: [
        { from: "caller", to: "ns" },
        { from: "ns", to: "db", both: true },
        { from: "ns", to: "qo" },
        { from: "ns", to: "qp" },
        { from: "ns", to: "qs" },
        { from: "qo", to: "w" },
        { from: "qp", to: "w" },
        { from: "qs", to: "w" },
        { from: "w", to: "prov", both: true },
        { from: "w", to: "dlq", dashed: true }
      ],
      steps: [
        { title: "OTP: high-priority queue", html: "<p>Prefs + phone DB se, message OTP queue mein. Caller ko turant 202 Accepted.</p>", path: ["caller", "ns", "db", "ns", "qo", "w", "prov"], active: ["qo"] },
        { title: "Marketing spike: queue bharti hai, system nahi girta", html: "<p>50 lakh messages push/SMS queues mein jama. Workers provider ki limit ki speed se nikaalte hain. OTP queue alag hai, isliye OTP nahi rukta.</p>", paths: [["caller", "ns", "qp", "w", "prov"], ["ns", "qs"]], active: ["qp", "qs"] },
        { title: "Provider fail → retry → DLQ", html: "<p>Backoff ke saath retry; 5 baar fail to DLQ + alert.</p>", path: ["qs", "w", "prov", "w", "dlq"], fail: ["prov"], active: ["dlq"] }
      ]
    },
    {
      type: "text",
      html: `
        <div class="tip-box">🏭 <b>Production mein:</b> iOS pe push ka ek hi raasta APNs hai aur Android pe FCM; isliye har notification system asal mein "in providers ke aage ek reliable queue" hota hai. AWS SQS jaisi managed queues mein dead-letter queue aur visibility timeout (fail hua message kuch der baad wapas dikhna) built-in hain, jo upar wale retry design ko seedha support karte hain.</div>
        <h2>Recap</h2>
        <table>
          <tr><th>Stage</th><th>Problem</th><th>Faisla</th><th>Jo nahi liya aur kyun</th></tr>
          <tr><td>1</td><td>Basic bhejna</td><td>Seedha provider call</td><td>Queue: 2-3 services pe zaroorat nahi</td></tr>
          <tr><td>2</td><td>Duplicate code, preferences bhoolna</td><td>Notification service + Postgres</td><td>Shared library: slow calls aur credentials har service mein</td></tr>
          <tr><td>3</td><td>Spike + slow providers</td><td>Task queue, per channel + OTP priority</td><td>In-memory: crash pe loss; DB-queue: 8k/s pe polling bhaari</td></tr>
          <tr><td>4</td><td>Temporary failures</td><td>Backoff + jitter, DLQ</td><td>Turant retry: gire provider pe aur load</td></tr>
          <tr><td>4</td><td>At-least-once duplicates</td><td>notificationId + Redis SET NX</td><td>"Exactly-once" queue pe bharosa: practically milta nahi</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Pehle bolo "phone tak hum nahi, APNs/FCM/SMS providers pahunchate hain". Phir spike ka number (8k/s vs provider limit) dikha ke queue justify karo, aur end mein idempotency + DLQ.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 17 June 2021: HBO Max ne galti se "Integration Test Email #1" naam ka ek test email apne bahut saare asli subscribers ko bhej diya; baad mein company ne public sorry bola. Notification system design mein ise kaise rokte?`,
      options: [
        `Email bhejna band karo`,
        `Non-production environment ka asli user data/lists tak access hi na ho (sirf allowlist/test inboxes), bulk/marketing sends pe approval + chhote batch se shuru (canary), aur ek kill switch`,
        `Sirf SMS use karo`,
        `Test emails ka subject behtar rakho`
      ],
      answer: 1,
      why: `Notification system ek "broadcast" button hai: ek galti seedha laakhon logon tak. Isliye: test/staging mein provider credentials aise ho ki sirf allowlisted addresses pe hi jaa sake, production bulk sends pe dusre insaan ka approval, pehle 1% ko bhejo aur metrics dekho, aur turant rokne ka switch. Ye guard rails retries/DLQ jitne hi zaroori hain.`
    }
  ],
  references: [
    { title: "Apple: User Notifications (APNs)", by: "Apple", url: "https://developer.apple.com/documentation/usernotifications", type: "docs" },
    { title: "Firebase Cloud Messaging", by: "Google", url: "https://firebase.google.com/docs/cloud-messaging", type: "docs" },
    { title: "Amazon SQS dead-letter queues", by: "AWS", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html", type: "docs" },
    { title: "System Design Interview Vol. 1, Ch. 10: Design a notification system", by: "Alex Xu", url: "https://bytebytego.com/", type: "book" }
  ]
});
