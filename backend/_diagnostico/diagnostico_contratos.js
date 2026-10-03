/**
 * Diagnóstico: Divergência de contratos no Mapa de Cobertura de Rede
 * Verifica o total real de contratos ativos no IXC e quantas páginas
 * são necessárias para buscar todos (problema: rp=9999 mas há 21.515)
 */
import 'dotenv/config';

const host    = process.env.IXC_HOST;
const token   = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
const headers = {
    'Content-Type': 'application/json',
    Authorization:  'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft:        'listar'
};

async function ixcPost(endpoint, body) {
    const res = await fetch(`https://${host}/webservice/v1/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${endpoint}`);
    return res.json();
}

// ── 1. Consulta página 1 com rp=1 apenas para descobrir o total ──────────────
async function getTotalContratos() {
    const data = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status',
        query: 'A',
        oper: '=',
        page: '1',
        rp: '1',            // mínimo: só queremos o total
        sortname: 'cliente_contrato.id',
        sortorder: 'asc'
    });
    return {
        total:    parseInt(data.total || data.count || 0),
        paginas:  parseInt(data.paginas || 1),
        registros: (data.registros || []).length
    };
}

// ── 2. Consulta com rp=9999 (como está hoje) ─────────────────────────────────
async function getContratosRp9999() {
    const data = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status',
        query: 'A',
        oper: '=',
        page: '1',
        rp: '9999',
        sortname: 'cliente_contrato.id',
        sortorder: 'asc'
    });
    return {
        total:    parseInt(data.total || data.count || 0),
        paginas:  parseInt(data.paginas || 1),
        retornados: (data.registros || []).length,
        campos_disponiveis: Object.keys((data.registros || [{}])[0] || {})
    };
}

// ── 3. Conta cidades/bairros únicos em uma amostra de contratos ───────────────
async function analisarAmostra(contratos) {
    const semCidade = contratos.filter(c => !c.cidade || c.cidade === '0').length;
    const semBairro = contratos.filter(c => !c.bairro || c.bairro === '').length;
    const cidadesUnicas = new Set(contratos.map(c => String(c.cidade || '')).filter(x => x && x !== '0'));
    const combos = new Set(contratos.map(c =>
        `${c.cidade || ''}::${String(c.bairro || '').trim().toUpperCase()}`
    ));
    return { semCidade, semBairro, cidadesUnicas: cidadesUnicas.size, combosUnicos: combos.size };
}

// ── 4. Verificar se a API tem campo 'total' confiável ──────────────────────────
async function verificarMetadados() {
    const page1 = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status', query: 'A', oper: '=',
        page: '1', rp: '100', sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    const page2 = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status', query: 'A', oper: '=',
        page: '2', rp: '100', sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    return {
        total_reportado: page1.total || page1.count,
        total_paginas:   page1.paginas,
        registros_p1:   (page1.registros || []).length,
        registros_p2:   (page2.registros || []).length,
        campos_meta:     Object.keys(page1).filter(k => k !== 'registros')
    };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO — Divergência de Contratos no Mapa de Cobertura');
    console.log('='.repeat(65));

    try {
        console.log('\n📌 ETAPA 1 — Total real de contratos ativos (IXC)');
        const totalInfo = await getTotalContratos();
        console.log(`   Total reportado pela API: ${totalInfo.total}`);
        console.log(`   Total de páginas:         ${totalInfo.paginas}`);
        console.log(`   Registros retornados(rp=1): ${totalInfo.registros}`);

        console.log('\n📌 ETAPA 2 — Comportamento atual (rp=9999)');
        const rp9999 = await getContratosRp9999();
        console.log(`   Total reportado pela API: ${rp9999.total}`);
        console.log(`   Registros retornados:     ${rp9999.retornados}`);
        console.log(`   Páginas restantes:        ${rp9999.paginas}`);
        console.log(`   ⚠️  Contratos PERDIDOS:    ${rp9999.total - rp9999.retornados}`);
        console.log(`   Campos disponíveis:       ${rp9999.campos_disponiveis.join(', ')}`);

        console.log('\n📌 ETAPA 3 — Análise de amostra (9.999 contratos buscados)');
        // Buscar de novo para analisar
        const data = await ixcPost('cliente_contrato', {
            qtype: 'cliente_contrato.status', query: 'A', oper: '=',
            page: '1', rp: '9999', sortname: 'cliente_contrato.id', sortorder: 'asc'
        });
        const contratos = data.registros || [];
        const analise = await analisarAmostra(contratos);
        console.log(`   Sem cidade (campo vazio/0): ${analise.semCidade}`);
        console.log(`   Sem bairro (campo vazio):   ${analise.semBairro}`);
        console.log(`   Cidades únicas:             ${analise.cidadesUnicas}`);
        console.log(`   Combos cidade+bairro únicos:${analise.combosUnicos}`);

        console.log('\n📌 ETAPA 4 — Metadados de paginação da API');
        const meta = await verificarMetadados();
        console.log(`   Campo 'total' da API:       ${meta.total_reportado}`);
        console.log(`   Campo 'paginas' da API:     ${meta.total_paginas}`);
        console.log(`   Registros na pág. 1:        ${meta.registros_p1}`);
        console.log(`   Registros na pág. 2:        ${meta.registros_p2}`);
        console.log(`   Campos de metadados:        ${meta.campos_meta.join(', ')}`);

        console.log('\n' + '='.repeat(65));
        console.log('📊 RESUMO DO DIAGNÓSTICO:');
        console.log('='.repeat(65));
        const perdidos = rp9999.total - rp9999.retornados;
        console.log(`  Total real de contratos ativos: ${rp9999.total}`);
        console.log(`  Contratos visíveis no mapa:     ${rp9999.retornados}`);
        console.log(`  Contratos invisíveis (perdidos):${perdidos}`);
        console.log(`  Causa raiz: rp=9999 limita a ${rp9999.retornados} registros`);
        console.log(`  Páginas necessárias (rp=9999):  ${Math.ceil(rp9999.total / 9999)}`);
        console.log('='.repeat(65));

    } catch (err) {
        console.error('\n❌ Erro no diagnóstico:', err.message);
    }
}

main();
