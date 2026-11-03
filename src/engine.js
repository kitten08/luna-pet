import {ACTIONS,OUTFITS,findAction,poseFor,clamp,smooth} from './actions.js';
const ASSET=new URL('../assets/',import.meta.url);
const idle=findAction('待机呼吸休闲');
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('无法加载素材 '+src));im.src=src;});

export class PetEngine extends EventTarget {
 constructor(canvas,{overlay=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
  super();this.canvas=canvas;this.ctx=canvas.getContext('2d');this.overlay=overlay;this.reduced=reduced;
  this.outfit=OUTFITS[0];this.images=new Map();this.action=idle;this.start=0;this.elapsed=0;this.last=0;this.running=true;this.autonomous=true;this.sleeping=false;this.size=1;this.x=0;this.y=0;this.vx=0;this.vy=0;this.drag=null;this.destroyed=false;this.nextAuto=12;this.frameCount=0;
  this.resize();this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(canvas);
  this.down=e=>this.pointerDown(e);this.move=e=>this.pointerMove(e);this.up=e=>this.pointerUp(e);this.context=e=>{e.preventDefault();this.dispatchEvent(new Event('menu'));};
  canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.up);canvas.addEventListener('contextmenu',this.context);
  this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
 }
 resize(){const rect=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.round(rect.width*d));this.canvas.height=Math.max(1,Math.round(rect.height*d));this.width=rect.width;this.height=rect.height;}
 async preload(){await Promise.all(OUTFITS.map(async o=>{const im=await load(new URL(o.file,ASSET).href),closed=o.closed?await load(new URL(o.closed,ASSET).href):null;this.images.set(o.id,{im,closed});}));this.dispatchEvent(new Event('ready'));}
 setOutfit(id){const o=OUTFITS.find(o=>o.id===id);if(!o||!this.images.has(id))return false;this.previous=this.outfit;this.outfit=o;this.changeAt=this.elapsed;this.dispatchEvent(new CustomEvent('outfit',{detail:o}));return true;}
 play(id,{force=false}={}){const a=findAction(id);if(!a)return false;if(this.sleeping&&!force&&!id.startsWith('睡觉'))return false;
  this.previousPose=poseFor(this.action,this.elapsed-this.start,this.envelope(),this.reduced);this.action=a;this.start=this.elapsed;
  if(id==='睡觉-开始'||id==='睡觉-循环')this.sleeping=true;
  if(id==='睡觉-起来')this.sleeping=false;
  this.dispatchEvent(new CustomEvent('action',{detail:a}));return true;
 }
 wake(){this.play('睡觉-起来',{force:true});}
 envelope(){return this.action===idle||this.action.gesture==='sleep'?1:smooth((this.elapsed-this.start)/.55)*smooth((this.action.duration-(this.elapsed-this.start))/.65);}
 point(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 pointerDown(e){if(e.button!==0)return;const p=this.point(e),b=this.bounds;if(!b||p.x<b.x||p.x>b.x+b.w||p.y<b.y||p.y>b.y+b.h)return;this.canvas.setPointerCapture(e.pointerId);this.drag={start:p,last:p,time:performance.now(),ox:this.x,oy:this.y,moved:false};this.vx=this.vy=0;}
 pointerMove(e){if(!this.drag)return;const d=this.drag,p=this.point(e),now=performance.now(),dt=Math.max(8,now-d.time)/1000;d.moved ||=Math.hypot(p.x-d.start.x,p.y-d.start.y)>5;
  if(d.moved){this.x=d.ox+p.x-d.start.x;this.y=d.oy+p.y-d.start.y;this.vx=clamp((p.x-d.last.x)/dt,-1200,1200);this.vy=clamp((p.y-d.last.y)/dt,-1200,1200);if(this.action.gesture!=='drag')this.play('被鼠标拖拽悬空反馈',{force:true});}
  d.last=p;d.time=now;
 }
 pointerUp(){if(!this.drag)return;const d=this.drag;this.drag=null;
  if(!d.moved){if(this.sleeping)this.wake();else this.play(ACTIONS.filter(a=>a.category==='点击回应')[Math.floor(Math.random()*5)].id);this.dispatchEvent(new Event('petclick'));}
  else{if(performance.now()-d.time>100)this.vx=this.vy=0;this.play('待机呼吸休闲',{force:true});}
 }
 tick(ms){if(this.destroyed)return;this.raf=requestAnimationFrame(this.tick);if(document.hidden){this.last=ms;return;}const dt=clamp((ms-(this.last||ms))/1000,0,.035);this.last=ms;if(this.running){this.elapsed+=dt;this.physics(dt);const t=this.elapsed-this.start;
  if(t>this.action.duration){if(this.action.gesture==='sleepIn')this.play('睡觉-循环',{force:true});else if(this.action.gesture!=='sleep'&&this.action!==idle)this.play(idle.id);}
  if(this.elapsed>this.nextAuto){this.nextAuto=this.elapsed+12+Math.random()*12;if(this.autonomous&&!this.sleeping&&!this.drag&&this.action===idle){const pool=ACTIONS.filter(a=>['小动作','玩耍','移动'].includes(a.category)&&!['sleep','sleepIn','wake'].includes(a.gesture));this.play(pool[Math.floor(Math.random()*pool.length)].id);}}
 }this.draw();this.frameCount++;
 }
 physics(dt){if(this.drag||!this.width)return;const rangeX=this.width*.28,top=-this.height*.12;if(this.y<0||Math.abs(this.vy)>1){this.vy+=1000*dt;this.y+=this.vy*dt;if(this.y>0){this.y=0;this.vy=-this.vy*.42;if(Math.abs(this.vy)<25)this.vy=0;}}
  this.x+=this.vx*dt;this.vx*=Math.exp(-3*dt);
  if(Math.abs(this.x)>rangeX){this.x=clamp(this.x,-rangeX,rangeX);this.vx=-this.vx*.55;}
  if(this.y<top){this.y=top;this.vy=Math.abs(this.vy)*.4;}
 }
 draw(){const ctx=this.ctx,w=this.width,h=this.height;if(!w||!h)return;ctx.setTransform(this.canvas.width/w,0,0,this.canvas.height/h,0,0);ctx.clearRect(0,0,w,h);
  let p=poseFor(this.action,this.elapsed-this.start,this.envelope(),this.reduced);
  if(this.previousPose){const mix=smooth((this.elapsed-this.start)/.4);for(const k of ['x','y','tilt','head','armL','armR','step','squash','turn'])p[k]=this.previousPose[k]*(1-mix)+p[k]*mix;if(mix>=1)this.previousPose=null;}
  const ph=Math.min(h*.82,w*.94)*this.size,pw=ph*(2/3),cx=w/2+this.x,base=h*.93+this.y;
  this.bounds={x:cx-pw*.4,y:base-ph,w:pw*.8,h:ph};
  if(!this.overlay){ctx.save();ctx.translate(cx,base-1);ctx.scale(1,.16);const sh=ctx.createRadialGradient(0,0,0,0,0,pw*.42);sh.addColorStop(0,'#70597028');sh.addColorStop(1,'#70597000');ctx.fillStyle=sh;ctx.beginPath();ctx.arc(0,0,pw*.42,0,7);ctx.fill();ctx.restore();}
  ctx.save();ctx.translate(cx+p.x*ph/580,base+p.y*ph/580);ctx.rotate(p.tilt);ctx.scale(Math.max(.08,Math.abs(p.turn))*(p.turn<0?-1:1),1);
  if(this.action.gesture==='swing'){ctx.strokeStyle='#b5a68e';ctx.lineWidth=2;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*pw*.35,-ph*1.05);ctx.lineTo(s*pw*.27,-ph*.22);ctx.stroke();}ctx.fillStyle='#c2a78e';ctx.fillRect(-pw*.32,-ph*.22,pw*.64,7);}
  const fading=this.previous&&this.elapsed-this.changeAt<.38;
  if(fading){ctx.globalAlpha=1-smooth((this.elapsed-this.changeAt)/.38);this.drawCharacter(ctx,this.previous,p,pw,ph);ctx.globalAlpha=smooth((this.elapsed-this.changeAt)/.38);}
  this.drawCharacter(ctx,this.outfit,p,pw,ph);ctx.globalAlpha=1;this.drawProps(ctx,p,pw,ph);ctx.restore();
 }
 drawCharacter(ctx,outfit,p,w,h){const set=this.images.get(outfit.id);if(!set)return;const blink=this.sleeping||p.eyes||(this.elapsed%4.7>4.48&&this.elapsed%4.7<4.65);let im=blink&&set.closed?set.closed:set.im;
  const sw=outfit.sheet?im.width/2:im.width,sh=im.height,sx=outfit.sheet&&blink?sw:0;
  // Texture grid: head, torso, two arms, skirt and legs deform independently.
  const nx=10,ny=22,pts=[];
  const aspect=sw/sh,drawW=h*aspect; // sheets keep full source framing
  for(let iy=0;iy<=ny;iy++)for(let ix=0;ix<=nx;ix++){
   const u=ix/nx,v=iy/ny;let x=(u-.5)*drawW,y=(v-1)*h;
   const head=1-smooth((v-.38)/.22),a=p.head*head,hy=-h*.38;
   const xx=x*Math.cos(a)-(y-hy)*Math.sin(a),yy=hy+x*Math.sin(a)+(y-hy)*Math.cos(a);x=xx;y=yy;
   const side=Math.abs(u-.5),arm=Math.exp(-Math.pow((v-.69)/.12,2))*smooth((side-.16)/.12),leg=smooth((v-.79)/.16);
   const av=u<.5?p.armL:p.armR;
   x+=(u<.5?-1:1)*arm*av*h*.18;
   y-=arm*av*h*.13;
   x+=leg*p.step*h*(u<.5?1:-1);y-=leg*Math.max(0,p.step*(u<.5?1:-1))*h*.55;
   y*=1-p.squash;x*=1+p.squash*.3;
   x+=Math.sin(this.elapsed*2.3+v*5)*h*.003*Math.pow(side*2,3)*smooth((v-.35)/.3);
   pts.push({x,y,u:sx+u*sw,v:v*sh});
  }
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
   const n=iy*(nx+1)+ix,a=pts[n],b=pts[n+1],c=pts[n+nx+1],d=pts[n+nx+2];this.triangle(ctx,im,a,b,c);this.triangle(ctx,im,b,d,c);
  }
 }
 triangle(ctx,im,a,b,c){const den=a.u*(b.v-c.v)+b.u*(c.v-a.v)+c.u*(a.v-b.v);if(!den)return;
  const aa=(a.x*(b.v-c.v)+b.x*(c.v-a.v)+c.x*(a.v-b.v))/den,bb=(a.y*(b.v-c.v)+b.y*(c.v-a.v)+c.y*(a.v-b.v))/den;
  const cc=(a.x*(c.u-b.u)+b.x*(a.u-c.u)+c.x*(b.u-a.u))/den,dd=(a.y*(c.u-b.u)+b.y*(a.u-c.u)+c.y*(b.u-a.u))/den;
  const ee=(a.x*(b.u*c.v-c.u*b.v)+b.x*(c.u*a.v-a.u*c.v)+c.x*(a.u*b.v-b.u*a.v))/den,ff=(a.y*(b.u*c.v-c.u*b.v)+b.y*(c.u*a.v-a.u*c.v)+c.y*(a.u*b.v-b.u*a.v))/den;
  ctx.save();ctx.beginPath();const mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3;for(const [i,q]of[a,b,c].entries()){const dx=q.x-mx,dy=q.y-my,len=Math.hypot(dx,dy)||1;ctx[i?'lineTo':'moveTo'](q.x+dx/len*.28,q.y+dy/len*.28);}ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,ee,ff);ctx.drawImage(im,0,0);ctx.restore();
 }
 drawProps(ctx,p,w,h){const a=this.action,t=this.elapsed-this.start,e=this.envelope(),g=a.gesture;if(!a.prop&&!a.effect)return;ctx.save();ctx.globalAlpha=e;
  const emoji=(s,x,y,size=38,rot=0)=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.font=`${size*h/580}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);ctx.restore();};
  let x=w*.23,y=-h*.28,sz=46,rot=0;
  if(['eat','brush','flute','blow'].includes(g)){x=w*.23;y=-h*(.3+(.5+.5*Math.sin(t*3))*.18);}
  if(['type','write','puzzle','stir','violin'].includes(g)){x=0;y=-h*.3;sz=g==='type'?75:55;rot=g==='violin'?Math.sin(t*5)*.1:0;}
  if(['jump','wave','think','shy','giggle','sleep','sleepIn','wake','sad','surprise','stretch'].includes(g)){x=w*.4;y=-h*.85+Math.sin(t*2)*8;}
  if(['pet','crouch','ride','tap'].includes(g)){x=w*.5;y=-h*.1;sz=g==='ride'?90:50;}
  if(g==='fan'){x=w*.39;y=-h*.4;rot=Math.sin(t*10)*.4;}
  if(g==='aim'){x=w*.4;y=-h*.37;rot=-.2;for(let i=0;i<5;i++){const f=(t*2+i*.17)%1;emoji('💧',x+f*w*.6,y-f*20,14);}}
  if(g==='kite'){x=w*.55+Math.sin(t)*20;y=-h*.8;ctx.strokeStyle='#bbb';ctx.beginPath();ctx.moveTo(w*.25,-h*.34);ctx.quadraticCurveTo(w*.5,-h*.5,x,y);ctx.stroke();}
  if(g==='magic'){x=w*.4;y=-h*.46-Math.sin(t*2)*18;sz=48;for(let i=0;i<5;i++)emoji('✧',x+Math.cos(t*2+i)*50,y+Math.sin(t*2+i)*40,18);}
  if(g==='kick'){x=w*.4;y=-h*.08-Math.max(0,Math.sin(t*3))*h*.28;}
  if(g==='juggle'){for(let i=0;i<3;i++){const ph=t*3+i*Math.PI*2/3;emoji(a.prop,Math.cos(ph)*w*.35,-h*.36-Math.abs(Math.sin(ph))*h*.23,24);}ctx.restore();return;}
  if(a.effect==='orbit'){for(let i=0;i<3;i++)emoji(['🐇','🐈','🐦'][i],Math.cos(t+i*2.1)*w*.55,-h*.3+Math.sin(t+i*2.1)*h*.18,30);}
  else if(a.prop)emoji(a.prop,x,y,sz,rot);
  const effect=a.effect;
  if(['snow','leaves','flowers','drops'].includes(effect)){for(let i=0;i<12;i++){const f=(t*.18+i/12)%1;emoji(effect==='snow'?'❄️':effect==='leaves'?'🍂':effect==='flowers'?'🌸':'💧',Math.sin(i*9.7+t)*w*.6,-h+h*f,16+i%3*4,t+i);}}
  if(effect==='moon')emoji('🌕',-w*.5,-h*.9,60);
  if(effect==='river'){ctx.strokeStyle='#8bc7cc';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-i*3,w*.5+i*10,7,0,0,7);ctx.stroke();}}
  if(effect==='fireworks'){for(let i=0;i<18;i++){const phase=(t*.8)%1,ang=i/18*Math.PI*2;ctx.globalAlpha=e*(1-phase);ctx.fillStyle=['#b99bc5','#e5b266','#eaa6ae'][i%3];ctx.beginPath();ctx.arc(Math.cos(ang)*phase*w*.65,-h*.8+Math.sin(ang)*phase*w*.55,2.5,0,7);ctx.fill();}}
  ctx.restore();
 }
 destroy(){this.destroyed=true;cancelAnimationFrame(this.raf);this.ro.disconnect();const c=this.canvas;c.removeEventListener('pointerdown',this.down);c.removeEventListener('pointermove',this.move);c.removeEventListener('pointerup',this.up);c.removeEventListener('pointercancel',this.up);c.removeEventListener('contextmenu',this.context);}
}
