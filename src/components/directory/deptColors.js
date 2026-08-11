import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';

// ─── Por que três hex por departamento, e não um ─────────────────────────────
//
// A versão anterior tinha UM hex por departamento, usado ao mesmo tempo como
// cor de TEXTO (badge de 11,5px, chip ativo) e como cor de MARCA (faixa de 4px,
// borda esquerda do card). São dois requisitos de contraste diferentes —
// 4,5:1 para texto (WCAG 1.4.3) e 3:1 para componente não-textual (1.4.11) —
// e nenhum valor único atende os dois em cinco temas. Resultado medido: os
// OITO departamentos reprovavam. O pior era TI, em #FDBA74, a 1,69:1 sobre
// branco — a pior razão de contraste da tela inteira.
//
// Separando os papéis o problema fica solúvel: tons ~800 para texto claro,
// ~300 para texto escuro, ~500/600 para a marca.
//
// Contrastes medidos contra as superfícies reais (C.surface de cada tema:
// #FFFFFF, cyber #111C2C, aurora #161233, amoled #0A0A0A):
//
//   dept          tintaL/W  tD/cyber  tD/aurora tD/amoled  marca/W  m/cyber  m/amoled
//   Atendimento      7,31     10,15     10,66     11,74      3,56     4,81     5,56
//   TI/NOC           7,56     10,27     10,78     11,87      4,10     4,18     4,83
//   Comercial        7,09     11,88     12,46     13,73      3,19     5,38     6,21
//   Financeiro       7,68     11,23     11,79     12,99      3,77     4,54     5,25
//   RH               8,98      9,28      9,74     10,72      4,23     4,04     4,66
//   Campo            8,02      9,06      9,50     10,47      4,70     3,65     4,21
//   Frota            7,58     11,58     12,15     13,38      3,74     4,57     5,29
//   Diretoria       10,35     11,53     12,11     13,33      4,76     3,60     4,16
//
// Piso: 4,5 nas colunas de tinta, 3,0 nas de marca. Todas aprovam.
//
// TI saiu do pêssego para azul de propósito: #FDBA74 é praticamente o
// --accent da marca, então o badge do TI lia como "chip selecionado", além de
// ser ilegível no claro.
const DEPTOS = [
    { chaves: ['atendimento', 'suporte', 'relacionamento', 'helpdesk', 'client'],   tintaClara: '#9A3412', tintaEscura: '#FDBA74', marca: '#EA580C' },
    { chaves: ['ti', 'tecnologia', 'noc', 'sistema', 'infraestrutura', 'infraestr'], tintaClara: '#075985', tintaEscura: '#7DD3FC', marca: '#0284C7' },
    { chaves: ['comercial', 'venda', 'vendas', 'marketing', 'passivo', 'mkt'],      tintaClara: '#92400E', tintaEscura: '#FCD34D', marca: '#D97706' },
    { chaves: ['financeiro', 'financas', 'cobranca', 'juridico', 'fiscal'],          tintaClara: '#065F46', tintaEscura: '#6EE7B7', marca: '#059669' },
    { chaves: ['rh', 'recursos humanos', 'gestao de pessoas', 'gente'],              tintaClara: '#5B21B6', tintaEscura: '#C4B5FD', marca: '#8B5CF6' },
    { chaves: ['instalacao', 'campo', 'tecnico', 'tecnica', 'correcao'],             tintaClara: '#9F1239', tintaEscura: '#FDA4AF', marca: '#E11D48' },
    { chaves: ['frota', 'estoque', 'patrimonio', 'logistica'],                       tintaClara: '#115E59', tintaEscura: '#5EEAD4', marca: '#0D9488' },
    { chaves: ['diretoria', 'gerencia', 'auditoria'],                                tintaClara: '#334155', tintaEscura: '#CBD5E1', marca: '#64748B' },
];

// Fallback: cinza legível nos dois extremos, para departamento não mapeado.
const NEUTRO = { tintaClara: '#475467', tintaEscura: '#CBD5E1', marca: '#8896A8' };

/**
 * Minúscula, sem acento e sem ponto.
 *
 * Sem a normalização NFD, `'Suporte Técnico'` nunca casava com a chave
 * `'tecnic'` (é ≠ e) e caía silenciosamente no cinza — o que acontecia com a
 * maioria dos departamentos, porque nome de setor em português é acentuado.
 *
 * O ponto sai para que `'T.I.'` e `'Setor de T.I'` virem `ti` e casem com a
 * mesma chave que `'TI'`, em vez de precisarem de três entradas na lista.
 */
function normalizar(texto) {
    return texto
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\./g, '')
        .toLowerCase()
        .trim();
}

/**
 * Casa a chave como PALAVRA, não como substring.
 *
 * O matcher anterior fazia `nome.includes(chave)` com a entrada de TI no
 * índice 1, e a chave literal `'ti'`. Consequência: "Marketing" e "Logística"
 * contêm "ti", casavam com TI e nunca chegavam nas próprias entradas mais
 * abaixo na lista. Dois departamentos com a cor errada por uma substring de
 * duas letras.
 */
function contemPalavra(alvo, chave) {
    return new RegExp(`(^|[^a-z0-9])${chave}([^a-z0-9]|$)`).test(alvo);
}

function acharDepto(nome) {
    if (!nome) return NEUTRO;
    const alvo = normalizar(nome);
    return DEPTOS.find(d => d.chaves.some(k => contemPalavra(alvo, k))) || NEUTRO;
}

/**
 * Resolve as duas cores de um departamento para o tema ativo.
 *
 * @param   {string} nome  nome do departamento, como vem do IXC
 * @returns {{ tinta: string, marca: string }}
 *          `tinta` para texto (≥4,5:1), `marca` para faixa e borda (≥3:1)
 */
export function useDeptColor() {
    const C = useBentoTheme();
    // Mesmo idiom de ServicesFilterBar.jsx: os quatro temas escuros compartilham
    // a rampa escura, então basta saber se é o claro.
    const isDark = C.bg !== BENTO_LIGHT.bg;

    return (nome) => {
        const d = acharDepto(nome);
        return { tinta: isDark ? d.tintaEscura : d.tintaClara, marca: d.marca };
    };
}

// Exportado para teste e para quem precisa da marca sem estar num componente.
export { acharDepto, normalizar };
