// DSA exercises ke task + examples ko English statements se replace karta hai (tools/dsa-statements-*.mjs).
// Usage: node tools/apply-dsa-statements.mjs
import fs from "node:fs";
import { A } from "./dsa-statements-a.mjs";
import { B } from "./dsa-statements-b.mjs";

const ALL = { ...A, ...B };
const tpl = s => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

// JS string literal (backtick / double / single quote) ka end index, start = opening quote
function literalEnd(src, start) {
  const q = src[start];
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") { i++; continue; }
    if (src[i] === q) return i;
  }
  throw new Error("unterminated literal");
}
function replaceField(src, from, field, value) {
  const re = new RegExp(`\\n\\s*${field}: `, "g");
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m) throw new Error(`${field} not found`);
  const nextBlock = src.indexOf('type: "', from + 1);
  if (nextBlock > 0 && m.index > nextBlock) throw new Error(`${field} is block mein nahi hai`);
  const start = m.index + m[0].length;
  const end = literalEnd(src, start);
  return src.slice(0, start) + tpl(value) + src.slice(end + 1);
}

const byLesson = {};
for (const [k, v] of Object.entries(ALL)) {
  const [lesson, id] = k.split("::");
  (byLesson[lesson] ??= []).push([id, v]);
}
let n = 0;
for (const [lesson, list] of Object.entries(byLesson)) {
  const file = `js/data/dsa/${lesson}.js`;
  let src = fs.readFileSync(file, "utf8");
  for (const [id, v] of list) {
    const at = src.indexOf(`id: "${id}"`);
    if (at < 0) { console.log("❌ id nahi mila:", lesson, id); continue; }
    src = replaceField(src, at, "task", v.task);
    src = replaceField(src, src.indexOf(`id: "${id}"`), "examples", v.examples);
    n++;
  }
  fs.writeFileSync(file, src);
}
console.log(`updated ${n} exercises`);
