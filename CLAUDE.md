# Sea Sweep — Development Guide

## Project Overview
Maritime-themed match-3 puzzle game. Pure static HTML/CSS/JS — no build step, no frameworks, no dependencies.

## How to Run
Open `index.html` directly in a browser, or serve locally:
```
python3 -m http.server 8080
```

## Architecture
- All JS files are loaded via `<script>` tags in `index.html` in dependency order
- Canvas-based rendering — all UI (menus, modals, HUD) is drawn on canvas, not DOM
- Emoji tiles rendered via `ctx.fillText()` — no image assets
- Game state managed by a single `Game` class in `main.js` with a state machine pattern
- Sound effects synthesized with Web Audio API — no audio files

## Key Files
- `js/board.js` — Core game logic: grid, match detection, gravity, specials, obstacles
- `js/main.js` — Game loop, state machine, orchestrates all modules
- `js/renderer.js` — Canvas drawing with device pixel ratio scaling
- `js/ui.js` — All menus/modals/HUD drawn on canvas
- `js/levels.js` — Procedural level generation with difficulty curves
- `js/storage.js` — localStorage persistence, lives timer

## Conventions
- No build step — all code runs directly in the browser
- No external dependencies — everything is vanilla JS
- Global classes/objects (not ES modules) since files are loaded via script tags
- Emoji for all visual tile assets to avoid file dependencies
