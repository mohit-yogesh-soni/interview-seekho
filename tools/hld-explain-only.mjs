// HLD lessons ko "explanation only" banata hai: think/pick/quiz/order → text, exercise hatao, sim goal → explanation.
//   node tools/hld-explain-only.mjs [lessonId ...]   (khaali = saare)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dir = path.join(root, "js", "data", "hld");
const only = process.argv.slice(2);

const tl = s => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
function ser(v, ind) {
  const p = "  ".repeat(ind);
  if (typeof v === "string") return v.includes("\n") || v.length > 120 ? tl(v) : JSON.stringify(v);
  if (Array.isArray(v)) {
    if (v.every(x => typeof x !== "object" || x === null) && JSON.stringify(v).length < 100) return JSON.stringify(v);
    return "[\n" + v.map(x => p + "  " + ser(x, ind + 1)).join(",\n") + "\n" + p + "]";
  }
  if (v && typeof v === "object") {
    return "{\n" + Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => p + "  " + (/^[a-zA-Z_]\w*$/.test(k) ? k : JSON.stringify(k)) + ": " + ser(x, ind + 1)).join(",\n") + "\n" + p + "}";
  }
  return JSON.stringify(v);
}

function convert(b) {
  switch (b.type) {
    case "think": {
      const points = (b.rubric || []).map(r => `<li>${r.point}</li>`).join("");
      return [{ type: "text", html: `
        <div class="qa">
          <div class="qa-q">💬 <b>Sawaal:</b> ${b.q}</div>
          ${b.context || ""}
          ${points ? `<div class="qa-points"><b>Jawab ke main points:</b><ul>${points}</ul></div>` : ""}
          <div class="qa-a">${b.answer}</div>
        </div>` }];
    }
    case "pick": {
      const items = b.options.map(o => `<li>${o.correct ? "✅" : "❌"} ${o.text}<div class="small muted">${o.why || ""}</div></li>`).join("");
      return [{ type: "text", html: `
        <div class="qa">
          <div class="qa-q">🧭 <b>${b.q}</b></div>
          <ul class="qa-options">${items}</ul>
          ${b.answer ? `<div class="qa-a">${b.answer}</div>` : ""}
        </div>` }];
    }
    case "quiz":
      return [{ type: "text", html: `
        <div class="qa">
          <div class="qa-q">💡 <b>Ek common confusion:</b> ${b.q}</div>
          <div class="qa-a"><b>Jawab:</b> ${b.options[b.answer]}. ${b.why || ""}</div>
        </div>` }];
    case "order":
      return [{ type: "text", html: `
        <div class="qa">
          <div class="qa-q">🔢 <b>${b.q.replace(/\s*lagao:?/i, ":")}</b></div>
          <ol>${b.items.map(t => `<li>${t}</li>`).join("")}</ol>
          ${b.why || ""}
        </div>` }];
    case "exercise":
    case "code":
      return [];
    case "sim": {
      const out = [];
      const { goal, ...rest } = b;
      if (goal) out.push({ type: "tip", html: `🧪 <b>Simulator mein khud dekho:</b> ${goal.text.replace(/<b>cost[^<]*<\/b>/i, "").replace(/\s*Pehle bina[^.]*\.\s*Phir khud socho[^.]*\./i, "")}` });
      out.push(rest);
      if (goal && goal.answer) out.push({ type: "text", html: `<div class="model-answer"><b>Simulator se kya dikhta hai:</b> ${goal.answer}</div>` });
      return out;
    }
    default:
      return [b];
  }
}

const files = fs.readdirSync(dir).filter(f => f.endsWith(".js") && (!only.length || only.includes(f.replace(/\.js$/, ""))));
for (const f of files) {
  const ctx = { registerLesson(m, l, d) { ctx.d = d; ctx.l = l; } };
  vm.createContext(ctx);
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  vm.runInContext(src, ctx);
  const title = src.split("\n")[0];
  const d = ctx.d;
  d.blocks = d.blocks.flatMap(convert);
  fs.writeFileSync(path.join(dir, f), `${title}\nregisterLesson("hld", ${JSON.stringify(ctx.l)}, ${ser(d, 0)});\n`);
  console.log("✅", f, d.blocks.length, "blocks");
}
