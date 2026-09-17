import 'dotenv/config';

if (!process.env.CONFIRMAR_ESCRITA_IXC) {
    console.error('Bloqueado: este script escreve de verdade no IXC de produção. Defina CONFIRMAR_ESCRITA_IXC=1 para confirmar e rodar.');
    process.exit(1);
}

async function testFullWorkflow() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const tecnico_id = '59570'; // Marcio Felix

    const ticketDados = {
        tipo: 'C',
        id_cliente: '681',
        id_login: '1',
        id_contrato: '18426',
        id_filial: '1',
        id_assunto: '1154',
        id_canal_atendimento: '4',
        id_ticket_setor: '16',
        id_wfl_processo: '237',
        id_responsavel_tecnico: tecnico_id,
        titulo: 'TESTE DE FLUXO COMPLETO MENSAGEM',
        origem_endereco: 'CC',
        gerar_protocolo: 'S',
        menssagem: 'Teste de fluxo com mensagem de evento 8 para assumir',
        status: 'T',
        su_status: 'N',
        origem_cadastro: 'P',
        prioridade: 'M',
        melhor_horario_reserva: 'Q'
    };

    console.log('Criando ticket...');
    const resp = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ticketDados)
    });
    const resTicket = await resp.json();
    console.log('Ticket criado:', resTicket);
    
    if (resTicket.type !== 'success') {
        console.error('Falha ao criar ticket:', resTicket);
        return;
    }

    const ticketId = resTicket.id;
    console.log('Aguardando OS...');
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
        console.log('OS ainda não encontrada, aguardando...');
    }

    if (!osRecord) {
        console.error('OS não foi criada a tempo.');
        return;
    }

    const osId = osRecord.id;
    console.log(`OS encontrada: ${osId}. id_wfl_tarefa inicial: ${osRecord.id_wfl_tarefa}`);

    const payload = {
        id_chamado: osId,
        status: 'AS',
        id_evento: '8', // Assumir
        mensagem: 'Ordem de serviço assumida pelo colaborador(a): 59570 - MARCIO EDUARDO FELIX',
        id_tecnico: tecnico_id,
        id_equipe: '0',
        finaliza_processo: 'N',
        id_operador: '222'
    };

    console.log(`Postando mensagem de evento 8 na OS ${osId}...`);
    const resMsg = await fetch(`https://${host}/webservice/v1/su_oss_chamado_mensagem`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    const dataMsg = await resMsg.json();
    console.log("Resposta POST mensagem:", dataMsg);

    // Consulta final da OS
    console.log("Consultando estado final da OS...");
    const resGet = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
    });
    const dataGet = await resGet.json();
    console.log("Registro retornado final:", JSON.stringify(dataGet.registros ? dataGet.registros[0] : dataGet, null, 2));
}

testFullWorkflow();


