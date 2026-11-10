# Audit técnico — Comunicados

Data: 2026-11-09 · Alvo: `src/components/Comunicados.jsx` (tela Comunicados), `src/hooks/useComunicados.js`, a cópia de gestão `src/components/admin/AdminComunicados.jsx` e as rotas `/api/comunicados` do `backend/server.js`.

**Evidência e limites.** `impeccable detect` (5 avisos de fonte, nenhum outro), leitura do código e contraste calculado a partir dos tokens de `useBentoTheme.js` (WCAG 2.x, nos 5 temas; o vidro do Cyber foi aproximado por um fundo opaco `#0F1A29`). **Não houve execução no navegador nesta rodada** (não há staging e o `backend/.env` aponta para produção): foco, truncamento do texto, altura do modal e contraste da cauda do gradiente do hero vêm de leitura de código e conta, e estão marcados `(não renderizado)`. Antes de fechar os P1, confirmar com Playwright e API simulada, como no audit do Início.

## Placar

| # | Dimensão | Nota | Achado principal |
|---|---|---|---|
| 1 | Acessibilidade | 2 | foco removido por `outline: none` inline; rótulos sem `htmlFor`; select de ordenação sem nome; texto cortado sem como ler |
| 2 | Desempenho | 3 | estado de hover em cada card, `transition: all`, atraso de entrada de 30 ms por card sem teto |
| 3 | Temas | 2 | branco sobre laranja e sobre vermelho, texto de chip com token base em vez de `-Strong`, scrim e sombras fixos |
| 4 | Responsivo | 3 | modal sem altura máxima nem rolagem; select de 36 px, "Ler mais" de ~17 px, campos de 14 px |
| 5 | Integridade | 2 | duas telas de CRUD divergentes; editar pelo Painel Admin apaga a imagem do comunicado |
| | **Total** | **12/20** | **Aceitável** (10 a 13: trabalho significativo) |

## Veredito de integridade

**Reprova, por pouco.** A tela tem identidade própria e usa os tokens (`useBentoTheme`, tons `-Strong` nos selos de tipo, `useDismissable`, store único de polling). O que reprova é a duplicação: o CRUD de `Comunicados.jsx` e o de `AdminComunicados.jsx` são duas implementações com o mesmo propósito e já divergiram (a de gestão tem `htmlFor`, `aria-label="Fechar"` e `aria-hidden` nos ícones; a da tela não tem; só a da tela tem o campo de imagem). Essa divergência é a raiz de dois P1 abaixo.

## Resumo

- Total: **11 achados**, 6 P1, 4 P2, 1 P3 (os P3 de fonte vão agrupados).
- Mais graves: foco invisível nos botões da tela, contraste de ação destrutiva nos escuros, texto de comunicado cortado sem "Ler mais", modal que não rola em tela baixa, edição pelo Admin que apaga a imagem.

## Achados

### P1

**1. Foco de teclado removido nos botões e nos campos**
- Local: `Comunicados.jsx` linhas 505 (`ChipButton`), 818 (Tentar novamente), 875 (Limpar filtros), 911 (campos do modal), 1133, 1158 (Cancelar/Publicar), 1278, 1298 (Cancelar/Excluir).
- Categoria: Acessibilidade. WCAG 2.4.7 e 1.4.11.
- Impacto: o `outline: 'none'` inline vence a regra global `:focus-visible` do `index.css` (que diz "nenhum componente usa `outline: none`"). Quem navega por teclado não vê onde está nos filtros, no modal e na confirmação de exclusão. Nos campos sobra só a borda `accent`, que no tema claro dá 2,66:1 contra o fundo do campo (precisa 3:1). `(não renderizado)`
- Correção: tirar o `outline: 'none'` e deixar o anel global; nos campos, manter o anel e usar a borda só como reforço.
- Comando: `/impeccable harden`.

**2. Texto do comunicado cortado sem como ler (`(não renderizado)`)**
- Local: `Comunicados.jsx` 657-691. O parágrafo corta em 4 linhas (`WebkitLineClamp: 4`) com `pre-wrap`, mas o botão "Ler mais" só aparece com `descricaoLimpa.length > 220`.
- Categoria: Integridade / Acessibilidade.
- Impacto: comunicados colados do WhatsApp têm muitas quebras de linha. Um texto de 8 linhas curtas (~160 caracteres) é cortado em 4 e **não mostra "Ler mais"**: parte do aviso fica inalcançável. O inverso também ocorre (texto de 230 caracteres que cabe em 3 linhas mostra "Ler mais" sem nada a expandir).
- Correção: decidir o botão pela medida real (`scrollHeight > clientHeight` num `ref`, com `ResizeObserver`), não pelo número de caracteres. Acrescentar `aria-expanded` ao botão.
- Comando: `/impeccable harden`.

**3. Campos sem nome acessível**
- Local: `Comunicados.jsx` 991-1100 (os 6 `<label>` não têm `htmlFor` nem envolvem o campo), 278 (select "Mais recentes primeiro" sem rótulo), 967 (botão fechar do modal só com o ícone `close`, sem `aria-label`).
- Categoria: Acessibilidade. WCAG 1.3.1, 3.3.2, 4.1.2.
- Impacto: o leitor de tela anuncia "campo de edição" sem nome e lê "close" em inglês. Clicar no rótulo não foca o campo. A cópia do Painel Admin já faz certo (`htmlFor`, `aria-label="Fechar"`).
- Correção: `id`/`htmlFor` em todos, `aria-label="Ordenar comunicados"` no select, `aria-label="Fechar"` no botão.
- Comando: `/impeccable harden`.

**4. Contraste de texto abaixo de 4,5:1 (WCAG 1.4.3)**

| Onde | Par | Medido | Temas afetados |
|---|---|---|---|
| "Tentar novamente" (L810) | `white` sobre `C.accent`, 13 px bold | 2,79:1 claro; 2,80 Default/Cyber/AMOLED; 2,26 Aurora | todos |
| "Sim, excluir!" (L1292) | `white` sobre `C.danger`, 13 px bold | 3,91 claro; 2,78 Default; 3,68 Cyber; 3,80 Aurora (AMOLED 5,48 passa) | 4 de 5 |
| Chip ativo, texto | token base sobre o próprio tom a 12% | accent 2,48; warning 2,61; danger 3,34; success 3,73 (claro); danger 3,45 AMOLED, 4,35 Aurora, 4,36 Cyber | claro, Cyber, Aurora, AMOLED |
| Contagem do chip ativo | `onAccent` sobre a cor, 11 px bold | danger 4,43 e success 4,00 (claro); danger 3,61 AMOLED | claro, AMOLED |
| Rótulos dos campos, data, "DEPTO." | `C.muted` 11 px sobre `surface` | 3,01:1 | claro |

- Categoria: Temas / Acessibilidade.
- Impacto: o próprio `useBentoTheme.js` documenta que branco sobre o `accent` dá 2,8:1 e que existem os pares `onAccent`, `dangerFill`/`onDanger` e os tons `-Strong` justamente para isso. A confirmação de exclusão, a ação mais séria da tela, é a que menos se lê nos escuros.
- Correção: retry com `C.onAccent`; excluir com `C.dangerFill` + `C.onDanger`; texto do chip ativo com `warningStrong`/`dangerStrong`/`successStrong` e laranja com `accentDark`; rótulos em `C.ink2`.
- Comando: `/impeccable colorize` (aplica os pares de tokens) e `/impeccable audit` depois.

**5. Modal sem altura máxima nem rolagem (`(não renderizado)`)**
- Local: `Comunicados.jsx` 928-943 (`overflow: 'hidden'`, sem `maxHeight`), formulário com 5 campos mais textarea e rodapé, cerca de 640 px de altura.
- Categoria: Responsivo. WCAG 1.4.10 (reflow).
- Impacto: em celular na horizontal, com zoom de 200% ou com teclado aberto, o rodapé "Publicar Aviso" fica cortado e inalcançável. O scrim é `fixed` e não rola.
- Correção: `maxHeight: calc(100dvh - 32px)` com o corpo do formulário em `overflowY: auto` e o cabeçalho e o rodapé fixos.
- Comando: `/impeccable adapt`.

**6. Editar pelo Painel Admin apaga a imagem do comunicado**
- Local: `AdminComunicados.jsx` L65 (o formulário de edição não carrega `imagem_url`) e L80 (envia `{...form}`); `backend/server.js` L378 grava `imagem_url || null` no `PUT`. O carrossel do Início usa `slide.imagem_url` (`Dashboard.jsx` L545).
- Categoria: Integridade (perda de dado entre telas).
- Impacto: cada edição feita no Painel Admin troca a imagem de capa por `NULL`, e o slide do Início perde a foto sem aviso. Editar pela tela Comunicados mantém, porque lá o campo existe.
- Correção: no `PUT`, só atualizar `imagem_url` quando vier no corpo (`COALESCE($6, imagem_url)` com `undefined` distinto de string vazia), e/ou carregar o campo no Admin. Resolvido de vez com o achado 7.
- Comando: `/impeccable harden` (e é backend, então sem o passo visual).

### P2

**7. Duas implementações de CRUD de comunicado**
- `Comunicados.jsx` (`CrudModal`, `DeleteModal`) e `AdminComunicados.jsx` repetem formulário, validação e exclusão com acessibilidade diferente. Um componente único (`ComunicadoForm`) elimina os achados 3 e 6 pela raiz.
- Comando: `/impeccable extract`.

**8. Link do comunicado sem checar o esquema**
- `Comunicados.jsx` L717 usa `item.link_opcional` direto em `href`. O `<input type="url">` aceita `javascript:...` e o backend não valida (`server.js` L344-366). Só quem tem a permissão `comunicados` grava, mas o público é a empresa toda: um link com esquema perigoso executa no clique de qualquer colaborador.
- Correção: aceitar só `http:`/`https:` no front (ao renderizar) e no backend (ao gravar).
- Comando: `/impeccable harden`.

**9. Ícones de fonte lidos pelo leitor de tela e filtros sem estado**
- Os spans `material-symbols-outlined` (selo de tipo L571, calendário L587, `filter_list`, setas, `refresh`) não têm `aria-hidden`: o leitor diz "priority_high URGENTE", "calendar_today há 2 dias". Os chips de filtro são botões de alternância sem `aria-pressed`; a contagem de resultados e o esqueleto de carga não são anunciados (sem `aria-busy` nem região viva). Rótulos "Editar comunicado"/"Excluir comunicado" não dizem qual.
- Comando: `/impeccable harden`.

**10. Alvos de toque, tamanho do campo e atraso de entrada**
- Select de ordenação ~36 px de altura, "Ler mais" ~17 px, "Link adicional" ~20 px; o `AGENTS.md` pede 44 px e a WCAG 2.5.8 pede ao menos 24 px, que o "Ler mais" provavelmente só cumpre pela regra do espaçamento. Campos do modal com 14 px disparam o zoom automático do iOS (abaixo de 16 px).
- `animDelay={idx * 30}`: com 60 comunicados o último card entra 1,8 s depois (a animação usa `both`, então ele fica invisível até lá). Limitar o atraso (`Math.min(idx, 8) * 30`).
- `transition: all` em cards e botões, e `useState` de hover em cada card: o hover pode ser CSS puro.
- Comando: `/impeccable adapt` e `/impeccable optimize`.

### P3

**11. Acabamento**
- Scrim `rgba(11,27,46,0.60)` e sombras fixos (L924, L937) quando existe `C.scrim`; o modal usa `C.surface`, que é translúcida no Cyber, em vez de `C.popover`; hover do excluir com `rgba(232,69,69,0.85)` fixo.
- Card com `translateY(-4px)` no hover e cursor padrão: sugere clique em algo que não é clicável.
- Os mesmos quatro números (Total, Urgentes, Importantes, Gerais) aparecem duas vezes, no painel do hero e nos chips, e a diferença entre eles exige um tooltip para explicar. Candidato a `/impeccable distill`.
- Hero em laranja de ponta a ponta com malha de pontos e legenda `10px`; a decisão do audit do Início foi reservar o laranja da marca para ação. Decisão de produto do Felix, não bug.
- Subtítulo do hero em `text-white/85`: 4,16:1 sobre o `#C2410C` da parada do meio e ~2,4:1 se o texto chegar ao `#EC7D23` (abaixo de `2xl` a linha ocupa mais de 55% da largura). `(não renderizado)`
- Avisos do detector: 5 tamanhos fora da escala do `DESIGN.md` (10 px em `HERO_LABEL_MONO` e duas vezes no Admin, 17 px no número do KPI, 15 px no subtítulo).
- Botões de gestão aparecem só para `is_admin`, enquanto a API usa a capacidade `comunicados`: quem tem só a capacidade não vê os botões. Já previsto para a change `gestao-no-shell`.

## Padrões sistêmicos

1. **Cores literais onde o tema já tem o par certo** (`white`, `rgba(232,69,69,…)`, `rgba(11,27,46,…)`): é o mesmo erro que a Fase 16 corrigiu no chrome e que reaparece numa tela inteira. Os tokens `onAccent`, `dangerFill`/`onDanger`, `*Strong`, `scrim` e `popover` cobrem todos os casos.
2. **`outline: 'none'` inline contra a regra global de foco**: o `index.css` afirma que isso não existe mais, o que torna o problema invisível a quem confia no comentário. Vale um `grep` no projeto inteiro (o Admin também tem, L136 e L202).
3. **Duas cópias da mesma tela de gestão** e correções que chegam a uma só.

## O que está bom

- Modais com `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape, clique fora, trap de Tab e retorno de foco (`useDismissable`).
- Erros com `role="alert"`; estado de erro, de vazio e de carga distintos; mensagens honestas ("nada foi perdido").
- Um único polling para o chrome inteiro, pausado com a aba oculta; não há chamada duplicada.
- Selos de tipo com tons `-Strong` sobre `-Soft` (passam nos 5 temas), ícone e rótulo além da cor.
- Botões de editar/excluir sempre visíveis e de 44 px, e chips de 44 px; texto de corpo `ink2` com 7,69:1 no claro.
- Hierarquia `h1` → `h2` correta; o movimento de entrada é coberto pela regra global de `prefers-reduced-motion`.
- Exclusão com confirmação.

## Correção dos P1 (2026-11-09)

Os 6 P1 foram corrigidos em duas branches: `fix/comunicados-keep-image` (achado 6, backend) e `fix/comunicados-a11y-audit` (achados 1 a 5, um commit por achado). Verificados no navegador (Vite local, API simulada por Playwright, nada tocou a produção) e, no achado 6, com `EXPLAIN` do SQL no banco real, sem executar.

| # | Achado | Verificação |
|---|---|---|
| 1 | Foco | chips e select mostram anel sólido de 3 px (antes `outline: none`) |
| 2 | Texto cortado | card de 8 linhas curtas (~140 caracteres) agora mostra "Ler mais" com `aria-expanded`; card curto não mostra |
| 3 | Nomes | os 6 rótulos têm `htmlFor`, select e botão fechar têm `aria-label` |
| 4 | Contraste | textos e botões medidos nos 5 temas, mínimo **4,72:1** (excluir no Cyber); o chip "Todas" ativo no claro estava em 4,38:1 e foi para 7,92:1 |
| 5 | Modal | em 800×360 o diálogo cabe (16 a 344 px de 360), "Publicar Aviso" visível, corpo rola |
| 6 | Imagem apagada | SQL planeja no banco real; o `PUT` só grava `imagem_url` se a chave vier no corpo |

**Fora do escopo e ainda abertos:** os P2 (7 a 10) e o P3 (11), incluindo o subtítulo do hero (`text-white/85`, 4,16:1 na parada do meio), que não foi medido no navegador. A medição de contraste foi feita com a tela nos 5 temas, mas só em 1280 px; hover e foco com leitor de tela não foram exercitados. Fotos já apagadas pelo achado 6 não voltam sozinhas.

Pontuação depois das correções: **não reauditada**. Rodar `/impeccable audit Comunicados` depois do merge.

## Ordem recomendada

1. **[P1] `/impeccable harden`**: foco (1), texto cortado (2), rótulos e nomes (3), imagem apagada pelo Admin (6), esquema do link (8).
2. **[P1] `/impeccable colorize`**: pares de token nos botões e chips (4).
3. **[P1] `/impeccable adapt`**: modal com altura máxima e rolagem, alvos de 44 px, campos de 16 px (5, 10).
4. **[P2] `/impeccable extract`**: um só formulário de comunicado para a tela e o Painel Admin (7).
5. **[P2] `/impeccable optimize`**: teto no atraso de entrada, hover em CSS (10).
6. **[P3] `/impeccable distill`** nos KPIs duplicados e **`/impeccable polish`** como passo final.

Reauditar com `/impeccable audit Comunicados` depois das correções, já com medição no navegador nos 5 temas.
