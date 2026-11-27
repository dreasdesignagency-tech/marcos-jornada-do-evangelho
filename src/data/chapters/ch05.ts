import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc } from './common';

// Marcos 5 — O poder que liberta (gerasenos, sepulcros, multidão e casa de Jairo)
const ch: ChapterDef = {
  n: 5,
  title: 'O poder que liberta',
  ref: 'Marcos 5',
  setting: 'Região dos gerasenos e a vila',
  intro:
    'O barco chega à outra margem, na terra dos gerasenos. Entre os penhascos há sepulcros escavados na rocha, e dali vêm gritos de um homem que ninguém conseguia conter. (Neste jogo, o mesmo cenário representa as duas margens do mar.)',
  map: { kind: 'ref', key: 'galileia', ambience: 'dusk' },
  cell: 32,
  spawn: [30, 26],
  music: 'mystery',
  messageAt: [31, 21],
  zones: [
    { id: 'sepulcros', name: 'Sepulcros nos penhascos', at: [41, 5], r: 2.5 },
    { id: 'gerasa', name: 'Terra dos gerasenos', at: [32, 6], r: 3 },
    { id: 'multidao', name: 'Rua da multidão', at: [33, 21], r: 3 },
    { id: 'casajairo', name: 'Casa de Jairo', at: [27, 20], r: 2 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [39, 7], { showFrom: 'libertacao', role: 'O Senhor' }),
    npc('atormentado', 'Homem de Gerasa', 'atormentado', [41, 5], {
      gives: 'manto', role: 'Liberto por Jesus',
      lines: [
        say('atormentado', 'Estou assentado, vestido e em perfeito juízo. Ele teve misericórdia de mim!'),
        say('atormentado', 'Leve este manto. Ganhei roupas novas — um dia você vai estendê-lo no caminho de um Rei.'),
      ],
    }),
    npc('jairo', 'Jairo', 'jairo', [30, 20], {
      gives: 'rolo_isaias', role: 'Chefe da sinagoga',
      lines: [say('jairo', 'Como chefe da sinagoga, eu lia os rolos dos profetas. Leve este trecho de Isaías: "A minha casa será chamada casa de oração".')],
    }),
    npc('mulherFe', 'A mulher que tocou o manto', 'mulher2', [37, 22], {
      showFrom: 'casa', gives: 'franja', role: 'Curada pela fé',
      lines: [say('mulherFe', 'Doze anos de sofrimento... e bastou tocar a orla do seu manto. Fique com este fio de franja; outros também vão querer tocar nele.')],
    }),
    npc('menina', 'Filha de Jairo', 'menina', [26, 21], {
      showFrom: 'talita', gives: 'flor', role: 'Levantada por Jesus aos doze anos',
      uses: [{ item: 'tamaras', lines: [narr('Jesus mandou que dessem de comer à menina (Mc 5:43). Você oferece as tâmaras de Rute.'), say('menina', 'Que doces! Obrigada!')] }],
      lines: [say('menina', 'Eu dormia... e ouvi: "Menina, levanta-te!". Tome esta flor do nosso quintal.')],
    }),
    npc('mendigo', 'Mendigo da praça', 'cego', [33, 17], { role: 'Morador da vila', lines: [say('mendigo', 'Alguém tem um pedaço de pão?')] }),
    npc('pastor', 'Guardador de porcos', 'homem3', [30, 6], {
      gives: 'cajado_pastor', role: 'Testemunha em Gerasa',
      lines: [say('pastor', 'Vi tudo e corri para contar na cidade! Tome meu cajado de pastor: quem guarda rebanhos sabe o que é ter ovelhas dispersas.')],
    }),
  ],
  steps: [
    {
      id: 'sepulcros', title: 'Explorar a região dos sepulcros', kind: 'reach', at: [40, 6], r: 2,
      hint: 'Suba pela trilha do deserto até a caverna nos penhascos, ao nordeste.',
      lines: [
        narr('Um homem com espírito imundo tinha a sua morada nos sepulcros, e nem ainda com cadeias o podia alguém prender.', 'Marcos 5:2-3'),
        narr('E andava sempre, de dia e de noite, clamando pelos montes e pelos sepulcros.', 'Marcos 5:5'),
      ],
    },
    {
      id: 'libertacao', title: 'Acompanhar a libertação do homem atormentado', kind: 'scene', at: [40, 6], r: 3,
      hint: 'Permaneça perto da caverna.',
      scene: [
        show('jesus', [38, 8]),
        mv('jesus', [39, 6]),
        N('E, quando viu Jesus ao longe, correu e adorou-o.', 'Marcos 5:6'),
        S('jesus', 'Sai deste homem, espírito imundo.', 'Marcos 5:8'),
        fx('flash'),
        N('E foram ter com Jesus, e viram o endemoninhado assentado, e vestido, e em perfeito juízo.', 'Marcos 5:15'),
        S('jesus', 'Vai para tua casa, para os teus, e anuncia-lhes quão grandes coisas o Senhor te fez, e como teve misericórdia de ti.', 'Marcos 5:19'),
        hide('jesus'),
      ],
    },
    {
      id: 'jairo', title: 'Conhecer Jairo', kind: 'talk', npc: 'jairo',
      hint: 'Volte à vila: Jairo, chefe da sinagoga, procura Jesus desesperado.',
      lines: [
        narr('E eis que chegou um dos principais da sinagoga, por nome Jairo, e, vendo-o, prostrou-se aos seus pés.', 'Marcos 5:22'),
        say('jairo', 'Minha filha está à morte; rogo-te que venhas e lhe imponhas as mãos para que sare, e viva.', 'Marcos 5:23'),
      ],
    },
    {
      id: 'multidao', title: 'Desafio: atravessar a multidão', kind: 'challenge',
      hint: 'Uma grande multidão aperta Jesus. Abra caminho até o leste da rua em 60 segundos!',
      challenge: { type: 'crowd', start: [28, 23], target: [37, 22], people: 16, area: [29, 18, 8, 5], time: 60 },
      scene: [
        show('jesus', [36, 21]),
        show('mulherFe', [37, 22]),
        N('E certa mulher, que havia doze anos tinha um fluxo de sangue, ouvindo falar de Jesus, veio por detrás, entre a multidão, e tocou na sua veste.', 'Marcos 5:25-27'),
        S('jesus', 'Quem tocou nas minhas vestes?', 'Marcos 5:30'),
        N('Então a mulher, temendo e tremendo, aproximou-se, e prostrou-se diante dele, e disse-lhe toda a verdade.', 'Marcos 5:33'),
        S('jesus', 'Filha, a tua fé te salvou; vai em paz e sê curada deste teu mal.', 'Marcos 5:34'),
      ],
    },
    {
      id: 'casa', title: 'Chegar à casa de Jairo', kind: 'reach', at: [27, 20], r: 1.6,
      hint: 'Siga com Jesus até a casa de Jairo, a oeste da praça.',
      lines: [
        narr('Chegaram alguns da casa do principal da sinagoga, a quem disseram: A tua filha está morta.', 'Marcos 5:35'),
        say('jesus', 'Não temas, crê somente.', 'Marcos 5:36'),
      ],
      scene: [show('jesus', [28, 20])],
    },
    {
      id: 'talita', title: 'Testemunhar a menina ser levantada', kind: 'scene', at: [27, 20], r: 2.5,
      hint: 'Fique junto à casa de Jairo.',
      scene: [
        show('jesus', [28, 20]),
        N('E, tomando a mão da menina, disse-lhe:', 'Marcos 5:41'),
        S('jesus', 'Talita cumi; que, traduzido, é: Menina, a ti te digo: levanta-te.', 'Marcos 5:41'),
        show('menina', [26, 21]),
        fx('sparkle'),
        N('E logo a menina se levantou e andava, pois já tinha doze anos; e assombraram-se com grande espanto.', 'Marcos 5:42'),
        N('E mandou que lhe dessem de comer.', 'Marcos 5:43'),
      ],
    },
  ],
  side: [
    {
      id: 'pao', title: 'Pão para o mendigo', giver: 'mendigo', needs: 'pao', needsFrom: 'Marcos 3',
      hint: 'Um homem pobre pede comida perto das escadas da vila.',
      ask: [say('mendigo', 'Não como desde ontem. Você teria um pedaço de pão?')],
      thanks: [say('mendigo', 'Pão de viagem! Deus abençoe sua bondade. Tome este punhado de sal: dá sabor a tudo, até ao pouco que temos.')],
      reward: 'sal',
    },
  ],
  scrolls: [
    { id: 's1', at: [16, 3], ref: 'Marcos 5:19', text: 'Vai para tua casa, para os teus, e anuncia-lhes quão grandes coisas o Senhor te fez, e como teve misericórdia de ti.' },
    { id: 's2', at: [22, 10], ref: 'Marcos 5:34', text: 'Filha, a tua fé te salvou; vai em paz e sê curada deste teu mal.' },
    { id: 's3', at: [6, 29], ref: 'Marcos 5:36', text: 'Não temas, crê somente.' },
  ],
  message: {
    title: 'Autoridade sobre o sofrimento e a morte',
    summary:
      'Em Gerasa, Jesus libertou um homem que vivia entre os sepulcros e o enviou para contar o que Deus fez. De volta, uma mulher que sofria havia doze anos foi curada ao tocar sua veste com fé. E na casa de Jairo, quando todos diziam que era tarde demais, Jesus disse "Não temas, crê somente" e levantou a menina.',
    verses: [
      { ref: 'Marcos 5:34', text: 'Filha, a tua fé te salvou; vai em paz.' },
      { ref: 'Marcos 5:36', text: 'Não temas, crê somente.' },
    ],
    reflection:
      'Jesus parou no meio da multidão por uma única pessoa. Para Ele, ninguém é só "mais um". E quando parece tarde demais, sua palavra continua: "Não temas, crê somente".',
  },
  quiz: [
    { q: 'Onde morava o homem atormentado de Gerasa?', options: ['No templo', 'Nos sepulcros', 'Num barco', 'Na casa de Jairo'], correct: 1, explain: 'Marcos 5:3: ele "tinha a sua morada nos sepulcros".' },
    { q: 'O que Jesus disse à mulher curada?', options: ['"Não contes a ninguém"', '"Filha, a tua fé te salvou; vai em paz"', '"Volta para o templo"', '"Dá ofertas aos sacerdotes"'], correct: 1, explain: 'Marcos 5:34.' },
    { q: 'O que significa "Talita cumi"?', options: ['"Paz seja contigo"', '"Menina, a ti te digo: levanta-te"', '"Deus é bom"', '"Vinde e vede"'], correct: 1, explain: 'Marcos 5:41 traz a tradução: "Menina, a ti te digo: levanta-te".' },
  ],
};
export default ch;
