## 1. P0 — Trap de foco e semântica de diálogo em `CrudModal`/`DeleteModal`

- [x] 1.1 `CrudModal`: adicionar `useDismissable` (Escape, clique fora, foco de entrada/retorno) + `trapTab` local, `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h2>` do modal
- [x] 1.2 `DeleteModal`: mesmo tratamento — `useDismissable`, `trapTab`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h3>` do modal
- [x] 1.3 Verificado ao vivo com clique real: foco entra no modal na abertura; Shift+Tab do primeiro elemento (Fechar) vai para o último (Publicar Aviso / Sim, excluir); Escape fecha e devolve o foco ao botão que abriu; testado nos dois modais sem confirmar a exclusão de nenhum dado real

## 2. P0 — Contraste crítico em `AdminComunicados.jsx`

- [x] 2.1 Trocar `bg-white` (classe Tailwind fixa) por `style={{ background: C.surface }}`, consistente com o resto do arquivo (que já usa tokens `C.*` via `style` em tudo, exceto essa linha)
- [x] 2.2 Verificado ao vivo em Cyber-Obsidian: os 4 cards do Painel Admin › Comunicados renderizam com fundo escuro e título totalmente legível (antes: texto fantasma branco-sobre-branco)

## 3. P1 — Tokens de contraste em badges e chips

- [x] 3.1 `getTypeMeta`: adicionado campo `textColor` (`dangerStrong`/`warningStrong`/`successStrong`) separado de `color` (mantido como tom base, usado para a tarja decorativa e borda de hover, que não foram medidas como quebradas)
- [x] 3.2 Badge de tipo no card (`ComunicadoCard`): `color: meta.color` → `color: meta.textColor`
- [x] 3.3 `ChipButton`, badge de contagem: inativo `C.muted` → `C.ink2`; ativo `'white'` → `C.onAccent`
- [x] 3.4 Verificado ao vivo em tema claro (onde as medições originais foram feitas): badge "IMPORTANTE" agora `#7A5300` sobre `#FEFCE8`; chip ativo `#0B1B2E` sobre `#EC7D23`; chip inativo `#475467` sobre `#F7FAFD` — os três dentro do documentado em `useBentoTheme.js` para os pares `Strong`/`onAccent`/`ink2`. Nota: em tema escuro `ink2`/`muted` coincidem no mesmo valor para alguns temas, então a correção do chip inativo só é visualmente distinta no tema claro — consistente com a medição original do achado

## 4. P1 — Truncamento do corpo do comunicado

- [x] 4.1 Função `limparAsteriscos()` para remover asteriscos literais de markdown (`*texto*` → `texto`) antes de exibir, sem introduzir uma biblioteca de markdown
- [x] 4.2 `ComunicadoCard`: descrição usa `line-clamp` de 4 linhas por padrão, com estado local `expandido` e botão "Ler mais"/"Ler menos" quando o texto excede ~220 caracteres
- [x] 4.3 Verificado ao vivo com dado real de produção: os 3 comunicados longos (com asteriscos e texto extenso) mostram "Ler mais" e o texto sem asteriscos crus; o comunicado curto ("O plano de 200 Mega...") não mostra o botão, permanece completo

## 5. Verificação final e portão

- [x] 5.1 `npx vite build` limpo em todas as rodadas de edição
- [x] 5.2 Os 2 P0 e 2 P1 verificados individualmente ao vivo (ver itens acima)
- [x] 5.3 `openspec validate impeccable-comunicados --strict`

## 6. Commit
