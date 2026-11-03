import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
export const name='luna-pet';export const inject=['webServer'];
const root=fileURLToPath(new URL('../public/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
export function apply(ctx){
 const server=ctx.get('webServer');
 return ctx.effect(()=>server.register({kind:'prefix',path:'/luna-pet-static',handler:async(req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  try{const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname).slice('/luna-pet-static'.length),file=path.resolve(root,'.'+rel);
   if(!file.startsWith(root)||file===root||!rel.startsWith('/')){res.writeHead(403).end();return;}
   const data=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','content-length':data.length,'x-content-type-options':'nosniff','cache-control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404).end('Not found');}
 }}));
}
