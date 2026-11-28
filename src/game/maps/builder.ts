// Constrói mapas procedurais (tilemap + objetos) a partir das "features"
// descritas nos arquivos de dados dos capítulos.
import type { ProcMapDef, TileName, ObjName } from '../../data/types';
import { rng } from '../gfx/procgen';

export interface PlacedObj { o: ObjName; x: number; y: number; w?: number; h?: number; v: number; solid: boolean }
export interface BuiltMap { w: number; h: number; grid: TileName[][]; objects: PlacedObj[] }

const NON_SOLID: ObjName[] = ['flower', 'reeds', 'stairs', 'basket', 'cityview', 'cables', 'hatch', 'banner', 'backpack', 'emblem', 'lantern'];

export function buildMap(def: ProcMapDef, keep: [number, number][] = []): BuiltMap {
  const { w, h } = def;
  const r = rng(def.seed);
  const grid: TileName[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => def.base));
  const objects: PlacedObj[] = [];
  const occ = new Set<string>();
  const set = (x: number, y: number, t: TileName) => {
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = t;
  };
  const mark = (x: number, y: number, ww: number, hh: number) => {
    for (let yy = y; yy < y + hh; yy++) for (let xx = x; xx < x + ww; xx++) occ.add(xx + ',' + yy);
  };
  const free = (x: number, y: number, ww: number, hh: number) => {
    for (let yy = y; yy < y + hh; yy++) for (let xx = x; xx < x + ww; xx++) if (occ.has(xx + ',' + yy)) return false;
    return true;
  };

  // pontos importantes (NPCs, missões) ficam livres de construções
  for (const [kx, ky] of keep) mark(Math.round(kx) - 1, Math.round(ky) - 1, 3, 3);
  // ordem de construção: terreno → objetos fixos → vilas → espalhados
  const phase = (f: ProcMapDef['features'][number]) => (f.f === 'obj' ? 1 : f.f === 'village' ? 2 : f.f === 'scatter' ? 3 : 0);
  const ordered = def.features.map((f, i) => ({ f, i })).sort((a, b) => phase(a.f) - phase(b.f) || a.i - b.i).map((x) => x.f);
  for (const f of ordered) {
    switch (f.f) {
      case 'rect':
        for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) set(x, y, f.tile);
        break;
      case 'blob': {
        const rough = f.rough ?? 0.25;
        for (let y = -f.r - 2; y <= f.r + 2; y++)
          for (let x = -f.r - 2; x <= f.r + 2; x++) {
            const d = Math.sqrt(x * x + y * y) / f.r;
            const n = Math.sin(x * 0.9 + f.x) * Math.cos(y * 0.7 + f.y) * rough;
            if (d < 1 + n) set(f.x + x, f.y + y, f.tile);
          }
        break;
      }
      case 'path': {
        for (let i = 0; i < f.pts.length - 1; i++) {
          const [x0, y0] = f.pts[i];
          const [x1, y1] = f.pts[i + 1];
          const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
            const half = f.w / 2;
            for (let yy = Math.floor(cy - half); yy <= Math.ceil(cy + half - 1); yy++)
              for (let xx = Math.floor(cx - half); xx <= Math.ceil(cx + half - 1); xx++) set(xx, yy, f.tile);
          }
        }
        break;
      }
      case 'obj': {
        const solid = f.solid ?? !NON_SOLID.includes(f.o);
        objects.push({ o: f.o, x: f.x, y: f.y, w: f.w, h: f.h, v: f.v ?? Math.floor(r() * 5), solid });
        const fw = f.w ?? 2, fh = f.h ?? 2;
        mark(f.x - Math.floor(fw / 2) - 1, f.y - fh, fw + 2, fh + 2);
        break;
      }
      case 'village': {
        let placed = 0, tries = 0;
        while (placed < f.n && tries < 400) {
          tries++;
          const hw = 5 + Math.floor(r() * 4), hh = 4 + Math.floor(r() * 2);
          const x = f.x + Math.floor(r() * Math.max(1, f.w - hw));
          const y = f.y + hh + Math.floor(r() * Math.max(1, f.h - hh));
          if (!free(x - 1, y - hh - 1, hw + 2, hh + 3)) continue;
          objects.push({ o: 'house', x: x + Math.floor(hw / 2), y, w: hw, h: hh, v: Math.floor(r() * 6), solid: true });
          mark(x - 1, y - hh - 1, hw + 2, hh + 3);
          for (let xx = x; xx < x + hw; xx++) set(xx, y, 'stone');
          placed++;
        }
        break;
      }
      case 'scatter': {
        let placed = 0, tries = 0;
        while (placed < f.n && tries < f.n * 20) {
          tries++;
          const x = f.x + Math.floor(r() * f.w), y = f.y + Math.floor(r() * f.h);
          if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
          const t = grid[y][x];
          if (f.on && !f.on.includes(t)) continue;
          if (['water', 'deep', 'cliff', 'wall', 'cwall', 'cavewall'].includes(t)) continue;
          const big = ['tree', 'olive', 'palm', 'fig', 'bigrock', 'mustard', 'container', 'wreck', 'tarp', 'scrap'].includes(f.o);
          const fw = big ? 3 : 1, fh = big ? 2 : 1;
          if (!free(x - 1, y - fh, fw + 1, fh + 1)) continue;
          mark(x - 1, y - fh, fw + 1, fh + 1);
          objects.push({ o: f.o, x, y, v: Math.floor(r() * 5), solid: !NON_SOLID.includes(f.o) });
          placed++;
        }
        break;
      }
    }
  }
  return { w, h, grid, objects };
}

/** Marca áreas que devem ficar livres (para NPCs, caminhos etc.) — remove objetos próximos. */
export function clearAround(m: BuiltMap, pts: [number, number][], rad = 1.6) {
  m.objects = m.objects.filter((o) => {
    if (o.o === 'house' || o.o === 'temple' || o.o === 'cityview' || o.o === 'gate' || o.o === 'tomb') return true;
    return !pts.some(([x, y]) => Math.abs(o.x - x) < rad + 0.5 && Math.abs(o.y - y) < rad + 0.5);
  });
}
