// main.js — Game loop, state machine, module orchestration

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.input = new InputHandler(this.canvas, this.renderer);
    this.tweens = new TweenManager();
    this.particles = new ParticleSystem();
    this.audio = new AudioManager();
    this.ui = new UI(this.renderer);
    this.ads = new AdManager();
    this.board = null;
    this.saveData = Storage.load();

    this.state = 'menu'; // menu | levelSelect | playing | paused | levelComplete | gameOver | dailyBonus
    this.gameState = null;
    this.selectedTile = null;
    this.hintTimer = 0;
    this.hintPos = null;
    this.animating = false;
    this.boosterMode = null; // null | 'bomb' | 'lightning' | 'wave'

    this.lastTime = 0;
    this.time = 0;

    this.init();
  }

  init() {
    // Resize handling
    window.addEventListener('resize', () => {
      this.renderer.resize();
      if (this.board) {
        this.renderer.calculateLayout(this.board.width, this.board.height);
      }
    });

    // Input callbacks
    this.input.onTileSelect = (row, col) => this.handleTileSelect(row, col);
    this.input.onSwipe = (r1, c1, r2, c2) => this.handleSwipe(r1, c1, r2, c2);
    this.input.onUIClick = (x, y) => this.handleUIClick(x, y);

    // Initialize audio on first interaction
    this.canvas.addEventListener('pointerdown', () => {
      this.audio.init();
      this.audio.resume();
    }, { once: true });

    // Check daily bonus
    if (Storage.checkDailyBonus(this.saveData)) {
      this.state = 'dailyBonus';
    }

    // Init ads (set publisher ID in index.html data attribute)
    const adPubId = document.body.dataset.adPublisher || '';
    this.ads.init(adPubId);

    // Audio setting
    this.audio.enabled = this.saveData.soundEnabled;

    // Start game loop
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    const dt = this.lastTime ? timestamp - this.lastTime : 16;
    this.lastTime = timestamp;
    this.time = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.tweens.update(dt);
    this.particles.update(dt);
    this.renderer.updateShake(dt);

    if (this.state === 'playing' && !this.animating) {
      this.hintTimer += dt;
      if (this.hintTimer > 5000 && !this.hintPos) {
        this.hintPos = this.board.findHint();
      }
    }
  }

  render() {
    this.renderer.clear();

    switch (this.state) {
      case 'menu':
        this.ui.drawMainMenu(this.saveData);
        break;

      case 'dailyBonus':
        this.ui.drawMainMenu(this.saveData);
        this.ui.drawDailyBonus();
        break;

      case 'levelSelect':
        this.ui.drawLevelSelect(this.saveData);
        break;

      case 'playing':
      case 'paused':
      case 'levelComplete':
      case 'gameOver':
        this.renderGameplay();
        if (this.state === 'paused') this.ui.drawPauseMenu();
        if (this.state === 'levelComplete') this.ui.drawLevelComplete(this.gameState, this.starsEarned);
        if (this.state === 'gameOver') this.ui.drawGameOver(this.gameState, this.ads.enabled);
        break;
    }
  }

  renderGameplay() {
    this.renderer.drawBackground();

    // Build tile position map from tweens
    const tilePositions = new Map();
    if (this.tileAnims) {
      for (const [key, anim] of this.tileAnims) {
        tilePositions.set(key, anim);
      }
    }

    this.renderer.drawBoard(this.board, tilePositions);

    // Draw selection
    if (this.selectedTile) {
      this.renderer.drawSelection(this.selectedTile.row, this.selectedTile.col);
    }

    // Draw hint
    if (this.hintPos && !this.animating) {
      this.renderer.drawHintHighlight(this.hintPos.r1, this.hintPos.c1, this.time);
      this.renderer.drawHintHighlight(this.hintPos.r2, this.hintPos.c2, this.time);
    }

    // Draw booster mode indicator
    if (this.boosterMode) {
      const ctx = this.renderer.ctx;
      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Tap a tile to use ${this.boosterMode}!`, this.renderer.width / 2, this.renderer.boardOffsetY - 10);
    }

    // Particles on top
    this.particles.draw(this.renderer.ctx);

    // HUD
    this.ui.drawHUD(this.gameState, this.saveData);
  }

  // ── State transitions ──

  startLevel(levelNum) {
    const levelDef = LevelGenerator.generate(levelNum);

    this.board = new Board(levelDef.gridWidth, levelDef.gridHeight, levelDef.tileTypes);
    this.board.init();

    if (levelDef.obstacles.length > 0) {
      this.board.placeObstacles(levelDef.obstacles);
    }

    this.renderer.calculateLayout(this.board.width, this.board.height);

    this.gameState = {
      currentLevel: levelNum,
      score: 0,
      movesLeft: levelDef.moves,
      objectives: levelDef.objectives.map(o => ({ ...o })),
      starThresholds: levelDef.starThresholds,
      boardWidth: levelDef.gridWidth,
      boardHeight: levelDef.gridHeight,
    };

    this.selectedTile = null;
    this.hintTimer = 0;
    this.hintPos = null;
    this.animating = false;
    this.boosterMode = null;
    this.tileAnims = null;
    this.starsEarned = 0;
    this.state = 'playing';

    this.tweens.clear();
    this.particles.clear();
  }

  // ── Input handling ──

  handleUIClick(x, y) {
    const btnId = this.ui.hitTest(x, y);
    if (!btnId) return;

    this.audio.buttonClick();

    switch (this.state) {
      case 'menu':
        if (btnId === 'play') {
          this.startLevel(this.saveData.unlockedLevel);
        } else if (btnId === 'levelSelect') {
          this.state = 'levelSelect';
          this.ui.levelSelectPage = 0;
        } else if (btnId === 'sound') {
          this.saveData.soundEnabled = this.audio.toggle();
          Storage.save(this.saveData);
        } else if (btnId === 'dailyBonus') {
          this.state = 'dailyBonus';
        }
        break;

      case 'dailyBonus':
        if (btnId === 'claimBonus') {
          this.state = 'menu';
        }
        break;

      case 'levelSelect':
        if (btnId === 'back') {
          this.state = 'menu';
        } else if (btnId === 'prevPage') {
          this.ui.levelSelectPage = Math.max(0, this.ui.levelSelectPage - 1);
        } else if (btnId === 'nextPage') {
          this.ui.levelSelectPage++;
        } else if (btnId.startsWith('level_')) {
          const lvl = parseInt(btnId.split('_')[1]);
          this.startLevel(lvl);
        }
        break;

      case 'playing':
        if (btnId === 'pause') {
          this.state = 'paused';
          this.input.disable();
          setTimeout(() => this.input.enable(), 300);
        } else if (btnId.startsWith('booster_')) {
          const type = btnId.split('_')[1];
          if (this.saveData.boosters[type] > 0) {
            this.boosterMode = type;
          }
        }
        break;

      case 'paused':
        if (btnId === 'resume') {
          this.state = 'playing';
        } else if (btnId === 'retry') {
          this.startLevel(this.gameState.currentLevel);
        } else if (btnId === 'toLevelSelect') {
          this.state = 'levelSelect';
        }
        break;

      case 'levelComplete':
        if (btnId === 'nextLevel') {
          this.startLevel(this.gameState.currentLevel + 1);
        } else if (btnId === 'toLevelSelect') {
          this.state = 'levelSelect';
        }
        break;

      case 'gameOver':
        if (btnId === 'watchAd') {
          this.ads.showRewardedAd(() => {
            this.gameState.movesLeft += 5;
            this.state = 'playing';
          });
        } else if (btnId === 'retry') {
          this.startLevel(this.gameState.currentLevel);
        } else if (btnId === 'toLevelSelect') {
          this.state = 'levelSelect';
        }
        break;
    }
  }

  handleTileSelect(row, col) {
    if (this.state !== 'playing' || this.animating) return;
    if (row < 0 || row >= this.board.height || col < 0 || col >= this.board.width) return;

    // Booster mode — use booster on tapped tile
    if (this.boosterMode) {
      this.useBooster(row, col);
      return;
    }

    if (!this.selectedTile) {
      this.selectedTile = { row, col };
      this.hintTimer = 0;
      this.hintPos = null;
    } else {
      const { row: sr, col: sc } = this.selectedTile;
      if (sr === row && sc === col) {
        this.selectedTile = null;
      } else if (this.board.isAdjacent(sr, sc, row, col)) {
        this.trySwap(sr, sc, row, col);
      } else {
        this.selectedTile = { row, col };
      }
    }
  }

  handleSwipe(r1, c1, r2, c2) {
    if (this.state !== 'playing' || this.animating) return;
    if (r1 < 0 || r1 >= this.board.height || c1 < 0 || c1 >= this.board.width) return;

    this.selectedTile = null;
    this.trySwap(r1, c1, r2, c2);
  }

  // ── Game actions ──

  trySwap(r1, c1, r2, c2) {
    this.animating = true;
    this.hintTimer = 0;
    this.hintPos = null;

    const tile1 = this.board.getTile(r1, c1);
    const tile2 = this.board.getTile(r2, c2);
    if (!tile1 || !tile2) {
      this.animating = false;
      return;
    }

    const center1 = this.renderer.getTileCenter(r1, c1);
    const center2 = this.renderer.getTileCenter(r2, c2);

    // Animate swap
    this.tileAnims = new Map();
    const key1 = `${r1},${c1}`;
    const key2 = `${r2},${c2}`;
    const anim1 = { x: center1.x, y: center1.y };
    const anim2 = { x: center2.x, y: center2.y };
    this.tileAnims.set(key1, anim1);
    this.tileAnims.set(key2, anim2);

    this.audio.swap();

    this.tweens.add(anim1, {
      x: { from: center1.x, to: center2.x },
      y: { from: center1.y, to: center2.y },
      duration: 180,
      easing: Easing.easeInOutQuad,
    });

    this.tweens.add(anim2, {
      x: { from: center2.x, to: center1.x },
      y: { from: center2.y, to: center1.y },
      duration: 180,
      easing: Easing.easeInOutQuad,
      onComplete: () => {
        this.tileAnims = null;

        const valid = this.board.swap(r1, c1, r2, c2);
        if (valid) {
          this.gameState.movesLeft--;
          this.selectedTile = null;
          this.board.combo = 0;
          this.processCascade();
        } else {
          // Animate swap back
          this.audio.invalidSwap();
          const ba1 = { x: center2.x, y: center2.y };
          const ba2 = { x: center1.x, y: center1.y };
          this.tileAnims = new Map();
          this.tileAnims.set(key1, ba1);
          this.tileAnims.set(key2, ba2);

          this.tweens.add(ba1, {
            x: { from: center2.x, to: center1.x },
            y: { from: center2.y, to: center1.y },
            duration: 180,
            easing: Easing.easeInOutQuad,
          });
          this.tweens.add(ba2, {
            x: { from: center1.x, to: center2.x },
            y: { from: center1.y, to: center2.y },
            duration: 180,
            easing: Easing.easeInOutQuad,
            onComplete: () => {
              this.tileAnims = null;
              this.animating = false;
            },
          });
        }
      },
    });
  }

  processCascade() {
    const matches = this.board.findAllMatches();
    if (matches.length === 0) {
      // No more matches — check for deadlock
      if (!this.board.hasValidMove()) {
        this.board.shuffle();
      }
      this.animating = false;
      this.checkLevelEnd();
      return;
    }

    this.board.combo++;
    const result = this.board.processMatches(matches);

    // Update score
    this.gameState.score += result.score;

    // Update collection objectives
    for (const cleared of result.cleared) {
      for (const obj of this.gameState.objectives) {
        if (obj.type === 'collect' && obj.tileId === cleared.typeId) {
          obj.current++;
        }
      }
    }

    // Audio and effects
    this.audio.match(this.board.combo - 1);
    if (this.board.combo >= 2) {
      this.audio.combo(this.board.combo);
    }

    // Particle effects for cleared tiles
    for (const c of result.cleared) {
      const center = this.renderer.getTileCenter(c.row, c.col);
      const colors = ['#4fc3f7', '#81d4fa', '#b3e5fc', '#fff'];
      this.particles.burstCircle(center.x, center.y, 8, colors[Math.floor(Math.random() * colors.length)]);
      this.particles.emitEmoji(center.x, center.y, c.emoji, 1);
    }

    // Special tile creation effects
    for (const s of result.specials) {
      const center = this.renderer.getTileCenter(s.row, s.col);
      this.audio.specialCreate();
      this.particles.burstCircle(center.x, center.y, 12, '#ffdd00');
    }

    // Combo text
    if (this.board.combo >= 2) {
      const midMatch = result.cleared[Math.floor(result.cleared.length / 2)];
      if (midMatch) {
        const center = this.renderer.getTileCenter(midMatch.row, midMatch.col);
        this.particles.comboText(center.x, center.y - 20, `${this.board.combo}x Combo!`);
      }
      this.renderer.shake(3 + this.board.combo * 2, 200);
    }

    // Activate any special tiles that were matched
    let extraCleared = [];
    for (const c of result.cleared) {
      // Check neighbors for special tiles that should chain
    }
    for (const s of result.specials) {
      // Special tiles will activate when they're matched in future turns
    }

    // Apply gravity after a short delay for visual effect
    setTimeout(() => {
      const gravityMoves = this.board.applyGravity();
      this.animateGravity(gravityMoves, () => {
        // Recurse — check for more cascades
        setTimeout(() => this.processCascade(), 100);
      });
    }, 200);
  }

  animateGravity(moves, onComplete) {
    if (moves.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.tileAnims = new Map();
    let longest = 0;

    for (const move of moves) {
      const fromCenter = this.renderer.getTileCenter(move.fromRow, move.fromCol);
      const toCenter = this.renderer.getTileCenter(move.toRow, move.toCol);
      const key = `${move.toRow},${move.toCol}`;
      const anim = { x: fromCenter.x, y: fromCenter.y, scale: 1 };
      this.tileAnims.set(key, anim);

      const dist = Math.abs(move.toRow - move.fromRow);
      const duration = 120 + dist * 40;
      if (duration > longest) longest = duration;

      this.tweens.add(anim, {
        x: { from: fromCenter.x, to: toCenter.x },
        y: { from: fromCenter.y, to: toCenter.y },
        duration,
        easing: Easing.easeInQuad,
        onComplete: () => {
          // Landing bounce
          this.tweens.add(anim, {
            scale: { from: 1, to: 1.1 },
            duration: 60,
            easing: Easing.easeOutQuad,
            onComplete: () => {
              this.tweens.add(anim, {
                scale: { from: 1.1, to: 1 },
                duration: 80,
                easing: Easing.easeOutBounce,
              });
            },
          });
        },
      });
    }

    setTimeout(() => {
      this.tileAnims = null;
      if (onComplete) onComplete();
    }, longest + 150);
  }

  useBooster(row, col) {
    const type = this.boosterMode;
    if (!this.saveData.boosters[type] || this.saveData.boosters[type] <= 0) {
      this.boosterMode = null;
      return;
    }

    const tile = this.board.getTile(row, col);
    if (!tile) {
      this.boosterMode = null;
      return;
    }

    this.saveData.boosters[type]--;
    Storage.save(this.saveData);
    this.boosterMode = null;

    // Temporarily assign special to tile and activate
    tile.special = type;
    this.audio.specialActivate();

    const extraCleared = this.board.activateSpecial(row, col);

    // Effects
    const center = this.renderer.getTileCenter(row, col);
    this.particles.burstCircle(center.x, center.y, 16, '#ffdd00');
    this.renderer.shake(8, 300);

    for (const c of extraCleared) {
      const cc = this.renderer.getTileCenter(c.row, c.col);
      this.particles.burstCircle(cc.x, cc.y, 6, '#ff6600');
      this.gameState.score += 15;

      for (const obj of this.gameState.objectives) {
        if (obj.type === 'collect' && obj.tileId === c.typeId) {
          obj.current++;
        }
      }
    }

    // Remove the tile itself too
    this.board.grid[row][col] = null;

    this.animating = true;
    setTimeout(() => {
      const gravityMoves = this.board.applyGravity();
      this.animateGravity(gravityMoves, () => {
        setTimeout(() => this.processCascade(), 100);
      });
    }, 300);
  }

  checkLevelEnd() {
    // Check if all objectives met
    const allMet = this.gameState.objectives.every(obj => {
      if (obj.type === 'score') return this.gameState.score >= obj.target;
      if (obj.type === 'collect') return obj.current >= obj.target;
      return false;
    });

    if (allMet) {
      this.levelWin();
      return;
    }

    if (this.gameState.movesLeft <= 0) {
      this.levelLose();
    }
  }

  levelWin() {
    // Calculate stars
    const score = this.gameState.score;
    const thresholds = this.gameState.starThresholds;
    this.starsEarned = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (score >= thresholds[i]) this.starsEarned = i + 1;
    }

    this.audio.levelComplete();
    for (let i = 0; i < this.starsEarned; i++) {
      setTimeout(() => this.audio.starEarned(), 500 + i * 300);
    }

    // Save progress
    Storage.completeLevel(this.saveData, this.gameState.currentLevel, this.starsEarned);

    // Reward boosters occasionally
    if (this.gameState.currentLevel % 5 === 0) {
      this.saveData.boosters.bomb = (this.saveData.boosters.bomb || 0) + 1;
      Storage.save(this.saveData);
    }
    if (this.gameState.currentLevel % 10 === 0) {
      this.saveData.boosters.lightning = (this.saveData.boosters.lightning || 0) + 1;
      Storage.save(this.saveData);
    }

    // Celebration particles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * this.renderer.width;
        const y = Math.random() * this.renderer.height * 0.5;
        this.particles.burstCircle(x, y, 10, ['#4fc3f7', '#ffdd00', '#ff5252', '#4caf50'][i % 4]);
      }, i * 200);
    }

    // Check interstitial ad
    if (this.ads.shouldShowInterstitial()) {
      this.ads.showInterstitial(() => {
        this.state = 'levelComplete';
      });
    } else {
      this.state = 'levelComplete';
    }
  }

  levelLose() {
    this.audio.levelFail();
    this.state = 'gameOver';
  }
}

// ── Bootstrap ──
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
