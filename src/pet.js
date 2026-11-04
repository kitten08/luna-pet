import {PetEngine} from './engine.js';
import {ACTIONS,OUTFITS,findAction} from './actions.js';
const $=s=>document.querySelector(s),desktop=window.lunaDesktop;
const engine=new PetEngine($('#pet'),{overlay:true});let state={outfit:'original',auto:true,size:1},timer;
try{state={...state,...JSON.parse(localStorage.getItem('luna-settings')||'{}')};}catch{}
const setState=s=>{state={...state,...s};engine.setOutfit(state.outfit);engine.autonomous=!!state.auto;engine.size=Math.max(.65,Math.min(1.15,Number(state.size)||1));if(typeof state.reduced==='boolean')engine.reduced=state.reduced;$('#outfits').value=state.outfit;$('#auto').textContent='自在活动：'+(state.auto?'开启':'关闭');};
function save(){try{localStorage.setItem('luna-settings',JSON.stringify(state));}catch{}desktop?.settings(state);if(globalThis.chrome?.storage)chrome.storage.local.set({'luna-settings':state});}
$('#outfits').replaceChildren(...OUTFITS.map(o=>new Option(o.name,o.id)));$('#actions').replaceChildren(new Option('选择动作', ''), ...ACTIONS.map(action => {
 const option = new Option(action.name + (action.media ? '' : ' · 待制作'), action.id);
 option.disabled = !action.media;
 return option;
}));
function playAction(id) {
 if (!id) return false;
 if (engine.play(id)) return true;
 $('#bubble').textContent = findAction(id) ? '此动作需要日常装或素材仍在加载' : '未找到动作';
 $('#actions').value = engine.action.id ?? '';
 return false;
}
engine.preload().then(async()=>{if(globalThis.chrome?.storage){const s=await chrome.storage.local.get('luna-settings');if(s['luna-settings'])state={...state,...s['luna-settings']};}setState(state);}).catch(e=>$('#bubble').textContent=e.message);
$('#outfits').onchange=e=>{setState({outfit:e.target.value});save();};$('#actions').onchange=e=>playAction(e.target.value);
$('#wardrobe').onclick=()=>$('#menu').hidden=!$('#menu').hidden;engine.addEventListener('menu',()=>$('#menu').hidden=!$('#menu').hidden);
$('#sleep').onclick=()=>{
 if (engine.action.id === 'sleep-start') $('#bubble').textContent='Luna 正在入睡';
 else playAction(engine.sleeping?'sleep-wake':'sleep-start');
};$('#stop').onclick=()=>engine.stop();
$('#auto').onclick=()=>{setState({auto:!state.auto});save();};
$('#home').onclick=()=>{if(desktop)desktop.showHome();else window.open('index.html','_blank','noopener');};
$('#close').onclick=()=>{if(desktop)desktop.hidePet();else parent.postMessage({type:'luna-close'},'*');};
engine.addEventListener('action',e=>{$('#actions').value=e.detail.id??'';$('#bubble').textContent=e.detail.id?e.detail.name:'';clearTimeout(timer);timer=setTimeout(()=>$('#bubble').textContent='',2800);});
engine.addEventListener('petclick',()=>{$('#bubble').textContent='今天也有我陪着你 ♡';});
window.addEventListener('storage',e=>{if(e.key==='luna-settings'){try{setState(JSON.parse(e.newValue||'{}'));}catch{}}});
desktop?.onSettings(setState);desktop?.onAction(playAction);
engine.addEventListener('mediaerror',()=>$('#bubble').textContent='动作素材加载失败');
let moving=false;$('#move').onpointerdown=e=>{moving=true;e.target.setPointerCapture(e.pointerId);desktop?.dragStart();parent.postMessage({type:'luna-drag-start',x:e.screenX,y:e.screenY},'*');};$('#move').onpointermove=e=>{if(moving)parent.postMessage({type:'luna-drag-move',x:e.screenX,y:e.screenY},'*');};const endMove=()=>{moving=false;desktop?.dragEnd();parent.postMessage({type:'luna-drag-end'},'*');};$('#move').onpointerup=endMove;$('#move').onpointercancel=endMove;
window.addEventListener('keydown',e=>{if(e.key==='Escape')$('#menu').hidden=true;});window.addEventListener('beforeunload',()=>engine.destroy());
window.lunaPet={play:id=>engine.play(id),outfit:id=>{if(!OUTFITS.some(o=>o.id===id))return false;setState({outfit:id});save();return true;},wake:()=>engine.wake(),state:()=>({action:engine.action.id,outfit:engine.outfit.id,sleeping:engine.sleeping,frames:engine.frameCount})};
