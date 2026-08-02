import React from 'react';
import LottieAvatar from '../common/LottieAvatar';
import { useBentoTheme } from '../../hooks/useBentoTheme';

export default function UserAvatar({ user, allowEmpty, hideName, className }) {
    const C = useBentoTheme();
    if (!user && allowEmpty) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                 <div className="size-8 rounded-full bg-[#F7FAFD] border border-[#E4ECF5] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-[#8896A8]">person_off</span>
                 </div>
                 {!hideName && <span className="text-[11px] font-bold text-[#8896A8] opacity-50 italic">Pendente</span>}
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
                        className="size-9 rounded-full border-2 border-[#E4ECF5] shadow-sm shrink-0 group-hover/avatar:border-[#EC7D23]/50 transition-colors"
                    />
                </div>
            ) : (
                <div className="size-9 rounded-full bg-[#FFF7ED] text-[#9A3412] flex items-center justify-center font-black text-[11px] border-2 border-[#EC7D23]/10 shadow-sm shrink-0 uppercase group-hover/avatar:border-[#EC7D23]/30 transition-colors">
                    {user.initials}
                </div>
            )}
            {!hideName && (
                <div className="flex flex-col -gap-1">
                    <span className="font-black text-[#0B1B2E] whitespace-nowrap tracking-tight group-hover/avatar:text-[#C2410C] transition-colors">{user.name}</span>
                </div>
            )}
        </div>
    );
}