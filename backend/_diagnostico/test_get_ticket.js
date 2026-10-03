import fs from 'fs';
import 'dotenv/config';

async function getTicket() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };
    const resGet = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_ticket.id', query: '733165', oper: '=', page: '1', rp: '1' })
    });
    const dataGet = await resGet.json();
    fs.writeFileSync('ticket_data.json', JSON.stringify(dataGet.registros[0], null, 2));
}
getTicket();
