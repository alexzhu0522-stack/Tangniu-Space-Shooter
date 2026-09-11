# Phase 0 Baseline Audit — Spaceship Shooter

Audit date: 2026-09-10  
Upstream: <https://github.com/alfredang/spaceship-shooter-game>  
Upstream revision cloned: `64408260e2310d0bee419830bdbdef04e0c68dd3`  
Original author: Alfred Ang  
License: MIT

## A. Baseline Status

- Clone succeeded: **YES**
- Game launches: **YES**
- Desktop playable: **YES**
- Mobile implementation present: **YES**
- Mobile implementation verified: **YES** — source-path verification plus Chromium responsive tests at phone portrait and landscape-sized viewports; Windows did not provide physical iPhone Safari or Android Chrome hardware.
- Direct `index.html` play works: **YES** — the game is a classic inline script with no module, fetch, backend, build, or localhost dependency. Direct `file://` navigation was also reviewed structurally; the controlled browser used for runtime testing blocks local-file navigation by policy, so runtime checks used a temporary local static test endpoint that is not part of the project.
- GitHub Pages ready: **YES** — `index.html` is at the repository root; repository assets use relative paths; there are no secrets, APIs, backend calls, or machine paths. The Google Fonts HTTPS import is optional presentation enhancement and has CSS fallbacks.

Verification evidence:

- Interactive browser checks: start screen, launch, live rendering, enemy spawning/movement/fire, player damage, health/lives, game over, restart, mute, responsive portrait/landscape layouts, and post-fix console (zero errors).
- Deterministic source-logic harness: **12/12 checks passed** for initialization, four keyboard movement bindings, scroll prevention, all three weapon levels, ordinary enemy stats, retained boss spawn, boss defeat/wave advance, both player-damage paths, all power-up effects, game over/restart, mobile handlers, and audio/mute initialization.
- Static full-source audit: all 1,195 lines of the single-file game plus README, ignore rules, and image assets were inspected.

## B. Project Location

`C:\Users\32964\Documents\Codex\2026-09-10\files-pasted-by-the-user-we\outputs\spaceship-shooter-game-phase0`

Complete working-tree structure (excluding Git's generated `.git/` object database):

```text
spaceship-shooter-game-phase0/
├── .gitignore
├── index.html
├── LICENSE
├── PHASE0_AUDIT.md
├── README.md
└── screenshots/
    ├── gameplay-action.png
    ├── gameplay.png
    ├── mobile-gameplay.png
    ├── mobile-start.png
    └── start-screen.png
```

- `.gitignore` — ignores `.github/`; inherited unchanged from upstream.
- `index.html` — the complete HTML, CSS, canvas rendering, game logic, input, and synthesized audio implementation.
- `LICENSE` — MIT license and original-author attribution.
- `PHASE0_AUDIT.md` — full verified baseline report.
- `README.md` — upstream overview, controls, screenshots, launch instructions, and license information.
- `screenshots/gameplay-action.png` — upstream action-gameplay screenshot.
- `screenshots/gameplay.png` — upstream standard gameplay screenshot.
- `screenshots/mobile-gameplay.png` — upstream portrait mobile gameplay screenshot.
- `screenshots/mobile-start.png` — upstream portrait mobile start-screen screenshot.
- `screenshots/start-screen.png` — upstream desktop start-screen screenshot.

## C. Files Modified

- `index.html` — minimal functional and compatibility fixes only: retain boss spawns after filtering; reserve HUD space for mute; add safe-area insets; scale/clamp swipe deltas; make touch cancellation/passive behavior explicit; scope keyboard default prevention to active gameplay keys; resume suspended Web Audio; guard the normal power-up sound.
- `README.md` — add explicit original-author attribution and link the declared MIT license to its file.
- `LICENSE` — add the standard MIT text and preserve Alfred Ang's attribution. Upstream said “MIT” in README but did not include a license file at the cloned revision.
- `PHASE0_AUDIT.md` — this report.

No characters, enemies, items, balance changes, or creative redesigns were added.

## D. Enemy Summary

**TOTAL DISTINCT ENEMY TYPES: 4**

All enemies are plain JavaScript objects distinguished by the `type` property; there are no enemy classes. Definitions and stats are in `index.html` under `drawEnemy` (around line 477), `spawnEnemy` (around line 570), `spawnBoss` (around line 607), enemy updates/fire (around lines 694–723), and collisions (around lines 728–779).

| # | Enemy Name | Code Name | HP | Speed (px/frame) | Shoots? | Damage | Score | Appears When |
| - | ---------- | --------- | -: | ----------------: | ------- | -----: | ----: | ------------ |
| 1 | Basic Enemy | `basic` | 1 | `1.5 + 0.2 × wave` | Yes | 10 projectile / 20 contact | 100 | Every wave; 75% of ordinary spawns on wave 1, 60% on wave 2, 50% on wave 3+ |
| 2 | Fast Enemy | `fast` | 1 | `3 + 0.3 × wave` vertical | Yes | 10 projectile / 20 contact | 150 | Every wave; 25% on wave 1, 40% on wave 2, 33⅓% on wave 3+ |
| 3 | Tank Enemy | `tank` | `3 + floor(wave / 2)` | `0.8 + 0.1 × wave` | Yes | 10 projectile / 20 contact | 300 | Wave 3 onward; 16⅔% of ordinary spawns |
| 4 | Boss | `boss` | `20 + 10 × wave` | 0.5 approach; horizontal sweep after arrival | Yes | 10 projectile / 20 contact | 2,000 | One after the ordinary kill quota on waves divisible by 3 |

### 1. Basic Enemy (`basic`)

- Definition: `index.html`, `spawnEnemy`; rendering in `drawEnemy`.
- Spawn conditions/waves: included in the weighted ordinary spawn pool on every wave. The pool is `[basic, basic, basic, fast, fast, tank]`, truncated to four entries on wave 1, five on wave 2, and all six on wave 3+.
- Movement: straight downward.
- Speed: `1.5 + wave × 0.2` pixels per animation frame.
- HP: 1.
- Collision size: 36 × 30 for player bullets (half-extents 18 × 15). Player-body contact uses combined center thresholds 33 × 35.
- Damage: 20 on body contact; its projectile deals 10.
- Shooting/projectile: yes; a red circular aimed projectile stored as an anonymous `{x, y, vx, vy, color}` object, magnitude 3 px/frame.
- Fire rate: every 120 frames after a randomized initial timer in `[0, 120)`; it cannot fire until below the top edge (`y > 0`).
- Score: 100.
- Special abilities: none.
- Appearance: purple/magenta outlined compact triangular craft with a red central eye.
- Higher-wave behavior: only downward speed and relative spawn probability change; HP, fire rate, projectile, damage, and score stay fixed.

### 2. Fast Enemy (`fast`)

- Definition: `index.html`, `spawnEnemy`; rendering in `drawEnemy`.
- Spawn conditions/waves: wave 1 onward, with probabilities shown in the table.
- Movement: downward plus horizontal sine motion: `startX + sin(time × 0.05) × 80`.
- Speed: `3 + wave × 0.3` pixels per frame vertically; horizontal amplitude is 80 pixels.
- HP: 1.
- Collision size: 44 × 20 for player bullets (half-extents 22 × 10). Player-body contact uses thresholds 37 × 30.
- Damage: 20 contact; 10 projectile.
- Shooting/projectile: yes; same anonymous red aimed orb as ordinary enemies, magnitude 3 px/frame.
- Fire rate: 200 frames, with randomized initial timer in `[0, 120)`.
- Score: 150.
- Special abilities: sinusoidal lateral evasion.
- Appearance: thin green swept-wing/chevron craft with a bright green center.
- Higher-wave behavior: vertical speed and spawn probability change; all other stats remain fixed.

### 3. Tank Enemy (`tank`)

- Definition: `index.html`, `spawnEnemy`; rendering in `drawEnemy`.
- Spawn conditions/waves: available from wave 3 onward at one of six ordinary-pool entries.
- Movement: straight downward.
- Speed: `0.8 + wave × 0.1` pixels per frame.
- HP: `3 + floor(wave / 2)`; examples: 4 on wave 3, 5 on wave 4, 6 on wave 6.
- Collision size: 40 × 40 for player bullets (half-extents 20 × 20). Player-body contact uses thresholds 35 × 40.
- Damage: 20 contact; 10 projectile.
- Shooting/projectile: yes; red aimed orb, magnitude 3 px/frame.
- Fire rate: 80 frames, with randomized initial timer in `[0, 120)`.
- Score: 300.
- Special abilities: scaling HP; uses the large explosion/screen shake on death.
- Appearance: armored orange circular hull, yellow inner ring, red center.
- Higher-wave behavior: both HP and downward speed increase; other stats stay fixed.

### 4. Boss (`boss`)

- Definition: `index.html`, `spawnBoss`; rendering in `drawEnemy`.
- Spawn conditions/waves: one boss is queued when the ordinary kill quota is reached on waves 3, 6, 9, and so on. Remaining ordinary enemies must also be cleared.
- Movement: descends from `y = -60` at 0.5 px/frame until clamped at `y = 80`, then sweeps horizontally around screen center using `sin(time × 0.02) × 30% of canvas width`.
- HP: `20 + wave × 10` (50 on wave 3, 80 on wave 6, 110 on wave 9).
- Collision size: 70 × 55 for player bullets (half-extents 35 × 27.5). Player-body contact uses thresholds 50 × 47.5.
- Damage: 20 contact; each projectile deals 10.
- Shooting/projectile: a purple aimed orb at magnitude 4 px/frame. Every third firing event also emits two purple side projectiles from `x ± 20`, with velocities `(-1, 3)` and `(1, 3)`.
- Fire rate: 40 frames; initial timer is zero, with firing gated by `y > 0`.
- Score: 2,000.
- Special abilities: boss health bar, wide horizontal sweep, multi-projectile volleys, boss-warning audio, large explosion/screen shake.
- Appearance: large dark-purple polygonal ship with magenta outline, twin glowing eyes, and a red health bar.
- Higher-wave behavior: HP scales; movement, fire cooldown, projectile speeds, damage, and score do not. The stored `phase` field is unused, so there are no phase transitions.

There are no mini-bosses, elite enemies, subclasses, or same-type stat variants beyond the wave formulas above. Enemies that leave the bottom of the screen are removed without score, a kill count, or a power-up.

README comparison: its “4 enemy types — Basic, Fast, Tank, and Boss” claim matches the source. Its architecture/tech-stack text claims a `.github/workflows/deploy.yml` GitHub Actions deployment, but that directory is absent at the cloned revision and is explicitly ignored by `.gitignore`.

## E. Boss Summary

- Boss types: **1** (`boss`; human-readable name “Boss”).
- Stats: HP `20 + 10 × wave`, score 2,000, collision 70 × 55, contact damage 20, projectile damage 10, fire cooldown 40 frames.
- Behavior: slow entrance to `y = 80`, horizontal sine sweep across 60% of canvas width, aimed shots at speed 4, and two extra downward-diagonal shots every third volley.
- Defeat: awards 2,000, increments the kill count, triggers large explosion/audio/shake, rolls the normal 15% power-up chance, advances the wave once all enemies are gone, resets kills, calculates the next quota, and plays the wave-complete cue.
- Mini-bosses/elites: none.

## F. Player Stats

- HP/lives: 100 HP and 3 starting lives. Enemy bullets deal 10; body collisions deal 20. A hit grants 60 frames of invincibility.
- Life loss: at zero HP, lose one life. If lives remain, HP resets to 100 and weapon level drops by one, minimum 1. At zero lives, game over appears.
- Size/collision: drawn as 40 × 50; enemy/player-projectile tests use player half-extents 15 × 20.
- Movement: horizontal only, 5 px/frame, clamped to 25 pixels from each canvas edge.
- Fire cooldown: 12 frames (about 5 volleys/second at 60 fps).
- Projectile: 1 damage. Center shots travel upward at 10 px/frame.
- Weapon level 1: one center projectile.
- Weapon level 2: two projectiles at `x ± 8`, both speed 10.
- Weapon level 3 / triple-shot: center projectile at speed 10 plus side shots starting at `x ± 15`, speed 9, with approximately ±0.30 px/frame horizontal drift.
- Maximum weapon level: 3. Weapon power-ups stack by one level to that cap. Fire cooldown and per-projectile damage do not change.
- Start/restart: position is canvas center and 80 pixels above the bottom; weapon resets to level 1 and invincibility to 60 frames.

## G. Power-Up Summary

**TOTAL DISTINCT POWER-UP TYPES: 3**

Each defeated enemy, including the boss, independently has a 15% chance to drop one power-up. Conditional drop weights are 50% health, 35% weapon, and 15% life (overall rates per kill: 7.5%, 5.25%, and 2.25%). All are size 12, fall at 2 px/frame, use a 25 × 25 center-distance pickup test, and vanish below the screen. No power-up is timed.

| Code name | Visible representation | Effect | Duration | Stacking / maximum |
| --------- | ---------------------- | ------ | -------- | ------------------ |
| `health` | Green orb with `+` | Restores 30 HP | Permanent HP change | Caps at 100 HP; repeated pickups restore up to the cap |
| `weapon` | Yellow orb with `W` | Adds one weapon level | Rest of current life/run | Stacks to level 3; losing a life removes one level, minimum 1 |
| `life` | Red orb with `♥` | Adds one life | Rest of run | Stacks without a coded maximum; restart resets lives to 3 |

There are no separate visible text names in the game UI; the code names and glyphs above are the complete identification.

## H. Wave System

- Start: wave 1, 10 required kills, first spawn after 60 frames.
- Later quotas: on advancing, `enemiesPerWave = 10 + wave × 3`; therefore wave 2 has 16, wave 3 has 19, wave 4 has 22, etc.
- Spawn gate: while not transitioning and kills are below quota. Because it is kill-gated rather than spawn-count-gated, more than the quota may be alive; all remaining enemies must be cleared.
- Spawn interval: `max(20, 90 - wave × 5)` frames after each spawn (85 on wave 1, 80 on wave 2, reaching the 20-frame floor on wave 14).
- Difficulty: basic/fast/tank downward speeds scale with wave; tank HP scales; the tank joins at wave 3; boss HP scales. Ordinary damage, projectile speed, cooldowns, and score do not scale.
- Boss schedule: every third wave, after the normal kill quota.
- Transition: spawning pauses, the field must clear, then wave increments, kills reset to zero, a new quota is calculated, HUD updates, and the 120-frame wave banner/fanfare runs.

## I. Audio System

- Generation: entirely synthesized with the Web Audio API. Oscillators create sine/square/sawtooth tones; generated random buffers passed through a band-pass filter create noise.
- Audio files: none.
- Graph: per-effect gain nodes feed a master gain connected to `audioCtx.destination`; normal master gain is 0.3.
- Effect categories (13): basic player shot, upgraded shot, enemy hit, small explosion, large explosion, player hit, health/weapon power-up, extra-life fanfare, enemy shot, wave-complete fanfare, game-over sequence, start sequence, boss warning.
- Mute: toggles `soundEnabled`, icon `🔊`/`🔇`, muted CSS state, and master gain 0/0.3. The normal power-up sound now also exits early while muted.
- iOS interaction rule: audio is initialized only inside click handlers for Launch, Try Again, or Mute. The compatibility fix resumes an existing suspended context during those user gestures, covering iOS/browser suspension behavior.

## J. Mobile Control System

- One responsive `index.html` serves desktop and mobile; no separate build exists.
- Visibility: on-screen controls appear at width ≤768 px or when `(pointer: coarse)` matches, which covers wide landscape touch phones.
- Buttons: independent left, right, and fire booleans driven by `touchstart`, `touchend`, and `touchcancel`; independent state permits move + fire simultaneously. Mouse events support desktop testing.
- Swipe: horizontal movement comes from consecutive canvas `clientX` deltas. Deltas are scaled by `canvas.width / canvas.getBoundingClientRect().width`, then immediately clamped to gameplay bounds.
- Scrolling/gestures: body uses `overflow: hidden` and `touch-action: none`; touch handlers call `preventDefault` with non-passive start/move listeners.
- Canvas: bitmap dimensions track `window.innerWidth` and `window.innerHeight` on load and resize, matching the CSS-pixel coordinate system used by controls.
- Orientation: portrait and landscape-sized responsive layouts render without clipping. Real landscape phones wider than 768 px use the coarse-pointer media query.
- Safe areas: `viewport-fit=cover` plus `env(safe-area-inset-top/right/bottom/left)` keeps HUD, mute, health, and controls away from notches, Dynamic Island, and the home indicator.

## K. Compatibility Fixes

### Original behavior

- All gameplay, visual designs, stats, spawn weights, movement formulas, weapons, power-ups, waves, audio motifs, and controls come from upstream.
- Upstream already used a single responsive canvas, on-screen touch buttons, swipe movement, page-scroll suppression, and user-triggered Web Audio initialization.

### Phase 0 fixes

1. **Boss retention/progression:** upstream pushed a boss into `game.enemies` from inside `game.enemies.filter(...)`. JavaScript `filter` snapshots the original length, and assigning its result discarded the newly pushed boss; wave 3 could become stuck. The fix queues the boss and appends it immediately after filtering, while preventing premature wave advancement.
2. **HUD overlap:** reserve 50 pixels in the HUD so the lives counter is no longer covered by the mute button.
3. **Safe areas:** add `viewport-fit=cover` and CSS safe-area insets to interactive/status controls.
4. **Touch coordinates:** scale swipe deltas from CSS pixels to canvas coordinates, clamp immediately, prevent default explicitly with non-passive listeners, and clear state on `touchcancel`.
5. **Keyboard behavior:** prevent browser defaults only for Left, Right, A, D, and Space while the game is running; this keeps gameplay from scrolling without suppressing unrelated start/game-over keyboard interaction.
6. **Audio compatibility:** resume suspended contexts inside user gestures, tolerate a missing Web Audio constructor during initialization, and guard the normal power-up sound when audio is unavailable/muted.
7. **License/attribution:** add the MIT license file and explicit Alfred Ang attribution because upstream stated MIT but shipped no `LICENSE` at this revision.

No balance values changed.

## L. Git Status

- Branch: `phase0-baseline`
- Upstream remote: `upstream` → `https://github.com/alfredang/spaceship-shooter-game.git`
- Baseline commit: created after this report and recorded in the final handoff.
- Commit message: `phase0: verified original spaceship shooter baseline`

## M. Phase 0 Verdict

The cloned baseline is fully playable, the boss-wave blocker is fixed, desktop and responsive mobile paths are verified, the single-file build remains directly openable and GitHub Pages compatible, and no Phase 1 content was introduced.

**PHASE 0: PASS**
