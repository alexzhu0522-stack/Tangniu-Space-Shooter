"""Stage the dependency-free public game for Sites; never include source photos/reports."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)
for name in ['index.html', 'art.js', 'modes.js', 'arcade.css', 'LICENSE']:
    shutil.copy2(ROOT / name, OUT / name)
for relative in ['player/tangniu_ufo.png', 'enemies/niulai_basic.png',
                 'enemies/niulai_fast.png', 'enemies/niulai_tank.png', 'enemies/niulai_boss.png']:
    target = OUT / 'assets' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / 'assets' / relative, target)
print('Static release staged with relative asset paths, no runtime dependencies.')
