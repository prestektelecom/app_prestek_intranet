import { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { offices } from '../data/officesData';

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
    return L.icon({
        iconUrl: url,
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
        popupAnchor: [0, -h],
    });
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


export default function Offices() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const [mapPronto, setMapPronto] = useState(false);
    const [selecionado, setSelecionado] = useState(null);
    const [filtro, setFiltro] = useState('Todos');
    const [busca, setBusca] = useState('');

    const filtrados = useMemo(() => {
        return offices.filter(o => {
            const matchEstado = filtro === 'Todos' || o.estado === filtro;
            const termo = busca.toLowerCase();
            const matchBusca = !busca || o.nome.toLowerCase().includes(termo) || o.cidade.toLowerCase().includes(termo);
            return matchEstado && matchBusca;
        });
    }, [filtro, busca]);

    // Inicializa o mapa uma única vez
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        import('leaflet').then(({ default: L }) => {
            const bounds = L.latLngBounds(offices.map(o => [o.lat, o.lng]));
            const map = L.map(containerRef.current, {
                zoomControl: true,
                scrollWheelZoom: true,
                preferCanvas: true,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
            }).addTo(map);
            mapRef.current = { map, L };
            // Aguarda o browser finalizar o layout do container antes de ajustar os bounds
            requestAnimationFrame(() => {
                map.invalidateSize();
                map.fitBounds(bounds, { padding: [40, 40] });
                setMapPronto(true);
            });
        });
        return () => {
            if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null; }
        };
    }, []);

    // Adiciona markers quando mapa está pronto
    useEffect(() => {
        if (!mapPronto || !mapRef.current) return;
        const { map, L } = mapRef.current;

        offices.forEach(office => {
            if (markersRef.current[office.id]) return;
            const isMatriz = office.tipo === 'Matriz';
            const icone = criarIcone(L, office.cor, false, isMatriz);
            const marker = L.marker([office.lat, office.lng], { icon: icone })
                .addTo(map)
                .bindPopup(popupHTML(office), { autoPan: false }); // flyTo já centraliza, autoPan deslocaria o pin
            marker.on('click', () => setSelecionado(office.id));
            marker._office = office;
            markersRef.current[office.id] = marker;
        });
    }, [mapPronto]);

    // Atualiza destaque dos markers ao mudar seleção
    useEffect(() => {
        if (!mapRef.current) return;
        const { L } = mapRef.current;
        Object.values(markersRef.current).forEach(marker => {
            const o = marker._office;
            const sel = o.id === selecionado;
            marker.setIcon(criarIcone(L, o.cor, sel, o.tipo === 'Matriz'));
        });
    }, [selecionado]);

    function flyToOffice(office) {
        setSelecionado(office.id);
        if (!mapRef.current) return;
        const { map } = mapRef.current;
        const marker = markersRef.current[office.id];
        // flyTo centraliza o pin — autoPan:false no popup garante que ele não desloque o mapa
        map.flyTo([office.lat, office.lng], 14, { duration: 0.8 });
        map.once('moveend', () => { if (marker) marker.openPopup(); });
    }

    const contAL = offices.filter(o => o.estado === 'AL').length;
    const contSE = offices.filter(o => o.estado === 'SE').length;

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-[#fdf8f3] dark:bg-[#120d08]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#a17745] text-[24px]">apartment</span>
                        <div>
                            <h1 className="text-[#1d150c] dark:text-white font-bold text-lg leading-tight">
                                Escritórios Prestek
                            </h1>
                            <span className="text-xs text-[#a17745] dark:text-orange-300">
                                {offices.length} unidades em 2 estados
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
                    </div>
                </div>
            </div>

            {/* Corpo: lista + mapa */}
            <div className="flex flex-1 overflow-hidden">
                {/* Lista lateral */}
                <div className="w-[35%] min-w-[240px] flex flex-col overflow-hidden border-r border-[#f4eee6] dark:border-[#2c2217]">
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                        {filtrados.length === 0 && (
                            <div className="text-center text-sm text-[#a17745] py-8">Nenhuma unidade encontrada.</div>
                        )}
                        {filtrados.map(office => {
                            const isSel = selecionado === office.id;
                            return (
                                <button
                                    key={office.id}
                                    onClick={() => flyToOffice(office)}
                                    className={`w-full text-left rounded-xl p-3 border transition-all duration-150 ${
                                        isSel
                                            ? 'border-[#a17745] bg-[#fdf1e4] dark:bg-[#2c2010] shadow-sm'
                                            : 'border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b] hover:border-[#c4a882] dark:hover:border-[#a17745] hover:bg-[#fdf8f3] dark:hover:bg-[#221810]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="flex-shrink-0 w-3 h-3 rounded-full mt-0.5"
                                                style={{ background: office.cor }}
                                            />
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