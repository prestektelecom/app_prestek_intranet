import dotenv from 'dotenv';
dotenv.config();

const API_URL = `https://${process.env.IXC_HOST}/webservice/v1`;
const API_TOKEN = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;

async function verifyID500() {
  try {
    const response = await fetch(`${API_URL}/cliente_contrato`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ixcsoft': 'listar',
        'Authorization': `Basic ${Buffer.from(API_TOKEN).toString('base64')}`
      },
      body: JSON.stringify({
        qtype: 'cliente_contrato.id_vd_contrato',
        query: '500',
        oper: '=',
        page: '1',
        rp: '5000',
        sortname: 'cliente_contrato.id',
        sortorder: 'desc'
      })
    });

    const data = await response.json();
    console.log(`Total de registros retornados (cliente_contrato) para id_vd_contrato=500: ${data.total}`);

    // If we only look at the current month:
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    let countThisMonth = 0;
    
    if (data.registros) {
        data.registros.forEach(r => {
            if (r.data_cadastro_sistema && r.data_cadastro_sistema >= firstDay) {
                countThisMonth++;
            }
        });
    }
    console.log(`Desses, quantos foram ativados a partir de ${firstDay}? ${countThisMonth}`);

  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

verifyID500();
