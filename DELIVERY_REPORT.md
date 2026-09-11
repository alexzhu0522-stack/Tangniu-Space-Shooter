# 太空牛 — Phase 1B

**PHASE 1B: PASS** — implemented and browser-tested; production delivery status appended after publication.

## A. Art

Source photo: `codex-clipboard-155a8e99-e9d9-4e9d-9142-748fd649b0b2.png`, (74, 125). Copied byte-for-byte to `assets/player/tangniu_head_original.png`; SHA-256 `bb8ed4034bf645d33d15456504012cce7acc8299b8d0ea6d109fdcde1f373423`. Hard polygon alpha mask follows hair/ears/jaw; crop `(2,10,69,115)` = 67 × 105; nearest-neighbor downsample to **14 × 22** at `assets/player/tangniu_head_pixel.png`. The exact mask coordinates are in `tools/build_assets.py`. No redraw, generation, facial animation, color adjustment or artistic face substitution. Glasses, hair and smile are sampled from the photo.

UFO asset `assets/player/tangniu_ufo.png`: **72 × 48**; photo placed at `(30,10)` in a low open cockpit. Original pixel hull/pods/engine, using the supplied monkey-UFO screenshot only for composition. Larger gameplay display **144 × 96** on desktop, approximately **100.3 × 66.9** at 390px phone width (`scale=min(2,width/280)`). Menu is 180 × 120 desktop, 144 × 96 phone. Player collider stays **50 × 40**. Movement bounds account for the enlarged art, avoiding HUD/touch controls and left-edge clipping.

Player states: idle; moving (two-frame thruster); shooting (flash/recoil); hit (outline/blink); destroyed (sprite removed and original explosion particles continue). All states reuse the same photograph. Pixel bullets now use hard rectangular layers; no round/gradient projectiles.

牛来 uses the later supplied yellow/orange upright-cow references: gray horns, triangular ears, large square head, uneven heavy brows, half-lidded eyes, pale broad two-lip muzzle, awkward torso/arms/legs. Crude hard blocks and minimal shading, with one base character for every variant.

| Asset | Native px | Gameplay px |
|---|---:|---:|
| `assets/enemies/niulai_basic.png` | 40 × 48 | 56 × 67.2 |
| `assets/enemies/niulai_fast.png` | 40 × 48 | 56 × 67.2 |
| `assets/enemies/niulai_tank.png` | 40 × 48 | 72 × 86.4 |
| `assets/enemies/niulai_boss.png` | 80 × 96 | 168 × 201.6 |

Canvas smoothing is disabled and CSS uses `image-rendering: pixelated`. Pixel assets and their generation script are local and reproducible.

## B. Enemy mapping

| Gameplay type | New character | Stage HP | Movement px/update | Attack interval |
|---|---|---:|---|---|
| basic | 牛来 | 1 | Left 1.7 | Aimed / 120 |
| fast | Flying 牛来 | 1 | Left 3.3 + original bounded sine | Aimed / 200 |
| tank | Heavy 牛来 | 4 | Left 1.1 | Aimed / 80 |
| boss | NIU LAI PRIME | 50 | Original 0.5 entry then vertical sine | Aimed + periodic three-way spread |

Stage collision sizes and enemy architecture remain unchanged. Weapon damage, three weapon levels, pickups and health/lives are shared between modes.

## C. Boss

HP 50 in Stage 1; collider 55 × 70; visual 168 × 201.6, **3× normal enemy dimensions**; side modules; named health bar; reward **2,000**.

- Phase 1 at HP ≥50%: 40-update fire interval; aimed speed 4; every third attack adds ±0.28-radian shots for a three-way spread.
- Phase 2 below 50%: 1.25× vertical motion clock, 32-update fire interval, ±0.52-radian spread. Red eyes/modules and RAGE label.
- Full Stage 1 test killed the boss through real bullet collisions in 181.95 simulated seconds; score 6200. It uses invulnerability to isolate progression, so it is not a human balance assessment.

## D. Stage 1

Original 31-event timeline verified equal to commit `34572db29d4e628d66e34051ef816ad6a29ecf73`: Section A 9 basic; B 6 basic + 5 fast; C 5 fast + 4 tank; warning at 102s; boss at 108s. STAGE 1 COMPLETE and Restart Stage work. No Stage 2. Restart resets score, entities, health, lives, weapon and timeline.

## E. Endless

Independent menu selection, shared gameplay. Regular waves last **25 seconds**; initial spawn delay 60 updates. Wave 1 basic; Wave 2 adds fast; Wave 3 adds tank; Wave 4 greater density. Boss every fifth wave after a 180-update warning. Regular spawning pauses during bosses. Boss defeat shows WAVE CLEARED for 150 updates, then continues with score preserved and no terminal completion.

With `n=min(40,max(0,wave-1))`:

- Spawn interval `max(32,round(125-4*n))` updates.
- Speed multiplier `min(1.65,1+0.025*n)`.
- Added ordinary HP `min(3,floor(n/10))`.
- Fire-interval multiplier `max(0.65,1-0.012*n)`.
- Tank probability from Wave 3 `min(0.4,0.18+0.008*n)`.
- Boss HP `round(50*min(3,1+(floor(wave/5)-1)*0.25))`: first 50, cap 150.

HUD: score, time, wave, high score, weapon and health/lives. localStorage keys `tangniu_high_score` and `tangniu_high_wave` validate numeric values and write only improvements. Blocked storage uses session records with a visible note. Menu and game over show records. Game over includes score/high score/wave reached/best wave, Retry (same mode) and Main Menu.

## F. Performance

**20-minute / 72,000-update** accelerated browser test reached Wave **41**, score **176050**, still running. Bosses at [5, 10, 15, 20, 25, 30, 35, 40]. An invulnerable Level 3 tracking bot uses actual shots/collisions to keep the simulation alive. No growing entity collection/leak detected; this is not a full heap-profiler guarantee.

| Collection | Measured maximum | Hard cap |
|---|---:|---:|
| Enemies | 14 | 48 |
| Player bullets | 29 | 256 |
| Enemy bullets | 65 | 384 |
| Combined projectiles | 88 | 640 |
| Particles | 181 | 600 |
| Pickups | 6 | 32 |

Second 20-minute no-fire soak starts at capped difficulty Wave 99 and leaves the boss alive: maxima `{'enemies': 20, 'bullets': 0, 'enemyBullets': 83, 'particles': 0, 'powerups': 0}`. Arrays stayed bounded. Dead/offscreen/non-finite entities are removed; top-edge enemy bullet cleanup is fixed. Stars fixed at 200. Fixed 60Hz updates with bounded catch-up; hidden tabs pause. No npm/backend/music added.

## G. Mobile

Chromium/Edge touch emulation: 390 × 844, 844 × 390, 320 × 568. All directions, normalized diagonal, three touches (Up+Right+Fire), independent release, cancel, two-axis swipe+Fire, menu selection, HUD fit and no scrolling PASS. Independent pointer IDs/capture are used. Enlarged UFO visual bounds reserve the touch area. Physical Safari/iPhone and Android devices were not attached.

## H. Files created/modified

Paths relative to the existing project; historical reports/screenshots/license remain preserved:

- `"\345\244\252\347\251\272\347\211\233beta V 0.1.zip"`
- `.gitignore`
- `.openai/hosting.json`
- `PHASE1B_REPORT.md`
- `README.md`
- `arcade.css`
- `art.js`
- `assets/enemies/niulai_basic.png`
- `assets/enemies/niulai_boss.png`
- `assets/enemies/niulai_fast.png`
- `assets/enemies/niulai_tank.png`
- `assets/player/tangniu_head_original.png`
- `assets/player/tangniu_head_pixel.png`
- `assets/player/tangniu_ufo.png`
- `dist/LICENSE`
- `dist/arcade.css`
- `dist/art.js`
- `dist/assets/enemies/niulai_basic.png`
- `dist/assets/enemies/niulai_boss.png`
- `dist/assets/enemies/niulai_fast.png`
- `dist/assets/enemies/niulai_tank.png`
- `dist/assets/player/tangniu_ufo.png`
- `dist/index.html`
- `dist/modes.js`
- `index.html`
- `modes.js`
- `tests/verify.cjs`
- `tools/build_assets.py`
- `tools/build_static.py`

## I. Exact PASS/FAIL checklist

**76 PASS / 0 FAIL**. Raw results and screenshots in the delivered QA folder. Source: `tests/verify.cjs`.

- [x] PASS — Original Phase 1A event timeline is byte-equivalent
- [x] PASS — å¤ªç©ºç‰› title and both mode buttons
- [x] PASS — All five gameplay images loaded
- [x] PASS — Nearest-neighbor canvas rendering
- [x] PASS — Player collision remains 50 Ã— 40
- [x] PASS — KeyW movement
- [x] PASS — KeyS movement
- [x] PASS — KeyA movement
- [x] PASS — KeyD movement
- [x] PASS — ArrowUp movement
- [x] PASS — ArrowDown movement
- [x] PASS — ArrowLeft movement
- [x] PASS — ArrowRight movement
- [x] PASS — Normalized diagonal movement
- [x] PASS — Moving UFO state
- [x] PASS — Idle UFO state
- [x] PASS — Weapon 1 shoots forward
- [x] PASS — Shooting UFO state 1
- [x] PASS — Weapon 2 shoots forward
- [x] PASS — Shooting UFO state 2
- [x] PASS — Weapon 3 shoots forward
- [x] PASS — Shooting UFO state 3
- [x] PASS — Hit flash state and damage
- [x] PASS — One hit per invulnerability window
- [x] PASS — Movement clamps at gameplay bounds
- [x] PASS — Original sections A/B/C introduce basic, fast and tank
- [x] PASS — Boss warning then Niu Lai Prime appears
- [x] PASS — Boss phase 2 reached through real bullet collisions
- [x] PASS — Boss defeated and STAGE 1 COMPLETE shown
- [x] PASS — Restart Stage clears progression/entities
- [x] PASS — basic original HP/movement/fire rate
- [x] PASS — fast original HP/movement/fire rate
- [x] PASS — tank original HP/movement/fire rate
- [x] PASS — Phase 1 aimed three-way spread
- [x] PASS — 50% HP stays phase 1
- [x] PASS — Phase 2 below 50%, faster movement/fire, wider spread
- [x] PASS — Endless starts Wave 1 separately
- [x] PASS — Difficulty increases and caps
- [x] PASS — Boss wave 5 with capped HP
- [x] PASS — Boss wave 10 with capped HP
- [x] PASS — Boss wave 1000000 with capped HP
- [x] PASS — Endless boss awards score, shows WAVE CLEARED, keeps running
- [x] PASS — Endless continues to Wave 6 without resetting score
- [x] PASS — Endless game over and destroyed UFO
- [x] PASS — Destruction particles emitted
- [x] PASS — High score and best wave persisted
- [x] PASS — Game over displays score/high score/wave/best wave
- [x] PASS — Retry retains Endless mode and resets run
- [x] PASS — Main Menu returns to both mode choices
- [x] PASS — 20-minute simulation finishes still running
- [x] PASS — Multiple Endless bosses only every fifth wave
- [x] PASS — All entity counts remain below safety caps
- [x] PASS — 20-minute no-fire capped-difficulty soak remains bounded
- [x] PASS — Dead/offscreen enemies, both projectile arrays, particles and pickups cleaned
- [x] PASS — Hard caps defend every entity collection
- [x] PASS — Records survive page reload
- [x] PASS — Real Endless menu button selects mode
- [x] PASS — Real Retry button restarts Endless
- [x] PASS — Real Main Menu button works
- [x] PASS — Mobile mode selection
- [x] PASS — Mobile up touch moves correctly
- [x] PASS — Mobile down touch moves correctly
- [x] PASS — Mobile left touch moves correctly
- [x] PASS — Mobile right touch moves correctly
- [x] PASS — Three simultaneous touches: normalized diagonal + Fire
- [x] PASS — Releasing one touch preserves other controls
- [x] PASS — Touch cancel clears controls
- [x] PASS — Canvas two-axis swipe coexists with Fire
- [x] PASS — Mobile portrait HUD fits without overlap
- [x] PASS — Mobile portrait no scrolling; controls below playfield
- [x] PASS — Mobile landscape HUD fits without overlap
- [x] PASS — Mobile landscape no scrolling; controls below playfield
- [x] PASS — Mobile small-portrait HUD fits without overlap
- [x] PASS — Mobile small-portrait no scrolling; controls below playfield
- [x] PASS — Blocked storage degrades to session records and game remains playable
- [x] PASS — No uncaught browser errors

Source/visual checks: supplied photo byte identity PASS; face not redrawn PASS; low larger UFO PASS; reference-derived crude 牛来 PASS; pixel bolts PASS; relative runtime paths PASS.

## J. Git / delivery

Branch `phase1b-tangniu-art-endless`; Phase 1A base `34572db29d4e628d66e34051ef816ad6a29ecf73`; Phase 0 remains in history. Implementation commit message: `phase1b: tangniu ufo niu lai enemies and endless mode`. Full hashes, final working-tree status, public URL and GitHub update outcome are appended to the delivered report after committing/publishing. This avoids embedding a self-referential hash in its own commit.

Static hosting is registered for public access. `dist/` includes runtime assets and license, not the source photo or development files. Each visitor has independent browser-local records.

**PHASE 1B: PASS**

## Final Git handoff

- Implementation commit: `25027c239931f1cd5ad203e84ccac39056811b98`.
- Final history-preserving merge: `3ff0f5932a8f497c9196b8a5018ccdc18b4f6b29`.
- Branch: `phase1b-tangniu-art-endless`.
- Working tree: clean at verification.
- Phase 0 and Phase 1A hashes are unchanged. The user's independent GitHub history (`359edd37f8773ec785ada56c36e563ad5c9befa4`) is retained as a merge ancestor.
- Sites source push succeeded; the saved public version contains this exact final source revision and the verified static runtime.
- GitHub push was attempted without forcing or rewriting remote history. It could not authenticate: credential manager had no signed-in account. The user accepted manual upload. GitHub main therefore remains `359edd37f8773ec785ada56c36e563ad5c9befa4`.
- `Taikongniu-GitHub-upload.zip` contains the finished game and development source. Extract it and upload its contents into the existing repository root. No credential, `.git`, Sites manifest, duplicate dist tree or old ZIP is included.

## Public deployment — SUCCEEDED

Play: https://taikongniu-arcade.xujiayundeng801.chatgpt.site

Public access was confirmed by the Sites access response. The publishing service reported `succeeded` for saved version 1 at source commit `3ff0f5932a8f497c9196b8a5018ccdc18b4f6b29`. This is permanent hosted delivery independent of the user's PC; it is not a local tunnel. The production response supplies the URL; browser gameplay/mobile QA was performed on the matching local release.

Final verdict: **PHASE 1B: PASS**. GitHub automatic upload remains blocked by sign-in; manual upload package delivered as accepted by the user.
