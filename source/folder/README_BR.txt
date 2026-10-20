EmulatorJS – Guia de uso
================================

O EmulatorJS roda jogos retrô no navegador. Não precisa instalar o RetroArch nem estar conectado à internet.
Ele suporta mais de vinte plataformas, entre elas NES, Super Nintendo, Game Boy / GBA, N64, NDS,
Sega Mega Drive / Sega CD / 32X / Saturn, PS1, PSP, PC Engine e fliperama (FBNeo / MAME 2003).


1. O que tem na pasta
---------------------
  index.html              A página dos jogos (não abra com dois cliques)
  data/                   Emuladores e núcleos – não mexa aqui
  EmulatorJS.command      Inicializador para Mac
  EmulatorJS-Windows.bat  Inicializador para Windows
  start-windows.ps1       Script usado pelo inicializador do Windows; deixe junto do .bat
  Enable-LAN-Windows.bat  Permissão do Windows para jogo em rede local (aparece sozinha na primeira vez;
                          só dê dois cliques nele se na época você escolheu “Não”)
  cloud-server/           Script de instalação do servidor de jogo pela internet (só em servidor na nuvem, veja a seção 8)
  server.py               O pequeno servidor local usado pelo inicializador do Mac
  config.json             Criado na primeira vez que você salva as pastas; guarda as suas pastas
  EmulatorJS.lnk          Atalho com ícone de controle que o Windows cria na primeira execução
  LICENSE                 Licença de código aberto do EmulatorJS (GPL-3.0)
  README_BR.txt etc.      Este guia, um arquivo por idioma: CN 简体中文, HK 繁體中文, US English, JP 日本語,
                          KR 한국어, ES Español, FR Français, DE Deutsch, BR Português, RU Русский


2. Como abrir
-------------
[Aplicativo para computador (recomendado)]
  Se você não quer usar o navegador nem deixar uma janela de terminal aberta, use o aplicativo: dois cliques
  abrem a janela do jogo; fechar a janela sai.
  · Windows: EmulatorJS-Setup-versão.exe instala (você escolhe a pasta; cria atalhos no menu Iniciar e na área de trabalho);
    EmulatorJS-versão-win.zip não precisa instalar: descompacte onde quiser e dê dois cliques em EmulatorJS.exe.
    Se aparecer “O Windows protegeu o computador” na primeira vez: “Mais informações” → “Executar assim mesmo”.
    Quando o Windows perguntar sobre acesso à rede, marque “Redes privadas” e clique em “Permitir”
    (para jogar em rede local).
  · Mac: …-mac-apple-silicon.dmg para chips M1 / M2 / M3 / M4, …-mac-intel.dmg para chips Intel.
    Abra o dmg e arraste o EmulatorJS para “Aplicativos”.
    Na primeira vez aparece que o desenvolvedor não pode ser verificado: vá em Ajustes do Sistema → Privacidade e
    Segurança e clique em “Abrir Mesmo Assim”.
    Quando perguntar se pode procurar dispositivos na rede local ou usar o microfone, escolha “Permitir”
    (para jogar em rede local e o chat de voz).
  · Pastas de jogos: roms, thumbnails e system em “Documentos/EmulatorJS” e nos locais padrão do RetroArch são
    encontradas sozinhas, ou escolha em “⚙ Pastas”. Na primeira vez o aplicativo usa as configurações da sua
    pasta EmulatorJS antiga.
  · As configurações ficam na pasta de dados do aplicativo. EmulatorJS.command / EmulatorJS-Windows.bat
    continuam funcionando, e os dois podem jogar juntos.
  · O arquivo de configurações config.json (pastas, endereço do servidor de internet e senha da sala) fica em:
    Windows: %APPDATA%\EmulatorJS\config.json (digite %APPDATA%\EmulatorJS na barra de endereço do Explorador e tecle Enter)
    Mac: ~/Library/Application Support/EmulatorJS/config.json (no Finder, Shift+Command+G e cole o caminho)

[Celulares / tablets / Android TV (APK)]
  · Celulares, tablets, TVs e TV box: EmulatorJS-versão-android.apk.
    Emuladores de Android no PC (MuMu etc.): EmulatorJS-versão-android-x86_64.apk.
    Precisa do Android 7.0 ou mais novo. Se o “Android System WebView” da TV for muito antigo, o aplicativo avisa para atualizar.
  · Instalar: passe o apk para o celular / TV (cabo USB, pen drive ou aplicativo de mensagens) e toque nele num gerenciador de arquivos.
    Se o Android disser que não é permitido instalar apps desconhecidos, permita para esse gerenciador e toque no apk de novo.
    TV: copie o apk para um pen drive, conecte na TV e abra o apk com o gerenciador de arquivos da TV.
  · Na primeira vez, permita o acesso a fotos e arquivos (armazenamento), senão o aplicativo não consegue ler seus jogos.
    Depois ele cria “Armazenamento do aparelho / EmulatorJS” com as pastas roms, thumbnails e system.
  · Colocar jogos: ligue o celular ao computador com um cabo (escolha “Transferência de arquivos” no celular) e copie os jogos
    para EmulatorJS / roms, organizados igual ao computador (seção 3); capas em thumbnails, BIOS em system.
    Depois toque em “↻ Recarregar”. Os jogos também podem ficar em outro lugar: escolha as pastas em “⚙ Pastas”,
    que tem atalhos como “Armazenamento do aparelho” e “Downloads”.
  · Pen drive na TV: uma pasta EmulatorJS ou RetroArch (com roms etc.) na raiz do pen drive é encontrada sozinha,
    ou toque em “Pen drive / cartão de memória” em “⚙ Pastas”. Depois de trocar o conteúdo, toque em “↻ Recarregar”.
    O Android não deixa aplicativos gravarem em pen drives: jogos baixados de outros jogadores no jogo online ficam
    em “EmulatorJS / downloads” e aparecem junto com os do pen drive.
  · Controles:
    Celular: botões na tela, ou um controle Bluetooth / USB.
    TV: escolha o jogo com o controle remoto (setas para mover, OK para abrir, Voltar para voltar) e jogue com um controle.
    No jogo, Voltar no controle remoto ou no celular (ou segurar Select + Start no controle) abre o menu do jogo:
    continuar, salvar estado, carregar estado, reiniciar, tela cheia, sair do jogo.
    Na lista de jogos, aperte Voltar duas vezes para fechar o aplicativo.
  · Jogo online, saguão e contas funcionam igual ao computador, e dá para jogar junto com computadores
    (em rede local, use o mesmo Wi-Fi). O chat de voz pede o microfone na primeira vez: escolha “Permitir”.
  · TV box baratas são lentas: NES, SNES, GBA e Mega Drive rodam lisos; N64, PSP, NDS e Saturn podem travar.

[Mac]
  1. Dê dois cliques em EmulatorJS.command.
     Se na primeira vez aparecer que ele “não pode ser aberto porque é de um desenvolvedor não identificado”:
     clique com o botão direito → “Abrir” → “Abrir” de novo. Depois disso, dois cliques bastam.
  2. Uma janela do Terminal se abre e o navegador mostra a página dos jogos sozinho.
     Se o macOS pedir para instalar as “ferramentas de desenvolvedor de linha de comando”, clique em “Instalar” e,
     quando terminar, dê dois cliques no inicializador outra vez.
  3. Deixe a janela do Terminal aberta enquanto joga e feche só quando terminar.
  O inicializador ganha um ícone de controle automaticamente. Se o ícone sumir ao copiar a pasta, basta abrir
  uma vez para ele voltar.

[Windows]
  1. Dê dois cliques em EmulatorJS-Windows.bat.
     Se aparecer a tela azul “O Windows protegeu o computador”: “Mais informações” → “Executar assim mesmo”.
  2. Uma janela preta de comandos se abre e o navegador mostra a página dos jogos sozinho.
  3. Deixe essa janela aberta enquanto joga e feche só quando terminar.
  O Windows não deixa um arquivo .bat ter ícone. Por isso, depois da primeira execução aparece na pasta um
  atalho “EmulatorJS” com ícone. Use esse atalho daí em diante – pode arrastá-lo para a área de trabalho.
  Se você mover a pasta, o atalho para de funcionar; dois cliques no .bat criam um novo.

Por que a janela precisa ficar aberta?
  Nela roda um pequeno servidor web que só este computador acessa. Por segurança, os navegadores não deixam uma
  página aberta com dois cliques ler os arquivos do emulador – por isso a página é aberta por esse servidor.
  Ao fechar a janela, o servidor para.

[Atualizar para uma versão nova]
  · Ao abrir (e depois a cada 6 horas), o EmulatorJS verifica se há versão nova; se houver, um aviso mostra as novidades e
    ao lado do número da versão na barra da esquerda aparece “🆕 Nova versão”. Clique no número da versão para verificar
    quando quiser. Nada aparece enquanto você joga.
  · Versão instalada do Windows (com EmulatorJS-Setup-<versão>.exe): clique em “Atualizar automaticamente”. O novo instalador
    é baixado e conferido; depois clique em “Instalar agora”: o EmulatorJS fecha, instala a nova versão e abre de novo sozinho
    (cerca de meio minuto). Jogos, configurações e saves são mantidos.
    Se o download estiver muito lento (mais de uns 5 minutos) ou falhar, é oferecido o Baidu Netdisk.
  · Mac, versão zip do Windows, versão de pasta, Android: clique em “Baixar a nova versão” (ou Baidu Netdisk, melhor na China)
    e substitua a antiga como o aviso explica (Mac: arraste o novo EmulatorJS para Aplicativos e escolha “Substituir”;
    versão de pasta: copie os arquivos novos por cima da pasta antiga).
  · Downloads: https://github.com/supwang/emulatorjs-releases/releases
    Baidu Netdisk: https://pan.baidu.com/s/13atBCqmTib1rGp_30279mQ?pwd=6akk (código 6akk)
  · Não quer uma versão? Clique em “Pular esta versão”. A verificação só lê as informações de versão no site de download;
    nada é enviado.


3. Pastas de jogos (configure uma vez)
--------------------------------------
Ao abrir, a página lê três pastas sozinha, então você não precisa escolhê-las toda vez:

  Pasta de ROMs        A pasta principal com os seus jogos (obrigatória)
  Pasta de miniaturas  A pasta thumbnails do RetroArch (opcional, mostra as capas)
  Pasta da BIOS        Pasta com os arquivos de BIOS (opcional, só algumas plataformas precisam, veja a seção 9)

[Busca automática] As pastas não configuradas são procuradas nesta ordem e usadas na hora:
  1. Dentro da pasta do EmulatorJS (junto do EmulatorJS.command e do EmulatorJS-Windows.bat):
     as pastas roms, thumbnails e system (a pasta da BIOS também pode se chamar bios)
  2. Os locais padrão do RetroArch
     Mac: roms, thumbnails, system em ~/Library/Application Support/RetroArch/
     Windows: %APPDATA%\RetroArch, ou roms, thumbnails, system em RetroArch-Win64, RetroArch,
              Games\RetroArch-Win64 etc. nas unidades C:/D:/E:/F:
  Ou seja, se o seu RetroArch usa o local padrão, já dá para jogar na primeira vez.
  Para compartilhar, você também pode colocar as pastas roms, thumbnails e system direto na pasta do EmulatorJS –
  aí é só descompactar, abrir e jogar.

[Configurar manualmente] Clique em “⚙ Pastas” no canto superior esquerdo:
  1. Em cada item, clique em “Procurar…”, navegue até a pasta e clique em “Escolher esta pasta”.
     No alto há atalhos como “Pasta pessoal”, “Área de trabalho” e “RetroArch”.
     Você também pode colar o caminho de uma pasta.
  2. Clique em “Salvar e carregar jogos”. As configurações vão para o config.json e valem daqui em diante.
  - “Limpar” e salvar volta à busca automática.
  - Se uma pasta configurada não for mais encontrada (por exemplo, em outro computador), a busca automática volta
    a ser usada e a página de configuração avisa.

[Baixar imagens automaticamente]
  Para jogos sem capa, o EmulatorJS pode baixar capas, telas de título e capturas da coleção da comunidade libretro (libretro-thumbnails,
  a mesma do RetroArch) para a sua pasta de imagens (se não houver, cria uma pasta "thumbnails" ao lado da pasta de ROMs).
  · Na primeira vez que encontra jogos sem capa, ele pergunta; se aceitar, os jogos adicionados depois também recebem as imagens.
  · Ligue ou desligue em “⚙ Pastas” → “Baixar imagens automaticamente”, ou clique em “⬇ Baixar agora as imagens que faltam”.
  · As imagens são procuradas pelo nome do jogo (arcade pelo nome completo do FBNeo); nomes padrão estilo No-Intro funcionam melhor,
    nomes alterados ou traduzidos podem não ser encontrados.
  · Precisa de acesso ao GitHub. O progresso aparece no canto superior esquerdo e dá para “Parar” a qualquer momento. A coleção é
    reunida pela comunidade; as imagens pertencem às empresas dos jogos.

[Depois de adicionar jogos novos] Clique em “↻ Recarregar” no canto superior esquerdo – não precisa reabrir a página.

[Como os jogos novos são separados por plataforma]
  A plataforma de cada jogo é decidida nesta ordem; vale o primeiro passo que reconhecer:
  1. A plataforma registrada numa playlist do RetroArch (a ferramenta já vem com uma lista de jogos)
  2. Uma plataforma escolhida antes (depois de escolher uma vez em “Escolher a plataforma manualmente”, ela é lembrada)
  3. A extensão do arquivo: .nes .sfc .smc .md .gen .gba .gb .n64 .nds etc.
  4. O conteúdo do arquivo:
     - Arquivos compactados (.zip): o que tem dentro – por exemplo, um .sfc é Super Nintendo, um .md é Mega Drive
     - Imagens de disco / cartucho (.bin .iso .cue): a identificação no começo do arquivo, que reconhece
       Mega Drive, Sega CD, Saturn, PS1 e outros
  5. O nome da pasta: snes, md, fbneo, “Nintendo - Super Nintendo Entertainment System” etc.
  6. Um arquivo compactado sem nenhum formato de cartucho conhecido → é tratado como jogo de fliperama
  7. O que ainda ficar sem identificação (por exemplo .7z, .chd) vai para “Escolher a plataforma manualmente”;
     basta escolher uma vez
  Os jogos de fliperama também são conferidos com a lista oficial do FBNeo (mais de 8000): se o nome do arquivo
  não estiver nela (por exemplo cvs2.zip, da NAOMI), o FBNeo não roda e o jogo vai para “Não suportado na versão web”.
  Assim, mesmo com todo tipo de jogo misturado numa só pasta, a maioria cai na plataforma certa.
  Só o começo dos arquivos e o índice dos compactados são lidos, então é rápido; os resultados são lembrados e não
  precisam ser refeitos na próxima vez.

Dicas:
  - O ideal é uma subpasta por plataforma dentro da pasta de ROMs, como snes, md, nes, fbneo, ou nomes no estilo
    do RetroArch, como “Nintendo - Super Nintendo Entertainment System” – assim as plataformas são reconhecidas sozinhas.
  - Se no canto superior esquerdo aparecerem três botões como “Escolher pasta de ROMs” em vez de “⚙ Pastas”, a página
    foi aberta do jeito errado ou por uma janela antiga do inicializador: feche todas as janelas do Terminal / de
    comandos e abra de novo pelo inicializador.


4. Jogando
----------
  1. À esquerda fica a lista de plataformas, cada uma com uma imagem do console. Os jogos de Neo Geo têm um item
     próprio, “Neo Geo”; os demais jogos de fliperama ficam em “Arcade (FBNeo)”.
     Clique numa plataforma para ver à direita as capas de todos os jogos dela.
     “🕘 Jogados recentemente”, no topo, mostra os 10 últimos jogos deste computador; clique para jogar de novo.
     Para remover um: passe o mouse na capa e clique no ✕ do canto (controle: selecione e aperte X; teclado: Delete).
     “Limpar lista” remove todos.
     Ao passar o mouse sobre um jogo, as imagens se alternam: capa → tela-título → captura de tela. Os pontinhos
     embaixo da capa mostram quantas há e qual está aparecendo; ao tirar o mouse, fica a imagem atual.
     (Imagens que faltam são puladas; jogos com uma só imagem não alternam.)
     Tamanho das capas: escolha “P / M / G / XG” no canto superior direito da parede de capas. Cada plataforma
     guarda o seu próprio tamanho.
  2. Clique numa capa para começar o jogo.
  3. “Sair do jogo” no canto superior direito volta para a parede de capas.
  4. Use a caixa de busca para encontrar jogos pelo nome.
  5. Lá embaixo na barra lateral esquerda, “⌨ Atalhos” lista as teclas do teclado e do controle para ficha, Start,
     reiniciar, pausar, turbo, salvar / carregar estado e o menu de serviço do fliperama. Clique no título para
     recolher / expandir; a escolha é lembrada.
  6. Tema de cores: clique em 🎨 ao lado de “EmulatorJS” no canto superior esquerdo e escolha um dos 7 temas
     (Infância [padrão: um fliperama ao entardecer, com imagem de fundo], Fliperama noturno [escuro], Azul Sega [azul vivo], Verde Game Boy, Cinza e roxo SNES [claro],
      Cartucho creme [claro], Rosa doce [claro]).
     Fundo, texto e botões mudam juntos; a sua escolha é lembrada.
     No mesmo painel há “Imagem de fundo”: escolha uma imagem do computador para aparecer atrás da lista de jogos à
     direita (ela fica parada ao rolar). Dá para pôr uma geral e/ou uma diferente para cada plataforma (as que não
     têm a sua usam a geral). O controle “Escurecer” escurece a imagem para o texto ficar fácil de ler. As imagens
     ficam salvas só neste navegador deste aparelho.
     Durante o jogo, o espaço nas laterais mostra a mesma imagem (escurecida e desfocada), então jogos verticais não ficam
     entre faixas pretas; dá para desligar no mesmo painel.
  7. Idioma: clique na bandeira no canto superior esquerdo (veja “Idioma da interface” na seção 8).

  - “Escolher a plataforma manualmente”: jogos cuja plataforma não foi reconhecida. Escolha uma e o jogo passa
    para esse grupo.
  - “Não suportado na versão web”: jogos que a versão de navegador não consegue rodar (por exemplo, Sega NAOMI).
    Não quer ver esta lista? Abra e clique em “Ocultar esta lista” no canto superior direito, ou desmarque em “⚙ Pastas”.
    Jogue esses no RetroArch.

Botões, saves, estados salvos, tela cheia etc. ficam na barra de menu embaixo do jogo.
“Control Settings” mostra e muda as teclas, e também aceita controles.
Os saves ficam no navegador; você os perde se trocar de navegador ou apagar os dados de navegação.
Para fazer backup, use “Export Save File” no menu.

Cheats: na barra de menu clique em “Trapaças” (Cheats) → “Adicionar Trapaça” (Add Cheat), digite o código e uma descrição, envie
e marque para ligar (de novo para desligar). O formato depende da plataforma: Game Genie no NES, Action Replay / GameShark no GBA etc.;
procure “<nome do jogo> cheats” na internet. Alguns cheats só se desfazem totalmente reiniciando o jogo.
No jogo online com outros jogadores, os cheats desligam sozinhos e o botão some; voltam quando você joga sozinho.

Biblioteca de trapaças: no topo do menu “Trapaças” (Cheats), clique em “📚 Escolher da biblioteca de trapaças (libretro)”. As trapaças deste
jogo são procuradas (banco de dados da comunidade libretro, libretro-database: bastante para NES, SNES, Mega Drive, GBA e outros consoles,
quase nada para arcade); marque as desejadas, clique em “Adicionar as trapaças selecionadas” e marque-as em “Trapaças” para ativar.
Também não dá para usar no jogo online. Precisa de acesso ao GitHub.


5. Teclado e controle
---------------------
[Teclas padrão do teclado] (jogador 1)

  Direções            W cima   S baixo   A esquerda   D direita
  Start               Enter
  Select / ficha      V

  NES                 J = A    K = B
  Super Nintendo      J = A    K = B    I = X    L = Y    U = botão de ombro L    O = botão de ombro R
  Mega Drive / CD     fileira de baixo J K L = A B C        fileira de cima U I O = X Y Z
  Fliperama Neo Geo (The King of Fighters, Metal Slug, Samurai Shodown etc.)
                      J = A    K = B    I = C    L = D
                      U = A+B juntos    O = C+D juntos    (A+B+C e B+C+D não têm tecla por padrão)
  Fliperama (outros)  J K I L = botões 1 2 3 4    U O = botões 5 6
  Fliperama (luta com 6 botões, como Street Fighter, Darkstalkers, Marvel)
                      Soco fraco J     Soco médio K     Soco forte L
                      Chute fraco U    Chute médio I    Chute forte O
                      (3 socos / 3 chutes juntos não têm tecla por padrão)

  Pausar / continuar  Shift direito
  Turbo liga/desliga  T
  Reiniciar jogo      V + Enter + U + O ao mesmo tempo (cartuchos multijogos voltam ao menu de jogos)
  Salvar estado 1     Carregar estado 2       Trocar espaço de save 3
  (Acelerar, câmera lenta e voltar no tempo não têm tecla por padrão; defina em “Control Settings”)

  - Os jogos de fliperama escolhem as teclas pelo nome do arquivo da ROM. Hoje usam o esquema de 6 botões:
      Street Fighter (sf), Street Fighter II' Champion Edition (sf2ce), Street Fighter Alpha 3 (sfa3),
      Street Fighter III 3rd Strike (sfiii3), Street Fighter EX2 Plus (sfex2p),
      Darkstalkers (dstlk), Night Warriors (nwarr), Vampire Savior 2 (vsav2)
    Os outros jogos de fliperama (inclusive Neo Geo, como KOF e Metal Slug) usam o esquema J K I L.
    Jogos novos de Street Fighter, Darkstalkers e Marvel (X-Men, Marvel) também são reconhecidos como 6 botões.
  - Para mudar as teclas, use “Control Settings” na barra de menu embaixo do jogo.

[Botões mostrados em “Control Settings”]
  Os botões levam os nomes do controle original de cada plataforma, sempre nesta ordem:
    Ficha / Select → Start → direções → botões → combinações → salvar estado, acelerar e outras funções

  NES                 Select, Start, direções, A, B
  Super Nintendo      Select, Start, direções, A, B, X, Y, L, R
  Mega Drive / CD     MODE, Start, direções, A, B, C, X, Y, Z
  Fliperama Neo Geo   Ficha, Start, direções, A, B, C, D
                      Combinações: A+B, C+D, A+B+C, B+C+D
  Fliperama de luta   Ficha, Start, direções, soco fraco / médio / forte, chute fraco / médio / forte
                      Combinações: 3 socos juntos, 3 chutes juntos
  Fliperama (outros)  Ficha, Start, direções, botões 1–6

  - Uma combinação é um botão que aperta vários botões ao mesmo tempo. Um Neo Geo de verdade só tem A B C D;
    as combinações são um extra do emulador para facilitar golpes especiais e esquivas
    (por exemplo, A+B para esquivar e C+D para arremessar no KOF).
  - Se um jogo de fliperama conta como Neo Geo ou como luta de 6 botões é decidido pelo nome do arquivo da ROM
    e pelo título completo.
  - As configurações são salvas por jogo: teclas, filtros etc. que você mudar num jogo valem só nele e voltam na
    próxima vez; os outros jogos continuam com as teclas acima.
  - Os saves (inclusive estados salvos) ficam separados dessas configurações e não se afetam.
  - Os botões do controle não dependem das teclas do teclado acima – veja [Controle] abaixo.

[Controle]
Os controles comuns funcionam: Xbox, PS4 / PS5, Switch Pro e a maioria dos controles USB / Bluetooth.

  1. Conecte o controle ao computador por USB ou Bluetooth.
  2. No jogo, aperte primeiro qualquer botão do controle – só então o navegador o reconhece
     (uma regra de privacidade dos navegadores).
  3. Por padrão os botões seguem o RetroArch (controle de Xbox; à esquerda, o botão no jogo):
       NES / SNES   B → A (baixo)       A → B (direita)    Y → X (esquerda)   X → Y (cima)
       Mega Drive   A → X (esquerda)    B → A (baixo)      C → B (direita)
       Neo Geo      A → A (baixo)       B → B (direita)    C → X (esquerda)   D → Y (cima)
       Luta         Soco fraco → X (esquerda)  Soco médio → Y (cima)  Chute fraco → A (baixo)  Chute médio → B (direita)
                    Soco forte → LB   Chute forte → RB
     (De fábrica o EmulatorJS inverte A e B no controle; esta ferramenta segue o RetroArch.)
     Se algum botão não estiver certo, abra “Control Settings” na barra de menu embaixo do jogo e refaça.
     Até 4 jogadores, cada um com seu controle. As configurações ficam salvas no navegador.

  - Recomendamos Chrome ou Edge – neles os controles funcionam melhor.
  - Nos jogos de fliperama, ficha e Start costumam ser Select / Exibir e Start / Menu no controle.
  - Reiniciar jogo: Select + Start + LB + RB ao mesmo tempo (no PlayStation, Share + Options + L1 + R1).
    Serve para voltar ao menu de jogos dos cartuchos multijogos de NES. Funciona em todas as plataformas.
  - O analógico esquerdo funciona como o direcional (mais da metade do curso conta como apertado; diagonais
    também), e dá para misturar os dois.
  - Turbo liga / desliga: aperte o analógico direito (R3).
  - Escolher jogos sem mouse (controle, teclado ou controle remoto da TV):
      direcional / analógico esquerdo / setas: mover entre capas e botões; A / Enter: confirmar (começar um jogo, apertar um
      botão); B / Esc / Voltar do controle remoto: voltar ou fechar o painel aberto; LB / RB: plataforma anterior / próxima;
      Start: abrir ou fechar o saguão.
  - Menu do jogo: durante o jogo, segure Select + Start por meio segundo (Voltar no controle remoto da TV) para continuar,
    salvar estado, carregar estado, reiniciar, tela cheia ou sair. Jogando sozinho, o jogo pausa com o menu aberto;
    online ele não pausa, e quem entrou não vê salvar, carregar nem reiniciar.

[Turbo]
  1. No jogo, clique em “Configurar turbo” no alto e marque os botões que devem disparar rápido nesse jogo.
     Exemplo num jogo de tiro: marque o tiro e não marque o botão de carregar – segurando o tiro ele dispara
     rápido, e segurando o de carregar ele carrega normalmente.
  2. Ligar o turbo: em “Configurar turbo”, clique em “Ligar turbo”, ou no jogo aperte T no teclado / R3 no
     controle. Enquanto estiver ligado, aparece “TURBO ON” no canto superior esquerdo do jogo e o botão mostra
     “Turbo · ligado”.
  3. Marque “Ligar o turbo ao abrir este jogo” para ele já começar ligado da próxima vez – sem T / R3.

  - As configurações são salvas por jogo; basta configurar cada jogo uma vez. Por padrão todos os botões vêm
    marcados e o turbo não liga sozinho.
  - O turbo dispara umas 15 vezes por segundo. Direções, Start e ficha não são afetados.
  - Funciona em todas as plataformas, com teclado e com controle.
  - Se os botões não responderem depois de fechar “Configurar turbo”, clique uma vez na tela do jogo.


6. Ajustes do fliperama: menu de serviço, dificuldade, vidas, modo Neo Geo
-------------------------------------------------------------------------
Esses ajustes ficam na barra de menu embaixo do jogo: “Settings” (engrenagem) → “Backend Core Options”.
Depois de mudar, clique em “Restart” na barra de menu para valer. Eles são salvos por jogo.

[Menu de serviço do fliperama (Test Mode)]
  No jogo, segure Start (Enter) por uns 2 segundos para abrir o menu de serviço da placa.
  Lá você ajusta dificuldade, vidas, tempo, continues etc. (as opções dependem do jogo).
  Para mudar como ele abre, use “diagnostic input” nas opções do núcleo, por exemplo segurando Select.

[Dificuldade, vidas (chaves DIP)]
  Muitos jogos de fliperama ajustam dificuldade e vidas com chaves DIP na placa.
  Procure nas opções do núcleo os itens com “Dipswitch” no nome, por exemplo:
    Difficulty (dificuldade)   Lives (vidas)   Bonus Life (vida extra)
  Cada jogo tem chaves diferentes, e alguns não têm nenhuma.

[Modos multijogador (3 ou 4 jogadores)]
  - Captain Commando: a máquina vem de fábrica no modo 2 jogadores; esta ferramenta liga o modo 4 jogadores por padrão
    (“Dipswitch Play Mode” nas opções do núcleo, onde dá para voltar).
  - Knights of the Round, The King of Dragons, Mercs: já vêm no modo 3 jogadores, não precisa mudar nada.
  - Warriors of Fate, Cadillacs & Dinosaurs e outros jogos CPS1 com Q-Sound: o número de jogadores não é DIP switch,
    e sim uma configuração do menu de serviço. Se o terceiro jogador não conseguir entrar, veja CONFIGURATION no menu
    de serviço (segure Start por uns 2 segundos).
  - No jogo online, todos precisam das mesmas configurações para o mesmo jogo (senão aparecem avisos de dessincronização),
    então o melhor é todos usarem a versão mais nova.

[Neo Geo: modo fliperama / console doméstico]
  Esta ferramenta abre os jogos de Neo Geo (KOF, Metal Slug, Samurai Shodown etc.) no modo fliperama por padrão
  (MVS, Europa/Ásia):
    - Como no fliperama: coloque uma ficha com V e comece com Enter;
    - Enquanto alguém joga, outra pessoa pode colocar uma ficha e apertar Start a qualquer momento para entrar
      (online também);
    - Dificuldade, vidas etc. se ajustam no menu de serviço do fliperama (veja acima).
  Para o modo de console doméstico, procure “mode” (Neo-Geo mode) nas opções do núcleo:
    MVS_EUR / MVS_USA / MVS_JAP  Versão de fliperama (Europa-Ásia / EUA / Japão), com fichas   ← padrão MVS_EUR
    AES_EUR / AES_JAP            Versão doméstica (inglês / japonês), sem fichas; dificuldade e vidas em
                                 Option na tela-título
    DIPSWITCH                    O padrão do jogo (geralmente a versão de fliperama)
    UNIBIOS                      BIOS ampliada feita por fãs (trapaças, troca de região etc.)
  Isso é lembrado por jogo: um jogo no modo doméstico continua no modo doméstico da próxima vez.
  Online, todos precisam usar o mesmo modo nesse jogo, senão as telas saem de sincronia.
  Obs.: o neogeo.zip precisa ter a BIOS correspondente (um neogeo.zip completo do FBNeo costuma ter);
  se faltar, o jogo volta ao modo padrão.


7. Filtros (efeitos de imagem)
------------------------------
No jogo, clique em “Settings” → “Graphics Settings” → “Shaders” na barra de menu embaixo e escolha um –
o efeito aparece na hora:

  CRT easymode       TV de tubo antiga com linhas de varredura, imagem suave – bom para começar
  CRT geom           Visual de tubo com tela curva e cantos escuros, o mais parecido com uma TV antiga
  CRT aperture       Simula a grade da máscara de abertura, imagem nítida
  CRT mattias        Simula o leve desfoque e o vazamento de cor de um sinal de TV
  2xScaleHQ          Arredonda e suaviza as bordas dos pixels
  4xScaleHQ          O mesmo, com suavização mais forte
  Disabled           Sem filtro, pixels originais

  - Os filtros são salvos por jogo: escolhido uma vez, ele volta da próxima vez; os outros jogos você ajusta à parte.
  - Os filtros CRT ficam melhores em tela cheia; numa janela pequena as linhas ficam densas demais.
  - Em computadores mais antigos o CRT geom pode travar; o CRT easymode é mais leve.


8. Jogar junto
--------------
[Jogo em rede local (computadores no mesmo Wi-Fi / roteador)]
Não precisa mandar endereços: cada um dá dois cliques em EmulatorJS.command (Mac) ou EmulatorJS-Windows.bat
(Windows). Na mesma rede local, “🕹 Jogando agora” à esquerda mostra quem está jogando o quê nos outros
computadores – clique em “Entrar” para participar.

  · O jogo em rede local vem ligado. Quem não quiser ser visto clica em “⚙ Pastas” e desmarca “Jogo em rede local”.
  · Mac: na primeira vez o macOS pode perguntar se o Python pode aceitar conexões de rede – escolha “Permitir”.
  · Windows: na primeira vez aparece “Deseja permitir que este aplicativo faça alterações no seu dispositivo?” –
    escolha “Sim” (só pergunta uma vez). Se você escolheu “Não”, dê dois cliques depois em
    “Enable-LAN-Windows.bat” na pasta e abra o EmulatorJS de novo.
  · Depois de “Entrar”, você continua jogando na sua própria página, com o mesmo arquivo de jogo do seu computador.
    Se você não tiver o jogo (ou se o seu arquivo for diferente), joga automaticamente pela imagem do outro.
  · Jogos marcados com “outro computador” foram abertos em outro computador; os demais vêm da biblioteca deste.
  · Jogos de console funcionam igual: se o jogo aparecer na lista, clique em “Entrar”.
  · Em “Sou: …” você muda o seu nome; os outros veem esse nome na lista.
    Nomes não podem ter palavrões nem outras palavras ofensivas, nem ser igual ao de alguém jogando agora
    (maiúsculas, espaços e símbolos não contam).
    Um nome com palavras ofensivas vira automaticamente “Jogador” mais um número.
    As palavras bloqueadas estão em data/badwords.json – edite com um editor de texto (uma palavra por item).
    No servidor de jogo pela internet é /opt/emulatorjs-cloud/data/badwords.json; as mudanças valem na hora,
    sem reiniciar.

Aparelhos sem EmulatorJS (tablets, computadores de outras pessoas):
  Digite no navegador o endereço do computador que está rodando o EmulatorJS (aparece na barra lateral esquerda,
  por exemplo http://192.168.1.23:8765) – aí você vê todos os jogos desse computador e pode entrar, sem ROMs.
  Esses aparelhos não veem nem mudam as configurações de pastas do computador.
  Obs.: os navegadores não liberam o microfone em páginas abertas assim, então não há chat de voz
  (mas você ainda ouve os outros).

Como a conexão é feita (escolhida sozinha, nada para configurar):
  · Sincronização de botões (experimental, preferida): quem entra roda o mesmo jogo no próprio computador; pela
    rede só vão os botões apertados em cada quadro – o mesmo princípio do Netplay do RetroArch. Cada computador
    calcula a própria imagem, então ela fica nítida e quase não usa banda.
    Ao entrar num jogo de “outro computador”, é usado o mesmo arquivo de jogo do seu computador; uma página
    aberta pelo endereço de rede local lê o arquivo do jogo direto do computador anfitrião, então você não
    precisa da ROM.
    Para os botões chegarem a tempo, os botões de todos fazem efeito alguns quadros depois
    (na rede local, uns 2–3 quadros – quase imperceptível).
    A cada 2 segundos o estado do jogo é comparado; se divergir, o anfitrião manda um estado salvo para todos
    se realinharem. A imagem pode piscar ou pular por um instante – é normal.
  · Transmissão de vídeo: o computador anfitrião transmite imagem e som ao vivo, e os botões de quem entrou
    voltam para ele. É usada automaticamente quando quem entra não tem o mesmo arquivo de jogo.
  O anfitrião é o P1; quem entra vira P2, P3, P4 – até 4 jogadores (se o jogo suportar).
  Quantos podem jogar depende da plataforma: 2 no NES, PS1, Neo Geo etc.; 4 no SNES, Mega Drive, N64, outros fliperamas
  e PC Engine; 1 nos portáteis (GB / GBA / NDS / PSP etc.). Se estiver cheio, ainda dá para assistir.
  “2/2 jogadores · 👀 1” em “Jogando agora” quer dizer 2 jogadores agora / no máximo 2, e 1 pessoa assistindo.
  Quem entra usa o próprio teclado ou controle, com as mesmas teclas do jogo sozinho.
  Na rede local o atraso é bem pequeno, mas Wi-Fi fraco causa engasgos; o ideal é o anfitrião usar cabo.

Na sincronização de botões, atenção:
  · O anfitrião pausa para todos com Shift direito; quem entrou não pode pausar.
  · Só o anfitrião pode reiniciar o jogo (Select+Start+L1+R1) ou carregar um estado; depois todos são
    sincronizados sozinhos.
  · Ao lado do nome de cada jogador aparece o atraso até o anfitrião (verde = rápido, amarelo = ok, vermelho = lento;
    “Retransmitida” se passa pelo servidor). Todos veem. Se alguém continua vermelho e deixa todo mundo lento, o anfitrião
    pode tirá-lo em “👥 Sala”.
  · O 📶 no topo mostra a conexão: direta ou por retransmissão, o tempo de ida e volta em ms e quantos
    quadros os botões atrasam (ajustado sozinho). Se os números continuarem altos, use cabo de rede ou pause
    downloads grandes. Todos devem usar a versão mais recente.
  · Todos precisam ficar na página do jogo. Se alguém trocar de janela ou minimizar, todos travam.
  · Se a conexão de alguém engasgar, todos ficam mais lentos e aparece no alto “Aguardando a conexão de X…”.
  · Se as telas saírem de sincronia toda hora, geralmente as configurações desse jogo estão diferentes
    (opções do núcleo, como modo doméstico/fliperama do Neo Geo, dificuldade) – deixe iguais.
  · Testado com NES e Mega Drive. Outros sistemas devem funcionar, mas nem todos foram testados;
    os problemas são corrigidos sozinhos.

Dois modos de jogar junto: atraso / rollback (só com sincronização de botões; o anfitrião decide)
  Escolha em “⚙ Pastas” → “Modo de jogo em rede”; durante o jogo também dá para trocar em “👥 Sala”.
  · Modo atraso (padrão, estável): o modo descrito acima. Os botões de todos agem alguns quadros depois;
    todos sempre veem a mesma imagem, sem saltos mesmo com rede ruim.
  · Modo rollback (resposta rápida, experimental): seus botões respondem quase na hora (só 2 quadros de atraso).
    Enquanto os botões do outro não chegam, o jogo supõe que ele continua apertando o mesmo de antes; quando
    chegam e a suposição estava errada, carrega um save state de alguns quadros atrás e refaz esses quadros
    com os botões certos num instante. Por isso às vezes você verá o personagem do outro “pular” para o lugar certo.
    A maioria dos jogos de luta online funciona assim.
    · Melhor quando a ida e volta da rede fica abaixo de 100 ms; mais lento que isso, os movimentos do outro
      vão pular com frequência, e o modo atraso é melhor.
    · Faz um save state extra a cada quadro, então os computadores precisam ser rápidos o bastante: se um não
      der conta, a partida volta sozinha ao modo atraso e avisa.
    · Todos precisam da versão nova; se alguém tiver uma antiga, a partida usa o modo atraso.
    · Se um jogo ficar dessincronizado várias vezes no modo rollback (3 vezes em um minuto), a partida também
      volta ao modo atraso.
    · Não dá para pausar no modo rollback; o 📶 no alto mostra “Rollback”. Refazer quadros pode causar,
      de vez em quando, um pequeno chiado no som.

Celulares e computadores juntos (aparelhos lentos):
  Na sincronização de botões todos avançam quadro a quadro juntos, então o aparelho mais lento dita o ritmo.
  Celulares rodam fliperama (Neo Geo etc.) mais devagar que computadores, por isso acontece o seguinte, sozinho:
  · Um celular entra no jogo de um computador: o celular joga pela imagem transmitida. O jogo roda no computador,
    no ritmo dele. No celular aparecem um direcional e botões.
  · Um computador entra no jogo de um celular: primeiro as telas são alinhadas, depois o jogo passa para o
    computador e o celular continua jogando pela imagem. Há uma pausa de um ou dois segundos.
    Os números dos jogadores continuam os mesmos (o celular segue P1, o computador P2).
  · Fliperama, PS1, N64 e jogos parecidos em celulares e tablets são sempre tratados como “lentos”; os outros
    jogos são avaliados pela velocidade medida – o que vale também para computadores muito antigos e lentos.
  · Quando um celular joga fliperama sozinho, o pulo de quadros automático e uma taxa de amostragem de áudio
    menor vêm ligados para rodar mais rápido (de vez em quando um quadro não é desenhado; a velocidade do
    jogo não muda).

Se você não quiser que ninguém entre:
  No jogo, clique no botão “Entrada: ligada” no alto para mudar para “desligada”. Ninguém mais entra e a lista
  mostra “Sem entrada” (quem já está dentro continua).
  O padrão segue a sua última escolha.
  Se alguém clicar no seu jogo, será avisado de que a entrada está fechada e poderá jogar sozinho.

Gerenciar sua sala (👥 Sala):
  Durante o jogo, clique em “👥 Sala” no alto para ver os jogadores e espectadores da sua sala:
  · Permitir espectadores: ligado / desligado. Até 8 espectadores por partida, no máximo 2 pelo vídeo
    (para cada espectador de vídeo seu computador comprime um vídeo separado; muitos deles deixam seu jogo lento).
  · Só jogadores cadastrados: ligado, quem não entrou na conta não pode entrar nem assistir
    (também na rede local; precisa do servidor de jogo pela internet).
  · Tirar: clique duas vezes (o segundo clique confirma). A pessoa não pode voltar às suas salas por
    30 minutos; ela é reconhecida pela conta, número do aparelho e endereço de rede (outras pessoas da mesma
    rede também podem ficar de fora nesses 30 minutos).
  · ♡: dê uma curtida para outro jogador (ele precisa ter conta).

Observações:
  · O anfitrião precisa ficar na página do jogo; trocar de janela ou minimizar pode congelar a imagem.
  · Quando o anfitrião sai do jogo, a partida acaba e quem entrou é avisado.
  · Os saves ficam no computador anfitrião. Turbo: na sincronização de botões valem as suas configurações;
    na transmissão de vídeo, as do anfitrião.
  · O jogo em rede local só funciona na mesma rede; para amigos em outros lugares, veja abaixo.

[Chat de voz]
  Jogando junto, clique em “🎤 Voz: desligada” no alto para ligar e conversar com os outros (todos ouvem todos).
  · Na primeira vez o navegador pede o microfone – escolha “Permitir”. Isso é lembrado: se você já ligou a voz
    uma vez, ela liga sozinha da próxima vez.
  · Desligar só impede que os outros ouçam você; você continua ouvindo os outros.
  · Quando alguém fala, um anel acende em volta do nome dele no alto.
  · Recomendamos muito usar fones – senão o microfone capta o som do jogo e as vozes dos outros e devolve
    como eco.
  · O microfone só funciona com o EmulatorJS aberto no seu próprio computador (endereço 127.0.0.1); em páginas
    abertas por um endereço de rede local, como num tablet, os navegadores não liberam.

[Jogar com amigos em outros lugares (servidor de jogo pela internet)]
Para jogar com amigos fora da sua rede, vocês precisam de um “servidor de jogo” que todos alcancem
(por exemplo, um servidor na nuvem). Funciona como na rede local: os jogos dos amigos aparecem em
“Jogando agora” (marcados com “Internet”); clique em “Entrar”. O chat de voz também funciona.

Configurar cada computador (uma vez):
  “⚙ Pastas” → “Servidor de jogo pela internet”: digite o endereço do servidor (por exemplo http://1.2.3.4:8765)
  e a senha da sala, clique em “Salvar e testar” – pronto quando aparecer que está conectado.
  Isso fica salvo no config.json da pasta do EmulatorJS: configure primeiro e depois mande a pasta inteira aos
  amigos – eles não precisam digitar nada.
  Atenção: o config.json tem a senha da sala, então quem receber a pasta consegue entrar no seu servidor — mande só
  para quem você confia. Se não quiser que conectem direto, apague o config.json antes de compactar a pasta e deixe
  que eles digitem o endereço do servidor e a senha.

Dá para salvar vários servidores: digite outro endereço e senha de sala e clique em “Adicionar e trocar”.
Cada servidor é um saguão; troque em “🌐 Saguão: …” abaixo de “Jogando agora”, à esquerda. Cada saguão mostra
a bandeira do país ou região do servidor, as salas e quantas pessoas estão online. Contas, amigos e
estatísticas são separados por servidor: no outro saguão, cadastre-se ou entre de novo.

Observações:
  · As partidas pela internet mostram a bandeira do país ou região da rede do anfitrião (estimativa
    aproximada pelo IP), para ter uma ideia do atraso.
  · Quem não tem o jogo pode, ao clicar em “Entrar”, pedir o download ao anfitrião: ele escolhe “Permitir”,
    “Não permitir” ou “Sempre permitir”. O jogo, as 3 imagens de prévia e a BIOS que faltar vêm direto do computador dele (sem passar pelo servidor),
    são salvos na pasta do mesmo sistema dentro da sua pasta de ROMs e você entra automaticamente.
  · Sem conexão ou queda: se 20 segundos depois de entrar ainda não conectou, você sai com um aviso; se a
    linha cair por 15 segundos no meio da partida, quem entrou sai e o anfitrião continua jogando. VPN em
    qualquer um dos lados costuma impedir a conexão ou deixar o atraso muito alto.
  · Pela internet também é usado o mesmo arquivo de jogo do seu computador (sincronização de botões), por isso
    todos precisam das mesmas ROMs (sem problema usando o mesmo pacote do EmulatorJS).
    Quem não tem o jogo joga pelo vídeo – isso usa mais banda do servidor.
  · Quanto mais longe vocês estiverem, mais quadros os botões atrasam (ajustado sozinho depois de medir a
    conexão); jogos de luta ficam um pouco mais pesados.
  · Quem tem a senha vê todos os jogos no servidor; para não deixar ninguém entrar, desligue a entrada.

Montar o servidor de jogo (uma vez, por quem tem o servidor na nuvem):
  Você precisa de um servidor na nuvem com Ubuntu 22.04 / 24.04 (a instância menor e mais barata basta).
  1. No “firewall” do console da nuvem, libere: TCP 8765, TCP 80, TCP 3478, UDP 3478, UDP 49160-49250.
     (A TCP 80 serve para obter um certificado https gratuito, para senhas etc. irem criptografadas;
      o certificado se renova sozinho a cada 3 dias.)
  2. Pelo “Login” do console, abra o terminal web e envie ao servidor o “cloud-server/ejs-cloud-setup.sh” da pasta.
  3. No terminal, rode: sudo bash ejs-cloud-setup.sh
     Para definir a sua própria senha: sudo bash ejs-cloud-setup.sh suasenha (só letras e números)
     Se você tiver um domínio (antes, aponte-o para o IP do servidor com um registro A): sudo bash ejs-cloud-setup.sh seudominio
     por exemplo sudo bash ejs-cloud-setup.sh example.site. O endereço passa a ser https://seudominio:8765;
     o IP antigo continua funcionando, e cada computador troca sozinho para o domínio ao se conectar
     (se um dia o IP do servidor mudar, basta atualizar o registro A do domínio).
  4. No final aparecem o endereço do servidor (começa com https://) e a senha da sala – digite nas configurações
     acima.
     Um endereço http antigo não precisa ser trocado: o EmulatorJS passa para https sozinho e as configurações
     mostram “🔒 Conexão criptografada”.
  O servidor volta a funcionar sozinho depois de reiniciar.
  Atualizar o servidor: depois de atualizar o EmulatorJS, envie de novo o novo “cloud-server/ejs-cloud-setup.sh”
  (substituindo o antigo) e rode sudo bash ejs-cloud-setup.sh. A senha continua a mesma; quem estiver jogando cai
  por um instante e é só entrar de novo.
  (Obs.: isso troca o arquivo de palavras bloqueadas no servidor pelo novo; palavras que você acrescentou
  precisam ser adicionadas outra vez.)
  Gerenciar contas: no terminal do servidor, rode sudo ejs-admin e escolha um número no menu (em inglês):
    listar / buscar usuários, redefinir senha, renomear, banir / desbanir, excluir conta, listar / excluir resultados.
    O menu 10 “Server limits” define os limites do servidor: pessoas online, salas e velocidade da retransmissão.
    O menu 11 “Developer (admin) account” cria a conta exclusiva do administrador 开发者 ou Developer: ninguém
    pode cadastrar nem usar nomes com essas palavras; entrando com ela, seu nome aparece destacado em cores
    e com 🛠 no saguão, nas salas e nos rankings.
  (Um usuário banido não consegue entrar e é desconectado na hora; excluir uma conta apaga também os amigos e os
   resultados dela, sem volta.)

[Saguão]
  Clique em “⤢ Saguão” ao lado de “Jogando agora” à esquerda (no celular, em 🕹 no canto superior direito) para
  abrir o saguão em tela cheia:
  · “Jogando agora”: todos os jogos em andamento na rede local e na internet. Busque por nome de jogo ou jogador
    e filtre por “Abertas / Desafio / Luta / Amigos / Rede local / Internet”. Em cada jogo você pode “Entrar” ou
    “👀 Assistir” (quem assiste só olha, não controla).
  · “🌐 Jogadores online”: todos que estão agora no servidor de internet (quem está com o EmulatorJS aberto e este servidor
    configurado), com bandeira, nome, se é registrado e o que está jogando ou se está no saguão; dá para “Entrar” ou
    “👀 Assistir” direto daqui. O botão “🌐 Saguão” mostra p. ex. “37/200 online” (pessoas agora / limite do servidor).
    Servidores antigos não mostram isso: o administrador roda o script de instalação de novo para atualizar.
  · “Amigos”, “Ranking”, “Minhas estatísticas”: para isso é preciso entrar na conta primeiro (veja abaixo).

[Contas, amigos, estatísticas] (precisa do servidor de jogo pela internet)
  Dá para jogar – online inclusive – sem conta; a conta acrescenta estatísticas e amigos.
  · Cadastro: clique em “Cadastrar” no canto superior direito do saguão, digite um nome (2–16 caracteres, sem
    palavras ofensivas) e uma senha (pelo menos 6 caracteres) e escolha a sua região.
    As contas ficam no servidor de jogo pela internet, então você também pode entrar em outros computadores.
    Com a conta conectada, os jogos online usam o seu nome de conta e a sua região (como bandeira).
  · Amigos: em “Amigos”, digite o nome de conta da outra pessoa para mandar um pedido; quando ela aceitar, vocês
    viram amigos. Você vê se os amigos estão online e o que estão jogando, e pode entrar ou assistir com um clique.
  · Estatísticas: o que você joga, por quanto tempo, quantas vezes online e com quem são registrados sozinhos.
  · Resultados: depois de uma partida online, clique em “🏆 Registrar resultado” no alto e escolha o vencedor.
    Os outros recebem um pedido de confirmação; só vale quando todos clicarem em “Sim, confirmar”.
    Se alguém clicar em “Está errado”, o registro é descartado.
  · Campeão: com 10+ vitórias e pelo menos 60 % de aproveitamento num jogo, você é o campeão dele; o seu nome
    aparece dourado no saguão com 👑.
  · Curtidas: clique em ♡ no saguão, na lista de amigos, nas estatísticas de um jogador ou em “👥 Sala” no jogo;
    clique de novo para desfazer. “♥ Mais curtidos” no Ranking ordena pelas curtidas recebidas.
  · Desafio: em jogos de luta, o anfitrião pode clicar em “🥊 Desafio” no alto. O jogo fica então no topo do
    saguão com “desafiantes bem-vindos”, e qualquer um pode desafiar você.
  · Celulares e tablets que abriram uma página pelo endereço de rede local também podem entrar na conta e ver os
    jogos da internet: os pedidos deles passam pelo computador anfitrião (que precisa ter o servidor de jogo
    pela internet configurado).

[Idioma da interface]
  Clique na bandeira no canto superior esquerdo para trocar o idioma: 简体中文, 繁體中文, English, 日本語, 한국어,
  Español, Français, Deutsch, Português, Русский. O padrão é o idioma do sistema.
  Os nomes dos jogos aparecem em inglês, e também no idioma escolhido quando houver tradução.
  As traduções ficam na pasta data/i18n (data/names.json tem os nomes dos jogos); você pode editá-las.

Outras opções:
  · Parsec (https://parsec.app) para jogar remotamente: o seu amigo se conecta ao seu computador, vê a sua tela,
    e o controle dele vira um segundo controle no seu computador. Ele não precisa de ROMs nem do EmulatorJS.
  · Se os dois tiverem o RetroArch, também dá para usar o Netplay próprio dele.


9. BIOS
-------
  NES, Super Nintendo, Mega Drive   Não precisa
  Sega CD                           Obrigatória: bios_CD_U.bin (EUA), bios_CD_J.bin (Japão), bios_CD_E.bin (Europa)
  Fliperama (FBNeo)                 Geralmente não precisa; jogos de Neo Geo (KOF, Metal Slug etc.) precisam do
                                    neogeo.zip, jogos de PGM do pgm.zip

  Sem a BIOS, ao clicar num jogo de Sega CD aparece “BIOS ausente: não é possível iniciar”.
  Com a pasta da BIOS configurada, o canto superior esquerdo mostra algo como “BIOS encontrada: Sega CD (U/J)”;
  as letras mostram de quais regiões você tem BIOS.


10. Problemas comuns
--------------------
  O jogo fica com a tela preta depois de clicar
    → Veja se a página foi aberta pelo inicializador (a barra de endereço mostra http://127.0.0.1 ou
      http://localhost) e não com dois cliques no index.html (a barra de endereço mostra file://).

  Dois cliques no EmulatorJS.command não fazem nada (Mac)
    → Ao copiar, a permissão de “executável” pode ter se perdido. Abra o Terminal, digite
         chmod +x
      (com um espaço no final), arraste o EmulatorJS.command para a janela do Terminal, aperte Enter e dê dois
      cliques de novo.

  O EmulatorJS.command não mostra o ícone de controle no Mac
    → Dois cliques uma vez colocam o ícone. Se não mudar, feche a janela do Finder e abra de novo (o Finder nem
      sempre atualiza na hora). O arquivo do ícone é data/icon.png – não apague.

  No Windows não aparece o atalho “EmulatorJS”
    → Dê dois cliques uma vez em EmulatorJS-Windows.bat; o atalho é criado na mesma pasta.
      Veja se a pasta data tem o icon.ico e se o start-windows.ps1 está junto do .bat.

  Alguns jogos não abrem
    → Alguns jogos precisam de BIOS (veja a seção 9); alguns conjuntos de fliperama foram feitos para outros
      emuladores e não rodam na versão web do FBNeo – jogue esses no RetroArch.

  Onde ficam salvos minhas configurações, minha conta e meus saves?
    → Conta (nome, amigos, estatísticas): no servidor de internet, então dá para entrar de qualquer computador ou
      celular; a senha só é guardada criptografada.
      Configurações (pastas, endereço do servidor de internet e senha da sala): no config.json de cada aparelho —
        Versão de pasta (.command / .bat): config.json na pasta do EmulatorJS
        Aplicativo para Windows: %APPDATA%\EmulatorJS\config.json
        Aplicativo para Mac: ~/Library/Application Support/EmulatorJS/config.json
        Aplicativo Android: nos dados do próprio app (apagados ao desinstalar ou limpar os dados do app)
      Login, nome de jogador, idioma, tema de cores, imagem de fundo, jogados recentemente, saves e estados salvos:
      no navegador (os aplicativos de computador e Android guardam nos próprios dados). Cada aparelho guarda os seus,
      nada é enviado ao servidor. Somem se você trocar de navegador, limpar os dados dele ou desinstalar o app;
      faça backup dos saves com “Export Save File” na barra de menu embaixo do jogo.


11. Direitos autorais
---------------------
O EmulatorJS é software de código aberto (GPL-3.0, veja o arquivo LICENSE). Você pode compartilhá-lo de graça,
mas não usá-lo comercialmente (o núcleo de fliperama FBNeo proíbe uso comercial).
Página do projeto: https://github.com/EmulatorJS/EmulatorJS

Outros materiais desta ferramenta:
  - Imagens dos consoles: tema “Systematic” do RetroArch (libretro/retroarch-assets, de baxysquare e outros),
    licença CC BY 4.0; texto da licença em data/consoles/LICENSE-CC-BY-4.0.txt.
    https://github.com/libretro/retroarch-assets
  - Fonte de pixel do título: Press Start 2P (de CodeMan38), SIL Open Font License 1.1;
    texto da licença em data/fonts/LICENSE-OFL-1.1.txt.
  - Bandeiras: flag-icons (licença MIT); texto da licença em data/flags/LICENSE-flag-icons-MIT.txt.
  - Nomes chineses dos jogos de fliperama: gamelistxml_Chinese_project (BSD-2-Clause); texto da licença em data/LICENSE-gamelistxml-BSD-2.txt.
  - Temas de cores em parte baseados nas paletas de jogos do media.io (CRT Glow Arcade, Cartridge Desert etc.) e
    nas cores clássicas dos consoles (verde da tela do Game Boy, cinza e roxo do SNES etc.), ajustados para o
    texto ficar legível.
