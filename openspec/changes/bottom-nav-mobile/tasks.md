## 1. Criar componentes base

- [x] 1.1 Criar `src/components/MobileBottomNav.jsx` com 5 slots fixos (Início, Serviços, Cobertura, Equipe, Mais) usando `useBentoTheme` e `Icons`
- [x] 1.2 Criar `src/components/MobileMoreSheet.jsx` com itens secundários, backdrop e fechamento ao tocar fora
- [x] 1.3 Garantir que ambos os componentes só sejam renderizados abaixo do breakpoint `lg`

## 2. Integrar navegação

- [x] 2.1 Conectar slots da bottom nav ao `currentView` via prop `setCurrentView`
- [x] 2.2 Conectar itens do sheet ao `currentView` e fechar o sheet ao selecionar
- [x] 2.3 Destacar visualmente o item ativo tanto na bottom nav quanto no sheet

## 3. Ajustar Header e App

- [x] 3.1 Remover o dropdown mobile e o botão hamburger de `src/components/Header.jsx` para telas abaixo de `lg`
- [x] 3.2 Adicionar `MobileBottomNav` e `MobileMoreSheet` em `src/App.jsx` dentro do layout mobile
- [x] 3.3 Adicionar `padding-bottom` no container de conteúdo de `App.jsx` para não ficar escondido atrás da bottom nav

## 4. Testar e validar

- [x] 4.1 Verificar comportamento em viewport mobile (< 1024px): bottom nav visível, sidebar oculta
- [x] 4.2 Verificar comportamento em viewport desktop (>= 1024px): bottom nav oculta, sidebar visível
- [x] 4.3 Testar abertura/fechamento do sheet e navegação para todas as views
- [x] 4.4 Verificar se item "Painel Admin" só aparece para usuários admin
- [x] 4.5 Verificar se o último conteúdo da página não fica coberto pela bottom nav
