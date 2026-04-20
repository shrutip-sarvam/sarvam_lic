/**
 * Akshar design tokens — clean, minimal, Sarvam-orange accent.
 * Used across all screens for visual consistency.
 */

export const T = {
  // Surfaces
  bg: '#FFFFFF',
  bgSoft: '#FAFAFA',
  bgMuted: '#F5F5F7',
  bgCard: '#FFFFFF',

  // Borders
  border: '#E8E8E8',
  borderSoft: '#F0F0F0',
  borderStrong: '#D4D4D4',

  // Text
  text: '#0A0A0A',
  textSoft: '#4A4A4A',
  textMuted: '#8A8A8A',
  textFaint: '#B8B8B8',

  // Brand
  orange: '#E8612A',
  orangeSoft: '#FDE8DA',
  orangeText: '#8A3510',

  // Semantic
  blue: '#2563EB',
  blueSoft: '#EEF4FF',
  green: '#16A34A',
  greenSoft: '#E8F5ED',
  red: '#DC2626',
  redSoft: '#FDECEC',
  amber: '#D97706',
  amberSoft: '#FEF3E0',

  // Dark actions
  dark: '#0F0F0F',
  darkHover: '#1F1F1F',
} as const;

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const RADIUS = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;
export const FONT = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.4 },
  h3: { fontSize: 16, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2, textTransform: 'uppercase' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const },
};
