import {VIDEO_ACTIONS, VIDEO_CLIPS} from './video-catalog.js';
import {LOCAL_MOTIONS} from './local-motions.js';

const mediaById = new Map([...VIDEO_CLIPS, ...LOCAL_MOTIONS].map(media => [media.id, media]));
export const ACTIONS = VIDEO_ACTIONS.map(action => ({
  ...action,
  category: action.id.startsWith('new-') ? '表情互动'
    : action.id.startsWith('sleep-') ? '睡眠三段' : '附件动作',
  media: mediaById.get(action.id)
}));
export const findAction = id => ACTIONS.find(action => action.id === id || action.name === id);
export const OUTFITS=[
 {id:'original',name:'初见 · 日常',subtitle:'黑色针织 / 百褶短裙',tag:'ORIGINAL',color:'#ece4db',file:'original-open.png',closed:'original-closed.png',sheet:false},
 {id:'lolita',name:'紫雾 · 洛丽塔',subtitle:'层叠蕾丝 / 紫色缎带',tag:'LOLITA',color:'#e7ddf3',file:'lolita.png',sheet:true},
 {id:'jk',name:'晴空 · JK',subtitle:'海军领 / 格纹百褶',tag:'SAILOR',color:'#dde5ee',file:'jk.png',sheet:true},
 {id:'maid',name:'午后 · 女仆',subtitle:'纯白围裙 / 黑色裙摆',tag:'MAID',color:'#e5e0db',file:'maid.png',sheet:true}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
