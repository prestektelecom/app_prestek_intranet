import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64')
}

async function test() {
    try {
        const resposta = await fetch(url, { method: 'GET', headers })
        const dados = await resposta.text()
        console.log(dados)
    } catch (e) {
        console.error(e)
    }
}

test()
