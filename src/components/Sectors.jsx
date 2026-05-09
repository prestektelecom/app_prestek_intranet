import React, { useState, useEffect } from 'react';

// Mapa de descrições por nome exato do setor (uppercase)
const DESCRICAO_MAP = {
    'ANÁLISE ESPACIAL E PROJETOS DE REDE FTTH': 'Responsável pelo planejamento, mapeamento geoespacial e projetos de expansão da rede de fibra óptica FTTH.',
    'ATENDIMENTO': 'Primeiro ponto de contato com o cliente, prestando suporte, esclarecimentos e encaminhamentos para os setores responsáveis.',
    'AUDITORIA': 'Monitora e avalia processos internos garantindo conformidade com políticas e padrões de qualidade da empresa.',
    'AUDITORIA DE CONTRATOS': 'Analisa e verifica contratos firmados com clientes, assegurando conformidade legal e comercial.',
    'CANCELAMENTOS': 'Gerencia solicitações de cancelamento de serviços, trabalhando na retenção e fidelização dos clientes.',
    'COBRANÇA': 'Responsável pela gestão de inadimplência, negociação de débitos e regularização de contas de clientes.',
    'COBRANÇA EXTERNA': 'Atua na recuperação de créditos externos, realizando cobranças presenciais e negociações de campo.',
    'COMERCIAL': 'Responsável pela prospecção ativa, vendas de novos planos e expansão da base de clientes da empresa.',
    'COMERCIAL-PASSIVO': 'Atende demandas comerciais receptivas, convertendo contatos e interessados em novos assinantes.',
    'CORRECAO TECNICA': 'Realiza correções técnicas em instalações e equipamentos para restabelecer a qualidade do serviço.',
    'CORRECAO TECNICA INFRAESTRUTURA': 'Executa manutenção corretiva na infraestrutura de rede, solucionando falhas em cabos, postes e equipamentos.',
    'DEVOLIÇÃO DE EQUIPAMENTOS': 'Gerencia o processo de recolhimento, triagem e devolução de equipamentos locados pelos clientes.',
    'DIRETORIA': 'Responsável pela gestão estratégica, tomada de decisões e direcionamento geral da empresa.',
    'ESTOQUE': 'Controla o recebimento, armazenamento e distribuição de equipamentos e materiais utilizados nas operações.',
    'FEEDBACK': 'Coleta e analisa feedbacks de clientes para orientar melhorias nos serviços e na experiência do usuário.',
    'FINANCEIRO': 'Responsável pela gestão financeira, fluxo de caixa, contas a pagar e receber e relatórios contábeis.',
    'FROTA': 'Gerencia os veículos da empresa, incluindo manutenção, abastecimento e controle de deslocamentos.',
    'GERENCIA': 'Coordena equipes e processos operacionais, garantindo o cumprimento de metas e a eficiência dos setores.',
    'INFRAESTRUTURA': 'Mantém e expande a infraestrutura de rede, incluindo cabos, torres, roteadores e equipamentos de transmissão.',
    'INSTALAÇÃO': 'Realiza a instalação de serviços e equipamentos na casa dos clientes, garantindo a ativação correta do acesso.',
    'NOC': 'Centro de operações que monitora a rede em tempo real, identificando e resolvendo falhas de conectividade.',
    'PATRIMONIO': 'Controla e preserva os bens físicos da empresa, realizando inventários e gerenciando ativos patrimoniais.',
    'RECURSOS HUMANOS': 'Gerencia admissões, demissões, benefícios, treinamentos e o bem-estar dos colaboradores da empresa.',
    'RECURSOS HUMANOS (RH)': 'Gerencia admissões, demissões, benefícios, treinamentos e o bem-estar dos colaboradores da empresa.',
    'RELACIONAMENTO': 'Cultiva o relacionamento com clientes por meio de ações de pós-venda, satisfação e fidelização.',
    'SERVICO': 'Coordena a prestação de serviços técnicos e operacionais garantindo qualidade e cumprimento de prazos.',
    'SUPORTE': 'Presta assistência técnica remota a clientes, diagnosticando e resolvendo problemas de conexão e equipamentos.',
    'T.I': 'Gerencia os sistemas, redes internas, segurança da informação e infraestrutura tecnológica da empresa.',
};

function getDescricaoForSetor(nome) {
    const nomeUpper = (nome || '').trim().toUpperCase();
    if (DESCRICAO_MAP[nomeUpper]) return DESCRICAO_MAP[nomeUpper];
    // Fallback por palavra-chave
    const lower = nomeUpper.toLowerCase();
    if (lower.includes('atendimento') || lower.includes('suporte')) return 'Responsável pelo atendimento e suporte aos clientes e colaboradores.';
    if (lower.includes('comercial') || lower.includes('venda')) return 'Responsável pela prospecção e fechamento de novos contratos.';
    if (lower.includes('financeiro') || lower.includes('cobranc')) return 'Gerencia as finanças e receitas da empresa.';
    if (lower.includes('ti') || lower.includes('infra') || lower.includes('noc')) return 'Responsável pela infraestrutura tecnológica e operações de rede.';
    if (lower.includes('rh') || lower.includes('recursos humanos')) return 'Gerencia os colaboradores e processos de gestão de pessoas.';
    return 'Setor responsável por suas atividades específicas dentro da organização Prestek.';
}

// Mapa de ícones por palavra-chave no nome do departamento
const ICON_MAP = [
    { keys: ['ti', 'tecnologia', 'infra', 'infrastructure', 'tech', 'sistema'], icon: 'dns' },
    { keys: ['comercial', 'venda', 'marketing', 'mkt', 'negocio'], icon: 'storefront' },
    { keys: ['rh', 'recursos humanos', 'gente', 'people', 'gestão de pessoas'], icon: 'groups' },
    { keys: ['financeiro', 'financ', 'jurídico', 'juridico', 'contabil', 'fiscal'], icon: 'account_balance' },
    { keys: ['suporte', 'atendimento', 'helpdesk', 'cliente'], icon: 'support_agent' },
    { keys: ['operação', 'operacoes', 'operações', 'logistica', 'operacional'], icon: 'precision_manufacturing' },
    { keys: ['admin', 'administrativo', 'diretoria', 'gestão', 'gerência'], icon: 'business_center' },
    { keys: ['projetos', 'project'], icon: 'folder_managed' },
    { keys: ['campo', 'técnico', 'tecnico', 'instalação', 'instalacao'], icon: 'construction' },
];

function getIconForSetor(nome) {
    const nomeLower = (nome || '').toLowerCase();
    for (const entry of ICON_MAP) {
        if (entry.keys.some(k => nomeLower.includes(k))) return entry.icon;
    }
    return 'corporate_fare';
}

export default function Sectors({ user, setCurrentView }) {
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const isAdmin = user?.is_admin;

    const handleSaveDescription = async (id_setor, descricao) => {
        try {
            const res = await fetch('/api/admin/setores-descricoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_setor,
                    descricao,
                    atualizado_por: user?.funcionario || user?.email || 'Sistema'
                })
            });
            const data = await res.json();
            if (data.sucesso) {
                setSetores(prev => prev.map(s => 
                    s.id === id_setor ? { ...s, descricao_customizada: descricao } : s
                ));
            } else {
                alert('Erro ao salvar descrição: ' + data.erro);
            }
        } catch (e) {
            console.error('Erro salvar descricao:', e);
            alert('Erro de conexão ao salvar.');
        }
    };

    useEffect(() => {
        const fetchSetores = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/setores');
                const data = await res.json();
                if (data.sucesso) {
                    setSetores(data.setores);
                } else {
                    setErro('Erro ao carregar setores.');
                }
            } catch (e) {
                console.error('Erro ao buscar setores:', e);
                setErro('Não foi possível conectar ao servidor.');
            } finally {
                setLoading(false);
            }
        };
        fetchSetores();
    }, []);

    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto w-full">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">

                {/* Breadcrumbs e Header */}
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end mb-10">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                            <button onClick={() => setCurrentView?.('dashboard')} className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                                <span className="material-symbols-outlined text-lg">home</span>Início
                            </button>
                            <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                            <button onClick={() => setCurrentView?.('dashboard')} className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                                Dashboard
                            </button>
                            <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                            <span className="text-[#1d150c] dark:text-white text-sm font-bold">Setores e Departamentos</span>
                        </div>
                        <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Setores e Departamentos</h1>
                        <p className="text-[#a17745] dark:text-orange-300 text-lg font-medium">Visão geral da hierarquia organizacional da Prestek, contatos principais e setores de serviços internos.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-[#1d150c] dark:text-white font-bold shadow-sm hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Exportar Organograma
                        </button>
                    </div>
                </div>

                {/* Bloco de Organograma Hierárquico */}
                <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-6 md:p-8 overflow-hidden relative mb-12 shadow-sm">
                    <div className="flex flex-wrap gap-4 justify-between items-start mb-8">
                        <div>
                            <p className="text-primary text-sm font-black uppercase tracking-wider mb-1">Hierarquia Organizacional</p>
                            <h3 className="text-[#1d150c] dark:text-white text-2xl font-bold">Estrutura Prestek</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#1d150c] dark:text-white font-bold bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 px-4 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            Trimestre Atual
                        </div>
                    </div>

                    {/* Visualização de Árvore */}
                    <div className="flex flex-col items-center justify-center gap-8 w-full overflow-x-auto py-4">
                        <div className="flex flex-col items-center gap-6 min-w-[600px]">
                            {/* CEO - Topo da árvore */}
                            <div className="flex flex-col items-center">
                                <div className="w-56 bg-white dark:bg-[#1a130b] border-2 border-primary rounded-xl p-4 shadow-md text-center relative z-10 transition-transform hover:-translate-y-1 cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3 bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCaXDL9-IKCovbonIRkZxmOQtVMGSq9hyfkzfGLuREdVts0S_TaHxPdDnq3Q0ZJQjUV4h3rsQYIqn8IcxS_XYiTsGl7VZSibnFKenb1YcQ0cRTa6H2PBFYkAI08QxDVYEakee_SSZNVmDgKUZKNBbH83yobUivT_QlJR9MXzzJSQqZiUM-DhViuKy72fSO78t2--RJlAX_T4wZe--SQJQK8UqaFsgnKqB24Y4bEsxXAfaVVzxQ5ICzm6VI9t9ELNXIsqly0dkdybeQ')" }}></div>
                                    <p className="font-bold text-[#1d150c] dark:text-white text-lg">Jonathan Prestek</p>
                                    <p className="text-xs text-primary font-black uppercase tracking-wider">CEO</p>
                                </div>
                                {/* Linhas de conexão */}
                                <div className="h-8 w-0.5 bg-[#eaddcd]"></div>
                                <div className="h-0.5 w-[80%] bg-[#eaddcd]"></div>
                                <div className="flex justify-between w-[80%] -mt-0.5">
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                </div>
                            </div>

                            {/* Diretorias */}
                            <div className="grid grid-cols-4 gap-6 w-full">
                                <OrgNode icon="terminal" title="Tecnologia (TI)" name="Sarah Lin" />
                                <OrgNode icon="settings_suggest" title="Operações" name="Marcus Cole" />
                                <OrgNode icon="trending_up" title="Vendas & MKT" name="Elena Rodriguez" />
                                <OrgNode icon="support_agent" title="Suporte" name="David Kim" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diretório de Setores (Grid) - Dados reais do IXC */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[#1d150c] dark:text-white text-2xl font-black leading-tight">Diretório de Setores</h2>
                            {!loading && (
                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">
                                    {setores.length} setores
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-primary shadow-sm" title="Visualização em Grade">
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button className="p-2 hover:bg-[#fcfaf8] dark:bg-[#2c2217] rounded-lg text-[#a17745] dark:text-orange-300 transition-colors" title="Visualização em Lista">
                                <span className="material-symbols-outlined">view_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Estado de carregamento */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-6 animate-pulse">
                                    <div className="flex justify-between mb-5">
                                        <div className="size-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="w-20 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Estado de erro */}
                    {!loading && erro && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error_outline</span>
                            <p className="text-[#1d150c] dark:text-white font-bold text-lg mb-1">Não foi possível carregar os setores</p>
                            <p className="text-[#a17745] dark:text-orange-300 text-sm">{erro}</p>
                        </div>
                    )}

                    {/* Grid de setores */}
                    {!loading && !erro && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {setores.map(setor => (
                                <SectorCard
                                    key={setor.id}
                                    id={setor.id}
                                    icon={getIconForSetor(setor.nome)}
                                    ramal={setor.responsavel?.ramal && setor.responsavel.ramal !== '0' ? setor.responsavel.ramal : null}
                                    title={setor.nome}
                                    description={setor.descricao_customizada || getDescricaoForSetor(setor.nome)}
                                    managerName={setor.responsavel?.nome || null}
                                    managerImg={setor.responsavel?.foto || null}
                                    teamCount={setor.totalMembros}
                                    isAdmin={isAdmin}
                                    onSaveDescription={handleSaveDescription}
                                    setCurrentView={setCurrentView}
                                />
                            ))}
                            {setores.length === 0 && (
                                <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
                                    <span className="material-symbols-outlined text-5xl text-[#eaddcd] mb-4">domain_disabled</span>
                                    <p className="text-[#a17745] dark:text-orange-300 font-semibold">Nenhum setor encontrado.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer contextualizado */}
                <div className="mt-12 pt-8 border-t border-[#eaddcd] dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-[#a17745] dark:text-orange-300 gap-4">
                    <p className="font-semibold">© 2024 Prestek Intranet. Apenas para uso interno.</p>
                    <div className="flex gap-6 font-bold">
                        <a className="hover:text-primary transition-colors" href="#">Política</a>
                        <a className="hover:text-primary transition-colors" href="#">Central de Ajuda</a>
                        <a className="hover:text-primary transition-colors" href="#">Reportar Problema</a>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Subcomponente Node do Organograma
function OrgNode({ icon, title, name }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl p-4 shadow-sm text-center hover:shadow-md hover:border-[#ff8c00]/50 transition-all cursor-pointer group flex flex-col items-center justify-center">
                <div className="size-10 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">{icon}</span>
                </div>
                <p className="font-bold text-sm text-[#1d150c] dark:text-white mb-1">{title}</p>
                <p className="text-[11px] font-black text-[#a17745] dark:text-orange-300 uppercase tracking-wider">{name}</p>
            </div>
        </div>
    );
}

// Subcomponente Card de Setor
function SectorCard({ id, icon, ramal, title, description, managerName, managerImg, teamCount, isAdmin, onSaveDescription, setCurrentView }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editDesc, setEditDesc] = useState(description || '');

    const handleSave = () => {
        if (onSaveDescription) {
            onSaveDescription(id, editDesc);
        }
        setIsEditing(false);
    };

    const handleVerEquipe = () => {
        sessionStorage.setItem('@Stitch:directoryFilter', id);
        setCurrentView('directory');
    };

    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-6 flex flex-col gap-5 hover:border-[#ff8c00]/50 hover:shadow-md transition-all group relative">
            {/* Linha colorida de destaque no hover */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>

            <div className="flex justify-between items-start">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
                {ramal && (
                    <span className="px-2.5 py-1 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded font-black text-[11px] text-[#a17745] dark:text-orange-300 tracking-widest uppercase">
                        Ramal {ramal}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2">{title}</h3>
                {isEditing ? (
                    <div className="flex flex-col gap-2 relative z-20">
                        <textarea
                            className="w-full text-sm p-3 border border-[#eaddcd] dark:border-gray-800 rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                            rows={3}
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            placeholder="Digite a descrição do setor..."
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="text-xs px-3 py-1.5 font-bold text-gray-500 hover:text-[#1d150c] dark:hover:text-white transition-colors">Cancelar</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="text-xs px-4 py-1.5 font-bold bg-primary text-white rounded shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">Salvar</button>
                        </div>
                    </div>
                ) : (
                    <div className="relative group/desc">
                        {description && (
                            <>
                                <p className="text-sm text-[#a17745] dark:text-orange-300 leading-relaxed line-clamp-2 pr-8 relative z-10">{description}</p>
                                
                                {/* Tooltip Customizado Tailwind */}
                                <div className="absolute left-0 bottom-full mb-2 w-[calc(100%+20px)] -ml-[10px] pointer-events-none opacity-0 group-hover/desc:opacity-100 transition-all duration-300 translate-y-2 group-hover/desc:translate-y-0 z-50">
                                    <div className="bg-[#1d150c] dark:bg-[#f8f7f5] text-[#f8f7f5] dark:text-[#1d150c] text-[13px] font-medium leading-relaxed p-3.5 rounded-xl shadow-2xl relative">
                                        {description}
                                        {/* Setinha apontando para baixo */}
                                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#1d150c] dark:bg-[#f8f7f5] rotate-45"></div>
                                    </div>
                                </div>
                            </>
                        )}
                        {isAdmin && (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditDesc(description || '');
                                    setIsEditing(true);
                                }} 
                                className="absolute -top-1 -right-1 p-1.5 bg-white dark:bg-[#1a130b] text-primary opacity-0 group-hover/desc:opacity-100 transition-opacity rounded-md shadow-sm border border-[#eaddcd] dark:border-gray-800 hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] z-20"
                                title="Editar descrição"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 py-4 border-y border-[#f4eee6] dark:border-gray-800">
                {managerName ? (
                    <>
                        {managerImg ? (
                            <div
                                className="size-10 rounded-full bg-gray-200 bg-cover bg-center border border-[#eaddcd] dark:border-gray-800 shrink-0"
                                style={{ backgroundImage: `url('${managerImg}')` }}
                                title={`Responsável: ${managerName}`}
                            ></div>
                        ) : (
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-[#eaddcd] dark:border-gray-800 shrink-0">
                                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-[#a17745] dark:text-orange-300 font-black uppercase tracking-wider mb-0.5">Responsável</p>
                            <p className="text-sm font-bold text-[#1d150c] dark:text-white truncate">{managerName}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 min-w-0" />
                )}
                <div className="text-right pl-3 border-l border-[#f4eee6] dark:border-gray-800 shrink-0">
                    <p className="text-[10px] text-[#a17745] dark:text-orange-300 font-black uppercase tracking-wider mb-0.5">Equipe</p>
                    <p className="text-sm font-bold text-[#1d150c] dark:text-white">{teamCount}</p>
                </div>
            </div>

            <div className="flex gap-3 mt-auto pt-1">
                <button onClick={handleVerEquipe} className="flex-1 py-2.5 px-3 rounded-lg border-2 border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white font-bold text-sm hover:border-primary hover:text-primary transition-colors focus:outline-none cursor-pointer">
                    Ver Equipe
                </button>
                <button className="flex items-center justify-center size-11 rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] border-2 border-transparent hover:border-primary/30 text-primary hover:bg-primary/5 transition-colors cursor-pointer" title="Contatar Setor">
                    <span className="material-symbols-outlined text-[22px]">mail</span>
                </button>
            </div>
        </div>
    );
}
