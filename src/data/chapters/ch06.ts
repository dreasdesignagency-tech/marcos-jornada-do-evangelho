import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 6 — O pouco que se multiplica (Nazaré, campos abertos e Mar da Galileia)
const ch: ChapterDef = {
  n: 6,
  title: 'O pouco que se multiplica',
  ref: 'Marcos 6',
  setting: 'Nazaré, campos e Mar da Galileia',
  intro:
    'Jesus volta à sua terra, Nazaré, onde cresceu trabalhando como carpinteiro. Depois enviará os doze dois a dois — e, num campo verde à beira-mar, uma multidão faminta verá o pouco se tornar muito.',
  map: {
    kind: 'proc', w: 72, h: 50, base: 'grass', ambience: 'day', seed: 6,
    features: [
      { f: 'rect', tile: 'dirt', x: 4, y: 3, w: 30, h: 14 },
      { f: 'village', x: 5, y: 3, w: 20, h: 13, n: 6 },
      { f: 'obj', o: 'temple', x: 30, y: 10, w: 8, h: 6 },
      { f: 'path', tile: 'dirt', pts: [[16, 16], [24, 21], [34, 25], [56, 25], [66, 20]], w: 3 },
      { f: 'blob', tile: 'grass2', x: 42, y: 30, r: 9 },
      { f: 'blob', tile: 'flowers', x: 52, y: 32, r: 3 },
      { f: 'blob', tile: 'flowers', x: 28, y: 31, r: 2 },
      { f: 'rect', tile: 'sand', x: 0, y: 37, w: 72, h: 3 },
      { f: 'rect', tile: 'water', x: 0, y: 40, w: 72, h: 4 },
      { f: 'rect', tile: 'deep', x: 0, y: 44, w: 72, h: 6 },
      { f: 'obj', o: 'boat', x: 34, y: 42, solid: false },
      { f: 'obj', o: 'boat', x: 58, y: 41, solid: false },
      { f: 'obj', o: 'well', x: 14, y: 9 },
      { f: 'obj', o: 'basket', x: 47, y: 30 },
      { f: 'obj', o: 'fire', x: 10, y: 34 },
      { f: 'scatter', o: 'tree', x: 0, y: 18, w: 20, h: 18, n: 12, on: ['grass'] },
      { f: 'scatter', o: 'olive', x: 48, y: 2, w: 22, h: 16, n: 12, on: ['grass'] },
      { f: 'scatter', o: 'palm', x: 0, y: 36, w: 72, h: 2, n: 9 },
      { f: 'scatter', o: 'bush', x: 0, y: 18, w: 72, h: 18, n: 14, on: ['grass'] },
      { f: 'scatter', o: 'rock', x: 0, y: 0, w: 72, h: 37, n: 12, on: ['grass'] },
      { f: 'scatter', o: 'sheep', x: 56, y: 16, w: 12, h: 8, n: 6, on: ['grass'] },
      { f: 'scatter', o: 'flower', x: 0, y: 18, w: 72, h: 18, n: 20, on: ['grass', 'grass2'] },
    ],
  },
  cell: 16,
  spawn: [16, 18],
  music: 'pastoral',
  messageAt: [42, 36],
  zones: [
    { id: 'nazare', name: 'Nazaré', at: [16, 10], r: 6 },
    { id: 'sinagoga', name: 'Sinagoga de Nazaré', at: [30, 12], r: 3 },
    { id: 'campo', name: 'Campo verde', at: [42, 30], r: 6 },
    { id: 'praia', name: 'Margem do mar', at: [40, 38], r: 5 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [30, 12], { role: 'O Mestre' }),
    npc('nazareno', 'Morador de Nazaré', 'homem', [22, 9], {
      gives: 'prumo', role: 'Vizinho da família de Jesus',
      uses: [{ item: 'novelo', lines: [say('nazareno', 'Este novelo é do tear de Maria! Conheço essa família desde sempre.')] }],
      lines: [say('nazareno', 'Não é este o carpinteiro? Eu o vi crescer! Tome este prumo de construtor; um dia você ouvirá sobre a pedra que os edificadores rejeitaram.')],
    }),
    npc('andre', 'André', 'andre', [34, 18], {
      gives: 'sandalias', role: 'Apóstolo enviado dois a dois',
      uses: [{ item: 'azeite', lines: [narr('Os doze "ungiam muitos enfermos com óleo, e os curavam" (Mc 6:13). André recebe o seu azeite com gratidão.')] }],
      lines: [say('andre', 'Jesus nos mandou levar só o bordão e calçar sandálias. Fique com este par — a estrada até Jericó é longa.')],
    }),
    npc('pastorz', 'Zacarias, o pastor', 'campones', [60, 20], {
      gives: 'flauta', role: 'Pastor dos campos',
      lines: [say('pastorz', 'Jesus olhou para a multidão como ovelhas sem pastor. Eu sei o que isso significa. Leve minha flauta de cana: ela toca bem ao amanhecer.')],
    }),
    npc('genesare', 'Mulher de Genesaré', 'mulher3', [60, 35], {
      gives: 'ervas', role: 'Moradora da margem',
      uses: [{ item: 'franja', lines: [say('genesare', 'Um fio da orla do manto dele! Aqui todos rogavam para tocar ao menos a orla da sua veste (Mc 6:56).')] }],
      lines: [say('genesare', 'Trouxeram doentes em leitos de toda a região! Leve estas ervas amargas; elas fazem parte da ceia da Páscoa.')],
    }),
    npc('barqueiro', 'Barqueiro', 'pescador', [28, 38], { role: 'Dono de barco', lines: [say('barqueiro', 'Meu remo partiu-se nas pedras...')] }),
    npc('pedro', 'Pedro', 'pedro', [40, 26], { showFrom: 'multidao', role: 'Apóstolo' }),
  ],
  steps: [
    {
      id: 'nazare', title: 'Visitar Nazaré', kind: 'reach', at: [30, 12], r: 2.5,
      hint: 'Vá até a sinagoga de Nazaré, a leste da vila.',
      lines: [
        narr('E, chegando o sábado, começou a ensinar na sinagoga; e muitos, ouvindo-o, se admiravam, dizendo: Não é este o carpinteiro, filho de Maria?', 'Marcos 6:2-3'),
        say('jesus', 'Não há profeta sem honra, senão na sua pátria, entre os seus parentes e na sua casa.', 'Marcos 6:4'),
        narr('E estava admirado da incredulidade deles.', 'Marcos 6:6'),
      ],
      scene: [hide('jesus')],
    },
    {
      id: 'missao', title: 'Conhecer a missão dos discípulos', kind: 'talk', npc: 'andre',
      hint: 'André está no caminho que desce de Nazaré.',
      lines: [
        narr('E chamou a si os doze, e começou a enviá-los a dois e dois, e deu-lhes poder sobre os espíritos imundos.', 'Marcos 6:7'),
        narr('E ordenou-lhes que nada tomassem para o caminho, senão somente um bordão; nem alforje, nem pão, nem dinheiro no cinto; mas que calçassem sandálias.', 'Marcos 6:8-9'),
        say('andre', 'Fomos de aldeia em aldeia pregando que todos se arrependessem. Agora voltamos para contar tudo a Jesus.'),
      ],
    },
    {
      id: 'multidao', title: 'Encontrar a multidão que seguia Jesus', kind: 'reach', at: [40, 27], r: 3,
      hint: 'Siga o caminho até o grande campo verde.',
      lines: [narr('E Jesus, saindo, viu uma grande multidão, e teve compaixão deles, porque eram como ovelhas que não têm pastor; e começou a ensinar-lhes muitas coisas.', 'Marcos 6:34')],
      scene: [show('jesus', [40, 24]), fx('crowd')],
    },
    {
      id: 'paes', title: 'Localizar os cinco pães e dois peixes', kind: 'reach', at: [47, 30], r: 1.8,
      hint: 'Jesus disse: "Ide ver quantos pães tendes". Procure as provisões dos discípulos no campo.',
      lines: [
        narr('E ele lhes disse: Quantos pães tendes? Ide ver. E, sabendo-o eles, disseram: Cinco pães e dois peixes.', 'Marcos 6:38'),
        say('marcos', 'Só cinco pães e dois peixes para tanta gente!'),
      ],
    },
    {
      id: 'grupos', title: 'Ajudar a organizar os grupos', kind: 'talk', npc: 'pedro',
      hint: 'Fale com Pedro para organizar o povo sobre a relva.',
      lines: [
        narr('E ordenou-lhes que fizessem assentar a todos, em ranchos, sobre a erva verde. E assentaram-se repartidos de cem em cem e de cinquenta em cinquenta.', 'Marcos 6:39-40'),
        narr('E, tomando ele os cinco pães e os dois peixes, levantou os olhos ao céu, e abençoou, e partiu os pães, e deu-os aos seus discípulos para que os pusessem diante deles.', 'Marcos 6:41'),
      ],
      scene: [fx('sparkle')],
    },
    {
      id: 'distribuir', title: 'Desafio: distribuir os alimentos', kind: 'challenge',
      hint: 'Pegue os pães junto de Jesus e leve a cada grupo sentado.',
      challenge: {
        type: 'deliver', label: 'pães', icon: 'pao', source: [41, 25],
        targets: [[30, 30], [36, 34], [45, 34], [53, 30], [50, 23]],
        targetNames: ['Grupo dos cem', 'Grupo dos cinquenta', 'Grupo das famílias', 'Grupo dos pescadores', 'Grupo dos pastores'],
      },
    },
    {
      id: 'cestos', title: 'Desafio: recolher os cestos restantes', kind: 'challenge', helpItem: 'cesta',
      hint: 'Recolha os 12 cestos com os pedaços que sobraram, em até 100 segundos.',
      challenge: {
        type: 'collect', label: 'Cestos recolhidos', icon: 'cesto', time: 100,
        at: [[28, 27], [33, 29], [38, 32], [43, 36], [48, 33], [55, 28], [58, 24], [51, 21], [45, 20], [36, 22], [30, 33], [24, 28]],
      },
      scene: [N('E todos comeram e ficaram fartos. E levantaram doze alcofas cheias de pedaços de pão e de peixe.', 'Marcos 6:42-43')],
    },
    {
      id: 'aguas', title: 'Acompanhar Jesus andando sobre as águas', kind: 'scene', at: [40, 38], r: 3,
      hint: 'Vá até a margem do mar. A noite está chegando.',
      scene: [
        fx('night'),
        hide('jesus'),
        N('E logo obrigou os seus discípulos a subir para o barco. E, sendo já tarde, estava o barco no meio do mar, e o vento lhes era contrário.', 'Marcos 6:45-48'),
        show('jesus', [50, 46]),
        cam([42, 43]),
        mv('jesus', [36, 43], 30),
        S('jesus', 'Tende bom ânimo; sou eu; não temais.', 'Marcos 6:50'),
        N('E subiu para o barco, para junto deles, e o vento se aquietou.', 'Marcos 6:51'),
        fx('light'),
        cam('player'),
      ],
    },
  ],
  side: [
    {
      id: 'remo', title: 'O remo partido', giver: 'barqueiro', needs: 'remo', needsFrom: 'Marcos 1',
      hint: 'Um barqueiro na praia não consegue sair para o mar.',
      ask: [say('barqueiro', 'Meu remo partiu-se nas pedras e preciso levar os discípulos para a outra margem. Você não teria um remo?')],
      thanks: [say('barqueiro', 'Remo de cedro, como os de Zebedeu! Muito obrigado. Leve este pano de vela que sobrou do meu barco.')],
      reward: 'vela_barco',
    },
  ],
  scrolls: [
    { id: 's1', at: [6, 30], ref: 'Marcos 6:34', text: 'E Jesus, saindo, viu uma grande multidão, e teve compaixão deles, porque eram como ovelhas que não têm pastor.' },
    { id: 's2', at: [66, 8], ref: 'Marcos 6:41', text: 'E, tomando ele os cinco pães e os dois peixes, levantou os olhos ao céu, e abençoou, e partiu os pães.' },
    { id: 's3', at: [20, 36], ref: 'Marcos 6:50', text: 'Tende bom ânimo; sou eu; não temais.' },
  ],
  message: {
    title: 'Confiança, provisão e compaixão',
    summary:
      'Em Nazaré, Jesus foi rejeitado por quem o conhecia desde criança. Mesmo assim, enviou os doze em missão. Diante de uma multidão faminta, teve compaixão: com cinco pães e dois peixes, alimentou milhares, e sobraram doze cestos. À noite, foi ao encontro dos discípulos andando sobre o mar e disse: "Sou eu; não temais".',
    verses: [
      { ref: 'Marcos 6:34', text: 'Teve compaixão deles, porque eram como ovelhas que não têm pastor.' },
      { ref: 'Marcos 6:50', text: 'Tende bom ânimo; sou eu; não temais.' },
    ],
    reflection:
      'Os discípulos olharam para o pouco que tinham. Jesus olhou para as pessoas com compaixão. O que parece pouco nas suas mãos — tempo, talentos, recursos — pode alimentar muitos quando é entregue a Ele.',
  },
  quiz: [
    { q: 'Quantos pães e peixes havia no início?', options: ['Sete pães e alguns peixinhos', 'Cinco pães e dois peixes', 'Doze pães e um peixe', 'Dois pães e cinco peixes'], correct: 1, explain: 'Marcos 6:38: "Cinco pães e dois peixes".' },
    { q: 'Quantos cestos sobraram?', options: ['Sete', 'Três', 'Doze', 'Nenhum'], correct: 2, explain: 'Marcos 6:43: "levantaram doze alcofas cheias de pedaços de pão e de peixe".' },
    { q: 'O que Jesus disse aos discípulos ao andar sobre o mar?', options: ['"Remai mais forte"', '"Tende bom ânimo; sou eu; não temais"', '"Voltai para a praia"', '"Por que dormis?"'], correct: 1, explain: 'Marcos 6:50.' },
  ],
};
addUse(ch, 'pedro', 'esteira', [say('pedro', 'Uma esteira de palha! Vamos estendê-la para as famílias se assentarem sobre a erva verde.')]);
export default ch;
