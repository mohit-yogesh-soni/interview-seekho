// HLD: har lesson ke end mein real-incident quiz (2026-11-14). Facts public post-mortems / engineering blogs se.
// Usage: node tools/hld-quizzes.mjs   (idempotent: marker "📰" wala quiz pehle se ho to skip)
import fs from "node:fs";

const Q = (q, options, answer, why) => ({ q: "📰 <b>Real incident:</b> " + q, options, answer, why });
const G = (q, options, answer, why) => ({ q: "🏭 <b>Production problem:</b> " + q, options, answer, why });

const QUIZ = {
  "request-flow": [Q(
    "4 October 2021: Facebook, Instagram aur WhatsApp ~6 ghante down rahe. Ek maintenance command ne Facebook ka backbone network tod diya. Uske baad Facebook ke DNS servers ne apne BGP routes withdraw kar diye. Users ko \"site nahi mili\" kyun dikha, jabki servers chal rahe the?",
    ["Data centers ki bijli chali gayi thi", "Internet ko facebook.com ke DNS servers tak pahunchne ka raasta hi nahi mila, to naam → IP lookup fail hua aur request aage gayi hi nahi", "Users ke browser cache expire ho gaye", "TLS certificates expire ho gaye"],
    1,
    "Request ka pehla kadam DNS hai. Meta ki post-mortem ke mutabik unke DNS servers design se apne BGP advertisements hata dete hain jab unhe data centers se baat karne mein dikkat ho (ek health check). Backbone toota to saare DNS servers ne ye kiya, aur duniya ke liye facebook.com ka IP dhoondhna namumkin ho gaya. Internal tools bhi isi network pe the, isliye engineers ko data centers mein physically jaana pada. Sabak: DNS aur network single point of failure ho sakte hain, aur recovery tools ko us system pe depend nahi hona chahiye jo down hai."
  )],
  "latency-numbers": [Q(
    "GitHub, October 2018: failover ke baad MySQL primaries West Coast pe aa gaye, jabki app servers East Coast pe the. Maan lo cross-country round trip ~70 ms hai (pehle same data center mein &lt; 1 ms). Ek page 20 writes ek ke baad ek karta hai. Page kitna slow hoga?",
    ["~70 ms extra", "~1.4 second extra (20 × 70 ms)", "Koi farak nahi, writes async hain", "~7 second extra"],
    1,
    "Sequential calls ki latency judti hai: 20 × 70 ms ≈ 1.4 s. GitHub ki post-incident analysis mein likha hai ki apps ko har write ke liye cross-country round trip karna pada, aur kai services is latency ki wajah se kaam ke laayak nahi rahin. Sabak: same-DC (~0.5 ms) vs cross-region (tens of ms) ka farak ek chhoti si config nahi, poore design ko badal deta hai; aur sequential round trips ko batch ya parallel karo."
  )],
  "estimation": [Q(
    "Pokémon GO (July 2016): Niantic aur Google Cloud ne ek target traffic aur uska ~5× \"worst case\" socha tha. Launch pe asli traffic target ka ~50× aaya. Estimation ke baare mein sahi sabak kya hai?",
    ["Estimation bekaar hai, launch ke baad hi dekhna chahiye", "Estimate ek starting point hai: system ko aisa banao ki estimate galat ho to bhi horizontally badh sake (stateless tiers, managed scalable storage), aur worst case se upar load test karo", "Hamesha 50× capacity pehle se kharido", "Sirf ek bahut bada server le lo"],
    1,
    "Google Cloud ke blog (\"Bringing Pokémon GO to life on Google Cloud\") ke mutabik traffic worst case ka bhi ~10 guna nikla. Game isliye bach paaya ki backend containers (GKE) aur managed Datastore pe tha, jinhe Google ke engineers ke saath milke tezi se badhaya gaya. 50× capacity pehle kharidna paisa barbaad karta; estimation ka asli kaam hai bottleneck pehchaanna aur scale-out ka raasta pehle se rakhna."
  )],
  "scaling": [Q(
    "Hotstar, 10 July 2019 (World Cup semi-final, India vs New Zealand): 25.3 million log ek saath live dekh rahe the. Dhoni ke aate hi har minute lakhon naye users judte hain. Hotstar ne normal reactive autoscaling (CPU badhe to servers jodo) pe bharosa kyun nahi kiya?",
    ["Autoscaling cloud mein hota hi nahi", "Naye servers aane mein minutes lagte hain, bade spike pe cloud se turant capacity milna bhi pakka nahi, aur scaling step chhote hote hain; isliye match se pehle expected concurrency ke hisaab se pre-scale kiya", "Unke paas paise nahi the", "Vertical scaling sasta tha"],
    1,
    "AWS re:Invent 2019 ki Hotstar talk (CMY302) mein bataya gaya ki live events pe default autoscaling ki dikkatein thi: insufficient capacity errors aur scale hone ki speed. Isliye wo game-day load tests aur concurrency ke forecast se pehle hi capacity tayaar rakhte the. Sabak: reactive autoscaling dheere badhte traffic ke liye achha hai; jab spike ka time pata ho (match, sale), pre-warm karo."
  )],
  "load-balancer": [Q(
    "24 December 2012: AWS us-east-1 mein ek maintenance process galti se production ELB (load balancer) ka state data delete kar gaya. Netflix ka streaming Christmas Eve pe ghanton tak kai devices pe toot gaya, jabki Netflix ke apne servers theek the. Is incident ka design sabak kya hai?",
    ["Load balancer kabhi fail nahi hota", "Load balancer bhi ek component hai jo fail ho sakta hai; traffic ko doosre LB/region pe shift karne ka raasta (DNS-level failover, multi-region) chahiye", "LB hata ke clients ko seedha servers ka IP do", "Servers aur bade karo"],
    1,
    "AWS ki summary ke mutabik ELB state data delete hone se kai load balancers ki configuration bigdi. Netflix ne baad mein \"Isthmus\" banaya taaki ek region ke ELB fail hone pe bhi traffic doosre raaste se aaye, aur aage chal ke multi-region active-active setup kiya. Sabak: jo component har request ke raaste mein hai (LB, DNS, gateway), uska bhi failure plan chahiye."
  )],
  "api-gateway": [Q(
    "2 July 2019: Cloudflare ke WAF (edge pe har HTTP request check karne wala layer) mein ek naya rule deploy hua jiska regular expression bahut zyada backtracking karta tha. Rule ek saath poori duniya ke servers pe gaya, CPU 100% ho gaya, aur ~27 minute tak Cloudflare ke peeche ki sites pe errors aaye. Gateway/edge layer ke liye sabse bada sabak?",
    ["Regex kabhi use mat karo", "Jo code har request pe chalta hai uska change staged rollout (pehle thode servers, phir sab) se jaaye, aur CPU/time limits + turant band karne ka switch ho", "WAF hata do", "Zyada servers lagao"],
    1,
    "Cloudflare ki post-mortem ke mutabik WAF rules ek saath globally push hote the, jabki baaki software staged rollout se jaata tha. Unhone WAF rules ke liye bhi staged rollout, regex execution ki limits, aur aise regex engines ki taraf jaane ki baat ki jo backtracking explosion se bachte hain. Sabak: gateway sab services ke aage hai, to wahan ka ek bug sab ko girata hai; isliye uske changes sabse zyada dheere aur saavdhaani se."
  )],
  "caching": [Q(
    "23 September 2010: Facebook ~2.5 ghante down raha. Ek configuration value ki persistent copy (database mein) badli, aur wo invalid maani gayi. Har client ne cache mein invalid value dekhi aur use \"theek\" karne ke liye seedha database se padha, par DB mein bhi wahi value thi. Database pe lakhon queries/sec aa gayin, wo slow hua, errors aaye, aur errors ke wajah se aur cache entries hatin, to aur queries. Ye kaunsa pattern hai aur fix kya hai?",
    ["Cache ka size chhota tha", "Thundering herd + feedback loop: miss/invalid pe har client seedha DB jaata hai; fix: request coalescing/lease (ek hi client DB jaaye), backoff, aur DB ko overload se bachana", "Database galat tha, NoSQL lena chahiye tha", "TTL zyada tha"],
    1,
    "Facebook ke engineering note mein bataya gaya ki automated \"fix the invalid value\" logic hi feedback loop ban gaya; aakhir mein unhe us database cluster pe traffic rokna pada (site band) taaki loop toote. Baad mein Facebook ke memcache paper (NSDI 2013) mein <b>leases</b> describe hue: miss pe sirf ek client ko DB jaane ki permission. Sabak: cache ke peeche ka DB tabhi bachta hai jab misses par control ho."
  )],
  "cdn": [Q(
    "8 June 2021: Fastly CDN pe ek customer ne valid configuration change kiya, jisse ek chhupa hua software bug trigger hua. Fastly ke ~85% network ne errors dene shuru kiye; Reddit, gov.uk, kai news sites kuch der ke liye gayab. Ek bade news site ke liye design sabak?",
    ["CDN mat use karo, sab origin se do", "CDN bhi single point of failure ho sakta hai; critical sites multi-CDN ya origin fallback rakhti hain (DNS/traffic steering se doosre CDN pe shift)", "Cache TTL badha do", "Sirf images CDN pe rakho"],
    1,
    "Fastly ki summary ke mutabik bug May 2021 ke ek deploy mein aaya tha aur 8 June ko ek customer config se trigger hua; ~49 minute mein zyaadatar network theek ho gaya. CDN hatana to 150 Tbps jaise traffic pe namumkin hai; isliye bade platforms do CDNs rakhte hain aur DNS/traffic steering se shift kar sakte hain. Kimat: dono ke config sync rakhna aur zyada kharcha."
  )],
  "sql-vs-nosql": [Q(
    "Discord (2022): messages Cassandra (177 nodes) pe the. Ek bade server ke popular channel pe hazaaron log ek saath purane messages padhte, to us data wale nodes slow ho jaate aur latency poore cluster mein unpredictable ho jaati. Main wajah kya thi?",
    ["Cassandra SQL support nahi karta", "Data channel (+ time bucket) se partitioned tha; ek bahut active channel ki saari reads kuch hi nodes pe jaati thi (hot partition), aur JVM garbage collection pauses latency aur badhate the", "Messages ka size bahut bada tha", "Indexes nahi the"],
    1,
    "Discord ke blog \"How Discord Stores Trillions of Messages\" ke mutabik hot partitions aur GC pauses badi dikkat the. Unhone (1) ScyllaDB liya (Cassandra-compatible, C++, GC nahi) aur 177 nodes se 72 pe aaye, aur (2) database ke aage Rust ki data services lagayi jo same channel ke ek saath aaye requests ko <b>coalesce</b> karti hain (ek hi query DB tak). Sabak: NoSQL choose karne ke baad bhi partition key ka access pattern hi performance decide karta hai."
  )],
  "indexing": [G(
    "Postgres mein 50 crore rows wali <code>orders</code> table hai. Peak hours mein ek engineer ne naya index banaya: <code>CREATE INDEX idx_user ON orders(user_id);</code> Index banne mein 20 minute lage aur us dauraan saare naye orders fail/atak gaye. Kyun, aur sahi tareeka?",
    ["Index ka naam galat tha", "Normal CREATE INDEX table pe aisa lock leta hai jo INSERT/UPDATE/DELETE rok deta hai (reads chalte rehte hain); <code>CREATE INDEX CONCURRENTLY</code> se writes chalte rehte hain (thoda slow aur zyada time)", "Postgres mein index ban hi nahi sakta", "User_id pe index kabhi nahi banta"],
    1,
    "Postgres docs ke mutabik normal CREATE INDEX table ko writes ke against lock karta hai jab tak index ban na jaaye. <code>CONCURRENTLY</code> option table ko do baar scan karta hai par writes block nahi karta (transaction block ke andar nahi chal sakta, aur fail ho to invalid index chhod deta hai jise drop karke dobara banana padta hai). Ye migrations ka bahut common production incident hai; isliye bade tables pe schema changes off-peak aur online tareekon se."
  )],
  "replication": [Q(
    "31 January 2017: GitLab.com pe ek engineer ne replication theek karte waqt galti se <b>primary</b> database ki data directory delete kar di (use laga secondary hai). ~300 GB data gaya. Replica tha, phir bhi data kyun nahi bacha, aur sahi sabak?",
    ["Replica hamesha backup hota hai, to data bach jaata", "Replication backup nahi hai: replica galat delete/kharab writes ko bhi copy karta hai (aur yahan woh pehle se toota hua tha). Point-in-time backups chahiye jinka restore regularly test ho", "Replica zyada hone chahiye the", "SQL ki jagah NoSQL hota to bach jaata"],
    1,
    "GitLab ki public post-mortem ke mutabik unke kai backup tareeke kaam nahi kar rahe the (pg_dump version mismatch ki wajah se chupchaap fail ho raha tha), aur aakhir mein ~6 ghante purane staging snapshot se restore hua, to ~6 ghante ka data khoya. Sabak: replica availability ke liye hai; backups alag, automated, aur unka restore drill regularly. Aur destructive commands pe \"main kis host pe hoon\" ka saaf indicator."
  )],
  "sharding": [Q(
    "Notion (2021) ne apna ek bada Postgres 32 physical databases mein shard kiya, par shards <b>480 logical</b> rakhe (har machine pe 15). 2023 mein 32 se 96 machines kiye. Logical shards physical machines se zyada kyun?",
    ["480 random number hai", "Data ek baar 480 logical shards mein baant diya; machines badhani hon to sirf poore logical shards dusri machine pe move hote hain, har row ka dobara hash/move nahi. 480 ke bahut divisors hain, to kai machine counts pe barabar baant sakte hain", "Har user ka apna shard chahiye tha", "Postgres 480 se zyada tables support nahi karta"],
    1,
    "Notion ke blog (\"Herding elephants\" aur \"The Great Re-shard\") ke mutabik logical shards se resharding = shards ko nayi machines pe copy karna, application ka shard-routing logic wahi rehta hai. 2023 mein 96 machines × 5 logical shards. Sabak: shuru mein hi physical se zyada logical partitions rakhna (jaise consistent hashing ke virtual nodes) baad ka resharding aasaan karta hai."
  )],
  "cap": [Q(
    "GitHub, October 2018: 43 second ke network partition ke baad East aur West Coast databases mein kuch writes alag alag the. GitHub ke saamne do raaste the: (A) jaldi se sab kuch East pe wapas karke site normal karna, kuch writes khone ke risk ke saath; (B) site ko degraded rakhna (purana data dikhna, webhooks/Pages rokna) jab tak saara data milaya na jaaye. Unhone B chuna. CAP ki bhasha mein ye kya hai?",
    ["Availability ko consistency se upar rakha", "Consistency/data integrity ko availability se upar rakha: kuch features band ya stale rakhe, par users ke writes khone nahi diye", "Partition tolerance chhod di", "Ye CAP se juda nahi hai"],
    1,
    "GitHub ki post-incident analysis ke mutabik unhone \"data integrity\" ko priority di aur isliye 24 ghante 11 minute tak service degraded rahi. Ye partition ke waqt (aur uske baad recovery mein) C vs A ka asli faisla tha. Sabak: payments, code, orders jaise data pe log CP jaisa behaviour chahte hain; likes/counters pe AP chal jaata hai. Ye faisla incident se pehle likh ke rakho."
  )],
  "message-queue": [Q(
    "25 November 2020: AWS Kinesis (streaming/queue service) us-east-1 mein ghanton degraded raha, saath mein Cognito, CloudWatch jaisi services bhi. Trigger: front-end fleet mein thodi capacity (naye servers) jodi gayi. Har front-end server <b>har doosre front-end server</b> ke liye ek OS thread banata tha. Kya toota?",
    ["Disk bhar gayi", "Servers badhne pe har server ke threads bhi badhe (N servers × N threads), aur OS ki max-threads limit cross ho gayi; servers apna routing data nahi bana paaye", "Network cable kat gaya", "Messages ka order bigad gaya"],
    1,
    "AWS ki summary ke mutabik naye servers jodne se poori fleet OS thread limit cross kar gayi, aur Kinesis pe depend karne wali services bhi giri. Unhone bade (zyada CPU/memory wale) servers pe jaana tay kiya taaki servers aur threads kam hon, thread limits pe alarms, aur front-end ko cells mein baantna. Sabak: \"har node har node se baat kare\" wala design fleet badhne pe N² ho jaata hai; aur shared queue/stream infra kai services ka single dependency hota hai."
  )],
  "search": [G(
    "Ek e-commerce site sale ke din product search ke liye <code>SELECT * FROM products WHERE title LIKE '%phone%'</code> chala rahi hai (2 crore products). Traffic 10× hua aur DB CPU 100% pe gaya, checkout bhi slow ho gaya. Sahi design change kya hai?",
    ["LIKE ke saath title pe B-tree index bana do, problem khatam", "Search ko alag search engine (Elasticsearch/OpenSearch, inverted index) pe le jao jo DB se events/CDC se sync ho; checkout wala DB search load se alag ho jaata hai", "Products table ko 2 tables mein tod do", "Search band kar do"],
    1,
    "Shuru mein % wala <code>LIKE '%phone%'</code> normal B-tree index use nahi kar sakta, to har query full scan karti hai. Inverted index (word → product ids) isi ke liye bana hai. Saath mein search aur transactions ka load alag ho jaata hai, to search ka spike checkout nahi girata. Kimat: ek aur system aur thoda stale index. Chhote data pe Postgres full-text search (GIN index) bhi kaafi hai. (Ye bahut common pattern hai; Wikipedia ka site search bhi Elasticsearch-based CirrusSearch pe chalta hai.)"
  )],
  "rate-limiting": [Q(
    "Stripe ne apne blog mein bataya ki overload ke waqt wo ek \"load shedder\" chalate hain jo requests ko critical aur non-critical mein baant-ta hai. API overload mein ho to sabse pehle kaunsi requests chhodni chahiye?",
    ["Naye charges (payment) banane wali requests", "Non-critical requests, jaise purane charges ki list/search, taaki payment banane jaise critical kaam ke liye capacity bachi rahe", "Sab requests barabar chhodo", "Sirf mobile apps ki"],
    1,
    "Stripe ke \"Scaling your API with rate limiters\" post mein request rate limiter, concurrent-requests limiter, aur do load shedders describe hain; ek load shedder infrastructure ka ek hissa critical requests ke liye reserve rakhta hai. Sabak: rate limiting sirf abuse rokne ke liye nahi, overload mein graceful degradation ke liye bhi hai: kaam ki priority pehle se tay karo."
  )],
  "observability": [Q(
    "Roblox, 28-31 October 2021: 73 ghante ka outage. Root cause Consul (service discovery cluster) mein ek naye streaming feature aur BoltDB ki performance problem thi. Diagnose karne mein itna time lagne ki ek badi wajah kya thi?",
    ["Engineers chhutti pe the", "Monitoring/telemetry systems khud Consul pe depend karte the, to jab Consul gira to wo dashboards bhi kaam ke nahi rahe jo cause dikhate", "Logs English mein nahi the", "Alerts bahut kam the"],
    1,
    "Roblox ki \"Return to Service\" post-mortem ke mutabik critical monitoring systems unhi affected systems (jaise Consul) pe depend the jo down the, isliye visibility kam thi. Sabak: observability stack ko us infrastructure se alag rakho jise wo monitor karta hai (alag cluster/region/vendor), warna outage ke sabse zaroori waqt aap andhe ho jaate ho."
  )],
  "monolith-micro": [Q(
    "Segment (2018 blog \"Goodbye Microservices\"): data ko 100+ destinations (analytics tools) pe bhejne ke liye har destination ki alag microservice aur alag queue thi. Shared library ka ek change sab services mein deploy karna, aur har service ki alag scaling/on-call bhaari ho gaya. Unhone kya kiya aur kyun?",
    ["Aur microservices banayi", "Destinations ko ek service (monolith) mein jod diya: ek codebase, ek deploy, shared code ek jagah; operational kaam kam hua aur developer productivity badhi", "Sab kuch serverless kar diya", "Destinations band kar diye"],
    1,
    "Segment ke engineers ne likha ki microservices ka fayda (alag scaling, isolation) unke case mein kam tha aur kimat (har service ka operations, library versions ka drift) zyada. Ek service mein laane ke baad tests aur deploys simple hue. Sabak: microservices tab jab teams/ownership aur scaling sach mein alag hon; warna modular monolith aksar behtar hai. (Prime Video 2023 ka case bhi isi jaisa tha.)"
  )],
  "reliability": [Q(
    "7 December 2021: AWS us-east-1 mein internal network ke devices congestion se overwhelm hue aur kai AWS services ghanton degraded rahi. AWS ki summary ke mutabik delay aur errors aane pe clients ne aur connection attempts aur retries kiye. Retries ne kya kiya, aur kya chahiye tha?",
    ["Retries ne problem jaldi theek kar di", "Retries ne already congested network pe aur load daala (retry storm), recovery dheemi hui; exponential backoff + jitter, retry budget aur circuit breakers chahiye", "Retries ka koi asar nahi hota", "Timeouts badha dene chahiye the bas"],
    1,
    "AWS ki summary (event 12721) ke mutabik ek automated scaling activity ne internal network mein connection activity ka surge banaya, aur latency/errors ki wajah se aur connection attempts/retries hue, jo congestion ko aur badhate gaye. Sabak: retry tabhi madad karta hai jab failure temporary aur chhota ho; overload mein bina backoff ke retry aag mein ghee hai. Isliye AWS Builders' Library bhi backoff + jitter aur retry limits recommend karti hai."
  )],
  "data-patterns": [G(
    "Order service pehle DB mein order save karti hai, phir Kafka pe <code>OrderPlaced</code> event bhejti hai. Ek din deploy ke beech service crash hui: order DB mein aa gaya par event kabhi nahi gaya, to warehouse ne kabhi pack nahi kiya. Ye kaunsi problem hai aur standard fix?",
    ["Kafka slow tha", "Dual-write problem: do alag systems mein likhna atomic nahi. Fix: transactional outbox (order + event ek hi DB transaction mein, phir relay/CDC Kafka pe bheje)", "Pehle event bhejo phir DB mein likho, problem khatam", "2PC hamesha use karo"],
    1,
    "Order pehle event baad mein, ya event pehle order baad mein: dono order mein crash pe ek system dusre se alag ho jaata hai. Outbox mein event usi DB transaction mein ek table mein likha jaata hai; ek alag process (ya Debezium jaisa CDC) use padh ke Kafka pe bhejta hai, at-least-once, isliye consumers idempotent hon. 2PC kaam karta hai par Kafka/DB ke beech bhaari aur kam support. Ye microservices ka bahut common production bug hai."
  )],
  "fanout": [Q(
    "3 August 2013: Japan mein ek TV movie ke dauraan Twitter pe ek second mein 143,199 tweets aaye, normal average (~5,700/s) ka ~25×. Twitter ne bataya ki users ko koi rukawat nahi dikhi. Fan-out on write wale system mein is tarah ka spike kaise sambhalta hai?",
    ["Har tweet ko post request ke andar hi saare followers ki timeline mein synchronously likho", "Tweet save karke post request turant khatam; fan-out queue ke through async workers karte hain jo spike ke dauraan backlog jama karke apni speed se nikaalte hain (timeline thodi der se update)", "Spike ke dauraan tweets reject karo", "Sab users pull model pe daal do"],
    1,
    "Twitter Engineering ke blog (\"New Tweets per second record, and how!\") ke mutabik unhone Ruby monolith se JVM services aur decoupled architecture pe move kiya tha, jisse ye peak sambhala. Queue + async fan-out ka matlab hai write path aur timeline update alag scale hote hain; kimat: spike mein followers ko tweet kuch seconds late dikh sakta hai (eventual consistency)."
  )],
  "realtime": [G(
    "Ek chat app ke 50 lakh users WebSocket se jude hain. Raat ko deploy hua aur saare connection servers ek saath restart hue. Turant sab clients ne reconnect kiya aur login/auth service gir gayi, jisse aur reconnect attempts hue. Ye kya hai aur fix?",
    ["WebSocket ki jagah polling karo", "Reconnect storm (thundering herd): clients random jitter + exponential backoff ke saath reconnect karein, servers ek ek karke drain/restart hon, aur auth pe rate limit/caching", "Users ko logout kar do", "Ek hi bada server rakho"],
    1,
    "Lakhon long-lived connections ek saath tootein to unka reconnect ek DDoS jaisa spike hai. Jitter se reconnects kuch minutes mein phail jaate hain; rolling restart (pehle naye connections band, phir purane ko gradually move) se ek waqt mein sirf thode clients reconnect karte hain. Ye realtime systems (chat, gaming, trading) ki common production problem hai, isliye client SDKs mein backoff + jitter default hona chahiye."
  )],
  "framework": [Q(
    "Pokémon GO (2016) ke launch pe traffic estimate ka ~50× aaya. Interview framework ke kaunse steps is jaisi situation ke liye sabse zyada kaam aate hain?",
    ["Seedha components draw karna, numbers skip", "Requirements + estimation se bottleneck pehchaanna, phir design mein scale-out ka raasta aur \"agar 10× ho gaya to kya tootega\" wala deep dive", "Sirf database chunna", "Pehle code likhna"],
    1,
    "Framework ka maqsad ye nahi ki exact number sahi ho; maqsad hai ki aap batao kis cheez pe system tootega aur us waqt kya karoge (stateless tiers, cache, queue, sharding). Google Cloud ke Pokémon GO blog mein bhi yahi dikhta hai: estimate galat tha, par architecture scale-out ho sakta tha. Interview mein \"10× pe kya badlega\" khud bolna strong signal hai."
  )],
  "url-shortener": [Q(
    "January 2021: Parler (social network) band hone se pehle researchers ne uske public posts aur videos ka bada hissa download kar liya. Reports ke mutabik posts ke URLs/IDs sequential the aur bulk requests pe khaas rok-tok nahi thi. URL shortener design se iska kya rishta hai?",
    ["Kuch nahi", "Sequential, guessable IDs + rate limit na hona = koi bhi script se saare items gin ke nikaal sakta hai; private/unlisted content ke liye unguessable IDs (random ya scrambled), rate limits, aur auth checks chahiye", "IDs hamesha lambe hone chahiye", "Database encrypt karna kaafi hai"],
    1,
    "Sequential IDs (1, 2, 3...) pe script bas number badha ke sab kuch dekh sakti hai (enumeration). Isliye lesson mein codes ko scramble kiya ya random rakha. Par yaad rakho: unguessable ID security ka ek hissa hai, poora nahi; jo cheez private hai uspe permission check aur rate limiting bhi chahiye."
  )],
  "rate-limiter-hld": [Q(
    "Stripe ke rate limiter blog mein ek \"concurrent requests limiter\" bhi hai, normal \"requests per second\" limiter ke alawa. Ek customer ki script ek bahut mehenga endpoint (jo har call pe kai seconds CPU khata hai) 5 requests/sec pe call karti hai: rate limit ke andar, par server CPU full. Kaunsa limiter isko pakdega?",
    ["Requests/sec limiter, limit 2 kar do", "Concurrent requests limiter: ek waqt pe ek customer ke kitne requests <i>chal rahe</i> hain (in-flight) usko cap karo; mehenge, lambe requests pe yahi asli resource naapta hai", "Kuch nahi ho sakta", "Sirf IP block karo"],
    1,
    "Requests/sec ye nahi dekhta ki har request kitni der chalti hai. 5 req/s × 4 s = har waqt ~20 requests chal rahi hain. Stripe ne bataya ki concurrent-requests limiter un resource-intensive endpoints ke liye hai jahan clients retries se load aur badha dete hain. Sabak: limit us cheez pe lagao jo sach mein khatam hoti hai (CPU time, connections, tokens), sirf request count pe nahi. Yahi idea LLM APIs ke tokens/min limits mein hai."
  )],
  "notification": [Q(
    "17 June 2021: HBO Max ne galti se \"Integration Test Email #1\" naam ka ek test email apne bahut saare asli subscribers ko bhej diya; baad mein company ne public sorry bola. Notification system design mein ise kaise rokte?",
    ["Email bhejna band karo", "Non-production environment ka asli user data/lists tak access hi na ho (sirf allowlist/test inboxes), bulk/marketing sends pe approval + chhote batch se shuru (canary), aur ek kill switch", "Sirf SMS use karo", "Test emails ka subject behtar rakho"],
    1,
    "Notification system ek \"broadcast\" button hai: ek galti seedha laakhon logon tak. Isliye: test/staging mein provider credentials aise ho ki sirf allowlisted addresses pe hi jaa sake, production bulk sends pe dusre insaan ka approval, pehle 1% ko bhejo aur metrics dekho, aur turant rokne ka switch. Ye guard rails retries/DLQ jitne hi zaroori hain."
  )],
  "chat": [Q(
    "Discord (2017 blog \"How Discord Stores Billions of Messages\"): Cassandra mein messages ka partition key sirf <code>channel_id</code> rakha jaata to ek purana, bahut active channel ka ek partition saalon mein bahut bada ho jaata. Unhone partition key kya rakha?",
    ["Sirf message_id", "<code>(channel_id, bucket)</code>, jahan bucket ek fixed time window hai (unke case mein 10 din), taaki har partition ka size limited rahe aur \"latest messages\" ek ya do partitions se aa jaayein", "user_id", "Random UUID"],
    1,
    "Discord ne likha ki unhone partitions ko lagbhag 100 MB se neeche rakhne ke liye time buckets choose kiye. Kimat: kisi channel ka bahut purana history padhna ho to kai buckets (partitions) query karne padte hain, jo rare hai. Sabak: wide-column DB mein partition key ka size growth pehle se socho."
  )],
  "twitter": [Q(
    "Twitter ke shuruaati dinon (2007-2008) mein site load pe baar baar girti thi aur \"fail whale\" error page famous ho gaya. Maan lo aapka read-heavy app har timeline request pe database mein followees ke tweets join/merge karta hai, aur reads writes se ~50× zyada hain. Lesson ke hisaab se core fix kya hai?",
    ["Zyada bade database servers", "Timeline padhne ka kaam likhne ke waqt pe shift karna (fan-out on write + in-memory timelines), aur bade accounts ke liye hybrid", "Users ko kam follow karne do", "Sab kuch ek server pe rakhna"],
    1,
    "Read-heavy system mein har read pe join/merge sabse mehenga hai. Twitter ne aage chal ke timelines Redis mein precompute ki (Raffi Krikorian ki 2013 talk), aur services ko JVM pe le gaye. Celebrity accounts ke liye fan-out bahut bada hota hai, isliye hybrid. Ye wahi sequence hai jo is lesson mein stages mein dikhaya."
  )],
  "youtube": [Q(
    "December 2014: PSY ka \"Gangnam Style\" video YouTube pe 2,147,483,647 views ke paas pahuncha. YouTube ne bataya ki unhe view counter upgrade karna pada. Kyun?",
    ["Video delete hone wala tha", "Counter signed 32-bit integer tha, jiski max value 2³¹ − 1 = 2,147,483,647 hai; isse aage overflow hota, isliye 64-bit counter kiya", "CDN ka bandwidth khatam ho gaya", "Database disk bhar gayi"],
    1,
    "Ye ek seedha estimation lesson hai: \"kitna bada ho sakta hai?\" Kisi bhi counter, id ya size ke liye data type chunte waqt growth ka worst case socho. 64-bit signed max ~9.2 × 10¹⁸ hai. Isi tarah Snowflake/URL shortener ke IDs 64-bit hote hain."
  )],
  "chatgpt": [Q(
    "20 March 2023: ChatGPT ko kuch ghante band karna pada kyunki kuch users ko <b>doosre users</b> ki chat history ke titles dikhne lage, aur ek 9 ghante ki window mein ~1.2% Plus subscribers ki kuch payment details (naam, email, address, card type, expiry date aur last 4 digits) doosron ko dikh sakti thi. OpenAI ke mutabik wajah Redis client library (redis-py) ka ek bug tha jo cancelled requests ke baad connection pe galat response chhod deta tha. Design sabak?",
    ["Redis kabhi use mat karo", "Shared cache/connection pool se aaya data user ka hi hai, ye verify karo (key mein user id + response pe owner check), cancellations/timeouts pe connection discard karo, aur sensitive data ka cache mein rehna kam karo", "Users ko kam requests karne do", "Chat history feature hata do"],
    1,
    "OpenAI ki post (\"March 20 ChatGPT outage: Here's what happened\") ke mutabik ek server change se request cancellations badhe, jisse library ka race condition zyada trigger hua; unhone bug fix ko upstream bheja aur extra checks lagaye ki returned data requesting user ka hi ho. Sabak: multi-tenant system mein ek user ka data doosre ko dikhna sabse bura failure hai; defense in depth: har layer pe ownership check."
  )],
  "uber": [Q(
    "Uber ne 2018 mein H3 open source kiya: duniya ko <b>hexagon</b> cells mein baantne wala grid. Surge pricing aur supply-demand analysis ke liye square grid ki jagah hexagon kyun?",
    ["Hexagon dekhne mein achha lagta hai", "Hexagon ke saare 6 padosi center se barabar door hote hain (square mein kone wale padosi door hote hain), to \"aas-paas ke cells\" aur smoothing ka hisaab barabar aur simple rehta hai", "Hexagon se GPS zyada accurate hota hai", "Square grid banana namumkin hai"],
    1,
    "Uber ke H3 blog ke mutabik hexagons movement aur neighbours ke analysis ke liye isliye achhe hain ki har neighbour ek jaisa hai, aur H3 hierarchical bhi hai (bade cell ke andar chhote). Kimat: hexagons perfectly chhote hexagons mein nahi bant-te (child cells approximately contained), aur ek extra library. Driver ke real-time \"nearby\" lookup ke liye geohash/Redis GEO bhi bilkul valid hai, jaisa lesson mein dikhaya."
  )]
};

const REFS = {
  "request-flow": ["More details about the October 4 outage", "Meta Engineering", "https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/"],
  "latency-numbers": ["October 21 post-incident analysis", "GitHub", "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/"],
  "estimation": ["Bringing Pokémon GO to life on Google Cloud", "Google Cloud", "https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud"],
  "framework": ["Bringing Pokémon GO to life on Google Cloud", "Google Cloud", "https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud"],
  "scaling": ["Scaling Hotstar.com for 25 million concurrent viewers (re:Invent 2019, CMY302)", "AWS / Hotstar", "https://d1.awsstatic.com/events/reinvent/2019/Scaling_Hotstar.com_for_25_million_concurrent_viewers_CMY302.pdf"],
  "load-balancer": ["Summary of the December 24, 2012 Amazon ELB Service Event", "AWS", "https://aws.amazon.com/message/680587/"],
  "api-gateway": ["Details of the Cloudflare outage on July 2, 2019", "Cloudflare", "https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/"],
  "cdn": ["Summary of June 8 outage", "Fastly", "https://www.fastly.com/blog/summary-of-june-8-outage"],
  "sql-vs-nosql": ["How Discord Stores Trillions of Messages", "Discord", "https://discord.com/blog/how-discord-stores-trillions-of-messages"],
  "indexing": ["PostgreSQL docs: CREATE INDEX (Building Indexes Concurrently)", "PostgreSQL", "https://www.postgresql.org/docs/current/sql-createindex.html"],
  "replication": ["Postmortem of database outage of January 31", "GitLab", "https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/"],
  "sharding": ["The Great Re-shard: adding Postgres capacity (again) with zero downtime", "Notion", "https://www.notion.com/blog/the-great-re-shard"],
  "cap": ["October 21 post-incident analysis", "GitHub", "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/"],
  "message-queue": ["Summary of the Amazon Kinesis Event in the Northern Virginia (US-EAST-1) Region", "AWS", "https://aws.amazon.com/message/11201/"],
  "rate-limiting": ["Scaling your API with rate limiters", "Stripe", "https://stripe.com/blog/rate-limiters"],
  "rate-limiter-hld": ["Scaling your API with rate limiters", "Stripe", "https://stripe.com/blog/rate-limiters"],
  "observability": ["Roblox Return to Service 10/28-10/31, 2021", "Roblox", "https://corp.roblox.com/newsroom/2022/01/roblox-return-to-service-10-28-10-31-2021"],
  "reliability": ["Summary of the AWS Service Event in the Northern Virginia (US-EAST-1) Region (Dec 2021)", "AWS", "https://aws.amazon.com/message/12721/"],
  "fanout": ["New Tweets per second record, and how!", "Twitter Engineering", "https://blog.x.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how"],
  "chat": ["How Discord Stores Billions of Messages", "Discord", "https://discord.com/blog/how-discord-stores-billions-of-messages"],
  "chatgpt": ["March 20 ChatGPT outage: Here's what happened", "OpenAI", "https://openai.com/index/march-20-chatgpt-outage/"],
  "uber": ["H3: Uber's Hexagonal Hierarchical Spatial Index", "Uber", "https://www.uber.com/us/en/blog/h3/"]
};

const esc = s => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
let n = 0;
for (const [id, quizzes] of Object.entries(QUIZ)) {
  const file = `js/data/hld/${id}.js`;
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("📰 <b>Real incident") || src.includes("🏭 <b>Production problem")) continue;
  const blocks = quizzes.map(x =>
    `    {\n      type: "quiz",\n      q: \`${esc(x.q)}\`,\n      options: [\n${x.options.map(o => `        \`${esc(o)}\``).join(",\n")}\n      ],\n      answer: ${x.answer},\n      why: \`${esc(x.why)}\`\n    }`).join(",\n");
  const end = src.lastIndexOf("\n  ],\n  references");
  if (end < 0) { console.log("❌ blocks end nahi mila:", id); continue; }
  // last block ke baad comma + quiz
  const before = src.slice(0, end).replace(/\s*$/, "");
  src = before + ",\n" + blocks + src.slice(end);
  const r = REFS[id];
  if (r && !src.includes(r[2])) src = src.replace("references: [", `references: [\n    { title: ${JSON.stringify(r[0])}, by: ${JSON.stringify(r[1])}, url: ${JSON.stringify(r[2])}, type: "article" },`);
  fs.writeFileSync(file, src);
  n++;
}
console.log("quizzes added to", n, "lessons");
