import { getTopN, getUserRank } from '../data/leaderboard.js';

const RANK_MEDALS = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };

export default function Leaderboard({ userId, isMobile }) {
  const top10 = getTopN(10);
  const userRank = getUserRank(userId);
  const userInTop10 = top10.some(e => e.userId === userId);

  if (top10.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '24px 16px',
        color: '#556', fontSize: 14,
      }}>
        No entries yet. Complete a session to claim the top spot.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 4px',
      }}>
        <span style={{
          fontSize: isMobile ? 15 : 17, fontWeight: 800, color: '#fff',
          letterSpacing: 0.3,
        }}>
          Leaderboard
        </span>
        <span style={{
          fontSize: 11, color: '#556', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          Top 10
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '32px 1fr 60px' : '40px 1fr 80px 70px 70px 80px',
          padding: isMobile ? '8px 10px' : '8px 14px',
          gap: isMobile ? 6 : 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={colHeaderStyle}>#</span>
          <span style={colHeaderStyle}>Player</span>
          <span style={{ ...colHeaderStyle, textAlign: 'right' }}>Score</span>
          {!isMobile && <span style={{ ...colHeaderStyle, textAlign: 'right' }}>XP</span>}
          {!isMobile && <span style={{ ...colHeaderStyle, textAlign: 'right' }}>Streak</span>}
          {!isMobile && <span style={{ ...colHeaderStyle, textAlign: 'right' }}>Accuracy</span>}
        </div>

        {/* Rows */}
        {top10.map(entry => {
          const isUser = entry.userId === userId;
          return (
            <div key={entry.userId} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '32px 1fr 60px' : '40px 1fr 80px 70px 70px 80px',
              padding: isMobile ? '8px 10px' : '10px 14px',
              gap: isMobile ? 6 : 10,
              alignItems: 'center',
              background: isUser ? 'rgba(41,128,185,0.1)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              transition: 'background 0.15s ease',
            }}>
              {/* Rank */}
              <span style={{
                fontSize: isMobile ? 13 : 14, fontWeight: 800,
                color: entry.rank <= 3 ? '#ffd700' : '#667',
              }}>
                {RANK_MEDALS[entry.rank] || entry.rank}
              </span>

              {/* Player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: isMobile ? 14 : 16 }}>{entry.level.emoji}</span>
                <span style={{
                  fontSize: isMobile ? 13 : 14, fontWeight: isUser ? 800 : 600,
                  color: isUser ? '#5dade2' : '#dde',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.displayName}
                </span>
                {isUser && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: '#2980b9',
                    background: 'rgba(41,128,185,0.2)', padding: '1px 5px',
                    borderRadius: 4, flexShrink: 0,
                  }}>
                    YOU
                  </span>
                )}
              </div>

              {/* Composite score */}
              <span style={{
                fontSize: isMobile ? 13 : 14, fontWeight: 700,
                color: entry.rank <= 3 ? '#ffd700' : '#aab',
                textAlign: 'right',
              }}>
                {entry.compositeScore.toLocaleString()}
              </span>

              {/* XP (desktop only) */}
              {!isMobile && (
                <span style={{ fontSize: 13, color: '#8899aa', textAlign: 'right' }}>
                  {entry.totalXp.toLocaleString()}
                </span>
              )}

              {/* Streak (desktop only) */}
              {!isMobile && (
                <span style={{ fontSize: 13, color: '#8899aa', textAlign: 'right' }}>
                  {entry.bestStreak}
                </span>
              )}

              {/* Accuracy (desktop only) */}
              {!isMobile && (
                <span style={{ fontSize: 13, color: '#8899aa', textAlign: 'right' }}>
                  {entry.bestSessionPct > 0 ? `${entry.bestSessionPct}%` : '-'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* User rank if not in top 10 */}
      {userRank && !userInTop10 && (
        <div style={{
          marginTop: 8, padding: isMobile ? '8px 10px' : '10px 14px',
          background: 'rgba(41,128,185,0.08)',
          borderRadius: 10, border: '1px solid rgba(41,128,185,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#667', fontWeight: 700 }}>
              #{userRank.rank}
            </span>
            <span style={{ fontSize: 14 }}>{userRank.level.emoji}</span>
            <span style={{ fontSize: 14, color: '#5dade2', fontWeight: 700 }}>
              {userRank.displayName}
            </span>
          </div>
          <span style={{ fontSize: 13, color: '#aab', fontWeight: 700 }}>
            {userRank.compositeScore.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

const colHeaderStyle = {
  fontSize: 10, color: '#556', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: 0.5,
};
