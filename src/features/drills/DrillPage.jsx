import { useState, useCallback, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import ActionButtons from '../../components/ActionButtons.jsx';
import HandRangeGrid from '../../components/HandRangeGrid.jsx';
import PokerTable from '../../components/PokerTable.jsx';
import XpBar from '../../components/XpBar.jsx';
import StreakDisplay from '../../components/StreakDisplay.jsx';
import StreakCelebration from '../../components/StreakCelebration.jsx';
import SessionSummary from '../../components/SessionSummary.jsx';
import useGameState from '../../hooks/useGameState.js';
import { updateLeaderboardEntry } from '../../data/leaderboard.js';
import { SCENARIOS, getRandomScenario } from '../../data/scenarios.js';
import { CHART_LOOSE, CHART_TIGHT, CHART_FACING_RAISE, getHandKey } from '../../data/handCharts.js';

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

function DrillPage({ user }) {
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
    recordAnswer, endSession, resetSession,
  } = useGameState();

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
      isCorrect, betTypeCorrect
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

  const disabledActions = [];
  if (scenario.toCall > 0) {
    disabledActions.push('check');
  } else {
    disabledActions.push('call');
  }

  const difficultyColors = {
    beginner: '#27ae60',
    intermediate: '#f39c12',
    advanced: '#e74c3c',
  };

  const handleEndSession = () => {
    endSession();
    // Sync to leaderboard with best session accuracy
    if (user) {
      const sessionPct = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
      updateLeaderboardEntry(user.id, user.displayName, {
        ...persistent,
        bestSessionPct: sessionPct,
      });
    }
    setShowSessionSummary(true);
  };

  const handleNewSession = () => {
    resetSession();
    setShowSessionSummary(false);
    loadNext();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
                padding: isMobile ? '4px 10px' : '5px 14px', borderRadius: 16, border: 'none',
                background: difficulty === d ? '#2980b9' : 'rgba(255,255,255,0.08)',
                color: difficulty === d ? '#fff' : '#8899aa',
                cursor: 'pointer', fontSize: isMobile ? 11 : 12, fontWeight: 600,
                textTransform: 'capitalize',
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
            <span style={{ color: '#27ae60', fontWeight: 700 }}>{session.correct}</span>
            <span style={{ color: '#556' }}>/</span>
            <span style={{ color: '#aab' }}>{session.total}</span>
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
                background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                color: '#667', fontSize: 11, padding: '3px 8px', borderRadius: 6,
                cursor: 'pointer', fontWeight: 600,
              }}
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
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: isMobile ? 15 : 18, flex: 1 }}>{scenario.title}</h3>
        <span style={{
          background: difficultyColors[scenario.difficulty], color: '#fff',
          padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {scenario.difficulty}
        </span>
        <span style={{
          background: 'rgba(255,255,255,0.12)', color: '#ccc',
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
      />

      {/* Context description below table */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        margin: isMobile ? '12px 0 10px' : '20px 0 6px',
        padding: isMobile ? '10px 14px' : '12px 20px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#fff', margin: 0, fontSize: isMobile ? 15 : 17, lineHeight: 1.4,
          fontWeight: 700,
        }}>
          {scenario.description}
        </p>
        {scenario.toCall > 0 && (
          <span style={{
            background: 'rgba(243,156,18,0.2)', color: '#f39c12',
            padding: '2px 10px', borderRadius: 10, fontSize: isMobile ? 12 : 13, fontWeight: 700,
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
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: isCorrect ? 'linear-gradient(135deg, #0d2818 0%, #112e1e 100%)' : 'linear-gradient(135deg, #2a0f0f 0%, #1e1010 100%)',
            border: `2px solid ${isCorrect ? '#27ae60' : '#e74c3c'}`,
            borderRadius: 16, padding: isMobile ? 18 : 24, maxWidth: 480, width: '100%',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${isCorrect ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)'}`,
          }}>
            {/* Header: icon + result + XP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isCorrect ? '#27ae60' : '#e74c3c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#fff', fontWeight: 700, flexShrink: 0,
              }}>
                {isCorrect ? '\u2713' : '\u2717'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isCorrect ? '#27ae60' : '#e74c3c',
                  fontSize: isMobile ? 20 : 22, fontWeight: 800, letterSpacing: 0.3,
                }}>
                  {isCorrect ? 'Correct!' : 'Not Optimal'}
                </div>
                {levelUpName && (
                  <div style={{
                    color: '#ffd700', fontSize: 12, fontWeight: 700, marginTop: 2,
                  }}>
                    Level Up! You are now a {levelUpName}
                  </div>
                )}
              </div>
              {lastXpEarned > 0 && (
                <div style={{
                  background: 'rgba(255,215,0,0.15)', color: '#ffd700',
                  padding: '4px 10px', borderRadius: 8, fontSize: 14, fontWeight: 800,
                  border: '1px solid rgba(255,215,0,0.3)',
                }}>
                  +{lastXpEarned} XP
                </div>
              )}
            </div>

            {/* Streak indicator */}
            {isCorrect && session.streak >= 3 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 12, padding: '6px 0',
                background: 'rgba(255,140,0,0.08)', borderRadius: 8,
              }}>
                <span>{'\u2728'}</span>
                <span style={{ color: '#ff9800', fontSize: 13, fontWeight: 700 }}>
                  {session.streak} Streak
                </span>
                {session.streak > 5 && (
                  <span style={{ color: '#ff6d00', fontSize: 11 }}>
                    ({session.streak >= 20 ? '3x' : session.streak >= 10 ? '2x' : session.streak >= 5 ? '1.5x' : '1.2x'} XP)
                  </span>
                )}
              </div>
            )}

            {/* Action comparison strip */}
            {!isCorrect && (
              <div style={{
                display: 'flex', gap: 8, marginBottom: 16,
                background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#889', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Your choice</div>
                  <div style={{ color: '#e74c3c', fontSize: isMobile ? 14 : 15, fontWeight: 700 }}>{yourLabel}</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#889', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Recommended</div>
                  <div style={{ color: '#27ae60', fontSize: isMobile ? 14 : 15, fontWeight: 700 }}>{correctLabel}</div>
                </div>
              </div>
            )}

            {/* Key takeaway */}
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px',
              borderLeft: `3px solid ${isCorrect ? '#27ae60' : '#f39c12'}`,
              marginBottom: 12,
            }}>
              <div style={{ color: '#f39c12', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Key Takeaway</div>
              <div style={{ color: '#eee', fontSize: isMobile ? 14 : 15, fontWeight: 600, lineHeight: 1.5 }}>
                {keySentence}
              </div>
            </div>

            {/* Detailed explanation */}
            {restSentences && (
              <div style={{
                color: '#bbc5cf', fontSize: isMobile ? 13 : 14, lineHeight: 1.65,
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
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#aab', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13,
                  }}
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
                borderRadius: 12, border: 'none', background: '#2980b9', color: '#fff',
                cursor: 'pointer', width: '100%',
              }}
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
