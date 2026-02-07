// particles.js — Particle effects for tile clears and combos

class Particle {
  constructor(x, y, props) {
    this.x = x;
    this.y = y;
    this.vx = props.vx || (Math.random() - 0.5) * 6;
    this.vy = props.vy || (Math.random() - 0.5) * 6 - 2;
    this.life = props.life || 600;
    this.maxLife = this.life;
    this.size = props.size || 4 + Math.random() * 4;
    this.color = props.color || '#fff';
    this.gravity = props.gravity || 0.15;
    this.emoji = props.emoji || null;
    this.emojiSize = props.emojiSize || 20;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.dead = false;
  }

  update(dt) {
    const factor = dt / 16.67; // normalize to 60fps
    this.x += this.vx * factor;
    this.y += this.vy * factor;
    this.vy += this.gravity * factor;
    this.rotation += this.rotationSpeed * factor;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;

    if (this.emoji) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = `${this.emojiSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, props = {}) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, {
        ...props,
        vx: (props.vx || 0) + (Math.random() - 0.5) * (props.spread || 8),
        vy: (props.vy || 0) + (Math.random() - 0.5) * (props.spread || 8) - 2,
      }));
    }
  }

  emitEmoji(x, y, emoji, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, {
        emoji,
        emojiSize: 16 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 5,
        vy: -3 - Math.random() * 4,
        life: 800 + Math.random() * 400,
        gravity: 0.1,
      }));
    }
  }

  burstCircle(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 3 + Math.random() * 3;
      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        life: 400 + Math.random() * 200,
        gravity: 0.05,
      }));
    }
  }

  comboText(x, y, text) {
    // Floating text particle
    this.particles.push(new Particle(x, y, {
      emoji: text,
      emojiSize: 28,
      vx: 0,
      vy: -2,
      life: 1000,
      gravity: 0,
    }));
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  get active() {
    return this.particles.length > 0;
  }

  clear() {
    this.particles = [];
  }
}
