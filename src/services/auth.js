// Serviço de autenticação — chama o backend proxy local
// Nenhuma credencial sensível fica no frontend

const HOST = 'sistema.prestek.com.br'

/**
 * Faz login do usuário chamando o backend proxy.
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário (não usada na busca, mas reservada)
 * @returns {Object|null} Dados do usuário ou null se falhou
 */
export async function loginUsuario(email, senha) {
    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })

        const dados = await resposta.json()

        if (!dados.sucesso) {
            return { erro: dados.erro }
        }

        // Retorna objeto completo com dados de usuarios + funcionarios
        // para que a tela de configurações tenha tudo disponível
        return {
            usuario: dados.usuario,
            funcionario: dados.funcionario ?? null,
            host: dados.host
        }

    } catch (erro) {
        console.error('Erro ao conectar com o servidor:', erro)
        return { erro: 'Erro ao conectar com o servidor. Tente novamente.' }
    }
}
