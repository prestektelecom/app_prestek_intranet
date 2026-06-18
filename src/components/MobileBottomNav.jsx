import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';

export default function MobileBottomNav({ currentView, setCurrentView, isMoreSheetOpen, setIsMoreSheetOpen }) {
  const C = useBentoTheme();

  // Mapeia quais views pertencem aos slots principais
  const primaryViews = ['dashboard', 'services', 'coverage', 'directory'];

  // O botão "Mais" é considerado ativo se o sheet estiver aberto OR se a view atual for secundária
  const isMoreActive = isMoreSheetOpen || !primaryViews.includes(currentView);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: 'Dashboard', active: currentView === 'dashboard' },
    { id: 'services', label: 'Serviços', icon: 'Tools', active: currentView === 'services' },
    { id: 'coverage', label: 'Cobertura', icon: 'Shield', active: currentView === 'coverage' },
    { id: 'directory', label: 'Equipe', icon: 'People', active: currentView === 'directory' },
    { id: 'more', label: 'Mais', icon: 'More', active: isMoreActive }
  ];

  const handleItemClick = (id) => {
    if (id === 'more') {
      setIsMoreSheetOpen(prev => !prev);
    } else {
      setIsMoreSheetOpen(false);
      setCurrentView(id);
    }
  };

  return (
    <nav
      className="flex lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: C.surface,
        borderTop: `1px solid ${C.line}`,
        boxShadow: `0 -4px 16px ${C.ink}0A`,
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {navItems.map((item) => {
        const IconComponent = Icons[item.icon];
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              background: 'transparent',
              width: '20%',
              height: '100%',
              cursor: 'pointer',
              color: item.active ? C.accentDeep : C.muted,
              transition: 'all 0.15s ease',
              padding: '4px 0',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.active ? C.accent : C.muted,
                transform: item.active ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease, color 0.15s ease',
              }}
            >
              {IconComponent && <IconComponent />}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: item.active ? 700 : 500,
                letterSpacing: '0.02em',
                transition: 'color 0.15s ease, font-weight 0.15s ease',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
