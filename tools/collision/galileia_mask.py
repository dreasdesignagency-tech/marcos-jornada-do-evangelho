# Gera a máscara fina (16 px) de colisão da Galileia e imagens de conferência.
import re, json, sys, numpy as np
from PIL import Image, ImageDraw
S = sys.argv[1]
img = Image.open('public/assets/maps/galileia.webp').convert('RGB')
a = np.asarray(img).astype(int)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
mx = a.max(-1); mn = a.min(-1); lum = (R * 3 + G * 6 + B) / 10
sat = (mx - mn) / np.maximum(mx, 1)
water = ((B > R + 55) & (B >= G - 25) & (B > 110)) | ((B > 200) & (G > 185) & (B > R + 35))
grey = (sat < 0.2) & (lum > 45) & (lum < 215) & ~water
dgreen = (G > R + 12) & (G >= B) & (lum < 115)
C = 16; W, H = 96, 64
def frac(m):
    return m.reshape(H, C, W, C).mean(axis=(1, 3))
fw, fg, fd = frac(water), frac(grey), frac(dgreen)

src = open('src/game/maps/galileia.ts').read()
old = re.findall(r"'([#.~]{48})'", src)
M = np.full((H, W), '.', dtype='<U1')
for y in range(H):
    for x in range(W):
        M[y, x] = old[y // 2][x // 2]

def cells(fn, ch='#'):
    for y in range(H):
        for x in range(W):
            if M[y, x] != '~' and fn(x * C + 8, y * C + 8): M[y, x] = ch

anim = open('src/game/gfx/galileiaAnim.ts').read()
def arr(name):
    m = re.search(name + r' = \[(.*?)\];', anim, re.S).group(1)
    return [tuple(map(int, t)) for t in re.findall(r'\[(\d+), (\d+), (\d+)\]', m)]
TREES, PALMS, BUSHES = arr('TREES'), arr('PALMS'), arr('BUSHES')
for cx, cy, r in TREES:
    cells(lambda px, py: ((px - cx) / (r * 1.0)) ** 2 + ((py - cy) / (r * 0.9)) ** 2 < 1)
    cells(lambda px, py: abs(px - cx) < max(14, r * 0.25) and cy < py < cy + r * 1.15)
for cx, cy, r in PALMS:
    cells(lambda px, py: ((px - cx) / (r * 0.95)) ** 2 + ((py - cy) / (r * 0.7)) ** 2 < 1)
    cells(lambda px, py: abs(px - cx) < 14 and cy < py < cy + r * 2.55)
for cx, cy, r in BUSHES:
    cells(lambda px, py: ((px - cx) / (r * 0.9)) ** 2 + ((py - cy) / (r * 0.8)) ** 2 < 1)

# construções (retângulos em pixels da imagem): paredes, telhados, sacadas, barracas, poço, caixotes
BUILD = [
    (1200, 330, 1445, 560),   # sinagoga
    (700, 380, 980, 560),     # casa grande (sacada com pano vermelho)
    (900, 385, 1065, 475),    # casa do lado direito (andar de cima)
    (978, 470, 1060, 555),    # escada externa (topo) - bloqueada, base fica livre
    (1060, 470, 1180, 565),   # barraca azul e branca
    (918, 540, 1018, 628),    # barraca azul e laranja
    (625, 570, 790, 685),     # casa com toldo vermelho
    (505, 665, 682, 795),     # casa da esquerda
    (650, 725, 815, 848),     # casa de baixo
    (1398, 345, 1536, 465),   # casas à direita (topo)
    (1405, 515, 1536, 625),
    (1348, 595, 1515, 752),   # casa com toldo laranja
    (1075, 605, 1168, 692),   # poço
    (1222, 688, 1302, 748),   # rede de pesca
    (872, 752, 918, 795), (792, 798, 834, 842), (1478, 698, 1532, 748), (1385, 690, 1420, 720),  # caixotes e barris
    (1070, 535, 1190, 570),   # mercadorias da barraca azul
]
for x0, y0, x1, y1 in BUILD:
    cells(lambda px, py: x0 <= px < x1 and y0 <= py < y1)

# pedras e moitas detectadas por cor
for y in range(H):
    for x in range(W):
        if M[y, x] == '.' and fw[y, x] < 0.3 and fg[y, x] > 0.5: M[y, x] = '#'

# corredores mínimos: se um ponto de missão ficou isolado, abre o caminho mais curto pelos bloqueios novos
import heapq
base = np.full((H, W), '.', dtype='<U1')
for y in range(H):
    for x in range(W):
        base[y, x] = old[y // 2][x // 2]
pts_all = json.load(open(f'{S}/points.json'))
def cost(x, y):
    if M[y, x] == '.': return 1
    if M[y, x] == '#' and base[y, x] == '.': return 40
    return None
def dijkstra(sx, sy):
    dist = {(sx, sy): 0}; prev = {}; pq = [(0, sx, sy)]
    while pq:
        d0, x, y = heapq.heappop(pq)
        if d0 > dist[(x, y)]: continue
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if not (0 <= nx < W and 0 <= ny < H): continue
            c = cost(nx, ny)
            if c is None: continue
            nd = d0 + c
            if nd < dist.get((nx, ny), 1e18):
                dist[(nx, ny)] = nd; prev[(nx, ny)] = (x, y); heapq.heappush(pq, (nd, nx, ny))
    return dist, prev
opened = 0
for ch in sorted({p['ch'] for p in pts_all}):
    ps = [p for p in pts_all if p['ch'] == ch]
    sp = next(p for p in ps if p['name'] == 'spawn')
    sx, sy = int(sp['p'][0]*2+1), int(sp['p'][1]*2+1)
    if M[sy, sx] == '#' and base[sy, sx] == '.': M[sy, sx] = '.'
    for p in ps:
        tx, ty = int(p['p'][0]*2+1), int(p['p'][1]*2+1)
        dist, prev = dijkstra(sx, sy)
        # alvo: a célula livre mais barata em volta do ponto
        cands = [(dist[(tx+dx, ty+dy)], tx+dx, ty+dy) for dx in (-1,0,1) for dy in (-1,0,1) if (tx+dx, ty+dy) in dist]
        if not cands: print('sem caminho possível', ch, p['name']); continue
        _, x, y = min(cands)
        while (x, y) in prev:
            if M[y, x] == '#': M[y, x] = '.'; opened += 1
            x, y = prev[(x, y)]
print('células reabertas para corredores:', opened)

# telhado usado em Marcos 2 (amigos descem o paralítico pelo teto): 'r' = só liberado nesse capítulo
ROOF = (896, 500, 1100, 600)  # região dos telhados planos acessados pela escada
pts = json.load(open(f'{S}/points.json'))
ch2roof = [p for p in pts if p['ch'] == 2 and ('telhado' in p['name'] or 'cordas' in p['name'] or 'cura' in p['name'])]
open(f'{S}/ch2roof.json', 'w').write(json.dumps(ch2roof))
json.dump(M.tolist(), open(f'{S}/mask.json', 'w'))
print('ok', (M == '#').sum(), 'bloqueadas')
