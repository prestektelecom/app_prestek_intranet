import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket`

const dados = {
    tipo: 'C',
    id_cliente: '661',
    id_login: '1',
    id_contrato: '18426',
    id_filial: '1',
    id_assunto: '1154',
    id_canal_atendimento: '4',
    id_ticket_setor: '1',
    titulo: 'TESTE DEFINITIVO - Suporte de TI via Intranet',
    menssagem: 'Teste de integração final via script de automação.',
    status: 'T', // Mantendo 'T' conforme o snippet do usuário
    su_status: 'N', // Adicionando 'N' conforme o snippet
    origem_cadastro: 'P',
    prioridade: 'M',
    id_ticket_origem: 'I',
    interacao_pendente: 'N',
    finalizar_atendimento: 'N',
    atualizar_cliente: 'S',
    atualizar_login: 'S',
    melhor_horario_reserva: 'Q'
}

async function test() {
    try {
        const resposta = await fetch(url, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + Buffer.from(token).toString('base64')
            }, 
            body: JSON.stringify(dados) 
        })
        
        const resultado = await resposta.json()
        console.log(JSON.stringify(resultado, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
