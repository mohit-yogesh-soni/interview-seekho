// HLD simulator ka hisaab (pure function). Browser (blocks-extra.js) aur tools/verify-content.mjs dono use karte hain.
// Model (simple, samjhane ke liye):
//   app servers: har server appCap RPS. LB ke bina sirf 1 server.
//   reads = rps × readRatio. Cache hit pe DB tak nahi jaate.
//   DB reads primaries + replicas mein bant-te hain; writes sirf primary(s) pe, shards se bant-te hain.
//   Queue on: writes async, DB sirf bachi capacity (90% tak) jitni writes leta hai, baaki backlog.
//   Utilization u = load / capacity. Latency ≈ base / (1 - u)  (u ≥ 1 → overload, requests fail).

const SIM_DEFAULTS = {
  rps: 1000, maxRps: 100000, readRatio: 0.9,
  appCap: 2000, dbCap: 3000, cacheCap: 100000,
  appMs: 20, dbMs: 10, cacheMs: 1,
  servers: 1, lb: false, cache: false, hitRatio: 0.8, replicas: 0, shards: 1, queue: false,
  controls: ["rps", "lb", "servers", "cache", "replicas", "shards", "queue"],
  costs: { server: 1, db: 3, cache: 2, lb: 1, queue: 1 }
};

function simConfig(config) {
  return Object.assign({}, SIM_DEFAULTS, config || {}, { costs: Object.assign({}, SIM_DEFAULTS.costs, (config || {}).costs) });
}

function simCompute(cfg, st) {
  const servers = st.lb ? st.servers : 1;
  const reads = st.rps * st.readRatio;
  const writes = st.rps - reads;
  const hit = st.cache ? st.hitRatio : 0;
  const dbReads = reads * (1 - hit);
  const comps = [];
  comps.push({ kind: "app", name: `🖥️ App servers ×${servers}`, load: st.rps, cap: servers * cfg.appCap, u: st.rps / (servers * cfg.appCap), ms: cfg.appMs });
  if (st.cache) comps.push({ kind: "cache", name: "⚡ Cache", load: reads, cap: cfg.cacheCap, u: reads / cfg.cacheCap, ms: cfg.cacheMs });
  const primaries = st.shards;
  const readNodes = primaries + st.replicas * primaries;
  const writePerPrimary = writes / primaries;
  const readPerNode = dbReads / readNodes;
  const primaryLoad = writePerPrimary + readPerNode;
  let primaryU = primaryLoad / cfg.dbCap;
  let backlog = 0;
  if (st.queue && readPerNode < cfg.dbCap) {
    const room = cfg.dbCap * 0.9 - readPerNode;
    backlog = Math.max(0, writePerPrimary - Math.max(0, room)) * primaries;
    primaryU = Math.min(primaryLoad, cfg.dbCap * 0.9) / cfg.dbCap;
  }
  comps.push({ kind: "db", name: `🗄️ DB primary${primaries > 1 ? ` ×${primaries} (shards)` : ""}`, load: primaryLoad * primaries, cap: cfg.dbCap * primaries, u: primaryU, ms: cfg.dbMs });
  if (st.replicas) comps.push({ kind: "replica", name: `📖 Read replicas ×${st.replicas * primaries}`, load: readPerNode * st.replicas * primaries, cap: cfg.dbCap * st.replicas * primaries, u: readPerNode / cfg.dbCap, ms: cfg.dbMs });
  if (st.queue) comps.push({ kind: "queue", name: "📨 Queue (writes)", load: writes, cap: Infinity, u: Math.min(0.3, writes / 1e6), ms: 2, backlog });
  const worst = Math.max(...comps.map(c => c.u));
  const errorRate = worst >= 1 ? 1 - 1 / worst : 0;
  const lat = c => (c.u >= 1 ? Infinity : c.ms / (1 - c.u));
  const appC = comps.find(c => c.kind === "app");
  const cacheC = comps.find(c => c.kind === "cache");
  const dbC = comps.find(c => c.kind === "db");
  const repC = comps.find(c => c.kind === "replica");
  const readDb = repC ? Math.max(lat(dbC), lat(repC)) : lat(dbC);
  const readLat = lat(appC) + (cacheC ? lat(cacheC) + (1 - hit) * readDb : readDb);
  const writeLat = lat(appC) + (st.queue ? 2 : lat(dbC));
  const p50 = st.readRatio * readLat + (1 - st.readRatio) * writeLat;
  const cost = servers * cfg.costs.server + (st.lb ? cfg.costs.lb : 0) + (st.cache ? cfg.costs.cache : 0)
    + (primaries + st.replicas * primaries) * cfg.costs.db + (st.queue ? cfg.costs.queue : 0);
  return { comps, errorRate, p50, cost, backlog, servers };
}

function simGoalMet(goal, st, r) {
  return st.rps >= goal.rps && r.errorRate <= (goal.maxErrors ?? 0.01) && r.p50 <= (goal.maxLatency ?? Infinity) && (goal.noBacklog ? r.backlog === 0 : true);
}
