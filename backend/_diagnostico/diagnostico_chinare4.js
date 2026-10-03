/**
 * Diagnóstico 4: Busca por "Chinare" como localidade/cidade no IXC
 * O usuário menciona 84 contratos — pode ser uma localidade, não bairro
 * Execute: node diagnostico_chinare4.js
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
        method: 'POST', headers, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${endpoint}`);
    return res.json();
}

async function main() {
    console.log('='.repeat(65));
    console.log('🔍 DIAGNÓSTICO 4 — Chinare como localidade ou cidade no IXC');
    console.log('='.repeat(65));

    // 1. Buscar cidades com nome "Chinare" no IXC
    console.log('\n📌 ETAPA 1 — Buscar cidade "Chinare" no endpoint /cidade');
    const rCidades = await ixcPost('cidade', {
        qtype: 'cidade.nome', query: 'Chinare', oper: 'like',
        page: '1', rp: '50',
        sortname: 'cidade.nome', sortorder: 'asc'
    });
    console.log(`   Cidades encontradas: ${rCidades.total}`);
    (rCidades.registros || []).forEach(c => {
        console.log(`   [${c.id}] ${c.nome} - UF: ${c.uf}`);
    });

    // 2. Buscar contratos com tipo_localidade contendo "chinare"
    console.log('\n📌 ETAPA 2 — Buscar contratos por tipo_localidade "CHINARE"');
    const rLoc = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.tipo_localidade', query: 'CHINARE', oper: 'like',
        page: '1', rp: '200',
        sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    console.log(`   Contratos por localidade: ${rLoc.total}`);
    if (rLoc.total > 0 && rLoc.registros?.length > 0) {
        const porStatus = {};
        (rLoc.registros || []).forEach(c => {
            const st    = String(c.status || 'N/A').trim();
            const stInt = String(c.status_internet || 'N/A').trim();
            const chave = `${st} / ${stInt}`;
            porStatus[chave] = (porStatus[chave] || 0) + 1;
        });
        Object.entries(porStatus).forEach(([k, v]) => console.log(`   ${v} × "${k}"`));
    }

    // 3. Buscar contratos por endereco contendo "chinare"
    console.log('\n📌 ETAPA 3 — Buscar contratos por endereço contendo "CHINARE"');
    const rEnd = await ixcPost('cliente_contrato', {
        qtype: 'cliente_contrato.endereco', query: 'CHINARE', oper: 'like',
        page: '1', rp: '200',
        sortname: 'cliente_contrato.id', sortorder: 'asc'
    });
    console.log(`   Contratos por endereço: ${rEnd.total}`);

    // 4. Buscar condomínios com nome CHINARE
    console.log('\n📌 ETAPA 4 — Buscar condomínios "CHINARE"');
    const rCond = await ixcPost('condominio', {
        qtype: 'condominio.nome', query: 'CHINARE', oper: 'like',
        page: '1', rp: '50',
        sortname: 'condominio.nome', sortorder: 'asc'
    });
    console.log(`   Condomínios: ${rCond.total}`);
    (rCond.registros || []).forEach(c => console.log(`   [${c.id}] ${c.nome}`));

    console.log('\n' + '='.repeat(65));
}

main().catch(e => console.error('❌ Erro:', e.message));
