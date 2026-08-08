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
    // TTL longo de propósito: são ~48 mil registros e a coleta domina a latência
    // do request frio. Endereço de cliente muda raramente, então pagar isso a
    // cada 6h em vez de a cada 10 min não custa atualidade relevante.
    COBERTURA_CLIENTES: parseInt(process.env.CACHE_TTL_COBERTURA_CLIENTES || '21600') * 1000, // 6 horas
    IXC_UF:        86400 * 1000, // 24 horas — tabela de UF é estática
    // Tabela de cidades inteira, puxada de uma vez para servir o type-ahead do
    // cadastro de colaborador em memória. Mesmo motivo do IXC_UF: é cadastro
    // estático, e o custo aqui é um request frio lento por dia em troca de zero
    // chamada ao IXC por tecla digitada.
    IXC_CIDADES:   86400 * 1000, // 24 horas — cadastro de cidades é estático
    // Listas de referência do cadastro de colaborador. TTL longo porque o request
    // frio custa ~20s: três das cinco listas são derivadas de varreduras
    // completas (funcionarios, usuarios, planejamento_analitico). São cadastros
    // que mudam quando alguém é contratado, não de minuto em minuto.
    TI_TAXONOMIAS: parseInt(process.env.CACHE_TTL_TI_TAXONOMIAS || '21600') * 1000, // 6 horas
};
