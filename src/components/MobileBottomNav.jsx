import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useNotificacoes, coresDoBadge } from '../hooks/useComunicados';
import { mobileSlots, viewInSheet, viewEmErro } from '../navigation';

// Barra inferior do celular: quatro slots por frequência de uso (fonte única
// em navigation.js) e "Mais". O rótulo ativo usa `ink`, nunca `accentDeep`:
// como texto, o laranja profundo dava 1,9:1 nos temas escuros. O badge segue
// `coresDoBadge`, a mesma cor do sino e da Sidebar para a mesma contagem.

export default function MobileBottomNav({ currentView, setCurrentView, isMoreSheetOpen, setIsMoreSheetOpen, user }) {
  const C = useBentoTheme();
  const { naoLidos, severidade } = useNotificacoes(user);
  const badgeCores = coresDoBadge(C, severidade);

  // Numa tela de erro (view inexistente ou sem permissão) nenhum slot acende:
  // "Mais" ficava ativo em cima de "Você não tem acesso a esta área".
  const emErro = viewEmErro(currentView, user);

  const slots = mobileSlots(user).map((item) => ({
    id: item.id,
    label: item.mobileLabel ?? item.label,
    icon: item.icon,
    badge: item.badge === 'comunicados' ? naoLidos : 0,
    active: !isMoreSheetOpen && currentView === item.id,
  }));

  const navItems = [
    ...slots,
    { id: 'more', label: 'Mais', icon: 'More', badge: 0, active: isMoreSheetOpen || (viewInSheet(currentView) && !emErro) },
  ];

  const handleItemClick = (id) => {
    if (id === 'more') {
      setIsMoreSheetOpen((prev) => !prev);
    } else {
      setIsMoreSheetOpen(false);
      setCurrentView(id);
    }
  };

  return (
    <nav
      className="flex lg:hidden"
      aria-label="Navegação principal"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'var(--bottom-nav-h)', paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: C.popover, borderTop: `1px solid ${C.line}`, boxShadow: 'var(--shadow-md)',
        zIndex: 1000, alignItems: 'stretch', justifyContent: 'space-around', padding: '0 4px',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {navItems.map((item) => {
        const IconComponent = Icons[item.icon];
        const isMore = item.id === 'more';
        const badgeLabel = item.badge > 9 ? '9+' : item.badge;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item.id)}
            aria-current={!isMore && item.active ? 'page' : undefined}
            aria-expanded={isMore ? isMoreSheetOpen : undefined}
            aria-haspopup={isMore ? 'dialog' : undefined}
            aria-label={item.badge > 0 ? `${item.label}, ${item.badge} não lidos` : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              border: 'none', background: 'transparent', width: '20%', minHeight: 64, cursor: 'pointer',
              color: item.active ? C.ink : C.ink2, padding: '6px 0', borderRadius: 8,
              transition: 'color 0.15s ease',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.active ? C.accent : C.ink2,
                transform: item.active ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease, color 0.15s ease',
              }}
            >
              {IconComponent && <IconComponent />}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -7, right: -11, minWidth: 18, height: 18, padding: '0 4px',
                  borderRadius: 999, background: badgeCores.fill, color: badgeCores.onFill,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${C.popover}`, boxSizing: 'border-box',
                }}>
                  {badgeLabel}
                </span>
              )}
            </span>
            <span style={{ fontSize: 11, fontWeight: item.active ? 700 : 500, letterSpacing: '0.01em' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
