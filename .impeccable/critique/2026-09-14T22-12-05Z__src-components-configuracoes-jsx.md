---
target: Configurações (Configuracoes.jsx)
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 5
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Configuracoes.jsx"
target_fingerprint: "sha256:32f97fc65426e5ff9f2d998b087a144c00ab3dba99c63adb43553785aed7e41d"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Configuracoes.jsx"
timestamp: 2026-09-14T22-12-05Z
slug: src-components-configuracoes-jsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons corretos nos 3 cards de formulário, mas o cabeçalho do avatar (nome/cargo) não tem loading — confirmado ao vivo mostrando o ID cru "54" por um instante antes de resolver para "T.I"; popover do avatar sem `aria-expanded`/`aria-haspopup` |
| 2 | Match System / Real World | 2 | "Localização" cai em "Sede Principal" fabricado quando não há filial; "Setor" honestamente cai em "N/D" para o mesmo tipo de dado ausente — dois campos do mesmo card discordam sobre o que "sem dado" significa |
| 3 | User Control and Freedom | 1 | Popover de troca de avatar sem Escape, sem `role`, sem trap de foco — confirmado ao vivo que o Tab escapa dele para o campo Nome da página, deixando o popover aberto e órfão na tela |
| 4 | Consistency and Standards | 2 | Mesma inconsistência N/D vs. valor fabricado; grade de 48 avatares não reaproveita o padrão de estado selecionado que o `ThemeSwitcher` já usa uma seção abaixo |
| 5 | Error Prevention | 2 | Validação de tamanho de upload existe, mas usa `alert()` nativo bloqueante a poucas linhas de um toast já pronto no mesmo arquivo; botão Salvar não trava durante o carregamento inicial |
| 6 | Recognition Rather Than Recall | 2 | 48 botões de avatar sem nenhum indicador de selecionado força o usuário a lembrar qual já escolheu |
| 7 | Flexibility and Efficiency | 2 | Sem forma de pular a grade de 48 avatares; scroll aninhado dentro de outro scroll |
| 8 | Aesthetic and Minimalist Design | 3 | Cards com faixa de acento única, espaçamento consistente — uma das telas mais bem cuidadas visualmente do programa |
| 9 | Error Recovery | 2 | Toast de erro do salvamento é específico e bem desenhado; a validação de upload usa um idioma completamente diferente (alert nativo) no mesmo arquivo |
| 10 | Help and Documentation | 2 | Nenhuma explicação de por que Setor/Localização são somente-leitura |
| **Total** | | **22/40** | **Aceitável (55%)** |

## Design Specificity Verdict

**LLM assessment**: Visualmente, esta é uma das telas mais bem cuidadas já revisadas neste programa — hero, cards com faixa de acento, skeletons corretos. A correção recente (`fix-minha-conta-ux-a11y`) tratou bem as *superfícies* (cores, loaders, labels, toast) mas não tocou a *interação* do único widget customizado complexo da tela — o popover de avatar — exatamente o tipo de componente que este programa já endureceu em todo outro lugar onde apareceu (`TiSupportModal`, `CategoriasAdminModal`, `OrgChartEditor`, `ModalShell` de Serviços).

**Deterministic scan**: `impeccable detect --json` retornou **zero achados** — não porque o arquivo esteja limpo, mas porque ele é estilizado quase inteiramente via objetos `style={}` inline construídos a partir do hook `useBentoTheme()`, um padrão que o detector baseado em regex não consegue resolver (não há hex literal nem classe Tailwind de design-token para casar). Todos os achados de contraste/alvo de toque abaixo vieram de medição ao vivo e leitura direta dos valores de token, não da ferramenta — uma lacuna de cobertura da própria ferramenta neste estilo de arquivo, registrada para referência futura.

**Achado com números exatos, confirmado por medição ao vivo e recalculado de forma independente**: `C.muted` (`#8896A8`) e `C.accent` (`#EC7D23`) usados como texto real falham especificamente no tema CLARO (o padrão/mais comum da aplicação) — o inverso do padrão usual deste programa (que costuma falhar no escuro por coincidência de tokens). Rótulos de campo (`sLabel`, 3,01:1), valores de campos somente-leitura (`sInputRO`, 2,72:1) e o texto do cargo abaixo do nome (2,79:1) — a ocorrência mais extensa deste antipadrão já vista no programa, atingindo praticamente todo rótulo desta tela.

## Overall Impression

Uma tela com ossatura visual genuinamente boa, mas com o mesmo padrão já visto no programa: uma correção de acessibilidade recente tratou o que era fácil de ver (cores, loaders) e deixou passar o que exige testar de verdade com teclado (o popover) e medir de verdade (contraste no tema claro). Nenhum bug fatal de integridade como em Processos — mas um risco real e específico: o botão Salvar pode apagar silenciosamente um avatar customizado salvo se clicado durante a janela de carregamento inicial.

## What's Working

1. **`ThemeSwitcher.tsx` é um modelo de padrão acessível correto**: `role="radiogroup"` real com `<input type="radio">` nativos (`sr-only`, não divs falsas) e `aria-pressed` nos botões de variante escura. Confirmado ao vivo re-tematizando toda a tela corretamente em claro e AMOLED, incluindo o popover.
2. **Campos somente-leitura usam `readOnly`, não `disabled`**: Setor/Localização continuam na ordem de tabulação e visíveis a leitor de tela, só visualmente distinguidos como não-editáveis — muitos times erram isso usando `disabled`.
3. **Morfologia do botão Salvar** (ícone+rótulo mudando entre idle/salvando/sucesso) é eficiente e não precisa de um toast separado no caminho feliz; o backend (`POST /api/configuracoes/:id`, `PUT /api/funcionario/:id`) é defensivamente escrito para cair no valor atual armazenado quando o cliente omite um campo — verificado lendo o server.js, não suposto.

## Priority Issues

**[P0] Popover de troca de avatar sem nenhuma semântica de diálogo, sem Escape, sem trap de foco**
- **What**: O painel (`showAvatarMenu`) é uma `<div>` simples sem `role`, sem `aria-expanded`/`aria-haspopup` no gatilho, fechando só por um listener de `mousedown` no `document`. Confirmado ao vivo, de forma independente pelas duas assessments: Escape não fecha; Tab alcança o painel mas escapa dele (para o campo "Nome" da página) sem fechá-lo, deixando-o aberto e órfão flutuando na tela.
- **Why it matters**: Mesma classe de bug já corrigida nas Fases 5, 7, 10, 11 e 12 — sobreviveu aqui porque a correção recente tratou o rótulo/`aria-label` do gatilho, não o painel em si.
- **Fix**: `role="menu"` (ou promover a diálogo de verdade) com `aria-expanded`/`aria-haspopup` no gatilho, handler de Escape que fecha e devolve o foco ao gatilho, e foco inicial em "Fazer Upload" ao abrir.
- **Suggested command**: /impeccable harden

**[P0] Texto real com `C.muted`/`C.accent` reprova contraste no tema claro em quase todo rótulo da tela**
- **What**: Medido ao vivo e recalculado de forma independente: rótulos de campo (`sLabel`) 3,01:1; valores somente-leitura (`sInputRO`) 2,72:1; texto do cargo sob o nome 2,79:1 — todos abaixo do piso de 4,5:1 no tema claro (a maioria passa em AMOLED, o inverso do padrão usual).
- **Why it matters**: Maior extensão já vista deste antipadrão no programa — praticamente todo rótulo de campo desta tela de formulário.
- **Fix**: Trocar `C.muted` por `C.ink2` no texto real (rótulos, valores somente-leitura, subtexto do toast); trocar `C.accent` por `C.accentDeep`/`C.accentDark` (conforme tema) no texto do cargo.
- **Suggested command**: /impeccable harden

**[P1] Alvos de toque abaixo de 44px: botão da câmera (28×28) e trilho do toggle (20px de altura)**
- **What**: Botão da câmera do avatar mede 28×28px, sem expansão por pseudo-elemento; o trilho do toggle de notificação mede 36×20px (a área clicável do `<label>` é larga mas só 20px de altura).
- **Why it matters**: O botão da câmera é a ÚNICA porta de entrada para toda a funcionalidade do card (upload/trocar/remover foto).
- **Fix**: Expansão por pseudo-elemento no botão da câmera; aumentar a altura real do trilho do toggle ou expandir a área de toque do `<label>` inteiro.
- **Suggested command**: /impeccable harden

**[P1] "Sede Principal" fabricado quando não há filial — inconsistente com "N/D" honesto do campo ao lado**
- **What**: `filialName` cai no literal `'Sede Principal'` quando não há dado de filial nenhum; `deptoName`, no mesmo card, cai honestamente em `'N/D'` para o mesmo tipo de ausência.
- **Why it matters**: Mesmo antipadrão "formulário assume o valor mais comum como se fosse verificado" já catalogado no `OverrideModal.jsx` (Cobertura, Fase 9) — recorrendo aqui numa forma mais mundana.
- **Fix**: `(displayFilial ? \`Filial ${displayFilial}\` : 'N/D')`.
- **Suggested command**: /impeccable harden

**[P1] Botão Salvar não trava durante o carregamento inicial — risco real de apagar um avatar customizado salvo**
- **What**: `disabled={isSaving}` não considera `isLoading`; `avatarUrl` só semeia do campo de foto do IXC, não do avatar customizado (que só chega depois via `/api/configuracoes/:id`). Um Salvar antes desse fetch resolver envia `avatarUrl: ''`, apagando a preferência salva.
- **Why it matters**: Verificado contra o código real do backend (não suposto) — o `PUT /api/funcionario/:id` é defensivo para os campos do IXC, mas o `POST /api/configuracoes/:id` não protege especificamente o `avatarUrl` de um Salvar prematuro.
- **Fix**: Também travar o botão em `isLoading`, ou não popular `avatarUrl` no payload até a primeira resolução do fetch de preferências.
- **Suggested command**: /impeccable harden

**[P1] Toast de erro sem `role="alert"`/`aria-live`; `alert()` cru na validação de upload**
- **What**: O toast de falha de salvamento (adicionado pela correção recente) não tem `role="alert"` nem `aria-live` — leitor de tela nunca fica sabendo que o salvamento falhou. A validação de tamanho de imagem usa `alert()` nativo bloqueante, a poucas linhas do mesmo toast.
- **Fix**: `role="alert"` no container do toast; substituir o `alert()` de upload pelo mesmo padrão de toast.
- **Suggested command**: /impeccable harden

## Persona Red Flags

**Sam (Accessibility)**: Não consegue sair do popover de avatar com Escape; o gatilho não anuncia `aria-expanded`; os 48 botões de avatar anunciam "Avatar 1" a "Avatar 48" sem indicar qual está selecionado; toast de erro de salvamento nunca é anunciado.

**Casey (Mobile)**: Botão da câmera de 28×28px é o menor alvo de toque da tela e é a única porta de entrada do card; scroll aninhado da grade de avatares dentro do scroll da própria página.

**Alex (Power User)**: Pode clicar Salvar durante o carregamento inicial e apagar silenciosamente um avatar customizado já salvo; sem atalho para pular os 48 avatares.

## Minor Observations

- Flash real do ID cru "54" sob o nome do usuário antes de `cargoName` resolver — confirmado em 2 screenshots (claro e AMOLED); autocura em menos de 1s mas é o segundo texto mais proeminente da tela.
- Preferências pessoais (nome/email/telefone/ramal) sobrescrevem dado fresco do IXC no carregamento — se RH atualizar o telefone direto no IXC, o usuário continua vendo o valor antigo salvo aqui até editar de novo.
- `CAMPOS_READONLY` filtra chaves que nunca chegam a existir em `formData` — hoje é um no-op.
- Grade de 48 avatares sem estado "selecionado" visível, ao contrário do padrão já usado pelo `ThemeSwitcher` uma seção abaixo.
- Sem timeout/retry nos fetches de perfil — carregamento observado de 8-14s (provável latência real do IXC) sem nenhum sinal de progresso além do pulse.

## Questions to Consider

- Por que a tela se apresenta como um editor geral quando Setor/Localização/Cargo são todos somente-leitura vindos do IXC — vale uma explicação de "o que você controla" vs. "o que o RH controla", como o Login já faz com "Fale com a TI"?
- 48 avatares quase idênticos sem busca, filtro ou indicador de selecionado — 8-12 opções curadas com estado visível não serviriam melhor pelo mesmo propósito?
