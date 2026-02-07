// input.js — Unified touch/mouse/pointer input handler

class InputHandler {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.enabled = true;
    this.onTileSelect = null; // callback(row, col)
    this.onSwipe = null; // callback(fromRow, fromCol, toRow, toCol)
    this.onUIClick = null; // callback(x, y)

    this.pointerDown = false;
    this.startX = 0;
    this.startY = 0;
    this.startRow = -1;
    this.startCol = -1;
    this.swipeThreshold = 20;
    this.swiped = false;

    this.bindEvents();
  }

  bindEvents() {
    const opts = { passive: false };

    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e), opts);
    this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e), opts);
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e), opts);
    this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e), opts);

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent scrolling while touching the canvas
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), opts);
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  handlePointerDown(e) {
    if (!this.enabled) return;
    e.preventDefault();

    const { x, y } = this.getCanvasCoords(e);
    this.pointerDown = true;
    this.startX = x;
    this.startY = y;
    this.swiped = false;

    const { row, col } = this.renderer.screenToGrid(x, y);
    this.startRow = row;
    this.startCol = col;
  }

  handlePointerMove(e) {
    if (!this.enabled || !this.pointerDown || this.swiped) return;
    e.preventDefault();

    const { x, y } = this.getCanvasCoords(e);
    const dx = x - this.startX;
    const dy = y - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this.swipeThreshold) {
      this.swiped = true;

      // Determine swipe direction
      let dRow = 0, dCol = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        dCol = dx > 0 ? 1 : -1;
      } else {
        dRow = dy > 0 ? 1 : -1;
      }

      if (this.onSwipe && this.startRow >= 0 && this.startCol >= 0) {
        this.onSwipe(this.startRow, this.startCol, this.startRow + dRow, this.startCol + dCol);
      }
    }
  }

  handlePointerUp(e) {
    if (!this.enabled) return;
    e.preventDefault();

    if (!this.swiped && this.pointerDown) {
      const { x, y } = this.getCanvasCoords(e);
      const { row, col } = this.renderer.screenToGrid(x, y);

      if (this.onTileSelect) {
        this.onTileSelect(row, col);
      }
      if (this.onUIClick) {
        this.onUIClick(x, y);
      }
    }

    this.pointerDown = false;
    this.swiped = false;
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}
