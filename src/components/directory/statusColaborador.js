// ─── A situação real do colaborador mora no NOME, não no campo `ativo` ───────
//
// Amostra do que o IXC devolve em `funcionario_nome`:
//
//   "(INATIVO) LUANA DOS SANTOS SILVA ROCHA MARIA "   ativo='N'
//   "(AFASTADO) HERTZ ALEIXO DOS SANTOS "             ativo='N'
//   "(AFASTADO) JOYCE DE MELO OLIVEIRA"               ativo='S'   ← contradiz
//   "(FÉRIAS) ALAINE SILVA DOS SANTOS"                ativo='S'
//   "(FERIAS)MICHELE DA SILVA SANTANA "               ativo='N'   ← contradiz
//   "(INATIVA) IZABELE SILVA SANTOS"                  ativo='N'
//
// Duas conclusões, ambas com consequência de UI:
//
// 1. O prefixo e a flag `ativo` DISCORDAM. Dois colaboradores em férias, um
//    marcado ativo e outro inativo. O RH mantém o prefixo; a flag é resíduo de
//    processo. Mostrar só o badge "Ativo/Inativo" fazia a tela afirmar que
//    quem está de férias está inativo — e que quem está afastado está ativo.
//
// 2. O prefixo estava DENTRO do <h3>. O nome é a âncora de varredura da tela, e
//    metade dele era metadado em caixa alta. Pior para leitor de tela, que lia
//    "abre parênteses férias fecha parênteses" antes de cada nome.
//
// A solução é separar: o prefixo vira chip de situação, o nome fica só nome.

const SITUACOES = [
    { chaves: ['inativo', 'inativa', 'desligado', 'desligada'], rotulo: 'Inativo',  tom: 'neutro' },
    { chaves: ['ferias'],                                        rotulo: 'Férias',   tom: 'info'   },
    { chaves: ['afastado', 'afastada', 'licenca', 'licença'],    rotulo: 'Afastado', tom: 'aviso'  },
];

// Partículas que ficam em minúscula no meio do nome. Sem isso, converter
// "LUANA DOS SANTOS" para capitalização vira "Luana Dos Santos".
const PARTICULAS = new Set(['da', 'das', 'de', 'do', 'dos', 'e', 'di', 'du', 'la', 'van', 'von', 'y']);

export function semAcento(t) {
    return (t || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Nomes chegam do IXC em CAIXA ALTA. Texto todo em maiúscula é medidamente
 * mais lento de ler, porque elimina o contorno da palavra — e aqui a tela
 * inteira é uma grade de nomes para varrer.
 */
export function nomeProprio(texto) {
    return texto
        .toLocaleLowerCase('pt-BR')
        .split(/\s+/)
        .map((palavra, i) => {
            if (i > 0 && PARTICULAS.has(semAcento(palavra))) return palavra;
            // Preserva hífen composto: "silva-santos" → "Silva-Santos".
            return palavra.replace(/(^|-)([\p{L}])/gu, (_, sep, c) => sep + c.toLocaleUpperCase('pt-BR'));
        })
        .join(' ');
}

/**
 * Separa o prefixo de situação do nome.
 *
 * @param   {string} nomeBruto  `funcionario_nome` como vem do IXC
 * @param   {string} ativo      flag `ativo` ('S' | outro)
 * @returns {{ nome: string, rotulo: string, tom: 'ok'|'neutro'|'info'|'aviso', divergente: boolean }}
 *          `divergente` marca os casos em que o prefixo e a flag discordam.
 */
export function situacaoColaborador(nomeBruto, ativo) {
    // O trim é necessário nos dois lados: há nomes com espaço à esquerda e à
    // direita na base, e "(FERIAS)MICHELE" vem sem espaço após o parêntese.
    const bruto = (nomeBruto || '').trim();
    const casamento = bruto.match(/^\(([^)]+)\)\s*/);
    const estaAtivo = ativo === 'S';

    if (!casamento) {
        return {
            nome: nomeProprio(bruto) || 'Colaborador',
            rotulo: estaAtivo ? 'Ativo' : 'Inativo',
            tom: estaAtivo ? 'ok' : 'neutro',
            divergente: false,
        };
    }

    const dentro = semAcento(casamento[1].trim());
    const conhecida = SITUACOES.find(s => s.chaves.some(k => dentro.includes(k)));
    const nome = nomeProprio(bruto.slice(casamento[0].length).trim()) || 'Colaborador';

    if (!conhecida) {
        // Prefixo que não está no mapa ainda: mostra o texto ORIGINAL, sem
        // capitalizar — pode ser sigla ("NPS"), e é preferível exibir um rótulo
        // desconhecido a esconder que existe uma anotação no cadastro.
        return { nome, rotulo: casamento[1].trim(), tom: 'neutro', divergente: false };
    }

    return {
        nome,
        rotulo: conhecida.rotulo,
        tom: conhecida.tom,
        // "Férias" com ativo='N' e "Afastado" com ativo='S' são os dois casos
        // reais na base. Quem for auditar o cadastro precisa conseguir vê-los.
        divergente: (conhecida.rotulo === 'Inativo') !== !estaAtivo,
    };
}

/** Situações disponíveis como filtro, na ordem em que aparecem na toolbar. */
export const SITUACOES_FILTRO = ['Ativo', 'Férias', 'Afastado', 'Inativo'];
