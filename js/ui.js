// ui.js — Canvas-drawn UI: menus, HUD, modals, level select

class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.buttons = []; // {x, y, w, h, id, label}
    this.levelSelectPage = 0;
    this.levelsPerPage = 20;
  }

  clearButtons() {
    this.buttons = [];
  }

  addButton(id, label, x, y, w, h, style = {}) {
    this.buttons.push({ id, label, x, y, w, h, ...style });
  }

  hitTest(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        return btn.id;
      }
    }
    return null;
  }

  drawButton(btn) {
    const ctx = this.renderer.ctx;
    const { x, y, w, h, label } = btn;

    // Button background
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    if (btn.primary) {
      gradient.addColorStop(0, '#1a8a4a');
      gradient.addColorStop(1, '#0d6b35');
    } else if (btn.danger) {
      gradient.addColorStop(0, '#c0392b');
      gradient.addColorStop(1, '#962d22');
    } else if (btn.secondary) {
      gradient.addColorStop(0, '#2c3e50');
      gradient.addColorStop(1, '#1a252f');
    } else {
      gradient.addColorStop(0, '#1565c0');
      gradient.addColorStop(1, '#0d47a1');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Button label
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${btn.fontSize || 16}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  // ── Main Menu ──

  drawMainMenu(saveData) {
    const ctx = this.renderer.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;
    this.clearButtons();

    // Background
    this.renderer.drawBackground();

    // Ocean wave decoration
    ctx.save();
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 2;
      const yBase = h * 0.4 + i * 30;
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= w; x += 5) {
        ctx.lineTo(x, yBase + Math.sin(x * 0.02 + i) * 15);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Title
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0288d1';
    ctx.shadowBlur = 20;
    ctx.fillText('🌊 ' + t('menu_title'), w / 2, h * 0.18);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText(t('menu_subtitle'), w / 2, h * 0.25);

    // Decorative emojis
    ctx.font = '36px serif';
    ctx.fillText('🐟  🐚  ⭐  🦑  ⚓  💎', w / 2, h * 0.33);

    // Buttons
    const btnW = 220;
    const btnH = 50;
    const btnX = (w - btnW) / 2;

    this.addButton('play', t('menu_play'), btnX, h * 0.45, btnW, btnH, { primary: true, fontSize: 20 });
    this.addButton('levelSelect', t('menu_level_select'), btnX, h * 0.45 + 65, btnW, btnH, { secondary: true });
    this.addButton('help', t('menu_help'), btnX, h * 0.45 + 130, btnW, btnH, { secondary: true });

    // Daily bonus indicator
    const today = new Date().toISOString().slice(0, 10);
    if (saveData.dailyBonusDate !== today) {
      this.addButton('dailyBonus', t('menu_daily_bonus'), btnX, h * 0.45 + 195, btnW, btnH, { primary: true });
    }

    // Stats
    ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    const totalStars = Object.values(saveData.stars).reduce((a, b) => a + b, 0);
    ctx.fillText(t('menu_stats', { level: saveData.unlockedLevel, stars: totalStars }), w / 2, h * 0.87);

    // Copyright
    ctx.fillStyle = 'rgba(200, 230, 255, 0.45)';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t('menu_copyright', { year: new Date().getFullYear() }), w / 2, h - 8);
    ctx.textBaseline = 'middle';

    // Language toggle (flag shows target language)
    this.addButton('lang', I18n.currentLang === 'da' ? '🇬🇧' : '🇩🇰', w - 95, 10, 40, 40, { secondary: true, fontSize: 20 });

    // Sound toggle
    this.addButton('sound', saveData.soundEnabled ? '🔊' : '🔇', w - 50, 10, 40, 40, { secondary: true, fontSize: 20 });

    // Draw all buttons
    for (const btn of this.buttons) {
      this.drawButton(btn);
    }
  }

  // ── Level Select ──

  drawLevelSelect(saveData) {
    const ctx = this.renderer.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;
    this.clearButtons();

    this.renderer.drawBackground();

    // Title
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('levelselect_title'), w / 2, 35);

    // Back button
    this.addButton('back', t('levelselect_back'), 10, 10, 80, 36, { secondary: true, fontSize: 14 });

    // Level grid
    const cols = 5;
    const cellSize = 52;
    const gap = 8;
    const gridW = cols * (cellSize + gap) - gap;
    const startX = (w - gridW) / 2;
    const startY = 60;
    const startLevel = this.levelSelectPage * this.levelsPerPage + 1;

    for (let i = 0; i < this.levelsPerPage; i++) {
      const lvl = startLevel + i;
      if (lvl > LevelGenerator.getTotalLevels()) break;

      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cellSize + gap);
      const y = startY + row * (cellSize + gap + 10);

      const unlocked = lvl <= saveData.unlockedLevel;
      const stars = saveData.stars[lvl] || 0;

      // Cell background
      if (unlocked) {
        ctx.fillStyle = lvl === saveData.unlockedLevel ? '#1a8a4a' : '#1565c0';
      } else {
        ctx.fillStyle = '#2c3e50';
      }
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 6);
      ctx.fill();

      if (unlocked) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Level number
      ctx.fillStyle = unlocked ? '#fff' : '#555';
      ctx.font = `bold 18px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unlocked ? lvl : '🔒', x + cellSize / 2, y + cellSize / 2 - 6);

      // Stars
      if (stars > 0) {
        ctx.font = '10px serif';
        const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        ctx.fillText(starStr, x + cellSize / 2, y + cellSize - 10);
      }

      if (unlocked) {
        this.addButton(`level_${lvl}`, '', x, y, cellSize, cellSize);
      }
    }

    // Page navigation
    const totalPages = Math.ceil(LevelGenerator.getTotalLevels() / this.levelsPerPage);
    if (this.levelSelectPage > 0) {
      this.addButton('prevPage', '◀', w / 2 - 80, h - 55, 50, 40, { secondary: true });
    }
    ctx.fillStyle = 'rgba(200,230,255,0.5)';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.levelSelectPage + 1} / ${totalPages}`, w / 2, h - 30);
    if (this.levelSelectPage < totalPages - 1) {
      this.addButton('nextPage', '▶', w / 2 + 30, h - 55, 50, 40, { secondary: true });
    }

    for (const btn of this.buttons) {
      if (btn.id.startsWith('level_') || !btn.label) continue;
      this.drawButton(btn);
    }
  }

  // ── In-Game HUD ──

  drawHUD(gameState, saveData) {
    const ctx = this.renderer.ctx;
    const w = this.renderer.width;

    // Top bar background
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fillRect(0, 0, w, 38);

    // Level number
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(t('hud_level', { level: gameState.currentLevel }), 10, 24);

    // Score
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(t('hud_score', { score: gameState.score }), w / 2, 24);

    // Moves
    const movesColor = gameState.movesLeft <= 3 ? '#ff5252' : '#fff';
    ctx.fillStyle = movesColor;
    ctx.textAlign = 'right';
    ctx.fillText(t('hud_moves', { moves: gameState.movesLeft }), w - 45, 24);

    // Objectives bar (below grid)
    const objY = this.renderer.boardOffsetY + this.renderer.tileSize * (gameState.boardHeight || 7) + 15;
    ctx.fillStyle = 'rgba(0, 20, 40, 0.6)';
    ctx.fillRect(0, objY - 5, w, 35);

    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const objSpacing = w / (gameState.objectives.length + 1);

    gameState.objectives.forEach((obj, i) => {
      const ox = objSpacing * (i + 1);
      if (obj.type === 'score') {
        const done = gameState.score >= obj.target;
        ctx.fillStyle = done ? '#4caf50' : '#ccc';
        ctx.fillText(`🎯 ${gameState.score}/${obj.target}`, ox, objY + 14);
      } else if (obj.type === 'collect') {
        const done = obj.current >= obj.target;
        ctx.fillStyle = done ? '#4caf50' : '#ccc';
        ctx.fillText(`${obj.emoji} ${obj.current}/${obj.target}`, ox, objY + 14);
      }
    });

    // Boosters bar
    this.clearButtons();
    const boosterY = objY + 35;
    const boosterSize = 44;
    const boosterTypes = [
      { key: 'bomb', emoji: '🔥' },
      { key: 'lightning', emoji: '⚡' },
      { key: 'wave', emoji: '🌊' },
    ];
    const boosterStartX = (w - boosterTypes.length * (boosterSize + 10)) / 2;

    boosterTypes.forEach((b, i) => {
      const bx = boosterStartX + i * (boosterSize + 10);
      const count = saveData.boosters[b.key] || 0;

      ctx.fillStyle = count > 0 ? 'rgba(20, 60, 100, 0.8)' : 'rgba(30, 30, 30, 0.5)';
      ctx.beginPath();
      ctx.roundRect(bx, boosterY, boosterSize, boosterSize, 6);
      ctx.fill();

      ctx.font = '20px serif';
      ctx.fillStyle = count > 0 ? '#fff' : '#555';
      ctx.textAlign = 'center';
      ctx.fillText(b.emoji, bx + boosterSize / 2, boosterY + boosterSize / 2 + 2);

      if (count > 0) {
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = '#4fc3f7';
        ctx.fillText(`×${count}`, bx + boosterSize - 8, boosterY + boosterSize - 4);

        this.addButton(`booster_${b.key}`, '', bx, boosterY, boosterSize, boosterSize);
      }
    });

    // Pause button
    this.addButton('pause', '⏸', w - 40, 2, 34, 34, { secondary: true, fontSize: 16 });
    this.drawButton(this.buttons[this.buttons.length - 1]);
  }

  // ── Modals ──

  drawModal(title, body, buttons) {
    const ctx = this.renderer.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);

    // Calculate modal height based on content
    const bodyHeight = body.length * 24;
    const btnH = 44;
    const btnGap = 10;
    const buttonsHeight = buttons.length * (btnH + btnGap);
    const mh = 70 + bodyHeight + 20 + buttonsHeight + 20;
    const mw = Math.min(320, w - 40);
    const mx = (w - mw) / 2;
    const my = (h - mh) / 2;

    ctx.fillStyle = '#0d2847';
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 12);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, my + 40);

    // Body lines
    ctx.fillStyle = '#ccc';
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    body.forEach((line, i) => {
      ctx.fillText(line, w / 2, my + 75 + i * 24);
    });

    // Buttons — stacked vertically, centered
    const btnW = Math.min(220, mw - 40);
    const btnStartX = (w - btnW) / 2;
    const btnStartY = my + 75 + bodyHeight + 20;

    buttons.forEach((b, i) => {
      const by = btnStartY + i * (btnH + btnGap);
      this.addButton(b.id, b.label, btnStartX, by, btnW, btnH, b.style || {});
      this.drawButton(this.buttons[this.buttons.length - 1]);
    });
  }

  drawLevelComplete(gameState, starsEarned) {
    this.clearButtons();
    const starDisplay = '⭐'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned);

    this.drawModal(t('complete_title'), [
      starDisplay,
      '',
      t('complete_score', { score: gameState.score }),
    ], [
      { id: 'nextLevel', label: t('complete_next'), style: { primary: true } },
      { id: 'toLevelSelect', label: t('complete_levels'), style: { secondary: true } },
    ]);
  }

  drawGameOver(gameState, hasAds) {
    this.clearButtons();
    const btns = [];
    if (hasAds) {
      btns.push({ id: 'watchAd', label: t('gameover_watch'), style: { primary: true } });
    }
    btns.push({ id: 'retry', label: t('gameover_retry'), style: {} });
    btns.push({ id: 'toLevelSelect', label: t('gameover_levels'), style: { secondary: true } });

    this.drawModal(t('gameover_title'), [
      t('gameover_score', { score: gameState.score }),
      '',
      hasAds ? t('gameover_ad') : '',
    ], btns);
  }

  drawPauseMenu() {
    this.clearButtons();
    this.drawModal(t('pause_title'), [], [
      { id: 'resume', label: t('pause_resume'), style: { primary: true } },
      { id: 'retry', label: t('pause_retry'), style: {} },
      { id: 'toLevelSelect', label: t('pause_levels'), style: { secondary: true } },
    ]);
  }

  drawDailyBonus() {
    this.clearButtons();
    this.drawModal(t('daily_title'), [
      t('daily_welcome'),
      '',
      t('daily_reward'),
    ], [
      { id: 'claimBonus', label: t('daily_claim'), style: { primary: true } },
    ]);
  }

  // ── Help Page ──

  drawHelp(scrollY) {
    const ctx = this.renderer.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;
    this.clearButtons();

    this.renderer.drawBackground();

    // Header bar (fixed, not scrolled)
    const headerH = 50;
    ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
    ctx.fillRect(0, 0, w, headerH);

    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('help_title'), w / 2, headerH / 2);

    this.addButton('back', t('help_back'), 10, 8, 80, 34, { secondary: true, fontSize: 14 });

    // Clip content area below header
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, headerH, w, h - headerH);
    ctx.clip();

    // Content drawing helper
    const margin = 20;
    const contentW = w - margin * 2;
    let y = headerH + 20 - scrollY;

    const drawSection = (title) => {
      ctx.fillStyle = '#4fc3f7';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(title, margin, y);
      y += 28;
    };

    const drawText = (text, indent) => {
      ctx.fillStyle = '#ccc';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const x = margin + (indent || 0);
      // Word-wrap
      const words = text.split(' ');
      let line = '';
      const maxW = contentW - (indent || 0);
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW) {
          ctx.fillText(line, x, y);
          y += 20;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        ctx.fillText(line, x, y);
        y += 20;
      }
    };

    const drawItem = (emoji, name, desc) => {
      ctx.font = '24px serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(emoji, margin + 4, y - 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(name, margin + 38, y);
      y += 22;
      drawText(desc, 38);
      y += 6;
    };

    // ── Basics ──
    drawSection(t('help_basics'));
    drawText(t('help_basics_text'));
    y += 10;

    // ── Tiles ──
    drawSection(t('help_tiles'));
    const tiles = [
      ['🐟', t('help_tile_fish')], ['🐚', t('help_tile_shell')], ['⭐', t('help_tile_starfish')],
      ['🦑', t('help_tile_seahorse')], ['⚓', t('help_tile_anchor')], ['💎', t('help_tile_treasure')],
    ];
    // Draw tiles in a row
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const tileSpacing = contentW / tiles.length;
    for (let i = 0; i < tiles.length; i++) {
      const tx = margin + tileSpacing * (i + 0.5);
      ctx.fillText(tiles[i][0], tx, y);
      ctx.fillStyle = '#aaa';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.fillText(tiles[i][1], tx, y + 32);
      ctx.font = '28px serif';
    }
    y += 52;

    // ── Special Tiles ──
    drawSection(t('help_specials'));
    drawItem('🔥', t('help_special_fire_name'), t('help_special_fire_desc'));
    drawItem('⚡', t('help_special_lightning_name'), t('help_special_lightning_desc'));
    drawItem('🌊', t('help_special_wave_name'), t('help_special_wave_desc'));
    y += 4;

    // ── Obstacles ──
    drawSection(t('help_obstacles'));
    drawItem('🧊', t('help_obstacle_ice_name'), t('help_obstacle_ice_desc'));
    drawItem('🌿', t('help_obstacle_seaweed_name'), t('help_obstacle_seaweed_desc'));
    drawItem('🌫️', t('help_obstacle_fog_name'), t('help_obstacle_fog_desc'));
    y += 4;

    // ── Boosters ──
    drawSection(t('help_boosters'));
    drawText(t('help_boosters_text'));
    y += 4;
    drawItem('🔥', t('help_booster_bomb_name'), t('help_booster_bomb_desc'));
    drawItem('⚡', t('help_booster_lightning_name'), t('help_booster_lightning_desc'));
    drawItem('🌊', t('help_booster_wave_name'), t('help_booster_wave_desc'));
    drawText(t('help_boosters_earn'));
    y += 10;

    // ── Tips ──
    drawSection(t('help_tips'));
    drawText(t('help_tip_hint'));
    y += 2;
    drawText(t('help_tip_shuffle'));
    y += 2;
    drawText(t('help_tip_specials'));
    y += 2;
    drawText(t('help_tip_obstacles'));
    y += 30;

    ctx.restore();

    // Calculate max scroll for clamping (store on UI for main.js to read)
    this.helpContentHeight = y + scrollY - headerH;
    this.helpViewHeight = h - headerH;

    // Draw buttons (on top of clip)
    for (const btn of this.buttons) {
      this.drawButton(btn);
    }

    // Scroll indicator
    if (this.helpContentHeight > this.helpViewHeight) {
      const barH = h - headerH;
      const thumbH = Math.max(30, barH * (this.helpViewHeight / this.helpContentHeight));
      const maxScroll = this.helpContentHeight - this.helpViewHeight;
      const thumbY = headerH + (scrollY / maxScroll) * (barH - thumbH);
      ctx.fillStyle = 'rgba(79, 195, 247, 0.3)';
      ctx.beginPath();
      ctx.roundRect(w - 6, thumbY, 4, thumbH, 2);
      ctx.fill();
    }
  }
}
