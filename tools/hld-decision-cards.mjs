// HLD building-block / pattern lessons mein ek "Faisla card" block jodta hai:
// kab lagao, kab nahi, kimat, alternatives, aur production mein kaun use karta hai (facts web search se verify kiye, 2026-11-13).
// Idempotent: marker "decision-card" mile to skip. Card last "tip" block se pehle jaata hai.
// Usage: node tools/hld-decision-cards.mjs
import fs from "node:fs";
import path from "node:path";

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "js", "data", "hld");

const C = {
  "scaling": {
    when: "App servers ka CPU/memory full ho, ya ek server gire to poori site gire (availability chahiye).",
    not: "Traffic ek machine ke andar hai aur downtime chal jaata hai: pehle badi machine (vertical) lo, sabse simple hai.",
    cost: "Servers stateless banane padte hain (session Redis/DB mein, files S3 mein), aage LB chahiye, deploy aur monitoring kai machines pe.",
    alt: "Vertical scaling: koi code change nahi, par ek limit hai aur single point of failure. DB ke liye aksar pehle vertical hi sahi hai.",
    prod: "Notion ne shuru mein ek hi bada Postgres (RDS ka sabse bada instance) chalaya, aur jab wo kam pada tab sharding ki. Pehle vertical, limit pe horizontal: yahi normal raasta hai."
  },
  "load-balancer": {
    when: "Ek se zyada app servers hon, ya ek server gire to traffic doosre pe jaana chahiye (health checks).",
    not: "Ek hi server hai aur HA ki zaroorat nahi.",
    cost: "Ek extra network hop (~sub-ms), LB khud HA pair/managed hona chahiye, WebSocket jaise lambe connections pe dhyaan (least-connections).",
    alt: "DNS round robin: sasta, par clients DNS cache karte hain, to gira server minutes tak traffic paata hai. Client-side LB (gRPC, service mesh): internal service-to-service ke liye, ek hop kam.",
    prod: "Cloud mein aksar managed LB: AWS ALB (L7, HTTP path/host routing) aur NLB (L4, TCP, bahut high throughput). Khud chalana ho to NGINX, HAProxy, Envoy."
  },
  "api-gateway": {
    when: "Kai microservices hon aur auth, rate limiting, routing, logging har service mein duplicate ho rahe hon; public API ho.",
    not: "Ek monolith hai: ek reverse proxy (NGINX) + app ke andar middleware kaafi hai.",
    cost: "Extra hop, gateway gira = sab gira (HA zaroori), aur agar har team ko gateway config ke liye ek central team ka wait ho to wo bottleneck ban jaata hai.",
    alt: "Reverse proxy (sirf routing/TLS), service mesh (Istio/Linkerd: andar ke service-to-service traffic ke liye), BFF (har client type ka apna chhota gateway).",
    prod: "Netflix ne apna gateway Zuul banaya aur open source kiya. Managed options: AWS API Gateway, Kong, Apigee."
  },
  "caching": {
    when: "Read-heavy, same data baar baar padha jaata hai, aur thoda purana (seconds/minutes) data chal jaata hai.",
    not: "Har read alag data ho (hit ratio kam), writes zyada hon, ya har read pe bilkul latest value chahiye (bank balance).",
    cost: "Stale data, invalidation ka logic, cache stampede, extra memory ka kharcha, aur ek aur system jo gir sakta hai (DB ko cache ke bina bhi zinda rehna chahiye).",
    alt: "Read replicas (har miss pe bhi fresh, par mehenge), DB ke andar materialized view, CDN (static/public responses), app process ke andar local cache (sabse tez, par har server ka alag).",
    prod: "Facebook ka NSDI 2013 paper \"Scaling Memcache at Facebook\" batata hai ki unhone memcached ko arbon requests/sec tak le jaane ke liye <b>leases</b> use kiye: miss pe sirf ek client ko DB jaane ki permission, baaki thoda wait karein. Yahi cache stampede ka production fix hai."
  },
  "cdn": {
    when: "Static files, images, video segments; users door door hain; bandwidth ka kharcha bada hai.",
    not: "Har response user-specific aur turant badalne wala hai, ya saare users ek hi shehar mein hain aur traffic chhota hai.",
    cost: "Per-GB kharcha, purge/invalidation mein deri, aur galat cache key se ek user ka private page doosre ko dikh sakta hai (sabse khatarnak bug).",
    alt: "Origin ke aage apna caching proxy (Varnish/NGINX), ya kai regions mein origin servers. Files ke naam mein version/hash daalo (<code>app.3f9a.js</code>) taaki invalidation ki zaroorat hi na pade.",
    prod: "Netflix Open Connect: apne cache appliances ISPs ke andar free mein rakhta hai aur raat mein popular content pehle se bhar deta hai. Amazon S3 jaisa object storage CDN ka common origin hai."
  },
  "sql-vs-nosql": {
    when: "SQL default rakho. NoSQL tab jab ek specific access pattern (key lookup, time-ordered writes per partition) bahut bade scale pe ho, ya data ka shape tables mein fit na ho.",
    not: "Sirf 'NoSQL scale karta hai' sun ke mat lo: Postgres ek machine pe hazaaron writes/sec aur TBs sambhal leta hai.",
    cost: "NoSQL mein queries pehle se design karni padti hain, joins/multi-row transactions nahi, consistency aksar eventual. SQL ko bahut bade scale pe sharding ka kaam.",
    alt: "Postgres JSONB (document jaisa flexible data SQL ke andar), NewSQL (Spanner, CockroachDB: SQL + distributed), sharding tools (Vitess, Citus).",
    prod: "Discord: 2015 mein MongoDB → 2017 Cassandra (messages) → 2022 ScyllaDB. Notion: Postgres hi rakha, 2021 mein 480 logical shards / 32 machines pe sharding ki. Dono ne access pattern dekh ke faisla kiya."
  },
  "indexing": {
    when: "Ek column pe baar baar filter/sort/join hota hai aur table badi hai (full scan slow).",
    not: "Write-heavy table jahan wo column kabhi query nahi hota; bahut chhoti tables; sirf ek low-cardinality column (jaise gender) jo aadhi table match kare.",
    cost: "Har insert/update pe har index bhi update hota hai (writes slow), extra disk aur RAM. 10 index = har write pe 10 extra kaam.",
    alt: "Composite/covering index (ek index se poori query), partitioning (purana data alag), search engine (full-text ke liye), LSM-based store (bahut writes ke liye).",
    prod: "Postgres/MySQL (InnoDB) mein default B-tree index. Cassandra, RocksDB (Facebook ka) aur LevelDB LSM-tree pe chalte hain, isliye writes tez aur reads mein compaction ka kaam."
  },
  "replication": {
    when: "Read traffic cache ke baad bhi ek DB se zyada ho, HA chahiye (primary gire to replica promote), backups/analytics primary se door chalane hon.",
    not: "Bottleneck <b>writes</b> hain: replicas writes kam nahi karte, har write har replica pe bhi jaata hai.",
    cost: "Replication lag (purana data padhna), failover ka logic, async replication mein failover pe kuch last writes kho sakte hain.",
    alt: "Cache (reads ke liye sasta), sharding (writes ke liye), synchronous replication (no loss, par har write slow), managed DB jo failover khud kare.",
    prod: "GitHub ka 21 Oct 2018 incident: sirf <b>43 second</b> ka network partition, par MySQL ka automatic failover doosre data center mein ho gaya aur dono taraf alag writes ho gaye. Theek karne mein <b>24 ghante 11 minute</b> lage. Failover policy ko design karna padta hai, ye free nahi milta."
  },
  "sharding": {
    when: "Writes ya data ek primary se zyada ho jaayein, aur vertical scaling, cache, replicas, purana data archive karna: sab try ho chuke hon.",
    not: "Shuru mein. Sharding sabse mehenga faisla hai jise wapas lena mushkil hai.",
    cost: "Cross-shard joins/transactions, hot shard, resharding (data move), har query ko shard key chahiye, operations kai guna.",
    alt: "Badi machine, read replicas + cache, table partitioning (ek DB ke andar), managed distributed DB (DynamoDB, Spanner, CockroachDB), Vitess/Citus.",
    prod: "Notion ne 2021 mein Postgres ko 480 <b>logical</b> shards mein baanta (32 machines × 15), taaki baad mein machines badhani hon to sirf logical shards move karein; 2023 mein 96 machines pe le gaye. Logical shards zyada rakhna resharding ko aasaan karta hai."
  },
  "cap": {
    when: "Data kai nodes/regions pe hai aur network toot sakta hai (hamesha). Har data type ke liye alag se pucho: partition mein galat jawab ya koi jawab nahi?",
    not: "Single node DB pe CAP ki baat bekaar hai; wahan latency vs consistency (replica se padhein ya primary se) asli sawaal hai.",
    cost: "CP: partition mein kuch requests fail. AP: conflicts baad mein merge karne padte hain (do log same seat book kar sakte hain).",
    alt: "Ek hi system mein mix: paisa/inventory CP store mein, likes/cart/feeds AP mein. PACELC yaad rakho: partition na ho tab bhi latency vs consistency ka trade-off hai.",
    prod: "Amazon ke Dynamo paper (2007) ka goal tha shopping cart hamesha writable rahe (AP), conflicts baad mein merge hon. Google Spanner ulti taraf hai: global strong consistency, GPS/atomic clocks wale TrueTime ke saath."
  },
  "message-queue": {
    when: "Traffic spikes, slow kaam (email, video, reports), ek event ke kai consumers, ya sender ko receiver ke down hone se farak na pade.",
    not: "User ko jawab turant chahiye (redirect, login) ya volume chhota hai: seedha call ya DB table kaafi.",
    cost: "At-least-once delivery = duplicates (consumer idempotent banao), eventual consistency, ek aur system chalana, debugging mushkil (request ka raasta toota hua).",
    alt: "DB table as queue / outbox (chhote scale pe), background thread (crash pe loss), cron jobs. Kafka (log, replay, high throughput) vs RabbitMQ/SQS (task queue, per-message ack, retry, DLQ).",
    prod: "Kafka LinkedIn pe activity events ke liye bana aur 2011 mein open source hua. AWS SQS mein dead-letter queue aur visibility timeout built-in hain."
  },
  "search": {
    when: "Full-text search (words, typo, relevance ranking), filters/facets bade data pe, <code>LIKE '%x%'</code> slow ho gaya.",
    not: "Exact key lookup, ya data chhota hai: Postgres full-text search (<code>tsvector</code>) + GIN index kaafi hai.",
    cost: "Ek alag system jise DB se sync rakhna hai (CDC/events), index thoda late update hota hai, aur ye source of truth nahi (data DB se dobara banna chahiye).",
    alt: "Postgres FTS, managed search (Algolia, OpenSearch Service), vector search (meaning se dhoondhna, AI module mein).",
    prod: "Elasticsearch aur OpenSearch dono Apache Lucene library pe bane hain (inverted index). Wikipedia ka search (CirrusSearch) Elasticsearch pe chalta hai."
  },
  "rate-limiting": {
    when: "Public API, login/OTP jaise abuse-prone endpoints, mehenge endpoints, ya multi-tenant system (ek customer sabko slow na kare).",
    not: "Andar ki trusted service jahan backpressure (queue, concurrency limit) behtar hai.",
    cost: "Har request pe ek check (Redis hop), galat limit = asli users ko 429, Redis down ka plan chahiye.",
    alt: "Concurrency limiter (ek saath max N requests), load shedding (overload pe kam zaroori traffic chhodo), quotas (din/mahine ka).",
    prod: "Stripe: token bucket Redis pe, saath mein concurrent-requests limiter aur load shedders. Cloudflare: sliding window counter, aur counters har data center ke apne. Detail: Distributed Rate Limiter design lesson."
  },
  "observability": {
    when: "Hamesha, pehle din se. Bina metrics ke aapko outage user ke tweet se pata chalega.",
    not: "Sab kuch log mat karo: har request ka poora body log karna mehenga hai aur privacy risk.",
    cost: "Logs ka storage bahut mehenga ho sakta hai (sampling, retention rakho); metrics mein high-cardinality labels (jaise userId) time-series database ko phula dete hain.",
    alt: "Managed (Datadog, New Relic, Dynatrace) vs open source (Prometheus + Grafana, Loki, Jaeger/Tempo). OpenTelemetry se instrumentation vendor-neutral rehti hai.",
    prod: "Google SRE book ne SLO aur error budget ko standard banaya: budget bacha hai to features ship karo, khatam to reliability pe kaam."
  },
  "monolith-micro": {
    when: "Microservices tab jab alag teams alag release cycle chahti hon, ya ek hissa bilkul alag scale/technology maange.",
    not: "Chhoti team (jaise &lt; 10-15 engineers), product abhi badal raha hai, domain boundaries saaf nahi.",
    cost: "Network calls (latency, failures), distributed transactions (saga), har service ka deploy/monitoring/on-call, data consistency.",
    alt: "<b>Modular monolith</b>: ek deploy, par andar saaf modules aur boundaries. Baad mein todna aasaan.",
    prod: "Prime Video ki ek monitoring service (2023 blog) distributed serverless components se ek process mein laayi gayi aur infra kharcha ~90% kam hua, kyunki components ke beech data S3 se guzar raha tha. Sabak: todne ka faisla data flow aur team structure dekh ke."
  },
  "reliability": {
    when: "Har network call pe: timeout hamesha. Retry sirf temporary errors pe aur sirf idempotent operations pe.",
    not: "Non-idempotent operation (payment) pe bina idempotency key ke retry: double charge.",
    cost: "Retries load badhate hain (retry storm), circuit breaker galat tune ho to healthy service ko bhi kaat deta hai.",
    alt: "Retry budget (max 10% extra requests), bulkheads (alag thread/connection pools), fallback (cached/default jawab), load shedding.",
    prod: "AWS Builders' Library ka article \"Timeouts, retries, and backoff with jitter\" exponential backoff + jitter ko standard practice batata hai. Stripe API idempotency keys support karta hai taaki retry pe payment dobara na ho. Netflix Hystrix ne circuit breaker popular kiya (ab maintenance mode mein; Resilience4j common hai)."
  },
  "data-patterns": {
    when: "Ek business action kai services/DBs mein likhta hai (order + payment + inventory) aur 2PC possible ya sasta nahi.",
    not: "Sab data ek DB mein hai: normal DB transaction lo, saga ki complexity bekaar hai.",
    cost: "Saga: compensating actions likhne padte hain, beech ki states dikhti hain. CQRS: do models sync rakhne padte hain (lag). Event sourcing: schema evolution, replay, debugging mushkil.",
    alt: "Ek service + ek DB (boundary badlo), transactional outbox (DB write + event ek transaction mein), 2PC (chhote, trusted setups mein).",
    prod: "\"Saga\" shabd 1987 ke Garcia-Molina aur Salem ke paper se aaya: lambi transaction ko chhote steps + compensations mein todna. Outbox pattern se \"DB mein likha par event nahi gaya\" wali problem hal hoti hai."
  },
  "fanout": {
    when: "Push (write pe fan-out): read-heavy feed, normal follower counts. Pull (read pe): bahut followers wale accounts, ya inactive users.",
    not: "Push celebrity accounts ke liye (crores inserts per post); pull jab har user 500 logon ko follow kare aur feed baar baar khule.",
    cost: "Push: storage (har follower ki list), write spikes, delete/unfollow pe safai. Pull: har read pe merge, latency.",
    alt: "Hybrid (common answer), ya ranked feed jahan candidates pull se aur ranking ML se.",
    prod: "Twitter (2013, Raffi Krikorian ki talk): home timelines Redis cluster mein (~800 entries), fan-out on write, aur bade accounts ke liye alag handling. Detail: Twitter design lesson."
  },
  "realtime": {
    when: "WebSocket: dono taraf lagaatar (chat, multiplayer). SSE: sirf server se client stream (LLM tokens, live scores, notifications). Long polling: purane clients/proxies jahan dono na chalein.",
    not: "Data minutes mein ek baar badalta hai: simple polling ya push notification kaafi.",
    cost: "Lambe connections = stateful servers, LB/proxy timeouts, reconnect storms (jitter chahiye), \"user kis server pe hai\" ka registry.",
    alt: "Managed realtime services (Pusher, Ably, AWS API Gateway WebSocket), mobile pe APNs/FCM push.",
    prod: "OpenAI API <code>stream: true</code> pe server-sent events bhejta hai. WhatsApp ne 2012 mein ek server pe 20 lakh+ TCP connections ka zikr kiya: persistent connections ka scale."
  }
};

const REFS = {
  "caching": { title: "Scaling Memcache at Facebook (NSDI 2013)", by: "Nishtala et al.", url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala", type: "article" },
  "replication": { title: "GitHub: October 21 post-incident analysis", by: "GitHub", url: "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/", type: "article" },
  "sharding": { title: "Herding elephants: lessons learned from sharding Postgres at Notion", by: "Notion", url: "https://www.notion.com/blog/sharding-postgres-at-notion", type: "article" },
  "sql-vs-nosql": { title: "How Discord Stores Trillions of Messages", by: "Discord", url: "https://discord.com/blog/how-discord-stores-trillions-of-messages", type: "article" },
  "reliability": { title: "AWS Builders' Library: Timeouts, retries, and backoff with jitter", by: "AWS", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", type: "article" },
  "monolith-micro": { title: "Prime Video: scaling up the audio/video monitoring service and reducing costs by 90% (archived)", by: "Prime Video Tech", url: "https://web.archive.org/web/20240805183535/https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90", type: "article" },
  "rate-limiting": { title: "Stripe: Scaling your API with rate limiters", by: "Stripe", url: "https://stripe.com/blog/rate-limiters", type: "article" },
  "api-gateway": { title: "Netflix Zuul (GitHub)", by: "Netflix", url: "https://github.com/Netflix/zuul", type: "docs" },
  "cdn": { title: "Netflix Open Connect", by: "Netflix", url: "https://openconnect.netflix.com/", type: "docs" },
  "fanout": { title: "Timelines at Scale (QCon 2013)", by: "Raffi Krikorian", url: "https://www.infoq.com/presentations/Twitter-Timeline-Scalability/", type: "video" }
};

const esc = s => s.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
let changed = 0;
for (const [id, c] of Object.entries(C)) {
  const file = path.join(dir, `${id}.js`);
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("decision-card")) continue;
  const html = `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>${c.when}</td></tr>
          <tr><th>Kab nahi</th><td>${c.not}</td></tr>
          <tr><th>Kimat (cost)</th><td>${c.cost}</td></tr>
          <tr><th>Alternatives</th><td>${c.alt}</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> ${c.prod}</div>
        </div>`;
  const block = `    {\n      type: "text",\n      html: \`${esc(html)}\`\n    },\n`;
  const tipIdx = src.lastIndexOf(`    {\n      type: "tip",`);
  const refIdx = src.indexOf("\n  ],\n  references");
  if (tipIdx > 0 && (refIdx < 0 || tipIdx < refIdx)) src = src.slice(0, tipIdx) + block + src.slice(tipIdx);
  else if (refIdx > 0) src = src.slice(0, refIdx) + ",\n" + block.replace(/,\n$/, "") + src.slice(refIdx);
  else { console.log("SKIP (pattern nahi mila):", id); continue; }
  const r = REFS[id];
  if (r && !src.includes(r.url)) {
    src = src.replace("references: [", `references: [\n    { title: ${JSON.stringify(r.title)}, by: ${JSON.stringify(r.by)}, url: ${JSON.stringify(r.url)}, type: ${JSON.stringify(r.type)} },`);
  }
  fs.writeFileSync(file, src);
  changed++;
}
console.log(`decision cards added: ${changed}`);
