const SUITS = ['s', 'h', 'd', 'c'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS = { s: '#1a1a2e', h: '#c0392b', d: '#2980b9', c: '#27ae60' };

const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const RANK_NAMES = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8',
  '9': '9', 'T': '10', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
};

function createCard(rank, suit) {
  return { rank, suit, id: `${rank}${suit}` };
}

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank, suit));
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck, count, exclude = []) {
  const excludeIds = new Set(exclude.map(c => c.id));
  const available = deck.filter(c => !excludeIds.has(c.id));
  const shuffled = shuffleDeck(available);
  return shuffled.slice(0, count);
}

function parseCard(str) {
  if (!str || str.length < 2) return null;
  const rank = str[0].toUpperCase();
  const suit = str[1].toLowerCase();
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return createCard(rank, suit);
}

function cardToString(card) {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

export {
  SUITS, RANKS, SUIT_SYMBOLS, SUIT_COLORS, RANK_VALUES, RANK_NAMES,
  createCard, createDeck, shuffleDeck, dealCards, parseCard, cardToString
};
