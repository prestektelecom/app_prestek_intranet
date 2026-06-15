## Why

A intranet Prestek já adota o design system Bento Blue no modo claro, mas o modo escuro ainda usa a paleta warm/âmbar legada (`#ff8c00`, `#141210`). Isso cria uma quebra visual forte ao alternar o tema e mantém duas identidades conflitantes no mesmo sistema. Implementar um dark mode Bento consistente unifica a experiência visual e elimina o último resquício do tema antigo.

## What Changes

- Redefinir as variáveis CSS `.dark` em `src/index.css` para uma paleta azul-escura Bento.
- Atualizar tokens Bento (`--surface-soft`, `--line`, `--ink`, etc.) para terem valores consistentes no dark.
- Ajustar `ThemeSwitcher.tsx` para refletir a nova paleta nas previews.
- Migrar componentes críticos (`Header`, `Sidebar`, `Dashboard`, `Configuracoes`, `AdminDashboard`) para reagirem ao tema escuro.
- Migrar demais páginas Bento (`ServicesDirectory`, `Directory`, `Coverage`, `Schedule`, `Processos`, `Comunicados`, `TicketsList`, `Offices`, `Sectors`, `ResponsaveisManual`) e seus subcomponentes.
- Validar build e consistência visual.

## Capabilities

### New Capabilities
- `dark-mode-bento-foundation`: Fundação CSS do tema escuro Bento (variáveis e ThemeSwitcher).
- `dark-mode-bento-critical-components`: Suporte dark nos componentes críticos (Header, Sidebar, Dashboard, Configuracoes, AdminDashboard).
- `dark-mode-bento-remaining-pages`: Suporte dark nas demais páginas Bento e subcomponentes.

### Modified Capabilities
<!-- Nenhum requisito funcional existente será alterado. -->

## Impact

- `src/index.css`
- `src/components/ThemeSwitcher.tsx`
- `src/components/Header.jsx`
- `src/components/Sidebar.jsx`
- `src/components/Dashboard.jsx`
- `src/components/Configuracoes.jsx`
- `src/components/AdminDashboard.jsx`
- Demais páginas Bento e subcomponentes
