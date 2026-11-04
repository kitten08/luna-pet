const sleep = ['sleep-start', 'sleep-loop', 'sleep-wake'].map(id => ({
  id,
  outfit: 'original',
  src: `assets/motions/${id}.webm`,
  duration: 10,
  fps: 20,
  frames: 200,
  loop: id === 'sleep-loop',
  actorHeight: 461 / 576,
  floor: 565 / 576,
  hasAlpha: true
}));

const expressions = ['new-05', 'new-06', 'new-07', 'new-08', 'new-09'].map(id => ({
  id,
  outfit: 'original',
  src: `assets/motions/${id}.webm`,
  duration: 10,
  fps: 20,
  frames: 200,
  actorHeight: 440 / 576,
  floor: 565 / 576,
  hasAlpha: true
}));

export const LOCAL_MOTIONS = [...sleep, ...expressions];
