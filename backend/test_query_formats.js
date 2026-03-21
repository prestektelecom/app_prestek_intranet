import 'dotenv/config';

async function testOriginalQuery() {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/empresa_setor`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const bodies = [
        {
            qtype: 'empresa_setor.id',
            query: '0',
            oper: '>',
            page: '1',
            rp: '1000',
            sortname: 'empresa_setor.setor',
            sortorder: 'asc'
        },
        {
            qtype: 'id',
            query: '0',
            oper: '>',
            page: '1',
            rp: '1000',
            sortname: 'id',
            sortorder: 'asc'
        }
    ];

    for (const body of bodies) {
        console.log(`Testando query com qtype: ${body.qtype}`);
        try {
            const resposta = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
            const data = await resposta.json();
            console.log(`  Sucesso: ${data.sucesso}`);
            console.log(`  Registros: ${data.registros?.length || 0}`);
            if (data.registros) {
                const found = data.registros.find(r => String(r.id) === '54');
                console.log(`  ID 54 encontrado: ${!!found}`);
            }
        } catch (e) {
            console.log(`  Erro: ${e.message}`);
        }
    }
}

testOriginalQuery();
