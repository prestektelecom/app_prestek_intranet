## ADDED Requirements

### Requirement: Estilizaçao glassmorphism e bordas com hover glow

Todos os cards do Bento Grid SHALL utilizar superfícies translúcidas com efeito de desfoque de fundo (`backdrop-blur-md`), bordas semi-transparentes suaves (`border-border/60`) e brilho responsivo no hover (`bento-hover-border`).

#### Scenario: Interaçao de hover nos cards
- **WHEN** o usuário passa o cursor sobre qualquer card do Bento Grid
- **THEN** a borda do card transita suavemente (300ms) aumentando o contraste e projetando um brilho sutil com cantos arredondados (`rounded-2xl`).

### Requirement: Exibiçao de estatísticas e numerais tabulares

As métricas numéricas do Dashboard (KPIs, total de OS e contadores) SHALL ser renderizadas em formato tabular/monospace com badges de tendência coloridas (`bg-emerald-500/10 text-emerald-600`) para evitar saltos visuais na atualizaçao.

#### Scenario: Renderizaçao de KPIs
- **WHEN** os dados de eficiência ou contagem de OS são carregados
- **THEN** o valor é exibido em destaque typography extra-bold com a pílula de variação percentual ao lado.
