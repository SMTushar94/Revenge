(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const vexSprite=new Image();vexSprite.src='assets/vex-sprite.png';
const overlay=document.getElementById('overlay'),startBtn=document.getElementById('start'),coopBtn=document.getElementById('coop');
const W=1200,H=600,ground=500,keys={},pressed={};
const operatives={vex:{name:'VEX',color:'#d4ff48',speed:4.2,lives:3,fire:14,weapon:'VX-9 RIFLE'},rook:{name:'ROOK',color:'#ff9b5d',speed:3.2,lives:4,fire:11,weapon:'M80 HEAVY'},nova:{name:'NOVA',color:'#80ecff',speed:5,lives:2,fire:12,weapon:'KITE CARBINE'}};
const stages=[{name:'THE BREACH',sky:['#172c36','#34515a','#1a292c'],sun:'#f1a87b',length:1800,boss:'THE WARDEN'}, {name:'IRON FOUNDRY',sky:['#271e2b','#775042','#271b20'],sun:'#ffa45e',length:2100,boss:'THE FORGEMASTER'}, {name:'SIGNAL CORE',sky:['#15152e','#413858','#1d1c32'],sun:'#c99dff',length:2400,boss:'THE HOLLOW'}];
const threats={normal:{speed:1,rate:1,health:1},veteran:{speed:1.25,rate:.8,health:1.4},nightmare:{speed:1.5,rate:.62,health:1.8}};
const CITY_LENGTH=7200;
let stageIndex=0,threat=threats.normal; let state='menu',coop=false,players=[],bullets=[],enemies=[],particles=[],pickups=[],enemyBullets=[],frame=0,score=0,spawn=0,boss=null,camera=0,shake=0,blast=0,blastX=0,blastY=0;
const rnd=(a,b)=>Math.random()*(b-a)+a;
function reset(){stageIndex=Number(document.getElementById('stage').value);threat=threats[document.getElementById('difficulty').value];let profile=operatives[document.getElementById('operative').value];players=[makePlayer(180,profile,1)];if(coop)players.push(makePlayer(240,profile===operatives.rook?operatives.vex:operatives.rook,2));bullets=[];enemies=[];particles=[];pickups=[];enemyBullets=[];frame=0;score=0;spawn=50;boss=null;camera=0;blast=0;state='playing';overlay.classList.add('hidden')}
function makePlayer(x,profile,id){return{x,y:ground-50,vx:0,vy:0,color:profile.color,profile,id,dir:1,lives:profile.lives,bombs:3,inv:0,cool:0,spread:0,dead:false}}
function burst(x,y,color,n=10){for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-4,4),vy:rnd(-5,2),life:rnd(12,30),color})}
function shoot(p){if(p.cool>0)return;p.cool=p.spread>0?11:p.profile.fire;p.vx-=p.dir*.32;let angles=p.spread>0?[-.23,0,.23]:[0];angles.forEach(a=>bullets.push({x:p.x+p.dir*(p.profile.name==='VEX'?45:20),y:p.y+18,vx:Math.cos(a)*12*p.dir,vy:Math.sin(a)*12,life:100}));burst(p.x+p.dir*(p.profile.name==='VEX'?45:24),p.y+18,'#f1ffb0',3)}
function defeatBoss(){if(!boss)return;score+=5000;burst(boss.x,boss.y+70,'#d4ff48',70);boss=null;if(stageIndex<stages.length-1){stageIndex++;frame=0;camera=0;enemies=[];enemyBullets=[];bullets=[];pickups=[];players.forEach((p,i)=>{p.x=180+i*60;p.vx=0;p.inv=120})}else{state='win';showEnd(true)}}
function useBomb(p){if(state!=='playing'||!p||p.dead||p.bombs<=0)return;p.bombs--;blast=35;blastX=p.x;blastY=p.y+20;shake=20;for(const e of enemies){score+=100;burst(e.x,e.y+20,'#ffb878',14)}enemies=[];enemyBullets=[];burst(p.x,p.y+20,p.color,45);if(boss){boss.hp-=Math.ceil(boss.max*.3);burst(boss.x,boss.y+70,'#fff4ad',30);if(boss.hp<=0)defeatBoss()}}
function hitPlayer(p){if(p.inv||p.dead)return;p.lives--;p.inv=110;shake=12;burst(p.x,p.y+20,p.color,22);if(p.lives<=0)p.dead=true}
function update(){if(state!=='playing')return;frame++; if(shake>0)shake--;if(blast>0)blast--;if(pressed.KeyQ)useBomb(players[0]);if(pressed.KeyK)useBomb(players[1]);if(state!=='playing')return;
for(const p of players){if(p.dead)continue;let left=p.id===1?'KeyA':'ArrowLeft',right=p.id===1?'KeyD':'ArrowRight',jump=p.id===1?'KeyW':'ArrowUp',fire=p.id===1?'KeyF':'KeyL';if(keys[left]){p.vx-=.75;p.dir=-1}if(keys[right]){p.vx+=.75;p.dir=1}if(!keys[left]&&!keys[right])p.vx*=.78;p.vx=Math.max(-p.profile.speed,Math.min(p.profile.speed,p.vx));p.x+=p.vx;if((pressed[jump]||(p.id===1&&pressed.Space))&&p.y>=ground-50){p.vy=-13}p.vy+=.65;p.y=Math.min(ground-50,p.y+p.vy);if(p.y>=ground-50)p.vy=0;if(keys[fire])shoot(p);if(p.cool>0)p.cool--;if(p.inv>0)p.inv--;if(p.spread>0)p.spread--}
// Follow the leading living operative in screen space; shift all world entities
// by the same amount so collisions and co-op remain in one coordinate system.
const living=players.filter(p=>!p.dead);
if(living.length){
 const leader=Math.max(...living.map(p=>p.x));
 const desired=Math.max(0,Math.min(CITY_LENGTH-W,camera+leader-W*.42));
 const delta=desired-camera;camera=desired;
 if(delta){for(const group of [players,enemies,bullets,enemyBullets,pickups,particles])for(const entity of group)entity.x-=delta;if(boss)boss.x-=delta;blastX-=delta;}
 for(const p of players)p.x=Math.max(25,Math.min(W-25,p.x));
}
if(!boss){spawn--;if(spawn<=0){enemies.push({x:W+30,y:ground-42,hp:3,shot:rnd(50,120),speed:rnd(1.4,2.5)});spawn=Math.max(22,(75-frame/250)*threat.rate)}if(camera>=CITY_LENGTH-W-5){let hp=Math.round((70+stageIndex*30)*threat.health);boss={x:1050,y:ground-160,hp,max:hp,shot:60};enemies=[]}}
for(const e of enemies){e.x-=e.speed*threat.speed;e.shot--;if(e.shot<=0){e.shot=rnd(80,150);enemyBullets.push({x:e.x-15,y:e.y+16,vx:-5,vy:0})}for(const p of players)if(!p.dead&&Math.abs(e.x-p.x)<30&&Math.abs(e.y-p.y)<40)hitPlayer(p)}
if(boss){boss.shot--;boss.y=ground-160+Math.sin(frame/40)*15;if(boss.shot<=0){boss.shot=Math.round(45*threat.rate);for(let a=-.35;a<=.36;a+=.35)enemyBullets.push({x:boss.x-50,y:boss.y+60,vx:-5*Math.cos(a),vy:5*Math.sin(a)})}}
for(const b of bullets){b.x+=b.vx;b.y+=b.vy;b.life--;for(const e of enemies){if(e.hp>0&&Math.abs(b.x-e.x)<25&&Math.abs(b.y-(e.y+20))<27){e.hp--;b.life=0;burst(b.x,b.y,'#ffad72',5);if(e.hp<=0){score+=100;burst(e.x,e.y+20,'#ff8957',18);if(Math.random()<.2)pickups.push({x:e.x,y:ground-35})}break}}if(boss&&Math.abs(b.x-boss.x)<65&&Math.abs(b.y-(boss.y+70))<80){boss.hp--;b.life=0;burst(b.x,b.y,'#d4ff48',4);if(boss.hp<=0)defeatBoss()}}
for(const b of enemyBullets){b.x+=b.vx;b.y+=b.vy;for(const p of players)if(!p.dead&&Math.abs(b.x-p.x)<16&&Math.abs(b.y-(p.y+20))<24){hitPlayer(p);b.x=-100}}
for(const item of pickups){for(const p of players)if(!p.dead&&Math.abs(item.x-p.x)<28&&Math.abs(item.y-(p.y+20))<40){p.spread=900;item.x=-100;burst(p.x,p.y,'#7affef',15)}}
for(const pt of particles){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.12;pt.life--}bullets=bullets.filter(b=>b.life>0&&b.x>-30&&b.x<W+30);enemyBullets=enemyBullets.filter(b=>b.x>-30&&b.y>0&&b.y<H);enemies=enemies.filter(e=>e.x>-40&&e.hp>0);particles=particles.filter(p=>p.life>0);pickups=pickups.filter(p=>p.x>-30);if(players.every(p=>p.dead)){state='over';showEnd(false)}}
function showEnd(win){overlay.classList.remove('hidden');overlay.querySelector('.overline').innerHTML=win?'✦ &nbsp; TRANSMISSION COMPLETE &nbsp; ✦':'✦ &nbsp; TRANSMISSION LOST &nbsp; ✦';overlay.querySelector('h2').innerHTML=win?'SIGNAL<br><em>SILENCED.</em>':'THE FIGHT<br><em>ISN’T OVER.</em>';overlay.querySelector('p').innerHTML=win?'The HOLLOW is quiet. For now.<br>The city lives to see another dawn.':'The HOLLOW still controls the city.<br>Suit up and try again, operative.';startBtn.innerHTML='DEPLOY AGAIN <span>↗</span>';overlay.querySelector('.prompt').textContent='PRESS ENTER TO RESTART';}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function background(){let grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,stages[stageIndex].sky[0]);grad.addColorStop(.52,stages[stageIndex].sky[1]);grad.addColorStop(1,stages[stageIndex].sky[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);rect(0,290,W,110,'#c67b6250');ctx.fillStyle=stages[stageIndex].sun;ctx.beginPath();ctx.arc(900,165,65,0,Math.PI*2);ctx.fill();rect(820,164,170,8,'#48616a');rect(825,185,170,7,'#48616a');
// Deterministic, world-anchored skyline: revisiting a block shows the same buildings.
for(let layer=0;layer<2;layer++){
 const step=layer?110:155, parallax=layer?.55:.25, view=camera*parallax;
 const first=Math.floor(view/step)-1;
 for(let i=first;i<first+Math.ceil(W/step)+3;i++){
  const seed=(i+30)*73+layer*43,h=100+((seed*37)%130+130)%130,x=i*step-view,y=ground-h-(layer?15:90);
  rect(x,y,step-7,h+130,layer?'#182b30':'#263f46');rect(x+8,y-14,step-23,14,layer?'#182b30':'#263f46');
  for(let wx=12;wx<step-15;wx+=23)for(let wy=20;wy<h;wy+=27)if((wx*7+wy*3+seed)%5<2)rect(x+wx,y+wy,5,8,layer?'#dbb075':'#78908b');
 }
}
rect(0,ground,W,H-ground,'#192326');rect(0,ground,W,8,'#53635b');rect(0,ground+8,W,5,'#1a2423');
for(let x=-(camera%100);x<W;x+=100){rect(x,ground+30,65,3,'#35433d');rect(x+30,ground+70,4,8,'#687663')}rect(0,ground+90,W,10,'#101719');
// Distinct districts along the same continuous city route, fixed in world space.
const district=Math.min(2,Math.floor((camera+W*.5)/(CITY_LENGTH/3)));
for(let block=0;block<3;block++){
 const start=block*(CITY_LENGTH/3), end=start+CITY_LENGTH/3;
 for(let world=start+180;world<end;world+=480){
  const x=world-camera;if(x < -250 || x > W+250)continue;
  if(block===0){ // Street market: storefronts, awnings and neon signs.
   rect(x,ground-150,190,150,'#23332f');rect(x-8,ground-157,206,12,'#53685c');rect(x+15,ground-115,160,50,'#486059');rect(x+25,ground-106,65,30,'#d79d6d');rect(x+104,ground-106,60,30,'#789c91');rect(x+25,ground-140,105,14,'#d4ff48');rect(x+31,ground-136,65,5,'#35473e');rect(x-5,ground-64,200,8,'#aa6e55');
  }else if(block===1){ // Transit district: elevated rail and station columns.
   rect(x-30,ground-215,22,215,'#42504d');rect(x+180,ground-215,22,215,'#42504d');rect(x-75,ground-225,350,20,'#66756c');rect(x-75,ground-205,350,8,'#263936');rect(x+5,ground-195,145,50,'#273b3a');rect(x+15,ground-188,125,30,'#87a59b');rect(x+20,ground-145,115,8,'#d4ff48');
  }else{ // Waterfront: cranes, docks and industrial storage.
   rect(x+15,ground-240,12,240,'#59675f');rect(x-25,ground-245,190,12,'#687b70');rect(x+125,ground-233,5,80,'#a4b6a4');rect(x+100,ground-155,54,45,'#936e58');rect(x-40,ground-70,150,70,'#42554c');rect(x-32,ground-62,134,8,'#b98a61');rect(x-30,ground-45,10,35,'#708578');
  }
 }
}
ctx.fillStyle='#b5c7b5';ctx.font='bold 11px monospace';ctx.fillText(['OLD MARKET','TRANSIT DISTRICT','EAST WATERFRONT'][district],W-200,ground-18);
// industrial foreground details
for(let world=60;world<CITY_LENGTH;world+=850){let x=world-camera;if(x < -50 || x>W+50)continue;rect(x,ground-85,12,85,'#1c2a29');rect(x-15,ground-90,42,9,'#46554c');rect(x+10,ground-120,3,30,'#839287');rect(x+8,ground-126,8,8,'#d4ff48');}}
function player(p){
 if(p.dead||p.inv%6>=3)return;
 const walking=Math.abs(p.vx)>1&&p.y>=ground-50, stride=walking?Math.sin(frame*.22)*4:0;
 // Vex uses an original full-body sprite derived from the concept artwork.
 if(p.profile.name==='VEX' && vexSprite.complete && vexSprite.naturalWidth){
  ctx.save();ctx.translate(p.x,p.y+50);ctx.scale(p.dir,1);
  const height=96, width=height*vexSprite.naturalWidth/vexSprite.naturalHeight;
  const bob=walking?Math.abs(Math.sin(frame*.22))*2:0;
  ctx.drawImage(vexSprite,-width*.32,-height-bob,width,height);
  ctx.restore();return;
 }
 ctx.save();ctx.translate(p.x,p.y+50);ctx.scale(p.dir*1.28,1.28);
 // Layered, animated original operative silhouettes, anchored at the feet.
 rect(-13,-20,10,17,'#131e21');rect(3,-20,10,17,'#131e21');
 rect(-14,-14+stride,9,10,'#465a53');rect(4,-14-stride,9,10,'#465a53');
 rect(-16,-5+stride,13,5,'#222e2e');rect(4,-5-stride,14,5,'#222e2e');
 // Scarf and backpack.
 rect(-19,-37,8,19,'#1c302e');rect(-23,-36,7,8,p.color);rect(-25,-31,5,12,p.color);
 rect(-14,-39,27,21,'#344a43');rect(-11,-37,21,15,'#6e8370');rect(-12,-37,5,12,p.color);rect(-2,-34,11,8,'#283c36');rect(1,-32,6,2,p.color);
 rect(-14,-23,27,5,'#27332c');rect(-2,-23,5,5,'#d9b76b');
 // Face, hair and a distinctive visor/headgear.
 rect(-10,-54,19,17,'#b99276');rect(-11,-56,21,7,'#202d2b');rect(-13,-52,5,10,'#202d2b');
 if(p.profile.name==='ROOK'){rect(-13,-57,25,8,'#53665a');rect(-11,-59,19,3,'#889a81')}else if(p.profile.name==='NOVA'){rect(-14,-58,23,5,'#b8d4d2');rect(-15,-53,5,12,'#b8d4d2')}else{rect(-12,-59,19,5,'#202d2b');rect(-16,-56,8,10,'#202d2b')}
 rect(0,-50,10,4,p.color);rect(9,-49,3,3,'#e5f8d5');rect(-2,-41,12,4,p.color);
 // Shoulder, arms and rifle: stock, receiver, magazine and barrel.
 rect(-11,-37,8,12,'#8b9b82');rect(-7,-31,19,6,'#bd987a');rect(9,-32,6,6,'#303f38');
 rect(3,-35,11,5,'#79654c');rect(11,-37,18,8,'#1a2626');rect(15,-29,6,7,'#27352e');rect(28,-35,13,3,'#8a9c8c');rect(39,-36,4,5,'#d5dfc9');rect(14,-37,8,2,p.color);
 ctx.restore();
}
function enemy(e){let x=e.x,y=e.y;rect(x-11,y+27,8,15,'#10191b');rect(x+4,y+27,8,15,'#10191b');rect(x-15,y+9,30,22,'#673e3a');rect(x-12,y,24,14,'#242e30');rect(x-9,y+5,16,4,'#ff7652');rect(x-25,y+16,18,6,'#192326')}
function draw(){ctx.save();if(shake)ctx.translate(rnd(-shake/2,shake/2),rnd(-shake/2,shake/2));background();for(const item of pickups){rect(item.x-13,item.y-13,26,26,'#153d3a');rect(item.x-9,item.y-9,18,18,'#7affef');rect(item.x-3,item.y-7,6,14,'#173c3a')}for(const e of enemies)enemy(e);if(boss){let x=boss.x,y=boss.y;rect(x-65,y+35,130,100,'#283b39');rect(x-55,y,110,60,'#47574a');rect(x-42,y+15,84,35,'#172624');rect(x-28,y+25,56,12,'#ff7756');rect(x-85,y+65,45,20,'#61756a');rect(x-55,y+135,35,25,'#141f20');rect(x+20,y+135,35,25,'#141f20');rect(390,78,420,8,'#263a35');rect(390,78,420*boss.hp/boss.max,8,'#ff8b62');ctx.fillStyle='#e7eee2';ctx.font='bold 13px monospace';ctx.fillText(stages[stageIndex].boss,390,68)}for(const p of players)player(p);for(const b of bullets)rect(b.x,b.y,12,4,'#e2ff72');for(const b of enemyBullets)rect(b.x,b.y,9,6,'#ff8d69');for(const pt of particles)rect(pt.x,pt.y,4,4,pt.color);
if(blast>0){ctx.fillStyle='rgba(229,255,189,'+(blast/35*.4)+')';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(225,255,165,'+(blast/35)+')';ctx.lineWidth=8;ctx.beginPath();ctx.arc(blastX,blastY,(35-blast)*32,0,Math.PI*2);ctx.stroke()}
if(state!=='menu'){ctx.font='bold 15px monospace';ctx.fillStyle='#edf4dc';ctx.fillText('P1 '+players[0].profile.name+'  '+ '♥ '.repeat(Math.max(0,players[0].lives)),25,36);if(players[1]){ctx.fillStyle='#ffad7b';ctx.fillText('P2 '+players[1].profile.name+'  '+'♥ '.repeat(Math.max(0,players[1].lives)),25,59)}ctx.font='bold 12px monospace';ctx.fillStyle='#d4ff48';ctx.fillText('P1 PULSE [Q] '+players[0].bombs,25,83);if(players[1])ctx.fillText('P2 PULSE [K] '+players[1].bombs,25,101);ctx.font='bold 15px monospace';ctx.textAlign='right';ctx.fillStyle='#e4f1de';ctx.fillText('SCORE  '+String(score).padStart(6,'0'),W-25,36);ctx.fillStyle='#aabcaa';ctx.font='11px monospace';ctx.fillText(boss?'WARNING: '+stages[stageIndex].boss:stages[stageIndex].name+'  '+Math.min(100,Math.floor(camera/(CITY_LENGTH-W)*100))+'%',W-25,58);ctx.textAlign='left';if(state==='paused'){ctx.fillStyle='#0009';ctx.fillRect(0,0,W,H);ctx.fillStyle='#d4ff48';ctx.font='bold 48px monospace';ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px monospace';ctx.fillStyle='#fff';ctx.fillText('PRESS P TO RESUME',W/2,H/2+35);ctx.textAlign='left'}}ctx.restore()}
function loop(){update();draw();for(const k in pressed)delete pressed[k];requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;if(e.code==='Enter'&&(state==='menu'||state==='over'||state==='win'))reset();if(e.code==='KeyP'){if(state==='playing')state='paused';else if(state==='paused')state='playing'}});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(state==='playing')state='paused'});document.getElementById('back-to-deploy').addEventListener('click',()=>{state='menu';overlay.classList.remove('hidden');overlay.querySelector('.overline').innerHTML='✦ &nbsp; OPERATION: SIGNAL BREAKER &nbsp; ✦';overlay.querySelector('h2').innerHTML='THE CITY<br>IS <em>CALLING.</em>';overlay.querySelector('p').innerHTML='The HOLLOW has taken the skyline. Two operatives.<br>One last shot at taking it back.';startBtn.innerHTML='DEPLOY NOW <span>↗</span>';overlay.querySelector('.prompt').textContent='PRESS ENTER TO START / SELECT CO-OP BEFORE DEPLOYING';window.scrollTo({top:0,behavior:'smooth'})});document.getElementById('pulse').addEventListener('click',()=>useBomb(players[0]));startBtn.addEventListener('click',reset);coopBtn.addEventListener('click',()=>{coop=!coop;coopBtn.classList.toggle('selected',coop);coopBtn.textContent=coop?'✓ PLAYER 2 ADDED':'+ ADD PLAYER 2'});loop();
})();
