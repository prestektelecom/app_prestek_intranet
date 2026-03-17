import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_oss_chamado`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'su_oss_chamado.id',
    query: '0',
    oper: '>',
    page: '1',
    rp: '1'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        if (dados.registros && dados.registros[0]) {
            console.log(Object.keys(dados.registros[0]))
        } else {
            console.log(dados)
        }
    } catch (e) {
        console.error(e)
    }
}

test()
