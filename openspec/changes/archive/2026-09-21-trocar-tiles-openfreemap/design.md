## Context

Hoje há três pontos que criam a camada base por conta própria: `CoverageMap.jsx` e `coverage/MapaPicker.jsx` (raster CARTO Voyager) e `Offices.jsx` (raster OSM). Cada um repete a URL e a string de atribuição. Motivação e escopo em `proposal.md`; requisitos em `specs/mapa-base-tiles/spec.md`.

Restrições que moldam a abordagem:
- A tela de Cobertura já carrega via `React.lazy`, então uma dependência pesada só custa nessa rota.
- Marcadores, clusters (`leaflet.markercluster`), `zoomToShowLayer` e o CSS `.noc-popup`/`.noc-cluster` foram verificados ao vivo em várias rodadas e não devem mudar.
- O projeto não tem staging: qualquer teste ao vivo acontece contra a produção real.
- A causa da mensagem "API key required" não foi confirmada (ver Risks).

## Goals / Non-Goals

**Goals:**
- Um único módulo que cria a camada base, usado pelos mapas de Cobertura.
- Fundo vetorial do OpenFreeMap sem chave, com fallback raster automático.
- Zero mudança visível de comportamento nos marcadores, popups e clusters.

**Non-Goals:**
- Migrar para react-map-gl/MapLibre puro (caminho B, descartado nesta change).
- Trocar tiles em `Offices.jsx` por padrão (tarefa opcional, decisão do Felix).
- Hospedar tiles próprios.
- Alterar tema do mapa por tema do produto (um style único; ver Decisions).

## Decisions

**1. Leaflet + `@maplibre/maplibre-gl-leaflet`, não react-map-gl.**
O plugin renderiza o style vetorial como uma camada do Leaflet, então todo o código de marcadores/clusters fica intacto. A migração completa reescreveria ~470 linhas verificadas por um ganho que o problema atual não exige. Alternativa considerada: caminho B; fica para outra change se algum dia se quiser rotação, 3D ou clusters via GeoJSON.

**2. Style `liberty` do OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`).**
Legível, com rótulos em português onde há dado, e visualmente próximo do Voyager atual. Alternativas: `bright` (mais saturado) e `positron` (mais neutro, bom para destacar marcadores coloridos). Fica `liberty`; trocar é uma constante.

**3. Módulo compartilhado `src/components/map/baseLayer.js`.**
Exporta uma função que recebe o mapa Leaflet e adiciona a camada base, encapsulando: detecção de WebGL, criação da camada MapLibre, ouvinte de erro do style e o fallback. `CoverageMap.jsx` e `MapaPicker.jsx` chamam a mesma função; a URL e a atribuição existem em um lugar só.

**4. Fallback raster OSM (`tile.openstreetmap.org`).**
Acionado se `WebGLRenderingContext` não existir ou não criar um contexto, ou se o carregamento do style falhar. Escolhido por não exigir chave e por já ser usado em `Offices.jsx`. O fallback troca a camada em runtime, sem recarregar. Para CARTO, o mesmo argumento de uso comercial que motivou a mudança impede mantê-lo como reserva.

**5. Atribuição e CSS.**
A atribuição vem do módulo (texto do OpenFreeMap + link do OSM). As regras existentes de `.leaflet-control-attribution` em `src/index.css` continuam valendo; será medido o contraste nos 5 temas (a regra `.dark` cobre só o fundo escuro genérico, então Cyber/Aurora/AMOLED precisam de conferência ao vivo).

**5b. Um style único para todos os temas.**
Reaproveita o estado atual (o mapa raster também não mudava por tema). Um mapa claro no tema AMOLED já é a realidade hoje; o style escuro do OpenFreeMap não existe como oficial, então não se inventa um.

**6. Carregamento da dependência.**
`maplibre-gl` e o plugin são importados dentro dos módulos da rota de Cobertura (já em chunk lazy), e o CSS do `maplibre-gl` só é necessário se um controle do MapLibre for usado; como só o canvas é usado, ele é omitido até que a verificação mostre necessidade.

## Risks / Trade-offs

- [A causa real do "API key required" pode ser build antigo em produção] → Antes de implementar, registrar o host das tiles que falham (aba Network em produção). Se for build antigo, redeploy sozinho resolve e a troca de provedor continua valendo como redução de dependência, mas a expectativa deve ser ajustada.
- [`tiles.openfreemap.org` bloqueado na rede da Prestek] → Testar acesso a partir da rede da operação antes do deploy; o fallback raster cobre o bloqueio parcial do host vetorial (não cobre bloqueio total de internet).
- [WebGL indisponível em PCs antigos ou VMs] → Detecção explícita e fallback raster (requisito na spec).
- [Peso do `maplibre-gl` (~800 KB)] → Fica só no chunk de Cobertura; conferir o tamanho do chunk no `npx vite build` antes e depois.
- [Conflito de versões/CSS entre Leaflet e MapLibre] → Verificar ao vivo zoom, arrasto e cluster; o plugin sincroniza a câmera do MapLibre com a do Leaflet, mas o `flyTo` animado precisa de teste específico.
- [Camada MapLibre não informa maxZoom ao Leaflet — `leaflet.markercluster` lança "Map has no maxZoom specified"] → `maxZoom: 19` declarado no próprio `L.map` (achado e corrigido na verificação).
- [Serviço gratuito sem SLA] → Aceito para uma intranet; o fallback raster mitiga indisponibilidade. Se o uso crescer, hospedar tiles próprios é uma change separada.
- [Erro de teste em produção sem staging] → Verificação só de leitura (abrir mapa, zoom, seleção), nunca gravando override real.

## Migration Plan

1. Implementar em branch, `npx vite build` limpo, comparar o tamanho do chunk de Cobertura.
2. Verificar ao vivo (sessão real, só leitura) em claro e AMOLED, e simulando WebGL desligado.
3. Deploy normal; rollback é reverter o commit (nenhum dado ou API do backend muda).
