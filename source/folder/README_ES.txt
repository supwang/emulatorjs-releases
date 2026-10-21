EmulatorJS — Guía de uso
================================

EmulatorJS te permite jugar a juegos retro en el navegador. No hace falta instalar RetroArch
ni tener conexión a Internet.
Admite más de veinte plataformas, entre ellas NES, Super Nintendo, Game Boy / GBA, N64, NDS,
Sega Mega Drive / Mega-CD / 32X / Saturn, PS1, PSP, PC Engine y arcade (FBNeo / MAME 2003).


1. Qué hay en la carpeta
------------------------
  index.html              La página del juego (no la abras con doble clic)
  data/                   Emuladores y núcleos: no cambies nada aquí
  EmulatorJS.command      Archivo de inicio para Mac
  EmulatorJS-Windows.bat  Archivo de inicio para Windows
  start-windows.ps1       Script que usa el archivo de inicio de Windows; déjalo junto al .bat
  Enable-LAN-Windows.bat  Permiso de Windows para jugar en red local (aparece solo la primera vez;
                          haz doble clic tú solo si entonces respondiste «No»)
  cloud-server/           Script para montar un servidor de juego por Internet (solo en un servidor en la nube, ver sección 8)
  server.py               El pequeño servidor local que usa el archivo de inicio de Mac
  config.json             Se crea al guardar por primera vez las carpetas; recuerda las que elegiste
  EmulatorJS.lnk          Acceso directo con icono de mando, que Windows crea en el primer inicio
  LICENSE                 Licencia de código abierto de EmulatorJS (GPL-3.0)
  README_ES.txt, etc.     Esta guía, un archivo por idioma: CN 简体中文, HK 繁體中文, US English, JP 日本語,
                          KR 한국어, ES Español, FR Français, DE Deutsch, BR Português, RU Русский


2. Cómo abrirlo
---------------
[Aplicación de escritorio (recomendada)]
  Si prefieres no usar el navegador ni dejar abierta una ventana de terminal, usa la aplicación: doble clic y se
  abre la ventana del juego; al cerrarla, se sale.
  · Windows: EmulatorJS-Setup-versión.exe la instala (puedes elegir la carpeta; crea accesos en el menú Inicio y el escritorio);
    EmulatorJS-versión-win.zip no necesita instalación: descomprímelo donde quieras y haz doble clic en EmulatorJS.exe.
    Si la primera vez aparece «Windows protegió su PC»: «Más información» → «Ejecutar de todas formas».
    Cuando Windows pregunte por el acceso a la red, marca «Redes privadas» y pulsa «Permitir» (para la red local).
  · Mac: …-mac-apple-silicon.dmg para chips M1 / M2 / M3 / M4, …-mac-intel.dmg para chips Intel.
    Abre el dmg y arrastra EmulatorJS a «Aplicaciones».
    La primera vez dirá que no se puede verificar al desarrollador: ve a Ajustes del Sistema → Privacidad y
    seguridad y pulsa «Abrir igualmente».
    Cuando pregunte si puede buscar dispositivos en la red local o usar el micrófono, elige «Permitir»
    (para jugar en red local y el chat de voz).
  · Carpetas de juegos: busca solo roms, thumbnails y system en «Documentos/EmulatorJS» y en las ubicaciones
    habituales de RetroArch, o elígelas en «⚙ Carpetas». La primera vez toma los ajustes de tu carpeta
    EmulatorJS anterior.
  · Los ajustes se guardan en la carpeta de datos de la aplicación. EmulatorJS.command / EmulatorJS-Windows.bat
    siguen funcionando, y ambos pueden jugar juntos.
  · El archivo de ajustes config.json (carpetas, dirección del servidor de Internet y contraseña de sala) está en:
    Windows: %APPDATA%\EmulatorJS\config.json (escribe %APPDATA%\EmulatorJS en la barra de direcciones del Explorador y pulsa Intro)
    Mac: ~/Library/Application Support/EmulatorJS/config.json (en el Finder pulsa Mayús+Comando+G y pega la ruta)

[Móviles / tabletas / Android TV (APK)]
  · Móviles, tabletas, televisores y TV box: EmulatorJS-versión-android.apk.
    Emuladores de Android en un PC (MuMu, etc.): EmulatorJS-versión-android-x86_64.apk.
    Necesita Android 7.0 o posterior. Si el «Android System WebView» del televisor es muy antiguo, la app avisa para actualizarlo.
  · Instalación: pasa el apk al móvil / televisor (cable USB, memoria USB o una app de mensajería) y ábrelo con un gestor de archivos.
    Si Android dice que no se permite instalar apps desconocidas, permíteselo a ese gestor de archivos y vuelve a abrir el apk.
    Televisor: copia el apk a una memoria USB, conéctala al televisor y ábrelo con el gestor de archivos del televisor.
  · La primera vez, permite el acceso a fotos y archivos (almacenamiento); si no, la app no puede leer tus juegos.
    Después se crea «Almacenamiento del teléfono / EmulatorJS» con las carpetas roms, thumbnails y system.
  · Añadir juegos: conecta el móvil al ordenador con un cable (elige «Transferir archivos» en el móvil) y copia los juegos
    en EmulatorJS / roms, ordenados igual que en el ordenador (sección 3); las portadas van en thumbnails y la BIOS en system.
    Luego pulsa «↻ Recargar». También puedes guardarlos en otro sitio y elegir las carpetas en «⚙ Carpetas», que tiene
    accesos directos como «Almacenamiento del teléfono» y «Descargas».
  · Memoria USB en el televisor: una carpeta EmulatorJS o RetroArch (con roms, etc.) en la raíz de la memoria se encuentra sola,
    o pulsa «Memoria USB / tarjeta» en «⚙ Carpetas». Si cambias el contenido, pulsa «↻ Recargar».
    Android no deja a las apps escribir en memorias USB: los juegos descargados de otros jugadores al jugar en línea se guardan
    en «EmulatorJS / downloads» y aparecen junto a los de la memoria.
  · Controles:
    Móvil: botones en pantalla, o un mando Bluetooth / USB.
    Televisor: elige el juego con el mando a distancia (flechas para moverte, OK para abrir, Atrás para volver) y juega con un mando.
    En el juego, Atrás en el mando a distancia o el móvil (o mantener Select + Start en un mando) abre el menú del juego:
    continuar, guardar estado, cargar estado, reiniciar, pantalla completa, salir del juego.
    En la lista de juegos, pulsa Atrás dos veces para cerrar la app.
  · El juego en línea, la sala y las cuentas funcionan igual que en el ordenador, y puedes jugar con ordenadores
    (en red local, usa la misma Wi-Fi). El chat de voz pide el micrófono la primera vez: elige «Permitir».
  · Los TV box baratos son lentos: NES, SNES, GBA y Mega Drive van fluidos; N64, PSP, NDS y Saturn pueden ir a tirones.
  · Un mando (Xbox, PlayStation, 8BitDo…, por Bluetooth o cable) pasa a ser el jugador 1 en cuanto se conecta; no hace
    falta elegirlo en «Ajustes de control».
  · Los juegos de consola y arcade usan por defecto el filtro «CRT easymode» (como una tele antigua, con líneas); se cambia
    en «Ajustes → Shaders» del juego.

[Mac]
  1. Haz doble clic en EmulatorJS.command.
     Si la primera vez dice que «no se puede abrir porque es de un desarrollador no identificado»:
     clic derecho → «Abrir» → «Abrir» otra vez. A partir de entonces basta con doble clic.
  2. Se abre una ventana de Terminal y el navegador abre la página del juego automáticamente.
     Si macOS pide instalar las «herramientas de desarrollo de línea de comandos», pulsa «Instalar»
     y luego vuelve a hacer doble clic en el archivo de inicio.
  3. Deja abierta la ventana de Terminal mientras juegas; ciérrala al terminar.
  El archivo de inicio recibe un icono de mando automáticamente. Si el icono se pierde al copiarlo,
  basta con ejecutarlo una vez para recuperarlo.

[Windows]
  1. Haz doble clic en EmulatorJS-Windows.bat.
     Si aparece el aviso azul «Windows protegió su PC»: pulsa «Más información» → «Ejecutar de todas formas».
  2. Se abre una ventana negra de comandos y el navegador abre la página del juego automáticamente.
  3. Deja abierta esa ventana mientras juegas; ciérrala al terminar.
  Windows no permite poner icono a un .bat, así que tras el primer inicio aparece en la carpeta un acceso
  directo «EmulatorJS» con icono. Úsalo a partir de entonces; puedes arrastrarlo al escritorio.
  Si mueves la carpeta, el acceso directo deja de funcionar; haz doble clic en el .bat para crearlo de nuevo.

¿Por qué hay que dejar abierta esa ventana?
  Ejecuta un pequeño servidor web al que solo puede acceder este ordenador. Por seguridad, los navegadores
  no dejan que una página abierta con doble clic lea los archivos del emulador, así que la página se abre a
  través de él. Si cierras la ventana, el servidor se detiene.

[Actualizar a una versión nueva]
  · Al abrirse (y luego cada 6 horas) EmulatorJS comprueba si hay una versión nueva; si la hay, un aviso muestra las
    novedades y junto al número de versión de la barra izquierda aparece «🆕 Nueva versión». Pulsa el número de versión
    para comprobarlo a mano cuando quieras. Nunca aparece mientras juegas.
  · Versión instalada de Windows (con EmulatorJS-Setup-<versión>.exe): pulsa «Actualizar automáticamente». Se descarga el
    nuevo instalador y se comprueba que esté completo; luego pulsa «Instalar ahora»: EmulatorJS se cierra, instala la nueva
    versión y se vuelve a abrir solo (medio minuto aprox.). Se conservan juegos, ajustes y partidas guardadas.
    Si la descarga va muy lenta (más de unos 5 minutos) o falla, se ofrece Baidu Netdisk.
  · Mac, versión zip de Windows, versión de carpeta, Android: pulsa «Descargar la nueva versión» (o Baidu Netdisk, mejor
    en China) y reemplaza la anterior como indica el aviso (Mac: arrastra el nuevo EmulatorJS a Aplicaciones y elige
    «Reemplazar»; versión de carpeta: copia los archivos nuevos encima de la carpeta anterior).
  · Descargas: https://github.com/supwang/emulatorjs-releases/releases
    Baidu Netdisk: https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk (código 6akk)
  · ¿No quieres una versión? Pulsa «Omitir esta versión». La comprobación solo lee la información de versión del sitio de
    descargas; no se envía nada.


3. Carpetas de juegos (se configuran una vez)
---------------------------------------------
Al abrir la página se leen tres carpetas automáticamente, así que no hay que elegirlas cada vez:

  Carpeta de ROM          La carpeta principal de tus juegos (obligatoria)
  Carpeta de miniaturas   La carpeta thumbnails de RetroArch (opcional, muestra portadas)
  Carpeta de BIOS         Carpeta con las BIOS (opcional, solo algunas plataformas la necesitan, ver sección 9)

[Búsqueda automática] Las carpetas que no hayas configurado se buscan en este orden y se usan en cuanto aparecen:
  1. Dentro de la carpeta de EmulatorJS (junto a EmulatorJS.command y EmulatorJS-Windows.bat):
     las carpetas roms, thumbnails y system (la de BIOS también puede llamarse bios)
  2. Las ubicaciones predeterminadas de RetroArch
     Mac: roms, thumbnails y system dentro de ~/Library/Application Support/RetroArch/
     Windows: %APPDATA%\RetroArch, o roms, thumbnails y system dentro de RetroArch-Win64, RetroArch,
              Games\RetroArch-Win64, etc., en las unidades C:/D:/E:/F:
  Así que si tu RetroArch usa su ubicación predeterminada, puedes jugar desde la primera vez.
  Para compartirlo con alguien, también puedes meter las carpetas roms, thumbnails y system directamente en
  la carpeta de EmulatorJS: la otra persona solo tiene que descomprimir, abrir y jugar.

[Configuración manual] Pulsa «⚙ Carpetas» arriba a la izquierda:
  1. Pulsa «Examinar…» en cada elemento, ve entrando hasta la carpeta y pulsa «Elegir esta carpeta».
     Arriba hay botones de acceso rápido como «Inicio», «Escritorio» y «RetroArch».
     También puedes pegar la ruta de una carpeta.
  2. Pulsa «Guardar y cargar juegos». Los ajustes se guardan en config.json y se usan siempre.
  - Pulsa «Borrar» y guarda para volver a la búsqueda automática.
  - Si una carpeta configurada ya no se encuentra (por ejemplo en otro ordenador), se vuelve a la
    búsqueda automática y la página de ajustes te lo indica.

[Descargar imágenes automáticamente]
  Para los juegos sin portada, EmulatorJS puede descargar portadas, pantallas de título y capturas de la colección de la comunidad
  libretro (libretro-thumbnails, la misma que usa RetroArch) en tu carpeta de imágenes (si no hay ninguna, crea una carpeta
  "thumbnails" junto a la carpeta de ROM).
  · La primera vez que encuentra juegos sin portada te pregunta; si aceptas, también descarga las de los juegos que añadas después.
  · Se activa o desactiva en «⚙ Carpetas» → «Descargar imágenes automáticamente», o pulsa «⬇ Descargar ahora las imágenes que faltan».
  · Las imágenes se buscan por el nombre del juego (los arcade por su nombre completo de FBNeo); funcionan mejor los nombres estándar
    tipo No-Intro, los nombres cambiados o traducidos pueden no encontrarse.
  · Requiere acceso a GitHub. El progreso aparece arriba a la izquierda y se puede «Detener». La colección la reúne la comunidad;
    las imágenes pertenecen a las compañías de los juegos.

[Después de añadir juegos] Pulsa «↻ Recargar» arriba a la izquierda; no hace falta volver a abrir la página.

[Cómo se clasifican los juegos nuevos por plataforma]
  La plataforma de cada juego se decide en este orden; gana el primer paso que la reconoce:
  1. La plataforma guardada en una lista de reproducción de RetroArch (esta herramienta incluye una lista de juegos)
  2. Una plataforma que elegiste antes (elígela una vez en «Elegir la plataforma a mano»; se recuerda)
  3. La extensión del archivo: .nes .sfc .smc .md .gen .gba .gb .n64 .nds, etc.
  4. El contenido del archivo:
     - Archivos comprimidos (.zip): lo que contienen; por ejemplo, un .sfc dentro es Super Nintendo y un .md, Mega Drive
     - Imágenes de disco / cartucho (.bin .iso .cue): la cabecera al principio del archivo, que identifica
       Mega Drive, Sega CD, Saturn, PS1 y otras
  5. El nombre de la carpeta donde está: snes, md, fbneo, «Nintendo - Super Nintendo Entertainment System», etc.
  6. Un comprimido sin ningún formato de cartucho conocido dentro → se trata como juego arcade
  7. Lo que siga sin reconocerse (p. ej. .7z, .chd) va a «Elegir la plataforma a mano»; elígela una vez
  Los juegos arcade se comparan también con la lista oficial de FBNeo (más de 8000): si el nombre del archivo no
  está (p. ej. cvs2.zip de NAOMI), FBNeo no puede ejecutarlo y va a «No compatible con la versión web».
  Así, aunque todo tipo de juegos estén en una misma carpeta, la mayoría acaban en la plataforma correcta.
  Solo se lee el principio de cada archivo y el índice del comprimido, así que es rápido; los resultados
  se recuerdan y la próxima vez no hay que detectar nada.

Consejos:
  - Lo ideal es tener una subcarpeta por plataforma en la carpeta de ROM, p. ej. snes, md, nes, fbneo, o
    nombres al estilo RetroArch como «Nintendo - Super Nintendo Entertainment System», para que las
    plataformas se reconozcan solas.
  - Si arriba a la izquierda ves tres botones como «Elegir carpeta de ROM» en vez de «⚙ Carpetas», la página
    se abrió de forma incorrecta o con una ventana de inicio antigua: cierra todas las ventanas de Terminal /
    comandos y ábrela de nuevo con el archivo de inicio.


4. Jugar
--------
  1. La lista de plataformas está a la izquierda, cada una con una imagen de la consola. Los juegos de Neo Geo
     tienen su propia entrada «Neo Geo»; los demás arcade están en «Arcade (FBNeo)».
     Pulsa una plataforma para ver a la derecha las portadas de todos sus juegos.
     «🕘 Jugados recientemente», arriba del todo, muestra los 10 últimos juegos de este ordenador; pulsa uno para volver a jugar.
     Para quitar uno: pasa el ratón por la portada y pulsa la ✕ de la esquina (mando: selecciónalo y pulsa X; teclado: Supr).
     «Borrar lista» los quita todos.
     Pasa el ratón por encima de un juego para ver sus imágenes: portada → pantalla de título → captura.
     Los puntos bajo la portada indican cuántas hay y cuál ves; al apartar el ratón se queda la imagen actual.
     (Las imágenes que faltan se saltan; los juegos con una sola imagen no cambian.)
     Tamaño de portada: elige «P / M / G / XG» arriba a la derecha del muro de portadas. Cada plataforma recuerda su propio tamaño.
  2. Pulsa una portada para empezar el juego.
  3. Pulsa «Salir del juego» arriba a la derecha para volver al muro de portadas.
  4. Usa el cuadro de búsqueda para encontrar juegos por nombre.
  5. Abajo del todo, en la barra lateral izquierda, «⌨ Atajos» muestra las teclas y botones del mando para
     moneda, start, reiniciar, pausa, turbo, guardar / cargar y el menú de servicio arcade. Pulsa el título para
     plegarlo / desplegarlo; se recuerda tu elección.
  6. Tema de color: pulsa 🎨 junto a «EmulatorJS» arriba a la izquierda para elegir uno de 7 temas
     (Infancia [predeterminado: un salón recreativo al atardecer, con imagen de fondo], Arcade nocturno [oscuro], Azul Sega [azul vivo], Verde Game Boy, Gris y morado SNES [claro],
      Cartucho crema [claro], Rosa caramelo [claro]).
     Cambian el fondo, el texto y los botones; tu elección se recuerda.
     En el mismo panel está «Imagen de fondo»: elige una imagen de tu ordenador para mostrarla detrás de la lista
     de juegos de la derecha (no se mueve al desplazarte). Puedes poner una general y/o una distinta para cada
     plataforma (las que no tengan la suya usan la general). El control «Oscurecer» oscurece la imagen para que el
     texto se lea bien. Las imágenes solo se guardan en este navegador de este dispositivo.
     Mientras juegas, el espacio a los lados del juego muestra la misma imagen (oscurecida y difuminada), así los juegos
     verticales no quedan entre franjas negras; puedes desactivarlo en el mismo panel.
  7. Idioma: pulsa la bandera arriba a la izquierda (ver «Idioma de la interfaz» en la sección 8).

  - «Elegir la plataforma a mano»: juegos cuya plataforma no se reconoció. Elige una y el juego pasa a ese grupo.
  - «No compatible con la versión web»: juegos que la versión del navegador no puede ejecutar (por ejemplo
    Sega NAOMI). Juega a esos con RetroArch.
    ¿No quieres ver esta lista? Ábrela y pulsa «Ocultar esta lista» arriba a la derecha, o desmárcala en «⚙ Carpetas».

Los botones, las partidas guardadas, los estados guardados, la pantalla completa, etc. están en la barra de
menú bajo el juego. «Control Settings» muestra y cambia las teclas y también admite mandos.
Las partidas se guardan en el navegador; se pierden si cambias de navegador o borras sus datos.
Para hacer copia, usa «Export Save File» en el menú.

Trucos: en la barra de menú pulsa «Trucos» (Cheats) → «Añadir Truco» (Add Cheat), escribe el código y una descripción, envía
y márcalo para activarlo (otra vez para desactivarlo). El formato depende de la plataforma: Game Genie en NES, Action Replay /
GameShark en GBA, etc.; busca «<nombre del juego> trucos» en Internet. Algunos trucos necesitan reiniciar el juego para deshacerse del todo.
Al jugar en línea con otros jugadores, los trucos se desactivan solos y el botón se oculta; vuelven cuando juegas solo.

Biblioteca de trucos: arriba del menú «Trucos» (Cheats) pulsa «📚 Elegir de la biblioteca de trucos (libretro)». Busca los trucos de este juego
(de la base de datos de la comunidad libretro, libretro-database: muchos para NES, SNES, Mega Drive, GBA y otras consolas, casi ninguno
para arcade); marca los que quieras, pulsa «Añadir los trucos seleccionados» y márcalos en «Trucos» para activarlos.
Tampoco se pueden usar en el juego en línea. Requiere acceso a GitHub.


5. Teclado y mando
------------------
[Teclas predeterminadas] (jugador 1)

  Direcciones         W arriba   S abajo   A izquierda   D derecha
  Start               Intro
  Select / Moneda     V

  NES                 J = A    K = B
  Super Nintendo      J = A    K = B    I = X    L = Y    U = gatillo L    O = gatillo R
  Mega Drive / CD     fila de abajo J K L = A B C        fila de arriba U I O = X Y Z
  Arcade Neo Geo (King of Fighters, Metal Slug, Samurai Shodown, etc.)
                      J = A    K = B    I = C    L = D
                      U = A+B a la vez   O = C+D a la vez   (A+B+C y B+C+D no tienen tecla por defecto)
  Arcade (otros)      J K I L = botones 1 2 3 4    U O = botones 5 6
  Arcade (lucha de 6 botones: Street Fighter, Darkstalkers, Marvel)
                      Puño débil J   Puño medio K   Puño fuerte L
                      Patada débil U Patada media I Patada fuerte O
                      (los 3 puños / 3 patadas a la vez no tienen tecla por defecto)

  Pausa / continuar   Mayús derecha
  Turbo sí / no       T
  Reiniciar juego     V + Intro + U + O a la vez (los cartuchos multijuego vuelven al menú de juegos)
  Guardar estado 1    Cargar estado 2    Cambiar ranura 3
  (Avance rápido, cámara lenta y rebobinar no tienen tecla por defecto; asígnalas en «Control Settings»)

  - Los juegos arcade eligen su disposición según el nombre del archivo ROM. Ahora usan la de 6 botones:
      Street Fighter (sf), Street Fighter II' Champion Edition (sf2ce), Street Fighter Alpha 3 (sfa3),
      Street Fighter III 3rd Strike (sfiii3), Street Fighter EX2 Plus (sfex2p),
      Darkstalkers (dstlk), Night Warriors (nwarr), Vampire Savior 2 (vsav2)
    Los demás arcade (incluidos los de Neo Geo como KOF y Metal Slug) usan la disposición J K I L.
    Los nuevos juegos de Street Fighter, Darkstalkers y Marvel (X-Men, Marvel) también se detectan como de 6 botones.
  - Puedes cambiar las teclas en «Control Settings», en la barra de menú bajo el juego.

[Botones que aparecen en «Control Settings»]
  Los botones usan los nombres del mando original de cada plataforma, siempre en este orden:
    Moneda / Select → Start → direcciones → botones → combinaciones → guardar estado, avance rápido y otras funciones

  NES                 Select, Start, direcciones, A, B
  Super Nintendo      Select, Start, direcciones, A, B, X, Y, L, R
  Mega Drive / CD     MODE, Start, direcciones, A, B, C, X, Y, Z
  Arcade Neo Geo      Moneda, Start, direcciones, A, B, C, D
                      Combinaciones: A+B, C+D, A+B+C, B+C+D
  Arcade de lucha     Moneda, Start, direcciones, puño débil / medio / fuerte, patada débil / media / fuerte
                      Combinaciones: 3 puños a la vez, 3 patadas a la vez
  Arcade (otros)      Moneda, Start, direcciones, botones 1–6

  - Una combinación es una tecla que pulsa varios botones a la vez. Una Neo Geo real solo tiene A B C D;
    las combinaciones son un extra del emulador para hacer más fáciles los especiales y las esquivas
    (p. ej. A+B para esquivar y C+D para derribar en KOF).
  - Si un juego arcade es de Neo Geo o de lucha de 6 botones se decide por el nombre del archivo ROM y el título completo.
  - Los ajustes se guardan por juego: las teclas, filtros, etc. que cambies en un juego solo se aplican a ese
    juego y se vuelven a usar la próxima vez; los demás juegos mantienen las teclas de arriba.
  - Las partidas (incluidos los estados guardados) se guardan aparte de estos ajustes y no se afectan entre sí.
  - Los botones del mando no dependen de los ajustes de teclado de arriba: ver [Mando] más abajo.

[Mando]
Funcionan los mandos habituales: Xbox, PS4 / PS5, Switch Pro y la mayoría de mandos USB / Bluetooth.

  1. Conecta el mando al ordenador por USB o Bluetooth.
  2. Ya en el juego, pulsa primero cualquier botón del mando: el navegador solo lo detecta entonces
     (una norma de privacidad de los navegadores).
  3. Por defecto los botones siguen la convención de RetroArch (mando de Xbox; a la izquierda el botón del juego):
       NES / SNES   B → A (abajo)       A → B (derecha)   Y → X (izquierda)   X → Y (arriba)
       Mega Drive   A → X (izquierda)   B → A (abajo)     C → B (derecha)
       Neo Geo      A → A (abajo)       B → B (derecha)   C → X (izquierda)   D → Y (arriba)
       Lucha        Puño débil → X (izquierda)  Puño medio → Y (arriba)  Patada débil → A (abajo)  Patada media → B (derecha)
                    Puño fuerte → LB   Patada fuerte → RB
     (Los valores propios de EmulatorJS intercambian A y B en el mando; esta herramienta sigue a RetroArch.)
     Si un botón no está bien, abre «Control Settings» en la barra de menú bajo el juego y reasígnalo.
     Se admiten hasta 4 jugadores, cada uno con su mando. Los ajustes se guardan en el navegador.

  - Se recomienda Chrome o Edge, que son los que mejor admiten mandos.
  - En los arcade, moneda y start suelen ser Select / Vista y Start / Menú del mando.
  - Reiniciar el juego: pulsa a la vez Select + Start + LB + RB (Share + Options + L1 + R1 en PlayStation).
    Úsalo con los cartuchos multijuego de NES para volver al menú. Funciona en todas las plataformas.
  - El stick izquierdo funciona como la cruceta (pasado la mitad cuenta como pulsado; también diagonales),
    y puedes combinar ambos.
  - Turbo sí / no: pulsa el stick derecho hacia dentro (R3).
  - Elegir juegos sin ratón (mando, teclado o mando de la tele):
      Cruceta / stick izquierdo / flechas: moverse entre portadas y botones; A / Intro: confirmar (empezar un juego, pulsar un botón);
      B / Esc / Atrás del mando de la tele: volver o cerrar el panel abierto; LB / RB: plataforma anterior / siguiente;
      Start: abrir o cerrar la sala.
  - Menú del juego: mientras juegas, mantén Select + Start medio segundo (Atrás en el mando de la tele) para continuar,
    guardar estado, cargar estado, reiniciar, pantalla completa o salir. Jugando solo, el juego se pausa con el menú
    abierto; en línea no se pausa, y quienes se unieron no ven guardar, cargar ni reiniciar.

[Turbo]
  1. En un juego, pulsa «Ajustes de turbo» arriba y marca los botones que deben dispararse en ráfaga en este
     juego. Por ejemplo, en un shoot 'em up: marca el disparo pero no el botón de carga; así, al mantener el
     disparo se repite y al mantener la carga se carga con normalidad.
  2. Activar el turbo: pulsa «Activar turbo» en «Ajustes de turbo», o pulsa T en el teclado / R3 en el mando
     durante el juego. Mientras está activo, aparece «TURBO ON» arriba a la izquierda del juego y el botón
     cambia a «Turbo · activado».
  3. Marca «Activar el turbo al entrar en este juego» para que la próxima vez ya esté activo, sin pulsar T / R3.

  - Los ajustes se guardan por juego; configura cada juego una vez. Por defecto todos los botones están
    marcados y el turbo no se activa solo.
  - El turbo dispara unas 15 veces por segundo. Las direcciones, Start y Moneda no se ven afectados.
  - Funciona en todas las plataformas, con teclado y con mando.
  - Si las teclas no responden tras cerrar «Ajustes de turbo», haz clic una vez en la imagen del juego.


6. Ajustes arcade: menú de servicio, dificultad, vidas, modo Neo Geo
--------------------------------------------------------------------
Estos ajustes están en la barra de menú bajo el juego: «Settings» (icono de engranaje) → «Backend Core Options».
Tras cambiarlos, pulsa «Restart» en la barra de menú para aplicarlos. Se guardan por juego.

[Menú de servicio arcade (Test Mode)]
  Mantén Start (Intro) unos 2 segundos durante el juego para abrir el menú de servicio original de la placa,
  donde puedes cambiar dificultad, vidas, tiempo, continuaciones, etc. (las opciones dependen del juego).
  Puedes cambiar cómo se abre con «diagnostic input» en las opciones del núcleo, por ejemplo manteniendo Select.

[Dificultad y vidas (interruptores DIP)]
  Muchos juegos arcade fijan la dificultad y las vidas con los interruptores DIP de la placa.
  En las opciones del núcleo, busca elementos con «Dipswitch» en el nombre, por ejemplo:
    Difficulty (dificultad)   Lives (vidas)   Bonus Life (vida extra)
  Cada juego tiene interruptores distintos y algunos no tienen ninguno.

[Modos multijugador (3 o 4 jugadores)]
  - Captain Commando: la máquina viene en modo 2 jugadores; esta herramienta la pone en modo 4 jugadores por defecto
    («Dipswitch Play Mode» en las opciones del núcleo; ahí puedes volver a cambiarlo).
  - Knights of the Round, The King of Dragons, Mercs: vienen en modo 3 jugadores, no hay que cambiar nada.
  - Warriors of Fate, Cadillacs & Dinosaurs y otros juegos CPS1 con Q-Sound: el número de jugadores no es un DIP switch,
    sino un ajuste del menú de servicio. Si no puede entrar un tercer jugador, mira CONFIGURATION en el menú de servicio
    (mantén Start unos 2 segundos).
  - En línea, todos deben tener los mismos ajustes para el mismo juego (si no, verás avisos de desincronización),
    así que conviene que todos usen la última versión.

[Neo Geo: modo arcade / doméstico]
  Esta herramienta ejecuta por defecto los juegos de Neo Geo (KOF, Metal Slug, Samurai Shodown, etc.) en
  modo arcade (MVS, Europa/Asia):
    - Como en un salón recreativo: pulsa V para meter una moneda y luego Intro para empezar;
    - Mientras uno juega, otro puede meter una moneda y pulsar Start en cualquier momento para unirse
      (igual en las partidas en línea);
    - La dificultad, las vidas, etc. se ajustan en el menú de servicio arcade (ver arriba).
  Para cambiar a modo doméstico, busca «mode» (Neo-Geo mode) en las opciones del núcleo:
    MVS_EUR / MVS_USA / MVS_JAP  Versión arcade (Europa-Asia / EE. UU. / Japón), necesita monedas   ← predeterminado MVS_EUR
    AES_EUR / AES_JAP            Versión doméstica (inglés / japonés), sin monedas; dificultad y vidas en Option,
                                 en la pantalla de título
    DIPSWITCH                    El valor propio del juego (normalmente la versión arcade)
    UNIBIOS                      BIOS mejorada hecha por aficionados (trucos, cambio de región, etc.)
  Se recuerda por juego: si pones un juego en modo doméstico, seguirá así la próxima vez.
  En partidas en línea, todos necesitan el mismo modo para ese juego o verás que las pantallas se desincronizan.
  Nota: neogeo.zip debe contener el archivo BIOS correspondiente (un neogeo.zip completo de FBNeo suele tenerlo);
  si falta, el juego vuelve a su modo predeterminado.


7. Filtros (efectos de imagen)
------------------------------
En un juego, pulsa «Settings» en la barra de menú inferior → «Graphics Settings» → «Shaders» y elige uno:
verás el efecto al momento:

  CRT easymode       Televisor CRT antiguo con líneas de barrido, aspecto suave; buena opción para empezar
  CRT geom           Aspecto CRT con curvatura de pantalla y esquinas oscuras; el más parecido a una tele de tubo
  CRT aperture       Simula la rejilla de apertura, imagen nítida
  CRT mattias        Simula el ligero desenfoque y el sangrado de color de la señal de TV
  2xScaleHQ          Redondea y suaviza los bordes de los píxeles
  4xScaleHQ          Igual, con un suavizado más fuerte
  Disabled           Sin filtro, píxeles originales

  - Los filtros se guardan por juego: una vez elegido para un juego, se vuelve a usar la próxima vez;
    los demás juegos se configuran aparte.
  - Los filtros CRT se ven mejor a pantalla completa; en una ventana pequeña las líneas parecen demasiado densas.
  - En ordenadores antiguos, CRT geom puede ir a tirones; CRT easymode va más fluido.


8. Jugar juntos
---------------
[Juego en red local (ordenadores en la misma Wi-Fi / router)]
No hace falta pasarse direcciones: cada uno hace doble clic en EmulatorJS.command (Mac) o
EmulatorJS-Windows.bat (Windows). En la misma red local, «🕹 Jugando ahora», a la izquierda, muestra
quién juega a qué en los otros ordenadores; pulsa «Unirse» para entrar.

  · El juego en red local está activado por defecto. Si no quieres que te vean, pulsa «⚙ Carpetas» y
    desmarca «Juego en red local».
  · Mac: la primera vez, macOS puede preguntar si Python puede aceptar conexiones entrantes: elige «Permitir».
  · Windows: la primera vez aparece «¿Quieres permitir que esta aplicación haga cambios en el dispositivo?»:
    elige «Sí» (solo se pregunta una vez). Si elegiste «No», haz doble clic más tarde en
    «Enable-LAN-Windows.bat» en la carpeta y vuelve a abrir EmulatorJS.
  · Después de pulsar «Unirse» sigues jugando en tu propia página, con el mismo archivo de juego de tu
    ordenador. Si no tienes ese juego (o tu archivo es distinto), pasas automáticamente a jugar viendo la
    pantalla del otro.
  · Las partidas marcadas como «otro ordenador» se empezaron en otro ordenador; las demás, desde la biblioteca
    de este ordenador.
  · Los juegos de consola funcionan igual: si ves el juego en la lista, pulsa «Unirse» para jugar juntos.
  · Pulsa «Soy: …» para cambiar tu nombre; es el que ven los demás en la lista.
    Los nombres no pueden tener insultos ni otras palabras ofensivas, ni coincidir con el de alguien que
    esté jugando (sin distinguir mayúsculas, espacios ni símbolos). Un nombre con palabras ofensivas se
    cambia automáticamente a «Jugador» más un número.
    Las palabras bloqueadas están en data/badwords.json; edítalo con un editor de texto (una palabra por entrada).
    En el servidor de Internet está en /opt/emulatorjs-cloud/data/badwords.json; los cambios se aplican al
    momento, sin reiniciar.

Dispositivos sin EmulatorJS (tabletas, ordenadores de otras personas):
  Escribe en el navegador la dirección del ordenador que tiene EmulatorJS abierto (aparece en la barra
  lateral izquierda, p. ej. http://192.168.1.23:8765) para ver todos sus juegos y unirte, sin ROM.
  Estos dispositivos no pueden ver ni cambiar las carpetas de ese ordenador.
  Nota: los navegadores no permiten el micrófono en una página abierta así, así que no hay chat de voz
  (aunque puedes oír a los demás).

Cómo se conecta (se elige solo, no hay nada que configurar):
  · Sincronización de botones (experimental, preferida): quien se une ejecuta también el mismo juego en su
    ordenador y por la red solo viajan los botones pulsados en cada fotograma, la misma idea que el netplay
    de RetroArch. Cada ordenador dibuja su imagen, así que se ve nítida y casi no gasta ancho de banda.
    Al unirse desde «otro ordenador» se usa el mismo archivo de juego de tu ordenador; una página abierta
    con la dirección de red local lee el archivo del ordenador anfitrión, así que no necesitas la ROM.
    Para dar tiempo a que lleguen los botones, los de todos surten efecto unos fotogramas después
    (unos 2–3 en red local: casi no se nota).
    Cada 2 segundos se compara el estado del juego; si alguna vez difiere, el anfitrión envía a todos un
    estado guardado para volver a alinear. La imagen puede parpadear o saltar un instante; es normal.
  · Transmisión de vídeo: el ordenador anfitrión envía la imagen y el sonido en directo, y los botones de
    quien se une vuelven a él. Se usa automáticamente cuando quien se une no tiene el mismo archivo de juego.
  El anfitrión es el J1; quienes se unen son J2, J3 y J4, hasta 4 jugadores (si el juego lo admite).
  Cuántos pueden jugar depende de la plataforma: 2 en NES, PS1, Neo Geo, etc.; 4 en SNES, Mega Drive, N64, otros arcades
  y PC Engine; 1 en portátiles (GB / GBA / NDS / PSP, etc.). Si está lleno, aún puedes mirar.
  «2/2 jugadores · 👀 1» en «Jugando ahora» significa 2 jugadores ahora / 2 como máximo, y 1 persona mirando.
  Quienes se unen usan su teclado o mando con las mismas teclas que al jugar solos.
  En red local el retraso es muy bajo, pero una Wi-Fi débil provoca tirones; mejor que el anfitrión use cable.

Con la sincronización de botones, ten en cuenta:
  · El anfitrión pulsa Mayús derecha para pausar a todos; quienes se unen no pueden pausar.
  · Solo el anfitrión puede reiniciar el juego (Select+Start+L1+R1) o cargar partida; después, todos se
    sincronizan solos.
  · Junto al nombre de cada jugador se ve su retraso hasta el anfitrión (verde = rápido, amarillo = normal, rojo = lento;
    «Por relé» si pasa por el servidor). Lo ven todos. Si alguien sigue en rojo y frena a todos, el anfitrión puede echarlo
    en «👥 Sala».
  · El 📶 de arriba muestra la conexión: directa o por relé, el tiempo de ida y vuelta en ms y cuántos
    fotogramas se retrasan los botones (se ajusta solo). Si los números siguen altos, usa cable de red o pausa
    las descargas grandes. Todos deberían usar la última versión.
  · Todos deben quedarse en la página del juego. Si alguien cambia de ventana o minimiza, todos se quedan parados.
  · Si la conexión de alguien va lenta, todos se ralentizan y arriba aparece «Esperando la conexión de X…».
  · Si las pantallas se desincronizan una y otra vez, normalmente los ajustes de ese juego (opciones del
    núcleo, como el modo doméstico / arcade de Neo Geo o la dificultad) son distintos: igualadlos.
  · Probado con NES y Mega Drive. Otros sistemas deberían funcionar, pero no se han comprobado todos;
    los problemas se corrigen solos.

Dos formas de jugar juntos: retardo / rollback (solo con sincronización de botones; decide el anfitrión)
  Elige en «⚙ Carpetas» → «Modo de juego en red»; durante la partida también puedes cambiarlo en «👥 Sala».
  · Modo retardo (predeterminado, estable): lo descrito arriba. Los botones de todos actúan unos fotogramas
    después; todos ven siempre la misma imagen, sin saltos aunque la red sea mala.
  · Modo rollback (respuesta rápida, experimental): tus botones responden casi al instante (solo 2 fotogramas tarde).
    Mientras no llegan los botones del otro, el juego supone que sigue pulsando lo mismo que antes; cuando llegan
    y la suposición era incorrecta, carga un guardado rápido de hace unos fotogramas y los vuelve a jugar con los
    botones correctos en un instante. Por eso a veces verás que el personaje del otro "salta" a su sitio.
    La mayoría de los juegos de lucha en línea funcionan así.
    · Va mejor con una ida y vuelta de red por debajo de 100 ms; si es más lenta, los movimientos del otro
      saltarán a menudo y conviene el modo retardo.
    · Hace un guardado rápido extra en cada fotograma, así que los equipos deben ser lo bastante rápidos:
      si uno no puede, esa partida vuelve sola al modo retardo y te avisa.
    · Todos necesitan la versión nueva; si alguien tiene una antigua, esa partida usa el modo retardo.
    · Si un juego se desincroniza una y otra vez en modo rollback (3 veces en un minuto), también vuelve al modo retardo.
    · En modo rollback no se puede pausar; 📶 arriba muestra «Rollback». Al repetir fotogramas puede oírse
      algún pequeño fallo de sonido.

Móviles y ordenadores juntos (dispositivos lentos):
  Con la sincronización de botones todos avanzan fotograma a fotograma, así que el dispositivo más lento
  marca la velocidad. Los móviles mueven los juegos arcade (Neo Geo, etc.) más despacio que los ordenadores,
  así que esto pasa automáticamente:
  · Un móvil se une a la partida de un ordenador: el móvil juega viendo la pantalla. El juego corre en el
    ordenador, a su velocidad. En la pantalla del móvil aparecen una cruceta y botones.
  · Un ordenador se une a la partida de un móvil: primero se alinean las pantallas, después el juego pasa al
    ordenador y el móvil sigue jugando viendo la pantalla. Hay una pausa de uno o dos segundos.
    Los números de jugador no cambian (el móvil sigue siendo J1 y el ordenador J2).
  · Los juegos arcade, PS1, N64 y similares en móviles y tabletas siempre cuentan como «lentos»; los demás
    se juzgan por la velocidad medida, y lo mismo vale para ordenadores muy viejos y lentos.
  · Cuando un móvil juega solo a un arcade, el salto de fotogramas automático y una frecuencia de audio más
    baja vienen activados para que vaya más rápido (a veces no dibuja un fotograma; la velocidad del juego no cambia).

Si no quieres que se una nadie:
  Mientras juegas, pulsa el botón «Unirse: sí» de arriba para cambiarlo a «no». Nadie más podrá entrar y la
  lista mostrará «Sin unirse» (quienes ya estén dentro no se ven afectados).
  El valor predeterminado es el último que elegiste.
  Cuando alguien pulse tu partida, se le dirá que no permites unirse y podrá jugar solo.

Gestionar tu sala (👥 Sala):
  Durante la partida, pulsa «👥 Sala» arriba para ver a los jugadores y espectadores de tu sala:
  · Permitir espectadores: sí / no. Hasta 8 espectadores por partida, como máximo 2 viendo el vídeo
    (para cada espectador de vídeo tu ordenador comprime un vídeo aparte; si son muchos, tu partida va más lenta).
  · Solo jugadores registrados: si está activado, quien no haya iniciado sesión no puede unirse ni mirar
    (también en la red local; requiere el servidor de juego por internet).
  · Expulsar: pulsa dos veces (la segunda confirma). Esa persona no podrá volver a tus salas durante
    30 minutos; se la reconoce por cuenta, número de dispositivo y dirección de red (otras personas de la
    misma red también pueden quedarse fuera esos 30 minutos).
  · ♡: dale un me gusta a otro jugador (necesita tener cuenta).

Notas:
  · El anfitrión debe quedarse en la página del juego; cambiar de ventana o minimizar puede congelar la imagen.
  · Cuando el anfitrión sale del juego, la partida termina y se avisa a quienes se unieron.
  · Las partidas se guardan en el ordenador anfitrión. Turbo: con sincronización de botones se usan tus ajustes;
    con transmisión de vídeo, los del anfitrión.
  · El juego en red local solo funciona en la misma red; para amigos de otros sitios, mira abajo.

[Chat de voz]
  Mientras jugáis juntos, pulsa «🎤 Voz: no» arriba para activarlo y hablar con los demás (todos se oyen entre sí).
  · La primera vez, el navegador pide usar el micrófono: elige «Permitir». Se recuerda: si usaste la voz antes,
    se activa sola la próxima vez.
  · Desactivar la voz solo evita que los demás te oigan; tú los sigues oyendo.
  · Cuando alguien habla, se ilumina un anillo alrededor de su nombre arriba.
  · Se recomiendan mucho los auriculares: sin ellos, el micrófono recoge el sonido del juego y las demás voces
    y los devuelve como eco.
  · El micrófono solo funciona cuando EmulatorJS está abierto en tu propio ordenador (dirección 127.0.0.1);
    los navegadores no lo permiten en páginas abiertas con una dirección de red local, p. ej. en una tableta.

[Jugar con amigos de otros sitios (servidor de juego por Internet)]
Para jugar con amigos que no están en tu red necesitas un «servidor de juego» al que todos puedan llegar
(por ejemplo un servidor en la nube). Funciona igual que la red local: las partidas de tus amigos aparecen
en «Jugando ahora» (marcadas como «Internet»); pulsa «Unirse». El chat de voz también funciona.

Configura cada ordenador (una vez):
  «⚙ Carpetas» → «Servidor de juego por Internet»: escribe la dirección del servidor (p. ej. http://1.2.3.4:8765)
  y la contraseña de sala, pulsa «Guardar y probar» y listo cuando ponga que está conectado.
  Se guarda en config.json, en la carpeta de EmulatorJS: configúralo primero y luego envía la carpeta entera
  a tus amigos, que no tendrán que escribirlo.
  Ojo: config.json contiene la contraseña de sala, así que quien reciba la carpeta podrá entrar en tu servidor;
  envíala solo a gente de confianza. Si no quieres que se conecten directamente, borra config.json antes de
  comprimir la carpeta y que ellos escriban la dirección del servidor y la contraseña.

Puedes guardar varios servidores: escribe otra dirección y contraseña de sala y pulsa «Añadir y cambiar a él».
Cada servidor es una sala; se cambia con «🌐 Sala: …» bajo «Jugando ahora», a la izquierda. Cada sala muestra
la bandera del país o región del servidor, sus salas y cuánta gente hay conectada. Las cuentas, amigos y
estadísticas son de cada servidor: en otra sala tendrás que registrarte o iniciar sesión de nuevo.
Si no se puede conectar con la dirección o la contraseña de la sala no es correcta, se avisa al momento y el
servidor no se añade. Para cambiar la contraseña de un servidor, pulsa 🔑 a su lado, escribe la nueva y pulsa
«Guardar contraseña y cambiar aquí».

Notas:
  · Las partidas por internet muestran la bandera del país o región de la red del anfitrión (estimación
    aproximada por la IP), útil para prever el retraso.
  · Si no tienes el juego, «Unirse» te deja pedir la descarga al anfitrión: él elige «Permitir», «No permitir»
    o «Permitir siempre». El juego, sus 3 imágenes y la BIOS que te falte llegan directamente de su ordenador (no pasan por el servidor), se guardan
    en la carpeta del mismo sistema dentro de tu carpeta de ROM y luego te unes automáticamente.
  · Si no conecta o se corta: si a los 20 segundos de unirte no hay conexión, sales con un aviso; si en plena
    partida se corta 15 segundos, quien se unió sale y el anfitrión sigue jugando. Una VPN en cualquiera de
    los dos lados suele impedir la conexión o disparar el retraso.
  · Unirse por Internet usa el mismo archivo de juego de tu ordenador (sincronización de botones), así que
    todos necesitáis las mismas ROM (sin problema si usáis el mismo paquete de EmulatorJS).
    Quien no tenga el juego jugará viendo el vídeo, que gasta más ancho de banda del servidor.
  · Cuanto más lejos estéis, más fotogramas se retrasan los botones (se ajusta solo tras medir la conexión);
    los juegos de lucha pueden notarse algo pesados.
  · Cualquiera con la contraseña ve todas las partidas del servidor; para que nadie entre, desactiva «Unirse».

Montar el servidor de juego (una vez, lo hace quien tenga el servidor en la nube):
  Necesitas un servidor en la nube con Ubuntu 22.04 / 24.04 (basta con la instancia pequeña más barata).
  1. En el «Cortafuegos» de la consola de la nube, abre: TCP 8765, TCP 80, TCP 3478, UDP 3478, UDP 49160-49250.
     (El TCP 80 sirve para obtener un certificado https gratuito y cifrar contraseñas, etc.;
      el certificado se renueva solo cada 3 días.)
  2. Abre la terminal web con «Iniciar sesión» en la consola y sube «cloud-server/ejs-cloud-setup.sh» de la carpeta al servidor.
  3. En la terminal ejecuta: sudo bash ejs-cloud-setup.sh
     Para elegir tu propia contraseña: sudo bash ejs-cloud-setup.sh tucontraseña (solo letras y números)
     Si tienes un dominio (primero apúntalo a la IP del servidor con un registro A): sudo bash ejs-cloud-setup.sh tudominio
     p. ej. sudo bash ejs-cloud-setup.sh example.site. La dirección pasa a ser https://tudominio:8765;
     la IP antigua sigue funcionando y cada ordenador cambia solo al dominio al conectarse
     (si algún día cambia la IP del servidor, basta con actualizar el registro A del dominio).
  4. Al terminar muestra la dirección del servidor (empieza por https://) y la contraseña de sala:
     escríbelas en los ajustes de arriba.
     Una dirección http antigua no hace falta cambiarla: EmulatorJS pasa a https por sí solo y los ajustes
     muestran «🔒 Conexión cifrada».
  El servidor arranca solo tras un reinicio.
  Actualizar el servidor: tras actualizar EmulatorJS, sube de nuevo «cloud-server/ejs-cloud-setup.sh»
  (sustituyendo el anterior) y ejecuta sudo bash ejs-cloud-setup.sh. La contraseña no cambia; quienes estén
  jugando se desconectan un momento y solo tienen que volver a unirse.
  (Nota: esto sustituye el archivo de palabras bloqueadas del servidor por el nuevo; las palabras que
  añadiste en el servidor hay que añadirlas otra vez.)
  Administrar cuentas: en el terminal del servidor ejecuta sudo ejs-admin y elige un número del menú (en inglés):
    ver / buscar usuarios, restablecer una contraseña, cambiar el nombre, bloquear / desbloquear, eliminar una cuenta,
    ver / eliminar resultados de partidas.
    El menú 10 «Server limits» fija los límites del servidor: personas conectadas, salas y velocidad del relé.
    El menú 11 «Developer (admin) account» crea la cuenta exclusiva del administrador 开发者 o Developer: nadie
    puede registrar ni usar nombres que contengan esas palabras; al entrar con ella, tu nombre aparece
    resaltado en color y con 🛠 en la sala, las partidas y las clasificaciones.
  (Un usuario bloqueado no puede iniciar sesión y se le cierra la sesión al momento; eliminar una cuenta también borra
   sus amigos y resultados, y no se puede deshacer.)

[Sala]
  Pulsa «⤢ Sala» junto a «Jugando ahora», a la izquierda (en el móvil, toca 🕹 arriba a la derecha), para abrir
  la sala a pantalla completa:
  · «Jugando ahora»: todas las partidas en curso en la red local y en Internet. Busca por juego o jugador y
    filtra por «Se puede unir / Desafío / Lucha / Amigos / Red local / Internet». Puedes «Unirse» o «👀 Ver»
    cualquier partida (los espectadores solo miran, no controlan).
    Cada partida tiene una etiqueta: verde «Red local» si está en la misma Wi-Fi / router, azul «🌐 Internet» si
    está en el servidor de juego. Si una partida se ve de las dos formas, solo aparece la de red local (más rápida).
  · «🌐 Jugadores en línea»: todos los que están ahora en el servidor de Internet (quien tenga EmulatorJS abierto con este
    servidor), con bandera, nombre, si están registrados y a qué juegan o si están en la sala; puedes «Unirte» o «👀 Ver»
    su partida desde aquí. El botón «🌐 Sala» muestra p. ej. «37/200 en línea» (personas ahora / límite del servidor).
    Los servidores antiguos no lo muestran: su administrador debe volver a ejecutar el script de instalación.
  · «Amigos», «Clasificación», «Mis estadísticas»: primero tienes que iniciar sesión (ver abajo).

[Cuentas, amigos y estadísticas] (necesita el servidor de Internet)
  Puedes jugar, también en línea, sin registrarte; una cuenta añade estadísticas y amigos.
  · Registrarse: pulsa «Registrarse» arriba a la derecha de la sala, escribe un nombre (de 2 a 16 caracteres,
    sin palabras ofensivas) y una contraseña (al menos 6 caracteres) y elige tu región.
    Las cuentas se guardan en el servidor de Internet, así que puedes entrar desde otros ordenadores.
    Con la sesión iniciada, las partidas en línea usan el nombre y la región de tu cuenta (con bandera).
  · Amigos: en «Amigos», escribe el nombre de cuenta de la otra persona para enviar una solicitud; cuando
    la acepte, seréis amigos. Verás si tus amigos están conectados y a qué juegan, y podrás unirte o ver
    su partida con un clic.
  · Estadísticas: se registra solo a qué juegas, cuánto tiempo, cuántas veces en línea y con quién.
  · Resultados: tras una partida en línea, pulsa «🏆 Anotar resultado» arriba y elige al ganador.
    Los demás reciben una petición de confirmación; solo cuenta cuando todos pulsan «Sí, confirmar».
    Si alguien pulsa «No es correcto», el registro se descarta.
  · Campeón: con 10+ victorias y un 60%+ de victorias en un juego eres su campeón; tu nombre aparece en
    dorado con 👑 en la sala.
  · Me gusta: pulsa ♡ en la sala, tu lista de amigos, las estadísticas de un jugador o «👥 Sala» en una partida;
    vuelve a pulsar para quitarlo. «♥ Más queridos» en la Clasificación ordena por me gusta recibidos.
  · Desafío: en los juegos de lucha, el anfitrión puede pulsar «🥊 Desafío» arriba. La partida se coloca la
    primera en la sala con «se aceptan retos» y cualquiera puede venir a desafiarte.
  · Los móviles y tabletas que usan una página abierta con la dirección de red local también pueden iniciar
    sesión y ver las partidas de Internet: el ordenador anfitrión reenvía sus peticiones (ese ordenador
    necesita tener configurado el servidor de Internet).

[Idioma de la interfaz]
  Pulsa la bandera arriba a la izquierda para cambiar de idioma: 简体中文, 繁體中文, English, 日本語, 한국어,
  Español, Français, Deutsch, Português, Русский. Por defecto se usa el idioma del sistema.
  Los nombres de los juegos se muestran en inglés y, si existe, también en el idioma elegido.
  Las traducciones están en la carpeta data/i18n (data/names.json tiene los nombres de juegos); puedes editarlas.

Otras opciones:
  · Parsec (https://parsec.app), juego remoto: tu amigo se conecta a tu ordenador, ve tu pantalla y su mando
    pasa a ser un segundo mando en tu ordenador. No necesita ROM ni EmulatorJS.
  · Si los dos tenéis RetroArch, también podéis usar el netplay de RetroArch.


9. BIOS
-------
  NES, Super Nintendo, Mega Drive   No hace falta
  Sega Mega-CD                      Obligatoria: bios_CD_U.bin (EE. UU.), bios_CD_J.bin (Japón), bios_CD_E.bin (Europa)
  Arcade (FBNeo)                    Casi nunca; los juegos de Neo Geo (KOF, Metal Slug, etc.) necesitan neogeo.zip,
                                    los de PGM necesitan pgm.zip

  Sin la BIOS, al pulsar un juego de Sega CD aparece «Falta la BIOS: no se puede iniciar».
  Una vez configurada la carpeta de BIOS, arriba a la izquierda aparece algo como
  «BIOS encontrada: Sega Mega-CD / Sega CD (U/J)»; las letras indican de qué regiones tienes BIOS.


10. Problemas frecuentes
------------------------
  El juego se queda en negro al pulsarlo
    → Comprueba que la página se abrió con el archivo de inicio (la barra de direcciones muestra http://127.0.0.1
      o http://localhost) y no con doble clic en index.html (la barra muestra file://).

  Hacer doble clic en EmulatorJS.command no hace nada (Mac)
    → Puede que se perdiera el permiso de «ejecución» al copiarlo. Abre Terminal, escribe
         chmod +x
      (ojo al espacio final), arrastra EmulatorJS.command a la ventana de Terminal, pulsa Intro y vuelve
      a hacer doble clic.

  EmulatorJS.command no muestra el icono de mando en Mac
    → Al hacer doble clic una vez se pone el icono. Si sigue igual, cierra y vuelve a abrir la ventana del
      Finder (no siempre se actualiza enseguida). El archivo del icono es data/icon.png: no lo borres.

  En Windows no aparece el acceso directo «EmulatorJS»
    → Haz doble clic una vez en EmulatorJS-Windows.bat; el acceso directo se crea en la misma carpeta.
      Comprueba que data contiene icon.ico y que start-windows.ps1 está junto al .bat.

  Algunos juegos no arrancan
    → Algunos necesitan una BIOS (ver sección 9); algunos sets arcade se hicieron para otros emuladores y la
      versión web de FBNeo no puede ejecutarlos: juega a esos con RetroArch.

  ¿Dónde se guardan mis ajustes, mi cuenta y mis partidas?
    → Cuenta (nombre, amigos, estadísticas): en el servidor de Internet, así que puedes entrar desde cualquier
      ordenador o móvil; la contraseña solo se guarda cifrada.
      Ajustes (carpetas, dirección del servidor de Internet y contraseña de sala): en el config.json de cada dispositivo —
        Versión de carpeta (.command / .bat): config.json en la carpeta de EmulatorJS
        Aplicación de Windows: %APPDATA%\EmulatorJS\config.json
        Aplicación de Mac: ~/Library/Application Support/EmulatorJS/config.json
        Aplicación de Android: en los datos de la propia app (se borran al desinstalarla o borrar sus datos)
      Sesión, nombre de jugador, idioma, tema de colores, imagen de fondo, jugados recientemente, partidas y estados
      guardados: en el navegador (las aplicaciones de escritorio y Android, en sus propios datos). Cada dispositivo
      guarda lo suyo y nada se sube al servidor. Se pierden al cambiar de navegador, borrar sus datos o desinstalar
      la app; haz copia de las partidas con «Export Save File» en la barra de menú bajo el juego.


11. Derechos de autor
---------------------
EmulatorJS es software de código abierto (GPL-3.0, ver el archivo LICENSE). Puedes compartirlo gratis, pero no
usarlo con fines comerciales (el núcleo arcade FBNeo prohíbe el uso comercial).
Página del proyecto: https://github.com/EmulatorJS/EmulatorJS

Otro material que usa esta herramienta:
  - Imágenes de consolas: tema «Systematic» de RetroArch (libretro/retroarch-assets, de baxysquare y otros),
    licencia CC BY 4.0; licencia en data/consoles/LICENSE-CC-BY-4.0.txt.
    https://github.com/libretro/retroarch-assets
  - Botones del mando en pantalla del móvil: libretro common-overlays (gamepads/nes, snes, genesis, psx, arcade, gba,
    gameboy), con licencia CC BY 4.0; detalles y licencia en data/vpad/README.txt.
    https://github.com/libretro/common-overlays
  - Fuente pixelada del título: Press Start 2P (de CodeMan38), SIL Open Font License 1.1;
    licencia en data/fonts/LICENSE-OFL-1.1.txt.
  - Banderas: flag-icons (licencia MIT); licencia en data/flags/LICENSE-flag-icons-MIT.txt.
  - Nombres chinos de los juegos arcade: gamelistxml_Chinese_project (BSD-2-Clause); licencia en data/LICENSE-gamelistxml-BSD-2.txt.
  - Temas de color basados en parte en paletas de juegos de media.io (CRT Glow Arcade, Cartridge Desert, etc.) y
    en colores de consolas clásicas (el verde de la pantalla de Game Boy, el gris y morado de SNES, etc.),
    ajustados para que el texto se lea bien.
