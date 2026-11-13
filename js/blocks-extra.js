// Extra interactive blocks (Blocks.register se jodte hain). Format details: CONTENT_GUIDE.md
//   steps    : step-by-step animation (algorithm dry run, thread timeline, request flow)
//   pick     : multi-select ("kaunse components chahiye?"), score ke saath
//   order    : sahi order lagao (steps of a flow)
//   sim      : HLD capacity simulator (RPS badhao, components lagao)
//   sampling : LLM next-token probabilities, temperature aur top-p sliders

(function () {
  // ---------- steps ----------
  Blocks.register("steps", (el, b) => {
    let i = 0;
    let timer = null;
    el.innerHTML = `
      ${b.title ? `<div class="code-title">🎬 ${esc(b.title)}</div>` : ""}
      <div class="steps-stage"></div>
      <div class="btn-row steps-nav">
        <button class="btn small prev">← Pichhla</button>
        <button class="btn primary small next">Agla →</button>
        <button class="btn small play">▶ Auto play</button>
        <span class="muted small counter"></span>
      </div>
      <div class="steps-dots">${b.steps.map((_, k) => `<button class="dot" data-k="${k}" aria-label="Step ${k + 1}"></button>`).join("")}</div>`;
    const stage = el.querySelector(".steps-stage");
    function show() {
      const s = b.steps[i];
      stage.innerHTML = `${s.title ? `<div class="step-title">${s.title}</div>` : ""}${s.html || ""}${s.code ? `<pre class="code-static">${esc(s.code)}</pre>` : ""}`;
      el.querySelector(".counter").textContent = `Step ${i + 1} / ${b.steps.length}`;
      el.querySelector(".prev").disabled = i === 0;
      el.querySelector(".next").disabled = i === b.steps.length - 1;
      el.querySelectorAll(".dot").forEach((d, k) => d.classList.toggle("on", k === i));
    }
    function stop() { clearInterval(timer); timer = null; el.querySelector(".play").textContent = "▶ Auto play"; }
    el.querySelector(".prev").onclick = () => { stop(); if (i > 0) { i--; show(); } };
    el.querySelector(".next").onclick = () => { stop(); if (i < b.steps.length - 1) { i++; show(); } };
    el.querySelectorAll(".dot").forEach(d => d.onclick = () => { stop(); i = Number(d.dataset.k); show(); });
    el.querySelector(".play").onclick = () => {
      if (timer) return stop();
      if (i === b.steps.length - 1) i = 0;
      show();
      el.querySelector(".play").textContent = "⏸ Pause";
      timer = setInterval(() => { if (i >= b.steps.length - 1) return stop(); i++; show(); }, b.interval || 1800);
    };
    show();
  });

  // ---------- pick (multi-select) ----------
  // options: [{ text, correct: true/false, why }]
  // score = (sahi chune - galat chune) / total sahi × 10, minimum 0
  Blocks.register("pick", (el, b, key, { onScore }) => {
    const best = getScore(key);
    const order = b.shuffle === false ? b.options.map((_, i) => i) : shuffle(b.options.map((_, i) => i));
    el.innerHTML = `
      <div class="q-head"><span class="badge think">🎯 Chuno</span> ${b.q}
        <span class="best">${best !== undefined ? Blocks.scoreChip(best) : ""}</span></div>
      <div class="muted small">Ek se zyada sahi ho sakte hain. Jo sahi lage sab chuno, phir check karo.</div>
      <div class="pick-options">${order.map(i => `
        <label class="pick-opt" data-i="${i}"><input type="checkbox"> <span>${b.options[i].text}</span>
          <div class="pick-why hidden"></div></label>`).join("")}</div>
      <div class="btn-row"><button class="btn primary small check">✅ Check karo</button><button class="btn small retry hidden">↺ Dobara</button></div>
      <div class="pick-result"></div>`;
    el.querySelector(".check").onclick = () => {
      let right = 0, wrong = 0;
      const totalRight = b.options.filter(o => o.correct).length;
      el.querySelectorAll(".pick-opt").forEach(lab => {
        const o = b.options[Number(lab.dataset.i)];
        const picked = lab.querySelector("input").checked;
        lab.querySelector("input").disabled = true;
        if (picked && o.correct) right++;
        if (picked && !o.correct) wrong++;
        lab.classList.add(o.correct ? (picked ? "right" : "missed") : (picked ? "wrong" : "neutral"));
        const why = lab.querySelector(".pick-why");
        why.innerHTML = `${o.correct ? (picked ? "✅ Sahi chuna." : "⚠️ Ye bhi chahiye tha.") : (picked ? "❌ Ye nahi chahiye." : "👍 Sahi chhoda.")} ${o.why || ""}`;
        why.classList.remove("hidden");
      });
      const score = Math.max(0, Math.round(((right - wrong) / totalRight) * 10));
      saveScore(key, score);
      el.querySelector(".best").innerHTML = Blocks.scoreChip(getScore(key));
      el.querySelector(".pick-result").innerHTML = Blocks.ratingBox(score, `${right}/${totalRight} sahi chune${wrong ? `, ${wrong} galat` : ""}.`) + (b.answer ? `<div class="model-answer">${b.answer}</div>` : "");
      el.querySelector(".check").classList.add("hidden");
      el.querySelector(".retry").classList.remove("hidden");
      onScore && onScore();
    };
    el.querySelector(".retry").onclick = () => Blocks.rerender(el, b, key, { onScore });
  });

  // ---------- order ----------
  // items: sahi order mein likho, site shuffle karke dikhayegi
  Blocks.register("order", (el, b, key, { onScore }) => {
    const best = getScore(key);
    let cur = shuffle(b.items.map((_, i) => i));
    if (cur.every((v, i) => v === i)) cur.reverse();
    el.innerHTML = `
      <div class="q-head"><span class="badge think">🔢 Order lagao</span> ${b.q}
        <span class="best">${best !== undefined ? Blocks.scoreChip(best) : ""}</span></div>
      <div class="order-list"></div>
      <div class="btn-row"><button class="btn primary small check">✅ Check karo</button><button class="btn small retry hidden">↺ Dobara</button></div>
      <div class="order-result"></div>`;
    const list = el.querySelector(".order-list");
    let locked = false;
    function draw() {
      list.innerHTML = cur.map((idx, pos) => `
        <div class="order-item" data-pos="${pos}">
          <span class="order-num">${pos + 1}</span><span class="order-text">${b.items[idx]}</span>
          ${locked ? "" : `<span class="order-btns"><button class="btn small up" ${pos === 0 ? "disabled" : ""}>↑</button><button class="btn small down" ${pos === cur.length - 1 ? "disabled" : ""}>↓</button></span>`}
        </div>`).join("");
      list.querySelectorAll(".up").forEach(btn => btn.onclick = () => { const p = Number(btn.closest(".order-item").dataset.pos); [cur[p - 1], cur[p]] = [cur[p], cur[p - 1]]; draw(); });
      list.querySelectorAll(".down").forEach(btn => btn.onclick = () => { const p = Number(btn.closest(".order-item").dataset.pos); [cur[p + 1], cur[p]] = [cur[p], cur[p + 1]]; draw(); });
    }
    draw();
    el.querySelector(".check").onclick = () => {
      locked = true;
      draw();
      let ok = 0;
      list.querySelectorAll(".order-item").forEach((row, pos) => {
        const good = cur[pos] === pos;
        if (good) ok++;
        row.classList.add(good ? "right" : "wrong");
      });
      const score = Math.round((ok / cur.length) * 10);
      saveScore(key, score);
      el.querySelector(".best").innerHTML = Blocks.scoreChip(getScore(key));
      el.querySelector(".order-result").innerHTML = Blocks.ratingBox(score, `${ok}/${cur.length} sahi jagah pe.`) +
        `<div class="model-answer"><b>Sahi order:</b><ol>${b.items.map(t => `<li>${t}</li>`).join("")}</ol>${b.why || ""}</div>`;
      el.querySelector(".check").classList.add("hidden");
      el.querySelector(".retry").classList.remove("hidden");
      onScore && onScore();
    };
    el.querySelector(".retry").onclick = () => Blocks.rerender(el, b, key, { onScore });
  });

  // ---------- sim: HLD capacity simulator ----------
  // Hisaab: js/sim-model.js (simCompute)
  Blocks.register("sim", (el, b, key, { onScore }) => {
    const cfg = simConfig(b.config);
    const st = { rps: cfg.rps, servers: cfg.servers, lb: cfg.lb, cache: cfg.cache, hitRatio: cfg.hitRatio, replicas: cfg.replicas, shards: cfg.shards, queue: cfg.queue, readRatio: cfg.readRatio };
    const has = c => cfg.controls.includes(c);
    const best = getScore(key);
    el.innerHTML = `
      <div class="q-head"><span class="badge">🧪 Simulator</span> <b>${esc(b.title || "System ko load do")}</b>
        <span class="best">${best !== undefined ? Blocks.scoreChip(best) : ""}</span></div>
      ${b.goal ? `<div class="sim-goal">🎯 <b>Goal:</b> ${b.goal.text}</div>` : ""}
      <div class="sim-grid">
        <div class="sim-controls">
          ${has("rps") ? `<label>Traffic: <b class="v-rps"></b> RPS<input type="range" class="c-rps" min="100" max="${cfg.maxRps}" step="100"></label>` : ""}
          ${has("readRatio") ? `<label>Reads: <b class="v-read"></b>%<input type="range" class="c-read" min="0" max="100" step="5"></label>` : ""}
          ${has("lb") ? `<label class="sim-toggle"><input type="checkbox" class="c-lb"> ⚖️ Load Balancer</label>` : ""}
          ${has("servers") ? `<label>🖥️ App servers: <b class="v-servers"></b><input type="range" class="c-servers" min="1" max="50"></label>` : ""}
          ${has("cache") ? `<label class="sim-toggle"><input type="checkbox" class="c-cache"> ⚡ Cache (Redis)</label>` : ""}
          ${has("hitRatio") ? `<label>Cache hit ratio: <b class="v-hit"></b>%<input type="range" class="c-hit" min="0" max="99" step="1"></label>` : ""}
          ${has("replicas") ? `<label>📖 Read replicas: <b class="v-replicas"></b><input type="range" class="c-replicas" min="0" max="10"></label>` : ""}
          ${has("shards") ? `<label>🧩 DB shards: <b class="v-shards"></b><input type="range" class="c-shards" min="1" max="16"></label>` : ""}
          ${has("queue") ? `<label class="sim-toggle"><input type="checkbox" class="c-queue"> 📨 Writes ke liye Queue (async)</label>` : ""}
        </div>
        <div class="sim-view"></div>
      </div>
      <div class="sim-explain"></div>`;
    const q = s => el.querySelector(s);
    const bind = (sel, prop, parse) => { const c = q(sel); if (!c) return; if (c.type === "checkbox") c.checked = st[prop]; else c.value = prop === "hitRatio" || prop === "readRatio" ? Math.round(st[prop] * 100) : st[prop]; c.oninput = () => { st[prop] = parse(c); update(); }; };
    bind(".c-rps", "rps", c => Number(c.value));
    bind(".c-read", "readRatio", c => Number(c.value) / 100);
    bind(".c-lb", "lb", c => c.checked);
    bind(".c-servers", "servers", c => Number(c.value));
    bind(".c-cache", "cache", c => c.checked);
    bind(".c-hit", "hitRatio", c => Number(c.value) / 100);
    bind(".c-replicas", "replicas", c => Number(c.value));
    bind(".c-shards", "shards", c => Number(c.value));
    bind(".c-queue", "queue", c => c.checked);
    let scored = false;

    const compute = () => simCompute(cfg, st);

    function update() {
      ["rps", "servers", "replicas", "shards"].forEach(p => { const v = q(".v-" + p); if (v) v.textContent = st[p].toLocaleString("en-IN"); });
      if (q(".v-hit")) q(".v-hit").textContent = Math.round(st.hitRatio * 100);
      if (q(".v-read")) q(".v-read").textContent = Math.round(st.readRatio * 100);
      if (q(".c-servers")) q(".c-servers").disabled = !st.lb;
      if (q(".c-hit")) q(".c-hit").disabled = !st.cache;
      const r = compute();
      const color = u => u >= 1 ? "red" : u >= 0.75 ? "yellow" : "green";
      q(".sim-view").innerHTML = `
        <div class="sim-flow">👤 Users → ${st.lb ? "⚖️ LB → " : ""}🖥️ App ${st.cache ? "→ ⚡ Cache " : ""}→ 🗄️ DB${st.replicas ? " + 📖" : ""}${st.queue ? " (writes via 📨)" : ""}</div>
        ${r.comps.map(c => `
          <div class="sim-comp">
            <div class="sim-comp-head"><span>${c.name}</span><span class="muted small">${c.cap === Infinity ? "" : `${Math.round(c.load).toLocaleString("en-IN")} / ${Math.round(c.cap).toLocaleString("en-IN")} RPS`}</span></div>
            <div class="sim-bar"><div class="sim-fill ${color(c.u)}" style="width:${Math.min(100, c.u * 100)}%"></div></div>
            ${c.backlog ? `<div class="small" style="color:#a05a00">⏳ Backlog badh raha hai: ${Math.round(c.backlog).toLocaleString("en-IN")} writes/sec (spike ke baad clear hoga)</div>` : ""}
          </div>`).join("")}
        <div class="sim-stats">
          <div><span class="muted small">Avg latency</span><b>${isFinite(r.p50) ? Math.round(r.p50) + " ms" : "∞ (overload)"}</b></div>
          <div><span class="muted small">Errors</span><b class="${r.errorRate > 0.01 ? "bad-text" : ""}">${(r.errorRate * 100).toFixed(1)}%</b></div>
          <div><span class="muted small">Cost</span><b>${"₹".repeat(Math.min(5, Math.ceil(r.cost / 6)))} ${r.cost} units</b></div>
        </div>`;
      // Kya toot raha hai, Hinglish mein
      const worst = r.comps.reduce((a, c) => (c.u > a.u ? c : a));
      const tips = [];
      if (worst.u >= 1) tips.push(`🔥 <b>${worst.name}</b> overload hai (${Math.round(worst.u * 100)}%). Requests fail ho rahi hain.`);
      else if (worst.u >= 0.75) tips.push(`⚠️ <b>${worst.name}</b> ${Math.round(worst.u * 100)}% pe hai. Latency tezi se badhti hai jab utilization 100% ke paas jaata hai.`);
      if (!st.lb && st.rps > cfg.appCap && has("lb")) tips.push("💡 Ek server ki limit khatam. Zyada servers ke liye pehle Load Balancer chahiye.");
      if (worst.name.startsWith("🗄️") && st.readRatio >= 0.7 && !st.cache && has("cache")) tips.push("💡 Zyaadatar traffic reads hai. Cache se DB tak kam requests jaayengi.");
      if (worst.name.startsWith("🗄️") && st.readRatio < 0.5 && !st.queue && has("queue")) tips.push("💡 Writes zyada hain. Queue se spike smooth hota hai, aur sustained load ke liye shards chahiye.");
      if (r.backlog > 0) tips.push("⏳ Queue ne writes ko fail hone se bachaya, par agar ye load hamesha rahe to backlog kabhi khatam nahi hoga. Tab shards chahiye.");
      q(".sim-explain").innerHTML = tips.map(t => `<div class="tip-box">${t}</div>`).join("");

      if (b.goal) {
        const g = b.goal;
        const ok = simGoalMet(g, st, r);
        if (ok && !scored) {
          scored = true;
          const score = g.budget && r.cost > g.budget ? Math.max(5, 10 - Math.ceil((r.cost - g.budget) / Math.max(1, g.budget * 0.2))) : 10;
          saveScore(key, score);
          q(".best").innerHTML = Blocks.scoreChip(getScore(key));
          q(".sim-explain").insertAdjacentHTML("afterbegin", Blocks.ratingBox(score, g.budget && r.cost > g.budget ? `Goal poora, par cost ${r.cost} hai (budget ${g.budget}). Sasta design try karo.` : "Goal poora!") + (g.answer ? `<div class="model-answer">${g.answer}</div>` : ""));
          onScore && onScore();
        } else if (!ok) scored = false;
      }
    }
    update();
  });

  // ---------- sampling: next token probabilities ----------
  // tokens: [{ t: "biryani", logit: 3.1 }]  (logit = model ka raw score)
  Blocks.register("sampling", (el, b) => {
    let temp = b.temperature ?? 1, topP = b.topP ?? 1;
    el.innerHTML = `
      <div class="q-head"><span class="badge">🎲 LLM demo</span> <b>${esc(b.title || "Agla token kaunsa?")}</b></div>
      <div class="sampling-prompt">“${esc(b.prompt)} <span class="sampled">___</span>”</div>
      <div class="sim-controls two">
        <label>🌡️ Temperature: <b class="v-t"></b><input type="range" class="c-t" min="0.05" max="2" step="0.05" value="${temp}"></label>
        <label>🎯 Top-p: <b class="v-p"></b><input type="range" class="c-p" min="0.1" max="1" step="0.05" value="${topP}"></label>
      </div>
      <div class="prob-bars"></div>
      <div class="btn-row"><button class="btn primary small sample">🎲 Token sample karo</button><button class="btn small sample10">10 baar</button><span class="muted small hist"></span></div>
      <div class="muted small">Temperature kam = sabse probable token hi aata hai (boring, consistent). Zyada = random (creative, galti ka chance). Top-p = sirf utne top tokens jinki probability milake p tak pahunche.</div>`;
    const probs = () => {
      const scaled = b.tokens.map(x => x.logit / temp);
      const mx = Math.max(...scaled);
      const ex = scaled.map(v => Math.exp(v - mx));
      const sum = ex.reduce((a, v) => a + v, 0);
      const p = ex.map(v => v / sum);
      const idx = p.map((v, i) => i).sort((a, c) => p[c] - p[a]);
      const keep = new Set();
      let acc = 0;
      for (const i of idx) { keep.add(i); acc += p[i]; if (acc >= topP) break; }
      const kept = p.map((v, i) => (keep.has(i) ? v : 0));
      const ks = kept.reduce((a, v) => a + v, 0);
      return { p, final: kept.map(v => v / ks), keep };
    };
    const counts = {};
    function draw() {
      el.querySelector(".v-t").textContent = temp.toFixed(2);
      el.querySelector(".v-p").textContent = topP.toFixed(2);
      const { final, keep } = probs();
      el.querySelector(".prob-bars").innerHTML = b.tokens.map((x, i) => `
        <div class="prob-row ${keep.has(i) ? "" : "cut"}"><span class="prob-tok">${esc(x.t)}</span>
          <div class="sim-bar"><div class="sim-fill green" style="width:${(final[i] * 100).toFixed(1)}%"></div></div>
          <span class="prob-val">${(final[i] * 100).toFixed(1)}%</span></div>`).join("");
    }
    function sampleOnce() {
      const { final } = probs();
      let r = Math.random(), i = 0;
      for (; i < final.length - 1; i++) { r -= final[i]; if (r <= 0) break; }
      counts[b.tokens[i].t] = (counts[b.tokens[i].t] || 0) + 1;
      el.querySelector(".sampled").textContent = b.tokens[i].t;
      el.querySelector(".hist").textContent = Object.entries(counts).map(([t, n]) => `${t}: ${n}`).join(" · ");
    }
    el.querySelector(".c-t").oninput = e => { temp = Number(e.target.value); draw(); };
    el.querySelector(".c-p").oninput = e => { topP = Number(e.target.value); draw(); };
    el.querySelector(".sample").onclick = sampleOnce;
    el.querySelector(".sample10").onclick = () => { for (let k = 0; k < 10; k++) sampleOnce(); };
    draw();
  });
})();
