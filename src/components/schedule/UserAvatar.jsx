import React from 'react';
import LottieAvatar from '../common/LottieAvatar';

export default function UserAvatar({ user, allowEmpty, hideName, className }) {
    if (!user && allowEmpty) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                 <div className="size-8 rounded-full bg-surface-container-low border border-surface-container-high/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-secondary">person_off</span>
                 </div>
                 {!hideName && <span className="text-[11px] font-bold text-secondary opacity-50 italic">Pendente</span>}
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={`flex items-center gap-3 group/avatar ${className}`}>
            {user.img ? (
                <div className="relative">
                    <LottieAvatar 
                        src={user.img}
                        className="size-9 rounded-full border-2 border-surface-container-high shadow-sm shrink-0 group-hover/avatar:border-primary/50 transition-colors"
                    />
                </div>
            ) : (
                <div className="size-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-black text-[11px] border-2 border-secondary/10 shadow-sm shrink-0 uppercase group-hover/avatar:border-primary/30 transition-colors">
                    {user.initials}
                </div>
            )}
            {!hideName && (
                <div className="flex flex-col -gap-1">
                    <span className="font-black text-on-surface whitespace-nowrap tracking-tight group-hover/avatar:text-primary transition-colors">{user.name}</span>
                    <span className="text-[9px] text-secondary font-bold uppercase tracking-wider opacity-0 group-hover/avatar:opacity-100 transition-opacity">Visualizar Perfil</span>
                </div>
            )}
        </div>
    );
}
