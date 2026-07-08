## 1. Refatorar `tagStyle` no `ComunicadosCard`

- [x] 1.1 Ler o código atual da função `tagStyle()` em `Dashboard.jsx` (linhas 222–229) e verificar o mapeamento atual de tipos
- [x] 1.2 Adicionar o tipo `"Importante"` ao mapa com `{ bg: C.warningSoft, color: C.warning, label: 'IMPORTANTE' }`
- [x] 1.3 Confirmar que o fallback (tipo desconhecido) usa `C.surfaceSoft` / `C.ink2` como neutro

## 2. Adicionar stripe lateral colorida por tipo

- [x] 2.1 No container de cada item (o `<div>` com `display: flex, alignItems: center, gap: 14`), adicionar `borderLeft: \`3px solid ${tag.color}\`` e `paddingLeft: 10` (compensando o border) 
- [x] 2.2 Verificar visualmente que a stripe aparece com a cor correta para Urgente (vermelho), Importante (âmbar) e Geral (verde/neutro)

## 3. Preview de descrição em 2 linhas

- [x] 3.1 No `<div>` da descrição (`it.descricao`), substituir `{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }` por:
  ```js
  { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }
  ```
- [x] 3.2 Testar com um comunicado de texto longo para confirmar que trunca na 2ª linha com `…`
- [x] 3.3 Testar com comunicado de texto curto para confirmar que não adiciona ellipsis desnecessário

## 4. Tornar itens clicáveis

- [x] 4.1 Adicionar `onClick={() => setCurrentView('announcements')}` no container de cada item do map
- [x] 4.2 Confirmar que o cursor `pointer` já está aplicado (verificar `cursor: 'pointer'` no style existente)
- [x] 4.3 Testar navegação: clicar em um item deve abrir a view de Comunicados completa

## 5. Data de criação detalhada via tooltip

- [x] 5.1 Adicionar função/lógica para formatar data completa em formato legível local (ex: `02/07/2026 20:15`)
- [x] 5.2 Adicionar atributo `title` com a data formatada no tempo relativo do `ComunicadosCard` em `Dashboard.jsx`
- [x] 5.3 Adicionar atributo `title` com a data formatada no tempo relativo de `ComunicadoCard` em `Comunicados.jsx`
- [x] 5.4 Testar visualmente passando o mouse por cima da data relativa em ambos os componentes

## 6. Verificação final

- [x] 6.1 Revisar o card visualmente no Dashboard com dados reais (ao menos 2 comunicados de tipos diferentes)
- [x] 6.2 Confirmar que nenhum outro componente foi afetado (só `ComunicadosCard` em `Dashboard.jsx` e `ComunicadoCard` em `Comunicados.jsx`)
