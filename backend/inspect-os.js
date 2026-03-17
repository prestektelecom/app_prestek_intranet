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
    rp: '1',
    sortname: 'su_oss_chamado.id',
    sortorder: 'desc'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        const fs = await import('fs')
        fs.writeFileSync('os-data.json', JSON.stringify(dados.registros ? dados.registros[0] : dados, null, 2))
        console.log('OS data saved to os-data.json')
    } catch (e) {
        console.error(e)
    }
}

test()
