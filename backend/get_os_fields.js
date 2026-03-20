import fs from 'fs';
import 'dotenv/config';

async function getOS() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };
    const body = JSON.stringify({
        qtype: 'su_oss_chamado.id',
        query: '1711411', // ID from the log
        oper: '=',
        page: '1',
        rp: '1'
    });
    const res = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers,
        body
    });
    const data = await res.json();
    fs.writeFileSync('os_data.json', JSON.stringify(data.registros[0], null, 2));
}
getOS();
