// Caching (Redis)
registerLesson("hld", "caching", {
  why: `Read-heavy systems (zyaadatar systems) ko scale karne ka sabse sasta tareeka cache hai. Par cache ke saath naye problems aate hain: stale data, invalidation, stampede. Interview mein 'cache lagaunga' kaafi nahi; kahan, kaunsa pattern, TTL kya, aur failure pe kya, ye bolna hota hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Cache kahan kahan</h2>
        `
    },
    {
      type: "flow",
      title: "Cache-aside, update aur stampede",
      nodes: [
        {
          id: "client",
          label: "Clients",
          icon: "👥",
          x: 90,
          y: 160,
          kind: "client"
        },
        {
          id: "app1",
          label: "App 1",
          icon: "🖥️",
          x: 320,
          y: 50,
          kind: "service"
        },
        {
          id: "app2",
          label: "App 2",
          icon: "🖥️",
          x: 320,
          y: 160,
          kind: "service"
        },
        {
          id: "app3",
          label: "App 3",
          icon: "🖥️",
          x: 320,
          y: 270,
          kind: "service"
        },
        {
          id: "redis",
          label: "Redis",
          icon: "⚡",
          x: 620,
          y: 100,
          kind: "cache"
        },
        {
          id: "db",
          label: "Database",
          icon: "🗄️",
          x: 620,
          y: 250,
          kind: "data"
        },
        {
          id: "cdn",
          label: `CDN + browser
static files`,
          icon: "🛰️",
          x: 100,
          y: 45,
          kind: "cache",
          w: 170
        }
      ],
      edges: [
        { from: "client", to: "cdn", both: true },
        {
          from: "client",
          to: "app1", both: true
        },
        {
          from: "client",
          to: "app2", both: true
        },
        {
          from: "client",
          to: "app3", both: true
        },
        {
          from: "app1",
          to: "redis",
          both: true
        },
        {
          from: "app2",
          to: "redis",
          both: true
        },
        {
          from: "app3",
          to: "redis",
          both: true
        },
        {
          from: "app1",
          to: "db",
          both: true,
          dashed: true
        },
        {
          from: "app2",
          to: "db",
          both: true,
          dashed: true
        },
        {
          from: "app3",
          to: "db",
          both: true,
          dashed: true
        }
      ],
      steps: [
        {
          title: "Cache hit (~1ms)",
          html: "<p>App pehle Redis se poochta hai. Mil gaya to DB tak jaane ki zaroorat nahi.</p>",
          path: ["client","app2","redis","app2","client"],
          active: ["redis"],
          dim: ["db"]
        },
        {
          title: "Cache miss: DB se laao, cache mein daalo",
          html: "<p>Redis mein nahi: DB se padho (~5-10ms), phir Redis mein TTL ke saath set karo, taaki agli baar hit ho.</p>",
          path: ["app2","redis","app2","db","app2","redis"],
          active: ["db","redis"]
        },
        {
          title: "Update: DB update, phir cache key DELETE",
          html: "<p>Naya price DB mein likha, phir cache se key hata di (set nahi). Agla read DB se fresh value laayega.</p>",
          path: ["app1","db","app1","redis"],
          active: ["db"]
        },
        {
          title: "Stampede: hot key expire hui",
          html: "<p>Trending product ki key expire hui aur hazaaron requests ek saath miss hui: sab DB pe toot padi.</p>",
          paths: [
            ["app1","db"],
            ["app2","db"],
            ["app3","db"]
          ],
          fail: ["db"],
          color: "#c92a2a"
        },
        {
          title: "Fix: single-flight / lock",
          html: `<p>Sirf ek request DB jaati hai (lock / single-flight), baaki uske result ka wait karti hain ya thoda purana value lauta deti hain. TTL mein jitter bhi.</p>`,
          paths: [
            ["app1","db","app1","redis"],
            ["app2","redis"],
            ["app3","redis"]
          ],
          active: ["redis"]
        },
        {
          title: "Static content: CDN aur browser cache",
          html: "<p>Images, JS, CSS app tak aate hi nahi: CDN aur browser cache se. App cache (Redis) sirf dynamic data ke liye.</p>",
          path: ["client","cdn","client"],
          active: ["cdn"],
          dim: ["app1","app2","app3","redis","db"]
        }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Patterns</h2>
        <table>
          <tr><th>Pattern</th><th>Read</th><th>Write</th><th>Trade-off</th></tr>
          <tr><td><b>Cache-aside</b> (lazy) ⭐</td><td>App pehle cache; miss → DB → cache mein daalo</td><td>DB update, phir cache key <b>delete</b></td><td>Simple, sirf zaroori data cache. Pehla read slow (miss).</td></tr>
          <tr><td><b>Write-through</b></td><td>Cache se</td><td>Cache + DB dono ek saath (sync)</td><td>Cache hamesha fresh; writes slow; kabhi na padha data bhi cache mein</td></tr>
          <tr><td><b>Write-back</b> (write-behind)</td><td>Cache se</td><td>Sirf cache; DB baad mein async batch</td><td>Writes bahut tez; cache crash = data loss risk</td></tr>
          <tr><td><b>Read-through</b></td><td>Cache khud DB se laata hai (library)</td><td>-</td><td>Cache-aside jaisa, logic cache layer mein</td></tr>
        </table>
        <p><b>Update pe delete kyun, set kyun nahi?</b> Do writes race karein to set ka order ulta ho sakta hai (cache mein purani value). Delete karne se agla read DB se fresh laata hai.</p>
        <h2>Eviction aur TTL</h2>
        <ul>
          <li><b>TTL</b> (time to live): har key ki expiry. Stale data ki upper limit bhi yahi.</li>
          <li><b>Eviction</b> jab memory full: LRU (Redis <code>allkeys-lru</code>), LFU (<code>allkeys-lfu</code>), ya sirf TTL wali keys (<code>volatile-*</code>).</li>
        </ul>
        <h2>3 classic problems</h2>
        <table>
          <tr><th>Problem</th><th>Kya</th><th>Fix</th></tr>
          <tr><td><b>Stampede</b> (thundering herd)</td><td>Hot key expire hui, 10,000 requests ek saath DB pe</td><td>Lock/single-flight (ek request DB jaaye, baaki wait), TTL mein random jitter, early refresh</td></tr>
          <tr><td><b>Penetration</b></td><td>Exist na karne wali keys (attack) har baar DB tak</td><td>"null" bhi chhoti TTL ke saath cache karo, Bloom filter</td></tr>
          <tr><td><b>Avalanche</b></td><td>Bahut keys ek saath expire / Redis down</td><td>TTL jitter, Redis replicas/cluster, DB ke saamne rate limit / circuit breaker</td></tr>
        </table>`
    },
    {
      type: "tip",
      html: `🧪 <b>Simulator mein khud dekho:</b> 40,000 RPS (90% reads) pe errors &lt; 1% aur latency &lt; 80ms. DB ki capacity sirf 6,000 RPS hai. Pehle cache ke bina RPS badha ke dekho DB kab toot-ta hai.`
    },
    {
      type: "sim",
      id: "sim-cache",
      title: "Cache se DB ko bachao",
      config: {
        rps: 5000,
        maxRps: 60000,
        readRatio: 0.9,
        appCap: 2000,
        dbCap: 6000,
        servers: 20,
        lb: true,
        controls: ["rps","readRatio","servers","cache","hitRatio"]
      }
    },
    {
      type: "text",
      html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> 40k RPS = 36k reads + 4k writes. Bina cache DB pe 40k aate hain (capacity 6k): toot gaya. 90% hit pe DB pe 3.6k reads + 4k writes = 7.6k: abhi bhi overload. ~97% hit pe 1.1k + 4k ≈ 5.1k (85% utilization) aur ~28 app servers ke saath latency 80ms ke andar aati hai. Seekh: cache sirf <b>reads</b> bachata hai, 4k writes DB pe hi jaate hain aur yahi asli limit hai. Real design mein yahan write scaling (sharding / queue) bhi lagta. Pehle read:write ratio dekho, phir bolo ki cache kaafi hai ya nahi.</div>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Product price DB mein badla, par users ko 10 minute purana price dikh raha hai. Kyun ho sakta hai, aur kaise theek karoge (pattern + TTL + order of operations)?</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Cache <b>invalidate nahi hua</b> / TTL lamba</li><li>Update pe: <b>DB update, phir cache delete</b> (set nahi)</li><li>Race ke liye: <b>chhoti TTL</b> safety net / delayed double delete / versioning</li><li>Kai layers (CDN, local cache) bhi: unhe bhi invalidate / chhoti TTL</li></ul></div>
          <div class="qa-a"><p>Wajahen: update ke baad cache delete nahi hua, TTL 10 min hai, ya kisi aur layer (local in-process cache, CDN) mein purani copy. Fix: write path <b>DB commit → cache key delete</b>. Race (delete ke baad koi purana read wapas cache bhar de) ke liye: short TTL safety net, ya delete thodi der baad dobara (delayed double delete), ya CDC (DB change events) se invalidation. Price jaise sensitive data pe checkout ke waqt hamesha DB se verify karo: cache sirf display ke liye.</p></div>
        </div>`
    },
    {
      type: "text",
      html: `
        <div class="decision-card">
        <h2>Faisla card: kab lagao, kab nahi</h2>
        <table>
          <tr><th>Kab lagao</th><td>Read-heavy, same data baar baar padha jaata hai, aur thoda purana (seconds/minutes) data chal jaata hai.</td></tr>
          <tr><th>Kab nahi</th><td>Har read alag data ho (hit ratio kam), writes zyada hon, ya har read pe bilkul latest value chahiye (bank balance).</td></tr>
          <tr><th>Kimat (cost)</th><td>Stale data, invalidation ka logic, cache stampede, extra memory ka kharcha, aur ek aur system jo gir sakta hai (DB ko cache ke bina bhi zinda rehna chahiye).</td></tr>
          <tr><th>Alternatives</th><td>Read replicas (har miss pe bhi fresh, par mehenge), DB ke andar materialized view, CDN (static/public responses), app process ke andar local cache (sabse tez, par har server ka alag).</td></tr>
        </table>
        <div class="tip-box">🏭 <b>Production mein:</b> Facebook ka NSDI 2013 paper "Scaling Memcache at Facebook" batata hai ki unhone memcached ko arbon requests/sec tak le jaane ke liye <b>leases</b> use kiye: miss pe sirf ek client ko DB jaane ki permission, baaki thoda wait karein. Yahi cache stampede ka production fix hai.</div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Cache bolte hi 4 cheezein saath bolo: <i>kya cache (hot reads), pattern (cache-aside), TTL + invalidation, aur hit ratio target.</i> Bonus: stampede ke liye single-flight/jitter.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> 23 September 2010: Facebook ~2.5 ghante down raha. Ek configuration value ki persistent copy (database mein) badli, aur wo invalid maani gayi. Har client ne cache mein invalid value dekhi aur use "theek" karne ke liye seedha database se padha, par DB mein bhi wahi value thi. Database pe lakhon queries/sec aa gayin, wo slow hua, errors aaye, aur errors ke wajah se aur cache entries hatin, to aur queries. Ye kaunsa pattern hai aur fix kya hai?`,
      options: [
        `Cache ka size chhota tha`,
        `Thundering herd + feedback loop: miss/invalid pe har client seedha DB jaata hai; fix: request coalescing/lease (ek hi client DB jaaye), backoff, aur DB ko overload se bachana`,
        `Database galat tha, NoSQL lena chahiye tha`,
        `TTL zyada tha`
      ],
      answer: 1,
      why: `Facebook ke engineering note mein bataya gaya ki automated "fix the invalid value" logic hi feedback loop ban gaya; aakhir mein unhe us database cluster pe traffic rokna pada (site band) taaki loop toote. Baad mein Facebook ke memcache paper (NSDI 2013) mein <b>leases</b> describe hue: miss pe sirf ek client ko DB jaane ki permission. Sabak: cache ke peeche ka DB tabhi bachta hai jab misses par control ho.`
    }
  ],
  references: [
    { title: "Scaling Memcache at Facebook (NSDI 2013)", by: "Nishtala et al.", url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala", type: "article" },
    {
      title: "Hello Interview: Caching",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/core-concepts/caching",
      type: "course"
    },
    {
      title: "Redis docs (eviction policies, TTL)",
      by: "Redis",
      url: "https://redis.io/docs/latest/",
      type: "docs"
    },
    {
      title: "Arpit Bhayani (YouTube): caching deep dives",
      by: "Arpit Bhayani",
      url: "https://www.youtube.com/@AsliEngineering",
      type: "video"
    }
  ]
});
