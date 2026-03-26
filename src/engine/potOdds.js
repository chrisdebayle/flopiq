/**
 * Pot Odds & Poker Math Utilities
 * Based on:
 *   - "Poker Math Made Easy" (Roy Rounder)
 *   - "Poker Math & Probabilities" (Pokerology)
 *   - TAMU Texas Hold'em Game Theory Project (M442, 2022)
 */

/**
 * Quick shortcut: outs to approximate percentage on the next card.
 * Rule of 2x+1 (accurate for 3-11 outs).
 *   1-3 outs:  outs × 2
 *   3-11 outs: (outs × 2) + 1
 *   12+ outs:  (outs × 2) + 2
 */
function outsToPercentApprox(outs) {
  if (outs <= 0) return 0;
  if (outs <= 2) return outs * 2;
  if (outs <= 11) return outs * 2 + 1;
  return outs * 2 + 2;
}

/**
 * Exact probability of hitting on the next card.
 * @param {number} outs - number of outs
 * @param {number} unknownCards - cards unseen (47 on flop, 46 on turn)
 */
function outsToPercentExact(outs, unknownCards) {
  if (unknownCards <= 0 || outs <= 0) return 0;
  return (outs / unknownCards) * 100;
}

/**
 * Probability of hitting on either turn OR river (from flop).
 * P = 1 - ((47-outs)/47) * ((46-outs)/46)
 */
function outsToPctTurnAndRiver(outs) {
  if (outs <= 0) return 0;
  const missOnTurn = (47 - outs) / 47;
  const missOnRiver = (46 - outs) / 46;
  return (1 - missOnTurn * missOnRiver) * 100;
}

/**
 * Minimum equity needed to justify a call (as a percentage).
 * Formula: betSize / (potSize + betSize)
 * This is the "betting percentage" from Roy Rounder.
 */
function minEquityToCall(potSize, betSize) {
  if (potSize + betSize <= 0) return 0;
  return (betSize / (potSize + betSize)) * 100;
}

/**
 * Pot odds as a ratio string, e.g. "3:1"
 * @returns {{ ratio: string, decimal: number }}
 */
function potOddsRatio(potSize, betSize) {
  if (betSize <= 0) return { ratio: 'Inf:1', decimal: Infinity };
  const ratio = potSize / betSize;
  return {
    ratio: `${ratio.toFixed(1)}:1`,
    decimal: ratio,
  };
}

/**
 * Determine if a call is mathematically justified by pure pot odds.
 * @param {number} outs
 * @param {number} potSize - pot BEFORE the bet
 * @param {number} betSize - the bet hero must call
 * @param {string} street - 'flop' or 'turn'
 * @returns {{ justified: boolean, handPct: number, neededPct: number, potOdds: string }}
 */
function isPotOddsCall(outs, potSize, betSize, street) {
  const unknowns = street === 'flop' ? 47 : 46;
  const handPct = outsToPercentExact(outs, unknowns);
  const totalPot = potSize + betSize; // pot after opponent bets
  const neededPct = minEquityToCall(totalPot, betSize);
  const odds = potOddsRatio(totalPot, betSize);
  return {
    justified: handPct >= neededPct,
    handPct: Math.round(handPct * 10) / 10,
    neededPct: Math.round(neededPct * 10) / 10,
    potOdds: odds.ratio,
  };
}

/**
 * Standard outs for common draws.
 */
const COMMON_DRAWS = {
  flushDraw: { outs: 9, name: 'Flush draw' },
  openEndedStraight: { outs: 8, name: 'Open-ended straight draw' },
  gutshotStraight: { outs: 4, name: 'Inside (gutshot) straight draw' },
  overcards: { outs: 6, name: 'Two overcards' },
  oneOvercard: { outs: 3, name: 'One overcard' },
  setWithPocketPair: { outs: 2, name: 'Pocket pair to set' },
  flushAndOESD: { outs: 15, name: 'Flush draw + open-ended straight' },
  flushAndGutshot: { outs: 12, name: 'Flush draw + gutshot' },
  twoOvercardsAndGutshot: { outs: 10, name: 'Two overcards + gutshot' },
};

export {
  outsToPercentApprox,
  outsToPercentExact,
  outsToPctTurnAndRiver,
  minEquityToCall,
  potOddsRatio,
  isPotOddsCall,
  COMMON_DRAWS,
};
