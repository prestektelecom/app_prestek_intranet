import React from 'react';
import UserAvatar from './UserAvatar';

export default function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr, isAdmin, onEdit }) {
    const isArray = (val) => Array.isArray(val);
    
    return (
        <tr 
            className={`border-b border-surface-container-low/30 transition-all duration-300 group ${isAdmin ? 'cursor-pointer hover:bg-primary/5 hover:shadow-sm' : 'hover:bg-surface-container-low/30'} ${isToday ? 'bg-primary/[0.03]' : ''}`}
            onClick={isAdmin ? onEdit : undefined}
            tabIndex={isAdmin ? 0 : undefined}
            onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } } : undefined}
            aria-label={isAdmin ? `Editar plantão do dia ${date}` : undefined}
            role={isAdmin ? 'button' : 'row'}
        >
            <td className={`p-4 pl-8 font-black relative ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isToday ? 'bg-primary' : (isAdmin ? 'group-hover:bg-primary/40 bg-transparent' : 'bg-transparent')}`}></div>
                {date}
            </td>
            <td className={`p-4 font-bold ${isWeekend ? 'text-secondary opacity-70' : 'text-on-surface-variant'}`}>{day}</td>
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
                        <div key={i} className="flex items-center gap-2 bg-secondary-container/30 rounded-full pl-1.5 pr-3 py-1 border border-secondary/10">
                            <UserAvatar user={u} hideName className="!gap-0 !size-8" />
                            <span className="font-bold text-on-surface text-[11px] whitespace-nowrap">{u.name}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-2 bg-secondary-container/30 rounded-full pl-1.5 pr-3 py-1 border border-secondary/10">
                            <UserAvatar user={mgr} hideName className="!gap-0" />
                            <span className="font-bold text-on-surface text-[11px] whitespace-nowrap">{mgr.name}</span>
                        </div>
                    )}
                </div>
            </td>
            {isAdmin && (
                <td className="p-4 pr-6 w-12 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                </td>
            )}
        </tr>
    );
}
