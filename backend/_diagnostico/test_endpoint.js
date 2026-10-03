async function testEndpoint() {
    try {
        const response = await fetch('http://localhost:3001/api/departamentos-empresa');
        const data = await response.json();
        console.log('Sucesso:', data.sucesso);
        console.log('Total de departamentos:', data.departamentos?.length || 0);
        if (data.departamentos?.length > 0) {
            console.log('Exemplo:', data.departamentos[0]);
            const depto54 = data.departamentos.find(d => String(d.id) === '54');
            console.log('Departamento 54:', depto54 ? depto54.departamento : 'Não encontrado');
        }
    } catch (err) {
        console.error('Erro ao testar:', err.message);
    }
}

testEndpoint();
