## 1. Estado Global de Busca (App.jsx)

- [x] 1.1 Adicionar estado `searchQuery` e `setSearchQuery` em `App.jsx`
- [x] 1.2 Passar `searchQuery` e `setSearchQuery` como props para `Header`
- [x] 1.3 Passar `searchQuery` como prop para `ServicesDirectory`
- [x] 1.4 Adicionar `useEffect([currentView])` que chama `setSearchQuery('')` ao trocar de view

## 2. Input de Busca Funcional (Header.jsx)

- [x] 2.1 Criar `searchInputRef` com `useRef` no `Header`
- [x] 2.2 Converter o `<input>` de busca para controlled (`value={searchQuery}`, `onChange={e => setSearchQuery(e.target.value)}`)
- [x] 2.3 Atribuir `ref={searchInputRef}` ao `<input>`
- [x] 2.4 Adicionar `useEffect` que registra listener global em `window` para `Ctrl+K` / `⌘K` → `searchInputRef.current.focus()` + `e.preventDefault()`
- [x] 2.5 Adicionar `onKeyDown` no `<input>` para `Escape` → `setSearchQuery('')` + `searchInputRef.current.blur()`
- [x] 2.6 Remover o listener do `useEffect` no cleanup (return)

## 3. Filtro de Busca nos Planos (ServicesDirectory.jsx)

- [x] 3.1 Receber `searchQuery` como prop no componente `ServicesDirectory`
- [x] 3.2 Criar função `matchesSearch(plan, term)` que verifica `descricao`, `valor_mensal` e `id`
- [x] 3.3 Encadear o filtro de busca após o filtro de categoria existente em `filteredPlans`
- [x] 3.4 Atualizar o estado vazio para exibir mensagem específica quando `searchQuery` não está vazio ("Nenhum plano encontrado para essa busca.")

## 4. Comparador — Estado e Checkbox (ServicesDirectory.jsx + PlanoBentoCard.jsx)

- [x] 4.1 Adicionar estado `comparingIds` (array de IDs, máx 3) em `ServicesDirectory`
- [x] 4.2 Criar funções `handleToggleCompare(id)` (adiciona/remove de `comparingIds`) e `handleClearCompare()` (limpa tudo)
- [x] 4.3 Exibir toast de aviso ao tentar adicionar 4º plano (reutilizar lógica de `showToast` existente)
- [x] 4.4 Passar `isComparing`, `onToggleCompare` como novas props para `PlanoBentoCard`
- [x] 4.5 Adicionar checkbox "Comparar" ao `PlanoBentoCard` com visual integrado (posição: canto superior esquerdo ou dentro da área de ações)
- [x] 4.6 Aplicar estilo de borda destacada no card quando `isComparing === true`

## 5. Componente PlanoComparador (novo arquivo)

- [x] 5.1 Criar `src/components/services/PlanoComparador.jsx`
- [x] 5.2 Implementar layout de drawer com `position: fixed; bottom: 0` e `z-index` adequado
- [x] 5.3 Implementar animação de entrada/saída via `translateY` (transition 300ms)
- [x] 5.4 Renderizar tabela com colunas por plano e linhas: Nome, Valor Mensal, Taxa de Instalação, Prazo de Entrega, Streaming Inclusos
- [x] 5.5 Destacar visualmente o plano com menor `valor_mensal` (badge "Melhor Preço" ou cor verde)
- [x] 5.6 Adicionar botão "Fechar comparação" que chama `onClear`
- [x] 5.7 Garantir que o drawer respeita o tema dark/light do sistema (classes Tailwind dark: existentes)

## 6. Integração do Drawer em ServicesDirectory.jsx

- [x] 6.1 Importar e renderizar `PlanoComparador` no `ServicesDirectory`
- [x] 6.2 Passar `comparingPlans` (planos resolvidos a partir de `comparingIds`), `isOpen` (`comparingIds.length >= 2`) e `onClear` como props
- [x] 6.3 Verificar que o drawer não aparece nas views `Technical` e `Streaming`

## 7. Verificação Final

- [x] 7.1 Testar Ctrl+K em todas as views (foca o input corretamente)
- [x] 7.2 Testar busca por nome, valor e ID — cards filtram em tempo real
- [x] 7.3 Testar busca sem resultados — mensagem correta aparece
- [x] 7.4 Testar reset da busca ao navegar para outra view e voltar
- [x] 7.5 Testar seleção de 2 planos → drawer abre
- [x] 7.6 Testar seleção de 3 planos → drawer atualiza com 3 colunas
- [x] 7.7 Testar tentativa de 4º plano → toast aparece, seleção não muda
- [x] 7.8 Testar desmarcação de plano → drawer atualiza ou fecha
- [x] 7.9 Testar botão "Fechar comparação" → drawer fecha, todos desmarcados
- [x] 7.10 Verificar visual em modo dark e light
