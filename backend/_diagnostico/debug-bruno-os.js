import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/su_oss_chamado`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    // Primeiro vamos pegar o email do Bruno para achar o ixcTecnicoId
    // Baseado na imagem anterior o nome dele é BRUNO FERNANDO PEREIRA SILVA
    const email = 'brunosilva@prestek.com.br'; // Vou chutar o email baseado no padrao, ou buscar por nome
    
    // Busca usuario pelo nome no IXC
    const rUsr = await fetch(`https://${host}/webservice/v1/usuarios`, {
        method: 'POST', headers, body: JSON.stringify({ qtype: 'usuarios.nome', query: 'BRUNO FERNANDO PEREIRA SILVA', oper: '=', rp: '1' })
    }).then(r=>r.json());
    
    if (rUsr.total === 0) return console.log("Usuário não encontrado no IXC.");
    const ixcTecnicoId = rUsr.registros[0].funcionario;
    console.log("IXC Tecnico ID do Bruno:", ixcTecnicoId);

    const body = JSON.stringify({
        qtype: 'su_oss_chamado.id_tecnico',
        query: String(ixcTecnicoId),
        oper: '=',
        page: '1',
        rp: '1000', 
        sortname: 'su_oss_chamado.id',
        sortorder: 'desc'
    });

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();
        const registros = dados.registros || [];
        
        console.log("Campo 'total' retornado pela API:", dados.total);
        console.log("Total de registros retornados na lista (registros.length):", registros.length);
        
        const statusMap = {};
        registros.forEach(os => {
            statusMap[os.status] = (statusMap[os.status] || 0) + 1;
        });
        
        console.log("Distribuição de Status (todos):", statusMap);
        
        const abertas = registros.filter(os => !['F', 'C'].includes(String(os.status).toUpperCase()));
        console.log("Total 'Abertas' (não F/C):", abertas.length);
        
        const statusMapAbertas = {};
        abertas.forEach(os => {
            statusMapAbertas[os.status] = (statusMapAbertas[os.status] || 0) + 1;
        });
        console.log("Distribuição de Status (Abertas):", statusMapAbertas);

        if (abertas.length > 0) {
            console.log("Exemplo de OS 'Aberta' com status diferente dos conhecidos:");
            const estranha = abertas.find(os => !['AG', 'AS', 'EN', 'AN', 'EX'].includes(os.status));
            if (estranha) console.log(JSON.stringify(estranha, null, 2));
        }

    } catch (e) {
        console.error(e)
    }
}

test()
