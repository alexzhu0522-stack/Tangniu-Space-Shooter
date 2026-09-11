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
    im=Image.new('RGBA',(40,48)); q=ImageDraw.Draw(im)
    def b(x,y,w,h,c):q.rectangle((x,y,x+w-1,y+h-1),fill=c)
    # Supplied Niu Lai: upright body, big blunt head, bored eyes under heavy
    # eyebrows, prominent fleshy muzzle, gray horns and broad triangular ears.
    # Hard-edged low-resolution translation, deliberately uneven and awkward.
    b(10,30,21,14,'#c77a19');b(12,31,17,10,'#e39b26')
    b(7,31,5,12,'#d58a1c');b(29,31,5,11,'#c17a18')
    b(7,41,5,4,'#c6a38a');b(30,40,4,4,'#b9947e')
    b(12,41,7,7,'#af6415');b(23,41,7,7,'#bd7217')
    b(11,46,8,2,'#5c4833');b(23,46,8,2,'#5c4833')
    q.polygon([(6,13),(10,8),(28,8),(33,12),(33,28),(27,34),(13,33),(7,27)],fill='#bd7417')
    b(9,9,21,19,'#e9a425');b(12,7,15,3,'#f4b532');b(8,13,6,12,'#da911f')
    b(26,12,5,17,'#d58b1a');b(12,10,9,3,'#f0ae2e');b(10,26,8,6,'#c78420')
    q.polygon([(9,12),(4,6),(3,1),(6,2),(8,7),(12,10)],fill='#86887c')
    q.polygon([(28,11),(30,5),(31,0),(34,2),(32,8),(31,12)],fill='#757b70')
    b(4,2,2,4,'#bdba9d');b(31,2,2,3,'#a8ae99')
    q.polygon([(8,14),(1,11),(2,17),(8,20)],fill='#b87427')
    q.polygon([(31,14),(38,11),(37,18),(31,20)],fill='#a76823')
    b(3,14,4,3,'#d8a36b');b(33,14,3,3,'#d5a26a')
    # Unequal, stern eyebrows and half-lidded eyes: no cute round pupils.
    b(11,15,7,2,'#75451b');b(12,17,6,1,'#75451b');b(23,15,7,2,'#704318')
    b(11,19,7,3,'#ddd3ad');b(24,19,6,3,'#ddd3ad')
    b(15,19,2,3,'#362c1d');b(27,19,2,3,'#362c1d')
    b(10,18,9,1,'#c28221');b(23,18,8,1,'#c28221')
    # Wide protruding muzzle with the pale, heavy two-lip shape in the references.
    b(14,23,15,2,'#ddb876');b(12,25,20,8,'#b58b66');b(13,24,18,7,'#e6c291')
    b(15,24,3,2,'#b88f62');b(26,24,3,2,'#b88f62')
    b(13,28,17,1,'#ab805e');b(15,29,15,3,'#d3b293');b(17,32,11,1,'#906d4f')
    if kind in ('fast','tank','boss'):
        b(33,25,5,11,'#434654');b(34,26,3,3,'#a7a6a0');b(34,32,2,3,'#f74325')
    if kind=='fast':
        b(37,30,3,5,'#e04d0e');b(38,31,2,3,'#ffc844')
    if kind in ('tank','boss'):
        b(0,33,9,6,'#3c4050');b(0,34,9,2,'#999f9e');b(7,31,3,9,'#656978')
    if kind=='boss':
        b(33,32,7,8,'#5c6274');b(34,34,6,2,'#b4bbc3');b(34,38,4,2,'#e94123')
    return im
for kind in ['basic','fast','tank','boss']:
    im=cow(kind)
    if kind=='boss': im=im.resize((80,96),Image.Resampling.NEAREST)
    im.save(E/f'niulai_{kind}.png')

if __name__=='__main__': print('Assets rebuilt from unchanged source photograph and pixel rectangles.')
