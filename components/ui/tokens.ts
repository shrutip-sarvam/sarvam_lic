/**
 * Akshar design tokens — sourced directly from akshar-frontend (Tatva + globals.css).
 *
 * Font: Geist Sans (set as --font-sans in akshar-frontend/globals.css).
 * The Akshar web app falls back through the same stack when Matter is absent,
 * so Geist is what actually renders in production.
 *
 * Colors: Akshar orange #CB5534 on foreground #262626 over #FFFFFF.
 */

export const T = {
  bg: '#FFFFFF',
  bgSoft: '#FAFAFA',
  bgMuted: '#F5F5F5',
  bgCard: '#FFFFFF',

  border: '#E5E5E5',
  borderSoft: '#F0F0F0',
  borderStrong: '#D4D4D4',

  text: '#262626',
  textSoft: '#525252',
  textMuted: '#737373',
  textFaint: '#A3A3A3',

  orange: '#CB5534',
  orangeHover: '#E06C4D',
  orangeSoft: '#FFF1EC',
  orangeText: '#7A2F1A',

  blue: '#2563EB',
  blueSoft: '#EFF4FF',
  green: '#16A34A',
  greenSoft: '#E8F5ED',
  red: '#DC2626',
  redSoft: '#FDECEC',
  amber: '#D97706',
  amberSoft: '#FEF3E0',

  dark: '#171717',
  darkHover: '#262626',
} as const;

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const RADIUS = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

/**
 * Geist font-family names, matching the keys used in `useFonts` inside
 * `app/_layout.tsx`. Until the fonts finish loading `undefined` falls back
 * to the system sans-serif, which is exactly what Tatva does on the web.
 */
export const FONT_FAMILY = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
} as const;

/**
 * Typography ramp mirroring Tatva:
 *   heading-xl  32/700/-0.8
 *   heading-lg  24/700/-0.6
 *   heading-md  20/700/-0.4
 *   heading-sm  16/600/-0.2
 *   body-md     14/400
 *   body-sm     13/400
 *   body-xs     12/500
 */
export const FONT = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    fontFamily: FONT_FAMILY.bold,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    fontFamily: FONT_FAMILY.bold,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    fontFamily: FONT_FAMILY.semibold,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: FONT_FAMILY.regular,
  },
  bodyStrong: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: FONT_FAMILY.semibold,
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: FONT_FAMILY.regular,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
    fontFamily: FONT_FAMILY.semibold,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '500' as const,
    fontFamily: FONT_FAMILY.medium,
  },
};
