## Why

O mapa da Central de Cobertura exibe, desenhada dentro das tiles, a frase "API key required". O código atual não usa chave em nenhum provedor (CARTO Voyager em `CoverageMap.jsx`/`MapaPicker.jsx`, OSM em `Offices.jsx`) e os dois responderam normalmente em teste por `curl`, então a origem exata da mensagem ainda não está confirmada. Independentemente da causa, o produto depende de tiles raster de terceiros sem contrato (CARTO é gratuito só para uso não comercial), e o OpenFreeMap oferece tiles vetoriais sem chave nem cadastro.

## What Changes

- Trocar a fonte de tiles do fundo do mapa por um style vetorial do OpenFreeMap (`liberty`), renderizado como camada do Leaflet via `@maplibre/maplibre-gl-leaflet`.
- Manter Leaflet e `leaflet.markercluster` como estão: marcadores, popups (`.noc-popup`), clusters (`.noc-cluster`), `zoomToShowLayer` e `flyTo` não mudam.
- Centralizar a criação da camada base num único módulo, em vez de repetir a URL em cada mapa.
- Atribuição passa a "OpenFreeMap © OpenMapTiles Data from OpenStreetMap".
- Adicionar fallback: se o WebGL não estiver disponível ou o style não carregar, o mapa continua utilizável com tiles raster (OSM padrão), sem chave.
- Aplicar em `CoverageMap.jsx` e `coverage/MapaPicker.jsx`. `Offices.jsx` fica como decisão do Felix, marcada como tarefa opcional.
- Nova dependência: `maplibre-gl` e `@maplibre/maplibre-gl-leaflet`. Nenhuma dependência sai.

## Capabilities

### New Capabilities
- `mapa-base-tiles`: fonte de tiles do mapa base (sem API key), atribuição obrigatória e comportamento de fallback quando o WebGL ou o provedor falham.

### Modified Capabilities

## Impact

- Código: `src/components/CoverageMap.jsx`, `src/components/coverage/MapaPicker.jsx`, novo módulo compartilhado de camada base, opcionalmente `src/components/Offices.jsx`; ajuste de CSS da atribuição em `src/index.css` (já tem regras `.leaflet-control-attribution`).
- Dependências: `package.json` ganha `maplibre-gl` (~800 KB, só na rota de Cobertura, que já usa `React.lazy`) e `@maplibre/maplibre-gl-leaflet`.
- Rede: exige acesso a `tiles.openfreemap.org` a partir da rede da Prestek (host novo, a confirmar antes do deploy).
- Riscos: WebGL ausente em máquinas antigas (mitigado pelo fallback raster); a causa real da mensagem "API key required" pode ser build antigo em produção, caso em que só um redeploy resolve. A verificação inclui checar o host das tiles em produção antes e depois.
