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

// ── Achievements ──
export const ACHIEVEMENTS = [
  // Session milestones
  { id: 'first_session', name: 'First Hand', emoji: '🃏', desc: 'Complete your first session', check: (p) => p.totalSessions >= 1 },
  { id: 'sessions_5', name: 'Regular', emoji: '🎰', desc: 'Complete 5 sessions', check: (p) => p.totalSessions >= 5 },
  { id: 'sessions_25', name: 'Table Regular', emoji: '🏆', desc: 'Complete 25 sessions', check: (p) => p.totalSessions >= 25 },
  { id: 'sessions_100', name: 'Marathon Grinder', emoji: '💎', desc: 'Complete 100 sessions', check: (p) => p.totalSessions >= 100 },

  // Accuracy
  { id: 'perfect_session', name: 'Perfect Session', emoji: '✨', desc: '100% accuracy in a session', check: (p) => p.bestSessionPct >= 100 },
  { id: 'accuracy_80', name: 'Sharp Eye', emoji: '🎯', desc: 'Reach 80%+ overall accuracy', check: (p) => p.totalAnswered >= 20 && (p.totalCorrect / p.totalAnswered) >= 0.8 },
  { id: 'decisions_100', name: 'Century', emoji: '💯', desc: 'Make 100 decisions', check: (p) => p.totalAnswered >= 100 },
  { id: 'decisions_500', name: 'Grind Master', emoji: '⚙️', desc: 'Make 500 decisions', check: (p) => p.totalAnswered >= 500 },
  { id: 'decisions_1000', name: 'Decision Machine', emoji: '🤖', desc: 'Make 1,000 decisions', check: (p) => p.totalAnswered >= 1000 },

  // Streaks
  { id: 'streak_5', name: 'Hot Hand', emoji: '🔥', desc: 'Reach a 5-answer streak', check: (p) => p.bestStreakAllTime >= 5 },
  { id: 'streak_10', name: 'On Fire', emoji: '🌋', desc: 'Reach a 10-answer streak', check: (p) => p.bestStreakAllTime >= 10 },
  { id: 'streak_20', name: 'Unstoppable', emoji: '⚡', desc: 'Reach a 20-answer streak', check: (p) => p.bestStreakAllTime >= 20 },
  { id: 'streak_50', name: 'Legendary Run', emoji: '👑', desc: 'Reach a 50-answer streak', check: (p) => p.bestStreakAllTime >= 50 },

  // XP / Level
  { id: 'xp_100', name: 'Off the Felt', emoji: '🚀', desc: 'Earn 100 XP', check: (p) => p.totalXp >= 100 },
  { id: 'xp_1000', name: 'Stacking Up', emoji: '💰', desc: 'Earn 1,000 XP', check: (p) => p.totalXp >= 1000 },
  { id: 'xp_5000', name: 'High Roller', emoji: '🎲', desc: 'Earn 5,000 XP', check: (p) => p.totalXp >= 5000 },
  { id: 'xp_10000', name: 'GTO Wizard', emoji: '🧙', desc: 'Reach max level (10,000 XP)', check: (p) => p.totalXp >= 10000 },

  // Per-street mastery (need breakdown data)
  { id: 'preflop_master', name: 'Preflop Pro', emoji: '🃏', desc: '80%+ on preflop (20+ hands)', check: (p, b) => b?.byStreet?.preflop?.total >= 20 && (b.byStreet.preflop.correct / b.byStreet.preflop.total) >= 0.8 },
  { id: 'flop_master', name: 'Flop Artist', emoji: '🎨', desc: '80%+ on flop (20+ hands)', check: (p, b) => b?.byStreet?.flop?.total >= 20 && (b.byStreet.flop.correct / b.byStreet.flop.total) >= 0.8 },
  { id: 'turn_master', name: 'Turn Shark', emoji: '🦈', desc: '80%+ on turn (20+ hands)', check: (p, b) => b?.byStreet?.turn?.total >= 20 && (b.byStreet.turn.correct / b.byStreet.turn.total) >= 0.8 },
  { id: 'river_master', name: 'River Rat', emoji: '🐀', desc: '80%+ on river (20+ hands)', check: (p, b) => b?.byStreet?.river?.total >= 20 && (b.byStreet.river.correct / b.byStreet.river.total) >= 0.8 },

  // Per-opponent mastery
  { id: 'nit_crusher', name: 'Nit Crusher', emoji: '🪨', desc: '80%+ vs Nits (15+ hands)', check: (p, b) => b?.byOpponent?.nit?.total >= 15 && (b.byOpponent.nit.correct / b.byOpponent.nit.total) >= 0.8 },
  { id: 'fish_feeder', name: 'Fish Feeder', emoji: '🐟', desc: '80%+ vs Calling Stations (15+ hands)', check: (p, b) => b?.byOpponent?.fish?.total >= 15 && (b.byOpponent.fish.correct / b.byOpponent.fish.total) >= 0.8 },
  { id: 'tag_tamer', name: 'TAG Tamer', emoji: '🎯', desc: '80%+ vs TAGs (15+ hands)', check: (p, b) => b?.byOpponent?.tag?.total >= 15 && (b.byOpponent.tag.correct / b.byOpponent.tag.total) >= 0.8 },
  { id: 'lag_slayer', name: 'LAG Slayer', emoji: '🔥', desc: '80%+ vs LAGs (15+ hands)', check: (p, b) => b?.byOpponent?.lag?.total >= 15 && (b.byOpponent.lag.correct / b.byOpponent.lag.total) >= 0.8 },
  { id: 'abc_breaker', name: 'ABC Breaker', emoji: '📖', desc: '80%+ vs ABC (15+ hands)', check: (p, b) => b?.byOpponent?.weakTight?.total >= 15 && (b.byOpponent.weakTight.correct / b.byOpponent.weakTight.total) >= 0.8 },
];

export function getUnlockedAchievements(persistent, breakdown) {
  return ACHIEVEMENTS.filter(a => a.check(persistent, breakdown));
}

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
