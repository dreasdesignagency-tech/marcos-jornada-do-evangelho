import type { ChapterDef } from '../types';
import { narr, say, N, S, fx } from '../chapters/common';

// Missão oculta "O Rastro Esquecido" — caverna exclusiva de Elias, após Marcos 1.
const ch: ChapterDef = {
  n: 105,
  story: {
    world: 'sim',
    label: 'Missão oculta · O Rastro Esquecido',
    end: { kind: 'letter' },
    pendant: [38, 6],
    props: [
      { at: [12, 22], label: 'Olhar as marcas na pedra', lines: [narr('Riscos na rocha, como os que viajantes faziam para contar os dias. Ao lado, minúsculo, um peixe.')] },
      { at: [26, 12], label: 'Tocar a parede', lines: [
        { who: 'sistema', text: '…textura… ren̷der… inc0mpleta…' },
        say('marcos', 'A parede piscou. Como se a simulação não tivesse terminado de desenhar este lugar.'),
      ] },
    ],
  },
  title: 'O Rastro Esquecido',
  ref: 'Missão oculta · Lendária',
  setting: 'Caverna afastada · Deserto da Judeia (simulação)',
  intro: 'Uma caverna fora de qualquer caminho, que não aparece no mapa dos outros jogadores. O vento assobia lá dentro — e o pingente não para de vibrar.',
  map: {
    kind: 'proc', w: 44, h: 32, base: 'cavewall', ambience: 'cave', seed: 105,
    features: [
      // entrada com vegetação
      { f: 'rect', tile: 'sand', x: 0, y: 27, w: 16, h: 5 },
      { f: 'blob', tile: 'dgrass', x: 6, y: 29, r: 3 },
      // túneis
      { f: 'path', tile: 'cavefloor', pts: [[6, 28], [8, 23], [12, 20], [17, 21], [21, 17], [20, 12], [25, 10]], w: 3 },
      { f: 'path', tile: 'cavefloor', pts: [[17, 21], [27, 23], [33, 20], [32, 15]], w: 2 },
      { f: 'path', tile: 'cavefloor', pts: [[25, 10], [30, 12], [32, 15]], w: 2 },
      { f: 'path', tile: 'cavefloor', pts: [[32, 15], [36, 11], [38, 7]], w: 2 },
      { f: 'path', tile: 'cavefloor', pts: [[20, 12], [14, 8], [9, 6]], w: 2 },
      { f: 'blob', tile: 'cavefloor', x: 9, y: 6, r: 3 },
      { f: 'blob', tile: 'cavefloor', x: 38, y: 6, r: 4 },
      { f: 'blob', tile: 'cavefloor', x: 21, y: 15, r: 3 },
      { f: 'blob', tile: 'water', x: 10, y: 6, r: 1 },
      { f: 'blob', tile: 'water', x: 27, y: 23, r: 1 },
      { f: 'obj', o: 'bush', x: 3, y: 28 },
      { f: 'obj', o: 'bush', x: 11, y: 30 },
      { f: 'obj', o: 'reeds', x: 8, y: 30 },
      { f: 'obj', o: 'torch', x: 10, y: 21 },
      { f: 'obj', o: 'torch', x: 19, y: 12 },
      { f: 'obj', o: 'torch', x: 30, y: 21 },
      { f: 'obj', o: 'torch', x: 35, y: 12 },
      { f: 'obj', o: 'torch', x: 41, y: 6 },
      { f: 'obj', o: 'rock', x: 23, y: 18 },
      { f: 'obj', o: 'rock', x: 34, y: 15 },
      { f: 'obj', o: 'bigrock', x: 36, y: 5 },
      { f: 'obj', o: 'chest', x: 38, y: 6 },
      { f: 'obj', o: 'jar', x: 8, y: 7 },
    ],
  },
  cell: 16,
  spawn: [6, 29],
  music: 'mystery',
  zones: [
    { id: 'entrada', name: 'Entrada escondida', at: [7, 26], r: 3 },
    { id: 'galeria', name: 'Galeria dos ventos', at: [21, 15], r: 3 },
    { id: 'fundo', name: 'Câmara do fundo', at: [37, 7], r: 3 },
  ],
  npcs: [],
  steps: [
    {
      id: 'entrada', title: 'Entrar na caverna', hint: 'Siga para dentro, pela passagem entre as rochas.', kind: 'reach', at: [9, 22], r: 2,
      lines: [
        say('marcos', 'Ninguém mais parece ter vindo até aqui. Nem rastro de pegadas.'),
        { who: 'sistema', text: 'ÁREA NÃO LISTADA · visível apenas para: {nome}.' },
      ],
    },
    {
      id: 'seguir', title: 'Seguir a reação do pingente', hint: 'Quanto mais perto, mais o pingente reage. Siga a barra no topo da tela.', kind: 'reach', at: [32, 15], r: 2.2,
      lines: [
        narr('O pingente está quente. Pequenas faíscas digitais saem dele, como se quisesse apontar o caminho.'),
        say('marcos', 'Abi… se isso for coisa sua, eu estou chegando.'),
      ],
    },
    {
      id: 'caixa', title: 'Abrir a caixa escondida', hint: 'Entre as pedras da câmara do fundo.', kind: 'use', at: [38, 7], label: 'Abrir a caixa escondida', gives: 'pingente_digital',
      lines: [
        narr('Uma pequena caixa de madeira, escondida entre as pedras. Na tampa, a mesma pomba do pingente.'),
        narr('Dentro dela, uma réplica luminosa do pingente de Abigail… e um fragmento de luz pulsando suavemente.'),
      ],
      scene: [fx('flash'), N('O fragmento reconhece o pingente registrado na conexão.'), S('marcos', 'Isso… isso é dela.')],
    },
  ],
  side: [],
  scrolls: [],
  message: { title: '', summary: '', verses: [], reflection: '' },
  quiz: [],
};

export default ch;
