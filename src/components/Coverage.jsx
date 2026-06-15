import React, { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CoverageMap from './CoverageMap';

// ─── Constantes ───────────────────────────────────────────────────
const TECNOLOGIAS = ['FTTH', 'Rádio', 'UTP'];
const STATUS_OPCOES = ['Ativo', 'Expansão', 'Inativo'];
const VELOCIDADES = ['10 MEGA', '20 MEGA', '50 MEGA', '100 MEGA', '200 MEGA', '300 MEGA', '500 MEGA', '1 GIGA'];

const TECH_STYLES = {
    FTTH:  { cls: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30', icon: 'fiber_manual_record' },
    Rádio: { cls: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30',     icon: 'settings_input_antenna' },
    UTP:   { cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',   icon: 'cable' },
};

const STATUS_BAR = {
    Ativo:    { barCls: 'bg-emerald-500 dark:bg-emerald-400',  textCls: 'text-emerald-600 dark:text-emerald-400' },
    Expansão: { barCls: 'bg-blue-500 dark:bg-blue-400',   textCls: 'text-blue-600 dark:text-blue-400' },
    Inativo:  { barCls: 'bg-rose-500 dark:bg-rose-400',    textCls: 'text-rose-600 dark:text-rose-400' },
};

// ─── Mini-mapa para seleção de coordenadas ────────────────────────
function MapaPicker({ lat, lng, onChange }) {
    const containerRef = useRef(null);
    const mapRef       = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        // HMR: limpa _leaflet_id preso de versão anterior
        if (containerRef.current._leaflet_id) containerRef.current._leaflet_id = undefined;
        {
            const center = (lat && lng) ? [lat, lng] : [-10.5, -36.5];
            const zoom   = (lat && lng) ? 14 : 9;
            const map = L.map(containerRef.current, { center, zoom, zoomControl: true });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
            }).addTo(map);

            let marker = null;
            // Se já tem coordenadas, coloca marcador inicial
            if (lat && lng) {
                marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                marker.on('dragend', () => {
                    const p = marker.getLatLng();
                    onChange(p.lat.toFixed(7), p.lng.toFixed(7));
                });
            }

            // Clicar no mapa → posiciona/move marcador
            map.on('click', (e) => {
                const { lat: clat, lng: clng } = e.latlng;
                if (marker) {
                    marker.setLatLng([clat, clng]);
                } else {
                    marker = L.marker([clat, clng], { draggable: true }).addTo(map);
                    marker.on('dragend', () => {
                        const p = marker.getLatLng();
                        onChange(p.lat.toFixed(7), p.lng.toFixed(7));
                    });
                }
                onChange(clat.toFixed(7), clng.toFixed(7));
            });

            mapRef.current = { map, getMarker: () => marker, setMarker: (m) => { marker = m; }, L };
        }
        return () => {
            if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null; }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Quando lat/lng mudam via campos de texto → mover marcador
    useEffect(() => {
        if (!mapRef.current || !lat || !lng) return;
        const { map, getMarker, setMarker, L } = mapRef.current;
        let m = getMarker();
        if (m) {
            m.setLatLng([lat, lng]);
        } else {
            m = L.marker([lat, lng], { draggable: true }).addTo(map);
            m.on('dragend', () => {
                const p = m.getLatLng();
                onChange(parseFloat(p.lat.toFixed(7)), parseFloat(p.lng.toFixed(7)));
            });
            setMarker(m);
        }
        map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }, [lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={containerRef} style={{ height: '240px', width: '100%', borderRadius: '16px' }} />;
}

// ─── Modal Override (configurar campos manuais de uma linha IXC) ──
function OverrideModal({ registro, onFechar, onSalvar }) {
    const [form, setForm] = useState({
        tecnologia: registro.tecnologia || 'FTTH',
        velocidade_maxima: registro.velocidade_maxima || '100 MEGA',
        status: registro.status || 'Ativo',
        percentual_cobertura: registro.percentual_cobertura ?? 100,
        latitude:  registro.latitude  ?? '',
        longitude: registro.longitude ?? '',
    });
    const [salvando, setSalvando]       = useState(false);
    const [erro, setErro]               = useState('');
    const [mapaAberto, setMapaAberto]   = useState(!!(registro.latitude && registro.longitude));
    // Debounce para atualizar mapa ao digitar coordenadas
    const coordsDebounceRef = useRef(null);

    const handleChange = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

    const handleCoordChange = (campo, valor) => {
        // Normaliza vírgula → ponto (locale pt-BR pode usar vírgula como decimal)
        const normalizado = String(valor).replace(',', '.');
        setForm(f => ({ ...f, [campo]: normalizado }));
    };

    // Lat/lng parseados (para o mapa) — normaliza vírgula antes de converter
    const latNum = parseFloat(String(form.latitude).replace(',', '.'));
    const lngNum = parseFloat(String(form.longitude).replace(',', '.'));
    const coordsValidas = !isNaN(latNum) && !isNaN(lngNum);

    const handleMapaClick = (lat, lng) => {
        setForm(f => ({ ...f, latitude: lat, longitude: lng }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        setErro('');
        try {
            const resp = await fetch('/api/cobertura-ixc/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cidade_ixc_id: registro.cidade_ixc_id,
                    cidade: registro.cidade,
                    estado: registro.estado,
                    bairro: registro.bairro,
                    tecnologia: form.tecnologia,
                    velocidade_maxima: form.velocidade_maxima,
                    status: form.status,
                    percentual_cobertura: parseInt(form.percentual_cobertura),
                    latitude:  form.latitude  !== '' ? parseFloat(String(form.latitude).replace(',', '.'))  : null,
                    longitude: form.longitude !== '' ? parseFloat(String(form.longitude).replace(',', '.')) : null,
                })
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.erro || 'Erro desconhecido');
            onSalvar();
        } catch (e) {
            setErro(e.message);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0B1B2E] rounded-2xl shadow-2xl w-full max-w-lg border border-[#E4ECF5] dark:border-[var(--border)] my-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4ECF5] dark:border-[var(--border)]">
                    <div>
                        <h3 className="text-[#0B1B2E] dark:text-[var(--foreground)] font-bold text-lg">Configurar Cobertura</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {registro.cidade} — {registro.bairro}
                        </p>
                    </div>
                    <button onClick={onFechar} className="text-slate-400 dark:text-slate-500 hover:text-[#1F5BA8] dark:hover:text-[#4A9EF5] p-1.5 rounded-xl hover:bg-[#F5F9FF] dark:hover:bg-[#0B1B2E] transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-2 gap-4">
                    {/* Info somente leitura */}
                    <div className="col-span-2 bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 rounded-xl px-4 py-3 flex items-center gap-3 border border-[#E4ECF5] dark:border-[var(--border)]">
                        <span className="material-symbols-outlined text-[#1F5BA8] dark:text-[#4A9EF5]">info</span>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Cidade e bairro são gerados automaticamente pelo IXC.
                            </p>
                            <p className="text-xs text-[#1F5BA8] dark:text-[#4A9EF5] font-semibold mt-0.5">
                                {registro.total_contratos} contrato(s) ativo(s) neste bairro
                            </p>
                        </div>
                    </div>

                    {/* Tecnologia */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tecnologia</label>
                        <select
                            className="border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[#0B1B2E] dark:text-[var(--foreground)] bg-white dark:bg-[#0B1B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                            value={form.tecnologia}
                            onChange={e => handleChange('tecnologia', e.target.value)}
                        >
                            {TECNOLOGIAS.map(t => <option key={t} value={t} className="dark:bg-[#0B1B2E]">{t}</option>)}
                        </select>
                    </div>

                    {/* Velocidade */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Veloc. Máxima</label>
                        <select
                            className="border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[#0B1B2E] dark:text-[var(--foreground)] bg-white dark:bg-[#0B1B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                            value={form.velocidade_maxima}
                            onChange={e => handleChange('velocidade_maxima', e.target.value)}
                        >
                            {VELOCIDADES.map(v => <option key={v} value={v} className="dark:bg-[#0B1B2E]">{v}</option>)}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                        <select
                            className="border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[#0B1B2E] dark:text-[var(--foreground)] bg-white dark:bg-[#0B1B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                            value={form.status}
                            onChange={e => handleChange('status', e.target.value)}
                        >
                            {STATUS_OPCOES.map(s => <option key={s} value={s} className="dark:bg-[#0B1B2E]">{s}</option>)}
                        </select>
                    </div>

                    {/* Percentual */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Cobertura: <span className="text-[#1F5BA8] dark:text-[#4A9EF5] font-bold">{form.percentual_cobertura}%</span>
                        </label>
                        <input
                            type="range" min={0} max={100} step={1}
                            className="accent-[#1F5BA8] dark:accent-[#4A9EF5] mt-2 cursor-pointer"
                            value={form.percentual_cobertura}
                            onChange={e => handleChange('percentual_cobertura', e.target.value)}
                        />
                    </div>

                    {/* ─── Seção Localização ─── */}
                    <div className="col-span-2 border-t border-[#E4ECF5] dark:border-[var(--border)] pt-3">
                        <button
                            type="button"
                            onClick={() => setMapaAberto(v => !v)}
                            className="flex items-center gap-2 text-sm font-semibold text-[#1F5BA8] dark:text-[#4A9EF5] hover:text-[#4A9EF5] dark:hover:text-[#F5F9FF] transition-colors mb-3"
                        >
                            <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                            Localização do Bairro
                            <span className="material-symbols-outlined text-[16px]">
                                {mapaAberto ? 'expand_less' : 'expand_more'}
                            </span>
                            {coordsValidas && (
                                <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400 font-normal">✓ definida</span>
                            )}
                        </button>

                        {/* Campos de texto lat/lng */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latitude</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="-9.9170800"
                                    className="border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[#0B1B2E] dark:text-[var(--foreground)] bg-white dark:bg-[#0B1B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent font-mono transition-all"
                                    value={form.latitude}
                                    onChange={e => handleCoordChange('latitude', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Longitude</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="-36.5560000"
                                    className="border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[#0B1B2E] dark:text-[var(--foreground)] bg-white dark:bg-[#0B1B2E]/50 focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent font-mono transition-all"
                                    value={form.longitude}
                                    onChange={e => handleCoordChange('longitude', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Mini-mapa colapsável */}
                        {mapaAberto && (
                            <div className="rounded-xl overflow-hidden border border-[#E4ECF5] dark:border-[var(--border)] shadow-inner">
                                <div className="bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 border-b border-[#E4ECF5] dark:border-[var(--border)]">
                                    <span className="material-symbols-outlined text-[14px]">touch_app</span>
                                    Clique no mapa para definir a posição exata do bairro
                                </div>
                                <MapaPicker
                                    lat={coordsValidas ? latNum : null}
                                    lng={coordsValidas ? lngNum : null}
                                    onChange={handleMapaClick}
                                />
                            </div>
                        )}
                    </div>

                    {erro && (
                        <div className="col-span-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl px-3 py-2 text-sm">
                            {erro}
                        </div>
                    )}

                    <div className="col-span-2 flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onFechar} className="px-4 py-2.5 text-sm font-semibold border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl text-slate-600 dark:text-[#8896A8] bg-white dark:bg-[#0B1B2E] hover:bg-[#F5F9FF] dark:hover:bg-[#1E3A5F] active:scale-[0.98] transition-all cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" disabled={salvando} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:opacity-90 active:scale-[0.98] rounded-xl shadow-[0_4px_12px_rgba(74,158,245,0.25)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60">
                            {salvando && <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>}
                            Salvar Configuração
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// ─── Linha da tabela IXC ──────────────────────────────────────────
function RowCompacto({ row, onConfigurar, selecionada, onSelecionar, isAdmin }) {
    const tech = TECH_STYLES[row.tecnologia] || null;
    const stat = STATUS_BAR[row.status] || null;

    return (
        <div
            onClick={() => onSelecionar(`${row.cidade_ixc_id}::${row.bairro}`)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-2 border ${
                selecionada 
                    ? 'bg-[#1F5BA8]/10 border-[#1F5BA8]/30' 
                    : 'border-transparent hover:bg-[#F5F9FF] dark:bg-[#0B1B2E]/70'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded bg-[#1F5BA8]/10 flex items-center justify-center text-[#1F5BA8] dark:text-[#4A9EF5] font-bold shrink-0 text-[10px]">
                        {row.estado}
                    </div>
                    <div className="truncate">
                        <p className="text-xs font-bold text-[#0B1B2E] dark:text-[var(--foreground)] truncate">{row.cidade}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{row.bairro}</p>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfigurar(row);
                        }}
                        title={row.tem_override ? 'Editar configuração' : 'Configurar dados de cobertura'}
                        className={`p-1 rounded-lg shrink-0 transition-all duration-200 ${
                            row.tem_override
                                ? 'text-slate-400 dark:text-slate-500 hover:text-[#1F5BA8] dark:hover:text-[#4A9EF5] hover:bg-[#F5F9FF] dark:bg-[#0B1B2E]'
                                : 'text-[#1F5BA8] dark:text-[#4A9EF5] hover:bg-[#1F5BA8]/10'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {row.tem_override ? 'edit' : 'tune'}
                        </span>
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between text-[10px]">
                {/* Tech Badge */}
                {tech ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${tech.cls}`}>
                        <span className="material-symbols-outlined text-[11px]">{tech.icon}</span>
                        {row.tecnologia}
                    </span>
                ) : (
                    <span className="text-slate-400 italic">Sem tech</span>
                )}

                {/* Speed */}
                <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">
                    {row.velocidade_maxima || '—'}
                </span>

                {/* Contratos */}
                <span className="text-slate-500 font-bold bg-[#F5F9FF]/80 dark:bg-[#0B1B2E]/50 border border-[#E4ECF5] dark:border-[var(--border)] px-1.5 py-0.5 rounded">
                    {row.total_contratos} contr.
                </span>
            </div>

            {/* Status progress bar */}
            {stat && (
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold">
                        <span>{row.status}</span>
                        <span className={stat.textCls}>{row.percentual_cobertura}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E4ECF5] dark:bg-[#1E3A5F] rounded-full overflow-hidden">
                        <div className={`h-full ${stat.barCls} transition-all`} style={{ width: `${row.percentual_cobertura}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────
export default function Coverage({ user }) {
    const isAdmin = user?.is_admin;
    const [dados, setDados] = useState([]);
    const [dadosFiltrados, setDadosFiltrados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [buscaInput, setBuscaInput] = useState('');
    const [filtroTec, setFiltroTec] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [page, setPage] = useState(1);
    const [modalOverride, setModalOverride] = useState(null);
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [sidebarAberta, setSidebarAberta] = useState(true);
    // Metadados de auditoria vindos do backend (paginação + contratos sem localização)
    const [metaAuditoria, setMetaAuditoria] = useState(null);
    const LIMIT = 6;

    const carregar = useCallback(async () => {
        setCarregando(true);
        try {
            const resp = await fetch('/api/cobertura-ixc');
            const json = await resp.json();
            if (json.sucesso) {
                setDados(json.dados || []);
                // Salvar metadados de auditoria (paginação, sem localização)
                if (json.meta) setMetaAuditoria(json.meta);
            }
        } catch (e) {
            console.error('Erro ao carregar cobertura IXC:', e);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    // Filtrar localmente (dados já vêm completos)
    useEffect(() => {
        let filtrado = [...dados];
        if (busca) {
            const b = busca.toLowerCase();
            filtrado = filtrado.filter(r =>
                r.cidade?.toLowerCase().includes(b) || r.bairro?.toLowerCase().includes(b)
            );
        }
        if (filtroTec) filtrado = filtrado.filter(r => r.tecnologia === filtroTec);
        if (filtroStatus) filtrado = filtrado.filter(r => r.status === filtroStatus);
        setDadosFiltrados(filtrado);
        setPage(1);
    }, [dados, busca, filtroTec, filtroStatus]);

    const totalPaginas = Math.ceil(dadosFiltrados.length / LIMIT);
    const pagAtual = dadosFiltrados.slice((page - 1) * LIMIT, page * LIMIT);

    // Stats resumo
    const totalComConfig = dados.filter(d => d.tem_override).length;
    const totalSemConfig = dados.length - totalComConfig;
    const cidadesUnicas = new Set(dados.map(d => d.cidade_ixc_id)).size;

    const handleSalvarOverride = () => {
        setModalOverride(null);
        carregar();
    };

    const limparFiltros = () => { setBusca(''); setBuscaInput(''); setFiltroTec(''); setFiltroStatus(''); setPage(1); };

    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-6 py-6 overflow-hidden bg-[#F5F9FF] dark:bg-[#0B1B2E] text-[#0B1B2E] dark:text-[var(--foreground)]">
            <div className="layout-content-container flex flex-col h-full w-full max-w-[1400px] mx-auto relative gap-4">


                {/* Card de alerta — contratos sem localização cadastrada no IXC */}
                {isAdmin && !carregando && metaAuditoria && metaAuditoria.total_sem_localizacao > 0 && (
                    <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50 rounded-xl px-5 py-3 shadow-sm shrink-0">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">location_off</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                                {metaAuditoria.total_sem_localizacao.toLocaleString('pt-BR')} contratos sem localização cadastrada no IXC (cidade_id = 0). Eles não são exibidos no mapa.
                            </p>
                        </div>
                    </div>
                )}

                {/* Central de Controle NOC Wrapper */}
                <div className="relative w-full flex-grow min-h-[500px] md:min-h-[600px] rounded-3xl overflow-hidden border border-[#E4ECF5] dark:border-[var(--border)] shadow-xl bg-slate-900">
                    
                    {/* Mapa de Cobertura (Fundo) */}
                    {!carregando && dados.length > 0 && (
                        <CoverageMap
                            dados={dados}
                            cidadeSelecionada={cidadeSelecionada}
                            onCidadeClick={setCidadeSelecionada}
                        />
                    )}

                    {/* Barra de Controle Superior Flutuante */}
                    <div className="absolute top-4 left-4 right-4 z-[10] bg-white/80 dark:bg-[#0B1B2E]/80 backdrop-blur-md border border-[#E4ECF5]/30 dark:border-[var(--border)]/30 shadow-lg rounded-2xl px-5 py-3 flex flex-wrap justify-between items-center gap-4 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#1F5BA8]/10 text-[#1F5BA8] dark:text-[#4A9EF5] rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">map</span>
                            </div>
                            <div>
                                <h1 className="text-[#0B1B2E] dark:text-[var(--foreground)] text-base md:text-lg font-bold leading-tight">
                                    Central de Cobertura de Rede
                                </h1>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    Gestão e monitoramento por região de contratos do IXC
                                </p>
                            </div>
                        </div>

                        {/* Filtros Integrados */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center gap-2 bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-[#4A9EF5] focus-within:border-transparent transition-all">
                                <span className="material-symbols-outlined text-[#1F5BA8] dark:text-[#4A9EF5] text-[16px]">search</span>
                                <input
                                    className="bg-transparent text-xs text-[#0B1B2E] dark:text-[var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none w-28 md:w-40"
                                    placeholder="Buscar cidade/bairro"
                                    value={buscaInput}
                                    onChange={e => setBuscaInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && setBusca(buscaInput)}
                                />
                            </div>

                            <select
                                className="flex h-8.5 items-center rounded-xl bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5] dark:border-[var(--border)] px-2.5 text-xs text-[#0B1B2E] dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] transition-all"
                                value={filtroTec}
                                onChange={e => setFiltroTec(e.target.value)}
                            >
                                <option value="" className="dark:bg-[#0B1B2E]">Tecnologia: Todas</option>
                                {TECNOLOGIAS.map(t => <option key={t} value={t} className="dark:bg-[#0B1B2E]">{t}</option>)}
                            </select>

                            <select
                                className="flex h-8.5 items-center rounded-xl bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5] dark:border-[var(--border)] px-2.5 text-xs text-[#0B1B2E] dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] transition-all"
                                value={filtroStatus}
                                onChange={e => setFiltroStatus(e.target.value)}
                            >
                                <option value="" className="dark:bg-[#0B1B2E]">Status: Todos</option>
                                {STATUS_OPCOES.map(s => <option key={s} value={s} className="dark:bg-[#0B1B2E]">{s}</option>)}
                            </select>

                            {(busca || filtroTec || filtroStatus) && (
                                <button onClick={limparFiltros} className="text-[#1F5BA8] dark:text-[#4A9EF5] hover:text-[#4A9EF5] dark:hover:text-[#F5F9FF] text-xs font-bold uppercase transition-colors">
                                    Limpar
                                </button>
                            )}
                        </div>

                        {/* Botão Sync */}
                        <button
                            onClick={carregar}
                            disabled={carregando}
                            className="flex items-center justify-center gap-2 h-8.5 px-4 bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-xl text-white text-xs font-bold shadow-[0_4px_12px_rgba(74,158,245,0.25)] disabled:opacity-60"
                        >
                            <span className={`material-symbols-outlined text-[16px] ${carregando ? 'animate-spin' : ''}`}>sync</span>
                            <span>{carregando ? 'Sincronizando...' : 'Sincronizar'}</span>
                        </button>
                    </div>

                    {/* Botão Toggle da Sidebar */}
                    <button
                        onClick={() => setSidebarAberta(!sidebarAberta)}
                        className="absolute top-[88px] z-[20] size-9 rounded-xl bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] shadow-lg flex items-center justify-center text-[#1F5BA8] dark:text-[#4A9EF5] hover:bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 transition-all duration-300"
                        style={{ transform: sidebarAberta ? 'translateX(326px)' : 'translateX(16px)' }}
                        title={sidebarAberta ? 'Recolher Painel' : 'Expandir Painel'}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {sidebarAberta ? 'chevron_left' : 'chevron_right'}
                        </span>
                    </button>

                    {/* Painel Lateral Flutuante */}
                    <div 
                        className={`absolute top-[88px] bottom-4 left-4 z-[10] w-[310px] max-w-[calc(100vw-32px)] bg-white/90 dark:bg-[#0B1B2E]/90 backdrop-blur-md border border-[#E4ECF5]/30 dark:border-[var(--border)]/30 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ${
                            sidebarAberta ? 'translate-x-0 opacity-100' : '-translate-x-[330px] opacity-0 pointer-events-none'
                        }`}
                    >
                        <div className="px-4 py-3 border-b border-[#E4ECF5]/40 dark:border-[var(--border)]/40 flex justify-between items-center">
                            <span className="text-[#0B1B2E] dark:text-[var(--foreground)] font-bold text-xs">Cidades e Bairros ({dadosFiltrados.length})</span>
                            {carregando && (
                                <span className="material-symbols-outlined text-[#1F5BA8] text-[14px] animate-spin">autorenew</span>
                            )}
                        </div>

                        {/* Lista de itens compacta */}
                        <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5 custom-scrollbar">
                            {carregando && pagAtual.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                                    <span className="material-symbols-outlined text-4xl animate-spin block mb-2">autorenew</span>
                                    Buscando cidades no IXC...
                                </div>
                            ) : pagAtual.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                                    <span className="material-symbols-outlined text-4xl block mb-2">location_off</span>
                                    Nenhuma cidade/bairro.
                                </div>
                            ) : pagAtual.map((row, i) => (
                                <RowCompacto
                                    key={`${row.cidade_ixc_id}::${row.bairro}::${i}`}
                                    row={row}
                                    onConfigurar={setModalOverride}
                                    selecionada={`${row.cidade_ixc_id}::${row.bairro}` === cidadeSelecionada}
                                    onSelecionar={setCidadeSelecionada}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>

                        {/* Paginação da Sidebar */}
                        <div className="px-3.5 py-2.5 border-t border-[#E4ECF5]/40 dark:border-[var(--border)]/40 bg-[#F5F9FF]/50 dark:bg-[#0B1B2E]/30 rounded-b-2xl flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                {page} de {totalPaginas || 1}
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-1 border border-[#E4ECF5] dark:border-[var(--border)] rounded-lg bg-white dark:bg-[#0B1B2E] text-slate-600 dark:text-[#8896A8] disabled:opacity-40 hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm block">chevron_left</span>
                                </button>
                                <button
                                    disabled={page >= totalPaginas}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1 border border-[#E4ECF5] dark:border-[var(--border)] rounded-lg bg-white dark:bg-[#0B1B2E] text-slate-600 dark:text-[#8896A8] disabled:opacity-40 hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm block">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Resumo Bento Flutuante (Bottom-Right) */}
                    {isAdmin && !carregando && dados.length > 0 && (
                        <div className="absolute bottom-4 right-4 z-[10] bg-white/95 dark:bg-[#0B1B2E]/95 backdrop-blur-md border border-[#E4ECF5]/30 dark:border-[var(--border)]/30 shadow-2xl rounded-2xl p-4 flex flex-col gap-2 max-w-[220px] transition-all duration-300">
                            <span className="text-[9px] font-bold text-[#1F5BA8] dark:text-[#4A9EF5] uppercase tracking-wider">Estatísticas Gerais</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5]/50 dark:border-[var(--border)]/50 rounded-xl p-2 flex flex-col">
                                    <span className="text-[9px] text-slate-400 font-medium">Cidades</span>
                                    <span className="text-base font-black text-[#0B1B2E] dark:text-[var(--foreground)] leading-tight mt-0.5">{cidadesUnicas}</span>
                                </div>
                                <div className="bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5]/50 dark:border-[var(--border)]/50 rounded-xl p-2 flex flex-col">
                                    <span className="text-[9px] text-slate-400 font-medium">Regiões</span>
                                    <span className="text-base font-black text-[#0B1B2E] dark:text-[var(--foreground)] leading-tight mt-0.5">{dados.length}</span>
                                </div>
                                <div className="bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 border border-[#E4ECF5]/50 dark:border-[var(--border)]/50 rounded-xl p-2 flex flex-col col-span-2">
                                    <span className="text-[9px] text-slate-400 font-medium">Configuradas (Override)</span>
                                    <span className="text-xs font-bold text-[#0B1B2E] dark:text-[var(--foreground)] leading-tight mt-0.5">{totalComConfig} / {dados.length}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Override */}
            {modalOverride && (
                <OverrideModal
                    registro={modalOverride}
                    onFechar={() => setModalOverride(null)}
                    onSalvar={handleSalvarOverride}
                />
            )}
        </main>
    );
}
