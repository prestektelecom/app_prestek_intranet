---
target: Painel Admin (AdminDashboard.jsx) — Assessment A, Fase 15
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\AdminDashboard.jsx"
target_fingerprint: "sha256:1169907d039ae2a70540646e37b5d3225639738fc5552ba82c9b0cce766a6c41"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\AdminDashboard.jsx"
timestamp: 2026-09-15T22-57-13Z
slug: src-components-admindashboard-jsx
---
# Assessment A — Painel Admin (`src/components/AdminDashboard.jsx`)

Método: Assessment A (revisão de design LLM) isolada, com inspeção ao vivo.

**Nota de ambiente (importante para reproduzir):** não havia sessão salva
(`@Stitch:user` ausente) e nenhum servidor rodando no início. Subi `npm run dev`
e, em vez de adivinhar credenciais (proibido), instalei um *stub* de `window.fetch`
na minha própria aba que intercepta **todo** `/api/*` e responde com dados
sintéticos. Consequências: (a) nenhuma requisição saiu para o backend real,
(b) as 3 únicas escritas tentadas (`POST /api/presenca/54`) foram bloqueadas pelo
stub — **zero dado real foi lido ou alterado**; (c) volumes/edge cases de produção
(490 colaboradores, comunicados reais) não foram exercitados, então achados que
dependem de volume real ficam marcados como "a confirmar". Contraste, alvos de
toque, teclado, semântica e layout responsivo foram medidos ao vivo e valem
integralmente. Tema restaurado ao original (dark/amoled) ao fim.

## Design Health Score

| # | Heurística | Nota | Problema principal |
|---|-----------|-------|------------|
| 1 | Visibilidade do status | 2 | Zero regiões `aria-live` na tela inteira; falha de carga das estatísticas é silenciosa (só `console.warn`) e o estado vazio então **mente** ("Nenhuma atividade registrada ainda."); aba ativa sinalizada só por cor |
| 2 | Correspondência com o mundo real | 2 | KPI rotulado `Ações (g)` (sem significado); chaves cruas `grant_admin`/`revoke_admin` exibidas como chip; "Super Admin" fixo para todo admin; "Comunicações" (hub) vs "Comunicados" (seção) |
| 3 | Controle e liberdade | 1 | Modal de comunicado não fecha com Escape nem com clique fora; conceder/revogar admin é instantâneo, sem confirmação e sem desfazer |
| 4 | Consistência e padrões | 2 | Três sistemas de estilo na mesma superfície (tokens JS, variáveis CSS, hex cru); `ICONE_ACAO` duplicado em 2 arquivos com cores diferentes para a mesma ação; confirmação de ação destrutiva inconsistente |
| 5 | Prevenção de erro | 1 | Escalonamento de privilégio em 1 clique, sem confirmação; `ResponsaveisManual` grava o responsável no clique do nome, sem confirmar |
| 6 | Reconhecer em vez de lembrar | 3 | Bom: todo ícone de navegação tem rótulo. Ruim: a pílula mostra o estado atual mas a AÇÃO só existe no `title` (invisível no toque) |
| 7 | Flexibilidade e eficiência | 1 | Nenhum atalho de teclado; nenhuma ação em lote; sem ordenação; busca de Usuários exige submit enquanto Comunicados/Responsáveis filtram ao vivo |
| 8 | Estético e minimalista | 3 | Composição bento genuinamente limpa; mas os 3 cards de atalho duplicam a sidebar e um deles (gradiente laranja) grita mais alto que o H1 sem motivo |
| 9 | Recuperação de erro | 1 | `alert()` com `e.message` cru do backend na ação mais sensível do app; `AdminUsuarios` renderiza `e.message` cru; falha de stats sem nenhuma mensagem |
| 10 | Ajuda e documentação | 1 | Nenhuma ajuda em lugar nenhum; nada explica o que "conceder admin" libera, nem "Responsáveis" vs "Grupos de Supervisor" (a única exceção boa está em `ResponsaveisManual`) |
| **Total** | | **17/40** | **Ruim (42,5%)** |

## Veredito de Especificidade de Design

**Avaliação LLM:** categoria-intercambiável, e de um jeito particular: o Painel Admin
não parece o mesmo produto que ele administra. Ele se renderiza **fora** do shell
(`fixed inset-0 z-50`), com header, sidebar, navegação inferior e — o detalhe mais
revelador — **logo próprio**: `BentoLogo`, quatro retângulos abstratos coloridos com
`C.accent`/`accentDark`/`accentSoft`/`info`, que não é a marca Prestek usada no Login
(`Logo.webp`). A palavra-marca também muda, para "Prestek Admin". O resultado é um
painel que poderia administrar qualquer SaaS: KPIs Usuários/Comunicações/Ações,
feed de atividades, três cards de atalho. Nada ali é de um provedor de internet —
nenhuma noção de contrato, OS, plantão ou cobertura chega à visão geral, embora o
painel administre exatamente uma intranet cheia disso. A aba "Plantões" é a única
coisa específica do domínio, e é justamente a que some no mobile.

O que salva parcialmente: a decisão de IA de virar uma tela cheia é deliberada e boa
(ver Pontos Fortes). Mas a linguagem visual em cima dela é template.

## Impressão Geral

Um painel visualmente competente com uma fundação de segurança e acessibilidade que
não acompanha o que ele faz. Esta é a tela onde uma pessoa ganha ou perde poder de
administrador sobre a intranet inteira, e é a tela com menos salvaguardas do programa
até agora: um clique, sem confirmação, sem desfazer, com o rótulo mostrando o estado
e não a ação. Some a isso um header branco fixo que torna a palavra-marca ilegível
(1,32:1) nos quatro temas escuros e uma seção inteira inalcançável abaixo de 1024px,
e o quadro é de uma tela que nunca foi tocada pelo programa — confirmado: nenhum dos
padrões já resolvidos em 14 fases (semântica de diálogo, `onAccent`, alvo de 44px,
`aria-live`) chegou aqui.

**A maior oportunidade:** tratar "conceder admin" como a ação consequente que ela é.

## O Que Está Funcionando

1. **A tomada de tela cheia como decisão de arquitetura da informação.** Renderizar o
   admin fora do shell normal cria um contexto inequívoco de "você está em modo
   administrativo", impede misturar ação administrativa com navegação cotidiana, e o
   "Voltar à Intranet" fixo no rodapé da sidebar dá uma saída calma e sempre visível.
   Muitos painéis se enterram numa aba de configurações; este se compromete.
2. **A composição bento do hub.** Três KPIs com tarja de destaque, feed de atividades
   com ícone e cor por tipo de ação, depois atalhos. Escaneável em ~2 segundos, sem
   ruído, proporções boas. O `overflow-y-auto` + `scrollbar-hide` no `main` mantém o
   header e a sidebar ancorados, o que é o comportamento certo para um painel.
3. **`ResponsaveisManual` é o melhor pedaço de produto do painel.** A nota inline
   ("Setores *sem definição manual* continuam usando a lógica automática dos *Grupos
   de Supervisor*") explica um comportamento não-óbvio exatamente onde a dúvida
   aparece, e o setor sobrescrito ganha card em tom de destaque + badge "MANUAL", então
   o estado de override nunca é ambíguo. É o modelo que o resto do painel deveria seguir.

## Carga Cognitiva (8 itens)

- [x] **Foco único** — cada aba tem um trabalho só.
- [ ] **Chunking** — 6 itens de menu sem nenhum agrupamento, e o hub repete 3 deles
  como cards: 9 portas de entrada concorrendo na primeira tela.
- [x] **Agrupamento** — painéis com borda e cards bem delimitados.
- [ ] **Hierarquia visual** — o card "Gerenciar Usuários" (gradiente laranja, sombra
  `shadow-lg`, ícone de 120px) pesa mais que o H1 "Visão Geral" e que os KPIs, sem que
  nada justifique ele ser a ação primária. Os outros dois cards irmãos são discretos.
- [x] **Uma coisa por vez** — navegação por abas, sem fluxo multi-etapa.
- [ ] **Escolhas mínimas** — 16 pontos interativos na primeira tela (6 nav + 3 KPI +
  3 cards + Ver Tudo + Atualizar + Sair + Voltar).
- [x] **Memória de trabalho** — contexto não precisa ser carregado entre telas.
- [x] **Divulgação progressiva** — abas escondem a complexidade de cada seção.

**3 falhas = carga moderada** (tratar em breve).

## Jornada Emocional (regra do pico-fim)

**Entrada (alta):** a tomada de tela cheia funciona. "Prestek Admin", sidebar própria,
bento limpo — a sensação é de ter entrado na sala de controle. É um pico real.

**Vale 1, imediato:** quem usa tema escuro (o padrão salvo nesta máquina é AMOLED)
recebe, no topo dessa sala de controle, uma barra branca fixa com a palavra-marca
**invisível** (1,32:1). A primeira coisa que a pessoa vê já está quebrada.

**Vale 2, o que define o fim:** a ação de maior consequência de todo o aplicativo —
dar a alguém poder de administrador sobre a intranet inteira — acontece com um clique
numa pílula pequena, sem confirmação, sem desfazer, e o sucesso é comunicado por essa
mesma pílula mudando discretamente de cor. O registro emocional desse momento é
idêntico ao de aplicar um filtro. Se falha, o retorno é um `alert()` nativo com a
string de exceção do backend. O pico-fim da tela é, portanto: o momento mais
consequente é o menos tranquilizador.

**Saída (boa):** "Voltar à Intranet" encerra bem.

## Problemas Prioritários

### [P0] O header do painel é branco fixo — a palavra-marca fica ilegível nos 4 temas escuros
- **O quê:** `AdminDashboard.jsx:145` define `background: 'rgba(255,255,255,0.88)'`
  literal, enquanto o texto usa `C.ink`, que é reativo ao tema. Medido ao vivo em
  AMOLED: "Prestek Admin" em `rgb(255,255,255)` sobre um fundo efetivo de
  `rgb(224,224,224)` = **1,32:1**. O nome do admin ao lado mede **2,70:1**.
- **Por que importa:** é o mesmo antipadrão já corrigido em `PlantaoHistorico.jsx`
  (Fase 4) e `AdminComunicados.jsx` (Fase 5) — superfície clara fixa + texto reativo
  ao tema = contraste ~1:1. Aqui ele está no **cabeçalho persistente**, presente em
  todas as 6 abas: não há como escapar dele. A identidade do painel some.
- **Fix:** trocar por `C.surface` com a translucidez aplicada sobre o token
  (`tone(C.surface, 0.88)`) e `borderBottom: 1px solid ${C.line}` (já está certo).
  Verificar nos 5 temas, não só no claro.
- **Comando sugerido:** `/impeccable colorize`

### [P0] A seção "Plantões" é inalcançável abaixo de 1024px; "Auditoria" só por um `div` não focável
- **O quê:** a sidebar é `hidden lg:flex` e a barra inferior renderiza
  `menuItens.slice(0, 4)` — Painel, Usuários, Responsáveis, Comunicados. Confirmado ao
  vivo a 390px **e a 768px**: 4 botões na barra, `aside` com `display:none`. "Auditoria"
  e "Plantões" não têm entrada nenhuma. Auditoria ainda é alcançável pelo botão "Ver
  Tudo" e pelo card de atalho; **"Plantões" não tem nenhuma outra via** — `setAbaAtiva('plantao-historico')`
  só existe no `menuItens.map` da sidebar.
- **Por que importa:** uma seção administrativa inteira desaparece em tablet e celular
  sem nenhum aviso — não é degradação, é perda de funcionalidade. Agrava: os 3 cards de
  atalho que socorrem "Auditoria" são `<div onClick>` sem `role`, sem `tabIndex` e sem
  `onKeyDown` (confirmado: só 10 elementos focáveis no painel, nenhum deles é um card).
  Então para quem navega por teclado, Auditoria só é alcançável pela sidebar — e quem
  usa teclado numa janela estreita fica sem as duas seções.
- **Fix:** (1) na barra inferior, manter 4 destinos + um botão "Mais" que abre uma folha
  com os itens restantes (padrão `MobileMoreSheet` já existente no app); (2) dar aos 3
  cards `role="button"`, `tabIndex={0}` e `onKeyDown` de Enter/Espaço — com a guarda
  `if (e.target !== e.currentTarget) return` já catalogada na Fase 10.
- **Comando sugerido:** `/impeccable adapt`

### [P0] Conceder e revogar administrador: um clique, sem confirmação, sem desfazer, rótulo ambíguo
- **O quê:** em `AdminUsuarios.jsx:53`, `toggleAdmin` dispara o `PUT .../privilegios`
  direto do `onClick`. Não há `window.confirm`, nem modal, nem desfazer. A pílula exibe
  o **estado atual** ("Admin" / "Usuário") enquanto o clique executa o **oposto**; a
  única desambiguação é o atributo `title` ("Revogar acesso admin"), que não existe no
  toque. Sem `aria-pressed`. Medido: 86×38px e 92×38px (abaixo de 44px), e o estado
  "Usuário" usa `C.muted` a **2,87:1**. Em caso de falha: `alert('Erro: ' + e.message)`
  com a mensagem crua do backend.
- **Por que importa:** é a ação de maior privilégio do sistema e a menos protegida dele.
  Excluir um comunicado — reversível, de baixo impacto — **tem** `window.confirm`; promover
  alguém a administrador de toda a intranet não tem nada. Somado ao rótulo ambíguo e ao
  alvo pequeno, um toque errado numa lista densa de colaboradores concede privilégio
  administrativo sem nenhum atrito e sem trilha visível para quem clicou.
- **Fix:** diálogo de confirmação nomeando a pessoa e o efeito ("Conceder acesso de
  administrador a *Fulano*? Ele poderá gerenciar usuários, comunicados e ver a
  auditoria."), com o botão de confirmação carregando o verbo. Trocar a pílula por um
  controle com `aria-pressed` cujo rótulo acessível descreva a ação, alvo de 44px, e o
  estado "Usuário" para um token com contraste de texto. Substituir o `alert()` por um
  toast com `role="alert"` e mensagem tratada.
- **Comando sugerido:** `/impeccable harden`

### [P1] O modal de comunicado não tem nenhuma semântica de diálogo (6ª recorrência do programa)
- **O quê:** verificado ao vivo em `AdminComunicados.jsx:319`: `role` nulo,
  `aria-modal` nulo, `aria-labelledby` nulo. Ao abrir, o foco **permanece no botão
  "Novo Comunicado" atrás do modal**. Escape não fecha (confirmado: modal segue aberto).
  Do botão "Salvar", um Tab **escapa para o header da página** (confirmado:
  `insideModal: false`). O backdrop não tem `onClick`, então clicar fora também não
  fecha. Ao fechar pelo Cancelar, o foco não volta ao gatilho. Os 5 `<label>` do
  formulário não têm `htmlFor` e os 5 campos não têm `id` nem `aria-label` — nenhuma
  associação programática. O botão de fechar não tem nome acessível (só a ligadura
  "close").
- **Por que importa:** é o formulário que cria e edita comunicados reais publicados
  para a empresa inteira. Para leitor de tela, ele é um pedaço de página que apareceu
  sem anúncio, com cinco campos sem nome. E é exatamente o antipadrão já corrigido nas
  Fases 5, 7, 10, 11 e 13 — aqui intocado.
- **Fix:** `role="dialog"` + `aria-modal="true"` + `aria-labelledby` no título, foco
  inicial no primeiro campo, `useDismissable`/`trapTab` (já existentes no projeto),
  retorno de foco ao gatilho, `htmlFor`/`id` nos 5 pares e `aria-label` no fechar.
- **Comando sugerido:** `/impeccable harden`

### [P1] Contraste: "branco sobre laranja" e `C.muted` como texto, em toda a casca (tema claro)
- **O quê:** medido ao vivo no tema claro, dentro de `AdminDashboard.jsx`:
  - item de navegação **ativo** (`color: C.surface` sobre `C.accent`, linha 48): **2,79:1**
  - botão "Sair" (`text-white` sobre `C.accent`, linha 162): **2,79:1**
  - "Ver Tudo" (`color: C.accent` como texto, linha 309): **2,79:1**
  - `C.muted` usado como texto real em 6 lugares: "Super Admin" 2,87 · "Voltar à
    Intranet" 3,01 · "Bem-vindo, Marcio." 2,85 · rótulo de KPI 3,01 · meta do log 3,01 ·
    descrição dos cards 3,01
  - card com gradiente: o título branco vai de **9,37:1** na ponta `accentDeep` a
    **2,79:1** na ponta `accent`; a descrição em `white/80` vai de 6,58 a **2,29:1**
  - na barra inferior mobile, o rótulo da aba ativa usa `C.accent` a **2,79:1** em 10px
- **Por que importa:** é a recorrência exata anotada na MEMORIA para este arquivo
  (linhas 48/59/67) mais o `text-muted` que já reincidiu 7+ vezes no programa. O item
  de navegação ativo é o pior: o único sinal de "onde estou" no painel é justamente o
  que falha, e falha só no tema claro (nos 4 escuros `C.surface` == `C.onAccent` por
  design, e ele passa em 7,06:1).
- **Fix:** `C.onAccent` em tudo que fica sobre `C.accent` (nav ativo, "Sair", rótulo da
  aba mobile); `C.accentDark`/`accentDeep` para o "Ver Tudo"; `C.ink2` no lugar de
  `C.muted` onde o texto é conteúdo; e recalcular as duas pontas do gradiente
  separadamente (lição da Fase 14), não só o tom médio.
- **Comando sugerido:** `/impeccable colorize`

## Alertas por Persona

Personas escolhidas pela tabela de seleção (Dashboard/admin → Alex, Sam) mais Riley,
que é o perfil certo para um painel sobre dado real. `CLAUDE.md` não tem seção
`## Design Context`, então não gerei persona específica do projeto.

**Alex (usuário avançado):** precisa promover 8 colaboradores novos. Não há seleção
múltipla nem ação em lote — são 8 idas à lista, uma pílula por vez. Nenhum atalho de
teclado em lugar nenhum do painel. A busca de Usuários exige clicar "Buscar" (ou Enter)
enquanto as buscas de Comunicados e Responsáveis filtram ao vivo — ele vai digitar e
esperar o filtro que não vem. Sem ordenação por coluna, sem paginação: a lista inteira
de colaboradores chega de uma vez. E a aba "Auditoria", onde ele conferiria o que
acabou de fazer, tem paginação de 20 sem controle de tamanho de página, sem filtro por
data e sem exportação.

**Sam (leitor de tela / teclado):** (1) Não consegue saber em que seção está — os 6
botões de navegação não têm `aria-current`, `aria-selected` nem `aria-pressed`; o
estado ativo existe só como cor de fundo. (2) **Zero** regiões `aria-live` na tela
inteira: quando ele busca um colaborador, a tabela troca em silêncio; quando concede
admin, nada é anunciado. (3) Os 3 cards de atalho não existem para ele — não são
focáveis. (4) No modal de comunicado o foco nunca entra, cinco campos não têm nome
programático e Escape não funciona. (5) Na pílula de privilégio, ele ouve "Admin",
que é o estado, não a ação; sem `aria-pressed` não há como saber que é um alternador.
O anel de foco global de 3px, esse sim, funciona — é o único item de acessibilidade
que passou.

**Riley (testador metódico):** derruba o backend e clica "Atualizar". `carregarStats`
captura a exceção num `console.warn`, os KPIs voltam para "—" e o feed exibe
**"Nenhuma atividade registrada ainda."** — a interface afirma que não há atividade
quando na verdade não conseguiu perguntar. Nenhuma mensagem de erro, nenhum botão de
tentar de novo. Em seguida ele quebra a listagem de usuários e recebe o oposto:
`e.message` cru do backend dentro de uma caixa vermelha. Abre o modal, digita metade
de um comunicado, aperta Escape esperando descartar — nada acontece; aperta Tab e o
foco sai para trás do modal, que continua aberto por cima. (`AdminAuditoria` é o único
que ele não consegue constranger: mensagem genérica com o detalhe no `title`.)

## Observações Menores

- `Ações (g)` como rótulo de KPI não significa nada para um humano. O dado é
  `stats.acoes_recentes`; o rótulo provavelmente perdeu um sufixo ("(ger.)"? "(30d)"?).
- "Super Admin" é literal fixo no JSX para **todo** admin — é papel fabricado, não o
  cargo real da pessoa (mesmo padrão do `filialName` "Sede Principal", Fase 13).
- O hub chama o KPI de "Usuários Ativos"; `AdminUsuarios` chama o mesmo tipo de número
  de "Total de Usuários". Vêm de endpoints diferentes — **a confirmar com dado real**
  se divergem, mas a nomenclatura já diverge (mesma classe da Fase 6/Fase 8).
- "Comunicações" (KPI do hub) vs "Comunicados" (nome da seção e do dado).
- `ICONE_ACAO` está duplicado em `AdminDashboard.jsx:120` e `AdminAuditoria.jsx:5`
  com cores **diferentes** para a mesma ação: `create_comunicado` é
  `bg-orange-100/text-orange-600` no hub e `text-[#C2410C] bg-[#FFF7ED]` na Auditoria.
- Em `AdminAuditoria`, dois chips têm cor clara cravada e não reagem ao tema:
  `create_comunicado` (`bg-[#FFF7ED]`) e o fallback (`bg-[#F7FAFD]`) — círculos brancos
  acesos sobre preto no AMOLED, e o ícone do fallback mede **2,87:1**. Todos os outros
  chips do mesmo mapa têm variante `dark:`.
- Ainda na Auditoria, o timestamp usa `text-faint/60`: o modificador `/60` desfaz a
  correção de `--foreground-faint` feita na Fase 12 e derruba para **3,14:1** no AMOLED.
- A chave crua da ação (`grant_admin`) é exibida como chip ao lado de uma descrição que
  já diz a mesma coisa em português — jargão redundante.
- Os dois `<label>` dos filtros da Auditoria não têm `htmlFor`; a busca de Usuários não
  tem rótulo nem `aria-label`, só placeholder.
- Alvos abaixo de 44px medidos: "Sair" 36px, "Ver Tudo" 20px, pílulas de privilégio
  38px, filtros da Auditoria 36–38px.
- Hierarquia de headings salta de `h1` para `h3` (sem `h2`) no hub.
- Em `ResponsaveisManual`, clicar num nome da lista **grava imediatamente** o
  responsável do setor, sem confirmação — mesma classe do P0 de privilégio, um degrau
  abaixo em consequência.
- O `BentoLogo` não é a marca Prestek; o Login usa `Logo.webp`. O painel administrativo
  tem identidade visual própria, divergente do produto que administra.

## Perguntas a Considerar

- Se conceder acesso de administrador é a ação mais poderosa do aplicativo, por que é a
  única sem confirmação — enquanto excluir um comunicado, que é reversível, tem uma?
  O que a ausência de atrito aqui diz sobre quanto o painel confia em quem o abre?
- Os três cards de atalho existem porque a sidebar não era suficiente, ou porque o hub
  parecia vazio sem eles? Se for o segundo, o espaço poderia carregar o que só o admin
  sabe olhar — quem ganhou privilégio esta semana, o que está pendente — em vez de três
  botões que repetem o menu ao lado.
- O painel se apresenta como um produto separado ("Prestek Admin", logo próprio, casca
  própria). Isso é uma decisão de produto que vale defender, ou um acidente de quando a
  tela foi construída fora do shell? A resposta muda se o certo é alinhar a identidade
  ao resto da intranet ou assumir de vez a separação.
