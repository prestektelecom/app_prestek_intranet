# Ativação e Expansão da Aba "Prestek Admin"

Este documento detalha o planejamento para ativar a área administrativa ("Prestek Admin") da intranet. Atualmente, a interface visual existe em `AdminDashboard.jsx`, mas muitas abas estão com dados estáticos e não há um fluxo de navegação claro para que os administradores acessem essa área.

## Objetivos
1. Conectar as telas administrativas existentes aos dados reais do backend (IXC + PostgreSQL local).
2. Adicionar funcionalidades recomendadas essenciais para uma intranet corporativa.
3. Garantir o acesso seguro apenas para usuários com perfil de administrador.

> [!IMPORTANT]
> **Acesso de Administrador:** Precisamos garantir que apenas usuários com `is_admin = true` na tabela `usuarios_perfil` tenham acesso às rotas do backend e vejam o botão para entrar no painel.

## Funcionalidades Planejadas

### 1. Painel de Controle (Visão Geral)
- **Status Atual:** Interface montada com dados mockados (estáticos).
- **Proposta:**
  - Criar um endpoint `GET /api/admin/dashboard-stats` para buscar KPIs reais: Total de Usuários Ativos, Quantidade de Comunicados e Alterações Recentes (Logs).
  - Substituir os gráficos estáticos por um histórico real de atividades.

### 2. Gerenciar Usuários (Recomendado)
- **Status Atual:** Apenas o botão no menu lateral.
- **Proposta:**
  - Interface para listar todos os usuários sincronizados.
  - Funcionalidade para buscar usuários por nome ou email.
  - **Ação Crítica:** Permitir que administradores concedam ou revoguem o acesso `is_admin` de outros colaboradores.

### 3. Responsáveis de Setor (Grupos Supervisores)
- **Status Atual:** Funcionalidade já implementada através do componente `ResponsaveisManual.jsx`.
- **Proposta:** Manter como está, mas fazer uma revisão visual para integrar perfeitamente com o novo fluxo de navegação e garantir que erros da API sejam bem tratados.

### 4. Gestão de Comunicados (Novo/Recomendado)
- **Status Atual:** O backend já possui as rotas `/api/comunicados` (GET, POST, PUT, DELETE), mas a gestão costuma ser complexa sem uma tela dedicada.
- **Proposta:**
  - Adicionar uma aba "Gerenciar Comunicados" no painel Admin para criar, editar e excluir os comunicados que aparecem na tela inicial dos usuários.

### 5. Logs de Auditoria (Recomendado)
- **Status Atual:** Existem logs isolados (ex: `plantoes_historico`).
- **Proposta:**
  - Criar uma tabela genérica `auditoria_logs` para rastrear: quem deu acesso de admin para quem, quem alterou comunicados, quem modificou responsáveis.
  - Tela "Logs de Auditoria" exibindo uma tabela com filtros (data, usuário, tipo de ação).

### 6. Configurações Globais do Sistema
- **Status Atual:** Apenas o botão no menu lateral.
- **Proposta:**
  - Tela para configurações gerais (ex: Modo Manutenção, timeout de sessão da intranet).
  - Pode ser implementado numa tabela `configuracoes_globais`.

---

## Alterações Propostas na Arquitetura

### Frontend (`src/`)
- Modificar `Header.jsx` ou `Sidebar.jsx` para exibir um botão **"⚙️ Painel Admin"** apenas se `user?.is_admin === true`.
- Atualizar `AdminDashboard.jsx` para incluir os novos componentes de abas:
  - `[NEW]` `src/components/admin/AdminUsuarios.jsx`
  - `[NEW]` `src/components/admin/AdminComunicados.jsx`
  - `[NEW]` `src/components/admin/AdminAuditoria.jsx`

### Backend (`backend/`)
- `[NEW]` `backend/migrations/016_auditoria_configs.sql` (Tabelas para logs e configurações globais).
- `[MODIFY]` `backend/server.js`:
  - Adicionar um *middleware* de validação administrativa para proteger rotas `/api/admin/*`.
  - Adicionar endpoints para a listagem e edição do campo `is_admin` dos usuários (`PUT /api/admin/usuarios/:id/privilegios`).
  - Adicionar endpoint `/api/admin/dashboard-stats`.

---

## User Review Required

> [!WARNING]
> Antes de iniciarmos a programação, preciso da sua aprovação sobre os seguintes pontos:
> 
> 1. **Local do botão de acesso:** Você prefere que o botão para entrar no "Prestek Admin" fique no `Header` (perto do perfil do usuário) ou no menu lateral (`Sidebar`)?
> 2. **Funcionalidades:** As funcionalidades recomendadas (Gerenciar Usuários, Auditoria, Comunicados) atendem ao que você esperava?
> 3. **Segurança:** Atualmente o backend não usa Tokens JWT (usa a sessão repassada pelo frontend). Precisaremos adicionar uma verificação de segurança no backend enviando o e-mail ou ID do admin que está realizando a ação para o backend confiar. Tem alguma preferência de como lidamos com essa segurança interna?

Por favor, revise o plano e me dê a aprovação para iniciar a execução.
