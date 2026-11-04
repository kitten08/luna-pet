import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTIONS, OUTFITS, findAction, mediaFor} from '../src/actions.js';

test('the current catalog has exactly twenty approved and requested actions in all four outfits', () => {
 const expected = ['new-05','new-06','new-07','new-08','new-09','sleep-start','sleep-wake','sleep-loop',
  'new-01','new-03','new-04','attached-004','attached-005','attached-009','attached-006',
  'attached-007','attached-021','attached-023','attached-024','attached-105'];
 assert.deepEqual(ACTIONS.map(action => action.id), expected);
 assert.equal(findAction('new-02'), undefined);
 assert.equal(findAction('attached-039'), undefined);
 const paths = new Set();
 for (const outfit of OUTFITS) for (const action of ACTIONS) {
  const media = mediaFor(action, outfit.id);
  assert.equal(media?.outfit, outfit.id, action.name);
  assert.equal(media.duration, 10);
  assert.equal(Boolean(media.loop), action.id === 'sleep-loop');
  paths.add(media.src);
 }
 assert.equal(paths.size,80);
});
