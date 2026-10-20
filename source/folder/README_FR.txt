EmulatorJS — Guide d’utilisation
================================

EmulatorJS permet de jouer à des jeux rétro dans le navigateur. Inutile d’installer RetroArch,
et aucune connexion Internet n’est nécessaire.
Plus de vingt plateformes sont prises en charge, dont NES, Super Nintendo, Game Boy / GBA, N64, NDS,
Sega Mega Drive / Mega-CD / 32X / Saturn, PS1, PSP, PC Engine et l’arcade (FBNeo / MAME 2003).


1. Contenu du dossier
---------------------
  index.html              La page du jeu (ne l’ouvrez pas par un double-clic)
  data/                   Émulateurs et cœurs : n’y touchez pas
  EmulatorJS.command      Fichier de lancement pour Mac
  EmulatorJS-Windows.bat  Fichier de lancement pour Windows
  start-windows.ps1       Script utilisé par le lanceur Windows ; laissez-le à côté du .bat
  Enable-LAN-Windows.bat  Autorisation Windows pour le jeu en réseau local (s’affiche tout seul la première fois ;
                          double-cliquez dessus seulement si vous aviez répondu « Non »)
  cloud-server/           Script d’installation d’un serveur de jeu en ligne (uniquement sur un serveur cloud, voir section 8)
  server.py               Le petit serveur local utilisé par le lanceur Mac
  config.json             Créé au premier enregistrement des dossiers ; mémorise vos dossiers
  EmulatorJS.lnk          Raccourci avec une icône de manette, créé par Windows au premier lancement
  LICENSE                 Licence libre d’EmulatorJS (GPL-3.0)
  README_FR.txt, etc.     Ce guide, un fichier par langue : CN 简体中文, HK 繁體中文, US English, JP 日本語,
                          KR 한국어, ES Español, FR Français, DE Deutsch, BR Português, RU Русский


2. Ouvrir EmulatorJS
--------------------
[Application de bureau (recommandée)]
  Pour ne pas utiliser de navigateur ni garder une fenêtre de terminal ouverte, utilisez l’application : un
  double-clic ouvre la fenêtre du jeu ; fermer la fenêtre quitte.
  · Windows : EmulatorJS-Setup-version.exe l’installe (vous pouvez choisir le dossier ; raccourcis dans le menu Démarrer et sur le bureau) ;
    EmulatorJS-version-win.zip ne demande aucune installation : décompressez-le où vous voulez et double-cliquez sur EmulatorJS.exe.
    Si « Windows a protégé votre ordinateur » apparaît la première fois : « Informations complémentaires » →
    « Exécuter quand même ».
    Quand Windows demande l’accès au réseau, cochez « Réseaux privés » puis « Autoriser » (pour le jeu en réseau local).
  · Mac : …-mac-apple-silicon.dmg pour les puces M1 / M2 / M3 / M4, …-mac-intel.dmg pour les puces Intel.
    Ouvrez le dmg et glissez EmulatorJS dans « Applications ».
    La première fois, le développeur ne peut pas être vérifié : allez dans Réglages Système → Confidentialité et
    sécurité, puis « Ouvrir quand même ».
    Quand l’app demande à trouver des appareils sur le réseau local ou à utiliser le micro, choisissez « Autoriser »
    (pour le jeu en réseau local et le chat vocal).
  · Dossiers de jeux : roms, thumbnails et system dans « Documents/EmulatorJS » et aux emplacements habituels de
    RetroArch sont trouvés automatiquement, ou choisissez-les dans « ⚙ Dossiers ». Au premier démarrage,
    l’application reprend les réglages de votre ancien dossier EmulatorJS.
  · Les réglages sont rangés dans le dossier de données de l’application. EmulatorJS.command /
    EmulatorJS-Windows.bat fonctionnent toujours, et les deux peuvent jouer ensemble.
  · Le fichier de réglages config.json (dossiers, adresse du serveur en ligne et mot de passe de salle) se trouve :
    Windows : %APPDATA%\EmulatorJS\config.json (tapez %APPDATA%\EmulatorJS dans la barre d’adresse de l’Explorateur, puis Entrée)
    Mac : ~/Library/Application Support/EmulatorJS/config.json (dans le Finder, Maj+Cmd+G puis collez le chemin)

[Téléphones / tablettes / Android TV (APK)]
  · Téléphones, tablettes, téléviseurs et box TV : EmulatorJS-version-android.apk.
    Émulateurs Android sur PC (MuMu, etc.) : EmulatorJS-version-android-x86_64.apk.
    Android 7.0 ou plus récent. Si l'« Android System WebView » du téléviseur est trop ancien, l'application demande de le mettre à jour.
  · Installation : copiez l'apk sur le téléphone / téléviseur (câble USB, clé USB ou messagerie), puis ouvrez-le dans un gestionnaire de fichiers.
    Si Android refuse les applications de sources inconnues, autorisez ce gestionnaire de fichiers et rouvrez l'apk.
    Téléviseur : copiez l'apk sur une clé USB, branchez-la et ouvrez l'apk avec le gestionnaire de fichiers du téléviseur.
  · Au premier démarrage, autorisez l'accès aux photos et fichiers (stockage), sinon l'application ne peut pas lire vos jeux.
    L'application crée ensuite « Stockage du téléphone / EmulatorJS » avec les dossiers roms, thumbnails et system.
  · Ajouter des jeux : branchez le téléphone à l'ordinateur avec un câble (choisissez « Transfert de fichiers » sur le téléphone)
    et copiez les jeux dans EmulatorJS / roms, rangés comme sur un ordinateur (section 3) ; les jaquettes vont dans thumbnails,
    le BIOS dans system. Puis touchez « ↻ Actualiser ». Les jeux peuvent aussi être ailleurs : choisissez les dossiers dans
    « ⚙ Dossiers », avec des raccourcis comme « Stockage du téléphone » et « Téléchargements ».
  · Clé USB sur un téléviseur : un dossier EmulatorJS ou RetroArch (avec roms, etc.) à la racine de la clé est trouvé tout seul,
    ou touchez « Clé USB / carte mémoire » dans « ⚙ Dossiers ». Après avoir changé son contenu, touchez « ↻ Actualiser ».
    Android n'autorise pas les applications à écrire sur une clé USB : les jeux téléchargés depuis d'autres joueurs en ligne
    sont enregistrés dans « EmulatorJS / downloads » et affichés avec ceux de la clé.
  · Commandes :
    Téléphone : boutons à l'écran, ou une manette Bluetooth / USB.
    Téléviseur : choisissez le jeu avec la télécommande (flèches pour se déplacer, OK pour ouvrir, Retour pour revenir),
    puis jouez avec une manette.
    En jeu, Retour sur la télécommande ou le téléphone (ou Select + Start maintenus sur une manette) ouvre le menu du jeu :
    reprendre, sauvegarde rapide, chargement rapide, réinitialiser, plein écran, quitter le jeu.
    Dans la liste des jeux, appuyez deux fois sur Retour pour fermer l'application.
  · Le jeu en ligne, le salon et les comptes fonctionnent comme sur ordinateur, et vous pouvez jouer avec des ordinateurs
    (en réseau local, même Wi-Fi). Le chat vocal demande le micro la première fois : choisissez « Autoriser ».
  · Les box TV bon marché sont lentes : NES, SNES, GBA et Mega Drive tournent bien ; N64, PSP, NDS et Saturn peuvent saccader.

[Mac]
  1. Double-cliquez sur EmulatorJS.command.
     Si la première fois il indique qu’il « ne peut pas être ouvert car le développeur n’est pas identifié » :
     clic droit → « Ouvrir » → encore « Ouvrir ». Ensuite, un double-clic suffit.
  2. Une fenêtre Terminal s’ouvre et le navigateur affiche la page du jeu automatiquement.
     Si macOS propose d’installer les « outils de développement en ligne de commande », cliquez sur
     « Installer », puis double-cliquez à nouveau sur le lanceur.
  3. Laissez la fenêtre Terminal ouverte pendant que vous jouez ; fermez-la quand vous avez fini.
  Le lanceur reçoit automatiquement une icône de manette. Si l’icône se perd lors d’une copie,
  il suffit de le lancer une fois pour la retrouver.

[Windows]
  1. Double-cliquez sur EmulatorJS-Windows.bat.
     Si l’écran bleu « Windows a protégé votre ordinateur » apparaît : « Informations complémentaires » → « Exécuter quand même ».
  2. Une fenêtre de commande noire s’ouvre et le navigateur affiche la page du jeu automatiquement.
  3. Laissez cette fenêtre ouverte pendant que vous jouez ; fermez-la quand vous avez fini.
  Windows ne permet pas de donner une icône à un .bat : après le premier lancement, un raccourci
  « EmulatorJS » avec icône apparaît dans le dossier. Utilisez-le ensuite ; vous pouvez le glisser sur le bureau.
  Si vous déplacez le dossier, le raccourci ne fonctionne plus : double-cliquez une fois sur le .bat pour le recréer.

Pourquoi garder cette fenêtre ouverte ?
  Elle fait tourner un petit serveur web accessible uniquement depuis cet ordinateur. Pour des raisons de
  sécurité, les navigateurs empêchent une page ouverte par double-clic de lire les fichiers de l’émulateur ;
  la page passe donc par ce serveur. Fermez la fenêtre et le serveur s’arrête.

[Passer à une nouvelle version]
  · À l’ouverture (puis toutes les 6 heures), EmulatorJS vérifie s’il existe une nouvelle version ; si oui, une fenêtre
    affiche les nouveautés et « 🆕 Nouvelle version » apparaît à côté du numéro de version dans la barre de gauche.
    Cliquez sur le numéro de version pour vérifier vous-même à tout moment. Rien ne s’affiche pendant que vous jouez.
  · Version Windows installée (avec EmulatorJS-Setup-<version>.exe) : cliquez sur « Mettre à jour automatiquement ».
    Le nouvel installateur est téléchargé et vérifié ; cliquez ensuite sur « Installer maintenant » : EmulatorJS se ferme,
    installe la nouvelle version et se rouvre tout seul (environ une demi-minute). Jeux, réglages et sauvegardes sont conservés.
    Si le téléchargement est très lent (plus de 5 minutes environ) ou échoue, Baidu Netdisk vous est proposé.
  · Mac, version zip Windows, version dossier, Android : cliquez sur « Télécharger la nouvelle version » (ou Baidu Netdisk,
    conseillé en Chine) et remplacez l’ancienne comme indiqué (Mac : glissez le nouvel EmulatorJS dans Applications et
    choisissez « Remplacer » ; version dossier : copiez les nouveaux fichiers par-dessus l’ancien dossier).
  · Téléchargements : https://github.com/supwang/emulatorjs-releases/releases
    Baidu Netdisk : https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk (code 6akk)
  · Vous ne voulez pas d’une version ? Cliquez sur « Ignorer cette version ». La vérification lit seulement les informations
    de version sur le site de téléchargement ; rien n’est envoyé.


3. Dossiers de jeux (à régler une fois)
---------------------------------------
À l’ouverture, la page lit automatiquement trois dossiers ; inutile de les choisir à chaque fois :

  Dossier des ROM        Le dossier principal de vos jeux (obligatoire)
  Dossier des vignettes  Le dossier thumbnails de RetroArch (facultatif, affiche les jaquettes)
  Dossier BIOS           Le dossier des BIOS (facultatif, nécessaire pour certaines plateformes seulement, voir section 9)

[Recherche automatique] Les dossiers non réglés sont cherchés dans cet ordre et utilisés dès qu’ils sont trouvés :
  1. Dans le dossier EmulatorJS (à côté d’EmulatorJS.command et d’EmulatorJS-Windows.bat) :
     les dossiers roms, thumbnails et system (le dossier BIOS peut aussi s’appeler bios)
  2. Les emplacements par défaut de RetroArch
     Mac : roms, thumbnails et system dans ~/Library/Application Support/RetroArch/
     Windows : %APPDATA%\RetroArch, ou roms, thumbnails et system dans RetroArch-Win64, RetroArch,
               Games\RetroArch-Win64, etc. sur les lecteurs C:/D:/E:/F:
  Si votre RetroArch utilise son emplacement par défaut, vous pouvez donc jouer dès la première fois.
  Pour partager avec quelqu’un, vous pouvez aussi placer les dossiers roms, thumbnails et system directement
  dans le dossier EmulatorJS : il suffit de décompresser, d’ouvrir et de jouer.

[Réglage manuel] Cliquez sur « ⚙ Dossiers » en haut à gauche :
  1. Cliquez sur « Parcourir… » à côté de chaque élément, naviguez jusqu’au dossier puis cliquez sur « Choisir ce dossier ».
     En haut, des raccourcis comme « Dossier personnel », « Bureau » et « RetroArch » sont disponibles.
     Vous pouvez aussi coller le chemin d’un dossier.
  2. Cliquez sur « Enregistrer et charger les jeux ». Les réglages sont enregistrés dans config.json et réutilisés à chaque fois.
  - « Effacer » puis enregistrer pour revenir à la recherche automatique.
  - Si un dossier choisi n’existe plus (par exemple sur un autre ordinateur), la recherche automatique
    reprend et la page des réglages vous le signale.

[Télécharger les images automatiquement]
  Pour les jeux sans jaquette, EmulatorJS peut télécharger jaquettes, écrans titres et captures depuis la collection de la communauté
  libretro (libretro-thumbnails, la même que RetroArch) dans votre dossier d'images (s'il n'y en a pas, un dossier « thumbnails »
  est créé à côté du dossier ROM).
  · La première fois qu'il trouve des jeux sans jaquette, il vous demande ; si vous acceptez, les jeux ajoutés plus tard sont aussi traités.
  · Activez ou désactivez cela dans « ⚙ Dossiers » → « Télécharger les images automatiquement », ou cliquez sur « ⬇ Télécharger maintenant les images manquantes ».
  · Les images sont cherchées par le nom du jeu (les jeux d'arcade par leur nom complet FBNeo) ; les noms standard de type No-Intro
    fonctionnent le mieux, les noms modifiés ou traduits peuvent ne pas être trouvés.
  · Accès à GitHub nécessaire. La progression s'affiche en haut à gauche et vous pouvez « Arrêter » à tout moment. La collection est
    réunie par la communauté ; les images appartiennent aux éditeurs des jeux.

[Après avoir ajouté des jeux] Cliquez sur « ↻ Actualiser » en haut à gauche : inutile de rouvrir la page.

[Classement automatique des nouveaux jeux par plateforme]
  La plateforme de chaque jeu est déterminée dans cet ordre ; la première étape qui la reconnaît l’emporte :
  1. La plateforme notée dans une playlist RetroArch (l’outil est fourni avec une liste de jeux)
  2. Une plateforme que vous avez choisie auparavant (choisie une fois dans « Choisir la plateforme manuellement », elle est mémorisée)
  3. L’extension du fichier : .nes .sfc .smc .md .gen .gba .gb .n64 .nds, etc.
  4. Le contenu du fichier :
     - Archives (.zip) : ce qu’elles contiennent, par exemple un .sfc indique la Super Nintendo, un .md la Mega Drive
     - Images de disque / cartouche (.bin .iso .cue) : l’en-tête au début du fichier, qui identifie
       Mega Drive, Mega-CD, Saturn, PS1, etc.
  5. Le nom du dossier qui le contient : snes, md, fbneo, « Nintendo - Super Nintendo Entertainment System », etc.
  6. Une archive sans format de cartouche connu → considérée comme un jeu d’arcade
  7. Ce qui reste inconnu (p. ex. .7z, .chd) va dans « Choisir la plateforme manuellement » ; choisissez une fois
  Les jeux d’arcade sont aussi comparés à la liste officielle de FBNeo (plus de 8000) : un fichier dont le nom
  n’y est pas (p. ex. cvs2.zip de NAOMI) ne tourne pas sous FBNeo et va dans « Non pris en charge par la version web ».
  Même si toutes sortes de jeux sont dans le même dossier, la plupart arrivent donc sur la bonne plateforme.
  Seuls le début de chaque fichier et le sommaire des archives sont lus, c’est donc rapide ; les résultats sont
  mémorisés et rien n’est à refaire la fois suivante.

Conseils :
  - L’idéal est d’avoir un sous-dossier par plateforme dans le dossier des ROM, par exemple snes, md, nes, fbneo,
    ou des noms à la RetroArch comme « Nintendo - Super Nintendo Entertainment System », pour une reconnaissance
    automatique des plateformes.
  - Si trois boutons comme « Choisir le dossier des ROM » s’affichent en haut à gauche au lieu de « ⚙ Dossiers »,
    la page a été mal ouverte ou par une ancienne fenêtre de lancement : fermez toutes les fenêtres Terminal /
    de commande et rouvrez-la avec le lanceur.


4. Jouer
--------
  1. La liste des plateformes est à gauche, chacune avec une image de la console. Les jeux Neo Geo ont leur
     propre entrée « Neo Geo » ; les autres jeux d’arcade sont dans « Arcade (FBNeo) ».
     Cliquez sur une plateforme pour afficher à droite les jaquettes de tous ses jeux.
     « 🕘 Joués récemment », tout en haut, liste les 10 derniers jeux de cet ordinateur ; cliquez pour rejouer.
     Pour en retirer un : survolez la jaquette et cliquez sur le ✕ dans le coin (manette : sélectionnez-le et appuyez sur X ;
     clavier : Suppr). « Vider la liste » les retire tous.
     Survolez un jeu pour faire défiler ses images : jaquette → écran titre → capture. Les points sous la
     jaquette indiquent combien il y en a et laquelle est affichée ; éloignez la souris et l’image
     affichée reste. (Les images manquantes sont sautées ; les jeux qui n’ont qu’une image ne défilent pas.)
     Taille des jaquettes : choisissez « P / M / G / TG » en haut à droite du mur de jaquettes. Chaque plateforme garde sa propre taille.
  2. Cliquez sur une jaquette pour lancer le jeu.
  3. Cliquez sur « Quitter le jeu » en haut à droite pour revenir au mur de jaquettes.
  4. Le champ de recherche permet de trouver un jeu par son nom.
  5. Tout en bas de la barre latérale, « ⌨ Raccourcis » liste les touches clavier et les boutons de manette
     pour la pièce, Start, la réinitialisation, la pause, le turbo, sauver / charger et le menu de service
     arcade. Cliquez sur le titre pour replier / déplier ; votre choix est mémorisé.
  6. Thème de couleurs : cliquez sur 🎨 à côté d’« EmulatorJS » en haut à gauche pour choisir parmi 7 thèmes
     (Enfance [par défaut : une salle d’arcade au crépuscule, avec image de fond], Arcade de nuit [sombre], Bleu Sega [bleu vif], Vert Game Boy, Gris et violet SNES [clair],
      Cartouche crème [clair], Rose bonbon [clair]).
     Le fond, le texte et les boutons changent ensemble ; votre choix est mémorisé.
     Le même panneau propose « Image de fond » : choisissez une image de votre ordinateur à afficher derrière la
     liste des jeux à droite (elle reste fixe quand on fait défiler). Une image générale et/ou une image par
     plateforme (les plateformes sans image propre utilisent la générale). Le curseur « Assombrir » fonce l’image
     pour que le texte reste lisible. Les images ne sont enregistrées que dans ce navigateur sur cet appareil.
     Pendant le jeu, l’espace de part et d’autre affiche la même image (assombrie et floutée) : les jeux verticaux ne sont
     plus entourés de bandes noires. Désactivable dans le même panneau.
  7. Langue : cliquez sur le drapeau en haut à gauche (voir « Langue de l’interface » à la section 8).

  - « Choisir la plateforme manuellement » : jeux dont la plateforme n’a pas été reconnue. Choisissez-en une et
    le jeu rejoint ce groupe.
  - « Non pris en charge par la version web » : jeux que la version navigateur ne peut pas faire tourner
    (par exemple Sega NAOMI). Jouez-y avec RetroArch.
    Vous ne voulez pas voir cette liste ? Ouvrez-la et cliquez sur « Masquer cette liste » en haut à droite, ou décochez-la dans « ⚙ Dossiers ».

Les touches, sauvegardes, sauvegardes d’état, le plein écran, etc. se trouvent dans la barre de menu sous le jeu.
« Control Settings » affiche et modifie les touches du clavier, et prend aussi en charge les manettes.
Les sauvegardes sont conservées dans le navigateur ; elles sont perdues si vous changez de navigateur ou effacez
ses données. Pour les sauvegarder ailleurs, utilisez « Export Save File » dans le menu.

Codes de triche : dans la barre de menu, « Triches » (Cheats) → « Ajouter une triche » (Add Cheat), saisissez le code et une description,
validez, puis cochez pour l’activer (encore une fois pour la couper). Le format dépend de la plateforme : Game Genie sur NES,
Action Replay / GameShark sur GBA, etc. ; cherchez « <nom du jeu> codes triche » sur Internet. Certains codes demandent de relancer le jeu
pour être entièrement annulés. En ligne avec d’autres joueurs, les triches se coupent automatiquement et le bouton est masqué ;
elles reviennent quand vous rejouez seul.

Bibliothèque de codes : en haut du menu « Triches » (Cheats), cliquez sur « 📚 Choisir dans la bibliothèque de codes (libretro) ». Les codes
de ce jeu sont recherchés (base de données de la communauté libretro, libretro-database : bien fournie pour NES, SNES, Mega Drive, GBA et
autres consoles, presque rien pour l'arcade) ; cochez ceux voulus, cliquez sur « Ajouter les codes sélectionnés », puis cochez-les dans
« Triches » pour les activer. Indisponible aussi en jeu en ligne. Accès à GitHub nécessaire.


5. Clavier et manette
---------------------
[Touches par défaut] (joueur 1)

  Directions          W haut   S bas   A gauche   D droite
  Start               Entrée
  Select / Pièce      V

  NES                 J = A    K = B
  Super Nintendo      J = A    K = B    I = X    L = Y    U = gâchette L    O = gâchette R
  Mega Drive / CD     rangée du bas J K L = A B C        rangée du haut U I O = X Y Z
  Arcade Neo Geo (King of Fighters, Metal Slug, Samurai Shodown, etc.)
                      J = A    K = B    I = C    L = D
                      U = A+B ensemble   O = C+D ensemble   (A+B+C et B+C+D n’ont pas de touche par défaut)
  Arcade (autres)     J K I L = boutons 1 2 3 4    U O = boutons 5 6
  Arcade (jeux de combat à 6 boutons : Street Fighter, Darkstalkers, Marvel)
                      Poing faible J   Poing moyen K   Poing fort L
                      Pied faible U    Pied moyen I    Pied fort O
                      (les 3 poings / 3 pieds ensemble n’ont pas de touche par défaut)

  Pause / reprendre   Maj droite
  Turbo on / off      T
  Réinitialiser       V + Entrée + U + O ensemble (les cartouches multi-jeux reviennent au menu)
  Sauver l’état 1     Charger l’état 2    Changer d’emplacement 3
  (Avance rapide, ralenti et retour en arrière n’ont pas de touche par défaut ; réglez-les dans « Control Settings »)

  - Les jeux d’arcade choisissent leur disposition d’après le nom du fichier ROM. Utilisent pour l’instant
    la disposition à 6 boutons :
      Street Fighter (sf), Street Fighter II' Champion Edition (sf2ce), Street Fighter Alpha 3 (sfa3),
      Street Fighter III 3rd Strike (sfiii3), Street Fighter EX2 Plus (sfex2p),
      Darkstalkers (dstlk), Night Warriors (nwarr), Vampire Savior 2 (vsav2)
    Tous les autres jeux d’arcade (y compris les jeux Neo Geo comme KOF et Metal Slug) utilisent J K I L.
    Les nouveaux Street Fighter, Darkstalkers et Marvel (X-Men, Marvel) sont aussi reconnus en 6 boutons.
  - Vous pouvez changer les touches dans « Control Settings », dans la barre de menu sous le jeu.

[Boutons affichés dans « Control Settings »]
  Les boutons portent les noms de la manette d’origine de chaque plateforme, toujours dans cet ordre :
    Pièce / Select → Start → directions → boutons → combinaisons → sauvegarde d’état, avance rapide et autres fonctions

  NES                 Select, Start, directions, A, B
  Super Nintendo      Select, Start, directions, A, B, X, Y, L, R
  Mega Drive / CD     MODE, Start, directions, A, B, C, X, Y, Z
  Arcade Neo Geo      Pièce, Start, directions, A, B, C, D
                      Combinaisons : A+B, C+D, A+B+C, B+C+D
  Arcade combat       Pièce, Start, directions, poing faible / moyen / fort, pied faible / moyen / fort
                      Combinaisons : 3 poings ensemble, 3 pieds ensemble
  Arcade (autres)     Pièce, Start, directions, boutons 1–6

  - Une combinaison est une touche qui appuie sur plusieurs boutons à la fois. Une vraie Neo Geo n’a que
    A B C D ; les combinaisons sont un bonus de l’émulateur qui facilite les coups spéciaux et les esquives
    (p. ex. A+B pour esquiver et C+D pour projeter dans KOF).
  - Le classement d’un jeu d’arcade en Neo Geo ou en jeu de combat à 6 boutons se fait d’après le nom du
    fichier ROM et le titre complet.
  - Les réglages sont enregistrés par jeu : les touches, filtres, etc. modifiés dans un jeu ne valent que pour
    ce jeu et sont réutilisés la fois suivante ; les autres jeux gardent les touches ci-dessus.
  - Les sauvegardes (y compris les sauvegardes d’état) sont stockées séparément de ces réglages, sans interférence.
  - Les boutons de la manette ne dépendent pas des réglages clavier ci-dessus : voir [Manette] plus bas.

[Manette]
Les manettes courantes fonctionnent : Xbox, PS4 / PS5, Switch Pro, et la plupart des manettes USB / Bluetooth.

  1. Branchez la manette à l’ordinateur en USB ou en Bluetooth.
  2. Une fois dans le jeu, appuyez d’abord sur n’importe quel bouton : le navigateur ne la détecte qu’à ce
     moment-là (une règle de confidentialité des navigateurs).
  3. Par défaut, les boutons suivent la convention de RetroArch (manette Xbox ; à gauche, le bouton du jeu) :
       NES / SNES   B → A (bas)      A → B (droite)   Y → X (gauche)   X → Y (haut)
       Mega Drive   A → X (gauche)   B → A (bas)      C → B (droite)
       Neo Geo      A → A (bas)      B → B (droite)   C → X (gauche)   D → Y (haut)
       Combat       Poing faible → X (gauche)  Poing moyen → Y (haut)  Pied faible → A (bas)  Pied moyen → B (droite)
                    Poing fort → LB   Pied fort → RB
     (Les réglages d’origine d’EmulatorJS inversent A et B sur la manette ; cet outil suit plutôt RetroArch.)
     Si un bouton ne convient pas, ouvrez « Control Settings » dans la barre de menu sous le jeu et réattribuez-le.
     Jusqu’à 4 joueurs, chacun avec sa manette. Les réglages sont enregistrés dans le navigateur.

  - Chrome ou Edge est conseillé : ce sont eux qui gèrent le mieux les manettes.
  - Dans les jeux d’arcade, Pièce et Start correspondent en général à Select / Affichage et Start / Menu.
  - Réinitialiser : appuyez ensemble sur Select + Start + LB + RB (Share + Options + L1 + R1 sur PlayStation).
    Pratique avec les cartouches multi-jeux NES pour revenir au menu. Fonctionne sur toutes les plateformes.
  - Le stick gauche fonctionne comme la croix (au-delà de la moitié, c’est un appui ; les diagonales marchent),
    et vous pouvez mélanger les deux.
  - Turbo on / off : enfoncez le stick droit (R3).
  - Choisir un jeu sans souris (manette, clavier ou télécommande de la télé) :
      croix / stick gauche / flèches : se déplacer entre jaquettes et boutons ; A / Entrée : valider (lancer un jeu, appuyer
      sur un bouton) ; B / Échap / Retour de la télécommande : revenir ou fermer le panneau ouvert ; LB / RB : plateforme
      précédente / suivante ; Start : ouvrir ou fermer le salon.
  - Menu du jeu : en jeu, maintenez Select + Start une demi-seconde (Retour sur la télécommande) pour reprendre,
    sauvegarder, charger, réinitialiser, passer en plein écran ou quitter. Seul, le jeu se met en pause pendant le menu ;
    en ligne il ne s’arrête pas, et ceux qui ont rejoint ne voient pas sauvegarder, charger ni réinitialiser.

[Turbo]
  1. En jeu, cliquez sur « Réglages du turbo » en haut et cochez les boutons qui doivent tirer en rafale dans
     ce jeu. Par exemple dans un shoot’em up : cochez le tir mais pas le bouton de charge ; maintenir le tir
     le répète alors, et maintenir la charge charge normalement.
  2. Activer le turbo : cliquez sur « Activer le turbo » dans « Réglages du turbo », ou appuyez sur T au clavier /
     R3 à la manette pendant le jeu. Une fois activé, « TURBO ON » s’affiche en haut à gauche du jeu et le
     bouton devient « Turbo · activé ».
  3. Cochez « Activer le turbo au lancement de ce jeu » pour qu’il soit déjà actif la fois suivante, sans T / R3.

  - Les réglages sont enregistrés par jeu ; réglez chaque jeu une fois. Par défaut, tous les boutons sont
    cochés et le turbo ne s’active pas tout seul.
  - Le turbo tire environ 15 fois par seconde. Les directions, Start et Pièce ne sont pas concernés.
  - Il fonctionne sur toutes les plateformes, au clavier comme à la manette.
  - Si les touches ne répondent plus après avoir fermé « Réglages du turbo », cliquez une fois sur l’image du jeu.


6. Réglages arcade : menu de service, difficulté, vies, mode Neo Geo
--------------------------------------------------------------------
Ces réglages se trouvent dans la barre de menu sous le jeu : « Settings » (icône d’engrenage) → « Backend Core Options ».
Après modification, cliquez sur « Restart » dans la barre de menu pour les appliquer. Ils sont enregistrés par jeu.

[Menu de service arcade (Test Mode)]
  En jeu, maintenez Start (Entrée) environ 2 secondes pour ouvrir le menu de service d’origine de la borne,
  où l’on règle la difficulté, les vies, le temps, les continues, etc. (les options dépendent du jeu).
  Vous pouvez changer la façon de l’ouvrir avec « diagnostic input » dans les options du cœur, par exemple en maintenant Select.

[Difficulté, vies (interrupteurs DIP)]
  Beaucoup de jeux d’arcade règlent la difficulté et les vies avec les interrupteurs DIP de la carte.
  Dans les options du cœur, cherchez les éléments dont le nom contient « Dipswitch », par exemple :
    Difficulty (difficulté)   Lives (vies)   Bonus Life (vie bonus)
  Chaque jeu a ses propres interrupteurs, et certains n’en ont aucun.

[Modes multijoueur (3 ou 4 joueurs)]
  - Captain Commando : la borne sort d’usine en mode 2 joueurs ; cet outil passe par défaut en mode 4 joueurs
    (« Dipswitch Play Mode » dans les options du cœur, où vous pouvez revenir en arrière).
  - Knights of the Round, The King of Dragons, Mercs : déjà en mode 3 joueurs, rien à changer.
  - Warriors of Fate, Cadillacs & Dinosaurs et les autres jeux CPS1 Q-Sound : le nombre de joueurs n’est pas un DIP switch
    mais un réglage du menu de service. Si un troisième joueur ne peut pas entrer, regardez CONFIGURATION dans le menu
    de service (maintenez Start environ 2 secondes).
  - En ligne, tout le monde doit avoir les mêmes réglages pour le même jeu (sinon des messages de désynchronisation
    apparaissent) ; le mieux est que chacun utilise la dernière version.

[Neo Geo : mode arcade / console]
  Par défaut, cet outil lance les jeux Neo Geo (KOF, Metal Slug, Samurai Shodown, etc.) en mode arcade
  (MVS, Europe/Asie) :
    - Comme dans une salle d’arcade : V pour mettre une pièce, puis Entrée pour commencer ;
    - Pendant qu’une personne joue, une autre peut mettre une pièce et appuyer sur Start à tout moment pour
      la rejoindre (pareil en ligne) ;
    - La difficulté, les vies, etc. se règlent dans le menu de service arcade (voir plus haut).
  Pour passer en mode console, cherchez « mode » (Neo-Geo mode) dans les options du cœur :
    MVS_EUR / MVS_USA / MVS_JAP  Version arcade (Europe-Asie / USA / Japon), avec pièces   ← par défaut MVS_EUR
    AES_EUR / AES_JAP            Version console (anglais / japonais), sans pièces ; difficulté et vies dans
                                 Option sur l’écran titre
    DIPSWITCH                    Le réglage d’origine du jeu (en général la version arcade)
    UNIBIOS                      BIOS amélioré fait par des fans (codes de triche, changement de région, etc.)
  C’est mémorisé par jeu : un jeu passé en mode console le reste la fois suivante.
  En ligne, tout le monde doit utiliser le même mode pour ce jeu, sinon les écrans se désynchronisent.
  Remarque : neogeo.zip doit contenir le fichier BIOS correspondant (c’est en général le cas d’un neogeo.zip
  FBNeo complet) ; sinon, le jeu revient à son mode par défaut.


7. Filtres (effets d’image)
---------------------------
En jeu, cliquez sur « Settings » dans la barre de menu du bas → « Graphics Settings » → « Shaders » et
choisissez-en un : l’effet est visible immédiatement :

  CRT easymode       Vieux téléviseur cathodique avec lignes de balayage, rendu doux : à essayer en premier
  CRT geom           Rendu cathodique avec courbure de l’écran et coins sombres, le plus proche d’une vieille télé
  CRT aperture       Simule la grille d’ouverture, image nette
  CRT mattias        Simule le léger flou et les bavures de couleur d’un signal TV
  2xScaleHQ          Arrondit et adoucit les bords des pixels
  4xScaleHQ          Pareil, avec un lissage plus fort
  Disabled           Pas de filtre, pixels d’origine

  - Les filtres sont enregistrés par jeu : une fois choisi pour un jeu, il est réutilisé la fois suivante ;
    les autres jeux se règlent séparément.
  - Les filtres CRT rendent mieux en plein écran ; dans une petite fenêtre, les lignes paraissent trop serrées.
  - Sur un ordinateur ancien, CRT geom peut saccader ; CRT easymode est plus fluide.


8. Jouer ensemble
-----------------
[Jeu en réseau local (ordinateurs sur le même Wi-Fi / routeur)]
Pas besoin d’échanger des adresses : chacun double-clique sur EmulatorJS.command (Mac) ou
EmulatorJS-Windows.bat (Windows). Sur le même réseau local, « 🕹 En cours » à gauche affiche qui joue à quoi
sur les autres ordinateurs ; cliquez sur « Rejoindre » pour participer.

  · Le jeu en réseau local est activé par défaut. Pour ne pas être visible, cliquez sur « ⚙ Dossiers » et
    décochez « Jeu en réseau local ».
  · Mac : la première fois, macOS peut demander si Python peut accepter les connexions entrantes : choisissez « Autoriser ».
  · Windows : la première fois, « Voulez-vous autoriser cette application à apporter des modifications à votre
    appareil ? » apparaît : choisissez « Oui » (une seule fois). Si vous avez choisi « Non », double-cliquez plus
    tard sur « Enable-LAN-Windows.bat » dans le dossier, puis rouvrez EmulatorJS.
  · Après « Rejoindre », vous jouez toujours sur votre propre page, avec le même fichier de jeu sur votre
    ordinateur. Si vous n’avez pas ce jeu (ou si votre fichier est différent), vous jouez automatiquement en
    regardant l’écran de l’autre.
  · Les parties marquées « autre ordinateur » ont été lancées sur un autre ordinateur ; les autres, depuis la
    ludothèque de cet ordinateur.
  · Les jeux de console fonctionnent de la même façon : si le jeu figure dans la liste, cliquez sur « Rejoindre ».
  · Cliquez sur « Je suis : … » pour changer de nom ; c’est le nom que les autres voient dans la liste.
    Les noms ne peuvent pas contenir d’insultes ni d’autres mots grossiers, ni être identiques à celui d’un
    joueur en cours (sans tenir compte de la casse, des espaces et des symboles). Un nom contenant des mots
    grossiers est automatiquement remplacé par « Joueur » suivi d’un numéro.
    Les mots interdits sont dans data/badwords.json ; modifiez-le avec un éditeur de texte (un mot par entrée).
    Sur le serveur en ligne, c’est /opt/emulatorjs-cloud/data/badwords.json ; les changements s’appliquent
    immédiatement, sans redémarrage.

Appareils sans EmulatorJS (tablettes, ordinateurs d’autres personnes) :
  Saisissez dans le navigateur l’adresse de l’ordinateur où EmulatorJS est ouvert (affichée dans la barre
  latérale, p. ex. http://192.168.1.23:8765) pour voir tous ses jeux et les rejoindre, sans ROM.
  Ces appareils ne peuvent ni voir ni modifier les dossiers de cet ordinateur.
  Remarque : les navigateurs n’autorisent pas le micro sur une page ouverte ainsi, donc pas de chat vocal
  (vous entendez quand même les autres).

Comment la connexion se fait (choix automatique, rien à régler) :
  · Synchronisation des touches (expérimental, privilégié) : la personne qui rejoint fait aussi tourner le même
    jeu sur son ordinateur, et seules les touches pressées à chaque image passent par le réseau, comme le
    netplay de RetroArch. Chaque ordinateur calcule sa propre image : elle est nette et la bande passante est
    minime. Rejoindre un « autre ordinateur » utilise le même fichier de jeu sur votre ordinateur ; une page
    ouverte via l’adresse réseau local lit le fichier sur l’ordinateur hôte, donc pas besoin de la ROM.
    Pour laisser le temps aux touches d’arriver, celles de tout le monde prennent effet quelques images plus
    tard (environ 2 à 3 en réseau local : presque imperceptible).
    Toutes les 2 secondes, l’état du jeu est comparé ; s’il diffère, l’hôte envoie une sauvegarde d’état à
    tous pour réaligner. L’image peut clignoter ou sauter un instant : c’est normal.
  · Diffusion vidéo : l’ordinateur hôte diffuse l’image et le son en direct, et les touches de la personne qui
    rejoint lui sont renvoyées. Utilisée automatiquement quand elle n’a pas le même fichier de jeu.
  L’hôte est J1 ; ceux qui rejoignent deviennent J2, J3 et J4 — jusqu’à 4 joueurs (si le jeu le permet).
  Le nombre de joueurs dépend de la plateforme : 2 sur NES, PS1, Neo Geo, etc. ; 4 sur SNES, Mega Drive, N64, autres jeux
  d’arcade et PC Engine ; 1 sur les consoles portables (GB / GBA / NDS / PSP, etc.). Quand c’est complet, on peut encore regarder.
  « 2/2 joueurs · 👀 1 » dans « En cours » veut dire 2 joueurs maintenant / 2 au maximum, et 1 personne qui regarde.
  Ils utilisent leur clavier ou leur manette avec les mêmes touches qu’en solo.
  En réseau local la latence est très faible, mais un Wi-Fi faible provoque des saccades ; l’idéal est que
  l’hôte soit en câble.

Avec la synchronisation des touches :
  · L’hôte appuie sur Maj droite pour mettre tout le monde en pause ; les autres ne peuvent pas mettre en pause.
  · Seul l’hôte peut réinitialiser (Select+Start+L1+R1) ou charger une sauvegarde ; tout le monde est ensuite
    resynchronisé automatiquement.
  · Le délai de chaque joueur jusqu’à l’hôte s’affiche à côté de son nom (vert = rapide, jaune = correct, rouge = lent ;
    « Relayée » s’il passe par le serveur). Tout le monde le voit. Si quelqu’un reste en rouge et ralentit tout le monde,
    l’hôte peut le faire sortir dans « 👥 Salle ».
  · Le 📶 en haut indique la connexion : directe ou relayée, l’aller-retour en ms et le nombre d’images de
    retard des touches (ajusté automatiquement). Si les chiffres restent élevés, passez par un câble réseau ou
    mettez en pause les gros téléchargements. Tout le monde devrait utiliser la dernière version.
  · Tout le monde doit rester sur la page du jeu. Si quelqu’un change de fenêtre ou réduit la sienne, tout le
    monde est bloqué.
  · Si la connexion de quelqu’un ralentit, tout le monde ralentit et « En attente de la connexion de X… » s’affiche en haut.
  · Si les écrans se désynchronisent sans cesse, les réglages de ce jeu (options du cœur, p. ex. mode console /
    arcade de la Neo Geo, difficulté) diffèrent généralement : alignez-les.
  · Testé avec la NES et la Mega Drive. Les autres systèmes devraient fonctionner mais n’ont pas tous été
    vérifiés ; les problèmes sont réalignés automatiquement.

Deux façons de jouer ensemble : délai / rollback (synchro des touches uniquement ; l’hôte décide)
  À choisir dans « ⚙ Dossiers » → « Mode de jeu en ligne » ; en jeu, on peut aussi changer dans « 👥 Salle ».
  · Mode délai (par défaut, stable) : la méthode décrite plus haut. Les touches de chacun agissent quelques images
    plus tard ; tout le monde voit toujours la même image, sans sauts même avec une mauvaise connexion.
  · Mode rollback (réactif, expérimental) : vos touches répondent presque tout de suite (seulement 2 images de retard).
    Tant que les touches de l’autre ne sont pas arrivées, le jeu suppose qu’il appuie toujours sur les mêmes ;
    quand elles arrivent et que la supposition était fausse, il charge une sauvegarde instantanée d’il y a
    quelques images et rejoue ces images avec les bonnes touches en un éclair. On voit donc parfois le
    personnage de l’autre « sauter » à la bonne place. La plupart des jeux de combat en ligne font ainsi.
    · Idéal quand l’aller-retour réseau est sous 100 ms ; au-delà, les mouvements de l’autre sautent souvent
      et le mode délai convient mieux.
    · Une sauvegarde instantanée de plus à chaque image : les ordinateurs doivent être assez rapides. Si l’un
      n’y arrive pas, la partie repasse toute seule en mode délai et vous prévient.
    · Tout le monde doit avoir la nouvelle version ; si quelqu’un a une ancienne, la partie utilise le mode délai.
    · Si un jeu se désynchronise sans cesse en mode rollback (3 fois en une minute), la partie repasse aussi en mode délai.
    · Pas de pause en mode rollback ; 📶 en haut affiche « Rollback ». Rejouer des images peut parfois
      provoquer un petit défaut de son.

Téléphones et ordinateurs ensemble (appareils lents) :
  Avec la synchronisation des touches, tout le monde avance image par image ensemble : l’appareil le plus lent
  impose sa vitesse. Les téléphones font tourner les jeux d’arcade (Neo Geo, etc.) plus lentement que les
  ordinateurs, d’où ce fonctionnement automatique :
  · Un téléphone rejoint la partie d’un ordinateur : le téléphone joue en regardant l’écran. Le jeu tourne sur
    l’ordinateur, à sa vitesse. Une croix directionnelle et des boutons apparaissent sur l’écran du téléphone.
  · Un ordinateur rejoint la partie d’un téléphone : les écrans sont d’abord alignés, puis le jeu passe sur
    l’ordinateur et le téléphone continue en regardant l’écran. Il y a une pause d’une ou deux secondes.
    Les numéros de joueur ne changent pas (le téléphone reste J1, l’ordinateur J2).
  · Les jeux d’arcade, PS1, N64, etc. sur téléphone et tablette comptent toujours comme « lents » ; les autres
    sont jugés d’après la vitesse mesurée, et c’est pareil pour les ordinateurs très anciens.
  · Quand un téléphone joue seul à un jeu d’arcade, le saut d’images automatique et une fréquence audio plus
    basse sont activés par défaut pour plus de vitesse (une image est parfois sautée ; la vitesse du jeu ne change pas).

Pour que personne ne vous rejoigne :
  Pendant le jeu, cliquez sur le bouton « Arrivées : oui » en haut pour passer à « non ». Plus personne ne peut
  entrer, et la liste affiche « Pas d’arrivée » (ceux déjà présents ne sont pas concernés).
  Le réglage par défaut est celui que vous avez choisi en dernier.
  Si quelqu’un clique sur votre partie, il est prévenu et peut jouer seul.

Gérer votre salle (👥 Salle) :
  En jeu, cliquez sur « 👥 Salle » en haut pour voir les joueurs et les spectateurs de votre salle :
  · Autoriser les spectateurs : activé / désactivé. Jusqu’à 8 spectateurs par partie, dont 2 au plus par la vidéo
    (pour chaque spectateur vidéo, votre ordinateur compresse une vidéo à part ; s’ils sont nombreux, votre partie ralentit).
  · Joueurs inscrits seulement : activé, les personnes non connectées ne peuvent ni rejoindre ni regarder
    (aussi en réseau local ; nécessite le serveur de jeu en ligne).
  · Faire sortir : cliquez deux fois (le second clic confirme). La personne ne peut plus entrer dans vos salles
    pendant 30 minutes ; elle est reconnue par son compte, le numéro de l’appareil et l’adresse réseau
    (d’autres personnes du même réseau peuvent aussi être bloquées pendant ces 30 minutes).
  · ♡ : donnez un j’aime à un autre joueur (il doit avoir un compte).

Remarques :
  · L’hôte doit rester sur la page du jeu ; changer de fenêtre ou réduire peut figer l’image.
  · Quand l’hôte quitte le jeu, la partie se termine et les autres sont prévenus.
  · Les sauvegardes sont enregistrées sur l’ordinateur hôte. Turbo : avec la synchronisation des touches, vos
    réglages sont utilisés ; avec la diffusion vidéo, ceux de l’hôte.
  · Le jeu en réseau local ne fonctionne que sur le même réseau ; pour des amis ailleurs, voir ci-dessous.

[Chat vocal]
  Pendant une partie à plusieurs, cliquez sur « 🎤 Voix : coupée » en haut pour l’activer et parler avec les
  autres (tout le monde s’entend).
  · La première fois, le navigateur demande l’accès au micro : choisissez « Autoriser ». C’est mémorisé : si
    vous avez utilisé la voix, elle s’active d’elle-même la fois suivante.
  · Couper la voix empêche seulement les autres de vous entendre ; vous les entendez toujours.
  · Quand quelqu’un parle, un anneau s’allume autour de son nom en haut.
  · Un casque est vivement conseillé : sinon le micro capte le son du jeu et les autres voix et les renvoie en écho.
  · Le micro ne fonctionne que si EmulatorJS est ouvert sur votre propre ordinateur (adresse 127.0.0.1) ;
    les navigateurs ne l’autorisent pas sur une page ouverte via une adresse réseau local, p. ex. sur une tablette.

[Jouer avec des amis ailleurs (serveur de jeu en ligne)]
Pour jouer avec des amis qui ne sont pas sur votre réseau, il faut un « serveur de jeu » accessible à tous
(par exemple un serveur cloud). Cela fonctionne comme en réseau local : les parties de vos amis apparaissent
dans « En cours » (marquées « Internet ») ; cliquez sur « Rejoindre ». Le chat vocal fonctionne aussi.

Réglage de chaque ordinateur (une fois) :
  « ⚙ Dossiers » → « Serveur de jeu en ligne » : saisissez l’adresse du serveur (p. ex. http://1.2.3.4:8765) et le
  mot de passe du salon, cliquez sur « Enregistrer et tester » : c’est bon quand il indique « Connecté ».
  C’est enregistré dans config.json, dans le dossier EmulatorJS : réglez-le d’abord, puis envoyez tout le
  dossier à vos amis, qui n’auront rien à saisir.
  Attention : config.json contient le mot de passe de salle, donc toute personne qui reçoit le dossier peut entrer
  sur votre serveur ; ne l’envoyez qu’à des gens de confiance. S’ils ne doivent pas se connecter directement,
  supprimez config.json avant de compresser le dossier et laissez-les saisir l’adresse et le mot de passe.

Vous pouvez enregistrer plusieurs serveurs : saisissez une autre adresse et un autre mot de passe, puis
« Ajouter et y passer ». Chaque serveur est un salon ; changez avec « 🌐 Salon : … » sous « En cours », à gauche.
Chaque salon affiche le drapeau du pays ou de la région du serveur, ses salons et le nombre de joueurs en ligne.
Comptes, amis et statistiques sont propres à chaque serveur : inscrivez-vous ou connectez-vous à nouveau ailleurs.

Remarques :
  · Les parties en ligne affichent le drapeau du pays ou de la région du réseau de l’hôte (estimation
    approximative d’après l’IP), pour se faire une idée du décalage.
  · Si vous n’avez pas le jeu, « Rejoindre » permet de demander le téléchargement à l’hôte : il choisit
    « Autoriser », « Refuser » ou « Toujours autoriser ». Le jeu, ses 3 images d’aperçu et le BIOS manquant arrivent directement de son ordinateur
    (sans passer par le serveur), sont enregistrés dans le dossier du même système de votre dossier ROM, puis
    vous rejoignez la partie automatiquement.
  · Pas de connexion ou coupure : si la connexion n’est pas établie 20 secondes après avoir rejoint, vous
    quittez avec un message ; si la ligne est coupée 15 secondes en cours de partie, celui qui a rejoint
    quitte et l’hôte continue seul. Un VPN d’un côté ou de l’autre empêche souvent la connexion ou fait
    exploser le décalage.
  · Rejoindre par Internet utilise le même fichier de jeu sur votre ordinateur (synchronisation des touches),
    donc tout le monde doit avoir les mêmes ROM (aucun souci avec le même paquet EmulatorJS).
    Quelqu’un qui n’a pas le jeu joue en regardant la vidéo, ce qui consomme plus de bande passante serveur.
  · Plus vous êtes loin, plus les touches sont retardées de quelques images (ajusté automatiquement après
    mesure de la connexion) ; les jeux de combat peuvent paraître un peu mous.
  · Toute personne ayant le mot de passe voit toutes les parties du serveur ; pour que personne n’entre,
    désactivez les arrivées.

Installer le serveur de jeu (une fois, par la personne qui a le serveur cloud) :
  Il faut un serveur cloud sous Ubuntu 22.04 / 24.04 (la plus petite offre suffit).
  1. Dans le « Pare-feu » de la console cloud, ouvrez : TCP 8765, TCP 80, TCP 3478, UDP 3478, UDP 49160-49250.
     (Le TCP 80 sert à obtenir un certificat https gratuit pour chiffrer les mots de passe, etc. ;
      le certificat se renouvelle tout seul tous les 3 jours.)
  2. Ouvrez le terminal web avec « Connexion » dans la console et envoyez « cloud-server/ejs-cloud-setup.sh » du dossier sur le serveur.
  3. Dans le terminal, lancez : sudo bash ejs-cloud-setup.sh
     Pour choisir votre mot de passe : sudo bash ejs-cloud-setup.sh votremotdepasse (lettres et chiffres uniquement)
     Si vous avez un domaine (pointez-le d’abord vers l’IP du serveur avec un enregistrement A) : sudo bash ejs-cloud-setup.sh votredomaine
     par ex. sudo bash ejs-cloud-setup.sh example.site. L’adresse devient alors https://votredomaine:8765 ;
     l’ancienne adresse IP continue de fonctionner et chaque ordinateur passe tout seul au domaine en se connectant
     (si l’IP du serveur change un jour, il suffit de modifier l’enregistrement A du domaine).
  4. À la fin, l’adresse du serveur (commençant par https://) et le mot de passe du salon s’affichent :
     saisissez-les dans les réglages ci-dessus.
     Une ancienne adresse http n’a pas besoin d’être modifiée : EmulatorJS passe tout seul en https et les
     réglages affichent « 🔒 Connexion chiffrée ».
  Le serveur redémarre tout seul après un redémarrage de la machine.
  Mettre à jour le serveur : après une mise à jour d’EmulatorJS, envoyez à nouveau le nouveau
  « cloud-server/ejs-cloud-setup.sh » (en remplaçant l’ancien) et lancez sudo bash ejs-cloud-setup.sh.
  Le mot de passe ne change pas ; les joueurs en cours sont déconnectés un instant et n’ont qu’à rejoindre à nouveau.
  (Remarque : cela remplace le fichier de mots interdits du serveur par le nouveau ; les mots ajoutés sur le
  serveur doivent être ajoutés à nouveau.)
  Gérer les comptes : dans le terminal du serveur, lancez sudo ejs-admin et choisissez un numéro dans le menu (en anglais) :
    lister / chercher des utilisateurs, réinitialiser un mot de passe, renommer, bannir / débannir, supprimer un compte,
    lister / supprimer des résultats de match.
    Le menu 10 « Server limits » règle les limites du serveur : personnes connectées, salles et débit du relais.
    Le menu 11 « Developer (admin) account » crée le compte réservé à l’administrateur 开发者 ou Developer : aucun
    joueur ne peut enregistrer ni usurper un nom contenant ces mots ; connecté avec ce compte, votre nom est
    mis en couleur avec 🛠 dans le salon, les parties et les classements.
  (Un utilisateur banni ne peut plus se connecter et est déconnecté aussitôt ; supprimer un compte efface aussi ses amis
   et ses résultats, sans retour possible.)

[Salon]
  Cliquez sur « ⤢ Salon » à côté d’« En cours » à gauche (sur téléphone, touchez 🕹 en haut à droite) pour ouvrir
  le salon en plein écran :
  · « En cours » : toutes les parties en cours en réseau local et sur Internet. Recherchez par jeu ou par joueur
    et filtrez par « Ouvertes / Défi / Combat / Amis / Réseau local / Internet ». Vous pouvez « Rejoindre » ou
    « 👀 Regarder » n’importe quelle partie (les spectateurs regardent sans contrôler).
  · « 🌐 Joueurs en ligne » : tous ceux qui sont sur le serveur en ligne en ce moment (EmulatorJS ouvert avec ce serveur),
    avec drapeau, nom, compte ou invité, et ce qu'ils jouent ou s'ils sont dans le salon ; vous pouvez « Rejoindre » ou
    « 👀 Regarder » directement. Le bouton « 🌐 Salon » affiche par ex. « 37/200 en ligne » (personnes maintenant / limite
    du serveur). Les anciens serveurs ne l'affichent pas : l'administrateur relance le script d'installation pour mettre à jour.
  · « Amis », « Classement », « Mes statistiques » : il faut d’abord se connecter (voir ci-dessous).

[Comptes, amis, statistiques] (nécessite le serveur de jeu en ligne)
  Vous pouvez jouer, y compris en ligne, sans compte ; un compte ajoute les statistiques et les amis.
  · S’inscrire : cliquez sur « S’inscrire » en haut à droite du salon, saisissez un nom (2 à 16 caractères, sans
    mots grossiers) et un mot de passe (au moins 6 caractères), puis choisissez votre région.
    Les comptes sont stockés sur le serveur en ligne : vous pouvez vous connecter depuis d’autres ordinateurs.
    Une fois connecté, les parties en ligne utilisent le nom et la région de votre compte (avec drapeau).
  · Amis : dans « Amis », saisissez le nom de compte de l’autre personne pour envoyer une demande ; dès qu’elle
    accepte, vous êtes amis. Vous voyez si vos amis sont en ligne et à quoi ils jouent, et pouvez rejoindre ou
    regarder leur partie en un clic.
  · Statistiques : ce à quoi vous jouez, combien de temps, combien de fois en ligne et avec qui sont enregistrés
    automatiquement.
  · Résultats : après un match en ligne, cliquez sur « 🏆 Noter le résultat » en haut et choisissez le gagnant.
    Les autres reçoivent une demande de confirmation ; cela ne compte qu’une fois que tous ont cliqué sur
    « Oui, confirmer ». Si quelqu’un clique sur « C’est faux », le résultat est annulé.
  · Champion : 10 victoires ou plus et au moins 60 % de réussite sur un jeu font de vous son champion ; votre
    nom apparaît en or avec 👑 dans le salon.
  · J’aime : cliquez sur ♡ dans le salon, votre liste d’amis, les statistiques d’un joueur ou « 👥 Salle » en jeu ;
    recliquez pour le retirer. « ♥ Les plus aimés » dans le Classement trie par j’aime reçus.
  · Défi : dans les jeux de combat, l’hôte peut cliquer sur « 🥊 Défi » en haut. La partie est placée en tête du
    salon avec « challengers bienvenus », et tout le monde peut venir vous défier.
  · Les téléphones et tablettes qui utilisent une page ouverte via l’adresse réseau local peuvent aussi se
    connecter et voir les parties en ligne : leurs requêtes passent par l’ordinateur hôte (qui doit avoir le
    serveur en ligne configuré).

[Langue de l’interface]
  Cliquez sur le drapeau en haut à gauche pour changer de langue : 简体中文, 繁體中文, English, 日本語, 한국어,
  Español, Français, Deutsch, Português, Русский. Par défaut, c’est la langue du système.
  Les noms des jeux s’affichent en anglais, avec le titre dans la langue choisie quand il existe.
  Les traductions sont dans le dossier data/i18n (data/names.json contient les noms des jeux) ; vous pouvez les modifier.

Autres solutions :
  · Parsec (https://parsec.app), jeu à distance : votre ami se connecte à votre ordinateur, voit votre écran, et
    sa manette devient une deuxième manette sur votre ordinateur. Il n’a besoin ni des ROM ni d’EmulatorJS.
  · Si vous avez tous les deux RetroArch, vous pouvez aussi utiliser son netplay.


9. BIOS
-------
  NES, Super Nintendo, Mega Drive   Inutile
  Sega Mega-CD                      Obligatoire : bios_CD_U.bin (US), bios_CD_J.bin (Japon), bios_CD_E.bin (Europe)
  Arcade (FBNeo)                    Rarement ; les jeux Neo Geo (KOF, Metal Slug, etc.) ont besoin de neogeo.zip,
                                    les jeux PGM de pgm.zip

  Sans BIOS, cliquer sur un jeu Mega-CD affiche « BIOS manquant : impossible de démarrer ».
  Une fois le dossier BIOS réglé, le haut à gauche indique par exemple « BIOS trouvé : Sega Mega-CD (U/J) » ;
  les lettres indiquent de quelles régions vous avez le BIOS.


10. Problèmes fréquents
-----------------------
  Le jeu reste noir après avoir cliqué dessus
    → Vérifiez que la page a été ouverte avec le lanceur (la barre d’adresse affiche http://127.0.0.1 ou
      http://localhost) et non par un double-clic sur index.html (la barre affiche file://).

  Double-cliquer sur EmulatorJS.command ne fait rien (Mac)
    → Le droit d’« exécution » a peut-être été perdu lors de la copie. Ouvrez Terminal, tapez
         chmod +x
      (attention à l’espace final), glissez EmulatorJS.command dans la fenêtre du Terminal, appuyez sur Entrée,
      puis double-cliquez à nouveau.

  EmulatorJS.command n’affiche pas l’icône de manette sur Mac
    → Un double-clic suffit à la poser. Si rien ne change, fermez et rouvrez la fenêtre du Finder (il ne se
      rafraîchit pas toujours tout de suite). Le fichier de l’icône est data/icon.png : ne le supprimez pas.

  Le raccourci « EmulatorJS » n’apparaît pas sous Windows
    → Double-cliquez une fois sur EmulatorJS-Windows.bat ; le raccourci est créé dans le même dossier.
      Vérifiez que data contient icon.ico et que start-windows.ps1 est à côté du .bat.

  Certains jeux ne démarrent pas
    → Certains jeux ont besoin d’un BIOS (voir section 9) ; certains jeux d’arcade ont été prévus pour d’autres
      émulateurs et la version web de FBNeo ne peut pas les lancer : jouez-y avec RetroArch.

  Où sont enregistrés mes réglages, mon compte et mes sauvegardes ?
    → Compte (nom, amis, statistiques) : sur le serveur en ligne, vous pouvez donc vous connecter depuis n’importe
      quel ordinateur ou téléphone ; le mot de passe n’est stocké que sous forme chiffrée.
      Réglages (dossiers, adresse du serveur en ligne et mot de passe de salle) : dans le config.json de chaque appareil —
        Version dossier (.command / .bat) : config.json dans le dossier EmulatorJS
        Application Windows : %APPDATA%\EmulatorJS\config.json
        Application Mac : ~/Library/Application Support/EmulatorJS/config.json
        Application Android : dans les données de l’application (effacées en la désinstallant ou en vidant ses données)
      Connexion, nom de joueur, langue, thème de couleurs, image de fond, joués récemment, sauvegardes et sauvegardes
      d’état : dans le navigateur (les applications de bureau et Android les gardent dans leurs propres données).
      Chaque appareil garde les siennes, rien n’est envoyé au serveur. Elles sont perdues si vous changez de navigateur,
      effacez ses données ou désinstallez l’application ; sauvegardez avec « Export Save File » dans la barre sous le jeu.


11. Droits d’auteur
-------------------
EmulatorJS est un logiciel libre (GPL-3.0, voir le fichier LICENSE). Vous pouvez le partager gratuitement, mais
pas l’utiliser commercialement (le cœur arcade FBNeo interdit l’usage commercial).
Page du projet : https://github.com/EmulatorJS/EmulatorJS

Autres éléments utilisés par cet outil :
  - Images des consoles : thème « Systematic » de RetroArch (libretro/retroarch-assets, par baxysquare et d’autres),
    licence CC BY 4.0 ; licence dans data/consoles/LICENSE-CC-BY-4.0.txt.
    https://github.com/libretro/retroarch-assets
  - Police pixel du titre : Press Start 2P (par CodeMan38), SIL Open Font License 1.1 ;
    licence dans data/fonts/LICENSE-OFL-1.1.txt.
  - Drapeaux : flag-icons (licence MIT) ; licence dans data/flags/LICENSE-flag-icons-MIT.txt.
  - Noms chinois des jeux d’arcade : gamelistxml_Chinese_project (BSD-2-Clause) ; licence dans data/LICENSE-gamelistxml-BSD-2.txt.
  - Thèmes de couleurs inspirés en partie des palettes de jeux de media.io (CRT Glow Arcade, Cartridge Desert, etc.)
    et des couleurs de consoles classiques (vert de l’écran Game Boy, gris et violet de la SNES, etc.), ajustés
    pour un texte lisible.
