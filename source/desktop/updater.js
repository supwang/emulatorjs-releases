// Updates for the desktop app.
// The game page checks for a new version itself (latest.json in the public download repository) and shows the
// notice; this file does the part only the app can do: on the installed Windows version, download the new
// installer, check it (size + SHA-256 from latest.json), then close the app and run the installer silently
// into the same folder (it opens EmulatorJS again when it is done).
// Mac (no Apple signature) and the Windows zip version can't replace themselves: the page links to the download.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO = "supwang/emulatorjs-releases";
const SOURCES = [
  "https://api.github.com/repos/" + REPO + "/contents/latest.json?ref=main",
  "https://cdn.jsdelivr.net/gh/" + REPO + "@main/latest.json",
  "https://raw.githubusercontent.com/" + REPO + "/main/latest.json",
];
const DOWNLOAD_PREFIX = "https://github.com/" + REPO + "/releases/download/";

const SLOW_AFTER_MS = 8000;        // judge the speed after this long
const SLOW_IF_LEFT_S = 300;        // "slow" when the rest would take longer than 5 minutes
const STALL_MS = 30000;            // no data for this long: give up
const CONNECT_MS = 25000;          // no answer from the server for this long: give up

function verParts(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v || "").trim());
  return m ? m.slice(1).map(Number) : null;
}
function newer(a, b) {   // is version a newer than version b?
  const x = verParts(a), y = verParts(b);
  if (!x || !y) return false;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

function createUpdater(o) {
  const doFetch = o.fetch;                       // Electron's net.fetch (uses the system proxy settings)
  const current = o.version;
  const platform = o.platform || process.platform;
  const exeDir = path.dirname(o.execPath || process.execPath);
  const dlDir = path.join(o.tmpDir, "EmulatorJS-update");
  const sources = o.sources || SOURCES;
  const prefix = o.downloadPrefix || DOWNLOAD_PREFIX;
  const env = o.env || process.env;

  // which download fits this copy, and can it update itself?
  let kind = "", auto = false;
  if (platform === "win32") {
    const installed = fs.existsSync(path.join(exeDir, "Uninstall EmulatorJS.exe"));   // made by the installer
    kind = installed ? "win-setup" : "win-zip";
    auto = installed && !!o.packaged;
  } else if (platform === "darwin") kind = (o.arch || process.arch) === "arm64" ? "mac-arm64" : "mac-x64";
  else kind = "linux";

  let state = { status: "idle" };
  let abort = null;

  // leftovers of earlier updates
  try {
    for (const f of fs.readdirSync(dlDir)) {
      const m = /-(\d+\.\d+\.\d+)\.exe(\.part)?$/.exec(f);
      if (!m || m[2] || !newer(m[1], current)) fs.rmSync(path.join(dlDir, f), { force: true });
    }
  } catch (e) {}

  async function getLatest() {
    const one = async url => {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 10000);
      try {
        const r = await doFetch(url, { signal: ac.signal, cache: "no-store", headers: { Accept: "application/vnd.github.raw+json" } });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = JSON.parse(await r.text());
        if (!verParts(j.version)) throw new Error("no version");
        return j;
      } finally { clearTimeout(t); }
    };
    const got = (await Promise.allSettled(sources.map(one))).filter(x => x.status === "fulfilled").map(x => x.value);
    if (!got.length) throw new Error("can't reach the download site");
    return got.reduce((a, b) => (newer(b.version, a.version) ? b : a));
  }

  function fileOk(f, size, sha) {
    try {
      if (fs.statSync(f).size !== size) return false;
      return crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex") === sha;
    } catch (e) { return false; }
  }

  async function download(version) {
    const latest = await getLatest();
    if (latest.version !== version || !newer(version, current)) throw new Error("this version is no longer the newest");
    const f = latest.files && latest.files[kind];
    const size = f && Number(f.size), sha = f && String(f.sha256 || "").toLowerCase();
    if (!f || typeof f.url !== "string" || !f.url.startsWith(prefix) || !(size > 0) || !/^[0-9a-f]{64}$/.test(sha))
      throw new Error("no download for this version");
    fs.mkdirSync(dlDir, { recursive: true });
    const final = path.join(dlDir, "EmulatorJS-Setup-" + version + ".exe");
    if (fileOk(final, size, sha)) return final;          // downloaded earlier
    const part = final + ".part";

    const ac = new AbortController();
    abort = () => ac.abort();
    let last = Date.now(), timer = null, why = "";
    const stop = w => { why = w; ac.abort(); };
    timer = setInterval(() => { if (Date.now() - last > (state.got ? STALL_MS : CONNECT_MS)) stop("stalled"); }, 1000);
    const out = fs.createWriteStream(part);
    const hash = crypto.createHash("sha256");
    try {
      const r = await doFetch(f.url, { signal: ac.signal, cache: "no-store" });
      if (!r.ok || !r.body) throw new Error("HTTP " + r.status);
      const start = Date.now(), marks = [[start, 0]];
      let got = 0;
      const reader = r.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += value.length; last = Date.now();
        if (got > size) throw new Error("the file is bigger than expected");
        hash.update(value);
        if (!out.write(Buffer.from(value))) await new Promise(res => out.once("drain", res));
        marks.push([last, got]);
        while (marks.length > 2 && last - marks[0][0] > 5000) marks.shift();   // speed over the last 5 seconds
        const dt = (last - marks[0][0]) / 1000, speed = dt > 0.5 ? (got - marks[0][1]) / dt : 0;
        const eta = speed > 0 ? Math.round((size - got) / speed) : null;
        state = Object.assign({}, state, { got, total: size, speed: Math.round(speed), eta,
          slow: state.slow || (last - start > SLOW_AFTER_MS && (eta === null || eta > SLOW_IF_LEFT_S)) });
      }
      await new Promise((res, rej) => out.end(err => (err ? rej(err) : res())));
      if (got !== size || hash.digest("hex") !== sha) throw new Error("the download is damaged");
      fs.renameSync(part, final);
      return final;
    } catch (e) {
      out.destroy();
      try { fs.rmSync(part, { force: true }); } catch (x) {}
      if (why === "stalled") throw new Error("stalled");
      if (ac.signal.aborted) throw new Error("cancelled");
      throw e;
    } finally { clearInterval(timer); abort = null; }
  }

  return {
    info: () => ({ kind, auto, current, state }),
    start(version) {
      if (!auto) return { error: "this copy can't update itself" };
      if (state.status === "downloading" || state.status === "installing") return { ok: true };
      if (state.status === "ready" && state.version === version) return { ok: true };
      state = { status: "downloading", version, got: 0, total: 0, speed: 0, eta: null, slow: false };
      download(version).then(file => { state = { status: "ready", version, file }; },
        e => { state = { status: e.message === "cancelled" ? "idle" : "error", version, error: e.message }; });
      return { ok: true };
    },
    cancel() { if (abort) abort(); return { ok: true }; },
    install() {
      if (state.status !== "ready" || !state.file) return { error: "not downloaded" };
      // per-machine install (Program Files) or just for this user, the same folder as now
      const low = exeDir.toLowerCase();
      const pf = [env.ProgramFiles, env.ProgramW6432, env["ProgramFiles(x86)"]].filter(Boolean).map(s => s.toLowerCase().replace(/\\+$/, "") + "\\");
      const mode = pf.some(p => low.startsWith(p)) ? "/allusers" : "/currentuser";
      const args = ["/S", "--updated", "--force-run", mode, "/D=" + exeDir];   // /D= must come last, without quotes
      state = Object.assign({}, state, { status: "installing" });
      o.spawn(state.file, args, { detached: true, stdio: "ignore", windowsHide: false }).unref();
      setTimeout(() => o.quit(), 400);
      return { ok: true };
    },
  };
}

module.exports = { createUpdater, newer, REPO };
