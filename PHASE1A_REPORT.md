# Phase 1A Report — Horizontal Stage 1

Date: 2026-09-10  
Phase 0 baseline: `de6e25779ccd6945ce3cdc7095e0b243170d5661`  
Working branch: `phase1-horizontal-stage1`

## A. Project Status

- Horizontal shooter conversion: **PASS**
- WASD free movement: **PASS**
- Diagonal movement: **PASS**
- Horizontal firing: **PASS**
- Enemy right-to-left flow: **PASS**
- Stage 1 complete: **PASS**
- Boss complete: **PASS**
- Desktop controls: **PASS**
- Mobile controls: **PASS**

The game remains one dependency-free `index.html`. It has exactly one scripted stage and never starts a Stage 2.

## B. Gameplay Changes

### Player movement

- The player starts at 18% of screen width, faces right, and can move on both axes.
- W/S/A/D and all four arrow keys map to a two-component direction vector.
- Multiple held directions combine, so all four diagonals work.
- The vector is divided by `Math.hypot(dx, dy)` before applying the unchanged 5 px/frame speed; diagonal movement therefore has the same total speed as cardinal movement.
- Input state is cleared on keyup, restart, window blur, and document hiding. Touch state also clears on touch cancellation.

### Projectile direction

- Player projectiles spawn 30 pixels in front of the player and travel left-to-right.
- Level 1 fires one straight projectile; level 2 fires two vertically offset parallel shots; level 3 fires a forward three-shot spread with ±1.2 px/frame vertical velocity on its side shots.
- Base damage remains 1 and the 12-frame firing cooldown is unchanged.
- Player bullets are removed after the right edge or after a spread shot leaves the top/bottom.
- Enemy shots use the existing aimed-vector calculation, naturally traveling from the right toward the player. Off-screen cleanup now treats zero vertical velocity correctly.

### Enemy movement

- Basic, fast, tank, and boss are the only archetypes.
- All ordinary enemies spawn at `canvas.width + 40` and move left.
- Basic moves straight left at 1.7 px/frame.
- Fast moves left at 3.3 px/frame while following a bounded vertical sine wave.
- Tank moves left at 1.1 px/frame with 4 HP, matching its first baseline appearance.
- Enemy sprites were individually oriented to face left; the overall game canvas was not rotated.
- Power-ups and the starfield also drift left. Stars use exactly three parallax speeds: 0.6, 1.2, and 2 px/frame.

### Stage progression

- Random endless spawning was removed.
- A 31-event deterministic script controls 29 ordinary enemies, one boss warning, and one boss.
- The timeline always uses the same enemy types, order, entry times, entry heights, and initial fire delays.
- Boss defeat calls the terminal completion state, shows score and remaining lives, and offers `RESTART STAGE`.
- Restart resets Stage 1 time, event index, entities, score, health, lives, player position, weapon, and input state.

## C. Stage 1 Design

| Section | Enemy Types | Enemy Count | Duration |
|---|---|---:|---:|
| A | Basic | 9 | ~0–30 seconds |
| B | Basic + Fast | 11 (6 + 5) | ~30–66 seconds |
| C | Fast + Tank | 9 (5 + 4) | ~66–99 seconds |
| Final | Boss warning + Boss | 1 boss | Begins at 102 seconds; boss enters at 108 seconds and ends when defeated |

The scripted pre-boss timeline is 1 minute 48 seconds. Normal completion, including the boss fight, is approximately 2–4 minutes depending on accuracy and weapon pickups.

## D. Player Movement

- Movement speed: **5 px/frame**.
- X bounds: `max(25 px, 5% of width)` through `min(width − 25 px, 58% of width)`.
- Desktop Y bounds: 75 px through `height − 45 px`.
- Mobile Y bounds: 75 px through `height − 178 px`, keeping the ship above the two-row touch pad and home-indicator safe area.
- Diagonal normalization: calculate `(dx, dy)` from held inputs, divide each component by `Math.hypot(dx, dy)`, then multiply by 5.
- Swipe movement: both CSS-pixel X and Y deltas are mapped to internal canvas coordinates and clamped to the same bounds.

## E. Boss

- HP: **50**.
- Score reward: **2,000**.
- Entrance: starts 60 pixels beyond the right edge and moves left at 0.5 px/frame to `max(72% of width, width − 190 px)`.
- Position: remains on the right side and follows a vertically bounded sine pattern after/during entry.
- Attack: aimed projectile at 4 px/frame every 40 frames; every third firing event adds two leftward diagonal projectiles with velocities `(-3, -1)` and `(-3, 1)`.
- Collision: 55 × 70 horizontal hitbox. Contact deals the existing 20 damage but does not delete the boss.
- Defeat: large explosion, screen shake, 2,000 points, normal power-up roll, `STAGE 1 COMPLETE`, final score, remaining lives, and Restart Stage button.

## F. Mobile

- The same `index.html` contains a compact two-row four-direction pad and a separate Fire button.
- Up, Down, Left, Right, and Fire each maintain independent touch state.
- Two direction touches can be held for diagonal movement while another touch holds Fire.
- `touchstart`, `touchend`, and `touchcancel` prevent stuck controls; non-passive handlers and `touch-action: none` prevent page scrolling.
- Existing canvas swipe control now supports both axes and tracks a specific touch identifier, so a Fire touch does not replace the movement touch.
- Safe-area insets remain applied in portrait and landscape.

## G. Files Modified

- `index.html` — horizontal orientation, free movement, deterministic Stage 1, end boss, completion/restart flow, horizontal background/projectiles/power-ups, collision updates, HUD, and four-direction mobile controls.
- `README.md` — update gameplay description, controls, features, screenshots note, and actual project structure.
- `PHASE1A_REPORT.md` — this implementation and verification report.

Phase 0 files, enemy art, screenshots, audio design, MIT license, attribution, and the Phase 0 audit remain present. No Tangniu, cow UFO, banana content, new music, extra stage, level editor, new enemy type, complex weapon, or advanced boss phase was added.

## H. Test Results

Deterministic logic/integration harness: **22 passed, 0 failed**. The complete scripted stage was simulated through boss defeat within the four-minute ceiling.

### Desktop

- [x] W moves up
- [x] S moves down
- [x] A moves left
- [x] D moves right
- [x] Diagonal movement works
- [x] Diagonal speed is normalized
- [x] Arrow keys work
- [x] Space fires
- [x] Player bullets travel right
- [x] Enemies enter from the right
- [x] Enemies travel/attack toward the left/player
- [x] Enemy bullets target the player
- [x] Player cannot leave gameplay bounds
- [x] Basic enemy works
- [x] Fast enemy works
- [x] Tank enemy works
- [x] Stage sections progress deterministically
- [x] Boss appears
- [x] Boss can be defeated
- [x] Stage Complete appears
- [x] Restart Stage works
- [x] Game over and Try Again still work
- [x] No browser console errors

### Mobile

- [x] Up works
- [x] Down works
- [x] Left works
- [x] Right works
- [x] Diagonal movement works
- [x] Move + Fire simultaneous multi-touch state works
- [x] Two-axis swipe works without stealing the Fire touch
- [x] Page scrolling is suppressed during gameplay
- [x] Portrait remains usable
- [x] Landscape remains usable
- [x] Player bounds remain above the touch controls

Browser QA covered live launch, horizontal rendering, player/enemy orientation, enemy entry/fire, HUD, game over/restart, and phone-sized portrait/landscape layouts. The available browser was Chromium-based; physical iPhone Safari and Android Chrome devices were not attached, so those paths were additionally verified by standards-compatible source inspection.

## I. Git

- Branch: `phase1-horizontal-stage1`
- Commit: recorded in the final handoff after this report is committed
- Commit message: `phase1: horizontal stage 1 with free wasd movement`

## Final Verdict

**PHASE 1A: PASS**
