import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc, addUse } from './common';

// Marcos 13 — Permaneça vigilante (Monte das Oliveiras com vista de Jerusalém)
const ch: ChapterDef = {
  n: 13,
  title: 'Permaneça vigilante',
  ref: 'Marcos 13',
  setting: 'Monte das Oliveiras',
  intro:
    'Ao sair do templo, um discípulo se admira das grandes pedras do edifício. Jesus sobe então ao Monte das Oliveiras, de onde se vê Jerusalém inteira, e fala sobre o futuro, sobre perseverança e sobre vigiar.',
  map: {
    kind: 'proc', w: 70, h: 60, base: 'grass', ambience: 'dusk', seed: 13,
    features: [
      { f: 'rect', tile: 'stone', x: 0, y: 46, w: 70, h: 14 },
      { f: 'obj', o: 'temple', x: 35, y: 58, w: 12, h: 7 },
      { f: 'rect', tile: 'dgrass', x: 0, y: 40, w: 70, h: 6 },
      { f: 'blob', tile: 'water', x: 12, y: 43, r: 2 },
      { f: 'path', tile: 'dirt', pts: [[35, 48], [30, 38], [40, 28], [32, 18], [35, 9]], w: 3 },
      { f: 'blob', tile: 'rock', x: 35, y: 8, r: 6 },
      { f: 'obj', o: 'cityview', x: 14, y: 26 },
      { f: 'obj', o: 'tent', x: 42, y: 6 },
      { f: 'obj', o: 'fire', x: 38, y: 12 },
      { f: 'scatter', o: 'olive', x: 0, y: 2, w: 70, h: 38, n: 46, on: ['grass', 'dgrass'] },
      { f: 'scatter', o: 'bush', x: 0, y: 2, w: 70, h: 38, n: 14, on: ['grass'] },
      { f: 'scatter', o: 'rock', x: 0, y: 2, w: 70, h: 38, n: 12, on: ['grass', 'rock'] },
      { f: 'scatter', o: 'flower', x: 0, y: 2, w: 70, h: 38, n: 18, on: ['grass'] },
      { f: 'scatter', o: 'pillar', x: 2, y: 47, w: 66, h: 4, n: 8, on: ['stone'] },
    ],
  },
  cell: 16,
  spawn: [24, 50],
  music: 'mystery',
  messageAt: [33, 12],
  zones: [
    { id: 'templo', name: 'Arredores do templo', at: [35, 50], r: 6 },
    { id: 'cedrom', name: 'Vale do Cedrom', at: [20, 42], r: 5 },
    { id: 'olival', name: 'Encosta das Oliveiras', at: [38, 28], r: 6 },
    { id: 'mirante', name: 'Mirante de Jerusalém', at: [16, 30], r: 5 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [35, 7], { role: 'O Mestre' }),
    npc('discipulo', 'Discípulo admirado', 'homem3', [37, 50], {
      gives: 'cinzel', role: 'Discípulo',
      uses: [{ item: 'pedra_templo', lines: [say('discipulo', 'Uma lasca das pedras do templo... "Não ficará pedra sobre pedra".')] }],
      lines: [say('discipulo', 'Que pedras enormes! Leve este cinzel de pedreiro: tudo o que é construído por mãos humanas um dia passa.')],
    }),
    npc('pedro', 'Pedro', 'pedro', [32, 9], {
      gives: 'galo_figura', role: 'Apóstolo',
      uses: [{ item: 'tenda', lines: [say('pedro', 'O pano de tenda! Vamos armá-lo aqui no monte para passarmos a noite.')] }],
      lines: [say('pedro', 'Eu jamais abandonarei o Mestre! ... Fique com esta figura de galo que um menino entalhou. Não sei por quê, mas ela me deixa inquieto.')],
    }),
    npc('andre', 'André', 'andre', [38, 9], {
      gives: 'figo', role: 'Apóstolo',
      uses: [{ item: 'cruz_madeira', lines: [say('andre', 'A cruz que Pedro entalhou... Ele disse que seguir o Mestre tem um preço.')] }],
      lines: [say('andre', 'Ele falou da figueira: quando os ramos ficam tenros, sabeis que o verão está próximo. Leve este figo.')],
    }),
    npc('joao', 'João', 'joao', [34, 11], {
      gives: 'pergaminho_branco', role: 'Apóstolo',
      uses: [{ item: 'pena', lines: [say('joao', 'Uma pena de escrever! Registre tudo, Marcos. Estas palavras não passarão.')] }],
      lines: [say('joao', 'Guarde este pergaminho em branco. Haverá muito para escrever nos próximos dias.')],
    }),
    npc('vigia', 'Vigia do monte', 'viajante', [44, 14], {
      role: 'Guarda das lâmpadas',
      uses: [{ item: 'oleo_lampada', lines: [say('vigia', 'Óleo para as lâmpadas! Com isto, nenhuma luz se apagará esta noite.')] }],
      lines: [say('vigia', 'À noite, mantemos as lâmpadas acesas. Quem vigia não dorme no posto.')],
    }),
  ],
  steps: [
    {
      id: 'templo', title: 'Explorar os arredores do templo', kind: 'talk', npc: 'discipulo',
      hint: 'Um discípulo admira as pedras do templo, logo ao sair.',
      lines: [
        say('discipulo', 'Mestre, olha que pedras e que edifícios!', 'Marcos 13:1'),
        narr('E, respondendo Jesus, disse-lhe: Vês estes grandes edifícios? Não ficará pedra sobre pedra que não seja derribada.', 'Marcos 13:2'),
      ],
    },
    {
      id: 'subir', title: 'Subir o Monte das Oliveiras', kind: 'reach', at: [35, 10], r: 2.5,
      hint: 'Atravesse o vale do Cedrom e suba pela trilha entre as oliveiras.',
      lines: [narr('Daqui de cima se vê Jerusalém inteira: as muralhas, as casas e o templo brilhando ao entardecer.')],
    },
    {
      id: 'encontro', title: 'Encontrar Jesus e os discípulos', kind: 'talk', npc: 'jesus',
      hint: 'Jesus está assentado no alto do monte, defronte do templo.',
      lines: [
        narr('E, assentando-se ele no Monte das Oliveiras, defronte do templo, Pedro, e Tiago, e João, e André lhe perguntaram em particular:', 'Marcos 13:3'),
        say('pedro', 'Dize-nos: quando serão essas coisas, e que sinal haverá quando todas elas estiverem para se cumprir?', 'Marcos 13:4'),
      ],
    },
    {
      id: 'ensinos', title: 'Ouvir os ensinamentos sobre os acontecimentos futuros', kind: 'talk', npc: 'jesus',
      hint: 'Ouça com atenção o que Jesus responde.',
      lines: [
        say('jesus', 'Olhai que ninguém vos engane.', 'Marcos 13:5'),
        say('jesus', 'Mas aquele que perseverar até ao fim, esse será salvo.', 'Marcos 13:13'),
        say('jesus', 'Passará o céu e a terra, mas as minhas palavras não passarão.', 'Marcos 13:31'),
        say('jesus', 'Mas, daquele dia e hora, ninguém sabe, nem os anjos que estão no céu, nem o Filho, senão o Pai.', 'Marcos 13:32'),
        narr('Nota do jogo: Jesus não deu datas. Este capítulo é interpretado de diferentes maneiras pelos cristãos; o essencial aqui é a sua instrução: perseverar e vigiar.'),
      ],
    },
    {
      id: 'registrar', title: 'Registrar as instruções sobre perseverança', kind: 'scene', at: [34, 12], r: 3,
      hint: 'Sente-se perto da fogueira e escreva no seu pergaminho.',
      scene: [
        { t: 'pose', pose: 'write' },
        N('Olhai, vigiai e orai, porque não sabeis quando chegará o tempo.', 'Marcos 13:33'),
        N('É como se um homem, partindo para fora da terra, deixasse a sua casa, e desse autoridade aos seus servos, e a cada um a sua obra, e mandasse ao porteiro que vigiasse.', 'Marcos 13:34'),
      ],
    },
    {
      id: 'vigiar', title: 'Desafio: permanecer vigilante', kind: 'challenge', helpItem: 'lamparina',
      hint: 'A noite caiu. Mantenha as lâmpadas do acampamento acesas por 45 segundos!',
      challenge: { type: 'lamps', duration: 45, at: [[29, 6], [41, 9], [28, 13], [42, 15], [35, 16], [35, 3]] },
      scene: [
        S('jesus', 'Vigiai, pois, porque não sabeis quando virá o senhor da casa: se à tarde, se à meia-noite, se ao cantar do galo, se pela manhã.', 'Marcos 13:35'),
        S('jesus', 'E as coisas que vos digo digo-as a todos: Vigiai.', 'Marcos 13:37'),
      ],
    },
  ],
  side: [
    {
      id: 'vigia', title: 'Óleo para a noite', giver: 'vigia', needs: 'oleo_lampada', needsFrom: 'Marcos 8',
      hint: 'O vigia do monte precisa de óleo para as lâmpadas da noite.',
      ask: [say('vigia', 'O óleo das lâmpadas está acabando e a noite vai ser longa. Você tem óleo?')],
      thanks: [say('vigia', 'Bendito seja! Leve este cinto de vigia; quem vigia mantém os lombos cingidos.')],
      reward: 'cinto',
    },
  ],
  scrolls: [
    { id: 's1', at: [62, 52], ref: 'Marcos 13:13', text: 'Mas aquele que perseverar até ao fim, esse será salvo.' },
    { id: 's2', at: [6, 12], ref: 'Marcos 13:31', text: 'Passará o céu e a terra, mas as minhas palavras não passarão.' },
    { id: 's3', at: [62, 20], ref: 'Marcos 13:33', text: 'Olhai, vigiai e orai, porque não sabeis quando chegará o tempo.' },
  ],
  message: {
    title: 'Permanecer preparado, fiel e vigilante',
    summary:
      'Diante das pedras do templo, Jesus anunciou que tudo o que é feito por mãos humanas passa. No Monte das Oliveiras, alertou os discípulos para não serem enganados, falou de dificuldades e de perseverança, e afirmou que ninguém sabe o dia nem a hora. Sua instrução final foi para todos: "Vigiai".',
    verses: [
      { ref: 'Marcos 13:31', text: 'Passará o céu e a terra, mas as minhas palavras não passarão.' },
      { ref: 'Marcos 13:37', text: 'E as coisas que vos digo digo-as a todos: Vigiai.' },
    ],
    reflection:
      'Vigiar não é viver com medo nem tentar adivinhar datas. É viver acordado: cuidando da fé, fazendo cada um a sua obra, mantendo a lâmpada acesa no dia a dia. As palavras de Jesus são o chão firme quando tudo ao redor parece passageiro.',
  },
  quiz: [
    { q: 'O que Jesus disse sobre as pedras do templo?', options: ['"Durarão para sempre"', '"Não ficará pedra sobre pedra"', '"Serão de ouro"', '"Construí mais"'], correct: 1, explain: 'Marcos 13:2.' },
    { q: 'Quem sabe o dia e a hora, segundo Marcos 13:32?', options: ['Os anjos', 'Os sacerdotes', 'Somente o Pai', 'Qualquer um que estude'], correct: 2, explain: 'Marcos 13:32: "ninguém sabe... senão o Pai". Por isso não se deve marcar datas.' },
    { q: 'Qual foi a instrução final de Jesus a todos?', options: ['"Fugi"', '"Vigiai"', '"Dormi"', '"Calculai as datas"'], correct: 1, explain: 'Marcos 13:37: "E as coisas que vos digo digo-as a todos: Vigiai".' },
  ],
};
addUse(ch, 'joao', 'tinteiro', [say('joao', 'Um tinteiro! Agora você tem pena, tinta e pergaminho.')]);
addUse(ch, 'vigia', 'tefilin', [say('vigia', 'Um cordão de oração. Vigiar e orar andam juntos.')]);
export default ch;
