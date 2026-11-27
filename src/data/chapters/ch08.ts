import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc } from './common';

// Marcos 8 — Quem vocês dizem que Eu sou? (campos, Betsaida e caminhos de Cesareia de Filipe)
const ch: ChapterDef = {
  n: 8,
  title: 'Quem vocês dizem que Eu sou?',
  ref: 'Marcos 8',
  setting: 'Campos, Betsaida e Cesareia de Filipe',
  intro:
    'Outra grande multidão está com Jesus há três dias, sem ter o que comer. Desta vez há sete pães e alguns peixinhos. Depois, a estrada seguirá ao norte, até as aldeias de Cesareia de Filipe, onde Jesus fará a pergunta mais importante do Evangelho.',
  map: {
    kind: 'proc', w: 64, h: 70, base: 'grass', ambience: 'day', seed: 8,
    features: [
      { f: 'rect', tile: 'deep', x: 0, y: 24, w: 3, h: 28 },
      { f: 'rect', tile: 'water', x: 3, y: 24, w: 3, h: 28 },
      { f: 'rect', tile: 'sand', x: 6, y: 24, w: 2, h: 28 },
      { f: 'rect', tile: 'dirt', x: 8, y: 30, w: 20, h: 14 },
      { f: 'village', x: 8, y: 29, w: 20, h: 14, n: 5 },
      { f: 'blob', tile: 'grass2', x: 32, y: 58, r: 10 },
      { f: 'blob', tile: 'flowers', x: 20, y: 62, r: 3 },
      { f: 'blob', tile: 'flowers', x: 46, y: 60, r: 3 },
      { f: 'path', tile: 'dirt', pts: [[32, 66], [32, 50], [30, 40], [34, 28], [30, 18], [32, 8]], w: 3 },
      { f: 'path', tile: 'dirt', pts: [[30, 40], [22, 38]], w: 2 },
      { f: 'rect', tile: 'dgrass', x: 0, y: 0, w: 64, h: 20 },
      { f: 'blob', tile: 'rock', x: 12, y: 8, r: 7 },
      { f: 'blob', tile: 'rock', x: 52, y: 8, r: 8 },
      { f: 'rect', tile: 'cliff', x: 4, y: 0, w: 56, h: 2 },
      { f: 'blob', tile: 'water', x: 44, y: 14, r: 3 },
      { f: 'obj', o: 'bigrock', x: 24, y: 6 },
      { f: 'obj', o: 'bigrock', x: 40, y: 5 },
      { f: 'obj', o: 'altar', x: 32, y: 4 },
      { f: 'obj', o: 'well', x: 18, y: 36 },
      { f: 'scatter', o: 'tree', x: 36, y: 22, w: 26, h: 24, n: 14, on: ['grass'] },
      { f: 'scatter', o: 'olive', x: 0, y: 46, w: 20, h: 22, n: 8, on: ['grass'] },
      { f: 'scatter', o: 'palm', x: 6, y: 24, w: 2, h: 28, n: 5 },
      { f: 'scatter', o: 'bush', x: 0, y: 0, w: 64, h: 70, n: 22, on: ['grass', 'dgrass'] },
      { f: 'scatter', o: 'rock', x: 0, y: 0, w: 64, h: 22, n: 16, on: ['dgrass', 'rock'] },
      { f: 'scatter', o: 'flower', x: 0, y: 44, w: 64, h: 26, n: 22, on: ['grass', 'grass2'] },
    ],
  },
  cell: 16,
  spawn: [32, 64],
  music: 'pastoral',
  messageAt: [32, 12],
  zones: [
    { id: 'campos', name: 'Campos da multidão', at: [32, 58], r: 7 },
    { id: 'betsaida', name: 'Betsaida', at: [17, 36], r: 6 },
    { id: 'estrada', name: 'Estrada do norte', at: [32, 28], r: 4 },
    { id: 'cesareia', name: 'Aldeias de Cesareia de Filipe', at: [32, 8], r: 6 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [32, 55], { role: 'O Cristo' }),
    npc('faminta', 'Mãe da multidão', 'mulher', [27, 60], {
      gives: 'farinha', role: 'Seguia Jesus havia três dias',
      uses: [{ item: 'peixe_seco', lines: [say('faminta', 'Peixes secos! Meus filhos vão comer. "Tinham também uns poucos peixinhos" (Mc 8:7).')] }],
      lines: [say('faminta', 'Estamos aqui há três dias. Leve este pouco de farinha — sei que alguém pobre precisará dela no templo.')],
    }),
    npc('cego', 'O cego de Betsaida', 'cego', [17, 39], {
      gives: 'unguento', role: 'Curado em dois momentos',
      lines: [say('cego', 'Agora vejo tudo claramente, de longe e de perto! Leve este unguento para os olhos; um mendigo em Jericó vai se alegrar.')],
    }),
    npc('pedro', 'Pedro', 'pedro', [34, 9], {
      gives: 'cruz_madeira', role: 'Apóstolo',
      uses: [{ item: 'pedra', lines: [say('pedro', 'A pedra lisa do monte... Hoje entendi melhor o nome que Ele me deu.')] }],
      lines: [say('pedro', 'Entalhei esta pequena cruz de madeira depois do que Ele disse: "tome a sua cruz e siga-me". Leve-a com você.')],
    }),
    npc('v1', 'Viajante de Betsaida', 'viajante', [34, 34], {
      gives: 'bordao', role: 'Caminhante',
      lines: [
        say('v1', 'Muitos falam de Jesus pelo caminho. Segundo Marcos 8:28, quem alguns diziam que Ele era?'),
        { who: 'v1', text: 'Responda:', choices: [
          { text: 'João Batista', ok: true, reply: 'Isso! "Uns dizem: João Batista" (Mc 8:28). Leve meu bordão de viagem.' },
          { text: 'Moisés', ok: false, reply: 'Não é o que diz Marcos 8:28. Pense no profeta do Jordão...' },
          { text: 'Um general romano', ok: false, reply: 'Não! O povo o via como um profeta. Tente de novo.' },
        ] },
      ],
    }),
    npc('v2', 'Pastora do caminho', 'mulher2', [29, 24], {
      gives: 'ramo', role: 'Caminhante',
      lines: [
        say('v2', 'E que outro profeta o povo mencionava, segundo Marcos 8:28?'),
        { who: 'v2', text: 'Responda:', choices: [
          { text: 'Davi', ok: false, reply: 'Davi era rei. Pense no profeta que subiu num carro de fogo...' },
          { text: 'Elias', ok: true, reply: 'Correto! "Outros, Elias" (Mc 8:28). Leve este ramo de palmeira — um dia ele será erguido para um Rei.' },
          { text: 'Salomão', ok: false, reply: 'Não. Tente de novo.' },
        ] },
      ],
    }),
    npc('v3', 'Ancião da fonte', 'idoso', [36, 17], {
      gives: 'agua_fonte', role: 'Guardião da fonte',
      lines: [
        say('v3', 'Jesus perguntou aos discípulos: "Quem dizem os homens que eu sou?". Onde isso aconteceu, segundo Marcos 8:27?'),
        { who: 'v3', text: 'Responda:', choices: [
          { text: 'No templo de Jerusalém', ok: false, reply: 'Não foi em Jerusalém. Tente de novo.' },
          { text: 'No caminho, para as aldeias de Cesareia de Filipe', ok: true, reply: 'Exatamente! Leve esta água fresca da fonte; ela será bem-vinda numa subida difícil.' },
          { text: 'Num barco no mar', ok: false, reply: 'Não. Leia Marcos 8:27 e tente de novo.' },
        ] },
      ],
    }),
    npc('pescador', 'Pescador de Betsaida', 'pescador', [7, 32], { role: 'Pescador', lines: [say('pescador', 'O vento rasgou a vela do meu barco...')] }),
  ],
  steps: [
    {
      id: 'sete', title: 'Acompanhar a multiplicação dos sete pães', kind: 'talk', npc: 'jesus',
      hint: 'Jesus está no meio da multidão, nos campos ao sul.',
      lines: [
        say('jesus', 'Tenho compaixão da multidão, porque há já três dias que estão comigo, e não têm que comer.', 'Marcos 8:2'),
        narr('E perguntou-lhes: Quantos pães tendes? E disseram-lhe: Sete.', 'Marcos 8:5'),
        narr('E, tomando os sete pães e tendo dado graças, partiu-os e deu-os aos seus discípulos, para que os pusessem diante deles.', 'Marcos 8:6'),
      ],
      scene: [fx('crowd'), fx('sparkle'), N('E comeram e saciaram-se; e dos pedaços que sobejaram levantaram sete alcofas.', 'Marcos 8:8')],
    },
    {
      id: 'cestos', title: 'Desafio: recolher os sete cestos', kind: 'challenge', helpItem: 'migalhas',
      hint: 'Recolha os 7 cestos pelos campos em até 60 segundos.',
      challenge: { type: 'collect', label: 'Cestos recolhidos', icon: 'cesto', time: 60, at: [[22, 54], [26, 66], [38, 66], [44, 56], [40, 50], [24, 48], [16, 60]] },
    },
    {
      id: 'cego', title: 'Encontrar o cego de Betsaida', kind: 'talk', npc: 'cego',
      hint: 'Vá até a aldeia de Betsaida, a oeste, junto ao lago.',
      lines: [narr('E chegou a Betsaida; e trouxeram-lhe um cego, e rogaram-lhe que o tocasse.', 'Marcos 8:22')],
    },
    {
      id: 'cura', title: 'Acompanhar a cura do cego', kind: 'scene', at: [20, 39], r: 3,
      hint: 'Acompanhe Jesus e o cego até a saída da aldeia.',
      scene: [
        show('jesus', [21, 38]),
        N('E, tomando o cego pela mão, levou-o para fora da aldeia; e, cuspindo-lhe nos olhos e impondo-lhe as mãos, perguntou-lhe se via alguma coisa.', 'Marcos 8:23'),
        S('cego', 'Vejo os homens; pois os vejo como árvores que andam.', 'Marcos 8:24'),
        fx('sparkle'),
        N('Depois disto, tornou a pôr-lhe as mãos sobre os olhos, e ele, olhando firmemente, ficou restabelecido e já via ao longe e distintamente a todos.', 'Marcos 8:25'),
        hide('jesus'),
      ],
    },
    {
      id: 'opinioes', title: 'Desafio: o que dizem pelo caminho?', kind: 'challenge',
      hint: 'Converse com os 3 viajantes da estrada do norte e responda às perguntas.',
      challenge: { type: 'trial', npcs: ['v1', 'v2', 'v3'] },
    },
    {
      id: 'confissao', title: 'Ouvir a declaração de Pedro', kind: 'scene', at: [32, 9], r: 3,
      hint: 'Chegue às aldeias de Cesareia de Filipe, no extremo norte.',
      scene: [
        show('jesus', [32, 7]),
        S('jesus', 'Quem dizem os homens que eu sou?', 'Marcos 8:27'),
        N('E eles responderam: João Batista; e outros, Elias; mas outros, um dos profetas.', 'Marcos 8:28'),
        S('jesus', 'Mas vós, quem dizeis que eu sou?', 'Marcos 8:29'),
        S('pedro', 'Tu és o Cristo.', 'Marcos 8:29'),
      ],
    },
    {
      id: 'cruz', title: 'Compreender o que é tomar a cruz', kind: 'talk', npc: 'jesus',
      hint: 'Ouça o que Jesus ensina a todos sobre segui-lo.',
      lines: [
        say('jesus', 'Se alguém quiser vir após mim, negue-se a si mesmo, e tome a sua cruz, e siga-me.', 'Marcos 8:34'),
        say('jesus', 'Porque qualquer que quiser salvar a sua vida perdê-la-á, mas qualquer que perder a sua vida por amor de mim e do evangelho, esse a salvará.', 'Marcos 8:35'),
        say('jesus', 'Pois que aproveitaria ao homem ganhar todo o mundo e perder a sua alma?', 'Marcos 8:36'),
      ],
    },
  ],
  side: [
    {
      id: 'vela', title: 'A vela rasgada', giver: 'pescador', needs: 'vela_barco', needsFrom: 'Marcos 6',
      hint: 'Um pescador em Betsaida não consegue sair com o barco.',
      ask: [say('pescador', 'O vento rasgou a vela do meu barco. Sem um pano de vela não saio para pescar.')],
      thanks: [say('pescador', 'Que pano resistente! Leve este óleo para lâmpadas; quem vigia à noite precisa dele.')],
      reward: 'oleo_lampada',
    },
  ],
  scrolls: [
    { id: 's1', at: [52, 66], ref: 'Marcos 8:2', text: 'Tenho compaixão da multidão, porque há já três dias que estão comigo, e não têm que comer.' },
    { id: 's2', at: [10, 46], ref: 'Marcos 8:29', text: 'Mas vós, quem dizeis que eu sou? E, respondendo Pedro, lhe disse: Tu és o Cristo.' },
    { id: 's3', at: [56, 20], ref: 'Marcos 8:34', text: 'Se alguém quiser vir após mim, negue-se a si mesmo, e tome a sua cruz, e siga-me.' },
  ],
  message: {
    title: 'Reconhecer quem Jesus é e o custo do discipulado',
    summary:
      'Jesus alimentou outra multidão com sete pães e curou um cego em Betsaida em dois momentos — como os discípulos, que também enxergavam aos poucos. No caminho de Cesareia de Filipe, Pedro declarou: "Tu és o Cristo". Então Jesus ensinou que segui-lo é negar a si mesmo, tomar a cruz e caminhar com Ele.',
    verses: [
      { ref: 'Marcos 8:29', text: 'Mas vós, quem dizeis que eu sou? E, respondendo Pedro, lhe disse: Tu és o Cristo.' },
      { ref: 'Marcos 8:34', text: 'Se alguém quiser vir após mim, negue-se a si mesmo, e tome a sua cruz, e siga-me.' },
    ],
    reflection:
      'A pergunta de Jesus continua pessoal: "E você, quem diz que eu sou?". Não basta saber o que os outros pensam. E, como o cego de Betsaida, às vezes enxergamos aos poucos — Jesus continua tocando até vermos com clareza.',
  },
  quiz: [
    { q: 'Quantos pães havia na segunda multiplicação?', options: ['Cinco', 'Sete', 'Doze', 'Três'], correct: 1, explain: 'Marcos 8:5: "E disseram-lhe: Sete".' },
    { q: 'O que o cego de Betsaida viu depois do primeiro toque?', options: ['Nada', 'Homens como árvores que andam', 'Uma luz forte', 'Apenas cores'], correct: 1, explain: 'Marcos 8:24: "Vejo os homens; pois os vejo como árvores que andam".' },
    { q: 'O que Pedro respondeu quando Jesus perguntou "Quem dizeis que eu sou?"', options: ['"Tu és Elias"', '"Tu és o Cristo"', '"Tu és um profeta"', '"Tu és João Batista"'], correct: 1, explain: 'Marcos 8:29: "Tu és o Cristo".' },
  ],
};
export default ch;
