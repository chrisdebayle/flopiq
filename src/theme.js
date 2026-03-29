// ── FlopIQ Cyberpunk Theme ──
// Inspired by logo-flopiq-main.jpg: neon cyan edges, warm orange accents, deep dark backgrounds

export const colors = {
  // Backgrounds (deep dark with blue undertone)
  bgDeep: '#060b14',
  bgBase: '#0a1020',
  bgSurface: '#0f1a2e',
  bgCard: 'rgba(15, 26, 46, 0.8)',
  bgElevated: 'rgba(20, 35, 60, 0.6)',

  // Primary — Cyan / Electric Blue
  cyan: '#00e5ff',
  cyanMuted: '#0098b3',
  cyanDim: 'rgba(0, 229, 255, 0.15)',
  cyanGlow: 'rgba(0, 229, 255, 0.4)',
  cyanBorder: 'rgba(0, 229, 255, 0.25)',

  // Secondary — Orange / Amber
  orange: '#ff8c00',
  orangeLight: '#ffab40',
  orangeDim: 'rgba(255, 140, 0, 0.15)',
  orangeGlow: 'rgba(255, 140, 0, 0.4)',
  orangeBorder: 'rgba(255, 140, 0, 0.25)',

  // Text
  textPrimary: '#e8ecf0',
  textSecondary: '#7a8fa6',
  textMuted: '#4a5a6e',

  // Borders
  border: 'rgba(0, 229, 255, 0.08)',
  borderLight: 'rgba(0, 229, 255, 0.15)',

  // Action colors
  green: '#00e676',
  greenDim: 'rgba(0, 230, 118, 0.15)',
  red: '#ff1744',
  redDim: 'rgba(255, 23, 68, 0.15)',
  purple: '#b388ff',
  gold: '#ffd740',

  // Poker table
  felt: 'radial-gradient(ellipse at 50% 48%, #0a3a4a 0%, #072d3d 35%, #052535 60%, #041e2c 80%, #031824 100%)',
  feltBorder: '#0a4a5e',

  // Misc
  scrollTrack: '#0a1020',
  scrollThumb: '#1a2a40',
};

export const glows = {
  cyan: '0 0 12px rgba(0, 229, 255, 0.3), 0 0 4px rgba(0, 229, 255, 0.15)',
  cyanStrong: '0 0 20px rgba(0, 229, 255, 0.5), 0 0 8px rgba(0, 229, 255, 0.3)',
  orange: '0 0 12px rgba(255, 140, 0, 0.3), 0 0 4px rgba(255, 140, 0, 0.15)',
  orangeStrong: '0 0 20px rgba(255, 140, 0, 0.5), 0 0 8px rgba(255, 140, 0, 0.3)',
  button: '0 4px 20px rgba(0, 229, 255, 0.25)',
};

export const gradients = {
  primaryButton: 'linear-gradient(135deg, #00b8d4, #0097a7)',
  secondaryButton: 'linear-gradient(135deg, #ff8c00, #e67600)',
  header: 'linear-gradient(180deg, #0a1020 0%, #0f1a2e 100%)',
};

// Font stack — Avenir everywhere (Nunito Sans as web fallback)
export const fonts = {
  heading: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
  body: "'Avenir', 'Avenir Next', 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
