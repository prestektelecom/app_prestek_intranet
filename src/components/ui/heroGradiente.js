// Gradiente dos heroes (Cobertura e Central de Vendas).
//
// ─── Por que a parada do meio é constante ────────────────────────────────────
// A versão anterior usava `C.accentDark` como parada intermediária. O nome do
// token descreve o papel que ele tem no tema CLARO; nos três temas escuros ele
// é o tom mais claro da rampa:
//
//   token         light      cyber      aurora     amoled
//   accentDeep    #7C2D12    #7C2D12    #9A3412    #7C2D12
//   accentDark    #C2410C    #FDBA74    #FDBA74    #FDBA74   ← inverte
//   accent        #EC7D23    #F97316    #FB923C    #F97316
//
// Resultado: a rampa deixava de ser monotônica (escuro → CLARO → médio) e
// jogava uma faixa pêssego no centro horizontal da caixa — exatamente onde
// ficam o campo de busca e o subtítulo abaixo de 2xl.
//
// Contraste do branco contra a parada do meio:
//   #FDBA74 → 1,71:1   (reprova WCAG AA por larga margem)
//   #C2410C → 5,18:1   (aprova AA para texto normal)
//
// #C2410C fica entre accentDeep e accent nas QUATRO paletas, então uma
// constante resolve os quatro temas sem condicional.
export const HERO_VIA = '#C2410C';

/**
 * Gradiente de base do hero. 120deg numa caixa larga e baixa é quase
 * horizontal, então as paradas mapeiam para posições horizontais.
 */
export const gradienteHero = (C) =>
    `linear-gradient(120deg, ${C.accentDeep} 0%, ${HERO_VIA} 55%, ${C.accent} 100%)`;

/**
 * Anéis concêntricos saindo do canto inferior-esquerdo, atrás do título.
 *
 * Substituem os dois `<div>` com `filter: blur()` que existiam antes e que
 * renderizavam quase inteiramente ATRÁS do painel escuro — duas camadas
 * compostas permanentes por quase nenhum pixel visível.
 *
 * Além de custar menos, a decoração passa a significar alguma coisa:
 * propagação de sinal, que é o assunto da página.
 */
export const aneisHero = () =>
    'radial-gradient(circle at 6% 132%,'
    + ' transparent 0 118px, rgba(255,255,255,.075) 118px 120px,'
    + ' transparent 120px 218px, rgba(255,255,255,.055) 218px 220px,'
    + ' transparent 220px 338px, rgba(255,255,255,.04) 338px 340px,'
    + ' transparent 340px)';

/** Fundo completo: anéis por cima da rampa. */
export const fundoHero = (C) => [aneisHero(), gradienteHero(C)].join(', ');
