import fs from 'fs';

const filePath = '../src/components/ServicesDirectory.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ADICIONAR ESTADOS NO TOPO DO COMPONENTE
const stateInsert = `    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', type: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });`;

if (!content.includes('const [deleteModal')) {
    content = content.replace(/const isAdmin = user\?\.is_admin;/, `const isAdmin = user?.is_admin;\n${stateInsert}`);
}

// 2. ADICIONAR FUNÇÃO DE EXIBIR TOAST
const toastHelper = `
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };
`;

if (!content.includes('const showToast =')) {
    content = content.replace(/const fetchPacotesStreaming = async \(\) => \{/, `${toastHelper}\n    const fetchPacotesStreaming = async () => {`);
}

// 3. REESCREVER OS HANDLERS DE DELETE PARA USAR O MODAL
const newTechDelete = `    const handleDeleteTechClick = (id) => {
        const item = techServices.find(s => s.id === id);
        setDeleteModal({ isOpen: true, id, title: item?.service || 'este serviço', type: 'tech' });
    };`;

const newStreamingDelete = `    const handleDeleteStreamingClick = (id) => {
        const item = streamingServices.find(s => s.id === id);
        setDeleteModal({ isOpen: true, id, title: item?.service || 'este pacote', type: 'streaming' });
    };`;

content = content.replace(/const handleDeleteTechClick = async \(id\) => \{[\s\S]*?\};/, newTechDelete);
content = content.replace(/const handleDeleteStreamingClick = async \(id\) => \{[\s\S]*?\};/, newStreamingDelete);

// 4. ADICIONAR A FUNÇÃO DE EXECUÇÃO REAL DA EXCLUSÃO
const confirmDeleteFunc = `
    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        const url = type === 'tech' ? \`/api/servicos-tecnicos/\${id}\` : \`/api/pacotes-streaming/\${id}\`;
        
        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (response.ok) {
                if (type === 'tech') setTechServices(prev => prev.filter(s => s.id !== id));
                else setStreamingServices(prev => prev.filter(s => s.id !== id));
                showToast('Excluído com sucesso!', 'success');
            } else {
                const data = await response.json().catch(() => ({}));
                showToast(data.erro || 'Erro ao excluir', 'error');
            }
        } catch (error) {
            showToast('Erro de conexão', 'error');
        } finally {
            setDeleteModal({ isOpen: false, id: null, title: '', type: '' });
        }
    };
`;

if (!content.includes('const confirmDelete =')) {
    content = content.replace(/const handleSaveStreamingEdit = async \(\) => \{/, `${confirmDeleteFunc}\n    const handleSaveStreamingEdit = async () => {`);
}

// 5. INJETAR O JSX DO MODAL E DO TOAST NO FINAL DO RETURN
const modalJSX = `
            {/* Modal de Confirmação de Exclusão Premium */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}></div>
                    <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirmar Exclusão</h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Tem certeza que deseja excluir <span className="font-bold text-slate-700 dark:text-slate-200">"{deleteModal.title}"</span>? Esta ação não poderá ser desfeita.
                            </p>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all active:scale-95"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast de Sucesso/Erro Premium */}
            {toast.show && (
                <div className="fixed top-8 right-8 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={\`flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md border \${
                        toast.type === 'success' 
                        ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                        : 'bg-red-500/90 border-red-400 text-white'
                    }\`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="font-bold tracking-wide">{toast.message}</p>
                    </div>
                </div>
            )}
`;

content = content.replace(/<\/main>/, `${modalJSX}\n        </main>`);

fs.writeFileSync(filePath, content);
console.log('Premium Alerts Integrated.');
