import fs from 'fs';
import 'dotenv/config';

async function testMinimalPut() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const osId = "1713249"; // ID from previous test
    const tecnico_id = "59570";

    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const data_agenda = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} 08:00:00`;
    const data_agenda_final = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} 10:00:00`;

    // Status only
    const minimalBody = {
        'status': 'AG'
    };

    console.log(`Updating OS ${osId} with MINIMAL payload...`);
    const resPut = await fetch(`https://${host}/webservice/v1/su_oss_chamado/${osId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(minimalBody)
    });
    const putRes = await resPut.json();
    console.log("PUT Response:", putRes);

    // Verify
    const respFinal = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
    });
    const dataFinal = await respFinal.json();
    console.log("Final OS Status (Minimal):", dataFinal.registros[0].status);
}

testMinimalPut();
