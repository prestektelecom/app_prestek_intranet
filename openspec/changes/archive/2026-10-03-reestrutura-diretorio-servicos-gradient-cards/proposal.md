## Why

O Diretório de Serviços Internos atualmente exibe os planos de internet, serviços técnicos e pacotes de streaming com cards com estilo visual tradicional. Para elevar o nível visual da intranet da Prestek, queremos reestruturar estes cards utilizando o padrão dinâmico e moderno **`GradientCard`** (com Framer Motion, badges translúcidos, gradientes vibrantes em tom profissional e ilustrações/ícones decorativos de fundo), mantendo integralmente a seção **Rankings do Mês** e todas as funcionalidades interativas da página (como filtro por categoria, comparação de planos e edição para administradores).

## What Changes

- **Componente Reutilizável `GradientCard`**: Criação de `src/components/ui/gradient-card.jsx` com suporte a temas de gradiente (`blue`, `emerald`, `amber`, `purple`, `rose`), Framer Motion (hover lift, iluminação e rotação de elemento decorativo), badge translúcido de status, atributos e botões CTA com animação.
- **Card de Planos (`PlanoBentoCard.jsx`)**: Reformulado para utilizar a estética `GradientCard`, incluindo indicador de MAIS VENDIDO / PF / PJ / Link, checkbox de comparação integrado e barra de progresso de vendas no mês.
- **Card de Serviços Técnicos (`TechBentoCard.jsx`)**: Reformulado no formato `GradientCard` com badges de valor/gratuidade, prazos de execução e formas de pagamento.
- **Card de Streaming (`StreamingBentoCard.jsx`)**: Reformulado no formato `GradientCard` com destaque para combos inclusos e estética multimídia.
- **Preservação dos Rankings do Mês**: Mantida a seção de pódio e rankings de vendedores, planos mais vendidos e ticket médio com carrossel interativo e animações.

## Capabilities

### New Capabilities
- `gradient-service-cards`: Exibição de cards de serviços internos com design system de gradientes dinâmicos, micro-animações do Framer Motion e suporte a ilustrações decorativas flutuantes.

### Modified Capabilities
- Nenhuma alteração em requisitos funcionais de regras de negócio existentes.

## Impact

- `src/components/ui/gradient-card.jsx`: Novo componente de UI.
- `src/components/services/PlanoBentoCard.jsx`: Atualização visual do card de planos.
- `src/components/services/TechBentoCard.jsx`: Atualização visual do card de serviços técnicos.
- `src/components/services/StreamingBentoCard.jsx`: Atualização visual do card de streaming.
- `src/components/ServicesDirectory.jsx`: Adaptação do container e preservação da estrutura de Rankings do Mês.
