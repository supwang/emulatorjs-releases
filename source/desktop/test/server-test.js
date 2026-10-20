// Quick check of the built-in server (run by the build before packaging): node test/server-test.js
"use strict";
const path = require("path");
const os = require("os");
const fs = require("fs");
const assert = require("assert");
const { createServer } = require("../server");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ejs-test-"));
const roms = path.join(tmp, "roms", "nes");
fs.mkdirSync(roms, { recursive: true });
fs.writeFileSync(path.join(roms, "test.nes"), Buffer.alloc(1000, 7));
const PORT = 18765;
const base = "http://127.0.0.1:" + PORT;
const call = async (p, body, extra = {}) => {
  const r = await fetch(base + p, body === undefined ? { headers: extra } : { method: "POST", headers: Object.assign({ "X-EJS": "1", "Content-Type": "application/json" }, extra), body: JSON.stringify(body) });
  const ct = r.headers.get("content-type") || "";
  return { status: r.status, headers: r.headers, data: ct.includes("json") ? await r.json() : await r.arrayBuffer() };
};

(async () => {
  const srv = createServer({ port: PORT, webDir: path.join(__dirname, "..", "..", "web"), configFile: path.join(tmp, "config.json"), appDirs: [tmp] });
  await srv.start();
  let n = 0;
  const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
  try {
    let r = await call("/index.html");
    ok(r.status === 200 && r.data.byteLength > 1000, "page is served");
    r = await call("/data/loader.js");
    ok(r.status === 200 && /javascript/.test(r.headers.get("content-type")), "scripts are served");
    r = await call("/api/config");
    ok(r.data.roms.ok && r.data.roms.path === path.join(tmp, "roms"), "finds the roms folder next to the app");
    r = await call("/api/list?root=roms");
    ok(JSON.stringify(r.data.files) === JSON.stringify([["nes/test.nes", 1000]]), "lists roms");
    r = await call("/fs/roms/nes/test.nes", undefined, { Range: "bytes=10-19" });
    ok(r.status === 206 && r.data.byteLength === 10, "reads part of a rom");
    r = await call("/fs/roms/..%2F..%2Fetc%2Fpasswd");
    ok(r.status === 404, "cannot read outside the folder");
    const evil = await new Promise(res => require("http").get({ host: "127.0.0.1", port: PORT, path: "/index.html", headers: { Host: "evil.example:" + PORT } }, x => { x.resume(); res(x.statusCode); }));
    ok(evil === 403, "rejects other host names");
    r = await call("/api/mp/host", { client: "h1", name: "Host", game: "g", title: "Game", allowWatch: false });
    const sid = r.data.sid;
    ok(sid && sid.length === 10, "hosts a game");
    r = await call("/api/mp/join", { client: "w1", name: "Watcher", sid, watch: true });
    ok(r.status === 403 && r.data.code === "no_watch", "spectating can be switched off");
    r = await call("/api/mp/join", { client: "g1", name: "Guest", sid, acct: "Bob" });
    ok(r.status === 200 && r.data.slot === 1, "joins as player 2");
    r = await call("/api/mp/kick", { client: "h1", sid, target: "g1" });
    ok(r.status === 200, "host sends a player away");
    r = await call("/api/mp/join", { client: "g2", name: "Guest2", sid, acct: "bob" });
    ok(r.status === 403 && r.data.code === "kicked" && r.data.minutes === 30, "sent-away player can't come back for 30 minutes");
    r = await call("/api/cloud", { url: "1.2.3.4", key: "k" });
    ok(r.data.cloud.url === "http://1.2.3.4:8765", "saves the internet play server");
    r = await call("/api/cloud", { url: "5.6.7.8", key: "k2", list: [{ url: "1.2.3.4", key: "k" }, { url: "5.6.7.8", key: "k2" }, { url: "ftp://x" }] });
    ok(r.data.cloud.url === "http://5.6.7.8:8765" && r.data.cloud.list.length === 2 && r.data.cloud.list[0].url === "http://1.2.3.4:8765", "keeps a list of internet play servers");
    // a ROM downloaded from another player is written piece by piece into our ROM folder
    const put = (q, buf) => fetch(base + "/api/rom/save?" + new URLSearchParams(q), { method: "POST", headers: { "X-EJS": "1" }, body: buf }).then(async x => ({ status: x.status, data: await x.json() }));
    const rom = Buffer.alloc(300000); for (let i = 0; i < rom.length; i++) rom[i] = i % 251;
    r = await put({ kind: "roms", rel: "FBNeo/kof97.zip", offset: 0, total: rom.length }, rom.subarray(0, 200000));
    ok(r.status === 200 && !r.data.done, "first piece of a downloaded ROM is accepted");
    r = await put({ kind: "roms", rel: "FBNeo/kof97.zip", offset: 200000, total: rom.length }, rom.subarray(200000));
    ok(r.data.done && r.data.rel === "FBNeo/kof97.zip" && fs.readFileSync(path.join(tmp, "roms", "FBNeo", "kof97.zip")).equals(rom), "downloaded ROM is saved complete");
    r = await put({ kind: "roms", rel: "nes/test.nes", offset: 0, total: 5 }, Buffer.from("hello"));
    ok(r.data.rel === "nes/EmulatorJS downloads/test.nes" && fs.readFileSync(path.join(roms, "test.nes")).length === 1000, "a different file with the same name never overwrites ours");
    r = await put({ kind: "roms", rel: "../../evil.exe", offset: 0, total: 5 }, Buffer.from("hello"));
    ok(r.status === 400, "program files are refused");
    r = await put({ kind: "bios", rel: "neogeo.zip", offset: 0, total: 5 }, Buffer.from("hello"));
    ok(r.data.kind === "roms" && r.data.rel === "neogeo.zip", "BIOS goes into the ROM folder when there is no BIOS folder");
    r = await put({ kind: "thumbs", rel: "Nintendo - NES/Named_Boxarts/Test.png", offset: 0, total: 4 }, Buffer.from("png1"));
    ok(r.data.done && fs.readFileSync(path.join(tmp, "thumbnails", "Nintendo - NES", "Named_Boxarts", "Test.png"), "utf8") === "png1", "a downloaded preview picture makes a thumbnails folder");
    r = await put({ kind: "thumbs", rel: "Nintendo - NES/Named_Boxarts/Test.png", offset: 0, total: 5, keep: 1 }, Buffer.from("png22"));
    ok(r.data.rel === "Nintendo - NES/Named_Boxarts/Test.png" && fs.readFileSync(path.join(tmp, "thumbnails", "Nintendo - NES", "Named_Boxarts", "Test.png"), "utf8") === "png1", "an existing preview picture is kept");
    r = await call("/api/mp/host", { client: "dev1", name: "开发者", game: "nes/x.nes", title: "x", system: "nes" });
    let ss = (await call("/api/mp/sessions")).data.sessions;
    ok(!ss.some(x => x.hostName === "开发者"), "the developer name needs the developer account");
    r = await call("/api/mp/host", { client: "dev2", name: "开发者", acct: "开发者", game: "nes/y.nes", title: "y", system: "nes" });
    ss = (await call("/api/mp/sessions")).data.sessions;
    ok(ss.some(x => x.hostName === "开发者"), "the developer account can use the developer name");
    // a device's id comes with a secret: someone who only knows the id (it's public in room lists) can't pose as it
    r = await call("/api/mp/host", { client: "sec1", csec: "s3cret-one", name: "Owner", game: "nes/z.nes", title: "z", system: "nes" });
    const sidZ = r.data.sid;
    r = await call("/api/mp/end", { client: "sec1", sid: sidZ });
    ok(r.status === 403 && r.data.code === "bad_client", "someone without the secret can't end another person's room");
    r = await call("/api/mp/end", { client: "sec1", csec: "guess", sid: sidZ });
    ok(r.status === 403, "a wrong secret is refused");
    ss = (await call("/api/mp/sessions")).data.sessions;
    ok(ss.some(x => x.sid === sidZ), "the room is still there");
    r = await call("/api/mp/send", { client: "sec2", csec: "two", to: "nobody-here", data: { x: 1 } });
    r = await call("/api/mp/recv", { client: "nobody-here", csec: "n" });
    ok(r.data.messages.length === 0, "messages to ids that aren't around are not kept");
    r = await call("/api/mp/send", { client: "sec2", csec: "two", to: "sec1", data: { pad: "x".repeat(70000) } });
    ok(r.status === 413, "oversized messages are refused");
    r = await call("/fs/../config.json");
    ok(r.status === 404, "config is not served");
    console.log("server test: " + n + " checks passed");
  } finally { srv.stop(); }
  process.exit(0);
})().catch(e => { console.error("server test FAILED:", e.message); process.exit(1); });
