## REMOVED Requirements

### Requirement: Breadcrumb responsivo
**Reason**: `ResponsiveBreadcrumb` não é importado em lugar nenhum; o portal não tem hierarquia de rotas (uma view por vez), e o header passa a mostrar o título da view (`chrome-header-context`), que cumpre o papel de localização.
**Migration**: remover `src/components/responsive/ResponsiveBreadcrumb.jsx`.
