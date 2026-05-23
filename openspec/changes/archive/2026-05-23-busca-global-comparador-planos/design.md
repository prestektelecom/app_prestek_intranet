## Context

A intranet Prestek é uma SPA React (Vite + Tailwind) com roteamento manual via `currentView` em `App.jsx`. O Header é um componente irmão das páginas — não existe roteador de URL, então o estado compartilhado entre Header e páginas deve viver em `App.jsx` ou ser propagado via props.

O `ServicesDirectory.jsx` (94kb, 1350 linhas) é atualmente o arquivo mais denso do projeto, e concentra toda a lógica de planos, serviços técnicos, streaming e ranking de vendedores. O `Header.jsx` já possui um input de busca visual com badge `⌘K`, mas sem nenhuma lógica funcional associada.

## Goals / Non-Goals

**Goals:**
- Ativar o input do Header como campo de busca real para planos de internet
- `Ctrl+K` / `⌘K` foca o input; `Esc` limpa e desfoca
- A busca filtra `descricao`, `valor_mensal` e `id` dos planos em tempo real
- Resetar automaticamente a query ao trocar de view
- Adicionar checkbox "Comparar" em cada `PlanoBentoCard`
- Drawer inferior que surge ao selecionar 2–3 planos, comparando-os lado a lado
- Limitar seleção a 3 planos; toast informativo ao tentar selecionar um 4º

**Non-Goals:**
- Busca em outros tipos de conteúdo (colaboradores, processos, comunicados)
- Comparador disponível fora da view `services`
- Campo "Streaming Inclusos" preenchido dinamicamente (sempre exibe `—`)
- Persistência da seleção do comparador entre sessões
- Ativar o input de busca em views que não sejam `services`

## Decisions

### 1. Estado de `searchQuery` em `App.jsx` (não no Header)

**Decisão:** `searchQuery` e `setSearchQuery` vivem em `App.jsx` e descem como props para `Header` e `ServicesDirectory`.

**Alternativa considerada:** Estado local no `Header` com Context API para broadcast.

**Rationale:** O projeto não usa Context API em nenhum lugar — introduzir Context só para isso seria over-engineering. Prop drilling de um nível (`App → Header`, `App → ServicesDirectory`) é simples, rastreável e consistente com o padrão existente.

---

### 2. Input do Header como campo controlado

**Decisão:** Transformar o `<input>` do Header de não-controlado para controlado (`value={searchQuery}`, `onChange`), com `ref` para foco programático via Ctrl+K.

**Rationale:** O atalho Ctrl+K precisa de `ref` para `inputRef.current.focus()`. Um input controlado garante que o estado externo (`searchQuery`) e o valor visual do campo sempre estejam sincronizados.

O handler do evento de teclado é registrado em `window` dentro de um `useEffect` no `Header`, sendo removido no cleanup — padrão já usado em outros componentes do projeto (ex: `TiSupportModal`).

---

### 3. Busca ativa somente quando `currentView === 'services'`

**Decisão:** `ServicesDirectory` aplica o filtro de busca internamente. O input do Header fica visualmente ativo em todas as views, mas só tem efeito funcional quando o usuário está em `services`.

**Rationale:** Evita que a query "vaze" para outras views. O reset automático em `useEffect([currentView])` no `App.jsx` garante limpeza ao navegar.

---

### 4. `comparingIds[]` como estado local em `ServicesDirectory`

**Decisão:** O array de IDs dos planos selecionados para comparação fica em `ServicesDirectory`, não em `App.jsx`.

**Rationale:** O comparador é uma feature exclusiva de `services`. Expor esse estado globalmente (via App ou Context) não traz benefício e aumenta o acoplamento. O componente `PlanoComparador` recebe os planos já resolvidos como props derivadas de `comparingIds`.

---

### 5. `PlanoComparador` como componente separado

**Decisão:** Extrair o drawer de comparação para `src/components/services/PlanoComparador.jsx`.

**Alternativa considerada:** Incluir o drawer inline em `ServicesDirectory`.

**Rationale:** `ServicesDirectory` já está com 94kb. Manter o drawer inline aumentaria ainda mais o arquivo. Um componente isolado facilita manutenção, testes futuros e respeita o padrão já estabelecido na pasta `services/` (`PlanoBentoCard`, `TechBentoCard`, `StreamingBentoCard`).

---

### 6. Drawer inferior fixo com `position: fixed`

**Decisão:** O drawer de comparação usa `position: fixed; bottom: 0; left: 0; right: 0` com animação de `translateY` para entrar/sair.

**Rationale:** A página tem scroll vertical (`overflow-y: auto`). Um drawer com `position: fixed` garante que ele permaneça visível independentemente do scroll, como esperado para uma gaveta de comparação.

## Risks / Trade-offs

- **`ServicesDirectory` continua crescendo** → O comparador isolado em `PlanoComparador.jsx` mitiga parcialmente, mas o arquivo-pai ainda recebe novas props e estado. Refatoração mais profunda do `ServicesDirectory` está fora do escopo.

- **Input do Header ativo visualmente em todas as views** → Usuário pode digitar em outra view sem perceber que a busca não filtra nada. Mitigação: placeholder pode ser atualizado para "Buscar planos..." quando `currentView === 'services'`, e para o texto padrão nas demais views.

- **Drawer ocupa espaço vertical** → Em telas menores (laptop 13"), o drawer com 3 planos pode cobrir uma porção significativa dos cards. A altura do drawer deve ser limitada (máx. ~200px) com scroll interno se necessário.

- **Sem persistência do comparador** → Ao trocar de view e voltar, a seleção é perdida. Comportamento intencional (Non-Goal), mas deve ser claro ao usuário via UX (ex: "Sair da comparação?" não é necessário — basta informar no drawer que a seleção não é salva).
