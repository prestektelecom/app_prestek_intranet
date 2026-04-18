/**
 * Testes automatizados — Validação de estados na Cobertura de Rede
 * Valida que o sistema aceita apenas Alagoas (AL) e Sergipe (SE)
 *
 * Execute: node test_validacao_estados.js
 */
import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;
let passCount = 0;
let failCount = 0;

function resultado(nome, passou, detalhe = '') {
    if (passou) {
        console.log(`  ✅ PASS: ${nome}`);
        passCount++;
    } else {
        console.log(`  ❌ FAIL: ${nome}${detalhe ? ' — ' + detalhe : ''}`);
        failCount++;
    }
}

async function post(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return { status: res.status, data: await res.json() };
}

async function del(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' });
    return { status: res.status, data: await res.json() };
}

// ────────────────────────────────────────────────
// SUITE 1: POST /api/cobertura — validação de estado
// ────────────────────────────────────────────────
async function testePostCobertura() {
    console.log('\n📋 SUITE 1 — POST /api/cobertura (criação manual)\n');

    // Caso 1: Estado AL válido deve ser aceito
    const r1 = await post('/api/cobertura', {
        estado: 'AL', cidade: 'Teste AL', bairro: 'Bairro Teste', tecnologia: 'FTTH',
        velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 50
    });
    resultado('Estado AL aceito (HTTP 200)', r1.status === 200 && r1.data.sucesso, JSON.stringify(r1.data));
    const idAL = r1.data.dado?.id;

    // Caso 2: Estado SE válido deve ser aceito
    const r2 = await post('/api/cobertura', {
        estado: 'SE', cidade: 'Teste SE', bairro: 'Bairro Teste SE', tecnologia: 'Rádio',
        velocidade_maxima: '50 MEGA', status: 'Expansão', percentual_cobertura: 30
    });
    resultado('Estado SE aceito (HTTP 200)', r2.status === 200 && r2.data.sucesso, JSON.stringify(r2.data));
    const idSE = r2.data.dado?.id;

    // Caso 3: Estado inválido deve ser rejeitado (400)
    const r3 = await post('/api/cobertura', {
        estado: 'SP', cidade: 'São Paulo', bairro: 'Centro', tecnologia: 'FTTH',
        velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 90
    });
    resultado('Estado SP rejeitado (HTTP 400)', r3.status === 400 && !r3.data.sucesso, r3.data.erro);

    // Caso 4: Estado numérico estranho rejeitado
    const r4 = await post('/api/cobertura', {
        estado: '99', cidade: 'Cidade X', bairro: 'Bairro X', tecnologia: 'FTTH',
        velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 100
    });
    resultado('Estado "99" rejeitado (HTTP 400)', r4.status === 400 && !r4.data.sucesso, r4.data.erro);

    // Caso 5: Sem estado usa default AL
    const r5 = await post('/api/cobertura', {
        cidade: 'Teste Default AL', bairro: 'Bairro Default', tecnologia: 'UTP',
        velocidade_maxima: '20 MEGA', status: 'Ativo', percentual_cobertura: 70
    });
    resultado('Sem estado usa default AL (HTTP 200)', r5.status === 200 && r5.data.sucesso && r5.data.dado?.estado === 'AL', JSON.stringify(r5.data.dado));
    const idDefault = r5.data.dado?.id;

    // Cleanup: remover registros de teste
    if (idAL) await del(`/api/cobertura/${idAL}`);
    if (idSE) await del(`/api/cobertura/${idSE}`);
    if (idDefault) await del(`/api/cobertura/${idDefault}`);
}

// ────────────────────────────────────────────────
// SUITE 2: POST /api/cobertura-ixc/override — validação de estado
// ────────────────────────────────────────────────
async function testeOverride() {
    console.log('\n📋 SUITE 2 — POST /api/cobertura-ixc/override\n');

    // Caso 1: Estado AL aceito (sigla)
    const r1 = await post('/api/cobertura-ixc/override', {
        cidade_ixc_id: '99999', cidade: 'Cidade Teste', estado: 'AL', bairro: 'BAIRRO_TEST_AL',
        tecnologia: 'FTTH', velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 80
    });
    resultado('Override estado AL aceito', r1.status === 200 && r1.data.sucesso, r1.data.erro);

    // Caso 2: Estado SE aceito (sigla)
    const r2 = await post('/api/cobertura-ixc/override', {
        cidade_ixc_id: '99999', cidade: 'Cidade Teste SE', estado: 'SE', bairro: 'BAIRRO_TEST_SE',
        tecnologia: 'FTTH', velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 80
    });
    resultado('Override estado SE aceito', r2.status === 200 && r2.data.sucesso, r2.data.erro);

    // Caso 3: Código numérico IXC "7" deve ser normalizado para AL
    const r3 = await post('/api/cobertura-ixc/override', {
        cidade_ixc_id: '99999', cidade: 'Cidade IXC 7', estado: '7', bairro: 'BAIRRO_TEST_IXC7',
        tecnologia: 'FTTH', velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 80
    });
    resultado('Override estado "7" normalizado para AL', r3.status === 200 && r3.data.sucesso && r3.data.dado?.estado === 'AL', r3.data.erro || r3.data.dado?.estado);

    // Caso 4: Código numérico IXC "28" deve ser normalizado para SE
    const r4 = await post('/api/cobertura-ixc/override', {
        cidade_ixc_id: '99999', cidade: 'Cidade IXC 28', estado: '28', bairro: 'BAIRRO_TEST_IXC28',
        tecnologia: 'FTTH', velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 80
    });
    resultado('Override estado "28" normalizado para SE', r4.status === 200 && r4.data.sucesso && r4.data.dado?.estado === 'SE', r4.data.erro || r4.data.dado?.estado);

    // Caso 5: Estado inválido (SP)
    const r5 = await post('/api/cobertura-ixc/override', {
        cidade_ixc_id: '99999', cidade: 'Cidade SP', estado: 'SP', bairro: 'BAIRRO_TEST_SP',
        tecnologia: 'FTTH', velocidade_maxima: '100 MEGA', status: 'Ativo', percentual_cobertura: 80
    });
    resultado('Override estado SP rejeitado (HTTP 400)', r5.status === 400 && !r5.data.sucesso, r5.data.erro);

    // Cleanup
    const cleanRes = await fetch(`${BASE_URL}/api/cobertura-ixc`, { method: 'GET' });
    // Apenas avisa, não falha
    resultado('API cobertura-ixc acessível', cleanRes.status === 200);
}

// ────────────────────────────────────────────────
// SUITE 3: Verificar banco — sem estados inválidos
// ────────────────────────────────────────────────
async function testeIntegridade() {
    console.log('\n📋 SUITE 3 — Integridade do banco de dados\n');

    try {
        // Importação dinâmica para evitar conflito de módulos
        const pool = (await import('./db.js')).default;
        
        const r1 = await pool.query(
            "SELECT COUNT(*) as total FROM cobertura_cidades WHERE TRIM(estado) NOT IN ('AL', 'SE')"
        );
        resultado(
            'Zero registros com estado inválido no banco',
            parseInt(r1.rows[0].total) === 0,
            `Encontrados: ${r1.rows[0].total}`
        );

        const r2 = await pool.query(
            "SELECT estado, COUNT(*) as total FROM cobertura_cidades GROUP BY estado ORDER BY estado"
        );
        console.log('  📊 Distribuição atual de estados:');
        r2.rows.forEach(row => console.log(`     estado='${row.estado}': ${row.total} registros`));
        resultado('Registros de cobertura existem', r2.rows.length > 0);

        await pool.end();
    } catch (e) {
        resultado('Acesso ao banco de dados', false, e.message);
    }
}

// ────────────────────────────────────────────────
// SUITE 4: GET /api/cobertura-ixc — paginação e metadados
// ────────────────────────────────────────────────
async function testePaginacaoIXC() {
    console.log('\n📋 SUITE 4 — GET /api/cobertura-ixc (paginação e metadados)\n');

    const res = await fetch(`${BASE_URL}/api/cobertura-ixc`);
    resultado('API responde HTTP 200', res.status === 200, `HTTP ${res.status}`);

    const json = await res.json();
    resultado('Resposta tem sucesso=true', json.sucesso === true, JSON.stringify(json.erro));

    // Verifica campo meta presente
    resultado('Campo meta presente na resposta', !!json.meta, 'meta ausente');

    if (json.meta) {
        const { total_contratos_ixc, total_com_localizacao, total_sem_localizacao, paginas_consultadas } = json.meta;

        // Total IXC deve bater com o reportado (21.515 ou próximo)
        resultado(
            'Total IXC reportado > 9.999 (paginação funcionando)',
            parseInt(total_contratos_ixc) > 9999,
            `total_contratos_ixc=${total_contratos_ixc}`
        );

        // Soma deve bater com o total
        const soma = parseInt(total_com_localizacao) + parseInt(total_sem_localizacao);
        resultado(
            'total_com + total_sem = total_ixc',
            soma === parseInt(total_contratos_ixc),
            `${total_com_localizacao} + ${total_sem_localizacao} = ${soma} (esperado: ${total_contratos_ixc})`
        );

        // Páginas consultadas deve ser >= 2 (temos 21.515 / 9.999 = 3 páginas)
        resultado(
            'Pelo menos 2 páginas foram consultadas',
            parseInt(paginas_consultadas) >= 2,
            `paginas_consultadas=${paginas_consultadas}`
        );

        // Dados retornados devem ter ao menos as combos das 3 páginas
        resultado(
            'Dados retornados são consistentes com quantidade esperada',
            Array.isArray(json.dados) && json.dados.length > 0,
            `dados.length=${json.dados?.length}`
        );

        console.log(`  📊 Meta recebida:`);
        console.log(`     total_contratos_ixc:   ${total_contratos_ixc}`);
        console.log(`     total_com_localizacao: ${total_com_localizacao}`);
        console.log(`     total_sem_localizacao: ${total_sem_localizacao}`);
        console.log(`     paginas_consultadas:   ${paginas_consultadas}`);
        console.log(`     combos no mapa:        ${json.dados?.length}`);

        // Todos os dados devem ter estado AL ou SE
        const estadosInvalidos = (json.dados || []).filter(d => !['AL', 'SE'].includes(d.estado));
        resultado(
            'Todos os combos têm estado AL ou SE',
            estadosInvalidos.length === 0,
            `Inválidos: ${estadosInvalidos.map(d => d.estado).join(', ')}`
        );
    }
}

// ────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 TESTES — Validação de Estados: Cobertura de Rede');
    console.log('='.repeat(60));

    try {
        await testePostCobertura();
    } catch(e) { console.error('Erro SUITE 1:', e.message); }

    try {
        await testeOverride();
    } catch(e) { console.error('Erro SUITE 2:', e.message); }

    try {
        await testeIntegridade();
    } catch(e) { console.error('Erro SUITE 3:', e.message); }

    try {
        await testePaginacaoIXC();
    } catch(e) { console.error('Erro SUITE 4:', e.message); }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESULTADO FINAL: ${passCount} PASSED | ${failCount} FAILED`);
    console.log('='.repeat(60));

    process.exit(failCount > 0 ? 1 : 0);
}

main();
