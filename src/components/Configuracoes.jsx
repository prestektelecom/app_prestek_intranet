import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { AVATAR_PNGS, resolveAvatarUrl } from '../utils/avatarPngs';
import { useBentoTheme } from '../hooks/useBentoTheme';

const PREDEFINED_PNG_AVATARS = AVATAR_PNGS;

// Preferências booleanas voltam do banco como texto ('true'/'false') — normaliza para boolean real
const toBoolPref = (valor, fallback) => {
    if (valor === undefined || valor === null || valor === '') return fallback;
    if (typeof valor === 'boolean') return valor;
    return valor === 'true';
};

export default function Configuracoes({ user, setCurrentView }) {
    const C = useBentoTheme();
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
    const safeId = func.id ?? user?.id ?? null;
    const isActive = func.ativo === 'S';

    // Estado para os formulários e UI
    const [formData, setFormData] = useState({});
    const [perfilBanco, setPerfilBanco] = useState(null); // Dados do banco (usuarios_perfil)
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(false);

    // Listas do IXC
    const [departamentosList, setDepartamentosList] = useState([]);
    const [cargosList, setCargosList] = useState([]);
    const [deptosEmpresaList, setDeptosEmpresaList] = useState([]);
    const [filiaisList, setFiliaisList] = useState([]);
    const [funcoesList, setFuncoesList] = useState([]);

    // Carrega perfil do banco (usuarios_perfil) e preferências (usuarios_preferencias)
    useEffect(() => {
        if (!safeId) {
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
                    fetch(`/api/usuario/perfil/${safeId}`).catch(() => null),
                    fetch(`/api/configuracoes/${safeId}`).catch(() => null)
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
                const formDataFinal = { ...baseFormData, ...dadosPrefs };
                // Toggles de notificação: normaliza texto do banco ('true'/'false') para boolean,
                // com fallback para os defaults exibidos hoje quando o usuário nunca salvou a preferência
                formDataFinal.notif_comunicados_departamento = toBoolPref(formDataFinal.notif_comunicados_departamento, true);
                formDataFinal.notif_manutencao_sistema = toBoolPref(formDataFinal.notif_manutencao_sistema, true);
                setFormData(formDataFinal);

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
                    fetch('/api/departamentos').catch(() => null),
                    fetch('/api/cargos').catch(() => null),
                    fetch('/api/filiais').catch(() => null),
                    fetch('/api/funcoes').catch(() => null),
                    fetch('/api/departamentos-empresa').catch(() => null)
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

    const sanitizarAvatar = resolveAvatarUrl;

    const [avatarUrl, setAvatarUrl] = useState(
        sanitizarAvatar(formData.avatarUrl) || sanitizarAvatar(user?.funcionario?.foto_perfil) || null
    );

    // Quando os dados do banco carregam (formData populado pelo useEffect de carregarConfiguracoes),
    // sincroniza o avatarUrl exibido — mas só se o usuário não tiver selecionado nada ainda
    useEffect(() => {
        if (formData.avatarUrl) {
            setAvatarUrl(sanitizarAvatar(formData.avatarUrl));
        }
    }, [formData.avatarUrl]);

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
        setSaveError(false);
        try {
            const pngIdx = PREDEFINED_PNG_AVATARS.indexOf(avatarUrl);
            const avatarCompacto = pngIdx >= 0
                ? `__png_idx:${pngIdx}`
                : (typeof avatarUrl === 'string' ? avatarUrl : null);

            // Monta dados a salvar: campos do formData (sem readonly) + avatarUrl sempre presente
            const baseData = Object.fromEntries(
                Object.entries(formData).filter(([chave]) => !CAMPOS_READONLY.includes(chave))
            );
            const dadosFinais = { ...baseData, avatarUrl: avatarCompacto ?? '' };

            const promessas = Object.entries(dadosFinais).map(([chave, valor]) =>
                fetch(`/api/configuracoes/${safeId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: safeEmail, chave, valor: valor ?? '' })
                })
            );
            const respostasPrefs = await Promise.all(promessas);
            if (respostasPrefs.some(res => !res.ok)) {
                throw new Error('Falha ao salvar preferências');
            }

            // Sincroniza dados críticos (como celular, nome, ramal) com a API IXC
            // avatarUrl é excluído pois pode ser um objeto Lottie gigante
            const { avatarUrl: _av, ...formDataSemAvatar } = formData;
            const respFuncionario = await fetch(`/api/funcionario/${safeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataSemAvatar)
            });
            if (!respFuncionario.ok) {
                throw new Error('Falha ao sincronizar dados do funcionário');
            }

            // Salva no localStorage com mesmo formato compacto
            if (safeId) {
                localStorage.setItem(`stitch_profile_${safeId}`, JSON.stringify(dadosFinais));
            }
            setFormData(prev => ({ ...prev, avatarUrl }));

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Erro ao salvar no PostgreSQL:", err);
            setSaveError(true);
            setTimeout(() => setSaveError(false), 4000);
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

    // ── Paleta Bento Blue ──────────────────────────────────────────────
    const tone = (hex, a) => { const h = hex.replace('#', ''); const x = h.length === 3 ? h.replace(/./g, c => c + c) : h; return `rgba(${parseInt(x.slice(0,2),16)},${parseInt(x.slice(2,4),16)},${parseInt(x.slice(4,6),16)},${a})`; };

    // ── Estilos reutilizáveis ────────────────────────────────────────
    const sCard = { background: C.surface, borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}`, overflow: 'hidden' };
    const sSection = { padding: '28px 32px' };
    const sSectionHead = { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 20, borderBottom: `1px solid ${C.lineSoft}` };
    const sIconBox = (color, bg) => ({ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color });
    const sLabel = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, fontFamily: '"JetBrains Mono", monospace', display: 'block', marginBottom: 6 };
    const sInput = { width: '100%', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.surfaceSoft, color: C.ink, fontSize: 14, padding: '9px 14px', outline: 'none', transition: 'border-color .18s, box-shadow .18s', fontFamily: 'inherit' };
    const sInputRO = { ...sInput, background: C.lineSoft, color: C.muted, cursor: 'not-allowed', border: `1.5px solid ${C.lineSoft}` };
    const sH3 = { fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 };

    // Skeleton de campo — mesmas dimensões de sInput, para não causar layout shift ao carregar
    const FieldSkeleton = ({ span }) => (
        <div className={`col-span-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
            <div style={{ width: 90, height: 10, borderRadius: 4, background: C.lineSoft, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 38, borderRadius: 10, background: C.lineSoft, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
    );

    return (
        <main style={{ flex: 1, width: '100%', background: C.bg, overflowY: 'auto', padding: '0 0 48px' }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div style={{
                background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 55%, ${C.accent} 100%)`,
                padding: '40px 40px 80px', position: 'relative', overflow: 'hidden',
                boxShadow: `0 8px 32px ${tone(C.accentDeep, 0.3)}`,
            }}>
                <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width="100%" height="100%">
                    <defs><pattern id="cfg-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#cfg-grid)" />
                </svg>
                <div style={{ position: 'relative', maxWidth: 1024, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>manage_accounts</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11.5, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>Minha Conta</span>
                        </div>
                        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Perfil &amp; Configurações</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '6px 0 0', fontWeight: 400 }}>Gerencie suas informações pessoais, preferências e configurações de conta.</p>
                    </div>
                    {/* Botão Salvar no hero */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '11px 26px', borderRadius: 12, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                            background: saveSuccess ? C.success : 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                            color: 'white', fontWeight: 700, fontSize: 14,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'all .18s',
                            opacity: isSaving ? 0.7 : 1,
                        }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, ...(isSaving ? { animation: 'spin 1s linear infinite' } : {}) }}>
                            {isSaving ? 'progress_activity' : saveSuccess ? 'check_circle' : 'save'}
                        </span>
                        {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* ── Conteúdo principal ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 px-4 md:px-6" style={{ maxWidth: 1024, margin: '-48px auto 0', gap: 24, position: 'relative' }}>

                {/* ── Card lateral — Perfil ──────────────────────────────── */}
                <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Avatar card */}
                    <div style={{ ...sCard, position: 'sticky', top: 88 }}>
                        {/* Stripe accent */}
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.accent}, ${tone(C.accent, 0.3)})` }} />
                        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            {/* Avatar */}
                            <div className="avatar-container" style={{ position: 'relative' }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar"
                                        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.accentSoft}`, display: 'block' }} />
                                ) : (
                                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 44, color: C.accent }}>person</span>
                                    </div>
                                )}
                                <button onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                                    style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: C.accent, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 2px 8px ${tone(C.accentDeep, 0.3)}` }}
                                    title="Alterar Foto" aria-label="Alterar foto de perfil">
                                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'white' }}>photo_camera</span>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />

                                {/* Menu Avatar */}
                                {showAvatarMenu && (
                                    <div style={{ position: 'absolute', top: 108, left: '50%', transform: 'translateX(-50%)', zIndex: 20, minWidth: 180, background: C.surface, borderRadius: 12, border: `1px solid ${C.line}`, boxShadow: `0 8px 24px ${tone(C.accentDeep, 0.12)}`, overflow: 'hidden' }}>
                                        {[
                                            { icon: 'upload', label: 'Fazer Upload', action: () => { fileInputRef.current?.click(); setShowAvatarGrid(false); } },
                                            { icon: 'sentiment_satisfied', label: 'Escolher Avatar', action: () => setShowAvatarGrid(v => !v) },
                                        ].map(({ icon, label, action }) => (
                                            <button key={label} onClick={action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: C.ink, fontSize: 13, textAlign: 'left', borderBottom: `1px solid ${C.lineSoft}` }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.muted }}>{icon}</span>{label}
                                            </button>
                                        ))}
                                        {avatarUrl && (
                                            <button onClick={() => { setAvatarUrl(null); setShowAvatarMenu(false); setShowAvatarGrid(false); setFormData(prev => ({ ...prev, avatarUrl: '' })); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 13, textAlign: 'left' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>Remover Foto
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* Grid Avatares */}
                                {showAvatarGrid && (
                                    <div style={{ position: 'absolute', top: 224, left: '50%', transform: 'translateX(-50%)', zIndex: 30, width: 288, background: C.surface, borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: `0 12px 32px ${tone(C.accentDeep, 0.14)}`, padding: 12, maxHeight: 380, overflowY: 'auto' }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, textAlign: 'center', marginBottom: 10, fontFamily: '"JetBrains Mono", monospace' }}>Avatares 3D</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                            {PREDEFINED_PNG_AVATARS.map((url, idx) => (
                                                <button key={idx} onClick={() => handleChangeAvatar(url)}
                                                    style={{ aspectRatio: '1', borderRadius: 8, border: `1.5px solid ${C.line}`, overflow: 'hidden', cursor: 'pointer', padding: 0, background: C.surfaceSoft, transition: 'border-color .15s' }}>
                                                    <img src={url} alt={`Avatar ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nome e cargo */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{safeName}</div>
                                <div style={{ fontSize: 12.5, color: C.accent, fontWeight: 600, marginTop: 3 }}>{cargoName}</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, padding: '3px 10px', borderRadius: 999, background: isActive ? C.successSoft : C.dangerSoft, color: isActive ? C.success : C.danger, fontSize: 11, fontWeight: 700 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{isActive ? 'check_circle' : 'cancel'}</span>
                                    {isActive ? 'Colaborador Ativo' : 'Inativo'}
                                </div>
                            </div>

                            {/* Dados fixos */}
                            <div style={{ width: '100%', borderTop: `1px solid ${C.lineSoft}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { icon: 'badge', label: `ID: EMP-${safeId}` },
                                    { icon: 'calendar_month', label: `Admissão: ${safeAdmission !== 'N/D' ? new Date(safeAdmission.includes('T') ? safeAdmission : safeAdmission + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'N/D'}` },
                                ].map(({ icon, label }) => (
                                    <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: C.accent }}>{icon}</span>
                                        <span style={{ fontSize: 12.5, color: C.ink2 }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Formulários lado direito ───────────────────────────── */}
                <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Informações Pessoais */}
                    <div style={sCard}>
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.accent}, ${tone(C.accent, 0.3)})` }} />
                        <div style={sSection}>
                            <div style={sSectionHead}>
                                <div style={sIconBox(C.accent, C.accentSoft)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span></div>
                                <h3 style={sH3}>Informações Pessoais</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18 }}>
                                {isLoading ? (
                                    [1, 1, 2, 1, 1].map((span, i) => <FieldSkeleton key={i} span={span} />)
                                ) : [
                                    { label: 'NOME', name: 'nome', value: displayNome, type: 'text', span: 1 },
                                    { label: 'SOBRENOME', name: 'sobrenome', value: displaySobrenome, type: 'text', span: 1 },
                                    { label: 'ENDEREÇO DE E-MAIL', name: 'email', value: displayEmail, type: 'email', span: 2 },
                                    { label: 'NÚMERO DE TELEFONE', name: 'telefone_celular', value: displayPhone, type: 'tel', span: 1 },
                                    { label: 'DATA DE NASCIMENTO', name: 'data_nascimento', value: displayBirthDate, type: 'date', span: 1 },
                                ].map(({ label, name, value, type, span }) => (
                                    <div key={name} className={`col-span-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
                                        <label htmlFor={name} style={sLabel}>{label}</label>
                                        <input id={name} name={name} type={type} value={value} onChange={handleInputChange}
                                            style={sInput}
                                            onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${tone(C.accent, 0.15)}`; }}
                                            onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Setor e Função */}
                    <div style={sCard}>
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.cyan}, ${tone(C.cyan, 0.3)})` }} />
                        <div style={sSection}>
                            <div style={sSectionHead}>
                                <div style={sIconBox(C.cyan, tone(C.cyan, 0.15))}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>work</span></div>
                                <h3 style={sH3}>Setor e Função</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18 }}>
                                {isLoading ? (
                                    [1, 1, 1].map((span, i) => <FieldSkeleton key={i} span={span} />)
                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="setor" style={sLabel}>SETOR</label>
                                            <input id="setor" readOnly value={deptoName} style={sInputRO} />
                                        </div>
                                        <div>
                                            <label htmlFor="localizacao" style={sLabel}>LOCALIZAÇÃO DO ESCRITÓRIO</label>
                                            <input id="localizacao" readOnly value={filialName} style={sInputRO} />
                                        </div>
                                        <div>
                                            <label htmlFor="ramal" style={sLabel}>TELEFONE IP / RAMAL</label>
                                            <input id="ramal" name="ramal" type="text" value={displayRamal} onChange={handleInputChange} style={sInput}
                                                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${tone(C.accent, 0.15)}`; }}
                                                onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preferências */}
                    <div style={sCard}>
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.success}, ${tone(C.success, 0.3)})` }} />
                        <div style={sSection}>
                            <div style={sSectionHead}>
                                <div style={sIconBox(C.success, C.successSoft)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span></div>
                                <h3 style={sH3}>Preferências</h3>
                            </div>
                            <ThemeSwitcher />
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.lineSoft}` }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Notificações por E-mail</p>
                                {isLoading ? (
                                    [1, 2].map(i => (
                                        <div key={i} style={{ height: 20, borderRadius: 999, background: C.lineSoft, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    ))
                                ) : [
                                    { label: 'Comunicados do Departamento', name: 'notif_comunicados_departamento' },
                                    { label: 'Manutenção do Sistema', name: 'notif_manutencao_sistema' },
                                ].map(({ label, name }) => {
                                    const checked = !!formData[name];
                                    return (
                                        <label key={name} htmlFor={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, cursor: 'pointer' }}>
                                            <span style={{ fontSize: 13.5, color: C.ink2 }}>{label}</span>
                                            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                                <input id={name} name={name} type="checkbox" checked={checked}
                                                    onChange={e => setFormData(prev => ({ ...prev, [name]: e.target.checked }))}
                                                    className="sr-only peer" />
                                                <span style={{ width: 36, height: 20, borderRadius: 999, background: checked ? C.accent : C.line, position: 'relative', transition: 'background .2s', display: 'inline-block' }}
                                                    className="after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] peer-checked:after:translate-x-4 after:transition-all after:shadow-sm" />
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast de sucesso */}
            {saveSuccess && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 99, animation: 'toastUp .35s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderRadius: 14, background: C.surface, border: `1px solid ${C.successSoft}`, boxShadow: `0 8px 32px ${tone(C.success, 0.2)}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.successSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: C.success }}>check_circle</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>Perfil atualizado</div>
                            <div style={{ fontSize: 12, color: C.muted }}>Configurações sincronizadas com sucesso.</div>
                        </div>
                    </div>
                    <style>{`@keyframes toastUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
                </div>
            )}

            {/* Toast de erro */}
            {saveError && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 99, animation: 'toastUp .35s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderRadius: 14, background: C.surface, border: `1px solid ${C.dangerSoft}`, boxShadow: `0 8px 32px ${tone(C.danger, 0.2)}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: C.danger }}>error</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>Não foi possível salvar</div>
                            <div style={{ fontSize: 12, color: C.muted }}>Verifique sua conexão e tente novamente.</div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
