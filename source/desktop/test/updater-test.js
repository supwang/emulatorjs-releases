// updater.js: download, size + SHA-256 check, damaged file, out-of-date version, install command line
"use strict";
const http = require("http"), crypto = require("crypto"), fs = require("fs"), os = require("os"), path = require("path");
const { createUpdater, newer } = require("../updater");
let fails = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fails++; console.error("FAIL", m); } };
const data = crypto.randomBytes(2 * 1024 * 1024);
const sha = crypto.createHash("sha256").update(data).digest("hex");
let bad = false;
const srv = http.createServer((q, r) => {
  if (q.url === "/latest") return r.end(JSON.stringify({ version: "9.0.1", files: { "win-setup": { url: "http://127.0.0.1:" + srv.address().port + "/dl/x.exe", size: data.length, sha256: bad ? "0".repeat(64) : sha } } }));
  if (q.url === "/old") return r.end(JSON.stringify({ version: "9.0.0" }));
  r.writeHead(200, { "Content-Length": data.length }); r.end(data);
});
srv.listen(0, "127.0.0.1", async () => {
  const P = srv.address().port, dir = fs.mkdtempSync(path.join(os.tmpdir(), "ejs-upd-"));
  fs.writeFileSync(path.join(dir, "Uninstall EmulatorJS.exe"), "");
  let spawned = null, quit = false;
  const mk = (extra = {}) => createUpdater(Object.assign({ fetch, version: "9.0.0", packaged: true, platform: "win32", execPath: path.join(dir, "EmulatorJS.exe"), tmpDir: dir,
    sources: ["http://127.0.0.1:" + P + "/latest", "http://127.0.0.1:" + P + "/old", "http://127.0.0.1:1/none"], downloadPrefix: "http://127.0.0.1:" + P + "/dl/",
    spawn: (f, a) => { spawned = [f, a]; return { unref() {} }; }, quit: () => { quit = true; }, env: { ProgramFiles: "C:\\Program Files" } }, extra));
  const wait = async u => { for (let i = 0; i < 100; i++) { const s = u.info().state; if (s.status !== "downloading") return s; await new Promise(r => setTimeout(r, 50)); } return u.info().state; };
  ok(newer("1.0.10", "1.0.9") && !newer("1.0.9", "1.0.9") && newer("1.1.0", "1.0.99") && !newer("x", "1.0.0"), "version compare");
  ok(mk({ platform: "darwin", arch: "arm64" }).info().kind === "mac-arm64" && !mk({ platform: "darwin" }).info().auto, "mac can't update itself");
  ok(mk({ execPath: path.join(os.tmpdir(), "nowhere", "EmulatorJS.exe") }).info().kind === "win-zip", "zip version");
  let u = mk();
  ok(u.info().kind === "win-setup" && u.info().auto, "installed version updates itself");
  u.start("9.0.1"); let s = await wait(u);
  ok(s.status === "ready" && fs.existsSync(s.file), "download + check: " + JSON.stringify(s));
  ok(!!u.install().ok, "install");
  await new Promise(r => setTimeout(r, 500));
  ok(spawned && spawned[1].join(" ") === "/S --updated --force-run /currentuser /D=" + dir && quit, "installer command line: " + (spawned && spawned[1].join(" ")));
  fs.rmSync(path.join(dir, "EmulatorJS-update"), { recursive: true, force: true });
  bad = true; u = mk(); u.start("9.0.1"); s = await wait(u);
  ok(s.status === "error" && /damaged/.test(s.error), "damaged download is refused: " + JSON.stringify(s));
  ok(!fs.readdirSync(path.join(dir, "EmulatorJS-update")).length, "damaged download is deleted");
  bad = false; u = mk(); u.start("9.0.0"); s = await wait(u);
  ok(s.status === "error", "only the newest version is downloaded");
  u = mk({ execPath: "C:\\Program Files\\EmulatorJS\\EmulatorJS.exe" });
  ok(u.info().kind === "win-zip", "(no uninstaller there: zip)");
  srv.close();
  console.log("updater test: " + (n - fails) + "/" + n + " checks passed");
  process.exit(fails ? 1 : 0);
});
