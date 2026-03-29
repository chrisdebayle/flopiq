import { useState, useEffect } from 'react';
import { colors, glows, gradients, fonts } from '../../theme.js';

export default function WelcomeScreen({ onEnter, onReclaim, authError, setAuthError }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameTaken, setNameTaken] = useState(null);

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
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReclaim() {
    setSubmitting(true);
    setLocalError('');
    if (setAuthError) setAuthError(null);
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
    fontFamily: fonts.body,
    borderRadius: 12,
    border: `2px solid ${hasError ? colors.red : colors.cyanBorder}`,
    background: colors.bgSurface, color: colors.textPrimary,
    outline: 'none', transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: hasError ? `0 0 8px ${colors.redDim}` : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 30%, ${colors.bgSurface} 0%, ${colors.bgDeep} 70%)`,
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
          boxShadow: glows.cyanStrong,
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
          onFocus={e => {
            e.target.style.borderColor = colors.cyan;
            e.target.style.boxShadow = glows.cyan;
          }}
          onBlur={e => {
            e.target.style.borderColor = colors.cyanBorder;
            e.target.style.boxShadow = 'none';
          }}
        />

        {error && !nameTaken && (
          <span style={{
            color: colors.red, fontSize: 12, fontWeight: 600, textAlign: 'center',
            textShadow: `0 0 8px ${colors.redDim}`,
          }}>
            {error}
          </span>
        )}

        {/* Returning player prompt */}
        {nameTaken && (
          <div style={{
            width: '100%', padding: '12px 16px',
            background: colors.orangeDim,
            border: `1px solid ${colors.orangeBorder}`,
            borderRadius: 12, textAlign: 'center',
          }}>
            <div style={{
              color: colors.orange, fontSize: 14, fontWeight: 700, marginBottom: 4,
              fontFamily: fonts.heading,
            }}>
              Welcome back!
            </div>
            <div style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>
              A player with this name already exists ({nameTaken.total_xp || 0} XP).
            </div>
            <button
              type="button"
              onClick={handleReclaim}
              disabled={submitting}
              style={{
                width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 800,
                fontFamily: fonts.heading,
                borderRadius: 10, border: 'none',
                background: submitting ? 'rgba(255,140,0,0.3)' : gradients.secondaryButton,
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5, textTransform: 'uppercase',
                opacity: submitting ? 0.7 : 1,
                boxShadow: submitting ? 'none' : glows.orange,
              }}
            >
              {submitting ? 'Reclaiming...' : 'Reclaim Your Seat'}
            </button>
          </div>
        )}

        {!nameTaken && (
          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 800,
            fontFamily: fonts.heading,
            borderRadius: 12, border: 'none',
            background: submitting ? 'rgba(0,229,255,0.2)' : gradients.primaryButton,
            color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
            letterSpacing: 1, textTransform: 'uppercase',
            boxShadow: submitting ? 'none' : glows.button,
            transition: 'all 0.2s ease',
            opacity: submitting ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = glows.cyanStrong; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = glows.button; }}
          >
            {submitting ? 'Shuffling...' : 'Take Your Seat'}
          </button>
        )}

        <span style={{
          fontSize: 11, color: colors.textMuted, fontWeight: 500, marginTop: 4, textAlign: 'center',
        }}>
          No account needed. Just pick a name and play.
        </span>
      </form>

      <style>{`
        input::placeholder { color: ${colors.textMuted}; }
      `}</style>
    </div>
  );
}
