## Context

Fase 12 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 12). Crítica dual-agent isolada 24/40 (Aceitável) + audit técnico 10/20 (Aceitável, no limite inferior). Escopo aprovado pelo Felix: P0 + P1, incluindo o aviso de não-persistência.

## Decisões técnicas

### 1. `CategoriasAdminModal`: reaproveitar o padrão já correto no mesmo arquivo

`ProcessoModal`, no mesmo arquivo, já implementa `role="dialog"`/`aria-modal`/`aria-labelledby` + foco inicial + trap de Tab + Escape com confirmação de descarte (linhas 171-217). `CategoriasAdminModal` só tinha os atributos ARIA estáticos, sem nenhum `useEffect` de teclado. A correção replica o mesmo padrão: um `modalRef`, foco inicial no primeiro campo focável (o botão "Fechar", já que não há um campo de formulário óbvio para focar primeiro — segue o mesmo padrão de `useDismissable`), trap de Tab local, Escape fechando direto (este modal não tem um formulário "sujo" que precise de confirmação de descarte — os dados são persistidos individualmente por categoria via submit, não em lote).

### 2. Aviso de não-persistência: honestidade na UI, não um backend novo

Construir `/api/processos` + tabela no banco é uma mudança de escopo muito maior que o resto desta change (schema, migration, rotas, testes de carga com dado real) — decisão de produto/engenharia que o Felix já sinalizou ficar de fora. A correção de escopo desta fase é um aviso inline, visível sempre que a tela é usada, explicando que os processos são dados de demonstração não persistidos — mesma família de solução já usada no programa quando um dado "parece real mas não é" (o aviso de fallback local em `ServicesDirectory.jsx`/`AvisoDadosLocais`, Fase 10).

### 3. `--foreground-faint` no AMOLED: fix na fundação, não no arquivo

O bug não é "Processos.jsx usa o token errado" — é o TOKEN em si que está errado no bloco AMOLED de `src/index.css`. Trocar por outro token dentro de `Processos.jsx` não resolveria nada (o próximo arquivo que usar `text-faint` corretamente ainda herdaria o problema). A correção muda o valor de `--foreground-faint` (`src/index.css`, bloco `.dark-amoled`) de `#777777` para `#999999` — escolhido para manter a distinção de contraste que o token tem nos outros 4 temas (`faint` sempre mais contrastante que `muted`, nunca igual), calculado para passar 4,5:1 contra `--surface` (#121212, resulta em ~6,6:1) E `--surface-raised` (#1A1A1A, resulta em ~6,1:1) — a combinação mais exigente das duas. O token JS equivalente (`C.ink2` em `useBentoTheme.js`, `#888888`) já passava nos dois fundos e não precisa mudar; os dois sistemas de token divergiram só nesse ponto específico.

Esta é uma correção pontual e de baixo risco (uma linha, dentro do próprio bloco de tema já dedicado ao AMOLED) com alcance amplo (beneficia todo arquivo já migrado para `text-faint` neste tema) — verificada isoladamente antes de mexer no arquivo desta fase.

### 4. Alvos de toque e permissão de edição

Chips de categoria ganham `min-h-[44px]` (mesmo padrão já aplicado em Serviços/Escritórios). Os ícones de editar/excluir do admin de categorias (34×40px) ganham padding real maior, seguindo o mesmo ajuste feito em `TechBentoCard.jsx`/`StreamingBentoCard.jsx` na Fase 10 (aumentar a caixa real em vez de só expandir por pseudo-elemento, já que aqui também são dois botões adjacentes). O grid do `IconePicker` (36px, ~29 opções) fica de fora do fix desta fase — expandir 29 alvos de toque numa grade densa sem quebrar o layout é um trabalho maior, registrado como P2 em Pendências.

"Novo Processo" e o `onClick` de editar linha ganham a mesma guarda `user?.is_admin` já usada em "Gerenciar Categorias" — não-admin deixa de ver o botão/abrir o modal de criação; para um não-admin clicar numa linha existente, a decisão é manter a leitura possível (não é um modo "somente-leitura" formal, é simplesmente que abrir para editar sem ser admin não altera nada real hoje — dado o P0 de não-persistência, o risco prático é zero enquanto não existir backend; documentado como comportamento a revisitar quando a persistência real for construída).

### 5. Categoria padrão órfã

`FORM_VAZIO.categoria: 'atendimento'` vira `categorias[0]?.id ?? ''` calculado no momento de abrir o modal de novo processo (não no módulo, já que `categorias` só está disponível depois do fetch). `handleSubmit` ganha uma validação extra: se `form.categoria` não estiver entre os ids de `categorias`, mostra erro em vez de submeter um valor órfão.

## Verificação

Cada fix verificado ao vivo via Playwright: `CategoriasAdminModal` — Escape fecha, foco inicial dentro do diálogo, Tab preso (não escapa para "Novo Processo"); aviso de não-persistência visível na tela; `getComputedStyle`+luminância relativa confirmando `--foreground-faint` novo passando 4,5:1 contra `--surface` e `--surface-raised` no AMOLED; alvos de toque medidos; "Novo Processo" oculto/guardado para sessão não-admin (verificado por leitura de código e, se possível, simulando `user.is_admin=false` no DOM); categoria padrão nunca aponta para um id ausente da lista carregada.
