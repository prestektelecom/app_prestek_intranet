async function testEndpoints() {
    const endpoints = [
        'departamento',
        'setor',
        'departamentos',
        'empresa_setor',
        'su_ticket_setor'
    ];

    for (const endpoint of endpoints) {
        try {
            const url = `http://localhost:3001/api/test-ixc?endpoint=${endpoint}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Endpoint ${endpoint}:`, data.sucesso ? `OK (${data.registros?.length || 0} registros)` : `FALHA (${data.erro})`);
            if (data.registros) {
                const found = data.registros.find(r => String(r.id) === '54');
                if (found) {
                    console.log(`  >>> ENCONTRADO EM ${endpoint}:`, JSON.stringify(found, null, 2));
                }
            }
        } catch (err) {
            console.log(`Erro ao testar ${endpoint}:`, err.message);
        }
    }
}

testEndpoints();
