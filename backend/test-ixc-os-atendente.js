import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    try {
        const t1 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                qtype: 'su_oss_chamado.id_atendente',
                query: '68',
                oper: '=',
                page: '1',
                rp: '50'
            })
        }).then(r => r.json());
        
        console.log("OS onde id_atendente = 68 -> Total:", t1.total);
        if(t1.total > 0) {
            console.log("OSs onde ele é atendente:", t1.registros.map(r => r.id).join(', '));
        }
        
    } catch (e) {
        console.error(e)
    }
}

test()
