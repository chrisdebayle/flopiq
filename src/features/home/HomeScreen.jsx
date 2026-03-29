import { useState, useEffect } from 'react';
import { getLevel, OPPONENT_ARCHETYPES, getUnlockedAchievements, ACHIEVEMENTS } from '../../data/gamification.js';
import { SCENARIOS } from '../../data/scenarios.js';
import Leaderboard from '../../components/Leaderboard.jsx';
import { colors, glows, gradients, fonts } from '../../theme.js';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const STREET_ORDER = ['preflop', 'flop', 'turn', 'river'];
const STREET_LABELS = { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' };

const OPPONENT_ORDER = ['nit', 'fish', 'tag', 'lag', 'weakTight'];

export default function HomeScreen({ user, persistent, breakdown = {}, onStartDrills, onLogout }) {
  const isMobile = useIsMobile();
  const level = getLevel(persistent.totalXp);
  const accuracy = persistent.totalAnswered > 0
    ? Math.round((persistent.totalCorrect / persistent.totalAnswered) * 100)
    : 0;

  const [aboutOpen, setAboutOpen] = useState(() => {
    return !localStorage.getItem('flopiq_seen_about');
  });
  const [archetypesOpen, setArchetypesOpen] = useState(false);

  // Achievements
  const unlocked = getUnlockedAchievements(persistent, breakdown);
  const unlockedIds = new Set(unlocked.map(a => a.id));
  const totalAchievements = ACHIEVEMENTS.length;

  // Check if breakdowns have any data
  const hasStreetData = Object.keys(breakdown.byStreet || {}).length > 0;
  const hasOpponentData = Object.keys(breakdown.byOpponent || {}).length > 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: fonts.body }}>
      {/* Player card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20,
        padding: isMobile ? '16px 14px' : '20px 24px',
        background: colors.bgCard,
        borderRadius: 14, border: `1px solid ${colors.borderLight}`,
        marginBottom: isMobile ? 16 : 24,
        boxShadow: `inset 0 1px 0 ${colors.cyanDim}`,
      }}>
        {/* Level badge */}
        <div style={{
          width: isMobile ? 50 : 64, height: isMobile ? 50 : 64,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.cyanDim}, rgba(0,229,255,0.05))`,
          border: `2px solid ${colors.cyanBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? 24 : 32, flexShrink: 0,
          boxShadow: glows.cyan,
        }}>
          {level.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: isMobile ? 18 : 22, fontWeight: 800, color: colors.textPrimary,
            fontFamily: fonts.heading,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.displayName}
          </div>
          <div style={{
            fontSize: isMobile ? 12 : 13, color: colors.textSecondary, fontWeight: 600, marginTop: 2,
          }}>
            {level.name} &middot; {persistent.totalXp.toLocaleString()} XP
          </div>
        </div>

        <button onClick={onLogout} style={{
          background: 'none', border: `1px solid ${colors.border}`,
          color: colors.textMuted, fontSize: 11, fontWeight: 600, padding: '5px 10px',
          borderRadius: 6, cursor: 'pointer', flexShrink: 0,
          fontFamily: fonts.body,
          transition: 'all 0.15s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.cyanBorder; e.currentTarget.style.color = colors.cyan; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textMuted; }}
        >
          Sign Out
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? 16 : 24,
      }}>
        {[
          { label: 'Sessions', value: persistent.totalSessions, color: colors.cyan },
          { label: 'Accuracy', value: accuracy > 0 ? `${accuracy}%` : '-', color: accuracy >= 70 ? colors.green : colors.orange },
          { label: 'Best Streak', value: persistent.bestStreakAllTime, color: colors.orange },
          { label: 'Decisions', value: persistent.totalAnswered, color: colors.textSecondary },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: isMobile ? '12px 10px' : '16px',
            background: colors.bgCard,
            borderRadius: 12, border: `1px solid ${colors.border}`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: isMobile ? 22 : 28, fontWeight: 900, color: stat.color,
              fontFamily: fonts.heading,
              textShadow: `0 0 8px ${stat.color}44`,
            }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div style={{
              fontSize: 10, color: colors.textMuted, fontWeight: 700, marginTop: 4,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Start drills CTA */}
      <button onClick={onStartDrills} style={{
        width: '100%', padding: isMobile ? '16px 0' : '18px 0',
        fontSize: isMobile ? 16 : 18, fontWeight: 800,
        fontFamily: fonts.heading,
        borderRadius: 14, border: 'none',
        background: gradients.secondaryButton,
        color: '#fff', cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: 1,
        boxShadow: glows.orange,
        transition: 'all 0.2s ease',
        marginBottom: isMobile ? 20 : 28,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = glows.orangeStrong; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = glows.orange; }}
      >
        Start Drills
      </button>

      {/* === Per-Street Accuracy === */}
      {hasStreetData && (
        <div style={{
          background: colors.bgCard,
          borderRadius: 14, border: `1px solid ${colors.border}`,
          padding: isMobile ? '14px 14px' : '18px 20px',
          marginBottom: isMobile ? 12 : 16,
        }}>
          <div style={{
            fontSize: isMobile ? 13 : 14, fontWeight: 800, color: colors.textPrimary,
            fontFamily: fonts.heading, letterSpacing: 0.3, marginBottom: 12,
            textTransform: 'uppercase', fontSize: 11,
          }}>
            Accuracy by Street
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STREET_ORDER.map(street => {
              const data = (breakdown.byStreet || {})[street];
              if (!data || data.total === 0) return (
                <div key={street} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 60, fontSize: 12, color: colors.textMuted, fontWeight: 600, textTransform: 'capitalize', fontFamily: fonts.heading }}>{STREET_LABELS[street]}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)' }} />
                  <span style={{ width: 36, fontSize: 12, color: colors.textMuted, textAlign: 'right' }}>-</span>
                </div>
              );
              const pct = Math.round((data.correct / data.total) * 100);
              const barColor = pct >= 80 ? colors.green : pct >= 60 ? colors.orange : colors.red;
              return (
                <div key={street} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 60, fontSize: 12, color: colors.textSecondary, fontWeight: 600, textTransform: 'capitalize', fontFamily: fonts.heading }}>{STREET_LABELS[street]}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, width: `${pct}%`,
                      background: barColor,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ width: 36, fontSize: 12, color: colors.textSecondary, fontWeight: 700, textAlign: 'right' }}>{pct}%</span>
                  <span style={{ width: 34, fontSize: 11, color: colors.textMuted, textAlign: 'right' }}>{data.correct}/{data.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Per-Opponent Accuracy === */}
      {hasOpponentData && (
        <div style={{
          background: colors.bgCard,
          borderRadius: 14, border: `1px solid ${colors.border}`,
          padding: isMobile ? '14px 14px' : '18px 20px',
          marginBottom: isMobile ? 12 : 16,
        }}>
          <div style={{
            fontWeight: 800, color: colors.textPrimary,
            fontFamily: fonts.heading, letterSpacing: 0.3, marginBottom: 12,
            textTransform: 'uppercase', fontSize: 11,
          }}>
            Accuracy by Opponent
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPPONENT_ORDER.map(key => {
              const arch = OPPONENT_ARCHETYPES[key];
              const data = (breakdown.byOpponent || {})[key];
              if (!data || data.total === 0) return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, fontSize: 14, textAlign: 'center' }}>{arch.emoji}</span>
                  <span style={{ width: 42, fontSize: 11, color: colors.textMuted, fontWeight: 600, fontFamily: fonts.heading }}>{arch.shortLabel}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)' }} />
                  <span style={{ width: 36, fontSize: 12, color: colors.textMuted, textAlign: 'right' }}>-</span>
                </div>
              );
              const pct = Math.round((data.correct / data.total) * 100);
              const barColor = pct >= 80 ? colors.green : pct >= 60 ? colors.orange : colors.red;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, fontSize: 14, textAlign: 'center' }}>{arch.emoji}</span>
                  <span style={{ width: 42, fontSize: 11, color: arch.color, fontWeight: 600, fontFamily: fonts.heading }}>{arch.shortLabel}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, width: `${pct}%`,
                      background: barColor,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ width: 36, fontSize: 12, color: colors.textSecondary, fontWeight: 700, textAlign: 'right' }}>{pct}%</span>
                  <span style={{ width: 34, fontSize: 11, color: colors.textMuted, textAlign: 'right' }}>{data.correct}/{data.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Achievements === */}
      <div style={{
        background: colors.bgCard,
        borderRadius: 14, border: `1px solid ${colors.border}`,
        padding: isMobile ? '14px 14px' : '18px 20px',
        marginBottom: isMobile ? 12 : 16,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14,
        }}>
          <span style={{
            fontWeight: 800, color: colors.textPrimary,
            fontFamily: fonts.heading, letterSpacing: 0.3,
            textTransform: 'uppercase', fontSize: 11,
          }}>
            Achievements
          </span>
          <span style={{
            fontSize: 11, color: colors.textMuted, fontWeight: 600,
          }}>
            {unlocked.length} / {totalAchievements}
          </span>
        </div>

        {/* Unlocked badges */}
        {unlocked.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8,
            marginBottom: unlocked.length < totalAchievements ? 14 : 0,
          }}>
            {unlocked.map(a => (
              <div key={a.id} title={`${a.name}: ${a.desc}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '5px 10px' : '6px 12px',
                background: colors.bgElevated,
                borderRadius: 8,
                border: `1px solid ${colors.cyanBorder}`,
                boxShadow: `0 0 6px ${colors.cyanDim}`,
              }}>
                <span style={{ fontSize: isMobile ? 16 : 18 }}>{a.emoji}</span>
                <span style={{ fontSize: isMobile ? 10 : 11, color: colors.textPrimary, fontWeight: 700, fontFamily: fonts.heading }}>{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Locked badges (show next few) */}
        {unlocked.length < totalAchievements && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8,
          }}>
            {ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id)).slice(0, isMobile ? 4 : 6).map(a => (
              <div key={a.id} title={`${a.name}: ${a.desc}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '5px 10px' : '6px 12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                opacity: 0.5,
              }}>
                <span style={{ fontSize: isMobile ? 16 : 18, filter: 'grayscale(1)' }}>🔒</span>
                <span style={{ fontSize: isMobile ? 10 : 11, color: colors.textMuted, fontWeight: 600, fontFamily: fonts.heading }}>{a.name}</span>
              </div>
            ))}
            {ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id)).length > (isMobile ? 4 : 6) && (
              <span style={{ fontSize: 11, color: colors.textMuted, alignSelf: 'center', padding: '0 4px' }}>
                +{ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id)).length - (isMobile ? 4 : 6)} more
              </span>
            )}
          </div>
        )}

        {/* Empty state */}
        {unlocked.length === 0 && (
          <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', padding: '4px 0' }}>
            Start playing to unlock achievements!
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <Leaderboard userId={user.id} isMobile={isMobile} />

      {/* FAQs */}
      <div style={{ marginTop: isMobile ? 16 : 24 }}>
        <span style={{
          fontSize: isMobile ? 15 : 17, fontWeight: 800, color: colors.textPrimary,
          fontFamily: fonts.heading, letterSpacing: 0.3,
        }}>
          FAQs
        </span>

        {/* What is FlopIQ */}
        <div style={{
          background: colors.bgCard,
          borderRadius: 12, border: `1px solid ${colors.border}`,
          marginTop: isMobile ? 10 : 14,
          overflow: 'hidden',
        }}>
          <button onClick={() => {
            const next = !aboutOpen;
            setAboutOpen(next);
            if (!next) localStorage.setItem('flopiq_seen_about', '1');
          }} style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 14px' : '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <span style={{
              fontSize: isMobile ? 14 : 15, fontWeight: 800, color: colors.textPrimary,
              fontFamily: fonts.heading, letterSpacing: 0.3,
            }}>
              What is FlopIQ?
            </span>
            <span style={{
              fontSize: 14, color: colors.textMuted, fontWeight: 600,
              transform: aboutOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>
              &#9662;
            </span>
          </button>

          <div style={{
            maxHeight: aboutOpen ? 400 : 0,
            opacity: aboutOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.25s ease',
          }}>
            <div style={{
              padding: isMobile ? '0 14px 16px' : '0 18px 20px',
              display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12,
            }}>
              <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: 4 }} />

              {[
                { icon: '\u{1F3AF}', text: `${SCENARIOS.length} scenarios across 5 opponent archetypes. Read your opponent. Exploit their leaks. Make the right decision.` },
                { icon: '\u{1F525}', text: 'Face Nits, Calling Stations, TAGs, LAGs, and ABC players — each demands a different strategy.' },
                { icon: '\u{1F4C8}', text: 'Track streaks, earn XP, and climb the ranks from Fish to GTO Wizard.' },
                { icon: '\u{1F9E0}', text: 'Built for grinders who want an edge — and beginners ready to build one.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 12,
                }}>
                  <span style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.4, flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{
                    fontSize: isMobile ? 13 : 14, color: colors.textSecondary, lineHeight: 1.5, fontWeight: 500,
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player Archetypes dropdown */}
        <div style={{
          background: colors.bgCard,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          marginTop: isMobile ? 8 : 12,
          overflow: 'hidden',
        }}>
          <button onClick={() => setArchetypesOpen(!archetypesOpen)} style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 14px' : '14px 18px',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <span style={{
              fontSize: isMobile ? 14 : 15, fontWeight: 800, color: colors.textPrimary,
              fontFamily: fonts.heading, letterSpacing: 0.3,
            }}>
              What are Player Archetypes?
            </span>
            <span style={{
              fontSize: 14, color: colors.textMuted, fontWeight: 600,
              transform: archetypesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>
              &#9662;
            </span>
          </button>

          <div style={{
            maxHeight: archetypesOpen ? 600 : 0,
            opacity: archetypesOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.25s ease',
          }}>
            <div style={{
              padding: isMobile ? '0 14px 16px' : '0 18px 20px',
              display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10,
            }}>
              <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: 4 }} />

              {Object.entries(OPPONENT_ARCHETYPES).map(([key, arch]) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 12,
                  padding: isMobile ? '8px 10px' : '10px 14px',
                  background: `${arch.color}0a`,
                  borderRadius: 10,
                  border: `1px solid ${arch.color}22`,
                }}>
                  <span style={{ fontSize: isMobile ? 20 : 24, lineHeight: 1.2, flexShrink: 0 }}>
                    {arch.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: isMobile ? 13 : 14, fontWeight: 700, color: arch.color,
                      marginBottom: 2,
                    }}>
                      {arch.label}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 12 : 13, color: colors.textSecondary, lineHeight: 1.4,
                    }}>
                      {arch.description}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 11 : 12, color: colors.textMuted, lineHeight: 1.4,
                      marginTop: 3, fontStyle: 'italic',
                    }}>
                      {arch.spotting}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
