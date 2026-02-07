// storage.js — localStorage save/load

const STORAGE_KEY = 'sea_sweep_save';

const Storage = {
  getDefault() {
    return {
      unlockedLevel: 1,
      stars: {},         // { "1": 3, "2": 2, ... }
      boosters: { bomb: 1, lightning: 0, wave: 0 },
      totalGamesPlayed: 0,
      soundEnabled: true,
      dailyBonusDate: null,
      language: null,
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
