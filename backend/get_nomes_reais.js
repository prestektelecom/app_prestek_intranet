const host = 'sistema.prestek.com.br';
const userId = '222';
const tokenSecret = '17ff5324f464f2f63af3e4c3d8fe1ea309b49516ad7d384cdcf5a2205758420b';
const token = `${userId}:${tokenSecret}`;

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
};

async function getFuncionario(id) {
    const body = JSON.stringify({
        qtype: 'funcionarios.id',
        query: id,
        oper: '=',
        page: '1',
        rp: '1'
    });
    
    try {
        const response = await fetch(`https://${host}/webservice/v1/funcionarios`, {
            method: 'POST',
            headers,
            body
        });
        const data = await response.json();
        if (data.registros && data.registros.length > 0) {
            console.log(`ID: ${id} -> Nome: ${data.registros[0].funcionario}`);
        } else {
            console.log(`ID: ${id} -> Não encontrado`);
        }
    } catch (e) {
        console.error(`Erro ao buscar ID ${id}:`, e);
    }
}

async function run() {
    await getFuncionario('59570');
    await getFuncionario('59655');
}

run();
