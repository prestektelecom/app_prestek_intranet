// ─── Fonte única de verdade para classificação e parsing de planos ────────────
//
// Antes desta util, três lugares discordavam entre si:
//   - PlanoBentoCard decidia PJ por includes('PJ') || includes('JURIDICA')
//   - ServicesDirectory filtrava por 'P. JURIDICA' / 'P JURIDICA'
//   - ServiceDetailModal considerava "mais vendido" com vendas > 5
// Resultado: um plano com "PJ" no nome ganhava o badge PJ mas caía na aba PF.

export const CATEGORIA = {
    PF: 'PF',
    PJ: 'PJ',
    LINK: 'Link',
};

/**
 * Classifica o plano em PF / PJ / Link a partir da descrição.
 * Link tem precedência sobre PJ: um "LINK DEDICADO (P. JURIDICA)" é Link,
 * senão apareceria nas duas abas ao mesmo tempo.
 */
export function classificarPlano(descricao = '') {
    const desc = String(descricao || '').toUpperCase();
    if (desc.includes('LINK')) return CATEGORIA.LINK;
    if (desc.includes('PJ') || desc.includes('JURIDICA')) return CATEGORIA.PJ;
    return CATEGORIA.PF;
}

export const isPJ = (descricao) => classificarPlano(descricao) === CATEGORIA.PJ;
export const isLink = (descricao) => classificarPlano(descricao) === CATEGORIA.LINK;
export const isPF = (descricao) => classificarPlano(descricao) === CATEGORIA.PF;

/**
 * Piso usado para normalizar a barra de vendas quando o mês está no começo
 * e todo mundo tem número baixo.
 */
export const VENDAS_FLOOR = 10;

/** Um plano é "mais vendido" se puxa pelo menos 60% do topo do mês. */
export function isTopSeller(vendas, maxVendas) {
    const v = Number(vendas) || 0;
    if (v <= 0) return false;
    return v >= Math.max(Number(maxVendas) || 0, VENDAS_FLOOR) * 0.6;
}

/** Percentual (0-100) da barra de vendas. */
export function vendasRatio(vendas, maxVendas) {
    const v = Number(vendas) || 0;
    const max = Math.max(Number(maxVendas) || 0, VENDAS_FLOOR);
    return Math.min((v / max) * 100, 100);
}

/**
 * Extrai a velocidade em Mbps do nome do plano.
 * Ex: "500 MEGA + WATCH - AL" → 500
 */
export function parseVelocidade(descricao = '') {
    const match = String(descricao || '').match(/(\d+)\s*MEGA/i);
    return match ? parseInt(match[1], 10) : null;
}

export const STREAMING_KEYWORDS = ['WATCH', 'PARAMOUNT', 'MAX', 'PREMIERE', 'ITTV', 'LEVEDUCA', 'NETFLIX', 'DISNEY', 'STAR', 'HBO'];

/**
 * Extrai palavras-chave de streaming do nome do plano.
 * Ex: "500 MEGA + WATCH + PARAMOUNT + ITTV 32c - AL" → ["WATCH", "PARAMOUNT", "ITTV"]
 */
export function parseStreaming(descricao = '') {
    const upper = String(descricao || '').toUpperCase();
    return STREAMING_KEYWORDS.filter(kw => upper.includes(kw));
}
