import { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

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
        <div style="font-family:sans-serif;min-width:180px;max-width:220px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <strong style="font-size:13px;color:#1d150c">${office.nome}</strong>
            </div>
            <span style="display:inline-block;background:${badgeColor};color:white;font-size:10px;font-weight:700;padding:1px 7px;border-radius:999px;margin-bottom:6px">
                ${office.tipo.toUpperCase()}
            </span>
            <div style="font-size:11px;color:#6b7280;line-height:1.5">
                <div>📍 ${office.endereco}</div>
                ${office.cep ? `<div style="color:#a17745">CEP: ${office.cep}</div>` : ''}
                <div style="margin-top:2px;color:#9ca3af">${office.cidade} — ${office.estado}</div>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
                <a href="${streetViewUrl}" target="_blank" rel="noopener noreferrer"
                   style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:#1a73e8;color:white;font-size:10px;font-weight:600;padding:5px 8px;border-radius:6px;text-decoration:none">
                    🔭 Street View
                </a>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                   style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:#f4eee6;color:#a17745;font-size:10px;font-weight:600;padding:5px 8px;border-radius:6px;text-decoration:none">
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

function EscritorioModal({ escritorio, onSalvar, onFechar }) {
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

    const inputCls = "w-full px-3 py-2 border border-[#eaddcd] dark:border-gray-700 rounded bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary";
    const labelCls = "block text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onFechar} />
            <div className="relative bg-white dark:bg-[#1a130b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-[#eaddcd] dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaddcd] dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {isEdicao ? 'edit_location' : 'add_location'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-[#1d150c] dark:text-white font-bold text-lg">
                                {isEdicao ? 'Editar Escritório' : 'Novo Escritório'}
                            </h2>
                            {isEdicao && <p className="text-xs text-[#a17745] font-mono">ID {escritorio.id}</p>}
                        </div>
                    </div>
                    <button onClick={onFechar} className="text-[#a17745] hover:text-[#1d150c] dark:hover:text-white p-1 rounded transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Corpo */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Nome *</label>
                            <input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: PENEDO/AL (MATRIZ)" />
                        </div>
                        <div>
                            <label className={labelCls}>Tipo *</label>
                            <select className={inputCls} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                                <option value="Matriz">Matriz</option>
                                <option value="Filial">Filial</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Estado *</label>
                            <select className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value)}>
                                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Cidade *</label>
                            <input className={inputCls} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: Penedo" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Endereço</label>
                            <input className={inputCls} value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Ex: Av. Duque de Caxias, 253" />
                        </div>
                        <div>
                            <label className={labelCls}>CEP</label>
                            <input className={inputCls} value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
                        </div>
                        <div>
                            <label className={labelCls}>Cor do Marcador</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={form.cor} onChange={e => set('cor', e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-[#eaddcd] dark:border-gray-700 bg-transparent p-0.5" />
                                <input className={`${inputCls} flex-1`} value={form.cor} onChange={e => set('cor', e.target.value)} placeholder="#3B82F6" />
                            </div>
                        </div>
                        {/* Extrator de coordenadas via link do Google Maps */}
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Link do Google Maps</label>
                            <div className="flex gap-2">
                                <input
                                    className={`${inputCls} flex-1`}
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
                                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-primary hover:bg-[#e67e00] disabled:opacity-50 text-white text-sm font-semibold whitespace-nowrap transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {extraindo ? 'sync' : 'my_location'}
                                    </span>
                                    {extraindo ? 'Extraindo…' : 'Extrair'}
                                </button>
                            </div>
                            {erroLink && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>{erroLink}
                                </p>
                            )}
                            {!erroLink && form.lat && form.lng && (
                                <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Coordenadas preenchidas automaticamente
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Latitude *</label>
                            <input className={inputCls} value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-10.2892274" />
                        </div>
                        <div>
                            <label className={labelCls}>Longitude *</label>
                            <input className={inputCls} value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-36.5635948" />
                        </div>
                    </div>
                    {erro && (
                        <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">error</span>{erro}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#eaddcd] dark:border-gray-800 flex justify-end gap-3">
                    <button type="button" onClick={onFechar} className="px-4 py-2 text-sm font-medium text-[#1d150c] dark:text-white border border-[#eaddcd] dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-[#2c2217] transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={salvando}
                        className="px-5 py-2 text-sm font-bold bg-primary hover:bg-[#e67e00] disabled:opacity-60 text-white rounded shadow transition-colors flex items-center gap-2"
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
    const [modal, setModal] = useState(null);
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);
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
        try {
            const res = await fetch('/api/escritorios');
            const data = await res.json();
            // Garante que lat/lng são números (o banco retorna strings em alguns drivers)
            setOffices(data.map(o => ({ ...o, lat: parseFloat(o.lat), lng: parseFloat(o.lng) })));
        } catch (e) {
            console.error('Erro ao carregar escritórios:', e);
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

    // Sincroniza markers com a lista de offices
    useEffect(() => {
        if (!mapPronto || !mapRef.current) return;
        const { map, L } = mapRef.current;
        const idsAtuais = new Set(offices.map(o => o.id));

        // Remove markers de escritórios excluídos
        Object.keys(markersRef.current).forEach(id => {
            if (!idsAtuais.has(Number(id))) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // Adiciona/atualiza markers
        offices.forEach(office => {
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
    }, [mapPronto, offices]);

    // Atualiza destaque dos markers ao mudar seleção
    useEffect(() => {
        if (!mapRef.current) return;
        const { L } = mapRef.current;
        Object.values(markersRef.current).forEach(marker => {
            const o = marker._office;
            marker.setIcon(criarIcone(L, o.cor, o.id === selecionado, o.tipo === 'Matriz'));
        });
    }, [selecionado]);

    // Fecha modal com Escape
    useEffect(() => {
        if (!modal && !confirmandoExclusao) return;
        function onKey(e) { if (e.key === 'Escape') { setModal(null); setConfirmandoExclusao(null); } }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modal, confirmandoExclusao]);

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
        const res = await fetch(`/api/escritorios/${id}`, { method: 'DELETE' });
        if (!res.ok) { const e = await res.json(); alert(e.erro || 'Erro ao excluir.'); return; }
        setConfirmandoExclusao(null);
        if (selecionado === id) setSelecionado(null);
        await carregarEscritorios();
    }

    const contAL = offices.filter(o => o.estado === 'AL').length;
    const contSE = offices.filter(o => o.estado === 'SE').length;

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-[#fdf8f3] dark:bg-[#120d08]">
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
                    <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmandoExclusao(null)} />
                    <div className="relative bg-white dark:bg-[#1a130b] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#eaddcd] dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-red-600 text-xl">delete</span>
                            </div>
                            <h3 className="font-bold text-[#1d150c] dark:text-white">Excluir Escritório</h3>
                        </div>
                        <p className="text-sm text-[#a17745] dark:text-orange-300 mb-6">
                            Esta ação é irreversível. O escritório será removido do mapa e da lista.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmandoExclusao(null)} className="px-4 py-2 text-sm font-medium border border-[#eaddcd] dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors">Cancelar</button>
                            <button onClick={() => excluirEscritorio(confirmandoExclusao)} className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded shadow transition-colors">Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b] flex-shrink-0">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                    <button onClick={() => setCurrentView?.('dashboard')} className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-lg">home</span>Início
                    </button>

                    <button onClick={() => setCurrentView?.('dashboard')} className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                        Dashboard
                    </button>

                    <span className="text-[#1d150c] dark:text-white text-sm font-bold">Escritórios Prestek</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#a17745] text-[24px]">apartment</span>
                        <div>
                            <h1 className="text-[#1d150c] dark:text-white font-bold text-lg leading-tight">
                                Escritórios Prestek
                            </h1>
                            <span className="text-xs text-[#a17745] dark:text-orange-300">
                                {carregando ? 'Carregando…' : `${offices.length} unidades em 2 estados`}
                            </span>
                        </div>
                    </div>
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
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                    filtro === (label === 'Todos' ? 'Todos' : label)
                                        ? 'bg-[#a17745] text-white'
                                        : 'bg-[#f4eee6] dark:bg-[#2c2217] text-[#a17745] dark:text-orange-300 hover:bg-[#e8ddd0] dark:hover:bg-[#3a2d20]'
                                }`}
                            >
                                {label} <span className="opacity-70">({count})</span>
                            </button>
                        ))}
                        {/* Busca */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#a17745] text-[16px]">search</span>
                            <input
                                type="text"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                placeholder="Buscar unidade..."
                                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#f4eee6] dark:border-[#2c2217] bg-[#fdf8f3] dark:bg-[#120d08] text-[#1d150c] dark:text-white placeholder-[#c4a882] focus:outline-none focus:border-[#a17745] w-44"
                            />
                        </div>
                        {/* Botão Adicionar (apenas admin) */}
                        {isAdmin && (
                            <button
                                onClick={() => setModal({ modo: 'novo' })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary hover:bg-[#e67e00] text-white shadow transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add_location</span>
                                Adicionar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Corpo: lista + mapa */}
            <div ref={corpoRef} className="flex flex-1 min-h-0">
                {/* Lista lateral — largura controlada por drag */}
                <div style={{ width: `${listWidth}%`, minWidth: `${LIST_MIN_PX}px` }} className="flex flex-col min-h-0 border-r border-[#f4eee6] dark:border-[#2c2217]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2 min-h-0">
                        {carregando && (
                            <div className="text-center text-sm text-[#a17745] py-8">Carregando escritórios…</div>
                        )}
                        {!carregando && filtrados.length === 0 && (
                            <div className="text-center text-sm text-[#a17745] py-8">Nenhuma unidade encontrada.</div>
                        )}
                        {filtrados.map(office => {
                            const isSel = selecionado === office.id;
                            return (
                                <div key={office.id} className="relative group/item">
                                    <button
                                        onClick={() => flyToOffice(office)}
                                        className={`w-full text-left rounded-xl p-3 border transition-all duration-150 ${
                                            isSel
                                                ? 'border-[#a17745] bg-[#fdf1e4] dark:bg-[#2c2010] shadow-sm'
                                                : 'border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b] hover:border-[#c4a882] dark:hover:border-[#a17745] hover:bg-[#fdf8f3] dark:hover:bg-[#221810]'
                                        } ${isAdmin ? 'pr-16' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="flex-shrink-0 w-3 h-3 rounded-full mt-0.5" style={{ background: office.cor }} />
                                                <span className="text-xs font-semibold text-[#1d150c] dark:text-white truncate leading-tight">
                                                    {office.nome}
                                                </span>
                                            </div>
                                            {office.tipo === 'Matriz' && (
                                                <span className="flex-shrink-0 text-[9px] font-bold bg-[#F97316] text-white px-2 py-0.5 rounded-full">
                                                    MATRIZ
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 text-[11px] text-[#a17745] dark:text-orange-300 leading-tight pl-5">
                                            {office.endereco}
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-[#9ca3af] pl-5">
                                            {office.cidade} — {office.estado}
                                        </div>
                                    </button>

                                    {/* Botões admin — aparecem no hover */}
                                    {isAdmin && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                onClick={e => { e.stopPropagation(); setModal({ modo: 'editar', escritorio: office }); }}
                                                title="Editar escritório"
                                                className="p-1 rounded text-[#a17745] hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); setConfirmandoExclusao(office.id); }}
                                                title="Excluir escritório"
                                                className="p-1 rounded text-[#a17745] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Legenda */}
                    <div className="px-4 py-2 border-t border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b] flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] inline-block" /> Matriz
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Alagoas
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> Sergipe
                        </span>
                    </div>
                </div>

                {/* Divisor arrastável */}
                <div
                    onMouseDown={startResize}
                    onTouchStart={startResize}
                    title="Arrastar para redimensionar"
                    className="w-1.5 shrink-0 cursor-col-resize group relative flex items-center justify-center bg-[#f4eee6] dark:bg-[#2c2217] hover:bg-primary/30 dark:hover:bg-primary/30 transition-colors duration-150"
                >
                    <div className="w-0.5 h-8 rounded-full bg-[#c4a882] dark:bg-[#4a3a2a] group-hover:bg-primary group-hover:h-12 transition-all duration-150" />
                </div>

                {/* Mapa */}
                <div className="flex-1 relative">
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
