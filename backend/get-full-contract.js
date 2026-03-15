import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/cliente_contrato`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'cliente_contrato.id',
    query: '18426',
    oper: '=',
    page: '1',
    rp: '1'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        if (dados.registros && dados.registros.length > 0) {
            console.log(JSON.stringify(dados.registros[0], null, 2))
        } else {
            console.log('Contrato não encontrado.')
        }
    } catch (e) {
        console.error(e)
    }
}

test()
