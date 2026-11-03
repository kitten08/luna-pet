import fs from 'node:fs';
// Import only the MIT-licensed action catalog, never upstream character videos.
const raw=fs.readFileSync(process.argv[2], 'utf8');
let clean='',quoted=false,escape=false;
for(let i=0;i<raw.length;i++){
  const c=raw[i];
  if(quoted){clean+=c;if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quoted=false;}
  else if(c==='"'){quoted=true;clean+=c;}
  else if(c==='/'&&raw[i+1]==='/'){while(i<raw.length&&raw[i]!=='\n')i++;clean+='\n';}
  else if(c==='/'&&raw[i+1]==='*'){i+=2;while(i<raw.length&&!(raw[i]==='*'&&raw[i+1]==='/'))i++;i++;}
  else clean+=c;
}
const config=JSON.parse(clean),a=config.animations;
const groups=[['待机',a.idle],['转向',a.turn],['拖拽',a.drag],['点击回应',a.clicks],['移动',a.moves.actions.map(a=>a.name)],...a.categories.map(c=>[c.id,c.actions]),...Object.entries(a.events).map(([k,v])=>[{balance:'余额事件',whisper:'碎碎念',workStatus:'工作状态'}[k],v.flat()]),['睡觉',a.sleep.flatMap(s=>[...s.start,...s.loop,...s.end])]];
fs.writeFileSync('src/catalog.js',`// Catalog adapted from PC2005-cloud/dsh-pet (MIT), commit 31aa345.\nexport const CATALOG = ${JSON.stringify(groups.map(([category,names])=>({category,names})),null,2)};\n`);
console.log(groups.reduce((n,g)=>n+g[1].length,0),'reference actions imported');
