// Roda os MESMOS casos na regra do backend (equipe de um setor) e na do front
// (setores de uma pessoa) e falha se elas divergirem. Uso:
//   node scripts/testar-equipe-setor.mjs
import { aplicarAjustes } from '../backend/services/equipeSetor.js'
import { setoresDaPessoa, idCanonico as canonico } from '../src/utils/setoresDaPessoa.js'

// Funcionários ativos do "IXC": id → departamento
const F = [
  { id: '1', nome: 'Ana',   dep: '10' },  // Comercial
  { id: '2', nome: 'Bia',   dep: '10' },
  { id: '3', nome: 'Caio',  dep: '20' },  // TI
  { id: '4', nome: 'Duda',  dep: '13' },  // ATENDIMENTO
  { id: '5', nome: 'Edu',   dep: '15' },  // Suporte → ATENDIMENTO
  { id: '6', nome: 'Fabi',  dep: '68' },  // Relacionamento → ATENDIMENTO
  { id: '7', nome: 'Gabi',  dep: '' },    // sem setor
]
const ativosPorId = new Map(F.map((f) => [f.id, { id: f.id, funcionario: f.nome, id_departamento: f.dep }]))
const SETORES = ['10', '20', '13']

// Regra do IXC por setor, igual à de /api/setores (ATENDIMENTO absorve 15 e 68)
const baseDoSetor = (setor) => F.filter((f) => (setor === '13' ? ['13', '15', '68'].includes(f.dep) : f.dep === setor))
  .map((f) => ativosPorId.get(f.id))

const CASOS = [
  { nome: 'sem ajuste', ajustes: [] },
  { nome: 'incluir Ana em TI', ajustes: [{ id_setor: '20', id_funcionario: '1', acao: 'incluir' }] },
  { nome: 'excluir Caio do TI', ajustes: [{ id_setor: '20', id_funcionario: '3', acao: 'excluir' }] },
  { nome: 'excluir Edu (dep 15) do ATENDIMENTO', ajustes: [{ id_setor: '13', id_funcionario: '5', acao: 'excluir' }] },
  { nome: 'excluir Fabi (dep 68) do ATENDIMENTO', ajustes: [{ id_setor: '13', id_funcionario: '6', acao: 'excluir' }] },
  { nome: 'incluir Bia em dois setores', ajustes: [{ id_setor: '20', id_funcionario: '2', acao: 'incluir' }, { id_setor: '13', id_funcionario: '2', acao: 'incluir' }] },
  { nome: 'incluir quem já é do setor (sem efeito)', ajustes: [{ id_setor: '10', id_funcionario: '1', acao: 'incluir' }] },
  { nome: 'excluir quem não é do setor (sem efeito)', ajustes: [{ id_setor: '20', id_funcionario: '1', acao: 'excluir' }] },
  { nome: 'ajuste para pessoa inexistente', ajustes: [{ id_setor: '20', id_funcionario: '999', acao: 'incluir' }] },
  { nome: 'incluir quem não tem setor', ajustes: [{ id_setor: '10', id_funcionario: '7', acao: 'incluir' }] },
  { nome: 'incluir e excluir pessoas diferentes no mesmo setor', ajustes: [{ id_setor: '10', id_funcionario: '3', acao: 'incluir' }, { id_setor: '10', id_funcionario: '1', acao: 'excluir' }] },
]

let falhas = 0
for (const caso of CASOS) {
  for (const setor of SETORES) {
    // backend: quem é do setor
    const doSetor = caso.ajustes.filter((a) => a.id_setor === setor)
    const back = new Set(aplicarAjustes(baseDoSetor(setor), doSetor, ativosPorId).membros.map((m) => String(m.id)))
    // front: de quais setores cada pessoa é
    const front = new Set(F.filter((f) => setoresDaPessoa(f.dep, caso.ajustes.filter((a) => a.id_funcionario === f.id), canonico).includes(setor)).map((f) => f.id))
    const igual = back.size === front.size && [...back].every((id) => front.has(id))
    if (!igual) { falhas++; console.log('DIVERGE', caso.nome, '| setor', setor, '| backend', [...back].sort(), '| front', [...front].sort()) }
  }
}

// Casos com resultado esperado conhecido (não só "as duas concordam")
const esperar = (rotulo, obtido, esperado) => {
  const ok = JSON.stringify([...obtido].sort()) === JSON.stringify([...esperado].sort())
  if (!ok) { falhas++; console.log('ERRADO', rotulo, '| obtido', [...obtido].sort(), '| esperado', [...esperado].sort()) }
}
const eq = (setor, ajustes) => aplicarAjustes(baseDoSetor(setor), ajustes.filter((a) => a.id_setor === setor), ativosPorId).membros.map((m) => m.id)
esperar('TI base', eq('20', []), ['3'])
esperar('Ana incluída no TI', eq('20', CASOS[1].ajustes), ['3', '1'])
esperar('Caio excluído do TI', eq('20', CASOS[2].ajustes), [])
esperar('ATENDIMENTO base (13+15+68)', eq('13', []), ['4', '5', '6'])
esperar('Edu (15) excluído do ATENDIMENTO', eq('13', CASOS[3].ajustes), ['4', '6'])
esperar('Fabi (68) excluída do ATENDIMENTO', eq('13', CASOS[4].ajustes), ['4', '5'])
esperar('inexistente não entra', eq('20', CASOS[8].ajustes), ['3'])
const r = aplicarAjustes(baseDoSetor('20'), CASOS[1].ajustes, ativosPorId)
esperar('contadores: 1 incluído, 0 excluído', [r.incluidos, r.excluidos], [0, 1])
const r2 = aplicarAjustes(baseDoSetor('10'), CASOS[6].ajustes, ativosPorId)
esperar('incluir quem já é do setor não conta', [r2.incluidos], [0])
esperar('origem marcada', r.membros.map((m) => `${m.id}:${m.origem}`), ['3:ixc', '1:intranet'])
// a pessoa excluída de TODOS os setores dela
esperar('Caio sem setor após exclusão', setoresDaPessoa('20', [{ id_setor: '20', acao: 'excluir' }], canonico), [])
esperar('Duda em dois setores, principal primeiro', setoresDaPessoa('13', [{ id_setor: '20', acao: 'incluir' }], canonico), ['13', '20'])

console.log(falhas ? `\n${falhas} FALHA(S)` : `OK: ${CASOS.length} casos × ${SETORES.length} setores batem entre backend e front, mais as checagens de valor esperado`)
process.exit(falhas ? 1 : 0)
