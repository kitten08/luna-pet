import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LOCAL_MOTIONS} from '../src/local-motions.js';

const root = new URL('../', import.meta.url);
test('every curated animation is present and the eight approved daily clips retain their hashes', async () => {
 const approved = JSON.parse(await readFile(new URL('docs/approved-original-clips.json',root)));
 const ledger = JSON.parse(await readFile(new URL('docs/motion-release.json',root)));
 assert.equal(Object.keys(approved).length,8);
 assert.equal(LOCAL_MOTIONS.length,80);
 for (const media of LOCAL_MOTIONS) {
  const data = await readFile(new URL(media.src,root));
  assert.equal(data.toString('hex',0,4),'1a45dfa3',media.src);
  const hash = createHash('sha256').update(data).digest('hex');
  if (media.outfit==='original' && approved[media.id]) assert.equal(hash,approved[media.id],media.src);
  assert.equal(hash,ledger.clips[media.outfit][media.id].sha256,media.src);
 }
});
