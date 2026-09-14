## 1. Popover de avatar (P0)

- [x] 1.1 `aria-expanded`/`aria-haspopup="true"` no botão gatilho (reconsiderado de `role="menu"`/`aria-haspopup="menu"` durante a implementação: só Tab estava sendo implementado, não navegação por seta — um `role="menu"` sem esse modelo de teclado anunciaria "menu" a leitores de tela e entregaria um comportamento diferente do esperado; painel/itens ficaram sem `role` explícito)
- [x] 1.2 `useEffect` irmão do `handleClickOutside` existente: Escape fecha e devolve foco ao gatilho
- [x] 1.3 Foco inicial em "Fazer Upload" quando `showAvatarMenu` vira `true`
- [x] 1.4 Verificado ao vivo: `aria-expanded` alterna true/false, Escape fecha e devolve foco ao gatilho (`document.activeElement === trigger` confirmado), foco inicial cai em "Fazer Upload" ao abrir

## 2. Contraste de texto real (P0)

- [x] 2.1 `sLabel`: `C.muted` → `C.ink2`
- [x] 2.2 `sInputRO`: `C.muted` → `C.ink2`
- [x] 2.3 Texto do cargo (linha ~468): `C.accent` → `isDark ? C.accentDark : C.accentDeep` (novo `isDark = C.bg !== BENTO_LIGHT.bg`, mesmo padrão de `ServicesFilterBar.jsx`; `BENTO_LIGHT` importado de `useBentoTheme.js`)
- [x] 2.4 Rótulo "Avatares 3D", "Notificações por E-mail" e subtexto do toast: `C.muted` → `C.ink2`
- [x] 2.5 Verificado ao vivo em claro e AMOLED: rótulo "NOME" 7,69:1 (claro), campo somente-leitura "Localização" 6,95:1 (claro)/5,28:1 (AMOLED), texto do cargo "T.I" 9,37:1 (claro)/11,74:1 (AMOLED) — todos acima do piso 4,5:1

## 3. Alvos de toque + contraste não-textual (P1)

- [x] 3.1 Botão da câmera: expandido para 44×44px via pseudo-elemento (`after:-inset-[10px]`, ajustado de `-inset-2` depois de medir ao vivo que o container do pseudo-elemento é a padding-box de 24px, não a border-box de 28px — `-inset-2` dava só 40×40px)
- [x] 3.2 Trilho do toggle: `minHeight: 44` no `<label>` inteiro (substituindo `marginBottom`); cor "desligado" trocada de `C.line` para borda de 1px em `C.ink2` (1ª tentativa com `C.lineSoft`+borda `C.line` reprovou ao vivo no AMOLED — 1,06:1/1,24:1, os dois tokens são cinzas quase idênticos ao `surface` nesse tema; `C.ink2`, já calibrado para 4,5:1+ de texto, dá 5,6:1+ como borda)
- [x] 3.3 Verificado ao vivo via `elementFromPoint` nas 4 direções (5px além da caixa visual): câmera resolve para o botão em todos os pontos, confirmando 44×44px reais; trilho desligado medido em 7,69:1 (claro) e 5,58:1 (AMOLED) contra o fundo do card — ambos acima do piso 3:1; estado real do usuário (checkbox marcado) restaurado após a medição, nenhum dado salvo

## 4. Fallback honesto + botão Salvar travado (P1)

- [x] 4.1 `filialName`: fallback `'Sede Principal'` → `'N/D'`
- [x] 4.2 Botão Salvar: `disabled={isSaving}` → `disabled={isSaving || isLoading}`
- [x] 4.3 Verificado por leitura de código (mudança trivial, `isLoading` inicia `true` via `useState`) — a janela de carregamento real (poucos segundos via IXC) fechou antes da verificação ao vivo poder capturá-la; `filialName` confirmado batendo com o dado real do usuário logado ("PRESTEK TELECOM", com filial presente) sem alterar nada

## 5. Toast acessível + fim do alert() (P1)

- [x] 5.1 `role="alert"` no container do toast de erro (compartilhado entre falha de salvar e erro de upload)
- [x] 5.2 Substituído o `alert()` de `handleFileUpload` por um novo estado `uploadError`, mesmo padrão de toast e auto-dismiss em 4s já usado por `saveError`
- [x] 5.3 Verificado ao vivo sem alterar dado real: upload de um arquivo de 3MB (gerado localmente, nunca chegou a `FileReader`/rede) confirmou `[role="alert"]` no DOM com o texto "Imagem muito grande / Use uma imagem de até 2MB.", nenhum `alert()` nativo do navegador apareceu

## 6. Fechamento

- [x] 6.1 `npx vite build` limpo (2 rodadas — a 2ª após a correção do trilho do toggle)
- [x] 6.2 `openspec validate impeccable-configuracoes --strict` limpo
- [x] 6.3 Commit
