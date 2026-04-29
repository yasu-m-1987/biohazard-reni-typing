// ========================================
// BIOHAZARD RENI - Game Constants
// ========================================

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Difficulty Modes
export const MODES = {
  CIVILIAN: {
    id: 'CIVILIAN',
    name: 'CIVILIAN',
    subtitle: '一般市民の生存レベル',
    cost: 3000,
    wordLengthMin: 2,
    wordLengthMax: 5,
    targetScore: 3000,
    spawnRateBase: 4000,   // ms between spawns
    spawnRateMin: 2000,
    creatureSpeedBase: 0.4,
    creatureSpeedMax: 0.8,
    dataFile: 'easy',
    stage: 'mansion',
  },
  SOLDIER: {
    id: 'SOLDIER',
    name: 'SOLDIER',
    subtitle: 'プロの戦闘員レベル',
    cost: 5000,
    wordLengthMin: 5,
    wordLengthMax: 10,
    targetScore: 5000,
    spawnRateBase: 3500,
    spawnRateMin: 1500,
    creatureSpeedBase: 0.5,
    creatureSpeedMax: 1.0,
    dataFile: 'medium',
    stage: 'village',
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'PROFESSIONAL',
    subtitle: 'エリートエージェント向け',
    cost: 10000,
    wordLengthMin: 10,
    wordLengthMax: 20,
    targetScore: 10000,
    spawnRateBase: 3000,
    spawnRateMin: 1000,
    creatureSpeedBase: 0.6,
    creatureSpeedMax: 1.2,
    dataFile: 'hard',
    stage: 'lab',       // switches to 'castle' after mutation
    stageMutation: 'castle',
  },
};

// Creature Types
export const CREATURE_TYPES = {
  ZOMBIE_FELINE: {
    id: 'ZOMBIE_FELINE',
    name: 'ZOMBIE FELINE',
    speedMultiplier: 1.0,
    bountyPerChar: 60,
    color: '#4a7a3a',
    glowColor: '#6aff3a',
  },
  CERBERUS: {
    id: 'CERBERUS',
    name: 'CERBERUS',
    speedMultiplier: 1.8,
    bountyPerChar: 80,
    color: '#7a3a3a',
    glowColor: '#ff3a3a',
  },
  TYRANT: {
    id: 'TYRANT',
    name: 'TYRANT "RENI"',
    speedMultiplier: 0.6,
    bountyPerChar: 120,
    color: '#5a3a7a',
    glowColor: '#aa3aff',
  },
  LICKER: {
    id: 'LICKER',
    name: 'LICKER',
    speedMultiplier: 2.2,
    bountyPerChar: 75,
    color: '#8b0000',
    glowColor: '#ff4500',
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'HUNTER',
    speedMultiplier: 1.6,
    bountyPerChar: 90,
    color: '#006400',
    glowColor: '#adff2f',
  },
  NEMESIS: {
    id: 'NEMESIS',
    name: 'NEMESIS',
    speedMultiplier: 0.4,
    bountyPerChar: 150,
    color: '#2f4f4f',
    glowColor: '#ff00ff',
  },
};

// Scoring & HP
export const PLAYER_MAX_HP = 100;
export const BITE_DAMAGE = 25;            // HP lost per bite
export const COMBO_BONUS_THRESHOLD = 50;  // combo count for HP bonus
export const COMBO_HEAL_BONUS = 10;       // HP recovered

// Rank Thresholds (surplus over cost)
export const RANKS = {
  S: { label: 'S', title: 'LEGENDARY SURVIVOR', minSurplus: 5000, reward: '無限ハンドガン' },
  A: { label: 'A', title: 'ELITE AGENT', minSurplus: 2000, reward: 'タクティカルベスト' },
  B: { label: 'B', title: 'CIVILIAN SURVIVOR', minSurplus: 0, reward: '救急スプレー' },
  FAIL: { label: '-', title: 'MISSION FAILED', minSurplus: -Infinity, reward: 'なし' },
};

// Colors
export const COLORS = {
  BG_DARK: '#0a0a0f',
  BLOOD_RED: '#8b0000',
  BLOOD_RED_BRIGHT: '#ff1a1a',
  NEON_GREEN: '#00ff41',
  NEON_GREEN_DIM: '#004d13',
  TEXT_PRIMARY: '#e0e0e0',
  TEXT_DIM: '#666666',
  DANGER: '#ff3333',
  HUD_BG: 'rgba(0, 0, 0, 0.7)',
  AMBER: '#ffaa00',
  PURPLE: '#aa3aff',
};

// Audio
export const AUDIO = {
  GUNSHOT_FREQUENCY: 150,
  DRY_FIRE_FREQUENCY: 800,
  AMBIENT_RAIN_VOLUME: 0.15,
  BGM_NORMAL_TEMPO: 1.0,
  BGM_DANGER_TEMPO: 1.4,
  DANGER_HP_THRESHOLD: 30,  // Switch BGM tempo when HP <= 30
};

// Physics
export const CREATURE_ARRIVE_X = 180;     // x position where creature "arrives" (bites)
export const CREATURE_SPAWN_X_MIN = 1100; // min x spawn
export const CREATURE_SPAWN_X_MAX = 1300; // max x spawn
export const CREATURE_Y_MIN = 380;
export const CREATURE_Y_MAX = 650;

// Playable Characters (キジトラ猫ベース)
export const CHARACTERS = {
  RENI: {
    id: 'RENI',
    name: 'RENI',
    title: 'エージェント・レニ',
    description: '元特殊部隊のキジトラ。正確無比なガンアクション。',
    ability: 'コンボボーナス 回復量+5 追加',
    eyeColor: '#66dd44',
    eyeGlow: '#66dd44',
    bodyColor: '#8B6914',       // キジトラのベース茶色
    headColor: '#7A5C10',
    stripeColor: '#3D2B00',     // 暗い縞模様
    bellyColor: '#D4B066',      // 明るいお腹
    noseColor: '#E8A0A0',
    accentColor: '#00ccff',
    earInner: '#D4A0A0',
    tailStyle: 'long',
    unlockCost: 0,
    // Gameplay bonus
    comboBonusExtra: 5,
    biteDamageReduction: 0,
  },
  AKATI: {
    id: 'AKATI',
    name: 'AKATI',
    title: 'コマンダー・アカチ',
    description: '歴戦のキジトラ指揮官。鉄壁の防御力。',
    ability: '咬みつきダメージ -5 軽減',
    eyeColor: '#FFAA00',
    eyeGlow: '#FFAA00',
    bodyColor: '#9B7020',       // やや赤みがかったキジトラ
    headColor: '#8A6218',
    stripeColor: '#4A3000',
    bellyColor: '#E0C080',
    noseColor: '#CC7070',
    accentColor: '#ff6600',
    earInner: '#CC8888',
    tailStyle: 'short',
    unlockCost: 0,
    comboBonusExtra: 0,
    biteDamageReduction: 5,
  },
  SIZUCHUN: {
    id: 'SIZUCHUN',
    name: 'SIZUCHUN',
    title: 'ファントム・シズチュン',
    description: '影に潜むキジトラ暗殺者。驚異の連射。',
    ability: 'コンボ閾値 40 に軽減',
    eyeColor: '#cc88ff',
    eyeGlow: '#cc88ff',
    bodyColor: '#7A5A12',       // やや暗めのキジトラ
    headColor: '#6B4E0E',
    stripeColor: '#2E1800',
    bellyColor: '#C8A858',
    noseColor: '#D09090',
    accentColor: '#cc00ff',
    earInner: '#C09090',
    tailStyle: 'fluffy',
    unlockCost: 0,
    comboBonusExtra: 0,
    biteDamageReduction: 0,
    comboThresholdOverride: 40,
  },
  KUUU: {
    id: 'KUUU',
    name: 'KUUU',
    title: 'ドクター・クゥゥ',
    description: '天才キジトラ科学者。体力回復のプロ。',
    ability: 'キル毎に HP+1 回復',
    eyeColor: '#44ee88',
    eyeGlow: '#44ee88',
    bodyColor: '#947018',       // 明るめのキジトラ
    headColor: '#856214',
    stripeColor: '#3A2600',
    bellyColor: '#DCC070',
    noseColor: '#E8B0B0',
    accentColor: '#00ff88',
    earInner: '#D0A0A0',
    tailStyle: 'curled',
    unlockCost: 0,
    comboBonusExtra: 0,
    biteDamageReduction: 0,
    killHealBonus: 1,
  },
  RENU: {
    id: 'RENU',
    name: 'RENU',
    title: 'メディック・レニュ',
    description: '癒やしのオーラを纏う猫。圧倒的な回復力。',
    ability: 'コンボボーナス 回復量+15 追加',
    eyeColor: '#ff88dd',
    eyeGlow: '#ff88dd',
    bodyColor: '#EAE5D9',       // 白っぽいベース
    headColor: '#DCD4C4',
    stripeColor: '#B0A898',
    bellyColor: '#FFFFFF',
    noseColor: '#FFAADD',
    accentColor: '#ff44aa',
    earInner: '#FFCADD',
    tailStyle: 'fluffy',
    unlockCost: 10000,
    comboBonusExtra: 15,
    biteDamageReduction: 0,
  },
  RENIMARU: {
    id: 'RENIMARU',
    name: 'RENIMARU',
    title: 'タンク・レニマル',
    description: '丸っこいフォルムの茶トラ。驚異の耐久力。',
    ability: '咬みつきダメージ 半減 (-12)',
    eyeColor: '#55aaff',
    eyeGlow: '#55aaff',
    bodyColor: '#D08030',       // 茶トラ
    headColor: '#C07020',
    stripeColor: '#804010',
    bellyColor: '#F0D0A0',
    noseColor: '#E09090',
    accentColor: '#ff8800',
    earInner: '#E0A0A0',
    tailStyle: 'short',
    unlockCost: 15000,
    comboBonusExtra: 0,
    biteDamageReduction: 12,
  },
  RENITARO: {
    id: 'RENITARO',
    name: 'RENITARO',
    title: 'サムライ・レニタロウ',
    description: 'ハチワレのタフガイ。コンボを繋げやすい。',
    ability: 'コンボ閾値 30 に軽減',
    eyeColor: '#eeeeee',
    eyeGlow: '#ffffff',
    bodyColor: '#222225',       // 黒
    headColor: '#1A1A1D',
    stripeColor: '#111111',
    bellyColor: '#FFFFFF',      // 白（ハチワレ）
    noseColor: '#FFAAAA',
    accentColor: '#ffffff',
    earInner: '#FFAAAA',
    tailStyle: 'long',
    unlockCost: 25000,
    comboBonusExtra: 0,
    biteDamageReduction: 0,
    comboThresholdOverride: 30,
  },
  DARKNESSRENI: {
    id: 'DARKNESSRENI',
    name: 'DARKNESSRENI',
    title: '最凶・ダークネスレニ',
    description: '暗黒に染まったレニ。キルで大量回復。',
    ability: 'キル毎に HP+3 回復',
    eyeColor: '#ff0000',
    eyeGlow: '#ff0000',
    bodyColor: '#0a0a0a',       // 漆黒
    headColor: '#000000',
    stripeColor: '#1a0000',
    bellyColor: '#111111',
    noseColor: '#440000',
    accentColor: '#ff0000',
    earInner: '#220000',
    tailStyle: 'curled',
    unlockCost: 50000,
    comboBonusExtra: 0,
    biteDamageReduction: 0,
    killHealBonus: 3,
  },
};

// Mutation event
export const MUTATION_SCORE_RATIO = 0.5;  // at 50% target score

// Weapons (score-based progression)
export const WEAPONS = [
  {
    id: 'handgun',
    name: 'HANDGUN',
    nameJp: 'ハンドガン',
    scoreThreshold: 0,
    color: '#ffcc00',
    flashSize: 1.0,
    shakeIntensity: 3,
    soundMethod: 'playHandgun',
  },
  {
    id: 'shotgun',
    name: 'SHOTGUN',
    nameJp: 'ショットガン',
    scoreThreshold: 1000,
    color: '#ff8800',
    flashSize: 1.6,
    shakeIntensity: 5,
    soundMethod: 'playShotgun',
  },
  {
    id: 'machinegun',
    name: 'MACHINE GUN',
    nameJp: 'マシンガン',
    scoreThreshold: 3000,
    color: '#ffdd44',
    flashSize: 1.2,
    shakeIntensity: 2,
    soundMethod: 'playMachineGun',
  },
  {
    id: 'magnum',
    name: 'MAGNUM',
    nameJp: 'マグナム',
    scoreThreshold: 6000,
    color: '#ff4444',
    flashSize: 2.0,
    shakeIntensity: 8,
    soundMethod: 'playMagnum',
  },
  {
    id: 'rocket',
    name: 'ROCKET LAUNCHER',
    nameJp: 'ロケットランチャー',
    scoreThreshold: 10000,
    color: '#ff2200',
    flashSize: 3.0,
    shakeIntensity: 12,
    soundMethod: 'playRocketLauncher',
  },
];
