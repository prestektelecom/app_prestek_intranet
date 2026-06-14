import React from 'react';
import UserAvatar from './UserAvatar';

export default function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr, isAdmin, onEdit }) {
    const isArray = (val) => Array.isArray(val);
    
    return (
        <tr 
            className={`border-b border-[#E4ECF5]/60 transition-all duration-300 group ${isAdmin ? 'cursor-pointer hover:bg-[#EAF4FF] hover:shadow-sm' : 'hover:bg-[#F7FAFD]/50'} ${isToday ? 'bg-[#4A9EF5]/[0.04]' : ''}`}
            onClick={isAdmin ? onEdit : undefined}
            tabIndex={isAdmin ? 0 : undefined}
            onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } } : undefined}
            aria-label={isAdmin ? `Editar plantão do dia ${date}` : undefined}
            role={isAdmin ? 'button' : 'row'}
        >
            <td className={`p-4 pl-8 font-black relative ${isToday ? 'text-[#4A9EF5]' : 'text-[#0B1B2E]'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isToday ? 'bg-[#4A9EF5]' : (isAdmin ? 'group-hover:bg-[#4A9EF5]/40 bg-transparent' : 'bg-transparent')}`}></div>
                {date}
            </td>
            <td className={`p-4 font-bold ${isWeekend ? 'text-[#475467] opacity-70' : 'text-[#475467]'}`}>{day}</td>
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
                        <div key={i} className="flex items-center gap-2 bg-[#EAF4FF]/60 rounded-full pl-1.5 pr-3 py-1 border border-[#4A9EF5]/10">
                            <UserAvatar user={u} hideName className="!gap-0 !size-8" />
                            <span className="font-bold text-[#0B1B2E] text-[11px] whitespace-nowrap">{u.name}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-2 bg-[#EAF4FF]/60 rounded-full pl-1.5 pr-3 py-1 border border-[#4A9EF5]/10">
                            <UserAvatar user={mgr} hideName className="!gap-0" />
                            <span className="font-bold text-[#0B1B2E] text-[11px] whitespace-nowrap">{mgr.name}</span>
                        </div>
                    )}
                </div>
            </td>
            {isAdmin && (
                <td className="p-4 pr-6 w-12 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-[#EAF4FF] text-[#4A9EF5] flex items-center justify-center mx-auto shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                </td>
            )}
        </tr>
    );
}
