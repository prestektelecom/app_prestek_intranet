// Cliente HTTP do IXC — extraído de server.js sem alteração de comportamento.
//
// ⚠️ A URL real da API é `https://${IXC_HOST}/webservice/v1/${recurso}`, com POST
// e o header `ixcsoft` definindo a operação (`listar` | `incluir`). A documentação
// em docs/querys_ixc_prestek/ descreve `/api/v1/<form>/` com verbos REST — está
// errada para este ambiente. A referência é este arquivo.

// ─── Helper: fetch IXC com timeout (15s) e 1 retry automático ─────────────────
// Evita que chamadas lentas ou travadas bloqueiem o servidor indefinidamente.
export async function fetchIXC(url, options = {}, timeoutMs = 15000) {
    const tentar = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    };
    try {
        return await tentar();
    } catch (err) {
        // 1 retry automático em caso de falha/timeout
        console.warn(`[fetchIXC] Retry após erro em ${url}: ${err.message}`);
        return await tentar();
    }
}

// ─── Helper: cabeçalhos padrão de listagem do IXC ────────────────────────────
export function ixcHeaders() {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    return {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };
}

// ─── Helper: paginação completa de um recurso IXC ────────────────────────────
// A API tem teto de 9.999 registros por página e não suporta operador `in`, então
// busca em lote é sempre "traz tudo e filtra em memória". A página 1 revela o
// total; as demais seguem com concorrência limitada. Uma página que falhe entra
// como vazia em vez de derrubar a coleta inteira — o chamador compara
// `registros.length` com `total` para saber se veio completo.
//
// Três parâmetros existem por causa de limites reais que já nos morderam:
//  - timeoutMs: listagem de milhares de registros não cabe nos 15s padrão do
//    fetchIXC; o abort disparava retry e multiplicava a carga.
//  - projetar: aplicado por página, descarta o registro bruto na hora. Sem isso,
//    5 páginas de cliente (166 campos cada) estouram o heap.
//  - concorrencia: várias páginas gigantes simultâneas derrubam o processo.
export const IXC_RP_MAX = 9999;

export async function paginarIXC(endpoint, baseBody, opts = {}) {
    const {
        rp = IXC_RP_MAX,
        timeoutMs = 120000,
        projetar = null,
        concorrencia = 3,
    } = opts;

    const url     = `https://${process.env.IXC_HOST}/webservice/v1/${endpoint}`;
    const headers = ixcHeaders();
    const corpo   = (page) => JSON.stringify({ ...baseBody, page: String(page), rp: String(rp) });
    const aplicar = (lista) => projetar ? lista.map(projetar) : lista;

    const res1 = await fetchIXC(url, { method: 'POST', headers, body: corpo(1) }, timeoutMs);
    if (!res1.ok) throw new Error(`IXC HTTP ${res1.status} em ${endpoint} (pág. 1)`);
    const pg1 = await res1.json();

    const total   = parseInt(pg1.total || 0);
    const paginas = Math.max(1, Math.ceil(total / rp));
    const registros = aplicar(pg1.registros || []);

    // Uma página é grande demais para desistir na primeira falha: o IXC derruba a
    // conexão ("terminated") sob carga, e uma página perdida vira dado faltando
    // silenciosamente lá na frente. Três tentativas com espera crescente.
    const buscarPagina = async (pg) => {
        for (let tentativa = 1; tentativa <= 3; tentativa++) {
            try {
                const r = await fetchIXC(url, { method: 'POST', headers, body: corpo(pg) }, timeoutMs);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return await r.json();
            } catch (err) {
                if (tentativa === 3) {
                    console.warn(`[paginarIXC] ${endpoint} pág. ${pg} falhou após 3 tentativas: ${err.message}`);
                    return { registros: [] };
                }
                await new Promise(r => setTimeout(r, 1000 * tentativa));
            }
        }
    };

    // Lotes de `concorrencia` páginas por vez. Para recursos volumosos vale
    // concorrencia 1: páginas grandes em paralelo é justamente o que faz o IXC
    // cortar a conexão.
    const restantes = Array.from({ length: paginas - 1 }, (_, i) => i + 2);
    for (let i = 0; i < restantes.length; i += concorrencia) {
        const lote = restantes.slice(i, i + concorrencia);
        const respostas = await Promise.all(lote.map(buscarPagina));
        respostas.forEach(d => {
            for (const reg of aplicar(d.registros || [])) registros.push(reg);
        });
    }
    return { registros, total, paginas };
}

// ─── Endereço de um recurso ──────────────────────────────────────────────────
export const ixcUrl = (recurso) => `https://${process.env.IXC_HOST}/webservice/v1/${recurso}`;

// ─── Listagem simples (uma página) ───────────────────────────────────────────
// Para o caso comum: buscar poucos registros por um critério. Quando o volume é
// desconhecido ou grande, use paginarIXC.
//
// O default `oper: '>'` com `query: '0'` é o idioma do IXC para "todos" — não há
// operador de listagem sem filtro.
export async function ixcListar(recurso, {
    qtype,
    query = '0',
    oper = '>',
    page = '1',
    rp = '1000',
    sortname,
    sortorder = 'asc',
    timeoutMs = 15000,
} = {}) {
    const body = {
        qtype, query, oper,
        page: String(page),
        rp: String(rp),
        ...(sortname ? { sortname, sortorder } : {}),
    };

    const res = await fetchIXC(ixcUrl(recurso), {
        method: 'POST',
        headers: ixcHeaders(),
        body: JSON.stringify(body),
    }, timeoutMs);

    if (!res.ok) {
        const err = new Error(`IXC HTTP ${res.status} em ${recurso}`);
        err.status = res.status;
        err.recurso = recurso;
        throw err;
    }

    const dados = await res.json();

    // ⚠️ O IXC sinaliza recurso inexistente ou sem permissão com HTTP **200** e
    // um corpo `{type:'error', message:'Recurso X não está disponível!'}`.
    // Sem esta checagem, `dados.registros || []` transforma a falha numa lista
    // vazia indistinguível de "não há registros" — e o chamador nunca sabe que
    // perguntou errado. Confirmado na prática com fl_funcoes e usuarios_grupo.
    if (dados && dados.type === 'error') {
        const err = new Error(dados.message || `Recurso ${recurso} indisponível no IXC`);
        err.recurso = recurso;
        err.ixcError = true;
        throw err;
    }

    return dados.registros || [];
}

// ─── Criação e atualização ───────────────────────────────────────────────────
// FASE 2 — escritos agora para que o desenho fique versionado junto com o
// dry-run que os simula, mas NENHUMA rota os chama ainda. A gravação real de
// colaborador é uma change à parte.

// Único precedente no projeto: su_oss_chamado (server.js). A forma da resposta
// `{ type: 'success', id }` está comprovada para aquele recurso — não assuma
// para outros sem verificar.
export async function ixcIncluir(recurso, payload, { timeoutMs = 30000 } = {}) {
    const res = await fetchIXC(ixcUrl(recurso), {
        method: 'POST',
        headers: { ...ixcHeaders(), ixcsoft: 'incluir' },
        body: JSON.stringify(payload),
    }, timeoutMs);

    const texto = await res.text();
    let dados;
    try {
        dados = JSON.parse(texto);
    } catch {
        throw new Error(`IXC devolveu resposta não-JSON ao incluir em ${recurso}: ${texto.slice(0, 200)}`);
    }

    if (!res.ok || dados.type !== 'success') {
        throw new Error(dados.message || `Falha ao incluir em ${recurso} (HTTP ${res.status})`);
    }
    return dados;
}

// ⚠️ O IXC SOBRESCREVE O REGISTRO INTEIRO num PUT. Enviar só os campos alterados
// apaga todos os demais. O chamador precisa reler o registro e passar o spread
// completo — é o padrão já usado no PUT /api/funcionario/:usuarioId de server.js.
//
// Note que este PUT vai SEM o header `ixcsoft`, ao contrário de listar/incluir.
export async function ixcAtualizar(recurso, id, registroCompleto, { timeoutMs = 30000 } = {}) {
    const { ixcsoft, ...headers } = ixcHeaders();
    const res = await fetchIXC(`${ixcUrl(recurso)}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(registroCompleto),
    }, timeoutMs);

    const texto = await res.text();
    let dados;
    try {
        dados = JSON.parse(texto);
    } catch {
        throw new Error(`IXC devolveu resposta não-JSON ao atualizar ${recurso}/${id}: ${texto.slice(0, 200)}`);
    }

    if (!res.ok || (dados.type && dados.type !== 'success')) {
        throw new Error(dados.message || `Falha ao atualizar ${recurso}/${id} (HTTP ${res.status})`);
    }
    return dados;
}
