import fs from 'fs';
import 'dotenv/config';

async function generateTicketWithoutWorkflow() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const dados = {
        tipo: 'C',
        id_cliente: '681',
        id_login: '1',
        id_contrato: '18426',
        id_filial: '8',
        id_assunto: '1154',        
        id_canal_atendimento: '12',
        id_ticket_setor: '16',
        id_responsavel_tecnico: '59570',
        titulo: 'TESTE SEM WORKFLOW',
        origem_endereco: 'CC',
        gerar_protocolo: 'S',
        menssagem: 'Teste de agendamento',
        status: 'T',
        su_status: 'AG',
        origem_cadastro: 'P',
        prioridade: 'M',
        melhor_horario_reserva: 'Q',
    };

    try {
        const res = await fetch(`https://${host}/webservice/v1/su_ticket`, {
            method: 'POST',
            headers,
            body: JSON.stringify(dados)
        });
        const ticketRes = await res.json();
        console.log("Ticket Created:", JSON.stringify(ticketRes, null, 2));
        
        if (ticketRes.type === 'success') {
            const ticketId = ticketRes.id;
            // Wait a bit for OS creation
            await new Promise(r => setTimeout(r, 3000));
            // Check OS
            const resGetOS = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const dataGetOS = await resGetOS.json();
            console.log("OS Encontrada:", dataGetOS.registros ? dataGetOS.registros[0].id : 'Nenhuma OS gerada');
        }
    } catch(e) {
        console.error(e);
    }
}

generateTicketWithoutWorkflow();
