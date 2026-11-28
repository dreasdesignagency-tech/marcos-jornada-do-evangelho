import { useEffect, useRef, useState } from 'react';
import { store, useStore } from '../../core/store';
import { sfx } from '../../audio/audio';
import { Portrait, speaker } from '../common';

export default function Dialogue() {
  const s = useStore();
  const d = s.ui.dialog;
  const line = d ? d.lines[d.index] : null;
  const [shown, setShown] = useState(0);
  const [reply, setReply] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<number>(0);
  const name = store.save?.player.name ?? 'Elias';
  const full = (reply ? reply.text : line?.text ?? '').replace(/\{nome\}/g, name);

  useEffect(() => {
    setShown(0);
  }, [d?.index, d?.lines, reply]);

  useEffect(() => {
    if (!line) return;
    const speed = store.save?.settings.textSpeed ?? 1;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setShown((n) => {
        if (n >= full.length) { window.clearInterval(timer.current); return n; }
        if (n % 3 === 0) sfx('blip');
        return Math.min(full.length, n + Math.max(1, Math.round(speed)));
      });
    }, speed >= 10 ? 1 : 28 / Math.min(speed, 2));
    return () => window.clearInterval(timer.current);
  }, [full, line]);

  const advance = () => {
    if (!d || !line) return;
    if (shown < full.length) { setShown(full.length); return; }
    if (line.choices && !reply) return; // precisa escolher
    if (reply) {
      const ok = reply.ok;
      setReply(null);
      if (!ok) return; // volta a mostrar as escolhas
    }
    const next = d.index + 1;
    if (next >= d.lines.length) {
      const r = d.resolve;
      store.setUi({ dialog: null });
      r(true);
    } else {
      store.setUi({ dialog: { ...d, index: next } });
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!store.ui.dialog) return;
      if (e.code === 'Space' || e.key === 'Enter' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  });

  if (!d || !line) return null;
  const who = speaker(line.who, s.ui.chapter);
  const isQuote = !!line.ref && !reply;
  const isNarr = !line.who || line.who === 'narrador';
  const isSys = line.who === 'sistema' || line.who === 'eden';
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center p-2 sm:p-4" onClick={advance}>
      <div className="parch relative flex w-full max-w-3xl gap-3 p-3 sm:p-4 fade-in">
        {who.look ? (
          <Portrait look={who.look} size={72} id={line.who ?? 'n'} className="hidden shrink-0 sm:block" />
        ) : (
          <div className={`hidden h-[72px] w-[72px] shrink-0 items-center justify-center rounded-sm border-2 border-[#2a1a10] text-3xl sm:flex ${isSys ? (line.who === 'eden' ? 'bg-[#2a0a12]' : 'bg-[#0e2a34]') : 'bg-[#7a5230]'}`}>
            {line.who === 'eden' ? '👁' : isSys ? '◈' : '📜'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="title rounded bg-[#5a3a1e] px-2 py-0.5 text-sm font-bold text-[#fbe9c4]">{who.name}</span>
            {isQuote && <span className="ref">✦ {line.ref}</span>}
          </div>
          <p
            className={`min-h-[3.2rem] leading-snug ${isSys ? 'sys-line keep-color' : 'text-[17px] sm:text-lg'} ${isQuote ? 'font-semibold' : ''} ${isNarr && !isQuote ? 'italic' : ''}`}
            style={isSys ? { color: line.who === 'eden' ? '#e0304a' : '#1ba6b8' } : undefined}
          >
            {isQuote ? '“' : ''}{full.slice(0, shown)}{isQuote && shown >= full.length ? '”' : ''}
          </p>
          {line.choices && !reply && shown >= full.length && (
            <div className="mt-2 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
              {line.choices.map((c, i) => (
                <button
                  key={i}
                  className="btn text-left text-sm"
                  onClick={() => { sfx(c.ok ? 'quest' : 'error'); setReply({ text: c.reply, ok: c.ok }); }}
                >
                  {String.fromCharCode(65 + i)}) {c.text}
                </button>
              ))}
            </div>
          )}
          {reply && <p className={`mt-1 text-xs font-bold ${reply.ok ? 'text-[#2f6e22]' : 'text-[#8a2a1a]'}`}>{reply.ok ? '✔ Correto' : '✘ Tente novamente'}</p>}
          {(!line.choices || reply) && shown >= full.length && (
            <span className="pixel absolute bottom-2 right-3 animate-bounce text-[9px]">▼ toque</span>
          )}
        </div>
      </div>
    </div>
  );
}
