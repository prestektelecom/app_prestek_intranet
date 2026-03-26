import { useState, useEffect } from 'react';

export default function TicketsList({ user }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            // No backend real, poderíamos ter uma rota /api/ixc/list-tickets
            // Por enquanto, vamos usar a rota genérica que já existe no backend para listar tickets
            const res = await fetch('/api/ixc/su-ticket/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    colaborador_id: user?.funcionario?.id 
                })
            });

            if (!res.ok) throw new Error('Falha ao buscar chamados.');

            const data = await res.json();
            if (data.sucesso) {
                setTickets(data.tickets || []);
            } else {
                throw new Error(data.erro || 'Erro ao carregar lista.');
            }
        } catch (err) {
            console.error('Erro ao buscar tickets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user?.funcionario?.id]);

    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark py-8 px-4 md:px-10">
            <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#a17745] dark:text-orange-300 text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        <span>/</span>
                        <span>Meu Atendimento</span>
                        <span>/</span>
                        <span className="text-[#1d150c] dark:text-white">Meus Chamados</span>
                    </div>
                    <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Meus Chamados</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-base font-normal leading-normal max-w-2xl">
                        Acompanhe aqui o status de todos os seus tickets de suporte abertos no sistema.
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col mb-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-[#a17745] dark:text-orange-300 font-medium animate-pulse">Buscando chamados no IXC...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                            <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                            <div className="space-y-1">
                                <p className="text-[#1d150c] dark:text-white font-bold text-lg">Ops! Algo deu errado.</p>
                                <p className="text-[#a17745] dark:text-orange-300">{error}</p>
                            </div>
                            <button 
                                onClick={fetchTickets}
                                className="mt-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#eaddcd] dark:text-gray-700">confirmation_number</span>
                            <div className="space-y-1">
                                <p className="text-[#1d150c] dark:text-white font-bold text-lg">Nenhum chamado encontrado.</p>
                                <p className="text-[#a17745] dark:text-orange-300">Você ainda não abriu nenhum ticket de suporte.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#fcfaf8] dark:bg-[#2c2217] border-b border-[#eaddcd] dark:border-gray-800">
                                        <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Protocolo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Assunto / Mensagem</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider text-right">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eaddcd] dark:divide-gray-800 bg-white dark:bg-[#1a130b]">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">#{ticket.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-mono">
                                                {ticket.protocolo || <span className="text-gray-400 italic">Aguardando...</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#1d150c] dark:text-white max-w-md">
                                                <div className="font-bold mb-0.5 truncate">{ticket.titulo || 'Suporte de TI'}</div>
                                                <div className="text-[#a17745] dark:text-orange-300 text-xs line-clamp-1">{ticket.menssagem}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                    ticket.status === 'F' ? 'bg-green-100 text-green-800' :
                                                    ticket.status === 'T' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {ticket.status === 'F' ? 'Finalizado' : ticket.status === 'T' ? 'Aberto' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#a17745] dark:text-orange-300">
                                                {ticket.data_cadastro ? new Date(ticket.data_cadastro).toLocaleDateString('pt-BR') : '--/--/--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
