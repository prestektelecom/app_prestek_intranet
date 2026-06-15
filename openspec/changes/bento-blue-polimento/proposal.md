## Why

A change `universalizar-bento-blue` consolidou a paleta Bento Blue nas variáveis semânticas e nos componentes principais. Restam ainda pequenos resquícios visuais e de configuração do tema warm/âmbar: helpers CSS, aliases Tailwind e um uso de `bg-primary` no AdminAuditoria. Este polimento elimina essas inconsistências finais e aproxima o codebase de um design system único e sustentável.

## What Changes

- Ajustar helpers CSS em `src/index.css` (`glass`, `login-btn`, scrollbar) para Bento Blue.
- Trocar `bg-primary` por hex Bento em `src/components/admin/AdminAuditoria.jsx`.
- Remover ou atualizar aliases legados warm/âmbar em `tailwind.config.js`.
- Validar build e consistência visual.

## Capabilities

### New Capabilities
- `bento-blue-css-polish`: Ajustar helpers globais e configuração Tailwind para Bento Blue.
- `bento-blue-admin-auditoria-polish`: Padronizar cores do AdminAuditoria com hex Bento.

### Modified Capabilities
<!-- Nenhum requisito funcional existente será alterado. -->

## Impact

- `src/index.css`
- `src/components/admin/AdminAuditoria.jsx`
- `tailwind.config.js`
- Experiência visual geral (detalhes de glassmorphism, login, scrollbar, impressão)
