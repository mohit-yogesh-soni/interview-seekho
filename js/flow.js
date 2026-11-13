// "flow" block: animated architecture diagram (SVG). Request ek chalti hui dot ki tarah components ke beech jaati hai.
//
// { type: "flow", title, height (viewBox height, default auto),
//   nodes: [{ id, label, icon, x, y, w?, h?, kind? }]   x,y = center (viewBox width 1000). label mein "\n" se 2 lines.
//          kind: "client" | "service" | "data" | "queue" | "cache" | "external" (sirf color ke liye)
//   edges: [{ from, to, label?, dashed?, both? }]
//   steps: [{ title, html, paths: [["a","b","c"], ...] (ek saath chalne wali dots), path: [...] (ek dot),
//             active: [ids], fail: [ids], dim: [ids], color? }] }

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const KIND_COLORS = {
    client: "#e7f5ff", service: "#edf2ff", data: "#fff4e6", queue: "#f3f0ff", cache: "#ebfbee", external: "#f8f9fa"
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }

  // Line (from center a towards center b) ko rect ke border pe kaato
  function clip(n, tx, ty) {
    const dx = tx - n.x, dy = ty - n.y;
    if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
    const hw = n.w / 2 + 4, hh = n.h / 2 + 4;
    const s = Math.min(dx !== 0 ? hw / Math.abs(dx) : Infinity, dy !== 0 ? hh / Math.abs(dy) : Infinity);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }

  function segment(a, b) {
    const p = clip(a, b.x, b.y), q = clip(b, a.x, a.y);
    return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
  }

  Blocks.register("flow", (root, b) => {
    const nodes = {};
    for (const n of b.nodes) nodes[n.id] = Object.assign({ w: 150, h: 58, kind: "service" }, n);
    const maxY = Math.max(...b.nodes.map(n => n.y + (n.h || 58) / 2));
    const H = b.height || maxY + 30;

    root.innerHTML = `
      ${b.title ? `<div class="code-title">🎞️ ${esc(b.title)}</div>` : ""}
      <div class="flow-stage"></div>
      <div class="flow-caption"></div>
      <div class="btn-row steps-nav">
        <button class="btn small prev">← Pichhla</button>
        <button class="btn primary small next">Agla →</button>
        <button class="btn small play">▶ Auto play</button>
        <button class="btn small replay" title="Is step ka animation dobara">↻</button>
        <span class="muted small counter"></span>
      </div>
      <div class="steps-dots">${b.steps.map((_, k) => `<button class="dot" data-k="${k}" aria-label="Step ${k + 1}"></button>`).join("")}</div>`;

    const svg = el("svg", { viewBox: `0 0 1000 ${H}`, class: "flow-svg", role: "img", "aria-label": b.title || "diagram" });
    root.querySelector(".flow-stage").appendChild(svg);
    const defs = el("defs", {}, svg);
    const marker = el("marker", { id: "arrow-" + Math.random().toString(36).slice(2), viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#868e96" }, marker);
    const markerId = marker.getAttribute("id");

    // Order: edges → dot → nodes. Dot boxes ke NEECHE chalti hai: box mein "ghusti" dikhti hai, text nahi dhakti.
    const edgeLayer = el("g", {}, svg);
    const dotLayer = el("g", {}, svg);
    const nodeLayer = el("g", {}, svg);
    const edgeEls = [];

    for (const e of b.edges || []) {
      const a = nodes[e.from], c = nodes[e.to];
      if (!a || !c) continue;
      const s = segment(a, c);
      const line = el("line", Object.assign({}, s, { class: "flow-edge" + (e.dashed ? " dashed" : ""), "marker-end": `url(#${markerId})` }), edgeLayer);
      if (e.both) line.setAttribute("marker-start", `url(#${markerId})`);
      if (e.label) {
        const t = el("text", { x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 - 6, class: "flow-edge-label", "text-anchor": "middle" }, edgeLayer);
        t.textContent = e.label;
      }
      edgeEls.push({ e, line });
    }

    const nodeEls = {};
    for (const n of Object.values(nodes)) {
      const g = el("g", { class: "flow-node", "data-id": n.id }, nodeLayer);
      el("rect", { x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h, rx: 10, fill: KIND_COLORS[n.kind] || KIND_COLORS.service }, g);
      const lines = String(n.label).split("\n");
      const icon = n.icon ? n.icon + " " : "";
      lines.forEach((ln, i) => {
        const t = el("text", { x: n.x, y: n.y + (i - (lines.length - 1) / 2) * 17 + 5, "text-anchor": "middle", class: i === 0 ? "flow-label" : "flow-sub" }, g);
        t.textContent = (i === 0 ? icon : "") + ln;
      });
      nodeEls[n.id] = g;
    }

    let i = 0, timer = null, anim = null;

    function setClasses(step) {
      for (const [id, g] of Object.entries(nodeEls)) {
        g.classList.toggle("active", (step.active || []).includes(id));
        g.classList.toggle("fail", (step.fail || []).includes(id));
        g.classList.toggle("dim", (step.dim || []).includes(id));
      }
      const onPath = new Set();
      for (const p of stepPaths(step)) for (let k = 0; k + 1 < p.length; k++) { onPath.add(p[k] + ">" + p[k + 1]); onPath.add(p[k + 1] + ">" + p[k]); }
      for (const { e, line } of edgeEls) line.classList.toggle("hot", onPath.has(e.from + ">" + e.to));
    }

    function stepPaths(step) {
      if (step.paths) return step.paths;
      if (step.path) return [step.path];
      return [];
    }

    function animate(step) {
      cancelAnimationFrame(anim);
      dotLayer.innerHTML = "";
      for (const g of Object.values(nodeEls)) g.classList.remove("pulse");
      const paths = stepPaths(step).filter(p => p.length >= 2);
      if (!paths.length) return;
      const color = step.color || "#f03e3e";
      const runs = paths.map(p => {
        const segs = [];
        for (let k = 0; k + 1 < p.length; k++) {
          const a = nodes[p[k]], c = nodes[p[k + 1]];
          if (a && c) segs.push({ a, c, to: p[k + 1] });
        }
        const dot = el("circle", { r: 9, fill: color, class: "flow-dot" }, dotLayer);
        return { segs, dot };
      });
      const SEG_MS = 900;         // ek hop kitni der
      const PAUSE_MS = 900;       // poora path khatam hone ke baad ruk ke dobara
      const longest = Math.max(...runs.map(r => r.segs.length));
      const cycle = longest * SEG_MS + PAUSE_MS;
      let start = null;
      const clearPulse = () => { for (const g of Object.values(nodeEls)) g.classList.remove("pulse"); };
      const frame = now => {
        // rAF ka timestamp kabhi pehle frame mein start se chhota hota hai: isliye start pehle frame se lo
        if (start === null) start = now;
        const elapsed = Math.max(0, now - start) % cycle;
        if (elapsed < 16) clearPulse();                      // naya round
        for (const r of runs) {
          if (!r.segs.length) continue;
          const t = Math.max(0, elapsed / SEG_MS);
          const k = Math.min(Math.floor(t), r.segs.length - 1);
          const done = t >= r.segs.length;
          const { a, c } = r.segs[k];
          const f = done ? 1 : t - k;
          const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          r.dot.setAttribute("cx", a.x + (c.x - a.x) * ease);
          r.dot.setAttribute("cy", a.y + (c.y - a.y) * ease);
          r.dot.setAttribute("opacity", done ? 0 : 1);       // pause mein chhupao
          for (let j = 0; j <= k; j++) {
            const g = nodeEls[r.segs[j].a.id];
            if (g) g.classList.add("pulse");
          }
          if (f > 0.85 || done) { const g = nodeEls[r.segs[k].c.id]; if (g) g.classList.add("pulse"); }
        }
        anim = requestAnimationFrame(frame);                 // loop: jab tak step badle nahi
      };
      anim = requestAnimationFrame(frame);
    }

    function show() {
      const s = b.steps[i];
      setClasses(s);
      animate(s);
      root.querySelector(".flow-caption").innerHTML = `${s.title ? `<div class="step-title">${s.title}</div>` : ""}${s.html || ""}`;
      root.querySelector(".counter").textContent = `Step ${i + 1} / ${b.steps.length}`;
      root.querySelector(".prev").disabled = i === 0;
      root.querySelector(".next").disabled = i === b.steps.length - 1;
      root.querySelectorAll(".dot").forEach((d, k) => d.classList.toggle("on", k === i));
    }
    function stop() { clearTimeout(timer); timer = null; root.querySelector(".play").textContent = "▶ Auto play"; }
    // Har step utni der dikhe jitna uska animation (ek baar poora) + padhne ka time
    function stepDuration(step) {
      const hops = Math.max(1, ...stepPaths(step).map(p => p.length - 1));
      return Math.max(b.interval || 0, hops * 900 + 2200);
    }
    function scheduleNext() {
      timer = setTimeout(() => {
        if (i >= b.steps.length - 1) return stop();
        i++;
        show();
        scheduleNext();
      }, stepDuration(b.steps[i]));
    }
    root.querySelector(".prev").onclick = () => { stop(); if (i > 0) { i--; show(); } };
    root.querySelector(".next").onclick = () => { stop(); if (i < b.steps.length - 1) { i++; show(); } };
    root.querySelector(".replay").onclick = () => animate(b.steps[i]);
    root.querySelectorAll(".dot").forEach(d => d.onclick = () => { stop(); i = Number(d.dataset.k); show(); });
    root.querySelector(".play").onclick = () => {
      if (timer) return stop();
      if (i === b.steps.length - 1) i = 0;
      show();
      root.querySelector(".play").textContent = "⏸ Pause";
      scheduleNext();
    };
    show();
  });
})();
