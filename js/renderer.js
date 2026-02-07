// renderer.js — Canvas rendering for the match-3 board

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 48;
    this.boardOffsetX = 0;
    this.boardOffsetY = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeTime = 0;
    this.tileAnimStates = new Map(); // key: "row,col" -> {x, y, scale, alpha}
    this.bgGradient = null;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement || document.body;
    const w = Math.min(parent.clientWidth, 480);
    const h = Math.min(parent.clientHeight || window.innerHeight, 800);

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = w;
    this.height = h;
    this.bgGradient = null;
  }

  calculateLayout(boardWidth, boardHeight) {
    const maxTileW = (this.width - 20) / boardWidth;
    const maxTileH = (this.height - 160) / boardHeight; // leave room for HUD
    this.tileSize = Math.floor(Math.min(maxTileW, maxTileH, 56));
    const gridW = this.tileSize * boardWidth;
    const gridH = this.tileSize * boardHeight;
    this.boardOffsetX = Math.floor((this.width - gridW) / 2);
    this.boardOffsetY = Math.floor((this.height - gridH) / 2) + 40; // offset for top HUD
  }

  getTileCenter(row, col) {
    return {
      x: this.boardOffsetX + col * this.tileSize + this.tileSize / 2,
      y: this.boardOffsetY + row * this.tileSize + this.tileSize / 2,
    };
  }

  screenToGrid(sx, sy) {
    const col = Math.floor((sx - this.boardOffsetX) / this.tileSize);
    const row = Math.floor((sy - this.boardOffsetY) / this.tileSize);
    return { row, col };
  }

  shake(intensity = 5, duration = 200) {
    this.shakeTime = duration;
    this.shakeIntensity = intensity;
  }

  updateShake(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const factor = this.shakeTime / 200;
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * factor;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * factor;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  drawBackground() {
    if (!this.bgGradient) {
      this.bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      this.bgGradient.addColorStop(0, '#0a1628');
      this.bgGradient.addColorStop(0.5, '#0d2847');
      this.bgGradient.addColorStop(1, '#1a3a5c');
    }
    this.ctx.fillStyle = this.bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(board) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    // Grid background
    const gridW = board.width * this.tileSize;
    const gridH = board.height * this.tileSize;

    ctx.fillStyle = 'rgba(0, 40, 80, 0.5)';
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.15)';
    ctx.lineWidth = 1;

    // Draw rounded grid background
    const r = 8;
    const gx = this.boardOffsetX - 4;
    const gy = this.boardOffsetY - 4;
    const gw = gridW + 8;
    const gh = gridH + 8;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, r);
    ctx.fill();
    ctx.stroke();

    // Draw cell outlines
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.08)';
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        const x = this.boardOffsetX + col * this.tileSize;
        const y = this.boardOffsetY + row * this.tileSize;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
      }
    }

    ctx.restore();
  }

  drawTile(tile, overrideX, overrideY, scale, alpha) {
    if (!tile) return;
    const ctx = this.ctx;
    const center = this.getTileCenter(tile.row, tile.col);
    const x = overrideX !== undefined ? overrideX : center.x;
    const y = overrideY !== undefined ? overrideY : center.y;
    const s = scale !== undefined ? scale : 1;
    const a = alpha !== undefined ? alpha : 1;

    ctx.save();
    ctx.translate(x + this.shakeX, y + this.shakeY);
    ctx.scale(s, s);
    ctx.globalAlpha = a;

    // Draw obstacle background
    if (tile.obstacle === 'ice') {
      ctx.fillStyle = 'rgba(180, 220, 255, 0.4)';
      ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.lineWidth = 2;
      const half = this.tileSize / 2 - 2;
      ctx.beginPath();
      ctx.roundRect(-half, -half, this.tileSize - 4, this.tileSize - 4, 4);
      ctx.fill();
      ctx.stroke();
    } else if (tile.obstacle === 'seaweed') {
      ctx.fillStyle = 'rgba(30, 120, 60, 0.5)';
      ctx.strokeStyle = 'rgba(50, 160, 80, 0.6)';
      ctx.lineWidth = 2;
      const half = this.tileSize / 2 - 2;
      ctx.beginPath();
      ctx.roundRect(-half, -half, this.tileSize - 4, this.tileSize - 4, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Draw special tile glow
    if (tile.special) {
      const glowColors = { bomb: '#ff4400', lightning: '#ffdd00', wave: '#00aaff' };
      ctx.shadowColor = glowColors[tile.special] || '#fff';
      ctx.shadowBlur = 12;
    }

    // Draw emoji — reset fillStyle and use color emoji font stack
    const emoji = tile.emoji;
    const fontSize = Math.floor(this.tileSize * 0.65);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 2);

    // Draw special indicator ring
    if (tile.special) {
      ctx.shadowBlur = 0;
      const glowColors = { bomb: '#ff4400', lightning: '#ffdd00', wave: '#00aaff' };
      ctx.strokeStyle = glowColors[tile.special];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.tileSize / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBoard(board, tilePositions) {
    this.drawGrid(board);

    for (let r = 0; r < board.height; r++) {
      for (let c = 0; c < board.width; c++) {
        const tile = board.getTile(r, c);
        if (!tile) continue;

        const key = `${r},${c}`;
        const anim = tilePositions ? tilePositions.get(key) : null;
        if (anim) {
          this.drawTile(tile, anim.x, anim.y, anim.scale || 1, anim.alpha !== undefined ? anim.alpha : 1);
        } else {
          this.drawTile(tile);
        }
      }
    }
  }

  drawSelection(row, col) {
    if (row < 0 || col < 0) return;
    const ctx = this.ctx;
    const x = this.boardOffsetX + col * this.tileSize + this.shakeX;
    const y = this.boardOffsetY + row * this.tileSize + this.shakeY;

    ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, 6);
    ctx.stroke();
  }

  drawHintHighlight(row, col, time) {
    const ctx = this.ctx;
    const x = this.boardOffsetX + col * this.tileSize + this.shakeX;
    const y = this.boardOffsetY + row * this.tileSize + this.shakeY;
    const pulse = 0.3 + 0.3 * Math.sin(time * 0.005);

    ctx.fillStyle = `rgba(255, 255, 100, ${pulse})`;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, 6);
    ctx.fill();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
