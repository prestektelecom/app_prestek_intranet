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
    qtype: 'su_oss_chamado.id_tecnico',
    query: '59570',
    oper: '=',
    page: '1',
    rp: '500', 
    sortname: 'su_oss_chamado.id',
    sortorder: 'desc'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        console.log("Total Encontrado 59570:", dados.total)
        
        // Status F = Finalizada, C = Cancelada (normalmente)
        const abertas = dados.registros.filter(os => os.status !== 'F' && os.status !== 'C' && os.status !== 'S');
        console.log(`\n=> OS NÃO FINALIZADAS: ${abertas.length}`);
        
        const countStatus = {};
        abertas.forEach(os => {
            countStatus[os.status] = (countStatus[os.status] || 0) + 1;
        });
        console.log("Status detalhados:", countStatus);
        
    } catch (e) {
        console.error(e)
    }
}

test()
