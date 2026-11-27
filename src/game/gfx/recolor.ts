// Recolorização da skin de João Marcos (pixel art 32x48, 4x4 quadros).
// A máscara separa as regiões: 1 cabelo, 2 pele, 3 túnica, 4 manto, 5 couro, 6 pergaminho.
import type { Look } from '../../data/types';

export const FW = 32;
export const FH = 48;

let base: ImageData | null = null;
let mask: ImageData | null = null;
let meanLum: number[] = [];
let loading: Promise<void> | null = null;

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function toData(img: HTMLImageElement) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  return g.getImageData(0, 0, c.width, c.height);
}

const lum = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

export function loadBase() {
  if (!loading) {
    loading = Promise.all([
      loadImg('assets/characters/marcos_base.png'),
      loadImg('assets/characters/marcos_mask.png'),
    ]).then(([b, m]) => {
      base = toData(b);
      mask = toData(m);
      const sum = new Array(7).fill(0);
      const cnt = new Array(7).fill(0);
      for (let i = 0; i < base.data.length; i += 4) {
        if (base.data[i + 3] < 128) continue;
        const L = Math.round(mask.data[i] / 40);
        sum[L] += lum(base.data[i], base.data[i + 1], base.data[i + 2]);
        cnt[L]++;
      }
      meanLum = sum.map((s, i) => (cnt[i] ? s / cnt[i] : 128));
    });
  }
  return loading;
}

function hex(c: string): [number, number, number] {
  const n = parseInt(c.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Gera um canvas 128x192 com a folha de sprites recolorida. */
export function recolor(look: Look): HTMLCanvasElement {
  if (!base || !mask) throw new Error('base não carregada');
  const c = document.createElement('canvas');
  c.width = base.width;
  c.height = base.height;
  const g = c.getContext('2d')!;
  const out = g.createImageData(base.width, base.height);
  const targets: Record<number, [number, number, number] | null> = {
    1: hex(look.veil ?? look.hair),
    2: hex(look.skin),
    3: hex(look.tunic),
    4: hex(look.mantle),
    5: look.leather ? hex(look.leather) : null,
    6: null,
  };
  const hairT = hex(look.hair);
  const W = base.width;
  for (let i = 0; i < base.data.length; i += 4) {
    const r = base.data[i], gg = base.data[i + 1], b = base.data[i + 2], a = base.data[i + 3];
    out.data[i + 3] = a < 128 ? 0 : 255;
    if (a < 128) continue;
    let L = Math.round(mask.data[i] / 40);
    const p = i / 4;
    const x = p % W, y = Math.floor(p / W);
    const fy = y % FH, row = Math.floor(y / FH);
    let t = targets[L];
    // barba: pele na parte de baixo do rosto (vistas de frente e de lado)
    if (look.beard && L === 2 && row < 3 && fy >= 17 && fy <= 21) {
      const fx = x % FW;
      const sideOk = row === 0 || (row === 1 ? fx >= 9 : fx <= 22);
      if (sideOk) {
        t = hairT;
        L = 1;
      }
    }
    if (!t) {
      out.data[i] = r; out.data[i + 1] = gg; out.data[i + 2] = b;
      continue;
    }
    const k = Math.pow(lum(r, gg, b) / (meanLum[L] || 128), 1.05);
    out.data[i] = Math.min(255, t[0] * k);
    out.data[i + 1] = Math.min(255, t[1] * k);
    out.data[i + 2] = Math.min(255, t[2] * k);
  }
  g.putImageData(out, 0, 0);
  return c;
}

/** Retrato (rosto) para caixas de diálogo e HUD. */
export function portrait(look: Look, size = 96): string {
  const sheet = recolor(look);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // rosto: quadro de frente, área superior
  g.drawImage(sheet, 4, 4, 24, 24, 0, 0, size, size);
  return c.toDataURL();
}

const portraitCache = new Map<string, string>();
export function portraitCached(key: string, look: Look, size = 96) {
  const k = key + size + JSON.stringify(look);
  if (!portraitCache.has(k)) portraitCache.set(k, portrait(look, size));
  return portraitCache.get(k)!;
}

export function isBaseLoaded() {
  return !!base;
}
