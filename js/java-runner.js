// Java ko browser mein compile + run karta hai (CheerpJ 5, free for personal/educational use).
//
// Flow:
//   1. Files /str/ mein likho (CheerpJ ka JS → Java filesystem; sub-folder nahi chalte)
//   2. javac chalao → .class files /files/runN mein (har run ka alag folder)
//   3. seekho.Launcher chalao: naya ClassLoader, time limit, test results ke markers
//
// CheerpJ System.out/err ko id="console" wale element mein likhta hai. Ek hidden #console rakhte hain
// aur har run ke baad uska text padh ke saaf kar dete hain.

const JavaRunner = (() => {
  const CHEERPJ_URL = "https://cjrtnc.leaningtech.com/5.0/loader.js";
  const EXIT_RE = /@@SEEKHO_EXIT (\d+)@@/;
  let initPromise = null;
  let queue = Promise.resolve();
  let runCount = 0;
  let consoleEl = null;
  let previousFiles = [];

  // /app/ = website ka root. GitHub Pages pe sub-path (/repo-name/) bhi hota hai, isliye page URL se banate hain.
  function launcherJar() {
    return "/app" + new URL("runtime/launcher.jar", location.href).pathname;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("CheerpJ load nahi hua. Internet check karo."));
      document.head.appendChild(s);
    });
  }

  // Pehli baar Run dabane pe hi CheerpJ load hota hai (page fast khulta hai)
  function init(onStatus) {
    if (initPromise) return initPromise;
    if (location.protocol === "file:") {
      return Promise.reject(new Error("Java runner ke liye site ko server se kholo (file:// pe CheerpJ nahi chalta). README dekho."));
    }
    initPromise = (async () => {
      onStatus && onStatus("☕ Java (CheerpJ) load ho raha hai... pehli baar 5-15 second lagte hain");
      consoleEl = document.getElementById("console");
      if (!consoleEl) {
        consoleEl = document.createElement("pre");
        consoleEl.id = "console";
        consoleEl.hidden = true;
        document.body.appendChild(consoleEl);
      }
      await loadScript(CHEERPJ_URL);
      await cheerpjInit({ version: 17, status: "none" });
    })();
    initPromise.catch(() => { initPromise = null; });
    return initPromise;
  }

  // Console mein marker aane tak ruko (thread wale programs mein promise late resolve ho sakta hai)
  function waitForExit(promise, limitMs) {
    return new Promise(resolve => {
      let done = false;
      const finish = code => { if (!done) { done = true; clearInterval(poll); clearTimeout(hard); resolve(code); } };
      const poll = setInterval(() => {
        const m = consoleEl.textContent.match(EXIT_RE);
        if (m) finish(Number(m[1]));
      }, 40);
      const hard = setTimeout(() => finish(3), limitMs + 8000);
      promise.then(() => setTimeout(() => {
        const m = consoleEl.textContent.match(EXIT_RE);
        finish(m ? Number(m[1]) : 0);
      }, 100));
    });
  }

  // javac ki errors ko line number ke saath nikaalo:  /str/Main.java:5: error: ';' expected
  function parseCompileErrors(text) {
    const errors = [];
    const re = /\/str\/(\w+\.java):(\d+): (error|warning): (.*)/g;
    let m;
    while ((m = re.exec(text))) errors.push({ file: m[1], line: Number(m[2]), kind: m[3], message: m[4] });
    return errors;
  }

  // Test markers:  @@T|PASS|visible|name|expected|actual|ms
  function parseOutput(text) {
    const dec = s => s.replace(/\\n/g, "\n").replace(/\\p/g, "|").replace(/\\\\/g, "\\");
    const tests = [];
    let summary = null;
    const lines = [];
    for (const line of text.replace(EXIT_RE, "").split("\n")) {
      if (line.startsWith("@@T|")) {
        const p = line.split("|");
        tests.push({ pass: p[1] === "PASS", hidden: p[2] === "hidden", name: dec(p[3]), expected: dec(p[4]), actual: dec(p[5]), ms: Number(p[6]) });
      } else if (line.startsWith("@@SUMMARY|")) {
        const p = line.split("|");
        summary = { pass: Number(p[1]), fail: Number(p[2]), total: Number(p[3]) };
      } else {
        lines.push(line);
      }
    }
    return { stdout: lines.join("\n").replace(/\n+$/, ""), tests, summary };
  }

  async function runNow({ files, mainClass = "Main", mode = "sample", timeLimitMs = 10000, onStatus }) {
    await init(onStatus);
    runCount++;
    const out = `/files/run${runCount}`;

    // Pichhle run ki extra files hatao, taaki wo is compile mein na aayein
    for (const f of previousFiles) {
      if (!files[f] && typeof cheerpOSRemoveStringFile === "function") {
        try { cheerpOSRemoveStringFile("/str/" + f); } catch {}
      }
    }
    previousFiles = Object.keys(files);
    const paths = [];
    for (const [name, src] of Object.entries(files)) {
      cheerpOSAddStringFile("/str/" + name, src);
      paths.push("/str/" + name);
    }

    consoleEl.textContent = "";
    onStatus && onStatus("🔨 Compile ho raha hai...");
    const c0 = performance.now();
    const rc = await cheerpjRunMain("com.sun.tools.javac.Main", "",
      "-g", "-encoding", "UTF-8", "-nowarn", "-cp", launcherJar(), "-d", out, ...paths);
    const compileMs = Math.round(performance.now() - c0);
    const compileText = consoleEl.textContent;
    if (rc !== 0) {
      return { ok: false, phase: "compile", compileMs, raw: compileText.replace(/\/str\//g, ""), errors: parseCompileErrors(compileText) };
    }

    consoleEl.textContent = "";
    onStatus && onStatus("▶️ Chal raha hai...");
    const r0 = performance.now();
    const p = cheerpjRunMain("seekho.Launcher", launcherJar() + ":" + out, out, mainClass, String(timeLimitMs), mode);
    const exit = await waitForExit(p, timeLimitMs);
    const runMs = Math.round(performance.now() - r0);
    const parsed = parseOutput(consoleEl.textContent);
    consoleEl.textContent = "";
    return { ok: exit === 0, phase: "run", exit, compileMs, runMs, ...parsed };
  }

  // Ek time pe ek hi run (CheerpJ ka ek hi console aur JVM hai)
  function run(opts) {
    const job = queue.then(() => runNow(opts));
    queue = job.catch(() => {});
    return job;
  }

  return { run, init };
})();
