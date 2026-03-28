import { useState, useEffect } from 'react';

export default function WelcomeScreen({ onEnter, onReclaim, authError, setAuthError }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameTaken, setNameTaken] = useState(null); // holds existing profile info

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
    setNameTaken(null);
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
    } catch (err) {
      if (err.message === 'NAME_TAKEN' && err.existingProfile) {
        setNameTaken(err.existingProfile);
      }
      // Other errors are set via authError prop
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReclaim() {
    setSubmitting(true);
    clearErrors();
    try {
      await onReclaim(displayName.trim());
    } catch {
      // Error set via authError prop
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '14px 18px', fontSize: 15, fontWeight: 600,
    borderRadius: 12, border: `2px solid ${hasError ? '#e74c3c' : 'rgba(255,255,255,0.12)'}`,
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    outline: 'none', transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#000',
      padding: '20px 24px',
    }}>
      {/* Looping video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%', maxWidth: 320, borderRadius: 16,
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'all 0.6s ease',
          marginBottom: 32,
        }}
      >
        <source src="/logo-flopiq-bg.mp4" type="video/mp4" />
      </video>

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
          style={inputStyle(!!error || !!nameTaken)}
          onFocus={e => e.target.style.borderColor = '#2980b9'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />

        {error && !nameTaken && (
          <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
            {error}
          </span>
        )}

        {/* Returning player prompt */}
        {nameTaken && (
          <div style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(41,128,185,0.1)',
            border: '1px solid rgba(41,128,185,0.3)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <div style={{ color: '#5dade2', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              Welcome back!
            </div>
            <div style={{ color: '#8899aa', fontSize: 12, marginBottom: 10 }}>
              A player with this name already exists ({nameTaken.total_xp || 0} XP).
            </div>
            <button
              type="button"
              onClick={handleReclaim}
              disabled={submitting}
              style={{
                width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 800,
                borderRadius: 10, border: 'none',
                background: submitting ? 'rgba(41,128,185,0.4)' : 'linear-gradient(135deg, #2980b9, #2471a3)',
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                letterSpacing: 0.3, textTransform: 'uppercase',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Reclaiming...' : 'Reclaim Your Seat'}
            </button>
          </div>
        )}

        {!nameTaken && (
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
        )}

        <span style={{
          fontSize: 11, color: '#556', fontWeight: 500, marginTop: 4, textAlign: 'center',
        }}>
          No account needed. Just pick a name and play.
        </span>
      </form>

      <style>{`
        input::placeholder { color: #556677; }
      `}</style>
    </div>
  );
}
