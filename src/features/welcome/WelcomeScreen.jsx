import { useState, useEffect } from 'react';

const CARDS = [
  { rank: 'A', suit: '\u2660', color: '#fff' },
  { rank: 'K', suit: '\u2665', color: '#e74c3c' },
  { rank: 'Q', suit: '\u2666', color: '#e74c3c' },
  { rank: 'J', suit: '\u2663', color: '#fff' },
  { rank: 'A', suit: '\u2665', color: '#e74c3c' },
];

export default function WelcomeScreen({ onLogin }) {
  const [step, setStep] = useState(0); // 0=cards dealing, 1=branding, 2=tagline, 3=form
  const [name, setName] = useState('');
  const [cardsDealt, setCardsDealt] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Stagger card dealing
    const timers = [];
    CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setCardsDealt(i + 1), 150 + i * 180));
    });
    // Then reveal branding
    timers.push(setTimeout(() => setStep(1), 900));
    timers.push(setTimeout(() => setStep(2), 1400));
    timers.push(setTimeout(() => setStep(3), 1900));
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a display name');
      return;
    }
    if (trimmed.length > 20) {
      setError('20 characters max');
      return;
    }
    onLogin(trimmed);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0e14 0%, #111820 40%, #161b22 100%)',
      padding: '20px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(41,128,185,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dealing cards */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 32, height: 80,
        perspective: 800,
      }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{
            width: 52, height: 74, borderRadius: 8,
            background: i < cardsDealt ? '#fff' : 'transparent',
            border: i < cardsDealt ? 'none' : 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            transform: i < cardsDealt
              ? 'translateY(0) rotateY(0deg) scale(1)'
              : 'translateY(-60px) rotateY(90deg) scale(0.8)',
            opacity: i < cardsDealt ? 1 : 0,
            transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`,
            boxShadow: i < cardsDealt ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
          }}>
            <span style={{
              fontSize: 20, fontWeight: 900, color: card.color === '#fff' ? '#1a1a2e' : card.color,
              lineHeight: 1,
            }}>
              {card.rank}
            </span>
            <span style={{
              fontSize: 16, color: card.color === '#fff' ? '#1a1a2e' : card.color,
              lineHeight: 1, marginTop: -2,
            }}>
              {card.suit}
            </span>
          </div>
        ))}
      </div>

      {/* Brand */}
      <h1 style={{
        fontSize: 48, fontWeight: 900, color: '#fff', margin: 0,
        letterSpacing: -1, lineHeight: 1,
        opacity: step >= 1 ? 1 : 0,
        transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}>
        FlopIQ
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: 13, color: '#8899aa', margin: '8px 0 0',
        textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700,
        opacity: step >= 2 ? 1 : 0,
        transform: step >= 2 ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        Think Better. Stack Faster.
      </p>

      {/* Value prop */}
      <p style={{
        fontSize: 18, color: '#fff', margin: '24px 0 0',
        textAlign: 'center', maxWidth: 400, lineHeight: 1.5, fontWeight: 700,
        letterSpacing: 0.3,
        textShadow: '0 0 20px rgba(41,128,185,0.3)',
        opacity: step >= 2 ? 1 : 0,
        transform: step >= 2 ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease 0.2s',
      }}>
        The pre-game warmup serious players don&apos;t skip.
      </p>

      {/* Login form */}
      <form onSubmit={handleSubmit} style={{
        marginTop: 32, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 12, width: '100%', maxWidth: 320,
        opacity: step >= 3 ? 1 : 0,
        transform: step >= 3 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease',
      }}>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="Enter your player name"
          maxLength={20}
          autoFocus={step >= 3}
          style={{
            width: '100%', padding: '14px 18px', fontSize: 16, fontWeight: 600,
            borderRadius: 12, border: `2px solid ${error ? '#e74c3c' : 'rgba(255,255,255,0.12)'}`,
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            outline: 'none', textAlign: 'center',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = '#2980b9'; }}
          onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        {error && (
          <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 600 }}>{error}</span>
        )}
        <button type="submit" style={{
          width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 800,
          borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #2980b9, #2471a3)',
          color: '#fff', cursor: 'pointer', letterSpacing: 0.5,
          textTransform: 'uppercase',
          boxShadow: '0 4px 16px rgba(41,128,185,0.3)',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Take Your Seat
        </button>
      </form>

      <style>{`
        input::placeholder { color: #556677; }
      `}</style>
    </div>
  );
}
