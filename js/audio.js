// audio.js — Web Audio API sound manager (synthesized, no mp3 files needed)

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(frequency, duration, type = 'sine', volume = 0.15) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration, volume = 0.1) {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  // Game sounds
  swap() {
    this.playTone(400, 0.1, 'sine', 0.1);
    this.playTone(500, 0.1, 'sine', 0.08);
  }

  match(comboLevel = 0) {
    const baseFreq = 523 + comboLevel * 80; // C5 and up
    this.playTone(baseFreq, 0.15, 'sine', 0.12);
    setTimeout(() => this.playTone(baseFreq * 1.25, 0.15, 'sine', 0.1), 50);
    setTimeout(() => this.playTone(baseFreq * 1.5, 0.2, 'sine', 0.08), 100);
  }

  combo(level) {
    const freq = 600 + level * 100;
    this.playTone(freq, 0.2, 'triangle', 0.15);
    setTimeout(() => this.playTone(freq * 1.33, 0.3, 'triangle', 0.12), 80);
  }

  specialCreate() {
    this.playTone(800, 0.1, 'square', 0.08);
    this.playTone(1000, 0.15, 'square', 0.06);
    setTimeout(() => this.playTone(1200, 0.2, 'sine', 0.1), 100);
  }

  specialActivate() {
    this.playNoise(0.15, 0.12);
    this.playTone(300, 0.3, 'sawtooth', 0.08);
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.06), 100);
  }

  invalidSwap() {
    this.playTone(200, 0.15, 'square', 0.08);
    setTimeout(() => this.playTone(150, 0.15, 'square', 0.06), 100);
  }

  levelComplete() {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.12), i * 120);
    });
  }

  levelFail() {
    this.playTone(300, 0.3, 'triangle', 0.12);
    setTimeout(() => this.playTone(250, 0.3, 'triangle', 0.1), 200);
    setTimeout(() => this.playTone(200, 0.5, 'triangle', 0.08), 400);
  }

  buttonClick() {
    this.playTone(600, 0.05, 'sine', 0.08);
  }

  starEarned() {
    this.playTone(880, 0.15, 'sine', 0.1);
    setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.1), 100);
  }
}
