// Permissões de gestão por capacidade.
//
// A decisão de acesso vem SEMPRE do banco, por requisição — nunca do JWT nem do
// que o cliente mandou — para que revogar tenha efeito na próxima chamada.
// `is_admin` continua valendo como "todas as capacidades".
//
// Manter em sincronia com src/constants/permissoes.js (rótulos da interface).
// O backend é a autoridade: valor fora desta lista é sempre rejeitado.

export const CAPACIDADES = ['comunicados', 'plantao', 'usuarios', 'auditoria', 'ti']

/**
 * Resolve o acesso do usuário do JWT numa única consulta.
 * @returns {Promise<{isAdmin: boolean, permissoes: string[]}>} perfil inexistente = sem acesso
 */
export async function carregarAcesso(pool, usuarioId) {
    const { rows } = await pool.query(
        `SELECT p.is_admin,
                COALESCE(array_agg(u.permissao ORDER BY u.permissao)
                         FILTER (WHERE u.permissao IS NOT NULL), '{}') AS permissoes
         FROM usuarios_perfil p
         LEFT JOIN usuarios_permissoes u ON u.usuario_id = p.usuario_id
         WHERE p.usuario_id = $1
         GROUP BY p.usuario_id, p.is_admin`,
        [String(usuarioId ?? '')]
    )
    if (!rows.length) return { isAdmin: false, permissoes: [] }
    return { isAdmin: Boolean(rows[0].is_admin), permissoes: rows[0].permissoes }
}

// Gate de rota. `capacidade` ausente = só administrador (equivale ao adminAuth).
export function requerPermissao(pool, capacidade) {
    return async function permissaoMiddleware(req, res, next) {
        if (!req.usuario?.id) {
            return res.status(401).json({ sucesso: false, erro: 'Acesso não autorizado.' })
        }
        try {
            const acesso = await carregarAcesso(pool, req.usuario.id)
            const liberado = acesso.isAdmin || (capacidade && acesso.permissoes.includes(capacidade))
            if (!liberado) {
                return res.status(403).json({ sucesso: false, erro: 'Permissão negada.' })
            }
            req.acesso = acesso
            next()
        } catch (e) {
            // O detalhe fica no log; o cliente recebe um texto fixo.
            console.error('[permissoes] Falha ao consultar banco:', e.message)
            return res.status(503).json({ sucesso: false, erro: 'Serviço de autenticação temporariamente indisponível. Tente novamente.' })
        }
    }
}
