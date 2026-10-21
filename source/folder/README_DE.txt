EmulatorJS – Anleitung
================================

Mit EmulatorJS spielst du Retro-Spiele im Webbrowser. RetroArch muss nicht installiert sein,
und eine Internetverbindung brauchst du auch nicht.
Unterstützt werden über zwanzig Plattformen, darunter NES, Super Nintendo, Game Boy / GBA, N64, NDS,
Sega Mega Drive / Mega-CD / 32X / Saturn, PS1, PSP, PC Engine und Arcade (FBNeo / MAME 2003).


1. Was im Ordner ist
--------------------
  index.html              Die Spielseite (nicht per Doppelklick öffnen)
  data/                   Emulatoren und Cores – hier nichts ändern
  EmulatorJS.command      Startdatei für den Mac
  EmulatorJS-Windows.bat  Startdatei für Windows
  start-windows.ps1       Skript für die Windows-Startdatei; neben der .bat lassen
  Enable-LAN-Windows.bat  Windows-Freigabe für das LAN-Spiel (erscheint beim ersten Start automatisch;
                          nur selbst doppelklicken, wenn du damals „Nein“ gewählt hast)
  cloud-server/           Installationsskript für einen Internet-Spielserver (nur auf einem Cloud-Server, siehe Abschnitt 8)
  server.py               Der kleine lokale Server, den die Mac-Startdatei verwendet
  config.json             Entsteht beim ersten Speichern der Ordner; merkt sich deine Ordner
  EmulatorJS.lnk          Verknüpfung mit Gamepad-Symbol, die Windows beim ersten Start anlegt
  LICENSE                 Open-Source-Lizenz von EmulatorJS (GPL-3.0)
  README_DE.txt usw.      Diese Anleitung, eine Datei pro Sprache: CN 简体中文, HK 繁體中文, US English, JP 日本語,
                          KR 한국어, ES Español, FR Français, DE Deutsch, BR Português, RU Русский


2. So öffnest du es
-------------------
[Desktop-App (empfohlen)]
  Wenn du keinen Browser und kein offenes Terminal-Fenster willst, nimm die Desktop-App: Doppelklick öffnet das
  Spielfenster; Fenster schließen beendet sie.
  · Windows: EmulatorJS-Setup-Version.exe installiert sie (Ordner frei wählbar; mit Startmenü- und Desktop-Verknüpfung);
    EmulatorJS-Version-win.zip braucht keine Installation: irgendwo entpacken und EmulatorJS.exe doppelklicken.
    Erscheint beim ersten Mal „Der Computer wurde durch Windows geschützt“: „Weitere Informationen“ →
    „Trotzdem ausführen“.
    Fragt Windows nach dem Netzwerkzugriff, „Private Netzwerke“ anhaken und „Zugriff zulassen“ (fürs LAN-Spiel).
  · Mac: …-mac-apple-silicon.dmg für M1 / M2 / M3 / M4, …-mac-intel.dmg für Intel-Chips.
    dmg öffnen und EmulatorJS in „Programme“ ziehen.
    Beim ersten Mal heißt es, der Entwickler könne nicht überprüft werden: Systemeinstellungen → Datenschutz &
    Sicherheit → „Dennoch öffnen“.
    Fragt die App nach Geräten im lokalen Netzwerk oder dem Mikrofon, „Erlauben“ wählen (fürs LAN-Spiel und
    den Sprachchat).
  · Spieleordner: roms, thumbnails und system in „Dokumente/EmulatorJS“ und an den üblichen RetroArch-Orten
    werden automatisch gefunden, oder du wählst sie unter „⚙ Ordner“. Beim ersten Start übernimmt die App die
    Einstellungen deines alten EmulatorJS-Ordners.
  · Die Einstellungen liegen im eigenen Datenordner der App. EmulatorJS.command / EmulatorJS-Windows.bat
    funktionieren weiter, und beide können zusammen spielen.
  · Die Einstellungsdatei config.json (Ordner, Adresse des Internet-Spielservers und Raum-Passwort) liegt hier:
    Windows: %APPDATA%\EmulatorJS\config.json (im Explorer %APPDATA%\EmulatorJS in die Adresszeile tippen, Enter)
    Mac: ~/Library/Application Support/EmulatorJS/config.json (im Finder Umschalt+Cmd+G drücken und den Pfad einfügen)

[Android-Handys / Tablets / Android TV (APK)]
  · Handys, Tablets, Fernseher und TV-Boxen: EmulatorJS-Version-android.apk.
    Android-Emulatoren auf dem PC (MuMu usw.): EmulatorJS-Version-android-x86_64.apk.
    Benötigt Android 7.0 oder neuer. Ist das „Android System WebView“ des Fernsehers zu alt, weist die App darauf hin.
  · Installieren: apk aufs Handy / den Fernseher kopieren (USB-Kabel, USB-Stick oder Messenger) und im Dateimanager antippen.
    Meldet Android, dass unbekannte Apps nicht installiert werden dürfen, erlaube es diesem Dateimanager und tippe die apk erneut an.
    Fernseher: apk auf einen USB-Stick kopieren, einstecken und mit dem Dateimanager des Fernsehers öffnen.
  · Beim ersten Start den Zugriff auf Fotos und Dateien (Speicher) erlauben, sonst kann die App deine Spiele nicht lesen.
    Danach legt die App „Gerätespeicher / EmulatorJS“ mit den Ordnern roms, thumbnails und system an.
  · Spiele hinzufügen: Handy per Kabel mit dem Computer verbinden (am Handy „Dateiübertragung“ wählen) und die Spiele nach
    EmulatorJS / roms kopieren, sortiert wie am Computer (Abschnitt 3); Cover nach thumbnails, BIOS nach system.
    Danach „↻ Neu laden“ tippen. Spiele können auch woanders liegen: Ordner unter „⚙ Ordner“ wählen, dort gibt es
    Schnellwahl-Knöpfe wie „Gerätespeicher“ und „Downloads“.
  · USB-Stick am Fernseher: Ein Ordner EmulatorJS oder RetroArch (mit roms usw.) ganz oben auf dem Stick wird automatisch gefunden,
    oder unter „⚙ Ordner“ auf „USB-Stick / Speicherkarte“ tippen. Nach dem Ändern des Inhalts „↻ Neu laden“ tippen.
    Android lässt Apps nicht auf USB-Sticks schreiben: Spiele, die beim Online-Spiel von anderen Spielern geladen werden,
    landen in „EmulatorJS / downloads“ und erscheinen zusammen mit denen vom Stick.
  · Steuerung:
    Handy: Bildschirmtasten oder ein Bluetooth- / USB-Controller.
    Fernseher: Spiel mit der Fernbedienung wählen (Pfeiltasten bewegen, OK öffnet, Zurück geht zurück), mit Controller spielen.
    Im Spiel öffnet Zurück auf Fernbedienung oder Handy (oder Select + Start am Controller halten) das Spielmenü:
    weiter, Spielstand speichern, Spielstand laden, zurücksetzen, Vollbild, Spiel beenden.
    In der Spieleliste zweimal Zurück drücken, um die App zu schließen.
  · Online-Spiel, Lobby und Konten funktionieren wie am Computer, und du kannst mit Computern zusammen spielen
    (im LAN dasselbe WLAN). Der Sprachchat fragt beim ersten Mal nach dem Mikrofon: „Zulassen“ wählen.
  · Günstige TV-Boxen sind langsam: NES, SNES, GBA und Mega Drive laufen flüssig; N64, PSP, NDS und Saturn können ruckeln.
  · Ein Controller (Xbox, PlayStation, 8BitDo…, per Bluetooth oder Kabel) wird sofort beim Verbinden zu Spieler 1;
    in den „Steuerungseinstellungen“ muss nichts ausgewählt werden.
  · Konsolen- und Arcade-Spiele nutzen standardmäßig den Filter „CRT easymode“ (wie ein alter Fernseher, mit Zeilen);
    ändern unter „Einstellungen → Shaders“ im Spiel.

[Mac]
  1. Doppelklicke auf EmulatorJS.command.
     Wenn beim ersten Mal steht, dass es „nicht geöffnet werden kann, da es von einem nicht verifizierten
     Entwickler stammt“: Rechtsklick → „Öffnen“ → nochmals „Öffnen“. Danach reicht ein Doppelklick.
  2. Ein Terminal-Fenster öffnet sich und der Browser zeigt automatisch die Spielseite.
     Wenn macOS die „Befehlszeilen-Entwicklertools“ installieren möchte, klicke auf „Installieren“ und
     doppelklicke danach erneut auf die Startdatei.
  3. Lass das Terminal-Fenster beim Spielen offen und schließe es erst, wenn du fertig bist.
  Die Startdatei bekommt automatisch ein Gamepad-Symbol. Geht das Symbol beim Kopieren verloren,
  einmal starten, dann ist es wieder da.

[Windows]
  1. Doppelklicke auf EmulatorJS-Windows.bat.
     Erscheint das blaue „Der Computer wurde durch Windows geschützt“: „Weitere Informationen“ → „Trotzdem ausführen“.
  2. Ein schwarzes Befehlsfenster öffnet sich und der Browser zeigt automatisch die Spielseite.
  3. Lass dieses Fenster beim Spielen offen und schließe es erst, wenn du fertig bist.
  Windows kann einer .bat-Datei kein Symbol geben. Nach dem ersten Start entsteht deshalb im Ordner eine
  Verknüpfung „EmulatorJS“ mit Symbol. Nutze ab dann diese – du kannst sie auch auf den Desktop ziehen.
  Wenn du den Ordner verschiebst, funktioniert die Verknüpfung nicht mehr; ein Doppelklick auf die .bat legt sie neu an.

Warum muss das Fenster offen bleiben?
  Darin läuft ein kleiner Webserver, den nur dieser Computer erreicht. Aus Sicherheitsgründen erlauben
  Browser einer per Doppelklick geöffneten Seite nicht, die Emulator-Dateien zu lesen – deshalb wird die
  Seite über diesen Server geöffnet. Schließt du das Fenster, stoppt der Server.

[Auf eine neue Version aktualisieren]
  · Beim Start (und danach alle 6 Stunden) sucht EmulatorJS nach einer neuen Version; gibt es eine, zeigt ein Hinweis die
    Neuerungen, und neben der Versionsnummer links erscheint „🆕 Neue Version“. Mit einem Klick auf die Versionsnummer
    suchst du jederzeit selbst. Während du spielst, erscheint nichts.
  · Installierte Windows-Version (mit EmulatorJS-Setup-<Version>.exe installiert): Klicke auf „Automatisch aktualisieren“.
    Der neue Installer wird geladen und auf Vollständigkeit geprüft; dann „Jetzt installieren“: EmulatorJS schließt sich,
    installiert die neue Version und öffnet sich von selbst wieder (etwa eine halbe Minute). Spiele, Einstellungen und
    Spielstände bleiben erhalten. Ist der Download sehr langsam (über etwa 5 Minuten) oder schlägt fehl, wird Baidu Netdisk angeboten.
  · Mac, Windows-Zip-Version, Ordner-Version, Android: Klicke auf „Neue Version herunterladen“ (oder Baidu Netdisk, am besten
    in China) und ersetze die alte Version wie beschrieben (Mac: neues EmulatorJS in „Programme“ ziehen und „Ersetzen“ wählen;
    Ordner-Version: die neuen Dateien über den alten Ordner kopieren).
  · Downloads: https://github.com/supwang/emulatorjs-releases/releases
    Baidu Netdisk: https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk (Code 6akk)
  · Eine Version nicht haben wollen? „Diese Version überspringen“. Beim Suchen werden nur die Versionsinfos der Downloadseite
    gelesen; es wird nichts hochgeladen.


3. Spieleordner (einmal einstellen)
-----------------------------------
Beim Öffnen liest die Seite automatisch drei Ordner, du musst sie also nicht jedes Mal auswählen:

  ROM-Ordner           Der Hauptordner mit deinen Spielen (Pflicht)
  Vorschaubild-Ordner  RetroArchs thumbnails-Ordner (optional, zeigt Spielcover)
  BIOS-Ordner          Ordner mit BIOS-Dateien (optional, nur manche Plattformen brauchen ihn, siehe Abschnitt 9)

[Automatische Suche] Nicht eingestellte Ordner werden in dieser Reihenfolge gesucht und sofort verwendet:
  1. Im EmulatorJS-Ordner (neben EmulatorJS.command und EmulatorJS-Windows.bat):
     die Ordner roms, thumbnails und system (der BIOS-Ordner darf auch bios heißen)
  2. Die Standardorte von RetroArch
     Mac: roms, thumbnails, system unter ~/Library/Application Support/RetroArch/
     Windows: %APPDATA%\RetroArch, oder roms, thumbnails, system in RetroArch-Win64, RetroArch,
              Games\RetroArch-Win64 usw. auf den Laufwerken C:/D:/E:/F:
  Nutzt dein RetroArch also den Standardort, kannst du gleich beim ersten Mal loslegen.
  Zum Weitergeben kannst du die Ordner roms, thumbnails und system auch direkt in den EmulatorJS-Ordner legen –
  dann reicht es, zu entpacken, zu öffnen und zu spielen.

[Manuell einstellen] Klicke oben links auf „⚙ Ordner“:
  1. Klicke bei jedem Eintrag auf „Durchsuchen …“, klicke dich zum Ordner durch und dann auf „Diesen Ordner wählen“.
     Oben gibt es Schnellzugriffe wie „Benutzerordner“, „Schreibtisch“ und „RetroArch“.
     Du kannst auch einen Ordnerpfad einfügen.
  2. Klicke auf „Speichern und Spiele laden“. Die Einstellungen landen in config.json und gelten ab jetzt immer.
  - Mit „Leeren“ und Speichern kehrst du zur automatischen Suche zurück.
  - Wird ein eingestellter Ordner nicht mehr gefunden (etwa auf einem anderen Computer), wird wieder automatisch
    gesucht und die Einstellungsseite weist darauf hin.

[Bilder automatisch laden]
  Für Spiele ohne Cover kann EmulatorJS Cover, Titelbilder und Screenshots aus der Sammlung der libretro-Community (libretro-thumbnails,
  dieselbe wie bei RetroArch) in deinen Bilderordner laden (ist keiner eingestellt, wird neben dem ROM-Ordner ein Ordner „thumbnails“ angelegt).
  · Beim ersten Mal, wenn Spiele ohne Cover gefunden werden, wirst du gefragt; sagst du ja, bekommen später hinzugefügte Spiele ihre Bilder auch.
  · Ein- und ausschalten unter „⚙ Ordner“ → „Bilder automatisch laden“, oder auf „⬇ Fehlende Bilder jetzt laden“ klicken.
  · Bilder werden über den Spielnamen gesucht (Arcade-Spiele über ihren vollen FBNeo-Namen); Standardnamen wie bei No-Intro
    funktionieren am besten, umbenannte oder übersetzte Dateinamen werden eventuell nicht gefunden.
  · Braucht Zugang zu GitHub. Der Fortschritt steht oben links, „Stopp“ jederzeit möglich. Die Sammlung stammt von der Community;
    die Bilder gehören den Spielefirmen.

[Nach dem Hinzufügen neuer Spiele] Klicke oben links auf „↻ Neu laden“ – die Seite muss nicht neu geöffnet werden.

[Wie neue Spiele Plattformen zugeordnet werden]
  Die Plattform jedes Spiels wird in dieser Reihenfolge bestimmt; der erste Schritt, der sie erkennt, zählt:
  1. Die in einer RetroArch-Playlist eingetragene Plattform (das Tool bringt eine Spieleliste mit)
  2. Eine früher gewählte Plattform (einmal unter „Plattform manuell wählen“ gewählt, wird sie gemerkt)
  3. Die Dateiendung: .nes .sfc .smc .md .gen .gba .gb .n64 .nds usw.
  4. Der Dateiinhalt:
     - Archive (.zip): was darin steckt – z. B. eine .sfc bedeutet Super Nintendo, eine .md Mega Drive
     - Disc- / Modul-Abbilder (.bin .iso .cue): die Kennung am Dateianfang, die Mega Drive, Mega-CD,
       Saturn, PS1 und mehr erkennt
  5. Der Name des Ordners: snes, md, fbneo, „Nintendo - Super Nintendo Entertainment System“ usw.
  6. Ein Archiv ohne bekanntes Modulformat → gilt als Arcade-Spiel
  7. Was dann noch unbekannt ist (z. B. .7z, .chd), kommt unter „Plattform manuell wählen“; einmal wählen genügt
  Arcade-Spiele werden außerdem mit der offiziellen FBNeo-Spieleliste (über 8000) verglichen: Steht der Dateiname
  nicht darauf (z. B. cvs2.zip von NAOMI), läuft das Spiel nicht in FBNeo und landet unter „In der Web-Version nicht unterstützt“.
  Selbst wenn alle möglichen Spiele in einem Ordner liegen, landen so die meisten auf der richtigen Plattform.
  Gelesen werden nur der Dateianfang und das Inhaltsverzeichnis der Archive – das geht schnell; die Ergebnisse
  werden gemerkt, beim nächsten Mal muss nichts neu erkannt werden.

Tipps:
  - Am besten ein Unterordner pro Plattform im ROM-Ordner, z. B. snes, md, nes, fbneo, oder Namen im
    RetroArch-Stil wie „Nintendo - Super Nintendo Entertainment System“ – so werden Plattformen automatisch erkannt.
  - Siehst du oben links drei Schaltflächen wie „ROM-Ordner wählen“ statt „⚙ Ordner“, wurde die Seite falsch oder
    über ein altes Startfenster geöffnet: Schließe alle Terminal- / Befehlsfenster und öffne sie neu über die Startdatei.


4. Spielen
----------
  1. Links steht die Plattformliste, jeweils mit einem Bild der Konsole. Neo-Geo-Spiele haben einen eigenen
     Eintrag „Neo Geo“; die übrigen Arcade-Spiele stehen unter „Arcade (FBNeo)“.
     Klicke auf eine Plattform, um rechts die Cover all ihrer Spiele zu sehen.
     „🕘 Zuletzt gespielt“ ganz oben zeigt die letzten 10 Spiele auf diesem Computer; anklicken und weiterspielen.
     Eintrag entfernen: Maus über das Cover und auf das ✕ in der Ecke klicken (Controller: auswählen und X; Tastatur: Entf).
     „Liste leeren“ entfernt alle.
     Fährst du mit der Maus über ein Spiel, wechseln seine Bilder: Cover → Titelbild → Screenshot. Die Punkte
     unter dem Cover zeigen, wie viele es gibt und welches du siehst; Maus weg, und das aktuelle Bild bleibt stehen.
     (Fehlende Bilder werden übersprungen; Spiele mit nur einem Bild wechseln nicht.)
     Covergröße: oben rechts an der Coverwand „S / M / L / XL“ wählen. Jede Plattform merkt sich ihre eigene Größe.
  2. Klicke auf ein Cover, um das Spiel zu starten.
  3. Mit „Spiel beenden“ oben rechts geht es zurück zur Coverwand.
  4. Über das Suchfeld findest du Spiele nach Namen.
  5. Ganz unten in der linken Seitenleiste listet „⌨ Tastenkürzel“ Tastatur- und Gamepad-Tasten für Münze,
     Start, Zurücksetzen, Pause, Dauerfeuer, Speichern / Laden und das Arcade-Servicemenü. Ein Klick auf den
     Titel klappt die Liste ein / aus; die Wahl wird gemerkt.
  6. Farbschema: Klicke oben links neben „EmulatorJS“ auf 🎨 und wähle eins von 7 Schemata
     (Kindheit [Standard: eine Spielhalle in der Abenddämmerung, mit Hintergrundbild], Nacht-Arcade [dunkel], Sega-Blau [kräftiges Blau], Game-Boy-Grün, SNES Grau & Lila [hell],
      Creme-Modul [hell], Bonbon-Rosa [hell]).
     Hintergrund, Text und Schaltflächen wechseln zusammen; deine Wahl wird gemerkt.
     Im selben Feld gibt es „Hintergrundbild“: Wähle ein Bild von deinem Computer, das hinter der Spieleliste rechts
     erscheint (es bleibt beim Scrollen stehen). Ein allgemeines Bild und/oder ein eigenes für jede Plattform
     (Plattformen ohne eigenes nutzen das allgemeine). Der Regler „Abdunkeln“ macht das Bild dunkler, damit der
     Text gut lesbar bleibt. Bilder werden nur in diesem Browser auf diesem Gerät gespeichert.
     Beim Spielen zeigt der freie Platz neben dem Spiel dasselbe Bild (abgedunkelt, unscharf), damit Hochkant-Spiele nicht
     von schwarzen Balken eingerahmt sind; im selben Feld abschaltbar.
  7. Sprache: Klicke oben links auf die Flagge (siehe „Sprache der Oberfläche“ in Abschnitt 8).

  - „Plattform manuell wählen“: Spiele, deren Plattform nicht erkannt wurde. Wähle eine aus, dann wandert
    das Spiel in diese Gruppe.
  - „In der Web-Version nicht unterstützt“: Spiele, die die Browser-Version nicht ausführen kann
    (z. B. Sega NAOMI). Diese bitte mit RetroArch spielen.
    Du willst diese Liste nicht sehen? Öffne sie und klicke oben rechts auf „Diese Liste ausblenden“, oder entferne den Haken unter „⚙ Ordner“.

Tasten, Spielstände, Save States, Vollbild usw. findest du in der Menüleiste unter dem Spiel.
„Control Settings“ zeigt und ändert die Tastaturbelegung und unterstützt auch Gamepads.
Spielstände liegen im Browser; sie gehen verloren, wenn du den Browser wechselst oder Browserdaten löschst.
Zum Sichern nutze „Export Save File“ im Menü.

Cheats: In der Menüleiste „Cheats“ → „Cheat hinzufügen“ (Add Cheat), Code und Beschreibung eingeben, abschicken und anhaken,
um ihn einzuschalten (nochmal zum Ausschalten). Das Code-Format hängt von der Plattform ab: Game Genie beim NES,
Action Replay / GameShark beim GBA usw.; im Internet nach „<Spielname> Cheats“ suchen. Manche Cheats wirken erst nach einem Neustart
des Spiels nicht mehr. Beim Online-Spiel mit anderen schalten sich Cheats automatisch ab und der Knopf wird ausgeblendet;
sobald du wieder allein spielst, sind sie zurück.

Cheat-Bibliothek: Oben im Menü „Cheats“ auf „📚 Aus der Cheat-Bibliothek wählen (libretro)“ klicken. Die Cheats dieses Spiels werden gesucht
(aus der Datenbank der libretro-Community, libretro-database: viel für NES, SNES, Mega Drive, GBA und andere Konsolen, fast nichts für
Arcade); gewünschte anhaken, „Ausgewählte Cheats hinzufügen“ klicken und unter „Cheats“ anhaken, um sie einzuschalten.
Beim Online-Spiel ebenfalls nicht verfügbar. Braucht Zugang zu GitHub.


5. Tastatur und Gamepad
-----------------------
[Standard-Tastaturbelegung] (Spieler 1)

  Richtungen          W oben   S unten   A links   D rechts
  Start               Enter
  Select / Münze      V

  NES                 J = A    K = B
  Super Nintendo      J = A    K = B    I = X    L = Y    U = Schultertaste L    O = Schultertaste R
  Mega Drive / CD     untere Reihe J K L = A B C        obere Reihe U I O = X Y Z
  Arcade Neo Geo (King of Fighters, Metal Slug, Samurai Shodown usw.)
                      J = A    K = B    I = C    L = D
                      U = A+B zusammen   O = C+D zusammen   (A+B+C und B+C+D haben standardmäßig keine Taste)
  Arcade (sonstige)   J K I L = Tasten 1 2 3 4    U O = Tasten 5 6
  Arcade (6-Tasten-Kampfspiele wie Street Fighter, Darkstalkers, Marvel)
                      Leichter Schlag J   Mittlerer Schlag K   Harter Schlag L
                      Leichter Tritt U    Mittlerer Tritt I    Harter Tritt O
                      (3 Schläge / 3 Tritte zusammen haben standardmäßig keine Taste)

  Pause / weiter      Shift rechts
  Dauerfeuer an/aus   T
  Spiel zurücksetzen  V + Enter + U + O gleichzeitig (Multi-Game-Module kehren zum Spielmenü zurück)
  Save State 1        State laden 2       Speicherplatz wechseln 3
  (Vorspulen, Zeitlupe und Zurückspulen haben standardmäßig keine Taste; in „Control Settings“ festlegen)

  - Arcade-Spiele wählen ihre Belegung anhand des ROM-Dateinamens. Die 6-Tasten-Belegung nutzen derzeit:
      Street Fighter (sf), Street Fighter II' Champion Edition (sf2ce), Street Fighter Alpha 3 (sfa3),
      Street Fighter III 3rd Strike (sfiii3), Street Fighter EX2 Plus (sfex2p),
      Darkstalkers (dstlk), Night Warriors (nwarr), Vampire Savior 2 (vsav2)
    Alle anderen Arcade-Spiele (auch Neo-Geo-Spiele wie KOF und Metal Slug) nutzen die Belegung J K I L.
    Neue Street-Fighter-, Darkstalkers- und Marvel-Spiele (X-Men, Marvel) werden ebenfalls als 6-Tasten erkannt.
  - Die Tasten änderst du unter „Control Settings“ in der Menüleiste unter dem Spiel.

[In „Control Settings“ angezeigte Tasten]
  Die Tasten tragen die Namen des Original-Controllers der jeweiligen Plattform, immer in dieser Reihenfolge:
    Münze / Select → Start → Richtungen → Tasten → Kombinationen → Save State, Vorspulen und weitere Funktionen

  NES                 Select, Start, Richtungen, A, B
  Super Nintendo      Select, Start, Richtungen, A, B, X, Y, L, R
  Mega Drive / CD     MODE, Start, Richtungen, A, B, C, X, Y, Z
  Arcade Neo Geo      Münze, Start, Richtungen, A, B, C, D
                      Kombinationen: A+B, C+D, A+B+C, B+C+D
  Arcade Kampfspiele  Münze, Start, Richtungen, leichter / mittlerer / harter Schlag, leichter / mittlerer / harter Tritt
                      Kombinationen: 3 Schläge zugleich, 3 Tritte zugleich
  Arcade (sonstige)   Münze, Start, Richtungen, Tasten 1–6

  - Eine Kombination ist eine Taste, die mehrere Tasten gleichzeitig drückt. Ein echtes Neo Geo hat nur
    A B C D; die Kombinationen sind ein Extra des Emulators, das Spezialattacken und Ausweichen erleichtert
    (z. B. A+B zum Ausweichen und C+D zum Wegschleudern in KOF).
  - Ob ein Arcade-Spiel als Neo Geo oder als 6-Tasten-Kampfspiel gilt, wird anhand des ROM-Dateinamens und
    des vollständigen Titels entschieden.
  - Einstellungen werden pro Spiel gespeichert: Tasten, Filter usw., die du in einem Spiel änderst, gelten nur
    dort und werden beim nächsten Mal wieder verwendet; andere Spiele behalten die Belegung oben.
  - Spielstände (auch Save States) werden getrennt von diesen Einstellungen gespeichert und beeinflussen sich nicht.
  - Die Gamepad-Tasten hängen nicht von der Tastaturbelegung oben ab – siehe [Gamepad] unten.

[Gamepad]
Gängige Controller funktionieren: Xbox, PS4 / PS5, Switch Pro und die meisten USB- / Bluetooth-Gamepads.

  1. Verbinde den Controller per USB oder Bluetooth mit dem Computer.
  2. Drücke im Spiel zuerst irgendeine Taste auf dem Controller – erst dann erkennt ihn der Browser
     (eine Datenschutzregel der Browser).
  3. Standardmäßig folgt die Belegung RetroArch (Xbox-Controller; links die Taste im Spiel):
       NES / SNES   B → A (unten)    A → B (rechts)   Y → X (links)   X → Y (oben)
       Mega Drive   A → X (links)    B → A (unten)    C → B (rechts)
       Neo Geo      A → A (unten)    B → B (rechts)   C → X (links)   D → Y (oben)
       Kampfspiele  Leichter Schlag → X (links)  Mittlerer Schlag → Y (oben)  Leichter Tritt → A (unten)  Mittlerer Tritt → B (rechts)
                    Harter Schlag → LB   Harter Tritt → RB
     (EmulatorJS vertauscht ab Werk A und B am Gamepad; dieses Tool richtet sich stattdessen nach RetroArch.)
     Stimmt eine Taste nicht, öffne „Control Settings“ in der Menüleiste unter dem Spiel und belege sie neu.
     Bis zu 4 Spieler, jeder mit eigenem Controller. Die Einstellungen werden im Browser gespeichert.

  - Empfohlen sind Chrome oder Edge – dort funktionieren Gamepads am besten.
  - Bei Arcade-Spielen sind Münze und Start meist Select / Ansicht und Start / Menü am Controller.
  - Spiel zurücksetzen: Select + Start + LB + RB gleichzeitig (bei PlayStation Share + Options + L1 + R1).
    Damit kommst du bei NES-Multi-Game-Modulen zurück ins Spielmenü. Funktioniert auf allen Plattformen.
  - Der linke Stick funktioniert wie das Steuerkreuz (über die Hälfte gedrückt zählt als gedrückt;
    Diagonalen gehen auch), und du kannst beides mischen.
  - Dauerfeuer an / aus: rechten Stick eindrücken (R3).
  - Spiele ohne Maus auswählen (Controller, Tastatur oder TV-Fernbedienung):
      Steuerkreuz / linker Stick / Pfeiltasten: zwischen Covern und Knöpfen wechseln; A / Enter: bestätigen (Spiel starten,
      Knopf drücken); B / Esc / Zurück auf der Fernbedienung: zurück oder offenes Feld schließen; LB / RB: vorige / nächste
      Plattform; Start: Lobby öffnen oder schließen.
  - Spielmenü: beim Spielen Select + Start eine halbe Sekunde halten (Zurück auf der TV-Fernbedienung) – weiterspielen,
    Spielstand speichern / laden, zurücksetzen, Vollbild oder beenden. Allein pausiert das Spiel, solange das Menü offen ist;
    online pausiert es nicht, und Mitspieler sehen Speichern, Laden und Zurücksetzen nicht.

[Dauerfeuer]
  1. Klicke im Spiel oben auf „Dauerfeuer“ und hake die Tasten an, die in diesem Spiel schnell feuern sollen.
     Beispiel Shooter: Schuss anhaken, Aufladetaste nicht – dann feuert gehaltener Schuss schnell, und die
     gehaltene Aufladetaste lädt ganz normal auf.
  2. Dauerfeuer einschalten: unter „Dauerfeuer“ auf „Dauerfeuer an“ klicken oder im Spiel T auf der Tastatur /
     R3 am Controller drücken. Solange es an ist, steht oben links im Spiel „TURBO AN“ und die Schaltfläche
     zeigt „Dauerfeuer · an“.
  3. Hake „Dauerfeuer beim Start dieses Spiels einschalten“ an, dann ist es beim nächsten Mal schon an – ohne T / R3.

  - Einstellungen werden pro Spiel gespeichert; jedes Spiel einmal einrichten genügt. Standardmäßig sind alle
    Tasten angehakt und das Dauerfeuer schaltet sich nicht von selbst ein.
  - Das Dauerfeuer feuert etwa 15-mal pro Sekunde. Richtungen, Start und Münze sind nicht betroffen.
  - Es funktioniert auf allen Plattformen, mit Tastatur und Gamepad.
  - Reagieren die Tasten nach dem Schließen von „Dauerfeuer“ nicht, klicke einmal ins Spielbild.


6. Arcade-Einstellungen: Servicemenü, Schwierigkeit, Leben, Neo-Geo-Modus
------------------------------------------------------------------------
Diese Einstellungen findest du in der Menüleiste unter dem Spiel: „Settings“ (Zahnrad) → „Backend Core Options“.
Nach einer Änderung in der Menüleiste auf „Restart“ klicken, damit sie wirkt. Sie werden pro Spiel gespeichert.

[Arcade-Servicemenü (Test Mode)]
  Halte im Spiel etwa 2 Sekunden Start (Enter), um das Servicemenü der Arcade-Platine zu öffnen.
  Dort stellst du Schwierigkeit, Leben, Zeit, Continues usw. ein (welche Optionen es gibt, hängt vom Spiel ab).
  Wie es geöffnet wird, änderst du unter „diagnostic input“ in den Core-Optionen, z. B. durch Halten von Select.

[Schwierigkeit, Leben (DIP-Schalter)]
  Viele Arcade-Spiele stellen Schwierigkeit und Leben über DIP-Schalter auf der Platine ein.
  Suche in den Core-Optionen nach Einträgen mit „Dipswitch“ im Namen, zum Beispiel:
    Difficulty (Schwierigkeit)   Lives (Leben)   Bonus Life (Extraleben)
  Jedes Spiel hat andere Schalter, manche gar keine.

[Mehrspieler-Modus (3 oder 4 Spieler)]
  - Captain Commando: Der Automat ist ab Werk auf 2 Spieler eingestellt; dieses Tool stellt standardmäßig 4 Spieler ein
    („Dipswitch Play Mode“ in den Core-Optionen – dort lässt es sich zurückstellen).
  - Knights of the Round, The King of Dragons, Mercs: ab Werk 3 Spieler, nichts zu ändern.
  - Warriors of Fate, Cadillacs & Dinosaurs und andere Q-Sound-CPS1-Spiele: Die Spielerzahl ist kein DIP-Schalter,
    sondern eine Einstellung im Service-Menü des Spiels. Kann kein dritter Spieler mitmachen, schau dort unter
    CONFIGURATION nach (Start etwa 2 Sekunden halten).
  - Beim Online-Spiel brauchen alle für dasselbe Spiel dieselben Einstellungen (sonst kommen „nicht synchron“-Meldungen),
    am besten nutzen alle die neueste Version.

[Neo Geo: Arcade- / Heimkonsolen-Modus]
  Dieses Tool startet Neo-Geo-Spiele (KOF, Metal Slug, Samurai Shodown usw.) standardmäßig im Arcade-Modus
  (MVS, Europa/Asien):
    - Wie in der Spielhalle: Mit V eine Münze einwerfen, mit Enter starten;
    - Während einer spielt, kann ein anderer jederzeit eine Münze einwerfen und Start drücken, um einzusteigen
      (online genauso);
    - Schwierigkeit, Leben usw. stellst du im Arcade-Servicemenü ein (siehe oben).
  Für den Heimkonsolen-Modus suche in den Core-Optionen nach „mode“ (Neo-Geo mode):
    MVS_EUR / MVS_USA / MVS_JAP  Arcade-Version (Europa-Asien / USA / Japan), mit Münzen   ← Standard MVS_EUR
    AES_EUR / AES_JAP            Heimversion (Englisch / Japanisch), ohne Münzen; Schwierigkeit und Leben unter
                                 Option im Titelbild
    DIPSWITCH                    Die Voreinstellung des Spiels (meist die Arcade-Version)
    UNIBIOS                      Von Fans erstelltes erweitertes BIOS (Cheats, Regionswechsel usw.)
  Das wird pro Spiel gemerkt: Ein Spiel im Heimmodus bleibt auch beim nächsten Mal im Heimmodus.
  Online müssen alle denselben Modus für dieses Spiel nutzen, sonst laufen die Bilder auseinander.
  Hinweis: neogeo.zip muss die passende BIOS-Datei enthalten (ein vollständiges FBNeo-neogeo.zip hat sie meist);
  fehlt sie, fällt das Spiel auf seinen Standardmodus zurück.


7. Filter (Bildeffekte)
-----------------------
Klicke im Spiel in der Menüleiste unten auf „Settings“ → „Graphics Settings“ → „Shaders“ und wähle einen aus –
der Effekt ist sofort zu sehen:

  CRT easymode       Alter Röhrenfernseher mit Scanlines, weiches Bild – gut zum Einstieg
  CRT geom           Röhrenlook mit gewölbtem Bildschirm und dunklen Ecken, am nächsten am alten Fernseher
  CRT aperture       Simuliert das Streifenmaskengitter, scharfes Bild
  CRT mattias        Simuliert die leichte Unschärfe und das Ausbluten der Farben eines TV-Signals
  2xScaleHQ          Rundet Pixelkanten ab und glättet sie
  4xScaleHQ          Ebenso, mit stärkerer Glättung
  Disabled           Kein Filter, Originalpixel

  - Filter werden pro Spiel gespeichert: Einmal gewählt, wird er beim nächsten Mal wieder verwendet;
    andere Spiele stellst du separat ein.
  - CRT-Filter sehen im Vollbild am besten aus; in einem kleinen Fenster wirken die Scanlines zu dicht.
  - Auf älteren Computern kann CRT geom ruckeln; CRT easymode läuft flüssiger.


8. Zusammen spielen
-------------------
[LAN-Spiel (Computer im selben WLAN / Router)]
Adressen musst du nicht verschicken: Jeder doppelklickt auf EmulatorJS.command (Mac) oder
EmulatorJS-Windows.bat (Windows). Im selben lokalen Netz zeigt „🕹 Gerade im Spiel“ links, wer auf den
anderen Computern was spielt – klicke auf „Mitspielen“, um einzusteigen.

  · Das LAN-Spiel ist standardmäßig an. Wer nicht gesehen werden will, klickt auf „⚙ Ordner“ und entfernt den
    Haken bei „LAN-Spiel“.
  · Mac: Beim ersten Mal fragt macOS eventuell, ob Python eingehende Netzwerkverbindungen annehmen darf – „Erlauben“ wählen.
  · Windows: Beim ersten Mal erscheint „Möchten Sie zulassen, dass durch diese App Änderungen an Ihrem Gerät
    vorgenommen werden?“ – „Ja“ wählen (wird nur einmal gefragt). Hast du „Nein“ gewählt, doppelklicke später
    im Ordner auf „Enable-LAN-Windows.bat“ und öffne EmulatorJS dann neu.
  · Nach „Mitspielen“ spielst du weiter auf deiner eigenen Seite, mit derselben Spieldatei auf deinem Computer.
    Hast du das Spiel nicht (oder ist deine Datei anders), spielst du automatisch über das Bild des anderen.
  · Mit „anderer Computer“ markierte Spiele wurden auf einem anderen Computer gestartet; die übrigen aus der
    Bibliothek dieses Computers.
  · Konsolenspiele funktionieren genauso: Siehst du das Spiel in der Liste, klicke auf „Mitspielen“.
  · Mit „Ich bin: …“ änderst du deinen Namen; den sehen die anderen in der Liste.
    Namen dürfen keine Beleidigungen oder andere anstößige Wörter enthalten und nicht mit dem Namen eines
    gerade Spielenden übereinstimmen (Groß-/Kleinschreibung, Leerzeichen und Symbole zählen nicht).
    Ein Name mit anstößigen Wörtern wird automatisch in „Spieler“ plus Nummer geändert.
    Die gesperrten Wörter stehen in data/badwords.json – mit einem Texteditor bearbeiten (ein Wort pro Eintrag).
    Auf dem Internet-Spielserver ist es /opt/emulatorjs-cloud/data/badwords.json; Änderungen gelten sofort,
    ohne Neustart.

Geräte ohne EmulatorJS (Tablets, fremde Computer):
  Gib im Browser die Adresse des Computers ein, auf dem EmulatorJS läuft (steht in der linken Seitenleiste,
  z. B. http://192.168.1.23:8765) – dann siehst du alle Spiele dieses Computers und kannst mitspielen, ohne ROMs.
  Diese Geräte können die Ordner-Einstellungen des Computers weder sehen noch ändern.
  Hinweis: Browser erlauben auf so geöffneten Seiten kein Mikrofon, also kein Sprachchat
  (die anderen hörst du trotzdem).

So wird verbunden (automatisch gewählt, nichts einzustellen):
  · Tastensynchronisierung (experimentell, bevorzugt): Wer mitspielt, lässt dasselbe Spiel auch auf dem eigenen
    Computer laufen; über das Netz gehen nur die pro Bild gedrückten Tasten – dasselbe Prinzip wie RetroArchs
    Netplay. Jeder Computer berechnet sein eigenes Bild, deshalb ist es scharf und braucht kaum Bandbreite.
    Beim Mitspielen auf einem „anderen Computer“ wird dieselbe Spieldatei auf deinem Computer genutzt; eine über
    die LAN-Adresse geöffnete Seite liest die Spieldatei automatisch vom Host-Computer, du brauchst also keine ROM.
    Damit die Tasten rechtzeitig ankommen, wirken die Tasten aller einige Bilder später
    (im LAN etwa 2–3 Bilder – kaum spürbar).
    Alle 2 Sekunden wird der Spielzustand verglichen; weicht er ab, schickt der Host allen einen Save State zum
    Neuausrichten. Das Bild kann kurz flackern oder springen – das ist normal.
  · Videoübertragung: Der Host-Computer überträgt Bild und Ton live, die Tasten des Mitspielers gehen zurück.
    Wird automatisch genutzt, wenn der Mitspieler nicht dieselbe Spieldatei hat.
  Der Host ist P1; wer mitspielt, wird P2, P3, P4 – bis zu 4 Spieler (wenn das Spiel es unterstützt).
  Wie viele mitspielen können, hängt von der Plattform ab: 2 bei NES, PS1, Neo Geo usw.; 4 bei SNES, Mega Drive, N64, anderen
  Arcade-Spielen und PC Engine; 1 bei Handhelds (GB / GBA / NDS / PSP usw.). Ist es voll, kannst du trotzdem zuschauen.
  „2/2 Spieler · 👀 1“ unter „Gerade im Spiel“ heißt: jetzt 2 Spieler / höchstens 2, dazu 1 Zuschauer.
  Mitspieler nutzen ihre eigene Tastatur oder ihren Controller mit derselben Belegung wie im Einzelspiel.
  Im LAN ist die Verzögerung sehr gering, schwaches WLAN führt aber zu Rucklern; der Host am besten per Kabel.

Bei der Tastensynchronisierung beachten:
  · Der Host pausiert mit Shift rechts für alle; Mitspieler können nicht pausieren.
  · Nur der Host kann das Spiel zurücksetzen (Select+Start+L1+R1) oder einen Stand laden; danach werden alle
    automatisch synchronisiert.
  · Neben jedem Namen steht die Verzögerung zum Host (grün = schnell, gelb = okay, rot = langsam; „Über Relay“, wenn es über den
    Server läuft). Alle Spieler sehen das. Bleibt jemand rot und bremst alle aus, kann der Host ihn unter „👥 Raum“
    hinausbitten.
  · Das 📶 oben zeigt die Verbindung: direkt oder über Relay, die Antwortzeit in ms und um wie viele Bilder
    Tasten verzögert werden (passt sich automatisch an). Bleiben die Zahlen hoch, ein Netzwerkkabel nutzen oder
    große Downloads pausieren. Alle sollten die neueste Version nutzen.
  · Alle müssen auf der Spielseite bleiben. Wechselt einer das Fenster oder minimiert es, hängen alle fest.
  · Hakt die Verbindung von jemandem, werden alle langsamer und oben erscheint „Warte auf die Verbindung von X …“.
  · Laufen die Bilder immer wieder auseinander, unterscheiden sich meist die Einstellungen dieses Spiels
    (Core-Optionen, z. B. Neo-Geo Heim-/Arcade-Modus, Schwierigkeit) – gleich einstellen.
  · Getestet mit NES und Mega Drive. Andere Systeme sollten auch gehen, sind aber nicht alle geprüft;
    Probleme werden automatisch korrigiert.

Zwei Arten zusammen zu spielen: Verzögerung / Rollback (nur bei Tasten-Sync; der Host entscheidet)
  Auswahl unter „⚙ Ordner“ → „Netzwerk-Modus“; beim Spielen auch unter „👥 Raum“ umschaltbar.
  · Verzögerungsmodus (Standard, stabil): wie oben beschrieben. Die Tasten aller wirken ein paar Frames später;
    alle sehen immer dasselbe Bild, auch bei schlechter Verbindung ohne Sprünge.
  · Rollback-Modus (direkt, experimentell): deine eigenen Tasten wirken fast sofort (nur 2 Frames später).
    Solange die Tasten der anderen noch nicht da sind, nimmt das Spiel an, dass sie weiter dasselbe drücken;
    kommen die echten Tasten an und die Annahme war falsch, lädt es einen Spielstand von vor ein paar Frames
    und spielt diese Frames blitzschnell mit den richtigen Tasten neu. Deshalb sieht man ab und zu die Figur
    des anderen an die richtige Stelle „springen“. Die meisten Online-Prügelspiele arbeiten so.
    · Am besten bei unter 100 ms Netzwerk-Laufzeit hin und zurück; bei mehr springen die Bewegungen der
      anderen oft, dann ist der Verzögerungsmodus besser.
    · Es wird jeden Frame zusätzlich ein Spielstand gespeichert, die Computer müssen also schnell genug sein:
      schafft es einer nicht, wechselt die Runde von selbst zurück auf Verzögerung und sagt Bescheid.
    · Alle brauchen die neue Version; hat jemand eine alte, nutzt die Runde den Verzögerungsmodus.
    · Läuft ein Spiel im Rollback-Modus immer wieder auseinander (3-mal in einer Minute), wechselt die Runde
      ebenfalls zurück auf Verzögerung.
    · Im Rollback-Modus gibt es keine Pause; 📶 oben zeigt „Rollback“. Beim Neuspielen von Frames kann
      gelegentlich der Ton kurz knacken.

Handys und Computer zusammen (langsame Geräte):
  Bei der Tastensynchronisierung laufen alle Bild für Bild gemeinsam, also bestimmt das langsamste Gerät das
  Tempo. Handys spielen Arcade-Spiele (Neo Geo usw.) langsamer als Computer, deshalb passiert automatisch Folgendes:
  · Ein Handy steigt in das Spiel eines Computers ein: Das Handy spielt über das übertragene Bild. Das Spiel
    läuft auf dem Computer, in dessen Tempo. Auf dem Handy erscheinen Steuerkreuz und Tasten.
  · Ein Computer steigt in das Spiel eines Handys ein: Zuerst werden die Bilder abgeglichen, dann wird das Spiel
    an den Computer übergeben und das Handy spielt über das Bild weiter. Dabei gibt es ein bis zwei Sekunden Pause.
    Die Spielernummern bleiben gleich (das Handy bleibt P1, der Computer P2).
  · Arcade-, PS1-, N64- und ähnliche Spiele auf Handys und Tablets gelten immer als „langsam“; andere Spiele
    werden nach der gemessenen Geschwindigkeit beurteilt – das gilt auch für sehr alte, langsame Computer.
  · Spielt ein Handy allein ein Arcade-Spiel, sind automatisches Frameskip und eine niedrigere Audio-Abtastrate
    standardmäßig an, damit es schneller läuft (gelegentlich wird ein Bild nicht gezeichnet; das Spieltempo bleibt gleich).

Wenn niemand mitspielen soll:
  Klicke im Spiel oben auf die Schaltfläche „Beitritt: an“, um auf „aus“ zu schalten. Dann kommt niemand mehr
  hinein und die Liste zeigt „Kein Beitritt“ (wer schon drin ist, bleibt).
  Die Voreinstellung entspricht deiner letzten Wahl.
  Klickt jemand auf dein Spiel, erfährt er, dass der Beitritt aus ist, und kann allein spielen.

Deinen Raum verwalten (👥 Raum):
  Klicke im Spiel oben auf „👥 Raum“, um die Spieler und Zuschauer in deinem Raum zu sehen:
  · Zuschauer erlauben: an / aus. Bis zu 8 Zuschauer pro Spiel, davon höchstens 2 per Videobild
    (für jeden Video-Zuschauer komprimiert dein Computer ein eigenes Video; viele davon bremsen dein Spiel).
  · Nur registrierte Spieler: Wenn an, kann niemand ohne Anmeldung mitspielen oder zuschauen
    (auch im LAN; dafür muss der Internet-Spielserver eingerichtet sein).
  · Hinauswerfen: zweimal klicken (der zweite Klick bestätigt). Die Person kann 30 Minuten lang nicht in deine
    Räume; erkannt wird sie an Konto, Gerätenummer und Netzwerkadresse (andere im selben Netz können in diesen
    30 Minuten ebenfalls draußen bleiben).
  · ♡: einem anderen Spieler ein Like geben (er braucht ein Konto).

Hinweise:
  · Der Host muss auf der Spielseite bleiben; Fensterwechsel oder Minimieren kann das Bild einfrieren.
  · Beendet der Host das Spiel, endet die Runde und die Mitspieler werden informiert.
  · Spielstände werden auf dem Host-Computer gespeichert. Dauerfeuer: Bei der Tastensynchronisierung gelten deine
    Einstellungen, bei der Videoübertragung die des Hosts.
  · Das LAN-Spiel funktioniert nur im selben lokalen Netz; für Freunde woanders siehe unten.

[Sprachchat]
  Beim gemeinsamen Spielen oben auf „🎤 Sprache: aus“ klicken, um einzuschalten und mit den anderen zu reden
  (alle hören alle).
  · Beim ersten Mal fragt der Browser nach dem Mikrofon – „Erlauben“ wählen. Das wird gemerkt: Hattest du die
    Sprache schon einmal an, geht sie beim nächsten Mal von selbst an.
  · Ausschalten verhindert nur, dass andere dich hören; du hörst sie weiterhin.
  · Spricht jemand, leuchtet oben ein Ring um seinen Namen.
  · Kopfhörer werden dringend empfohlen – sonst nimmt das Mikrofon Spielton und die anderen Stimmen auf und
    schickt sie als Echo zurück.
  · Das Mikrofon funktioniert nur, wenn EmulatorJS auf deinem eigenen Computer geöffnet ist (Adresse 127.0.0.1);
    auf über eine LAN-Adresse geöffneten Seiten, z. B. auf einem Tablet, erlauben Browser es nicht.

[Mit Freunden woanders spielen (Internet-Spielserver)]
Um mit Freunden außerhalb deines Netzes zu spielen, braucht ihr einen „Spielserver“, den alle erreichen
(z. B. einen Cloud-Server). Es funktioniert wie im LAN: Die Spiele deiner Freunde erscheinen unter
„Gerade im Spiel“ (markiert mit „Internet“); klicke auf „Mitspielen“. Sprachchat geht auch.

Jeden Computer einrichten (einmal):
  „⚙ Ordner“ → „Internet-Spielserver“: Serveradresse (z. B. http://1.2.3.4:8765) und Raum-Passwort eingeben,
  „Speichern und testen“ klicken – fertig, sobald „Verbunden“ angezeigt wird.
  Das wird in config.json im EmulatorJS-Ordner gespeichert: Richte es zuerst ein und schicke dann den ganzen
  Ordner an deine Freunde – sie müssen nichts eingeben.
  Achtung: In config.json steht das Raum-Passwort – wer den Ordner bekommt, kann auf deinen Server. Schick ihn nur
  an Leute, denen du vertraust. Sollen sie sich nicht gleich verbinden können, lösche config.json vor dem Packen;
  dann tragen sie Serveradresse und Raum-Passwort selbst ein.

Du kannst mehrere Server speichern: weitere Adresse und Raumpasswort eingeben und „Hinzufügen und wechseln“.
Jeder Server ist eine Lobby; gewechselt wird mit „🌐 Lobby: …“ unter „Gerade im Spiel“ links. Jede Lobby zeigt
die Flagge des Landes / der Region des Servers, ihre Räume und wie viele online sind. Konten, Freunde und
Statistik gelten pro Server – in einer anderen Lobby neu registrieren oder anmelden.
Ist die Adresse nicht erreichbar oder das Raum-Passwort falsch, siehst du das sofort, und der Server wird nicht
hinzugefügt. Um das Raum-Passwort eines Servers zu ändern, klicke daneben auf 🔑, gib das neue Passwort ein und
klicke auf „Passwort speichern und hierher wechseln“.

Hinweise:
  · Internetspiele zeigen die Flagge des Landes / der Region, in der das Netz des Hosts ist (grob nach IP
    geschätzt) – ein Hinweis auf die zu erwartende Verzögerung.
  · Wer das Spiel nicht hat, kann beim „Beitreten“ den Host um einen Download bitten: Der Host wählt
    „Erlauben“, „Nicht erlauben“ oder „Immer erlauben“. Spiel, 3 Vorschaubilder und fehlende BIOS-Dateien kommen direkt vom Computer des Hosts (nicht
    über den Server), landen im passenden System-Ordner deines ROM-Ordners, und du trittst automatisch bei.
  · Keine Verbindung oder Abbruch: Steht die Verbindung 20 Sekunden nach dem Beitreten nicht, verlässt du
    das Spiel mit einem Hinweis; reißt sie im Spiel 15 Sekunden ab, verlässt der Beigetretene das Spiel und
    der Host spielt weiter. Ein VPN auf einer Seite verhindert oft die Verbindung oder treibt die Verzögerung hoch.
  · Auch übers Internet wird dieselbe Spieldatei auf deinem Computer genutzt (Tastensynchronisierung), deshalb
    brauchen alle dieselben ROMs (kein Problem mit demselben EmulatorJS-Paket).
    Wer das Spiel nicht hat, spielt über das Video – das braucht mehr Server-Bandbreite.
  · Je weiter ihr auseinander seid, desto mehr Bilder werden die Tasten verzögert (wird nach Messung der Verbindung
    automatisch angepasst); Kampfspiele fühlen sich dann etwas träge an.
  · Wer das Passwort hat, sieht alle Spiele auf dem Server; um niemanden hereinzulassen, schalte den Beitritt aus.

Den Spielserver einrichten (einmal, durch die Person mit dem Cloud-Server):
  Du brauchst einen Cloud-Server mit Ubuntu 22.04 / 24.04 (die kleinste, günstigste Instanz reicht).
  1. In der „Firewall“ der Cloud-Konsole freigeben: TCP 8765, TCP 80, TCP 3478, UDP 3478, UDP 49160-49250.
     (TCP 80 dient zum Holen eines kostenlosen https-Zertifikats, damit Passwörter usw. verschlüsselt sind;
      das Zertifikat erneuert sich alle 3 Tage selbst.)
  2. Über „Anmelden“ in der Konsole das Web-Terminal öffnen und „cloud-server/ejs-cloud-setup.sh“ aus dem Ordner
     auf den Server hochladen.
  3. Im Terminal ausführen: sudo bash ejs-cloud-setup.sh
     Eigenes Passwort festlegen: sudo bash ejs-cloud-setup.sh deinpasswort (nur Buchstaben und Ziffern)
     Mit eigener Domain (zuerst per A-Eintrag auf die IP des Servers zeigen lassen): sudo bash ejs-cloud-setup.sh deinedomain
     z. B. sudo bash ejs-cloud-setup.sh example.site. Die Adresse lautet dann https://deinedomain:8765;
     die alte IP-Adresse funktioniert weiter, und jeder Computer wechselt beim Verbinden von selbst zur Domain
     (ändert sich einmal die IP des Servers, genügt es, den A-Eintrag der Domain anzupassen).
  4. Zum Schluss werden die Serveradresse (beginnt mit https://) und das Raum-Passwort angezeigt – trage sie
     oben in den Einstellungen ein.
     Eine ältere http-Adresse musst du nicht ändern: EmulatorJS wechselt selbst auf https, und die Einstellungen
     zeigen „🔒 Verschlüsselte Verbindung“.
  Der Server startet nach einem Neustart von selbst.
  Server aktualisieren: Nach einem EmulatorJS-Update die neue „cloud-server/ejs-cloud-setup.sh“ erneut hochladen
  (die alte ersetzen) und sudo bash ejs-cloud-setup.sh ausführen. Das Passwort bleibt; wer gerade spielt, wird
  kurz getrennt und steigt einfach wieder ein.
  (Hinweis: Dabei wird die Datei mit den gesperrten Wörtern auf dem Server durch die neue ersetzt; selbst
  ergänzte Wörter musst du erneut hinzufügen.)
  Konten verwalten: Im Terminal des Servers sudo ejs-admin ausführen und im (englischen) Menü eine Zahl wählen:
    Benutzer anzeigen / suchen, Passwort zurücksetzen, umbenennen, sperren / entsperren, Konto löschen,
    Ergebnisse anzeigen / löschen.
    Menü 10 „Server limits“ legt die Grenzen des Servers fest: Leute online, Räume und Relay-Geschwindigkeit.
    Menü 11 „Developer (admin) account“ legt das Admin-Konto 开发者 oder Developer an: Namen mit diesen Wörtern
    kann kein Spieler registrieren oder vortäuschen; mit diesem Konto angemeldet, wird dein Name in Lobby,
    Räumen und Bestenlisten farbig mit 🛠 hervorgehoben.
  (Gesperrte Benutzer können sich nicht anmelden und werden sofort abgemeldet; beim Löschen eines Kontos werden auch
   Freunde und Ergebnisse gelöscht – das lässt sich nicht rückgängig machen.)

[Lobby]
  Klicke links neben „Gerade im Spiel“ auf „⤢ Lobby“ (am Handy oben rechts auf 🕹), um die Lobby im Vollbild zu öffnen:
  · „Gerade im Spiel“: alle laufenden Spiele im LAN und im Internet. Suche nach Spiel- oder Spielername und
    filtere nach „Offen / Herausforderung / Kampfspiel / Freunde / LAN / Internet“. Bei jedem Spiel kannst du
    „Mitspielen“ oder „👀 Zuschauen“ (Zuschauer sehen nur zu und steuern nicht).
    Jedes Spiel hat ein Etikett: grün „LAN“ heißt im selben WLAN / Router, blau „🌐 Internet“ heißt auf dem
    Internet-Spielserver. Ein Spiel, das auf beiden Wegen zu sehen ist, steht nur einmal da, als LAN (schneller).
  · „🌐 Spieler online“: alle, die gerade auf dem Internet-Spielserver sind (EmulatorJS offen und dieser Server eingestellt),
    mit Flagge, Name, ob registriert, und was sie spielen oder ob sie in der Lobby sind; „Mitspielen“ oder „👀 Zuschauen“
    geht direkt von hier. Der Knopf „🌐 Lobby“ zeigt z. B. „37/200 online“ (Leute jetzt / Grenze des Servers). Ältere Server
    zeigen das nicht: Der Betreiber führt das Installationsskript noch einmal aus, um ihn zu aktualisieren.
  · „Freunde“, „Bestenliste“, „Meine Statistik“: Dafür musst du dich zuerst anmelden (siehe unten).

[Konten, Freunde, Statistik] (braucht den Internet-Spielserver)
  Spielen – auch online – geht ohne Konto; ein Konto bringt Statistik und Freunde dazu.
  · Registrieren: Klicke oben rechts in der Lobby auf „Registrieren“, gib einen Namen (2–16 Zeichen, keine
    anstößigen Wörter) und ein Passwort (mindestens 6 Zeichen) ein und wähle deine Region.
    Konten liegen auf dem Internet-Spielserver, du kannst dich also auch an anderen Computern anmelden.
    Angemeldet nutzen Online-Spiele deinen Kontonamen und deine Region (als Flagge).
  · Freunde: Gib unter „Freunde“ den Kontonamen der anderen Person ein, um eine Anfrage zu senden; nimmt sie an,
    seid ihr befreundet. Du siehst, ob Freunde online sind und was sie spielen, und kannst mit einem Klick
    mitspielen oder zuschauen.
  · Statistik: Was du spielst, wie lange, wie oft online und mit wem, wird automatisch erfasst.
  · Ergebnisse: Klicke nach einem Online-Match oben auf „🏆 Ergebnis eintragen“ und wähle den Sieger.
    Die anderen bekommen eine Bestätigungsanfrage; es zählt erst, wenn alle „Ja, bestätigen“ klicken.
    Klickt jemand „Stimmt nicht“, wird der Eintrag verworfen.
  · Champion: Mit 10+ Siegen und mindestens 60 % Siegquote in einem Spiel bist du dessen Champion; dein Name
    erscheint in der Lobby golden mit 👑.
  · Likes: Klicke ♡ in der Lobby, in der Freundesliste, in der Statistik eines Spielers oder unter „👥 Raum“ im Spiel;
    nochmal klicken nimmt es zurück. „♥ Am beliebtesten“ in der Bestenliste sortiert nach erhaltenen Likes.
  · Herausforderung: In Kampfspielen kann der Host oben auf „🥊 Herausforderung“ klicken. Das Spiel steht dann
    ganz oben in der Lobby mit „jeder darf antreten“, und jeder kann dich herausfordern.
  · Handys und Tablets, die eine Seite über die LAN-Adresse geöffnet haben, können sich ebenfalls anmelden und
    Internet-Spiele sehen: Ihre Anfragen leitet der Host-Computer weiter (dort muss der Internet-Spielserver
    eingerichtet sein).

[Sprache der Oberfläche]
  Klicke oben links auf die Flagge, um die Sprache zu wechseln: 简体中文, 繁體中文, English, 日本語, 한국어,
  Español, Français, Deutsch, Português, Русский. Standard ist die Systemsprache.
  Spielnamen werden auf Englisch angezeigt, zusätzlich in der gewählten Sprache, falls es eine Übersetzung gibt.
  Die Übersetzungen liegen im Ordner data/i18n (data/names.json enthält die Spielnamen); du kannst sie bearbeiten.

Weitere Möglichkeiten:
  · Parsec (https://parsec.app) zum Fernspielen: Dein Freund verbindet sich mit deinem Computer, sieht deinen
    Bildschirm, und sein Controller wird zu einem zweiten Controller an deinem Computer. Er braucht weder ROMs
    noch EmulatorJS.
  · Habt ihr beide RetroArch, könnt ihr auch dessen eigenes Netplay nutzen.


9. BIOS
-------
  NES, Super Nintendo, Mega Drive   Nicht nötig
  Sega Mega-CD                      Erforderlich: bios_CD_U.bin (USA), bios_CD_J.bin (Japan), bios_CD_E.bin (Europa)
  Arcade (FBNeo)                    Meist nicht nötig; Neo-Geo-Spiele (KOF, Metal Slug usw.) brauchen neogeo.zip,
                                    PGM-Spiele pgm.zip

  Ohne BIOS erscheint beim Klick auf ein Mega-CD-Spiel „BIOS fehlt – Start nicht möglich“.
  Ist der BIOS-Ordner eingestellt, steht oben links z. B. „BIOS gefunden: Sega Mega-CD (U/J)“;
  die Buchstaben zeigen, für welche Regionen du ein BIOS hast.


10. Häufige Probleme
--------------------
  Das Spiel bleibt nach dem Anklicken schwarz
    → Prüfe, ob die Seite über die Startdatei geöffnet wurde (die Adressleiste zeigt http://127.0.0.1 oder
      http://localhost) und nicht per Doppelklick auf index.html (die Adressleiste zeigt file://).

  Doppelklick auf EmulatorJS.command tut nichts (Mac)
    → Beim Kopieren ging vielleicht das Recht „ausführbar“ verloren. Öffne das Terminal, tippe
         chmod +x
      (mit Leerzeichen am Ende), ziehe EmulatorJS.command in das Terminal-Fenster, drücke Enter und doppelklicke
      dann erneut.

  EmulatorJS.command zeigt am Mac kein Gamepad-Symbol
    → Einmal doppelklicken setzt das Symbol. Ändert sich nichts, schließe das Finder-Fenster und öffne es erneut
      (der Finder aktualisiert nicht immer sofort). Die Symboldatei ist data/icon.png – nicht löschen.

  Unter Windows erscheint keine Verknüpfung „EmulatorJS“
    → Doppelklicke einmal auf EmulatorJS-Windows.bat; die Verknüpfung entsteht im selben Ordner.
      Prüfe, ob data die Datei icon.ico enthält und start-windows.ps1 neben der .bat liegt.

  Einige Spiele starten nicht
    → Manche Spiele brauchen ein BIOS (siehe Abschnitt 9); manche Arcade-Sets wurden für andere Emulatoren gemacht
      und laufen mit der Web-Version von FBNeo nicht – spiele sie mit RetroArch.

  Wo werden meine Einstellungen, mein Konto und meine Spielstände gespeichert?
    → Konto (Name, Freunde, Statistik): auf dem Internet-Spielserver, du kannst dich also von jedem Computer oder
      Handy anmelden; das Passwort wird nur verschlüsselt gespeichert.
      Einstellungen (Ordner, Adresse des Internet-Spielservers und Raum-Passwort): in der config.json jedes Geräts —
        Ordner-Version (.command / .bat): config.json im EmulatorJS-Ordner
        Windows-Desktop-App: %APPDATA%\EmulatorJS\config.json
        Mac-Desktop-App: ~/Library/Application Support/EmulatorJS/config.json
        Android-App: in den Daten der App (weg beim Deinstallieren oder Löschen der App-Daten)
      Anmeldung, Spielername, Sprache, Farbschema, Hintergrundbild, zuletzt gespielt, Spielstände und Save States:
      im Browser (Desktop- und Android-App in ihren eigenen Daten). Jedes Gerät speichert für sich, nichts wird auf den
      Server geladen. Sie gehen verloren, wenn du den Browser wechselst, seine Daten löschst oder die App deinstallierst;
      sichere Spielstände mit „Export Save File“ in der Menüleiste unter dem Spiel.


11. Urheberrecht
----------------
EmulatorJS ist Open-Source-Software (GPL-3.0, siehe Datei LICENSE). Du darfst es kostenlos weitergeben, aber nicht
kommerziell nutzen (der Arcade-Core FBNeo verbietet kommerzielle Nutzung).
Projektseite: https://github.com/EmulatorJS/EmulatorJS

Weiteres Material in diesem Tool:
  - Konsolenbilder: RetroArch-Theme „Systematic“ (libretro/retroarch-assets, von baxysquare u. a.),
    Lizenz CC BY 4.0; Lizenztext in data/consoles/LICENSE-CC-BY-4.0.txt.
    https://github.com/libretro/retroarch-assets
  - Tasten des Bildschirm-Controllers auf dem Handy: libretro common-overlays (gamepads/nes, snes, genesis, psx, arcade,
    gba, gameboy), Lizenz CC BY 4.0; Details und Lizenz in data/vpad/README.txt.
    https://github.com/libretro/common-overlays
  - Pixelschrift im Titel: Press Start 2P (von CodeMan38), SIL Open Font License 1.1;
    Lizenztext in data/fonts/LICENSE-OFL-1.1.txt.
  - Flaggen: flag-icons (MIT-Lizenz); Lizenztext in data/flags/LICENSE-flag-icons-MIT.txt.
  - Chinesische Namen der Arcade-Spiele: gamelistxml_Chinese_project (BSD-2-Clause); Lizenztext in data/LICENSE-gamelistxml-BSD-2.txt.
  - Farbschemata teils nach Spiele-Paletten von media.io (CRT Glow Arcade, Cartridge Desert usw.) und klassischen
    Konsolenfarben (Game-Boy-Bildschirmgrün, SNES-Grau und -Lila usw.), angepasst für gut lesbaren Text.
