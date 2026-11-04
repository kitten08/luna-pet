import {ACTIONS, OUTFITS, findAction, mediaFor, clamp} from './actions.js';

const surface = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
const ASSETS = new URL('../assets/', import.meta.url);
const idle = {id: null, name: '待机'};
const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('无法加载素材'));
  image.src = new URL(src, ASSETS).href;
});

export class PetEngine extends EventTarget {
  constructor(canvas, {reduced = matchMedia('(prefers-reduced-motion: reduce)').matches} = {}) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reduced = reduced;
    this.outfit = OUTFITS[0];
    this.images = new Map();
    this.clickIndex = 0;
    this.action = idle;
    this.running = true;
    this.autonomous = true;
    this.size = 1;
    this.x = this.y = this.vx = this.vy = 0;
    this.elapsed = this.last = this.frameCount = 0;
    this.nextAuto = 14;
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.handlers = {
      pointerdown: event => this.pointerDown(event),
      pointermove: event => this.pointerMove(event),
      pointerup: () => this.pointerUp(),
      pointercancel: () => this.cancelDrag(),
      contextmenu: event => {
        event.preventDefault();
        this.dispatchEvent(new Event('menu'));
      }
    };
    for (const [type, handler] of Object.entries(this.handlers)) canvas.addEventListener(type, handler);
    this.tick = this.tick.bind(this);
    this.raf = requestAnimationFrame(this.tick);
  }

  resize() {
    const {width, height} = this.canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.round(width * ratio));
    this.canvas.height = Math.max(1, Math.round(height * ratio));
  }

  async preload() {
    await Promise.all(OUTFITS.map(async outfit => {
      this.images.set(outfit.id, await loadImage(outfit.file));
    }));
  }

  setOutfit(id) {
    const outfit = OUTFITS.find(item => item.id === id);
    if (!outfit || !this.images.has(id)) return false;
    if (outfit !== this.outfit) this.stop();
    this.outfit = outfit;
    this.dispatchEvent(new CustomEvent('outfit', {detail: outfit}));
    return true;
  }

  get sleeping() {
    return this.action.id === 'sleep-loop' || this.action.id === 'sleep-start';
  }

  play(id, {hold = false} = {}) {
    const action = findAction(id);
    const media = mediaFor(action, this.outfit.id);
    if (!media || !this.images.has(this.outfit.id)) return false;

    const previous = this.video;
    if (previous?.readyState >= 2 && this.sleeping && action.id.startsWith('sleep-')) {
      const still = surface(previous.videoWidth, previous.videoHeight);
      still.getContext('2d').drawImage(previous, 0, 0);
      this.holdFrame = still;
    } else this.holdFrame = null;
    this.releaseVideo();
    this.activeMedia = media;
    this.action = action;
    this.running = true;
    this.dispatchEvent(new CustomEvent('action', {detail: action}));

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = Boolean(media.loop || hold);
    video.src = new URL('../' + media.src, import.meta.url).href;
    this.video = video;
    const fail = () => {
      if (this.video !== video) return;
      this.stop();
      this.dispatchEvent(new Event('mediaerror'));
    };
    video.addEventListener('error', fail, {once: true});
    video.addEventListener('ended', () => {
      if (this.video !== video) return;
      if (action.id === 'sleep-start') this.play('sleep-loop');
      else this.stop();
    }, {once: true});
    video.play().catch(() => {
      if (this.running) fail();
    });
    return true;
  }

  releaseVideo() {
    const video = this.video;
    if (!video) return;
    this.video = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  stop() {
    this.releaseVideo();
    this.activeMedia = null;
    this.holdFrame = null;
    if (this.action === idle) return;
    this.action = idle;
    this.nextAuto = this.elapsed + 14;
    this.dispatchEvent(new CustomEvent('action', {detail: idle}));
  }

  wake() {
    return this.action.id !== 'sleep-start' && this.play('sleep-wake');
  }

  beginDragAnimation() {
    return this.play('attached-006', {hold: true});
  }

  endDragAnimation() {
    if (this.action.id === 'attached-006') this.stop();
  }

  cancelDrag() {
    const moved = this.drag?.moved;
    this.drag = null;
    this.vx = this.vy = 0;
    if (moved) this.endDragAnimation();
  }

  togglePause() {
    this.running = !this.running;
    if (!this.running) this.video?.pause();
    else this.video?.play().catch(() => {});
    return this.running;
  }

  point(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
  }

  pointerDown(event) {
    if (event.button !== 0 || !this.bounds) return;
    const point = this.point(event);
    const {x, y, w, h} = this.bounds;
    if (point.x < x || point.x > x + w || point.y < y || point.y > y + h) return;
    this.canvas.setPointerCapture(event.pointerId);
    this.drag = {start: point, last: point, time: performance.now(), ox: this.x, oy: this.y};
    this.vx = this.vy = 0;
  }

  pointerMove(event) {
    if (!this.drag) return;
    const drag = this.drag;
    const point = this.point(event);
    const now = performance.now();
    const dt = Math.max(8, now - drag.time) / 1000;
    if (!drag.moved && Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > 5) {
      drag.moved = true;
      this.beginDragAnimation();
    }
    if (drag.moved) {
      this.x = drag.ox + point.x - drag.start.x;
      this.y = Math.min(0, drag.oy + point.y - drag.start.y);
      this.vx = clamp((point.x - drag.last.x) / dt, -1200, 1200);
      this.vy = clamp((point.y - drag.last.y) / dt, -1200, 1200);
    }
    drag.last = point;
    drag.time = now;
  }

  pointerUp() {
    const drag = this.drag;
    this.drag = null;
    if (!drag) return;
    if (drag.moved) {
      if (performance.now() - drag.time > 100) this.vx = this.vy = 0;
      this.endDragAnimation();
      return;
    }
    if (this.sleeping) this.wake();
    else this.play(['attached-004', 'attached-005'][this.clickIndex++ % 2]);
    this.dispatchEvent(new Event('petclick'));
  }

  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    const dt = clamp((now - (this.last || now)) / 1000, 0, 0.035);
    this.last = now;
    if (document.hidden) return;
    if (this.running) {
      this.elapsed += dt;
      this.physics(dt);
      if (this.elapsed >= this.nextAuto) {
        this.nextAuto = this.elapsed + 14 + Math.random() * 10;
        if (this.autonomous && !this.reduced && !this.drag && this.action === idle) {
          const choices = ACTIONS.filter(action => action.category === '表情互动');
          if (choices.length) this.play(choices[Math.floor(Math.random() * choices.length)].id);
        }
      }
    }
    this.draw();
    this.frameCount++;
  }

  physics(dt) {
    if (this.drag || !this.width) return;
    const range = this.width * 0.28;
    const top = -this.height * 0.12;
    if (this.y < 0 || Math.abs(this.vy) > 1) {
      this.vy += 1000 * dt;
      this.y += this.vy * dt;
      if (this.y > 0) {
        this.y = 0;
        this.vy *= -0.42;
        if (Math.abs(this.vy) < 25) this.vy = 0;
      }
    }
    this.x += this.vx * dt;
    this.vx *= Math.exp(-3 * dt);
    if (Math.abs(this.x) > range) {
      this.x = clamp(this.x, -range, range);
      this.vx *= -0.55;
    }
    if (this.y < top) {
      this.y = top;
      this.vy = Math.abs(this.vy) * 0.4;
    }
  }

  draw() {
    const {ctx, canvas, width, height} = this;
    if (!width || !height) return;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const h = Math.min(height * 0.70, width * 0.94) * this.size;
    const cx = width / 2 + this.x;
    const floor = height * 0.93 + this.y;
    const video = this.video;
    const drawable = video?.readyState >= 2 ? video : this.holdFrame;
    if (drawable) {
      const frameHeight = h / (this.activeMedia.actorHeight ?? 1);
      const w = frameHeight * (drawable.videoWidth ?? drawable.width) / (drawable.videoHeight ?? drawable.height);
      const y = floor - frameHeight * (this.activeMedia.floor ?? 1);
      this.bounds = {x: cx - w / 2, y, w, h: frameHeight};
      ctx.drawImage(drawable, cx - w / 2, y, w, frameHeight);
      return;
    }
    const image = this.images.get(this.outfit.id);
    if (!image) return;
    const sourceWidth = this.outfit.sheet ? image.width / 2 : image.width;
    const w = h * sourceWidth / image.height;
    this.bounds = {x: cx - w / 2, y: floor - h, w, h};
    ctx.drawImage(image, 0, 0, sourceWidth, image.height, cx - w / 2, floor - h, w, h);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.releaseVideo();
    for (const [type, handler] of Object.entries(this.handlers)) this.canvas.removeEventListener(type, handler);
  }
}
