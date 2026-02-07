// animation.js — Tween engine for smooth animations

const Easing = {
  linear(t) { return t; },
  easeInQuad(t) { return t * t; },
  easeOutQuad(t) { return t * (2 - t); },
  easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
  easeOutBounce(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  easeOutBack(t) {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  },
  easeOutElastic(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
};

class Tween {
  constructor(target, props) {
    this.target = target;
    this.properties = {};
    this.duration = props.duration || 300;
    this.easing = props.easing || Easing.easeInOutQuad;
    this.onComplete = props.onComplete || null;
    this.onUpdate = props.onUpdate || null;
    this.elapsed = 0;
    this.finished = false;
    this.delay = props.delay || 0;
    this.delayElapsed = 0;

    for (const key in props) {
      if (key === 'duration' || key === 'easing' || key === 'onComplete' ||
          key === 'onUpdate' || key === 'delay') continue;
      if (typeof props[key] === 'object' && props[key] !== null && 'from' in props[key] && 'to' in props[key]) {
        this.properties[key] = { from: props[key].from, to: props[key].to };
      }
    }
  }

  update(dt) {
    if (this.finished) return;

    if (this.delayElapsed < this.delay) {
      this.delayElapsed += dt;
      if (this.delayElapsed < this.delay) return;
      dt = this.delayElapsed - this.delay;
    }

    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);
    const easedT = this.easing(t);

    for (const key in this.properties) {
      const { from, to } = this.properties[key];
      this.target[key] = from + (to - from) * easedT;
    }

    if (this.onUpdate) this.onUpdate(easedT);

    if (t >= 1) {
      this.finished = true;
      if (this.onComplete) this.onComplete();
    }
  }
}

class TweenManager {
  constructor() {
    this.tweens = [];
  }

  add(target, props) {
    const tween = new Tween(target, props);
    this.tweens.push(tween);
    return tween;
  }

  update(dt) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      this.tweens[i].update(dt);
      if (this.tweens[i].finished) {
        this.tweens.splice(i, 1);
      }
    }
  }

  get active() {
    return this.tweens.length > 0;
  }

  clear() {
    this.tweens = [];
  }
}
