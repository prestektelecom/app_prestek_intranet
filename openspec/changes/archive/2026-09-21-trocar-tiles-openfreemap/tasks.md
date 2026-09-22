## 1. Diagnóstico prévio

- [x] 1.1 (resolvido 2026-09-21: ambiente é localhost:5000 com código CARTO; ver MEMORIA.md) Em produção, abrir a Central de Cobertura e registrar o host e o status das requisições de tile (aba Network) para confirmar a origem da mensagem "API key required"
- [x] 1.2 Confirmar que a estação/rede da Prestek alcança `tiles.openfreemap.org` (style `liberty` e um tile vetorial)
- [x] 1.3 Anotar o tamanho atual do chunk de Cobertura (`npx vite build`) para comparação — baseline: 78,71 kB (gzip 21,02 kB)

## 2. Dependências e módulo base

- [x] 2.1 Adicionar `maplibre-gl` e `@maplibre/maplibre-gl-leaflet` ao `package.json`
- [x] 2.2 Criar `src/components/map/baseLayer.js` com a função que adiciona a camada base ao mapa Leaflet (style `liberty`, atribuição do OpenFreeMap + OSM)
- [x] 2.3 Implementar a detecção de WebGL e o fallback raster OSM (na ausência de WebGL e na falha de carregamento do style), sem recarregar a página

## 3. Aplicar nos mapas

- [x] 3.1 `CoverageMap.jsx`: substituir o `L.tileLayer` do CARTO pela função do módulo base
- [x] 3.2 `coverage/MapaPicker.jsx`: idem
- [x] 3.3 (feito via 5.0b) Ajustar `src/index.css` da atribuição se algum tema reprovar 4,5:1
- [x] 3.4 `Offices.jsx` adota o mesmo módulo (decisão do Felix, 2026-09-21): import dinâmico do `baseLayer` + `maxZoom: 18` no `L.map`. Conferir ao vivo: marcadores, chip AL/SE, busca, popup

## 4. Verificação

- [x] 4.1 `npx vite build` limpo; comparar o chunk de Cobertura com o valor de 1.3 — resultado: 1.141 kB (gzip 308 kB), ~14× o baseline, acima da estimativa do design (~800 KB); só a rota de Cobertura paga
- [x] 4.2 Ao vivo, só leitura: mapa carrega sem texto de "API key", sem chave nas requisições, atribuição visível — confirmado pelo Felix em 2026-09-21 ("ficou top", aparentemente mais leve). Achado no caminho: markercluster lançava "Map has no maxZoom specified" porque a camada MapLibre não informa maxZoom; corrigido com `maxZoom: 19` nas opções de `L.map` (CoverageMap e MapaPicker)
- [x] 4.3 (Felix: "passou", 2026-09-21) Ao vivo: cluster, clique em marcador, popup, seleção na lista com `zoomToShowLayer` e `flyTo` funcionando; busca/filtros refletidos no mapa
- [x] 4.4 Ao vivo: `MapaPicker` (arrastar pino, clicar no mapa) sem gravar override real
- [x] 4.5 Contraste da atribuição nos 5 temas (claro, escuro, Cyber, Aurora, AMOLED)
- [x] 4.6 Simular WebGL indisponível e style bloqueado: fallback raster aparece, marcadores e popups seguem funcionando
- [x] 4.7 (não se aplica: não era build antigo em produção) Se 1.1 mostrar build antigo em produção, registrar e planejar o redeploy

## 5. Fechamento

- [x] 5.0 `/impeccable audit` na Central de Cobertura — 2026-09-21: 13/20 (Aceitável), 0 P0, 1 P1 (atribuição do mapa reprova 4,5:1 em todos os temas, 2,1–3,5:1 no texto; contraste calculado, não medido ao vivo). Detector: 0 antipadrões.
- [x] 5.0b P1 da atribuição corrigido em `index.css`: chip claro fixo (.92 branco) com texto #475569 (7,28:1) e link #C2410C (4,98:1 no pior caso, sobre água); fonte 9→11px. Contraste calculado; conferir visualmente (4.5). Build limpo.

- [x] 5.1 Registrar a decisão e o resultado em `MEMORIA.md` (Decisões/Ambiente) e arquivar a change
