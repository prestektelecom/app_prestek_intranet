/**
 * Diagnóstico Fase 2 — Análise profunda de contratos perdidos
 * Verifica: paginação funciona? Contratos sem cidade são descartados?
 * Qual % dos 21.515 tem cidade+bairro válidos?
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';

const host    = process.env.IXC_HOST;
const token   = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
const headers = {
    'Content-Type': 'application/json',
    Authorization:  'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft:        'listar'
};

async function ixcPost(endpoint, body) {
    const res = await fetch(`https://${host}/webservice/v1/${endpoint}`, {
        method: 'POST', headers, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function buscarPagina(page, rp = 9999) {
    return ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.status',
        query: 'A', oper: '=',
        page: String(page), rp: String(rp),
        sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
}

async function main() {
    console.log('='.repeat(65));
    console.log('🔬 DIAGNÓSTICO FASE 2 — Análise Completa de Contratos');
    console.log('='.repeat(65));

    // ── Verificar paginação ──────────────────────────────────────────
    console.log('\n📌 Verificando paginação com rp=9999...');
    const pg1 = await buscarPagina(1);
    const pg2 = await buscarPagina(2);
    const pg3 = await buscarPagina(3);
    const p1 = pg1.registros || [];
    const p2 = pg2.registros || [];
    const p3 = pg3.registros || [];
    console.log(`   Página 1: ${p1.length} registros`);
    console.log(`   Página 2: ${p2.length} registros`);
    console.log(`   Página 3: ${p3.length} registros`);
    console.log(`   Total coletado nas 3 páginas: ${p1.length + p2.length + p3.length}`);
    console.log(`   Total reportado: ${pg1.total}`);

    // Verificar IDs duplicados entre páginas
    const ids1 = new Set(p1.map(c => c.id));
    const ids2 = new Set(p2.map(c => c.id));
    const ids3 = new Set(p3.map(c => c.id));
    const overlap12 = [...ids1].filter(id => ids2.has(id)).length;
    const overlap23 = [...ids2].filter(id => ids3.has(id)).length;
    console.log(`   Sobreposição pág1 vs pág2:  ${overlap12}`);
    console.log(`   Sobreposição pág2 vs pág3:  ${overlap23}`);

    // ── Analisar todos os contratos coletados ─────────────────────────
    const todos = [...p1, ...p2, ...p3];
    console.log('\n📌 Análise dos contratos coletados (3 páginas = 21.515+ contratos):');

    const semCidade    = todos.filter(c => !c.cidade || String(c.cidade) === '0').length;
    const semBairro    = todos.filter(c => !c.bairro || String(c.bairro).trim() === '').length;
    const comCidadeBairro = todos.filter(c =>
        c.cidade && String(c.cidade) !== '0' &&
        c.bairro && String(c.bairro).trim() !== ''
    ).length;
    const soCidade     = todos.filter(c =>
        c.cidade && String(c.cidade) !== '0' &&
        (!c.bairro || String(c.bairro).trim() === '')
    ).length;

    console.log(`   Total contratos (3 páginas): ${todos.length}`);
    console.log(`   Sem cidade (invisíveis):     ${semCidade}`);
    console.log(`   Sem bairro (invisíveis):     ${semBairro}`);
    console.log(`   Com cidade mas sem bairro:   ${soCidade}`);
    console.log(`   Com cidade E bairro (visíveis): ${comCidadeBairro}`);

    // Combos únicos
    const combos = new Set(todos
        .filter(c => c.cidade && String(c.cidade) !== '0')
        .map(c => `${c.cidade}::${String(c.bairro || '').trim().toUpperCase()}`)
    );
    console.log(`   Combos cidade+bairro únicos: ${combos.size}`);

    // Cidades únicas
    const cidades = new Set(todos
        .filter(c => c.cidade && String(c.cidade) !== '0')
        .map(c => String(c.cidade))
    );
    console.log(`   Cidades únicas (com contratos): ${cidades.size}`);

    // Distribuição por cidade (top 10)
    const porCidade = {};
    todos.forEach(c => {
        const cid = String(c.cidade || '(sem cidade)');
        porCidade[cid] = (porCidade[cid] || 0) + 1;
    });
    const top10 = Object.entries(porCidade).sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log('\n📌 Top 10 cidades por quantidade de contratos:');
    top10.forEach(([cid, qtd]) => console.log(`   cidade_id=${cid}: ${qtd} contratos`));

    // Status dos contratos (verificação extra)
    const porStatus = {};
    todos.forEach(c => {
        const st = c.status || '(sem status)';
        porStatus[st] = (porStatus[st] || 0) + 1;
    });
    console.log('\n📌 Distribuição de status (devem ser todos "A"):');
    Object.entries(porStatus).forEach(([st, qtd]) => console.log(`   status='${st}': ${qtd}`));

    // Salvar resultado resumido
    const relatorio = {
        timestamp: new Date().toISOString(),
        total_ixc: parseInt(pg1.total),
        coletados_3_paginas: todos.length,
        sem_cidade: semCidade,
        sem_bairro: semBairro,
        com_cidade_e_bairro: comCidadeBairro,
        combos_unicos: combos.size,
        cidades_unicas: cidades.size,
        por_status: porStatus,
        top10_cidades: Object.fromEntries(top10)
    };
    writeFileSync('./diagnostico_fase2.json', JSON.stringify(relatorio, null, 2));
    console.log('\n✅ Relatório salvo em diagnostico_fase2.json');

    console.log('\n' + '='.repeat(65));
    console.log('📊 CAUSAS RAÍZES IDENTIFICADAS:');
    console.log('='.repeat(65));
    console.log(`1. PAGINAÇÃO: rp=9999 retorna máx 9.999 de ${pg1.total} contratos`);
    console.log(`   → Solução: Buscar todas as páginas em paralelo`);
    console.log(`2. DADOS INCOMPLETOS: ${semCidade} contratos sem cidade_id são ignorados`);
    console.log(`   → Solução: Agrupar no nó "Cidade Desconhecida" ou filtrar e contar`);
    console.log(`3. DADOS INCOMPLETOS: ${semBairro} contratos sem bairro são agrupados`);
    console.log(`   → Solução: Usar "(sem bairro)" como bairro padrão para não perder`);
    console.log('='.repeat(65));
}

main().catch(console.error);
