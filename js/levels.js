// levels.js — Level definitions with procedural parameter curves

const LevelGenerator = {
  generate(levelNum) {
    // Difficulty curves
    const gridSize = levelNum <= 5 ? 6 : levelNum <= 15 ? 7 : 8;
    const tileTypes = Math.min(3 + Math.floor(levelNum / 4), TILE_TYPES.length);
    const baseMoves = Math.max(12, 22 - Math.floor(levelNum / 3));

    const level = {
      level: levelNum,
      gridWidth: gridSize,
      gridHeight: gridSize,
      moves: baseMoves,
      tileTypes: tileTypes,
      objectives: [],
      obstacles: [],
      starThresholds: [],
    };

    // Objective selection based on level range
    if (levelNum <= 10) {
      // Tutorial: score only
      const target = 800 + levelNum * 350;
      level.objectives.push({ type: 'score', target, current: 0 });
      level.moves = Math.max(16, baseMoves);
    } else if (levelNum <= 20) {
      // Introduce collection objectives
      if (levelNum % 3 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 3));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 15 + Math.floor(levelNum / 2),
          current: 0,
        });
      } else {
        const target = 1200 + levelNum * 450;
        level.objectives.push({ type: 'score', target, current: 0 });
      }

      // Ice obstacles introduced at level 12
      if (levelNum >= 12) {
        const iceCount = Math.min(Math.floor((levelNum - 10) / 2), 6);
        if (iceCount > 0) {
          level.obstacles.push({
            type: 'ice',
            positions: this.randomPositions(iceCount, gridSize, gridSize),
          });
        }
      }
    } else if (levelNum <= 40) {
      // Mix objectives + obstacles
      if (levelNum % 2 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 4));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 20 + Math.floor(levelNum / 3),
          current: 0,
        });
      }
      const target = 1800 + levelNum * 400;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Ice obstacles (more aggressive ramp)
      const iceCount = Math.min(Math.floor((levelNum - 12) / 2), 10);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }

      // Seaweed introduced at level 28
      if (levelNum >= 28) {
        const seaweedCount = Math.min(Math.floor((levelNum - 25) / 3), 5);
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }
    } else {
      // Hard levels: multiple objectives + heavy obstacles
      const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 5));
      level.objectives.push({
        type: 'collect',
        tileId: tileIdx,
        emoji: TILE_TYPES[tileIdx].emoji,
        target: 28 + Math.floor(levelNum / 4),
        current: 0,
      });
      const target = 3000 + levelNum * 350;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Heavy ice + seaweed
      const iceCount = Math.min(Math.floor((levelNum - 20) / 2), 12);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }
      const seaweedCount = Math.min(Math.floor((levelNum - 30) / 3), 8);
      if (seaweedCount > 0) {
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }

      level.moves = Math.max(10, baseMoves - 5);
    }

    // Star thresholds (tighter — 3 stars is a real achievement)
    const baseScore = level.objectives.find(o => o.type === 'score')?.target || 1000;
    level.starThresholds = [
      baseScore,
      Math.floor(baseScore * 1.8),
      Math.floor(baseScore * 3.0),
    ];

    return level;
  },

  randomPositions(count, width, height) {
    const positions = [];
    const used = new Set();
    // Avoid edges to keep it fair
    const margin = 1;
    let attempts = 0;
    while (positions.length < count && attempts < 100) {
      const row = margin + Math.floor(Math.random() * (height - margin * 2));
      const col = margin + Math.floor(Math.random() * (width - margin * 2));
      const key = `${row},${col}`;
      if (!used.has(key)) {
        used.add(key);
        positions.push({ row, col });
      }
      attempts++;
    }
    return positions;
  },

  getTotalLevels() {
    return 200; // effectively unlimited with procedural generation
  },
};
