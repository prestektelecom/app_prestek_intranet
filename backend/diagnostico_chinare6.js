/**
 * Diagnóstico 6: Investigar CHINARE em campos além do bairro
 * Busca por endereço, referência, observação, etc
 * Execute: node diagnostico_chinare6.js
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

async function buscarTodosContratos() {
    const pg1 = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status', query: 'A', oper: '=',
        page: '1', rp: String(IXC_RP),
        sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    const total     = parseInt(pg1.total || 0);
    const totalPags = Math.ceil(total / IXC_RP);
    let todos = [...(pg1.registros || [])];

    if (totalPags > 1) {
        const pags = Array.from({ length: totalPags - 1 }, (_, i) => i + 2);
        const resultados = await Promise.all(
            pags.map(pg => ixcPost('cliente_contrato', {
                qtype: 'cliente_contrato.status', query: 'A', oper: '=',
                page: String(pg), rp: String(IXC_RP),
                sortname: 'cliente_contrato.id', sortorder: 'asc'
            }))
        );
        resultados.forEach(r => { todos = todos.concat(r.registros || []); });
    }
    return todos;
}

async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO 6 — CHINARE em todos os campos do contrato');
    console.log('='.repeat(65));

    console.log('\n⏳ Buscando todos os 21.515 contratos ativos...');
    const todos = await buscarTodosContratos();
    console.log(`   Coletados: ${todos.length}\n`);

    // Verificar todos os campos de texto por "CHINA"
    const termoChina = 'china';
    const camposTexto = ['bairro', 'endereco', 'complemento', 'referencia', 'obs', 'obs_contrato',
                         'tipo_localidade', 'motivo_inclusao', 'descricao_aux_plano_venda'];

    for (const campo of camposTexto) {
        const encontrados = todos.filter(c =>
            String(c[campo] || '').toLowerCase().includes(termoChina)
        );
        if (encontrados.length > 0) {
            const valores = [...new Set(encontrados.map(c =>
                String(c[campo] || '').trim().toUpperCase()
            ))];
            console.log(`📍 Campo "${campo}": ${encontrados.length} contratos`);
            valores.slice(0, 5).forEach(v => {
                const n = encontrados.filter(c => String(c[campo] || '').trim().toUpperCase() === v).length;
                console.log(`   "${v}": ${n} contratos`);
            });
        }
    }

    // Verificar contratos por cidade_id = 1683 (Igreja Nova onde está CHINARE)
    const igrejaNova = todos.filter(c => String(c.cidade || '') === '1683');
    console.log(`\n📌 Contratos da cidade 1683 (Igreja Nova): ${igrejaNova.length}`);
    const bairrosIN = {};
    igrejaNova.forEach(c => {
        const b = String(c.bairro || '').trim().toUpperCase() || '(sem bairro)';
        bairrosIN[b] = (bairrosIN[b] || 0) + 1;
    });
    const sorted = Object.entries(bairrosIN).sort((a, b) => b[1] - a[1]);
    console.log(`   Top 10 bairros de Igreja Nova:`);
    sorted.slice(0, 10).forEach(([b, n]) => console.log(`   ${String(n).padStart(4)} × "${b}"`));

    console.log(`\n📊 Status dos contratos ativos de Igreja Nova (${igrejaNova.length} total):`);
    const stIN = {};
    igrejaNova.forEach(c => {
        const st    = String(c.status || 'N/A').trim();
        const stInt = String(c.status_internet || 'N/A').trim();
        stIN[`${st}/${stInt}`] = (stIN[`${st}/${stInt}`] || 0) + 1;
    });
    Object.entries(stIN).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) =>
        console.log(`   ${String(v).padStart(4)} × ${k}`)
    );

    console.log('\n' + '='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
