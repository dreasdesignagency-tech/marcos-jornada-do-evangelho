// Piloto automático de testes (uso: no console, await __runAll(1, 16))
window.__runChapter = async function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sc = window.__game.scene.getScene('world');
  const def = sc.def;
  const log = [];
  const waitIdle = async (t = 20000) => { const t0 = Date.now(); while ((sc.busy || __store.blocking) && Date.now() - t0 < t) await sleep(60); };
  await sleep(500);
  await waitIdle();
  for (let guard = 0; guard < 30; guard++) {
    const s = sc.currentStep();
    if (!s) break;
    await waitIdle();
    try {
      if (s.npc && (s.kind === 'talk' || s.kind === 'challenge')) {
        const a = sc.npcs.get(s.npc);
        if (!a) { log.push('NPC ausente ' + s.npc); break; }
        if (a.hidden) { log.push(`npc ${s.npc} oculto no passo ${s.id}`); a.setVisible(true); }
        sc.player.teleport(a.x + 30, a.y + 10);
        await sleep(100);
        await sc.talkTo(def.npcs.find((n) => n.id === s.npc), a);
      } else if (s.at && s.kind !== 'challenge') {
        const p = sc.w(s.at);
        sc.player.teleport(p.x, p.y);
      } else if (s.kind === 'challenge') {
        if (s.at) { const p = sc.w(s.at); sc.player.teleport(p.x, p.y); }
        await sleep(400);
      }
      await sleep(400);
      await waitIdle();
      if (sc.ch && sc.ch.step === s) {
        const t = sc.ch.def.type;
        if (t === 'collect') {
          for (const it of sc.ch.data.items) { sc.player.teleport(it.x, it.y + 10); await sleep(120); if (!sc.ch) break; }
        } else if (t === 'hotcold') {
          const a = sc.npcs.get(sc.ch.def.npc); sc.player.teleport(a.x + 30, a.y); await sc.talkTo(def.npcs.find((n) => n.id === sc.ch.def.npc), a);
        } else if (t === 'trial') {
          for (const id of sc.ch.def.npcs) { const a = sc.npcs.get(id); sc.player.teleport(a.x + 30, a.y); await sc.talkTo(def.npcs.find((n) => n.id === id), a); await waitIdle(); }
        } else await sc.finishChallenge(true);
      }
      const t0 = Date.now();
      while (!__store.progress(def.n).steps.includes(s.id) && Date.now() - t0 < 25000) await sleep(100);
      if (!__store.progress(def.n).steps.includes(s.id)) { log.push('TRAVOU em ' + s.id); break; }
      log.push('ok ' + s.id);
    } catch (e) { log.push('ERRO ' + s.id + ': ' + e.message); break; }
  }
  await waitIdle();
  // pergaminhos e NPCs
  for (const sc2 of def.scrolls) { const p = sc.w(sc2.at); sc.player.teleport(p.x, p.y); await sleep(150); const it = sc.nearest; if (it) { await it.act(); await waitIdle(); } else log.push('pergaminho inacessível ' + sc2.id); }
  for (const n of def.npcs) { const a = sc.npcs.get(n.id); if (a && !a.hidden && (n.lines?.length)) { sc.player.teleport(a.x + 30, a.y); await sc.talkTo(n, a); await waitIdle(); } }
  return log;
};
window.__finishChapter = function (n) {
  const p = __store.progress(n);
  p.messageRead = true; p.quiz = { done: true, points: 200, firstTry: 3 }; p.completed = true;
  __store.save.unlocked = Math.max(__store.save.unlocked, Math.min(16, n + 1));
  __store.persist();
};

// Piloto automático da campanha (prólogo → Marcos 1 → caverna → carta).
// Uso no console: await __runStory()  — avança diálogos/alertas sozinho.
window.__autoUi = function (on = true) {
  clearInterval(window.__autoUiT);
  if (!on) return;
  window.__autoUiT = setInterval(() => {
    const u = __store.ui;
    if (u.dialog) { const d = u.dialog; const l = d.lines[d.index]; if (l.choices) { const ok = l.choices.find((c) => c.ok); } __store.setUi({ dialog: null }); d.resolve(true); }
    else if (u.alert) { const a = u.alert; __store.setUi({ alert: null }); a.resolve(); }
    else if (u.cinematic) window.__closeCine?.();
  }, 80);
};
window.__runSegment = async function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sc = window.__game.scene.getScene('world');
  const def = sc.def;
  const log = [def.n + ' ' + def.title];
  const waitIdle = async (t = 20000) => { const t0 = Date.now(); while ((sc.busy || (__store.blocking && !__store.ui.neural && !__store.ui.letter)) && Date.now() - t0 < t) await sleep(60); };
  await sleep(600);
  await waitIdle();
  for (let guard = 0; guard < 30; guard++) {
    const s = sc.currentStep();
    if (!s) break;
    await waitIdle();
    try {
      if (s.kind === 'use') {
        const p = sc.w(s.at); sc.player.teleport(p.x, p.y + 20); await sleep(250);
        const it = sc.interactables.find((i) => i.enabled && i.enabled() && Math.hypot(i.x - p.x, i.y - p.y) < 2);
        if (!it) { log.push('sem interação para ' + s.id); break; }
        await it.act();
      } else if (s.npc && (s.kind === 'talk' || s.kind === 'challenge')) {
        const a = sc.npcs.get(s.npc);
        if (a.hidden) { log.push(`npc ${s.npc} oculto em ${s.id}`); a.setVisible(true); }
        sc.player.teleport(a.x + 30, a.y + 10); await sleep(100);
        await sc.talkTo(def.npcs.find((n) => n.id === s.npc), a);
      } else if (s.at) {
        const p = sc.w(s.at); sc.player.teleport(p.x, p.y); await sleep(500);
      }
      await sleep(400);
      if (sc.ch && sc.ch.step === s) {
        const t = sc.ch.def.type;
        if (t === 'collect') { for (const it of sc.ch.data.items) { sc.player.teleport(it.x, it.y + 10); await sleep(150); if (!sc.ch) break; } }
        else if (t === 'stealth') { const g = sc.w(sc.ch.def.goal); await sleep(1500); sc.player.teleport(g.x, g.y); }
        else if (t === 'follow') { const t0 = Date.now(); while (sc.ch && Date.now() - t0 < 30000) { const a = sc.npcs.get(sc.ch.def.npc); sc.player.teleport(a.x + 20, a.y + 20); await sleep(200); } }
        else await sc.finishChallenge(true);
      }
      const t0 = Date.now();
      while (!__store.progress(def.n).steps.includes(s.id) && Date.now() - t0 < 25000) await sleep(100);
      if (!__store.progress(def.n).steps.includes(s.id)) { log.push('TRAVOU em ' + s.id); break; }
      log.push('ok ' + s.id);
    } catch (e) { log.push('ERRO ' + s.id + ': ' + e.message); break; }
  }
  return log;
};

// Confere, com as colisões reais do Phaser, se todos os pontos do capítulo são alcançáveis.
window.__checkReach = function () {
  const sc = window.__game.scene.getScene('world');
  const def = sc.def;
  const G = 4, PW = 14, PH = 8; // grade de 4 px; corpo do jogador 14x8
  const W = Math.ceil(sc.worldW / G), H = Math.ceil(sc.worldH / G);
  // raster dos bloqueios (zonas de colisão + tiles sólidos)
  const blk = new Uint8Array(W * H);
  for (const z of sc.walls.getChildren()) {
    const x0 = Math.floor((z.x - z.width / 2) / G), x1 = Math.ceil((z.x + z.width / 2) / G), y0 = Math.floor((z.y - z.height / 2) / G), y1 = Math.ceil((z.y + z.height / 2) / G);
    for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) blk[y * W + x] = 1;
  }
  if (sc.layer) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const t = sc.layer.getTileAtWorldXY(x * G + 2, y * G + 2); if (t && t.collides) blk[y * W + x] = 1; }
  const bw = Math.ceil(PW / G / 2), bh = Math.ceil(PH / G);
  const ok = new Uint8Array(W * H);
  for (let y = bh; y < H; y++) for (let x = bw; x < W - bw; x++) {
    let f = 1;
    for (let yy = y - bh + 1; yy <= y && f; yy++) for (let xx = x - bw; xx < x + bw; xx++) if (blk[yy * W + xx]) { f = 0; break; }
    ok[y * W + x] = f;
  }
  const sp = sc.w(def.spawn);
  let sx = Math.floor(sp.x / G), sy = Math.floor(sp.y / G);
  const seen = new Uint8Array(W * H);
  const q = [[sx, sy]];
  if (!ok[sy * W + sx]) { // spawn: procura a célula livre mais próxima
    outer: for (let r = 1; r < 16; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (ok[(sy + dy) * W + sx + dx]) { q[0] = [sx + dx, sy + dy]; break outer; }
  }
  while (q.length) {
    const [x, y] = q.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const i = y * W + x;
    if (seen[i] || !ok[i]) continue;
    seen[i] = 1;
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const pts = [];
  const add = (n, p, rad = 46) => p && pts.push([n, p, rad]);
  def.npcs.forEach((n) => add('npc ' + n.id, n.at));
  def.scrolls.forEach((s) => add('pergaminho ' + s.id, s.at));
  def.side.forEach((s) => add('achado ' + s.id, s.findAt));
  if (def.messageAt) add('mensagem', def.messageAt, 48);
  (def.story?.props ?? []).forEach((p) => add('objeto ' + p.label, p.at, 48));
  def.steps.forEach((s) => {
    if (s.at) add('passo ' + s.id, s.at, s.kind === 'use' ? 52 : (s.r ?? 1.4) * sc.cellW);
    const c = s.challenge;
    if (!c) return;
    (c.at ?? []).forEach((p, i) => Array.isArray(p) && add(`${s.id} item${i}`, p, 30));
    (c.targets ?? []).forEach((p, i) => add(`${s.id} alvo${i}`, p, 40));
    (c.plots ?? []).forEach((p, i) => add(`${s.id} canteiro${i}`, p.at, 40));
    if (c.source) add(`${s.id} origem`, c.source, 40);
    if (c.goal) add(`${s.id} chegada`, c.goal, 1.6 * sc.cellW);
  });
  const bad = [];
  for (const [n, p, rad] of pts) {
    const wp = sc.w(p);
    let hit = false;
    const R = Math.ceil(rad / G);
    for (let dy = -R; dy <= R && !hit; dy++) for (let dx = -R; dx <= R && !hit; dx++) {
      const x = Math.floor(wp.x / G) + dx, y = Math.floor(wp.y / G) + dy;
      if (x < 0 || y < 0 || x >= W || y >= H || !seen[y * W + x]) continue;
      if (Math.hypot(x * G + G / 2 - wp.x, y * G + G / 2 - wp.y) <= rad) hit = true;
    }
    if (!hit) bad.push(`${n}@${p.join(',')}`);
  }
  return { ch: def.n, pontos: pts.length, problemas: bad };
};
