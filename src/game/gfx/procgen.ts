// Gerador de pixel art procedural: tiles 16x16 e objetos do cenário.
// Paleta amostrada do cenário de referência (tons terrosos, verdes, azuis e dourados).
// Estes assets são provisórios e podem ser substituídos por imagens definitivas
// (mesmos nomes de textura) sem alterar o restante do código.
import type { ObjName, TileName } from '../../data/types';
import { drawRealObject, paintRealTile, REAL_TILES } from './procgenReal';

export const T = 16;

export const PAL = {
  outline: '#2a1a10',
  grass: ['#4f8f2a', '#5fa232', '#72b63c', '#8cc84a', '#3f7a24'],
  dgrass: ['#3d6e2a', '#4a7f30', '#5a9038', '#2f5a22'],
  darkgrass: ['#1f3a2a', '#26463a', '#2c5040', '#18302a'],
  sand: ['#d9ae68', '#e4bd78', '#cfa05a', '#efcb8a'],
  dirt: ['#c99a5a', '#d6aa68', '#b8864a', '#e0b878'],
  stone: ['#d8b98a', '#e6c99a', '#c4a272', '#b08e60'],
  marble: ['#e8e0cc', '#f2ecdc', '#d6ccb4', '#c4b89c'],
  rock: ['#a8703c', '#c08a50', '#8a5a30', '#d4a466', '#6e4426'],
  water: ['#2a9ec8', '#3db2d8', '#1f86b4', '#62cbe6', '#9ee4f2'],
  deep: ['#1a6aa2', '#1f7ab0', '#165a8c', '#3a92c4'],
  leaf: ['#2f6e22', '#3f8a2a', '#57a536', '#76c04a', '#24561c'],
  olive: ['#5a7a4a', '#6e8e5a', '#86a46c', '#4a6a3c', '#9ab880'],
  trunk: ['#6a4024', '#82532e', '#4e2e1a'],
  adobe: ['#e2c08e', '#ecd0a2', '#c9a26e', '#b48a5a', '#f4dcb2'],
  wood: ['#8a5a30', '#a8703c', '#6a4024', '#c08a50'],
  cloth: ['#c83a2e', '#3a6eaa', '#e8a33a', '#e8e0cc', '#6a8a3a'],
};

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function cv(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return { c, g };
}

export const px = (g: CanvasRenderingContext2D, x: number, y: number, col: string, w = 1, h = 1) => {
  g.fillStyle = col;
  g.fillRect(Math.round(x), Math.round(y), w, h);
};

export function noiseTile(g: CanvasRenderingContext2D, ox: number, oy: number, cols: string[], r: () => number, dens = 0.35) {
  px(g, ox, oy, cols[0], T, T);
  for (let i = 0; i < T * T * dens; i++) {
    const x = Math.floor(r() * T), y = Math.floor(r() * T);
    px(g, ox + x, oy + y, cols[1 + Math.floor(r() * (cols.length - 1))]);
  }
}

// ---------- TILESET ----------
export const TILE_ORDER: TileName[] = [
  'grass', 'grass2', 'dgrass', 'sand', 'dirt', 'stone', 'marble', 'rock', 'field', 'soil',
  'cliff', 'wall', 'flowers', 'mountain', 'floor', 'darkgrass', 'water', 'deep', 'snow',
  ...REAL_TILES,
];
export const VARIANTS = 4;
export const WATER_FRAMES = 3;
export const SOLID_TILES = new Set<TileName>(['water', 'deep', 'cliff', 'wall', 'cwall', 'cavewall']);

export function tileIndex(name: TileName, variant: number) {
  return TILE_ORDER.indexOf(name) * VARIANTS + (variant % VARIANTS);
}
/** índice das animações de água: frame f (0..2), borda (0/1) */
export function waterIndex(deep: boolean, frame: number, edge: boolean) {
  return TILE_ORDER.length * VARIANTS + (deep ? 6 : 0) + frame * 2 + (edge ? 1 : 0);
}

export function buildTileset(): HTMLCanvasElement {
  const total = TILE_ORDER.length * VARIANTS + 12;
  const cols = 16;
  const rows = Math.ceil(total / cols);
  const { c, g } = cv(cols * T, rows * T);
  const r = rng(77);
  const at = (i: number) => [(i % cols) * T, Math.floor(i / cols) * T];
  TILE_ORDER.forEach((name, ti) => {
    for (let v = 0; v < VARIANTS; v++) {
      const [ox, oy] = at(ti * VARIANTS + v);
      switch (name) {
        case 'grass':
        case 'grass2': {
          const p = name === 'grass' ? PAL.grass : [PAL.grass[1], PAL.grass[2], PAL.grass[3], PAL.grass[0]];
          noiseTile(g, ox, oy, p, r, 0.45);
          for (let k = 0; k < 5; k++) {
            const x = ox + Math.floor(r() * 15), y = oy + Math.floor(r() * 14);
            px(g, x, y, PAL.grass[4]);
            px(g, x, y - 1, PAL.grass[3]);
          }
          if (v === 3) { px(g, ox + 5, oy + 6, '#f2e6a0'); px(g, ox + 11, oy + 10, '#e88aa8'); }
          break;
        }
        case 'dgrass': noiseTile(g, ox, oy, PAL.dgrass, r, 0.45); break;
        case 'darkgrass': noiseTile(g, ox, oy, PAL.darkgrass, r, 0.45); break;
        case 'sand':
          noiseTile(g, ox, oy, PAL.sand, r, 0.3);
          if (v === 2) { px(g, ox + 4, oy + 9, PAL.rock[2], 2, 1); px(g, ox + 10, oy + 4, PAL.rock[1]); }
          break;
        case 'dirt': noiseTile(g, ox, oy, PAL.dirt, r, 0.35); break;
        case 'stone':
        case 'marble':
        case 'floor': {
          const p = name === 'stone' ? PAL.stone : name === 'marble' ? PAL.marble : ['#9a7a5a', '#a8886a', '#8a6a4a', '#7a5a3e'];
          px(g, ox, oy, p[0], T, T);
          // pedras irregulares
          const off = v % 2 ? 4 : 0;
          for (let y = 0; y < T; y += 5) {
            for (let x = -off; x < T; x += 8) {
              px(g, ox + Math.max(0, x) , oy + y, p[3], 1, 5);
              px(g, ox + Math.max(0, x + 1), oy + y + 1, p[1], Math.min(6, T - Math.max(0, x + 1)), 1);
            }
            px(g, ox, oy + y, p[3], T, 1);
          }
          for (let k = 0; k < 10; k++) px(g, ox + r() * 16, oy + r() * 16, p[2]);
          break;
        }
        case 'rock':
          noiseTile(g, ox, oy, [PAL.rock[1], PAL.rock[0], PAL.rock[3], PAL.rock[2]], r, 0.4);
          break;
        case 'mountain':
          noiseTile(g, ox, oy, ['#b49a78', '#a08664', '#c8b08c', '#8c7456'], r, 0.45);
          break;
        case 'snow': noiseTile(g, ox, oy, ['#f0f0f4', '#e0e4ec', '#ffffff'], r, 0.3); break;
        case 'field': {
          px(g, ox, oy, '#8a6a3a', T, T);
          for (let y = 1; y < T; y += 4) px(g, ox, oy + y, '#6e5230', T, 1);
          for (let k = 0; k < 8; k++) px(g, ox + r() * 16, oy + Math.floor(r() * 4) * 4 + 2, '#7aa83a', 1, 2);
          break;
        }
        case 'soil': noiseTile(g, ox, oy, ['#7a5a34', '#6a4a2a', '#8a6a40', '#5a3e22'], r, 0.5); break;
        case 'cliff': {
          px(g, ox, oy, PAL.rock[0], T, T);
          for (let x = 0; x < T; x += 4) {
            px(g, ox + x, oy, PAL.rock[3], 3, 2);
            px(g, ox + x + 3, oy, PAL.rock[4], 1, T);
            px(g, ox + x + 1, oy + 3, PAL.rock[1], 1, T - 4);
          }
          px(g, ox, oy + T - 2, PAL.rock[4], T, 2);
          break;
        }
        case 'wall': {
          px(g, ox, oy, PAL.adobe[0], T, T);
          for (let y = 0; y < T; y += 4) {
            px(g, ox, oy + y, PAL.adobe[3], T, 1);
            for (let x = (y / 4) % 2 ? 0 : 4; x < T; x += 8) px(g, ox + x, oy + y, PAL.adobe[3], 1, 4);
          }
          for (let k = 0; k < 6; k++) px(g, ox + r() * 16, oy + r() * 16, PAL.adobe[1]);
          break;
        }
        case 'flowers': {
          noiseTile(g, ox, oy, PAL.grass, r, 0.45);
          const fc = ['#f4f0e0', '#e88aa8', '#b88ae8', '#f2d060', '#e86a5a'];
          for (let k = 0; k < 6; k++) {
            const x = ox + 1 + Math.floor(r() * 13), y = oy + 1 + Math.floor(r() * 13);
            const col = fc[Math.floor(r() * fc.length)];
            px(g, x, y, col); px(g, x + 1, y, col); px(g, x, y + 1, col); px(g, x + 1, y + 1, '#f8e070');
          }
          break;
        }
        case 'water':
        case 'deep':
          noiseTile(g, ox, oy, name === 'water' ? PAL.water : PAL.deep, r, 0.3);
          break;
        default:
          paintRealTile(g, name, ox, oy, v, r);
      }
    }
  });
  // água animada
  const base = TILE_ORDER.length * VARIANTS;
  for (const deep of [false, true]) {
    const P = deep ? PAL.deep : PAL.water;
    for (let f = 0; f < WATER_FRAMES; f++) {
      for (const edge of [false, true]) {
        const [ox, oy] = at(base + (deep ? 6 : 0) + f * 2 + (edge ? 1 : 0));
        px(g, ox, oy, P[0], T, T);
        const rr = rng(13 + f * 7 + (deep ? 3 : 0));
        for (let k = 0; k < 40; k++) px(g, ox + rr() * 16, oy + rr() * 16, P[1 + Math.floor(rr() * 2)]);
        for (let k = 0; k < 3; k++) {
          const y = Math.floor(rr() * 14), x = (Math.floor(rr() * 10) + f * 3) % 12;
          px(g, ox + x, oy + y, P[3], 4, 1);
        }
        if (!deep && f === 1) px(g, ox + 6, oy + 7, '#ffffff');
        if (edge) {
          px(g, ox, oy, '#cfeef6', T, 1);
          for (let x = 0; x < T; x++) if ((x + f) % 3 === 0) px(g, ox + x, oy + 1, '#9ee4f2');
          px(g, ox, oy + 2, P[2], T, 1);
        }
      }
    }
  }
  return c;
}

// ---------- OBJETOS ----------
export interface ObjArt {
  canvas: HTMLCanvasElement;
  frames?: number; // spritesheet horizontal
  /** corpo de colisão relativo ao canto inferior-central (x,y negativos para cima) */
  body?: { w: number; h: number; oy?: number };
}

export function blob(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, cols: string[], r: () => number, outline = true) {
  for (let y = -ry - 1; y <= ry + 1; y++) {
    for (let x = -rx - 1; x <= rx + 1; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      const n = r() * 0.25;
      if (d <= 1 - n * 0.4) {
        const shade = y < -ry * 0.3 ? (r() < 0.6 ? 3 : 2) : y > ry * 0.4 ? (r() < 0.6 ? 0 : 1) : r() < 0.5 ? 2 : 1;
        px(g, cx + x, cy + y, cols[shade] ?? cols[0]);
      } else if (outline && d <= 1.18) {
        px(g, cx + x, cy + y, cols[4] ?? PAL.outline);
      }
    }
  }
}

export function shadow(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  g.fillStyle = 'rgba(30,20,10,0.28)';
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

export function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, line = PAL.outline) {
  px(g, x, y, line, w, h);
  px(g, x + 1, y + 1, fill, w - 2, h - 2);
}

export function drawObject(o: ObjName, v = 0, w = 0, h = 0): ObjArt {
  const r = rng(1000 + v * 31 + o.length * 7);
  switch (o) {
    case 'tree':
    case 'fig':
    case 'mustard': {
      const W = o === 'mustard' ? 56 : 48, H = o === 'mustard' ? 52 : 58;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 4, 16, 5);
      rect(g, W / 2 - 4, H - 22, 8, 19, PAL.trunk[1]);
      px(g, W / 2 - 2, H - 20, PAL.trunk[0], 2, 15);
      px(g, W / 2 - 7, H - 5, PAL.trunk[2], 14, 2);
      const leaf = o === 'fig' ? ['#2a5e1e', '#3a7a26', '#4e9430', '#68ac40', '#1e4416']
        : o === 'mustard' ? ['#6a8a2a', '#7e9e32', '#9ab83e', '#c8c850', '#3e5a1a'] : PAL.leaf;
      const cy = H - 34;
      blob(g, W / 2 - 10, cy + 4, 11, 9, leaf, r);
      blob(g, W / 2 + 10, cy + 4, 11, 9, leaf, r);
      blob(g, W / 2, cy - 6, 15, 12, leaf, r);
      blob(g, W / 2, cy + 6, 13, 8, leaf, r);
      if (o === 'mustard') for (let k = 0; k < 14; k++) px(g, 6 + r() * (W - 12), 6 + r() * 30, '#f2e060');
      return { canvas: c, body: { w: 34, h: 30 } };
    }
    case 'olive': {
      const W = 44, H = 46;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 4, 14, 4);
      rect(g, W / 2 - 3, H - 18, 7, 15, '#7a6a54');
      px(g, W / 2 - 5, H - 14, '#6a5a44', 3, 2);
      px(g, W / 2 + 3, H - 16, '#6a5a44', 3, 2);
      blob(g, W / 2 - 8, H - 26, 10, 8, PAL.olive, r);
      blob(g, W / 2 + 8, H - 26, 10, 8, PAL.olive, r);
      blob(g, W / 2, H - 32, 13, 9, PAL.olive, r);
      return { canvas: c, body: { w: 30, h: 24 } };
    }
    case 'palm': {
      const W = 48, H = 70;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 4, 10, 3);
      for (let y = 0; y < 44; y++) {
        const x = W / 2 + Math.sin(y / 14) * 3 - 3;
        px(g, x, H - 4 - y, PAL.outline, 7, 1);
        px(g, x + 1, H - 4 - y, y % 4 === 0 ? PAL.trunk[2] : PAL.trunk[1], 5, 1);
      }
      const cx = W / 2 + 1, cy = H - 48;
      const fr = ['#2f7a22', '#46a030', '#62bc3e', '#1e5216'];
      for (let a = 0; a < 7; a++) {
        const ang = (a / 7) * Math.PI * 2 + 0.3;
        for (let t = 0; t < 20; t++) {
          const x = cx + Math.cos(ang) * t, y = cy + Math.sin(ang) * t * 0.55 + (t * t) / 40;
          px(g, x - 1, y - 1, fr[3], 3, 3);
          px(g, x, y, fr[(t + a) % 3], 2, 2);
        }
      }
      px(g, cx - 2, cy - 1, '#6a4024', 4, 3);
      return { canvas: c, body: { w: 22, h: 36 } };
    }
    case 'bush': {
      const { c, g } = cv(22, 18);
      shadow(g, 11, 15, 9, 3);
      blob(g, 11, 9, 9, 6, v % 2 ? PAL.leaf : PAL.olive, r);
      if (v % 3 === 0) for (let k = 0; k < 4; k++) px(g, 5 + r() * 12, 5 + r() * 8, '#e86a5a');
      return { canvas: c, body: { w: 18, h: 11 } };
    }
    case 'rock':
    case 'bigrock':
    case 'stone': {
      const big = o !== 'rock';
      const W = big ? 32 : 16, H = big ? 28 : 13;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 3, W / 2 - 1, 3);
      const cols = o === 'stone' ? ['#7a7a72', '#8e8e86', '#a8a8a0', '#c4c4bc', '#3a3a36'] : ['#7e7a74', '#8f8a82', '#a8a298', '#c4beb2', '#3a3630'];
      blob(g, W / 2, H / 2, W / 2 - 2, H / 2 - 2, cols, r);
      if (o === 'stone') { px(g, W / 2 - 1, 6, '#5a5a54', 2, H - 12); }
      return { canvas: c, body: { w: W - 6, h: Math.max(6, H / 2) } };
    }
    case 'flower': {
      const { c, g } = cv(10, 8);
      const fc = ['#f4f0e0', '#e88aa8', '#b88ae8', '#f2d060'][v % 4];
      for (let k = 0; k < 4; k++) {
        const x = 1 + r() * 7, y = 1 + r() * 5;
        px(g, x, y + 1, '#3f7a24', 1, 2);
        px(g, x - 1, y, fc, 3, 1); px(g, x, y - 1, fc, 1, 3); px(g, x, y, '#f8e070');
      }
      return { canvas: c };
    }
    case 'reeds': {
      const { c, g } = cv(14, 22);
      for (let k = 0; k < 7; k++) {
        const x = 1 + k * 2, hh = 10 + r() * 10;
        px(g, x, 22 - hh, '#4a8a2a', 1, hh);
        if (k % 2) px(g, x, 22 - hh, '#8a5a2a', 1, 3);
      }
      return { canvas: c };
    }
    case 'deadtree': {
      const { c, g } = cv(30, 38);
      shadow(g, 15, 35, 8, 2);
      px(g, 13, 14, '#6a4a30', 4, 22);
      const br = (x: number, y: number, dx: number, n: number) => {
        for (let i = 0; i < n; i++) px(g, x + dx * i, y - i, '#6a4a30', 2, 2);
      };
      br(15, 16, 1, 10); br(14, 18, -1, 11); br(15, 24, 1, 7); br(14, 12, -0.5, 10);
      return { canvas: c, body: { w: 14, h: 18 } };
    }
    case 'house': {
      const W = (w || 6) * T, H = (h || 5) * T;
      const { c, g } = cv(W, H);
      const roofH = Math.round(H * 0.4);
      shadow(g, W / 2, H - 2, W / 2, 4);
      // telhado plano
      rect(g, 0, 0, W, roofH, PAL.adobe[4]);
      px(g, 1, 1, PAL.adobe[1], W - 2, 2);
      for (let k = 0; k < W / 3; k++) px(g, 2 + r() * (W - 4), 3 + r() * (roofH - 5), PAL.adobe[0]);
      px(g, 0, roofH - 3, PAL.adobe[3], W, 3);
      // parede frontal
      rect(g, 0, roofH - 1, W, H - roofH - 2, PAL.adobe[0]);
      for (let y = roofH + 3; y < H - 4; y += 5) {
        for (let x = (y % 2) * 4 + 2; x < W - 2; x += 9) px(g, x, y, PAL.adobe[2], 5, 1);
      }
      // porta
      const dx = Math.floor(W / 2) - 5 + (v % 3 - 1) * Math.floor(W / 5);
      rect(g, dx, H - 22, 11, 20, PAL.wood[0]);
      px(g, dx + 2, H - 20, PAL.wood[1], 7, 17);
      px(g, dx + 5, H - 20, PAL.wood[2], 1, 17);
      // janelas
      for (const wx of [8, W - 16]) {
        if (Math.abs(wx - dx) < 14) continue;
        rect(g, wx, roofH + 5, 8, 8, '#3a2a20');
        px(g, wx + 1, roofH + 5, PAL.adobe[3], 6, 1);
      }
      if (v % 2) { // varal/tecido
        px(g, W - 14, 2, PAL.cloth[v % 5], 8, 10);
      }
      return { canvas: c, body: { w: W - 2, h: H - 8, oy: 2 } };
    }
    case 'tower': {
      const W = 40, H = 72;
      const { c, g } = cv(W, H);
      rect(g, 2, 8, W - 4, H - 10, PAL.adobe[2]);
      for (let x = 2; x < W - 2; x += 6) rect(g, x, 2, 5, 8, PAL.adobe[1]);
      for (let y = 14; y < H - 4; y += 6) px(g, 3, y, PAL.adobe[3], W - 6, 1);
      rect(g, W / 2 - 3, 20, 6, 10, '#2a1a10');
      return { canvas: c, body: { w: W - 4, h: 20 } };
    }
    case 'temple': {
      const W = (w || 12) * T, H = (h || 8) * T;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 2, W / 2, 5);
      const pedH = Math.round(H * 0.28);
      // frontão
      for (let y = 0; y < pedH; y++) {
        const half = Math.round((y / pedH) * (W / 2));
        px(g, W / 2 - half, y, PAL.outline, half * 2, 1);
        px(g, W / 2 - half + 2, y, y < pedH - 3 ? PAL.marble[0] : PAL.marble[2], Math.max(0, half * 2 - 4), 1);
      }
      px(g, 0, pedH, PAL.outline, W, 4);
      px(g, 1, pedH + 1, PAL.marble[1], W - 2, 2);
      // colunas
      const n = Math.max(4, Math.floor(W / 22));
      px(g, 2, pedH + 4, '#6a5a44', W - 4, H - pedH - 10);
      for (let i = 0; i < n; i++) {
        const x = Math.round(6 + i * ((W - 18) / (n - 1)));
        rect(g, x, pedH + 4, 8, H - pedH - 12, PAL.marble[0]);
        px(g, x + 2, pedH + 5, PAL.marble[1], 2, H - pedH - 14);
        px(g, x + 5, pedH + 5, PAL.marble[2], 1, H - pedH - 14);
      }
      // porta central
      rect(g, W / 2 - 9, H - 34, 18, 26, PAL.wood[0]);
      px(g, W / 2, H - 33, PAL.wood[2], 1, 24);
      // degraus
      for (let s = 0; s < 3; s++) rect(g, 4 - s * 2 + 6, H - 8 + s * 2 - 2, W - 20 + s * 4, 4, PAL.marble[s]);
      return { canvas: c, body: { w: W - 4, h: H - 14, oy: 6 } };
    }
    case 'well': {
      const { c, g } = cv(30, 34);
      shadow(g, 15, 31, 13, 3);
      px(g, 4, 2, PAL.wood[0], 2, 18); px(g, 24, 2, PAL.wood[0], 2, 18); px(g, 3, 2, PAL.wood[1], 24, 3);
      px(g, 14, 5, '#6a6a6a', 1, 6); rect(g, 12, 10, 5, 5, PAL.wood[1]);
      blob(g, 15, 24, 12, 7, ['#7e7a74', '#8f8a82', '#a8a298', '#c4beb2', '#3a3630'], r);
      blob(g, 15, 22, 8, 3, ['#1a2a3a', '#1a2a3a', '#2a4a6a', '#2a4a6a', '#3a3630'], r);
      return { canvas: c, body: { w: 24, h: 12 } };
    }
    case 'stall': {
      const { c, g } = cv(42, 36);
      shadow(g, 21, 33, 19, 3);
      const cl = [PAL.cloth[v % 5], '#f4ecd8'];
      px(g, 3, 8, PAL.wood[0], 2, 26); px(g, 37, 8, PAL.wood[0], 2, 26);
      for (let x = 0; x < 42; x += 6) rect(g, x, 2, 7, 10, cl[(x / 6) % 2]);
      rect(g, 4, 22, 34, 11, PAL.wood[1]);
      const fruits = ['#e8a33a', '#c83a2e', '#7aa83a', '#8a4a8a', '#f2d060'];
      for (let k = 0; k < 16; k++) px(g, 6 + r() * 30, 19 + r() * 4, fruits[Math.floor(r() * 5)], 2, 2);
      return { canvas: c, body: { w: 36, h: 12 } };
    }
    case 'tent': {
      const { c, g } = cv(52, 42);
      shadow(g, 26, 39, 24, 3);
      px(g, 3, 8, PAL.wood[0], 2, 32); px(g, 47, 8, PAL.wood[0], 2, 32);
      for (let y = 0; y < 14; y++) px(g, 1 + y / 3, 6 + y, y < 2 ? PAL.outline : '#efe6d0', 50 - (y / 3) * 2, 1);
      px(g, 2, 20, '#d8ccb0', 48, 2);
      return { canvas: c, body: { w: 6, h: 6 } };
    }
    case 'fire': {
      // 3 quadros
      const { c, g } = cv(18 * 3, 20);
      for (let f = 0; f < 3; f++) {
        const ox = f * 18;
        for (let k = 0; k < 7; k++) px(g, ox + 2 + k * 2, 16 + (k % 2), '#7e7a74', 2, 2);
        px(g, ox + 4, 15, PAL.wood[2], 10, 2);
        const fl = ['#f2d060', '#e8a33a', '#e8602a'];
        for (let y = 0; y < 12; y++) {
          const wdt = Math.max(1, 6 - Math.abs(y - 4) * 0.6 - y * 0.3) + ((f + y) % 2);
          const cx = ox + 9 + Math.sin(y + f * 2) * 1.2;
          px(g, cx - wdt, 14 - y, fl[2], wdt * 2, 1);
          if (wdt > 2) px(g, cx - wdt + 1, 14 - y, fl[1], wdt * 2 - 2, 1);
          if (wdt > 3) px(g, cx - 1, 14 - y, fl[0], 2, 1);
        }
      }
      return { canvas: c, frames: 3, body: { w: 12, h: 6 } };
    }
    case 'tomb': {
      const W = 72, H = 56;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 3, W / 2 - 2, 4);
      blob(g, W / 2, H / 2 + 2, W / 2 - 3, H / 2 - 4, ['#8a6a4a', '#9a7a58', '#b49470', '#c8a888', '#3a2a1e'], r);
      // entrada
      for (let y = 0; y < 22; y++) {
        const half = y < 6 ? Math.round(Math.sqrt(36 - (6 - y) ** 2) * 1.4) : 8;
        px(g, W / 2 - 4 - half, H - 30 + y, '#120c08', half * 2, 1);
      }
      return { canvas: c, body: { w: W - 10, h: 22 } };
    }
    case 'lamp': {
      // 2 quadros (aceso/apagado)
      const { c, g } = cv(24, 24);
      for (let f = 0; f < 2; f++) {
        const ox = f * 12;
        px(g, ox + 5, 8, PAL.wood[0], 2, 14);
        px(g, ox + 3, 20, PAL.wood[2], 6, 2);
        rect(g, ox + 2, 6, 8, 4, '#b8864a');
        if (f === 0) {
          px(g, ox + 5, 2, '#f2d060', 2, 4);
          px(g, ox + 5, 1, '#fff2b0', 1, 2);
        }
      }
      return { canvas: c, frames: 2, body: { w: 6, h: 4 } };
    }
    case 'table': {
      const { c, g } = cv(56, 26);
      shadow(g, 28, 23, 26, 3);
      rect(g, 2, 6, 52, 12, PAL.wood[1]);
      px(g, 4, 18, PAL.wood[2], 3, 6); px(g, 49, 18, PAL.wood[2], 3, 6);
      const food = ['#e8d8a8', '#c83a2e', '#8a4a8a', '#e8a33a'];
      for (let k = 0; k < 8; k++) rect(g, 6 + k * 6, 7, 4, 4, food[k % 4]);
      return { canvas: c, body: { w: 52, h: 10 } };
    }
    case 'boat': {
      const { c, g } = cv(70, 34);
      for (let y = 0; y < 12; y++) {
        const inset = Math.round((y * y) / 10);
        px(g, inset, 18 + y, PAL.outline, 70 - inset * 2, 1);
        px(g, inset + 1, 18 + y, y < 3 ? PAL.wood[3] : y % 3 ? PAL.wood[1] : PAL.wood[0], 68 - inset * 2, 1);
      }
      px(g, 34, 0, PAL.wood[0], 2, 20);
      for (let y = 2; y < 17; y++) px(g, 36, y, '#efe6d0', Math.max(1, 14 - Math.abs(y - 9)), 1);
      return { canvas: c, body: { w: 60, h: 10 } };
    }
    case 'pillar': {
      const { c, g } = cv(16, 44);
      shadow(g, 8, 42, 7, 2);
      rect(g, 1, 0, 14, 5, PAL.marble[1]);
      rect(g, 3, 4, 10, 36, PAL.marble[0]);
      px(g, 5, 5, PAL.marble[1], 2, 34); px(g, 10, 5, PAL.marble[2], 1, 34);
      rect(g, 1, 38, 14, 5, PAL.marble[2]);
      return { canvas: c, body: { w: 12, h: 6 } };
    }
    case 'gate': {
      const W = 96, H = 72;
      const { c, g } = cv(W, H);
      rect(g, 0, 6, W, H - 6, PAL.adobe[2]);
      for (let x = 0; x < W; x += 8) rect(g, x, 0, 6, 8, PAL.adobe[1]);
      for (let y = 12; y < H; y += 6) px(g, 1, y, PAL.adobe[3], W - 2, 1);
      for (let y = 0; y < 40; y++) {
        const half = y < 10 ? Math.round(Math.sqrt(100 - (10 - y) ** 2) * 1.4) : 14;
        px(g, W / 2 - half, H - 40 + y, '#2a1a10', half * 2, 1);
      }
      return { canvas: c, body: { w: W, h: 16 } };
    }
    case 'crate': { const { c, g } = cv(16, 16); rect(g, 1, 2, 14, 13, PAL.wood[1]); px(g, 2, 8, PAL.wood[2], 12, 1); px(g, 7, 3, PAL.wood[2], 1, 11); return { canvas: c, body: { w: 14, h: 8 } }; }
    case 'jar': {
      const { c, g } = cv(12, 16);
      blob(g, 6, 10, 5, 5, ['#a8603a', '#b8704a', '#c8845a', '#d89a6a', '#3a2010'], r);
      rect(g, 3, 1, 6, 4, '#b8704a');
      return { canvas: c, body: { w: 10, h: 5 } };
    }
    case 'cross': {
      const { c, g } = cv(24, 48);
      shadow(g, 12, 46, 8, 2);
      rect(g, 9, 2, 6, 44, PAL.wood[0]);
      rect(g, 1, 10, 22, 5, PAL.wood[0]);
      return { canvas: c, body: { w: 8, h: 4 } };
    }
    case 'fence': { const { c, g } = cv(16, 16); px(g, 0, 5, PAL.wood[1], 16, 2); px(g, 0, 10, PAL.wood[1], 16, 2); rect(g, 1, 2, 3, 13, PAL.wood[0]); rect(g, 12, 2, 3, 13, PAL.wood[0]); return { canvas: c, body: { w: 16, h: 5 } }; }
    case 'cairn': {
      const { c, g } = cv(32, 20);
      for (let f = 0; f < 2; f++) {
        const ox = f * 16;
        blob(g, ox + 8, 15, 6, 3, ['#7e7a74', '#8f8a82', '#a8a298', '#c4beb2', '#3a3630'], r);
        blob(g, ox + 8, 9, 4, 3, ['#7e7a74', '#8f8a82', '#a8a298', '#c4beb2', '#3a3630'], r);
        if (f === 1) { px(g, ox + 7, 1, '#f2d060', 2, 5); px(g, ox + 7, 0, '#fff2b0', 1, 2); }
      }
      return { canvas: c, frames: 2, body: { w: 10, h: 5 } };
    }
    case 'sign': { const { c, g } = cv(16, 18); px(g, 7, 6, PAL.wood[0], 2, 12); rect(g, 1, 1, 14, 8, PAL.wood[1]); px(g, 3, 4, PAL.wood[2], 10, 1); return { canvas: c, body: { w: 4, h: 3 } }; }
    case 'basket': {
      const { c, g } = cv(14, 12);
      rect(g, 1, 4, 12, 8, '#b8864a');
      for (let x = 2; x < 12; x += 2) px(g, x, 5, '#8a5a30', 1, 6);
      px(g, 3, 2, '#e8d8a8', 8, 3);
      return { canvas: c };
    }
    case 'cityview': {
      const W = 320, H = 120;
      const { c, g } = cv(W, H);
      // muralhas e templo à distância
      rect(g, 0, 60, W, 60, '#c9a874', '#8a6a44');
      for (let x = 0; x < W; x += 10) rect(g, x, 54, 7, 8, '#d4b484', '#8a6a44');
      for (let k = 0; k < 26; k++) {
        const x = 6 + k * 12, hh = 10 + r() * 22;
        rect(g, x, 60 - hh * 0.2 + 8, 11, hh, '#e2c08e', '#9a7a54');
      }
      rect(g, W / 2 - 50, 10, 100, 54, '#efe4c8', '#9a7a54');
      for (let i = 0; i < 9; i++) px(g, W / 2 - 44 + i * 11, 22, '#c8b48c', 4, 40);
      rect(g, W / 2 - 56, 6, 112, 8, '#f2d878', '#9a7a54');
      return { canvas: c, body: { w: W, h: 40 } };
    }
    case 'stairs': {
      const { c, g } = cv(32, 18);
      for (let s = 0; s < 4; s++) rect(g, s * 1, s * 4, 32 - s * 2, 6, PAL.stone[s % 3]);
      return { canvas: c };
    }
    case 'bench': { const { c, g } = cv(26, 12); rect(g, 0, 2, 26, 5, PAL.wood[1]); px(g, 2, 7, PAL.wood[2], 3, 5); px(g, 21, 7, PAL.wood[2], 3, 5); return { canvas: c, body: { w: 24, h: 5 } }; }
    case 'altar': {
      const { c, g } = cv(22, 20);
      shadow(g, 11, 18, 10, 2);
      rect(g, 2, 6, 18, 13, PAL.marble[0]);
      rect(g, 0, 3, 22, 5, PAL.marble[1]);
      return { canvas: c, body: { w: 20, h: 8 } };
    }
    case 'donkey': {
      const { c, g } = cv(30, 24);
      shadow(g, 15, 22, 11, 2);
      rect(g, 6, 8, 16, 9, '#8a7a6a');
      rect(g, 20, 3, 8, 8, '#8a7a6a');
      px(g, 22, 0, '#6a5a4a', 2, 4); px(g, 25, 0, '#6a5a4a', 2, 4);
      px(g, 26, 6, '#2a1a10');
      for (const lx of [7, 11, 16, 19]) px(g, lx, 16, '#5a4a3a', 2, 6);
      px(g, 5, 9, '#5a4a3a', 2, 6);
      return { canvas: c, body: { w: 20, h: 6 } };
    }
    case 'sheep': {
      const { c, g } = cv(18, 14);
      shadow(g, 9, 12, 7, 2);
      blob(g, 8, 6, 6, 4, ['#d8d4c8', '#e4e0d4', '#f2eee4', '#ffffff', '#5a5450'], r);
      rect(g, 13, 3, 4, 5, '#3a3430');
      for (const lx of [4, 10]) px(g, lx, 10, '#3a3430', 1, 3);
      return { canvas: c, body: { w: 12, h: 4 } };
    }
    case 'net': {
      const { c, g } = cv(34, 26);
      px(g, 1, 2, PAL.wood[0], 2, 24); px(g, 31, 2, PAL.wood[0], 2, 24); px(g, 0, 2, PAL.wood[1], 34, 2);
      for (let y = 4; y < 20; y += 3) for (let x = 4; x < 30; x += 3) px(g, x, y, '#c8b48c');
      return { canvas: c, body: { w: 32, h: 5 } };
    }
  }
  return drawRealObject(o, v, w, h);
}

/** Itens coletáveis (ícones no mundo). */
export function drawPickup(kind: string): HTMLCanvasElement {
  const { c, g } = cv(14, 14);
  const r = rng(kind.length * 13);
  switch (kind) {
    case 'peixe':
      px(g, 2, 6, '#3a3a40', 9, 4); px(g, 3, 7, '#9ab0c0', 7, 2); px(g, 11, 5, '#3a3a40', 2, 6); px(g, 4, 7, '#1a1a1a');
      break;
    case 'corda':
      for (let a = 0; a < 20; a++) px(g, 7 + Math.cos(a / 3) * (5 - a / 6), 7 + Math.sin(a / 3) * (5 - a / 6), '#c8a46a', 2, 2);
      break;
    case 'pao':
      blob(g, 7, 8, 5, 3, ['#b8864a', '#c89a5a', '#d8ae6a', '#e8c48a', '#5a3a1a'], r);
      break;
    case 'cesto':
      rect(g, 2, 5, 10, 8, '#b8864a'); for (let x = 3; x < 11; x += 2) px(g, x, 6, '#8a5a30', 1, 6); px(g, 4, 3, '#e8d8a8', 6, 3);
      break;
    case 'ramo':
      px(g, 2, 11, '#6a4024', 10, 1);
      for (let x = 3; x < 12; x += 2) { px(g, x, 8, '#46a030', 1, 3); px(g, x + 1, 12, '#46a030', 1, 2); }
      break;
    case 'manto':
      rect(g, 2, 3, 10, 9, '#4a5f86'); px(g, 3, 9, '#d8b870', 8, 1);
      break;
    case 'semente':
      for (let k = 0; k < 5; k++) px(g, 4 + r() * 6, 5 + r() * 5, '#6a4a2a', 2, 2);
      break;
    case 'especiaria':
      rect(g, 4, 3, 6, 10, '#e8e0cc'); px(g, 5, 2, '#8a5a30', 4, 2);
      break;
    default:
      blob(g, 7, 7, 5, 5, ['#e8c060', '#f2d878', '#fff2b0', '#ffffff', '#8a6a2a'], r);
  }
  return c;
}

/** Pergaminho brilhante. */
export function drawScroll(): HTMLCanvasElement {
  const { c, g } = cv(16, 14);
  rect(g, 2, 3, 12, 8, '#f2e4c0');
  px(g, 1, 2, '#8a5a30', 2, 10); px(g, 13, 2, '#8a5a30', 2, 10);
  for (let y = 5; y < 10; y += 2) px(g, 4, y, '#a8865a', 8, 1);
  px(g, 7, 11, '#c83a2e', 2, 3);
  return c;
}
