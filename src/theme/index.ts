export const Colors = {
  // Backgrounds
  bg:         '#0A0B0F',
  surface:    '#131620',
  card:       '#1C1F2E',
  cardAlt:    '#161924',
  border:     '#252A3D',
  borderLight:'#2E3348',

  // Brand
  accent:     '#00C896',
  accentDark: '#00A67D',
  accentGlow: 'rgba(0,200,150,0.15)',
  purple:     '#7B6EF6',
  purpleGlow: 'rgba(123,110,246,0.15)',

  // Semantic
  success:    '#00C896',
  danger:     '#FF4757',
  dangerGlow: 'rgba(255,71,87,0.15)',
  warning:    '#FFD93D',
  info:       '#4FC3F7',

  // Text
  text:       '#FFFFFF',
  textMuted:  '#8B9299',
  textDim:    '#4A5060',

  // Gradients (used as arrays)
  gradientBlue:   ['#1A2744', '#0D1B35'] as const,
  gradientGreen:  ['#0D2B22', '#071A15'] as const,
  gradientPurple: ['#1E1A3A', '#110E28'] as const,
  gradientCard:   ['#1C1F2E', '#131620'] as const,
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 9999,
};

export const Font = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  hero: 36,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};
