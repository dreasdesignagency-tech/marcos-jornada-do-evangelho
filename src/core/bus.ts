// Barramento de eventos entre a interface (React) e o jogo (Phaser).
type Fn = (...a: any[]) => void;
const map = new Map<string, Set<Fn>>();

export const bus = {
  on(ev: string, fn: Fn) {
    if (!map.has(ev)) map.set(ev, new Set());
    map.get(ev)!.add(fn);
    return () => map.get(ev)!.delete(fn);
  },
  emit(ev: string, ...a: any[]) {
    map.get(ev)?.forEach((f) => f(...a));
  },
};

/** Informações do mundo para minimapa e mapa (atualizadas pela cena). */
export const worldInfo = {
  minimap: '' as string,
  w: 1,
  h: 1,
  player: { x: 0, y: 0 },
  objective: null as null | { x: number; y: number },
  npcs: [] as { x: number; y: number; important: boolean }[],
  scrolls: [] as { x: number; y: number }[],
  zones: [] as { x: number; y: number; name: string; found: boolean }[],
};

(window as any).__bus = bus;
