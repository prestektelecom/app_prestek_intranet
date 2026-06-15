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

export const BENTO_DARK = {
  bg: '#0B1B2E',
  surface: '#0F1724',
  surfaceSoft: '#162231',
  accent: '#4A9EF5',
  accentDark: '#7AB8F8',
  accentDeep: '#1F5BA8',
  accentSoft: 'rgba(74, 158, 245, 0.15)',
  cyan: '#7FD4E8',
  ink: '#F5F9FF',
  ink2: '#8896A8',
  muted: '#8896A8',
  line: '#1E3A5F',
  lineSoft: '#162231',
  success: '#2DB37F',
  successSoft: 'rgba(45, 179, 127, 0.15)',
  warning: '#F5A623',
  warningSoft: 'rgba(245, 166, 35, 0.15)',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.15)',
};

function isDarkActive(theme) {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useBentoTheme() {
  const { theme } = useTheme();
  return isDarkActive(theme) ? BENTO_DARK : BENTO_LIGHT;
}

export default useBentoTheme;
