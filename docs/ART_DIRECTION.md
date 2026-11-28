# ART_DIRECTION

- **Retrato sempre.** Mapas novos preferencialmente verticais (Setor Refúgio: 40×64 células).
- Pixel art 16-bit, câmera top-down/¾, nearest-neighbor (`pixelArt: true`), personagens 32×48 recoloridos a partir da skin base.
- **Mundo real (referência enviada pelo usuário):** piso de pedra roxa molhada (`pavers`), reflexos verticais de neon no chão, bunker da Arena com túnel vermelho, estandartes com crânio de chifres, painel "ARENA CLANDESTINA A-17", letreiro gigante magenta com rosto holográfico ciano, barracas com toldo rasgado e luzinhas, placa neon de oficina, cruz neon ciano da resistência, cerca com neon vermelho, barril com fogo, guardas com visor vermelho, encapuzados, chuva, drones com holofote.
- Paleta: preto profundo, cinza industrial, vermelho sangue, roxo escuro, magenta neon, azul ciano, laranja de incêndio, verde tóxico pontual.
- **Simulação bíblica:** cores quentes, natureza, luz dourada; Galileia animada (água, cachoeira, fogueira, toldos, barcos, folhagem).
- **Memória da infância:** luz de fim de tarde (`warm`), música `memory`.
- Interface: madeira e pergaminho com detalhes dourados (como na referência) em todos os universos; telas do sistema em terminal ciano (alertas, conexão neural).
- Arte procedural em `src/game/gfx/` (`procgen.ts`, `procgenReal.ts`, `procgenPrint.ts`): substituível por sprites definitivos mantendo os nomes de textura.
