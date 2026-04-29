// ========================================
// BIOHAZARD RENI - Licker
// ========================================

import { Creature } from './Creature.js';

export class Licker extends Creature {
  constructor(config) {
    super(config);
    this.width = 50;
    this.height = 30;
    this.animPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.animPhase += dt * this.speed * 0.1;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const deathAlpha = this.dying ? 1 - (this.deathTimer / this.deathDuration) : 1;
    const deathScale = this.dying ? 1 + this.deathTimer * 0.5 : 1;

    if (this.dying) {
      ctx.scale(deathScale, deathScale);
      ctx.globalAlpha = deathAlpha;
    }

    if (this.hitFlash > 0) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 20 * this.hitFlash;
    }

    const baseColor = this.dying ? '#2a0505' : this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;

    // Body (low, muscular, reddish)
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 5, 25, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exposed brain
    ctx.fillStyle = '#ff8888';
    ctx.beginPath();
    ctx.ellipse(-15, -5, 12, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = this.type.glowColor;
    ctx.shadowBlur = 10 * glowAmt;

    // Long Tongue
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25, 8);
    const tongueExt = Math.sin(this.animPhase) * 15;
    ctx.quadraticCurveTo(-40 - tongueExt, 15, -50 - tongueExt, 5 + Math.cos(this.animPhase)*5);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Legs (crawling)
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 4;
    const legMove = Math.sin(this.animPhase * 2) * 8;
    
    // Front leg
    ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(-15 + legMove, 25); ctx.stroke();
    // Back leg
    ctx.beginPath(); ctx.moveTo(15, 10); ctx.lineTo(20 - legMove, 25); ctx.stroke();

    if (this.dying) {
      ctx.globalAlpha = deathAlpha;
      ctx.fillStyle = `rgba(200, 0, 0, ${deathAlpha * 0.6})`;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc((Math.random()-0.5)*50, (Math.random()-0.5)*50, Math.random()*5+2, 0, Math.PI*2);
        ctx.fill();
      }
    }

    ctx.restore();

    if (!this.dying) this.renderWord(ctx);
  }
}
