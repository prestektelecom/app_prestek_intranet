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
//
// `corTexto` é um tom mais claro da mesma cor, só para uso como TEXTO sobre o
// fundo translúcido (`tone(cor, 0.14)`) — `cor` sozinha reprovava 4,5:1 no
// AMOLED (achado da auditoria global, Fase 16: Expansão 3,24:1, Inativo
// 3,52:1, FTTH 3,03:1, padrão 3,44:1). O marcador do Leaflet continua usando
// `cor`, nunca `corTexto` — a paridade visual do mapa não muda.
export const STATUS_META = {
    'Ativo':    { cor: '#16A34A', corTexto: '#16A34A', icon: 'check_circle',    descricao: 'Rede em operação' },
    'Expansão': { cor: '#2563EB', corTexto: '#5182EF', icon: 'trending_up',     descricao: 'Obra em andamento' },
    'Inativo':  { cor: '#DC2626', corTexto: '#E35151', icon: 'do_not_disturb_on', descricao: 'Sem atendimento' },
};

export const STATUS_COR_PADRAO = '#64748B';
export const STATUS_COR_TEXTO_PADRAO = '#7B899C';

export const TECH_META = {
    'FTTH':  { cor: '#7C3AED', corTexto: '#9D6BF2', icon: 'fiber_manual_record',    label: 'Fibra' },
    'Rádio': { cor: '#0891B2', corTexto: '#0891B2', icon: 'settings_input_antenna', label: 'Rádio' },
    'UTP':   { cor: '#059669', corTexto: '#059669', icon: 'cable',                  label: 'Cabo' },
};

export const corDoStatus = (status) => STATUS_META[status]?.cor || STATUS_COR_PADRAO;
export const corTextoDoStatus = (status) => STATUS_META[status]?.corTexto || STATUS_COR_TEXTO_PADRAO;

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
