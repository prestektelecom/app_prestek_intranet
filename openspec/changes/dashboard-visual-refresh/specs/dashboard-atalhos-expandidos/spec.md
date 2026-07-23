## ADDED Requirements

### Requirement: Atalhos Rápidos expandidos para 7 itens
O card de Atalhos Rápidos da dashboard SHALL exibir 7 atalhos em layout de lista vertical (ícone + label + hint), com área de toque mínima de 44×44px por item.

Os 7 atalhos, em ordem, são:
1. **Reservar Sala** — abre WhatsApp (`https://wa.me/5582999220181?text=...`)
2. **Suporte TI** — abre modal `TiSupportModal`
3. **Meu Perfil** — navega para `settings`
4. **Comunicados** — navega para `announcements`
5. **Holerite** — abre link externo do portal de holerite (placeholder: `#`)
6. **Ponto Eletrônico** — abre link externo do sistema de ponto (placeholder: `#`)
7. **Férias** — abre link externo do portal de férias (placeholder: `#`)

#### Scenario: Todos os 7 atalhos renderizados
- **WHEN** o card de atalhos é exibido
- **THEN** exatamente 7 itens são visíveis em lista vertical, cada um com ícone, label e hint

#### Scenario: Atalhos com URL externa abrem em nova aba
- **WHEN** o usuário clica em um atalho com URL externa
- **THEN** a URL é aberta em nova aba (`target="_blank"`)

#### Scenario: Atalhos de navegação interna mudam a view
- **WHEN** o usuário clica em Meu Perfil ou Comunicados
- **THEN** `setCurrentView` é chamado com o ID da view correspondente

#### Scenario: Área de toque mínima garantida
- **WHEN** qualquer atalho é renderizado
- **THEN** o elemento clicável tem altura mínima de 44px (conforme AGENTS.md)

#### Scenario: Atalho Suporte TI abre modal
- **WHEN** o usuário clica em Suporte TI
- **THEN** o `TiSupportModal` é aberto (comportamento idêntico ao atual)
