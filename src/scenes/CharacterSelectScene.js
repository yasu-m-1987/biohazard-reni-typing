// ========================================
// BIOHAZARD RENI - Character Select Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, CHARACTERS, COLORS } from '../utils/constants.js';
import { getPoints, isCharacterUnlocked, unlockCharacter, deductPoints } from '../utils/storage.js';
import { Rain } from '../effects/Rain.js';

const charList = Object.values(CHARACTERS);

export class CharacterSelectScene extends Scene {
  constructor() {
    super();
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.selectedIndex = 0;
    this.hoverAlpha = charList.map(() => 0);
    this.time = 0;
    this.mode = null;
    this.previewAnim = 0;
  }

  async enter(data) {
    this.mode = data.mode;
    this.selectedIndex = 0;
    this.time = 0;
    this.previewAnim = 0;
    this.points = getPoints();

    this._keyUnsub = this.game.input.onKey((e) => {
      const count = charList.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + count) % count;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % count;
        this.game.audio.playMenuSelect();
      } else if (e.key === 'Enter' || e.key === ' ') {
        this._selectOrBuyCharacter(charList[this.selectedIndex]);
      } else if (e.key === 'Escape') {
        this.game.switchScene('modeSelect');
      } else if (e.key >= '1' && e.key <= String(count)) {
        this.selectedIndex = parseInt(e.key) - 1;
        this._selectOrBuyCharacter(charList[this.selectedIndex]);
      }
    });
  }

  _selectOrBuyCharacter(char) {
    if (isCharacterUnlocked(char.id)) {
      this.game.audio.playGunshot();
      this.game.switchScene('loading', {
        mode: this.mode,
        character: char,
      });
    } else {
      if (deductPoints(char.unlockCost)) {
        unlockCharacter(char.id);
        this.points = getPoints(); // Update points
        this.game.audio.playMenuSelect(); // Or some buy sound
        // Visual feedback could be added here
      } else {
        this.game.audio.playDryFire(); // Error sound
      }
    }
  }

  exit() { super.exit(); }

  update(dt) {
    this.time += dt;
    this.previewAnim += dt;
    this.rain.update(dt);

    for (let i = 0; i < charList.length; i++) {
      const target = i === this.selectedIndex ? 1 : 0;
      this.hoverAlpha[i] += (target - this.hoverAlpha[i]) * dt * 8;
    }
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
    this.rain.render(ctx);

    ctx.save();

    // Header
    ctx.textAlign = 'center';
    ctx.font = `bold 28px 'Orbitron', sans-serif`;
    ctx.fillStyle = COLORS.TEXT_PRIMARY;
    ctx.shadowColor = COLORS.NEON_GREEN;
    ctx.shadowBlur = 8;
    ctx.fillText('SELECT AGENT', W / 2, 60);
    ctx.shadowBlur = 0;

    ctx.font = `13px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.fillText(`${this.mode.name} CLASS // CHOOSE YOUR OPERATIVE`, W / 2, 88);

    // Points display
    ctx.textAlign = 'right';
    ctx.font = `bold 18px 'Share Tech Mono', monospace`;
    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.fillText(`SP: ${this.points.toLocaleString()}`, W - 40, 60);

    // Character cards
    const count = charList.length;
    // We have 8 characters now, maybe render in two rows or make cards smaller.
    // Let's use two rows if count > 4
    const cardsPerRow = 4;
    const cardW = 200, cardH = 260, gapX = 20, gapY = 20;
    
    for (let i = 0; i < count; i++) {
      const char = charList[i];
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      
      const numInRow = Math.min(cardsPerRow, count - row * cardsPerRow);
      const rowTotalW = cardW * numInRow + gapX * (numInRow - 1);
      const startX = (W - rowTotalW) / 2;
      const x = startX + col * (cardW + gapX);
      const y = 110 + row * (cardH + gapY);

      const selected = i === this.selectedIndex;
      const alpha = this.hoverAlpha[i];
      const color = char.accentColor;
      const unlocked = isCharacterUnlocked(char.id);

      // Card background
      ctx.fillStyle = `rgba(10, 15, 25, ${0.85 + alpha * 0.1})`;
      ctx.strokeStyle = selected ? color : `rgba(80, 80, 80, 0.25)`;
      ctx.lineWidth = selected ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      // Glow
      if (selected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Character preview
      const cx = x + cardW / 2;
      const cy = y + 70;
      
      if (!unlocked && !selected) {
        ctx.globalAlpha = 0.3;
      }
      
      let renderChar = char;
      if (!unlocked) {
        renderChar = {
          ...char,
          bodyColor: '#111',
          bellyColor: '#111',
          stripeColor: '#111',
          headColor: '#111',
          earInner: '#111',
          eyeColor: '#111',
          eyeGlow: 'transparent',
          noseColor: '#111',
          accentColor: '#555'
        };
      }

      this._renderCharPreview(ctx, cx, cy, renderChar, selected, alpha);
      ctx.globalAlpha = 1.0;

      // Lock Overlay
      if (!unlocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 8);
        ctx.fill();
        
        ctx.textAlign = 'center';
        ctx.font = `bold 24px 'Orbitron', sans-serif`;
        ctx.fillStyle = '#ff4444';
        ctx.fillText('🔒 LOCKED', cx, y + 130);
        
        ctx.font = `bold 16px 'Share Tech Mono', monospace`;
        ctx.fillStyle = this.points >= char.unlockCost ? COLORS.NEON_GREEN : '#888';
        ctx.fillText(`COST: ${char.unlockCost.toLocaleString()} SP`, cx, y + 160);
      }

      // Name
      ctx.textAlign = 'center';
      ctx.font = `bold 16px 'Orbitron', sans-serif`;
      ctx.fillStyle = selected ? color : `rgba(200,200,200,${0.4 + alpha * 0.4})`;
      ctx.fillText(char.name, cx, y + 140);

      // Title
      ctx.font = `11px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = `rgba(200,200,200,${0.3 + alpha * 0.4})`;
      ctx.fillText(char.title, cx, y + 158);

      // Description
      ctx.font = `10px 'Noto Sans JP', sans-serif`;
      ctx.fillStyle = `rgba(180,180,180,${0.25 + alpha * 0.3})`;
      const desc = char.description;
      if (desc.length > 14) {
        ctx.fillText(desc.substring(0, 14), cx, y + 175);
        ctx.fillText(desc.substring(14), cx, y + 188);
      } else {
        ctx.fillText(desc, cx, y + 180);
      }

      // Ability box
      if (unlocked && (selected || alpha > 0.3)) {
        const boxY = y + 200;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.1})`;
        ctx.strokeStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 15, boxY, cardW - 30, 36, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = `8px 'Orbitron', sans-serif`;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.6})`;
        ctx.fillText('ABILITY', cx, boxY + 12);

        ctx.font = `bold 10px 'Noto Sans JP', sans-serif`;
        ctx.fillStyle = `rgba(${this._hexToRgb(color)}, ${alpha * 0.9})`;
        ctx.fillText(char.ability, cx, boxY + 28);
      }

      // Number hint
      ctx.font = `10px 'Share Tech Mono', monospace`;
      ctx.fillStyle = `rgba(150,150,150,0.3)`;
      ctx.fillText(`[${i + 1}]`, cx, y + cardH - 8);
    }

    // Selected character spotlight line
    // Since we have multiple rows, spotlight line is tricky, we can just omit or draw a simple line
    ctx.strokeStyle = `rgba(${this._hexToRgb(charList[this.selectedIndex].accentColor)}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 60);
    ctx.lineTo(W, H - 60);
    ctx.stroke();

    // Bottom hints
    ctx.textAlign = 'center';
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = `rgba(0, 255, 65, ${0.4 + Math.sin(this.time * 3) * 0.15})`;
    ctx.fillText('← → SELECT  //  ENTER DEPLOY', W / 2, H - 50);
    ctx.fillStyle = 'rgba(100,100,100,0.35)';
    ctx.fillText('[ESC] BACK TO MISSION SELECT', W / 2, H - 28);

    ctx.restore();
  }

  _renderCharPreview(ctx, cx, cy, char, selected, alpha) {
    ctx.save();
    ctx.translate(cx, cy);

    const breathe = selected ? Math.sin(this.previewAnim * 2) * 2 : 0;
    const scale = 1.3 + alpha * 0.15;
    ctx.scale(scale, scale);
    ctx.translate(0, breathe);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Tail (behind body) ===
    ctx.strokeStyle = char.bodyColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (char.tailStyle === 'long') {
      ctx.moveTo(-10, 18);
      ctx.quadraticCurveTo(-26, 6 + Math.sin(this.previewAnim * 1.5) * 5, -28, -6);
    } else if (char.tailStyle === 'short') {
      ctx.moveTo(-10, 18);
      ctx.quadraticCurveTo(-16, 14, -14, 10);
    } else if (char.tailStyle === 'fluffy') {
      ctx.lineWidth = 8;
      ctx.moveTo(-10, 18);
      ctx.quadraticCurveTo(-22, 6, -18, -2 + Math.sin(this.previewAnim * 1.5) * 3);
    } else { // curled
      ctx.moveTo(-10, 18);
      ctx.bezierCurveTo(-20, 10, -28, 0, -18, 5 + Math.sin(this.previewAnim) * 2);
    }
    ctx.stroke();
    // Tail stripes
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.lineCap = 'butt';

    // === Body (Chibi / 丸っこい) ===
    ctx.fillStyle = char.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 12, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter)
    ctx.fillStyle = char.bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, 18, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body stripes
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(-12, 5 + s * 6);
      ctx.quadraticCurveTo(0, 1 + s * 6, 12, 5 + s * 6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === Head (大きくて可愛い) ===
    ctx.fillStyle = char.headColor || char.bodyColor;
    ctx.beginPath();
    ctx.arc(0, -15, 20, 0, Math.PI * 2);
    ctx.fill();

    // Head stripes (M mark)
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(-6, -30);
    ctx.lineTo(-2, -24);
    ctx.lineTo(2, -30);
    ctx.lineTo(6, -30);
    ctx.lineTo(10, -26);
    ctx.stroke();
    // Side stripes
    ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(-18, -16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -20); ctx.lineTo(18, -16); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // === Ears (大きめ) ===
    ctx.fillStyle = char.headColor || char.bodyColor;
    ctx.beginPath();
    ctx.moveTo(-12, -28); ctx.lineTo(-20, -42); ctx.lineTo(-4, -33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -28); ctx.lineTo(20, -42); ctx.lineTo(4, -33); ctx.closePath(); ctx.fill();

    // Inner ear
    ctx.fillStyle = char.earInner;
    ctx.beginPath();
    ctx.moveTo(-11, -30); ctx.lineTo(-17, -40); ctx.lineTo(-6, -33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, -30); ctx.lineTo(17, -40); ctx.lineTo(6, -33); ctx.closePath(); ctx.fill();

    // === Cheeks (可愛いチーク) ===
    ctx.fillStyle = 'rgba(255, 100, 120, 0.4)';
    ctx.beginPath(); ctx.ellipse(-12, -8, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -8, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();

    // === Eyes (大きく) ===
    // Eye whites
    ctx.fillStyle = '#eeeedd';
    ctx.beginPath(); ctx.ellipse(-8, -14, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -14, 5, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Pupils (colored, glowing)
    ctx.fillStyle = char.eyeColor;
    ctx.shadowColor = char.eyeGlow;
    ctx.shadowBlur = selected ? 12 : 6;
    ctx.beginPath(); ctx.ellipse(-8, -14, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -14, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Pupil slit/highlight (キラキラ)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(-9, -15, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -15, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(-7, -12, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -12, 0.8, 0, Math.PI * 2); ctx.fill();

    // === Nose ===
    ctx.fillStyle = char.noseColor;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(-3, -5); ctx.lineTo(3, -5);
    ctx.closePath(); ctx.fill();

    // === Mouth (可愛いω口) ===
    ctx.strokeStyle = char.stripeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -3); ctx.quadraticCurveTo(-2.5, 0, 0, -3);
    ctx.quadraticCurveTo(2.5, 0, 5, -3);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = 'rgba(200,180,150,0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-15, -6); ctx.lineTo(-28, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, -4); ctx.lineTo(-26, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -6); ctx.lineTo(28, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -4); ctx.lineTo(26, -1); ctx.stroke();

    // === Front paws ===
    ctx.fillStyle = char.bellyColor;
    ctx.beginPath(); ctx.ellipse(-6, 26, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, 26, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Paw pads
    ctx.fillStyle = char.noseColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(-6, 27, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 27, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;

    // === Gun (held in right paw) ===
    ctx.fillStyle = '#444';
    ctx.fillRect(10, -2, 14, 5);
    ctx.fillRect(12, 2, 4, 6);

    // Gun muzzle detail
    ctx.fillStyle = '#222';
    ctx.fillRect(22, -3, 3, 7);

    ctx.restore();
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
