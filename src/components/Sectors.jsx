import { useState, useEffect } from 'react';

const ICON_MAP = {
    'comercial': 'storefront',
    'vendas': 'storefront',
    'venda': 'storefront',
    'financeiro': 'account_balance',
    'financeira': 'account_balance',
    'cobrança': 'payments',
    'cobranca': 'payments',
    'suporte': 'support_agent',
    'atendimento': 'support_agent',
    'ti': 'dns',
    'tecnologia': 'dns',
    'técnico': 'build',
    'tecnico': 'build',
    'instalação': 'handyman',
    'instalacao': 'handyman',
    'instalacão': 'handyman',
    'manutenção': 'home_repair_service',
    'manutencao': 'home_repair_service',
    'recursos humanos': 'groups',
    'rh': 'groups',
    'operações': 'precision_manufacturing',
    'operacoes': 'precision_manufacturing',
    'noc': 'monitor',
    'feedback': 'rate_review',
    'estoque': 'inventory_2',
    'logística': 'local_shipping',
    'logistica': 'local_shipping',
    'cancelamento': 'cancel',
    'cancelamentos': 'cancel',
    'auditoria': 'verified',
    'jurídico': 'gavel',
    'juridico': 'gavel',
    'marketing': 'campaign',
    'administrativo': 'admin_panel_settings',
};

function getIcon(setor) {
    if (!setor) return 'business';
    const lower = setor.toLowerCase();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (lower.includes(key)) return icon;
    }
    return 'business';
}

function getDeptLabel(idDepto) {
    const map = {
        '0': 'Geral',
        '1': 'Financeiro',
        '2': 'Técnico',
        '3': 'Comercial',
        '4': 'Operações',
        '5': 'Administrativo',
        '6': 'TI',
    };
    return map[String(idDepto)] || `Departamento ${idDepto}`;
}

export default function Sectors() {
    const [setoresInternos, setSetoresInternos] = useState([]);
    const [setoresSuporte, setSetoresSuporte] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [funcionariosCounts, setFuncionariosCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState('internos');
    const [busca, setBusca] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [rCargos, rDepts, rFiliais, rCounts] = await Promise.all([
                    fetch('/api/cargos').catch(() => null),
                    fetch('/api/departamentos').catch(() => null),
                    fetch('/api/filiais').catch(() => null),
                    fetch('/api/funcionarios-por-setor').catch(() => null),
                ]);

                if (rCargos?.ok) {
                    const d = await rCargos.json();
                    if (d.sucesso) {
                        setSetoresInternos((d.cargos || []).filter(s => s.ativo === 'S'));
                    }
                }
                if (rDepts?.ok) {
                    const d = await rDepts.json();
                    if (d.sucesso) {
                        setSetoresSuporte((d.departamentos || []).filter(s => s.ativo === 'S'));
                    }
                }
                if (rFiliais?.ok) {
                    const d = await rFiliais.json();
                    if (d.sucesso) {
                        setFiliais((d.filiais || []).filter(f => f.ativo === 'S'));
                    }
                }
                if (rCounts?.ok) {
                    const d = await rCounts.json();
                    if (d.sucesso) setFuncionariosCounts(d.counts || {});
                }
            } catch (err) {
                console.error('Erro ao buscar setores:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const setoresFiltrados = (abaAtiva === 'internos' ? setoresInternos :
        abaAtiva === 'suporte' ? setoresSuporte : filiais
    ).filter(s => {
        const nome = s.setor || s.fantasia || s.razao || '';
        return nome.toLowerCase().includes(busca.toLowerCase());
    });

    const abas = [
        { id: 'internos', label: 'Setores Internos', count: setoresInternos.length, icon: 'corporate_fare' },
        { id: 'suporte', label: 'Setores de Suporte', count: setoresSuporte.length, icon: 'support_agent' },
        { id: 'filiais', label: 'Filiais', count: filiais.length, icon: 'location_on' },
    ];

    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 py-8 overflow-y-auto w-full">
            <div className="flex flex-col max-w-[1200px] mx-auto w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end mb-8">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 items-center text-sm mb-2">
                            <span className="text-[#a17745] dark:text-orange-300 font-semibold">Início</span>
                            <span className="text-[#a17745] dark:text-orange-300/50">/</span>
                            <span className="text-[#1d150c] dark:text-white font-bold">Estrutura da Empresa</span>
                        </div>
                        <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            Setores e Departamentos
                        </h1>
                        <p className="text-[#a17745] dark:text-orange-300 text-base font-medium">
                            Estrutura organizacional da Prestek — dados sincronizados com o IXC.
                        </p>
                    </div>

                    {/* Busca */}
                    <div className="relative min-w-[260px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a17745] text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar setor..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm text-[#1d150c] dark:text-white placeholder:text-[#a17745]/60 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Abas */}
                <div className="flex gap-2 mb-6 border-b border-[#eaddcd] dark:border-gray-800">
                    {abas.map(aba => (
                        <button
                            key={aba.id}
                            onClick={() => { setAbaAtiva(aba.id); setBusca(''); }}
                            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${
                                abaAtiva === aba.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-[#a17745] dark:text-orange-300 hover:text-primary hover:border-primary/40'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{aba.icon}</span>
                            {aba.label}
                            {!loading && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                                    abaAtiva === aba.id ? 'bg-primary/10 text-primary' : 'bg-[#f4eee6] dark:bg-[#2c2217] text-[#a17745]'
                                }`}>
                                    {aba.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Conteúdo */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-[#a17745] dark:text-orange-300 font-medium">Carregando dados do IXC...</p>
                    </div>
                ) : setoresFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                        <span className="material-symbols-outlined text-5xl text-[#eaddcd]">search_off</span>
                        <p className="text-[#a17745] dark:text-orange-300 font-semibold">Nenhum resultado encontrado</p>
                    </div>
                ) : abaAtiva === 'filiais' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {setoresFiltrados.map(filial => (
                            <FilialCard key={filial.id} filial={filial} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {setoresFiltrados.map(setor => (
                            <SetorCard
                                key={setor.id}
                                setor={setor}
                                tipo={abaAtiva}
                                funcionariosCount={funcionariosCounts[String(setor.id)] || 0}
                            />
                        ))}
                    </div>
                )}

                {/* Resumo */}
                {!loading && (
                    <div className="mt-10 pt-6 border-t border-[#eaddcd] dark:border-gray-800 grid grid-cols-3 gap-4">
                        <SummaryCard icon="corporate_fare" label="Setores Internos" value={setoresInternos.length} color="text-blue-500" />
                        <SummaryCard icon="support_agent" label="Setores de Suporte" value={setoresSuporte.length} color="text-green-500" />
                        <SummaryCard icon="location_on" label="Filiais Ativas" value={filiais.length} color="text-orange-500" />
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-sm text-[#a17745] dark:text-orange-300 gap-2">
                    <p className="font-semibold">© 2026 Prestek Intranet. Apenas para uso interno.</p>
                    <p className="text-xs opacity-60">Dados sincronizados em tempo real com o IXC Soft</p>
                </div>
            </div>
        </main>
    );
}

function SetorCard({ setor, tipo, funcionariosCount }) {
    const icon = getIcon(setor.setor);
    const cor = setor.cor && setor.cor !== '#000000' ? setor.cor : null;
    const presta = setor.presta_atendimento === 'S';

    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-5 flex flex-col gap-4 hover:border-[#ff8c00]/50 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>

            <div className="flex justify-between items-start">
                <div
                    className="size-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cor ? `${cor}18` : undefined }}
                >
                    <span
                        className="material-symbols-outlined text-[26px]"
                        style={{ color: cor || '#ff8c00' }}
                    >
                        {icon}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-full text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Ativo
                    </span>
                    {tipo === 'suporte' && presta && (
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Atendimento
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-base font-bold text-[#1d150c] dark:text-white mb-1 leading-tight">
                    {setor.setor}
                </h3>
                {tipo === 'internos' && setor.id_depto && setor.id_depto !== '0' && (
                    <p className="text-xs text-[#a17745] dark:text-orange-300 font-semibold">
                        {getDeptLabel(setor.id_depto)}
                    </p>
                )}
                {tipo === 'suporte' && setor.email && (
                    <p className="text-xs text-[#a17745] dark:text-orange-300 truncate mt-1">
                        {setor.email}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f4eee6] dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#a17745]">badge</span>
                    <span className="text-xs font-bold text-[#1d150c] dark:text-white">
                        {funcionariosCount > 0 ? `${funcionariosCount} colaborador${funcionariosCount > 1 ? 'es' : ''}` : 'Equipe'}
                    </span>
                </div>
                <span className="text-xs text-[#a17745] dark:text-orange-300 font-mono opacity-60">
                    ID #{setor.id}
                </span>
            </div>
        </div>
    );
}

function FilialCard({ filial }) {
    const nome = filial.fantasia || filial.razao || 'Filial';
    const tel = filial.telefone || filial.whatsapp || '';
    const email = filial.email || '';

    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-5 flex flex-col gap-4 hover:border-[#ff8c00]/50 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>

            <div className="flex justify-between items-start">
                <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px] text-primary">location_on</span>
                </div>
                <span className="px-2.5 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-full text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
                    Ativa
                </span>
            </div>

            <div className="flex-1">
                <h3 className="text-base font-bold text-[#1d150c] dark:text-white mb-1 leading-tight">{nome}</h3>
                {filial.razao && filial.fantasia && (
                    <p className="text-xs text-[#a17745] dark:text-orange-300 font-medium mb-2 truncate">{filial.razao}</p>
                )}
                {filial.endereco && (
                    <p className="text-xs text-[#a17745] dark:text-orange-300 flex items-start gap-1">
                        <span className="material-symbols-outlined text-[13px] mt-0.5 shrink-0">place</span>
                        <span className="line-clamp-2">{filial.endereco}{filial.numero ? `, ${filial.numero}` : ''}{filial.bairro ? ` — ${filial.bairro}` : ''}</span>
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#f4eee6] dark:border-gray-800">
                {tel && (
                    <div className="flex items-center gap-2 text-xs text-[#1d150c] dark:text-white">
                        <span className="material-symbols-outlined text-[14px] text-primary">call</span>
                        <span className="font-medium">{tel}</span>
                    </div>
                )}
                {email && (
                    <div className="flex items-center gap-2 text-xs text-[#1d150c] dark:text-white">
                        <span className="material-symbols-outlined text-[14px] text-primary">mail</span>
                        <span className="font-medium truncate">{email}</span>
                    </div>
                )}
                {filial.cnpj && (
                    <div className="flex items-center gap-2 text-xs text-[#a17745] dark:text-orange-300">
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        <span className="font-mono">{filial.cnpj}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, color }) {
    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-[#f4eee6] dark:bg-[#2c2217] flex items-center justify-center">
                <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
            </div>
            <div>
                <p className="text-2xl font-black text-[#1d150c] dark:text-white leading-none">{value}</p>
                <p className="text-xs text-[#a17745] dark:text-orange-300 font-semibold mt-0.5">{label}</p>
            </div>
        </div>
    );
}
