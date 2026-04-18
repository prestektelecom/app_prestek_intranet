import 'dotenv/config';

async function checkCidades() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const bodyCidades = JSON.stringify({
        qtype: 'cidade.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '20',
        sortname: 'cidade.id',
        sortorder: 'asc'
    });
    const res = await fetch(`https://${host}/webservice/v1/cidade`, {
        method: 'POST', headers, body: bodyCidades
    });
    const data = await res.json();
    console.log('Fields of first city record:');
    if (data.registros && data.registros[0]) {
        console.log(JSON.stringify(data.registros[0], null, 2));
    }
}
checkCidades();
