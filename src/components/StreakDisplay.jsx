import { useState, useEffect } from 'react';

export default function StreakDisplay({ streak, bestStreak, isMobile }) {
  const [pulse, setPulse] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (streak > prevStreak && streak > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      setPrevStreak(streak);
      return () => clearTimeout(t);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  if (streak === 0 && bestStreak === 0) return null;

  const intensity = streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1 : 0;
  const glowColors = ['transparent', 'rgba(255,165,0,0.3)', 'rgba(255,100,0,0.4)', 'rgba(255,50,0,0.5)', 'rgba(255,0,0,0.6)'];
  const textColors = ['#8899aa', '#ff9800', '#ff6d00', '#ff3d00', '#ff1744'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {streak > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: isMobile ? '2px 8px' : '3px 10px',
          borderRadius: 12,
          background: intensity > 0 ? 'rgba(255,140,0,0.12)' : 'rgba(255,255,255,0.06)',
          boxShadow: intensity > 0 ? `0 0 ${intensity * 4}px ${glowColors[intensity]}` : 'none',
          transform: pulse ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}>
          <span style={{ fontSize: isMobile ? 14 : 16 }}>
            {intensity >= 3 ? '\uD83D\uDD25' : intensity >= 1 ? '\u2728' : '\u26A1'}
          </span>
          <span style={{
            color: textColors[intensity],
            fontSize: isMobile ? 13 : 15, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {streak}
          </span>
        </div>
      )}
      {streak === 0 && bestStreak > 0 && (
        <div style={{
          fontSize: isMobile ? 10 : 11, color: '#556',
          padding: '2px 8px',
        }}>
          Best: {bestStreak}
        </div>
      )}
    </div>
  );
}
