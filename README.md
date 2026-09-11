# 太空牛 · Tangniu UFO

牛's original photograph in a large, low-seated UFO, fighting deliberately crude upright 牛来. Vanilla HTML Canvas, JavaScript, CSS, local sprites and synthesized effects; no npm, backend, account or runtime dependency.

## Play

Open `index.html` with its adjacent files, or serve this directory with `python -m http.server 8766`. The verified public game URL is provided in the delivery. The `dist/` directory contains the same playable release for permanent static hosting and GitHub Pages.

Choose **STAGE 1** for the preserved scripted stage, or **ENDLESS MODE** for escalating waves and a boss every fifth wave. Endless records are saved per browser/device. Blocked storage falls back to records for the current session.

| Device | Movement | Fire |
|---|---|---|
| Desktop | WASD / arrows, including diagonals | Space |
| Phone / tablet | Four direction buttons or two-axis swipe | FIRE; simultaneous touches supported |

Weapons upgrade through three levels. Pickups restore health, add lives or improve weapons. NIU LAI PRIME changes phase below 50% HP. Restart and Main Menu are available after game over or Stage 1 completion.

## Maintenance

- `index.html`: existing core engine, Stage 1 script, input, collision, sound and UI.
- `art.js`, `arcade.css`: sprite rendering, rectangular pixel bolts and presentation.
- `modes.js`: Endless waves, bounded scaling, records and cleanup.
- `assets/player/`: unchanged source photo, pixelated head and UFO.
- `assets/enemies/`: basic, flying, heavy and boss 牛来.
- `tools/build_assets.py`: reproducible photo crop/mask/downsample and pixel sprites; Pillow is development-only.
- `tools/build_static.py`: copy runtime files to `dist/`; no compilation/dependency installation.
- `tests/verify.cjs`: browser regression and accelerated endurance tests using an existing Playwright installation. Set `NODE_PATH`, `BROWSER_PATH`, optional `GAME_URL` and `TEST_OUTPUT`; serve locally and run `node tests/verify.cjs`.
- `PHASE1B_REPORT.md`: implementation details, all checks and endurance results.
- `.openai/hosting.json`: registered static Site identity.

Phase 0 (`de6e257`) and Phase 1A (`34572db`) remain intact in Git history. Phase 1A's 31-event Stage 1 timeline is unchanged. Old screenshots and prior reports document those historical builds.

## Credits

Original engine by [Alfred Ang](https://github.com/alfredang/spaceship-shooter-game), under the included MIT license. Supplied photograph and character references are used for the requested adaptation; the engine license does not claim ownership of third-party reference material. 牛's face was sampled from the original photo, never redrawn or generated.
