import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

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
            id_cliente: r.id_cliente,
            id_login: r.id_login,
            id_contrato: r.id_contrato,
            id_filial: r.id_filial,
            id_assunto: r.id_assunto,
            titulo: r.titulo
        }))
        console.log('Resumo de Chamados Recentes:', JSON.stringify(summary, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
