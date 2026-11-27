import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc } from './common';

// Marcos 7 — O coração verdadeiro (região de Tiro e Decápolis)
const ch: ChapterDef = {
  n: 7,
  title: 'O coração verdadeiro',
  ref: 'Marcos 7',
  setting: 'Região de Tiro e Decápolis',
  intro:
    'Alguns fariseus e escribas vieram de Jerusalém e repararam que os discípulos comiam sem lavar as mãos segundo a tradição dos anciãos. A conversa que começa ali levará Jesus para terras estrangeiras, junto ao mar de Tiro, e depois às cidades da Decápolis.',
  map: {
    kind: 'proc', w: 80, h: 46, base: 'grass', ambience: 'day', seed: 7,
    features: [
      { f: 'rect', tile: 'deep', x: 0, y: 0, w: 5, h: 46 },
      { f: 'rect', tile: 'water', x: 5, y: 0, w: 4, h: 46 },
      { f: 'rect', tile: 'sand', x: 9, y: 0, w: 4, h: 46 },
      { f: 'rect', tile: 'stone', x: 13, y: 6, w: 22, h: 32 },
      { f: 'village', x: 14, y: 6, w: 20, h: 12, n: 5 },
      { f: 'village', x: 14, y: 26, w: 20, h: 12, n: 5 },
      { f: 'path', tile: 'dirt', pts: [[34, 22], [46, 24], [58, 18], [70, 14]], w: 3 },
      { f: 'blob', tile: 'mountain', x: 66, y: 34, r: 8 },
      { f: 'blob', tile: 'rock', x: 50, y: 38, r: 5 },
      { f: 'rect', tile: 'dirt', x: 56, y: 6, w: 20, h: 12 },
      { f: 'village', x: 57, y: 4, w: 18, h: 10, n: 4 },
      { f: 'obj', o: 'tower', x: 27, y: 20 },
      { f: 'obj', o: 'stall', x: 30, y: 21 },
      { f: 'obj', o: 'stall', x: 18, y: 21, v: 2 },
      { f: 'obj', o: 'well', x: 64, y: 19 },
      { f: 'obj', o: 'boat', x: 7, y: 16, solid: false },
      { f: 'obj', o: 'net', x: 11, y: 26 },
      { f: 'scatter', o: 'palm', x: 9, y: 0, w: 4, h: 46, n: 8 },
      { f: 'scatter', o: 'olive', x: 36, y: 2, w: 18, h: 16, n: 10, on: ['grass'] },
      { f: 'scatter', o: 'tree', x: 36, y: 28, w: 24, h: 16, n: 8, on: ['grass'] },
      { f: 'scatter', o: 'bigrock', x: 58, y: 26, w: 20, h: 18, n: 8 },
      { f: 'scatter', o: 'bush', x: 36, y: 0, w: 44, h: 46, n: 18, on: ['grass'] },
      { f: 'scatter', o: 'jar', x: 14, y: 6, w: 20, h: 32, n: 8, on: ['stone'] },
      { f: 'scatter', o: 'flower', x: 36, y: 0, w: 44, h: 46, n: 20, on: ['grass'] },
    ],
  },
  cell: 16,
  spawn: [42, 26],
  music: 'village',
  messageAt: [46, 22],
  zones: [
    { id: 'encruzilhada', name: 'Encruzilhada da Galileia', at: [44, 24], r: 4 },
    { id: 'tiro', name: 'Região de Tiro', at: [22, 22], r: 6 },
    { id: 'costa', name: 'Costa do Mar Grande', at: [11, 14], r: 4 },
    { id: 'decapolis', name: 'Decápolis', at: [64, 14], r: 6 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [44, 22], { role: 'O Mestre' }),
    npc('fariseu', 'Fariseu de Jerusalém', 'fariseu', [46, 24], {
      gives: 'jarro', role: 'Defensor das tradições',
      lines: [say('fariseu', 'Lavamos copos, jarros e vasos de cobre segundo a tradição dos anciãos. Tome este jarro de purificação e pense no que é realmente puro.')],
    }),
    npc('escriba', 'Escriba de Jerusalém', 'escriba', [40, 28], {
      gives: 'pergaminho_lei', role: 'Mestre da Lei',
      lines: [say('escriba', 'Estudo a Lei de Moisés desde menino. Leve esta cópia da Lei; um dia alguém perguntará qual é o primeiro de todos os mandamentos.')],
    }),
    npc('sirofenicia', 'Mulher siro-fenícia', 'sirofenicia', [20, 23], {
      gives: 'migalhas', role: 'Mulher grega de fé perseverante',
      lines: [say('sirofenicia', 'Minha filha está livre! Leve estas migalhas de pão: um pouco do que cai da mesa pode alimentar muitos.')],
    }),
    npc('pescador', 'Pescador fenício', 'pescador', [11, 26], {
      gives: 'concha', role: 'Pescador de Tiro',
      uses: [{ item: 'anzol', lines: [say('pescador', 'Bronze da Galileia! Que anzol bem feito. Zebedeu sabe o que faz.')] }],
      lines: [say('pescador', 'O mar de Tiro é diferente do mar da Galileia. Leve esta concha; ao amanhecer ela brilha como ouro.')],
    }),
    npc('amigos', 'Amigos do surdo', 'homem2', [64, 14], {
      gives: 'lira', role: 'Moradores da Decápolis',
      lines: [say('amigos', 'Agora nosso amigo ouve e fala! Leve esta pequena lira: queremos cantar que Ele tudo faz bem.')],
    }),
    npc('surdo', 'Homem surdo', 'homem3', [66, 15], { showFrom: 'decapolis', role: 'Curado com a palavra "Efatá"' }),
    npc('caminhante', 'Caminhante da Decápolis', 'viajante', [52, 20], { role: 'Viajante', lines: [say('caminhante', 'Meus pés estão feridos de tanto andar...')] }),
  ],
  steps: [
    {
      id: 'tradicoes', title: 'Ouvir o ensinamento sobre as tradições', kind: 'talk', npc: 'fariseu',
      hint: 'Fariseus vindos de Jerusalém questionam Jesus na encruzilhada.',
      lines: [
        say('fariseu', 'Por que não andam os teus discípulos conforme a tradição dos antigos, mas comem o pão com as mãos por lavar?', 'Marcos 7:5'),
        say('jesus', 'Este povo honra-me com os lábios, mas o seu coração está longe de mim.', 'Marcos 7:6'),
        say('jesus', 'Nada há fora do homem que, entrando nele, o possa contaminar; mas o que sai dele, isso é que contamina o homem.', 'Marcos 7:15'),
      ],
    },
    {
      id: 'coracao', title: 'Desafio: o que vem do coração?', kind: 'challenge', npc: 'escriba',
      hint: 'Fale com o escriba e separe as atitudes conforme o ensino de Jesus.',
      lines: [say('escriba', 'Vamos ver se você entendeu. Separe o que, segundo Jesus, sai do coração e contamina, e o que é apenas um costume exterior.')],
      challenge: {
        type: 'sort',
        prompt: 'Segundo Marcos 7:15-23, classifique cada item.',
        categories: ['Sai do coração e contamina', 'Costume exterior (não contamina o coração)'],
        items: [
          { text: 'Maus pensamentos', cat: 0, why: 'Marcos 7:21: "do coração dos homens saem os maus pensamentos".' },
          { text: 'Inveja', cat: 0, why: 'Marcos 7:22 cita a inveja entre o que sai de dentro.' },
          { text: 'Soberba', cat: 0, why: 'Marcos 7:22 menciona a soberba.' },
          { text: 'Engano', cat: 0, why: 'Marcos 7:22 menciona o engano.' },
          { text: 'Comer sem lavar as mãos', cat: 1, why: 'Marcos 7:2-5: era uma tradição dos anciãos; Jesus ensinou que isso não contamina o coração.' },
          { text: 'Lavar copos e jarros', cat: 1, why: 'Marcos 7:4: um costume exterior de purificação.' },
          { text: 'O alimento que entra pela boca', cat: 1, why: 'Marcos 7:18-19: o que entra não vai ao coração.' },
          { text: 'Furtos', cat: 0, why: 'Marcos 7:21-22 lista os furtos entre o que procede do coração.' },
        ],
      },
    },
    {
      id: 'tiro', title: 'Viajar à região de Tiro', kind: 'reach', at: [24, 25], r: 3,
      hint: 'Siga a estrada para o oeste até a cidade de Tiro, junto ao mar.',
      lines: [narr('E, levantando-se dali, foi para os termos de Tiro e de Sidom. E, entrando numa casa, queria que ninguém o soubesse, mas não pôde esconder-se.', 'Marcos 7:24')],
    },
    {
      id: 'mulher', title: 'Encontrar a mulher siro-fenícia', kind: 'talk', npc: 'sirofenicia',
      hint: 'Uma mulher grega procura Jesus por causa de sua filha.',
      lines: [
        narr('Porque uma mulher, cuja filha tinha um espírito imundo, ouvindo falar dele, foi e lançou-se aos seus pés. E esta mulher era grega, siro-fenícia de nação.', 'Marcos 7:25-26'),
        say('sirofenicia', 'Por favor, minha filha precisa dele!'),
      ],
    },
    {
      id: 'dialogo', title: 'Acompanhar seu diálogo com Jesus', kind: 'scene', at: [21, 23], r: 3,
      hint: 'Fique perto da mulher.',
      scene: [
        show('jesus', [22, 21]),
        S('jesus', 'Deixa primeiro saciar os filhos; porque não convém tomar o pão dos filhos e lançá-lo aos cachorrinhos.', 'Marcos 7:27'),
        S('sirofenicia', 'Sim, Senhor; mas também os cachorrinhos comem, debaixo da mesa, as migalhas dos filhos.', 'Marcos 7:28'),
        S('jesus', 'Por essa palavra, vai; o demônio já saiu de tua filha.', 'Marcos 7:29'),
        N('E, indo ela para sua casa, achou a filha deitada sobre a cama, e que o demônio já tinha saído.', 'Marcos 7:30'),
        hide('jesus'),
      ],
    },
    {
      id: 'decapolis', title: 'Encontrar o homem surdo', kind: 'talk', npc: 'amigos',
      hint: 'Atravesse para o leste até as cidades da Decápolis.',
      lines: [narr('E trouxeram-lhe um surdo, que falava dificilmente; e rogaram-lhe que pusesse a mão sobre ele.', 'Marcos 7:32')],
    },
    {
      id: 'efata', title: 'Acompanhar a cura do surdo', kind: 'scene', at: [65, 15], r: 3,
      hint: 'Aproxime-se do homem surdo.',
      scene: [
        show('jesus', [64, 16]),
        N('E, tirando-o à parte, de entre a multidão, e levantando os olhos ao céu, suspirou e disse:', 'Marcos 7:33-34'),
        S('jesus', 'Efatá; isto é, Abre-te.', 'Marcos 7:34'),
        fx('sparkle'),
        N('E logo se abriram os seus ouvidos, e a prisão da língua se desfez, e falava perfeitamente.', 'Marcos 7:35'),
        N('E, admirando-se sobremaneira, diziam: Tudo faz bem; faz ouvir os surdos e falar os mudos.', 'Marcos 7:37'),
      ],
    },
  ],
  side: [
    {
      id: 'pes', title: 'Pés cansados', giver: 'caminhante', needs: 'sandalias', needsFrom: 'Marcos 6',
      hint: 'Um caminhante na estrada para a Decápolis está com os pés feridos.',
      ask: [say('caminhante', 'Minhas sandálias se desfizeram na estrada de pedras. Você teria um par sobrando?')],
      thanks: [say('caminhante', 'Sandálias novas! Agora posso seguir. Leve este mapa das estradas da Judeia — ele mostra até o caminho de Jericó.')],
      reward: 'mapa',
    },
  ],
  scrolls: [
    { id: 's1', at: [30, 41], ref: 'Marcos 7:6', text: 'Este povo honra-me com os lábios, mas o seu coração está longe de mim.' },
    { id: 's2', at: [74, 38], ref: 'Marcos 7:21', text: 'Porque do interior do coração dos homens saem os maus pensamentos.' },
    { id: 's3', at: [50, 6], ref: 'Marcos 7:37', text: 'Tudo faz bem; faz ouvir os surdos e falar os mudos.' },
  ],
  message: {
    title: 'A fé e a verdadeira pureza do coração',
    summary:
      'Jesus ensinou que não são os rituais exteriores que tornam alguém impuro, mas aquilo que sai do coração. Em Tiro, uma mulher estrangeira mostrou uma fé humilde e perseverante, e sua filha foi libertada. Na Decápolis, Jesus disse "Efatá" e um surdo passou a ouvir e falar.',
    verses: [
      { ref: 'Marcos 7:15', text: 'O que sai dele, isso é que contamina o homem.' },
      { ref: 'Marcos 7:37', text: 'Tudo faz bem; faz ouvir os surdos e falar os mudos.' },
    ],
    reflection:
      'É fácil cuidar da aparência e esquecer o coração. Jesus olha para dentro. E a mulher siro-fenícia nos ensina que a fé verdadeira é humilde, insistente e confiante na bondade de Deus.',
  },
  quiz: [
    { q: 'Segundo Jesus, o que contamina o homem?', options: ['Comer sem lavar as mãos', 'O que sai do coração', 'Andar em terra estrangeira', 'Tocar em jarros'], correct: 1, explain: 'Marcos 7:15 e 7:20-23: o que sai do coração é que contamina.' },
    { q: 'De onde era a mulher que pediu por sua filha?', options: ['Jerusalém', 'Nazaré', 'Siro-fenícia, região de Tiro', 'Egito'], correct: 2, explain: 'Marcos 7:26: "esta mulher era grega, siro-fenícia de nação".' },
    { q: 'O que significa "Efatá"?', options: ['"Levanta-te"', '"Abre-te"', '"Vai em paz"', '"Cala-te"'], correct: 1, explain: 'Marcos 7:34: "Efatá; isto é, Abre-te".' },
  ],
};
export default ch;
