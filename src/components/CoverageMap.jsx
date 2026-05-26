import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// ─── Cores por status ─────────────────────────────────────────────
const COR_STATUS = {
    Ativo:    '#22c55e',
    Expansão: '#3b82f6',
    Inativo:  '#ef4444',
};
const COR_PADRAO = '#94a3b8';

// ─── Ícone SVG: cidade (pino) ─────────────────────────────────────
function criarIconeCidade(L, cor, selecionado) {
    const tam = selecionado ? 36 : 24;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${tam}" height="${tam}">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z"
              fill="${cor}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`;
    return L.divIcon({
        html: svg, className: '',
        iconSize: [tam, tam * 1.5], iconAnchor: [tam / 2, tam * 1.5], popupAnchor: [0, -(tam * 1.5)],
    });
}

// ─── Ícone SVG: bairro (estrela) ─────────────────────────────────
function criarIconeBairro(L, cor, selecionado) {
    const tam = selecionado ? 28 : 18;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${tam}" height="${tam}">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
                 fill="${cor}" stroke="white" stroke-width="1.5"/>
    </svg>`;
    return L.divIcon({
        html: svg, className: '',
        iconSize: [tam, tam], iconAnchor: [tam / 2, tam / 2], popupAnchor: [0, -tam],
    });
}

// ─── Geocodifica cidade via Nominatim ─────────────────────────────
async function geocodificar(nomeCidade, estado) {
    const query = encodeURIComponent(`${nomeCidade}, ${estado || 'Sergipe'}, Brasil`);
    const url   = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    try {
        const resp = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        const json = await resp.json();
        if (json.length > 0) return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
    } catch { /* silencioso */ }
    return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Componente Principal ─────────────────────────────────────────
export default function CoverageMap({ dados, cidadeSelecionada, onCidadeClick }) {
    const containerRef  = useRef(null);
    const mapRef        = useRef(null);
    const marcCidadeRef = useRef({}); // cidade_ixc_id → marker de cidade
    const marcBairroRef = useRef({}); // "cidade_ixc_id::bairro" → marker de bairro
    const [mapPronto, setMapPronto]   = useState(false);
    const [geocodando, setGeocodando] = useState(false);

    // Inicializa o mapa uma única vez
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        import('leaflet').then(({ default: L }) => {
            const map = L.map(containerRef.current, {
                center: [-10.5, -36.5], zoom: 8,
                zoomControl: false, scrollWheelZoom: true,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 18,
            }).addTo(map);
            mapRef.current = { map, L };
            setMapPronto(true); // sinaliza que o mapa está pronto
        });
        return () => {
            if (mapRef.current) { mapRef.current.map.remove(); mapRef.current = null; }
        };
    }, []);

    // Adiciona/atualiza marcadores quando dados chegam E mapa está pronto
    useEffect(() => {
        if (!dados || dados.length === 0 || !mapPronto || !mapRef.current) return;
        const { map, L } = mapRef.current;
        let cancelado = false;

        // ── 1. Pins de BAIRRO (coordenadas manuais) ──────────────
        dados.forEach(d => {
            if (d.latitude == null || d.longitude == null) return;
            const chave = `${d.cidade_ixc_id}::${d.bairro}`;

            const cor    = COR_STATUS[d.status] || COR_PADRAO;
            const popupContent = `
                <div class="text-[#0B1B2E] dark:text-[#f5f0eb] font-sans min-w-[160px] text-xs flex flex-col gap-1">
                    <strong class="text-sm font-bold">${d.cidade}</strong>
                    <span class="text-[#1F5BA8] dark:text-[#4A9EF5] font-semibold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">pin_drop</span> ${d.bairro}
                    </span>
                </div>
            `;

            if (marcBairroRef.current[chave]) {
                marcBairroRef.current[chave].setPopupContent(popupContent);
                return;
            }

            const icone  = criarIconeBairro(L, cor, false);
            const marker = L.marker([d.latitude, d.longitude], { icon: icone })
                .addTo(map)
                .bindPopup(popupContent, { className: 'noc-popup' });
            marker.on('click', () => onCidadeClick(`${d.cidade_ixc_id}::${d.bairro}`));
            marker._cidadeId = d.cidade_ixc_id;
            marker._cor      = cor;
            marker._coords   = { lat: d.latitude, lng: d.longitude };
            marcBairroRef.current[chave] = marker;
        });

        // ── 2. Pins de CIDADE (geocodificação Nominatim — fallback) ──
        const cidadesUnicas = {};
        dados.forEach(d => {
            if (!cidadesUnicas[d.cidade_ixc_id]) {
                cidadesUnicas[d.cidade_ixc_id] = {
                    nome: d.cidade, estado: d.estado, status: d.status,
                    contratos: dados.filter(x => x.cidade_ixc_id === d.cidade_ixc_id)
                                    .reduce((acc, x) => acc + (x.total_contratos || 0), 0),
                };
            }
        });

        (async () => {
            setGeocodando(true);
            for (const [id, cidade] of Object.entries(cidadesUnicas)) {
                if (cancelado) break;
                if (marcCidadeRef.current[id]) continue;

                const coords = await geocodificar(cidade.nome, cidade.estado);
                if (!coords || cancelado) { await sleep(300); continue; }

                const cor    = COR_STATUS[cidade.status] || COR_PADRAO;
                const icone  = criarIconeCidade(L, cor, false);
                const popupCidadeContent = `
                    <div class="text-[#0B1B2E] dark:text-[#f5f0eb] font-sans min-w-[140px] text-xs flex flex-col gap-1">
                        <strong class="text-sm font-bold">${cidade.nome}</strong>
                    </div>
                `;
                const marker = L.marker([coords.lat, coords.lng], { icon: icone })
                    .addTo(map)
                    .bindPopup(popupCidadeContent, { className: 'noc-popup' });
                marker.on('click', () => onCidadeClick(id));
                marker._cidadeId = id;
                marker._cor      = cor;
                marker._coords   = coords;
                marcCidadeRef.current[id] = marker;
                await sleep(300);
            }
            if (!cancelado) setGeocodando(false);
        })();

        return () => { cancelado = true; };
    }, [dados, mapPronto]); // eslint-disable-line react-hooks/exhaustive-deps

    // Destaque ao selecionar cidade
    useEffect(() => {
        if (!mapRef.current) return;
        const { map, L } = mapRef.current;

        // Pins de cidade
        Object.entries(marcCidadeRef.current).forEach(([id, marker]) => {
            const selExato = id === String(cidadeSelecionada).split('::')[0] && !String(cidadeSelecionada).includes('::');
            marker.setIcon(criarIconeCidade(L, marker._cor, selExato));
            if (selExato) {
                map.flyTo([marker._coords.lat, marker._coords.lng], 12, { duration: 1 });
                marker.openPopup();
            }
        });
        // Pins de bairro — destaca todos do bairro da cidade selecionada
        Object.entries(marcBairroRef.current).forEach(([chave, marker]) => {
            const clicouNoBairro = chave === cidadeSelecionada;
            const clicouNaCidade = marker._cidadeId === cidadeSelecionada;
            const sel = clicouNoBairro || clicouNaCidade;
            marker.setIcon(criarIconeBairro(L, marker._cor, sel));

            if (clicouNoBairro) {
                map.flyTo([marker._coords.lat, marker._coords.lng], 14, { duration: 1 });
                marker.openPopup();
            }
        });
    }, [cidadeSelecionada]);

    return (
        <div className="absolute inset-0 w-full h-full z-0">
            {/* Container do Mapa - Isola o stacking context para não vazar z-index alto */}
            <div 
                ref={containerRef} 
                style={{ height: '100%', width: '100%', isolation: 'isolate' }} 
                className="w-full h-full"
            />
        </div>
    );
}
