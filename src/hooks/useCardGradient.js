import { useBentoTheme, BENTO_LIGHT } from './useBentoTheme';
import { tone } from '../utils/tone';

// Resolve o gradiente de um card a partir do tema ativo.
//
// Antes, GRADIENT_VARIANTS trazia hex fixo com um único par `dark:`. Como o
// projeto tem 5 temas (light, dark, cyber, aurora, amoled), os cards ignoravam
// a escolha do usuário e ficavam idênticos nas três variantes escuras.
//
// Aqui cada variante pública aponta para um token que o próprio tema já define,
// então `blue` vira ciano no cyber e violeta no aurora sem tabela por tema.
const VARIANT_TOKEN = {
    blue: 'accent',
    green: 'success',
    orange: 'warning',
    rose: 'danger',
    purple: 'accentDeep',
    gray: 'ink2',
};

// tone() só entende hex; os tokens mapeados acima são hex em todos os temas,
// mas um token novo poderia não ser — melhor degradar do que quebrar o card.
function safeTone(color, alpha) {
    return typeof color === 'string' && color.startsWith('#') ? tone(color, alpha) : color;
}

export function useCardGradient(variant = 'gray') {
    const C = useBentoTheme();
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const base = C[VARIANT_TOKEN[variant] || VARIANT_TOKEN.gray];

    // Alfas mais altos no escuro porque a mesma tinta rende menos sobre fundo escuro.
    const [a1, a2, a3, aBorder] = isDark ? [0.24, 0.10, 0.30, 0.40] : [0.18, 0.10, 0.26, 0.35];

    return {
        isDark,
        base,
        style: {
            // surfaceSoft é opaco nos 5 temas; surface é translúcido no cyber e
            // deixaria o fundo da página vazar através do gradiente.
            backgroundColor: C.surfaceSoft,
            backgroundImage: `linear-gradient(135deg, ${safeTone(base, a1)} 0%, ${safeTone(base, a2)} 55%, ${safeTone(base, a3)} 100%)`,
            borderColor: safeTone(base, aBorder),
            color: C.ink,
        },
    };
}

export default useCardGradient;
