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
//
// `group` é usado só pela Sidebar (desktop) pra separar em 3 seções por
// frequência — decisão de arquitetura em aberto desde a Fase 1 do chrome,
// endereçada em 2026-09-20. Os 4 itens de `dia-a-dia` são exatamente os que
// já tinham `mobileSlot` (o sinal de frequência que já existia no código,
// não um critério novo inventado agora); `administracao` reúne TI/Painel
// Admin (já eram admin-only) e Configurações (pessoal, mas também "conta e
// sistema" — nunca teve grupo próprio, e não é uso diário do trabalho).

export const NAV_ITEMS = [
  { id: 'dashboard',     icon: 'Dashboard', label: 'Início',        group: 'dia-a-dia',    mobileSlot: 0 },
  { id: 'schedule',      icon: 'Clock',     label: 'Plantão',       group: 'dia-a-dia',    mobileSlot: 1 },
  { id: 'announcements', icon: 'Megaphone', label: 'Comunicados',   group: 'dia-a-dia',    mobileSlot: 2, badge: 'comunicados' },
  { id: 'tickets',       icon: 'Ticket',    label: 'Meus chamados', group: 'dia-a-dia',    mobileSlot: 3, mobileLabel: 'Chamados' },
  { id: 'services',      icon: 'Tools',     label: 'Serviços',      group: 'empresa' },
  { id: 'coverage',      icon: 'Shield',    label: 'Cobertura',     group: 'empresa' },
  { id: 'directory',     icon: 'People',    label: 'Colaboradores', group: 'empresa' },
  { id: 'sectors',       icon: 'Pie',       label: 'Setores',       group: 'empresa' },
  { id: 'offices',       icon: 'Building',  label: 'Escritórios',   group: 'empresa' },
  { id: 'processes',     icon: 'Doc',       label: 'Processos',     group: 'empresa' },
  { id: 'suggestions',   icon: 'Lightbulb', label: 'Sugestões',     group: 'empresa' },
  { id: 'ti',            icon: 'Chip',      label: 'TI',            group: 'administracao', somenteAdmin: true },
  { id: 'settings',      icon: 'Settings',  label: 'Configurações', group: 'administracao' },
  { id: 'admin',         icon: 'Admin',     label: 'Painel Admin',  group: 'administracao', somenteAdmin: true },
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

export function viewExists(view) {
  return NAV_ITEMS.some((i) => i.id === view) || Object.prototype.hasOwnProperty.call(EXTRA_TITLES, view);
}

// Título do que foi RENDERIZADO, não da view pedida: sem permissão o header
// dizia "Painel Admin" em cima de "Você não tem acesso"; view inexistente
// deixava o header vazio.
export function viewTitleFor(view, user) {
  if (!viewExists(view)) return 'Página não encontrada';
  if (!canAccess(view, user)) return 'Acesso restrito';
  return viewTitle(view);
}

// A view atual está numa tela de erro (não existe ou o papel não permite)?
export function viewEmErro(view, user) {
  return !viewExists(view) || !canAccess(view, user);
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
