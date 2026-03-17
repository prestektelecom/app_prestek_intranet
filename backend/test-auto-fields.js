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
    id_cliente: '76496',
    id_login: '53700',
    id_contrato: '18426',
    id_filial: '1',
    id_assunto: '857',
    id_canal_atendimento: '12',
    id_ticket_setor: '5',
    id_responsavel_tecnico: '59654', 
    titulo: 'TESTE COM TECNICO 59654',
    origem_endereco: 'CC', // Tentativa com CC para endereço do contrato
    origem_endereco: 'CC',
    gerar_protocolo: 'S',
    menssagem: 'Teste de protocolo - padrao sucesso.',
    status: 'T',
    su_status: 'N',
    origem_cadastro: '', // Vazio como no sucesso
    id_ticket_origem: 'I', // 'I' como no sucesso
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
