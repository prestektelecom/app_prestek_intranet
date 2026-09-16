import React from 'react';
import UserAvatar from './UserAvatar';

export default function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr, isAdmin, onEdit }) {
    const isArray = (val) => Array.isArray(val);

    return (
        <tr
            className={`border-b border-border/60 transition-all duration-300 group ${isAdmin ? 'cursor-pointer hover:bg-[var(--accent-soft)] hover:shadow-sm' : 'hover:bg-surface-raised/50'} ${isToday ? 'bg-[var(--accent)]/[0.04]' : ''}`}
            onClick={isAdmin ? onEdit : undefined}
            tabIndex={isAdmin ? 0 : undefined}
            onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } } : undefined}
            aria-label={isAdmin ? `Editar plantão do dia ${date}` : undefined}
            role={isAdmin ? 'button' : 'row'}
        >
            <td className={`p-4 pl-8 font-extrabold relative ${isToday ? 'text-[var(--accent-dark)]' : 'text-foreground'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isToday ? 'bg-[var(--accent)]' : (isAdmin ? 'group-hover:bg-[var(--accent)]/40 bg-transparent' : 'bg-transparent')}`}></div>
                <div className="flex items-center gap-2">
                    {date}
                    {isToday && (
                        <span className="text-[11px] font-extrabold uppercase tracking-widest bg-[var(--accent)] text-[var(--on-accent)] px-1.5 py-0.5 rounded-full">Hoje</span>
                    )}
                </div>
            </td>
            <td className={`p-4 font-bold ${isWeekend ? 'text-faint opacity-70' : 'text-faint'}`}>{day}</td>
            <td className="p-4">
                {isArray(n1) ? (
                    <div className="flex flex-col gap-2">
                        {n1.map((u, i) => <UserAvatar key={i} user={u} />)}
                    </div>
                ) : <UserAvatar user={n1} />}
            </td>
            <td className="p-4">
                {isArray(n2) ? (
                    <div className="flex flex-col gap-2">
                        {n2.map((u, i) => <UserAvatar key={i} user={u} allowEmpty />)}
                    </div>
                ) : <UserAvatar user={n2} allowEmpty />}
            </td>
            <td className="p-4 pr-8 text-right sm:text-left">
                <div className={`flex flex-col gap-2 items-end sm:items-start transition-transform ${isAdmin ? 'group-hover:-translate-x-2' : ''}`}>
                    {isArray(mgr) ? mgr.map((u, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[var(--accent-soft)]/60 rounded-full pl-1.5 pr-3 py-1 border border-[var(--accent)]/10">
                            <UserAvatar user={u} hideName size="size-8" className="gap-0" />
                            <span className="font-bold text-foreground text-[11px] whitespace-nowrap">{u.name}</span>
                        </div>
                    )) : mgr ? (
                        <div className="flex items-center gap-2 bg-[var(--accent-soft)]/60 rounded-full pl-1.5 pr-3 py-1 border border-[var(--accent)]/10">
                            <UserAvatar user={mgr} hideName size="size-8" className="gap-0" />
                            <span className="font-bold text-foreground text-[11px] whitespace-nowrap">{mgr.name}</span>
                        </div>
                    ) : (
                        <UserAvatar user={null} allowEmpty size="size-8" />
                    )}
                </div>
            </td>
            {isAdmin && (
                <td className="p-4 pr-6 w-12 text-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent-dark)] flex items-center justify-center mx-auto shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                </td>
            )}
        </tr>
    );
}
