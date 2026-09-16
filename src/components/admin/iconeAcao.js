// Mapa único de ícone/cor por tipo de ação de auditoria — compartilhado entre
// AdminDashboard.jsx (Atividades Recentes) e AdminAuditoria.jsx (histórico
// completo). As duas cópias locais já tinham divergido para `create_comunicado`
// (uma laranja, outra azul) antes desta unificação (achado ao vivo, Fase 15).
export const ICONE_ACAO = {
    grant_admin: { icon: 'verified_user', cor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    revoke_admin: { icon: 'person_off', cor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    update_comunicado: { icon: 'edit_document', cor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    create_comunicado: { icon: 'add_circle', cor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    delete_comunicado: { icon: 'delete', cor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    update_config: { icon: 'settings', cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
};

export const ICONE_ACAO_PADRAO = { icon: 'info', cor: 'bg-gray-100 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400' };

export function iconeParaAcao(acao) {
    return ICONE_ACAO[acao] || ICONE_ACAO_PADRAO;
}

export default ICONE_ACAO;
