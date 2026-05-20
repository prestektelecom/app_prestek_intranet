import { useState } from 'react'

export default function TiSupportModal({ isOpen, onClose, user }) {
    const [mensagem, setMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [protocoloData, setProtocoloData] = useState(null);

    const handleClose = () => {
        onClose();
        // Reset states after animation closes
        setTimeout(() => {
            setIsSuccess(false);
            setProtocoloData(null);
            setFeedback(null);
            setMensagem('');
        }, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mensagem.trim()) return;

        setIsLoading(true);
        setFeedback(null);

        // O colaborador logado é o responsável técnico e solicitante
        const colaborador_id = user?.funcionario?.id || null;
        const nome_solicitante = user?.funcionario?.funcionario || user?.nome || 'Usuário Intranet';

        try {
            const res = await fetch('/api/ixc/su-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    mensagem,
                    colaborador_id,
                    tecnico_id: colaborador_id, // Colaborador Responsável: deve ser a pessoa que está solicitando
                    nome_solicitante
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-2xl">support_agent</span>
                        Suporte de TI
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 dark:border-green-800/20">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chamado Aberto com Sucesso!</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
                                Seu chamado de suporte foi registrado no IXC Soft. O setor de T.I. foi notificado e você é o responsável técnico por este atendimento.
                            </p>
                            
                            {protocoloData && (
                                <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800 max-w-xs mx-auto mb-6">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Número do Protocolo</p>
                                    <p className="font-mono text-2xl font-bold text-primary">{protocoloData}</p>
                                </div>
                            )}
                            
                            <button
                                onClick={handleClose}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                Fechar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 mb-6 flex gap-3 text-blue-900 dark:text-blue-300">
                                <span className="material-symbols-outlined text-xl shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">info</span>
                                <div className="text-xs leading-relaxed">
                                    Ao confirmar, você abrirá um chamado de suporte técnico no IXC Soft. O solicitante registrado será o seu usuário logado (<strong>{user?.funcionario?.funcionario || user?.nome || 'Usuário'}</strong>).
                                </div>
                            </div>
        
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Descreva detalhadamente a situação:
                                    </label>
                                    <textarea
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        placeholder="Ex: Não consigo acessar a impressora do setor administrativo após a reinicialização do sistema..."
                                        className="w-full h-36 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none dark:text-white leading-relaxed"
                                        required
                                    />
                                </div>

                                {feedback && (
                                    <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
                                        feedback.type === 'success' 
                                            ? 'bg-green-50/80 text-green-800 border border-green-100 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300' 
                                            : 'bg-red-50/80 text-red-800 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300'
                                    }`}>
                                        <span className="material-symbols-outlined text-lg shrink-0">
                                            {feedback.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        <span className="font-medium">{feedback.text}</span>
                                    </div>
                                )}

                                <div className="flex gap-3.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-800 dark:hover:text-white transition-all outline-none"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !mensagem.trim()}
                                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-base">send</span>
                                                Abrir Chamado
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
    );
}
