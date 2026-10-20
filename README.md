# EmulatorJS Retro Arcade

**English** | [简体中文](README.zh-CN.md)

Download, double-click and play classic games — NES, SNES, Game Boy / GBA, N64, Nintendo DS, Sega Genesis / CD / Saturn,
PlayStation, PSP, PC Engine, arcade and more — and play together with friends on the same Wi-Fi or anywhere on the internet
(up to 4 players, with voice chat and spectators). Built on the open-source [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) (GPL-3.0).

https://github.com/user-attachments/assets/cdbd7d1b-7f00-4caf-9875-5c82e2470ef6

*Drop into a friend's game from the lobby, like walking up to an arcade cabinet and inserting a coin.*

## Download

**[👉 Download the latest version](https://github.com/supwang/emulatorjs-releases/releases/latest)**

| Your computer | Download this |
|---|---|
| Windows (recommended) | `EmulatorJS-Setup-<version>.exe` — installer; updates itself when a new version comes out |
| Windows (no install) | `EmulatorJS-<version>-win.zip` — unzip, then double-click `EmulatorJS.exe` |
| Mac with Apple chip (M1 / M2 / M3 / M4) | `EmulatorJS-<version>-mac-apple-silicon.dmg` |
| Mac with Intel chip | `EmulatorJS-<version>-mac-intel.dmg` |
| Android phone / tablet / TV | `EmulatorJS-<version>-android.apk` — copy it to the device and tap it to install (Android 7.0 or newer) |
| Android emulator on a PC (MuMu etc.) | `EmulatorJS-<version>-android-x86_64.apk` |
| Any computer, in the browser | `EmulatorJS-<version>-folder.zip` — unzip, then double-click `EmulatorJS-Windows.bat` (Windows) or `EmulatorJS.command` (Mac) |
| Your own internet play server | `ejs-cloud-setup.sh` — on an Ubuntu 22.04 / 24.04 cloud server, run `sudo bash ejs-cloud-setup.sh` |

Not sure which Mac you have? Apple menu → About This Mac: "Chip: Apple M…" is an Apple chip, "Processor: … Intel" is Intel.

**First start:** the apps aren't signed, so your computer asks once.
- Windows: if you see "Windows protected your PC", click **More info → Run anyway**.
- Mac: open **System Settings → Privacy & Security** and click **Open Anyway**.

## Getting started

1. Put your games in a `roms` folder inside `Documents/EmulatorJS` (the folder version already has one), ideally in a subfolder per platform:
   `nes`, `snes`, `gb`, `gba`, `n64`, `nds`, `md`, `segacd`, `saturn`, `psx`, `psp`, `pce`, `fbneo` (arcade).
   Keep arcade zips as they are — don't unzip or rename them.
2. BIOS files (PlayStation, Neo Geo `neogeo.zip`, Sega CD) go in the `system` folder. Cover art (RetroArch thumbnails) goes in `thumbnails` (optional).
3. Click **↻ Reload**, pick a platform on the left and click a game.

Keyboard: move **W A S D**, Start **Enter**, Select / coin **V**, buttons **J K** (and **I L U O**), save / load state **1 / 2**. Gamepads work as soon as they're plugged in.

**Full user guide** (also included in every download): [English](source/folder/README_US.txt) · [简体中文](source/folder/README_CN.txt) · [繁體中文](source/folder/README_HK.txt) · [日本語](source/folder/README_JP.txt) · [한국어](source/folder/README_KR.txt) · [Español](source/folder/README_ES.txt) · [Français](source/folder/README_FR.txt) · [Deutsch](source/folder/README_DE.txt) · [Português](source/folder/README_BR.txt) · [Русский](source/folder/README_RU.txt)

## Updates

When a new version comes out, every version of the app tells you what's new (click the version number on the left to check at any time).
The **installed Windows version** downloads and installs it by itself with one click. Mac, the Windows zip version, the folder version and Android show the download link — replace the old version with the new one; your games, settings and saves are kept.

## Source code

The full source code of each version is in [`source/`](source) (GPL-3.0, like EmulatorJS), and every release has a "Source code" download.

## Notes

- **No game ROMs or BIOS files are included.** Please use games you own. For personal, non-commercial use.
- `latest.json` in this repository is what the apps read to find new versions — please don't delete it.
