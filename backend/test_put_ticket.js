import fs from 'fs';
import 'dotenv/config';

async function updateTicket() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    };

    const url = `https://${host}/webservice/v1/su_ticket/733165`;
    const body = JSON.stringify({
        su_status: 'AG'
    });
    
    const res = await fetch(url, {
        method: 'PUT',
        headers,
        body
    });
    const putStatus = await res.json();
    console.log("Ticket PUT Response:", putStatus);
}
updateTicket();
