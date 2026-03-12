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
    const brunoTecId = '59573';
    
    // Status que consideramos "Abertos"
    const statusAbertos = ['A', 'AG', 'AS', 'EN', 'AN', 'EX', 'OU']; // 'OU' de Outros se existir
    
    let totalBruno = 0;
    const statusBruno = {};

    console.log("Iniciando busca global por status abertos...");

    for (const status of statusAbertos) {
        const body = JSON.stringify({
            qtype: 'su_oss_chamado.status',
            query: status,
            oper: '=',
            page: '1',
            rp: '10000' // Pegamos todos desse status na empresa
        });

        try {
            const resposta = await fetch(url, { method: 'POST', headers, body });
            const dados = await resposta.json();
            const registros = dados.registros || [];
            
            const dele = registros.filter(os => String(os.id_tecnico) === brunoTecId);
            totalBruno += dele.length;
            statusBruno[status] = dele.length;
            
            console.log(`Status ${status}: ${registros.length} na empresa, ${dele.length} do Bruno`);
        } catch (e) {
            console.error(`Erro ao buscar status ${status}:`, e.message);
        }
    }

    console.log("\n--- RESULTADO FINAL PARA BRUNO ---");
    console.log("Total Acumulado:", totalBruno);
    console.log("Distribuição por Status:", statusBruno);
}

test()
