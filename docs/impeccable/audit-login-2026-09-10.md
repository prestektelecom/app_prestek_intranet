# Audit técnico — Login + NotFound (Fase 2 do programa Impeccable)

Data: 2026-09-10 · Alvos: `src/components/Login.jsx`, `Login/LoginForm.jsx`, `Login/LoginIllustration.jsx`, `Login/Icons.jsx`, `hooks/useLogin.js`, `services/auth.js`, `backend/server.js` (rota `/api/login`), `src/components/NotFound.jsx`.
Evidência: `impeccable detect --json` (Login: 9 advisory, exit 0; NotFound: limpo), overlay do detector injetado em 3 vistas do Login (Avaliação B da crítica do mesmo dia: 5 warnings), medições no navegador (Playwright, `localhost:5000`): Login sem sessão em 1440×900, 390×844, 390×540 (teclado aberto) e 720×600; NotFound nas duas variantes (`nao-encontrado` logado e deslogado, `sem-permissao`) em claro, Default Dark e AMOLED, desktop e 390. Contrastes calculados a partir de `getComputedStyle`. Capturas em `.playwright-mcp/critA-login-*.png`, `critB-login-*.png`, `audit-notfound-*.png`.

## Placar

| # | Dimensão | Nota | Achado-chave |
|---|---|---|---|
| 1 | Acessibilidade | 1 | Inputs sem `label` associada (`labels.length = 0`), sem `autocomplete`/`name`/`id`; "Lembrar senha" sem `input` (fora do Tab); olho da senha sem nome e 22×22; banner de erro sem `role="alert"`, foco cai no `body`; botão "Entrar" 2,8:1, placeholder 2,4:1, borda do input 1,1:1, rodapé 2,4:1, banner 4,4:1. NotFound: bom (h1, botão 44px, `onAccent` 6,2:1), mas a animação do 404 é preta pura e some no escuro |
| 2 | Performance | 1 | Chunk do Lottie com **14,16 MB** transferidos também no celular, onde a ilustração está em `display: none`; o SVG continua animando invisível e com `prefers-reduced-motion`; health check em polling de 3 s para sempre; `transition-all` em card, inputs e botão |
| 3 | Design responsivo | 2 | Sem rolagem horizontal em nenhum viewport; mas `p-14` (56px) fixo deixa o formulário com 229px em 390px; `min-height: 600px`; header com alvos de 20px; olho 22×22; com o teclado aberto (390×540) o botão "Entrar" começa em y=624, abaixo da dobra |
| 4 | Tema | 1 | Login: zero tokens, tudo hex fixo, raiz pinta o próprio gradiente; `html.dark` e `html.dark-amoled` renderizam a mesma tela clara (medido); bege `#FFF7ED` banido pelo DESIGN.md em três lugares; sombra laranja de 100px em repouso. NotFound: tokens `C.*` em tudo, verificado nos três temas, exceto o Lottie preto (`"k":[0,0,0,1]` em 67 formas) |
| 5 | Integridade da implementação | 1 | "Prestek Inc." (é Prestek Telecom), "Segurança garantida com SSO · SAML 2.0" (o backend compara SHA-256 contra o IXC; não há SSO), "Status" e "Docs" para views que não existem, "Problemas ao acessar?" em `href="#"`, "Suporte" para o site público, logo inventado (`PrestekMark`) em vez do `Logo.webp` que a Sidebar usa, blocos de código comentados ("99.99% uptime"). Detector: 9 advisories de fonte fora da rampa (9, 12, 15, 22px), 1 em código comentado |
| **Total** | | **6/20** | **Pobre (6–9)** |

## Veredito de integridade

**Reprovado.** O Login não expressa o sistema: não usa nenhum token, nenhuma variável CSS, nenhum componente compartilhado (`ui/HeroSearchInput`, `ChipButton`, `BentoCard`) nem o logo real, e afirma coisas que o produto não é ("Inc.", "SSO · SAML 2.0"). É a única tela do portal fora dos cinco temas. O NotFound, ao contrário, foi migrado para tokens na Fase 1 e passa nos três temas medidos; o único resíduo é a animação do 404 em preto fixo, herdada do asset. A rota `/api/login` tem um bug de tipo (`dados.total === 0` estrito contra um `"0"` em texto) que transforma o erro mais comum, e-mail inexistente, num crash exposto ao usuário com retry triplo no front.

## Sumário executivo

- Placar: **6/20** (Pobre)
- Issues: **1 P0 · 5 P1 · 4 P2 · 5 P3**
- Top 5: (1) exceção crua do servidor no e-mail inexistente; (2) formulário invisível para autofill e leitor de tela; (3) senha em claro no `localStorage`; (4) tema ignorado e contraste do botão, placeholder e borda; (5) 14 MB de Lottie no celular
- Próximos passos (decididos com o Felix em 2026-09-10): change `impeccable-login` com escopo completo; painel esquerdo vira painel da marca; "Manter conectado" só com sessão; "Fale com a TI para recuperar o acesso." sem link

## Achados por severidade

### P0

**[P0] E-mail inexistente devolve `Erro interno no servidor: Cannot read properties of undefined (reading '0')`**
- Local: `backend/server.js:143` (`dados.total === 0`), `:146` (`dados.registros[0]`), `:222-227` (`catch` devolve `erro.message`); `services/auth.js` (3 tentativas em 500, 600 ms cada); `LoginForm.jsx:57-64` (banner sem `role`).
- Categoria: Integridade / Acessibilidade.
- Impacto: o erro mais comum de um colaborador novo aparece como crash, demora 2,4 s, e depois o foco cai no `body` sem anúncio.
- Recomendação: `Number(dados.total) === 0 || !dados.registros?.length` → 401 "Usuário não encontrado."; `catch` com texto fixo e log; no front, `role="alert"` no banner, `aria-invalid` + `aria-describedby` no campo, `focus()` no campo de senha após erro, texto do banner em `vermelho-alerta-texto` (4,4 → 6:1).
- Comando: `/impeccable harden`

### P1

**[P1] Formulário sem nome, sem autofill, checkbox fora do teclado**
- Local: `LoginForm.jsx:8` (`label` sem `htmlFor`), `:20-29` (inputs sem `id`/`name`/`autocomplete`, e-mail `type="text"`), `:84-90` (olho sem `aria-label`, 22×22), `:95-113` (`span` no lugar de `input[type=checkbox]`).
- Categoria: Acessibilidade. WCAG 1.3.1, 1.3.5, 2.1.1, 4.1.2.
- Recomendação: `type="email" id name="username" autocomplete="username" inputMode="email"`; `type="password" id name="password" autocomplete="current-password"`; `htmlFor`; checkbox real em `sr-only` com o quadrado como irmão; `aria-label="Mostrar senha"` + `aria-pressed`, alvo 44×44; `autoFocus` no e-mail.
- Comando: `/impeccable harden`

**[P1] "Lembrar senha" grava e-mail e senha em claro por 7 dias**
- Local: `useLogin.js:4-19, 84-89` (`@Stitch:creds`).
- Categoria: Integridade / Prevenção de erros.
- Recomendação: "Manter conectado" persistindo só a sessão que `App.jsx:138-145` já expira em 7 dias; remover `@Stitch:creds` no próximo load; nunca gravar senha.
- Comando: `/impeccable harden`

**[P1] Tema ignorado e contraste reprovado**
- Local: `Login.jsx:10, 22-23, 59, 67` (gradientes e blobs em hex), `LoginForm.jsx` (todos os hex), `LoginIllustration.jsx`.
- Categoria: Tema / Acessibilidade. WCAG 1.4.3, 1.4.11.
- Medido: escuro = claro (pixel a pixel); botão "Entrar" branco sobre `#EC7D23` 2,79:1 no topo do gradiente, 3,79:1 no meio; placeholder `#9AA5B4` sobre `#F7FAFD` 2,38:1; borda `#E4ECF5` sobre `#F7FAFD` 1,14:1; checkbox 2,50:1; rodapé 2,36:1; "PORTAL INTERNO" 9px 2,36:1.
- Recomendação: `C.*` de `useBentoTheme` em tudo; fundo `C.bg`; card `C.surface` com borda `C.line`; botão `C.accent` + `C.onAccent` (6,2:1) sem sombra em repouso; placeholder e ícones em `C.ink2`; input sobre `surface` branca com borda `line` (1px) e anel de foco `--accent`.
- Comando: `/impeccable colorize`

**[P1] Copy e navegação fabricadas**
- Local: `LoginForm.jsx:50` ("Prestek Inc."), `:114-116` (`href="#"`), `:155` ("SSO · SAML 2.0"); `Login.jsx:33-52` (Status, Docs, Suporte), `:75` (rodapé "Inc."); `LoginIllustration.jsx:76` ("painel 3D"), `:93-98` (tagline).
- Categoria: Integridade.
- Recomendação: "Entrar na Intranet"; "Prestek Telecom"; "Use o mesmo usuário e senha do IXC"; remover Status/Docs/Suporte; "Fale com a TI para recuperar o acesso." como texto; unificar label/placeholder/erro em "E-mail do IXC".
- Comando: `/impeccable clarify`

**[P1] Animação do 404 preta sobre o card escuro**
- Local: `NotFound.jsx:36` (`lottieflow-404-12-4-000000-easey.json`, 72 KB, 67 formas com `"k":[0,0,0,1]`), `:80`.
- Categoria: Tema. Medido: `fill` e `stroke` `rgb(0,0,0)` em todos os `path`, sobre `#111C2C` (1,2:1) e `#0A0A0A`.
- Recomendação: SVG próprio com `C.ink`/`C.accent` (o cadeado da variante sem-permissão já é assim), ou recolorir o Lottie via `lottie-react` (`rendererSettings` / filtro CSS `invert` no escuro). Não importar o JSON na variante sem-permissão (`:35-39` roda sempre).
- Comando: `/impeccable colorize`

### P2

**[P2] Lottie de 14 MB baixado e animado onde ninguém vê**: `Login.jsx:62` (`hidden lg:block` mantém o componente montado), `LoginIllustration.jsx:27` (`import()` sempre), `:81-85` (anima em `display: none` e com `prefers-reduced-motion`). Decisão: o painel vira estático com o `Logo.webp` e os anéis de sinal (`ui/heroGradiente.js`); o JSON sai do bundle. `/impeccable optimize`

**[P2] Chrome contradiz a página nos estados de erro**: sem permissão, `Header.jsx:15` mostra "Painel Admin" e `MobileBottomNav.jsx:24` acende "Mais" (medido: rótulo em `ink`); view inexistente deixa o header vazio. Recomendação: `viewTitle` recebe o que foi renderizado ("Acesso restrito", "Página não encontrada"); "Mais" não acende quando `!canAccess`. `/impeccable clarify`

**[P2] Botão abaixo da dobra com o teclado aberto**: a 390×540 o "Entrar" começa em y=624 (`LoginForm.jsx:48` `p-14` + `min-h-[600px]`, `h1` de 30px em duas linhas). Recomendação: `p-6 md:p-10 lg:p-14`, `text-2xl` abaixo de `md`, sem `min-height` no celular, header removido abaixo de `lg`. `/impeccable adapt`

**[P2] "Aguardando servidor..." sem explicação nem saída**: `LoginForm.jsx:128-135`, `useLogin.js:34-60`. Recomendação: depois de 2 falhas, texto "A intranet está fora do ar. Tente de novo em instantes ou avise a TI." com botão "Tentar agora"; inputs desabilitados enquanto o backend não responde. `/impeccable clarify`

### P3

- **[P3] `<title>` "Prestek Intranet Dashboard" em todas as views** (`index.html:7`): "Entrar · Prestek Intranet" no Login, título da view nas demais (o `viewTitle` já existe). `/impeccable clarify`
- **[P3] `transition-all` no botão anima o `outline-color`** (`LoginForm.jsx:122`): anel de foco entra em fade. `transition-[background,transform]`. `/impeccable polish`
- **[P3] Tamanhos fora da rampa** (detector: 9px, 12px, 15px, 22px; mais 13,5 e 14,5 não pegos). `/impeccable typeset`
- **[P3] Raios fora da escala** (`rounded-tl-[80px]`, `rounded-[5px]`), `cursor-wait`, dois `<pattern id>` globais, blocos comentados em `LoginIllustration.jsx:57-62, 100-115`. `/impeccable polish`
- **[P3] `favicon.ico` 404** em toda carga.

## Padrões sistêmicos

1. **Tela fora do sistema de tokens**: o Login é a primeira ocorrência de uma superfície inteira em hex fixo. Verificar nas próximas fases se `Configuracoes`, modais e o Painel Admin repetem o padrão (o audit do chrome já notou 25 botões em gradiente com `#9A3412` fixo).
2. **Copy que promete o que o produto não tem**: "SSO · SAML 2.0", "painel 3D", "Docs", "Status", "Suporte". Adicionar ao Transversal: "toda alegação na UI precisa de um caminho de código que a sustente".
3. **Asset com cor fixa** (Lottie do 404 em preto, Lottie do Login em paleta própria): assets animados não leem tema. Regra candidata para o DESIGN.md: ilustração só em SVG com `currentColor`/tokens, ou Lottie com recoloração por tema.
4. **Erro do backend exposto ao usuário** (`erro.message` no `catch`): conferir as outras rotas de `server.js` que fazem o mesmo (a Fase 3 já apontou `/api/os-chamados/<id>` em 500).

## Pontos positivos

- **NotFound passou na Fase 1**: tokens em tudo, cadeado em `accentSoft`/`accentDark`, botão de 44px em `accent` + `onAccent` (6,2:1 claro, 7,1:1 AMOLED), copy honesta nas duas variantes, `aria-hidden` nas decorações, primeiro Tab no botão de voltar, "Voltar para o login" funciona deslogado.
- **Estrutura do formulário do Login**: labels acima, ícone que acende no foco, botão de 52px com "Entrando..." e inputs desabilitados durante o submit; anel de foco global funciona.
- **Health check antes do submit** (`useLogin.js:34-60`) e **Lottie em `import()` dinâmico com skeleton**: o formulário nunca espera pelo asset.
- **Sem rolagem horizontal** em nenhum viewport, inclusive 720×600 (zoom 200%).
- **Hierarquia tipográfica correta**: Manrope no `h1`, Plus Jakarta no corpo.

## Backlog consolidado para a change `impeccable-login` (tarefa 2.3)

Decisões do Felix (2026-09-10): escopo completo; painel da marca no lugar do Lottie; "Manter conectado" só com sessão; "Fale com a TI para recuperar o acesso." sem link.

1. **Backend e erro** (P0): `Number(dados.total)`, `registros?.length`, `catch` sem `erro.message`; conferir se o front deve parar de fazer retry em 401/403 (só 5xx); banner `role="alert"`, `aria-invalid`, foco no campo.
2. **Formulário acessível** (P1): `type="email"`, `id`/`name`/`autocomplete`/`htmlFor`, `autoFocus`, checkbox real, olho com nome e 44px, validação de formato de e-mail antes do submit.
3. **Sessão** (P1): remover `@Stitch:creds` e a leitura de credenciais salvas; "Manter conectado" passa `lembrar` ao `onLogin` como hoje; limpar a chave antiga no primeiro load.
4. **Tema e contraste** (P1): tokens em tudo, fundo `C.bg`, card `C.surface`, botão `accent`/`onAccent`, inputs sobre `surface` com borda `line` e anel de foco do sistema, placeholder `ink2`, sem bege, sem sombra em repouso; verificar nos cinco temas.
5. **Copy** (P1): "Entrar na Intranet", "Prestek Telecom", "Use o mesmo usuário e senha do IXC", "E-mail do IXC", "Fale com a TI para recuperar o acesso.", remover Status/Docs/Suporte/"painel 3D"/tagline, `<title>` por view.
6. **Painel da marca** (P2): `LoginIllustration` vira painel estático com `Logo.webp`, gradiente do hero e anéis de sinal; apagar `src/image/icons/2997674.json` (14 MB) e os blocos comentados.
7. **NotFound no escuro** (P1): substituir o Lottie do 404 por SVG com tokens; não importar o JSON na variante sem-permissão; `viewTitle` do header e "Mais" da barra coerentes com o estado de erro.
8. **Mobile** (P2): `p-6 md:p-10 lg:p-14`, `h1` menor abaixo de `md`, sem `min-height` no celular; "Aguardando servidor..." com texto e ação após 2 falhas.
9. **Polish** (P3): `transition` específica, raios da escala, tamanhos na rampa, `favicon.ico`.

Re-rodar `/impeccable audit` e `/impeccable critique` no fim da change para registrar a tendência (6/20 → alvo 15+; 16/40 → alvo 28+).

## Re-audit (mesmo dia, após a change `impeccable-login`)

Evidência: `impeccable detect --json` limpo (0 findings, era 9) nos 8 arquivos tocados; duas críticas dual-agent com navegador (16/40 logo após a 1ª leva de correções, 31/40 após a 2ª, que fechou os dois P1 restantes — anel de foco ausente nos campos de texto e contraste do erro no Cyber-Obsidian); `npx vite build` limpo, sem o chunk de 2,6 MB do Lottie; medido no navegador: `.login-field:focus-within` com borda e anel em `accent`, logo de 32px visível no celular abaixo de `lg`, "Tentar agora" com estado `aria-busy`.

| # | Dimensão | Nota | Antes |
|---|---|---|---|
| 1 | Acessibilidade | 3 | 1 |
| 2 | Performance | 3 | 1 |
| 3 | Design responsivo | 3 | 2 |
| 4 | Tema | 3 | 1 |
| 5 | Integridade da implementação | 3 | 1 |
| **Total** | | **15/20** | **6/20** |

Portão do audit passado (≥ 15). Trend da crítica: 16 → 31/40 (`.impeccable/critique/`, slug `src-components-login-jsx`). Restam só P3 de polimento, registrados na seção Transversal do programa (`programa-impeccable/tasks.md`).
