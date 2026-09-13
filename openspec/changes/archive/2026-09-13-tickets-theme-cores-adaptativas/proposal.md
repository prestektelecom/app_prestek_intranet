## Why

O componente `TicketsList.jsx` (página "Suporte Técnico — Meus Chamados") utiliza o design system `useBentoTheme` no hero e no badge de status, mas os estados internos (loading, erro, vazio) e as células da tabela usam classes Tailwind com cores hexadecimais hardcoded (`bg-white`, `text-[#475467]`, `border-[#E4ECF5]`, etc.) que pertencem exclusivamente ao tema light. Isso quebra a identidade visual em todos os temas dark (Cyber, Aurora, AMOLED).

## What Changes

- Substituir todas as classes Tailwind de cor hardcoded no `TicketsList.jsx` por tokens do `useBentoTheme` (`C.surface`, `C.line`, `C.ink`, `C.ink2`, `C.muted`, `C.accent`, `C.accentDeep`, `C.danger`, `C.accentSoft`)
- Converter o container principal (`.bg-white .border-[#E4ECF5]`) para `style={{ ... }}` usando tokens do tema
- Converter estados de loading, erro e vazio para usar tokens
- Converter células de tabela (`#ID`, mensagem, data) para usar tokens via `style` inline
- O botão "Tentar Novamente" passa a usar gradiente via tokens do tema

## Capabilities

### New Capabilities
- `tickets-theme-adaptativo`: A página de tickets respeita o tema ativo do sistema (light / dark-cyber / dark-aurora / dark-amoled), com todas as cores vindas do `useBentoTheme`

### Modified Capabilities
_(nenhuma mudança de requisito comportamental — apenas adequação de estilo ao design system existente)_

## Impact

- **Arquivo afetado**: `src/components/TicketsList.jsx`
- **Sem impacto em API, rota ou lógica de negócio**
- **Sem novas dependências**
- **Sem mudanças em `useBentoTheme`** — o hook já fornece todos os tokens necessários
