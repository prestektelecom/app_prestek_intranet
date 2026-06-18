## Why

O menu mobile atual no Header é um dropdown vertical com 8 itens empilhados, ocupando grande parte da altura da tela em celulares pequenos e dando uma sensação visual de peso. A navegação mobile pode ser mais compacta, acessível com o polegar e alinhada aos padrões de apps nativos.

## What Changes

- Substituir o dropdown de menu mobile no `Header.jsx` por uma **bottom navigation bar** fixa na parte inferior da tela, visível apenas abaixo do breakpoint `lg`.
- A bottom nav exibirá 5 slots principais: **Início**, **Serviços**, **Cobertura**, **Equipe** e **Mais**.
- O item **Mais** abrirá um **sheet inferior** contendo os demais itens de navegação: Setores, Plantão, Escritórios, Processos, Meus Chamados, Comunicados, Configurações e Painel Admin (este último apenas para administradores).
- Remover o botão de hamburger do header mobile, mantendo busca, notificações, admin, logout e perfil no topo.
- Adicionar `padding-bottom` ao conteúdo principal para evitar que fique escondido atrás da bottom nav.
- Manter a sidebar atual inalterada para telas grandes (`lg` em diante).

## Capabilities

### New Capabilities
- `mobile-bottom-navigation`: Define a bottom navigation bar fixa em mobile, seus slots principais, estados ativos e integração com `currentView`.
- `mobile-more-sheet`: Define o sheet inferior acionado pelo item "Mais", listando itens secundários e condicionais (admin).

### Modified Capabilities
- *(nenhuma capability existente tem requisitos alterados; a change é puramente de UI/UX da navegação mobile)*

## Impact

- `src/components/Header.jsx`: remoção do dropdown mobile e do botão hamburger; ajustes condicionais de layout.
- Novo componente `src/components/MobileBottomNav.jsx`: barra inferior de navegação.
- Novo componente `src/components/MobileMoreSheet.jsx`: sheet inferior com itens extras.
- `src/App.jsx`: ajuste de `padding-bottom` no container de conteúdo quando em mobile.
- Ícones e cores do tema Bento reutilizados via `useBentoTheme` e `Icons`.
