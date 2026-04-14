/**
 * Diagnóstico: Pesquisa de contratos pelo bairro CHINARE
 * Verifica os contratos do bairro e seus status detalhados
 * Execute: node diagnostico_chinare.js
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

// Busca todas as páginas de contratos ativos
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
    console.log(`   Total coletado: ${todos.length}/${total} (${totalPags} pág.)`);
    return todos;
}

async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO — Contratos do bairro CHINARE (Igreja Nova/AL)');
    console.log('='.repeat(65));

    const todos = await buscarTodosContratos();

    // Filtrar por bairro CHINARE (case-insensitive, trim)
    const chinare = todos.filter(c =>
        String(c.bairro || '').trim().toUpperCase() === 'CHINARE'
    );

    console.log(`\n📍 Contratos no bairro CHINARE: ${chinare.length}`);

    // Mostrar campos disponíveis nos contratos
    if (chinare.length > 0) {
        console.log(`\n📋 Campos disponíveis no registro:`);
        console.log(`   ${Object.keys(chinare[0]).join(', ')}`);

        // Análise de status
        const porStatus = {};
        chinare.forEach(c => {
            const st    = String(c.status || 'N/A').trim();
            const stInt = String(c.status_internet || 'N/A').trim();
            const chave = `${st} / ${stInt}`;
            porStatus[chave] = (porStatus[chave] || 0) + 1;
        });

        console.log(`\n📊 Distribuição de status:`);
        Object.entries(porStatus).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
            console.log(`   ${String(v).padStart(3)} × ${k}`);
        });

        console.log(`\n📜 Lista de IDs dos contratos:`);
        console.log(`   ${chinare.map(c => c.id).join(', ')}`);
    }

    // Verificar também bairros similares (chinara, chinaé, etc)
    const similares = todos.filter(c => {
        const b = String(c.bairro || '').trim().toUpperCase();
        return b.includes('CHINA') && b !== 'CHINARE';
    });
    if (similares.length > 0) {
        console.log(`\n⚠️  Bairros similares encontrados:`);
        const uniq = [...new Set(similares.map(c => String(c.bairro || '').trim().toUpperCase()))];
        uniq.forEach(b => {
            const n = similares.filter(c => String(c.bairro || '').trim().toUpperCase() === b).length;
            console.log(`   "${b}": ${n} contrato(s)`);
        });
    }

    console.log('\n' + '='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
