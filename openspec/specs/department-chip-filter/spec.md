# department-chip-filter Specification

## Purpose
A faixa de filtro por departamento da aba Colaboradores. Precisa comunicar quais setores existem, quantas pessoas há em cada um, e que existe conteúdo além da borda da tela.

## Requirements

### Requirement: Chips construídos sobre o componente compartilhado
A faixa SHALL usar `src/components/ui/ChipButton.jsx`, e SHALL NOT manter uma cópia local do componente.

O chip compartilhado já traz `aria-pressed`, `type="button"`, `whitespace-nowrap` e `snap-start` — nenhum dos quais existia na cópia local que a aba mantinha.

#### Scenario: Estado do chip é anunciado
- **WHEN** um leitor de tela encontra um chip de departamento
- **THEN** o estado é anunciado via `aria-pressed`

#### Scenario: Cor do chip vem da rampa do tema
- **WHEN** um chip é renderizado
- **THEN** a cor de destaque vem de `useDeptColor().tinta`, que garante ≥4,5:1 contra a superfície do tema ativo

#### Scenario: Chip ativo recebe estilo destacado
- **WHEN** o usuário clica em um chip
- **THEN** o chip recebe borda e texto na cor do departamento, fundo em `tone(cor, 0.12)` e anel `0 0 0 3px`, e os demais retornam ao estado inativo

### Requirement: Divulgação progressiva dos departamentos
A faixa SHALL exibir no máximo os 8 departamentos com mais colaboradores, ordenados por contagem decrescente, e SHALL mover os demais para um seletor com busca acionado por um botão "Mais N".

A ordenação SHALL NOT ser alfabética. Na base real são 25 departamentos para 478 pessoas, com distribuição de cauda longa: os 8 maiores cobrem 424 pessoas (89%), enquanto os 15 menores cobrem 46 (9,6%). Além disso, a ordem alfabética colocava `(INATIVO) ATENDIMENTO`, `(INATIVO) SUPERVISÃO TÉCNICA` e `(INATIVO) TECNICO` como os três primeiros chips depois de "Todos", porque o parêntese ordena antes das letras.

#### Scenario: Faixa limitada aos maiores
- **WHEN** há mais de 8 departamentos
- **THEN** a faixa exibe "Todos" mais os 8 de maior contagem, e um botão "Mais N" com o número restante

#### Scenario: Departamento selecionado permanece visível
- **WHEN** o usuário seleciona um departamento que está na cauda
- **THEN** aquele chip é promovido para a faixa, para que o filtro ativo nunca fique escondido atrás do botão

#### Scenario: Seletor com busca
- **WHEN** o usuário abre o seletor
- **THEN** um campo de busca recebe foco e filtra os departamentos por nome, sem sensibilidade a acento
- **AND** cada item exibe a contagem de colaboradores

#### Scenario: Seletor fecha por Esc e por clique fora
- **WHEN** o seletor está aberto e o usuário pressiona `Escape`
- **THEN** o seletor fecha e o foco retorna ao botão que o abriu

### Requirement: Filtros ativos são visíveis e removíveis
A toolbar SHALL exibir, ao lado do contador de resultados, uma pílula para cada filtro ativo com um botão de remoção individual, e uma ação "limpar tudo".

#### Scenario: Remover um filtro sem perder o outro
- **WHEN** há filtro de departamento e de situação ativos e o usuário remove o de departamento
- **THEN** apenas o de departamento é removido

#### Scenario: Alvo de toque do botão de remoção
- **WHEN** a pílula é renderizada
- **THEN** o botão de remoção tem alvo efetivo de 44px, obtido por pseudo-elemento, sem alterar o tamanho visual do ícone

### Requirement: Chips agrupados e com pista de overflow
A faixa SHALL ser um `<nav aria-label="Filtrar por departamento">` com `snap-x snap-mandatory scroll-smooth`.

Como `scrollbar-hide` remove a barra de rolagem — a única pista de que existe conteúdo além da borda — a faixa SHALL aplicar uma máscara de fade nas extremidades.

#### Scenario: Overflow é perceptível
- **WHEN** há mais chips do que o espaço disponível
- **THEN** as extremidades da faixa aparecem esmaecidas, indicando continuidade
- **AND** a rolagem horizontal funciona sem exibir barra

#### Scenario: Grupo é anunciado
- **WHEN** um leitor de tela chega na faixa
- **THEN** anuncia a navegação rotulada, em vez de vinte botões soltos

### Requirement: Contagem consistente com o filtro
A contagem do badge de cada chip SHALL ser derivada do mesmo `useMemo` que alimenta os KPIs do hero, aplicando as mesmas regras de mesclagem de departamento usadas no filtro.

#### Scenario: Chip e contador de resultados concordam
- **WHEN** o usuário clica no chip de um departamento que agrega ids mesclados (13, que também aceita 15 e 68)
- **THEN** o número exibido no badge do chip é igual ao total exibido em "Exibindo X de Y"

#### Scenario: Contagem reflete a busca ativa
- **WHEN** há texto na busca
- **THEN** as contagens dos chips consideram apenas os colaboradores que casam com a busca

#### Scenario: Departamentos inativos escondidos de não-admin
- **WHEN** o usuário não é admin
- **THEN** departamentos com "(INATIVO)" no nome não geram chip nem entram no KPI "Departamentos"

### Requirement: Faixa não mente durante o carregamento
Enquanto os dados carregam, a faixa SHALL exibir esqueletos que reservam sua altura, e SHALL NOT renderizar o chip "Todos" com contagem zero.

#### Scenario: Sem "Todos 0"
- **WHEN** a aba está carregando
- **THEN** esqueletos de chip são exibidos, e nenhuma contagem numérica aparece
