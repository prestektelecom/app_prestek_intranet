// cache.js — Cache em memória com TTL configur��vel
// Centraliza o cache de respostas da API IXC para evitar chamadas redundantes.
// Substitui o padrão ad-hoc de cacheOS que existia apenas para /api/os-chamados.

const _store = new Map(); // chave -> { data, expiresAt }

/**
 * Recupera um item do cache.
 * @param {string} key
 * @returns {{ hit: true, data: any } | { hit: false }}
 */
export function cacheGet(key) {
    const entry = _store.get(key);
    if (!entry) return { hit: false };
    if (Date.now() > entry.expiresAt) {
        _store.delete(key);
        return { hit: false };
    }
    return { hit: true, data: entry.data };
}

/**
 * Armazena um item no cache.
 * @param {string} key
 * @param {any} data
 * @param {number} ttlMs  Tempo de vida em milissegundos
 */
export function cacheSet(key, data, ttlMs) {
    _store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Remove um item específico do cache (útil após mutations).
 * @param {string} key
 */
export function cacheInvalidate(key) {
    _store.delete(key);
}

/**
 * Remove todos os itens cujas chaves começam com um prefixo.
 * @param {string} prefix
 */
export function cacheInvalidatePrefix(prefix) {
    for (const key of _store.keys()) {
        if (key.startsWith(prefix)) _store.delete(key);
    }
}

// TTLs padrão (ms) — podem ser sobrescritos via variáveis de ambiente
export const TTL = {
    SETORES:       parseInt(process.env.CACHE_TTL_SETORES      || '300')  * 1000, // 5 min
    COLABORADORES: parseInt(process.env.CACHE_TTL_COLABORADORES || '300')  * 1000, // 5 min
    TOP_VENDEDORES:parseInt(process.env.CACHE_TTL_TOP_VENDEDORES|| '600')  * 1000, // 10 min
    PLANOS:        parseInt(process.env.CACHE_TTL_PLANOS         || '300')  * 1000, // 5 min
    COBERTURA_IXC: parseInt(process.env.CACHE_TTL_COBERTURA      || '600')  * 1000, // 10 min
    OS_CHAMADOS:   parseInt(process.env.CACHE_TTL_OS             || '60')   * 1000, // 1 min
    GEOCODIFICAR:  86400 * 1000, // 24 horas — coordenadas de cidades não mudam
    // Índice de clientes usado pela cobertura para resolver o endereço herdado
    // (endereco_padrao_cliente = 'S'). Chave própria para que contratos-bairro
    // reaproveite sem depender do TTL do resultado montado.
    COBERTURA_CLIENTES: parseInt(process.env.CACHE_TTL_COBERTURA_CLIENTES || '600') * 1000, // 10 min
    IXC_UF:        86400 * 1000, // 24 horas — tabela de UF é estática
};
