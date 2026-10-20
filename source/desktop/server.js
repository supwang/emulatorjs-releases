// EmulatorJS local server (used by the desktop app; same behaviour as server.py / start-windows.ps1)
// - serves the game page and emulator files
// - reads the ROM / thumbnails / BIOS folders so the page does not have to ask every time
// - folder settings, LAN switch and internet play server are saved in config.json
// - LAN play: lobby (who is playing what) + relays WebRTC connection info; video and inputs go peer to peer
// Only this computer can connect unless "LAN play" is on (it is on by default).
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const net = require("net");
const dgram = require("dgram");
const crypto = require("crypto");

const KINDS = ["roms", "thumbs", "bios"];
const MIME = {
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp", ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8", ".xml": "text/xml; charset=utf-8", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".otf": "font/otf", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".mp4": "video/mp4",
  ".zip": "application/zip", ".7z": "application/x-7z-compressed", ".data": "application/octet-stream",
};
const mimeOf = p => MIME[path.extname(p).toLowerCase()] || "application/octet-stream";
const isDir = p => { try { return !!p && fs.statSync(p).isDirectory(); } catch (e) { return false; } };
const isFile = p => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } };
const now = () => Date.now() / 1000;

// ---------------- IP helpers ----------------
function v4(ip) { ip = String(ip || ""); return ip.startsWith("::ffff:") ? ip.slice(7) : ip; }
function isLoopback(ip) { ip = v4(ip); return ip === "::1" || ip.startsWith("127."); }
function isPrivate(ip) {
  ip = v4(ip);
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)
      || (a === 192 && b === 0);   // 192.0.0.0/24 + 192.0.2.0/24 are "private" in Python's ipaddress too
  }
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80"); }
  return false;
}

function createServer(opts) {
  const WEB_DIR = opts.webDir;              // index.html + data/
  const CONFIG_FILE = opts.configFile;      // writable config.json
  // folders that may hold roms/thumbnails/system next to the app; a function is asked again each time
  // (Android: a USB drive plugged into the TV after the app started is found too)
  const APP_DIRS_NOW = () => (typeof opts.appDirs === "function" ? opts.appDirs() : opts.appDirs || []).filter(Boolean);
  const HOME = os.homedir();
  const log = opts.log || (() => {});
  let PORT = opts.port || 8765;
  const LOCAL_HOSTS = () => new Set(["127.0.0.1:" + PORT, "localhost:" + PORT, "[::1]:" + PORT]);

  // ---------------- folder settings ----------------
  function retroarchDirs() {
    if (process.platform === "darwin") return [path.join(HOME, "Library", "Application Support", "RetroArch"), path.join(HOME, "Documents", "RetroArch")];
    if (process.platform === "win32") {
      const out = [];
      for (const env of ["APPDATA", "USERPROFILE"]) if (process.env[env]) out.push(path.join(process.env[env], "RetroArch"));
      for (const d of "CDEF") out.push(d + ":\\RetroArch-Win64", d + ":\\RetroArch", d + ":\\Games\\RetroArch-Win64", d + ":\\Games\\RetroArch");
      return out;
    }
    if (process.platform === "android") return ["/storage/emulated/0/RetroArch"];
    return [path.join(HOME, ".config", "retroarch")];
  }
  function candidates(kind) {
    const local = { roms: ["roms", "ROMs"], thumbs: ["thumbnails"], bios: ["system", "bios"] }[kind];
    const sub = { roms: ["roms"], thumbs: ["thumbnails"], bios: ["system"] }[kind];
    const out = [];
    for (const d of APP_DIRS_NOW()) for (const s of local) out.push(path.join(d, s));
    for (const r of retroarchDirs()) for (const s of sub) out.push(path.join(r, s));
    return out;
  }
  function readSaved() {
    try {
      const d = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8").replace(/^﻿/, ""));
      return d && typeof d === "object" && !Array.isArray(d) ? d : {};
    } catch (e) { return {}; }
  }
  function writeSaved(saved) {
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(saved, null, 2));
  }
  const lanEnabled = () => { const s = readSaved(); return "lan" in s ? !!s.lan : true; };
  function currentConfig() {
    const saved = readSaved();
    const out = { home: HOME, sep: path.sep, platform: process.platform === "win32" ? "win32" : process.platform, app: true };
    for (const kind of KINDS) {
      const p = saved[kind] || "";
      if (p && isDir(p)) { out[kind] = { path: p, ok: true, auto: false }; continue; }
      const found = candidates(kind).find(isDir) || "";
      out[kind] = { path: found, ok: !!found, auto: true, missing: p || "" };
    }
    out.cloud = { url: String(saved.cloud_url || ""), key: String(saved.cloud_key || ""), list: Array.isArray(saved.cloud_list) ? saved.cloud_list : [] };
    return out;
  }
  // internet play server address: add http:// and the default port; null when it isn't an address
  function cleanCloudUrl(v) {
    let url = String(v || "").trim().replace(/\/+$/, "");
    if (!url) return "";
    if (!url.includes("://")) url = "http://" + url;
    let uu; try { uu = new URL(url); } catch (e) { return null; }
    if (!["http:", "https:"].includes(uu.protocol) || !uu.hostname) return null;
    if (!uu.port && uu.protocol === "http:" && !/:80$/.test(url)) url += ":8765";
    return url;
  }
  function publicConfig() {
    const cfg = currentConfig();
    const out = { remote: true, sep: "/", home: "", cloudProxy: !!(cfg.cloud.url && cfg.cloud.key) };
    for (const kind of KINDS) out[kind] = { path: "", ok: cfg[kind].ok, auto: true, missing: "" };
    return out;
  }
  function baseDir(kind) {
    if (!KINDS.includes(kind)) return null;
    const c = currentConfig()[kind];
    return c.ok ? c.path : null;
  }
  // Android: apps may not write to a USB drive / memory card. Files downloaded from other players then go to a
  // folder in phone storage (opts.spill), and that folder is shown together with the real one.
  const inside = (a, b) => a === b || a.startsWith(b.endsWith(path.sep) ? b : b + path.sep);
  function spillDir(kind, base) {
    if (typeof opts.spill !== "function" || !base) return null;
    const sp = opts.spill(kind);
    if (!sp || !isDir(sp)) return null;
    try { const a = fs.realpathSync(sp), b = fs.realpathSync(base); return inside(a, b) || inside(b, a) ? null : a; } catch (e) { return null; }
  }
  function canWrite(dir) {
    const t = path.join(dir, ".ejs-write-test-" + process.pid);
    try { fs.writeFileSync(t, ""); fs.unlinkSync(t); return true; } catch (e) { return !["EACCES", "EPERM", "EROFS"].includes(e.code); }
  }
  function safeJoin(base, rel) {
    let baseReal;
    try { baseReal = fs.realpathSync(base); } catch (e) { return null; }
    const parts = rel.split("/").filter(p => p && p !== "." && p !== "..");
    let target = path.join(baseReal, ...parts);
    try { target = fs.realpathSync(target); } catch (e) { return null; }
    const pre = baseReal.endsWith(path.sep) ? baseReal : baseReal + path.sep;
    return target === baseReal || target.startsWith(pre) ? target : null;
  }
  // ---- ROM / BIOS downloaded from another player's computer: written piece by piece into our own folder ----
  const BAD_NAME = /\.(exe|bat|cmd|com|ps1|psm1|vbs|vbe|js|jse|wsf|wsh|msi|scr|lnk|reg|sh|command|app|py|pyw|html?|dll|dylib|so|jar)$/i;
  async function romSave(q, req) {
    const kind = q.get("kind") || "roms", offset = Number(q.get("offset")), total = Number(q.get("total"));
    const length = Number(req.headers["content-length"] || 0);
    if (kind !== "roms" && kind !== "bios" && kind !== "thumbs") return [{ error: "bad kind" }, 400];
    const keep = q.get("keep") === "1";   // thumbnails: if we already have one with this name, keep ours
    if (!Number.isInteger(offset) || !Number.isInteger(total)) return [{ error: "bad request" }, 400];
    const cfg = currentConfig();
    let used = kind, base = cfg[kind].ok ? cfg[kind].path : "";
    if (!base && kind === "bios" && cfg.roms.ok) { base = cfg.roms.path; used = "roms"; }   // no BIOS folder: use the ROM folder
    if (!base && kind === "thumbs") {
      // no thumbnails folder yet: make one next to the ROM folder (or next to the app) and remember it in the settings
      const cands = (cfg.roms.ok ? [path.join(path.dirname(cfg.roms.path), "thumbnails")] : []).concat(APP_DIRS_NOW().map(d => path.join(d, "thumbnails")));
      for (const c of cands) {
        try { fs.mkdirSync(c, { recursive: true }); if (canWrite(c)) { base = c; break; } } catch (e) {}
      }
      if (base) { const saved = readSaved(); if (!saved.thumbs) { saved.thumbs = base; writeSaved(saved); } }
    }
    if (!base) return [{ error: "还没有设置 ROM 文件夹", code: "no_folder" }, 400];
    const rel = String(q.get("rel") || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const parts = rel.split("/").filter(x => x && x !== "." && x !== "..");
    if (!parts.length || rel.length > 300 || parts.length > 5 || parts[parts.length - 1].startsWith(".") || BAD_NAME.test(parts[parts.length - 1])) return [{ error: "bad name" }, 400];
    if (total <= 0 || total > 4 * 1024 ** 3 || offset < 0 || length < 0 || length > 64 * 1024 * 1024 || offset + length > total) return [{ error: "bad range" }, 400];
    let baseReal; try { baseReal = fs.realpathSync(base); } catch (e) { return [{ error: "no folder", code: "no_folder" }, 400]; }
    if (typeof opts.spill === "function" && !canWrite(baseReal)) {   // USB drive on Android: save in phone storage instead
      const sp = opts.spill(used);
      try { fs.mkdirSync(sp, { recursive: true }); baseReal = fs.realpathSync(sp); } catch (e) { return [{ error: "保存失败：" + e.message, code: "write" }, 500]; }
    }
    const target = path.join(baseReal, ...parts);
    if (!target.startsWith(baseReal.endsWith(path.sep) ? baseReal : baseReal + path.sep)) return [{ error: "bad name" }, 400];
    const folder = path.dirname(target), name = path.basename(target), part = path.join(folder, "." + name + ".ejs-part");
    const body = await readBody(req, 64 * 1024 * 1024);
    if (body.length !== length) return [{ error: "short body" }, 400];
    if (offset) {
      const have = isFile(part) ? fs.statSync(part).size : 0;
      if (have !== offset) return [{ error: "out of order", have }, 409];
      const fd = fs.openSync(part, "r+"); try { fs.writeSync(fd, body, 0, body.length, offset); } finally { fs.closeSync(fd); }
    } else {
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(part, body);
    }
    if (offset + length < total) return [{ ok: true }, 200];
    let final = target;
    if (isFile(final) && (keep || fs.statSync(final).size === total)) fs.unlinkSync(part);   // already have this: keep ours
    else {
      if (fs.existsSync(final)) {   // same name, different file: never overwrite ours; arcade games need the exact file name
        final = path.join(folder, "EmulatorJS downloads", name);
        fs.mkdirSync(path.dirname(final), { recursive: true });
      }
      fs.renameSync(part, final);
    }
    return [{ ok: true, done: true, kind: used, rel: path.relative(baseReal, final).split(path.sep).join("/") }, 200];
  }
  function listFiles(base, limit = 100000) {
    const out = [];
    const walk = dir => {
      let ents;
      try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return false; }
      const files = ents.filter(e => !e.name.startsWith(".") && !e.isDirectory());
      const dirs = ents.filter(e => !e.name.startsWith(".") && e.isDirectory()).map(e => e.name).sort();
      for (const f of files) {
        const full = path.join(dir, f.name);
        let st; try { st = fs.statSync(full); } catch (e) { continue; }
        if (!st.isFile()) continue;
        out.push([path.relative(base, full).split(path.sep).join("/"), st.size]);
        if (out.length >= limit) return true;
      }
      for (const d of dirs) if (walk(path.join(dir, d))) return true;
      return false;
    };
    walk(base);
    return out;
  }
  function shortcuts() {
    const items = typeof opts.shortcuts === "function" ? opts.shortcuts() : [];   // Android: phone storage, USB drives, memory cards
    items.push(["个人文件夹", HOME]);
    for (const [label, sub] of [["桌面", "Desktop"], ["文稿", "Documents"], ["下载", "Downloads"], ["下载", "Download"]]) items.push([label, path.join(HOME, sub)]);
    for (const d of APP_DIRS_NOW()) items.push(["EmulatorJS 文件夹", d]);
    for (const r of retroarchDirs()) items.push(["RetroArch", r]);
    if (process.platform === "darwin") items.push(["外接磁盘", "/Volumes"]);
    if (process.platform === "win32") for (const d of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") items.push([d + ":", d + ":\\"]);
    const seen = new Set(), out = [];
    for (const [label, p] of items) if (!seen.has(p) && isDir(p)) { seen.add(p); out.push({ label, path: p }); }
    return out;
  }
  function listDirs(p) {
    p = p || HOME;
    if (p.startsWith("~")) p = path.join(HOME, p.slice(1));
    p = path.resolve(p);
    if (!isDir(p)) p = HOME;
    let names = [];
    try {
      names = fs.readdirSync(p, { withFileTypes: true })
        .filter(e => !e.name.startsWith(".") && (e.isDirectory() || (e.isSymbolicLink() && isDir(path.join(p, e.name)))))
        .map(e => e.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    } catch (e) { names = []; }
    const parent = path.dirname(p);
    return { path: p, parent: parent !== p ? parent : "", dirs: names, shortcuts: shortcuts() };
  }
  function lanAddresses() {
    const out = new Set();
    for (const list of Object.values(os.networkInterfaces())) for (const a of list || [])
      if (a.family === "IPv4" && !a.internal && isPrivate(a.address) && !a.address.startsWith("127.")) out.add(a.address);
    return [...out].sort();
  }

  // ---------------- internet play server relay (/cp/...) ----------------
  // Phones and tablets on the LAN don't have the room password: their internet requests come here first,
  // and this computer adds the password and passes them on.
  const CLOUD_PROXY_RE = /^\/cp\/api\/(mp|acct|friends|stats|match)\/[a-z/]+$|^\/cp\/api\/(ice|ping)$/;
  let cloudDown = 0;
  async function cloudProxy(method, pathQs, body, token) {
    if (now() - cloudDown < 20) return [502, Buffer.from('{"error": "cloud server unreachable"}')];
    const saved = readSaved();
    const base = String(saved.cloud_url || ""), key = String(saved.cloud_key || "");
    if (!base || !key) return [404, Buffer.from('{"error": "no cloud server"}')];
    const headers = { "X-EJS-Key": key, "X-EJS": "1", "Content-Type": "application/json" };
    if (token) headers["X-EJS-Token"] = token;
    try {
      const r = await fetch(base + pathQs.slice(3), { method, headers, body: method === "POST" ? body : undefined, signal: AbortSignal.timeout(10000) });
      return [r.status, Buffer.from(await r.arrayBuffer())];
    } catch (e) {
      cloudDown = now();
      return [502, Buffer.from('{"error": "cloud server unreachable"}')];
    }
  }

  // ---------------- player names: no swear words (data/badwords.json, reloaded when it changes) ----------------
  const BADWORDS_FILE = path.join(WEB_DIR, "data", "badwords.json");
  const bad = { mtime: null, words: [] };
  // keep only letters and digits. Node.js for Android has no full Unicode tables (no \p{..} in patterns, maybe
  // no NFKC): then fall back to removing spaces, punctuation and symbols by character range.
  const NOT_ALNUM = (() => {
    try { return new RegExp("[^\\p{L}\\p{N}]+", "gu"); }
    catch (e) { return /[\s!-\/:-@\[-`{-~\u00a0-\u00bf\u2000-\u206f\u2190-\u2bff\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]+/g; }
  })();
  const nfkc = t => { try { return t.normalize("NFKC"); } catch (e) { return t; } };
  const norm = t => nfkc(String(t)).toLowerCase().replace(NOT_ALNUM, "");
  function badWords() {
    try {
      const m = fs.statSync(BADWORDS_FILE).mtimeMs;
      if (m !== bad.mtime) {
        const d = JSON.parse(fs.readFileSync(BADWORDS_FILE, "utf8").replace(/^﻿/, ""));
        bad.words = (d.words || []).map(norm).filter(Boolean);
        bad.mtime = m;
      }
    } catch (e) {}
    return bad.words;
  }
  function cleanName(name, cid = "") {
    name = [...String(name == null ? "" : name).replace(/[\x00-\x1f\x7f]/g, "").trim()].slice(0, 24).join("");
    const n = norm(name);
    if (!n || badWords().some(w => n.includes(w))) return "玩家" + String(cid).slice(0, 3).toUpperCase();
    return name;
  }
  function nameTaken(cid, name) {
    const n = norm(name);
    for (const s of Object.values(SESSIONS)) {
      if (s.host !== cid && norm(s.hostName) === n) return true;
      for (const [c, p] of Object.entries(s.players)) if (c !== cid && norm(p.name) === n) return true;
    }
    return false;
  }
  const takenReply = name => [{ error: "名字「" + name + "」已经有人在用了，请点「我是：…」换一个名字", nameTaken: true }, 409];

  // ---------------- multiplayer lobby (in memory) ----------------
  const SESSIONS = {}, MAILBOX = {}, CLIENT_SEEN = {}, BANS = {};
  const TIMEOUT = 12, KICK_MINUTES = 30, MAX_WATCH = 8, MAX_WATCH_VIDEO = 2;
  const IP_SALT = crypto.randomBytes(16);
  const ipHash = ip => { ip = v4(ip); return ip ? crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex").slice(0, 16) : ""; };
  const post = (cid, msg) => { const b = MAILBOX[cid] = MAILBOX[cid] || []; if (b.length < 200) b.push(msg); };
  // A device's id (client) is public (room lists show the host's id), so it also carries a secret only it knows (csec):
  // the first time an id shows up with a secret, its fingerprint is remembered, and later requests with that id must bring
  // the same secret, so nobody else can pose as it (end its room, read its messages). Old versions without a secret still
  // work as long as nobody has used that id with a secret.
  const CLIENT_SECRETS = {};   // cid -> [fingerprint, last used]
  function clientOk(cid, sec, t) {
    sec = str(sec, 200);
    const old = CLIENT_SECRETS[cid];
    if (!sec) return !old;
    const h = crypto.createHash("sha256").update("ejs-client:" + sec).digest("hex");
    if (!old) { CLIENT_SECRETS[cid] = [h, t]; return true; }
    if (old[0].length !== h.length || !crypto.timingSafeEqual(Buffer.from(old[0]), Buffer.from(h))) return false;
    old[1] = t;
    return true;
  }
  const str = (v, max) => (v == null ? "" : String(v)).slice(0, max);
  const bool = (v, dflt) => v === undefined ? dflt : !!v;
  function banLeft(host, cid, acct, iph) {
    const t = now();
    for (const b of BANS[host] || [])
      if (b.until > t && ((cid && b.cid === cid) || (acct && b.acct && norm(b.acct) === norm(acct)) || (iph && b.iph === iph)))
        return Math.max(1, Math.floor((b.until - t + 59) / 60));
    return 0;
  }
  function mpCleanup() {
    const t = now();
    for (const sid of Object.keys(SESSIONS)) {
      const s = SESSIONS[sid];
      if (t - s.seen > TIMEOUT) { for (const c of Object.keys(s.players)) post(c, { type: "ended", sid }); delete SESSIONS[sid]; continue; }
      for (const c of Object.keys(s.players))
        if (t - s.players[c].seen > TIMEOUT) { delete s.players[c]; post(s.host, { type: "left", sid, from: c }); }
    }
    for (const c of Object.keys(MAILBOX)) if (t - (CLIENT_SEEN[c] || 0) > 60) delete MAILBOX[c];   // ids that stopped asking (or never existed)
    if (Object.keys(CLIENT_SEEN).length > 5000) for (const c of Object.keys(CLIENT_SEEN)) if (t - CLIENT_SEEN[c] > 600) delete CLIENT_SEEN[c];
    if (Object.keys(CLIENT_SECRETS).length > 2000) for (const c of Object.keys(CLIENT_SECRETS)) if (t - CLIENT_SECRETS[c][1] > 30 * 86400) delete CLIENT_SECRETS[c];
    for (const h of Object.keys(BANS)) { BANS[h] = BANS[h].filter(b => b.until > t); if (!BANS[h].length) delete BANS[h]; }
  }
  function sessionView(sid, s) {
    return { sid, game: s.game, title: s.title, system: s.system, group: s.group, host: s.host, hostName: s.hostName,
      allowJoin: s.allowJoin, sync: !!s.sync, size: s.size || 0, challenge: !!s.challenge, hostCountry: s.hostCountry || "",
      allowWatch: s.allowWatch !== false, regOnly: !!s.regOnly,
      players: Object.entries(s.players).map(([c, p]) => ({ cid: c, name: p.name, slot: p.slot, mode: p.mode || "", country: p.country || "", watch: !!p.watch })) };
  }
  function mpHandle(p, data) {
    const cid = str(data.client, 64);
    let name = cleanName(data.name, data.client || "");
    const t = now();
    const iph = String(data._iph || "");
    const acct = str(data.acct, 16);   // on the LAN: only what the player says (used to recognise people who were sent away)
    // names with 开发者 / Developer belong to the admin: only with that account (the host checks it with the internet server)
    if (/开发者|developer/.test(norm(name)) && norm(acct) !== norm(name)) name = "玩家" + String(cid).slice(0, 3).toUpperCase();
    if (cid && p !== "/api/mp/sessions" && !clientOk(cid, data.csec, t))
      return [{ error: "这台设备的联机编号被别人占用了，请刷新页面", code: "bad_client" }, 403];
    if (cid) CLIENT_SEEN[cid] = t;
    mpCleanup();
    if (p === "/api/mp/sessions") {
      const lan = lanEnabled();
      return [{ sessions: Object.entries(SESSIONS).map(([k, v]) => sessionView(k, v)), remote: lan ? remoteSessions() : [], peers: lan ? Object.keys(PEERS).length : 0 }, 200];
    }
    if (!cid) return [{ error: "missing client" }, 400];
    if (p === "/api/mp/host") {
      const game = str(data.game, 500);
      for (const [sid, s] of Object.entries(SESSIONS)) if (s.game === game && s.host !== cid) return [{ existing: sessionView(sid, s) }, 200];
      for (const [sid, s] of Object.entries(SESSIONS)) if (s.host === cid) delete SESSIONS[sid];
      if (nameTaken(cid, name)) return takenReply(name);
      const sid = crypto.randomBytes(5).toString("hex");
      SESSIONS[sid] = { game, title: str(data.title, 200), system: str(data.system, 20), group: str(data.group, 20), host: cid, hostName: name,
        allowJoin: bool(data.allowJoin, true), sync: bool(data.sync, false), size: Math.max(0, Math.min(parseInt(data.size, 10) || 0, 2 ** 40)), challenge: bool(data.challenge, false),
        hostCountry: str(data.country, 2), allowWatch: bool(data.allowWatch, true), regOnly: bool(data.regOnly, false), players: {}, seen: t };
      return [{ sid }, 200];
    }
    const sidIn = data.sid == null ? "" : String(data.sid);
    const s = Object.prototype.hasOwnProperty.call(SESSIONS, sidIn) ? SESSIONS[sidIn] : null;
    if (p === "/api/mp/heartbeat") {
      if (s && s.host === cid) { s.seen = t; if (!nameTaken(cid, name)) s.hostName = name; }
      else if (s && s.players[cid]) s.players[cid].seen = t;
      return [{ ok: !!s, session: s ? sessionView(sidIn, s) : null }, 200];
    }
    if (p === "/api/mp/update") {
      if (!s || s.host !== cid) return [{ error: "not host" }, 403];
      for (const k of ["allowJoin", "challenge", "allowWatch", "regOnly"]) if (k in data) s[k] = !!data[k];
      return [{ session: sessionView(sidIn, s) }, 200];
    }
    if (p === "/api/mp/kick" || p === "/api/mp/reject") {
      if (!s || s.host !== cid) return [{ error: "not host" }, 403];
      const target = str(data.target, 64);
      const pl = s.players[target] || null; delete s.players[target];
      if (p === "/api/mp/kick") {
        (BANS[cid] = BANS[cid] || []).push({ cid: target, acct: str(data.acct, 16) || (pl ? pl.acct || "" : ""), iph: pl ? pl.iph || "" : "", until: t + KICK_MINUTES * 60 });
        post(target, { type: "kicked", sid: data.sid, minutes: KICK_MINUTES });
      } else post(target, { type: "rejected", sid: data.sid, code: str(data.code, 20) });
      return [{ ok: true, session: sessionView(sidIn, s) }, 200];
    }
    if (p === "/api/mp/end") {
      if (s && s.host === cid) { for (const c of Object.keys(s.players)) post(c, { type: "ended", sid: data.sid }); delete SESSIONS[sidIn]; }
      return [{ ok: true }, 200];
    }
    if (p === "/api/mp/join") {
      if (!s) return [{ error: "这局游戏已经结束了" }, 404];
      if (s.host === cid) return [{ error: "这是你自己开的游戏" }, 400];
      const left = banLeft(s.host, cid, acct, iph);
      if (left) return [{ error: "你被房主请出了这个房间，" + left + " 分钟后才能再进入", code: "kicked", minutes: left }, 403];
      const watch = data.watch === true;
      const mode = data.mode === "sync" ? "sync" : "stream";
      let slot;
      if (watch) {
        if (s.allowWatch === false) return [{ error: "房主关闭了观战", code: "no_watch" }, 403];
        const others = Object.entries(s.players).filter(([c, q]) => q.watch && c !== cid).map(([, q]) => q);
        if (others.length >= MAX_WATCH) return [{ error: "观战的人太多了（最多 8 个）" }, 409];
        if (mode === "stream" && others.filter(q => q.mode !== "sync").length >= MAX_WATCH_VIDEO)
          return [{ error: "看画面观战的人满了（最多 2 个）", code: "watch_video_full" }, 409];
        slot = 0;
      } else {
        if (!s.allowJoin) return [{ error: "主机设置了不允许乱入" }, 403];
        const used = new Set(Object.entries(s.players).filter(([c, q]) => c !== cid && !q.watch).map(([, q]) => q.slot));
        const free = [1, 2, 3].filter(n => !used.has(n));
        if (!free.length) return [{ error: "人满了（最多 4 个玩家）" }, 409];
        const old = s.players[cid];
        slot = old && !old.watch ? old.slot : free[0];
      }
      if (nameTaken(cid, name)) return takenReply(name);
      s.players[cid] = { name, slot, seen: t, mode, watch, country: str(data.country, 2), acct, iph };
      const msg = { type: "join", sid: data.sid, from: cid, name, slot, mode, watch, acct, verified: false };
      if (data.ticket) msg.ticket = str(data.ticket, 600);   // the host's page checks it with the internet play server
      post(s.host, msg);
      return [{ slot, host: s.host, session: sessionView(sidIn, s) }, 200];
    }
    if (p === "/api/mp/leave") {
      if (s && s.players[cid]) { delete s.players[cid]; post(s.host, { type: "left", sid: data.sid, from: cid }); }
      return [{ ok: true }, 200];
    }
    if (p === "/api/mp/send") {
      const to = str(data.to, 64);
      const payload = data.data === undefined ? null : data.data;
      if (JSON.stringify(payload).length > 64 * 1024) return [{ error: "too large" }, 413];
      if (t - (CLIENT_SEEN[to] || 0) > 60) return [{ ok: true }, 200];   // the other side is gone (or never existed): don't keep it
      post(to, { type: "signal", from: cid, sid: str(data.sid, 20), data: payload });
      return [{ ok: true }, 200];
    }
    if (p === "/api/mp/recv") { const msgs = MAILBOX[cid] || []; delete MAILBOX[cid]; return [{ messages: msgs }, 200]; }
    return [{ error: "not found" }, 404];
  }

  // ---------------- LAN discovery: other computers running EmulatorJS ----------------
  // Every 2 seconds each computer broadcasts "I am here + what is being played", so nobody has to share addresses.
  const DISC_PORT = 8764, INSTANCE = crypto.randomBytes(6).toString("hex"), PEER_TIMEOUT = 20;   // phones on Wi-Fi power saving miss some broadcasts: only drop a computer after 20 s of silence
  const PEERS = {};
  let udp = null, discTimer = null;
  function broadcastTargets() {
    const out = new Set(["255.255.255.255"]);
    for (const a of lanAddresses()) out.add(a.split(".").slice(0, 3).join(".") + ".255");
    return [...out];
  }
  function startDiscovery() {
    try {
      udp = dgram.createSocket({ type: "udp4", reuseAddr: true });
      udp.on("error", () => {});
      udp.on("message", (buf, rinfo) => {
        try {
          const d = JSON.parse(buf.toString("utf8"));
          if (d.ejs === 2 && d.id !== INSTANCE && (isPrivate(rinfo.address) || process.env.EJS_TEST_ANYIP))
            PEERS[String(d.id).slice(0, 20)] = { ip: rinfo.address, port: parseInt(d.port, 10) || 8765, sessions: Array.isArray(d.sessions) ? d.sessions : [], seen: now() };
        } catch (e) {}
      });
      udp.bind(DISC_PORT, () => { try { udp.setBroadcast(true); } catch (e) {} });
    } catch (e) { udp = null; return; }
    discTimer = setInterval(() => {
      if (!udp || !lanEnabled()) return;
      mpCleanup();
      const sess = Object.entries(SESSIONS).slice(0, 12).map(([k, v]) => { const x = sessionView(k, v); delete x.game; return x; });
      const msg = Buffer.from(JSON.stringify({ ejs: 2, id: INSTANCE, port: PORT, sessions: sess }));
      for (const t of broadcastTargets()) try { udp.send(msg, DISC_PORT, t); } catch (e) {}
    }, 2000);
  }
  function remoteSessions() {
    const t = now(), out = [];
    for (const k of Object.keys(PEERS)) {
      const p = PEERS[k];
      if (t - p.seen > PEER_TIMEOUT) { delete PEERS[k]; continue; }
      for (const s of p.sessions) if (s && typeof s === "object" && s.sid) out.push(Object.assign({}, s, { at: p.ip + ":" + p.port }));
    }
    return out;
  }

  // ---------------- HTTP ----------------
  function hostOk(req) {
    const host = req.headers.host || "";
    if (LOCAL_HOSTS().has(host)) return true;
    if (!lanEnabled()) return false;
    const i = host.lastIndexOf(":");
    if (i < 0) return false;
    const h = host.slice(0, i).replace(/^\[|\]$/g, "");
    return net.isIP(h) !== 0 && host.slice(i + 1) === String(PORT);
  }
  const isLocal = req => isLoopback(req.socket.remoteAddress);
  const allowed = req => hostOk(req) && (isLocal(req) || lanEnabled());
  function corsOrigin(req) {
    const origin = req.headers.origin || "";
    try {
      const u = new URL(origin);
      if (u.protocol !== "http:" || !u.hostname) return "";
      if (u.hostname === "localhost") return origin;
      const h = u.hostname.replace(/^\[|\]$/g, "");
      return net.isIP(h) && (isLoopback(h) || isPrivate(h)) ? origin : "";
    } catch (e) { return ""; }
  }
  function send(res, code, type, body, extra = {}) {
    res.writeHead(code, Object.assign({ "Content-Type": type, "Content-Length": body.length }, extra));
    res.end(body);
  }
  function sendJson(req, res, obj, code = 200) {
    const h = { "Cache-Control": "no-store" };
    if (new URL(req.url, "http://x").pathname.startsWith("/api/mp/")) { const o = corsOrigin(req); if (o) { h["Access-Control-Allow-Origin"] = o; h.Vary = "Origin"; } }
    send(res, code, "application/json; charset=utf-8", Buffer.from(JSON.stringify(obj)), h);
  }
  const sendErr = (res, code) => send(res, code, "text/plain; charset=utf-8", Buffer.from(String(code)));
  function sendFile(req, res, target, head) {
    let st;
    try { st = fs.statSync(target); } catch (e) { return sendErr(res, 404); }
    const size = st.size;
    let start = 0, end = size - 1, partial = false;
    const rng = req.headers.range || "";
    if (rng.startsWith("bytes=")) {
      const [a, b] = rng.slice(6).split(",")[0].split("-");
      if (/^\d*$/.test(a || "") && /^\d*$/.test(b || "")) {
        if (a) { start = parseInt(a, 10); end = b ? Math.min(parseInt(b, 10), size - 1) : size - 1; }
        else if (b) start = Math.max(size - parseInt(b, 10), 0);
        partial = (a || b) && start <= end && start < size;
      }
      if (!partial) { start = 0; end = size - 1; }
    }
    const length = Math.max(end - start + 1, 0);
    const h = { "Content-Type": mimeOf(target), "Content-Length": length, "Accept-Ranges": "bytes" };
    if (/\.(html?|js|json|css)$/i.test(target)) h["Cache-Control"] = "no-cache";
    if (partial) h["Content-Range"] = "bytes " + start + "-" + end + "/" + size;
    res.writeHead(partial ? 206 : 200, h);
    if (head || length === 0) return res.end();
    fs.createReadStream(target, { start, end }).on("error", () => res.destroy()).pipe(res);
  }
  function readBody(req, max) {
    return new Promise((resolve, reject) => {
      const chunks = []; let n = 0;
      req.on("data", c => { n += c.length; if (n > max) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }
  async function sendProxy(req, res, method, body) {
    const u = new URL(req.url, "http://x");
    if (!CLOUD_PROXY_RE.test(u.pathname)) return sendErr(res, 404);
    const [code, out] = await cloudProxy(method, req.url, body, String(req.headers["x-ejs-token"] || "").slice(0, 200));
    send(res, code, "application/json; charset=utf-8", out, { "Cache-Control": "no-store" });
  }

  async function handle(req, res) {
    const u = new URL(req.url, "http://x");
    const p = u.pathname;
    if (req.method === "OPTIONS") {
      const origin = corsOrigin(req);
      if (!allowed(req) || !origin || !p.startsWith("/api/mp/")) return sendErr(res, 403);
      res.writeHead(204, { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST", "Access-Control-Allow-Headers": "Content-Type, X-EJS",
        "Access-Control-Allow-Private-Network": "true", "Access-Control-Max-Age": "600", Vary: "Origin", "Content-Length": 0 });
      return res.end();
    }
    if (!allowed(req)) return sendErr(res, 403);
    if (req.method === "GET" || req.method === "HEAD") {
      if (p.startsWith("/cp/")) return sendProxy(req, res, "GET");
      if (p === "/api/config") return sendJson(req, res, isLocal(req) ? currentConfig() : publicConfig());
      if (p === "/api/lan") return sendJson(req, res, { enabled: lanEnabled(), port: PORT, addresses: lanAddresses(), isLocal: isLocal(req) });
      // updates (desktop app only): which download fits this copy, and the state of an automatic update
      if (p === "/api/update") { if (!isLocal(req)) return sendErr(res, 403); if (!opts.updater) return sendErr(res, 404); return sendJson(req, res, opts.updater.info()); }
      if (p === "/api/mp/sessions") { const [b, c] = mpHandle(p, {}); return sendJson(req, res, b, c); }
      if (p === "/api/list") {
        const root = u.searchParams.get("root") || "", base = baseDir(root);
        if (!base) return sendJson(req, res, { files: [], error: "folder not set" });
        const files = listFiles(base), sp = spillDir(root, base);
        if (sp) { const have = new Set(files.map(f => f[0])); for (const f of listFiles(sp)) if (!have.has(f[0])) files.push(f); }
        return sendJson(req, res, { files });
      }
      if (p === "/api/dirs") { if (!isLocal(req)) return sendErr(res, 403); return sendJson(req, res, listDirs(u.searchParams.get("path") || "")); }
      if (p.startsWith("/fs/")) {
        const rest = p.slice(4), i = rest.indexOf("/");
        const base = baseDir(i < 0 ? rest : rest.slice(0, i));
        let rel = ""; try { rel = i < 0 ? "" : decodeURIComponent(rest.slice(i + 1)); } catch (e) { return sendErr(res, 404); }
        let target = base ? safeJoin(base, rel) : null;
        if (!target || !isFile(target)) { const sp = spillDir(i < 0 ? rest : rest.slice(0, i), base); target = sp ? safeJoin(sp, rel) : null; }
        if (!target || !isFile(target)) return sendErr(res, 404);
        return sendFile(req, res, target, req.method === "HEAD");
      }
      // static files of the game page
      let rel; try { rel = decodeURIComponent(p); } catch (e) { return sendErr(res, 404); }
      if (rel === "/" || rel === "") rel = "/index.html";
      const target = safeJoin(WEB_DIR, rel.replace(/^\/+/, ""));
      if (!target) return sendErr(res, 404);
      if (isDir(target)) { const idx = path.join(target, "index.html"); return isFile(idx) ? sendFile(req, res, idx, req.method === "HEAD") : sendErr(res, 404); }
      return sendFile(req, res, target, req.method === "HEAD");
    }
    if (req.method !== "POST") return sendErr(res, 405);
    if (req.headers["x-ejs"] !== "1") return sendErr(res, 403);
    if (p === "/api/rom/save") {
      if (!isLocal(req)) return sendErr(res, 403);   // only our own page may write into our folders
      let r;
      try { r = await romSave(u.searchParams, req); } catch (e) { r = [{ error: e.status === 413 ? "too large" : "保存失败：" + e.message, code: "write" }, e.status === 413 ? 413 : 500]; }
      return sendJson(req, res, r[0], r[1]);
    }
    let raw;
    try { raw = await readBody(req, 256 * 1024); } catch (e) { return sendErr(res, 413); }
    if (p.startsWith("/cp/")) return sendProxy(req, res, "POST", raw);
    let data;
    try { data = JSON.parse(raw.toString("utf8") || "{}"); if (!data || typeof data !== "object" || Array.isArray(data)) throw 0; }
    catch (e) { return sendJson(req, res, { error: "bad request" }, 400); }
    if (p.startsWith("/api/mp/")) {
      delete data._acct;
      data._iph = ipHash(req.socket.remoteAddress);
      const [b, c] = mpHandle(p, data);
      return sendJson(req, res, b, c);
    }
    if (!isLocal(req)) return sendErr(res, 403);   // settings can only be changed on this computer
    if (p === "/api/lan") {
      const saved = readSaved();
      const want = !!data.enabled, changed = ("lan" in saved ? !!saved.lan : true) !== want;
      saved.lan = want; writeSaved(saved);
      sendJson(req, res, { enabled: want, port: PORT, addresses: lanAddresses(), isLocal: true, restarting: changed });
      if (changed) setTimeout(relisten, 300);
      return;
    }
    if (p === "/api/update") {
      const up = opts.updater;
      if (!up) return sendErr(res, 404);
      const r = data.action === "start" ? up.start(String(data.version || "")) : data.action === "cancel" ? up.cancel()
        : data.action === "install" ? up.install() : { error: "unknown action" };
      return sendJson(req, res, r, r.error ? 400 : 200);
    }
    if (p === "/api/quit") return sendJson(req, res, { ok: false, app: true });   // the app keeps running (old launchers ask old servers to quit)
    if (p === "/api/cloud") {
      const url = cleanCloudUrl(data.url);
      const key = String(data.key || "").trim();
      if (url === null) return sendJson(req, res, { error: "地址格式不对，例如 http://1.2.3.4:8765" }, 400);
      const saved = readSaved();
      saved.cloud_url = url; saved.cloud_key = key.slice(0, 200);
      // saved servers (one server = one lobby, can switch between them)
      if (Array.isArray(data.list)) saved.cloud_list = data.list.slice(0, 20).filter(x => x && typeof x === "object" && cleanCloudUrl(x.url))
        .map(x => ({ url: cleanCloudUrl(x.url), key: String(x.key || "").trim().slice(0, 200) }));
      writeSaved(saved);
      return sendJson(req, res, currentConfig());
    }
    if (p !== "/api/config") return sendErr(res, 404);
    const saved = readSaved();
    for (const kind of KINDS) if (kind in data) {
      let v = String(data[kind] || "").trim();
      if (v) {
        if (v.startsWith("~")) v = path.join(HOME, v.slice(1));
        v = path.resolve(v);
        if (!isDir(v)) return sendJson(req, res, { error: "文件夹不存在：" + v }, 400);
      }
      saved[kind] = v;
    }
    writeSaved(saved);
    return sendJson(req, res, currentConfig());
  }

  // ---------------- listening (re-listen when the LAN switch changes) ----------------
  let server = null;
  function listen(port) {
    return new Promise((resolve, reject) => {
      const srv = http.createServer((req, res) => { handle(req, res).catch(() => { try { sendErr(res, 500); } catch (e) {} }); });
      srv.keepAliveTimeout = 5000;
      srv.once("error", reject);
      srv.listen(port, lanEnabled() ? "0.0.0.0" : "127.0.0.1", () => { srv.removeListener("error", reject); resolve(srv); });
    });
  }
  async function relisten() {
    const old = server;
    if (old) await new Promise(r => { old.close(() => r()); old.closeAllConnections && old.closeAllConnections(); setTimeout(r, 1500); });
    for (let i = 0; i < 20; i++) {
      try { server = await listen(PORT); log(lanEnabled() ? "LAN play is on" : "LAN play is off"); return; }
      catch (e) { await new Promise(r => setTimeout(r, 500)); }
    }
  }
  async function start() {
    server = await listen(PORT);
    startDiscovery();
    return PORT;
  }
  function stop() {
    try { server && server.close(); server && server.closeAllConnections && server.closeAllConnections(); } catch (e) {}
    try { clearInterval(discTimer); udp && udp.close(); } catch (e) {}
  }
  return { start, stop, get port() { return PORT; }, lanAddresses, lanEnabled, _mp: mpHandle };
}

module.exports = { createServer };

// Run on its own (for testing): node server.js [port] [webDir] [configFile]
if (require.main === module) {
  const port = parseInt(process.argv[2] || "8765", 10);
  const webDir = path.resolve(process.argv[3] || path.join(__dirname, "..", "web"));
  const configFile = path.resolve(process.argv[4] || path.join(webDir, "config.json"));
  const s = createServer({ port, webDir, configFile, appDirs: [webDir], log: console.log });
  s.start().then(p => {
    console.log("EmulatorJS server started: http://127.0.0.1:" + p + "/index.html");
    if (s.lanEnabled()) console.log("LAN play is on. Other devices can open: " + s.lanAddresses().map(a => "http://" + a + ":" + p).join(", "));
  }).catch(e => { console.error("Could not start: " + e.message); process.exit(1); });
}
