import { useState, useEffect } from 'react';

// Lista de comunicados urgentes
export default function AnnouncementsList({ setCurrentView }) {
    const [comunicados, setComunicados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUrgents = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/comunicados');
                const data = await res.json();
                if (data.sucesso) {
                    // Filtrar apenas urgentes e ordenar por data decrescente
                    const urgents = data.comunicados
                        .filter(item => item.tipo === 'Urgente')
                        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
                        .slice(0, 3); // Pegar os 3 mais recentes
                    setComunicados(urgents);
                }
            } catch (error) {
                console.error("Erro ao carregar comunicados urgentes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUrgents();
    }, []);

    const handleSeeAll = (e) => {
        e.preventDefault();
        if (setCurrentView) {
            setCurrentView('announcements');
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' ');
    };

    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1d150c] dark:text-white">Comunicados Urgentes</h2>
                <button
                    onClick={handleSeeAll}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    Ver Todos
                </button>
            </div>

            <div className="bg-white dark:bg-[#1a130b] rounded-lg border border-[#eaddcd] dark:border-gray-800 shadow-sm divide-y divide-[#f4eee6]">
                {loading ? (
                    <div className="p-8 flex justify-center items-center text-[#635c55] dark:text-gray-300">
                        <span className="material-symbols-outlined animate-spin text-primary text-2xl mr-2">autorenew</span>
                        Carregando comunicados...
                    </div>
                ) : comunicados.length > 0 ? (
                    comunicados.map((item) => (
                        <div
                            key={item.id}
                            className="p-5 flex gap-4 hover:bg-[#fcfaf8] dark:bg-[#2c2217] transition-colors cursor-pointer group"
                        >
                            {/* Ícone */}
                            <div className="shrink-0 pt-1">
                                <div className={`size-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center`}>
                                    <span className="material-symbols-outlined">priority_high</span>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-[#1d150c] dark:text-white group-hover:text-primary transition-colors">
                                        {item.titulo}
                                    </h3>
                                    <span className="text-xs text-[#635c55] dark:text-gray-300 bg-[#f4eee6] dark:bg-gray-800 px-2 py-1 rounded shrink-0 ml-2">
                                        {formatarData(item.criado_em)}
                                    </span>
                                </div>
                                <p className="text-sm text-[#635c55] dark:text-gray-300 line-clamp-2">{item.descricao}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                        <p className="text-[#1d150c] dark:text-white font-medium">Tudo tranquilo!</p>
                        <p className="text-sm text-[#635c55] dark:text-gray-400">Nenhum comunicado urgente no momento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
