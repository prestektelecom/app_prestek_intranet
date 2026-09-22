import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';

// Fundo cartográfico único dos mapas da intranet. Vetorial (OpenFreeMap, sem
// chave de API); cai para raster OSM, também sem chave, se não houver WebGL
// ou se o style não carregar. Openspec: mapa-base-tiles.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const ATTR_VETORIAL =
    '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
    '© <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
    'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const ATTR_RASTER =
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TIMEOUT_STYLE_MS = 8000;

function temWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
        return false;
    }
}

function camadaRaster(map) {
    return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ATTR_RASTER,
        maxZoom: 19,
    }).addTo(map);
}

// Adiciona o fundo ao mapa Leaflet e devolve uma função que remove o que
// estiver ativo (útil no cleanup do useEffect).
export function adicionarCamadaBase(map) {
    let atual = null;
    let caiu = false;
    let timer = null;

    const fallback = () => {
        if (caiu) return;
        caiu = true;
        clearTimeout(timer);
        if (atual) { try { map.removeLayer(atual); } catch { /* mapa já removido */ } }
        atual = camadaRaster(map);
    };

    if (!temWebGL()) {
        fallback();
    } else {
        try {
            atual = L.maplibreGL({
                style: STYLE_URL,
                attributionControl: { customAttribution: ATTR_VETORIAL },
            }).addTo(map);
            const gl = atual.getMaplibreMap();
            gl.on('load', () => clearTimeout(timer));
            // Erro de style/fonte (sem tile nem source específicos) = provedor fora
            gl.on('error', (e) => { if (!e?.tile && !e?.sourceId) fallback(); });
            timer = setTimeout(fallback, TIMEOUT_STYLE_MS);
        } catch {
            fallback();
        }
    }

    const limpar = () => {
        clearTimeout(timer);
        caiu = true; // impede fallback tardio num mapa já destruído
        if (atual) { try { map.removeLayer(atual); } catch { /* já removido */ } }
    };
    map.once('unload', () => { clearTimeout(timer); caiu = true; });
    return limpar;
}
