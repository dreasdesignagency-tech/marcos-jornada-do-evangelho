import type { ChapterDef } from '../types';
import { narr, say, N, S, mv, hide, wait, npc } from '../chapters/common';

// Prólogo · Cena 01 — A memória. Elias criança, antes da Grande Tribulação.
const ch: ChapterDef = {
  n: 101,
  story: {
    world: 'memory',
    label: 'Prólogo · A memória',
    child: true,
    end: { kind: 'next', to: 102 },
    props: [
      { at: [9, 12], label: 'Olhar a casa', lines: [narr('A casa da família, quando ainda havia jardins, vizinhos e domingos tranquilos. A mãe deixou a janela aberta para o cheiro do pão.')] },
      { at: [24, 27], label: 'Olhar o lago', lines: [say('marcos', 'Abigail diz que, quando a gente joga uma pedra no lago, as ondas vão longe… igual a uma palavra boa.')] },
      { at: [37, 7], label: 'Tocar a árvore', lines: [narr('Na casca da velha árvore, duas iniciais entalhadas à faca: A e E. Embaixo, um pequeno peixe desenhado.')] },
    ],
  },
  title: 'Uma memória',
  ref: 'Antes de tudo',
  setting: 'Casa da família · 12 anos atrás',
  intro: 'Algumas lembranças continuam quentes, mesmo quando o mundo esfria. Esta é uma delas: a tarde em que tudo ainda parecia seguro.',
  map: {
    kind: 'proc', w: 46, h: 34, base: 'grass', ambience: 'warm', seed: 101,
    features: [
      { f: 'rect', tile: 'grass2', x: 0, y: 0, w: 46, h: 4 },
      { f: 'blob', tile: 'grass2', x: 36, y: 9, r: 7 },
      { f: 'path', tile: 'dirt', pts: [[10, 15], [16, 18], [24, 18], [30, 14], [35, 11]], w: 2 },
      { f: 'path', tile: 'dirt', pts: [[10, 15], [10, 22], [6, 30], [2, 33]], w: 2 },
      { f: 'path', tile: 'dirt', pts: [[16, 18], [22, 22], [24, 24]], w: 2 },
      { f: 'blob', tile: 'water', x: 26, y: 28, r: 3, rough: 0.2 },
      { f: 'blob', tile: 'flowers', x: 16, y: 11, r: 3 },
      { f: 'blob', tile: 'flowers', x: 32, y: 6, r: 2 },
      { f: 'blob', tile: 'flowers', x: 40, y: 22, r: 3 },
      { f: 'obj', o: 'house', x: 9, y: 12, w: 8, h: 5 },
      { f: 'obj', o: 'tree', x: 38, y: 8 },
      { f: 'obj', o: 'swing', x: 34, y: 9 },
      { f: 'obj', o: 'well', x: 15, y: 14 },
      { f: 'obj', o: 'bench', x: 31, y: 10 },
      { f: 'obj', o: 'reeds', x: 23, y: 27 },
      { f: 'obj', o: 'reeds', x: 29, y: 29 },
      { f: 'obj', o: 'fence', x: 2, y: 17 }, { f: 'obj', o: 'fence', x: 3, y: 17 }, { f: 'obj', o: 'fence', x: 4, y: 17 },
      { f: 'obj', o: 'fence', x: 5, y: 17 }, { f: 'obj', o: 'fence', x: 6, y: 17 },
      { f: 'obj', o: 'table', x: 5, y: 15 },
      { f: 'scatter', o: 'tree', x: 0, y: 20, w: 18, h: 14, n: 7, on: ['grass'] },
      { f: 'scatter', o: 'tree', x: 40, y: 0, w: 6, h: 34, n: 6, on: ['grass', 'grass2'] },
      { f: 'scatter', o: 'tree', x: 18, y: 0, w: 14, h: 5, n: 4, on: ['grass2'] },
      { f: 'scatter', o: 'bush', x: 0, y: 0, w: 46, h: 34, n: 16, on: ['grass'] },
      { f: 'scatter', o: 'flower', x: 0, y: 0, w: 46, h: 34, n: 30, on: ['grass', 'grass2'] },
      { f: 'scatter', o: 'sheep', x: 30, y: 16, w: 10, h: 8, n: 3, on: ['grass'] },
    ],
  },
  cell: 16,
  spawn: [12, 16],
  music: 'memory',
  zones: [
    { id: 'casa', name: 'Casa da família', at: [10, 15], r: 5 },
    { id: 'lago', name: 'O lago', at: [25, 26], r: 5 },
    { id: 'colina', name: 'A colina da árvore', at: [35, 10], r: 5 },
  ],
  npcs: [
    npc('abigail', 'Abigail', 'abigailJovem', [27, 24], { face: 'left', role: 'Irmã mais velha de Elias' }),
    npc('sara', 'Sara', 'sara', [7, 16], {
      role: 'Mãe de Elias e Abigail',
      lines: [say('sara', 'Elias, procure sua irmã antes que o sol se ponha. E não deixe ela te convencer a subir na árvore de novo!')],
    }),
    npc('samuel', 'Samuel', 'samuel', [14, 16], {
      role: 'Pai de Elias e Abigail',
      lines: [say('samuel', 'Sua irmã anda falando de viajar, de levar esperança para gente que perdeu tudo… Eu só queria que este mundo continuasse simples como este quintal.')],
    }),
  ],
  steps: [
    {
      id: 'encontrar', title: 'Encontrar Abigail', hint: 'Ela sempre se esconde perto do lago.', kind: 'talk', npc: 'abigail',
      lines: [
        say('abigail', 'Achei que você nunca ia me encontrar, pequeno explorador!'),
        say('marcos', 'Você sempre se esconde no mesmo lugar.'),
        say('abigail', 'Então vamos ver se você consegue me alcançar! Até a árvore da colina!'),
      ],
    },
    {
      id: 'brincar', title: 'Brincar com a irmã', hint: 'Corra atrás de Abigail até a colina — fique perto dela!', kind: 'challenge', at: [27, 24], r: 3,
      challenge: { type: 'follow', npc: 'abigail', path: [[25, 21], [24, 18], [28, 16], [31, 13], [33, 11]], radius: 4 },
      scene: [S('abigail', 'Ufa! Você está ficando rápido demais pra mim.')],
    },
    {
      id: 'lugar', title: 'Caminhar até o lugar especial', hint: 'O banco ao lado da velha árvore, no alto da colina.', kind: 'reach', at: [32, 11], r: 2,
      lines: [narr('Dali de cima dava para ver a casa, o lago e a estrada que sumia no horizonte. O sol dourava tudo.')],
    },
    {
      id: 'conversar', title: 'Conversar com Abigail', hint: 'Sente-se ao lado dela e converse.', kind: 'talk', npc: 'abigail',
      lines: [
        say('marcos', 'Abi… por que você fala tanto de Jesus ultimamente?'),
        say('abigail', 'Porque, quando tudo ficar escuro — e um dia pode ficar —, eu quero que você saiba onde está a luz.'),
        say('abigail', 'A Bíblia diz:', ),
        { who: 'abigail', text: 'Não te deixarei, nem te desampararei.', ref: 'Hebreus 13:5' },
        say('abigail', 'Esperança não é fingir que nada dói. É continuar firme porque Alguém permanece firme por nós.'),
        say('marcos', 'E se eu ficar com medo?'),
        say('abigail', 'Então você ora com medo mesmo. Deus não pede coragem primeiro. Ele pede confiança.'),
        say('abigail', 'Vem. A mamãe está chamando. Preciso contar uma coisa pra família.'),
      ],
      scene: [mv('abigail', [11, 18], 60), wait(200)],
    },
    {
      id: 'voltar', title: 'Retornar para casa', hint: 'Volte para casa. Abigail está esperando no portão.', kind: 'reach', at: [11, 18], r: 2.2,
      lines: [
        narr('No portão, uma mochila pronta. A mãe chorava em silêncio. O pai olhava para o chão.'),
        say('abigail', 'Eu preciso ir. Existem pessoas que ainda precisam ouvir sobre Jesus.'),
        say('marcos', 'Mas você vai voltar, não vai?'),
        say('abigail', 'Eu espero que sim. Mas, se algum dia você não conseguir mais me encontrar, nunca deixe de procurar a verdade.'),
        narr('Ela tira do pescoço um pequeno pingente de metal, com uma pomba gravada, e o coloca na mão de Elias.'),
      ],
      gives: 'pingente',
      scene: [
        S('abigail', 'Guarde isso. Enquanto estiver com você, eu também estarei.'),
        mv('abigail', [6, 29], 52),
        mv('abigail', [2, 33], 52),
        hide('abigail'),
        N('Abigail partiu pela estrada ao entardecer. A imagem começa a escurecer…'),
      ],
    },
  ],
  side: [],
  scrolls: [],
  message: { title: '', summary: '', verses: [], reflection: '' },
  quiz: [],
};

export default ch;
