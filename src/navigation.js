// Fonte única de navegação do portal.
//
// Sidebar (desktop), MobileBottomNav e MobileMoreSheet (celular) e o título do
// Header leem daqui. Antes cada superfície tinha a própria lista e os rótulos
// divergiam ("Dashboard" / "Início", "Colaboradores" / "Equipe") e a regra de
// admin era aplicada em uma e esquecida na outra.
//
// `mobileSlot` define quem ocupa a barra inferior (0..3, o 5º slot é "Mais"),
// ordenada por frequência de uso diário (PRODUCT.md: plantão e comunicados
// são o uso nº 1). Quem não tem slot vai para o sheet "Mais".

export const NAV_ITEMS = [
  { id: 'dashboard',     icon: 'Dashboard', label: 'Início',        group: 'inicio',  mobileSlot: 0 },
  { id: 'services',      icon: 'Tools',     label: 'Serviços',      group: 'menu' },
  { id: 'coverage',      icon: 'Shield',    label: 'Cobertura',     group: 'menu' },
  { id: 'directory',     icon: 'People',    label: 'Colaboradores', group: 'menu' },
  { id: 'sectors',       icon: 'Pie',       label: 'Setores',       group: 'menu' },
  { id: 'schedule',      icon: 'Clock',     label: 'Plantão',       group: 'menu',    mobileSlot: 1 },
  { id: 'offices',       icon: 'Building',  label: 'Escritórios',   group: 'menu' },
  { id: 'processes',     icon: 'Doc',       label: 'Processos',     group: 'menu' },
  { id: 'tickets',       icon: 'Ticket',    label: 'Meus chamados', group: 'menu',    mobileSlot: 3, mobileLabel: 'Chamados' },
  { id: 'ti',            icon: 'Chip',      label: 'TI',            group: 'menu',    somenteAdmin: true },
  { id: 'announcements', icon: 'Megaphone', label: 'Comunicados',   group: 'sistema', mobileSlot: 2, badge: 'comunicados' },
  { id: 'settings',      icon: 'Settings',  label: 'Configurações', group: 'sistema' },
  { id: 'admin',         icon: 'Admin',     label: 'Painel Admin',  group: 'sistema', somenteAdmin: true },
];

// Views que só admin abre. `App.jsx` faz o gate de rota; as listas acima só
// escondem o item. Esconder sem bloquear era o P0 da crítica do chrome.
export const ADMIN_VIEWS = ['admin', 'ti', 'plantao-historico'];

// Títulos de views que não são item de menu.
const EXTRA_TITLES = {
  'plantao-historico': 'Histórico de plantões',
};

export function isAdmin(user) {
  return Boolean(user?.is_admin);
}

export function canAccess(view, user) {
  return !ADMIN_VIEWS.includes(view) || isAdmin(user);
}

export function visibleNav(user) {
  return NAV_ITEMS.filter((item) => !item.somenteAdmin || isAdmin(user));
}

export function viewTitle(view) {
  const item = NAV_ITEMS.find((i) => i.id === view);
  return item?.label ?? EXTRA_TITLES[view] ?? '';
}

// Slots da barra inferior, em ordem. Sempre 4 (mais "Mais").
export function mobileSlots(user) {
  return visibleNav(user)
    .filter((item) => item.mobileSlot != null)
    .sort((a, b) => a.mobileSlot - b.mobileSlot);
}

// Itens do sheet "Mais": quem não tem slot. Admin vem num grupo separado.
export function sheetItems(user) {
  const semSlot = visibleNav(user).filter((item) => item.mobileSlot == null);
  return {
    comuns: semSlot.filter((item) => !item.somenteAdmin),
    admin: semSlot.filter((item) => item.somenteAdmin),
  };
}

// Uma view "pertence" ao sheet quando não tem slot na barra inferior.
export function viewInSheet(view) {
  const item = NAV_ITEMS.find((i) => i.id === view);
  return !item || item.mobileSlot == null;
}
