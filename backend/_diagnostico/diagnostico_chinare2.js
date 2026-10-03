/**
 * Diagnóstico 2: Pesquisa CHINARE sem filtro de status
 * Busca TODOS os contratos (ativos, bloqueados, cancelados, etc)
 * Execute: node diagnostico_chinare2.js
 */
import 'dotenv/config';

const host    = process.env.IXC_HOST;
const token   = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
const headers = {
    'Content-Type': 'application/json',
    Authorization:  'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft:        'listar'
};
const IXC_RP = 9999;

async function ixcPost(endpoint, body) {
    const res = await fetch(`https://${host}/webservice/v1/${endpoint}`, {
        method: 'POST', headers, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${endpoint}`);
    return res.json();
}

async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO 2 — Todos os contratos CHINARE (sem filtro status)');
    console.log('='.repeat(65));

    // Busca por bairro direto no IXC (todos os status)
    console.log('\n📌 ETAPA 1 — Busca por bairro=CHINARE diretamente no IXC');
    const r1 = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.bairro',
        query: 'CHINARE',
        oper: '=',
        page: '1', rp: '200',
        sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    const todos1 = r1.registros || [];
    console.log(`   Total reportado: ${r1.total}, retornados: ${todos1.length}`);

    // Análise de status
    const porStatus = {};
    todos1.forEach(c => {
        const st    = String(c.status || 'N/A').trim();
        const stInt = String(c.status_internet || 'N/A').trim();
        const chave = `${st} / ${stInt}`;
        porStatus[chave] = (porStatus[chave] || 0) + 1;
    });
    console.log(`\n📊 Distribuição de status (todos):`);
    Object.entries(porStatus).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        console.log(`   ${String(v).padStart(3)} × "${k}"`);
    });

    // ETAPA 2 — Busca apenas ativos (status=A) por bairro
    console.log('\n📌 ETAPA 2 — Apenas ativos (status=A) no bairro CHINARE');
    const r2 = await ixcPost('cliente_contrato', {
        qtype:     'cliente_contrato.bairro',
        query:     'CHINARE',
        oper:      '=',
        page:      '1', rp: '200',
        sortname:  'cliente_contrato.id', sortorder: 'asc',
        grid_param: JSON.stringify([{ TB: 'cliente_contrato.status', OP: '=', P: 'A' }])
    });
    const ativos = r2.registros || [];
    console.log(`   Total ativos: ${r2.total}, retornados: ${ativos.length}`);

    const porStatusAtivos = {};
    ativos.forEach(c => {
        const st    = String(c.status || 'N/A').trim();
        const stInt = String(c.status_internet || 'N/A').trim();
        const chave = `${st} / ${stInt}`;
        porStatusAtivos[chave] = (porStatusAtivos[chave] || 0) + 1;
    });
    console.log(`\n📊 Status dos contratos ativos:`);
    Object.entries(porStatusAtivos).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        console.log(`   ${String(v).padStart(3)} × "${k}"`);
    });

    console.log('\n' + '='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
