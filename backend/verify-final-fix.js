import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = 'http://localhost:3001/api/ixc/su-ticket'

const dados = {
    mensagem: 'TESTE DE VERIFICAÇÃO FINAL - ANTIGRAVITY - Endereço e Protocolo',
    colaborador_id: '59773' // ID fixo para teste
}

async function test() {
    console.log('--- Iniciando teste de verificação final ---')
    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        
        const resultado = await resposta.json()
        console.log('Resposta do Servidor:', JSON.stringify(resultado, null, 2))
        
        if (resultado.sucesso && resultado.protocolo) {
            console.log('✅ SUCESSO: Protocolo gerado:', resultado.protocolo)
        } else {
            console.log('❌ FALHA: Protocolo não retornado ou erro na criação.')
        }
    } catch (e) {
        console.error('Erro durante o teste:', e.message)
    }
}

test()
