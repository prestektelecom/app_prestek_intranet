import fs from 'fs';
import 'dotenv/config';

async function checkRoute(route) {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };
    try {
        const res = await fetch(`https://${host}/webservice/v1/${route}`, {
            method: 'POST',
            headers: { ...headers, ixcsoft: 'listar' },
            body: JSON.stringify({ qtype: 'id', query: '0', oper: '>', page: '1', rp: '1' })
        });
        const text = await res.text();
        if (text.includes('invalid') || text.includes('Error') || text.includes('nao encontrado') || text.includes('não está disponível')) {
            // fs.appendFileSync('agenda_routes2.log', `${route} -> Not Found\n`);
        } else {
            fs.appendFileSync('agenda_routes2.log', `${route} -> SUCCESS: ${text.substring(0, 150)}\n`);
        }
    } catch(e) {}
}

async function run() {
    fs.writeFileSync('agenda_routes2.log', '');
    const routes = [
        'agenda', 'agenda_compromisso', 'agenda_pessoal', 'wfl_tarefa', 'su_status', 'su_oss_chamado_status', 'agendamento'
    ];
    for (const r of routes) {
        await checkRoute(r);
    }
}
run();
