export const COLORS = {
  primary: '#1A1A2E',
  accent: '#E94560',
  surface: '#F8F9FA',
  indigo: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  grey: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    text: '#F8F9FA',
    border: '#2D2D44',
  },
} as const;

export const BLOCK_TYPE_COLORS: Record<string, string> = {
  HEADER: '#7C3AED',
  HEADLINE: '#E94560',
  PARAGRAPH: '#2563EB',
  TABLE: '#EA580C',
  FOOTNOTE: '#6B7280',
  IMAGE: '#10B981',
  AD: '#CA8A04',
  SECTION_TITLE: '#4F46E5',
  PAGE_NO: '#9CA3AF',
  SUB_HEADLINE: '#DC2626',
};

export const SCRIPT_FAMILY_COLORS: Record<string, string> = {
  devanagari: '#2563EB',
  dravidian: '#10B981',
  eastern: '#7C3AED',
  'perso-arabic': '#EA580C',
  other: '#6B7280',
};
