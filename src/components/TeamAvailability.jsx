import { useState, useEffect } from 'react';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';


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
    const fallbackSrc = AVATAR_PNGS[(member.id || 0) % AVATAR_PNGS.length];

    return (
        <div className={wrapperClass} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {tooltip}
            <img
                alt={member.nome}
                className={`${avatarClass} ${ringClass} object-cover bg-surface-raised`}
                src={(!imgFailed && member.foto) ? member.foto : fallbackSrc}
                onError={() => setImgFailed(true)}
            />
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
                    let members = (data.colaboradores || []).map(m => ({
                        ...m,
                        foto: m.foto || resolveAvatarUrl(m.lottie_ref) || null,
                    }));
                    if (user?.id) {
                        const resolvedId = user.funcionario?.id ?? user.id;
                        const localKey = (!resolvedId || String(resolvedId) === '0' || String(resolvedId) === '0000')
                            ? null
                            : `stitch_profile_${resolvedId}`;

                        let localFoto = null;
                        try {
                            const saved = localKey ? localStorage.getItem(localKey) : null;
                            if (saved) {
                                const p = JSON.parse(saved);
                                localFoto = resolveAvatarUrl(p.avatarUrl) || null;
                            }
                        } catch (_) { }

                        const idx = members.findIndex(
                            m => String(m.id) === String(user.id) || String(m.id) === String(user.funcionario?.id)
                        );
                        if (idx > -1) {
                            const [cur] = members.splice(idx, 1);
                            members = [{ ...cur, foto: localFoto || cur.foto || null }, ...members];
                        } else if (user.nome) {
                            members = [{ id: user.id, nome: user.nome, foto: localFoto, status: 'online' }, ...members];
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
    }, [user?.id, user?.funcionario?.id]);

    const displayedMembers = onlineMembers.slice(0, 4);
    const extraCount = Math.max(0, onlineMembers.length - 4);
    const ringClass = 'ring-2 ring-card';
    const avatarClass = 'h-14 w-14 rounded-full';

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
                        key={`${member.id || idx}-${!!member.foto}`}
                        member={member}
                        ringClass={ringClass}
                        avatarClass={avatarClass}
                        setor={deptoMap[String(member.id_departamento)] || null}
                    />
                ))}
                {extraCount > 0 && (
                    <div className={`flex items-center justify-center h-14 w-14 rounded-full ${ringClass} bg-surface-raised text-xs font-bold text-muted`}>
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
