## Context

Ver proposal.md - Why. O que já está confirmado nesta investigação (todos os pontos abaixo foram verificados diretamente, não deduzidos):

- `usuarios_perfil.is_admin = true` para `marciofelix@prestek.com.br` (usuario_id `222`), com `atualizado_em` recente (login real durante a investigação).
- `GET /api/admin/dashboard-stats` com header `x-admin-email: marciofelix@prestek.com.br` retorna `200` — o middleware `adminAuth` (`backend/server.js`), que lê a mesma coluna, confirma o status de admin de forma independente do fluxo de login.
- O botão "Sair" do Sidebar limpa corretamente `localStorage`/`sessionStorage` (`@Stitch:user` e `@Stitch:currentView`) — logout completo confirmado.
- Mesmo após logout completo + novo login, nem o menu "TI" nem o botão "Gerenciar Categorias" aparecem — ambos gated por `user?.is_admin` no front-end.
- A leitura estática do código (`src/services/auth.js:loginUsuario` → `src/hooks/useLogin.js:handleSubmit` → `src/App.jsx` `onLogin`) não revela nenhum ponto óbvio onde `is_admin` seria perdido ou sobrescrito.
- Não há nenhuma outra rota `/api/login` duplicada no backend, nem fluxo de auto-login alternativo em `useLogin.js` que escape do `handleSubmit` normal.

Ou seja: o bug só é observável em runtime, não por leitura de código. O usuário que reporta o problema tem dificuldade de operar DevTools (Network/Console), então a investigação precisa de um jeito de expor o valor real sem depender disso.

## Goals / Non-Goals

**Goals:**
- Identificar, com evidência de runtime (não suposição), o ponto exato onde `is_admin` se perde entre a resposta de `POST /api/login` e o estado `user` usado pelos gates de UI.
- Corrigir a causa raiz encontrada.
- Deixar o código sem qualquer instrumentação de diagnóstico ao final.

**Non-Goals:**
- Não alterar `adminAuth` ou `POST /api/login` no backend a menos que a investigação prove que o problema está ali (o que os dados atuais contradizem).
- Não criar um sistema de logging/observabilidade permanente — a instrumentação desta change é descartável.
- Não expandir quem pode ser admin, nem revisitar o modelo de permissão (`is_admin` único vs. permissões granulares) — isso foi levantado como tangente na exploração, mas é uma decisão de produto separada.

## Decisions

**Diagnóstico via `alert()` temporário no momento do login, não DevTools.**
Como o usuário não consegue navegar Network/Console, o jeito mais direto e inequívoco de obter a evidência é fazer o próprio app exibir o dado — algo que qualquer pessoa consegue ler e reportar. Inserir temporariamente, em `src/App.jsx` dentro do callback `onLogin` (antes de qualquer transformação), um `alert(JSON.stringify(resultado, null, 2))` mostrando exatamente o que `loginUsuario()` retornou, e um segundo `alert` (ou o mesmo, ampliado) mostrando o `userData` já montado antes de `setUser(userData)`. Isso localiza o problema em uma de duas metades:
- Se o primeiro `alert` já mostrar `usuario.is_admin: false` (ou ausente) → o problema está entre o backend e `loginUsuario()`/`useLogin.js` (ex: uma resposta diferente da esperada, erro silencioso, cache de rede).
- Se o primeiro `alert` mostrar `true` mas o segundo mostrar `false`/ausente em `userData` → o problema está na montagem do `userData` em `App.jsx` (linha ~129-134).

Alternativa considerada: pedir para o usuário reinstalar/testar em outro navegador, ou guiá-lo passo a passo pelo DevTools. Rejeitada por já ter sido tentada nesta conversa sem sucesso — `alert()` é native, não requer navegação por painéis, e o conteúdo pode ser lido diretamente na tela ou copiado.

**Correção guiada pela evidência coletada, não pré-decidida.**
Como a causa raiz ainda é desconhecida, a correção específica (tasks.md) será determinada pelo resultado do diagnóstico acima. As duas hipóteses mais prováveis, dado o que já foi descartado:
1. A resposta de `/api/login` chega diferente do esperado no momento real da requisição (algo que só se manifesta em runtime — ex: uma race condition, uma resposta cacheada por algum proxy/service worker, ou um formato de payload que difere do que o código do backend aparenta enviar).
2. Algum código entre `resultado` e `userData` (ou um remount/re-render que reseta `user` para um valor antigo) sobrescreve `is_admin`.

Depois de identificada, a correção deve ser mínima e cirúrgica — sem reescrever o fluxo de login inteiro.

## Risks / Trade-offs

- [`alert()` bloqueia a UI e pode assustar o usuário em produção se esquecido] → Mitigação: instrumentação fica isolada em uma task própria de remoção (tasks.md), aplicada apenas localmente durante a sessão de diagnóstico, nunca commitada como está — remover antes de considerar a change completa.
- [O `alert()` só mostra o que aconteceu no momento do clique em "Entrar"; se o bug for intermitente (ex: race condition), pode não reproduzir na primeira tentativa] → Mitigação: pedir para repetir o teste 2-3 vezes se o primeiro resultado não for conclusivo.
- [A causa raiz pode acabar não sendo nenhuma das duas hipóteses listadas] → Mitigação: o diagnóstico via `alert()` é uma evidência direta, não uma suposição — qualquer que seja a causa real, o ponto de quebra fica localizado por eliminação binária (backend→loginUsuario vs. montagem do userData). **Isso se confirmou: nenhuma das duas hipóteses era a causa real (ver Resolução abaixo).**

## Resolução

A investigação (tasks 1-2) provou, com evidência de runtime, que `is_admin` chega correto em toda a cadeia: resposta do backend → `loginUsuario()` → `userData` → `setUser()` → prop `user` recebida por `Sidebar.jsx` no ponto exato do filtro do menu "TI". Um print de tela do usuário confirmou que o item "TI" sempre esteve presente, ativo e funcional.

O sintoma relatado ("não aparece o botão Gerenciar Categorias") tinha outra causa, não relacionada a permissão: `src/data/processosData.js` exporta `PROCESSOS` como um mock estático vazio (`export const PROCESSOS = []`, linha 72). `Processos.jsx` usa `lista.length === 0` para decidir entre renderizar o `EmptyState` ("Nenhum processo cadastrado ainda") ou a barra de busca/filtros — e é dentro dessa barra de filtros que vive o botão "Gerenciar Categorias". Com a lista de processos vazia, **todo usuário**, admin ou não, caía no `EmptyState`, que não inclui a barra de filtros. Não havia gate de admin quebrado; havia um gate de "lista vazia" que, como efeito colateral, também escondia um controle administrativo que deveria estar sempre acessível.

A correção (task 3.1) ajustou a condição em `Processos.jsx` para `lista.length === 0 && !user?.is_admin`, preservando o `EmptyState` de boas-vindas para usuários comuns sem processos, mas garantindo que administradores sempre vejam a barra de filtros — e portanto "Gerenciar Categorias" — independente de quantos processos existem.
