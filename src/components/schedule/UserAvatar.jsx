import React from 'react';
import LottieAvatar from '../common/LottieAvatar';
import { cn } from '../../lib/utils';

export default function UserAvatar({ user, allowEmpty, hideName, className, size = 'size-9' }) {
    if (!user && allowEmpty) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                 <div className="size-8 rounded-full bg-surface-raised border border-border flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-muted">person_off</span>
                 </div>
                 {/* opacity-50 saía do fix: mesmo com text-faint, metade da
                     opacidade reprova 2,35:1 — itálico já sinaliza "pendente"
                     sem precisar apagar o texto (achado da auditoria global,
                     Fase 16). */}
                 {!hideName && <span className="text-[11px] font-bold text-faint italic">Pendente</span>}
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={cn('flex items-center gap-3 group/avatar', className)}>
            {user.img ? (
                <div className="relative">
                    <LottieAvatar
                        src={user.img}
                        className={cn(size, 'rounded-full border-2 border-border shadow-sm shrink-0 group-hover/avatar:border-[var(--accent)]/50 transition-colors')}
                    />
                </div>
            ) : (
                <div className={cn(size, 'rounded-full bg-[var(--accent-soft)] text-[var(--accent-dark)] flex items-center justify-center font-extrabold text-[11px] border-2 border-[var(--accent)]/10 shadow-sm shrink-0 uppercase group-hover/avatar:border-[var(--accent)]/30 transition-colors')}>
                    {user.initials}
                </div>
            )}
            {!hideName && (
                <span className="font-extrabold text-foreground tracking-tight group-hover/avatar:text-[var(--accent-dark)] transition-colors break-words">{user.name}</span>
            )}
        </div>
    );
}
