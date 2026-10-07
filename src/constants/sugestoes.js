// Rótulos do popup de sugestão. O BACKEND é a autoridade
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
