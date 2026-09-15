## Context

Fase 14 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 14). Crítica dual-agent isolada — Assessment A 23/40 (Aceitável), Assessment B com achados ao vivo (detector quase cego neste alvo: `TiHero` usa `useBentoTheme()`+inline style, o resto usa variáveis CSS do Tailwind, nenhuma cor literal para o regex capturar) — e audit técnico 10/20 (Aceitável, no limite). Escopo aprovado pelo Felix: P0 + P1.

## Decisões técnicas

### 1. Nome acessível dos toggles Sim/Não: `role="group"` + `aria-labelledby`, não `role="radiogroup"`

O `Segmentado` (usado por 5 campos obrigatórios/relevantes: `possui_deficiencia`, `criar_usuario`, `envia_email_os`, `envia_sms_os`, `ferias_colaborador`) já usa `aria-pressed` em cada botão — semântica de grupo de botões de alternância, não de radio group. Migrar para `role="radio"`/`aria-checked` exigiria também navegação por seta entre as opções (Authoring Practices Guide), que não existe hoje — o mesmo raciocínio já aplicado na Fase 13 ao reconsiderar `role="menu"` no popover de avatar: semântica parcial engana mais do que nenhuma semântica. A correção mantém `aria-pressed` e adiciona `role="group"` + `aria-labelledby` no wrapper, apontando para o `id` do `<label>` já renderizado por `CampoForm` (hoje órfão só porque o `id` nunca chega ao `Segmentado`) — o leitor de tela anuncia o rótulo do campo ao entrar no grupo, e cada botão continua anunciando seu próprio estado pressionado.

### 2. Obrigatoriedade programática: `required` + `aria-required`, `aria-invalid` + `aria-describedby`

Todo campo com `campo.obrigatorio` ganha `required` (documentação, sem efeito prático já que não há um `<form>` nativo nesta tela) e `aria-required="true"`. A mensagem de erro (`<p>` já renderizado condicionalmente) ganha um `id` próprio (`${id}-erro`), e o campo ganha `aria-invalid={!!erro && touched}` + `aria-describedby` apontando para esse id quando o erro está visível — sem isso, o leitor de tela nunca associa a mensagem de erro ao campo que ela descreve.

### 3. Mensagens de erro não usam mais o estilo de dica neutra

`HINT` (`text-xs text-faint`, depois de corrigido o contraste) continua servindo dicas genéricas, mas a mensagem de ERRO de validação ganha uma constante própria, `HINT_ERRO` (`text-xs font-semibold text-red-600 dark:text-red-400`) — reaproveita a mesma família de vermelho já usada em `DryRunResultado.jsx` (`cor="text-red-600 dark:text-red-400"`) em vez de introduzir um terceiro sistema de cor de erro na mesma ferramenta. Erro deixa de ser visualmente idêntico a uma dica neutra.

### 4. Regiões live: `role="alert"` no toast, `role="status"` no resultado do dry-run

O toast (sucesso/erro da simulação) ganha `role="alert"` — mesmo padrão já aplicado em `Configuracoes.jsx` (Fase 13) e `Comunicados`/`Processos` em fases anteriores. O card de `DryRunResultado` ganha `role="status" aria-live="polite"` no cabeçalho (não `alert`/`assertive`): é o resultado de uma ação que o próprio operador disparou e já está esperando, não uma interrupção não solicitada — `polite` evita cortar a fala de outro anúncio em andamento (ex.: o próprio toast) sem deixar de anunciar o resultado.

### 5. Contraste: `--accent-dark` no lugar de `--accent`, `--foreground-faint` no lugar de `--foreground-muted`

Mesmas correções já aplicadas em 7+ fases anteriores: `text-[var(--accent)]`→`text-[var(--accent-dark)]` (pill ativo da bandeja, toggle Sim/Não ativo) e `text-muted`→`text-faint` (rótulos, subtítulos, dicas, textos do painel lateral). Ambos os tokens CSS já existem e são usados exatamente assim em outras telas do projeto (`Coverage.jsx`, `RegionPanel.jsx`, `Configuracoes.jsx`).

### 6. Botão "Simular cadastro": gradiente de dois tons escuros, não claro

`BTN_PRIMARIO` ia de `#9A3412` a `#EC7D23` (o laranja de marca, claro demais para texto branco) — medido ao vivo em 7,31:1 na ponta escura caindo a 2,79:1 na ponta clara. Trocado para `#7C2D12`→`#C2410C` (os dois tons mais escuros da mesma rampa, já usados juntos como par nesta mesma ferramenta em `FAIXA`), mantendo a identidade laranja da marca sem nunca cair abaixo de 4,5:1 em nenhum ponto do degradê — verificado ao vivo nas duas extremidades e no meio. O toast de erro troca `bg-red-500/90` (3,41:1 medido) por `bg-red-600` sólido.

### 7. Alvos de toque: `min-h-[44px]` nas classes compartilhadas

Em vez de corrigir caso a caso, o `min-h-[44px]` entra nas constantes compartilhadas de `estilos.js` (`CAMPO`, `BTN_PRIMARIO`, `BTN_SECUNDARIO`) e nos dois componentes de alternância (`Segmentado` em `CampoForm.jsx`, pill da bandeja em `Ti.jsx`) — corrige os 6 pontos achados de uma vez, sem risco de esquecer um.

### 8. Combobox de cidade: `aria-activedescendant` em vez de foco real nas opções

Hoje cada opção é um `<button>` focável — Tab entra nelas uma por uma, mas nenhuma seta funciona e Escape não fecha. Migrado para o padrão ARIA Combobox de foco virtual: as opções viram `<li role="option" id="{id}-opcao-{i}">` não-focáveis, o `<input>` ganha `role="combobox"`, `aria-autocomplete="list"`, `aria-activedescendant` apontando para a opção destacada por teclado, e um `onKeyDown` local trata `ArrowDown`/`ArrowUp` (move o destaque), `Enter` (seleciona o destaque), `Escape` (fecha e limpa o destaque, sem perder o foco do input). A seleção por mouse continua funcionando via `onMouseDown` (evita a corrida entre `blur` do input e `click` da opção). O destaque por teclado usa o mesmo `bg-[var(--accent-soft)]` já usado como "selecionado" em outros seletores da ferramenta, substituindo o `focus:bg-surface-raised` que media 1,048:1.

### 9. "Etapa 1 de 3" vira um status real de 2 fases, não 3 inventadas

A ferramenta hoje só tem duas fases genuínas — preencher (com ou sem PDF) e simular — porque a criação real é um stub 501, não uma fase 3 alcançável. Inventar uma "Etapa 2 de 3 · Revisão" só para preencher o meio não resolveria a mentira de fundo: não existe hoje uma fase de gravação real para ser a "Etapa 3". A correção honesta (mesmo raciocínio da Fase 12, avisar em vez de fingir) troca o texto fixo por um valor derivado do estado real: `"Preenchendo"` enquanto não há resultado de simulação, `"Simulado"` depois que `resultadoDryRun` existe — nunca promete um passo que a tela não tem.

### 10. Ação primária alcançável sem rolar: barra fixa abaixo de `xl`

Abaixo de `xl`, o `PainelLateral` (onde vive o botão "Simular cadastro") já vem depois de todas as 6 seções do formulário no fluxo — 3,4 a 5,7 telas de rolagem, medido ao vivo. Em vez de reordenar o DOM (arriscado, o painel também mostra o resultado do dry-run e o log, que fazem sentido depois do formulário), a correção adiciona uma barra compacta `sticky top-2 z-30 xl:hidden` logo no topo do conteúdo de `CadastroColaborador.jsx`, com o botão "Simular cadastro" e a contagem de obrigatórios/erros — fica visível durante toda a rolagem em qualquer largura abaixo de `xl`, sem duplicar o painel inteiro nem escondê-lo (que continua existindo mais abaixo, inalterado).

## Verificação

Cada fix verificado ao vivo via Playwright em claro e AMOLED, sem uploads de PDF real nem CPF/e-mail reais (dados sintéticos tipo `TESTE QA IMPECCAVEL`/`111.111.111-11`/`@example.com`, dry-run apagado ao final): nome acessível dos 5 toggles confirmado via `accessibleName` computado pela árvore de acessibilidade; `aria-required`/`aria-invalid`/`aria-describedby` confirmados no DOM; `role="alert"`/`role="status"` confirmados aparecendo e sendo lidos; contraste medido via `getComputedStyle`+luminância relativa nos pontos citados; alvos de toque medidos via `getBoundingClientRect`; navegação por teclado no combobox testada com ArrowDown/Enter/Escape reais; barra fixa confirmada visível em 390/768/1024px sem rolar.
