// Regras da caixa de sugestões, sem acesso a banco para poderem ser testadas
// em scripts/testar-sugestoes.mjs. Manter os limites em sincronia com
// src/constants/sugestoes.js (rótulos e contadores da interface).

export const TIPOS = ['melhoria', 'ideia', 'problema']
export const STATUS = ['nova', 'em_analise', 'planejada', 'concluida', 'recusada']

export const LIMITES = {
    titulo: { min: 3, max: 120 },
    descricao: { min: 10, max: 2000 },
    resposta: { max: 500 },
    porDia: 5,
}

const texto = (v) => (typeof v === 'string' ? v.trim() : '')

/**
 * Valida o corpo de um envio. Devolve `{ erro, campo }` ou `{ dados }`.
 * A autoria nunca vem daqui: quem chama usa `req.usuario`.
 */
export function validarEnvio(corpo) {
    const tipo = texto(corpo?.tipo)
    const titulo = texto(corpo?.titulo)
    const descricao = texto(corpo?.descricao)

    if (!TIPOS.includes(tipo)) return { erro: 'Escolha o tipo da sugestão.', campo: 'tipo' }
    if (titulo.length < LIMITES.titulo.min || titulo.length > LIMITES.titulo.max) {
        return { erro: `O título precisa ter de ${LIMITES.titulo.min} a ${LIMITES.titulo.max} caracteres.`, campo: 'titulo' }
    }
    if (descricao.length < LIMITES.descricao.min || descricao.length > LIMITES.descricao.max) {
        return { erro: `A descrição precisa ter de ${LIMITES.descricao.min} a ${LIMITES.descricao.max} caracteres.`, campo: 'descricao' }
    }
    return { dados: { tipo, titulo, descricao } }
}

/**
 * Valida a edição da gestão: status e/ou resposta. Ao menos um dos dois.
 * `resposta` vazia limpa a resposta.
 */
export function validarGestao(corpo) {
    const temStatus = corpo?.status !== undefined
    const temResposta = corpo?.resposta !== undefined
    if (!temStatus && !temResposta) return { erro: 'Informe o status ou a resposta.', campo: 'status' }

    const dados = {}
    if (temStatus) {
        if (!STATUS.includes(corpo.status)) return { erro: 'Status inválido.', campo: 'status' }
        dados.status = corpo.status
    }
    if (temResposta) {
        const resposta = texto(corpo.resposta)
        if (resposta.length > LIMITES.resposta.max) {
            return { erro: `A resposta pode ter até ${LIMITES.resposta.max} caracteres.`, campo: 'resposta' }
        }
        dados.resposta = resposta || null
    }
    return { dados }
}

// Filtro opcional da listagem de gestão; valor desconhecido é ignorado.
export function filtroValido(valor, lista) {
    return lista.includes(valor) ? valor : null
}
