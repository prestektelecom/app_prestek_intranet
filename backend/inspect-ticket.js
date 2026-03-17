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
    query: '732314',
    oper: '=',
    page: '1',
    rp: '1',
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
        const fs = await import('fs')
        fs.writeFileSync('ticket-success.json', JSON.stringify(dados.registros ? dados.registros[0] : dados, null, 2))
        console.log('Ticket data saved to ticket-success.json')
    } catch (e) {
        console.error(e)
    }
}

test()
