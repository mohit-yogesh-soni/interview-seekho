// Flow animation fixes (2026-11-14): dot sirf drawn edges pe chale, aur jo edge pe ulta chalti hai wo edge two-way ho.
// Usage: node tools/fix-flow-edges.mjs   (idempotent nahi hai: ek baar chalao; verify-content ab ye check karta hai)
import fs from "node:fs";
const P = f => `js/data/${f}.js`;
const files = {};
const get = f => (files[f] ??= fs.readFileSync(P(f), "utf8"));
const put = (f, s) => (files[f] = s);

function setBoth(f, from, to) {
  const re = new RegExp(`(from: "${from}",\\s*to: "${to}")(?!,\\s*both)`, "g");
  const before = get(f);
  const after = before.replace(re, "$1, both: true");
  if (after === before) console.log(`⚠️ setBoth no match: ${f} ${from}->${to}`);
  put(f, after);
}
function addEdges(f, titleSub, edgesText) {
  const s = get(f);
  const t = s.indexOf(titleSub);
  if (t < 0) return console.log(`⚠️ title nahi mila: ${f} ${titleSub}`);
  const e = s.indexOf("edges: [", t);
  put(f, s.slice(0, e + 8) + "\n        " + edgesText + "," + s.slice(e + 8));
}
function replace(f, a, b) {
  const s = get(f);
  if (!s.includes(a)) return console.log(`⚠️ replace no match: ${f} ${a}`);
  put(f, s.split(a).join(b));
}

// url-shortener: response LB ke through wapas
replace("hld/url-shortener", `["u","lb","a1","redis","a1","u"]`, `["u","lb","a1","redis","a1","lb","u"]`);
replace("hld/url-shortener", `["u","lb","create","db","create","u"]`, `["u","lb","create","db","create","lb","u"]`);
replace("hld/url-shortener", `["u","lb","redir","redis","redir","u"]`, `["u","lb","redir","redis","redir","lb","u"]`);
replace("hld/url-shortener", `["redir","redis","redir","u"]`, `["redir","redis","redir","lb","u"]`);
for (const [a, b] of [["u", "lb"], ["lb", "a1"], ["lb", "a2"], ["lb", "redir"], ["lb", "create"], ["redir", "db"]]) setBoth("hld/url-shortener", a, b);

// rate limiter: 429 bhi LB se wapas
replace("hld/rate-limiter-hld", `path: ["c", "lb", "a1", "redis", "a1", "c"]`, `path: ["c", "lb", "a1", "redis", "a1", "lb", "c"]`);
for (const [a, b] of [["c", "lb"], ["lb", "a1"], ["lb", "a2"]]) setBoth("hld/rate-limiter-hld", a, b);

// message queue: sync chain = API khud har worker ko call karta hai aur wait karta hai
replace("hld/message-queue", `["user","api","email","sms","an"]`, `["user","api","email","api","an","api","user"]`);
addEdges("hld/message-queue", "Sync chain vs queue", `{ from: "api", to: "email", both: true, dashed: true }, { from: "api", to: "an", both: true, dashed: true }`);
setBoth("hld/message-queue", "api", "q");

// circuit breaker: OPEN state pe service ko turant fallback; HALF_OPEN trial call dependency ko
addEdges("hld/reliability", "Circuit breaker ki states", `{ from: "svc", to: "open", both: true, dashed: true }, { from: "half", to: "dep", dashed: true }`);

// consistent hashing: key → uska owner node (dashed)
addEdges("hld/sharding", "Consistent hashing ring", `{ from: "k1", to: "n2", dashed: true }, { from: "k1", to: "n4", dashed: true }, { from: "k2", to: "n3", dashed: true }, { from: "k3", to: "n1", dashed: true }`);

// caching: static content client ↔ CDN; app responses client tak
addEdges("hld/caching", "Cache-aside, update aur stampede", `{ from: "client", to: "cdn", both: true }`);
for (const a of ["app1", "app2", "app3"]) setBoth("hld/caching", "client", a);

// response wapas aane wale one-way edges → two-way
setBoth("hld/api-gateway", "mobile", "gw"); setBoth("hld/api-gateway", "web", "gw");
setBoth("hld/cdn", "u1", "api");
setBoth("hld/chat", "msg", "reg");
setBoth("hld/fanout", "reader", "f1"); setBoth("hld/fanout", "reader", "posts");
setBoth("hld/replication", "app", "primary"); setBoth("hld/replication", "app", "r1"); setBoth("hld/replication", "app", "r2");
setBoth("hld/uber", "m", "trip");
setBoth("hld/youtube", "api", "meta");
setBoth("ai/memory-planning", "w2", "mem");
setBoth("ai/tool-calling", "app", "val");

for (const [f, s] of Object.entries(files)) fs.writeFileSync(P(f), s);
console.log("patched:", Object.keys(files).length, "files");
