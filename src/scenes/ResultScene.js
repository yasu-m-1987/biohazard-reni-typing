// ========================================
// BIOHAZARD RENI - Result Scene
// ========================================
import { Scene } from '../core/Game.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RANKS } from '../utils/constants.js';
import { saveScore, addPoints, getPoints, saveCurrentSlot } from '../utils/storage.js';

export class ResultScene extends Scene {
  constructor() {
    super();
    this.data = null;
    this.rank = null;
    this.revealPhase = 0;
    this.time = 0;
    this.scanlineOffset = 0;
    this.statsRevealed = 0;
  }

  async enter(data) {
    this.data = data;
    this.time = 0;
    this.revealPhase = 0;
    this.statsRevealed = 0;

    // Calculate evaluation score
    this.evaluationScore = 0;
    this.timeDiff = 0;

    if (!data.isClear) {
      this.rank = RANKS.FAIL;
    } else {
      this.timeDiff = data.mode.targetTime - data.time;

      // Accuracy Score (Max 4000)
      let accuracyScore = 0;
      if (data.accuracy >= 100) accuracyScore = 4000;
      else if (data.accuracy >= 95) accuracyScore = 3000;
      else if (data.accuracy >= 90) accuracyScore = 1500;

      // Damage Score (Max 3000)
      let damageScore = 0;
      if (data.damageTaken === 0) damageScore = 3000;
      else if (data.damageTaken === 1) damageScore = 1500;
      else if (data.damageTaken === 2) damageScore = 500;

      // Time Score (Bonus for fast clear)
      let timeScore = 0;
      if (this.timeDiff > 0) {
        timeScore = Math.floor(this.timeDiff * 100);
      }

      this.evaluationScore = accuracyScore + damageScore + timeScore;

      if (this.evaluationScore >= RANKS.SSS.minScore) this.rank = RANKS.SSS;
      else if (this.evaluationScore >= RANKS.SS.minScore) this.rank = RANKS.SS;
      else if (this.evaluationScore >= RANKS.S.minScore) this.rank = RANKS.S;
      else if (this.evaluationScore >= RANKS.A.minScore) this.rank = RANKS.A;
      else if (this.evaluationScore >= RANKS.B.minScore) this.rank = RANKS.B;
      else this.rank = RANKS.C;
    }

    // Reward calculation
    const baseReward = data.mode.baseReward || 3000;
    this.rankBonus = this.rank.bonusRate > -1 ? Math.floor(baseReward * this.rank.bonusRate) : 0;
    this.earnedPoints = this.rank === RANKS.FAIL ? 0 : Math.max(0, baseReward + this.rankBonus);

    // Save score
    saveScore(data.mode.id, {
      score: this.evaluationScore,
      kills: data.kills,
      accuracy: data.accuracy,
      maxCombo: data.combo,
      rank: this.rank.label,
    });

    // Add points & Auto-Save
    addPoints(this.earnedPoints);
    this.totalPoints = getPoints();
    saveCurrentSlot();

    const hud = document.getElementById('hud-overlay');
    hud.style.display = 'none';

    this._keyUnsub = this.game.input.onKey((e) => {
      if (this.time < 2) return; // Prevent accidental skip
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        this.game.audio.playMenuSelect();
        this.game.switchScene('loading', { mode: this.data.mode, character: this.data.character });
      } else if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        this.game.audio.playMenuSelect();
        this.game.switchScene('saveRoom');
      }
    });
  }

  exit() { super.exit(); }

  update(dt) {
    this.time += dt;
    this.scanlineOffset += dt * 20;
    this.revealPhase = Math.min(1, this.time / 2.5);
    this.statsRevealed = Math.min(8, Math.floor(this.time / 0.25));
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const d = this.data;

    // Background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Scanlines
    ctx.fillStyle = 'rgba(0,255,65,0.015)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

    ctx.save();
    ctx.textAlign = 'center';

    // Header
    ctx.font = `bold 16px 'Orbitron', sans-serif`;
    ctx.fillStyle = 'rgba(200,200,200,0.4)';
    ctx.fillText('MISSION REPORT', W / 2, 50);

    ctx.font = `bold 12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = 'rgba(200,200,200,0.3)';
    const charName = d.character ? d.character.name : 'NORA';
    ctx.fillText(`${d.mode.name} CLASS // AGENT ${charName}`, W / 2, 72);

    // Rank display (large, centered)
    if (this.revealPhase > 0.3) {
      const rankAlpha = Math.min(1, (this.revealPhase - 0.3) / 0.3);
      let rankColor = COLORS.BLOOD_RED_BRIGHT;
      if (this.rank === RANKS.SSS) rankColor = '#ffbb00';
      else if (this.rank === RANKS.SS) rankColor = '#ff66aa';
      else if (this.rank === RANKS.S) rankColor = '#ffd700';
      else if (this.rank === RANKS.A) rankColor = COLORS.NEON_GREEN;
      else if (this.rank === RANKS.B) rankColor = COLORS.AMBER;
      else if (this.rank === RANKS.C) rankColor = COLORS.TEXT_PRIMARY;

      // Rank letter
      ctx.font = `900 100px 'Orbitron', sans-serif`;
      ctx.fillStyle = `rgba(${this._hexToRgb(rankColor)}, ${rankAlpha})`;
      
      // SSS/SS effects
      if (this.rank === RANKS.SSS || this.rank === RANKS.SS) {
        ctx.shadowColor = rankColor;
        ctx.shadowBlur = 40 * rankAlpha + Math.sin(this.time * 5) * 10;
        ctx.fillStyle = `hsl(${this.time * 100 % 360}, 100%, 70%)`;
      } else {
        ctx.shadowColor = rankColor;
        ctx.shadowBlur = 30 * rankAlpha;
      }

      ctx.fillText(this.rank.label === '-' ? '✕' : this.rank.label, W / 2, 190);
      ctx.shadowBlur = 0;

      // Rank title
      ctx.font = `bold 18px 'Orbitron', sans-serif`;
      ctx.fillStyle = `rgba(${this._hexToRgb(rankColor)}, ${rankAlpha * 0.8})`;
      ctx.fillText(this.rank.title, W / 2, 225);

      // Reward
      if (this.rank !== RANKS.FAIL) {
        ctx.font = `12px 'Share Tech Mono', monospace`;
        ctx.fillStyle = `rgba(200,200,200,${rankAlpha * 0.5})`;
        ctx.fillText(`REWARD: ${this.rank.reward}`, W / 2, 248);
      }
    }

    // Stats panel
    if (this.revealPhase > 0.5) {
      const panelAlpha = Math.min(1, (this.revealPhase - 0.5) / 0.3);
      const panelX = W / 2 - 250;
      const panelY = 275;
      const panelW = 500;
      const panelH = 240;

      ctx.fillStyle = `rgba(10, 15, 25, ${panelAlpha * 0.8})`;
      ctx.strokeStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 6);
      ctx.fill();
      ctx.stroke();

      const baseReward = d.mode.baseReward || 3000;
      
      // Target text
      let timeText = `${d.time.toFixed(1)}s (Target: ${d.mode.targetTime}s)`;
      if (this.timeDiff > 0) timeText += ` [-${this.timeDiff.toFixed(1)}s]`;
      
      let accuracyText = `${d.accuracy}%`;
      if (d.accuracy >= 100) accuracyText += ` [PERFECT]`;

      let damageText = `${d.damageTaken}`;
      if (d.damageTaken === 0) damageText += ` [NO DAMAGE]`;

      const stats = [
        { label: 'EVALUATION SCORE', value: `${this.evaluationScore.toLocaleString()} PTS`, color: COLORS.NEON_GREEN },
        { label: 'CLEAR TIME', value: timeText, color: this.timeDiff > 0 ? COLORS.NEON_GREEN : COLORS.TEXT_PRIMARY },
        { label: 'DAMAGE TAKEN', value: damageText, color: d.damageTaken === 0 ? COLORS.AMBER : COLORS.DANGER },
        { label: 'ACCURACY', value: accuracyText, color: d.accuracy >= 100 ? COLORS.AMBER : COLORS.TEXT_PRIMARY },
        { label: 'BASE REWARD', value: `${baseReward.toLocaleString()} SP`, color: COLORS.TEXT_PRIMARY },
        { label: 'RANK BONUS', value: `${this.rankBonus > 0 ? '+' : ''}${this.rankBonus.toLocaleString()} SP`, color: this.rankBonus > 0 ? COLORS.NEON_GREEN : (this.rankBonus < 0 ? COLORS.DANGER : COLORS.TEXT_PRIMARY) },
        { label: 'TOTAL EARNED', value: `+${this.earnedPoints.toLocaleString()} SP`, color: '#cc88ff' },
      ];

      ctx.textAlign = 'left';
      const statStartY = panelY + 35;

      for (let i = 0; i < Math.min(stats.length, this.statsRevealed); i++) {
        const s = stats[i];
        const sy = statStartY + i * 26;

        // Label
        ctx.font = `13px 'Share Tech Mono', monospace`;
        ctx.fillStyle = `rgba(150,150,150,${panelAlpha})`;
        ctx.fillText(s.label, panelX + 30, sy);

        // Separator dots
        ctx.fillStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
        const dotsX = panelX + 160;
        for (let dx = 0; dx < 180; dx += 6) {
          ctx.fillRect(dotsX + dx, sy - 3, 2, 1);
        }

        // Value
        ctx.textAlign = 'right';
        ctx.fillStyle = s.color;
        ctx.font = `bold 14px 'Share Tech Mono', monospace`;
        ctx.fillText(s.value, panelX + panelW - 30, sy);
        ctx.textAlign = 'left';
      }

      // Divider
      if (this.statsRevealed >= 4) {
        ctx.strokeStyle = `rgba(80,80,80,${panelAlpha * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(panelX + 20, statStartY + 3 * 26 + 13);
        ctx.lineTo(panelX + panelW - 20, statStartY + 3 * 26 + 13);
        ctx.stroke();
      }
    }

    // Actions
    if (this.time > 2.5) {
      const actAlpha = Math.min(1, (this.time - 2.5) / 0.5);
      ctx.textAlign = 'center';
      ctx.font = `13px 'Share Tech Mono', monospace`;
      ctx.fillStyle = `rgba(0, 255, 65, ${actAlpha * (0.5 + Math.sin(this.time * 3) * 0.2)})`;
      ctx.fillText('[R] RETRY MISSION', W / 2, H - 70);
      ctx.fillStyle = `rgba(150,150,150,${actAlpha * 0.4})`;
      ctx.fillText('[ENTER / ESC] PROCEED TO SAVE ROOM', W / 2, H - 45);
    }

    ctx.restore();
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
