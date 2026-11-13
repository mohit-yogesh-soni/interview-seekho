// Message Queue (Kafka / RabbitMQ)
registerLesson("hld", "message-queue", {
  why: `Queue system ko teen cheezon se bachata hai: traffic spikes, slow kaam jo request mein nahi hona chahiye, aur services ka ek doosre pe tight dependency. Interview mein 'kab queue lagao', Kafka vs RabbitMQ, aur at-least-once delivery ke saath idempotency har design mein aata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Sync vs async</h2>
        `
    },
    {
      type: "flow",
      title: "Sync chain vs queue",
      nodes: [
        {
          id: "user",
          label: "User",
          icon: "👤",
          x: 80,
          y: 160,
          kind: "client",
          w: 120
        },
        {
          id: "api",
          label: "Order API",
          icon: "📦",
          x: 270,
          y: 160,
          kind: "service"
        },
        {
          id: "q",
          label: "Queue / Kafka",
          icon: "📨",
          x: 500,
          y: 160,
          kind: "queue"
        },
        {
          id: "email",
          label: "Email worker",
          icon: "✉️",
          x: 780,
          y: 50,
          kind: "service"
        },
        {
          id: "sms",
          label: "SMS worker",
          icon: "📱",
          x: 780,
          y: 160,
          kind: "service"
        },
        {
          id: "an",
          label: "Analytics",
          icon: "📊",
          x: 780,
          y: 270,
          kind: "service"
        },
        {
          id: "dlq",
          label: `Dead letter
queue`,
          icon: "🪦",
          x: 500,
          y: 300,
          kind: "queue"
        }
      ],
      edges: [
        { from: "api", to: "email", both: true, dashed: true }, { from: "api", to: "an", both: true, dashed: true },
        {
          from: "user",
          to: "api",
          both: true
        },
        {
          from: "api",
          to: "q", both: true
        },
        {
          from: "q",
          to: "email"
        },
        {
          from: "q",
          to: "sms"
        },
        {
          from: "q",
          to: "an"
        },
        {
          from: "email",
          to: "dlq",
          dashed: true
        }
      ],
      steps: [
        {
          title: "Bina queue: sab sync chain mein",
          html: `<p>Order API khud email (2s), SMS (1s), analytics call karti hai. User 3s+ wait karta hai, aur email service down = order fail.</p>`,
          path: ["user","api","email","api","an","api","user"],
          dim: ["q","dlq"]
        },
        {
          title: "Queue ke saath: turant 200 OK",
          html: "<p>API sirf event queue mein daalti hai (~5ms) aur user ko jawab de deti hai.</p>",
          path: ["user","api","q","api","user"],
          active: ["q"]
        },
        {
          title: "Consumers apni speed se",
          html: "<p>Har consumer apne time pe event padhta hai. Spike aaye to queue buffer karti hai.</p>",
          paths: [
            ["q","email"],
            ["q","sms"],
            ["q","an"]
          ],
          active: ["email","sms","an"]
        },
        {
          title: "Email worker fail → retry → DLQ",
          html: `<p>Message ack nahi hua to dobara milega (at-least-once, isliye consumer idempotent). N retries ke baad dead letter queue mein, taaki line na ruke.</p>`,
          path: ["q","email","dlq"],
          fail: ["email"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <h3>Kab queue lagao (3 signals)</h3>
        <ol>
          <li><b>Spikes:</b> traffic 10× aata hai par DB/worker steady rate se hi le sakte hain (queue buffer karti hai).</li>
          <li><b>Slow / non-critical kaam:</b> email, thumbnails, video transcoding, reports: user ka wait nahi hona chahiye.</li>
          <li><b>Decoupling / fan-out:</b> ek event, kai consumers; producer ko consumers ka pata nahi.</li>
        </ol>
        <p><b>Kab nahi:</b> jab user ko turant result chahiye (login, balance check), ya simple CRUD jahan queue sirf complexity badhayegi.</p>
        <h2>Kafka vs RabbitMQ</h2>
        <table>
          <tr><th></th><th>Kafka</th><th>RabbitMQ</th></tr>
          <tr><td>Model</td><td><b>Log</b>: messages topic-partitions mein append; consumers apna offset rakhte; messages retention tak rehte</td><td><b>Broker queue</b>: message consumer ko diya, ack hua, queue se hata</td></tr>
          <tr><td>Replay</td><td>Haan (offset peeche le jao)</td><td>Nahi (default)</td></tr>
          <tr><td>Ordering</td><td>Sirf <b>partition ke andar</b> (same key → same partition)</td><td>Queue ke andar (single consumer pe); routing flexible (exchanges)</td></tr>
          <tr><td>Throughput</td><td>Bahut zyada (lakhs/sec), streaming, event sourcing</td><td>Achha, complex routing, per-message ack, priority, delays</td></tr>
          <tr><td>Scale consumers</td><td>Consumer group mein ek partition = ek consumer (partitions = max parallelism)</td><td>Competing consumers, jitne chaho</td></tr>
          <tr><td>Kab</td><td>Event streams, logs, analytics, CDC, kai teams same events padhein</td><td>Task queues (send email, process job), RPC-style workflows</td></tr>
        </table>
        <h2>Delivery guarantees</h2>
        <ul>
          <li><b>At-most-once:</b> bhejo aur bhool jao: kho sakta hai.</li>
          <li><b>At-least-once</b> (default practically): consumer ack/commit kaam ke <b>baad</b> karta hai; crash pe dobara milega → <b>duplicates possible</b>.</li>
          <li><b>Exactly-once:</b> Kafka transactions ke saath Kafka-to-Kafka pipelines mein; bahar ke systems (email, payment) ke saath practically <b>at-least-once + idempotent consumer</b>.</li>
        </ul>
        <p><b>Idempotent consumer:</b> har message ka unique id; processed ids store karo (DB unique constraint / Redis SET NX). Duplicate aaya to skip. Isse "exactly-once effect" milta hai.</p>
        <p><b>Dead letter queue (DLQ):</b> jo message N retries ke baad bhi fail ho, alag queue mein daalo, taaki ek kharab message poori line na roke.</p>`
    },
    {
      type: "tip",
      html: `🧪 <b>Simulator mein khud dekho:</b> Flash sale: 20,000 RPS, 80% writes (orders). DB 8,000 RPS le sakta hai. Pehle bina queue dekho, phir queue on karo. Backlog ka matlab samjho.`
    },
    {
      type: "sim",
      id: "sim-queue",
      title: "Sale spike: writes ko queue se smooth karo",
      config: {
        rps: 5000,
        maxRps: 40000,
        readRatio: 0.2,
        appCap: 2000,
        dbCap: 8000,
        servers: 50,
        lb: true,
        controls: ["rps","readRatio","queue","shards"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> Bina queue 16k writes direct DB pe = overload, errors. Queue on karte hi requests turant accept (latency kam, errors 0), par DB sirf ~8k/sec process karta hai: backlog badhta hai. 10 minute ki sale ke liye ye theek hai (baad mein clear). Agar 20k hamesha ho to backlog kabhi khatam nahi: tab shards chahiye. Queue spikes ke liye hai, sustained load ke liye capacity.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> Kafka topic ke 4 partitions hain aur consumer group mein 6 consumers. Kya hoga?</div>
          <div class="qa-a"><b>Jawab:</b> Sirf 4 active honge (ek partition ek group mein ek hi consumer ko), 2 idle; parallelism badhana ho to partitions badhao. Consumer group mein ek partition ek hi consumer padhta hai (isi se partition order bachta hai). Partitions = max parallelism per group.</div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Order events (CREATED, PAID, SHIPPED) Kafka se jaate hain. Consumer ko kabhi SHIPPED, PAID se pehle mil jaata hai. Kyun aur fix?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Ordering sirf <b>partition ke andar</b>; events alag partitions mein gaye</li><li>Fix: <b>key = order_id</b> taaki same order ke events ek partition mein</li><li>Consumer mein <b>state machine / version</b> check (out-of-order ignore/buffer)</li></ul></div>
          <div class="qa-a"><p>Kafka order sirf ek partition ke andar guarantee karta hai. Agar producer ne key nahi diya (round-robin) to ek order ke events alag partitions mein, alag consumers pe, kisi bhi order mein. Fix: message key = <code>order_id</code> (same key → same partition → order bacha). Defensive: consumer har event ka sequence/version check kare aur purani state se peeche jaane wale ya galat transition wale events ignore/retry kare. Retries ke saath bhi order bigad sakta hai (producer <code>max.in.flight</code> + idempotent producer settings).</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Traffic spikes, slow kaam (email, video, reports), ek event ke kai consumers, ya sender ko receiver ke down hone se farak na pade.</td></tr>
          <tr><th>Kab nahi</th><td>User ko jawab turant chahiye (redirect, login) ya volume chhota hai: seedha call ya DB table kaafi.</td></tr>
          <tr><th>Kimat (cost)</th><td>At-least-once delivery = duplicates (consumer idempotent banao), eventual consistency, ek aur system chalana, debugging mushkil (request ka raasta toota hua).</td></tr>
          <tr><th>Alternatives</th><td>DB table as queue / outbox (chhote scale pe), background thread (crash pe loss), cron jobs. Kafka (log, replay, high throughput) vs RabbitMQ/SQS (task queue, per-message ack, retry, DLQ).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Kafka LinkedIn pe activity events ke liye bana aur 2011 mein open source hua. AWS SQS mein dead-letter queue aur visibility timeout built-in hain.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Queue lagaate hi teen cheezein khud bolo: <i>at-least-once + idempotent consumers, partition key for ordering, DLQ for poison messages.</i> Aur bolo kyun queue (spike / slow work / decoupling).`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 25 November 2020: AWS Kinesis (streaming/queue service) us-east-1 mein ghanton degraded raha, saath mein Cognito, CloudWatch jaisi services bhi. Trigger: front-end fleet mein thodi capacity (naye servers) jodi gayi. Har front-end server <b>har doosre front-end server</b> ke liye ek OS thread banata tha. Kya toota?`,
      options: [
        `Disk bhar gayi`,
        `Servers badhne pe har server ke threads bhi badhe (N servers × N threads), aur OS ki max-threads limit cross ho gayi; servers apna routing data nahi bana paaye`,
        `Network cable kat gaya`,
        `Messages ka order bigad gaya`
      ],
      answer: 1,
      why: `AWS ki summary ke mutabik naye servers jodne se poori fleet OS thread limit cross kar gayi, aur Kinesis pe depend karne wali services bhi giri. Unhone bade (zyada CPU/memory wale) servers pe jaana tay kiya taaki servers aur threads kam hon, thread limits pe alarms, aur front-end ko cells mein baantna. Sabak: "har node har node se baat kare" wala design fleet badhne pe N² ho jaata hai; aur shared queue/stream infra kai services ka single dependency hota hai.`
    }
  ],
  references: [
    { title: "Summary of the Amazon Kinesis Event in the Northern Virginia (US-EAST-1) Region", by: "AWS", url: "https://aws.amazon.com/message/11201/", type: "article" },
    {
      title: "Kafka documentation",
      by: "Apache Kafka",
      url: "https://kafka.apache.org/documentation/",
      type: "docs"
    },
    {
      title: "Designing Data-Intensive Applications, Ch. 11: Stream Processing",
      by: "Martin Kleppmann",
      url: "https://dataintensive.net/",
      type: "book"
    },
    {
      title: "Hello Interview: System Design core concepts",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    }
  ]
});
