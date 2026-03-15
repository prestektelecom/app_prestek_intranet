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
            const r = dados.registros[0];
            console.log('CONTRATO ENCONTRADO:')
            console.log('ID Contrato:', r.id)
            console.log('ID Cliente:', r.id_cliente)
            console.log('ID Login:', r.id_login)
            console.log('ID Filial:', r.id_filial)
        } else {
            console.log('Contrato não encontrado.')
        }
    } catch (e) {
        console.error(e)
    }
}

test()
