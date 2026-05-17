## 1. Configuração do Backend e Banco de Dados

- [x] 1.1 Criar migration SQL (se aplicável) ou adicionar tabela `user_dashboard_layouts` no PostgreSQL via admin/script.
- [x] 1.2 Criar modelo/controller no backend (Express) para gerenciar o Layout.
- [x] 1.3 Implementar endpoint `GET /api/user/dashboard-layout` para resgatar o JSON do layout do usuário.
- [x] 1.4 Implementar endpoint `POST /api/user/dashboard-layout` para salvar o JSON do layout do usuário.

## 2. Configuração Inicial do Frontend

- [x] 2.1 Instalar a biblioteca `react-grid-layout` e tipagens/CSS associados (`npm install react-grid-layout`).
- [x] 2.2 Configurar chamadas de API no frontend (funções fetch no arquivo de serviços ou diretamente) para GET e POST do layout.

## 3. Refatoração da Dashboard (Drag and Drop)

- [x] 3.1 Importar e configurar o `<ResponsiveReactGridLayout>` no componente `Dashboard.jsx`.
- [x] 3.2 Refatorar os componentes hardcoded de layout em `Dashboard.jsx` para serem iterados via um mapa de layout (separar `EficienciaCard`, `PlantaoCard`, etc. como widgets filhos do grid).
- [x] 3.3 Adicionar estado `isEditing` no `Dashboard.jsx` (ou global) e atrelar às propriedades `isDraggable` e `isResizable` do Grid.
- [x] 3.4 Incluir o botão "Personalizar Dashboard" (apenas se for permissivo ou global para todos os usuários). que alterna o estado `isEditing`.

## 4. Integração e Persistência

- [x] 4.1 Configurar `<ResponsiveReactGridLayout>` e os states (`layout`, `isEditing`).efault ou o layout vindo da API (`GET /api/user/dashboard-layout`) no mount.
- [x] 4.2 Ligar a função `onLayoutChange` do Grid para manter o state local atualizado.
- [x] 4.3 Adicionar a chave `key` de acordo com os itens do layout e os `classNames` condicionados (estilo hover e grab só no modo de edição). (ex: botão "Salvar"), disparar o `POST /api/user/dashboard-layout` para salvar a versão final no PostgreSQL.
- [x] 4.4 Transformar cada Card em um widget encapsulado numa `div` gerenciada pelo Grid.get garantindo responsividade nos breakpoints menores.
