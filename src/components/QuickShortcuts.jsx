import { useState } from 'react'

// Grade 2x2 de atalhos rápidos
export default function QuickShortcuts({ setCurrentView, user }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [protocoloData, setProtocoloData] = useState(null);
    const [tecnicoId, setTecnicoId] = useState('59570'); // Default para Márcio

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setIsSuccess(false);
            setProtocoloData(null);
            setFeedback(null);
            setMensagem('');
        }, 300);
    };

    // Atalhos rápidos disponíveis no dashboard
    const shortcuts = [
        // { icon: 'add_box', label: 'Nova Solicitação', action: () => { } },
        { icon: 'event', label: 'Reservar Sala', action: () => window.open('https://wa.me/558299220181?text=Quero%20agenda%20a%20sala%20de%20reuni%C3%A7%C3%A3o', '_blank') },
        { icon: 'support_agent', label: 'Suporte de TI', action: () => setIsModalOpen(true) },
        { icon: 'badge', label: 'Meu Perfil', action: () => setCurrentView('settings') },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mensagem.trim()) return;

        setIsLoading(true);
        setFeedback(null);

        // Pega o ID do colaborador logado para ser o responsável no ticket
        const colaborador_id = user?.funcionario?.id;

        try {
            const res = await fetch('/api/ixc/su-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    mensagem,
                    colaborador_id,
                    tecnico_id: tecnicoId || null
                })
            });

            const data = await res.json();

            if (data.sucesso) {
                setProtocoloData(data.protocolo);
                setIsSuccess(true);
                setMensagem('');
            } else {
                setFeedback({ type: 'error', text: data.erro || 'Falha ao abrir chamado.' });
            }
        } catch (err) {
            setFeedback({ type: 'error', text: 'Erro ao conectar com o servidor.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                {shortcuts.map((shortcut) => (
                    <button
                        key={shortcut.label}
                        onClick={shortcut.action}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-center group w-full"
                    >
                        <span className="material-symbols-outlined text-4xl text-[#635c55] dark:text-gray-300 mb-3 group-hover:text-primary transition-colors">
                            {shortcut.icon}
                        </span>
                        <span className="text-sm font-bold text-[#1d150c] dark:text-white">{shortcut.label}</span>
                    </button>
                ))}
            </div>

            {/* Modal de Suporte de TI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">support_agent</span>
                                    Suporte de TI
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {isSuccess ? (
                                <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2">Chamado Aberto!</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Seu chamado foi encaminhado com sucesso para o setor de T.I. A equipe será notificada e em breve entrará em contato.
                                    </p>
                                    {protocoloData && (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Número do Protocolo</p>
                                            <p className="font-mono text-lg font-bold text-primary">{protocoloData}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleCloseModal}
                                        className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                                    >
                                        Entendi, fechar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 mb-5 flex gap-3 text-blue-800 dark:text-blue-300">
                                        <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">info</span>
                                        <p className="text-xs leading-relaxed">
                                            Ao preencher e confirmar abaixo, será aberto um chamado oficial para o <strong>Setor de T.I.</strong> Nossa equipe receberá sua solicitação imediatamente.
                                        </p>
                                    </div>
        
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Qual problema ou situação está enfrentando?
                                    </label>
                                    <textarea
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        placeholder="Ex: Minha impressora não está ligando..."
                                        className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Agendar para qual técnico?
                                    </label>
                                    <select
                                        value={tecnicoId}
                                        onChange={(e) => setTecnicoId(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    >
                                        <option value="59570">Márcio Eduardo Felix</option>
                                        <option value="59655">Kariny Alpiano Lima</option>
                                    </select>
                                </div>

                                {feedback && (
                                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        <span className="material-symbols-outlined text-base">
                                            {feedback.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        {feedback.text}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !mensagem.trim()}
                                        className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">send</span>
                                                Confirmar e Abrir
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
