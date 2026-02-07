// storage.js — localStorage save/load with lives timer

const STORAGE_KEY = 'sea_sweep_save';
const MAX_LIVES = 5;
const LIFE_REGEN_MS = 20 * 60 * 1000; // 20 minutes

const Storage = {
  getDefault() {
    return {
      unlockedLevel: 1,
      stars: {},         // { "1": 3, "2": 2, ... }
      lives: MAX_LIVES,
      livesTimestamp: Date.now(),
      boosters: { bomb: 1, lightning: 0, wave: 0 },
      totalGamesPlayed: 0,
      soundEnabled: true,
      dailyBonusDate: null,
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefault();
      const data = JSON.parse(raw);
      // Merge with defaults to handle new fields
      return { ...this.getDefault(), ...data };
    } catch {
      return this.getDefault();
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable — silently fail
    }
  },

  // Calculate current lives based on time elapsed since last save
  updateLives(data) {
    if (data.lives >= MAX_LIVES) {
      data.livesTimestamp = Date.now();
      return data;
    }

    const now = Date.now();
    const elapsed = now - data.livesTimestamp;
    const livesGained = Math.floor(elapsed / LIFE_REGEN_MS);

    if (livesGained > 0) {
      data.lives = Math.min(MAX_LIVES, data.lives + livesGained);
      data.livesTimestamp = now - (elapsed % LIFE_REGEN_MS);
    }

    return data;
  },

  // Get time until next life regenerates (in ms)
  getNextLifeTime(data) {
    if (data.lives >= MAX_LIVES) return 0;
    const elapsed = Date.now() - data.livesTimestamp;
    return Math.max(0, LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS));
  },

  spendLife(data) {
    if (data.lives <= 0) return false;
    if (data.lives === MAX_LIVES) {
      data.livesTimestamp = Date.now();
    }
    data.lives--;
    this.save(data);
    return true;
  },

  completeLevel(data, levelNum, starsEarned) {
    data.totalGamesPlayed++;
    if (starsEarned > (data.stars[levelNum] || 0)) {
      data.stars[levelNum] = starsEarned;
    }
    if (levelNum >= data.unlockedLevel) {
      data.unlockedLevel = levelNum + 1;
    }
    this.save(data);
  },

  // Check and award daily bonus
  checkDailyBonus(data) {
    const today = new Date().toISOString().slice(0, 10);
    if (data.dailyBonusDate !== today) {
      data.dailyBonusDate = today;
      data.boosters.bomb = (data.boosters.bomb || 0) + 1;
      this.save(data);
      return true;
    }
    return false;
  },

  resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
