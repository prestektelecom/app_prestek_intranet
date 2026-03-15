import { useState } from 'react'

// Grade 2x2 de atalhos rápidos
export default function QuickShortcuts({ setCurrentView }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Atalhos rápidos disponíveis no dashboard
    const shortcuts = [
        { icon: 'add_box', label: 'Nova Solicitação', action: () => { } },
        { icon: 'event', label: 'Reservar Sala', action: () => { } },
        { icon: 'support_agent', label: 'Suporte de TI', action: () => setIsModalOpen(true) },
        { icon: 'badge', label: 'Meu Perfil', action: () => setCurrentView('settings') },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mensagem.trim()) return;

        setIsLoading(true);
        setFeedback(null);

        try {
            const res = await fetch('http://localhost:3001/api/ixc/su-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem })
            });

            const data = await res.json();

            if (data.sucesso) {
                setFeedback({ type: 'success', text: 'Chamado aberto com sucesso no IXC!' });
                setMensagem('');
                setTimeout(() => {
                    setIsModalOpen(false);
                    setFeedback(null);
                }, 3000);
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
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Descreva abaixo a situação ou o problema que você está enfrentando.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <textarea
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        placeholder="Ex: Minha impressora não está ligando..."
                                        className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none dark:text-white"
                                        required
                                    />
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !mensagem.trim()}
                                        className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Abrir Chamado'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
