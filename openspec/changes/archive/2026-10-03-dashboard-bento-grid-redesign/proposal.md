## Why

O layout atual do Dashboard baseia-se em um banner estático (Hero) e cartões em grade convencional, o que ocupa espaço nobre na tela sem entregar utilidade imediata. O usuário precisa rolar ou buscar manualmente informações críticas como Ordens de Serviço sob sua responsabilidade e alertas urgentes. Esta mudança introduz um redesenho completo no formato **Bento Grid Rico & Dinâmico (Estilo Apple / Stripe)**, priorizando informações úteis e conferindo um acabamento visual de padrão internacional com glassmorphism, cantos arredondados e interatividade fluida.

## What Changes

- Redesenho do **Hero Card**: transforma-se em um **Hero Inteligente e Útil**, exibindo saudação contextual ("Bom dia/Boa tarde"), cargo, hora/localidade ao vivo, atalho em destaque `+ Abrir Chamado TI` e alerta técnico crítico em destaque.
- Reestruturação da **Hierarquia Visual**:
  - Destaque em tamanho expandido para o card **OS no meu nome** com contagem direta e pílula de atenção para prazos do dia.
  - Card de **Comunicados Urgentes** com banner de alerta para a mensagem mais recente.
  - Cards secundários compactos para **Eficiência/KPIs**, **Plantões** e **Atalhos Rápidos**.
- Atualização da **Identidade Visual (Bento Glassmorphism)**:
  - Uso de superfícies levemente translúcidas (`backdrop-blur-md`), bordas semi-transparentes suaves e cantos arredondados (`rounded-2xl`).
  - Brilho de borda responsivo ao toque/hover (`bento-hover-border`).
  - Sparklines elegantes com gradientes de preenchimento.

## Capabilities

### New Capabilities

- `bento-dashboard-layout`: Estrutura de layout Bento Grid responsiva e focada em utilidade, destacando chamados pendentes, comunicados críticos e ações rápidas.
- `bento-glassmorphism-theme`: Sistema visual premium com glassmorphism, efeitos de hover brilhantes, gradientes orgânicos e tipografia limpa.

### Modified Capabilities

- Nenhuma capability existente está sendo alterada em seus pré-requisitos de API.

## Impact

- **`src/components/Dashboard.jsx`**: Reestruturação do layout de widgets, substituição dos componentes de cards pelos novos modelos Bento e refatoração do Hero.
- **`src/index.css`**: Adição de utilitários para glassmorphism e aprimoramento dos estilos do `bento-hover-border`.
- **Sem impacto em rotas ou banco de dados**: Usa os mesmos dados já fornecidos pelas APIs backend existentes.
