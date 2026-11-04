import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTIONS, OUTFITS, findAction} from '../src/actions.js';

test('the theater only exposes the user action manifest', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(new URL('../docs/video-production/video-production-manifest.json', import.meta.url)));
  assert.deepEqual(ACTIONS.map(({id, name}) => ({id, name})), manifest.actions.map(({id, name}) => ({id, name})));
  assert.equal(findAction('待机呼吸休闲'), undefined);
  assert.equal(findAction('sleep-start').media, undefined);
  assert.equal(findAction('sleep-wake').media, undefined);
});

test('all four outfits have matching source sprites',async()=>{const fs=await import('node:fs/promises');for(const o of OUTFITS){const b=await fs.readFile(new URL('../assets/'+o.file,import.meta.url));assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b[25],6,'RGBA required');if(o.closed)await fs.access(new URL('../assets/'+o.closed,import.meta.url));}});
