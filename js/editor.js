// Code editor (CodeMirror 5, MIT license) + Run ka output dikhana.
// CodeMirror na mile (offline) to simple textarea chal jaata hai.

function createEditor(textarea, { onRun } = {}) {
  if (!window.CodeMirror) {
    textarea.classList.add("plain-editor");
    textarea.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = textarea.selectionStart;
        textarea.setRangeText("    ", s, textarea.selectionEnd, "end");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && onRun) { e.preventDefault(); onRun(); }
    });
    return {
      getValue: () => textarea.value,
      setValue: v => { textarea.value = v; },
      markErrors: () => {},
      clearMarks: () => {},
      onChange: fn => textarea.addEventListener("input", fn)
    };
  }
  const cm = CodeMirror.fromTextArea(textarea, {
    mode: "text/x-java",
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    extraKeys: {
      "Ctrl-Enter": () => onRun && onRun(),
      "Cmd-Enter": () => onRun && onRun(),
      Tab: c => c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("    ", "end")
    }
  });
  let marks = [];
  return {
    getValue: () => cm.getValue(),
    setValue: v => cm.setValue(v),
    // Compile error wali lines laal karo
    markErrors(lines) {
      this.clearMarks();
      for (const l of lines) {
        const h = cm.addLineClass(l - 1, "background", "cm-error-line");
        marks.push(h);
      }
      if (lines.length) cm.scrollIntoView({ line: lines[0] - 1, ch: 0 }, 60);
    },
    clearMarks() {
      for (const h of marks) cm.removeLineClass(h, "background", "cm-error-line");
      marks = [];
    },
    onChange: fn => cm.on("change", fn),
    refresh: () => cm.refresh()
  };
}

// javac ki errors ko Hinglish mein samjhao (sabse common wali)
const ERROR_HINTS = [
  [/';' expected/, "Line ke end mein semicolon ( ; ) bhool gaye."],
  [/cannot find symbol/, "Ye naam (variable / method / class) Java ko nahi mila. Spelling, capital letters, ya import check karo."],
  [/incompatible types/, "Type match nahi ho raha. Jaise String ko int mein daal rahe ho."],
  [/missing return statement/, "Method kuch return karta hai, par har raste pe return nahi likha."],
  [/class, interface, enum, or record expected/, "Bracket { } ka hisaab gadbad hai. Koi } extra hai ya method class ke bahar hai."],
  [/reached end of file while parsing/, "Koi closing bracket } missing hai."],
  [/might not have been initialized/, "Variable ko use karne se pehle value do."],
  [/is public, should be declared in a file named/, "Public class ka naam file ke naam jaisa hona chahiye. Yahan class ka naam mat badlo."],
  [/unreported exception/, "Ye method checked exception phenk sakta hai. try-catch lagao ya method pe 'throws' likho."],
  [/non-static .* cannot be referenced from a static context/, "static main() se non-static cheez seedha use nahi hoti. Object banao (new ...) ya usko static karo."],
  [/already defined/, "Same naam ka variable/method do baar bana diya."],
  [/unclosed string literal/, "String ka closing quote \" missing hai."]
];

function compileErrorHint(message) {
  const hit = ERROR_HINTS.find(([re]) => re.test(message));
  return hit ? hit[1] : "";
}

// Run result ko HTML mein badlo
function renderRunResult(res, { expectedOutput } = {}) {
  if (res.phase === "compile") {
    const list = res.errors.map(e => {
      const hint = compileErrorHint(e.message);
      return `<li><b>Line ${e.line}</b>: <code>${esc(e.message)}</code>${hint ? `<div class="err-hint">💡 ${esc(hint)}</div>` : ""}</li>`;
    }).join("");
    return `<div class="out-head bad">❌ Compile error (${res.errors.length})</div>
      ${list ? `<ul class="err-list">${list}</ul>` : ""}
      <details><summary>Poora javac output</summary><pre class="out">${esc(res.raw)}</pre></details>`;
  }

  let html = "";
  const exitMsg = { 1: "💥 Exception aaya", 2: "⚠️ Setup problem", 3: "⏱️ Time limit khatam" }[res.exit];
  if (res.tests.length) {
    const s = res.summary || { pass: res.tests.filter(t => t.pass).length, total: res.tests.length };
    const all = s.pass === s.total;
    html += `<div class="out-head ${all ? "good" : "bad"}">${all ? "✅" : "❌"} Tests: ${s.pass}/${s.total} pass</div>
      <div class="test-table">${res.tests.map(t => `
        <div class="test-row ${t.pass ? "pass" : "fail"}">
          <div class="t-name">${t.pass ? "✅" : "❌"} ${t.hidden ? "🔒 " : ""}${esc(t.name)} <span class="muted small">${t.ms} ms</span></div>
          ${t.pass ? "" : `<div class="t-detail"><div><span class="muted">Expected:</span> <code>${esc(t.expected)}</code></div>
            <div><span class="muted">Aapka:</span> <code>${esc(t.actual)}</code></div></div>`}
        </div>`).join("")}</div>`;
  } else if (expectedOutput !== undefined) {
    const ok = normalizeOutput(res.stdout) === normalizeOutput(expectedOutput);
    html += `<div class="out-head ${ok && res.ok ? "good" : "bad"}">${ok && res.ok ? "✅ Output sahi hai!" : "❌ Output match nahi hua"}</div>`;
    if (!ok) html += `<div class="muted small">Expected output:</div><pre class="out expected">${esc(expectedOutput)}</pre>`;
  } else if (!exitMsg) {
    html += `<div class="out-head good">✅ Chal gaya</div>`;
  }
  if (exitMsg) html += `<div class="out-head bad">${exitMsg}</div>`;
  if (res.stdout) html += `<div class="muted small">Output:</div><pre class="out">${esc(res.stdout)}</pre>`;
  else if (!res.tests.length) html += `<pre class="out muted">(kuch print nahi hua)</pre>`;
  if (res.exit === 3) html += `<p class="small muted">Atka hua thread background mein chal sakta hai. Site slow lage to page reload karo.</p>`;
  html += `<div class="timing">Compile ${res.compileMs} ms · Run ${res.runMs} ms</div>`;
  return html;
}

function normalizeOutput(s) {
  return String(s || "").replace(/\r/g, "").split("\n").map(l => l.trimEnd()).join("\n").trim();
}
