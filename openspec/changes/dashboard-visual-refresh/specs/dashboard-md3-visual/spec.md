## ADDED Requirements

### Requirement: Dashboard usa visual MD3 com classes Tailwind
O Dashboard SHALL renderizar todos os seus cards e widgets usando classes Tailwind da paleta MD3 configurada no projeto (`primary`, `surface`, `on-surface`, `outline-variant`, etc.), sem usar inline styles dependentes de `useBentoTheme`.

#### Scenario: Cards renderizados com classes Tailwind
- **WHEN** o usuário acessa a dashboard
- **THEN** todos os cards exibem bordas, fundos e textos via classes Tailwind (não via `style={{ background: C.surface }}`)

#### Scenario: Dark mode funciona via prefixo dark:
- **WHEN** o tema do sistema é dark
- **THEN** os cards da dashboard aplicam variantes `dark:` sem lógica JavaScript adicional

### Requirement: Header de boas-vindas com saudação personalizada
O header da dashboard SHALL exibir "Olá, [primeiro nome] 👋" e um subtítulo com o setor/cargo do usuário.

#### Scenario: Saudação renderizada com nome real do usuário
- **WHEN** o usuário logado tem `funcionario.funcionario` definido
- **THEN** o header exibe o primeiro nome extraído desse campo

#### Scenario: Saudação com fallback
- **WHEN** o campo de nome não está disponível
- **THEN** o header exibe "Olá, Usuário 👋"

### Requirement: Widget de hora em tempo real no header
O header SHALL exibir a hora atual do cliente, atualizada a cada minuto, e o nome da localidade (estático, "São Paulo").

#### Scenario: Hora atualizada a cada minuto
- **WHEN** 60 segundos se passam desde a última atualização
- **THEN** o widget exibe a hora corrente no formato HH:MM

#### Scenario: Localidade exibida como texto estático
- **WHEN** o widget é renderizado
- **THEN** exibe "São Paulo" como texto fixo (sem chamada de API de geolocalização)

### Requirement: Cards da grid preenchem altura do cell
Cada card da grid SHALL usar `h-full` (ou equivalente) para preencher a altura do cell do react-grid-layout em qualquer configuração de grid.

#### Scenario: Card redimensionado via drag-and-drop
- **WHEN** o usuário redimensiona um card no modo de edição
- **THEN** o conteúdo do card se adapta à nova altura sem overflow ou espaço vazio
