import { useTheme } from './useTheme';

export const BENTO_LIGHT = {
  bg: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  accent: '#EC7D23',
  accentDark: '#C2410C',
  accentDeep: '#7C2D12',
  accentSoft: '#FFF7ED',
  cyan: '#FDBA74',
  // Categoria secundária (dados organizacionais/IXC, somente leitura) — precisa de um
  // hue realmente distinto do accent; `cyan` acima é a mesma família laranja e não serve.
  info: '#2563EB',
  // Terceira categoria (ex.: logs de auditoria) — mantém o roxo que já existia
  // hardcoded em alguns cards, só que agora reagindo a tema.
  violet: '#8B5CF6',
  ink: '#0B1B2E',
  ink2: '#475467',
  muted: '#8896A8',
  line: '#E4ECF5',
  lineSoft: '#EFF4FA',
  success: '#1F8A5B',
  successSoft: '#E6F4EC',
  // Amarelo, não âmbar: com o accent laranja da marca, um warning âmbar
  // (#D97706) virava o mesmo tom e "aviso" deixava de se distinguir de "destaque".
  warning: '#CA8A04',
  warningSoft: '#FEFCE8',
  danger: '#E84545',
  dangerSoft: '#FDEDED',
};

export const BENTO_DARK_CYBER = {
  bg: '#070B13',
  surface: 'rgba(17, 28, 44, 0.85)',
  surfaceSoft: '#111C2C',
  accent: '#F97316',
  accentDark: '#FDBA74',
  accentDeep: '#7C2D12',
  accentSoft: 'rgba(249, 115, 22, 0.12)',
  cyan: '#FDBA74',
  info: '#3B82F6',
  violet: '#A78BFA',
  ink: '#F5F9FF',
  ink2: '#8896A8',
  muted: '#8896A8',
  line: '#1E2E4A',
  lineSoft: '#111C2C',
  success: '#00F5D4',
  successSoft: 'rgba(0, 245, 212, 0.12)',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.12)',
  danger: '#FF2A54',
  dangerSoft: 'rgba(255, 42, 84, 0.12)',
};

export const BENTO_DARK_AURORA = {
  bg: '#0F0C20',
  surface: '#161233',
  surfaceSoft: '#1D1742',
  accent: '#FB923C',
  accentDark: '#FDBA74',
  accentDeep: '#9A3412',
  accentSoft: 'rgba(251, 146, 60, 0.15)',
  cyan: '#FDBA74',
  info: '#818CF8',
  violet: '#A78BFA',
  ink: '#F5F9FF',
  ink2: '#A398CD',
  muted: '#8896A8',
  line: '#2E2254',
  lineSoft: '#1D1742',
  success: '#00FF87',
  successSoft: 'rgba(0, 255, 135, 0.15)',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.15)',
  danger: '#FF007A',
  dangerSoft: 'rgba(255, 0, 122, 0.15)',
};

export const BENTO_DARK_AMOLED = {
  bg: '#000000',
  surface: '#0A0A0A',
  surfaceSoft: '#121212',
  accent: '#F97316',
  accentDark: '#FDBA74',
  accentDeep: '#7C2D12',
  accentSoft: 'rgba(249, 115, 22, 0.15)',
  cyan: '#FDBA74',
  info: '#3B82F6',
  violet: '#A78BFA',
  ink: '#FFFFFF',
  ink2: '#888888',
  muted: '#888888',
  line: '#222222',
  lineSoft: '#121212',
  success: '#00C853',
  successSoft: 'rgba(0, 200, 83, 0.15)',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.15)',
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
