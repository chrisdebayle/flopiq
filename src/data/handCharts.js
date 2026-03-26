// Actions: R = Raise Always, C = Call EP / Raise Late, G = Call Always, Y = Call Mid/Late only, F = Fold
// Derived from the Starting Hand Guide PDF charts

const RANKS_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Chart 1: Loose Passive (4+ limpers, no raise)
const CHART_LOOSE = [
  // A    K    Q    J    T    9    8    7    6    5    4    3    2
  ['R', 'R', 'R', 'C', 'C', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'], // A
  ['R', 'R', 'R', 'C', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // K
  ['R', 'R', 'R', 'C', 'G', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // Q
  ['R', 'C', 'C', 'R', 'C', 'G', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // J
  ['F', 'F', 'F', 'F', 'R', 'G', 'G', 'G', 'F', 'F', 'F', 'F', 'F'], // T
  ['F', 'F', 'F', 'F', 'F', 'G', 'G', 'G', 'F', 'F', 'F', 'F', 'F'], // 9
  ['F', 'F', 'F', 'F', 'F', 'F', 'G', 'G', 'G', 'F', 'F', 'F', 'F'], // 8
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'G', 'G', 'F', 'F', 'F'], // 7
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'G', 'Y', 'F', 'F'], // 6
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'G', 'G', 'F'], // 5
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'G', 'F'], // 4
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'G'], // 3
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G'], // 2
];

// Chart 2: Tight/Aggressive (fewer limpers, no raise)
const CHART_TIGHT = [
  ['R', 'R', 'R', 'C', 'C', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'], // A
  ['R', 'R', 'R', 'C', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // K
  ['R', 'R', 'R', 'C', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // Q
  ['C', 'C', 'C', 'R', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // J
  ['F', 'F', 'F', 'F', 'R', 'Y', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // T
  ['F', 'F', 'F', 'F', 'F', 'G', 'Y', 'Y', 'F', 'F', 'F', 'F', 'F'], // 9
  ['F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'Y', 'F', 'F', 'F', 'F'], // 8
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'Y', 'F', 'F', 'F'], // 7
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F', 'F'], // 6
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F'], // 5
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'F', 'F'], // 4
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'F'], // 3
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G'], // 2
];

// Chart 3: Facing a raise (3-5x BB)
const CHART_FACING_RAISE = [
  ['R', 'R', 'R', 'C', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // A
  ['R', 'R', 'R', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // K
  ['R', 'C', 'R', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // Q
  ['C', 'C', 'C', 'R', 'C', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // J
  ['F', 'F', 'F', 'F', 'R', 'Y', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // T
  ['F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F', 'F', 'F', 'F', 'F'], // 9
  ['F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F', 'F', 'F', 'F'], // 8
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F', 'F', 'F'], // 7
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F', 'F'], // 6
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'Y', 'F', 'F'], // 5
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'F', 'F'], // 4
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G', 'F'], // 3
  ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'G'], // 2
];

function getHandKey(card1Rank, card2Rank, suited) {
  const r1 = RANKS_ORDER.indexOf(card1Rank);
  const r2 = RANKS_ORDER.indexOf(card2Rank);
  if (r1 === r2) return { row: r1, col: r1 }; // pair
  if (suited) {
    // Suited hands: higher rank row, lower rank col (above diagonal)
    return r1 < r2 ? { row: r1, col: r2 } : { row: r2, col: r1 };
  }
  // Offsuit: lower rank row, higher rank col (below diagonal)
  return r1 < r2 ? { row: r2, col: r1 } : { row: r1, col: r2 };
}

function lookupChart(chart, card1Rank, card2Rank, suited) {
  const { row, col } = getHandKey(card1Rank, card2Rank, suited);
  return chart[row][col];
}

function getChartAction(card1, card2, gameType) {
  const suited = card1.suit === card2.suit;
  const chart = gameType === 'loose' ? CHART_LOOSE :
                gameType === 'tight' ? CHART_TIGHT : CHART_FACING_RAISE;
  return lookupChart(chart, card1.rank, card2.rank, suited);
}

const ACTION_LABELS = {
  R: { label: 'Raise', color: '#1a5276', description: 'Raise from any position' },
  C: { label: 'Call EP / Raise Late', color: '#5b7a8a', description: 'Call from early position, raise from middle or late' },
  G: { label: 'Call', color: '#1e7a4d', description: 'Call from any position' },
  Y: { label: 'Call (Late)', color: '#b8860b', description: 'Call from middle/late position only, with conditions' },
  F: { label: 'Fold', color: '#95a5a6', description: 'Fold — not profitable to play' },
};

const POSITION_ORDER = ['UTG', 'UTG1', 'MP', 'CO', 'BTN', 'SB', 'BB'];

function isPositionValid(action, position) {
  if (action === 'R' || action === 'G' || action === 'F') return true;
  if (action === 'C') return true; // always valid, action changes
  if (action === 'Y') {
    return ['CO', 'BTN', 'MP'].includes(position);
  }
  return true;
}

function getRecommendedAction(chartAction, position) {
  if (chartAction === 'R') return 'raise';
  if (chartAction === 'F') return 'fold';
  if (chartAction === 'G') return 'call';
  if (chartAction === 'C') {
    return ['UTG', 'UTG1', 'MP'].includes(position) ? 'call' : 'raise';
  }
  if (chartAction === 'Y') {
    return ['CO', 'BTN', 'MP'].includes(position) ? 'call' : 'fold';
  }
  return 'fold';
}

export {
  CHART_LOOSE, CHART_TIGHT, CHART_FACING_RAISE, RANKS_ORDER,
  getHandKey, lookupChart, getChartAction, ACTION_LABELS, POSITION_ORDER,
  isPositionValid, getRecommendedAction
};
