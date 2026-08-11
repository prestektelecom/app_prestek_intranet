import { BENTO_LIGHT } from '../../hooks/useBentoTheme';

// ─── Neumorfismo nos cinco temas ─────────────────────────────────────────────
//
// O efeito depende de uma condição que quase nunca é dita: a face do elemento
// precisa ter a MESMA cor do fundo atrás dele. É o par de sombras — uma escura
// no canto inferior-direito, uma clara no superior-esquerdo — que "estica" a
// superfície. Se a face for mais clara que o fundo, a sombra clara não tem
// contra o que contrastar e o relevo colapsa numa sombra comum.
//
// Por isso o card NÃO usa `C.surface`:
//
//   tema     bg         surface          face escolhida
//   light    #F5F9FF    #FFFFFF          bg      → neumorfismo canônico
//   cyber    #070B13    rgba(17,28,44)   surfaceSoft #111C2C
//   aurora   #0F0C20    #161233          surfaceSoft #1D1742
//   amoled   #000000    #0A0A0A          surfaceSoft #121212
//
// Nos temas escuros a face fica em `surfaceSoft` e não em `bg`, por um motivo
// concreto: o amoled tem `bg: #000000`, e sobre preto absoluto não existe
// "mais escuro". A sombra escura seria invisível e sobraria só o halo claro,
// que lê como brilho, não como relevo. Subindo a face um degrau, as duas
// sombras voltam a ter para onde ir.
export function neumorfismo(C) {
    const claro = C.bg === BENTO_LIGHT.bg;

    return {
        face: claro ? C.bg : C.surfaceSoft,
        // No claro a sombra escura é o azul-tinta da casa em baixa opacidade, e
        // não preto puro: preto sobre um fundo azulado suja o tom.
        escura: claro ? 'rgba(11, 27, 46, 0.13)' : 'rgba(0, 0, 0, 0.62)',
        clara: claro ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.055)',
        claro,
    };
}

/** Relevo para fora: o card e os botões em repouso. */
export function relevo(n, d = 12, b = 24) {
    return `${d}px ${d}px ${b}px ${n.escura}, -${d}px -${d}px ${b}px ${n.clara}`;
}

/** Relevo para dentro: o berço do avatar e o estado pressionado do botão. */
export function reentrancia(n, d = 6, b = 12) {
    return `inset ${d}px ${d}px ${b}px ${n.escura}, inset -${d}px -${d}px ${b}px ${n.clara}`;
}
