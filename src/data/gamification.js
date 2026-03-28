// ── XP Configuration ──
export const XP_BASE = { beginner: 10, intermediate: 20, advanced: 35 };
export const XP_PENALTY = { beginner: -5, intermediate: -10, advanced: -15 };
export const XP_BET_TYPE_BONUS = 5;
export const XP_STREAK_MULTIPLIERS = [
  { streak: 20, mult: 3.0 },
  { streak: 15, mult: 2.5 },
  { streak: 10, mult: 2.0 },
  { streak: 5, mult: 1.5 },
  { streak: 3, mult: 1.2 },
];

export function calculateXp(difficulty, isCorrect, betTypeCorrect, currentStreak) {
  if (!isCorrect) return XP_PENALTY[difficulty] || -5;
  const base = XP_BASE[difficulty] || 10;
  const bonus = betTypeCorrect ? XP_BET_TYPE_BONUS : 0;
  const subtotal = base + bonus;
  let multiplier = 1.0;
  for (const t of XP_STREAK_MULTIPLIERS) {
    if (currentStreak >= t.streak) { multiplier = t.mult; break; }
  }
  return Math.round(subtotal * multiplier);
}

// ── Levels ──
export const LEVELS = [
  { name: 'Fish',       minXp: 0,     emoji: '\uD83D\uDC1F' },
  { name: 'Reg',        minXp: 100,   emoji: '\u2660\uFE0F' },
  { name: 'Grinder',    minXp: 300,   emoji: '\u2699\uFE0F' },
  { name: 'Pro',        minXp: 600,   emoji: '\u2B50' },
  { name: 'Shark',      minXp: 1200,  emoji: '\uD83E\uDD88' },
  { name: 'Crusher',    minXp: 2500,  emoji: '\uD83D\uDCA5' },
  { name: 'Solver',     minXp: 5000,  emoji: '\uD83E\uDDE0' },
  { name: 'GTO Wizard', minXp: 10000, emoji: '\uD83E\uDDD9' },
];

export function getLevel(xp) {
  let level = LEVELS[0];
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) { level = LEVELS[i]; idx = i; break; }
  }
  const nextLevel = LEVELS[idx + 1] || null;
  const xpInLevel = xp - level.minXp;
  const xpForLevel = nextLevel ? nextLevel.minXp - level.minXp : 0;
  const progress = nextLevel ? xpInLevel / xpForLevel : 1;
  return { ...level, idx, nextLevel, xpInLevel, xpForLevel, progress };
}

// ── Session Grades ──
export const SESSION_GRADES = [
  { letter: 'SSS', label: 'Unplayable',         minPct: 95, color: '#ffd700' },
  { letter: 'SS',  label: 'Suffocating',        minPct: 85, color: '#ff8c00' },
  { letter: 'S',   label: 'Squeezing',          minPct: 75, color: '#e040fb' },
  { letter: 'A',   label: 'Applying Pressure',  minPct: 65, color: '#2196f3' },
  { letter: 'B',   label: 'Building',           minPct: 55, color: '#4caf50' },
  { letter: 'C',   label: 'Cooking',            minPct: 40, color: '#ff9800' },
  { letter: 'D',   label: 'Dormant',            minPct: 0,  color: '#78909c' },
];

export function getSessionGrade(correct, total) {
  if (total === 0) return SESSION_GRADES[SESSION_GRADES.length - 1];
  const pct = (correct / total) * 100;
  for (const g of SESSION_GRADES) {
    if (pct >= g.minPct) return g;
  }
  return SESSION_GRADES[SESSION_GRADES.length - 1];
}

// ── Streak Milestones (trigger celebration) ──
export const STREAK_MILESTONES = [3, 5, 10, 15, 20, 25, 30, 50];

// ── Opponent Archetypes ──
export const OPPONENT_ARCHETYPES = {
  nit: {
    label: 'Nit / Rock',
    shortLabel: 'Nit',
    emoji: '🪨',
    color: '#78909c',
    description: 'Plays very few hands. Rarely bluffs. When they bet big, believe them.',
    spotting: 'Long stretches of folding, oversized opens, 3-bets only with premiums, aggression = the nuts.',
  },
  fish: {
    label: 'Calling Station',
    shortLabel: 'Fish',
    emoji: '🐟',
    color: '#4fc3f7',
    description: 'Calls too often, rarely raises. Driven by hope, not math.',
    spotting: 'Calls every open, rarely 3-bets, calls multiple streets with weak hands, almost never bluffs.',
  },
  tag: {
    label: 'TAG (Tight-Aggressive)',
    shortLabel: 'TAG',
    emoji: '🎯',
    color: '#66bb6a',
    description: 'Selective preflop, aggressive postflop. Closest to balanced play.',
    spotting: 'Opens 15-25% of hands, c-bets favorable textures, checks back unfavorable ones, coherent showdowns.',
  },
  lag: {
    label: 'LAG (Loose-Aggressive)',
    shortLabel: 'LAG',
    emoji: '🔥',
    color: '#ff7043',
    description: 'Wide range, constant pressure. Can have anything in any spot.',
    spotting: 'Opens 30%+ of hands, 3-bets wide, double/triple barrels often, polarized river sizing.',
  },
  weakTight: {
    label: 'Weak-Tight / ABC',
    shortLabel: 'ABC',
    emoji: '📖',
    color: '#ab47bc',
    description: 'Knows basics but plays predictably. Bet = strength, check = weakness.',
    spotting: 'Always c-bets in position, never out of position. Check-back = range cap. Rarely bluffs.',
  },
};
