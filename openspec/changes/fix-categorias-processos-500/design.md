## Context

Ver proposal.md - Why. Dois fatores independentes causam a quebra hoje:

1. A tabela `categorias_processos` (migração `backend/migrations/019_categorias_processos.sql`) não existe no banco usado pelo backend local. Não há execução automática de migrations neste projeto — `backend/migrations/run.js` é um script manual, e `backend/run_migrations_admin.js` é uma lista hardcoded que já está desatualizada (só roda `015b` e `016`). Então uma migração nova só entra em vigor se alguém a executar manualmente.
2. Em `src/components/Processos.jsx` (~linha 670), o `useEffect` que busca categorias faz `fetch(...).then(res => res.json()).then(setCategorias)` sem checar `res.ok` nem validar o formato do corpo. `fetch` não rejeita a Promise em respostas 4xx/5xx — então o corpo de erro (`{ erro: "..." }`) vira o valor de `categorias`, e todo `categorias.map(...)` downstream (pills de filtro e `<select>` do `ProcessoModal`) lança `TypeError`, derrubando a árvore React (tela fica preta ao abrir o modal).

## Goals / Non-Goals

**Goals:**
- Tabela `categorias_processos` populada e acessível no ambiente local usado pelo backend.
- `Processos.jsx` nunca propaga um payload de erro como se fosse a lista de categorias.
- Uma falha ao buscar categorias degrada graciosamente (lista vazia) em vez de quebrar a renderização.

**Non-Goals:**
- Não introduzir um sistema de migrations automático/versionado (fora de escopo; risco maior, não pedido).
- Não resolver a colisão de numeração entre `019_add_imagem_url_comunicados.sql` e `019_categorias_processos.sql` — ambas já rodam corretamente em ordem alfabética via `run.js`; é uma inconsistência de nomenclatura, não um bug funcional.
- Não adicionar toast/notificação global de erro; o requisito é apenas não quebrar a página. Um aviso inline discreto é aceitável, mas não é o foco desta mudança.
- Não alterar a lógica de admin (`is_admin`) ou o CRUD de categorias em si — ambos já funcionam corretamente quando a tabela existe.

## Decisions

**Aplicar a migração 019 manualmente no banco local.**
Já existe o runner `backend/migrations/run.js`, que roda todos os `.sql` em `backend/migrations/` em ordem alfabética e é idempotente (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`). Rodar esse script contra o banco local é suficiente para destravar o ambiente de desenvolvimento — não é necessário criar um mecanismo novo. Alternativa considerada: atualizar `run_migrations_admin.js` para incluir a 019; rejeitada porque esse script parece ser um artefato pontual de uma migração anterior (bootstrap de admin), não o processo padrão do projeto, e ampliar seu escopo está fora do problema relatado.

**Validar a resposta antes de atualizar o estado `categorias`.**
Trocar o `.then(res => res.json()).then(setCategorias)` por uma verificação explícita: só chamar `setCategorias` quando `res.ok` for verdadeiro e o corpo for um array; caso contrário, logar o erro (mantendo o `console.error` já existente) e manter `categorias` como `[]` (valor inicial do `useState`). Isso resolve tanto o caso de erro HTTP quanto o de formato inesperado com uma única checagem, sem precisar de um novo estado de "erro" dedicado.

**Não bloquear a renderização do restante da página por causa da falha.**
`categorias` já é inicializado como `[]`; ao garantir que ele nunca receba um valor não-array, os `.map()` existentes (pills e `<select>`) simplesmente renderizam zero itens — sem necessidade de guardas adicionais (`Array.isArray` checks) espalhadas pelo JSX.

## Risks / Trade-offs

- [Migração aplicada manualmente hoje pode ser esquecida em outro ambiente (ex: produção)] → Mitigação: documentar no proposal/tasks que a migração precisa rodar em qualquer banco novo; fora de escopo criar automação, mas o passo fica explícito nas tasks.
- [Silenciar o erro de carregamento (sem toast) pode deixar o usuário sem saber por que não há categorias] → Mitigação: manter o `console.error` para debug, e considerar (task opcional) um aviso textual discreto perto dos filtros quando `categorias` estiver vazia por erro — sem introduzir um sistema de notificação novo.
