import dotenv from 'dotenv';
dotenv.config();

const host = process.env.IXC_HOST;
const API_TOKEN = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;

async function test() {
    // Pegando a data de hoje (YYYY-MM-DD)
    const data = new Date().toISOString().split('T')[0];
    const bodyStr = 'qtype=cliente.data_cadastro&query=' + encodeURIComponent(data) + '&oper=%3E%3D&page=1&rp=50&sortname=cliente.data_cadastro&sortorder=desc';

    console.log('--- TESTANDO API IXC (Native Fetch) ---');
    console.log('Data detectada (Hoje):', data);

    try {
        const response = await fetch(`https://${host}/webservice/v1/cliente`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(API_TOKEN).toString('base64'),
                'ixcsoft': 'listar',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyStr
        });

        const text = await response.text();
        console.log('Status HTTP:', response.status);
        
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.log('Resposta bruta do IXC:', text);
            return;
        }

        console.log('Total de registros (parsed.total):', parsed.total);
        console.log('Quantidade de registros na lista (parsed.registros.length):', parsed.registros ? parsed.registros.length : 0);

        if (parsed.registros && parsed.registros.length > 0) {
            console.log('Exemplo data_cadastro do primeiro registro:', parsed.registros[0].data_cadastro);
            
            const filtrados = parsed.registros.filter(c => c.data_cadastro && c.data_cadastro.startsWith(data));
            console.log('Total de registros hoje após .startsWith("' + data + '"):', filtrados.length);
        } else {
          console.log('Nenhum registro retornado. Confira o filtro ou rp=50.');
        }

    } catch (err) {
        console.error('Erro no teste:', err.message);
    }
}

test();
