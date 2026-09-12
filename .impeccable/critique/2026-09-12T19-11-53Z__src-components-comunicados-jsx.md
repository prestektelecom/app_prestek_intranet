---
target: src/components/Comunicados.jsx
total_score: 17
max_score: 36
na_heuristics: 10
p0_count: 2
p1_count: 2
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Comunicados.jsx"
target_fingerprint: "sha256:ab66e3a8d54416d99040bef54078b9bc01e1e60bb3958a34af0f9069343ed969"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Comunicados.jsx"
timestamp: 2026-09-12T19-11-53Z
slug: src-components-comunicados-jsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

## Design Health Score

| # | Heuristica | Nota | Achado-chave |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 2 | Skeleton bom, mas hero KPI e contagem dos chips usam universos de dados diferentes |
| 2 | Match System / Real World | 3 | PT-BR fluente, mas conteudo real e texto colado do WhatsApp com asteriscos de markdown cru |
| 3 | User Control and Freedom | 1 | Nem CrudModal nem DeleteModal fecham com Escape ou clique fora |
| 4 | Consistency and Standards | 2 | Badges/chips usam tom base em vez de *Strong/onAccent - mesmo bug da Fase 3, recorrente |
| 5 | Error Prevention | 2 | Sem limite/preview de tamanho da descricao |
| 6 | Recognition Rather Than Recall | 2 | Botoes de icone so com title, sem aria-label |
| 7 | Flexibility and Efficiency | 1 | Zero atalhos; chips sem indicador de foco visivel |
| 8 | Aesthetic and Minimalist Design | 2 | Corpo dos cards em dado real e parede de emoji/asteriscos sem truncamento |
| 9 | Error Recovery | 2 | alert() cru com mensagem de erro do backend - repete antipadrao banido na Fase 2 |
| 10 | Help and Documentation | n/a | Ferramenta interna Operate |
| Total | | 17/36 | Ruim (47%) |

## Veredito de Especificidade de Design

LLM (A): chrome claramente autoral (hero, chips, painel de KPI escuro), mas o conteudo real - texto colado do WhatsApp com asteriscos nunca renderizados, emoji em excesso, paragrafos de 300-600 palavras - nao e acomodado: sem sanitizacao, truncamento ou "ler mais". Nota: produto real so tem 3 tipos (Urgente/Importante/Geral), "Aviso" nao existe no codigo.

Deterministico (B): 5 achados reais de fonte fora da rampa, sem falsos positivos de icone. Overlay: contrastes confirmados por codigo e ao vivo - botao branco sobre #EC7D23 (2.8:1), badge IMPORTANTE #CA8A04 sobre #FEFCE8 (2.8:1), chips inativos #8896A8 sobre #F7FAFD (2.9:1), todos usando tom base em vez de tokens Strong/Fill/onAccent ja existentes. Falsos positivos descartados: low-contrast branco-sobre-quase-branco no hero (gradiente em background-image) e text-occlusion no select de ordenacao.

## Impressao Geral

Chrome segue o sistema corretamente nos 2 temas testados. Dois problemas serios - modais sem semantica de dialogo, e um card do Painel Admin com texto quase invisivel em tema escuro - mais conteudo real quebrando a legibilidade, deixam a pontuacao Ruim, pior que a Fase 4.

## Pontos Fortes

1. ErrorState - copy em PT-BR simples e tranquilizadora, com retry funcional.
2. SkeletonCard - espelha proporcoes reais do card, evita saltos na transicao.
3. Consistencia do hero entre temas - gradiente, KPIs e chips mantem hierarquia em claro e Cyber-Obsidian.

## Problemas Prioritarios

[P0] Nenhum dos dois modais (CrudModal, DeleteModal) tem gerenciamento de foco, semantica de dialogo ou fechamento por teclado
Por que importa: confirmado ao vivo - foco nunca entra no modal, sem role=dialog/aria-modal, Escape nao fecha, sem clique-fora, Tab percorre a pagina por tras do modal antes dos campos do proprio formulario. Pior que o bug ja achado no ManagePlantaoModal da Fase 4.
Fix: mover foco ao abrir, prender Tab/Shift+Tab, ligar Escape ao Cancelar, adicionar role=dialog/aria-modal/aria-labelledby.
Comando sugerido: /impeccable harden

[P0] AdminComunicados.jsx: card com bg-white fixo + titulo em C.ink do tema - texto quase invisivel em tema escuro
Por que importa: confirmado ao vivo em Cyber-Obsidian - os 4 cards do Painel Admin viram texto fantasma branco-sobre-branco. Mesmo padrao do P0 ja corrigido na Fase 4 (PlantaoHistorico.jsx).
Local: AdminComunicados.jsx:257 (bg-white) e :295 (color: C.ink).
Fix: trocar bg-white por token de superficie.
Comando sugerido: /impeccable harden

[P1] Badges e chips usam o tom base do token como texto, em vez de Strong/Fill/onAccent - recorrencia do bug da Fase 3
Por que importa: medicoes ao vivo - badge IMPORTANTE 2.84:1, chip ativo branco-sobre-laranja 2.79:1, chips inativos 2.9:1. Tokens corretos ja existem em useBentoTheme.js, so nao sao usados em getTypeMeta e ChipButton.
Fix: trocar para os tokens Strong/Fill/onAccent existentes.
Comando sugerido: /impeccable audit

[P1] Corpo dos comunicados renderiza texto bruto e sem limite - dado real quebra a escaneabilidade
Por que importa: 3 de 4 comunicados reais tem paragrafos de 300-600 palavras, asteriscos nunca renderizados, sem line-clamp. Em mobile um card pode ocupar a tela inteira.
Fix: truncar em 3-4 linhas com line-clamp + "Ler mais"; tratar asteriscos literais.
Comando sugerido: /impeccable harden

[P2] Erros de salvar/excluir caem num alert() cru com a mensagem de erro do backend
Por que importa: Comunicados.jsx:155 e :185 usam alert() com data.erro cru - repete o antipadrao ja banido na Fase 2 (Login).
Fix: substituir por toast/estado inline como o ErrorState.
Comando sugerido: /impeccable harden

[P2] Chips de filtro sem indicador de foco visivel; select de ordenacao sem rotulo acessivel
Por que importa: ChipButton computa outline:none sem substituto; select sem aria-label/label associado.
Fix: adicionar anel de foco ao ChipButton; aria-label ao select.
Comando sugerido: /impeccable harden

## Red Flags por Persona

Sam: modais sem sinal a leitor de tela; Escape nao funciona; chips sem anel de foco.
Riley: dado real de producao ja quebra o feed; alert() vaza erro cru do backend; KPI do hero e contagem dos chips vem de conjuntos de dados diferentes.
Casey: card pode exceder uma tela inteira a 390px; chips quebram linha em vez do scroll horizontal prescrito pelo DESIGN.md.

## Observacoes Menores

- Hierarquia de headings pula do h1 direto para h3 em cada card, sem h2.
- Botoes de icone usam so title, nao aria-label, contra a regra do DESIGN.md.
- Placeholder da busca cortado sem reticencias a 390px.
- AdminComunicados.jsx formata data diferente de Comunicados.jsx para o mesmo campo.
- Copy diverge: "DEPTO." vs "DEPTO:" entre as duas telas.
- Typo em dado real: "Comerical" em vez de "Comercial".
- Link externo sem indicacao de nova aba para leitor de tela.

## Perguntas para Refletir

1. O formulario de criacao nao deveria mostrar uma pre-visualizacao de como o comunicado vai aparecer no feed?
2. Vale a pena extrair um componente TypeBadge/ChipButton compartilhado, ja que esse bug de token recorreu da Fase 3?
3. O painel de KPIs do hero esta valendo o espaco em dado real, ou serviria melhor aparecer so quando ha algo urgente?
