import UserAvatar from './UserAvatar';

export default function ScheduleMobileCard({
  date,
  day,
  isToday,
  isWeekend,
  n1,
  n2,
  mgr,
  isAdmin,
  onEdit,
}) {
  const renderList = (list, allowEmpty) => (
    <div className="flex flex-col gap-2">
      {Array.isArray(list) ? (
        list.map((u, i) => <UserAvatar key={i} user={u} allowEmpty={allowEmpty} />)
      ) : (
        <UserAvatar user={list} allowEmpty={allowEmpty} />
      )}
    </div>
  );

  return (
    <div
      onClick={isAdmin ? onEdit : undefined}
      role={isAdmin ? 'button' : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } } : undefined}
      aria-label={isAdmin ? `Editar plantão do dia ${date}` : undefined}
      className={`rounded-2xl border p-4 transition-all ${
        isAdmin ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${isToday ? 'border-[var(--accent)] bg-[var(--accent)]/[0.04]' : 'border-border bg-surface'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-extrabold text-sm ${
              isToday
                ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-md shadow-[var(--accent)]/30'
                : isWeekend
                ? 'bg-surface-raised text-faint/70'
                : 'bg-surface-raised text-foreground'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider opacity-80 leading-none mt-0.5">{day.slice(0, 3)}</span>
            <span className="text-lg leading-none mt-0.5">{date.split('/')[0]}</span>
          </div>
          <div>
            <div className={`font-extrabold text-base ${isToday ? 'text-[var(--accent-dark)]' : 'text-foreground'}`}>
              {date}
            </div>
            <div className={`text-xs font-bold ${isWeekend ? 'text-faint/70' : 'text-faint'}`}>
              {isWeekend ? 'Fim de semana' : isToday ? 'Hoje' : 'Plantão'}
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent-dark)] flex items-center justify-center shadow-sm shrink-0"
            aria-label={`Editar plantão ${date}`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-faint mb-1.5">N1 - Atendimento/NOC</div>
          {renderList(n1, false)}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-faint mb-1.5">N2 - Suporte/Serviços</div>
          {renderList(n2, true)}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-faint mb-1.5">Supervisão</div>
          <div className="flex flex-col gap-2">
            {Array.isArray(mgr) ? (
              mgr.map((u, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--accent-soft)]/60 rounded-full pl-1.5 pr-3 py-1 border border-[var(--accent)]/10 w-fit">
                  <UserAvatar user={u} hideName size="size-8" className="gap-0" />
                  <span className="font-bold text-foreground text-xs whitespace-nowrap">{u.name}</span>
                </div>
              ))
            ) : mgr ? (
              <div className="flex items-center gap-2 bg-[var(--accent-soft)]/60 rounded-full pl-1.5 pr-3 py-1 border border-[var(--accent)]/10 w-fit">
                <UserAvatar user={mgr} hideName size="size-8" className="gap-0" />
                <span className="font-bold text-foreground text-xs whitespace-nowrap">{mgr.name}</span>
              </div>
            ) : (
              <UserAvatar user={null} allowEmpty size="size-8" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
