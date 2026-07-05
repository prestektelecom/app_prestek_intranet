## Context

A navegação mobile atual vive em `src/components/Header.jsx` como um dropdown absoluto (`position: absolute; top: 100%`) com 8 itens verticais. Cada item usa `padding: 10px 14px`, `font-size: 14px` e ícone de 20px. Em telas pequenas, essa lista ocupa grande parte da altura útil e cobre o conteúdo sem ganho de espaço.

A sidebar desktop (`src/components/Sidebar.jsx`) não será alterada. A mudança é estritamente para o breakpoint abaixo de `lg` (padrão Tailwind: < 1024px).

## Goals / Non-Goals

**Goals:**
- Reduzir a altura ocupada pela navegação principal no mobile.
- Tornar a navegação acessível com o polegar, seguindo padrões de apps nativos.
- Manter visíveis os 4 itens mais usados e agrupar os demais em "Mais".
- Preservar todos os destinos de navegação existentes no mobile (inclusive os hoje ausentes no dropdown, como Meus Chamados e Comunicados).

**Non-Goals:**
- Alterar a sidebar desktop.
- Alterar rotas, permissões ou lógica de negócio.
- Adicionar animações complexas ou gestos de swipe.
- Redesenhar o header desktop.

## Decisions

### 1. Bottom nav fixa no rodapé em mobile
- **Escolha:** Componente `MobileBottomNav` fixo com `position: fixed; bottom: 0`, visível apenas abaixo de `lg`.
- **Racional:** Padrão consolidado em iOS/Android; acesso unimanual; não cobre o conteúdo quando não interage.
- **Alternativa considerada:** Manter dropdown do header e apenas compactá-lo. Rejeitado porque não resolve o acesso com uma mão nem a sensação de peso.

### 2. Cinco slots principais
- **Escolha:** Início (dashboard), Serviços, Cobertura, Equipe (directory), Mais.
- **Racional:** Os quatro primeiros são os módulos mais citados no app e nas changes recentes. "Equipe" é mais curto que "Colaboradores" e evita quebra de linha em telas estreitas.
- **Alternativa considerada:** Incluir Plantão nos slots principais. Rejeitado porque o 5º slot já é naturalmente um agrupador.

### 3. Sheet inferior para "Mais"
- **Escolha:** Sheet que sobe da parte inferior com backdrop escurecido e fecha ao tocar fora.
- **Racional:** Padrão mobile nativo; melhor ergonomia que dropdown vindo do topo; reaproveita a lista vertical sem inchar a tela.
- **Alternativa considerada:** Dropdown do header. Rejeitado porque quebraria a consistência com a bottom nav.

### 4. Dois componentes separados
- **Escolha:** `MobileBottomNav.jsx` e `MobileMoreSheet.jsx`.
- **Racional:** Separa responsabilidades (barra vs. modal) e facilita testes/manutenção.

### 5. Header sem hamburger no mobile
- **Escolha:** Remover o botão `≡` do header quando em mobile.
- **Racional:** A navegação agora está na parte inferior; manter o botão criaria duplicação.

### 6. Padding-bottom no container de conteúdo
- **Escolha:** Adicionar `padding-bottom` equivalente à altura da bottom nav + margem de segurança no `App.jsx`.
- **Racional:** Evita que listas, botões ou forms no final da página fiquem escondidos atrás da barra fixa.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Usuários que acessam muito Setores/Plantão/Processos terão um toque a mais | Monitorar uso; se necessário, future change pode permitir personalizar os 4 slots fixos |
| Sheet inferior pode cobrir parte do conteúdo ao abrir | Backdrop fecha ao tocar fora; sheet não é modal bloqueante de scroll |
| Duplicação de lista de itens entre Sidebar e Header | Manter array centralizado? Avaliado: por ora arrays locais, pois a sidebar agrupa por "Menu"/"Sistema" e a bottom nav usa categorias diferentes |
| Pequenas telas (< 360px) podem quebrar labels | Usar labels curtos e font-size de 10px; garantir `min-width` nos itens |

## Open Questions

- Nenhuma. Todas as decisões foram alinhadas durante a exploração.
