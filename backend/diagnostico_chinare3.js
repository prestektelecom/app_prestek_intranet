/**
 * Diagnóstico 3: Entender o sistema de pesquisa de cobertura
 * - Verifica o que a API /api/cobertura-ixc retorna para o bairro CHINARE
 * - Compara com o total esperado de 84 contratos
 * Execute: node diagnostico_chinare3.js
 */
import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;

async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO 3 — API /api/cobertura-ixc + filtro CHINARE');
    console.log('='.repeat(65));

    // 1. Chamar a API de cobertura
    console.log('\n📌 ETAPA 1 — Chamar GET /api/cobertura-ixc');
    const res = await fetch(`${BASE_URL}/api/cobertura-ixc`);
    const json = await res.json();
    console.log(`   HTTP: ${res.status}, sucesso: ${json.sucesso}`);
    console.log(`   Total combos retornados: ${json.total}`);
    console.log(`   Meta: ${JSON.stringify(json.meta)}`);

    // 2. Filtrar por CHINARE
    const dados = json.dados || [];
    const chinare = dados.filter(d =>
        String(d.bairro || '').toUpperCase().includes('CHINARE')
    );
    console.log(`\n📍 Combos com "CHINARE" no bairro: ${chinare.length}`);
    chinare.forEach(c => {
        console.log(`   [${c.cidade_ixc_id}] ${c.cidade} / ${c.bairro} → ${c.total_contratos} contratos`);
    });

    // 3. Verificar o total somado
    const totalChinare = chinare.reduce((acc, c) => acc + (c.total_contratos || 0), 0);
    console.log(`\n   Total contratos em combos CHINARE: ${totalChinare}`);

    // 4. Verificar o filtro atual no Coverage.jsx
    // O filtro usa: r.cidade?.toLowerCase().includes(b) || r.bairro?.toLowerCase().includes(b)
    // Simular filtro:
    const termoBusca = 'chinare';
    const filtrado = dados.filter(r =>
        r.cidade?.toLowerCase().includes(termoBusca) ||
        r.bairro?.toLowerCase().includes(termoBusca)
    );
    console.log(`\n📌 ETAPA 2 — Simulando filtro frontend ("${termoBusca}")`);
    console.log(`   Combos após filtro: ${filtrado.length}`);
    filtrado.forEach(c => {
        console.log(`   ${c.cidade} / ${c.bairro} → ${c.total_contratos} contratos`);
    });

    // 5. Verificar bairros que começam com CHINA
    const china = dados.filter(d => String(d.bairro || '').toUpperCase().startsWith('CHINA'));
    console.log(`\n📌 ETAPA 3 — Bairros começando com "CHINA":`);
    china.forEach(c => {
        console.log(`   [${c.cidade_ixc_id}] ${c.cidade} / "${c.bairro}" → ${c.total_contratos} contratos`);
    });

    console.log('\n' + '='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
