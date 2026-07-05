## Requirements

### Requirement: Página de Auditoria do Admin usa Bento Blue
O componente `src/components/admin/AdminAuditoria.jsx` SHALL ser migrado para o design system Bento Blue, substituindo cores, bordas e superfícies warm/âmbar pelos equivalentes Bento.

#### Scenario: Cards e listas da auditoria
- **WHEN** a aba Auditoria é exibida
- **THEN** os cards SHALL ter fundo branco `#FFFFFF`, borda `#E4ECF5` e texto `#0B1B2E`

#### Scenario: Botões e badges de ação
- **WHEN** a aba Auditoria exibe botões ou badges
- **THEN** a cor primária SHALL ser `#4A9EF5` e hover/foco SHALL usar `#2D7BD4`

#### Scenario: Textos secundários
- **WHEN** a aba Auditoria exibe labels, datas ou metadados
- **THEN** a cor do texto SHALL ser `#8896A8`

### Requirement: ThemeSwitcher usa Bento Blue
O componente `src/components/ThemeSwitcher.tsx` SHALL ser migrado para o design system Bento Blue, mantendo a funcionalidade de alternância de tema.

#### Scenario: Fundo e borda do switcher
- **WHEN** o ThemeSwitcher é renderizado
- **THEN** o fundo SHALL ser `#F7FAFD`, a borda `#E4ECF5` e o texto `#0B1B2E`

#### Scenario: Estado selecionado
- **WHEN** uma opção de tema está selecionada
- **THEN** a borda e o ring de foco SHALL usar `#4A9EF5`

### Requirement: LottieAvatar placeholder usa Bento Blue
O componente `src/components/common/LottieAvatar.jsx` SHALL usar a superfície Bento Blue no placeholder de carregamento/erro.

#### Scenario: Placeholder do avatar
- **WHEN** o avatar está em estado de placeholder
- **THEN** o background SHALL ser `#F7FAFD`

### Requirement: Fallback de ícone em AdminDashboard usa Bento Blue
O fallback de ícone de ação em `src/components/AdminDashboard.jsx` SHALL usar tokens Bento Blue em vez de tokens warm/âmbar.

#### Scenario: Ícone de ação sem cor específica
- **WHEN** uma ação da auditoria não possui cor definida
- **THEN** o fallback SHALL usar fundo `#F7FAFD` e texto `#8896A8`

### Requirement: Componentes órfãos são removidos
Os componentes `QuickShortcuts.jsx`, `AnnouncementsList.jsx`, `StatCard.jsx`, `TeamAvailability.jsx` e `GruposSupervisores.jsx` SHALL ser removidos se a verificação confirmar que não são importados em nenhum outro arquivo do projeto.

#### Scenario: Confirmação de não uso
- **WHEN** é feita uma busca por imports dos componentes em todo o repositório
- **THEN** nenhum arquivo exceto o próprio componente SHALL referenciá-lo

#### Scenario: Remoção segura
- **WHEN** a confirmação de não uso for positiva
- **THEN** os arquivos SHALL ser removidos do sistema de arquivos
