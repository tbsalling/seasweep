// i18n.js — Bilingual support (English / Danish)

const I18n = {
  currentLang: 'en',

  strings: {
    en: {
      // Main menu
      menu_title: 'Sea Sweep',
      menu_subtitle: 'A Maritime Match-3 Adventure',
      menu_play: '▶ Play',
      menu_level_select: '📋 Level Select',
      menu_help: '❓ How to Play',
      menu_daily_bonus: '🎁 Daily Bonus!',
      menu_stats: 'Level {level} • {stars} ⭐',
      menu_copyright: '© {year} Thomas Borg Salling',

      // Level select
      levelselect_title: 'Select Level',
      levelselect_back: '← Back',

      // HUD
      hud_level: 'Level {level}',
      hud_score: 'Score: {score}',
      hud_moves: 'Moves: {moves}',

      // Boosters
      booster_bomb: 'Bomb',
      booster_lightning: 'Zap',
      booster_wave: 'Wave',
      booster_tap_prompt: 'Tap a tile to use {booster}!',

      // Level complete
      complete_title: 'Level Complete!',
      complete_score: 'Score: {score}',
      complete_next: 'Next Level',
      complete_levels: 'Levels',

      // Game over
      gameover_title: 'Out of Moves!',
      gameover_score: 'Score: {score}',
      gameover_ad: 'Watch an ad for +5 moves?',
      gameover_watch: '📺 +5 Moves',
      gameover_retry: 'Retry',
      gameover_levels: 'Levels',

      // Pause
      pause_title: 'Paused',
      pause_resume: '▶ Resume',
      pause_retry: '↻ Retry',
      pause_levels: 'Levels',

      // Daily bonus
      daily_title: '🎁 Daily Bonus!',
      daily_welcome: 'Welcome back, Captain!',
      daily_reward: 'You earned a free Bomb booster! 🔥',
      daily_claim: 'Claim!',

      // Help page
      help_title: 'How to Play',
      help_back: '← Back',
      help_basics: 'Basics',
      help_basics_text: 'Swap adjacent tiles to match 3 or more of the same kind. Complete all objectives before running out of moves.',
      help_tiles: 'Tiles',
      help_tile_fish: 'Fish',
      help_tile_shell: 'Shell',
      help_tile_starfish: 'Starfish',
      help_tile_seahorse: 'Seahorse',
      help_tile_anchor: 'Anchor',
      help_tile_treasure: 'Treasure',
      help_specials: 'Special Tiles',
      help_special_fire_name: 'Fire (match 4)',
      help_special_fire_desc: 'Created by matching 4 tiles in a row. Clears a 3×3 area when matched.',
      help_special_lightning_name: 'Lightning (match 5+)',
      help_special_lightning_desc: 'Created by matching 5 or more tiles. Clears all tiles of the same type.',
      help_special_wave_name: 'Wave (L/T shape)',
      help_special_wave_desc: 'Created by matching tiles in an L or T shape. Clears an entire row and column.',
      help_obstacles: 'Obstacles',
      help_obstacle_ice_name: 'Ice (HP 2)',
      help_obstacle_ice_desc: 'Takes 2 matches to break. Tiles inside can still be matched.',
      help_obstacle_seaweed_name: 'Seaweed (HP 3)',
      help_obstacle_seaweed_desc: 'Blocks swapping and matching. Match next to it to damage it.',
      help_obstacle_fog_name: 'Fog (HP 1)',
      help_obstacle_fog_desc: 'Hides the tile underneath. Match next to it or use a special to clear.',
      help_boosters: 'Boosters',
      help_boosters_text: 'Use boosters from the bar below the board during gameplay. Tap one, then tap a tile to activate it.',
      help_booster_bomb_name: 'Bomb',
      help_booster_bomb_desc: 'Clears the tapped tile and all 8 surrounding tiles.',
      help_booster_lightning_name: 'Lightning',
      help_booster_lightning_desc: 'Clears every tile of the same type as the one you tap.',
      help_booster_wave_name: 'Wave',
      help_booster_wave_desc: 'Clears the entire row and column of the tapped tile.',
      help_boosters_earn: 'Boosters are earned by completing levels (every 8th and 15th level) and from daily bonuses.',
      help_tips: 'Tips',
      help_tip_hint: '• Wait 5 seconds and a hint will highlight a valid move.',
      help_tip_shuffle: '• If no moves are available, the board shuffles automatically.',
      help_tip_specials: '• Special tiles are more powerful — aim for matches of 4 or 5!',
      help_tip_obstacles: '• Clear obstacles early to open up the board.',
    },

    da: {
      // Hovedmenu
      menu_title: 'Sea Sweep',
      menu_subtitle: 'Et maritimt match-3 eventyr',
      menu_play: '▶ Spil',
      menu_level_select: '📋 Vælg bane',
      menu_help: '❓ Sådan spiller du',
      menu_daily_bonus: '🎁 Daglig bonus!',
      menu_stats: 'Bane {level} • {stars} ⭐',
      menu_copyright: '© {year} Thomas Borg Salling',

      // Banevælger
      levelselect_title: 'Vælg bane',
      levelselect_back: '← Tilbage',

      // HUD
      hud_level: 'Bane {level}',
      hud_score: 'Point: {score}',
      hud_moves: 'Træk: {moves}',

      // Boosters
      booster_bomb: 'Bombe',
      booster_lightning: 'Lyn',
      booster_wave: 'Bølge',
      booster_tap_prompt: 'Tryk på en brik for at bruge {booster}!',

      // Bane gennemført
      complete_title: 'Bane gennemført!',
      complete_score: 'Point: {score}',
      complete_next: 'Næste bane',
      complete_levels: 'Baner',

      // Spil slut
      gameover_title: 'Ingen træk tilbage!',
      gameover_score: 'Point: {score}',
      gameover_ad: 'Se en reklame for +5 træk?',
      gameover_watch: '📺 +5 Træk',
      gameover_retry: 'Prøv igen',
      gameover_levels: 'Baner',

      // Pause
      pause_title: 'Pause',
      pause_resume: '▶ Fortsæt',
      pause_retry: '↻ Prøv igen',
      pause_levels: 'Baner',

      // Daglig bonus
      daily_title: '🎁 Daglig bonus!',
      daily_welcome: 'Velkommen tilbage, kaptajn!',
      daily_reward: 'Du har fået en gratis bombe-booster! 🔥',
      daily_claim: 'Hent!',

      // Hjælp
      help_title: 'Sådan spiller du',
      help_back: '← Tilbage',
      help_basics: 'Grundregler',
      help_basics_text: 'Byt tilstødende brikker for at matche 3 eller flere af samme slags. Gennemfør alle mål, inden du løber tør for træk.',
      help_tiles: 'Brikker',
      help_tile_fish: 'Fisk',
      help_tile_shell: 'Musling',
      help_tile_starfish: 'Søstjerne',
      help_tile_seahorse: 'Søhest',
      help_tile_anchor: 'Anker',
      help_tile_treasure: 'Skat',
      help_specials: 'Specialbrikker',
      help_special_fire_name: 'Ild (match 4)',
      help_special_fire_desc: 'Skabes ved at matche 4 brikker i træk. Rydder et 3×3 felt.',
      help_special_lightning_name: 'Lyn (match 5+)',
      help_special_lightning_desc: 'Skabes ved at matche 5 eller flere brikker. Rydder alle brikker af samme type.',
      help_special_wave_name: 'Bølge (L/T-form)',
      help_special_wave_desc: 'Skabes ved at matche brikker i en L- eller T-form. Rydder en hel række og kolonne.',
      help_obstacles: 'Forhindringer',
      help_obstacle_ice_name: 'Is (HP 2)',
      help_obstacle_ice_desc: 'Kræver 2 matches at bryde. Brikker indeni kan stadig matches.',
      help_obstacle_seaweed_name: 'Tang (HP 3)',
      help_obstacle_seaweed_desc: 'Blokerer bytning og matching. Match ved siden af for at beskadige den.',
      help_obstacle_fog_name: 'Tåge (HP 1)',
      help_obstacle_fog_desc: 'Skjuler brikken nedenunder. Match ved siden af eller brug en special for at fjerne.',
      help_boosters: 'Boosters',
      help_boosters_text: 'Brug boosters fra baren under brættet under spillet. Tryk på en, og tryk derefter på en brik for at aktivere den.',
      help_booster_bomb_name: 'Bombe',
      help_booster_bomb_desc: 'Rydder den valgte brik og alle 8 omkringliggende brikker.',
      help_booster_lightning_name: 'Lyn',
      help_booster_lightning_desc: 'Rydder alle brikker af samme type som den, du trykker på.',
      help_booster_wave_name: 'Bølge',
      help_booster_wave_desc: 'Rydder hele rækken og kolonnen for den valgte brik.',
      help_boosters_earn: 'Boosters optjenes ved at gennemføre baner (hver 8. og 15. bane) og fra daglige bonusser.',
      help_tips: 'Tips',
      help_tip_hint: '• Vent 5 sekunder, og et hint fremhæver et gyldigt træk.',
      help_tip_shuffle: '• Hvis der ikke er nogen træk, blandes brættet automatisk.',
      help_tip_specials: '• Specialbrikker er stærkere — gå efter matches på 4 eller 5!',
      help_tip_obstacles: '• Ryd forhindringer tidligt for at åbne brættet op.',
    },
  },

  t(key, params) {
    let str = this.strings[this.currentLang][key] || this.strings.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
      }
    }
    return str;
  },

  init(saveData) {
    if (saveData.language) {
      this.currentLang = saveData.language;
    } else {
      const browserLang = (navigator.language || '').toLowerCase();
      this.currentLang = browserLang.startsWith('da') ? 'da' : 'en';
      saveData.language = this.currentLang;
    }
    this._applyLang();
  },

  setLanguage(lang, saveData) {
    this.currentLang = lang;
    saveData.language = lang;
    Storage.save(saveData);
    this._applyLang();
  },

  toggle(saveData) {
    this.setLanguage(this.currentLang === 'da' ? 'en' : 'da', saveData);
  },

  _applyLang() {
    document.documentElement.lang = this.currentLang;
    document.title = this.currentLang === 'da'
      ? 'Sea Sweep — Maritimt Match-3'
      : 'Sea Sweep — Maritime Match-3';
  },
};

// Global shorthand
function t(key, params) {
  return I18n.t(key, params);
}
