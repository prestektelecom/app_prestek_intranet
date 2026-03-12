import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    try {
        // As vezes id_tecnico é atrelado a tabela `funcionarios` ou `usuarios`. 
        // Vamos pesquisar na api principal por "usuarios" ou "tecnicos"
        const url1 = `https://${host}/webservice/v1/su_ticket_tecnico`
        const body1 = JSON.stringify({
            qtype: 'su_ticket_tecnico.id',
            query: '0',
            oper: '>',
            page: '1',
            rp: '5',
            sortname: 'su_ticket_tecnico.id',
            sortorder: 'desc'
        })
        
        let resposta = await fetch(url1, { method: 'POST', headers, body: body1 })
        
        // Verifica outras rotas comuns de técnicos IXC
        if (!resposta.ok) {
            console.error('Falha su_ticket_tecnico:', await resposta.text())
        } else {
            const dados = await resposta.json()
            console.log("Total su_ticket_tecnico:", dados.total)
            if (dados.registros && dados.registros.length > 0) {
                 console.log("Exemplo de su_ticket_tecnico:", JSON.stringify(dados.registros[0], null, 2))
            }
        }
    } catch (e) {
        console.error(e)
    }
}

test()
