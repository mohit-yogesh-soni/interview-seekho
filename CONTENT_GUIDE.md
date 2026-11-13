# Content Guide (lesson likhne ke rules)

Ye guide har lesson likhne wale ke liye hai. Isko poora padho, phir likho.

## 1. Audience aur bhasha
- Padhne wala: experienced engineer jo company switch karna chahta hai, par in topics mein **noob maan ke** chalo.
  Zero se samjhao, par end tak **senior interview level** ki depth pahuncho (trade-offs, follow-up questions).
- **Hinglish** (Roman script Hindi + English technical terms). Technical words English mein hi rakho
  (thread, lock, cache, index, latency). Example: "Cache DB ke saamne ek fast layer hai, jo baar baar padhe jaane wale data ko RAM mein rakhta hai."
- Chhote sentences. Ek sentence = ek idea. Pehle "kyun" (problem), phir "kya" (concept), phir "kaise" (code/design).
- Har concept ke saath **real example** (Swiggy, Zomato, IRCTC, WhatsApp, YouTube, UPI jaisi cheezein theek hain).
- Fluff nahi: "bahut important", "game changer" jaise words mat likho. Number, mechanism aur example do.

## 1b. Ratna nahi, khud nikaalna (derive karna) — har lesson ka core rule
Goal: padhne wala interview mein **naya problem dekh ke khud design nikaal sake**, yaad kiya hua answer na sunaye.
- **Problem pehle, naam baad mein.** Pehle ek chhoti real situation do jisme pain dikhe (bura code, toota system).
  Pattern/component ka naam tab aaye jab padhne wala khud solution ke paas pahunch chuka ho.
- **Guided discovery:** solution se pehle 1-2 "think" / "pick" block: "Is code mein kya dikkat hai?", "Naya payment type
  jodna ho to kitni jagah badlega?". Answer mein reasoning ho, sirf result nahi.
- **Har design ke liye ek reusable sawaal-list** (heuristic) do jo naye problem pe bhi chale. Jaise LLD:
  nouns → entities, verbs → methods, "kya badal sakta hai?" → interface/strategy, "kis cheez ka state badalta hai?" → state.
- **Kyun aur kab nahi:** har pattern/component ke saath "kab mat use karo" (over-engineering) bhi.
- **Transfer check:** lesson ke end mein ek naya (unseen) chhota scenario jahan wahi soch lagani ho.
- Galat-par-common answer bhi dikhao aur samjhao kyun galat hai.

## 1c. HLD rule: koi component bina wajah nahi (user feedback)
- Design lessons "evolution" format mein: v0 simplest → traffic badhao (sim) → kya toota → options (pick, har option ka why/why-not) → decision table → next stage.
- **Har naya component pehli baar aaye to us block mein (ya usse pehle) ye teen cheezein:** (1) ye kya hai, simple shabdon mein,
  (2) abhi kyun (kaunsi problem / kaunsa number), (3) alternative kya tha aur kyun nahi liya.
- Numbers se check karo ki component sach mein chahiye. Zaroorat nahi to mat lagao; "Stage N: kab chahiye" table mein signal ke saath daalo.
- Final diagram mein sirf wahi components jo upar justify hue. Recap table: problem → component → rejected alternative.
- HLD mein code exercises nahi (design pre-define karke function bharwana design nahi sikhata).
- HLD lesson = explanation + flow diagrams. Sirf lesson ke **end mein quiz** (1-2), aur wo kisi **real industry incident/problem** pe based ho
  (public post-mortem / engineering blog se verified), 4 options, `why` mein sahi jawab + company ne kya kiya. Source `references` mein. Generator: `tools/hld-quizzes.mjs`.

## 2. Copyright aur sources (zaroori)
- Books (Effective Java, DDIA, Alex Xu, Raschka, Dummies) aur YouTube creators (Gaurav Sen, Arpit Bhayani, Striver) ko
  **reference** ki tarah use karo: kaunse topics, kis order mein, kaunsi depth. **Unka text, diagrams ya code copy mat karo.**
  Explanation, examples aur code apne likho. 15 words se lamba quote kabhi nahi.
- LeetCode problem statements **copy mat karo**. Problem apne shabdon mein likho, aur original problem ka link do.
- Pirated PDFs ka link kabhi nahi. Sirf official pages (publisher, author, official docs, channel ka URL).
- Har lesson mein `references` (2-5) do. **Sirf wahi URL likho jo tumne verify kiya hai** (curl/web fetch se 200, ya bot-protected
  jaane-maane sites jaise leetcode.com). URL guess mat karo. Specific video ka URL pakka na ho to channel ka URL do.

### Verified reference URLs (seedha use kar sakte ho)
```
Java docs (17 API)        https://docs.oracle.com/en/java/javase/17/docs/api/
dev.java (official)       https://dev.java/learn/
Oracle concurrency tut    https://docs.oracle.com/javase/tutorial/essential/concurrency/
Java Concurrency in Pract https://jcip.net/                                   (Brian Goetz, book)
Striver (YouTube)         https://www.youtube.com/@takeUforward
Striver A2Z sheet         https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2
NeetCode roadmap          https://neetcode.io/roadmap
NeetCode (YouTube)        https://www.youtube.com/@NeetCode
Hello Interview: coding   https://www.hellointerview.com/learn/code
Hello Interview: LLD      https://www.hellointerview.com/learn/low-level-design
Hello Interview: SD intro https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction
Hello Interview: caching  https://www.hellointerview.com/learn/system-design/core-concepts/caching
Hello Interview: problems https://www.hellointerview.com/learn/system-design/problem-breakdowns/overview
Gaurav Sen (YouTube)      https://www.youtube.com/@gkcs
Arpit Bhayani (YouTube)   https://www.youtube.com/@AsliEngineering
System Design Primer      https://github.com/donnemartin/system-design-primer
ByteByteGo (Alex Xu)      https://bytebytego.com/
DDIA (Kleppmann)          https://dataintensive.net/
Latency numbers (gist)    https://gist.github.com/jboner/2841832
Refactoring Guru patterns https://refactoring.guru/design-patterns
Redis docs                https://redis.io/docs/latest/
Kafka docs                https://kafka.apache.org/documentation/
Raschka book (Manning)    https://www.manning.com/books/build-a-large-language-model-from-scratch
Raschka code (GitHub)     https://github.com/rasbt/LLMs-from-scratch
GenAI & LLMs For Dummies  https://www.snowflake.com/resource/generative-ai-and-llms-for-dummies/   (David Baum, Snowflake Special Edition)
Karpathy (YouTube)        https://www.youtube.com/@karpathy
Illustrated Transformer   https://jalammar.github.io/illustrated-transformer/
Attention paper           https://arxiv.org/abs/1706.03762
Prompting guide           https://www.promptingguide.ai/
Anthropic: agents         https://www.anthropic.com/research/building-effective-agents
MCP                       https://modelcontextprotocol.io/
LeetCode problem          https://leetcode.com/problems/<slug>/   (slug sahi hona chahiye, jaise two-sum)
```

## 3. Facts ki checking (triple check)
1. **Code:** saara Java code `node tools/verify-content.mjs <module>` se compile + run hota hai. 0 fail hona chahiye.
2. **Facts:** jo bhi number, API behaviour, default value, version, ya "X internally Y karta hai" claim ho, usko
   official docs / credible source se web search karke confirm karo. Pakka na ho to claim mat likho, ya "approx" likho.
   Common galtiyan jo nahi honi chahiye: HashMap default capacity 16 aur load factor 0.75, treeify threshold 8 (table ≥ 64);
   Integer cache -128..127; String pool; ConcurrentHashMap Java 8+ mein segments nahi (CAS + synchronized on bin);
   Kafka ordering sirf partition ke andar; Redis single-threaded command execution (I/O threads optional);
   CAP mein partition ke time C ya A chunna padta hai.
3. **Self review:** likhne ke baad har lesson ek baar padho: kya noob samjhega? kya senior interviewer satisfied hoga? koi galat fact?

## 4. File format
Har lesson ki ek file: `js/data/<module>/<lesson-id>.js` (lesson-id = outline `js/data/<module>.js` wala id, exact).
```js
// <Lesson title>
registerLesson("<module>", "<lesson-id>", {
  why: "Ye kyun seekhna hai (1-2 sentence, interview se jod ke)",
  blocks: [ ... ],
  references: [
    { title: "Effective Java (3rd ed.), Item 11", by: "Joshua Bloch", type: "book" },
    { title: "Two Sum", by: "LeetCode", url: "https://leetcode.com/problems/two-sum/", type: "article" }
  ]
});
```
`type`: book | video | article | docs | course. Book ka URL optional hai.

### Escaping rules (sabse common bug)
- Multi-line strings ke liye backtick template literal use karo. Unke andar **backtick (`) aur `${`** escape karo: `` \` `` aur `\${`.
- `html`, `task`, `q`, `why`, `answer`, `options`, `items`, `point`, `text` fields **HTML** hain:
  `<` aur `>` ko `&lt;` `&gt;` likho jab tag na ho (generics!): `List&lt;String&gt;`, `a &lt; b`.
  `<pre class="code-static">` ke andar bhi yahi rule.
- `code`, `starter`, `harness`, `solution` fields **plain Java** hain: wahan `<` seedha likho, escape mat karo.
- Allowed HTML tags: a b i em strong code pre p br ul ol li table tr th td h2 h3 h4 div span sup sub small details summary blockquote kbd mark, aur inline svg.

## 5. Block types
Har lesson mein mix hona chahiye. **Minimum:** 1 text, 2+ interactive (quiz/think/pick/order/exercise/steps/sim),
1 interview tip. Interactive blocks ke `id` lesson ke andar unique hon.

### text / tip / warn
```js
{ type: "text", html: `<h2>Heading</h2><p>...</p>` }
{ type: "tip",  html: "🎤 <b>Interview tip:</b> ..." }
{ type: "warn", html: "⚠️ <b>Common galti:</b> ..." }
```
Diagram: text html mein `<pre class="diagram">` (ASCII boxes/arrows). Tables: normal `<table>`.

### code (runnable example)
```js
{ type: "code", title: "Kya dikhata hai (1 line)", code: `public class Main { public static void main(String[] args) { ... } }`, note: "optional html" }
```
- Class ka naam `Main`, Java 17. Koi stdin (Scanner input) nahi, koi file/network nahi.
- Program 2 second se kam mein khatam ho. Threads `join()` karo, executors `shutdown()` + `awaitTermination` karo.
- Jaan-boojh ke compile error wala example: `expectError: true`. Jaan-boojh ke exception: `expectException: true`.

### exercise (practice, auto-check)
Do tarah:
1. **expectedOutput** (Java basics): user `Main.java` likhta hai, stdout exact match.
2. **harness** (DSA, methods): user `Solution.java` mein `class Solution { ... }` likhta hai. Hidden `Main.java` tests chalata hai:
```java
import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("nums=[2,7,11,15], target=9", new int[]{0, 1}, () -> s.twoSum(new int[]{2, 7, 11, 15}, 9));
        Check.eq("...", 5, () -> s.foo(...));
        Check.hiddenFromHere();               // iske baad wale sirf Submit pe
        Check.eq("edge: empty", ..., () -> ...);
        Check.eqAnyOrder("order matter nahi", List.of(1, 2), () -> s.bar());          // bahar wali list ka order ignore
        Check.eqAnyOrderDeep("3sum", List.of(List.of(-1, 0, 1)), () -> s.threeSum(...)); // har level pe order ignore
    }
}
```
`Check.eq` arrays, lists, nested, numbers (int/long same), doubles (1e-6 tolerance), strings compare karta hai.
⚠️ `Check.eq` ka teesra argument `Supplier` hai: uske andar **checked exceptions** (`InterruptedException`, `ExecutionException`
from `Future.get`, `Thread.join`) seedha nahi chal sakte. Lambda ke andar try/catch karo ya chhota static helper banao.
Rules:
- 2-3 visible + 3-6 hidden tests. Hidden mein edge cases: empty, single element, duplicates, negative, bada input (performance: O(n²) fail ho jaaye aisa n ~ 10⁵, par 2 second se kam mein sahi solution chale).
- `starter` compile hona chahiye aur saare tests pass **nahi** hone chahiye (method stub `return 0;` / `return null;` theek hai).
- `solution` saare tests pass kare. `explain` mein approach + time/space complexity.
- `hints`: 2-3, pehla halka, aakhri almost answer.
- Linked list / tree problems: `ListNode`/`TreeNode` class **sirf Solution.java ke starter mein** (Solution class ke upar) do,
  taaki user ko dikhe. Harness mein dobara define mat karo (duplicate class error aayega); harness usi class ko use kare.
  `solution` field mein bhi wahi node class honi chahiye:
  ```java
  class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }
  class Solution { ListNode reverse(ListNode head) { return null; } }
  ```
  Harness mein helper methods (array → list, list → array) `Main` ke andar static methods banao.
- Fields: `id, title, level ("Easy"|"Medium"|"Hard"), task (html), examples (html), userFile ("Solution.java"), starter, harness, hints, solution, explain, timeLimitMs (optional)`.
- Problem LeetCode se inspired ho to `task` ke end mein link: `<a href="https://leetcode.com/problems/slug/" target="_blank">LeetCode 1</a>`.

### quiz
```js
{ type: "quiz", q: "html", options: ["html", "html", "html", "html"], answer: 1, why: "html explanation" }
```
Output-prediction questions ("ye code kya print karega?") Java mein bahut achhe hain. Galat options bhi believable hon.

### think ("Pehle aap socho": user likhta hai, rubric se score, phir answer)
```js
{ type: "think", id: "think-x", q: "html question", context: "optional html",
  rubric: [
    { point: "html: interviewer kya sunna chahta hai", keys: ["keyword", "synonym", "hinglish synonym"], weight: 2 },
    ...  // 3-6 points
  ],
  answer: `html model answer` }
```
- Keys **lowercase substrings** hain jo user ke jawab mein dhoondhe jaate hain. English + Hinglish dono variants do
  ("cache", "redis", "caching"). Bahut chhote keys (2-3 letters) mat do, galat match hote hain. 3-8 keys per point.
- LLD/HLD mein **har design step pe think** use karo: "entities kya hongi?", "tables banao", "kaunsa component kyun?" Pehle socho → score → answer.

### pick (multi-select)
```js
{ type: "pick", id: "pick-x", q: "html", options: [ { text: "html", correct: true, why: "html" }, { text: "...", correct: false, why: "..." } ], answer: "optional html summary" }
```
4-7 options, 2-4 correct. Galat options realistic hon (common galtiyan).

### order (sahi sequence)
```js
{ type: "order", id: "order-x", q: "html", items: ["step 1 (sahi order mein likho)", "step 2", "step 3", "step 4"], why: "optional html" }
```

### steps (step-by-step animation / dry run)
```js
{ type: "steps", title: "Two pointers dry run: [1,2,4,7,11], target 15", steps: [
  { title: "Step 1: L=0, R=4", html: `<div class="arr"><span class="cell hl">1</span><span class="cell">2</span>...</div>
      <div class="arr ptrs"><span class="cell">L</span><span class="cell"></span>...<span class="cell">R</span></div><p>1+11=12 &lt; 15, to L++</p>` },
  ...
] }
```
CSS helpers: `.arr .cell` (array box), classes `hl` (current), `ok` (done/sahi), `bad`, `dim` (bahar), `win` (window);
`.arr.ptrs` pointer labels ki row (same number of cells rakho taaki align ho).
Thread timeline: `<table class="lanes">` rows = threads, `td.run` / `td.wait` / `td.block` / `td.lock`.
Algorithms ke dry run, threads ka interleaving, request flow, transformer steps: sab ke liye steps use karo.

### flow (animated architecture diagram) — HLD/AI mein ASCII diagram ki jagah HAMESHA ye
```js
{ type: "flow", title: "...",
  nodes: [ { id: "lb", label: "Load Balancer", icon: "⚖️", x: 340, y: 160, kind: "service", w: 150, h: 58 } ],   // x 0..1000 (center)
  edges: [ { from: "users", to: "lb", label: "optional", dashed: false, both: false } ],
  steps: [ { title: "...", html: "<p>...</p>", path: ["users", "lb", "a"],          // ek chalti dot
             paths: [["lb","a"],["lb","b"]], active: ["a"], fail: ["b"], dim: ["c"], color: "#1971c2" } ] }
```
kind: client | service | data | queue | cache | external (sirf color). Label mein "\n" se doosri line (chhota sub-text).
Boxes overlap na hon (verify check karta hai). 3-6 steps, har step ek kahani: request kahan gayi, kya toota, fix kya.
Bulk conversion: `tools/apply-flows.mjs <spec> <module>` (spec examples: tools/flows-hld.mjs).

### sim (HLD simulator) — sirf HLD module
```js
{ type: "sim", id: "sim-x", title: "...",
  config: { rps: 1000, maxRps: 100000, readRatio: 0.9, appCap: 2000, dbCap: 3000, cacheCap: 100000,
            controls: ["rps", "readRatio", "lb", "servers", "cache", "hitRatio", "replicas", "shards", "queue"] },
  goal: { rps: 50000, maxErrors: 0.01, maxLatency: 100, budget: 40, noBacklog: false, text: "html goal", answer: "html explanation after success" } }
```
Model: app server har ek `appCap` RPS; LB ke bina 1 server; reads cache hit pe DB tak nahi jaate; reads primaries + replicas mein bant-te hain;
writes sirf primary pe (shards se divide); queue on = writes async (backlog dikhta hai). Latency ≈ base/(1-utilization).
Cost units: server 1, LB 1, cache 2, har DB node 3, queue 1. `controls` se sirf relevant knobs dikhao (lesson ke hisaab se).

### sampling (LLM next token demo) — sirf AI module
```js
{ type: "sampling", title: "...", prompt: "Mumbai ka sabse famous street food hai", temperature: 1, topP: 1,
  tokens: [ { t: "vada pav", logit: 3.2 }, { t: "pav bhaji", logit: 2.6 }, { t: "bhel", logit: 1.5 }, ... ] }
```

## 6. Module-wise lesson structure
**Java:** concept → runnable code (traps ke saath) → output quiz → exercise → think (interview question) → tip.
**DSA pattern lesson:** pattern kab lagta hai (signals) → brute force vs pattern → template code → steps dry run →
har problem: think ("approach batao, complexity kya hogi") → exercise (harness, hidden tests) → explain. 2-3 problems per pattern.
**Concurrency:** problem dikhao (race/deadlock) → steps timeline visual → tool → runnable code (deterministic result jaise final count) →
quiz → exercise (harness se deterministic check, jaise thread-safe counter ka final value) → think (interview). Note: browser JVM mein race
condition kam dikhti hai (threads ek CPU pe), isliye race ko steps timeline se samjhao, aur code mein "asli machine pe alag aa sakta hai" note do.
**LLD problem:** requirements (scope chhota, basic functionality) → think: entities → think/pick: relationships → model class diagram (pre.diagram) →
think: DB tables → model tables (table) → patterns used (pick) → runnable code (core classes + small demo main) → follow-ups → tip.
LLD concept lessons (SOLID, patterns): bura code → problem → pattern → achha code (runnable) → "kaunsa pattern?" pick/quiz.
**HLD:** component lesson: problem → kya karta hai → kab lagao / kab nahi (pick) → trade-offs → sim jahan relevant → quiz.
Design lesson: requirements (think) → estimation (think with numbers) → API → data model (think) → components (pick) → diagram →
deep dives (think) → bottlenecks + sim → trade-offs summary → tip.
**AI:** intuition pehle, math halki (jo hai wo simple numbers ke saath) → steps/sampling demos → Java exercise jahan possible
(softmax, cosine similarity, tokenizer, bigram counts) → think → quiz.

## 7. Size
Har lesson approx 8-15 blocks. Bade topics (HashMap internals, Streams, design problems) 15-25 blocks. Quality > quantity, par
"noob se interview ready" ka gap bharna chahiye.

## 8. Done checklist (har lesson)
- [ ] File path aur `registerLesson` ids outline se exact match
- [ ] `node --check js/data/<module>/<id>.js` pass
- [ ] `node tools/verify-content.mjs <module>` → 0 fail (structure + Java)
- [ ] Facts web se verify kiye, references ke URL verify kiye
- [ ] Koi copied text/code nahi
