import { useState } from 'react';
import { Icons } from './common/Icons';
import { useTheme } from '../hooks/useTheme';
import { useBentoTheme, DARK_VARIANTS, isDarkActive } from '../hooks/useBentoTheme';

// Conteúdo do menu do perfil, compartilhado entre o popup da Sidebar (desktop)
// e o sheet de perfil do Header (celular): Configurações, modo escuro com as
// quatro variantes, e sair. Tudo é `button` com estado ARIA.

export async function encerrarSessao(user, setCurrentView) {
  if (user?.id) {
    try {
      await fetch(`/api/presenca/${user.id}/logout`, { method: 'POST' });
    } catch (_) {
      /* presença é best-effort */
    }
  }
  localStorage.removeItem('@Stitch:user');
  localStorage.removeItem('@Stitch:currentView');
  sessionStorage.removeItem('@Stitch:user');
  sessionStorage.removeItem('@Stitch:currentView');
  setCurrentView('login');
}

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'flex' }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

function MenuItem({ C, icon, children, onClick, danger = false, role, ariaChecked, ariaLabel, trailing, dense }) {
  const [hover, setHover] = useState(false);
  const color = danger ? C.dangerStrong : C.ink;
  return (
    <button
      type="button"
      role={role}
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        minHeight: dense ? 40 : 44, padding: '8px 10px', borderRadius: 8, border: 'none',
        background: hover ? (danger ? C.dangerSoft : C.surfaceSoft) : 'transparent',
        color, fontSize: 13, fontWeight: danger ? 600 : 500, textAlign: 'left',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
      }}
    >
      <span style={{ color: danger ? 'inherit' : C.ink2, display: 'flex' }} aria-hidden="true">{icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {trailing}
    </button>
  );
}

function ToggleSwitch({ checked, C }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 32, height: 18, borderRadius: 9,
        // Desligado em `muted` (3,0:1 no claro, 5,7:1 no escuro): com `line`
        // o trilho media 1,2:1 e o controle sumia sobre o popover.
        background: checked ? C.accent : C.muted,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0, display: 'block',
      }}
    >
      <span style={{
        width: 12, height: 12, borderRadius: '50%', background: C.surface,
        position: 'absolute', top: 3, left: checked ? 17 : 3,
        transition: 'left 0.2s ease', boxShadow: 'var(--shadow-sm)', display: 'block',
      }} />
    </span>
  );
}

export default function ProfileMenu({ user, setCurrentView, onClose, dense = false }) {
  const C = useBentoTheme();
  const { theme, setTheme, darkVariant, setDarkVariant } = useTheme();
  const isDark = isDarkActive(theme);
  const variante = DARK_VARIANTS.find((v) => v.id === darkVariant) ?? DARK_VARIANTS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <MenuItem
        C={C}
        dense={dense}
        icon={<Icons.Settings />}
        onClick={() => { setCurrentView('settings'); onClose?.(); }}
      >
        Configurações
      </MenuItem>

      <MenuItem
        C={C}
        dense={dense}
        role="switch"
        ariaChecked={isDark}
        icon={<MoonIcon />}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        trailing={<ToggleSwitch checked={isDark} C={C} />}
      >
        Modo escuro
      </MenuItem>

      {isDark && (
        <div
          role="group"
          aria-label="Estilo do tema escuro"
          style={{ padding: dense ? '2px 10px 8px 36px' : '0 10px 8px 28px', display: 'flex', alignItems: 'center', gap: dense ? 6 : 2, flexWrap: 'wrap' }}
        >
          {DARK_VARIANTS.map((v) => {
            const ativo = v.id === darkVariant;
            // No sheet mobile o alvo tem 44px; no popup desktop, 28px (mouse).
            const alvo = dense ? 28 : 44;
            return (
              <button
                key={v.id}
                type="button"
                aria-label={v.label}
                aria-pressed={ativo}
                title={v.label}
                onClick={() => setDarkVariant(v.id)}
                style={{
                  width: alvo, height: alvo, borderRadius: '50%', padding: 0, cursor: 'pointer',
                  background: 'transparent', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {/* Borda em `ink2` (≥ 5:1 em todo tema): com `line` o círculo
                    sumia sobre popover escuro. O ponto central é o `success`
                    do tema, a única cor que separa Default Dark de Cyber. */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: v.theme.bg,
                    border: `2px solid ${ativo ? C.accent : C.ink2}`,
                    boxShadow: `inset 0 0 0 3px ${v.theme.surfaceSoft}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.theme.success, display: 'block' }} />
                </span>
              </button>
            );
          })}
          <span style={{ fontSize: 11, color: C.ink2, fontWeight: 600 }}>{variante.label}</span>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '4px 4px' }} />

      <MenuItem
        C={C}
        dense={dense}
        danger
        icon={<Icons.Logout />}
        onClick={() => encerrarSessao(user, setCurrentView)}
      >
        Sair da conta
      </MenuItem>
    </div>
  );
}
