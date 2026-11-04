import {sampleMotion} from './motion-timeline.js';

const RIGS = {
  original: {center:.529, shoulder:[.366,.666,.537], wrists:[.247,.799,.774],
    sleeve:['#211e22','#3b3436','#242023'], cuff:'#353033',
    cuts:[[[.33,.50],[.4,.57],[.36,.71],[.35,.768],[.273,.8],[.208,.767],[.221,.714],[.267,.676],[.309,.59]],
      [[.686,.501],[.726,.554],[.767,.664],[.832,.723],[.835,.779],[.785,.801],[.732,.769],[.708,.675],[.664,.567]]]},
  jk: {center:.541, shoulder:[.411,.674,.542], wrists:[.357,.791,.747],
    sleeve:['#b6a797','#f1e8d9','#ccbdad'], cuff:'#2a344d'},
  lolita: {center:.547, shoulder:[.409,.687,.527], wrists:[.343,.785,.736],
    sleeve:['#8c729e','#d7c2e8','#ad96be'], cuff:'#e3d5df'},
  maid: {center:.530, shoulder:[.379,.671,.545], wrists:[.329,.753,.742],
    sleeve:['#292429','#504451','#30292f'], cuff:'#e9dfdd'}
};
const clamp = x => Math.min(1, Math.max(0, x));
const mix = (a,b,t) => a+(b-a)*t;

function path(ctx, points) {
  ctx.beginPath();
  for (const [i, [x,y]] of points.entries()) i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  ctx.closePath();
}

export function makeRig(open, closed, outfit, surface) {
  const config = RIGS[outfit];
  const single = outfit === 'original';
  const sw = single ? open.width : open.width/2;
  const source = (image, offset) => {
    const height = 500;
    const width = Math.round(height * sw/open.height);
    const canvas = surface(width,height);
    canvas.getContext('2d').drawImage(image, offset, 0, sw, image.height, 0, 0, width, height);
    return canvas;
  };
  const [ls,rs,sy] = config.shoulder;
  const [lw,rw,wy] = config.wrists;
  const cuts = config.cuts || [[ls,lw,-1],[rs,rw,1]].map(([sx,wx,dir]) => [
    [sx+.042*dir,sy-.025],[sx-.04*dir,sy+.019],[wx-.052*dir,wy-.073],
    [wx-.039*dir,wy+.039],[wx+.057*dir,wy+.038],[wx+.067*dir,wy-.026],
    [sx+.08*dir,sy+.109]
  ]);
  return {config, cuts, open:source(open,0), shut:source(single?closed:open,single?0:sw)};
}

function ellipse(ctx,x,y,rx,ry,color) {
  ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
}
function line(ctx, points, width, color) {
  ctx.beginPath();
  for (const [i,[x,y]] of points.entries()) i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.stroke();
}

function hand(ctx,x,y,width,form,side,angle) {
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.scale(side,1);
  const skin=ctx.createLinearGradient(-width*.35,-width*.65,width*.42,width*.45);
  skin.addColorStop(0,'#ffe1cb');
  skin.addColorStop(.55,'#edb99f');
  skin.addColorStop(1,'#c98771');
  const fingers = form==='open' ? [[-.37,-.35,-.54,-.7],[-.2,-.5,-.27,-1.03],[.0,-.56,0,-1.16],[.19,-.53,.24,-1.03],[.35,-.45,.46,-.83]]
    : form==='peace' ? [[-.13,-.34,-.26,-1.16],[.16,-.35,.32,-1.1]]
    : form==='point' ? [[.12,-.4,.17,-1.05]]
    : form==='heart' ? [[-.22,-.23,-.48,-.53],[.12,-.35,-.14,-.86]]
    : form==='soft' ? [[-.26,-.22,-.35,-.57],[-.07,-.32,-.12,-.68],[.12,-.31,.1,-.66],[.28,-.24,.27,-.57]] : [];
  for (const [a,b,c,d] of fingers) {
    line(ctx,[[a*width,b*width],[c*width,d*width]],width*.24,'#a76e5f');
    line(ctx,[[a*width,b*width],[c*width,d*width]],width*.19,skin);
  }
  ellipse(ctx,0,-.06*width,width*.43,width*.48,'#a76e5f');
  ellipse(ctx,0,-.065*width,width*.397,width*.444,skin);
  if(form==='fist') line(ctx,[[-.19*width,-.22*width],[.19*width,-.12*width]],.048*width,'#bd856e');
  ctx.restore();
}

function sleeve(ctx, config, index, target, w, h) {
  const direction = index === 0 ? -1 : 1;
  const sx=config.shoulder[index]*w, sy=config.shoulder[2]*h;
  const tx=mix(config.wrists[index],target.x,target.w)*w;
  const ty=mix(config.wrists[2],target.y,target.w)*h;
  const ex=mix(sx,tx,.55)+direction*w*.076*target.w;
  const ey=mix(sy,ty,.55)+Math.min(h*.091,Math.abs(sy-ty)*.34);
  const angle=Math.atan2(ty-ey,tx-ex)+Math.PI/2;
  const wrist=[tx-Math.sin(angle)*w*.036,ty+Math.cos(angle)*w*.036];
  const cloth=ctx.createLinearGradient(sx-direction*w*.052,sy,ex+direction*w*.062,ey);
  for (const [i,color] of config.sleeve.entries()) cloth.addColorStop(i/2,color);
  ctx.save();
  ctx.globalAlpha=clamp(target.w*2.6);
  const outline = config.sleeve[0];
  for (const [width,color] of [[.116,outline],[.101,cloth]]) {
    ctx.beginPath();ctx.moveTo(sx,sy);
    ctx.quadraticCurveTo(ex,ey,wrist[0],wrist[1]);
    ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=w*width;
    ctx.stroke();
  }
  const cuff=(a,b)=>[wrist[0]+Math.cos(angle)*w*a+Math.sin(angle)*w*b,wrist[1]+Math.sin(angle)*w*a-Math.cos(angle)*w*b];
  path(ctx,[cuff(-.048,-.028),cuff(.048,-.028),cuff(.039,.022),cuff(-.039,.022)]);
  ctx.fillStyle=config.cuff; ctx.fill();
  hand(ctx,tx,ty,w*.071,target.form,-direction,
    target.form==='open'||target.form==='peace' ? direction*.22 : angle);
  ctx.restore();
}

function body(ctx, source, w, h, p, config) {
  const scale = 1 - Math.abs(p.head) * .18;
  const left = config.center;
  ctx.drawImage(source, w * (.5 - scale / 2), 0, w * scale, h);
  if (Math.abs(p.stepL) + Math.abs(p.stepR) < .005) return;
  const cut = config === RIGS.original ? .821 : .838;
  for (const [a,b,step] of [[left-.16,left,p.stepL],[left,left+.16,p.stepR]]) {
    const lift = Math.max(0,step);
    if (lift < .002) continue;
    ctx.clearRect(w*a, h*cut, w*(b-a), h*(1-cut));
    ctx.drawImage(source,source.width*a,source.height*cut,source.width*(b-a),source.height*(1-cut),
      w*a+step*w*.1,h*cut,w*(b-a),h*(1-cut-lift*.68));
  }
}

const props = {
  rice:'🍚', spoon:'🥄', sticks:'🥢', hammer:'🔨', mirror:'🪞', fan:'🪭',
  zongzi:'🍙',tangyuan:'🥣',tanghulu:'🍡',qingtuan:'🟢','rice-cake':'🍘',
  'red-envelope':'🧧',sprig:'🌿',tree:'🎄',lotus:'🪷','sky-lantern':'🏮',
  horse:'🐎',card:'🃏',gift:'🎁',flute:'🪈',shuttle:'🪶',toothbrush:'🪥',
  top:'🪀',snowman:'⛄',leaf:'🍂',leaves:'🍁',lion:'🦁',fortune:'福',
  'money-bag':'💰','empty-bag':'👜','flat-bag':'👜','water-gun':'🔫'
};

function propShape(ctx,id,r) {
  const scaled=(points)=>points.map(([a,b])=>[a*r,b*r]);
  if (id.startsWith('ball-') || id==='coin' || id==='drop' || id==='○') {
    const color=id==='coin'?'#e8ae3c':id==='ball-red'?'#e95c81':id==='ball-gold'?'#eec362':'#75b9e4';
    if (id==='○') {
      ctx.strokeStyle='#70c4e7';ctx.lineWidth=r*.11;
      ctx.beginPath();ctx.arc(0,0,r*.82,0,Math.PI*2);ctx.stroke();
      ellipse(ctx,-r*.27,-r*.35,r*.22,r*.135,'#eefbff');
    } else {
      const light=ctx.createRadialGradient(-.3*r,-.4*r,.12*r,0,0,r);
      light.addColorStop(0,'#fff6da');light.addColorStop(1,color);
      ellipse(ctx,0,0,r*.77,id==='drop'?r:.77*r,light);
      if(id==='coin') {ctx.strokeStyle='#a66324';ctx.lineWidth=r*.095;ctx.beginPath();ctx.arc(0,0,r*.57,0,Math.PI*2);ctx.stroke();}
    }
    return;
  }
  if (id==='ghost'||id==='fluke') {
    ctx.beginPath();
    if(id==='ghost'){
      ctx.moveTo(-.8*r,.51*r);
      ctx.bezierCurveTo(-1.2*r,-1.28*r,1.2*r,-1.28*r,.8*r,.51*r);
      ctx.quadraticCurveTo(.43*r,.91*r,.2*r,.54*r);
      ctx.quadraticCurveTo(-.11*r,.99*r,-.42*r,.56*r);
      ctx.quadraticCurveTo(-.61*r,.83*r,-.8*r,.51*r);
      ctx.fillStyle='#edf5ff';ctx.fill();
      ellipse(ctx,-.31*r,-.18*r,.09*r,.13*r,'#68627c');ellipse(ctx,.31*r,-.18*r,.09*r,.13*r,'#68627c');
      ellipse(ctx,0,.04*r,.12*r,.075*r,'#ab829b');
    }else{
      ctx.moveTo(-r,-.23*r);ctx.bezierCurveTo(-.55*r,-.78*r,-.24*r,-.74*r,0,-.34*r);
      ctx.bezierCurveTo(.2*r,-.72*r,.69*r,-.77*r,r,-.22*r);
      ctx.bezierCurveTo(.52*r,-.05*r,.16*r,.02*r,.13*r,.62*r);
      ctx.quadraticCurveTo(0,.84*r,-.13*r,.62*r);ctx.bezierCurveTo(-.16*r,.02*r,-.52*r,-.05*r,-r,-.23*r);
      ctx.fillStyle='#77574f';ctx.fill();
    }
    return;
  }
  if (id==='kite'||id==='cube'||id==='board') {
    path(ctx,scaled(id==='kite'?[[0,-1],[-.82,0],[0,1],[.82,0]]:[[-.85,-.85],[.85,-.85],[.85,.85],[-.85,.85]]));
    ctx.fillStyle=id==='board'?'#cfaa79':id==='kite'?'#df9cc5':'#342c37';ctx.fill();
    if(id==='cube'||id==='board')for(let i=0;i<3;i++)for(let j=0;j<3;j++){
      if(id==='cube'){ctx.fillStyle=['#e97770','#ebc370','#73ae90','#8ab9e5'][(i+j*2)%4];ctx.fillRect((i*.51-.75)*r,(j*.51-.75)*r,.44*r,.44*r);}
      else ellipse(ctx,(i*.54-.54)*r,(j*.54-.54)*r,.13*r,.13*r,(i+j)%2?'#3d3431':'#fff6e8');
    }
    if(id==='kite') line(ctx,scaled([[0,-1],[0,1]]),r*.06,'#f2dfed');
    return;
  }
  if (id==='needle'||id==='sparkler'||id==='tap-lines'||id==='air'||id==='steam'||id==='ripples'||id==='tether'||id==='swing') {
    const colors={needle:'#bdb7bf',sparkler:'#f4c65a','tap-lines':'#c5a3d4',air:'#bee6f0',steam:'#fff6e9',ripples:'#a8d8e5',tether:'#c2a88e',swing:'#a8826b'};
    const shapes={needle:[[-.75,.5],[.75,-.5]],sparkler:[[-.72,.7],[.55,-.55]],
      'tap-lines':[[-.79,-.21],[-.49,.08],[-.64,.42]],air:[[-.92,.13],[0,-.18],[.66,.04]],
      steam:[[-.29,.6],[-.46,.15],[.32,-.13],[.06,-.7]],ripples:[[-.9,0],[-.44,.21],[.45,.21],[.91,0]],
      tether:[[0,0],[-1.4,3.2],[-2.3,5.5]],swing:[[-.65,-2.55],[-.65,.3],[.65,.3],[.65,-2.55]]};
    line(ctx,scaled(shapes[id]),r*(id==='tether'?.06:.12),colors[id]);
    if(id==='sparkler') ellipse(ctx,.58*r,-.61*r,.26*r,.26*r,'#fff6c0');
    return;
  }
  const text=id.startsWith('bubble:')?id.slice(7):props[id]??id;
  if(id.startsWith('bubble:')){
    ellipse(ctx,0,0,r*1.2,r*.43,'#f7e8f6');
    ellipse(ctx,-r*.57,r*.57,r*.12,r*.095,'#f7e8f6');
  }
  const plain=/^[\p{ASCII}♥★✧✦✷✿❄♪♫福⚑×·]+$/u.test(text) || id.startsWith('bubble:');
  ctx.font=`${plain?'600 ':''}${Math.max(7, r*(id.startsWith('bubble:')?.38:text==='Zzz'?.76:1.49))}px "PingFang SC", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=text==='♥'?'#db7397':text==='×'?'#c9616d':text==='★'||text==='✦'?'#f6bd60':'#946daa';
  ctx.fillText(text,0,0);
}

function drawProps(ctx,p,w,h) {
  for(const item of p.props){
    ctx.save();
    ctx.translate(item.x*w,item.y*h);
    ctx.rotate(item.rotation);
    ctx.globalAlpha=item.alpha;
    propShape(ctx,item.id,item.size*w*.53);
    ctx.restore();
  }
}

export function paintMotion(ctx, rig, motion, seconds, x,y,w,h, alternate) {
  const p=sampleMotion(motion,seconds);
  if(p.outfitTurn && alternate) rig=alternate;
  const {config}=rig;
  ctx.save();
  ctx.translate(x+w*.5+p.shift*w,y+h-p.rise*h);
  ctx.rotate(p.lean+p.head*.31);
  const depth=Math.sign(p.depth || 1)*Math.max(.10,Math.abs(p.depth));
  ctx.scale(depth,1-p.squash);
  ctx.translate(-w*.5,-h);
  const main=p.blink>.54?rig.shut:rig.open;
  body(ctx,main,w,h,p,config);
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  for (const [index,target] of [p.left,p.right].entries()) {
    if (!target || target.w < .04) continue;
    ctx.globalAlpha=clamp(target.w*2.6);
    path(ctx,rig.cuts[index].map(([px,py])=>[px*w,py*h]));
    ctx.fill();
  }
  ctx.restore();
  for (const [index,target] of [p.left,p.right].entries()) {
    if (!target || target.w < .04) continue;
    ctx.save();
    ctx.globalAlpha=clamp(target.w*2.6);
    path(ctx,rig.cuts[index].map(([px,py])=>[px*w,py*h]));
    ctx.clip();
    const hx=index===0 ? .202 : .746;
    const dx=index===0 ? .201 : .665;
    ctx.drawImage(main,main.width*hx,main.height*.508,main.width*.075,main.height*.25,
      w*dx,h*.508,w*.155,h*.253);
    ctx.restore();
  }
  if(p.wink>.28) {
    ctx.save();ctx.globalAlpha=clamp(p.wink);
    ctx.beginPath();ctx.rect((config.center-.23)*w,.265*h,.205*w,.115*h);ctx.clip();
    body(ctx,rig.shut,w,h,p,config);ctx.restore();
  }
  const faceX=config.center*w;
  if(p.blush>.05){
    for (const side of [-1,1]){
      const bx=faceX+side*.14*w,by=.368*h;
      const blush=ctx.createRadialGradient(bx,by,0,bx,by,w*.064);
      blush.addColorStop(0,`rgba(239,104,125,${p.blush*.56})`);
      blush.addColorStop(1,'rgba(239,104,125,0)');
      ellipse(ctx,bx,by,w*.064,w*.055,blush);
    }
  }
  if(Math.abs(p.mouth)>.12) {
    const open=clamp(Math.abs(p.mouth));
    const cy=(config===RIGS.original?.42:.417)*h;
    ctx.save();ctx.globalAlpha=Math.min(1,open*1.5);
    ellipse(ctx,faceX,cy,w*(.019+open*.018),h*(.003+open*.015),p.mouth>0?'#743a42':'#b5706f');
    if(p.mouth>.25)ellipse(ctx,faceX,cy+.006*h,w*.018,h*.004,'#de8e91');
    ctx.restore();
  }
  if(p.tears>.04){
    for(const side of [-1,1]){
      ellipse(ctx,faceX+side*.143*w,.359*h,.012*w,.018*h,`rgba(158,220,248,${p.tears*.8})`);
      ellipse(ctx,faceX+side*.146*w,.354*h,.004*w,.006*h,`rgba(251,255,255,${p.tears})`);
    }
  }
  if(p.left?.w>.04)sleeve(ctx,config,0,p.left,w,h);
  if(p.right?.w>.04)sleeve(ctx,config,1,p.right,w,h);
  drawProps(ctx,p,w,h);
  ctx.restore();
  return p;
}
