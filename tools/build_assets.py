"""Reproducible, non-generative pixel art. Requires Pillow only to rebuild assets.
The pilot is sampled from the supplied photograph; no facial pixels are painted.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / 'assets/player'
E = ROOT / 'assets/enemies'
source = Image.open(P / 'tangniu_head_original.png').convert('RGBA')
# Original coordinates, hard polygon mask following hair, ears, jaw; neck removed.
mask = Image.new('L', source.size, 0)
ImageDraw.Draw(mask).polygon([(3,30),(9,20),(23,13),(42,10),(54,16),(62,28),
    (64,51),(68,64),(66,82),(60,88),(56,101),(45,112),(30,114),
    (19,107),(11,95),(7,81),(3,74),(2,58)], fill=255)
source.putalpha(mask)
head = source.crop((2,10,69,115)).resize((14,22), Image.Resampling.NEAREST)
head.save(P / 'tangniu_head_pixel.png')

ufo = Image.new('RGBA', (72,48))
d = ImageDraw.Draw(ufo)
def r(box, color): d.rectangle(box, fill=color)
# Low, open cockpit in a wide side-view saucer. Reference composition only;
# the original stepped hull, cockpit, panels and engine are drawn here.
d.polygon([(6,30),(17,25),(55,24),(69,31),(64,38),(50,42),(16,42),(3,36)],fill='#252a32')
d.polygon([(8,30),(20,27),(55,27),(66,31),(57,36),(15,36),(5,33)],fill='#adb3ad')
r((17,37,54,40),'#6e7883');r((22,40,48,43),'#303744')
# Squat brass-colored cockpit tub behind the pilot, no tall glass dome.
d.polygon([(23,22),(51,17),(56,20),(55,31),(25,34)],fill='#65503a')
d.polygon([(26,22),(50,19),(53,21),(51,28),(27,31)],fill='#af9062')
r((28,25,47,29),'#202731');r((43,21,49,23),'#d0b78b')
ufo.alpha_composite(head,(30,10))
# Low front rim sits below the smile; the exact photo is not painted over.
d.polygon([(19,31),(49,30),(55,28),(54,33),(24,36),(18,34)],fill='#baa985')
r((22,33,44,34),'#554b3b')
# Rear engine, belly pod, and right-facing nose.
r((9,32,19,37),'#404853');r((10,31,15,32),'#aeb5b4')
r((5,33,10,36),'#e77428');r((4,34,8,35),'#ffeeb0')
r((24,38,33,44),'#1b2633');r((25,38,32,41),'#adb4b2');r((27,39,28,43),'#565c64')
r((58,32,67,34),'#d5d8ca');r((61,35,65,36),'#596978')
for x in [18,40,53]:
    r((x,36,x+3,38),'#732f24');r((x,36,x+1,36),'#ffbe76')
ufo.save(P/'tangniu_ufo.png')

def cow(kind):
    im=Image.new('RGBA',(40,40)); q=ImageDraw.Draw(im)
    def b(x,y,w,h,c):q.rectangle((x,y,x+w-1,y+h-1),fill=c)
    # Same deliberately square, uneven, sullen orange cow in all four variants.
    b(8,9,25,24,'#71420d');b(6,11,27,21,'#d77a08');b(9,8,21,23,'#eca017')
    b(8,11,6,6,'#ffb328');b(26,24,7,9,'#b5630d');b(8,4,4,7,'#ad8750')
    b(8,2,3,6,'#e0c18b');b(28,2,3,8,'#dbc18c');b(29,5,4,5,'#ad8750')
    b(3,10,6,4,'#ae4914');b(31,11,6,4,'#a94312');b(5,10,4,2,'#ef8220')
    b(9,18,6,5,'#eee3bd');b(24,18,5,5,'#eee3bd');b(10,19,2,4,'#282416');b(25,20,2,3,'#282416')
    b(6,25,18,8,'#bb7a51');b(5,25,18,6,'#f0c394');b(8,27,3,3,'#a2533d');b(17,27,3,2,'#a2533d')
    b(10,32,5,5,'#71420d');b(26,32,5,4,'#71420d');b(10,35,5,3,'#302f27');b(27,34,5,3,'#302f27')
    b(19,11,4,3,'#f6ae23');b(29,16,3,4,'#be7511');b(18,24,3,1,'#d38717')
    if kind in ('fast','tank','boss'):
        b(33,17,5,12,'#434654');b(34,18,3,3,'#a7a6a0');b(34,24,2,3,'#f74325')
    if kind=='fast':
        b(37,22,3,5,'#e04d0e');b(38,23,2,3,'#ffc844')
    if kind in ('tank','boss'):
        b(0,22,8,6,'#3c4050');b(0,23,8,2,'#999f9e');b(6,20,3,9,'#656978')
    if kind=='boss':
        b(33,20,7,8,'#5c6274');b(34,22,6,2,'#b4bbc3');b(34,26,4,2,'#e94123')
    return im
for kind in ['basic','fast','tank','boss']:
    im=cow(kind)
    if kind=='boss': im=im.resize((80,80),Image.Resampling.NEAREST)
    im.save(E/f'niulai_{kind}.png')

if __name__=='__main__': print('Assets rebuilt from unchanged source photograph and pixel rectangles.')
