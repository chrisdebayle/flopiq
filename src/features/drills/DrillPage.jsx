import { useState, useCallback, useEffect, useMemo } from 'react';
import Card from '../../components/Card.jsx';
import ActionButtons from '../../components/ActionButtons.jsx';
import HandRangeGrid from '../../components/HandRangeGrid.jsx';
import PokerTable from '../../components/PokerTable.jsx';
import XpBar from '../../components/XpBar.jsx';
import StreakDisplay from '../../components/StreakDisplay.jsx';
import StreakCelebration from '../../components/StreakCelebration.jsx';
import SessionSummary from '../../components/SessionSummary.jsx';
import useGameState from '../../hooks/useGameState.js';
import { saveSession, saveScenarioResults, upsertProfile, trackEvent } from '../../lib/supabase.js';
import { SCENARIOS, getRandomScenario } from '../../data/scenarios.js';
import { OPPONENT_ARCHETYPES } from '../../data/gamification.js';
import { getSessionGrade } from '../../data/gamification.js';
import { CHART_LOOSE, CHART_TIGHT, CHART_FACING_RAISE, getHandKey } from '../../data/handCharts.js';
import { colors, glows, gradients, fonts } from '../../theme.js';

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function DrillPage({ user, persistent: parentPersistent, onDashboard }) {
  const [difficulty, setDifficulty] = useState('all');
  const [scenario, setScenario] = useState(() => getRandomScenario());
  const [selectedAction, setSelectedAction] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState(null);
  const [lastXpEarned, setLastXpEarned] = useState(0);
  const [celebrationMilestone, setCelebrationMilestone] = useState(null);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [levelUpName, setLevelUpName] = useState(null);

  const {
    session, persistent, currentLevel, sessionGrade,
    recordAnswer, endSession, resetSession, syncPersistent,
  } = useGameState(parentPersistent);

  // Sync when parent persistent changes (e.g. after Supabase fetch)
  useEffect(() => {
    if (parentPersistent) syncPersistent(parentPersistent);
  }, [parentPersistent, syncPersistent]);

  // Auto-save profile every 5 answers to prevent data loss on browser close
  useEffect(() => {
    if (session.total > 0 && session.total % 5 === 0 && user) {
      upsertProfile(user.id, {
        total_xp: persistent.totalXp,
        best_streak: persistent.bestStreakAllTime,
        total_correct: persistent.totalCorrect,
        total_answered: persistent.totalAnswered,
      }).catch(err => console.warn('Auto-save error:', err.message));
    }
  }, [session.total, user, persistent]);

  const isMobile = useIsMobile();

  const loadNext = useCallback(() => {
    setScenario(getRandomScenario(difficulty === 'all' ? null : difficulty));
    setSelectedAction(null);
    setSelectedBetType(null);
    setShowResult(false);
    setShowChart(false);
    setLastXpEarned(0);
    setLevelUpName(null);
  }, [difficulty]);

  const handleAction = useCallback((action, betType) => {
    if (showResult) return;
    setSelectedAction(action);
    if (betType) setSelectedBetType(betType);
    setShowResult(true);

    let isCorrect = action === scenario.correctAction;
    let betTypeCorrect = false;
    if (isCorrect && scenario.correctBetType) {
      betTypeCorrect = betType === scenario.correctBetType;
      if (!betTypeCorrect) isCorrect = false;
    } else if (isCorrect && action === 'raise' && !scenario.correctBetType) {
      betTypeCorrect = true; // no specific bet type required
    }

    const result = recordAnswer(
      scenario.id, scenario.street, scenario.difficulty,
      isCorrect, betTypeCorrect,
      {
        actionChosen: action,
        betTypeChosen: betType || null,
        opponentType: scenario.opponentType || null,
      }
    );

    setLastXpEarned(result.xpEarned);

    if (result.isStreakMilestone) {
      setCelebrationMilestone(result.milestoneReached);
    }

    if (result.leveledUp) {
      setLevelUpName(result.newLevelName);
    }
  }, [showResult, scenario, recordAnswer]);

  const isCorrect = selectedAction === scenario.correctAction
    && (!scenario.correctBetType || selectedBetType === scenario.correctBetType);
  const chart = scenario.gameType === 'loose' ? CHART_LOOSE :
                scenario.gameType === 'tight' ? CHART_TIGHT : CHART_FACING_RAISE;
  const chartName = scenario.gameType === 'loose' ? 'Chart 1 (Loose)' :
                    scenario.gameType === 'tight' ? 'Chart 2 (Tight)' : 'Chart 3 (Facing Raise)';

  const suited = scenario.holeCards[0].suit === scenario.holeCards[1].suit;
  const highlightCell = getHandKey(scenario.holeCards[0].rank, scenario.holeCards[1].rank, suited);

  const BET_TYPE_LABELS = {
    blocker: 'Blocker Bet', cbet: 'C-Bet', value: 'Value Bet',
    semibluff: 'Semi-Bluff', bluff: 'Bluff', overbet: 'Overbet',
    open: 'Open Raise', '3bet': '3-Bet', allin: 'All-In',
  };

  // Determine which seat index the villain sits at
  const villainSeatIdx = useMemo(() => {
    const heroIdx = ['BTN', 'SB', 'BB', 'UTG', 'UTG1', 'MP', 'CO'].indexOf(scenario.position);
    const idx = heroIdx >= 0 ? heroIdx : 0;
    const rotated = [];
    for (let i = 0; i < 7; i++) {
      rotated.push(['BTN', 'SB', 'BB', 'UTG', 'UTG1', 'MP', 'CO'][(idx + i) % 7]);
    }
    // If actions exist, pick the last non-fold, non-hero position
    if (scenario.actions && Object.keys(scenario.actions).length > 0) {
      const actionPositions = Object.entries(scenario.actions)
        .filter(([, a]) => a.type !== 'fold')
        .map(([pos]) => pos);
      if (actionPositions.length > 0) {
        const villainPos = actionPositions[actionPositions.length - 1];
        const si = rotated.indexOf(villainPos);
        if (si > 0) return si;
      }
    }
    // Default: pick seat across the table (index 3 or 4)
    return 3;
  }, [scenario.position, scenario.actions]);

  const opponentArch = scenario.opponentType ? OPPONENT_ARCHETYPES[scenario.opponentType] : null;

  const disabledActions = [];
  if (scenario.toCall > 0) {
    disabledActions.push('check');
  } else {
    disabledActions.push('call');
  }

  const difficultyColors = {
    beginner: colors.green,
    intermediate: colors.orange,
    advanced: colors.red,
  };

  const handleEndSession = async () => {
    endSession();

    const sessionPct = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
    const grade = getSessionGrade(session.correct, session.total);
    const durationMs = Date.now() - session.startTime;

    // Build category breakdown from history
    const categoryBreakdown = {};
    session.history.forEach(h => {
      const key = h.street || 'unknown';
      if (!categoryBreakdown[key]) categoryBreakdown[key] = { correct: 0, total: 0 };
      categoryBreakdown[key].total++;
      if (h.correct) categoryBreakdown[key].correct++;
    });

    // Save to Supabase
    if (user) {
      try {
        // 1. Save session
        const savedSession = await saveSession(user.id, {
          correct: session.correct,
          total: session.total,
          grade: grade.letter,
          xpEarned: session.xpEarnedThisSession,
          bestStreak: session.bestStreakThisSession,
          durationMs,
          categoryBreakdown,
        });

        // 2. Save individual scenario results
        if (savedSession && session.history.length > 0) {
          await saveScenarioResults(user.id, savedSession.id, session.history);
        }

        // 3. Update profile stats
        await upsertProfile(user.id, {
          total_xp: persistent.totalXp,
          best_streak: Math.max(persistent.bestStreakAllTime, session.bestStreakThisSession),
          best_session_pct: Math.max(persistent.bestSessionPct || 0, sessionPct),
          total_correct: persistent.totalCorrect,
          total_answered: persistent.totalAnswered,
          sessions_played: persistent.totalSessions,
        });

        trackEvent(user.id, 'session_complete', {
          correct: session.correct,
          total: session.total,
          grade: grade.letter,
          xpEarned: session.xpEarnedThisSession,
          bestStreak: session.bestStreakThisSession,
          durationMs,
        });
      } catch (err) {
        console.warn('Session save error:', err.message);
      }
    }

    setShowSessionSummary(true);
  };

  const handleNewSession = () => {
    resetSession();
    setShowSessionSummary(false);
    loadNext();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: fonts.body }}>
      {/* Dashboard button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 6 : 8 }}>
        <button
          onClick={onDashboard}
          style={{
            background: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: isMobile ? 11 : 12,
            fontWeight: 700,
            fontFamily: fonts.heading,
            padding: isMobile ? '4px 14px' : '5px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            letterSpacing: 0.3,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = colors.cyan; e.currentTarget.style.borderColor = colors.cyanBorder; }}
          onMouseLeave={e => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.border; }}
        >
          Dashboard
        </button>
      </div>

      {/* XP Bar */}
      <XpBar currentLevel={currentLevel} totalXp={persistent.totalXp} isMobile={isMobile} />

      {/* Top bar: difficulty + stats + streak + end session */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: isMobile ? 8 : 16, flexWrap: 'wrap', gap: isMobile ? 4 : 10,
      }}>
        <div style={{ display: 'flex', gap: isMobile ? 4 : 6 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                padding: isMobile ? '4px 10px' : '5px 14px', borderRadius: 16,
                border: difficulty === d ? `1px solid ${colors.cyanBorder}` : '1px solid transparent',
                background: difficulty === d ? colors.cyanDim : colors.bgElevated,
                color: difficulty === d ? colors.cyan : colors.textSecondary,
                cursor: 'pointer', fontSize: isMobile ? 11 : 12, fontWeight: 600,
                textTransform: 'capitalize', fontFamily: fonts.body,
                transition: 'all 0.15s ease',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StreakDisplay
            streak={session.streak}
            bestStreak={session.bestStreakThisSession}
            isMobile={isMobile}
          />
          <div style={{
            display: 'flex', gap: 6, alignItems: 'center', fontSize: 13,
          }}>
            <span style={{ color: colors.green, fontWeight: 700 }}>{session.correct}</span>
            <span style={{ color: colors.textMuted }}>/</span>
            <span style={{ color: colors.textSecondary }}>{session.total}</span>
            {session.total > 0 && (
              <span style={{
                color: sessionGrade.color,
                fontWeight: 700, fontSize: 13,
                padding: '1px 6px', borderRadius: 6,
                background: `${sessionGrade.color}18`,
              }}>
                {sessionGrade.letter}
              </span>
            )}
          </div>
          {session.total >= 5 && (
            <button
              onClick={handleEndSession}
              style={{
                background: 'none', border: `1px solid ${colors.border}`,
                color: colors.textMuted, fontSize: 11, padding: '3px 8px', borderRadius: 6,
                cursor: 'pointer', fontWeight: 600, fontFamily: fonts.body,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.red; e.currentTarget.style.color = colors.red; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textMuted; }}
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Scenario title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, marginBottom: isMobile ? 12 : 24,
        padding: isMobile ? '7px 12px' : '10px 16px',
        background: colors.bgCard,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: isMobile ? 15 : 18, flex: 1, fontFamily: fonts.heading }}>{scenario.title}</h3>
        <span style={{
          background: difficultyColors[scenario.difficulty], color: '#fff',
          padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {scenario.difficulty}
        </span>
        <span style={{
          background: colors.cyanDim, color: colors.cyan,
          padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {scenario.street}
        </span>
      </div>

      {/* === THE POKER TABLE === */}
      <PokerTable
        heroPosition={scenario.position}
        holeCards={scenario.holeCards}
        communityCards={scenario.communityCards}
        potSize={scenario.potSize}
        stackSize={scenario.stackSize}
        toCall={scenario.toCall}
        street={scenario.street}
        actions={scenario.actions}
        opponentArchetype={opponentArch}
        villainSeatIdx={villainSeatIdx}
      />

      {/* Context description below table */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        margin: isMobile ? '12px 0 10px' : '20px 0 6px',
        padding: isMobile ? '10px 14px' : '12px 20px',
        background: colors.bgCard,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        textAlign: 'center',
      }}>
        <p style={{
          color: colors.textPrimary, margin: 0, fontSize: isMobile ? 15 : 17, lineHeight: 1.4,
          fontWeight: 700, fontFamily: fonts.heading,
        }}>
          {scenario.description}
        </p>
        {scenario.toCall > 0 && (
          <span style={{
            background: colors.orangeDim, color: colors.orange,
            padding: '3px 12px', borderRadius: 10, fontSize: isMobile ? 12 : 13, fontWeight: 700,
          }}>
            {scenario.toCall} BB to call
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: isMobile ? 8 : 10, marginBottom: isMobile ? 0 : 16 }}>
        <ActionButtons
          disabledActions={disabledActions}
          onAction={handleAction}
          disabled={showResult}
          selectedAction={selectedAction}
          street={scenario.street}
          toCall={scenario.toCall}
        />
      </div>

      {/* Result feedback overlay */}
      {showResult && (() => {
        const correctLabel = scenario.correctAction === 'raise'
          ? `${scenario.toCall === 0 ? 'BET' : 'RAISE'}${scenario.correctBetType ? ` \u2192 ${BET_TYPE_LABELS[scenario.correctBetType] || scenario.correctBetType.toUpperCase()}` : ''}`
          : scenario.correctAction.toUpperCase();
        const yourLabel = selectedAction === 'raise'
          ? `${scenario.toCall === 0 ? 'BET' : 'RAISE'}${selectedBetType ? ` \u2192 ${BET_TYPE_LABELS[selectedBetType] || selectedBetType.toUpperCase()}` : ''}`
          : (selectedAction || '').toUpperCase();
        const sentences = scenario.explanation.split(/(?<=\.)\s+/);
        const keySentence = sentences[0] || '';
        const restSentences = sentences.slice(1).join(' ');

        return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: isCorrect
              ? `linear-gradient(135deg, ${colors.bgDeep} 0%, rgba(0, 50, 30, 0.9) 100%)`
              : `linear-gradient(135deg, ${colors.bgDeep} 0%, rgba(50, 10, 10, 0.9) 100%)`,
            border: `2px solid ${isCorrect ? colors.green : colors.red}`,
            borderRadius: 16, padding: isMobile ? 18 : 24, maxWidth: 480, width: '100%',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${isCorrect ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.15)'}`,
            fontFamily: fonts.body,
          }}>
            {/* Header: icon + result + XP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isCorrect ? colors.green : colors.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#fff', fontWeight: 700, flexShrink: 0,
              }}>
                {isCorrect ? '\u2713' : '\u2717'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isCorrect ? colors.green : colors.red,
                  fontSize: isMobile ? 20 : 22, fontWeight: 800, letterSpacing: 0.3,
                  fontFamily: fonts.heading,
                }}>
                  {isCorrect ? 'Correct!' : 'Not Optimal'}
                </div>
                {levelUpName && (
                  <div style={{
                    color: colors.gold, fontSize: 12, fontWeight: 700, marginTop: 2,
                    fontFamily: fonts.heading,
                  }}>
                    Level Up! You are now a {levelUpName}
                  </div>
                )}
              </div>
              {lastXpEarned !== 0 && (
                <div style={{
                  background: lastXpEarned > 0 ? 'rgba(255,215,0,0.15)' : colors.redDim,
                  color: lastXpEarned > 0 ? colors.gold : colors.red,
                  padding: '4px 10px', borderRadius: 8, fontSize: 14, fontWeight: 800,
                  border: `1px solid ${lastXpEarned > 0 ? 'rgba(255,215,0,0.3)' : 'rgba(255,23,68,0.3)'}`,
                }}>
                  {lastXpEarned > 0 ? '+' : ''}{lastXpEarned} XP
                </div>
              )}
            </div>

            {/* Streak indicator */}
            {isCorrect && session.streak >= 3 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 12, padding: '6px 0',
                background: colors.orangeDim, borderRadius: 8,
              }}>
                <span>{'\u2728'}</span>
                <span style={{ color: colors.orange, fontSize: 13, fontWeight: 700 }}>
                  {session.streak} Streak
                </span>
                {session.streak > 5 && (
                  <span style={{ color: colors.orangeLight, fontSize: 11 }}>
                    ({session.streak >= 20 ? '3x' : session.streak >= 10 ? '2x' : session.streak >= 5 ? '1.5x' : '1.2x'} XP)
                  </span>
                )}
              </div>
            )}

            {/* Action comparison strip */}
            {!isCorrect && (
              <div style={{
                display: 'flex', gap: 8, marginBottom: 16,
                background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 14px',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Your choice</div>
                  <div style={{ color: colors.red, fontSize: isMobile ? 14 : 15, fontWeight: 700 }}>{yourLabel}</div>
                </div>
                <div style={{ width: 1, background: colors.border }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Recommended</div>
                  <div style={{ color: colors.green, fontSize: isMobile ? 14 : 15, fontWeight: 700 }}>{correctLabel}</div>
                </div>
              </div>
            )}

            {/* Key takeaway */}
            <div style={{
              background: colors.bgElevated, borderRadius: 10, padding: '10px 14px',
              borderLeft: `3px solid ${isCorrect ? colors.green : colors.orange}`,
              marginBottom: 12,
            }}>
              <div style={{ color: colors.orange, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Key Takeaway</div>
              <div style={{ color: colors.textPrimary, fontSize: isMobile ? 14 : 15, fontWeight: 600, lineHeight: 1.5 }}>
                {keySentence}
              </div>
            </div>

            {/* Detailed explanation */}
            {restSentences && (
              <div style={{
                color: colors.textSecondary, fontSize: isMobile ? 13 : 14, lineHeight: 1.65,
                padding: '0 2px',
              }}>
                {restSentences}
              </div>
            )}

            {scenario.street === 'preflop' && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowChart(!showChart)}
                  style={{
                    background: colors.bgElevated, border: `1px solid ${colors.borderLight}`,
                    color: colors.textSecondary, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontFamily: fonts.body,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = colors.cyan; e.currentTarget.style.borderColor = colors.cyanBorder; }}
                  onMouseLeave={e => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.borderLight; }}
                >
                  {showChart ? 'Hide' : 'Show'} {chartName}
                </button>
                {showChart && (
                  <div style={{ marginTop: 12 }}>
                    <HandRangeGrid chart={chart} highlightCell={highlightCell} />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={loadNext}
              style={{
                marginTop: 16, padding: '12px 32px', fontSize: 16, fontWeight: 700,
                borderRadius: 12, border: 'none',
                background: gradients.primaryButton, color: '#fff',
                cursor: 'pointer', width: '100%',
                boxShadow: glows.button,
                fontFamily: fonts.heading,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = glows.cyanStrong; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = glows.button; }}
            >
              Next Scenario
            </button>
          </div>
        </div>
        );
      })()}

      {/* Streak Celebration */}
      {celebrationMilestone && (
        <StreakCelebration
          milestone={celebrationMilestone}
          onComplete={() => setCelebrationMilestone(null)}
        />
      )}

      {/* Session Summary */}
      {showSessionSummary && (
        <SessionSummary
          session={session}
          persistent={persistent}
          onNewSession={handleNewSession}
          onKeepGoing={() => setShowSessionSummary(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

export default DrillPage;
