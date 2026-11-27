import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 14 — A entrega (Betânia, cenáculo e Getsêmani — noite)
const ch: ChapterDef = {
  n: 14,
  title: 'A entrega',
  ref: 'Marcos 14',
  setting: 'Betânia, cenáculo e Getsêmani',
  intro:
    'Faltam dois dias para a Páscoa. A noite cai sobre Betânia e Jerusalém; lamparinas se acendem nas janelas. É uma noite silenciosa e decisiva, em que Jesus se entrega à vontade do Pai.',
  map: {
    kind: 'proc', w: 96, h: 44, base: 'darkgrass', ambience: 'night', seed: 14,
    features: [
      { f: 'rect', tile: 'dgrass', x: 0, y: 0, w: 28, h: 44 },
      { f: 'village', x: 2, y: 2, w: 24, h: 12, n: 3 },
      { f: 'obj', o: 'house', x: 14, y: 19, w: 7, h: 5 },
      { f: 'path', tile: 'dirt', pts: [[14, 22], [32, 22]], w: 3 },
      { f: 'rect', tile: 'wall', x: 30, y: 0, w: 2, h: 20 },
      { f: 'rect', tile: 'wall', x: 30, y: 25, w: 2, h: 19 },
      { f: 'rect', tile: 'stone', x: 32, y: 0, w: 30, h: 44 },
      { f: 'village', x: 33, y: 2, w: 28, h: 10, n: 4 },
      { f: 'obj', o: 'house', x: 46, y: 19, w: 8, h: 6, v: 1 },
      { f: 'obj', o: 'table', x: 46, y: 22, solid: false },
      { f: 'rect', tile: 'floor', x: 50, y: 30, w: 12, h: 10 },
      { f: 'obj', o: 'fire', x: 56, y: 34 },
      { f: 'rect', tile: 'wall', x: 62, y: 0, w: 2, h: 20 },
      { f: 'rect', tile: 'wall', x: 62, y: 25, w: 2, h: 19 },
      { f: 'path', tile: 'dirt', pts: [[32, 22], [62, 22], [80, 22]], w: 3 },
      { f: 'obj', o: 'lamp', x: 36, y: 20 }, { f: 'obj', o: 'lamp', x: 44, y: 26 }, { f: 'obj', o: 'lamp', x: 52, y: 20 },
      { f: 'obj', o: 'lamp', x: 70, y: 20 }, { f: 'obj', o: 'lamp', x: 82, y: 25 },
      { f: 'obj', o: 'bigrock', x: 84, y: 18 },
      { f: 'scatter', o: 'olive', x: 64, y: 0, w: 32, h: 44, n: 30 },
      { f: 'scatter', o: 'olive', x: 0, y: 14, w: 28, h: 30, n: 12 },
      { f: 'scatter', o: 'bush', x: 64, y: 0, w: 32, h: 44, n: 10 },
      { f: 'scatter', o: 'jar', x: 33, y: 13, w: 28, h: 16, n: 6, on: ['stone'] },
      { f: 'scatter', o: 'rock', x: 0, y: 0, w: 96, h: 44, n: 10, on: ['darkgrass', 'dgrass'] },
    ],
  },
  cell: 16,
  spawn: [8, 24],
  music: 'night',
  messageAt: [52, 37],
  zones: [
    { id: 'betania', name: 'Betânia', at: [14, 22], r: 6 },
    { id: 'jerusalem', name: 'Ruas de Jerusalém', at: [40, 22], r: 6 },
    { id: 'cenaculo', name: 'Cenáculo', at: [46, 23], r: 3 },
    { id: 'getsemani', name: 'Getsêmani', at: [80, 22], r: 6 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [15, 23], { role: 'O Filho que se entrega' }),
    npc('simao', 'Simão, o leproso', 'idoso', [11, 23], {
      gives: 'toalha', role: 'Anfitrião em Betânia',
      uses: [{ item: 'oleo_uncao', lines: [say('simao', 'Óleo de unção do templo? Esta noite, aqui em minha casa, o Mestre foi ungido com algo ainda mais precioso.')] }],
      lines: [say('simao', 'Sejam bem-vindos à minha casa. Leve esta toalha de linho; logo alguém precisará envolver com cuidado algo muito precioso.')],
    }),
    npc('mulher', 'A mulher do vaso de alabastro', 'mulher3', [17, 23], {
      gives: 'nardo', role: 'Ungiu Jesus em Betânia',
      lines: [say('mulher', 'Fiz o que estava ao meu alcance. Guarde este frasco vazio — ainda tem o perfume do nardo.')],
    }),
    npc('cantaro', 'Homem com o cântaro', 'homem2', [36, 24], {
      gives: 'lamparina_ceia', role: 'Guiou os discípulos ao cenáculo',
      uses: [
        { item: 'cantaro', lines: [say('cantaro', 'Você também carrega um cântaro! Então sabe o sinal: "um homem que leva um cântaro de água".')] },
        { item: 'chave', lines: [say('cantaro', 'A chave de bronze! É da casa do meu senhor, onde está o grande cenáculo mobiliado.')] },
      ],
      lines: [say('cantaro', 'Sigam-me. Leve esta lamparina; as ruas estão escuras esta noite.')],
    }),
    npc('joao', 'João', 'joao', [48, 23], {
      gives: 'hino', role: 'Apóstolo',
      uses: [
        { item: 'calice', lines: [say('joao', 'O cálice que Tiago lhe deu... Esta noite entendemos o que Ele queria dizer.')] },
        { item: 'pao_asmo', lines: [say('joao', 'Pão sem fermento, como na Páscoa. Natã de Cafarnaum tinha razão.')] },
        { item: 'ervas', lines: [say('joao', 'Ervas amargas para a ceia pascal. Obrigado.')] },
        { item: 'cajado_pastor', lines: [say('jesus', 'Ferirei o pastor, e as ovelhas se dispersarão.', 'Marcos 14:27')] },
      ],
      lines: [say('joao', 'Cantamos um hino antes de sair. Leve esta folha com as palavras; um dia você cantará de alegria.')],
    }),
    npc('pedro', 'Pedro', 'pedro', [57, 36], {
      showFrom: 'negacao', gives: 'recado_pedro', role: 'Apóstolo',
      uses: [
        { item: 'manta', lines: [say('pedro', 'Uma manta... obrigado. A noite está fria aqui no pátio.')] },
        { item: 'galo_figura', lines: [narr('Pedro olha a figura do galo e baixa os olhos em silêncio.')] },
        { item: 'cinto', lines: [say('pedro', 'Um cinto de vigia... e eu dormi quando Ele pediu para vigiar.')] },
      ],
      lines: [say('pedro', 'Eu O neguei... Se você O encontrar, diga-Lhe que sinto muito. Leve este recado.')],
    }),
    npc('serva', 'Serva do sumo sacerdote', 'mulher2', [53, 34], { showFrom: 'negacao', role: 'Serva no pátio' }),
    npc('judas', 'Judas Iscariotes', 'judas', [60, 30], { showFrom: 'prisao', hideAfter: 'prisao', role: 'Um dos doze' }),
    npc('guarda1', 'Guarda', 'soldado', [62, 30], { showFrom: 'prisao', hideAfter: 'prisao', role: 'Guarda' }),
    npc('guarda2', 'Guarda', 'soldado', [62, 32], { showFrom: 'prisao', hideAfter: 'prisao', role: 'Guarda' }),
  ],
  steps: [
    {
      id: 'uncao', title: 'Acompanhar a unção em Betânia', kind: 'talk', npc: 'mulher',
      hint: 'Em Betânia, na casa de Simão, uma mulher se aproxima de Jesus.',
      lines: [
        narr('E, estando ele em Betânia, assentado à mesa, em casa de Simão, o leproso, veio uma mulher que trazia um vaso de alabastro com unguento de nardo puro, de muito preço; e, quebrando o vaso, lho derramou sobre a cabeça.', 'Marcos 14:3'),
        narr('E alguns houve que em si mesmos se indignaram, dizendo: Para que se fez este desperdício de unguento?', 'Marcos 14:4'),
        say('jesus', 'Deixai-a; por que a molestais? Ela fez-me boa obra.', 'Marcos 14:6'),
        say('jesus', 'Em verdade vos digo que, em todas as partes do mundo onde este evangelho for pregado, também o que ela fez será contado para sua memória.', 'Marcos 14:9'),
      ],
      scene: [hide('jesus')],
    },
    {
      id: 'local', title: 'Encontrar o local da última ceia', kind: 'talk', npc: 'cantaro',
      hint: 'Entre em Jerusalém e procure um homem levando um cântaro de água.',
      lines: [
        narr('E enviou dois dos seus discípulos e disse-lhes: Ide à cidade, e um homem que leva um cântaro de água vos encontrará; segui-o.', 'Marcos 14:13'),
        say('cantaro', 'O Mestre manda dizer: Onde está o aposento em que hei de comer a Páscoa com os meus discípulos? — É ali, o grande cenáculo mobiliado.'),
      ],
    },
    {
      id: 'ceia', title: 'Acompanhar a celebração da ceia', kind: 'scene', at: [46, 23], r: 2.5,
      hint: 'Vá até o cenáculo, a casa grande no centro da cidade.',
      scene: [
        show('jesus', [46, 21]),
        N('E, chegada a tarde, foi com os doze. E, quando estavam assentados a comer, disse Jesus: Em verdade vos digo que um de vós, que comigo come, há de trair-me.', 'Marcos 14:17-18'),
        S('jesus', 'Tomai, comei; isto é o meu corpo.', 'Marcos 14:22'),
        S('jesus', 'Isto é o meu sangue, o sangue do Novo Testamento, que por muitos é derramado.', 'Marcos 14:24'),
        N('E, tendo cantado o hino, saíram para o monte das Oliveiras.', 'Marcos 14:26'),
        hide('jesus'),
      ],
    },
    {
      id: 'getsemani', title: 'Caminhar até o Getsêmani', kind: 'reach', at: [78, 22], r: 3,
      hint: 'Saia pela porta leste da cidade até o jardim das oliveiras.',
      lines: [
        say('jesus', 'Assentai-vos aqui, enquanto eu oro.', 'Marcos 14:32'),
        say('jesus', 'A minha alma está profundamente triste até a morte; ficai aqui e vigiai.', 'Marcos 14:34'),
      ],
      scene: [show('jesus', [82, 20])],
    },
    {
      id: 'oracao', title: 'Desafio: momento de oração e reflexão', kind: 'challenge', helpItem: 'candeia',
      hint: 'Permaneça em oração e vigilância. Não deixe o sono vencer.',
      challenge: {
        type: 'vigil', duration: 30,
        prompt: 'Toque/pressione ESPAÇO sempre que os olhos começarem a pesar. Fique em vigília com Jesus.',
        lines: [
          'Aba, Pai, todas as coisas te são possíveis; afasta de mim este cálice; não seja, porém, o que eu quero, mas o que tu queres. (Mc 14:36)',
          'Vigiai e orai, para que não entreis em tentação. (Mc 14:38)',
          'O espírito, na verdade, está pronto, mas a carne é fraca. (Mc 14:38)',
          'Silêncio. O vento passa entre as oliveiras.',
        ],
      },
      scene: [S('jesus', 'Simão, dormes? Não podes vigiar uma hora?', 'Marcos 14:37')],
    },
    {
      id: 'prisao', title: 'Acompanhar a prisão de Jesus', kind: 'scene', at: [80, 22], r: 4,
      hint: 'Fique no Getsêmani. Há tochas se aproximando.',
      scene: [
        show('judas', [68, 22]), show('guarda1', [67, 21]), show('guarda2', [67, 23]),
        mv('judas', [80, 21], 45),
        N('E logo, falando ele ainda, veio Judas, que era um dos doze, e com ele uma grande multidão com espadas e varapaus.', 'Marcos 14:43'),
        N('Então, deitaram-lhe as mãos e o prenderam.', 'Marcos 14:46'),
        N('Então, deixando-o, todos fugiram.', 'Marcos 14:50'),
        N('E um certo jovem o seguia, envolto num lençol sobre o corpo nu. E lançaram-lhe a mão. Mas ele, largando o lençol, fugiu nu.', 'Marcos 14:51-52'),
        N('Nota: uma antiga tradição sugere que esse jovem seria o próprio Marcos, mas o texto não diz o seu nome.'),
        hide('jesus'), hide('judas'), hide('guarda1'), hide('guarda2'),
      ],
    },
    {
      id: 'negacao', title: 'Registrar a negação de Pedro', kind: 'scene', at: [55, 36], r: 3,
      hint: 'Volte à cidade, até o pátio do sumo sacerdote, onde há uma fogueira.',
      scene: [
        show('pedro'), show('serva'),
        N('E Pedro o seguiu de longe até dentro do pátio do sumo sacerdote, e estava assentado com os servidores, aquentando-se ao lume.', 'Marcos 14:54'),
        S('serva', 'Tu também estavas com Jesus, o Nazareno.', 'Marcos 14:67'),
        S('pedro', 'Não o conheço, nem sei o que dizes.', 'Marcos 14:68'),
        N('E outra vez e uma terceira vez Pedro negou.', 'Marcos 14:70-71'),
        N('E o galo cantou segunda vez. E Pedro lembrou-se da palavra que Jesus lhe tinha dito: Antes que o galo cante duas vezes, três vezes me negarás. E, retirando-se dali, chorou.', 'Marcos 14:72'),
        { t: 'pose', pose: 'write' },
      ],
    },
  ],
  side: [
    {
      id: 'agua', title: 'Água para lavar', giver: 'simao', needs: 'jarro', needsFrom: 'Marcos 7',
      hint: 'Simão precisa de um jarro para receber os convidados.',
      ask: [say('simao', 'Chegaram muitos convidados e meu jarro de água quebrou. Você teria um jarro?')],
      thanks: [say('simao', 'Um jarro de purificação de Jerusalém! Obrigado. Leve estas amêndoas de Betânia para o caminho.')],
      reward: 'amendoas',
    },
  ],
  scrolls: [
    { id: 's1', at: [4, 38], ref: 'Marcos 14:9', text: 'Onde quer que este evangelho for pregado, também o que ela fez será contado para sua memória.' },
    { id: 's2', at: [40, 40], ref: 'Marcos 14:22', text: 'Tomai, comei; isto é o meu corpo.' },
    { id: 's3', at: [92, 6], ref: 'Marcos 14:36', text: 'Não seja, porém, o que eu quero, mas o que tu queres.' },
  ],
  message: {
    title: 'Fidelidade, obediência e entrega',
    summary:
      'Em Betânia, uma mulher derramou um perfume precioso sobre Jesus, e Ele honrou seu gesto. Na ceia, partiu o pão e deu o cálice, falando de seu corpo e de seu sangue. No Getsêmani, orou em profunda angústia e se entregou à vontade do Pai, enquanto os discípulos dormiam. Foi preso, todos fugiram, e Pedro o negou três vezes antes de chorar amargamente.',
    verses: [
      { ref: 'Marcos 14:36', text: 'Aba, Pai... não seja, porém, o que eu quero, mas o que tu queres.' },
      { ref: 'Marcos 14:38', text: 'Vigiai e orai, para que não entreis em tentação; o espírito, na verdade, está pronto, mas a carne é fraca.' },
    ],
    reflection:
      'Nesta noite, vemos a fraqueza humana — sono, medo, negação — e a fidelidade de Jesus, que permanece em oração. Pedro falhou, mas suas lágrimas não foram o fim da história. A entrega de Jesus abre caminho para o recomeço de todos.',
  },
  quiz: [
    { q: 'O que a mulher derramou sobre Jesus em Betânia?', options: ['Água do poço', 'Unguento de nardo puro', 'Vinho', 'Azeite comum'], correct: 1, explain: 'Marcos 14:3: "unguento de nardo puro, de muito preço".' },
    { q: 'Qual foi a oração de Jesus no Getsêmani?', options: ['"Que eu fuja daqui"', '"Não seja o que eu quero, mas o que tu queres"', '"Castiga meus inimigos"', '"Dá-me um exército"'], correct: 1, explain: 'Marcos 14:36.' },
    { q: 'O que aconteceu depois que Pedro negou Jesus três vezes?', options: ['Ele fugiu para a Galileia', 'O galo cantou e Pedro chorou', 'Ele foi preso', 'Ele riu'], correct: 1, explain: 'Marcos 14:72.' },
  ],
};
addUse(ch, 'simao', 'cabresto', [say('simao', 'O cabresto do jumentinho de Betfagé! Todos aqui falam daquela entrada em Jerusalém.')]);
addUse(ch, 'simao', 'figo', [say('simao', 'Um figo do Monte das Oliveiras. Obrigado!')]);
addUse(ch, 'joao', 'pergaminho_branco', [say('joao', 'Você ainda tem aquele pergaminho em branco? Registre o que aconteceu nesta noite.')]);
export default ch;
