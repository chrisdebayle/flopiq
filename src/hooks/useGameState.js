import { useState, useCallback, useRef } from 'react';
import { calculateXp, getLevel, getSessionGrade, STREAK_MILESTONES } from '../data/gamification.js';

const LS_KEY_XP = 'flopiq_xp';
const LS_KEY_STREAK = 'flopiq_best_streak';
const LS_KEY_LIFETIME = 'flopiq_lifetime';

function loadPersistent() {
  try {
    return {
      totalXp: parseInt(localStorage.getItem(LS_KEY_XP) || '0', 10),
      bestStreakAllTime: parseInt(localStorage.getItem(LS_KEY_STREAK) || '0', 10),
      ...(JSON.parse(localStorage.getItem(LS_KEY_LIFETIME) || '{"totalSessions":0,"totalCorrect":0,"totalAnswered":0}')),
    };
  } catch {
    return { totalXp: 0, bestStreakAllTime: 0, totalSessions: 0, totalCorrect: 0, totalAnswered: 0 };
  }
}

function savePersistent(p) {
  localStorage.setItem(LS_KEY_XP, String(p.totalXp));
  localStorage.setItem(LS_KEY_STREAK, String(p.bestStreakAllTime));
  localStorage.setItem(LS_KEY_LIFETIME, JSON.stringify({
    totalSessions: p.totalSessions,
    totalCorrect: p.totalCorrect,
    totalAnswered: p.totalAnswered,
  }));
}

function createSession() {
  return {
    correct: 0,
    total: 0,
    streak: 0,
    bestStreakThisSession: 0,
    xpEarnedThisSession: 0,
    history: [],
    startTime: Date.now(),
  };
}

export default function useGameState() {
  const [persistent, setPersistent] = useState(loadPersistent);
  const [session, setSession] = useState(createSession);

  // Use refs to track current values synchronously for XP calculation
  const streakRef = useRef(0);
  const xpRef = useRef(persistent.totalXp);

  const recordAnswer = useCallback((scenarioId, street, difficulty, isCorrect, betTypeCorrect) => {
    // Compute new streak synchronously from ref
    const newStreak = isCorrect ? streakRef.current + 1 : 0;
    streakRef.current = newStreak;

    // Compute XP synchronously
    const xpEarned = calculateXp(difficulty, isCorrect, betTypeCorrect, newStreak);
    const prevXp = xpRef.current;
    const newXp = prevXp + xpEarned;
    xpRef.current = newXp;

    // Check streak milestone
    const isStreakMilestone = isCorrect && STREAK_MILESTONES.includes(newStreak);
    const milestoneReached = isStreakMilestone ? newStreak : 0;

    // Check level up
    const oldLevel = getLevel(prevXp);
    const newLevel = getLevel(newXp);
    const leveledUp = newLevel.idx > oldLevel.idx;
    const newLevelName = leveledUp ? newLevel.name : null;

    // Now update React state
    setSession(prev => {
      const bestStreak = Math.max(prev.bestStreakThisSession, newStreak);
      return {
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        bestStreakThisSession: bestStreak,
        xpEarnedThisSession: prev.xpEarnedThisSession + xpEarned,
        history: [...prev.history, { scenarioId, street, difficulty, correct: isCorrect, xpEarned }],
      };
    });

    setPersistent(prev => {
      const updated = {
        ...prev,
        totalXp: newXp,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalAnswered: prev.totalAnswered + 1,
        bestStreakAllTime: Math.max(prev.bestStreakAllTime, newStreak),
      };
      savePersistent(updated);
      return updated;
    });

    return { xpEarned, isStreakMilestone, milestoneReached, leveledUp, newLevelName };
  }, []);

  const endSession = useCallback(() => {
    setPersistent(prev => {
      const updated = { ...prev, totalSessions: prev.totalSessions + 1 };
      savePersistent(updated);
      return updated;
    });
  }, []);

  const resetSession = useCallback(() => {
    streakRef.current = 0;
    setSession(createSession());
  }, []);

  const currentLevel = getLevel(persistent.totalXp);
  const sessionGrade = getSessionGrade(session.correct, session.total);

  return {
    session,
    persistent,
    currentLevel,
    sessionGrade,
    recordAnswer,
    endSession,
    resetSession,
  };
}
