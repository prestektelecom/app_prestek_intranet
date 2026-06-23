// Serviço de autenticação — chama o backend proxy local
// Nenhuma credencial sensível fica no frontend

const HOST = 'sistema.prestek.com.br'
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 600
const RETRYABLE_STATUS = [500, 502, 503, 504]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function statusPrecisaRetry(status) {
    return RETRYABLE_STATUS.includes(status)
}

async function tentarLogin(email, senha) {
    const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })

    if (!resposta.ok) {
        const rawBody = await resposta.text().catch(() => '');
        try {
            const errorData = JSON.parse(rawBody);
            return {
                ok: false,
                status: resposta.status,
                erro: errorData.erro || `Erro no servidor (${resposta.status})`
            };
        } catch {
            return {
                ok: false,
                status: resposta.status,
                erro: `O servidor respondeu com erro (${resposta.status}). Verifique se o backend está ativo.`
            };
        }
    }

    const dados = await resposta.json()
    return { ok: true, dados }
}

/**
 * Faz login do usuário chamando o backend proxy.
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário (não usada na busca, mas reservada)
 * @returns {Object|null} Dados do usuário ou null se falhou
 */
export async function loginUsuario(email, senha) {
    let ultimoErro = null

    for (let tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
        try {
            const resultado = await tentarLogin(email, senha)

            if (resultado.ok) {
                const dados = resultado.dados

                if (!dados.sucesso) {
                    return { erro: dados.erro }
                }

                // Retorna objeto completo com dados de usuarios + funcionarios
                // para que a tela de configurações tenha tudo disponível
                return {
                    usuario: dados.usuario,
                    funcionario: dados.funcionario ?? null,
                    nome_grupo: dados.nome_grupo ?? null,
                    is_admin: dados.usuario?.is_admin || false,
                    host: dados.host
                }
            }

            ultimoErro = resultado.erro

            // Erros 401/403 são de autenticação — não faz sentido retry
            if (!statusPrecisaRetry(resultado.status)) {
                return { erro: resultado.erro }
            }

            if (tentativa < MAX_RETRIES) {
                console.warn(`[login] Tentativa ${tentativa + 1} falhou com ${resultado.status}, retry em ${RETRY_DELAY_MS}ms...`)
                await sleep(RETRY_DELAY_MS)
            }
        } catch (erro) {
            console.error('Erro ao conectar com o servidor:', erro)
            ultimoErro = 'Erro ao conectar com o servidor. Tente novamente.'

            if (tentativa < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS)
            }
        }
    }

    return { erro: ultimoErro }
}
