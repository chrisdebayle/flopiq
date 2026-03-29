import { getSessionGrade } from '../data/gamification.js';
import { colors, glows, gradients, fonts } from '../theme.js';

export default function SessionSummary({ session, persistent, onNewSession, onKeepGoing, isMobile }) {
  const grade = getSessionGrade(session.correct, session.total);
  const pct = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
  const duration = Math.round((Date.now() - session.startTime) / 60000);

  // Category breakdown
  const categories = {};
  for (const h of session.history) {
    if (!categories[h.street]) categories[h.street] = { correct: 0, total: 0, xp: 0 };
    categories[h.street].total++;
    if (h.correct) categories[h.street].correct++;
    categories[h.street].xp += h.xpEarned;
  }

  // Difficulty breakdown
  const diffBreakdown = {};
  for (const h of session.history) {
    if (!diffBreakdown[h.difficulty]) diffBreakdown[h.difficulty] = { correct: 0, total: 0 };
    diffBreakdown[h.difficulty].total++;
    if (h.correct) diffBreakdown[h.difficulty].correct++;
  }

  // What to work on
  const weakStreets = Object.entries(categories)
    .filter(([, v]) => v.total >= 2 && (v.correct / v.total) < 0.6)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .map(([k]) => k);

  const weakDiffs = Object.entries(diffBreakdown)
    .filter(([, v]) => v.total >= 2 && (v.correct / v.total) < 0.6)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .map(([k]) => k);

  let advice = '';
  if (weakStreets.length > 0) {
    advice = `Focus on ${weakStreets.join(' and ')} decisions — your accuracy drops there.`;
    if (weakDiffs.length > 0) {
      advice += ` Try ${weakDiffs[0]} difficulty to build consistency.`;
    }
  } else if (pct >= 80) {
    advice = 'Strong across the board. Push into advanced scenarios to keep growing.';
  } else if (pct >= 60) {
    advice = 'Solid session. Keep grinding to lock in those patterns.';
  } else {
    advice = 'Every rep builds your instinct. Focus on one street at a time.';
  }

  const isNewBest = session.bestStreakThisSession > 0 &&
    session.bestStreakThisSession >= persistent.bestStreakAllTime;

  const streetOrder = ['preflop', 'flop', 'turn', 'river'];
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => streetOrder.indexOf(a[0]) - streetOrder.indexOf(b[0]));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${colors.bgDeep} 0%, ${colors.bgSurface} 100%)`,
        border: `2px solid ${grade.color}`,
        borderRadius: 16, padding: isMobile ? 18 : 28, maxWidth: 480, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 30px ${grade.color}33`,
        fontFamily: fonts.body,
      }}>
        {/* Grade */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            fontSize: isMobile ? 48 : 60, fontWeight: 900, color: grade.color,
            textShadow: `0 0 40px ${grade.color}66`,
            lineHeight: 1, fontFamily: fonts.heading,
          }}>
            {grade.letter}
          </div>
          <div style={{
            fontSize: isMobile ? 14 : 16, fontWeight: 700, color: grade.color,
            textTransform: 'uppercase', letterSpacing: 2, marginTop: 4,
            fontFamily: fonts.heading,
          }}>
            {grade.label}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'space-around', marginBottom: 16,
          background: colors.bgCard, borderRadius: 10, padding: '10px 0',
          border: `1px solid ${colors.border}`,
        }}>
          {[
            { label: 'Accuracy', value: `${pct}%`, color: pct >= 70 ? colors.green : colors.red },
            { label: 'Correct', value: `${session.correct}/${session.total}`, color: colors.textPrimary },
            { label: 'XP Earned', value: `+${session.xpEarnedThisSession}`, color: colors.gold },
            { label: 'Time', value: `${duration}m`, color: colors.textSecondary },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.label}
              </div>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: s.color, marginTop: 2 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Streak */}
        {session.bestStreakThisSession > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 16, padding: '8px 0',
          }}>
            <span style={{ fontSize: 18 }}>{'\u2728'}</span>
            <span style={{ color: colors.orange, fontSize: 15, fontWeight: 700, fontFamily: fonts.heading }}>
              Best Streak: {session.bestStreakThisSession}
            </span>
            {isNewBest && (
              <span style={{
                background: colors.gold, color: '#000', fontSize: 9, fontWeight: 800,
                padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase',
              }}>
                New Best
              </span>
            )}
          </div>
        )}

        {/* Category breakdown */}
        {sortedCategories.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 0.5, marginBottom: 8,
            }}>
              Breakdown
            </div>
            {sortedCategories.map(([street, data]) => {
              const catPct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={street} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                }}>
                  <span style={{
                    width: 60, fontSize: 12, color: colors.textSecondary, fontWeight: 600,
                    textTransform: 'capitalize', fontFamily: fonts.heading,
                  }}>
                    {street}
                  </span>
                  <div style={{
                    flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 4, width: `${catPct}%`,
                      background: catPct >= 70 ? colors.green : catPct >= 50 ? colors.orange : colors.red,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{
                    width: 36, fontSize: 12, color: colors.textSecondary, fontWeight: 700, textAlign: 'right',
                  }}>
                    {catPct}%
                  </span>
                  <span style={{ width: 30, fontSize: 11, color: colors.textMuted, textAlign: 'right' }}>
                    {data.correct}/{data.total}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Advice */}
        <div style={{
          background: colors.bgElevated, borderRadius: 10, padding: '10px 14px',
          borderLeft: `3px solid ${colors.orange}`, marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, color: colors.orange, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            What to Work On
          </div>
          <div style={{ color: colors.textSecondary, fontSize: isMobile ? 13 : 14, lineHeight: 1.5 }}>
            {advice}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onKeepGoing} style={{
            flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700,
            borderRadius: 10, border: `1px solid ${colors.borderLight}`,
            background: colors.bgElevated, color: colors.textSecondary, cursor: 'pointer',
            fontFamily: fonts.heading, transition: 'all 0.15s ease',
          }}>
            Keep Going
          </button>
          <button onClick={onNewSession} style={{
            flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700,
            borderRadius: 10, border: 'none',
            background: gradients.primaryButton, color: '#fff', cursor: 'pointer',
            boxShadow: glows.button, fontFamily: fonts.heading,
            transition: 'all 0.15s ease',
          }}>
            New Session
          </button>
        </div>
      </div>
    </div>
  );
}
