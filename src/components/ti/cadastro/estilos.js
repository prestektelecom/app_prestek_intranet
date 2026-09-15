// Classes compartilhadas da ferramenta de cadastro.
//
// São cópias literais de padrões que já existem no projeto, com a origem
// anotada. Copiar em vez de importar de coverage/ e services/ é deliberado:
// acoplar a aba TI a duas features não relacionadas por causa de meia dúzia de
// strings custaria mais do que a duplicação.

// de src/components/coverage/OverrideModal.jsx — variante DENSA.
// O FIELD_CLASS do ModalShell (px-4 py-2, text-base) é para modal de uma
// coluna; num grid de três colunas ele estoura.
export const CAMPO =
    'w-full min-h-[44px] rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export const ROTULO =
    'block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint';

// de src/components/services/modals/ModalShell.jsx
export const HINT = 'mt-1 text-xs text-faint';

// Mensagem de erro de validação — precisa ser visualmente distinta de uma
// dica neutra (HINT), não só ter o contraste corrigido. Reaproveita a mesma
// família de vermelho já usada em DryRunResultado.jsx nesta mesma ferramenta.
export const HINT_ERRO = 'mt-1 text-xs font-semibold text-red-600 dark:text-red-400';

// Gradiente escurecido: #9A3412->#EC7D23 reprovava contraste com texto branco
// na ponta clara (7,31:1 -> 2,79:1, medido ao vivo). #7C2D12/#C2410C são os
// dois tons mais escuros da mesma rampa (já usados juntos em FAIXA, abaixo)
// e mantêm o texto branco acima de 4,5:1 em toda a extensão do degradê.
export const BTN_PRIMARIO =
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C2D12] to-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70';

export const BTN_SECUNDARIO =
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-faint transition-all hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export const CARD = 'overflow-hidden rounded-2xl border border-border bg-surface';

// Faixa de gradiente de 4px no topo do card — padrão de Configuracoes.jsx.
export const FAIXA = 'h-1 w-full bg-gradient-to-r from-[#7C2D12] via-[#C2410C] to-[#EC7D23]';

// Skeleton de campo. O projeto prefere esqueleto a spinner (PlansGrid.jsx).
export const SKELETON_CAMPO = 'h-[44px] w-full animate-pulse rounded-xl bg-surface-raised';

// Anéis de atenção por nível de confiança da extração.
export const RING_DUVIDA = 'ring-1 ring-inset ring-amber-400/60';
export const RING_ERRO = 'ring-1 ring-inset ring-red-400/60';

// Avisos inline — padrão de Coverage.jsx (âmbar) com suporte a tema escuro.
export const AVISO_AMBAR =
    'flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] leading-snug text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-200';

export const AVISO_ERRO =
    'flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-[12.5px] font-semibold leading-snug text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400';

export const AVISO_INFO =
    'flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[12.5px] leading-snug text-faint';
