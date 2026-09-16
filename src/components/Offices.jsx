import { useEffect, useRef, useState, useMemo, useId } from 'react';
import 'leaflet/dist/leaflet.css';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../hooks/useDismissable';
import { tone } from '../utils/tone';
import { fundoHero } from './ui/heroGradiente';

// ─── Helpers de mapa ────────────────────────────────────────────────────────

function criarIcone(L, cor, selecionado, isMatriz) {
    const w = isMatriz ? (selecionado ? 30 : 22) : (selecionado ? 26 : 18);
    const h = w * 1.5;
    const innerR = isMatriz ? 6 : 5;
    const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${w}" height="${h}">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="${cor}" stroke="white" stroke-width="1.8"/>
        <circle cx="12" cy="12" r="${innerR}" fill="white" opacity="0.9"/>
        ${isMatriz ? `<circle cx="12" cy="12" r="3" fill="${cor}" opacity="0.7"/>` : ''}
    </svg>`;
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgRaw);
    return L.icon({ iconUrl: url, iconSize: [w, h], iconAnchor: [w / 2, h], popupAnchor: [0, -h] });
}

function popupHTML(office) {
    const badgeColor = office.tipo === 'Matriz' ? '#F97316' : (office.estado === 'AL' ? '#3B82F6' : '#10B981');
    const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${office.lat},${office.lng}`;
    const mapsUrl = `https://www.google.com/maps?q=${office.lat},${office.lng}`;
    return `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;max-width:220px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <strong style="font-size:13px;color:#0B1B2E">${office.nome}</strong>
            </div>
            <span style="display:inline-block;background:${badgeColor};color:white;font-size:10px;font-weight:700;padding:1px 7px;border-radius:999px;margin-bottom:6px">
                ${office.tipo.toUpperCase()}
            </span>
            <div style="font-size:11px;color:#475467;line-height:1.5">
                <div>📍 ${office.endereco}</div>
                ${office.cep ? `<div style="color:#9A3412;font-weight:600">CEP: ${office.cep}</div>` : ''}
                <div style="margin-top:2px;color:#8896A8">${office.cidade} — ${office.estado}</div>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
                <a href="${streetViewUrl}" target="_blank" rel="noopener noreferrer"
                   style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:#9A3412;color:white;font-size:10px;font-weight:600;padding:5px 8px;border-radius:6px;text-decoration:none">
                    🔭 Street View
                </a>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                   style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:#FFF7ED;color:#9A3412;font-size:10px;font-weight:600;padding:5px 8px;border-radius:6px;text-decoration:none">
                    🗺️ Ver no Maps
                </a>
            </div>
        </div>
    `;
}

// ─── Modal CRUD ─────────────────────────────────────────────────────────────

const FORM_VAZIO = {
    nome: '', tipo: 'Filial', cidade: '', estado: 'AL',
    endereco: '', cep: '', lat: '', lng: '', cor: '#3B82F6',
};

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

function KpiTile({ label, value, icon }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="material-symbols-outlined shrink-0 text-white/70 text-[18px]" aria-hidden="true">{icon}</span>
            <div className="min-w-0">
                <div className={LABEL_MONO}>{label}</div>
                <div className="mt-0.5 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">{value}</div>
            </div>
        </div>
    );
}

function OfficesHero({ total, contAL, contSE, matriz, onAdd, isAdmin }) {
    const C = useBentoTheme();
    const kpis = [
        { label: 'Unidades', value: total, icon: 'apartment' },
        { label: 'Alagoas', value: contAL, icon: 'location_on' },
        { label: 'Sergipe', value: contSE, icon: 'location_on' },
        { label: 'Matriz', value: matriz, icon: 'star' },
    ];

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: fundoHero(C),
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="offices-hero-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#offices-hero-grid)" />
            </svg>

            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={LABEL_MONO}>Rede de Atendimento</div>
                        <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                            Escritórios Prestek
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Visualize no mapa e gerencie as unidades da empresa.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={onAdd}
                            className="inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold shadow-sm transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            style={{ background: C.surface, color: C.accentDeep }}
                        >
                            <span className="material-symbols-outlined text-[18px]">add_location</span>
                            Adicionar Escritório
                        </button>
                    )}
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={LABEL_MONO}>Rede</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {kpis.map(k => <KpiTile key={k.label} {...k} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EscritorioModal({ escritorio, onSalvar, onFechar }) {
    const C = useBentoTheme();
    const dialogRef = useRef(null);
    const tituloId = useId();
    const idPrefix = useId();
    const fieldId = (nome) => `${idPrefix}-${nome}`;

    // Sem isso o modal não tinha NENHUMA semântica de diálogo: só o Escape
    // funcionava (via handler global do componente pai). Mesmo padrão
    // (useDismissable + trap de Tab local) já usado em ModalShell.jsx/
    // OrgChartEditor.jsx/ServicesDirectory.jsx.
    useDismissable(dialogRef, { open: true, onClose: onFechar, lockScroll: true, closeOnOutside: true });
    const trapTab = makeTrapTab(dialogRef);

    const isEdicao = Boolean(escritorio?.id);
    const [form, setForm] = useState(() => {
        if (!escritorio) return FORM_VAZIO;
        return {
            nome: escritorio.nome,
            tipo: escritorio.tipo,
            cidade: escritorio.cidade,
            estado: escritorio.estado,
            endereco: escritorio.endereco || '',
            cep: escritorio.cep || '',
            lat: String(escritorio.lat),
            lng: String(escritorio.lng),
            cor: escritorio.cor || '#3B82F6',
        };
    });
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [linkMaps, setLinkMaps] = useState('');
    const [extraindo, setExtraindo] = useState(false);
    const [erroLink, setErroLink] = useState('');

    function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })); setErro(''); }

    async function extrairCoordenadas() {
        if (!linkMaps.trim()) return;
        setExtraindo(true);
        setErroLink('');
        try {
            const res = await fetch('/api/resolve-maps-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: linkMaps.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setErroLink(data.erro || 'Erro ao resolver o link.'); return; }
            setForm(f => ({ ...f, lat: data.lat, lng: data.lng }));
            setErroLink('');
        } catch {
            setErroLink('Falha de rede ao resolver o link.');
        } finally {
            setExtraindo(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.nome.trim()) return setErro('Nome é obrigatório.');
        if (!form.cidade.trim()) return setErro('Cidade é obrigatória.');
        if (isNaN(parseFloat(form.lat)) || isNaN(parseFloat(form.lng))) return setErro('Latitude e Longitude devem ser números válidos.');

        const payload = {
            nome: form.nome.trim(),
            tipo: form.tipo,
            cidade: form.cidade.trim(),
            estado: form.estado,
            endereco: form.endereco.trim(),
            cep: form.cep.trim(),
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            cor: form.cor,
        };

        setSalvando(true);
        try {
            await onSalvar(payload);
        } finally {
            setSalvando(false);
        }
    }

    const inputStyle = { border: `1px solid ${C.line}`, background: C.surfaceSoft, color: C.ink };
    const labelCls = "block text-[10px] font-extrabold uppercase tracking-widest mb-1.5";
    const inputCls = "w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all";
    const ctaGradient = { background: `linear-gradient(to right, ${C.accentDeep}, ${C.accent})`, color: C.onAccent, boxShadow: `0 4px 12px ${tone(C.accent, 0.2)}` };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 backdrop-blur-sm" style={{ background: tone(C.ink, 0.6) }} />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                onKeyDown={trapTab}
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border shadow-2xl"
                style={{ background: C.surface, borderColor: C.line }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.line, background: C.surfaceSoft }}>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg p-2" style={{ background: C.accentSoft }}>
                            <span className="material-symbols-outlined text-xl" style={{ color: C.accentDark }}>
                                {isEdicao ? 'edit_location' : 'add_location'}
                            </span>
                        </div>
                        <div>
                            <h2 id={tituloId} className="font-display font-bold text-xl" style={{ color: C.ink }}>
                                {isEdicao ? 'Editar Escritório' : 'Novo Escritório'}
                            </h2>
                            {isEdicao && <p className="text-xs font-mono" style={{ color: C.ink2 }}>ID {escritorio.id}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onFechar}
                        aria-label="Fechar"
                        className="rounded-full p-1 transition-colors"
                        style={{ color: C.ink2 }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.dangerFill; e.currentTarget.style.background = C.dangerSoft; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.ink2; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Corpo */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label htmlFor={fieldId('nome')} className={labelCls} style={{ color: C.ink2 }}>Nome *</label>
                            <input id={fieldId('nome')} className={inputCls} style={inputStyle} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: PENEDO/AL (MATRIZ)" />
                        </div>
                        <div>
                            <label htmlFor={fieldId('tipo')} className={labelCls} style={{ color: C.ink2 }}>Tipo *</label>
                            <select id={fieldId('tipo')} className={inputCls} style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                                <option value="Matriz">Matriz</option>
                                <option value="Filial">Filial</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor={fieldId('estado')} className={labelCls} style={{ color: C.ink2 }}>Estado *</label>
                            <select id={fieldId('estado')} className={inputCls} style={inputStyle} value={form.estado} onChange={e => set('estado', e.target.value)}>
                                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor={fieldId('cidade')} className={labelCls} style={{ color: C.ink2 }}>Cidade *</label>
                            <input id={fieldId('cidade')} className={inputCls} style={inputStyle} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: Penedo" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor={fieldId('endereco')} className={labelCls} style={{ color: C.ink2 }}>Endereço</label>
                            <input id={fieldId('endereco')} className={inputCls} style={inputStyle} value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Ex: Av. Duque de Caxias, 253" />
                        </div>
                        <div>
                            <label htmlFor={fieldId('cep')} className={labelCls} style={{ color: C.ink2 }}>CEP</label>
                            <input id={fieldId('cep')} className={inputCls} style={inputStyle} value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
                        </div>
                        <div>
                            <label htmlFor={fieldId('cor')} className={labelCls} style={{ color: C.ink2 }}>Cor do Marcador</label>
                            <div className="flex items-center gap-2">
                                <input id={fieldId('cor')} type="color" value={form.cor} onChange={e => set('cor', e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg bg-transparent p-0.5" style={{ border: `1px solid ${C.line}` }} />
                                <input aria-label="Valor hexadecimal da cor do marcador" className={`${inputCls} flex-1`} style={inputStyle} value={form.cor} onChange={e => set('cor', e.target.value)} placeholder="#3B82F6" />
                            </div>
                        </div>
                        {/* Extrator de coordenadas via link do Google Maps */}
                        <div className="sm:col-span-2">
                            <label htmlFor={fieldId('linkMaps')} className={labelCls} style={{ color: C.ink2 }}>Link do Google Maps</label>
                            <div className="flex gap-2">
                                <input
                                    id={fieldId('linkMaps')}
                                    className={`${inputCls} flex-1`}
                                    style={inputStyle}
                                    value={linkMaps}
                                    onChange={e => { setLinkMaps(e.target.value); setErroLink(''); }}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), extrairCoordenadas())}
                                    placeholder="https://maps.app.goo.gl/..."
                                />
                                <button
                                    type="button"
                                    onClick={extrairCoordenadas}
                                    disabled={!linkMaps.trim() || extraindo}
                                    title="Extrair latitude e longitude do link"
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors hover:brightness-110 disabled:opacity-50"
                                    style={ctaGradient}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {extraindo ? 'sync' : 'my_location'}
                                    </span>
                                    {extraindo ? 'Extraindo…' : 'Extrair'}
                                </button>
                            </div>
                            {erroLink && (
                                <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: C.dangerFill }}>
                                    <span className="material-symbols-outlined text-sm">error</span>{erroLink}
                                </p>
                            )}
                            {!erroLink && form.lat && form.lng && (
                                <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: C.successStrong }}>
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Coordenadas preenchidas automaticamente
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor={fieldId('lat')} className={labelCls} style={{ color: C.ink2 }}>Latitude *</label>
                            <input id={fieldId('lat')} className={inputCls} style={inputStyle} value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-10.2892274" />
                        </div>
                        <div>
                            <label htmlFor={fieldId('lng')} className={labelCls} style={{ color: C.ink2 }}>Longitude *</label>
                            <input id={fieldId('lng')} className={inputCls} style={inputStyle} value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-36.5635948" />
                        </div>
                    </div>
                    {erro && (
                        <p className="flex items-center gap-1 text-sm" style={{ color: C.dangerFill }}>
                            <span className="material-symbols-outlined text-base">error</span>{erro}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: C.line, background: C.surface }}>
                    <button type="button" onClick={onFechar} className="rounded-lg border px-4 py-2 text-sm font-bold transition-colors" style={{ borderColor: C.line, color: C.ink }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={salvando}
                        className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-colors hover:brightness-110 disabled:opacity-60"
                        style={ctaGradient}
                    >
                        <span className="material-symbols-outlined text-[18px]">{isEdicao ? 'save' : 'add_location'}</span>
                        {salvando ? 'Salvando…' : isEdicao ? 'Salvar Alterações' : 'Criar Escritório'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

const LIST_MIN_PX = 200;
const LIST_MAX_PCT = 65;

export default function Offices({ user, setCurrentView }) {
    const C = useBentoTheme();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const corpoRef = useRef(null);
    const isDragging = useRef(false);
    const [mapPronto, setMapPronto] = useState(false);
    const [selecionado, setSelecionado] = useState(null);
    const [filtro, setFiltro] = useState('Todos');
    const [busca, setBusca] = useState('');
    const [offices, setOffices] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregar, setErroCarregar] = useState(false);
    const [modal, setModal] = useState(null);
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);
    const [erroExclusao, setErroExclusao] = useState('');
    const deleteDialogRef = useRef(null);
    const deleteDialogTituloId = useId();
    const [listWidth, setListWidth] = useState(25); // percentual

    const isAdmin = user?.is_admin;

    function startResize(e) {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        function onMove(ev) {
            if (!isDragging.current || !corpoRef.current) return;
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const rect = corpoRef.current.getBoundingClientRect();
            const pct = ((clientX - rect.left) / rect.width) * 100;
            const clamped = Math.min(LIST_MAX_PCT, Math.max((LIST_MIN_PX / rect.width) * 100, pct));
            setListWidth(clamped);
        }

        function onUp() {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
            // Força o mapa a se readaptar ao novo tamanho
            setTimeout(() => mapRef.current?.map?.invalidateSize(), 50);
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    // Busca os escritórios da API
    async function carregarEscritorios() {
        setCarregando(true);
        setErroCarregar(false);
        try {
            const res = await fetch('/api/escritorios');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('Resposta inesperada da API.');
            // Garante que lat/lng são números (o banco retorna strings em alguns drivers)
            setOffices(data.map(o => ({ ...o, lat: parseFloat(o.lat), lng: parseFloat(o.lng) })));
        } catch (e) {
            console.error('Erro ao carregar escritórios:', e);
            setErroCarregar(true);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => { carregarEscritorios(); }, []);

    const filtrados = useMemo(() => {
        return offices.filter(o => {
            const matchEstado = filtro === 'Todos' || o.estado === filtro;
            const termo = busca.toLowerCase();
            const matchBusca = !busca || o.nome.toLowerCase().includes(termo) || o.cidade.toLowerCase().includes(termo);
            return matchEstado && matchBusca;
        });
    }, [filtro, busca, offices]);

    // Inicializa o mapa uma única vez
    useEffect(() => {
        if (!containerRef.current || mapRef.current || offices.length === 0) return;
        import('leaflet').then(({ default: L }) => {
            const bounds = L.latLngBounds(offices.map(o => [o.lat, o.lng]));
            const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true, preferCanvas: true });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
            }).addTo(map);
            mapRef.current = { map, L };
            requestAnimationFrame(() => {
                map.invalidateSize();
                map.fitBounds(bounds, { padding: [40, 40] });
                setMapPronto(true);
            });
        });
        return () => {
            if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null; }
        };
    }, [offices.length > 0]);

    // Sincroniza markers com a lista FILTRADA — antes usava `offices` bruto, então
    // o mapa nunca refletia o chip de estado nem a busca (P0 achado na Fase 11).
    useEffect(() => {
        if (!mapPronto || !mapRef.current) return;
        const { map, L } = mapRef.current;
        const idsAtuais = new Set(filtrados.map(o => o.id));

        // Remove markers de escritórios excluídos OU que saíram do filtro atual
        Object.keys(markersRef.current).forEach(id => {
            if (!idsAtuais.has(Number(id))) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // Adiciona/atualiza markers
        filtrados.forEach(office => {
            const isMatriz = office.tipo === 'Matriz';
            const isSel = office.id === selecionado;
            if (markersRef.current[office.id]) {
                // Atualiza popup e ícone caso o escritório tenha sido editado
                markersRef.current[office.id].setPopupContent(popupHTML(office));
                markersRef.current[office.id].setIcon(criarIcone(L, office.cor, isSel, isMatriz));
                markersRef.current[office.id]._office = office;
            } else {
                const marker = L.marker([office.lat, office.lng], { icon: criarIcone(L, office.cor, false, isMatriz) })
                    .addTo(map)
                    .bindPopup(popupHTML(office), { autoPan: false });
                marker.on('click', () => setSelecionado(office.id));
                marker._office = office;
                markersRef.current[office.id] = marker;
            }
        });
    }, [mapPronto, filtrados]);

    // Reenquadra o mapa quando o filtro/busca muda a lista visível — sem isso,
    // filtrar para uma única cidade distante deixava o zoom/posição do universo
    // inteiro, com o marcador solitário perdido num canto do mapa.
    useEffect(() => {
        if (!mapPronto || !mapRef.current || filtrados.length === 0) return;
        const { map } = mapRef.current;
        const L = mapRef.current.L;
        const bounds = L.latLngBounds(filtrados.map(o => [o.lat, o.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }, [mapPronto, filtro, busca]);

    // Atualiza destaque dos markers ao mudar seleção
    useEffect(() => {
        if (!mapRef.current) return;
        const { L } = mapRef.current;
        Object.values(markersRef.current).forEach(marker => {
            const o = marker._office;
            marker.setIcon(criarIcone(L, o.cor, o.id === selecionado, o.tipo === 'Matriz'));
        });
    }, [selecionado]);

    // Escape de cada diálogo agora é responsabilidade do seu próprio
    // useDismissable (EscritorioModal e o diálogo de exclusão abaixo).
    const trapDeleteDialogTab = makeTrapTab(deleteDialogRef);
    useDismissable(deleteDialogRef, {
        open: confirmandoExclusao !== null,
        onClose: () => { setConfirmandoExclusao(null); setErroExclusao(''); },
        lockScroll: true,
        closeOnOutside: true,
    });

    function flyToOffice(office) {
        setSelecionado(office.id);
        if (!mapRef.current) return;
        const { map } = mapRef.current;
        const marker = markersRef.current[office.id];
        map.flyTo([office.lat, office.lng], 14, { duration: 0.8 });
        map.once('moveend', () => { if (marker) marker.openPopup(); });
    }

    async function salvarEscritorio(payload) {
        const isEdicao = modal?.modo === 'editar';
        const url = isEdicao ? `/api/escritorios/${modal.escritorio.id}` : '/api/escritorios';
        const method = isEdicao ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro desconhecido'); }
        setModal(null);
        await carregarEscritorios();
    }

    async function excluirEscritorio(id) {
        setErroExclusao('');
        const res = await fetch(`/api/escritorios/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const e = await res.json();
            // Feedback inline em vez de alert() nativo — antipadrão banido desde
            // a Fase 2, mais disruptivo ainda num caminho de ação destrutiva.
            setErroExclusao(e.erro || 'Erro ao excluir. Tente novamente.');
            return;
        }
        setConfirmandoExclusao(null);
        if (selecionado === id) setSelecionado(null);
        await carregarEscritorios();
    }

    const contAL = offices.filter(o => o.estado === 'AL').length;
    const contSE = offices.filter(o => o.estado === 'SE').length;

    const contMatriz = offices.filter(o => o.tipo === 'Matriz').length;

    return (
        <div className="flex flex-col flex-1 overflow-y-auto md:overflow-hidden" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}>
            {modal && (
                <EscritorioModal
                    escritorio={modal.modo === 'editar' ? modal.escritorio : null}
                    onSalvar={salvarEscritorio}
                    onFechar={() => setModal(null)}
                />
            )}

            {/* Diálogo de confirmação de exclusão */}
            {confirmandoExclusao !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 backdrop-blur-sm" style={{ background: tone(C.ink, 0.6) }} onClick={() => { setConfirmandoExclusao(null); setErroExclusao(''); }} />
                    <div
                        ref={deleteDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={deleteDialogTituloId}
                        onKeyDown={trapDeleteDialogTab}
                        className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
                        style={{ background: C.surface, borderColor: C.line }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg p-2" style={{ background: C.dangerSoft }}>
                                <span className="material-symbols-outlined text-xl" style={{ color: C.dangerFill }}>delete</span>
                            </div>
                            <h3 id={deleteDialogTituloId} className="font-extrabold" style={{ color: C.ink }}>Excluir Escritório</h3>
                        </div>
                        <p className="text-sm mb-6" style={{ color: C.ink2 }}>
                            Esta ação é irreversível. O escritório será removido do mapa e da lista.
                        </p>
                        {erroExclusao && (
                            <p className="mb-4 flex items-center gap-1 text-sm" style={{ color: C.dangerFill }}>
                                <span className="material-symbols-outlined text-base">error</span>{erroExclusao}
                            </p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setConfirmandoExclusao(null); setErroExclusao(''); }}
                                className="rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
                                style={{ borderColor: C.line, color: C.ink }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => excluirEscritorio(confirmandoExclusao)}
                                className="rounded-lg px-4 py-2 text-sm font-bold shadow transition-colors"
                                style={{ background: C.dangerFill, color: C.onDanger }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 767px) {
                    .offices-list { width: 100% !important; min-width: 0 !important; }
                }
            `}</style>

            {/* Hero */}
            <div className="px-6 py-6 flex-shrink-0">
                <OfficesHero
                    total={offices.length}
                    contAL={contAL}
                    contSE={contSE}
                    matriz={contMatriz}
                    onAdd={() => setModal({ modo: 'novo' })}
                    isAdmin={isAdmin}
                />

                {/* Barra de filtros e busca */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Filtros */}
                        {[
                            { label: 'Todos', count: offices.length },
                            { label: 'AL', count: contAL },
                            { label: 'SE', count: contSE },
                        ].map(({ label, count }) => (
                            <button
                                key={label}
                                onClick={() => setFiltro(label === 'AL' ? 'AL' : label === 'SE' ? 'SE' : 'Todos')}
                                aria-pressed={filtro === (label === 'Todos' ? 'Todos' : label)}
                                className="min-h-[44px] rounded-full px-3 text-xs font-bold transition-all"
                                style={filtro === (label === 'Todos' ? 'Todos' : label)
                                    ? { background: `linear-gradient(to right, ${C.accentDeep}, ${C.accent})`, color: C.onAccent, boxShadow: `0 4px 12px ${tone(C.accent, 0.2)}` }
                                    : { background: C.surface, border: `1px solid ${C.line}`, color: C.ink2 }}
                            >
                                {label} <span className="opacity-70">({count})</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Busca */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: C.muted }} aria-hidden="true">search</span>
                            <input
                                type="text"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                placeholder="Buscar unidade..."
                                aria-label="Buscar unidade"
                                className="min-h-[44px] w-44 rounded-full pl-9 pr-3 text-xs transition-all focus:outline-none focus:ring-2"
                                style={{ background: C.surface, border: `1px solid ${C.line}`, color: C.ink, '--tw-ring-color': tone(C.accent, 0.2) }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Corpo: lista + mapa */}
            {/* Abaixo de md, o wrapper raiz vira scrollável (acima) e este bloco
                não força mais altura de flex-item — lista e mapa recebem uma
                altura mínima real (min-h) em vez de uma fatia de "45%/55%" de
                um espaço que já não cabia. Antes disso, os dois ficavam
                espremidos a ~27-55px visíveis, sem nenhuma rota de rolagem. */}
            <div ref={corpoRef} className="flex flex-col md:flex-row flex-1 md:min-h-0 px-6 pb-6 gap-3 md:gap-0">
                {/* Lista lateral — largura controlada por drag (apenas desktop) */}
                <div
                    style={{ width: `${listWidth}%`, minWidth: `${LIST_MIN_PX}px`, background: C.surface, borderColor: C.line }}
                    className="offices-list flex h-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border shadow-sm md:h-auto md:rounded-l-2xl md:rounded-r-none md:border-r-0"
                >
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2 min-h-0">
                        {carregando && (
                            <div className="text-center text-sm py-8" style={{ color: C.ink2 }}>Carregando escritórios…</div>
                        )}
                        {!carregando && erroCarregar && (
                            <div className="flex flex-col items-center gap-2 text-center py-8 px-2">
                                <span className="material-symbols-outlined text-2xl" style={{ color: C.dangerFill }}>cloud_off</span>
                                <p className="text-sm font-bold m-0" style={{ color: C.ink }}>Não foi possível carregar as unidades</p>
                                <p className="text-xs m-0 max-w-[220px] leading-relaxed" style={{ color: C.ink2 }}>
                                    O servidor não respondeu. Isso costuma ser temporário.
                                </p>
                                <button
                                    onClick={carregarEscritorios}
                                    className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all hover:brightness-110"
                                    style={{ background: `linear-gradient(to right, ${C.accentDeep}, ${C.accent})`, color: C.onAccent, boxShadow: `0 4px 12px ${tone(C.accent, 0.2)}` }}
                                >
                                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                                    Tentar novamente
                                </button>
                            </div>
                        )}
                        {!carregando && !erroCarregar && filtrados.length === 0 && (
                            <div className="text-center text-sm py-8" style={{ color: C.ink2 }}>Nenhuma unidade encontrada.</div>
                        )}
                        {!erroCarregar && filtrados.map(office => {
                            const isSel = selecionado === office.id;
                            return (
                                <div key={office.id} className="relative group/item">
                                    <button
                                        onClick={() => flyToOffice(office)}
                                        className={`w-full text-left rounded-xl border p-3 transition-all duration-150 ${isAdmin ? 'pr-16' : ''}`}
                                        style={isSel
                                            ? { borderColor: C.accent, background: C.accentSoft, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
                                            : { borderColor: C.line, background: C.surface }}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="flex-shrink-0 w-3 h-3 rounded-full mt-0.5" style={{ background: office.cor }} />
                                                <span className="text-xs font-bold truncate leading-tight" style={{ color: C.ink }}>
                                                    {office.nome}
                                                </span>
                                            </div>
                                            {office.tipo === 'Matriz' && (
                                                <span
                                                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide"
                                                    style={{ background: C.accent, color: C.onAccent }}
                                                >
                                                    Matriz
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 pl-5 text-[11px] leading-tight" style={{ color: C.ink2 }}>
                                            {office.endereco}
                                        </div>
                                        <div className="mt-0.5 pl-5 text-[10px]" style={{ color: C.ink2 }}>
                                            {office.cidade} — {office.estado}
                                        </div>
                                    </button>

                                    {/* Botões admin — visíveis em hover, foco de teclado (focus-within) e
                                        sempre em dispositivos sem :hover (toque) — antes só apareciam no
                                        mouse-hover, invisíveis mesmo focadas e inatingíveis em toque (P0). */}
                                    {isAdmin && (
                                        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity [@media(hover:none)]:opacity-100 group-hover/item:opacity-100 group-focus-within/item:opacity-100">
                                            <button
                                                onClick={e => { e.stopPropagation(); setModal({ modo: 'editar', escritorio: office }); }}
                                                title="Editar escritório"
                                                aria-label={`Editar ${office.nome}`}
                                                className="rounded p-1 transition-colors"
                                                style={{ color: C.ink2 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = C.accentDark; e.currentTarget.style.background = C.accentSoft; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = C.ink2; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); setErroExclusao(''); setConfirmandoExclusao(office.id); }}
                                                title="Excluir escritório"
                                                aria-label={`Excluir ${office.nome}`}
                                                className="rounded p-1 transition-colors"
                                                style={{ color: C.ink2 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = C.dangerFill; e.currentTarget.style.background = C.dangerSoft; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = C.ink2; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Legenda — os pontos de cor são fixos de propósito: são as
                        mesmas cores literais dos marcadores no mapa (`office.cor`),
                        não um token semântico que precise inverter por tema. */}
                    <div className="flex flex-wrap items-center gap-3 border-t px-4 py-2" style={{ borderColor: C.line, background: C.surfaceSoft }}>
                        <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.ink2 }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] inline-block" /> Matriz
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.ink2 }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Alagoas
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.ink2 }}>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> Sergipe
                        </span>
                    </div>
                </div>

                {/* Divisor arrastável */}
                <div
                    onMouseDown={startResize}
                    onTouchStart={startResize}
                    title="Arrastar para redimensionar"
                    role="separator"
                    aria-orientation="vertical"
                    className="group relative hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors duration-150 md:flex"
                    style={{ background: C.line }}
                >
                    <div className="h-8 w-0.5 rounded-full transition-all duration-150 group-hover:h-12" style={{ background: tone(C.ink2, 0.5) }} />
                </div>

                {/* Mapa */}
                <div
                    className="offices-map relative h-[360px] shrink-0 overflow-hidden rounded-2xl border shadow-sm md:h-auto md:flex-1 md:rounded-l-none md:rounded-r-2xl md:border-l-0"
                    style={{ background: C.surface, borderColor: C.line }}
                >
                    <div
                        ref={containerRef}
                        style={{ height: '100%', width: '100%', isolation: 'isolate' }}
                        className="relative z-0"
                    />
                </div>
            </div>
        </div>
    );
}