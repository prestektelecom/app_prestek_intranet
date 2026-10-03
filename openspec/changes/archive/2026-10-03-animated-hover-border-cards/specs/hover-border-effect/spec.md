## ADDED Requirements

### Requirement: Tokens CSS de borda hover por tema
O sistema SHALL definir três CSS custom properties de borda hover (`--hover-border-from`, `--hover-border-to`, `--hover-border-glow`) em cada bloco de tema (`:root`, `.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled`) do arquivo `src/index.css`.

#### Scenario: Tokens presentes no tema Light
- **WHEN** o documento não possui classe de tema dark no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#4A9EF5`, `--hover-border-glow` SHALL ser `rgba(74,158,245,0.40)`

#### Scenario: Tokens presentes no tema Cyber (dark padrão)
- **WHEN** o `<html>` possui a classe `.dark` (sem variante)
- **THEN** `--hover-border-from` SHALL ser `#00F2FE`, `--hover-border-glow` SHALL ser `rgba(0,242,254,0.45)`

#### Scenario: Tokens presentes no tema Aurora
- **WHEN** o `<html>` possui a classe `.dark-aurora`
- **THEN** `--hover-border-from` SHALL ser `#8A2BE2`, `--hover-border-glow` SHALL ser `rgba(138,43,226,0.50)`

#### Scenario: Tokens presentes no tema AMOLED
- **WHEN** o `<html>` possui a classe `.dark-amoled`
- **THEN** `--hover-border-from` SHALL ser `#4A9EF5`, `--hover-border-glow` SHALL ser `rgba(74,158,245,0.50)`

---

### Requirement: Classe utilitária `.bento-hover-border`
O sistema SHALL fornecer uma classe CSS utilitária `.bento-hover-border` que aplica efeito de borda luminosa animada ao hover, usando os tokens de tema ativos.

#### Scenario: Transição suave no hover
- **WHEN** o usuário passa o mouse sobre um elemento com a classe `.bento-hover-border`
- **THEN** o `box-shadow` SHALL transicionar de invisível para um glow de borda da cor `--hover-border-from` em no máximo 250ms com easing `ease`

#### Scenario: Glow visível ao hover
- **WHEN** o elemento está em estado de hover
- **THEN** SHALL existir uma camada de `box-shadow` com spread de `2px` e sem blur (simulando borda) na cor `--hover-border-from`, mais uma camada de glow externo com blur de `24px` e spread `0px` na cor `--hover-border-glow`, aplicada com `!important` para prevalecer sobre estilos inline e classes Tailwind conflitantes

#### Scenario: Retorno ao estado normal ao sair do hover
- **WHEN** o mouse sai do elemento
- **THEN** o `box-shadow` SHALL retornar ao valor original do card com a mesma duração de transição (250ms)

#### Scenario: Efeito não afetado por overflow hidden
- **WHEN** o elemento possui `overflow: hidden`
- **THEN** o efeito de borda SHALL ser visível normalmente (box-shadow não é clipado por overflow)

#### Scenario: Compatibilidade com border-radius
- **WHEN** o elemento possui `border-radius` de qualquer valor
- **THEN** o efeito de borda SHALL seguir o arredondamento do elemento sem ângulos retos

---

### Requirement: BentoCard com suporte a hover border via prop
O componente `BentoCard` (`src/components/common/BentoCard.jsx`) SHALL aceitar uma prop `hoverBorder` (boolean, default `true`) que controla a aplicação da classe `.bento-hover-border`.

#### Scenario: Comportamento padrão
- **WHEN** `BentoCard` é renderizado sem a prop `hoverBorder`
- **THEN** SHALL aplicar a classe `.bento-hover-border` automaticamente (default `true`)

#### Scenario: Desativação explícita
- **WHEN** `BentoCard` é renderizado com `hoverBorder={false}`
- **THEN** NÃO SHALL aplicar a classe `.bento-hover-border`

#### Scenario: Nenhuma quebra de comportamento existente
- **WHEN** código existente usa `<BentoCard C={C} accent="accent" glow>`
- **THEN** o efeito de hover SHALL ser adicionado sem alterar o comportamento de `glow`, `accent` ou qualquer outra prop existente

---

### Requirement: Cards Tailwind com classe de hover border
Os componentes `TechBentoCard`, `PlanoBentoCard` e `StreamingBentoCard` SHALL ter a classe `.bento-hover-border` adicionada ao `div` raiz de cada card.

#### Scenario: TechBentoCard com efeito de hover
- **WHEN** usuário passa o mouse sobre um `TechBentoCard`
- **THEN** SHALL exibir o efeito de borda luminosa compatível com o tema ativo

#### Scenario: PlanoBentoCard com efeito de hover
- **WHEN** usuário passa o mouse sobre um `PlanoBentoCard`
- **THEN** SHALL exibir o efeito de borda luminosa compatível com o tema ativo

#### Scenario: StreamingBentoCard com efeito de hover
- **WHEN** usuário passa o mouse sobre um `StreamingBentoCard`
- **THEN** SHALL exibir o efeito de borda luminosa compatível com o tema ativo

#### Scenario: Compatibilidade com hover translate existente
- **WHEN** um card Tailwind já possui `hover:-translate-y-1` ou `hover:shadow-lg`
- **THEN** o efeito `.bento-hover-border` SHALL coexistir com esses efeitos sem conflito visual

---

### Requirement: KpiCard do Dashboard com efeito de hover border
O componente `KpiCard` renderizado dentro de `src/components/Dashboard.jsx` SHALL ter a classe `.bento-hover-border` aplicada ao seu `div` raiz, sem remover ou alterar seus estilos inline existentes.

#### Scenario: KpiCard com efeito de hover
- **WHEN** o usuário passa o mouse sobre um `KpiCard`
- **THEN** SHALL exibir o efeito de borda luminosa compatível com o tema ativo

#### Scenario: KpiCard mantém estilos inline
- **WHEN** o `KpiCard` é renderizado com a classe `.bento-hover-border`
- **THEN** suas propriedades de `style` inline (background, color, etc.) SHALL permanecer inalteradas

---

### Requirement: Efeito desativado no modo de edição do dashboard
O efeito `.bento-hover-border` NÃO SHALL ser aplicado a cards dentro de um container `.layout.is-editing`.

#### Scenario: Modo de edição do react-grid-layout
- **WHEN** o dashboard está em modo de edição (`.layout.is-editing` presente)
- **THEN** o efeito de borda hover dos widgets SHALL ser suprimido para não conflitar com os controles de drag-and-drop
