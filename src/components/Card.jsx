import { SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from '../engine/deck.js';

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
          background: 'linear-gradient(135deg, #1a5276 25%, #154360 75%)',
          border: '2px solid #0d3446',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          cursor: selectable ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <span style={{ fontSize: s.suitSize, color: '#fff', opacity: 0.3 }}>♠</span>
      </div>
    );
  }

  if (!card) {
    return (
      <div style={{
        width: s.width, height: s.height, borderRadius,
        border: '2px dashed #555', background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#555', fontSize: s.fontSize }}>?</span>
      </div>
    );
  }

  const color = card.suit === 'h' || card.suit === 'd' ? '#c0392b' : '#1a1a2e';

  return (
    <div
      style={{
        width: s.width, height: s.height, borderRadius,
        background: selected ? '#fff3cd' : '#fff',
        border: selected ? '3px solid #f39c12' : '2px solid #ddd',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2,
        boxShadow: selected ? '0 0 12px rgba(243,156,18,0.5)' : '0 2px 8px rgba(0,0,0,0.15)',
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
