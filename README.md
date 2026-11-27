# Marcos — A Jornada do Evangelho

RPG 2D em pixel art (Phaser 3 + TypeScript + React + Vite + Tailwind) pelos 16 capítulos do Evangelho de Marcos.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # versão de produção em dist/
```

## Controles
W A S D / setas: andar · E: interagir · Espaço: avançar diálogo · I: inventário · M: mapa · J: missões · P: pergaminhos/diário · R: orar · ESC: pausa.
No celular: joystick virtual e botões na tela.

## Estrutura
- `src/data/chapters/chXX.ts` — um arquivo de dados por capítulo (mapa, NPCs, falas, missões, desafio, pergaminhos, mensagem final, perguntas).
- `src/data/items.ts` — itens; cada personagem entrega um item usado num capítulo seguinte (`npx tsx src/data/ledger.test.ts` confere a corrente).
- `src/data/looks.ts` — aparências dos personagens (recolorização da skin de João Marcos).
- `src/game/` — motor: `scenes/WorldScene.ts` (mundo, missões, desafios, cenas, iluminação), `systems/Actor.ts`, `maps/` (mapa de referência + gerador de tilemaps), `gfx/` (recolorização e pixel art procedural).
- `src/ui/` — menus, HUD, diálogos, Mensagem do Capítulo, minijogos, diário, ranking, certificado.
- `src/core/` — estado, salvamento automático (LocalStorage), pontuação (PJ), níveis e conquistas.
- `src/audio/` — trilha e efeitos originais gerados por Web Audio.
- `public/assets/` — skin de João Marcos (`marcos_base.png` + máscara de regiões) e o cenário da Galileia.
- `tools/autotest.js` — piloto automático de testes para colar no console.

## Assets
Capítulos 1–5 usam o cenário enviado (`galileia.webp`) como camada de fundo, com colisões, água, fogo e cachoeira em camadas próprias. Os capítulos 6–16 usam tilemaps em pixel art gerados por código (provisórios): basta trocar as texturas para usar arte definitiva.

## Textos bíblicos
Baseados na tradução de João Ferreira de Almeida (edição de domínio público), com ortografia atualizada. Falas de Jesus aparecem apenas como citações com referência; demais falas são adaptações narrativas do jogo.

## Ranking
Sem servidor configurado, o ranking é local (por dispositivo). Supabase pode ser adicionado depois para ranking online.
