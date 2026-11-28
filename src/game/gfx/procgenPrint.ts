// Pixel art do Setor Refúgio no estilo da referência enviada: piso de pedra roxa
// molhado, bunker da Arena com portão vermelho, letreiros neon, barracas com
// luzinhas, cerca com neon vermelho e cruz ciano da resistência.
import type { ObjName } from '../../data/types';
import { cv, px, rect, shadow, blob, rng, T, type ObjArt } from './procgen';

const O = '#08060c';

// ---------- fonte 3x5 para letreiros ----------
const GLYPH: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111',
  '9': '111101111001110', '-': '000000111000000', ' ': '000000000000000', 'É': '111100110100111',
};
/** Escreve texto em pixel (3x5 por letra, escala s). Retorna a largura usada. */
export function pixText(g: CanvasRenderingContext2D, text: string, x: number, y: number, col: string, s = 1) {
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const gl = GLYPH[ch] ?? GLYPH[' '];
    for (let i = 0; i < 15; i++) if (gl[i] === '1') px(g, cx + (i % 3) * s, y + Math.floor(i / 3) * s, col, s, s);
    cx += 4 * s;
  }
  return cx - x;
}
const textW = (t: string, s = 1) => t.length * 4 * s - s;

/** Brilho neon: traço com halo. */
function neonLine(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, halo: string) {
  px(g, x - 1, y - 1, halo, w + 2, h + 2);
  px(g, x, y, col, w, h);
}

/** Crânio com chifres (emblema da Arena). */
function hornedSkull(g: CanvasRenderingContext2D, cx: number, cy: number, s: number, col: string, dark: string) {
  // chifres
  for (let i = 0; i < 7 * s; i++) {
    const t = i / (7 * s);
    const hx = Math.round(6 * s * t + 3 * s), hy = Math.round(-4 * s * Math.sin(t * Math.PI * 0.9));
    px(g, cx - hx - s, cy - 2 * s + hy, col, s + 1, s + 1);
    px(g, cx + hx, cy - 2 * s + hy, col, s + 1, s + 1);
  }
  // crânio
  for (let y = -3 * s; y <= 3 * s; y++) {
    const half = Math.round(3.4 * s * Math.sqrt(Math.max(0, 1 - (y * y) / (10 * s * s))));
    px(g, cx - half, cy + y, col, half * 2, 1);
  }
  px(g, cx - 2 * s, cy + 3 * s, col, 4 * s, 3 * s); // mandíbula
  px(g, cx - 2 * s - 1, cy - s, dark, 2 * s, 2 * s); // olhos
  px(g, cx + 1, cy - s, dark, 2 * s, 2 * s);
  px(g, cx - 1, cy + s + 1, dark, 2, s); // nariz
  for (let k = -1; k <= 1; k++) px(g, cx + k * s - 1, cy + 4 * s, dark, 1, 2 * s); // dentes
}

export function drawPrintObject(o: ObjName, v = 0, w = 0): ObjArt | null {
  const r = rng(3000 + v * 13 + o.length * 7);
  switch (o) {
    case 'arenagate': {
      const W = 200, H = 136;
      const { c, g } = cv(W, H);
      shadow(g, W / 2, H - 4, W / 2 - 6, 5);
      // bunker de concreto com laterais inclinadas
      for (let y = 18; y < H - 6; y++) {
        const inset = Math.max(0, Math.round((H - 6 - y) * 0.22));
        px(g, 6 + inset, y, O, W - 12 - inset * 2, 1);
        px(g, 8 + inset, y, (y % 9 === 0) ? '#2a2632' : '#34303e', W - 16 - inset * 2, 1);
      }
      for (let k = 0; k < 220; k++) px(g, 14 + r() * (W - 28), 22 + r() * (H - 34), r() < 0.5 ? '#2a2632' : '#403a4c');
      for (let k = 0; k < 5; k++) { let x = 20 + r() * (W - 40), y = 24 + r() * 40; for (let j = 0; j < 14; j++) { px(g, x, y, '#1c1824'); x += r() < 0.5 ? 1 : -1; y++; } }
      px(g, 30, 16, '#4a4458', W - 60, 3); // borda superior
      // túnel vermelho
      const dx = W / 2 - 28, dy = 62, dw = 56, dh = H - 6 - dy;
      px(g, dx - 6, dy - 6, '#1a161e', dw + 12, dh + 6);
      for (let y = 0; y < dh; y++) {
        const t = y / dh;
        const col = t < 0.25 ? '#3a0610' : t < 0.5 ? '#6a0a18' : t < 0.75 ? '#a0101e' : '#d81a2a';
        px(g, dx, dy + y, col, dw, 1);
      }
      for (let y = 8; y < dh; y += 7) px(g, dx + 6, dy + y, '#ff3a4a55', dw - 12, 1); // reflexo no piso do túnel
      neonLine(g, dx - 3, dy - 3, dw + 6, 2, '#ff2a3a', '#ff2a3a55');
      neonLine(g, dx - 3, dy - 3, 2, dh + 3, '#ff2a3a', '#ff2a3a55');
      neonLine(g, dx + dw + 1, dy - 3, 2, dh + 3, '#ff2a3a', '#ff2a3a55');
      for (const [x, y, w2] of [[dx + 8, dy + 4, 12], [dx + dw - 20, dy + 4, 12]]) neonLine(g, x, y, w2, 2, '#ff4a5a', '#ff2a3a44');
      // faixas de perigo
      for (const sx of [dx - 50, dx + dw + 12]) {
        px(g, sx, H - 22, O, 40, 10);
        for (let x = 0; x < 38; x += 6) { px(g, sx + 1 + x, H - 21, '#e8b81a', 3, 8); px(g, sx + 4 + x, H - 21, '#1a1a1a', 3, 8); }
      }
      // estandarte principal com crânio
      const bx = W / 2 - 20, by = 4;
      px(g, bx - 3, by, '#5a5466', 46, 3);
      px(g, bx, by + 3, '#140608', 40, 50);
      for (let x = 0; x < 40; x += 5) px(g, bx + x, by + 53, '#140608', 3, 5 + (x % 10 ? 2 : 0));
      hornedSkull(g, W / 2, by + 26, 3, '#e8243a', '#140608');
      px(g, bx + 2, by + 4, '#3a0a12', 36, 1);
      // estandarte lateral (X)
      px(g, 22, 30, '#140608', 18, 34);
      for (let i = 0; i < 12; i++) { px(g, 25 + i, 36 + i * 2, '#c8203a', 2, 2); px(g, 36 - i, 36 + i * 2, '#c8203a', 2, 2); }
      // painel "ARENA CLANDESTINA A-17"
      const pxl = W - 62, pyl = 34;
      rect(g, pxl, pyl, 54, 44, '#22202a', O);
      px(g, pxl + 2, pyl + 2, '#2c2a36', 50, 40);
      pixText(g, 'ARENA', pxl + (54 - textW('ARENA', 2)) / 2, pyl + 5, '#d8d4e4', 2);
      pixText(g, 'CLANDESTINA', pxl + (54 - textW('CLANDESTINA', 1)) / 2, pyl + 18, '#b8b4c8', 1);
      pixText(g, 'A-17', pxl + (54 - textW('A-17', 2)) / 2, pyl + 27, '#d8d4e4', 2);
      for (let x = 0; x < 50; x += 6) { px(g, pxl + 2 + x, pyl + 40, '#e8b81a', 3, 2); }
      // luzes vermelhas laterais
      for (const lx of [dx - 14, dx + dw + 10]) neonLine(g, lx, dy + 4, 2, 18, '#ff2a3a', '#ff2a3a44');
      return { canvas: c, body: { w: W - 16, h: 34 } };
    }
    case 'billboard': {
      const W = 92, H = 78;
      const { c, g } = cv(W, H);
      px(g, 10, 60, '#1c1824', 4, 18); px(g, W - 14, 60, '#1c1824', 4, 18);
      rect(g, 0, 0, W, 62, '#1a0f28', O);
      neonLine(g, 2, 2, W - 4, 2, '#ff2bd6', '#ff2bd655');
      neonLine(g, 2, 58, W - 4, 2, '#ff2bd6', '#ff2bd655');
      neonLine(g, 2, 2, 2, 58, '#ff2bd6', '#ff2bd655');
      neonLine(g, W - 4, 2, 2, 58, '#ff2bd6', '#ff2bd655');
      // logotipo e nome (fictícios)
      for (let k = 0; k < 4; k++) { px(g, 10 + k * 4, 14 + k, '#ff6ae8', 3, 20 - k * 2); }
      pixText(g, 'EDEN', 8, 38, '#ff8af0', 2);
      pixText(g, 'CORP', 10, 50, '#ff6ae8', 1);
      // rosto holográfico ciano (perfil)
      const fx = 64, fy = 30;
      for (let y = -22; y <= 22; y++) {
        const half = Math.round(16 * Math.sqrt(Math.max(0, 1 - (y * y) / 520)));
        const col = y < -10 ? '#2a8ae8' : y < 6 ? '#3aa8ff' : '#2a7ad8';
        px(g, fx - half, fy + y, col, half * 2 - (y > 8 ? 4 : 0), 1);
      }
      px(g, fx - 16, fy - 4, '#3aa8ff', 4, 6); // nariz
      px(g, fx - 8, fy - 6, '#bff4ff', 6, 2); // olho
      px(g, fx - 6, fy - 6, '#ffffff', 2, 2);
      px(g, fx - 10, fy + 8, '#1a4aa8', 8, 2); // boca
      for (let y = fy - 22; y < fy + 22; y += 3) px(g, fx - 16, y, '#ffffff18', 32, 1); // linhas de scan
      return { canvas: c, body: { w: W - 20, h: 6 } };
    }
    case 'emblem': {
      const { c, g } = cv(46, 36);
      g.globalAlpha = 0.5;
      hornedSkull(g, 23, 16, 3, '#d8d4e8', '#15101e');
      g.globalAlpha = 1;
      return { canvas: c };
    }
    case 'neoncross': {
      const { c, g } = cv(26, 50);
      px(g, 11, 30, '#1c1824', 4, 20);
      neonLine(g, 11, 2, 4, 30, '#7af6ff', '#2bf2ff66');
      neonLine(g, 3, 10, 20, 4, '#7af6ff', '#2bf2ff66');
      px(g, 12, 3, '#ffffff', 2, 28); px(g, 4, 11, '#ffffff', 18, 2);
      return { canvas: c, body: { w: 6, h: 4 } };
    }
    case 'kiosk': {
      const { c, g } = cv(24, 34);
      shadow(g, 12, 32, 10, 2);
      rect(g, 2, 4, 20, 28, '#2a2638', O);
      rect(g, 4, 6, 16, 11, '#062830', O);
      px(g, 5, 7, '#2bf2ff', 14, 9);
      px(g, 7, 9, '#bff8ff', 6, 2); px(g, 7, 12, '#0e5a6a', 10, 1);
      px(g, 5, 20, '#1a1824', 14, 4);
      px(g, 8, 19, '#ff2bd6', 2, 2); px(g, 14, 21, '#7af6ff', 2, 2);
      px(g, 4, 26, '#1a1824', 16, 1);
      return { canvas: c, body: { w: 18, h: 8 } };
    }
    case 'neonfence': {
      const W = Math.max(2, w || 2) * T;
      const { c, g } = cv(W, 24);
      for (let x = 2; x < W; x += 14) px(g, x, 2, '#2a2632', 3, 20);
      for (let x = 0; x < W; x += 3) for (let y = 4; y < 16; y += 3) px(g, x + ((y / 3) % 2), y, '#3a3444');
      px(g, 0, 3, '#4a4458', W, 2);
      neonLine(g, 0, 18, W, 2, '#ff2a3a', '#ff2a3a55');
      return { canvas: c, body: { w: W, h: 6 } };
    }
    case 'wsign': {
      const { c, g } = cv(28, 30);
      px(g, 12, 20, '#1c1824', 3, 10);
      rect(g, 1, 1, 26, 22, '#0a1c24', O);
      neonLine(g, 3, 3, 22, 1, '#2bf2ff', '#2bf2ff44');
      for (let i = 0; i < 12; i++) { px(g, 7 + i, 6 + i, '#7af6ff', 2, 2); px(g, 19 - i, 6 + i, '#7af6ff', 2, 2); }
      px(g, 5, 4, '#7af6ff', 4, 4); px(g, 19, 15, '#7af6ff', 4, 4);
      return { canvas: c, body: { w: 6, h: 4 } };
    }
    case 'stairsup': {
      const { c, g } = cv(36, 52);
      for (let s = 0; s < 9; s++) {
        const y = 48 - s * 5;
        rect(g, 4, y - 4, 28, 6, s % 2 ? '#2e2a38' : '#36323f', O);
        px(g, 5, y - 4, '#4a4458', 26, 1);
      }
      neonLine(g, 2, 6, 2, 44, '#ff2bd6', '#ff2bd655');
      neonLine(g, 32, 6, 2, 44, '#ff2bd6', '#ff2bd655');
      return { canvas: c, body: { w: 32, h: 40, oy: 4 } };
    }
    case 'lantern': {
      const { c, g } = cv(10, 16);
      px(g, 4, 0, '#2a1a10', 2, 4);
      rect(g, 1, 4, 8, 10, '#ffb02a', '#5a3a1a');
      px(g, 3, 6, '#fff0a0', 4, 6);
      return { canvas: c };
    }
    case 'tarp': {
      // barraca do mercado: toldo rasgado, balcão com mercadorias e luzinhas
      const W = 70, H = 56;
      const { c, g } = cv(W, H);
      const pal = [
        { cloth: '#7a1424', cloth2: '#a01e2e', lit: '#ffb02a', lit2: '#fff0a0' },
        { cloth: '#3a2a52', cloth2: '#4a3a66', lit: '#2bf2ff', lit2: '#bff8ff' },
        { cloth: '#4a4250', cloth2: '#5a5262', lit: '#2bf2ff', lit2: '#bff8ff' },
      ][v % 3];
      shadow(g, W / 2, H - 3, W / 2 - 4, 3);
      px(g, 4, 14, '#3a2414', 3, 40); px(g, W - 7, 14, '#3a2414', 3, 40);
      // balcão
      rect(g, 6, 34, W - 12, 18, '#5a3a20', O);
      px(g, 7, 35, '#7a5230', W - 14, 2);
      for (let x = 9; x < W - 12; x += 6) rect(g, x, 28 + (x % 12 ? 0 : 2), 5, 7, ['#c87a2a', '#3a8a5a', '#8a2a1a', '#d8b870', '#4a6a9a'][(x / 6) % 5 | 0], O);
      // caixotes na frente
      rect(g, 2, 44, 12, 11, '#6a4424', O); px(g, 3, 49, '#4a2e18', 10, 1);
      rect(g, W - 16, 42, 14, 13, '#6a4424', O); px(g, W - 15, 48, '#4a2e18', 12, 1);
      // toldo
      rect(g, 0, 2, W, 16, pal.cloth, O);
      for (let x = 2; x < W - 2; x += 8) px(g, x, 3, pal.cloth2, 4, 14);
      for (let x = 0; x < W; x += 7) { px(g, x, 18, pal.cloth, 5, 3 + (x % 14 ? 2 : 0)); px(g, x + 5, 18, O, 1, 3); } // franja rasgada
      px(g, 1, 2, '#ffffff22', W - 2, 1);
      // luzinhas
      for (let x = 3; x < W - 2; x += 5) { const y = 22 + Math.round(Math.sin(x / 7) * 2); px(g, x, y, pal.lit); px(g, x, y - 1, pal.lit2 + '88'); }
      // lanternas
      for (const lx of [12, W - 20]) { px(g, lx + 3, 18, '#2a1a10', 1, 6); rect(g, lx, 24, 7, 8, pal.lit, '#3a2414'); px(g, lx + 2, 26, pal.lit2, 3, 4); }
      return { canvas: c, body: { w: W - 8, h: 16 } };
    }
    case 'pipe': {
      const W = Math.max(2, w || 3) * T, H = 18;
      const { c, g } = cv(W, H);
      px(g, 0, 3, O, W, 13);
      px(g, 0, 4, '#2a2238', W, 11);
      px(g, 0, 5, '#3e3452', W, 2);
      px(g, 0, 12, '#1a1424', W, 2);
      for (let x = 8; x < W; x += 28) {
        rect(g, x, 1, 7, 16, '#3a3248', O);
        px(g, x + 1, 2, '#ff2bd6', 1, 14); px(g, x + 5, 2, '#ff2bd6', 1, 14); // anéis de neon
        px(g, x + 2, 2, '#4a4060', 3, 14);
      }
      return { canvas: c, body: { w: W, h: 8 } };
    }
  }
  return null;
}

/** Piso de pedra roxa molhada (tile 16x16). */
export function paintPavers(g: CanvasRenderingContext2D, ox: number, oy: number, v: number, r: () => number) {
  px(g, ox, oy, '#15101e', T, T);
  const off = v % 2 ? 4 : 0;
  for (let y = 0; y < T; y += 8) {
    for (let x = -off; x < T; x += 8) {
      const sx = Math.max(0, x), sw = Math.min(T, x + 8) - sx - 1;
      if (sw <= 0) continue;
      const base = ['#2a2238', '#2e263e', '#261f33', '#30283f'][Math.floor(r() * 4)];
      px(g, ox + sx, oy + y, base, sw, 7);
      px(g, ox + sx, oy + y, '#3a3050', sw, 1); // borda iluminada
    }
  }
  for (let k = 0; k < 6; k++) px(g, ox + r() * 15, oy + r() * 15, r() < 0.5 ? '#3e3456' : '#1e182a');
  // brilho molhado (reflexos de neon)
  if (v === 1) px(g, ox + 3 + r() * 8, oy + 2 + r() * 10, '#a0307a', 2, 1);
  if (v === 2) px(g, ox + 3 + r() * 8, oy + 2 + r() * 10, '#2a7a9a', 2, 1);
  if (v === 3) { let x = 2 + r() * 10; for (let y = 1; y < 15; y++) { if (r() < 0.6) px(g, ox + x, oy + y, '#120d1a'); x += r() < 0.5 ? 1 : -1; } }
}
