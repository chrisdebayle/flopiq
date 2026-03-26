// ── XP Configuration ──
export const XP_BASE = { beginner: 10, intermediate: 20, advanced: 35 };
export const XP_BET_TYPE_BONUS = 5;
export const XP_STREAK_MULTIPLIERS = [
  { streak: 20, mult: 3.0 },
  { streak: 15, mult: 2.5 },
  { streak: 10, mult: 2.0 },
  { streak: 5, mult: 1.5 },
  { streak: 3, mult: 1.2 },
];

export function calculateXp(difficulty, isCorrect, betTypeCorrect, currentStreak) {
  if (!isCorrect) return 0;
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
