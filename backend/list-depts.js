import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_ticket_setor`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'su_ticket_setor.id',
    query: '0',
    oper: '>',
    page: '1',
    rp: '20',
    sortname: 'su_ticket_setor.id',
    sortorder: 'asc'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        if (!resposta.ok) {
            console.error('Falha:', await resposta.text())
            return
        }
        const dados = await resposta.json()
        console.log(JSON.stringify(dados, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
