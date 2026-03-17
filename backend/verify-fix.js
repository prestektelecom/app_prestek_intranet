async function verify() {
    const body = JSON.stringify({
        mensagem: 'Teste de verificação final - Protocolo Fallback',
        colaborador_id: '59654' // Bruna Sofia, usada nos testes de sucesso
    });

    console.log('--- Iniciando Verificação do Fix ---');
    try {
        const res = await fetch('http://127.0.0.1:3001/api/ixc/su-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });

        const data = await res.json();
        console.log('Resposta da API:', JSON.stringify(data, null, 2));

        if (data.sucesso && data.protocolo) {
            console.log('\u2705 SUCESSO: Protocolo gerado e retornado:', data.protocolo);
        } else if (data.sucesso && !data.protocolo) {
            console.log('\u26A0\uFE0F ATENÇÃO: Ticket criado mas protocolo veio vazio.');
        } else {
            console.log('\u274C FALHA: Erro ao criar ticket:', data.erro);
        }
    } catch (err) {
        console.error('Erro ao conectar no backend:', err.message);
    }
}

verify();
