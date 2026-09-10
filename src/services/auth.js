// Serviço de autenticação — chama o backend proxy local
// Nenhuma credencial sensível fica no frontend

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 600
const RETRYABLE_STATUS = [500, 502, 503, 504]
const ERRO_GENERICO = 'Não foi possível entrar agora. Tente de novo em instantes.'

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
                erro: errorData.erro || ERRO_GENERICO,
                campo: errorData.campo ?? null,
            };
        } catch {
            return { ok: false, status: resposta.status, erro: ERRO_GENERICO, campo: null };
        }
    }

    const dados = await resposta.json()
    return { ok: true, dados }
}

/**
 * Faz login do usuário chamando o backend proxy, que valida e-mail e senha
 * contra o IXC. Só repete a chamada em 5xx; 400/401/403 voltam na primeira
 * com `status` e `campo` (qual campo a tela deve marcar e focar).
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<Object>} dados do usuário, ou `{ erro, status?, campo? }`
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

            // 400/401/403 são resposta definitiva — sai na primeira.
            if (!statusPrecisaRetry(resultado.status)) {
                return { erro: resultado.erro, status: resultado.status, campo: resultado.campo }
            }

            if (tentativa < MAX_RETRIES) {
                console.warn(`[login] Tentativa ${tentativa + 1} falhou com ${resultado.status}, retry em ${RETRY_DELAY_MS}ms...`)
                await sleep(RETRY_DELAY_MS)
            }
        } catch (erro) {
            console.error('Erro ao conectar com o servidor:', erro)
            ultimoErro = ERRO_GENERICO

            if (tentativa < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS)
            }
        }
    }

    return { erro: ultimoErro, status: 500, campo: null }
}
