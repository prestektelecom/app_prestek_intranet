// Rótulos da caixa de sugestões. O BACKEND é a autoridade
// (backend/services/sugestoes.js): ids e limites precisam ficar em sincronia,
// scripts/testar-sugestoes.mjs compara os dois lados.

export const TIPOS = [
  { id: 'melhoria', rotulo: 'Melhoria', dica: 'Algo que já existe e pode ficar melhor' },
  { id: 'ideia', rotulo: 'Ideia', dica: 'Uma funcionalidade nova' },
  { id: 'problema', rotulo: 'Problema', dica: 'Algo que atrapalha ou não funciona' },
]

export const STATUS = [
  { id: 'nova', rotulo: 'Nova', tom: 'neutro' },
  { id: 'em_analise', rotulo: 'Em análise', tom: 'aviso' },
  { id: 'planejada', rotulo: 'Planejada', tom: 'destaque' },
  { id: 'concluida', rotulo: 'Concluída', tom: 'sucesso' },
  { id: 'recusada', rotulo: 'Recusada', tom: 'perigo' },
]

export const LIMITES = {
  titulo: { min: 3, max: 120 },
  descricao: { min: 10, max: 2000 },
  resposta: { max: 500 },
  porDia: 5,
}

const POR_ID = (lista) => Object.fromEntries(lista.map((i) => [i.id, i]))
const TIPO_POR_ID = POR_ID(TIPOS)
const STATUS_POR_ID = POR_ID(STATUS)

export const rotuloTipo = (id) => TIPO_POR_ID[id]?.rotulo ?? id
export const infoStatus = (id) => STATUS_POR_ID[id] ?? { id, rotulo: id, tom: 'neutro' }

// Gestor = admin ou quem recebeu a capacidade `sugestoes`.
export function podeGerirSugestoes(user) {
  return Boolean(user?.is_admin) || (Array.isArray(user?.permissoes) && user.permissoes.includes('sugestoes'))
}
