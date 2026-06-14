## 1. Preparação do Componente

- [x] 1.1 Adicionar constante `C` com tokens Bento Blue e função `tone()` no corpo do componente `AdminDashboard.jsx` (antes do `return`)
- [x] 1.2 Atualizar o objeto `ICONE_ACAO`: trocar `create_comunicado` de `bg-primary/10 text-primary` para `bg-[#EAF4FF] text-[#4A9EF5]`
- [x] 1.3 Mudar o atributo `className` do `<main>` de `bg-background` para `style={{ background: C.bg }}` (azul-gelo `#F5F9FF`)

## 2. KPI Cards — Visão Geral do Painel

- [x] 2.1 Redesenhar os 3 KPI cards usando `style` inline com tokens Bento Blue: fundo `#FFFFFF`, borda `#E4ECF5`, sombra suave
- [x] 2.2 Adicionar accent stripe de 4px no topo de cada KPI (azul para Usuários, ciano para Comunicados, verde para Ações Admin)
- [x] 2.3 Atualizar ícone de cada KPI com `sIconBox` colorido (mesma função usada em Configuracoes.jsx)
- [x] 2.4 Aplicar tipografia ink: label em `#8896A8` JetBrains Mono uppercase, valor em `#0B1B2E` 30px bold

## 3. Atividades Recentes

- [x] 3.1 Redesenhar o card "Atividades Recentes" com borda `#E4ECF5` e fundo `#FFFFFF` via `style` inline
- [x] 3.2 Trocar o link "Ver Tudo" de `text-primary` (âmbar) para `color: '#4A9EF5'`

## 4. Cards de Atalho

- [x] 4.1 Atualizar card destaque "Gerenciar Usuários": gradiente `#1F5BA8 → #2D7BD4 → #4A9EF5` (remover `from-primary to-orange-600`)
- [x] 4.2 Hover dos cards "Comunicados" e "Logs de Auditoria": `hover:border-[#4A9EF5]/40` (remover `hover:border-primary/40`)

## 5. Verificação

- [x] 5.1 Abrir o painel admin no browser e confirmar que nenhum elemento da "Visão Geral" exibe cor âmbar/laranja
- [x] 5.2 Confirmar que o fundo está em azul-gelo `#F5F9FF`
- [x] 5.3 Confirmar que as demais abas (Usuários, Comunicados, etc.) ainda funcionam sem regressão
