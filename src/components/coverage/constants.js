// Vocabulário da cobertura em um lugar só. Antes as cores de status viviam
// duplicadas em Coverage.jsx (classes Tailwind) e CoverageMap.jsx (hex do
// Leaflet), e as duas listas divergiram: o mapa pintava "Expansão" de azul
// enquanto a lista usava outro azul. Marcador e legenda agora leem daqui.

export const TECNOLOGIAS = ['FTTH', 'Rádio', 'UTP'];
export const STATUS_OPCOES = ['Ativo', 'Expansão', 'Inativo'];
export const VELOCIDADES = [
    '10 MEGA', '20 MEGA', '50 MEGA', '100 MEGA',
    '200 MEGA', '300 MEGA', '500 MEGA', '1 GIGA',
];

// Hex, não classe utilitária: o Leaflet desenha os círculos em SVG inline e
// precisa do valor literal. A UI deriva as versões translúcidas com tone().
export const STATUS_META = {
    'Ativo':    { cor: '#16A34A', icon: 'check_circle',    descricao: 'Rede em operação' },
    'Expansão': { cor: '#2563EB', icon: 'trending_up',     descricao: 'Obra em andamento' },
    'Inativo':  { cor: '#DC2626', icon: 'do_not_disturb_on', descricao: 'Sem atendimento' },
};

export const STATUS_COR_PADRAO = '#64748B';

export const TECH_META = {
    'FTTH':  { cor: '#7C3AED', icon: 'fiber_manual_record',    label: 'Fibra' },
    'Rádio': { cor: '#0891B2', icon: 'settings_input_antenna', label: 'Rádio' },
    'UTP':   { cor: '#059669', icon: 'cable',                  label: 'Cabo' },
};

export const corDoStatus = (status) => STATUS_META[status]?.cor || STATUS_COR_PADRAO;

// Normalização do nome do bairro. Precisa ser idêntica à normalizarBairro() do
// backend (backend/server.js) — se as duas divergirem, o mapa deixa de casar com
// a lista, que é exatamente o tipo de falha silenciosa descrita no topo deste
// arquivo. Só caixa alta e remoção de acento: nada de abreviação ou fuzzy.
export const normalizarBairro = (valor) =>
    String(valor ?? '')
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

// Chave estável de uma região (cidade + bairro). Usada como id de seleção e
// como key de lista; centralizada porque map, lista e modal precisam bater.
export const chaveRegiao = (r) => `${r.cidade_ixc_id}::${normalizarBairro(r.bairro)}`;
