// board.js — Core match-3 game logic

const TILE_TYPES = [
  { id: 0, emoji: '🐟', name: 'fish' },
  { id: 1, emoji: '🐚', name: 'shell' },
  { id: 2, emoji: '⭐', name: 'starfish' },
  { id: 3, emoji: '🦑', name: 'seahorse' },
  { id: 4, emoji: '⚓', name: 'anchor' },
  { id: 5, emoji: '💎', name: 'treasure' },
];

const SPECIAL_TYPES = {
  BOMB: { id: 100, emoji: '🔥', name: 'bomb' },
  LIGHTNING: { id: 101, emoji: '⚡', name: 'lightning' },
  WAVE: { id: 102, emoji: '🌊', name: 'wave' },
};

const OBSTACLE_TYPES = {
  ICE: 'ice',
  SEAWEED: 'seaweed',
};

class Tile {
  constructor(typeId, row, col) {
    this.typeId = typeId;
    this.row = row;
    this.col = col;
    this.special = null; // null | 'bomb' | 'lightning' | 'wave'
    this.obstacle = null; // null | 'ice' | 'seaweed'
    this.obstacleHP = 0;
    this.marked = false; // marked for removal
  }

  get emoji() {
    if (this.special) {
      return SPECIAL_TYPES[this.special.toUpperCase()].emoji;
    }
    const t = TILE_TYPES.find(t => t.id === this.typeId);
    return t ? t.emoji : '?';
  }

  get name() {
    const t = TILE_TYPES.find(t => t.id === this.typeId);
    return t ? t.name : 'unknown';
  }

  matches(other) {
    if (!other || this.typeId < 0 || other.typeId < 0) return false;
    return this.typeId === other.typeId;
  }
}

class Board {
  constructor(width, height, numTileTypes) {
    this.width = width;
    this.height = height;
    this.numTileTypes = Math.min(numTileTypes, TILE_TYPES.length);
    this.grid = [];
    this.combo = 0;
    this.lastMatches = [];
  }

  init() {
    this.grid = [];
    for (let r = 0; r < this.height; r++) {
      const row = [];
      for (let c = 0; c < this.width; c++) {
        row.push(this.createRandomTile(r, c));
      }
      this.grid.push(row);
    }
    // Remove any initial matches
    this.removeInitialMatches();
  }

  createRandomTile(row, col) {
    const typeId = Math.floor(Math.random() * this.numTileTypes);
    return new Tile(typeId, row, col);
  }

  getTile(row, col) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return null;
    return this.grid[row][col];
  }

  setTile(row, col, tile) {
    if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
      this.grid[row][col] = tile;
      if (tile) {
        tile.row = row;
        tile.col = col;
      }
    }
  }

  removeInitialMatches() {
    let hadMatches = true;
    let iterations = 0;
    while (hadMatches && iterations < 100) {
      hadMatches = false;
      iterations++;
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          const tile = this.getTile(r, c);
          if (!tile) continue;
          // Check horizontal match
          if (c >= 2) {
            const t1 = this.getTile(r, c - 1);
            const t2 = this.getTile(r, c - 2);
            if (t1 && t2 && tile.matches(t1) && tile.matches(t2)) {
              tile.typeId = this.getDifferentType(tile.typeId);
              hadMatches = true;
            }
          }
          // Check vertical match
          if (r >= 2) {
            const t1 = this.getTile(r - 1, c);
            const t2 = this.getTile(r - 2, c);
            if (t1 && t2 && tile.matches(t1) && tile.matches(t2)) {
              tile.typeId = this.getDifferentType(tile.typeId);
              hadMatches = true;
            }
          }
        }
      }
    }
  }

  getDifferentType(excludeId) {
    let id;
    do {
      id = Math.floor(Math.random() * this.numTileTypes);
    } while (id === excludeId);
    return id;
  }

  // Swap two adjacent tiles. Returns true if swap produced matches.
  swap(r1, c1, r2, c2) {
    if (!this.isAdjacent(r1, c1, r2, c2)) return false;

    const tile1 = this.getTile(r1, c1);
    const tile2 = this.getTile(r2, c2);
    if (!tile1 || !tile2) return false;
    if (tile1.obstacle === OBSTACLE_TYPES.SEAWEED || tile2.obstacle === OBSTACLE_TYPES.SEAWEED) return false;

    // Tentative swap
    this.setTile(r1, c1, tile2);
    this.setTile(r2, c2, tile1);

    const matches = this.findAllMatches();
    if (matches.length === 0) {
      // Swap back
      this.setTile(r1, c1, tile1);
      this.setTile(r2, c2, tile2);
      return false;
    }

    return true;
  }

  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  // Find all matches on the board. Returns array of match groups.
  findAllMatches() {
    const matchMap = Array.from({ length: this.height }, () =>
      Array(this.width).fill(false)
    );
    const matchGroups = [];

    // Horizontal matches
    for (let r = 0; r < this.height; r++) {
      let runStart = 0;
      for (let c = 1; c <= this.width; c++) {
        const curr = this.getTile(r, c);
        const prev = this.getTile(r, c - 1);
        // Seaweed blocks matching; ice does not (ice breaks when matched)
        const isRun = curr && prev && curr.matches(prev) &&
          prev.obstacle !== 'seaweed' && curr.obstacle !== 'seaweed';

        if (!isRun || c === this.width) {
          const runEnd = (isRun ? c : c - 1);
          const runLen = runEnd - runStart + 1;
          if (runLen >= 3) {
            const group = { positions: [], direction: 'horizontal', length: runLen };
            for (let i = runStart; i <= runEnd; i++) {
              group.positions.push({ row: r, col: i });
              matchMap[r][i] = true;
            }
            matchGroups.push(group);
          }
          runStart = c;
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < this.width; c++) {
      let runStart = 0;
      for (let r = 1; r <= this.height; r++) {
        const curr = this.getTile(r, c);
        const prev = this.getTile(r - 1, c);
        const isRun = curr && prev && curr.matches(prev) &&
          prev.obstacle !== 'seaweed' && curr.obstacle !== 'seaweed';

        if (!isRun || r === this.height) {
          const runEnd = (isRun ? r : r - 1);
          const runLen = runEnd - runStart + 1;
          if (runLen >= 3) {
            const group = { positions: [], direction: 'vertical', length: runLen };
            for (let i = runStart; i <= runEnd; i++) {
              group.positions.push({ row: i, col: c });
              matchMap[i][c] = true;
            }
            matchGroups.push(group);
          }
          runStart = r;
        }
      }
    }

    // Detect special tile creation opportunities
    this.detectSpecialMatches(matchGroups);

    this.lastMatches = matchGroups;
    return matchGroups;
  }

  detectSpecialMatches(matchGroups) {
    // Check for L/T shapes (intersection of horizontal and vertical)
    for (let i = 0; i < matchGroups.length; i++) {
      for (let j = i + 1; j < matchGroups.length; j++) {
        const g1 = matchGroups[i];
        const g2 = matchGroups[j];
        if (g1.direction === g2.direction) continue;

        // Find intersection
        for (const p1 of g1.positions) {
          for (const p2 of g2.positions) {
            if (p1.row === p2.row && p1.col === p2.col) {
              g1.special = 'wave';
              g2.special = 'wave';
              g1.intersect = { row: p1.row, col: p1.col };
              g2.intersect = { row: p1.row, col: p1.col };
            }
          }
        }
      }
    }

    // Match 5+ = lightning, match 4 = bomb (if not already L/T)
    for (const g of matchGroups) {
      if (g.special) continue;
      if (g.length >= 5) {
        g.special = 'lightning';
      } else if (g.length === 4) {
        g.special = 'bomb';
      }
    }
  }

  // Process matches: clear tiles, handle obstacles, create specials.
  // Returns { cleared: [{row, col, typeId, emoji}], specials: [{row, col, special}], score }
  processMatches(matchGroups) {
    const cleared = [];
    const specials = [];
    const clearedSet = new Set();
    let score = 0;

    for (const group of matchGroups) {
      // Determine where to place special tile (center of match or intersection)
      let specialPos = null;
      if (group.special) {
        if (group.intersect) {
          specialPos = group.intersect;
        } else {
          const mid = Math.floor(group.positions.length / 2);
          specialPos = group.positions[mid];
        }
      }

      for (const pos of group.positions) {
        const key = `${pos.row},${pos.col}`;
        if (clearedSet.has(key)) continue;

        const tile = this.getTile(pos.row, pos.col);
        if (!tile) continue;

        // Damage adjacent obstacles (ice/seaweed near cleared tiles)
        this.damageAdjacentObstacles(pos.row, pos.col);

        // If this tile has ice, damage it — only clear tile if ice is fully broken
        if (tile.obstacle === 'ice') {
          tile.obstacleHP--;
          if (tile.obstacleHP <= 0) {
            tile.obstacle = null;
            tile.obstacleHP = 0;
          } else {
            // Ice still intact — tile survives this match
            continue;
          }
        }

        if (specialPos && pos.row === specialPos.row && pos.col === specialPos.col && group.special) {
          // Place special tile here instead of clearing
          tile.special = group.special;
          tile.marked = false;
          specials.push({ row: pos.row, col: pos.col, special: group.special });
        } else {
          clearedSet.add(key);
          cleared.push({
            row: pos.row,
            col: pos.col,
            typeId: tile.typeId,
            emoji: tile.emoji,
          });
          this.grid[pos.row][pos.col] = null;
        }
      }

      // Score: base 8 per tile, multiplied by combo and match length bonus
      const lengthBonus = group.length >= 5 ? 2.5 : group.length === 4 ? 1.5 : 1;
      score += Math.floor(group.positions.length * 8 * lengthBonus * (this.combo + 1));
    }

    return { cleared, specials, score };
  }

  // Activate a special tile at (row, col). Returns extra cleared positions.
  activateSpecial(row, col) {
    const tile = this.getTile(row, col);
    if (!tile || !tile.special) return [];

    const extra = [];
    const special = tile.special;
    tile.special = null;

    if (special === 'bomb') {
      // Clear 3x3 area
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r === row && c === col) continue;
          const t = this.getTile(r, c);
          if (t && !t.obstacle) {
            extra.push({ row: r, col: c, typeId: t.typeId, emoji: t.emoji });
            this.grid[r][c] = null;
          } else if (t && t.obstacle) {
            this.damageObstacle(r, c);
          }
        }
      }
    } else if (special === 'lightning') {
      // Clear all tiles of the same type
      const targetType = tile.typeId;
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          const t = this.getTile(r, c);
          if (t && t.typeId === targetType && (r !== row || c !== col)) {
            if (!t.obstacle) {
              extra.push({ row: r, col: c, typeId: t.typeId, emoji: t.emoji });
              this.grid[r][c] = null;
            }
          }
        }
      }
    } else if (special === 'wave') {
      // Clear entire row + column
      for (let c = 0; c < this.width; c++) {
        if (c === col) continue;
        const t = this.getTile(row, c);
        if (t && !t.obstacle) {
          extra.push({ row: row, col: c, typeId: t.typeId, emoji: t.emoji });
          this.grid[row][c] = null;
        } else if (t && t.obstacle) {
          this.damageObstacle(row, c);
        }
      }
      for (let r = 0; r < this.height; r++) {
        if (r === row) continue;
        const t = this.getTile(r, col);
        if (t && !t.obstacle) {
          extra.push({ row: r, col: col, typeId: t.typeId, emoji: t.emoji });
          this.grid[r][col] = null;
        } else if (t && t.obstacle) {
          this.damageObstacle(r, col);
        }
      }
    }

    return extra;
  }

  damageAdjacentObstacles(row, col) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      this.damageObstacle(row + dr, col + dc);
    }
  }

  damageObstacle(row, col) {
    const tile = this.getTile(row, col);
    if (!tile || !tile.obstacle) return;
    tile.obstacleHP--;
    if (tile.obstacleHP <= 0) {
      tile.obstacle = null;
      tile.obstacleHP = 0;
    }
  }

  // Apply gravity: tiles fall down to fill empty spaces.
  // Returns array of {tile, fromRow, fromCol, toRow, toCol} for animation.
  applyGravity() {
    const moves = [];

    for (let c = 0; c < this.width; c++) {
      let writeRow = this.height - 1;

      // Move existing tiles down
      for (let r = this.height - 1; r >= 0; r--) {
        const tile = this.getTile(r, c);
        if (tile) {
          if (r !== writeRow) {
            moves.push({ tile, fromRow: r, fromCol: c, toRow: writeRow, toCol: c });
            this.grid[writeRow][c] = tile;
            this.grid[r][c] = null;
            tile.row = writeRow;
            tile.col = c;
          }
          writeRow--;
        }
      }

      // Fill empty spaces at top with new tiles
      for (let r = writeRow; r >= 0; r--) {
        const newTile = this.createRandomTile(r, c);
        this.grid[r][c] = newTile;
        moves.push({
          tile: newTile,
          fromRow: r - (writeRow + 1), // start above the board
          fromCol: c,
          toRow: r,
          toCol: c,
          isNew: true,
        });
      }
    }

    return moves;
  }

  // Check if any valid move exists on the board
  hasValidMove() {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        // Try swap right
        if (c < this.width - 1) {
          this.swapTiles(r, c, r, c + 1);
          if (this.findAllMatches().length > 0) {
            this.swapTiles(r, c, r, c + 1);
            return true;
          }
          this.swapTiles(r, c, r, c + 1);
        }
        // Try swap down
        if (r < this.height - 1) {
          this.swapTiles(r, c, r + 1, c);
          if (this.findAllMatches().length > 0) {
            this.swapTiles(r, c, r + 1, c);
            return true;
          }
          this.swapTiles(r, c, r + 1, c);
        }
      }
    }
    return false;
  }

  // Find a hint — returns {r1, c1, r2, c2} for a valid swap, or null
  findHint() {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (c < this.width - 1) {
          this.swapTiles(r, c, r, c + 1);
          if (this.findAllMatches().length > 0) {
            this.swapTiles(r, c, r, c + 1);
            return { r1: r, c1: c, r2: r, c2: c + 1 };
          }
          this.swapTiles(r, c, r, c + 1);
        }
        if (r < this.height - 1) {
          this.swapTiles(r, c, r + 1, c);
          if (this.findAllMatches().length > 0) {
            this.swapTiles(r, c, r + 1, c);
            return { r1: r, c1: c, r2: r + 1, c2: c };
          }
          this.swapTiles(r, c, r + 1, c);
        }
      }
    }
    return null;
  }

  // Raw swap without validation
  swapTiles(r1, c1, r2, c2) {
    const t1 = this.grid[r1][c1];
    const t2 = this.grid[r2][c2];
    this.grid[r1][c1] = t2;
    this.grid[r2][c2] = t1;
    if (t1) { t1.row = r2; t1.col = c2; }
    if (t2) { t2.row = r1; t2.col = c1; }
  }

  // Shuffle the board while ensuring at least one valid move
  shuffle() {
    let attempts = 0;
    do {
      // Fisher-Yates on flat array
      const flat = [];
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (this.grid[r][c] && !this.grid[r][c].obstacle) {
            flat.push(this.grid[r][c]);
          }
        }
      }

      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }

      let idx = 0;
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          if (this.grid[r][c] && !this.grid[r][c].obstacle) {
            this.grid[r][c] = flat[idx];
            flat[idx].row = r;
            flat[idx].col = c;
            idx++;
          }
        }
      }

      // Remove any initial matches created by shuffle
      this.removeInitialMatches();
      attempts++;
    } while (!this.hasValidMove() && attempts < 50);
  }

  // Place obstacles on the board for a level
  placeObstacles(obstacles) {
    for (const obs of obstacles) {
      for (const pos of obs.positions) {
        const tile = this.getTile(pos.row, pos.col);
        if (tile) {
          tile.obstacle = obs.type;
          tile.obstacleHP = obs.type === OBSTACLE_TYPES.ICE ? 2 : 3;
        }
      }
    }
  }
}
