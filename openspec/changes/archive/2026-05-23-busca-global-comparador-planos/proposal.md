## Why

Atualmente, o usuário precisa rolar a tela ou usar os botões de filtro de categoria para encontrar um plano na página de Serviços Internos — não há busca textual. Além disso, comparar dois ou três planos lado a lado exige memória manual do usuário, o que prejudica a experiência de vendas no balcão. Essas fricções são resolvíveis com UX já familiar (busca tipo spotlight, comparador tipo e-commerce).

## What Changes

- O input de busca no `Header` — atualmente decorativo — passa a ser funcional, com estado controlado em `App.jsx`
- `Ctrl+K` / `⌘K` dá foco ao input do Header em qualquer página
- A busca filtra instantaneamente os cards de planos por nome, valor ou ID do IXC, apenas quando o usuário está na view `services`
- Ao trocar de view, a query de busca é resetada automaticamente
- Cada card de plano ganha um checkbox "Comparar"
- Ao selecionar 2 ou 3 planos, abre-se um drawer (gaveta) na parte inferior da tela com os planos comparados lado a lado
- Tentar selecionar um 4º plano exibe um toast de aviso; o drawer permanece com os 3 já selecionados
- Um botão "Fechar comparação" no drawer desmarca todos os planos

## Capabilities

### New Capabilities

- `busca-planos`: Busca textual em tempo real nos cards de planos da ServicesDirectory, ativada pelo input global do Header (Ctrl+K para focar). Filtra por nome (`descricao`), valor mensal e ID do IXC.
- `comparador-planos`: Seleção de 2 a 3 planos via checkbox nos cards, com drawer inferior exibindo comparação lado a lado das especificações (valor mensal, taxa de instalação, prazo de entrega).

### Modified Capabilities

*(Nenhuma capability existente tem seus requisitos alterados)*

## Impact

- `src/App.jsx` — novo estado `searchQuery` + `setSearchQuery`, reset no `useEffect` de troca de view
- `src/components/Header.jsx` — input controlado com `ref`, `value`, `onChange`, handler global de Ctrl+K e Esc
- `src/components/ServicesDirectory.jsx` — recebe `searchQuery` como prop, adiciona lógica de filtro textual e estado `comparingIds[]`
- `src/components/services/PlanoBentoCard.jsx` — novo checkbox "Comparar" com visual integrado ao card
- `src/components/services/PlanoComparador.jsx` — novo componente de drawer com tabela de comparação lado a lado
- Sem novas dependências externas; sem alterações de API ou banco de dados
