// Aniversariantes dos próximos dias, calculados no servidor.
//
// Antes o navegador baixava /api/colaboradores (a lista INTEIRA, com a data de
// nascimento completa de todo mundo, ~60 KB e uma chamada de ~4,6 s ao IXC) só
// para achar 3 ou 4 pessoas. Aqui a lista nunca sai do servidor: o cliente recebe
// só quem faz aniversário na janela, com o dia do próximo aniversário e SEM o ano
// de nascimento.
//
// Funções puras (sem IXC, sem banco, sem relógio implícito) para o script
// scripts/testar-aniversariantes.mjs cobrir os casos de borda.

const DIA_MS = 86400000

/** Data de hoje (YYYY-MM-DD) no fuso de Brasília, que é o "hoje" da empresa. */
export function hojeEmSaoPaulo(agora = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(agora)
}

function partes(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''))
    if (!m) return null
    const [, a, mes, dia] = m
    const y = Number(a), mo = Number(mes), d = Number(dia)
    if (!mo || !d || mo > 12 || d > 31) return null
    return { y, mo, d }
}

const isoDe = (ms) => new Date(ms).toISOString().slice(0, 10)

/**
 * Próximo aniversário a partir de `hoje` (inclusive). `dataNascimento` e `hoje`
 * são 'YYYY-MM-DD'. Devolve { proximo: 'YYYY-MM-DD', dias } ou null se a data for
 * inválida. 29/02 em ano não bissexto cai em 01/03 (o mesmo que o front fazia).
 */
export function proximoAniversario(dataNascimento, hoje) {
    const nasc = partes(dataNascimento)
    const h = partes(hoje)
    if (!nasc || !h) return null
    const hojeMs = Date.UTC(h.y, h.mo - 1, h.d)
    let proximoMs = Date.UTC(h.y, nasc.mo - 1, nasc.d)
    if (proximoMs < hojeMs) proximoMs = Date.UTC(h.y + 1, nasc.mo - 1, nasc.d)
    return { proximo: isoDe(proximoMs), dias: Math.round((proximoMs - hojeMs) / DIA_MS) }
}

/**
 * Filtra os funcionários que fazem aniversário em até `dias` dias e devolve o
 * mínimo que a tela precisa, ordenado do mais próximo para o mais distante.
 * Não devolve data de nascimento nem e-mail.
 */
export function listarAniversariantes(funcionarios, { hoje, dias = 7 } = {}) {
    const lista = []
    for (const f of funcionarios || []) {
        const prox = proximoAniversario(f.data_nascimento, hoje)
        if (!prox || prox.dias > dias) continue
        lista.push({
            funcionario_id: f.id,
            funcionario_nome: f.funcionario,
            id_departamento: f.id_departamento ?? null,
            id_funcao: f.id_funcao ?? null,
            foto_perfil: f.foto_perfil ?? null,
            proximo: prox.proximo,
            dias: prox.dias,
        })
    }
    return lista.sort((a, b) => a.dias - b.dias || String(a.funcionario_nome).localeCompare(String(b.funcionario_nome), 'pt-BR'))
}

// ─── Busca (IXC + cache + fotos), com as dependências injetadas ───────────────
// A rota em server.js só repassa pool, ixcListar e o cache; assim este caminho
// inteiro roda em script contra o IXC e o banco reais (ver o teste ao vivo em
// scripts/testar-aniversariantes.mjs --ao-vivo), sem subir o servidor.

const TTL_MS = 10 * 60 * 1000
const STALE_MS = 60 * 60 * 1000
const CHAVE_CACHE = 'ixc:funcionarios-aniversario'
let emVoo = null

/**
 * Lista enxuta de funcionários ativos com data de nascimento. Fica em cache por
 * 10 min (1 h de janela stale se o IXC cair) e a busca em andamento é
 * compartilhada: uma rajada de acessos não vira N consultas ao IXC.
 */
export async function funcionariosParaAniversario({ ixcListar, cacheGet, cacheSet }) {
    const cache = cacheGet(CHAVE_CACHE)
    if (cache.hit && !cache.stale) return cache.data

    if (!emVoo) {
        emVoo = (async () => {
            const registros = await ixcListar('funcionarios', {
                qtype: 'funcionarios.ativo', query: 'S', oper: '=', rp: '1000', sortname: 'funcionarios.funcionario',
            })
            const enxutos = registros
                .filter(f => f.data_nascimento)
                .map(f => ({
                    id: f.id,
                    funcionario: f.funcionario,
                    email: f.email,
                    id_departamento: f.id_departamento,
                    id_funcao: f.id_funcao,
                    data_nascimento: String(f.data_nascimento).slice(0, 10),
                    // O IXC devolve um SVG padrão para quem nunca trocou a foto: não é foto.
                    foto_perfil: (typeof f.foto_perfil === 'string' && !f.foto_perfil.trim().startsWith('<svg')) ? f.foto_perfil : null,
                }))
            cacheSet(CHAVE_CACHE, enxutos, TTL_MS, STALE_MS)
            return enxutos
        })().finally(() => { emVoo = null })
    }

    try {
        return await emVoo
    } catch (err) {
        if (cache.hit) {
            console.warn('[aniversariantes] IXC indisponível, servindo cache vencido:', err.message)
            return cache.data
        }
        throw err
    }
}

/** Aniversariantes dos próximos `dias` dias (1 a 31), já com a foto trocada em Configurações. */
export async function buscarAniversariantes({ dias = 7, pool, ixcListar, cacheGet, cacheSet, agora = new Date() }) {
    const janela = Math.min(Math.max(Number.parseInt(dias, 10) || 7, 1), 31)
    const funcionarios = await funcionariosParaAniversario({ ixcListar, cacheGet, cacheSet })
    const lista = listarAniversariantes(funcionarios, { hoje: hojeEmSaoPaulo(agora), dias: janela })

    // Foto trocada em Configurações vence a do IXC. É opcional: se a consulta
    // falhar, a lista sai com a foto do IXC (ou sem foto) em vez de dar erro.
    const emailPorId = new Map(funcionarios.map(f => [String(f.id), String(f.email || '').toLowerCase()]))
    const emails = lista.map(a => emailPorId.get(String(a.funcionario_id))).filter(Boolean)
    const fotosLocais = {}
    if (emails.length) {
        try {
            const r = await pool.query(
                "SELECT lower(usuario_email) AS email, valor FROM usuarios_preferencias WHERE chave = 'avatarUrl' AND lower(usuario_email) = ANY($1::text[])",
                [emails]
            )
            r.rows.forEach(row => { if (row.valor) fotosLocais[row.email] = row.valor })
        } catch (e) {
            console.warn('[aniversariantes] fotos locais indisponíveis:', e.message)
        }
    }

    return lista.map(a => ({
        ...a,
        foto_perfil: fotosLocais[emailPorId.get(String(a.funcionario_id))] || a.foto_perfil,
    }))
}
