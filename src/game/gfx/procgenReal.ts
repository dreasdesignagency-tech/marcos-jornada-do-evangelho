// Pixel art procedural do MUNDO REAL (Grande Tribulação): ferrugem, concreto,
// neon, chuva e tecnologia improvisada. Mesma escala dos tiles 16x16 bíblicos.
// Também guarda os objetos da memória da infância e da caverna.
import type { ObjName, TileName } from '../../data/types';
import { T, cv, px, rect, shadow, blob, noiseTile, rng, type ObjArt } from './procgen';
import { drawPrintObject, paintPavers } from './procgenPrint';

export const REAL_TILES: TileName[] = ['pavers', 'asphalt', 'metal', 'grate', 'concrete', 'rubble', 'puddle', 'cwall', 'plank', 'cavefloor', 'cavewall'];

export const RP = {
  ink: '#0d0b12',
  outline: '#08070c',
  steel: ['#2a2733', '#36323f', '#433e4f', '#565066', '#1c1a24'],
  rust: ['#5a2e1e', '#7a3e22', '#9a5226', '#3e2016'],
  conc: ['#3a3742', '#45424e', '#2e2b35', '#524e5c'],
  magenta: '#ff2bd6',
  cyan: '#2bf2ff',
  red: '#ff2a3a',
  amber: '#ffb02a',
  toxic: '#7dff3a',
  cloth: ['#8a1f2a', '#4a2a6a', '#1f5a6a'],
};

export function paintRealTile(g: CanvasRenderingContext2D, name: TileName, ox: number, oy: number, v: number, r: () => number) {
  switch (name) {
    case 'pavers': paintPavers(g, ox, oy, v, r); break;
    case 'asphalt': {
      noiseTile(g, ox, oy, ['#1f1c26', '#28242f', '#17151d', '#2f2b37'], r, 0.45);
      if (v % 2 === 0) { // rachadura
        let x = r() * 12, y = 0;
        while (y < T) { px(g, ox + x, oy + y, '#0e0c12'); x += r() < 0.5 ? 1 : -1; x = Math.max(0, Math.min(15, x)); y++; }
      }
      if (v === 3) px(g, ox + 2, oy + 7, '#5a4a26', 8, 2); // faixa de rua apagada
      break;
    }
    case 'metal': {
      px(g, ox, oy, '#34303d', T, T);
      px(g, ox, oy, '#1c1a24', T, 1); px(g, ox, oy, '#1c1a24', 1, T);
      px(g, ox + 1, oy + 1, '#4a4555', T - 2, 1);
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) px(g, ox + x, oy + y, '#5a5468');
      if (v % 2) for (let k = 0; k < 6; k++) px(g, ox + 3 + k * 2, oy + 5 + (k % 2) * 4, '#2a2733', 2, 1);
      for (let k = 0; k < 4; k++) px(g, ox + r() * 14, oy + r() * 14, RP.rust[3]);
      break;
    }
    case 'grate': {
      px(g, ox, oy, '#0a090e', T, T);
      for (let x = 0; x < T; x += 3) px(g, ox + x, oy, '#3a3644', 1, T);
      for (let y = 0; y < T; y += 4) px(g, ox, oy + y, '#2c2834', T, 1);
      px(g, ox, oy, '#4a4555', T, 1);
      break;
    }
    case 'concrete': {
      px(g, ox, oy, '#3c3944', T, T);
      for (let k = 0; k < 18; k++) px(g, ox + r() * 16, oy + r() * 16, r() < 0.5 ? '#34313b' : '#46434f');
      px(g, ox, oy + (v % 2 ? 7 : 15), '#2a2730', T, 1);
      px(g, ox + (v % 2 ? 15 : 7), oy, '#2a2730', 1, T);
      if (v === 2) { let x = 4; for (let y = 3; y < 13; y++) { px(g, ox + x, oy + y, '#211f27'); if (r() < 0.4) x++; } }
      break;
    }
    case 'rubble': {
      noiseTile(g, ox, oy, ['#1f1c26', '#28242f', '#17151d'], r, 0.4);
      for (let k = 0; k < 5; k++) {
        const x = ox + 1 + r() * 12, y = oy + 1 + r() * 12, s = 2 + Math.floor(r() * 3);
        px(g, x, y + 1, '#0e0c12', s, s);
        px(g, x, y, RP.conc[Math.floor(r() * 4)], s, s - 1);
      }
      if (v === 1) px(g, ox + 9, oy + 4, RP.rust[1], 4, 1);
      break;
    }
    case 'puddle': {
      noiseTile(g, ox, oy, ['#16131f', '#1b1726', '#121019'], r, 0.3);
      const cols = v % 2 ? ['#6a1a62', RP.magenta] : ['#1a5a6e', RP.cyan];
      for (let k = 0; k < 4; k++) {
        const y = oy + 2 + Math.floor(r() * 12), x = ox + Math.floor(r() * 10), w = 2 + Math.floor(r() * 5);
        px(g, x, y, cols[0], w, 1);
        if (r() < 0.5) px(g, x + 1, y, cols[1], 1, 1);
      }
      px(g, ox + 5 + v, oy + 6, '#2c2838', 4, 1);
      break;
    }
    case 'cwall': {
      px(g, ox, oy, '#211e29', T, T);
      for (let x = (v % 2) * 4; x < T; x += 8) px(g, ox + x, oy, '#15131b', 1, T);
      px(g, ox, oy + 9, '#15131b', T, 1);
      px(g, ox, oy, '#3a3644', T, 2);
      px(g, ox, oy + 2, '#2c2834', T, 1);
      if (v === 2) { px(g, ox + 10, oy + 3, RP.rust[0], 1, 9); px(g, ox + 11, oy + 5, RP.rust[3], 1, 6); }
      if (v === 3) px(g, ox + 3, oy + 5, '#5a1a2a', 3, 2); // pichação
      break;
    }
    case 'plank': {
      px(g, ox, oy, '#7a5230', T, T);
      for (let y = 0; y < T; y += 4) {
        px(g, ox, oy + y, '#5a3a20', T, 1);
        const j = ((y / 4 + v) % 2) * 8 + 3;
        px(g, ox + j, oy + y, '#5a3a20', 1, 4);
      }
      for (let k = 0; k < 8; k++) px(g, ox + r() * 15, oy + r() * 15, '#8a6038', 2, 1);
      break;
    }
    case 'cavefloor':
      noiseTile(g, ox, oy, ['#2e2620', '#3a3028', '#241e19', '#45392e'], r, 0.5);
      if (v === 3) px(g, ox + 6, oy + 8, '#1a2a36', 4, 2); // poça
      break;
    case 'cavewall': {
      noiseTile(g, ox, oy, ['#1a1512', '#221b16', '#120e0c'], r, 0.5);
      px(g, ox, oy, '#3a2e26', T, 2);
      for (let k = 0; k < 3; k++) px(g, ox + r() * 14, oy + 3 + r() * 10, '#2e241e', 3, 2);
      break;
    }
  }
}

/** Placa de LED: quadros com letras abstratas (sem marcas reais). */
function glyphs(g: CanvasRenderingContext2D, x: number, y: number, w: number, col: string, r: () => number) {
  for (let i = 0; i < w; i += 4) {
    const h = 2 + Math.floor(r() * 3);
    px(g, x + i, y + (4 - h), col, 3, h);
  }
}

export function drawRealObject(o: ObjName, v = 0, w = 0, h = 0): ObjArt {
  const pr = drawPrintObject(o, v, w);
  if (pr) return pr;
  const r = rng(2000 + v * 17 + o.length * 11);
  switch (o) {
    case 'pipe': {
      const W = Math.max(2, w || 3) * T, H = 14;
      const { c, g } = cv(W, H);
      px(g, 0, 3, RP.outline, W, 9);
      px(g, 0, 4, RP.steel[1], W, 7);
      px(g, 0, 5, RP.steel[3], W, 1);
      px(g, 0, 9, RP.steel[4], W, 1);
      for (let x = 6; x < W; x += 24) { rect(g, x, 1, 5, 12, RP.steel[2], RP.outline); px(g, x + 1, 2, RP.steel[3], 1, 10); }
      for (let k = 0; k < W / 10; k++) px(g, r() * W, 6 + r() * 4, RP.rust[1], 2, 1);
      return { canvas: c, body: { w: W, h: 7 } };
    }
    case 'neon': {
      const { c, g } = cv(34, 26);
      const col = [RP.magenta, RP.cyan, RP.red][v % 3];
      px(g, 15, 14, RP.steel[4], 3, 12);
      rect(g, 0, 0, 34, 16, '#120f18', RP.outline);
      px(g, 2, 2, col, 30, 1); px(g, 2, 13, col, 30, 1); px(g, 2, 2, col, 1, 12); px(g, 31, 2, col, 1, 12);
      glyphs(g, 5, 5, 24, col, r);
      return { canvas: c, body: { w: 6, h: 4 } };
    }
    case 'barrelfire': {
      const { c, g } = cv(18 * 3, 28);
      for (let f = 0; f < 3; f++) {
        const ox = f * 18;
        shadow(g, ox + 9, 26, 8, 2);
        rect(g, ox + 3, 12, 12, 15, RP.rust[1], RP.outline);
        px(g, ox + 4, 15, RP.rust[3], 10, 1); px(g, ox + 4, 21, RP.rust[3], 10, 1);
        px(g, ox + 5, 13, RP.rust[2], 2, 12);
        const fl = ['#fff0a0', '#ffb02a', '#ff5a1a'];
        for (let y = 0; y < 11; y++) {
          const wdt = Math.max(1, 5 - Math.abs(y - 3) * 0.6 - y * 0.25) + ((f + y) % 2);
          const cx = ox + 9 + Math.sin(y + f * 2) * 1.4;
          px(g, cx - wdt, 12 - y, fl[2], wdt * 2, 1);
          if (wdt > 2) px(g, cx - wdt + 1, 12 - y, fl[1], wdt * 2 - 2, 1);
          if (wdt > 3) px(g, cx - 1, 12 - y, fl[0], 2, 1);
        }
      }
      return { canvas: c, frames: 3, body: { w: 12, h: 6 } };
    }
    case 'torch': {
      const { c, g } = cv(10 * 3, 24);
      for (let f = 0; f < 3; f++) {
        const ox = f * 10;
        px(g, ox + 4, 10, '#4a2e1a', 2, 14);
        const fl = ['#fff0a0', '#ffb02a', '#ff5a1a'];
        for (let y = 0; y < 8; y++) {
          const wdt = Math.max(1, 3 - y * 0.35) + ((f + y) % 2) * 0.5;
          const cx = ox + 5 + Math.sin(y + f * 2);
          px(g, cx - wdt, 9 - y, fl[2], wdt * 2, 1);
          if (wdt > 1.5) px(g, cx - 1, 9 - y, fl[y < 4 ? 0 : 1], 2, 1);
        }
      }
      return { canvas: c, frames: 3, body: { w: 4, h: 3 } };
    }
    case 'screen': {
      // telão de propaganda do Sistema: um olho vermelho vigilante
      const { c, g } = cv(64, 50);
      px(g, 10, 30, RP.steel[4], 4, 20); px(g, 50, 30, RP.steel[4], 4, 20);
      rect(g, 0, 0, 64, 34, '#0c0a10', RP.outline);
      px(g, 2, 2, '#2a0a12', 60, 30);
      for (let y = 3; y < 31; y += 2) px(g, 2, y, '#1e070d', 60, 1);
      for (let yy = -7; yy <= 7; yy++) {
        const half = Math.round(16 * Math.sqrt(1 - (yy * yy) / 64));
        px(g, 32 - half, 15 + yy, '#7a0f1e', half * 2, 1);
      }
      blob(g, 32, 15, 6, 6, ['#ff2a3a', '#ff4a52', '#ff7a7a', '#ffc0c0', '#3a0006'], r);
      px(g, 30, 13, '#0c0a10', 4, 4);
      glyphs(g, 6, 27, 52, '#ff5a6a', r);
      return { canvas: c, body: { w: 48, h: 6 } };
    }
    case 'container': {
      const { c, g } = cv(56, 34);
      shadow(g, 28, 31, 26, 3);
      const col = [RP.rust[1], '#2a4a5a', '#5a2a3a'][v % 3];
      rect(g, 0, 2, 56, 30, col, RP.outline);
      for (let x = 3; x < 54; x += 4) px(g, x, 4, RP.outline, 1, 26);
      px(g, 1, 3, '#ffffff22', 54, 1);
      px(g, 24, 10, '#d8d0b0', 8, 3); // número apagado
      for (let k = 0; k < 10; k++) px(g, r() * 54, 6 + r() * 24, RP.rust[2], 2, 2);
      return { canvas: c, body: { w: 54, h: 18 } };
    }
    case 'wreck': {
      const { c, g } = cv(46, 28);
      shadow(g, 23, 25, 21, 3);
      rect(g, 2, 6, 42, 18, RP.rust[0], RP.outline);
      rect(g, 10, 2, 24, 10, '#2a2733', RP.outline);
      px(g, 12, 4, '#1a3040', 20, 6); // vidro quebrado
      px(g, 16, 5, '#3a6a80', 3, 1);
      for (const x of [6, 34]) { rect(g, x, 20, 7, 7, '#16141a', RP.outline); }
      for (let k = 0; k < 14; k++) px(g, 3 + r() * 40, 8 + r() * 14, r() < 0.5 ? RP.rust[2] : RP.rust[3], 2, 1);
      return { canvas: c, body: { w: 40, h: 12 } };
    }
    case 'barrier': {
      const { c, g } = cv(34, 16);
      shadow(g, 17, 14, 15, 2);
      rect(g, 0, 3, 34, 11, '#8a8478', RP.outline);
      for (let x = 2; x < 32; x += 8) { px(g, x, 4, '#e8b81a', 4, 9); px(g, x + 4, 4, '#1a1a1a', 4, 9); }
      return { canvas: c, body: { w: 32, h: 7 } };
    }
    case 'watchtower': {
      const { c, g } = cv(34, 74);
      shadow(g, 17, 72, 14, 3);
      px(g, 6, 24, RP.steel[4], 3, 48); px(g, 25, 24, RP.steel[4], 3, 48);
      for (let y = 30; y < 70; y += 10) { px(g, 7, y, RP.steel[2], 20, 1); }
      rect(g, 2, 8, 30, 18, RP.steel[1], RP.outline);
      px(g, 5, 12, '#0a0a0e', 24, 6);
      px(g, 0, 4, RP.steel[3], 34, 5);
      px(g, 15, 0, RP.red, 4, 4); // luz de vigia
      return { canvas: c, body: { w: 24, h: 10 } };
    }
    case 'tarp': {
      // barraca do mercado clandestino com lona rasgada e luzinhas
      const { c, g } = cv(54, 42);
      const col = RP.cloth[v % 3];
      shadow(g, 27, 39, 25, 3);
      px(g, 4, 14, '#2a1a10', 2, 26); px(g, 48, 14, '#2a1a10', 2, 26);
      rect(g, 6, 24, 42, 14, '#4a2e1a', RP.outline);
      for (let x = 9; x < 46; x += 7) rect(g, x, 20, 6, 6, ['#6a4a2a', '#2a5a4a', '#7a3a1a'][x % 3], RP.outline);
      rect(g, 0, 4, 54, 14, col, RP.outline);
      for (let x = 2; x < 52; x += 6) px(g, x, 16, '#00000055', 3, 4); // franja rasgada
      px(g, 1, 5, '#ffffff22', 52, 1);
      for (let x = 4; x < 52; x += 6) px(g, x, 18, x % 12 ? RP.amber : '#fff0a0');
      return { canvas: c, body: { w: 48, h: 12 } };
    }
    case 'server': {
      const { c, g } = cv(20, 34);
      shadow(g, 10, 32, 9, 2);
      rect(g, 0, 0, 20, 33, '#15131b', RP.outline);
      for (let y = 3; y < 30; y += 5) {
        px(g, 2, y, '#24212c', 16, 3);
        px(g, 3, y + 1, [RP.cyan, RP.toxic, RP.amber][(y + v) % 3]);
        px(g, 6, y + 1, RP.cyan);
      }
      return { canvas: c, body: { w: 18, h: 8 } };
    }
    case 'capsule': {
      const { c, g } = cv(30, 46);
      shadow(g, 15, 44, 13, 3);
      rect(g, 2, 6, 26, 38, RP.steel[2], RP.outline);
      blob(g, 15, 18, 10, 10, ['#0e4a5a', '#127080', '#1aa0b0', '#8af6ff', '#062a34'], r);
      px(g, 8, 34, RP.cyan, 14, 2);
      px(g, 6, 40, RP.steel[3], 18, 2);
      px(g, 13, 0, RP.steel[4], 4, 7);
      return { canvas: c, body: { w: 24, h: 10 } };
    }
    case 'generator': {
      const { c, g } = cv(32, 26);
      shadow(g, 16, 24, 15, 2);
      rect(g, 0, 4, 32, 20, '#3a4a2a', RP.outline);
      for (let x = 4; x < 20; x += 3) px(g, x, 7, '#26321c', 1, 12);
      rect(g, 22, 8, 7, 7, '#15131b', RP.outline);
      px(g, 24, 10, RP.amber, 3, 3);
      px(g, 2, 0, RP.steel[3], 6, 5);
      return { canvas: c, body: { w: 30, h: 10 } };
    }
    case 'cables': {
      const { c, g } = cv(40, 12);
      const cols = ['#1a1820', '#2a1a2a', '#14202a'];
      for (let k = 0; k < 3; k++) for (let x = 0; x < 40; x++) px(g, x, 4 + Math.sin(x / 5 + k * 2) * 3 + k, cols[k], 1, 2);
      return { canvas: c };
    }
    case 'bed': {
      const { c, g } = cv(24, 36);
      shadow(g, 12, 34, 11, 2);
      rect(g, 0, 2, 24, 32, '#4a2e1a', RP.outline);
      px(g, 2, 4, '#c8c0a8', 20, 7); // travesseiro
      px(g, 2, 12, '#5a5a7a', 20, 20); // cobertor remendado
      px(g, 4, 18, '#7a3a3a', 6, 5); px(g, 14, 25, '#3a5a4a', 5, 4);
      return { canvas: c, body: { w: 22, h: 26 } };
    }
    case 'cot': {
      const { c, g } = cv(20, 30);
      rect(g, 0, 0, 20, 30, '#5a5040', RP.outline);
      px(g, 2, 2, '#8a8070', 16, 6);
      px(g, 2, 9, '#4a4a5a', 16, 19);
      return { canvas: c, body: { w: 18, h: 24 } };
    }
    case 'shelf': {
      const { c, g } = cv(30, 30);
      shadow(g, 15, 28, 14, 2);
      rect(g, 0, 0, 30, 29, '#3a2618', RP.outline);
      for (let y = 6; y < 28; y += 8) {
        px(g, 1, y, '#2a1a10', 28, 1);
        for (let x = 3; x < 27; x += 5) if (r() < 0.75) px(g, x, y - 4, ['#7a7a6a', '#8a3a2a', '#c8b070', '#4a6a7a'][Math.floor(r() * 4)], 3, 4);
      }
      return { canvas: c, body: { w: 28, h: 10 } };
    }
    case 'locker': {
      const { c, g } = cv(16, 30);
      shadow(g, 8, 28, 7, 2);
      rect(g, 0, 0, 16, 29, RP.steel[1], RP.outline);
      px(g, 2, 4, RP.steel[4], 12, 1); px(g, 2, 6, RP.steel[4], 12, 1);
      px(g, 11, 14, RP.steel[3], 2, 3);
      return { canvas: c, body: { w: 14, h: 8 } };
    }
    case 'photo': {
      // mesinha com o porta-retrato da irmã
      const { c, g } = cv(22, 22);
      shadow(g, 11, 20, 10, 2);
      rect(g, 1, 10, 20, 10, '#5a3a22', RP.outline);
      rect(g, 6, 1, 10, 11, '#c8a060', RP.outline);
      px(g, 8, 3, '#e8c8a0', 6, 7);
      px(g, 9, 3, '#5a341c', 4, 3); // cabelo
      px(g, 10, 7, '#c83a2e', 2, 2);
      return { canvas: c, body: { w: 18, h: 8 } };
    }
    case 'backpack': {
      const { c, g } = cv(16, 16);
      shadow(g, 8, 14, 6, 2);
      rect(g, 2, 2, 12, 12, '#5a4a2a', RP.outline);
      px(g, 4, 4, '#6a5a32', 8, 3);
      px(g, 4, 9, '#3a2e1a', 8, 1);
      px(g, 7, 0, '#3a2e1a', 2, 3);
      return { canvas: c };
    }
    case 'console': {
      const { c, g } = cv(26, 26);
      shadow(g, 13, 24, 12, 2);
      rect(g, 0, 8, 26, 16, RP.steel[1], RP.outline);
      rect(g, 3, 0, 20, 12, '#0a0a10', RP.outline);
      px(g, 5, 2, '#0e3a44', 16, 8);
      glyphs(g, 6, 4, 14, RP.cyan, r);
      for (let x = 4; x < 22; x += 3) px(g, x, 15, '#1a1820', 2, 2);
      return { canvas: c, body: { w: 24, h: 10 } };
    }
    case 'banner': {
      // estandarte do Sistema: olho vermelho sobre preto
      const { c, g } = cv(24, 42);
      px(g, 0, 0, RP.steel[3], 24, 2);
      px(g, 2, 2, '#14080a', 20, 34);
      for (let x = 2; x < 22; x += 4) px(g, x, 36, '#14080a', 2, 4);
      px(g, 4, 4, '#7a0f1e', 16, 1);
      for (let yy = -4; yy <= 4; yy++) { const half = Math.round(8 * Math.sqrt(1 - (yy * yy) / 16)); px(g, 12 - half, 18 + yy, RP.red, half * 2, 1); }
      px(g, 10, 16, '#14080a', 4, 4);
      return { canvas: c };
    }
    case 'vent': {
      const { c, g } = cv(24, 20);
      shadow(g, 12, 18, 11, 2);
      rect(g, 0, 2, 24, 16, RP.steel[1], RP.outline);
      blob(g, 12, 10, 6, 6, ['#1a1820', '#24212c', '#2e2a38', '#3a3644', RP.outline], r);
      px(g, 11, 4, RP.steel[3], 2, 12); px(g, 6, 9, RP.steel[3], 12, 2);
      return { canvas: c, body: { w: 22, h: 8 } };
    }
    case 'swing': {
      const { c, g } = cv(26, 34);
      px(g, 2, 0, '#6a4024', 3, 34); px(g, 21, 0, '#6a4024', 3, 34); px(g, 0, 0, '#82532e', 26, 3);
      px(g, 8, 3, '#c8b48c', 1, 22); px(g, 17, 3, '#c8b48c', 1, 22);
      rect(g, 6, 24, 14, 4, '#a8703c');
      return { canvas: c, body: { w: 24, h: 4 } };
    }
    case 'chest': {
      const { c, g } = cv(18, 16);
      shadow(g, 9, 14, 8, 2);
      rect(g, 1, 3, 16, 11, '#4a3222', RP.outline);
      px(g, 2, 7, '#2a1a10', 14, 1);
      px(g, 8, 6, '#c8a64a', 2, 3);
      return { canvas: c, body: { w: 14, h: 6 } };
    }
    case 'hatch': {
      const { c, g } = cv(24, 18);
      rect(g, 0, 0, 24, 18, '#15131b', RP.outline);
      px(g, 2, 2, '#24212c', 20, 14);
      for (let x = 4; x < 21; x += 4) px(g, x, 3, '#0a090e', 2, 12);
      px(g, 3, 8, RP.toxic, 1, 2); // marca da resistência
      return { canvas: c };
    }
    case 'antenna': {
      const { c, g } = cv(18, 46);
      shadow(g, 9, 44, 6, 2);
      px(g, 8, 4, RP.steel[3], 2, 40);
      for (let y = 10; y < 40; y += 8) px(g, 4, y, RP.steel[2], 10, 1);
      px(g, 7, 0, RP.red, 4, 4);
      return { canvas: c, body: { w: 6, h: 4 } };
    }
    case 'scrap': {
      const { c, g } = cv(30, 20);
      shadow(g, 15, 18, 14, 2);
      for (let k = 0; k < 9; k++) {
        const x = 2 + r() * 22, y = 4 + r() * 10, s = 3 + Math.floor(r() * 5);
        px(g, x, y + 1, RP.outline, s, s - 1);
        px(g, x, y, [RP.steel[2], RP.rust[1], RP.steel[3], RP.rust[2]][Math.floor(r() * 4)], s, s - 2);
      }
      return { canvas: c, body: { w: 24, h: 8 } };
    }
  }
  const { c } = cv(8, 8);
  return { canvas: c };
}

/** Cor de luz (neon/fogo) emitida por objetos do mundo real. */
export const OBJ_GLOW: Partial<Record<ObjName, { color: number; r: number; fy?: number }>> = {
  neon: { color: 0xff2bd6, r: 90 },
  screen: { color: 0xff2a3a, r: 130 },
  barrelfire: { color: 0xff8a2a, r: 130, fy: 0.75 },
  torch: { color: 0xffa040, r: 110, fy: 0.8 },
  server: { color: 0x2bf2ff, r: 60 },
  capsule: { color: 0x2bf2ff, r: 90 },
  console: { color: 0x2bf2ff, r: 70, fy: 0.75 },
  watchtower: { color: 0xff2a3a, r: 70, fy: 0.95 },
  tarp: { color: 0xffb02a, r: 100, fy: 0.55 },
  generator: { color: 0xffb02a, r: 40 },
  antenna: { color: 0xff2a3a, r: 40, fy: 0.95 },
  arenagate: { color: 0xff2a3a, r: 190, fy: 0.25 },
  billboard: { color: 0xff2bd6, r: 170, fy: 0.6 },
  neoncross: { color: 0x2bf2ff, r: 120, fy: 0.75 },
  kiosk: { color: 0x2bf2ff, r: 70, fy: 0.7 },
  neonfence: { color: 0xff2a3a, r: 46, fy: 0.15 },
  wsign: { color: 0x2bf2ff, r: 80, fy: 0.65 },
  stairsup: { color: 0xff2bd6, r: 70, fy: 0.5 },
  lantern: { color: 0xffb02a, r: 50, fy: 0.5 },
};
export const NEON_COLORS = [0xff2bd6, 0x2bf2ff, 0xff2a3a];

/** Drone de vigilância (2 quadros: hélices). */
export function drawDrone(): HTMLCanvasElement {
  const { c, g } = cv(24 * 2, 16);
  for (let f = 0; f < 2; f++) {
    const ox = f * 24;
    px(g, ox + 2, f ? 3 : 2, '#8a8a9a', 7, 1); px(g, ox + 15, f ? 2 : 3, '#8a8a9a', 7, 1);
    px(g, ox + 5, 4, RP.outline, 2, 3); px(g, ox + 17, 4, RP.outline, 2, 3);
    rect(g, ox + 6, 5, 12, 8, RP.steel[2], RP.outline);
    px(g, ox + 8, 7, RP.steel[3], 8, 1);
    px(g, ox + 11, 9, RP.red, 2, 2);
    px(g, ox + 11, 13, RP.red, 2, 1);
  }
  return c;
}
