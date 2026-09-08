import { useTheme } from './useTheme';

// Objetos de tema consumidos por `C = useBentoTheme()`. Espelham as variáveis
// CSS de `index.css` (`:root`, `.dark`, `.dark-cyber`, `.dark-aurora`,
// `.dark-amoled`); quando mudar um lado, mude o outro.
//
// Papéis que todo objeto precisa ter:
// - `popover`: fundo OPACO para dropdowns, popups e sheets. `surface` pode ser
//   translúcida (Cyber) e deixava o conteúdo vazar por trás dos overlays.
// - `*Strong`: variante de texto dos semânticos. No claro, `success`/`warning`/
//   `danger` passam nos 3:1 de componente mas reprovam nos 4,5:1 de texto sobre
//   os fundos `-Soft`; nos escuros o próprio tom base já passa, exceto o
//   vermelho do AMOLED, que fica escuro demais sobre preto.

export const BENTO_LIGHT = {
  bg: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  popover: '#FFFFFF',
  // Scrim atrás de sheets e modais. Navy translúcido no claro, preto nos escuros.
  scrim: 'rgba(11, 27, 46, 0.5)',
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
  successStrong: '#10603E',
  // Amarelo, não âmbar: com o accent laranja da marca, um warning âmbar
  // (#D97706) virava o mesmo tom e "aviso" deixava de se distinguir de "destaque".
  warning: '#CA8A04',
  warningSoft: '#FEFCE8',
  warningStrong: '#7A5300',
  danger: '#E84545',
  dangerSoft: '#FDEDED',
  dangerStrong: '#B02121',
  // Texto sobre os preenchimentos semânticos (badges): branco sobre vermelho,
  // navy sobre amarelo. Iguais nos cinco temas de propósito.
  onDanger: '#FFFFFF',
  onWarning: '#0B1B2E',
};

// Default Dark: o bloco `.dark` do index.css sem sufixo. Sóbrio, superfícies
// opacas, sucesso verde (não ciano). É o escuro padrão de quem nunca escolheu
// variante.
export const BENTO_DARK_DEFAULT = {
  bg: '#070B13',
  surface: '#111C2C',
  surfaceSoft: '#0B121F',
  popover: '#111C2C',
  scrim: 'rgba(0, 0, 0, 0.6)',
  accent: '#F97316',
  accentDark: '#FDBA74',
  accentDeep: '#7C2D12',
  accentSoft: 'rgba(249, 115, 22, 0.15)',
  cyan: '#FDBA74',
  info: '#3B82F6',
  violet: '#A78BFA',
  ink: '#F5F9FF',
  ink2: '#8896A8',
  muted: '#8896A8',
  line: '#1E2E4A',
  lineSoft: '#111C2C',
  success: '#2DB37F',
  successSoft: 'rgba(45, 179, 127, 0.15)',
  successStrong: '#2DB37F',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.15)',
  warningStrong: '#FACC15',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.15)',
  dangerStrong: '#FF6B6B',
  onDanger: '#FFFFFF',
  onWarning: '#0B1B2E',
};

export const BENTO_DARK_CYBER = {
  bg: '#070B13',
  surface: 'rgba(17, 28, 44, 0.85)',
  surfaceSoft: '#111C2C',
  popover: '#111C2C',
  scrim: 'rgba(0, 0, 0, 0.6)',
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
  successStrong: '#00F5D4',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.12)',
  warningStrong: '#FACC15',
  danger: '#FF2A54',
  dangerSoft: 'rgba(255, 42, 84, 0.12)',
  dangerStrong: '#FF2A54',
  onDanger: '#FFFFFF',
  onWarning: '#0B1B2E',
};

export const BENTO_DARK_AURORA = {
  bg: '#0F0C20',
  surface: '#161233',
  surfaceSoft: '#1D1742',
  popover: '#1D1742',
  scrim: 'rgba(0, 0, 0, 0.6)',
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
  successStrong: '#00FF87',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.15)',
  warningStrong: '#FACC15',
  danger: '#FF007A',
  dangerSoft: 'rgba(255, 0, 122, 0.15)',
  dangerStrong: '#FF4DA0',
  onDanger: '#FFFFFF',
  onWarning: '#0B1B2E',
};

export const BENTO_DARK_AMOLED = {
  bg: '#000000',
  surface: '#0A0A0A',
  surfaceSoft: '#121212',
  popover: '#0A0A0A',
  scrim: 'rgba(0, 0, 0, 0.7)',
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
  successStrong: '#00C853',
  warning: '#FACC15',
  warningSoft: 'rgba(250, 204, 21, 0.15)',
  warningStrong: '#FACC15',
  danger: '#D50000',
  dangerSoft: 'rgba(213, 0, 0, 0.15)',
  // #D50000 sobre #0A0A0A dá 3,9:1; como texto ("Sair da conta") precisa mais.
  dangerStrong: '#FF5252',
  onDanger: '#FFFFFF',
  onWarning: '#0B1B2E',
};

export const BENTO_DARK = BENTO_DARK_DEFAULT; // Fallback export

// Lista para seletores de variante. Nomes iguais aos do DESIGN.md.
export const DARK_VARIANTS = [
  { id: 'default', label: 'Default Dark',      theme: BENTO_DARK_DEFAULT },
  { id: 'cyber',   label: 'Cyber-Obsidian',    theme: BENTO_DARK_CYBER },
  { id: 'aurora',  label: 'Deep-Space Aurora', theme: BENTO_DARK_AURORA },
  { id: 'amoled',  label: 'AMOLED',            theme: BENTO_DARK_AMOLED },
];

export function isDarkActive(theme) {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function darkThemeFor(darkVariant) {
  if (darkVariant === 'cyber') return BENTO_DARK_CYBER;
  if (darkVariant === 'aurora') return BENTO_DARK_AURORA;
  if (darkVariant === 'amoled') return BENTO_DARK_AMOLED;
  return BENTO_DARK_DEFAULT;
}

export function useBentoTheme() {
  const { theme, darkVariant } = useTheme();
  if (!isDarkActive(theme)) return BENTO_LIGHT;
  return darkThemeFor(darkVariant);
}

export default useBentoTheme;
