import { useTheme } from './useTheme';

export const BENTO_LIGHT = {
  bg: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  accent: '#4A9EF5',
  accentDark: '#2D7BD4',
  accentDeep: '#1F5BA8',
  accentSoft: '#EAF4FF',
  cyan: '#7FD4E8',
  ink: '#0B1B2E',
  ink2: '#475467',
  muted: '#8896A8',
  line: '#E4ECF5',
  lineSoft: '#EFF4FA',
  success: '#1F8A5B',
  successSoft: '#E6F4EC',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#E84545',
  dangerSoft: '#FDEDED',
};

export const BENTO_DARK_CYBER = {
  bg: '#070B13',
  surface: 'rgba(17, 28, 44, 0.85)',
  surfaceSoft: '#111C2C',
  accent: '#00F2FE',
  accentDark: '#4A9EF5',
  accentDeep: '#1F5BA8',
  accentSoft: 'rgba(0, 242, 254, 0.12)',
  cyan: '#00F2FE',
  ink: '#F5F9FF',
  ink2: '#8896A8',
  muted: '#8896A8',
  line: '#1E2E4A',
  lineSoft: '#111C2C',
  success: '#00F5D4',
  successSoft: 'rgba(0, 245, 212, 0.12)',
  warning: '#FFB800',
  warningSoft: 'rgba(255, 184, 0, 0.12)',
  danger: '#FF2A54',
  dangerSoft: 'rgba(255, 42, 84, 0.12)',
};

export const BENTO_DARK_AURORA = {
  bg: '#0F0C20',
  surface: '#161233',
  surfaceSoft: '#1D1742',
  accent: '#8A2BE2',
  accentDark: '#A04DF0',
  accentDeep: '#521193',
  accentSoft: 'rgba(138, 43, 226, 0.15)',
  cyan: '#7FD4E8',
  ink: '#F5F9FF',
  ink2: '#A398CD',
  muted: '#8896A8',
  line: '#2E2254',
  lineSoft: '#1D1742',
  success: '#00FF87',
  successSoft: 'rgba(0, 255, 135, 0.15)',
  warning: '#FF6B00',
  warningSoft: 'rgba(255, 107, 0, 0.15)',
  danger: '#FF007A',
  dangerSoft: 'rgba(255, 0, 122, 0.15)',
};

export const BENTO_DARK_AMOLED = {
  bg: '#000000',
  surface: '#0A0A0A',
  surfaceSoft: '#121212',
  accent: '#4A9EF5',
  accentDark: '#7AB8F8',
  accentDeep: '#1F5BA8',
  accentSoft: 'rgba(74, 158, 245, 0.15)',
  cyan: '#7FD4E8',
  ink: '#FFFFFF',
  ink2: '#888888',
  muted: '#888888',
  line: '#222222',
  lineSoft: '#121212',
  success: '#00C853',
  successSoft: 'rgba(0, 200, 83, 0.15)',
  warning: '#FFD600',
  warningSoft: 'rgba(255, 214, 0, 0.15)',
  danger: '#D50000',
  dangerSoft: 'rgba(213, 0, 0, 0.15)',
};

export const BENTO_DARK = BENTO_DARK_CYBER; // Fallback export

function isDarkActive(theme) {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useBentoTheme() {
  const { theme, darkVariant } = useTheme();
  
  if (!isDarkActive(theme)) {
    return BENTO_LIGHT;
  }
  
  if (darkVariant === 'aurora') return BENTO_DARK_AURORA;
  if (darkVariant === 'amoled') return BENTO_DARK_AMOLED;
  return BENTO_DARK_CYBER;
}

export default useBentoTheme;
