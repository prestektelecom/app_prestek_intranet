import fs from 'fs';
import 'dotenv/config';

async function testFinalFix() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const tecnico_id = "59570"; // From user example or known tech ID

    // 1. Create Ticket
    const ticketDados = {
        tipo: 'C',
        id_cliente: '681',
        id_login: '1',
        id_contrato: '18426',
        id_filial: '8',
        id_assunto: '1154',
        id_canal_atendimento: '12',
        id_ticket_setor: '16',
        id_wfl_processo: '237',
        id_responsavel_tecnico: tecnico_id,
        titulo: 'TESTE FINAL FIX STATUS AG',
        origem_endereco: 'CC',
        gerar_protocolo: 'S',
        menssagem: 'Teste de agendamento automático com melhor_horario_agenda',
        status: 'T',
        su_status: 'AG',
        origem_cadastro: 'P',
        prioridade: 'M',
        melhor_horario_reserva: 'Q'
    };

    console.log("Creating ticket...");
    const respTicket = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ticketDados)
    });
    const resTicket = await respTicket.json();
    console.log("Ticket Created:", resTicket);

    if (resTicket.type === 'success') {
        const ticketId = resTicket.id;
        console.log("Waiting for OS creation...");
        
        let osRecord = null;
        for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 4000));
            const respOS = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const dataOS = await respOS.json();
            if (dataOS.registros && dataOS.registros[0]) {
                osRecord = dataOS.registros[0];
                break;
            }
            console.log("OS not found yet, retrying...");
        }

        if (osRecord) {
            const osId = osRecord.id;
            console.log(`OS Found: ${osId}. Current status: ${osRecord.status}`);
            
            const agora = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const data_agenda = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:00`;
            const data_agenda_final = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} 23:59:59`;

            const updateOsBody = {
                ...osRecord,
                id_tecnico: tecnico_id,
                data_agenda,
                data_agenda_final,
                id_wfl_tarefa: '', // Workflow bypass
                status: 'AG',
                melhor_horario_agenda: 'Q',
                mensagem_resposta: 'Agendado via script de teste final com bypass'
            };

            console.log("Updating OS status to AG...");
            const resPut = await fetch(`https://${host}/webservice/v1/su_oss_chamado/${osId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateOsBody)
            });
            const putRes = await resPut.json();
            console.log("PUT Response:", putRes);

            // Verify final status
            const respFinal = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
            });
            const dataFinal = await respFinal.json();
            console.log("Final OS Status:", dataFinal.registros[0].status);
        } else {
            console.error("OS was not created in time.");
        }
    }
}

testFinalFix();
