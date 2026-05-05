# Plano de Melhoria de Responsividade: Barra de Busca e Filtros

Este documento detalha os problemas identificados no layout atual da barra de busca e filtros de categorias na aba "Processos Operacionais" e propõe uma solução robusta para garantir uma responsividade perfeita em todas as telas (Mobile, Tablet e Desktop).

## Problemas Identificados no Código Atual

1. **Risco de Quebra de Layout (Overflow) em Tablets/Desktop:**
   Ao usar `md:flex-row` colocando a busca (`flex-1`) e as categorias lado a lado, o contêiner de categorias (que usa `whitespace-nowrap` nos botões) não possui a propriedade `min-w-0`. Isso faz com que a lista longa de categorias force sua largura total, potencialmente empurrando a barra de busca para fora da tela ou esmagando-a.
2. **Alinhamento Vertical Incorreto:**
   Não há a classe `items-center` ou similar no contêiner `flex-row`, o que pode deixar o input e os botões de categorias desalinhados verticalmente.
3. **UX de Scroll em Dispositivos Móveis:**
   O uso de `no-scrollbar` torna o scroll invisível. Sem indicadores visuais ou `snap`, o usuário mobile pode não perceber que existem mais categorias ocultas à direita.
4. **Comportamento Subotimizado em Telas Grandes:**
   Em monitores grandes, manter os filtros em um scroll horizontal não é ideal. É melhor permitir que os botões quebrem linha (`flex-wrap`) para que o usuário tenha uma visão rápida de todos os filtros disponíveis.

## Mudanças Propostas

As alterações serão feitas no arquivo: `src/components/Processos.jsx`.

### 1. Refatoração do Contêiner Pai
- Alterar o comportamento de empilhamento para focar em uma quebra mais inteligente. Vamos manter `flex-col` para telas até médias (`lg`), e lado a lado apenas se houver espaço suficiente, ou simplesmente usar `flex-col` com os botões fazendo wrap.
- **Proposta:** Mudar para uma abordagem onde a barra de busca tem uma largura máxima agradável no desktop, e os botões de categoria quebram linha (`flex-wrap`).

### 2. Ajustes no Input de Busca
- Adicionar `w-full` no mobile e limitar a uma largura fixa no desktop (ex: `lg:max-w-md`), evitando que fique excessivamente esticado se as categorias passarem para a linha de baixo.
- Adicionar `shrink-0` para garantir que o input não seja esmagado pelos filtros.

### 3. Melhorias na Lista de Categorias
- **Mobile (`< lg`):** Manter o scroll horizontal (`overflow-x-auto`), adicionar máscaras de fade (opcional) ou simplesmente garantir que o padding faça o último item aparecer cortado para indicar scroll. Adicionar classes do tipo `snap-x` para melhor deslize.
- **Desktop (`>= lg`):** Aplicar `lg:flex-wrap` e remover a necessidade de scroll horizontal, permitindo que as categorias preencham o espaço em múltiplas linhas, se necessário. Remover a classe `whitespace-nowrap` do mobile caso o wrap seja habilitado no desktop, ou tratá-la responsivamente (`whitespace-nowrap lg:whitespace-normal`).
