import React, { useState, useEffect, useCallback, useRef } from 'react';
import CoverageMap from './CoverageMap';

// ─── Constantes ───────────────────────────────────────────────────
const TECNOLOGIAS = ['FTTH', 'Rádio', 'UTP'];
const STATUS_OPCOES = ['Ativo', 'Expansão', 'Inativo'];
const VELOCIDADES = ['10 MEGA', '20 MEGA', '50 MEGA', '100 MEGA', '200 MEGA', '300 MEGA', '500 MEGA', '1 GIGA'];

const TECH_STYLES = {
    FTTH:  { cls: 'bg-purple-100 text-purple-700', icon: 'fiber_manual_record' },
    Rádio: { cls: 'bg-blue-100 text-blue-700',     icon: 'settings_input_antenna' },
    UTP:   { cls: 'bg-green-100 text-green-700',   icon: 'cable' },
};

const STATUS_BAR = {
    Ativo:    { barCls: 'bg-green-500',  textCls: 'text-green-600' },
    Expansão: { barCls: 'bg-blue-500',   textCls: 'text-blue-500' },
    Inativo:  { barCls: 'bg-red-400',    textCls: 'text-red-500' },
};

// ─── Mini-mapa para seleção de coordenadas ────────────────────────
function MapaPicker({ lat, lng, onChange }) {
    const containerRef = useRef(null);
    const mapRef       = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        import('leaflet').then(({ default: L }) => {
            const center = (lat && lng) ? [lat, lng] : [-10.5, -36.5];
            const zoom   = (lat && lng) ? 14 : 9;
            const map = L.map(containerRef.current, { center, zoom, zoomControl: true });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 18,
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
        });
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

    return <div ref={containerRef} style={{ height: '240px', width: '100%', borderRadius: '8px' }} />;
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
            <div className="bg-white dark:bg-[#1a130b] rounded-2xl shadow-2xl w-full max-w-lg border border-[#f4eee6] my-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4eee6]">
                    <div>
                        <h3 className="text-[#1d150c] dark:text-white font-bold text-lg">Configurar Cobertura</h3>
                        <p className="text-xs text-[#a17745] dark:text-orange-300 mt-0.5">
                            {registro.cidade} — {registro.bairro}
                        </p>
                    </div>
                    <button onClick={onFechar} className="text-[#a17745] dark:text-orange-300 hover:text-primary p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-2 gap-4">
                    {/* Info somente leitura */}
                    <div className="col-span-2 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-lg px-4 py-3 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300">info</span>
                        <div>
                            <p className="text-xs text-[#a17745] dark:text-orange-300">
                                Cidade e bairro são gerados automaticamente pelo IXC.
                            </p>
                            <p className="text-xs text-[#a17745] dark:text-orange-300 font-semibold mt-0.5">
                                {registro.total_contratos} contrato(s) ativo(s) neste bairro
                            </p>
                        </div>
                    </div>

                    {/* Tecnologia */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">Tecnologia</label>
                        <select
                            className="border border-[#f4eee6] rounded-lg px-3 py-2 text-sm text-[#1d150c] dark:text-white dark:bg-[#2c2217] focus:outline-none focus:ring-2 focus:ring-primary"
                            value={form.tecnologia}
                            onChange={e => handleChange('tecnologia', e.target.value)}
                        >
                            {TECNOLOGIAS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Velocidade */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">Veloc. Máxima</label>
                        <select
                            className="border border-[#f4eee6] rounded-lg px-3 py-2 text-sm text-[#1d150c] dark:text-white dark:bg-[#2c2217] focus:outline-none focus:ring-2 focus:ring-primary"
                            value={form.velocidade_maxima}
                            onChange={e => handleChange('velocidade_maxima', e.target.value)}
                        >
                            {VELOCIDADES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">Status</label>
                        <select
                            className="border border-[#f4eee6] rounded-lg px-3 py-2 text-sm text-[#1d150c] dark:text-white dark:bg-[#2c2217] focus:outline-none focus:ring-2 focus:ring-primary"
                            value={form.status}
                            onChange={e => handleChange('status', e.target.value)}
                        >
                            {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Percentual */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">
                            Cobertura: <span className="text-primary font-bold">{form.percentual_cobertura}%</span>
                        </label>
                        <input
                            type="range" min={0} max={100} step={1}
                            className="accent-primary mt-2"
                            value={form.percentual_cobertura}
                            onChange={e => handleChange('percentual_cobertura', e.target.value)}
                        />
                    </div>

                    {/* ─── Seção Localização ─── */}
                    <div className="col-span-2 border-t border-[#f4eee6] pt-3">
                        <button
                            type="button"
                            onClick={() => setMapaAberto(v => !v)}
                            className="flex items-center gap-2 text-sm font-semibold text-[#a17745] dark:text-orange-300 hover:text-primary transition-colors mb-3"
                        >
                            <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                            Localização do Bairro
                            <span className="material-symbols-outlined text-[16px]">
                                {mapaAberto ? 'expand_less' : 'expand_more'}
                            </span>
                            {coordsValidas && (
                                <span className="ml-1 text-xs text-green-600 font-normal">✓ definida</span>
                            )}
                        </button>

                        {/* Campos de texto lat/lng */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">Latitude</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="-9.9170800"
                                    className="border border-[#f4eee6] rounded-lg px-3 py-2 text-sm text-[#1d150c] dark:text-white dark:bg-[#2c2217] focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                    value={form.latitude}
                                    onChange={e => handleCoordChange('latitude', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide">Longitude</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="-36.5560000"
                                    className="border border-[#f4eee6] rounded-lg px-3 py-2 text-sm text-[#1d150c] dark:text-white dark:bg-[#2c2217] focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                    value={form.longitude}
                                    onChange={e => handleCoordChange('longitude', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Mini-mapa colapsável */}
                        {mapaAberto && (
                            <div className="rounded-xl overflow-hidden border border-[#f4eee6]">
                                <div className="bg-[#fcfaf8] dark:bg-[#2c2217] px-3 py-2 text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1">
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
                        <div className="col-span-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                            {erro}
                        </div>
                    )}

                    <div className="col-span-2 flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onFechar} className="px-4 py-2 text-sm border border-[#f4eee6] rounded-lg text-[#a17745] dark:text-orange-300 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={salvando} className="px-5 py-2 text-sm bg-primary hover:bg-[#cc7000] text-white rounded-lg font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
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
function RowIXC({ row, onConfigurar, selecionada, onSelecionar }) {
    const tech = TECH_STYLES[row.tecnologia] || null;
    const stat = STATUS_BAR[row.status] || null;

    return (
        <tr
            onClick={() => onSelecionar(`${row.cidade_ixc_id}::${row.bairro}`)}
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2217] transition-colors ${
                selecionada ? 'ring-2 ring-inset ring-primary/40 bg-primary/5 dark:bg-primary/10' : ''
            }`}
        >
            <td className="px-6 py-4 font-medium text-[#1d150c] dark:text-white">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-xs">
                        {row.estado}
                    </div>
                    <div>
                        <span>{row.cidade}</span>
                        <span className="ml-2 text-xs text-[#a17745] dark:text-orange-300">
                            #{row.cidade_ixc_id}
                        </span>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-[#a17745] dark:text-orange-300">{row.bairro}</td>

            {/* Tecnologia */}
            <td className="px-6 py-4">
                {tech ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tech.cls}`}>
                        <span className="material-symbols-outlined text-[14px]">{tech.icon}</span>
                        {row.tecnologia}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#a17745] dark:text-orange-300 italic">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        Não definido
                    </span>
                )}
            </td>

            {/* Velocidade */}
            <td className="px-6 py-4 font-semibold text-[#1d150c] dark:text-white">
                {row.velocidade_maxima || <span className="text-[#a17745] dark:text-orange-300 italic text-xs">—</span>}
            </td>

            {/* Status + Barra */}
            <td className="px-6 py-4">
                {stat ? (
                    <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between text-xs text-[#a17745] dark:text-orange-300">
                            <span>{row.status}</span>
                            <span className={`font-bold ${stat.textCls}`}>{row.percentual_cobertura}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-[#3a2c20] rounded-full overflow-hidden">
                            <div className={`h-full ${stat.barCls} transition-all`} style={{ width: `${row.percentual_cobertura}%` }} />
                        </div>
                    </div>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#a17745] dark:text-orange-300 italic">
                        <span className="material-symbols-outlined text-[14px]">settings</span>
                        Configurar
                    </span>
                )}
            </td>

            {/* Contratos */}
            <td className="px-6 py-4 text-center">
                <span className="text-xs font-semibold text-[#1d150c] dark:text-white bg-gray-100 dark:bg-[#2c2217] px-2 py-1 rounded-full">
                    {row.total_contratos}
                </span>
            </td>

            {/* Ações */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onConfigurar(row)}
                    title={row.tem_override ? 'Editar configuração' : 'Configurar dados de cobertura'}
                    className={`transition-colors p-1 rounded-full flex items-center justify-center ml-auto ${row.tem_override
                        ? 'text-[#a17745] dark:text-orange-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-[#3a2c20]'
                        : 'text-primary hover:bg-primary/10'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {row.tem_override ? 'edit' : 'tune'}
                    </span>
                </button>
            </td>
        </tr>
    );
}

// ─── Componente Principal ─────────────────────────────────────────
export default function Coverage() {
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
    const LIMIT = 15;

    const carregar = useCallback(async () => {
        setCarregando(true);
        try {
            const resp = await fetch('/api/cobertura-ixc');
            const json = await resp.json();
            if (json.sucesso) setDados(json.dados || []);
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
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">

                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            Mapa de Cobertura de Rede
                        </h1>
                        <p className="text-[#a17745] dark:text-orange-300 text-base font-normal max-w-2xl">
                            Cidades e bairros atendidos detectados automaticamente via contratos ativos no IXC. Configure tecnologia, velocidade e percentual por região.
                        </p>
                    </div>
                    <button
                        onClick={carregar}
                        disabled={carregando}
                        className="flex items-center justify-center gap-2 h-10 px-5 bg-primary hover:bg-[#cc7000] transition-colors rounded-lg text-white text-sm font-bold shadow-sm hover:shadow-md disabled:opacity-60"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${carregando ? 'animate-spin' : ''}`}>sync</span>
                        <span>{carregando ? 'Sincronizando...' : 'Sincronizar IXC'}</span>
                    </button>
                </div>

                {/* Cards de resumo */}
                {!carregando && dados.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: 'location_city', label: 'Cidades Atendidas', valor: cidadesUnicas, cor: 'text-primary' },
                            { icon: 'home_pin', label: 'Combos Cidade+Bairro', valor: dados.length, cor: 'text-blue-600' },
                            { icon: 'check_circle', label: 'Configurados', valor: totalComConfig, cor: 'text-green-600' },
                            { icon: 'pending', label: 'Sem Configuração', valor: totalSemConfig, cor: 'text-orange-500' },
                        ].map((c, i) => (
                            <div key={i} className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#f4eee6] px-5 py-4 flex items-center gap-4 shadow-sm">
                                <div className="p-2 bg-gray-100 dark:bg-[#2c2217] rounded-lg">
                                    <span className={`material-symbols-outlined ${c.cor} text-[24px]`}>{c.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-[#a17745] dark:text-orange-300 font-medium">{c.label}</p>
                                    <p className="text-xl font-black text-[#1d150c] dark:text-white">{c.valor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mapa de Cobertura */}
                {!carregando && dados.length > 0 && (
                    <CoverageMap
                        dados={dados}
                        cidadeSelecionada={cidadeSelecionada}
                        onCidadeClick={setCidadeSelecionada}
                    />
                )}

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 mb-6 items-center bg-white dark:bg-[#1a130b] p-4 rounded-xl shadow-sm border border-[#f4eee6]">
                    <span className="text-[#a17745] dark:text-orange-300 text-sm font-semibold uppercase tracking-wider mr-2">FILTROS:</span>

                    <div className="flex items-center gap-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#f4eee6] rounded-lg px-3 h-9">
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-[18px]">search</span>
                        <input
                            className="bg-transparent text-sm text-[#1d150c] dark:text-white placeholder:text-[#a17745] focus:outline-none w-36"
                            placeholder="Cidade ou bairro"
                            value={buscaInput}
                            onChange={e => setBuscaInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && setBusca(buscaInput)}
                        />
                    </div>

                    <select
                        className="flex h-9 items-center rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#f4eee6] px-3 text-sm text-[#1d150c] dark:text-white focus:outline-none"
                        value={filtroTec}
                        onChange={e => setFiltroTec(e.target.value)}
                    >
                        <option value="">Tecnologia: Todas</option>
                        {TECNOLOGIAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        className="flex h-9 items-center rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#f4eee6] px-3 text-sm text-[#1d150c] dark:text-white focus:outline-none"
                        value={filtroStatus}
                        onChange={e => setFiltroStatus(e.target.value)}
                    >
                        <option value="">Status: Todos</option>
                        {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="ml-auto flex items-center">
                        <button onClick={limparFiltros} className="text-primary text-sm font-medium hover:underline">Limpar Filtros</button>
                    </div>
                </div>

                {/* Tabela */}
                <div className="bg-white dark:bg-[#1a130b] rounded-xl shadow-sm border border-[#f4eee6] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#f4eee6] flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-[#1d150c] dark:text-white text-xl font-bold">Cidades com Cobertura</h2>
                            <p className="text-xs text-[#a17745] dark:text-orange-300 mt-0.5">
                                Fonte: contratos ativos no IXC · Clique em <span className="font-bold">tune</span> para configurar os campos manuais
                            </p>
                        </div>
                        {carregando && (
                            <span className="material-symbols-outlined text-[#a17745] text-[20px] animate-spin">autorenew</span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fcfaf8] dark:bg-[#2c2217] text-[#a17745] dark:text-orange-300 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 whitespace-nowrap">REGIÃO / CIDADE</th>
                                    <th className="px-6 py-4 whitespace-nowrap">BAIRRO</th>
                                    <th className="px-6 py-4 whitespace-nowrap">TECNOLOGIA</th>
                                    <th className="px-6 py-4 whitespace-nowrap">VELOC. MÁXIMA</th>
                                    <th className="px-6 py-4 whitespace-nowrap">STATUS / COBERTURA</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">CONTRATOS</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4eee6] text-sm">
                                {carregando && pagAtual.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-[#a17745] dark:text-orange-300">
                                            <span className="material-symbols-outlined text-5xl animate-spin block mx-auto mb-3">autorenew</span>
                                            Buscando cidades no IXC...
                                        </td>
                                    </tr>
                                ) : pagAtual.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-[#a17745] dark:text-orange-300">
                                            <span className="material-symbols-outlined text-5xl block mx-auto mb-3">location_off</span>
                                            Nenhuma cidade encontrada com os filtros aplicados.
                                        </td>
                                    </tr>
                                ) : pagAtual.map((row, i) => (
                                    <RowIXC
                                        key={`${row.cidade_ixc_id}::${row.bairro}::${i}`}
                                        row={row}
                                        onConfigurar={setModalOverride}
                                        selecionada={`${row.cidade_ixc_id}::${row.bairro}` === cidadeSelecionada}
                                        onSelecionar={setCidadeSelecionada}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <div className="px-6 py-4 border-t border-[#f4eee6] bg-gray-50 dark:bg-[#1a130b] flex items-center justify-between flex-wrap gap-3">
                        <p className="text-sm text-[#a17745] dark:text-orange-300">
                            Mostrando {dadosFiltrados.length > 0 ? ((page - 1) * LIMIT + 1) : 0} a {Math.min(page * LIMIT, dadosFiltrados.length)} de {dadosFiltrados.length} entradas
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                            >
                                Anterior
                            </button>
                            {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-1 text-sm border border-[#f4eee6] rounded transition-colors ${p === page ? 'bg-primary text-white' : 'bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white hover:bg-gray-100'}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                disabled={page >= totalPaginas}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
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
