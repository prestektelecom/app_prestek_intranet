import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// ─── Cores saturadas por status ───────────────────────────────────
const COR_STATUS = {
    Ativo:    '#16a34a',
    Expansão: '#2563eb',
    Inativo:  '#dc2626',
};
const COR_PADRAO = '#64748b';

// Zoom mínimo para exibir rótulos de cidade
const ZOOM_LABEL = 10;

// ─── Raio do círculo de cobertura (em metros) ────────────────────
function raioCirculo(totalContratos) {
    const n = parseInt(totalContratos) || 0;
    return Math.min(8000, Math.max(2000, n * 120));
}

// ─── Ícone SVG: cidade (pino + rótulo flutuante) ─────────────────
function criarIconeCidade(L, cor, selecionado, nome = '', mostrarLabel = false) {
    const tam   = selecionado ? 42 : 28;
    const svgH  = Math.round(tam * 1.5);
    const shadow = selecionado
        ? `filter:drop-shadow(0 4px 8px ${cor}99)`
        : `filter:drop-shadow(0 2px 4px ${cor}66)`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" width="${tam}" height="${svgH}" style="${shadow}">
        <defs>
            <radialGradient id="cg${selecionado ? 's' : 'n'}" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stop-color="${cor}" stop-opacity="1"/>
                <stop offset="100%" stop-color="${cor}" stop-opacity="0.7"/>
            </radialGradient>
        </defs>
        <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.27 21.73 0 14 0z"
              fill="url(#cg${selecionado ? 's' : 'n'})" stroke="white" stroke-width="${selecionado ? 2.5 : 2}"/>
        <circle cx="14" cy="14" r="${selecionado ? 7 : 5}" fill="white" opacity="${selecionado ? 1 : 0.95}"/>
        <circle cx="14" cy="14" r="${selecionado ? 3.5 : 2.5}" fill="${cor}" opacity="0.8"/>
    </svg>`;

    const labelH = 18;
    const labelCss = mostrarLabel && nome
        ? `display:inline-block;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;` +
          `background:rgba(255,255,255,0.93);border-radius:5px;padding:1px 6px;` +
          `font-size:${selecionado ? 11 : 10}px;font-family:sans-serif;` +
          `font-weight:${selecionado ? 700 : 600};` +
          `color:${selecionado ? '#2563eb' : '#1e293b'};` +
          `box-shadow:0 1px 4px rgba(0,0,0,0.13);border:1px solid rgba(0,0,0,0.07);margin-top:2px;`
        : 'display:none;';

    const iconW   = Math.max(tam * 2, 110);
    const totalH  = svgH + (mostrarLabel && nome ? labelH + 2 : 0);

    const html = `<div style="display:flex;flex-direction:column;align-items:center;width:${iconW}px;">
        ${svg}
        <span style="${labelCss}">${nome}</span>
    </div>`;

    return L.divIcon({
        html,
        className: '',
        iconSize:    [iconW, totalH],
        iconAnchor:  [iconW / 2, svgH],
        popupAnchor: [0, -(svgH + (mostrarLabel && nome ? labelH : 0) + 4)],
    });
}

// ─── Ícone SVG: bairro (losango moderno com sombra) ───────────────
function criarIconeBairro(L, cor, selecionado) {
    const tam = selecionado ? 32 : 20;
    const shadow = selecionado
        ? `filter: drop-shadow(0 3px 6px ${cor}99)`
        : `filter: drop-shadow(0 2px 4px ${cor}55)`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${tam}" height="${tam}" style="${shadow}">
        <defs>
            <radialGradient id="bg${selecionado ? 's' : 'n'}" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stop-color="${cor}" stop-opacity="1"/>
                <stop offset="100%" stop-color="${cor}" stop-opacity="0.75"/>
            </radialGradient>
        </defs>
        <polygon points="12,1 23,12 12,23 1,12"
                 fill="url(#bg${selecionado ? 's' : 'n'})" stroke="white" stroke-width="${selecionado ? 2 : 1.5}"/>
        <circle cx="12" cy="12" r="${selecionado ? 4 : 3}" fill="white" opacity="${selecionado ? 1 : 0.9}"/>
    </svg>`;
    return L.divIcon({
        html: svg, className: '',
        iconSize:    [tam, tam],
        iconAnchor:  [tam / 2, tam / 2],
        popupAnchor: [0, -(tam / 2 + 4)],
    });
}

// ─── Popup HTML (tema claro, Google Maps style) ───────────────────
function popupCidadeHtml(nome, contratos, status, cor) {
    return `
    <div style="font-family:sans-serif;min-width:160px;padding:2px 0;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cor};flex-shrink:0;box-shadow:0 0 0 2px white,0 0 0 3px ${cor}55"></span>
            <strong style="font-size:13px;color:#0f172a;font-weight:700;">${nome}</strong>
        </div>
        <div style="font-size:11px;color:#475569;margin-top:2px;">
            <span style="background:#f1f5f9;border-radius:4px;padding:2px 6px;font-weight:600;">${contratos} contrato(s)</span>
            <span style="margin-left:6px;color:${cor};font-weight:600;">${status}</span>
        </div>
    </div>`;
}

function popupBairroHtml(cidade, bairro, cor, status, contratos) {
    return `
    <div style="font-family:sans-serif;min-width:160px;padding:2px 0;">
        <div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:2px;">${cidade}</div>
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <span style="display:inline-block;width:8px;height:8px;transform:rotate(45deg);background:${cor};flex-shrink:0;"></span>
            <strong style="font-size:13px;color:#0f172a;">${bairro}</strong>
        </div>
        <div style="font-size:11px;color:#475569;">
            <span style="background:#f1f5f9;border-radius:4px;padding:2px 6px;font-weight:600;">${contratos} contrato(s)</span>
            <span style="margin-left:6px;color:${cor};font-weight:600;">${status}</span>
        </div>
    </div>`;
}

// ─── Geocodifica cidade via Nominatim ─────────────────────────────
async function geocodificar(nomeCidade, estado) {
    const query = encodeURIComponent(`${nomeCidade}, ${estado || 'Alagoas'}, Brasil`);
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
    const containerRef          = useRef(null);
    const mapRef                = useRef(null);
    const marcCidadeRef         = useRef({});
    const marcBairroRef         = useRef({});
    const circCidadeRef         = useRef({});
    const circBairroRef         = useRef({});
    const mostrarLabelsRef      = useRef(false);       // controlado pelo zoom
    const cidadeSelecionadaRef  = useRef(cidadeSelecionada); // sempre atualizado
    const [mapPronto, setMapPronto]   = useState(false);
    const [geocodando, setGeocodando] = useState(false);

    // Mantém a ref de seleção sempre atualizada (usada dentro de closures do Leaflet)
    useEffect(() => {
        cidadeSelecionadaRef.current = cidadeSelecionada;
    }, [cidadeSelecionada]);

    // ── Inicializa o mapa uma única vez ──────────────────────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        import('leaflet').then(({ default: L }) => {
            if (!containerRef.current) return;
            // Guard HMR: se um mapa anterior ficou preso no container, destrói antes
            if (containerRef.current.__leafletMapInstance) {
                try { containerRef.current.__leafletMapInstance.remove(); } catch (_) { /* ignora */ }
                containerRef.current.__leafletMapInstance = null;
            }
            L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
            const map = L.map(containerRef.current, {
                center: [-10.5, -36.5], zoom: 8,
                zoomControl: false, scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // CSS dos popups: fundo branco, sombra suave
            const style = document.createElement('style');
            style.textContent = `
                .noc-popup .leaflet-popup-content-wrapper {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    border: 1px solid #e2e8f0;
                    padding: 0;
                }
                .noc-popup .leaflet-popup-content { margin: 12px 14px; }
                .noc-popup .leaflet-popup-tip { background: #ffffff; }
                .noc-popup .leaflet-popup-close-button { color: #64748b !important; top: 6px !important; right: 8px !important; }
            `;
            document.head.appendChild(style);

            // Controla visibilidade dos rótulos conforme o zoom
            map.on('zoomend', () => {
                const zoom   = map.getZoom();
                const mostrar = zoom >= ZOOM_LABEL;
                if (mostrar === mostrarLabelsRef.current) return; // sem mudança
                mostrarLabelsRef.current = mostrar;

                // Atualiza ícones de todos os marcadores de cidade
                const selAtual = cidadeSelecionadaRef.current;
                Object.entries(marcCidadeRef.current).forEach(([id, marker]) => {
                    const sel = id === String(selAtual).split('::')[0] && !String(selAtual).includes('::');
                    marker.setIcon(criarIconeCidade(L, marker._cor, sel, marker._nome, mostrar));
                });
            });

            containerRef.current.__leafletMapInstance = map; // guard HMR
            mapRef.current = { map, L };
            setMapPronto(true);
        });
        return () => {
            if (mapRef.current) {
                mapRef.current.map.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // ── Adiciona/atualiza marcadores e círculos ───────────────────
    useEffect(() => {
        if (!dados || dados.length === 0 || !mapPronto || !mapRef.current) return;
        const { map, L } = mapRef.current;
        let cancelado = false;

        // ── 1. Marcadores de BAIRRO (coordenadas manuais) ────────
        dados.forEach(d => {
            if (d.latitude == null || d.longitude == null) return;
            const chave = `${d.cidade_ixc_id}::${d.bairro}`;
            const cor   = COR_STATUS[d.status] || COR_PADRAO;

            if (marcBairroRef.current[chave]) {
                marcBairroRef.current[chave].setPopupContent(
                    popupBairroHtml(d.cidade, d.bairro, cor, d.status, d.total_contratos)
                );
                return;
            }

            const raio = raioCirculo(d.total_contratos);
            const circle = L.circle([d.latitude, d.longitude], {
                radius: raio, color: cor, weight: 1.5, opacity: 0.45,
                fillColor: cor, fillOpacity: 0.12, interactive: false,
            }).addTo(map);
            circBairroRef.current[chave] = circle;

            const icone  = criarIconeBairro(L, cor, false);
            const marker = L.marker([d.latitude, d.longitude], { icon: icone })
                .addTo(map)
                .bindPopup(popupBairroHtml(d.cidade, d.bairro, cor, d.status, d.total_contratos), { className: 'noc-popup', maxWidth: 240 });
            marker.on('click', () => onCidadeClick(`${d.cidade_ixc_id}::${d.bairro}`));
            marker._cidadeId  = d.cidade_ixc_id;
            marker._cor       = cor;
            marker._coords    = { lat: d.latitude, lng: d.longitude };
            marker._contratos = d.total_contratos;
            marcBairroRef.current[chave] = marker;
        });

        // ── 2. Marcadores de CIDADE (geocodificação Nominatim) ────
        const cidadesUnicas = {};
        dados.forEach(d => {
            if (!cidadesUnicas[d.cidade_ixc_id]) {
                const totalContratos = dados
                    .filter(x => x.cidade_ixc_id === d.cidade_ixc_id)
                    .reduce((acc, x) => acc + (parseInt(x.total_contratos) || 0), 0);
                cidadesUnicas[d.cidade_ixc_id] = {
                    nome: d.cidade, estado: d.estado, status: d.status,
                    contratos: totalContratos,
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

                const cor  = COR_STATUS[cidade.status] || COR_PADRAO;
                const raio = raioCirculo(cidade.contratos);

                const circle = L.circle([coords.lat, coords.lng], {
                    radius: raio, color: cor, weight: 2, opacity: 0.5,
                    fillColor: cor, fillOpacity: 0.1, interactive: false,
                }).addTo(map);
                circCidadeRef.current[id] = circle;

                const mostrar = mostrarLabelsRef.current;
                const icone   = criarIconeCidade(L, cor, false, cidade.nome, mostrar);
                const marker  = L.marker([coords.lat, coords.lng], { icon: icone })
                    .addTo(map)
                    .bindPopup(popupCidadeHtml(cidade.nome, cidade.contratos, cidade.status, cor), { className: 'noc-popup', maxWidth: 240 });
                marker.on('click', () => onCidadeClick(id));
                marker._cidadeId  = id;
                marker._cor       = cor;
                marker._coords    = coords;
                marker._contratos = cidade.contratos;
                marker._nome      = cidade.nome;  // armazena para o listener de zoom
                marcCidadeRef.current[id] = marker;
                await sleep(300);
            }
            if (!cancelado) setGeocodando(false);
        })();

        return () => { cancelado = true; };
    }, [dados, mapPronto]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Destaque ao selecionar cidade/bairro ─────────────────────
    useEffect(() => {
        if (!mapRef.current) return;
        const { map, L } = mapRef.current;
        const mostrar = mostrarLabelsRef.current;

        // Marcadores e círculos de CIDADE
        Object.entries(marcCidadeRef.current).forEach(([id, marker]) => {
            const sel = id === String(cidadeSelecionada).split('::')[0] && !String(cidadeSelecionada).includes('::');
            marker.setIcon(criarIconeCidade(L, marker._cor, sel, marker._nome || '', mostrar));

            const circle = circCidadeRef.current[id];
            if (circle) {
                circle.setStyle(sel
                    ? { fillOpacity: 0.22, opacity: 0.8,  weight: 2.5 }
                    : { fillOpacity: 0.1,  opacity: 0.5,  weight: 2   });
            }

            if (sel) {
                map.flyTo([marker._coords.lat, marker._coords.lng], 12, { duration: 0.9 });
                marker.openPopup();
            }
        });

        // Marcadores e círculos de BAIRRO
        Object.entries(marcBairroRef.current).forEach(([chave, marker]) => {
            const clicouNoBairro = chave === cidadeSelecionada;
            const clicouNaCidade = marker._cidadeId === cidadeSelecionada;
            const sel = clicouNoBairro || clicouNaCidade;
            marker.setIcon(criarIconeBairro(L, marker._cor, sel));

            const circle = circBairroRef.current[chave];
            if (circle) {
                circle.setStyle(sel
                    ? { fillOpacity: 0.22, opacity: 0.75, weight: 2   }
                    : { fillOpacity: 0.12, opacity: 0.45, weight: 1.5 });
            }

            if (clicouNoBairro) {
                map.flyTo([marker._coords.lat, marker._coords.lng], 14, { duration: 0.9 });
                marker.openPopup();
            }
        });
    }, [cidadeSelecionada]);

    return (
        <div className="absolute inset-0 w-full h-full z-0">
            {geocodando && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Carregando cidades…
                </div>
            )}
            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', isolation: 'isolate' }}
                className="w-full h-full"
            />
        </div>
    );
}
