import type { ChapterDef } from '../types';
import { narr, say, N, S, mv, show, hide, cam, fx, npc } from './common';

// Marcos 1 — O princípio do Evangelho (mapa de referência: Jordão, deserto e Cafarnaum)
const ch: ChapterDef = {
  n: 1,
  title: 'O princípio do Evangelho',
  ref: 'Marcos 1',
  setting: 'Rio Jordão, deserto e Cafarnaum',
  intro:
    'Eu sou João Marcos. Nesta jornada, caminho pelos lugares do Evangelho e registro no meu pergaminho o que as Escrituras contam. Tudo começa no Rio Jordão, onde um homem vestido de pelos de camelo chama o povo ao arrependimento...',
  map: { kind: 'ref', key: 'galileia', ambience: 'day' },
  cell: 32,
  spawn: [12, 10],
  music: 'pastoral',
  messageAt: [32, 21],
  zones: [
    { id: 'jordao', name: 'Rio Jordão', at: [6, 15], r: 3 },
    { id: 'deserto', name: 'Deserto', at: [31, 5], r: 3 },
    { id: 'cafarnaum', name: 'Cafarnaum', at: [30, 21], r: 3 },
    { id: 'mar', name: 'Mar da Galileia', at: [36, 24], r: 3 },
  ],
  npcs: [
    npc('joaoBatista', 'João Batista', 'joaoBatista', [6, 15], {
      face: 'down', gives: 'mel', role: 'Profeta que preparou o caminho do Senhor',
      lines: [
        say('joaoBatista', 'Após mim vem aquele que é mais forte do que eu, do qual não sou digno de, abaixando-me, desatar a correia das suas alparcas.', 'Marcos 1:7'),
        narr('João vivia no deserto e se alimentava de gafanhotos e mel silvestre. Ele lhe oferece um pouco de mel para a viagem.'),
      ],
    }),
    npc('jesus', 'Jesus', 'jesus', [8, 22], { showFrom: 'batismo', hideAfter: 'batismo', role: 'O Filho de Deus' }),
    npc('pedro', 'Simão (Pedro)', 'pedro', [30, 25], {
      face: 'down', gives: 'corda', role: 'Pescador chamado por Jesus',
      lines: [say('pedro', 'Pescamos a noite inteira nestas águas. Tome esta corda de pescador — gente do mar sempre acha uma utilidade para ela.')],
    }),
    npc('andre', 'André', 'andre', [32, 26], {
      face: 'down', gives: 'rede', role: 'Pescador, irmão de Simão',
      lines: [say('andre', 'Sou André, irmão de Simão. Fique com este pedaço de rede remendada; um dia alguém vai precisar dela.')],
    }),
    npc('tiago', 'Tiago', 'tiago', [38, 23], {
      face: 'down', gives: 'remo', role: 'Filho de Zebedeu',
      lines: [say('tiago', 'Meu irmão João e eu consertamos as redes do barco do nosso pai. Leve este remo de cedro; ele já atravessou muitas tempestades.')],
    }),
    npc('joao', 'João', 'joao', [40, 23], {
      face: 'left', gives: 'lamparina', role: 'Filho de Zebedeu, irmão de Tiago',
      lines: [say('joao', 'Quando saímos para pescar de madrugada, esta lamparina de barro nos guia. Guarde-a: quem vigia precisa de luz.')],
    }),
    npc('zebedeu', 'Zebedeu', 'idoso', [36, 22], {
      gives: 'anzol', role: 'Pai de Tiago e João',
      lines: [say('zebedeu', 'Meus filhos têm mãos boas para a pesca. Este anzol de bronze foi do meu pai. Leve-o, jovem escriba.')],
    }),
    npc('viajante', 'Viajante do deserto', 'viajante', [36, 9], {
      gives: 'odre', wander: 1,
      lines: [say('viajante', 'O deserto ensina a valorizar cada gole de água. Leve este odre — a estrada até Jericó também é seca.')],
    }),
    npc('rute', 'Rute, a aguadeira', 'mulher', [29, 22], {
      role: 'Moradora de Cafarnaum',
      lines: [say('rute', 'Cafarnaum fica à beira do mar. Aqui todos conhecem a família de Simão.')],
    }),
    npc('sogra', 'Sogra de Simão', 'idosa', [27, 20], { showFrom: 'ministerio', role: 'Curada por Jesus' }),
  ],
  steps: [
    {
      id: 'encontrar-joao', title: 'Encontrar João Batista', kind: 'talk', npc: 'joaoBatista',
      hint: 'Desça pelo caminho até a margem do Rio Jordão, ao sudoeste do acampamento.',
      lines: [
        narr('Apareceu João batizando no deserto, e pregando o batismo de arrependimento, para remissão dos pecados.', 'Marcos 1:4'),
        say('marcos', 'Então este é João, o mensageiro de que falou o profeta Isaías!'),
      ],
    },
    {
      id: 'mensagem', title: 'Ouvir a mensagem de arrependimento', kind: 'talk', npc: 'joaoBatista',
      hint: 'Fale novamente com João Batista e ouça sua mensagem.',
      lines: [
        say('joaoBatista', 'Após mim vem aquele que é mais forte do que eu, do qual não sou digno de, abaixando-me, desatar a correia das suas alparcas.', 'Marcos 1:7'),
        say('joaoBatista', 'Eu, em verdade, tenho-vos batizado com água; ele, porém, vos batizará com o Espírito Santo.', 'Marcos 1:8'),
        narr('Arrepender-se é mudar de direção: voltar o coração para Deus. Muitos vinham da Judeia e de Jerusalém para ouvir João.'),
      ],
    },
    {
      id: 'batismo', title: 'Acompanhar o batismo de Jesus', kind: 'scene', at: [6, 16], r: 3,
      hint: 'Permaneça à margem do Jordão: alguém está chegando pelo caminho do sul.',
      scene: [
        cam([7, 19]),
        show('jesus', [8, 23]),
        mv('jesus', [8, 17]),
        mv('jesus', [5, 15]),
        N('E aconteceu naqueles dias que Jesus, tendo ido de Nazaré da Galileia, foi batizado por João, no Jordão.', 'Marcos 1:9'),
        fx('flash'),
        fx('dove'),
        N('E logo, quando saía da água, viu os céus abertos, e o Espírito, que como pomba descia sobre ele.', 'Marcos 1:10'),
        N('E ouviu-se uma voz dos céus, que dizia: Tu és o meu Filho amado, em quem me comprazo.', 'Marcos 1:11'),
        mv('jesus', [9, 17]),
        hide('jesus'),
        cam('player'),
      ],
    },
    {
      id: 'deserto', title: 'Explorar a região do deserto', kind: 'reach', at: [31, 5], r: 2.2,
      hint: 'Siga a trilha de areia para o nordeste até o planalto rochoso do deserto.',
      lines: [
        narr('E logo o Espírito o impeliu para o deserto.', 'Marcos 1:12'),
        narr('E ali esteve no deserto quarenta dias, tentado por Satanás. E vivia entre as feras, e os anjos o serviam.', 'Marcos 1:13'),
        say('marcos', 'Este lugar é silencioso e duro. Foi aqui, na solidão, que Jesus se preparou para o seu ministério.'),
      ],
    },
    {
      id: 'peixes', title: 'Desafio: ajudar os pescadores', kind: 'challenge', npc: 'pedro',
      hint: 'Fale com Simão no cais de Cafarnaum. Os peixes saltaram das cestas!',
      lines: [
        say('pedro', 'Ei, rapaz! As cestas viraram e os peixes se espalharam pelo cais e pela praça. Ajude-nos a recolher todos antes que o sol esquente!'),
        narr('Desafio: recolha os 6 peixes em até 75 segundos.'),
      ],
      challenge: { type: 'collect', label: 'Peixes recolhidos', icon: 'peixe', time: 75, at: [[29, 24], [33, 23], [36, 22], [31, 20], [40, 24], [27, 26]] },
      scene: [
        show('jesus', [27, 23]),
        mv('jesus', [30, 24]),
        N('E, andando junto ao mar da Galileia, viu Simão, e André, seu irmão, que lançavam a rede ao mar, porque eram pescadores.', 'Marcos 1:16'),
        S('jesus', 'Vinde após mim, e eu farei que sejais pescadores de homens.', 'Marcos 1:17'),
        N('E, deixando logo as suas redes, o seguiram.', 'Marcos 1:18'),
      ],
    },
    {
      id: 'zebedeu', title: 'Encontrar Tiago e João', kind: 'talk', npc: 'tiago',
      hint: 'Os filhos de Zebedeu estão consertando as redes no fim do cais.',
      lines: [
        narr('E, passando dali um pouco mais adiante, viu Tiago, filho de Zebedeu, e João, seu irmão, que estavam no barco consertando as redes.', 'Marcos 1:19'),
        narr('E logo os chamou. E eles, deixando o seu pai Zebedeu no barco com os jornaleiros, foram após ele.', 'Marcos 1:20'),
        say('tiago', 'Nosso pai entendeu. Agora vamos com o Mestre!'),
      ],
    },
    {
      id: 'ministerio', title: 'Acompanhar o início do ministério', kind: 'scene', at: [29, 21], r: 2.2,
      hint: 'Vá até a casa de Simão e André, na praça de Cafarnaum.',
      scene: [
        show('jesus', [30, 20]),
        show('sogra', [27, 20]),
        N('E logo, saindo da sinagoga, foram à casa de Simão e de André. E a sogra de Simão estava deitada com febre.', 'Marcos 1:29-30'),
        mv('jesus', [28, 20]),
        N('Então, chegando-se a ela, tomou-a pela mão e levantou-a; e imediatamente a febre a deixou, e servia-os.', 'Marcos 1:31'),
        fx('crowd'),
        N('E, tendo chegado a tarde, quando já se estava pondo o sol, traziam-lhe todos os que se achavam enfermos. E toda a cidade se ajuntou à porta.', 'Marcos 1:32-33'),
        S('marcos', 'Preciso registrar tudo isto. É o princípio de uma nova jornada!'),
      ],
    },
  ],
  side: [
    {
      id: 'cantaro', title: 'O cântaro perdido', giver: 'rute', needs: 'cantaro', findAt: [1, 13],
      hint: 'Rute perdeu seu cântaro na margem oeste do rio.',
      ask: [say('rute', 'Fui buscar água no rio e deixei meu cântaro na margem oeste, perto das pedras. Você poderia trazê-lo?')],
      thanks: [say('rute', 'Meu cântaro! Muito obrigada. Que Deus abençoe seus passos. Fique com ele — hoje tenho outro; um dia ele vai lhe servir.')],
      reward: 'tamaras',
    },
  ],
  scrolls: [
    { id: 's1', at: [14, 3], ref: 'Marcos 1:1', text: 'Princípio do evangelho de Jesus Cristo, Filho de Deus.' },
    { id: 's2', at: [42, 10], ref: 'Marcos 1:15', text: 'O tempo está cumprido, e o reino de Deus está próximo. Arrependei-vos e crede no evangelho.' },
    { id: 's3', at: [3, 28], ref: 'Marcos 1:35', text: 'E, levantando-se de manhã muito cedo, estando ainda escuro, saiu, e foi para um lugar deserto, e ali orava.' },
  ],
  message: {
    title: 'O início de uma nova jornada',
    summary:
      'Marcos começa direto ao ponto: João Batista prepara o caminho, Jesus é batizado no Jordão e o Pai declara que Ele é o Filho amado. Depois do deserto, Jesus anuncia que o Reino de Deus está próximo e chama pescadores comuns para segui-lo. Em Cafarnaum, Ele ensina com autoridade e cura muitos.',
    verses: [
      { ref: 'Marcos 1:11', text: 'Tu és o meu Filho amado, em quem me comprazo.' },
      { ref: 'Marcos 1:17', text: 'Vinde após mim, e eu farei que sejais pescadores de homens.' },
    ],
    reflection:
      'Simão, André, Tiago e João deixaram as redes no meio de um dia comum. O chamado de Jesus muitas vezes chega assim: no trabalho, na rotina, no cais da vida. Que "redes" ocupam suas mãos hoje? Seguir Jesus começa com um passo simples de confiança.',
  },
  quiz: [
    { q: 'O que João Batista pregava no deserto?', options: ['O batismo de arrependimento para remissão dos pecados', 'A construção de um novo templo', 'Que o povo deveria pegar em armas', 'Que ninguém precisava mudar'], correct: 0, explain: 'Marcos 1:4 diz que João pregava "o batismo de arrependimento, para remissão dos pecados".' },
    { q: 'O que aconteceu quando Jesus saiu da água?', options: ['Choveu fogo do céu', 'Viu os céus abertos e o Espírito descendo como pomba', 'O rio secou', 'João desapareceu'], correct: 1, explain: 'Marcos 1:10-11: os céus se abriram, o Espírito desceu como pomba e a voz do Pai declarou: "Tu és o meu Filho amado".' },
    { q: 'Qual era a profissão de Simão e André?', options: ['Carpinteiros', 'Cobradores de impostos', 'Pescadores', 'Sacerdotes'], correct: 2, explain: 'Marcos 1:16: "lançavam a rede ao mar, porque eram pescadores". Jesus os chamou para serem "pescadores de homens".' },
  ],
};
export default ch;
