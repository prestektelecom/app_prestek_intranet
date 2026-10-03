## Why

A dashboard atual usa um sistema de estilos próprio (`useBentoTheme` com inline styles pesados) que divergiu visualmente do restante da intranet, que já adota classes Tailwind com os tokens MD3 da Prestek. O resultado é uma experiência inconsistente: a dashboard parece um produto separado, com glassmorphism e gradientes intensos que não combinam com a linguagem corporativa limpa usada nas demais páginas. A troca resolve dívida de consistência visual e facilita manutenção futura.

## What Changes

- **Visual completo da Dashboard substituído**: abandona `useBentoTheme` e inline styles; adota classes Tailwind com a paleta MD3 já configurada no projeto (teal/indigo, Hanken Grotesk)
- **Header da página reformulado**: saudação "Olá, [nome] 👋" com subtítulo de contexto + widget de clima/hora mock (localidade estática por enquanto)
- **Card de Comunicados redesenhado**: adiciona um placeholder visual de "featured announcement" no topo do card, mantendo a lista compacta abaixo; a imagem hero real será conectada futuramente
- **Card de Atalhos Rápidos expandido**: de 4 para 7 atalhos (Reservar Sala, Suporte TI, Meu Perfil, Comunicados, Holerite, Ponto Eletrônico, Férias) em layout de lista vertical com ícone + label + hint
- **Novo card de Aniversariantes**: exibe colaboradores cujo aniversário cai hoje ou nos próximos 7 dias, consumindo `/api/colaboradores` com o campo `data_nascimento`
- **Backend**: campo `data_nascimento` adicionado ao response de `/api/colaboradores`
- **Drag-and-drop mantido**: `react-grid-layout` permanece; apenas o visual interno de cada widget muda
- **KPIs operacionais mantidos**: cards de Eficiência/Setor, Plantão e OS Pendentes permanecem na grid

## Capabilities

### New Capabilities

- `dashboard-md3-visual`: Visual MD3 da dashboard — novo estilo de cards, header de boas-vindas com widget de clima, paleta Tailwind unificada
- `dashboard-featured-announcement`: Placeholder do featured announcement hero no card de comunicados da dashboard
- `dashboard-aniversariantes`: Card de aniversariantes na dashboard consumindo data de nascimento da API de colaboradores
- `dashboard-atalhos-expandidos`: Grid de atalhos rápidos expandida para 7 itens em layout de lista vertical

### Modified Capabilities

- `dashboard-view`: Layout visual dos widgets e header da dashboard mudam; estrutura de grid e drag-and-drop permanecem
- `user-layout-persistence`: Sem mudança de requisito — layout salvo/carregado continua funcionando normalmente

## Impact

- **`src/components/Dashboard.jsx`**: reescrita visual completa dos componentes internos; lógica de dados e `react-grid-layout` preservados
- **`backend/server.js`**: rota `GET /api/colaboradores` recebe campo `data_nascimento` no objeto retornado
- **`src/hooks/useBentoTheme.js`**: não mais importado pelo Dashboard (pode ser mantido para uso futuro em outras telas)
- **`src/index.css`** ou **`tailwind.config.js`**: nenhuma mudança esperada; o design system MD3 já está configurado
- Sem impacto em rotas, autenticação ou outras páginas
