import { useState, useCallback, useRef } from 'react';
import { calculateXp, getLevel, getSessionGrade, STREAK_MILESTONES } from '../data/gamification.js';

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

export default function useGameState(initialPersistent) {
  const [persistent, setPersistent] = useState(() => ({
    totalXp: 0, bestStreakAllTime: 0, totalSessions: 0,
    totalCorrect: 0, totalAnswered: 0, bestSessionPct: 0,
    ...initialPersistent,
  }));
  const [session, setSession] = useState(createSession);

  // Use refs to track current values synchronously for XP calculation
  const streakRef = useRef(0);
  const xpRef = useRef(persistent.totalXp);

  // Sync persistent from parent when it changes (e.g. after Supabase fetch)
  const syncPersistent = useCallback((newPersistent) => {
    setPersistent(newPersistent);
    xpRef.current = newPersistent.totalXp;
  }, []);

  const recordAnswer = useCallback((scenarioId, street, difficulty, isCorrect, betTypeCorrect, extra = {}) => {
    // Compute new streak synchronously from ref
    const newStreak = isCorrect ? streakRef.current + 1 : 0;
    streakRef.current = newStreak;

    // Compute XP synchronously (floor at 0 — XP can't go negative)
    const xpEarned = calculateXp(difficulty, isCorrect, betTypeCorrect, newStreak);
    const prevXp = xpRef.current;
    const newXp = Math.max(0, prevXp + xpEarned);
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
        history: [...prev.history, {
          scenarioId, street, difficulty, correct: isCorrect, xpEarned,
          actionChosen: extra.actionChosen,
          betTypeChosen: extra.betTypeChosen,
          opponentType: extra.opponentType,
        }],
      };
    });

    setPersistent(prev => ({
      ...prev,
      totalXp: newXp,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      totalAnswered: prev.totalAnswered + 1,
      bestStreakAllTime: Math.max(prev.bestStreakAllTime, newStreak),
    }));

    return { xpEarned, isStreakMilestone, milestoneReached, leveledUp, newLevelName };
  }, []);

  const endSession = useCallback(() => {
    setPersistent(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
    }));
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
    syncPersistent,
  };
}
