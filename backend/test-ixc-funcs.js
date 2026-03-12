import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/funcionarios`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'funcionarios.funcionario',
    query: 'Marcio Eduardo', // Buscando marcio eduardo
    oper: 'L',
    page: '1',
    rp: '50',
    sortname: 'funcionarios.id',
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
        console.log("Total Encontrado:", dados.total)
        // print results
        console.log(JSON.stringify(dados.registros, null, 2))
    } catch (e) {
        console.error(e)
    }
}

test()
