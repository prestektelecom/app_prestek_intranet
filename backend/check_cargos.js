async function checkCargos() {
    try {
        const response = await fetch('http://localhost:3001/api/cargos');
        const data = await response.json();
        console.log('Sucesso:', data.sucesso);
        console.log('Total de cargos:', data.cargos?.length || 0);
        const depto54 = data.cargos?.find(c => String(c.id) === '54');
        console.log('Cargo 54:', depto54 ? JSON.stringify(depto54, null, 2) : 'Não encontrado');
    } catch (err) {
        console.error('Erro:', err.message);
    }
}

checkCargos();
