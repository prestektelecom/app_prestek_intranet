# people-hub-hero Specification

## Purpose
O hero da aba Colaboradores: identidade da página, busca e o quadro de números da equipe. Precisa ler como a mesma família visual dos heroes de Cobertura, Central de Vendas e Setor TI — são telas irmãs do mesmo produto.

## Requirements

### Requirement: Hero construído sobre os utilitários compartilhados
O componente `DirectoryHero` SHALL usar `fundoHero(C)` de `src/components/ui/heroGradiente.js` como fundo e `HeroSearchInput` de `src/components/ui/HeroSearchInput.jsx` como campo de busca, em vez de reimplementar qualquer um dos dois localmente.

A rampa SHALL NOT usar `C.accentDark` como parada intermediária: esse token vale `#C2410C` no tema claro mas `#FDBA74` nos três temas escuros, invertendo a rampa e derrubando o contraste do texto branco para 1,71:1.

#### Scenario: Gradiente monotônico nos cinco temas
- **WHEN** o hero é renderizado em qualquer um dos temas light, dark, cyber, aurora ou amoled
- **THEN** a rampa vai de `C.accentDeep` a `C.accent` passando pela constante `HERO_VIA` (`#C2410C`), sem nenhuma parada mais clara que as extremidades
- **AND** o texto branco sobre a parada intermediária mantém no mínimo 4,5:1

#### Scenario: Busca no hero filtra colaboradores
- **WHEN** o usuário digita no `HeroSearchInput`
- **THEN** a lista é filtrada em tempo real por nome, ramal ou e-mail

#### Scenario: Foco do campo de busca é perceptível
- **WHEN** o campo de busca recebe foco
- **THEN** um outline branco sólido de 2px é exibido (5,18:1 sobre a rampa), satisfazendo a SC 1.4.11

#### Scenario: Campo de busca é anunciado como busca
- **WHEN** um leitor de tela percorre o hero
- **THEN** o campo está dentro de um `<form role="search">`

### Requirement: Quadro de números em painel escuro
O hero SHALL exibir os KPIs dentro de um painel `bg-black/60` com borda `border-white/15`, marcado como `<dl>` com pares `<dt>`/`<dd>`, e não em pílulas translúcidas de fundo branco.

Rótulos SHALL usar o token `LABEL_MONO` (`font-mono text-[10px] uppercase tracking-[0.14em] text-white/75`) e valores SHALL usar `tabular-nums`. Nenhum texto sobre o painel abaixo de `text-white/70`.

#### Scenario: KPIs refletem os mesmos dados dos chips
- **WHEN** os colaboradores são carregados
- **THEN** o KPI "Departamentos" exibe exatamente a quantidade de chips de departamento renderizados na toolbar

#### Scenario: KPI adaptado ao papel do usuário
- **WHEN** o usuário não é admin (a API não retorna inativos, logo total e ativos seriam iguais)
- **THEN** o segundo KPI exibe "Com ramal" em vez de "Ativos"

#### Scenario: Esqueleto reserva a caixa do valor
- **WHEN** os dados ainda estão carregando
- **THEN** três esqueletos são exibidos, com a barra do valor em `h-[17px]` — a mesma altura do valor final, para o painel não saltar

### Requirement: Decoração com custo justificado
O hero SHALL usar uma retícula de pontos de 22px em `opacity 0.22`, marcada com `aria-hidden="true"`.

O hero SHALL NOT conter elementos `<div>` com `filter: blur()` como decoração de fundo, e SHALL NOT usar o token `C.cyan` — que vale `#FDBA74` nos quatro temas e portanto renderiza pêssego sobre laranja.

#### Scenario: Retícula renderizada e ignorada por leitores de tela
- **WHEN** o hero é renderizado
- **THEN** o `<svg>` da retícula tem `aria-hidden="true"` e `pointer-events: none`

### Requirement: Título sem emoji e na escala da casa
O `<h1>` SHALL ser `text-[26px] sm:text-[30px] lg:text-[34px]`, sem emoji.

#### Scenario: Leitor de tela anuncia só o título
- **WHEN** um leitor de tela lê o `<h1>`
- **THEN** anuncia "Colaboradores", sem descrição de emoji
