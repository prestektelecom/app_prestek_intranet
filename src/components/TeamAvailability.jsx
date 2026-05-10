import { useState, useEffect } from 'react';
import LottieAvatar from './common/LottieAvatar';
import InitialsAvatar from './common/InitialsAvatar';

import avatar1 from '../image/avatar/4472612.json';
import avatar2 from '../image/avatar/4472613.json';
import avatar3 from '../image/avatar/4472614.json';
import avatar4 from '../image/avatar/4472615.json';
import avatar5 from '../image/avatar/4472616.json';
import avatar6 from '../image/avatar/4472617.json';
import avatar7 from '../image/avatar/4472622.json';
import avatar8 from '../image/avatar/4472623.json';
import avatar9 from '../image/avatar/4472624.json';
import avatar10 from '../image/avatar/4472625.json';

const PREDEFINED_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function resolveLottieFromStorage(raw) {
    if (!raw) return null;
    if (typeof raw === 'string' && raw.startsWith('__lottie_idx:')) {
        const idx = parseInt(raw.split(':')[1], 10);
        return PREDEFINED_AVATARS[idx] ?? null;
    }
    if (typeof raw === 'object' && (raw.v || raw.fr)) return raw;
    return null;
}

function MemberAvatar({ member, ringClass, avatarClass, setor }) {
    const [imgFailed, setImgFailed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const tooltip = (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 transition-all duration-150 pointer-events-none ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
            <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-left min-w-max">
                <p className="text-xs font-semibold text-foreground leading-tight">{member.nome}</p>
                {setor && <p className="text-[11px] text-muted leading-tight mt-0.5">{setor}</p>}
                <p className="text-[11px] text-green-500 font-medium mt-1 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 inline-block"></span>
                    Online agora
                </p>
            </div>
            <div className="w-2 h-2 bg-card border-b border-r border-border rotate-45 mx-auto -mt-1"></div>
        </div>
    );

    const wrapperClass = 'relative inline-block cursor-default';

    if (member.lottie) {
        return (
            <div className={wrapperClass} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                {tooltip}
                <LottieAvatar src={member.lottie} className={`${avatarClass} ${ringClass}`} />
            </div>
        );
    }

    if (member.foto && !imgFailed) {
        return (
            <div className={wrapperClass} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                {tooltip}
                <img alt={member.nome} className={`${avatarClass} ${ringClass} object-cover bg-surface-raised`} src={member.foto} onError={() => setImgFailed(true)} />
            </div>
        );
    }

    return (
        <div className={wrapperClass} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {tooltip}
            <InitialsAvatar name={member.nome} className={`${avatarClass} ${ringClass} text-sm`} />
        </div>
    );
}

export default function TeamAvailability({ user }) {
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deptoMap, setDeptoMap] = useState({});

    useEffect(() => {
        fetch('/api/departamentos-empresa')
            .then(r => r.json())
            .then(d => {
                if (d.sucesso) {
                    const map = {};
                    (d.departamentos || []).forEach(dep => { map[String(dep.id)] = dep.departamento; });
                    setDeptoMap(map);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const fetchOnline = async () => {
            try {
                const response = await fetch('/api/colaboradores/online');
                const data = await response.json();
                if (data.sucesso) {
                    let members = data.colaboradores || [];
                    if (user?.id) {
                        // Lê Lottie do localStorage independente de onde o usuário aparece na lista
                        const localKey = `stitch_profile_${user.funcionario?.id ?? user.id}`;
                        let localLottie = null;
                        try {
                            const saved = localStorage.getItem(localKey);
                            if (saved) {
                                const p = JSON.parse(saved);
                                localLottie = resolveLottieFromStorage(p.avatarUrl);
                            }
                        } catch (_) { }

                        const idx = members.findIndex(
                            m => String(m.id) === String(user.id) || String(m.id) === String(user.funcionario?.id)
                        );
                        if (idx > -1) {
                            const [cur] = members.splice(idx, 1);
                            // Sobrescreve lottie com o do localStorage (mais confiável que o banco)
                            members = [{ ...cur, lottie: localLottie || cur.lottie }, ...members];
                        } else if (user.nome) {
                            members = [{ id: user.id, nome: user.nome, foto: null, lottie: localLottie, status: 'online' }, ...members];
                        }
                    }
                    setOnlineMembers(members);
                }
            } catch (err) {
                console.error('Erro ao buscar colaboradores online:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOnline();
        const interval = setInterval(fetchOnline, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const displayedMembers = onlineMembers.slice(0, 4);
    const extraCount = Math.max(0, onlineMembers.length - 4);
    const ringClass = 'ring-2 ring-card';
    const avatarClass = 'h-12 w-12 rounded-full';

    if (loading && onlineMembers.length === 0) {
        return (
            <div className="mt-6 bg-card border border-border rounded-lg p-5 shadow-sm animate-pulse">
                <div className="h-4 w-32 bg-surface-raised rounded mb-4"></div>
                <div className="flex -space-x-2 mb-3">
                    {[1, 2, 3].map(i => <div key={i} className={`${avatarClass} ${ringClass} bg-surface-raised`}></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-foreground">Disponibilidade da Equipe</h3>
                <span className="material-symbols-outlined text-muted text-sm">more_horiz</span>
            </div>

            <div className="flex -space-x-2 mb-3">
                {displayedMembers.map((member, idx) => (
                    <MemberAvatar
                        key={member.id || idx}
                        member={member}
                        ringClass={ringClass}
                        avatarClass={avatarClass}
                        setor={deptoMap[String(member.id_departamento)] || null}
                    />
                ))}
                {extraCount > 0 && (
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full ${ringClass} bg-surface-raised text-xs font-bold text-muted`}>
                        +{extraCount}
                    </div>
                )}
                {onlineMembers.length === 0 && !loading && (
                    <span className="text-xs text-muted italic">Ninguém online no momento</span>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
                <span className={`size-2 rounded-full ${onlineMembers.length > 0 ? 'bg-green-500' : 'bg-surface-raised'}`}></span>
                {onlineMembers.length} {onlineMembers.length === 1 ? 'Online agora' : 'Online agora'}
            </div>
        </div>
    );
}
