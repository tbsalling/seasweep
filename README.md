# Sea Sweep

A maritime-themed match-3 puzzle game. Pure HTML/CSS/JS — no build step, no dependencies, deployable to GitHub Pages.

## Play

Open `index.html` in a browser, or serve locally:

```
python3 -m http.server 8080
```

## Features

- **Match-3 mechanics** — swap adjacent tiles to match 3+, with cascade combos and score multipliers
- **Special tiles** — match 4 creates a bomb (3x3 clear), match 5 creates lightning (clears all of one type), L/T shape creates a wave (clears row + column)
- **200+ levels** — procedurally scaled difficulty with increasing grid sizes, tile variety, move limits, and obstacles
- **Obstacles** — ice (breaks when matched) and seaweed (blocks matching), introduced gradually
- **Lives system** — 5 max, regenerate one every 20 minutes
- **Boosters** — bomb, lightning, and wave power-ups earned through play or rewarded ads
- **Daily bonus** — free booster for returning each day
- **Hint system** — highlights a valid move after 5 seconds idle
- **Sound effects** — synthesized via Web Audio API, no audio files
- **Particle effects** — burst particles, floating emoji, combo text, screen shake
- **Save progress** — all data persisted to localStorage
- **PWA** — service worker for offline play, installable to home screen
- **Mobile-first** — touch/swipe input, responsive canvas, safe area support

## Tile Types

| Tile | Emoji |
|------|-------|
| Fish | 🐟 |
| Shell | 🐚 |
| Starfish | ⭐ |
| Seahorse | 🦑 |
| Anchor | ⚓ |
| Treasure | 💎 |

## GitHub Pages Deployment

Push the repository contents and enable GitHub Pages in the repo settings. No build step required.

## Monetization

The game includes an ad integration layer for Google AdSense. To enable:

1. Add your publisher ID to the `<body>` tag in `index.html`:
   ```html
   <body data-ad-publisher="ca-pub-XXXXXXXXXXXXXXXX">
   ```
2. Uncomment the `<ins class="adsbygoogle">` block in `index.html` and set your `data-ad-slot` value.

Ad placements:
- **Banner** — fixed bottom ad slot
- **Interstitial** — full-screen ad every 3 levels
- **Rewarded** — optional "watch ad for +5 moves" on level fail

Ads degrade gracefully when blocked or unavailable.

## Project Structure

```
├── index.html         Single-page shell
├── manifest.json      PWA manifest
├── sw.js              Service worker for offline caching
├── css/
│   └── style.css      Responsive layout
└── js/
    ├── board.js        Grid, match detection, gravity, specials, obstacles
    ├── renderer.js     Canvas rendering with DPR scaling
    ├── animation.js    Tween engine with easing functions
    ├── particles.js    Particle effects for clears and combos
    ├── input.js        Unified touch/mouse pointer input
    ├── levels.js       Procedural level generation
    ├── audio.js        Web Audio API sound synthesis
    ├── storage.js      localStorage persistence with lives timer
    ├── ui.js           Menus, HUD, and modals drawn on canvas
    ├── ads.js          AdSense integration abstraction
    └── main.js         Game loop and state machine
```

## Credits

Built entirely by AI using [Claude Code](https://claude.ai/claude-code).

## License

MIT
