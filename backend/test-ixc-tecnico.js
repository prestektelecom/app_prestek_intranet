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
        // Tentar listar tecnicos (Geralmente na su_ticket_tecnico ou similar)
        const url = `https://${host}/webservice/v1/su_tecnicos`
        const body = JSON.stringify({
            qtype: 'su_tecnicos.id_funcionario',
            query: '68',
            oper: '=',
            page: '1',
            rp: '5',
            sortname: 'su_tecnicos.id',
            sortorder: 'desc'
        })
        
        const resposta = await fetch(url, { method: 'POST', headers, body })
        if (!resposta.ok) {
            console.error('Falha su_tecnicos:', await resposta.text())
            // se falhar tenta outra tabela comum no IXC
            const url2 = `https://${host}/webservice/v1/usuarios`
            const body2 = JSON.stringify({
                 qtype: 'usuarios.funcionario', query: '68', oper: '=', page: '1', rp: '5'
            })
            const r2 = await fetch(url2, { method: 'POST', headers, body: body2 })
            const d2 = await r2.json()
             console.log("Usuarios com func 68:", d2.total > 0 ? d2.registros[0] : "Nenhum")
            return
        }
        
        const dados = await resposta.json()
        console.log("Total Técnicos vinculados ao func 68:", dados.total)
        
        if (dados.registros && dados.registros.length > 0) {
            console.log(JSON.stringify(dados.registros[0], null, 2))
        }
    } catch (e) {
        console.error(e)
    }
}

test()
