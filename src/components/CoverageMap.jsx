import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { corDoStatus, chaveRegiao } from './coverage/constants';
import { adicionarCamadaBase } from './map/baseLayer';

// Fix ícones padrão do Leaflet com Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// CSS dos popups (injetado uma vez)
if (!document.getElementById('noc-popup-styles')) {
    const s = document.createElement('style');
    s.id = 'noc-popup-styles';
    // Tokens do tema em vez de #ffffff fixo: nos temas escuros o popup era um
    // cartão branco puro saindo do marcador, o único elemento claro da tela.
    s.textContent = `
        .noc-popup .leaflet-popup-content-wrapper {
            background: var(--surface, #ffffff);
            color: var(--foreground, #0f172a);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
            border: 1px solid var(--border, #e2e8f0);
            padding: 0;
        }
        .noc-popup .leaflet-popup-content { margin: 12px 14px; }
        .noc-popup .leaflet-popup-tip {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
        }
        .noc-popup .leaflet-popup-close-button {
            color: var(--foreground-muted, #64748b) !important;
            top: 6px !important; right: 8px !important;
        }
        .noc-popup .noc-titulo { color: var(--foreground, #0f172a); }
        .noc-popup .noc-sub    { color: var(--foreground-muted, #475569); }

        /* Badge de cluster — substitui o verde/amarelo/laranja padrão do
           plugin (que não existe na paleta do produto) pela marca, com anel
           na cor de superfície do tema para separar do mapa por trás. */
        .noc-cluster {
            display: flex; align-items: center; justify-content: center;
            width: 100%; height: 100%;
            border-radius: 50%;
            background: var(--accent, #EC7D23);
            color: var(--on-accent, #ffffff);
            font-family: inherit; font-weight: 800;
            border: 3px solid var(--surface, #ffffff);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(s);
}

// Cores por status vêm de coverage/constants — a legenda, os chips da lista e
// estes marcadores precisam pintar "Expansão" do mesmo azul.

// ─── Ícone SVG: cidade (apenas pino, sem rótulo) ──────────────────
function criarIconeCidade(cor, selecionado) {
    const tam  = selecionado ? 42 : 28;
    const svgH = Math.round(tam * 1.5);
    const shadow = selecionado
        ? `filter:drop-shadow(0 4px 8px ${cor}99)`
        : `filter:drop-shadow(0 2px 4px ${cor}66)`;

    const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" width="${tam}" height="${svgH}" style="${shadow}">
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

    return L.divIcon({
        html,
        className: '',
        iconSize:    [tam, svgH],
        iconAnchor:  [tam / 2, svgH],
        popupAnchor: [0, -(svgH + 4)],
    });
}

// ─── Ícone SVG: bairro (losango moderno com sombra) ───────────────
function criarIconeBairro(cor, selecionado) {
    const tam = selecionado ? 32 : 20;
    const shadow = selecionado
        ? `filter:drop-shadow(0 3px 6px ${cor}99)`
        : `filter:drop-shadow(0 2px 4px ${cor}55)`;
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

// ─── Ícone de cluster (badge com contagem) ────────────────────────
function criarIconeCluster(cluster) {
    const n = cluster.getChildCount();
    const tam = n < 10 ? 32 : n < 50 ? 38 : 44;
    return L.divIcon({
        html: `<div class="noc-cluster" style="font-size:${n < 100 ? 12 : 11}px;">${n}</div>`,
        className: '',
        iconSize: [tam, tam],
    });
}

// ─── Popup HTML (tema claro) ──────────────────────────────────────
function popupCidadeHtml(nome, status, cor) {
    return `
    <div style="font-family:inherit;min-width:160px;padding:2px 0;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cor};flex-shrink:0;"></span>
            <strong class="noc-titulo" style="font-size:13px;font-weight:700;">${nome}</strong>
        </div>
        <div class="noc-sub" style="font-size:11px;margin-top:2px;">
            <span style="color:${cor};font-weight:700;">${status || 'sem status'}</span>
        </div>
    </div>`;
}

function popupBairroHtml(cidade, bairro, cor, status) {
    return `
    <div style="font-family:inherit;min-width:160px;padding:2px 0;">
        <div class="noc-sub" style="font-size:12px;font-weight:600;margin-bottom:2px;">${cidade}</div>
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <span style="display:inline-block;width:8px;height:8px;transform:rotate(45deg);background:${cor};flex-shrink:0;"></span>
            <strong class="noc-titulo" style="font-size:13px;">${bairro}</strong>
        </div>
        <div class="noc-sub" style="font-size:11px;">
            <span style="color:${cor};font-weight:700;">${status || 'sem status'}</span>
        </div>
    </div>`;
}

// ─── Cache localStorage de coordenadas ────────────────────────────
const GEO_LS_KEY = 'coverage_geocache_v1';
function lsGeoGet(chave) {
    try { const c = JSON.parse(localStorage.getItem(GEO_LS_KEY) || '{}'); return c[chave] || null; } catch { return null; }
}
function lsGeoSet(chave, coords) {
    try {
        const c = JSON.parse(localStorage.getItem(GEO_LS_KEY) || '{}');
        c[chave] = coords;
        localStorage.setItem(GEO_LS_KEY, JSON.stringify(c));
    } catch { /* sem espaço */ }
}

// ─── Geocodifica cidade via proxy backend (cache 24h no servidor + localStorage) ──
async function geocodificar(nomeCidade, estado) {
    const chave = `${String(nomeCidade).toLowerCase()}::${String(estado || 'AL').toLowerCase()}`;
    const hit = lsGeoGet(chave);
    if (hit) return hit;

    try {
        const params = new URLSearchParams({ cidade: nomeCidade, estado: estado || 'AL' });
        const resp = await fetch(`/api/geocodificar?${params}`);
        const coords = await resp.json();
        if (coords && coords.lat) {
            lsGeoSet(chave, coords);
            return coords;
        }
    } catch { /* silencioso */ }
    return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Componente Principal ─────────────────────────────────────────
export default function CoverageMap({ dados, cidadeSelecionada, onCidadeClick }) {
    const containerRef  = useRef(null);
    const mapRef        = useRef(null);
    const marcCidadeRef = useRef({});
    const marcBairroRef = useRef({});
    // Só os marcadores de BAIRRO agrupam em cluster — são ~290-320, um por
    // região; os de cidade já são poucas dezenas e não poluem o mapa sozinhos.
    const clusterBairroRef = useRef(null);
    const [mapPronto, setMapPronto]   = useState(false);
    const [geocodando, setGeocodando] = useState(false);

    // ── Inicializa o mapa (síncrono — sem dynamic import) ────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // HMR: se um mapa anterior ficou preso (callback assíncrono de versão velha),
        // limpa o _leaflet_id para que L.map() não lance "already initialized"
        if (containerRef.current._leaflet_id) {
            containerRef.current._leaflet_id = undefined; // eslint-disable-line no-underscore-dangle
        }

        const map = L.map(containerRef.current, {
            center: [-10.5, -36.5], zoom: 8,
            // A camada vetorial (MapLibre) não informa maxZoom ao Leaflet, e o
            // markercluster lança "Map has no maxZoom specified" sem isso.
            maxZoom: 19,
            zoomControl: false, scrollWheelZoom: true,
        });

        adicionarCamadaBase(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const clusterBairro = L.markerClusterGroup({
            iconCreateFunction: criarIconeCluster,
            // Some antes de virar 1 marcador de novo — clusterizar até o
            // último zoom escondia o pino sozinho de quem já tinha
            // "chegado" na região certa.
            disableClusteringAtZoom: 15,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
        }).addTo(map);
        clusterBairroRef.current = clusterBairro;

        mapRef.current = { map };
        setMapPronto(true);

        // O Leaflet guarda o tamanho do container em cache e só o recalcula no
        // resize da janela — o que não cobre este layout: o mapa fica em
        // display:none quando o mobile alterna para a lista, e volta com largura
        // diferente ao cruzar o breakpoint lg. Sem isto ele reabre com tiles
        // cinza até o usuário arrastar o mapa.
        const ro = new ResizeObserver(() => {
            if (containerRef.current?.offsetParent !== null) map.invalidateSize();
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            setMapPronto(false); // garante re-render ao remontar (StrictMode / HMR)
            map.remove();
            mapRef.current = null;
            marcCidadeRef.current = {};
            marcBairroRef.current = {};
            clusterBairroRef.current = null;
        };
    }, []);

    // ── Adiciona/atualiza marcadores e círculos ───────────────────
    useEffect(() => {
        if (!dados || dados.length === 0 || !mapPronto || !mapRef.current) return;
        const { map } = mapRef.current;
        let cancelado = false;

        // ── 1. Marcadores de BAIRRO (coordenadas manuais) ────────
        dados.forEach(d => {
            if (d.latitude == null || d.longitude == null) return;
            const chave = chaveRegiao(d);
            const cor   = corDoStatus(d.status);

            if (marcBairroRef.current[chave]) {
                marcBairroRef.current[chave].setPopupContent(
                    popupBairroHtml(d.cidade, d.bairro, cor, d.status)
                );
                return;
            }

            const marker = L.marker([d.latitude, d.longitude], { icon: criarIconeBairro(cor, false) })
                .bindPopup(popupBairroHtml(d.cidade, d.bairro, cor, d.status), { className: 'noc-popup', maxWidth: 240 });
            clusterBairroRef.current?.addLayer(marker);
            marker.on('click', () => onCidadeClick(chave));
            marker._cidadeId  = d.cidade_ixc_id;
            marker._cor       = cor;
            marker._coords    = { lat: d.latitude, lng: d.longitude };
            marcBairroRef.current[chave] = marker;
        });

        // ── 2. Marcadores de CIDADE ───────────────────────────────
        // Preferimos o centroide dos bairros da cidade, que vem de coordenada real
        // do cadastro; o Nominatim fica só para cidade sem nenhum bairro localizado.
        const cidadesUnicas = {};
        dados.forEach(d => {
            if (!cidadesUnicas[d.cidade_ixc_id]) {
                cidadesUnicas[d.cidade_ixc_id] = {
                    nome: d.cidade, estado: d.estado, status: d.status, pontos: [],
                };
            }
            if (d.latitude != null && d.longitude != null) {
                cidadesUnicas[d.cidade_ixc_id].pontos.push([d.latitude, d.longitude]);
            }
        });

        const centroide = (pontos) => pontos.length === 0 ? null : {
            lat: pontos.reduce((s, p) => s + p[0], 0) / pontos.length,
            lng: pontos.reduce((s, p) => s + p[1], 0) / pontos.length,
        };

        (async () => {
            setGeocodando(true);
            for (const [id, cidade] of Object.entries(cidadesUnicas)) {
                if (cancelado) break;
                if (marcCidadeRef.current[id]) continue;

                const local = centroide(cidade.pontos);
                const coords = local || await geocodificar(cidade.nome, cidade.estado);
                if (!coords || cancelado) { if (!local) await sleep(300); continue; }

                const cor = corDoStatus(cidade.status);

                const marker = L.marker([coords.lat, coords.lng], { icon: criarIconeCidade(cor, false) })
                    .addTo(map)
                    .bindPopup(popupCidadeHtml(cidade.nome, cidade.status, cor), { className: 'noc-popup', maxWidth: 240 });
                marker.on('click', () => onCidadeClick(id));
                marker._cidadeId  = id;
                marker._cor       = cor;
                marker._coords    = coords;
                marker._nome      = cidade.nome;
                marcCidadeRef.current[id] = marker;
                // Pausa só existe para respeitar o rate limit do Nominatim; quando
                // a coordenada veio do centroide local não há por que esperar.
                if (!local) await sleep(300);
            }
            if (!cancelado) setGeocodando(false);
        })();

        return () => { cancelado = true; };
    }, [dados, mapPronto]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Destaque ao selecionar cidade/bairro ─────────────────────
    useEffect(() => {
        if (!mapRef.current) return;
        const { map } = mapRef.current;

        // Marcadores de CIDADE
        Object.entries(marcCidadeRef.current).forEach(([id, marker]) => {
            const sel = id === String(cidadeSelecionada).split('::')[0] && !String(cidadeSelecionada).includes('::');
            marker.setIcon(criarIconeCidade(marker._cor, sel));

            if (sel) {
                map.flyTo([marker._coords.lat, marker._coords.lng], 12, { duration: 0.9 });
                marker.openPopup();
            }
        });

        // Marcadores de BAIRRO
        Object.entries(marcBairroRef.current).forEach(([chave, marker]) => {
            const clicouNoBairro = chave === cidadeSelecionada;
            const clicouNaCidade = marker._cidadeId === cidadeSelecionada;
            const sel = clicouNoBairro || clicouNaCidade;
            marker.setIcon(criarIconeBairro(marker._cor, sel));

            if (clicouNoBairro) {
                // zoomToShowLayer (não flyTo direto): o marcador pode estar
                // escondido dentro de um cluster agora — este método do plugin
                // dá o zoom mínimo pra ele aparecer sozinho antes de abrir o
                // popup, senão o popup abria "no nada" com o pino ainda oculto.
                if (clusterBairroRef.current) {
                    clusterBairroRef.current.zoomToShowLayer(marker, () => marker.openPopup());
                } else {
                    map.flyTo([marker._coords.lat, marker._coords.lng], 14, { duration: 0.9 });
                    marker.openPopup();
                }
            }
        });
    }, [cidadeSelecionada]);

    return (
        <div className="absolute inset-0 w-full h-full z-0">
            {/* Indicador de geocodificação — encostado à esquerda para não
                disputar o canto com a legenda nem com o zoom do Leaflet. */}
            {geocodando && (
                <div className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-md backdrop-blur-sm">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                    Localizando cidades…
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
