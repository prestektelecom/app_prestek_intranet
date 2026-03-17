import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar' // Apenas para testar a conexão, se necessário
}

const dados = {
    tipo: 'C',
    id_cliente: '661',
    id_login: '1',
    id_contrato: '18426',
    id_filial: '1',
    id_assunto: '1154',
    id_canal_atendimento: '4',
    menssagem: 'TESTE DE INTEGRAÇÃO - ANTIGRAVITY - Abertura de ticket suporte TI',
    status: 'T',
    origem_cadastro: 'P',
    prioridade: 'M'
}

async function test() {
    console.log('--- Iniciando teste de abertura de ticket no IXC ---')
    console.log('URL:', url)
    
    try {
        const resposta = await fetch(url, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + Buffer.from(token).toString('base64')
            }, 
            body: JSON.stringify(dados) 
        })
        
        if (!resposta.ok) {
            console.error('Falha na requisição:', resposta.status, await resposta.text())
            return
        }
        
        const resultado = await resposta.json()
        console.log('Sucesso! Resposta do IXC:')
        console.log(JSON.stringify(resultado, null, 2))
        
        if (resultado.protocolo) {
            console.log('PROTOCOLO GERADO:', resultado.protocolo)
        } else {
            console.log('AVISO: PROTOCOLO VEIO EM BRANCO!')
        }
    } catch (e) {
        console.error('Erro durante o teste:', e)
    }
}

test()
