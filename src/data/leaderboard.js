import { getLevel } from './gamification.js';

const LS_KEY_LEADERBOARD = 'flopiq_leaderboard';

// ── Data access (localStorage now, backend-ready interface) ──

export function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY_LEADERBOARD) || '[]');
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(LS_KEY_LEADERBOARD, JSON.stringify(entries));
}

// ── Update a user's leaderboard entry ──

export function updateLeaderboardEntry(userId, displayName, stats) {
  const entries = loadLeaderboard();
  const idx = entries.findIndex(e => e.userId === userId);

  const entry = {
    userId,
    displayName,
    totalXp: stats.totalXp || 0,
    bestStreak: stats.bestStreakAllTime || 0,
    bestSessionPct: stats.bestSessionPct || 0,
    totalSessions: stats.totalSessions || 0,
    totalCorrect: stats.totalCorrect || 0,
    totalAnswered: stats.totalAnswered || 0,
    lastActive: Date.now(),
  };

  // Compute composite score for ranking
  entry.compositeScore = computeCompositeScore(entry);

  if (idx >= 0) {
    // Keep the higher values
    entries[idx] = {
      ...entries[idx],
      ...entry,
      bestStreak: Math.max(entries[idx].bestStreak, entry.bestStreak),
      bestSessionPct: Math.max(entries[idx].bestSessionPct, entry.bestSessionPct),
    };
    entries[idx].compositeScore = computeCompositeScore(entries[idx]);
  } else {
    entries.push(entry);
  }

  saveLeaderboard(entries);
  return entries;
}

// ── Composite score: weighted combo ──
// XP is the primary driver (grind), streak shows clutch, session % shows consistency

function computeCompositeScore(entry) {
  const xpScore = entry.totalXp;                          // raw XP
  const streakBonus = entry.bestStreak * 20;               // 20 pts per streak
  const accuracyBonus = entry.bestSessionPct * 5;          // up to 500 for 100%
  return Math.round(xpScore + streakBonus + accuracyBonus);
}

// ── Get ranked top N ──

export function getTopN(n = 10) {
  const entries = loadLeaderboard();
  return entries
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, n)
    .map((entry, i) => ({
      ...entry,
      rank: i + 1,
      level: getLevel(entry.totalXp),
    }));
}

// ── Get a specific user's rank ──

export function getUserRank(userId) {
  const entries = loadLeaderboard()
    .sort((a, b) => b.compositeScore - a.compositeScore);
  const idx = entries.findIndex(e => e.userId === userId);
  if (idx < 0) return null;
  return {
    ...entries[idx],
    rank: idx + 1,
    level: getLevel(entries[idx].totalXp),
    totalEntries: entries.length,
  };
}
