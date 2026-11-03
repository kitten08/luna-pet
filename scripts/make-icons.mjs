// Rasterize our code-native moon mark for the OS tray and application icon.
import fs from 'node:fs';import zlib from 'node:zlib';
const crc=b=>{let c=0xffffffff;for(const byte of b){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xedb88320:0);}return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);};
const n=1024,raw=Buffer.alloc((n*4+1)*n);
for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n*128,v=y/n*128,round=Math.hypot(Math.max(0,Math.abs(u-64)-34),Math.max(0,Math.abs(v-64)-34))<30;
 const moon=Math.hypot(u-62,v-63)<43&&Math.hypot(u-83,v-46)>39;
 const star=Math.abs(u-94)/10+Math.abs(v-48)/17<1;
 const rgb=moon?[151,128,170]:star?[198,167,107]:[234,225,238],i=y*(n*4+1)+1+x*4;raw[i]=rgb[0];raw[i+1]=rgb[1];raw[i+2]=rgb[2];raw[i+3]=round?255:0;}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(n,0);ihdr.writeUInt32BE(n,4);ihdr[8]=8;ihdr[9]=6;
fs.writeFileSync(new URL('../assets/icon.png',import.meta.url),Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
