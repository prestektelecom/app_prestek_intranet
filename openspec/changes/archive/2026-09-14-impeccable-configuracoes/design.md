## Context

Fase 13 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 13). Crítica dual-agent isolada 22/40 (Aceitável) + audit técnico 12/20 (Aceitável). Escopo aprovado pelo Felix: P0 + P1.

## Decisões técnicas

### 1. Popover de avatar: sem `useDismissable` (arquivo não usa hooks compartilhados de overlay)

Diferente de outros arquivos deste programa, `Configuracoes.jsx` não importa `useDismissable` nem segue o padrão de `modalRef`+`trapTab` local usado em `ProcessoModal`/`CategoriasAdminModal`/`OrgChartEditor`. Dado que o popover já tem seu próprio `useEffect` de "fechar ao clicar fora" (`handleClickOutside`, linhas 181-189), a correção adiciona um `useEffect` irmão para Escape (mesmo padrão, sem reescrever o que já funciona), mais `role="menu"`, `aria-expanded`/`aria-haspopup="menu"` no botão gatilho, e foco inicial no botão "Fazer Upload" via um `ref` dedicado, ativado só quando `showAvatarMenu` vira `true`. Não foi migrado para `useDismissable` (que exigiria importar o hook e testar toda a lógica de novo) — o ganho de reescrever um mecanismo que já funciona parcialmente (fechar por clique fora) não compensa o risco, dado o escopo desta fase.

### 2. Contraste: `C.ink2` para texto, `C.accentDeep`/`C.accentDark` para o cargo

Mesma correção já aplicada em 6+ fases anteriores: `C.muted` (reservado a ícone/placeholder) vira `C.ink2` em todo texto real abaixo de 14px — rótulos de campo (`sLabel`), valores somente-leitura (`sInputRO`), subtexto do toast. O texto do cargo (`C.accent` bruto) segue o padrão já estabelecido em `ChipButton.jsx`/`Coverage.jsx`/`RegionPanel.jsx`: `isDark ? C.accentDark : C.accentDeep`, calculado uma vez a partir de `C.bg` (mesmo teste `C.bg !== BENTO_LIGHT.bg` já usado em `ServicesFilterBar.jsx`).

### 3. Trilho do toggle: contraste não-textual, não só toque

O trilho "desligado" usa `C.line` (`#E4ECF5` no claro, `#222222` no AMOLED) contra o próprio fundo do card (`C.surface`) — 1,19-1,21:1, abaixo do piso de 3:1 do WCAG 1.4.11 para componentes de UI. Como aumentar a ALTURA do trilho (para o alvo de toque) não resolve o contraste sozinho, a 1ª tentativa trocou a cor do trilho desligado para `C.lineSoft` com borda de 1px em `C.line` — medido ao vivo no AMOLED e reprovado (1,06:1 de fundo, 1,24:1 de borda: `line`/`lineSoft` são cinzas quase idênticos ao próprio `surface` nesse tema especificamente, a mesma classe de "correção que só funciona em alguns temas" já catalogada na memória do projeto). Corrigido usando `C.ink2` como cor da borda (mantendo `C.lineSoft` só como preenchimento decorativo) — `ink2` já é o tom calibrado para passar 4,5:1+ como TEXTO em todo tema, então como borda de 1px sobra contraste (5,6:1+ no AMOLED, ~8:1 no claro).

### 4. Botão Salvar travado em `isLoading`

`disabled={isSaving}` vira `disabled={isSaving || isLoading}`. Como o botão já muda de aparência conforme `isSaving`, um `isLoading` verdadeiro simplesmente mantém o mesmo estado desabilitado que já existe hoje por uma fração de segundo a mais — nenhuma mudança de UI nova precisa ser desenhada.

## Verificação

Cada fix verificado ao vivo via Playwright (login manual pode ser necessário, já que a sessão expirou durante a crítica): popover — Escape fecha e devolve foco ao gatilho, foco inicial em "Fazer Upload", `aria-expanded` alternando; contraste medido via `getComputedStyle`+luminância relativa nos rótulos, campos somente-leitura, texto do cargo e trilho do toggle, em claro e AMOLED; alvos de toque medidos via `getBoundingClientRect`; botão Salvar confirmado desabilitado durante o carregamento inicial (via DevTools, sem submeter); `filialName` confirmado caindo em "N/D" quando testado com um usuário sem filial (verificação por leitura de dado real, sem alterar nada); toast de erro confirmado com `role="alert"` no DOM (sem forçar uma falha real de salvamento).
