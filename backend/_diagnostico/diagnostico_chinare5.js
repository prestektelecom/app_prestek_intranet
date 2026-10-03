/**
 * Diagnóstico 5: Contratos CHINARE incluindo os com cidade_id=0
 * Verifica se os 84 contratos estão nos 19.487 sem localização
 * Execute: node diagnostico_chinare5.js
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
    console.log('🔍 DIAGNÓSTICO 5 — CHINARE nos 21.515 contratos (inclui sem cidade)');
    console.log('='.repeat(65));

    console.log('\n⏳ Buscando todos os 21.515 contratos ativos (3 páginas)...');
    const todos = await buscarTodosContratos();
    console.log(`   Coletados: ${todos.length} contratos`);

    // Filtrar TODOS que tenham bairro CHINARE (com ou sem cidade)
    const chinare = todos.filter(c =>
        String(c.bairro || '').trim().toUpperCase() === 'CHINARE'
    );
    console.log(`\n📍 Total CHINARE (todos status_cidade): ${chinare.length}`);

    // Separar com cidade vs sem cidade
    const comCidade  = chinare.filter(c => c.cidade && String(c.cidade) !== '0');
    const semCidade  = chinare.filter(c => !c.cidade || String(c.cidade) === '0');
    console.log(`   Com cidade_id: ${comCidade.length}`);
    console.log(`   Sem cidade_id (descartados): ${semCidade.length}`);

    // Status de TODOS os chinare
    const porStatus = {};
    chinare.forEach(c => {
        const st    = String(c.status || 'N/A').trim();
        const stInt = String(c.status_internet || 'N/A').trim();
        const chave = `${st} / ${stInt}`;
        porStatus[chave] = (porStatus[chave] || 0) + 1;
    });
    console.log(`\n📊 Status de TODOS contratos CHINARE (ativos no IXC):`);
    Object.entries(porStatus).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        console.log(`   ${String(v).padStart(3)} × "${k}"`);
    });

    // Verificar cidades dos com_cidade
    const cidades = [...new Set(comCidade.map(c => `[${c.cidade}] ${c.endereco || '?'}`))];
    console.log(`\n📊 Cidades dos contratos COM cidade_id:`);
    comCidade.forEach(c => console.log(`   [cidade=${c.cidade}] id=${c.id} status=${c.status}/${c.status_internet}`));

    // Mostrar IDs dos sem cidade
    if (semCidade.length > 0) {
        console.log(`\n📋 IDs dos contratos CHINARE sem cidade_id:`);
        console.log(`   ${semCidade.map(c => c.id).join(', ')}`);
        
        const porStatusSem = {};
        semCidade.forEach(c => {
            const st    = String(c.status || 'N/A').trim();
            const stInt = String(c.status_internet || 'N/A').trim();
            const chave = `${st} / ${stInt}`;
            porStatusSem[chave] = (porStatusSem[chave] || 0) + 1;
        });
        console.log(`   Status:`);
        Object.entries(porStatusSem).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
            console.log(`     ${String(v).padStart(3)} × "${k}"`);
        });
    }

    console.log('\n' + '='.repeat(65));
    console.log(`📊 RESUMO: ${chinare.length} contratos CHINARE totais`);
    console.log(`   Com localização: ${comCidade.length} (visíveis no mapa)`);
    console.log(`   Sem localização: ${semCidade.length} (ocultos — cidade_id=0)`);
    console.log('='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
