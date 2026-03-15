import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64')
}

const body = JSON.stringify({
    tipo: 'C',
    id_cliente: '681',
    id_login: '1',
    id_contrato: '18426',
    id_filial: '1',
    id_assunto: '1154',
    id_canal_atendimento: '4',
    id_ticket_setor: '16',
    id_wfl_processo: '237',
    id_responsavel_tecnico: '1', 
    titulo: 'TESTE PROTOCOLO AUTOMATICO',
    origem_endereco: 'CC', // Tentativa com CC para endereço do contrato
    gerar_protocolo: 'S',  // Chave comum em algumas integrações para forçar protocolo
    menssagem: 'Teste de protocolo e endereço automatizado via API.',
    status: 'T',
    su_status: 'N',
    origem_cadastro: 'P',
    prioridade: 'M'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        console.log('Resposta Ticket Teste:', JSON.stringify(dados, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
