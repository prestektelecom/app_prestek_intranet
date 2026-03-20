import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve('backend/.env') });

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_oss_chamado`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'su_oss_chamado.status',
    query: 'AG',
    oper: '=',
    page: '1',
    rp: '5',
    sortname: 'su_oss_chamado.id',
    sortorder: 'desc'
})

async function findAgOs() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        if (dados.registros && dados.registros.length > 0) {
            console.log("Found AG OS:", dados.registros.map(r => ({ id: r.id, status: r.status, data_agenda: r.data_agenda })));
            
            // For the first one, let's look at its messages
            const osId = dados.registros[0].id;
            console.log(`Checking messages for OS ${osId}...`);
            const msgUrl = `https://${host}/webservice/v1/su_oss_chamado_mensagem`;
            const msgBody = JSON.stringify({
                qtype: 'su_oss_chamado_mensagem.id_chamado',
                query: osId,
                oper: '=',
                page: '1',
                rp: '20'
            });
            const msgResp = await fetch(msgUrl, { method: 'POST', headers, body: msgBody });
            const msgDados = await msgResp.json();
            console.log("Message History:", JSON.stringify(msgDados.registros, null, 2));
        } else {
            console.log("No OS found with status AG.");
        }
    } catch (e) {
        console.error(e)
    }
}

findAgOs();
