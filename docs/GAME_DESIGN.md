# GAME_DESIGN — MARCOS: O Último Chamado

RPG 2D narrativo em pixel art, câmera top-down ortográfica, **mobile em paisagem** (telefone deitado).

## Plataforma e controles
- Paisagem em tela cheia. Celular em pé mostra "Gire o telefone para deitar a tela".
- No toque, a barra inferior do teclado some e entram joystick e botões; a missão começa recolhida.
- Toque: joystick (esquerda), botão **E** (direita), atalhos 🎒 📖 📜 🙏 ◆/🗺 ⏸. Teclado continua: WASD/setas, E, Espaço, I, J, P, M, L (missão lendária), R, ESC.

## Estrutura de conteúdo
- `ChapterDef` serve aos capítulos bíblicos (n 1–16) e aos **segmentos de história** (n ≥ 101, campo `story`).
- `getChapter(n)` (src/data/chapters/index.ts) resolve qualquer um dos dois.
- Segmentos: 101 Memória · 102 Abrigo · 103 Setor Refúgio · 104 Arena A-17 · 105 Caverna (missão oculta).
- `story.end`: `next` (vai para outro segmento), `neural` (sequência de conexão → Marcos 1), `letter` (carta de Abigail).

## Passos de missão (`StepDef.kind`)
talk · reach · scene · challenge · **use** (interagir com objeto do cenário; `label`, `gives`, `take`).

## Desafios
collect, deliver, crowd, plant, lamps, hotcold, waypoints, follow, trial, sequence, select, sort, balance, vigil e **stealth** (patrulhas com cone de visão e drones com holofote; ser visto volta ao início).

## Categorias de missão
- Principais: passos do capítulo/segmento.
- Secundárias: `side` (item pedido, recompensa).
- Ocultas: desbloqueadas por flags (ex.: `rastro` → O Rastro Esquecido).
- Lendárias: O Último Chamado (`legend`), painel próprio com fragmentos 0/16.

## Progressão
- PJ por capítulo bíblico (1.000 máx.), níveis por capítulos concluídos (1º título: Sobrevivente), conquistas.
- Fragmentos: Marcos 1 vem da caverna; Marcos 2–16 ao concluir cada capítulo (`addFragment`).
- Fé, salvação e relacionamento com Deus nunca viram pontuação; os pontos medem só a jornada no jogo.

## Persistência
LocalStorage (`marcos-jornada-save-v1`): progresso por capítulo/segmento, inventário, `story.flags`, `story.fragments`, `story.letters`. Autosave a cada ação e a cada 8 s.

## Verificações
- `npx tsx tools/checkmaps.ts` — pontos importantes dos mapas de história alcançáveis.
- `npx tsx src/data/ledger.test.ts` — corrente de itens dos capítulos.
- `tools/autotest.js` — piloto automático (`__runSegment`, `__autoUi`) para testes no navegador.
