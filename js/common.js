// Common helpers: navbar, modules ki list, progress aur scores (localStorage).
// Har page pe ye file load hoti hai.

// Data files ke URL mein lagta hai, taaki update ke baad browser purani file cache se na de
const SITE_VERSION = 3;

// Saare modules. Har module ka data js/data/<id>.js mein hai.
const MODULES = [
  { id: "java",        icon: "☕", short: "Java",        title: "Java Basics → Streams",  desc: "Variables se lekar OOP, Collections, Lambdas aur Streams tak. Har topic pe code likho aur chalao." },
  { id: "dsa",         icon: "🧩", short: "DSA",         title: "DSA Patterns",            desc: "Big-O se shuru, phir 20 patterns. Har pattern ka template aur 2-3 medium questions with test cases." },
  { id: "concurrency", icon: "🧵", short: "Concurrency", title: "Java Concurrency",        desc: "Thread se synchronized, ReentrantLock, CountDownLatch, Semaphore, Executors aur interview classics." },
  { id: "lld",         icon: "🧱", short: "LLD",         title: "Low Level Design",        desc: "OOP, UML, SOLID, design patterns, DB design. Phir Parking Lot se Chess tak, pehle aap socho." },
  { id: "hld",         icon: "🌐", short: "HLD",         title: "High Level Design",       desc: "Request kaise chalti hai se shuru. LB, cache, queue, DB scaling. Har design simple se shuru, traffic ke saath badhta hai, har component ka reason aur alternative." },
  { id: "ai",          icon: "🤖", short: "AI",          title: "AI, LLMs & Agents",       desc: "LLM kaise banta aur chalta hai, prompting, RAG, agents aur AI system design." }
];

function moduleById(id) {
  return MODULES.find(m => m.id === id);
}

// ---------- Navbar ----------
function renderNav() {
  const header = document.getElementById("site-nav");
  if (!header) return;
  const page = location.pathname.split("/").pop() || "index.html";
  const currentModule = new URLSearchParams(location.search).get("m");
  const links = [`<a href="index.html"${page === "index.html" ? ' class="active"' : ""}>🏠 Home</a>`]
    .concat(MODULES.map(m => {
      const active = page === "learn.html" && currentModule === m.id ? ' class="active"' : "";
      return `<a href="learn.html?m=${m.id}"${active}>${m.icon} ${esc(m.short)}</a>`;
    })).join("");
  header.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html">&lt;/&gt; <span>Interview Seekho</span></a>
      <button class="nav-toggle" aria-label="Menu">☰</button>
      <nav class="nav-links">${links}</nav>
    </div>`;
  header.querySelector(".nav-toggle").addEventListener("click", () => {
    header.querySelector(".nav-links").classList.toggle("open");
  });
}

// ---------- Storage (sab kuch ek hi key mein, browser ke localStorage mein) ----------
const STORE_KEY = "interview-seekho-v1";

function loadStore() {
  try {
    return Object.assign({ done: {}, scores: {}, code: {} }, JSON.parse(localStorage.getItem(STORE_KEY)));
  } catch {
    return { done: {}, scores: {}, code: {} };
  }
}

function saveStore(s) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn("localStorage save nahi hua", e);
  }
}

// Lesson complete
function markDone(key) { const s = loadStore(); s.done[key] = true; saveStore(s); }
function isDone(key) { return !!loadStore().done[key]; }

// Kisi block ka score (0-10). Sirf best score rakhte hain.
function saveScore(key, score) {
  const s = loadStore();
  if (s.scores[key] === undefined || score > s.scores[key]) s.scores[key] = score;
  saveStore(s);
}
function getScore(key) { return loadStore().scores[key]; }

// User ka likha code (editor) save
function saveCode(key, code) { const s = loadStore(); s.code[key] = code; saveStore(s); }
function getCode(key) { return loadStore().code[key]; }
function clearCode(key) { const s = loadStore(); delete s.code[key]; saveStore(s); }

// Score ko label mein badlo (rating)
function ratingLabel(score) {
  if (score >= 9) return { emoji: "🔥", text: "Interview ready!", cls: "great" };
  if (score >= 7) return { emoji: "👍", text: "Achha hai, thoda polish karo", cls: "good" };
  if (score >= 4) return { emoji: "🙂", text: "Theek hai, gaps dekho", cls: "ok" };
  return { emoji: "📚", text: "Revise karo, phir try karo", cls: "low" };
}

// ---------- Misc ----------
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Data files is function se apna module (outline) register karti hain
const MODULE_DATA = {};
function registerModule(data) {
  MODULE_DATA[data.id] = data;
}

// Lesson files: registerLesson("java", "loops", { why, blocks, references })
const LESSON_DATA = {};
function registerLesson(moduleId, lessonId, data) {
  LESSON_DATA[`${moduleId}/${lessonId}`] = data;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error("load failed: " + src)); };
    document.body.appendChild(s);
  });
}

// Module ke saare lessons ek flat list mein (order ke saath)
function allLessons(mod) {
  return mod.chapters.flatMap(ch => ch.lessons.map(l => ({ ...l, chapter: ch.title })));
}

// Module kitna complete hua (done lessons / total). Home page bhi use karta hai (lessons ke bina).
function moduleDoneCount(moduleId) {
  const prefix = moduleId + "/";
  return Object.keys(loadStore().done).filter(k => k.startsWith(prefix)).length;
}

function moduleProgressBar(moduleId, lessons) {
  const done = lessons.filter(l => isDone(`${moduleId}/${l.id}`)).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  return `<div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="muted small">${done}/${lessons.length} lessons · ${pct}%</div>`;
}

document.addEventListener("DOMContentLoaded", renderNav);
