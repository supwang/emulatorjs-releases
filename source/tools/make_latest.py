#!/usr/bin/env python3
"""latest.json for the public download repository: what the apps read to show "new version".
  python3 tools/make_latest.py <version> <folder with the release files>   (prints the JSON)
What's new comes from release-notes/<version>.json ({"zh-CN": [...], "en": [...], ...}).
"""
import hashlib, json, os, sys, time, urllib.parse

PUBLIC = "supwang/emulatorjs-releases"
BAIDU = "https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk"   # a shared folder: new versions go into it, the link stays
BAIDU_CODE = "6akk"

v, d = sys.argv[1], sys.argv[2]
kinds = {
    "EmulatorJS-Setup-%s.exe" % v: "win-setup",
    "EmulatorJS-%s-win.zip" % v: "win-zip",
    "EmulatorJS-%s-mac-apple-silicon.dmg" % v: "mac-arm64",
    "EmulatorJS-%s-mac-intel.dmg" % v: "mac-x64",
    "EmulatorJS-%s-folder.zip" % v: "folder",
    "EmulatorJS-%s-android.apk" % v: "android",
    "EmulatorJS-%s-android-x86_64.apk" % v: "android-x86_64",
    "ejs-cloud-setup.sh": "server",
}
files = {}
for name in sorted(os.listdir(d)):
    k = kinds.get(name)
    if not k:
        continue
    h = hashlib.sha256()
    with open(os.path.join(d, name), "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    files[k] = {"name": name, "size": os.path.getsize(os.path.join(d, name)), "sha256": h.hexdigest(),
                "url": "https://github.com/%s/releases/download/v%s/%s" % (PUBLIC, v, urllib.parse.quote(name))}
for need in ("win-setup", "win-zip", "mac-arm64", "mac-x64", "folder"):
    if need not in files:
        sys.exit("missing the %s download" % need)
nf = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "release-notes", v + ".json")
notes = json.load(open(nf, encoding="utf-8")) if os.path.exists(nf) else {}
print(json.dumps({"version": v, "date": time.strftime("%Y-%m-%d"),
                  "page": "https://github.com/%s/releases/tag/v%s" % (PUBLIC, v),
                  "baidu": BAIDU, "baiduCode": BAIDU_CODE, "notes": notes, "files": files}, ensure_ascii=False, indent=1))
