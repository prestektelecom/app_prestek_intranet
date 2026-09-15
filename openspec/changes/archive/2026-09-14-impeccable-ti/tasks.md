## 1. Nome acessível e obrigatoriedade programática (P0)

- [x] 1.1 `Segmentado` (`CampoForm.jsx`): recebe `id` do rótulo (`aria-labelledby`), `role="group"` no wrapper
- [x] 1.2 `CampoForm.jsx`: rótulo ganha `id={`${id}-rotulo`}`, `Segmentado`/campo recebe `aria-labelledby`
- [x] 1.3 Campos com `campo.obrigatorio`: `required` + `aria-required="true"` no input/select/Segmentado
- [x] 1.4 Mensagem de erro ganha `id={`${id}-erro`}`; campo ganha `aria-invalid`/`aria-describedby` quando o erro está visível
- [x] 1.5 Verificado ao vivo: os 5 grupos `role="group"` resolvem `aria-labelledby` para o texto real do rótulo (incluindo "Criar usuário do sistema*" e "Possui deficiência"); 10 campos com `required`/`aria-required="true"`; focar+desfocar um campo obrigatório vazio confirma `aria-invalid="true"` e `aria-describedby` apontando para o `<p>` com "Campo obrigatório."

## 2. Regiões live (P0)

- [x] 2.1 Toast (`CadastroColaborador.jsx`): `role="alert"`
- [x] 2.2 `DryRunResultado.jsx`: `role="status" aria-live="polite"` no cabeçalho do card
- [x] 2.3 Verificado ao vivo (dado sintético, `TESTE QA IMPECCAVEL NAO USAR`, nunca gravado): toast aparece com `role="alert"` ~400ms após clicar "Simular cadastro" e some ~4s depois; card do dry-run aparece com `role="status"`/`aria-live="polite"` e o texto correto

## 3. Contraste de texto (P1)

- [x] 3.1 `Ti.jsx`: pill ativo da bandeja `text-[var(--accent)]`→`text-[var(--accent-dark)]`
- [x] 3.2 `CampoForm.jsx`: `Segmentado` ativo `text-[var(--accent)]`→`text-[var(--accent-dark)]`
- [x] 3.3 `estilos.js`: `ROTULO`/`HINT` `text-muted`→`text-faint`; nova constante `HINT_ERRO` (`text-red-600 dark:text-red-400`)
- [x] 3.4 `CampoForm.jsx`: erro de validação usa `HINT_ERRO`
- [x] 3.5 `text-muted` substituído por `text-faint` em `CadastroColaborador.jsx` (nenhum restante), `PainelLateral.jsx`, `DryRunResultado.jsx`, `UploadFicha.jsx`, `SecaoForm.jsx`, `Ti.jsx` (via sed + edições pontuais); `CidadeCombobox.jsx` reescrito já sem `text-muted`
- [x] 3.6 Verificado ao vivo em claro e AMOLED: rótulo "Filial*" 6,58:1 (claro)/6,58:1 (AMOLED, mesma medição pós-fix); pill ativo e toggle "Não" 10,32:1 nos dois temas; screenshots em 768px confirmam labels/erros legíveis nos dois extremos

## 4. Botão primário e toast de erro (P1)

- [x] 4.1 `estilos.js`: `BTN_PRIMARIO` gradiente `#9A3412→#EC7D23` vira `#7C2D12→#C2410C`
- [x] 4.2 `CadastroColaborador.jsx`: toast de erro `bg-red-500/90`→`bg-red-600`
- [x] 4.3 Verificado: contraste calculado a partir da cor computada real (`rgb(124,45,18)`→`rgb(194,65,12)`) — 9,38:1 na ponta escura, 5,18:1 na ponta clara, nunca abaixo de 4,5:1 em nenhum ponto do degradê

## 5. Alvos de toque (P1)

- [x] 5.1 `estilos.js`: `CAMPO`, `BTN_PRIMARIO`, `BTN_SECUNDARIO` ganham `min-h-[44px]` (e `SKELETON_CAMPO` ajustado de 38px para 44px para não ficar menor que o campo real que representa)
- [x] 5.2 `CampoForm.jsx`: botões do `Segmentado` ganham `min-h-[44px]`
- [x] 5.3 `Ti.jsx`: pill da bandeja ganha `min-h-[44px]`
- [x] 5.4 Verificado ao vivo via `getBoundingClientRect`: toggle Sim/Não, pill da bandeja, "Escolher arquivo" e campo de CPF — os 4 medem exatamente 44px de altura

## 6. Teclado no combobox de cidade (P1)

- [x] 6.1 `CidadeCombobox.jsx`: reescrito — opções viram `<li role="option">` não-focáveis; input ganha `role="combobox"`, `aria-autocomplete="list"`, `aria-activedescendant`
- [x] 6.2 `onKeyDown` no input: ArrowDown/ArrowUp movem o destaque (com wrap), Enter seleciona, Escape fecha sem perder foco
- [x] 6.3 Seleção por mouse via `onMouseDown` com `preventDefault` (evita a corrida com o `blur` do input)
- [x] 6.4 Destaque de teclado usa `bg-[var(--accent-soft)]`
- [x] 6.5 Verificado ao vivo digitando "Maceio": ArrowDown destaca a opção (`aria-activedescendant` aponta para o `id` certo, fundo visível), Enter seleciona ("Maceió" no campo), Escape fecha (`aria-expanded=false`) mantendo o foco no input (`document.activeElement === input`)

## 7. Status honesto de progresso (P1)

- [x] 7.1 `CadastroColaborador.jsx`: `etapa` do hero passa a ser `resultadoDryRun ? 'Simulado' : 'Preenchendo'`
- [x] 7.2 Verificado ao vivo: antes de simular o hero mostra "Preenchendo"; depois de rodar uma simulação (dado sintético) passa a mostrar "Simulado"

## 8. Ação primária alcançável sem rolar (P1)

- [x] 8.1 `CadastroColaborador.jsx`: barra `sticky top-2 z-30 xl:hidden` com "Simular"/contagem, no topo do conteúdo (antes dos avisos de erro/taxonomia)
- [x] 8.2 Verificado ao vivo em 768px: a barra fica em `top: 117` (logo abaixo do header do app) mesmo depois de rolar 2500px de um total de 4662px; confirmado por screenshot em claro e AMOLED que não sobrepõe o `MobileBottomNav`; em 1440px (acima de `xl`) a barra fica `display:none`/largura 0, sem duplicar o botão do painel lateral

## 9. Fechamento

- [x] 9.1 `npx vite build` limpo (3 rodadas ao longo da implementação)
- [x] 9.2 `openspec validate impeccable-ti --strict` limpo
- [x] 9.3 Commit
