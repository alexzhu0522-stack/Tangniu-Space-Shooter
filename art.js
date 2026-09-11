// Artwork is independent of the unchanged collision dimensions.
const sprites = {};
const spriteReady = Promise.all(Object.entries({
    player: 'assets/player/tangniu_ufo.png',
    basic: 'assets/enemies/niulai_basic.png', fast: 'assets/enemies/niulai_fast.png',
    tank: 'assets/enemies/niulai_tank.png', boss: 'assets/enemies/niulai_boss.png',
}).map(([name, path]) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Cannot load ' + path));
    img.src = path;
    sprites[name] = img;
})));

function drawPlayer() {
    if (player.state === 'destroyed') return;
    const moving = player.state === 'moving';
    const shooting = player.fireTimer > 8;
    const frame = Math.floor(game.stageTime * 12) % 2;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(player.x) - (shooting ? 2 : 0), Math.round(player.y));
    // Double-size on desktop; preserve room to manoeuvre on narrow phones.
    const scale = Math.min(2, canvas.width / 280);
    ctx.scale(scale, scale);
    ctx.globalAlpha = player.invincible > 0 && Math.floor(player.invincible / 4) % 2 ? 0.45 : 1;
    ctx.fillStyle = frame ? '#d9faff' : '#35aaf2';
    ctx.fillRect(-31 - (moving ? 9 : 3) - frame * 3, 9, (moving ? 13 : 7) + frame * 3, 4);
    if (sprites.player.complete && sprites.player.naturalWidth) ctx.drawImage(sprites.player, -36, -24, 72, 48);
    if (shooting) {
        ctx.fillStyle = '#efffff'; ctx.fillRect(30, -3, 9, 6);
        ctx.fillStyle = '#40c9ff'; ctx.fillRect(33, -1, 14, 2);
    }
    if (player.hitTimer > 0) {
        ctx.strokeStyle = '#ff755c'; ctx.lineWidth = 2;
        ctx.strokeRect(-36, -24, 72, 48);
    }
    ctx.restore();
}

function drawEnemy(e) {
    const size = e.type === 'boss' ? 168 : e.type === 'tank' ? 72 : 56;
    const height = size * 1.2;
    const img = sprites[e.type];
    if (!img.complete || !img.naturalWidth) return;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(e.x - size / 2), Math.round(e.y - height / 2), size, height);
    if (e.type === 'boss' && e.hp < e.maxHp / 2) {
        ctx.fillStyle = '#ff3021';
        ctx.fillRect(e.x - size * 0.225, e.y - height * 0.104, size * 0.175, 5);
        ctx.fillRect(e.x + size * 0.1, e.y - height * 0.104, size * 0.15, 5);
        ctx.fillStyle = Math.floor(e.time / 6) % 2 ? '#ffb027' : '#e04416';
        ctx.fillRect(e.x - 68, e.y + 23, 9, 12); ctx.fillRect(e.x + 59, e.y + 23, 9, 12);
    }
    ctx.restore();
}

function drawPixelBolt(b, hostile = false) {
    const x = Math.round(b.x), y = Math.round(b.y);
    ctx.fillStyle = hostile ? '#7d2821' : '#164278';
    ctx.fillRect(x - 10, y - 4, 20, 8);
    ctx.fillStyle = hostile ? '#f34e30' : '#28abff';
    ctx.fillRect(x - 8, y - 3, 16, 6);
    ctx.fillRect(x - 12, y - 1, 24, 2);
    ctx.fillStyle = hostile ? '#ffbd67' : '#94e8ff';
    ctx.fillRect(x - 5, y - 2, 11, 4);
    ctx.fillStyle = '#fff3d4'; ctx.fillRect(x - 3, y - 1, 7, 2);
}

function drawBossHUD() {
    const boss = game.enemies.find(e => e.type === 'boss');
    if (!boss) return;
    const w = Math.min(340, canvas.width * 0.65), x = (canvas.width - w) / 2;
    const rage = boss.hp < boss.maxHp / 2;
    ctx.save(); ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = rage ? '#ff8152' : '#ffc85e';
    ctx.fillText('NIU LAI PRIME' + (rage ? ' / RAGE' : ''), canvas.width / 2, 91);
    ctx.fillStyle = '#42232b'; ctx.fillRect(x, 99, w, 7);
    ctx.fillStyle = rage ? '#ff573d' : '#efad36'; ctx.fillRect(x, 99, w * Math.max(0, boss.hp / boss.maxHp), 7);
    ctx.restore();
}
