// Design tokens. Every screen pulls from here — adjust look centrally, not
// per-component. Palette is intentionally secular (no religious motifs).

export const COLORS = {
  // Brand green
  primary: '#00B14F',
  primaryDark: '#009644',   // pressed states
  primaryDeep: '#00753A',   // text/icons on light-green surfaces
  primaryLight: '#E4F8ED',  // filled surfaces, chips
  primarySurface: '#F1FBF5',// faint tint for large fills

  // Accent
  secondary: '#FF7A1A',
  secondaryDark: '#E5670A',
  secondaryLight: '#FFF1E6',

  // Neutrals / surfaces
  background: '#F5F7F9',     // app canvas
  card: '#FFFFFF',
  surfaceAlt: '#F0F2F5',     // inputs, chips
  white: '#FFFFFF',
  black: '#000000',

  // Text
  text: '#0F1B2D',          // near-black, slightly cool
  textMuted: '#667085',
  textLight: '#98A2B3',

  // Lines
  border: '#EAECF0',
  borderStrong: '#D7DCE3',

  // Status
  danger: '#EF4444',
  dangerLight: '#FEECEC',
  success: '#16A34A',
  successLight: '#E4F8ED',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#E7F0FE',

  overlay: 'rgba(15,27,45,0.55)',
  // White-on-brand overlays -- circular buttons/badges sitting on a solid
  // COLORS.primary header (close buttons, hero avatar ring, etc).
  overlayOnBrandSubtle: 'rgba(255,255,255,0.18)',
  overlayOnBrandLight: 'rgba(255,255,255,0.2)',
  overlayOnBrandMedium: 'rgba(255,255,255,0.35)',
  overlayOnBrandStrong: 'rgba(255,255,255,0.85)',
  textOnBrandMuted: 'rgba(255,255,255,0.8)',
  textOnBrandFaint: 'rgba(255,255,255,0.7)',
  overlayDarkSubtle: 'rgba(0,0,0,0.25)',
  warningDark: '#92610A',
  warningBorder: '#FBE3A1',
  violet: '#8B5CF6',
};

// Avatar/chip colors — all pass contrast on white.
export const AVATAR_COLORS = [
  '#00B14F', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#14B8A6', '#EF4444', '#6366F1',
];

export const FONTS = {
  regular: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    xxl: 27,
    xxxl: 34,
    display: 40,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F1B2D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1B2D',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0F1B2D',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  // Green-tinted shadow for primary buttons / hero surfaces
  brand: {
    shadowColor: '#00B14F',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
};
