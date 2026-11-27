import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 11 — A chegada do Rei (Betfagé, Betânia e entrada de Jerusalém)
const ch: ChapterDef = {
  n: 11,
  title: 'A chegada do Rei',
  ref: 'Marcos 11',
  setting: 'Betfagé, Betânia e Jerusalém',
  intro:
    'Perto de Jerusalém, entre as aldeias de Betfagé e Betânia, no Monte das Oliveiras, Jesus envia dois discípulos com uma instrução curiosa: buscar um jumentinho em que ninguém ainda havia montado.',
  map: {
    kind: 'proc', w: 90, h: 50, base: 'grass', ambience: 'day', seed: 11,
    features: [
      { f: 'blob', tile: 'dgrass', x: 22, y: 25, r: 16 },
      { f: 'rect', tile: 'dirt', x: 6, y: 6, w: 20, h: 12 },
      { f: 'village', x: 6, y: 4, w: 20, h: 12, n: 4 },
      { f: 'rect', tile: 'dirt', x: 6, y: 32, w: 20, h: 12 },
      { f: 'village', x: 6, y: 31, w: 20, h: 12, n: 4 },
      { f: 'path', tile: 'dirt', pts: [[16, 18], [24, 24], [62, 24]], w: 3 },
      { f: 'path', tile: 'dirt', pts: [[16, 32], [24, 24]], w: 2 },
      { f: 'path', tile: 'dirt', pts: [[42, 24], [44, 16]], w: 2 },
      { f: 'rect', tile: 'wall', x: 62, y: 0, w: 2, h: 22 },
      { f: 'rect', tile: 'wall', x: 62, y: 27, w: 2, h: 23 },
      { f: 'rect', tile: 'stone', x: 64, y: 0, w: 26, h: 50 },
      { f: 'rect', tile: 'marble', x: 68, y: 18, w: 20, h: 22 },
      { f: 'obj', o: 'temple', x: 78, y: 17, w: 12, h: 8 },
      { f: 'obj', o: 'stall', x: 71, y: 30 },
      { f: 'obj', o: 'stall', x: 77, y: 33, v: 1 },
      { f: 'obj', o: 'stall', x: 84, y: 30, v: 2 },
      { f: 'obj', o: 'table', x: 74, y: 36 },
      { f: 'obj', o: 'pillar', x: 69, y: 22 },
      { f: 'obj', o: 'pillar', x: 69, y: 30 },
      { f: 'obj', o: 'pillar', x: 87, y: 22 },
      { f: 'obj', o: 'pillar', x: 87, y: 30 },
      { f: 'obj', o: 'fig', x: 44, y: 14 },
      { f: 'obj', o: 'donkey', x: 18, y: 20, solid: false },
      { f: 'scatter', o: 'olive', x: 0, y: 0, w: 60, h: 50, n: 34, on: ['grass', 'dgrass'] },
      { f: 'scatter', o: 'palm', x: 28, y: 10, w: 30, h: 30, n: 8, on: ['grass', 'dgrass'] },
      { f: 'scatter', o: 'bush', x: 0, y: 0, w: 60, h: 50, n: 16, on: ['grass', 'dgrass'] },
      { f: 'scatter', o: 'flower', x: 0, y: 0, w: 60, h: 50, n: 24, on: ['grass'] },
      { f: 'scatter', o: 'jar', x: 64, y: 40, w: 26, h: 10, n: 6, on: ['stone'] },
      { f: 'scatter', o: 'crate', x: 64, y: 2, w: 26, h: 14, n: 6, on: ['stone'] },
    ],
  },
  cell: 16,
  spawn: [20, 28],
  music: 'joy',
  messageAt: [76, 26],
  zones: [
    { id: 'betfage', name: 'Betfagé', at: [16, 12], r: 6 },
    { id: 'betania', name: 'Betânia', at: [16, 38], r: 6 },
    { id: 'porta', name: 'Porta de Jerusalém', at: [62, 24], r: 3 },
    { id: 'templo', name: 'Pátio do templo', at: [78, 28], r: 6 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [22, 27], { role: 'O Rei que vem em nome do Senhor' }),
    npc('aldeao', 'Morador de Betfagé', 'homem3', [20, 19], {
      gives: 'cabresto', role: 'Dono do jumentinho',
      lines: [say('aldeao', 'Que fazeis, desprendendo o jumentinho? ... Ah, o Senhor precisa dele? Então levai! Fique com o cabresto; ele não vai precisar mais.')],
    }),
    npc('pedro', 'Pedro', 'pedro', [42, 17], {
      showFrom: 'figueira', role: 'Apóstolo',
      lines: [say('pedro', 'Mestre, eis que a figueira que tu amaldiçoaste se secou.', 'Marcos 11:21')],
      uses: [{ item: 'grao_mostarda', lines: [say('pedro', 'Uma semente de mostarda... Ele falou que a fé, mesmo pequena, pode mover montes.')] }],
    }),
    npc('crianca', 'Menino do Hosana', 'crianca2', [40, 27], {
      gives: 'folha_palmeira', role: 'Criança na multidão',
      uses: [{ item: 'ramo', lines: [say('crianca', 'Um ramo de palmeira! Hosana! Bendito o que vem em nome do Senhor!')] }],
      lines: [say('crianca', 'Hosana! Hosana! Toma esta folha de palmeira para lembrar este dia!')],
    }),
    npc('cambista', 'Cambista do templo', 'mercador', [73, 33], {
      gives: 'balanca', role: 'Trocador de moedas',
      uses: [{ item: 'jarro', lines: [narr('Jesus "não consentia que alguém levasse algum vaso pelo templo" (Mc 11:16). O cambista olha seu jarro e fica pensativo.')] }],
      lines: [say('cambista', 'Minha mesa virou! Leve esta balança pequena; não sei mais se peso as coisas do jeito certo.')],
    }),
    npc('sacerdote', 'Sacerdote do templo', 'sacerdote', [82, 25], {
      gives: 'incenso', role: 'Servidor do templo',
      uses: [{ item: 'rolo_isaias', lines: [say('sacerdote', 'Isaías! "A minha casa será chamada casa de oração para todos os povos". Ele citou exatamente isto.')] }],
      lines: [say('sacerdote', 'Com que autoridade Ele faz estas coisas? Leve este incenso... a oração sobe como incenso diante de Deus.')],
    }),
    npc('idosa', 'Ana de Betânia', 'idosa', [14, 40], { role: 'Moradora de Betânia', lines: [say('idosa', 'Quero ver o Mestre passar, mas não tenho nada para estender no caminho...')] }),
  ],
  steps: [
    {
      id: 'jumentinho', title: 'Encontrar o jumentinho indicado por Jesus', kind: 'reach', at: [18, 21], r: 2,
      hint: 'Vá até a aldeia de Betfagé, ao norte: o jumentinho está preso à entrada.',
      lines: [
        say('jesus', 'Ide à aldeia que está defronte de vós, e, logo que ali entrardes, encontrareis preso um jumentinho, sobre o qual ainda não montou homem algum; soltai-o e trazei-mo.', 'Marcos 11:2'),
        say('jesus', 'E, se alguém vos disser: Por que fazeis isso? dizei-lhe que o Senhor precisa dele.', 'Marcos 11:3'),
        say('aldeao', 'Que fazeis, desprendendo o jumentinho?', 'Marcos 11:5'),
        narr('E disseram-lhes como Jesus lhes tinha mandado; e deixaram-nos ir.', 'Marcos 11:6'),
      ],
    },
    {
      id: 'caminho', title: 'Desafio: preparar o caminho', kind: 'challenge',
      hint: 'Pegue ramos e mantos no bosque de oliveiras e estenda-os nos 5 pontos da estrada.',
      challenge: {
        type: 'deliver', label: 'ramos e mantos', icon: 'ramo', source: [30, 15],
        targets: [[36, 25], [42, 25], [48, 25], [54, 25], [59, 25]],
        targetNames: ['o primeiro trecho', 'o segundo trecho', 'o terceiro trecho', 'o quarto trecho', 'a porta da cidade'],
      },
    },
    {
      id: 'entrada', title: 'Acompanhar a entrada triunfal', kind: 'scene', at: [34, 24], r: 4,
      hint: 'Volte ao começo da estrada: Jesus vai passar!',
      scene: [
        show('jesus', [26, 24]),
        cam([40, 24]),
        fx('crowd'),
        N('E muitos estendiam as suas vestes pelo caminho, e outros cortavam ramos das árvores e os espalhavam pelo caminho.', 'Marcos 11:8'),
        mv('jesus', [44, 24], 40),
        N('E aqueles que iam adiante e os que seguiam clamavam, dizendo: Hosana! Bendito o que vem em nome do Senhor!', 'Marcos 11:9'),
        mv('jesus', [60, 24], 40),
        N('Bendito o Reino do nosso pai Davi, que vem em nome do Senhor! Hosana nas alturas!', 'Marcos 11:10'),
        hide('jesus'),
        cam('player'),
      ],
    },
    {
      id: 'patio', title: 'Explorar o pátio do templo', kind: 'reach', at: [76, 28], r: 3,
      hint: 'Entre pela porta da cidade e vá até o pátio do templo.',
      lines: [narr('O pátio está cheio de vendedores de pombas e mesas de cambistas. O barulho das moedas se mistura com o dos animais.')],
    },
    {
      id: 'purificacao', title: 'Acompanhar a purificação do templo', kind: 'scene', at: [76, 30], r: 4,
      hint: 'Permaneça no pátio do templo.',
      scene: [
        show('jesus', [76, 27]),
        N('E, entrando Jesus no templo, começou a expulsar os que vendiam e compravam no templo; e derribou as mesas dos cambiadores e as cadeiras dos que vendiam pombas.', 'Marcos 11:15'),
        fx('shake'),
        S('jesus', 'Não está escrito: A minha casa será chamada, por todas as nações, casa de oração? Mas vós a tendes feito covil de ladrões.', 'Marcos 11:17'),
        hide('jesus'),
      ],
    },
    {
      id: 'figueira', title: 'Encontrar a figueira', kind: 'reach', at: [44, 16], r: 2.2,
      hint: 'Saia da cidade e procure a figueira junto ao caminho, ao norte da estrada.',
      lines: [
        narr('E, passando eles pela manhã, viram que a figueira se tinha secado desde as raízes.', 'Marcos 11:20'),
      ],
      scene: [show('jesus', [45, 18]), show('pedro'), S('pedro', 'Mestre, eis que a figueira que tu amaldiçoaste se secou.', 'Marcos 11:21')],
    },
    {
      id: 'fe', title: 'Ouvir os ensinamentos sobre fé e oração', kind: 'talk', npc: 'jesus',
      hint: 'Fale com Jesus junto à figueira.',
      lines: [
        say('jesus', 'Tende fé em Deus.', 'Marcos 11:22'),
        say('jesus', 'Por isso, vos digo que tudo o que pedirdes, orando, crede que o recebereis e tê-lo-eis.', 'Marcos 11:24'),
        say('jesus', 'E, quando estiverdes orando, perdoai, se tendes alguma coisa contra alguém, para que vosso Pai, que está nos céus, vos perdoe as vossas ofensas.', 'Marcos 11:25'),
      ],
    },
  ],
  side: [
    {
      id: 'capa', title: 'Algo para estender no caminho', giver: 'idosa', needs: 'capa', needsFrom: 'Marcos 10',
      hint: 'Ana, uma senhora de Betânia, quer honrar o Rei que vai passar.',
      ask: [say('idosa', 'Todos estendem suas capas no caminho, mas a minha é a única que tenho para o frio. Você teria uma capa para estender por mim?')],
      thanks: [say('idosa', 'A capa de Bartimeu! Ele a lançou de si para seguir Jesus... e agora ela forra o caminho do Rei. Leve esta lasca de pedra do templo como lembrança.')],
      reward: 'pedra_templo',
    },
  ],
  scrolls: [
    { id: 's1', at: [4, 22], ref: 'Marcos 11:9', text: 'Hosana! Bendito o que vem em nome do Senhor!' },
    { id: 's2', at: [86, 44], ref: 'Marcos 11:17', text: 'A minha casa será chamada, por todas as nações, casa de oração.' },
    { id: 's3', at: [52, 8], ref: 'Marcos 11:22', text: 'Tende fé em Deus.' },
  ],
  message: {
    title: 'Jesus é Rei e chama a uma fé verdadeira',
    summary:
      'Jesus entrou em Jerusalém montado num jumentinho, enquanto o povo estendia mantos e ramos e clamava "Hosana!". No templo, expulsou os que o transformavam em comércio, lembrando que a casa de Deus é casa de oração para todas as nações. Diante da figueira seca, ensinou sobre fé, oração e perdão.',
    verses: [
      { ref: 'Marcos 11:9', text: 'Hosana! Bendito o que vem em nome do Senhor!' },
      { ref: 'Marcos 11:22', text: 'Tende fé em Deus.' },
    ],
    reflection:
      'O Rei chegou de forma humilde, num jumentinho emprestado. Ele não veio impor poder, mas restaurar a oração e o acesso a Deus para todos. E a fé verdadeira não é só aparência — como a figueira, ela precisa dar fruto, inclusive o fruto do perdão.',
  },
  quiz: [
    { q: 'Em que animal Jesus entrou em Jerusalém?', options: ['Num cavalo branco', 'Num jumentinho', 'Num camelo', 'A pé'], correct: 1, explain: 'Marcos 11:2-7: um jumentinho sobre o qual ninguém havia montado.' },
    { q: 'O que o povo clamava?', options: ['"Crucifica-o!"', '"Hosana! Bendito o que vem em nome do Senhor!"', '"Viva César!"', '"Silêncio!"'], correct: 1, explain: 'Marcos 11:9.' },
    { q: 'Como Jesus chamou o templo, citando as Escrituras?', options: ['Casa de comércio', 'Casa de oração para todas as nações', 'Casa de César', 'Casa dos sacerdotes'], correct: 1, explain: 'Marcos 11:17.' },
  ],
};
addUse(ch, 'aldeao', 'manto', [narr('E lançaram sobre o jumentinho as suas vestes (Mc 11:7). Você estende também o manto do homem de Gerasa.')]);
export default ch;
