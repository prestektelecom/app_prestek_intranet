## Context

Fase 11 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 11). Crítica dual-agent isolada 18/40 (Ruim) + audit técnico 11/20 (Aceitável) — pior nota de crítica do programa até agora. Escopo aprovado pelo Felix: P0 + P1.

## Decisões técnicas

### 1. Mapa/filtro: trocar a dependência do efeito, não reescrever a sincronização

O efeito de marcadores (linhas ~460-491) já tem a lógica certa de diff (adicionar/atualizar/remover por id) — o único bug é iterar `offices` em vez de `filtrados` e depender de `[mapPronto, offices]` em vez de `[mapPronto, filtrados]`. Basta trocar a fonte de dado nas duas ocorrências; a lógica de diff continua correta porque `filtrados` já é um subconjunto de `offices` com os mesmos objetos (mesma identidade de `id`). Ao aplicar o filtro, os marcadores fora do subconjunto são removidos pelo mesmo caminho que já remove markers de escritórios excluídos.

Bounds do mapa: ao mudar `filtro`/`busca`, um novo efeito refaz `map.fitBounds` sobre `filtrados` (com fallback para não quebrar quando `filtrados` está vazio — mantém o zoom/posição atual em vez de chamar `fitBounds` com um array vazio, que o Leaflet trata como erro).

### 2. Tema: mesmo padrão já aplicado no hero, generalizado para o resto do arquivo

`useBentoTheme()` já é chamado no componente raiz (`const C = useBentoTheme()`); só falta usar `C` em vez de hex cru nos elementos abaixo do hero. Mapeamento direto hex→token (todos os hex hardcoded já são exatamente os valores de `BENTO_LIGHT`, confirmado pela Assessment B):
- `#FFFFFF`/`bg-white` → `C.surface`
- `#0B1B2E` → `C.ink`
- `#475467` → `C.ink2`
- `#8896A8` → `C.muted` (só ícone/placeholder) ou `C.ink2` (texto real — a maioria dos casos aqui)
- `#E4ECF5` → `C.line`
- `#F7FAFD` → `C.surfaceSoft`
- `#FFF7ED` → `C.accentSoft`
- `#E84545` → `C.dangerFill`, com `C.onDanger` no texto sobre ele (Badge Pair Rule)
- `#1F8A5B` (sucesso do "coordenadas preenchidas") → `C.successStrong` ou equivalente
- O gradiente `from-[#9A3412] to-[#EC7D23]` (que hoje mistura hex do claro com hex do Aurora escuro) é substituído pelo mesmo gradiente de CTA primário já usado em `ServicesDirectory`/`ModalShell` (`C.accentDark`→`C.accent`, ou os literais já estabelecidos como "gradiente laranja da marca" nesse outro arquivo) — inverte corretamente por tema em vez de ser uma mistura fixa.
- Badge "Matriz" (texto branco sobre `#F97316`): troca para `C.onAccent` em vez de branco cru, resolvendo o 2,80:1 medido.

A moldura do mapa (`border-[#E4ECF5]`) e o popup do Leaflet ficam parcialmente fora: a moldura migra para `C.line` (é React, fácil); o conteúdo do popup (`popupHTML`, uma string HTML injetada fora da árvore React) fica com cor fixa por constrangimento técnico do Leaflet — registrado em Pendências, não nesta change.

### 3. Ações admin: revelar por foco/toque, não só hover; diálogos com o padrão já estabelecido

Trocar `opacity-0 group-hover/item:opacity-100` por `opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100` mais uma media query `(hover: none)` que mantém sempre visível em dispositivos de toque (mesmo princípio do hook `useTouchOnly` já usado em outras telas do projeto — aqui aplicado via CSS puro para não introduzir um novo padrão). `aria-label` explícito com o nome do escritório (`Editar ${office.nome}`) substitui o `title` como nome acessível, já que o texto do ícone (ligatura "edit"/"delete") vence o `title` no cálculo do nome acessível.

Os dois modais (`EscritorioModal` e o diálogo de exclusão inline) ganham o mesmo padrão `useDismissable`+`trapTab` local já usado em `ModalShell.jsx`/`OrgChartEditor.jsx`/`ServicesDirectory.jsx` (Fase 10) — reaproveitado pela terceira vez neste programa, reforçando que é hora de considerar extrair um hook/componente `Dialog` compartilhado numa fase futura de polish transversal, em vez de copiar o par `useDismissable`+`trapTab` arquivo por arquivo.

### 4. Mobile: hero mais compacto abaixo de `sm`, proporção lista/mapa revista

O hero mede a mesma altura em qualquer viewport hoje. Abaixo de `sm`, reduzir padding (`p-6`→`p-4`) e ocultar o painel de KPIs secundário (`Rede`) ou colapsá-lo numa única linha, liberando espaço vertical para a área de lista+mapa. A divisão `h-[45%]`/`h-[55%]` sobe para dar mais peso à lista (que é a que mais sofre hoje) — medir ao vivo o resultado em 375×812 antes de fechar o valor exato, em vez de escolher um número às cegas.

## Verificação

Cada fix verificado ao vivo via Playwright (claro + AMOLED, dado real de produção): mapa reagindo ao filtro/busca (contagem de marcadores batendo com `filtrados.length`); tema mudando em toda a tela (lista, modais, legenda, moldura) via `getComputedStyle`; ação de editar/excluir revelada em `.focus()` real e alcançável num teste de toque simulado; trap de Tab confirmado nos dois modais; contraste medido nos textos corrigidos; alvo de toque medido nos chips/busca; layout mobile medido em 375×812 com altura de lista+mapa registrada antes/depois.
