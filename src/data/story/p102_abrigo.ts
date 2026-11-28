import type { ChapterDef } from '../types';
import { narr, say, N, S, npc } from '../chapters/common';

// Prólogo · O mundo destruído — o abrigo da família, 12 anos depois.
const ch: ChapterDef = {
  n: 102,
  story: {
    world: 'real',
    label: 'Prólogo · O abrigo',
    end: { kind: 'next', to: 103 },
    rain: false,
    props: [
      { at: [14, 4], label: 'Examinar a prateleira', lines: [narr('Latas sem rótulo, um rádio sem pilhas, remédios vencidos há anos. Tudo contado, tudo dividido.')] },
      { at: [20, 4], label: 'Ouvir o rádio', lines: [
        { who: 'eden', text: '…cidadão, a ordem é segurança. Denuncie reuniões não autorizadas. A fé é um risco à harmonia coletiva. ÉDEN vê. ÉDEN protege…' },
        say('samuel', 'Desliga isso, filho. Já basta a chuva.'),
      ] },
      { at: [21, 16], label: 'Mover o armário', lines: [
        narr('Atrás do armário, alguém riscou na parede uma pequena cruz e uma frase: "A luz resplandece nas trevas."'),
        say('marcos', 'A letra da mamãe. Ela ainda tem coragem de escrever isso.'),
      ] },
    ],
  },
  title: '12 anos depois',
  ref: 'Setor Refúgio · Grande Tribulação',
  setting: 'Abrigo da família',
  intro: 'O mundo como conhecemos acabou. Cidades caíram, a fé foi proibida e um Sistema governa pela vigilância. A família de Elias sobrevive num abrigo improvisado no Distrito Externo.',
  map: {
    kind: 'proc', w: 30, h: 22, base: 'cwall', ambience: 'shelter', seed: 102,
    features: [
      { f: 'rect', tile: 'plank', x: 2, y: 3, w: 9, h: 8 },
      { f: 'rect', tile: 'plank', x: 11, y: 6, w: 1, h: 2 },
      { f: 'rect', tile: 'concrete', x: 12, y: 3, w: 12, h: 10 },
      { f: 'rect', tile: 'concrete', x: 24, y: 8, w: 5, h: 3 },
      { f: 'rect', tile: 'grate', x: 27, y: 8, w: 2, h: 3 },
      { f: 'rect', tile: 'concrete', x: 17, y: 13, w: 2, h: 1 },
      { f: 'rect', tile: 'plank', x: 13, y: 14, w: 10, h: 5 },
      { f: 'obj', o: 'bed', x: 3, y: 7 },
      { f: 'obj', o: 'photo', x: 8, y: 5 },
      { f: 'obj', o: 'locker', x: 9, y: 9 },
      { f: 'obj', o: 'backpack', x: 5, y: 10 },
      { f: 'obj', o: 'lamp', x: 6, y: 4 },
      { f: 'obj', o: 'shelf', x: 14, y: 4 },
      { f: 'obj', o: 'console', x: 20, y: 4 },
      { f: 'obj', o: 'table', x: 17, y: 8 },
      { f: 'obj', o: 'lamp', x: 15, y: 8 },
      { f: 'obj', o: 'generator', x: 22, y: 12 },
      { f: 'obj', o: 'cot', x: 14, y: 17 },
      { f: 'obj', o: 'cot', x: 16, y: 17 },
      { f: 'obj', o: 'shelf', x: 21, y: 16 },
      { f: 'obj', o: 'crate', x: 19, y: 18 },
      { f: 'obj', o: 'jar', x: 13, y: 12 },
      { f: 'obj', o: 'cables', x: 25, y: 10 },
      { f: 'obj', o: 'pipe', x: 25, y: 8, w: 3, solid: false },
    ],
  },
  cell: 16,
  spawn: [5, 8],
  music: 'dystopia',
  zones: [
    { id: 'quarto', name: 'Quarto de Elias', at: [6, 7], r: 3 },
    { id: 'sala', name: 'Sala comum', at: [18, 8], r: 4 },
    { id: 'deposito', name: 'Depósito', at: [17, 16], r: 3 },
  ],
  npcs: [
    npc('sara', 'Sara', 'sara', [16, 9], {
      face: 'down', role: 'Mãe de Elias. Ainda ora pela filha.', gives: 'racao',
      lines: [say('sara', 'Leve esta ração, filho. Se encontrar alguém com mais fome do que você… você sabe o que fazer.')],
    }),
    npc('samuel', 'Samuel', 'samuel', [21, 10], {
      face: 'left', role: 'Pai de Elias. Protetor, marcado pela perda.',
      lines: [say('samuel', 'Fique longe dos postos de controle. Os drones não piscam, Elias.')],
    }),
  ],
  steps: [
    {
      id: 'levantar', title: 'Levantar-se', hint: 'Acorde.', kind: 'scene',
      scene: [
        N('Chuva ácida batendo no teto de metal. O mesmo barulho de todas as noites.'),
        S('marcos', 'Sonhei com ela de novo… com a colina, com a árvore.'),
        S('marcos', 'Doze anos. Doze anos sem uma notícia.'),
      ],
    },
    {
      id: 'quarto', title: 'Examinar o quarto', hint: 'Veja o armário ao lado da cama.', kind: 'use', at: [9, 9], label: 'Examinar o armário',
      lines: [
        narr('No armário, roupas gastas e uma caixa de lata. Dentro dela, desenhos infantis: duas crianças embaixo de uma árvore. Um deles diz, com letra torta: "Abi e Eli para sempre".'),
      ],
    },
    {
      id: 'foto', title: 'Interagir com a fotografia da irmã', hint: 'O porta-retrato na mesinha.', kind: 'use', at: [8, 5], label: 'Olhar a fotografia', gives: 'foto_abigail',
      lines: [
        narr('Abigail aos dezessete anos, sorrindo no quintal da antiga casa. A moldura está gasta de tanto ser segurada.'),
        say('marcos', 'Todo mundo diz que você morreu. O pai nem fala mais o seu nome.'),
        say('marcos', 'Mas por que eu ainda sinto que você está em algum lugar?'),
      ],
    },
    {
      id: 'mae', title: 'Conversar com a mãe', hint: 'Sara está na sala comum.', kind: 'talk', npc: 'sara',
      lines: [
        say('sara', 'Bom dia, meu filho. Dormiu alguma coisa?'),
        say('marcos', 'Sonhei com a Abigail.'),
        say('sara', 'Eu também sonho. Todas as noites eu entrego sua irmã nas mãos de Deus… e todas as manhãs eu a entrego de novo.'),
        say('marcos', 'Mãe… e se ela não voltar?'),
        say('sara', 'Então eu continuo orando. Esperança não é certeza do que vai acontecer, Elias. É certeza de Quem segura o que vai acontecer.'),
      ],
    },
    {
      id: 'pai', title: 'Conversar com o pai', hint: 'Samuel está consertando o gerador.', kind: 'talk', npc: 'samuel',
      lines: [
        say('samuel', 'Esse gerador não dura mais uma semana. Como tudo aqui.'),
        say('marcos', 'Pai, o senhor acha que a Abigail…'),
        say('samuel', 'Não. Não começa. Sua irmã foi embora atrás de uma missão e o Sistema engole gente assim. Ela morreu, filho. Aceitar isso é o que nos mantém vivos.'),
        say('samuel', 'Eu já perdi uma filha. Não vou perder você para os mesmos fantasmas.'),
        narr('Samuel volta ao gerador. As mãos dele tremem.'),
      ],
    },
    {
      id: 'mochila', title: 'Pegar a mochila', hint: 'A mochila está no chão do seu quarto.', kind: 'use', at: [5, 10], label: 'Pegar a mochila', gives: 'mochila', take: true,
      lines: [narr('Elias coloca a mochila nas costas: lanterna, faca enferrujada, um cantil e o mapa do distrito riscado a lápis.')],
    },
    {
      id: 'pingente', title: 'Examinar o pingente', hint: 'O pingente de Abigail.', kind: 'scene',
      scene: [
        N('O pingente de metal, com a pomba gravada, ainda está no pescoço de Elias. Doze anos e ele nunca o tirou.'),
        S('marcos', '"Se algum dia você não conseguir mais me encontrar, nunca deixe de procurar a verdade."'),
        S('marcos', 'E se existir mesmo alguma coisa além desta realidade, Abi? Eu queria acreditar como você.'),
      ],
    },
    {
      id: 'sair', title: 'Buscar suprimentos na comunidade', hint: 'Saia pelo corredor à direita, em direção ao distrito.', kind: 'reach', at: [27, 9], r: 1.6,
      lines: [
        say('sara', 'Elias! Volte antes do toque de recolher. E… fique com Deus.'),
        narr('Elias sobe a escada de metal. Lá fora, o Setor Refúgio espera, encharcado de chuva e neon.'),
      ],
    },
  ],
  side: [],
  scrolls: [],
  message: { title: '', summary: '', verses: [], reflection: '' },
  quiz: [],
};

export default ch;
