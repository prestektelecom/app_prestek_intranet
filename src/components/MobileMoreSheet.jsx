import { useState, useEffect } from 'react';
import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';

export default function MobileMoreSheet({ isOpen, onClose, currentView, setCurrentView, user }) {
  const C = useBentoTheme();
  const [urgentCount, setUrgentCount] = useState(0);

  // Busca comunicados urgentes para exibir badge
  useEffect(() => {
    if (!isOpen) return;

    const fetchUrgents = async () => {
      try {
        const res = await fetch('/api/comunicados');
        if (res.ok) {
          const data = await res.json();
          if (data.sucesso && data.comunicados) {
            setUrgentCount(data.comunicados.filter(item => item.tipo === 'Urgente').length);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar urgentes no sheet:', error);
      }
    };

    fetchUrgents();
    const id = setInterval(fetchUrgents, 30000);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  const secondaryItems = [
    { id: 'sectors', icon: 'Pie', label: 'Setores' },
    { id: 'schedule', icon: 'Clock', label: 'Plantão' },
    { id: 'offices', icon: 'Building', label: 'Escritórios' },
    { id: 'processes', icon: 'Doc', label: 'Processos' },
    { id: 'tickets', icon: 'Ticket', label: 'Meus Chamados' },
    {
      id: 'announcements',
      icon: 'Megaphone',
      label: 'Comunicados',
      badge: urgentCount > 0 ? String(urgentCount) : null
    },
    { id: 'settings', icon: 'Settings', label: 'Configurações' },
  ];

  // Adiciona o painel admin se for administrador
  if (user?.is_admin) {
    secondaryItems.push({ id: 'admin', icon: 'Admin', label: 'Painel Admin' });
  }

  const handleItemClick = (id) => {
    setCurrentView(id);
    onClose();
  };

  return (
    <div
      className="block lg:hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1001,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 27, 46, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out forwards',
        }}
      />

      {/* Sheet Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: C.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: `0 -8px 32px ${C.ink}1F`,
          padding: '16px 20px 32px',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 40,
            height: 5,
            borderRadius: 2.5,
            background: C.line,
            margin: '0 auto 16px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        />

        {/* Header do Sheet */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            padding: '0 4px',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>
            Mais Opções
          </span>
          <button
            onClick={onClose}
            style={{
              background: C.surfaceSoft,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: C.ink2,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
        </div>

        {/* Lista de Itens */}
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            paddingBottom: 8,
          }}
        >
          {secondaryItems.map((item) => {
            const IconComponent = Icons[item.icon];
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: isActive ? C.accentSoft : 'transparent',
                  color: isActive ? C.accentDeep : C.ink2,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    color: isActive ? C.accent : C.muted,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {IconComponent && <IconComponent />}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && (
                  <span
                    style={{
                      background: isActive ? C.accent : C.dangerSoft,
                      color: isActive ? C.surface : C.danger,
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      padding: '0 6px',
                      borderRadius: 9,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estilos para animação via tags de estilo local */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
