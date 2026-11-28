import json, sys
from collections import deque
from PIL import Image, ImageDraw
S = sys.argv[1]
M = json.load(open(f'{S}/mask.json')); pts = json.load(open(f'{S}/points.json'))
H, W = len(M), len(M[0])
sp = next(p for p in pts if p['ch'] == 1 and p['name'] == 'spawn')
seen = set(); q = deque([(int(sp['p'][0]*2+1), int(sp['p'][1]*2+1))])
while q:
    x, y = q.popleft()
    if (x, y) in seen or not (0 <= x < W and 0 <= y < H) or M[y][x] != '.': continue
    seen.add((x, y)); q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
im = Image.open('public/assets/maps/galileia.webp').convert('RGBA')
ov = Image.new('RGBA', im.size, (0,0,0,0)); d = ImageDraw.Draw(ov)
for y in range(H):
    for x in range(W):
        if M[y][x] == '#': d.rectangle([x*16,y*16,x*16+15,y*16+15], fill=(255,0,60,90))
        elif (x,y) in seen: d.rectangle([x*16,y*16,x*16+15,y*16+15], fill=(0,255,80,70))
for p in pts:
    x, y = (p['p'][0]+.5)*32, (p['p'][1]+.5)*32
    d.ellipse([x-6,y-6,x+6,y+6], fill=(0,255,255,255), outline=(0,0,0,255))
out = Image.alpha_composite(im, ov).convert('RGB')
d2 = ImageDraw.Draw(out)
for x in range(0, 1536, 64): d2.text((x+2, 2), str(x//32), fill=(255,255,0))
for y in range(0, 1024, 64): d2.text((2, y+2), str(y//32), fill=(255,255,0))
out.resize((1152, 768), Image.NEAREST).save(f'{S}/reach.png')
print(len(seen), 'células alcançáveis; spawn', sp['p'])
