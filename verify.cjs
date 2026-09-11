// Development-only browser verification; no npm/app dependency is introduced.
// NODE_PATH must point to an existing Playwright installation. Serve the repo first.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const root = path.resolve(__dirname, '..');
const out = process.env.TEST_OUTPUT || path.join(root, 'tests/results');
fs.mkdirSync(out, {recursive:true});
const url = process.env.GAME_URL || 'http://127.0.0.1:8766';
const results = { checks: [], errors: [] };
function check(name, pass, detail='') {
    results.checks.push({name,pass:!!pass,detail});
    if (!pass) console.error('FAIL', name, detail);
}
(async()=>{
const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {})});
try {
const context = await browser.newContext({viewport:{width:1280,height:800}});
const page = await context.newPage();
page.on('pageerror', e=>results.errors.push(String(e)));
// Keep actual production functions, but manually step the normal 60 Hz update for reproducibility.
await page.addInitScript(()=>{ window.requestAnimationFrame = ()=>0; });
await page.goto(url); await page.waitForFunction(()=>!document.querySelector('#start-btn').disabled,null,{polling:50});
const baseline = execFileSync('git',['show','34572db29d4e628d66e34051ef816ad6a29ecf73:index.html'],{cwd:root,encoding:'utf8'});
const current = fs.readFileSync(path.join(root,'index.html'),'utf8');
const timeline = s=>s.match(/const stageEvents = \[[\s\S]*?\n    \];/)[0].replace(/\r/g,'');
check('Original Phase 1A event timeline is byte-equivalent',timeline(baseline)===timeline(current));
check('太空牛 title and both mode buttons',await page.title()==='太空牛 · Tangniu UFO' && await page.locator('#endless-btn').isEnabled());
await page.evaluate(()=>draw()); await page.screenshot({path:path.join(out,'menu.png')});
await page.click('#start-btn');
const logic = await page.evaluate(()=>{
    soundEnabled=false;
    let seed=123456789; Math.random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
    const checks=[]; const ok=(name,pass,detail='')=>checks.push({name,pass:!!pass,detail});
    const steps=n=>{for(let i=0;i<n;i++)update();};
    const reset=mode=>{startGame(mode);player.invincible=1000000;};
    ok('All five gameplay images loaded',Object.values(sprites).every(i=>i.complete && i.naturalWidth>0));
    ok('Nearest-neighbor canvas rendering',ctx.imageSmoothingEnabled===false);
    ok('Player collision remains 50 × 40',player.width===50 && player.height===40);
    for(const [key,axis,sign] of [['KeyW','y',-1],['KeyS','y',1],['KeyA','x',-1],['KeyD','x',1],['ArrowUp','y',-1],['ArrowDown','y',1],['ArrowLeft','x',-1],['ArrowRight','x',1]]){
        reset('stage');const v=player[axis];keys[key]=true;update();
        ok(key+' movement',Math.abs(player[axis]-v-sign*5)<1e-8);
    }
    reset('stage');let x=player.x,y=player.y;keys.KeyW=keys.KeyD=true;update();
    ok('Normalized diagonal movement',Math.abs(Math.hypot(player.x-x,player.y-y)-5)<1e-8);
    ok('Moving UFO state',player.state==='moving');
    reset('stage');update();ok('Idle UFO state',player.state==='idle');
    for(const level of [1,2,3]){
        reset('stage');player.weaponLevel=level;keys.Space=true;update();
        ok('Weapon '+level+' shoots forward',game.bullets.length===level && game.bullets.every(b=>b.speed>0));
        ok('Shooting UFO state '+level,player.state==='shooting');
    }
    reset('stage');player.invincible=0;takeDamage(10);ok('Hit flash state and damage',player.state==='hit' && player.hitTimer===18 && game.health===90);
    game.enemyBullets=[{x:player.x,y:player.y,vx:0,vy:0},{x:player.x,y:player.y,vx:0,vy:0}];
    player.invincible=0;update();ok('One hit per invulnerability window',game.health===80);
    reset('stage');keys.KeyD=keys.KeyS=true;steps(1000);let bounds=getGameplayBounds();
    ok('Movement clamps at gameplay bounds',player.x===bounds.maxX && player.y===bounds.maxY);
    reset('stage');
    const seen=new Set();let warning=false,phase2=false;
    // Full original script, real player shots/real collisions. Invulnerability isolates progression.
    keys.Space=true;
    for(let i=0;i<14400 && game.running;i++){
        const target=game.enemies.filter(e=>e.x<canvas.width).sort((a,b)=>a.x-b.x)[0];
        if(target) { keys.KeyS=target.y>player.y+3;keys.KeyW=target.y<player.y-3; }
        else {keys.KeyW=keys.KeyS=false;}
        update();game.enemies.forEach(e=>{seen.add(e.type);if(e.type==='boss'&&e.phase===2)phase2=true;});
        warning ||= game.bossWarningTimer>0;
    }
    ok('Original sections A/B/C introduce basic, fast and tank', ['basic','fast','tank'].every(t=>seen.has(t)));
    ok('Boss warning then Niu Lai Prime appears',warning && seen.has('boss'));
    ok('Boss phase 2 reached through real bullet collisions',phase2);
    ok('Boss defeated and STAGE 1 COMPLETE shown',game.stageComplete && !game.running && document.querySelector('#stage-complete-screen').style.display==='flex',`time=${game.stageTime.toFixed(2)}, score=${game.score}`);
    const stageResult={time:game.stageTime,score:game.score,phase2};
    reset('stage');ok('Restart Stage clears progression/entities',game.stageTime===0 && game.stageEventIndex===0 && game.enemies.length===0 && game.score===0 && !game.stageComplete);
    for(const [type,hp,speed,rate] of [['basic',1,1.7,120],['fast',1,3.3,200],['tank',4,1.1,80]]){
        spawnEnemy(type,0.5,0);let e=game.enemies.at(-1);
        ok(type+' original HP/movement/fire rate',e.hp===hp && e.speed===speed && e.fireRate===rate);
    }
    reset('stage');spawnBoss();let boss=game.enemies[0];boss.x=boss.targetX;boss.fireTimer=0;boss.shots=2;
    update();ok('Phase 1 aimed three-way spread',game.enemyBullets.length===3 && boss.fireTimer===40);
    const spreadAngle=(a,b)=>Math.acos(Math.min(1,Math.max(-1,(a.vx*b.vx+a.vy*b.vy)/(Math.hypot(a.vx,a.vy)*Math.hypot(b.vx,b.vy)))));
    let spread1=spreadAngle(game.enemyBullets[1],game.enemyBullets[0]);
    boss.hp=25;update();ok('50% HP stays phase 1',boss.phase===1);
    boss.hp=24;boss.fireTimer=0;boss.shots=2;game.enemyBullets=[];let motion=boss.motionTime;update();
    let spread2=spreadAngle(game.enemyBullets[1],game.enemyBullets[0]);
    ok('Phase 2 below 50%, faster movement/fire, wider spread',boss.phase===2 && boss.fireTimer===32 && boss.motionTime-motion===1.25 && spread2>spread1);
    reset('endless');ok('Endless starts Wave 1 separately',game.mode==='endless' && game.wave===1 && game.stageEventIndex===0);
    const d1=endlessDifficulty(1), d4=endlessDifficulty(4), dc=endlessDifficulty(1e9);
    ok('Difficulty increases and caps',d4.interval<d1.interval && dc.interval===32 && dc.speed===1.65 && dc.hp===3 && dc.fire===0.65 && dc.tankChance===0.4);
    for(const wave of [5,10,1000000]){
        reset('endless');beginWave(wave);steps(180);let e=game.enemies.find(e=>e.type==='boss');
        ok('Boss wave '+wave+' with capped HP',!!e && e.hp===Math.round(50*Math.min(3,1+(Math.floor(wave/5)-1)*0.25)),`hp=${e?.hp}`);
    }
    reset('endless');beginWave(5);steps(180);boss=game.enemies.find(e=>e.type==='boss');boss.x=boss.targetX;
    game.bullets.push({x:boss.x-10,y:boss.y,speed:10,damage:boss.hp});update();
    ok('Endless boss awards score, shows WAVE CLEARED, keeps running',game.running && !game.stageComplete && game.score===2000 && game.waveClearTimer===150 && game.banner==='WAVE CLEARED');
    steps(150);ok('Endless continues to Wave 6 without resetting score',game.wave===6 && game.score===2000 && game.running);
    // Isolate persistence assertions from the millionth-wave cap test above.
    records={score:0,wave:0};localStorage.clear();
    game.score=9876;game.wave=12;updateHUD();player.invincible=0;game.health=10;game.lives=1;takeDamage(10);
    ok('Endless game over and destroyed UFO',!game.running && player.state==='destroyed' && document.querySelector('#game-over-screen').style.display==='flex');
    ok('Destruction particles emitted',game.particles.length>=40);
    ok('High score and best wave persisted',localStorage.getItem('tangniu_high_score')==='9876' && localStorage.getItem('tangniu_high_wave')==='12');
    ok('Game over displays score/high score/wave/best wave',document.querySelector('#final-score').textContent==='9876' && document.querySelector('#final-level').textContent==='12' && document.querySelector('#endless-summary').textContent.includes('9876') && document.querySelector('#endless-summary').textContent.includes('12'));
    document.querySelector('#restart-btn').click();ok('Retry retains Endless mode and resets run',game.mode==='endless'&&game.running&&game.score===0&&game.wave===1);
    mainMenu();ok('Main Menu returns to both mode choices',!game.running && document.querySelector('#start-screen').style.display==='flex' && game.enemies.length===0);
    reset('endless');
    // 20 minutes at 60 updates/sec. Lv3 tracking bot uses real projectiles, no instant boss kills.
    // Invulnerability avoids ending endurance test; not a human difficulty/balance claim.
    keys.Space=true;player.weaponLevel=3;
    const max={enemies:0,bullets:0,enemyBullets:0,particles:0,powerups:0,projectiles:0};
    const waveBosses=[], windows=[];let lastBoss=null;
    for(let i=0;i<72000;i++){
        const target=game.enemies.filter(e=>e.x<canvas.width).sort((a,b)=>a.x-b.x)[0];
        if(target){keys.KeyS=target.y>player.y+3;keys.KeyW=target.y<player.y-3;}
        else {keys.KeyW=keys.KeyS=false;}
        player.invincible=1000000;
        update();
        for(const name of Object.keys(ENTITY_LIMITS))max[name]=Math.max(max[name],game[name].length);
        max.projectiles=Math.max(max.projectiles,game.bullets.length+game.enemyBullets.length);
        const b=game.enemies.find(e=>e.type==='boss');
        if(b && b!==lastBoss){waveBosses.push(game.wave);lastBoss=b;}
        if(i%3600===3599)windows.push({minute:(i+1)/3600,wave:game.wave,objects:Object.keys(ENTITY_LIMITS).reduce((n,k)=>n+game[k].length,0)});
    }
    ok('20-minute simulation finishes still running',game.running && game.stageTime>1199.99 && !game.stageComplete);
    ok('Multiple Endless bosses only every fifth wave',waveBosses.length>=5 && waveBosses.every((w,i)=>w===(i+1)*5),JSON.stringify(waveBosses));
    ok('All entity counts remain below safety caps',Object.keys(ENTITY_LIMITS).every(k=>max[k]<ENTITY_LIMITS[k]),JSON.stringify(max));
    const endurance={seconds:game.stageTime,wave:game.wave,score:game.score,max,waveBosses,windows};
    // Upper difficulty, no kills: ensure inactive/offscreen objects drain without a boss kill.
    reset('endless');beginWave(99);const stalledMax={};
    for(let i=0;i<72000;i++){player.invincible=1000000;update();for(const k of Object.keys(ENTITY_LIMITS))stalledMax[k]=Math.max(stalledMax[k]||0,game[k].length);}
    ok('20-minute no-fire capped-difficulty soak remains bounded',game.running && Object.keys(ENTITY_LIMITS).every(k=>stalledMax[k]<ENTITY_LIMITS[k]),JSON.stringify(stalledMax));
    reset('endless');
    game.enemyBullets=[{x:200,y:-11,vx:0,vy:-3},{x:-11,y:100,vx:-3,vy:0}];
    game.bullets=[{x:canvas.width+20,y:100,speed:10},{x:100,y:-20,speed:10}];
    game.enemies=[{type:'basic',hp:0,x:100,y:100,speed:1,time:0,fireTimer:99,width:30,height:36}];
    game.powerups=[{x:-30,y:100,speed:2,time:0}];game.particles=[{x:100,y:100,vx:0,vy:0,life:0.001,decay:0.02}];update();
    ok('Dead/offscreen enemies, both projectile arrays, particles and pickups cleaned',Object.keys(ENTITY_LIMITS).every(k=>game[k].length===0));
    for(const [k,cap] of Object.entries(ENTITY_LIMITS))game[k]=Array.from({length:cap+20},()=>({x:100,y:100,hp:1,life:1}));
    cleanupEntities();ok('Hard caps defend every entity collection',Object.entries(ENTITY_LIMITS).every(([k,cap])=>game[k].length===cap));
    reset('endless');beginWave(5);spawnBoss();game.bossSpawned=true;boss=game.enemies[0];boss.x=boss.targetX;boss.hp=24;update();draw();
    return {checks,stageResult,endurance,stalledMax};
});
results.checks.push(...logic.checks);results.stage=logic.stageResult;results.endurance=logic.endurance;results.noFireSoak=logic.stalledMax;
await page.screenshot({path:path.join(out,'boss-rage.png')});
await page.reload();await page.waitForFunction(()=>!document.querySelector('#endless-btn').disabled,null,{polling:50});
check('Records survive page reload',await page.locator('#records').innerText().then(t=>!t.includes('BEST  0')));
await page.click('#endless-btn');
check('Real Endless menu button selects mode',await page.evaluate(()=>game.mode==='endless'&&game.running));
await page.evaluate(()=>{soundEnabled=false;game.health=10;game.lives=1;player.invincible=0;takeDamage(10);draw();});
await page.screenshot({path:path.join(out,'endless-game-over.png')});
await page.click('#restart-btn');check('Real Retry button restarts Endless',await page.evaluate(()=>game.running && game.wave===1 && game.score===0 && game.mode==='endless'));
await page.evaluate(()=>gameOver());await page.click('#menu-btn');
check('Real Main Menu button works',await page.locator('#start-btn').isVisible());

// Browser touch events through CDP exercise independent pointer capture and multi-touch.
const mobile = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
const mp=await mobile.newPage();mp.on('pageerror',e=>results.errors.push(String(e)));
await mp.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
await mp.goto(url);await mp.waitForFunction(()=>!document.querySelector('#endless-btn').disabled,null,{polling:50});
await mp.locator('#endless-btn').tap();await mp.evaluate(()=>{soundEnabled=false;draw();});
check('Mobile mode selection',await mp.evaluate(()=>game.mode==='endless'&&game.running));
const cdp=await mobile.newCDPSession(mp);
const point=async(id,n)=>{const b=await mp.locator(id).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2,id:n};};
for(const [id,key,axis,sign] of [['#up-btn','up','y',-1],['#down-btn','down','y',1],['#left-btn','left','x',-1],['#right-btn','right','x',1]]){
    const pt=await point(id,1);const v=await mp.evaluate(axis=>player[axis],axis);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt]});
    await mp.evaluate(()=>update());const after=await mp.evaluate(axis=>player[axis],axis);
    check('Mobile '+key+' touch moves correctly',Math.abs(after-v-sign*5)<1e-8);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
let a=await point('#up-btn',1),b=await point('#right-btn',2),c=await point('#fire-btn',3);
let before=await mp.evaluate(()=>({x:player.x,y:player.y}));
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b,c]});
let state=await mp.evaluate(()=>{update();draw();return{x:player.x,y:player.y,fired:game.bullets.length,up:mobileUp,right:mobileRight,fire:mobileFire};});
check('Three simultaneous touches: normalized diagonal + Fire',state.up&&state.right&&state.fire&&state.fired>0&&Math.abs(Math.hypot(state.x-before.x,state.y-before.y)-5)<1e-8);
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});
const releaseState=await mp.evaluate(()=>({up:mobileUp,right:mobileRight,fire:mobileFire}));
check('Releasing one touch preserves other controls',releaseState.up&&!releaseState.right&&releaseState.fire,JSON.stringify(releaseState));
await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
check('Touch cancel clears controls',await mp.evaluate(()=>!mobileUp&&!mobileRight&&!mobileFire));
// Swipe anywhere in playfield while holding Fire.
c=await point('#fire-btn',3);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:300,id:4},c]});
before=await mp.evaluate(()=>({x:player.x,y:player.y}));
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:312,id:4},c]});
state=await mp.evaluate(()=>({x:player.x,y:player.y,fire:mobileFire}));
check('Canvas two-axis swipe coexists with Fire',state.x===before.x+10&&state.y===before.y+12&&state.fire);
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
for(const [name,viewport] of [['portrait',{width:390,height:844}],['landscape',{width:844,height:390}],['small-portrait',{width:320,height:568}]]){
    await mp.setViewportSize(viewport);await mp.waitForFunction(()=>canvas.width===innerWidth&&canvas.height===innerHeight,null,{polling:50});
    await mp.evaluate(()=>{player.invincible=0;update();draw();});
    const layout=await mp.evaluate(()=>{
        const ids=['#hud .status','#hud .stage','#hud .score','#sound-toggle'];
        const rects=ids.map(id=>{const r=document.querySelector(id).getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
        const controls=document.querySelector('#mobile-controls').getBoundingClientRect();
        return {rects,width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth,
            touch:getComputedStyle(document.body).touchAction,bounds:getGameplayBounds(),controlsTop:controls.top};
    });
    check('Mobile '+name+' HUD fits without overlap',layout.rects.every(r=>r.left>=0&&r.right<=layout.width)&&layout.rects.every((r,i)=>i===0||r.left>=layout.rects[i-1].right));
    check('Mobile '+name+' no scrolling; controls below playfield',!layout.scroll&&layout.touch==='none'&&layout.bounds.maxY+28<=layout.controlsTop,JSON.stringify(layout));
    await mp.screenshot({path:path.join(out,'mobile-'+name+'.png')});
}

const blocked=await browser.newContext();const bp=await blocked.newPage();
await bp.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
await bp.goto(url);await bp.waitForFunction(()=>!document.querySelector('#endless-btn').disabled,null,{polling:50});await bp.click('#endless-btn');
check('Blocked storage degrades to session records and game remains playable',await bp.evaluate(()=>game.running&&!storageAvailable&&document.querySelector('#storage-note').textContent.includes('session')));
check('No uncaught browser errors',results.errors.length===0,JSON.stringify(results.errors));
} finally { await browser.close(); }
results.passed=results.checks.filter(t=>t.pass).length;results.failed=results.checks.length-results.passed;
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
process.exitCode=results.failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
