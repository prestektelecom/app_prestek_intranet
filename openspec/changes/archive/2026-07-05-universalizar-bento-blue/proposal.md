## Why

A intranet Prestek migrou a maior parte de suas páginas para o design system "Bento Blue" (fundo `#F5F9FF`, accent `#4A9EF5`, tipografia `Plus Jakarta Sans`), mas ainda existem componentes e tokens globais no tema warm/âmbar legado (`#ff8c00`, `#f8f7f5`, `Manrope`). Essa coexistência cria quebras visuais ao navegar entre páginas — especialmente no painel administrativo — e dificulta a manutenção de duas paletas paralelas. Universalizar o Bento Blue elimina a inconsistência e consolida a identidade visual do sistema.

## What Changes

- **Redefinir tokens globais** em `src/index.css` para que as variáveis semânticas (`--background`, `--primary`, `--border`, `--surface`, `--foreground`, etc.) apontem para a paleta Bento Blue.
- **Atualizar o container raiz** em `src/App.jsx` para herdar fundo azul-gelo, texto azul-escuro e fonte `Plus Jakarta Sans`.
- **Migrar componentes warm/âmbar ainda em uso**:
  - `src/components/admin/AdminAuditoria.jsx`
  - `src/components/ThemeSwitcher.tsx`
  - `src/components/common/LottieAvatar.jsx`
- **Revisar fallback em `AdminDashboard.jsx`** que ainda recorre a tokens semânticos warm.
- **Avaliar e remover componentes órfãos** que não são importados em lugar nenhum: `QuickShortcuts.jsx`, `AnnouncementsList.jsx`, `StatCard.jsx`, `TeamAvailability.jsx`, `GruposSupervisores.jsx`.
- **Revisar visualmente páginas legadas** que herdaram o novo fundo Bento após a troca de tokens globais.

## Capabilities

### New Capabilities
- `bento-blue-global-tokens`: Redefinir as variáveis semânticas CSS e o container raiz do aplicativo para a paleta Bento Blue.
- `bento-blue-component-migration`: Migrar os componentes React restantes do tema warm/âmbar para o design system Bento Blue.

### Modified Capabilities
<!-- Nenhum requisito funcional existente será alterado; esta mudança é estritamente visual. -->

## Impact

- `src/index.css` e `tailwind.config.js` (tokens semânticos globais)
- `src/App.jsx` (container raiz)
- `src/components/admin/AdminAuditoria.jsx`, `src/components/ThemeSwitcher.tsx`, `src/components/common/LottieAvatar.jsx`
- `src/components/AdminDashboard.jsx` (fallback de ícone)
- Componentes órfãos candidatos à remoção
- Experiência visual de todas as páginas, especialmente em modo claro
