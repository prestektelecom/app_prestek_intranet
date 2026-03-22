import { useState, useEffect } from 'react';

// Widget de disponibilidade da equipe com fotos empilhadas
export default function TeamAvailability() {
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnline = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/colaboradores/online');
                const data = await response.json();
                if (data.sucesso) {
                    setOnlineMembers(data.colaboradores || []);
                }
            } catch (err) {
                console.error('Erro ao buscar colaboradores online:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOnline();
        // Atualiza a cada 1 minuto para manter a lista fresca
        const interval = setInterval(fetchOnline, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Limita a exibição a 4 avatares
    const displayedMembers = onlineMembers.slice(0, 4);
    const extraCount = Math.max(0, onlineMembers.length - 4);

    if (loading && onlineMembers.length === 0) {
        return (
            <div className="mt-6 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg p-5 shadow-sm animate-pulse">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="flex -space-x-2 mb-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 ring-2 ring-white dark:ring-[#1a130b]"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Disponibilidade da Equipe</h3>
                <span className="material-symbols-outlined text-gray-400 text-sm">more_horiz</span>
            </div>

            {/* Fotos empilhadas */}
            <div className="flex -space-x-2 mb-3">
                {displayedMembers.map((member, idx) => (
                    <div key={member.id || idx} className="relative inline-block" title={member.nome}>
                        <img
                            alt={member.nome}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1a130b] object-cover bg-gray-100 dark:bg-gray-800"
                            src={member.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=random`}
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=random`;
                            }}
                        />
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#1a130b] bg-green-500"></span>
                    </div>
                ))}
                
                {extraCount > 0 && (
                    <div className="relative inline-block">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1a130b] bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                            +{extraCount}
                        </div>
                    </div>
                )}

                {onlineMembers.length === 0 && !loading && (
                    <span className="text-xs text-gray-400 italic">Ninguém online no momento</span>
                )}
            </div>

            {/* Status online */}
            <div className="flex items-center gap-2 text-xs text-[#635c55] dark:text-gray-300">
                <span className={`size-2 rounded-full ${onlineMembers.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                {onlineMembers.length} {onlineMembers.length === 1 ? 'Online agora' : 'Online agora'}
            </div>
        </div>
    );
}
