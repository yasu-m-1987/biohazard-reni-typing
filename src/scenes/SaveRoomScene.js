// ========================================
// BIOHAZARD RENI - Save Room Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';

export class SaveRoomScene extends Scene {
  constructor() {
    super();
    this.time = 0;
    this.saveProgress = 0; // 0 to 1
  }

  async enter(data) {
    this.time = 0;
    this.saveProgress = 0;

    // Optional: play a calm "safe room" BGM here if audio supports it
    // this.game.audio.playSafeRoomBGM();

    // No input needed, just wait to transition
    this._keyUnsub = this.game.input.onKey((e) => {
      // Allow skip
      if (e.key === 'Escape' || e.key === 'Enter') {
        this._finishSave();
      }
    });
  }

  _finishSave() {
    this.game.switchScene('modeSelect');
  }

  update(dt) {
    const oldProgress = this.saveProgress;
    this.time += dt;
    this.saveProgress = Math.min(1, this.time / 2.0); // 2 seconds to "save"
    
    // Play a typewriter clack periodically as progress increases
    if (Math.floor(this.saveProgress * 10) > Math.floor(oldProgress * 10)) {
      this.game.audio.playGunshot(); // stand-in for clack
    }

    if (this.time >= 2.5 && oldProgress < 1.0) {
       this.game.audio.playComboBonus(); // "Ding!" completion
       setTimeout(() => this._finishSave(), 500);
    }
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Dark moody background
    ctx.fillStyle = '#080505';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    
    // Typewriter graphics (abstract / silhouette)
    ctx.translate(W / 2, H / 2);
    
    // Desk
    ctx.fillStyle = '#1a1010';
    ctx.beginPath();
    ctx.ellipse(0, 80, 200, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Typewriter base
    ctx.fillStyle = '#222';
    ctx.fillRect(-80, 0, 160, 60);
    ctx.fillStyle = '#111';
    ctx.fillRect(-70, -20, 140, 20);
    
    // Paper
    ctx.fillStyle = '#ddccbb';
    ctx.fillRect(-50, -80, 100, 70);
    
    // Text on paper
    ctx.fillStyle = '#333';
    ctx.font = `14px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'left';
    
    const charsToShow = Math.floor(this.saveProgress * 10);
    const typedText = "AUTOSAVING".slice(0, charsToShow);
    ctx.fillText(typedText, -40, -40);

    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = `bold 24px 'Share Tech Mono', monospace`;
    
    if (this.saveProgress >= 1) {
      ctx.fillStyle = COLORS.NEON_GREEN;
      ctx.shadowColor = COLORS.NEON_GREEN;
      ctx.shadowBlur = 15;
      ctx.fillText('SAVE COMPLETE', W / 2, H * 0.8);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = COLORS.TEXT_PRIMARY;
      ctx.fillText('RECORDING PROGRESS...', W / 2, H * 0.8);
    }

    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(100,100,100,0.4)';
    ctx.fillText('[ENTER / ESC] SKIP', W / 2, H - 20);
  }
}
