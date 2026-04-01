import dotenv from 'dotenv';
dotenv.config();

const host = process.env.IXC_HOST;
const API_TOKEN = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;

const headers = {
    'Content-Type': 'application/json',
    'ixcsoft': 'listar',
    'Authorization': `Basic ${Buffer.from(API_TOKEN).toString('base64')}`
};

async function verify() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    
    let total500 = 0;
    try {
        const urlContratos = `https://${host}/webservice/v1/cliente_contrato`;
        const bodyContratos = JSON.stringify({
            qtype: 'cliente_contrato.data_cadastro_sistema',
            query: firstDay,
            oper: '>=',
            page: '1',
            rp: '5000',
            sortname: 'cliente_contrato.id',
            sortorder: 'desc'
        });

        const resContratos = await fetch(urlContratos, { method: 'POST', headers, body: bodyContratos });
        if (resContratos.ok) {
            const dadosContratos = await resContratos.json();
            console.log(`Puxando cliente_contrato.data_cadastro_sistema >= ${firstDay}`);
            console.log(`Total geral retornado pela API: ${dadosContratos.registros ? dadosContratos.registros.length : 0} | Total no JSON: ${dadosContratos.total}`);
            
            if (dadosContratos.registros) {
                dadosContratos.registros.forEach(reg => {
                    const planId = reg.id_vd_contrato;
                    if (planId === '500') {
                        total500++;
                    }
                });
            }
            console.log(`Desses, quantos são id_vd_contrato=500? ${total500}`);
        } else {
            console.error('API Error', resContratos.status);
        }
    } catch (errContrato) {
        console.error('Erro ao buscar contratos do mês:', errContrato.message);
    }
}

verify();
