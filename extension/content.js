(()=>{
 const id='luna-pet-extension-host';const old=document.getElementById(id);if(old){old.remove();return;}
 const host=document.createElement('div');host.id=id;host.style.cssText='all:initial;position:fixed;right:16px;bottom:0;width:300px;height:470px;z-index:2147483646;pointer-events:none;';
 const shadow=host.attachShadow({mode:'closed'}),frame=document.createElement('iframe');frame.src=chrome.runtime.getURL('pet.html');frame.title='Luna 桌宠';frame.style.cssText='width:100%;height:100%;border:0;background:transparent;pointer-events:auto;color-scheme:light;';shadow.append(frame);document.documentElement.append(host);
 let drag=null;const receive=e=>{if(e.source!==frame.contentWindow||e.origin!==new URL(frame.src).origin)return;
  const d=e.data||{};if(d.type==='luna-close'){host.remove();cleanup();}
  if(d.type==='luna-drag-start'){const r=host.getBoundingClientRect();drag={x:d.x,y:d.y,left:r.left,top:r.top};}
  if(d.type==='luna-drag-move'&&drag&&Number.isFinite(d.x)&&Number.isFinite(d.y)){host.style.right='auto';host.style.bottom='auto';host.style.left=Math.max(0,Math.min(innerWidth-300,drag.left+d.x-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-470,drag.top+d.y-drag.y))+'px';}
  if(d.type==='luna-drag-end')drag=null;
 };window.addEventListener('message',receive);const observer=new MutationObserver(()=>{if(!host.isConnected)cleanup();});observer.observe(document.documentElement,{childList:true});
 function cleanup(){window.removeEventListener('message',receive);observer.disconnect();}
})();
