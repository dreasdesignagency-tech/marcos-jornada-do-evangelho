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
