import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_oss_chamado`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    const brunoTecId = '59573';
    
    console.log("Testando múltiplos filtros no IXC...");

    // Tentar usar grid_param com filtros JSON
    // No IXC, grid_param costuma aceitar uma estrutura de filtros
    const body = JSON.stringify({
        qtype: 'su_oss_chamado.id_tecnico',
        query: brunoTecId,
        oper: '=',
        page: '1',
        rp: '1',
        grid_param: JSON.stringify([
            { field: 'su_oss_chamado.status', value: 'A', operator: '=' }
        ])
    });

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();
        console.log(`Filtro (Tecnico 59573 + Status A via grid_param) - Total: ${dados.total}`);
        
        // Comparar sem o grid_param
        const bodySimples = JSON.stringify({
            qtype: 'su_oss_chamado.id_tecnico',
            query: brunoTecId,
            oper: '=',
            rp: '1'
        });
        const resSimples = await fetch(url, { method: 'POST', headers, body: bodySimples }).then(r=>r.json());
        console.log(`Filtro (Apenas Tecnico 59573) - Total: ${resSimples.total}`);

    } catch (e) {
        console.error(`Erro:`, e.message);
    }
}

test()
