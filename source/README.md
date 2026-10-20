# EmulatorJS apps

Desktop app (Windows / Mac) for the EmulatorJS retro game arcade: one window with the game page, no browser
and no terminal window. The built-in server still runs inside the app, so LAN play, internet play and
phones/tablets opening this computer's address in their browser work as before.

```
web/       the game page and emulator files (index.html + data/)
desktop/   the Electron app: main.js (window), server.js (built-in server), test/
.github/workflows/desktop.yml   builds the apps on GitHub's Windows and Mac machines
```

## Getting the apps

- **Actions → Build desktop apps → Run workflow**: when it finishes, the files are under the run's *Artifacts*.
- Or push a tag such as `v1.0.1`: the files are also published under **Releases**.

| File | For |
|---|---|
| `EmulatorJS-Setup-x.y.z.exe` | Windows, installs (you choose the folder) with Start menu and desktop shortcuts |
| `EmulatorJS-x.y.z-win.zip` | Windows, no install: unzip, then double-click `EmulatorJS.exe` |
| `EmulatorJS-x.y.z-mac-apple-silicon.dmg` | Mac with M1/M2/M3/M4 chip |
| `EmulatorJS-x.y.z-mac-intel.dmg` | Mac with Intel chip |

The apps are not signed with a paid Apple / Microsoft certificate, so the first start shows a warning:
Windows "More info → Run anyway"; Mac: right-click the app → Open (on macOS 15: System Settings →
Privacy & Security → Open Anyway).

## Where things are

- Settings (folders, internet play server, LAN switch): `config.json` in the app's data folder
  (Windows `%APPDATA%\EmulatorJS`, Mac `~/Library/Application Support/EmulatorJS`). On first start the app
  takes over the settings of an old EmulatorJS folder, or uses `desktop/default-config.json`.
- ROMs / thumbnails / BIOS are found automatically in `roms`, `thumbnails`, `system` next to the app,
  in `Documents/EmulatorJS`, or in RetroArch's folders — or set them in "⚙ Folder settings".

## Testing locally

```
cd desktop && npm ci && npm test && npm start
```
