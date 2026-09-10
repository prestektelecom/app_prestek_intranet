# chrome-navigation Specification

## Purpose
Fonte única dos itens de navegação consumida por Sidebar, barra inferior e sheet "Mais"; restrição estrutural das áreas de admin e tela "Sem permissão" honesta no NotFound.

## Requirements

### Requirement: Fonte única de navegação
O sistema SHALL manter os itens de navegação do portal (id, ícone, rótulo, grupo, restrição de papel) em um único módulo, consumido pela Sidebar, pela barra inferior mobile e pelo sheet "Mais".

#### Scenario: Rótulo igual em todas as superfícies
- **WHEN** um item de navegação é renderizado na Sidebar e na barra inferior
- **THEN** o rótulo é o mesmo nas duas superfícies (ex.: "Início", "Colaboradores")

#### Scenario: Item restrito declarado uma vez
- **WHEN** um item tem `somenteAdmin: true` na fonte única
- **THEN** nenhuma superfície o exibe para usuário sem `is_admin`, sem precisar de filtro local

### Requirement: Áreas de admin restritas estruturalmente
O sistema SHALL ocultar os itens "Painel Admin" e "TI" de usuários sem `is_admin` e SHALL impedir que as views `admin`, `ti` e `plantao-historico` renderizem seu conteúdo para esses usuários, mostrando em vez disso uma tela "Sem permissão".

#### Scenario: Não-admin com view admin persistida
- **GIVEN** um usuário sem `is_admin` tem `currentView = 'admin'` salvo na sessão
- **WHEN** o portal carrega
- **THEN** a tela "Sem permissão" é exibida no lugar do `AdminDashboard`, com copy que diz que o usuário não tem acesso e como pedir

#### Scenario: Admin vê e acessa
- **GIVEN** um usuário com `is_admin`
- **WHEN** abre a Sidebar ou o sheet "Mais"
- **THEN** "TI" e "Painel Admin" aparecem e navegam normalmente

### Requirement: Tela "Sem permissão" honesta
O `NotFound` SHALL ter uma variante para falta de permissão, distinta da variante de rota inexistente, sem afirmar que a área está "em construção".

#### Scenario: Copy da variante
- **WHEN** a variante "sem permissão" é renderizada
- **THEN** o título e o texto informam falta de acesso e oferecem voltar ao Início
