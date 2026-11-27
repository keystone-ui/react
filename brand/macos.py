"""macOS app icon: 1024 canvas, 824 body at a 100 px inset, r 185.4, template shadow."""
from PIL import Image, ImageDraw, ImageFilter
from masters import G32, G16, G8, shade
import os, sys

PALETTES = {
  'blue': dict(bg_top=(30,33,44), bg_bot=(12,13,19), rim=(255,255,255,22),
               stone=(232,236,242), d=(132,142,160), K=(0,114,245), H=(110,178,255), S=(0,72,170)),
  'mono': dict(bg_top=(30,31,36), bg_bot=(10,10,12), rim=(255,255,255,22),
               stone=(206,208,214), d=(110,112,120), K=(250,250,250), H=(255,255,255), S=(170,172,180)),
}

def glyph_for(S):
    # cell size scaled from the 1024 master (18 px cells), floored to an integer.
    if S >= 64:
        return shade(G32), max(1, int(18*S/1024))
    if S >= 32:
        return shade(G16), 1
    return G8, 1

def bbox(g):
    ys=[y for y,r in enumerate(g) if r.strip('.')]
    xs=[x for r in g for x,c in enumerate(r) if c!='.']
    return min(xs),min(ys),max(xs),max(ys)

def render(S, pal):
    p=PALETTES[pal]; SS=4; W=S*SS
    body=824/1024*W; off=(W-body)/2; rad=185.4/1024*W
    # body mask
    mask=Image.new('L',(W,W),0); ImageDraw.Draw(mask).rounded_rectangle([off,off,off+body,off+body],rad,fill=255)
    # gradient fill
    grad=Image.new('RGBA',(W,W))
    gd=ImageDraw.Draw(grad)
    for y in range(W):
        t=min(max((y-off)/body,0),1)
        c=tuple(round(p['bg_top'][i]+(p['bg_bot'][i]-p['bg_top'][i])*t) for i in range(3))
        gd.line([(0,y),(W,y)],fill=c+(255,))
    # drop shadow (Big Sur template: 28px blur, 12px y offset, 50% black at 1024)
    sh=Image.new('RGBA',(W,W),(0,0,0,0))
    shm=Image.new('L',(W,W),0); ImageDraw.Draw(shm).rounded_rectangle([off,off+12/1024*W,off+body,off+body+12/1024*W],rad,fill=128)
    shm=shm.filter(ImageFilter.GaussianBlur(28/1024*W/2))
    sh.putalpha(shm)
    img=Image.new('RGBA',(W,W),(0,0,0,0)); img=Image.alpha_composite(img,sh)
    bodyimg=Image.new('RGBA',(W,W),(0,0,0,0)); bodyimg.paste(grad,(0,0),mask)
    img=Image.alpha_composite(img,bodyimg)
    # inner rim hairline
    if S>=64:
        rim=Image.new('RGBA',(W,W),(0,0,0,0))
        ImageDraw.Draw(rim).rounded_rectangle([off,off,off+body,off+body],rad,outline=p['rim'],width=max(1,round(2/1024*W)))
        img=Image.alpha_composite(img,rim)
    img=img.resize((S,S),Image.LANCZOS)
    # crisp glyph at native resolution
    g,cell=glyph_for(S)
    x0,y0,x1,y1=bbox(g)
    gw,gh=(x1-x0+1)*cell,(y1-y0+1)*cell
    ox=round((S-gw)/2); oy=round((S-gh)/2)
    px=img.load()
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            c=g[y][x]
            if c=='.': continue
            col=p['stone'] if c=='#' else p[c]
            for yy in range(cell):
                for xx in range(cell):
                    px[ox+(x-x0)*cell+xx, oy+(y-y0)*cell+yy]=col+(255,)
    return img

SIZES=[16,32,64,128,256,512,1024]
NAMES={16:['icon_16x16'],32:['icon_16x16@2x','icon_32x32'],64:['icon_32x32@2x'],128:['icon_128x128'],
       256:['icon_128x128@2x','icon_256x256'],512:['icon_256x256@2x','icon_512x512'],1024:['icon_512x512@2x']}
def build(root):
    for pal in PALETTES:
        d=f'{root}/keystone-{pal}'; iset=f'{d}/Keystone.iconset'; os.makedirs(iset,exist_ok=True)
        for S in SIZES:
            im=render(S,pal); im.save(f'{d}/keystone-{pal}-{S}.png')
            for n in NAMES[S]: im.save(f'{iset}/{n}.png')
        if os.system(f'iconutil -c icns "{iset}" -o "{d}/Keystone.icns"'):
            print('iconutil unavailable (macOS only): skipped .icns')
