import fs from 'fs';
import 'dotenv/config';

if (!process.env.CONFIRMAR_ESCRITA_IXC) {
    console.error('Bloqueado: este script escreve de verdade no IXC de produção. Defina CONFIRMAR_ESCRITA_IXC=1 para confirmar e rodar.');
    process.exit(1);
}

async function updateOS() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };
    const body = JSON.stringify({
        status: 'AG' // Agendado
    });
    const url = `https://${host}/webservice/v1/su_oss_chamado/1711411`;
    const res = await fetch(url, {
        method: 'PUT',
        headers,
        body
    });
    const data = await res.json();
    fs.writeFileSync('put_os_response.json', JSON.stringify(data, null, 2));
}
updateOS();
