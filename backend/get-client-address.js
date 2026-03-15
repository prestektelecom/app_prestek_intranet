import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST
const url = `https://${host}/webservice/v1/cliente`

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

const body = JSON.stringify({
    qtype: 'cliente.id',
    query: '681',
    oper: '=',
    page: '1',
    rp: '1'
})

async function test() {
    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        if (dados.registros && dados.registros.length > 0) {
            const r = dados.registros[0];
            console.log('Dados do Cliente 681:');
            console.log(`Endereço: ${r.endereco}`);
            console.log(`Número: ${r.numero}`);
            console.log(`Bairro: ${r.bairro}`);
            console.log(`Cidade: ${r.cidade}`);
            console.log(`Latitude: ${r.latitude}`);
            console.log(`Longitude: ${r.longitude}`);
            console.log(`CEP: ${r.cep}`);
            console.log(`Complemento: ${r.complemento}`);
            console.log('JSON completo:', JSON.stringify(r, null, 2));
        } else {
            console.log('Cliente não encontrado.')
        }
    } catch (e) {
        console.error(e)
    }
}

test()
