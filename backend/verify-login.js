import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/radusuarios` // Logins de internet costumam estar aqui

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'radusuarios.id',
    query: '1',
    oper: '=',
    page: '1',
    rp: '1'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        console.log('Busca Login 1:', JSON.stringify(dados, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
