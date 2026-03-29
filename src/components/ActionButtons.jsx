import { useState, useEffect } from 'react';
import { colors, glows, fonts } from '../theme.js';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const ALL_ACTIONS = ['fold', 'check', 'call', 'raise'];

// Bet options (toCall === 0, postflop — you're first to put money in)
const BET_OPTIONS = [
  { value: 'blocker', label: 'Blocker Bet', sizing: '10-25% pot', desc: 'Control pot, block larger bets' },
  { value: 'cbet', label: 'C-Bet', sizing: '50-66% pot', desc: 'Follow through as preflop raiser' },
  { value: 'semibluff', label: 'Semi-Bluff', sizing: '50-75% pot', desc: 'Draw with equity, win by fold or hit' },
  { value: 'value', label: 'Value Bet', sizing: '66-100% pot', desc: 'Strong hand, extract max value' },
  { value: 'overbet', label: 'Overbet', sizing: '100-150%+ pot', desc: 'Nuts or polarized bluff' },
  { value: 'bluff', label: 'Bluff', sizing: '33-50% pot', desc: 'Air — only wins if opponent folds' },
  { value: 'allin', label: 'All-In', sizing: '100% stack', desc: 'Total commitment, SPR critical' },
];

// Raise options — preflop open (just BB to call)
const OPEN_RAISE_OPTIONS = [
  { value: 'open', label: 'Open Raise', sizing: '3-4x BB', desc: 'Standard preflop open' },
  { value: 'allin', label: 'All-In', sizing: '100% stack', desc: 'Maximum pressure' },
];

// Raise options — preflop facing a raise (3-bet)
const THREE_BET_OPTIONS = [
  { value: '3bet', label: '3-Bet', sizing: '3x the raise', desc: 'Re-raise for value or bluff' },
  { value: 'allin', label: 'All-In', sizing: '100% stack', desc: 'Maximum pressure' },
];

// Raise options — postflop facing a bet
const POST_RAISE_OPTIONS = [
  { value: 'value', label: 'Value Raise', sizing: '2.5-3x the bet', desc: 'Strong hand, build pot' },
  { value: 'semibluff', label: 'Semi-Bluff Raise', sizing: '2.5-3x the bet', desc: 'Draw with equity, win by fold or hit' },
  { value: 'overbet', label: 'Overbet Raise', sizing: '100-150%+ pot', desc: 'Nuts or polarized bluff' },
  { value: 'allin', label: 'All-In', sizing: '100% stack', desc: 'Total commitment, SPR critical' },
];

function getOptions(street, toCall) {
  if (toCall === 0) return BET_OPTIONS;
  if (street === 'preflop' && toCall <= 1) return OPEN_RAISE_OPTIONS;
  if (street === 'preflop') return THREE_BET_OPTIONS;
  return POST_RAISE_OPTIONS;
}

const actionGlows = {
  fold: `0 0 12px rgba(74, 90, 110, 0.3), 0 0 4px rgba(74, 90, 110, 0.15)`,
  check: `0 0 12px rgba(179, 136, 255, 0.3), 0 0 4px rgba(179, 136, 255, 0.15)`,
  call: `0 0 12px rgba(0, 230, 118, 0.3), 0 0 4px rgba(0, 230, 118, 0.15)`,
  raise: glows.orange,
};

function ActionButtons({
  disabledActions = [],
  onAction,
  disabled = false,
  selectedAction = null,
  street = 'preflop',
  toCall = 0,
}) {
  const isMobile = useIsMobile();
  const [showBetOptions, setShowBetOptions] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState(null);

  // Dynamic label: "Bet" when toCall === 0, "Raise" when toCall > 0
  const raiseLabel = toCall === 0 ? 'Bet' : 'Raise';
  const options = getOptions(street, toCall);

  const actionStyles = {
    fold: { bg: colors.textMuted, label: 'Fold' },
    check: { bg: colors.purple, label: 'Check' },
    call: { bg: colors.green, label: 'Call' },
    raise: { bg: colors.orange, label: raiseLabel },
  };

  function handleBetTypeSelect(betType) {
    setSelectedBetType(betType);
    setShowBetOptions(false);
    onAction('raise', betType);
  }

  function handleAction(action) {
    if (action === 'raise') {
      if (disabled) return;
      setShowBetOptions(prev => !prev);
      return;
    }
    setShowBetOptions(false);
    setSelectedBetType(null);
    onAction(action);
  }

  // Reset bet options when scenario changes
  useEffect(() => {
    setShowBetOptions(false);
    setSelectedBetType(null);
  }, [street, toCall]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, auto)',
        gap: isMobile ? 8 : 12,
        justifyContent: 'center',
        width: isMobile ? '100%' : 'auto',
      }}>
        {ALL_ACTIONS.map(action => {
          const style = actionStyles[action];
          const isSelected = selectedAction === action;
          const isUnavailable = disabledActions.includes(action);
          const isDisabled = disabled || isUnavailable;

          let buttonLabel = style.label;
          if (action === 'raise' && selectedBetType && isSelected) {
            const opt = options.find(o => o.value === selectedBetType);
            buttonLabel = opt ? opt.label : style.label;
          }

          return (
            <button
              key={action}
              onClick={() => !isUnavailable && handleAction(action)}
              disabled={isDisabled}
              style={{
                padding: isMobile ? '10px 24px' : '14px 32px',
                fontSize: isMobile ? 15 : 18,
                fontWeight: 700,
                fontFamily: fonts.heading,
                borderRadius: 12,
                border: isSelected ? `3px solid ${colors.cyan}` : '2px solid transparent',
                background: isUnavailable ? colors.bgSurface : style.bg,
                color: isUnavailable ? colors.textMuted : '#fff',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isUnavailable ? 0.5 : 1,
                transition: 'all 0.15s ease',
                boxShadow: isSelected
                  ? glows.cyan
                  : isUnavailable
                    ? '0 2px 8px rgba(0,0,0,0.2)'
                    : `${actionGlows[action]}, 0 2px 8px rgba(0,0,0,0.2)`,
                minWidth: isMobile ? 0 : 100,
                width: isMobile ? '100%' : 'auto',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {buttonLabel}
            </button>
          );
        })}
      </div>

      {/* Bet/Raise type options */}
      {showBetOptions && !disabled && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          background: colors.orangeDim, borderRadius: 12, padding: isMobile ? '10px 10px' : '12px 16px',
          border: `1px solid ${colors.orangeBorder}`,
          width: isMobile ? '100%' : 'auto', maxWidth: 500,
        }}>
          <span style={{
            color: colors.orange, fontSize: isMobile ? 11 : 13, fontWeight: 700,
            fontFamily: fonts.heading,
            textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center',
          }}>
            What type of {raiseLabel.toLowerCase()}?
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: isMobile ? 5 : 8,
          }}>
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleBetTypeSelect(opt.value)}
                style={{
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  borderRadius: 10,
                  border: opt.value === 'allin'
                    ? `1px solid ${colors.red}`
                    : `1px solid ${colors.orangeBorder}`,
                  background: opt.value === 'allin'
                    ? colors.redDim
                    : colors.orangeDim,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.background = opt.value === 'allin'
                  ? 'rgba(255,23,68,0.4)' : 'rgba(255,140,0,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = opt.value === 'allin'
                  ? colors.redDim : colors.orangeDim}
              >
                <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, fontFamily: fonts.heading }}>{opt.label}</span>
                <span style={{
                  fontSize: isMobile ? 10 : 11, color: opt.value === 'allin' ? '#f08080' : colors.orangeLight,
                  fontWeight: 600,
                }}>
                  {opt.sizing}
                </span>
                <span style={{ fontSize: isMobile ? 9 : 10, color: colors.textMuted, fontStyle: 'italic' }}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionButtons;
