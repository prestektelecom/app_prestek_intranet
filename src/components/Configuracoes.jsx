import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import LottieAvatar from './common/LottieAvatar';

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

const PREDEFINED_AVATARS = [
    avatar1, avatar2, avatar3, avatar4, avatar5, avatar6,
    avatar7, avatar8, avatar9, avatar10
];

export default function Configuracoes({ user }) {
    const fileInputRef = useRef(null);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [showAvatarGrid, setShowAvatarGrid] = useState(false);

    // Dados da tabela funcionarios (vem embutido no login)
    const func = user?.funcionario ?? {};

    // Fallbacks para exibição de texto
    const safeName = func.funcionario || user?.nome || 'Usuário';
    const nameParts = safeName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    const safeRole = func.id_funcao || 'Colaborador';
    const safeEmail = func.email || user?.email || '';
    const safePhone = func.fone_celular || func.fone || '';
    const safeBirthDate = func.data_nascimento || '';
    const safeAdmission = func.data_admissao || 'N/D';
    const safeRamal = func.ramal || '';
    const safeId = func.id ?? user?.id ?? '0000';
    const isActive = func.ativo === 'S';

    // Estado para os formulários e UI
    const [formData, setFormData] = useState({});
    const [perfilBanco, setPerfilBanco] = useState(null); // Dados do banco (usuarios_perfil)
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Listas do IXC
    const [departamentosList, setDepartamentosList] = useState([]);
    const [cargosList, setCargosList] = useState([]);
    const [deptosEmpresaList, setDeptosEmpresaList] = useState([]);
    const [filiaisList, setFiliaisList] = useState([]);
    const [funcoesList, setFuncoesList] = useState([]);

    // Carrega perfil do banco (usuarios_perfil) e preferências (usuarios_preferencias)
    useEffect(() => {
        if (!safeId || safeId === '0000') {
            setIsLoading(false);
            return;
        }
        const carregarConfiguracoes = async () => {
            try {
                // Tenta carregar do localStorage primeiro p/ interface rápida
                const saved = localStorage.getItem(`stitch_profile_${safeId}`);
                if (saved) setFormData(JSON.parse(saved));

                // Carrega em paralelo: perfil do banco + preferências do usuário
                const [resPerfil, resPref] = await Promise.all([
                    fetch(`http://localhost:3001/api/usuario/perfil/${safeId}`).catch(() => null),
                    fetch(`http://localhost:3001/api/configuracoes/${safeId}`).catch(() => null)
                ]);

                let dadosPerfil = null;
                let dadosPrefs = {};

                // Lê perfil sincronizado com dados da API IXC
                if (resPerfil?.ok) {
                    const dataPerfil = await resPerfil.json();
                    if (dataPerfil.sucesso && dataPerfil.perfil) {
                        dadosPerfil = dataPerfil.perfil;
                        setPerfilBanco(dadosPerfil);
                    }
                }

                // Lê preferências salvas pelo usuário
                if (resPref?.ok) {
                    const dataPref = await resPref.json();
                    if (dataPref.sucesso && dataPref.preferencias) {
                        dadosPrefs = dataPref.preferencias;
                    }
                }

                // Monta formData completo:
                // 1º - semeia com dados do perfil IXC (banco)
                // 2º - preferências do usuário sobrescrevem (têm prioridade)
                const p = dadosPerfil || {};
                const nomeParts = (p.usuario_nome || safeName).split(' ');
                // Preferências do usuário sobrescrevem os dados-base do perfil

                // Puxamos fone_celular tanto de p.fone_celular (banco local) quanto direto do IXC (func.fone_celular)
                // dando preferência para o banco e caindo pro IXC se não existir.
                const telefoneFinal = p.fone_celular || func.fone_celular || p.fone || func.fone || safePhone;

                // Campos editáveis pelo usuário (NÃO inclui id_departamento, filial_id — são readonly do IXC)
                const baseFormData = {
                    nome: nomeParts[0] || firstName,
                    sobrenome: nomeParts.slice(1).join(' ') || lastName,
                    email: p.usuario_email || p.funcionario_email || safeEmail,
                    telefone_celular: telefoneFinal,
                    data_nascimento: p.data_nascimento || safeBirthDate || '',
                    ramal: p.ramal || safeRamal || '',
                };

                // Preferências do usuário sobrescrevem os dados-base do perfil
                setFormData({ ...baseFormData, ...dadosPrefs });

            } catch (err) {
                console.error("Erro ao carregar dados do banco:", err);
            } finally {
                setIsLoading(false);
            }
        };
        carregarConfiguracoes();
    }, [safeId]);

    // Busca listas de departamentos, cargos, filiais e funções do IXC
    useEffect(() => {
        const fetchListas = async () => {
            try {
                const [resDept, resCargo, resFilial, resFuncao, resDeptEmp] = await Promise.all([
                    fetch('http://localhost:3001/api/departamentos').catch(() => null),
                    fetch('http://localhost:3001/api/cargos').catch(() => null),
                    fetch('http://localhost:3001/api/filiais').catch(() => null),
                    fetch('http://localhost:3001/api/funcoes').catch(() => null),
                    fetch('http://localhost:3001/api/departamentos-empresa').catch(() => null)
                ]);
                if (resDept?.ok) {
                    const data = await resDept.json();
                    if (data.sucesso) setDepartamentosList(data.departamentos || []);
                }
                if (resCargo?.ok) {
                    const data = await resCargo.json();
                    if (data.sucesso) setCargosList(data.cargos || []);
                }
                if (resFilial?.ok) {
                    const data = await resFilial.json();
                    if (data.sucesso) setFiliaisList(data.filiais);
                }
                if (resFuncao?.ok) {
                    const data = await resFuncao.json();
                    if (data.sucesso) setFuncoesList(data.funcoes);
                }
                if (resDeptEmp?.ok) {
                    const data = await resDeptEmp.json();
                    if (data.sucesso) setDeptosEmpresaList(data.departamentos || []);
                }
            } catch (err) {
                console.error("Erro ao buscar listas do IXC", err);
            }
        };
        fetchListas();
    }, []);

    // Sanitiza avatar: descarta paths inválidos (formato antigo /src/image/)
    // que só existiam em dist/assets/ e não funcionam no ambiente de desenvolvimento
    const sanitizarAvatar = (url) => {
        if (!url) return null;
        if (typeof url === 'string' && url.startsWith('/src/image/')) return null;
        return url;
    };

    // AvatarUrl usa o formData (do banco) ou o default do usuário
    // Padronização: Usuário deseja que o avatar inicial seja o da garota-3d (avatar2)
    const [avatarUrl, setAvatarUrl] = useState(
        sanitizarAvatar(formData.avatarUrl) || sanitizarAvatar(user?.funcionario?.foto_perfil) || avatar2
    );

    useEffect(() => {
        const rawAvatar = formData.avatarUrl || user?.funcionario?.foto_perfil;
        const currentAvatar = sanitizarAvatar(rawAvatar) || avatar2;

        // Se o valor salvo estiver no formato inválido, limpa do localStorage
        if (rawAvatar && !sanitizarAvatar(rawAvatar)) {
            const saved = localStorage.getItem(`stitch_profile_${safeId}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    delete parsed.avatarUrl;
                    localStorage.setItem(`stitch_profile_${safeId}`, JSON.stringify(parsed));
                } catch (e) { /* ignora erros de parse */ }
            }
        }

        setAvatarUrl(currentAvatar);
    }, [formData.avatarUrl, user?.funcionario?.foto_perfil, safeId]);

    // Fechar menus ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.avatar-container')) {
                setShowAvatarMenu(false);
                setShowAvatarGrid(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Upload de imagem: converte para base64 para persistir no banco.
     * blob: URLs são temporárias e expiram ao recarregar a página.
     */
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Valida tamanho máximo: 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert('Imagem muito grande. Use uma imagem de até 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result; // 'data:image/png;base64,...'
            setAvatarUrl(base64);
            setShowAvatarMenu(false);
            setFormData(prev => ({ ...prev, avatarUrl: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleChangeAvatar = (url) => {
        setAvatarUrl(url);
        setShowAvatarMenu(false);
        setShowAvatarGrid(false);
        setFormData(prev => ({ ...prev, avatarUrl: url }));
    }

    // Ação do Botão Salvar — persiste campos editáveis na tela
    // Campos readonly do IXC (id_departamento, filial_id) NÃO são salvos nas preferências
    const CAMPOS_READONLY = ['id_departamento', 'filial_id'];
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Filtra campos readonly antes de salvar nas preferências
            const dadosParaSalvar = Object.entries(formData)
                .filter(([chave]) => !CAMPOS_READONLY.includes(chave));
            const promessas = dadosParaSalvar.map(([chave, valor]) =>
                fetch(`http://localhost:3001/api/configuracoes/${safeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: safeEmail, chave, valor: valor ?? '' })
                })
            );
            await Promise.all(promessas);

            // Sincroniza dados críticos (como celular, nome, ramal) com a API IXC
            await fetch(`http://localhost:3001/api/funcionario/${safeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Backup offline no localStorage para carregamento rápido
            localStorage.setItem(`stitch_profile_${safeId}`, JSON.stringify(formData));

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Erro ao salvar no PostgreSQL:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Dados mesclados para Inputs visíveis:
    // Hierarquia: formData (edições do usuário) > perfilBanco (dados IXC salvos) > dados do login (memória)
    const pb = perfilBanco || {}; // Atalho para dados do banco
    const displayNome = formData.nome !== undefined ? formData.nome : (pb.usuario_nome?.split(' ')[0] || firstName);
    const displaySobrenome = formData.sobrenome !== undefined ? formData.sobrenome : (pb.usuario_nome?.split(' ').slice(1).join(' ') || lastName);
    const displayEmail = formData.email !== undefined ? formData.email : (pb.usuario_email || pb.funcionario_email || safeEmail);
    const displayPhone = formData.telefone_celular !== undefined ? formData.telefone_celular : (pb.fone_celular || pb.fone || safePhone);
    const displayBirthDate = formData.data_nascimento !== undefined ? formData.data_nascimento : (pb.data_nascimento || safeBirthDate);
    const displayRamal = formData.ramal !== undefined ? formData.ramal : (pb.ramal || safeRamal);
    // Dados readonly do IXC — NÃO vêm do formData (preferências podem ter valores antigos/errados)
    const displayDepto = pb.id_departamento || func.id_departamento || '';
    const displayFilial = pb.filial_id || func.filial_id || '';

    // Mapeamento visual: ID -> Nome
    // Setor (id_departamento) busca na API departamento (organizacional), empresa_setor (cargosList) e su_ticket_setor
    const deptoName = deptosEmpresaList.find(d => String(d.id).trim() === String(displayDepto).trim())?.departamento
        || departamentosList.find(d => String(d.id).trim() === String(displayDepto).trim())?.setor
        || cargosList.find(c => String(c.id).trim() === String(displayDepto).trim())?.setor
        || displayDepto || 'N/D';
    const filialName = filiaisList.find(f => String(f.id).trim() === String(displayFilial).trim())?.fantasia
        || filiaisList.find(f => String(f.id).trim() === String(displayFilial).trim())?.razao
        || (displayFilial ? `Filial ${displayFilial}` : 'Sede Principal');

    // Cargo (id_funcao) — no layout novo será usado o nome do Setor (deptoName) abaixo do nome do usuário
    const cargoName = deptoName !== 'N/D' ? deptoName : safeRole;

    // Gerenciador genérico de campos de texto/selects
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center overflow-y-auto no-scrollbar">
            <div className="max-w-[1024px] w-full flex flex-col mt-4">
                <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 px-4 mb-6">
                    <a className="text-[#a17745] dark:text-orange-300 hover:text-primary text-sm font-medium leading-normal transition-colors" href="#">Início</a>
                    <span className="text-[#a17745] dark:text-orange-300 text-sm font-medium leading-normal">/</span>
                    <span className="text-[#1d150c] dark:text-white text-sm font-medium leading-normal">Configurações de Perfil</span>
                </nav>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Perfil do Usuário e Configurações</h1>
                        <p className="text-[#a17745] dark:text-orange-300 text-base font-normal">Gerencie suas informações pessoais, preferências de segurança e configurações de conta.</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full sm:w-auto px-8 py-3 rounded-lg text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-primary/70 cursor-not-allowed' : saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-[#e67e00]'}`}>
                            {isSaving ? (
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            ) : saveSuccess ? (
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">save</span>
                            )}
                            {isSaving ? 'Salvando...' : saveSuccess ? 'Atualizado!' : 'Salvar Alterações'}
                        </button>
                    </div>

                    {/* Toast flutuante de confirmação */}
                    {saveSuccess && (
                        <div className="fixed bottom-8 left-1/2 z-50" style={{ transform: 'translateX(-50%)', animation: 'toastSlideUp 0.4s ease-out' }}>
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border border-green-200 dark:border-green-800 bg-white dark:bg-[#1a130b]"
                                style={{ boxShadow: '0 8px 32px rgba(34,197,94,0.2)' }}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[24px]">check_circle</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#1d150c] dark:text-white">Perfil atualizado</span>
                                    <span className="text-xs text-[#a17745] dark:text-orange-300">Suas configurações foram sincronizadas com sucesso.</span>
                                </div>
                            </div>
                            <style>{`
                                @keyframes toastSlideUp {
                                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 bg-white dark:bg-[#1a130b] rounded-xl p-6 shadow-sm border border-[#eaddcd] dark:border-gray-800 flex flex-col items-center gap-6">
                            <div className="relative group avatar-container flex flex-col items-center">
                                <LottieAvatar 
                                    src={avatarUrl}
                                    className="aspect-square rounded-full w-32 h-32 border-2 border-transparent group-hover:border-primary shrink-0 transition-all bg-gradient-to-br from-primary/20 to-orange-100"
                                />
                                <button
                                    onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                                    className="absolute bottom-0 right-0 bg-primary hover:bg-[#e67e00] text-white p-2 text-sm rounded-full shadow-lg transition-transform transform hover:scale-105"
                                    title="Alterar Foto">
                                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                </button>

                                {/* Input Hidden de Arquivo */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                />

                                {/* Menu de Opções de Avatar */}
                                {showAvatarMenu && (
                                    <div className="absolute top-[140px] z-20 w-48 bg-white dark:bg-[#1a130b] rounded-lg shadow-xl border border-[#eaddcd] dark:border-gray-800 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => { fileInputRef.current?.click(); setShowAvatarGrid(false); }}
                                            className="px-4 py-2 text-sm text-left text-[#1d150c] dark:text-white hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">upload</span> Fazer Upload
                                        </button>
                                        <button
                                            onClick={() => { setShowAvatarGrid(!showAvatarGrid); }}
                                            className="px-4 py-2 text-sm text-left text-[#1d150c] dark:text-white hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] transition-colors flex items-center gap-2 border-b border-[#eaddcd] dark:border-gray-800">
                                            <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span> Escolher Avatar
                                        </button>
                                        {avatarUrl && (
                                            <button
                                                onClick={() => {
                                                    setAvatarUrl(null);
                                                    setShowAvatarMenu(false);
                                                    setShowAvatarGrid(false);
                                                    // Limpa avatar do formData para ser salvo como removido
                                                    setFormData(prev => ({ ...prev, avatarUrl: '' }));
                                                }}
                                                className="px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">delete</span> Remover Foto
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Grid de Seleção de Avatares */}
                                {showAvatarGrid && (
                                    <div className="absolute top-[230px] z-30 w-64 bg-white dark:bg-[#1a130b] rounded-lg shadow-xl border border-[#eaddcd] dark:border-gray-800 p-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300 mb-3 text-center">Avatares Padrão</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {PREDEFINED_AVATARS.map((url, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleChangeAvatar(url)}
                                                    className="aspect-square rounded-lg border border-[#eaddcd] dark:border-gray-800 hover:border-primary dark:hover:border-primary focus:ring-2 ring-primary/30 transition-all bg-[#fcfaf8] dark:bg-[#2c2217] overflow-hidden">
                                                    <LottieAvatar src={url} className="w-full h-full" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-center w-full">
                                <h2 className="text-[#1d150c] dark:text-white text-xl font-bold mb-1">{safeName}</h2>
                                <p className="text-primary font-medium text-sm mb-4">{cargoName}</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {isActive ? 'Colaborador Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="w-full border-t border-[#eaddcd] dark:border-gray-800 pt-4 mt-2">
                                <div className="flex items-center gap-3 mb-3 text-sm text-[#a17745] dark:text-orange-300">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>ID: <span className="text-[#1d150c] dark:text-white font-medium">EMP-{safeId}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#a17745] dark:text-orange-300">
                                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                    <span>Admitido em: <span className="text-[#1d150c] dark:text-white font-medium">
                                        {safeAdmission !== 'N/D'
                                            ? new Date(safeAdmission.includes('T') ? safeAdmission : safeAdmission + 'T00:00:00')
                                                .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                                            : 'N/D'}
                                    </span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Informações Pessoais</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">NOME</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow"
                                        name="nome" type="text" value={displayNome} onChange={handleInputChange} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">SOBRENOME</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow"
                                        name="sobrenome" type="text" value={displaySobrenome} onChange={handleInputChange} />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">ENDEREÇO DE E-MAIL</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a17745] dark:text-orange-300 text-[20px]">mail</span>
                                        <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary pl-10 pr-4 py-2.5 transition-shadow"
                                            name="email" type="email" value={displayEmail} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">NÚMERO DE TELEFONE</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow"
                                        name="telefone_celular" type="tel" value={displayPhone} onChange={handleInputChange} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">DATA DE NASCIMENTO</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow"
                                        name="data_nascimento" type="date" value={displayBirthDate} onChange={handleInputChange} />
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">work</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Setor e Função</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">SETOR</label>
                                    <div className="relative">
                                        <input className="form-input w-full rounded-lg border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed px-4 py-2.5"
                                            readOnly name="id_departamento" type="text"
                                            value={deptoName} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">LOCALIZAÇÃO DO ESCRITÓRIO</label>
                                    <input className="form-input w-full rounded-lg border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed px-4 py-2.5"
                                        readOnly name="filial_id" type="text" value={filialName} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">TELEFONE IP</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow"
                                        name="ramal" type="text" value={displayRamal} onChange={handleInputChange} />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">tune</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Preferências</h3>
                            </div>
                            <div className="space-y-6">
                                <ThemeSwitcher />
                                <div className="border-t border-[#eaddcd] dark:border-gray-800 pt-6">
                                    <h4 className="text-sm font-bold text-[#1d150c] dark:text-white mb-4">Notificações por E-mail</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Comunicados do Departamento</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Manutenção do Sistema</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Atualizações do Diretório</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    )
}
