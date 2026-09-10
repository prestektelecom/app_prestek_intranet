## 0. Backlog consolidado (origem)

Crítica 16/40 (`.impeccable/critique/2026-09-10T22-34-37Z__src-components-login-jsx.md`) e audit 6/20 (`docs/impeccable/audit-login-2026-09-10.md`, seção "Backlog consolidado"). Decisões do Felix (2026-09-10): escopo completo; painel da marca no lugar do Lottie; "Manter conectado" só com sessão; "Fale com a TI para recuperar o acesso." sem link.

## 1. Backend e política de erro (P0) — `harden`

- [x] 1.1 `backend/server.js` `/api/login`: `Number(dados.total)` e `registros?.length` → 401 "Usuário não encontrado." (com `campo: 'email'`); 401 "Senha incorreta." com `campo: 'senha'`; 403 "Usuário inativo. Fale com a TI."; `catch` responde 500 com texto fixo e loga o erro completo
- [x] 1.2 `src/services/auth.js`: retry só em 5xx; 4xx volta na primeira com `status` e `campo`; mensagem genérica sem número de status; `HOST` morto removido
- [x] 1.3 Testado com `curl`: e-mail inexistente → 401 em 0,4 s; campos vazios → 400; `/api/health` 200

## 2. Sessão e servidor indisponível (P1) — `harden`

- [x] 2.1 `useLogin.js`: sem leitura/gravação de `@Stitch:creds`; chave apagada no mount (verificado: `localStorage['@Stitch:creds'] === null` após a carga); `lembrar` continua indo para `onLogin`
- [x] 2.2 `useLogin.js`: uma checagem por vez (`emAndamento`), contador de falhas consecutivas zerado no cleanup, `servidorFora` a partir de 2, `tentarAgora()`
- [x] 2.3 `LoginForm.jsx`: aviso "A intranet está fora do ar..." com `role="status"` e botão "Tentar agora"; campos editáveis; "Aguardando servidor..." só no botão

## 3. Formulário acessível e copy (P1) — `harden` + `clarify`

- [x] 3.1 `Field`: `id`, `name` (prop), `type`, `autoComplete`, `inputMode`, `label htmlFor`, `aria-invalid`, `aria-describedby`; e-mail com `autoFocus` (verificado: `labels.length = 1`, `autocomplete=username/current-password`)
- [x] 3.2 Botão do olho: "Mostrar senha"/"Ocultar senha", `aria-pressed`, 44×44
- [x] 3.3 "Manter conectado": `input[type=checkbox]` em `sr-only` com o quadrado como irmão; Tab chega, Espaço alterna (verificado)
- [x] 3.4 Validação antes do submit: vazio e formato ("Informe um e-mail válido.", verificado sem chamada ao servidor)
- [x] 3.5 Banner `role="alert"` + `aria-live`; foco no campo apontado por `campo` do backend, com `erroSeq` para refocar em erro repetido; senha limpa em "Senha incorreta."
- [x] 3.6 Copy: "Entrar na Intranet", "Use o mesmo usuário e senha do IXC.", "E-mail do IXC", "Fale com a TI para recuperar o acesso.", "Prestek Telecom"; header, "SSO · SAML 2.0", "painel 3D", tagline e blocos comentados removidos (verificado: nenhum texto proibido no `body`)
- [x] 3.7 Título da aba "Entrar · Prestek Intranet" (definido no `App.jsx` para todas as views)

## 4. Tema, contraste e layout (P1/P2) — `colorize` + `adapt`

- [x] 4.1 `Login.jsx`: fundo `C.bg`, sem bege e sem blobs; card `C.surface` com borda `C.line`, raio 24, `--shadow-sm`
- [x] 4.2 `LoginForm.jsx`: tudo em `C.*`; inputs sobre `surface` com borda `muted` (3,0:1); placeholder `ink2` via `.login-input::placeholder`; botão `accent` + `onAccent` (6,2:1) plano, hover `--shadow-md`; `transition` só de sombra e transform; `not-allowed` em disabled
- [x] 4.3 Rampa e raios: botão 14px, rodapé 13px, checkbox raio 8, card 24; sem `rounded-tl-[80px]`
- [x] 4.4 Mobile: `p-6 md:p-10 lg:p-14`, `h1` 24px abaixo de `md`, `min-h` só em `lg`; verificado a 390×540 (botão inteiro na área visível)
- [x] 4.5 Contrastes medidos no navegador: botão 6,22:1, borda 3,01:1, rodapé 7,28:1; Default Dark e AMOLED com fundo, card e botão do tema

## 5. Painel da marca (P2) — `optimize` + `distill`

- [x] 5.1 `Login/LoginBrandPanel.jsx`: `Logo.webp` sobre o gradiente do hero com anéis de sinal, "Intranet"; sem animação e sem tagline; montado só com `matchMedia('(min-width: 1024px)')`
- [x] 5.2 Removidos `LoginIllustration.jsx`, `src/image/icons/2997674.json` (14 MB) e o `PrestekMark`; ícones em `currentColor`
- [x] 5.3 Verificado no celular: painel não montado, nenhum asset de ilustração transferido; build sem o chunk de 2,6 MB

## 6. NotFound e chrome nos estados de erro (P1/P2) — `colorize` + `clarify`

- [x] 6.1 `NotFound.jsx`: SVG "404" com o zero em anéis de sinal (`ink`/`accent`) no lugar do Lottie; `lottieflow-404-*.json` removido; card com `--shadow-sm` (Flat At Rest); foco no `h1` sem anel
- [x] 6.2 `navigation.js`: `viewExists`, `viewTitleFor` ("Acesso restrito" / "Página não encontrada") e `viewEmErro`
- [x] 6.3 `Header.jsx` usa `viewTitleFor`; `MobileBottomNav.jsx` não acende "Mais" em estado de erro; `App.jsx` atualiza `document.title` (verificado: "Acesso restrito · Prestek Intranet", "Página não encontrada · Prestek Intranet")
- [x] 6.4 `lottie-react` removido e `lottie-web@^5.13` declarado (`LottieAvatar` o importava só como dependência transitiva); favicon PNG 64px gerado do `Logo_P.webp` (WebP não renderiza no Safari)

## 7. Verificação e portão

- [x] 7.1 `npx vite build` limpo (11 s; o chunk de 2,6 MB do Lottie sumiu)
- [x] 7.2 Navegador (2026-09-10): Login claro/Default Dark/AMOLED × 1440, claro × 390 e 390×540; fluxo de erro (formato inválido, e-mail inexistente com foco no campo); Tab e Espaço no checkbox; sem textos proibidos; NotFound sem-permissão (390) e view inexistente (Default Dark) com header, título da aba, barra e SVG coerentes
- [x] 7.3 Agente `impeccable-finish-reviewer` sobre o diff: disposição "fix", 4 bloqueios e 9 melhorias, todos aplicados (tagline removida; sombra do NotFound; 403 sem campo; health check sem sobreposição; `campo` do backend; `erroSeq`; 14px; raio 8; `outline: none` no h1; `lottie-web`; `HOST`; favicon PNG; adaptações registradas no design.md)
- [x] 7.4 `/impeccable audit` de novo: **6 → 15/20** (portão passado). `/impeccable critique src/components/Login.jsx`: 1ª rodada de correções 16 → 24 P0/P1 restantes, 2ª rodada (foco nos campos, contraste Cyber) → **31/40** (alvo ≥ 28 superado, 0 P0/P1). Detalhes em `docs/impeccable/audit-login-2026-09-10.md` (seção "Re-audit") e nos dois snapshots em `.impeccable/critique/`
- [x] 7.5 Anotado na seção Transversal do programa: tela fora do sistema de tokens, copy que promete o que não existe, asset com cor fixa, `erro.message` exposto ao cliente
- [x] 7.6 Commit e marcar 2.4 a 2.6 em `programa-impeccable/tasks.md`
