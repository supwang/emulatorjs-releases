// Give EmulatorJS.app's executables their own Mach-O UUID (LC_UUID).
//
// macOS (15 and later) remembers the "Local Network" permission by the executable's UUID. Electron ships the same
// prebuilt executables to every app, so EmulatorJS had the same UUID as every other Electron app of that version
// (Teams, other chat / AI apps...). macOS could then apply another app's (missing) permission to EmulatorJS:
// the switch in System Settings was on, yet the page could not reach other computers ("Failed to fetch"),
// and online play between two computers on the same network went through the internet server (slow).
//
// Usage: node tools/mac-uuid.js path/to/EmulatorJS.app   (run before codesign; codesign must sign it again after)
// The new UUID is made from the app identifier + executable name + CPU type, so it stays the same between builds.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");

const LC_UUID = 0x1b;
function patchThin(buf, off, key, log) {
  const magic = buf.readUInt32LE(off);
  if (magic !== 0xfeedfacf && magic !== 0xfeedface) throw new Error("not a Mach-O file");
  const is64 = magic === 0xfeedfacf;
  const cputype = buf.readInt32LE(off + 4), ncmds = buf.readUInt32LE(off + 16);
  let p = off + (is64 ? 32 : 28), n = 0;
  for (let i = 0; i < ncmds; i++) {
    const cmd = buf.readUInt32LE(p), size = buf.readUInt32LE(p + 4);
    if (cmd === LC_UUID) {
      const h = crypto.createHash("sha256").update(key + "|" + cputype).digest();
      const u = Buffer.from(h.subarray(0, 16));
      u[6] = (u[6] & 0x0f) | 0x80;   // UUID version 8 (made from a hash)
      u[8] = (u[8] & 0x3f) | 0x80;   // RFC 4122 variant
      const old = buf.subarray(p + 8, p + 24).toString("hex");
      u.copy(buf, p + 8);
      log.push(`  cpu ${cputype}: ${old} -> ${u.toString("hex")}`);
      n++;
    }
    p += size;
  }
  if (!n) throw new Error("no LC_UUID");
}
function patchFile(file, key) {
  const buf = fs.readFileSync(file), log = [];
  const be = buf.readUInt32BE(0);
  if (be === 0xcafebabe || be === 0xcafebabf) {   // universal binary: every architecture inside
    const fat64 = be === 0xcafebabf, n = buf.readUInt32BE(4);
    for (let i = 0; i < n; i++) {
      const e = 8 + i * (fat64 ? 32 : 20);
      const offset = fat64 ? Number(buf.readBigUInt64BE(e + 8)) : buf.readUInt32BE(e + 8);
      patchThin(buf, offset, key, log);
    }
  } else patchThin(buf, 0, key, log);
  fs.writeFileSync(file, buf);
  console.log(path.basename(file) + "\n" + log.join("\n"));
}

const app = process.argv[2];
if (!app || !fs.existsSync(path.join(app, "Contents", "Info.plist"))) { console.error("usage: node mac-uuid.js EmulatorJS.app"); process.exit(1); }
const plist = fs.readFileSync(path.join(app, "Contents", "Info.plist"), "utf8");
const id = (plist.match(/<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/) || [])[1];
if (!id) { console.error("no CFBundleIdentifier"); process.exit(1); }
const exes = [];
const mainExe = (plist.match(/<key>CFBundleExecutable<\/key>\s*<string>([^<]+)<\/string>/) || [])[1];
exes.push(path.join(app, "Contents", "MacOS", mainExe));
const fw = path.join(app, "Contents", "Frameworks");
for (const d of fs.readdirSync(fw)) {
  if (!d.endsWith(".app")) continue;   // EmulatorJS Helper.app, ... (GPU), ... (Renderer), ... (Plugin)
  const dir = path.join(fw, d, "Contents", "MacOS");
  for (const f of fs.readdirSync(dir)) exes.push(path.join(dir, f));
}
for (const f of exes) patchFile(f, id + "|" + path.basename(f));
console.log("patched " + exes.length + " executables");
