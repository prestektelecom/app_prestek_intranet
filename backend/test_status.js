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
        const dadosContratos = await resContratos.json();
        const statuses = {};
        if (dadosContratos.registros) {
            dadosContratos.registros.forEach(reg => {
                const isValid = String(reg.id_motivo_inclusao) === '1';
                if (isValid) {
                    const st = `status: ${reg.status || '??'} | status_internet: ${reg.status_internet || '??'}`;
                    statuses[st] = (statuses[st] || 0) + 1;
                }
            });
        }
        console.log("Combinações encontradas:", statuses);
    } catch(err) {
        console.error(err);
    }
}
verify();
