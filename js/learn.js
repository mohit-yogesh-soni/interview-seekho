// learn.html?m=<module>&l=<lesson>
// Module ka outline js/data/<module>.js se aata hai (registerModule).
// Har lesson ka content alag file mein: js/data/<module>/<lesson>.js (registerLesson). Sirf khula hua lesson load hota hai.

(function () {
  const moduleId = getParam("m") || "java";
  const meta = moduleById(moduleId);
  const main = document.getElementById("lesson-main");
  const side = document.getElementById("lesson-side");
  if (!meta) { main.innerHTML = `<p>Module nahi mila. <a href="index.html">Home</a></p>`; return; }
  document.title = `${meta.title} · Interview Seekho`;

  loadScript(`js/data/${moduleId}.js?v=${SITE_VERSION}`)
    .then(start)
    .catch(() => { main.innerHTML = `<p>Module ka data load nahi hua.</p>`; });

  function start() {
    const mod = MODULE_DATA[moduleId];
    const lessons = allLessons(mod);
    const lessonKey = l => `${moduleId}/${l.id}`;

    function renderSide(currentId) {
      side.innerHTML = `
        <a class="back" href="learn.html?m=${moduleId}">${meta.icon} ${esc(meta.title)}</a>
        ${moduleProgressBar(moduleId, lessons)}
        ${mod.chapters.map((ch, ci) => `
          <div class="side-chapter">
            <div class="side-ch-title">${ci + 1}. ${esc(ch.title)}</div>
            ${ch.lessons.map(l => `
              <a class="side-lesson ${l.id === currentId ? "active" : ""} ${isDone(lessonKey(l)) ? "done" : ""}"
                 href="learn.html?m=${moduleId}&l=${l.id}">
                <span class="tick">${isDone(lessonKey(l)) ? "✅" : "○"}</span> ${esc(l.title)}
              </a>`).join("")}
          </div>`).join("")}`;
    }

    function renderOverview() {
      renderSide(null);
      const firstOpen = lessons.find(l => !isDone(lessonKey(l))) || lessons[0];
      main.innerHTML = `
        <div class="level-head">
          <h1>${meta.icon} ${esc(meta.title)}</h1>
          <p class="muted">${esc(mod.intro || meta.desc)}</p>
          <div class="btn-row"><a class="btn primary" href="learn.html?m=${moduleId}&l=${firstOpen.id}">${isDone(lessonKey(lessons[0])) ? "Wahin se continue karo" : "Shuru karo"} →</a></div>
        </div>
        ${mod.howTo ? `<div class="tip-box">${mod.howTo}</div>` : ""}
        ${mod.chapters.map((ch, ci) => `
          <section class="panel">
            <h2>${ci + 1}. ${esc(ch.title)}</h2>
            ${ch.desc ? `<p class="muted">${esc(ch.desc)}</p>` : ""}
            <div class="lesson-list">${ch.lessons.map(l => `
              <a class="lesson-row ${isDone(lessonKey(l)) ? "done" : ""}" href="learn.html?m=${moduleId}&l=${l.id}">
                <span>${isDone(lessonKey(l)) ? "✅" : "📘"} ${esc(l.title)}</span>
                <span class="muted small">${l.plan ? esc(l.plan.slice(0, 2).join(" · ")) : ""}</span>
              </a>`).join("")}</div>
          </section>`).join("")}
        ${mod.references ? `<section class="panel"><h2>📚 Is module ke main sources</h2>${refsHtml(mod.references)}</section>` : ""}`;
    }

    async function renderLesson(lesson) {
      const idx = lessons.indexOf(lesson);
      const prev = lessons[idx - 1];
      const next = lessons[idx + 1];
      const key = lessonKey(lesson);
      renderSide(lesson.id);
      main.innerHTML = `<p class="muted">Lesson load ho raha hai...</p>`;
      let content = null;
      try {
        await loadScript(`js/data/${moduleId}/${lesson.id}.js?v=${SITE_VERSION}`);
        content = LESSON_DATA[`${moduleId}/${lesson.id}`];
      } catch { /* file nahi mili: plan dikhao */ }

      main.innerHTML = `
        <div class="lesson-head">
          <div class="muted small">${esc(lesson.chapter)} · Lesson ${idx + 1}/${lessons.length}</div>
          <h1>${esc(lesson.title)}</h1>
          ${content && content.why ? `<div class="why-box"><b>🎯 Ye kyun seekhna hai:</b> ${content.why}</div>` : ""}
        </div>
        <div id="blocks"></div>
        ${content && content.references ? `<section class="panel refs"><h3>📚 Aur padho / dekho</h3>${refsHtml(content.references)}</section>` : ""}
        <div class="lesson-foot">
          ${prev ? `<a class="btn small" href="learn.html?m=${moduleId}&l=${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}
          ${content ? `<button class="btn ${isDone(key) ? "" : "primary"}" id="done-btn">${isDone(key) ? "✅ Complete" : "✓ Lesson complete"}</button>` : ""}
          ${next ? `<a class="btn small" href="learn.html?m=${moduleId}&l=${next.id}">${esc(next.title)} →</a>` : "<span></span>"}
        </div>`;
      const blocksEl = document.getElementById("blocks");
      if (!content) {
        blocksEl.innerHTML = `<div class="panel soon-panel"><h3>🚧 Ye lesson abhi ban raha hai</h3>
          ${lesson.plan ? `<p>Isme ye aayega:</p><ul>${lesson.plan.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div>`;
        return;
      }
      Blocks.render(blocksEl, content.blocks, key, { onScore: () => renderSide(lesson.id) });
      const doneBtn = document.getElementById("done-btn");
      doneBtn.onclick = () => {
        markDone(key);
        renderSide(lesson.id);
        if (next) location.href = `learn.html?m=${moduleId}&l=${next.id}`;
        else { doneBtn.textContent = "✅ Complete"; doneBtn.classList.remove("primary"); }
      };
      window.scrollTo(0, 0);
    }

    const lessonId = getParam("l");
    const lesson = lessonId && lessons.find(l => l.id === lessonId);
    if (lesson) renderLesson(lesson);
    else renderOverview();
  }

  // references: [{ title, by, url, type: "book" | "video" | "article" | "docs" | "course", note }]
  function refsHtml(refs) {
    const icon = { book: "📗", video: "🎥", article: "📰", docs: "📄", course: "🎓" };
    return `<ul class="ref-list">${refs.map(r => `<li>${icon[r.type] || "🔗"} ${r.url
      ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>` : `<b>${esc(r.title)}</b>`}${r.by ? ` <span class="muted">· ${esc(r.by)}</span>` : ""}${r.note ? ` <span class="muted small">(${esc(r.note)})</span>` : ""}</li>`).join("")}</ul>`;
  }
})();
