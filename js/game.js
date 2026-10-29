let coins=55,level=1,xp=0,power=0,armor=0,heals=0;
let enemy={name:'Glitch-Gegner',hp:50,max:50,damage:8,reward:20},playerHP=100,playerMax=100,battleActive=false;
const $=id=>document.getElementById(id);
let playerX=82,playerY=350;
function save(){const data={version:1,coins,level,xp,power,armor,heals,playerHP,playerMax,playerX,playerY};try{localStorage.setItem('fwSave',JSON.stringify(data));for(const [k,v] of Object.entries(data))localStorage.setItem('fw'+k[0].toUpperCase()+k.slice(1),String(v))}catch(e){} }
function load(){loadGame(false)}
function loadGame(notify=true){try{const d=JSON.parse(localStorage.getItem('fwSave')||'null');if(d)applySave(d);else{coins=+(localStorage.getItem('fwCoins')??55);level=+(localStorage.getItem('fwLevel')??1);xp=+(localStorage.getItem('fwXP')??0);power=+(localStorage.getItem('fwPower')??0);armor=+(localStorage.getItem('fwArmor')??0);heals=+(localStorage.getItem('fwHeals')??0)}}catch(e){}update();drawMap();if(notify)alert('Spielstand geladen.')}
function applySave(d){for(const k of ['coins','level','xp','power','armor','heals','playerHP','playerMax','playerX','playerY'])if(Number.isFinite(+d[k])){const v=+d[k];if(k==='coins')coins=v;else if(k==='level')level=v;else if(k==='xp')xp=v;else if(k==='power')power=v;else if(k==='armor')armor=v;else if(k==='heals')heals=v;else if(k==='playerHP')playerHP=v;else if(k==='playerMax')playerMax=v;else if(k==='playerX')playerX=v;else if(k==='playerY')playerY=v}playerX=Math.max(24,Math.min(696,playerX));playerY=Math.max(24,Math.min(416,playerY))}
function saveGame(){save();alert('Spielstand gespeichert!')}
function exportSave(){save();const blob=new Blob([JSON.stringify({version:1,coins,level,xp,power,armor,heals,playerHP,playerMax,playerX,playerY},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fazbear-spielstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importSave(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Number.isFinite(+d.coins)||!Number.isFinite(+d.level))throw 0;applySave(d);save();update();drawMap();alert('Spielstand importiert!')}catch(_){alert('Diese Datei ist kein gültiger Spielstand.')}e.target.value=''};r.readAsText(f)}
function save(){try{for(const k of ['coins','level','xp','power','armor','heals'])localStorage.setItem('fw'+k[0].toUpperCase()+k.slice(1),eval(k))}catch(e){}}
function update(){['coins','shopCoins'].forEach(id=>$(id).textContent=coins);$('lvl').textContent=level;$('power').textContent=power;$('armor').textContent=armor;$('healCount').textContent=heals}
function show(id){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));$(id).classList.add('active');update()}
function reward(n){coins+=n;xp+=n;while(xp>=100){xp-=100;level++;playerMax+=5;playerHP=Math.min(playerMax,playerHP+10)}save();update()}
function buy(kind,cost){if(coins<cost){$('shopStatus').textContent='Nicht genug FazCoins!';return}coins-=cost;if(kind==='power')power++;if(kind==='armor')armor++;if(kind==='heal')heals++;save();update();$('shopStatus').textContent='Gekauft! Deine Ausrüstung wurde verbessert.'}
function startBattle(name='👾 Glitch-Gegner',hp=50,damage=8,rew=20){enemy={name,hp,max:hp,damage,reward:rew};playerHP=playerMax;battleActive=true;$('enemyName').textContent=name;$('enemyEmoji').textContent=name.includes('Wald')?'🌲':name.includes('Fabrik')?'🤖':name.includes('See')?'🦠':name.includes('Ritter')?'🏰':'👾';$('battleStatus').textContent='Der Kampf beginnt!';updateBattle();show('kampf')}
function updateBattle(){$('enemyHpText').textContent=Math.max(0,enemy.hp)+' / '+enemy.max;$('enemyBar').style.width=(Math.max(0,enemy.hp)/enemy.max*100)+'%';$('playerHpText').textContent=Math.max(0,playerHP)+' / '+playerMax;$('playerBar').style.width=(Math.max(0,playerHP)/playerMax*100)+'%';update()}
function attack(type){if(!battleActive)return;let base={normal:9,pizza:13,cheese:11,bonnie:15,foxy:18}[type];let hit=Math.max(1,base+power*3+Math.floor(Math.random()*7)-2);if(type==='foxy'&&Math.random()<.25){hit=Math.floor(hit/2);$('battleStatus').textContent='Foxy-Sturm verfehlt teilweise! '}else $('battleStatus').textContent='Dein Team verursacht '+hit+' Schaden! ';enemy.hp-=hit;if(enemy.hp<=0){finishBattle();return}enemyTurn();updateBattle()}
function enemyTurn(){let hit=Math.max(1,enemy.damage+Math.floor(Math.random()*5)-armor*2);playerHP-=hit;$('battleStatus').textContent+=' Gegner kontert und verursacht '+hit+' Schaden.';if(playerHP<=0){playerHP=0;battleActive=false;show('gameover')} }
function useHeal(){if(!battleActive)return;if(heals<=0){$('battleStatus').textContent='Keine Heilungen mehr! Kaufe welche im Shop.';return}heals--;let amount=35;playerHP=Math.min(playerMax,playerHP+amount);$('battleStatus').textContent='Team heilt '+amount+' HP.';enemyTurn();save();updateBattle()}
function finishBattle(){battleActive=false;reward(enemy.reward);$('winText').textContent='Du hast '+enemy.name+' besiegt und '+enemy.reward+' FazCoins erhalten!';show('kampfgewinn')}
function miniReward(n,msg){$('miniStatus').textContent=msg+' +'+n+' FazCoins!';reward(n)}
let pizzaTarget=0,pizzaRound=0,beatSeq=[],beatStep=0,treasureTarget=0,treasureTries=0;
function startPizza(){show('minigames');pizzaRound=1;newPizzaRound()}
function newPizzaRound(){pizzaTarget=Math.floor(Math.random()*6);$('miniStatus').textContent='Runde '+pizzaRound+'/3: Finde die Pizza!';$('miniArea').innerHTML='<div class="grid">'+Array.from({length:6},(_,i)=>`<button class="btn" data-action="pick-pizza" data-index="${i}">${i===pizzaTarget?'❓':'🍔'}</button>`).join('')+'</div>'}
function pickPizza(i){if(i!==pizzaTarget){$('miniStatus').textContent='Falsch! Versuch die Runde erneut.';return}if(pizzaRound<3){pizzaRound++;newPizzaRound()}else{$('miniArea').innerHTML='';miniReward(30,'Alle drei Pizzen gefunden!')}}
function startBeat(){show('minigames');beatSeq=Array.from({length:5},()=>['⬅️','⬆️','➡️','⬇️'][Math.floor(Math.random()*4)]);beatStep=0;renderBeat()}
function renderBeat(){$('miniStatus').textContent='Merke dir die Folge mit 5 Pfeilen und tippe sie in der richtigen Reihenfolge.';$('miniArea').innerHTML='<div class="card beat-sequence">'+beatSeq.join(' ')+'</div><p>Wenn du bereit bist, starte die Eingabe:</p><button class="btn" data-action="begin-beat">🎸 Folge eingeben</button>'}
function beginBeat(){$('miniStatus').textContent='Pfeil '+(beatStep+1)+' von '+beatSeq.length;$('miniArea').innerHTML='<div class="grid">'+['⬅️','⬆️','➡️','⬇️'].map(x=>`<button class="btn" data-action="tap-beat" data-value="${x}">${x}</button>`).join('')+'</div>'}
function tapBeat(x){if(x!==beatSeq[beatStep]){beatStep=0;$('miniStatus').textContent='Falscher Pfeil! Die Folge wurde zurückgesetzt.';return}beatStep++;if(beatStep===beatSeq.length){$('miniArea').innerHTML='';miniReward(40,'Perfekter Beat!')}else $('miniStatus').textContent='Richtig! Noch '+(beatSeq.length-beatStep)+' Pfeile.'}
function startTreasure(){show('minigames');treasureTarget=Math.floor(Math.random()*9);treasureTries=3;$('miniStatus').textContent='Finde die Schatzkiste! Du hast 3 Versuche.';renderTreasure()}
function renderTreasure(){$('miniArea').innerHTML='<div class="grid">'+Array.from({length:9},(_,i)=>`<button class="btn" data-action="pick-treasure" data-index="${i}">📦</button>`).join('')+'</div>'}
function pickTreasure(i,el){if(i===treasureTarget){$('miniArea').innerHTML='';miniReward(35,'Schatz gefunden!');return}treasureTries--;el.textContent='🕳️';el.disabled=true;if(treasureTries<=0){$('miniStatus').textContent='Leider leer! Der Schatz war woanders.';$('miniArea').innerHTML+='<button class="btn" data-action="start-treasure">🔄 Nochmal versuchen</button>'}else $('miniStatus').textContent='Leer! Noch '+treasureTries+' Versuche.'}
function resetGame(){if(confirm('Spielstand wirklich zurücksetzen?')){try{['fwCoins','fwLevel','fwXP','fwPower','fwArmor','fwHeals'].forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()}}
const mapEntrances=[
 {x:114,y:104,label:'Dorf',icon:'🏠',action:()=>show('dorf'),r:32},
 {x:283,y:95,label:'Wald-Kampf',icon:'🌲',action:()=>startBattle('🌲 Wald-Kobold',45,8,20),r:34},
 {x:483,y:96,label:'Shop',icon:'🛒',action:()=>show('shop'),r:34},
 {x:620,y:226,label:'Minispiele',icon:'🎪',action:()=>show('minigames'),r:38},
 {x:421,y:320,label:'Fabrik-Kampf',icon:'🏭',action:()=>startBattle('🏭 Fabrik-Drohne',65,11,30),r:36},
 {x:209,y:332,label:'See-Kampf',icon:'🌊',action:()=>startBattle('🌊 See-Schleim',55,9,25),r:34},
 {x:578,y:362,label:'Schloss-Kampf',icon:'🏰',action:()=>startBattle('🏰 Glitch-Ritter',90,14,45),r:38}
];
const walls=[{x:0,y:0,w:720,h:22},{x:0,y:418,w:720,h:22},{x:0,y:0,w:22,h:440},{x:698,y:0,w:22,h:440},
 // Einzelne Gebäude und Felsen lassen mehrere freie Wege über die Karte offen.
 {x:173,y:143,w:48,h:34},{x:355,y:76,w:42,h:48},{x:491,y:294,w:50,h:38},
 {x:253,y:260,w:38,h:34},{x:74,y:172,w:36,h:30},{x:427,y:160,w:36,h:30},
 {x:632,y:126,w:28,h:42},{x:328,y:353,w:52,h:27},{x:146,y:283,w:24,h:28}];
function drawMap(){const c=$('worldMap');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,720,440);ctx.fillStyle='#31533c';ctx.fillRect(0,0,720,440);ctx.fillStyle='#466b48';for(let y=35;y<420;y+=36)for(let x=32;x<690;x+=42){ctx.beginPath();ctx.arc(x+(y%3)*3,y,2,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#897451';ctx.fillRect(23,178,674,28);ctx.fillRect(166,23,28,395);ctx.fillRect(369,23,28,395);ctx.fillRect(552,23,28,395);ctx.fillRect(23,237,674,28);ctx.fillStyle='#34394c';walls.slice(4).forEach(w=>{ctx.fillRect(w.x,w.y,w.w,w.h);ctx.strokeStyle='#66708a';ctx.strokeRect(w.x,w.y,w.w,w.h)});mapEntrances.forEach(p=>{ctx.beginPath();ctx.fillStyle='#e1b94b';ctx.globalAlpha=.35;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='25px Arial';ctx.textAlign='center';ctx.fillText(p.icon,p.x,p.y+8);ctx.font='bold 12px Arial';ctx.fillText(p.label,p.x,p.y+p.r+14)});ctx.beginPath();ctx.fillStyle='#ff5268';ctx.arc(playerX,playerY,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 12px Arial';ctx.fillText('YOU',playerX,playerY-17)}
function collides(x,y){return walls.some(w=>x+10>w.x&&x-10<w.x+w.w&&y+10>w.y&&y-10<w.y+w.h)}
function movePlayer(dx,dy){let nx=playerX+dx,ny=playerY+dy;if(!collides(nx,playerY))playerX=nx;if(!collides(playerX,ny))playerY=ny;drawMap();save()}
function interact(){let p=mapEntrances.find(q=>Math.hypot(playerX-q.x,playerY-q.y)<q.r+20);if(p){p.action()}else{const p2=mapEntrances.slice().sort((a,b)=>Math.hypot(playerX-a.x,playerY-a.y)-Math.hypot(playerX-b.x,playerY-b.y))[0];$('karte').querySelector('.maphint').textContent='Kein Eingang in Reichweite. Nächster Ort: '+p2.label+'. Gehe näher heran.'}}
function enterMapPoint(x,y){const p=mapEntrances.find(q=>Math.hypot(x-q.x,y-q.y)<q.r+8);if(p){playerX=x;playerY=y;drawMap();p.action()}}
window.addEventListener('keydown',e=>{if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','e','Enter'].includes(e.key)){if($('karte').classList.contains('active'))e.preventDefault()}const k=e.key.toLowerCase();if(k==='e'||k==='enter'){if($('karte').classList.contains('active'))interact();return}const d={w:[0,-9],arrowup:[0,-9],s:[0,9],arrowdown:[0,9],a:[-9,0],arrowleft:[-9,0],d:[9,0],arrowright:[9,0]}[k];if(d&&$('karte').classList.contains('active'))movePlayer(...d)});
document.querySelectorAll('[data-dir]').forEach(b=>{let timer;const move=()=>{const d={up:[0,-9],down:[0,9],left:[-9,0],right:[9,0]}[b.dataset.dir];if($('karte').classList.contains('active'))movePlayer(...d)};b.addEventListener('pointerdown',e=>{e.preventDefault();move();timer=setInterval(move,90)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>clearInterval(timer)))});
$('worldMap').addEventListener('pointerdown',e=>{const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*720/r.width,y=(e.clientY-r.top)*440/r.height;enterMapPoint(x,y)});

document.addEventListener('click', event => {
 const button=event.target.closest('[data-action]');
 if(!button)return;
 switch(button.dataset.action){
  case 'save-game':saveGame();break;
  case 'load-game':loadGame();break;
  case 'export-save':exportSave();break;
  case 'open-save-file':$('saveFile').click();break;
  case 'show':show(button.dataset.target);break;
  case 'start-battle':
   if(button.hasAttribute('data-name'))startBattle(button.dataset.name,Number(button.dataset.hp),Number(button.dataset.damage),Number(button.dataset.reward));
   else startBattle();
   break;
  case 'interact':interact();break;
  case 'attack':attack(button.dataset.type);break;
  case 'use-heal':useHeal();break;
  case 'start-pizza':startPizza();break;
  case 'pick-pizza':pickPizza(Number(button.dataset.index));break;
  case 'start-beat':startBeat();break;
  case 'begin-beat':beginBeat();break;
  case 'tap-beat':tapBeat(button.dataset.value);break;
  case 'start-treasure':startTreasure();break;
  case 'pick-treasure':pickTreasure(Number(button.dataset.index),button);break;
  case 'buy':buy(button.dataset.kind,Number(button.dataset.cost));break;
 }
});
$('saveFile').addEventListener('change',importSave);
load();drawMap();
