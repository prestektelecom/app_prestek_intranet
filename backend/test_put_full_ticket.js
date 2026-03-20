import fs from 'fs';
import 'dotenv/config';

async function updateTicketFull() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    // 1. GET TICKET
    const resGet = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_ticket.id', query: '733165', oper: '=', page: '1', rp: '1' })
    });
    const dataGet = await resGet.json();
    const ticketRecord = dataGet.registros[0];

    // 2. PUT
    const updateBody = JSON.stringify({
        ...ticketRecord,
        su_status: 'AG'
    });

    const url = `https://${host}/webservice/v1/su_ticket/733165`;
    const resPut = await fetch(url, {
        method: 'PUT',
        headers,
        body: updateBody
    });
    
    const putStatus = await resPut.json();
    console.log("PUT Response:", putStatus);
    
    // 3. GET verify
    const resGet2 = await fetch(`https://${host}/webservice/v1/su_ticket`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_ticket.id', query: '733165', oper: '=', page: '1', rp: '1' })
    });
    const dataGet2 = await resGet2.json();
    console.log("Status final do Ticket:", dataGet2.registros[0].su_status);

    // 4. GET OS verify
    const resGetOS = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST',
        headers: { ...headers, ixcsoft: 'listar' },
        body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: '733165', oper: '=', page: '1', rp: '1' })
    });
    const dataGetOS = await resGetOS.json();
    console.log("Status final da OS:", dataGetOS.registros[0].status);
}
updateTicketFull();
