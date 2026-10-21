EmulatorJS — User Guide
================================

EmulatorJS lets you play retro games in your web browser. You don't need to install RetroArch,
and you don't need an internet connection.
It supports more than twenty platforms, including NES, SNES, Game Boy / GBA, N64, NDS,
Sega Mega Drive / Mega-CD / 32X / Saturn, PS1, PSP, PC Engine and arcade (FBNeo / MAME 2003).


1. What's in the folder
-----------------------
  index.html              The game page (don't open it by double-clicking)
  data/                   Emulators and emulator cores — don't change anything here
  EmulatorJS.command      Start file for Mac
  EmulatorJS-Windows.bat  Start file for Windows
  start-windows.ps1       Script used by the Windows start file; keep it next to the .bat
  Enable-LAN-Windows.bat  Windows permission for LAN play (pops up automatically the first time;
                          double-click it yourself only if you answered "No" back then)
  cloud-server/           Setup script for an internet play server (used only on a cloud server, see section 8)
  server.py               The small local server used by the Mac start file
  config.json             Created when you first save the folder settings; remembers your folders
  EmulatorJS.lnk          Shortcut with a gamepad icon, created by Windows on the first run
  LICENSE                 EmulatorJS open-source license (GPL-3.0)
  README_US.txt etc.      This guide, one file per language: CN 简体中文, HK 繁體中文, US English,
                          JP 日本語, KR 한국어, ES Español, FR Français, DE Deutsch, BR Português, RU Русский


2. How to open it
-----------------
[Desktop app (recommended)]
  If you'd rather not use a browser or keep a terminal window open, use the desktop app: double-click
  it and the game window opens; close the window to quit.
  · Windows: EmulatorJS-Setup-version.exe installs it (you can choose the folder; adds Start menu and desktop shortcuts);
    EmulatorJS-version-win.zip needs no install: unzip it anywhere and double-click EmulatorJS.exe inside.
    If "Windows protected your PC" appears the first time: "More info" → "Run anyway".
    When Windows asks about network access, tick "Private networks" and click "Allow" (needed for LAN play).
  · Mac: …-mac-apple-silicon.dmg for M1 / M2 / M3 / M4 chips, …-mac-intel.dmg for Intel chips.
    Open the dmg and drag EmulatorJS into "Applications".
    The first time it says the developer can't be verified: go to System Settings → Privacy & Security
    and click "Open Anyway".
    When it asks to find devices on your local network or to use the microphone, choose "Allow"
    (needed for LAN play and voice chat).
  · Game folders: roms, thumbnails and system in "Documents/EmulatorJS" and RetroArch's usual places are
    found automatically, or pick them in "⚙ Folder settings". On first start the app takes over the
    settings of your old EmulatorJS folder.
  · Settings are kept in the app's own data folder. The old EmulatorJS.command / EmulatorJS-Windows.bat
    still work, and both can play together.
  · The settings file config.json (folders, internet play server address and room password) is at:
    Windows: %APPDATA%\EmulatorJS\config.json (type %APPDATA%\EmulatorJS in File Explorer's address bar and press Enter)
    Mac: ~/Library/Application Support/EmulatorJS/config.json (in Finder press Shift+Command+G and paste the path)

[Android phones / tablets / Android TV (APK)]
  · Phones, tablets, TVs and TV boxes: EmulatorJS-version-android.apk.
    Android emulators on a PC (MuMu etc.): EmulatorJS-version-android-x86_64.apk.
    Needs Android 7.0 or newer. If the TV's "Android System WebView" is too old, the app tells you to update it.
  · Install: copy the apk to the phone / TV (USB cable, USB drive or a chat app), then tap it in a file manager.
    If Android says installing unknown apps isn't allowed, allow it for that file manager and tap the apk again.
    TV: copy the apk to a USB drive, plug it into the TV and open the apk with the TV's file manager.
  · On first start, allow access to photos and files (storage), otherwise the app can't read your games.
    The app then creates "Phone storage / EmulatorJS" with the folders roms, thumbnails and system.
  · Adding games: connect the phone to a computer with a cable (choose "File transfer" on the phone),
    copy the games into EmulatorJS / roms, sorted the same way as on a computer (see section 3);
    cover pictures go in thumbnails, BIOS files in system. Then tap "↻ Reload".
    Games can also live elsewhere: pick the folders in "⚙ Folder settings", which has shortcut buttons
    such as "Phone storage" and "Downloads".
  · USB drive on a TV: an EmulatorJS or RetroArch folder (with roms etc. inside) at the top of the drive is found
    automatically, or tap "USB drive / memory card" in "⚙ Folder settings". After changing the drive, tap "↻ Reload".
    Android doesn't let apps write to USB drives: games downloaded from other players during online play are
    saved in "EmulatorJS / downloads" and listed together with the games on the drive.
  · Controls:
    Phone: on-screen buttons, or a Bluetooth / USB gamepad.
    TV: choose games with the remote (arrows move, OK opens, Back goes back), then play with a gamepad.
    In a game, Back on the remote or phone (or holding Select + Start on a gamepad) opens the game menu:
    resume, save state, load state, reset, full screen, quit game. Press Back twice in the game list to close the app.
  · Online play, the lobby and accounts work the same as on a computer, and you can play together with computers
    (for LAN play, use the same Wi-Fi). Voice chat asks for the microphone the first time: choose "Allow".
  · Cheap TV boxes are slow: NES, SNES, GBA and Mega Drive run smoothly; N64, PSP, NDS and Saturn may stutter.
  · A controller (Xbox, PlayStation, 8BitDo…, Bluetooth or cable) becomes player 1 as soon as it's connected; no need
    to pick it in "Control Settings".
  · Console and arcade games use the "CRT easymode" filter by default (like an old TV, with scanlines); change it in the
    game's "Settings → Shaders" if you don't like it.

[Mac]
  1. Double-click EmulatorJS.command.
     If the first time it says it "can't be opened because it is from an unidentified developer":
     right-click it → "Open" → "Open" again. After that, double-clicking works.
  2. A Terminal window opens and your browser opens the game page automatically.
     If macOS asks you to install the "command line developer tools", click "Install",
     then double-click the start file again.
  3. Keep the Terminal window open while you play; close it when you're done.
  The start file gets a gamepad icon automatically. If the icon gets lost when copying,
  running it once brings it back.

[Windows]
  1. Double-click EmulatorJS-Windows.bat.
     If a blue "Windows protected your PC" box appears: click "More info" → "Run anyway".
  2. A black command window opens and your browser opens the game page automatically.
  3. Keep that window open while you play; close it when you're done.
  Windows can't give a .bat file an icon, so after the first run an "EmulatorJS" shortcut with
  an icon appears in the folder. Use that from then on — you can drag it to your desktop.
  If you move the folder, the shortcut stops working; double-click the .bat once to recreate it.

Why does that window have to stay open?
  It runs a small web server that only this computer can reach. For security reasons, browsers
  don't let a page you double-click read the emulator files, so the page is opened through it.
  Close the window and the server stops.

[Updating to a new version]
  · EmulatorJS checks for a new version when it opens (and every 6 hours after that). If there is one, a notice shows
    what's new, and "🆕 New version" appears next to the version number in the left sidebar. Click the version number
    to check by hand at any time. It never pops up while you're playing.
  · Installed Windows version (installed with EmulatorJS-Setup-<version>.exe): click "Update automatically". EmulatorJS
    downloads the new installer and checks that it's complete; then click "Install now": EmulatorJS closes, installs the
    new version and opens again by itself (about half a minute). Your games, settings and saves are kept.
    If the download is very slow (more than about 5 minutes) or fails, you're offered Baidu Netdisk instead.
  · Mac, the Windows zip version, the folder version, Android: click "Download the new version" (or Baidu Netdisk, best
    in China) and replace the old version as the notice explains (Mac: drag the new EmulatorJS into Applications and
    choose "Replace"; folder version: copy the new files over the old folder).
  · Downloads: https://github.com/supwang/emulatorjs-releases/releases
    Baidu Netdisk: https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk (code 6akk)
  · Don't want a version? Click "Skip this version". Checking only reads the version information on the download site;
    nothing is uploaded.


3. Game folders (set them once)
-------------------------------
When the page opens it reads three folders automatically, so you don't have to pick them each time:

  ROM folder         The main folder with your games (required)
  Thumbnails folder  RetroArch's thumbnails folder (optional, shows game covers)
  BIOS folder        Folder with BIOS files (optional, only some platforms need it, see section 9)

[Automatic search] Folders you haven't set are looked for in this order, and used as soon as found:
  1. Inside the EmulatorJS folder (next to EmulatorJS.command and EmulatorJS-Windows.bat):
     the roms, thumbnails and system folders (the BIOS folder may also be called bios)
  2. RetroArch's default locations
     Mac: roms, thumbnails, system under ~/Library/Application Support/RetroArch/
     Windows: %APPDATA%\RetroArch, or roms, thumbnails, system inside RetroArch-Win64, RetroArch,
              Games\RetroArch-Win64 etc. on drives C:/D:/E:/F:
  So if your RetroArch uses its default location, you can play right away the first time.
  When sharing with someone, you can also put the roms, thumbnails and system folders straight into
  the EmulatorJS folder — they just unzip it, open it and play.

[Manual setup] Click "⚙ Folder settings" at the top left:
  1. Click "Browse…" next to each item, click your way into the folder, then click "Choose this folder".
     There are shortcut buttons at the top such as "Home", "Desktop" and "RetroArch".
     You can also paste a folder path.
  2. Click "Save and load games". The settings are saved in config.json and used every time.
  - "Clear" and save to go back to automatic search.
  - If a folder you set can no longer be found (for example on another computer), automatic search
    is used again and the settings page tells you so.

[Download pictures automatically]
  For games without a cover, EmulatorJS can download box art, title screens and screenshots from the libretro community's
  collection (libretro-thumbnails, the same one RetroArch uses) into your pictures folder (if none is set, a "thumbnails"
  folder is made next to your ROM folder).
  · The first time it finds games without covers it asks whether to download them; if you say yes, games you add later get theirs too.
  · You can switch this on or off in "⚙ Folder settings" -> "Download pictures automatically", or click "⬇ Download missing pictures now".
  · Pictures are matched by game name (arcade games by their full FBNeo name), so standard No-Intro style file names work best;
    renamed or translated file names may not be found.
  · Needs access to GitHub. Progress shows at the top left and you can "Stop" at any time. The collection is put together by
    the community; the pictures belong to the game companies.

[After adding new games] Click "↻ Reload" at the top left — no need to reopen the page.

[How new games are sorted into platforms]
  Each game's platform is decided in this order; the first step that recognizes it wins:
  1. The platform recorded in a RetroArch playlist (this tool comes with a game list)
  2. A platform you picked before (pick it once under "Choose the platform manually"; it's remembered)
  3. The file extension: .nes .sfc .smc .md .gen .gba .gb .n64 .nds and so on
  4. The file contents:
     - Archives (.zip): what's inside — for example a .sfc inside means SNES, a .md means Mega Drive
     - Disc / cartridge images (.bin .iso .cue): the header at the start of the file, which identifies
       Mega Drive, Sega CD, Saturn, PS1 and more
  5. The name of the folder it's in: snes, md, fbneo, "Nintendo - Super Nintendo Entertainment System", etc.
  6. An archive with no known cartridge format inside → treated as an arcade game
  7. Anything still unknown (e.g. .7z, .chd) goes to "Choose the platform manually"; pick it once
  Arcade games are also checked against FBNeo's official game list (8,000+ sets): a file whose name isn't on it
  (for example NAOMI's cvs2.zip) can't run in FBNeo and goes to "Not supported in the web version".
  So even if all kinds of games are in one folder, most of them end up on the right platform.
  Only the start of each file and the archive directory are read, so it's fast; results are
  remembered, so next time nothing needs to be detected again.

Tips:
  - Ideally keep one sub-folder per platform in your ROM folder, e.g. snes, md, nes, fbneo, or
    RetroArch-style names like "Nintendo - Super Nintendo Entertainment System", so platforms are
    recognized automatically.
  - If the top left shows three buttons such as "Choose ROM folder" instead of "⚙ Folder settings",
    the page was opened the wrong way or by an old start window: close all Terminal / command
    windows and open it again with the start file.


4. Playing
----------
  1. The platform list is on the left, each with a picture of the console. Neo Geo games have their
     own "Neo Geo" entry; other arcade games are under "Arcade (FBNeo)".
     Click a platform to see covers of all its games on the right.
     "🕘 Recently played" at the top lists the last 10 games played on this computer; click one to play again.
     To remove one: hover over the cover and click the ✕ in its corner (gamepad: select it and press X; keyboard: Delete).
     "Clear list" removes them all.
     Hover over a game to cycle through its pictures: cover → title screen → screenshot. The dots
     under the cover show how many there are and which one you're on; move away and it stays on
     the current one. (Missing pictures are skipped; games with only one picture don't cycle.)
     Cover size: pick "S / M / L / XL" at the top right of the cover wall. Each platform remembers its own size.
  2. Click a cover to start the game.
  3. Click "Quit game" at the top right to go back to the cover wall.
  4. Use the search box to find games by name.
  5. At the bottom of the left sidebar, "⌨ Shortcuts" lists the keyboard and gamepad buttons for
     coin, start, reset, pause, turbo, save / load and the arcade service menu. Click the title to
     collapse / expand it; your choice is remembered.
  6. Color theme: click 🎨 next to "EmulatorJS" at the top left to choose one of 7 themes
     (Childhood [default: an arcade at dusk, with a background picture], Night Arcade [dark], Sega Blue [vivid blue], Game Boy Green, SNES Grey & Purple [light],
      Cream Cartridge [light], Candy Pink [light]).
     Background, text and buttons all change; your choice is remembered.
     The same panel also has "Background picture": choose a picture on your computer to show behind the game
     list on the right (it stays put when you scroll). Set one for all platforms, and/or a separate one for any
     platform (platforms without their own use the general one). The "Dim" slider darkens the picture so the text
     stays easy to read. Pictures are saved only in this browser on this device.
     While you play, the empty space beside the game shows the same picture (darkened and blurred), so vertical games
     aren't framed by black bars; you can turn this off in the same panel.
  7. Language: click the flag at the top left (see "Interface language" in section 8).

  - "Choose the platform manually": games whose platform couldn't be recognized. Pick a platform and
    the game moves into that group.
  - "Not supported in the web version": games the browser version can't run (for example Sega NAOMI).
    Don't want to see this list? Open it and click "Hide this list" at the top right, or untick it in "⚙ Folder settings".
    Play those in RetroArch.

Buttons, saves, save states, full screen and so on are in the menu bar below the game.
"Control Settings" shows and changes the keyboard keys and also supports gamepads.
Saves are kept in your browser; they're lost if you switch browsers or clear browser data.
To back them up, use "Export Save File" in the menu.

Cheats: in the menu bar click "Cheats" -> "Add Cheat", enter the code and a description, submit, then tick it to turn it on
(click again to turn it off). The code format depends on the platform: Game Genie for NES, Action Replay / GameShark for GBA, etc.;
search the web for "<game name> cheat codes". Some cheats need a game restart to fully undo.
When you play online with other players, cheats switch off automatically and the Cheats button is hidden;
they come back when you're playing alone again.

Cheat library: at the top of the "Cheats" menu click "📚 Pick from the cheat library (libretro)". It looks up this game's cheats
(from the libretro community database, libretro-database: good coverage for NES, SNES, Genesis, GBA and other consoles, almost none
for arcade), tick the ones you want and click "Add the selected cheats", then tick them in "Cheats" to turn them on.
Not available during online play either. Needs access to GitHub.


5. Keyboard and gamepad
-----------------------
[Default keyboard layout] (player 1)

  Directions          W up   S down   A left   D right
  Start               Enter
  Select / Coin       V

  NES                 J = A    K = B
  SNES                J = A    K = B    I = X    L = Y    U = L shoulder    O = R shoulder
  Mega Drive / CD     bottom row J K L = A B C        top row U I O = X Y Z
  Arcade Neo Geo (King of Fighters, Metal Slug, Samurai Shodown, etc.)
                      J = A    K = B    I = C    L = D
                      U = A+B together   O = C+D together   (A+B+C and B+C+D have no key by default)
  Arcade (other)      J K I L = buttons 1 2 3 4    U O = buttons 5 6
  Arcade (6-button fighters like Street Fighter, Darkstalkers, Marvel)
                      Light Punch J   Medium Punch K   Heavy Punch L
                      Light Kick U    Medium Kick I    Heavy Kick O
                      (3 punches / 3 kicks together have no key by default)

  Pause / resume      Right Shift
  Turbo on / off      T
  Reset game          V + Enter + U + O together (multi-game carts go back to the game menu)
  Save state 1        Load state 2        Switch slot 3
  (Fast forward, slow motion and rewind have no key by default; set them in "Control Settings")

  - Arcade games pick their layout from the ROM file name. Games using the 6-button layout now:
      Street Fighter (sf), Street Fighter II' Champion Edition (sf2ce), Street Fighter Alpha 3 (sfa3),
      Street Fighter III 3rd Strike (sfiii3), Street Fighter EX2 Plus (sfex2p),
      Darkstalkers (dstlk), Night Warriors (nwarr), Vampire Savior 2 (vsav2)
    All other arcade games (including Neo Geo games like KOF and Metal Slug) use the J K I L layout.
    New Street Fighter, Darkstalkers and Marvel (X-Men, Marvel) games are detected as 6-button too.
  - You can change keys in "Control Settings" in the menu bar below the game.

[Buttons shown in "Control Settings"]
  Buttons use the original controller names of each platform, always in this order:
    Coin / Select → Start → directions → buttons → combos → save state, fast forward and other functions

  NES                 Select, Start, directions, A, B
  SNES                Select, Start, directions, A, B, X, Y, L, R
  Mega Drive / CD     MODE, Start, directions, A, B, C, X, Y, Z
  Arcade Neo Geo      Coin, Start, directions, A, B, C, D
                      Combos: A+B, C+D, A+B+C, B+C+D
  Arcade fighters     Coin, Start, directions, Light / Medium / Heavy Punch, Light / Medium / Heavy Kick
                      Combos: 3 punches at once, 3 kicks at once
  Arcade (other)      Coin, Start, directions, buttons 1–6

  - A combo is one key that presses several buttons at once. A real Neo Geo only has A B C D;
    the combos are extras from the emulator that make special moves and dodges easier
    (e.g. A+B to dodge and C+D to knock down in KOF).
  - Whether an arcade game counts as Neo Geo or as a 6-button fighter is decided from its ROM file
    name and full title.
  - Settings are saved per game: keys, filters etc. that you change in one game only apply to that
    game and are used again next time; other games keep the defaults above.
  - Saves (including save states) are stored separately from these settings and don't affect each other.
  - Gamepad buttons aren't affected by the keyboard settings above — see [Gamepad] below.

[Gamepad]
Common controllers work: Xbox, PS4 / PS5, Switch Pro, and most USB / Bluetooth gamepads.

  1. Connect the controller to the computer by USB or Bluetooth.
  2. Once in a game, press any button on the controller first — the browser only detects it then
     (a browser privacy rule).
  3. By default buttons follow RetroArch's convention (Xbox controller shown; game button on the left):
       NES / SNES   B → A (bottom)   A → B (right)   Y → X (left)   X → Y (top)
       Mega Drive   A → X (left)     B → A (bottom)  C → B (right)
       Neo Geo      A → A (bottom)   B → B (right)   C → X (left)   D → Y (top)
       Fighters     Light Punch → X (left)  Medium Punch → Y (top)  Light Kick → A (bottom)  Medium Kick → B (right)
                    Heavy Punch → LB   Heavy Kick → RB
     (EmulatorJS's own defaults swap A and B on the gamepad; this tool matches RetroArch instead.)
     If a button is wrong, open "Control Settings" in the menu bar below the game and reassign it.
     Up to 4 players are supported, each with their own controller. Settings are saved in the browser.

  - Chrome or Edge is recommended; they have the best gamepad support.
  - For arcade games, Coin and Start are usually Select / View and Start / Menu on the controller.
  - Reset game: press Select + Start + LB + RB together (Share + Options + L1 + R1 on PlayStation).
    Use it with NES multi-game carts to get back to the game menu. It works on every platform.
  - The left stick works like the D-pad (pushed past halfway counts as pressed; diagonals work too),
    and you can mix the two.
  - Turbo on / off: click the right stick (R3, press it in).
  - Choosing games without a mouse (controller, keyboard or TV remote):
      D-pad / left stick / arrow keys: move between covers and buttons; A / Enter: confirm (start a game, press a button);
      B / Esc / remote Back: go back or close the open panel; LB / RB: previous / next platform; Start: open or close the lobby.
  - Game menu: while playing, hold Select + Start for half a second (Back on a TV remote) to resume, save state, load state,
    reset, go full screen or quit. Playing alone, the game pauses while the menu is open; online it doesn't pause,
    and players who joined don't see save, load and reset.

[Turbo]
  1. In a game, click "Turbo settings" at the top and tick the buttons that should fire rapidly
     in this game. For example in a shooter: tick the shot button, not the charge button, so holding
     shot fires rapidly and holding charge still charges normally.
  2. Turn turbo on: click "Turn turbo on" in "Turbo settings", or press T on the keyboard / R3 on the
     controller during the game. While on, "TURBO ON" shows at the top left of the game and the
     button changes to "Turbo settings · ON".
  3. Tick "Turn turbo on automatically for this game" so it's already on next time — no T / R3 needed.

  - Settings are saved per game; set each game once. By default all buttons are ticked and turbo
    doesn't turn on by itself.
  - Turbo fires about 15 times per second. Directions, Start and Coin are not affected.
  - It works on every platform, with keyboard and gamepad.
  - If keys don't react after closing "Turbo settings", click the game picture once.


6. Arcade settings: service menu, difficulty, lives, Neo Geo mode
-----------------------------------------------------------------
These settings are in the menu bar below the game: "Settings" (gear icon) → "Backend Core Options".
After changing them, click "Restart" in the menu bar for them to take effect. They're saved per game.

[Arcade service menu (Test Mode)]
  Hold Start (Enter) for about 2 seconds in a game to open the arcade board's own service menu,
  where you can change difficulty, lives, time, continues and so on (the options depend on the game).
  You can change how it opens with "diagnostic input" in the core options, e.g. holding Select.

[Difficulty, lives (DIP switches)]
  Many arcade games set difficulty and lives with DIP switches on the board.
  In the core options, look for items with "Dipswitch" in the name, for example:
    Difficulty   Lives   Bonus Life
  Every game has different switches, and some have none.

[Multiplayer modes (3 or 4 players)]
  - Captain Commando: the cabinet ships in 2-player mode; this tool switches it to 4-player mode by default
    ("Dipswitch Play Mode" in the core options — change it back there if you like).
  - Knights of the Round, The King of Dragons, Mercs: 3-player mode out of the box, nothing to change.
  - Warriors of Fate, Cadillacs & Dinosaurs and other Q-Sound CPS1 games: the number of players isn't a DIP switch
    but a setting in the game's service menu. If a third player can't join, check CONFIGURATION in the service menu
    (hold Start for about 2 seconds).
  - In online play everyone needs the same settings for the same game, otherwise you get "out of sync" messages,
    so it's best if everyone uses the latest version.

[Neo Geo arcade / home mode]
  This tool runs Neo Geo games (KOF, Metal Slug, Samurai Shodown, etc.) in arcade mode
  (MVS, Europe/Asia) by default:
    - Just like an arcade: press V to insert a coin, then Enter to start;
    - While one person plays, another can insert a coin and press Start any time to join
      (the same goes for online play);
    - Difficulty, lives etc. are set in the arcade service menu (see above).
  To switch to home-console mode, find "mode" (Neo-Geo mode) in the core options:
    MVS_EUR / MVS_USA / MVS_JAP  Arcade version (Europe-Asia / USA / Japan), needs coins   ← default MVS_EUR
    AES_EUR / AES_JAP            Home version (English / Japanese), no coins; set difficulty and lives
                                 under Option on the title screen
    DIPSWITCH                    The game's own default (usually the arcade version)
    UNIBIOS                      Fan-made enhanced BIOS (cheats, region switching, etc.)
  It's remembered per game: once a game is in home mode, it stays in home mode next time.
  When playing online, everyone needs the same mode for that game, or you'll see "screens went out of sync".
  Note: neogeo.zip must contain the matching BIOS file (a complete FBNeo neogeo.zip usually does);
  if it's missing, the game falls back to its default mode.


7. Filters (picture effects)
----------------------------
In a game, click "Settings" in the menu bar below → "Graphics Settings" → "Shaders" and pick one —
you'll see the effect right away:

  CRT easymode       Old CRT TV with scanlines, soft look — a good one to try first
  CRT geom           CRT look with screen curvature and dark corners, the most like an old tube TV
  CRT aperture       Simulates the aperture grille, sharp picture
  CRT mattias        Simulates the slight blur and color bleed of a TV signal
  2xScaleHQ          Rounds off and smooths pixel edges
  4xScaleHQ          Same, with stronger smoothing
  Disabled           No filter, original pixels

  - Filters are saved per game: once chosen for a game, it's used again next time;
    other games are set separately.
  - CRT filters look best in full screen; in a small window the scanlines look too dense.
  - On older computers CRT geom may stutter; CRT easymode runs more smoothly.


8. Playing together
-------------------
[LAN play (computers on the same Wi-Fi / router)]
No need to send each other addresses: everyone double-clicks EmulatorJS.command (Mac) or
EmulatorJS-Windows.bat (Windows). On the same local network, "🕹 Now playing" on the left lists
who is playing what on the other computers — click "Join" to jump in.

  · LAN play is on by default. If you don't want to be seen, click "⚙ Folder settings" and untick "LAN play".
  · Mac: the first time, macOS may ask whether Python may accept incoming network connections — choose "Allow".
  · Windows: the first time, "Do you want to allow this app to make changes to your device?" appears —
    choose "Yes" (asked only once). If you chose "No", double-click "Enable-LAN-Windows.bat" in the
    folder later, then open EmulatorJS again.
  · After clicking "Join" you still play on your own page, using the same game file on your own computer.
    If you don't have that game (or your file is different), you automatically play by watching the
    other person's screen instead.
  · Games marked "another computer" were started on another computer; the others were started from
    this computer's library.
  · Console games work the same way: if you see the game in the list, click "Join" to play together.
  · Click "I’m: …" to change your name; that's the name others see in the list.
    Names can't contain insults or other offensive words, and can't be the same as someone who is
    playing (ignoring case, spaces and symbols). A name with offensive words is automatically
    changed to "Player" plus a number.
    The blocked words are in data/badwords.json — edit it with a text editor (one word per entry).
    On the internet play server it's /opt/emulatorjs-cloud/data/badwords.json; changes apply
    immediately, no restart needed.

Devices without EmulatorJS (tablets, other people's computers):
  Type the address of the computer running EmulatorJS into the browser (shown in the left sidebar,
  e.g. http://192.168.1.23:8765) to see all of that computer's games and join them — no ROMs needed.
  These devices can't see or change that computer's folder settings.
  Note: browsers don't allow the microphone on a page opened this way, so no voice chat
  (you can still hear others).

How it connects (chosen automatically, nothing to set):
  · Input sync (experimental, preferred): the person joining runs the same game on their own computer
    too, and only the buttons pressed each frame go over the network — the same idea as RetroArch's
    netplay. Each computer draws its own picture, so it's sharp and uses almost no bandwidth.
    Joining from "another computer" uses the same game file on your own computer; a page opened via
    the LAN address reads the game file from the hosting computer automatically, so you don't need the ROM.
    To give inputs time to arrive, everyone's buttons take effect a few frames later
    (about 2–3 frames on a LAN — hardly noticeable).
    Every 2 seconds the game state is compared; if it ever differs, the host sends everyone a save
    state to re-align. The picture may flicker or jump briefly — that's normal.
  · Video streaming: the hosting computer streams picture and sound live, and the joiner's buttons
    are sent back. Used automatically when the joiner doesn't have the same game file.
  The host is P1; people who join become P2, P3, P4 — up to 4 players (if the game supports them).
  How many can play depends on the platform: 2 for NES, PS1, Neo Geo etc.; 4 for SNES, Mega Drive, N64, other arcade
  games and PC Engine; 1 for handhelds (GB / GBA / NDS / PSP etc.). When it's full you can still watch.
  "2/2 players · 👀 1" under "Now playing" means 2 players now / at most 2, and 1 person watching.
  Joiners use their own keyboard or controller with the same keys as single player.
  Latency on a LAN is very low, but weak Wi-Fi causes stutter; ideally the host uses a network cable.

With input sync, note:
  · The host presses Right Shift to pause everyone; joiners can't pause.
  · Only the host can reset the game (Select+Start+L1+R1) or load a save; after that, everyone is
    synced automatically.
  · Each player's delay to the host is shown next to their name (green = fast, yellow = OK, red = slow; "Relayed" when it
    goes through the server). Everyone in the game can see it. If someone stays red and slows everyone down, the host
    can send them away in "👥 Room".
  · The 📶 chip at the top shows the connection: direct or relayed, the round trip in ms, and how many frames
    buttons are delayed (adjusted automatically). If the numbers stay high, use a network cable or pause big
    downloads. Everyone should use the latest version.
  · Everyone has to stay on the game page. If one person switches to another window or minimizes,
    everyone gets stuck.
  · If someone's connection lags, everyone slows down and "Waiting for X’s connection…" appears at the top.
  · If "screens went out of sync" keeps appearing, the settings for this game (core options, e.g. Neo
    Geo home / arcade mode, difficulty) usually differ — make them the same.
  · Tested with NES and Mega Drive. Other systems should work too but haven't all been checked;
    problems are re-aligned automatically.

Two ways to play together: delay / rollback (button sync only; the host decides)
  Choose in "⚙ Folder settings" → "Netplay mode"; while playing you can also switch it in "👥 Room".
  · Delay mode (default, stable): the way described above. Everyone's buttons take effect a few frames
    later; everyone always sees the same picture, with no jumps even on a poor connection.
  · Rollback mode (responsive, experimental): your own buttons respond almost instantly (only 2 frames late).
    While the other player's buttons haven't arrived yet, the game assumes they are still holding what they
    held last; when the real buttons arrive and the guess was wrong, it loads a savestate from a few frames
    ago and replays those frames with the right buttons in a flash. So now and then you may see the other
    character "snap" to the right spot. Most online fighting games work this way.
    · Best when the network round trip is under 100 ms; slower than that the other player's moves will jump
      often, and delay mode is the better choice.
    · It saves an extra savestate every frame, so computers need to be fast enough: if one can't keep up,
      the game switches back to delay mode by itself and tells you.
    · Everyone needs the new version; if someone has an old one, that game uses delay mode.
    · If a game keeps going out of sync in rollback mode (3 times in a minute), it also switches back to delay mode.
    · You can't pause in rollback mode; 📶 at the top shows "Rollback". Replaying frames may occasionally
      cause a small sound glitch.

Phones and computers together (slow devices):
  With input sync everyone has to run frame by frame together, so the slowest device sets the speed.
  Phones run arcade games (Neo Geo etc.) slower than computers, so this happens automatically:
  · A phone joins a computer's game: the phone plays by watching the screen. The game runs on the
    computer, at the computer's speed. A D-pad and buttons appear on the phone's screen.
  · A computer joins a phone's game: the screens are aligned first, then the game is handed over to
    the computer and the phone keeps playing by watching the screen. There's a pause of a second or two.
    Player numbers stay the same (the phone is still P1, the computer still P2).
  · Arcade, PS1, N64 and similar games on phones and tablets always count as "slow"; other games are
    judged by the measured speed — the same applies to very old, slow computers.
  · When a phone plays an arcade game alone, auto frame-skip and a lower audio sample rate are on by
    default so it runs faster (it occasionally skips drawing a frame; game speed doesn't change).

If you don't want others to join:
  While playing, click the "Joining: on" button at the top to switch it to "off". Nobody else can get
  in, and the list shows "No joining" (people already in aren't affected).
  The default follows whatever you chose last.
  When someone clicks your game, they're told joining is off and can choose to play alone.

Managing your room (👥 Room):
  While playing, click "👥 Room" at the top to see the players and spectators in your room:
  · Allow spectators: on / off. Up to 8 spectators per game, at most 2 of them watching the video stream
    (for video spectators your computer encodes a separate video for each one, so many of them slow your game).
  · Registered players only: when on, people who aren't logged in can't join or watch
    (also on the LAN; needs the internet play server to be set up).
  · Send away: click twice (the second click confirms). That person can't come back into your rooms for
    30 minutes, recognised by account, device ID and network address (others on the same network may
    also be kept out during those 30 minutes).
  · ♡: give another player a like (they need an account).

Notes:
  · The host has to stay on the game page; switching windows or minimizing may freeze the picture.
  · When the host quits the game, the session ends and the joiners are told.
  · Saves are stored on the host's computer. Turbo: with input sync your own settings are used;
    with video streaming the host's settings are used.
  · LAN play only works on the same local network; for friends elsewhere see below.

[Voice chat]
  While playing together, click "🎤 Voice: off" at the top to switch it on and talk with the others
  (everyone can hear everyone).
  · The first time, the browser asks to use the microphone — choose "Allow". It's remembered: if you
    used voice before, it turns on automatically next time.
  · Turning voice off only stops others hearing you; you can still hear them.
  · When someone talks, a ring lights up around their name at the top.
  · Headphones are strongly recommended — otherwise the microphone picks up the game sound and the
    other voices and sends them back as an echo.
  · The microphone only works when EmulatorJS is opened on your own computer (address 127.0.0.1);
    browsers don't allow it on pages opened via a LAN address, e.g. on a tablet.

[Playing with friends elsewhere (internet play server)]
To play with friends who aren't on your network you need a "play server" everyone can reach
(for example a cloud server). It works just like the LAN: friends' games show up under "Now playing"
(marked "Internet"); click "Join". Voice chat works too.

Set up each computer (once):
  "⚙ Folder settings" → "Internet play server": enter the server address (e.g. http://1.2.3.4:8765)
  and the room password, click "Save and test", and you're done when it says "Connected".
  This is saved in config.json in the EmulatorJS folder: set it up first and then send the whole
  folder to your friends, and they won't need to enter it.
  Note: config.json contains the room password, so anyone who gets the folder can join your server — only send it
  to people you trust. If they shouldn't connect straight away, delete config.json before zipping the folder and
  let them enter the server address and room password themselves.

You can save several servers: enter another address and room password and click "Add and switch to it".
Each server is one lobby; switch with "🌐 Lobby: …" under "Now playing" on the left. Each lobby shows the
flag of the server's country / region, its rooms and how many people are online. Accounts, friends and
stats are separate on every server, so register or sign in again on the other lobby.
If the address can't be reached or the room password is wrong, you're told straight away and the server
isn't added. To change a server's room password, click 🔑 next to it, enter the new password and click
"Save password and switch here".

Notes:
  · Internet games show the flag of the country / region the host's network is in (a rough guess from
    the IP address), a hint for the delay to expect.
  · If you don't have the game, "Join" lets you ask the host to download it: the host picks "Allow",
    "Don't allow" or "Always allow". The game, its 3 preview pictures and any BIOS you're missing come
    straight from the host's computer (not through the server), are saved in the matching folders on
    your computer, and then you join automatically.
  · Can't connect or the line drops: if joining hasn't connected after 20 seconds you leave with a message;
    if the line drops for 15 seconds during a game, the joiner leaves and the host carries on alone.
    A VPN on either side often makes connecting fail or the delay very high.
  · Joining over the internet uses the same game file on your own computer (input sync), so
    everyone needs the same ROMs (no problem if you all use the same EmulatorJS package).
    Someone without the game plays by watching the video, which uses more server bandwidth.
  · The farther apart you are, the more frames inputs are delayed (adjusted automatically after
    measuring the connection); fighting games may feel slightly sticky.
  · Anyone with the password can see all games on the server; to keep people out, turn joining off.

Setting up the play server (once, done by whoever has the cloud server):
  You need a cloud server running Ubuntu 22.04 / 24.04 (the cheapest small instance is enough).
  1. In the cloud console's "Firewall", open: TCP 8765, TCP 80, TCP 3478, UDP 3478, UDP 49160-49250.
     (TCP 80 is used to get a free https certificate so passwords etc. are encrypted;
      the certificate renews itself every 3 days.)
  2. Open the web terminal with the console's "Log in" and upload "cloud-server/ejs-cloud-setup.sh"
     from the folder to the server.
  3. In the terminal run: sudo bash ejs-cloud-setup.sh
     To choose your own password: sudo bash ejs-cloud-setup.sh yourpassword (letters and digits only)
     If you have a domain (first point it to the server's IP with an A record): sudo bash ejs-cloud-setup.sh yourdomain
     e.g. sudo bash ejs-cloud-setup.sh example.site. The address then becomes https://yourdomain:8765;
     the old IP address keeps working, and each computer switches to the domain by itself once it connects
     (if the server's IP ever changes, you only need to update the domain's A record).
  4. When it finishes it shows the server address (starting with https://) and the room password —
     enter them in the settings above.
     An older http address doesn't need changing: EmulatorJS switches to https by itself, and the
     settings show "🔒 Secure connection".
  The server starts by itself after a reboot.
  Updating the server: after updating EmulatorJS, upload the new "cloud-server/ejs-cloud-setup.sh"
  again (replacing the old one) and run sudo bash ejs-cloud-setup.sh. The password stays the same;
  people playing get disconnected briefly and just join again.
  (Note: this replaces the blocked-words file on the server with the new one; words you added on
  the server must be added again.)
  Managing accounts: in the server's terminal run sudo ejs-admin and pick a number from the menu:
    list / find users, reset a password, rename, ban / unban, delete an account, list / delete match results.
    Menu 10 "Server limits" sets the server's limits: most people online, most rooms, and the relay speed limit.
    Menu 11 "Developer (admin) account" makes the admin-only account 开发者 or Developer: players can't register
    or pretend to have names containing those words; log in with it and your name is highlighted with
    colours and 🛠 in the lobby, rooms and leaderboards.
  (A banned user can't log in and is logged out right away; deleting an account also deletes its friends
   and match results and can't be undone.)

[Lobby]
  Click "⤢ Lobby" next to "Now playing" on the left (on a phone, tap 🕹 at the top right) to open the
  full-screen lobby:
  · "Now playing": every game being played on the LAN and the internet. Search by game or player name,
    and filter by "Open to join / Arena / Fighting / Friends / LAN / Internet". You can "Join" or
    "👀 Watch" any game (spectators can only watch, not control).
    Every game has a label: green "LAN" means it's on the same Wi-Fi / router, blue "🌐 Internet" means it's on
    the internet play server. A game you can see both ways is only listed once, as LAN (faster and steadier).
  · "🌐 Players online": everyone on the internet play server right now (anyone with EmulatorJS open and this server set),
    with flag, name, whether they're registered, and what they're playing or that they're in the lobby; you can "Join"
    or "👀 Watch" their game straight from here. The "🌐 Lobby" button shows e.g. "37/200 online" (people now / the
    server's limit). Older servers can't show this: the server's owner runs the setup script once more to update.
  · "Friends", "Leaderboard", "My stats": you need to log in first (see below).

[Accounts, friends, stats] (needs the internet play server)
  You can play, also online, without signing up; an account adds stats and friends.
  · Sign up: click "Sign up" at the top right of the lobby, enter a name (2–16 characters, no
    offensive words) and a password (at least 6 characters), and choose your region.
    Accounts are stored on the internet play server, so you can log in from other computers too.
    When logged in, online games use your account name and region (shown as a flag).
  · Friends: under "Friends", enter the other person's account name to send a request; once they
    accept, you're friends. You can see whether friends are online and what they're playing,
    and join or watch their game with one click.
  · Stats: what you played, for how long, how often online, and who you played with are recorded
    automatically.
  · Results: after an online match, click "🏆 Record result" at the top and choose the winner.
    The others get a request to confirm; it only counts once everyone clicks "Yes, confirm".
    If anyone clicks "That’s wrong", the record is discarded.
  · Champion: 10+ wins and a 60%+ win rate in a game make you that game's champion; your name
    shows in gold with 👑 in the lobby.
  · Likes: click ♡ in the lobby, your friends list, a player's stats or "👥 Room" in a game to like someone;
    click again to take it back. "♥ Most liked" on the Leaderboard ranks players by likes received.
  · Arena: in fighting games the host can click "🥊 Arena" at the top. The game is pinned to the top
    of the lobby with "challengers welcome", and anyone can come and challenge you.
  · Phones and tablets using a page opened via the LAN address can also log in and see internet
    games: their requests are forwarded by the hosting computer (that computer needs the internet
    play server set up).

[Interface language]
  Click the flag at the top left to switch the language: 简体中文, 繁體中文, English, 日本語, 한국어,
  Español, Français, Deutsch, Português, Русский. The default follows your system language.
  Game names show the English title, plus the title in the chosen language when there is one
  (most arcade games have Chinese names).
  The translations are in the data/i18n folder (data/names.json has the game names); you can edit them.

Other options:
  · Parsec (https://parsec.app) remote play: your friend connects to your computer, sees your screen,
    and their controller becomes a second controller on your computer. They need no ROMs and no EmulatorJS.
  · If you both have RetroArch, you can also use RetroArch's own netplay.


9. BIOS
-------
  NES, SNES, Mega Drive          Not needed
  Sega Mega-CD                   Required: bios_CD_U.bin (US), bios_CD_J.bin (Japan), bios_CD_E.bin (Europe)
  Arcade (FBNeo)                 Mostly not needed; Neo Geo games (KOF, Metal Slug, etc.) need neogeo.zip,
                                 PGM games need pgm.zip

  Without the BIOS, clicking a Sega CD game shows "BIOS missing".
  Once the BIOS folder is set, the top left shows something like "BIOS found: Sega Mega-CD (U/J)";
  the letters show which regions' BIOS you have.


10. Common problems
-------------------
  The game stays black after clicking it
    → Make sure the page was opened with the start file (the address bar shows http://127.0.0.1 or
      http://localhost), not by double-clicking index.html (address bar shows file://).

  Double-clicking EmulatorJS.command does nothing (Mac)
    → The "executable" permission may have been lost when copying. Open Terminal, type
         chmod +x
      (note the space at the end), drag EmulatorJS.command into the Terminal window, press Enter,
      then double-click it again.

  EmulatorJS.command doesn't show the gamepad icon on Mac
    → Double-clicking it once sets the icon. If it still doesn't change, close and reopen the Finder
      window (Finder doesn't always refresh right away). The icon file is data/icon.png — don't delete it.

  No "EmulatorJS" shortcut appears on Windows
    → Double-click EmulatorJS-Windows.bat once; the shortcut is created in the same folder.
      Check that data contains icon.ico and that start-windows.ps1 is next to the .bat.

  Some games won't start
    → Some games need a BIOS (see section 9); some arcade sets were made for other emulators and
      the web version of FBNeo can't run them — play those in RetroArch.

  Where are my settings, account and saves kept?
    → Account (name, friends, stats): on the internet play server, so you can log in from any computer or phone;
      only a scrambled form of the password is stored.
      Settings (folders, internet play server address and room password): in each device's own config.json —
        Folder version (.command / .bat): config.json in the EmulatorJS folder
        Windows desktop app: %APPDATA%\EmulatorJS\config.json
        Mac desktop app: ~/Library/Application Support/EmulatorJS/config.json
        Android app: in the app's own data (removed when you uninstall the app or clear its data)
      Login, player name, language, color theme, background picture, recently played, game saves and save states:
      in the browser (the desktop and Android apps keep them in their own data). Each device keeps its own; nothing
      is uploaded to the server. They're lost if you switch browsers, clear browser data or uninstall the app;
      back up saves with "Export Save File" in the menu bar below the game.


11. Copyright
-------------
EmulatorJS is open-source software (GPL-3.0, see the LICENSE file). You may share it for free, but not
use it commercially (the arcade core FBNeo forbids commercial use).
Project page: https://github.com/EmulatorJS/EmulatorJS

Other material used by this tool:
  - Console pictures: RetroArch "Systematic" theme (libretro/retroarch-assets, by baxysquare and others),
    licensed CC BY 4.0; license in data/consoles/LICENSE-CC-BY-4.0.txt.
    https://github.com/libretro/retroarch-assets
  - On-screen controller buttons on phones: libretro common-overlays (gamepads/nes, snes, genesis, psx, arcade, gba,
    gameboy), licensed CC BY 4.0; details and licence in data/vpad/README.txt.
    https://github.com/libretro/common-overlays
  - Pixel title font: Press Start 2P (by CodeMan38), SIL Open Font License 1.1;
    license in data/fonts/LICENSE-OFL-1.1.txt.
  - Flags: flag-icons (MIT license); license in data/flags/LICENSE-flag-icons-MIT.txt.
  - Arcade game Chinese names: gamelistxml_Chinese_project (BSD-2-Clause); license in data/LICENSE-gamelistxml-BSD-2.txt.
  - Color themes partly based on media.io game palettes (CRT Glow Arcade, Cartridge Desert, etc.) and
    classic console colors (Game Boy screen green, SNES grey and purple, etc.), adjusted for readable text.
