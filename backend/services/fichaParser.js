// Parser da ficha de registro. Devolve campos com confiança proporcional à
// evidência que os sustentou.
//
// Estratégias:
//   A — rótulo e valor na mesma linha → 1.0 (0.75 se texto livre)
//   B — rótulo isolado, valor na linha seguinte → 0.5
//   C — padrão global (regex de CPF/CEP/e-mail/telefone) → 0.35
//
// Modificadores:
//   • Normalizador que invalida o valor derruba para 0.35 e preserva o valor cru.
//   • Texto vindo de OCR multiplica por 0.7 — na prática todo campo de ficha
//     escaneada aparece em âmbar, que é o comportamento correto.

import {
    normalizarCPF,
    normalizarCEP,
    normalizarData,
    normalizarTelefone,
    normalizarNome,
    normalizarMoeda,
    normalizarPIS,
    mapearEstadoCivil,
    mapearEscolaridade,
    mapearSimNao,
} from './normalizadores.js';

const semAcento = (s) => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const colapsarEspacos = (s) => String(s || '')
    .replace(/\u00ad/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Rótulos casados do mais longo para o mais curto. Se `nome` viesse antes de
const REGRAS = [
    {
        campo: 'funcionario',
        rotulos: [
            'nome completo do colaborador', 'nome completo do empregado', 'nome completo do funcionario', 'nome completo do funcionário',
            'nome completo do candidato', 'nome completo do trabalhador', 'nome do colaborador', 'nome do empregado',
            'nome do funcionario', 'nome do funcionário', 'nome do candidato', 'nome do trabalhador',
            'nome do titular', 'nome do profissional', 'nome completo', 'nome do empregado/colaborador',
            'colaborador', 'empregado', 'funcionario', 'funcionário', 'trabalhador', 'candidato', 'nome'
        ],
        negativos: [
            'nome da mae', 'nome do pai', 'nome da mãe', 'nome do responsavel', 'nome do responsável',
            'nome do conjuge', 'nome do cônjuge', 'nome empresarial', 'nome social', 'nome fantasia',
            'nome da empresa', 'nome do empregador', 'nome do estabelecimento', 'razao social',
            'razao social do empregador', 'empregador', 'empresa', 'estabelecimento'
        ],
        normalizador: normalizarNome,
        tipoTextoLivre: true,
    },
    {
        campo: 'cpf_cnpj',
        rotulos: ['cpf do colaborador', 'cpf do empregado', 'cpf do funcionario', 'cpf/cnpj', 'cpf_cnpj', 'cpf'],
        normalizador: normalizarCPF,
        padraoGlobal: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
    },
    {
        campo: 'data_nascimento',
        rotulos: ['data de nascimento do colaborador', 'data de nascimento do empregado', 'data de nascimento', 'nascimento', 'dt nascimento', 'dt. nascimento', 'dt nasc', 'data nasc'],
        normalizador: normalizarData,
        padraoGlobal: /\b\d{2}[\/\-.]\d{2}[\/\-.]\d{4}\b/,
    },
    {
        campo: 'nacionalidade',
        rotulos: ['nacionalidade brasileira', 'nacionalidade'],
        tipoTextoLivre: true,
    },
    {
        campo: 'possui_deficiencia',
        rotulos: ['possui deficiencia', 'possui deficiência', 'portador de deficiencia', 'portador de deficiência', 'deficiencia', 'deficiência', 'pcd'],
        normalizador: mapearSimNao,
    },
    {
        campo: 'estado_civil',
        rotulos: ['estado civil do colaborador', 'estado civil do empregado', 'estado civil', 'est. civil', 'est civil', 'e. civil', 'est.civil', 'estcivil'],
        normalizador: mapearEstadoCivil,
    },
    {
        campo: 'grau_escolaridade',
        rotulos: [
            'grau de escolaridade', 'grau de instrucao', 'grau de instrução', 'nivel de escolaridade',
            'nível de escolaridade', 'nivel de instrucao', 'nível de instrução', 'escolaridade',
            'instrucao', 'instrução', 'formacao escolar', 'formação escolar', 'formacao', 'formação'
        ],
        normalizador: mapearEscolaridade,
    },

    // ── Filiação ────────────────────────────────────────────────────────
    {
        campo: 'nome_mae',
        rotulos: ['nome completo da mae', 'nome completo da mãe', 'nome da mae', 'nome da mãe', 'filiacao materna', 'filiação materna', 'mae', 'mãe'],
        normalizador: normalizarNome,
        tipoTextoLivre: true,
    },
    {
        campo: 'nome_pai',
        rotulos: ['nome completo do pai', 'nome do pai', 'filiacao paterna', 'filiação paterna', 'pai'],
        normalizador: normalizarNome,
        tipoTextoLivre: true,
    },

    // ── Documentos ──────────────────────────────────────────────────────
    {
        campo: 'ie_identidade',
        rotulos: ['carteira de identidade', 'cedula de identidade', 'cédula de identidade', 'registro geral', 'numero do rg', 'número do rg', 'identidade', 'rg'],
        negativos: ['rg do conjuge', 'rg conjuge', 'rg dependente'],
    },
    {
        campo: 'rg_orgao_emissor',
        rotulos: ['orgao expedidor / uf', 'órgão expedidor / uf', 'orgao emissor / uf', 'órgão emissor / uf', 'orgao emissor', 'órgão emissor', 'orgao expedidor', 'órgão expedidor', 'emissor / uf', 'expedicao / orgao', 'emissor'],
        tipoTextoLivre: true,
    },
    {
        campo: 'rg_data_emissao',
        rotulos: ['data de emissao do rg', 'data de expedicao do rg', 'data de emissao da identidade', 'data de expedicao da identidade', 'data de expedicao', 'data de expedição', 'data de emissao', 'data de emissão', 'dt expedicao', 'dt emissao'],
        negativos: ['data de expedicao da ctps', 'data de emissao da ctps'],
        normalizador: normalizarData,
    },
    {
        campo: 'ctps_numero',
        rotulos: ['carteira de trabalho e previdencia social', 'carteira de trabalho', 'numero da ctps', 'número da ctps', 'ctps no', 'ctps nº', 'ctps num', 'ctps', 'num ctps'],
    },
    {
        campo: 'ctps_serie',
        rotulos: ['serie da ctps', 'série da ctps', 'serie ctps', 'série ctps', 'serie', 'série'],
    },
    {
        campo: 'ctps_data_emissao',
        rotulos: ['data de expedicao da ctps', 'data de emissao da ctps', 'data de emissao ctps', 'expedicao ctps', 'emissao ctps', 'data ctps'],
        normalizador: normalizarData,
    },
    {
        campo: 'titulo_numero',
        rotulos: ['titulo de eleitor', 'título de eleitor', 'titulo eleitoral', 'título eleitoral', 'titulo', 'título'],
    },
    {
        campo: 'titulo_zona',
        rotulos: ['zona eleitoral', 'zona'],
    },
    {
        campo: 'titulo_secao',
        rotulos: ['secao eleitoral', 'seção eleitoral', 'secao', 'seção'],
    },
    {
        campo: 'pis_numero',
        rotulos: ['pis / pasep', 'pis/pasep', 'numero do pis', 'número do pis', 'pis', 'pasep'],
        normalizador: normalizarPIS,
    },
    {
        campo: 'pis_data',
        rotulos: ['data do pis', 'data cadastramento pis', 'data de cadastramento pis', 'data cadastramento', 'data de cadastramento', 'dt pis'],
        normalizador: normalizarData,
    },

    // ── Endereço & Contato ──────────────────────────────────────────────
    {
        campo: 'cep',
        rotulos: ['cep'],
        normalizador: normalizarCEP,
        padraoGlobal: /\b\d{5}-?\d{3}\b/,
    },
    {
        campo: 'endereco',
        rotulos: ['endereço residencial', 'endereco residencial', 'residência', 'residencia', 'endereço', 'logradouro'],
        negativos: ['endereco e contato', 'endereço e contato', 'endereco comercial', 'endereço comercial'],
        tipoTextoLivre: true,
    },
    {
        campo: 'numero',
        rotulos: ['número do endereço', 'numero do endereco', 'número', 'num'],
    },
    {
        campo: 'complemento',
        rotulos: ['complemento do endereço', 'complemento'],
        tipoTextoLivre: true,
    },
    {
        campo: 'bairro',
        rotulos: ['bairro'],
        tipoTextoLivre: true,
    },
    {
        campo: '_cidade_texto',
        rotulos: ['cidade / uf', 'cidade'],
        tipoTextoLivre: true,
    },
    {
        campo: '_uf_texto',
        rotulos: ['uf', 'estado'],
        tipoTextoLivre: true,
    },
    {
        campo: 'telefone',
        rotulos: ['telefone celular', 'telefone', 'celular'],
        normalizador: normalizarTelefone,
        padraoGlobal: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/,
    },
    {
        campo: 'email',
        rotulos: ['e-mail do colaborador', 'email', 'e-mail'],
        padraoGlobal: /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/,
    },
    {
        campo: 'salario',
        rotulos: ['salário base', 'salario base', 'salário', 'salario'],
        normalizador: normalizarMoeda,
    },

    // ── Cargo / CBO da ficha ────────────────────────────────────────────
    {
        campo: '_cargo_texto',
        rotulos: ['cargo / funcao', 'cargo / função', 'cargo do colaborador', 'cargo', 'funcao', 'função'],
        tipoTextoLivre: true,
    },
    {
        campo: '_cbo_texto',
        rotulos: ['c.b.o.', 'cbo', 'codigo cbo', 'código cbo'],
    },
];

// Em fichas tabulares, rótulos vizinhos costumam aparecer agrupados antes dos
// valores ("Empregado / Residência / Beneficiários" seguido só depois pelos
// valores de cada um). Sem essa checagem, a estratégia B (linha seguinte)
// captura o próximo rótulo como se fosse o valor do rótulo atual.
const TODOS_ROTULOS = Array.from(
    new Set(REGRAS.flatMap(r => r.rotulos.map(semAcento)))
).sort((a, b) => b.length - a.length);

function pareceRotulo(linhaSemAcento) {
    for (const rotulo of TODOS_ROTULOS) {
        if (!linhaSemAcento.startsWith(rotulo)) continue;
        const proximoChar = linhaSemAcento[rotulo.length];
        if (!proximoChar || !/[a-z0-9]/i.test(proximoChar)) return true;
    }
    return false;
}

function normalizarTexto(texto) {
    return String(texto || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/­/g, '')
        .replace(/ /g, ' ')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .join('\n');
}

function aplicarNormalizador(regra, valor) {
    if (!regra.normalizador) {
        return { valor, valido: !!valor };
    }
    return regra.normalizador(valor);
}

function pontuar(regra, valor, estrategia) {
    let confianca;
    if (estrategia === 'mesma_linha') confianca = regra.tipoTextoLivre ? 0.75 : 1.0;
    else if (estrategia === 'linha_seguinte') confianca = 0.5;
    else confianca = 0.35;

    const normalizado = aplicarNormalizador(regra, valor);
    if (!normalizado.valido) {
        confianca = Math.min(confianca, 0.35);
    }
    return { valor: normalizado.valor || valor, confianca, valido: normalizado.valido };
}

function extrairCampo(linhas, regra, linhasConsumidas) {
    const rotulosOrdenados = [...regra.rotulos].sort((a, b) => b.length - a.length);
    let candidato = null;

    for (let i = 0; i < linhas.length; i += 1) {
        if (linhasConsumidas.has(i)) continue;
        const linhaOriginal = linhas[i];
        const linhaSemAcento = semAcento(linhaOriginal);

        // Remove numeração inicial de lista (ex.: "1. ", "01 - ", "a) ")
        const linhaLimpaInicio = linhaSemAcento.replace(/^\s*(?:\d+[\.\)\-:]\s*|[a-z][\.\)]\s*|[-•*]\s*)+/i, '');
        const offsetInicio = linhaSemAcento.length - linhaLimpaInicio.length;

        for (const rotulo of rotulosOrdenados) {
            const rotuloLimpo = semAcento(rotulo);

            // Procura o rótulo no início da linha OU em qualquer posição da linha (para tabelas/colunas)
            let matchIndex = -1;
            if (linhaLimpaInicio.startsWith(rotuloLimpo)) {
                matchIndex = offsetInicio;
            } else {
                const idx = linhaSemAcento.indexOf(rotuloLimpo);
                if (idx > 0 && !/[a-z0-9]/i.test(linhaSemAcento[idx - 1])) {
                    matchIndex = idx;
                }
            }

            if (matchIndex === -1) continue;

            // Borda de palavra no final do rótulo: "empregado" não pode casar com "empregador"
            const endRotuloIdx = matchIndex + rotuloLimpo.length;
            const proximoChar = linhaSemAcento[endRotuloIdx];
            if (proximoChar && /[a-z0-9]/i.test(proximoChar)) continue;

            // Checa negativos
            const pedacoParaNegativo = linhaSemAcento.slice(matchIndex);
            if (regra.negativos && regra.negativos.some(n => pedacoParaNegativo.startsWith(semAcento(n)))) continue;

            // Pega o conteúdo após o rótulo
            let resto = linhaOriginal.slice(endRotuloIdx);
            resto = colapsarEspacos(resto).replace(/^[:\-–—\s\.\/]+/, '').trim();

            // Trunca se encontrar outro rótulo na mesma linha (ex.: "Nome: João CPF: 123...")
            let menorIndiceProximoRotulo = -1;
            if (resto.length > 0) {
                const restoSemAcento = semAcento(resto);

                for (const outroRotulo of TODOS_ROTULOS) {
                    if (outroRotulo === rotuloLimpo) continue;
                    const rIdx = restoSemAcento.indexOf(outroRotulo);
                    if (rIdx > 0 && !/[a-z0-9]/i.test(restoSemAcento[rIdx - 1])) {
                        const after = rIdx + outroRotulo.length;
                        if (!restoSemAcento[after] || !/[a-z0-9]/i.test(restoSemAcento[after])) {
                            if (menorIndiceProximoRotulo === -1 || rIdx < menorIndiceProximoRotulo) {
                                menorIndiceProximoRotulo = rIdx;
                            }
                        }
                    }
                }

                if (menorIndiceProximoRotulo !== -1) {
                    resto = resto.slice(0, menorIndiceProximoRotulo).trim();
                }
            }

            // Estratégia A: rótulo e valor na mesma linha
            if (resto.length > 1) {
                const resultado = pontuar(regra, resto, 'mesma_linha');
                if (resultado.valido) {
                    if (menorIndiceProximoRotulo === -1) {
                        linhasConsumidas.add(i);
                    }
                    return resultado;
                }
                if (!candidato) candidato = resultado;
                break;
            }

            // Estratégia B: rótulo isolado, valor na linha seguinte
            if (i + 1 < linhas.length && !linhasConsumidas.has(i + 1)) {
                const proxima = colapsarEspacos(linhas[i + 1]);
                if (proxima.length > 1 && !pareceRotulo(semAcento(proxima))) {
                    const resultado = pontuar(regra, proxima, 'linha_seguinte');
                    if (resultado.valido) {
                        linhasConsumidas.add(i);
                        linhasConsumidas.add(i + 1);
                        return resultado;
                    }
                    if (!candidato) candidato = resultado;
                    break;
                }
            }
        }
    }

    // Estratégia C: padrão global, sem rótulo
    if (regra.padraoGlobal) {
        const match = linhas.join('\n').match(regra.padraoGlobal);
        if (match) {
            return pontuar(regra, match[0], 'padrao_global');
        }
    }

    return candidato || { valor: '', confianca: 0, valido: false };
}

/**
 * @param {string} texto
 * @param {Object} opcoes
 * @param {boolean} opcoes.origemOCR
 * @returns {{campos: Object, confianca: Object, textoBruto: string, naoReconhecido: string[]}}
 */
export function extrairCampos(texto, { origemOCR = false } = {}) {
    const textoBruto = normalizarTexto(texto);
    const linhas = textoBruto.split('\n');

    const campos = {};
    const confianca = {};
    const linhasConsumidas = new Set();

    for (const regra of REGRAS) {
        const resultado = extrairCampo(linhas, regra, linhasConsumidas);
        campos[regra.campo] = resultado.valor;
        confianca[regra.campo] = origemOCR ? resultado.confianca * 0.7 : resultado.confianca;
    }

    // Linhas no formato "Rótulo: valor" que nenhuma regra capturou. É o insumo
    // para calibrar a tabela com fichas reais.
    const rotulosConhecidos = new Set(REGRAS.flatMap(r => r.rotulos.map(semAcento)));
    const naoReconhecido = [];
    for (const linha of linhas) {
        const match = linha.match(/^([^:]{3,60}):\s*(.+)$/);
        if (!match) continue;
        const rotulo = semAcento(match[1]);
        if (!rotulosConhecidos.has(rotulo)) {
            naoReconhecido.push(colapsarEspacos(linha));
        }
    }

    return { campos, confianca, textoBruto, naoReconhecido };
}
