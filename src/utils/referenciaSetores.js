// Listas de referência de setores (cargos, departamentos), buscadas UMA vez e
// compartilhadas. Antes, só abrir o Início disparava 10 requisições para 3 rotas:
// o título do Início (resolveNomeSetor), o perfil da barra lateral (idem) e dois
// cartões (aniversariantes e disponibilidade) pediam as mesmas listas cada um por
// si. Aqui cada rota é consultada no máximo uma vez a cada 5 minutos; quem chega
// enquanto a primeira busca está em andamento recebe a mesma promessa.
//
// Falha não fica guardada: a próxima chamada tenta de novo.

const TTL_MS = 5 * 60 * 1000
const guardadas = new Map() // url -> { promessa, ate }

function ler(url, campo) {
  const agora = Date.now()
  const guardada = guardadas.get(url)
  if (guardada && guardada.ate > agora) return guardada.promessa

  const promessa = fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d && d.sucesso) return d[campo] || []
      guardadas.delete(url)
      return []
    })
    .catch(() => {
      guardadas.delete(url)
      return []
    })

  guardadas.set(url, { promessa, ate: agora + TTL_MS })
  return promessa
}

/** [{ id, setor }] — tabela empresa_setor (a que casa com id_departamento do funcionário). */
export const listarCargos = () => ler('/api/cargos', 'cargos')

/** [{ id, departamento }] — tabela departamento, usada só como reserva. */
export const listarDepartamentosEmpresa = () => ler('/api/departamentos-empresa', 'departamentos')

/** [{ id, setor }] — departamentos do IXC. */
export const listarDepartamentos = () => ler('/api/departamentos', 'departamentos')
