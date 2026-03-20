import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve('backend/.env') });

async function investigateWFL() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    try {
        const endpoints = ['wfl_tarefa', 'wfl_processo', 'su_parametros', 'su_status', 'su_oss_chamado_status', 'su_oss_chamado_status_processo'];
        const results = {};

        const endpointsToTest = [
            'su_oss_chamado_mensagem',
            'su_mensagem',
            'su_ticket_mensagem'
        ];
        
        for(let ep of endpointsToTest) {
            console.log(`Fetching ${ep}...`);
            const res = await fetch(`https://${host}/webservice/v1/${ep}`, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: `${ep}.id`, query: '0', oper: '>', page: '1', rp: '2' })
            });
            try {
                const data = await res.json();
                results[ep] = data;
            } catch(e) {
                results[ep] = { error: 'invalid' };
            }
        }
        
        fs.writeFileSync('wfl_data.json', JSON.stringify(results, null, 2));
        console.log("Saved to wfl_data.json");
    } catch(e) {
        console.error(e);
    }
}
investigateWFL();
