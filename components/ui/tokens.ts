/**
 * Akshar design tokens — sourced from akshar-frontend (Tatva).
 * Primary orange: #cb5534, foreground #262626, on #FFFFFF.
 */

export const T = {
  // Surfaces (Akshar light)
  bg: '#FFFFFF',
  bgSoft: '#FAFAFA',
  bgMuted: '#F5F5F5',
  bgCard: '#FFFFFF',

  // Borders (neutral-200/100)
  border: '#E5E5E5',
  borderSoft: '#F0F0F0',
  borderStrong: '#D4D4D4',

  // Text (Akshar foreground + neutral ramp)
  text: '#262626',
  textSoft: '#525252',
  textMuted: '#737373',
  textFaint: '#A3A3A3',

  // Brand (Akshar orange, exact)
  orange: '#CB5534',
  orangeHover: '#E06C4D',
  orangeSoft: '#FFF1EC',
  orangeText: '#7A2F1A',

  // Semantic (Tatva-equivalent)
  blue: '#2563EB',
  blueSoft: '#EFF4FF',
  green: '#16A34A',
  greenSoft: '#E8F5ED',
  red: '#DC2626',
  redSoft: '#FDECEC',
  amber: '#D97706',
  amberSoft: '#FEF3E0',

  // Dark actions (neutral-900)
  dark: '#171717',
  darkHover: '#262626',
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
