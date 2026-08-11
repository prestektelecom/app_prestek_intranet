/**
 * Monta o link do WhatsApp a partir de um telefone cru do IXC.
 *
 * Preservado da versão anterior da tela porque a lógica estava certa: valida
 * comprimento e só prefixa o 55 quando o número tem DDD, em vez de concatenar
 * cegamente. Mora aqui, e não em EmployeeCard, para que EmployeeRow não
 * precise importar o card inteiro só por esta função.
 */
export function getWhatsAppUrl(phoneStr) {
    if (!phoneStr) return '';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length < 10) return '';
    if (digits.length === 10 || digits.length === 11) return `https://wa.me/55${digits}`;
    return `https://wa.me/${digits}`;
}
