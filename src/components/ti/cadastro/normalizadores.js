// Normalizadores e máscaras ao vivo. Espelho de cliente — a versão canônica
// fica no backend (services/normalizadores.js), mas aqui serve para guiar o
// operador enquanto digita.

export function soDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

export function mascaraCPF(valor) {
    const v = soDigitos(valor).slice(0, 11);
    return v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraCEP(valor) {
    const v = soDigitos(valor).slice(0, 8);
    return v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function mascaraTelefone(valor) {
    const v = soDigitos(valor).slice(0, 11);
    if (v.length <= 10) {
        return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function normalizarNome(valor) {
    return String(valor || '')
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(p => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : '')
        .join(' ');
}

export function aplicarMascara(campo, valor) {
    if (!valor) return '';
    switch (campo.mascara) {
        case 'cpf': return mascaraCPF(valor);
        case 'cep': return mascaraCEP(valor);
        case 'telefone': return mascaraTelefone(valor);
        default: return valor;
    }
}
