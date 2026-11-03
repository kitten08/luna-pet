;(()=>{'use strict';
 window.__ModuleLoader__.load({id:'dsh-luna-pet',factory(){return {name:'luna-pet',inject:[],apply(ctx){
  const stale=document.getElementById('dsh-luna-root');if(stale)stale.remove();
  const host=document.createElement('div');host.id='dsh-luna-root';host.style.cssText='position:fixed;right:18px;bottom:0;width:310px;height:480px;z-index:1000;pointer-events:none';
  const frame=document.createElement('iframe');frame.title='Luna 桌宠';frame.src='/luna-pet-static/pet.html';frame.style.cssText='width:100%;height:100%;border:0;background:transparent;pointer-events:auto';host.append(frame);document.body.append(host);
  let drag=null;
  const receive=e=>{if(e.source!==frame.contentWindow||e.origin!==location.origin)return;const d=e.data||{};
   if(d.type==='luna-close')host.style.display='none';
   if(d.type==='luna-drag-start'){const r=host.getBoundingClientRect();drag={x:d.x,y:d.y,left:r.left,top:r.top};}
   if(d.type==='luna-drag-move'&&drag&&Number.isFinite(d.x)&&Number.isFinite(d.y)){host.style.right='auto';host.style.bottom='auto';host.style.left=Math.max(0,Math.min(innerWidth-310,drag.left+d.x-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-480,drag.top+d.y-drag.y))+'px';}
   if(d.type==='luna-drag-end')drag=null;
  };window.addEventListener('message',receive);
  const api={play:id=>frame.contentWindow?.lunaPet?.play(id)??false,outfit:id=>frame.contentWindow?.lunaPet?.outfit(id)??false,state:()=>frame.contentWindow?.lunaPet?.state()??null,show:()=>{host.style.display='';},hide:()=>{host.style.display='none';}};
  if(typeof ctx.provide==='function')ctx.provide('lunaPet',api);
  return ()=>{window.removeEventListener('message',receive);host.remove();};
 }}}});
})();
