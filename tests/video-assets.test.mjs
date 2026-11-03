import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {VIDEO_CLIPS,VIDEO_ACTIONS} from '../src/video-catalog.js';

test('published video entries match downloaded media hashes and production ledger',async()=>{
 const root=new URL('../',import.meta.url);
 const ledger=JSON.parse(await fs.readFile(new URL('docs/video-production/generation-results.json',root),'utf8'));
 assert.equal(VIDEO_CLIPS.length,ledger.clips.length);
 assert.ok(VIDEO_CLIPS.length>0);
 for(const clip of VIDEO_CLIPS){
  const source=ledger.clips.find(c=>c.action_id===clip.id);
  assert.ok(source,clip.id);
  const data=await fs.readFile(new URL(clip.src,root));
  assert.equal(data.toString('ascii',4,8),'ftyp');
  assert.equal(createHash('sha256').update(data).digest('hex'),source.sha256);
  assert.equal(clip.frames,source.frames);assert.equal(clip.fps,source.fps);
  assert.equal(clip.duration,source.duration_seconds);
  assert.equal(source.status,'sample_available_full_action_pending');
  const sheet=await fs.readFile(new URL(clip.sheet,root));
  assert.equal(sheet.toString('hex',0,2),'ffd8');
 }
 assert.equal(VIDEO_ACTIONS.length,117);
 assert.equal(new Set(VIDEO_ACTIONS.map(a=>a.id)).size,117);
 assert.equal(ledger.full_10_second_actions_completed,0);
 assert.equal(ledger.paid_spend,0);
});
