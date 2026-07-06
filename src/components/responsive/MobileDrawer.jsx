import { useEffect } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { Icons } from '../common/Icons';
import logoP from '../../image/logos/Logo_P.webp';

const menuItems = [
  { id: 'dashboard', icon: 'Dashboard', label: 'Dashboard' },
  { id: 'services', icon: 'Tools', label: 'Serviços' },
  { id: 'coverage', icon: 'Shield', label: 'Cobertura' },
  { id: 'directory', icon: 'People', label: 'Colaboradores' },
  { id: 'sectors', icon: 'Pie', label: 'Setores' },
  { id: 'schedule', icon: 'Clock', label: 'Plantão' },
  { id: 'offices', icon: 'Building', label: 'Escritórios' },
  { id: 'processes', icon: 'Doc', label: 'Processos' },
  { id: 'tickets', icon: 'Ticket', label: 'Meus Chamados' },
  { id: 'announcements', icon: 'Megaphone', label: 'Comunicados' },
  { id: 'settings', icon: 'Settings', label: 'Configurações' },
];

export default function MobileDrawer({ isOpen, onClose, currentView, setCurrentView, user }) {
  const C = useBentoTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleNav = (view) => {
    setCurrentView(view);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] lg:hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 h-full w-[280px] max-w-[80vw] animate-in slide-in-from-left duration-200 flex flex-col"
        style={{ background: C.surface, borderRight: `1px solid ${C.line}` }}
      >
        {/* Brand */}
        <button
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-3 px-4 pt-5 pb-4 border-b"
          style={{ borderColor: C.line }}
        >
          <img src={logoP} alt="Prestek" className="w-8 h-8 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[17px] tracking-tight" style={{ color: C.ink }}>Prestek</span>
            <span className="font-mono text-[9.5px] tracking-[0.22em] uppercase mt-[3px]" style={{ color: C.muted }}>Intranet</span>
          </div>
        </button>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = Icons[item.icon];
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left transition-colors min-h-[44px]"
                style={{
                  background: active ? C.accentSoft : 'transparent',
                  color: active ? C.accentDeep : C.ink2,
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span className="flex" style={{ color: active ? C.accent : C.muted }}>
                  {IconComponent && <IconComponent />}
                </span>
                <span className="text-[13.5px]">{item.label}</span>
              </button>
            );
          })}

          {user?.is_admin && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left transition-colors min-h-[44px]"
              style={{
                background: currentView === 'admin' ? C.accentSoft : 'transparent',
                color: currentView === 'admin' ? C.accentDeep : C.ink2,
                fontWeight: currentView === 'admin' ? 600 : 500,
              }}
            >
              <span className="flex" style={{ color: currentView === 'admin' ? C.accent : C.muted }}>
                <Icons.Admin />
              </span>
              <span className="text-[13.5px]">Painel Admin</span>
            </button>
          )}
        </nav>

        {/* Close */}
        <div className="p-3 border-t" style={{ borderColor: C.line }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: C.surfaceSoft, color: C.ink }}
          >
            Fechar menu
          </button>
        </div>
      </aside>
    </div>
  );
}
