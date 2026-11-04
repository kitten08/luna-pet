import {VIDEO_CLIPS,VIDEO_ACTIONS} from './video-catalog.js';
import {LOCAL_MOTIONS} from './local-motions.js';
const $=s=>document.querySelector(s),player=$('#player');
let active=null;
$('#sample-count').textContent=String(VIDEO_CLIPS.length);
$('#list-count').textContent=String(VIDEO_CLIPS.length).padStart(2,'0');
function updateFrame(){if(!active)return;const frame=Math.min(active.frames-1,Math.max(0,Math.round(player.currentTime*active.fps)));$('#frame-status').textContent=`${frame+1} / ${active.frames}`;}
async function select(clip,play=false){
 active=clip;player.pause();$('#error').hidden=true;player.src=clip.src;player.load();
 $('#clip-name').textContent=clip.name;$('#clip-description').textContent=`日常装 · ${clip.duration.toFixed(2)} 秒 · ${clip.fps} fps · ${clip.frames} 帧`;
 $('#review').textContent=clip.review;$('#download').href=clip.src;$('#download').download=`Luna-${clip.id}.mp4`;$('#contact-sheet').href=clip.sheet;
 for(const b of $('#clips').children){const selected=b.dataset.id===clip.id;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));}
 updateFrame();if(play){try{await player.play();}catch{$('#error').textContent='请点击视频中央的播放按钮。';$('#error').hidden=false;}}
}
for(const [i,clip]of VIDEO_CLIPS.entries()){
 const b=document.createElement('button');b.className='clip';b.dataset.id=clip.id;b.setAttribute('aria-label',`播放${clip.name}`);
 const n=document.createElement('b'),name=document.createElement('span'),duration=document.createElement('small');
 n.textContent=String(i+1).padStart(2,'0');name.textContent=clip.name;duration.textContent='5s ↗';b.append(n,name,duration);b.onclick=()=>select(clip,true);$('#clips').append(b);
}
for(const action of VIDEO_ACTIONS){const li=document.createElement('li'),clip=VIDEO_CLIPS.find(c=>c.id===action.id), motion=LOCAL_MOTIONS.find(c=>c.id===action.id);li.textContent=action.name+(motion?' · 已有动图':clip?' · 已有样片':' · 待制作');li.classList.toggle('available',!!(clip||motion));$('#catalog').append(li);}
$('#catalog-summary').textContent=`${VIDEO_CLIPS.length} 段样片 / ${VIDEO_ACTIONS.length} 个条目`;
function step(direction){if(!active||!Number.isFinite(player.duration))return;player.pause();const frame=Math.max(0,Math.min(active.frames-1,Math.round(player.currentTime*active.fps)+direction));player.currentTime=Math.min(player.duration-.001,frame/active.fps);updateFrame();}
$('#previous-frame').onclick=()=>step(-1);$('#next-frame').onclick=()=>step(1);$('#repeat').onchange=e=>player.loop=e.target.checked;
player.addEventListener('timeupdate',updateFrame);player.addEventListener('seeked',updateFrame);player.addEventListener('loadedmetadata',updateFrame);
player.addEventListener('error',()=>{$('#error').textContent='视频载入失败，请刷新页面或下载 MP4 查看。';$('#error').hidden=false;});
if(VIDEO_CLIPS.length)select(VIDEO_CLIPS[0]);else{$('#clip-name').textContent='视频制作中';$('#previous-frame').disabled=$('#next-frame').disabled=true;}
