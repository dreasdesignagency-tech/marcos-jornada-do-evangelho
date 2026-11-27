import type { ChapterDef } from '../types';
import { narr, say, N, S, mv, show, hide, fx, npc } from './common';

// Marcos 2 — Uma fé que rompe barreiras (Cafarnaum)
const ch: ChapterDef = {
  n: 2,
  title: 'Uma fé que rompe barreiras',
  ref: 'Marcos 2',
  setting: 'Cafarnaum',
  intro:
    'Alguns dias depois, Jesus voltou a Cafarnaum e logo se espalhou a notícia de que Ele estava em casa. Quatro amigos chegam à vila carregando alguém muito especial para eles...',
  map: { kind: 'ref', key: 'galileia', ambience: 'day' },
  cell: 32,
  spawn: [17, 27],
  music: 'village',
  messageAt: [30, 22],
  zones: [
    { id: 'entrada', name: 'Entrada da vila', at: [22, 26], r: 2.5 },
    { id: 'praca', name: 'Praça do poço', at: [32, 21], r: 3 },
    { id: 'telhados', name: 'Escadas dos telhados', at: [32, 16], r: 2 },
    { id: 'coletoria', name: 'Coletoria de impostos', at: [40, 23], r: 2.5 },
    { id: 'campos', name: 'Campos de trigo', at: [6, 27], r: 3 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [28, 20], { showFrom: 'cura', role: 'O Mestre' }),
    npc('eliu', 'Eliú, amigo do paralítico', 'homem2', [23, 26], {
      gives: 'esteira', role: 'Um dos quatro amigos',
      lines: [say('eliu', 'Carregamos nosso amigo pela esteira desde o outro lado da vila. Não vamos desistir dele!')],
    }),
    npc('paralitico', 'O paralítico', 'enfermo', [21, 26], { hideAfter: 'cura', role: 'Curado por Jesus', lines: [say('paralitico', 'Meus amigos acreditam que Jesus pode me ajudar. Eu também quero acreditar.')] }),
    npc('curado', 'O homem curado', 'enfermo', [25, 23], {
      showFrom: 'levi', gives: 'cajado', wander: 1,
      lines: [say('curado', 'Eu me levantei! Tomei o meu leito e saí andando diante de todos. Leve este cajado: não preciso mais dele, mas alguém na montanha vai precisar.')],
    }),
    npc('natan', 'Natã, o dono da casa', 'homem', [26, 21], {
      gives: 'pao_asmo', role: 'Morador de Cafarnaum',
      uses: [{ item: 'tamaras', lines: [say('natan', 'Tâmaras de Rute! Ela é generosa com todos. Obrigado por trazê-las.')] }],
      lines: [say('natan', 'A casa está tão cheia que nem na porta cabe mais ninguém! Tome este pão sem fermento; na Páscoa ele terá um significado especial.')],
    }),
    npc('escriba', 'Escriba', 'escriba', [33, 20], {
      gives: 'tabuinha', role: 'Mestre da Lei',
      lines: [
        say('escriba', 'Quem pode perdoar pecados, senão Deus? Eu observo tudo com atenção.'),
        narr('O escriba lhe entrega uma tabuinha de escrita. "Um escriba precisa registrar nomes com cuidado", diz ele.'),
      ],
    }),
    npc('levi', 'Levi (Mateus)', 'levi', [40, 23], {
      face: 'down', gives: 'moeda', role: 'Cobrador de impostos chamado por Jesus',
      lines: [say('levi', 'Contei moedas a vida inteira. Esta aqui é uma moeda de tributo — guarde-a; ainda vamos falar de César e de Deus.')],
    }),
    npc('fariseu', 'Fariseu', 'fariseu', [7, 27], {
      gives: 'espigas', role: 'Questionador do sábado',
      lines: [say('fariseu', 'Estas espigas foram colhidas no sábado! Tome-as e pense: o que é lícito fazer no dia de descanso?')],
    }),
    npc('debora', 'Débora, a mercadora', 'mulher3', [35, 22], {
      role: 'Vendedora da praça',
      lines: [say('debora', 'Levi vai dar um banquete e precisamos de muita água!')],
    }),
  ],
  steps: [
    {
      id: 'amigos', title: 'Encontrar os amigos do paralítico', kind: 'talk', npc: 'eliu',
      hint: 'Os quatro amigos estão na entrada da vila, a leste dos campos.',
      lines: [
        narr('E vieram ter com ele, conduzindo um paralítico, trazido por quatro.', 'Marcos 2:3'),
        say('eliu', 'Jesus está naquela casa perto da praça. Venha conosco, precisamos chegar até Ele!'),
      ],
    },
    {
      id: 'casa', title: 'Chegar à casa onde Jesus está', kind: 'reach', at: [28, 21], r: 2,
      hint: 'Siga para a casa na praça de Cafarnaum.',
      lines: [
        narr('E logo se ajuntaram tantos, que nem ainda nos lugares junto à porta cabiam; e anunciava-lhes a palavra.', 'Marcos 2:2'),
        say('marcos', 'É impossível passar pela porta! Precisamos de outro caminho...'),
      ],
      scene: [fx('crowd')],
    },
    {
      id: 'telhado', title: 'Descobrir um caminho alternativo', kind: 'reach', at: [32, 16], r: 1.6,
      hint: 'As casas têm telhados planos. Procure as escadas ao norte da praça.',
      lines: [say('marcos', 'Esta escada leva aos telhados! Daqui de cima podemos abrir uma passagem. Mas vamos precisar de cordas.')],
    },
    {
      id: 'cordas', title: 'Desafio: encontrar cordas', kind: 'challenge', helpItem: 'corda',
      hint: 'Procure cordas pelos telhados e pela parte alta da vila.',
      challenge: { type: 'collect', label: 'Cordas encontradas', icon: 'corda', at: [[29, 16], [33, 17], [40, 17], [42, 18], [37, 20]] },
    },
    {
      id: 'cura', title: 'Acompanhar a cura do paralítico', kind: 'scene', at: [31, 17], r: 2.5,
      hint: 'Volte ao alto da escada para baixar o paralítico.',
      scene: [
        show('jesus', [28, 20]),
        N('E, não podendo aproximar-se dele, por causa da multidão, descobriram o telhado onde estava, e, fazendo um buraco, baixaram o leito em que jazia o paralítico.', 'Marcos 2:4'),
        S('jesus', 'Filho, perdoados estão os teus pecados.', 'Marcos 2:5'),
        N('E estavam ali assentados alguns dos escribas, que arrazoavam em seus corações: Quem pode perdoar pecados, senão Deus?', 'Marcos 2:6-7'),
        S('jesus', 'A ti te digo: Levanta-te, e toma o teu leito, e vai para tua casa.', 'Marcos 2:11'),
        fx('sparkle'),
        N('E levantou-se e, tomando logo o leito, saiu em presença de todos, de sorte que todos se admiraram e glorificaram a Deus, dizendo: Nunca tal vimos.', 'Marcos 2:12'),
      ],
    },
    {
      id: 'levi', title: 'Encontrar Levi', kind: 'talk', npc: 'levi',
      hint: 'Levi está sentado na coletoria, perto do cais.',
      lines: [
        narr('E, passando, viu Levi, filho de Alfeu, sentado na alfândega, e disse-lhe: Segue-me. E, levantando-se, o seguiu.', 'Marcos 2:14'),
        say('levi', 'Ninguém esperava que um cobrador de impostos fosse chamado. Vou oferecer um banquete em minha casa!'),
      ],
      scene: [
        show('jesus', [38, 22]),
        N('E aconteceu que, estando sentado à mesa em casa deste, também estavam assentados à mesa com Jesus e seus discípulos muitos publicanos e pecadores.', 'Marcos 2:15'),
        S('jesus', 'Os sãos não necessitam de médico, mas sim os que estão doentes; eu não vim chamar os justos, mas sim os pecadores ao arrependimento.', 'Marcos 2:17'),
      ],
    },
    {
      id: 'sabado', title: 'Ouvir sobre o perdão e o sábado', kind: 'talk', npc: 'fariseu',
      hint: 'Nos campos de trigo, a oeste, alguns fariseus discutem com os discípulos.',
      lines: [
        narr('E aconteceu que, passando ele num dia de sábado pelas searas, os seus discípulos, caminhando, começaram a colher espigas.', 'Marcos 2:23'),
        say('fariseu', 'Vês? Por que fazem no sábado o que não é lícito?', 'Marcos 2:24'),
      ],
      scene: [
        show('jesus', [5, 27]),
        S('jesus', 'O sábado foi feito por causa do homem, e não o homem por causa do sábado.', 'Marcos 2:27'),
        S('jesus', 'Assim, o Filho do homem até do sábado é Senhor.', 'Marcos 2:28'),
      ],
    },
  ],
  side: [
    {
      id: 'agua-banquete', title: 'Água para o banquete', giver: 'debora', needs: 'cantaro', needsFrom: 'Marcos 1',
      hint: 'Débora precisa de um cântaro para levar água ao banquete de Levi.',
      ask: [say('debora', 'O banquete de Levi vai receber muita gente, e o meu cântaro rachou. Você teria um cântaro para me emprestar?')],
      thanks: [say('debora', 'Que bênção! Com isto encho as talhas. Leve este azeite de oliva como agradecimento.')],
      reward: 'azeite',
    },
  ],
  scrolls: [
    { id: 's1', at: [3, 17], ref: 'Marcos 2:5', text: 'E Jesus, vendo a fé deles, disse ao paralítico: Filho, perdoados estão os teus pecados.' },
    { id: 's2', at: [45, 10], ref: 'Marcos 2:17', text: 'Os sãos não necessitam de médico, mas sim os que estão doentes; eu não vim chamar os justos, mas sim os pecadores ao arrependimento.' },
    { id: 's3', at: [9, 2], ref: 'Marcos 2:27', text: 'O sábado foi feito por causa do homem, e não o homem por causa do sábado.' },
  ],
  message: {
    title: 'A fé, o perdão e o poder restaurador de Jesus',
    summary:
      'Quatro amigos não desistiram: abriram o telhado para levar o paralítico até Jesus. Antes de curá-lo, Jesus perdoou seus pecados, mostrando que veio restaurar a pessoa por inteiro. Depois, chamou Levi, um cobrador de impostos, sentou-se à mesa com pecadores e ensinou que o sábado foi feito para o bem do ser humano.',
    verses: [
      { ref: 'Marcos 2:5', text: 'E Jesus, vendo a fé deles, disse ao paralítico: Filho, perdoados estão os teus pecados.' },
      { ref: 'Marcos 2:17', text: 'Eu não vim chamar os justos, mas sim os pecadores ao arrependimento.' },
    ],
    reflection:
      'Repare: Jesus viu "a fé deles" — dos amigos. Às vezes somos nós que carregamos alguém até Jesus, com oração, presença e criatividade. Quem você pode ajudar a "levar pelo telhado" esta semana?',
  },
  quiz: [
    { q: 'Como os amigos levaram o paralítico até Jesus?', options: ['Pela porta dos fundos', 'Abriram o telhado e baixaram o leito', 'Esperaram a multidão ir embora', 'Pediram a Jesus que saísse'], correct: 1, explain: 'Marcos 2:4: "descobriram o telhado onde estava, e, fazendo um buraco, baixaram o leito".' },
    { q: 'O que Jesus disse primeiro ao paralítico?', options: ['"Levanta-te e anda"', '"Filho, perdoados estão os teus pecados"', '"Volte amanhã"', '"Quem te trouxe?"'], correct: 1, explain: 'Marcos 2:5: antes da cura física, Jesus declarou o perdão dos pecados.' },
    { q: 'Qual era a ocupação de Levi quando Jesus o chamou?', options: ['Pescador', 'Escriba', 'Cobrador de impostos', 'Soldado'], correct: 2, explain: 'Marcos 2:14: Levi estava "sentado na alfândega", isto é, na coletoria de impostos.' },
  ],
};
export default ch;
