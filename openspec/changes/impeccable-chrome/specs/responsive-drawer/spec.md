## REMOVED Requirements

### Requirement: Drawer lateral para navegação mobile
**Reason**: `MobileDrawer` nunca teve gatilho no `Header` (o `onMenuClick` recebido pelo `Header` não é renderizado), então o componente nunca abriu em produção. A navegação mobile é a barra inferior mais o sheet "Mais"; identidade e saída passam para o sheet de perfil do header mobile (`chrome-header-context`).
**Migration**: remover `src/components/responsive/MobileDrawer.jsx`, o estado `isMobileDrawerOpen` e a prop `onMenuClick` em `App.jsx`/`Header.jsx`. O padrão de Escape + trava de scroll do drawer é absorvido pelo hook `useDismissable`.
