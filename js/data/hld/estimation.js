// Back-of-the-envelope estimation
registerLesson("hld", "estimation", {
  why: `Estimation se pata chalta hai ki design ko kitna bada hona chahiye: ek server kaafi hai ya 100, ek DB ya sharding, cache mein kitna data aayega. Interviewer exact answer nahi, sahi order of magnitude aur saaf assumptions dekhta hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Yaad rakhne layak shortcuts</h2>
        <table>
          <tr><th>Fact</th><th>Approx</th></tr>
          <tr><td>1 din mein seconds</td><td>86,400 ≈ <b>~10⁵</b> (1 lakh maan lo)</td></tr>
          <tr><td>1 million requests / din</td><td>≈ <b>~12 QPS</b> average</td></tr>
          <tr><td>Peak traffic</td><td>Average ka <b>2-5×</b> (event pe 10×)</td></tr>
          <tr><td>1 KB × 1 million</td><td>1 GB</td></tr>
          <tr><td>1 MB × 1 million</td><td>1 TB</td></tr>
          <tr><td>Powers</td><td>10³ thousand (KB), 10⁶ million (MB), 10⁹ billion (GB), 10¹² trillion (TB), 10¹⁵ PB</td></tr>
        </table>
        <h2>Template</h2>
        <ol>
          <li><b>DAU</b> (daily active users) se shuru: "100 million DAU maan lete hain."</li>
          <li><b>Actions per user per day</b>: har user 2 tweets likhe, 100 tweets padhe.</li>
          <li><b>QPS</b> = DAU × actions / 86,400. <b>Peak</b> = 2-3× average.</li>
          <li><b>Read:write ratio</b>: design ka sabse important number (cache, replicas, fan-out).</li>
          <li><b>Storage</b> = writes/day × size × retention (saal × 365).</li>
          <li><b>Bandwidth</b> = QPS × response size.</li>
        </ol>
        <h3>Example: Twitter jaisa</h3>
        <pre class="code-static">DAU 200M, har user 2 tweets/day, 100 timeline reads/day
Write QPS = 200M × 2 / 86400 ≈ 400M / 10^5 ≈ 4,600  → peak ~10k
Read  QPS = 200M × 100 / 86400 ≈ 2 lakh+            → peak ~5 lakh
Read : write ≈ 50 : 1  → read-heavy → cache + fan-out design
Storage: 400M tweets/day × ~300 bytes ≈ 120 GB/day text → ~45 TB / saal (media alag, kahin zyada)</pre>
        <p>Rounding aggressive karo (86,400 → 10⁵), assumptions zor se bolo, aur end mein sanity check: "5 lakh QPS ek server pe nahi chalega, isliye horizontal scaling + cache."</p>`
    },
    {
      type: "text",
      html: `
        <div class="qa">
          <div class="qa-q">📌 <b>Situation:</b> Instagram jaisa: <b>500M DAU</b>, har user din mein <b>1 photo</b> upload kare (avg 2 MB), aur <b>50 photos</b> dekhe. Write QPS, read QPS, aur 1 din ki photo storage estimate karo (steps ke saath).</div>
          
          <div class="qa-points"><b>Main points:</b><ul><li>Write QPS ≈ 500M / 10⁵ ≈ <b>~5,000-6,000</b> (peak ~15k)</li><li>Read QPS ≈ 25B / 10⁵ ≈ <b>~2.5-3 lakh</b></li><li>Storage/day ≈ 500M × 2MB = <b>1 PB</b></li><li>Read-heavy (~50:1) → CDN + cache</li></ul></div>
          <div class="qa-a"><pre class="code-static">Writes: 500M/day ÷ 86,400 ≈ 5,800 QPS  (peak ~15-20k)
Reads : 500M × 50 = 25B/day ÷ 86,400 ≈ 2.9 lakh QPS (peak ~6-9 lakh)
Storage: 500M × 2 MB = 1,000 TB = ~1 PB / day  (replication 3× → ~3 PB)</pre><p>Nateeja: photos object storage (S3) + CDN pe (DB mein nahi), read-heavy isliye CDN cache hit ratio sabse important, metadata (kaun, kab, caption) alag DB mein jo chhota hai. Numbers ne design ka shape bata diya.</p></div>
        </div>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> Estimation 3-5 minute ka kaam hai. Har number ke baad ek line ka <b>design implication</b> bolo ("read QPS 3 lakh → cache zaroori", "1 PB/day → object storage"). Bina implication ke numbers bekaar hain.`
    },
    {
      type: "quiz",
      q: `📰 <b>Real incident:</b> Pokémon GO (July 2016): Niantic aur Google Cloud ne ek target traffic aur uska ~5× "worst case" socha tha. Launch pe asli traffic target ka ~50× aaya. Estimation ke baare mein sahi sabak kya hai?`,
      options: [
        `Estimation bekaar hai, launch ke baad hi dekhna chahiye`,
        `Estimate ek starting point hai: system ko aisa banao ki estimate galat ho to bhi horizontally badh sake (stateless tiers, managed scalable storage), aur worst case se upar load test karo`,
        `Hamesha 50× capacity pehle se kharido`,
        `Sirf ek bahut bada server le lo`
      ],
      answer: 1,
      why: `Google Cloud ke blog ("Bringing Pokémon GO to life on Google Cloud") ke mutabik traffic worst case ka bhi ~10 guna nikla. Game isliye bach paaya ki backend containers (GKE) aur managed Datastore pe tha, jinhe Google ke engineers ke saath milke tezi se badhaya gaya. 50× capacity pehle kharidna paisa barbaad karta; estimation ka asli kaam hai bottleneck pehchaanna aur scale-out ka raasta pehle se rakhna.`
    }
  ],
  references: [
    { title: "Bringing Pokémon GO to life on Google Cloud", by: "Google Cloud", url: "https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud", type: "article" },
    {
      title: "System Design Interview Vol. 1, Ch. 2: Back-of-the-envelope estimation",
      by: "Alex Xu",
      url: "https://bytebytego.com/",
      type: "book"
    },
    {
      title: "Hello Interview: System Design in a Hurry",
      by: "Hello Interview",
      url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      type: "course"
    }
  ]
});
