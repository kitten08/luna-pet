import {PetEngine} from './engine.js';
import {ACTIONS,OUTFITS,clamp,findAction,mediaFor} from './actions.js';
const $=s=>document.querySelector(s),panel=$('#panel');
const defaults={outfit:'original',scene:'cream',sound:false,auto:true,size:1,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
let state={...defaults};try{state={...defaults,...JSON.parse(localStorage.getItem('luna-settings')||'{}')};}catch{}
state.size=clamp(Number(state.size)||1,.65,1.15);if(!OUTFITS.some(o=>o.id===state.outfit))state.outfit='original';
const engine=new PetEngine($('#pet'),{reduced:!!state.reduced});engine.autonomous=!!state.auto;engine.size=state.size;
let tab='wardrobe',category='全部',query='',toastTimer,bubbleTimer,audio;
function save(){try{localStorage.setItem('luna-settings',JSON.stringify(state));}catch{}window.lunaDesktop?.settings(state);}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function say(text,duration=4300){$('#bubble').textContent=text;clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>$('#bubble').textContent='',duration);}
function chime(){if(!state.sound)return;try{audio||=new AudioContext();audio.resume();const o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.setValueAtTime(660,audio.currentTime);o.frequency.exponentialRampToValueAtTime(990,audio.currentTime+.13);gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.25);o.connect(gain).connect(audio.destination);o.start();o.stop(audio.currentTime+.3);}catch{}}
function updateSound(){const b=$('#sound');b.textContent=state.sound?'♫':'♩';b.setAttribute('aria-label',state.sound?'关闭音效':'开启音效');b.style.opacity=state.sound?'1':'.55';}
function outfitCard(o){return `<button class="outfit-card ${state.outfit===o.id?'active':''}" data-outfit="${o.id}" aria-pressed="${state.outfit===o.id}" style="--color:${o.color}"><div class="thumb ${o.sheet?'sheet':''}"><span class="outfit-tag">${o.tag}</span>${state.outfit===o.id?'<span class="outfit-check">✓</span>':''}<img src="assets/${o.file}" alt="Luna 的${o.name}穿搭"></div><div class="outfit-name">${o.name}</div><div class="outfit-subtitle">${o.subtitle}</div></button>`;}
function render(){
 if(tab==='wardrobe')panel.innerHTML=`<div class="panel-heading"><h2>她的衣橱</h2><span>THE WARDROBE</span></div><p class="panel-subtitle">每一种风格，都是她可爱的另一面。</p><div class="outfit-grid">${OUTFITS.map(outfitCard).join('')}</div><div class="panel-bottom"><p class="outfit-tip">✧ &nbsp;轻点穿搭，即刻换装。<br>服装会自动记住，下次见面还是你喜欢的她。</p><button class="primary-btn" data-tab="actions">✦ &nbsp;打开动作剧场</button></div>`;
 if(tab==='actions'){panel.innerHTML=`<div class="panel-heading"><h2>动作剧场</h2><span>${ACTIONS.length} MOMENTS</span></div><p class="panel-subtitle">${ACTIONS.length} 个动作 · 10 秒编排</p><input class="search" id="action-search" placeholder="搜索动作，比如跳舞、吃、睡觉…" aria-label="搜索动作"><div class="categories">${['全部',...new Set(ACTIONS.map(a=>a.category))].map(c=>`<button data-category="${c}" class="${category===c?'active':''}">${c}</button>`).join('')}</div><div class="actions-list" id="actions-list"></div><a class="text-button" href="video.html">逐帧预览与视频下载 ↗</a><div class="action-status" id="action-status">${engine.action.id ? "正在播放 " + engine.action.name : "选择已制作的动作播放"}</div>`;$('#action-search').value=query;renderActions();}
 if(tab==='settings')panel.innerHTML=`<div class="panel-heading"><h2>陪伴设置</h2><span>JUST FOR YOU</span></div><p class="panel-subtitle">让陪伴，成为你喜欢的样子。</p><label class="setting"><span>自在活动<small>偶尔播放已制作的表情互动</small></span><input id="auto-setting" type="checkbox" ${state.auto?'checked':''}></label><label class="setting"><span>轻柔音效<small>点击她时，听见一声小小的回应</small></span><input id="sound-setting" type="checkbox" ${state.sound?'checked':''}></label><label class="setting"><span>轻缓动作<small>关闭自动点播，仍可手动播放</small></span><input id="reduced-setting" type="checkbox" ${state.reduced?'checked':''}></label><div class="range-block"><div><label for="size-setting">Luna 的大小</label><output id="size-output">${Math.round(state.size*100)}%</output></div><input id="size-setting" type="range" min="65" max="115" step="5" value="${Math.round(state.size*100)}"></div><div class="help-note">♡ &nbsp;所有设置都保存在当前设备。<br>右键 Luna 可以打开互动菜单，可用菜单结束播放。按空格暂停或继续。</div><div class="panel-bottom"><button class="primary-btn secondary" id="settings-reset">恢复默认设置</button></div>`;
 if(tab==='download')panel.innerHTML=`<div class="panel-heading"><h2>带她回家</h2><span>ALWAYS TOGETHER</span></div><p class="panel-subtitle">从浏览器到桌面，陪伴不止在这里。</p><div class="download-card"><h3>☾ &nbsp;桌面小伙伴</h3><p>透明置顶、自由拖拽、托盘菜单。<br>在桌面上，也能换装与点播动作。</p><button class="primary-btn" id="desktop-open">${window.lunaDesktop?'呼唤桌面 Luna':'查看桌面版本'}</button><small>macOS / Windows / Linux · 源码构建</small></div><div class="download-card"><h3>✧ &nbsp;浏览器与 DSH 插件</h3><p>点击浏览器工具栏，让 Luna 来当前网页陪你。也提供 DSH 客户端插件。</p><a href="https://github.com/kitten08/luna-pet" target="_blank" rel="noopener">打开仓库与安装说明 ↗</a></div><div class="help-note">网页版直接打开即可使用。桌面端安装包与插件压缩包请从仓库 Releases 或本次交付文件中获取。</div>`;
}
function renderActions() {
 const list = $('#actions-list');
 if (!list) return;
 const items = ACTIONS.filter(action =>
  (category === '全部' || action.category === category) && action.name.includes(query)
 );
 items.sort((a, b) => Number(Boolean(b.media)) - Number(Boolean(a.media)));
 list.replaceChildren();
 for (const action of items) {
  const row = document.createElement('button');
  row.className = 'action-row' + (engine.action.id === action.id ? ' playing' : '');
  row.dataset.action = action.id;
  const icon = document.createElement('span');
  icon.textContent = action.media ? '▷' : '·';
  const name = document.createElement('span');
  name.textContent = action.name;
  const status = document.createElement('small');
  const media = mediaFor(action, state.outfit);
  status.textContent = !media ? '日常装'
   : media.loop ? '10 秒循环'
   : media.kind === 'rig' ? '10 秒 · 2D' : '10 秒 · 关键帧';
  row.append(icon, name, status);
  list.append(row);
 }
 if (!items.length) {
  const empty = document.createElement('p');
  empty.className = 'empty';
  empty.textContent = '没有找到对应动作。';
  list.append(empty);
 }
}

function playAction(id) {
 const action = findAction(id);
 if (!action?.media) {
  toast('这个动作还在制作中');
  return false;
 }
 if (!engine.play(action.id)) {
  toast('请先换上日常装，再播放这段动作');
  return false;
 }
 return true;
}
function selectTab(id){if(!['wardrobe','actions','settings','download'].includes(id))return;tab=id;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('selected',b.dataset.tab===tab));$('#page-crumb').textContent={wardrobe:'她的衣橱',actions:'动作剧场',settings:'陪伴设置',download:'带她回家'}[id];render();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.tab){selectTab(b.dataset.tab);$('#context').hidden=true;}
 if(b.dataset.outfit){if(engine.setOutfit(b.dataset.outfit)){state.outfit=b.dataset.outfit;save();render();say('换好啦，这样的我你喜欢吗？ ♡');chime();}}
 if(b.dataset.action){playAction(b.dataset.action);$('#context').hidden=true;}
 if(b.dataset.scene){state.scene=b.dataset.scene;applyScene();save();}
 if(b.dataset.category){category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>el.classList.toggle('active',el.dataset.category===category));renderActions();}
 switch(b.id){
 case 'sound':state.sound=!state.sound;updateSound();save();chime();if(tab==='settings')render();break;
 case 'reset':engine.x=engine.y=engine.vx=engine.vy=0;engine.size=state.size;toast('Luna 回到你身边了');break;
 case 'pause':engine.togglePause();b.textContent=engine.running?'Ⅱ':'▷';b.setAttribute('aria-label',engine.running?'暂停动画':'继续动画');break;
 case 'sleep':
  if (engine.action.id === 'sleep-start') toast('Luna 正在入睡');
  else playAction(engine.sleeping?'sleep-wake':'sleep-start');
  break;
 case 'stop-menu':engine.stop();$('#context').hidden=true;break;
 case 'settings-reset':state={...defaults};engine.size=1;engine.reduced=state.reduced;engine.autonomous=true;engine.setOutfit('original');applyScene();updateSound();save();render();toast('已恢复默认设置');break;
 case 'desktop-open':if(window.lunaDesktop)window.lunaDesktop.showPet();else window.open('https://github.com/kitten08/luna-pet#桌面端','_blank','noopener');break;
 }
});
document.addEventListener('input',e=>{if(e.target.id==='action-search'){query=e.target.value.trim();renderActions();}if(e.target.id==='size-setting'){state.size=Number(e.target.value)/100;engine.size=state.size;$('#size-output').textContent=e.target.value+'%';save();}});
document.addEventListener('change',e=>{if(e.target.id==='auto-setting'){state.auto=e.target.checked;engine.autonomous=state.auto;}else if(e.target.id==='sound-setting'){state.sound=e.target.checked;updateSound();chime();}else if(e.target.id==='reduced-setting'){state.reduced=e.target.checked;engine.reduced=state.reduced;}else return;save();});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#context'))$('#context').hidden=true;});
$('#pet').addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();$('#pause').click();}if(e.code==='Enter'){e.preventDefault();playAction('new-01');}});
engine.addEventListener('petclick',()=>{chime();say(['在呢在呢，陪着你呢 ♡','摸摸头，烦恼都飞走～','今天也很高兴见到你 ✧'][Math.floor(Math.random()*3)]);});
engine.addEventListener('action', event => {
 const action = event.detail;
 $('#online-label').textContent = engine.sleeping ? 'Luna 正在小憩' : 'Luna 在这里';
 $('#sleep').textContent = engine.sleeping ? '☀ 叫醒她' : '☾ 睡觉';
 $('#pause').textContent = 'Ⅱ';
 $('#pause').setAttribute('aria-label', '暂停动画');
 if (tab === 'actions') {
  $('#action-status').textContent = action.id ? '正在播放 ' + action.name : '选择已制作的动作播放';
  renderActions();
 }
});
engine.addEventListener('mediaerror', () => toast('动作素材加载失败，请重试'));
engine.addEventListener('outfit',e=>$('#outfit-caption').textContent=e.detail.name);
engine.addEventListener('menu',()=>{const r=$('#pet').getBoundingClientRect(),menu=$('#context');menu.hidden=false;menu.style.left=Math.min(innerWidth-175,r.left+r.width*.55)+'px';menu.style.top=Math.min(innerHeight-210,r.top+r.height*.45)+'px';});
function applyScene(){$('.studio').dataset.scene=state.scene;document.querySelectorAll('[data-scene]').forEach(b=>b.classList.toggle('active',b.dataset.scene===state.scene));}
$('#nav-count').textContent=ACTIONS.length;
selectTab(new URLSearchParams(location.search).get('view') === 'actions' ? 'actions' : 'wardrobe');
applyScene();updateSound();
engine.preload().then(()=>{engine.setOutfit(state.outfit);$('#loading').hidden=true;save();setTimeout(()=>$('#bubble').textContent='',6000);}).catch(error=>{$('#loading').textContent='素材加载失败，请刷新重试。';console.error(error);});
window.addEventListener('beforeunload',()=>engine.destroy());
// Read-only diagnostics and a bounded public control API for integrations.
window.lunaPet={play:id=>engine.play(id),outfit:id=>{if(engine.setOutfit(id)){state.outfit=id;save();if(tab==='wardrobe')render();return true;}return false;},wake:()=>engine.wake(),state:()=>({action:engine.action.id,outfit:engine.outfit.id,sleeping:engine.sleeping,frames:engine.frameCount}),actions:()=>ACTIONS.map(a=>a.id)};
