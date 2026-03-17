import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

// Busca o último ticket criado (provavelmente o do teste do usuário)
const body = JSON.stringify({
    qtype: 'su_ticket.id',
    query: '0',
    oper: '>',
    page: '1',
    rp: '10',
    sortname: 'su_ticket.id',
    sortorder: 'desc'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        if (!resposta.ok) {
            console.error('Falha:', await resposta.text())
            return
        }
        const dados = await resposta.json()
        const summary = (dados.registros || []).map(r => ({
            id: r.id,
            protocolo: r.protocolo,
            origem_endereco: r.origem_endereco,
            endereco: r.endereco,
            titulo: r.titulo,
            id_assunto: r.id_assunto,
            id_ticket_setor: r.id_ticket_setor,
            id_cliente: r.id_cliente,
            tipo: r.tipo,
            id_login: r.id_login
        }))
        console.log('Tickets Recentes (Protocolo e Endereço):', JSON.stringify(summary, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
