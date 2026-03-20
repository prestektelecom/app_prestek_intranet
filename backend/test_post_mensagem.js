import fs from 'fs';
import 'dotenv/config';

async function postMensagem() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const payload = {
        id_chamado: "1711411", // the OS we created earlier which is Aberto
        status: "AG",
        id_evento: "16", // Reagendamento
        mensagem: "Agendado via API",
        id_tecnico: "59570",
        id_equipe: "0",
        finaliza_processo: "N"
    };

    try {
        const res = await fetch(`https://${host}/webservice/v1/su_oss_chamado_mensagem`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Mensagem Response:", data);
        
        // Let's check the OS status again
        const resGetOS = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
            method: 'POST',
            headers: { ...headers, ixcsoft: 'listar' },
            body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: '1711411', oper: '=', page: '1', rp: '1' })
        });
        const dataGetOS = await resGetOS.json();
        if(dataGetOS.registros && dataGetOS.registros[0]) {
            console.log("OS Status after message:", dataGetOS.registros[0].status);
        }
    } catch(e) {
        console.error(e);
    }
}

postMensagem();
