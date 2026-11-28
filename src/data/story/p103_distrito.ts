import type { ChapterDef } from '../types';
import { narr, say, N, S, npc } from '../chapters/common';

// Setor Refúgio — Distrito Externo. Primeiro grande mapa do mundo real.
const ch: ChapterDef = {
  n: 103,
  story: {
    world: 'real',
    label: 'Prólogo · Setor Refúgio',
    end: { kind: 'next', to: 104 },
    props: [
      { at: [35, 16], label: 'Assistir ao telão', lines: [
        { who: 'eden', text: 'Bom dia, Distrito Externo. A ração de hoje foi reduzida para sua proteção. Textos religiosos são material contaminado: entregue-os a um agente.' },
        { who: 'eden', text: 'Lembre-se: quem esconde, adoece a sociedade. ÉDEN vê. ÉDEN cuida.' },
        say('marcos', 'Eles chamam isso de cuidado…'),
      ] },
      { at: [17, 46], label: 'Ler o cartaz', lines: [narr('"PROCURADOS: portadores de textos proibidos, organizadores de reuniões clandestinas, usuários de redes não registradas. Recompensa: ração dobrada."')] },
      { at: [23, 37], label: 'Olhar a cruz quebrada', from: 'refugiados', lines: [
        narr('Era uma igreja. Hoje é concreto, ferrugem e uma cruz partida ao meio. Alguém deixou flores de plástico ao pé dela.'),
        say('marcos', 'Mesmo quebrada… ninguém teve coragem de tirá-la daqui.'),
      ] },
      { at: [8, 57], label: 'Aquecer as mãos', lines: [narr('O fogo do barril é a única coisa quente do acampamento. Ninguém fala alto perto dele: o calor atrai drones.')] },
      { at: [24, 23], label: 'Olhar a pintura no chão', lines: [narr('Um crânio com chifres pintado no chão: o símbolo da Arena. Para os drones, parece só mais uma gangue. Para quem sabe, é um convite.')] },
    ],
  },
  title: 'Setor Refúgio',
  ref: 'Distrito Externo · Grande Tribulação',
  setting: 'Setor Refúgio — Distrito Externo',
  intro: 'Ruas destruídas, telões de vigilância e chuva ácida. Dizem que em algum lugar do distrito existe uma instalação proibida onde as pessoas conseguem escapar desta realidade.',
  map: {
    // vertical (retrato): Arena no topo, praça do mercado, oficina e igreja, acampamento embaixo
    kind: 'proc', w: 40, h: 64, base: 'pavers', ambience: 'neon', seed: 103,
    features: [
      // limites
      { f: 'rect', tile: 'cwall', x: 0, y: 0, w: 40, h: 2 },
      { f: 'rect', tile: 'cwall', x: 0, y: 0, w: 2, h: 64 },
      { f: 'rect', tile: 'cwall', x: 38, y: 0, w: 2, h: 64 },
      { f: 'rect', tile: 'cwall', x: 0, y: 62, w: 40, h: 2 },
      // praça da Arena (como na referência)
      { f: 'rect', tile: 'cwall', x: 18, y: 2, w: 13, h: 8 },
      { f: 'rect', tile: 'cwall', x: 2, y: 2, w: 12, h: 9 },
      { f: 'rect', tile: 'cwall', x: 32, y: 2, w: 6, h: 8 },
      { f: 'obj', o: 'arenagate', x: 24, y: 12 },
      { f: 'obj', o: 'billboard', x: 8, y: 11 },
      { f: 'obj', o: 'stairsup', x: 15, y: 11 },
      { f: 'obj', o: 'pipe', x: 35, y: 10, w: 4 },
      { f: 'obj', o: 'neon', x: 34, y: 8, v: 1 },
      { f: 'obj', o: 'screen', x: 35, y: 15 },
      { f: 'obj', o: 'emblem', x: 24, y: 22 },
      { f: 'obj', o: 'tarp', x: 8, y: 20, v: 0 },
      { f: 'obj', o: 'wsign', x: 13, y: 19 },
      { f: 'obj', o: 'crate', x: 4, y: 21 },
      { f: 'obj', o: 'crate', x: 13, y: 21 },
      { f: 'obj', o: 'kiosk', x: 28, y: 21 },
      { f: 'obj', o: 'tarp', x: 32, y: 25, v: 2 },
      { f: 'obj', o: 'neoncross', x: 36, y: 24 },
      { f: 'obj', o: 'crate', x: 36, y: 27 },
      { f: 'obj', o: 'barrelfire', x: 6, y: 27 },
      { f: 'rect', tile: 'grate', x: 13, y: 26, w: 3, h: 2 },
      { f: 'blob', tile: 'puddle', x: 15, y: 15, r: 1 },
      { f: 'blob', tile: 'puddle', x: 30, y: 17, r: 1 },
      { f: 'blob', tile: 'puddle', x: 19, y: 27, r: 1 },
      { f: 'obj', o: 'neonfence', x: 4, y: 30, w: 4 },
      { f: 'obj', o: 'neonfence', x: 8, y: 30, w: 4 },
      { f: 'obj', o: 'neonfence', x: 12, y: 30, w: 4 },
      { f: 'obj', o: 'neonfence', x: 16, y: 30, w: 4 },
      { f: 'obj', o: 'neonfence', x: 25, y: 30, w: 4 },
      { f: 'obj', o: 'neonfence', x: 29, y: 30, w: 4 },
      // beco dos fundos (zona patrulhada, à direita)
      { f: 'rect', tile: 'cwall', x: 31, y: 30, w: 2, h: 19 },
      { f: 'rect', tile: 'cwall', x: 33, y: 30, w: 5, h: 2 },
      { f: 'rect', tile: 'grate', x: 33, y: 32, w: 5, h: 17 },
      { f: 'obj', o: 'hatch', x: 35, y: 33 },
      { f: 'obj', o: 'crate', x: 33, y: 42 },
      { f: 'obj', o: 'crate', x: 37, y: 39 },
      { f: 'obj', o: 'vent', x: 37, y: 46 },
      // oficina mecânica
      { f: 'rect', tile: 'concrete', x: 2, y: 32, w: 13, h: 13 },
      { f: 'obj', o: 'wreck', x: 5, y: 35 },
      { f: 'obj', o: 'scrap', x: 12, y: 34 },
      { f: 'obj', o: 'generator', x: 3, y: 42 },
      { f: 'obj', o: 'antenna', x: 14, y: 41 },
      { f: 'obj', o: 'cables', x: 8, y: 41 },
      { f: 'obj', o: 'barrelfire', x: 11, y: 43 },
      { f: 'obj', o: 'wsign', x: 2, y: 33 },
      // igreja em ruínas
      { f: 'rect', tile: 'rubble', x: 17, y: 33, w: 13, h: 12 },
      { f: 'rect', tile: 'cwall', x: 17, y: 33, w: 3, h: 2 },
      { f: 'rect', tile: 'cwall', x: 27, y: 33, w: 3, h: 3 },
      { f: 'obj', o: 'cross', x: 23, y: 36 },
      { f: 'obj', o: 'bench', x: 20, y: 41 },
      { f: 'obj', o: 'bench', x: 26, y: 41 },
      { f: 'obj', o: 'scrap', x: 28, y: 43 },
      // rua e posto de controle
      { f: 'rect', tile: 'asphalt', x: 2, y: 45, w: 29, h: 4 },
      { f: 'obj', o: 'barrier', x: 8, y: 47 },
      { f: 'obj', o: 'barrier', x: 15, y: 47 },
      { f: 'obj', o: 'watchtower', x: 4, y: 48 },
      { f: 'obj', o: 'wreck', x: 26, y: 47 },
      // acampamento de refugiados
      { f: 'rect', tile: 'rubble', x: 2, y: 49, w: 36, h: 13 },
      { f: 'obj', o: 'tarp', x: 5, y: 52, v: 1 },
      { f: 'obj', o: 'tarp', x: 13, y: 52, v: 0 },
      { f: 'obj', o: 'barrelfire', x: 8, y: 55 },
      { f: 'obj', o: 'cot', x: 3, y: 57 },
      { f: 'obj', o: 'cot', x: 26, y: 58 },
      { f: 'obj', o: 'scrap', x: 29, y: 60 },
      { f: 'obj', o: 'hatch', x: 20, y: 61 },
      { f: 'obj', o: 'neon', x: 31, y: 50, v: 1 },
      { f: 'obj', o: 'watchtower', x: 36, y: 61 },
      { f: 'scatter', o: 'crate', x: 2, y: 49, w: 28, h: 12, n: 3, on: ['rubble'] },
      { f: 'scatter', o: 'scrap', x: 2, y: 13, w: 28, h: 15, n: 2, on: ['pavers'] },
    ],
  },
  cell: 16,
  spawn: [20, 58],
  music: 'dystopia',
  zones: [
    { id: 'acampamento', name: 'Acampamento de refugiados', at: [10, 55], r: 5 },
    { id: 'posto', name: 'Posto de controle', at: [11, 46], r: 3 },
    { id: 'oficina', name: 'Oficina do Baruque', at: [8, 38], r: 4 },
    { id: 'igreja', name: 'Igreja em ruínas', at: [23, 38], r: 4 },
    { id: 'mercado', name: 'Mercado clandestino', at: [10, 23], r: 4 },
    { id: 'arena', name: 'Portão da Arena A-17', at: [24, 15], r: 4 },
    { id: 'beco', name: 'Beco dos fundos', at: [35, 42], r: 4 },
  ],
  npcs: [
    npc('tome', 'Tomé', 'idosoReal', [10, 56], {
      role: 'Líder do acampamento de refugiados',
      lines: [say('tome', 'Aqui ninguém pergunta o nome de ninguém, rapaz. Nome é coisa que o Sistema usa para encontrar a gente.')],
    }),
    npc('mirela', 'Mirela', 'refugiada', [5, 59], {
      role: 'Mãe refugiada',
      lines: [say('mirela', 'Meu filho não come há dois dias. Eu daria qualquer coisa por uma lata de ração.')],
    }),
    npc('davi', 'Davi', 'criancaReal', [7, 60], { role: 'Filho de Mirela', lines: [say('davi', 'Moço… é verdade que antigamente o céu era azul?')] }),
    npc('jonas', 'Jonas', 'refugiado', [16, 56], {
      role: 'Procura a esposa desaparecida',
      lines: [
        say('jonas', 'Você viu uma mulher de cabelo curto, cicatriz no queixo? Ela foi buscar água no setor 9 e nunca voltou.'),
        say('jonas', 'Faz oito meses. Eu ainda deixo a luz acesa à noite. Vai que ela procura o caminho.'),
      ],
    }),
    npc('encapuzado', 'Homem encapuzado', 'vigia', [4, 28], {
      role: 'Tem medo de falar',
      lines: [
        say('encapuzado', 'Fala baixo. Você não sabe quem está ouvindo.'),
        say('encapuzado', 'Telão tem ouvido, drone tem olho, vizinho tem fome. Eu não sei de nada. Não vi nada.'),
      ],
    }),
    npc('encapuzada', 'Mulher encapuzada', 'refugiada', [8, 29], {
      role: 'Se aquece no barril', lines: [say('encapuzada', 'O fogo atrai drones, mas o frio mata mais rápido. A gente escolhe o risco que dá pra carregar.')],
    }),
    npc('baruque', 'Baruque', 'mecanico', [8, 38], {
      role: 'Mecânico da oficina',
      lines: [say('baruque', 'Se roda, eu conserto. Se voa, eu derrubo. Se fala com o Sistema, eu desmonto.')],
    }),
    npc('corvo', 'Corvo', 'contrabandista', [10, 23], {
      role: 'Intermediário do mercado clandestino',
      lines: [say('corvo', 'Tudo tem preço no mercado, garoto. Até a esperança. Principalmente a esperança.')],
    }),
    npc('lia', 'Lia', 'refugiada', [31, 27], {
      role: 'Vigia da resistência',
      lines: [say('lia', 'Os drones do beco passam em ciclos. Espere a luz vermelha passar… e corra.')],
    }),
    npc('velha', 'Dona Ester', 'idosa', [23, 39], {
      role: 'Ora escondida na igreja em ruínas',
      lines: [
        say('velha', 'Eles derrubaram as paredes, meu filho. Mas não conseguiram derrubar o que estava escrito no coração.'),
        { who: 'velha', text: 'O Senhor é a minha luz e a minha salvação; a quem temerei?', ref: 'Salmos 27:1' },
      ],
    }),
    npc('agente1', 'Agente do Sistema', 'agente', [11, 46], {
      face: 'down', role: 'Patrulha do posto de controle',
      lines: [{ who: 'agente1', text: 'Circulando. Identificação biométrica obrigatória a partir do toque de recolher. Não me faça repetir.' }],
    }),
    npc('agente2', 'Agente do Sistema', 'agente', [13, 47], { face: 'left', role: 'Patrulha do posto de controle', lines: [{ who: 'agente2', text: '…' }] }),
    npc('seguranca', 'Segurança da Arena', 'agente', [21, 14], {
      face: 'down', role: 'Guarda o portão da Arena A-17',
      lines: [say('seguranca', 'A porta da frente é para os curiosos e para os drones. Quem tem credencial entra por baixo.')],
    }),
    npc('seguranca2', 'Segurança da Arena', 'agente', [27, 14], {
      face: 'down', role: 'Guarda o portão da Arena A-17',
      lines: [say('seguranca2', 'Circula. Aqui não tem nada pra você… ainda.')],
    }),
  ],
  steps: [
    {
      id: 'refugiados', title: 'Conversar com refugiados', hint: 'Tomé, o líder do acampamento, está perto do fogo.', kind: 'talk', npc: 'tome',
      lines: [
        say('tome', 'Você é o filho do Samuel, não é? Tem os olhos da sua irmã.'),
        say('marcos', 'O senhor conheceu a Abigail?'),
        say('tome', 'Todo mundo aqui ouviu falar dela. A moça que falava de Jesus em voz alta quando ninguém mais tinha coragem.'),
        say('tome', 'Ouça: dizem que existe uma instalação escondida, uma "arena". As pessoas entram numa máquina proibida e… escapam. Encontram outros. Leem o que foi proibido.'),
        say('tome', 'Se quer saber mais, vá ao mercado. Procure o Corvo. Mas cuidado com o que você paga a ele.'),
      ],
    },
    {
      id: 'mercado', title: 'Investigar o mercado clandestino', hint: 'Suba pelo distrito até a praça das barracas, diante do portão da Arena.', kind: 'reach', at: [14, 23], r: 3,
      lines: [narr('Lonas rasgadas, luzinhas improvisadas, peças de drone, remédios vencidos. Tudo se negocia em sussurros, de olho nos telões.')],
    },
    {
      id: 'intermediario', title: 'Encontrar o intermediário', hint: 'Corvo negocia perto da última barraca.', kind: 'talk', npc: 'corvo',
      lines: [
        say('corvo', 'Procurando a Arena? Fala mais baixo.'),
        say('corvo', 'Ela existe. A A-17. Mas ninguém entra sem credencial, e credencial custa caro: um chip limpo, que o Sistema não rastreia.'),
        say('marcos', 'Eu não tenho dinheiro.'),
        say('corvo', 'Ninguém tem. Então traga peças. O Baruque, da oficina, monta o chip se você juntar os componentes. Eu gravo o código.'),
        say('corvo', 'E pergunte por aí sobre o peixe. Quem sabe ler os muros, encontra o caminho.'),
      ],
    },
    {
      id: 'boatos', title: 'Descobrir a localização da arena', hint: 'Lia, a vigia, conhece os símbolos pichados. Procure o neon azul na entrada do beco, perto do acampamento.', kind: 'use', at: [31, 52], label: 'Examinar o símbolo pichado',
      lines: [
        narr('No muro, quase apagado pela chuva, um peixe desenhado com tinta fluorescente. Abaixo dele: "A-17 · desça onde o peixe aponta". A cauda aponta para o alto do beco dos fundos.'),
        say('marcos', 'O peixe… igual ao desenho da árvore, na casa antiga.'),
        say('marcos', 'Lia disse que só quem sabe ler os muros encontra o caminho. O acesso fica no alto do beco… e o beco é zona de patrulha.'),
      ],
    },
    {
      id: 'credencial', title: 'Conseguir uma credencial de acesso', hint: 'Recolha 4 componentes eletrônicos espalhados pela oficina e entregue ao Baruque.', kind: 'challenge', at: [8, 39], r: 3,
      challenge: { type: 'collect', label: 'Componentes recuperados', icon: 'item', at: [[4, 34], [13, 37], [6, 44], [13, 44]] },
      gives: 'credencial',
      scene: [
        S('baruque', 'Bateria, placa, antena e um sensor de drone. Perfeito.'),
        N('Faíscas. O cheiro de solda se mistura ao da chuva. Minutos depois, um cartão gasto com um peixe gravado está nas mãos de Elias.'),
        S('baruque', 'Credencial A-17. O Corvo já gravou o código. Não perca isso, e não deixe nenhum drone ver.'),
      ],
    },
    {
      id: 'patrulhas', title: 'Evitar as patrulhas do Sistema', hint: 'Suba pelo beco dos fundos sem entrar na luz vermelha dos drones e agentes.', kind: 'challenge', at: [35, 49], r: 2,
      challenge: {
        type: 'stealth', label: 'Atravesse o beco sem ser visto', start: [35, 48], goal: [35, 35], range: 3,
        guards: [
          { kind: 'soldier', path: [[33, 45], [37, 45]], speed: 0.8 },
          { kind: 'drone', path: [[35, 42], [35, 37]], speed: 0.9 },
          { kind: 'soldier', path: [[37, 38], [33, 38]], speed: 0.7 },
        ],
      },
      scene: [S('marcos', 'Ninguém me viu… acho.')],
    },
    {
      id: 'passagem', title: 'Encontrar a passagem subterrânea', hint: 'A tampa de metal no alto do beco, onde o peixe aponta.', kind: 'use', at: [35, 33], label: 'Abrir a passagem subterrânea',
      lines: [narr('A tampa está solta. Embaixo dela, alguém pintou um pequeno peixe verde. Elias desce pela escada enferrujada.')],
    },
    {
      id: 'entrar', title: 'Entrar na arena', hint: 'Siga pelos túneis.', kind: 'scene',
      scene: [
        N('Túneis do antigo metrô. Água até os tornozelos, cabos pendurados e, ao longe, um zumbido elétrico.'),
        N('Uma porta reforçada. Uma luz verde sobre a fechadura e uma voz por trás dela.'),
        { t: 'say', who: 'porteiro', text: 'Credencial.' },
        N('Elias encosta o cartão. A luz pisca. A porta se abre.'),
      ],
    },
  ],
  side: [
    {
      id: 'fome', title: 'Fome no acampamento', hint: 'Mirela precisa de comida para o filho.', giver: 'mirela', needs: 'racao', needsFrom: 'o abrigo (sua mãe)',
      ask: [say('mirela', 'Por favor… se tiver qualquer coisa de comer.')],
      thanks: [
        say('mirela', 'Deus te pague, menino. Faz tanto tempo que ninguém divide nada aqui.'),
        say('davi', 'Obrigado, moço! Toma, é água limpa. Minha mãe filtrou três vezes.'),
      ],
      reward: 'agua_filtrada',
    },
    {
      id: 'bateria', title: 'A bateria perdida', hint: 'Baruque perdeu uma bateria perto da torre de vigia leste, no acampamento.', giver: 'baruque', needs: 'bateria', findAt: [35, 57],
      ask: [say('baruque', 'Deixei cair uma bateria quando os drones passaram, perto da torre leste do acampamento. Se trouxer, te dou umas peças.')],
      thanks: [say('baruque', 'Essa ainda tem carga! Fica com estes componentes. Nunca se sabe quando um drone vai precisar ser desmontado.')],
      reward: 'componente',
    },
  ],
  scrolls: [],
  message: { title: '', summary: '', verses: [], reflection: '' },
  quiz: [],
};

export default ch;
