import { useState, useEffect } from 'react';

export default function WelcomeScreen({ onEnter, authError, setAuthError }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const error = authError || localError;

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  function clearErrors() {
    setLocalError('');
    if (setAuthError) setAuthError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearErrors();

    if (!displayName.trim()) { setLocalError('Pick a display name'); return; }
    if (displayName.trim().length > 20) { setLocalError('20 characters max'); return; }

    setSubmitting(true);
    try {
      await onEnter(displayName.trim());
    } catch {
      // Error is set via authError prop
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '14px 18px', fontSize: 15, fontWeight: 600,
    borderRadius: 12, border: `2px solid ${hasError ? '#e74c3c' : 'rgba(255,255,255,0.18)'}`,
    background: 'rgba(0,0,0,0.4)', color: '#fff',
    outline: 'none', transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    backdropFilter: 'blur(8px)',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fullscreen video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/logo-flopiq-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '20px 24px',
        width: '100%',
      }}>
        {/* Logo image */}
        <img
          src="/logo-flopiq-main.jpg"
          alt="FlopIQ — Think Better. Stack Faster."
          style={{
            width: '100%', maxWidth: 280, borderRadius: 16,
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'all 0.6s ease',
            marginBottom: 32,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        />

        {/* Enter form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, width: '100%', maxWidth: 320,
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}>
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); clearErrors(); }}
            placeholder="Choose your player name"
            maxLength={20}
            autoFocus
            style={inputStyle(!!error)}
            onFocus={e => e.target.style.borderColor = '#2980b9'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
          />

          {error && (
            <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
              {error}
            </span>
          )}

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 800,
            borderRadius: 12, border: 'none',
            background: submitting
              ? 'rgba(41,128,185,0.4)'
              : 'linear-gradient(135deg, #2980b9, #2471a3)',
            color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
            letterSpacing: 0.5, textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(41,128,185,0.3)',
            transition: 'all 0.2s ease',
            opacity: submitting ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {submitting ? 'Shuffling...' : 'Take Your Seat'}
          </button>

          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: 4, textAlign: 'center',
          }}>
            No account needed. Just pick a name and play.
          </span>
        </form>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}
