// ========================================
// BIOHAZARD RENI - Game Scene (Main Gameplay)
// ========================================
import { Scene } from '../core/Game.js';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS, CHARACTERS, WEAPONS,
  CREATURE_TYPES, CREATURE_ARRIVE_X,
  CREATURE_SPAWN_X_MIN, CREATURE_SPAWN_X_MAX,
  CREATURE_Y_MIN, CREATURE_Y_MAX,
  COMBO_BONUS_THRESHOLD, COMBO_HEAL_BONUS,
  PLAYER_MAX_HP, BITE_DAMAGE, AUDIO, MUTATION_SCORE_RATIO,
} from '../utils/constants.js';
import { RomajiMatcher, toRomaji } from '../utils/romanizer.js';
import { ZombieFeline } from '../entities/ZombieFeline.js';
import { Cerberus } from '../entities/Cerberus.js';
import { Tyrant } from '../entities/Tyrant.js';
import { Licker } from '../entities/Licker.js';
import { Hunter } from '../entities/Hunter.js';
import { Nemesis } from '../entities/Nemesis.js';
import { Rain } from '../effects/Rain.js';
import { Lightning } from '../effects/Lightning.js';
import { MuzzleFlash } from '../effects/MuzzleFlash.js';
import { ScreenShake } from '../effects/ScreenShake.js';
import { createStageBackground } from '../effects/StageBackground.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Scene {
  constructor() {
    super();
    this.hud = new HUD();
  }

  async enter(data) {
    this.mode = data.mode;
    this.character = data.character || CHARACTERS.RENI;
    this.words = [...data.words];
    this.usedWords = [];

    // Character abilities
    this.comboThreshold = this.character.comboThresholdOverride || COMBO_BONUS_THRESHOLD;
    this.comboBonusExtra = this.character.comboBonusExtra || 0;
    this.biteDamageReduction = this.character.biteDamageReduction || 0;
    this.killHealBonus = this.character.killHealBonus || 0;

    // State
    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalHits = 0;
    this.totalMisses = 0;
    this.kills = 0;
    this.creatures = [];
    this.currentTarget = null;
    this.gameOver = false;
    this.mutationTriggered = false;

    // Spawn
    this.spawnTimer = 1.5; // initial delay
    this.spawnRate = this.mode.spawnRateBase;
    this.gameTime = 0;

    // Effects
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.lightning = new Lightning(GAME_WIDTH, GAME_HEIGHT, this.game.audio);
    this.muzzleFlash = new MuzzleFlash();
    this.screenShake = new ScreenShake();
    this.stageBg = createStageBackground(this.mode.stage);

    // Weapon
    this.currentWeaponIndex = 0;
    this.currentWeapon = WEAPONS[0];

    // Agent muzzle position (bottom right)
    this.agentX = 130;
    this.agentY = GAME_HEIGHT - 120;

    // Audio
    this.game.audio.init();
    this.game.audio.resume();
    this.game.audio.startRain();
    this.game.audio.startBGM(false);

    // HUD
    this.hud.show();
    this.hud.updateHP(this.hp, this.maxHp);
    this.hud.updateScore(this.score, this.mode.cost);
    this.hud.updateCombo(this.combo);
    this.hud.updateWord('', '', '', '');
    this.hud.updateWeapon(this.currentWeapon.name, this.currentWeapon.color);

    // Input
    this._keyUnsub = this.game.input.onKey((e) => this._handleKey(e));
  }

  exit() {
    super.exit();
    this.game.audio.stopBGM();
    this.hud.hide();
  }

  _getNextWord() {
    if (this.words.length === 0) {
      this.words = [...this.usedWords];
      this.usedWords = [];
    }
    const idx = Math.floor(Math.random() * this.words.length);
    const word = this.words.splice(idx, 1)[0];
    this.usedWords.push(word);
    return word;
  }

  _spawnCreature() {
    const word = this._getNextWord();
    const romaji = toRomaji(word);
    const matcher = new RomajiMatcher(word);

    // Determine creature type based on game progress
    const progress = Math.min(1, this.score / this.mode.targetScore);
    let type, CreatureClass;

    if (progress > 0.8 && romaji.length > 15 && Math.random() < 0.1) {
      type = CREATURE_TYPES.NEMESIS;
      CreatureClass = Nemesis;
    } else if (progress > 0.7 && romaji.length > 12 && Math.random() < 0.15) {
      type = CREATURE_TYPES.TYRANT;
      CreatureClass = Tyrant;
    } else if (progress > 0.5 && romaji.length > 8 && Math.random() < 0.2) {
      type = CREATURE_TYPES.HUNTER;
      CreatureClass = Hunter;
    } else if (progress > 0.4 && Math.random() < 0.25) {
      type = CREATURE_TYPES.LICKER;
      CreatureClass = Licker;
    } else if (progress > 0.3 && Math.random() < 0.3) {
      type = CREATURE_TYPES.CERBERUS;
      CreatureClass = Cerberus;
    } else {
      type = CREATURE_TYPES.ZOMBIE_FELINE;
      CreatureClass = ZombieFeline;
    }

    const speedBase = this.mode.creatureSpeedBase +
      (this.mode.creatureSpeedMax - this.mode.creatureSpeedBase) * progress;
    const speed = speedBase * type.speedMultiplier * (60 + Math.random() * 30);
    const bounty = romaji.length * type.bountyPerChar;

    const creature = new CreatureClass({
      x: CREATURE_SPAWN_X_MIN + Math.random() * (CREATURE_SPAWN_X_MAX - CREATURE_SPAWN_X_MIN),
      y: CREATURE_Y_MIN + Math.random() * (CREATURE_Y_MAX - CREATURE_Y_MIN),
      speed,
      word,
      romaji,
      bounty,
      type,
      matcher,
    });

    this.creatures.push(creature);

    // Auto-target if no current target
    if (!this.currentTarget) {
      this._setTarget(creature);
    }
  }

  _setTarget(creature) {
    if (this.currentTarget) {
      this.currentTarget.targeted = false;
    }
    this.currentTarget = creature;
    creature.targeted = true;

    const progress = creature.matcher.getProgress();
    this.hud.updateWord(
      creature.word,
      creature.romaji,
      progress.completedRomaji,
      progress.currentPartial
    );
  }

  _handleKey(e) {
    if (this.gameOver) return;
    const key = e.key.toLowerCase();

    // Only accept a-z
    if (key.length !== 1 || key < 'a' || key > 'z') {
      // Tab to switch target
      if (e.key === 'Tab') {
        e.preventDefault();
        this._cycleTarget();
      }
      return;
    }

    if (!this.currentTarget || this.currentTarget.dying) {
      // Find nearest creature
      const alive = this.creatures.filter(c => !c.dying && c.alive);
      if (alive.length > 0) {
        alive.sort((a, b) => a.x - b.x);
        this._setTarget(alive[0]);
      } else {
        return;
      }
    }

    const result = this.currentTarget.matcher.tryKey(key);

    if (result === 'correct') {
      this.totalHits++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this._playWeaponSound();
      this.muzzleFlash.trigger(this.agentX + 20, this.agentY - 30);
      this.screenShake.trigger(this.currentWeapon.shakeIntensity * 0.3, 0.08);
      this.currentTarget.onHit();

      // Combo bonus
      if (this.combo > 0 && this.combo % this.comboThreshold === 0) {
        const bonus = COMBO_HEAL_BONUS + this.comboBonusExtra;
        this.hp = Math.min(this.maxHp, this.hp + bonus);
        this.game.audio.playComboBonus();
        this.hud.showFeedback(`HP +${bonus} SURVIVAL INSTINCT!`, 'bonus');
        this.hud.flashScreen('rgba(0, 255, 65, 0.2)');
        this.hud.updateHP(this.hp, this.maxHp);
      }

      // Update word display
      const progress = this.currentTarget.matcher.getProgress();
      this.hud.updateWord(
        this.currentTarget.word,
        this.currentTarget.romaji,
        progress.completedRomaji,
        progress.currentPartial
      );

    } else if (result === 'complete') {
      // Word completed - kill creature
      this.totalHits++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.kills++;
      this.score += this.currentTarget.bounty;
      this._playWeaponSound();
      this.game.audio.playKill();
      this.muzzleFlash.trigger(this.agentX + 20, this.agentY - 30);
      this.screenShake.trigger(this.currentWeapon.shakeIntensity * 0.5, 0.1);
      this.currentTarget.kill();
      this.hud.showFeedback(`KILL +$${this.currentTarget.bounty}`, 'kill');
      this.hud.updateScore(this.score, this.mode.cost);
      this._checkWeaponUpgrade();

      // Kill heal bonus (MOCHI ability -> DARKNESSRENI/KUUU ability)
      if (this.killHealBonus > 0) {
        this.hp = Math.min(this.maxHp, this.hp + this.killHealBonus);
        this.hud.updateHP(this.hp, this.maxHp);
      }

      // Combo bonus check
      if (this.combo > 0 && this.combo % this.comboThreshold === 0) {
        const bonus = COMBO_HEAL_BONUS + this.comboBonusExtra;
        this.hp = Math.min(this.maxHp, this.hp + bonus);
        this.game.audio.playComboBonus();
        this.hud.showFeedback(`HP +${bonus} SURVIVAL INSTINCT!`, 'bonus');
        this.hud.flashScreen('rgba(0, 255, 65, 0.2)');
        this.hud.updateHP(this.hp, this.maxHp);
      }

      // Check clear condition
      if (this.score >= this.mode.targetScore) {
        this.gameOver = true;
        this._endGame(true); // isClear = true
        return;
      }

      // Find next target
      this.currentTarget = null;
      const alive = this.creatures.filter(c => !c.dying && c.alive);
      if (alive.length > 0) {
        alive.sort((a, b) => a.x - b.x);
        this._setTarget(alive[0]);
      } else {
        this.hud.updateWord('', '', '', '');
      }

    } else {
      // Wrong key
      this.totalMisses++;
      this.combo = 0;
      this.game.audio.playDryFire();
      this.hud.showFeedback('JAM!', 'miss');
      this.screenShake.trigger(3, 0.1);
    }

    this.hud.updateCombo(this.combo);
  }

  _cycleTarget() {
    const alive = this.creatures.filter(c => !c.dying && c.alive);
    if (alive.length <= 1) return;

    alive.sort((a, b) => a.x - b.x);
    const currentIdx = alive.indexOf(this.currentTarget);
    const nextIdx = (currentIdx + 1) % alive.length;
    this._setTarget(alive[nextIdx]);
  }

  update(dt) {
    if (this.gameOver) return;

    this.gameTime += dt;

    if (this.hp <= 0) {
      this.hp = 0;
      this.gameOver = true;
      this._endGame(false); // isClear = false
      return;
    }

    // Danger mode BGM
    if (this.hp <= AUDIO.DANGER_HP_THRESHOLD) {
      this.game.audio.setDangerMode(true);
    } else {
      this.game.audio.setDangerMode(false);
    }

    // Mutation event
    const progress = Math.min(1, this.score / this.mode.targetScore);
    if (!this.mutationTriggered && progress >= MUTATION_SCORE_RATIO) {
      this.mutationTriggered = true;
      this.hud.showFeedback('⚠ B.O.W. MUTATION DETECTED ⚠', 'warning');
      this.hud.flashScreen('rgba(170, 58, 255, 0.3)');
      this.screenShake.trigger(10, 0.5);
      this.lightning.trigger();
      // Stage switch on mutation (e.g., lab → castle)
      if (this.mode.stageMutation) {
        this.stageBg = createStageBackground(this.mode.stageMutation);
      }
    }

    // Spawn logic
    const currentSpawnRate = this.mode.spawnRateBase -
      (this.mode.spawnRateBase - this.mode.spawnRateMin) * progress;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this._spawnCreature();
      this.spawnTimer = currentSpawnRate / 1000 + (Math.random() - 0.5) * 0.5;
    }

    // Update creatures
    for (let i = this.creatures.length - 1; i >= 0; i--) {
      const creature = this.creatures[i];
      creature.update(dt);

      // Creature reached player
      if (creature.hasArrived() && !creature.dying) {
        creature.kill();
        this.combo = 0;
        const actualDamage = Math.max(1, BITE_DAMAGE - this.biteDamageReduction);
        this.hp -= actualDamage;
        this.game.audio.playBite();
        this.screenShake.trigger(12, 0.4);
        this.hud.flashScreen('rgba(139, 0, 0, 0.4)');
        this.hud.showFeedback(`BITE! -${actualDamage} HP`, 'damage');
        this.hud.updateCombo(this.combo);
        this.hud.updateHP(this.hp, this.maxHp);

        if (this.currentTarget === creature) {
          this.currentTarget = null;
          const alive = this.creatures.filter(c => !c.dying && c.alive);
          if (alive.length > 0) {
            alive.sort((a, b) => a.x - b.x);
            this._setTarget(alive[0]);
          } else {
            this.hud.updateWord('', '', '', '');
          }
        }
      }

      // Remove dead creatures
      if (!creature.isAlive()) {
        this.creatures.splice(i, 1);
      }
    }

    // Effects
    this.rain.update(dt);
    this.lightning.update(dt);
    this.muzzleFlash.update(dt);
    this.screenShake.update(dt);
    this.stageBg.update(dt);

    // HUD updates
    this.hud.updateHP(this.hp, this.maxHp);
    this.hud.updateHeartMonitor(dt, this.combo, this.hp / this.maxHp);
  }

  _endGame(isClear) {
    this.game.audio.stopBGM();
    this.game.audio.stopRain();
    this.isClear = isClear;

    setTimeout(() => {
      this.game.switchScene('result', {
        mode: this.mode,
        character: this.character,
        score: this.score,
        kills: this.kills,
        combo: this.maxCombo,
        hits: this.totalHits,
        misses: this.totalMisses,
        accuracy: this.totalHits + this.totalMisses > 0
          ? Math.round((this.totalHits / (this.totalHits + this.totalMisses)) * 100)
          : 0,
        isClear: this.isClear,
      });
    }, 2500);
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    ctx.save();
    this.screenShake.apply(ctx);

    // Stage background
    this.stageBg.render(ctx);

    // Remove neon glow

    // Player zone marker
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CREATURE_ARRIVE_X, CREATURE_Y_MIN - 30);
    ctx.lineTo(CREATURE_ARRIVE_X, CREATURE_Y_MAX + 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Creatures (sort by y for depth)
    const sorted = [...this.creatures].sort((a, b) => a.y - b.y);
    for (const creature of sorted) {
      creature.render(ctx);
    }

    // Rain (on top of creatures)
    this.rain.render(ctx);

    // Lightning
    this.lightning.render(ctx);

    // Agent
    this._renderAgent(ctx);

    // Muzzle flash
    this.muzzleFlash.render(ctx);

    // Game over / Clear overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      
      if (this.isClear) {
        ctx.font = `bold 42px 'Orbitron', sans-serif`;
        ctx.fillStyle = COLORS.NEON_GREEN;
        ctx.shadowColor = COLORS.NEON_GREEN;
        ctx.shadowBlur = 20;
        ctx.fillText('MISSION COMPLETE', W / 2, H / 2);
      } else {
        ctx.font = `bold 64px 'Orbitron', sans-serif`;
        ctx.fillStyle = COLORS.BLOOD_RED_BRIGHT;
        ctx.shadowColor = COLORS.BLOOD_RED_BRIGHT;
        ctx.shadowBlur = 30;
        ctx.fillText('YOU ARE DEAD', W / 2, H / 2);
      }
      
      ctx.shadowBlur = 0;
      ctx.font = `16px 'Share Tech Mono', monospace`;
      ctx.fillStyle = COLORS.TEXT_DIM;
      ctx.fillText('CALCULATING RESULTS...', W / 2, H / 2 + 50);
    }

    ctx.restore();
  }

  _renderAgent(ctx) {
    const x = this.agentX;
    const y = this.agentY;
    const ch = this.character;

    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Tail (behind body) ===
    ctx.strokeStyle = ch.bodyColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (ch.tailStyle === 'long') {
      ctx.moveTo(-12, 15);
      ctx.quadraticCurveTo(-26, 2, -28, -10);
    } else if (ch.tailStyle === 'short') {
      ctx.moveTo(-12, 15);
      ctx.quadraticCurveTo(-18, 10, -16, 6);
    } else if (ch.tailStyle === 'fluffy') {
      ctx.lineWidth = 8;
      ctx.moveTo(-12, 15);
      ctx.quadraticCurveTo(-22, 2, -18, -6);
    } else {
      ctx.moveTo(-12, 15);
      ctx.bezierCurveTo(-20, 5, -28, -5, -18, 0);
    }
    ctx.stroke();
    // Tail stripes
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.lineCap = 'butt';

    // === Body (Chibi / 丸っこい) ===
    ctx.fillStyle = ch.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 8, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter)
    ctx.fillStyle = ch.bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body stripes
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.45;
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(-14, 1 + s * 7);
      ctx.quadraticCurveTo(0, -3 + s * 7, 14, 1 + s * 7);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === Head (大きくて可愛い) ===
    ctx.fillStyle = ch.headColor || ch.bodyColor;
    ctx.beginPath();
    ctx.arc(0, -20, 22, 0, Math.PI * 2);
    ctx.fill();

    // Head stripes (M mark)
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(-10, -32);
    ctx.lineTo(-6, -36);
    ctx.lineTo(-2, -30);
    ctx.lineTo(2, -36);
    ctx.lineTo(6, -36);
    ctx.lineTo(10, -32);
    ctx.stroke();
    // Side stripes
    ctx.beginPath(); ctx.moveTo(-16, -24); ctx.lineTo(-20, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, -24); ctx.lineTo(20, -20); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // === Ears (大きめ) ===
    ctx.fillStyle = ch.headColor || ch.bodyColor;
    ctx.beginPath();
    ctx.moveTo(-12, -34); ctx.lineTo(-22, -48); ctx.lineTo(-4, -40); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -34); ctx.lineTo(22, -48); ctx.lineTo(4, -40); ctx.closePath(); ctx.fill();

    // Inner ear
    ctx.fillStyle = ch.earInner;
    ctx.beginPath();
    ctx.moveTo(-11, -36); ctx.lineTo(-18, -46); ctx.lineTo(-6, -39); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, -36); ctx.lineTo(18, -46); ctx.lineTo(6, -39); ctx.closePath(); ctx.fill();

    // === Cheeks (可愛いチーク) ===
    ctx.fillStyle = 'rgba(255, 100, 120, 0.4)';
    ctx.beginPath(); ctx.ellipse(-14, -12, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(14, -12, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // === Eyes (大きく) ===
    // Eye whites
    ctx.fillStyle = '#eeeedd';
    ctx.beginPath(); ctx.ellipse(-9, -19, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, -19, 6, 7, 0, 0, Math.PI * 2); ctx.fill();

    // Pupils (colored, glowing)
    ctx.fillStyle = ch.eyeColor;
    ctx.shadowColor = ch.eyeGlow;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(-9, -19, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, -19, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Pupil slit/highlight (キラキラ)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(-10.5, -20.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7.5, -20.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(-8, -16.5, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -16.5, 1, 0, Math.PI * 2); ctx.fill();

    // === Nose ===
    ctx.fillStyle = ch.noseColor;
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(-3.5, -10); ctx.lineTo(3.5, -10);
    ctx.closePath(); ctx.fill();

    // === Mouth (可愛いω口) ===
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -7); ctx.quadraticCurveTo(-3, -3, 0, -7);
    ctx.quadraticCurveTo(3, -3, 6, -7);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = 'rgba(200,180,150,0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-18, -10); ctx.lineTo(-32, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-18, -8); ctx.lineTo(-30, -4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -10); ctx.lineTo(32, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -8); ctx.lineTo(30, -4); ctx.stroke();

    // === Gun arm ===
    ctx.strokeStyle = ch.bodyColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(25, -20);
    ctx.stroke();

    // Gun
    ctx.fillStyle = '#444';
    switch(this.currentWeapon.id) {
      case 'shotgun':
        ctx.fillRect(18, -32, 22, 5); // Long barrel
        ctx.fillStyle = '#632'; // wood pump
        ctx.fillRect(25, -31, 8, 4);
        ctx.fillStyle = '#444';
        ctx.fillRect(20, -28, 4, 8); // grip
        break;
      case 'machinegun':
        ctx.fillRect(15, -34, 25, 8); // bulky body
        ctx.fillRect(35, -32, 10, 3); // barrel
        ctx.fillRect(20, -26, 4, 8); // grip
        ctx.fillRect(28, -26, 4, 12); // magazine
        break;
      case 'magnum':
        ctx.fillStyle = '#ccc'; // silver
        ctx.fillRect(18, -33, 18, 7); // heavy barrel
        ctx.fillStyle = '#444';
        ctx.fillRect(22, -26, 5, 8); // grip
        break;
      case 'rocket':
        ctx.fillStyle = '#353'; // green tube
        ctx.fillRect(5, -38, 35, 12); // main tube
        ctx.fillStyle = '#222';
        ctx.fillRect(38, -36, 8, 8); // warhead opening
        ctx.fillRect(20, -26, 4, 8); // grip
        break;
      case 'handgun':
      default:
        ctx.fillRect(20, -32, 15, 6);
        ctx.fillRect(22, -28, 4, 8);
        break;
    }

    // Muzzle flash glow on agent
    if (this.muzzleFlash.isActive()) {
      ctx.fillStyle = 'rgba(255, 200, 50, 0.2)';
      ctx.beginPath();
      ctx.arc(0, -10, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Agent name tag
    ctx.font = `8px 'Orbitron', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${this._hexToRgb(ch.accentColor)}, 0.5)`;
    ctx.fillText(ch.name, 0, 55);

    ctx.restore();
  }

  _playWeaponSound() {
    const method = this.currentWeapon.soundMethod;
    if (this.game.audio[method]) {
      this.game.audio[method]();
    } else {
      this.game.audio.playGunshot();
    }
  }

  _checkWeaponUpgrade() {
    for (let i = WEAPONS.length - 1; i >= 0; i--) {
      if (this.score >= WEAPONS[i].scoreThreshold) {
        if (i > this.currentWeaponIndex) {
          this.currentWeaponIndex = i;
          this.currentWeapon = WEAPONS[i];
          this.game.audio.playWeaponUpgrade();
          this.hud.updateWeapon(this.currentWeapon.name, this.currentWeapon.color);
          this.hud.showFeedback(`🔫 ${this.currentWeapon.nameJp} GET!`, 'bonus');
          this.hud.flashScreen(`rgba(255, 200, 0, 0.25)`);
          this.screenShake.trigger(6, 0.3);
        }
        break;
      }
    }
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
