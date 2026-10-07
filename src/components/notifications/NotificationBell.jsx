import { useState, useRef, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { useNotificacoes, coresDoBadge } from '../../hooks/useComunicados';
import { useDismissable } from '../../hooks/useDismissable';
import { formatRelativeTime } from '../../utils/relativeTime';

// Sino de comunicados. Os dados vêm de `useNotificacoes` (um fetch para todo o
// chrome); aqui só existe a apresentação. Itens são botões, o dropdown fecha
// com Escape e o poll de 30s não apaga a lista já aberta.

function getTypeMeta(C, tipo) {
  if (tipo === 'Urgente') {
    return { color: C.danger, text: C.dangerStrong, soft: C.dangerSoft, icon: 'priority_high', label: 'Urgente' };
  }
  return { color: C.warning, text: C.warningStrong, soft: C.warningSoft, icon: 'notification_important', label: 'Importante' };
}

function rotuloNaoLidas(n) {
  if (n === 0) return 'Notificações (sem novas)';
  return n === 1 ? 'Notificações (1 não lida)' : `Notificações (${n} não lidas)`;
}

function LinkButton({ C, onClick, children, size = 12 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: size, fontWeight: 700, color: C.accentDark, background: 'transparent', border: 'none',
        cursor: 'pointer', padding: '6px 4px', borderRadius: 8, fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

export default function NotificationBell({ user, setCurrentView }) {
  const C = useBentoTheme();
  const {
    urgentes, importantes, isUnread, naoLidos, severidade,
    marcarLida, marcarTodas, loaded, erro,
  } = useNotificacoes(user);

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismissable(rootRef, { open: isOpen, onClose: close });

  const badgeLabel = naoLidos > 9 ? '9+' : String(naoLidos);
  // Mesma cor que a Sidebar e a barra inferior: vem da severidade, não daqui.
  const badge = coresDoBadge(C, severidade);
  const badgeStyle = { background: badge.fill, color: badge.onFill };

  const vazio = urgentes.length === 0 && importantes.length === 0;

  const renderGroup = (items) => {
    if (items.length === 0) return null;
    const meta = getTypeMeta(C, items[0].tipo);
    return (
      <section key={meta.label} aria-label={`${meta.label}, ${items.length}`}>
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: meta.soft, borderBottom: `1px solid ${C.line}` }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14, color: meta.text }}>{meta.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: meta.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {meta.label} ({items.length})
          </span>
        </div>

        {items.map((a) => {
          const m = getTypeMeta(C, a.tipo);
          const unread = isUnread(a);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => marcarLida(a.id)}
              className="notification-item"
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: 12,
                cursor: unread ? 'pointer' : 'default', border: 'none', fontFamily: 'inherit',
                borderBottom: `1px solid ${C.line}`,
                borderLeft: unread ? `3px solid ${m.color}` : '3px solid transparent',
                opacity: unread ? 1 : 0.65, background: C.popover,
              }}
            >
              <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 16, background: m.soft, color: m.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{m.icon}</span>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'block' }}>
                {unread && <span className="sr-only">Não lida: </span>}
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.titulo}
                </span>
                <span style={{
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  fontSize: 12, color: C.ink2, marginTop: 2, lineHeight: 1.4,
                }}>
                  {a.descricao}
                </span>
                <span style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.accentDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.departamento_autor}
                  </span>
                  <span style={{ fontSize: 11, color: C.ink2, flexShrink: 0 }}>{formatRelativeTime(a.criado_em)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </section>
    );
  };

  return (
    <div style={{ position: 'relative' }} ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={rotuloNaoLidas(naoLidos)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          width: 48, height: 48, borderRadius: 14, border: `1px solid ${C.line}`, cursor: 'pointer',
          background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s', boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span className={`[&>svg]:h-6 [&>svg]:w-6 ${naoLidos > 0 ? 'bell-shake-hover' : ''}`} aria-hidden="true" style={{ position: 'relative', display: 'flex', color: C.ink2 }}>
          <Icons.Bell />
          {naoLidos > 0 && (
            <span style={{
              position: 'absolute', top: -9, right: -10, minWidth: 20, height: 20, borderRadius: 999,
              ...badgeStyle, border: `2px solid ${C.surface}`,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxSizing: 'border-box',
            }}>
              {badgeLabel}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-2xl z-50 overflow-hidden w-[calc(100vw-24px)] max-w-[340px] sm:w-[340px]"
          role="dialog"
          aria-label="Notificações"
          style={{
            background: C.popover, border: `1px solid ${C.line}`, boxShadow: 'var(--shadow-lg)',
            animation: 'notif-dropdown-in 160ms cubic-bezier(0.4, 0, 0.2, 1) both', transformOrigin: 'top right',
          }}
        >
          <div style={{ background: C.surfaceSoft, padding: '10px 12px 10px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 700, color: C.ink }}>Notificações</span>
            {naoLidos > 0 && (
              <LinkButton C={C} size={11} onClick={marcarTodas}>Marcar todas como lidas</LinkButton>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {!loaded ? (
              <div role="status" style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="animate-spin" aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${C.line}`, borderTopColor: C.accent }} />
                <div style={{ fontSize: 12, color: C.ink2 }}>Carregando comunicados...</div>
              </div>
            ) : erro && vazio ? (
              <div role="alert" style={{ padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600, color: C.ink }}>Não foi possível carregar os comunicados</div>
                <div style={{ fontSize: 12, color: C.ink2 }}>Tente de novo em instantes. Se continuar, avise a TI.</div>
              </div>
            ) : vazio ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 22, background: C.successSoft, color: C.successStrong, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>task_alt</span>
                </div>
                <div style={{ fontWeight: 600, color: C.ink }}>Tudo tranquilo!</div>
                <div style={{ fontSize: 12, color: C.ink2 }}>Nenhum comunicado recente.</div>
              </div>
            ) : (
              <>
                {renderGroup(urgentes)}
                {renderGroup(importantes)}
              </>
            )}
          </div>

          <div style={{ padding: 6, background: C.surfaceSoft, borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'center' }}>
            <LinkButton C={C} onClick={() => { close(); setCurrentView('announcements'); }}>
              Ver todos os comunicados
            </LinkButton>
          </div>
        </div>
      )}

      <style>{`
        @keyframes notif-dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
