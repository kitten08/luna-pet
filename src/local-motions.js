import {CURATED_MEDIA} from './curated-media.js';

const original = ['new-05', 'new-06', 'new-07', 'new-08', 'new-09',
  'sleep-start', 'sleep-wake', 'sleep-loop'].map(id => ({
  id,
  outfit: 'original',
  src: `assets/motions/${id}.webm`,
  duration: 10,
  fps: 20,
  frames: 200,
  loop: id === 'sleep-loop',
  actorHeight: (id.startsWith('sleep-') ? 461 : 440) / 576,
  floor: 565 / 576
}));

export const LOCAL_MOTIONS = [...original, ...CURATED_MEDIA];
