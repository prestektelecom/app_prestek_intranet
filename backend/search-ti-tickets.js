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
    qtype: 'su_ticket.titulo',
    query: 'SUPORTE DE TI%',
    oper: 'LIKE',
    page: '1',
    rp: '5',
    sortname: 'su_ticket.id',
    sortorder: 'desc'
})

async function test() {
    try {
        const queryBody = { 
            qtype: 'su_ticket.id_cliente', 
            query: '681', 
            oper: '=', 
            page: '1', 
            rp: '5', 
            sortname: 'su_ticket.id', 
            sortorder: 'desc' 
        };
        const resposta = await fetch(url, { method: 'POST', headers, body: JSON.stringify(queryBody) })
        const text = await resposta.text()
        try {
            const dados = JSON.parse(text)
            if (dados.registros) {
                console.log('Tickets encontrados:', dados.registros.length)
                dados.registros.forEach(r => {
                    console.log(`ID: ${r.id}, Protocolo: ${r.protocolo}, Endereço: ${r.endereco}, Bairro: ${r.bairro}, Cidade: ${r.cidade}, Origem End: ${r.origem_endereco}, Titulo: ${r.titulo}`)
                })
            } else {
                console.log('Resposta inesperada:', dados)
            }
        } catch (e) {
            console.log('Falha ao parsear JSON. Resposta bruta:')
            console.log(text)
        }
    } catch (e) {
        console.error(e)
    }
}

test()
