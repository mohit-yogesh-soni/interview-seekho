# Content Progress (checkpoint)

Kaam ruk jaaye to yahan se pata chalega kahan se continue karna hai.

Status: ✅ done (verify pass + fact review) · 🟡 likha + verify pass, fact review baaki · ⬜ baaki

Check 1 = `node tools/verify-content.mjs <module>` (Java compile/run + structure)
Check 2 = facts review (grep for common mistakes + padh ke)
Check 3 = browser mein render (user khud Chrome mein dekhega; headless Chrome automation band, security tool ki wajah se)

## Infra
- ✅ Runner, editor, blocks, extra blocks, per-lesson files, verify structure checks, CONTENT_GUIDE.md

## Java (33/33 ✅ likhe) · Check 1: 175 blocks, 0 fail
## DSA (29/29 ✅ likhe) · Check 1: 0 fail
## Concurrency (26/26 ✅) · Check 1: 85 blocks, 0 fail

## LLD (36/36 ✅) · Check 1: 47 Java blocks, 0 fail (2026-11-13)
- Foundation: what-is-lld · oop-for-design · uml · solid · dry-kiss-yagni
- Creational: singleton · factory · builder · prototype
- Structural: adapter · decorator · facade · proxy · composite
- Behavioral: strategy · observer · state · command · chain · template-method · pattern-picker
- DB: db-basics · normalization · indexes-constraints · sql-nosql-lld
- Problems: parking-lot · tic-tac-toe · vending-machine · library · snake-ladder · elevator · bookmyshow · splitwise · lru-cache-lld · logger · chess
- Reference URLs (refactoring.guru, Oracle docs) curl se 200 check kiye

## HLD (0/31) · AI (0/21)
- ⬜ NEXT: HLD module (sim block use karna), phir AI (sampling block)

## Rule (user ki request, 2026-11-13)
- Ratna nahi, derive karna: problem pehle, naam baad mein; har lesson mein heuristic + transfer check (CONTENT_GUIDE 1b)
- User: poora module bina ruke likho, end mein ek baar verify + progress; approval mat maango

## Notes (agle session ke liye)
- Sub-agents "Parse Error: Invalid header token" se fail hue the; lessons seedha likhe ja rahe hain.
- Security tool (Cortex XDR): headless Chrome / remote-debugging / bulk curl loops band. Verify temp folder `.verify-tmp/`.
- Harness lambdas mein checked exceptions catch karo (CONTENT_GUIDE mein note).

## HLD (31/31 ✅) · Check 1: 24 Java blocks + 7 sim goals, 0 fail (2026-11-13)
- Simulator ka hisaab `js/sim-model.js` mein; verify-content brute-force se har sim goal achievable + budget check karta hai (SIM_DEBUG=1 se min-cost setting dikhti hai)
- Sim model answers min-cost setting ke numbers se update kiye
- Reference URLs curl se check (uber.com bot-block → web search se sahi URL)
- ✅ User feedback: ASCII flowcharts hataye → naya animated `flow` block (js/flow.js, SVG + moving request dot + highlight/fail states)
  - 21 diagrams convert (tools/flows-hld.mjs) + 4 naye (load-balancer, fanout, indexing, monolith-micro: tools/flows-hld-extra.mjs)
  - Search ka inverted-index ASCII → table. verify mein flow structure + overlap checks
  - Browser mein dekhna baaki (user)
- ⬜ NEXT: AI module (21) — diagrams flow block se hi banana

## HLD rework (user feedback 2026-11-13) — IN PROGRESS
- Problem: designs seedha final dikhate the; justification/alternatives nahi; HLD mein code exercises (pre-defined functions = design seekhne nahi dete)
- Naya format (prototype: url-shortener ✅): Stage 0 requirements (think) → Stage 1 simplest (1 server + DB) → traffic badhao (sim) → kya toota (think) → options with why/why-not (pick) → decision table with alternatives → flow → next stage → "Production mein" (verified: Snowflake, Instagram IDs) → recap table (problem → component → rejected alternative). NO code exercises.
- ✅ url-shortener v2: KV store/sharding/etcd/Redis cluster bina wajah aa rahe the → numbers se dikhaya ki is scale pe zaroori nahi; Stage 4 "signal → component → ye kya hai → alternative" table; Kafka ke options; alag services ka reason. CONTENT_GUIDE 1c rule.
- ⬜ User se prototype confirm karwana, phir baaki 30 HLD lessons isi format mein (building blocks bhi: "kab lagao / alternative / kimat"), code exercises hatao

## HLD rework v2: explanation-only (user feedback 2026-11-13) ✅
- User: "HLD shikha mat, basic se end tak design hi rakh, sirf explanation + interactive diagrams, har component ka reason"
- `tools/hld-explain-only.mjs`: saare think/pick/quiz/order → text explanation boxes; exercise/code hataye; sim goals → "Simulator mein khud dekho" tip + explanation. Backup: `.verify-tmp/hld-bak/`
- Verify rule: hld mein think/pick/quiz/order/exercise/code block ya sim goal = fail
- 7 design lessons naye evolution format mein likhe (v0 → traffic → kya toota → options table → decision → flow → next stage → Production → recap):
  rate-limiter-hld · notification · chat · twitter · youtube · chatgpt · uber (+ url-shortener pehle se)
- Production facts web search se check: Stripe token bucket + Redis, Cloudflare sliding window + per-DC counters, WhatsApp 2M conn/server (2012), Discord Mongo→Cassandra→ScyllaDB (177→72 nodes), Twitter Redis timelines (800) + 34k tweets/s record, Vitess (YouTube 2010), Netflix Open Connect, OpenAI SSE, vLLM 2-4×, Orca, Uber H3 (2018) + S2/Ringpop
- Reference URLs: ek curl batch, sab 200 (developers.openai.com 403 = bot block, web search se URL confirm)
- "Sawaal:" labels → "Situation:", imperative wording hataya
- hld.js intro, common.js HLD desc update
- Check 1: `node tools/verify-content.mjs hld` → 0 fail
- ⬜ Optional: building-block lessons (caching, queue, sharding...) mein "kab lagao / alternative / kimat / kaunsi company" section aur mazboot karna
- ⬜ NEXT: AI module (21)
- ✅ 19 building-block/pattern lessons mein "Faisla card" (kab lagao / kab nahi / kimat / alternatives / Production mein): `tools/hld-decision-cards.mjs` (idempotent). Facts verified: Facebook memcache leases (NSDI'13), GitHub 2018 (43 s partition → 24h11m), Notion 480 logical shards / 32 DBs (2021) → 96 (2023), Prime Video ~90% cost cut, Netflix Zuul, AWS backoff+jitter. Naye ref URLs curl 200 (archive.org 429 = rate limit). CSS `.decision-card`, style.css?v=3, SITE_VERSION=2. Verify 0 fail.

## AI (21) — IN PROGRESS (2026-11-13)
- AI mein interactive blocks allowed hain (quiz/think/pick/exercise/sampling/steps/flow). Diagrams = flow block.
- ✅ Basics + LLM andar se (8): ml-basics (GD exercise) · tokens (BPE pair+merge exercise) · embeddings (cosine/topK) · next-token (sampling demo, softmax+topP) · transformer (attention exercise, flow) · how-llm-built (bigram exercise, order) · inference (KV cache exercise) · limits. Verify: 7 Java blocks, 0 fail.
- ✅ Prompting (3): prompt-anatomy · prompt-techniques (parseLabel exercise) · prompt-injection
- ✅ LLM apps (3): rag (chunking exercise) · rag-vs-ft · evals (precision/recall/F1 exercise)
- ✅ Agents (4): what-agent · tool-calling (args validation exercise) · memory-planning (history token-budget exercise) · mcp
- ✅ AI System Design (3): design-rag-bot · design-llm-serving (evolution format, flows) · ai-interview-qs (18 Q&A)

## AI (21/21 ✅) · Check 1: 12 Java blocks, 0 fail (2026-11-13)
- Facts web search se: GPT-2 vocab 50,257 / 124M / 12 layers 768 dim 1024 ctx; GPT-3 175B, 300B tokens; Llama 2 2T tokens, 7B = 32 layers × 4096, 70B GQA; Llama 3 15T+; Chinchilla ~20 tokens/param; InstructGPT 1.3B > 175B; DPO; LoRA/QLoRA; vLLM PagedAttention; OpenAI "Why LMs hallucinate" (arXiv 2509.04664); Lost in the Middle; OWASP LLM01; MCP (Nov 2024, JSON-RPC 2.0, stdio + Streamable HTTP, tools/resources/prompts)
- Reference URLs: ek curl batch. OpenAI docs ab developers.openai.com/api/docs/guides/* (platform.openai.com 403), Anthropic docs platform.claude.com/docs/en/* (redirect target; 403 bot block, web search se confirm). OpenAI Evals platform deprecate ho raha hai (30 Nov 2026) → "evaluation-best-practices" guide link.
- ⬜ Browser mein dekhna (user): sampling demo, flows, exercises

## Full recheck + fixes (2026-11-14) ✅
- DSA: 75 exercise statements English mein (problem, Examples Input/Output/Explanation, Constraints = hidden tests ke sizes, diagrams: trees, lists, grids, graphs, intervals, histogram). Source: `tools/dsa-statements-a.mjs`, `-b.mjs`, apply: `tools/apply-dsa-statements.mjs`.
- Flow animations: 20 hops jahan dot bina edge ke udti thi + one-way edges pe ulti chalti thi → fixed (`tools/fix-flow-edges.mjs`); 7 edges jo doosre boxes ke upar se guzarti thi → nodes move. verify-content ab teeno check karta hai (missing edge, reverse one-way, edge crosses box).
- Fact review (6 modules, sub-agents + fixes): Java 25 instance main (JEP 512), treeified bucket O(log n) sirf Comparable keys, helpful NPE default 15 se, virtual threads preview 19+20, string literal ==; volatile one-way ordering, class init vs load (singleton), SMT; DSA BABB example, 10¹⁴, TimSort space; LLD bookmyshow hold reason, UML multiplicity; HLD Twitter 143,199 TPS (Aug 2013), retries 27× vs 64×, M/M/1 wording; AI rag overlap.
- HLD: har lesson ke end mein real-incident quiz (31), `tools/hld-quizzes.mjs`; sources references mein (curl 200; roblox/openai/x.com 403 = bot block, web search se confirm). Quiz bhi sub-agent se fact-check (Facebook 2010 wording fixed). verify: HLD mein quiz sirf end mein allowed.
- Check 1 (sab modules): java 175 · dsa 104 · concurrency 85 · lld 47 · hld 0 · ai 12 Java blocks, 0 fail.
