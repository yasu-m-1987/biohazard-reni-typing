// ========================================
// BIOHAZARD RENI - Hunter
// ========================================

import { Creature } from './Creature.js';

export class Hunter extends Creature {
  constructor(config) {
    super(config);
    this.width = 45;
    this.height = 50;
    this.animPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    super.update(dt);
    if (!this.dying) {
      this.animPhase += dt * this.speed * 0.08;
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

    const baseColor = this.dying ? '#052a05' : this.type.color;
    const glowAmt = Math.sin(this.glowPulse) * 0.3 + 0.7;

    // Body (bulky, green scales)
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 5, 20, 25, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Scales detail
    ctx.strokeStyle = '#004400';
    ctx.lineWidth = 2;
    for(let i=0; i<3; i++) {
      ctx.beginPath(); ctx.moveTo(-5, -5 + i*10); ctx.lineTo(15, 0 + i*10); ctx.stroke();
    }

    ctx.shadowColor = this.type.glowColor;
    ctx.shadowBlur = 10 * glowAmt;

    // Eyes
    ctx.fillStyle = this.type.glowColor;
    ctx.beginPath(); ctx.ellipse(-15, -15, 4, 3, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Claws
    ctx.fillStyle = '#aaaaaa';
    const clawMove = Math.sin(this.animPhase) * 10;
    ctx.beginPath();
    ctx.moveTo(-20, 5 + clawMove);
    ctx.lineTo(-35, 10 + clawMove);
    ctx.lineTo(-25, 15 + clawMove);
    ctx.fill();

    // Legs
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 6;
    const legMove = Math.cos(this.animPhase * 2) * 8;
    
    ctx.beginPath(); ctx.moveTo(-5, 25); ctx.lineTo(-10 + legMove, 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 25); ctx.lineTo(15 - legMove, 40); ctx.stroke();

    if (this.dying) {
      ctx.globalAlpha = deathAlpha;
      ctx.fillStyle = `rgba(0, 100, 0, ${deathAlpha * 0.6})`;
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
