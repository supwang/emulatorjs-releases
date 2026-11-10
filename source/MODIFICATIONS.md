# Modifications and licenses

This project is built on **EmulatorJS 4.2.3** (https://github.com/EmulatorJS/EmulatorJS, GPL-3.0),
taken from the npm package `@emulatorjs/emulatorjs@4.2.3`, with the cores from `@emulatorjs/cores@4.2.3`.

The whole project is licensed under the **GNU General Public License v3.0** (see [LICENSE](LICENSE)),
like EmulatorJS. Copyright of the parts added in this project: © 2026 Supwang.
The emulator cores and a few bundled assets keep their own licenses (listed below).

## Changes to EmulatorJS files

Only three EmulatorJS files were changed. The two JavaScript files also carry a notice at the top.

| File | Date | Change |
|---|---|---|
| `web/data/src/emulator.js` | 2026-10-17 | The page can set the button names and order for a system or game (`window.EJS_customButtons`), used for arcade and console button layouts |
| `web/data/src/emulator.js` | 2026-10-21 | Virtual gamepad (phones): joystick zones accept a `size`, and the stick distance is scaled to it (used by the N64 layout) |
| `web/data/src/emulator.js` | 2026-11-05 | Gamepads are found by their `index`, not by their position in the gamepad list. On some systems (often a Mac with one Xbox controller) the only gamepad has index 1, so `gamepads[e.gamepadIndex]` was undefined and every gamepad event threw; connect, disconnect and button events are fixed |
| `web/data/src/gamepad.js` | 2026-11-05 | An error while reading the gamepads no longer stops the gamepad loop (before, one error made every button stop working until reload) |
| `web/data/localization/ko-KO.json` | 2026-10-18 | Added a missing comma after `"DPAD_RIGHT"`, which made the Korean file invalid JSON |

Everything else under `web/data/` that comes from EmulatorJS (`loader.js`, `emulator.css`, `src/` apart from the
two files above, `localization/`, `compression/`, `version.json`) is unchanged. EmulatorJS's demo `index.html`
is not used.

## Added in this project (GPL-3.0)

- `web/index.html`: the game library page (game list, settings, netplay, voice chat, continue/save states)
- `web/data/netplay.js`: key-sync netplay with delay and rollback modes, and button replays (recording and playback)
- `web/data/i18n.js`, `web/data/i18n/`: interface translations
- `web/migrate.html`, `web/upload.html`, `web/data/names.json`, `web/data/fbneo-names.txt`, `web/data/fbneo-sets.txt`,
  `web/data/badwords.json`, `web/data/themes/`, `web/data/manifest.json`, icons
- `desktop/`: the Windows / Mac app (Electron) with the built-in server
- `android/`: the Android app
- `folder/`: the folder version (start scripts, server, user guides), `folder/cloud-server/`: optional internet-play server setup
- `tools/`, `release-notes/`

## Third-party material bundled

| Item | License | License file |
|---|---|---|
| EmulatorJS 4.2.3 | GPL-3.0 | `LICENSE`, `web/LICENSE` |
| fflate 0.8.2 (`web/data/fflate.js`, unchanged), by Arjun Barrett | MIT | `web/data/LICENSE-fflate-MIT.txt` |
| mp4-muxer 5.2.2 (`web/data/mp4-muxer.js`, unchanged), by Vanilagy | MIT | `web/data/LICENSE-mp4-muxer-MIT.txt` |
| webm-muxer 5.1.4 (`web/data/webm-muxer.js`, unchanged), by Vanilagy | MIT | `web/data/LICENSE-webm-muxer-MIT.txt` |
| Console pictures: RetroArch "Systematic" theme (libretro/retroarch-assets) | CC BY 4.0 | `web/data/consoles/LICENSE-CC-BY-4.0.txt` |
| Phone controller buttons: libretro common-overlays | CC BY 4.0 | `web/data/vpad/LICENSE-CC-BY-4.0.txt` |
| Press Start 2P font, by CodeMan38 | SIL OFL 1.1 | `web/data/fonts/LICENSE-OFL-1.1.txt` |
| flag-icons | MIT | `web/data/flags/LICENSE-flag-icons-MIT.txt` |
| Arcade game Chinese names: gamelistxml_Chinese_project | BSD-2-Clause | `web/data/LICENSE-gamelistxml-BSD-2.txt` |
| acme.sh (cloud server setup) | GPL-3.0 | `folder/cloud-server/LICENSE-acme.sh-GPLv3.md` |

## Emulator cores

The cores bundled in `web/data/cores/` are the unmodified EmulatorJS builds from `@emulatorjs/cores@4.2.3`, built
with https://github.com/EmulatorJS/build (each core includes RetroArch, https://github.com/EmulatorJS/RetroArch,
GPL-3.0). Each `.data` file contains the core's own license file.

| Core | Source | License |
|---|---|---|
| FBNeo | https://github.com/EmulatorJS/FBNeo | FBNeo license, non-commercial |
| FCEUmm | https://github.com/EmulatorJS/libretro-fceumm | GPL-2.0 |
| Genesis Plus GX | https://github.com/EmulatorJS/Genesis-Plus-GX | Genesis Plus GX license, non-commercial |
| PicoDrive | https://github.com/EmulatorJS/picodrive | PicoDrive license, non-commercial |
| Snes9x | https://github.com/EmulatorJS/snes9x | Snes9x license, non-commercial |

Cores for other systems are not bundled: EmulatorJS downloads them from its own server (cdn.emulatorjs.org) when
such a game is first started, as unmodified EmulatorJS does.

The non-commercial terms belong to those cores only; they are not added to the GPL-3.0 parts of this project.

No game ROMs or BIOS files are included.
