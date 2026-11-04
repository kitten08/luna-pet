import {LOCAL_MOTIONS} from './local-motions.js';

const clipsByOutfit = new Map(LOCAL_MOTIONS.map(media => [`${media.outfit}/${media.id}`, media]));
export function mediaFor(action, outfit) {
  return action && clipsByOutfit.get(`${outfit}/${action.id}`);
}

export const ACTIONS = [
  {
    "id": "new-05",
    "name": "握拳含泪委屈",
    "category": "表情互动"
  },
  {
    "id": "new-06",
    "name": "单手捂嘴惊讶",
    "category": "表情互动"
  },
  {
    "id": "new-07",
    "name": "指抵嘴唇歪头思考",
    "category": "表情互动"
  },
  {
    "id": "new-08",
    "name": "单手V字眨眼甜笑",
    "category": "表情互动"
  },
  {
    "id": "new-09",
    "name": "双手胸前比心",
    "category": "表情互动"
  },
  {
    "id": "sleep-start",
    "name": "睡觉开始",
    "category": "睡眠三段"
  },
  {
    "id": "sleep-wake",
    "name": "睡觉起来",
    "category": "睡眠三段"
  },
  {
    "id": "sleep-loop",
    "name": "睡眠循环",
    "category": "睡眠三段"
  },
  {
    "id": "new-01",
    "name": "打招呼",
    "category": "表情互动"
  },
  {
    "id": "new-03",
    "name": "害羞可爱",
    "category": "表情互动"
  },
  {
    "id": "new-04",
    "name": "生气和傲娇",
    "category": "表情互动"
  },
  {
    "id": "attached-004",
    "name": "点击回应-害羞回应",
    "category": "点击回应"
  },
  {
    "id": "attached-005",
    "name": "点击回应-傲娇生气",
    "category": "点击回应"
  },
  {
    "id": "attached-009",
    "name": "超大伸懒腰",
    "category": "日常动作"
  },
  {
    "id": "attached-006",
    "name": "被鼠标拖拉悬空反馈",
    "category": "日常动作"
  },
  {
    "id": "attached-007",
    "name": "女仆屈膝礼仪",
    "category": "日常动作"
  },
  {
    "id": "attached-021",
    "name": "打瞌睡被惊醒",
    "category": "日常动作"
  },
  {
    "id": "attached-023",
    "name": "悠闲哼歌",
    "category": "日常动作"
  },
  {
    "id": "attached-024",
    "name": "东张西望",
    "category": "日常动作"
  },
  {
    "id": "attached-105",
    "name": "垂头叹气冒汗",
    "category": "日常动作"
  }
];
export const findAction = id => ACTIONS.find(action => action.id === id || action.name === id);

export const OUTFITS=[
 {id:'original',name:'初见 · 日常',subtitle:'黑色针织 / 百褶短裙',tag:'ORIGINAL',color:'#ece4db',file:'original-open.png',closed:'original-closed.png',sheet:false},
 {id:'lolita',name:'紫雾 · 洛丽塔',subtitle:'层叠蕾丝 / 紫色缎带',tag:'LOLITA',color:'#e7ddf3',file:'lolita.png',sheet:true},
 {id:'jk',name:'晴空 · JK',subtitle:'海军领 / 格纹百褶',tag:'SAILOR',color:'#dde5ee',file:'jk.png',sheet:true},
 {id:'maid',name:'午后 · 女仆',subtitle:'纯白围裙 / 黑色裙摆',tag:'MAID',color:'#e5e0db',file:'maid.png',sheet:true}
];
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
