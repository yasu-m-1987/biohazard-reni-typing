// ========================================
// BIOHAZARD RENI - Nemesis
// ========================================

import { Creature } from './Creature.js';

export class Nemesis extends Creature {
  constructor(config) {
    super(config);
    this.width = 60;
    this.height = 90;
    this.animPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.animPhase += dt * this.speed * 0.05; // Slow menacing walk
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const deathAlpha = this.dying ? 1 - (this.deathTimer / this.deathDuration) : 1;
    const deathScale = this.dying ? 1 + this.deathTimer * 0.3 : 1;

    if (this.dying) {
      ctx.scale(deathScale, deathScale);
      ctx.globalAlpha = deathAlpha;
    }

    if (this.hitFlash > 0) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 30 * this.hitFlash;
    }

    const baseColor = this.dying ? '#111' : this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;

    // Body (Huge, dark coat)
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.roundRect(-25, -20, 50, 70, 10);
    ctx.fill();

    // Coat details / stitches
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-10, 50); ctx.stroke();
    
    // Head (mutated, tentacles)
    ctx.fillStyle = '#aaaaaa';
    ctx.beginPath();
    ctx.ellipse(0, -35, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.shadowColor = this.type.glowColor;
    ctx.shadowBlur = 15 * glowAmt;
    ctx.fillStyle = this.type.glowColor;
    ctx.beginPath(); ctx.arc(-5, -40, 4, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Tentacles
    ctx.strokeStyle = '#883333';
    ctx.lineWidth = 3;
    const tentacleWiggle = Math.sin(this.animPhase * 3) * 5;
    ctx.beginPath(); ctx.moveTo(-15, -25); ctx.quadraticCurveTo(-30, -30 + tentacleWiggle, -20, -10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -25); ctx.quadraticCurveTo(30, -30 - tentacleWiggle, 20, -10); ctx.stroke();

    // Legs
    ctx.fillStyle = '#222';
    const legMove = Math.sin(this.animPhase * 2) * 10;
    ctx.fillRect(-15 + legMove, 50, 12, 30);
    ctx.fillRect(5 - legMove, 50, 12, 30);

    if (this.dying) {
      ctx.globalAlpha = deathAlpha;
      ctx.fillStyle = `rgba(100, 0, 100, ${deathAlpha * 0.6})`;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc((Math.random()-0.5)*80, (Math.random()-0.5)*80, Math.random()*8+3, 0, Math.PI*2);
        ctx.fill();
      }
    }

    ctx.restore();

    if (!this.dying) this.renderWord(ctx);
  }
}
