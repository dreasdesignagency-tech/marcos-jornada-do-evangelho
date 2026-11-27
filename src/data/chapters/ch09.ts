import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 9 — A glória revelada (alta montanha e vila ao pé do monte)
const ch: ChapterDef = {
  n: 9,
  title: 'A glória revelada',
  ref: 'Marcos 9',
  setting: 'Alta montanha e vila ao pé do monte',
  intro:
    'Seis dias depois da conversa em Cesareia de Filipe, Jesus chama Pedro, Tiago e João para subirem com Ele a um alto monte. Lá em cima, eles verão algo que nunca esquecerão.',
  map: {
    kind: 'proc', w: 48, h: 80, base: 'mountain', ambience: 'day', seed: 9,
    features: [
      { f: 'rect', tile: 'grass', x: 0, y: 60, w: 48, h: 20 },
      { f: 'rect', tile: 'dirt', x: 8, y: 64, w: 32, h: 14 },
      { f: 'village', x: 8, y: 62, w: 32, h: 6, n: 4 },
      { f: 'rect', tile: 'cliff', x: 0, y: 0, w: 3, h: 60 },
      { f: 'rect', tile: 'cliff', x: 45, y: 0, w: 3, h: 60 },
      { f: 'blob', tile: 'rock', x: 24, y: 8, r: 7 },
      { f: 'blob', tile: 'snow', x: 24, y: 3, r: 4 },
      { f: 'blob', tile: 'dgrass', x: 10, y: 44, r: 5 },
      { f: 'blob', tile: 'dgrass', x: 36, y: 34, r: 5 },
      { f: 'path', tile: 'dirt', pts: [[24, 76], [24, 64], [14, 56], [30, 46], [16, 36], [30, 26], [22, 16], [24, 8]], w: 3 },
      { f: 'rect', tile: 'cliff', x: 3, y: 50, w: 8, h: 2 },
      { f: 'rect', tile: 'cliff', x: 34, y: 40, w: 11, h: 2 },
      { f: 'rect', tile: 'cliff', x: 3, y: 30, w: 10, h: 2 },
      { f: 'rect', tile: 'cliff', x: 34, y: 20, w: 11, h: 2 },
      { f: 'obj', o: 'well', x: 32, y: 72 },
      { f: 'scatter', o: 'bigrock', x: 3, y: 6, w: 42, h: 54, n: 18 },
      { f: 'scatter', o: 'rock', x: 3, y: 6, w: 42, h: 54, n: 24 },
      { f: 'scatter', o: 'deadtree', x: 3, y: 10, w: 42, h: 46, n: 8 },
      { f: 'scatter', o: 'bush', x: 3, y: 30, w: 42, h: 50, n: 16 },
      { f: 'scatter', o: 'tree', x: 0, y: 60, w: 48, h: 20, n: 8, on: ['grass'] },
      { f: 'scatter', o: 'flower', x: 0, y: 60, w: 48, h: 20, n: 14, on: ['grass'] },
    ],
  },
  cell: 16,
  spawn: [24, 76],
  music: 'mystery',
  messageAt: [24, 66],
  zones: [
    { id: 'vila', name: 'Vila ao pé do monte', at: [24, 70], r: 6 },
    { id: 'encosta', name: 'Encosta rochosa', at: [22, 46], r: 6 },
    { id: 'passo', name: 'Passo das nuvens', at: [28, 26], r: 5 },
    { id: 'cume', name: 'Cume do monte', at: [24, 8], r: 4 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [24, 72], { role: 'O Filho amado' }),
    npc('pedro', 'Pedro', 'pedro', [22, 73], {
      gives: 'tenda', role: 'Apóstolo',
      uses: [{ item: 'agua_fonte', lines: [say('pedro', 'Água fresca da fonte de Cesareia! Era disso que eu precisava antes da subida.')] }],
      lines: [say('pedro', 'Eu quis fazer três cabanas lá em cima! Leve este pano de tenda; no Monte das Oliveiras ele vai lhe servir.')],
    }),
    npc('tiago', 'Tiago', 'tiago', [26, 73], { role: 'Apóstolo', lines: [say('tiago', 'Subiremos só nós, com o Mestre.')] }),
    npc('joao', 'João', 'joao', [27, 74], { role: 'Apóstolo', lines: [say('joao', 'Que caminho íngreme! Vamos juntos.')] }),
    npc('moises', 'Moisés', 'idoso', [21, 7], { showFrom: 'transfig', hideAfter: 'transfig', role: 'Apareceu na transfiguração' }),
    npc('elias', 'Elias', 'joaoBatista', [27, 7], { showFrom: 'transfig', hideAfter: 'transfig', role: 'Apareceu na transfiguração' }),
    npc('pai', 'Pai do menino', 'homem', [19, 69], {
      gives: 'candeia', role: 'Pai que pediu ajuda à sua incredulidade',
      lines: [say('pai', '"Eu creio, Senhor! Ajuda a minha incredulidade." Foi o que eu disse. Leve esta candeia: quem ora à noite precisa de luz.')],
    }),
    npc('menino', 'O menino curado', 'crianca2', [18, 70], {
      showFrom: 'ensinos', gives: 'pedrinha', role: 'Liberto por Jesus',
      lines: [say('menino', 'Jesus me tomou pela mão e me levantou! Toma esta pedrinha colorida — dá para outra criança, tá?')],
    }),
    npc('escriba', 'Escriba da vila', 'escriba', [29, 69], {
      gives: 'copo', role: 'Discutia com os discípulos',
      uses: [{ item: 'sal', lines: [say('escriba', 'Sal! Jesus disse: "Bom é o sal... Tende sal em vós mesmos, e paz uns com os outros" (Mc 9:50).')] }],
      lines: [say('escriba', 'Discutíamos com os discípulos quando o Mestre chegou. Leve este copo: Ele disse que até um copo de água dado em seu nome tem valor.')],
    }),
    npc('anciao', 'Ancião na encosta', 'idoso', [14, 54], { role: 'Peregrino idoso', lines: [say('anciao', 'Minhas pernas tremem nesta descida...')] }),
  ],
  steps: [
    {
      id: 'subir', title: 'Subir a montanha', kind: 'talk', npc: 'jesus',
      hint: 'Jesus está reunido com Pedro, Tiago e João na saída da vila.',
      lines: [
        narr('E seis dias depois Jesus tomou consigo a Pedro, a Tiago e a João, e os levou sós, em particular, a um alto monte.', 'Marcos 9:2'),
        say('marcos', 'O caminho é longo. Os marcos de pedra mostram a trilha — preciso acendê-los na ordem, sem perder tempo!'),
      ],
      scene: [hide('jesus')],
    },
    {
      id: 'trilha', title: 'Desafio: acompanhar Pedro, Tiago e João', kind: 'challenge',
      hint: 'Acenda os 6 marcos de pedra da trilha, em ordem, em até 70 segundos.',
      challenge: { type: 'waypoints', label: 'Marcos acesos', time: 70, at: [[24, 63], [15, 55], [29, 46], [17, 36], [29, 26], [22, 16]] },
    },
    {
      id: 'transfig', title: 'Vivenciar a transfiguração', kind: 'scene', at: [24, 9], r: 3,
      hint: 'Chegue ao cume do monte.',
      scene: [
        show('jesus', [24, 6]),
        show('pedro', [22, 10]),
        show('tiago', [26, 10]),
        show('joao', [24, 11]),
        fx('glow'),
        N('E transfigurou-se diante deles. E os seus vestidos tornaram-se resplandecentes, extremamente brancos como a neve.', 'Marcos 9:2-3'),
        show('moises'),
        show('elias'),
        N('E apareceu-lhes Elias com Moisés, e falavam com Jesus.', 'Marcos 9:4'),
        S('pedro', 'Mestre, bom é que nós estejamos aqui, e façamos três cabanas, uma para ti, outra para Moisés e outra para Elias.', 'Marcos 9:5'),
        fx('flash'),
        N('E desceu uma nuvem que os cobriu com a sua sombra, e saiu da nuvem uma voz, que dizia: Este é o meu Filho amado; a ele ouvi.', 'Marcos 9:7'),
        hide('moises'),
        hide('elias'),
        N('E, tendo olhado em redor, ninguém mais viram, senão só Jesus com eles.', 'Marcos 9:8'),
      ],
    },
    {
      id: 'descer', title: 'Descer até a multidão', kind: 'reach', at: [24, 68], r: 3,
      hint: 'Desça a trilha de volta até a vila: há uma discussão lá embaixo.',
      lines: [narr('E, quando se aproximou dos discípulos, viu ao redor deles grande multidão, e alguns escribas que disputavam com eles.', 'Marcos 9:14')],
      scene: [show('jesus', [22, 68]), show('pedro', [21, 70]), show('tiago', [26, 70]), show('joao', [27, 70])],
    },
    {
      id: 'paimenino', title: 'Acompanhar o encontro com o pai do menino', kind: 'talk', npc: 'pai',
      hint: 'Um pai aflito trouxe seu filho para ser ajudado.',
      lines: [
        say('pai', 'Se tu podes fazer alguma coisa, tem compaixão de nós e ajuda-nos.', 'Marcos 9:22'),
        say('jesus', 'Se tu podes crer, tudo é possível ao que crê.', 'Marcos 9:23'),
        say('pai', 'Eu creio, Senhor! Ajuda a minha incredulidade.', 'Marcos 9:24'),
      ],
      scene: [
        fx('sparkle'),
        N('Mas Jesus, tomando-o pela mão, o ergueu, e ele se levantou.', 'Marcos 9:27'),
      ],
    },
    {
      id: 'ensinos', title: 'Ouvir sobre fé, oração e humildade', kind: 'talk', npc: 'jesus',
      hint: 'Fale com Jesus: os discípulos querem entender o que aconteceu.',
      lines: [
        say('jesus', 'Esta casta não pode sair com coisa alguma, a não ser com oração e jejum.', 'Marcos 9:29'),
        narr('No caminho, os discípulos haviam discutido entre si qual era o maior.', 'Marcos 9:34'),
        say('jesus', 'Se alguém quiser ser o primeiro, será o derradeiro de todos e o servo de todos.', 'Marcos 9:35'),
        say('jesus', 'Qualquer que receber uma destas crianças em meu nome, a mim me recebe.', 'Marcos 9:37'),
      ],
    },
  ],
  side: [
    {
      id: 'cajado', title: 'Apoio na descida', giver: 'anciao', needs: 'cajado', needsFrom: 'Marcos 2',
      hint: 'Um ancião não consegue descer a encosta sem apoio.',
      ask: [say('anciao', 'Subi para orar, mas agora minhas pernas não me sustentam na descida. Se eu tivesse um cajado...')],
      thanks: [say('anciao', 'O cajado do homem que voltou a andar em Cafarnaum! Que história! Leve esta manta de lã: as noites de Páscoa em Jerusalém são frias.')],
      reward: 'manta',
    },
  ],
  scrolls: [
    { id: 's1', at: [40, 52], ref: 'Marcos 9:7', text: 'Este é o meu Filho amado; a ele ouvi.' },
    { id: 's2', at: [6, 40], ref: 'Marcos 9:23', text: 'Se tu podes crer, tudo é possível ao que crê.' },
    { id: 's3', at: [42, 76], ref: 'Marcos 9:35', text: 'Se alguém quiser ser o primeiro, será o derradeiro de todos e o servo de todos.' },
  ],
  message: {
    title: 'Grandeza no Reino é fé e serviço',
    summary:
      'No alto monte, Jesus foi transfigurado diante de Pedro, Tiago e João, e a voz do Pai disse: "Este é o meu Filho amado; a ele ouvi". Ao descer, encontraram um pai aflito que pediu ajuda para crer, e Jesus libertou seu filho. Depois, ensinou que o maior no Reino é aquele que serve.',
    verses: [
      { ref: 'Marcos 9:24', text: 'Eu creio, Senhor! Ajuda a minha incredulidade.' },
      { ref: 'Marcos 9:35', text: 'Se alguém quiser ser o primeiro, será o derradeiro de todos e o servo de todos.' },
    ],
    reflection:
      'Depois da montanha vem o vale. A glória do alto não nos tira do mundo real: nos envia de volta para servir. E a oração do pai é honesta e humana — podemos levar a Deus nossa fé e também nossas dúvidas.',
  },
  quiz: [
    { q: 'Quem apareceu conversando com Jesus no monte?', options: ['Abraão e Isaque', 'Elias e Moisés', 'Davi e Salomão', 'João Batista e Isaías'], correct: 1, explain: 'Marcos 9:4: "E apareceu-lhes Elias com Moisés, e falavam com Jesus".' },
    { q: 'O que disse a voz que saiu da nuvem?', options: ['"Descei do monte"', '"Este é o meu Filho amado; a ele ouvi"', '"Fazei três cabanas"', '"Ide a Jerusalém"'], correct: 1, explain: 'Marcos 9:7.' },
    { q: 'Segundo Jesus, quem quer ser o primeiro deve ser...', options: ['O mais forte', 'O servo de todos', 'O mais rico', 'O mais famoso'], correct: 1, explain: 'Marcos 9:35: "será o derradeiro de todos e o servo de todos".' },
  ],
};
addUse(ch, 'joao', 'bordao', [say('joao', 'Um bordão de viagem! Vai ajudar muito nesta subida.')]);
export default ch;
