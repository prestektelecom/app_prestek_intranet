/**
 * Camadas de z-index do Prestek Intranet.
 *
 * Referência: DESIGN.md §6 + index.css (comentário Z-INDEX).
 * Nunca use um número arbitrário — sempre use estas constantes.
 *
 * Uso: import { Z } from '../constants/zIndex'
 *       <div style={{ zIndex: Z.CHROME }}>  (inline)
 *       <div className="z-[var(--z-chrome)]">    (Tailwind, se definir --z-* no :root)
 *
 * Para Tailwind com classe arbitrária + constante:
 *   <div className={`z-[${Z.MODAL}]`}>
 *   ou <div style={{ zIndex: Z.MODAL }}>
 */

export const Z = {
  /** Base (padrão, sem z-index) */
  BASE: 0,

  /** Conteúdo elevado — badges, chips sobre cards */
  ELEVATED: 10,

  /** Controles flutuantes leves — tooltips, dropdowns, toasts */
  FLOATING: 20,

  /** Headers/abas sticky internos de página */
  STICKY: 100,

  /** Overlays de mapa — acima do conteúdo, abaixo do chrome global */
  MAP: 500,

  /* ── Chrome global (1000-1050) ─────────────────────────────── */

  /** Chrome global — Header, Sidebar, MobileBottomNav, CoverageMap */
  CHROME: 1000,

  /** Elementos que sobem sobre o chrome — MobileMoreSheet */
  CHROME_PLUS: 1001,

  /** Toolbars flutuantes — DirectoryToolbar */
  TOOLBAR: 1050,

  /* ── Drawers, Modais e Overlays (1100+) ────────────────────── */

  /** Drawers e modais — MobileDrawer, OverrideModal, TiSupportModal */
  MODAL: 1100,

  /** Modal sobre modal — ServicesDirectory */
  MODAL_PLUS: 1110,

  /** Toasts sobre modais — ServicesDirectory, CadastroColaborador */
  MODAL_TOP: 1120,

  /* ── Crítico ───────────────────────────────────────────────── */

  /** Alertas críticos / toasts — acima de TUDO */
  TOAST: 9999,
}