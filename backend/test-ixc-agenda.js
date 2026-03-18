import fetch from 'node-fetch';

const host = process.env.IXC_HOST;
const token = process.env.IXC_USER_ID + ':' + process.env.IXC_TOKEN_SECRET;

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
};

async function checkRoute(route) {
    try {
        const res = await fetch(`https://${host}/webservice/v1/${route}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ qtype: 'id', query: '0', oper: '>', page: '1', rp: '1' })
        });
        const text = await res.text();
        if (text.includes('invalid') || text.includes('Error') || text.includes('nao encontrado')) {
            console.log(route, '-> Error/Not Found');
        } else {
            console.log(route, '-> SUCCESS:', text.substring(0, 150));
        }
    } catch(e) {
        console.log(route, '-> Exception');
    }
}

async function run() {
    await checkRoute('su_oss_chamado_agenda');
    await checkRoute('su_oss_chamado_agendamento');
    await checkRoute('su_oss_chamado_agendar');
    await checkRoute('su_agenda');
    await checkRoute('su_oss_agenda');
}

run();
