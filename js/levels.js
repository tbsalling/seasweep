// levels.js — Level definitions with procedural parameter curves

const LevelGenerator = {
  generate(levelNum) {
    // Difficulty curves
    const gridSize = levelNum <= 8 ? 6 : levelNum <= 20 ? 7 : 8;
    const tileTypes = Math.min(3 + Math.floor(levelNum / 3), TILE_TYPES.length);
    const baseMoves = Math.max(10, 20 - Math.floor(levelNum / 3));

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
      const target = 1000 + levelNum * 400;
      level.objectives.push({ type: 'score', target, current: 0 });
      level.moves = Math.max(14, baseMoves);

      // Ice from level 6
      if (levelNum >= 6) {
        const iceCount = Math.min(Math.floor((levelNum - 4) / 2), 4);
        if (iceCount > 0) {
          level.obstacles.push({
            type: 'ice',
            positions: this.randomPositions(iceCount, gridSize, gridSize),
          });
        }
      }

      // Fog from level 8
      if (levelNum >= 8) {
        const fogCount = 2 + Math.floor((levelNum - 8) * 2);
        level.obstacles.push({
          type: 'fog',
          positions: this.randomPositions(fogCount, gridSize, gridSize),
        });
      }
    } else if (levelNum <= 20) {
      // Introduce collection objectives
      if (levelNum % 3 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 3));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 18 + Math.floor(levelNum / 2),
          current: 0,
        });
      } else {
        const target = 1500 + levelNum * 500;
        level.objectives.push({ type: 'score', target, current: 0 });
      }

      // Ice obstacles from level 11
      const iceCount = Math.min(Math.floor((levelNum - 9) / 2), 8);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }

      // Seaweed introduced at level 18
      if (levelNum >= 18) {
        const seaweedCount = Math.min(Math.floor((levelNum - 16) / 2), 3);
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }

      // Fog (levels 11-20): 4-10 fog tiles
      const fogCount = Math.min(4 + Math.floor((levelNum - 11) / 2), 10);
      level.obstacles.push({
        type: 'fog',
        positions: this.randomPositions(fogCount, gridSize, gridSize),
      });
    } else if (levelNum <= 40) {
      // Mix objectives + obstacles
      if (levelNum % 2 === 0) {
        const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 4));
        level.objectives.push({
          type: 'collect',
          tileId: tileIdx,
          emoji: TILE_TYPES[tileIdx].emoji,
          target: 24 + Math.floor(levelNum / 3),
          current: 0,
        });
      }
      const target = 2200 + levelNum * 500;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Heavy ice
      const iceCount = Math.min(Math.floor((levelNum - 10) / 2), 12);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }

      // Seaweed from level 22
      if (levelNum >= 22) {
        const seaweedCount = Math.min(Math.floor((levelNum - 19) / 2), 6);
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }

      // Fog (levels 21-40): 4-10 fog tiles
      const fogCount = Math.min(4 + Math.floor((levelNum - 20) / 3), 10);
      level.obstacles.push({
        type: 'fog',
        positions: this.randomPositions(fogCount, gridSize, gridSize),
      });
    } else {
      // Hard levels: multiple objectives + heavy obstacles
      const tileIdx = Math.floor(Math.random() * Math.min(tileTypes, 5));
      level.objectives.push({
        type: 'collect',
        tileId: tileIdx,
        emoji: TILE_TYPES[tileIdx].emoji,
        target: 35 + Math.floor(levelNum / 3),
        current: 0,
      });
      const target = 4000 + levelNum * 450;
      level.objectives.push({ type: 'score', target, current: 0 });

      // Heavy ice + seaweed
      const iceCount = Math.min(Math.floor((levelNum - 15) / 2), 14);
      if (iceCount > 0) {
        level.obstacles.push({
          type: 'ice',
          positions: this.randomPositions(iceCount, gridSize, gridSize),
        });
      }
      const seaweedCount = Math.min(Math.floor((levelNum - 25) / 2), 10);
      if (seaweedCount > 0) {
        level.obstacles.push({
          type: 'seaweed',
          positions: this.randomPositions(seaweedCount, gridSize, gridSize),
        });
      }

      // Fog (levels 40+): 6-14 fog tiles
      const fogCount = Math.min(6 + Math.floor((levelNum - 40) / 3), 14);
      level.obstacles.push({
        type: 'fog',
        positions: this.randomPositions(fogCount, gridSize, gridSize),
      });

      level.moves = Math.max(8, baseMoves - 6);
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
