## Why

A atual interface da Dashboard apresenta o conteúdo de forma rígida e muito separada, engessando a experiência de diferentes perfis de usuário (ex: RH vs. TI). Ao permitir que o usuário personalize sua própria Dashboard arrastando e redimensionando widgets, aumentamos o engajamento e garantimos que as informações mais relevantes para cada indivíduo estejam sempre acessíveis, melhorando a produtividade. A escolha pelo modo de edição explícito evita acidentes, enquanto salvar no banco de dados garante uma experiência contínua independente do dispositivo.

## What Changes

- Transformação da estrutura de Grid fixa da `Dashboard.jsx` em um sistema de widgets personalizáveis (reordenáveis e redimensionáveis).
- Adição de um "Modo de Edição" (via botão "Personalizar Dashboard") para evitar que o usuário arraste ou redimensione cards acidentalmente.
- Criação de uma tabela/esquema no PostgreSQL para armazenar a configuração do layout de cada usuário.
- Criação de endpoints no backend para buscar e salvar a configuração do layout da Dashboard atrelado ao ID do usuário.
- Refatoração dos componentes atuais da Dashboard (como `EficienciaCard`, `PlantaoCard`, etc.) para se comportarem como Widgets independentes dentro do novo sistema de grid (ex: react-grid-layout).

## Capabilities

### New Capabilities
- `dashboard-customization`: Define os requisitos para o sistema de arrastar e soltar (Drag and Drop), redimensionamento de cards, e a lógica do "Modo de Edição" para prevenir modificações acidentais.
- `user-layout-persistence`: Define os requisitos de armazenamento persistente da preferência de layout de cada usuário no banco de dados PostgreSQL, incluindo os endpoints de API necessários.

### Modified Capabilities
- `dashboard-view`: Os requisitos da visualização da Dashboard atual mudam de um layout estático para um container dinâmico que carrega widgets baseados na preferência do usuário.

## Impact

- **Frontend**: O componente `Dashboard.jsx` será extensamente reescrito. Será necessário introduzir uma biblioteca de manipulação de grid (como `react-grid-layout` ou `@dnd-kit/core`).
- **Backend**: Novos endpoints (`GET /api/user/dashboard-layout` e `POST /api/user/dashboard-layout`) serão criados. O esquema do banco de dados PostgreSQL precisará de uma nova tabela (ou nova coluna na tabela de usuários) para guardar JSONs de layout.
- **Banco de Dados**: Migração necessária no PostgreSQL para suportar o armazenamento persistente.
