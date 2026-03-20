import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
const host = process.env.IXC_HOST;
const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
};

async function getMsgs() {
    const osId = '1713201';
    const msgUrl = `https://${host}/webservice/v1/su_oss_chamado_mensagem`;
    const msgBody = JSON.stringify({
        qtype: 'su_oss_chamado_mensagem.id_chamado',
        query: osId,
        oper: '=',
        page: '1',
        rp: '20',
        sortname: 'su_oss_chamado_mensagem.id',
        sortorder: 'asc'
    });
    
    try {
        const msgResp = await fetch(msgUrl, { method: 'POST', headers, body: msgBody });
        const msgDados = await msgResp.json();
        console.log("Full Message History for OS 1713201:");
        if (msgDados.registros) {
            console.log(JSON.stringify(msgDados.registros, null, 2));
        }
    } catch(e) {
        console.error(e);
    }
}

getMsgs();
