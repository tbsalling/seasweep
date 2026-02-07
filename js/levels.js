// levels.js — Level definitions with procedural parameter curves

const LevelGenerator = {
  generate(levelNum) {
    // Difficulty curves
    const gridSize = levelNum <= 5 ? 6 : levelNum <= 15 ? 7 : 8;
    const tileTypes = Math.min(3 + Math.floor(levelNum / 8), TILE_TYPES.length);
    const baseMoves = Math.max(15, 30 - Math.floor(levelNum / 5));

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
      const target = 500 + levelNum * 200;
      level.objectives.push({ type: 'score', target, current: 0 });
      level.moves = Math.max(20, baseMoves + 5);
    } else if (levelNum <= 20) {
      // Introduce collection objectives
      if (levelNum % 3 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 3));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 10 + Math.floor(levelNum / 3),
          current: 0,
        });
      } else {
        const target = 800 + levelNum * 300;
        level.objectives.push({ type: 'score', target, current: 0 });
      }
    } else if (levelNum <= 40) {
      // Mix objectives + ice obstacles
      if (levelNum % 2 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 4));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 15 + Math.floor(levelNum / 4),
          current: 0,
        });
      }
      const target = 1000 + levelNum * 250;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Add ice obstacles
      if (levelNum >= 25) {
        const iceCount = Math.min(Math.floor((levelNum - 20) / 3), 8);
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }
    } else {
      // Hard levels: multiple objectives + obstacles
      const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 5));
      level.objectives.push({
        type: 'collect',
        tileId: tileIdx,
        emoji: TILE_TYPES[tileIdx].emoji,
        target: 20 + Math.floor(levelNum / 5),
        current: 0,
      });
      const target = 2000 + levelNum * 200;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Ice + seaweed obstacles
      const iceCount = Math.min(Math.floor((levelNum - 30) / 3), 10);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }
      if (levelNum >= 50) {
        const seaweedCount = Math.min(Math.floor((levelNum - 45) / 4), 6);
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }

      level.moves = Math.max(12, baseMoves - 3);
    }

    // Star thresholds
    const baseScore = level.objectives.find(o => o.type === 'score')?.target || 1000;
    level.starThresholds = [
      baseScore,
      Math.floor(baseScore * 1.5),
      Math.floor(baseScore * 2.2),
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
