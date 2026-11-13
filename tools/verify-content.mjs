// Saare lessons ka Java content local JDK pe check karta hai (JDK 17+ chahiye).
//   node tools/verify-content.mjs            (saare modules)
//   node tools/verify-content.mjs java       (sirf ek module)
//
// Checks:
//   code blocks : compile + run ho (expectError: true wale ka compile FAIL hona chahiye)
//   exercises   : starter compile ho; solution se saare tests (hidden bhi) pass hon,
//                 ya expectedOutput match ho. Starter se saare tests pass ho jaayein to warning.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jar = path.join(root, "runtime", "launcher.jar");
const only = process.argv[2];

const ctx = {
  MODULE_DATA: {}, LESSON_DATA: {},
  registerModule(d) { ctx.MODULE_DATA[d.id] = d; },
  registerLesson(m, l, d) { ctx.LESSON_DATA[`${m}/${l}`] = d; }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js", "sim-model.js"), "utf8"), ctx, { filename: "sim-model.js" });
const dataDir = path.join(root, "js", "data");

// Sim goal achievable hai? Controls ke grid pe brute force: min cost wala valid state dhoondo.
function simSearch(b) {
  const cfg = ctx.simConfig(b.config);
  const has = c => cfg.controls.includes(c);
  const g = b.goal;
  const range = (lo, hi, step) => { const o = []; for (let v = lo; v <= hi + 1e-9; v += step) o.push(+v.toFixed(4)); return o; };
  const opt = (c, vals, def) => (has(c) ? vals : [def]);
  let best = null;
  for (const lb of opt("lb", [false, true], cfg.lb))
    for (const servers of lb ? opt("servers", range(1, 50, 1), cfg.servers) : [1])
      for (const cache of opt("cache", [false, true], cfg.cache))
        for (const hitRatio of cache ? opt("hitRatio", range(0, 0.99, 0.01), cfg.hitRatio) : [cfg.hitRatio])
          for (const replicas of opt("replicas", range(0, 10, 1), cfg.replicas))
            for (const shards of opt("shards", range(1, 16, 1), cfg.shards))
              for (const queue of opt("queue", [false, true], cfg.queue)) {
                const st = { rps: g.rps, readRatio: cfg.readRatio, lb, servers, cache, hitRatio, replicas, shards, queue };
                const r = ctx.simCompute(cfg, st);
                if (ctx.simGoalMet(g, st, r) && (!best || r.cost < best.cost)) best = { cost: r.cost, st, p50: r.p50 };
              }
  return best;
}
for (const f of fs.readdirSync(dataDir).filter(f => f.endsWith(".js"))) {
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), ctx, { filename: f });
}
let missing = [];
for (const mod of Object.values(ctx.MODULE_DATA)) {
  for (const ch of mod.chapters) {
    for (const lesson of ch.lessons) {
      const file = path.join(dataDir, mod.id, lesson.id + ".js");
      if (!fs.existsSync(file)) { missing.push(`${mod.id}/${lesson.id}`); continue; }
      try {
        vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
      } catch (e) {
        console.log(`❌ ${mod.id}/${lesson.id}: file mein JS error: ${e.message}`);
        process.exitCode = 1;
      }
      const data = ctx.LESSON_DATA[`${mod.id}/${lesson.id}`];
      if (data) lesson.blocks = data.blocks;
      else console.log(`❌ ${mod.id}/${lesson.id}: registerLesson ka module/lesson id galat hai`);
    }
  }
}

let failures = 0, warnings = 0, checked = 0;
// Temp folder project ke andar (system temp se programs chalana security tools flag kar sakte hain)
const tmpRoot = path.join(root, ".verify-tmp");
fs.mkdirSync(tmpRoot, { recursive: true });
const tmp = fs.mkdtempSync(path.join(tmpRoot, "run-"));

function compileAndRun(files, mode = "all") {
  const dir = fs.mkdtempSync(path.join(tmp, "r"));
  const src = path.join(dir, "src");
  const out = path.join(dir, "out");
  fs.mkdirSync(src);
  const paths = Object.entries(files).map(([name, code]) => {
    const p = path.join(src, name);
    fs.writeFileSync(p, code);
    return p;
  });
  const c = spawnSync("javac", ["-g", "-encoding", "UTF-8", "-nowarn", "-cp", jar, "-d", out, ...paths], { encoding: "utf8" });
  if (c.status !== 0) return { compiled: false, text: c.stderr + c.stdout };
  const r = spawnSync("java", ["-cp", `${jar}${path.delimiter}${out}`, "seekho.Launcher", out, "Main", "5000", mode],
    { encoding: "utf8", timeout: 20000 });
  const text = (r.stdout || "") + (r.stderr || "");
  const exit = Number((text.match(/@@SEEKHO_EXIT (\d+)@@/) || [])[1] ?? -1);
  const summary = text.match(/@@SUMMARY\|(\d+)\|(\d+)\|(\d+)/);
  const stdout = (r.stdout || "").split("\n").filter(l => !l.startsWith("@@")).join("\n").trim();
  return { compiled: true, exit, text, stdout, summary: summary && { pass: +summary[1], fail: +summary[2], total: +summary[3] } };
}

// ---------- Structure checks (saare block types) ----------
const HTML_FIELDS = ["html", "task", "examples", "q", "why", "answer", "context", "explain", "note", "text", "title"];
const ALLOWED_TAGS = new Set("a b i u s em strong code pre p br hr ul ol li table thead tbody tr th td h2 h3 h4 div span sup sub small details summary img blockquote kbd mark svg path rect line circle text g polyline polygon ellipse defs marker".split(" "));
function htmlProblems(s) {
  const out = [];
  if (typeof s !== "string") return out;
  const re = /<\/?([A-Za-z][\w-]*)/g;
  let m;
  while ((m = re.exec(s))) {
    const tag = m[1];
    if (!ALLOWED_TAGS.has(tag.toLowerCase()) || /^[A-Z]/.test(tag)) {
      out.push(`HTML mein <${tag}> mila. Generics/angle brackets ko &lt; &gt; likho`);
    }
  }
  return out;
}
function walkStrings(v, fn, keyName = "") {
  if (typeof v === "string") return fn(v, keyName);
  if (Array.isArray(v)) return v.forEach(x => walkStrings(x, fn, keyName));
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walkStrings(x, fn, k);
}
const KNOWN = new Set(["text", "tip", "warn", "code", "exercise", "quiz", "think", "steps", "pick", "order", "sim", "sampling", "flow"]);
function flowProblems(b) {
  const p = [];
  const ids = new Set();
  for (const n of b.nodes || []) {
    if (!n.id || ids.has(n.id)) p.push(`flow: node id missing/duplicate: ${n.id}`);
    ids.add(n.id);
    if (!(n.x >= 0 && n.x <= 1000) || !(n.y >= 0)) p.push(`flow: node ${n.id} position galat`);
  }
  const boxes = (b.nodes || []).map(n => ({ id: n.id, x1: n.x - (n.w || 150) / 2, x2: n.x + (n.w || 150) / 2, y1: n.y - (n.h || 58) / 2, y2: n.y + (n.h || 58) / 2 }));
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.x1 < c.x2 && c.x1 < a.x2 && a.y1 < c.y2 && c.y1 < a.y2) p.push(`flow: nodes overlap: ${a.id} & ${c.id}`);
    if (a.x1 < 0 || a.x2 > 1000) p.push(`flow: node ${a.id} viewBox ke bahar`);
  }
  for (const e of b.edges || []) if (!ids.has(e.from) || !ids.has(e.to)) p.push(`flow: edge ${e.from}->${e.to} unknown node`);
  // Edge line kisi teesre box ke upar se na guzre (diagram confusing lagta hai)
  const byId = Object.fromEntries((b.nodes || []).map(n => [n.id, n]));
  for (const e of b.edges || []) {
    const a = byId[e.from], c = byId[e.to];
    if (!a || !c) continue;
    for (const o of boxes) {
      if (o.id === e.from || o.id === e.to) continue;
      for (let t = 0.02; t < 0.98; t += 0.01) {
        const x = a.x + (c.x - a.x) * t, y = a.y + (c.y - a.y) * t;
        if (x > o.x1 + 4 && x < o.x2 - 4 && y > o.y1 + 4 && y < o.y2 - 4) { p.push(`flow: edge ${e.from}→${e.to} node ${o.id} ke upar se guzarti hai`); break; }
      }
    }
  }
  if (!Array.isArray(b.steps) || b.steps.length < 2) p.push("flow: kam se kam 2 steps");
  for (const s of b.steps || []) {
    const paths = s.paths || (s.path ? [s.path] : []);
    for (const path of paths) for (const id of path) if (!ids.has(id)) p.push(`flow: step path mein unknown node ${id}`);
    // Dot sirf drawn edges pe chale, aur one-way edge pe arrow ki ulti disha mein nahi
    const fwd = new Set((b.edges || []).map(e => e.from + ">" + e.to));
    const two = new Set((b.edges || []).filter(e => e.both).map(e => e.to + ">" + e.from));
    for (const path of paths) for (let k = 0; k + 1 < path.length; k++) {
      const hop = path[k] + ">" + path[k + 1];
      if (fwd.has(hop) || two.has(hop)) continue;
      if (fwd.has(path[k + 1] + ">" + path[k])) p.push(`flow: "${s.title}" mein ${path[k]}→${path[k + 1]} one-way edge pe ulta (both: true do)`);
      else p.push(`flow: "${s.title}" mein ${path[k]}→${path[k + 1]} ke beech koi edge nahi`);
    }
    for (const k of ["active", "fail", "dim"]) for (const id of s[k] || []) if (!ids.has(id)) p.push(`flow: step.${k} unknown node ${id}`);
  }
  return p;
}
function structureProblems(b) {
  const p = [];
  if (!KNOWN.has(b.type)) return [`unknown block type "${b.type}"`];
  walkStrings(b, (s, k) => {
    if (HTML_FIELDS.includes(k) || k === "point" || k === "items" || k === "options") p.push(...htmlProblems(s));
  });
  if (b.type === "quiz") {
    if (!Array.isArray(b.options) || b.options.length < 2) p.push("quiz: options kam hain");
    if (!(b.answer >= 0 && b.answer < (b.options || []).length)) p.push("quiz: answer index galat");
    if (!b.why) p.push("quiz: why missing");
  }
  if (b.type === "think") {
    if (!b.id) p.push("think: id missing");
    if (!Array.isArray(b.rubric) || b.rubric.length < 2) p.push("think: rubric kam hai");
    for (const r of b.rubric || []) if (!r.point || !Array.isArray(r.keys) || !r.keys.length) p.push("think: rubric item mein point/keys missing");
    if (!b.answer) p.push("think: answer missing");
  }
  if (b.type === "pick") {
    if (!b.id) p.push("pick: id missing");
    if (!(b.options || []).some(o => o.correct)) p.push("pick: koi correct option nahi");
    if ((b.options || []).some(o => typeof o.text !== "string")) p.push("pick: option.text missing");
  }
  if (b.type === "order") {
    if (!b.id) p.push("order: id missing");
    if (!Array.isArray(b.items) || b.items.length < 3) p.push("order: kam se kam 3 items");
  }
  if (b.type === "steps" && (!Array.isArray(b.steps) || b.steps.length < 2)) p.push("steps: kam se kam 2 steps");
  if (b.type === "flow") p.push(...flowProblems(b));
  if (b.type === "exercise") {
    if (!b.id) p.push("exercise: id missing");
    if (!b.harness && b.expectedOutput === undefined) p.push("exercise: harness ya expectedOutput chahiye");
    if (b.harness && !/Check\.hiddenFromHere\(\)/.test(b.harness)) p.push("exercise: harness mein hidden tests nahi hain");
  }
  if (b.type === "sim" && b.goal && !(b.goal.rps > 0)) p.push("sim: goal.rps missing");
  if (b.type === "sampling" && (!Array.isArray(b.tokens) || b.tokens.length < 3)) p.push("sampling: tokens kam hain");
  return p;
}

const norm = s => String(s || "").replace(/\r/g, "").split("\n").map(l => l.trimEnd()).join("\n").trim();
const fail = (where, msg) => { failures++; console.log(`❌ ${where}\n   ${msg.split("\n").slice(0, 12).join("\n   ")}`); };
const warn = (where, msg) => { warnings++; console.log(`⚠️  ${where}: ${msg}`); };

for (const mod of Object.values(ctx.MODULE_DATA)) {
  if (only && mod.id !== only) continue;
  for (const ch of mod.chapters) {
    for (const lesson of ch.lessons) {
      const ids = (lesson.blocks || []).map(b => b.id).filter(Boolean);
      const dup = ids.filter((x, k) => ids.indexOf(x) !== k);
      if (dup.length) fail(`${mod.id}/${lesson.id}`, `duplicate block ids: ${[...new Set(dup)].join(", ")}`);
      (lesson.blocks || []).forEach((b, i) => {
        const where = `${mod.id}/${lesson.id} #${i} (${b.type}${b.id ? " " + b.id : ""})`;
        const sp = structureProblems(b);
        if (sp.length) fail(where, [...new Set(sp)].join("\n"));
        // HLD explanation-only hai: koi quiz/exercise/code nahi (user request 2026-11-13)
        // Sirf lesson ke end mein real-incident quiz allowed (user request 2026-11-14)
        if (mod.id === "hld" && ["think", "pick", "order", "exercise", "code"].includes(b.type))
          fail(where, `hld mein '${b.type}' block allowed nahi (explanation + end quiz only)`);
        if (mod.id === "hld" && b.type === "quiz" && (lesson.blocks || []).slice(i + 1).some(x => !["quiz", "tip"].includes(x.type)))
          fail(where, "hld quiz lesson ke end mein hona chahiye");
        if (mod.id === "hld" && b.type === "sim" && b.goal) fail(where, "hld sim mein goal nahi hona chahiye");
        if (b.type === "sim" && b.goal) {
          checked++;
          const best = simSearch(b);
          if (!best) fail(where, "sim goal kisi bhi setting se poora nahi hota");
          else {
            if (b.goal.budget && best.cost > b.goal.budget) warn(where, `budget ${b.goal.budget} se kam mein possible nahi (min cost ${best.cost})`);
            if (process.env.SIM_DEBUG) console.log(`   sim ${b.id}: min cost ${best.cost}, p50 ${best.p50.toFixed(1)}ms, ${JSON.stringify(best.st)}`);
          }
        }
        if (b.type === "code") {
          checked++;
          const r = compileAndRun({ "Main.java": b.code });
          if (b.expectError) { if (r.compiled) fail(where, "compile error expected tha, par compile ho gaya"); }
          else if (!r.compiled) fail(where, r.text);
          else if (r.exit !== 0 && !b.expectException) fail(where, `exit ${r.exit}\n${r.text}`);
        }
        if (b.type === "exercise") {
          checked++;
          const userFile = b.userFile || (b.harness ? "Solution.java" : "Main.java");
          const files = code => (b.harness ? { [userFile]: code, "Main.java": b.harness } : { [userFile]: code });
          const s = compileAndRun(files(b.starter));
          if (!s.compiled) fail(where + " starter", s.text);
          if (!b.solution) { warn(where, "solution nahi hai"); return; }
          const r = compileAndRun(files(b.solution));
          if (!r.compiled) return fail(where + " solution", r.text);
          if (b.harness) {
            if (!r.summary || r.summary.fail > 0) fail(where + " solution", `tests: ${JSON.stringify(r.summary)}\n${r.text}`);
            if (s.summary && s.summary.fail === 0) warn(where, "starter code se hi saare tests pass ho rahe hain");
          } else if (b.expectedOutput !== undefined && norm(r.stdout) !== norm(b.expectedOutput)) {
            fail(where + " solution", `output:\n${r.stdout}\nexpected:\n${b.expectedOutput}`);
          }
        }
      });
    }
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
const missingHere = missing.filter(m => !only || m.startsWith(only + "/"));
if (missingHere.length) console.log(`\n🚧 ${missingHere.length} lessons ki file abhi nahi hai: ${missingHere.join(", ")}`);
console.log(`\n${checked} Java blocks check kiye · ${failures} fail · ${warnings} warnings`);
process.exit(failures || process.exitCode ? 1 : 0);
