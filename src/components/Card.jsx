import { SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from '../engine/deck.js';
import { colors } from '../theme.js';

function Card({ card, size = 'medium', faceDown = false, selectable = false, selected = false, onClick }) {
  const sizes = {
    xsmall: { width: 32, height: 46, fontSize: 11, suitSize: 12 },
    small: { width: 48, height: 68, fontSize: 14, suitSize: 16 },
    medium: { width: 64, height: 90, fontSize: 18, suitSize: 22 },
    large: { width: 80, height: 112, fontSize: 22, suitSize: 28 },
  };
  const s = sizes[size] || sizes.medium;

  const borderRadius = size === 'xsmall' ? 4 : 8;

  if (faceDown) {
    return (
      <div
        style={{
          width: s.width, height: s.height, borderRadius,
          background: 'linear-gradient(135deg, #0a1a2e 25%, #0f2440 75%)',
          border: `2px solid ${colors.cyanBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 10px ${colors.cyanDim}`,
          cursor: selectable ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <span style={{ fontSize: s.suitSize, color: colors.purple, opacity: 0.3 }}>♠</span>
      </div>
    );
  }

  if (!card) {
    return (
      <div style={{
        width: s.width, height: s.height, borderRadius,
        border: `2px dashed ${colors.cyanBorder}`, background: colors.bgSurface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: colors.textMuted, fontSize: s.fontSize }}>?</span>
      </div>
    );
  }

  const suitColors = {
    h: '#ff1744',        // Hearts — Red
    d: colors.cyan,      // Diamonds — Cyan
    c: colors.green,     // Clubs — Neon Green
    s: colors.purple,    // Spades — Purple
  };
  const color = suitColors[card.suit] || colors.cyan;
  const isRed = card.suit === 'h';

  return (
    <div
      style={{
        width: s.width, height: s.height, borderRadius,
        background: selected ? 'rgba(255, 140, 0, 0.1)' : '#0a1020',
        border: selected ? `3px solid ${colors.orange}` : `1px solid ${colors.cyanBorder}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2,
        boxShadow: selected
          ? `0 0 12px ${colors.orangeGlow}`
          : `0 2px 8px rgba(0,0,0,0.3), 0 0 4px ${color}22`,
        cursor: selectable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        transform: selected ? 'translateY(-4px)' : 'none',
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: s.fontSize, fontWeight: 700, color, lineHeight: 1 }}>
        {RANK_NAMES[card.rank]}
      </span>
      <span style={{ fontSize: s.suitSize, color, lineHeight: 1 }}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

export default Card;
