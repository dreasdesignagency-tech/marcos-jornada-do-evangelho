import json, sys
from collections import deque
S = sys.argv[1]
M = json.load(open(f'{S}/mask.json')); pts = json.load(open(f'{S}/points.json'))
H, W = len(M), len(M[0])
def bfs(start):
    seen = set(); q = deque([start])
    while q:
        x, y = q.popleft()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H) or M[y][x] != '.': continue
        seen.add((x, y)); q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    return seen
bad = []
by = {}
for p in pts:
    by.setdefault(p['ch'], []).append(p)
for ch, ps in by.items():
    sp = next(p for p in ps if p['name'] == 'spawn')
    sx, sy = int(sp['p'][0]*2+1), int(sp['p'][1]*2+1)
    if M[sy][sx] != '.': bad.append((ch, 'SPAWN BLOQUEADO', sp['p']))
    seen = bfs((sx, sy))
    for p in ps:
        cx, cy = p['p'][0]*2+1, p['p'][1]*2+1
        rad = 2 if p['name'].startswith(('npc', 'pergaminho', 'achado', 'passo', 'mensagem', 'portal')) else 1
        ok = any((int(cx)+dx, int(cy)+dy) in seen for dx in range(-rad, rad+1) for dy in range(-rad, rad+1))
        if not ok: bad.append((ch, p['name'], p['p']))
for b in bad: print(*b)
print(len(bad), 'problemas')
