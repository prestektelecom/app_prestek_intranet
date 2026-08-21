// Validações de cliente. Pintam erro no campo mas não bloqueiam a simulação —
// o dry-run (fase 6) é quem enumera todos os problemas de uma vez.

import { soDigitos } from './normalizadores';

function validarDVCPF(cpf) {
    const d = soDigitos(cpf);
    if (d.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(d)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i += 1) soma += parseInt(d[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(d[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i += 1) soma += parseInt(d[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    return resto === parseInt(d[10]);
}

function validarDataISO(valor) {
    if (!valor) return true;
    const match = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const ano = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);
    const data = new Date(ano, mes - 1, dia);
    return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

function validarEmail(valor) {
    if (!valor) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

export function validarCampo(campo, valor) {
    const texto = String(valor ?? '').trim();

    if (campo.obrigatorio && !texto) {
        return 'Campo obrigatório.';
    }
    if (!texto) return null;

    switch (campo.nome) {
        case 'funcionario':
            if (texto.length > 100) return 'Máximo de 100 caracteres.';
            return null;
        case 'cpf_cnpj':
            if (!validarDVCPF(texto)) return 'CPF com dígito verificador inválido.';
            return null;
        case 'cep': {
            const d = soDigitos(texto);
            if (d.length && d.length !== 8) return 'CEP deve ter 8 dígitos.';
            return null;
        }
        case 'email':
            if (!validarEmail(texto)) return 'E-mail inválido.';
            return null;
        case 'data_nascimento':
        case 'rg_data_emissao':
        case 'ctps_data_emissao':
        case 'pis_data':
            if (!validarDataISO(texto)) return 'Data inválida (aaaa-mm-dd).';
            return null;
        case 'telefone': {
            const d = soDigitos(texto);
            if (d.length && d.length < 10) return 'Telefone incompleto.';
            return null;
        }
        default:
            return null;
    }
}
