---
target: Processos (Processos.jsx)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 3
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Processos.jsx"
target_fingerprint: "sha256:158fcb2b5c263f52d56d854ba5b7ae6c043859adefa9a546607c671b5be5d92c"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Processos.jsx"
timestamp: 2026-09-13T21-33-41Z
slug: src-components-processos-jsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Zero sinal, sempre, de que criar/editar um processo não é realmente salvo em lugar nenhum |
| 2 | Match System / Real World | 2 | Vocabulário certo, mas "Salvar" não salva — viola a expectativa mais básica do usuário |
| 3 | User Control and Freedom | 1 | `CategoriasAdminModal` (edita categoria REAL no banco) não tem Escape nem trap de foco — Tab escapa para "Novo Processo" atrás do modal |
| 4 | Consistency and Standards | 3 | Reaproveita bem o vocabulário de hero/chip/token; `STATUS_CONFIG` foge do sistema de tokens com Tailwind cru |
| 5 | Error Prevention | 1 | Boa validação de campo; zero prevenção do erro mais grave possível (perda silenciosa de todo o trabalho) |
| 6 | Recognition Rather Than Recall | 4 | `IconePicker` com busca ao vivo, ID com prefixo visível, ícones de categoria sempre visíveis |
| 7 | Flexibility and Efficiency | 3 | Export CSV, cards de categoria clicáveis como filtro, busca combinada — bem pensado, mas nunca exercitado com dado real |
| 8 | Aesthetic and Minimalist Design | 4 | Hero limpo, formulário bem seccionado, sem ruído visual |
| 9 | Error Recovery | 2 | Erros de campo com `role="alert"` corretos; o erro mais importante (perda de dado) não tem nenhum caminho de diagnóstico |
| 10 | Help and Documentation | 3 | Boas dicas contextuais nos campos |
| **Total** | | **24/40** | **Aceitável (60%)** |

*Nota: heurísticas 3 e 5 rebaixadas na síntese em relação à avaliação isolada da Assessment A (que viu só o `ProcessoModal`, corretamente implementado) — a Assessment B confirmou ao vivo que o `CategoriasAdminModal`, o único diálogo desta tela que grava em banco real, não tem Escape nem trap de foco.*

## Design Specificity Verdict

**LLM assessment**: O achado dominante é rastreável a duas linhas exatas: `processosData.js:72` (`export const PROCESSOS = [];`) e a ausência de qualquer rota `/api/processos*` em `backend/server.js`, cruzado com `Processos.jsx:786-794` (`salvarProcesso`, só estado local). Isso reenquadra toda a avaliação: ~metade do arquivo (tabela desktop, cards mobile, paginação, export CSV, cards de resumo por categoria) é código morto que nenhum usuário real jamais viu renderizar dado de verdade, porque a lista está sempre vazia.

**Deterministic scan**: 9 achados, todos "advisory". Falsos positivos confirmados: 3 tamanhos de fonte do hero idênticos a `Comunicados`/`Offices`/`TicketsList` (transversal já catalogado); 1 tamanho de glifo de ícone (`IconePicker`). Achado real mas de baixa severidade: o padrão de label de formulário (`text-[10px] font-extrabold ... uppercase tracking-widest`) se repete idêntico a `Offices.jsx` e 3× dentro do próprio arquivo — recomendado para a varredura tipográfica da Fase 16, não fix local.

**Achado que corrige uma suposição já registrada no programa**: `--foreground-faint`/`text-faint` — o substituto já estabelecido como "seguro" para `text-muted` em 6+ fases anteriores — na verdade **reprova 4,5:1 no tema AMOLED especificamente** (4,18:1 contra `--surface`, 3,88:1 contra `--surface-raised`), confirmado por medição ao vivo E recalculado de forma independente pela sessão orquestradora. O token JS equivalente (`C.ink2` em `useBentoTheme.js`, `#888888`) NÃO tem esse problema — os dois sistemas de token divergiram nesse ponto específico. Isso significa que toda fase anterior que usou `text-faint` como "a correção" para texto pequeno no AMOLED deixou o arquivo em ~4,18:1, uma melhoria real sobre `text-muted` (~3,0:1) mas ainda tecnicamente abaixo do piso de WCAG AA.

## Overall Impression

Esta é a tela com o formulário mais bem construído do programa até agora (foco inicial, trap de Tab, contador de caracteres, validação inline com `aria-invalid`/`role="alert"`, dica contextual por campo) — e ao mesmo tempo a mais grave em integridade: o CRUD inteiro de processos é fachada, sem nenhuma persistência real, e o único diálogo que edita dado real (categorias) tem zero semântica de teclado.

## What's Working

1. **`ProcessoModal` acerta a semântica de diálogo na primeira tentativa**: `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial no primeiro campo, trap de Tab completo, Escape com confirmação de descarte só quando o formulário está "sujo". É o padrão que outras fases tiveram que retrofitar como P0 — aqui já nasceu certo.
2. **Tratamento honesto do rascunho sem POP**: em vez do antipadrão `<a aria-disabled>` sem `href` (já flagrado como P2 recorrente em `SectorRow`/`EmployeeRow`), um rascunho sem link renderiza um `<span>` não-interativo com `title`/`aria-label` claros.
3. **`IconePicker`**: busca ao vivo sobre um conjunto curado de ícones, garante que o ícone atual continue selecionável mesmo se vier de fora da lista curada (dado legado), `aria-pressed` por ícone.

## Priority Issues

**[P0] `CategoriasAdminModal` — o único diálogo que edita dado real — não tem nenhuma semântica de teclado**
- **What**: Tem `role="dialog"`/`aria-modal`/`aria-labelledby`, mas nenhum `useEffect` de teclado: Escape não fecha (confirmado ao vivo), não há trap de Tab (Tab do último elemento focável escapou para o botão "Novo Processo" atrás do modal, confirmado ao vivo), sem foco inicial.
- **Why it matters**: Mesma classe de bug já corrigida como P0 nas Fases 5, 7, 10 e 11 — mais grave aqui porque este modal específico grava/exclui categorias na tabela real `categorias_processos`, ao contrário do `ProcessoModal` (que já está correto, mas edita dado fictício).
- **Fix**: Aplicar o mesmo padrão `useDismissable`+`trapTab` já usado em `ProcessoModal`/`ModalShell.jsx`/`OrgChartEditor.jsx`.
- **Suggested command**: /impeccable harden

**[P0] O CRUD de processos não persiste nada, sem nenhum aviso ao usuário**
- **What**: `PROCESSOS` (`processosData.js:72`) é um array estático permanentemente vazio; não existe rota `/api/processos*` no backend (só `/api/categorias-processos` é real); `salvarProcesso` só chama `setLista` — estado React local. Criar/editar um processo dá feedback de sucesso completo (modal fecha, item aparece no topo) mas desaparece ao recarregar a página, sem aviso.
- **Why it matters**: Pior que uma falha óbvia, porque o usuário só descobre a perda depois que já é tarde — destrói a confiança em qualquer "salvar" futuro no sistema. ~Metade do arquivo (tabela, cards mobile, paginação, export CSV, cards de resumo) é código nunca exercitado com dado real.
- **Fix (escopo desta fase)**: Adicionar um aviso visível e honesto ("dados de demonstração — não persistidos nesta versão") em vez de fingir que o CRUD é real. Construir a persistência de verdade (rota `/api/processos` + tabela no banco, espelhando o padrão já correto de `/api/categorias-processos`) é uma decisão de produto/engenharia maior, registrada em Pendências, não parte deste fix.
- **Suggested command**: /impeccable harden

**[P0] `--foreground-faint`/`text-faint` reprova contraste no AMOLED — correção de token na fundação, não neste arquivo isoladamente**
- **What**: Medido ao vivo e recalculado de forma independente: `#777777` (AMOLED) contra `--surface` (#121212) = 4,18:1; contra `--surface-raised` (#1A1A1A) = 3,88:1 — ambos abaixo do piso de 4,5:1. O token JS equivalente (`C.ink2`, `#888888`) já passa (5,29-5,59:1) — os dois sistemas de token divergiram.
- **Why it matters**: `text-faint` é usado como "a correção segura" em pelo menos 6 fases anteriores deste programa; a suposição de que ele "passa nos quatro temas escuros" (registrada em MEMORIA.md) está errada especificamente para o AMOLED — um achado que exige correção retroativa da suposição, não só desta tela.
- **Fix**: Corrigir `--foreground-faint` do bloco AMOLED em `src/index.css` para um valor que passe 4,5:1 contra `--surface` E `--surface-raised` (ex: alinhar com ou superar o `#888888` do token JS `C.ink2`) — um fix pequeno e contido, com alto alcance (beneficia todo arquivo que já usa `text-faint` corretamente).
- **Suggested command**: /impeccable harden

**[P1] Alvos de toque abaixo de 44px em 3 pontos**
- **What**: Chips de filtro de categoria (375×38px medido); ícones de editar/excluir do `CategoriasAdminModal` (34×40px); grade de ícones do `IconePicker` (36×36px).
- **Fix**: `min-h-[44px]` nos chips; padding real ou expansão por pseudo-elemento nos ícones do admin de categorias.
- **Suggested command**: /impeccable harden

**[P1] Sem checagem de permissão em "Novo Processo"/editar linha**
- **What**: Ao contrário de `CategoriasAdminModal` (corretamente restrito a `user?.is_admin`), abrir/criar/editar um processo é chamável por qualquer usuário autenticado.
- **Why it matters**: Hoje de baixo risco só porque nada persiste (P0 acima); no momento em que uma persistência real for construída sobre este mesmo contrato de frontend, o gap vira "qualquer um edita qualquer processo" silenciosamente.
- **Fix**: Definir o modelo de permissão pretendido agora e aplicar a mesma guarda de `user?.is_admin` (ou equivalente) antes que exista um backend que torne o gap consequente.
- **Suggested command**: /impeccable harden

**[P1] Categoria padrão hardcoded pode ficar órfã**
- **What**: `FORM_VAZIO.categoria = 'atendimento'` é um valor fixo, mas categorias são totalmente editáveis/excluíveis via `CategoriasAdminModal`, sem proteção contra remover o id usado como padrão; `handleSubmit` nunca valida que `categoria` é um id conhecido.
- **Fix**: Derivar o padrão de `categorias[0]?.id` em vez de um literal, e validar no submit que a categoria escolhida existe na lista atual.
- **Suggested command**: /impeccable harden

## Persona Red Flags

**Alex (Power User)**: Perderá trabalho real na primeira vez que navegar para outra tela e voltar — o cenário mais comum de uso intenso. Sem toast de sucesso após Criar/Salvar. Excluir categoria usa `window.confirm()` nativo sem desfazer, sem proteção contra excluir o id usado como padrão de novos processos.

**Sam (Accessibility)**: `CategoriasAdminModal` sem Escape nem trap — Tab escapa para a página por trás. Ícones do `IconePicker` (36px) e do admin de categorias (34×40) abaixo do mínimo de toque, sem técnica de expansão. `window.confirm()` quebra a semântica de diálogo customizada do resto da tela.

**Jordan (First-Timer)**: Com zero processos, o CTA "Cadastrar Primeiro Processo" é oferecido igualmente a admin e não-admin — um funcionário novo pode cair num formulário completo de criação de processo sem nenhuma indicação de que isso não é seu papel.

## Minor Observations

- Nome de processo (até 100 caracteres, com contador que convida a usar o orçamento) não tem `truncate`/`line-clamp` na célula da tabela desktop, ao contrário da descrição (que já usa `line-clamp-2` + `title`) — puramente latente até existir dado real.
- `StatusBadge`/`STATUS_CONFIG` usa classes Tailwind cruas (`green-100`/`green-900` etc.) em vez do sistema de tokens que o resto do arquivo já usa — vai destoar quando renderizado com dado real em Cyber/Aurora/AMOLED.
- Divs manuais `min-h-[30px]` como espaçador para alinhar campos com/sem dica — frágil, quebra silenciosamente se um campo ganhar/perder dica no futuro.
- Copy do diálogo de exclusão de categoria ("Processos que já usam essa categoria não serão afetados") descreve uma garantia sobre dado persistido que, dado o P0 de persistência, ainda não existe de verdade.

## Questions to Consider

- `Processos.jsx` foi de fato pensado para produção no estado atual, ou é um protótipo de UI que entrou no menu principal antes de ter backend? O nível de polimento investido (icon picker, export CSV, dashboards por categoria) sugere um time que *achava* que estava pronto.
- Categorias já têm backend real e admin-gated — por que processos em si não tiveram o mesmo tratamento? Decisão de escopo, descuido, ou "adicionamos depois" que ninguém rastreou?
