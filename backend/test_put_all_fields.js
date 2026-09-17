import 'dotenv/config';

if (!process.env.CONFIRMAR_ESCRITA_IXC) {
    console.error('Bloqueado: este script escreve de verdade no IXC de produção. Defina CONFIRMAR_ESCRITA_IXC=1 para confirmar e rodar.');
    process.exit(1);
}

async function testPut() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const osId = '1814348'; // Nosso OS ID de teste
    const tecnico_id = '59570'; // Marcio Felix

    // 1. Fetch current OS state to get correct fields
    const resGet = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
    });
    const dataGet = await resGet.json();
    const osRecord = dataGet.registros[0];
    
    if(!osRecord) {
        console.error("OS não encontrada.");
        return;
    }

    // 2. Build update payload with various possible technician field names
    const body = {
        ...osRecord,
        id_tecnico: tecnico_id,
        tecnico_id: tecnico_id,
        id_tecnico_responsavel: tecnico_id,
        id_funcionario: tecnico_id,
        id_responsavel: tecnico_id,
        id_atendente: tecnico_id,
        // Restore ticket link and workflow parameters
        id_ticket: '775504',
        id_wfl_tarefa: '1900',
        id_wfl_param_os: '1113',
        liberado: '1',
        status: 'A' // Mantém Aberto
    };

    console.log(`Fazendo PUT na OS ${osId} com múltiplos campos de técnico...`);
    const resPut = await fetch(`https://${host}/webservice/v1/su_oss_chamado/${osId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });
    console.log("Status HTTP:", resPut.status);
    const putRes = await resPut.json();
    console.log("Resposta PUT:", putRes);

    // 3. Verify final state
    console.log("Consultando estado final da OS...");
    const resGet2 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id', query: osId, oper: '=', page: '1', rp: '1' })
    });
    const dataGet2 = await resGet2.json();
    console.log("Registro retornado final:", JSON.stringify(dataGet2.registros ? dataGet2.registros[0] : dataGet2, null, 2));
}

testPut();
