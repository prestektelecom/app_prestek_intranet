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

// ─── Motor de workflow (wfl_*) — vínculo Processo ↔ assunto do IXC ──────────
// Nunca consultado por este projeto antes de 2026-09-25; confirmado ao vivo
// que os 4 recursos abaixo são listáveis pela mesma API webservice (não
// precisa de acesso SQL direto ao IXC, que este projeto não tem).

// Lista processos de workflow ativos, para o seletor do formulário de
// Processo — o admin escolhe por nome, nunca digita um id cru.
export async function listarWflProcessosAtivos() {
    const registros = await ixcListar('wfl_processo', {
        qtype: 'wfl_processo.ativo',
        query: 'S',
        oper: '=',
        rp: '500',
    });
    return registros
        .map(r => ({ id: Number(r.id), descricao: r.descricao }))
        .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));
}

// Resolve o id_assunto do IXC a partir da primeira tarefa ATIVA (menor
// `sequencia`) de um wfl_processo que efetivamente abre OS.
//
// Uma tarefa pode ter mais de uma linha em wfl_interacoes — confirmado ao
// vivo (tarefa real com 2 interações, uma com id_wfl_param_os=0 que NÃO
// gera OS). Pegar "a primeira" sem filtrar resolveria errado nesse caso;
// por isso filtramos por id_wfl_param_os != 0 e, se sobrar mais de uma,
// usamos a de menor id (regra documentada em design.md D3 — nunca
// observada na prática, mas precisa ser determinística se aparecer).
//
// As mensagens de erro lançadas aqui são texto curado nosso (não payload
// bruto do IXC/driver) — marcadas com `err.curado = true` pra quem chama
// saber que são seguras de repassar ao cliente HTTP como estão. Qualquer
// outro erro (rede, IXC fora do ar, resposta inesperada) sobe sem essa
// marca e deve ser trocado por uma mensagem genérica antes de responder.
function erroCurado(mensagem) {
    return Object.assign(new Error(mensagem), { curado: true });
}

// Duas (ou mais) tarefas podem ter a MESMA `sequencia` — confirmado ao vivo
// no processo real "CRM VENDAS INTERNAS/EXTERNA (revisado)" (id 235): a
// sequencia 1 tem uma tarefa órfã ("GERAR TAXA DE CONTRATAÇÃO/REATIVAÇÃO",
// `id_proxima_tarefa=0`, não encadeia com o resto do fluxo) ao lado da
// tarefa que de fato abre o processo ("CRM VENDAS INTERNAS/EXTERNAS",
// `id_proxima_tarefa=2`, segue para a sequência 2) — e as DUAS resolvem
// para um assunto válido e diferente, então pegar qualquer uma sem critério
// erra silenciosamente (sem lançar erro nenhum). O mesmo par duplicado
// aparece até no processo gêmeo inativo (215), reforçando que não é
// coincidência de um caso isolado.
//
// Critério: entre as tarefas empatadas na menor sequência, preferir as que
// efetivamente continuam o fluxo (`id_proxima_tarefa != 0`) — uma tarefa
// com `id_proxima_tarefa = 0` é um fim de linha, não um começo. Se restar
// exatamente uma, é essa. Se a ambiguidade persistir (nenhuma ou mais de
// uma conectada), não adivinha: erro curado explícito, pra não repetir o
// mesmo tipo de acerto-por-sorte que este caso expôs.
function escolherPrimeiraTarefa(tarefasAtivas) {
    if (tarefasAtivas.length === 0) return null;
    const menorSequencia = Math.min(...tarefasAtivas.map(t => Number(t.sequencia)));
    const candidatas = tarefasAtivas.filter(t => Number(t.sequencia) === menorSequencia);
    if (candidatas.length === 1) return candidatas[0];

    const conectadas = candidatas.filter(t => Number(t.id_proxima_tarefa) !== 0);
    if (conectadas.length === 1) return conectadas[0];

    return null;
}

export async function resolverAssuntoWorkflow(idWflProcesso) {
    const idProcessoStr = String(idWflProcesso);

    const tarefas = await ixcListar('wfl_tarefa', {
        qtype: 'wfl_tarefa.id_processo',
        query: idProcessoStr,
        oper: '=',
        rp: '200',
    });
    const tarefasAtivas = tarefas.filter(t => t.ativo === 'S');
    if (tarefasAtivas.length === 0) {
        throw erroCurado('Este processo do IXC não tem nenhuma tarefa configurada.');
    }
    const primeiraTarefa = escolherPrimeiraTarefa(tarefasAtivas);
    if (!primeiraTarefa) {
        throw erroCurado('Este processo do IXC tem mais de uma tarefa inicial configurada (sequência duplicada) e não foi possível determinar automaticamente qual delas abre a Ordem de Serviço. Avise a TI para revisar o fluxo no IXC.');
    }

    const interacoes = await ixcListar('wfl_interacoes', {
        qtype: 'wfl_interacoes.id_tarefa',
        query: String(primeiraTarefa.id),
        oper: '=',
        rp: '50',
    });
    const interacoesValidas = interacoes
        .filter(i => i.ativo === 'S' && Number(i.id_wfl_param_os) !== 0)
        .sort((a, b) => Number(a.id) - Number(b.id));
    const interacaoEscolhida = interacoesValidas[0];
    if (!interacaoEscolhida) {
        throw erroCurado('A tarefa inicial deste processo não abre Ordem de Serviço.');
    }

    const parametrosOss = await ixcListar('wfl_parametro_oss', {
        qtype: 'wfl_parametro_oss.id',
        query: String(interacaoEscolhida.id_wfl_param_os),
        oper: '=',
        rp: '5',
    });
    const idAssunto = Number(parametrosOss[0]?.id_assunto);
    if (!idAssunto) {
        throw erroCurado('Não foi possível determinar o assunto do IXC para este processo.');
    }

    // Nome do assunto é só para exibição (tooltip) — não deve derrubar a
    // resolução se essa chamada específica falhar ou não achar nada.
    let nomeAssunto = null;
    try {
        const assuntos = await ixcListar('su_oss_assunto', {
            qtype: 'su_oss_assunto.id',
            query: String(idAssunto),
            oper: '=',
            rp: '5',
        });
        nomeAssunto = assuntos[0]?.assunto || null;
    } catch (err) {
        console.warn(`[resolverAssuntoWorkflow] Falha ao buscar nome do assunto ${idAssunto}: ${err.message}`);
    }

    return { idAssunto, nomeAssunto };
}
