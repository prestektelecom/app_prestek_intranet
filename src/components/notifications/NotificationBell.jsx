import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icons } from '../common/Icons';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { formatRelativeTime } from '../../utils/relativeTime';

function iconBtn(C) {
  return {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: `1px solid ${C.line}`,
    cursor: 'pointer',
    background: C.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all .12s',
    boxShadow: `0 1px 2px ${C.accentDeep}0A`,
  };
}

function getTypeMeta(theme, tipo) {
  if (tipo === 'Urgente') {
    return {
      color: theme.danger,
      soft: theme.dangerSoft,
      icon: 'priority_high',
      label: 'Urgente',
    };
  }
  return {
    color: theme.warning,
    soft: theme.warningSoft,
    icon: 'notification_important',
    label: 'Importante',
  };
}

export default function NotificationBell({ user, setCurrentView }) {
  const C = useBentoTheme();
  const safeId = user?.funcionario?.id ?? user?.id ?? null;

  const [urgentAnnouncements, setUrgentAnnouncements] = useState([]);
  const [importantAnnouncements, setImportantAnnouncements] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const notificationsRef = useRef(null);

  const getSeenKey = useCallback(
    (userId) => `notif_seen_${userId || 'anonymous'}`,
    []
  );

  const getSeenIdsFromStorage = useCallback(
    (userId) => {
      try {
        const data = localStorage.getItem(getSeenKey(userId));
        return data ? JSON.parse(data) : [];
      } catch (_) {
        return [];
      }
    },
    [getSeenKey]
  );

  const saveSeenIds = useCallback(
    (ids, currentIds) => {
      try {
        const currentIdSet = new Set(currentIds.map(String));
        const cleaned = Array.from(new Set(ids.map(String))).filter((id) =>
          currentIdSet.has(id)
        );
        localStorage.setItem(getSeenKey(safeId), JSON.stringify(cleaned));
        return cleaned;
      } catch (_) {
        return ids;
      }
    },
    [getSeenKey, safeId]
  );

  useEffect(() => {
    setSeenIds(getSeenIdsFromStorage(safeId));
  }, [safeId, getSeenIdsFromStorage]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/comunicados');
        if (res.ok) {
          const data = await res.json();
          if (data.sucesso && data.comunicados) {
            const urgents = data.comunicados.filter((c) => c.tipo === 'Urgente');
            const importants = data.comunicados.filter(
              (c) => c.tipo === 'Importante'
            );
            setUrgentAnnouncements(urgents);
            setImportantAnnouncements(importants);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar comunicados no header', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
    const id = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentIds = useMemo(
    () =>
      [...urgentAnnouncements, ...importantAnnouncements].map((c) =>
        String(c.id)
      ),
    [urgentAnnouncements, importantAnnouncements]
  );

  const unseenUrgents = useMemo(
    () => urgentAnnouncements.filter((c) => !seenIds.includes(String(c.id))),
    [urgentAnnouncements, seenIds]
  );

  const unseenImportants = useMemo(
    () => importantAnnouncements.filter((c) => !seenIds.includes(String(c.id))),
    [importantAnnouncements, seenIds]
  );

  const unseenCount = unseenUrgents.length + unseenImportants.length;
  const badgeLabel = unseenCount > 9 ? '9+' : String(unseenCount);
  const badgeColor =
    unseenUrgents.length > 0
      ? C.danger
      : unseenImportants.length > 0
      ? C.warning
      : null;

  const handleBellClick = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleItemClick = (id) => {
    const idStr = String(id);
    if (seenIds.includes(idStr)) return;

    const updated = [...seenIds, idStr];
    const cleaned = saveSeenIds(updated, currentIds);
    setSeenIds(cleaned);
  };

  const handleMarkAllRead = () => {
    if (currentIds.length === 0) return;
    const updated = Array.from(new Set([...seenIds, ...currentIds]));
    const cleaned = saveSeenIds(updated, currentIds);
    setSeenIds(cleaned);
  };

  const sortByDateDesc = (a, b) =>
    new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();

  const ariaLabel =
    unseenCount > 0
      ? `Notificações (${unseenCount} não lidas)`
      : 'Notificações (sem novas)';

  const renderGroup = (items) => {
    if (items.length === 0) return null;
    const meta = getTypeMeta(C, items[0].tipo);

    return (
      <div key={meta.label}>
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: meta.soft,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 14, color: meta.color }}
          >
            {meta.icon}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: meta.color,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          >
            {meta.label} ({items.length})
          </span>
        </div>

        {items.sort(sortByDateDesc).map((a) => {
          const metaItem = getTypeMeta(C, a.tipo);
          const isUnread = !seenIds.includes(String(a.id));
          return (
            <div
              key={a.id}
              onClick={() => handleItemClick(a.id)}
              className="notification-item"
              style={{
                padding: '12px 16px',
                display: 'flex',
                gap: 12,
                cursor: 'pointer',
                borderBottom: `1px solid ${C.line}`,
                borderLeft: isUnread ? `3px solid ${metaItem.color}` : '3px solid transparent',
                opacity: isUnread ? 1 : 0.65,
                background: C.surface,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: metaItem.soft,
                  color: metaItem.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  {metaItem.icon}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: C.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.titulo}
                </div>
                <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>
                  {a.descricao}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: C.accent,
                    }}
                  >
                    {a.departamento_autor}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.muted }}>
                    {formatRelativeTime(a.criado_em)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }} ref={notificationsRef}>
      <button
        onClick={handleBellClick}
        style={iconBtn(C)}
        aria-label={ariaLabel}
        aria-expanded={isNotificationsOpen}
        aria-haspopup="dialog"
        type="button"
      >
        <span
          className={unseenCount > 0 ? 'bell-shake-hover' : ''}
          style={{ position: 'relative', display: 'flex', color: C.ink2 }}
        >
          <Icons.Bell />
          {unseenCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: badgeColor,
                border: '2px solid #F5F9FF',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxSizing: 'border-box',
              }}
            >
              {badgeLabel}
            </span>
          )}
        </span>
      </button>

      {isNotificationsOpen && (
        <div
          className="
            absolute right-0 mt-2 rounded-2xl z-50 overflow-hidden
            w-[calc(100vw-32px)] max-w-[320px] sm:w-80
          "
          role="dialog"
          aria-label="Notificações"
          style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            boxShadow: `0 12px 32px ${C.ink}1F`,
            animation:
              'notif-dropdown-in 160ms cubic-bezier(0.4, 0, 0.2, 1) both',
            transformOrigin: 'top right',
          }}
        >
          <div
            style={{
              background: C.surfaceSoft,
              padding: '12px 16px',
              borderBottom: `1px solid ${C.line}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <span style={{ fontWeight: 700, color: C.ink }}>Notificações</span>
            {unseenCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.accent,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
                type="button"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            {isLoading ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  className="animate-spin"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    border: `2px solid ${C.line}`,
                    borderTopColor: C.accent,
                  }}
                />
                <div style={{ fontSize: 12, color: C.muted }}>
                  Carregando comunicados...
                </div>
              </div>
            ) : urgentAnnouncements.length === 0 &&
              importantAnnouncements.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: C.successSoft,
                    color: C.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 24 }}
                  >
                    task_alt
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: C.ink }}>
                  Tudo tranquilo!
                </div>
                <div style={{ fontSize: 12, color: C.ink2 }}>
                  Nenhum comunicado recente.
                </div>
              </div>
            ) : (
              <>
                {renderGroup(urgentAnnouncements)}
                {renderGroup(importantAnnouncements)}
              </>
            )}
          </div>

          <div
            style={{
              padding: 8,
              background: C.surfaceSoft,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <button
              onClick={() => {
                setIsNotificationsOpen(false);
                setCurrentView('announcements');
              }}
              style={{
                width: '100%',
                padding: '8px 0',
                fontSize: 12,
                fontWeight: 700,
                color: C.accent,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              type="button"
            >
              Ver todos os comunicados
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes notif-dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
