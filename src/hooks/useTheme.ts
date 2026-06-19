// Re-exporta useTheme e tipos do ThemeContext global
// Isso garante compatibilidade com todos os componentes que importam de './useTheme'
export { useTheme } from '../contexts/ThemeContext';
export type { Theme, DarkVariant } from '../contexts/ThemeContext';
