## 1. Backend — Expor data_nascimento

- [x] 1.1 Em `backend/server.js`, no `.map()` da rota `GET /api/colaboradores` (linha ~1038), adicionar `data_nascimento: f.data_nascimento || null` ao objeto retornado de cada colaborador

## 2. Dashboard — Header de Boas-vindas

- [x] 2.1 Criar componente `DashboardHeader` inline no `Dashboard.jsx` que recebe `firstName`, `cargoName` e `currentDateTime`
- [x] 2.2 Implementar widget de hora (atualiza a cada minuto com `setInterval`) e localidade estática "São Paulo"
- [x] 2.3 Renderizar o `DashboardHeader` acima do `ResponsiveReactGridLayout`, fora do grid (não é um widget draggável)
- [x] 2.4 Estilizar com classes Tailwind: tipografia Hanken Grotesk, paleta `primary`/`on-surface`/`outline-variant` do tailwind.config

## 3. Dashboard — Visual MD3 nos cards existentes

- [x] 3.1 Remover import de `useBentoTheme` do `Dashboard.jsx` e todas as referências ao objeto `C`
- [x] 3.2 Reescrever `KpiCard` usando classes Tailwind (bg-surface, border-outline-variant, text-on-surface, etc.) — manter lógica de dados intacta
- [x] 3.3 Reescrever `HeroCard` usando classes Tailwind com gradiente via classe `bg-gradient-to-br from-primary to-secondary` — manter lógica de dados intacta
- [x] 3.4 Reescrever `SetorBento` usando classes Tailwind — manter lógica de dados intacta
- [x] 3.5 Reescrever `PlantaoBento` usando classes Tailwind — manter lógica de dados intacta
- [x] 3.6 Reescrever `OsBento` usando classes Tailwind — manter lógica de dados intacta
- [x] 3.7 Reescrever `TeamBento` usando classes Tailwind — manter lógica de dados intacta
- [x] 3.8 Garantir que todos os cards usam `h-full` para preencher o cell do react-grid-layout

## 4. Dashboard — Card de Comunicados com Featured Announcement

- [x] 4.1 Reescrever `ComunicadosCard` usando classes Tailwind — manter lógica de dados e `relativeTime`/`stripMarkdown` intactas
- [x] 4.2 Adicionar banner hero no topo do card: fundo com gradiente `from-primary to-secondary`, badge de tipo, título do comunicado mais recente (ou texto "Nenhum comunicado em destaque")
- [x] 4.3 A lista de comunicados abaixo do banner deve exibir os itens a partir do segundo (excluindo o featured)
- [x] 4.4 Estilizar o banner com sobreposição de gradiente escuro na parte inferior + texto branco para legibilidade

## 5. Dashboard — Atalhos Rápidos Expandidos

- [x] 5.1 Reescrever `AtalhosCard` usando classes Tailwind
- [x] 5.2 Adicionar 3 novos atalhos ao array: Holerite (`href: '#'`), Ponto Eletrônico (`href: '#'`), Férias (`href: '#'`) — links externos com `target="_blank"`
- [x] 5.3 Mudar layout de grid 2×2 para lista vertical com `flex-col gap-2`
- [x] 5.4 Cada item deve ter área mínima de toque de 44px (`min-h-[44px]`)
- [x] 5.5 Cada item exibe: ícone à esquerda em círculo colorido, label em negrito, hint em texto muted à direita

## 6. Dashboard — Card de Aniversariantes

- [x] 6.1 Criar componente `AniversariantesCard` em `Dashboard.jsx`
- [x] 6.2 No `useEffect`, fazer `GET /api/colaboradores`, filtrar colaboradores com `data_nascimento` dentro dos próximos 7 dias (inclusive hoje), ordenar por proximidade
- [x] 6.3 Para cada aniversariante, calcular rótulo de data: "Hoje", "Amanhã" ou "DD/MM"
- [x] 6.4 Renderizar lista com: avatar de iniciais (bg-primary-container, text-on-primary-container), nome, departamento (via `resolveNomeSetor` ou id_departamento) e rótulo de data
- [x] 6.5 Implementar estado de loading (skeleton placeholders) e estado vazio ("Nenhum aniversariante nos próximos 7 dias")
- [x] 6.6 Estilizar com classes Tailwind conforme paleta MD3

## 7. Dashboard — Grid Layout (react-grid-layout)

- [x] 7.1 Adicionar `'aniversariantes'` como novo key nos layouts `DEFAULT_LAYOUT_LG`, `md`, `sm`, `xs`, `xxs` em posição adequada (ao lado ou abaixo dos atalhos)
- [x] 7.2 Renderizar `<AniversariantesCard>` dentro do `<div key="aniversariantes">` na grade
- [x] 7.3 Verificar que os layouts existentes (`hero`, `setor`, `plantao`, `os`, `comunicados`, `atalhos`, `team`) continuam funcionando sem regressão

## 8. Verificação Final

- [x] 8.1 Testar drag-and-drop dos cards — todos os widgets devem ser draggáveis no modo de edição
- [x] 8.2 Verificar que o layout salvo/carregado da API continua funcionando (novo card `aniversariantes` tem posição default se não estiver no layout salvo)
- [x] 8.3 Confirmar que dark mode aplica via classes `dark:` nos cards reescritos
- [x] 8.4 Verificar em mobile (abaixo de `md`) que o header de boas-vindas e os cards se adaptam corretamente
- [x] 8.5 Confirmar que `data_nascimento` está presente no response de `/api/colaboradores` via teste manual (ex: `curl /api/colaboradores | jq '.[0].data_nascimento'`)
