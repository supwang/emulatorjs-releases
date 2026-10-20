// EmulatorJS desktop app: one window with the game page, no browser and no terminal window.
// The built-in server (server.js) keeps running inside the app, so LAN play and phones/tablets
// opening this computer's address in their browser work exactly as before.
"use strict";
const { app, BrowserWindow, Menu, shell, session, dialog, net } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
const { createServer } = require("./server");
const { createUpdater } = require("./updater");

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
// computers without working graphics acceleration (old PCs, virtual machines) still get WebGL through
// Chromium's software renderer; only our own local page is ever shown, so this is safe here
app.commandLine.appendSwitch("enable-unsafe-swiftshader");
if (process.platform === "win32") app.setAppUserModelId("site.couchvs.emulatorjs");

const WEB_DIR = app.isPackaged ? path.join(process.resourcesPath, "web") : path.join(__dirname, "..", "web");
const CONFIG_FILE = path.join(app.getPath("userData"), "config.json");
let win = null, srv = null, port = 0;

// Folders that may hold roms / thumbnails / system (BIOS), like the EmulatorJS folder did before
function appDirs() {
  const out = [];
  if (process.env.PORTABLE_EXECUTABLE_DIR) out.push(process.env.PORTABLE_EXECUTABLE_DIR);   // Windows portable .exe
  if (app.isPackaged) {
    if (process.platform === "darwin") {
      const bundle = path.resolve(process.execPath, "..", "..", "..");          // .../EmulatorJS.app
      if (!bundle.includes("AppTranslocation")) out.push(path.dirname(bundle));  // the folder the app sits in
    } else out.push(path.dirname(process.execPath));
  }
  const home = os.homedir();
  out.push(path.join(home, "Documents", "EmulatorJS"), path.join(home, "EmulatorJS"), path.join(home, "Desktop", "EmulatorJS"),
    path.join(home, "Documents", "RetroArch", "EmulatorJS"), path.join(home, "Downloads", "EmulatorJS"));
  return [...new Set(out)];
}

// First start: take over the settings of the old EmulatorJS folder (folders, internet play server),
// or the defaults that come with the app.
function seedConfig() {
  if (fs.existsSync(CONFIG_FILE)) return;
  // (default-config.json is kept outside the web folder: the web folder is shared on the LAN, the room password must not be)
  const dflt = app.isPackaged ? path.join(process.resourcesPath, "default-config.json") : path.join(__dirname, "default-config.json");
  const tries = appDirs().map(d => path.join(d, "config.json")).concat([dflt]);
  for (const f of tries) {
    try {
      const d = JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, ""));
      if (!d || typeof d !== "object") continue;
      fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(d, null, 2));
      return;
    } catch (e) {}
  }
}

function askOldServerToQuit(p) {
  // an old EmulatorJS (EmulatorJS.command / .bat) is still running on this port: ask it to close
  return new Promise(resolve => {
    const req = http.request({ host: "127.0.0.1", port: p, path: "/api/quit", method: "POST", timeout: 1500,
      headers: { "X-EJS": "1", "Content-Type": "application/json", Host: "127.0.0.1:" + p } }, res => { res.resume(); res.on("end", () => resolve(true)); });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.end("{}");
  });
}

async function startServer() {
  const updater = createUpdater({ fetch: (u, o) => net.fetch(u, o), version: app.getVersion(), packaged: app.isPackaged,
    execPath: process.execPath, tmpDir: app.getPath("temp"), spawn: require("child_process").spawn, quit: () => app.quit() });
  const opts = { webDir: WEB_DIR, configFile: CONFIG_FILE, appDirs: appDirs(), updater };
  for (const p of [8765, 8765, 8766, 8767, 8768, 8769, 8770]) {
    const s = createServer(Object.assign({ port: p }, opts));
    try { await s.start(); srv = s; return p; }
    catch (e) {
      if (e.code !== "EADDRINUSE") throw e;
      if (p === 8765) { await askOldServerToQuit(p); await new Promise(r => setTimeout(r, 900)); }
    }
  }
  throw new Error("No free port between 8765 and 8770");
}

function buildMenu() {
  if (process.platform !== "darwin") { Menu.setApplicationMenu(null); return; }
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: "appMenu" },
    { role: "editMenu" },
    { label: "View", submenu: [{ role: "reload" }, { role: "togglefullscreen" }, { type: "separator" }, { role: "toggleDevTools" }] },
    { role: "windowMenu" },
  ]));
}

function createWindow() {
  const origin = "http://127.0.0.1:" + port;
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 560, show: false, backgroundColor: "#15121f",
    title: "EmulatorJS", icon: path.join(WEB_DIR, "data", process.platform === "win32" ? "icon.ico" : "icon.png"), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, spellcheck: false },
  });
  // microphone (voice chat), full screen and gamepads for our own page only
  const okPerm = new Set(["media", "fullscreen", "pointerLock", "clipboard-sanitized-write", "speaker-selection"]);
  // the game runs in a frame of our page (about:srcdoc): it counts as our page too
  const ours = (wc, url) => String(url || "").startsWith(origin) || (/^about:(srcdoc|blank)/.test(String(url || "")) && !!wc && String(wc.getURL() || "").startsWith(origin));
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb, details) => cb(okPerm.has(perm) && ours(wc, details.requestingUrl)));
  session.defaultSession.setPermissionCheckHandler((wc, perm, reqOrigin) => okPerm.has(perm) && String(reqOrigin || "").startsWith(origin));
  // links to other websites open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url) && !url.startsWith(origin)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith(origin)) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  // Windows: F11 full screen, Ctrl+R reload, Ctrl+Shift+I developer tools (Mac has these in the menu)
  win.webContents.on("before-input-event", (e, input) => {
    if (process.platform === "darwin" || input.type !== "keyDown") return;
    if (input.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (input.control && !input.shift && input.key.toLowerCase() === "r") { win.webContents.reload(); e.preventDefault(); }
    else if (input.control && input.shift && input.key.toLowerCase() === "i") { win.webContents.toggleDevTools(); e.preventDefault(); }
  });
  win.once("ready-to-show", () => win.show());
  win.on("closed", () => { win = null; });
  win.loadURL(origin + "/index.html");
}

if (!app.requestSingleInstanceLock()) {
  app.quit();   // already open: the other copy brings its window to the front
} else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.whenReady().then(async () => {
    buildMenu();
    seedConfig();
    try { port = await startServer(); }
    catch (e) { dialog.showErrorBox("EmulatorJS", "Could not start: " + e.message); app.quit(); return; }
    createWindow();
    app.on("activate", () => { if (!win) createWindow(); });
  });
  app.on("window-all-closed", () => app.quit());   // closing the window closes EmulatorJS (and its server)
  app.on("before-quit", () => { try { srv && srv.stop(); } catch (e) {} });
}
