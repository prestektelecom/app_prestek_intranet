import 'dotenv/config';
import { writeFileSync } from 'fs';

async function checkIXC() {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        const bodyContratos = JSON.stringify({
            qtype: 'cliente_contrato.status',
            query: 'A',
            oper: '=',
            page: '1',
            rp: '9999',
            sortname: 'cliente_contrato.id',
            sortorder: 'asc'
        });

        const resContratos = await fetch(`https://${host}/webservice/v1/cliente_contrato`, {
            method: 'POST', headers, body: bodyContratos
        });
        const dadosContratos = await resContratos.json();
        const contratos = dadosContratos.registros || [];

        const cidadeIdsSet = new Set();
        contratos.forEach(c => {
            const cidId = String(c.cidade || '').trim();
            if (cidId && cidId !== '0') cidadeIdsSet.add(cidId);
        });

        const cidadeIds = Array.from(cidadeIdsSet);
        const mapaCidades = {};

        if (cidadeIds.length > 0) {
            const bodyCidades = JSON.stringify({
                qtype: 'cidade.id',
                query: '0',
                oper: '>',
                page: '1',
                rp: '9999',
                sortname: 'cidade.nome',
                sortorder: 'asc'
            });
            const resCidades = await fetch(`https://${host}/webservice/v1/cidade`, {
                method: 'POST', headers, body: bodyCidades
            });
            const dadosCidades = await resCidades.json();
            (dadosCidades.registros || []).forEach(cid => {
                if (cidadeIdsSet.has(String(cid.id))) {
                    mapaCidades[String(cid.id)] = { nome: cid.nome, uf: cid.uf };
                }
            });
        }

        const wrongContracts = [];

        contratos.forEach(c => {
            const cidId = String(c.cidade || '').trim();
            if (cidId && cidId !== '0') {
                const cidInfo = mapaCidades[cidId];
                if (cidInfo) {
                    const uf = (cidInfo.uf || '').trim().toUpperCase();
                    if (uf !== 'AL' && uf !== 'SE') {
                        wrongContracts.push({
                            contrato: c.id,
                            estado: uf,
                            cidade: cidInfo.nome,
                            bairro: c.bairro
                        });
                    }
                }
            }
        });

        writeFileSync('audit_results.json', JSON.stringify(wrongContracts, null, 2));
        console.log(`Salvos ${wrongContracts.length} contratos inválidos em audit_results.json`);
    } catch(e) { console.error(e); }
}

checkIXC();
