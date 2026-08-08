// Listas de referência para o cadastro de colaborador.
//
// ─── Por que este arquivo não é trivial ──────────────────────────────────────
// Três dos cinco FKs obrigatórios NÃO têm recurso próprio acessível nesta
// instalação do IXC. Medido em 2026-08-08 contra sistema.prestek.com.br:
//
//   filial                  ✓  20 registros
//   empresa_setor           ✓  60 registros (id_departamento)
//   fl_funcoes              ✗  "Recurso fl_funcoes não está disponível!"
//   usuarios_grupo          ✗  "Recurso usuarios_grupo não está disponível!"
//   grupo                   ✗  "Recurso grupo não está disponível!"
//   planejamento_analitico  ✓  52.481 registros — inutilizável como select
//
// ⚠️ O IXC sinaliza recurso indisponível com HTTP 200 + {type:'error'}. Sem a
// checagem que ixcListar faz, isso vira lista vazia silenciosa — é o que
// acontece hoje com a rota /api/grupos do projeto, que devolve [] há tempos sem
// ninguém perceber.
//
// ─── A saída: derivar dos registros que existem ──────────────────────────────
// `funcionarios` (478) e `usuarios` (444) ESTÃO acessíveis e carregam os FKs
// preenchidos. Então em vez de um select vazio, derivamos as opções do uso real
// e ordenamos por frequência, com um exemplo de quem usa cada valor. O operador
// escolhe por analogia — "que id_funcao tem o outro técnico?" — que é
// exatamente como ele resolveria isso abrindo o IXC.
//
// Listas derivadas vêm marcadas em `derivados` para que a UI possa avisar que
// aquilo não é um cadastro oficial, e sim uma inferência.

import { ixcListar, paginarIXC } from './ixc.js';
import { cacheGet, cacheSet, TTL } from '../cache.js';

// Ordena por frequência de uso, depois por id. O valor mais usado no topo é o
// palpite certo na maioria das vezes.
function porFrequencia(a, b) {
    if (b.emUso !== a.emUso) return b.emUso - a.emUso;
    return (parseInt(a.id) || 0) - (parseInt(b.id) || 0);
}

// Conta ocorrências de um campo numa lista de registros, guardando um exemplo
// legível de quem usa cada valor.
function distribuir(registros, campo, campoNome) {
    const mapa = new Map();
    for (const reg of registros) {
        const valor = String(reg[campo] ?? '').trim();
        if (!valor || valor === '0') continue;
        const atual = mapa.get(valor) || { emUso: 0, exemplo: '' };
        atual.emUso += 1;
        if (!atual.exemplo && reg[campoNome]) atual.exemplo = String(reg[campoNome]);
        mapa.set(valor, atual);
    }
    return mapa;
}

// ─── Fontes diretas ──────────────────────────────────────────────────────────

async function carregarFiliais() {
    const registros = await ixcListar('filial', { qtype: 'filial.id' });
    return registros
        .map(f => ({
            id: String(f.id),
            rotulo: String(f.filial || f.fantasia || f.razao_social || `Filial ${f.id}`),
        }))
        .sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
}

async function carregarDepartamentos() {
    const registros = await ixcListar('empresa_setor', { qtype: 'empresa_setor.id' });
    return registros
        .map(s => {
            const rotulo = String(s.setor || s.descricao || `Setor ${s.id}`);
            return {
                id: String(s.id),
                rotulo,
                // A flag `ativo` do IXC não é confiável aqui: existem setores com
                // ativo='S' cujo nome começa com "(INATIVO)" — a desativação foi
                // feita renomeando, não pelo campo. Vale o mais pessimista dos dois.
                ativo: s.ativo !== 'N' && !/^\s*\(INATIVO\)/i.test(rotulo),
            };
        })
        // Inativos ficam no fim, mas continuam na lista: um valor herdado da
        // ficha ainda precisa resolver para um rótulo legível.
        .sort((a, b) => {
            if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
            return a.rotulo.localeCompare(b.rotulo, 'pt-BR');
        });
}

// ─── Fontes derivadas ────────────────────────────────────────────────────────

// `funcionarios` é a única janela para id_funcao: fl_funcoes não responde e
// nenhum campo textual de função existe no registro (116 campos verificados —
// só id_departamento, id_funcao e id_setor_padrao citam o assunto).
async function carregarFuncionarios() {
    const CHAVE = 'ixc:ti:funcionarios-brutos';
    const cache = cacheGet(CHAVE);
    if (cache.hit) return cache.data;

    const registros = await ixcListar('funcionarios', {
        qtype: 'funcionarios.id',
        rp: '9999',
    });
    const enxuto = registros.map(f => ({
        id: String(f.id),
        funcionario: f.funcionario || '',
        id_funcao: String(f.id_funcao ?? ''),
        id_conta: String(f.id_conta ?? ''),
        id_departamento: String(f.id_departamento ?? ''),
        filial_id: String(f.filial_id ?? ''),
    }));
    cacheSet(CHAVE, enxuto, TTL.TI_TAXONOMIAS);
    return enxuto;
}

function derivarFuncoes(funcionarios) {
    const dist = distribuir(funcionarios, 'id_funcao', 'funcionario');
    return [...dist.entries()]
        .map(([id, { emUso, exemplo }]) => ({
            id,
            // Não há nome em lugar nenhum. O rótulo honesto é o próprio id, e o
            // exemplo é o que dá sentido à escolha.
            rotulo: `Função ${id}`,
            emUso,
            exemplo,
        }))
        .sort(porFrequencia);
}

// `usuarios` responde (444 registros) e carrega id_grupo. A tabela local
// grupos_nomes cobre o que alguém já nomeou à mão — hoje uma linha só, mas o
// mecanismo existe e vale reaproveitar.
async function carregarGrupos(pool) {
    const usuarios = await ixcListar('usuarios', { qtype: 'usuarios.id', rp: '9999' });
    const dist = distribuir(usuarios, 'id_grupo', 'nome');

    let nomes = new Map();
    try {
        const { rows } = await pool.query('SELECT id_grupo, nome FROM grupos_nomes');
        nomes = new Map(rows.map(r => [String(r.id_grupo), r.nome]));
    } catch (e) {
        console.warn('[taxonomias] grupos_nomes indisponível:', e.message);
    }

    return [...dist.entries()]
        .map(([id, { emUso, exemplo }]) => ({
            id,
            rotulo: nomes.get(id) || `Grupo ${id}`,
            nomeado: nomes.has(id),
            emUso,
            exemplo,
        }))
        .sort(porFrequencia);
}

// planejamento_analitico tem 52.481 registros — a maioria é conta por cliente
// ("FULANO DE TAL (cliente)"). As que interessam são as ~105 que colaboradores
// existentes realmente usam, e essas têm nome útil: "Salários e Ordenados -
// T.I.", "Salários e Ordenados - Comercial e Marketing".
//
// Então: pega os id_conta em uso, e resolve só esses. Um select de 105 opções
// nomeadas, em vez de 52 mil.
async function carregarContas(funcionarios) {
    const CHAVE = 'ixc:ti:contas';
    const cache = cacheGet(CHAVE);
    if (cache.hit) return cache.data;

    const dist = distribuir(funcionarios, 'id_conta', 'funcionario');
    if (!dist.size) return [];

    const { registros } = await paginarIXC(
        'planejamento_analitico',
        { qtype: 'planejamento_analitico.id', query: '0', oper: '>' },
        {
            concorrencia: 1,
            timeoutMs: 120000,
            projetar: c => ({ id: String(c.id), nome: c.planejamento_analitico || '' }),
        }
    );
    const nomes = new Map(registros.map(c => [c.id, c.nome]));

    // Nem toda conta em uso é conta de folha: há colaboradores apontando para
    // contas de cliente e de fornecedor (PJ, provavelmente). São válidas — estão
    // em uso de verdade — mas para um cadastro novo a escolha certa é quase
    // sempre uma "Salários e Ordenados - <Setor>". A flag deixa a UI agrupar sem
    // esconder as demais.
    const ehFolha = (nome) => /sal[áa]rio|ordenado|13[ºo°]?\.?\s*sal/i.test(nome);

    const contas = [...dist.entries()]
        .map(([id, { emUso }]) => {
            const rotulo = nomes.get(id) || `Conta ${id}`;
            return { id, rotulo, emUso, folha: ehFolha(rotulo) };
        })
        .sort((a, b) => {
            if (a.folha !== b.folha) return a.folha ? -1 : 1;
            return porFrequencia(a, b);
        });

    cacheSet(CHAVE, contas, TTL.IXC_CIDADES); // 24h — plano de contas é estável
    return contas;
}

// ─── Montagem ────────────────────────────────────────────────────────────────

export async function carregarTaxonomias(pool) {
    const CHAVE = 'ixc:ti:taxonomias';
    const cache = cacheGet(CHAVE);
    if (cache.hit) return cache.data;

    // funcionarios alimenta duas listas; carrega uma vez só.
    let funcionarios = [];
    let erroFuncionarios = null;
    try {
        funcionarios = await carregarFuncionarios();
    } catch (e) {
        erroFuncionarios = e.message;
    }

    const fontes = [
        ['filiais',        'direta',   () => carregarFiliais()],
        ['departamentos',  'direta',   () => carregarDepartamentos()],
        ['funcoes',        'derivada', async () => derivarFuncoes(funcionarios)],
        ['grupos',         'derivada', () => carregarGrupos(pool)],
        ['contas',         'derivada', () => carregarContas(funcionarios)],
    ];

    const resultados = await Promise.allSettled(fontes.map(([, , fn]) => fn()));

    const taxonomias = {};
    const derivados = [];
    const vazios = [];

    resultados.forEach((resultado, i) => {
        const [chave, origem] = fontes[i];
        if (resultado.status !== 'fulfilled') {
            console.warn(`[taxonomias] ${chave} falhou: ${resultado.reason?.message}`);
            taxonomias[chave] = [];
            vazios.push(chave);
            return;
        }
        taxonomias[chave] = resultado.value;
        if (origem === 'derivada') derivados.push(chave);
        if (!resultado.value.length) vazios.push(chave);
    });

    const payload = {
        taxonomias,
        // Listas inferidas do uso real em vez de lidas de um cadastro próprio.
        // A UI deve avisar o operador — o valor pode existir no IXC sem que
        // nenhum colaborador atual o utilize, e nesse caso não aparece aqui.
        derivados,
        vazios,
        ...(erroFuncionarios ? { avisoFuncionarios: erroFuncionarios } : {}),
    };

    cacheSet(CHAVE, payload, TTL.TI_TAXONOMIAS);
    return payload;
}
