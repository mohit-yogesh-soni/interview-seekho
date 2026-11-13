// ASCII <pre class="diagram"> ko animated flow blocks se badalta hai.
//   node tools/apply-flows.mjs tools/flows-hld.mjs hld
// Idempotent nahi: ek baar chalao (match na mile to skip + warning).
import fs from "node:fs";
import path from "node:path";

const [specFile, moduleId] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const specs = (await import(path.resolve(specFile))).default;

function indentJson(obj) {
  return JSON.stringify(obj, null, 2).split("\n").map((l, i) => (i === 0 ? l : "    " + l)).join("\n");
}

for (const s of specs) {
  const file = path.join(root, "js", "data", moduleId, s.file + ".js");
  let src = fs.readFileSync(file, "utf8");
  const preStarts = [...src.matchAll(/<pre class=\\?"diagram\\?">/g)].map(m => m.index);
  const start = s.mode === "insert" ? 0 : preStarts.find(i => src.indexOf(s.match, i) > i && src.indexOf(s.match, i) < src.indexOf("</pre>", i));
  if (start === undefined) { console.log(`⚠️  ${s.file}: diagram "${s.match}" nahi mila (skip)`); continue; }
  const end = s.mode === "insert" ? 0 : src.indexOf("</pre>", start) + "</pre>".length;
  const json = indentJson(s.flow);
  if (s.mode === "split") {
    src = src.slice(0, start) + "`\n    },\n    " + json + ",\n    {\n      type: \"text\",\n      html: `" + src.slice(end);
    // khaali text blocks hatao
    src = src.replace(/\{\s*type: "text",\s*html: `\s*`\s*\},?\s*\n(\s*)/g, "\n$1");
  } else {
    if (s.mode === "after") src = src.slice(0, start) + src.slice(end);
    const idPos = s.afterText ? src.indexOf(s.afterText) : src.indexOf(`id: "${s.afterId}"`);
    const next = src.indexOf("\n    {\n      type:", idPos);
    if (idPos < 0 || next < 0) { console.log(`⚠️  ${s.file}: afterId ${s.afterId} ke baad jagah nahi mili`); continue; }
    src = src.slice(0, next) + "\n    " + json + "," + src.slice(next);
  }
  fs.writeFileSync(file, src);
  console.log(`✅ ${s.file}`);
}
