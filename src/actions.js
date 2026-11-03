import {CATALOG} from './catalog.js';

// Explicit choreography: gesture, prop, environment. All outfits use this rig.
const MAP={
 '待机呼吸休闲':['idle'], '东张西望':['look'], '被鼠标拖拽悬空反馈':['drag'],
 '点击回应-开心跃动':['jump','💗'], '点击回应-害羞惊讶':['shy','🌸'], '点击回应-傲娇生气':['stomp','💢'], '点击回应-挠痒咯咯笑':['giggle','✨'], '点击回应-元气挥手':['wave','👋'],
 '螃蟹走路':['walk'], '原地漂浮踏步':['float','☁️'], '原地左转奔跑':['run'],
 '悠闲哼歌':['sway','🎵'], '超大伸懒腰':['stretch'], '原地敲击桌面互动':['tap','🪵'], '原地重力下蹲压缩':['crouch'], '哈欠连天':['yawn','💤'], '原地小憩沉眠':['sleep','💤'],
 '女仆屈膝礼仪':['bow'], '被吓一跳':['surprise','❕'], '小幅度原地360度旋转展示':['spin'], '偷吃零食被抓住':['shy','🍪'], '用鲸鱼尾巴拍打地面':['stomp','🫧'], '打瞌睡被惊醒':['wake','❕'], '照镜子':['look','🪞'], '整体换装试色':['spin','✨'], '轻快记录':['write','📝'], '写代码':['type','💻'], '摇扇纳凉':['fan','🪭'], '晨间刷牙':['brush','🪥'],
 '原地专心玩魔方':['puzzle','🧩'], '原地蹲下玩玩具汽车':['crouch','🚗'], '鲸鱼吐泡泡特效':['blow','🫧'], '原地跳跃抓碎头顶物品':['jump','⭐'], '玩游戏气急败坏':['stomp','🎮'], '玩水枪':['aim','🔫'], '小提琴演奏':['violin','🎻'], '蓝鲸现世':['float','🐋'], '优雅女仆舞':['waltz','🎶'], '轻快摇摆舞':['dance','🎵'], '可爱宅舞':['dance','💗'], '吹气球':['blow','🎈'], '动物环绕':['sway','🐇','orbit'], '放风筝':['kite','🪁'], '拆礼物':['puzzle','🎁'], '变鸽子':['magic','🕊️'], '扑克魔术':['magic','🃏'], '抽陀螺':['tap','🪀'], '吹笛子':['flute','🪈'], '蝴蝶蜜蜂环绕头顶开花':['magic','🦋','flowers'], '撸猫':['pet','🐈'], '凭空生花':['magic','🌷'], '骑木马':['ride','🎠'], '三球抛接':['juggle','🔴'], '踢毽子':['kick','🪶'], '下五子棋':['tap','⚫'], '荡秋千':['swing','🌿'],
 '吃白饭':['eat','🍚'], '大口吃零食':['eat','🍿'], '吃Token':['eat','🔷'], '吃早餐':['eat','🥐'], '吃午餐':['eat','🍱'], '吃晚餐':['eat','🍲'], '吃冰淇淋融化':['eat','🍦','drops'], '吃大闸蟹':['eat','🦀'], '吃糖葫芦':['eat','🍡'], '吃长寿面':['eat','🍜'], '吃西瓜':['eat','🍉'], '涮火锅':['stir','🍲'],
 '被落叶淹没':['crouch','🍂','leaves'], '中秋赏月吃月饼':['eat','🥮','moon'], '堆雪人':['crouch','☃️','snow'], '放烟花':['wave','🎆','fireworks'], '吃粽子':['eat','🫔'], '吃年糕':['eat','🍘'], '吃青团':['eat','🟢'], '吃腊八粥':['stir','🥣'], '吃重阳糕':['eat','🍰'], '收红包':['wave','🧧'], '写福字':['write','🧧'], '穿针乞巧':['write','🪡'], '舞狮头':['dance','🦁'], '讨糖南瓜灯':['wave','🎃'], '插茱萸赏菊':['pet','🌼'], '放河灯':['bow','🪷','river'], '萌化小幽灵':['float','👻'], '装点圣诞树':['stretch','🎄','snow'], '放孔明灯':['stretch','🏮'], '吃汤圆':['eat','🥣'], '吃饺子':['eat','🥟'],
 '是啊，吃什么':['look','🍽️'], '深度思考碎碎念':['think','💭'],
 '余额-钱袋满溢':['jump','💰'], '余额-金袋叮当':['juggle','🪙'], '余额-钱袋如常':['sway','👛'], '余额-数金皱眉':['think','🪙'], '余额-袋空如洗':['sad','👛'], '余额-分文不剩':['sad','💸'],
 '碎碎念-擦桌碎碎念':['brush','🧽'], '碎碎念-发呆碎碎念':['think','💭'], '碎碎念-对屏碎碎念':['type','💬'],
 '工作状态-思考冒泡':['think','💭'], '工作状态-忙碌点按':['type','💻'], '工作状态-清点归档':['write','📚'], '工作状态-原地踱步张望':['walk','⌛'], '工作状态-雀跃庆祝':['jump','🎉','fireworks'], '工作状态-垂头叹气冒汗':['sad','💧'],
 '睡觉-开始':['sleepIn','💤'], '睡觉-循环':['sleep','💤'], '睡觉-起来':['wake','☀️']
};
export const ACTIONS=CATALOG.flatMap(({category,names})=>names.map((name,i)=>{
 if(!MAP[name])throw new Error(`Missing choreography: ${name}`);
 const [gesture,prop='',effect='']=MAP[name];
 return {id:name,name,category,gesture,prop,effect,duration:['sleep','idle'].includes(gesture)?8:gesture==='spin'?5:6,tempo:1+(i%3)*.08};
}));
export const findAction=id=>ACTIONS.find(a=>a.id===id);
export const OUTFITS=[
 {id:'original',name:'初见 · 日常',subtitle:'黑色针织 / 百褶短裙',tag:'ORIGINAL',color:'#ece4db',file:'original-open.png',closed:'original-closed.png',sheet:false},
 {id:'lolita',name:'紫雾 · 洛丽塔',subtitle:'层叠蕾丝 / 紫色缎带',tag:'LOLITA',color:'#e7ddf3',file:'lolita.png',sheet:true},
 {id:'jk',name:'晴空 · JK',subtitle:'海军领 / 格纹百褶',tag:'SAILOR',color:'#dde5ee',file:'jk.png',sheet:true},
 {id:'maid',name:'午后 · 女仆',subtitle:'纯白围裙 / 黑色裙摆',tag:'MAID',color:'#e5e0db',file:'maid.png',sheet:true}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

export function poseFor(action,time,envelope=1,reduced=false){
 const t=time*(action.tempo||1),s=Math.sin(t*3),c=Math.cos(t*3);
 const p={x:0,y:0,tilt:Math.sin(time*.9)*.006,head:Math.sin(time*1.2)*.008,armL:0,armR:0,step:0,squash:Math.sin(time*2)*.003,turn:1,eyes:false};
 const g=action.gesture;
 switch(g){
 case 'look':p.head=s*.065;p.tilt=s*.012;break;
 case 'wave':p.armR=.55+.2*Math.sin(t*8);p.head=-.03;break;
 case 'stretch':p.armL=p.armR=.65*smooth(Math.sin(t*.8)*.5+.5);p.squash=-.025;break;
 case 'bow':p.y=14*(.5-.5*c);p.head=.08*(.5-.5*c);p.squash=.055*(.5-.5*c);p.armL=p.armR=.14;break;
 case 'jump':p.y=-Math.max(0,s)*55;p.armL=p.armR=Math.max(0,s)*.55;p.squash=s<0?-s*.025:0;break;
 case 'shy':p.head=.045;p.armL=p.armR=.25;p.tilt=s*.025;break;
 case 'giggle':p.y=Math.sin(t*12)*3;p.armL=p.armR=.25;p.eyes=true;break;
 case 'stomp':p.step=Math.sin(t*8)*.07;p.tilt=s*.04;p.y=-Math.abs(s)*8;p.armL=.2;p.armR=.3;break;
 case 'walk':case 'run':p.step=Math.sin(t*(g==='run'?11:6))*(g==='run'?.1:.055);p.x=Math.sin(t*.7)*75;p.y=-Math.abs(p.step)*110;p.armL=-p.step*3;p.armR=p.step*3;p.tilt=g==='run'?.045:0;break;
 case 'float':p.y=-25+Math.sin(t*2)*18;p.armL=p.armR=.2;break;
 case 'drag':p.tilt=Math.sin(t*7)*.06;p.armL=.3;p.armR=.4;p.step=s*.04;break;
 case 'crouch':p.squash=.1*(.6+.4*s);p.y=10;p.head=.04;p.armL=p.armR=.3;break;
 case 'spin':p.turn=Math.cos(t*1.25);p.armL=p.armR=.4;p.y=-6*Math.abs(s);break;
 case 'sway':p.tilt=s*.035;p.head=-s*.025;p.armL=.1+s*.07;p.armR=.1-s*.07;break;
 case 'dance':case 'waltz':p.tilt=s*(g==='waltz'?.045:.065);p.x=Math.sin(t*1.5)*24;p.armL=.3+s*.25;p.armR=.3+c*.25;p.step=s*.045;p.y=-Math.abs(s)*10;break;
 case 'sleepIn':case 'sleep':p.eyes=true;p.head=.065;p.tilt=.03;p.y=18;p.squash=.035+Math.sin(t)*.005;break;
 case 'wake':case 'yawn':p.eyes=t<2;p.armL=p.armR=.5*(.5+.5*s);p.head=-.025;break;
 case 'sad':p.head=.055;p.y=8;p.armL=p.armR=-.05;break;
 case 'surprise':p.y=-Math.max(0,Math.sin(t*5))*24;p.armL=p.armR=.4;break;
 case 'think':p.head=.035+s*.015;p.armR=.4;break;
 case 'eat':p.armR=.25+(.5+.5*s)*.3;p.head=-.012+Math.sin(t*6)*.01;break;
 case 'stir':p.armR=.35+Math.sin(t*5)*.13;p.armL=.28;break;
 case 'type':p.armL=.3+Math.sin(t*12)*.045;p.armR=.3+Math.cos(t*12)*.045;p.head=.025;break;
 case 'write':p.armR=.32+Math.sin(t*9)*.08;p.armL=.25;p.head=.03;break;
 case 'fan':p.armR=.4+Math.sin(t*10)*.22;p.head=-.02;break;
 case 'brush':p.armR=.42+Math.sin(t*12)*.1;p.head=.015;break;
 case 'puzzle':p.armL=.32+Math.sin(t*5)*.08;p.armR=.32+Math.cos(t*5)*.08;p.head=.02;break;
 case 'blow':p.armL=p.armR=.38;p.squash=Math.sin(t*2)*.01;break;
 case 'aim':p.armR=.65;p.armL=.3;p.tilt=-Math.max(0,Math.sin(t*9))*.02;break;
 case 'violin':p.armL=.4;p.armR=.45+Math.sin(t*5)*.2;p.head=.035;p.tilt=s*.025;break;
 case 'flute':p.armL=.45;p.armR=.5+Math.sin(t*9)*.02;p.head=-.02;break;
 case 'kite':p.armR=.55;p.head=-.04;p.tilt=s*.02;break;
 case 'magic':p.armL=.25;p.armR=.4+Math.sin(t*3)*.2;p.tilt=s*.02;break;
 case 'pet':p.armR=.2+Math.sin(t*4)*.15;p.head=.04;p.y=5;break;
 case 'ride':p.y=-Math.abs(s)*17;p.armL=p.armR=.25;p.step=s*.035;break;
 case 'juggle':p.armL=.3+s*.2;p.armR=.3-s*.2;p.head=-.03;break;
 case 'kick':p.step=Math.max(0,s)*.14;p.armL=.1;p.armR=.35;p.tilt=-Math.max(0,s)*.05;break;
 case 'swing':p.tilt=Math.sin(t*2)*.06;p.y=-Math.abs(Math.sin(t*2))*18;p.step=s*.03;p.armL=p.armR=.45;break;
 case 'tap':p.armR=.25+Math.max(0,Math.sin(t*8))*.18;p.head=.025;break;
 }
 for(const k of ['x','y','tilt','head','armL','armR','step','squash'])p[k]*=envelope*(reduced?.15:1);
 p.turn=1+(p.turn-1)*envelope*(reduced?.15:1);
 return p;
}
