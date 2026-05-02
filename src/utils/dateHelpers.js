// Garante 'YYYY-MM-DD' a partir de string ou Date
export const toIsoDay = (raw) => {
    if (!raw) return null;
    if (raw instanceof Date) {
        const y = raw.getUTCFullYear();
        const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
        const d = String(raw.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return String(raw).split('T')[0];
};

export const formatarData = (dataStr) => {
    const iso = toIsoDay(dataStr);
    if (!iso) return '';
    const data = new Date(`${iso}T00:00:00Z`);
    return data.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', timeZone: 'UTC' })
        .replace('.', '')
        .replace(/^\w/, (c) => c.toUpperCase());
};

export const getDiaSemana = (dataStr) => {
    const iso = toIsoDay(dataStr);
    if (!iso) return '';
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[new Date(`${iso}T00:00:00`).getDay()];
};

export const isFimDeSemana = (dataStr) => {
    const iso = toIsoDay(dataStr);
    if (!iso) return false;
    const dia = new Date(`${iso}T00:00:00`).getDay();
    return dia === 0 || dia === 6;
};

export const isHoje = (dataStr) => {
    const iso = toIsoDay(dataStr);
    if (!iso) return false;
    const hojeObj = new Date();
    const y = hojeObj.getFullYear();
    const m = String(hojeObj.getMonth() + 1).padStart(2, '0');
    const d = String(hojeObj.getDate()).padStart(2, '0');
    return iso === `${y}-${m}-${d}`;
};
