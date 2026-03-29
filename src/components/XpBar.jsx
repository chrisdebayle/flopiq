import { useState, useEffect } from 'react';
import { colors, glows, fonts } from '../theme.js';

export default function XpBar({ currentLevel, totalXp, isMobile }) {
  const [flash, setFlash] = useState(false);
  const [prevIdx, setPrevIdx] = useState(currentLevel.idx);

  useEffect(() => {
    if (currentLevel.idx > prevIdx) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2000);
      setPrevIdx(currentLevel.idx);
      return () => clearTimeout(t);
    }
  }, [currentLevel.idx, prevIdx]);

  const barHeight = isMobile ? 28 : 34;
  const progressPct = Math.min(currentLevel.progress * 100, 100);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
      padding: isMobile ? '4px 8px' : '5px 12px',
      background: flash ? 'rgba(255,215,0,0.15)' : colors.bgCard,
      borderRadius: 10,
      border: `1px solid ${flash ? colors.gold : colors.border}`,
      boxShadow: flash ? `0 0 12px rgba(255,215,0,0.3)` : 'none',
      transition: 'all 0.5s ease',
      marginBottom: isMobile ? 6 : 12,
    }}>
      {/* Level badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        minWidth: isMobile ? 60 : 90,
      }}>
        <span style={{ fontSize: isMobile ? 16 : 20 }}>{currentLevel.emoji}</span>
        <span style={{
          color: flash ? colors.gold : colors.textPrimary,
          fontSize: isMobile ? 11 : 13, fontWeight: 700,
          fontFamily: fonts.heading,
          transition: 'color 0.5s ease',
          whiteSpace: 'nowrap',
        }}>
          {currentLevel.name}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        flex: 1, height: barHeight - 18, borderRadius: 6,
        background: 'rgba(0,0,0,0.3)',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%', borderRadius: 6,
          width: `${progressPct}%`,
          background: flash
            ? 'linear-gradient(90deg, #ffd700, #ffaa00)'
            : `linear-gradient(90deg, ${colors.orange}, ${colors.orangeLight})`,
          transition: 'width 0.6s ease, background 0.5s ease',
          boxShadow: flash ? '0 0 12px rgba(255,215,0,0.5)' : 'none',
        }} />
      </div>

      {/* XP text */}
      <div style={{
        fontSize: isMobile ? 10 : 12, color: colors.textSecondary, fontWeight: 600,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {currentLevel.nextLevel
          ? `${totalXp.toLocaleString()} / ${currentLevel.nextLevel.minXp.toLocaleString()}`
          : `${totalXp.toLocaleString()} XP`
        }
      </div>
    </div>
  );
}
