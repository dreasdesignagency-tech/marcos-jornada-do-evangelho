import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc } from './common';

// Marcos 4 — O Reino em parábolas (Mar da Galileia, campos e barcos)
const ch: ChapterDef = {
  n: 4,
  title: 'O Reino em parábolas',
  ref: 'Marcos 4',
  setting: 'Mar da Galileia e campos',
  intro:
    'A multidão é tão grande à beira do mar que Jesus entra num barco para ensinar. Do barco, Ele conta histórias simples sobre sementes, solos e colheitas — histórias que escondem tesouros para quem tem ouvidos para ouvir.',
  map: { kind: 'ref', key: 'galileia', ambience: 'day' },
  cell: 32,
  spawn: [30, 21],
  music: 'sea',
  messageAt: [29, 23],
  zones: [
    { id: 'praia', name: 'Beira-mar', at: [33, 24], r: 3 },
    { id: 'campo', name: 'Campos do semeador', at: [7, 27], r: 3 },
    { id: 'colina', name: 'Colina das escadas', at: [8, 24], r: 2 },
    { id: 'cais', name: 'Cais dos barcos', at: [30, 26], r: 2 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [33, 24], { role: 'O Mestre que ensina por parábolas' }),
    npc('semeador', 'Joel, o semeador', 'campones', [11, 27], {
      gives: 'sementes', role: 'Agricultor da Galileia',
      uses: [{ item: 'espigas', lines: [say('semeador', 'Espigas de trigo maduras! Da boa terra sai fruto assim. Obrigado por mostrá-las.')] }],
      lines: [say('semeador', 'Semear é um ato de esperança. Leve este saquinho de sementes: um dia, num jardim, elas florescerão.')],
    }),
    npc('velho', 'Ancião Baruque', 'idoso', [14, 23], {
      gives: 'grao_mostarda', role: 'Ancião da vila',
      lines: [say('velho', 'Vê esta semente minúscula? É de mostarda. Guarde-a — ainda vai ouvir falar sobre fé que move montes.')],
    }),
    npc('pescador', 'Natanael, o pescador', 'pescador', [29, 26], {
      gives: 'peixe_seco', role: 'Pescador do cais',
      uses: [{ item: 'rede', lines: [say('pescador', 'A rede de André! Com ela remendo a minha. Que Deus te pague.')] }],
      lines: [say('pescador', 'Hoje o mar está calmo, mas no fim da tarde o vento muda. Leve estes peixes secos para a viagem.')],
    }),
    npc('agricultora', 'Ana, a agricultora', 'mulher2', [4, 23], { role: 'Lavradora', lines: [say('agricultora', 'Minha colheita foi pequena este ano...')] }),
    npc('pedro', 'Pedro', 'pedro', [31, 25], { showFrom: 'barco', role: 'Apóstolo e pescador' }),
  ],
  steps: [
    {
      id: 'encontrar', title: 'Encontrar Jesus à beira-mar', kind: 'talk', npc: 'jesus',
      hint: 'Jesus está ensinando na praia, perto do cais.',
      lines: [
        narr('E tornou a ensinar junto do mar, e ajuntou-se a ele grande multidão, de sorte que ele entrou e assentou-se num barco, sobre o mar.', 'Marcos 4:1'),
        say('jesus', 'Ouvi: Eis que saiu o semeador a semear.', 'Marcos 4:3'),
      ],
    },
    {
      id: 'parabola', title: 'Ouvir a parábola do semeador', kind: 'scene', at: [9, 26], r: 3,
      hint: 'Vá aos campos a oeste e veja o que a parábola descreve.',
      scene: [
        show('jesus', [8, 25]),
        N('Na parábola, parte da semente caiu à beira do caminho e as aves a comeram; outra parte caiu em pedregais e secou por falta de raiz; outra caiu entre espinhos, que a sufocaram; e outra caiu em boa terra e deu fruto.', 'Resumo de Marcos 4:4-8'),
        S('jesus', 'Quem tem ouvidos para ouvir, que ouça.', 'Marcos 4:9'),
      ],
    },
    {
      id: 'solos', title: 'Identificar os quatro tipos de solo', kind: 'talk', npc: 'semeador',
      hint: 'Converse com Joel, o semeador, sobre os solos do campo.',
      lines: [
        say('semeador', 'Responda, jovem escriba: segundo a parábola, que solo deu fruto a trinta, a sessenta e a cem por um?', ),
        {
          who: 'semeador', text: 'Escolha:',
          choices: [
            { text: 'O solo à beira do caminho', ok: false, reply: 'Ali as aves comeram a semente. É como quando a palavra é ouvida, mas logo é tirada (Mc 4:15). Tente de novo.' },
            { text: 'O solo pedregoso', ok: false, reply: 'Ali brotou, mas secou por não ter raiz (Mc 4:16-17). Tente de novo.' },
            { text: 'O solo com espinhos', ok: false, reply: 'Os espinhos sufocaram a planta, como os cuidados do mundo sufocam a palavra (Mc 4:18-19). Tente de novo.' },
            { text: 'A boa terra', ok: true, reply: 'Isso! São os que ouvem a palavra, a recebem e dão fruto (Mc 4:20).' },
          ],
        },
      ],
    },
    {
      id: 'plantar', title: 'Desafio: semear na boa terra', kind: 'challenge',
      hint: 'Encontre os canteiros de boa terra e semeie neles. Cuidado com os outros solos!',
      challenge: {
        type: 'plant',
        plots: [
          { at: [3, 26], soil: 'caminho' }, { at: [5, 26], soil: 'boa' }, { at: [7, 26], soil: 'pedregoso' }, { at: [9, 26], soil: 'espinhos' },
          { at: [3, 28], soil: 'boa' }, { at: [5, 28], soil: 'espinhos' }, { at: [7, 28], soil: 'pedregoso' }, { at: [9, 28], soil: 'boa' },
        ],
      },
    },
    {
      id: 'mostarda', title: 'Aprender sobre a semente de mostarda', kind: 'talk', npc: 'velho',
      hint: 'O ancião Baruque, perto da colina, guarda uma semente especial.',
      lines: [
        say('velho', 'Jesus comparou o Reino de Deus a algo bem pequeno...'),
        narr('É como um grão de mostarda, que, quando se semeia na terra, é a menor de todas as sementes que há na terra; mas, tendo sido semeado, cresce e faz-se a maior de todas as hortaliças.', 'Marcos 4:31-32'),
      ],
    },
    {
      id: 'barco', title: 'Embarcar com os discípulos', kind: 'reach', at: [31, 26], r: 1.5,
      hint: 'Volte ao cais: ao cair da tarde, Jesus quer passar para a outra margem.',
      lines: [
        narr('E, naquele dia, sendo já tarde, disse-lhes: Passemos para a outra banda.', 'Marcos 4:35'),
        narr('E levantou-se grande temporal de vento, e subiam as ondas por cima do barco, de maneira que já se enchia.', 'Marcos 4:37'),
      ],
      scene: [fx('storm')],
    },
    {
      id: 'tempestade', title: 'Desafio: a tempestade no mar', kind: 'challenge', helpItem: 'remo',
      hint: 'Equilibre o barco no meio da tempestade!',
      challenge: { type: 'balance', duration: 25, prompt: 'Use ← → (ou os botões) para manter o barco equilibrado enquanto as ondas batem.' },
      scene: [
        show('jesus', [31, 25]),
        N('E ele estava na popa, dormindo sobre uma almofada, e despertaram-no, dizendo-lhe:', 'Marcos 4:38'),
        S('pedro', 'Mestre, não se te dá que pereçamos?', 'Marcos 4:38'),
        S('jesus', 'Cala-te, aquieta-te.', 'Marcos 4:39'),
        fx('calm'),
        N('E o vento se aquietou, e houve grande bonança.', 'Marcos 4:39'),
        S('jesus', 'Por que sois tão tímidos? Ainda não tendes fé?', 'Marcos 4:40'),
        N('E sentiram um grande temor e diziam uns aos outros: Mas quem é este, que até o vento e o mar lhe obedecem?', 'Marcos 4:41'),
      ],
    },
  ],
  side: [
    {
      id: 'colheita', title: 'Esperança para a colheita', giver: 'agricultora', needs: 'espigas', needsFrom: 'Marcos 2',
      hint: 'Ana teve uma colheita pequena e está desanimada.',
      ask: [say('agricultora', 'Minha colheita foi pequena e estou desanimada. Se eu visse espigas cheias, lembraria que a terra ainda pode dar fruto.')],
      thanks: [say('agricultora', 'Que espigas cheias! A terra ainda dá fruto. Leve esta cesta de vime; vai precisar dela quando sobrar pão.')],
      reward: 'cesta',
    },
  ],
  scrolls: [
    { id: 's1', at: [1, 18], ref: 'Marcos 4:9', text: 'Quem tem ouvidos para ouvir, que ouça.' },
    { id: 's2', at: [42, 18], ref: 'Marcos 4:20', text: 'E os que foram semeados em boa terra são os que ouvem a palavra, e a recebem, e dão fruto, um a trinta, outro a sessenta, e outro a cem por um.' },
    { id: 's3', at: [20, 5], ref: 'Marcos 4:41', text: 'Mas quem é este, que até o vento e o mar lhe obedecem?' },
  ],
  message: {
    title: 'Receber a Palavra e confiar em meio às tempestades',
    summary:
      'Jesus ensinou por parábolas: a semente é a Palavra, e o solo representa a maneira como a recebemos. O Reino começa pequeno como um grão de mostarda, mas cresce. À noite, no mar, uma tempestade assustou os discípulos, e Jesus acalmou o vento e as ondas com uma palavra.',
    verses: [
      { ref: 'Marcos 4:20', text: 'Os que foram semeados em boa terra são os que ouvem a palavra, e a recebem, e dão fruto.' },
      { ref: 'Marcos 4:39', text: 'Cala-te, aquieta-te. E o vento se aquietou, e houve grande bonança.' },
    ],
    reflection:
      'Ninguém escolhe as tempestades, mas podemos escolher em quem confiar no meio delas. E o coração, como um campo, pode ser cuidado: tirar pedras, arrancar espinhos, abrir espaço para a Palavra crescer.',
  },
  quiz: [
    { q: 'Na parábola, o que acontece com a semente que cai entre espinhos?', options: ['Dá muito fruto', 'É comida pelas aves', 'É sufocada e não dá fruto', 'Seca na rocha'], correct: 2, explain: 'Marcos 4:7 e 4:18-19: os espinhos sufocam a planta, como os cuidados do mundo sufocam a Palavra.' },
    { q: 'A que Jesus comparou o Reino de Deus em Marcos 4:31?', options: ['A um grão de mostarda', 'A uma pérola', 'A uma ovelha perdida', 'A uma lâmpada apagada'], correct: 0, explain: 'Marcos 4:31-32: o grão de mostarda é a menor semente, mas cresce e se torna a maior das hortaliças.' },
    { q: 'O que Jesus disse ao vento e ao mar?', options: ['"Afastai-vos!"', '"Cala-te, aquieta-te"', '"Voltai amanhã"', '"Obedecei aos discípulos"'], correct: 1, explain: 'Marcos 4:39: "Cala-te, aquieta-te. E o vento se aquietou, e houve grande bonança".' },
  ],
};
export default ch;
