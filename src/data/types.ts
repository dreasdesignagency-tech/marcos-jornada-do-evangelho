// Tipos de dados do jogo. Cada capítulo é um arquivo de dados independente
// (src/data/chapters/chXX.ts) que segue o contrato ChapterDef.

export type Pt = [number, number]; // coordenadas em células do mapa do capítulo
export type Dir = 'down' | 'left' | 'right' | 'up';

/** Aparência de personagem (recolorização da skin base de João Marcos). */
export interface Look {
  skin: string;
  hair: string;
  tunic: string;
  mantle: string;
  leather?: string;
  beard?: boolean;
  scale?: number;
  /** mulheres usam véu: o cabelo recebe a cor do véu */
  veil?: string;
}

/** Uma fala. `ref` marca citação bíblica literal (com referência). */
export interface Line {
  who?: string; // id do NPC, 'narrador' ou 'marcos'
  text: string;
  ref?: string;
  choices?: Choice[];
}
export interface Choice {
  text: string;
  ok: boolean;
  reply: string;
}

export interface NpcDef {
  id: string;
  name: string;
  look: string | Look; // chave de preset (data/looks.ts) ou Look
  at: Pt;
  face?: Dir;
  wander?: number; // raio de passeio em células
  lines?: Line[]; // fala padrão ao interagir
  /** item liberado na primeira conversa (persistente entre capítulos) */
  gives?: string;
  /** reação especial se o jogador trouxer um item de um capítulo anterior */
  uses?: { item: string; lines: Line[] }[];
  /** só aparece quando o passo indicado estiver ativo ou concluído */
  showFrom?: string;
  /** some quando o passo indicado for concluído */
  hideAfter?: string;
  role?: string; // descrição curta para o Diário
}

export type SceneAction =
  | { t: 'say'; who: string; text: string; ref?: string }
  | { t: 'narr'; text: string; ref?: string }
  | { t: 'move'; id: string; to: Pt; speed?: number; wait?: boolean }
  | { t: 'cam'; to: Pt | 'player'; ms?: number }
  | { t: 'fx'; name: FxName; on?: boolean }
  | { t: 'show'; id: string; at?: Pt }
  | { t: 'hide'; id: string }
  | { t: 'face'; id: string; dir: Dir }
  | { t: 'wait'; ms: number }
  | { t: 'pose'; pose: 'pray' | 'write' | 'idle' };

export type FxName =
  | 'flash' | 'dove' | 'rain' | 'storm' | 'calm' | 'dark' | 'light' | 'shake'
  | 'glow' | 'dawn' | 'night' | 'crowd' | 'stone' | 'tear' | 'birds' | 'sparkle';

export type ChallengeDef =
  | { type: 'collect'; label: string; icon: string; at: Pt[]; time?: number; bonusItem?: string }
  | { type: 'deliver'; label: string; icon: string; source: Pt; targets: Pt[]; targetNames?: string[] }
  | { type: 'crowd'; target: Pt; start: Pt; people: number; area: [number, number, number, number]; time: number }
  | { type: 'plant'; plots: { at: Pt; soil: 'caminho' | 'pedregoso' | 'espinhos' | 'boa' }[] }
  | { type: 'lamps'; at: Pt[]; duration: number }
  | { type: 'hotcold'; target: Pt; call: string; npc: string }
  | { type: 'waypoints'; at: Pt[]; time: number; label: string }
  | { type: 'follow'; npc: string; path: Pt[]; radius: number }
  | { type: 'sequence'; prompt: string; items: string[] }
  | { type: 'select'; prompt: string; options: { text: string; ok: boolean }[] }
  | { type: 'sort'; prompt: string; categories: [string, string]; items: { text: string; cat: 0 | 1; why: string }[] }
  | { type: 'balance'; duration: number; prompt: string }
  | { type: 'vigil'; duration: number; prompt: string; lines: string[] }
  | { type: 'trial'; npcs: string[] };

export interface StepDef {
  id: string;
  title: string;
  hint: string;
  kind: 'talk' | 'reach' | 'scene' | 'challenge';
  npc?: string; // para 'talk'
  at?: Pt; // para 'reach' (e posição do marcador)
  r?: number; // raio em células
  lines?: Line[]; // falas de 'talk' / ao chegar em 'reach'
  scene?: SceneAction[]; // cutscene ao concluir
  challenge?: ChallengeDef;
  /** item que, se o jogador tiver, ajuda (ex.: conta como 1 coleta) */
  helpItem?: string;
}

export interface SideQuestDef {
  id: string;
  title: string;
  hint: string;
  giver: string; // npc que pede
  needs: string; // item necessário (pode vir de outro capítulo)
  needsFrom?: string; // ex.: 'Marcos 1'
  /** se definido, o item pode ser encontrado neste capítulo nessa posição */
  findAt?: Pt;
  ask: Line[];
  thanks: Line[];
  reward?: string; // item
}

export interface ScrollDef {
  id: string;
  at: Pt;
  ref: string;
  text: string;
}

export interface ZoneDef {
  id: string;
  name: string;
  at: Pt;
  r: number;
}

export interface QuizQ {
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

export interface MapRefDef {
  kind: 'ref';
  key: 'galileia';
  ambience: Ambience;
}

export interface ProcMapDef {
  kind: 'proc';
  w: number;
  h: number;
  base: TileName;
  ambience: Ambience;
  features: Feature[];
  seed: number;
}

export type Ambience = 'day' | 'dusk' | 'night' | 'dark' | 'dawn' | 'storm';

export type TileName =
  | 'grass' | 'grass2' | 'dgrass' | 'sand' | 'dirt' | 'stone' | 'marble' | 'rock' | 'water' | 'deep'
  | 'field' | 'soil' | 'cliff' | 'wall' | 'flowers' | 'mountain' | 'snow' | 'floor' | 'darkgrass';

export type ObjName =
  | 'tree' | 'olive' | 'palm' | 'bush' | 'rock' | 'bigrock' | 'flower' | 'reeds' | 'deadtree' | 'fig'
  | 'house' | 'temple' | 'well' | 'stall' | 'tent' | 'fire' | 'tomb' | 'lamp' | 'table' | 'boat'
  | 'pillar' | 'gate' | 'crate' | 'jar' | 'cross' | 'fence' | 'cairn' | 'sign' | 'basket' | 'tower'
  | 'cityview' | 'stairs' | 'bench' | 'altar' | 'mustard' | 'donkey' | 'sheep' | 'net' | 'stone';

export type Feature =
  | { f: 'rect'; tile: TileName; x: number; y: number; w: number; h: number }
  | { f: 'blob'; tile: TileName; x: number; y: number; r: number; rough?: number }
  | { f: 'path'; tile: TileName; pts: Pt[]; w: number }
  | { f: 'obj'; o: ObjName; x: number; y: number; w?: number; h?: number; v?: number; solid?: boolean }
  | { f: 'scatter'; o: ObjName; x: number; y: number; w: number; h: number; n: number; on?: TileName[] }
  | { f: 'village'; x: number; y: number; w: number; h: number; n: number };

export interface ChapterDef {
  n: number;
  title: string;
  ref: string;
  setting: string;
  intro: string;
  solemn?: boolean;
  map: MapRefDef | ProcMapDef;
  cell: number; // tamanho da célula em px (32 no mapa de referência, 16 nos procedurais)
  spawn: Pt;
  music: MusicMood;
  zones: ZoneDef[];
  npcs: NpcDef[];
  steps: StepDef[];
  side: SideQuestDef[];
  scrolls: ScrollDef[];
  messageAt?: Pt; // onde aparece o Pergaminho do Capítulo
  message: {
    title: string;
    summary: string;
    verses: { ref: string; text: string }[];
    reflection: string;
  };
  quiz: QuizQ[];
}

export type MusicMood = 'pastoral' | 'village' | 'sea' | 'mystery' | 'joy' | 'temple' | 'night' | 'lament' | 'dawn';
