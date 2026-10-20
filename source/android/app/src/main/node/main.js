// EmulatorJS on Android: starts the same built-in server as the desktop app (server.js).
// Arguments (from the app): <app data folder> <unpacked files folder> <JSON list of storage roots>
"use strict";
const fs = require("fs");
const path = require("path");

const DATA_DIR = process.argv[2];                 // the app's private folder (settings live here)
const FILES_DIR = process.argv[3];                // unpacked web/ and node/
let roots = [];
try { roots = JSON.parse(process.argv[4] || "[]"); } catch (e) {}
const INTERNAL = "/storage/emulated/0";
if (fs.existsSync(INTERNAL)) process.env.HOME = INTERNAL;   // folder browser starts in phone storage

const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const PORT_FILE = path.join(DATA_DIR, "port.txt");
const isDir = p => { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } };

// first start: default settings that come with the app (LAN play on; no internet play server: each player enters one)
if (!fs.existsSync(CONFIG_FILE)) {
  try { fs.copyFileSync(path.join(__dirname, "default-config.json"), CONFIG_FILE); } catch (e) {}
}

// phone storage, memory cards and USB drives (a drive plugged in later shows up under /storage too)
function storageRoots() {
  const out = new Set([INTERNAL, ...roots]);
  try {
    for (const n of fs.readdirSync("/storage")) if (n !== "self" && n !== "emulated" && isDir("/storage/" + n)) out.add("/storage/" + n);
  } catch (e) {}
  return [...out].filter(isDir);
}
// where roms / thumbnails / system folders are looked for automatically
function appDirs() {
  const out = [];
  for (const r of storageRoots()) out.push(path.join(r, "EmulatorJS"), path.join(r, "RetroArch"), path.join(r, "Download", "EmulatorJS"), r);
  return out;
}
// shortcuts in the folder browser
function shortcuts() {
  const out = [["手机存储", INTERNAL], ["下载", path.join(INTERNAL, "Download")], ["EmulatorJS 文件夹", path.join(INTERNAL, "EmulatorJS")]];
  for (const r of storageRoots()) if (r !== INTERNAL) out.push(["U 盘 / 存储卡", r]);
  return out;
}

// games downloaded from other players when the game folder is on a USB drive (apps can't write there)
const spill = kind => path.join(INTERNAL, "EmulatorJS", "downloads", { roms: "roms", thumbs: "thumbnails", bios: "system" }[kind] || "roms");

// An error must never end Node.js: on Android that closes the whole app. Log it and keep going.
process.on("uncaughtException", e => console.error("uncaught: " + (e && e.stack || e)));
process.on("unhandledRejection", e => console.error("unhandled: " + (e && e.stack || e)));
setInterval(() => {}, 1 << 30);   // stay alive even if the server could not start (the app shows the error)
let createServer;
try { ({ createServer } = require("./server")); }
catch (e) { console.error("server.js failed to load: " + (e && e.stack || e)); fs.writeFileSync(PORT_FILE, "error " + e.message); }
if (createServer) (async () => {
  const webDir = path.join(FILES_DIR, "web");
  for (const p of [8765, 8766, 8767, 8768, 8769, 8770]) {
    const s = createServer({ port: p, webDir, configFile: CONFIG_FILE, appDirs, shortcuts, spill, log: console.log });
    try {
      await s.start();
      fs.writeFileSync(PORT_FILE, String(p));
      console.log("EmulatorJS server on port " + p);
      return;
    } catch (e) {
      if (e.code !== "EADDRINUSE") { console.log("server error: " + e.message); fs.writeFileSync(PORT_FILE, "error " + e.message); return; }
    }
  }
  fs.writeFileSync(PORT_FILE, "error no free port");
})();
