// ========================================
// BIOHAZARD RENI - File Select Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';
import { getSaveSlots, loadSlot, deleteSlot } from '../utils/storage.js';

export class FileSelectScene extends Scene {
  constructor() {
    super();
    this.selectedIndex = 0;
    this.slots = [];
    this.mode = 'load'; // 'load', 'new', 'save'
    this.time = 0;
  }

  async enter(data) {
    this.mode = data?.mode || 'load';
    this.selectedIndex = 0;
    this.time = 0;
    this.slots = getSaveSlots();

    this._keyUnsub = this.game.input.onKey((e) => {
      if (e.key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + 5) % 5;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % 5;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this._confirmSelection();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this._deleteSelection();
      } else if (e.key === 'Escape') {
        this.game.switchScene('title');
      }
    });
  }

  _deleteSelection() {
    const slot = this.slots[this.selectedIndex];
    if (slot.empty) {
      this.game.audio.playDryFire();
      return;
    }
    // Delete data
    this.game.audio.playGunshot();
    deleteSlot(slot.id);
    this.slots = getSaveSlots(); // refresh
  }

  _confirmSelection() {
    const slot = this.slots[this.selectedIndex];

    if (slot.empty) {
      this.game.audio.playDryFire();
      return; // Can't load empty
    }
    this.game.audio.playGunshot();
    loadSlot(slot.id);
    this.game.switchScene('modeSelect');
  }

  update(dt) {
    this.time += dt;
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.textAlign = 'center';
    
    // Header
    ctx.font = `bold 28px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.TEXT_PRIMARY;
    ctx.fillText('LOAD GAME - SELECT SLOT', W / 2, 80);

    // Slots
    const startY = 160;
    const slotH = 70;
    const gap = 20;
    const slotW = 600;
    const startX = (W - slotW) / 2;

    for (let i = 0; i < 5; i++) {
      const slot = this.slots[i];
      const y = startY + i * (slotH + gap);
      const selected = i === this.selectedIndex;

      ctx.fillStyle = selected ? 'rgba(0, 255, 65, 0.15)' : 'rgba(20, 25, 35, 0.8)';
      ctx.strokeStyle = selected ? COLORS.NEON_GREEN : 'rgba(80, 80, 80, 0.4)';
      ctx.lineWidth = selected ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(startX, y, slotW, slotH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = `bold 20px 'Share Tech Mono', monospace`;
      ctx.fillStyle = selected ? COLORS.NEON_GREEN : COLORS.TEXT_PRIMARY;
      ctx.fillText(`DATA ${slot.id}`, startX + 20, y + 42);

      ctx.textAlign = 'right';
      if (slot.empty) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillText('NO DATA', startX + slotW - 20, y + 42);
      } else {
        ctx.font = `14px 'Share Tech Mono', monospace`;
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.fillText(`SP: ${slot.points.toLocaleString()}`, startX + slotW - 20, y + 30);
        
        ctx.font = `12px 'Noto Sans JP', sans-serif`;
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        const dateStr = new Date(slot.date).toLocaleString();
        ctx.fillText(dateStr, startX + slotW - 20, y + 50);
      }
    }

    // Back / Delete hint
    ctx.textAlign = 'center';
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(100,100,100,0.6)';
    ctx.fillText('[ESC] BACK', W / 2, H - 40);
    
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.fillText('[DEL / BACKSPACE] DELETE DATA', W / 2, H - 20);

    ctx.restore();
  }
}
