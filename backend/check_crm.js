import dotenv from 'dotenv';
dotenv.config();

const host = process.env.IXC_HOST;
const API_TOKEN = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;

const headers = {
    'Content-Type': 'application/json',
    'ixcsoft': 'listar',
    'Authorization': `Basic ${Buffer.from(API_TOKEN).toString('base64')}`
};

async function checkCRMPlanos() {
    try {
        const url = `https://${host}/webservice/v1/crm_planos_negociacoes`;
        const body = JSON.stringify({
            qtype: 'crm_planos_negociacoes.id_plano',
            query: '500',
            oper: '=',
            page: '1',
            rp: '5',
            sortname: 'crm_planos_negociacoes.id',
            sortorder: 'asc'
        });

        const res = await fetch(url, { method: 'POST', headers, body });
        const data = await res.json();
        console.log("Exemplo de crm_planos_negociacoes com id_plano = 500:");
        if (data.registros) console.log(data.registros[0]);
    } catch(err) {
        console.error(err);
    }
}
checkCRMPlanos();
