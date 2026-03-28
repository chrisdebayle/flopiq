import { useMemo, useState, useEffect } from 'react';
import Card from './Card.jsx';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// 7-player seat layout — hero always at bottom center
const SEAT_ANGLES = {
  0: { left: '50%', bottom: '-2%', tx: '-50%', ty: '0' },
  1: { left: '3%', bottom: '15%', tx: '0', ty: '0' },
  2: { left: '1%', top: '30%', tx: '0', ty: '-50%' },
  3: { left: '22%', top: '-2%', tx: '0', ty: '0' },
  4: { right: '22%', top: '-2%', tx: '0', ty: '0' },
  5: { right: '1%', top: '30%', tx: '0', ty: '-50%' },
  6: { right: '3%', bottom: '15%', tx: '0', ty: '0' },
};

const SEAT_ANGLES_MOBILE = {
  0: { left: '50%', bottom: '-6%', tx: '-50%', ty: '0' },
  1: { left: '1%', bottom: '8%', tx: '0', ty: '0' },
  2: { left: '-1%', top: '32%', tx: '0', ty: '-50%' },
  3: { left: '18%', top: '-4%', tx: '0', ty: '0' },
  4: { right: '18%', top: '-4%', tx: '0', ty: '0' },
  5: { right: '-1%', top: '32%', tx: '0', ty: '-50%' },
  6: { right: '1%', bottom: '8%', tx: '0', ty: '0' },
};

// Approximate center coordinates (%) for each seat index — used for chip placement
const SEAT_CENTER = {
  0: [50, 95],
  1: [8, 80],
  2: [5, 42],
  3: [26, 5],
  4: [74, 5],
  5: [95, 42],
  6: [92, 80],
};

const SEAT_CENTER_MOBILE = {
  0: [50, 92],
  1: [6, 78],
  2: [4, 44],
  3: [22, 3],
  4: [78, 3],
  5: [96, 44],
  6: [94, 78],
};

const TABLE_CENTER = [50, 48];

const SEAT_ORDER_DEFAULT = ['BTN', 'SB', 'BB', 'UTG', 'UTG1', 'MP', 'CO'];

const OPPONENT_STACKS = { BTN: 87, SB: 64, BB: 95, UTG: 72, UTG1: 103, MP: 108, CO: 54 };

function ChipStack({ type, amount, isMobile }) {
  const isRaise = type === 'raise';
  const isCall = type === 'call';
  const chipCount = isRaise ? 4 : isCall ? 3 : 2;
  const chipW = isMobile ? (isRaise ? 12 : 8) : (isRaise ? 16 : 11);
  const chipH = Math.round(chipW * 0.45);
  const spacing = isMobile ? 2 : 3;
  const colors = isRaise
    ? ['#bb2222', '#cc3333', '#dd4444', '#cc3333']
    : isCall
    ? ['#3377aa', '#4488bb', '#5599cc']
    : ['#bb8822', '#ccaa33'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: chipW, height: chipCount * spacing + chipH }}>
        {colors.map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: i * spacing,
            left: 0,
            width: chipW, height: chipH,
            borderRadius: '50%',
            background: `linear-gradient(180deg, ${c} 0%, ${c}dd 100%)`,
            border: `1px solid rgba(0,0,0,0.4)`,
            boxShadow: i === colors.length - 1
              ? '0 1px 3px rgba(0,0,0,0.4)'
              : 'none',
          }} />
        ))}
      </div>
      <span style={{
        color: isRaise ? '#ff8888' : '#ddcc88',
        fontSize: isMobile ? 7 : 9,
        fontWeight: 700,
        marginTop: 2,
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      }}>
        {amount}BB
      </span>
    </div>
  );
}

function PokerTable({ heroPosition, holeCards, communityCards, potSize, stackSize, street, actions = {}, opponentArchetype, villainSeatIdx }) {
  const isMobile = useIsMobile();
  const seats = useMemo(() => {
    const heroIdx = SEAT_ORDER_DEFAULT.indexOf(heroPosition);
    const idx = heroIdx >= 0 ? heroIdx : 0;
    const rotated = [];
    for (let i = 0; i < 7; i++) {
      rotated.push(SEAT_ORDER_DEFAULT[(idx + i) % 7]);
    }
    return rotated;
  }, [heroPosition]);

  const seatLayout = isMobile ? SEAT_ANGLES_MOBILE : SEAT_ANGLES;
  const seatCenters = isMobile ? SEAT_CENTER_MOBILE : SEAT_CENTER;
  const cardSize = isMobile ? 'xsmall' : 'small';
  const heroCardSize = isMobile ? 'small' : 'medium';

  function getChipPosition(seatIdx) {
    const seat = seatCenters[seatIdx];
    const t = isMobile ? 0.42 : 0.45;
    return {
      left: `${seat[0] + (TABLE_CENTER[0] - seat[0]) * t}%`,
      top: `${seat[1] + (TABLE_CENTER[1] - seat[1]) * t}%`,
    };
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 740,
      aspectRatio: isMobile ? '4 / 3' : '16 / 10',
      margin: '0 auto',
      background: 'radial-gradient(ellipse at center, #101c30 0%, #080e1a 100%)',
      borderRadius: 20,
      overflow: 'visible',
      padding: 4,
    }}>
      {/* Outer rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        border: '2px solid rgba(100,160,255,0.08)', pointerEvents: 'none',
      }} />

      {/* Green felt */}
      <div style={{
        position: 'absolute', top: '14%', left: '12%', right: '12%', bottom: '14%',
        background: 'radial-gradient(ellipse at 50% 48%, #1e7a44 0%, #176838 35%, #115a2e 60%, #0d4a24 80%, #093d1c 100%)',
        borderRadius: '50%', border: '5px solid #1a2a10',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.35), 0 0 0 6px #1e2d48, 0 0 0 8px #141e30, 0 0 50px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: '1.5px solid rgba(80,200,255,0.08)', pointerEvents: 'none',
        }} />
      </div>

      {/* Community cards */}
      <div style={{
        position: 'absolute', top: isMobile ? '38%' : '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', gap: isMobile ? 2 : 4, zIndex: 10,
      }}>
        {communityCards.length > 0 ? (
          communityCards.map((card, i) => <Card key={i} card={card} size={cardSize} />)
        ) : (
          [0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: isMobile ? 28 : 40, height: isMobile ? 40 : 56, borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.12)',
            }} />
          ))
        )}
      </div>

      {/* Pot */}
      <div style={{
        position: 'absolute', top: isMobile ? '52%' : '58%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: isMobile ? '2px 10px' : '3px 14px',
          display: 'flex', alignItems: 'center', gap: isMobile ? 3 : 5,
        }}>
          <span style={{ color: '#8899aa', fontSize: isMobile ? 8 : 10, fontWeight: 700, textTransform: 'uppercase' }}>Pot</span>
          <span style={{ color: '#f1c40f', fontSize: isMobile ? 13 : 16, fontWeight: 800 }}>{potSize}</span>
          <span style={{ color: '#8899aa', fontSize: isMobile ? 8 : 10 }}>BB</span>
        </div>
      </div>

      {/* Chip stacks for players who limped or raised */}
      {seats.map((pos, seatIdx) => {
        if (seatIdx === 0) return null;
        const action = actions[pos];
        if (!action || action.type === 'fold') return null;
        const chipPos = getChipPosition(seatIdx);
        return (
          <div key={`chips-${pos}`} style={{
            position: 'absolute', ...chipPos,
            transform: 'translate(-50%, -50%)',
            zIndex: 8,
          }}>
            <ChipStack type={action.type} amount={action.amount} isMobile={isMobile} />
          </div>
        );
      })}

      {/* Seats */}
      {seats.map((pos, seatIdx) => {
        const isHero = seatIdx === 0;
        const angle = seatLayout[seatIdx];
        const posStyle = {};
        if (angle.left) posStyle.left = angle.left;
        if (angle.right) posStyle.right = angle.right;
        if (angle.top) posStyle.top = angle.top;
        if (angle.bottom) posStyle.bottom = angle.bottom;
        posStyle.transform = `translate(${angle.tx}, ${angle.ty})`;

        const action = actions[pos];
        const isFolded = action && action.type === 'fold';

        return (
          <div
            key={pos}
            style={{
              position: 'absolute', ...posStyle,
              zIndex: isHero ? 20 : 5,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              ...(isFolded ? { opacity: 0.3, filter: 'grayscale(0.7)' } : {}),
            }}
          >
            {isHero ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 2 : 3 }}>
                <div style={{ display: 'flex', gap: isMobile ? 2 : 4 }}>
                  {holeCards.map((card, i) => <Card key={i} card={card} size={heroCardSize} />)}
                </div>
                <div style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
                  border: '2px solid #3498db', borderRadius: isMobile ? 6 : 8,
                  padding: isMobile ? '2px 8px' : '4px 14px', textAlign: 'center',
                  boxShadow: '0 0 14px rgba(52,152,219,0.35)', minWidth: isMobile ? 56 : 80,
                }}>
                  <div style={{ color: '#fff', fontSize: isMobile ? 10 : 13, fontWeight: 800, letterSpacing: 0.5 }}>YOU</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 4 : 6 }}>
                    <span style={{ color: '#3498db', fontSize: isMobile ? 9 : 12, fontWeight: 700 }}>{pos}</span>
                    <span style={{ color: '#ddd', fontSize: isMobile ? 10 : 13, fontWeight: 700 }}>{stackSize} BB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <div style={{ display: 'flex', gap: 1 }}>
                  <Card faceDown size={cardSize} />
                  <Card faceDown size={cardSize} />
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: isMobile ? 5 : 8, padding: isMobile ? '1px 6px' : '3px 10px', textAlign: 'center', minWidth: isMobile ? 40 : 60,
                }}>
                  <div style={{ color: '#99aabb', fontSize: isMobile ? 9 : 12, fontWeight: 700 }}>{pos}</div>
                  <div style={{ color: '#dde', fontSize: isMobile ? 10 : 13, fontWeight: 700 }}>{OPPONENT_STACKS[pos]} BB</div>
                </div>
                {opponentArchetype && seatIdx === villainSeatIdx && (
                  <div style={{
                    background: `${opponentArchetype.color}22`,
                    color: opponentArchetype.color,
                    padding: isMobile ? '1px 6px' : '2px 8px',
                    borderRadius: 8,
                    fontSize: isMobile ? 8 : 10,
                    fontWeight: 700,
                    border: `1px solid ${opponentArchetype.color}44`,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                  }}>
                    {opponentArchetype.emoji} {opponentArchetype.shortLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PokerTable;
