// Capacidades de gestão que um administrador pode conceder a outro usuário.
//
// O BACKEND é a autoridade (backend/middleware/permissoes.js, `CAPACIDADES`):
// ele rejeita qualquer valor fora da lista dele. Esta cópia só dá rótulo e
// descrição à interface — manter os ids em sincronia. Um id que o backend
// conheça e esta lista não vira "capacidade sem rótulo" e não é atribuível
// pela tela, mas nada quebra.
//
// `is_admin` vale como todas as capacidades e nunca aparece aqui.

export const CAPACIDADES = [
  { id: 'comunicados', rotulo: 'Comunicados', descricao: 'Criar, editar e excluir comunicados.' },
  { id: 'plantao', rotulo: 'Plantões', descricao: 'Criar e excluir escalas e exportar o histórico.' },
  { id: 'usuarios', rotulo: 'Usuários e responsáveis', descricao: 'Ver a lista de usuários e definir responsáveis, grupos e descrições de setor.' },
  { id: 'auditoria', rotulo: 'Auditoria', descricao: 'Consultar o registro de ações administrativas.' },
  { id: 'ti', rotulo: 'TI', descricao: 'Usar o cadastro de colaborador e as ferramentas de TI.' },
]

const ROTULO_POR_ID = Object.fromEntries(CAPACIDADES.map((c) => [c.id, c.rotulo]))

// Nome legível de uma capacidade; um id desconhecido aparece como veio.
export function rotuloCapacidade(id) {
  return ROTULO_POR_ID[id] ?? id
}

// Sessões salvas antes desta mudança não têm `permissoes`.
export function normalizarUsuario(usuario) {
  if (!usuario || typeof usuario !== 'object') return usuario
  return { ...usuario, permissoes: Array.isArray(usuario.permissoes) ? usuario.permissoes : [] }
}
