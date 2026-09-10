## Context

O Login é a única tela sem o chrome e a única sem tokens: `Login.jsx`, `LoginForm.jsx` e `LoginIllustration.jsx` são hex fixo em Tailwind arbitrário, com a raiz pintando o próprio gradiente. `useLogin.js` faz o health check em polling de 3 s, grava `@Stitch:creds` (e-mail e senha em claro) e chama `services/auth.js`, que faz retry em 5xx. O `App.jsx` já persiste a sessão em `@Stitch:user` com `expiry` de 7 dias quando `lembrar` é verdadeiro. A rota `POST /api/login` em `backend/server.js` consulta o IXC, compara `dados.total === 0` (estrito; o IXC devolve texto) e, no `catch`, devolve `erro.message`. O NotFound já lê `useBentoTheme` desde a Fase 1; a única cor fixa é o Lottie `lottieflow-404` (preto). `lottie-react` só é usado nessas duas telas. Restrições: PRODUCT.md (IXC como fonte de verdade, PT-BR, cinco temas, sem alegações fabricadas), DESIGN.md (tokens, "Flat At Rest", "Orange Is Fill", "Badge Pair", rampa tipográfica), e as convenções de `AGENTS.md` (44px de alvo, mobile-first).

## Goals / Non-Goals

**Goals:**
- Login e NotFound lendo os mesmos tokens que o resto do portal, verificados nos cinco temas e em 1440/390.
- Fluxo de erro previsível de ponta a ponta: backend com um código por causa, cliente sem retry em 4xx, tela com `role="alert"` e foco no campo.
- Zero segredo no navegador: só a sessão persiste.
- Zero asset pesado: painel da marca em código, 404 em SVG.

**Non-Goals:**
- Recuperação de senha ("esqueci a senha"): o IXC é a fonte de verdade e não há endpoint; a tela só orienta a falar com a TI.
- Rotas com URL por view (`pushState`): é P3 do chrome, fica para a Fase 16.
- Reformular o `AdminDashboard` (Fase 15) ou o `Dashboard` (Fase 3).

## Decisions

1. **Corrigir a causa no backend, não só a exibição.** `Number(dados.total) === 0 || !Array.isArray(dados.registros) || dados.registros.length === 0` → 401. Alternativa considerada: só mascarar o 500 no front. Rejeitada: o cliente continuaria fazendo três chamadas e o log do servidor continuaria com uma exceção por e-mail errado.
2. **`catch` com mensagem fixa e log completo.** `erro.message` vai para `console.error`; a resposta é sempre "Não foi possível entrar agora. Tente de novo em instantes." Alternativa: mapear mensagens por tipo de exceção. Rejeitada: não há tipos úteis e o usuário não age sobre eles.
3. **Retry só em 5xx** em `services/auth.js` (`RETRYABLE_STATUS` já existe; garantir que 401/403 saem na primeira). Sem mudança de API.
4. **"Manter conectado" reaproveita o mecanismo do `App.jsx`.** `useLogin` deixa de ler/gravar `@Stitch:creds` e remove a chave no mount; `lembrar` continua sendo passado a `onLogin`, que grava `@Stitch:user` com `expiry`. Alternativa: token de refresh no backend. Rejeitada: fora de escopo e o IXC não oferece.
5. **Tokens via `useBentoTheme` + variáveis CSS, sem componente novo.** Login e NotFound usam `C.*` em estilos inline (padrão do chrome) e classes Tailwind só para layout. Inputs sobre `C.surface` com borda 1px `C.line` e anel de foco global. Botão `C.accent` com `C.onAccent`, sem gradiente e sem sombra em repouso (hover eleva com `--shadow-md`, como no NotFound). Alternativa: criar `ui/Button` e `ui/Input` compartilhados agora. Adiada: `extract` é tarefa 16.1, quando houver três ocorrências verificadas.
6. **Painel da marca em código.** `LoginIllustration` vira `LoginBrandPanel`: `Logo.webp` (o mesmo da Sidebar) sobre o gradiente do hero (`ui/heroGradiente.js`, constante `#C2410C` no meio nos cinco temas) com os anéis concêntricos do sistema; texto: "Prestek Telecom" e "Intranet" (sem tagline). Montado só quando `matchMedia('(min-width: 1024px)')` casa, para o celular não montar nada. O JSON `2997674.json` e o `lottie-react` saem se o 404 também deixar de usá-lo (decisão 7).
7. **404 em SVG com tokens.** Um SVG inline de "404" em `C.ink` com o zero como anel de sinal em `C.accent`, dentro do mesmo círculo `accentSoft` do cadeado (as duas variantes ficam irmãs). Remove o `import()` do Lottie e a dependência `lottie-react` do `package.json` se `grep` não achar outro uso.
8. **Título por estado no chrome.** `navigation.js` ganha `viewTitleFor(view, user)` que devolve "Acesso restrito" quando `!canAccess`, "Página não encontrada" quando a view não existe, e o rótulo normal nos demais; `Header` e `MobileBottomNav` (para não acender "Mais") e o `document.title` (`useEffect` no `App`) leem daí. O Login define `document.title = "Entrar · Prestek Intranet"` no mount.
9. **Servidor indisponível.** `useLogin` conta falhas consecutivas do health check; a partir de 2, expõe `servidorFora = true`; o `LoginForm` mostra a mensagem com `role="status"` e o botão "Tentar agora" chama a verificação imediatamente. O polling continua a cada 3 s.
10. **Mobile.** `p-6 md:p-10 lg:p-14`, `h1` `text-2xl md:text-3xl`, `min-h` só em `lg`; header do Login removido (não há mais links); rodapé em `ink2` 12px → 13px (`label`).

### Adaptações registradas no build (2026-09-10)

- Decisão 7: o "404" ficou solto no card, sem o círculo `accentSoft` do cadeado. Dentro do círculo de 96px o número ficava ilegível; o anel de sinal no lugar do zero já carrega o accent. As duas variantes continuam irmãs pelo card, pelo lockup e pelo botão.
- Borda dos campos em `muted` (3,0:1 no claro, 5,7:1 no escuro) em vez de `line` (1,2:1), para cumprir o 3:1 de componente da spec.
- `document.title` é definido no `App.jsx` para todas as views, incluindo o Login, em vez de no mount do Login; resultado idêntico à spec.
- O backend devolve `campo` ('email' | 'senha') nos 401, e o hook lê isso em vez de inspecionar o texto da mensagem.
- Lockup "Prestek • INTRANET" do NotFound mantém o tracking 0,18em do wordmark da Sidebar (é marca, não overline).

## Risks / Trade-offs

- [O IXC pode devolver `total` em outros formatos] → a checagem cobre número, texto e ausência de `registros`; teste manual com e-mail inexistente, senha errada e usuário válido antes do commit.
- [Quem tinha "Lembrar senha" perde o preenchimento automático] → uma vez; a mensagem de release avisa; o gerenciador de senha do navegador passa a funcionar com `autocomplete`.
- [Remover `lottie-react` pode quebrar outra tela] → só remover após `grep -rn lottie src` vazio; caso contrário, manter a dependência e só apagar os dois JSON.
- [Painel da marca sem imagem pode parecer vazio] → o gradiente e os anéis são a assinatura do sistema (heroes das páginas); verificar nos cinco temas na rodada de polish.
- [`viewTitleFor` muda o header em telas de erro] → cobre só `!canAccess` e view desconhecida; as views normais não mudam.

## Migration Plan

1. Backend primeiro (`/api/login`), testável isolado com `curl`.
2. `services/auth.js` e `useLogin.js` (retry, sessão, servidor fora).
3. `LoginForm` (acessibilidade, copy, tokens), `Login.jsx` (tema, layout, sem header), `LoginBrandPanel`.
4. `NotFound` (SVG), `navigation.js` + `Header` + `MobileBottomNav` + `App` (títulos).
5. Remover assets e dependência; `vite build`; verificação nos cinco temas e dois viewports; re-audit e re-crítica.
Rollback: `git revert` do commit da change; nenhuma migração de dados (a chave `@Stitch:creds` só é apagada).
