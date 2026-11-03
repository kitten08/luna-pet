import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'dist'),{recursive:true});
for(const entry of ['index.html','pet.html','src','assets'])await fs.cp(path.join(root,entry),path.join(root,'dist',entry),{recursive:true});
const ext=path.join(root,'builds/browser-extension');await fs.mkdir(ext,{recursive:true});
for(const entry of ['index.html','pet.html','src','assets'])await fs.cp(path.join(root,entry),path.join(ext,entry),{recursive:true});
for(const entry of ['manifest.json','background.js','content.js'])await fs.copyFile(path.join(root,'extension',entry),path.join(ext,entry));
const dsh=path.join(root,'builds/dsh-plugin');await fs.mkdir(dsh,{recursive:true});await fs.cp(path.join(root,'dsh-plugin'),dsh,{recursive:true});await fs.cp(path.join(root,'dist'),path.join(dsh,'public'),{recursive:true});
for(const f of ['LICENSE','THIRD_PARTY_NOTICES.md'])try{await fs.copyFile(path.join(root,f),path.join(dsh,f));}catch{}
console.log('Built website → dist/, browser extension → builds/browser-extension/, DSH plugin → builds/dsh-plugin/');
