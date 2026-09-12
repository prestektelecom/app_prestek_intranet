## MODIFIED Requirements

### Requirement: Dark Mode Consistente

O dark mode da página SHALL usar os tokens do tema escuro ativo
(cyber/aurora/amoled) em vez de cor hex fixa, incluindo a página completa
de histórico/auditoria de plantões (`PlantaoHistorico.jsx`), acessível pelo
botão "Auditoria" do Hero.

#### Scenario: Usuário ativa o modo escuro

- **WHEN** um tema escuro é aplicado
- **THEN** a página usa `bg-background`/`bg-surface` do tema ativo para
  fundo e superfícies.
- **AND** o accent de destaque é o `var(--accent)` do tema ativo (rampa
  laranja da marca), sem hex hardcoded sobrepondo o token.

#### Scenario: Usuário abre o histórico completo de plantões em um tema escuro

- **WHEN** o administrador abre a página de histórico/auditoria de plantões
  (`PlantaoHistorico.jsx`) com um tema escuro ativo
- **THEN** o card da tabela e da barra de filtros usam `bg-surface`/`border-border`
  do tema ativo, não um fundo branco fixo
- **AND** o texto de cada linha (nome do admin, datas, badges "Alterado"/"Sem
  mudança") mantém contraste WCAG AA (≥ 4,5:1) contra esse fundo

## ADDED Requirements

### Requirement: Modal de Gestão de Plantão com Trap de Foco

O `ManagePlantaoModal` SHALL conter a navegação por teclado dentro de si
enquanto estiver aberto, consistente com o contrato `aria-modal="true"` que
já declara.

#### Scenario: Usuário navega pelo modal só com teclado

- **WHEN** o `ManagePlantaoModal` está aberto e o usuário pressiona Tab
  repetidamente
- **THEN** o foco circula apenas entre os elementos focáveis do modal, nunca
  alcançando elementos da página por trás do backdrop
- **AND** Shift+Tab a partir do primeiro elemento focável do modal move o
  foco para o último elemento focável do modal

#### Scenario: Usuário fecha o modal com Escape

- **WHEN** o usuário pressiona Escape com o modal aberto
- **THEN** o modal fecha
- **AND** o foco retorna ao elemento que abriu o modal
