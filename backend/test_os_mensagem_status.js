import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve('backend/.env') });

async function testStatusViaMensagem() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const tecnico_id = "59570";

    // 1. Create Ticket to get a fresh OS
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
        titulo: 'TESTE MENSAGEM STATUS AG',
        gerar_protocolo: 'S',
        menssagem: 'Teste de agendamento via su_oss_chamado_mensagem',
        status: 'T',
        su_status: 'AG',
        prioridade: 'M',
        melhor_horario_reserva: 'Q'
    };

    console.log("Creating ticket...");
    const respT = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ticketDados)
    });
    const resT = await respT.json();
    
    if (resT.type !== 'success') {
        console.error("Failed to create ticket:", resT);
        return;
    }
    const ticketId = resT.id;
    console.log("Ticket Created:", ticketId);

    // 2. Wait for OS
    let osId = null;
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 4000));
        const respOS = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
            method: 'POST',
            headers: { ...headers, ixcsoft: 'listar' },
            body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: ticketId, oper: '=', page: '1', rp: '1' })
        });
        const dataOS = await respOS.json();
        if (dataOS.registros && dataOS.registros[0]) {
            osId = dataOS.registros[0].id;
            console.log("OS Found:", osId, "Initial Status:", dataOS.registros[0].status);
            break;
        }
    }

    if (!osId) {
        console.error("OS not found.");
        return;
    }

    // 3. Post Message to su_oss_chamado_mensagem
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const data_agenda = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:00`;
    
    // Define data_agenda_final (2 hours later)
    const later = new Date(agora.getTime() + (2 * 60 * 60 * 1000));
    const data_agenda_final = `${later.getFullYear()}-${pad(later.getMonth() + 1)}-${pad(later.getDate())} ${pad(later.getHours())}:${pad(later.getMinutes())}:00`;

    const msgPayload = {
        id_chamado: osId,
        status: "AG",
        id_evento: "5", // Agendamento
        mensagem: "Agendado via Intranet (Teste Final)",
        id_tecnico: tecnico_id,
        data_inicio: data_agenda, 
        data_final: data_agenda_final,
        id_equipe: "0",
        finaliza_processo: "N"
    };

    console.log("Posting message to su_oss_chamado_mensagem...");
    const resMsg = await fetch(`https://${host}/webservice/v1/su_oss_chamado_mensagem`, {
        method: 'POST',
        headers,
        body: JSON.stringify(msgPayload)
    });
    const dataMsg = await resMsg.json();
    console.log("Message Response:", dataMsg);

    // 4. Check Final Status
    const respFinal = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
    });
    const dataFinal = await respFinal.json();
    console.log("Final OS Status:", dataFinal.registros[0].status);
}

testStatusViaMensagem();
