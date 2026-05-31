import React, { useState, useEffect } from 'react';

// ── Paleta compartilhada (mesma do Dashboard / Colaboradores / Serviços) ──────
const C = {
    bg: '#F5F9FF',
    surface: '#FFFFFF',
    surfaceSoft: '#F7FAFD',
    accent: '#4A9EF5',
    accentDark: '#2D7BD4',
    accentDeep: '#1F5BA8',
    accentSoft: '#EAF4FF',
    cyan: '#7FD4E8',
    ink: '#0B1B2E',
    ink2: '#475467',
    muted: '#8896A8',
    line: '#E4ECF5',
    danger: '#E84545',
};

function tone(hex, a) {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const MONO = '"JetBrains Mono", monospace';

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
    const [viewMode, setViewMode] = useState('grid');

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

    const totalColaboradores = setores.reduce((acc, s) => acc + (Number(s.totalMembros) || 0), 0);
    const comResponsavel = setores.filter(s => s.responsavel?.nome).length;

    return (
        <main style={{ flex: 1, overflowY: 'auto', width: '100%', background: C.bg, fontFamily: FONT, padding: '32px 16px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── Hero Banner ─────────────────────────────────────────── */}
                <div style={{
                    background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
                    borderRadius: 24, padding: '32px 36px', color: 'white',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
                }}>
                    <svg style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} width="100%" height="100%">
                        <defs><pattern id="sec-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#sec-grid)" />
                    </svg>
                    <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: 640 }}>
                            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                🏢 Setores e Departamentos
                            </h1>
                            <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>
                                Visão geral da hierarquia organizacional da Prestek, contatos principais e setores de serviços internos.
                            </p>

                            {/* KPI Pills */}
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
                                {[
                                    { label: 'Setores', value: loading ? '···' : setores.length, icon: 'corporate_fare' },
                                    { label: 'Colaboradores', value: loading ? '···' : totalColaboradores, icon: 'groups' },
                                    { label: 'Com responsável', value: loading ? '···' : comResponsavel, icon: 'badge' },
                                ].map(kpi => (
                                    <div key={kpi.label} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '8px 16px', borderRadius: 999,
                                        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                                        WebkitBackdropFilter: 'blur(6px)',
                                        border: '1px solid rgba(255,255,255,0.25)', color: 'white',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, lineHeight: 1 }}>{kpi.icon}</span>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{kpi.value}</span>
                                        <span style={{ fontSize: 12.5, opacity: 0.8, fontFamily: MONO, letterSpacing: '0.06em' }}>{kpi.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '11px 18px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
                                color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                            Exportar Organograma
                        </button>
                    </div>
                </div>

                {/* ── Organograma ─────────────────────────────────────────── */}
                <OrgChart />

                {/* ── Diretório de Setores ────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 16, borderBottom: `1px solid ${C.line}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>Diretório de Setores</h2>
                            {!loading && (
                                <span style={{ padding: '4px 12px', background: C.accentSoft, color: C.accentDeep, fontSize: 12, fontWeight: 800, borderRadius: 999, fontFamily: MONO }}>
                                    {setores.length} setores
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[
                                { mode: 'grid', icon: 'grid_view', title: 'Visualização em Grade' },
                                { mode: 'list', icon: 'view_list', title: 'Visualização em Lista' },
                            ].map(v => (
                                <button
                                    key={v.mode}
                                    onClick={() => setViewMode(v.mode)}
                                    title={v.title}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                                        border: `1px solid ${viewMode === v.mode ? tone(C.accent, 0.4) : C.line}`,
                                        background: viewMode === v.mode ? C.accentSoft : C.surface,
                                        color: viewMode === v.mode ? C.accentDeep : C.muted,
                                        transition: 'all 0.2s',
                                    }}>
                                    <span className="material-symbols-outlined">{v.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.line}`, padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.surfaceSoft }} />
                                        <div style={{ width: 80, height: 24, borderRadius: 6, background: C.surfaceSoft }} />
                                    </div>
                                    <div style={{ height: 20, background: C.surfaceSoft, borderRadius: 6, width: '70%', marginBottom: 10 }} />
                                    <div style={{ height: 12, background: C.surfaceSoft, borderRadius: 6, width: '100%', marginBottom: 6 }} />
                                    <div style={{ height: 12, background: C.surfaceSoft, borderRadius: 6, width: '85%' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Erro */}
                    {!loading && erro && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 56, color: C.danger, marginBottom: 16 }}>error_outline</span>
                            <p style={{ margin: 0, color: C.ink, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Não foi possível carregar os setores</p>
                            <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>{erro}</p>
                        </div>
                    )}

                    {/* Grid de setores */}
                    {!loading && !erro && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: 20,
                        }}>
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
                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', textAlign: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: C.line, marginBottom: 16 }}>domain_disabled</span>
                                    <p style={{ margin: 0, color: C.muted, fontWeight: 600 }}>Nenhum setor encontrado.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div style={{ marginTop: 16, paddingTop: 28, borderTop: `1px solid ${C.line}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: C.muted, fontSize: 13 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>© 2024 Prestek Intranet. Apenas para uso interno.</p>
                    <div style={{ display: 'flex', gap: 24, fontWeight: 700 }}>
                        <a style={{ color: C.ink2, textDecoration: 'none' }} href="#">Política</a>
                        <a style={{ color: C.ink2, textDecoration: 'none' }} href="#">Central de Ajuda</a>
                        <a style={{ color: C.ink2, textDecoration: 'none' }} href="#">Reportar Problema</a>
                    </div>
                </div>
            </div>
        </main>
    );
}

// ── Organograma ───────────────────────────────────────────────────────────────
function OrgChart() {
    const directors = [
        { icon: 'terminal', title: 'Tecnologia (TI)', name: 'Sarah Lin' },
        { icon: 'settings_suggest', title: 'Operações', name: 'Marcus Cole' },
        { icon: 'trending_up', title: 'Vendas & MKT', name: 'Elena Rodriguez' },
        { icon: 'support_agent', title: 'Suporte', name: 'David Kim' },
    ];

    return (
        <div style={{
            background: C.surface, borderRadius: 24, border: `1px solid ${C.line}`,
            padding: '28px 32px', position: 'relative', overflow: 'hidden',
            boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
        }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <p style={{ margin: 0, color: C.accent, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: MONO }}>Hierarquia Organizacional</p>
                    <h3 style={{ margin: '4px 0 0', color: C.ink, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Estrutura Prestek</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: C.accentDeep, background: C.accentSoft, border: `1px solid ${tone(C.accent, 0.25)}`, padding: '8px 14px', borderRadius: 999 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                    Trimestre Atual
                </div>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', padding: '24px 4px 8px' }}>
                <div style={{ minWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* CEO */}
                    <div
                        style={{
                            width: 240, borderRadius: 18, padding: '20px 16px', textAlign: 'center',
                            background: `linear-gradient(135deg, ${C.accentDeep} 0%, ${C.accent} 100%)`,
                            color: 'white', boxShadow: `0 16px 36px -16px ${tone(C.accentDeep, 0.55)}`,
                            position: 'relative', zIndex: 2,
                        }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCaXDL9-IKCovbonIRkZxmOQtVMGSq9hyfkzfGLuREdVts0S_TaHxPdDnq3Q0ZJQjUV4h3rsQYIqn8IcxS_XYiTsGl7VZSibnFKenb1YcQ0cRTa6H2PBFYkAI08QxDVYEakee_SSZNVmDgKUZKNBbH83yobUivT_QlJR9MXzzJSQqZiUM-DhViuKy72fSO78t2--RJlAX_T4wZe--SQJQK8UqaFsgnKqB24Y4bEsxXAfaVVzxQ5ICzm6VI9t9ELNXIsqly0dkdybeQ')",
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            border: '3px solid rgba(255,255,255,0.6)',
                        }} />
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>Jonathan Prestek</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', fontFamily: MONO }}>CEO</p>
                    </div>

                    {/* Conectores */}
                    <div style={{ width: 2, height: 28, background: tone(C.accent, 0.35) }} />
                    <div style={{ width: '76%', height: 2, background: tone(C.accent, 0.35) }} />
                    <div style={{ width: '76%', display: 'flex', justifyContent: 'space-around', marginTop: -1 }}>
                        {directors.map((_, i) => (
                            <div key={i} style={{ width: 2, height: 24, background: tone(C.accent, 0.35) }} />
                        ))}
                    </div>

                    {/* Diretorias */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, width: '100%', marginTop: 4 }}>
                        {directors.map(d => <OrgNode key={d.title} {...d} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Nó do organograma (diretoria)
function OrgNode({ icon, title, name }) {
    const [hover, setHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: C.surface, border: `1px solid ${hover ? tone(C.accent, 0.4) : C.line}`,
                borderRadius: 16, padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: hover ? `0 14px 30px -16px ${tone(C.accentDeep, 0.4)}` : `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
                transform: hover ? 'translateY(-3px)' : 'none', transition: 'all 0.2s',
            }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <span className="material-symbols-outlined" style={{ color: C.accent, fontSize: 24 }}>{icon}</span>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.ink }}>{title}</p>
            <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: MONO }}>{name}</p>
        </div>
    );
}

// ── Card de Setor ─────────────────────────────────────────────────────────────
function SectorCard({ id, icon, ramal, title, description, managerName, managerImg, teamCount, isAdmin, onSaveDescription, setCurrentView }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editDesc, setEditDesc] = useState(description || '');
    const [hover, setHover] = useState(false);

    const handleSave = () => {
        if (onSaveDescription) onSaveDescription(id, editDesc);
        setIsEditing(false);
    };

    const handleVerEquipe = () => {
        sessionStorage.setItem('@Stitch:directoryFilter', id);
        setCurrentView('directory');
    };

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: C.surface, borderRadius: 18, border: `1px solid ${hover ? tone(C.accent, 0.4) : C.line}`,
                padding: 24, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', overflow: 'hidden',
                boxShadow: hover ? `0 16px 36px -18px ${tone(C.accentDeep, 0.4)}` : `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
                transform: hover ? 'translateY(-3px)' : 'none', transition: 'all 0.2s',
            }}>
            {/* Faixa de destaque */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: `linear-gradient(${C.accent}, ${C.accentDeep})`, opacity: hover ? 1 : 0, transition: 'opacity 0.2s' }} />

            {/* Topo: ícone + ramal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: C.accent, fontSize: 28 }}>{icon}</span>
                </div>
                {ramal && (
                    <span style={{ padding: '5px 10px', background: C.surfaceSoft, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: MONO }}>
                        Ramal {ramal}
                    </span>
                )}
            </div>

            {/* Título + descrição */}
            <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{title}</h3>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea
                            rows={3}
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            placeholder="Digite a descrição do setor..."
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', boxSizing: 'border-box', resize: 'none',
                                fontSize: 13.5, padding: 12, borderRadius: 10, border: `1px solid ${C.line}`,
                                background: C.surfaceSoft, color: C.ink, fontFamily: FONT, outline: 'none',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={e => { e.stopPropagation(); setIsEditing(false); }} style={{ fontSize: 12.5, padding: '6px 12px', fontWeight: 700, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={e => { e.stopPropagation(); handleSave(); }} style={{ fontSize: 12.5, padding: '7px 16px', fontWeight: 700, color: 'white', background: C.accent, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Salvar</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        {description && (
                            <p title={description} style={{
                                margin: 0, fontSize: 13.5, color: C.ink2, lineHeight: 1.55,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                paddingRight: isAdmin ? 28 : 0,
                            }}>{description}</p>
                        )}
                        {isAdmin && (
                            <button
                                onClick={e => { e.preventDefault(); e.stopPropagation(); setEditDesc(description || ''); setIsEditing(true); }}
                                title="Editar descrição"
                                style={{
                                    position: 'absolute', top: -2, right: -4, padding: 5, borderRadius: 8,
                                    background: C.surface, border: `1px solid ${C.line}`, color: C.accent, cursor: 'pointer',
                                    opacity: hover ? 1 : 0, transition: 'opacity 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Responsável + Equipe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                {managerName ? (
                    <>
                        {managerImg ? (
                            <div title={`Responsável: ${managerName}`} style={{ width: 40, height: 40, borderRadius: '50%', backgroundImage: `url('${managerImg}')`, backgroundSize: 'cover', backgroundPosition: 'center', border: `1px solid ${C.line}`, flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.line}`, flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ color: C.accent, fontSize: 20 }}>person</span>
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: MONO }}>Responsável</p>
                            <p style={{ margin: '2px 0 0', fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{managerName}</p>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, minWidth: 0 }} />
                )}
                <div style={{ textAlign: 'right', paddingLeft: 12, borderLeft: `1px solid ${C.line}`, flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: MONO }}>Equipe</p>
                    <p style={{ margin: '2px 0 0', fontSize: 13.5, fontWeight: 700, color: C.ink }}>{teamCount}</p>
                </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                <button
                    onClick={handleVerEquipe}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accentDeep; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.ink; }}
                    style={{ flex: 1, padding: '11px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.surface, color: C.ink, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}>
                    Ver Equipe
                </button>
                <button
                    title="Contatar Setor"
                    onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.accentSoft; e.currentTarget.style.color = C.accent; }}
                    style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: C.accentSoft, color: C.accent, border: 'none', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>mail</span>
                </button>
            </div>
        </div>
    );
}
