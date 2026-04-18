import 'dotenv/config';

async function checkCidadesPorUF() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    // Buscar cidades com uf = 7 (suspeito AL)
    const body7 = JSON.stringify({ qtype: 'cidade.uf', query: '7', oper: '=', page: '1', rp: '10' });
    const res7 = await fetch(`https://${host}/webservice/v1/cidade`, { method: 'POST', headers, body: body7 });
    const data7 = await res7.json();
    console.log('UF=7 (Total:', data7.total, '):');
    (data7.registros || []).slice(0, 5).forEach(c => console.log(' -', c.nome, c.uf, c.regiao));

    // Buscar cidades com uf = 28 (suspeito SE)
    const body28 = JSON.stringify({ qtype: 'cidade.uf', query: '28', oper: '=', page: '1', rp: '10' });
    const res28 = await fetch(`https://${host}/webservice/v1/cidade`, { method: 'POST', headers, body: body28 });
    const data28 = await res28.json();
    console.log('\nUF=28 (Total:', data28.total, '):');
    (data28.registros || []).slice(0, 5).forEach(c => console.log(' -', c.nome, c.uf, c.regiao));
}
checkCidadesPorUF();
