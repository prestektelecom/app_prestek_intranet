// Normalizadores canônicos do backend. O servidor é a autoridade — o espelho
// em src/components/ti/cadastro/normalizadores.js existe só para máscara ao
// vivo e pode divergir sem dano.

export function soDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

export function normalizarCPF(valor) {
    const d = soDigitos(valor);
    if (d.length !== 11) return { valor, valido: false };

    if (/^(\d)\1{10}$/.test(d)) return { valor, valido: false };

    let soma = 0;
    for (let i = 0; i < 9; i += 1) soma += parseInt(d[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(d[9])) return { valor, valido: false };

    soma = 0;
    for (let i = 0; i < 10; i += 1) soma += parseInt(d[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    const valido = resto === parseInt(d[10]);
    const mascarado = d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return { valor: mascarado, valido };
}

export function normalizarCEP(valor) {
    const d = soDigitos(valor);
    if (d.length !== 8) return { valor, valido: false };
    return { valor: d.replace(/(\d{5})(\d{3})/, '$1-$2'), valido: true };
}

export function normalizarData(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return { valor: '', valido: false };

    // yyyy-mm-dd já está pronto
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return { valor: texto, valido: true };

    // dd/mm/aaaa ou dd-mm-aaaa ou dd.mm.aaaa
    let match = texto.match(/^(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})$/);
    if (match) {
        const [, dia, mes, ano] = match;
        return { valor: `${ano}-${mes}-${dia}`, valido: true };
    }

    // dd/mm/aa
    match = texto.match(/^(\d{2})[\/\-.](\d{2})[\/\-.](\d{2})$/);
    if (match) {
        const [, dia, mes, aa] = match;
        const ano = parseInt(aa) < 30 ? `20${aa}` : `19${aa}`;
        return { valor: `${ano}-${mes}-${dia}`, valido: true };
    }

    return { valor: texto, valido: false };
}

export function normalizarTelefone(valor) {
    const d = soDigitos(valor);
    if (d.length < 10 || d.length > 11) return { valor, valido: false };
    if (d.length === 11) {
        return { valor: d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'), valido: true };
    }
    return { valor: d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'), valido: true };
}

export function normalizarNome(valor) {
    const limpo = String(valor || '')
        .replace(/^[:\-–—\s\.\/]+/, '')
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(p => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '')
        .join(' ');
    return { valor: limpo, valido: limpo.length >= 2 };
}

export function normalizarMoeda(valor) {
    const texto = String(valor || '').trim().replace('R$', '').trim();
    if (!texto) return { valor: '', valido: false };
    const d = texto.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(d);
    if (isNaN(numero)) return { valor: texto, valido: false };
    return { valor: numero.toFixed(2), valido: true };
}

export function gerarLogin(nome) {
    const limpo = String(nome || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .trim()
        .replace(/\s+/g, '.');
    return { valor: limpo, valido: limpo.length > 0 };
}

// Códigos confirmados contra o schema real do IXC — 'U' não existe; o código
// de União Estável é 'UE', e falta 'SE' (Separado(a)).
const MAPA_ESTADO_CIVIL = {
    s: 'S', solteiro: 'S', solteira: 'S',
    c: 'C', casado: 'C', casada: 'C',
    d: 'D', divorciado: 'D', divorciada: 'D',
    v: 'V', viuvo: 'V', viuva: 'V',
    se: 'SE', separado: 'SE', separada: 'SE',
    u: 'UE', ue: 'UE', uniao_estavel: 'UE', 'uniao estavel': 'UE',
};

export function mapearEstadoCivil(valor) {
    const limpo = String(valor || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const semParenteses = limpo.replace(/\(.*\)/, '').trim();
    const codigo = MAPA_ESTADO_CIVIL[limpo] || MAPA_ESTADO_CIVIL[semParenteses] || '';
    return { valor: codigo, valido: !!codigo };
}

const MAPA_COR_RACA = {
    amarela: 'A', amarelo: 'A',
    branca: 'B', branco: 'B',
    indigena: 'I', 'indígena': 'I',
    parda: 'P', pardo: 'P',
    negra: 'N', negro: 'N', preta: 'N', preto: 'N',
    outra: 'O', outro: 'O',
};

export function mapearCorRaca(valor) {
    const chave = String(valor || '').trim().toLowerCase();
    const codigo = MAPA_COR_RACA[chave] || '';
    return { valor: codigo, valido: !!codigo };
}

const MAPA_ESCOLARIDADE = {
    // Fundamental (EF)
    'ef': 'EF', 'fundamental': 'EF', 'ensino fundamental': 'EF', '1 grau': 'EF', '1o grau': 'EF', '1º grau': 'EF', 'primeiro grau': 'EF', 'ginasio': 'EF', 'primario': 'EF',
    // Médio (EM)
    'em': 'EM', 'medio': 'EM', 'ensino medio': 'EM', '2 grau': 'EM', '2o grau': 'EM', '2º grau': 'EM', 'segundo grau': 'EM', 'colegial': 'EM', 'tecnico': 'EM', 'ensino tecnico': 'EM',
    // Superior (ES)
    'es': 'ES', 'superior': 'ES', 'ensino superior': 'ES', 'graduacao': 'ES', 'superior tecnologo': 'ES', 'tecnologo': 'ES', 'bacharelado': 'ES', 'licenciatura': 'ES', 'terceiro grau': 'ES', '3 grau': 'ES', '3o grau': 'ES', '3º grau': 'ES',
    // Pós (PG)
    'pg': 'PG', 'pos': 'PG', 'pos-graduacao': 'PG', 'pos graduacao': 'PG', 'posgraduacao': 'PG', 'especializacao': 'PG', 'mba': 'PG',
    // Mestrado (M)
    'm': 'M', 'mestrado': 'M', 'mestre': 'M',
    // Doutorado (D)
    'd': 'D', 'doutorado': 'D', 'doutor': 'D', 'phd': 'D',
};

export function mapearEscolaridade(valor) {
    const limpo = String(valor || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s*(completo|incompleto|cursando|em andamento|interrompido)\s*$/i, '')
        .trim();
    const codigo = MAPA_ESCOLARIDADE[limpo] || '';
    return { valor: codigo, valido: !!codigo };
}

export function mapearSimNao(valor) {
    const texto = String(valor || '').trim().toLowerCase();
    if (!texto) return { valor: 'N', valido: true };
    if (['s', 'sim', 'true', '1', 'pcd', 'possui'].includes(texto)) {
        return { valor: 'S', valido: true };
    }
    if (['n', 'nao', 'não', 'false', '0'].includes(texto)) {
        return { valor: 'N', valido: true };
    }
    return { valor: 'N', valido: false };
}

export function normalizarPIS(valor) {
    const d = soDigitos(valor);
    if (!d) return { valor: '', valido: false };
    if (d.length === 11) {
        return { valor: d.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4'), valido: true };
    }
    return { valor: String(valor || '').trim(), valido: d.length >= 10 };
}

