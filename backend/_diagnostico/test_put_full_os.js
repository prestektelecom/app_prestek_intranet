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

    // 1. GET
    const resGet = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: '1711411', oper: '=', page: '1', rp: '1' })
    });
    const dataGet = await resGet.json();
    const osRecord = dataGet.registros[0];

    // 2. PUT
    const data_agenda = "2026-03-20 10:00:00";
    const data_agenda_final = "2026-03-20 11:00:00";

    const updateOsBody = JSON.stringify({
        ...osRecord,
        id_tecnico: "59570",
        data_agenda: data_agenda,
        data_agenda_final: data_agenda_final,
        id_wfl_tarefa: '',  // Attempt to bypass workflow
        status: 'AG',
        mensagem_resposta: 'Agendado automaticamente'
    });

    const resPut = await fetch(`https://${host}/webservice/v1/su_oss_chamado/1711411`, {
        method: 'PUT',
        headers,
        body: updateOsBody
    });
    const putStatus = await resPut.json();
    console.log("PUT Response:", putStatus);

    // 3. GET verify
    const resGet2 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: '1711411', oper: '=', page: '1', rp: '1' })
    });
    const dataGet2 = await resGet2.json();
    console.log("Status final:", dataGet2.registros[0].status);
}
updateOS();
