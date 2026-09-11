// Stage 1 keeps its original event script. Endless shares the same update/collision pipeline.
const ENTITY_LIMITS = { enemies: 48, bullets: 256, enemyBullets: 384, particles: 600, powerups: 32 };
let records = { score: 0, wave: 0 }, storageAvailable = true;
function readRecord(key) {
    const n = Number(localStorage.getItem(key));
    return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}
try { records = { score: readRecord('tangniu_high_score'), wave: readRecord('tangniu_high_wave') }; }
catch (_) { storageAvailable = false; }
function saveRecords() {
    if (game.mode !== 'endless') return;
    const score = Math.max(records.score, game.score), wave = Math.max(records.wave, game.wave);
    if (score === records.score && wave === records.wave) return;
    records = { score, wave };
    try {
        localStorage.setItem('tangniu_high_score', String(score));
        localStorage.setItem('tangniu_high_wave', String(wave));
    } catch (_) { storageAvailable = false; }
}
function showRecords() {
    document.getElementById('records').textContent = `ENDLESS BEST  ${records.score}  /  WAVE ${records.wave}`;
    document.getElementById('storage-note').textContent = storageAvailable ? '' : 'Storage unavailable — records last for this session.';
}
function endlessDifficulty(wave) {
    const n = Math.min(40, Math.max(0, wave - 1));
    return {
        interval: Math.max(32, Math.round(125 - n * 4)),
        speed: Math.min(1.65, 1 + n * 0.025),
        hp: Math.min(3, Math.floor(n / 10)),
        fire: Math.max(0.65, 1 - n * 0.012),
        tankChance: Math.min(0.4, 0.18 + n * 0.008),
    };
}
function beginWave(wave) {
    game.wave = wave;
    game.waveFrame = 0; game.spawnTimer = 60;
    game.waveClearTimer = 0; game.bossSpawned = false;
    game.banner = `WAVE ${wave}`; game.stageTextTimer = 120;
    if (wave % 5 === 0) { game.bossWarningTimer = 180; sfxBossWarning(); }
    saveRecords(); updateHUD();
}
function updateEndless() {
    if (game.waveClearTimer > 0) {
        if (--game.waveClearTimer === 0) beginWave(game.wave + 1);
        return;
    }
    game.waveFrame++;
    if (game.wave % 5 === 0) {
        if (!game.bossSpawned && game.waveFrame >= 180) {
            spawnBoss(); game.bossSpawned = true;
        }
        return;
    }
    // Regular waves last 25 seconds. Existing enemies finish traversing naturally.
    if (game.waveFrame >= 1500) { beginWave(game.wave + 1); return; }
    if (--game.spawnTimer <= 0) {
        const d = endlessDifficulty(game.wave);
        game.spawnTimer = d.interval;
        const r = Math.random();
        const type = game.wave >= 3 && r < d.tankChance ? 'tank' :
            game.wave >= 2 && r < 0.58 ? 'fast' : 'basic';
        if (game.enemies.length < ENTITY_LIMITS.enemies) spawnEnemy(type, 0.1 + Math.random() * 0.8, game.spawnIndex++);
    }
}
function bossDefeated() {
    if (game.mode === 'stage') { completeStage(); return; }
    game.bossActive = false; game.enemyBullets = [];
    game.waveClearTimer = 150; game.banner = 'WAVE CLEARED'; game.stageTextTimer = 150;
    sfxWaveComplete(); saveRecords();
}
function cleanupEntities() {
    const W = canvas.width, H = canvas.height;
    for (const [name, cap] of Object.entries(ENTITY_LIMITS)) {
        game[name] = game[name].filter(e => Number.isFinite(e.x) && Number.isFinite(e.y) &&
            e.x > -160 && e.x < W + 200 && e.y > -160 && e.y < H + 160 &&
            (e.hp === undefined || e.hp > 0) && (e.life === undefined || e.life > 0));
        if (game[name].length > cap) game[name].splice(0, game[name].length - cap);
    }
}
function mainMenu() {
    saveRecords(); game.running = false; resetInputState();
    for (const name of Object.keys(ENTITY_LIMITS)) game[name] = [];
    document.getElementById('start-screen').style.display = 'flex';
    for (const id of ['game-over-screen','stage-complete-screen','hud','health-bar','mobile-controls'])
        document.getElementById(id).style.display = 'none';
    showRecords();
}
