## Why

O usuário deseja experimentar 3 designs criativos diferentes para o modo escuro (Cyber-Obsidian, Deep-Space Aurora e Minimalist Pitch Black) e selecionar o favorito diretamente na interface em tempo real. Implementar essa capacidade de teste de múltiplos temas escuros permite uma escolha interativa e refinamento preciso da identidade visual premium da Prestek Intranet.

## What Changes

- Implementar suporte a variantes do modo escuro.
- Adicionar no `localStorage` a chave `dark_theme_variant` com opções: `cyber`, `aurora`, `amoled` (sendo `cyber` o padrão inicial).
- Atualizar o [index.css](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/index.css) para injetar as variáveis CSS correspondentes baseadas na classe de variante ativa (`.dark-cyber`, `.dark-aurora`, `.dark-amoled`).
- Atualizar o hook [useBentoTheme.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/useBentoTheme.js) para carregar as cores do JS correspondentes à variante de dark mode ativa (`BENTO_DARK_CYBER`, `BENTO_DARK_AURORA`, `BENTO_DARK_AMOLED`).
- Atualizar [useTheme.ts](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/useTheme.ts) para gerenciar e injetar a classe da variante correspondente no `<html>` (ex: `dark-cyber`, `dark-aurora` ou `dark-amoled`) junto com a classe `dark`.
- Modificar o componente [ThemeSwitcher.tsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/ThemeSwitcher.tsx) ou adicionar um seletor específico em [Configuracoes.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Configuracoes.jsx) para alternar entre as 3 variantes em tempo real.

## Capabilities

### New Capabilities
- `creative-dark-mode-variants`: Suporte a múltiplos subtemas de modo escuro configuráveis dinamicamente.
- `dynamic-theme-variant-switcher`: Interface intuitiva para alternar e testar variantes do modo escuro.

## Impact

- `src/index.css`
- `src/hooks/useTheme.ts`
- `src/hooks/useBentoTheme.js`
- `src/components/Configuracoes.jsx`
- `src/components/ThemeSwitcher.tsx`
