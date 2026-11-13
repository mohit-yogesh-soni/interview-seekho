// Lesson ke "blocks" banane wala code. Har lesson blocks ki list hai:
//   text     : normal explanation (html)
//   tip/warn : highlight box (html)
//   code     : chalne wala example, edit karke Run karo
//   exercise : aap code likho, tests / expected output se check (Run = sample, Submit = sab tests)
//   quiz     : MCQ, jawab ke saath "kyun"
//   think    : "Pehle aap socho" - apna jawab likho, rubric se score (0-10), phir model answer
//
// Har interactive block ka key = "<lessonKey>:<block.id ya index>". Score aur code isi key pe save hote hain.

const Blocks = (() => {
  let editors = [];

  function render(container, blocks, lessonKey, { onScore } = {}) {
    editors = [];
    container.innerHTML = blocks.map((b, i) => `<div class="block block-${b.type}" data-i="${i}"></div>`).join("");
    blocks.forEach((b, i) => {
      const el = container.querySelector(`[data-i="${i}"]`);
      const key = `${lessonKey}:${b.id || i}`;
      const fn = RENDERERS[b.type];
      if (!fn) { el.innerHTML = `<p class="warn">Unknown block: ${esc(b.type)}</p>`; return; }
      fn(el, b, key, { onScore });
    });
    // CodeMirror ko layout ke baad refresh chahiye
    setTimeout(() => editors.forEach(e => e.refresh && e.refresh()), 0);
  }

  // ---------- simple ----------
  function text(el, b) { el.innerHTML = b.html; }
  function tip(el, b) { el.innerHTML = `<div class="tip-box">${b.html}</div>`; }
  function warn(el, b) { el.innerHTML = `<div class="tip-box warn">${b.html}</div>`; }

  // ---------- code (example) ----------
  function code(el, b, key) {
    el.innerHTML = `
      ${b.title ? `<div class="code-title">▶️ ${esc(b.title)}</div>` : ""}
      <textarea spellcheck="false"></textarea>
      <div class="btn-row">
        <button class="btn primary small run">▶ Run <span class="kbd">Ctrl+Enter</span></button>
        <button class="btn small reset" title="Original code wapas">↺ Reset</button>
        <span class="status muted small"></span>
      </div>
      <div class="output hidden"></div>
      ${b.note ? `<p class="muted small">${b.note}</p>` : ""}`;
    const saved = getCode(key);
    const ed = setupEditor(el, saved ?? b.code, key, () => doRun());
    async function doRun() {
      await runInto(el, { files: { "Main.java": ed.getValue() } }, ed, "Main.java");
    }
    el.querySelector(".run").onclick = doRun;
    el.querySelector(".reset").onclick = () => { ed.setValue(b.code); clearCode(key); };
  }

  // ---------- exercise ----------
  // b.userFile: user kis file mein likhta hai ("Main.java" default, ya "Solution.java" jab harness ho)
  // b.harness : Main.java jo seekho.Check se tests chalata hai (user ko nahi dikhta)
  // b.expectedOutput: harness na ho to stdout match karte hain
  function exercise(el, b, key, { onScore }) {
    const userFile = b.userFile || (b.harness ? "Solution.java" : "Main.java");
    const best = getScore(key);
    el.innerHTML = `
      <div class="ex-head">
        <span class="badge">🏋️ Practice</span> <b>${esc(b.title)}</b>
        ${b.level ? `<span class="tag lvl-${b.level}">${esc(b.level)}</span>` : ""}
        <span class="best">${best !== undefined ? scoreChip(best) : ""}</span>
      </div>
      <div class="ex-task">${b.task}</div>
      ${b.examples ? `<div class="ex-examples">${b.examples}</div>` : ""}
      <div class="file-name">📄 ${esc(userFile)}</div>
      <textarea spellcheck="false"></textarea>
      <div class="btn-row">
        <button class="btn primary small run">▶ Run${b.harness ? " (sample tests)" : ""}</button>
        ${b.harness ? `<button class="btn small submit">🚀 Submit (saare tests)</button>` : ""}
        ${b.hints && b.hints.length ? `<button class="btn small hint">💡 Hint</button>` : ""}
        ${b.solution ? `<button class="btn small sol">🔑 Solution</button>` : ""}
        <button class="btn small reset">↺ Reset</button>
        <span class="status muted small"></span>
      </div>
      <div class="hints"></div>
      <div class="output hidden"></div>
      <div class="solution hidden"></div>`;
    const ed = setupEditor(el, getCode(key) ?? b.starter, key, () => doRun("sample"));
    let hintsShown = 0;
    let solutionSeen = false;

    async function doRun(mode) {
      const files = { [userFile]: ed.getValue() };
      if (b.harness) files["Main.java"] = b.harness;
      const res = await runInto(el, { files, mode, timeLimitMs: b.timeLimitMs }, ed, userFile, { expectedOutput: b.expectedOutput });
      if (!res || res.phase !== "run") return;
      let score = null;
      if (b.harness && mode === "all" && res.summary) {
        score = Math.round((res.summary.pass / res.summary.total) * 10);
      } else if (!b.harness && b.expectedOutput !== undefined) {
        score = res.ok && normalizeOutput(res.stdout) === normalizeOutput(b.expectedOutput) ? 10 : 0;
      }
      if (score === null) return;
      // Solution dekh ke pass kiya to max 5, hints pe 1-1 point kam
      const finalScore = solutionSeen ? Math.min(score, 5) : Math.max(0, score - hintsShown);
      saveScore(key, finalScore);
      el.querySelector(".best").innerHTML = scoreChip(getScore(key));
      el.querySelector(".output").insertAdjacentHTML("afterbegin", ratingBox(finalScore,
        solutionSeen ? "Solution dekh ke kiya, isliye max 5." : hintsShown ? `${hintsShown} hint liye, utne point kam.` : ""));
      onScore && onScore();
    }
    el.querySelector(".run").onclick = () => doRun("sample");
    if (b.harness) el.querySelector(".submit").onclick = () => doRun("all");
    if (b.hints && b.hints.length) {
      el.querySelector(".hint").onclick = () => {
        if (hintsShown >= b.hints.length) return;
        el.querySelector(".hints").insertAdjacentHTML("beforeend",
          `<div class="tip-box">💡 <b>Hint ${hintsShown + 1}:</b> ${b.hints[hintsShown]}</div>`);
        hintsShown++;
        if (hintsShown >= b.hints.length) el.querySelector(".hint").disabled = true;
      };
    }
    if (b.solution) {
      el.querySelector(".sol").onclick = () => {
        const box = el.querySelector(".solution");
        if (!box.classList.contains("hidden")) { box.classList.add("hidden"); return; }
        if (!solutionSeen && !confirm("Pehle khud try kiya? Solution dekhne ke baad is exercise ka max score 5 hoga.")) return;
        solutionSeen = true;
        box.innerHTML = `<div class="code-title">🔑 Solution</div><pre class="code-static">${esc(b.solution)}</pre>
          ${b.explain ? `<div class="explain">${b.explain}</div>` : ""}
          <button class="btn small use-sol">Editor mein daalo</button>`;
        box.classList.remove("hidden");
        box.querySelector(".use-sol").onclick = () => ed.setValue(b.solution);
      };
    }
    el.querySelector(".reset").onclick = () => {
      if (confirm("Apna code mita ke starter code wapas laayein?")) { ed.setValue(b.starter); clearCode(key); }
    };
  }

  // ---------- quiz ----------
  function quiz(el, b, key, { onScore }) {
    el.innerHTML = `
      <div class="q-head"><span class="badge">❓ Quiz</span> ${b.q}</div>
      <div class="options">${b.options.map((o, i) => `<button class="option" data-i="${i}">${o}</button>`).join("")}</div>
      <div class="why hidden"></div>`;
    let answered = false;
    el.querySelectorAll(".option").forEach(btn => btn.onclick = () => {
      if (answered) return;
      answered = true;
      const pick = Number(btn.dataset.i);
      const right = pick === b.answer;
      el.querySelectorAll(".option").forEach((o, i) => {
        o.disabled = true;
        if (i === b.answer) o.classList.add("right");
        else if (i === pick) o.classList.add("wrong");
      });
      const why = el.querySelector(".why");
      why.innerHTML = `${right ? "✅ <b>Sahi!</b>" : "❌ <b>Galat.</b>"} ${b.why || ""}`;
      why.classList.remove("hidden");
      saveScore(key, right ? 10 : 0);
      onScore && onScore();
    });
  }

  // ---------- think: pehle aap socho, phir rating, phir answer ----------
  // b.rubric: [{ point: "Cache lagana", keys: ["cache", "redis"], weight: 2 }]
  //   point "mila" maana jaata hai agar aapke jawab mein koi bhi key (chhote letters mein) mile.
  //   Answer dikhne ke baad aap khud bhi tick kar sakte ho ("maine alag shabdon mein bola tha").
  function think(el, b, key, { onScore }) {
    const best = getScore(key);
    el.innerHTML = `
      <div class="q-head"><span class="badge think">🤔 Pehle aap socho</span> ${b.q}
        <span class="best">${best !== undefined ? scoreChip(best) : ""}</span></div>
      ${b.context ? `<div class="think-context">${b.context}</div>` : ""}
      <textarea class="think-input" rows="${b.rows || 5}" placeholder="${esc(b.placeholder || "Apna jawab yahan likho. Points mein likh sakte ho. Jo bhi socha wo likho, galat hone ka darr nahi.")}"></textarea>
      <div class="btn-row">
        <button class="btn primary small check">✅ Mera jawab check karo</button>
        <button class="btn small giveup">🙈 Pata nahi, answer dikhao</button>
      </div>
      <div class="think-result hidden"></div>`;
    const input = el.querySelector(".think-input");
    input.value = getCode(key) || "";
    input.addEventListener("input", () => saveCode(key, input.value));

    function evaluate(giveUp) {
      const ans = input.value.toLowerCase();
      if (!giveUp && ans.trim().length < 10) {
        input.focus();
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
        return;
      }
      const items = b.rubric.map(r => ({ ...r, weight: r.weight || 1, hit: !giveUp && r.keys.some(k => ans.includes(k.toLowerCase())) }));
      const box = el.querySelector(".think-result");
      const total = items.reduce((s, r) => s + r.weight, 0);
      const draw = () => {
        const got = items.reduce((s, r) => s + (r.hit || r.self ? r.weight : 0), 0);
        const score = Math.round((got / total) * 10);
        saveScore(key, score);
        el.querySelector(".best").innerHTML = scoreChip(getScore(key));
        box.querySelector(".rating-slot").innerHTML = ratingBox(score, giveUp ? "Koi baat nahi. Answer padho, phir kal dobara try karna." : "");
        onScore && onScore();
      };
      box.innerHTML = `
        <div class="rating-slot"></div>
        <div class="rubric">
          <div class="muted small">Ye points interviewer sunna chahta hai. Jo aapne alag shabdon mein kaha tha usko khud tick karo (imaandari se 🙂):</div>
          ${items.map((r, i) => `
            <label class="rubric-item ${r.hit ? "hit" : ""}">
              <input type="checkbox" data-i="${i}" ${r.hit ? "checked disabled" : ""}>
              <span>${r.hit ? "✅" : "⬜"} ${r.point}${r.weight > 1 ? ` <span class="muted small">(×${r.weight})</span>` : ""}</span>
            </label>`).join("")}
        </div>
        <div class="model-answer"><div class="code-title">📘 Model answer</div>${b.answer}</div>`;
      box.classList.remove("hidden");
      box.querySelectorAll("input[type=checkbox]:not([disabled])").forEach(cb => cb.onchange = () => {
        items[Number(cb.dataset.i)].self = cb.checked;
        cb.nextElementSibling.innerHTML = `${cb.checked ? "☑️" : "⬜"} ${items[Number(cb.dataset.i)].point}`;
        draw();
      });
      draw();
    }
    el.querySelector(".check").onclick = () => evaluate(false);
    el.querySelector(".giveup").onclick = () => evaluate(true);
  }

  // ---------- helpers ----------
  function setupEditor(el, initial, key, onRun) {
    const ta = el.querySelector("textarea");
    ta.value = initial;
    const ed = createEditor(ta, { onRun });
    let t;
    ed.onChange(() => { clearTimeout(t); t = setTimeout(() => saveCode(key, ed.getValue()), 400); });
    editors.push(ed);
    return ed;
  }

  async function runInto(el, opts, ed, userFile, renderOpts = {}) {
    const status = el.querySelector(".status");
    const out = el.querySelector(".output");
    const buttons = el.querySelectorAll(".run, .submit");
    buttons.forEach(x => { x.disabled = true; });
    ed.clearMarks();
    try {
      const res = await JavaRunner.run({ ...opts, onStatus: s => { status.textContent = s; } });
      status.textContent = "";
      if (res.phase === "compile") {
        // Sirf user ki file ki errors editor mein laal karo
        ed.markErrors(res.errors.filter(e => e.file === userFile && e.kind === "error").map(e => e.line));
      }
      out.innerHTML = renderRunResult(res, renderOpts);
      out.classList.remove("hidden");
      return res;
    } catch (e) {
      status.textContent = "";
      out.innerHTML = `<div class="out-head bad">⚠️ ${esc(e.message)}</div>`;
      out.classList.remove("hidden");
      return null;
    } finally {
      buttons.forEach(x => { x.disabled = false; });
    }
  }

  function scoreChip(score) {
    const r = ratingLabel(score);
    return `<span class="score-chip ${r.cls}" title="Best score">${r.emoji} ${score}/10</span>`;
  }

  function ratingBox(score, note) {
    const r = ratingLabel(score);
    return `<div class="rating ${r.cls}"><div class="rating-score">${r.emoji} ${score}/10</div>
      <div><b>${r.text}</b>${note ? `<div class="small">${esc(note)}</div>` : ""}</div></div>`;
  }

  // Ek block ko dobara banao (retry ke liye)
  function rerender(el, b, key, opts) {
    RENDERERS[b.type](el, b, key, opts);
  }

  const RENDERERS = { text, tip, warn, code, exercise, quiz, think };
  return { render, rerender, scoreChip, ratingBox, register: (type, fn) => { RENDERERS[type] = fn; } };
})();
